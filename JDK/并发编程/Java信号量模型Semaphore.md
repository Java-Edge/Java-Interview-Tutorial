
> 面试官一声冷笑：用过semaphore吧，说说信号量模型？

信号量模型可简单概括为：一个计数器，一个等待队列，三个方法。在信号量模型里，计数器和等待队列对外是透明的，所以只能通过信号量模型提供的三个方法来访问它们，这三个方法分别是：init()、down()和up()。你可以结合下图来形象化地理解。

- 信号量模型
![](https://img-blog.csdnimg.cn/2021042214541150.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


> 详细解释下里面提到的这些方法？

- init()
设置计数器初始值。
- down()
计数器-1；若此时计数器＜0，则当前线程被阻塞，否则当前线程可继续执行
- up()
计数器+1；若此时计数器≤0，则唤醒等待队列中的一个线程，并将其从等待队列中移除。有的人可能认为这里的判断条件应该≥0，估计你是理解生产者-消费者模式中的生产者。可这样思考，`>0` 意味着没有阻塞的线程，所以只有 ≤0 时才需要唤醒一个等待的线程。

down()和up()应该成对出现，并且先调用down()获取锁，处理完成后再调用up()释放锁。若信号量init值为1，应该不会出现>0情况，除非故意调先用up()，这也失去了信号量本身的意义了。

这些方法都是原子性的，并且这个原子性是由信号量模型的实现方保证的。JDK里的信号量模型是由java.util.concurrent.Semaphore实现，Semaphore这个类能够保证这三个方法都是原子操作。

> talk is cheap，show me code？

- 代码
![](https://img-blog.csdnimg.cn/20210422115452600.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

信号量模型中，down()、up()最早被称为P操作和V操作，信号量模型也称PV原语。还有的人会用semWait()和semSignal()表达它们，叫法不同，语义都相同。JUC的acquire()和release()就对应down()和up()。

> 如何使用信号量？

就像红绿信号灯，车必须先检查是否为绿灯，绿灯才能通过。
比如累加器，count+=1操作是个临界区，只允许一个线程执行，也就是说要保证互斥。
![](https://img-blog.csdnimg.cn/20210422122329760.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
分析如下：假设线程t1、t2同时访问add()，当同时调用`acquire()`时，由于`acquire()`是一个原子操作，只可能有一个线程（假设t1）把信号量里的计数器减为0，t2则是将计数器减为-1:
- 对t1，信号量里面的计数器的值是0，≥0，所以t1继续执行
- 对t2，信号量里面的计数器的值是-1，＜0，所以t2被阻塞

所以此时只有t1会进入临界区执行count+=1。

当t1执行release()，信号量里计数器的值是-1，加1之后的值是0，小于等于0，根据up()操作，此时等待队列中的t2会被唤醒。于是t2在t1执行完临界区代码后，才获得进入临界区执行的机会，这就保证了互斥性。


既然有JDK提供了Lock，为啥还要提供一个Semaphore ？实现互斥锁，仅是 Semaphore部分功能，Semaphore还可以允许多个线程访问一个临界区。

最常见的就是各种池化资源：连接池、对象池、线程池等。比如数据库连接池，同一时刻，一定是允许多个线程同时使用连接池的。每个连接在被释放前，是不允许其他线程使用的。

对象池要求一次性创建出N个对象，之后所有的线程重复利用这N个对象，当然对象在被释放前，也是不允许其他线程使用的。所以核心就是限流器的设计，这里限流指不允许多于N个线程同时进入临界区。
如何快速实现一个这样的限流器呢？那就是信号量。
如果我们把计数器的值设置成对象池里对象的个数N，就能完美解决对象池的限流问题了。
代码如下：
![](https://img-blog.csdnimg.cn/20210422144637459.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
注意这里使用的是 Vector，进入临界区的N个线程不安全。add/remove都是不安全的。比如 ArrayList remove() ：
```java
public E remove(int index) {
	rangeCheck(index);
	
	modCount++;
	
	// 假设俩线程 t1,t2都执行到这一步，t1 让出cpu,t2执行
	E oldValue = elementData(index);
	// 到这步,t1继续执行，这时t1,t2拿到的oldValue是一样的，两个线程能拿到同一个对象，线程不安全！
	int numMoved = size - index - 1;
	if (numMoved > 0)
	System.arraycopy(elementData, index+1, elementData, index,
	numMoved);
	elementData[--size] = null; // clear to let GC do its work
	
	return oldValue;
}
```



> 好的，请回家等通知吧！