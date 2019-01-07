在Redis复制的基础上（不包括Redis Cluster或Redis Sentinel作为附加层提供的高可用功能），使用和配置主从复制非常简单，能使得 【Redis从服务器】（下文称R）能精确得复制 【Redis主服务器】（下文称M）的内容。
每当 R 和 M 之间的连接断开时， R 会自动重连到 M，并且无论这期间 M 发生了什么， R 都将尝试让自身成为 M 的精确副本。
# 1 依赖机制
该系统的运行依靠如下重要的机制：
## 1.1 更新 R
当一个 M 和一个 R 连接正常时， M 会发送一连串命令流保持对 R 的更新，以便将自身数据集的改变复制给 R，这包括客户端的写入、key 的过期或被逐出等
## 1.2 部分重同步
当 M 和 R 断连后，因为网络问题、或者是主从意识到连接超时， R 重新连接上 M 并会尝试进行部分重同步：它会尝试只获取在断开连接期间内丢失的命令流。
## 1.3 全量重同步
当无法进行部分重同步时， R 会请求全量重同步。
这涉及到一个更复杂过程，比如M需要创建所有数据的快照，将之发送给 R ，之后在数据集更改时持续发送命令流到 R。

Redis使用默认的异步复制，低延迟且高性能，适用于大多数 Redis 场景。但是，R会异步确认其从M周期接收到的数据量。

客户端可使用 WAIT 命令来请求同步复制某些特定的数据。但WAIT命令只能确保在其他 Redis 实例中有指定数量的已确认的副本：在故障转移期间，由于不同原因的故障转移或是由于 Redis 持久性的实际配置，故障转移期间确认的写入操作可能仍然会丢失。
# 2 Redis 复制特点
- Redis 使用异步复制，R 和 M 之间异步地确认处理的数据量
- 一个 M 可有多个 R
- R 可接受其他 R 的连接
除了多个 R 可以连接到同一 M，R 间也可以像层级连接其它 R。Redis 4.0起，所有 sub-R 将会从 M 收到完全一样的复制流
- Redis 复制在 M 侧是非阻塞的
M 在一或多 R 进行初次同步或者是部分重同步时，可以继续处理查询请求
- 复制在 R 侧大部分也是非阻塞
当 R 进行初次同步时，它可以使用旧数据集处理查询请求，假设在 redis.conf 中配置了让 Redis 这样做。否则，你可以配置如果复制流断开， Redis R 会返回一个 error 给客户端。但在初次同步后，旧数据集必须被删除，同时加载新的数据集。 R 在这个短暂的时间窗口内（如果数据集很大，会持续较长时间），会阻塞到来的连接请求。自 Redis 4.0 开始，可以配置 Redis 使删除旧数据集的操作在另一个不同的线程中进行，但是，加载新数据集的操作依然需要在主线程中进行并且会阻塞 R
- 复制可被用在可伸缩性，以便只读查询可以有多个 R 进行（例如 O(N) 复杂度的慢操作可以被下放到 R ），或者仅用于数据安全和高可用
- 可使用复制来避免 M 将全部数据集写入磁盘造成的开销：一种典型的技术是配置你的 M 的 `redis.conf`以避免对磁盘进行持久化，然后连接一个 R ，配置为不定期保存或是启用 AOF。但是，这个设置必须小心处理，因为重启的 M 将从一个空数据集开始：如果一个 R 试图与它同步，那么这个 R 也会被清空！

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

1. 一个M可以有多个R
2. 一个R只能有一个M
3. 数据流向是单向的，M => R

