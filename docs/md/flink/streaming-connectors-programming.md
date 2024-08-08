# Streaming Connectors 编程

Flink已内置很多Source、Sink。

## 2 附带的连接器（Flink Project Connectors）

连接器可和第三方系统交互，目前支持：

- 文件
- 目录
- socket
- 从集合和迭代器摄取数据

预定义的数据接收器支持写入：

- 文件
- 标准输入输出
- socket

### 1.2 绑定连接器

连接器提供用于与各种第三方系统连接的代码。目前支持：

- [Apache Kafka](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/connectors/datastream/kafka/) (source/sink)
- [Elasticsearch](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/connectors/datastream/elasticsearch/) (sink)
- [Apache Pulsar](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/connectors/datastream/pulsar/) (source)
- [JDBC](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/connectors/datastream/jdbc/) (sink)

使用一种连接器时，通常需额外的第三方组件，如数据存储服务器或MQ。 这些列举的连接器是 Flink 工程的一部分，包含在发布的源码中，但不包含在二进制发行版中。

## 3  Apache Bahir中的连接器

Flink额外的连接器，通过 [Apache Bahir](https://bahir.apache.org/) 发布,：

- [Redis](https://bahir.apache.org/docs/flink/current/flink-streaming-redis/) (sink)
- [Akka](https://bahir.apache.org/docs/flink/current/flink-streaming-akka/) (sink)
- [Netty](https://bahir.apache.org/docs/flink/current/flink-streaming-netty/) (source)

## 4 连接Flink的其它方法

### 4.1 异步I / O

使用connector不是将数据输入和输出Flink的唯一方法。一种常见的模式：从外部DB或 Web 服务查询数据得到初始数据流，然后 `Map` 或 `FlatMap` 对初始数据流进行丰富和增强。

Flink 提供[异步 I/O](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/dev/datastream/operators/asyncio/) API 让这过程更简单、高效和稳定。

### 4.2 可查询状态

当 Flink 应用程序需向外部存储推送大量数据时会导致 I/O 瓶颈问题出现。此时，若对数据的读操作<<写操作，则让外部应用从 Flink 拉取所需的数据更好。 [可查询状态](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/dev/datastream/fault-tolerance/queryable_state/) 接口可以实现这个功能，该接口允许被 Flink 托管的状态可以被按需查询。

看几个具体的连接器。

参考

- [Streaming Connectors](https://ci.apache.org/projects/flink/flink-docs-master/dev/connectors/kafka.html)
- [Kafka官方文档](