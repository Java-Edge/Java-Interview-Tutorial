> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

在Redis复制的基础上（不包括Redis Cluster或Redis Sentinel作为附加层提供的高可用功能），使用和配置主从复制非常简单，能使得从 Redis 服务器（下文称 slave）能精确得复制主 Redis 服务器（下文称 master）的内容。每次当 slave 和 master 之间的连接断开时， slave 会自动重连到 master 上，并且无论这期间 master 发生了什么， slave 都将尝试让自身成为 master 的精确副本。

该系统的运行依靠三个重要机制：
1. 当一个 master 实例和一个 slave 实例连接正常时， master 会发送一连串命令流保持对 slave 的更新，以便将自身数据集的改变复制给 slave，这包括客户端的写入、key 的过期或被逐出等等
2. 当 master 和 slave 断连后，因为网络问题、或者是主从意识到连接超时， slave 重新连接上 master 并会尝试进行部分重同步：这意味着它会尝试只获取在断开连接期间内丢失的命令流
3. 当无法进行部分重新同步时， slave 会请求全量重同步。这涉及到一个更复杂过程，比如master 需要创建所有数据的快照，将之发送给 slave ，之后在数据集更改时持续发送命令流到 slave


Redis使用默认的异步复制，低延迟且高性能，适用于大多数 Redis 场景。但是，slave会异步确认其从master周期接收到的数据量。

客户端可使用 WAIT 命令来请求同步复制某些特定的数据。但是，WAIT 命令只能确保在其他 Redis 实例中有指定数量的已确认的副本：在故障转移期间，由于不同原因的故障转移或是由于 Redis 持久性的实际配置，故障转移期间确认的写入操作可能仍然会丢失。

# Redis 复制特点
- Redis 使用异步复制，slave 和 master 之间异步地确认处理的数据量
- 一个 master 可以拥有多个 slave
- slave 可以接受其他 slave 的连接。除了多个 slave 可以连接到同一 master ， slave 之间也可以像层级连接其它 slave。Redis 4.0 起，所有的 sub-slave 将会从 master 收到完全一样的复制流
- Redis 复制在 master 侧是非阻塞的，即master 在一或多 slave 进行初次同步或者是部分重同步时，可以继续处理查询请求
- 复制在 slave 侧大部分也是非阻塞的。当 slave 进行初次同步时，它可以使用旧数据集处理查询请求，假设在 redis.conf 中配置了让 Redis 这样做的话。否则，你可以配置如果复制流断开， Redis slave 会返回一个 error 给客户端。但是，在初次同步之后，旧数据集必须被删除，同时加载新的数据集。 slave 在这个短暂的时间窗口内（如果数据集很大，会持续较长时间），会阻塞到来的连接请求。自 Redis 4.0 开始，可以配置 Redis 使删除旧数据集的操作在另一个不同的线程中进行，但是，加载新数据集的操作依然需要在主线程中进行并且会阻塞 slave
- 复制可被用在可伸缩性，以便只读查询可以有多个 slave 进行（例如 O(N) 复杂度的慢操作可以被下放到 slave ），或者仅用于数据安全和高可用
- 可使用复制来避免 master 将全部数据集写入磁盘造成的开销：一种典型的技术是配置你的 master 的 `redis.conf`以避免对磁盘进行持久化，然后连接一个 slave ，配置为不定期保存或是启用 AOF。但是，这个设置必须小心处理，因为重启的 master 将从一个空数据集开始：如果一个 slave 试图与它同步，那么这个 slave 也会被清空！

# 1 单机“危机”
- 容量瓶颈
- 机器故障
- QPS瓶颈



