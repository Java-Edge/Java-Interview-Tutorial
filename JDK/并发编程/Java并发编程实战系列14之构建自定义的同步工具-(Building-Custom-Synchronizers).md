类库中包含了许多存在状态依赖的类，例如FutureTask、Semaphore和BlockingQueue，他们的一些操作都有前提条件，例如非空，或者任务已完成等。

创建状态依赖类的最简单的房就是在JDK提供了的状态依赖类基础上构造。例如第八章的ValueLactch，如果这些不满足，可以使用Java语言或者类库提供的底层机制来构造，包括

*   内置的条件队列
*   condition
*   AQS

这一章就介绍这些。

### [](#141-%E7%8A%B6%E6%80%81%E4%BE%9D%E8%B5%96%E6%80%A7%E7%9A%84%E7%AE%A1%E7%90%86-state-dependence)14.1 状态依赖性的管理 State Dependence

在14.2节会介绍使用条件队列来解决阻塞线程运行的问题。下面先介绍通过轮询和休眠的方式（勉强）的解决。

下面是一个标准的模板，

```
void blockingAction() throws InterruptedException {
   acquire lock on object state
   while (precondition does not hold) {
      release lock
      wait until precondition might hold
      optionally fail if interrupted or timeout expires
      reacquire lock
   }
   perform action
}

```

下面介绍阻塞有界队列的集中实现方式。依赖的前提条件是：

*   不能从空缓存中获取元素
*   不能将元素放入已满的缓存中

不满足条件时候，依赖状态的操作可以

*   抛出异常
*   返回一个错误状态（码）
*   阻塞直到进入正确的状态

下面是基类，线程安全，但是非阻塞。

```
@ThreadSafe
public abstract class BaseBoundedBuffer <V> {
    @GuardedBy("this") private final V[] buf;
    @GuardedBy("this") private int tail;
    @GuardedBy("this") private int head;
    @GuardedBy("this") private int count;

    protected BaseBoundedBuffer(int capacity) {
        this.buf = (V[]) new Object[capacity];
    }

    protected synchronized final void doPut(V v) {
        buf[tail] = v;
        if (++tail == buf.length)
            tail = 0;
        ++count;
    }

    protected synchronized final V doTake() {
        V v = buf[head];
        buf[head] = null;
        if (++head == buf.length)
            head = 0;
        --count;
        return v;
    }

    public synchronized final boolean isFull() {
        return count == buf.length;
    }

    public synchronized final boolean isEmpty() {
        return count == 0;
    }
}

```

“先检查再运行”的逻辑解决方案如下，调用者必须自己处理前提条件失败的情况。当然也可以返回错误消息。

当然调用者可以不Sleep，而是直接重试，这种方法叫做**忙等待或者自旋等待（busy waiting or spin waiting. ）**，如果换成很长时间都不变，那么这将会消耗大量的CPU时间！！！所以调用者自己休眠，sleep让出CPU。但是这个时间就很尴尬了，sleep长了万一一会前提条件就满足了岂不是白等了从而响应性低，sleep短了浪费CPU时钟周期。另外可以试试yield，但是这也不靠谱。

```
@ThreadSafe
        public class GrumpyBoundedBuffer <V> extends BaseBoundedBuffer<V> {
    public GrumpyBoundedBuffer() {
        this(100);
    }

    public GrumpyBoundedBuffer(int size) {
        super(size);
    }

    public synchronized void put(V v) throws BufferFullException {
        if (isFull())
            throw new BufferFullException();
        doPut(v);
    }

    public synchronized V take() throws BufferEmptyException {
        if (isEmpty())
            throw new BufferEmptyException();
        return doTake();
    }
}

class ExampleUsage {
    private GrumpyBoundedBuffer<String> buffer;
    int SLEEP_GRANULARITY = 50;

    void useBuffer() throws InterruptedException {
        while (true) {
            try {
                String item = buffer.take();
                // use item
                break;
            } catch (BufferEmptyException e) {
                Thread.sleep(SLEEP_GRANULARITY);
            }
        }
    }
}

```

