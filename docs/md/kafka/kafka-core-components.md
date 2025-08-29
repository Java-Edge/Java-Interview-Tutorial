# 别再死记硬背！一文看懂 Kafka 核心组件及其协作原理

## 0 Message

消息，是通信的基本单位，每个producer可以向一个topic发布一些消息

## 1  Producer & Consumer（客户端）

### 1.1 生产者（Producer）

向主题发布消息的客户端应用。生产者程序通常持续不断向一或多个主题发消息。

### 1.2 消费者（Consumer）

订阅这些主题消息的客户端应用程序。消费者也能同时订阅多个主题消息。

生产者和消费者统称为客户端（Clients）。可同时运行多个生产者和消费者实例，这些实例会不断向Kafka集群中的多个主题生产和消费消息。

## 2 Broker（服务器端）

Kafka服务端由称为Broker的服务进程构成，一个Kafka集群由多个Broker组成。

Broker负责：

- 接收和处理客户端发过来的请求
- 对消息进行持久化

虽多个Broker进程能运行在同一机器，但更常见做法是将不同Broker分散运行在不同机器。这样， 即使：

- 集群中某机器宕机
- 在它上面运行的所有Broker进程都挂

其他机器的Broker也依然能对外提供服务，Kafka高可用手段之一。

![](https://p.ipic.vip/wnih79.png)

## 3 Partitioning（分区）

物理概念，有序不可变的record序列，partition中的record会被分配一个自增长id（offset）。

一个topic中的消息数据按多个分区组织，partition是kafka消息队列组织的最小单位，一个partition可看做一个队列。

Q：虽副本机制保证数据持久化，但未解决Scalability伸缩性问题。虽有leader、follower副本，但若leader副本积累太多数据以至单台Broker无法容纳，咋办？

A：Kafka会把数据分割成多份，保存在不同Broker（即分区），类似其他分布式系统的分片、分区域等说法，如：

- MongoDB、ES的Sharding
- HBase的Region

但Partitioning是最标准名称。

Kafka分区就是将每个topic划成多个分区（Partition），每个Partition内是一组顺序的消息日志。Pro生产的每条消息只会被发送到一个分区，即向一个双分区的topic发一条消息，该消息：

- 要么在分区0
- 要么在分区1

### 副本与分区

`副本是在分区级别定义`。每个分区下可配置N个副本，但只能有1个领导者副本和N-1个追随者副本。

Pro向分区写消息，每条消息在分区中的位置信息由位移（Offset）数据来表征。
分区位移从0开始，假设一个Pro向一个空分区写10条消息，则这10条消息offset依次是0、1、2、…、9。

## 4 Topic

一个业务即一个Topic。
每条发布到Kafka集群的消息都有一个类别，该类别即称为Topic。物理上不同Topic的消息分开存储，逻辑上一个Topic的消息虽保存于一或多个broker，但用户只需指定消息的Topic即可生产或消费数据，不必关心数据存于何处。


数据主题，是Kafka中用来代表一个数据流的一个抽象，Kafka处理的消息源（feeds of messages）的不同分类。

发布数据时，可用topic对数据分类，也作为订阅数据时的主题。
一个Topic同时可有多个producer、consumer。
Topic可理解为一个队列，**生产者和消费者面向的都是同一topic**。

![](https://p.ipic.vip/rytuet.png)

## 5 Replication - 副本

`实现高可用的另一手段。`

为保证分布式可靠性，kafka 0.8开始对每个分区的数据进行备份（不同Broker上），防止其中一个Broker宕机而造成分区数据不可用。

### 5.1 冗余备份策略

每个partition被复制到其它服务器作为replication：

![](https://p.ipic.vip/0103vb.png)

同一partition的多个replication🈲在同一broker。

每个partition的replication中，有一个leader副本，0或多个follower副本：

- leader处理此分区所有读、写请求

- follower仅被动复制数据

leader宕机后，会从follower中选举新leader。副本数量可配置，副本保存相同数据，却也有不同：

### 5.1 分类

- 领导者副本（Leader Replica）：对外提供服务，与客户端程序交互
- 追随者副本（Follower Replica）：只被动追随领导者副本，不与外界交互

很多其他系统Follower副本可对外提供服务，如MySQL从库可处理读操作，但Kafka的Follower副本不对外提供服务。

### 5.2 工作机制

- 生产者总是向领导者副本写消息
- 而消费者总是从领导者副本读消息

Follower副本只做一件事：向Leader副本发请求，请求Leader把最新生产消息发给它，以保持与Leader同步。

### 5.3 为啥Kafka follower副本不对外提供读服务？

- kafka分区机制已让，读，从多个broker读，从而负载均衡。而不是MySQL的主从，压力都在主
- kafka保存的数据和数据库的性质有别：数据具有消费概念，是流数据，kafka是MQ，所以消费需位移，而DB是实体数据不存在这概念，若从kafka的follower读，消费端offset控制更复杂
- 对生产者，kafka可从配置控制是否等待follower对消息确认，若从follower读，也要所有follower都确认才可回复生产者，性能大降，若follower出问题也不好处理

主从分离与否，无绝对优劣，仅是架构设计，各有适用场景：

- Redis和MySQL都支持主从读写分离，和使用场景有关。读操作很多而写操作相对不频繁的负载类型，可添加很多follower横向扩展，提升读性能
- Kafka主要还是在消息引擎而不是以数据存储方式对外提供读服务，通常涉及频繁生产消息、消费消息，这不属于读多写少，因此读写分离方案在这场景不太适合

Kafka副本机制使用异步消息拉取，因此存在leader和follower之不一致性。若采用读写分离，要处理副本lag引入的一致性问题，比如如何实现read-your-writes、如何保证单调读（monotonic reads）以及处理消息因果顺序颠倒的问题。

如果不采用读写分离，所有客户端读写请求都只在Leader上处理，就没有这些问题。当然最后全局消息顺序颠倒的问题在Kafka中依然存在，常见解决办法：使用单分区，其他方案还有version vector，但Kafka没有提供。

社区正在考虑引入适度读写分离，如允许指定follower副本（主要是为考虑地理相近性）可对外提供读服务。

> Kafka的数据会保存到leader副本的log文件中并写入磁盘，随后follower副本会对数据进行同步。

## 6 Record

每条记录都有key、value、 timestamp三个信息：

![](https://p.ipic.vip/hag6et.png)

分区id+offset才可确定数据位置，分区内才有序！

## 7 ConsumerGroup - 消费组

每个Consumer属于一个特定的Consumer Group (可为每个Consumer 指定 group name, 若不指定 group name则属于默认的group)

- 消费者可使用相同的 `group.id` 加入一个组
- 每个Consumer实例属于一个ConsumerGroup
- 组的最大并行度是组中的消费者数量 ← 没有partition
- Kafka将topic的partition分配给组中的消费者，以便每个分区仅由组中的一个消费者使用
- Kafka保证消息只能由该组中的单个消费者读取。消费者可按存储在日志中的顺序查看消息
- 每个ConsumerGroup都有一个Coordinator(协调者），负责分配Consumer和Partition的对应关系，当Partition或是Consumer发生变更时，会触发reblance（重新分配），重新分配Consumer与Partition的对应关系

## 8 Coordinator

Consumer维护与Coordinator之间的心跳，这样Coordinator就能感知到Consumer状态。

当Consumer故障，及时触发rebalance。

## Kafka三层消息架构

- 第一层：主题层，每个主题可配置M个分区，每个分区又可配置N个副本
- 第二层：分区层，每个分区的N个副本中，只能有一个充当Leader，对外提供服务；其他N-1个是follower副本，只提供数据冗余之用
- 第三层：消息层，分区中包含若干条消息，每条消息的位移从0开始，依次递增

客户端程序只能与分区的Leader副本交互。

### Kafka Broker咋持久化数据？

使用消息日志（Log）保存数据，一个日志就是磁盘上一个仅能追加写（Append-only）消息的物理文件。因为只能追加写，避免了缓慢的随机I/O操作，改为性能较好的顺序I/O写，这也是实现Kafka高吞吐量的一大手段。

但若不停向一个日志写消息，最终也会耗尽磁盘，因此Kafka要定期删除消息。

### 咋删除？

通过日志段（Log Segment）机制。在Kafka底层，一个日志进一步细分成多个日志段，消息被追加写到当前最新的日志段中，当写满一个日志段后，Kafka会自动切分出一个新的日志段，并将老的日志段封存。Kafka后台定时任务定期检查老的日志段是否能被删除，从而回收磁盘空间。

## 消费者

点对点模型和发布订阅模型。

点对点指的是同一条消息只能被下游的一个消费者消费，其他消费者则不能染指。在Kafka中实现这种P2P模型的方法就是引入了**消费者组**（Consumer Group）。

消费者组，指的是多个消费者实例共同组成一个组来消费一组主题。这组主题中的每个分区都只会被组内的一个消费者实例消费，其他消费者实例不能消费它。

为什么要引入消费者组？主要为提升消费端吞吐量。多个消费者实例同时消费，加速整个消费端吞吐量（TPS）。这里的消费者实例可以是运行消费者应用的进程，也可以是一个线程，都称为一个消费者实例（Consumer Instance）。

消费者组里面的所有消费者实例不仅“瓜分”订阅主题的数据，而且更酷的是它们还能彼此协助。假设组内某个实例挂掉了，Kafka能够自动检测到，然后把这个Failed实例之前负责的分区转移给其他活着的消费者。这就是Kafka的重平衡Rebalance。大名鼎鼎且臭名昭著，由重平衡引发的消费者问题比比皆是。事实上，目前很多重平衡的Bug社区都无力解决。

每个消费者在消费消息的过程中，必然要有个字段记录它当前消费到了分区的哪个位置，即**消费者位移**（Consumer Offset）。这和上面所说的位移不是一个概念：

- 上面的“位移”表征的是分区内的消息位置，它是不变的，即一旦消息被成功写入到一个分区上，它的位移值就是固定的了
- 而消费者位移则不同，它可能是随时变化的，毕竟它是消费者消费进度的指示器。每个消费者有着自己的消费者位移，因此一定要区分这两类位移的区别

我喜欢把消息在分区中的位移称为分区位移，而把消费者端的位移称为消费者位移。

## 8 总结

- 消息：Record。Kafka是消息引擎，这里的消息就是指Kafka处理的主要对象
- 主题：Topic。主题是承载消息的逻辑容器，在实际使用中多用来区分具体的业务
- 分区：Partition。一个有序不变的消息序列。每个主题下可以有多个分区
- 消息位移：Offset。表示分区中每条消息的位置信息，是一个单调递增且不变的值
- 副本：Replica。Kafka中同一条消息能够被拷贝到多个地方以提供数据冗余，这些地方就是所谓的副本。副本还分为领导者副本和追随者副本，各自有不同的角色划分。副本是在分区层级下的，即每个分区可配置多个副本实现高可用
- 生产者：Producer。向主题发布新消息的应用程序
- 消费者：Consumer。从主题订阅新消息的应用程序
- 消费者位移：Consumer Offset。表征消费者消费进度，每个消费者都有自己的消费者位移

- 消费者组：Consumer Group。多个消费者实例共同组成的一个组，同时消费多个分区以实现高吞吐
- 重平衡：Rebalance。消费者组内某消费者实例挂掉后，其他消费者实例自动重新分配订阅主题分区的过程。这是Kafka消费者端实现高可用的重要手段。

![](https://img-blog.csdnimg.cn/20190824015715719.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

参考：

- https://www.zhihu.com/question/327925275/answer/705690755
- https://kafka.apache.org/documentation