---
typora-copy-images-to: images
---



# 作者

- 【11来了】：目前在读研究生，现处于研二，现在计划更新常用中间件系统性学习内容，2024年初会进行暑期实习面试，到时候会在公众号分享面试分析！
- 微信公众号：发送 `资料`  可领取当前已整理完毕的 Redis、JVM 、MQ 等系列完整 pdf！

![1704782139068](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704782139068.png)

- CSDN：https://blog.csdn.net/qq_45260619?spm=1011.2415.3001.5343



# 深入理解 ZooKeeper

![微信图片_20240107000830](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/微信图片_20240107000830.png)

ZooKeeper 笔记开始整理了，目前已经整理好了 Redis、JVM、RocketMQ 系统性学习的笔记，以及编程常用高频电子书，可以关注公众号【11来了】，发送 `资料`免费获取！

接下来从 ZooKeeper 运行原理、客户端工具 Curator、分布式架构中应用场景、生产案例几个方面来全面了解 ZooKeeper！关注我，及时收到最新推送！

## ZooKeeper 运行原理

### ZooKeeper 到底用来做什么？

当需要学习 ZooKeeper 的时候，我们去搜索学习资料的时候，通常会发现对于 ZooKeeper（以后简称 zk） 的介绍是这样的：

> ZooKeeper 是一个开源的分布式协调服务，它提供了一个中心化的服务，用于管理和协调分布式应用中的各种配置、信息和事件

那么知道了 zk 是一个 `分布式协调的服务`，他是怎么协调的呢？

就比如在 Kafka 中，如果 Kafka 的 Broker 挂掉之后，是如何被其他节点感知到的呢？这就是通过 zk 的 `监听机制` 来实现的，具体怎么实现的会在后边具体讲解



**那么一般用 ZooKeeper 去做什么事情呢？**

主要就是 4 件事情：`分布式锁`、`元数据管理`、`分布式协调`、`Master 选举`，接下来逐个细说：

- `分布式锁`：这个就不介绍了，就是多台机器同时访问一个资源时，需要对资源添加分布式锁，其实大多还都是使用的 Redis 的分布式锁，这是由于 zk 架构的原因，导致 zk 的分布式锁性能不如 Redis 的分布式锁
- `元数据管理`：zk 的这个功能使用的是最频繁的了，比如 Kafka、Canal，都是分布式架构，在分布式集群运行的时候，就需要有一个地方去 `集中式` 的存储和管理整个分布式集群的核心元数据，zk 就作为一个存放元数据的角色存在
- `分布式协调`：如果分布式集群中某个节点对 zk 中的数据做了更改，之后 zk 会去通知其他监听这个数据的人，告诉别人这个数据更新了，就利用到了 zk 的监听机制
- `选举 Master`：利用 zk 选举 Master 的原理其实和分布式锁是相似的，都是通过 `顺序临时节点` 来实现的，具体如何实现，之后也会讲到





**zk 在哪些系统中会使用呢？**

- 在 `分布式 Java 业务系统` 中需要使用到 `分布式锁` 的功能，虽然 zk 提供了分布式锁，但是大多数开发者还是会选择 Redis 的分布式锁，因为由于 zk 架构的原因，导致无法承载太高的写并发
- 在 `开源的分布式系统` 中，如 Dubbo、HBase、HDFS、Kafka、Canal、Solr
  - Dubbo 中使用 zk 作为注册中心，使用到了 zk 中 `元数据存储` 的功能
  - HDFS 中使用 zk 的 `Master 选举` 实现 HA（高可用） 架构
  - Kafka 中使用 `元数据存储`、分布式协调和通知的功能




**为什么需要使用 zk 集群呢？单机版 zk 不可以吗？**

单机版 zk 当然不行，可用性很差，如果单机 zk 挂掉了，就会导致所有依赖于 zk 的系统全部瘫痪，所以只能将 zk 集群部署！

在 zk 集群中，可以保证 zk 的高可用性，同时又需要注意在 zk 集群之间如何保证 `数据的一致性问题`

ZooKeeper 集群图如下：

![1704555729472](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704555729472.png)



**为什么要选择 zk 呢？**

zk 发展至今，经过了长达十多年的磨练，功能很全面并且存在的 bug 也很少，因此经常用在工业级的大规模分布式系统中：HDFS、Kafka、HBase 需要使用到 `元数据存储` 以及 `分布式协调` 的一些功能，都是引入了 zk！





### ZooKeeper 架构设计



**zk 应用于分布式架构中所需要具备的特性**

- 可以集群部署
- 顺序一致性：需要保证所有请求全部有序
- 原子性：在 zk 中写数据，要么都写成功，要么都失败
- 数据一致性：保证 zk 集群中所有机器的数据一致性
- 高可用：某台机器宕机，保证数据不丢失
- 实时性：一旦数据发生变更，要通知其他节点可以实时感知到




**zk 中的架构设计**

- `集群化部署`：3 台或 5 台机器组成一个集群，每台机器都在内存中保存了 zk 的全部数据，机器之间互相通信同步数据，客户端连接任何一台机器都可以
- `树形结构的数据模型`：znode，在内存中保存
- `顺序写请求`：所有写请求都会分配一个在 zk 集群中唯一的递增 id 编号，保证各种客户端发起的写请求都是有顺序的
- `高性能`：每台 zk 机器都是在内存中存放数据的，因此 zk 集群的性能是是很高的，如果让 zk 集群部署在高配置物理机上，一个 3 台机器的集群每秒抗下几万请求都是可以的
- `数据一致性`：任何一台机器收到了写请求都会将数据同步给其他机器，保证数据的一致性
- `高可用`：只要集群中没有超过一半的机器挂掉，都可以保证 zk 集群可用，例如 3 台机器可以挂 1 台、5 台机器可以挂 2 台






在 zk 集群中存在着三种角色：

- `Leader`：Leader 可以读写
- `Follower`：Followe 只能读，当 Follower 收到写请求的时候会转发给 Leader，还是通过 Leader 来写
- `Observer`：Observer 不能读也不能写，可以通过扩展 Observer 节点来提升 zk 集群的可读性（后边会细说）



**客户端是如何和 zk 集群建立连接的呢？**

当 zk 集群启动之后，分配好角色，客户端就可以和 zk 建立 TCP 长连接了，也就是建立了一个会话，可以通过心跳感知到会话是否存在，会有一个 sessionTimeout 的超时时间，如果客户端和 zk 之间的连接断开了，在这个时间之内可以重新连接上，就可以继续保持会话，否则，session 就超时了，会话会被关闭



**zk 中的数据模型**

zk 的核心数据模型就是 znode 树，写入 zk 内存中的就是一个一个的 znode

znode 的节点类型分为 3 种：

- `持久节点`：创建之后一直存在
- `临时节点`：只要客户端断开连接，节点就会被删除
- `顺序节点`：创建节点时，会添加全局递增的序号，经典应用场景是 `分布式锁`（顺序节点既可以是持久节点也可以是临时节点）






zk 中最核心的一个机制就是 `Watcher 监听回调`

