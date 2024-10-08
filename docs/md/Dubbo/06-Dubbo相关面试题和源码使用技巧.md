# 06-Dubbo相关面试题和源码使用技巧



## Dubbo 相关面试题

### ZooKeeper 宕机后，Dubbo 服务还能使用吗？

在实际生产中，假如 ZooKeeper 注册中心宕掉，一段时间内服务消费方还是能够调用提供方的服务的，实际上它使用的本地缓存进行通讯，通过本地缓存可以拿到提供者的地址信息，仍然可以通信，这只是 Dubbo 健壮性的一种体现。

注册中心负责服务地址的注册与查找，相当于目录服务，服务提供者和消费者只在启动时与注册中心交互，注册中心不转发请求，压力较小。所以，我们可以完全可以绕过注册中心——采用 **dubbo 直连** ，即在服务消费方配置服务提供方的位置信息。



### Dubbo 怎么实现动态感知服务下线？

一般来说，服务订阅有两种方式：

- Pull 模式：客户端定时去注册中心中拉去最新配置
- Push 模式：注册中心主动将配置推送给客户端

Dubbo 动态感知服务下线使用了 ZooKeeper 中的节点监听机制，流程如下：

1、消费者在第一次订阅时，会去 ZooKeeper 对应节点下全量拉取所有的服务数据，并且在订阅的节点注册一个 `Watcher` 

2、一旦节点下发生数据变化，ZooKeeper 将会发送事件通知给客户端

3、客户端收到通知后，会重新去拉去最新数据，并且重新注册 Watcher



ZooKeeper 提供了 `心跳检测` 功能，它会定时向各个服务提供者发送一个请求，如果长期没有响应，服务中心就 `认为该服务提供者已经挂了` ，并将其剔除



### Dubbo 的负载均衡策略

- 随机（默认策略）：根据权重随机调用

- 轮询：一个一个调用，不建议使用
  - 如果其中有一台机器处理请求的速度比较慢，那么当一个请求被转发到很慢的机器上之后，很久都没有处理完，会导致其他请求也会被转发到这个机器上，导致该机器上堆积很多请求，更加处理不过来了
- 最少活跃数：根据机器上活跃的请求数分配请求，Dubbo 认为活跃请求数少的机器，性能就高
- 一致性 Hash：相同参数的请求会发送给同一台机器



### Dubbo 容错策略

Dubbo 作为 RPC 框架，**容错也算是其中比较核心的功能了** 

在网络通信中有很多不确定的因素，比如网络延迟、网络中断等，此类情况出现的话会造成当前这次请求出现失败。当服务通信出现这类问题时，需要采取一定措施来应对
Dubbo 提供了 `容错机制` 来处理这类错误

在集群调用失败时，Dubbo 提供了多种容错方案（默认方案是Failover 重试）：

1、**Failover Cluster** ：这是 `默认的容错模式` ，当调用服务时失败，会自动切换到其他服务器进行重试，重试会带来更长的延迟并且会对下游服务造成更大的压力，可以通过配置 `retries="2"`来调整重试次数（不包含第一次），**这种机制通常用于读操作** （相关代码在 `FailoverClusterInvoker # invoke()` ）

2、**Failfast Cluster** ：快速失败，只发起一次调用，如果调用服务失败立即报错。**通常用于非幂等性的 `写操作` 以及 `事务` ，例如新增记录等** 

3、**Failsafe Cluster** ：失败安全，当消费者调用服务出现异常时，直接忽略异常。**这种模式通常用于写入审计日志等操作** 

4、**Failback Cluster** ：失败自动恢复，当调用服务失败，后台记录失败请求并定时重发。**通常用于消息通知操作** 

5、**Forking Cluster** ：并行调用多个服务器，只要一个成功就返回，**通常用于实时性要求较高的操作** ，但比较浪费服务资源，通过 forks="2" 设置最大并行数

6、**Broadcast Cluster** ：广播调用所有提供者，逐个调用，任意一台报错则就算调用失败，**通常用于通知所有提供者更新缓存等本地资源** 



上边六种容错策略不用全部记住，前两种比较重要着重记一下，其余的可以从设计的思路来理解

像接口调用失败，无非就是重试，或者直接返回失败，或者将错误给记录下来，可能只是当前网络不稳定而已，再定一个新的时间重新发送调用请求

## Dubbo 源码中的一些小技巧

### 快速判断端口是否被占用

Dubbo 在暴露应用元数据服务的时候，有可能服务默认端口会被占用，那么就需要判断默认端口是否被占用，如果被占用了就换一个端口

那么判断端口占用其实就是在这个端口上创建一个 Socket 连接，如果失败抛出异常了，说明这个端口被占用：

```java
int port = 20880;
while (true) {
    try (ServerSocket isBusy = new ServerSocket(port)) {
        // ...
    } catch (IOException e) {
        // 抛出异常说明端口被占用，再试试下一个端口
        port += 1;
        continue;
    }
}
```





### transient 关键字使用

Dubbo 中服务暴露的时候需要向注册中心放一些信息，通过 Netty 将数据信息传输到注册中心进行注册

在 Java 中一般是使用一个类来存放这些信息的，但是有些字段只是在 Dubbo 内部使用，而不需要放到注册中心中去，这时可以使用 transient 关键里来不对这些字段进行序列化

要将数据传给注册中心都是需要对数据进行序列化的，我们就可以在序列化的时候通过 transient 关键字跳过那些不需要注册的数据

```java
public class User {
    private String name;
    // 不对 password 进行序列化
    private transient String password;
}
```



因此也就不会通过 Netty 传输到注册中心了

