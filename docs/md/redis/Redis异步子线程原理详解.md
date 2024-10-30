# Redis异步子线程原理详解

Redis主线程启动后，会使用os提供的`pthread_create`创建3个子线程，分别负责如下的异步执行：

- AOF日志写
- KV对的删除
- 文件关闭

主线程通过一个链表的任务队列和子线程交互：

- 收到KV对删除和清空数据库操作请求
- 主线程会将该操作封装成任务，置入任务队列
- 然后给客户端返回一个完成信息，表明删除已完成

但实际上，这时删除还没执行，等到后台子线程从任务队列读取任务后，才开始实际删除KV对，并释放相应内存空间。因此，这种异步删除也称惰性删除（lazy free）。此时，删除、清空操作不会阻塞影响主线程。

类似惰性删除，当AOF日志配置成everysec，主线程会把AOF写日志操作封装成一个任务，也放到任务队列。后台子线程读取任务后，开始自行写入AOF日志，主线程就不用一直等AOF日志写完。

Redis中的异步子线程执行机制：

![](https://img-blog.csdnimg.cn/8ce3cf85a08d44a794ea41fcf33c6499.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

异步的KV对删除、数据库清空操作是Redis 4.0后功能，Redis提供新命令：

- KV对删除：集合类型中有大量元素（如百万级或千万级别元素）需删除时，推荐UNLINK命令
- 清空数据库：可在FLUSHDB和FLUSHALL命令后加上ASYNC选项，就可让后台子线程异步清空数据库，如：

```bash
FLUSHDB ASYNC
FLUSHALL AYSNC
```

## 异步删除

Redis 4.0后功能，但默认关闭。

若用4.0前版本，遇到bigkey删除时，推荐：先使用集合类型提供的SCAN命令读数据，再进行删除。因为SCAN命令可每次只读取一部分数据并进行删除，避免一次性删除大量key给主线程带来阻塞。

如对Hash类型bigkey删除，可使用HSCAN命令，每次从Hash集合获取一部分KV对（如200个），再使用HDEL删除这些KV对，就把删除压力分摊到多次操作。每次删除操作耗时不会太长，也就不会阻塞主线程 。

手动开启lazy-free时，有4个选项可控制，分别对应不同场景下，是否开启异步释放内存：

- lazyfree-lazy-expire
  key在过期删除时尝试异步释放内存
- lazyfree-lazy-eviction
  内存达到maxmemory并设置了淘汰策略时尝试异步释放内存
- lazyfree-lazy-server-del
  执行RENAME/MOVE等命令或需要覆盖一个key时，删除旧key尝试异步释放内存
- replica-lazy-flush
  主从全量同步，从库清空数据库时异步释放内存

即使开启lazy-free，若直接使用DEL命令还是会同步删除key，只有使用UNLINK命令才会可能异步删除key。

开启lazy-free的场景，除了replica-lazy-flush，其他情况都只是*可能*去异步释放key的内存，并非每次必定异步释放内存。

开启lazy-free后，Redis在释放一个key的内存时，首先会评估代价，若释放内存代价小，直接在主线程中操作，没必要放到异步线程中执行（不同线程传递数据也会有性能消耗）。

### 何时真正异步释放内存？

综合K的类型、编码方式、元素数量（源码的lazyfreeGetFreeEffort）：

- 当Hash/Set底层采用哈希表存储（非ziplist/int编码存储）&& 元素数量>64

- 当ZSet底层采用跳表存储（非ziplist编码存储）&& 元素数量>64

- 当List链表节点数量>64（不是元素数量，而是链表节点的数量，List的实现是在每个节点包含了若干个元素的数据，这些元素采用ziplist存储）

以上三种场景的引用次数仅为1。只有以上这些情况，在删除key释放内存时，才真正放到异步线程执行，其他情况一律还在主线程。

即：

- String（不管内存占用多大）
- List（少量元素）
- Set（int编码存储）
- Hash/ZSet（ziplist编码存储）

等 case 下的 K在释放内存时，依旧在主线程中操作。

可见，即使开启lazy-free，String类型大key，在删除时依旧有阻塞主线程的风险。所以，即便Redis提供lazy-free，推荐还是尽量不要在Redis中存储大K。

Redis在设计评估释放内存的代价时，不是看keyK内存占用有多少，而是关注释放内存时的工作量：

- 需释放的内存连续，Redis作者认为释放内存的代价较低，就放在主线程做
- 释放的内存不连续（大量指针类型的数据），代价较高，才放在异步线程执行

Redis 6.0提供：lazyfree-lazy-user-del

![](https://img-blog.csdnimg.cn/f9be5a2e36b94df59f3349920a0672c8.png)

打开该选项后，使用DEL和UNLINK无区别。而且放到异步执行，就必须要保证成功。如果有失败风险，只能同步来做把结果返回客户端，或者用其他机制保证不会失败。

若是异步删除，在没真正删除之前查询咋办？放到异步线程之前：

- 先在主线程中把这key从数据库删掉（即从Redis的全局KV对的dict中剔除）
- 再进来的查询请求就查不到这key了

## 源码学习建议

先看底层数据类型的实现，再看每种数据类型的命令是如何执行的，最后再关注主从复制、高可用、切片集群相关的逻辑。