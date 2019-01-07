> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

分片，Redis 数据的分布方式，分片就是将数据拆分到多个 Redis 实例，这样每个实例将只是所有键的一个子集。

# 1 为什么要分区？
随着请求量和数据量的增加，一台机器已无法满足需求，就需要把数据和请求分散到多台机器，这就需要引入分布式存储。

## 1.1 分布式存储的特性
- 增强可用性
如果数据库的某个节点出现故障，在其他节点的数据仍然可用
- 维护方便
如果数据库的某个节点出现故障，需要修复数据，只需修复该节点
- 均衡I/O
可以把不同的请求映射到各节点以平衡 I/O，改善整个系统性能
- 改善查询性能
对分区对象的查询可以仅搜索自己关心的节点，提高检索速度

分布式存储首先要解决把整个数据集按分区规则映射到多个节点的问题，即把数据集划分到多个节点，每个节点负责整体数据的一个子集：
1. 分片可以让Redis管理更大的内存，Redis将可以使用所有机器的内存。如果没有分区，你最多只能使用一台机器的内存。
2. 分片使Redis的计算能力通过简单地增加计算机得到成倍提升，Redis的网络带宽也会随着计算机和网卡的增加而成倍增长。

# 有哪些分片方案？
假设：
- 有 4 个 Redis 实例 R0，R1，R2，R3
- 很多表示用户的键，像 user:1，user:2

有如下方案可映射键到指定 Redis 节点。

## 范围分区(range partitioning)
也叫顺序分区，最简单的分区方式。通过映射对象的范围到指定的 Redis 实例来完成分片。

- 假设用户从 ID 1 ~ 33 进入实例 R0，34 ~ 66 进入R1

