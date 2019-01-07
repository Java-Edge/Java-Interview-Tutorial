# 1 基本概念
## 1.1 并发
同时拥有两个或者多个线程，如果程序在单核处理器上运行多个线程将交替地换入或者换出内存,这些线程是同时“存在"的，每个线程都处于执行过程中的某个状态，如果运行在多核处理器上,此时，程序中的每个线程都将分配到一个处理器核上，因此可以同时运行.
## 1.2 高并发( High Concurrency) 
互联网分布式系统架构设计中必须考虑的因素之一，通常是指，通过设计保证系统能够同时并行处理很多请求.
## 1.3 区别与联系
- 并发: 多个线程操作相同的资源，保证线程安全，合理使用资源
- 高并发:服务能同时处理很多请求，提高程序性能
# 2 CPU
## 2.1 CPU 多级缓存
![](https://img-blog.csdnimg.cn/img_convert/03859736ec299060001e2702e49ce90f.png)
- 为什么需要CPU cache
CPU的频率太快了，快到主存跟不上
如此,在处理器时钟周期内，CPU常常需要等待主存，浪费资源。所以cache的出现，是为了缓解CPU和内存之间速度的不匹配问题(结构:cpu-> cache-> memory ).
- CPU cache的意义
  1) 时间局部性
 如果某个数据被访问，那么在不久的将来它很可能被再次访问
  2) 空间局部性
