> 说说你对线程池的理解？

首先明确，池化的意义在于**缓存，创建性能开销较大的对象**，比如线程池、连接池、内存池。预先在池里创建一些对象，使用时直接取，用完就归还复用，使用策略调整池中缓存对象的数量。

Java创建对象，仅是在JVM堆分块内存，但创建一个线程，却需调用os内核API，然后os要为线程分配一系列资源，成本很高，所以线程是一个重量级对象，应避免频繁创建或销毁。
既然这么麻烦，就要避免呀，所以要使用线程池！

一般池化资源，当你需要资源时，就调用申请线程方法申请资源，用完后调用释放线程方法释放资源。但JDK的线程池根本没有申请线程和释放线程的方法。

那到底该如何理解它的设计思想呢？
其实线程池的设计，采用的是**生产者-消费者模式**：
- 线程池的使用方是生产者
- 线程池本身是消费者

以下简化代码即可显示线程池的基本原理：
![](https://img-blog.csdnimg.cn/20210516215144285.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
JDK线程池最核心的就是ThreadPoolExecutor，看名字，它强调的是Executor，并非一般的池化资源。

> 为什么都说要手动声明线程池？

虽然JDK的`Executors`工具类提供的方法可快速创建线程池。
![](https://img-blog.csdnimg.cn/20201107175307275.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
但阿里有话说：
![](https://img-blog.csdnimg.cn/2020110717563445.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

> 弊端真的这么严重吗，newFixedThreadPool=OOM？

写段测试代码：
![ ](https://img-blog.csdnimg.cn/20210516231308315.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

执行不久，出现OOM
```bash
Exception in thread "http-nio-30666-ClientPoller" 
	java.lang.OutOfMemoryError: GC overhead limit exceeded
```

- `newFixedThreadPool`线程池的工作队列直接new了一个LinkedBlockingQueue
![](https://img-blog.csdnimg.cn/20201107180734266.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 但其默认构造器是一个`Integer.MAX_VALUE`长度的队列，所以很快Q满
![](https://img-blog.csdnimg.cn/20201107180815786.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

虽然使用`newFixedThreadPool`可以固定工作线程数量，但任务队列几乎无界。若任务较多且执行较慢，队列就会快速积压，内存不够，易导致OOM。

> newCachedThreadPool也等于OOM？

```bash
[11:30:30.487] [http-nio-30666-exec-1] [ERROR] [.a.c.c.C.[.[.[/].[dispatcherServlet]:175 ] - Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Handler dispatch failed; nested exception is java.lang.OutOfMemoryError: unable to create new native thread] with root cause
java.lang.OutOfMemoryError: unable to create new native thread 
```
可见OOM是因为无法创建线程，newCachedThreadPool这种线程池的最大线程数是Integer.MAX_VALUE，也可认为无上限，而其工作队列SynchronousQueue是一个没有存储空间的阻塞队列。
![](https://img-blog.csdnimg.cn/20210516231654879.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
所以只要有请求到来，就必须找到一条工作线程处理，若当前无空闲线程就再创建一个新的。
由于我们的任务需很长时间才能执行完成，大量任务进来后会创建大量线程。而线程是需要分配一定内存空间作为线程栈的，比如1MB，因此无限创建线程必OOM

所以使用线程池，请不要抱任何侥幸，以为只是处理轻量任务，不会造成队列积压或创建大量线程！
比如某业务一旦接受到请求，就会调用外部服务，该外部服务接口正常100ms内会响应，现在TPS过百，CachedThreadPool能稳定在占用10个左右线程情况下满足需求。
可天有不测风云，该外部服务不可用了！而代码里调用该服务设置的超时又特别长， 比如1min，1min可能已经进成千上万请求，产生几千个任务，需几千个线程，没多久就因为无法再创建新线程，OOM！

所以阿里才不建议使用Executors：
- 要结合实际并发情况，评估线程池核心参数，确保其工作行为符合预期，关键的也就是设置**有界工作队列和数量可控的线程数**
- 永远要为自定义的线程池设置有意义名称，以便排查问题
因为当出现线程数量暴增、死锁、CPU负载高、线程执行异常等事故时，往往都需抓取线程栈。有意义的线程名称，就很重要。示例如下：
![](https://img-blog.csdnimg.cn/20210518180337647.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


> 注意异常处理

通过ThreadPoolExecutor#execute()提交任务时，若任务在执行的过程中出现运行时异常，会导致 **执行任务的线程** 终止。
但要命的是，有时任务虽然异常了，但你却收不到任何通知，你还在开心摸鱼，以为任务都执行很正常。虽然线程池提供了很多用于异常处理的方法，但最稳妥和简单的方案还是捕获所有异常并具体处理：
![](https://img-blog.csdnimg.cn/20210516222856874.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

> 线程池的线程管理

还好有谷歌，一般我们直接利用guava的ThreadFactoryBuilder实现线程池线程的自定义命名即可。

> 线程池的拒绝策略

线程池默认的拒绝策略会抛RejectedExecutionException，这是个运行时异常，IDEA不会强制捕获，所以我们也很容易忽略它。
对于采用何种策略，具体要看任务的重要性：
- 若是一些不重要任务，可选择直接丢弃
- 重要任务，可采用降级，比如将任务信息插入DB或MQ，启用一个专门用作补偿的线程池去补偿处理。所谓降级，也就是在服务无法正常提供功能的情况下，采取的补救措施。具体处理方式也看具体场景而不同。

- 当线程数大于核心线程数时，线程等待keepAliveTime后还是无任务需要处理，收缩线程到核心线程数
了解这个策略，有助于我们根据实际的容量规划需求，为线程池设置合适的初始化参数。也可通过一些手段来改变这些默认工作行为，比如：
- 声明线程池后立即调用prestartAllCoreThreads，启动所有核心线程
![](https://img-blog.csdnimg.cn/20210516233403439.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 传true给allowCoreThreadTimeOut，让线程池在空闲时同样回收核心线程
![](https://img-blog.csdnimg.cn/20210516233525879.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
> 弹性伸缩的实现

线程池是先用Q存放来不及处理的任务，满后再扩容线程池。当Q设置很大时（那个 工具类），最大线程数这个参数就没啥意义了，因为队列很难满或到满时可能已OOM，更没机会去扩容线程池了。
是否能让线程池优先开启更多线程，而把Q当成后续方案？比如我们的任务执行很慢，需要10s，若线程池可优先扩容到5个最大线程，那么这些任务最终都可以完成，而不会因为线程池扩容过晚导致慢任务来不及处理。

难题在于：
- 线程池在工作队列满时，会扩容线程池
重写队列的offer，人为制造该队列满的条件
- 改变了队列机制，达到最大线程后势必要触发拒绝策略
实现一个自定义拒绝策略，这时再把任务真正插入队列

Tomcat就实现了类似的“弹性”线程池。

> **务必确认清楚线程池本身是不是复用的**。

某服务偶尔报警线程数过多，但过一会儿又会降下来，但应用的请求量却变化不大。

可以在线程数较高时抓取线程栈，发现内存中有上千个线程池，这肯定不正常！

但代码里也没看到声明了线程池，最后发现原来是业务代码调用了一个类库：
![](https://img-blog.csdnimg.cn/20201221131420308.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
该类库竟然每次都创建一个新的线程池！
![](https://img-blog.csdnimg.cn/20201221131504744.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
newCachedThreadPool会在需要时创建必要数量的线程，业务代码的一次业务操作会向线程池提交多个慢任务，这样执行一次业务操作就会开启多个线程。如果业务操作并发量较大的话，的确有可能一下子开启几千个线程。

> 那为何监控中看到线程数量会下降，而不OOM？

newCachedThreadPool的核心线程数是0，而keepAliveTime是60s，所以60s后所有线程都可回收。

> 那这如何修复呢？

使用static字段存放线程池引用即可
![](https://img-blog.csdnimg.cn/20201221131921296.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

> 线程池的意义在于复用，就意味着程序应该始终使用一个线程池吗？

不，具体场景具体分析。

比如一个 I/O 型任务，不断向线程池提交任务：向一个文件写入大量数据。线程池的线程基本一直处于忙碌状态，队列也基本满。而且由于是**CallerRunsPolicy**策略，所以当线程满队列满，任务会在提交任务的线程或调用execute方法的线程执行，所以不要认为提交到线程池的任务就一定会被**异步处理**。

毕竟，若使用CallerRunsPolicy，就有可能**异步任务变同步**执行。使用CallerRunsPolicy，当线程池饱和时，计算任务会在执行Web请求的Tomcat线程执行，这时就会进一步影响到其他同步处理的线程，甚至造成整个应用程序崩溃。

> 如何修正？

使用单独的线程池处理这种“I/O型任务”，将线程数设置多一些！

所以千万不要盲目复用别人写的线程池！因为它不一定适合你的任务！

> Java 8的parallel stream

可方便并行处理集合中的元素，共享同一ForkJoinPool，默认并行度是**CPU核数-1**。对于CPU绑定的任务，使用这样的配置较合适，但若集合操作涉及同步I/O操作（比如数据库操作、外部服务调用），建议自定义一个ForkJoinPool（或普通线程池）。

最后声明一点：提交到相同线程池中的任务，一定要是相互独立的，最好不要有依赖关系！

> 参考
> - 《阿里巴巴Java开发手册》