# 1. 在线程中执行任务
##1.1 串行的执行任务
这是最经典的一个最简单的Socket server的例子，服务器的资源利用率非常低，因为单线程在等待I/O操作完成时，CPU处于空闲状态。从而阻塞了当前请求的延迟，还彻底阻止了其他等待中的请求被处理。
```
public class SingleThreadWebServer {
    public static void main(String[] args) throws IOException {
        ServerSocket socket = new ServerSocket(80);
        while (true) {
            Socket connection = socket.accept();
            handleRequest(connection);
        }
    }

    private static void handleRequest(Socket connection) {
        // request-handling logic here
    }
}
```
##1.2 显式地为任务创建线程
任务处理从主线程中分离出来，主循环可以快速等待下一个连接，提高响应性。同时任务可以并行处理了，吞吐量也提高了。
```java
public class ThreadPerTaskWebServer {
    public static void main(String[] args) throws IOException {
        ServerSocket socket = new ServerSocket(80);
        while (true) {
            final Socket connection = socket.accept();
            Runnable task = new Runnable() {
                public void run() {
                    handleRequest(connection);
                }
            };
            new Thread(task).start();
        }
    }
    private static void handleRequest(Socket connection) {
        // request-handling logic here
    }
}
```
##1.3 无限制创建线程的不足
- 线程的生命周期开销非常高
- 资源消耗。大量的空闲线程占用内存，给GC带来压力，同时线程数量过多，竞争CPU资源开销太大。
稳定性。容易引起GC问题，甚至OOM
#2  Executor框架
任务就是一组逻辑工作单元（unit of work），而线程则是使任务异步执行的机制。

Executor接口，是代替Thread来做异步执行的入口，接口虽然简单，却为非常灵活强大的异步任务执行框架提供了基础。
提供了一种标准的方法将任务的提交与执行过程解耦，并用Runnable（无返回时）或者Callable（有返回值）表示任务。

Executor基于生产者-消费者模式
提交任务/执行任务分别相当于生产者/消费者,通常是最简单的实现生产者-消费者设计的方式了

##2.1 基于Executor改造后的样例如下
![](http://upload-images.jianshu.io/upload_images/4685968-1f600dab8e78cc3b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
将请求处理任务的提交与任务的实际执行解耦,并且只需采用另一种不同的Executor实现,就可以改变服务器的行为,其影响远远小于修改任务提交方式带来的影响
##2.2 执行策略
这一节主要介绍做一个Executor框架需要靠那些点？

在什么线程中执行任务？
任务按照什么顺序执行？FIFO/LIFO/优先级
有多少个任务可以并发执行？
队列中允许多少个任务等待？
如果系统过载了要拒绝一个任务，那么选择拒绝哪一个？如何通知客户端任务被拒绝了？
在执行任务过程中能不能有些别的动作before/after或者回调？
各种执行策略都是一种资源管理工具，最佳的策略取决于可用的计算资源以及对服务质量的要求。

因此每当看到
new Thread(runnable).start();
并且希望有一种灵活的执行策略的时候，请考虑使用Executor来代替
##2.3 线程池
在线程池中执行任务比为每个任务分配一个线程优势明显：

重用线程，减少开销。
延迟低，线程是等待任务到达。
最大化挖掘系统资源以及保证稳定性。CPU忙碌但是又不会出现线程竞争资源而耗尽内存或者失败的情况。
Executors可以看做一个工厂，提供如下几种Executor的创建：
```java
newCachedThreadPool
newFixedThreadPool
newSingleThreadExecutor
newScheduledThreadPool
```
##2.4 Executor的生命周期
为解决执行服务的生命周期问题,Executor扩展了ExecutorService接口,添加了一些用于生命周期管理的方法
![](http://upload-images.jianshu.io/upload_images/4685968-d8f5761de7cb23f9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

一个优雅停止的例子：
![](http://upload-images.jianshu.io/upload_images/4685968-218fcddabcf94772.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
增加生命周期扩展Web服务器的功能
- 调用stop
- 客户端请求形式

关闭
##2.5 延迟任务与周期任务
使用Timer的弊端在于
- 如果某个任务执行时间过长，那么将破坏其他TimerTask的定时精确性(执行所有定时任务时只会创建一个线程),只支持基于绝对时间的调度机制,所以对系统时钟变化敏感
- TimerTask抛出未检查异常后就会终止定时线程(不会捕获异常)

更加合理的做法是使用ScheduledThreadPoolExecutor,只支持基于相对时间的调度
它是DelayQueue的应用场景
# 3 找出可利用的并行性
##3.1 携带结果的任务Callable和Future
Executor框架支持Runnable，同时也支持Callable(它将返回一个值或者抛出一个异常)
在Executor框架中，已提交但是尚未开始的任务可以取消，但是对于那些已经开始执行的任务，只有他们能响应中断时，才能取消。
Future非常实用，他的API如下
![](http://upload-images.jianshu.io/upload_images/4685968-5ae3dabd24462546.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
内部get的阻塞是靠LockSupport.park来做的，在任务完成后Executor回调finishCompletion方法会依次唤醒被阻塞的线程。

ExecutorService的submit方法接受Runnable和Callable，返回一个Future。ThreadPoolExecutor框架留了一个口子，子类可以重写newTaskFor来决定创建什么Future的实现，默认是FutureTask类。
##3.2  示例：使用Future实现页面的渲染器
![](http://upload-images.jianshu.io/upload_images/4685968-1e87b014583e01ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##3.3 CompletionService: Executor与BlockingQueue
计算完成后FutureTask会调用done方法，而CompletionService集成了FutureTask，对于计算完毕的结果直接放在自己维护的BlockingQueue里面，这样上层调用者就可以一个个take或者poll出来。
![](http://upload-images.jianshu.io/upload_images/4685968-c19070c09477a763.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 3.3 示例：使用CompletionService提高渲染性能

```
void renderPage(CharSequence source) {
        final List<ImageInfo> info = scanForImageInfo(source);
        CompletionService<ImageData> completionService =
                new ExecutorCompletionService<ImageData>(executor);
        for (final ImageInfo imageInfo : info)
            completionService.submit(new Callable<ImageData>() {
                public ImageData call() {
                    return imageInfo.downloadImage();
                }
            });

        renderText(source);

        try {
            for (int t = 0, n = info.size(); t < n; t++) {
                Future<ImageData> f = completionService.take();
                ImageData imageData = f.get();
                renderImage(imageData);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (ExecutionException e) {
            throw launderThrowable(e.getCause());
        }
    }

```

#### [](#637-%E4%B8%BA%E4%BB%BB%E5%8A%A1%E8%AE%BE%E7%BD%AE%E6%97%B6%E9%99%90)6.3.7 为任务设置时限

Future的get支持timeout。

#### [](#638-%E6%89%B9%E9%87%8F%E6%8F%90%E4%BA%A4%E4%BB%BB%E5%8A%A1)6.3.8 批量提交任务

使用invokeAll方法提交`List<Callable>`，返回一个`List<Future>`
