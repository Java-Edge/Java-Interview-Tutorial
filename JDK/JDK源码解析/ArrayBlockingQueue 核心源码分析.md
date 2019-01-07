![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e62f4154c7c?w=998&h=690&f=png&s=1582218 "图片标题") 

> 最聪明的人是最不愿浪费时间的人。
> ——但丁

# 0 前言
由数组支持的有界阻塞队列。此队列对元素按 FIFO（先进先出）进行排序。队首是已在队列中最长时间的元素。队尾是最短时间出现在队列中的元素。新元素插入到队列的尾部，并且队列检索操作在队列的开头获取元素。
这是经典的“有界缓冲区”，其中固定大小的数组包含由生产者插入并由消费者提取的元素。一旦创建，容量将无法更改。试图将一个元素放入一个完整的队列将导致操作阻塞；从空队列中取出一个元素的尝试也会类似地阻塞。

此类支持可选的公平性策略，用于排序正在等待的生产者和使用者线程。默认情况下，不保证此排序。但是，将公平性设置为true构造的队列将按FIFO顺序授予线程访问权限。公平通常会降低吞吐量，但会减少可变性并避免饥饿。

此类及其迭代器实现了Collection和Iterator接口的所有可选方法。

此类是Java Collections Framework的成员。

# 1 继承体系
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e62f8c9ecc4?w=3182&h=436&f=png&s=169197 "图片标题") 

![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e63099ec3f9?w=980&h=796&f=png&s=53926 "图片标题") 


- Java中的阻塞队列接口BlockingQueue继承自Queue接口。

# 2 属性
-  存储队列元素的数组，是个循环数组
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e63508bf515?w=1366&h=330&f=png&s=38372 "图片标题") 

- 下次take, poll, peek or remove 时的数据索引
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e63513c3512?w=1028&h=332&f=png&s=30668 "图片标题") 

- 下次 put, offer, or add 时的数据索引
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e638c78e2d1?w=970&h=320&f=png&s=27625 "图片标题") 

有了上面两个关键字段，在存数据和取数据时，无需计算，就能知道应该新增到什么位置，应该从什么位置取数据。

- 队列中的元素数
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e639c4bd07e?w=854&h=292&f=png&s=23214 "图片标题") 

## 并发控制采用经典的双条件（notEmpty + notFull）算法
- Lock 锁
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e638cc82954?w=1598&h=332&f=png&s=44939 "图片标题") 

- 等待take的条件,在 put 成功时使用
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e63e73d8679?w=1972&h=330&f=png&s=59297 "图片标题") 

- 等待put的条件,在 take 成功时使用
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e63ec36708b?w=1922&h=328&f=png&s=56379 "图片标题") 

*ArrayBlockingQueue is a State-Dependent class*，该类只有一些先决条件才能执行操作.


如果前提条件（notFull）为 false ，写线程将只能等待.
如果队列满，写需要等待.
原子式释放锁，并等待信号(读线程发起的 *notFull.signal()*)
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e63e0d14864?w=2800&h=732&f=png&s=119381 "图片标题") 

对于读，概念是相同的，但使用 notEmpty 条件:
如果队列为空，则读线程需要等待.
原子地释放锁，并等待信号(由写线程触发的 *notEmpty.signal()*)
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e641e4fec4e?w=2800&h=732&f=png&s=121706 "图片标题") 

当一个线程被唤醒，那么你需要做2件主要的事情：
 1. 获取锁
 2.  重测条件

这种设计，它支持只唤醒对刚刚发生的事情感兴趣的线程.
例如，一个试图从空队列中取数据的线程，只对队列是否为空(有一些数据要取出)感兴趣，而并不关心队列是否满。确实经典的设计！

# 3  构造方法
## 3.1 无参
注意这是没有无参构造方法的哦!必须设置容量!

## 3.2 有参
- 创建具有给定（固定）容量和默认访问策略(非公平)的ArrayBlockingQueue
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e64608b4245?w=2372&h=414&f=png&s=110699 "图片标题") 

- 创建具有给定（固定）容量和指定访问策略的ArrayBlockingQueue
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e6418d91a35?w=3052&h=1086&f=png&s=293400 "图片标题") 



- 创建一个具有给定（固定）容量，指定访问策略并最初包含给定集合的元素的ArrayBlockingQueue，该元素以集合的迭代器的遍历顺序添加.
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e642038dee6?w=2720&h=2604&f=png&s=420673 "图片标题") 

### fair 参数
指定读写锁是否公平
- 公平锁，锁竞争按先来先到顺序
- 非公平锁，锁竞争随机

# 3 新增数据
ArrayBlockingQueue有不同的几个数据添加方法，add、offer、put方法,数据都会按照 putIndex 的位置新增.

## 3.1 add
- 如果可以在不超过队列容量的情况下立即将指定元素插入此队列的尾部，则在成功插入时返回true，如果此队列已满则抛出IllegalStateException.
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e64c4b23236?w=1618&h=434&f=png&s=79648 "图片标题") 
调用的是抽象父类 AbstractQueue的 add 方法
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e648c83edaf?w=3032&h=848&f=png&s=170809 "图片标题") 

### offer
- 之后又是调用的自身实现的 offer 方法.
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e6530cde717?w=2720&h=2588&f=png&s=373860 "图片标题") 

### enqueue
在当前放置位置插入元素,更新并发出信号.
仅在持有锁时可以调用
- 内部继续调用入队方法
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e64d535aea6?w=2060&h=1824&f=png&s=346941 "图片标题") 

类似的看 put 方法.
## 3.2 put
- 将指定的元素插入此队列的末尾，如果队列已满，则等待空间变为可用.
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e651c50ded0?w=2436&h=1728&f=png&s=291757 "图片标题") 
实现类似 add,不再赘述.

# 4 取数据
从队首取数据,我们以 poll 为例看源码.

## 4.1 poll
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e651d4af1ff?w=2348&h=1524&f=png&s=223031 "图片标题") 

### dequeue
- 提取当前位置的元素，更新并发出信号.仅在持有锁时可调用.
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e6564306374?w=1964&h=2336&f=png&s=436581 "图片标题") 

# 5 删除数据
![](https://user-gold-cdn.xitu.io/2020/4/23/171a6e6574553879?w=2364&h=4680&f=png&s=798516 "图片标题") 

从源码可以看出删除有两种情景：
1. 删除位置等于takeIndex,直接将该位元素置 null ,并重新计算 takeIndex

2. 找到要删除元素的下一个，计算删除元素和 putIndex 的关系,若下一个元素
    - 是 putIndex，将 putIndex 的值修改成删除位


    - 非 putIndex，将下一个元素往前移动一位



# 6 总结
ArrayBlockingQueue 是一种循环队列，通过维护队首、队尾的指针，来优化插入、删除，从而使时间复杂度为O(1).