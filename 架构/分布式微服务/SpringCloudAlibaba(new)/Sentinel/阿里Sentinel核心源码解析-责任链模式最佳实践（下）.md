# NodeSelectorSlot
![](https://img-blog.csdnimg.cn/20201217231955500.png)

- NodeSelectorSlot：链中处理的第一个节点
![](https://img-blog.csdnimg.cn/20201218102852488.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
责任链实例和 resource name 相关，和线程无关，所以当处理同一个resource 时，会进入同一 NodeSelectorSlot 实例。
所以该节点代码主要处理：不同的 context name，同一 resource name 的场景。

> 如下它们都处理同一 resource（"getUserInfo"  resource），但它们入口 context 不一。
![](https://img-blog.csdnimg.cn/20201218103149320.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 结合前面的那棵树，可得如下树
![](https://img-blog.csdnimg.cn/20201218103316631.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
清楚 NodeSelectorSlot 实例和 resource 一一对应即可。
# ClusterBuilderSlot
- 主要创建 ClusterNode
![](https://img-blog.csdnimg.cn/20201218131813507.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 该类处理后
![](https://img-blog.csdnimg.cn/20201218134233888.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

每个 resource 对应一个 ClusterNode 实例，若不存在，就创建一个新实例。

## 统计意义
数据统计的。比如 **getUserInfo** 接口，由于从不同的 **context name** 开启调用链，它有多个 DefaultNode 实例，但只有一个 **ClusterNode**，通过该实例，即可知道该接口的 QPS。

此类还处理了 origin 不是默认值场景：
origin 代表调用方标识，如 application-a, application-b。
![](https://img-blog.csdnimg.cn/20201218140509294.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
当设置了 origin，会生成一个 StatisticsNode 实例，挂在 ClusterNode。

改下案例代码
![](https://img-blog.csdnimg.cn/20201218141027627.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
getUserInfo 接收到来自 application-a 和 application-b 两个应用的请求，那么树会变成下面这样：
![](https://img-blog.csdnimg.cn/2020121814121592.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

它的作用是用来统计从 application-a 过来的访问 getUserInfo 这个接口的信息。目前该信息在 dashboard 不展示，毕竟没啥用。

# LogSlot
直接 fire 出去了，即先处理责任链后面的节点，若它们抛 BlockException，才处理。
![](https://img-blog.csdnimg.cn/20201218142029310.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# StatisticSlot

## 作用
数据统计。
## 原理
先 fire，等后面的节点处理完毕后，再进行统计数据。
- 为何这样设计？
因为后面节点是做控制，执行时可能正常通过，也可能抛 BlockException。

- QPS 统计
使用滑动窗口
- 线程并发的统计
使用 LongAdder

接下来几个 Slot 需要通过 dashboard 进行开启，因为需要配置规则。

> 也可以硬编码规则到代码中。但是要调整数值就比较麻烦，每次都要改代码。

# AuthoritySlot
## 作用
权限控制，根据 origin 做黑白名单的控制：

在 dashboard 中，是这么配置的：
![](https://img-blog.csdnimg.cn/20201218233517230.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


这里的调用方就是 origin。

# SystemSlot
## 作用
实现自适应限流。

- 规则校验都在 SystemRuleManager#checkSystem
![](https://img-blog.csdnimg.cn/20201218234439384.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201218235529735.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


我们先说说上面的代码中的 RT、线程数、入口 QPS 这三项系统保护规则。
- dashboard 配置界面
![](https://img-blog.csdnimg.cn/20201218234533159.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- StatisticSlot 类有下面一段
![](https://img-blog.csdnimg.cn/20201218235107434.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
Sentinel 针对所有入口流量，使用了一个全局的 **ENTRY_NODE** 统计，**系统保护规则是全局的，和具体某个资源没有关系**。

由于系统的平均 RT、当前线程数、QPS 都可以从 **ENTRY_NODE** 中获得，所以限制代码非常简单，比较一下大小即可。超过阈值抛 SystemBlockException。

**ENTRY_NODE** 是 **ClusterNode** 类型，而 ClusterNode 对于 rt、qps 都是统计秒维度。

# 系统负载和 CPU 资源

Sentinel 通过调用 MBean 中的方法获取当前的系统负载和 CPU 使用率，Sentinel 起了一个后台线程，每秒查询一次。
![](https://img-blog.csdnimg.cn/20201219000853248.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- dashboard 中对于 CPU 使用率的规则配置
![](https://img-blog.csdnimg.cn/20201219000919830.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# FlowSlot
Sentinel 本身定位就是个流控工具，所以 FlowSlot 非常重要。
这部分代码涉及到限流算法，稍复杂。

![](https://img-blog.csdnimg.cn/20201219001528413.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 案例
设 QPS 为 10，那么每 100ms 允许通过一个，通过计算当前时间是否已经过了上一个请求的通过时间 latestPassedTime 之后的 100 毫秒，来判断是否可以通过。假设才过了 50ms，那么需要当前线程再 sleep 50ms，然后才可以通过。如果同时有另一个请求呢？那需要 sleep 150ms。
# DegradeSlot
它有三个策略，我们首先说说根据 RT 降级：

![](https://img-blog.csdnimg.cn/20201219002815879.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 原理
若按照上面截图所示配置：对 getUserInfo 资源，正常情况下只需 50ms，若它的 RT 超过 100ms，则进入半降级状态，接下来的 5 次访问，如果都超过了 100ms，那么在接下来的 10 秒内，所有的请求都会被拒绝。

## DegradeRule#passCheck

Sentinel 使用了 cut 作为开关，开启这个开关以后，会启动一个定时任务，过了 10秒 以后关闭这个开关。
![](https://img-blog.csdnimg.cn/2020121918562076.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

达到阈值，开启断路器，之后由定时任务关闭。

# 客户端和 dashboard 交互
- sentinel-transport 三个子工程，common 是基础包和接口定义
![](https://img-blog.csdnimg.cn/20201219190232574.png)

若客户端要接入 dashboard，可以使用 netty-http 或 simple-http 中的一个。为何不直接使用 Netty，而要同时提供 http 选项？
因为你不一定使用 Java 来实现 dashboard，如果使用其他语言，使用 http 协议比较容易适配。

下面我们只介绍 http 的使用，首先，添加 simple-http 依赖：

```xml
<dependency>
   <groupId>com.alibaba.csp</groupId>
   <artifactId>sentinel-transport-simple-http</artifactId>
   <version>1.6.3</version>
</dependency>
```

然后在应用启动参数中添加 dashboard 服务器地址，同时可以指定当前应用的名称：

```bash
-Dcsp.sentinel.dashboard.server=127.0.0.1:8080 
	-Dproject.name=sentinel-learning
```

这个时候我们打开 dashboard 是看不到这个应用的，因为没有注册。

当我们在第一次使用 Sentinel 以后，Sentinel 会自动注册。

下面带大家看看过程是怎样的。首先，我们在使用 Sentinel 的时候会调用 SphU#entry：

![](https://img-blog.csdnimg.cn/20201220132611744.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

这里使用了 Env 类，其实就是这个类做的事情：

![](https://img-blog.csdnimg.cn/20201220140314356.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

进到 InitExecutor.doInit 方法：
![](https://img-blog.csdnimg.cn/20201220154010571.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

这里使用 SPI 加载 InitFunc 的实现，加载了 
- CommandCenterInitFunc 类
客户端启动的接口服务，提供给 dashboard 查询数据和规则设置使用
- HeartbeatSenderInitFunc 类
用于客户端主动发送心跳信息给 dashboard

### HeartbeatSenderInitFunc#init
![](https://img-blog.csdnimg.cn/2020122015480555.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201220160224983.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

定时器，以一定的间隔不断发送心跳信息到 dashboard 应用
![](https://img-blog.csdnimg.cn/20201220160058598.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

dashboard 有了这些信息，就可以对应用进行规则设置、到应用拉取数据用于页面展示等。

Sentinel 在客户端并未使用第三方 http 包，而是自己基于 JDK 的 Socket 和 ServerSocket 接口实现了简单的客户端和服务端，主要也是为了不增加依赖。

# Sentinel 中秒级 QPS 的统计问题
Sentinel 统计了 分 和 秒 两个维度数据：
1、对于 分 来说，一轮是 60 秒，分为 60 个时间窗口，每个时间窗口是 1 秒
2、对于 秒 来说，一轮是 1 秒，分为 2 个时间窗口，每个时间窗口是 0.5 秒
如果我们用上面介绍的统计分维度的 BucketLeapArray 来统计秒维度数据可以吗？不行，因为会不准确。

设想一个场景，我们的一个资源，访问的 QPS 稳定是 10，假设请求是均匀分布的，在相对时间 0.0 - 1.0 秒区间，通过了 10 个请求，我们在 1.1 秒的时候，观察到的 QPS 可能只有 5，因为此时第一个时间窗口被重置了，只有第二个时间窗口有值。

所以，我们可以知道，如果用 BucketLeapArray 来实现，会有 0~50% 的数据误差，这肯定是不能接受的。
那能不能增加窗口的数量来降低误差到一个合理的范围内呢？这个大家可以思考一下，考虑一下它对于性能是否有较大的损失。

StatisticNode 源码，对于秒维度数据统计，Sentinel 使用下面的构造方法：
![](https://img-blog.csdnimg.cn/2020122016114349.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

OccupiableBucketLeapArray 的 newEmptyBucket 和 resetWindowTo 这两个方法和 BucketLeapArray 有点不一样，也就是在重置的时候，它不是直接重置成 0。

这个类里面的 borrowArray 做了一些事情，它是 FutureBucketLeapArray 的实例，这个类和前面接触的 BucketLeapArray 差不多，但是加了一个 Future 单词。它和 BucketLeapArray 唯一的不同是，重写了下面这个方法：
![](https://img-blog.csdnimg.cn/20201220161327429.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

若按照这种定义，在调用 values() 方法的时候，所有的 2 个窗口都是过期的，将得不到任何的值。可以判断，给这个数组添加值的时候，使用的时间应该不是当前时间，而是一个未来的时间点。

回到 OccupiableBucketLeapArray 类，重置使用了 borrowArray 的值：
- 当主线到达某个时间窗口的时候，如果发现当前时间窗口是过期的，会重置这个窗口
![](https://img-blog.csdnimg.cn/20201220161908340.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

再看 borrowArray 中的值是怎么进来的。

我们很容易可以找到，只可能通过这里的 addWaiting 方法设置：
![](https://img-blog.csdnimg.cn/2020122016221650.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

接下来，我们找这个方法被哪里调用了，只有 DefaultController 类中有调用。

这个类是流控中的 “快速失败” 规则控制器，我们简单看一下代码：
![](https://img-blog.csdnimg.cn/20201220163406348.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

OccupiableBucketLeapArray
Occupiable 这里代表可以被预占的意思，结合上面 DefaultController 的源码，可以知道它原来是用来满足 prioritized 类型的资源的，我们可以认为这类请求有较高的优先级。如果 QPS 达到阈值，这类资源通常不能用快速失败返回， 而是让它去预占未来的 QPS 容量。
当然，令人失望的是，这里根本没有解开 QPS 是怎么准确计算的这个问题。

### 下面证明 Sentinel 的秒维度的 QPS 统计是不准确的
```java
public static void main(String[] args) {
    // 下面几行代码设置了 QPS 阈值是 100
    FlowRule rule = new FlowRule("test");
    rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
    rule.setCount(100);
    rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_DEFAULT);
    List<FlowRule> list = new ArrayList<>();
    list.add(rule);
    FlowRuleManager.loadRules(list);

    // 先通过一个请求，让 clusterNode 先建立起来
    try (Entry entry = SphU.entry("test")) {
    } catch (BlockException e) {
    }

    // 起一个线程一直打印 qps 数据
    new Thread(new Runnable() {
        @Override
        public void run() {
            while (true) {
                System.out.println(ClusterBuilderSlot.getClusterNode("test").passQps());
            }
        }
    }).start();

    while (true) {
        try (Entry entry = SphU.entry("test")) {
            Thread.sleep(5);
        } catch (BlockException e) {
            // ignore
        } catch (InterruptedException e) {
            // ignore
        }
    }
}
```
然后观察下输出，QPS 数据在 50~100 这个区间一直变化，印证秒级 QPS 统计极度不准确。

参考
- https://www.javadoop.com/post/sentinel