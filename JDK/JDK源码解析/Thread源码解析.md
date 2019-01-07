# 1 类注释
程序中执行的线程。JVM允许应用程序拥有多个并发运行的执行线程。

每个线程都有一个优先级。优先级高的线程优先于优先级低的线程执行。每个线程可能被标记为守护线程，也可能不被标记为守护线程。

当在某个线程中运行的代码创建一个新 Thread 对象时，新线程的优先级最初设置为创建线程的优先级，并且只有在创建线程是一个守护线程时，新线程才是守护线程。

当JVM启动时，通常有一个非守护的线程(它通常调用某个指定类的main方法)。JVM 继续执行线程，直到发生以下任何一种情况时停止:
- *Runtime* 类的 *exit* 方法已被调用，且安全管理器已允许执行退出操作（比如调用 Thread.interrupt 方法）
- 不是守护线程的所有线程都已死亡，要么从对 *run* 方法的调用返回，要么抛出一个在 *run* 方法之外传播的异常

每个线程都有名字，多个线程可能具有相同的名字，Thread 有的构造器如果没有指定名字，会自动生成一个名字。

# 2 线程的基本概念

## 2.1 线程的状态
源码中一共枚举了六种线程状态
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmNmM1MTkxOWQ4OA?x-oss-process=image/format,png)
- 线程的状态机
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmNmM1MWU0ZmY1OA?x-oss-process=image/format,png)
### 2.1.1 状态机说明
- `NEW` 表示线程创建成功，但还没有运行，在 `new Thread` 后，没有 `start` 前，线程的状态都是 `NEW`；
- 当调用`start()`，进入`RUNNABLE `，当前线程sleep()结束，其他线程join()结束，等待用户输入完毕，某个线程拿到对象锁，这些线程也将进入`RUNNABLE `
- 当线程运行完成、被打断、被中止，状态都会从 `RUNNABLE` 变成 `TERMINATED`
- 如果线程正好在等待获得 monitor lock 锁，比如在等待进入 synchronized 修饰的代码块或方法时，会从 `RUNNABLE` 转至 `BLOCKED`
- `WAITING` 和 `TIMED_WAITING` 类似，都表示在遇到 *Object#wait*、*Thread#join*、*LockSupport#park* 这些方法时，线程就会等待另一个线程执行完特定的动作之后，才能结束等待，只不过 `TIMED_WAITING` 是带有等待时间的

## 2.2 线程的优先级
优先级代表线程执行的机会的大小，优先级高的可能先执行，低的可能后执行，在 Java 源码中，优先级从低到高分别是 1 到 10，线程默认 new 出来的优先级都是 5，源码如下：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmNmM1MzA5OTRjOA?x-oss-process=image/format,png)
分别为最低，普通(默认优先级)，最大优先级


## 2.3 守护线程
创建的线程默认都是非守护线程。
- 创建守护线程时，需要将 Thread 的 daemon 属性设置成 true
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmNmM1NDQwYTc1NQ?x-oss-process=image/format,png)
守护线程的优先级很低，当 JVM 退出时，是不关心有无守护线程的，即使还有很多守护线程，JVM 仍然会退出。
在工作中，我们可能会写一些工具做一些监控的工作，这时我们都是用守护线程去做，这样即使监控抛出异常，也不会影响到业务主线程，所以 JVM 也无需关注监控是否正在运行，该退出就退出，所以对业务不会产生任何影响。

# 3 线程的初始化的两种方式
无返回值的线程主要有两种初始化方式：

## 3.1 继承 Thread
看下 start 方法的源码：
```java
    public synchronized void start() {
        /**
		 * 对于由VM创建/设置的主方法线程或“系统”组线程，不调用此方法。
		 * 将来添加到此方法中的任何新功能可能也必须添加到VM中。
		 * 
         * 零状态值对应于状态“NEW”。
         * 因此，如果没有初始化，直接抛异常
         */
        if (threadStatus != 0)
            throw new IllegalThreadStateException();

        /* 
         * 通知组此线程即将start，以便可以将其添加到组的线程列表中
         * 并且可以减少组的unstarted线程的计数
		 */
        group.add(this);

		// started 是个标识符，在处理一系列相关操作时，经常这么设计
        // 操作执行前前标识符是 false，执行完成后变成 true
        boolean started = false;
        try {
        	// 创建一个新的线程，执行完成后，新的线程已经在运行了，即 target 的内容已在运行
            start0();
            // 这里执行的还是 main 线程
            started = true;
        } finally {
            try {
                // 若失败，将线程从线程组中移除
                if (!started) {
                    group.threadStartFailed(this);
                }
            // Throwable 可以捕捉一些 Exception 捕捉不到的异常，比如子线程抛出的异常    
            } catch (Throwable ignore) {
                /* 
                 * 什么也不做。
                 * 如果start0抛出一个Throwable，那么它将被传递到调用堆栈
                 */
            }
        }
    }
    
    // 开启新线程使用的是 native 方法
	private native void start0();
```
注意上面提到的的`threadStatus`变量
用于工具的Java线程状态，初始化以指示线程“尚未启动”
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmNmM3MGE3M2MyYg?x-oss-process=image/format,png)
## 3.2 实现 Runnable 接口
这是实现 Runnable 的接口，并作为 Thread 构造器的入参，调用时我们使用了两种方式，可以根据实际情况择一而终
- 使用 start 会开启子线程来执行 run 里面的内容
- 使用 run 方法执行的还是主线程。

