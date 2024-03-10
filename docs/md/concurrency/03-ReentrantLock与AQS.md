# 03-ReentrantLock与AQS.md
## JUC 中 AQS 结构

JUC 包中提供的锁有：

- ReentrantLock 重入锁
- ReentrantReadWriteLock 读写锁
- StampedLock 重入读写锁，JDK1.8 引入

而 AQS 也就是 AbstractQueuedSynchronized，是一个同步器，是 JUC 的基础工具类

接下来 ReentrantLock 加锁需要使用到 AQS，因此这里先对 AQS 整体框架做一个介绍， **具体的 AQS 一些方法操作** ，会在下边讲解 ReentrantLock 的时候介绍！

### AQS 数据结构

```java
// AQS 队列头结点
private transient volatile Node head;

// AQS 队列阻塞尾节点
private transient volatile Node tail;

// 当前锁的状态，0：没有被占用，大于 0 代表有线程持有当前锁
// 当 state > 1 时，表锁被重入了，每次重入都加上 1
private volatile int state;

// 代表当前持有独占锁的线程
private transient Thread exclusiveOwnerThread;
```

![image-20240223185212511](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240223185212511.png)







### AQS 的 state 状态

AQS 的 state 状态代表锁是否被占用

- 如果 AQS 的 state 状态为 0 表示当前锁没有被占用

- 如果 AQS 的 state 状态 > 0 表示当前锁被占用

**为什么 > 0 是被占用呢？** 

因为可能会发生锁的重入，每次重入会给 state + 1

**线程通过 CAS 抢占锁**

那么线程来抢占锁，就是通过 CAS 来更新 state 状态，由 0 更改为 1，才算抢锁成功

当没有抢到锁的线程，会被封装为 Node 节点进入 AQS 的队列等待，该节点是由前边一个节点来进行 `唤醒` 的



### AQS 中 Node 的数据结构

AQS 中的 Node 就是对线程的封装，等待锁的线程封装为 Node 进入队列排队，数据结构如下：

```java
// 当前节点的等待状态
volatile int waitStatus;
// 前继指针
volatile Node prev;
// 后继指针
volatile Node next;
// 当前节点中的线程
volatile Thread thread;
// Condition Queue 中的内容，这里不介绍
Node nextWaiter;
```

![image-20240224113855628](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240224113855628.png)



waitStatus 的状态有以下几个，各自的含义不同：

```JAVA
/***********waitStatus 的取值定义***********/
// 表示此线程取消了争抢这个锁请求
static final int CANCELLED =  1;
// 官方的描述是，其表示当前node的后继节点对应的线程需要被唤醒
static final int SIGNAL    = -1;
// 表示节点在等待队列中，节点线程等待唤醒
static final int CONDITION = -2;
// 当前线程处在SHARED情况下，该字段才会使用
static final int PROPAGATE = -3;
```



### AQS 的作用

上边说了 AQS 是 JUC 的基础工具类，ReentrantLock 就是基于 AQS 来写的

那么我们也可以基于 AQS 来实现一个同步工具，如下 Lock 来源为美团技术团队案例代码：

```java
public class LeeLock  {

    private static class Sync extends AbstractQueuedSynchronizer {
        @Override
        protected boolean tryAcquire (int arg) {
            return compareAndSetState(0, 1);
        }

        @Override
        protected boolean tryRelease (int arg) {
            setState(0);
            return true;
        }

        @Override
        protected boolean isHeldExclusively () {
            return getState() == 1;
        }
    }
    
    private Sync sync = new Sync();
    
    public void lock () {
        sync.acquire(1);
    }
    
    public void unlock () {
        sync.release(1);
    }
}
```



同步工具使用：

```java
public class LeeMain {

    static int count = 0;
    static LeeLock leeLock = new LeeLock();

    public static void main (String[] args) throws InterruptedException {

        Runnable runnable = new Runnable() {
            @Override
            public void run () {
                try {
                    leeLock.lock();
                    for (int i = 0; i < 10000; i++) {
                        count++;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    leeLock.unlock();
                }

            }
        };
        Thread thread1 = new Thread(runnable);
        Thread thread2 = new Thread(runnable);
        thread1.start();
        thread2.start();
        thread1.join();
        thread2.join();
        System.out.println(count);
    }
}
```