下一步改进下，首先让客户端舒服些。

```
@ThreadSafe
public class SleepyBoundedBuffer <V> extends BaseBoundedBuffer<V> {
    int SLEEP_GRANULARITY = 60;

    public SleepyBoundedBuffer() {
        this(100);
    }

    public SleepyBoundedBuffer(int size) {
        super(size);
    }

    public void put(V v) throws InterruptedException {
        while (true) {
            synchronized (this) {
                if (!isFull()) {
                    doPut(v);
                    return;
                }
            }
            Thread.sleep(SLEEP_GRANULARITY);
        }
    }

    public V take() throws InterruptedException {
        while (true) {
            synchronized (this) {
                if (!isEmpty())
                    return doTake();
            }
            Thread.sleep(SLEEP_GRANULARITY);
        }
    }
}

```

这种方式测试失败，那么释放锁，让别人做，自己休眠下，然后再检测，不断的重复这个过程，当然可以解决，但是还是需要做权衡，CPU使用率与响应性之间的抉择。

那么我们想如果这种轮询和休眠的dummy方式不用，而是存在某种挂起线程的方案，并且这种方法能够确保党某个条件成真时候立刻唤醒线程，那么将极大的简化实现工作，这就是条件队列的实现。

Condition Queues的名字来源：it gives a group of threads called the **wait set** a way to wait for a specific condition to become true. Unlike typical queues in which the elements are data items, the elements of a condition queue are the threads waiting for the condition.

每个Java对象都可以是一个锁，每个对象同样可以作为一个条件队列，并且Object的wait、notify和notifyAll就是内部条件队列的API。对象的内置锁（intrinsic lock ）和内置条件队列是关联的，**要调用X中的条件队列的任何一个方法，都必须持有对象X上的锁。**

Object.wait自动释放锁，并且请求操作系统挂起当前线程，从而其他线程可以获得这个锁并修改对象状态。当被挂起的线程唤醒时。它将在返回之前重新获取锁。

```
@ThreadSafe
public class BoundedBuffer <V> extends BaseBoundedBuffer<V> {
    // CONDITION PREDICATE: not-full (!isFull())
    // CONDITION PREDICATE: not-empty (!isEmpty())
    public BoundedBuffer() {
        this(100);
    }

    public BoundedBuffer(int size) {
        super(size);
    }

    // BLOCKS-UNTIL: not-full
    public synchronized void put(V v) throws InterruptedException {
        while (isFull())
            wait();
        doPut(v);
        notifyAll();
    }

    // BLOCKS-UNTIL: not-empty
    public synchronized V take() throws InterruptedException {
        while (isEmpty())
            wait();
        V v = doTake();
        notifyAll();
        return v;
    }

    // BLOCKS-UNTIL: not-full
    // Alternate form of put() using conditional notification
    public synchronized void alternatePut(V v) throws InterruptedException {
        while (isFull())
            wait();
        boolean wasEmpty = isEmpty();
        doPut(v);
        if (wasEmpty)
            notifyAll();
    }
}

```

注意，如果某个功能无法通过“轮询和休眠"来实现，那么条件队列也无法实现。

### [](#142-using-condition-queues)14.2 Using Condition Queues

#### [](#1421-%E6%9D%A1%E4%BB%B6%E8%B0%93%E8%AF%8Dthe-condition-predicate)14.2.1 条件谓词The Condition Predicate

The Condition Predicate 是使某个操作成为状态依赖操作的前提条件。take方法的条件谓词是”缓存不为空“，take方法在执行之前必须首先测试条件谓词。同样，put方法的条件谓词是”缓存不满“。

在条件等待中存在一种重要的三元关系，包括

*   加锁
*   wait方法
*   条件谓词

