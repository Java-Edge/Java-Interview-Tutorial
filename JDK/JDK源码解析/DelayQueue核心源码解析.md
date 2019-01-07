# 0 前言
延迟元素的无边界阻塞队列，在该队列中，仅当元素的延迟到期时才可以使用它.
队首是该 Delayed 元素，其延迟在过去最远过期.
如果没有延迟已经过期，就没有head, poll将返回null.
当元素的getDelay（TimeUnit.NANOSECONDS）方法返回的值小于或等于零时，就会发生过期.
即使未到期的元素无法使用take或poll删除，它们也被视为普通的元素。 例如，size方法返回过期和未过期元素的计数.
此队列不允许空元素.
该类及其迭代器实现集合和迭代器接口的所有可选方法。方法Iterator()中提供的迭代器不能保证以任何特定的顺序遍历DelayQueue中的元素.

此类是Java Collections Framework的成员.

# 1 继承体系
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b90030e184d?w=3118&h=406&f=png&s=138004 "图片标题") 
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b9002c21d48?w=1462&h=1010&f=png&s=71351 "图片标题") 

- 该队列里的元素必须实现Delayed接口才能入队
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b9002bd1894?w=3218&h=542&f=png&s=178161 "图片标题") 
混合式的接口，用于标记在给定延迟后应作用的对象。此接口的实现还必须定义一个compareTo方法，该方法提供与其getDelay方法一致的顺序.

# 2 属性
- 锁
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b9005a8cb1f?w=3266&h=292&f=png&s=94507 "图片标题") 

-  PriorityQueue队列里的元素会根据某些属性排列先后的顺序，这里正好可以利用Delayed接口里的getDelay的返回值来进行排序，delayQueue其实就是在每次往优先级队列中添加元素,然后以元素的delay/过期值作为排序的因素,以此来达到先过期的元素会拍在队首,每次从队列里取出来都是最先要过期的元素
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b9006df95aa?w=3102&h=336&f=png&s=92567 "图片标题") 

- 指定用于等待队首元素的线程。 Leader-Follower模式的变体用于最大程度地减少不必要的定时等待.当一个线程成为leader时，它仅等待下一个延迟过去，但是其他线程将无限期地等待.leader线程必须在从take（）或poll（...）返回之前向其他线程发出信号，除非其他线程成为过渡期间的leader。.每当队首被具有更早到期时间的元素替换时，leader字段都会被重置为null来无效，并且会发出一些等待线程（但不一定是当前leader）的信号。 因此，等待线程必须准备好在等待时获得并失去leader能力.
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b9031b69c43?w=1750&h=336&f=png&s=51112 "图片标题") 

- 当更新的元素在队首变得可用或新的线程可能需要成为 leader 时，会发出条件信号
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b9040e67bd7?w=3038&h=324&f=png&s=94625 "图片标题") 

# 3 构造方法
## 3.1 无参
- 创建一个新的 DelayQueue，它初始是空的
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b904212e386?w=1472&h=334&f=png&s=47174 "图片标题") 

## 3.2 有参
- 创建一个DelayQueue，初始包含Delayed实例的给定集合的元素。
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b907021a193?w=2618&h=416&f=png&s=105156 "图片标题") 

# 4 新增数据

先看看继承自 BlockingQueue 的方法
## put
- 将指定的元素插入此延迟队列。 由于队列无界，因此此方法将永远不会阻塞.
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b90604c54ff?w=1462&h=416&f=png&s=61676 "图片标题") 
可以看到 put 调用的是 offer

## DelayQueue#offer
- 将指定的元素插入此延迟队列
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b90713320b7?w=2266&h=1734&f=png&s=255721 "图片标题") 

### 执行流程
1.加锁
2.元素添加到优先级队列中
3.检验元素是否为队首，是则设置 leader 为null, 并唤醒一个消费线程
4.解锁