## 深入了解 ReentrantLock 底层原理细节

**前言：**

本来写这篇文章是因为自己对 ReentrantLock 的了解一直都比较表面，原理了解的还不是那么的清楚，并且对 AQS 也都是一知半解，但是在面试中这些都是比较常问的内容，如果原理了解比较清楚的话，对面试会有很大的帮助，因此自己在这里也总结了一份，本来以为很快就写完了，没想到竟然写了两天，文字的话就有 6000 +，ReentrantLock 中大部分的内容也都说到了，并且配有许多图片，如果感觉内容太多的话，可以对 ReentrantLock 中加锁以及解锁内容重点阅读，希望对你有所帮助！

![image-20240224232547156](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240224232547156.png)



这里我们来讲一下 ReentrantLock 底层加锁的原理

其中 ReentrantLock 底层加锁主要是依靠于 AQS(AbstractQueuedSynchronizer) 来做的，AQS 是 JUC 包下的基础工具类

从名字就可以看出来 AQS 是一个同步器，用于 `管理多线程环境下获取锁` 的问题，接下来会介绍 **ReentrantLock 底层原理** 以及 **AQS 细节！**



### ReentrantLock 构造方法

看 ReentrantLock 的底层原理的话，从它的加锁方法入手：

```java
public class ReentrantLockDemo {
    public static void main(String[] args) {
        ReentrantLock lock = new ReentrantLock();
        lock.lock();
    }
}
```

先来简单看一下 ReentrantLock 的 `构造方法` ：

```java
public ReentrantLock() {
    sync = new NonfairSync();
}
public ReentrantLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
}
```

有两个构造方法：

- 默认的无参构造方法的话，将 `sync` 变量声明为了非公平锁
- 有参构造方法传入了 `boolean` 变量，如果是 True，则使用公平锁；如果是 False，则使用非公平锁

**sync 变量是什么？**

sync 变量是 Sync 其实就是在 ReentrantLock 中声明的静态类，继承自 `AbstractQueuedSynchronizer` 也就是 AQS

![image-20240223132118533](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240223132118533.png)

而在 ReentrantLock 的构造方法中声明的 `FairSync` 和 `NonfairSync` 也都是继承自 Sync 类

![image-20240223132229872](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240223132229872.png)

![image-20240223132321142](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240223132321142.png)

ReentrantLock 的 lock 上锁方法最终就是走到了这两个类中，关系图如下：

![image-20240223132707138](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240223132707138.png)





### ReentrantLock 非公平锁加锁原理

上边说完了 ReentrantLock 构造方法，接下来看一下加锁的流程是怎样的

先进入到了 ReentrantLock # lock() 方法：

```java
// ReentrantLock
public void lock() {
    sync.lock();
}
```

sync 是什么在上边我们已经说过了，直接跟随源码向下走，这里先说一下 `非公平锁` 的加锁流程（走到了 NonfairSync 类中）：

```java
// ReentrantLock # Sycn # NonfairSync # lock()
final void lock() {
    // CAS 操作抢锁
    if (compareAndSetState(0, 1))
        setExclusiveOwnerThread(Thread.currentThread());
    else
        acquire(1);
}
```

可以看到，在 lock() 方法中，主要有两个 if 分支：

- `compareAndSetState(0, 1)` 成功：这个 CAS 操作用来修改 AQS 队列中的 state 变量，从 0 修改为 1，表示当前线程要加锁了，CAS 成功之后，通过 `setExclusiveOwnerThread` 将当前线程设置到 AQS 中去
- `compareAndSetState(0, 1)` 失败：说明加锁失败，直接调用 acquire(1) 操作（之后会讲这个操作）

那么可以看到，如果 CAS 操作抢到锁之后，接下来就拿到锁了，可以执行同步代码块中的操作了

那么如果 `CAS 操作没有拿到锁` 的话，会进入到 acquire 方法中

- **接下来看一下 acquire() 方法**

上边说了，CAS 失败，说明当前线程没有抢到锁，也就是当前线程来 CAS 的时候，发现 state 本来的值不是 0，也就是说锁已经被持有了，那么就有两种情况了：

1、**锁的重入** ：发现是当前线程持有的锁，因此直接重入