通过该功能，客户端可以对 znode 进行 watcher 监听，当 znode 改变的时候，回调通知客户端，这个功能在 `分布式协调` 中是很有必要的

分布式系统的协调需求：分布式架构中的系统 A 监听一个数据的变化，如果分布式架构中的系统 B 更新了那个数据/节点，zk 会反过来通知系统 A 这个数据的变化







### ZooKeeper 中的分布式一致性协议 ZAB

zk 使用了 ZAB（ ZooKeeper Atomic Broadcast） 分布式一致性协议来保证在分布式系统中的所有节点可以 `保证数据一致性`

下边将从具体的功能出发，来介绍 `ZAB 协议的原理`！

**ZAB 协议如何实现主从同步机制？**

在 zk 集群中，只有 Leader 可以接收写操作，Follower 只可以读，Leader 收到写的事务请求后，会香所有的 Follower 发送一个 `事务操作的提议`，也就是 `Proposal`，当 Follower 收到 Proposal 之后，会先将数据的变更写入到磁盘的日志文件中，表示已经收到了 Proposal，之后会返回 Ack 给 Leader，当 Leader 收到了超过半数 Follower 的 Ack，之后 Leader 会先将数据写到自己的 znode 中（也就是写到内存中去，此时数据就可以被客户端感知到了），之后再给所有的 Follower 发一个 Commit 消息，让大家提交这个请求事务，Follower 收到 Commit 消息后，就会将磁盘中刚刚写入的数据往内存中的 znode 中写，之后客户端就可以读取到数据了

光读上边的字，可能看起来很头疼，可以通过下边这个图很清晰的了解整个流程：

![1704552506835](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704552506835.png)





**ZAB 协议如何实现崩溃恢复机制？**

下边将会介绍 zk 集群 `启动` 再到 `崩溃` 再到 `恢复` 整体的流程：

zk 集启动的时候，进入 `恢复模式`，选举一个 Leader 出来，然后 Leader 等待集群中过半的 Follower 跟他进行数据同步，只要过半的 Follower 完成数据同步，接着就退出恢复模式，可以对外提供服务了

此时，还没完成同步的 Follower 会自己去跟 Leader 进行数据同步的

之后会进入 `消息广播模式`，只有 Leader 可以接受写请求，但是客户端可以任意连接 Leader 或者 Follower，如果客户端连接到 Follower，Follower 就会将写请求转发给 Leader

Leader 收到写请求，就把请求同步给所有的 Follower，当超过半数的 Follower 都返回了 Ack，之后 Leader 先将数据写到自己的 znode 中，再给所有的 Follower 发一个 Commit 消息，让大家提交这个请求事务，Follower 收到 Commit 消息后，就会将磁盘中刚刚写入的数据往内存中的 znode 中写，之后客户端就可以读取到数据了

如果 Leader 宕机了，就会进入 `恢复模式`，重新选举一个 Leader，只要获得了过半的机器的投票，就可以成为 Leader

zk 集群中可以容忍不超过一半的机器宕机，就比如说一个集群有 3 台机器，那么最多允许 1 台机器宕机，剩下的 2 台选举 Leader，只要 2 台机器都认可其中一台机器当 Leader，也就是超过了集群一半的机器都认可，那么就可以选举这台机器作为 Leader

新的 Leader 等待过半的 Follower 跟他同步，之后重新进入 `消息广播模式`



以上就是 zk 集群恢复崩溃的整个流程了，当然我也花了一个流程图，更方便观看，如下：

![1704556288655](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704556288655.png)





主要就是分为 3 个阶段：

- 集群启动时：恢复模式，Leader 选举 + 数据同步
- 消息写入时：消息广播模式，Leader 采用 2PC 的过半写机制，给 Follower 进行同步
- 崩溃恢复：恢复模式，Leader/Follower 宕机，只要剩余机器超过一半，就可以选举新的 Leader



**下边来介绍一下 ZAB 协议中是如何采用 2PC 两阶段提交思想完成数据写入的：**

采用 `2PC 两阶段提交思想` 的 ZAB 消息广播流程：

每一个消息广播的时候，都是基于 2PC 的思想，先是发起事务提议 Proposal 的广播，各个 Follower 返回 Ack，当过半的 Follower 都返回 Ack 之后，Leader 就发送 Commit 消息到 Follower，让大家提交事务

这里的两阶段指的就是发送 `Proposal` 和 `Commit`！

发起一个事务 Proposal 之前，Leader 会分配一个全局唯一递增的事务 id（zxid），以此来严格保证顺序

Leader 会为每个 Follower 创建一个队列，里边存放要发给 Follower 的事务 Proposal，保证了一个同步的顺序性

Follower 收到事务 Proposal 之后，就立即写入本地磁盘日志中，写入成功后数据就不会丢失了，之后返回 Ack 给 Leader，当过半的 Follower 都返回 Ack，Leader 推送 Commit 消息给全部 Follower，让大家进行事务提交

![1704556482793](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704556482793.png)



**那么 zk 到底是 `强一致性` 还是 `最终一致性`？**

`zk 不是强一致的`，因为当 Leader 给 Follower 发送 Commit 消息之后，可能有的 Follower 提交成功了，有的还没有提交成功，这会导致 `短暂的数据不一致`

但是说 zk 是最终一致性也不太对，zk 官方给自己的定位是 `顺序一致性`，因为 Leader 会保证所有的事务 Proposal 同步到 Follower 上都是按照顺序来执行的





**ZAB 协议下可能存在的 `数据一致性问题`：**

在 ZAB 协议下有两种可能造成数据不一致的情况

- `第一种情况`：Leader 在收到过半 Follower 的 Ack 之后，Leader 就会 Commit，如果 Leader 在自己 Commit 之后，还没来得及给 Follower 发送 Commit 就挂掉了，此时 Leader 和所有的 Follower 的数据都是不一致的

  所以在 Leader 崩溃的时候，就会选举一个拥有最大 `事务 id` 的机器作为 Leader，它需要去检查事务日志，如果发现自己磁盘日志里有一个 Proposal 并且没有提交，说明肯定是之前的 Leader 没来得及发送 Commit 就挂掉了，此时新选举的 Leader 就为这个 Proposal 发送 Commit 到其他所有的 Follower 中去，这样就保证了老 Leader 提交的事务最终可以同步到所有的 Follower 中去

  ![1704556724368](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704556724368.png)

- `第二种情况`：Leader 收到客户端请求，结果还没来得及给 Follower 发送 Proposal 就挂了，此时这个 Leader 上的 Proposal 请求应该是要被丢弃的，这种情况下，当新的 Leader 选举出来之后，老的 Leader 作为 Follower 重新启动，看到自己的磁盘日志有一个事务 Proposal，并且发现这个 Proposal 其实不应该存在，那么直接丢弃就可以了

  ![1704556729887](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704556729887.png)

**那么在 `第二种情况` 中，需要丢弃的消息是如何在 ZAB 协议中进行处理的？**

每一条事务的 zxid ，也就是 zk 内部的事务 id，用来标识在 zk 上执行的事务，zxid 时全局唯一并且递增的，共 64 位：