![](https://img-blog.csdnimg.cn/20200904132333485.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

- 一主多从
![](https://img-blog.csdnimg.cn/20200904150126617.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

## 主从复制作用
- 数据副本
- 扩展读性能

## 总结
1. 一个master可以有多个slave
2. 一个slave只能有一个master
3. 数据流向是单向的，master => slave

# 2 实现复制的操作
如下两种实现方式：

### slaveof 命令
- 异步执行,很耗时间
![](https://img-blog.csdnimg.cn/20200904150903762.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

无需重启，但是不便于配置的管理。

### 配置
```shell
slaveof ip port
slave-read-only yes
```
虽然可统一配置，但是需要重启。

# 3 全量复制
1. master执行`bgsave`，在本地生成一份RDB快照client-output-buffer-limit slave 256MB 64MB 60
2. master node将RDB快照发送给salve node，若RDB复制时间超过60秒（repl-timeout），那么slave node就会认为复制失败，可适当调大该参数(对于千兆网卡的机器，一般每秒传输100MB，6G文件，很可能超过60s)
3. master node在生成RDB时，会将所有新的写命令缓存在内存中，在salve node保存了rdb之后，再将新的写命令复制给salve node
4. 若在复制期间，内存缓冲区持续消耗超过64MB，或者一次性超过256MB，那么停止复制，复制失败
5. slave node接收到RDB之后，清空自己的旧数据，然后重新加载RDB到自己的内存中，同时**基于旧的数据版本**对外提供服务
6. 如果slave node开启了AOF，那么会立即执行BGREWRITEAOF，重写AOF

RDB生成、RDB通过网络拷贝、slave旧数据的清理、slave aof rewrite，很耗费时间

如果复制的数据量在4G~6G之间，那么很可能全量复制时间消耗到1分半到2分钟
## 3.1 全量复制开销
1. bgsave时间
2. RDB文件网络传输时间
3. 从节点清空数据时间
4. 从节点加载RDB的时间
5. 可能的AOF重写时间

## 3.2 全量同步细节
master 开启一个后台save进程，以便生成一个 RDB 文件。同时它开始缓冲所有从客户端接收到的新的写入命令。当后台save完成RDB文件时， master 将该RDB数据集文件发给 slave， slave会先将其写入磁盘，然后再从磁盘加载到内存。再然后 master 会发送所有缓存的写命令发给 slave。这个过程以指令流的形式完成并且和 Redis 协议本身的格式相同。

当主从之间的连接因为一些原因崩溃之后， slave 能够自动重连。如果 master 收到了多个 slave 要求同步的请求，它会执行一个单独的后台保存，以便于为多个 slave 服务。

# 4 增量复制

1. 如果全量复制过程中，master-slave网络连接中断，那么salve重连master时，会触发增量复制
2. master直接从自己的backlog中获取部分丢失的数据，发送给slave node
3. msater就是根据slave发送的psync中的offset来从backlog中获取数据的
![](https://img-blog.csdnimg.cn/20200905001841252.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

# 5  master关闭持久化时的复制安全性
在使用 Redis 复制功能时的设置中，推荐在 master 和 slave 中启用持久化。
当不可能启用时，例如由于非常慢的磁盘性能而导致的延迟问题，应该配置实例来避免重启后自动重新开始复制。

关闭持久化并配置了自动重启的 master 是危险的：
1. 设置节点 A 为 master 并关闭它的持久化设置，节点 B 和 C 从 节点 A 复制数据
2. 节点 A 宕机，但它有一些自动重启系统可重启进程。但由于持久化被关闭了，节点重启后其数据集是空的！
3. 这时B、C 会从A复制数据，但A数据集空，因此复制结果是它们会销毁自身之前的数据副本！

当 Redis Sentinel 被用于高可用并且 master 关闭持久化，这时如果允许自动重启进程也是很危险的。例如， master 可以重启的足够快以致于 Sentinel 没有探测到故障，因此上述的故障模式也会发生。
任何时候数据安全性都是很重要的，所以如果 master 使用复制功能的同时未配置持久化，那么自动重启进程这项就该被禁用。

# 6 复制工作原理
- 每个 master 都有一个 replication ID ：一个较大的伪随机字符串，标记了一个给定的数据集。
![](https://img-blog.csdnimg.cn/20200905221152322.png#pic_center)
每个 master 也持有一个偏移量，master 将自己产生的复制流发送给 slave 时，发送多少个字节的数据，自身的偏移量就会增加多少，目的是当有新的操作修改自己的数据集时，它可据此更新 slave 的状态。
![](https://img-blog.csdnimg.cn/20200905221515483.png#pic_center)

复制偏移量即使在没有一个 slave 连接到 master 时，也会自增，所以基本上每一对给定的
`Replication ID, offset`
都会标识一个 master 数据集的确切版本。

## psync
slave使用`psync`从master复制，psync runid offset
![](https://img-blog.csdnimg.cn/20200905233312575.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

master会根据自身情况返回响应信息：
- 可能是FULLRESYNC runid offset触发全量复制
- 可能是CONTINUE触发增量复制

slave 连接到 master 时，它们使用 PSYNC 命令来发送它们记录的旧的 master replication ID 和它们至今为止处理的偏移量。通过这种方式， master 能够仅发送 slave 所需的增量部分。
但若 master 的缓冲区中没有足够的命令积压缓冲记录，或者如果 slave 引用了不再知道的历史记录（replication ID），则会转而进行一个全量重同步：在这种情况下， slave 会得到一个完整的数据集副本，从头开始。即：
- 若slave重连master，那么master仅会复制给slave缺少的部分数据
- 若第一次连接master，那么会触发全量复制


# 7 复制的完整流程
![](https://img-blog.csdnimg.cn/20190705083122154.png)

> slave如果跟master有网络故障，断开连接会自动重连。
> master如果发现有多个slave都重新连接，仅会启动一个rdb save操作，用一份数据服务所有slave。


1. slave启动，仅保存master的信息，包括master的`host`和`ip`，但复制流程尚未开始master host和ip配置在 `redis.conf` 中的 slaveof
2. slave内部有个定时任务，每s检查是否有新的master要连接和复制，若发现，就跟master建立socket网络连接。
3. slave发送ping命令给master
4. 口令认证 - 若master设置了requirepass，那么salve必须同时发送masterauth的口令认证
5. master **第一次执行全量复制**，将所有数据发给slave
6. master后续持续将写命令，异步复制给slave

## heartbeat
主从节点互相都会发送heartbeat信息。
master默认每隔10秒发送一次heartbeat，salve node每隔1秒发送一个heartbeat。

# 8 断点续传
Redis 2.8开始支持主从复制的断点续传
![](https://img-blog.csdnimg.cn/2019070508465819.png)

主从复制过程，若网络连接中断，那么可以接着上次复制的地方，继续复制下去，而不是从头开始复制一份。

## master和slave都会维护一个offset
- master在自身基础上累加offset，slave亦是
- slave每秒都会上报自己的offset给master，同时master保存每个slave的offset

master和slave都要知道各自数据的offset，才能知晓互相之间的数据不一致情况。

## backlog
master会在内存中维护一个backlog，默认1MB。master给slave复制数据时，也会将数据在backlog中同步写一份。

`backlog主要是用做全量复制中断时候的增量复制`。

master和slave都会保存一个replica offset还有一个master id，offset就是保存在backlog中的。若master和slave网络连接中断，slave会让master从上次replica offset开始继续复制。但若没有找到对应offset，就会执行resynchronization。

## master run id
- info server，可见master run id
![](https://img-blog.csdnimg.cn/20200905232843801.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

根据host+ip定位master node，是不靠谱的，如果master node重启或者数据出现了变化，那么slave node应该根据不同的run id区分，run id不同就做全量复制。
如果需要不更改run id重启redis，可使用：
```shell
redis-cli debug reload
```

# 9 无磁盘化复制
master在内存中直接创建RDB，然后发送给slave，不会在自己本地持久化。
只需要在配置文件中开启` repl-diskless-sync yes `即可.

```shell
等待 5s 再开始复制，因为要等更多 slave 重连
repl-diskless-sync-delay 5
```

# 10 处理过期key
Redis 的过期机制可以限制 key 的生存时间。此功能取决于 Redis 实例计算时间的能力，但是，即使使用 Lua 脚本更改了这些 key，Redis slaves 也能正确地复制具有过期时间的 key。

为实现这功能，Redis 不能依靠主从使用同步时钟，因为这是一个无法解决的问题并且会导致 race condition 和数据不一致，所以 Redis 使用三种主要的技术使过期的 key 的复制能够正确工作：
1. slave 不会让 key 过期，而是等待 master 让 key 过期。当一个 master 让一个 key 到期（或由于 LRU 算法删除）时，它会合成一个 DEL 命令并传输到所有 slave
2. 但由于这是 master 驱动的 key 过期行为，master 无法及时提供 DEL 命令，所以有时 slave 的内存中仍然可能存在逻辑上已过期的 key 。为了处理这问题，slave 使用它的逻辑时钟以报告只有在不违反数据集的一致性的读取操作（从主机的新命令到达）中才存在 key。用这种方法，slave 避免报告逻辑过期的 key 仍然存在。在实际应用中，使用 slave 程序进行缩放的 HTML 碎片缓存，将避免返回已经比期望的时间更早的数据项
3. 在Lua脚本执行期间，不执行任何 key 过期操作。当一个Lua脚本运行时，从概念上讲，master 中的时间是被冻结的，这样脚本运行的时候，一个给定的键要么存在要么不存在。这可以防止 key 在脚本中间过期，保证将相同的脚本发送到 slave ，从而在二者的数据集中产生相同的效果。

一旦 slave 被提升 master ，它将开始独立过期 key，而不需要任何旧 master 帮助。

# 11 重新启动和故障转移后的部分重同步
Redis 4.0 开始，当一个实例在故障转移后被提升为 master 时，它仍然能够与旧 master 的 slave 进行部分重同步。为此，slave 会记住旧 master 的旧 replication ID 和复制偏移量，因此即使询问旧的 replication ID，也可以将部分复制缓冲提供给连接的 slave 。

但是，升级的 slave 的新 replication ID 将不同，因为它构成了数据集的不同历史记录。例如，master 可以返回可用，并且可以在一段时间内继续接受写入命令，因此在被提升的 slave 中使用相同的 replication ID 将违反一对复制标识和偏移对只能标识单一数据集的规则。

另外，slave 在关机并重新启动后，能够在 RDB 文件中存储所需信息，以便与 master 进行重同步。这在升级的情况下很有用。当需要时，最好使用 SHUTDOWN 命令来执行 slave 的保存和退出操作。

# 参考
- https://raw.githubusercontent.com/antirez/redis/2.8/00-RELEASENOTES
- https://redis.io/topics/replication


![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)