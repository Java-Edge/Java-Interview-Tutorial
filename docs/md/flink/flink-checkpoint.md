# 10-checkpoint容错保证

## 0 前言

程序在 Flink 集群运行，某个算子因为某些原因出现故障，如何处理

在故障恢复后，如何保证数据状态，和故障发生之前的数据状态一致?

## 1 什么是 checkpoint(检查点)?

Checkpoint 能生成快照(Snapshot)。

若 Flink 程序崩溃，重新运行程序时可以有选择地从这些快照进行恢复。

Checkpoint 是 Flink 可靠性的基石。

## 2 Checkpoint V.S State

- State 指某个算子的数据状态，保存在堆内存
- Checkpoint 指所有算子的数据状态，持久化保存

## 3 什么是savepoint(保存点)?

基于 checkpoint 机制的快照。

## 4 Checkpoint V.S Savepoint

Checkpoint 是 自动容错恢复机制，Savepoint 某个时间点的全局状态镜像

Checkpoint 是 Flink 系统行为 。Savepoint 是用户触发

Checkpoint 默认程序删除。Savepoint 会一直保存

## 5 数据流快照最简单的流程

1. 暂停处理新流入数据，将新数据缓存起来
2. 将算子任务的本地状态数据拷贝到一个远程的持久化存储上
3. 继续处理新流入的数据，包括刚才缓存起来的数据

## 6 Flink slot 和并行度

设置合理的并行度能够加快数据的处理

Flink 每个算子都可以设置并行度

Slot 使得 taskmanager 具有并发执行的能力

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/98141c59655e9e086fe0201d86c8c7b6.png)

### Flink 任务和子任务

从 Source 到 sink，每当并行度发生变化或者数据分组( keyBy)，就会产生任务。

一个任务的并行度为 N，就会有 N 个子任务。

## 7 Checkpoint 分布式快照流程

### 第1步

要实现分布式快照，最关键的是能够将数据流切分。Flink 中使用 Checkpoint Barrier(检查点分割线)来切分数据流

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/7effe628257b308dab9d6ad0203579b3.png)

当 Source 子任务收到 Checkpoint 请求，该算子会对自己的数据状态保存快照。

向自己的下一个算子发送 Checkpoint Barrier，下一个算子只有收到上一个算子广播过来的 Checkpoint Barrier，才进行快照保存。

### 第2步

当 Sink 算子已经收到所有上游的 Checkpoint Barrie 时，进行以下 2 步操作：

1. 保存自己的数据状态
2. 并直接通知检查点协调器

检查点协调器在收集所有的 task 通知后，就认为这次的 Checkpoint 全局完成了。

下游算子有多个数据流输入，啥时才 checkpoint？

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/3261e11fd298817705cbd6512e77a296.png)

这就涉及到Barrie对齐机制，保证了 Checkpoint 数据状态的精确一致。

第1步：下一个算子某个通道接收了第一个ID为n的 Checkpoint Barrie

这个算子其他通道的ID 为n的 Checkpoint Barrie 还没到达

第2步：该算子将第一个ID为n的 Checkpoint Barrie 缓存

该个算子继续处理其他通道的ID为n的 Checkpoint Barrie

第3步:
该个算子所有通道的ID 为n的 Checkpoint Barrie 到达后
该算子执行快照

不进行 Barrier 对齐可以吗？



## 8 Checkpoint咋保证数据状态的一致性？

Flink内置的数据状态一致性

端到端的数据状态一致性

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/a6ed9a15fa598a23e85d79b55da82417.png)

### Flink 系统内部的数据状态一致性

#### AT-MOST-ONCE(最多一次，已废除)

发生故障，可能会丢失数据

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240806102651563.png)

#### AT-LEAST-ONCE(至少一次)

发生故障，可能会有重复数据。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/db47bfc00c9ac889309050c42ca68c6e.png)

#### EXACTLY-ONCE(精确一次)

