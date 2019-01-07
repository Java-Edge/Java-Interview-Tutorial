### 3.2.2 Redis缓存（最佳）
Redis是一个远程内存数据库（非关系型数据库），性能强劲，具有复制特性以及解决问题而生的独一无二的数据模型

- Redis数据模型图
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNjA5YjVlMGRiMjJiYjk5NC5wbmc?x-oss-process=image/format,png)
Redis内部使用一个redisObject对象来标识所有的key和value数据，redisObject最主要的信息:
- type代表一个value对象具体是何种数据类型
- encoding是不同数据类型在Redis内部的存储方式
比如——type=string代表value存储的是一个普通字符串，那么对应的encoding可以是raw或是int，如果是int则代表Redis内部是按数值类型存储和表示这个字符串。

raw列为对象的编码方式
- 字符串可以被编码为raw（一般字符串）或Rint（为了节约内存，Redis会将字符串表示的64位有符号整数编码为整数来进行储存）
- 列表可以被编码为ziplist或linkedlist，ziplist是为节约大小较小的列表空间而作的特殊表示
- 集合可以被编码为intset或者hashtable，intset是只储存数字的小集合的特殊表示
- hash表可以编码为zipmap或者hashtable，zipmap是小hash表的特殊表示
- 有序集合可以被编码为ziplist或者skiplist格式
  - ziplist用于表示小的有序集合
  - skiplist则用于表示任何大小的有序集合

从网络I/O模型上看，Redis使用单线程的I/O复用模型，自己封装了一个简单的AeEvent事件处理框架，主要实现了epoll、kqueue和select。对于单纯只有I/O操作来说，单线程可以将速度优势发挥到最大，但是Redis也提供了一些简单的计算功能，比如排序、聚合等，对于这些操作，单线程模型实际会严重影响整体吞吐量，CPU计算过程中，整个I/O调度都是被阻塞住的，在这些特殊场景的使用中，需要额外的考虑
相较于memcached的预分配内存管理，Redis使用`现场申请内存`的方式来存储数据，并且很少使用free-list等方式来优化内存分配，会在`一定程度上存在内存碎片`
Redis跟据存储命令参数，会把带过期时间的数据单独存放在一起，并把它们称为临时数据，非临时数据是永远不会被剔除的，即便物理内存不够，导致swap也不会剔除任何非临时数据（但会尝试剔除部分临时数据）

Redis一共支持四种持久化方式，主要使用的两种：
1.  **定时快照方式(snapshot)**
该持久化方式实际是在Redis内部一个定时器事件，每隔固定时间去检查当前数据发生的改变次数与时间是否满足配置的持久化触发的条件，如果满足则通过操作系统fork调用来创建出一个子进程，这个子进程默认会与父进程共享相同的地址空间，这时就可以通过子进程来遍历整个内存来进行存储操作，而主进程则仍然可以提供服务，当有写入时由操作系统按照内存页（page）为单位来进行copy-on-write保证父子进程之间不会互相影响。它的缺点是快照只是代表一段时间内的内存映像，所以系统重启会丢失上次快照与重启之间所有的数据。
2.  **基于语句追加文件的方式(aof)**
aof方式实际类似MySQl的基于语句的binlog方式，即每条会使Redis内存数据发生改变的命令都会追加到一个log文件中，也就是说这个log文件就是Redis的持久化数据。

aof的方式的主要缺点是追加log文件可能导致体积过大，当系统重启恢复数据时如果是aof的方式则加载数据会非常慢，几十G的数据可能需要几小时才能加载完，当然这个耗时并不是因为磁盘文件读取速度慢，而是由于读取的所有命令都要在内存中执行一遍。另外由于每条命令都要写log，所以使用aof的方式，Redis的读写性能也会有所下降。

Redis的持久化使用了Buffer I/O，对持久化文件的写入和读取操作都会使用物理内存的Page Cache，而大多数数据库系统会使用Direct I/O来绕过这层Page Cache并自行维护一个数据的Cache
而当Redis的持久化文件过大，并对其进行读写时，磁盘文件中的数据都会被加载到物理内存中作为操作系统对该文件的一层Cache，而这层Cache的数据与Redis内存中管理的数据实际是重复存储的
虽然内核在物理内存紧张时会做Page Cache的剔除工作，但内核很可能认为某块Page Cache更重要，而让你的进程开始Swap，这时你的系统就会开始出现不稳定或者崩溃了，因此在持久化配置后，针对内存使用需要实时监控观察

