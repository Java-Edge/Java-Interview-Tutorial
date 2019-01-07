> 并发编程的关键是什么，知道吗？

![](https://img-blog.csdnimg.cn/2021042110181946.png)

我淡淡一笑，还好平时就玩的高并发架构设计，不然真被你唬住了！

- 互斥
同一时刻，只允许一个线程访问共享资源
- 同步
线程之间通信、协作


而且这俩问题，管程都能解决。JUC通过**Lock**和**Condition**接口实现管程
- **Lock** 解决互斥
- **Condition** 解决同步

只见 P8 不慌不忙，又开始问道：

> synchronized也是管程的实现，既然Java已经在SDK实现了管程，为什么还要提供另一种实现？难道JDK作者们喜欢“重复造轮子”？

它们还是有很大区别的。在JDK 1.5，synchronized性能差于Lock，但1.6后，synchronized被优化，将性能提高，所以1.6后又推荐使用synchronized。但性能问题只要优化一下就行了，没必要“重复造轮子”。
> 死锁问题讨论，推荐看我另一篇文章：[操作系统之进程管理](https://javaedge.blog.csdn.net/article/details/79864874)

而关键在于，死锁问题的破坏“不可抢占”条件，该条件synchronized无法达到。因为synchronized申请资源时，若申请不到，线程直接阻塞，阻塞态的线程无所作为，也释放不了线程已经占有的资源。但我们希望：
对于“不可抢占”条件，占用部分资源的线程进一步申请其他资源时，若申请不到，可以主动释放它占有的资源，这样“不可抢占”条件就被破坏掉了。

若重新设计一把互斥锁去解决这个问题，咋搞呢？如下设计都能破坏“不可抢占”条件：   
![](https://img-blog.csdnimg.cn/20210420231345268.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 能响应中断
使用synchronized持有 **锁X** 后，若尝试获取 **锁Y** 失败，则线程进入阻塞，一旦死锁，就再无机会唤醒阻塞线程。但若阻塞态的线程能够响应中断信号，即当给阻塞线程发送**中断信号**时，能唤醒它，那它就有机会释放曾经持有的 **锁X**。
- 支持超时
若线程在一段时间内，都没有获取到锁，不是进入阻塞态，而是返回一个错误，则该线程也有机会释放曾经持有的锁
- 非阻塞地获取锁
如果尝试获取锁失败，并不进入阻塞状态，而是直接返回，那这个线程也有机会释放曾经持有的锁

这些设计都弥补了synchronized的缺点。也就是造出Lock的主要原因，其实就是Lock的如下方法：
- lockInterruptibly() 支持中断
![](https://img-blog.csdnimg.cn/2021042110461053.png)

- tryLock(long time, TimeUnit unit) 支持超时
![](https://img-blog.csdnimg.cn/20210421104944523.png)
- tryLock() 支持非阻塞获取锁
![](https://img-blog.csdnimg.cn/20210421105016675.png)

> 那你知道它是如何保证可见性的吗？

Lock经典案例就是try/finally，必须在finally块里释放锁。
Java多线程的可见性是通过Happens-Before规则保证的，而Happens-Before 并没有提到 Lock 锁。那Lock靠什么保证可见性呢？
![](https://img-blog.csdnimg.cn/20210421111101974.png)
![](https://img-blog.csdnimg.cn/20210421111039727.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
肯定的，它是利用了volatile的Happens-Before规则。因为 ReentrantLock 的内部类继承了 AQS，其内部维护了一个volatile 变量state
![](https://img-blog.csdnimg.cn/2021042113041552.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20210421130332670.png)

- 获取锁时，会读写state
- 解锁时，也会读写state
![](https://img-blog.csdnimg.cn/20210421131811540.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

所以，执行value+=1前，程序先读写一次volatile state，在执行value+=1后，又读写一次volatile state。根据Happens-Before的如下规则判定：
- 顺序性规则：**线程t1的value+=1** Happens-Before **线程t1的unlock()**
- volatile变量规则：由于此时 state为1，会先读取state，所以**线程t1的unlock()** Happens-Before **线程t2的lock()**
- 传递性规则：**线程t的value+=1** Happens-Before **线程t2的lock()**

> 说说什么是可重入锁？

可重入锁，就是线程可以重复获取同一把锁，示例如下：
![](https://img-blog.csdnimg.cn/2021042113474062.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

> 听说过可重入方法吗？
orz，这是什么鬼？P8 看我一时靓仔语塞，就懂了，说到：没关系，就随便问问，看看你的知识面。

其实就是多线程可以同时调用该方法，每个线程都能得到正确结果；同时在一个线程内支持线程切换，无论被切换多少次，结果都是正确的。多线程可以同时执行，还支持线程切换。所以，可重入方法是线程安全的。


> 那你来简单说说公平锁与非公平锁吧？

比如ReentrantLock有两个构造器，一个是无参构造器，一个是传入fair参数的。
fair参数代表锁的公平策略，true：需要构造一个公平锁，false：构造一个非公平锁（默认）。
![](https://img-blog.csdnimg.cn/20210421140524934.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

> 知道锁的入口等待队列吗？

锁都对应一个等待队列，如果一个线程没有获得锁，就会进入等待队列，当有线程释放锁的时候，就需要从等待队列中唤醒一个等待的线程。
若是公平锁，唤醒策略就是谁等待的时间长，就唤醒谁，这很公平
若是非公平锁，则不提供这个公平保证，所以可能等待时间短的线程被先唤醒。非公平锁的场景应该是线程释放锁之后，如果来了一个线程获取锁，他不必去排队直接获取到，不会入队。获取不到才入队。

> 说说你对锁的一些最佳实践

锁虽然能解决并发问题，但风险也高的。可能会导致死锁，也会影响性能。Doug Lea推荐的三个用锁的最佳实践：
- 永远只在更新对象的成员变量时加锁
- 永远只在访问可变的成员变量时加锁
- 永远不在调用其他对象的方法时加锁
因为调用其他对象的方法，实在是太不安全了，也许“其他”方法里面有线程sleep()的调用，也可能会有奇慢无比的I/O操作，这些都会严重影响性能。更可怕的是，“其他”类的方法可能也会加锁，然后双重加锁就可能导致死锁。

还有一些常见的比如说，减少锁的持有时间、减小锁的粒度。本质相同，即只在该加锁的地方加锁。

> 最后，来看个小代码，你看有啥问题吗？

![](https://img-blog.csdnimg.cn/2021042114235193.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
不会出现死锁，因为不存在阻塞情况。但会出现活锁，线程较多的情况会导致部分线程始终无法获取到锁，导致活锁。即可能互相持有各自的锁，发现需要的对方的锁都被对方持有，就会释放当前持有的锁，导致大家都在不停持锁，释放锁，但事情还没做。当然还是会存在转账成功的情景，不过效率低下。

成功转账后应该跳出循环，但加了break，也会有活锁问题，不加也是活锁，因为锁都会释放。所以加个随机重试时间避免活锁。

活锁还是比死锁容易解决的，加个随机等待时间或客户端手动重试即可。
优化后代码如下：
![](https://img-blog.csdnimg.cn/20210421143652839.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

还有 notifyAll() 在面对公平锁和非公平锁的时候，效果一样。所有等待队列中的线程全部被唤醒，统统到入口等待队列中排队？这些被唤醒的线程不用根据等待时间排队再放入入口等待队列中了吧？
都被唤醒。理论上是同时进入入口等待队列，等待时间是相同的。

CPU层面的原子性是单条cpu指令。Java层面的互斥（管程）保证了原子性。
这两个原子性意义不一样。cpu的原子性是不受线程调度影响，指令要不执行了，要么没执行。而Java层面的原子性是在锁的机制下保证只有一个线程执行，其余等待，此时cpu还是可以进行线程调度，使运行中的那个线程让出cpu时间，当然了该线程还是掌握锁。