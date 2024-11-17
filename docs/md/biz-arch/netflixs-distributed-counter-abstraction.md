# 一文看懂Netflix分布式计数器设计！

Netflix’s Distributed Counter Abstraction

# 0 引言

之前博客文章介绍了[Netflix的时间序列抽象](https://netflixtechblog.com/introducing-netflix-timeseries-data-abstraction-layer-31552f6326f8)，这是一个设计用来存储和查询大量时间事件数据的分布式服务，具有低毫 秒级别的延迟。今天，我们很高兴向大家介绍**分布式计数器抽象**。这个计数服务建立在时间序列抽象之上，能够在保持类似的低延迟性能的同时，实现大规模的分布式计数。和我们所有的抽象一样，我们使用我们的[数据网关控制平面](https://netflixtechblog.medium.com/data-gateway-a-platform-for-growing-and-protecting-the-data-tier-f1ed8db8f5c6)来分片、配置和全球部署这项服务。

分布式计数是计算机科学中的一个挑战性问题。在这篇博客文章中，我们将探讨Netflix在计数需求上的多样性，实现近乎实时准确计数的挑战，以及我们选择的方法背后的理念，包括必要的权衡。

**注意**：*在谈到分布式计数器时，像“准确”或“精确”这样的术语应该谨慎理解。在这个上下文中，它们指的是非常接近准确，并且以最小的延迟呈现的计数。*

# 用例和需求

在Netflix，我们的计数用例包括跟踪数百万用户交互、监控特定功能或体验向用户展示的频率，以及在[A/B测试实验](https://netflixtechblog.com/its-all-a-bout-testing-the-netflix-experimentation-platform-4e1ca458c15)中统计数据的多个方面等。

在Netflix，这些用例可以分为两大类别：

1. **尽力而为**：对于这一类别的计数，不需要非常准确或持久。然而，这一类别需要以低延迟近实时地访问当前计数，同时将基础设施成本保持在最低。
2. **最终一致性**：这一类别需要准确和持久的计数，并愿意接受准确性的轻微延迟和稍高的基础设施成本作为权衡。

这两类用例都有共同的需求，如高吞吐量和高可用性。下表提供了这两类用例不同需求的详细概述。

![img](https://miro.medium.com/v2/resize:fit:875/1*ZjxKcMckMLrT_JqPUzP4MQ.png) 

# 分布式计数器抽象

为了满足上述需求，计数器抽象被设计为高度可配置。它允许用户在**尽力而为**或**最终一致性**等不同的计数模式之间选择，同时考虑每种选项的文档化权衡。在选择模式后，用户可以与API交互，而无需担心底层的存储机制和计数方法。

让我们更仔细地看看API的结构和功能。

# API

计数器被组织到用户为他们特定用例设置的单独命名空间中。每个命名空间都可以使用服务的控制平面配置不同的参数，如计数器类型、生存时间（TTL）和计数器基数。

计数器抽象API类似于Java的[AtomicInteger](https://docs.oracle.com/en/java/javase/22/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html)接口：

**AddCount/AddAndGetCount**：通过给定的增量值调整指定计数器在数据集中的计数。增量值可以是正数或负数。*AddAndGetCount*对应方法在执行添加操作后还返回计数。

```
{
  "namespace": "my_dataset",
  "counter_name": "counter123",
  "delta": 2,
  "idempotency_token": { 
    "token": "some_event_id",
    "generation_time": "2024-10-05T14:48:00Z"
  }
}
```

如果支持，幂等令牌可以用于计数器类型。客户端可以使用此令牌安全地重试或[对冲](https://research.google/pubs/the-tail-at-scale/)他们的请求。分布式系统中的失败是必然的，能够安全地重试请求增强了服务的可靠性。

**GetCount**：检索指定计数器在数据集中的计数值。

```
{
  "namespace": "my_dataset",
  "counter_name": "counter123"
}
```

**ClearCount**：将指定计数器在数据集中的计数有效地重置为0。

```
{
  "namespace": "my_dataset",
  "counter_name": "counter456",
  "idempotency_token": {...}
}
```

现在，让我们看看抽象中支持的不同类型计数器。

# 计数器类型

该服务主要支持两种类型的计数器：**尽力而为**和**最终一致性**，以及第三种实验类型：**准确**。在接下来的部分中，我们将描述这些类型的计数器的不同方法以及每种方法相关的权衡。

# 尽力而为区域计数器

这种类型的计数器由[EVCache](https://netflixtechblog.com/announcing-evcache-distributed-in-memory-datastore-for-cloud-c26a698c27f7)提供支持，EVCache是Netflix基于广泛流行的[Memcached](https://memcached.org/)构建的分布式缓存解决方案。它适用于A/B实验等用例，其中许多并发实验在短时间内运行，并且足够近似的计数就足够了。抛开配置、资源分配和控制平面管理的复杂性不谈，这个解决方案的核心非常简单：

```
// 计数器缓存键
counterCacheKey = <namespace>:<counter_name>

// 添加操作
return delta > 0
    ? cache.incr(counterCacheKey, delta, TTL)
    : cache.decr(counterCacheKey, Math.abs(delta), TTL);

// 获取操作
cache.get(counterCacheKey);

// 从所有副本中清除计数
cache.delete(counterCacheKey, ReplicaPolicy.ALL);
```

EVCache在单个区域内提供极低毫秒延迟或更好的极高吞吐量，支持共享集群中的多租户设置，节省基础设施成本。然而，有一些权衡：它缺乏跨区域复制*增加*操作的能力，并且不提供[一致性保证](https://netflix.github.io/EVCache/features/#consistency)，这可能对准确计数是必要的。此外，不支持原生幂等性，使得重试或对冲请求不安全。

***编辑*：关于概率数据结构的注释：

像[HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)（HLL）这样的概率数据结构对于跟踪不同元素的近似数量（如网站的不同视图或访问次数）很有用，但并不适合于实现给定键的独立增加和减少。[Count-Min Sketch](https://en.wikipedia.org/wiki/Count–min_sketch)（CMS）是另一种选择，可以用来通过给定的数量调整键的值。像[Redis](https://redis.io/)这样的数据存储支持[HLL](https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/)和[CMS](https://redis.io/docs/latest/develop/data-types/probabilistic/count-min-sketch/)。然而，我们选择不采取这个方向有几个原因：

- 我们选择在我们已经大规模运营的数据存储之上构建。
- 概率数据结构不支持我们的一些需求，如重置给定键的计数或为计数设置TTL。需要额外的数据结构，包括更多的草图，以支持这些需求。
- 另一方面，EVCache解决方案非常简单，只需要最少的代码行，并使用原生支持的元素。然而，这是以使用每个计数器键的少量内存为代价的。

# 最终一致性全球计数器

虽然一些用户可能接受尽力而为计数器的限制，但其他用户选择精确计数、持久性和全球可用性。在接下来的部分中，我们将探索实现持久和准确计数的各种策略。我们的目标是突出全球分布式计数固有的挑战，并解释我们选择的方法背后的原因。

**方法1：每个计数器存储一行**

让我们从使用全球复制数据存储中的表中每个计数器键存储一行开始。

![img](https://miro.medium.com/v2/resize:fit:875/0*X6k4-4N36IQ5yEPe) 

让我们检查这种方法的一些缺点：

- **缺乏幂等性**：存储数据模型中没有内置的幂等键，阻止用户安全地重试请求。实现幂等性可能需要使用外部系统来存储这些键，这可能会进一步降低性能或引起竞态条件。
- **高争用**：为了可靠地更新计数，每个写入者必须对给定的计数器执行Compare-And-Swap操作，使用锁或事务。根据操作的吞吐量和并发性，这可能导致显著的争用，严重影响性能。

**辅助键**：减少这种方法中的争用的一种方式是使用辅助键，如*bucket_id*，它允许通过将给定的计数器分成*桶*来分布写入，同时允许读取跨桶聚合。挑战在于确定适当的桶数。静态数字仍可能导致*热键*争用，而动态分配每个计数器的桶数涉及更复杂的问题。

让我们看看我们是否可以迭代我们的解决方案来克服这些缺点。

**方法2：每个实例聚合**

为了解决实时写入同一行的热键和争用问题，我们可以实施一种策略，即每个实例在内存中聚合计数，然后定期将它们刷新到磁盘。引入足够的抖动到刷新过程中可以进一步减少争用。

![img](https://miro.medium.com/v2/resize:fit:875/0*6iUKbxJ093jJTiYL) 

然而，这个解决方案提出了一系列新问题：

- **数据丢失的脆弱性**：该解决方案对实例故障、重启或部署期间的所有内存数据丢失都很脆弱。
- **无法可靠地重置计数**：由于计数请求分布在多台机器上，很难就计数器重置发生的确切时间点建立共识。
- **缺乏幂等性**：与之前的方法类似，这种方法不原生保证幂等性。实现幂等性的一种方式是通过始终将相同的一组计数器路由到同一实例。然而，这种方法可能会引入额外的复杂性，如领导者选举，以及在写入路径上的可用性和延迟方面的潜在挑战。

尽管如此，如果这些权衡是可以接受的，这种方法仍然适用。然而，让我们看看我们是否可以采用不同的基于事件的方法来解决这些问题。

**方法3：使用持久队列**

在这种方法中，我们将计数器事件记录到像[Apache Kafka](https://kafka.apache.org/)这样的持久队列系统中，以防止任何潜在的数据丢失。通过创建多个主题分区并将计数器键散列到特定分区，我们确保相同的一组计数器由同一组消费者处理。这种设置简化了幂等性检查和重置计数。此外，通过利用额外的流处理框架，如[Kafka Streams](https://kafka.apache.org/documentation/streams/)或[Apache Flink](https://flink.apache.org/)，我们可以实施窗口聚合。

![img](https://miro.medium.com/v2/resize:fit:875/0*mQikuGyuzZ_lT7Y4) 

然而，这种方法带来了一些挑战：

- **潜在的延迟**：同一个消费者处理来自给定分区的所有计数可能导致备份和延迟，从而产生陈旧的计数。
- **重新平衡分区**：这种方法需要随着计数器基数和吞吐量的增加自动缩放和重新平衡主题分区。

此外，所有预聚合计数的方法都很难支持我们的准确计数要求中的两个：

- **计数审计**：审计涉及将数据提取到离线系统进行分析，以确保增量正确应用于最终值。这个过程也可以用来跟踪增量的来源。然而，当计数被聚合而没有存储单个增量时，审计变得不可行。
- **可能的重新计数**：类似于审计，如果需要对增量进行调整并且需要在时间窗口内重新计数事件，预聚合计数使得这变得不可行。

除了这些需求之外，如果我们确定如何扩展我们的队列分区和消费者同时保持幂等性，这种方法仍然有效。然而，让我们探索如何调整这种方法以满足审计和重新计数的要求。

**方法4：事件日志中的单个增量**

在这种方法中，我们记录每个单独的计数器增量及其**event_time**和**event_id**。event_id可以包括增量来源的信息。event_time和event_id的组合也可以作为给定计数器事件的幂等键。

![img](https://miro.medium.com/v2/resize:fit:875/0*0wKFK7xyTHnEKIhO) 

然而，*在其最简单的形式中*，这种方法有几个缺点：

- **读取延迟**：每个读取请求都需要扫描给定计数器的所有增量，可能会降低性能。
- **重复工作**：多个线程可能会重复聚合相同的一组计数器，在读取操作中，导致浪费努力和资源利用不佳。
- **宽分区**：如果使用像[Apache Cassandra](https://cassandra.apache.org/_/index.html)这样的数据存储，为同一计数器存储许多增量可能会导致[宽分区](https://thelastpickle.com/blog/2019/01/11/wide-partitions-cassandra-3-11.html)，影响读取性能。
- **大数据占用**：单独存储每个增量也可能导致随着时间的推移数据占用量显著增加。如果没有有效的数据保留策略，这种方法可能难以有效扩展。

这些问题的综合影响可能导致基础设施成本增加，可能难以证明其合理性。然而，采用事件驱动的方法似乎是解决我们遇到的一些挑战并满足我们需求的重要一步。

我们如何进一步改进这个解决方案？

# Netflix的方法

我们结合了之前的方法，记录每个计数活动作为一个事件，并使用队列和滑动时间窗口在后台持续聚合这些事件。此外，我们采用分桶策略以防止宽分区。在接下来的部分中，我们将探讨这种方法如何解决前面提到的缺陷并满足我们所有的需求。

**注意**：*从这里开始，我们将使用“****汇总****”和“****聚合****”这两个词交替使用。它们本质上意味着相同的事情，即收集单个计数器的增加/减少并得出最终值。*

**时间序列事件存储**：

我们选择[时间序列数据抽象](https://netflixtechblog.com/introducing-netflix-timeseries-data-abstraction-layer-31552f6326f8)作为我们的事件存储，计数器变化被摄取为事件记录。在时间序列中存储事件的一些好处包括：

**高性能**：时间序列抽象已经解决了我们的许多需求，包括高可用性、高吞吐量、可靠和快速的性能等。

**减少代码复杂性**：我们通过将大部分功能委托给现有服务来减少计数器抽象中的代码复杂性。

时间序列抽象使用Cassandra作为底层事件存储，但它可以配置为与任何持久存储一起工作。它看起来像这样：

![img](https://miro.medium.com/v2/resize:fit:875/0*ge4X7ywSmtizcNE5) 

**处理宽分区**：*time_bucket*和*event_bucket*列在打破宽分区、防止高吞吐量计数器事件压倒给定分区中起着至关重要的作用。*有关更多信息，请参考我们之前的* [*博客*](https://netflixtechblog.com/introducing-netflix-timeseries-data-abstraction-layer-31552f6326f8)。 

**无过度计数**：*event_time*、*event_id*和*event_item_key*列为给定计数器的事件形成了幂等键，使客户端可以安全地重试，而不会有过度计数的风险。

**事件排序**：时间序列以降序排列所有事件，使我们能够利用这个属性来处理像计数器重置这样的事件。

**事件保留**：时间序列抽象包括保留策略，确保事件不会被无限期地存储，节省磁盘空间，降低基础设施成本。一旦事件被聚合并转移到更经济的存储中用于审计，就没有必要将它们保留在主存储中。

现在，让我们看看这些事件是如何为给定的计数器聚合的。

**聚合计数事件**：

如前所述，为每个读取请求收集所有单独的增量在读取性能方面将是成本过高的。因此，需要后台聚合过程不断收敛计数并确保最优的读取性能。

*但我们如何在持续的写入操作中安全地聚合计数事件呢？*

这就是*最终一致*计数的概念变得至关重要的地方。*通过故意落后于当前时间一个安全的范围*，我们确保聚合总是在不可变的窗口内进行。

让我们看看那是什么样子：

![img](https://miro.medium.com/v2/resize:fit:875/0*EOpW-VnA_YZF7KOP) 

让我们分解一下：

- **lastRollupTs**：这表示计数器值最后一次聚合的时间。对于首次操作的计数器，此时间戳默认为过去合理的时间。
- **不可变窗口和滞后**：聚合只能在不再接收计数器事件的不可变窗口内安全进行。时间序列抽象的“acceptLimit”参数在这里起着至关重要的作用，因为它拒绝了超出此限制的时间戳的传入事件。在聚合期间，这个窗口被稍微推回以考虑时钟偏差。

![img](https://miro.medium.com/v2/resize:fit:875/0*DbtPCHPWoaauUkDr) 

这确实意味着计数器值将落后于其最新更新一定范围（通常在秒级）。*这种方法确实为跨区域复制问题留有空间，可能会错过来自其他区域的事件。参见末尾的“未来工作”部分。*

- **聚合过程**：汇总过程聚合聚合窗口*自上次汇总以来*的所有事件，得出新值。

![img](https://miro.medium.com/v2/resize:fit:875/0*oSHneX5BOi5VNGYM) 

**汇总存储**

我们将这种聚合的结果保存在持久存储中。下一次聚合将简单地从这个检查点继续。

![](https://miro.medium.com/v2/resize:fit:875/0*93S_a1YJ6zacuBnn)

 

我们为每个数据集创建一个这样的汇总表，并使用Cassandra作为我们的持久存储。然而，正如你将很快在控制平面部分看到的，计数器服务可以配置为与任何持久存储一起工作。

**LastWriteTs**：每次给定的计数器接收写入时，我们也会在此表中记录一个**last-write-timestamp**作为列更新。这是使用Cassandra的[USING TIMESTAMP](https://docs.datastax.com/en/cql-oss/3.x/cql/cql_reference/cqlInsert.html#cqlInsert__timestamp-value)功能来可预测地应用最后写入胜利（LWW）语义。这个时间戳与事件的*event_time*相同。在后续部分中，我们将看到这个时间戳如何被用来保持一些计数器在活跃的汇总流通中，直到它们赶上最新值。

**汇总缓存**

为了优化读取性能，这些值被缓存在每个计数器的EVCache中。我们将**lastRollupCount**和**lastRollupTs***合并为单个缓存值，以防止计数与其相应的检查点时间戳之间可能的不匹配。

![img](https://miro.medium.com/v2/resize:fit:875/0*giCU1AtWUYMXHZcI) 

但是，我们怎么知道要触发哪些计数器的汇总呢？让我们探索我们的写入和读取路径来更好地理解这一点。

**添加/清除计数**：

![img](https://miro.medium.com/v2/resize:fit:875/0*wsxgnWH1yR0gHAEL) 

*添加*或*清除*计数请求会持久地写入时间序列抽象，并更新汇总存储中的last-write-timestamp。如果持久性确认失败，客户端可以重复他们的请求而不冒着过度计数的风险。一旦持久化，我们发送一个*火忘*请求来触发请求计数器的汇总。

**获取计数**：

![img](https://miro.medium.com/v2/resize:fit:875/0*76pQR6OISx9yuRmi) 

我们返回最后一次汇总的计数作为一个快速的点读取操作，接受可能提供稍微陈旧的计数的权衡。我们还在读取操作期间触发汇总以推进last-rollup-timestamp，提高*后续*聚合的性能。这个过程还*自我补救*了如果任何先前的汇总失败的陈旧计数。

通过这种方法，计数*不断收敛*到它们的最新值。现在，让我们看看我们如何使用我们的汇总管道将这种方法扩展到数百万计数器和数千个并发操作。

**汇总管道**：

每个**Counter-Rollup**服务器运行一个汇总管道，以高效地聚合数百万计数器的计数。这就是计数器抽象中的大部分复杂性所在。在接下来的部分中，我们将分享如何实现高效聚合的关键细节。

**轻量级汇总事件**：如我们在写入和读取路径中看到的，对计数器的每个操作都会向汇总服务器发送一个轻量级事件：

```
rollupEvent: {
  "namespace": "my_dataset",
  "counter": "counter123"
}
```

请注意，此事件不包括增量。这只是向汇总服务器的一个指示，表明这个计数器已被访问，现在需要被聚合。知道哪些特定的计数器需要被聚合可以防止为了聚合的目的扫描整个事件数据集。

![img](https://miro.medium.com/v2/resize:fit:875/0*Yusg6kC9Jj9ayjbi) 

**内存汇总队列**：给定的汇总服务器实例运行一组*内存中*队列来接收汇总事件和并行化聚合。在这个服务的第一个版本中，我们决定使用内存队列来减少配置复杂性，节省基础设施成本，并使队列数量的重新平衡变得相当直接。然而，这带来了如果实例崩溃可能会丢失汇总事件的权衡。有关更多详细信息，请参见“未来工作”中的“陈旧计数”部分。

**最小化重复工作**：我们使用快速非加密哈希，如[XXHash](https://xxhash.com/)，确保相同的一组计数器最终进入同一个队列。此外，我们尽量减少重复聚合工作的数量，通过有一个单独的汇总堆栈选择运行*更少* *更大*实例。

![img](https://miro.medium.com/v2/resize:fit:875/0*u3p0kGfuwvK5mP_j) 

**可用性和竞态条件**：拥有单个汇总服务器实例可以最小化重复聚合工作，但可能会为触发汇总带来可用性挑战。*如果我们选择水平扩展汇总服务器，我们允许线程覆盖汇总值，同时避免任何形式的分布式锁定机制，以保持高可用性和性能。这种方法仍然是安全的，因为聚合发生在不可变的窗口内。尽管*now()*的概念可能在线程之间有所不同，导致汇总值有时会波动，但计数将在每个不可变的聚合窗口内最终收敛到一个准确的值。

**重新平衡队列**：如果我们需要扩展队列的数量，一个简单的控制平面配置更新后重新部署就足以重新平衡队列的数量。

```
      "eventual_counter_config": {             
          "queue_config": {                    
            "num_queues" : 8,  // change to 16 and re-deploy
...
```

**处理部署**：在部署过程中，这些队列会优雅地关闭，首先排空所有现有事件，而新的汇总服务器实例则可能开始使用新的队列配置。可能会有一个短暂的时期，旧的和新的汇总服务器都处于活动状态，但正如前面提到的，由于聚合发生在不可变的窗口内，这种竞态条件是可控的。

**最小化汇总工作**：接收到同一计数器的多个事件并不意味着要多次汇总它。我们将这些汇总事件排入一个集合中，确保*给定的计数器在汇总窗口期间只汇总一次*。

**高效聚合**：每个汇总消费者同时处理一批计数器。在每个批次中，它并行查询底层的时间序列抽象以聚合指定时间范围内的事件。时间序列抽象优化这些范围扫描以实现低毫秒延迟。

**动态批处理**：汇总服务器根据计数器的基数动态调整需要扫描的时间分区数量，以防止用许多并行读取请求压倒底层存储。

![img](https://miro.medium.com/v2/resize:fit:875/0*hoPpSmQeScn87q0U) 

**自适应反压**：每个消费者在发出下一批汇总之前等待一批完成。它根据前一批的性能调整批次之间的等待时间。这种方法在汇总期间提供反压，以防止压倒底层的时间序列存储。

**处理收敛**：

![img](https://miro.medium.com/v2/resize:fit:875/0*-hlw324cMUaC6pQJ) 

为了防止**基数低**的计数器落后太多，从而随后扫描太多的时间分区，它们被保持在不断的汇总流通中。对于**基数高**的计数器，不断地流通它们会在我们汇总队列中消耗过多的内存。这里就是之前提到的**last-write-timestamp**发挥作用的地方。汇总服务器检查这个时间戳，以确定是否需要重新排队给定的计数器，确保我们继续聚合直到它完全赶上写入。

现在，让我们看看我们如何利用这种计数器类型在近实时提供最新的当前计数。

# 实验：准确全球计数器

我们正在试验一个稍微修改版的最终一致性计数器。同样，对“准确”这个术语要谨慎理解。这种类型的计数器与其对应物之间的关键区别在于，*delta*，代表自上次汇总时间戳以来的计数，在实时计算。

![img](https://miro.medium.com/v2/resize:fit:875/0*FVOlMO0VgrQoVBBi) 

然后，*currentAccurateCount = lastRollupCount + delta*

![img](https://miro.medium.com/v2/resize:fit:875/0*M3dbSof98dTfeuNe) 

实时聚合这个*delta*可能会影响这个操作的性能，这取决于需要扫描多少事件和分区来检索这个*delta*。同样的批量汇总原则在这里适用，以防止并行扫描太多分区。相反，如果这个数据集中的计数器经常被访问，*delta*的时间间隔保持狭窄，使得获取当前计数的方法相当有效。

现在，让我们看看所有这些复杂性是如何通过拥有一个统一的控制平面配置来管理的。

# 控制平面

[数据网关平台控制平面](https://netflixtechblog.medium.com/data-gateway-a-platform-for-growing-and-protecting-the-data-tier-f1ed8db8f5c6)管理所有抽象和命名空间的控制设置，包括计数器抽象。下面是一个支持低基数最终一致性计数器的命名空间的控制平面配置示例：

```json
"persistence_configuration": [
  {
    "id": "CACHE",                             // 计数器缓存配置
    "scope": "dal=counter",                                                   
    "physical_storage": {
      "type": "EVCACHE",                       // 缓存存储类型
      "cluster": "evcache_dgw_counter_tier1"   // 共享EVCache集群
    }
     },
  {
    "id": "COUNTER_ROLLUP",
    "scope": "dal=counter",                    // 计数器抽象配置
    "physical_storage": {                     
      "type": "CASSANDRA",                     // 汇总存储类型
      "cluster": "cass_dgw_counter_uc1",       // 物理集群名称
      "dataset": "my_dataset_1"                // 命名空间/数据集   
    },
    "counter_cardinality": "LOW",              // 支持的计数器基数
    "config": {
      "counter_type": "EVENTUAL",              // 计数器类型
      "eventual_counter_config": {             // 最终一致性计数器类型
        "internal_config": {                  
          "queue_config": {                    // 根据基数调整
            "num_queues" : 8,                  // 每个实例的汇总队列
            "coalesce_ms": 10000,              // 汇总的合并持续时间
            "capacity_bytes": 16777216         // 每个队列分配的内存
          },
          "rollup_batch_count": 32             // 并行化因子
        }
      }
    }
  },
  {
    "id": "EVENT_STORAGE",
    "scope": "dal=ts",                         // 时间序列事件存储
    "physical_storage": {
      "type": "CASSANDRA",                     // 持久存储类型
      "cluster": "cass_dgw_counter_uc1",       // 物理集群名称
      "dataset": "my_dataset_1",               // 键空间名称
    },
    "config": {                              
      "time_partition": {                      // 事件的时间分区
        "buckets_per_id": 4,                   // 内部事件桶
        "seconds_per_bucket": "600",           // 低基数的较小宽度
        "seconds_per_slice": "86400",          // 时间片表的宽度
      },
      "accept_limit": "5s",                    // 不可变性的边界
    },
    "lifecycleConfigs": {
      "lifecycleConfig": [
        {
          "type": "retention",                 // 事件保留
          "config": {
            "close_after": "518400s",
            "delete_after": "604800s"          // 7天计数事件保留
          }
        }
      ]
    }
  }
]
```

使用这样的控制平面配置，我们使用容器在同一个主机上部署多个抽象层，每个容器获取特定于其范围的配置。

![img](https://miro.medium.com/v2/resize:fit:875/0*4MdrlEjWg2MXU9S3) 

# 配置

与时间序列抽象一样，我们的自动化使用一系列用户输入，关于他们的工作负载和基数，以得出正确的基础设施和相关的控制平面配置。你可以了解更多关于这个过程的信息，由我们的一位杰出同事[Joey Lynch](https://www.linkedin.com/in/joseph-lynch-9976a431/)给出的演讲：[Netflix如何在云端最佳配置基础设施](https://www.youtube.com/watch?v=Lf6B1PxIvAs)。

# 性能

在撰写这篇博客时，这项服务在全球不同API端点和数据集上处理接近**75K计数请求/秒**：

![img](https://miro.medium.com/v2/resize:fit:875/0*1h_af4Kk3YrZrqlc) 

同时为其所有端点提供**个位数毫秒**延迟：

![img](https://miro.medium.com/v2/resize:fit:875/0*UnI7eore6gvuqrrF) 

# 未来工作

虽然我们的系统很健壮，但我们仍然有工作要做，使其更加可靠并增强其功能。其中一些工作包括：

- **区域汇总**：跨区域复制问题可能导致错过来自其他区域的事件。另一种策略是为每个区域建立一个汇总表，然后在全局汇总表中进行统计。这种设计的一个关键挑战是有效地跨区域通信清除计数器。
- **错误检测和陈旧计数**：如果汇总事件丢失或汇总失败且没有重试，可能会发生过度陈旧的计数。对于经常访问的计数器来说，这不是问题，因为它们保持在汇总流通中。这个问题对于不经常访问的计数器更为明显。通常，这些计数器的初始读取将触发汇总，*自我补救*问题。然而，对于不能接受潜在陈旧初始读取的用例，我们计划实施改进的错误检测、汇总交接和持久队列，以实现弹性重试。

# 结论

分布式计数仍然是计算机科学中的一个挑战性问题。在这篇博客中，我们探讨了多种实现和部署大规模计数服务的方法。尽管可能还有其他的分布式计数方法，我们的目标是在保持高可用性的同时，以低基础设施成本提供极快的性能，并提供幂等保证。在此过程中，我们为了满足Netflix的多样化计数需求，做出了各种权衡。我们希望你觉得这篇博客文章有洞察力。

请继续关注**复合抽象的第3部分**，我们将介绍我们的**图形抽象**，这是一项新服务，建立在[键值抽象](https://netflixtechblog.com/introducing-netflixs-key-value-data-abstraction-layer-1ea8a0a11b30) *和* [时间序列抽象](https://netflixtechblog.com/introducing-netflix-timeseries-data-abstraction-layer-31552f6326f8)之上，用于处理高吞吐量、低延迟的图形。