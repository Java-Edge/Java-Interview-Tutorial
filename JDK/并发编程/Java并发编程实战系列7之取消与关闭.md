JAVA媒体提供任务机制来安全的终止线程。但是它提供了中断（interruption），这是一种写作机制，能够使一个线程终止另外一个线程。

一般来说没人希望立即终止，因为必要时总要先清理再终止。

开发一个应用能够妥善处理失败、关闭、取消等过程非常重要也有挑战。

### [](#71-%E4%BB%BB%E5%8A%A1%E5%8F%96%E6%B6%88)7.1 任务取消

一定不要使用Thread.stop和suspend这些机制。

一种协作机制就是“标记位”。例如使用volatile类型的field来保存取消状态。

```
@ThreadSafe
public class PrimeGenerator implements Runnable {
    private static ExecutorService exec = Executors.newCachedThreadPool();

    @GuardedBy("this") private final List<BigInteger> primes
            = new ArrayList<BigInteger>();
    private volatile boolean cancelled;

    public void run() {
        BigInteger p = BigInteger.ONE;
        while (!cancelled) {
            p = p.nextProbablePrime();
            synchronized (this) {
                primes.add(p);
            }
        }
    }

    public void cancel() {
        cancelled = true;
    }

    public synchronized List<BigInteger> get() {
        return new ArrayList<BigInteger>(primes);
    }

    static List<BigInteger> aSecondOfPrimes() throws InterruptedException {
        PrimeGenerator generator = new PrimeGenerator();
        exec.execute(generator);
        try {
            SECONDS.sleep(1);
        } finally {
            generator.cancel();
        }
        return generator.get();
    }
}

```

##1.1 中断
下面的例子会出现死锁，线程根本不会停止
```
class BrokenPrimeProducer extends Thread {
    private final BlockingQueue<BigInteger> queue;
    private volatile boolean cancelled = false;

    BrokenPrimeProducer(BlockingQueue<BigInteger> queue) {
        this.queue = queue;
    }

    public void run() {
        try {
            BigInteger p = BigInteger.ONE;
            while (!cancelled)
                queue.put(p = p.nextProbablePrime());
        } catch (InterruptedException consumed) {
        }
    }

    public void cancel() {
        cancelled = true;
    }
}

```
interrupt 方法：中断目标线程。isInterrupted：返回目标线程的中断状态。静态的 interrupted方法：清除当前线程的中断状态，并返回它之前的值。大多数可中断的阻塞方法会在入口处检查中断状态


对中断操作（调用interrupt）的正确理解
他并不会真正的中断一个正在运行的线程，而只是发出中断请求，然后由线程在下一个合适的时候中断自己。比如，wait、sleep、
join等方法，当他们收到中断请求或开始执行时，发现某个已经被设置好的中断状态，则抛出异常interruptedException。 


每个线程都有一个boolean类型的中断状态。当调用Thread.interrupt方法时，该值被设置为true，Thread.interruptted可以恢复中断。

阻塞库方法，例如sleep和wait、join都会检查中断，并且发现中断则提前返回，他们会清楚中断状态，并抛出InterruptedException。

但是对于其他方法interrupt仅仅是传递了中断的请求消息，并不会使线程中断，需要由线程在下一个合适的时刻中断自己。

通常，用中断是取消的最合理的实现方式。

上面的例子的改进方法就是

```
public class PrimeProducer extends Thread {
    private final BlockingQueue<BigInteger> queue;

    PrimeProducer(BlockingQueue<BigInteger> queue) {
        this.queue = queue;
    }

    public void run() {
        try {
            BigInteger p = BigInteger.ONE;
            while (!Thread.currentThread().isInterrupted())
                queue.put(p = p.nextProbablePrime());
        } catch (InterruptedException consumed) {
            /* Allow thread to exit */
        }
    }

    public void cancel() {
        interrupt();
    }
}

```

#### [](#712-%E4%B8%AD%E6%96%AD%E7%AD%96%E7%95%A5)7.1.2 中断策略

