# 1 概览

## 1.1  预定义的源和接收器

Flink内置了一些基本数据源和接收器，并且始终可用。该预定义的数据源包括文件，目录和插socket，并从集合和迭代器摄取数据。该预定义的数据接收器支持写入文件和标准输入输出及socket。

## 1.2 绑定连接器

连接器提供用于与各种第三方系统连接的代码。目前支持这些系统：

- Apache Kafka (source/sink)
- Apache Cassandra (sink)
- Amazon Kinesis Streams (source/sink)
- Elasticsearch (sink)
- Hadoop FileSystem (sink)
- RabbitMQ (source/sink)
- Apache NiFi (source/sink)
- Twitter Streaming API (source)
- Google PubSub (source/sink)

要在应用程序中使用其中一个连接器，通常需要其他第三方组件，例如数据存储或消息队列的服务器。

> 虽然本节中列出的流连接器是Flink项目的一部分，并且包含在源版本中，但它们不包含在二进制分发版中。

## 1.3 Apache Bahir中的连接器

Flink的其他流处理连接器正在通过Apache Bahir发布，包括：

- Apache ActiveMQ (source/sink)
- Apache Flume (sink)
- Redis (sink)
- Akka (sink)
- Netty (source)

## 1.4 其他连接到Flink的方法

### 1.4.1 通过异步I / O进行数据渲染

使用连接器不是将数据输入和输出Flink的唯一方法。一种常见的模式是在一个Map或多个FlatMap 中查询外部数据库或Web服务以渲染主数据流。

Flink提供了一个用于异步I / O的API， 以便更有效，更稳健地进行这种渲染。

### 1.4.2 可查询状态

当Flink应用程序将大量数据推送到外部数据存储时，这可能会成为I / O瓶颈。如果所涉及的数据具有比写入更少的读取，则更好的方法可以是外部应用程序从Flink获取所需的数据。在可查询的状态界面，允许通过Flink被管理的状态，按需要查询支持这个。

# 2 HDFS连接器

此连接器提供一个Sink，可将分区文件写入任一Hadoop文件系统支持的文件系统 。

