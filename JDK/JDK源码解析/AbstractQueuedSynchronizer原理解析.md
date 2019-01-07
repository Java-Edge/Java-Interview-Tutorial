AbstractQueuedSynchronizer 抽象同步队列简称 AQS ，它是实现同步器的基础组件，
并发包中锁的底层就是使用 AQS 实现的.
大多数开发者可能永远不会直接使用AQS ，但是知道其原理对于架构设计还是很有帮助的,而且要理解ReentrantLock、CountDownLatch等高级锁我们必须搞懂 AQS.

# 1 整体感知
## 1.1 架构图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMjA3XzIwMjAwMjA5MTk1MDI3NjQ4LnBuZw?x-oss-process=image/format,png)
AQS框架大致分为五层，自上而下由浅入深，从AQS对外暴露的API到底层基础数据.


当有自定义同步器接入时，只需重写第一层所需要的部分方法即可，不需要关注底层具体的实现流程。当自定义同步器进行加锁或者解锁操作时，先经过第一层的API进入AQS内部方法，然后经过第二层进行锁的获取，接着对于获取锁失败的流程，进入第三层和第四层的等待队列处理，而这些处理方式均依赖于第五层的基础数据提供层。

AQS 本身就是一套锁的框架，它定义了获得锁和释放锁的代码结构，所以如果要新建锁，只要继承 AQS，并实现相应方法即可。

## 1.2 类设计
该类提供了一种框架，用于实现依赖于先进先出（FIFO）等待队列的阻塞锁和相关的同步器（信号量，事件等）。此类的设计旨在为大多数依赖单个原子int值表示 state 的同步器提供切实有用的基础。子类必须定义更改此 state 的 protected 方法，并定义该 state 对于 acquired 或 released 此对象而言意味着什么。鉴于这些，此类中的其他方法将执行全局的排队和阻塞机制。子类可以维护其他状态字段，但是就同步而言，仅跟踪使用方法 *getState*，*setState* 和 *compareAndSetState* 操作的原子更新的int值。
子类应定义为用于实现其所在类的同步属性的非公共内部帮助器类。

子类应定义为用于实现其所在类的同步属性的非 public 内部辅助类。类AbstractQueuedSynchronizer不实现任何同步接口。 相反，它定义了诸如*acquireInterruptible*之类的方法，可以通过具体的锁和相关的同步器适当地调用这些方法来实现其 public 方法。

此类支持默认的排他模式和共享模式:
- 当以独占方式进行获取时，其他线程尝试进行的获取将无法成功
- 由多个线程获取的共享模式可能（但不一定）成功

该类不理解这些差异，只是从机制的意义上说，当共享模式获取成功时，下一个等待线程（如果存在）也必须确定它是否也可以获取。在不同模式下等待的线程们共享相同的FIFO队列。 通常，实现的子类仅支持这些模式之一，但也可以同时出现,比如在ReadWriteLock.仅支持排他模式或共享模式的子类无需定义支持未使用模式的方法.

此类定义了一个内嵌的 **ConditionObject** 类，可由支持独占模式的子类用作Condition 的实现，该子类的 *isHeldExclusively* 方法报告相对于当前线程是否独占同步，使用当前 *getState* 值调用的方法 *release* 会完全释放此对象 ，并获得给定的此保存状态值，最终将该对象恢复为其先前的获取状态。否则，没有AbstractQueuedSynchronizer方***创建这样的条件，因此，如果无法满足此约束，请不要使用它。ConditionObject的行为当然取决于其同步器实现的语义。

此类提供了内部队列的检查，检测和监视方法，以及条件对象的类似方法。 可以根据需要使用 AQS 将它们导出到类中以实现其同步机制。

此类的序列化仅存储基础原子整数维护状态，因此反序列化的对象具有空线程队列。 需要序列化性的典型子类将定义一个readObject方法，该方法在反序列化时将其恢复为已知的初始状态。

# 2 用法
要将此类用作同步器的基础，使用*getState* *setState*和/或*compareAndSetState*检查和/或修改同步状态，以重新定义以下方法（如适用）
- tryAcquire
- tryRelease
- tryAcquireShared
- tryReleaseShared
- isHeldExclusively

