# 1 读写锁，一个用于只读，一个用于写入
只要没有writer，读锁可以由多个reader线程同时保持。
写锁是独占的。

- 互斥锁一次只允许一个线程访问共享数据，哪怕是只读
- 读写锁允许对共享数据进行更高性能的并发访问
     - 对于写操作，一次只有一个线程（write线程）可修改共享数据
     - 对于读操作，允许任意数量的线程同时读取

与互斥锁相比，使用读写锁能否提升性能则取决于读写操作期间`读取数据相对于修改数据的频率，以及数据的争用,即在同一时间试图对该数据执行读取或写入操作的线程数`。

读写锁适用于`读多写少`的场景。

# 2 可重入读写锁 ReentrantReadWriteLock
可重入锁，又名递归锁。
## 2.1 属性
`ReentrantReadWriteLock` 基于 `AbstractQueuedSynchronizer `实现，具有如下属性

### 获取顺序
此类不会将读/写者优先强加给锁访问的排序。

- 非公平模式（默认）
连续竞争的非公平锁可能无限期推迟一或多个读或写线程，但吞吐量通常要高于公平锁。 
  
- 公平模式
线程利用一个近似到达顺序的策略来竞争进入。
当释放当前持有的锁时，可以为等待时间最长的单个writer线程分配写锁，如果有一组等待时间大于所有正在等待的writer线程的reader，将为该组分配读锁。
试图获得公平写入锁的非重入的线程将会阻塞，除非读取锁和写入锁都自由（这意味着没有等待线程）。
### 重入
此锁允许reader和writer按照 ReentrantLock 的样式重新获取读/写锁。在写线程保持的所有写锁都已释放后，才允许重入reader使用读锁
writer可以获取读取锁，但reader不能获取写入锁。
### 锁降级
重入还允许从写锁降级为读锁，实现方式是：先获取写锁，然后获取读取锁，最后释放写锁。但是，`从读取锁升级到写入锁是不可能的`。
### 锁获取的中断
读锁和写锁都支持锁获取期间的中断。
### Condition 支持
写锁提供了一个 Condition 实现，对于写锁来说，该实现的行为与 `ReentrantLock.newCondition()` 提供的 Condition 实现对 ReentrantLock 所做的行为相同。当然，`此 Condition 只能用于写锁`。
读锁不支持 Condition，readLock().newCondition() 会抛UnsupportedOperationException
### 监测
此类支持一些确定是读锁还是写锁的方法。这些方法设计用于监视系统状态，而不是同步控制。

# 3 AQS 
- 记录当前加锁的是哪个线程，初始化状态下，这个变量是null![](https://img-blog.csdnimg.cn/20191018234504480.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

接着线程1跑过来调用ReentrantLock#lock()尝试加锁：直接用CAS操作将state值从0变为1。
如果之前没人加过锁，那么state的值肯定是0，此时线程1就可以加锁成功。
一旦线程1加锁成功了之后，就可以设置当前加锁线程是自己。

- 线程1跑过来加锁的一个过程
![](https://img-blog.csdnimg.cn/20191018235617253.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
加锁线程变量

其实每次线程1可重入加锁一次，会判断一下当前加锁线程就是自己，那么他自己就可以可重入多次加锁，每次加锁就是把state的值给累加1，别的没啥变化。

接着，如果线程1加锁了之后，线程2跑过来加锁会怎么样呢？

## 锁的互斥是如何实现的？
线程2跑过来一下看到 state≠0，所以CAS将state 01=》失败，因为state的值当前为1，已有人加锁了！

接着线程2会看一下，是不是自己之前加的锁啊？当然不是了，“加锁线程”这个变量明确记录了是线程1占用了这个锁，所以线程2此时就是加锁失败。
![](https://img-blog.csdnimg.cn/20191019000850859.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

接着，线程2会将自己放入AQS中的一个等待队列，因为自己尝试加锁失败了，此时就要将自己放入队列中来等待，等待线程1释放锁之后，自己就可以重新尝试加锁了。
![](https://img-blog.csdnimg.cn/20191019001308340.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

接着，线程1在执行完自己的业务逻辑代码之后，就会释放锁：将AQS内的state变量的值减1，若state值为0，则彻底释放锁，会将“加锁线程”变量也设置为null。
![](https://img-blog.csdnimg.cn/20191019001520803.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

接下来，会从等待队列的队头唤醒线程2重新尝试加锁。线程2现在就重新尝试加锁：CAS将state从0变为1，此时就会成功，成功之后代表加锁成功，就会将state设置为1。还要把“加锁线程”设置为线程2自己，同时线程2自己就从等待队列中出队了。
![](https://img-blog.csdnimg.cn/20191019001626741.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- ReentrantLock，它是可重入的独占锁，内部的 Sync 类实现了 tryAcquire(int)、tryRelease(int) 方法，并用状态的值来表示重入次数，加锁或重入锁时状态加 1，释放锁时状态减 1，状态值等于 0 表示锁空闲。

- CountDownLatch，它是一个关卡，在条件满足前阻塞所有等待线程，条件满足后允许所有线程通过。内部类 Sync 把状态初始化为大于 0 的某个值，当状态大于 0 时所有wait线程阻塞，每调用一次 countDown 方法就把状态值减 1，减为 0 时允许所有线程通过。利用了AQS的**共享模式**。

# 4 AQS只有一个状态，那么如何表示多个读锁与单个写锁
ReentrantLock 里，状态值表示重入计数
- 现在如何在AQS里表示每个读锁、写锁的重入次数呢
- 如何实现读锁、写锁的公平性呢

一个状态是没法既表示读锁，又表示写锁的，那就辦成两份用了!
**状态的高位部分表示读锁，低位表示写锁**。由于写锁只有一个，所以写锁的重入计数也解决了，这也会导致写锁可重入的次数减小。

由于读锁可以同时有多个，肯定不能再用辦成两份用的方法来处理了。但我们有 `ThreadLocal`，可以把线程重入读锁的次数作为值存在 `ThreadLocal `。

对于公平性的实现，可以通过AQS的等待队列和它的抽象方法来控制。在状态值的另一半里存储当前持有读锁的线程数。
- 如果读线程申请读锁，当前写锁重入次数不为 0 时，则等待，否则可以马上分配
- 如果是写线程申请写锁，当前状态为 0 则可以马上分配，否则等待。