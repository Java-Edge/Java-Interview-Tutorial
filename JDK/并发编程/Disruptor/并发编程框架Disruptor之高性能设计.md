> `文章收录在我的 GitHub 仓库，欢迎Star/fork：`
> [Java-Interview-Tutorial](https://github.com/Wasabi1234/Java-Interview-Tutorial)
> https://github.com/Wasabi1234/Java-Interview-Tutorial

# 架构 UML
![](https://img-blog.csdnimg.cn/20201008014645688.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)


# 1 单线程写

Disruptor的RingBuffer, 之所以可以做到完全无锁，也是因为"单线程写"，这是所有"前提的前提"，离了这个前提条件，没有任何技术可以做到完全无锁。Redis、Netty等等高性能技术框架的设计都是这个核心思想。

# 2 系统内存优化-内存屏障
要正确的实现无锁，还需要另外一个关键技术：内存屏障。对应到Java语言，就是valotile变量与happens before语义。

> 参阅： [内存屏障 - Linux的smp_wmb()/smp_ rmb()](https://javaedge.blog.csdn.net/article/details/108935688)
> 系统内核：比如Linux的kfifo：smp_ wmb()，无论是底层的读写
都是使用了Linux的smp_ wmb
https://github.com/opennetworklinux/linux-3.8.13/blob/master/kernel/kfifo.c

# 3 系统缓存优化-消除伪共享
缓存系统中是以缓存行(cache line) 为单位存储的。缓存行是2的整数幂个连续字节，一般为32-256个字节。最常见的缓存行大小是64个字节。

当多线程修改互相独立的变量时，如果这些变量共享同一个缓存行，就会无意中影响彼此的性能，这就是伪共享。

## 核心：Sequence
可看成是一个AtomicLong用于标识进度。还有另外一个目的就是防止不同Sequence之间CPU缓存伪共享(Flase Sharing)的问题。
- 如下设计保证我们保存的 value 永远在一个缓存行中。（8 个long，正好 64 字节）。这也是一个空间换时间的案例。
![](https://img-blog.csdnimg.cn/20201006035128167.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
#  4 算法优化-序号栅栏机制
我们在生产者进行投递Event的时候，总是会使用:

```java 
long sequence = ringBuffer.next();
```

Disruptor3.0中，序号栅栏SequenceBarrier和序号Sequence搭配使用。协调和管理消费者与生产者的工作节奏，避免了锁和CAS的使用。

- 消费者序号数值必须小于生产者序号数值
- 消费者序号数值必须小于其前置(依赖关系)消费者的序号数值
- 生产者序号数值不能大于消费者中最小的序号数值
- 以避免生产者速度过快，将还未来得及消费的消息覆盖


### SingleProducerSequencerPad#next
```java
    /**
     * @see Sequencer#next(int)
     */
    @Override
    public long next(int n) // 1
    {
        if (n < 1) // 初始值：sequence = -1
        {
            throw new IllegalArgumentException("n must be > 0");
        }
		// 语义级别的
		// nextValue为SingleProducerSequencer的变量
        long nextValue = this.nextValue;

        long nextSequence = nextValue + n;
        // 用于判断当前序号是否绕过整个 ringbuffer 容器
        long wrapPoint = nextSequence - bufferSize;
        // 用于缓存优化
        long cachedGatingSequence = this.cachedValue;

        if (wrapPoint > cachedGatingSequence || cachedGatingSequence > nextValue)
        {
            long minSequence;
            while (wrapPoint > (minSequence = Util.getMinimumSequence(gatingSequences, nextValue)))
            {
                LockSupport.parkNanos(1L); // TODO: Use waitStrategy to spin?
            }

            this.cachedValue = minSequence;
        }

        this.nextValue = nextSequence;

        return nextSequence;
    }
```

参考
- https://zhuanlan.zhihu.com/p/21355046

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)