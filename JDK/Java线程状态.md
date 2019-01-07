# 0 线程状态概述
## 分类
6个状态定义: java.lang.Thread.State
1. New: 尚未启动的线程的线程状态。
2. Runnable: 可运行线程的线程状态，等待CPU调度。
3. Blocked: 线程阻塞等待监视器锁定的线程状态。
处于synchronized同步代码块或方法中被阻塞。
4. Waiting: 等待线程的线程状态。下 列不带超时的方式:
Object.wait、Thread.join、 LockSupport.park
5. Timed Waiting:具有指定等待时间的等待线程的线程状态。下 列带超时的方式:
Thread.sleep、0bject.wait、 Thread.join、 LockSupport.parkNanos、 LockSupport.parkUntil
6. Terminated: 终止线程的线程状态。线程正常完成执行或者出现异常。

## 流程图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTNkNTRmZDU3MzAwMzg2OGIucG5n?x-oss-process=image/format,png)

![](https://img-blog.csdnimg.cn/20190826024812640.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
# 1 NEW
![](https://img-blog.csdnimg.cn/20190826031245454.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
实现Runnable接口和继承Thread可以得到一个线程类，new一个实例出来，线程就进入了初始状态

**`线程还是没有开始执行`**

有状态了，那肯定是已经创建好线程对象了（如果对象都没有，何来状态这说），
问题的焦点就在于还没有开始执行，当调用线程的start()方法时，线程不一定会马上执行，因为`Java线程是映射到操作系统的线程执行`，此时可能还需要等操作系统调度，但此时该线程的状态已经为**RUNNABLE**

# 2 RUNNABLE
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTc0M2ZkYmE4MjZhZTU4NzMucG5n?x-oss-process=image/format,png)

只是说你有资格运行，调度程序没有挑选到你，你就永远是可运行状态。

## 2.1条件
- 调用start()，进入可运行态
- 当前线程sleep()结束，其他线程join()结束，等待用户输入完毕，某个线程拿到对象锁，这些线程也将进入可运行状态
- 当前线程时间片用完，调用当前线程的yield()方法，当前线程进入可运行状态
- 锁池里的线程拿到对象锁后，进入可运行状态
- 正在执行线程必属于此态

这个状态是最有争议的，注释中说了，它表示线程在JVM层面是执行的，但在操作系统层面不一定，它举例是CPU，毫无疑问CPU是一个操作系统资源，但这也就意味着在等操作系统其他资源的时候，线程也会是这个状态

> 这里就有一个关键点IO阻塞算是等操作系统的资源？
# 3 BLOCKED
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWFkMGY4NWY2MjlmZmZiY2EucG5n?x-oss-process=image/format,png)
被挂起,线程因为某种原因放弃了cpu timeslice，暂时停止运行。

## 3.1条件
- 当前线程调用Thread.sleep()，进入阻塞态
- 运行在当前线程里的其它线程调用join()，当前线程进入阻塞态。
- 等待用户输入的时候，当前线程进入阻塞态。

## 3.2 分类
- 等待阻塞
运行的线程执行o.wait()方法，JVM会把该线程放入等待队列(waitting queue)中

- 同步阻塞
运行的线程在获取对象的同步锁时，若该同步锁被别的线程占用，则JVM会把该线程放入锁池(lock pool)中 

- 其他阻塞
运行的线程执行Thread.sleep(long ms)或t.join()方法，或者发出了I/O请求时，JVM会把该线程置为阻塞状态
当sleep()状态超时、join()等待线程终止或者超时、或者I/O处理完毕时，线程重新转入可运行(runnable)状态

线程在阻塞等待monitor lock(监视器锁)
一个线程在进入synchronized修饰的临界区的时候,或者在synchronized临界区中调用Object.wait然后被唤醒重新进入synchronized临界区都对应该态。

结合上面RUNNABLE的分析,也就是I/O阻塞不会进入BLOCKED状态,只有synchronized会导致线程进入该状态

