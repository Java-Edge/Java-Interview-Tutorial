本章主要讲解Sentinel,介绍这个之前先讲解容错的常见手段,然后快速入门Sentinel
内容主要包括,限流规则,降级规则,集群限流,搭建生产级Sentinel,最后进行Sentinel核心源码分析.

# 1 雪崩效应
系统依赖的某个服务发生延迟或者故障，数秒内导致所有应用资源（线程，队列等）被耗尽，造成所谓的雪崩效应

- cascading failure(级联失效 / 级联故障)
![](https://img-blog.csdnimg.cn/20191027184013646.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 2 常见容错方案
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

# 3 使用Sentinel实现容错
- 何为 Sentinel
![](https://img-blog.csdnimg.cn/20191027203314939.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 整合
- 添加依赖即可
![](https://img-blog.csdnimg.cn/20191027203434412.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 整合成功之后,会暴露actuator/Sentinel端点,所以再添加如下依赖
![](https://img-blog.csdnimg.cn/20191027203620640.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 还需要配置,才能暴露端点(默认是不暴露的)
![](https://img-blog.csdnimg.cn/20191027204104690.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 4 Sentinel控制台
##   搭建Sentinel控制台
- 下载
https://github.com/alibaba/Sentinel/releases

- 这里1.6.2 版本
![](https://img-blog.csdnimg.cn/20191027210347763.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 启动

```bash
java -jar sentinel-dashboard-1.6.2.jar
```

![](https://img-blog.csdnimg.cn/20191027210521186.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 账号密码 : sentinel
![](https://img-blog.csdnimg.cn/20191027210652907.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191027210721443.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- Sentinel是懒加载的,一定时间后
![](https://img-blog.csdnimg.cn/20191027212416647.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 5  流控规则

## 直接
 - 新增规则
![](https://img-blog.csdnimg.cn/20191027214654498.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 关联
当关联的资源达到阈值,就限流自己
![](https://img-blog.csdnimg.cn/20191027215105571.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 链路
只记录指定链路.上的流量

## Warm Up
◆ 根据codeFactor(默认3)的值,从阈值/codeFactor ,经过预热时长,才到达设置的QPS阈值
![](https://img-blog.csdnimg.cn/20191028125726866.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 降级规则
【使用、流程、注意点、源码】
- 注意先把其他规则删除
![](https://img-blog.csdnimg.cn/20191028130730810.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 降级 - RT
![](https://img-blog.csdnimg.cn/20191028130847638.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 降级-RT-注意点
◆ RT默认最大4900ms
● 通过-Dcsp.sentinel.statistic.max.rt=xxx修改

## 异常比例
![](https://img-blog.csdnimg.cn/20191028131126607.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 异常数
![](https://img-blog.csdnimg.cn/20191028131146494.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 注意点
时间窗口 <  60秒可能会出问题

- 相关源码
com.alibaba.csp.sentinel.slots.block.degrade.DegradeRule#passCheck

- 这里与官方文档描述不同,参见issue
https://github.com/alibaba/Sentinel/issues/910

## 降级 - 聊聊断路器三态
◆ Sentinel的断路器没有半开状态
◆ 相关Issue :
https://github.com/alibaba/Sentinel/pull/553#issuecomment-478318196
- pullreq(已关闭)
https://github.com/alibaba/Sentinel/pull/525

 
# 系统规则详解【使用、计算规则、源码】
## 系统-Load
◆ 当系统load1 ( 1分钟的load )超过阈值，且并发线程数超过系统容量时触发,建议设置为CPU核心数* 2.5( 仅对Linux/Unix-like机器生效, Win无效)
![](https://img-blog.csdnimg.cn/20191028132341156.png)

◆ 系统容量 = maxQps * minRt
● maxQps :秒级统计出来的最大QPS
● minRt :秒级统计出来的最小响应时间
● 相关源码:
- com.alibaba.csp.sentinel.slots.system.SystemRuleManager#checkBbr
![](https://img-blog.csdnimg.cn/20191028132957706.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 系统-RT、线程数、入口QPS
◆ RT : 所有入口流量的平均RT达到阈值触发
◆ 线程数:所有入口流量的并发线程数达到阈值触发
◆入口QPS : 所有入口流量的QPS达到阈值触发

## 系统 - 相关源码
- com.alibaba.csp.sentinel.slots.system.SystemRuleManager#checkSystem
![](https://img-blog.csdnimg.cn/20191028133652914.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 授权规则
 ![](https://img-blog.csdnimg.cn/20191028133904543.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 代码配置规则
- 推荐阅读
[Alibaba Sentinel 规则参数总结]( https://www.imooc.com/article/289345)

- ![](https://img-blog.csdnimg.cn/20191028134239414.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
# Sentinel与控制台通信原理剖析
![](https://img-blog.csdnimg.cn/20191030010502538.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 控制台如何获取到微服务的监控信息
- 用控制台配置规则时,控制台是如何将规则发送到各个微服务的呢?

◆ 注册/心跳发送
● com.alibaba.csp.sentinel.transport.heartbeat.SimpleHttpHeartbeatSender

◆通信API
● com.alibaba.csp. sentinel.command.CommandHandler的实现类

# 控制台相关配置项
## 应用端连接控制台配置项
```
spring.cloud.sentinel.transport:
# 指定控制台的地址
dashboard: localhost:8080
# 指定和控制台通信的IP
# 如不配置，会自动选择一个IP注册
client-ip: 127 .0.0.1
# 指定和控制台通信的端口，默认值8719
# 如不设置，会自动从8719开始扫描，依次+1，直到找到未被占用的端口
port: 8719
# 心跳发送周期，默认值null
# 但在SimpleHttpHeartbeatSender会用默认值10秒
heartbeat- interval-ms: 10000
```
## 控制台配置项
![](https://img-blog.csdnimg.cn/20191030012426364.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191030012207545.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# Sentinel API详解
- 修改配置
![](https://img-blog.csdnimg.cn/20191204234318122.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- TestController
![](https://img-blog.csdnimg.cn/20191204234606571.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
核心就是如图示的三个API,不过这样用起来很麻烦,后面就有简单方式哦!

# SentinelResource注解详解
![](https://img-blog.csdnimg.cn/20191205004041892.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
##  @SentinelResource 相关源码
- com.alibaba.csp.sentinel.annotation.aspectj.SentinelResourceAspect
- com.alibaba.csp.sentinel.annotation.aspectj.AbstractSentinelAspectSupport

# RestTemplate整合Sentinel
启动类加上该注解即可
![](https://img-blog.csdnimg.cn/20191205004941700.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

## 开关
resttemplate.sentinel.enabled
## 相关源码
●org. springframework.cloud.alibaba.sentinel.custom.SentinelBeanPostProcessor

# Feign整合Sentinel
![](https://img-blog.csdnimg.cn/20191205010138734.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

## 限流降级发生时,如何定制自己的处理逻辑?
- CC
![](https://img-blog.csdnimg.cn/20191205010629871.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191205010859845.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191205010805676.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

## 如何获取到异常?
## 相关代码
● org.springframework.cloud. alibaba.sentinel.feign.SentinelFeign

# Sentinel使用姿势总结
![](https://img-blog.csdnimg.cn/20191205011050715.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)


# 参考
- [服务容错模式](https://tech.meituan.com/2016/11/11/service-fault-tolerant-pattern.html)