2、**当前线程进入队列等待** ：发现是其他线程持有锁，因此进入队列等待获取锁

在 acquire 方法中，主要就做上边两件事情，代码如下：

```java
// AbstractQueuedSynchronized
// 方法使用 final 定义，无法重写
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```



那么在 acquire 中，有 4 个方法，接下来我们一个一个看这些方法是做什么的：

- **首先看 tryAcquire 方法**

tryAcquire 方法在 FairSync 和 NonFairSync 中都有实现，这里我们先看 NonFairSync 的实现：

```java
// NonFairSync
protected final boolean tryAcquire(int acquires) {
    return nonfairTryAcquire(acquires);
}
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        if (compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0) // overflow
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    return false;
}
```

可以看到，tryAcquire 最终调用了 `nonfairTryAcquire()` ，来看一下它的执行流程

首先通过 getState() 取出 AQS 队列的 state 状态值

如果 state == 0，说明锁没有被占用，于是通过 CAS 抢锁，抢到之后将持有锁线程设置为自己，是不是很熟悉呢？

在进入 `nonfairTryAcquire()` 之前其实就已经通过 CAS 抢锁失败了，但是这里再抢一次，万一其他线程已经释放了呢？

那么如果 current == getExclusiveOwnerThread() 的话，表明 `当前线程和持有锁的线程是同一个` ，那么直接重入就可以了，重入的次数在 AQS 的 state 值记录，可以看到，将 state + 1 即可

**如果 CAS 没抢到，并且不是重入的话，那就返回 false，这一次的 tryAcquire() 就算失败了，进入接下来的流程**



- **tryAcquire 失败之后，当前线程进入等待队列**

```java
// AbstractQueuedSynchronized
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

为了更方便大家观看，将 acquire 的代码重新贴一下，上边在 tryAcquire 中尝试加锁失败之后，接下来会执行 `acquireQueued(addWaiter(Node.EXCLUSIVE), arg)` 操作，这里我们看一下这两个方法

首先看一下 **addWaiter()** 这个方法：

```java
// AbstractQueuedSynchronized
private Node addWaiter(Node mode) {
        Node node = new Node(Thread.currentThread(), mode);
        Node pred = tail;
        if (pred != null) {
            node.prev = pred;
            if (compareAndSetTail(pred, node)) {
                pred.next = node;
                return node;
            }
        }
        enq(node);
        return node;
    }
```

在这个方法中，先将当前 Thread 给包装成了 Node 节点，目的就是向 AQS 中的队列中存放

判断 `if (pred != null)` ，说明 AQS 队列里的已经有节点了，也就是 AQS 队列已经被初始化过了，直接将当前 Node 加入到 AQS 队列去即可，分为了 3 步：

1、声明 pred 变量为 tail，让 node 的前继指针指向 pred

2、通过 CAS 将 AQS 中的 tail 指针指向 node（新加入的 node 节点作为 tail 存在）

3、CAS 成功后，让 pred 的后继指针指向 node

经过这样一通操作，我们刚入队的这个 node 节点就成为了 tail 节点加入到了 AQS 队列中，如下图：

![image-20240223204131694](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240223204131694.png)



如果 `pred == null` ，也就说明 AQS 的队列中，tail 指针没有指向元素， **也就是表明了 AQS 队列此时还没有初始化** ，接下来就通过 `enq(node)` 将 AQS 初始化并把这个 node 插入进去：

```java
// AbstractQueuedSynchronized
private Node enq(final Node node) {
    for (;;) {
        Node t = tail;
        // 没有初始化
        if (t == null) { 
            if (compareAndSetHead(new Node()))
                tail = head;
        } else {
            node.prev = t;
            if (compareAndSetTail(t, node)) {
                t.next = node;
                return t;
            }
        }
    }
}
```

在这个方法中，首先判断 `if (t == null)` 说明 AQS 中的队列都还没有初始化，因此这里初始化一下队列，**初始化操作为** ：创建一个节点，让 AQS 的 head 和 tail 两个指针都指向该节点

![image-20240224144548348](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240224144548348.png)

由于在 for 里是不停循环的，因此在初始化队列之后，就发现 `t != null` 了，因此就可以将 node 节点插入到 AQS 的队列后边去：

![image-20240223205341466](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240223205341466.png)

好，那么到这里，当前线程节点进入 AQS 的等待队列的操作就完成了，我们继续往下看

- **那么当前线程节点已经进入等待队列了，那么看一下接下来还会进行哪些操作？**

```java
// AbstractQueuedSynchronized
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

