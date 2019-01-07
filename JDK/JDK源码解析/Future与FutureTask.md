# 1 Future
Future 表示一个任务的生命周期，是一个可取消的异步运算。提供了相应的方法来判断任务状态（完成或取消），以及获取任务的结果和取消任务等。
适合具有可取消性和执行时间较长的异步任务。

并发包中许多异步任务类都继承自Future，其中最典型的就是 FutureTask

## 1.1 介绍
![](https://upload-images.jianshu.io/upload_images/4685968-0857aed817311722.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Future 表示异步计算的结果。它提供了检查计算是否完成的方法，以等待计算的完成，并获取计算的结果。
计算完成后只能使用` get `方法来获取结果，如有必要，计算完成前可以阻塞此方法。
取消则由 `cancel` 方法来执行。
还提供了其他方法，以确定任务是正常完成还是被取消了。
一旦计算完成，就不能再取消计算。
如果为了可取消性而使用 Future 但又不提供可用的结果，则可以声明 Future<?> 形式类型、并返回 null 作为底层任务的结果。

也就是说Future具有这样的特性
- 异步执行，可用 get 方法获取执行结果
- 如果计算还没完成，get 方法是会阻塞的，如果完成了，是可以多次获取并立即得到结果的
- 如果计算还没完成，是可以取消计算的
- 可以查询计算的执行状态

# 2 FutureTask

FutureTask 为 Future 提供了基础实现，如获取任务执行结果（get）和取消任务（cancel）等。如果任务尚未完成，获取任务执行结果时将会阻塞。一旦执行结束，任务就不能被重启或取消（除非使用`runAndReset`执行计算）。

FutureTask 常用来封装 Callable 和 Runnable，也可作为一个任务提交到线程池中执行。除了作为一个独立的类，此类也提供创建自定义 task 类使用。FutureTask 的线程安全由CAS保证。

FutureTask 内部维护了一个由`volatile`修饰的`int`型变量—`state`，代表当前任务的运行状态
![](https://upload-images.jianshu.io/upload_images/4685968-97655f663f4b14db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
*   NEW：新建
*   COMPLETING：完成
*   NORMAL：正常运行
*   EXCEPTIONAL：异常退出
*   CANCELLED：任务取消
*   INTERRUPTING：线程中断中
*   INTERRUPTED：线程已中断

在这七种状态中，有四种任务终止状态：NORMAL、EXCEPTIONAL、CANCELLED、INTERRUPTED。各种状态的转化如下：
![](https://upload-images.jianshu.io/upload_images/4685968-f080b652b4823926.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 数据结构及核心参数
![](https://upload-images.jianshu.io/upload_images/4685968-4eaea72991f9d694.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-cc194172c03f44ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```java
//内部持有的callable任务，运行完毕后置空
private Callable<V> callable;

//从get()中返回的结果或抛出的异常
private Object outcome; // non-volatile, protected by state reads/writes

//运行callable的线程,在 run 时进行 CAS 操作
private volatile Thread runner;

//使用Treiber栈保存等待线程
private volatile WaitNode waiters;
```
FutureTask 继承了`Runnale`和`Future`，本身也作为一个线程运行,可以提交给线程池执行。
维护了一个内部类`WaitNode`，使用简单的Treiber栈（无锁并发栈）实现，用于存储等待线程。
FutureTask 只有一个自定义的同步器 Sync 的属性，所有的方法都是委派给此同步器来实现。这也是JUC里使用AQS的通用模式。


# 源码解析
FutureTask 的同步器
由于Future在任务完成后，可以多次自由获取结果，因此，用于控制同步的AQS使用共享模式。

FutureTask 底层任务的执行状态保存在AQS的状态里。AQS是否允许线程获取（是否阻塞）是取决于任务是否执行完成，而不是具体的状态值。
```
private final class Sync extends AbstractQueuedSynchronizer {
    // 定义表示任务执行状态的常量。由于使用了位运算进行判断，所以状态值分别是2的幂。

    // 表示任务已经准备好了，可以执行
    private static final int READY     = 0;

    // 表示任务正在执行中
    private static final int RUNNING   = 1;

    // 表示任务已执行完成
    private static final int RAN       = 2;

    // 表示任务已取消
    private static final int CANCELLED = 4;


    // 底层的表示任务的可执行对象
    private final Callable<V> callable;

    // 表示任务执行结果，用于get方法返回。
    private V result;

    // 表示任务执行中的异常，用于get方法调用时抛出。
    private Throwable exception;

     /*
     * 用于执行任务的线程。在 set/cancel 方法后置为空，表示结果可获取。
     * 必须是 volatile的，用于确保完成后（result和exception）的可见性。
     * （如果runner不是volatile，则result和exception必须都是volatile的）
     */
    private volatile Thread runner;


     /**
     * 已完成或已取消 时成功获取
     */
    protected int tryAcquireShared( int ignore) {
        return innerIsDone() ? 1 : -1;
    }

    /**
     * 在设置最终完成状态后让AQS总是通知，通过设置runner线程为空。
     * 这个方法并没有更新AQS的state属性，
     * 所以可见性是通过对volatile的runner的写来保证的。
     */
    protected boolean tryReleaseShared( int ignore) {
        runner = null;
        return true;
    }


     // 执行任务的方法
    void innerRun() {
        // 用于确保任务不会重复执行
        if (!compareAndSetState(READY, RUNNING))
            return;

        // 由于Future一般是异步执行，所以runner一般是线程池里的线程。
        runner = Thread.currentThread();

        // 设置执行线程后再次检查，在执行前检查是否被异步取消
        // 由于前面的CAS已把状态设置RUNNING，
        if (getState() == RUNNING) { // recheck after setting thread
            V result;
            //
            try {
                result = callable.call();
            } catch (Throwable ex) {
                // 捕获任务执行过程中抛出的所有异常
                setException(ex);
                return;
            }
            set(result);
        } else {
      // 释放等待的线程
            releaseShared(0); // cancel
        }
    }

    // 设置结果
    void innerSet(V v) {
        // 放在循环里进行是为了失败后重试。
        for (;;) {
            // AQS初始化时，状态值默认是 0，对应这里也就是 READY 状态。
            int s = getState();

            // 已完成任务不能设置结果
            if (s == RAN)
                return;

            // 已取消 的任务不能设置结果
            if (s == CANCELLED) {
                // releaseShared 会设置runner为空，
                // 这是考虑到与其他的取消请求线程 竞争中断 runner
                releaseShared(0);
                return;
            }

            // 先设置已完成，免得多次设置
            if (compareAndSetState(s, RAN)) {
                result = v;
                releaseShared(0); // 此方法会更新 runner，保证result的可见性
                done();
                return;
            }
        }
    }

    // 获取异步计算的结果
    V innerGet() throws InterruptedException, ExecutionException {
        acquireSharedInterruptibly(0);// 获取共享，如果没有完成则会阻塞。

        // 检查是否被取消
        if (getState() == CANCELLED)
            throw new CancellationException();

        // 异步计算过程中出现异常
        if (exception != null)
            throw new ExecutionException(exception);

        return result;
    }

    // 取消执行任务
    boolean innerCancel( boolean mayInterruptIfRunning) {
        for (;;) {
            int s = getState();

            // 已完成或已取消的任务不能再次取消
            if (ranOrCancelled(s))
                return false;

            // 任务处于 READY 或 RUNNING
            if (compareAndSetState(s, CANCELLED))
                break;
        }
        // 任务取消后，中断执行线程
        if (mayInterruptIfRunning) {
            Thread r = runner;
            if (r != null)
                r.interrupt();
        }
        releaseShared(0); // 释放等待的访问结果的线程
        done();
        return true;
    }

    /**
     * 检查任务是否处于完成或取消状态
     */
    private boolean ranOrCancelled( int state) {
        return (state & (RAN | CANCELLED)) != 0;
    }

     // 其他方法省略
}
```
从 innerCancel 方法可知，取消操作只是改变了任务对象的状态并可能会中断执行线程。如果任务的逻辑代码没有响应中断，则会一直异步执行直到完成，只是最终的执行结果不会被通过get方法返回，计算资源的开销仍然是存在的。

总的来说，Future 是线程间协调的一种工具。

### AbstractExecutorService.submit(Callable<T> task)

FutureTask 内部实现方法都很简单，先从线程池的`submit`分析。`submit`方法默认实现在`AbstractExecutorService`，几种实现源码如下：
![](https://upload-images.jianshu.io/upload_images/4685968-68b9d862b491752d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```java
public Future<?> submit(Runnable task) {
    if (task == null) throw new NullPointerException();
    RunnableFuture<Void> ftask = newTaskFor(task, null);
    execute(ftask);
    return ftask;
}
public <T> Future<T> submit(Runnable task, T result) {
    if (task == null) throw new NullPointerException();
    RunnableFuture<T> ftask = newTaskFor(task, result);
    execute(ftask);
    return ftask;
}
public <T> Future<T> submit(Callable<T> task) {
    if (task == null) throw new NullPointerException();
    RunnableFuture<T> ftask = newTaskFor(task);
    execute(ftask);
    return ftask;
}
protected <T> RunnableFuture<T> newTaskFor(Runnable runnable, T value) {
    return new FutureTask<T>(runnable, value);
}
public FutureTask(Runnable runnable, V result) {
    this.callable = Executors.callable(runnable, result);
    this.state = NEW;       // ensure visibility of callable
}

```
首先调用`newTaskFor`方法构造`FutureTask`，然后调用`execute`把任务放进线程池中，返回`FutureTask`

#### FutureTask.run()
![](https://upload-images.jianshu.io/upload_images/4685968-18d51e170fe206db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```java
public void run() {
    //新建任务，CAS替换runner为当前线程
    if (state != NEW ||
        !UNSAFE.compareAndSwapObject(this, runnerOffset,
                                     null, Thread.currentThread()))
        return;
    try {
        Callable<V> c = callable;
        if (c != null && state == NEW) {
            V result;
            boolean ran;
            try {
                result = c.call();
                ran = true;
            } catch (Throwable ex) {
                result = null;
                ran = false;
                setException(ex);
            }
            if (ran)
                set(result);//设置执行结果
        }
    } finally {
        // runner must be non-null until state is settled to
        // prevent concurrent calls to run()
        runner = null;
        // state must be re-read after nulling runner to prevent
        // leaked interrupts
        int s = state;
        if (s >= INTERRUPTING)
            handlePossibleCancellationInterrupt(s);//处理中断逻辑
    }
}

```
运行任务，如果任务状态为`NEW`状态，则利用`CAS`修改为当前线程。执行完毕调用`set(result)`方法设置执行结果。
`set(result)`源码如下
![](https://upload-images.jianshu.io/upload_images/4685968-f85add9ff47d62ac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
首先利用`cas`修改`state`状态为![](https://upload-images.jianshu.io/upload_images/4685968-20ab2573e2b9f2ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)设置返回结果，然后使用 lazySet（`UNSAFE.putOrderedInt`）的方式设置`state`状态为![](https://upload-images.jianshu.io/upload_images/4685968-976ce0a1f461b825.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
结果设置完毕后，调用`finishCompletion()`唤醒等待线程
![](https://upload-images.jianshu.io/upload_images/4685968-492c91e4c50716cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
private void finishCompletion() {
    for (WaitNode q; (q = waiters) != null;) {
        if (UNSAFE.compareAndSwapObject(this, waitersOffset, q, null)) {//移除等待线程
            for (;;) {//自旋遍历等待线程
                Thread t = q.thread;
                if (t != null) {
                    q.thread = null;
                    LockSupport.unpark(t);//唤醒等待线程
                }
                WaitNode next = q.next;
                if (next == null)
                    break;
                q.next = null; // unlink to help gc
                q = next;
            }
            break;
        }
    }
    //任务完成后调用函数，自定义扩展
    done();
    callable = null;        // to reduce footprint
}
```
回到`run`方法，如果在 run 期间被中断，此时需要调用`handlePossibleCancellationInterrupt`处理中断逻辑，确保任何中断（例如`cancel(true)`）只停留在当前`run`或`runAndReset`的任务中
![](https://upload-images.jianshu.io/upload_images/4685968-8cb34d01686bb1ae.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
private void handlePossibleCancellationInterrupt(int s) {
    //在中断者中断线程之前可能会延迟，所以我们只需要让出CPU时间片自旋等待
    if (s == INTERRUPTING)
        while (state == INTERRUPTING)
            Thread.yield(); // wait out pending interrupt
}
```
* * *
## FutureTask.runAndReset()
![](https://upload-images.jianshu.io/upload_images/4685968-398d635ccf4d8e2c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
`runAndReset`是 FutureTask另外一个任务执行的方法，它不会返回执行结果，而且在任务执行完之后会重置`stat`的状态为`NEW`，使任务可以多次执行。
`runAndReset`的典型应用是在 ScheduledThreadPoolExecutor 中，周期性的执行任务。
* * *
## FutureTask.get()
![](https://upload-images.jianshu.io/upload_images/4685968-45f39b6cf4cdc132.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
FutureTask 通过`get()`获取任务执行结果。
如果任务处于未完成的状态（`state <= COMPLETING`），就调用`awaitDone`等待任务完成。
任务完成后，通过`report`获取执行结果或抛出执行期间的异常。
![](https://upload-images.jianshu.io/upload_images/4685968-149b414c7a0f6334.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## awaitDone(boolean timed, long nanos)
![](https://upload-images.jianshu.io/upload_images/4685968-0795ecddc68db095.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
private int awaitDone(boolean timed, long nanos)
    throws InterruptedException {
    final long deadline = timed ? System.nanoTime() + nanos : 0L;
    WaitNode q = null;
    boolean queued = false;
    for (;;) {//自旋
        if (Thread.interrupted()) {//获取并清除中断状态
            removeWaiter(q);//移除等待WaitNode
            throw new InterruptedException();
        }

        int s = state;
        if (s > COMPLETING) {
            if (q != null)
                q.thread = null;//置空等待节点的线程
            return s;
        }
        else if (s == COMPLETING) // cannot time out yet
            Thread.yield();
        else if (q == null)
            q = new WaitNode();
        else if (!queued)
            //CAS修改waiter
            queued = UNSAFE.compareAndSwapObject(this, waitersOffset,
                                                 q.next = waiters, q);
        else if (timed) {
            nanos = deadline - System.nanoTime();
            if (nanos <= 0L) {
                removeWaiter(q);//超时，移除等待节点
                return state;
            }
            LockSupport.parkNanos(this, nanos);//阻塞当前线程
        }
        else
            LockSupport.park(this);//阻塞当前线程
    }
}

```
`awaitDone`用于等待任务完成，或任务因为中断或超时而终止。返回任务的完成状态。
1.  如果线程被中断，首先清除中断状态，调用`removeWaiter`移除等待节点，然后抛`InterruptedException`。`removeWaiter`源码如下：
![](https://upload-images.jianshu.io/upload_images/4685968-cc9aa7802cf52d23.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
private void removeWaiter(WaitNode node) {
    if (node != null) {
        node.thread = null;//首先置空线程
        retry:
        for (;;) {          // restart on removeWaiter race
            //依次遍历查找
            for (WaitNode pred = null, q = waiters, s; q != null; q = s) {
                s = q.next;
                if (q.thread != null)
                    pred = q;
                else if (pred != null) {
                    pred.next = s;
                    if (pred.thread == null) // check for race
                        continue retry;
                }
                else if (!UNSAFE.compareAndSwapObject(this, waitersOffset,q, s)) //cas替换
                    continue retry;
            }
            break;
        }
    }
}

```
2.  如果当前为结束态(`state>COMPLETING`),则根据需要置空等待节点的线程，并返回 Future 状态
3.  如果当前为正在完成(`COMPLETING`)，说明此时 Future 还不能做出超时动作，为任务让出CPU执行时间片
4.  如果`state`为`NEW`，先新建一个`WaitNode`，然后`CAS`修改当前`waiters`
5.  如果等待超时，则调用`removeWaiter`移除等待节点，返回任务状态；如果设置了超时时间但是尚未超时，则`park`阻塞当前线程
6.  其他情况直接阻塞当前线程
* * *

#### FutureTask.cancel(boolean mayInterruptIfRunning)

```
public boolean cancel(boolean mayInterruptIfRunning) {
    //如果当前Future状态为NEW，根据参数修改Future状态为INTERRUPTING或CANCELLED
    if (!(state == NEW &&
          UNSAFE.compareAndSwapInt(this, stateOffset, NEW,
              mayInterruptIfRunning ? INTERRUPTING : CANCELLED)))
        return false;
    try {    // in case call to interrupt throws exception
        if (mayInterruptIfRunning) {//可以在运行时中断
            try {
                Thread t = runner;
                if (t != null)
                    t.interrupt();
            } finally { // final state
                UNSAFE.putOrderedInt(this, stateOffset, INTERRUPTED);
            }
        }
    } finally {
        finishCompletion();//移除并唤醒所有等待线程
    }
    return true;
}

```

**说明**：尝试取消任务。如果任务已经完成或已经被取消，此操作会失败。
如果当前Future状态为`NEW`，根据参数修改Future状态为`INTERRUPTING`或`CANCELLED`。
如果当前状态不为`NEW`，则根据参数`mayInterruptIfRunning`决定是否在任务运行中也可以中断。中断操作完成后，调用`finishCompletion`移除并唤醒所有等待线程。

* * *
##示例
![](https://upload-images.jianshu.io/upload_images/4685968-ac4c4509dd7e34b6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-94a4fbbe88323fe8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 小结

本章重点：**FutureTask 结果返回机制，以及内部运行状态的转变**
