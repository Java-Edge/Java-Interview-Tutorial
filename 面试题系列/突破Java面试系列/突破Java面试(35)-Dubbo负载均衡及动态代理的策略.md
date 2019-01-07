# 1 面试题

Dubbo负载均衡策略和集群容错策略都有哪些？动态代理策略呢？

# 2 考点分析

这些都是关于Dubbo必须知道，基本原理，序列化是什么协议，具体用dubbo的时候，如何负载均衡，如何高可用，如何动态代理等.

就是看你对Dubbo掌握程度

- 工作原理：服务注册，注册中心，消费者，代理通信，负载均衡
- 网络通信、序列化：dubbo协议，长连接，NIO，hessian序列化协议
- 负载均衡策略，集群容错策略，动态代理策略：dubbo跑起来的时候一些功能是如何运转的，怎么做负载均衡？怎么做集群容错？怎么生成动态代理？
- dubbo SPI机制：你了解不了解dubbo的SPI机制？如何基于SPI机制对dubbo进行扩展？

# 3 负载均衡策略

![](https://ask.qcloudimg.com/http-save/1752328/nphpq0four.png)

## 3.1 random loadbalance

dubbo默认采用random load balance,即随机调用实现负载均衡，可以对provider不同实例设置不同的权重，会按照权重来负载均衡，权重越大分配流量越高，一般就用默认的即可.

## 3.2 roundrobin loadbalance

均匀地将流量打到各个机器上去，但如果各个机器的性能不一样，容易导致性能差的机器负载过高。所以此时需要调整权重，让性能差的机器承载权重小一些，流量少一些。

## 3.3  leastactive loadbalance

自动感知一下，如果某个机器性能越差，那么接收的请求越少，越不活跃，此时就会给不活跃的性能差的机器更少的请求

## 3.4 consistanthash loadbalance

一致性Hash算法，相同参数的请求一定分发到一个provider上去，provider挂掉的时候，会基于虚拟节点均匀分配剩余的流量，抖动不会太大

如果你需要的不是随机负载均衡，是要一类请求都到一个节点，那就走这个一致性hash策略。

# 4 集群容错策略

## 4.1 failover cluster模式

默认,失败自动切换，自动重试其他机器,常用于读操作

## 4.2 failfast cluster模式

一次调用失败就立即失败，常用于写操作

## 4.3 failsafe cluster模式

发生异常时忽略掉，常用于不重要的接口调用，如记录日志

## 4.4 failbackc cluster模式

失败了后台自动记录请求，然后定时重发，适于写消息队列

## 4.5 forking cluster

**并行调用**多个provider，只要一个成功就立即返回

## 4.6 broadcacst cluster

逐个调用所有的provider

# 5 动态代理策略

默认使用javassist动态字节码生成，创建代理类

但是可以通过spi扩展机制配置自己的动态代理策略

# 参考

《Java工程师面试突击第1季-中华石杉老师》


# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)

## [Github](https://github.com/Wasabi1234)