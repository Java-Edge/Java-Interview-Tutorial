---
typora-copy-images-to: image
---



# 作者

- 【11来了】：目前在读研究生，现处于研二，现在计划更新常用中间件系统性学习内容，2024年初会进行暑期实习面试，到时候会在公众号分享面试分析！
- 微信公众号：发送 `资料`  可领取当前已整理完毕的 Redis、JVM 、MQ 等系列完整 pdf！

![1703670426893](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703670426893.png)

- CSDN：https://blog.csdn.net/qq_45260619?spm=1011.2415.3001.5343

# 基于电商场景的高并发 RocketMQ 实战



## Rocket 架构分析

### NameServer 内核原理剖析

NameServer 是可以集群部署的，但是集群中的每台 NameServer 之间 `不会进行通信`，这样的好处就是 NameServer 集群中每个节点都是对等的，其中一台挂了之后，对集群不会有影响

Broker 在启动之后，会想 NameServer 集 群中的每个 NameServer 中都会注册自己的信息

Broker 每隔 30s 会想 NameServer 中发送心跳，来让 NameServer 感知到 Broker 的存活状态

在 NameServer 中有一个后台线程，会每隔 10s 去检查是否有 Broker 在 120s 内都没有发送心跳，如果有，就将该 Broker 从存活列表中剔除掉！

![1703256891484](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703256891484.png)

### Broker 主从架构与集群模式原理分析

在 Broker 集群中，生产者需要向 Broker 中写数据的话，先从 NameServer 中进行一个 Broker 列表的查询，之后再通过 `负载均衡` 去选择一个 Broker 进行消息的存储

Broker 的主从关系通过将 Broker 的 name 设置相同，brokerId 是 0 的话代表 Broker 是主节点的 ，brokerId 不是 0 的话代表 Broker 从节点的，Broker 的主从架构如下图：

![1703258087640](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703258087640.png)





**关于消息中 Topic 的概念：**

在生产者向 Broker 中发送消息的话，是指定了一个 Topic 的，那么 Topic 下是有一个 `队列` 的概念的

Topic 会在每个 Broker 分组里创建 4 个 write queue 和 4 个 read queue

那么生产者写入消息时，先根据 Topic 找到需要写入的 write queue，找到该 queue 所在的 Broker 进行写入，如下图：

![1703258019073](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703258019073.png)



### NameServer 内存中核心数据模型分析

NameServer 中关键的数据模型结构如下：

- clusterAddrTable：存储 Broker 集群表，其中 Broker01 表示第一个 Broker 分组

  ```java
  clusterAddrTable: {
    BrokerCluster01: [Broker01, Borker02]
  }
  ```

- brokerAddrTable：存储 Broker 地址表，存储了每个 Broker 分组的信息，以及该 Broker 分组中每个主从 Broker 的地址

  ```java
  brokerAddrTable: [
    {
      Broker01: {
        cluster: BrokerCluster01,
        brokerAddrs: [
          0/*brokerId，用于区分主从*/: ip:port,
          1/*brokerId，用于区分主从*/: ip:port
        ]
      },
      Broker02: {
        cluster: BrokerCluster01,
        brokerAddrs: [
          0/*brokerId，用于区分主从*/: ip:port,
          1/*brokerId，用于区分主从*/: ip:port
        ]
      }
    }
  ]
  ```

- brokerLiveTable：存储活跃的 Broker，其中 `haServerAddr` 存储与当前 Broker 互为主备的 Broker 地址

  ```java
  brokerLiveTable: {
    ip:port: {
      lastUpdateTimestamp: xxxx,
      haServerAddr: ip:port
    }
  }
  ```

- topicQueueTable：存储 Topic 在每个 Broker 中的队列数量

  ```java
  topicQueueTable: {
    Topic01: [
      {
        brokerName: Broker01,
        readQueueNums: 4,
        writeQueueNums: 4
      },
      {
        brokerName: Broker02,
        readQueueNums: 4,
        writeQueueNums: 4
      }
    ]
  }
  ```

  

### 内核级 Producer 发送消息流程

消息生产者发送消息根据 Topic 进行发送：

1. 根据 Topic 找到这个 Topic 的 Queue 在每台 Broker 上的分布，进行负载均衡
2. 通过负载均衡选择一个队列，根据 `topicQueueTable` 可以知道该 Queue 是属于哪一个 Broker 的
3. 那么接下来就查找到 Broker 主节点（根据 brokerId 判断），将数据发送到这个 Broker 主节点中，再写入对应的 Queue



那么如果当前消息发送到当前 Broker 组失败的话，在一段时间内就不会选择当前出现故障的 Queue了，会重新选择其他的 Broker 组中的 Queue 进行发送

选择 Broker 以及发送失败流程图如下图黄色部分所示：

![1703260949322](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703260949322.png)



RokcetMQ 的 NameServer 中是有 `故障的延迟感知机制` ，即当 Broker 出现故障时，对于生产者来说，并不会立即感知到该 Broker 故障

NameServer 中虽然每隔 10s 中会去检查是否有故障 Broker，将故障 Broker 剔除掉，但是此时生产者的 Topic 缓存中还是有故障 Broker 的信息的，只有等 30s 之后刷新，才可以感知到这个 Broker 已经故障了

通过这个 `故障的延迟感知机制` 可以避免去做许多麻烦的操作，如果 Broker 挂掉之后，要让生产者立马感知到，需要通过 NameServer 去通知许多 Producer，并且如果通知丢失，还是有向故障 Broker 发送消息的可能！



### Broker 如何实现高并发消息写入

Broker 对消息进行写磁盘是采用的 `磁盘顺序写` ，写磁盘分为两种：顺序写和随机写，两种速度差别非常大！

Broker 通过顺序写磁盘，也就是在文件末尾不停追加内容，不需要进行寻址操作，大幅度 `提高消息持久化存储的性能`

这里消息写入的就是 Commitlog 文件！

**磁盘顺序写和磁盘随机写的速度差距如下图：**

![1703262034189](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703262034189.png)



在将消息写入 Commitlog 文件之后，会有一个后台线程去监听 Commitlog 是否有数据写入，如果有就将新写入的数据写入到 write queue 中，这里写到 queue 中数据的内容就是消息在 Commitlog 中的偏移量 offset，写入 Commitlog 文件动作如下图黑色部分：

![1703262611412](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703262611412.png)

**总结：**

那么这里的高并发就是通过两点来保证：

1. 通过 `磁盘顺序写` 来提升性能
2. 通过 `异步` 将 Commitlog 文件写入 write queue（也就是 consume queue）中，保证不影响主流程速度



### RocketMQ 的读写队列原理分析

RocketMQ 中是区分了 write queue 和 read queue，在物理层面只有 write queue 才对应磁盘上的 consumeQueue 物理文件，而 read queue 是一个虚的概念，并不是一个 read queue 也新创建一个磁盘文件

这两个参数是在 Topic 下进行设置的：

- `writeQueueNums`：表示生产者在发送消息时，可以向几个队列进行发送
- `readQueueNums`：表示消费者在消费消息时，可以从多少个队列进行拉取

write queue 和 read queue 是一一对应的，如果 write queue 的数量多于 read queue，那么就会有一部分 write queue 中的消息永远不会被消费到；如果 read queue 的数量多于 write queue，那么就存在一部分 consumer 订阅的 read queue 中没有数据



**设计 write queue 和 read queue 的意义：**

使扩缩容的过程更加平滑，比如原来有 4 个 write queue 和 read queue，先将 write queue 缩容成 2 个，那么此时先不缩容读队列，等待与删除的两个读队列所对应的写队列中的旧数据被消费完毕之后，再对读队列进行缩容