这里还是为了大家方便看，将 acquire 的代码继续贴出来

上边将 addWaiter() 方法讲完了，node 节点此时已经进入到了 AQS 的等待队列中，那么接下来肯定要将线程给挂起了！

这里我们继续看一下 `acquireQueued()` 方法：

```java
// AbstractQueuedSynchronized
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

在该方法中，先来看 for 循环，先取当前节点的前驱节点，如果前驱节点是头节点的话，那么就说明当前的线程节点已经是 AQS 队列中的第一个节点了，那么他就可以尝试去加锁了，因此这里再通过 tryAcquire 再抢一下锁试试（你可能已经忘了 tryAcquire 是做什么的了，其实就是 CAS 抢锁或者判断是否是重入锁）

如果 tryAcquire 抢到锁了之后，当前节点就没必要在 AQS 的队列中等待获取锁了，因此就将当前 node 节点从队列移除

这里删除当前 node 节点是通过 setHead() 方法删除了，其实就是让 AQS 队列的 Head 指针指向当前 node 节点，让当前的 node 节点作为虚拟头节点，再将原来的虚拟头节点的后继指针设置为空，因此这里注释中的 **`help GC` 其实指的是帮助原来虚拟头节点的 GC 回收** ，如下图：

![image-20240223222911607](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240223222911607.png)

上边说的是当前节点是 AQS 队列中第一个节点的情况，那么如果当前节点不是 AQS 队列中的第一个节点的话，就要走下边的这个逻辑了：

```java
// AbstractQueuedSynchronized
if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
```

首先要通过 `shouldParkAfterFailedAcquire() ` 方法判断当前 node 节点抢锁失败之后，应不应该被挂起？

**这里为什么要这样判断呢？** 

因为如果上一个线程拿到锁了之后，在释放锁时，要对当前线程进行唤醒操作，如果上一个线程的状态异常，无法对当前线程唤醒，那你直接把当前线程挂起岂不是要出问题了，直接看代码：

```java
// AbstractQueuedSynchronized
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
    int ws = pred.waitStatus;
    if (ws == Node.SIGNAL)
        return true;
        if (ws > 0) {
            do {
                node.prev = pred = pred.prev;
            } while (pred.waitStatus > 0);
            pred.next = node;
        } else {
            compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
        }
    return false;
}
```

判断上一个节点异常就是通过 waitStatus 来判断的，首先拿到当前节点的前继节点的 waitStatus，声明为 ws 变量，waitStatus 的取值都在 Node 类中定义了：

```java
// AbstractQueuedSynchronized # Node
/***********waitStatus 的取值定义***********/
// 表示此线程取消了争抢这个锁请求
static final int CANCELLED =  1;
// 官方的描述是，其表示当前node的后继节点对应的线程需要被唤醒
static final int SIGNAL    = -1;
// 表示节点在等待队列中，节点线程等待唤醒
static final int CONDITION = -2;
// 当前线程处在SHARED情况下，该字段才会使用
static final int PROPAGATE = -3;
```



如果 `ws == Node.SIGNAL` ，说明前继节点可以对当前节点进行唤醒，直接返回 true 就好了（官方对 Node.SIGNAL 的描述是，其表示当前node的后继节点对应的线程需要被唤醒）

如果 `ws > 0` ，那就说明前边的这个线程取消了争抢这个锁的请求，那么前边的节点肯定就无法对当前节点唤醒了，因此把前边状态异常的节点直接跳过就好了，找到一个状态为 `Node.SIGNAL` 的节点即可，如下图：

![image-20240223225351785](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240223225351785.png)

如果 `ws != Node.SIGNAL && ws <= 0` ， 这说明了前边节点的状态不是 Node.SIGNAL，因此要将前边节点的状态设置为 `SIGNAL` ，**表示前边的节点需要对它的后继节点进行唤醒操作！**

```java
// AbstractQueuedSynchronized
if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
```

这里将代码重复贴一下，上边通过 shouldParkAfterFailedAcquire 判断了当前线程节点是否可以被挂起

如果可以被挂起的话，就调用 `parkAndCheckInterrupt()` 进行挂起：

```java
// AbstractQueuedSynchronized
private final boolean parkAndCheckInterrupt() {
    LockSupport.park(this);
    return Thread.interrupted();
}
```

代码很简单，就是通过 `LockSupport.park()` 对当前线程挂起，**这里注意在线程挂起之后** ，就没有执行接下来的 Thread.interrupted() 方法了，这个方法就是返回线程的中断状态（这里先讲一下每个方法的作用，具体的 `线程唤醒流程` 可以往后看）

```java
// AbstractQueuedSynchronized
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

