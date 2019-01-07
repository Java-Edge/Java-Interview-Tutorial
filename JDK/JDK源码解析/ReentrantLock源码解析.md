学习完 AQS，本文我们就来研究第一个 AQS 的实现类：ReentrantLock。

# 1 基本设计
`ReentrantLock` 可重入锁，可重入表示同一个线程可以对同一个共享资源重复的加锁或释放锁。

具有与使用 synchronized 方法和语句访问的隐式监视器锁相同的基本行为和语义的可重入互斥锁，但具有扩展功能。

`ReentrantLock` 由最后成功锁定但尚未解锁的线程所拥有。当另一个线程不拥有该锁时，调用该锁的线程将成功返回该锁。如果当前线程已经拥有该锁，则该方法将立即返回。可以使用 *isHeldByCurrentThread* 和*getHoldCount* 方法进行检查。

此类的构造函数接受一个可选的 fairness 参数。设置为true时，在争用下，锁倾向于授予给等待时间最长的线程。否则，此锁不能保证任何特定的访问顺序。使用多线程访问的公平锁的程序可能会比使用默认设置的程序呈现较低的总吞吐量（即较慢；通常要慢得多），但获得锁并保证没有饥饿的时间差异较小。但是请注意，锁的公平性不能保证线程调度的公平性。因此，使用公平锁的多个线程之一可能会连续多次获得它，而其他活动线程没有进行且当前未持有该锁。还要注意，未定时的 *tryLock* 方法不支持公平性设置。如果锁可用，即使其他线程正在等待，它将成功。

建议的做法是始终立即在调用后使用try块进行锁定，最常见的是在构造之前/之后，例如：

```java
 class X {
   private final ReentrantLock lock = new ReentrantLock();
   // ...

   public void m() {
     lock.lock();  // block until condition holds
     try {
       // ... method body
     } finally {
       lock.unlock()
     }
   }
 }
```
除了实现Lock接口之外，此类还定义了许多用于检查锁状态的 public 方法和 protected 方法。 其中一些方法仅对检测和监视有用。

此类的序列化与内置锁的行为相同：反序列化的锁处于解锁状态，而不管序列化时的状态如何。

此锁通过同一线程最多支持2147483647个递归锁。 尝试超过此限制会导致锁定方法引发错误。
# 2 类架构
- ReentrantLock 本身不继承 AQS，而是实现了 Lock 接口
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzJhMjI0MGZkY2I?x-oss-process=image/format,png)

Lock 接口定义了各种加锁，释放锁的方法，比如 lock() 这种不响应中断获取锁，在ReentrantLock 中实现的 lock 方法是通过调用自定义的同步器 Sync 中的的同名抽象方法，再由两种模式的子类具体实现此抽象方法来获取锁。

ReentrantLock 就负责实现这些接口，使用时，直接调用的也是这些方法，这些方法的底层实现都是交给 Sync 实现。

# 3 构造方法
- 无参数构造方法
相当于 ReentrantLock(false)，默认为非公平的锁
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzI5ZjY0MWI1MTc?x-oss-process=image/format,png)
- 有参构造方法，可以选择锁的公平性
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzI5ZjJhYWE5YTE?x-oss-process=image/format,png)

可以看出
- 公平锁依靠 FairSync 实现
- 非公平锁依靠 NonfairSync 实现

# 4 Sync 同步器
- 结构图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzJhMDgwZGVkMTc?x-oss-process=image/format,png)
- 继承体系![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzI5ZjI5MWM4YjA?x-oss-process=image/format,png)

可见是ReentrantLock的抽象静态内部类 Sync 继承了 AbstractQueuedSynchronizer ，所以ReentrantLock依靠 Sync 就持有了锁的框架，只需要 Sync 实现 AQS 规定的非 final 方法即可，只交给子类 NonfairSync 和 FairSync 实现 lock 和 tryAcquire 方法

## 4.1 NonfairSync - 非公平锁
- Sync 对象的非公平锁
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzI5ZjM5ZTNhMDQ?x-oss-process=image/format,png)
### 4.1.1 lock
- 非公平模式的 lock 方法
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzJhMTNkYmExYTg?x-oss-process=image/format,png)
- 若 CAS（已经定义并实现在 AQS 中的 final 方法）state 成功，即获取锁成功并将当前线程设置为独占线程
- 若 CAS  state 失败，即获取锁失败，则进入 AQS 中已经定义并实现的  *Acquire* 方法善后

这里的 lock 方法并没有直接调用 AQS 提供的 acquire 方法，而是先试探地使用 CAS 获取了一下锁，CAS 操作失败再调用 acquire 方法。这样设计可以提升性能。因为可能很多时候我们能在第一次试探获取时成功，而不需要再经过 `acquire => tryAcquire => nonfairAcquire` 的调用链。

### 4.1.2 tryAcquire
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzJhMjAzYmVkMmQ?x-oss-process=image/format,png)
其中真正的实现 *nonfairTryAcquire*  就定义在其父类 Sync 中。下一节分析。
## 4.2 FairSync - 公平锁
只实现 *lock* 和 *tryAcquire* 两个方法
### 4.2.1 lock
- 公平模式的 lock
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzJhNGEyZmViNzY?x-oss-process=image/format,png)