条件谓词中包含多个状态变量，而状态变量由一个锁来保护，因此在测试条件谓词之前必须先持有这个锁。锁对象和条件队列对象必须是同一个对象。wait释放锁，线程挂起阻塞，等待知道超时，然后被另外一个线程中断或者被一个通知唤醒。唤醒后，wait在返回前还需要重新获取锁，当线程从wait方法中唤醒，它在重新请求锁时不具有任何特殊的优先级，和其他人一起竞争。

#### [](#1422-%E8%BF%87%E6%97%A9%E5%94%A4%E9%86%92)14.2.2 过早唤醒

其他线程中间插足了，获取了锁，并且修改了遍历，这时候线程获取锁需要重新检查条件谓词。

```
wait block ----------race to get lock ------------------------------------------get lock ----- 
                    ^
wait block --------> race to get lock ------get lock------> perform action  ---> release lock
                    ^
                    notifyAll

```

当然有的时候，比如一个你根本不知道为什么别人调用了notify或者notifyAll，也许条件谓词压根就没满足，但是线程还是获取了锁，然后test条件谓词，释放所，其他线程都来了这么一趟，发生这就是“谎报军情”啊。

基于以上这两种情况，都必须重新测试条件谓词。

When using condition waits (Object.wait or Condition.await):

*   Always have a condition predicate——some test of object state that must hold before proceeding;
*   Always test the condition predicate before calling wait, and again after returning from wait;
*   Always call wait in a loop;
*   Ensure that the state variables making up the condition predicate are guarded by the lock associated with the condition queue;
*   Hold the lock associated with the the condition queue when calling wait, notify, or notifyAll
*   Do not release the lock after checking the condition predicate but before acting on it.

模板就是：

```
void stateDependentMethod() throws InterruptedException {
 // condition predicate must be guarded by lock
 synchronized(lock) {  
     while (!conditionPredicate())  //一定在循环里面做条件谓词
         lock.wait();  //确保和synchronized的是一个对象
     // object is now in desired state  //不要释放锁
 }
} 

```

#### [](#1423-%E4%B8%A2%E5%A4%B1%E7%9A%84%E4%BF%A1%E5%8F%B7)14.2.3 丢失的信号

保证notify一定在wait之后

#### [](#1424-%E9%80%9A%E7%9F%A5)14.2.4 通知

下面介绍通知。

调用notify和notifyAll也得持有与条件队列对象相关联的锁。调用notify，JVM Thread Scheduler在这个条件队列上等待的多个线程中选择一个唤醒，而notifyAll则会唤醒所有线程。因此一旦notify了那么就需要尽快的释放锁，否则别人都竞争等着拿锁，都会进行blocked的状态，而不是线程挂起waiting状态，竞争都了不是好事，但是这是你考了性能因素和安全性因素的一个矛盾，具体问题要具体分析。

下面的方法可以进来减少竞争，但是确然程序正确的实现有些难写，所以这个折中还得自己考虑：

```
public synchronized void alternatePut(V v) throws InterruptedException {
        while (isFull())
            wait();
        boolean wasEmpty = isEmpty();
        doPut(v);
        if (wasEmpty)
            notifyAll();
    }

```

使用notify容易丢失信号，所以大多数情况下用notifyAll，比如take notify，却通知了另外一个take，没有通知put，那么这就是信号丢失，是一种“被劫持的”信号。

因此只有满足下面两个条件，才能用notify，而不是notifyAll：

*   所有等待线程的类型都相同
*   单进单出

#### [](#1425-%E7%A4%BA%E4%BE%8B%E9%98%80%E9%97%A8%E7%B1%BBa-gate-class)14.2.5 示例：阀门类A Gate Class

和第5章的那个TestHarness中使用CountDownLatch类似，完全可以使用wait/notifyAll做阀门。