默认情况下，这些方法中的每一个都会抛 *UnsupportedOperationException*。
这些方法的实现必须在内部是线程安全的，并且通常应简短且不阻塞。 定义这些方法是使用此类的**唯一**受支持的方法。 所有其他方法都被声明为final，因为它们不能独立变化。

从 AQS 继承的方法对跟踪拥有排他同步器的线程很有用。 鼓励使用它们-这将启用监视和诊断工具，以帮助用户确定哪些线程持有锁。

虽然此类基于内部的FIFO队列，它也不会自动执行FIFO获取策略。 独占同步的核心采用以下形式：
- Acquire
```java
while (!tryAcquire(arg)) {
     如果线程尚未入队，则将其加入队列；
     可能阻塞当前线程；
}
```
-  Release

```java
if (tryRelease(arg))
    取消阻塞第一个入队的线程;
```
共享模式与此相似，但可能涉及级联的signal。

acquire 中的检查是在入队前被调用，所以新获取的线程可能会在被阻塞和排队的其他线程之前插入。但若需要，可以定义tryAcquire、tryAcquireShared以通过内部调用一或多种检查方法来禁用插入，从而提供公平的FIFO获取顺序。 

特别是，若 hasQueuedPredecessors()(公平同步器专门设计的一种方法）返回true，则大多数公平同步器都可以定义tryAcquire返回false.

- 公平与否取决于如下一行代码：
```java
if (c == 0) {
    if (!hasQueuedPredecessors() &&
        compareAndSetState(0, acquires)) {
        setExclusiveOwnerThread(current);
        return true;
    }
}
```
### hasQueuedPredecessors
```java
public final boolean hasQueuedPredecessors() {
    // The correctness of this depends on head being initialized
    // before tail and on head.next being accurate if the current
    // thread is first in queue.
    Node t = tail; // Read fields in reverse initialization order
    Node h = head;
    // s代表等待队列的第一个节点
    Node s;
    // (s = h.next) == null 说明此时有另一个线程正在尝试成为头节点，详见AQS的acquireQueued方法
    // s.thread != Thread.currentThread()：此线程不是等待的头节点
    return h != t &&
        ((s = h.next) == null || s.thread != Thread.currentThread());
}
```



对于默认的插入（也称为贪婪，放弃和convoey-avoidance）策略，吞吐量和可伸缩性通常最高。 尽管不能保证这是公平的或避免饥饿，但允许较早排队的线程在较晚排队的线程之前进行重新竞争，并且每个重新争用都有一次机会可以毫无偏向地成功竞争过进入的线程。 
同样，尽管获取通常无需自旋，但在阻塞前，它们可能会执行tryAcquire的多次调用，并插入其他任务。 如果仅短暂地保持排他同步，则这将带来自旋的大部分好处，而如果不进行排他同步，则不会带来很多负担。 如果需要的话，可以通过在调用之前使用“fast-path”检查来获取方法来增强此功能，并可能预先检查*hasContended*()和/或*hasQueuedThreads()*,以便仅在同步器可能不存在争用的情况下这样做。

此类为同步提供了有效且可扩展的基础，部分是通过将其使用范围规范化到可以依赖于int状态，acquire 和 release 参数以及内部的FIFO等待队列的同步器。 当这还不够时，可以使用原子类、自定义队列类和锁支持阻塞支持从较低级别构建同步器。

# 3 使用案例
这里是一个不可重入的排他锁，它使用值0表示解锁状态，使用值1表示锁定状态。虽然不可重入锁并不严格要求记录当前所有者线程，但是这个类这样做是为了更容易监视使用情况。它还支持条件，并暴露其中一个检测方法:

```java
class Mutex implements Lock, java.io.Serializable {

  // 我们内部的辅助类
  private static class Sync extends AbstractQueuedSynchronizer {
    // 报告是否处于锁定状态
    protected boolean isHeldExclusively() {
      return getState() == 1;
    }

    // 如果 state 是 0,获取锁
    public boolean tryAcquire(int acquires) {
      assert acquires == 1; // Otherwise unused
      if (compareAndSetState(0, 1)) {
        setExclusiveOwnerThread(Thread.currentThread());
        return true;
      }
      return false;
    }

    // 通过将 state 置 0 来释放锁
    protected boolean tryRelease(int releases) {
      assert releases == 1; // Otherwise unused
      if (getState() == 0) throw new IllegalMonitorStateException();
      setExclusiveOwnerThread(null);
      setState(0);
      return true;
    }

    //  提供一个 Condition
    Condition newCondition() { return new ConditionObject(); }

    // 反序列化属性
    private void readObject(ObjectInputStream s)
        throws IOException, ClassNotFoundException {
      s.defaultReadObject();
      setState(0); // 重置到解锁状态
    }
  }

  // 同步对象完成所有的工作。我们只是期待它.
  private final Sync sync = new Sync();

  public void lock()                { sync.acquire(1); }
  public boolean tryLock()          { return sync.tryAcquire(1); }
  public void unlock()              { sync.release(1); }
  public Condition newCondition()   { return sync.newCondition(); }
  public boolean isLocked()         { return sync.isHeldExclusively(); }
  public boolean hasQueuedThreads() { return sync.hasQueuedThreads(); }
  public void lockInterruptibly() throws InterruptedException {
    sync.acquireInterruptibly(1);
  }
  public boolean tryLock(long timeout, TimeUnit unit)
      throws InterruptedException {
    return sync.tryAcquireNanos(1, unit.toNanos(timeout));
  }
}
```

这是一个闩锁类，它类似于*CountDownLatch*，只是它只需要一个单信号就可以触发。因为锁存器是非独占的，所以它使用共享的获取和释放方法。

```java
 class BooleanLatch {

   private static class Sync extends AbstractQueuedSynchronizer {
     boolean isSignalled() { return getState() != 0; }

     protected int tryAcquireShared(int ignore) {
       return isSignalled() ? 1 : -1;
     }

     protected boolean tryReleaseShared(int ignore) {
       setState(1);
       return true;
     }
   }

   private final Sync sync = new Sync();
   public boolean isSignalled() { return sync.isSignalled(); }
   public void signal()         { sync.releaseShared(1); }
   public void await() throws InterruptedException {
     sync.acquireSharedInterruptibly(1);
   }
 }
```

# 4 基本属性与框架
## 4.1 继承体系图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkyOTU4XzIwMjAwMjEwMjMyNTQwMzUwLnBuZw?x-oss-process=image/format,png)
## 4.2 定义
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDk2XzIwMjAwMjEwMjMxMTIwMTMzLnBuZw?x-oss-process=image/format,png)

