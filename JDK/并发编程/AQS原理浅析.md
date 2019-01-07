# 1 AQS（AbstractQueuedSynchronizer）
## 1.1 基本模型
![](https://upload-images.jianshu.io/upload_images/4685968-a7056d4c8afa2bfa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-28eb1053dd96343e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-02e979128dd1a9fa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![CLH 队列( FIFO)](https://upload-images.jianshu.io/upload_images/4685968-fb7f2d5bbff78f38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.2 类型
![](https://upload-images.jianshu.io/upload_images/4685968-4694e4866f31515a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 独占锁
每次只能有一个线程能持有锁，ReentrantLock就是以独占方式实现的互斥锁。
独占锁是一种悲观保守的加锁策略，它避免了读/读冲突，如果某个只读线程获取锁，则其他读线程都只能等待，这种情况下就限制了不必要的并发性，因为读操作并不会影响数据的一致性
- 共享锁
允许多个线程同时获取锁，并发访问共享资源
共享锁则是一种乐观锁，它放宽了加锁策略，允许多个执行读操作的线程同时访问共享资源。 java的并发包中提供了ReadWriteLock，读-写锁。它允许一个资源可以被多个读操作访问，或者被一个 写操作访问，但两者不能同时进行
AQS的内部类Node定义了两个常量SHARED和EXCLUSIVE，他们分别标识 AQS队列中等待线程的锁获取模式。
![](https://upload-images.jianshu.io/upload_images/4685968-3ceb1ec59d70d65b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f19f67a533d4500a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.3  锁的公平与非公平
锁的公平与非公平，是指线程请求获取锁的过程中，是否允许插队。
在公平锁上，线程将按他们发出请求的顺序来获得锁；而非公平锁则允许在线程发出请求后立即尝试获取锁，如果可用则可直接获取锁，尝试失败才进行排队等待。
ReentrantLock提供了两种锁获取方式
- FairSyn
- NofairSync

结论：ReentrantLock是以独占锁的加锁策略实现的互斥锁，同时它提供了公平和非公平两种锁获取方式。最初看源码时竟然把这两个概念弄混了
## 1.4 架构  
 AQS提供了独占锁和共享锁必须实现的方法
- 具有独占锁功能的子类
它必须实现tryAcquire、tryRelease、isHeldExclusively等,ReentrantLock是一种独占锁
- 共享锁功能的子类
必须实现tryAcquireShared和tryReleaseShared等方法，带有Shared后缀的方法都是支持共享锁加锁的语义。Semaphore是一种共享锁
![](https://upload-images.jianshu.io/upload_images/4685968-4b7cf4a30adb76b1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这里就以`ReentrantLock`排它锁为例开始讲解如何利用AQS
# 2 ReentrantLock
## 2.1 构造方法
![](https://upload-images.jianshu.io/upload_images/4685968-dc5fef0586950cf3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
显然，对象中有一个属性叫`sync`
![](https://upload-images.jianshu.io/upload_images/4685968-6044db1e72a633b5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
有两种不同的实现类
- `NonfairSync`（默认实现）
- `FairSync`

它们都是排它锁的内部类，不论用哪一个都能实现排它锁，只是内部可能有点原理上的区别。先以`NonfairSync`为例
![](https://upload-images.jianshu.io/upload_images/4685968-9e0903ecdcf73bf8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`lock()`先通过CAS尝试将状态从0修改为1
  - 若直接修改成功，前提条件自然是锁的状态为0，则直接将线程的OWNER修改为当前线程，这是一种理想情况，如果并发粒度设置适当也是一种乐观情况
  - 若该动作未成功，则会间接调用`acquire(1)`
![](https://upload-images.jianshu.io/upload_images/4685968-a5d664e36dbcf27e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
`acquire(int)`就定义在`AbstractQueuedSynchronizer`
## tryAcquire / tryRelease
首先看`tryAcquire(arg)`的调用（传入的参数是1），在`NonfairSync`中，会这样来实现
![](https://upload-images.jianshu.io/upload_images/4685968-7c66ff929e8dbac6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-933f1ae5b6b3a8b1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
首先获取这个锁的状态
- 若状态为0，则尝试设置状态为传入的参数（这里就是1），若设置成功就代表自己获取到了锁，返回`true`
状态为0设置1的动作在外部就有做过一次，内部再一次做只是提升概率，而且这样的操作相对锁来讲不占开销
- 若状态非0，则判定当前线程是否为排它锁的Owner，如果是Owner则尝试将状态增加acquires（也就是增加1），如果这个状态值溢出，则抛异常，否则即将状态设置进去后返回true（实现类似于偏向的功能，可重入，但是无需进一步征用）
- 如果状态不是0，且自身不是owner，则返回false
![image.png](https://upload-images.jianshu.io/upload_images/4685968-9bf53d5d8bfadc0b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

回到对`acquire()`的调用判定中是通过`if(!tryAcquire())`作为第1个条件的，如果返回true，则判定就不会成立了，自然后面的acquireQueued动作就不会再执行了，如果发生这样的情况是最理想的。

无论多么乐观，征用是必然存在的，如果征用存在则owner自然不会是自己，`tryAcquire()`会返回false，接着就会再调用方法：`acquireQueued(addWaiter(Node.EXCLUSIVE), arg)`
这个方法的调用的代码更不好懂，需要从里往外看，这里的Node.EXCLUSIVE是节点的类型
![](https://upload-images.jianshu.io/upload_images/4685968-b7654e6a89dfa0ec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
看名称应该清楚是排它类型的意思。接着调用addWaiter()来增加一个排它锁类型的节点，这个addWaiter()的代码是这样写的：
![](https://upload-images.jianshu.io/upload_images/4685968-a1955d0e941422c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这里创建了一个Node的对象，将当前线程和`Node.EXCLUSIVE`模式传入，也就是说Node节点理论上包含了这两项信息
代码中的tail是AQS的一个属性
![](https://upload-images.jianshu.io/upload_images/4685968-9a14f387f33cf1fb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
刚开始的时候肯定是为`null`，也就是不会进入第一层if判定的区域，而直接会进入`enq(node)`的代码
![](https://upload-images.jianshu.io/upload_images/4685968-361894babed357bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
看到了`tail`就应该猜到了`AQS是链表`，而且它还应该有一个head引用来指向链表的头节点
AQS在初始化的时候head、tail都是null，在运行时来回移动
AQS是一个基于状态（state）的链表管理方式
```
/**
 * 这个插入会检测head tail 的初始化, 必要的话会初始化一个 dummy 节点, 这个和 ConcurrentLinkedQueue 一样的
 */
/**
 * 将节点 node 加入队列
 * 这里有个注意点
 * 情况:
 *      1. 首先 queue是空的
 *      2. 初始化一个 dummy 节点
 *      3. 这时再在tail后面添加节点(这一步可能失败, 可能发生竞争被其他的线程抢占)
 *  这里为什么要加入一个 dummy 节点呢?
 *      这里的 Sync Queue 是CLH lock的一个变种, 线程节点 node 能否获取lock的判断通过其前继节点
 *      而且这里在当前节点想获取lock时通常给前继节点 打上 signal 的标识(表示当前继节点释放lock需要通知我来获取lock)
 *      若这里不清楚的同学, 请先看看 CLH lock的资料 (这是理解 AQS 的基础)
 */
private Node enq(final Node node){
    for(;;){
        Node t = tail;
        if(t == null){ // Must initialize       // 1. 队列为空 初始化一个 dummy 节点 其实和 ConcurrentLinkedQueue 一样
            if(compareAndSetHead(new Node())){  // 2. 初始化 head 与 tail (这个CAS成功后, head 就有值了, 详情将 Unsafe 操作)
                tail = head;
            }
        }else{
            node.prev = t;                      // 3. 先设置 Node.pre = pred (PS: 则当一个 node在Sync Queue里面时  node.prev 一定 != null, 但是 node.prev != null 不能说明其在 Sync Queue 里面, 因为现在的CAS可能失败 )
            if(compareAndSetTail(t, node)){     // 4. CAS node 到 tail
                t.next = node;                  // 5. CAS 成功, 将 pred.next = node (PS: 说明 node.next != null -> 则 node 一定在 Sync Queue, 但若 node 在Sync Queue 里面不一定 node.next != null)
                return t;
            }
        }
    }
}
```
这段代码就是链表的操作
首先这个是一个死循环，而且本身没有锁，因此可以有多个线程进来，假如某个线程进入方法
此时head、tail都是null，自然会进入
`if(t == null)`创建一个Node，这个Node没有像开始那样给予类型和线程，很明显是一个空的Node对象
![此时传入的node和某一个线程创建的Node对象](https://upload-images.jianshu.io/upload_images/4685968-d7c4592ccdc0cdef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
刚才我们很理想的认为只有一个线程会出现这种情况，如果有多个线程并发进入这个if判定区域，可能就会同时存在多个这样的数据结构，在各自形成数据结构后，多个线程都会去做`compareAndSetHead(new Node())`的动作，也就是尝试将这个临时节点设置为head
![](https://upload-images.jianshu.io/upload_images/4685968-e26e3ab3046baead.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
显然并发时只有一个线程会成功，因此成功的那个线程会执行`tail = head`，整个AQS的链表就成为![AQS被第一个请求成功的线程初始化后](https://upload-images.jianshu.io/upload_images/4685968-c116fb5dfd8cfd5f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
有一个线程会成功修改head和tail的值，其它的线程会继续循环，再次循环会进入else
在else语句所在的逻辑中
- 第一步是`node.prev = t`，这个t就是tail的临时值，也就是首先让尝试写入的node节点的prev指针指向原来的结束节点
- 然后尝试通过CAS替换掉AQS中的tail的内容为当前线程的Node
![](https://upload-images.jianshu.io/upload_images/4685968-05e2c8e3d92d064f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 无论有多少个线程并发到这里，依然只会有一个能成功，成功者执行
`t.next = node`，也就是让原先的tail节点的next引用指向现在的node，现在的node已经成为了最新的结束节点，不成功者则会继续循环
![插入一个节点步骤前后动作](https://upload-images.jianshu.io/upload_images/4685968-7bb84a7833688a43.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
总之节点都是在链表尾部写入的，而且是线程安全的

知道了AQS大致的写入是一种双向链表的插入操作，但插入链表节点对锁有何用途呢，我们还得退回到`addWaiter`最终返回了要写入的node节点， 再回退到`acquire ()`中所在的代码中需要将这个返回的node节点作为`acquireQueued`入口参数，并传入另一个参数（依然是1），看看它里面到底做了些什么
```
/**
 * Acquires in exclusive uninterruptible mode for thread already in
 * queue. Used by condition wait methods as well as acquire
 *
 * @param node  the node
 * @param arg the acquire argument
 * @return {@code} if interrupted while waiting
 */
/**
 * 不支持中断的获取锁
 */
final boolean acquireQueued(final Node node, int arg){
    boolean failed = true;
    try {
        boolean interrupted = false;
        for(;;){
            final Node p = node.predecessor();      // 1. 获取当前节点的前继节点 (当一个n在 Sync Queue 里面, 并且没有获取 lock 的 node 的前继节点不可能是 null)
            if(p == head && tryAcquire(arg)){       // 2. 判断前继节点是否是head节点(前继节点是head, 存在两种情况 (1) 前继节点现在占用 lock (2)前继节点是个空节点, 已经释放 lock, node 现在有机会获取 lock); 则再次调用 tryAcquire尝试获取一下
                setHead(node);                       // 3. 获取 lock 成功, 直接设置 新head(原来的head可能就直接被回收)
                p.next = null; // help GC          // help gc
                failed = false;
                return interrupted;                // 4. 返回在整个获取的过程中是否被中断过 ; 但这又有什么用呢? 若整个过程中被中断过, 则最后我在 自我中断一下 (selfInterrupt), 因为外面的函数可能需要知道整个过程是否被中断过
            }
            if(shouldParkAfterFailedAcquire(p, node) && // 5. 调用 shouldParkAfterFailedAcquire 判断是否需要中断(这里可能会一开始 返回 false, 但在此进去后直接返回 true(主要和前继节点的状态是否是 signal))
                    parkAndCheckInterrupt()){      // 6. 现在lock还是被其他线程占用 那就睡一会, 返回值判断是否这次线程的唤醒是被中断唤醒
                interrupted = true;
            }
        }
    }finally {
        if(failed){                             // 7. 在整个获取中出错
            cancelAcquire(node);                // 8. 清除 node 节点(清除的过程是先给 node 打上 CANCELLED标志, 然后再删除)
        }
    }
}
```
这里也是一个死循环，除非进入`if(p == head && tryAcquire(arg))`，而p为`node.predcessor()`得到
![](https://upload-images.jianshu.io/upload_images/4685968-5c4353c6ca9b2caf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-212c321db4092bad.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这个方法返回node节点的前一个节点，也就是说只有当前一个节点是head时，进一步尝试通过`tryAcquire(arg)`来征用才有机会成功
`tryAcquire(arg)`成立的条件为：锁的状态为0，且通过CAS尝试设置状态成功或线程的持有者本身是当前线程才会返回true，我们现在来详细拆分这部分代码。
○ 如果这个条件成功后，发生的几个动作包含：
（1） 首先调用setHead(Node)
![](https://upload-images.jianshu.io/upload_images/4685968-b22e59333dd2bd1d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这个操作会将传入的node节点作为AQS的head所指向的节点。线程属性设置为空（因为现在已经获取到锁，不再需要记录下这个节点所对应的线程了）
![](https://upload-images.jianshu.io/upload_images/4685968-680ccec19b2e7ce6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
再将这个节点的prev引用赋值为null
（2） 进一步将前一个节点的next引用赋值为null。
在进行了这样的修改后，队列的结构就变成了以下这种情况了，通过这样的方式，就可以让执行完的节点释放掉内存区域，而不是无限制增长队列，也就真正形成FIFO了：
![CAS成功获取锁后，队列的变化](https://upload-images.jianshu.io/upload_images/4685968-f4d36150337c045d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
○ 如果这个判定条件失败
会首先判定：“shouldParkAfterFailedAcquire(p , node)”，这个方法内部会判定前一个节点的状态是否为：“Node.SIGNAL”，若是则返回true，若不是都会返回false，不过会再做一些操作：判定节点的状态是否大于0，若大于0则认为被“CANCELLED”掉了（我们没有说明几个状态的值，不过大于0的只可能被CANCELLED的状态），因此会从前一个节点开始逐步循环找到一个没有被“CANCELLED”节点，然后与这个节点的next、prev的引用相互指向；如果前一个节点的状态不是大于0的，则通过CAS尝试将状态修改为“Node.SIGNAL”，自然的如果下一轮循环的时候会返回值应该会返回true。
如果这个方法返回了true，则会执行：“parkAndCheckInterrupt()”方法，它是通过LockSupport.park(this)将当前线程挂起到WATING状态，它需要等待一个中断、unpark方法来唤醒它，通过这样一种FIFO的机制的等待，来实现了Lock的操作。

相应的，可以自己看看FairSync实现类的lock方法，其实区别不大，有些细节上的区别可能会决定某些特定场景的需求，你也可以自己按照这样的思路去实现一个自定义的锁。

接下来简单看看unlock()解除锁的方式，如果获取到了锁不释放，那自然就成了死锁，所以必须要释放，来看看它内部是如何释放的。同样从排它锁（ReentrantLock）中的unlock()方法开始
![](https://upload-images.jianshu.io/upload_images/4685968-f5d927da4d032bb9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![unlock方法间接调用AQS的release(1)来完成](https://upload-images.jianshu.io/upload_images/4685968-186a5d604097f75d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
通过tryRelease(int)方法进行了某种判定，若它成立则会将head传入到unparkSuccessor(Node)方法中并返回true，否则返回false。

首先来看看tryRelease(int)方法
![](https://upload-images.jianshu.io/upload_images/4685968-dc1d26d5062071f3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
就是一个设置锁状态的操作，而且是将状态减掉传入的参数值（参数是1），如果结果状态为0，就将排它锁的Owner设置为null，以使得其它的线程有机会进行执行。

在排它锁中，加锁的时候状态会增加1（当然可以自己修改这个值），在解锁的时候减掉1，同一个锁，在可以重入后，可能会被叠加为2、3、4这些值，只有unlock()的次数与lock()的次数对应才会将Owner线程设置为空，而且也只有这种情况下才会返回true。

这一点大家写代码要注意了哦，如果是在循环体中lock()或故意使用两次以上的lock(),而最终只有一次unlock()，最终可能无法释放锁。
   
在方法unparkSuccessor(Node)中，就意味着真正要释放锁了
![](https://upload-images.jianshu.io/upload_images/4685968-10dc69128dc1c76f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
它传入的是head节点（head节点是已经执行完的节点，在后面阐述这个方法的body的时候都叫head节点），内部首先会发生的动作是获取head节点的next节点，
如果获取到的节点不为空，则直接通过`LockSupport.unpark()`释放对应的被挂起的线程，这样一来将会有一个节点唤醒后继续进入`acquireQueued`的循环进一步尝试 `tryAcquire()`来获取锁，但是也未必能完全获取到哦，因为此时也可能有一些外部的请求正好与之征用，而且还奇迹般的成功了，那这个线程的运气就有点悲剧了，不过通常乐观认为不会每一次都那么悲剧。

再看看共享锁，从前面的排它锁可以看得出来是用一个状态来标志锁的，而共享锁也不例外，但是Java不希望去定义两个状态，所以它与排它锁的第一个区别就是在`锁的状态`，它用int来标志锁的状态，int有4个字节，它用高16位标志读锁（共享锁），低16位标志写锁（排它锁），高16位每次增加1相当于增加65536（通过1 << 16得到），自然的在这种读写锁中，读锁和写锁的个数都不能超过65535个（条件是每次增加1的，如果递增是跳跃的将会更少）。在计算读锁数量的时候将状态左移16位，而计算排它锁会与65535“按位求与”操作，如下图所示。
![读写锁中的数量计算及限制](https://upload-images.jianshu.io/upload_images/4685968-61ce30bfe4b6daca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

写锁的功能与“ReentrantLock”基本一致，区域在于它会在`tryAcquire`时，判定状态的时候会更加复杂一些（因此有些时候它的性能未必好）。

读锁也会写入队列，Node的类型被改为 `Node.SHARED`
`lock()`时候调用的是AQS的`acquireShared(int)`方法，进一步调用`tryAcquireShared()`里面只需要检测是否有排它锁，如果没有则可以尝试通过CAS修改锁的状态，如果没有修改成功，则会自旋这个动作（可能会有很多线程在这自旋开销CPU）。如果这个自旋的过程中检测到排它锁竞争成功，那么`tryAcquireShared()`会返回-1，从而会走入排它锁的Node类似的流程，可能也会被park住，等待排它锁相应的线程最终调用unpark()动作来唤醒。

这就是Java提供的这种读写锁，不过这并不是共享锁的诠释，在共享锁里面也有多种机制 ，或许这种读写锁只是其中一种而已。在这种锁下面，读和写的操作本身是互斥的，但是读可以多个一起发生。

这样的锁理论上是非常适合应用`读多写少`的环境下（当然我们所讲的读多写少是读的比例远远大于写，而不是多一点点），理论上讲这样锁征用的粒度会大大降低，同时系统的瓶颈会减少，效率得到总体提升。

在本节中我们除了学习到AQS的内在,这个是Java层面的队列模型，其实我们也可以利用许多队列模型来解决自己的问题，甚至于可以改写模型模型来满足自己的需求

##  2.4  ConditionObject
ReentrantLock是独占锁，而且AQS的ConditionObject只能与ReentrantLock一起使用，它是为了支持条件队列的锁更方便
ConditionObject的signal和await方法都是基于独占锁的，如果线程非锁的独占线程，则会抛出IllegalMonitorStateException
例如signalAll源码：
```
        public final void signalAll() {
            if (!isHeldExclusively())
                throw new IllegalMonitorStateException();
            Node first = firstWaiter;
            if (first != null)
                doSignalAll(first);
        }
```
      我在想，既然Condtion是为了支持Lock的，为什么ConditionObject不作为ReentrantLock的内部类呢？对于实现锁功能的子类，直接扩展它就可以实现对条件队列的支持。但是，对于其它非锁语义的实现类如Semaphore、CountDownLatch等类来说，条件队列是无用的，也会给开发者扩展AQS带来困惑。总之，是各有利弊，大师们的思想，还需要仔细揣摩啊！
#关于Lock及AQS的一些补充：
- Lock的操作不仅仅局限于lock()/unlock()，因为这样线程可能进入WAITING状态，这个时候如果没有unpark()就没法唤醒它，可能会一直“睡”下去，可以尝试用tryLock()、tryLock(long , TimeUnit)来做一些尝试加锁或超时来满足某些特定场景的需要。
例如有些时候发现尝试加锁无法加上，先释放已经成功对其它对象添加的锁，过一小会再来尝试，这样在某些场合下可以避免“死锁”哦。
- lockInterruptibly() 它允许抛出`InterruptException`，也就是当外部发起了中断操作，程序内部有可能会抛出这种异常，但是并不是绝对会抛出异常的，大家仔细看看代码便清楚了。
- newCondition()操作，是返回一个Condition的对象，Condition只是一个接口，它要求实现await()、awaitUninterruptibly()、awaitNanos(long)、await(long , TimeUnit)、awaitUntil(Date)、signal()、signalAll()方法，`AbstractQueuedSynchronizer`中有一个内部类叫做`ConditionObject`实现了这个接口，它也是一个类似于队列的实现，具体可以参考源码。大多数情况下可以直接使用，当然觉得自己比较牛逼的话也可以参考源码自己来实现。
- 在AQS的Node中有每个Node自己的状态（waitStatus），我们这里归纳一下，分别包含:
  - SIGNAL 从前面的代码状态转换可以看得出是前面有线程在运行，需要前面线程结束后，调用unpark()方法才能激活自己，值为：-1
  - CANCELLED 当AQS发起取消或fullyRelease()时，会是这个状态。值为1，也是几个状态中唯一一个大于0的状态，所以前面判定状态大于0就基本等价于是CANCELLED的意思。
  - CONDITION 线程基于Condition对象发生了等待，进入了相应的队列，自然也需要Condition对象来激活，值为-2。

PROPAGATE 读写锁中，当读锁最开始没有获取到操作权限，得到后会发起一个doReleaseShared()动作，内部也是一个循环，当判定后续的节点状态为0时，尝试通过CAS自旋方式将状态修改为这个状态，表示节点可以运行。
状态0 初始化状态，也代表正在尝试去获取临界资源的线程所对应的Node的状态。

#羊群效应
说一下羊群效应，当有多个线程去竞争同一个锁的时候，假设锁被某个线程占用，那么如果有成千上万个线程在等待锁，有一种做法是同时唤醒这成千上万个线程去去竞争锁，这个时候就发生了羊群效应，海量的竞争必然造成资源的剧增和浪费，因此终究只能有一个线程竞争成功，其他线程还是要老老实实的回去等待。
AQS的FIFO的等待队列给解决在锁竞争方面的羊群效应问题提供了一个思路：保持一个FIFO队列，队列每个节点只关心其前一个节点的状态，线程唤醒也只唤醒队头等待线程。
这个思路已经被应用到了分布式锁的实践中
