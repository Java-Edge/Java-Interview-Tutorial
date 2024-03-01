---
typora-copy-images-to: imgs
---



# 作者

- 【11来了】：目前在读研究生，现处于研二，现在计划更新常用中间件系统性学习内容，2024年初会进行暑期实习面试，到时候会在公众号分享面试分析！
- 微信公众号：发送 `资料`  可领取当前已整理完毕的 Redis、JVM 、MQ 等系列完整 pdf！

![1703670499276](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1703670499276.png)

- CSDN：https://blog.csdn.net/qq_45260619?spm=1011.2415.3001.5343



# Redis 深入理解



## Redis Server 运行原理

![1700542695254](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1700542695254.png)



## Redis 服务器中 Socket 网络建立以及文件事件模型

一个 redis 单机，可以抗几百上千的并发，这里的并发指的就是同时可以有几百个 client 对这个 redis server 发起请求，都需要去建立网络连接，同时间可能会有几百个 redis client 通过 socket 和我们的 redis server socket 建立网络连接



如果自己使用 java socket 编程，无论使用 nio、bio，一旦要是说一个 server 和一个 client 完成了一个网络连接之后，就会多出来一个 socket，socket 是抽象出来通信的模型，通过一个 socket 就可以跟对方的 socket 形成一个连接



那么对于 redis server 而言，内部为了支撑并发访问的大量的 redis client，redis server 内部就会有几百个 socket，网络连接同时在维持着

因此呢，在 bio 模式下，一个 socket 连接就对应了一个线程来监听请求

在 nio 模式下，可以实现 IO 多路复用，一个线程就可以监听多个 socket 的网络事件

在 redis server 中，就是通过 `FileEventHandler` 进行多路复用

socket 中会产生一些网络事件，accept（连接应答）、read（有数据可以读的事件）、write（有数据可以写的事件）、close（连接被关闭） 在 redis 中这些`网络事件`都被抽象为`文件事件`

## 基于队列串行化的文件事件处理机制

针对 server 端的大量的 socket，不太可能每一个 socket 都使用一个线程来监听，因为线程资源不够，所以不会采用 bio 模式，因此解决方案就是针对大量的 socket，使用一个线程监听 n 多个 socket，采用 IO 多路复用模式

当 server 端保持了大量的 redis client 的连接，可能在同一时间，大量的 redis client 并发的给 server 端发送大量的请求，redis server 内部大量的 socket 会突然同一时间产生大量的事件（例如 read 事件，write 事件）

对于这些网络事件的处理，有两种解决方案（Redis Server 中就采用了第一种，使用队列进行串行化处理）：

- 使用 queue 队列，将接收到事件的 socket 放入 queue 中进行排队，串行化进行处理
- 将有事件发生的 socket 分发给不同的线程，来进行并发的处理，开启大量的多线程，多个线程并发的去处理不同的 socket 里面的事件



client 和 server 端建立连接的流程为：

我们会有一个专门的 socket 去监听端口，用于监听来自客户端的连接请求，这个连接请求经过 IO 多路复用，由 `连接应答处理器` 进行处理，处理的操作其实也就是服务端和客户端进行 TCP 三次握手建立连接，建立好连接之后服务端就会创建一个新的 socket，这个 socket 就是接收客户端对应的事件

那么连接建立之后，客户端对于服务端的一些读写请求就会通过 socket 进行请求，请求到达服务端之后，通过 IO 多路复用将任务分发给不同的事件处理器进行处理，如果是读写请求，就将读写的响应通过 socket 响应给客户端



## Redis 串行化单线程模型为什么能高并发？

首先 Redis 是通过 `串行化 + 单线程` 来应对高并发的

Redis 首先是基于内存操作，速度很快，并且当大量请求进入后，都放入队列中，进行串行化处理，由单个线程直接基于内存进行操作，并且单线程的情况下也不需要加锁以及线程上下文切换（多线程是很占用 CPU 资源的），核心就在于 Redis 通过单线程基于内存进行操作！

## Redis 内核级请求处理流程

Redis Server 其实就是 Linux 服务器中的一个进程

主要还是下图的流程

1. 应用先和 server 端建立 TCP 连接
2. 建立连接之后，server 端就会有一个与该客户端通信的 socket，客户端的读写请求发送到服务端的 socket
3. 那么通过 IO 多路复用，收到读写请求的 socket 会到队列中排队等待处理
4. 由文件事件分发器将事件分发给对应的命令请求处理器
5. server 端内部也是有一个 Redis Client 的，由这个 Client 来处理对数据的操作，这个 Client 有一个输入缓冲区和输出缓冲区，先将读写命令写入输入缓冲区
6. 再去找到对应的 Redis Command 也就是查找到对应的命令
7. 之后就去操作内存中的数据
8. 操作后将操作结果写入输出缓冲区中
9. 最终命令请求处理器将输出缓冲区中的响应结果通过 Socket 发送给客户端

![1700542695254](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1700542695254.png)



## Redis 数据传输协议

参考文章：https://redis.com.cn/topics/protocol.html

Redis客户端和服务器端通信使用名为 **RESP** (REdis Serialization Protocol) 的协议。虽然这个协议是专门为Redis设计的，它也可以用在其它 client-server 通信模式的软件上。

该协议用于 Redis 客户端和服务端之间进行通信



**RESP 协议格式：**

- 单行字符串（Simple Strings）： 响应的首字节是 `+`
- 错误（Errors）： 响应的首字节是 `-`
- 整型（Integers）： 响应的首字节是`:`
- 多行字符串（Bulk Strings）： 响应的首字节是 `$`
- 数组（Arrays）：响应的首字节是 `*`

RESP 协议的每一个部分都是以 `\r\n` 结束，也就是换行结束



**AOF 持久化文件中存储的数据也是 RESP 协议的数据格式。**



**RESP 协议优点：**

- 实现简单，容易解析

  ```bash
  redis 的 set key value 命令转为 RESP 协议数据如下：
  *3
  $3
  SET
  $3
  key
  $5
  value
  ```


- RESP 是二进制安全的，因为使用了前缀长度来传输大量数据，因此不需要去检查内容中是否存在特殊字符

## Redis 内核中的请求数据结构

Redis 协议说明文档：http://www.redis.cn/topics/protocol.html

```bash
# *3 表示有 3 个命令字符串
# $3 表示长度
# \r\n 也就是换行操作
*3\r\n$3\r\nSET\r\n$3\r\nkey\r\j$5\r\nvalue\r\n

# 把\r\n翻译成换行，数据就为下边这个样子
*3
$3
SET
$3
key
$5
value
```

对于 `set key value` 命令来说，通过协议组织成上边的数据，那么从 client 端发送到 server 需要序列化成字节数据流，之后再通过 socket 进行传输，server 端收到字节流数据之后，会进行反序列化，将字节流数据转为了 `*3\r\n$3\r\nSET\r\n$3\r\nkey\r\j$5\r\nvalue\r\n`，这个数据就会被放到 server 端的 RedisClient 的输入缓冲区中

那么这个协议数据在 server 中的 Redis Client 中，就会被解析成 argv 的一个参数，也就是具体的命令，如下图：

![1700549162004](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1700549162004.png)

那么在 argv 中就解析出来了真正需要执行的命令了，下一步就要执行对应的命令了



## Redis 内核中命令函数的查找

在 Redis Server 中将所有的命令都放在了一个`命令查找表`中，那么在上边的 argv 中拿到了命令的名称，就可以去命令查找表中去查找对应的 RedisCommand，在 Redis Client 的输入缓冲区中有一个变量 `cmd` 就会去指向该命令所对应的 RedisCommand，之后就可以真正的去调用命令函数，来操作 Redis 中的内存数据结构，之后将操作的结果还是按照 Redis 的协议给放入到 Redis Client 的输出缓冲区中，之后就可以通过 Socket 将结果返回给客户端了

![1700549320844](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1700549320844.png)



## Redis Server 启动流程分析

Redis 我们作为缓存使用比较多

其实 Redis 本质上是一个基于内存的 Nosql 数据存储服务，只是因为 Redis 是基于内存进行操作，比较快，所以我们用来做缓存