- 高 32 位是 Leader 的 epoch，可以看作是 Leader 的版本，每次选举一个新的 Leader 时，Epoch 都会递增
- 低 32 位标识在当前 Leader 的任职期间内发生的事务计数，每当 Leader 处理一个事务，就会增加 1，每当 epoch 变化，低 32 位就会从 0 开始计数

`丢弃消息判断`：如果 Leader 没有来得及给 Follower 发送 Proposal 就挂掉了，那么新的 Leader 选举出来之后，它的 epoch 会增长 1，老的 Leader 成为 Follower 之后，发现自己比新的 Leader 多一条 Proposal，并且 Proposal 的 epoch 比新 Leader 的 epoch 要小，那么直接丢弃即可







### ZooKeeper 集群读写性能及生产环境参数配置

**zk 中的 Observer 节点在集群中到底发挥着什么作用？**

zk 集群其实是适合 `写少读多` 场景的，因为整个集群只有 1 个 Leader 可以写，对于集群的读性能，可以通过 `添加 Observer 节点来增强`

Observer 节点Observer 是只读的、不参与 Leader 选举、也不参与 ZAB 协议同步时过半 Ack 的环节，只是单纯的接收数据，同步数据，达到数据顺序一致性的效果

Observer 的作用就是提供读服务，`当读并发请求过高时，可以通过不断添加 Observer 节点来分散读请求的压力`

那这里可能大家就会有问题了：`既然想要增强读的性能，多添加点 Follower 节点不就可以了吗？`

其实不行的，zk 是适合于 `小集群部署` 的，这是因为在集群中 Leader 完成写请求是需要经过半数以上的 Follower 都 Ack 之后，才可以成功写入的，如果集群中 Follower 过多，会大大增加 Leader 节点等待 Follower 节点发送 Ack 的时间，导致 zk 集群性能很差，因此 zk 集群部署一般都是 3 台或者 5 台机器

如下图，zk 集群部署为 1 主 2 从，通过添加 Observer 可以不断提升读性能：

![1704680378748](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704680378748.png)



**zk 集群的性能瓶颈在哪里呢？**

瓶颈在于 Leader 的 `写性能`，如果 zk 集群挂掉的话，那么很有可能就是 Leader 的写入压力过大，这对一个公司的技术平台打击是巨大的，因为像 kafka 之类的技术都是强依赖 zk 的，dubbo + zk 去做服务框架的话，当服务实例达到上万甚至几十万时，大量服务的上线、注册、心跳的压力达到了每秒几万甚至十万，单个 Leader 抗几万的请求还行，十几万的话 zk 单个 Leader 是扛不住这么多的写请求的

想要提升 Leader 的 `写性能`，目前来说也就是提升部署 zk 的机器性能了，还有一种方式也就是将 dataLogDir 目录挂载的机器上配置 SSD 固态硬盘，以此来提升事务日志 `写速度` 来提升写性能（这个在后边将 zk 核心参数 dataLogDir 时会讲到）！



**zk 集群推荐机器配置：**

zk 作为 `基础架构类别` 的系统，对于部署的机器要求还是比较高的

推荐配置：3 台机器，8 核 16G 或者  16 核 32G，三台机器的小集群每秒抗十几万的并发读是没有问题的

zk 版本选择一般使用 `3.4.5` 版本



**不同机器配置所能承载的并发量都是不同的：**

在 3 台机器组成的 zk 集群中，1 个 Leader 抗几万 `并发写` 是可以的，每秒抗 5~10 万的 `并发读` 是没有问题的

zk 集群中，写性能无法提升，读性能提升可以通过添加 Observer 节点来实现





**如何合理设置 ZooKeeper 的 JVM 参数以及内存大小？**

JVM 参数设置的话，主要设置三个方面：`堆内存`、`栈内存`、`Metaspace 区域的内存`

机器如果有 16G 的内存：

- 堆内存可以分配 10G
- 栈内存可以分配每个线程的栈大小为 1MB
- Metaspace 区域可以分配个 512MB

垃圾回收器的话，如果是大内存机器，建议使用 G1，并且记得设置 G1 的参数（生产环境参数配置），G1 参数的设置是很重要的，包括对于 GC 日志写入位置以及 OOM 内存快照存储位置，这都是事故后分析所需要的，必须要设置：

- `Region 的大小`
- `预期的 GC 停顿时间`
- `设置 GC 日志写入哪里`：方便可以监控 GC 情况
- `如果发生 OOM，将 dump 出来的内存快照放到哪个目录`：可以在发生 OOM 时，通过分析堆内存快照迅速找出来问题



> 建议在 zk 启动之后，在运行高峰期时，使用 `jstat` 观察一下 jvm 运行的情况：新生代对象增长速率、Young GC 频率、老年代增长速率、Full GC 频率

这里简单说一下，怎么使用 jstat 来查到 zk 中 jvm 的运行情况

首先，要通过 `ps -ef | grep zookeeper` 来查出来 zk 的进程 id

再去使用 `jstat -gc <进程id> 250 100` 来查看 jvm 运行情况，250 100 表示采样间隔为 250 ms，采样数为 100，输出如下：

![1704681177526](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704681177526.png)

这些参数的含义为：

- S0C：年轻代中第一个survivor（幸存区）的容量 （单位kb）
- S1C：年轻代中第二个survivor（幸存区）的容量 (单位kb)
- S0U ：年轻代中第一个survivor（幸存区）目前已使用空间 (单位kb)
- S1U ：年轻代中第二个survivor（幸存区）目前已使用空间 (单位kb)
- EC ：年轻代中Eden的容量 (单位kb)
- EU ：年轻代中Eden目前已使用空间 (单位kb)
- OC ：Old代的容量 (单位kb)
- OU ：Old代目前已使用空间 (单位kb)
- MC：metaspace的容量 (单位kb)
- MU：metaspace目前已使用空间 (单位kb)
- CCSC：压缩类空间大小
- CCSU：压缩类空间使用大小
- YGC ：从应用程序启动到采样时年轻代中gc次数
- YGCT ：从应用程序启动到采样时年轻代中gc所用时间(s)
- FGC ：从应用程序启动到采样时old代(全gc)gc次数
- FGCT ：从应用程序启动到采样时old代(全gc)gc所用时间(s)
- GCT：从应用程序启动到采样时gc用的总时间(s)



### ZooKeeper 中的核心参数讲解



**zk 一般必须要配置的核心参数说明（在 zoo.cfg 中配置）：**

- `tickTime`：zk 里的最小时间单位，默认 2000 ms，其他的一些参数就会以这个 tickTime 为基准来设置，如 tickTime * 2

- `dataDir`：存放 zk 里数据快照的目录，包括了事务日志以及快照文件，用于在 zk 重启时恢复之前内存中的数据

- `dataLogDir`：主要放一事务日志数据，写数据是通过 2PC 来写的，每台机器都会写入一个本地磁盘的事务日志（Proposal）

  有些情况下，可能想要将事务日志文件单独放在一个目录，可以指定该参数

  （默认情况下，zk 的事务日志与快照文件都会存储在 `dataDir` 目录下）

