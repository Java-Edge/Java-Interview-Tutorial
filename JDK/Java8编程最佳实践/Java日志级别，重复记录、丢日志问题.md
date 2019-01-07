# 1 SLF4J
## 日志行业的现状
- 框架繁
不同类库可能使用不同日志框架，兼容难，无法接入统一日志，让运维很头疼！
- 配置复杂
由于配置文件一般是 xml 文件，内容繁杂！很多人喜欢从其他项目或网上闭眼copy！
- 随意度高
因为不会直接导致代码 bug，测试人员也难发现问题，开发就没仔细考虑日志内容获取的性能开销，随意选用日志级别！

Logback、Log4j、Log4j2、commons-logging及java.util.logging等，都是Java体系的日志框架。
不同的类库，还可能选择使用不同的日志框架，导致日志统一管理困难。

- SLF4J（Simple Logging Facade For Java）就为解决该问题而生
![](https://img-blog.csdnimg.cn/20201205201659631.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

- 提供统一的日志门面API
图中紫色部分，实现中立的日志记录API
- 桥接功能
蓝色部分，把各种日志框架API桥接到SLF4J API。这样即使你的程序使用了各种日志API记录日志，最终都可桥接到SLF4J门面API
- 适配功能
红色部分，绑定SLF4J API和实际的日志框架（灰色部分）

SLF4J只是日志标准，还是需要实际日志框架。日志框架本身未实现SLF4J API，所以需要有个前置转换。
Logback本身就按SLF4J API标准实现，所以无需绑定模块做转换。

虽然可用`log4j-over-slf4j`实现Log4j桥接到SLF4J，也可使用`slf4j-log4j12`实现SLF4J适配到Log4j，也把它们画到了一列，但是它不能同时使用它们，否则就会产生死循环。jcl和jul同理。

虽然图中有4个灰色的日志实现框架，但业务开发使用最多的还是Logback和Log4j，都是同一人开发的。Logback可认为是Log4j改进版，更推荐使用，已是社会主流。

Spring Boot的日志框架也是Logback。那为什么我们没有手动引入Logback包，就可直接使用Logback？

spring-boot-starter模块依赖**spring-boot-starter-logging**模块，而
**spring-boot-starter-logging**自动引入**logback-classic**（包含SLF4J和Logback日志框架）和SLF4J的一些适配器。
# 2 异步日志就肯定能提高性能?
如何避免日志记录成为系统性能瓶颈呢？
这关系到磁盘（比如机械磁盘）IO性能较差、日志量又很大的情况下，如何记录日志。

## 2.1 案例
定义如下的日志配置，一共有两个Appender：
- **FILE**是一个FileAppender，用于记录所有的日志
- **CONSOLE**是一个ConsoleAppender，用于记录带有time标记的日志
![](https://img-blog.csdnimg.cn/20201205223014732.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

把大量日志输出到文件中，日志文件会非常大，若性能测试结果也混在其中，就很难找到那条日志了。
所以，这里使用EvaluatorFilter对日志按照标记进行过滤，并将过滤出的日志单独输出到控制台。该案例中给输出测试结果的那条日志上做了time标记。

> **配合使用标记和EvaluatorFilter，可实现日志的按标签过滤**。

- 测试代码：实现记录指定次数的大日志，每条日志包含1MB字节的模拟数据，最后记录一条以time为标记的方法执行耗时日志：![](https://img-blog.csdnimg.cn/20201205223508352.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

执行程序后发现，记录1000次日志和10000次日志的调用耗时，分别是5.1s和39s
![](https://img-blog.csdnimg.cn/2020120522373754.png)![](https://img-blog.csdnimg.cn/20201205224030888.png)
对只记录文件日志的代码，这耗时过长了。
## 2.2 源码解析
FileAppender继承自OutputStreamAppender
![](https://img-blog.csdnimg.cn/20201205224309140.png)
在追加日志时，是直接把日志写入OutputStream中，属**同步记录日志**
![](https://img-blog.csdnimg.cn/20201206132744194.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
所以日志大量写入才会旷日持久。如何才能实现大量日志写入时，不会过多影响业务逻辑执行耗时而影响吞吐量呢？
## 2.3 AsyncAppender
使用Logback的**AsyncAppender**，即可实现异步日志记录。

**AsyncAppender**类似装饰模式，在不改变类原有基本功能情况下，为其增添新功能。这便可把**AsyncAppender**附加在其他**Appender**，将其变为异步。

定义一个异步Appender ASYNCFILE，包装之前的同步文件日志记录的FileAppender， 即可实现异步记录日志到文件
![](https://img-blog.csdnimg.cn/20201206133807409.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

- 记录1000次日志和10000次日志的调用耗时，分别是537ms和1019ms
![](https://img-blog.csdnimg.cn/20201206133959275.png)![](https://img-blog.csdnimg.cn/2020120613391870.png)
异步日志真的如此高性能？并不，因为它并没有记录下所有日志。
# 3 AsyncAppender异步日志的天坑
- 记录异步日志撑爆内存
- 记录异步日志出现日志丢失
- 记录异步日志出现阻塞。

##  3.1 案例
模拟个慢日志记录场景：
首先，自定义一个继承自**ConsoleAppender**的**MySlowAppender**，作为记录到控制台的输出器，写入日志时睡1s。
![](https://img-blog.csdnimg.cn/20201206134635409.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

- 配置文件中使用**AsyncAppender**，将**MySlowAppender**包装为异步日志记录
![](https://img-blog.csdnimg.cn/20201206141303471.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

- 测试代码
![](https://img-blog.csdnimg.cn/20201206135344681.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

- 耗时很短但出现日志丢失：要记录1000条日志，最终控制台只能搜索到215条日志，而且日志行号变问号。
![](https://img-blog.csdnimg.cn/20201206141514155.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- 原因分析
**AsyncAppender**提供了一些配置参数，而当前没用对。

### 源码解析
- includeCallerData
默认false：方法行号、方法名等信息不显示
- queueSize
控制阻塞队列大小，使用的ArrayBlockingQueue阻塞队列，默认容量256：内存中最多保存256条日志
- discardingThreshold
丢弃日志的阈值，为防止队列满后发生阻塞。默认`队列剩余容量 ＜ 队列长度的20%`，就会丢弃TRACE、DEBUG和INFO级日志
- neverBlock
控制队列满时，加入的数据是否直接丢弃，不会阻塞等待，默认是false
	- 队列满时：offer不阻塞，而put会阻塞
	- neverBlock为true时，使用offer
```java
public class AsyncAppender extends AsyncAppenderBase<ILoggingEvent> {
	// 是否收集调用方数据
    boolean includeCallerData = false;
    protected boolean isDiscardable(ILoggingEvent event) {
        Level level = event.getLevel();
        // 丢弃 ≤ INFO级日志
        return level.toInt() <= Level.INFO_INT;
    }
    protected void preprocess(ILoggingEvent eventObject) {
        eventObject.prepareForDeferredProcessing();
        if (includeCallerData)
            eventObject.getCallerData();
    }
}
public class AsyncAppenderBase<E> extends UnsynchronizedAppenderBase<E> implements AppenderAttachable<E> {

	// 阻塞队列：实现异步日志的核心
    BlockingQueue<E> blockingQueue;
    // 默认队列大小
    public static final int DEFAULT_QUEUE_SIZE = 256;
    int queueSize = DEFAULT_QUEUE_SIZE;
    static final int UNDEFINED = -1;
    int discardingThreshold = UNDEFINED;
    // 当队列满时：加入数据时是否直接丢弃，不会阻塞等待
    boolean neverBlock = false;

    @Override
    public void start() {
       	...
        blockingQueue = new ArrayBlockingQueue<E>(queueSize);
        if (discardingThreshold == UNDEFINED)
        //默认丢弃阈值是队列剩余量低于队列长度的20%，参见isQueueBelowDiscardingThreshold方法
            discardingThreshold = queueSize / 5;
        ...
    }

    @Override
    protected void append(E eventObject) {
        if (isQueueBelowDiscardingThreshold() && isDiscardable(eventObject)) { //判断是否可以丢数据
            return;
        }
        preprocess(eventObject);
        put(eventObject);
    }

    private boolean isQueueBelowDiscardingThreshold() {
        return (blockingQueue.remainingCapacity() < discardingThreshold);
    }

    private void put(E eventObject) {
        if (neverBlock) { //根据neverBlock决定使用不阻塞的offer还是阻塞的put方法
            blockingQueue.offer(eventObject);
        } else {
            putUninterruptibly(eventObject);
        }
    }
    //以阻塞方式添加数据到队列
    private void putUninterruptibly(E eventObject) {
        boolean interrupted = false;
        try {
            while (true) {
                try {
                    blockingQueue.put(eventObject);
                    break;
                } catch (InterruptedException e) {
                    interrupted = true;
                }
            }
        } finally {
            if (interrupted) {
                Thread.currentThread().interrupt();
            }
        }
    }
}  
```

默认队列大小256，达到80%后开始丢弃<=INFO级日志后，即可理解日志中为什么只有两百多条INFO日志了。
### queueSize 过大
可能导致**OOM**
### queueSize 较小
默认值256就已经算很小了，且**discardingThreshold**设置为大于0（或为默认值），队列剩余容量少于**discardingThreshold**的配置就会丢弃<=INFO日志。这里的坑点有两个：
1. 因为**discardingThreshold**，所以设置**queueSize**时容易踩坑。
比如本案例最大日志并发1000，即便置**queueSize**为1000，同样会导致日志丢失
2. **discardingThreshold**参数容易有歧义，它`不是百分比，而是日志条数`。对于总容量10000队列，若希望队列剩余容量少于1000时丢弃，需配置为1000
### neverBlock 默认false
意味总可能会出现阻塞。
- 若**discardingThreshold = 0**，那么队列满时再有日志写入就会阻塞
- 若**discardingThreshold != 0**，也只丢弃≤INFO级日志，出现大量错误日志时，还是会阻塞

queueSize、discardingThreshold和neverBlock三参密不可分，务必按业务需求设置：
- 若优先绝对性能，设置`neverBlock = true`，永不阻塞
- 若优先绝不丢数据，设置`discardingThreshold = 0`，即使≤INFO级日志也不会丢。但最好把queueSize设置大一点，毕竟默认的queueSize显然太小，太容易阻塞。
- 若兼顾，可丢弃不重要日志，把**queueSize**设置大点，再设置合理的**discardingThreshold**

以上日志配置最常见两个误区

再看日志记录本身的误区。

# 4 如何选择日志级别?

> 使用{}占位符，就不用判断log level了吗?

据不知名网友说道：SLF4J的{}占位符语法，到真正记录日志时才会获取实际参数，因此解决了日志数据获取的性能问题。
**是真的吗？**
![](https://img-blog.csdnimg.cn/596e199b79c1443a89723becb9809f8b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_12,color_FFFFFF,t_70,g_se,x_16)

- 验证代码：返回结果耗时1s
![](https://img-blog.csdnimg.cn/2020120619541620.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

若记录DEBUG日志，并设置只记录>=INFO级日志，程序是否也会耗时1s？
三种方法测试：
- 拼接字符串方式记录slowString
- 使用占位符方式记录slowString
- 先判断日志级别是否启用DEBUG。

![](https://img-blog.csdnimg.cn/20201206200002878.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201206200446663.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
前俩方式都调用slowString，所以都耗时1s。且方式二就是使用占位符记录slowString，这种方式虽允许传Object，不显式拼接String，但也只是延迟（若日志不记录那就是省去）**日志参数对象.toString()**和**字符串拼接**的耗时。

本案例除非事先判断日志级别，否则必调用slowString。所以使用`{}占位符`不能通过延迟参数值获取，来解决日志数据获取的性能问题。

除事先判断日志级别，还可通过lambda表达式延迟参数内容获取。但SLF4J的API还不支持lambda，因此需使用Log4j2日志API，把**Lombok的@Slf4j注解**替换为**@Log4j2**注解，即可提供lambda表达式参数的方法：
![](https://img-blog.csdnimg.cn/20201206201751860.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

这样调用debug，签名**Supplier<?>**，参数就会延迟到真正需要记录日志时再获取：
![](https://img-blog.csdnimg.cn/20201206202233179.png)
![](https://img-blog.csdnimg.cn/20201206202311160.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201206202346847.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201206202419598.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

所以debug4并不会调用slowString方法
![](https://img-blog.csdnimg.cn/20201206203249411.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

只是换成**Log4j2 API**，真正的日志记录还是走的**Logback**，这就是**SLF4J**适配的好处。

# 总结
- SLF4J统一了Java日志框架。在使用SLF4J时，要理清楚其桥接API和绑定。若程序启动时出现SLF4J错误提示，可能是配置问题，可使用Maven的`dependency:tree`命令梳理依赖关系。
- 异步日志解决性能问题，是用空间换时间。但空间毕竟有限，当空间满，要考虑阻塞等待or丢弃日志。若更希望不丢弃重要日志，那么选择阻塞等待；如果更希望程序不要因为日志记录而阻塞，那么就需要丢弃日志。
- 日志框架提供的参数化记录方式不能完全取代日志级别的判断。若日志量很大，获取日志参数代价也很大，就要判断日志级别，避免不记录日志也要耗时获取日志参数！