可知 AQS 是一个抽象类，生来就是被各种子类锁继承的。继承自AbstractOwnableSynchronizer，其作用就是为了知道当前是哪个线程获得了锁，便于后续的监控
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDYyXzIwMjAwMjEwMjMyMzE4MzcyLnBuZw?x-oss-process=image/format,png)


## 4.3 属性
### 4.3.1 状态信息
- volatile 修饰，对于可重入锁，每次获得锁 +1，释放锁 -1
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMTEwXzIwMjAwMjEwMjMyOTI0MTczLnBuZw?x-oss-process=image/format,png)
- 可以通过 *getState* 得到同步状态的当前值。该操作具有 volatile 读的内存语义。
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkyOTM5XzIwMjAwMjEwMjMzMjM0OTE0LnBuZw?x-oss-process=image/format,png)
- setState 设置同步状态的值。该操作具有 volatile 写的内存语义
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDc4XzIwMjAwMjEwMjMzOTI2NjQ3LnBuZw?x-oss-process=image/format,png)
- compareAndSetState 如果当前状态值等于期望值，则以原子方式将同步状态设置为给定的更新值。此操作具有 volatile 读和写的内存语义
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDMyXzIwMjAwMjEwMjM1MjM1NDAzLnBuZw?x-oss-process=image/format,png)
- 自旋比使用定时挂起更快。粗略估计足以在非常短的超时时间内提高响应能力，当设置等待时间时才会用到这个属性
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDY0XzIwMjAwMjExMDAzOTIzNjQxLnBuZw?x-oss-process=image/format,png)