我们来看下 *run* 方法的源码：

- 不会新起线程，target 是 Runnable
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmNmM3ZmNiN2U3NA?x-oss-process=image/format,png)
源码中的 target 就是在 new Thread 时，赋值的 Runnable。

# 4 线程的初始化
线程初始化的源码有点长，我们只看比较重要的代码 (不重要的被我删掉了)，如下：

```java
// 无参构造器，线程名字自动生成
public Thread() {
    init(null, null, "Thread-" + nextThreadNum(), 0);
}
// g 代表线程组，线程组可以对组内的线程进行批量的操作，比如批量的打断 interrupt
// target 是我们要运行的对象
// name 我们可以自己传，如果不传默认是 "Thread-" + nextThreadNum()，nextThreadNum 方法返回的是自增的数字
// stackSize 可以设置堆栈的大小
private void init(ThreadGroup g, Runnable target, String name,
                  long stackSize, AccessControlContext acc) {
    if (name == null) {
        throw new NullPointerException("name cannot be null");
    }

    this.name = name.toCharArray();
    // 当前线程作为父线程
    Thread parent = currentThread();
    this.group = g;
    // 子线程会继承父线程的守护属性
    this.daemon = parent.isDaemon();
    // 子线程继承父线程的优先级属性
    this.priority = parent.getPriority();
    // classLoader
    if (security == null || isCCLOverridden(parent.getClass()))
        this.contextClassLoader = parent.getContextClassLoader();
    else
        this.contextClassLoader = parent.contextClassLoader;
    this.inheritedAccessControlContext =
            acc != null ? acc : AccessController.getContext();
    this.target = target;
    setPriority(priority);
    // 当父线程的 inheritableThreadLocals 的属性值不为空时
    // 会把 inheritableThreadLocals 里面的值全部传递给子线程
    if (parent.inheritableThreadLocals != null)
        this.inheritableThreadLocals =
            ThreadLocal.createInheritedMap(parent.inheritableThreadLocals);
    this.stackSize = stackSize;
    /* Set thread ID */
    // 线程 id 自增
    tid = nextThreadID();
}
```

从初始化源码中可以看到，很多属性，子线程都是直接继承父线程的，包括优先性、守护线程、inheritableThreadLocals 里面的值等等。

# 5 线程其他操作
## 5.1 join
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmNmM5OTFkZmVlMQ?x-oss-process=image/format,png) 
当前线程等待另一个线程执行死亡之后，才能继续操作。
```java
    public final synchronized void join(long millis)
    throws InterruptedException {
        long base = System.currentTimeMillis();
        long now = 0;

        if (millis < 0) {
            throw new IllegalArgumentException("timeout value is negative");
        }

        if (millis == 0) {
            while (isAlive()) {
                wait(0);
            }
        } else {
            while (isAlive()) {
                long delay = millis - now;
                if (delay <= 0) {
                    break;
                }
                wait(delay);
                now = System.currentTimeMillis() - base;
            }
        }
    }
```
等待最多 millis 毫秒以使该线程消失。 0 超时时间意味着永远等待。

此实现使用以 this.isAlive 为条件的 this.wait 调用循环。当线程终止时，将调用this.notifyAll方法。 建议应用程序不要在线程实例上使用 wait，notify 或 notifyAll。


## 5.2 yield
- 是个 native 方法
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmNmM5ZTIzYWUxNA?x-oss-process=image/format,png)

令当前线程做出让步，放弃当前 CPU，让 CPU 重新选择线程，避免线程长时占用 CPU。

在写 while 死循环时，预计短时间内 while 死循环可结束的话，可在其中使用 yield，防止 CPU 一直被占用。

> 让步不是绝不执行，即重新竞争时， CPU 可能还重新选中了自己。

## 5.3 sleep
根据系统计时器和调度器的精度和准确性，使当前执行的线程休眠(暂时停止执行)指定的毫秒数。但是注意，休眠期间线程并不会失去任何监视器的所有权。

### 毫秒的一个入参
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmNmNhMTIxYTA2MQ?x-oss-process=image/format,png)
native 方法
### 毫秒和纳秒的两个入参
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmNmNhNTU2YjNlNw?x-oss-process=image/format,png)
表示当前线程会沉睡多久，沉睡时不会释放锁资源，所以沉睡时，其它线程是无法得到锁的。最终调用的其实还是单参数的 sleep 方法。

