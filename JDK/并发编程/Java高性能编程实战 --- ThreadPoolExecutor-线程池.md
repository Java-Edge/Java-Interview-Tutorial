# 1 为什么要用线程池
## 1.1 线程the more, the better?
1、线程在java中是一个对象，更是操作系统的资源，线程创建、销毁都需要时间。
如果创建时间+销毁时间>执行任务时间就很不合算。
2、Java对象占用堆内存，操作系统线程占用系统内存，根据JVM规范，一个线程默认最大栈
大小1M，这个栈空间是需要从系统内存中分配的。线程过多，会消耗很多的内存。
3、操作系统需要频繁切换线程上下文(大家都想被运行)，影响性能。

线程使应用能够更加充分合理地协调利用CPU、内存、网络、I/O等系统资源.
线程的创建需要开辟虚拟机栈、本地方法栈、程序计数器等线程私有的内存空间;
在线程销毁时需要回收这些系统资源.
频繁地创建和销毁线程会浪费大量的系统资源,增加并发编程风险.

在服务器负载过大的时候,如何让新的线程等待或者友好地拒绝服务?

这些都是线程自身无法解决的;
所以需要通过线程池协调多个线程,并实现类似主次线程隔离、定时执行、周期执行等任务.

# 2 线程池的作用
● 利用线程池管理并复用线程、控制最大并发数等

● 实现任务线程队列缓存策略和拒绝机制

● 实现某些与时间相关的功能
如定时执行、周期执行等

● 隔离线程环境
比如，交易服务和搜索服务在同一台服务器上,分别开启两个线程池,交易线程的资源消耗明显要大;
因此,通过配置独立的线程池,将较慢的交易服务与搜索服务隔离开,避免各服务线程相互影响.

在开发中,合理地使用线程池能够带来3个好处
 - **降低资源消耗** 通过重复利用已创建的线程,降低创建和销毁线程造成的系统资源消耗
 - **提高响应速度** 当任务到达时,任务可以不需要等到线程创建就能立即执行
 - **提高线程的可管理性** 线程是稀缺资源,如果过多地创建,不仅会消耗系统资源，还会降低系统的稳定性，导致使用线程池可以进行统一分配、调优和监控。

# 3 概念
1、**线程池管理器**
用于创建并管理线程池，包括创建线程池，销毁线程池，添加新任务;
2、**工作线程**
线程池中线程，在没有任务时处于等待状态，可以循环的执行任务;
3、**任务接口**
每个任务必须实现的接口，以供工作线程调度任务的执行，它主要规定了任务的入口，任务执行完后的收尾工作，任务的执行状态等;
4、**任务队列**
用于存放没有处理的任务。提供缓冲机制。.