**dataLogDir 的机器最好挂载 SSD 固态硬盘，读写速度非常快，而 zk 集群写操作必须要保证一半以上机器都写成功事务日志，因此事务日志的 `磁盘写速度` 对 zk 的写性能影响很大的**





**影响 Leader 和 Follower 组成集群运行的两个核心参数说明：**

- `initLimit`：表示 Leader 在启动之后会等待 Follower 跟自己建立连接以及同步数据的最长时间，默认值 10，表示 `10 * tickTime` 即最长等待 20 s
- `syncLimit`：表示 Leader 和 Follower 之间心跳的最长等待时间，默认值 5，表示 `5 * tickTime = 10s`，如果超过 10s 没有心跳，Leader 就把这个 Follower 踢出去





**zk 中的数据快照**

zk里的数据分成两份：一份是在磁盘上的事务日志，一份是在内存里的数据结构，理论上两份数据应该是一致的，但是 Follower 宕机可能会导致数据的丢失：

- Follower 宕机，导致内存里的数据丢失了，但是磁盘上的事务日志还存在，可以根据磁盘的日志来恢复内存中的数据
- Follower 没收到事务日志就宕机了，也可以在启动之后找 Leader 去同步数据

那么为了保证在 Follower 重启之后，可以恢复宕机前内存中的数据，就引入了 zk 的 `数据快照机制`：

每当执行一定的事务之后，就会把内存里的数据快照存储到 dataDir 目录去，作为 zk 当前的一个数据快照



**zk 机器在重启时如何根据数据快照进行内存数据的重建呢？**

就比如说已经执行了 1030 个事务，在执行到 1000 个事务的时候，zk 存储了一份快照到 dataDir 目录中去，后边又执行了 30 个事务，后边执行的 30 个事务在磁盘的事务日志中有一份存档，但是并没有在刚刚存储的快照中，那么 zk 在重新启动的时候，会先加载快照，将快照中的数据恢复到内存中去，也就是先恢复 1000 个事务的数据，之后执行的 30 个事务可以在内存中 `重放` 一遍，就可以将重启之前内存中的数据全部恢复了，简化一下整理流程也就是：

1. 读取快照文件：加载最近的内存快照数据
2. 重放事务日志：将快照文件之后的事务日志进行`重放`（重放也就是对事务日志重新执行一边），将数据恢复到内存中去
3. 对外提供服务

当然，还是画一份图，方便更快理解：

![1704682460186](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704682460186.png)



**数据快照相关`参数`设置：**

zk 存储快照的频率是由 `snapCount` 来控制的，默认是执行 10 万个事务，存储一次快照，如果没到 10 万个事务，就重启了，此时并没有存储快照，因为 10 万个事务以内，直接读取磁盘中的事务日志事件还是可以接受的，不需要快照，将这部分没有快照的事务日志回放到内存就可以重建内存数据了





**一台机器上最多能启动多少个 zk 客户端？**

zk 客户端指的是，比如我们在一台机器上运行 Kafka、Canal、HDFS，就拿 Canal 来举例，将 Canal 部署在一台机器上之后，它会去使用 zk，那么这个 Canal 就作为 zk 的客户端去跟 zk 服务端进行通信了

那么在一台机器上，可以创建多少个 zk 客户端和 zk 的服务端去进行连接可通信呢？

默认一台机器上最多创建 60 个 zk 客户端，3.4.0 之前是 10 个

**为什么要注意这个呢？**

就比如我们自己去开发一个系统使用 zk 的话，在一台机器上，我们要注意不要去无限制的创建 zk 客户端，可能有些时候创建 zk 客户端的时候 `没有注意使用单例`，如果并发多个请求时，对每个请求都建立一个 zk 的客户端，会被 `zk 的服务端给拒绝连接`！





**一个 znode 最多可以存储多少数据呢？**

通过参数 `jute.maxbuffer` 来控制，一个 znode 最多可以存储 1MB 的数据

  





**运行时 Leader 和 Follower 通过哪两个端口通信？**

- 机器的 `3888` 端口，用于集群恢复模式时，进行 Leader 选举投票的
- 机器的 `2888` 端口，用于 Leader 和 Follower 之间进行数据同步和运行时通信的





**zk 中的数据快照如何定时清理?**

- `autopurge.purgeInterval`：定义自动清理任务的间隔时间，以小时为单位，每次清理 zk 会检查并删除超过 autopurge.snapRetainCount 指定数量的快照文件，默认是 1，即每隔 1 小时清理一次
- `autopurge.snapRetainCount`：指定 zk 中保留的快照文件数量，当快照文件数量超过这个值时，最旧的快照文件将被自动删除，默认是 3

上边这两个参数，在默认情况下是没有打开的，通过这两个参数可以定时清理 zk 中的数据快照，避免磁盘空间被占满

```bash
# 如果需要打开，配置如下
autopurge.snapRetainCount=3
autopurge.purgeInterval=1
```





**Leader 相关的参数：**

- `leaderServers`：表示 Leader 是否接收客户端的连接，如果设置为 no，那么写请求将会由 Follower 转发给 Leader，默认 yes
- `cnxTimeout`：在 Leader 选举的时候，各个机器会基于 3888 端口建立 TCP 连接，该参数表示建立 TCP 连接的超时时间，默认 5000ms





### ZooKeeper 中常用运维及使用命令



**zk 运维常用命令：**

命令执行模板：`echo [参数] | nc localhost 2181`，常用参数如下：

- conf：查看当前 zk 配置
- cons：查看连接的数量
- crst：重置客户端统计
- dump：输出会话
- envi：查看环境
- ruok：检查节点是否正在运行
- stat：查看运行时状态
- srst：重置服务器统计
- wchs：查看 watcher 信息
- wchc：输出 watcher 详细信息
- wchp：输出 watcher，以 znode 为单位分组
- mntr：输出比 stat 更加详细




**基于 jstat 命令监控和检查 zk 的 JVM 运行情况：**

```bash
# 先查询 zk 的进程 id
ps -ef | grep zookeeper
# 进程 ID 515460 ，采样间隔 250 ms，采样数 4
jstat -gc 515460 250 4
```





**开启 zk 的 JMX 端口以及使用 JConsole 观察 JVM 内存使用：**

zk 中启动 JMX 功能，可以去暴露一组端口，以供监控和管理 Java 应用程序

在 `zkServer.sh` 中，找到 `ZOOMAIN` 变量，将 ZOOMAIN 后边的内容替换为下边的三条内容：

```bash
-Dcom.sum.management.jmxremote.port=21811
-Dcom.sum.management.jmxremote.ssl=false
-Dcom.sum.management.jmxremote.authenticate=false
```

打开 JMX 端口之后，就可以通过 JDK 自带的可视化 JVM 进程内存分析工具 `JConsole` 进行内存分析了





**zk 操作常用命令：**