发生了中断，需要尽快退出执行流程，并把中断信息传递给调用者，从而使调用栈中的上层代码可以采取进一步的操作。当然任务也可以不需要放弃所有操作，可以推迟处理中断清楚，知道某个时机。

#### [](#713-%E5%93%8D%E5%BA%94%E4%B8%AD%E6%96%AD)7.1.3 响应中断

*   传递异常
*   回复中断状态

```
public class NoncancelableTask {
    public Task getNextTask(BlockingQueue<Task> queue) {
        boolean interrupted = false;
        try {
            while (true) {
                try {
                    return queue.take();
                } catch (InterruptedException e) {
                    interrupted = true;
                    // fall through and retry
                }
            }
        } finally {
            if (interrupted)
                Thread.currentThread().interrupt();
        }
    }

    interface Task {
    }
}

```

#### [](#716-%E5%A4%84%E7%90%86%E4%B8%8D%E5%8F%AF%E4%B8%AD%E6%96%AD%E7%9A%84%E9%98%BB%E5%A1%9E)7.1.6 处理不可中断的阻塞

例如Socket I/O或者内置锁都不能响应中断，这时候该如何做才能终止他们呢？可以通过重写Thread.interrupt方法，例如加入close的逻辑。

### [](#72-%E5%81%9C%E6%AD%A2%E5%9F%BA%E4%BA%8E%E7%BA%BF%E7%A8%8B%E7%9A%84%E6%9C%8D%E5%8A%A1)7.2 停止基于线程的服务

#### [](#721-%E7%A4%BA%E4%BE%8B%E6%97%A5%E5%BF%97%E6%9C%8D%E5%8A%A1)7.2.1 示例：日志服务

#### [](#722-%E5%85%B3%E9%97%ADexecutorservice)7.2.2 关闭ExecutorService

#### [](#723-poison-pill)7.2.3 Poison Pill

例如CloseEvent机制或者POISON对象，来做特殊的识别，从而让程序自己处理停止操作，退出线程。

### [](#73-%E5%A4%84%E7%90%86%E9%9D%9E%E6%AD%A3%E5%B8%B8%E7%9A%84%E7%BA%BF%E7%A8%8B%E7%BB%88%E6%AD%A2)7.3 处理非正常的线程终止

### [](#74-jvm%E5%85%B3%E9%97%AD)7.4 JVM关闭

## [](#%E7%AC%AC8%E7%AB%A0-%E7%BA%BF%E7%A8%8B%E6%B1%A0%E7%9A%84%E4%BD%BF%E7%94%A8)第8章 线程池的使用

一个很好的[ThreadPoolExecutor源码分析文档](https://my.oschina.net/xionghui/blog/494698)

ThreadPoolExecutor UML图：

[![image](http://upload-images.jianshu.io/upload_images/4685968-77840b3322b97eca?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](https://camo.githubusercontent.com/c0809a89c8ec3367d66a4181e6ab39f380c8b2e8/687474703a2f2f6e656f72656d696e642e636f6d2f77702d636f6e74656e742f75706c6f6164732f323031362f30392f6a6176612d372d636f6e63757272656e742d6578656375746f72732d756d6c2d636c6173732d6469616772616d2d6578616d706c652e706e67) 

[![image](http://upload-images.jianshu.io/upload_images/4685968-4172f899bcf770d7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](https://camo.githubusercontent.com/6a87675bedf83eb673abb2c90025ebc35e52a584/687474703a2f2f6e656f72656d696e642e636f6d2f77702d636f6e74656e742f75706c6f6164732f323031362f30392f6a6176612d372d636f6e63757272656e742d636f6c6c656374696f6e732d756d6c2d636c6173732d6469616772616d2d6578616d706c652e706e67) 

[![image](http://upload-images.jianshu.io/upload_images/4685968-b0cc68de7aaba827?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](https://camo.githubusercontent.com/2c7da5881649bfadbae9dec00dd5b4c45ffdeb74/687474703a2f2f6e656f72656d696e642e636f6d2f77702d636f6e74656e742f75706c6f6164732f323031362f30392f6a6176612d372d636f6e63757272656e742d6675747572652d756d6c2d636c6173732d6469616772616d2d6578616d706c652e706e67)
