# 1 读写锁维护了一对相关的锁，一个用于只读操作，一个用于写入操作。

只要没有writer，读锁可以由多个reader线程同时保持。
写锁是独占的。

- 互斥锁一次只允许一个线程访问共享数据，哪怕进行的是只读操作
- 读写锁允许对共享数据进行更高级别的并发访问
     - 对于写操作，一次只有一个线程（write线程）可以修改共享数据
     - 对于读操作，允许任意数量的线程同时进行读取。

与互斥锁相比，使用读写锁能否提升性能则取决于读写操作期间`读取数据相对于修改数据的频率，以及数据的争用,即在同一时间试图对该数据执行读取或写入操作的线程数`。

读写锁适用于`读多写少`的情况。

# 2 可重入读写锁 ReentrantReadWriteLock

## 2.1 属性

`ReentrantReadWriteLock` 也是基于 `AbstractQueuedSynchronizer `实现的，具有下面这些属性

- 获取顺序：此类不会将读/写者优先强加给锁访问的排序

   - 非公平模式（默认）
连续竞争的非公平锁可能无限期地推迟一个或多个reader或writer线程，但吞吐量通常要高于公平锁
  - 公平模式
线程利用一个近似到达顺序的策略来争夺进入。
当释放当前保持的锁时，可以为等待时间最长的单个writer线程分配写锁，如果有一组等待时间大于所有正在等待的writer线程的reader，将为该组分配读锁。
试图获得公平写入锁的非重入的线程将会阻塞，除非读取锁和写入锁都自由（这意味着没有等待线程）。
- 重入：此锁允许reader和writer按照 ReentrantLock 的样式重新获取读/写锁。在写线程保持的所有写锁都已释放后，才允许重入reader使用读锁
writer可以获取读取锁，但reader不能获取写入锁。
- 锁降级：重入还允许从写锁降级为读锁，实现方式是：先获取写锁，然后获取读取锁，最后释放写锁。但是，`从读取锁升级到写入锁是不可能的`。
- 锁获取的中断：读锁和写锁都支持锁获取期间的中断。
- Condition 支持：写锁提供了一个 Condition 实现，对于写锁来说，该实现的行为与 `ReentrantLock.newCondition()` 提供的 Condition 实现对 ReentrantLock 所做的行为相同。当然，`此 Condition 只能用于写锁`。
读锁不支持 Condition，readLock().newCondition() 会抛UnsupportedOperationException
- 监测：此类支持一些确定是读锁还是写锁的方法。这些方法设计用于监视系统状态，而不是同步控制。

# 3 ReentrantLock加锁和释放锁的底层原理 - AQS 

## 3.1 回顾

AQS对象内部以单个 int 类型的原子变量来表示其状态, 代表了加锁的状态。
初始状态下，这个state的值是0

