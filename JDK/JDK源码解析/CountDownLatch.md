# 1 基本设计
一种同步辅助，允许一个或多个线程等待，直到在其他线程中执行的一组操作完成。
CountDownLatch 是用给定的 *count* 初始化的。由于调用了*countDown*()方法，*await* 方法阻塞，直到当前计数为零，之后释放所有等待线程，并立即返回任何后续的 await 调用。这是一种一次性现象——计数无法重置。如果需要重置计数的版本，可以考虑使用*CyclicBarrier*。

CountDownLatch 是一种通用的同步工具，可以用于多种用途。count为1时初始化的CountDownLatch用作简单的 on/off 的 latch或gate:所有调用wait的线程都在gate处等待，直到调用*countDown*()的线程打开它。一个初始化为N的CountDownLatch可以用来让一个线程等待，直到N个线程完成某个动作，或者某个动作已经完成N次。

CountDownLatch的一个有用的特性是，它不需要调用倒计时的线程等待计数达到0才继续，它只是防止任何线程继续等待，直到所有线程都通过。

# 2 类架构
## 2.1 UML 图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY2OTcyXzIwMjAwMjE1MjAzMDIxNzY4LnBuZw?x-oss-process=image/format,png)

## 2.2 继承关系

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY3MzMxXzIwMjAwMjE1MjExNTExOTAzLnBuZw?x-oss-process=image/format,png)
可以看出，CountDownLatch并无显式地继承什么接口或类。

## 2.3 构造函数细节
- 构造一个用给定计数初始化的CountDownLatch。
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY2OTc2XzIwMjAwMjE1MjE0OTI1MTU1LnBuZw?x-oss-process=image/format,png)
- 参数 count 
在线程通过*await*()之前必须调用countDown()的次数

CountDownLatch 的 state 并不是 AQS 的默认值 0，而是可赋值的，就是在 CountDownLatch 初始化时，count 就代表了 state 的初始化值

- new Sync(count) 其实就是调用了内部类  Sync 的如下构造函数
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY3MDc2XzIwMjAwMjE2MDAwMTUwNDQ2LnBuZw?x-oss-process=image/format,png)

count 表示我们希望等待的线程数，可能是
- 等待一组线程全部启动完成，或者
- 等待一组线程全部执行完成

## 2.4 内部类
和 ReentrantLock 一样，CountDownLatch类也存在一个内部同步器 Sync，继承了 AbstractQueuedSynchronizer

- 这也是唯一的属性
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY2ODM0XzIwMjAwMjE1MjE1OTU4NjEwLnBuZw?x-oss-process=image/format,png)
```java
private static final class Sync extends AbstractQueuedSynchronizer {
    private static final long serialVersionUID = 4982264981922014374L;

	// 构造方法
    Sync(int count) {
        setState(count);
    }

	// 返回当前计数
    int getCount() {
        return getState();
    }

	// 在共享模式下获取锁
    protected int tryAcquireShared(int acquires) {
        return (getState() == 0) ? 1 : -1;
    }

	 // 共享模式下的锁释放
    protected boolean tryReleaseShared(int releases) {
        // 降低计数器; 至 0 时发出信号
        for (;;) {
        	// 获取锁状态
            int c = getState();
            // 锁未被任何线程持有
            if (c == 0)
                return false;
            int nextc = c-1;
            if (compareAndSetState(c, nextc))
                return nextc == 0;
        }
    }
}
```

# 3 await
可以叫做等待，也可以称之为加锁。
## 3.1 无参
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY3MTcyXzIwMjAwMjE1MjIwMjMyOTIucG5n?x-oss-process=image/format,png)
造成当前线程等待，直到锁存器计数到零，除非线程被中断。
如果当前计数为零，则此方法立即返回。

如果当前线程数大于0，则当前线程将出于线程调度的目的而禁用，并处于睡眠状态，直到发生以下两种情况之一:
- 由于调用了*countDown*()方法，计数为零
- 其他线程中断了当前线程

如果当前线程:
- 在进入此方法时已设置其中断状态;或者
- 在等待时被中断

就会抛 *InterruptedException*，并清除当前线程的中断状态。

无参版 await 内部使用的是 acquireSharedInterruptibly 方法，实现在 AQS 中的 final 方法
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY3MTExXzIwMjAwMjE1MjMyMDI0NDQ3LnBuZw?x-oss-process=image/format,png)
1. 使用CountDownLatch 的内部类 Sync 重写的*tryAcquireShared*  方法尝试获得锁，如果获取了锁直接返回，获取不到锁走 2
2. 获取不到锁，用 Node 封装一下当前线程，追加到同步队列的尾部，等待在合适的时机去获得锁，本步已完全实现在 AQS 中

### tryAcquireShared
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY3MTMwXzIwMjAwMjE1MjMyMjU5MTcwLnBuZw?x-oss-process=image/format,png)

## 3.2 超时参数
- 最终都会转化成毫秒
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY3MDcyXzIwMjAwMjE1MjI1OTM0Nzg0LnBuZw?x-oss-process=image/format,png)
造成当前线程等待，直到锁存器计数到零，除非线程被中断，或者指定的等待时间已过。
如果当前计数为零，则此方法立即返回值 true。

如果当前线程数大于0，则当前线程将出于线程调度的目的而禁用，并处于休眠状态，直到发生以下三种情况之一:
- 由于调用了countDown()方法，计数为零;或
- 其他一些线程中断当前线程;或
- 指定的等待时间已经过了

如果计数为零，则该方法返回值true。

如果当前线程:
- 在进入此方法时已设置其中断状态;或
- 在等待时中断，

就会抛出InterruptedException，并清除当前线程的中断状态。
如果指定的等待时间过期，则返回false值。如果时间小于或等于0，则该方法根本不会等待。


- 使用的是 AQS 的 *tryAcquireSharedNanos* 方法
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY3Mjk2XzIwMjAwMjE1MjMyMTMyNDgyLnBuZw?x-oss-process=image/format,png)

获得锁时，state 的值不会发生变化，像 ReentrantLock 在获得锁时，会把 state + 1，但 CountDownLatch 不会


# 4 countDown
降低锁存器的计数，如果计数为 0，则释放所有等待的线程。
如果当前计数大于零，则递减。如果新计数为零，那么所有等待的线程都将重新启用，以便进行线程调度。

如果当前计数等于0，则什么也不会发生。
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY2OTM2XzIwMjAwMjE2MDAyNDU5MTMyLnBuZw?x-oss-process=image/format,png)
releaseShared 已经完全实现在 AQS
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY3MjIzXzIwMjAwMjE2MDA0NDM2NTA3LnBuZw?x-oss-process=image/format,png)
主要分成两步：
1. 尝试释放锁（tryReleaseShared），锁释放失败直接返回，释放成功走 2，本步由 Sync 实现
2. 释放当前节点的后置等待节点，该步 AQS 已经完全实现
### tryReleaseShared
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAyMDAyMTYvNTA4ODc1NV8xNTgxNzg1MjY3MjQ0XzIwMjAwMjE2MDAzODMzOTcucG5n?x-oss-process=image/format,png)

对 state 进行递减，直到 state 变成 0；当 state 递减为 0 时，才返回 true。

# 总结
研究完 CountDownLatch 的源码，可知其底层结构仍然依赖了 AQS，对其线程所封装的结点是采用共享模式，而 ReentrantLock 是采用独占模式。可以仔细对比差异，深入理解研究。