# 01-Redis和ZK分布式锁优缺点对比以及生产环境使用建议
## Redis 和 ZooKeeper 分布式锁优缺点对比以及生产环境使用建议

![image-20240303203549300](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240303203549300.png)

在分布式环境中，需要保证共享资源安全的话，一般是需要使用到分布式锁的，那么常用的分布式锁有基于 Redis 实现的，也就基于 ZooKeeper 来实现的

这里说一下这两种分布式锁有什么区别，以及如何进行技术选型

- **Redis 实现的分布式锁** 

Redis 实现的分布式锁的话，**不能够 100% 保证可用性** ，因为在真实环境中使用分布式锁，一般都会**集群部署 Redis** ，来避免单点问题，那么 Redisson 去 Redis 集群上锁的话，先将锁信息写入到主节点中，如果锁信息还没来得及同步到从节点中，主节点就宕机了，**就会导致这个锁信息丢失** 

并且在分布式环境下可能各个机器的时间不同步，都会导致加锁时出现一系列无法预知的问题

![image-20240303200241876](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240303200241876.png)

因此 **RedLock** 被 Redis 作者提出用于保证在集群模式下加锁的可靠性，就是去多个 Redis 节点上都尝试加锁，超过一半节点加锁成功，并且加锁后的时间要保证没有超过锁的过期时间，才算加锁成功，具体的流程比较复杂，并且性能较差，了解一下即可

所以说呢，在分布式环境下，使用 Redis 做分布式锁的话，或多或少都可能会产生一些未知的问题，并且 Redis 本质上来说也不是做分布式协调的，他只是作为一个分布式缓存解决方案存在

![image-20240303201127563](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240303201127563.png)

如果业务不追求非常高的可靠性，可以选用 Redisson 分布式锁



- **ZooKeeper 实现的分布式锁** 

ZooKeeper 的分布式锁的特点就是：**稳定、健壮、可用性强** 

这得益于 ZooKeeper 这个框架本身的定位就是用来做 **分布式协调** 的，因此在需要保证可靠性的场景下使用 ZooKeeper 做分布式锁是比较好的

![image-20240303201120059](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240303201120059.png)

ZooKeeper 的分布式锁是 `基于临时节点` 来做的，多个客户端去创建临时同一个节点，第一个创建客户端抢锁成功，释放锁时只需要删除临时节点即可

因此 ZooKeeper 的分布式锁适用于 **对可靠性要求较高** 的业务场景，这里是相对于 Redis 分布式锁来说相对 **更见健壮** 一些



并且 ZooKeeper 的分布式锁在 **极端情况下也会存在不安全的问题** ，也不能保证绝对的可靠性：

如果加锁的客户端长时间 GC 导致无法与 ZooKeeper 维持心跳，那么 ZK 就会认为这个客户端已经挂了，于是将该客户端创建的临时节点删除，那么当这个客户端 GC 完成之后还以为自己持有锁，但是它的锁其实已经没有了，因此也会存在不安全的问题





- **真实项目实际使用建议**

这里最后再说一下真实项目中使用如何进行选型，其实两种锁使用哪一个都可以，主要看公司技术栈如何以及架构师对两种锁的看法：

具体选用哪一种分布式锁的话，可以根据需要使用的功能和已经引入的技术栈来进行选择，比如恰好已经引入了 ZK 依赖，就可以使用 ZK 的分布式锁

其实这两种锁在真正的项目中使用的都是比较多的

而且要注意的是无论是使用 Redis 分布式锁还是 ZK 分布式锁其实在极端情况下都会出现问题，都不可以保证 100% 的安全性，**不过 ZK 锁在健壮性上还是强于 Redis 锁的** 

可以通过分布式锁在上层互斥掉大量的请求，如果真有个别请求出现锁失效，可以在底层资源层做一些互斥保护，作为一个兜底

**因此如果是对可靠性要求非常高的应用，不可以把线程安全的问题全部寄托于分布式锁，而是要在资源层也做一些保护，来保证数据真正的安全**



而 Redis 中的 RedLock 尽量不使用，因为它为了保证加锁的安全牺牲掉了很多的性能，并且部署成本高（至少部署 5 个 Redis 的主库），使用 Redis 分布式锁建议通过【主从 + 哨兵】部署集群，使用它的分布式锁



![image-20240303202039261](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240303202039261.png)



最后再说一下关于技术选型的东西，如果进行技术选型的话，如果不是必须引入的话，就不要引入，在进行技术选型的时候，一定要思考确保引入之后利大于弊，因为引入的技术越多，整个系统越复杂，故障的几率就越高，比如如果只是使用到简单的发布订阅功能，也不要求非常高的可靠性，那可能就没有必要进入 RocketMQ

对于项目中使用的任何第三方组件，都是有可能出现故障的，所以在进行技术选型的时候，一定要考虑清楚引入之后带来的技术负担

