# 0 [Github](https://github.com/Wasabi1234)

# 1 线程池隔离  VS 信号量隔离

Hystrix里面，核心的一项功能，就是**资源隔离**，要解决的最核心的问题，就是**将多个依赖服务的调用分别隔离到各自自己的资源池内**

避免对某一个依赖服务的调用，因为依赖服务的接口调用的延迟或者失败，导致服务所有的线程资源全部耗费在这个服务的接口调用上

一旦某个服务的线程资源全部耗尽，可能就会导致服务崩溃，故障甚至还会蔓延

Hystrix实现资源隔离，两种技术

- 线程池的资源隔离
- 信号量的资源隔离

信号量，semaphore

信号量跟线程池，两种资源隔离的技术，区别到底在哪儿呢？

- 线程池隔离和信号量隔离的原理以及区别
![](https://ask.qcloudimg.com/http-save/1752328/rq31ha62fc.png)

# 2 适用场景

## 2.1 线程池

适合绝大多数的场景，99%的，线程池，对依赖服务的网络请求的调用和访问，timeout这种问题

## 2.2 信号量

适合访问不是对外部依赖的访问，而是对内部的一些比较复杂的业务逻辑的访问，但像这种访问，系统内部的代码，其实不涉及任何的网络请求，那么只要做信号量的普通限流就可

因为不需要去捕获timeout类似的问题，算法+数据结构的效率不是太高，并发量突然太高，因为这里稍微耗时一些，导致很多线程卡在这里的话，不太好，所以进行一个基本的资源隔离和访问，避免内部复杂的低效率的代码，导致大量的线程被hang住

- 信号量的资源隔离与限流的说明
![](https://ask.qcloudimg.com/http-save/1752328/2rbakzj4jz.png)

# 3 实践本地内存获取地理位置数据的逻辑

业务背景里面， 比较适合信号量的是什么场景呢？

比如缓存服务，可能会将部分量特别少，访问又特别频繁的一些数据，放在纯内存

一般我们在获取到商品数据之后，都要去获取商品是属于哪个地理位置，省，市，卖家的

可能在自己的纯内存中，比如就一个Map去获取.对于这种直接访问本地内存的逻辑，比较适合用信号量做一下简单的隔离

优点在于，不用自己管理线程池，不用担心超时，信号量做隔离的话，性能会相对来说高一些

# 4 采用信号量技术对地理位置获取逻辑进行资源隔离与限流

```
super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"))
        .andCommandPropertiesDefaults(HystrixCommandProperties.Setter()
               .withExecutionIsolationStrategy(ExecutionIsolationStrategy.SEMAPHORE)));
```

# 参考

- 《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)

## [Github](https://github.com/Wasabi1234)