```bash
# 启动服务端
sh zkServer.sh start
# 启动客户端
sh zkCli.sh
# 创建 test 节点，数据为 1010
create /test 1010
# 查看目录 
ls /
# 读取数据
get /test
# 更新数据
set /test 1020
# 删除节点
delete /test
```





### ZooKeeper 客户端工具 Curator 常用功能

目前，业内使用最广泛的 zk 客户端框架为：Curator

Curator 是由 Netflix 开源出来的，提供了丰富的操作 zk 的 API

如果想使用 Curator，需要引入的 maven 依赖如下（zk 使用 3.4.5 版本，对应 curator 框架版本 2.4.2）：

> 目前 Curator 官网说最新版本的 Curator 已经取消了对 zookeeper 3.4.x 的支持，不过原理都是一致的，先了解原理，再看源码就很容易看懂

```xml
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-framework</artifactId>
    <version>2.4.2</version> 
</dependency>
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-recipes</artifactId>
    <version>2.4.2</version> 
</dependency>
```





**Curator 连接 zk 使用示例如下：**

```java
public class CuratorZkExample {
    public static void main(String[] args) {
        // 创建一个 CuratorFramework 实例
        CuratorFramework client = CuratorFrameworkFactory.newClient(
                "localhost:2181", // ZooKeeper 服务器地址
                5000, // 客户端跟 zk 进行心跳，如果心跳断开超过 5 秒，绘画就会断开
                3000, // 连接 zk 的超时时间
                new ExponentialBackoffRetry(1000, 3) // 重试策略，1秒后重试，最多重试3次
        );

        // 启动客户端
        client.start();

        try {
            // 创建一个 ZooKeeper 节点
            String path = "/example/path";
            client.create().creatingParentsIfNeeded().forPath(path, "data".getBytes());

            // 获取节点数据
            byte[] data = client.getData().forPath(path);
            System.out.println("Node data: " + new String(data));

            // 更新节点数据
            byte[] newData = "new data".getBytes();
            client.setData().forPath(path, newData);

            // 读取更新后的节点数据
            data = client.getData().forPath(path);
            System.out.println("Updated node data: " + new String(data));

            // 删除节点
            client.delete().forPath(path);

            Thread.sleep(Integer.MAX_VALUE);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭客户端
            client.close();
        }

    }
}
```





**zk 一般如何实现元数据存储？**

一般是将元数据转成 `json 字符串`，去创建一个 znode，将元数据的 json 串写到这个 znode 的值中，如果需要就直接从这个 znode 中读取即可



**下边主要讲解一下 Curator 中常用的一些功能如何使用：**

**Curator 中 Leader 的选举**

Curator 的 Leader 选举机制有两种：

- Leader Latch
- Leader Elction




**Leader Latch 使用讲解：**

首先创建一个 Leader Latch 如下，在 `/leader/latch` 目录下创建节点进行 Leader 的选举：

```java
LeaderLatch leaderLatch = new LeaderLatch(client, "/leader/latch");
```

所有竞选 Leader 目录为 `/leader/latch` 的节点会进行协商，选择一个 Leader 出来，可以通过 `hasLeaderShip` 判断自己是否时 Leader：

```java
System.out.println("是否成为 Leader：" + leaderLatch.hasLeadership());
```

调用 `start` 方法之后，节点会开始竞选 Leader，之后阻塞在 `await` 方法上，直到成为 Leader 之后，才可以执行 await 之后的代码：

```java
// 开始竞选 Leader
leaderLatch.start();
// 阻塞等待成为 Leader
leaderLatch.await();
// 执行 Leader 操作
...
// 将当前实例从 Leader 选举中关闭
leaderLatch.close();
```



完整代码如下：

```java
public class LeaderLatchDemo {
    public static void main(String[] args) throws Exception {
        // 创建一个 CuratorFramework 实例
        CuratorFramework client = CuratorFrameworkFactory.newClient(
                "localhost:2181", // ZooKeeper 服务器地址
                new ExponentialBackoffRetry(1000, 3) // 重试策略，1秒后重试，最多重试3次
        );
        // 启动客户端
        client.start();
        LeaderLatch leaderLatch = new LeaderLatch(client, "/leader/latch");
        leaderLatch.start();
        leaderLatch.await();
        System.out.println("是否成为 Leader：" + leaderLatch.hasLeadership());
        leaderLatch.close();
    }
}
```



**Leader Election 使用讲解：**

使用 Leader Election 时，需要先创建 `LeaderSelector` 实例，之后调用 `start` 方法去启动竞选，当成为 Leader 之后，在 LeaderSelector 中注册的监听器中的 `takeLeadership` 方法将会被调用，在该方法中执行 Leader 所需要的操作，执行完毕之后，当方法退出时，就意味着当前实例放弃了 Leader 地位，完整代码如下：

```java
public class LeaderElectionDemo {
    public static void main(String[] args) throws Exception {
        // 创建一个 CuratorFramework 实例
        CuratorFramework client = CuratorFrameworkFactory.newClient(
                "localhost:2181", // ZooKeeper 服务器地址
                new ExponentialBackoffRetry(1000, 3) // 重试策略，1秒后重试，最多重试3次
        );
        // 启动客户端
        client.start();
        LeaderSelector leaderSelector = new LeaderSelector(client, "/leader/selector", new LeaderSelectorListener() {
            @Override
            public void takeLeadership(CuratorFramework curatorFramework) throws Exception {
                System.out.println("你已经成为 Leader");
                // 在这里做 Leader 要做的事情，此时不能让方法退出
                Thread.sleep(Integer.MAX_VALUE);
            }
            @Override
            public void stateChanged(CuratorFramework client, ConnectionState newState) {
                System.out.println("连接状态发生变化");
                if (newState.equals(ConnectionState.LOST)) {
                    throw new CancelLeadershipException();
                }
            }
        });
        leaderSelector.start();
        Thread.sleep(Integer.MAX_VALUE);
    }
}
```







**Curator 实现分布式锁原理：**

Curator 实现 zk 的分布式锁，就是通过 `临时顺序节点` 实现

简单来说，就是所有人去竞争一个锁

指定一个锁的目录，在此目录下创建一个临时顺序节点

如果是第一个节点的话，表示获取到了锁

如果不是第一个节点，就对上一个节点加一个监听，上一个节点释放锁之后，第二个节点会得到通知，就去拿到锁

![1704765875845](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704765875845.png)







**Curator 提供的节点监听机制：**

Curator 事件有两种模式：

- `标准的观察模式`，使用 Watcher 监听器


- `缓存事件监听`，类似于将本地缓存视图和 ZooKeeper 视图进行对比的过程，Curator 提供了 3 个接口：
  - Path Cache：对指定路径的子目录进行监听，不监听该节点
  - Node Cache：对一个节点进行监听
  - Tree Cache：对整个目录进行监听



**Watcher 监听器处理事件：**

需要定义一个事件，再通过 `usingWatcher` 即可对某个路径进行监听

```java
Watcher watcher = new Watcher() {
    @Override
    public void process(WatchedEvent watchedEvent) {
        log.info("监听器watchedEvent：" + watchedEvent);
    }
};

byte[] content = client.getData().usingWatcher(watcher).forPath("/test/watcher");
System.out.println(new String(content));
```