那么 Redis Server 基于内存操作，如果 Redis 重启之后，内存中的数据就会丢失，所以 Redis 还需要进行持久化的一个操作

那么持久化就分为了 RDB 和 AOF，RDB 的话是周期性将内存中的全量数据都给复制到磁盘中（存储文件为压缩的二进制文件），适合做数据的冷备份，放到其他服务器的磁盘上去，如果当前服务器磁盘损坏，就可以从其他服务器读取该 RDB 文件，恢复 Redis 中的内存数据

`一般使用 AOF 来做数据的持久化，用 RDB 做一个周期性的冷备份`

AOF 将内存数据同步到磁盘中，一般采用每秒同步一次，如果同步频率过高，就会导致 Redis 性能退化，当 Redis 突然宕机，可能会丢失 1s 内的内存数据，那么在 redis-server 进程重启时，就会把磁盘存储的 aof 文件的数据给读取到内存中，还原 Redis 上次运行时的内存情况



## Redis 为什么需要分布式集群模式？

单台 Redis 瓶颈在哪里？

在于内存，每一台机器的内存是有限的，所以如果数据量很大的情况下，一台 Redis 就不够用了，因此需要分布式集群模式

在分布式集群模式中，就可以让每一个节点存储一部分的数据，来降低内存容量对于 Redis 的影响



## Redis 分布式集群模式下内核中的数据结构

Redis Server 在分布式模式下，需要存储哪些内容的？

主要是存储集群的状态（state）以及集群中的节点（nodes），以及当前节点的一个角色（myself）

![1700556896123](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1700556896123.png)





## Redis 节点之间的三次握手原理分析

比如多台 Redis 之间要建立集群，那么连接其中的一台 Redis 客户端，向其他 Redis 发送 `meet` 命令即可通知其他节点，那么发送 `meet` 命令给其他节点后，对方也会在内存中创建一个 ClusterNode 结构，来维护集群中的节点信息

这里的三次握手指的是 Redis 中的三次握手用来建立应用层的连接（即进行集群节点之间的连接），与 TCP 三次握手不同

那么 Redis 中集群的建立就是通过 `三次握手 + Gossip 协议` 来实现的

Gossip 协议也被称作是具有代表性的最终一致性的 `分布式共识协议`，特点就是需要同步的信息如同流言一般进行传播

Gossip 协议具体流程就是，对于需要同步的信息，从信息源节点开始，随机选择连接的 k 个节点来传播消息，每一个节点收到消息后，如果之前没有收到过，就也发送给除了之前节点的相邻的 k 个节点，直到最后整个网络中的所有节点都收到了消息，达到了最终一致性。

## 基于 slots 槽位机制的数据分片原理

在 Redis 分布式集群中，我们将数据分散的放在了各个 Redis 节点中，这样才可以更好利用分布式集群的优点（增加数据读写速度、分散存储数据的话，增加集群节点也就相当于扩大 Redis 内存），那么如何来`组织数据的存放位置呢`？

并且还存在一个问题，在集群扩容或者缩容时，也就是集群节点增加或者减少，那么就需要进行`数据迁移`

解释一下为什么要进行数据迁移：如果在集群中新增加一个节点，那么该节点中的数据是空的，那么肯定不合理，因此要将其他节点中的数据转移一部分数据到新的集群节点中去，缩容同理



那么对于 `组织数据存放位置` 以及 `数据迁移` 这两个问题是如何解决的呢？

通过 `槽位机制` 来实现

我们先来了解一下数据分片的概念，数据分片通过将数据拆分为更小的块（即分片），并将其存储在多个数据库服务器上来解决海量数据的存储，那么在 Redis 中的数据分片是通过 `槽位机制` 来实现的，集群将所有的数据划分为 `16384` 个槽位，`每个槽位就是一个数据分片`，每个节点负责其中一部分，那么在集群扩容或缩容时，通过给新节点分配槽位来实现数据迁移



## Redis 集群 slots 分配与内核数据结构

那么已经知道了 Redis 集群中通过 `slots` 来实现数据分片，那么集群中的每个节点不仅存储了自己拥有的槽位，还存储了整个集群槽位以及哪个槽位属于哪个节点

每个节点分配好了自己的槽位之后，会把自己的槽位信息同步给集群中的其他的所有节点

在集群中的每个节点中，以下边的数据结构来存储集群的槽位信息以及自己所拥有的槽位信息

![1700752542607](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1700752542607.png)



## 基于 slots 槽位的命令执行流程分析

比如客户端需要插入一个 key-value，那么该键值对肯定属于一个 slot，slot 一定属于一个节点，那么我们通过客户端去插入这个键值对时，客户端会先随机找一个节点发送命令过去，节点内部会计算这个 slot 属于哪个节点

通过 CRC16 算法对 key 值进行哈希，并且对 16384 取模来获取具体的槽位，再随便找一个节点查看集群槽位分配情况，如果该节点需要存放的槽位属于当前节点，直接执行命令就可以；如果不是自己的节点，那么该节点会返回给客户端一个 `MOVED（slot + 目标地址）`，再将请求进行重定向





## 基于跳跃表的 slots 和 key 关联关系

在集群模式中，所有的数据被划分到 16384 个槽位中，每一个槽位都有一部分的数据，客户端在发送命令的时候，在 server 端也会计算 key 所属的槽位，就可以把数据放在槽位里

每次操作完 key-value 数据之后，对于这个 key，会使用专门的 skipList 跳跃表数据结构，来跟 slot 做一个关联



那么 slot 和 key 之间的关联关系是通过 skipList 来实现的

skipList 的结构如下，包括 4 部分：header（头结点）、tail（尾结点）、level（跳表层级）、length（跳表长度）

![1701091635446](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701091635446.png)

那么跳表中每个节点包含了：对象、score、BW、L1、L2...L32指针，那么在存储 key 与 slot 的对应关系时，对象字段存储的就是 `key` 的值，score字段存储的就是`槽位`的值，表示该 key 属于哪个 slot 槽位



## 集群扩容时的slots转移过程与ASK分析

如果在集群中加入新的节点，可以通过命令把某个节点上的一部分`槽位`转移到新的节点中去

那么 slots 的转移过程依赖于 clusterState 中的两个数据结构：`clusterNode *migration_slots_to[16384]` 和 `clusterNode* importing_slots_from[16384]`

这两个数据结构都是指向了一个 clusterNode 数组

`importing_slots_from[]` 记录了槽位从哪些节点中转移过来，如果 `importing_slots_from[i]` 不是 null，而是指向了一个 clusterNode，那么表示正在从这个 clusterNode 中导入槽位 i

`migration_slots_to[]` 记录了槽位转移到哪些节点中去，如果 `migration_slots_to[i]` 不是 null，而是指向了一个 clusterNode，表示正在向这个 cluster 转移该槽位



那么在槽位的迁移过程中，会出现 ASK 错误：

即如果在转移的过程中，对一个节点中进行 key-value 操作，计算槽位之后，发现槽位并不在当前节点（已经被迁移走了），那么就返回客户端 `ASK` 错误，引导客户端去操作该槽位转移到的节点，那么客户端接收到 ASK 错误后，根据错误提供的 IP 地址和端口号，再去操作目标节点，在操作目标节点之前，会先发送 `ASKING` 命令，因为此时正在迁移过程中，槽位还在新节点的 `importing_slots_from` 中，如果不发送 `ASKING` 命令，目标节点此时还没有完成槽位迁移，会以为槽位还不在自己这里，就返回给客户端 `MOVED` 命令，让客户端又去找原来的节点了，完整流程如下：

![1701091430432](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701091430432.png)



## Redis 主从挂载后的内核数据结构分析

- 主节点中，会通过 clusteNode 中的 `slaves` 来记录该主节点包含了哪些从节点，这个 `slaves` 是一个指向 `*clusterNode[]` 数组的数据结构
- 从节点中，会通过 clusterNode 中的 `slaveof` 来记录该从节点属于哪个主节点，指向了主节点的 clusterNode

下图带颜色的为主从架构中的内核数据结构：

![1701149859008](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701149859008.png)