### Commitlog 基于内存的高并发写入优化

首先，Commitlog 将数据写入磁盘使用的是 `磁盘顺序写`，这样带来的性能提升是很大的

但是仅仅使用磁盘顺序写，对写入性能的提升还是有限，于是还是用了 `mapping 文件内存映射机制`，即先把消息数据写入到内存中，再从内存将数据 `异步` 刷入到磁盘中去，那么就将 `磁盘顺序写` 又进一步优化为了 `内存写` 操作

那么通过内存映射优化写入过程，如下图红色部分：

![1703301140978](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703301140978.png)



**总结：**

那么这里基于磁盘顺序写，还添加了 `mapping 文件映射机制` 来进一步提升了文件性能，将磁盘顺序写优化为内存写操作！



### 基于 JVM offheap 的内存读写分离机制

**broker busy 问题**

一般来说，在服务器上部署了一个 java 应用之后，这个应用作为一个 jvm 进程在服务器运行，此时内存一般分为三种：

- jvm 堆内存：由 jvm 管理
- offheap 内存：jvm 堆外的内存
- page cache：操作系统管理的内存

那么通过将消息写入内存中的 `page cache` 中来大幅提高写消息的性能，但是在高并发的场景下，可能会出现 broker busy，也就是 broker 太繁忙，导致一些操作被阻塞，这是因为高并发下，大量读写操作对同一个 Commitlog 磁盘文件在内存中的映射文件 `page cache` 同时进行写操作，导致这一个 page cache 被竞争使用的太激烈

那么 RocketMQ 提供了 `transientStorePoolEnabled（瞬时存储池启用）` 机制来解决 broker busy 的问题，通过这个机制就可以实现 `内存级别的读写分离`

这个 `transiendStorePoolEnabled 机制` 也就是：在高并发消息写入 Broker 的时候，先将消息写在 JVM 的堆外内存中，有一个后台线程会定时将消息再刷入内存的 `page cache` 中，此时针对 MappedFile 的  `page cache` 的高并发写就转移到了 `JVM 的堆外内存` 中，而对于 Consumer 的高并发的读操作最终是落在了 MappedFile 的 `page cache` 中，实现了高并发读写的分离



总之呢，这个机制实现了高并发的读写分离，消费者高并发的读从 read queue 中读取数据，最终高并发的读肯定是落到了 `MappedFile 的 page cache` 中，而生产者高并发的写则是直接面向了 `jvm offheap 堆外内存`，就不会出现 `MappedFile page cache` 高并发情况下的争用问题了，如下图紫色部分：

![1703336245750](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703336245750.png)





**基于系统设计层面的考虑：**

虽然使用 transiendStorePoolEnabled 机制可以提高高并发场景下 Broker 的读写性能，但是这可能会造成一定的数据丢失！

在这个机制之下，数据会先写入 jvm offheap 中，也就是堆外内存，如果 jvm 进程挂了，就会导致 jvm offheap 中的数据还没来得及刷到 MappedFile page cache 中就丢失了，而 jvm 进程挂掉的概率还是挺大的，因此这个机制是牺牲了一定的数据可靠性，来提升了性能！

`所以，针对不同的场景，要做出不同的设计，如果是对消息严格要求可靠的金融等场景来说，那么就不能使用这个机制，其他情况下保持默认就可以了！`



### Broker 写入读取流程性能优化总结

Broker 的物理存储结构主要是为了优化三个方面：写入、存储、读取

**写入优化：**