利用 Watcher 对节点进行监听的话，缺点就是只可以监听 1 次，监听到 1 次事件之后这个监听器就会失效

如果要反复监听，那么就需要反复调用 `usingWatcher` 来注册



**缓存事件监听：**

PathCache 和 NodeCache 接口的使用都放在下边（这里使用的 Curator 客户端版本为 2.4.2，因此还没有 Tree Cache 功能，这里就不演示了）：

```java
// Path Cache 监听
public static void main(String[] args) throws Exception {
    // 创建一个 CuratorFramework 实例
    CuratorFramework client = CuratorFrameworkFactory.newClient(
            "localhost:2181", // ZooKeeper 服务器地址
            new ExponentialBackoffRetry(1000, 3) // 重试策略，1秒后重试，最多重试3次
    );
    // 启动客户端
    client.start();
    PathChildrenCache pathChildrenCache = new PathChildrenCache(client, "/cluster", true);
    pathChildrenCache.getListenable().addListener(new PathChildrenCacheListener() {
        @Override
        public void childEvent(CuratorFramework curatorFramework, PathChildrenCacheEvent pathChildrenCacheEvent) throws Exception {
            System.out.println("监听到子节点发生变化，收到事件：" + pathChildrenCacheEvent);
        }
    });
    pathChildrenCache.start();
    Thread.sleep(Integer.MAX_VALUE);
}


// NodeCache 监听
public static void main(String[] args) throws Exception {
    // 创建一个 CuratorFramework 实例
    final CuratorFramework client = CuratorFrameworkFactory.newClient(
            "localhost:2181", // ZooKeeper 服务器地址
            new ExponentialBackoffRetry(1000, 3) // 重试策略，1秒后重试，最多重试3次
    );

    // 启动客户端
    client.start();
    final NodeCache nodeCache = new NodeCache(client, "/nodecache");
    nodeCache.getListenable().addListener(new NodeCacheListener() {
        @Override
        public void nodeChanged() throws Exception {
            Stat stat = client.checkExists().forPath("/nodecache");
            if (stat != null) {
                byte[] bytes = client.getData().forPath("/nodecache");
                System.out.println("节点数据发生变化" + new String(bytes));
                System.out.println();
            } else {
                System.out.println("节点被删除...");
            }
        }
    });
    nodeCache.start();
    Thread.sleep(Integer.MAX_VALUE);
}
```











**ZooKeeper 客户端功能总结：**

使用客户端工具 Curator 主要是用来做节点的 CRUD + 监听 + Leader 选举，用在分布式业务系统中

其中 Curator 提供的像 Barrier、分布式计数器、分布式队列这些功能使用场景很少，并且同样的功能还有更好的选择

比如更推荐使用 Redis 做分布式计数、RabbitMQ/RocketMQ 做分布式队列！







### Curator 中的分布式读写锁应对羊群效应

先看使用示范：

```java
public class ReadWriteLockDemo {
    public static void main(String[] args) throws Exception {
        // 创建一个 CuratorFramework 实例
        CuratorFramework client = CuratorFrameworkFactory.newClient(
                "localhost:2181", // ZooKeeper 服务器地址
                5000, // 客户端跟 zk 进行心跳，如果心跳断开超过 5 秒，绘画就会断开
                3000, // 连接 zk 的超时时间
                new ExponentialBackoffRetry(1000, 3) // 重试策略，1秒后重试，最多重试3次
        );

        // 启动客户端
        client.start();

        InterProcessReadWriteLock readWriteLock = new InterProcessReadWriteLock(
                client,
                "/locks/lock");
		// 写锁
        InterProcessMutex writeLock = readWriteLock.writeLock();
        writeLock.acquire();
        writeLock.release();

        // 读锁
        InterProcessMutex readLock = readWriteLock.readLock();
        readLock.acquire();
        readLock.release();
    }
}
```





**Curator 如何实现已有写锁之后无法加读锁？**

读写锁的特性就是，读锁之间不互斥，而读锁和写锁之间互斥

- 当添加 `读锁` 时，如果排在第一个写锁前，就直接加锁，否则，监听第一个写锁
- 当添加 `写锁` 时，如果是第一个则直接加锁，否则对前一个节点添加监听

其实在 Curator 中添加读写锁的时候，会去我们指定的目录 `/locks/lock` 中去创建读锁和写锁的节点，读锁是以 `__READ__` 开头，写锁以 `__WRIT__`  开头，在尝试加锁时，会将该目录下的所有节点排序，去判断是否 `符合获取锁的要求`，拿下边举个例子：

- 假如节点排序之后为：[读锁，读锁，读锁，写锁，读锁]，那么最后一个 `读锁` 没办法获取锁，需要等待第 3 个 `写锁` 释放后，才可以拿到锁
- 假如节点排序之后为：[写锁，写锁，读锁，读锁，读锁]，则所有 `读锁` 需要等待前边两个 `写锁` 释放才可以拿到





**Curator 读写锁针对 `羊群效应`的优化：**

首先说一下 `羊群效应` 是什么：

就比如多个机器对同一个节点进行加锁，加锁顺序为：[锁，锁，锁，锁]，如果后边所有的锁都对第一把锁进行监听，当第一把锁释放了之后，会去通知后边所有机器可以去竞争锁了，这样存在一个问题就是如果有几十个节点竞争同一把分布式锁，那么[锁，锁，锁...]，几十个节点都去监听第一把锁，当第一把锁释放后，需要去通知很多节点，这会导致 `网络瞬时流量` 很高，这就是 `羊群效应`

**Curator 是怎么解决羊群效应的呢？**

- 对于 `普通互斥锁` 来说，节点排序之后为：[锁，锁，锁，锁]，每把锁都去 `监听自己的上一个节点`，即第二把锁监听第一把锁，第三把锁监听第二把锁，从而避免羊群效应
- 对于 `读写锁` 来说，节点排序之后为：[读锁，写锁，读锁，读锁]，每把读锁都去 `监听第一个写锁`，每把写锁都监听前一个节点，这样避免羊群效应



**Curator 读写锁目前 `仍然存在羊群效应` 以及优化思路：**

假如节点排序之后为：[写锁，写锁，读锁，读锁，读锁，写锁，读锁，读锁]

如果所有读锁都去 `监听第一个写锁`，那么第一个写锁释放后会去通知大量的读锁

`优化思路`：让读锁都去监听离自己最近的一个写锁，如中间的 3 个读锁去监听第 2 个写锁，最后的 2 个读锁去监听第 6 个写锁





**面试中如何聊分布式锁？**

**`在面试中`**，和面试官聊分布式锁，可以从 Curator 源码实现思路出发，以及存在问题

最后总结一下，Curator 获取读写锁的思路也很简单

- 如果添加 `读锁`，就去判断前边是否有写锁，如果有写锁，就 `监听` 这把写锁并且 `阻塞` 等待写锁释放，否则可以直接获取锁
- 如果添加 `写锁`，判断前边是否有读锁，如果有读锁，就 `监听` 这把读锁并且 `阻塞` 等待读锁释放，否则可以直接获取锁