关于BLOCKED状态，注释里只提到一种情况就是进入synchronized声明的临界区时会导致，这个也很好理解，synchronized是JVM自己控制的，所以这个阻塞事件它自己能够知道（对比理解上面的操作系统层面）。

interrupt()是无法唤醒的!只是做个标记而已!

# 4 等待
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQ5MmNhYTA5MzBlYzhmODcucG5n?x-oss-process=image/format,png)
线程拥有对象锁后进入到相应的代码区后，调用相应的“锁对象”的`wait()`后产生的一种结果

- 变相的实现
`LockSupport.park()`
`LockSupport parkNanos( )`
`LockSupport parkUntil( )`
`Thread join( )`

它们也是在等待另一个对象事件的发生，也就是描述了等待的意思。

## `BLOCKED `状态也是等待的意思，有什么关系与区别呢?
- `BLOCKED `是虚拟机认为程序还不能进入某个区域，因为同时进去就会有问题，这是一块临界区
- `wait()`的先决条件是要进入临界区，也就是线程已经拿到了“门票”，自己可能进去做了一些事情，但此时通过判定某些业务上的参数(由具体业务决定),发现还有一些其他配合的资源没有准备充分，那么自己就等等再做其他的事情

有一个非常典型的案例就是通过`wait()`和`notify()`完成生产者/消费者模型
当生产者生产过快，发现仓库满了，即消费者还没有把东西拿走(空位资源还没准备好) 时，生产者就等待有空位再做事情，消费者拿走东西时会发出“有空位了”的消息，那么生产者就又开始工作了
反过来也是一样，当消费者消费过快发现没有存货时，消费者也会等存货到来，生产者生产出内容后发出“有存货了”的消息，消费者就又来抢东西了。


在这种状态下，如果发生了对该线程的`interrupt()`是有用的，处于该状态的线程内部会抛出一个`InerruptedException`
这个异常应当在`run()`里面捕获，使得`run()`正常地执行完成。当然在`run()`内部捕获异常后，还可以让线程继续运行，这完全是根据具体的应用场景来决定的。

在这种状态下，如果某线程对该锁对象做了`notify()`，那么将从等待池中唤醒一个线程重新恢复到`RUNNABLE `
除`notify()`外，还有一个`notifyAll()` ，前者是
唤醒一个处于`WAITING`的线程，而后者是唤醒所有的线程。

Object.wait()是否需要死等呢? 
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQwMGUzNjQ3NDI5ZWQ1ZmMucG5n?x-oss-process=image/format,png)
不是，除中断外，它还有两个重构方法
- Object.wait(int timeout),传入的timeout 参数是超时的毫秒值，超过这个值后会自动唤醒，继续做下面的操作(不会抛出`InterruptedException` ，但是并不意味着我们不去捕获，因为不排除其他线程会对它做`interrup()`)。
- Object.wait(int timeout,int nanos) 这是一个更精确的超时设置，理论上可以精确到纳秒，这个纳秒值可接受的范围是0~999999 (因为100000onS 等于1ms)。

同样的
`LockSupport park( )`
`LockSupport.parkNanos( )`
`LockSupport.parkUntil( )`
`Thread.join()`
这些方法都会有类似的重构方法来设置超时，达到类似的目的，不过此时的状态不再是`WAITING`,而是`TIMED.WAITING`

通常写代码的人肯定不想让程序死掉，但是又希望通过这些等待、通知的方式来实现某些平衡，这样就不得不去尝试采用“超时+重试+失败告知”等方式来达到目的。

# TIMED _WAITING
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWIxMjZlNWM2OTliY2UyNWEucG5n?x-oss-process=image/format,png)
当调用`Thread.sleep()`时,相当于使用某个时间资源作为锁对象，进而达到等待的目的，当时间达到时触发线程回到工作状态。