## Redis SYNC 主从复制原理以及缺陷

Redis 的主从复制是在不断演进过程中的，那么主从复制的目的也就是将主节点上的数据传输给从节点

那么这个演进过程中的目的就是尽量加快主节点数据向从节点的同步速度

首先，需要考虑当从节点第一次连接上主节点后，如何同步主节点的数据呢？

其次要考虑如果从节点宕机或者重启之后，重新连接上主节点，此时又该如何同步主节点的数据呢？

从节点第一次连接上主节点，我们可以通过生成 RDB 快照，将数据全量同步给从节点，并将之后的命令通过缓冲区不断同步给从节点

如果从节点断线之后重连主节点，那么我们就要合理的设置缓冲区的大小，来保证尽量进行增量同步，而不是全量同步

因此主从复制演进过程中的目标就是能增量同步就增量同步，尽量避免全量同步

关于主从复制原理的演进过程以及百度智能云在主从复制上的优化实践，可以参考文章：[Redis 主从复制原理以及痛点](https://blog.csdn.net/qq_45260619/article/details/134541668)





## Redis 定时 PING 与疑似下线分析

接下来我们来了解一下在 Redis 主从架构下，如何进行故障探测？

每个 redis 节点，都会定时发送 ping 消息给其他所有节点，探测其他节点是否存活，如果节点存活，则会返回 pong 消息，在规定时间没有收到 pong 消息的话，发送 ping 消息的节点就会将该节点标记为 `pfail(疑似下线)`

如果在集群中有半数以上的节点认为一个节点疑似下线，那么此时就可以将该节点标记为 `fail（正式下线）`

那么这就是故障探测的原理，就是通过 ping+pong 消息进行探测，当集群半数以上节点认为某个节点`疑似下线`，那么就将该节点标记为`正式下线`，并且将该节点`正式下线`的消息同步给其他所有节点 



## Redis 主节点选举算法以及故障转移

在 Redis 主从架构中，master 挂掉之后，该 master 下的 slave 会感知到主节点的下线状态，就会尝试向其他主节点发送投票请求，表示自己想要当 master 节点，那么其他 master 会投票给收到的第一个请求的 slave 节点

如果一个 slave 收到了半数以上 master 的投票，那么该 slave 就被选举成为了新的 master，他再去通知所有的节点，并且将之前下线的 master 的槽位转移到自己这里，之后所有的 slave 都从新的主节点中同步数据

那么这个主节点选举的流程原理可以参考文章：[Redis切片集群以及主节点选举机制](https://blog.csdn.net/qq_45260619/article/details/134667150?spm=1001.2014.3001.5502)





## 总结

通过 Redis 深入理解，可以从总体上了解到 Redis 单体架构下，server 端是如何运行起来的，以及他是如何客户端建立连接并且接收客户端时间进行处理这样一个流程

以及在 Redis 集群模式下，Redis 主从节点的内核数据结构是怎样的，集群之间槽位的转移，集群节点之间通信，集群故障探测原理，主从同步数据原理以及主节点选举原理

如果需要进一步了解 Redis 内核，可以从以下几个方面入手：

- Redis 内核数据结构
- 持久化机制
- pub/sub、事务、lua、慢查询





## 社区电商业务闭环知识讲解

首先来讲一下 Feed 流的含义：

Feed 流指的是当我们进入 APP 之后，APP 要做一个 Feed 行为，即主动的在 APP 内提供各种各样的内容给我们

在电商 APP 首页，不停在首页向下拉，那么每次拉的时候，APP 就会根据你的喜好、算法来不停地展示新的内容给你看，这就是电商 APP 的 Feed 流了



那么接下来呢就基于首页 Feed 流以及社区电商 APP 中的一些业务场景，来实现一套基于 Redis 的企业级缓存架构，MySQL 为基础，RocketMQ 为辅助



那么在缓存中常见的问题有：

- 热 key 问题
- 大 key 问题
- 缓存雪崩（穿透）
- 数据库和缓存数据一致性问题



在 Redis 生产环境中，也存在一些问题，如下：

- Redis 集群部署，需要进行高并发压测
- 监控 Redis 集群：每个节点数据存储情况、接口 QPS、机器负载情况、缓存命中率
- Redis 节点故障的主从切换、Redis 集群扩容



下边我们来逐个剖析在缓存架构中常见的一些问题



首先，热 key 举个例子就是微博突然某个明星出现新闻，那么会有大量请求去访问这个数据，这个 key 就是热 key

大 key 指的是某个 key 所存储的 value 很大，value 多大 10 mb，那么如果读取这个大 key 过于频繁，就会对网络带宽造成影响，阻塞其他请求



缓存雪崩是因为大量缓存数据同时过期或者 Redis 集群故障，如果因为缓存雪崩导致 Redis 集群都崩掉了，那么此时只有数据库可以访问，我们的系统需要可以识别出来缓存故障，立马对各个接口进行限流、降级错误，来保护数据库，避免数据库崩掉，可以在 jvm 内存缓存中存储少量缓存数据，用于在 Redis 崩了之后提供降级备用数据，那么流程为：限流 --> 降级 --> jvm 缓存数据





## 读多写少数据缓存

那么我们先来分析一下在社区电商中，用户去分享一个内容时，对于用户个人信息这样`读多写少`的数据该如何操作缓存：

1. 用户分享内容
2. 加锁：针对用户 id 上分布式锁，避免同一用户重复请求，导致数据重复灌入
3. 将用户分享内容写入数据库
4. 将用户的个人信息在缓存写一份`（用户信息在注册后一般不会变化，读多写少，因此用户信息非常适合放入缓存中）`，这样在后续高并发访问用户的数据时，就可以在缓存中进行查询，根据用户前缀 + 用户 id 作为 key，并设置缓存过期时间，过期时间可以设置为 2 天加上随机几小时（添加随机几小时的原因是避免同一时间大量缓存同时过期）
5. 释放锁



### 缓存自动延期以及缓存穿透

那么上边我们已经对用户的个人信息进行了缓存，那么某些热门的用户是经常被很多人看到的，而有些冷门用户的内容没多少人看，因此将用户信息的缓存过期时间设置为 `2天+随机几小时` ，因此我们针对热门的用户信息数据，要做一个缓存自动延期，因此只要访问用户数据，那么就对该缓存数据进行一个延期，流程如下：

1. 获取用户个人信息
2. 根据 `用户前缀 + 用户id` 作为 key 去缓存中查询用户信息



```java
public UserInfo getUserInfo(Integer userId) {
  // 这里的 redisCache 和 redisLock 都是我们自己封装的工具类，通过 @Component 注册为 Spring Bean 进行使用
  // 读缓存
  String userInfoJson = redisCache.get("user_info_lock:" + userId);
  if (!StringUtils.isEmpty(userInfoJson)) {
    // 取到的是空缓存 避免一致访问数据库不存在的数据导致缓存穿透
    if ("{}".equals(userInfoJson)) {
      // 延期缓存
      redisCache.expire("user_info_lock:" + userId, expireSecond);
      // 返回空对象
      return new UserInfo();
    } else {
      // 延期缓存
      redisCache.expire("user_info_lock:" + userId, expireSecond);
      UserInfo userInfo = JSON.parseObject(productStr, UserInfo.class);
    }
  }
  // 如果缓存中没有取到数据，则在数据库中查，并放入缓存
  lock("user_lock_prefix" + userId); // 上分布式锁 伪代码
  try {
    // 读数据库
    UserInfo userInfo = userInfoService.get(userId);
    if(userInfo != null) {
      // 如果用户信息不为空，就将用户数据写入缓存
      redisCache.set("user_info_lock:" + userId, JSON.toJSONString(userInfo), expireSecond);
    } else {
      // 如果数据库为空，写入一个空字符串即可
      redisCache.set("user_info_lock:" + userId, "{}", expireSecond);
    }
  } finally {
    unlock("user_lock_lock:" + userId); // 解锁
  }
}
```





### 缓存+数据库双写不一致

在上边存储用户个人信息时，使用的是 `缓存+数据库双写`，这样可能造成数据不一致性，如下：

有两个线程并发，一个读线程，一个写线程，假设执行流程如下，会造成双写不一致

- 当读线程去缓存中读取数据，此时缓存中数据正好过期，那么该线程就去读数据库中的数据
- 此时写线程开始执行，修改用户信息，并且写入数据库，再写入缓存
- 此时读线程再接着执行，将之前在数据库中读取的旧数据写入缓存，覆盖了写线程更新后的数据

造成这种情况的原因是，在读的时候，加的是读锁，key 为 `user_info_lock:`，在写的时候，加的是写锁，key 为 `user_update_lock:`，那么读写就可以并发

想要解决的话，可以让读和写操作加同一把锁，让读写串行化，就可以了，如下：

让读和写都加同一把锁：`user_update_lock`

- 针对先读后写的情况，就不会出现双写不一致了，读的时候先加上锁`user_update_lock`，此时缓存假设正好过期，去数据库中读取数据，此时写线程开始执行，阻塞等待锁`user_update_lock`，此时读线程再去数据库读取数据放入缓存，结束后释放锁，那么写线程再拿到锁操作数据库，再将数据写入缓存，那么缓存中的数据是新数据
- 针对先写后读的情况，也不会出现双写不一致，在写的时候，加上锁 `user_update_lock`，那么在并发读的时候，先获取缓存内容，如果获取不到，尝试去 DB 中获取，此时就会阻塞等待锁 `user_update_lock`，在写线程写完之后更新了缓存，释放锁，此时读线程就拿到了锁，此时在去数据库中查数据之前再加一个 `double check（双端检锁）` 的操作，也就是再尝试去缓存中取一次数据，如果取到了就返回；如果没有取到，就去数据库中查询

那么完整的写和读操作流程如下图：

![1701224932040](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701224932040.png)





### 高并发场景下优化

在上边我们已经使用读写加同一把锁来实现缓存数据库双写一致了

但是还存在一种极端情况：某一个用户的信息并不在缓存中，但是突然火了，大量用户来访问，发现缓存中没有，那么大量用户线程就阻塞在了获取锁的这一步操作上，导致大量线程串行化的来获取锁，然后再到缓存中获取数据，下一个线程再获取锁取数据

这种情况的解决方案就是给获取锁加一个超时时间，如果在 200ms 内没有拿到锁，就算获取锁失败，这样大量用户线程获取锁失败，就会从串行再转为并发从缓存中取数据了，避免大量线程阻塞获取锁

完整流程图如下，粉色部分为优化：

![1701238918866](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701238918866.png)



代码如下：

```java
private UserInfo getUserInfo(Long userId) {
    String userLockKey = "user_update_lock:" + userId;
    boolean lock = false;
    try {
        // 尝试加锁，并设置超时时间为 200 ms
        lock = redisLock.tryLock("user_update_lock:", 200);
    } catch(InterruptedException e) {
        UserInfo user = getFromCache(userId);
        if(user != null) {
            return user;
        }
        log.error(e.getMessage(), e);
        throw new BaseBizException("查询失败");
    }
    // 如果加锁超时，就再次去缓存中查询
    if (!lock) {
        UserInfo user = getFromCache(userId);
        if(user != null) {
            return user;
        }
        // 缓存数据为空，查询用户信息失败，因为用户没有拿到锁，因此也无法取 DB 中查询
        throw new BaseBizException("查询失败");
    }
    // 双端检锁，如果拿到锁，再去缓存中查询
    try {
        UserInfo user = getFromCache(userId);
        if(user != null) {
            return user;
        }
        String userInfoKey = "user_info:" + userId;
        // 数据库中查询
        user = userService.getById(userId);
        if (Objects.isNull(user)) {
            // 空缓存过期时间设置的短一些
            redisCache.set(userInfoKey, "{}", RandomUtil.genRandomInt(30, 100));
            // 返回空对象或返回 null，看具体业务场景了
            return new UserInfo();
        }
        // 缓存时间设置为 2 天 + 随机几小时
        redisCache.set(userInfoKey, JSON.toJSONString(user), 2 * 24 * 60 * 60RandomUtil.genRandomInt(0, 10) * 60 * 60);
        return user;
    } finally {
        redisLock.unlock(userLockKey);
    }
```





### 总结

通过缓存 + 数据库双写来存储读多写少的数据，我们对缓存中的数据都设置一个过期时间，设置为 `2天 + 随机几小时`，设置过期时间的目的是用于将冷门数据给过期掉，让缓存中尽可能留下热门数据，过期时间加上随机几小时的目的是避免大量缓存在同一时间过期，如果刚好过期，又刚好有大量请求进入，就会导致缓存穿透

通过使用分布式锁来实现数据库和缓存的数据一致性

并且给读操作获取锁的操作设置过期时间，避免大量用户线程串行化操作，可以提升高并发场景下的性能





## 分页列表缓存的延迟构建

首先，先来讲一下`业务场景`，用户会在 APP 中去分享内容，那么假如用户分享的是美食菜谱内容，在用户分享之后，先将这个美食菜谱的内容作为 k-v 进行缓存，但是呢，其实对于用户分享的美食菜谱内容其实是会进行分页查询的，比如说别人点击进入你的主页，肯定是分页查询你主页分享的内容，那么我们就要考虑一下什么时候对这个分页查询的缓存列表进行构建呢？

那么这里列表缓存的构建时机有两个：

- 第一个是真正来查询该用户分享的内容列表时（延迟构建，在真正查询时再进行构建，避免占用 Redis 内存），此时先在数据库中查询分页数据，再去缓存中构建分页缓存
- 第二个是用户修改或者新增分享的内容时，此时通过 RocketMQ 来异步通知，去对缓存中的分页列表进行重新的构建

那么可以来看一种并发下的极端情况：

当用户 A 新增分享的时候，另一个用户 B 此时正好来查询用户 A 的分享列表，用户 B 线程先去缓存中查询，发现没有，再去数据库中查询用户 A 的分享列表，此时 B 拿到了 A 新增分享之前的旧数据，此时如果用户 A 新增分享并落库，并且去缓存中对用户 A 的列表缓存进行重建，那么此时缓存列表中是用户 A 的最新数据，但是此时用户 B 的线程在数据库中已经查到了用户 A 的旧数据，用户 B 的线程继续执行，将用户 A 的旧数据给放入到列表缓存中，覆盖掉了用户 A 更新的缓存，那么此时就会导致`缓存数据库不一致`

解决办法就是在这两处构建缓存的时候都加上分布式锁即可，加分布式锁的地方在下图标红的位置：

**查询用户列表时，分页缓存的构建流程：**

![1701259811333](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701259811333.png)



**用户新增或修改分享时，对分页缓存的重建流程：**

![1701266330393](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701266330393.png)



那么同样的，既然在查询的时候加了锁，就还存在冷门用户突然火了的情况，大量用户线程来查询这个用户的分享列表，发现缓存中没有，去竞争这把锁，解决方法仍然为：将大量用户线程竞争锁由`串行改为并行`

解决方案就是，将查询用户的分享列表获取锁的地方`添加一个获取锁的超时时间`，这样大量用户线程阻塞在获取锁的地方，如果超过这个锁获取的超时时间，就直接返回查询失败，只要有一个用户线程将这个列表加载到了缓存当中，那么其他用户再次查询的话，就直接从缓存中查了，不会再大量阻塞在获取锁的地方





**那么上边只说了整体的分页列表缓存的延迟构建的整体的一个流程，那么具体的分页列表缓存是如何来进行构建的呢？key 是如何进行设计的呢？**

分页列表的缓存的 key 为：`user_cookbook:page:{userId}:{pageNo}`，主要有 userId 和 pageNo 来进行控制，pageNo 的话表示查询的是缓存中的第几页

那么在数据库中直接根据 `pageNo` 和 `pageSize` 查询到分页数据，再将分页数据转为 JSON 串存入 Redis 缓存当中，用户需要查询哪一页的数据直接根据 `pageNo` 来进行控制即可









### 总结

- 在查询时，给获取锁添加超时时间，避免突然大量请求访问冷门数据，大量线程阻塞等待锁
- 如果多处操作缓存和数据库，要注意加同一把锁，来保证数据的一致性
- 在 MQ 的通知中，加锁的话，注意需要阻塞等待加锁，而不是拿不到锁就退出，因为 MQ 中的通知需要修改缓存，收到通知后是一定要修改的
- 分页缓存的 key 的设计：`user_cookbook:page:{userId}:{pageNo}`
- 对于数据库中不存在的数据，在 Redis 中使用 `{}` 来进行缓存，避免缓存穿透，空缓存就可以将过期时间设置的短一些，避免大量空缓存占用缓存空间





## 购物车缓存架构

在购物车中的功能主要有这几个：商品加入购物车、查看购物车列表、删除购物车商品、选中购物车商品进行结算

这里购物车的场景和之前用户信息以及菜谱分享信息还不同，如果在举办了大型购物活动时，购物车可能需要面临`写多读少`或者`写多读多`的场景，面临高并发的读和写，那么在购物车中就以 Redis 作为主存储，异步的将数据进行落库持久化



### 商品加入购物车

那么我们先来看一下商品加入购物车的业务场景，当将一个商品加入购物车，流程如下：

商品加入购物车，首先需要判断，商品是否已经在购物车中存在了，那么就分了两种情况，如果商品在购物车中已经存在，我们需要去对购物车中该商品的数量 +1 ，然后在缓存中更新购物车里这个商品的信息，最后发送更新消息到 MQ 中进行异步落库；如果商品在购物车中不存在，那么就直接去缓存中添加购物车里该商品的信息，再发送持久化消息到 MQ 中进行落库



那么缓存中需要存储的数据以及存储使用的数据结构如下：

- 用户购物车已有商品的数量：使用 hash 来存储，这个商品的数量用于在用户添加商品到购物车时，判断购物车中的商品数量是否超过购物车商品数量的上限

  ```bash
  key -> shopping_cart_hash:{userId} 
  field -> skuId，即商品的 id
  value -> 存储商品的数量
  存储结构为：
  shopping_cart_hash:{userId} {
    {skuId}: count1,
    {skuId}: count2
  }
  ```

- 商品的详情信息：使用 hash 来存储

  ```bash
  key -> shopping_cart_extra_hash:{userId}
  field -> skuId
  value -> 商品详情
  存储结构为：
  shopping_cart_extra_hash:{userId} {
    {skuId}: "商品详情json串",
    {skuId}: "商品详情json串"
  }
  ```

- 存储购物车商品的顺序：使用 zset 存储，用于查询购物车的商品时使用

  ```bash
  key -> shopping_cart_zset:{userId}
  value -> skuId
  score -> System.currentTimeMillis()  分数使用当前系统的时间戳即可，按照加入购物车的时间对商品进行排序
  ```



那么添加购物车商品的流程如下：

![1701328638172](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701328638172.png)



在 MQ 中订阅更新消息和持久化消息即可，这里注意在订阅更新消息时，是更新用户购物车中的商品信息，那么有可能是增加商品的数量也有可能是减少商品的数量，所以在数据库中我们要判断，如果商品的数量更新后为 0 的话，就直接删除掉这条数据就好了

以及要做一些数据校验，如商品的数量最小值为 0，不可以为负数，这些都是业务层面上的考虑



这里的购物车存储架构使用 Redis 作为主存储，MySQL 作为持久化，那么如果 Redis 崩溃无法使用的话，MySQL 也可以作为一个备用存储，基于 MySQL 做一个降级处理，在 Redis 恢复的时候，可以将数据库中的数据再重新加载到 Redis 中来

就算 Redis 中一些数据没来得及发送到 MQ 进行消息落库，影响也不大，购物车中的数据在未提交订单之前，本来就是临时数据，丢一个影响不大





### 查询购物车中商品

查询购物车中的商品的话，直接从 Redis 中进行查询，先按照商品加入购物车的时间，查询出来所有的商品 id，再根据商品 id 去查询商品的详情，这个流程还是比较简单的

购物车中的商品是根据加入购物车的时间加入到 zset 中去的，那么查询的话使用 `zrevrange shopping_cart_zset:{userId} 0 -1` 根据 score 获取从大到小排序的商品 id

再根据这些商品 id 去 Redis 的 hash 中查数据的商品的详情信息，通过 `hgetall shopping_cart_extra_hash:{userId}`  来获取该用户购物车中的所有商品信息，将这些商品信息返回即可



购物车中商品在缓存中的可视化存储结构如下图：

![1701331609449](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701331609449.png)



### 选中购物车中的商品

在商品实体类中，通过一个字段 flag 来控制该该商品是否被选中了，如果选中该商品，就将 flag 设置为 1，如果取消选中，就将 flag 设置为 0

选中商品之后，直接在缓存中更新该商品的详情即可，也就是对 key=`shopping_cart_extra_hash:{userId}`，field=`{skuId}` 的商品详情信息进行更新



### 总结

- 写多读多、写多读少的场景，以 Redis 作为主存储，通过 MQ 异步将数据进行落库持久化
- 如果存在`读出来数据，并对读出来的数据进行修改`的场景的话，就要考虑是否存在并发问题了，如果存在的话，要加分布式锁进行控制





## 库存模块缓存架构

我们先来分析一下库存模块的业务场景，分为入库和出库，入库的话，在库存模块中需要添加库存，由于库存也是 `写多读多` 的场景，那么也是以 Redis 作为主存储，MySQL 作为辅助存储

出库的话，是在用户下单时，需要去库存中进行减库存的操作，并且用户退款时，需要增加库存

那么库存模块是存在高并发写的情况的，通过对商品库存进行`分片存储`，存储在多台 Redis 节点上，就可以将高并发的请求分散在各个 Redis 节点中，并且提供了单台 Redis 节点库存不足时的`合并库存`的功能

先来说一下如何对商品库存进行缓存分片，比如说商品有 100 件库存，Redis 集群有 5 个节点，先将 100 个商品拆分为 5个分片，再将 5 个分片分散到 Redis 集群的各个节点中，每个节点 1 个分片，那么也就是每个 Redis 节点存储 20 个商品库存

那么对于该商品的瞬间高并发的操作，会分散的打到多个 Redis 节点中，`库存分片的数量一般和 Redis 的节点数差不多`

这里分片库存的话，我们是在对商品进行入库的时候实现的，商品在入库的时候，先去 DB 中异步落库，然后再将库存分片写入各个 Redis 节点中，这里写入的时候采用`渐进性写入`，比如说新入库一个商品有 300 个，有 3 个 Redis 节点，那么我们分成 3 个分片的话，1 个 Redis 节点放 1 个分片，1 个分片存储 100 个商品，那么如果我们直接写入缓存，先写入第一个 Redis 节点 100 个库存，再写入第二个 Redis 节点 100 个库存，如果这时写入第三个 Redis 节点 100 个库存的时候失败了，那么就导致操作库存的请求压力全部在前两个 Redis 节点中，采用 `渐进性写入` 的话，流程为：我们已经直到每个 Redis 节点放 100 个库存了，那么我们定义一个轮次的变量，为 10，表示我们去将库存写入缓存中需要写入 10 轮，那么每轮就写入 10 个库存即可，这样写入 10 轮之后，每个 Redis 节点中也就有 100 个库存了，这样的好处在于，即使有部分库存写入失败的话，对于请求的压力也不会全部在其他节点上，因为写入失败的库存很小，很快时间就可以消耗完毕



### 基于缓存分片的入库添加库存方案

在商品入库时，主要就是在 DB 中记录入库的日志并且保存库存信息，在 Redis 中主要将库存进行分片存储，用于分担压力，流程图如下：

![1701524939709](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701524939709.png)



在商品入库时，对库存进行分片，流程为：

- 计算当前 Redis 节点需要分配的库存数量
- 执行 lua 脚本进行库存分配

下边贴出库存分片的代码，主要是 `executeStockLua` 方法：

```java
/**
 * 执行库存分配,使用lua脚本执行库存的变更
 * @param request 变更库存对象
 */
public void executeStockLua(InventoryRequest request) {
    // Redis 存储商品库存的 key
    String productStockKey = RedisKeyConstants.PRODUCT_STOCK_PREFIX  + request.getSkuId();
    // 当前已经分配的库存数量
    Integer sumNum = 0;
    Long startTime = System.currentTimeMillis();
    try {
        // 获取默认设定分桶
        int redisCount = cacheSupport.getRedisCount();
        // 商品入库数量
        Integer inventoryNum = request.getInventoryNum();
        // 单个机器预计分配的库存
        Integer countNum = inventoryNum / redisCount;
        // countNum 指的是每个机器每轮分配的库存数量，要么是单台机器预计分配的库存的 1/10，要么是 3 个
        // 也就是如果单个机器预计分配的库存比较小的话，没必要每次分配的 1 个或者 2 个，因此设置每轮分配的库存数量最小值是 3
        countNum = getAverageStockNum(countNum,redisCount);
        int i = 0;
        while (true){
            // 对每台机器进行库存分配
            for (long count = 0;count < redisCount; count++ ){
                // 最后剩余的库存小于每轮分配库存数量的时候，则以最后剩余的库存为准
                if (inventoryNum - sumNum < countNum){
                    countNum = inventoryNum - sumNum;
                }
                // 这里 cacheSupport 是提供的一个工具类，用于让 Redis 去执行 lua 脚本进行库存的分配
                Object eval = cacheSupport.eval(count, RedisLua.ADD_INVENTORY, CollUtil.toList(productStockKey), CollUtil.toList(String.valueOf(countNum)));
                if (!Objects.isNull(eval) && Long.valueOf(eval+"") > 0){
                    // 分配成功的才累计(可能出现不均匀的情况)
                    sumNum = sumNum + countNum;
                    i++;
                }

                if (sumNum.equals(inventoryNum)){
                    break;
                }
            }
            //分配完成跳出循环
            if (sumNum.equals(inventoryNum)){
                break;
            }
        }
        log.info("商品编号："+request.getSkuId()+"，同步分配库存共分配"+ (i)+"次"+"，分配库存："+sumNum+",总计耗时"+(System.currentTimeMillis() - startTime)+"毫秒");
    }catch (Exception e){
        e.printStackTrace();
        // 同步过程中发生异常，去掉已被同步的缓存库存，发送消息再行补偿,这里出现异常不抛出，避免异常
        request.setInventoryNum(request.getInventoryNum() - sumNum);
        // 这个 MQ 的异步操作中，就去去对库存进行添加，之前已经成功添加 sumNum 个库存了，还需要再补偿添加 request.getInventoryNum() - sumNum 个库存
        sendAsyncStockCompensationMessage(request);
        log.error("分配库存到缓存过程中失败", e.getMessage(), e);
    }
}
/**
 * 获取每个机器预估的分配库存数量
 * @param countNum
 * @return
 */
private Integer getAverageStockNum(Integer countNum,Integer redisCount){
    Integer num = 0;
    /**
     * countNum 为单个节点需要分配的库存总数
     * StockBucket.STOCK_COUNT_NUM 代表每个节点最多分配的轮次，这里的默认值是 10，也就是单个节点最多分配 10 次库存
     * redisCount 是 Redis 的节点数
     * 如果 countNum > (redisCount * StockBucket.STOCK_COUNT_NUM)
     * 那么每次分配的库存数我们以 redisCount 作为一个标准，假如 redisCount = 3
     * redisCount * StockBucket.STOCK_COUNT_NUM 的含义就是分配 10 轮，每轮分配 3 个库存，如果当前节点需要分配的库存数是比（每次分配3个，共分配10轮）还要多的话
     * 那么就每轮分配 countNum / 10
     * 如果单个节点的库存总数小于（分配 10 轮，每轮分配 redisCount 个库存）的话，再判断 countNum 是否大于 3，如果大于 3，就每轮分配 3 个
     * 如果小于 3，就分配 countNum 个
     */
    if (countNum > (redisCount * StockBucket.STOCK_COUNT_NUM)){
        num = countNum / StockBucket.STOCK_COUNT_NUM;
    } else if (countNum > 3){
        num = 3;
    } else {
        num = countNum;
    }
    return num;
}
```



下边来讲一下库存分配中，如何选择 Redis 节点并执行 lua 脚本向 Redis 中写入库存的：

```java
Object eval = cacheSupport.eval(count, RedisLua.ADD_INVENTORY, CollUtil.toList(productStockKey), CollUtil.toList(String.valueOf(countNum)));
```

也就是上边这一行代码，先说一下参数，count 表示循环到哪一个 Redis 节点了，通过 `count % redisCount`，就可以拿到需要操作的 Redis 节点的下标，表示需要操作哪一个 Redis，就在该 Redis 中执行 lua 脚本

`RedisLua.ADD_INVENTORY` 表示需要执行的 lua 脚本，`CollUtil.toList(productStockKey)` 表示 keys 的 list 集合，`CollUtil.toList(String.valueOf(countNum))` 表示 args 的 list 集合，这两个参数用于在 lua 脚本中进行取参数使用

那么再说一下 `eval` 方法执行的流程，首先维护一个 `List<JedisPool>` 集合，那么在 eval 方法中根据 `count` 参数拿到需要操作的 Redis 节点的下标，取出该 Redis 节点所对应的 Jedis 客户端，再通过该客户端执行 lua 脚本，eval 方法如下：

```java
@Override
public Object eval(Long hashKey, String script,List<String> keys, List<String> args) {
    /**
     * jedisManager.getJedisByHashKey(hashKey) 这个方法就是将传入的 count 也就是 hashKey 这个参数
     * 对 Redis 的节点数量进行取模，拿到一个下标，去 List 集合中取出该下标对应的 Jedis 客户端
     */
    try (Jedis jedis = jedisManager.getJedisByHashKey(hashKey)){
        return jedis.eval(script,keys,args);
    }
}
```



那么在这个 eval 方法中，拿到存储当前库存分片的 Redis 客户端，在该客户端中执行 lua 脚本，脚本内容如下：

```java
/**
 * 初始化新增库存
 * 这里的 KEYS[1] 也就是传入的 productStockKey = product_stock:{skuId}
 * ARGV[1] 也就是 countNum，即当前 Redis 节点需要分配的库存数量
 */
public static final String ADD_INVENTORY =
        "if (redis.call('exists', KEYS[1]) == 1) then"
      + "    local occStock = tonumber(redis.call('get', KEYS[1]));"
      + "    if (occStock >= 0) then"
      + "        return redis.call('incrBy', KEYS[1], ARGV[1]);"
      + "    end;"
      + "end;"
      + "       redis.call('SET', KEYS[1], ARGV[1]);"
      + "    return tonumber(redis.call('get', KEYS[1]));";
```







### 基于缓存分片的下单库存扣减方案

将商品进行数据分片，并将分片分散存储在各个 Redis 节点中，那么如何计算每次操作商品的库存是去操作哪一个 Redis 节点呢？

我们对商品库存进行了`分片存储`，那么当扣减库存的时候，操作哪一个 Redis 节点呢？

通过`轮询`的方式选择 Redis 节点，在 Redis 中通过记录商品的购买次数（每次扣减该商品库存时，都对该商品的购买次数加 1），key 为 `product_stock_count:{skuId}`，通过该商品的购买次数对 Redis 的节点数取模，拿到需要操作的 Redis 节点，再进行扣减

如果只对这一个 Redis 进行操作，可能该 Redis 节点的库存数量不够，那么就去下一个 Redis 节点中判断库存是否足够扣减，如果遍历完所有的 Redis 节点，库存都不够的话，那么就需要将所有 Redis 节点的库存数量进行合并扣减了，合并扣减库存的流程为：

- 先累加所有 Redis 节点上的库存数量
- 判断所有的库存数量是否足够扣减，如果够的话，就去遍历所有的 Redis 节点进行库存的扣减；如果不够，返回库存不足即可

库存在高并发场景下，写操作还是比较多的，因此还是以 `Redis 作为主存储，DB 作为辅助存储`



用户下单之后，Redis 中进行库存扣减流程如下：

![1701567628469](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701567628469.png)

出库主要有 2 个步骤：

- Redis 中进行库存扣除
- 将库存扣除信息进行异步落库



那么异步落库是通过 MQ 实现的，主要记录商品出库的一些日志信息，这里讲一下 Redis 中进行库存扣除的代码是如何实现的，在缓存中扣除库存主要分为 3 个步骤：

- 拿到需要操作的 Redis 节点，进行库存扣除
- 如果该 Redis 节点库存不足，则去下一个节点进行库存扣除
- 如果所有 Redis 节点库存都不足，就合并库存进行扣除



先来说一下第一步，如何拿到需要操作的 Redis 节点，我们上边已经说了，通过`轮询`的方式，在 Redis 中通过 key：`product_stock_count:{skuId}` 记录对应商品的购买次数，用购买次数对 Redis 节点数取模，拿到需要操作的 Redis 节点的下标

这里该 Redis 节点库存可能不够，我们从当前选择的 Redis 节点开始循环，如果碰到库存足够的节点，就进行库存扣除，并退出不再继续循环，循环 Redis 节点进行库存扣除代码如下：

```java
// incrementCount：商品的购买次数
Object result;
// 轮询 Redis 节点进行库存扣除
for (long i = incrementCount; i < incrementCount + redisCount - 1; i ++) {
  /**
   * jedisManager.getJedisByHashKey(hashKey) 这个方法就是将传入的 count 也就是 hashKey 这个参数
   * 对 Redis 的节点数量进行取模，拿到一个下标，去 List 集合中取出该下标对应的 Jedis 客户端
   */
  try (Jedis jedis = jedisManager.getJedisByHashKey(i)){
      // RedisLua.SCRIPT：lua 脚本
      // productStockKey：存储商品库存的 key:"product_stock:{skuId}"
      // stockNum 需要扣除的库存数量
      result = jedis.eval(RedisLua.SCRIPT, CollUtil.toList(productStockKey), CollUtil.toList(String.valueOf(stockNum));
  }
  if (Objects.isNull(result)) {
	continue;
  }
  if (Integer.valueOf(result+"") > 0){
	deduct = true;
	break;
  }
}
// 如果单个 Redis 节点库存不足的话，需要合并库存扣除
if (!deduct){
	// 获取一下当前的商品总库存，如果总库存也已不足以扣减则直接失败
	BigDecimal sumNum = queryProductStock(skuId);
	if (sumNum.compareTo(new BigDecimal(stockNum)) >=0 ){
        // 合并扣除库存的核心代码
		mergeDeductStock(productStockKey,stockNum);
	}
	throw new InventoryBizException("库存不足");
}
```



下边看一下库存扣除的 lua 脚本：

```java
/**
 * 扣减库存
 * 先拿到商品库存的值：stock
 * 再拿到商品需要扣除或返还的库存数量：num
 * 如果 stock - num <= 0，说明库存不足，返回 -1
 * 扣除成功，返回 -2
 * 如果该商品库存不存在，返回 -3
 */
public static final String SCRIPT  =
        "if (redis.call('exists', KEYS[1]) == 1) then"
        + "    local stock = tonumber(redis.call('get', KEYS[1]));"
        + "    local num = tonumber(ARGV[1]);"
        + "    local results_num = stock - num"
        + "    if (results_num <= 0) then"
        + "        return -1;"
        + "    end;"
        + "    if (stock >= num) then"
        + "            return redis.call('incrBy', KEYS[1], 0 - num);"
        + "        end;"
        + "    return -2;"
        + "end;"
        + "return -3;";
```



对于单个 Redis 节点的库存扣除操作已经说完了，就是先选择 Redis 节点，再执行 lua 脚本扣除即可，如果发现所有 Redis 节点库存足够扣除，就需要合并库存，再进行扣除，合并库存扣除的代码如下：

```java
private void mergeDeductStock(String productStockKey, Integer stockNum){
    // 执行多个分片的扣除扣减，对该商品的库存操作上锁，保证原子性
    Map<Long,Integer> fallbackMap = new HashMap<>();
    // 拿到 Redis 总节点数
    int redisCount = cacheSupport.getRedisCount();
    try {
        // 开始循环扣减库存
        for (long i = 0;i < redisCount; i++){
            if (stockNum > 0){
                // 对当前 Redis 节点进行库存扣除，这里返回的结果 diffNum 表示当前节点扣除库存后，还有多少库存未被扣除
                Object diffNum = cacheSupport.eval(i, RedisLua.MERGE_SCRIPT, CollUtil.toList(productStockKey), CollUtil.toList(stockNum + ""));
                if (Objects.isNull(diffNum)){
                    continue;
                }
                // 当扣减后返回得值大于0的时候，说明还有库存未能被扣减，对下一个分片进行扣减
                if (Integer.valueOf(diffNum+"") >= 0){
                    // 存储每一次扣减的记录，防止最终扣减还是失败进行回滚
                    fallbackMap.put(i, (stockNum - Integer.valueOf(diffNum+"")));
                    // 重置抵扣后的库存
                    stockNum = Integer.valueOf(diffNum+"");

                }
            }
        }
        // 完全扣除所有的分片库存后，还是未清零，则回退库存返回各自分区
        if (stockNum > 0){
            fallbackMap.forEach((k, v) -> {
                Object result = cacheSupport.eval(k, RedisLua.SCRIPT, CollUtil.toList(productStockKey), CollUtil.toList((0 - v) + ""));
                log.info("redis实例[{}] 商品[{}] 本次库存不足，扣减失败，返还缓存库存:[{}], 剩余缓存库存:[{}]", k,productStockKey, v, result);
            });
            throw new InventoryBizException("库存不足");
        }

    } catch (Exception e){
        e.printStackTrace();
        // 开始循环返还库存
        fallbackMap.forEach((k, v) -> {
            cacheSupport.eval(k, RedisLua.SCRIPT,CollUtil.toList(productStockKey),CollUtil.toList((0-v)+""));
        });
        throw new InventoryBizException("合并扣除库存过程中发送异常");
    }
}
```



在合并扣除库存中，主要有两个 lua 脚本：`RedisLua.MERGE_SCRIPT` 和 `RedisLua.SCRIPT`，第一个用于扣除库存，第二个用于返还库存

第二个 lua 脚本上边在库存扣减的时候，已经说过了，我们只需要将参数加个负号即可，原来是扣除库存，这里添加库存就可以返还了

来看一下第一个 lua 脚本：

```java
/**
 * 合并库存扣减
 * stock：该节点拥有库存
 * num：需要扣除库存
 * diff_num：扣除后剩余库存（如果该节点库存不足，则是负数）
 * 如果节点没有库存，返回 -1
 * 如果节点库存不足，令 num = stock，表示将该节点库存全部扣除完毕
 * 最后如果 diff_num 是负数，表示还有还有库存未扣减完毕，返回进行扣减
 */
public static final String MERGE_SCRIPT  =
        "if (redis.call('exists', KEYS[1]) == 1) then\n" +
        "    local stock = tonumber(redis.call('get', KEYS[1]));\n" +
        "    local num = tonumber(ARGV[1]);\n" +
        "    local diff_num = stock - num;\n" +
        "    if (stock <= 0) then\n" +
        "        return -1;\n" +
        "    end;\n" +
        "    if (num > stock) then\n" +
        "        num = stock;\n" +
        "    end;\n" +
        "    redis.call('incrBy', KEYS[1], 0 - num);\n" +
        "    if (diff_num < 0) then\n" +
        "        return 0-diff_num;\n" +
        "    end;\n" +
        "    return 0;\n" +
        "end;\n" +
        "return -3;";
```



### 总结

那么库存扣减的整个流程也就说完了，接下来总结一下，库存入库流程为：

- DB 记录入库记录
- Redis 对库存进行分片，采用`渐进性写入缓存`



库存出库流程为：

- 轮询 Redis 节点进行扣除，如果所有节点库存不足，则合并库存进行扣除
- 如果库存扣除成功，则 DB 记录出库记录





## 生产环境中热 key 处理

热 key 问题就是某一瞬间可能某条内容特别火爆，大量的请求去访问这个数据，那么这样的 key 就是热 key，往往这样的 key 也是存储在了一个 redis 节点中，对该节点压力很大

那么对于热 key 的处理就是通过热 key 探测系统对热 key 进行计数，一旦发现了热 key，就将热 key 在 jvm 本地缓存中再存储一份，那么当再有大量请求来读取时，就直接在应用的 jvm 缓存中读取到直接返回了，不会再将压力给到同一个 redis 节点中了，如下图：

![1701837938899](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701837938899.png)





京东开源了`高性能热 key 探测中间件：JD-hotkey`，可以实时探测出系统的热数据，生产环境中可以基于 `JD-hotkey` 来解决热 key 的问题



## 生产环境中大 key 监控和切分处理方案

大 key 问题是指在 Redis 中某一个 key 所存储的 value 值特别大，几个 mb 或者几十 mb，那么如果频繁读取大 key，就会导致大量占用网络带宽，影响其他网络请求

对于大 key 会进行特殊的切片处理，并且要对大 key 进行监控，如果说发现超过 1mb 的大 key，则进行报警，并且自动处理，将这个大 key 拆成多个 k-v 进行存储，比如将 `big-key` 拆分为 ---> `big-key01，big-key02 ...`，



那么大 key 的解决方案如下：

- 通过 crontab 定时调度 shell 脚本，每天凌晨通过 rdbtools 工具解析 Redis 的 rdb 文件，过滤 rdb 文件中的大 key 导出为 csv 文件，然后使用 SQL 导入 csv 文件存储到 MySQL 中的表 `redis_large_key_log` 中
- 使用 canal 监听 MySQL 的 `redis_large_key_log` 表的 binlog 日志，将增量数据发送到 RocketMQ 中（这里该表的增量数据就是解析出来的大 key，将大 key 的数据发送到 MQ 中，由 MQ 消费者来决定如何对这些大 key 进行处理）
- 在 MQ 的消费端可以通过一个大 key 的处理服务来对大 key 进行切分，分为多个 k-v 存储在 Redis 中

那么在读取大 key 的时候，需要判断该 key 是否是大 key，如果是的话，需要对多个 k-v 的结果进行拼接并返回





## 数据库与缓存最终一致性解决方案

如果不采用更新数据时双写来保证数据库与缓存的一致性的话，可以通过 `canal + RocketMQ` 来实现数据库与缓存的最终一致性，对于数据直接更新 DB，通过 canal 监控 MySQL 的 binlog 日志，并且发送到 RocketMQ 中，MQ 的消费者对数据进行消费并解析 binlog，过滤掉非增删改的 binlog，那么解析 binlog 数据之后，就可以知道对 MySQL 中的哪张表进行 `增删改` 操作了，那么接下来我们只需要拿到这张表在 Redis 中存储的 key，再从 Redis 中删除旧的缓存即可，那么怎么取到这张表在 Redis 中存储的 key 呢？

可以我们自己来进行配置，比如说监控 `sku_info` 表的 binlog，那么在 MQ 的消费端解析 binlog 之后，就知道是对 `sku_info` 表进行了增删改的操作，那么假如 Redis 中存储了 sku 的详情信息，key 为 `sku_info:{skuId}`，那么我们就可以在一个地方对这个信息进行配置：

```java
// 配置下边这三个信息
tableName = "sku_info"; // 表示对哪个表进行最终一致性
cacheKey = "sku_info:"; // 表示缓存前缀
cacheField = "skuId"; // 缓存前缀后拼接的唯一标识

// data 是解析 binlog 日志后拿到的 key-value 值，data.get("skuId") 就是获取这一条数据的 skuId 属性值
// 如下就是最后拿到的 Redis 的 key
redisKey = cacheKey + data.get(cacheField)
```



那么整体的流程图如下：

![1701851761518](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701851761518.png)









## Redis 集群故障探测

在生产环境中，如果 Redis 集群崩溃了，那么会导致大量的请求打到数据库中，会导致整个系统都崩溃，所以系统需要可以识别缓存故障，限流保护数据库，并且启动接口的降级机制



**降级方案设计**
我们在系统中操作 Redis 一般都是通过工具类来进行操作的，假设工具类有两个 `RedisCache` 和 `RedisLock`，那么通过 AOP 对这两个工具类的所有方法做一个切面，如果在这两个类中执行 Redis 操作时，Redis 挂掉了，就会抛出异常（Redis 连接失败），那么我们在切面的处理方法上捕捉异常，再记录下来，判断是 Redis 集群挂了还是展示网络波动

判断是集群挂掉还是网络波动的话，我们可以配置规则，比如 30 秒内出现了 3 次 Redis 连接失败，就认为 Redis 挂掉了（可以使用 Hotkey 配置规则），那么如何自动恢复呢？可以设置 hotkey 中的缓存过期时间，设置为 60 秒，那么缓存过期之后，会再次尝试去操作 Redis，如果 Redis 恢复了就可以正常使用了，如果还没有恢复，会继续向 hotkey 中 set 数据，切面中记录 Redis 故障代码如下：

```java
@Around("redisCachePointcut() || redisLockPointcut()")
public Object around(ProceedingJoinPoint point) {
    // 签名信息
    Signature signature = point.getSignature();
    // 强转为方法信息
    MethodSignature methodSignature = (MethodSignature) signature;
    // 参数名称
    String[] parameterNames = methodSignature.getParameterNames();
    //执行的对象
    Object target = point.getTarget();

    log.debug("处理方法:{}.{}", target.getClass().getName() , methodSignature.getMethod().getName());
    Object[] parameterValues = point.getArgs();

    //查看入参
    log.debug("参数名:{}，参数值:{}", JSONObject.toJSONString(parameterNames), JSONObject.toJSONString(parameterValues));

    Class returnType = methodSignature.getReturnType();

    // 返回类型是否布尔类型
    boolean booleanType = boolean.class.equals(returnType) || Boolean.class.equals(returnType);
    try {
        if (Objects.nonNull(JdHotKeyStore.get("redis_connection_failed"))) {
            // 值不为空表示redis连接失败，这里就不再继续请求redis了，直接返回false或者null
            log.error("获取缓存失败，redis连接失败，直接返回 false 或者 null");
            if (booleanType) {
                return false;
            }
            return null;
        }
        return point.proceed();
    } catch (Throwable throwable) {
        log.error("执行方法:{}失败，异常信息:{}", methodSignature.getMethod().getName(), throwable);
        /*
         * redis连接失败，不抛异常，返回空值，
         * 继续用数据库提供服务，避免整个服务异常
         * 一分钟之内或者30秒之内出现了几次redis连接失败
         * 此时可以设置一个key，告诉hotkey，redis连接不上了，指定1分钟左右的过期时间
         * 下次获取缓存的时候，先根据hotkey来判断，redis是否异常了
         * hotkey在1分钟之后，会删除key，下次再有redis请求过来，重新去看redis能否连接
         * 这样可以简单的实现redis挂掉之后直接走数据库的降级
         */
        if (JdHotKeyStore.isHotKey("redis_connection_failed")) {
            JdHotKeyStore.smartSet("redis_connection_failed", "{}");
        }

        // 让后续操作继续，判断返回类型是Boolean则返回false，其他类型返回null
        log.error("缓存操作失败，直接返回 false 或者 null");
        if (booleanType) {
            return false;
        }
        return null;
    }
}
```



如果 Redis 故障的话，通过 `key=redis_connection_failed` 就已经记录下来了，那么降级操作的话，就从本地缓存 `caffeine` 中取数据，如果取不到，再查询数据库，降级流程如下：

![1701917686181](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1701917686181.png)

这里如果本地缓存中没有数据的话，需要查询数据库之后，再将数据库中的数据放入本地缓存中，这里还是需要加锁的，那么我们就加本地锁即可 `ReentrantLock`



## Redis 集群故障后的数据库限流方案

常见的限流算法有：滑动窗口、令牌桶（这里不细讲了）

这里限流我们使用 Guava 的一个限流组件：`RateLimiter`，是基于令牌桶算法的

在限流的时候，如果请求被限流了，尽量尝试降级从本地缓存中取读取数据，而不是直接返回用户请求失败



## Redis 集群压测

将项目接入 cachecloud