1. 将消息数据写入到 Commitlog 中默认就是写入到了操作系统的 `page cache` 中，通过 `mapped file` 机制来实现，将磁盘文件 Commitlog 映射成一块内存区域，将数据写入到内存的 page cache 中就算写入完成了，等待后台线程将内存数据 `异步刷入磁盘` 即可，这种情况下只有 Broker 所在的机器宕机了，才会导致几百毫秒内的内存数据丢失，这种概率是很小的
2. Broker 存储数据是主要有三个结构的：Commitlog、ConsumeQueue、IndexFile，[可参考文章](https://blog.csdn.net/qq_45260619/article/details/135134830?spm=1001.2014.3001.5502)，数据写入到 Commitlog 中的速度是很快的，再通过 `异步` 将 Commitlog 中的数据建立成索引写入到 ConsumeQueue、IndexFile，这个过程是异步，对写消息流程没有性能影响，即使写入到 ConsumeQueue、IndexFile 的过程中宕机了，只要 Commitlog 文件还在，Broker 重启之后，就会继续向 ConsumeQueue、IndexFile 中写入索引

**存储结构：** 

1. ConsumeQueue 存储结构经过了极大的优化设计的。每个消息在 ConsumeQueue 中存储的都是 `定长的 20B` ，每个 ConsumeQueue 文件可以存储 30w 个消息
2. Commitlog 存储结构也是精心设计，每个文件 `默认 1GB` ，满了之后就存下一个文件，避免了某个文件过大，并且每一条消息在所有的 Commitlog 中 `记录了有偏移量` ，Commielog 的文件名就是这个文件第一条消息的总物理偏移量

**读取优化：** 

1. 根据消息逻辑偏移量，来定位到 ConsumeQueue 的磁盘文件，在磁盘文件里就可以根据 `逻辑偏移量` 计算出 `物理偏移量` ，可以直接定位到消息在 Commitlog 中的物理偏移量，通过两次定位就可以读取出数据
2. 通过 `transiendStorePoolEnabled 机制` 解决了高并发读写场景下的 Broker busy 问题，实现了读写分离





### Broker 基于 Pull 模式的主从复制原理

Broker 主从复制基于 Pull 模式实现的，即生产者将数据写入到 Broker 主节点之后，等待 Slave 向 Master 发送请求，主动拉取数据

Broker 的从节点需要拉取数据时，会向主节点发送请求建立连接，当建立连接之后，在主节点会建立一个 `HAConnection` 的数据结构，用于将与从节点之间的连接抽象出来，而在从节点会创建两个 `HAClient`，一个是主从请求线程，另一个是主从响应线程，HAClient 是从节点的核心类，负责与主节点创建连接与数据交互

那么当从节点向主节点发送连接建立，建立好连接之后，Slave 会向 Master 发送一个最大偏移量 Max Offset，那么主节点根据这个 Offset 偏移量去磁盘文件中读取数据，并将数据发送到 Slave，Slave 进行数据的保存，总体流程如下图：

![1703340686005](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703340686005.png)



### RocketMQ 读写分离主从漂移设计

默认情况下，RocketMQ 是不倾向于主动进行读写分离的，在默认情况下，读和写操作都是在 `主节点` 上进行的，从节点主要是用于进行复制和同步操作，实现热备份

如果主节点过于繁忙呢？

主节点过于繁忙时，返回给消费者一个从节点的 brokerId ，之后在从节点中拉取数据，当从节点拉取消息过程非常顺利的时候，此时又会返回给消费者一个 brokerId，让消费者去主节点进行消费，再漂移回主节点

那么这种方式就是 `主从漂移模式`，即主从集群对外提供服务，用户在访问时，有时候访问主，有时候访问从，主从之间来回漂移

即 RocketMQ 一开始不进行读写分离，当主节点压力过大，积压消息达到了自己物理内存的 40% 之后，才进行读写分离，将消费者消费的请求 `漂移到从节点去` ，分散主节点的压力

如果主节点崩溃了，也会将消费者请求 `漂移到从节点中`

当漂移到从节点之后，消息积压数量很快就得到了环节，即消息积压降低到了从节点物理内存的 30% 以内，说明此时消费的情况比较良好，又会将消费的请求 `漂移回主节点中`



**那么为什么要设计为惰性的主从分离机制呢？**

在消费的过程中，对于每个 queue 都需要记录这个队列消费的进度 offset，那么如果消费者每次随机挑选一台机器进行消费，那么就会导致每台机器上维护的这个消费进度 offset 混乱

因此默认情况下，都会优先去主节点进行消费，当漂移到从节点之后，每隔 10s 时间，主从节点之间还会进行消费的一些元数据的同步（偏移量等等），这样再漂移回主节点后还可以接着进行消费



### Broker 基于 raft 协议的主从架构设计

在 RocketMQ 4.5.0 之前，Broker 主节点崩溃了之后，是没有高可用主从切换机制的，主从仅仅是用于进行 `热备份` 的，此时从节点是不可以进行写入数据的

在 4.5.0 之后，做出了架构改造，添加了 `高可用机制` ：主从复制 + 主从切换



那么启动 Broker 之后，Broker 之间会通过 Raft 协议选举出来主节点，之后生产者会向主节点中不停地写入消息，主节点将消息再同步给从节点，只要超过集群中一般节点写入成功（包括主节点，也就是主节点+从节点超过一半节点都写入消息成功），Broker 就返回给生产者写入消息成功

如果主节点挂了之后，会通过 Raft 协议重新选举主节点，进行消息写入

![1703426396621](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703426396621.png)

### Raft 协议的 leader 选举算法

Raft 协议是一种分布式一致性算法，用于解决分布式系统中的数据一致性问题。

Raft 协议将整个系统的状态分为 3 种角色：领导者 leader、跟随者 follower、候选者 candidate

那么通过 Raft 协议进行的 leader 选举算法流程如下：

1. 每个 follower 都会给自己设置一个 150ms~300ms 的随机倒计时时间
2. 第一个倒计时结束的 follower，先将自己的身份转变为 candidate，并且表示自己想要去竞选为 leader，于是先投自己一票
3. 此时，这个 candidate 还会去找其他的 follower 进行拉票，其他的 follower 会投票给收到的第一个请求者，当这个 candidate 的票数超过集群中的半数，就成功选举为 leader
4. 选举成功后，新的 leader 会周期性的向 follower 发送心跳消息，以维持领导地位（follower 设计成为 candidate 的倒计时，每次收到 leader 的心跳都会将倒计时重新刷新，这样当 leader 健康的时候，follower 永远没有机会成为 candidate）



### Broker 基于状态机实现的 leader 选举

状态机（State Machine）指的是一种抽象模型，包括一组状态以及在不同状态之间转换的规则，在不同状态下执行的行为是不同的

Broker 在实现 leader 选举就是通过 `状态机` 来实现的

完整流程图如下：

![1703473377801](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703473377801.png)

在启动 Broker 之后，每个 Broker 自己都有一个状态机，状态切换流程如下：

1. Broker 初始化状态为 follower
2. 执行 follower 对应行为 `maintainAsFollower`，判断当前 follower 是否收到来自 leader 的心跳包
   1. 如果没有收到，则开启自己切换为 candidate 状态的倒计时
   2. 如果收到了，证明已经有 leader 了，刷新自己切换为 candidate 状态的倒计时
3. 当倒计时结束之后切换为 candidate 状态，执行 candidate 状态对应行为 `maintainAsCandidate`，首先会给自己投一票，之后再想其他 Broker 节点发出给自己投票的请求（其他 Broker 节点只能投一票，会投给最先请求的 candidate）
4. 判断是否收到半数以上投票
   1. 没有收到，则重置切换为 candidate 的倒计时，重新选举
   2. 收到，则切换状态为 leader
5. 切换为 leader 状态后，执行 leader 对应行为 `maintainAsLeader`，此时会定时向其他 broker 节点发送心跳，来维持自己的 leader 地位，如果没有收到了半数以上的心跳响应，则说明当前 leader 与其他节点可能连接断开，则将当前 leader 切换为 candidate 状态



### Broker 基于 DLedger 的数据写入流程

DLedger 是一套基于 Raft 协议的分布式日志存储组件，部署 RocketMQ 时可以根据需要选择使用 DLeger 来替换原生的副本存储机制



**leader 对外提供读写服务：**

在 Raft 协议之下，选举出 leader 之后，只有 leader 对外提供读和写的服务，而 follower 对外是不提供服务的，仅仅是用于数据复制的同步

在 Raft 协议之下，**如果是一边写 leader，一边从 follower 去读**，会存在这样一个问题：

在 leader 写入数据时，有一个过半写入成功机制，即对于当前主从架构中只有半数以上节点写入，才会返回写入成功，那么此时去 follower 中读取数据的时候，可能正好读取到没有写入成功的 follower 节点数据，会造成 `数据不一致` 的问题



**基于 DLedger 数据写入流程如下：**

那么 DLedger 处理 leader 中数据写入，为了保证数据写入的 `性能`，需要尽可能去减少数据写入时的阻塞时间，流程如下：

1. 首先还是基于 MappedFile 机制，将日志写入到磁盘文件在内存中的映射区域 `page cache`，page cache 中的数据等待后台线程异步刷入磁盘即可
2. 之后向 follower 中去进行 `异步日志复制`，等待半数以上 follower 将日志数据写入 page cache 之后，leader 再向用户返回消息写入成功



![1703479307662](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703479307662.png)



**Broker 引入 DLedger 后的存储兼容设计：**

引入 DLedger 之前，RocketMQ 数据时存储在 commitlog 中，但是在 DLedger 中写入的 `日志格式` 的数据，之后再写入到 commitlog 中，就需要做 `日志数据` 与 `commitlog` 之间格式的兼容

首先 DLedger 中的日志包括了 header 和 body 两个部分，将原始的 commitlog 里的数据放入到日志的 body 中去，做到数据的兼容

![1703479707588](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703479707588.png)



### Consumer 端队列负载均衡分配机制

topic 是有一堆的 queue，而且分布在不同的 broker 上

并且在消费时，将多个 queue 分配给多个 consumer，每一个 consumer 会分配到一部分的 queue 进行消费

每个 consumer 会获取到 `Topic 下包含的 queue 的信息` 以及 `每个 consumer group 下包含多少的 consumer` ，那么 consumer 都使用相同的算法去做一次分配

- Topic 下包含的 queue 的信息可以在 Broker 中获取
- 每个 consumer group 下包含多少了 consumer 的信息也可以在 Broker 获取，因为每个 consumer 启动后，都会将 Broker 中进行注册



**Consumer 分配队列：**

Consumer 端队列的分配是通过 `RebalanceService` 这个组件实现的，拉取 Topic 的 queue 信息，拉取 consumer group 信息，根据算法分配 queue，确认自己需要拉取哪些 queue 的消息

`RebalanceService` 这个组件是在 Broker 中的，主要负责实现消息队列的动态负载均衡和自动分配，确保消息队列在消费者组内均匀分配，并在消费者组发生变化时进行动态调整，通过动态负载均衡和自动分配消息队列，保证了消费者组在消费消息时的 `高效性和可靠性`



那么分配好队列之后，Consumer 就知道自己分配了哪些 queue 了，Consumer 就可以去 Broker 中对应的 queue 进行数据的拉取，这里 Consumer 消息的拉取在 RocketMQ 中有两种实现（DefaultMQPushConsumer、DefaultMQPullConsumer， 但是在底层全部都是通过 pull 拉取消息进行消费的）：

- push 模式：服务端有数据后推送给客户端，实时性很高，但是增加了服务端工作量
- pull 模式：客户端主动去服务端拉取数据，会导致数据接收不及时



**RocketMQ 的长轮询：**

RocketMQ 中使用了 `长轮询` 的方式，兼顾了 push 和 pull 两种模式的优点

`长轮询：` 长轮询本质上也是轮询，服务端在没有数据的时候并不是马上返回数据，而是会先将请求挂起，此时有一个长轮询后台线程每隔 5s 会去检查 queue 中是否有新的消息，如果有则去唤醒客户端请求，否则如果超过 15s 就会判断客户端请求超时



### Consumer 端并发消费以及消费进度提交

Consumer 去 Broker 中拉取消息的线程只有一个，拉取到消息之后会将消息存放在 ProcessQueue 中，每一个 ConsumeQueue 都会对应一个 ProcessQueue

消息被拉取到会放在 ProcessQueue 中，等待线程池进行 `并发消息` ，线程池处理消息时，就会调用到我们在创建生产者时注册的监听器中的 `consumeMessage` 方法，在这里会执行我们自己定义的业务逻辑，之后会返回状态码：SUCCESS 或 RECONSUME_LATER 等等，如果消费成功，线程会去 ProcessQueue 中删除对应的消息，并且会记录 `consumer group 对于 queue 的消费进度` ，以实通过异步提交到 broker 中去，流程图如下：

![1703493448060](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703493448060.png)



**Consumer 处理失败时的延迟消费机制：**

在 consumer 消费消息失败的时候，线程池会将消费失败的消息发送到 Broker 中，在 Broker 中，对失败的消息进行一个 Topic 的改写为：`RETRY_Topic_%`，会根据之前的 Topic 名称进行改写，改写后呢，作为一个 `延迟消息` 重新写入 Commitlog 和 ConsumeQueue 中，再通过专门处理延迟消息的后台线程监听延迟消息是否到达延迟时间，当时间到达之后，会将改写后的 Topic 再重新改写为原来的 Topic 名称并写入 Commitlog，之后等待被消费者再次消费即可







## 基于电商场景RocketMQ实战

通过基于电商场景的 RocketMQ 实战，你可以学到哪些方面的内容？

- RocketMQ 的应用场景
- RocketMQ 项目中常见的一些问题
- RocketMQ 的一些常用解决方案
- 如何在生产环境中使用 RocketMQ
- 为什么使用 RocketMQ
- 如何使用 RocketMQ 进行性能优化



### 电商的业务闭环知识讲解

这里讲解一下在电商 APP 中，用户购买一个商品的完整业务流程

对于一个的电商系统来说，常包括营销系统、商品系统、履约系统、交易系统、库存系统、支付系统：

1. 用户购买一个商品，先去将商品添加购物车，并且选择商品提交订单
2. 提交订单后，库存系统会 `锁定库存`
3. 交易系统将订单写入数据库，并且支付系统向第三方支付平台发起预支付的动作，生成支付流水单
4. 并且提醒用户进行支付操作，用户发起支付请求，向第三方支付平台进行支付
5. 支付成功后，支付系统向 MQ 发送【支付成功】消息，交易系统对【支付成功】消息进行消费，消费中会去通知履约系统对商品进行发货，以及用户收货后的一些操作

营销系统中，还有一个业务场景就是会发起一些促销活动，推送给用户

![1703517424102](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703517424102.png)









### 营销系统的技术架构与工程结构讲解

在营销系统中，主要是将营销消息定时发送给推送系统，定时任务使用 xxljob 来完成，整体流程如下：

> `为什么要使用 xxljob 呢？`
>
> 因为营销定时推送的任务在数据库中存储一份，那么推送系统可能是有多个的，多个推送系统拉取到了同一份推送任务，每个节点怎么知道自己执行哪些任务呢，这就需要使用 xxljob 分布式任务调度平台



**营销系统中 RocketMQ 的应用场景：**

在推送系统中，是需要调用第三方推送平台来去给用户推送短信、邮箱等等信息，但是第三方推送平台推送的频率肯定是有一定限制的，而推送系统中对用户的推送量是非常大的，那么为了平衡两方的并发度差距，引入了 RocketMQ 来进行异步的一个推送

先将大量推送消息放入 RocketMQ 中，再根据第三方推送平台的速度进行消费

这里还引入了 xxljob 去执行定时推送的一个任务，因为有些给用户推送是定时推送的，那么这些定时任务会去落到数据库中，而给用户推送的定时任务的体量也是相当大的，毕竟有千万级用户，那么肯定就需要考虑到一个分片的问题，会部署 `多个推送系统`，每个推送系统负责一部分用户的推送，这样可以大幅提升用户的推送速度，因此通过 xxljob 去进行分布式的调度，让每台推送系统负责一部分的推送任务

![1703566445433](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703566445433.png)



### 初版营销系统设计方案

对营销系统，主要有以下几个任务：

- 搞促销活动，对全员用户/部分用户进行推送
- 发优惠券，给全员用户/部分用户发券
- 给所有用户每天推送热门商品，吸引用户



首先，营销系统初版的一个功能流程如下图：

![1703576743100](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703576743100.png)



`营销系统中的几个任务的共性` ：需要对大量的用户数据进行一个任务处理，而用户量是很大的，对于中型电商平台来说，用户量是达到千万级的，因此系统中会出现各种性能问题

那么先实现初版营销系统基础的功能架构，将 RocketMQ 进行落地实现，并保证整体业务流程可以完整运行，之后再针对不同场景进行性能的优化，使能支撑千万级用户量



那么目前初版的营销系统主要存在以下几个方面的性能问题：

1. `数据库查询方面`：从数据库中全量查询用户数据，数据量太大，一下就把 MySQL 打死了，一下查询几个 GB 的数据，根本查不出来

   那么如果批量查询用户数据呢？其实也是存在问题的，批量查出来用户数据，放到内存中，再对用户数据进行处理，那么处理期间无法进行垃圾回收，导致 `大量内存空间被占用` ，大量数据进入老年代，老年代满了之后频繁触发 full gc，造成系统频繁停顿，并且批量查询用户数据，假设 1000w 个用户，一次查询 1w 条，也需要查询 1000 次，这么多的网络请求对于机器的压力还是很大的

2. `数据库插入方面`：营销系统需要为用户生成优惠券，那么还需要向数据库中插入大量优惠券的数据，也会对数据库造成很大压力

3. `推送 MQ 方面`：需要为每个用户封装一条 push 消息发送到 MQ 中，那么用户量 1000w 的时候，需要对 MQ 发送 1000w 次请求，需要推送的数据量太大了，造成了大量的网络通信开销，并且推送时间也会比较长

4. `RPC 通信方面`：对于大多数电商系统来说，用户系统是和营销系统分开的，之间通过 RCP 通信的，那么查询大量用户数据之后，通过 RPC 进行传输，RPC 调用的压力也是一个问题



### 千万级用户分片+批量推送方案、惰性发券

`性能瓶颈`：

- 千万级用户量的 push 推送
- 大数据量查询/插入
- 大量数据存入内存时的消耗
- 千万级消息写入 MQ 耗时



**首先针对大数据量的数据库查询以及 MQ 推送，通过分布式推送来优化性能：**

首先，针对于千万级用户量的 push 推送，先不去进行千万级用户的全量查询，而是通过向 MQ 中发出需要 `创建营销活动的一个消息` ，通过消费者监听这个消息去查出用户总量，根据用户总量进行一个拆分，比如说 1000w 用户拆分成 1w 个批次，那么每个批次就是 1000 个用户

拆分之后，将 `一个批次作为一条消息` 发送到 RocketMQ 中，假设发送一条消息耗费 10ms，1w 条消息也就 100s 而已

推送到 MQ 中，消息会均匀分散地写入到各个 queue 里面去在消费端，将推送系统集群部署，多个推送系统去消费 Topic 中的 queue

最终千万级用户的推送任务被分发到推送系统的各个机器上去，实现分布式推送的效果

![1703581079996](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703581079996.png)



**多线程推送优化：**

在上图流程的第 8 个步骤，调用第三方 Push 平台的 SDK 去进行推送，那么一个消息中是有 1000 个用户的，那么假设发送给第三方平台一次 PUSH 请求要花费 200ms，那么 1000 个用户也需要花费 1000 * 200ms = 200s，那么对于千万级用户来说，通过单线程处理需要花费 1000w * 200ms = 200w秒（约为23天），那肯定是不行的

![1703600117598](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703600117598.png)

对于推送系统推送来说，之前将 1000w 的用户拆分为 1w 个批次了，也就是 1w 个消息，每个消息有 1000 个用户的 id，也就是推送系统需要向第三方 Push 平台推送 1w 个消息，假设第三方 Push 平台推送 1 个用户需要耗费 200ms，那么 1000 个用户也就需要耗费 200s ≈ 3 分钟，也就是推送系统向第三方 Push 平台推送 1 条消息（包含 1000 个用户）需要消耗 3 分钟时间，那么 1w 条消息也就是需要花费 10000 * 3 = 30000 分钟，大约是 20 天，这速度太慢了

因此通过 `多线程` 高并发发起推送任务，假设开启 30 个线程，那么一个推送系统 3 分钟就可以推送 30 条消息，3 个小时可以推送差不多 2000 个消息，那么总共 10000 条消息，只需要 5 个机器同时开 30 个线程跑 3 个小时，就可以将 10000 个消息推送完毕

可以根据机器 CPU 的配置，可以适当增加或减少线程的个数

![1703600124373](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703600124373.png)







**千万级用户惰性发券场景：**

互联网公司经典场景：千万级用户惰性发优惠券

业务场景是：运营人员发布一个促销活动，需要给每一个用户都发优惠券，那么在发布完活动之后，先不立即执行发券的动作，因为这样会导致对 MQ 以及 MySQL 压力都过大，通过 `惰性发券` 来分散发券的压力，是如何惰性发券呢？

当发布促销活动后，先将活动存入到 Redis 集群中去，当用户登陆的时候，会去向 MQ 中发送一个【用户登录】的消息，那么营销系统中就会有一个【用户登录】消息的消费者，监听到之后，就会去 Redis 中查看当前用户是否已经发过优惠券，如果没有的话，就执行发券的操作





**最后总结一下：**

对于 `千万级用户推送` 场景下的解决方案：

1. 先将需要推送给用户的活动创建成 MQ 中的一个消息
2. 在营销系统中通过一个消费者来去  `异步` 的进行用户推送的动作
3. 用户量太大，那么就先去数据库查出用户总量，对用户 id 进行一个 `分片` ，一个分片存 1000 个用户 id，那么 1000w 的用户只需要 1w 个分片即可，这里一个分片就是 MQ 中的一个消息
4. 由于推送第三瓶平台需要对每个用户都推送，如果使用单线程，花费时间太长，因此通过加入 `多线程` ，并且部署多个推送节点来加快消息的推送





### 促销活动推送千万级用户解决方案【多线程+分片推送实现高性能推送】

首先介绍一下发布促销活动的整体业务流程：

1. 运维人员操作页面发布促销活动

2. 判断促销活动是否和以往活动发布重复

3. 先将促销活动落库

4. 发布【促销活动创建】事件

5. 消费者监听到【促销活动创建】事件，开始对所有用户推送促销活动

   由于用户量很大，这里使用 `多线程 + 分片推送` 来大幅提升推送速度



整个流程中的主要技术难点就在于：`多线程 + 分片推送`

整体的流程图如下：

![1704170306871](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704170306871.png)



接下来，开始根据流程图中的各个功能来介绍代码如何实现：

**通过 Redis 判断发布的活动是否重复**

通过将已经发布的促销活动先保存在 Redis 中，避免短时间内将同一促销活动重复发布

Redis 中存储的 key 的设计：`promotion_Concurrency + [促销活动名称] + [促销活动创建人] + [促销活动开始事件] + [促销活动结束时间]`

如果一个促销活动已经发布，那么就将这个促销活动按照这个 key 存储进入 Redis 中，value 的话，设置为 UUID 即可

`过期时间` 的设置：这里将过期时间设置为 30 分钟



**通过 MQ 发送【促销活动创建】事件**

这里发布促销活动创建事件的时候，消息中存放的数据使用了一个事件类进行存储，这个事件类中只有一个属性，就是促销活动的实体类：

```java
/**
 * 促销活动创建事件，用于 MQ 传输
 */
@Data
public class SalesPromotionCreatedEvent {
    // 促销活动实体类
    private SalesPromotionDO salesPromotion;
}
```

那么通过消费者监听到【促销活动创建】事件之后，就会进行 `用户推送` 的动作



**如何实现用户分片 + 多线程推送**

首先来了解一下为什么要对用户进行分片：在电商场景中用户的数量是相当庞大的，中小型电商系统的用户数量都可以达到千万级，那么如果给每一个用户都生成一条消息进行 MQ 推送，这个推送的时间相当漫长，必须优化消息推送的速度，因此将多个用户 `合并成一个分片` 来进行推送，这样消耗的时间可能还有些久，就再将多个分片 `合并成一条消息`，之后再将合并后的消息通过 `多线程` 推送到 MQ 中，整个优化流程如下：

![1704171814760](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704171814760.png)



接下来说一下分片中具体的实现：

首先对用户分片的话，需要知道用户的总数，并且设置好每个分片的大小，才可以将用户分成一个个的分片

获取用户总数的话，假设用户表中 id 是自增的，那么直接从用户表中拿到最大的 `用户 id` 作为用户总数即可，用户总数不需要非常准确，某个分片多几个少几个影响不大，将每个分片大小设置为 1000，也就是一个分片存放 1000 个用户 id

那么分片操作就是创建一个 `Map<Long, Long> userBuckets = LinkedHashMap<Long, Long>()`，将每一个分片的用户起使 id 和结束 id 放入即可

之后再将多个用户分片给合并为一条消息，这里合并的时候保证一条消息不超过 1MB（RocketMQ 官方推荐），首先将需要推送的一个个分片给生成一个 JSON 串，表示一个个的推送任务，将所有推送任务放入到 List 集合中，接下来去遍历 List 集合进行多个分片的合并操作，List 集合中存储的是一个个分片任务的 String 串，只需要拿到 String 串的长度，比如说长度为 200，那么这个 String 串占用的空间为 200B，累加不超过 1MB，就将不超过 1MB 的分片合并为一条消息，代码如下：

```java
@Slf4j
@Component
public class SalesPromotionCreatedEventListener implements MessageListenerConcurrently {

    @DubboReference(version = "1.0.0")
    private AccountApi accountApi;
    @Resource
    private DefaultProducer defaultProducer;

    @Autowired
    @Qualifier("sharedSendMsgThreadPool")
    private SafeThreadPool sharedSendMsgThreadPool;



    @Override
    public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
        try {
            for(MessageExt messageExt : list) {
                // 这个代码就可以拿到一个刚刚创建成功的促销活动
                String message = new String(messageExt.getBody());
                SalesPromotionCreatedEvent salesPromotionCreatedEvent =
                        JSON.parseObject(message, SalesPromotionCreatedEvent.class);
              
                // 将消息中的数据解析成促销活动实体类
                SalesPromotionDO salesPromotion = salesPromotionCreatedEvent.getSalesPromotion();

                // 为了这个促销活动，针对全体用户发起push

                // bucket，就是一个用户分片，这里定义用户分片大小
                final int userBucketSize = 1000;

                // 拿到全体用户数量，两种做法，第一种是去找会员服务进行 count，第二种是获取 max(userid)，自增主键
                JsonResult<Long> queryMaxUserIdResult = accountApi.queryMaxUserId();
                if (!queryMaxUserIdResult.getSuccess()) {
                    throw new BaseBizException(queryMaxUserIdResult.getErrorCode(), queryMaxUserIdResult.getErrorMessage());
                }
                Long maxUserId = queryMaxUserIdResult.getData();

                // 上万条 key-value 对，每个 key-value 对就是一个 startUserId->endUserId，推送任务分片
                Map<Long, Long> userBuckets = new LinkedHashMap<>(); // 
                // 数据库自增主键是从1开始的
                long startUserId = 1L; 
              
                // 这里对所有用户进行分片，将每个分片的 <startUserId, endUserId> 都放入到 userBuckets 中
                Boolean doSharding = true;
                while (doSharding) {
                    if (startUserId > maxUserId) {
                        doSharding = false;
                        break;
                    }
                    userBuckets.put(startUserId, startUserId + userBucketSize);
                    startUserId += userBucketSize;
                }

				// 提前创建一个推送的消息实例，在循环中直接设置 startUserId 和 endUserId，避免每次循环都去创建一个新对象
                PlatformPromotionUserBucketMessage promotionPushTask = PlatformPromotionUserBucketMessage.builder()
                        .promotionId(salesPromotion.getId())
                        .promotionType(salesPromotion.getType())
                        .mainMessage(salesPromotion.getName())
                        .message("您已获得活动资格，打开APP进入活动页面")
                        .informType(salesPromotion.getInformType())
                        .build();
                // 将需要推送的消息全部放到这个 List 集合中
                List<String> promotionPushTasks = new ArrayList<>();
                for (Map.Entry<Long, Long> userBucket : userBuckets.entrySet()) {
                    promotionPushTask.setStartUserId(userBucket.getKey());
                    promotionPushTask.setEndUserId(userBucket.getValue());
                    String promotionPushTaskJSON = JsonUtil.object2Json(promotionPushTask);
                    promotionPushTasks.add(promotionPushTaskJSON);
                }
                log.info("本次推送消息用户桶数量, {}",promotionPushTasks.size());
                // 将上边 List 集合中的推送消息进行合并，这里 ListSplitter 的代码会在下边贴出来
                ListSplitter splitter = new ListSplitter(promotionPushTasks, MESSAGE_BATCH_SIZE);
                while(splitter.hasNext()){
                    List<String> sendBatch = splitter.next();
                    log.info("本次批次消息数量,{}",sendBatch.size());
                    // 将多个分片合并为一条消息，提交到线程池中进行消息的推送
                    sharedSendMsgThreadPool.execute(() -> {
                        defaultProducer.sendMessages(RocketMqConstant.PLATFORM_PROMOTION_SEND_USER_BUCKET_TOPIC, sendBatch, "平台优惠活动用户桶消息");
                    });
                }
            }
        } catch(Exception e) {
            log.error("consume error, 促销活动创建事件处理异常", e);
            return ConsumeConcurrentlyStatus.RECONSUME_LATER;
        }
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
}
```



其中实现将分片合并的代码 `ListSplitter` 如下：

```java
public class ListSplitter implements Iterator<List<String>> {
    // 设置每一个batch最多不超过800k，因为rocketmq官方推荐，不建议长度超过1MB，
    // 而封装一个rocketmq的message，包括了messagebody,topic，addr等数据，所以我们这边儿设置的小一点儿
    private int sizeLimit = 800 * 1024;
    private final List<String> messages;
    private int currIndex;
    private int batchSize = 100;

    public ListSplitter(List<String> messages, Integer batchSize) {
        this.messages = messages;
        this.batchSize = batchSize;
    }
    public ListSplitter(List<String> messages) {
        this.messages = messages;
    }
    @Override
    public boolean hasNext() {
        return currIndex < messages.size();
    }

    // 每次从list中取一部分
    @Override
    public List<String> next() {
        int nextIndex = currIndex;
        int totalSize = 0;
        for (; nextIndex < messages.size(); nextIndex++) {
            String message = messages.get(nextIndex);
            // 获取每条消息的长度
            int tmpSize = message.length();

            // 如果当前这个分片就已经超过一条消息的大小了，就将这个分片单独作为一条消息发送
            if (tmpSize > sizeLimit) {
                if (nextIndex - currIndex == 0) {
                    nextIndex++;
                }
                break;
            }
            if (tmpSize + totalSize > sizeLimit || (nextIndex - currIndex) == batchSize ) {
                break;
            } else {
                totalSize += tmpSize;
            }
        }
        List<String> subList = messages.subList(currIndex, nextIndex);
        currIndex = nextIndex;
        return subList;
    }

    @Override
    public void remove() {
        throw new UnsupportedOperationException("Not allowed to remove");
    }
}
```





**线程池中的参数如何设置？**

上边使用了线程池进行并发推送消息，那么线程池的参数如何设置了呢？

这里主要说一下对于核心线程数量的设置，直接设置为 0，因为这个线程池主要是对促销活动的消息进行推送，这个推送任务并不是一直都有的，有间断性的特点，因此不需要线程常驻在线程池中，空闲的时候，将所有线程都回收即可

在这个线程池中，通过信号量来控制最多向线程池中提交的任务，如果超过最大提交数量的限制，会在信号量处阻塞，不会再提交到线程池中：

```java
public class SafeThreadPool {

    private final Semaphore semaphore;

    private final ThreadPoolExecutor threadPoolExecutor;

    // 创建线程池的时候，指定最大提交到线程池中任务的数量
    public SafeThreadPool(String name, int permits) {
        // 如果超过了 100 个任务同时要运行，会通过 semaphore 信号量阻塞
        semaphore = new Semaphore(permits);

        /**
         * 为什么要这么做，corePoolSize 是 0 ？
         * 消息推送这块，并不是一直要推送的，促销活动、发优惠券，正常情况下是不会推送
         * 发送消息的线程池，corePoolSize是0，空闲把线程都回收掉就挺好的
         */
        threadPoolExecutor = new ThreadPoolExecutor(
                0,
                permits * 2,
                60,
                TimeUnit.SECONDS,
                new SynchronousQueue<>(),
                NamedDaemonThreadFactory.getInstance(name)
        );
    }

    public void execute(Runnable task) {

        /**
         * 超过了 100 个 batch 要并发推送，就会在这里阻塞住
         * 在比如说 100 个线程都在繁忙的时候，就不可能说有再超过 100 个 batch 要同时提交过来
         * 极端情况下，最多也就是 100 个 batch 可以拿到信号量
         */
        semaphore.acquireUninterruptibly();
        threadPoolExecutor.submit(() -> {
            try {
                task.run();
            } finally {
                semaphore.release();
            }
        });
    }
}

// 自定义的线程工厂，创建的线程都作为守护线程存在
public class NamedDaemonThreadFactory implements ThreadFactory {

    private final String name;

    private final AtomicInteger counter = new AtomicInteger(0);

    private NamedDaemonThreadFactory(String name) {
        this.name = name;
    }

    public static NamedDaemonThreadFactory getInstance(String name) {
        Objects.requireNonNull(name, "必须要传一个线程名字的前缀");
        return new NamedDaemonThreadFactory(name);
    }

    @Override
    public Thread newThread(Runnable r) {
        Thread thread = new Thread(r, name + "-" + counter.incrementAndGet());
        thread.setDaemon(true);
        return thread;
    }
```



### 促销活动推送至用户完整流程【总结】

那么至此就通过 `分片 + 多线程` 生成了多个批次的消息推送到 MQ 中去了，接下来只需要在推送系统中订阅这个消息，这个消息中包含了多个分片用户的 `startUserId` 和 `endUserId`，这里将这个范围中的所有用户信息都查询出来，之后遍历每个用户信息，为每个用户都生成一条推送的消息放入到 List 集合中，之后再使用上边我们封装好的分片组件 `ListSplitter`，将 List 集合中的多个消息合并成为一条消息（保证每条消息不超过 1MB），之后再通过 MQ 发送出去，监听到这个消息之后，消费者根据用户的具体信息以及推送方式来真正去真正调用第三方推送平台的 API 给用户推送促销活动的信息，这里还使用到了 `设计模式：抽象工厂模式`，因为第三方推送平台有多个，这里需要根据用户信息中的推送类型来判断使用哪一种推送平台进行推送，那么就是通过抽象工厂创建 `具体工厂`，再通过具体工厂发送到用户的 `邮箱、微信、App` 中去，这里在推送每一个用户的消息时，可以通过 Redis 进行 `幂等性控制`，如果一个用户的信息已经推送过了，就在 Redis 中存储一下，避免重复推送，整体的促销活动创建到第三方平台进行推送的流程如下：

![1704181189206](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704181189206.png)







### Spring 如何结合 RocketMQ 创建生产者和消费者

在 Spring 的项目中，使用生产者的时候如果一个一个去创建肯定不合适，浪费了 Spring 自动帮助我们管理 Bean 的特性，对于生产者的使用，可以直接在 Spring 中创建一份 Bean，在需要用到的时候直接通过 @Resource 注入即可，创建 Producer 如下:

```java
@Slf4j
@Component
public class DefaultProducer {

    private final TransactionMQProducer producer;

    
    @Autowired
    public DefaultProducer(RocketMQProperties rocketMQProperties) {
        producer = new TransactionMQProducer(RocketMqConstant.PUSH_DEFAULT_PRODUCER_GROUP);
        producer.setCompressMsgBodyOverHowmuch(Integer.MAX_VALUE);
        producer.setVipChannelEnabled(true);
        producer.setNamesrvAddr(rocketMQProperties.getNameServer());
        start();
    }

    /**
     * 对象在使用之前必须要调用一次，只能初始化一次
     */
    public void start() {
        try {
            this.producer.start();
        } catch (MQClientException e) {
            log.error("producer start error", e);
        }
    }

    /**
     * 一般在应用上下文，使用上下文监听器，进行关闭
     */
    public void shutdown() {
        this.producer.shutdown();
    }

    /**
     * 发送消息
     *
     * @param topic   topic
     * @param message 消息
     */
    public void sendMessage(String topic, String message, String type) {
        sendMessage(topic, message, -1, type);
    }

    /**
     * 发送消息
     *
     * @param topic   topic
     * @param message 消息
     */
    public void sendMessage(String topic, String message, Integer delayTimeLevel, String type) {
        Message msg = new Message(topic, message.getBytes(StandardCharsets.UTF_8));
        try {
            if (delayTimeLevel > 0) {
                msg.setDelayTimeLevel(delayTimeLevel);
            }
            SendResult send = producer.send(msg);
            if (SendStatus.SEND_OK == send.getSendStatus()) {
                log.info("发送MQ消息成功, type:{}, message:{}", type, message);
            } else {
                throw new BaseBizException(send.getSendStatus().toString());
            }
        } catch (Exception e) {
            log.error("发送MQ消息失败：type:{}",type, e);
            throw new BaseBizException("消息发送失败");
        }
    }

    /**
     * 批量发送消息
     *
     * @param topic   topic
     * @param messages 多个消息
     */
    public void sendMessages(String topic, List<String> messages, String type) {
        sendMessages(topic, messages, -1, type);
    }

    /**
     * 批量发送消息
     *
     * @param topic   topic
     * @param messages 多个消息
     */
    public void sendMessages(String topic, List<String> messages, String type, Integer timeoutMills) {
        sendMessages(topic, messages, -1, timeoutMills, type);
    }


    /**
     * 批量发送消息
     *
     * @param topic   topic
     * @param messages 多个消息
     */
    public void sendMessages(String topic, List<String> messages, Integer delayTimeLevel, String type) {
        List<Message> list = new ArrayList<>();
        for (String message : messages) {
            Message msg = new Message(topic, message.getBytes(StandardCharsets.UTF_8));
            if (delayTimeLevel > 0) {
                msg.setDelayTimeLevel(delayTimeLevel);
            }
            list.add(msg);
        }
        try {
            SendResult send = producer.send(list);
            if (SendStatus.SEND_OK == send.getSendStatus()) {
                log.info("发送MQ消息成功, type:{}", type);
            } else {
                throw new BaseBizException(send.getSendStatus().toString());
            }
        } catch (Exception e) {
            log.error("发送MQ消息失败：type:{}",type, e);
            throw new BaseBizException("消息发送失败");
        }
    }

    /**
     * 批量发送消息
     *
     * @param topic   topic
     * @param messages 多个消息
     */
    public void sendMessages(String topic, List<String> messages, Integer delayTimeLevel, Integer timeoutMills, String type) {
        List<Message> list = new ArrayList<>();
        for (String message : messages) {
            Message msg = new Message(topic, message.getBytes(StandardCharsets.UTF_8));
            if (delayTimeLevel > 0) {
                msg.setDelayTimeLevel(delayTimeLevel);
            }
            list.add(msg);
        }
        try {
            SendResult send = producer.send(list, timeoutMills);
            if (SendStatus.SEND_OK == send.getSendStatus()) {
                log.info("发送MQ消息成功, type:{}", type);
            } else {
                throw new BaseBizException(send.getSendStatus().toString());
            }
        } catch (Exception e) {
            log.error("发送MQ消息失败：type:{}",type, e);
            throw new BaseBizException("消息发送失败");
        }
    }
    public TransactionMQProducer getProducer() {
        return producer;
    }
}

```





对于消费者来说，可以通过一个配置类，在配置类中创建一个个的消费者 Bean，监听不同的 Topic 并注册监听器，代码如下：

```java
@Configuration
public class ConsumerBeanConfig {

    /**
     * 注入 MQ 配置
     */
    @Autowired
    private RocketMQProperties rocketMQProperties;

    /**
     * 消费者1
     */
    @Bean("consumer1")
    public DefaultMQPushConsumer consumer1(ConsumerListener1 consumerListener1) throws MQClientException {
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("consumer_group_1");
        // 设置 nameserver 地址
        consumer.setNamesrvAddr(rocketMQProperties.getNameServer());
        // 订阅 topic
        consumer.subscribe(PLATFORM_COUPON_SEND_TOPIC, "*");
        // 注册监听器
        consumer.registerMessageListener(consumerListener1);
        consumer.start();
        return consumer;
    }
}
```









### 发送优惠券流程【落库+定时推送生产环境解决方案】

首先，还是先了解业务逻辑的背景，对于系统中不活跃的用户，需要通过给这些用户发送优惠券来激活这些用户的消费，那么在给这些用户发送优惠券的时候，可能并不想立即就发送，而是定时发送，那么这里的解决方案就是通过先将优惠券信息 `落库`，再通过 `xxl-job` 去扫描这个表执行优惠券推送给用户的任务

那么整个发送优惠券的流程如下：

![1704197963010](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704197963010.png)



这里先主要说一下如何对定时任务进行落库的，首先创建了一个优惠券，将这个优惠券进行推送，那么既然定时推送，就需要在优惠券的信息中定义 3 个数据：`定时推送开始时间`、`定时推送结束时间` 和 `推送轮次`，推送轮次表示在开始推送到推送结束这之间需要推送多少次

定时任务的落库就是通过这 3 个数据计算出来每一次推送的时间点，每一次推送都作为一个定时任务落库，如果 `推送轮次 = 1`，那么直接将 `定时推送的开始时间` 作为任务执行时间即可，如果 `推送轮次 > 1`，那么需要通过 `(定时推送结束时间 - 定时推送开始时间) / 推送轮次` 来拿到每次任务的执行时间，将每次需要执行的定时任务都落库存储即可

至此，给不活跃用户发送优惠券的主流程就已经结束了，接下来就进入到 `xxl-job 去扫描定时任务并执行的阶段`，xxl-job 执行流程如下：

1. 首先去数据库中扫描 `执行时间 <= 当前时间` 并且 `没有执行过` 的任务

2. 将该定时执行任务发送到 MQ 中，等待消费者消费

   这里推送定时任务到 MQ 中，还是需要进行 `分片 + 多线程进行推送` 来提升推送速度（因为需要推送的用户数量太庞大），分片 + 多线程优化推送的流程和上边 `创建促销活动` 时是一样的，这里就不重复说了

3. 发送到 MQ 之后，将该任务状态修改为 `已执行`，并修改数据库



总结来说，定时发送优惠券就是先将定时任务落库，再通过 xxl-job 去扫描定时任务进行推送即可







### 大量定时任务通过 xxljob 执行【优化方案】

这里讲的大量定时任务是什么呢？

首先，还是说一下业务背景，对于热门商品的推送在电商场景中是很常见的，那么每一个热门商品所需要推送给的用户可能都是不同的，因此会通过另外一个推荐系统，计算出大量的热门商品，之后再对这些热门商品进行用户的推送，而热门商品推送给用户一般也是定时进行推送的，这里使用了 `xxl-job` 来进行实现定时的推送，但是这里需要推送的商品数量也是很多的，单靠一个机器进行定时推送速度很慢，那么这里就通过任务分片来加快推送的速度

先获取 `当前任务的分片索引`，再获取 `总共任务分片的数量`，之后可以通过需要推送商品的 id 来进行分片处理，下边写一个简单的伪代码：

```java
@XxlJob("job")
public void job() {
  // 获取 xxlJob 中当前任务的分片索引
  int shardIndex = Optional.of(XxlJobHelper.getShardIndex()).orElse(0);
  // 获取 xxlJob 中当前任务的总分片数量
  int totalShardNum = Optional.of(XxlJobHelper.getShardTotal()).orElse(0);
  // 循环任务，推送到 MQ 中
  for (Good good : goods) {
	Long goodId = good.getId();
    // 计算出商品 id 应该被哪一个任务分片处理
    int curNo = goodId.hashCode() % totalShardNum;
    // 如果当前任务分片索引和商品需要被处理的分片索引不同，就不处理，直接跳过
    if (curNo != shardIndex) {
      continue;
    }
  }
}
```



需要推送的商品和任务执行的分片对应关系如下：

![1704257922300](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1704257922300.png)











### 项目中为什么要引入 RocketMQ？【面试】

在面试的时候，讲项目要讲整个业务闭环讲清楚，以及引入中间件的需要和背景

项目中引入 RocketMQ 的优点在于：

- 削峰填谷
- 异步优化
- 高扩展性

首先对于 `削峰填谷`，在 RocketMQ 中通过减少消费者的线程数或者限制消费者的消费能力来进行削峰，在系统低负载期间，通过增加消费者的线程数量来进行填谷，可以保证系统在运行期间，负载基本上处于一个稳定的状态，不会突然因为极高的负载而出现意外情况

其次是异步优化，这是很关键的，比如在运营人员创建完促销活动之后，需要对用户进行活动的推送，那么这个推送是很消耗时间的，因此需要将推送的任务在创建促销活动中异步出去，将耗时任务从主流程中剥离出去慢慢执行，不影响主流程的执行时间

对于高扩展性，在用户创建完订单之后，如果取消订单，在不使用 MQ 的情况下，需要在取消订单的逻辑中去一个一个执行取消订单后需要执行的操作，如下：

- 库存系统释放库存
- 返还用户积分
- 释放用户使用的优惠券

这样会导致取消订单的动作和其他业务耦合度很高，如果使用 MQ 之后，只需要在这三个地方关注订单取消的事件，不需要将取消订单中做很多耦合的操作

如果后续需要对取消订单做出调整，只用在订阅【取消订单】事件的位置修改代码即可



## RocketMQ 集群调优

这里主要说明一下 RocketMQ 集群部署之后，如果需要对 RocketMQ 进行调优需要从哪几个方面进行调整

- JVM 参数调整

Broker 是很吃内存的，所以要给 Broker 多分配一些内存，比如说 4C8G 的服务器，可以分配给 Broker 4G 的堆内存，新生代分配 2G，并且不允许堆内存自动扩展，虽然 RocketMQ 使用的 G1 垃圾回收器，但是开发者认为，MQ 是一个特点很鲜明的系统，比较吃内存，那么直接给一个固定的大内存，比起给定一个范围，让 G1 不断去调整效率更高

`-server -Xms4g -Xmx4g -Xmn2g`



MQ 是使⽤⻚缓存的，这个参数可以在 RocketMQ 开启的时候，预先把每⼀⻚都分配好，缺点是会导致RocketMQ启动速度变慢，如果不关心启动速度，开启这个参数是⼀个更好的⽅式，可以在 RocektMQ 运⾏初期提升性能，运⾏⼀段时间之后，性能没有差异

`-XX:+AlwaysPreTouch`



官方推荐关闭偏向锁，可以减少 gc 停顿时间

`-XX:-UseBiasedLocking`



官方推荐指定 G1 为分配担保预留 25% 的空间，也就是老年代会预留 25% 的空间给新生代的对象今生，这个值默认是 10%

`-XX:G1ReservePercent=25`





通过 -XX:InitiatingHeapOccupancyPercent 指定触发全局并发标记的⽼年代使⽤占⽐，默认值 45%，也就是⽼年代占堆的⽐例超过 45% ，如果 Mixed GC 周期结束后⽼年代使⽤率还是超过 45%，那么会再次触发全局并发标记过程，这样就会导致频繁的⽼年代GC，影响应⽤吞吐量。

这个参数调整成 30 性能会更好。

`-XX:InitiatingHeapOccupancyPercent=30`



这些参数都是 RocketMQ 官方经过测试后的推荐参数设置，在 Broker 启动的文件中都已经设置好了

如果我们需要自己添加参数来调整的话，可以指定 `期望的 GC 停顿时间 -XX:MaxGCPauseMillis=20 `，即期望停顿 20ms，因为 RocketMQ 需要很高的性能，所以停顿时间的设置是很重要的，但是也不可以设置的过小，如果设置的太小，会导致每次回收对象太少，新生代空间很容易不足，最后频繁触发 YGC，导致大量对象晋升老年代过快，导致频繁 full gc！