直接调用 acquire，而没有像非公平模式先试图获取，因为这样可能导致违反“公平”的语义：在已等待在队列中的线程之前获取了锁。
*acquire* 是 AQS 的方法，表示先尝试获得锁，失败之后进入同步队列阻塞等待，详情见本专栏的上一文
### 4.2.2 tryAcquire
公平模式的 *tryAcquire*。不要授予访问权限，除非递归调用或没有等待线程或是第一个调用的。
- 该方法是 AQS 在 acquire 方法中留给子类去具体实现的
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzJhMjJmYmVkZWM?x-oss-process=image/format,png)

话不多说，看源码：
```java
protected final boolean tryAcquire(int acquires) {
	 // 获取当前的线程
    final Thread current = Thread.currentThread();
    // 获取 state 锁的状态
    int c = getState();
    // state == 0 => 尚无线程获取锁
    if (c == 0) {
    	// 判断 AQS 的同步对列里是否有线程等待，若没有则直接 CAS 获取锁
        if (!hasQueuedPredecessors() &&
            compareAndSetState(0, acquires)) {
            // 获取锁成功，设置独占线程
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    // 判断已经获取锁是否为当前的线程
    else if (current == getExclusiveOwnerThread()) {
    	// 锁的重入, 即 state 加 1
        int nextc = c + acquires;
        if (nextc < 0)
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    return false;
}
```
和 Sync 的 *nonfairTryAcquire* 方法实现类似，唯一不同的是当发现锁未被占用时，使用 *hasQueuedPredecessors* 确保了公平性。
#### hasQueuedPredecessors
会判断当前线程是不是属于同步队列的头节点的下一个节点(头节点是释放锁的节点)
- 如果是(返回false)，符合FIFO，可以获得锁
- 如果不是(返回true)，则继续等待
```java
    public final boolean hasQueuedPredecessors() {
        // 这种方法的正确性取决于头在尾之前初始化和头初始化。如果当前线程是队列中的第一个线程，则next是精确的
        Node t = tail; // 按反初始化顺序读取字段
        Node h = head;
        Node s;
        return h != t &&
            ((s = h.next) == null || s.thread != Thread.currentThread());
    }
```



# 5 nonfairTryAcquire
执行非公平的 *tryLock*。 
*tryAcquire* 是在子类中实现的，但是都需要对*trylock* 方法进行非公平的尝试。

```java
final boolean nonfairTryAcquire(int acquires) {
	// 获取当前的线程
    final Thread current = Thread.currentThread();
    // 获取 AQS 中的 state 字段
    int c = getState();
    // state 为 0，表示同步器的锁尚未被持有
    if (c == 0) {
    	// CAS state 获取锁(这里可能有竞争，所以可能失败)
        if (compareAndSetState(0, acquires)) {
        	// 获取锁成功, 设置获取独占锁的线程
            setExclusiveOwnerThread(current);
            // 直接返回 true
            return true;
        }
    }
    // 判断现在获取独占锁的线程是否为当前线程（可重入锁的体现）
    else if (current == getExclusiveOwnerThread()) {
    	// state 计数加1(重入获取锁)
        int nextc = c + acquires;
        if (nextc < 0) // 整型溢出
            throw new Error("Maximum lock count exceeded");
        // 已经获取 lock，所以这里不考虑并发    
        setState(nextc);
        return true;
    }
    return false;
}
```
无参的 *tryLock* 调用的就是此方法
# 6  tryLock
##  6.1 无参
Lock 接口中定义的方法。

- 仅当锁在调用时未被其他线程持有时，才获取锁
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzJhMjVmYmYyYzg?x-oss-process=image/format,png)
如果锁未被其他线程持有，则获取锁，并立即返回值 true，将锁持有计数设置为1。即使这个锁被设置为使用公平的排序策略，如果锁可用，调用 *tryLock()* 也会立即获得锁，不管其他线程是否正在等待锁。这种妥协行为在某些情况下是有用的，虽然它破坏了公平。如果想为这个锁执行公平设置，那么使用 *tryLock(0, TimeUnit.SECONDS)*，这几乎是等价的(它还可以检测到中断)。

如果当前线程已经持有该锁，那么持有计数将增加1，方法返回true。
如果锁被另一个线程持有，那么这个方法将立即返回值false。

- 典型的使用方法
```java
 Lock lock = ...;
 if (lock.tryLock()) {
   try {
     // manipulate protected state
   } finally {
     lock.unlock();
   }
 } else {
   // 执行可选的操作
 }
```
## 6.2 有参
- 提供了超时时间的入参，在时间内，仍没有得到锁，会返回 false
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzJhMzZhNTAwMzQ?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91c2VyLWdvbGQtY2RuLnhpdHUuaW8vMjAyMC81LzE3LzE3MjIxYzJhM2ZkMGFmZmI?x-oss-process=image/format,png)
其中的 doAcquireNanos 已经实现好在 AQS 中。
# 7 tryRelease
释放锁，对于公平和非公平锁都适用

```java
protected final boolean tryRelease(int releases) {
	// 释放 releases (由于可重入，这里的 c 不一定直接为 0)
    int c = getState() - releases;
    // 判断当前线程是否是获取独占锁的线程
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    boolean free = false;
    // 锁已被完全释放
    if (c == 0) {
        free = true;
        // 无线程持有独占锁，所以置 null
        setExclusiveOwnerThread(null);
    }
    setState(c);
    return free;
}
```
# 8 总结
AQS 搭建了整个锁架构，子类锁的实现只需要根据场景，实现 AQS 对应的方法即可。