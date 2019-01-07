# 1 引导语
研究源码，一般我们都从整体以及实例先入手，再研究细节，不至于一开始就“深陷其中而"当局者迷".
本文，我们来看最后一种有返回值的线程创建方式。

- 使用继承方式的好处是方便传参，可以在子类里面添加成员变量,通过 set 方法设置参数或者通过构造函数进行传递
- 使用 Runnable 方式，则只能使用主线程里面被声明为 final 变量

不好的地方是 Java 不支持多继承，如果继承了 Thread 类，那么子类不能再继承其他 ，而 Runable接口则没有这个限制 。而且 Thread 类和 Runnable 接口都不允许声明检查型异常，也不能定义返回值。没有返回值这点稍微有点麻烦。前两种方式都没办法拿到任务的返回结果，但今天的主角 FutureTask 却可以.

不能声明抛出检查型异常则更麻烦一些。run()方法意味着必须捕获并处理检查型异常。即使小心地保存了异常信息（在捕获异常时）以便稍后检查，但也不能保证这个 Runnable 对象的所有使用者都读取异常信息。你也可以修改Runnable实现的getter，让它们都能抛出任务执行中的异常。但这种方法除了繁琐也不是十分安全可靠，你不能强迫使用者调用这些方法，程序员很可能会调用join()方法等待线程结束然后就不管了。

但是现在不用担心了，以上的问题终于在1.5中解决了。Callable接口和Future接口的引入以及他们对线程池的支持优雅地解决了这两个问题。
# 2 案例
先看一个demo，了解 FutureTask 相关组件是如何使用的
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177167250_20200207221638996.png)
CallerTask 类实现了 Callable 接口的 call() 方法 。在 main 函数内首先创建FutrueTask对 象(构造函数为 CallerTask 实例), 然后使用创建的 FutureTask 作为任务创建了一个线程并且启动它， 最后通过 futureTask.get()等待任务执行完毕并返回结果.


# 3 Callable
Callable函数式接口定义了唯一方法 - call().
我们可以在Callable的实现中声明强类型的返回值，甚至是抛出异常。同时，利用call()方法直接返回结果的能力，省去读取值时的类型转换。
- 源码定义

![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166645_20200202204204222.png)
注意到返回值是一个泛型，使用的时候，不会直接使用 Callable，而是和 FutureTask 协同.

# 4 Future
- Callable 可以返回线程的执行结果，在获取结果时，就需要用到 Future 接口.
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166920_2020020404000733.png)

Future是 Java5 中引入的接口，当提交一个Callable对象给线程池时，将得到一个Future对象，并且它和传入的Callable有相同的结果类型声明。

它取代了Java5 前直接操作 Thread 实例的做法。以前,不得不用Thread.join()或者Thread.join(long millis)等待任务完成.


Future表示异步计算的结果。提供了一些方法来检查计算是否完成，等待其完成以及检索计算结果。
只有在计算完成时才可以使用get方法检索结果，必要时将其阻塞，直到准备就绪为止。取消是通过cancel方法执行的。提供了其他方法来确定任务是正常完成还是被取消。一旦计算完成，就不能取消计算。

如果出于可取消性的目的使用`Future`而不提供可用的结果，则可以声明`Future <？>`形式的类型，并作为基础任务的结果返回null。

## 4.1 Future API
### 4.1.1 cancel - 尝试取消执行任务
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166678_20200204021910125.png)
一个比较复杂的方法,当任务处于不同状态时,该方法有不同响应:
- 任务 已经完成 / 已经取消 / 由于某些其他原因无法被取消,该尝试会直接失败
- 尝试成功,且此时任务尚未开始，调用后是可以取消成功的
- 任务已经开始,则 *mayInterruptIfRunning* 参数确定是否可以中断执行该任务的线程以尝试停止该任务。


此方法返回后，对  *isDone* 的后续调用将始终返回 true.
如果此方法返回 true，则随后对 *isCancelled* 的调用将始终返回 true.

### 4.1.2 isCancelled - 是否被取消
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166834_20200204030356935.png)
如果此任务在正常完成之前被取消，则返回true.

### 4.1.3 isDone - 是否完成
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166574_20200204031005488.png)
如果此任务完成，则返回true.

完成可能是由于正常终止，异常或取消引起的，在所有这些情况下，此方法都将返回true.

### 4.1.4 get - 获取结果
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166906_20200204031206355.png)
等待任务完成，然后获取其结果.

- 如果任务被取消，抛 *CancellationException* 
- 如果当前线程在等待时被中断，抛 *InterruptedException* 
- 如果任务抛出了异常,抛 *ExecutionException*