# TERM_INATED
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE4MmM4ODVmMjU1MzU2NTMucG5n?x-oss-process=image/format,png)
这个线程对象也许是活的，但是，它已经不是一个单独执行的线程,在一个死去的线程上调用start()方法，会抛`java.lang.IllegalThreadStateException`.
线程run()、main() 方法执行结束，或者因异常退出了run()方法，则该线程结束生命周期。死亡的线程不可再次复生。
run()走完了，线程就处于这种状态。其实这只是Java 语言级别的一种状态，在操作系统内部可能已经注销了相应的线程，或者将它复用给其他需要使用线程的请求，而在Java语言级别只是通过Java 代码看到的线程状态而已。

## 为什么`wait( )`和`notify( )`必须要使用synchronized
如果不用就会报`ilegalMonitorStateException`
常见的写法如下:
```java
synchronized(Object){
	object.wait() ;//object.notify() ;
}

synchronized(this){
	this.wait();
}
synchronized fun( ){
	this.wait();//this.notify();
}
```
`wait()`和notify()`是基于对象存在的。
- 那为什么要基于对象存在呢?
既然要等，就要考虑等什么，这里等待的就是一个对象发出的信号，所以要基于对象而存在。
不用对象也可以实现，比如suspend()/resume()就不需要，但是它们是反面教材，表面上简单，但是处处都是问题

理解基于对象的这个道理后，目前认为它调用的方式只能是`Object.wait()`，这样才能和对象挂钩。但这些东西还与问题“wait()/notify() 为什么必须要使用synchronized" 没有
半点关系，或者说与对象扯上关系，为什么非要用锁呢?

既然是基于对象的，因此它不得不用一个数据结构来存放这些等
待的线程，而且这个数据结构应当是与该对象绑定的(通过查看C++代码，发现该数据结构为一个双向链表)，此时在这个对象上可能同时有多个线程调用wait()/notify(),在向这个对象所对应的双向链表中写入、删除数据时，依然存在并发的问题，理论上
也需要一个锁来控制。在JVM 内核源码中并没有发现任何自己用锁来控制写入的动作，只是通过检查当前线程是否为对象的OWNER 来判定是否要抛出相应的异常。由此可见它希望该动作由Java 程序这个抽象层次来控制，它为什么不想去自己控制锁呢?
因为有些时候更低抽象层次的锁未必是好事，因为这样的请求对于外部可能是反复循环地去征用，或者这些代码还可能在其他地方复用，也许将它粗粒度化会更好一些，而且这样的代在写在Java 程序中本身也会更加清晰，更加容易看到相互之间的关系。

interrupt()操作只对处于WAITING 和TIME_WAITING 状态的线程有用，让它们]产生实质性的异常抛出。
在通常情况下，如果线程处于运行中状态，也不会让它中断，如果中断是成立的，可能会导致正常的业务运行出现问题。另外，如果不想用强制手段，就得为每条代码的运行设立检查，但是这个动作很麻烦，JVM 不愿意做这件事情，它做interruptl )仅仅是打一个标记，此时程序中通过isInterrupt()方法能够判定是否被发起过中断操作，如果被中断了，那么如何处理程序就是设计上的事情了。

举个例子，如果代码运行是一个死循环，那么在循环中可以这样做:
```java
while(true) {
	if (Thread.currentThread.isInterrupt()) {
	//可以做类似的break、return,抛出InterruptedExcept ion 达到某种目的，这完全由自己决定
	//如拋出异常，通常包装一层try catch 异常处理，进一步做处理，如退出run 方法或什么也不做
	}
}
```
这太麻烦了，为什么不可以自动呢?
可以通过一些生活的沟通方式来理解一下: 当你发现门外面有人呼叫你时，你自己是否搭理他是你的事情，这是一种有“爱”的沟通方式，反之是暴力地破门而入，把你强制“抓”出去的方式。

在JDK 1.6 及以后的版本中，可以使用线程的`interrupted( )`
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWU3Mzg5NDlmOTFkNzY2OTQucG5n?x-oss-process=image/format,png)

判定线程是否已经被调用过中断方法，表面上的效果与`isInterrupted()`
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTg4YjcxOWEzNDk1NzlkMTYucG5n?x-oss-process=image/format,png)结果一样，不过这个方法是一个静态方法
除此之外，更大的区别在于这个方法调用后将会重新将中断状态设置为`false`,方便于循环利用线程，而不是中断后状态就始终为true,就无法将状态修改回来了。类似的，判定线程的相关方法还有`isAlive()`
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQxZTMyNTE4MWVlN2QwYjIucG5n?x-oss-process=image/format,png)
`isDaemon()`
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE3MjYyMzQzMjRhNTg4M2YucG5n?x-oss-process=image/format,png)
![线程的状态图](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWJhMTk5YTU4YjYwYmQ4ZmMucG5n?x-oss-process=image/format,png)
# 等待队列
1.  调用wait(), notify()前，必须获得obj锁，也就是必须写在synchronized(obj) 代码段内
2.  与等待队列相关的步骤和图
*   线程1获取对象A的锁，正在使用对象A。
*   线程1调用对象A的wait()方法。
*   线程1释放对象A的锁，并马上进入等待队列。
*   锁池里面的对象争抢对象A的锁。
*   线程5获得对象A的锁，进入synchronized块，使用对象A。
*   线程5调用对象A的notifyAll()方法，唤醒所有线程，所有线程进入锁池。|| 线程5调用对象A的notify()方法，唤醒一个线程，不知道会唤醒谁，被唤醒的那个线程进入锁池。
*   notifyAll()方法所在synchronized结束，线程5释放对象A的锁。
*   锁池里面的线程争抢对象锁，但线程1什么时候能抢到就不知道了。|| 原本锁池+第6步被唤醒的线程一起争抢对象锁。![多线程等待队列](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMzYwNDM0NzI0N2UyOGM2Mi4uanBn?x-oss-process=image/format,png)

# 锁池状态
1.  当前线程想调用对象A的同步方法时，发现对象A的锁被别的线程占有，此时当前线程进入锁池状态。
简言之，锁池里面放的都是想`争夺对象锁的线程`
2.  当一个线程1被另外一个线程2唤醒时，1线程进入锁池状态，去争夺对象锁。
3.  锁池是在同步的环境下才有的概念，`一个对象对应一个锁池`

# **几个方法的比较**
- Thread.sleep(long millis)
一定是当前线程调用此方法，当前线程进入阻塞，不释放对象锁，millis后线程自动苏醒进入可运行态。
作用：给其它线程执行机会的最佳方式。
- Thread.yield()
一定是当前线程调用此方法，当前线程放弃获取的cpu时间片，由运行状态变会可运行状态，让OS再次选择线程。
作用：让相同优先级的线程轮流执行，但并不保证一定会轮流执行。实际中无法保证yield()达到让步目的，因为让步的线程还有可能被线程调度程序再次选中。Thread.yield()不会导致阻塞。
3.  t.join()/t.join(long millis)，当前线程里调用其它线程1的join方法，当前线程阻塞，但不释放对象锁，直到线程1执行完毕或者millis时间到，当前线程进入可运行状态。
4.  obj.wait()，当前线程调用对象的wait()方法，当前线程释放对象锁，进入等待队列。依靠notify()/notifyAll()唤醒或者wait(long timeout)timeout时间到自动唤醒。
5.  obj.notify()唤醒在此对象监视器上等待的单个线程，选择是任意性的。notifyAll()唤醒在此对象监视器上等待的所有线程。

# **疑问**
1.  当对象锁被某一线程释放的一瞬间，锁池里面的哪个线程能获得这个锁？随机？队列FIFO？or sth else？
2.  等待队列里许许多多的线程都wait()在一个对象上，此时某一线程调用了对象的notify()方法，那唤醒的到底是哪个线程？随机？队列FIFO？or sth else？java文档就简单的写了句：选择是任意性的。

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)
## [Github](https://github.com/Wasabi1234)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