- 原理示意图
![](https://img-blog.csdnimg.cn/20191009015833132.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 4 线程池API
## 4.1 接口定义和实现类
![](https://img-blog.csdnimg.cn/2019100901595683.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### 继承关系图
![线程池相关类图](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyOTA5XzQ2ODU5NjgtZWFhYWY4ZmQ4ODQ5Nzc1Ny5wbmc?x-oss-process=image/format,png)
可以认为ScheduledThreadPoolExecutor是最丰富的实现类!

## 4.2 方法定义
### 4.2.1 ExecutorService
![](https://img-blog.csdnimg.cn/20191009020347726.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### 4.2.2 ScheduledExecutorService
#### public ScheduledFuture<?> schedule(Runnable command, long delay, TimeUnit unit);
![](https://img-blog.csdnimg.cn/20191013013014872.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
####  public <V> ScheduledFuture<V> schedule(Callable<V> callable, long delay, TimeUnit unit);
![](https://img-blog.csdnimg.cn/20191013013113751.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

#### 以上两种都是创建并执行一个一次性任务, 过了延迟时间就会被执行
####  public ScheduledFuture<?> scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnit unit);

![](https://img-blog.csdnimg.cn/20191013013412305.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
创建并执行一个周期性任务
过了给定的初始延迟时间，会第一次被执行
执行过程中发生了异常,那么任务就停止

一次任务 执行时长超过了周期时间，下一次任务会等到该次任务执行结束后，立刻执行，这也是它和`scheduleWithFixedDelay`的重要区别

#### public ScheduledFuture<?> scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit);
创建并执行一个周期性任务
过了初始延迟时间，第一次被执行，后续以给定的周期时间执行
执行过程中发生了异常,那么任务就停止

一次任务执行时长超过了周期时间，下一 次任务 会在该次任务执
行结束的时间基础上，计算执行延时。
对于超过周期的长时间处理任务的不同处理方式，这是它和`scheduleAtFixedRate`的重要区别。

### 实例
- 测试例子
![](https://img-blog.csdnimg.cn/20191013153615841.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 测试实现
![](https://img-blog.csdnimg.cn/20191013153730175.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 运行结果
![](https://img-blog.csdnimg.cn/2019101315391641.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
可以看出超过core的线程都在等待,线程池线程数量为何达不到最大线程数呢?那这个参数还有什么意义, 让我们继续往下阅读吧!


### 4.2.2  Executors工具类
你可以自己实例化线程池，也可以用`Executors`创建线程池的工厂类，常用方法如下:

`ExecutorService` 的抽象类`AbstractExecutorService `提供了`submit`、`invokeAll` 等方法的实现;
但是核心方法`Executor.execute()`并没有在这里实现.
因为所有的任务都在该方法执行,不同实现会带来不同的执行策略.

通过`Executors`的静态工厂方法可以创建三个线程池的包装对象
- ForkJoinPool、
- ThreadPoolExecutor
- ScheduledThreadPoolExecutor

● Executors.newWorkStealingPool
JDK8 引入,创建持有足够线程的线程池支持给定的并行度;
并通过使用多个队列减少竞争;
构造方法中把CPU数量设置为默认的并行度.
返回`ForkJoinPool` ( JDK7引入)对象,它也是`AbstractExecutorService` 的子类
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyOTA2XzQ2ODU5NjgtM2I0YThlOGMxNDA4Zjg5Mi5wbmc?x-oss-process=image/format,png)


● Executors.newCachedThreadPool
创建的是一个无界的缓冲线程池。它的任务队列是一个同步队列。
任务加入到池中
- 如果池中有空闲线程，则用空闲线程执行
- 如无, 则创建新线程执行。

池中的线程空闲超过60秒，将被销毁。线程数随任务的多少变化。
`适用于执行耗时较小的异步任务`。池的核心线程数=0 ,最大线程数= Integer.MAX_ _VALUE
`maximumPoolSize` 最大可以至`Integer.MAX_VALUE`,是高度可伸缩的线程池.
若达到该上限,相信没有服务器能够继续工作,直接OOM.
`keepAliveTime` 默认为60秒;
工作线程处于空闲状态,则回收工作线程;
如果任务数增加,再次创建出新线程处理任务.

● Executors.newScheduledThreadPool
能定时执行任务的线程池。该池的核心线程数由参数指定，线程数最大至`Integer.MAX_ VALUE`,与上述相同,存在OOM风险.
`ScheduledExecutorService`接口的实现类,支持**定时及周期性任务执行**;
相比`Timer`,` ScheduledExecutorService` 更安全,功能更强大.
与`newCachedThreadPool`的区别是**不回收工作线程**.

● Executors.newSingleThreadExecutor
创建一个单线程的线程池,相当于单线程串行执行所有任务,保证按任务的提交顺序依次执行.
只有-个线程来执行无界任务队列的单-线程池。该线程池确保任务按加入的顺序一个一
个依次执行。当唯一的线程因任务 异常中止时，将创建一个新的线程来继续执行 后续的任务。
与newFixedThreadPool(1)的区别在于，单线程池的池大小在`newSingleThreadExecutor`方法中硬编码，不能再改变的。


● Executors.newFixedThreadPool
创建一个固定大小任务队列容量无界的线程池
输入的参数即是固定线程数;
既是核心线程数也是最大线程数;
不存在空闲线程,所以`keepAliveTime`等于0.
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyODE5XzQ2ODU5NjgtOGNkOTFmM2M2ZWFkYTlkZS5wbmc?x-oss-process=image/format,png)
其中使用了 LinkedBlockingQueue, 但是没有设置上限!!!,堆积过多任务!!!

下面介绍`LinkedBlockingQueue`的构造方法
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyOTEwXzQ2ODU5NjgtZmNlMjYxZGJlMzBkZWY3MS5wbmc?x-oss-process=image/format,png)
使用这样的无界队列,如果瞬间请求非常大,会有OOM的风险;
除`newWorkStealingPool` 外,其他四个创建方式都存在资源耗尽的风险.

不推荐使用其中的任何创建线程池的方法,因为都没有任何限制,存在安全隐患.

 `Executors`中默认的线程工厂和拒绝策略过于简单,通常对用户不够友好.
线程工厂需要做创建前的准备工作,对线程池创建的线程必须明确标识,就像药品的生产批号一样,为线程本身指定有意义的名称和相应的序列号.
拒绝策略应该考虑到业务场景,返回相应的提示或者友好地跳转.
以下为简单的ThreadFactory 示例
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzk3XzQ2ODU5NjgtZDIwMjUyODdhODJhZGQ5NS5wbmc?x-oss-process=image/format,png)

上述示例包括线程工厂和任务执行体的定义;
通过newThread方法快速、统一地创建线程任务,强调线程一定要有特定意义的名称,方便出错时回溯.

- 单线程池：newSingleThreadExecutor()方法创建，五个参数分别是ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue())。含义是池中保持一个线程，最多也只有一个线程，也就是说这个线程池是顺序执行任务的，多余的任务就在队列中排队。 
- 固定线程池：newFixedThreadPool(nThreads)方法创建
[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-NZEi0e3y-1570557031347)(https://uploadfiles.nowcoder.com/images/20190625/5088755_1561474494512_5D0DD7BCB7171E9002EAD3AEF42149E6 "图片标题")] 

池中保持nThreads个线程，最多也只有nThreads个线程，多余的任务也在队列中排队。 
[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-SId8FBO1-1570557031347)(https://uploadfiles.nowcoder.com/images/20190625/5088755_1561476084467_4A47A0DB6E60853DEDFCFDF08A5CA249 "图片标题")] 

[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-6uzv6UAk-1570557031348)(https://uploadfiles.nowcoder.com/images/20190625/5088755_1561476102425_FB5C81ED3A220004B71069645F112867 "图片标题")] 
线程数固定且线程不超时
- 缓存线程池：newCachedThreadPool()创建，五个参数分别是ThreadPoolExecutor(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS, new SynchronousQueue())。
含义是池中不保持固定数量的线程，随需创建，最多可以创建Integer.MAX_VALUE个线程（说一句，这个数量已经大大超过目前任何操作系统允许的线程数了），空闲的线程最多保持60秒，多余的任务在SynchronousQueue（所有阻塞、并发队列在后续文章中具体介绍）中等待。 

为什么单线程池和固定线程池使用的任务阻塞队列是LinkedBlockingQueue()，而缓存线程池使用的是SynchronousQueue()呢？ 
因为单线程池和固定线程池中，线程数量是有限的，因此提交的任务需要在LinkedBlockingQueue队列中等待空余的线程；而缓存线程池中，线程数量几乎无限（上限为Integer.MAX_VALUE），因此提交的任务只需要在SynchronousQueue队列中同步移交给空余线程即可。

- 单线程调度线程池：newSingleThreadScheduledExecutor()创建，五个参数分别是 (1, Integer.MAX_VALUE, 0, NANOSECONDS, new DelayedWorkQueue())。含义是池中保持1个线程，多余的任务在DelayedWorkQueue中等待。 
- 固定调度线程池：newScheduledThreadPool(n)创建，五个参数分别是 (n, Integer.MAX_VALUE, 0, NANOSECONDS, new DelayedWorkQueue())。含义是池中保持n个线程，多余的任务在DelayedWorkQueue中等待。

有一项技术可以缓解执行时间较长任务造成的影响，即限定任务等待资源的时间，而不要无限的等待

先看第一个例子，测试单线程池、固定线程池和缓存线程池（注意增加和取消注释）：

```
public class ThreadPoolExam {
    public static void main(String[] args) {
        //first test for singleThreadPool
        ExecutorService pool = Executors.newSingleThreadExecutor();
        //second test for fixedThreadPool
//        ExecutorService pool = Executors.newFixedThreadPool(2);
        //third test for cachedThreadPool
//        ExecutorService pool = Executors.newCachedThreadPool();
        for (int i = 0; i < 5; i++) {
            pool.execute(new TaskInPool(i));
        }
        pool.shutdown();
    }
}

class TaskInPool implements Runnable {
    private final int id;

    TaskInPool(int id) {
        this.id = id;
    }

    @Override
    public void run() {
        try {
            for (int i = 0; i < 5; i++) {
                System.out.println("TaskInPool-["+id+"] is running phase-"+i);
                TimeUnit.SECONDS.sleep(1);
            }
            System.out.println("TaskInPool-["+id+"] is over");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

如图为排查底层公共缓存调用出错时的截图
![有意义的线程命名](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzQ5XzQ2ODU5NjgtODU1MDI1MzM5MDZjMzNmMi5wbmc?x-oss-process=image/format,png)
绿色框采用自定义的线程工厂,明显比蓝色框默认的线程工厂创建的线程名称拥有更多的额外信息:如调用来源、线程的业务含义，有助于快速定位到死锁、StackOverflowError 等问题.

# 5 创建线程池
首先从`ThreadPoolExecutor`构造方法讲起,学习如何自定义`ThreadFactory`和`RejectedExecutionHandler`;
并编写一个最简单的线程池示例.
然后,通过分析`ThreadPoolExecutor`的`execute`和`addWorker`两个核心方法;
学习如何把任务线程加入到线程池中运行.

- ThreadPoolExecutor 的构造方法如下
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzMyXzQ2ODU5NjgtYTVmOTU1Yjc5MmJkNDUzZS5wbmc?x-oss-process=image/format,png)

- 第1个参数: corePoolSize 表示常驻核心线程数
如果等于0,则任务执行完之后,没有任何请求进入时销毁线程池的线程;
如果大于0,即使本地任务执行完毕,核心线程也不会被销毁.
这个值的设置非常关键;
设置过大会浪费资源;
设置过小会导致线程频繁地创建或销毁.

- 第2个参数: maximumPoolSize 表示线程池能够容纳同时执行的最大线程数
从第1处来看,必须>=1.
如果待执行的线程数大于此值,需要借助第5个参数的帮助,缓存在队列中.
如果`maximumPoolSize = corePoolSize`,即是固定大小线程池.

- 第3个参数: keepAliveTime 表示线程池中的线程空闲时间
当空闲时间达到`keepAliveTime`时,线程会被销毁,直到只剩下`corePoolSize`个线程;
避免浪费内存和句柄资源.
在默认情况下,当线程池的线程数大于`corePoolSize`时,`keepAliveTime`才起作用.
但是当`ThreadPoolExecutor`的`allowCoreThreadTimeOut = true`时,核心线程超时后也会被回收.

- 第4个参数: TimeUnit表示时间单位
keepAliveTime的时间单位通常是TimeUnit.SECONDS.

- 第5个参数: workQueue 表示缓存队列
当请求的线程数大于`maximumPoolSize`时,线程进入`BlockingQueue`.
后续示例代码中使用的LinkedBlockingQueue是单向链表,使用锁来控制入队和出队的原子性;
两个锁分别控制元素的添加和获取,是一个生产消费模型队列.

- 第6个参数: threadFactory 表示线程工厂
它用来生产一组相同任务的线程;
线程池的命名是通过给这个factory增加组名前缀来实现的.
在虚拟机栈分析时,就可以知道线程任务是由哪个线程工厂产生的.

- 第7个参数: handler 表示执行拒绝策略的对象
当超过第5个参数`workQueue`的任务缓存区上限的时候,就可以通过该策略处理请求,这是一种简单的限流保护.
友好的拒绝策略可以是如下三种:
(1 ) 保存到数据库进行削峰填谷;在空闲时再提取出来执行
(2)转向某个提示页面
(3)打印日志

### 2.1.1 corePoolSize(核心线程数量)
线程池中应该保持的主要线程的数量.即使线程处于空闲状态，除非设置了`allowCoreThreadTimeOut`这个参数,当提交一个任务到线程池时,若线程数量<corePoolSize,线程池会创建一个新线程放入works(一个HashSet)中执行任务,即使其他空闲的基本线程能够执行新任务也还是会创建新线程
等到需要执行的任务数大于线程池基本大小时就不再创建,会尝试放入等待队列workQueue
如果调用线程池的`prestartAllCoreThreads()`,线程池会提前创建并启动所有核心线程
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzUzXzQ2ODU5NjgtODQxMGU3OTM1YWE4YjI4ZS5wbmc?x-oss-process=image/format,png)
### 2.1.2 maximumPoolSize（线程池最大线程数）
线程池允许创建的最大线程数
若队列满,并且已创建的线程数小于最大线程数,则线程池会再创建新的线程放入works中执行任务,CashedThreadPool的关键,固定线程数的线程池无效
若使用了无界任务队列,这个参数就没什么效果
 - workQueue
存储待执行任务的阻塞队列，这些任务必须是`Runnable`的对象（如果是Callable对象，会在submit内部转换为Runnable对象） 
 
- runnableTaskQueue(任务队列):用于保存等待执行的任务的阻塞队列.可以选择以下几个阻塞队列.
  - LinkedBlockingQueue:一个基于链表结构的阻塞队列,此队列按FIFO排序元素,吞吐量通常要高于ArrayBlockingQueue.静态工厂方法Executors.newFixedThreadPool()使用了这个队列
  - SynchronousQueue:一个不存储元素的阻塞队列.每个插入操作必须等到另一个线程调用移除操作,否则插入操作一直处于阻塞状态,吞吐量通常要高于Linked-BlockingQueue,静态工厂方法Executors.newCachedThreadPool使用了这个队列
 


 - ThreadFactory:用于设置创建线程的工厂,可以通过线程工厂给每个创建出来的线程设置更有意义的名字.使用开源框架guava提供ThreadFactoryBuilder可以快速给线程池里的线程设置有意义的名字,代码如下

```
new ThreadFactoryBuilder().setNameFormat("XX-task-%d").build();
```
 - RejectedExecutionHandler（拒绝策略）
当队列和线程池都满,说明线程池饱和,必须采取一种策略处理提交的新任务
策略默认`AbortPolicy`,表无法处理新任务时抛出异常
在JDK 1.5中Java线程池框架提供了以下4种策略
   - AbortPolicy：丢弃任务，抛出 RejectedExecutionException
   - CallerRunsPolicy:只用调用者所在线程来运行任务,有反馈机制，使任务提交的速度变慢）。
   - DiscardOldestPolicy
若没有发生shutdown,尝试丢弃队列里最近的一个任务,并执行当前任务, 丢弃任务缓存队列中最老的任务，并且尝试重新提交新的任务
   - DiscardPolicy:不处理,丢弃掉, 拒绝执行，不抛异常 
 当然,也可以根据应用场景需要来实现RejectedExecutionHandler接口自定义策略.如记录日志或持久化存储不能处理的任务
```
   /**
     * Invokes the rejected execution handler for the given command.
     * Package-protected for use by ScheduledThreadPoolExecutor.
     */
    final void reject(Runnable command) {
        // 执行拒绝策略
        handler.rejectedExecution(command, this);
    }
```
`handler` 构造线程池时候就传的参数，`RejectedExecutionHandler `的实例
`RejectedExecutionHandler` 在 `ThreadPoolExecutor` 中有四个实现类可供我们直接使用，当然，也可以实现自己的策略，一般也没必要。
```
    //只要线程池没有被关闭，由提交任务的线程自己来执行这个任务
    public static class CallerRunsPolicy implements RejectedExecutionHandler {

        public CallerRunsPolicy() { }

        /**
         * Executes task r in the caller's thread, unless the executor
         * has been shut down, in which case the task is discarded.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         */
        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            if (!e.isShutdown()) {
                r.run();
            }
        }
    }

    // 不管怎样，直接抛出 RejectedExecutionException 异常
    // 默认的策略，如果我们构造线程池的时候不传相应的 handler ，则指定使用这个
    public static class AbortPolicy implements RejectedExecutionHandler {
       
        public AbortPolicy() { }

        /**
         * Always throws RejectedExecutionException.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         * @throws RejectedExecutionException always
         */
        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            throw new RejectedExecutionException("Task " + r.toString() +
                                                 " rejected from " +
                                                 e.toString());
        }
    }

    // 不做任何处理，直接忽略掉这个任务
    public static class DiscardPolicy implements RejectedExecutionHandler {
        /**
         * Creates a {@code DiscardPolicy}.
         */
        public DiscardPolicy() { }

        /**
         * Does nothing, which has the effect of discarding task r.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         */
        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
        }
    }

    // 若线程池未被关闭
    // 把队列队头的任务(也就是等待了最长时间的)直接扔掉，然后提交这个任务到等待队列中
    public static class DiscardOldestPolicy implements RejectedExecutionHandler {
      
        public DiscardOldestPolicy() { }

        /**
         * Obtains and ignores the next task that the executor
         * would otherwise execute, if one is immediately available,
         * and then retries execution of task r, unless the executor
         * is shut down, in which case task r is instead discarded.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         */
        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            if (!e.isShutdown()) {
                e.getQueue().poll();
                e.execute(r);
            }
        }
    }
```
- keepAliveTime（线程活动保持时间）
线程没有任务执行时最多保持多久时间终止
线程池的工作线程空闲后，保持存活的时间。
所以，如果任务很多，并且每个任务执行的时间比较短，可以调大时间，提高线程的利用率

 - TimeUnit（线程活动保持时间的单位）:指示第三个参数的时间单位；可选的单位有天（DAYS）、小时（HOURS）、分钟（MINUTES）、毫秒（MILLISECONDS）、微秒（MICROSECONDS，千分之一毫秒）和纳秒（NANOSECONDS，千分之一微秒）


从代码第2处来看，**队列、线程工厂、拒绝处理服务**都必须有实例对象;
但在实际编程中,很少有程序员对这三者进行实例化,而通过`Executors`这个线程池静态工厂提供默认实现

# 拒绝策略
下面再简单地实现一下`RejectedExecutionHandler`;
实现了接口的`rejectedExecution`方法,打印出当前线程池状态
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyODA5XzQ2ODU5NjgtYWM3ZmFjMmM2YjMzMmRhZi5wbmc?x-oss-process=image/format,png)


在`ThreadPoolExecutor`中提供了四个公开的内部静态类
● AbortPolicy  - **默认** 
丢弃任务并抛出`RejectedExecutionException`
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyOTg2XzQ2ODU5NjgtZGNmODEyNmMxODdkNGJmYS5wbmc?x-oss-process=image/format,png)

● DiscardPolicy - **不推荐**
丢弃任务,但不拋异常.
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyOTU2XzQ2ODU5NjgtZDUxOTUwMjBlMzQ3ZDhlYi5wbmc?x-oss-process=image/format,png)

● DiscardOldestPolicy
抛弃队列中等待最久的任务,然后把当前任务加入队列中.
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUzODA2XzQ2ODU5NjgtZDNhMzZiOTAyMTExMzhmNC5wbmc?x-oss-process=image/format,png)

● CallerRunsPolicy
调用任务的run()方法绕过线程池直接执行.
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyOTA4XzQ2ODU5NjgtYzA2YTA0ZDZjZTMwZGU5Ny5wbmc?x-oss-process=image/format,png)


根据之前实现的线程工厂和拒绝策略,线程池的相关代码实现如下
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODU0MTYxXzQ2ODU5NjgtOGIxYzU3NjIxM2JlYTNjYS5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUzNjM2XzQ2ODU5NjgtMTg0ZjQ1NTI0MGYxYjc5Yy5wbmc?x-oss-process=image/format,png)
当任务被拒绝的时候，拒绝策略会打印出当前线程池的大小已经达到了`maximumPoolSize=2`,且队列已满,完成的任务数提示已经有1个(最后一行).

# 源码讲解
在`ThreadPoolExecutor`的属性定义中频繁地用位运算来表示线程池状态;
位运算是改变当前值的一种高效手段.

下面从属性定义开始

>Integer 有32位;
最右边29位表工作线程数;
最左边3位表示线程池状态,可表示从0至7的8个不同数值
线程池的状态用高3位表示,其中包括了符号位.
五种状态的十进制值按从小到大依次排序为
RUNNING < SHUTDOWN < STOP < TIDYING <TERMINATED
这样设计的好处是可以通过比较值的大小来确定线程池的状态.
例如程序中经常会出现isRunning的判断:
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyODQyXzQ2ODU5NjgtOGRjN2QwZWFjYjQ1OGYyZS5wbmc?x-oss-process=image/format,png)

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzE3XzQ2ODU5NjgtODEzMzc2YTk4MjZlMjRjNi5wbmc?x-oss-process=image/format,png)

- 000-1111111111111111111111111;
类似于子网掩码,用于与运算;
得到左边3位,还是右边29位
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUzMzA5XzQ2ODU5NjgtNmM3Zjg5NDExNjk3MmEyZi5wbmc?x-oss-process=image/format,png)

用左边3位,实现5种线程池状态;
在左3位之后加入中画线有助于理解;

- 111 - 0000000000000000000000000000(十进制: -536, 870, 912);
该状态表 线程池能接受新任务
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzEzXzQ2ODU5NjgtZTgzOGM1NmI5OTU0NGU5My5wbmc?x-oss-process=image/format,png)


- 000 - 0000000000000000000000000(十进制: 0);
此状态不再接受新任务,但可继续执行队列中的任务
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUzMDI1XzQ2ODU5NjgtZDM0NDc2NzhiNzdjODUxZi5wbmc?x-oss-process=image/format,png)

- 001 - 00000000000000000000000000(十进制: 536,870， 912);
此状态全面拒绝,并中断正在处理的任务
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyODcyXzQ2ODU5NjgtNmMzOTlhMjhkZTBmMzc1Yi5wbmc?x-oss-process=image/format,png)

- 010 - 00000000000000000000000000.(十进制值: 1, 073, 741, 824);
该状态表 所有任务已经被终止
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyODE0XzQ2ODU5NjgtZTEzNDFjY2FlM2Q3MzQ3My5wbmc?x-oss-process=image/format,png)

- 101 - 000000000000000000000000000(十进制值: 1, 610,612, 736)
该状态表 已清理完现场
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzEzXzQ2ODU5NjgtMmI4M2VmMmEwZjI4YjU3MC5wbmc?x-oss-process=image/format,png)


与运算,比如 001 - 000000000000000000000100011 表 67个工作线程;
掩码取反: 111 - 00000000000000000000000.,即得到左边3位001;
表示线程池当前处于**STOP**状态
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyOTU2XzQ2ODU5NjgtMGQ5YjA4ODRhYmU4ZTFjMS5wbmc?x-oss-process=image/format,png)

同理掩码 000 - 11111111111111111111,得到右边29位,即工作线程数
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzY4XzQ2ODU5NjgtOTAwNjNiMjEzNGM4OTc3Mi5wbmc?x-oss-process=image/format,png)

把左3位与右29位或运算,合并成一个值
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyOTU5XzQ2ODU5NjgtODU4ZGY0ZWJjYjkxYTg0ZS5wbmc?x-oss-process=image/format,png)


我们都知道`Executor`接口有且只有一个方法`execute()`;
通过参数传入待执行线程的对象.
下面分析`ThreadPoolExecutor`关于`execute()`方法的实现

线程池执行任务的方法如下
```
   /**
     * Executes the given task sometime in the future.  The task
     * may execute in a new thread or in an existing pooled thread.
     *
     * If the task cannot be submitted for execution, either because this
     * executor has been shutdown or because its capacity has been reached,
     * the task is handled by the current {@code RejectedExecutionHandler}.
     *
     * @param command the task to execute
     * @throws RejectedExecutionException at discretion of
     *         {@code RejectedExecutionHandler}, if the task
     *         cannot be accepted for execution
     * @throws NullPointerException if {@code command} is null
     */
    public void execute(Runnable command) {
        if (command == null)
            throw new NullPointerException();
        /*
         * Proceed in 3 steps:
         *
         * 1. If fewer than corePoolSize threads are running, try to
         * start a new thread with the given command as its first
         * task.  The call to addWorker atomically checks runState and
         * workerCount, and so prevents false alarms that would add
         * threads when it shouldn't, by returning false.
         *
         * 2. If a task can be successfully queued, then we still need
         * to double-check whether we should have added a thread
         * (because existing ones died since last checking) or that
         * the pool shut down since entry into this method. So we
         * recheck state and if necessary roll back the enqueuing if
         * stopped, or start a new thread if there are none.
         *
         * 3. If we cannot queue task, then we try to add a new
         * thread.  If it fails, we know we are shut down or saturated
         * and so reject the task.
         */
        // 返回包含线程数及线程池状态的Integer 类型数值
        int c = ctl.get();

        // 若工作线程数 < 核心线程数,则创建线程并执行当前任务
        if (workerCountOf(c) < corePoolSize) {
            if (addWorker(command, true))
```
`execute`方法在不同的阶段有三次`addWorker`的尝试动作。
```
                return;
            // 若创建失败,为防止外部已经在线程池中加入新任务,在此重新获取一下
            c = ctl.get();
        }

        // 若 工作线程数 >=核心线程数 或线程创建失败,则将当前任务放到工作队列中
        // 只有线程池处于 RUNNING 态,才执行后半句 : 置入队列
        if (isRunning(c) && workQueue.offer(command)) {
            int recheck = ctl.get();
            
            // 只有线程池处于 RUNNING 态,才执行后半句 : 置入队列
            if (! isRunning(recheck) && remove(command))
                reject(command);
            // 若之前的线程已被消费完,新建一个线程
            else if (workerCountOf(recheck) == 0)
                addWorker(null, false);
        // 核心线程和队列都已满,尝试创建一个新线程
        }
        else if (!addWorker(command, false))
            // 抛出RejectedExecutionException异常
            // 若 addWorker 返回是 false,即创建失败,则唤醒拒绝策略.
            reject(command);
    }
```
发生拒绝的理由有两个
( 1 )线程池状态为非RUNNING状态
(2)等待队列已满。

下面继续分析`addWorker`

## addWorker 源码解析

根据当前线程池状态,检查是否可以添加新的任务线程,若可以则创建并启动任务;
若一切正常则返回true;
返回false的可能性如下
1. 线程池没有处于`RUNNING`态
2. 线程工厂创建新的任务线程失败
### 参数
- firstTask
外部启动线程池时需要构造的第一个线程,它是线程的母体
- core
新增工作线程时的判断指标
     - true
需要判断当前`RUNNING`态的线程是否少于`corePoolsize`
    - false
需要判断当前`RUNNING`态的线程是否少于`maximumPoolsize`
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUzMjIwXzQ2ODU5NjgtMjg2MDRmYjVkYTE5MjJlNC5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzg5XzQ2ODU5NjgtOTk1ZmFlOTQyOTQwMjFjNy5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyODMwXzQ2ODU5NjgtM2Y3NzViOWQ1MThmMzc4My5wbmc?x-oss-process=image/format,png)

这段代码晦涩难懂,部分地方甚至违反代码规约,但其中蕴含丰富的编码知识点

- 第1处,配合循环语句出现的label,类似于goto 作用
label 定义时,必须把标签和冒号的组合语句紧紧相邻定义在循环体之前,否则会编译出错.
目的是 在实现多重循环时能够快速退出到任何一层;
出发点似乎非常贴心,但在大型软件项目中,滥用标签行跳转的后果将是灾难性的.
示例代码中在`retry`下方有两个无限循环;
在`workerCount`加1成功后,直接退出两层循环.

- 第2处,这样的表达式不利于阅读,应如是
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzg1XzQ2ODU5NjgtMDg2ZTlkNWY5ZGEyYWZkNC5wbmc?x-oss-process=image/format,png)

- 第3处,与第1处的标签呼应,`AtomicInteger`对象的加1操作是原子性的;
`break retry`表 直接跳出与`retry` 相邻的这个循环体
 
- 第4处,此`continue`跳转至标签处,继续执行循环.
如果条件为false,则说明线程池还处于运行状态,即继续在`for(;)`循环内执行.

- 第5处,`compareAndIncrementWorkerCount `方法执行失败的概率非常低.
即使失败,再次执行时成功的概率也是极高的,类似于自旋原理.
这里是先加1,创建失败再减1,这是轻量处理并发创建线程的方式;
如果先创建线程,成功再加1,当发现超出限制后再销毁线程,那么这样的处理方式明显比前者代价要大.

- 第6处,`Worker `对象是工作线程的核心类实现，部分源码如下
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUzMjMyXzQ2ODU5NjgtYzkzNTI3ODJjNTZjM2Q2Ny5wbmc?x-oss-process=image/format,png)
它实现了`Runnable`接口,并把本对象作为参数输入给`run()`中的`runWorker (this)`;
所以内部属性线程`thread`在`start`的时候,即会调用`runWorker`.

# 总结
线程池的相关源码比较精炼，还包括线程池的销毁、任务提取和消费等，与线程状态图一样，线程池也有自己独立的状态转化流程，本节不再展开。
总结一下，使用线程池要注意如下几点:
(1)合理设置各类参数，应根据实际业务场景来设置合理的工作线程数。
(2)线程资源必须通过线程池提供，不允许在应用中自行显式创建线程。
(3)创建线程或线程池时请指定有意义的线程名称，方便出错时回溯。

线程池不允许使用Executors，而是通过ThreadPoolExecutor的方式创建，这样的处理方式能更加明确线程池的运行规则，规避资源耗尽的风险。





进一步查看源码发现,这些方法最终都调用了ThreadPoolExecutor和ScheduledThreadPoolExecutor的构造函数
而ScheduledThreadPoolExecutor继承自ThreadPoolExecutor

## 0.2 ThreadPoolExecutor 自定义线程池
[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-5A6eRvc8-1570557031390)(https://uploadfiles.nowcoder.com/images/20190625/5088755_1561476436402_10FB15C77258A991B0028080A64FB42D "图片标题")] 
它们都是某种线程池,可以控制线程创建,释放,并通过某种策略尝试复用线程去执行任务的一个管理框架

,因此最终所有线程池的构造函数都调用了Java5后推出的ThreadPoolExecutor的如下构造函数                        
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyODEwXzQ2ODU5NjgtYmY0MTAwOTU5Nzk4NjA1OC5wbmc?x-oss-process=image/format,png)

## Java默认提供的线程池
Java中的线程池是运用场景最多的并发框架,几乎所有需要异步或并发执行任务的程序都可以使用线程池
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUzMDc1XzQ2ODU5NjgtNGYxOGI1ZTk2ZWIxZDkzMC5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyOTg5XzQ2ODU5NjgtYjdlYzU5YTgwMDQ0MmIyNi5wbmc?x-oss-process=image/format,png)

我们只需要将待执行的方法放入 run 方法中，将 Runnable 接口的实现类交给线程池的
execute 方法，作为他的一个参数，比如： 
```java
Executor e=Executors.newSingleThreadExecutor();           
e.execute(new Runnable(){ //匿名内部类     public  void run(){  
//需要执行的任务 
} 
}); 

```
# 线程池原理 - 任务execute过程
 - 流程图
![](https://img-blog.csdnimg.cn/20191014020916959.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 示意图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzMwXzQ2ODU5NjgtYTA3YjhiMzIzMzMxYzE1ZS5wbmc?x-oss-process=image/format,png)

ThreadPoolExecutor执行execute()分4种情况
 - 若当前运行的线程少于`corePoolSize`,则创建新线程来执行任务(该步需要获取全局锁)
 - 若运行的线程多于或等于`corePoolSize`,且工作队列没满，则将新提交的任务存储在工作队列里。即, 将任务加入`BlockingQueue`
 - 若无法将任务加入`BlockingQueue`,且没达到线程池最大数量, 则创建新的线程来处理任务(该步需要获取全局锁)
 - 若创建新线程将使当前运行的线程超出`maximumPoolSize`,任务将被拒绝,并调用`RejectedExecutionHandler.rejectedExecution()`

采取上述思路,是为了在执行`execute()`时,尽可能避免获取全局锁
在ThreadPoolExecutor完成预热之后（当前运行的线程数大于等于corePoolSize),几乎所有的execute()方法调用都是执行步骤2,而步骤2不需要获取全局锁

## 实例
![](https://img-blog.csdnimg.cn/20191013231005279.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 结果
![](https://img-blog.csdnimg.cn/20191014015653362.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# **源码分析**
```
   /**
	 * 检查是否可以根据当前池状态和给定的边界（核心或最大)
     * 添加新工作线程。如果是这样,工作线程数量会相应调整，如果可能的话,一个新的工作线程创建并启动
     * 将firstTask作为其运行的第一项任务。
     * 如果池已停止此方法返回false
     * 如果线程工厂在被访问时未能创建线程,也返回false
     * 如果线程创建失败，或者是由于线程工厂返回null，或者由于异常（通常是在调用Thread.start（）后的OOM）），我们干净地回滚。
	 *
	 * @param core if true use corePoolSize as bound, else
	 * maximumPoolSize. (A boolean indicator is used here rather than a
	 * value to ensure reads of fresh values after checking other pool
	 * state).
	 * @return true if successful
	 */
    private boolean addWorker(Runnable firstTask, boolean core) {
        retry:
        for (;;) {
            int c = ctl.get();
            int rs = runStateOf(c);
      
            
    /**
     * Check if queue empty only if necessary.
     * 
     * 如果线程池已关闭，并满足以下条件之一，那么不创建新的 worker：
     *      1. 线程池状态大于 SHUTDOWN，也就是 STOP, TIDYING, 或 TERMINATED
     *      2. firstTask != null
     *      3. workQueue.isEmpty()
     * 简单分析下：
     *      状态控制的问题，当线程池处于 SHUTDOWN ，不允许提交任务，但是已有任务继续执行
     *      当状态大于 SHUTDOWN ，不允许提交任务，且中断正在执行任务
     *      多说一句：若线程池处于 SHUTDOWN，但 firstTask 为 null，且 workQueue 非空，是允许创建 worker 的
     *  
     */
            if (rs >= SHUTDOWN &&
                ! (rs == SHUTDOWN &&
                   firstTask == null &&
                   ! workQueue.isEmpty()))
                return false;

            for (;;) {
                int wc = workerCountOf(c);
                if (wc >= CAPACITY ||
                    wc >= (core ? corePoolSize : maximumPoolSize))
                    return false;
                // 如果成功，那么就是所有创建线程前的条件校验都满足了，准备创建线程执行任务
                // 这里失败的话，说明有其他线程也在尝试往线程池中创建线程
                if (compareAndIncrementWorkerCount(c))
                    break retry;
                // 由于有并发，重新再读取一下 ctl
                c = ctl.get();  // Re-read ctl
                // 正常如果是 CAS 失败的话，进到下一个里层的for循环就可以了
                // 可如果是因为其他线程的操作，导致线程池的状态发生了变更，如有其他线程关闭了这个线程池
                // 那么需要回到外层的for循环
                if (runStateOf(c) != rs)
                    continue retry;
                // else CAS failed due to workerCount change; retry inner loop
            }
        }

     /* *
        * 到这里，我们认为在当前这个时刻，可以开始创建线程来执行任务
        */
         
        // worker 是否已经启动
        boolean workerStarted = false;
        // 是否已将这个 worker 添加到 workers 这个 HashSet 中
        boolean workerAdded = false;
        Worker w = null;
        try {
           // 把 firstTask 传给 worker 的构造方法
            w = new Worker(firstTask);
            // 取 worker 中的线程对象，Worker的构造方法会调用 ThreadFactory 来创建一个新的线程
            final Thread t = w.thread;
            if (t != null) {
               //先加锁
                final ReentrantLock mainLock = this.mainLock;
                // 这个是整个类的全局锁，持有这个锁才能让下面的操作“顺理成章”，
                // 因为关闭一个线程池需要这个锁，至少我持有锁的期间，线程池不会被关闭
                mainLock.lock();
                try {
                    // Recheck while holding lock.
                    // Back out on ThreadFactory failure or if
                    // shut down before lock acquired.
                    int rs = runStateOf(ctl.get());

                    // 小于 SHUTTDOWN 即 RUNNING
                    // 如果等于 SHUTDOWN，不接受新的任务，但是会继续执行等待队列中的任务
                    if (rs < SHUTDOWN ||
                        (rs == SHUTDOWN && firstTask == null)) {
                        // worker 里面的 thread 不能是已启动的
                        if (t.isAlive()) // precheck that t is startable
                            throw new IllegalThreadStateException();
                        // 加到 workers 这个 HashSet 中
                        workers.add(w);
                        int s = workers.size();
                        if (s > largestPoolSize)
                            largestPoolSize = s;
                        workerAdded = true;
                    }
                } finally {
                    mainLock.unlock();
                }
               // 若添加成功
                if (workerAdded) {
                    // 启动线程
                    t.start();
                    workerStarted = true;
                }
            }
        } finally {
            // 若线程没有启动，做一些清理工作，若前面 workCount 加了 1，将其减掉
            if (! workerStarted)
                addWorkerFailed(w);
        }
        // 返回线程是否启动成功
        return workerStarted;
    }
```
看下  `addWorkFailed` 
![workers 中删除掉相应的 worker,workCount 减 1
private void addWor](https://upload-images.jianshu.io/upload_images/4685968-77abdc7bff21cca6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![记录 workers 中的个数的最大值,因为 workers 是不断增加减少的，通过这个值可以知道线程池的大小曾经达到的最大值](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzA4XzQ2ODU5NjgtMDc4NDcyYjY4MmZjYzljZC5wbmc?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUzNjMzXzQ2ODU5NjgtMzNmNTE0NTc3ZTk3ZGMzNS5wbmc?x-oss-process=image/format,png)




`worker` 中的线程 `start` 后，其 `run` 方法会调用 `runWorker `
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyODgwXzQ2ODU5NjgtYTAwOWJjMDJhMjI0ZGNlMi5wbmc?x-oss-process=image/format,png)
继续往下看 `runWorker`
```
//  worker 线程启动后调用,while 循环(即自旋!)不断从等待队列获取任务并执行
//  worker 初始化时，可指定 firstTask，那么第一个任务也就可以不需要从队列中获取
final void runWorker(Worker w) {
    Thread wt = Thread.currentThread();
    // 该线程的第一个任务(若有)
    Runnable task = w.firstTask;
    w.firstTask = null;
    // 允许中断
    w.unlock(); 
 
    boolean completedAbruptly = true;
    try {
        // 循环调用 getTask 获取任务
        while (task != null || (task = getTask()) != null) {
            w.lock();          
            // 若线程池状态大于等于 STOP，那么意味着该线程也要中断
              /**
               * 若线程池STOP，请确保线程 已被中断
               * 如果没有，请确保线程未被中断
               * 这需要在第二种情况下进行重新检查，以便在关中断时处理shutdownNow竞争
               */
            if ((runStateAtLeast(ctl.get(), STOP) ||
                 (Thread.interrupted() &&
                  runStateAtLeast(ctl.get(), STOP))) &&
                !wt.isInterrupted())
                wt.interrupt();
            try {
                // 这是一个钩子方法，留给需要的子类实现
                beforeExecute(wt, task);
                Throwable thrown = null;
                try {
                    // 到这里终于可以执行任务了
                    task.run();
                } catch (RuntimeException x) {
                    thrown = x; throw x;
                } catch (Error x) {
                    thrown = x; throw x;
                } catch (Throwable x) {
                    // 这里不允许抛出 Throwable，所以转换为 Error
                    thrown = x; throw new Error(x);
                } finally {
                    // 也是一个钩子方法，将 task 和异常作为参数，留给需要的子类实现
                    afterExecute(task, thrown);
                }
            } finally {
                // 置空 task，准备 getTask 下一个任务
                task = null;
                // 累加完成的任务数
                w.completedTasks++;
                // 释放掉 worker 的独占锁
                w.unlock();
            }
        }
        completedAbruptly = false;
    } finally {
        // 到这里，需要执行线程关闭
        // 1. 说明 getTask 返回 null，也就是说，这个 worker 的使命结束了，执行关闭
        // 2. 任务执行过程中发生了异常
        //    第一种情况，已经在代码处理了将 workCount 减 1，这个在 getTask 方法分析中说
        //    第二种情况，workCount 没有进行处理，所以需要在 processWorkerExit 中处理
        processWorkerExit(w, completedAbruptly);
    }
}
```
看看 `getTask() `
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA2MjUvNTA4ODc1NV8xNTYxNDczODUyNzgwXzQ2ODU5NjgtNWU5NDc3MzE5M2Q5Y2Y0OS5wbmc?x-oss-process=image/format,png)
```
// 此方法有三种可能
// 1. 阻塞直到获取到任务返回。默认 corePoolSize 之内的线程是不会被回收的，它们会一直等待任务
// 2. 超时退出。keepAliveTime 起作用的时候，也就是如果这么多时间内都没有任务，那么应该执行关闭
// 3. 如果发生了以下条件，须返回 null
//     池中有大于 maximumPoolSize 个 workers 存在(通过调用 setMaximumPoolSize 进行设置)
//     线程池处于 SHUTDOWN，而且 workQueue 是空的，前面说了，这种不再接受新的任务
//     线程池处于 STOP，不仅不接受新的线程，连 workQueue 中的线程也不再执行
private Runnable getTask() {
    boolean timedOut = false; // Did the last poll() time out?

   for (;;) {
   // 允许核心线程数内的线程回收，或当前线程数超过了核心线程数，那么有可能发生超时关闭
 
            // 这里 break，是为了不往下执行后一个 if (compareAndDecrementWorkerCount(c))
            // 两个 if 一起看：如果当前线程数 wc > maximumPoolSize，或者超时，都返回 null
            // 那这里的问题来了，wc > maximumPoolSize 的情况，为什么要返回 null？
            // 换句话说，返回 null 意味着关闭线程。
            // 那是因为有可能开发者调用了 setMaximumPoolSize 将线程池的 maximumPoolSize 调小了
        
            // 如果此 worker 发生了中断，采取的方案是重试
            // 解释下为什么会发生中断，这个读者要去看 setMaximumPoolSize 方法，
            // 如果开发者将 maximumPoolSize 调小了，导致其小于当前的 workers 数量，
            // 那么意味着超出的部分线程要被关闭。重新进入 for 循环，自然会有部分线程会返回 null
            int c = ctl.get();
            int rs = runStateOf(c);

            // Check if queue empty only if necessary.
            if (rs >= SHUTDOWN && (rs >= STOP || workQueue.isEmpty())) {
                // CAS 操作，减少工作线程数
                decrementWorkerCount();
                return null;
            }

            int wc = workerCountOf(c);

            // Are workers subject to culling?
            boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;

            if ((wc > maximumPoolSize || (timed && timedOut))
                && (wc > 1 || workQueue.isEmpty())) {
                if (compareAndDecrementWorkerCount(c))
                    return null;
                continue;
            }

            try {
                Runnable r = timed ?
                    workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS) :
                    workQueue.take();
                if (r != null)
                    return r;
                timedOut = true;
            } catch (InterruptedException retry) {
            // 如果此 worker 发生了中断，采取的方案是重试
            // 解释下为什么会发生中断，这个读者要去看 setMaximumPoolSize 方法，
            // 如果开发者将 maximumPoolSize 调小了，导致其小于当前的 workers 数量，
            // 那么意味着超出的部分线程要被关闭。重新进入 for 循环，自然会有部分线程会返回 null
                timedOut = false;
            }
        }
}
```
到这里，基本上也说完了整个流程，回到 execute(Runnable command) 方法，看看各个分支，我把代码贴过来一下：
```
/**
     * Executes the given task sometime in the future.  The task
     * may execute in a new thread or in an existing pooled thread.
     *
     * If the task cannot be submitted for execution, either because this
     * executor has been shutdown or because its capacity has been reached,
     * the task is handled by the current {@code RejectedExecutionHandler}.
     *
     * @param command the task to execute
     * @throws RejectedExecutionException at discretion of
     *         {@code RejectedExecutionHandler}, if the task
     *         cannot be accepted for execution
     * @throws NullPointerException if {@code command} is null
     */
    public void execute(Runnable command) {
        if (command == null)
            throw new NullPointerException();
        /*
         * Proceed in 3 steps:
         *
         * 1. If fewer than corePoolSize threads are running, try to
         * start a new thread with the given command as its first
         * task.  The call to addWorker atomically checks runState and
         * workerCount, and so prevents false alarms that would add
         * threads when it shouldn't, by returning false.
         *
         * 2. If a task can be successfully queued, then we still need
         * to double-check whether we should have added a thread
         * (because existing ones died since last checking) or that
         * the pool shut down since entry into this method. So we
         * recheck state and if necessary roll back the enqueuing if
         * stopped, or start a new thread if there are none.
         *
         * 3. If we cannot queue task, then we try to add a new
         * thread.  If it fails, we know we are shut down or saturated
         * and so reject the task.
         */
        //表示 “线程池状态” 和 “线程数” 的整数
        int c = ctl.get();
        // 如果当前线程数少于核心线程数，直接添加一个 worker 执行任务，
        // 创建一个新的线程，并把当前任务 command 作为这个线程的第一个任务(firstTask)
        if (workerCountOf(c) < corePoolSize) {
        // 添加任务成功，即结束
        // 执行的结果，会包装到 FutureTask 
        // 返回 false 代表线程池不允许提交任务
            if (addWorker(command, true))
                return;
           
            c = ctl.get();
        }

        // 到这说明，要么当前线程数大于等于核心线程数，要么刚刚 addWorker 失败
  
        // 如果线程池处于 RUNNING ，把这个任务添加到任务队列 workQueue 中
        if (isRunning(c) && workQueue.offer(command)) {
            /* 若任务进入 workQueue，我们是否需要开启新的线程
             * 线程数在 [0, corePoolSize) 是无条件开启新线程的
             * 若线程数已经大于等于 corePoolSize，则将任务添加到队列中，然后进到这里
             */
            int recheck = ctl.get();
            // 若线程池不处于 RUNNING ，则移除已经入队的这个任务，并且执行拒绝策略
            if (! isRunning(recheck) && remove(command))
                reject(command);
            // 若线程池还是 RUNNING ，且线程数为 0，则开启新的线程
            // 这块代码的真正意图：担心任务提交到队列中了，但是线程都关闭了
            else if (workerCountOf(recheck) == 0)
                addWorker(null, false);
        }
        // 若 workQueue 满，到该分支
        // 以 maximumPoolSize 为界创建新 worker，
        // 若失败，说明当前线程数已经达到 maximumPoolSize，执行拒绝策略
        else if (!addWorker(command, false))
            reject(command);
    }
```
**工作线程**:线程池创建线程时,会将线程封装成工作线程Worker,Worker在执行完任务后,还会循环获取工作队列里的任务来执行.我们可以从Worker类的run()方法里看到这点

```
  public void run() {
        try {
            Runnable task = firstTask;
            firstTask = null;
            while (task != null || (task = getTask()) != null) {
                runTask(task);
                task = null;
            }
        } finally {
            workerDone(this);
        }
    }
 boolean workerStarted = false;
        boolean workerAdded = false;
        Worker w = null;
        try {
            w = new Worker(firstTask);

            final Thread t = w.thread;
            if (t != null) {
               //先加锁
                final ReentrantLock mainLock = this.mainLock;
                mainLock.lock();
                try {
                    // Recheck while holding lock.
                    // Back out on ThreadFactory failure or if
                    // shut down before lock acquired.
                    int rs = runStateOf(ctl.get());

                    if (rs < SHUTDOWN ||
                        (rs == SHUTDOWN && firstTask == null)) {
                        if (t.isAlive()) // precheck that t is startable
                            throw new IllegalThreadStateException();
                        workers.add(w);
                        int s = workers.size();
                        if (s > largestPoolSize)
                            largestPoolSize = s;
                        workerAdded = true;
                    }
                } finally {
                    mainLock.unlock();
                }
                if (workerAdded) {
                    t.start();
                    workerStarted = true;
                }
            }
        } finally {
            if (! workerStarted)
                addWorkerFailed(w);
        }
        return workerStarted;
    }
