# 1 Redis Sentinel的意义
- master宕机了咋整？等运维手工从主切换，再通知所有程序把地址统统改一遍重新上线？那么服务就会停滞很久，显然对于大型系统这是灾难性的！
所以必须有高可用方案，当故障发生时可自动从主切换，程序也不用重启，不必手动运维。Redis 官方就提供了这样一种方案 —— Redis Sentinel(哨兵)。

sentinal，哨兵，redis集群架构中非常重要的一个组件，主要功能如下
- 集群监控
监控Redis master和slave进程的正常工作
- 消息通知
如果某个Redis实例有故障，那么哨兵负责发送报警消息给管理员
- 故障转移
若master node宕机，会自动转移到slave node上
- 配置中心
若发生故障转移，通知client客户端新的master地址

哨兵本身也是分布式，作为一个集群运行：
- 故障转移时，判断一个master node是否宕机，需要大部分哨兵都同意，涉及分布式选举
- 即使部分哨兵节点宕机，哨兵集群还是能正常工作

> 目前采用的是sentinal 2版本，sentinal 2相对于sentinal 1来说，重写了很多代码，主要是让故障转移的机制和算法变得更加健壮和简单

哨兵 + Redis主从的部署架构不保证数据零丢失，只保证redis集群的高可用性。

# 为何2个节点无法正常工作
必须部署2个以上的节点。若仅部署2个实例，quorum=1
```
+----+         +----+
| M1 |---------| R1 |
| S1 |         | S2 |
+----+         +----+
```
Configuration: `quorum = 1`

master宕机，s1和s2中只要有1个哨兵认为master宕机就可以进行切换，同时会在s1和s2中选举出一个执行故障转移.
但此时，需要majority，也就是大多数哨兵都是运行的，2个哨兵的majority就是2

> 2个哨兵的majority=2
> 3个哨兵的majority=2
> 4个哨兵的majority=2
> 5个哨兵的majority=3

2个哨兵都运行着，就可以允许执行故障转移

若整个M1和S1运行的机器宕机了，那么哨兵仅剩1个，此时就无majority来允许执行故障转移，虽然另外一台机器还有一个R1，但故障转移不会执行

# 3节点哨兵集群
```
       +----+
       | M1 |
       | S1 |
       +----+
          |
+----+    |    +----+
| R2 |----+----| R3 |
| S2 |         | S3 |
+----+         +----+
```
Configuration: quorum = 2，majority

若M1节点宕机了，还剩下2个哨兵，S2和S3可以一致认为master宕机了，然后选举出一个来执行故障转移

同时3个哨兵的`majority`是2，所以余存的2个哨兵运行着，就可执行故障转移



