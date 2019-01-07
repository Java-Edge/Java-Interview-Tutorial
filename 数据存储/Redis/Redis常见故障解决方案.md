# 1 重启和故障转移后的部分重同步
Redis 4.0 开始，当一个实例在故障转移后被提升为 master 时，它仍然能够与旧 master 的 slave 进行部分重同步。为此，slave 会记住旧 master 的旧 replication ID 和复制偏移量，因此即使询问旧的 replication ID，也可以将部分复制缓冲提供给连接的 slave 。

但是，升级的 slave 的新 replication ID 将不同，因为它构成了数据集的不同历史记录。例如，master 可以返回可用，并且可以在一段时间内继续接受写入命令，因此在被提升的 slave 中使用相同的 replication ID 将违反一对复制标识和偏移对只能标识单一数据集的规则。

另外，slave 在关机并重新启动后，能够在 RDB 文件中存储所需信息，以便与 master 进行重同步。这在升级的情况下很有用。当需要时，最好使用 SHUTDOWN 命令来执行 slave 的保存和退出操作。

# 2 主从数据不一致
主从网络延时：
## 主多从少
部分重同步。可以通过命令 PSYNC master_run_id offset 执行。
## 主少从多
全量复制，覆盖。这种情况是因为从节点读写模式导致的，关闭从节点读写模式，或者删除从节点数据，重新从主节点全量复制。
# 3 数据延迟
编写外部程序监听主从节点的复制偏移量，延迟较大时发出报警或通知客户端，切换到主节点或其他节点。

设置从节点`slave-serve-stale-data`为no,除INFO和SLAVOF命令之外的任何请求都会返回一个错误“SYNC with master in progress”。

当副本失去与mater的连接时或仍在进行复制时，副本可以如下方式起作用：
- 若 `replica-serve-stale-data` 设为“是”（默认值），则副本仍会回复客户端请求，可能带有过期数据，或者，如果这是第一次同步，则数据集可能只是空的
- 若将`replica-serve-stale-data`设为no，则该副本将对除以下信息以外的所有命令返回错误“SYNC with master in progress”：INFO，REPLICAOF，AUTH，PING，SHUTDOWN，REPLCONF，ROLE，CONFIG ，SUBSCRIBE，UNSUBSCRIBE，PSUBSCRIBE，PUNSUBSCRIBE，PUBLISH，PUBSUB，COMMAND，POST，HOST和LATENCY
# 4 脏数据
## 4.1 脏数据产因
### 4.1.1 Redis 删除策略
是因为读到了过期数据。

读到过期数据是 Redis 删除策略导致：
#### 惰性删除
master 每次读取命令时都会检查K是否超时，若超时则执行 del 命令删除键对象，之后异步把 del 命令 slave 节点，这样可以保证数据复制的一致性，slave 永远不会主动去删除超时数据。
#### 定时删除
Redis 的 master 节点在内部定时任务，会循环采样一定数量的键，当发现采样的键过期时，会执行 del 命令，之后再同步个 slave 节点。
#### 主动删除
当前已用内存超过 maxMemory 限定时，触发主动清理策略。主动设置的前提是设置了 maxMemory 的值
注：如果数据大量超时，master 节点采样速度跟不上过期的速度，而且 master 节点没有读取过期键的操作，那 slave 节点是无法收到 del 命令的，这时从节点上读取的数据已经是超时的了。
### 4.1.2 从节点可写
如果从节点（默认读模式）是读写模式，可能误写入从节点的数据，后期就会成为脏数据。
## 4.2 解决方案
### 忽略
比如 12306 查余票、双十一秒杀的库存，你会发现经常就是前后不一致的数据。因为你查询时得到的数据，就是需要允许写错误。
### 选择性强制读主
但是真正下单扣库存时，你就必须确保数据的正确性
选择强制读 master，slave间接变为备份服务器（某个业务）。
### 从节点只读
防止 slave 写入脏数据。
### Redis自身优化
Redis3.2 版本解决了 Redis 删除策略导致的过期数据，在此版本中 slave 读数据前，会检查K过期时间，以决定是否返回数据。


# 5 数据安全性
## 5.1 关闭主节点持久化

为提升Redis性能，一般会关闭主节点持久化的功能（这样所有数据都会持久化在 slave），因为主从同步时，master 都会 bgsave rdb。但这样也会带来复制的安全性问题。

在使用 Redis 复制功能时的设置中，推荐在 master 和在 slave 中启用持久化。当不可能启用时，例如由于非常慢的磁盘性能而导致的延迟问题，应该禁用主节点自动重启功能。

为什么关闭了持久化并配置了自动重启的 master 是危险的呢：
1. 关闭 Master 的持久化设置，Replica1 和 Replica2 从 Master 复制数据。此时 Master 只有内存数据，没有磁盘数据了。
2. 当 master 宕机，由于自动重启机制重启了，但重启后由于持久化被关闭了，Master数据集为空！
3. 重启后的 Master，发现 runId 发生变化，也会重新和从节点建立连接，两个从节点会发起复制请求，从Master 复制数据，但 Master 此时数据集为空，因此复制的结果是它们会销毁自身之前的数据副本而变成空数据集。
![](https://img-blog.csdnimg.cn/20210410164103333.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


### 5.1.1 解决方案
- 牺牲性能，开启 Master 的持久化功能。
- 为了性能，依旧选择关闭，那就让主节点不自动重启，比如不要有Docker或脚本等自动重启机制。