获取读锁和写锁都是在指定的目录中创建 `临时顺序节点`

那么存在的问题就是 `羊群效应`，再说一下 Curator 如何解决羊群效应以及仍然存在羊群效应，如何再进一步优化！

















###  Curator 建立与 ZK 的连接源码分析及经典面试题

> 这里由于 ZooKeeper 版本使用的 3.4.5，因此 Curator 框架的版本使用的 2.4.2，虽然版本有些变动，但是建立连接这些代码变动不大

**为什么要学习 Curator 客户端框架源码呢？**

因为在 ZooKeeper 中其实是提供了一套 `原生的客户端框架`，基本的功能都具有但是使用起来比较复杂

Curator 就是对 zk 原生的客户端工具进行了封装，再向外提供更好用的 API，以及更加强大的功能如 Leader 选举

如果只是光会使用 Curator，那么当去看一些开源项目的时候，他们其实使用的是 zk 的原生客户端工具，那可能看起来就比较困难了

另一方面是通过研究源码，可以了解到一些高阶的功能如 `分布式锁` 是如何通过最底层的 zk 操作来实现的，并且在实际生产环境中，如果碰到了问题，可以很快定位到问题所在



**接下来从 Curator 客户端如何与 zk 建立连接进行源码分析**

创建 Curator 客户端连接工具的代码如下：

```java
// 创建一个 CuratorFramework 实例
CuratorFramework client = CuratorFrameworkFactory.newClient(
        "localhost:2181", // ZooKeeper 服务器地址
        5000, // 客户端跟 zk 进行心跳，如果心跳断开超过 5 秒，绘画就会断开
        3000, // 连接 zk 的超时时间
        new ExponentialBackoffRetry(1000, 3) // 重试策略，1秒后重试，最多重试3次
);

// 启动客户端
client.start();
```



点进去这个 `newClient` 方法，这里其实用到了 `构造器模式`，通过 `builder()` 先去创建了一个 `Builder` 的构造器对象，再通过这个构造器对象去创建一个客户端实例

```java
public static CuratorFramework newClient(String connectString, int sessionTimeoutMs, int connectionTimeoutMs, RetryPolicy retryPolicy)
{
    // 使用了构造器模式
    return builder().
        connectString(connectString).
        sessionTimeoutMs(sessionTimeoutMs).
        connectionTimeoutMs(connectionTimeoutMs).
        retryPolicy(retryPolicy).
        build();
}
```



也就是通过 `build()` 最后去创建实例对象，在 build() 方法中，其实就是去创建了 `CuratorFrameworkImpl` 这个实例对象

```java
public CuratorFramework build()
{
    // 创建 CuratorFrameworkImpl 对象
    return new CuratorFrameworkImpl(this);
}
```



Curator 其实就是基于 ZooKeeper 原生的 API 进行封装的，我们可以找一下 `封装的原生客户端工具` 到底在哪里

点击进去 `CuratorFrameworkImpl` 构造方法中，先去创建了 ZookeeperFactory 这个对象

```java
public CuratorFrameworkImpl(CuratorFrameworkFactory.Builder builder)
    {
        // 创建 ZookeeperFactory 对象
        ZookeeperFactory localZookeeperFactory = makeZookeeperFactory(builder.getZookeeperFactory());
        this.client = new CuratorZookeeperClient
        (
            localZookeeperFactory,
            builder.getEnsembleProvider(),
            builder.getSessionTimeoutMs(),
            builder.getConnectionTimeoutMs(),
            new Watcher()
            {
               // ... 太长省略
            },
            builder.getRetryPolicy(),
            builder.canBeReadOnly()
        );
        // 构造一些对象 ...
    }
```



那么在这个 `makeZookeeperFactory` 方法中其实就是封装了 ZooKeeper 中原生的客户端对象

```java
private ZookeeperFactory makeZookeeperFactory(final ZookeeperFactory actualZookeeperFactory)
{
    return new ZookeeperFactory()
    {
        @Override
        // 这里就创建了原生的 ZooKeeper 对象
        public ZooKeeper newZooKeeper(String connectString, int sessionTimeout, Watcher watcher, boolean canBeReadOnly) throws Exception
        {
            ZooKeeper zooKeeper = actualZookeeperFactory.newZooKeeper(connectString, sessionTimeout, watcher, canBeReadOnly);
            AuthInfo auth = authInfo.get();
            if ( auth != null )
            {
                zooKeeper.addAuthInfo(auth.scheme, auth.auth);
            }

            return zooKeeper;
        }
    };
}
```



到此，`CuratorFramework` 实例对象就创建完成了，接下来通过 `start` 方法，来启动客户端

```java
// 启动客户端
client.start();
```



进入 start 方法

```java
@Override
public void     start()
{
    // ...
    try
    {
        // 启动一个线程，通过 while 循环不断去 eventQueue 中取事件，这个事件就是客户端跟 zk 之间发生了网络连接变化的事件，并且去逐个调用监听器中的方法 stateChanged
        connectionStateManager.start(); 
        client.start();
        executorService = Executors.newFixedThreadPool(2, threadFactory);  // 1 for listeners, 1 for background ops

        // 再启动一个线程
        executorService.submit
        (
            new Callable<Object>()
            {
                @Override
                public Object call() throws Exception
                {
                    // 负责处理后台操作队列中的任务，会尝试去操作队列中获取任务：OperationAndData，再去执行任务，包括创建节点、删除节点等等，并且如果客户端与 zk 的连接断开，在这里还会尝试重连操作
                    backgroundOperationsLoop();
                    return null;
                }
            }
        );
    }
    catch ( Exception e )
    {
        handleBackgroundOperationException(null, e);
    }
}
```



进入到 `backgroundOperationsLoop` 方法

```java
private void backgroundOperationsLoop()
{
    while ( !Thread.interrupted() )
    {
        OperationAndData<?>         operationAndData;
        try
        {
            // 取出操作任务
            operationAndData = backgroundOperations.take();
			// ...
        }
        // ...
        // 执行任务
        performBackgroundOperation(operationAndData);
    }
}
```



进入到执行任务的 `performBackgroundOperation` 方法，在这里如果正常连接，就执行取出来的操作任务，否则就去尝试重新连接