这写方法都是Final的，子类无法重写。
- 独占模式
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkyODIzXzIwMjAwMjExMDIyNTI0NjM5LnBuZw?x-oss-process=image/format,png)
- 共享模式
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDQzXzIwMjAwMjExMDIyNTUxODMwLnBuZw?x-oss-process=image/format,png)
### 4.3.2  同步队列
- CLH 队列( FIFO)
![](https://img-blog.csdnimg.cn/2020100800492945.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/22686302fc050911b9dc9cdaf672934b.png)

- 作用
阻塞获取不到锁(独占锁)的线程，并在适当时机从队首释放这些线程。

同步队列底层数据结构是个双向链表。

- 等待队列的头，延迟初始化。 除初始化外，只能通过 *setHead* 方法修改
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkyODc4XzIwMjAwMjExMDIzMjU4OTU4LnBuZw?x-oss-process=image/format,png)
注意：如果head存在，则其waitStatus保证不会是 *CANCELLED*

- 等待队列的尾部，延迟初始化。 仅通过方法 *enq* 修改以添加新的等待节点
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDk0XzIwMjAwMjExMDIzNTU3MTkyLnBuZw?x-oss-process=image/format,png)
### 4.3.4 条件队列
#### 为什么需要条件队列？
同步队列并非所有场景都能cover，遇到锁 + 队列结合的场景时，就需要 Lock + Condition，先使用 Lock 决定：
- 哪些线程可以获得锁
- 哪些线程需要到同步队列里排队阻塞

获得锁的多个线程在碰到队列满或空时，可使用 Condition 来管理这些线程，让这些线程阻塞等待，然后在合适的时机后，被正常唤醒。

**同步队列 + 条件队列的协作多被用在锁 + 队列场景。**
#### 作用
AQS 的内部类，结合锁实现线程同步。存放调用条件变量的 await 方法后被阻塞的线程

- 实现了 Condition 接口，而 Condition 接口就相当于 Object 的各种监控方法
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMTEwXzIwMjAwMjExMDI0MDUzNi5wbmc?x-oss-process=image/format,png)
需要使用时，直接 new ConditionObject()。

### 4.3.5 Node
同步队列和条件队列的共用节点。
入队时，用 Node 把线程包装一下，然后把 Node 放入两个队列中，我们看下 Node 的数据结构，如下：
####  4.3.5.1 模式
- 共享模式
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDUyXzIwMjAwMjExMDI1NTQxMTYyLnBuZw?x-oss-process=image/format,png)
- 独占模式
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkyOTAzXzIwMjAwMjExMDI1NjE2NzkyLnBuZw?x-oss-process=image/format,png)

####  4.3.5.2  waitstatus - 等待状态
```java
volatile int waitStatus;
```
仅能为如下值：
##### SIGNAL
- 同步队列中的节点在自旋获取锁时，如果前一个节点的状态是 `SIGNAL`，那么自己就直接被阻塞，否则一直自旋
- 该节点的后继节点会被（或很快）阻塞（通过park），因此当前节点释放或取消时必须unpark其后继节点。为避免竞争，acquire方法必须首先指示它们需要一个 signal，然后重试原子获取，然后在失败时阻塞。
```java
static final int SIGNAL    = -1;
```

##### CANCELLED
表示线程获取锁的请求已被取消了：
```java
static final int CANCELLED =  1;
```
可能由于超时或中断，该节点被取消。

节点永远不会离开此状态，此为一种终极状态。具有 cancelled 节点的线程永远不会再次阻塞。
##### CONDITION
该节点当前在条件队列，当节点从同步队列被转移到条件队列，状态就会被更改该态：
```java
static final int CONDITION = -2;
```
在被转移之前，它不会用作同步队列的节点，此时状态将置0（该值的使用与该字段的其他用途无关，仅是简化了机制）。

##### PROPAGATE
线程处在 `SHARED` 情景下，该字段才会启用。

