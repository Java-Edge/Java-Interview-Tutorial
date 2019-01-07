# 1 Sentinel是什么
随着微服务的流行，服务和服务之间的稳定性变得越来越重要。Sentinel是面向分布式服务架构的轻量级流量控制框架，主要以流量为切入点，从流量控制、熔断降级、系统负载保护等多个维度来帮助您保护服务的稳定性。

# 2 发展历史
- 2012年，Sentinel诞生，主要功能为入口流量控制
- 2013-2017年，Sentinel 在阿里巴巴集团内部迅速发展，成为基础技术模块，覆盖了所有的核心场景。Sentinel也因此积累了大量的流量归整场景以及生产实践
- 2018年，Sentinel 开源
![](https://img-blog.csdnimg.cn/20200514140734637.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 3 雪崩效应
系统依赖的某个服务发生延迟或者故障，数秒内导致所有应用资源（线程，队列等）被耗尽，造成所谓的雪崩效应

- cascading failure(级联失效 / 级联故障)
![](https://img-blog.csdnimg.cn/20191027184013646.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 4 常见容错方案
## 2.1 超时模式
一种最常见的容错模式
常见的有设置网络连接超时时间，一次RPC的响应超时时间等。
在分布式服务调用的场景中，它主要解决了当依赖服务出现建立网络连接或响应延迟，不用无限等待的问题，调用方可以根据事先设计的超时时间中断调用，及时释放关键资源，如Web容器的连接数，数据库连接数等，避免整个系统资源耗尽出现拒绝对外提供服务这种情况。

### 思想
只要释放够快,我就没那么容易挂了!

## 2.2 限流(Rate Limiting/Load Shedder)
常用于下游服务容量有限，但又怕出现突发流量猛增（如恶意爬虫，节假日大促等）而导致下游服务因压力过大而拒绝服务的场景。常见的限流模式有控制并发和控制速率
- 一个是限制并发的数量
- 一个是限制并发访问的速率。

### 思想
我就一碗饭量,给多了我也不吃!


## 2.3 舱壁隔离(Bulkhead Isolation)
在造船行业，往往使用此类模式对船舱进行隔离，利用舱壁将不同的船舱隔离起来，这样如果一个船舱破了进水，只损失一个船舱，其它船舱可以不受影响，而借鉴造船行业的经验，这种模式也在软件行业得到使用。

线程隔离(Thread Isolation)就是这种模式的常见的一个场景。例如，系统A调用了ServiceB/ServiceC/ServiceD三个远程服务，且部署A的容器一共有120个工作线程，采用线程隔离机制，可以给对ServiceB/ServiceC/ServiceD的调用各分配40个线程。当ServiceB慢了，给ServiceB分配的40个线程因慢而阻塞并最终耗尽，线程隔离可以保证给ServiceC/ServiceD分配的80个线程可以不受影响。如果没有这种隔离机制，当ServiceB慢的时候，120个工作线程会很快全部被对ServiceB的调用吃光，整个系统会全部慢下来，甚至出现系统停止响应的情况。

这种Case在我们实践中经常遇到，如某接口由于数据库慢查询，外部RPC调用超时导致整个系统的线程数过高，连接数耗尽等。我们可以使用舱壁隔离模式，为这种依赖服务调用维护一个小的线程池，当一个依赖服务由于响应慢导致线程池任务满的时候，不会影响到其他依赖服务的调用，它的缺点就是会增加线程数。

### 思想
不把鸡蛋放在一个篮子里!

## 2.4 断路器模式
- 断路器三态转换
![](https://img-blog.csdnimg.cn/20191027202301486.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### 思想
监控 + 开关

# Sentinel VS hystrix

![](https://img-blog.csdnimg.cn/2020122019133277.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
参考
- https://sentinelguard.io/zh-cn/blog/sentinel-vs-hystrix.html