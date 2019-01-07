> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

Redis 对外提供数据访问服务时，使用的是常驻内存的数据。如果仅将数据存在内存，一旦宕机重启，数据全部丢失。

# 1 持久化概论

## 1.1 什么是持久化
redis所有数据保持在内存中，对数据的更新将异步地保存到磁盘上。持久化主要是做灾难恢复、数据恢复，可归类到高可用。


比如你的Redis宕机，你要做的事情是让Redis变得可用，尽快变得可用!

重启Redis，尽快让它对外提供服务，若你没做数据备份，即使Redis启动了，数据都没了!可用什么呢?

很可能说，大量的请求过来，缓存全部无法命中，在Redis里根本找不到数据，这个时候就造成缓存雪崩，就会去MySQL数据库去找，突然MySQL承接高并发，宕机!

MySQL宕机，你都没法去找数据恢复到Redis里面去，Redis的数据从哪儿来？就是从MySQL来的!


若你把Redis的持久化做好，备份和恢复方案也做到，那么即使你的Redis故障，也可通过备份数据，快速恢复，一旦恢复立即对外提供服务


## 1.2 持久化方式

Redis提供了两种持久化方式：

### Redis RDB - 快照
按指定时间间隔执行数据集的时间点快照，类似于MySQL Dump的 frm 文件。

### Redis AOF - 命令日志
AOF 会记录服务器接收的每个写操作，这些操作将在服务器启动时再次执行，以重建原始数据集。使用与Redis协议本身相同的格式记录命令，并且仅采用`append-only`方式。当日志太大时，Redis可以在后台重写日志。类似于MySQL Binlog、Hbase HLog。在Redis重启时，通过回放日志中的写入指令来重构整个数据。

> 如果希望Redis仅作为纯内存的缓存来用，亦可禁用RDB和AOF。
可以在同一实例中同时使用AOF和RDB。这种情况下，当Redis重新启动时，AOF文件将用于重建原始数据集，因为它可以保证是最完整的。

最重要的是理解RDB与AOF持久性之间的不同权衡。如果同时使用RDB和AOF两种持久化机制，那么在Redis重启时，会使用AOF来重新构建数据，因为AOF中的数据更加完整!

# 2 RDB - 全量写入
Redis Server在有多db 中存储的K.V可理解为Redis的一个状态。当发生`写操作`时，Redis就会从一个状态切换到另外一个状态。
基于全量的持久化就是在某个时刻，将Redis的所有数据持久化到硬盘中，形成一个快照。当Redis 重启时，通过加载最近一个快照数据，可以将 Redis 恢复至最近一次持久化状态上。

## 2.1 触发方式
#### save
save 可以由客户端显示触发，也可在redis shutdown 时触发。
save本身是`单线程串行`方式执行，因此当数据量大时，可能会发生Redis Server的长时间卡顿。但其备份期间不会有其他命令执行，因此备份时期 ` 数据的状态始终是一致性 `的。

若存在老的RDB文件，则新的会替换老的，时间复杂度O(N)。