如上，到此为止在 acquire() 方法中的 if 条件就已经讲完了，这个 if 满足的话，就说明当前线程目前已经被挂起了，之后进入到 `selfInterrupt()` 方法

其实在上边 `parkAndCheckInterrupt()` 方法中，挂起当前线程之后还检测了当前线程的中断状态并返回，但是这个方法会清除掉线程的中断状态：

```java
Thread.interrupted();
```

因此，在 acquire() 的 if 判断都通过之后，需要调用 `selfInterrupt()` 再将中断标志重新设置给当前线程，如下：

```java
static void selfInterrupt() {
    Thread.currentThread().interrupt();
}
```



上边这两个 interrupt 方法的作用不同：

- **interrupt：** 是给线程设置中断标志
- **interrupted：** 是检测中断并清除中断状态



- **加锁流程总结**

到此为止，ReentrantLock 整个加锁的流程就已经说完了，上边的流程还是比较长的，因此这里再简化一下

1、首先，加锁无非就是公平锁和非公平锁，最总走到 FairSync 或者 UnFairSync 中的加锁方法

2、这里以非公平锁为例，首先就是 CAS 抢锁（通过 CAS 设置 AQS 的 state 值）

3、如果当前抢到锁，那就将 AQS 的持有锁线程设置为当前线程

4、如果没有抢到锁，就需要将当前线程包装成 Node 节点进入 AQS 队列中排队了

5、不过在排队之前，又尝试了 CAS 抢锁，并且判断了持有锁的线程是否是当前线程，实现了可重入的逻辑

6、如果还没抢到，当前线程的 Node 节点就进入到 AQS 排队了

7、那么由于当前线程进入队列中是需要挂起的，因此需要前边的节点对当前线程节点进行唤醒，因此需要保证当前线程前的节点可以唤醒当前线程，也就是判断前边的节点状态是否为 SIGNAL，将状态异常的节点直接跳过即可

8、那么保证了前边节点可以对当前线程唤醒之后，就可以将当前线程给挂起了，通过 LockSupport.park（接下来的流程，等待线程被唤醒之后，会继续执行）



看完加锁流程，应该对大部分的代码就已经比较熟悉了，那么加锁的流程已经讲过了，大家可以自己看一下 `解锁` 的过程，看看是否可以看懂，接下来会说一下解锁的流程！



### ReentrantLock 公平锁和非公平锁加锁的区别

上边说完了非公平锁的主干流程，将主干流程看完之后，其他的一些代码看起来应该难度不大

这里说一下非公平锁和公平锁的区别，其实只在 `tryAcquire` 方法中有不同的地方，这里只将不同的地方列了出来：

```java
/*---------------------公平锁的 tryAcquire()--------------------------*/
protected final boolean tryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        if (!hasQueuedPredecessors()/*公平锁于非公平锁不同的地方*/ &&
            compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
  // ...
}
/*---------------------非公平锁的 tryAcquire()--------------------------*/
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        if (compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    }
   	// ...
}
```



可以发现，在公平锁的 tryAcquire 方法上，只比非公平锁多了一个 `!hasQueuedPredecessors()` 方法

该方法是判断当前节点在队列中是否还有前继节点，如果有就返回 true；如果没有就返回 false

在公平锁中，要想 `!hasQueuedPredecessors() == true` ，必须 `hasQueuedPredecessors()` 返回 false，也就是当前节点在队列中没有前继节点，那么才可以通过 CAS 去抢锁，**以此来保证公平！**



### Node.CANCELLED 状态节点的产生

上边在讲加锁的流程，其实还有一个地方没有讲到，也就是产生 Node.CANCELLED 节点的操作没有说到，在 `acquireQueued` 方法中，如下：