发生故障，能保证不丢失数据，也没有重复数据

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/23fbdcf82ceafe270263ddcf499bbd19.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/6dcd22a7aac6fbe97151c6a2c432891e.png)

`KafkaSink` 总共支持三种不同的语义保证（`DeliveryGuarantee`）。对于 `DeliveryGuarantee.AT_LEAST_ONCE` 和 `DeliveryGuarantee.EXACTLY_ONCE`，Flink checkpoint 必须启用。默认情况下 `KafkaSink` 使用 `DeliveryGuarantee.NONE`。

- `DeliveryGuarantee.NONE` 不提供任何保证：消息有可能会因 Kafka broker 的原因发生丢失或因 Flink 的故障发生重复。
- `DeliveryGuarantee.AT_LEAST_ONCE`: sink 在 checkpoint 时会等待 Kafka 缓冲区中的数据全部被 Kafka producer 确认。消息不会因 Kafka broker 端发生的事件而丢失，但可能会在 Flink 重启时重复，因为 Flink 会重新处理旧数据。
- `DeliveryGuarantee.EXACTLY_ONCE`: 该模式下，Kafka sink 会将所有数据通过在 checkpoint 时提交的事务写入。因此，如果 consumer 只读取已提交的数据（参见 Kafka consumer 配置 `isolation.level`），在 Flink 发生重启时不会发生数据重复。然而这会使数据在 checkpoint 完成时才会可见，因此按需调整 checkpoint 间隔。请确认事务 ID 的前缀（transactionIdPrefix）对不同的应用是唯一的，以保证不同作业的事务 不会互相影响！此外，强烈建议将 Kafka 的事务超时时间调整至远大于 checkpoint 最大间隔 + 最大重启时间，否则 Kafka 对未提交事务的过期处理会导致数据丢失。

## 9 Data Source 和 Sink 的容错保证

当程序出现错误的时候，Flink 的容错机制能恢复并继续运行程序。这种错误包括机器硬件故障、网络故障、瞬态程序故障等。

只有当 source 参与快照机制，Flink 才能保证对自定义状态的精确一次更新。下表列举了 Flink 与其自带连接器的状态更新的保证。

| Source                      | Guarantees                           | Notes                             |
| :-------------------------- | :----------------------------------- | :-------------------------------- |
| Apache Kafka                | 精确一次                             | 根据你的版本用恰当的 Kafka 连接器 |
| Amazon Kinesis Data Streams | 精确一次                             |                                   |
| RabbitMQ                    | 至多一次 (v 0.10) / 精确一次 (v 1.0) |                                   |
| Google PubSub               | 至少一次                             |                                   |
| Collections                 | 精确一次                             |                                   |
| Files                       | 精确一次                             |                                   |
| Sockets                     | 至多一次                             |                                   |

为保证端到端精确一次的数据交付（在精确一次的状态语义上更进一步），sink需要参与 checkpointing 机制。下表列举了 Flink 与其自带 sink 的交付保证（假设精确一次状态更新）。

| Sink                         | Guarantees          | Notes                                      |
| :--------------------------- | :------------------ | :----------------------------------------- |
| Elasticsearch                | 至少一次            |                                            |
| Opensearch                   | 至少一次            |                                            |
| Kafka producer               | 至少一次 / 精确一次 | 当使用事务生产者时，保证精确一次 (v 0.11+) |
| Cassandra sink               | 至少一次 / 精确一次 | 只有当更新是幂等时，保证精确一次           |
| Amazon DynamoDB              | 至少一次            |                                            |
| Amazon Kinesis Data Streams  | 至少一次            |                                            |
| Amazon Kinesis Data Firehose | 至少一次            |                                            |
| File sinks                   | 精确一次            |                                            |
| Socket sinks                 | 至少一次            |                                            |
| Standard output              | 至少一次            |                                            |
| Redis sink                   | 至少一次            |                                            |