```
@ThreadSafe
public class ThreadGate {
    // CONDITION-PREDICATE: opened-since(n) (isOpen || generation>n)
    @GuardedBy("this") private boolean isOpen;
    @GuardedBy("this") private int generation;

    public synchronized void close() {
        isOpen = false;
    }

    public synchronized void open() {
        ++generation;
        isOpen = true;
        notifyAll();
    }

    // BLOCKS-UNTIL: opened-since(generation on entry)
    public synchronized void await() throws InterruptedException {
        int arrivalGeneration = generation;
        while (!isOpen && arrivalGeneration == generation)
            wait();
    }
}

```

### [](#143-explicit-condition-objects)14.3 Explicit Condition Objects

Lock是一个内置锁的替代，而Condition也是一种广义的**内置条件队列**。

Condition的API如下：

```
public interface Condition {
 void await() throws InterruptedException;
 boolean await(long time, TimeUnit unit)throws InterruptedException;
 long awaitNanos(long nanosTimeout) throws InterruptedException;
 void awaitUninterruptibly();
 boolean awaitUntil(Date deadline) throws InterruptedException;
 void signal();
 void signalAll();
}

```

内置条件队列存在一些缺陷，每个内置锁都只能有一个相关联的条件队列，记住是**一个**。所以在BoundedBuffer这种累中，**多个线程可能在同一个条件队列上等待不同的条件谓词**，所以notifyAll经常通知不是同一个类型的需求。如果想编写一个带有多个条件谓词的并发对象，或者想获得除了条件队列可见性之外的更多的控制权，可以使用Lock和Condition，而不是内置锁和条件队列，这更加灵活。

一个Condition和一个lock关联，想象一个条件队列和内置锁关联一样。在Lock上调用newCondition就可以新建无数个条件谓词，这些condition是可中断的、可有时间限制的，公平的或者非公平的队列操作。

The equivalents of wait, notify, and notifyAll for Condition objects are await, signal, and signalAll。

下面的例子就是改造后的BoundedBuffer，

```
@ThreadSafe
public class ConditionBoundedBuffer <T> {
    protected final Lock lock = new ReentrantLock();
    // CONDITION PREDICATE: notFull (count < items.length)
    private final Condition notFull = lock.newCondition();
    // CONDITION PREDICATE: notEmpty (count > 0)
    private final Condition notEmpty = lock.newCondition();
    private static final int BUFFER_SIZE = 100;
    @GuardedBy("lock") private final T[] items = (T[]) new Object[BUFFER_SIZE];
    @GuardedBy("lock") private int tail, head, count;

    // BLOCKS-UNTIL: notFull
    public void put(T x) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length)
                notFull.await();
            items[tail] = x;
            if (++tail == items.length)
                tail = 0;
            ++count;
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    // BLOCKS-UNTIL: notEmpty
    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0)
                notEmpty.await();
            T x = items[head];
            items[head] = null;
            if (++head == items.length)
                head = 0;
            --count;
            notFull.signal();
            return x;
        } finally {
            lock.unlock();
        }
    }
}

```

注意这里使用了signal而不是signalll，能极大的减少每次缓存操作中发生的上下文切换和锁请求次数。

使用condition和内置锁和条件队列一样，必须保卫在lock里面。

### [](#144-synchronizer%E5%89%96%E6%9E%90)14.4 Synchronizer剖析

看似ReentrantLock和Semaphore功能很类似，每次只允许一定的数量线程通过，到达阀门时

*   可以通过 lock或者acquire
*   等待，阻塞住了
*   取消tryLock，tryAcquire
*   可中断的，限时的
*   公平等待和非公平等待

下面的程序是使用Lock做一个Mutex也就是持有一个许可的Semaphore。

