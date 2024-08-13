# 状态的存储StateBackend

状态后端是Flink用于管理和存储状态信息的组件，不同的后端有不同的特性和适用场景。

Checkpoint机制开启之后，State会随着Checkpoint作持久化的存储。State的存储地方是通过 StateBackend 决定。

StateBackend定义状态咋存储的，支持三种状态后端

## 1 Memory State Backend

将工作状态（Task State）存储在 TaskManager 的内存中，将检查点（Job State）存储在 JobManager 的内存中。

- **特点：** 将状态直接存储在JVM的堆内存
- **优点：** 访问速度快，性能高
- **缺点：** 容错能力较弱，一旦任务失败，状态数据可能会丢失。适用于状态数据量较小、对性能要求较高的场景，如小型实验或测试环境

## 2 FS State Backend

将工作状态（Task State）存储在 TaskManager 的内存中，将检查点（Job State）存储在文件系统中（通常是分布式文件系统）

- **特点：** 将状态数据定期持久化到分布式文件系统（如HDFS、S3）中。
- **优点：** 容错能力强，支持高可用。
- **缺点：** 性能相对Memory State Backend较低，频繁的读写操作会影响性能。适用于状态数据量较大、对容错要求较高的场景。

## 3 RocksDB State Backend

把工作状态（Task State）存储在 RocksDB，将检查点存储在文件系统（类似FsStateBackend）。

- **特点：** 基于RocksDB嵌入式数据库，将状态数据存储在本地磁盘上。
- **优点：** 性能优异，支持快速随机读写，同时具备良好的容错能力。
- **缺点：** 配置相对复杂。适用于对性能和容错性都有较高要求的场景，例如大规模的实时计算任务。

## 4 Flink 内置实现

### 4.1 HashMapStateBackend

默认，MemoryStateBackend、FsStateBackend的实现。

此StateBackend根据配置 CheckpointStorage 的 TaskManager 和检查点的内存（JVM 堆）中保存工作状态。

#### 大小考虑

工作状态保持在 TaskManager 堆。如果 TaskManager 同时执行多个任务（如果 TaskManager 有多个slot，或者使用slot共享），则所有任务的聚合状态需要适合该 TaskManager 的内存。

#### 配置

对于所有的StateBackend，这个后端可以在应用程序中配置（通过使用相应的构造函数参数创建后端并在执行环境中设置它），或在 Flink 配置中指定它。

如果在应用程序中指定StateBackend，它可能会从 Flink 配置中获取额外的配置参数。例如，如果在应用程序中配置了后端，而没有默认的保存点目录，它将选择正在运行的作业/ 集群的 Flink 配置中指定的默认保存点目录。该行为是通过该 configure(ReadableConfig, ClassLoader) 方法实现的。

```java
StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
env.setStateBackend(new HashMapStateBackend());
```

### 4.2 EmbeddedRocksDBStateBackend

RocksDBStateBackend的实现。

## 5 选型权衡

- **状态数据量：** 对于小规模状态数据，Memory State Backend是一个不错的选择；对于大规模状态数据，RocksDB State Backend或FS State Backend更合适。
- **容错要求：** 如果对数据容错性要求较高，建议选择FS State Backend或RocksDB State Backend。
- **性能要求：** 如果对性能要求较高，且状态数据量不大，可以选择Memory State Backend；如果需要兼顾性能和容错性，RocksDB State Backend是一个不错的选择。
- **成本：** 不同的后端存储的成本也不同，需要根据实际情况进行选择。

## 6 总结

Flink提供了多种状态后端供用户选择，每种后端都有其自身的特点和适用场景。在选择状态后端时，需要综合考虑状态数据量、容错要求、性能要求和成本等因素，选择最适合的方案。