如果某个数据被访问，那么与它相邻的数据很快也可能被访问
## 2.2 缓存一致性(MESI)
用于保证多个 CPU cache 之间缓存共享数据的一致
- M-modified被修改
该缓存行只被缓存在该 CPU 的缓存中,并且是被修改过的,与主存中数据是不一致的,需在未来某个时间点写回主存,该时间是允许在其他CPU 读取主存中相应的内存之前,当这里的值被写入主存之后,该缓存行状态变为 E
- E-exclusive独享
缓存行只被缓存在该 CPU 的缓存中,未被修改过,与主存中数据一致
可在任何时刻当被其他 CPU读取该内存时变成 S 态,被修改时变为 M态
- S-shared共享
该缓存行可被多个 CPU 缓存,与主存中数据一致
- I-invalid无效
![](https://img-blog.csdnimg.cn/img_convert/6f134b3e29210e5efab39c87b65330f4.png)
- 乱序执行优化
处理器为提高运算速度而做出违背代码原有顺序的优化
## 并发的优势与风险
![](https://img-blog.csdnimg.cn/img_convert/611324b1cf6a4e73e374489d631ba506.png)
# 3 项目准备
## 3.1 项目初始化
![自定义4个基本注解](https://img-blog.csdnimg.cn/img_convert/39ce4a664f6c0aae2ac8254813397adf.png)
![随手写个测试类](https://img-blog.csdnimg.cn/img_convert/bb06219a24cbb1e50b01982299566c07.png)
![运行正常](https://img-blog.csdnimg.cn/img_convert/3bdb11cf5def6daa6196b1a57c5d2d17.png)
##  3.2 并发模拟-Jmeter压测
![](https://img-blog.csdnimg.cn/img_convert/bc910009c5ef0fdeedd010888f792947.png)
![](https://img-blog.csdnimg.cn/img_convert/a40c37633be6b1ada9013773224d7998.png)
![添加"查看结果数"和"图形结果"监听器](https://img-blog.csdnimg.cn/img_convert/e21935009955b121f641ccaba344edab.png)
![log view 下当前日志信息](https://img-blog.csdnimg.cn/img_convert/0c48834ab0b6c22746d638967d62bc20.png)
![图形结果](https://img-blog.csdnimg.cn/img_convert/c0603ace9b85444880b66e7493a3736f.png)
## 3.3 并发模拟-代码
### CountDownLatch
- 可阻塞线程,并保证当满足特定条件时可继续执行
### Semaphore(信号量)
可阻塞线程,控制同一时间段内的并发量。

以上二者通常和线程池搭配。

并发模拟：
```java
package com.mmall.concurrency;

import com.mmall.concurrency.annoations.NotThreadSafe;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;

/**
 * @author JavaEdge
 * @date 18/4/1
 */
@Slf4j
@NotThreadSafe
public class ConcurrencyTest {

    /**
     * 请求总数
     */
    public static int clientTotal = 5000;

    /**
     * 同时并发执行的线程数
     */
    public static int threadTotal = 200;

    public static int count = 0;

    public static void main(String[] args) throws Exception {
        //定义线程池
        ExecutorService executorService = Executors.newCachedThreadPool();
        //定义信号量,给出允许并发的线程数目
        final Semaphore semaphore = new Semaphore(threadTotal);
        //统计计数结果
        final CountDownLatch countDownLatch = new CountDownLatch(clientTotal);
        //将请求放入线程池
        for (int i = 0; i < clientTotal ; i++) {
            executorService.execute(() -> {
                try {
                    //信号量的获取
                    semaphore.acquire();
                    add();
                    //释放
                    semaphore.release();
                } catch (Exception e) {
                    log.error("exception", e);
                }
                countDownLatch.countDown();
            });
        }
        countDownLatch.await();
        //关闭线程池
        executorService.shutdown();
        log.info("count:{}", count);
    }

    /**
     * 统计方法
     */
    private static void add() {
        count++;
    }
}

```
运行发现结果随机,所以非线程安全
# 4 线程安全性
## 4.1  线程安全性
当多个线程访问某个类时，不管运行时环境采用`何种调度方式`或者这些进程将如何交替执行，并且在主调代码中`不需要任何额外的同步或协同`，这个类都能表现出`正确的行为`，那么就称这个类是线程安全的
## 4.2 原子性

并非一气呵成，岂能无懈可击

### 4.2.1 Atomic 包
- AtomicXXX:CAS,Unsafe.compareAndSwapInt
提供了互斥访问，同一时刻只能有一个线程来对它进行操作
```java
package com.mmall.concurrency.example.atomic;

import com.mmall.concurrency.annoations.ThreadSafe;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicLong;

/**
 * @author JavaEdge
 */
@Slf4j
@ThreadSafe
public class AtomicExample2 {

    /**
     * 请求总数
     */
    public static int clientTotal = 5000;

    /**
     * 同时并发执行的线程数
     */
    public static int threadTotal = 200;

    /**
     * 工作内存
     */
    public static AtomicLong count = new AtomicLong(0);

    public static void main(String[] args) throws Exception {
        ExecutorService executorService = Executors.newCachedThreadPool();
        final Semaphore semaphore = new Semaphore(threadTotal);
        final CountDownLatch countDownLatch = new CountDownLatch(clientTotal);
        for (int i = 0; i < clientTotal ; i++) {
            executorService.execute(() -> {
                try {
                    System.out.println();
                    semaphore.acquire();
                    add();
                    semaphore.release();
                } catch (Exception e) {
                    log.error("exception", e);
                }
                countDownLatch.countDown();
            });
        }
        countDownLatch.await();
        executorService.shutdown();
        //主内存
        log.info("count:{}", count.get());
    }
    
    private static void add() {
        count.incrementAndGet();
        // count.getAndIncrement();
    }
}
```

```java
@Slf4j
@ThreadSafe
public class AtomicExample4 {

    private static AtomicReference<Integer> count = new AtomicReference<>(0);

    public static void main(String[] args) {
        // 2
        count.compareAndSet(0, 2);
        // no
        count.compareAndSet(0, 1);
        // no
        count.compareAndSet(1, 3);
        // 4
        count.compareAndSet(2, 4);
        // no
        count.compareAndSet(3, 5); 
        log.info("count:{}", count.get());
    }
}
```
![](https://img-blog.csdnimg.cn/img_convert/ed21be49eb204a082bdf73e6f454169e.png)
- AtomicReference,AtomicReferenceFieldUpdater
![](https://img-blog.csdnimg.cn/img_convert/035f5f4e875de5f6acc4c825d60b19fc.png)
- AtomicBoolean
![](https://img-blog.csdnimg.cn/img_convert/b761bb82385e4e8750092328ac1cbf44.png)

- AtomicStampReference : CAS的 ABA 问题
### 4.2.2 锁
synchronized:依赖 JVM
- 修饰代码块:大括号括起来的代码，作用于调用的对象
- 修饰方法: 整个方法，作用于调用的对象
![](https://img-blog.csdnimg.cn/img_convert/dc5f64990fe69a62f9c722c790447e62.png)
- 修饰静态方法:整个静态方法，作用于所有对象
![](https://img-blog.csdnimg.cn/img_convert/8cfd5c38ff9079fa2a9025ae6cc2573c.png)
```java
package com.mmall.concurrency.example.count;

import com.mmall.concurrency.annoations.ThreadSafe;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;

/**
 * @author JavaEdge
 */
@Slf4j
@ThreadSafe
public class CountExample3 {

    /**
     * 请求总数
     */
    public static int clientTotal = 5000;

    /**
     * 同时并发执行的线程数
     */
    public static int threadTotal = 200;

    public static int count = 0;

    public static void main(String[] args) throws Exception {
        ExecutorService executorService = Executors.newCachedThreadPool();
        final Semaphore semaphore = new Semaphore(threadTotal);
        final CountDownLatch countDownLatch = new CountDownLatch(clientTotal);
        for (int i = 0; i < clientTotal ; i++) {
            executorService.execute(() -> {
                try {
                    semaphore.acquire();
                    add();
                    semaphore.release();
                } catch (Exception e) {
                    log.error("exception", e);
                }
                countDownLatch.countDown();
            });
        }
        countDownLatch.await();
        executorService.shutdown();
        log.info("count:{}", count);
    }

    private synchronized static void add() {
        count++;
    }
}
```
synchronized 修正计数类方法
- 修饰类:括号括起来的部分，作用于所有对象
子类继承父类的被 synchronized 修饰方法时,是没有 synchronized 修饰的!!!

Lock: 依赖特殊的 CPU 指令,代码实现 
### 4.2.3  对比
- synchronized: 不可中断锁，适合竞争不激烈，可读性好
- Lock: 可中断锁，多样化同步，竞争激烈时能维持常态
- Atomic: 竞争激烈时能维持常态，比Lock性能好; 只能同步一
个值

## 4.3 可见性

你做的改变，别人看不见。

一个线程对主内存的修改可以及时的被其他线程观察到
### 4.3.1 导致共享变量在线程间不可见的原因
- 线程交叉执行
- 重排序结合线程交叉执行
- 共享变量更新后的值没有在工作内存与主存间及时更新
### 4.3.2 可见性之synchronized
JMM关于synchronized的规定
- 线程解锁前，必须把共享变量的最新值刷新到主内存
- 线程加锁时，将清空工作内存中共享变量的值，从而使
用共享变量时需要从主内存中重新读取最新的值(`加锁与解锁是同一把锁`)
### 4.3.3 可见性之volatile
通过加入内存屏障和禁止重排序优化来实现
- 对volatile变量写操作时，会在写操作后加入一条store
屏障指令，将本地内存中的共享变量值刷新到主内存
- 对volatile变量读操作时，会在读操作前加入一条load
屏障指令，从主内存中读取共享变量
![volatile 写](https://img-blog.csdnimg.cn/img_convert/9b5f34400031011ab65c6f0535fd4bcb.png)
![volatile 读](https://img-blog.csdnimg.cn/img_convert/d7340f94c160e7f53785d31ee9b4094a.png)
![计数类之 volatile 版,非线程安全的](https://img-blog.csdnimg.cn/img_convert/c949a42943079f294d9d5162988829e5.png)
- volatile使用
```java
volatile boolean inited = false;

//线程1:
context = loadContext();
inited= true;

// 线程2:
while( !inited ){
    sleep();
}
doSomethingWithConfig(context)
```

## 4.4 有序性
不按套路出牌。

一个线程观察其他线程中的指令执行顺序，由于指令重排序的存在，该观察结果一般杂乱无序

JMM允许编译器和处理器对指令进行重排序，但是重排序过程不会影响到单线程程序的执行，却会影响到多线程并发执行的正确性

### 4.4.1 happens-before 规则
# 5发布对象

- 发布对象
使一个对象能够被当前范围之外的代码所使用

- 对象逸出
一种错误的发布。当-个对象还没有构造完成时,就使它被其他线程所见

![发布对象](https://img-blog.csdnimg.cn/img_convert/584fdb52d87f3c3250dbabf80b68909b.png)


![对象逸出](https://img-blog.csdnimg.cn/img_convert/03a669241b1b109b5c3aedbdb6e8e0e6.png)

## 5.1 安全发布对象
- 在静态初始化函数中初始化一个对象引用
- 将对象的引用保存到volatile类型域或者AtomicReference对象中
- 将对象的引用保存到某个正确构造对象的final类型域中
- 将对象的引用保存到一个由锁保护的域中
![非线程安全的懒汉模式](https://img-blog.csdnimg.cn/img_convert/53083bac102f7277c08ff5f57bbe9c34.png)
![饿汉模式](https://img-blog.csdnimg.cn/img_convert/393a83dc5077c07536f2efba418bd3df.png)
![线程安全的懒汉模式](https://img-blog.csdnimg.cn/img_convert/77fca2c11aaebe47cc5e1324f30c2c7f.png)
```java
package com.mmall.concurrency.example.singleton;

import com.mmall.concurrency.annoations.NotThreadSafe;

/**
 * 懒汉模式 -》 双重同步锁单例模式
 * 单例实例在第一次使用时进行创建
 * @author JavaEdge
 */
@NotThreadSafe
public class SingletonExample4 {

    /**
     * 私有构造函数
     */
    private SingletonExample4() {

    }

    // 1、memory = allocate() 分配对象的内存空间
    // 2、ctorInstance() 初始化对象
    // 3、instance = memory 设置instance指向刚分配的内存

    // JVM和cpu优化，发生了指令重排

    // 1、memory = allocate() 分配对象的内存空间
    // 3、instance = memory 设置instance指向刚分配的内存
    // 2、ctorInstance() 初始化对象

    /**
     * 单例对象
     */
    private static SingletonExample4 instance = null;

    /**
     * 静态的工厂方法
     *
     * @return
     */
    public static SingletonExample4 getInstance() {
        // 双重检测机制 // B
        if (instance == null) {        
            // 同步锁
            synchronized (SingletonExample4.class) { 
                if (instance == null) {
                    // A - 3
                    instance = new SingletonExample4(); 
                }
            }
        }
        return instance;
    }
}
```
![](https://img-blog.csdnimg.cn/img_convert/049d7847d6ba8e5add4aa1749d61d503.png)
![](https://img-blog.csdnimg.cn/img_convert/532650dc170a88ce1476c315d0f999a7.png)

# 7 AQS
## 7.1 介绍
![数据结构](https://img-blog.csdnimg.cn/img_convert/a31bb8a3d2d938be38bac2a2f46f6baa.png)
- 使用Node实现FIFO队列，可以用于构建锁或者其他同步装置的基础框架
- 利用了一个int类型表示状态
- 使用方法是继承
- 子类通过继承并通过实现它的方法管理其状态{acquire 和release} 的方法操纵状态
- 可以同时实现排它锁和共享锁模式(独占、共享)
同步组件

### CountDownLatch
```java
package com.mmall.concurrency.example.aqs;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @author JavaEdge
 */
@Slf4j
public class CountDownLatchExample1 {

    private final static int threadCount = 200;

    public static void main(String[] args) throws Exception {

        ExecutorService exec = Executors.newCachedThreadPool();

        final CountDownLatch countDownLatch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            final int threadNum = i;
            exec.execute(() -> {
                try {
                    test(threadNum);
                } catch (Exception e) {
                    log.error("exception", e);
                } finally {
                    countDownLatch.countDown();
                }
            });
        }
        countDownLatch.await();
        log.info("finish");
        exec.shutdown();
    }

    private static void test(int threadNum) throws Exception {
        Thread.sleep(100);
        log.info("{}", threadNum);
        Thread.sleep(100);
    }
}
```
```java
package com.mmall.concurrency.example.aqs;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * 指定时间内处理任务
 * 
 * @author JavaEdge 
 * 
 */
@Slf4j
public class CountDownLatchExample2 {

    private final static int threadCount = 200;

    public static void main(String[] args) throws Exception {

        ExecutorService exec = Executors.newCachedThreadPool();

        final CountDownLatch countDownLatch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            final int threadNum = i;
            exec.execute(() -> {
                try {
                    test(threadNum);
                } catch (Exception e) {
                    log.error("exception", e);
                } finally {
                    countDownLatch.countDown();
                }
            });
        }
        countDownLatch.await(10, TimeUnit.MILLISECONDS);
        log.info("finish");
        exec.shutdown();
    }

    private static void test(int threadNum) throws Exception {
        Thread.sleep(100);
        log.info("{}", threadNum);
    }
}
```
##Semaphore用法
![](https://img-blog.csdnimg.cn/img_convert/750059f485bfac67c031496937c2c678.png)
![](https://img-blog.csdnimg.cn/img_convert/455407acb625c57b1de26351afc395d1.png)
![](https://img-blog.csdnimg.cn/img_convert/32149d53141d77efe6906ead30215c51.png)
## CycliBarrier
```java
package com.mmall.concurrency.example.aqs;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @author JavaEdge
 */
@Slf4j
public class CyclicBarrierExample1 {

    private static CyclicBarrier barrier = new CyclicBarrier(5);

    public static void main(String[] args) throws Exception {

        ExecutorService executor = Executors.newCachedThreadPool();

        for (int i = 0; i < 10; i++) {
            final int threadNum = i;
            Thread.sleep(1000);
            executor.execute(() -> {
                try {
                    race(threadNum);
                } catch (Exception e) {
                    log.error("exception", e);
                }
            });
        }
        executor.shutdown();
    }

    private static void race(int threadNum) throws Exception {
        Thread.sleep(1000);
        log.info("{} is ready", threadNum);
        barrier.await();
        log.info("{} continue", threadNum);
    }
}
```
![](https://img-blog.csdnimg.cn/img_convert/61b5f12aed68f4879eaf421921180919.png)
```java
package com.mmall.concurrency.example.aqs;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * @author JavaEdge
 */
@Slf4j
public class CyclicBarrierExample2 {

    private static CyclicBarrier barrier = new CyclicBarrier(5);

    public static void main(String[] args) throws Exception {

        ExecutorService executor = Executors.newCachedThreadPool();

        for (int i = 0; i < 10; i++) {
            final int threadNum = i;
            Thread.sleep(1000);
            executor.execute(() -> {
                try {
                    race(threadNum);
                } catch (Exception e) {
                    log.error("exception", e);
                }
            });
        }
        executor.shutdown();
    }

    private static void race(int threadNum) throws Exception {
        Thread.sleep(1000);
        log.info("{} is ready", threadNum);
        try {
            barrier.await(2000, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            log.warn("BarrierException", e);
        }
        log.info("{} continue", threadNum);
    }
}
```
![await 超时导致程序抛异常](https://img-blog.csdnimg.cn/img_convert/fd7b571f566476e03b76b10f2a4eff35.png)
```java
package com.mmall.concurrency.example.aqs;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
/**
 * @author JavaEdge
 */
@Slf4j
public class SemaphoreExample3 {

    private final static int threadCount = 20;

    public static void main(String[] args) throws Exception {

        ExecutorService exec = Executors.newCachedThreadPool();

        final Semaphore semaphore = new Semaphore(3);

        for (int i = 0; i < threadCount; i++) {
            final int threadNum = i;
            exec.execute(() -> {
                try {
                    // 尝试获取一个许可
                    if (semaphore.tryAcquire()) {
                        test(threadNum);
                        // 释放一个许可
                        semaphore.release();
                    }
                } catch (Exception e) {
                    log.error("exception", e);
                }
            });
        }
        exec.shutdown();
    }

    private static void test(int threadNum) throws Exception {
        log.info("{}", threadNum);
        Thread.sleep(1000);
    }


}
```
# 9 线程池
## 9.1 newCachedThreadPool
![](https://img-blog.csdnimg.cn/img_convert/f62ed32ba431e25c4e6a8a3a111a571b.png)
## 9.2 newFixedThreadPool
![](https://img-blog.csdnimg.cn/img_convert/bc0c48352c23a3dba6719b375e71f972.png)
## 9.3 newSingleThreadExecutor
看出是顺序执行的
![](https://img-blog.csdnimg.cn/img_convert/01743428143ee985c8b77ef540b4f7d6.png)

## 9.4 newScheduledThreadPool
![](https://img-blog.csdnimg.cn/img_convert/fbd0a4e6d07f448eb40fd7b8f1cd25c6.png)
![](https://img-blog.csdnimg.cn/img_convert/ff45eb82a16ae5504cc575cb44ed51e8.png)

# 10 死锁
### 必要条件
互斥条件
请求和保持条件
不剥夺条件
环路等待条件

# 11 高并发之扩容思路
## 11.1 扩容
垂直扩容(纵向扩展) :提高系统部件能力
水平扩容(横向扩展) :增加更多系统成员来实现
## 11.1 扩容 - 数据库
读操作扩展: memcache、redis、 CDN等缓存
写操作扩展: Cassandra、Hbase等
# 12 高并发之缓存思路
## 12.1 缓存
![](https://img-blog.csdnimg.cn/img_convert/76f907d1cc784020d995a7cf10dbd94f.png)
### 1 缓存特征
命中率:命中数/(命中数+没有命中数)
最大元素(空间)
清空策略:FIFO，LFU，LRU,过期时间，随机等
### 2 缓存分类和应用场景
本地缓存：编程实现(成员变量、局部变量、静态变量)、Guava Cache

分布式缓存：Memcache、Redis

## 12.2 高并发之缓存-特征、场景及组件
### 1 Guava Cache
![](https://img-blog.csdnimg.cn/img_convert/d067a93f221947fa484f9ee907f7eb86.png)
### 2 缓存 - Memchche
![](https://img-blog.csdnimg.cn/img_convert/9b11cc84e7057677c5a96ddeee3fccac.png)
![](https://img-blog.csdnimg.cn/img_convert/f020c59264775ab2879c0033b0f99e23.png)
![](https://img-blog.csdnimg.cn/img_convert/b9ee8bc6ce9fd595c8d6ccf1ff8c3b30.png)

### 3 缓存 - Redis
![](https://img-blog.csdnimg.cn/img_convert/979b05e24d7c4bd42e8a670be0b2cb7c.png)

## 12.3 redis的使用
- 配置类
![](https://img-blog.csdnimg.cn/img_convert/0028d7224be1324243cccf0c8f7bfc1b.png)
![](https://img-blog.csdnimg.cn/img_convert/7a999a064f2d5b68f10307dbc0294af8.png)
- 服务类
![](https://img-blog.csdnimg.cn/img_convert/832c747fdc3815b4236f15fe49c7e326.png)
![](https://img-blog.csdnimg.cn/img_convert/021f2e1f7504f684fabc7fa8ff705c82.png)
![](https://img-blog.csdnimg.cn/img_convert/26917bd4ba7dd415543215aff2e443e7.png)
![](https://img-blog.csdnimg.cn/img_convert/7c8093cefa4e7345caa275623cb300fe.png)

## 12.4 高并发场景问题及实战


### 缓存一致性
![](https://img-blog.csdnimg.cn/img_convert/3394e70367765d18207a4c843e343b27.png)

# 13 高并发之消息队列思路
## 13.1 业务案例
![](https://img-blog.csdnimg.cn/img_convert/6f36c1d234f9df2a3965e1165e83229d.png)
将发短信封装成一条消息放进消息队列中,若发生短信过多,队列已满,需要控制发送的频率.
通过将事件封装成消息放入队列,实现了业务解耦,异步设计,确保了短信服务只要正常后,一定会将短信成功发到用户.

## 13.2 消息队列的特性
业务无关:只做消息分发
FIFO :先投递先到达
容灾:节点的动态增删和消息的持久化
性能:吞吐量提升,系统内部通信效率提高


- 为何需要消息队列呢
[生产]和[消费]的速度或稳定性等因素不一致

- 优点
业务解耦
最终一致性
广播
错峰与流控
## 队列
### kafka
![](https://img-blog.csdnimg.cn/img_convert/3f5b237b1a8054b8f19b5ead0161874d.png)