```java
// AbstractQueuedSynchronized
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
// AbstractQueuedSynchronized
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

在 acquireQueued 方法中的 `finally 代码块` ，如果判断当前节点没有成功获取到锁，会调用 `cancelAcquire` 方法标记当前节点状态为 CANCELLED：

```java
private void cancelAcquire(Node node) {
    // 过滤掉无效的节点
    if (node == null)
        return;
    // 将节点上的线程清空
    node.thread = null;

    Node pred = node.prev;
    while (pred.waitStatus > 0)
        node.prev = pred = pred.prev;

    Node predNext = pred.next;

    node.waitStatus = Node.CANCELLED;

    // 分支1：当前节点是 tail 节点
    if (node == tail && compareAndSetTail(node, pred)) {
        compareAndSetNext(pred, predNext, null);
    } else {
        int ws;
        // 分支2：当前节点不是 head 指针的后驱节点，并且((前边节点的状态为 SIGNAL) || (前边节点的状态 <= 0 && 可以成功设置为 SIGNAL))
        if (pred != head &&
            ((ws = pred.waitStatus) == Node.SIGNAL ||
             (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) &&
            pred.thread != null) {
            Node next = node.next;
            if (next != null && next.waitStatus <= 0)
                compareAndSetNext(pred, predNext, next);
        } else {
            // 分支3：当前节点是 head 指针的后驱节点或者不满足分支 2 后边的条件
            unparkSuccessor(node);
        }

        node.next = node; // help GC
    }
}
```

接下来我们说一下这个方法中的流程：

首先先拿到当前节点的前驱节点，声明为 `pred` ，拿到后驱节点声明为 `predNext` ，并且将当前节点的 waitStatus 设置为 `Node.CANCELLED`

接下来就是 if 条件判断了，其实是有 3 个分支：

**先来看分支 1** ：如果当前节点是 tail 节点，那么要对当前节点进行取消的话，直接让 tail 指针指向前边的节点就可以了，并且让 `pred` 节点的 next 指针设置为空

![image-20240224212122611](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240224212122611.png)

**再来看分支 2：** 当前节点不是 head 指针的后驱节点，并且((前边节点的状态为 SIGNAL) || (前边节点的状态 <= 0 && 可以成功设置为 SIGNAL))，如果都成立，再判断前边节点的 thread 是否为空，不为空就进入该分支

那么此时通过 CAS 操作将前一个节点的 next 指针指向后一个节点（下图红线）

![image-20240224213118931](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240224213118931.png)

**在哪里修改了 predNext 节点的 prev 指针了呢？**

可以看到上边红线就是修改的地方，虽然将 pred 的 next 指针指向了 predNext，但是并没有将 predNext 指针指向 pred，那么在哪里将 predNext 的 prev 指针指向前边的正常节点呢？

```java
 private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
        int ws = pred.waitStatus;
        if (ws == Node.SIGNAL)
            return true;
        if (ws > 0) {
            do {
                // 修改 prev 指针，跳过 CALCELLED 状态的节点，指向正常节点
                node.prev = pred = pred.prev;
            } while (pred.waitStatus > 0);
            pred.next = node;
        } else {
            compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
        }
        return false;
    }