```
线程池中的线程执行任务分两种情况
 - 在execute()方法中创建一个线程时,会让这个线程执行当前任务
 - 这个线程执行完上图中 1 的任务后,会反复从BlockingQueue获取任务来执行

# 线程池的使用

##  向线程池提交任务
 可以使用两个方法向线程池提交任务
###  execute()
用于提交不需要返回值的任务,所以无法判断任务是否被线程池执行成功.通过以下代码可知execute()方法输入的任务是一个Runnable类的实例.
```
    threadsPool.execute(new Runnable() {
            @Override
            public void run() {
                   // TODO Auto-generated method stub
            }
        });
```
从运行结果可以看出，单线程池中的线程是顺序执行的。固定线程池（参数为2）中，永远最多只有两个线程并发执行。缓存线程池中，所有线程都并发执行。 
第二个例子，测试单线程调度线程池和固定调度线程池。

```
public class ScheduledThreadPoolExam {
    public static void main(String[] args) {
        //first test for singleThreadScheduledPool
        ScheduledExecutorService scheduledPool = Executors.newSingleThreadScheduledExecutor();
        //second test for scheduledThreadPool
//        ScheduledExecutorService scheduledPool = Executors.newScheduledThreadPool(2);
        for (int i = 0; i < 5; i++) {
            scheduledPool.schedule(new TaskInScheduledPool(i), 0, TimeUnit.SECONDS);
        }
        scheduledPool.shutdown();
    }
}