# 2 实现复制的操作
## 2.1 命令：Rof 
- 异步执行，很耗时间
![](https://img-blog.csdnimg.cn/20200904150903762.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
无需重启，但是不便于配置管理。
## 2.2 配置
```shell
Rof ip port
R-read-only yes
```
虽然可统一配置，但需重启。
# 3 全量复制
1. M执行`bgsave`，在本地生成一份RDB
![](https://img-blog.csdnimg.cn/7c7eda61e919428d9090b56a4c61505e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
2. M将RDB发给salve，若RDB复制时间＞60s（repl-timeout）
![](https://img-blog.csdnimg.cn/6cfb55cdc5ca441c9de0cc67d060590e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
则replica就会认为复制失败，可适当调大该参数(对于千兆网卡的机器，一般每秒传输100MB，6G文件，很可能超过60s)
![](https://img-blog.csdnimg.cn/5a4ce67217eb4f41a622d630d9268ccf.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)	
3. M在生成RDB时，会将所有新的写命令缓存在内存中，在salve保存了rdb之后，再将新的写命令复制给salve
4. 若在复制期间，内存缓冲区持续消耗超过64MB，或者一次性超过256MB，则停止复制，复制失败
5. R node接收到RDB之后，清空自己的旧数据，然后重新加载RDB到自己的内存中，同时**基于旧的数据版本**对外提供服务
6. 如果R开启了AOF，那么会立即执行BGREWRITEAOF，重写AOF

![](https://img-blog.csdnimg.cn/20210401150137560.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
RDB生成、RDB通过网络拷贝、R旧数据的清理、R aof rewrite，很耗费时间。
如果复制的数据量在4G~6G之间，那么很可能全量复制时间消耗到1分半到2分钟。
## 3.1 全量复制开销
1. bgsave时间
2. RDB文件网络传输时间
3. 从节点清空数据时间
4. 从节点加载RDB的时间
5. 可能的AOF重写时间
## 3.2 全量同步细节
M 开启一个后台save进程，以便生成一个 RDB 文件。同时它开始缓冲所有从客户端接收到的新的写入命令。当后台save完成RDB文件时， M 将该RDB数据集文件发给 R， R会先将其写入磁盘，然后再从磁盘加载到内存。再然后 M 会发送所有缓存的写命令发给 R。这个过程以指令流的形式完成并且和 Redis 协议本身的格式相同。

当主从之间的连接因为一些原因崩溃之后， R 能够自动重连。如果 M 收到了多个 R 要求同步的请求，它会执行一个单独的后台保存，以便于为多个 R 服务。
### 加速复制
默认情况下，M接收SYNC命令后执行BGSAVE，将数据先保存到磁盘，若磁盘性能差，则**写入磁盘会消耗大量性能**。
因此在Redis 2.8.18时进行改进，可以设置无需写入磁盘直接发生RDB快照给R，加快复制速度。

复制SYNC策略：磁盘或套接字。仅仅接受差异就无法继续复制过程的新副本和重新连接副本需要进行所谓的“完全同步”。 RDB文件从主数据库传输到副本数据库。传输可以通过两种不同的方式进行：1）支持磁盘：Redis主服务器创建一个新过程，将RDB文件写入磁盘。后来，该文件由父进程逐步传输到副本。 2）无盘：Redis主服务器创建一个新进程，该进程将RDB文件直接写入副本套接字，而完全不接触磁盘。使用磁盘支持的复制，在生成RDB文件的同时，只要生成RDB文件的当前子级完成工作，就可以将更多副本排入队列并与RDB文件一起使用。如果使用无盘复制，则一旦传输开始，新的副本将排队，并且当当前副本终止时将开始新的传输。当使用无盘复制时，主服务器在开始传输之前等待一段可配置的时间（以秒为单位），以希望多个副本可以到达并且传输可以并行化。使用慢速磁盘和快速（大带宽）网络时，无盘复制效果更好。
修改配置: 
```java
repl-diskless-sync yes (默认no)
```
# 4 增量复制
1. 如果全量复制过程中，M-R网络连接中断，那么salve重连M时，会触发增量复制
2. M直接从自己的backlog中获取部分丢失的数据，发送给R node
3. msater就是根据R发送的psync中的offset来从backlog中获取数据的
![](https://img-blog.csdnimg.cn/20200905001841252.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
# 5  M关闭持久化时的复制安全性
在使用 Redis 复制功能时的设置中，推荐在 M 和 R 中启用持久化。
当不可能启用时，例如由于非常慢的磁盘性能而导致的延迟问题，应该配置实例来避免重启后自动重新开始复制。

关闭持久化并配置了自动重启的 M 是危险的：
1. 设置节点 A 为 M 并关闭它的持久化设置，节点 B 和 C 从 节点 A 复制数据
2. 节点 A 宕机，但它有一些自动重启系统可重启进程。但由于持久化被关闭了，节点重启后其数据集是空的！
3. 这时B、C 会从A复制数据，但A数据集空，因此复制结果是它们会销毁自身之前的数据副本！

当 Redis Sentinel 被用于高可用并且 M 关闭持久化，这时如果允许自动重启进程也是很危险的。例如， M 可以重启的足够快以致于 Sentinel 没有探测到故障，因此上述的故障模式也会发生。
任何时候数据安全性都是很重要的，所以如果 M 使用复制功能的同时未配置持久化，那么自动重启进程这项就该被禁用。

> 用Redis主从同步，写入Redis的数据量太大，没加频次控制，导致每秒几十万写入，主从延迟过大，运维频频报警，在主库不挂掉的情况下，这样大量写入会不会造成数据丢失？
> 若主从延迟很大，数据会堆积到redis主库的发送缓冲区，会导致主库OOM。

# 6 复制工作原理
- 每个 M 都有一个 replication ID ：一个较大的伪随机字符串，标记了一个给定的数据集。
![](https://img-blog.csdnimg.cn/20200905221152322.png#pic_center)
每个 M 也持有一个偏移量，M 将自己产生的复制流发送给 R 时，发送多少个字节的数据，自身的偏移量就会增加多少，目的是当有新的操作修改自己的数据集时，它可据此更新 R 的状态。
![](https://img-blog.csdnimg.cn/20200905221515483.png#pic_center)

复制偏移量即使在没有一个 R 连接到 M 时，也会自增，所以基本上每一对给定的
`Replication ID, offset`
都会标识一个 M 数据集的确切版本。

## psync
R使用`psync`从M复制，psync runid offset
![](https://img-blog.csdnimg.cn/20200905233312575.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

M会根据自身情况返回响应信息：
- 可能是FULLRESYNC runid offset触发全量复制
- 可能是CONTINUE触发增量复制

R 连接到 M 时，它们使用 PSYNC 命令来发送它们记录的旧的 M replication ID 和它们至今为止处理的偏移量。通过这种方式， M 能够仅发送 R 所需的增量部分。
但若 M 的缓冲区中没有足够的命令积压缓冲记录，或者如果 R 引用了不再知道的历史记录（replication ID），则会转而进行一个全量重同步：在这种情况下， R 会得到一个完整的数据集副本，从头开始。即：
- 若R重连M，那么M仅会复制给R缺少的部分数据
- 若第一次连接M，那么会触发全量复制

Redis使用复制保证数据同步，以2.8版本为界：
## 2.8前性能较差的复制和命令传播
首先是从服务器发生同步操作sync，主服务器执行bgsave生成一个全量RDB文件，然后传输给从服务器。
同时主服务器会把这一过程中执行的写命令写入缓存区。从服务器会把RDB文件进行一次全量加载。
加载完毕后，主服务器会把缓存区中的写命令传给从服务器。从服务器执行命令后，主从服务器的数据就一致了。
这种方式每次如果网络出现故障，故障重连后都要进行全量数据的复制。对主服务器的压力太大，也会增加主从网络传输的资源消耗。
## 2.8后的优化
增加部分重同步功能，就是同步故障后的一部分数据，而非全量数据。这种优化在量级非常大的情况下效率提升很明显。

## 4.0的PSYNC2
# 7 复制的完整流程
![](https://img-blog.csdnimg.cn/20190705083122154.png)
> R如果跟M有网络故障，断开连接会自动重连。
> M如果发现有多个R都重新连接，仅会启动一个rdb save操作，用一份数据服务所有R。

1. R启动，仅保存M的信息，包括M的`host`和`ip`，但复制流程尚未开始M host和ip配置在 `redis.conf` 中的 Rof
2. R内部有个定时任务，每s检查是否有新的M要连接和复制，若发现，就跟M建立socket网络连接。
3. R发送ping命令给M
4. 口令认证 - 若M设置了requirepass，那么salve必须同时发送Mauth的口令认证
5. M **第一次执行全量复制**，将所有数据发给R
6. M后续持续将写命令，异步复制给R

## heartbeat
主从节点互相都会发送heartbeat信息。
M默认每隔10秒发送一次heartbeat，salve node每隔1秒发送一个heartbeat。

# 8 断点续传
Redis 2.8开始支持主从复制的断点续传
![](https://img-blog.csdnimg.cn/2019070508465819.png)

主从复制过程，若网络连接中断，那么可以接着上次复制的地方，继续复制下去，而不是从头开始复制一份。

## M和R都会维护一个offset
- M在自身基础上累加offset，R亦是
- R每秒都会上报自己的offset给M，同时M保存每个R的offset

M和R都要知道各自数据的offset，才能知晓互相之间的数据不一致情况。

## backlog
M会在内存中维护一个backlog，默认1MB。M给R复制数据时，也会将数据在backlog中同步写一份。

`backlog主要是用做全量复制中断时候的增量复制`。

M和R都会保存一个replica offset还有一个M id，offset就是保存在backlog中的。若M和R网络连接中断，R会让M从上次replica offset开始继续复制。但若没有找到对应offset，就会执行resynchronization。

## M run id
- info server，可见M run id
![](https://img-blog.csdnimg.cn/20200905232843801.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)

根据host+ip定位M node，是不靠谱的，如果M node重启或者数据出现了变化，那么R node应该根据不同的run id区分，run id不同就做全量复制。
如果需要不更改run id重启redis，可使用：
```shell
redis-cli debug reload
```
# 9 无磁盘化复制
M在内存中直接创建RDB，然后发送给R，不会在自己本地持久化。
只需要在配置文件中开启` repl-diskless-sync yes `即可.
```shell
等待 5s 再开始复制，因为要等更多 R 重连
repl-diskless-sync-delay 5
```
# 10 处理过期key
Redis 的过期机制可以限制 key 的生存时间。此功能取决于 Redis 实例计算时间的能力，但是，即使使用 Lua 脚本更改了这些 key，Redis Rs 也能正确地复制具有过期时间的 key。

为实现功能，Redis 不能依靠主从使用同步时钟，因为这是一个无法解决的问题并且会导致 race condition 和数据不一致，所以 Redis 使用三种主要的技术使过期的 key 的复制能够正确工作：
1. R 不会让 key 过期，而是等待 M 让 key 过期。当一个 M 让一个 key 到期（或由于 LRU 删除）时，它会合成一个 DEL 命令并传输到所有 R
2. 但由于这是 M 驱动的 key 过期行为，M 无法及时提供 DEL 命令，所以有时 R 的内存中仍可能存在逻辑上已过期的 key 。为处理该问题，R 使用它的逻辑时钟以报告只有在不违反数据集的一致性的读取操作（从主机的新命令到达）中才存在 key。用这种方法，R 避免报告逻辑过期的 key 仍然存在。在实际应用中，使用 R 程序进行缩放的 HTML 碎片缓存，将避免返回已经比期望的时间更早的数据项
3. 在Lua脚本执行期间，不执行任何 key 过期操作
当一个Lua脚本运行时，概念上讲，M 中的时间是被冻结的，这样脚本运行的时候，一个给定的键要么存在or不存在。这可以防止 key 在脚本中间过期，保证将相同的脚本发送到 R ，从而在二者的数据集中产生相同的效果。

一旦 R 被提升 M ，它将开始独立过期 key，而不需要任何旧 M 帮助。

# 11 重新启动和故障转移后的部分重同步
Redis 4.0 开始，当一个实例在故障转移后被提升为 M 时，它仍然能够与旧 M 的 R 进行部分重同步。为此，R 会记住旧 M 的旧 replication ID 和复制偏移量，因此即使询问旧的 replication ID，也可以将部分复制缓冲提供给连接的 R 。

但是，升级的 R 的新 replication ID 将不同，因为它构成了数据集的不同历史记录。例如，M 可以返回可用，并且可以在一段时间内继续接受写入命令，因此在被提升的 R 中使用相同的 replication ID 将违反一对复制标识和偏移对只能标识单一数据集的规则。

另外，R 在关机并重新启动后，能够在 RDB 文件中存储所需信息，以便与 M 进行重同步。这在升级的情况下很有用。当需要时，最好使用 SHUTDOWN 命令来执行 R 的保存和退出操作。

> 参考
> - https://raw.githubusercontent.com/antirez/redis/2.8/00-RELEASENOTES
> - https://redis.io/topics/replication