指示下一个**acquireShared**应该无条件传播，共享模式下，该状态的线程处Runnable态
```java
static final int PROPAGATE = -3;
```
*releaseShared* 应该传播到其他节点。 在*doReleaseShared*中对此进行了设置（仅适用于头节点），以确保传播继续进行，即使此后进行了其他操作也是如此。
##### 0
初始化时的默认值。
##### 小结
这些值是以数字方式排列，极大方便了开发者的使用。我们在平时开发也可以定义一些有特殊意义的常量值。

非负值表示节点不需要 signal。 因此，大多数代码并不需要检查特定值，检查符号即可。

- 对于普通的同步节点，该字段初始化为0
- 对于条件节点，该字段初始化为`CONDITION`

使用CAS（或在可能的情况下进行无条件的 volatile 写）对其进行修改。

注意两个状态的区别
- state 是锁的状态，int 型，子类继承 AQS 时，都是要根据 state 字段来判断有无得到锁
- waitStatus 是节点（Node）的状态

#### 4.3.5.3 数据结构
##### 前驱节点
- 链接到当前节点/线程所依赖的用来检查 *waitStatus* 的前驱节点
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkyODY0XzIwMjAwMjEyMDMyNjI1NjYxLnBuZw?x-oss-process=image/format,png)

在入队期间赋值，并且仅在出队时将其清空（为了GC）。

此外，在取消一个前驱结点后，在找到一个未取消的节点后会短路，这将始终存在，因为头节点永远不会被取消：只有成功 acquire 后，一个节点才会变为头。

取消的线程永远不会成功获取，并且线程只会取消自身，不会取消任何其他节点。

##### 后继节点
链接到后继节点，当前节点/线程在释放时将其unpark。 在入队时赋值，在绕过已取消的前驱节点时进行调整，在出队时置null（为了GC）。 
入队操作直到附加后才赋值前驱节点的`next`字段，因此看到`next`字段为 null，并不一定意味该节点位于队尾（有时间间隙）。 

但若`next == null`，则可从队尾开始扫描`prev`以进行再次检查。
```java
// 若节点通过从tail向前搜索发现在在同步队列上，则返回 true
// 仅在调用了 isOnSyncQueue 且有需要时才调用
private boolean findNodeFromTail(Node node) {
    Node t = tail;
    for (;;) {
        if (t == node)
            return true;
        if (t == null)
            return false;
        t = t.prev;
    }
}
```
```java
final boolean isOnSyncQueue(Node node) {
    if (node.waitStatus == Node.CONDITION || node.prev == null)
        return false;
    if (node.next != null) // If has successor, it must be on queue
        return true;
    /**
     * node.prev 可以非null，但还没有在队列中，因为将它放在队列中的 CAS 可能会失败。
     * 所以必须从队尾向前遍历以确保它确实成功了。
     * 在调用此方法时，它将始终靠近tail，并且除非 CAS 失败（这不太可能）
     * 否则它会在那里，因此几乎不会遍历太多
     */    
    return findNodeFromTail(node);
}
```
已取消节点的`next`字段设置为指向节点本身而不是null，以使isOnSyncQueue更轻松。
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDg3XzIwMjAwMjEyMDM1NTAzNjAyLnBuZw?x-oss-process=image/format,png)
- 使该节点入队的线程。 在构造时初始化，使用后消亡。![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkyODcwXzIwMjAwMjEyMjAwMTI3OTkwLnBuZw?x-oss-process=image/format,png)

在同步队列中，nextWaiter 表示当前节点是独占模式还是共享模式
在条件队列中，nextWaiter 表示下一个节点元素

链接到在条件队列等待的下一个节点，或者链接到特殊值`SHARED`。 由于条件队列仅在以独占模式保存时才被访问，因此我们只需要一个简单的链接队列即可在节点等待条件时保存节点。 然后将它们转移到队列中以重新获取。 并且由于条件只能是独占的，因此我们使用特殊值来表示共享模式来保存字段。![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDUxXzIwMjAwMjEyMjAxMjMyODMucG5n?x-oss-process=image/format,png)
# 5 Condition 接口
JDK5 时提供。
- 条件队列 ConditionObject 实现了 Condition 接口
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDc1XzIwMjAwMjEyMjA0NjMxMTMzLnBuZw?x-oss-process=image/format,png)
- 本节就让我们一起来研究之
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDgwXzIwMjAwMjEyMjA1MzQ2NzIyLnBuZw?x-oss-process=image/format,png)