```
@ThreadSafe
public class SemaphoreOnLock {
    private final Lock lock = new ReentrantLock();
    // CONDITION PREDICATE: permitsAvailable (permits > 0)
    private final Condition permitsAvailable = lock.newCondition();
    @GuardedBy("lock") private int permits;

    SemaphoreOnLock(int initialPermits) {
        lock.lock();
        try {
            permits = initialPermits;
        } finally {
            lock.unlock();
        }
    }

    // BLOCKS-UNTIL: permitsAvailable
    public void acquire() throws InterruptedException {
        lock.lock();
        try {
            while (permits <= 0)
                permitsAvailable.await();
            --permits;
        } finally {
            lock.unlock();
        }
    }

    public void release() {
        lock.lock();
        try {
            ++permits;
            permitsAvailable.signal();
        } finally {
            lock.unlock();
        }
    }
}

```

实际上很多J.U.C下面的类都是基于AbstractQueuedSynchronizer (AQS)构建的，例如CountDownLatch, ReentrantReadWriteLock, SynchronousQueue,and FutureTask（java7之后不是了）。AQS解决了实现同步器时设计的大量细节问题，例如等待线程采用FIFO队列操作顺序。AQS不仅能极大极少实现同步器的工作量，并且也不必处理竞争问题，基于AQS构建只可能在一个时刻发生阻塞，从而降低上下文切换的开销，提高吞吐量。在设计AQS时，充分考虑了可伸缩性，可谓大师Doug Lea的经典作品啊！

### [](#145-abstractqueuedsynchronizer-aqs)14.5 AbstractQueuedSynchronizer (AQS)

基于AQS构建的同步器勒种，最进步的操作包括各种形式的获取操作和释放操作。获取操作是一种依赖状态的操作，并且通常会阻塞。

如果一个类想成为状态依赖的类，它必须拥有一些状态，AQS负责管理这些状态，通过getState,setState, compareAndSetState等protected类型方法进行操作。这是设计模式中的模板模式。

使用AQS的模板如下：

获取锁：首先判断当前状态是否允许获取锁，如果是就获取锁，否则就阻塞操作或者获取失败，也就是说如果是独占锁就可能阻塞，如果是共享锁就可能失败。另外如果是阻塞线程，那么线程就需要进入阻塞队列。当状态位允许获取锁时就修改状态，并且如果进了队列就从队列中移除。

释放锁:这个过程就是修改状态位，如果有线程因为状态位阻塞的话就唤醒队列中的一个或者更多线程。

```
boolean acquire() throws InterruptedException {
 while (state does not permit acquire) {
 if (blocking acquisition requested) {
 enqueue current thread if not already queued
 block current thread
 }
 else
 return failure
 }
 possibly update synchronization state
 dequeue thread if it was queued
 return success
}
void release() {
 update synchronization state
 if (new state may permit a blocked thread to acquire)
 unblock one or more queued threads
}

```

要支持上面两个操作就必须有下面的条件：

*   原子性操作同步器的状态位
*   阻塞和唤醒线程
*   一个有序的队列

**1 状态位的原子操作**

这里使用一个32位的整数来描述状态位，前面章节的原子操作的理论知识整好派上用场，在这里依然使用CAS操作来解决这个问题。事实上这里还有一个64位版本的同步器（AbstractQueuedLongSynchronizer），这里暂且不谈。

**2 阻塞和唤醒线程**

标准的JAVA API里面是无法挂起（阻塞）一个线程，然后在将来某个时刻再唤醒它的。JDK 1.0的API里面有Thread.suspend和Thread.resume，并且一直延续了下来。但是这些都是过时的API，而且也是不推荐的做法。

HotSpot在Linux中中通过调用pthread_mutex_lock函数把线程交给系统内核进行阻塞。

在JDK 5.0以后利用JNI在LockSupport类中实现了此特性。

> LockSupport.park() LockSupport.park(Object) LockSupport.parkNanos(Object, long) LockSupport.parkNanos(long) LockSupport.parkUntil(Object, long) LockSupport.parkUntil(long) LockSupport.unpark(Thread)