# 2 Redis Sentinel 架构
## Redis Sentinel故障转移
1. 多个sentinel发现并确认master有问题。
2. 选举出一个sentinel作为领导。
3. 选出一个slave作为master.
4. 通知其余slave成为新的master的slave.
5. 通知客户端主从变化
6. 等待老的master复活成为新master的slave
![](https://img-blog.csdnimg.cn/20210420141013774.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


- 可监控多套
![](https://img-blog.csdnimg.cn/2021042014284067.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 3 安装与配置
1. 配置开启主从节点
2. 配置开启sentinel监控主节点。(sentinel是特殊的redis)
3. 实际应该多机器
4. 详细配置节点

![](https://img-blog.csdnimg.cn/20210420143559745.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210420143538431.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


Redis 主节点

```bash
[启动]
redis-server redis- 7000.conf

[配置]
port 7000
daemonize yes
pidfile /var/run/redis-7000.pid
logfile "7000.log"
dir "/opt/soft/redis/data/"
```

Redis 从节点
```bash
[启动]
redis-server redis-7001.conf
redis-server redis-7002.conf

slave-1[配置]

port 7001
daemonize yes
pidfile /var/run/redis-7001.pid
logfile "7001.log"
dir "/opt/soft/redis/data/"
slaveof 127.0.0.1 7000

slave-2[配置]
port 7002
daemonize yes
pidfile /var/run/redis-7002.pid
logfile "7002.log"
dir "/opt/soft/redis/data/"
slaveof 127.0.0.1 7000
```

Sentinel 主要配置

```bash
port $(port)
dir "/opt/soft/redis/data/"
logfile " $(port).log"
sentinel monitor mymaster 127.0.0.1 7000 2
sentinel down-after-milliseconds mymaster 30000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 180000
```

## 演示
![](https://img-service.csdnimg.cn/img_convert/407d586e9e68f5ab618429f486f47b77.png)
- 主节点配置![](https://img-service.csdnimg.cn/img_convert/e0ccc6ea9b2d8cfac7e5c18188bff594.png)
![](https://img-blog.csdnimg.cn/20210206170428942.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 重定向![](https://img-service.csdnimg.cn/img_convert/14364230c56b886b6beadc566d2b13a7.png)
- 打印检查配置文件![](https://img-service.csdnimg.cn/img_convert/91ea7d183e7b6432231735be89605743.png)
- 启动
![](https://img-blog.csdnimg.cn/20210206170745522.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

# 4 客户端
- 客户端实现基本原理-1
![](https://img-service.csdnimg.cn/img_convert/577082c68e80768c379c3e6a27ed6139.png)
- 客户端实现基本原理-2
![](https://img-service.csdnimg.cn/img_convert/36a24d0612871f9201a1336d410e4ec5.png)

- 客户端实现基本原理-3 验证![](https://img-service.csdnimg.cn/img_convert/a920bd693c109e0613fef5c5fbb81c91.png)
- 客户端实现基本原理-4 通知(发布订阅))
![](https://img-service.csdnimg.cn/img_convert/a24f586a657f8dfadfa32da4de87d319.png)
![](https://img-blog.csdnimg.cn/20210420162740248.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 客户端接入流程
1. Sentinel地址集合
2. masterName
3. 不是代理模式

```java
JedisSentinelPool sentinelPool = new JedisSentinelPool(masterName, sentinelSet, poolConfig, timeout);

Jedis jedis = null;
try {
	jedis = redisSentinelPool.getResource();
	//jedis command
} catch (Exception e) {
	logger.error(e.getMessage(), e);
} finally {
	if (jedis != null)
		jedis.close();
}
```

# 5 定时任务
1. 每10s 每个 sentinel 对 master 和 replica 执行 INFO 命令
- 发现 replica  节点
- 确认主从关系
![](https://img-blog.csdnimg.cn/20210419164949341.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

2. 每 2s 每个 sentinel 通过 master 节点的channel交换信息(pub/sub)
- 通过 _sentinel_ :java频道交互
- 交互对节点的"看法”和自身信息
![](https://img-blog.csdnimg.cn/20210420153539965.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


3. 每 1s 每个 sentinel 对其他 sentinel 和 redis 执行ping
- 心跳检测，失败判定依据
![](https://img-blog.csdnimg.cn/2021042015015784.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 6 主观下线和客观下线
## 主观下线(Subjectively Down,SDOWN)
`单个` Sentinel 节点对服务器做出的下线判断，即单个 Sentinel 认为某个服务下线（有可能是接收不到订阅，之间的网络不通等一系列原因）。

注意主观下线是每个sentinel节点对Redis节点失败的"**偏见**”。所以还需要客观下线机制。
## 客观下线(Objectively Down,ODOWN) 
`多个` Sentinel 实例在对同一个服务器做出 SDOWN 判断，并且通过命令互相交流之后，得出的服务器下线判断，然后开启 failover。

只有在足够数量( 超过quorum个)的 Sentinel 都将一个服务器标记为主观下线之后， 服务器才会被标记为客观下线（ODOWN）。只有当 Master 被认定为客观下线时，才会发生故障迁移。

## 仲裁
仲裁指配置文件中的 `quorum` 参数。某个 Sentinel 先将 Master 节点标记为主观下线，然后会将这个判定通过 `sentinel is-master-down-by-addr` 命令询问其他 Sentinel 节点是否也同样认为该 addr 的 Master 节点要做主观下线。
![](https://img-blog.csdnimg.cn/20210420160002275.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

```bash
sentinel monitor <masterName> <ip> < port> <quorum>
sentinel monitor myMaster 127.0.0.1 6379 2
# 
sentinel down-after-milliseconds < masterName> < timeout>
sentinel down-after-milliseconds mymaster 30000
```
最后当达成这一共识的 Sentinel 个数达到前面说的 quorum 设置的值时，该 Master 节点会被认定为客观下线并进行故障转移。
`quorum` 值一般设为 Sentinel 个数的二分之一加 1，例如 3 个 Sentinel 就设为 2。

综上可得
## 哨兵工作原理
1. 每个 Sentinel 以 1次/s 向它所知的 Master，Slave 以及其他 Sentinel 节点发送一个 PING
2. 若一个实例距离最后一次有效回复 PING 的时间超过配置文件 `down-after-milliseconds`，则该实例会被 Sentinel 标记为 **主观下线**
3. 若一个 Master 被标记为主观下线，那么正在监视这个 Master 的所有 Sentinel 要以 1次/s 确认 Master 是否真的进入主观下线状态
4. 当有足够数量 Sentinel（大于等于配置文件指定的值）在指定时间范围内确认 Master 的确进入主观下线状态，则 Master 会被标记为 **客观下线**
5. 若 Master 处于 ODOWN 状态，则投票自动选出新Master。将剩余从节点指向新Master继续数据复制
6. 在正常情况下，每个 Sentinel 会以每 10 秒一次的频率向它已知的所有 Master，Slave 发送 INFO 命令；当 Master 被 Sentinel 标记为客观下线时，Sentinel 向已下线的 Master 的所有 Slave 发送 INFO 命令的频率会从 10 秒一次改为每秒一次；
7. 若没有足够数量 Sentinel 同意 Master 已经下线，Master 的**客观下线**状态会被移除。若 Master 重新向 Sentinel 的 PING 命令返回有效回复，Master 的主观下线状态就会被移除。

# 7 领导者选举
原因：只有一个sentinel节点完成故障转移。
选举：通过sentinel is-master-down-by-addr命令都希望成为领导者：
1. 每个做主观下线的Sentinel节点向其他Sentinel节点发送命令，要求将它设置为领导者
2. 收到命令的Sentinel节点如果没有同意通过其他Sentinel节点发送的命令，那么将同意该请求，否则拒绝
3. 如果该Sentinel节点发现自己的票数已经超过Sentinel集合半数且超过quorum，则将成为领导者
4. 如果此过程有多个Sentinel节点成为了领导者，那么将等待一段时间重新选举

- 选举实例
![](https://img-service.csdnimg.cn/img_convert/780616dab829e1a2bcc249be5fe34ea1.png)
# 8 故障转移
### 领导者节点完成
1. 从slave节点中选出一个“合适的"节点作为新的master节点
2. 对上面的slave节点执行slaveof no one命令让其成为master节点
3. 向剩余slave节点发送命令，让它们成为新master节点的slave节点，复制规则和parallel-syncs参数有关
4. 更新对原来master节点配置为slave，并保持着对其关注，当其恢复后命令它去复制新的master节点。

### 选择合适的slave节点
1. 选择slave priority(slave节点优先级)最高的slave节点，如果存在划返同，不存在则继续。
2. 选择复制偏移量最大的slave节点(复制的最完整)，若存在则返回，不存在则
继续。
3. 选择runId最小的slave节点。

# 常见开发运维问题
## 节点运维
- 机器下线:例如过保等情况
- 机器性能不足:例如CPU、内存、硬盘、网络等
- 节点自身故障:例如服务不稳定等


主节点
`sentinel failover <masterName>`
![](https://img-blog.csdnimg.cn/20200910035357117.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

节点下线
- 从节点:临时下线还是永久下线,例如是否做一些清理工作。但是要考虑读写分离的情况。
- Sentinel节点: 同上。

节点上线
- 主节点: sentinel failover进行替换
- 从节点: slaveof即可, sentinel节点可以感知
- sentinel节点:参考其他sentinel节点启动即可。

从节点的作用
1. 副本：高可用基础
2. 拓展读能力
![](https://img-blog.csdnimg.cn/20200909232846263.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

由于Redis Sentinel只会对主节点进行故障转移,对从节点采取主观的下线,所以需要自定义一个客户端来监控对应的事件

三个消息
- +switch-master :切换主节点(从节点晋升主节点)
- +convert-to-slave :切换从节点(原主节点降为从节点)
- +sdown:主观下线。

# 总结
- Redis Sentinel是Redis的高可用实现方案：
故障发现、故障自动转移、配置中心、客户端通知。

- Redis Sentinel从2.8版本开始才正式生产可用
- 尽可能在不同物理机上部署Redis Sentinel的所有节点
- Redis Sentinel中的Sentinel节点个数应该≥3，且最好为奇数，便于选举
- Redis Sentinel中的数据节点与普通数据节点无差异
- 客户端初始化时连接的是Sentinel节点集合，不再是具体的Redis节点，但
Sentinel只是配置中心，并非代理
- Redis Sentinel通过三个定时任务实现了Sentinel节点对于主节点、从节点、
其余Sentinel节点的监控
- Redis Sentinel在对节点做失败判定时分为主观下线和客观下线
- 看懂Redis Sentinel故障转移日志对于Redis Sentinel以及问题排查非常有帮助
- Redis Sentinel实现读写分离高可用可以依赖Sentinel节点的消息通知,获取Redis数据节点的状态变化

参考
- https://hellokangning.github.io/zh/post/redis-sentinel-client-connection/