```

这里将 predNext 的 prev 指针修改放在了 shouldParkAfterFailedAcquire 方法中，如果 predNext 这个节点被唤醒，或者发生自旋都会执行 shouldParkAfterFailedAcquire 方法，在这里就会将自己的 prev 指针指向前边的正常节点，也就是 pred 节点，修改完之后，中间的 `待取消节点` 就被孤立起来了，之后会被 GC 掉

![image-20240224214424846](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240224214424846.png)





**最后走到分支 3 ：** 如果当前节点是是 Head 的后驱节点或者是分支 2 后边的条件没有满足（也就是查看当前节点前边的节点中不存在 `未取消状态的节点` ）

那么此时就要去唤醒当前节点的后驱节点了

**这里着重说一下这里为什么要去唤醒当前节点的后驱节点：** 

进入到这里，说明这个没有满足分支 2 的 if 语句，如下：

```java
// 分支 2
if (pred != head &&
            ((ws = pred.waitStatus) == Node.SIGNAL ||
             (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) &&
            pred.thread != null) {
```

1、首先 pred != head 和 pred.thraed == null 这两个条件如果都不满足，他的意思是前边就是头节点，并且当前节点都取消获取锁了，前边也没有线程拿锁，因此直接唤醒后边的线程节点去拿锁就好了

2、`((ws = pred.waitStatus) == Node.SIGNAL || (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL)))` 

如果这个条件 `不满足` ，说明前驱节点状态不是 SIGNAL，或者通过 CAS 将前驱节点状态设置为 SIGNAL 失败了

**compareAndSetWaitStatus 设置为 SIGNAL 失败** 是因为在高并发情况下，前驱节点突然释放锁了，导致去 CAS 时发现前驱节点状态发生改变，CAS 失败

那么在前驱节点突然释放锁了之后，会对当前节点进行唤醒，结果当前这个节点取消拿锁了，因此当前节点状态也不是 SIGNAL，无法对后边的节点唤醒，**因此这里手动对后边节点唤醒** 





### ReentrantLock 的解锁操作

解锁操作同样也很重要，解锁后会对后边的线程进行唤醒操作

还是从 unlock() 方法调用入手：

```java
public static void main(String[] args) {
    ReentrantLock lock = new ReentrantLock();
    lock.lock();
    lock.unlock();
}
```

直接向下走到核心代码：

```java
// ReentrantLock
public void unlock() {
    sync.release(1);
}

// AbstractQueuedSynchronizer
public final boolean release(int arg) {
    if (tryRelease(arg)) {
        Node h = head;
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```

可以看到在 release() 方法中，先通过 tryRelease() 尝试释放锁，如果释放成功后，就对后边线程进行唤醒，先来看 `tryRelease` ：

```java
// ReentrantLock
protected final boolean tryRelease(int releases) {
    int c = getState() - releases;
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    boolean free = false;
    if (c == 0) {
        free = true;
        setExclusiveOwnerThread(null);
    }
    setState(c);
    return free;
}
```

这里的流程就很简单了，releases 变量就是释放锁的个数，为 1，主要是减少重入的次数

令 c = state - release ，如果 c 为 0，表示没有当前线程已经完全不使用这个锁了（所有的重入都已经退出），将持锁线程设置为 null 并且将 AQS 的 state 设置为 0，表示目前锁没有被线程占用

当 tryRelease 返回 true 就表示锁已经释放了，接下来对后边线程进行唤醒即可，执行 `unparkSuccessor` 进行唤醒：

```java
private void unparkSuccessor(Node node) {
    int ws = node.waitStatus;
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0);

    Node s = node.next;
    if (s == null || s.waitStatus > 0) {
        s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    if (s != null)
        LockSupport.unpark(s.thread);
}
```

在这个唤醒的方法中，先使用 CAS 将当前节点的 waitStatus 改为 0，表示当前节点已经在对后边节点唤醒了

令 `s = node.next` ：

如果 s 是 null 或者它的 waitStatus > 0，也就是后边的节点是取消状态，因此要通过 for 循环，从后向前找到 node 节点后的第一个正常状态的节点，对这个正常状态节点进行唤醒

如果不满足上边的条件，说明当前节点后边的 s 节点状态正常，直接唤醒 s 节点就可以了

每一个线程节点都是在 `acquireQueued` 方法中挂起的，当被唤醒之后，就会在 acquiredQueued 中的 for 循环中自旋继续执行抢锁操作！

```java
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            // 线程真正挂起的位置
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
private final boolean parkAndCheckInterrupt() {
    // 挂起
    LockSupport.park(this);
    return Thread.interrupted();
}
```



到此，释放锁以及线程唤醒后在哪里继续开始执行的操作就说完了！

**这里说一下在 unparkSuccessor 中为什么要 `从后向前` 找到 node 后的第一个正常节点呢？**

与 addWaiter() 入队列这个方法有关：

```java
// AbstractQueuedSynchronized
private Node addWaiter(Node mode) {
    Node node = new Node(Thread.currentThread(), mode);
    Node pred = tail;
    if (pred != null) {
        node.prev = pred;
        if (compareAndSetTail(pred, node)) {
            pred.next = node;
            return node;
        }
    }
    enq(node);
    return node;
}
```

可以看到，将线程节点加入队列需要两个操作：`node.prev = pred` 、 `pred.next = node`

但是这两个操作不是原子操作，我们先执行了 `node.prev = pred` ，之后通过 CAS 操作设置 Tail 指针之后，才执行 `pred.next = node`

于是极端情况下可能存在这种情况：当前节点的下一个节点是 CANCELLED 状态，此时新入队的节点只执行了 `node.prev = pred` ，还没来得及执行 `pred.next = node` 

因此，如果 for 循环从前到后遍历的话，可能遍历到 CANCELLED 节点时，此时 next 指针还没有赋值，可能出现空指针的问题

```java
head -> 当前节点 node -> CANCELLED 节点 -> 新入队节点
```







### ReentrantLock 和 synchronized 区别

首先在 JDK1.8 中，两者 `在性能上基本上没有区别` ，因为在 JDK1.6 之后，synchronized 已经做了锁升级的优化，性能相比之前提升许多

**那么在真正使用的时候，要如何进行选择呢，毕竟两者都是进行线程同步操作的**

那么可以从他们的使用、特性两方面来说：

首先，`使用方式上` ，使用 ReentrantLock 的话，还需要声明 ReentrantLock 变量，并且手动调用 lock 和 unlock，要正确处理异常情况，需要确保 unlock 成功执行，否则可能会导致所有线程都无法取到锁

那么使用 synchronized 来说的话，就比较简单了，需要对什么加锁，就直接加锁就好了，我们不需要去关心锁的添加和释放，都交给了 JVM 底层来完成

**因此，他们在使用上的区别就是 ReentrantLock 使用起来较为麻烦一些，而 synchronized 使用起来比较方便**

那么接下来说一下 `灵活性` ，灵活性和方便程度恰恰是相反的，synchronized 使用起来虽然方便，但是不够灵活，因为 synchronized 中的线程等待锁是无法唤醒的，而 ReentrantLock 中，`等待锁的线程是可以响应中断的` 

并且 ReentrantLock 中还支持 `公平锁和非公平锁，可重入锁` ，而 synchronized 只支持非公平锁

因此在高并发使用的时候，很显然 ReentrantLock 功能更多，更加灵活，并且既然都是高并发场景了，大部分人对 ReentrantLock 的使用以及理解都是比较好的，因此建议使用 ReentrantLock

而在 `上下文切换` 这一方面，两个锁其实都是要阻塞和唤醒线程，因此都会发生线程的上下文切换，但是 ReentrantLock 通过 CAS 进行优化，在线程阻塞之前，会进行多次 CAS 抢锁操作，**因此降低了线程上下文切换的概率** ，而 synchronized 只要升级为了重量锁，线程来拿锁时一定会进入队列中阻塞等待



**这里说 synchronized 中的线程不灵活还有一个方面就是它的线程获取不到锁会一直等待：** 没有 `超时自动取消获取锁` 的操作，也就是 `tryLock(timeout)` 功能，在指定时间获取不到锁的时候，可以直接将线程超时了，不去拿锁了

- **为什么说需要 `tryLock(timeout)` 这个功能呢？**

假设这样一种场景，有一个任务在某个时间点可能多个线程同时要来执行，但是只要有一个线程执行完毕之后，其他线程就不需要执行了

那么假设在这个需要执行任务的时间点，大量线程同时过来执行，也就是大量线程都进入阻塞队列等待获取锁，第一个线程拿到锁执行任务之后，此时后边的线程都不需要执行该任务了，但是由于没有这个超时功能，导致后边的线程还需要在队列中等待获取锁，再一个个进入同步代码块，发现任务已经执行过了，不需要自己再执行了，之后再退出同步代码块

因此这个 `tryLock(timeout)` 的作用就是 **将大量线程的串行操作转为并行操作** ，大量线程发现指定时间内获取不了锁了，直接超时，不获取锁了，这样后边的线程再来看就发现任务已经执行过了，不需要再去获取锁执行任务了

![image-20240226200621006](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240226200621006.png)

这里 `tryLock(timeout)` 的情况只是举一个特殊的情况，其实是参考了分布式环境下，更新 Redis 缓存时会出现这种情况，但是在分布式环境下肯定不会使用 synchronized ，因此这里主要是举个例子说一下 tryLock 的作用！