class TaskInScheduledPool implements Runnable {
    private final int id;

    TaskInScheduledPool(int id) {
        this.id = id;
    }

    @Override
    public void run() {
        try {
            for (int i = 0; i < 5; i++) {
                System.out.println("TaskInScheduledPool-["+id+"] is running phase-"+i);
                TimeUnit.SECONDS.sleep(1);
            }
            System.out.println("TaskInScheduledPool-["+id+"] is over");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```
从运行结果可以看出，单线程调度线程池和单线程池类似，而固定调度线程池和固定线程池类似。 
总结：

- 如果没有特殊要求，使用缓存线程池总是合适的；
- 如果只能运行一个线程，就使用单线程池。
- 如果要运行调度任务，则按需使用调度线程池或单线程调度线程池
- 如果有其他特殊要求，则可以直接使用ThreadPoolExecutor类的构造函数来创建线程池，并自己给定那五个参数。

###  submit()
用于提交需要返回值的任务.线程池会返回一个future类型对象,通过此对象可以判断任务是否执行成功
并可通过get()获取返回值,get()会阻塞当前线程直到任务完成,而使用get（long timeout，TimeUnit unit）方法则会阻塞当前线程一段时间后立即返回,这时候可能任务没有执行完.

```
    Future<Object> future = executor.submit(harReturnValuetask);
        try {
            Object s = future.get();
        } catch (InterruptedException e) {
            // 处理中断异常
        } catch (ExecutionException e) {
            // 处理无法执行任务异常
        } finally {
            // 关闭线程池
            executor.shutdown();
        }
```
##  关闭线程池
可通过调用线程池的**shutdown**或**shutdownNow**方法来关闭线程池.
它们的原理是遍历线程池中的工作线程,然后逐个调用线程的**interrupt**方法来中断线程,所以无法响应中断的任务可能永远无法终止.
但是它们存在一定的区别

 - **shutdownNow**首先将线程池的状态设置成STOP,然后尝试停止所有的正在执行或暂停任务的线程,并返回等待执行任务的列表
 - **shutdown**只是将线程池的状态设置成SHUTDOWN状态，然后中断所有没有正在执行任务的线程.

只要调用了这两个关闭方法中的任意一个,isShutdown方法就会返回true.
当所有的任务都已关闭后,才表示线程池关闭成功,这时调用isTerminaed方法会返回true.
至于应该调用哪一种方法,应该由提交到线程池的任务的特性决定,通常调用shutdown方法来关闭线程池,若任务不一定要执行完,则可以调用shutdownNow方法.

##  合理配置

要想合理地配置线程池,就必须首先

### 分析任务特性

可从以下几个角度来分析
 - 任务的性质：CPU密集型任务、IO密集型任务和混合型任务
 - 任务的优先级：高、中和低
 - 任务的执行时间：长、中和短
 - 任务的依赖性：是否依赖其他系统资源，如数据库连接。

### 任务性质
可用不同规模的线程池分开处理

#### CPU密集型任务(计算型任务)
应配置尽可能小的线程,配置
 ` N(CPU)+1 `或 `N(CPU) * 2`

#### I/O密集型任务
相对比计算型任务，需多一些线程，根据具体 I/O 阻塞时长考量

> 如Tomcat中默认最大线程数: 200。

也可考虑根据需要在一个最小数量和最大数量间自动增减线程数。

业务读取较多,线程并不是一直在执行任务,则应配置尽可能多的线程
`N(CPU)/1 - 阻塞系数(0.8~0.9)`

一般,生产环境下,CPU使用率达到80,说明被充分利用

#### 混合型的任务
如果可以拆分,将其拆分成一个CPU密集型任务和一个IO密集型任务,只要这两个任务执行的时间相差不是太大,那么分解后执行的吞吐量将高于串行执行的吞吐量.如果这两个任务执行时间相差太大,则没必要进行分解.

可以通过Runtime.getRuntime().availableProcessors()方法获得当前设备的CPU个数.

优先级不同的任务可以使用PriorityBlockingQueue处理.它可以让优先级高
的任务先执行.

> 注意　如果一直有优先级高的任务提交到队列里,那么优先级低的任务可能永远不能执行

执行时间不同的任务可以交给不同规模的线程池来处理,或者可以使用优先级队列,让执行时间短的任务先执行.

依赖数据库连接池的任务,因为线程提交SQL后需要等待数据库返回结果,等待的时间越长,则CPU空闲时间就越长,那么线程数应该设置得越大,这样才能更好地利用CPU.

**建议使用有界队列**  有界队列能增加系统的稳定性和预警能力，可以根据需要设大一点,比如几千.
假如系统里后台任务线程池的队列和线程池全满了,不断抛出抛弃任务的异常,通过排查发现是数据库出现了问题,导致执行SQL变得非常缓慢,因为后台任务线程池里的任务全是需要向数据库查询和插入数据的,所以导致线程池里的工作线程全部阻塞,任务积压在线程池里.
如果我们设置成无界队列,那么线程池的队列就会越来越多,有可能会撑满内存,导致整个系统不可用,而不只是后台任务出现问题.
## 2.5　线程池的监控
如果在系统中大量使用线程池,则有必要对线程池进行监控,方便在出现问题时,可以根据线程池的使用状况快速定位问题.可通过线程池提供的参数进行监控,在监控线程池的时候可以使用以下属性:

 - taskCount：线程池需要执行的任务数量
 - completedTaskCount：线程池在运行过程中已完成的任务数量，小于或等于taskCount。
 - largestPoolSize：线程池里曾经创建过的最大线程数量.通过这个数据可以知道线程池是否曾经满过.如该数值等于线程池的最大大小,则表示线程池曾经满过.
 - getPoolSize：线程池的线程数量.如果线程池不销毁的话,线程池里的线程不会自动销毁，所以这个大小只增不减.
 - getActiveCount：获取活动的线程数.

通过扩展线程池进行监控.可以通过继承线程池来自定义线程池,重写线程池的
beforeExecute、afterExecute和terminated方法,也可以在任务执行前、执行后和线程池关闭前执行一些代码来进行监控.例如,监控任务的平均执行时间、最大执行时间和最小执行时间等.
这几个方法在线程池里是空方法.

```
protected void beforeExecute(Thread t, Runnable r) { }
```
## 2.6 线程池的状态 
1.当线程池创建后，初始为 running 状态 
2.调用 shutdown 方法后，处 shutdown 状态，此时不再接受新的任务，等待已有的任务执行完毕 
3.调用 shutdownnow 方法后，进入 stop 状态，不再接受新的任务，并且会尝试终止正在执行的任务。 
4.当处于 shotdown 或 stop 状态，并且所有工作线程已经销毁，任务缓存队列已清空，线程池被设为 terminated 状态。 

# 总结
## java 线程池有哪些关键属性？
- corePoolSize 到 maximumPoolSize 之间的线程会被回收，当然 corePoolSize 的线程也可以通过设置而得到回收（allowCoreThreadTimeOut(true)）。
- workQueue 用于存放任务，添加任务的时候，如果当前线程数超过了 corePoolSize，那么往该队列中插入任务，线程池中的线程会负责到队列中拉取任务。
- keepAliveTime 用于设置空闲时间，如果线程数超出了 corePoolSize，并且有些线程的空闲时间超过了这个值，会执行关闭这些线程的操作
- rejectedExecutionHandler 用于处理当线程池不能执行此任务时的情况，默认有抛出 RejectedExecutionException 异常、忽略任务、使用提交任务的线程来执行此任务和将队列中等待最久的任务删除，然后提交此任务这四种策略，默认为抛出异常。
##线程池中的线程创建时机？
- 如果当前线程数少于 corePoolSize，那么提交任务的时候创建一个新的线程，并由这个线程执行这个任务；
- 如果当前线程数已经达到 corePoolSize，那么将提交的任务添加到队列中，等待线程池中的线程去队列中取任务；
- 如果队列已满，那么创建新的线程来执行任务，需要保证池中的线程数不会超过 maximumPoolSize，如果此时线程数超过了 maximumPoolSize，那么执行拒绝策略。

## 任务执行过程中发生异常怎么处理？
如果某个任务执行出现异常，那么执行任务的线程会被关闭，而不是继续接收其他任务。然后会启动一个新的线程来代替它。

## 什么时候会执行拒绝策略？
- workers 的数量达到了 corePoolSize，任务入队成功，以此同时线程池被关闭了，而且关闭线程池并没有将这个任务出队，那么执行拒绝策略。这里说的是非常边界的问题，入队和关闭线程池并发执行，读者仔细看看 execute 方法是怎么进到第一个 reject(command) 里面的。
- workers 的数量大于等于 corePoolSize，准备入队，可是队列满了，任务入队失败，那么准备开启新的线程，可是线程数已经达到 maximumPoolSize，那么执行拒绝策略。

# 参考
- 《码出高效》

- 《Java并发编程的艺术》