其内部调用的是 PriorityQueue 的 offer 方法
### PriorityQueue#offer
将指定的元素插入此优先级队列.
```java
public boolean offer(E e) {
    // 若元素为 null,抛NPE
    if (e == null)
        throw new NullPointerException();
    // 修改计数器加一
    modCount++;
    int i = size;
    // 如果队列大小 > 容量 
    if (i >= queue.length)
        // => 扩容
        grow(i + 1);
    size = i + 1;
    // 若队列空，则当前元素正好处于队首
    if (i == 0)
        queue[0] = e;
    else
    // 若队列非空，根据优先级排序
        siftUp(i, e);
    return true;
}
```
#### 执行流程
1. 元素判空
2. 队列扩容判断
3. 根据元素的 compareTo 方法进行排序，希望最终排序的结果是从小到大的，因为想让队首的都是过期的数据，需要在 compareTo 方法实现.

# 5 取数据

## take
检索并删除此队列的头，如有必要，请等待直到延迟过期的元素在此队列上可用
```java
    public E take() throws InterruptedException {
        final ReentrantLock lock = this.lock;
        // 获取可中断锁
        lock.lockInterruptibly();
        try {
            for (;;) {
                // 从优先级队列中获取队首
                E first = q.peek();
                if (first == null)
                    // 队首为 null,说明无元素，当前线程加入等待队列，并阻塞
                    available.await();
                else {
                    // 获取延迟时间
                    long delay = first.getDelay(NANOSECONDS);
                    if (delay <= 0)
                        // 已到期，获取并删除头部元素
                        return q.poll();
                    first = null; // 在等待时不要保留引用
                    if (leader != null)
                        available.await();
                    else {
                        Thread thisThread = Thread.currentThread();
                        leader = thisThread;
                        try {
                            // 线程节点进入等待队列
                            available.awaitNanos(delay);
                        } finally {
                            if (leader == thisThread)
                                leader = null;
                        }
                    }
                }
            }
        } finally {
            // 若leader == null且还存在元素，则唤醒一个消费线程
            if (leader == null && q.peek() != null)
                available.signal();
            // 解锁
            lock.unlock();
        }
    }
```
### 执行流程
1. 加锁
2. 取出优先级队列的队首
3. 若队列为空,阻塞
3. 若队首非空,获得这个元素的delay时间值，如果first的延迟delay时间值为0的话,说明该元素已经到了可以使用的时间,调用poll方法弹出该元素,跳出方法
4. 若first的延迟delay时间值非0,释放元素first的引用,避免内存泄露
5. 循环以上操作，直至return

>take 方法是会无限阻塞，直到队头的过期时间到了才会返回.
> 如果不想无限阻塞，可以尝试 poll 方法，设置超时时间，在超时时间内，队头元素还没有过期的> 话，就会返回 null.

# 6 解密 leader 元素
leader 是一个Thread元素,表示当前获取到锁的消费者线程.

- 以take代码段为例
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b9094181aaf?w=2294&h=1608&f=png&s=223030 "图片标题") 

若 leader 非 null,说明已有消费者线程获取锁，直接阻塞当前线程.

若 leader 为 null，把当前线程赋给 leader，并等待剩余的到期时间，最后释放 leader.
这里假设有多个消费者线程执行 take 取数据,若没有`leader != null` 判断，这些线程都会无限循环，直到返回第一个元素，这显然很浪费系统资源. 所以 leader 在这里相当于一个线程标识，避免消费者线程的无脑竞争.

> - 注意这里因为first是队首的引用，阻塞时会有很多线程同时持有队首引用，可能导致内存溢出,所以需要手动释放.
![](https://user-gold-cdn.xitu.io/2020/5/3/171d6b90a9422cd2?w=3184&h=202&f=png&s=75465 "图片标题") 

# 7 总结
DelayQueue 使用排序和超时机制即实现了延迟队列。充分利用已有的 PriorityQueue 排序功能，超时阻塞又恰当好处的利用了锁的等待，在已有机制的基础上进行封装。在实际开发中，可以多多实践这一思想，使代码架构具备高复用性。