与memcached客户端支持分布式方案不同，Redis更倾向于在服务端构建分布式存储
- Redis分布式集群图1
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNzY4ZGQ1YTE1NjRjNGVkZi5wbmc?x-oss-process=image/format,png)
- Redis分布式集群
![](https://img-blog.csdnimg.cn/20210204121340713.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
Redis Cluster是一个实现了分布式且允许单点故障的Redis高级版本，它没有中心节点，具有线性可伸缩的功能。其中节点与节点之间通过二进制协议进行通信，节点与客户端之间通过ascii协议进行通信。
在数据的放置策略上，Redis Cluster将整个key的数值域分成4096个hash槽，每个节点上可以存储一个或多个hash槽，也就是说当前Redis Cluster支持的最大节点数就是4096
Redis Cluster使用的分布式算法也很简单：crc16( key ) % HASH_SLOTS_NUMBER
整体设计可总结为：
*   数据hash分布在不同的Redis节点实例上
*   M/S的切换采用Sentinel
*   写：只会写master Instance，从sentinel获取当前的master Instance
*   读：从Redis Node中基于权重选取一个Redis Instance读取，失败/超时则轮询其他Instance；Redis本身就很好的支持读写分离，在单进程的I/O场景下，可以有效的避免主库的阻塞风险
*   通过RPC服务访问，RPC server端封装了Redis客户端，客户端基于Jedis开发

在数据一致性问题上，`  Redis没有提供CAS操作命令来保障高并发场景下的数据一致性问题，不过它却提供了事务的功能  `
Redis的Transactions提供的并不是严格的ACID的事务（比如一串用EXEC提交执行的命令，在执行中服务器宕机，那么会有一部分命令执行了，剩下的没执行）。
但是这个Transactions还是提供了基本的命令打包执行的功能（在服务器不出问题的情况下，可以保证一连串的命令是顺序在一起执行的，中间有会有其它客户端命令插进来执行）
Redis还提供了一个Watch功能，你可以对一个key进行Watch，然后再执行Transactions，在这过程中，如果这个Watched的值进行了修改，那么这个Transactions会发现并拒绝执行

在失效策略上，Redis支持多达6种的数据淘汰策略
1.  volatile-lru：从已设置过期时间的数据集（server.db[i].expires）中挑选最近最少使用的数据淘汰
2.  volatile-ttl：从已设置过期时间的数据集（server.db[i].expires）中挑选将要过期的数据淘汰
3.  volatile-random：从已设置过期时间的数据集（server.db[i].expires）中任意选择数据淘汰 
4.  allkeys-lru：从数据集（server.db[i].dict）中挑选最近最少使用的数据淘汰；
5.  allkeys-random：从数据集（server.db[i].dict）中任意选择数据淘汰；
6.  no-enviction（驱逐）：禁止驱逐数据。

**以下多种Web应用场景，可以充分的利用Redis的特性，大大提高效率**
- 在主页中显示最新的项目列表
Redis使用的是常驻内存的缓存，速度非常快
    - LPUSH用来插入一个内容ID，作为关键字存储在列表头部
    - LTRIM用来限制列表中的项目数最多为5000
如果用户需要的检索的数据量超越这个缓存容量，这时才需要把请求发送到数据库
- 删除和过滤
如果一篇文章被删除，可以使用LREM从缓存中彻底清除掉
- 排行榜及相关问题
排行榜（leader board）按照得分进行排序
    - ZADD命令可以直接实现这个功能
    - ZREVRANGE命令可以用来按照得分来获取前100名的用户
    - ZRANK可以用来获取用户排名，非常直接而且操作容易

- 按照用户投票和时间排序
排行榜，得分会随着时间变化。
LPUSH和LTRIM命令结合运用，把文章添加到一个列表中
一项后台任务用来获取列表，并重新计算列表的排序，ZADD命令用来按照新的顺序填充生成列表。列表可以实现非常快速的检索，即使是负载很重的站点。
- 过期处理
使用Unix时间作为关键字，用来保持列表能够按时间排序。对current_time和time_to_live进行检索，完成查找过期项目的艰巨任务。另一项后台任务使用ZRANGE…WITHSCORES进行查询，删除过期的条目。
- 计数
进行各种数据统计的用途是非常广泛的，比如想知道什么时候封锁一个IP地址
INCRBY命令让这些变得很容易，通过原子递增保持计数
GETSET用来重置计数器
过期属性用来确认一个关键字什么时候应该删除
- 特定时间内的特定项目
这是特定访问者的问题，可以通过给每次页面浏览使用SADD命令来解决
SADD不会将已经存在的成员添加到一个集合。
- Pub/Sub
在更新中保持用户对数据的映射是系统中的一个普遍任务。Redis的pub/sub功能使用了SUBSCRIBE、UNSUBSCRIBE和PUBLISH命令，让这个变得更加容易。
-  队列
在当前的编程中队列随处可见。除了push和pop类型的命令之外，Redis还有阻塞队列的命令，能够让一个程序在执行时被另一个程序添加到队列。