AQS内部还有一个关键变量，记录当前加锁的是哪个线程
初始化状态下，这个变量是null![](https://img-blog.csdnimg.cn/20191018234504480.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

接着线程1跑过来调用ReentrantLock的*lock*()方法尝试进行加锁，这个加锁的过程，直接就是用CAS操作将state值从0变为1。
如果之前没人加过锁，那么state的值肯定是0，此时线程1就可以加锁成功。
一旦线程1加锁成功了之后，就可以设置当前加锁线程是自己。

- 线程1跑过来加锁的一个过程
![](https://img-blog.csdnimg.cn/20191018235617253.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
说白了，就是并发包里的一个核心组件，里面有state变量、加锁线程变量等核心的东西，维护了加锁状态。

ReentrantLock 这种东西只是一个外层的API，内核中的锁机制实现其实都是依赖AQS组件

Reentrant打头，意思是一个可重入锁。
可重入锁就是你可以对一个ReentrantLock对象多次执行lock()加锁和unlock()释放锁，也就是可以对一个锁加多次，叫做可重入加锁。
看明白了那个state变量之后，就知道了如何进行可重入加锁！


其实每次线程1可重入加锁一次，会判断一下当前加锁线程就是自己，那么他自己就可以可重入多次加锁，每次加锁就是把state的值给累加1，别的没啥变化。

接着，如果线程1加锁了之后，线程2跑过来加锁会怎么样呢？

## 3.2 我们来看看锁的互斥是如何实现的
线程2跑过来一下看到，哎呀！state的值不是0啊？所以CAS操作将state从0变为1的过程会失败，因为state的值当前为1，说明已经有人加锁了！

接着线程2会看一下，是不是自己之前加的锁啊？当然不是了，“加锁线程”这个变量明确记录了是线程1占用了这个锁，所以线程2此时就是加锁失败。

- 一起来感受一下线程2的绝望心路
![](https://img-blog.csdnimg.cn/20191019000850859.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

接着，线程2会将自己放入AQS中的一个等待队列，因为自己尝试加锁失败了，此时就要将自己放入队列中来等待，等待线程1释放锁之后，自己就可以重新尝试加锁了

所以大家可以看到，AQS是如此的核心！AQS内部还有一个等待队列，专门放那些加锁失败的线程！

- 同样，给大家来一张图，一起感受一下：
![](https://img-blog.csdnimg.cn/20191019001308340.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

接着，线程1在执行完自己的业务逻辑代码之后，就会释放锁！
他释放锁的过程非常的简单，就是将AQS内的state变量的值递减1，如果state值为0，则彻底释放锁，会将“加锁线程”变量也设置为null！
- 附图
![](https://img-blog.csdnimg.cn/20191019001520803.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
接下来，会从等待队列的队头唤醒线程2重新尝试加锁。
好！线程2现在就重新尝试加锁，这时还是用CAS操作将state从0变为1，此时就会成功，成功之后代表加锁成功，就会将state设置为1。
此外，还要把“加锁线程”设置为线程2自己，同时线程2自己就从等待队列中出队了。
- 最后再来一张图，大家来看看这个过程。
![](https://img-blog.csdnimg.cn/20191019001626741.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)


## 3.3 个抽象方法

- tryAcquire(int)
- tryRelease(int)
- tryAcquireShared(int)
- tryReleaseShared(int)


前两个方法用于独占/排他模式，后两个用于共享模式 ,留给子类实现，自定义同步器的行为以实现特定的功能。

- ReentrantLock，它是可重入的独占锁，内部的 Sync 类实现了 tryAcquire(int)、tryRelease(int) 方法，并用状态的值来表示重入次数，加锁或重入锁时状态加 1，释放锁时状态减 1，状态值等于 0 表示锁空闲。

- CountDownLatch，它是一个关卡，在条件满足前阻塞所有等待线程，条件满足后允许所有线程通过。内部类 Sync 把状态初始化为大于 0 的某个值，当状态大于 0 时所有wait线程阻塞，每调用一次 countDown 方法就把状态值减 1，减为 0 时允许所有线程通过。利用了AQS的共享模式。

现在，要用AQS来实现 ReentrantReadWriteLock。

# 4 AQS只有一个状态，那么如何表示 多个读锁 与 单个写锁
ReentrantLock 里，状态值表示重入计数
- 现在如何在AQS里表示每个读锁、写锁的重入次数呢
- 如何实现读锁、写锁的公平性呢

一个状态是没法既表示读锁，又表示写锁的，显然不够用啊，那就辦成两份用了!
**状态的高位部分表示读锁，低位表示写锁**
由于写锁只有一个，所以写锁的重入计数也解决了，这也会导致写锁可重入的次数减小。

由于读锁可以同时有多个，肯定不能再用辦成两份用的方法来处理了
但我们有 `ThreadLocal`，可以把线程重入读锁的次数作为值存在 `ThreadLocal `

对于公平性的实现，可以通过AQS的等待队列和它的抽象方法来控制
在状态值的另一半里存储当前持有读锁的线程数。
- 如果读线程申请读锁，当前写锁重入次数不为 0 时，则等待，否则可以马上分配
- 如果是写线程申请写锁，当前状态为 0 则可以马上分配，否则等待。

# 5 源码分析
AQS 的状态是32位（int 类型）的
## 5.1 一分为二
读锁用高16位，表示持有读锁的线程数（sharedCount），写锁低16位，表示写锁的重入次数 （exclusiveCount）。状态值为 0 表示锁空闲，sharedCount不为 0 表示分配了读锁，exclusiveCount 不为 0 表示分配了写锁，sharedCount和exclusiveCount 肯定不会同时不为 0。
![](https://img-blog.csdnimg.cn/20191019003604724.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

## 读锁重入计数
```
    /**
      * A counter for per-thread read hold counts.
      * Maintained as a ThreadLocal; cached in cachedHoldCounter
      * 每个线程特定的 read 持有计数。存放在ThreadLocal，缓存在cachedHoldCounter
      * 不需要是线程安全的。
      */
    static final class HoldCounter {
        int count = 0;

        // 使用id而不是引用是为了避免保留垃圾。注意这是个常量。
        // Use id, not reference, to avoid garbage retention
        final long tid = Thread.currentThread().getId();
    }

    /**
       * ThreadLocal subclass. Easiest to explicitly define for sake
       * of deserialization mechanics.
       * 采用继承是为了重写 initialValue 方法，这样就不用进行这样的处理：
       * 如果ThreadLocal没有当前线程的计数，则new一个，再放进ThreadLocal里。
       * 可以直接调用 get
       */
    static final class ThreadLocalHoldCounter
        extends ThreadLocal<HoldCounter> {
        public HoldCounter initialValue() {
            return new HoldCounter();
        }
    }

    /**
      * The number of reentrant read locks held by current thread.
      * Initialized only in constructor and readObject.
      * Removed whenever a thread's read hold count drops to 0.
      * 保存当前线程重入读锁的次数的容器。在读锁重入次数为 0 时移除
      */
    private transient ThreadLocalHoldCounter readHolds;

       /**
         * The hold count of the last thread to successfully acquire
         * readLock. This saves ThreadLocal lookup in the common case
         * where the next thread to release is the last one to
         * acquire. This is non-volatile since it is just used
         * as a heuristic, and would be great for threads to cache.
         *
         * <p>Can outlive the Thread for which it is caching the read
         * hold count, but avoids garbage retention by not retaining a
         * reference to the Thread.
         *
         * <p>Accessed via a benign data race; relies on the memory
         * model's final field and out-of-thin-air guarantees.
         */
    /**
     * 最近一个成功获取读锁的线程的计数。这省却了ThreadLocal查找，
     * 通常情况下，下一个要释放的线程是最后一个获取的线程。
     * 这不是 volatile 的，因为它仅用于试探的，线程进行缓存也是极好的
     * （因为判断是否是当前线程是通过线程id来比较的）。
     */
    private transient HoldCounter cachedHoldCounter;

       /**
         * firstReader is the first thread to have acquired the read lock.
         * firstReaderHoldCount is firstReader's hold count.
         *
         * <p>More precisely, firstReader is the unique thread that last
         * changed the shared count from 0 to 1, and has not released the
         * read lock since then; null if there is no such thread.
         *
         * <p>Cannot cause garbage retention unless the thread terminated
         * without relinquishing its read locks, since tryReleaseShared
         * sets it to null.
         *
         * <p>Accessed via a benign data race; relies on the memory
         * model's out-of-thin-air guarantees for references.
         *
         * <p>This allows tracking of read holds for uncontended read
         * locks to be very cheap.
         */
    /**
     * firstReader是第一个获取读锁的线程,更加确切地说是最后一个把 共享计数 从 0 改为 1 的(在锁空闲的时候)，而且在那之后还没有释放读锁的独特的线程!如果不存在这样的线程则为null
     * firstReaderHoldCount 是 firstReader 的重入计数。
     *
     * firstReader 不会导致垃圾存留，因此在 tryReleaseShared 里设置为null，
     * 除非线程异常终止，没有释放读锁
     *
     * 这使得在跟踪无竞争的读锁计数时代价非常低
     *
     * firstReader及其计数firstReaderHoldCount是不会放入 readHolds 的
     */
    private transient Thread firstReader = null;
    private transient int firstReaderHoldCount;

    Sync() {
        readHolds = new ThreadLocalHoldCounter();
        // ensures visibility of readHolds
        setState(getState()); // 确保 readHolds 的内存可见性，利用 volatile 写的内存语义
    }
}
```
## 写锁的获取与释放
通过 tryAcquire 和 tryRelease 实现，源码里有这么一段说明
![](https://img-blog.csdnimg.cn/20191019003704206.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
tryRelease 和 tryAcquire 可能被 Conditions 调用。
因此可能出现参数里包含在条件等待和用 tryAcquire 重新获取到锁的期间内已经释放的 读和写 计数

这说明看起来像是在 tryAcquire 里设置状态时要考虑方法参数(acquires)的高位部分，其实是不需要的。由于写锁是独占的，acquires 表示的只能是写锁的计数，如果当前线程成功获取写锁，只需要简单地把当前状态加上 acquires 的值即可，tryRelease 里直接减去其参数值即可。
```
protected final boolean tryAcquire(int acquires) {
   /*
     * Walkthrough:
     * 1. If read count nonzero or write count nonzero
     *    and owner is a different thread, fail.
     * 2. If count would saturate, fail. (This can only
     *    happen if count is already nonzero.)
     * 3. Otherwise, this thread is eligible for lock if
     *    it is either a reentrant acquire or
     *    queue policy allows it. If so, update state
     *    and set owner.
     */
    Thread current = Thread.currentThread();
    int c = getState();
    int w = exclusiveCount(c);
    if (c != 0) { // 状态不为0，表示锁被分配出去了
        // (Note: if c != 0 and w == 0 then shared count != 0)
        // c != 0 且 w == 0 : 分配了读锁
        // w != 0 && current != getExclusiveOwnerThread() 表示其他线程获取了写锁。
        if (w == 0 || current != getExclusiveOwnerThread())
            return false ;
        // 写锁重入
        // 检测是否超过最大重入次数。
        if (w + exclusiveCount(acquires) > MAX_COUNT)
            throw new Error("Maximum lock count exceeded");

        // 更新写锁重入次数，写锁在低位，直接加上 acquire 即可。
        // Reentrant acquire
        setState(c + acquires);
        return true ;
    }
    // writerShouldBlock 留给子类实现，用于实现公平性策略
    // 如果允许获取写锁，则用 CAS 更新状态
    if (writerShouldBlock() ||
        !compareAndSetState(c, c + acquires))
        return false ; // 不允许获取锁 或 CAS 失败。
    // 获取写锁，设置独占线程
    setExclusiveOwnerThread(current);
    return true;
}

protected final boolean tryRelease(int releases) {
    if (!isHeldExclusively()) // 是否是当前线程持有写锁
        throw new IllegalMonitorStateException();
    // 这里不考虑高16位是因为高16位肯定是 0
    int nextc = getState() - releases;
    boolean free = exclusiveCount(nextc) == 0;
    if (free)
        setExclusiveOwnerThread( null); // 写锁完全释放，设置独占线程为null
    setState(nextc);
    return free;
}
```

## 读锁获取与释放
```
// 参数变为 unused 是因为读锁的重入计数是内部维护的
protected final int tryAcquireShared(int unused) {
/*
             * Walkthrough:
             * 1. If write lock held by another thread, fail.
             * 2. Otherwise, this thread is eligible for
             *    lock wrt state, so ask if it should block
             *    because of queue policy. If not, try
             *    to grant by CASing state and updating count.
             *    Note that step does not check for reentrant
             *    acquires, which is postponed to full version
             *    to avoid having to check hold count in
             *    the more typical non-reentrant case.
             * 3. If step 2 fails either because thread
             *    apparently not eligible or CAS fails or count
             *    saturated, chain to version with full retry loop.
             */
    Thread current = Thread.currentThread();
    int c = getState();
    // 持有写锁的线程可以获取读锁
    if (exclusiveCount(c) != 0 && // 已分配了写锁
        getExclusiveOwnerThread() != current) // 且当前线程不是持有写锁的线程
        return -1;
    int r = sharedCount(c); // 获取读锁的计数
    if (!readerShouldBlock() && // 由子类根据其公平策略决定是否允许获取读锁
        r < MAX_COUNT &&           // 读锁数量尚未达到最大值
        // 尝试获取读锁,注意读线程计数的单位是  2^16
        compareAndSetState(c, c + SHARED_UNIT)) {
         // 成功获取读锁

     // 注意下面对firstReader的处理：firstReader是不会放到readHolds里的
     // 这样，在读锁只有一个的情况下，就避免了查找readHolds
     if (r == 0) { // 是 firstReader，计数不会放入 readHolds
            firstReader = current;
            firstReaderHoldCount = 1;
        } else if (firstReader == current) { // firstReader 重入
            firstReaderHoldCount++;
        } else {
             // 非 firstReader 读锁重入计数更新
            HoldCounter rh = cachedHoldCounter; // 首先访问缓存
            if (rh == null || rh.tid != current.getId())
                cachedHoldCounter = rh = readHolds.get();
            else if (rh.count == 0)
                readHolds.set(rh);
            rh.count++;
        }
        return 1;
    }
    // 获取读锁失败，放到循环里重试。
    return fullTryAcquireShared(current);
}
/**
  * Full version of acquire for reads, that handles CAS misses
  * and reentrant reads not dealt with in tryAcquireShared.
  */
final int fullTryAcquireShared(Thread current) {
    /*
             * This code is in part redundant with that in
             * tryAcquireShared but is simpler overall by not
             * complicating tryAcquireShared with interactions between
             * retries and lazily reading hold counts.
             */
    HoldCounter rh = null;
    for (;;) {
        int c = getState();
        if (exclusiveCount(c) != 0) {
            if (getExclusiveOwnerThread() != current)
                // 写锁被分配，非写锁线程获取读锁失败
                return -1;
        // else we hold the exclusive lock; blocking here
        // would cause deadlock.
        // 否则，当前线程持有写锁，在这里阻塞将导致死锁
        } else if (readerShouldBlock()) {
            // Make sure we're not acquiring read lock reentrantly
            // 写锁空闲  且  公平策略决定 线程应当被阻塞
            // 如果是已获取读锁的线程重入读锁时，
            // 即使公平策略指示应当阻塞也不会阻塞。
            // 否则也会导致死锁
            if (firstReader == current) {
                // assert firstReaderHoldCount > 0;
            } else {
                if (rh == null) {
                    rh = cachedHoldCounter;
                    if (rh == null || rh.tid != current.getId()) {
                        rh = readHolds.get();
                        if (rh.count == 0)
                            readHolds.remove();
                    }
                }
                // 需要阻塞且是非重入(还未获取读锁的)，获取失败。
                if (rh.count == 0)
                    return -1;
            }
        }

        // 写锁空闲  且  公平策略决定线程可以获取读锁
        if (sharedCount(c) == MAX_COUNT) 
            throw new Error( "Maximum lock count exceeded");
        if (compareAndSetState(c, c + SHARED_UNIT)) {
            // 申请读锁成功，下面的处理跟tryAcquireShared类似
            if (sharedCount(c) == 0) {
                firstReader = current;
                firstReaderHoldCount = 1;
            } else if (firstReader == current) {
                firstReaderHoldCount++;
            } else {
           // 设定最后一次获取读锁的缓存
                if (rh == null)
                    rh = cachedHoldCounter;

                if (rh == null || rh.tid != current.getId())
                    rh = readHolds.get();
                else if (rh.count == 0)
                    readHolds.set(rh);
                rh.count++;

                cachedHoldCounter = rh; // 缓存起来用于释放      cache for release
            }
            return 1;
        }
    }
}

protected final boolean tryReleaseShared(int unused) {
    Thread current = Thread.currentThread();
    // 清理firstReader缓存 或 readHolds里的重入计数
    if (firstReader == current) {
        // assert firstReaderHoldCount > 0;
        if (firstReaderHoldCount == 1)
            firstReader = null;
        else
            firstReaderHoldCount--;
    } else {
        HoldCounter rh = cachedHoldCounter;
        if (rh == null || rh.tid != current.getId())
            rh = readHolds.get();
        int count = rh.count;
        if (count <= 1) {
            // 完全释放读锁
            readHolds.remove();
            if (count <= 0)
                throw unmatchedUnlockException();
        }
        --rh.count; // 主要用于重入退出
    }

    // 循环在CAS更新状态值，主要是把读锁数量减 1
    for (;;) {
        int c = getState();
        int nextc = c - SHARED_UNIT;
        if (compareAndSetState(c, nextc))
            // 释放读锁对其他读线程没有任何影响，
            // 但可以允许等待的写线程继续，如果读锁、写锁都空闲。
            return nextc == 0;
    }
}
```
## 公平性策略
策略由 Sync 的子类 FairSync 和 NonfairSync 实现
```
/**
 * 这个非公平策略的同步器是写锁优先的，申请写锁时总是不阻塞。
 */
static final class NonfairSync extends Sync {
    private static final long serialVersionUID = -8159625535654395037L;
    final boolean writerShouldBlock() {
        return false; // 写线程总是可以突入
    }
    final boolean readerShouldBlock() {
        /* 作为一个启发用于避免写线程饥饿，如果线程临时出现在等待队列的头部则阻塞，
         * 如果存在这样的，则是写线程。
         */
        return apparentlyFirstQueuedIsExclusive();
    }
}

/**
 * 公平的 Sync，它的策略是：如果线程准备获取锁时，
 * 同步队列里有等待线程，则阻塞获取锁，不管是否是重入
 * 这也就需要tryAcqire、tryAcquireShared方法进行处理。
 */
static final class FairSync extends Sync {
    private static final long serialVersionUID = -2274990926593161451L;
    final boolean writerShouldBlock() {
        return hasQueuedPredecessors();
    }
    final boolean readerShouldBlock() {
        return hasQueuedPredecessors();
    }
}
```
现在用奇数表示申请读锁的读线程，偶数表示申请写锁的写线程，每个数都表示一个不同的线程，存在下面这样的申请队列，假设开始时锁空闲：

1  3  5  0  7  9  2  4
读线程1申请读锁时，锁是空闲的，马上分配，读线程3、5申请时，由于已分配读锁，它们也可以马上获取读锁。
假设此时有线程11申请读锁，由于它不是读锁重入，只能等待。而线程1再次申请读锁是可以的，因为它的重入。
写线程0申请写锁时，由于分配了读锁，只能等待，当读线程1、3、5都释放读锁后，线程0可以获取写锁。
线程0释放后，线程7、9获取读锁，它们释放后，线程2获取写锁，此时线程4必须等待线程2释放。
线程4在线程2释放写锁后获取写锁，它释放写锁后，锁恢复空闲



# 参考
https://blog.csdn.net/qq_42046105/article/details/102384342