## 5.4 interrupt
中断这个线程。

除非当前线程是中断自身(这是始终允许的)，否则将调用此线程的 checkAccess 方法，这可能导致抛 SecurityException。

如果这个线程被 Object 类的 wait(), wait(long), or wait(long, int) 方法或者 Thread 类的 join(), join(long), join(long, int), sleep(long), or sleep(long, int) 调用而阻塞，线程进入 `WAITING` 或 `TIMED_WAITING`状态，这时候打断这些线程，就会抛出 *InterruptedException* ，使线程的状态直接到 `TERMINATED`；

如果这个线程在一个InterruptibleChannel的I/O操作中被阻塞，主动打断当前线程，那么这个通道将被关闭，线程的中断状态将被设置，线程将收到一个ClosedByInterruptException。

如果这个线程在 Selector 中被阻塞，那么这个线程的中断状态将被设置，并且它将从选择的操作立即返回，可能带有一个非零值，就像调用了选择器的  wakeup 方法一样。

如果前面的条件都不成立，那么这个线程的中断状态将被设置。

中断非活动的线程不会有任何影响。

```java
    public void interrupt() {
        if (this != Thread.currentThread())
            checkAccess();

        synchronized (blockerLock) {
            Interruptible b = blocker;
            if (b != null) {
                interrupt0();           // Just to set the interrupt flag
                b.interrupt(this);
                return;
            }
        }
        interrupt0();
    }
```
- 最终调用的其实是该 native 方法
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmNmNhODIwMDQ5ZA?x-oss-process=image/format,png) 

## 5.5 interrupted
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzQvMTcxZGJmODA3OTMyMmYxNQ?x-oss-process=image/format,png) 

测试当前线程是否已被中断。 通过此方法可以清除线程的中断状态。 换句话说，如果要连续两次调用此方法，则第二个调用将返回false（除非在第一个调用清除了其中断状态之后且在第二个调用对其进行检查之前，当前线程再次被中断）。

由于此方法返回false，因此将反映线程中断，因为该线程在中断时尚未处于活动状态而被忽略。

## notifyAll
![](https://img-blog.csdnimg.cn/20200610152011147.png)
唤醒在等待该对象的监视器上的全部线程。 线程通过调用的一个对象的监视器上等待wait的方法。
被唤醒的线程将无法继续进行，直到当前线程放弃此对象的锁。 被唤醒的线程将在与可能，积极争相此对象上进行同步的任何其他线程通常的方式竞争; 例如，唤醒的线程享受成为下一个线程锁定这个对象没有可靠的特权或劣势。
此方法只能由一个线程，它是此对象监视器的所有者被调用。 看到notify了，其中一个线程能够成为监视器所有者的方法的描述方法。

## notify
唤醒在此对象监视器上等待的单个线程。 如果任何线程此对象上等待，它们中的一个被选择为被唤醒。 选择是任意的，并在执行的自由裁量权发生。 线程通过调用的一个对象的监视器上等待wait的方法。
唤醒的线程将无法继续进行，直到当前线程放弃此对象的锁。 被唤醒的线程将在与可能，积极争相此对象上进行同步的任何其他线程通常的方式竞争; 例如，唤醒的线程在享有作为一个线程锁定这个对象没有可靠的特权或劣势。
此方法只能由一个线程，它是此对象监视器的所有者被调用。 线程成为三种方式之一的对象监视器的所有者：
通过执行对象的同步实例方法。
通过执行体synchronized的对象上进行同步的语句。
对于类型的对象Class,通过执行该类的同步静态方法。
一次只能有一个线程拥有对象的监视器


## wait
导致当前线程等待，直到其他线程调用notify()方法或notifyAll()此对象的方法。 
换句话说，此方法的行为就好像它简单地执行呼叫wait(0)
当前线程必须拥有该对象的监视器。 这款显示器并等待线程释放所有权，直到另一个线程通知等候在这个对象监视器上的通过调用要么醒来的notify方法或notifyAll方法。 该线程将等到重新获得对监视器的所有权后才能继续执行。
如在一个参数的版本，中断和杂散唤醒是可能的，而且这种方法应该总是在一个循环中使用：

```java
   synchronized (obj) {
       while (<condition does not hold>)
           obj.wait();
       ... // Perform action appropriate to condition
   }
```
       
此方法只能由一个线程，它是此对象监视器的所有者被调用。 看到notify了，其中一个线程能够成为监视器所有者的方法的描述方法

# 6 总结
本文主要介绍了线程的一些常用概念、状态、初始化方式和操作，这些知识是工作及面试中必备的，也是后面理解高级并发编程的基础。