上面的API中park()是在当前线程中调用，导致线程阻塞，带参数的Object是挂起的对象，这样监视的时候就能够知道此线程是因为什么资源而阻塞的。由于park()立即返回，所以通常情况下需要在循环中去检测竞争资源来决定是否进行下一次阻塞。park()返回的原因有三：

*   其他某个线程调用将当前线程作为目标调用 [`unpark`](http://www.blogjava.net/xylz/java/util/concurrent/locks/LockSupport.html#unpark(java.lang.Thread))；
*   其他某个线程[中断](http://www.blogjava.net/xylz/java/lang/Thread.html#interrupt())当前线程；
*   该调用不合逻辑地（即毫无理由地）返回。

其实第三条就决定了需要循环检测了，类似于通常写的while(checkCondition()){Thread.sleep(time);}类似的功能。

**3 有序队列**

在AQS中采用CHL列表来解决有序的队列的问题。

AQS采用的CHL模型采用下面的算法完成FIFO的入队列和出队列过程。该队列的操作均通过Lock-Free（CAS）操作.

自己实现的CLH SpinLock如下：

```
class ClhSpinLock {
    private final ThreadLocal<Node> prev;
    private final ThreadLocal<Node> node;
    private final AtomicReference<Node> tail = new AtomicReference<Node>(new Node());

    public ClhSpinLock() {
        this.node = new ThreadLocal<Node>() {
            protected Node initialValue() {
                return new Node();
            }
        };

        this.prev = new ThreadLocal<Node>() {
            protected Node initialValue() {
                return null;
            }
        };
    }

    public void lock() {
        final Node node = this.node.get();
        node.locked = true;
        // 一个CAS操作即可将当前线程对应的节点加入到队列中，
        // 并且同时获得了前继节点的引用，然后就是等待前继释放锁
        Node pred = this.tail.getAndSet(node);
        this.prev.set(pred);
        while (pred.locked) {// 进入自旋
        }
    }

    public void unlock() {
        final Node node = this.node.get();
        node.locked = false;
        this.node.set(this.prev.get());
    }

    private static class Node {
        private volatile boolean locked;
    }
}

```

对于入队列(*enqueue)：*采用CAS操作，每次比较尾结点是否一致，然后插入的到尾结点中。

```
do {
        pred = tail;
}while ( !compareAndSet(pred,tail,node) );

```

对于出队列(*dequeue*):由于每一个节点也缓存了一个状态，决定是否出队列，因此当不满足条件时就需要自旋等待，一旦满足条件就将头结点设置为下一个节点。

AQS里面有三个核心字段：

> private volatile int state;
> 
> private transient volatile Node head;
> 
> private transient volatile Node tail;

其中state描述的有多少个线程取得了锁，对于互斥锁来说state<=1。head/tail加上CAS操作就构成了一个CHL的FIFO队列。下面是Node节点的属性。

独占操作的API都是不带有shared，而共享的包括semaphore和countdownlatch都是使用带有shared字面的API。

一些有用的参考资料：

**java.util.concurrent.locks.AbstractQueuedSynchronizer - **AQS

[http://gee.cs.oswego.edu/dl/papers/aqs.pdf](http://gee.cs.oswego.edu/dl/papers/aqs.pdf)论文

[http://www.blogjava.net/xylz/archive/2010/07/08/325587.html](http://www.blogjava.net/xylz/archive/2010/07/08/325587.html) 一个比较全面的另外一个人的解读

[http://suo.iteye.com/blog/1329460](http://suo.iteye.com/blog/1329460)

[http://www.infoq.com/cn/articles/jdk1.8-abstractqueuedsynchronizer](http://www.infoq.com/cn/articles/jdk1.8-abstractqueuedsynchronizer)

[http://www.cnblogs.com/zhanjindong/p/java-concurrent-package-aqs-overview.html](http://www.cnblogs.com/zhanjindong/p/java-concurrent-package-aqs-overview.html)

[http://www.cnblogs.com/zhanjindong/p/java-concurrent-package-aqs-clh-and-spin-lock.html](http://www.cnblogs.com/zhanjindong/p/java-concurrent-package-aqs-clh-and-spin-lock.html)

[http://www.cnblogs.com/zhanjindong/p/java-concurrent-package-aqs-locksupport-and-thread-interrupt.html](http://www.cnblogs.com/zhanjindong/p/java-concurrent-package-aqs-locksupport-and-thread-interrupt.html)

独占的就用TRyAcquire, TRyRelease, and isHeldExclusively,共享的就用 tryAcquireShared and TRyReleaseShared. 带有try前缀的方法都是模板方法，AQS用于判断是否可以继续，例如如果tryAcquireShared返回一个负值，那么表示获取锁失败，失败的就需要进入CLH队列，并且挂起线程。

举一个例子，一个简单的闭锁。

```
@ThreadSafe
public class OneShotLatch {
    private final Sync sync = new Sync();

    public void signal() {
        sync.releaseShared(0);
    }

    public void await() throws InterruptedException {
        sync.acquireSharedInterruptibly(0);
    }

    private class Sync extends AbstractQueuedSynchronizer {
        protected int tryAcquireShared(int ignored) {
            // Succeed if latch is open (state == 1), else fail
            return (getState() == 1) ? 1 : -1;
        }

        protected boolean tryReleaseShared(int ignored) {
            setState(1); // Latch is now open
            return true; // Other threads may now be able to acquire

        }
    }
}

```

下面是自己实现的一个Mutex。

```
/**
 * Lock free的互斥锁，简单实现，不可重入锁
 */
public class Mutex implements Lock {

    private static final int FREE = 0;
    private static final int BUSY = 1;

    private static class LockSync extends AbstractQueuedSynchronizer {

        private static final long serialVersionUID = 4689388770786922019L;

        protected boolean isHeldExclusively() {
            return getState() == BUSY;
        }

        public boolean tryAcquire(int acquires) {
            return compareAndSetState(FREE, BUSY);
        }

        protected boolean tryRelease(int releases) {
            if (getState() == FREE) {
                throw new IllegalMonitorStateException();
            }

            setState(FREE);
            return true;
        }

        Condition newCondition() {
            return new ConditionObject();
        }

    }

    private final LockSync sync = new LockSync();

    public void lock() {
        sync.acquire(0);
    }

    public boolean tryLock() {
        return sync.tryAcquire(0);
    }

    public boolean tryLock(long timeout, TimeUnit unit) throws InterruptedException {
        return sync.tryAcquireNanos(1, unit.toNanos(timeout));
    }

    public void unlock() {
        sync.release(0);
    }

    public Condition newCondition() {
        return sync.newCondition();
    }

    public boolean isLocked() {
        return sync.isHeldExclusively();
    }

    public boolean hasQueuedThreads() {
        return sync.hasQueuedThreads();
    }

    public void lockInterruptibly() throws InterruptedException {
        sync.acquireInterruptibly(0);
    }

}

```

### [](#146-juc%E5%90%8C%E6%AD%A5%E5%99%A8%E5%8B%92%E7%A7%8D%E7%9A%84aqs)14.6 J.U.C同步器勒种的AQS

*   ReentrantLock

```
protected boolean tryAcquire(int ignored) {
 final Thread current = Thread.currentThread();
 int c = getState();
 if (c == 0) {
 if (compareAndSetState(0, 1)) {
 owner = current;
 return true;
 }
 } else if (current == owner) {
 setState(c+1);
 return true;
 }
 return false;
} 

```

*   Semaphore和CountDownLatch

```
protected int tryAcquireShared(int acquires) {
 while (true) {
 int available = getState();
 int remaining = available - acquires;
 if (remaining < 0
 || compareAndSetState(available, remaining))
 return remaining;
 }
}
protected boolean tryReleaseShared(int releases) {
 while (true) {
 int p = getState();
 if (compareAndSetState(p, p + releases))
 return true;
 }
} 
```
