# 使用断路器暂停事件检索



## 0 前言

part2讨论将事件检索与事件处理解耦的好处。现在，将讨论如何使用断路器来应对请求/响应API不可用的情况。

## 1 经验：使用断路器暂停事件检索

请求/响应通信带来的紧耦合要求两个微服务都须可用，这与事件驱动的通信不同，因为在下游微服务暂时不可用时，无中间件可介入。

事件循环与请求/响应通信的结合可能加剧下游微服务可用性问题。若下游微服务存在可用性问题，事件循环发起的重试会增加其压力。若下游微服务不接受新连接，请求会快速失败，导致事件处理速度加快。这是个问题，因为下游微服务承受的压力增加，事件无法成功处理。为解决这种case，我们应用[断路器](https://martinfowler.com/bliki/CircuitBreaker.html)。

## 2 断路器

一种源于请求/响应通信的弹性模式，能防止下游服务出现问题时因重试引发的连锁反应。断路器作为现成的组件存在——如[resilience4j](https://resilience4j.readme.io/docs)，可与请求/响应API的HTTP客户端一起配置和使用。

### 3.1 断路器状态机



![图一](https://www.thoughtworks.com/content/dam/thoughtworks/images/photography/inline-image/insights/blog/apis/blg_inline_Konrad_MS_Part_Three_Figure_1.jpg)

断路器是一个可以在三种状态之间切换的组件：CLOSED（关闭）、OPEN（打开）和HALF-OPEN（半开），如图。

- CLOSED状态下，断路器允许所有请求通过API。如果错误超过阈值，断路器会切换到OPEN状态，此时请求不再通过，断路器会返回一个错误，例如NotPermitted异常
- 经过一段等待时间后，断路器会转换为HALF-OPEN状态，此时请求再次通过API
- 如果请求成功，断路器会回到CLOSED状态。如果请求失败，断路器会重新回到OPEN状态

### 3.2 断路器集成到事件驱动的微服务中



![图二](https://www.thoughtworks.com/content/dam/thoughtworks/images/photography/inline-image/insights/blog/apis/blg_inline_Konrad_MS_Part_Three_Figure_2.jpg)

断路器也可集成到事件驱动的微服务中。上图展示断路器在事件处理与请求/响应API之间的集成。此外，我们还发现了两个需要特别考虑的因素。下图中得以说明：断路器集成到事件驱动的微服务中

![图三](https://www.thoughtworks.com/content/dam/thoughtworks/images/photography/inline-image/insights/blog/apis/blg_inline_Konrad_MS_Part_Three_Figure_3.jpg)

首先，如果集成到事件驱动微服务中的断路器处于OPEN状态，对API的请求会快速失败，因为断路器会返回NotPermitted异常。由于断路器不转发请求，因此不会给API带来压力。然而，这种情况效率不高，因为事件处理仍然失败，事件会被重试，最终可能会进入[死信队列](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html)。

为了解决这一限制，我们发现当断路器转换为OPEN状态时暂停新事件的检索效果很好。现成的断路器提供了[事件监听器](https://resilience4j.readme.io/docs/circuitbreaker#consume-emitted-circuitbreakerevents)，它们会通知我们状态的转换。在图三中，这通过“3.1 通知状态转换”和“3.2 暂停事件检索”得以说明，只有在断路器转换为OPEN状态时才会发送“暂停事件检索”消息。

其次，在等待期后，断路器应该转换为HALF-OPEN状态，以便请求再次通过API。对于基于请求/响应的通信，带有断路器的微服务会接收到请求。为了满足这个请求，微服务本身会尝试通过断路器向API发送请求。如果等待期已经结束，断路器会使用这个请求作为触发器转换为HALF-OPEN状态，并允许请求通过。对于事件驱动的通信，当新事件的检索被暂停时，外部触发器并不存在。这时需要一个调度动作来[触发](https://resilience4j.readme.io/docs/examples#transition-to-states-manually)向HALF-OPEN状态的转换，并恢复新事件的检索。否则，断路器将保持OPEN状态。在图三中，这通过“3.3 调度转换”消息进行了说明，如果断路器已转换为OPEN状态，则会设置一个调度动作，待等待时间结束后转换为HALF-OPEN状态（消息“3.4 转换为HALF-OPEN”）。之后，事件监听器会被通知状态转换（消息“3.1 通知状态转换”），并因为断路器已转换为HALF-OPEN状态，恢复事件检索（消息“3.5 恢复事件检索”）。

我们还可以进一步微调断路器。事件的[可见性超时](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html)应该比断路器转换为HALF-OPEN的等待时间更长。否则，在转换后相同的事件会被一次又一次地检索，如果API长时间不可用，它们将最终进入死信队列。

我们还发现，集成到事件处理中的断路器能够处理长时间的不可用情况。这意味着你可以调整[maxReceiveCount](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html)，即在事件被移至死信队列之前，事件处理失败的次数，以及因请求失败而失败的事件的可见性超时。例如，考虑一个maxReceiveCount为三次、可见性超时为30秒的情况。请求/响应API可以在一分钟内不可用。在这一分钟之后，事件将第三次被检索。如果它们再次处理失败，它们将被移至死信队列。

## 3 结论

当你将事件驱动的微服务与请求/响应API集成时，事件处理依赖于API的可用性。本文探讨了如何集成断路器，并结合事件驱动微服务的具体情况进行配置。