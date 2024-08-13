# 将事件检索与事件处理解耦

## 0 前言

part1讨论了集成过程中遇到的挑战以及幂等事件处理的作用。解决集成问题之后，我们需要反思事件检索的问题。我们的经验教训表明，将事件检索与事件处理解耦至关重要。

## 1 事件处理与请求/响应 API 紧耦合

part1讨论了将请求/响应 API 集成到事件驱动微服务中时，由于基于请求/响应的通信，导致紧耦合。单个事件的处理速度取决于请求/响应 API 及其响应时间，因为事件处理会阻塞直到收到响应。

像我们在part1中使用的简单事件循环实现或 [AWS SQS Java Messaging Library](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-jms-code-examples.html#example-synchronous-message-receiver) 中的工作示例，会顺序处理事件。

不推荐这种方法，因为整体处理时间是所有单个处理时间的总和。

## 2 并发处理事件

幸运的是，像 [Spring Cloud AWS](https://awspring.io/) 这种库提供支持并发处理事件的更高效实现。属性 [ALWAYS_POLL_MAX_MESSAGES](https://docs.awspring.io/spring-cloud-aws/docs/3.0.2/reference/html/index.html#message-processing-throughput) 的行为在下图概述：并发事件处理

![](https://www.thoughtworks.com/content/dam/thoughtworks/images/photography/inline-image/insights/blog/apis/blg_inline_Konrad_MS_Part_Two_Figure_1.jpg)

检索到一批事件后，每个事件在一个单独的线程中并发处理。当所有线程完成处理后，将检索下一批事件。由于基于请求/响应的通信导致的紧耦合，可能使事件处理速度不同。较快的线程会在较慢的线程处理事件时处于等待状态。因此，一批事件的处理时间对应于处理最慢的事件的时间。

当事件顺序不重要时，并发处理可以是一个合理的默认设置。但根据经验，某些情况下，事件处理可进一步优化。当单个事件的处理时间差异较大时，线程可能长时间处于等待状态。

如集成了一个性能波动较大的请求/响应 API。平均而言，该 API 在 0.5s 后响应。但第 95 百分位和第 99 百分位值经常分别为 1.5s 和超过 10s。在这种并发事件处理方式中，由于响应缓慢的 API，线程经常会等待几s，然后才能处理新事件。

## 3 将事件检索与事件处理解耦

即可进一步优化事件处理。这样，处理时间较长的单个事件不会减慢其他事件的处理速度。Spring Cloud AWS 提供了 [FIXED_HIGH_THROUGHPUT](https://docs.awspring.io/spring-cloud-aws/docs/3.0.2/reference/html/index.html#message-processing-throughput) 属性，展示了这种解耦可能的实现方式。

具体描述如下。详细信息可在[文档](https://docs.awspring.io/spring-cloud-aws/docs/3.0.2/reference/html/index.html#message-processing-throughput)中找到。

解耦的事件处理策略：

![](https://www.thoughtworks.com/content/dam/thoughtworks/images/photography/inline-image/insights/blog/apis/blg_inline_Konrad_MS_Part_Two_Figure_2.jpg)

为此，定义一个额外属性，用于在两次事件检索之间的最大等待时间。当所有事件已处理完毕或等待时间已过期时，将检索新事件。若在等待时间过期后，如一个事件仍未处理完毕，则会提前接收九个新事件，并可以开始处理。这意味着这九个线程不会等到最后一个事件处理完毕后才开始工作。

根据经验，如果等待时间和其他参数配置得当，解耦可提高单个线程的利用率。一个可能缺点，由于事件往往以更频繁但较小批次的方式被检索，因此可能增加成本。因此，了解 API 性能特征，对于在并发和解耦事件处理之间做出选择至关重要。

## 4 结论

当你将事件驱动微服务与请求/响应 API 集成时，会引入紧耦合。请求/响应 API 的性能特征很重要，因为它们有助于你在并发和解耦事件处理之间做出选择。

本文重点讨论了请求/响应 API 的请求时间性能及其如何影响事件驱动微服务的性能。