![](https://img-blog.csdnimg.cn/20210430155203966.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
### 优点
- 键值业务相关
- 可顺序访问
同一范围内的范围查询不需要跨节点，提升查询速度
- 支持批量操作

###  缺点
- 数据分散度易倾斜
- 需要一个映射范围到实例的表格。该表需要管理，不同类型的对象都需要一个表，所以范围分片在 Redis 中常常并不可取，因这要比其他分片可选方案低效得多。

### 产品
- BigTable
- HBase
- MySQL
- Oracle

## 2.2 哈希分区(hash partitioning)
传统分布式算法，适于任何键，不必是 `object_name:<id>` 形式：
1. 使用一个哈希函数(例如crc32) ，将key转为一个数字，比如93024922
2. 对该数据进行取模，将其转换为一个 0 到 3 之间数字，该数字即可映射到4个 节点之一。93024922 模 4 等于 2，所以键 foobar 存储到 R2
![](https://img-blog.csdnimg.cn/20210430155222501.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
### 2.2.1 分类
#### 2.2.1.1 节点取余分区
##### 4redis节点
![](https://img-blog.csdnimg.cn/20210505141558125.png)
20 个数据
![](https://img-blog.csdnimg.cn/20210505141612173.png)
数据分布
![](https://img-blog.csdnimg.cn/20210505141633953.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
##### 5redis节点
数据分布
![](https://img-blog.csdnimg.cn/20210505141711115.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
> 蓝色表与4个节点时是相同的槽。

可见，redis0只有20命中、redis1只有1命中、redis2只有2命中、redis3只有3命中。最终命中率是: 4/20=20%

-  hash(key) % nodes
![](https://img-blog.csdnimg.cn/20210430170928276.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
#### 数据迁移
当添加一个节点时
![](https://img-blog.csdnimg.cn/20210430171024286.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 多倍扩容
![](https://img-blog.csdnimg.cn/20210430171121829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

客户端分片：哈希+取余。
节点伸缩：数据节点关系变化，导致数据迁移。迁移数量和添加节点数量有关：建议翻倍扩容。
优点：实现简单
缺点：当扩容或收缩节点时，需要迁移的数据量大（虽然翻倍扩容可以相对减少迁移量）

#### 2.2.1.2  一致性哈希分区（Consistent hashing）
##### 原理
- 环形 hash 空间
按常用 hash 算法，将对应的 key hash到一个具有 `2^32` 个桶的空间，即（0 ~  `2^32` - 1）的数字空间中。

将这些数字头尾相连，想象成一个闭合环形：
- 把数据通过一定的 hash 算法映射到环上
- 将机器通过一定的 hash 算法映射到环上
- 节点按顺时针转动，遇到的第一个机器，就把数据放在该机器

- 把对象映射到hash空间
![](https://img-blog.csdnimg.cn/20210511100911394.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
#### 把cache映射到hash空间
基本思想就是将对象和cache都映射到同一个hash数值空间中， 并且使用相同的hash算法

```bash
hash(cache A) = key A;
hash(cache C) = key C;
```
在移除 or 添加一个 cache 时，能够尽可能小的改变已存在的 key 映射关系
#### Consistent hashing 一致性算法
![](https://img-blog.csdnimg.cn/c9800de2da2844eb93882a508076573c.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
##### 移除 Cache
- 删除CacheB后,橙色区为被影响范围
![](https://img-blog.csdnimg.cn/d1ef70c6454e4346bcdbe69c4c8a919e.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
##### 添加Cache![](https://img-blog.csdnimg.cn/dfe4a2f89dae48e4abf7017814330f7c.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 理想的分布式
![](https://img-blog.csdnimg.cn/20210505145541903.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
现实却很拥挤-即倾斜性：
![](https://img-blog.csdnimg.cn/20210505145603981.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
###### Hash倾斜性
![](https://img-blog.csdnimg.cn/bf37282868b044848234ac52d86b748f.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
为解决该问题，引入虚拟节点
![](https://img-blog.csdnimg.cn/503943a48f194bf385efecd88bfc37f1.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 虚拟节点
![](https://img-blog.csdnimg.cn/20210505145715687.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
命中率计算公式：服务器台数n，新增服务器数m
```java
(1 - n/(n + m) ) * 100%
```

![](https://img-blog.csdnimg.cn/20210430171238577.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 一致性哈希-扩容
![](https://img-blog.csdnimg.cn/20210430171258523.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
客户端分片：哈希+顺时针(优化取余)
节点伸缩：只影响邻近节点，但还是有数据迁移
翻倍伸缩：保证最小迁移数据和负载均衡
#### 2.2.1.3 虚拟槽哈希分区(Redis Cluster采用)
- 虚拟槽分配
![](https://img-blog.csdnimg.cn/img_convert/9c34e9351e74c1aacf6954ce66dba007.png)
- 预设虚拟槽
每个槽映射一个数据子集, 一般比节点数大
- 良好的哈希函数
例如CRC16
- 服务端管理节点、槽、数据

### 特点
- 数据分散度高
- 键值分布业务无关
- 无法顺序访问
- 支持批量操作

### 产品
- 一致性哈希Memcache
- Redis Cluster
- ...

哈希分片的一种高端形式称为一致性哈希(consistent hashing)，被一些 **Redis 客户端和代理实现**。

# 3 分片的各种实现
可由软件栈中的不同部分来承担。
## 3.1 客户端分片
客户端直接选择正确节点来写入和读取指定键，许多 Redis 客户端实现了客户端分片。
## 3.2 代理协助分片
客户端发送请求到一个可以理解 Redis 协议的代理上，而不是直接发送到 Redis 实例。代理会根据配置好的分片模式，来保证转发我们的请求到正确的 Redis 实例，并返回响应给客户端。
Redis 和 Memcached 的代理 Twemproxy 都实现了代理协助的分片。
## 3.3 查询路由
可发送你的查询到一个随机实例，该实例会保证转发你的查询到正确节点。
Redis 集群在客户端的帮助下，实现了查询路由的一种混合形式，请求不是直接从 Redis 实例转发到另一个，而是客户端收到重定向到正确的节点。

# 4 分片的缺点
Redis 的一些特性与分片在一起时玩的不是很好：
- 涉及多个键的操作通常不支持。例如，无法直接对映射在两个不同 Redis 实例上的键执行交集
- 涉及多个键的事务不能使用
- 分片的粒度是键，所以不能使用一个很大的键来分片数据集，例如一个很大的sorted set
- 当使用了分片，数据处理变得更复杂。例如，你需要处理多个 RDB/AOF 文件，备份数据时需要聚合多个实例和主机的持久化文件
- 添加和删除容量也很复杂。例如，Redis 集群具有运行时动态添加和删除节点的能力来支持透明地再均衡数据，但是其他方式，像客户端分片和代理都不支持这个特性。但有一种称为预分片(Presharding)的技术在这一点上能帮上忙。
# 5 数据存储or缓存？
尽管无论是将 Redis 作为数据存储还是缓存，Redis 分片概念上都是一样的。
- 但作为数据存储时有个重要局限：当 Redis 作为数据存储时，一个给定的键总是映射到相同 Redis 实例。
- 当 Redis 作为缓存时，如果一个节点不可用而使用另一个节点，这并不是啥大问题，按照我们的愿望来改变键和实例的映射来改进系统的可用性(即系统响应我们查询的能力)。

一致性哈希实现常常能够在指定键的首选节点不可用时切换到其它节点。类似的，如果你添加一个新节点，部分数据就会开始被存储到这个新节点上。

主要概念：
- 如果 Redis 用作缓存，使用一致性哈希来实现伸缩扩展很容易
- 如果 Redis 用作存储，使用固定的键到节点的映射，所以节点的数量必须固定不能改变。否则，当增删节点时，就需要一个支持再平衡节点间键的系统，当前只有 Redis 集群可以做到这点。
# 6 预分片
分片存在一个问题，除非我们使用 Redis 作为缓存，否则增加和删除节点都是件麻烦事，而使用固定的键和实例映射要简单得多。

然而，数据存储的需求可能一直在变化。今天可接受 10 个 Redis 节点，但明天可能就需 50 个节点。

因为 Redis 只有相当少的内存占用且轻量级(一个空闲的实例只使用 1MB 内存)，一个简单的解决办法是一开始就开启很多实例。即使你一开始只有一台服务器，也可以在第一天就决定生活在分布式世界，使用分片来运行多个 Redis 实例在一台服务器上。
你一开始就可以选择很多数量的实例。例如，32 或者 64 个实例能满足大多数用户，并且为未来的增长提供足够的空间。
这样，当数据存储增长，需要更多 Redis 服务器，你要做的就是简单地将实例从一台服务器移动到另外一台。当你新添加了第一台服务器，你就需要把一半的 Redis 实例从第一台服务器搬到第二台，以此类推。

使用 Redis 复制，就可以在很小或者根本不需要停机的时间内完成移动数据：
1. 在新服务器上启动一个空实例
2. 移动数据，配置新实例为源实例的从服务
3. 停止客户端
4. 更新被移动实例的服务器 IP 地址配置
5. 向新服务器上的从节点发送 SLAVEOF NO ONE 命令
6. 以新的更新配置启动你的客户端
7. 最后关闭掉旧服务器上不再使用的实例

# 7 Redis分片实现
##  7.1 Redis 集群
Redis 集群是自动分片和高可用的首选方式。一旦 Redis 集群以及支持 Redis 集群的客户端可用，Redis 集群将会成为 Redis 分片的事实标准。

Redis 集群是查询路由和客户端分片的一种混合模式。

##  7.2 Twemproxy
Twemproxy 是 Twitter 开发的一个支持 Memcached ASCII 和 Redis 协议的代理。它是单线程的，由 C 语言编写，运行非常快，基于 Apache 2.0 许可证。

Twemproxy 支持在多个 Redis 实例间自动分片，若节点不可用，还有可选的节点排除支持。
这会改变 <键，实例> 映射，所以应该只在将 Redis 作为缓存是才使用该特性。

这并非单点故障，因为你可启动多个代理，并且让你的客户端连接到第一个接受连接的代理。

从根本上说，Twemproxy 是介于客户端和 Redis 实例之间的中间层，这就可以在最下的额外复杂性下可靠地处理我们的分片。这是当前建议的处理 Redis 分片的方式。

##  7.3 支持一致性哈希的客户端
Twemproxy 之外的可选方案，是使用实现了客户端分片的客户端，通过一致性哈希或者别的类似算法。有多个支持一致性哈希的 Redis 客户端，例如 Redis-rb 和 Predis。
查看完整的 Redis 客户端列表，看看是不是有支持你的编程语言的，并实现了一致性哈希的成熟客户端即可。

> 参考
> - https://redis.io/topics/partitioning