![](https://img-blog.csdnimg.cn/20200903015740674.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
#### bgsave
bgsave 也可由
- 客户端显式触发
- 配置定时任务触发
- 主从架构下由从节点触发

bgsave命令在执行时，会`fork`一个子进程。子进程提交完成后，会立即给客户端返回响应，备份操作在后台异步执行，期间不会影响Redis的正常响应。

对于bgsave来说，当父进程Fork完子进程之后，异步任务会将`当前的内存状态作为一个版本进行复制`。在复制过程中产生的变更，不会反映在这次备份当中。

##### 不用命令，而使用配置
在Redis的默认配置中，当满足下面任一条件，会自动触发 bgsave 的执行：
|  配置  |  seconds  |  changes  |
| --- | --- | --- |
|  save  |  900  |  1 |
|  save  |  300  |  10  |
|  save  |  60  |  10000  |

​​​​​​bgsave相对于save的优势是`异步执行`，不影响后续命令执行。但Fork子进程，涉及父进程的内存复制，会增加服务器内存开销。`当内存开销高到使用虚拟内存时，bgsave的Fork子进程会阻塞运行`，可能会造成秒级不可用。因此使用bgsave需要保证服务器空闲内存足够。
![](https://img-blog.csdnimg.cn/20200903015209570.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)



|  命令  |  save  |  bgsave  |
| --- | --- | --- |
|  IO类型  |  同步  |  异步  |
|  是否阻塞  |  阻塞  |  非阻塞（在fork时阻塞）  |
|  复杂度  |  O(N)  |  O(N)  |
|  优点  |  不会消耗额外内存  |  不阻塞客户端命令  |
|  缺点  |  阻塞客户端命令  |  需要fork子进程，内存开销大  |

## RDB 最佳配置
关闭自动RDB：
```shell
dbfilename dump-${port}.rdb
dir /redisDataPath
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
```

### 需要注意的触发时机
- 主从复制时机的全量复制，master节点会执行bgsave
- debug reload
- shutdown
- flushDB 、 flushAll

## RDB性质
1. RDB是Redis内存到硬盘的快照，用于持久化
2. save通常会阻塞Redis
3. bgsave不会阻塞Redis，但会fork新进程
4. save自动配置满足任一就会被执行

## RDB 优点
- RDB会生成多个数据文件，每个文件都代表了某时刻Redis中的所有数据，这种方式非常适合做**冷备**，可将这种完整数据文件发送到云服务器存储，比如ODPS分布式存储，以预定好的备份策略来定期备份Redis中的数据
- RDB对Redis对外提供的读写服务，影响非常小，可让Redis保持高性能，因为Redis主进程只要fork一个子进程，让子进程执行RDB
- 相对于AOF，直接基于RDB文件重启和恢复Redis进程，更加快速
### RDB缺点
- 耗时，O(n)
- fork()：耗内存，copy-on-write策略
RDB每次在fork子进程来执行RDB快照数据文件生成的时候，如果数据文件特别大，可能会导致对客户端提供的服务暂停数毫秒，或者甚至数秒
- 不可控，容易丢失数据
一般RDB每隔5分钟，或者更长时间生成一次，若过程中Redis宕机，就会丢失最近未持久化的数据
## 2.2 恢复流程
当Redis重新启动时，会从本地磁盘加载之前持久化的文件。当恢复完成之后，再受理后续的请求操作。
# 3 AOF（append only file）- 增量模式
RDB记录的是每个状态的全量数据，AOF记录的则是每条**写命令的记录**，通过所有写命令的执行，最后恢复出最终的数据状态。
![](https://img-blog.csdnimg.cn/20190707123200343.png)

- 其文件生成如下：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTlmNDA3N2Y0YTAyMjk0NGIucG5n?x-oss-process=image/format,png)

但该模式默认是关闭的，需手动打开
![](https://img-blog.csdnimg.cn/20210206142749412.png)

## 3.1 写入流程
### AOF的三种策略
![](https://img-blog.csdnimg.cn/20200903164454130.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
#### always
- 每次刷新缓冲区，都会同步触发同步操作。但因为每次写操作都会触发同步，所以该策略会大大降低Redis的吞吐量。当然了，该模式会拥有最高的容错性。
![](https://img-blog.csdnimg.cn/20200903212610656.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

#### every second
- 每秒异步的触发同步操作。
![](https://img-blog.csdnimg.cn/20200903213251820.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

#### no
- 由os决定何时同步，该方式下Redis无法决定何时落地，因此不可控。
![](https://img-blog.csdnimg.cn/20200903213521521.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
#### 对比
|  命令  |  always  |  everysec  |  no  |
| --- | --- | --- | --- |
|  优点  |  不丢数据  |  1 fsync/s，丢1s数据  |  默认，无需设置  |
|  缺点  |  I/O开销大，一般的STAT盘只有几百TPS  |  丢1s数据 |  不可控  |

## 3.2 回放流程
AOF的回放时机也是在`机器启动时`，`一旦存在AOF，Redis就会选择增量回放`。

因为增量持久化是持续的写盘，相比于全量持久化，数据更加完整。回放过程就是将AOF中存放的命令，重新执行一遍。完成后再继续接收客户端新命令。
### AOF模式的优化重写
随着Redis 持续的运行，会有大量的增量数据append 到AOF 文件中。为了减小硬盘存储和加快恢复速度，Redis 通过rewrite 机制合并历史AOF 记录。如下所示：

原生 AOF
```shell
set hello world
set hello java
set hello hehe
incr counter
incr counter
rpush mylist a
rpush mylist b
rpush mylist c
过期数据
```
AOF 重写
```shell
set hello hehe
set counter 2 
rpush mylist a b c
```

### AOF重写的作用
- 减少硬盘占用量
- 加速恢复速度

## 3.3  AOF重写实现两种方式
### bgrewriteaof

![](https://img-blog.csdnimg.cn/20200903161134985.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

### AOF 重写配置
#### 配置项
- AOF文件增长率 / AOF文件重写需要的大小
![](https://img-blog.csdnimg.cn/20200903153253226.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
- AOF当前尺寸（单位：字节）
![](https://img-blog.csdnimg.cn/20200903151629116.png#pic_center)
- `aof_base_size` AOF 上次启动和重写的大小（单位：字节）

#### 自动触发配置
```shell
aof_current_size > auto-aof-rewrite-min-size
aof_current_size - aof_base_size/aof_base_size > auto-aof-rewrite-percentage
```
## 3.4 AOF 重写流程
![](https://img-blog.csdnimg.cn/20200903150600480.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

###  AOF 重写配置
修改配置文件
```shell
appendonly yes
appendfilename "appendonly-$(port).aof"
appendfsync everysec
dir /opt/soft/redis/data
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
no-appendfsync-on-rewrite yes
```
## AOF的优点
- 更好避免数据丢失
一般AOF每隔1s，通过子进程执行一次fsync，最多丢1s数据
- `append-only`模式追加写
所以没有任何磁盘寻址的开销，写入性能高，且文件不易破损，即使文件尾部破损，也易修复
- 日志文件即使过大，出现后台重写操作，也不会影响客户端的读写
因为在rewrite log时，会压缩其中的指令，创建出一份需要恢复数据的最小日志。在创建新日志时，旧日志文件还是照常写入。当新的merge后的日志文件准备好时，再交换新旧日志文件即可!
- 命令通过非常可读的方式记录
该特性非常适合做灾难性误删除操作的**紧急恢复**。
比如某人不小心用flushall命令清空了所有数据，只要这个时候后台rewrite还没有发生，可立即拷贝AOF文件，将最后一条flushall命令给删了，然后再将该AOF文件放回去，就可通过恢复机制，自动恢复所有数据
### 2.2.2 AOF的缺点
- 对于同一份数据，AOF日志一般比RDB快照更大
- AOF开启后，写QPS会比RDB的低，因为AOF一般会配置成每s fsync一次日志文件，当然，每s一次fsync，性能也还是很高的
- 以前AOF发生过bug，就是通过AOF记录的日志，进行数据恢复的时候，没有恢复一模一样的数据出来
类似AOF这种较为复杂的基于命令日志/merge/回放的方式，比基于RDB的每次持久化一份完整的数据快照方式相比更加脆弱一些，易产生bug
不过AOF就是为了避免rewrite过程导致的bug，因此每次rewrite并不是基于旧的指令日志进行merge的，而是基于当时内存中的数据进行指令的重新构建，这样健壮性会更好


# 4 选型及最佳实践
| 命令 |RDB  |AOF|
|--|--|--|
|  启动优先级 |低  |高 |
|  体积 |低  |高 |
|  恢复速度 |快  |慢 |
|  数据安全性 |丢数据  |根据策略决定 |
|  量级 |重量级  |轻量级 |

## Redis 4.0 对于持久化机制的优化
Redis 4.0 开始支持 RDB 和 AOF 的混合持久化（默认关闭，可以通过配置项 `aof-use-rdb-preamble` 开启）。

如果把混合持久化打开，AOF 重写的时候就直接把 RDB 的内容写到 AOF 文件开头。这样做的好处是可以结合 RDB 和 AOF 的优点, 快速加载同时避免丢失过多的数据。当然缺点也是有的， AOF 里面的 RDB 部分就是压缩格式不再是 AOF 格式，可读性较差

## 4.1 RDB最佳策略
- 关闭
- 集中手动管理RDB操作
- 在从节点打开自动执行配置，但是不宜频繁执行RDB

## 4.2 AOF最佳策略
- 建议打开，但是如果只是纯作为缓存使用可不开
- AOF重写集中管理
- everysec

## 4.3 抉择RDB & AOF
1. 不要仅使用RDB，因为那样会导致你丢失很多数据
2. 也不要仅使用AOF，因为那样有两个问题
	- 你通过AOF做冷备，没有RDB做冷备，来的恢复速度更快
	- RDB每次简单粗暴生成数据快照，更加健壮，可以避免AOF这种复杂的备份和恢复机制的bug
3. 综合使用AOF和RDB
	- 用AOF保证数据不丢失，作为数据恢复的第一选择
	- 用RDB做不同程度的冷备，在AOF文件都丢失或损坏不可用时，还可使用RDB快速实现数据恢复
## 4.4 一些最佳实践
- 小分片
例如设置maxmemory参数设置每个redis只存储4个G的空间，这样各种操作都不会太慢
- 监控(硬盘、内存、负载、网络)
- 足够的内存

参考
- https://redis.io/topics/persistence
- 《Redis设计与实现》