```java
private void performBackgroundOperation(OperationAndData<?> operationAndData)
{
    try
    {
        if ( client.isConnected() )
        {
            // 如果客户端正常连接 zk，就执行操作
            operationAndData.callPerformBackgroundOperation();
        }
        else
        {
            // 否则，在这里会进行重连
            client.getZooKeeper(); 
            // 如果连接超时，就抛出异常
            if ( operationAndData.getElapsedTimeMs() >= client.getConnectionTimeoutMs() )
            {
                throw new CuratorConnectionLossException();
            }
            // 如果还没有
            operationAndData.sleepFor(1, TimeUnit.SECONDS);
            // 如果没有超时，则推入到 forcedSleepOperations 强制睡眠后等待重连
            queueOperation(operationAndData);
        }
    }
    catch ( Throwable e )
    {
        // 【连接丢失】异常的处理
        if ( e instanceof CuratorConnectionLossException )
        {
            //
            WatchedEvent watchedEvent = new WatchedEvent(Watcher.Event.EventType.None, Watcher.Event.KeeperState.Disconnected, null);
            CuratorEvent event = new CuratorEventImpl(this, CuratorEventType.WATCHED, KeeperException.Code.CONNECTIONLOSS.intValue(), null, null, operationAndData.getContext(), null, null, null, watchedEvent, null);
            if ( checkBackgroundRetry(operationAndData, event) )
            {
                // 推送到 backgroundOperations 队列尝试重连
                queueOperation(operationAndData);
            }
            else
            {
                logError("Background retry gave up", e);
            }
        }
        else
        {
            handleBackgroundOperationException(operationAndData, e);
        }
    }
}
```











**为什么 zk 中不能采用相对路径来查找节点呢？**

由 zk 底层节点存储为了高性能的设计造成，因为 zk 的应用场景主要是直接定位 znode 节点，那么最适合的数据模型就是 `散列表`，因此在 zk 底层实现的时候，使用到了 `hashtable`，使用节点的 `完整路径` 来作为 key，因此无法通过相对路径来查找对应的节点 



**经典面试问题：为什么要使用分布式锁不用数据库的行锁呢？**

还是拿电商场景举例，业务系统多机部署，多个系统同时收到对同一个数据更新的请求，而这些数据可能在数据库、缓存集群、ES 集群都同时存储了一份，如果只使用数据库的 `行锁` 只能保证对数据库的操作是并发安全的，但是对其他缓存操作还是会出现问题，因此多个系统一定要去使用分布式锁，流程如下：

![1704768422246](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704768422246.png)



## ZooKeeper 工业级的场景



### zk 节点监听的 `经典应用场景`

- `配置中心`：可以将分布式业务系统中的配置放在 zk 中或者基于 zk 封装一个配置中心，并且对配置进行监听，如果配置发生变更，立马就可以通过 zk 通知到所有监听配置项的系统，从而可以及时响应

  就比如在分布式业务中需要 `降级`，打开一个降级开关，所有系统感知到之后，进行对应的降级处理

- `集群负载均衡`：对于需要进行负载均衡的机器去 zk 中注册自己，创建为临时节点，注册成 ip，如下图对于提供同一个服务的不同机器在同一个节点下边注册自己的 ip

  ![1704597652456](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704597652456.png)







### 基于 zk 如何实现分布式业务系统的 `配置中心`

分布式系统的配置中心，用于存储以下配置：

- 数据库配置信息、地址、用户名、密码
- 限流开关、手动降级开关

比如对 `手动降级开关` 来说，开发人员通过手动设置降级开关，而各个系统去监听这个降级开关的 znode，如果监听到，就对各个接口采取降级措施，整个配置中心的设计如下（这里只讲一下应用场景，具体也就是通过对节点的监听实现的，后边会讲到）：

![1704853032956](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704853032956.png)

















### 基于 ZK + ES 的日志中心架构设计

在业务系统中会部署很多台机器，由于日志过于分散，需要统一收集到 ES 中进行日志存储，并且可以通过可视化工作台方便开发人员随时检索日志，下边将会设计一个 `基于 ZK + ES 的日志中心系统`！



先来说一下日志中心的 `需求场景`：

日志中心系统需要集群部署，在各个业务系统中都有日志客户端，通过客户端自动把日志异步化写入到 Kafka 中去，对应不同的 Topic，日志中心系统为 Master-Slave 架构，Slave 负责从 Kafka 中消费某些 Topic 里的日志写入 ES，Master 负责给 Slave 分配对应要消费的 Topic

![1704853089752](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704853089752.png)



那么基于上边说的需求场景，我们需要在 zk 中存储这些数据：

- `需要收集的 Topic 列表`：通过这个值，日志中心才知道需要去 Kafka 中拉取哪些数据存入到 ES 集群中
  - 存入 zk 中的节点目录：/log-center/topics/#{topic}
- `日志中心节点列表`：日志中心系统的 slave 时集群化部署的，因此当 slave 节点上线之后需要去 zk 中注册自己的 ip+port，并且注册为 `临时节点`，这样也可以感知到 slave 节点的上下线，并且通过这个列表还可以对 slave 节点进行 `负载均衡` 处理
  - 存入 zk 中的节点目录：/log-center/slaves/#{host}
- `slave 节点的分组信息`：可以将多个 slave 节点分成一个组，相当于是多个 slave 节点属于一个 consumer group，可以并行去消费同一个 Topic 中的数据，加快消费速度
  - 存入 zk 中的节点目录：
    - /log-center/slave-groups/#{group01}/#{slave01}
    - /log-center/slave-groups/#{group01}/#{slave02}
    - /log-center/slave-groups/#{group02}/#{slave01}
- `每个 slave 分组所分配的 Topic`：表示这个 slave 分组需要去将哪些 Topic 数据给拉取并存入 ES 中
  - 存入 zk 中的节点目录：
    - /log-center/slave-groups/#{group01}/topics/#{topic}
    - /log-center/slave-groups/#{group02}/topics/#{topic}



 一个简略版本的日志中心系统就是需要在 zk 中存储这些值了，当然既然 slave 集群部署了，还可以在 zk 中存储每个 slave 节点的消费速率，以及在 Topic 中消费的偏移量 offset，这样如果有某个 slave 节点挂了之后，可以让其他的 slave 节点接管这个 slave 节点需要消费的数据，做一个 `故障转移` 的处理



 

 





### 数据同步系统的架构设计

ZooKeeper 还可以用在数据同步系统中

数据同步系统就是需要将 `源数据存储` 和 `目标数据存储` 中的数据进行同步，从而保持数据一致，那么数据同步系统就分为了 3 个部分：

- `Master`：负责去 zk 中监听数据同步的任务，当监听到之后，将数据同步的任务发放给 Collector 和 Store


- `Collector`：监听 zk 中的数据同步任务的节点，当监听到节点有同步的任务时，就负责去 `源数据存储` 中拉取待同步的数据
- `Store`：监听 zk 中的数据同步任务的节点，当监听到节点有同步的任务时，就去 Kafka 中拉取待同步的数据，将数据写入到 `目标数据存储` 中

整体的一个流程如下图：

![1704853132825](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704853132825.png) 



那么在数据同步系统中，zk 管理的数据就相比于日志中心架构要简单一些，只需要管理 `同步任务` 创建及监听即可，节点设计如下：

- `发布数据同步任务到 zk 中`：
  - 存入 zk 中的节点目录：/data-sync-system/data-sync-tasks/#{data-sync-task}
- `Collector 监听的数据同步任务`：
  - 存入 zk 中的节点目录：/data-sync-system/collectors/#{collector}/data-sync-tasks/#{data-sync-task}
- `Store 监听的数据同步任务`：
  - 存入 zk 中的节点目录：/data-sync-system/stores/#{store}/data-store-tasks/#{data-store-task}









