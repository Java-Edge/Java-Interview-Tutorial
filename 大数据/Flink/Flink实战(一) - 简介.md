> 了解Flink是什么，Flink应用程序运行的多样化，对比业界常用的流处理框架，Flink的发展趋势，Flink生态圈，Flink应用场景及Flink如何进行高效的Flink学习。

# 0 [相关源码](https://github.com/Wasabi1234)

# 1 前言
## 1.1 功能
![](https://uploadfiles.nowcoder.com/files/20190426/5088755_1556280924846_16782311-7573b6c000c6543b.png)

## 1.2 用户
- 国际
![](https://uploadfiles.nowcoder.com/files/20190426/5088755_1556280924782_16782311-2d61946f399b0d38.png)
- 国内
![](https://uploadfiles.nowcoder.com/files/20190429/5088755_1556550962314_16782311-ec14bee432983787.png)


## 1.3 特点
◆ 结合Java、Scala两种语言
◆ 从基础到实战
◆ 系统学习Flink的核心知识
◆ 快速完成从入门到上手企业开发的能力提升

## 1.4 安排
◆ 初识Flink 
◆ 编程模型及核心概念
◆ DataSet API编程
◆ DataStream API编程
◆ Flink Table&SQL
◆ Window和Time操作
◆ Flink Connectors
◆ Flink部署及作业提交
◆ Flink监控及调优

- 使用Flink自定义数据源读取配置数据
- 使用Flink完成实时数据清洗
- 使用Flink完成实时结果统计
- 统计结果可视化展示(Kibana)

## 1.5 收获
◆ 系统入门Flink开发
◆ 掌握应用Java SE/Scala的Flink实现
◆理解Flink项目的开发流程
◆ 快速上手企业开发

## 1.6 环境
◆ Mac OS: 10.14.12
◆ Kafka: 1.1.1
◆ Hadoop : CDH ( 5.15.1) 
◆ ES/Kibana : 6+
◆ FXIQ: IDEA
◆ Flink : 1.7 

## 1.7 确保你已掌握
◆ 了解Linux常用基本命令的使用
◆ 熟悉Java SE或Scala的基本使用
◆ 熟悉Hadoop基础应用

## 1.8  学习方法推荐
◆认真阅读本教程!多思考、多动手!
◆合理利用网络资源
◆善于提问:QQ群讨论

# 2 教程大纲
◆ Flink概述
◆ Flink应用场景
◆ Flink Layer
◆ Flink发 展趋势
◆ Flink应用程序运行方式多样化
◆ 如何学习Flink
◆ Flink VS Storm VS Spark Streaming

# Flink概述
Apache Flink是一个框架和分布式处理引擎，用于对无界和有界数据流进行状态计算。 Flink设计为在所有常见的集群环境中运行，以内存速度和任何规模执行计算。

在这里，我们解释Flink架构的重要方面。

# 架构
## 处理无界和有界数据
任何类型的数据都是作为事件流产生的。信用卡交易，传感器测量，机器日志或网站或移动应用程序上的用户交互，所有这些数据都作为流生成。

数据可以作为无界或有界流处理。

- 无界流有一个开始但没有定义的结束。它们不会在生成时终止并提供数据。必须连续处理无界流，即必须在摄取之后立即处理事件。无法等待所有输入数据到达，因为输入是无界的，并且在任何时间点都不会完成。处理无界数据通常要求以特定顺序摄取事件，例如事件发生的顺序，以便能够推断结果完整性。

- 有界流具有定义的开始和结束。可以在执行任何计算之前通过摄取所有数据来处理有界流。处理有界流不需要有序摄取，因为可以始终对有界数据集进行排序。有界流的处理也称为批处理

![](https://uploadfiles.nowcoder.com/files/20190429/5088755_1556550963103_16782311-3026123ef9d639a0.png)

- Apache Flink擅长处理无界和有界数据集。精确控制时间和状态使Flink的运行时能够在无界流上运行任何类型的应用程序。有界流由算法和数据结构内部处理，这些算法和数据结构专为固定大小的数据集而设计，从而产生出色的性能。

通过探索在Flink之上构建的用例来说服自己。





## 利用内存中性能
有状态Flink应用程序针对本地状态访问进行了优化。任务状态始终保留在内存中，如果状态大小超过可用内存，则保存在访问高效的磁盘上数据结构中。因此，任务通过访问本地（通常是内存中）状态来执行所有计算，从而产生非常低的处理延迟。 Flink通过定期和异步地将本地状态检查点到持久存储来保证在出现故障时的一次状态一致性。
![](https://uploadfiles.nowcoder.com/files/20190429/5088755_1556550962890_16782311-cbc30852067487be.png)

# 应用
Apache Flink是一个用于对无界和有界数据流进行有状态计算的框架。 Flink在不同的抽象级别提供多个API，并为常见用例提供专用库。

在这里，我们介绍Flink易于使用和富有表现力的API和库。

## 流媒体应用程序的构建块
可以由流处理框架构建和执行的应用程序类型由框架控制流，状态和时间的程度来定义。在下文中，我们描述了流处理应用程序的这些构建块，并解释了Flink处理它们的方法。

### 流
显然，流是流处理的一个基本方面。但是，流可以具有不同的特征，这些特征会影响流的处理方式。 Flink是一个多功能的处理框架，可以处理任何类型的流。

- 有界和无界流：流可以是无界的或有界的，即固定大小的数据集。 Flink具有处理无界流的复杂功能，但也有专门的运营商来有效地处理有界流。
- 实时和记录的流：所有数据都作为流生成。有两种方法可以处理数据。在生成时实时处理它或将流持久保存到存储系统，例如文件系统或对象存储，并在以后处理它。 Flink应用程序可以处理记录或实时流。

### 状态
每个非平凡的流应用程序都是有状态的，即，只有对各个事件应用转换的应用程序不需要状态。运行基本业务逻辑的任何应用程序都需要记住事件或中间结果，以便在以后的时间点访问它们，例如在收到下一个事件时或在特定持续时间之后。
![](https://uploadfiles.nowcoder.com/files/20190429/5088755_1556550962285_16782311-9fa8515a762bb3be.png)

应用状态是Flink的一等公民。您可以通过查看Flink在状态处理环境中提供的所有功能来查看。

- 多状态基元：Flink为不同的数据结构提供状态基元，例如原子值，列表或映射。开发人员可以根据函数的访问模式选择最有效的状态原语。
- 可插拔状态后端：应用程序状态由可插拔状态后端管理和检查点。 Flink具有不同的状态后端，可以在内存或RocksDB中存储状态，RocksDB是一种高效的嵌入式磁盘数据存储。也可以插入自定义状态后端。
- 完全一次的状态一致性：Flink的检查点和恢复算法可确保在发生故障时应用程序状态的一致性。因此，故障是透明处理的，不会影响应用程序的正确性。
- 非常大的状态：由于其异步和增量检查点算法，Flink能够维持几兆兆字节的应用程序状态。
可扩展的应用程序：Flink通过将状态重新分配给更多或更少的工作人员来支持有状态应用程序的扩展。

### 时间
时间是流应用程序的另一个重要组成部分大多数事件流都具有固有的时间语义，因为每个事件都是在特定时间点生成的。此外，许多常见的流计算基于时间，例如窗口聚合，会话化，模式检测和基于时间的连接。流处理的一个重要方面是应用程序如何测量时间，即事件时间和处理时间的差异。

Flink提供了一组丰富的与时间相关的功能。

- 事件时间模式：使用事件时间语义处理流的应用程序根据事件的时间戳计算结果。因此，无论是否处理记录的或实时的事件，事件时间处理都允许准确和一致的结果。
- 水印支持：Flink使用水印来推断事件时间应用中的时间。水印也是一种灵活的机制，可以权衡结果的延迟和完整性。
- 延迟数据处理：当使用水印在事件 - 时间模式下处理流时，可能会在所有相关事件到达之前完成计算。这类事件被称为迟发事件。 Flink具有多个选项来处理延迟事件，例如通过侧输出重新路由它们以及更新以前完成的结果。
- 处理时间模式：除了事件时间模式之外，Flink还支持处理时间语义，该处理时间语义执行由处理机器的挂钟时间触发的计算。处理时间模式适用于具有严格的低延迟要求的某些应用，这些要求可以容忍近似结果。

# 4  Layered APIs
Flink提供三层API。 每个API在简洁性和表达性之间提供不同的权衡，并针对不同的用例。
![](https://uploadfiles.nowcoder.com/files/20190429/5088755_1556550962261_16782311-b073370ab0e9a193.png)

我们简要介绍每个API，讨论其应用程序，并显示代码示例。

## ProcessFunctions
ProcessFunctions是Flink提供的最具表现力的功能接口。 Flink提供ProcessFunction来处理来自窗口中分组的一个或两个输入流或事件的单个事件。 ProcessFunctions提供对时间和状态的细粒度控制。 ProcessFunction可以任意修改其状态并注册将在未来触发回调函数的定时器。因此，ProcessFunctions可以根据许多有状态事件驱动的应用程序的需要实现复杂的每事件业务逻辑。

以下示例显示了一个KeyedProcessFunction，它对KeyedStream进行操作并匹配START和END事件。收到START事件时，该函数会记住其状态的时间戳，并在四小时内注册一个计时器。如果在计时器触发之前收到END事件，则该函数计算END和START事件之间的持续时间，清除状态并返回该值。否则，计时器只会触发并清除状态。
```
/**
 * Matches keyed START and END events and computes the difference between 
 * both elements' timestamps. The first String field is the key attribute, 
 * the second String attribute marks START and END events.
 */
public static class StartEndDuration
    extends KeyedProcessFunction<String, Tuple2<String, String>, Tuple2<String, Long>> {

  private ValueState<Long> startTime;

  @Override
  public void open(Configuration conf) {
    // obtain state handle
    startTime = getRuntimeContext()
      .getState(new ValueStateDescriptor<Long>("startTime", Long.class));
  }

  /** Called for each processed event. */
  @Override
  public void processElement(
      Tuple2<String, String> in,
      Context ctx,
      Collector<Tuple2<String, Long>> out) throws Exception {

    switch (in.f1) {
      case "START":
        // set the start time if we receive a start event.
        startTime.update(ctx.timestamp());
        // register a timer in four hours from the start event.
        ctx.timerService()
          .registerEventTimeTimer(ctx.timestamp() + 4 * 60 * 60 * 1000);
        break;
      case "END":
        // emit the duration between start and end event
        Long sTime = startTime.value();
        if (sTime != null) {
          out.collect(Tuple2.of(in.f0, ctx.timestamp() - sTime));
          // clear the state
          startTime.clear();
        }
      default:
        // do nothing
    }
  }

  /** Called when a timer fires. */
  @Override
  public void onTimer(
      long timestamp,
      OnTimerContext ctx,
      Collector<Tuple2<String, Long>> out) {

    // Timeout interval exceeded. Cleaning up the state.
    startTime.clear();
  }
}
```
该示例说明了KeyedProcessFunction的表达能力，但也强调了它是一个相当冗长的接口。

## DataStream API
DataStream API为许多常见的流处理操作提供原语，例如窗口化，一次记录转换以及通过查询外部数据存储来丰富事件。 DataStream API可用于Java和Scala，它基于函数，例如map（），reduce（）和aggregate（）。 可以通过扩展接口或Java或Scala lambda函数来定义函数。

以下示例显示如何对点击流进行会话并计算每个会话的点击次数。
```
// a stream of website clicks
DataStream<Click> clicks = ...

DataStream<Tuple2<String, Long>> result = clicks
  // project clicks to userId and add a 1 for counting
  .map(
    // define function by implementing the MapFunction interface.
    new MapFunction<Click, Tuple2<String, Long>>() {
      @Override
      public Tuple2<String, Long> map(Click click) {
        return Tuple2.of(click.userId, 1L);
      }
    })
  // key by userId (field 0)
  .keyBy(0)
  // define session window with 30 minute gap
  .window(EventTimeSessionWindows.withGap(Time.minutes(30L)))
  // count clicks per session. Define function as lambda function.
  .reduce((a, b) -> Tuple2.of(a.f0, a.f1 + b.f1));
```
## SQL & Table API
Flink具有两个关系API，Table API和SQL。 这两个API都是用于批处理和流处理的统一API，即，在无界的实时流或有界的记录流上以相同的语义执行查询，并产生相同的结果。 Table API和SQL利用Apache Calcite进行解析，验证和查询优化。 它们可以与DataStream和DataSet API无缝集成，并支持用户定义的标量，聚合和表值函数。

Flink的关系API旨在简化数据分析，数据流水线和ETL应用程序的定义。

以下示例显示用于会话点击流的SQL查询，并计算每个会话的点击次数。 这与DataStream API示例中的用例相同。
```
SELECT userId, COUNT(*)
FROM clicks
GROUP BY SESSION(clicktime, INTERVAL '30' MINUTE), userId
```

## 库
Flink具有几个用于常见数据处理用例的库。这些库通常嵌入在API中，而不是完全独立的。因此，他们可以从API的所有功能中受益，并与其他库集成。

- 复杂事件处理（CEP）：模式检测是事件流处理的一个非常常见的用例。 Flink的CEP库提供了一个API来指定事件模式（想想正则表达式或状态机）。 CEP库与Flink的DataStream API集成，以便在DataStream上评估模式。 CEP库的应用包括网络入侵检测，业务流程监控和欺诈检测。

- DataSet API：DataSet API是Flink用于批处理应用程序的核心API。 DataSet API的原语包括map，reduce，（外部）join，co-group和iterate。所有操作都由算法和数据结构支持，这些算法和数据结构对内存中的序列化数据进行操作，并在数据大小超过内存预算时溢出到磁盘。 Flink的DataSet API的数据处理算法受到传统数据库运算符的启发，例如混合散列连接或外部合并排序。

- Gelly：Gelly是一个可扩展的图形处理和分析库。 Gelly在DataSet API之上实现并与之集成。因此，它受益于其可扩展且强大的运营商。 Gelly具有内置算法，例如标签传播，三角形枚举和页面排名，但也提供了一种Graph API，可以简化自定义图算法的实现。

# 5 运行多样化
## 5.1 随处部署应用程序
Apache Flink是一个分布式系统，需要计算资源才能执行应用程序。 
Flink与所有常见的集群资源管理器（如Hadoop YARN，Apache Mesos和Kubernetes）集成，但也可以设置为作为独立集群运行。

Flink旨在很好地运作以前列出的每个资源管理器。
这是通过特定于资源管理器的部署模式实现的，这些模式允许Flink以其惯用方式与每个资源管理器进行交互。

部署Flink应用程序时，Flink会根据应用程序配置的并行性自动识别所需资源，并从资源管理器请求它们。
如果发生故障，Flink会通过请求新资源来替换发生故障的容器。提交或控制应用程序的所有通信都通过REST调用。
这简化了Flink在许多环境中的集成。

## 5.2 以任何规模运行应用程序
Flink旨在以任何规模运行有状态流应用程序。
应用程序并行化为数千个在集群中分布和同时执行的任务。因此，应用程序可以利用几乎无限量的CPU，主内存，磁盘和网络IO。而且，Flink很容易保持非常大的应用程序状态。其异步和增量检查点算法确保对处理延迟的影响最小，同时保证一次性状态一致性。

用户报告了在其生产环境中运行的Flink应用程序令人印象深刻的可扩展性数字，例如

- 应用程序每天处理数万亿个事件，
- 应用程序维护多个TB的状态
- 运行在数千个核心上的应用程序

# 6 业界流处理框架对比
![](https://uploadfiles.nowcoder.com/files/20190429/5088755_1556550962262_16782311-f53305703c0d6af4.png)

# 7 Flink 使用案例
Apache Flink 功能强大，支持开发和运行多种不同种类的应用程序。它的主要特性包括：批流一体化、精密的状态管理、事件时间支持以及精确一次的状态一致性保障等。
Flink 不仅可以运行在包括 YARN、 Mesos、Kubernetes 在内的多种资源管理框架上，还支持在裸机集群上独立部署。
在启用高可用选项的情况下，它不存在单点失效问题。事实证明，Flink 已经可以扩展到数千核心，其状态可以达到 TB 级别，且仍能保持高吞吐、低延迟的特性。世界各地有很多要求严苛的流处理应用都运行在 Flink 之上。

接下来我们将介绍 Flink 常见的几类应用并给出相关实例链接。

*   [事件驱动型应用]
*   [数据分析应用]
*   [数据管道应用]

## 7.1 事件驱动型应用

### 7.1.1 什么是事件驱动型应用？

事件驱动型应用是一类具有状态的应用，它从一个或多个事件流提取数据，并根据到来的事件触发计算、状态更新或其他外部动作。

事件驱动型应用是在计算存储分离的传统应用基础上进化而来。在传统架构中，应用需要读写远程事务型数据库。

相反，事件驱动型应用是基于状态化流处理来完成。在该设计中，数据和计算不会分离，应用只需访问本地（内存或磁盘）即可获取数据。系统容错性的实现依赖于定期向远程持久化存储写入 checkpoint。

- 传统应用和事件驱动型应用架构的区别
![](https://uploadfiles.nowcoder.com/files/20190429/5088755_1556550962090_16782311-2af4645711b14a17.png)

### 7.1.2 事件驱动型应用的优势？
事件驱动型应用无须查询远程数据库，本地数据访问使得它具有更高的吞吐和更低的延迟。而由于定期向远程持久化存储的 checkpoint 工作可以异步、增量式完成，因此对于正常事件处理的影响甚微。事件驱动型应用的优势不仅限于本地数据访问。传统分层架构下，通常多个应用会共享同一个数据库，因而任何对数据库自身的更改（例如：由应用更新或服务扩容导致数据布局发生改变）都需要谨慎协调。反观事件驱动型应用，由于只需考虑自身数据，因此在更改数据表示或服务扩容时所需的协调工作将大大减少。

### 7.1.3 Flink 如何支持事件驱动型应用？
事件驱动型应用会受制于底层流处理系统对时间和状态的把控能力，Flink 诸多优秀特质都是围绕这些方面来设计的。
它提供了一系列丰富的状态操作原语，允许以精确一次的一致性语义合并海量规模（TB 级别）的状态数据。
此外，Flink 还支持事件时间和自由度极高的定制化窗口逻辑，而且它内置的 `ProcessFunction` 支持细粒度时间控制，方便实现一些高级业务逻辑。
同时，Flink 还拥有一个复杂事件处理（CEP）类库，可以用来检测数据流中的模式。

Flink 中针对事件驱动应用的明星特性当属 savepoint。Savepoint 是一个一致性的状态映像，它可以用来初始化任意状态兼容的应用。在完成一次 savepoint 后，即可放心对应用升级或扩容，还可以启动多个版本的应用来完成 A/B 测试。

### 典型的事件驱动型应用实例

*   [反欺诈](https://sf-2017.flink-forward.org/kb_sessions/streaming-models-how-ing-adds-models-at-runtime-to-catch-fraudsters/)
*   [异常检测](https://sf-2017.flink-forward.org/kb_sessions/building-a-real-time-anomaly-detection-system-with-flink-mux/)
*   [基于规则的报警](https://sf-2017.flink-forward.org/kb_sessions/dynamically-configured-stream-processing-using-flink-kafka/)
*   [业务流程监控](https://jobs.zalando.com/tech/blog/complex-event-generation-for-business-process-monitoring-using-apache-flink/)
*   [（社交网络）Web 应用](https://berlin-2017.flink-forward.org/kb_sessions/drivetribes-kappa-architecture-with-apache-flink/)

## 数据分析应用

### 什么是数据分析应用？

数据分析任务需要从原始数据中提取有价值的信息和指标。传统的分析方式通常是利用批查询，或将事件记录下来并基于此有限数据集构建应用来完成。为了得到最新数据的分析结果，必须先将它们加入分析数据集并重新执行查询或运行应用，随后将结果写入存储系统或生成报告。

借助一些先进的流处理引擎，还可以实时地进行数据分析。和传统模式下读取有限数据集不同，流式查询或应用会接入实时事件流，并随着事件消费持续产生和更新结果。这些结果数据可能会写入外部数据库系统或以内部状态的形式维护。仪表展示应用可以相应地从外部数据库读取数据或直接查询应用的内部状态。

如下图所示，Apache Flink 同时支持流式及批量分析应用。


### 流式分析应用的优势？

和批量分析相比，由于流式分析省掉了周期性的数据导入和查询过程，因此从事件中获取指标的延迟更低。不仅如此，批量查询必须处理那些由定期导入和输入有界性导致的人工数据边界，而流式查询则无须考虑该问题。

另一方面，流式分析会简化应用抽象。批量查询的流水线通常由多个独立部件组成，需要周期性地调度提取数据和执行查询。如此复杂的流水线操作起来并不容易，一旦某个组件出错将会影响流水线的后续步骤。而流式分析应用整体运行在 Flink 之类的高端流处理系统之上，涵盖了从数据接入到连续结果计算的所有步骤，因此可以依赖底层引擎提供的故障恢复机制。

### Flink 如何支持数据分析类应用？

Flink 为持续流式分析和批量分析都提供了良好的支持。具体而言，它内置了一个符合 ANSI 标准的 SQL 接口，将批、流查询的语义统一起来。无论是在记录事件的静态数据集上还是实时事件流上，相同 SQL 查询都会得到一致的结果。同时 Flink 还支持丰富的用户自定义函数，允许在 SQL 中执行定制化代码。如果还需进一步定制逻辑，可以利用 Flink DataStream API 和 DataSet API 进行更低层次的控制。此外，Flink 的 Gelly 库为基于批量数据集的大规模高性能图分析提供了算法和构建模块支持。

### 典型的数据分析应用实例

*   [电信网络质量监控](http://2016.flink-forward.org/kb_sessions/a-brief-history-of-time-with-apache-flink-real-time-monitoring-and-analysis-with-flink-kafka-hb/)
*   移动应用中的[产品更新及实验评估分析](https://techblog.king.com/rbea-scalable-real-time-analytics-king/)
*   消费者技术中的[实时数据即席分析](https://eng.uber.com/athenax/)
*   大规模图分析

## 数据管道应用

### 什么是数据管道？

提取-转换-加载（ETL）是一种在存储系统之间进行数据转换和迁移的常用方法。ETL 作业通常会周期性地触发，将数据从事务型数据库拷贝到分析型数据库或数据仓库。

数据管道和 ETL 作业的用途相似，都可以转换、丰富数据，并将其从某个存储系统移动到另一个。但数据管道是以持续流模式运行，而非周期性触发。因此它支持从一个不断生成数据的源头读取记录，并将它们以低延迟移动到终点。例如：数据管道可以用来监控文件系统目录中的新文件，并将其数据写入事件日志；另一个应用可能会将事件流物化到数据库或增量构建和优化查询索引。

下图描述了周期性 ETL 作业和持续数据管道的差异。

![image](https://uploadfiles.nowcoder.com/files/20190429/5088755_1556550962243_16782311-2d26e14edaedecfd.png)

### 数据管道的优势？

和周期性 ETL 作业相比，持续数据管道可以明显降低将数据移动到目的端的延迟。此外，由于它能够持续消费和发送数据，因此用途更广，支持用例更多。

### Flink 如何支持数据管道应用？

很多常见的数据转换和增强操作可以利用 Flink 的 SQL 接口（或 Table API）及用户自定义函数解决。如果数据管道有更高级的需求，可以选择更通用的 DataStream API 来实现。Flink 为多种数据存储系统（如：Kafka、Kinesis、Elasticsearch、JDBC数据库系统等）内置了连接器。同时它还提供了文件系统的连续型数据源及数据汇，可用来监控目录变化和以时间分区的方式写入文件。

### 典型的数据管道应用实例

*   电子商务中的[实时查询索引构建](https://data-artisans.com/blog/blink-flink-alibaba-search)
*   电子商务中的[持续 ETL](https://jobs.zalando.com/tech/blog/apache-showdown-flink-vs.-spark/)


# 参考
[Flink官网](https://ci.apache.org/projects/flink/flink-docs-release-1.8/dev/api_concepts.html)


# X 交流学习
![](https://upload-images.jianshu.io/upload_images/16782311-8d7acde57fdce062.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## [CSDN](https://blog.csdn.net/qq_33589510)

## [Github](https://github.com/Wasabi1234)