### 4.1.5 timed get - 超时获取
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166633_20200204033827757.png)
必要时最多等待给定时间以完成任务，然后获取其结果（如果有的话）。
- 抛CancellationException 如果任务被取消
- 抛 ExecutionException 如果任务抛了异常
- 抛InterruptedException 如果当前线程在等待时被中断
- 抛TimeoutException 如果等待超时了

需要注意：这两个get()方法都是阻塞式的，如果被调用的时候，任务还没有执行完，那么调用get()方法的线程会阻塞，直到任务执行完才会被唤醒。

Future 接口定义了许多对任务进行管理的 API,极大地方便了我们的开发调控.

# 5 RunnableFuture
Java6 时提供的持有 Runnable 性质的 Future.

成功执行run方法导致Future的完成，并允许访问其结果.

RunnableFuture接口比较简单，就是继承了 Runnable 和 Future 接口。只提供一个*run*方法
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166916_20200204040234735.png)

现在,我们应该都知道,创建任务有两种方式
- 无返回值的 Runnable
- 有返回值的 Callable

但这样的设计,对于其他 API 来说并不方便，没办法统一接口.

所以铺垫了这么多,本文的主角 FutureTask 来了!

# 6 FutureTask
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166599_20200202205335307.png)
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166947_2020020822421346.png)
前面的Future是一个接口，而 FutureTask 才是一个实实在在的工具类,是线程运行的具体任务.
- 实现了 RunnableFuture 接口
- 也就是实现了 Runnnable 接口,即FutureTask 本身就是个 Runnnable
- 也表明了 FutureTask 实现了 Future,具备对任务进行管理的功能

## 6.1 属性
### 6.1.1 运行状态
最初为`NEW`。 运行状态仅在*set*，*setException*和*cancel*方法中转换为最终状态。 
在完成期间，状态可能会呈现`COMPLETING`（正在设置结果时）或`INTERRUPTING`（仅在中断运行任务去满足cancel（true）时）的瞬态值。 
从这些中间状态到最终状态的转换使用更加低价的有序/惰性写入，因为值是唯一的，无法进一步修改。


- 注意这些常量字段的定义方式,遵循避免魔鬼数字的编程规约.
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166888_20200208134956145.png)

-  NEW
线程任务创建,开始状态
- COMPLETING
任务执行中,正在运行状态
- NORMAL
任务执行结束
- EXCEPTIONAL
任务异常
- CANCELLED
任务取消成功
- INTERRUPTING
任务正在被打断中
- INTERRUPTED  = 6
任务被打断成功

#### 可能的状态转换
- NEW -> COMPLETING -> NORMAL
- NEW -> COMPLETING -> EXCEPTIONAL
- NEW -> CANCELLED
- NEW -> INTERRUPTING -> INTERRUPTED

### 6.1.2 其他属性
- 组合的 callable,这样就具备了转化 Callable 和 Runnable 的功能
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166847_20200208224034754.png)
- 从ge()返回或抛出异常的结果,非volatile，受状态读/写保护
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166563_20200208224343646.png)
- 运行 callable 的线程； 在run()期间进行CAS
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166792_20200208225457376.png)
- 记录调用 get 方法时被等待的线程 - 栈形式
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166629_20200208225735719.png)
从属性上我们明显看到 Callable 是作为 FutureTask 的属性之一，这也就让 FutureTask 接着我们看下 FutureTask 的构造器，看看两者是如何转化的。

## 6.2 构造方法
### 6.2.1 Callable 参数
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177167128_20200208230222486.png)
### 6.2.2 Runnable 参数
为协调 callable 属性,辅助result 参数

