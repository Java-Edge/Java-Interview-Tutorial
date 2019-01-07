# 1 面试题

Redis集群模式的工作原理说一下？在集群模式下，key是如何寻址的？寻址都有哪些算法？了解一致性hash吗？

# 2 考点分析

Redis不断在发展-Redis cluster集群模式，可以做到在多台机器上，部署多个实例，每个实例存储一部分的数据，同时每个实例可以带上Redis从实例，自动确保说，如果Redis主实例挂了，会自动切换到redis从实例顶上来。

现在新版本，大家都是用Redis cluster的，也就是原生支持的集群模式，那么面试官肯定会就redis cluster对你来个几连炮。要是你没用过redis cluster，正常，以前很多人用codis之类的客户端来支持集群，但是起码你得研究一下redis cluster

# 3 Redis如何在保持读写分离+高可用的架构下，还能横向扩容支撑1T+海量数据

- redis单master架构的容量的瓶颈问题
![](https://ask.qcloudimg.com/http-save/1752328/hosq404j9q.png)
- redis如何通过master横向扩容支撑1T+数据量![](https://ask.qcloudimg.com/http-save/1752328/6yjg1upzbi.png)

# 3 数据分布算法：hash+一致性hash+redis cluster的hash slot

讲解分布式数据存储的核心算法，数据分布的算法

hash算法 -> 一致性hash算法（memcached） -> redis cluster，hash slot算法

用不同的算法，就决定了在多个master节点的时候，数据如何分布到这些节点上去，解决这个问题

# 4 Redis cluster

- 自动将数据分片，每个master上放一部分数据
- 提供内置的高可用支持，部分master不可用时，还可继续工作

在Redis cluster架构下，每个Redis要开放两个端口，比如一个是6379，另外一个就是加10000的端口号，比如16379

16379端口用于节点间通信，也就是cluster bus集群总线

cluster bus的通信，用来故障检测，配置更新，故障转移授权

cluster bus用了另外一种二进制的协议 - gossip，主要用于节点间高效的数据交换，占用更少的网络带宽和处理时间

- 最老土的hash算法和弊端（大量缓存重建） 
![](https://ask.qcloudimg.com/http-save/1752328/1i0opt2jo7.png)

3、一致性hash算法（自动缓存迁移）+虚拟节点（自动负载均衡）

- 一致性hash算法的讲解和优点
![](https://ask.qcloudimg.com/http-save/1752328/13nksjkgat.png)
- 一致性hash算法的虚拟节点实现负载均衡
![](https://ask.qcloudimg.com/http-save/1752328/gos1u9fp10.png)

4、redis cluster的hash slot算法

![](https://ask.qcloudimg.com/http-save/1752328/3df7rwuplp.png)

redis cluster有固定的16384个hash slot，对每个key计算CRC16值，然后对16384取模，可以获取key对应的hash slot

redis cluster中每个master都会持有部分slot，比如有3个master，那么可能每个master持有5000多个hash slot

hash slot让node的增加和移除很简单，增加一个master，就将其他master的hash slot移动部分过去，减少一个master，就将它的hash slot移动到其他master上去

移动hash slot的成本是非常低的

客户端的api，可以对指定的数据，让他们走同一个hash slot，通过hash tag来实现

# 5 节点间的内部通信机制

## 5.1 基础通信原理

用于维护集群的元数据

### 5.1.1 集中式

- 集中式的集群元数据存储和维护
![](https://ask.qcloudimg.com/http-save/1752328/xejh8tb52v.png)
**将集群元数据（节点信息，故障等）集中存储在某个节点**
- 优点
元数据的更新和读取，时效性好，一旦元数据出现变更，立即更新到集中式的存储中，其他节点读取时立即就可感知
- 缺点
所有的元数据的跟新压力全部集中在一个地方，可能会导致元数据的存储有压力

Redis cluster节点间采取的另一种称为gossip的协议

互相之间不断通信，保持整个集群所有节点的数据是完整的

gossip：好处在于，元数据的更新比较分散，不是集中在一个地方，更新请求会陆陆续续，打到所有节点上去更新，有一定的延时，降低了压力; 缺点，元数据更新有延时，可能导致集群的一些操作会有一些滞后

我们刚才做reshard，去做另外一个操作，会发现说，configuration error，达成一致

（2）10000端口

每个节点都有一个专门用于节点间通信的端口，就是自己提供服务的端口号+10000，比如7001，那么用于节点间通信的就是17001端口

每隔节点每隔一段时间都会往另外几个节点发送ping消息，同时其他几点接收到ping之后返回pong

（3）交换的信息

故障信息，节点的增加和移除，hash slot信息，等等

### 5.1.2 gossip协议

- gossip协议维护集群元数据
![](https://ask.qcloudimg.com/http-save/1752328/1dfycf9xrp.png)
协议包含多种消息

#### meet

某节点发送meet给新加入的节点，让新节点加入集群，然后新节点就会开始与其他节点通信

```
redis-trib.rb add-node
```

其实内部就是发送了一个gossip meet消息给新节点，通知该节点加入集群

#### ping

每个节点都会频繁给其他节点发ping，其中包含自己的状态还有自己维护的集群元数据，互相通过ping交换元数据

ping很频繁，而且要携带一些元数据，可能会加重网络的负担

每个节点每s会执行10次ping，每次会选择5个最久没有通信的其他节点。当然如果发现某个节点通信延时达到了

```
cluster_node_timeout / 2
```

那么立即发送ping，避免数据交换延时过长，落后的时间太长了。比如说，两节点之间已经10分钟没有交换数据，那么整个集群处于严重的元数据不一致的情况，就会有问题。所以`cluster_node_timeout`可以调节，如果调节比较大，那么会降低发送频率

每次ping，一个是带上自己节点的信息，还有就是带上1/10其他节点的信息，发送出去，进行数据交换。至少包含3个其他节点的信息，最多包含总节点-2个其他节点的信息

#### pong

返回ping和meet，包含自己的状态和其他信息，也可用于信息广播和更新

#### fail

某个节点判断另一个节点fail后，就发送fail给其他节点，通知其他节点，指定的节点宕机啦！

# 6 面向集群的Jedis内部实现原理

开发Jedis，Redis的Java客户端

jedis cluster api与redis cluster集群交互的一些基本原理

## 6.1 基于重定向的客户端

redis-cli -c，自动重定向

### 6.1.1 请求重定向

客户端可能会挑选任意一个Redis实例去发送命令，每个实例接收到命令，都会计算key对应的hash slot

若在本地就在本地处理，否则返回moved给客户端，让客户端重定向

```
cluster keyslot mykey
```

可查看一个key对应的hash slot是什么

用redis-cli的时候，可加入`-c`参数，支持自动的请求重定向，redis-cli接收到moved之后，会自动重定向到对应的节点执行命令

### 6.1.2 计算hash slot

计算hash slot的算法，就是根据key计算CRC16值，然后对16384取模，拿到对应的hash slot

用hash tag可以手动指定key对应的slot，同一个hash tag下的key，都会在一个hash slot中，比如set mykey1:{100}和set mykey2:{100}

### 6.1.3 hash slot查找

节点间通过gossip协议数据交换，就知道每个hash slot在哪个节点上

## 6.2 smart jedis

### 6.2.1 什么是smart jedis

基于重定向的客户端，很消耗网络IO，因为大部分情况下，可能都会出现一次请求重定向，才能找到正确的节点

所以大部分的客户端，比如java redis客户端，就是jedis，都是smart的

本地维护一份hashslot -> node的映射表，缓存，大部分情况下，直接走本地缓存就可以找到hashslot -> node，不需要通过节点进行moved重定向

### 6.2.2 JedisCluster的工作原理

在JedisCluster初始化的时候，就会随机选择一个node，初始化hashslot -> node映射表，同时为每个节点创建一个JedisPool连接池

每次基于JedisCluster执行操作，首先JedisCluster都会在本地计算key的hashslot，然后在本地映射表找到对应的节点

如果那个node正好还是持有那个hashslot，那么就ok; 如果说进行了reshard这样的操作，可能hashslot已经不在那个node上了，就会返回moved

如果JedisCluter API发现对应的节点返回moved，那么利用该节点的元数据，更新本地的hashslot -> node映射表缓存

重复上面几个步骤，直到找到对应的节点，如果重试超过5次，那么就报错，JedisClusterMaxRedirectionException

jedis老版本，可能会出现在集群某个节点故障还没完成自动切换恢复时，频繁更新hash slot，频繁ping节点检查活跃，导致大量网络IO开销

jedis最新版本，对于这些过度的hash slot更新和ping，都进行了优化，避免了类似问题

### 6.2.3 hashslot迁移和ask重定向

如果hash slot正在迁移，那么会返回ask重定向给jedis

jedis接收到ask重定向之后，会重新定位到目标节点去执行，但是因为ask发生在hash slot迁移过程中，所以JedisCluster API收到ask是不会更新hashslot本地缓存

已经可以确定说，hashslot已经迁移完了，moved是会更新本地hashslot->node映射表缓存的

# 7 高可用性与主备切换原理

原理，几乎跟哨兵类似

## 7.1 判断节点宕机

若一个节点认为另外一个节点宕机，即`pfail` - 主观宕机

若多个节点都认为另外一个节点宕机，即`fail` - 客观宕机

跟哨兵的原理几乎一样，sdown - odown

在`cluster-node-timeout`内，某个节点一直没有返回`pong`，那么就被认为`pfail`

若一个节点认为某个节点`pfail`，那么会在`gossip ping`消息中，`ping`给其他节点，若**超过半数**的节点都认为`pfail`，那么就会变成`fail`

## 7.2 从节点过滤

对宕机的master node，从其所有的slave node中，选择一个切换成master node

检查每个slave node与master node断开连接的时间，如果超过了

```
cluster-node-timeout * cluster-slave-validity-factor
```

那么就没有资格切换成master，这个也跟哨兵是一样的，从节点超时过滤的步骤

## 7.3 从节点选举

> 哨兵：对所有从节点进行排序，slave priority，offset，run id

每个从节点，都根据自己对master复制数据的offset，设置一个选举时间，offset越大（复制数据越多）的从节点，选举时间越靠前，优先进行选举

所有的master node开始slave选举投票，给要选举的slave投票，如果大部分

```
master node（N/2 + 1）
```

都投票给了某从节点，那么选举通过，该从节点可以切换成master

从节点执行主备切换，从节点切换为主节点

## 7.4 与哨兵比较

整个流程跟哨兵相比，非常类似，所以说，redis cluster功能强大，直接集成了replication和sentinal的功能

# 参考

《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)
## [Github](https://github.com/Wasabi1234)