Condition 将对象监视方法（wait，notify和notifyAll）分解为不同的对象，从而通过与任意Lock实现结合使用，从而使每个对象具有多个wait-sets。 当 Lock 替换了 synchronized 方法和语句的使用，Condition 就可以替换了Object监视器方法的使用。

Condition 的实现可以提供与 Object 监视方法不同的行为和语义，例如保证通知的顺序，或者在执行通知时不需要保持锁定。 如果实现提供了这种专门的语义，则实现必须记录这些语义。

Condition实例只是普通对象，它们本身可以用作 synchronized 语句中的目标，并且可以调用自己的监视器 wait 和 notification 方法。 获取 Condition 实例的监视器锁或使用其监视器方法与获取与该条件相关联的锁或使用其 await 和 signal 方法没有特定的关系。 建议避免混淆，除非可能在自己的实现中，否则不要以这种方式使用 Condition 实例。

```java
 class BoundedBuffer {
   final Lock lock = new ReentrantLock();
   final Condition notFull  = lock.newCondition(); 
   final Condition notEmpty = lock.newCondition(); 

   final Object[] items = new Object[100];
   int putptr, takeptr, count;

   public void put(Object x) throws InterruptedException {
     lock.lock();
     try {
       while (count == items.length)
         notFull.await();
       items[putptr] = x;
       if (++putptr == items.length) putptr = 0;
       ++count;
       notEmpty.signal();
     } finally {
       lock.unlock();
     }
   }

   public Object take() throws InterruptedException {
     lock.lock();
     try {
       while (count == 0)
         notEmpty.await();
       Object x = items[takeptr];
       if (++takeptr == items.length) takeptr = 0;
       --count;
       notFull.signal();
       return x;
     } finally {
       lock.unlock();
     }
   }
 }
```
（ArrayBlockingQueue类提供了此功能，因此没有理由实现此示例用法类。）
定义出一些方法，这些方法奠定了条件队列的基础
## API
### await
- 使当前线程等待，直到被 signalled 或被中断
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkyOTkwXzIwMjAwMjEyMjExNzU3ODYyLnBuZw?x-oss-process=image/format,png)

与此 Condition 相关联的锁被原子释放，并且出于线程调度目的，当前线程被禁用，并且处于休眠状态，直到发生以下四种情况之一：
- 其它线程为此 Condition 调用了 signal 方法，并且当前线程恰好被选择为要唤醒的线程
- 其它线程为此 Condition 调用了 signalAll 方法
- 其它线程中断了当前线程，并且当前线程支持被中断
- 发生“虚假唤醒”。

在所有情况下，在此方法可以返回之前，必须重新获取与此 Condition 关联的锁，才能真正被唤醒。当线程返回时，可以保证保持此锁。
### await 超时时间
- 使当前线程等待，直到被 signal 或中断，或经过指定的等待时间
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDczXzIwMjAwMjEyMjIxMjU3NTcyLnBuZw?x-oss-process=image/format,png)

此方法在行为上等效于：
 

```java
awaitNanos(unit.toNanos(time)) > 0
```
所以，虽然入参可以是任意单位的时间，但其实仍会转化成纳秒
### awaitNanos
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkyOTg0XzIwMjAwMjEyMjIxOTMxNTU5LnBuZw?x-oss-process=image/format,png)
注意这里选择纳秒是为了避免计算剩余等待时间时的截断误差


### signal()
- 唤醒条件队列中的一个线程，在被唤醒前必须先获得锁
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkzMDYzXzIwMjAwMjEyMjMwNTQ3NjMzLnBuZw?x-oss-process=image/format,png)
### signalAll()
- 唤醒条件队列中的所有线程
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTMvNTA4ODc1NV8xNTgxNTMzMTkyODkyXzIwMjAwMjEyMjMwNjUzNTM5LnBuZw?x-oss-process=image/format,png)