Runnable 是没有返回值的，所以 result 一般没有用，置为 null 即可,正如 JDK 所推荐写法
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166870_20200208231510310.png)
![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166970_20200208230336221.png)
-  Executors.callable 方法负责将 runnable 适配成 callable.
 ![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177166714_20200208232051246.png)
 - 通过转化类 RunnableAdapter进行适配
 ![](https://uploadfiles.nowcoder.com/files/20200208/5088755_1581177167314_20200208232211616.png)

### 6.2.3 小结
我们可以学习这里的适配器模式，目标是要把 Runnable 适配成 Callable，那么我们首先要实现 Callable 接口，并且在 Callable 的 call 方法里面调用被适配对象即 Runnable的方法即可.

下面,让我们看看对 Future 接口方法的具体实现.
## 6.3 get
我们来看限时阻塞的 get 方法，源码如下：

```java
public V get(long timeout, TimeUnit unit)
    throws InterruptedException, ExecutionException, TimeoutException {
    if (unit == null)
        throw new NullPointerException();
    int s = state;
    // 任务已经在执行中了，并且等待一定时间后，仍在执行中，直接抛异常
    if (s <= COMPLETING &&
        (s = awaitDone(true, unit.toNanos(timeout))) <= COMPLETING)
        throw new TimeoutException();
    // 任务完成，返回执行结果
    return report(s);
}
```
等待任务执行完成
```java
private int awaitDone(boolean timed, long nanos)
    throws InterruptedException {
    // 计算等待终止时间，如果一直等待的话，终止时间为 0
    final long deadline = timed ? System.nanoTime() + nanos : 0L;
    WaitNode q = null;
    // 不排队
    boolean queued = false;
    // 无限循环
    for (;;) {
        // 如果线程已经被打断了，删除，抛异常
        if (Thread.interrupted()) {
            removeWaiter(q);
            throw new InterruptedException();
        }
        // 当前任务状态
        int s = state;
        // 当前任务已经执行完了，返回
        if (s > COMPLETING) {
            // 当前任务的线程置空
            if (q != null)
                q.thread = null;
            return s;
        }
        // 如果正在执行，当前线程让出 cpu，重新竞争，防止 cpu 飙高
        else if (s == COMPLETING) // cannot time out yet
            Thread.yield();
            // 如果第一次运行，新建 waitNode，当前线程就是 waitNode 的属性
        else if (q == null)
            q = new WaitNode();
            // 默认第一次都会执行这里，执行成功之后，queued 就为 true，就不会再执行了
            // 把当前 waitNode 当做 waiters 链表的第一个
        else if (!queued)
            queued = UNSAFE.compareAndSwapObject(this, waitersOffset,
                                                 q.next = waiters, q);
            // 如果设置了超时时间，并过了超时时间的话，从 waiters 链表中删除当前 wait
        else if (timed) {
            nanos = deadline - System.nanoTime();
            if (nanos <= 0L) {
                removeWaiter(q);
                return state;
            }
            // 没有过超时时间，线程进入 TIMED_WAITING 状态
            LockSupport.parkNanos(this, nanos);
        }
        // 没有设置超时时间，进入 WAITING 状态
        else
            LockSupport.park(this);
    }
}
```

get 是一种阻塞式方法,当发现任务还在进行中，没有完成时，就会阻塞当前进程，等待任务完成后再返回结果值.
阻塞底层使用的是 LockSupport.park 方法，使当前线程进入 `WAITING` 或 `TIMED_WAITING` 态.

## 6.4 run
该方法可被直接调用,也可由线程池调用

```java
public void run() {
    // 状态非 NEW 或当前任务已有线程在执行，直接返回
    if (state != NEW ||
        !UNSAFE.compareAndSwapObject(this, runnerOffset,
                                     null, Thread.currentThread()))
        return;
    try {
        Callable<V> c = callable;
        // Callable 非空且已 NEW
        if (c != null && state == NEW) {
            V result;
            boolean ran;
            try {
                // 真正执行业务代码的地方
                result = c.call();
                ran = true;
            } catch (Throwable ex) {
                result = null;
                ran = false;
                setException(ex);
            }
            // 给 outcome 赋值,这样 Future.get 方法执行时，就可以从 outCome 中取值
            if (ran)
                set(result);
        }
    } finally {
        runner = null;
        int s = state;
        if (s >= INTERRUPTING)
            handlePossibleCancellationInterrupt(s);
    }
}
```

run 方法我们再说明几点：

run 方法是没有返回值的，通过给 outcome 属性赋值（set(result)），get 时就能从 outcome 属性中拿到返回值；
FutureTask 两种构造器，最终都转化成了 Callable，所以在 run 方法执行的时候，只需要执行 Callable 的 call 方法即可，在执行 c.call() 代码时，如果入参是 Runnable 的话， 调用路径为 c.call() -> RunnableAdapter.call() -> Runnable.run()，如果入参是 Callable 的话，直接调用。
## 6.5 cancel

```java
// 取消任务，如果正在运行，尝试去打断
public boolean cancel(boolean mayInterruptIfRunning) {
    if (!(state == NEW &&//任务状态不是创建 并且不能把 new 状态置为取消，直接返回 false
          UNSAFE.compareAndSwapInt(this, stateOffset, NEW,
              mayInterruptIfRunning ? INTERRUPTING : CANCELLED)))
        return false;
    // 进行取消操作，打断可能会抛出异常，选择 try finally 的结构
    try {    // in case call to interrupt throws exception
        if (mayInterruptIfRunning) {
            try {
                Thread t = runner;
                if (t != null)
                    t.interrupt();
            } finally { // final state
                //状态设置成已打断
                UNSAFE.putOrderedInt(this, stateOffset, INTERRUPTED);
            }
        }
    } finally {
        // 清理线程
        finishCompletion();
    }
    return true;
}
```

# 7 总结
FutureTask 统一了 Runnnable 和 Callable，方便了我们后续对线程池的使用.