- 要使用此连接器，请将以下依赖项添加到项目中：
![](https://ask.qcloudimg.com/http-save/1752328/ag6nihqu87.png)
![](https://ask.qcloudimg.com/http-save/1752328/nff2qx4gs2.png)

> 请注意，流连接器当前不是二进制发布的一部分

## 2.1 Bucketing File Sink

可以配置分段行为以及写入，但我们稍后会介绍。这是可以创建一个默认情况下汇总到按时间拆分的滚动文件的存储槽的方法

- Java
![](https://ask.qcloudimg.com/http-save/1752328/x2kpj2lm23.png)
- Scala
![](https://ask.qcloudimg.com/http-save/1752328/b4ryyl9i9s.png)

唯一必需的参数是存储桶的基本路径。可以通过指定自定义bucketer，写入器和批量大小来进一步配置接收器。

默认情况下，当数据元到达时，分段接收器将按当前系统时间拆分，并使用日期时间模式"yyyy-MM-dd--HH"命名存储区。这种模式传递给 DateTimeFormatter使用当前系统时间和JVM的默认时区来形成存储桶路径。用户还可以为bucketer指定时区以格式化存储桶路径。每当遇到新日期时，都会创建一个新存储桶。

例如，如果有一个包含分钟作为最精细粒度的模式，将每分钟获得一个新桶。每个存储桶本身都是一个包含多个部分文件的目录：接收器的每个并行实例将创建自己的部件文件，当部件文件变得太大时，接收器也会在其他文件旁边创建新的部件文件。当存储桶变为非活动状态时，将刷新并关闭打开的部件文件。如果存储桶最近未写入，则视为非活动状态。默认情况下，接收器每分钟检查一次非活动存储桶，并关闭任何超过一分钟未写入的存储桶。setInactiveBucketCheckInterval()并 setInactiveBucketThreshold()在一个BucketingSink。

也可以通过指定自定义bucketer setBucketer()上BucketingSink。如果需要，bucketer可以使用数据元或元组的属性来确定bucket目录。

默认编写器是StringWriter。这将调用toString()传入的数据元并将它们写入部分文件，由换行符分隔。在a setWriter() 上指定自定义编写器使用BucketingSink。如果要编写Hadoop SequenceFiles，可以使用提供的 SequenceFileWriter，也可以配置为使用压缩。

有两个配置选项指定何时应关闭零件文件并启动新零件文件：

- 通过设置批量大小（默认部件文件大小为384 MB）
- 通过设置批次滚动时间间隔（默认滚动间隔为`Long.MAX_VALUE`）

当满足这两个条件中的任何一个时，将启动新的部分文件。看如下例子：

- Java
![](https://ask.qcloudimg.com/http-save/1752328/ognn5y5efs.png)
- Scala
![](https://ask.qcloudimg.com/http-save/1752328/osev5l31vz.png)
- 这将创建一个接收器，该接收器将写入遵循此模式的存储桶文件：
![](https://ask.qcloudimg.com/http-save/1752328/auocjxji87.png)
- Java
![](https://ask.qcloudimg.com/http-save/1752328/r6yamal97u.png)
- 生成结果
![](https://ask.qcloudimg.com/http-save/1752328/bkz3oz39bw.png)
- date-time是我们从日期/时间格式获取的字符串
- parallel-task是并行接收器实例的索引
- count是由于批处理大小或批处理翻转间隔而创建的部分文件的运行数
![](https://ask.qcloudimg.com/http-save/1752328/8n0ai1zot8.png)

然而这种方式创建了太多小文件，不适合HDFS！仅供娱乐！

# 3 Apache Kafka连接器

## 3.1 简介

此连接器提供对Apache Kafka服务的事件流的访问。

Flink提供特殊的Kafka连接器，用于从/向Kafka主题读取和写入数据。Flink Kafka Consumer集成了Flink的检查点机制，可提供一次性处理语义。为实现这一目标，Flink并不完全依赖Kafka的消费者群体偏移跟踪，而是在内部跟踪和检查这些偏移。

为用例和环境选择一个包（maven artifact id）和类名。对于大多数用户来说，FlinkKafkaConsumer08（部分flink-connector-kafka）是合适的。

![](https://ask.qcloudimg.com/http-save/1752328/3bovukxvkf.png)

然后，导入maven项目中的连接器:

![](https://ask.qcloudimg.com/http-save/1752328/vcelq8duyv.png)

[环境配置参考](https://blog.csdn.net/qq_33589510/article/details/97064338)

## 3.2 ZooKeeper安装及配置

- 下载zk
[http://archive.cloudera.com/cdh5/cdh/5/zookeeper-3.4.5-cdh5.15.1.tar.gz](http://archive.cloudera.com/cdh5/cdh/5/zookeeper-3.4.5-cdh5.15.1.tar.gz)
- 配置系统环境
![](https://ask.qcloudimg.com/http-save/1752328/x9c6bi1kbl.png)
- 修改配置数据存储路径
![](https://ask.qcloudimg.com/http-save/1752328/0gxvgw7yrg.png)![](https://ask.qcloudimg.com/http-save/1752328/qlytx85aoo.png)
- 启动![](https://ask.qcloudimg.com/http-save/1752328/5lk61iza4w.png)3.3 Kafka部署及测试假设你刚刚开始并且没有现有的Kafka或ZooKeeper数据

> 由于Kafka控制台脚本对于基于Unix和Windows的平台不同，因此在Windows平台上使用bin \ windows \而不是bin /，并将脚本扩展名更改为.bat。

### Step 1:下载代码

- [下载](https://archive.apache.org/dist/kafka/1.1.1/kafka_2.11-1.1.1.tgz)
![](https://ask.qcloudimg.com/http-save/1752328/uzyrzpwxg9.png)
- 解压
![](https://ask.qcloudimg.com/http-save/1752328/y12za7re07.png)
- 配置环境变量
![](https://ask.qcloudimg.com/http-save/1752328/4pcn74a1ug.png)
![](https://ask.qcloudimg.com/http-save/1752328/fjuahi6rwx.png)
![](https://ask.qcloudimg.com/http-save/1752328/iyld49a7vs.png)
- 配置服务器属性![](https://ask.qcloudimg.com/http-save/1752328/2t0onrjs6h.png)
- 修改日志存储路径![](https://ask.qcloudimg.com/http-save/1752328/bro4nllmu4.png)
- 修改主机名![](https://ask.qcloudimg.com/http-save/1752328/40u87ld20i.png)

### Step 2: 启动服务器

Kafka使用ZooKeeper，因此如果还没有ZooKeeper服务器，则需要先启动它。

- 后台模式启动![](https://ask.qcloudimg.com/http-save/1752328/0019k9uuv2.png)

### Step 3: 创建一个主题

- 创建topic
![](https://ask.qcloudimg.com/http-save/1752328/mvmr36phlf.png)

### Step 4: 发送一些消息

Kafka附带一个命令行客户端，它将从文件或标准输入中获取输入，并将其作为消息发送到Kafka集群。 默认情况下，每行将作为单独的消息发送。

运行生产者，然后在控制台中键入一些消息以发送到服务器。

- 启动生产者 
![](https://ask.qcloudimg.com/http-save/1752328/9w7adksobj.png)

### Step 5: 启动一个消费者

Kafka还有一个命令行使用者，它会将消息转储到标准输出。

- 分屏，新建消费端
![](https://ask.qcloudimg.com/http-save/1752328/9hy3pxpykr.png)
- 在不同的终端中运行上述每个命令，那么现在应该能够在生产者终端中键入消息并看到它们出现在消费者终端中![](https://ask.qcloudimg.com/http-save/1752328/geg6jzbjvx.png)
所有命令行工具都有其他选项; 运行不带参数的命令将显示更详细地记录它们的使用信息。

## 3.4 Kafka 1.0.0+ Connector

从Flink 1.7开始，有一个新的通用Kafka连接器，它不跟踪特定的Kafka主要版本。 相反，它在Flink发布时跟踪最新版本的Kafka。

如果您的Kafka代理版本是1.0.0或更高版本，则应使用此Kafka连接器。 如果使用旧版本的Kafka（0.11,0.10,0.9或0.8），则应使用与代理版本对应的连接器。

### 兼容性

通过Kafka客户端API和代理的兼容性保证，通用Kafka连接器与较旧和较新的Kafka代理兼容。 它与版本0.11.0或更高版本兼容，具体取决于所使用的功能。

### 将Kafka Connector从0.11迁移到通用(V1.10新增）

要执行迁移，请参阅[升级作业和Flink版本指南](https://ci.apache.org/projects/flink/flink-docs-master/ops/upgrading.html)和

- 在整个过程中使用Flink 1.9或更新版本。
- 不要同时升级Flink和操作符。
- 确保您作业中使用的Kafka Consumer和/或Kafka Producer分配了唯一标识符（uid）：
- 使用stop with savepoint功能获取保存点（例如，使用stop --withSavepoint）CLI命令。

### 用法

- 要使用通用Kafka连接器，请为其添加依赖关系：
![](https://ask.qcloudimg.com/http-save/1752328/0r7ynpj3jy.png)
然后实例化新源（FlinkKafkaConsumer）
![](https://ask.qcloudimg.com/http-save/1752328/f2sdrm6oac.png)
Flink Kafka Consumer是一个流数据源，可以从Apache Kafka中提取并行数据流。 使用者可以在多个并行实例中运行，每个实例都将从一个或多个Kafka分区中提取数据。

Flink Kafka Consumer参与了检查点，并保证在故障期间没有数据丢失，并且计算处理元素“恰好一次”。（注意：这些保证自然会假设Kafka本身不会丢失任何数据。）

请注意，Flink在内部将偏移量作为其分布式检查点的一部分进行快照。 承诺给Kafka的抵消只是为了使外部的进展观与Flink对进展的看法同步。 这样，监控和其他工作可以了解Flink Kafka消费者在多大程度上消耗了一个主题。

和接收器（FlinkKafkaProducer）。 

除了从模块和类名中删除特定的Kafka版本之外，API向后兼容Kafka 0.11连接器。

## 3.5 Kafka消费者

Flink的Kafka消费者被称为FlinkKafkaConsumer08（或09Kafka 0.9.0.x等）。它提供对一个或多个Kafka主题的访问。

构造函数接受以下参数：

- 主题名称/主题名称列表
- DeserializationSchema / KeyedDeserializationSchema用于反序列化来自Kafka的数据
- Kafka消费者的属性。需要以下属性：
	- “bootstrap.servers”（以逗号分隔的Kafka经纪人名单）
	- “zookeeper.connect”（逗号分隔的Zookeeper服务器列表）（仅Kafka 0.8需要）
	- “group.id”消费者群组的ID
![](https://ask.qcloudimg.com/http-save/1752328/dnfv7v69xk.png)
![](https://ask.qcloudimg.com/http-save/1752328/z3m8tclzea.png)

![](https://ask.qcloudimg.com/http-save/1752328/yi7k2ughpa.png)

![](https://ask.qcloudimg.com/http-save/1752328/dihfy67k7v.png)

- 上述程序注意配置ip主机映射
- 虚拟机hosts
![](https://ask.qcloudimg.com/http-save/1752328/appn2amrhd.png)
- 本地机器 hosts![](https://ask.qcloudimg.com/http-save/1752328/2b5advqto9.png)
- 发送消息
![](https://ask.qcloudimg.com/http-save/1752328/elvv2v3vuz.png)
- 运行程序消费消息
![](https://ask.qcloudimg.com/http-save/1752328/mpehsm1u6f.png)
Example:
- Java
![](https://ask.qcloudimg.com/http-save/1752328/2wh2oexebv.png)
- Scala
![](https://ask.qcloudimg.com/http-save/1752328/wsbi0gou6.png)

### The DeserializationSchema

Flink Kafka Consumer需要知道如何将Kafka中的二进制数据转换为Java / Scala对象。

在 DeserializationSchema允许用户指定这样的一个架构。T deserialize(byte[] message) 为每个Kafka消息调用该方法，从Kafka传递值。

从它开始通常很有帮助AbstractDeserializationSchema，它负责将生成的Java / Scala类型描述为Flink的类型系统。实现vanilla的用户DeserializationSchema需要自己实现该getProducedType(...)方法。

为了访问Kafka消息的键和值，KeyedDeserializationSchema具有以下deserialize方法`T deserialize（byte [] messageKey，byte [] message，String topic，int partition，long offset）`。

为方便起见，Flink提供以下模式：

- TypeInformationSerializationSchema（和TypeInformationKeyValueSerializationSchema）创建基于Flink的模式TypeInformation。如果Flink编写和读取数据，这将非常有用。此模式是其他通用序列化方法的高性能Flink替代方案。
- JsonDeserializationSchema（和JSONKeyValueDeserializationSchema）将序列化的JSON转换为ObjectNode对象，可以使用objectNode.get（“field”）作为（Int / String / ...）（）从中访问字段。KeyValue objectNode包含一个“key”和“value”字段，其中包含所有字段，以及一个可选的“元数据”字段，用于公开此消息的偏移量/分区/主题。
- AvroDeserializationSchema它使用静态提供的模式读取使用Avro格式序列化的数据。它可以从Avro生成的类（AvroDeserializationSchema.forSpecific(...)）中推断出模式，也可以GenericRecords 使用手动提供的模式（with AvroDeserializationSchema.forGeneric(...)）。此反序列化架构要求序列化记录不包含嵌入式架构。
		- 还有一个可用的模式版本，可以在Confluent Schema Registry中查找编写器的模式（用于编写记录的 模式）。使用这些反序列化模式记录将使用从模式注册表中检索的模式进行读取，并转换为静态提供的模式（通过 ConfluentRegistryAvroDeserializationSchema.forGeneric(...)或ConfluentRegistryAvroDeserializationSchema.forSpecific(...)）。

要使用此反序列化模式，必须添加以下附加依赖项：

当遇到因任何原因无法反序列化的损坏消息时，有两个选项 - 从deserialize(...)方法中抛出异常将导致作业失败并重新启动，或者返回null以允许Flink Kafka使用者以静默方式跳过损坏的消息。请注意，由于使用者的容错能力（请参阅下面的部分以获取更多详细信息），因此对损坏的消息执行失败将使消费者尝试再次反序列化消息。因此，如果反序列化仍然失败，则消费者将在该损坏的消息上进入不间断重启和失败循环。

## 3.6 Kafka生产者

Flink的Kafka Producer被称为FlinkKafkaProducer011（或010 对于Kafka 0.10.0.x版本。或者直接就是FlinkKafkaProducer，对于Kafka>=1.0.0的版本来说）。

它允许将记录流写入一个或多个Kafka主题。

### 自应用

- Pro![](https://ask.qcloudimg.com/http-save/1752328/yzf2whep3i.png)
- 确保启动端口
![](https://ask.qcloudimg.com/http-save/1752328/5teh8hmbpv.png)
- Pro端生产消息
![](https://ask.qcloudimg.com/http-save/1752328/8slphuwmgy.png)
- 消费端接收
![](https://ask.qcloudimg.com/http-save/1752328/fnhi3xt47i.png)Example
- Java
![](https://ask.qcloudimg.com/http-save/1752328/e1vmapz239.png)
- Scala
![](https://ask.qcloudimg.com/http-save/1752328/kf9akyayha.png)

上面的示例演示了创建Flink Kafka Producer以将流写入单个Kafka目标主题的基本用法。对于更高级的用法，还有其他构造函数变体允许提供以下内容：

- _**提供自定义属性**_
生产者允许为内部的KafkaProducer提供自定义属性配置。
- _**自定义分区程序**_
将记录分配给特定分区，可以为FlinkKafkaPartitioner构造函数提供实现。将为流中的每个记录调用此分区程序，以确定应将记录发送到的目标主题的确切分区。
- _**高级序列化模式**_
与消费者类似，生产者还允许使用调用的高级序列化模式KeyedSerializationSchema，该模式允许单独序列化键和值。它还允许覆盖目标主题，以便一个生产者实例可以将数据发送到多个主题。

## 3.8 Kafka消费者开始位置配置

Flink Kafka Consumer允许配置如何确定Kafka分区的起始位置。

- Java
![](https://ask.qcloudimg.com/http-save/1752328/6ojgorfku0.png)
- Scala
![](https://ask.qcloudimg.com/http-save/1752328/rihywds3uf.png)

Flink Kafka Consumer的所有版本都具有上述明确的起始位置配置方法。

- setStartFromGroupOffsets（默认行为）
从group.idKafka代理（或Zookeeper for Kafka 0.8）中的消费者组（在消费者属性中设置）提交的偏移量开始读取分区。如果找不到分区的偏移量，auto.offset.reset将使用属性中的设置。
- setStartFromEarliest()/ setStartFromLatest()
从最早/最新记录开始。在这些模式下，Kafka中的承诺偏移将被忽略，不会用作起始位置。
- setStartFromTimestamp(long)
从指定的时间戳开始。对于每个分区，时间戳大于或等于指定时间戳的记录将用作起始位置。如果分区的最新记录早于时间戳，则只会从最新记录中读取分区。在此模式下，Kafka中的已提交偏移将被忽略，不会用作起始位置。

还可以指定消费者应从每个分区开始的确切偏移量：

- Java
![](https://ask.qcloudimg.com/http-save/1752328/4hkgxd2zd4.png)
- Scala
![](https://ask.qcloudimg.com/http-save/1752328/ijcese7inm.png)

上面的示例将使用者配置为从主题的分区0,1和2的指定偏移量开始myTopic。偏移值应该是消费者应为每个分区读取的下一条记录。请注意，如果使用者需要读取在提供的偏移量映射中没有指定偏移量的分区，则它将回退到setStartFromGroupOffsets()该特定分区的默认组偏移行为（即）。

请注意，当作业从故障中自动恢复或使用保存点手动恢复时，这些起始位置配置方法不会影响起始位置。在恢复时，每个Kafka分区的起始位置由存储在保存点或检查点中的偏移量确定。

## 3.9 Kafka生产者和容错

### Kafka 0.8

在0.9之前，Kafka没有提供任何机制来保证至少一次或恰好一次的语义。

### Kafka 0.9和0.10

启用Flink的检查点时，FlinkKafkaProducer09和FlinkKafkaProducer010 能提供**至少一次**传输保证。

除了开启Flink的检查点，还应该配置setter方法：

- _**setLogFailuresOnly(boolean)**_
默认为false。启用此选项将使生产者仅记录失败日志而不是捕获和重新抛出它们。这大体上就是计数已成功的记录，即使它从未写入目标Kafka主题。这必须设为false对于确保 _**至少一次**_ 
- _**setFlushOnCheckpoint(boolean)**_
默认为true。启用此函数后，Flink的检查点将在检查点成功之前等待检查点时的任何动态记录被Kafka确认。这可确保检查点之前的所有记录都已写入Kafka。必须开启，对于确保 _**至少一次**_ 

总之，默认情况下，Kafka生成器对版本0.9和0.10具有**至少一次**保证，即

setLogFailureOnly设置为false和setFlushOnCheckpoint设置为true。

> 默认情况下，重试次数设置为“0”。这意味着当setLogFailuresOnly设置为时false，生产者会立即失败，包括Leader更改。
> 默认情况下，该值设置为“0”，以避免重试导致目标主题中出现重复消息。对于经常更改代理的大多数生产环境，建议将重试次数设置为更高的值。
> Kafka目前没有生产者事务，因此Flink在Kafka主题里无法保证恰好一次交付

### Kafka >= 0.11

启用Flink的检查点后，FlinkKafkaProducer011

> 对于Kafka >= 1.0.0版本是FlinkKafkaProduce

可以提供准确的一次交付保证。

除了启用Flink的检查点，还可以通过将适当的语义参数传递给FlinkKafkaProducer011,选择三种不同的算子操作模式

- _**Semantic.NONE**_
![](https://ask.qcloudimg.com/http-save/1752328/9jom38mdbi.png)Flink啥都不保证。生成的记录可能会丢失，也可能会重复。
- _**Semantic.AT\_LEAST\_ONCE（默认设置）**_
![](https://ask.qcloudimg.com/http-save/1752328/8iio0or1i1.png)
类似于setFlushOnCheckpoint(true)在 FlinkKafkaProducer010。这可以保证不会丢失任何记录（尽管它们可以重复）。
- _**Semantic.EXACTLY\_ONCE**_
![](https://ask.qcloudimg.com/http-save/1752328/zwbecndnsc.png)使用Kafka事务提供恰好一次的语义。每当您使用事务写入Kafka时，不要忘记为任何从Kafka消费记录的应用程序设置所需的isolation.level（read\_committed 或read\_uncommitted- 后者为默认值）。

#### 注意事项

_**Semantic.EXACTLY\_ONCE**_ 模式依赖于在从所述检查点恢复之后提交在获取检查点之前启动的事务的能力。如果Flink应用程序崩溃和完成重启之间的时间较长，那么Kafka的事务超时将导致数据丢失（Kafka将自动中止超过超时时间的事务）。考虑到这一点，请根据预期的停机时间适当配置事务超时。

Kafka broker默认 _transaction.max.timeout.ms_ 设置为15分钟。此属性不允许为生产者设置大于其值的事务超时。 

FlinkKafkaProducer011默认情况下，将_transaction.timeout.msproducer config_中的属性设置为1小时，因此_transaction.max.timeout.ms_在使用 _**Semantic.EXACTLY\_ONCE**_ 模式之前应该增加 该属性。

在_read\_committed_模式中KafkaConsumer，任何未完成的事务（既不中止也不完成）将阻止来自给定Kafka主题的所有读取超过任何未完成的事务。换言之，遵循以下事件顺序：

1. 用户事务1开启并写记录
2. 用户事务2开启并写了一些其他记录
3. 用户提交事务2

即使事务2已经提交了记录，在事务1提交或中止之前，消费者也不会看到它们。这有两个含义：

- 首先，在Flink应用程序的正常工作期间，用户可以预期Kafka主题中生成的记录的可见性会延迟，等于已完成检查点之间的平均时间。
- 其次，在Flink应用程序失败的情况下，读者将阻止此应用程序编写的主题，直到应用程序重新启动或配置的事务超时时间过去为止。此注释仅适用于有多个代理/应用程序写入同一Kafka主题的情况。

>  _**Semantic.EXACTLY\_ONCE**_ 模式为每个FlinkKafkaProducer011实例使用固定大小的KafkaProducers池。每个检查点使用其中一个生产者。如果并发检查点的数量超过池大小，FlinkKafkaProducer011 将引发异常并将使整个应用程序失败。请相应地配置最大池大小和最大并发检查点数。
> _**Semantic.EXACTLY\_ONCE**_ 采取所有可能的措施，不要留下任何阻碍消费者阅读Kafka主题的延迟事务，这是必要的。但是，如果Flink应用程序在第一个检查点之前失败，则在重新启动此类应用程序后，系统中没有关于先前池大小的信息。因此，在第一个检查点完成之前按比例缩小Flink应用程序是不安全的 _**FlinkKafkaProducer011.SAFE\_SCALE\_DOWN\_FACTOR**_。

## 3.10 Kafka消费者及其容错

启用Flink的检查点后，Flink Kafka Consumer将使用主题中的记录，并以一致的方式定期检查其所有Kafka偏移以及其他 算子操作的状态。如果作业失败，Flink会将流式程序恢复到最新检查点的状态，并从存储在检查点中的偏移量开始重新使用来自Kafka的记录。

因此，绘制检查点的间隔定义了程序在发生故障时最多可以返回多少。

### 检查点常用参数

#### enableCheckpointing

启用流式传输作业的检查点。 将定期快照流式数据流的分布式状态。 如果发生故障，流数据流将从最新完成的检查点重新启动。

该作业在给定的时间间隔内定期绘制检查点。 状态将存储在配置的状态后端。

> 此刻未正确支持检查点迭代流数据流。 如果“force”参数设置为true，则系统仍将执行作业。

![](https://ask.qcloudimg.com/http-save/1752328/zxijcyy22k.png)

#### setCheckpointingMode

![](https://ask.qcloudimg.com/http-save/1752328/a4p6877waw.png)

#### setCheckpointTimeout

![](https://ask.qcloudimg.com/http-save/1752328/b8q32hhifz.png)

#### setMaxConcurrentCheckpoints![](https://ask.qcloudimg.com/http-save/1752328/a0vqjm0u46.png)

要使用容错的Kafka使用者，需要在运行环境中启用拓扑的检查点：

- Scala
![](https://ask.qcloudimg.com/http-save/1752328/3rbkt5t5uc.png)
- Java
![](https://ask.qcloudimg.com/http-save/1752328/mqmuwrzdt8.png)

另请注意，如果有足够的处理插槽可用于重新启动拓扑，则Flink只能重新启动拓扑。因此，如果拓扑由于丢失了TaskManager而失败，那么之后仍然必须有足够的可用插槽。YARN上的Flink支持自动重启丢失的YARN容器。

如果未启用检查点，Kafka使用者将定期向Zookeeper提交偏移量。

# 参考

[Streaming Connectors](https://ci.apache.org/projects/flink/flink-docs-master/dev/connectors/kafka.html)

[Kafka官方文档](http://kafka.apache.org/documentation/)