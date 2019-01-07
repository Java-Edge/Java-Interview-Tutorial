![](https://upload-images.jianshu.io/upload_images/4685968-f12a51fabb09287a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![高并发处理的思路及手段](https://upload-images.jianshu.io/upload_images/4685968-881327a0ac18f5a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f6439f7c997bfcf8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#1 基本概念
##1.1 并发
同时拥有两个或者多个线程，如果程序在单核处理器上运行多个线程将交替地换入或者换出内存,这些线程是同时“存在"的，每个线程都处于执行过程中的某个状态，如果运行在多核处理器上,此时，程序中的每个线程都将分配到一个处理器核上，因此可以同时运行.
##1.2 高并发( High Concurrency) 
互联网分布式系统架构设计中必须考虑的因素之一，通常是指，通过设计保证系统能够同时并行处理很多请求.
##1.3 区别与联系
- 并发: 多个线程操作相同的资源，保证线程安全，合理使用资源
- 高并发:服务能同时处理很多请求，提高程序性能
#2 CPU
##2.1 CPU 多级缓存
![](https://upload-images.jianshu.io/upload_images/4685968-6fc8b5b6509ca6d7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 为什么需要CPU cache
CPU的频率太快了，快到主存跟不上
如此,在处理器时钟周期内，CPU常常需要等待主存，浪费资源。所以cache的出现，是为了缓解CPU和内存之间速度的不匹配问题(结构:cpu-> cache-> memory ).
- CPU cache的意义
  1) 时间局部性
 如果某个数据被访问，那么在不久的将来它很可能被再次访问
  2) 空间局部性
如果某个数据被访问，那么与它相邻的数据很快也可能被访问
##2.2 缓存一致性(MESI)
用于保证多个 CPU cache 之间缓存共享数据的一致
- M-modified被修改
该缓存行只被缓存在该 CPU 的缓存中,并且是被修改过的,与主存中数据是不一致的,需在未来某个时间点写回主存,该时间是允许在其他CPU 读取主存中相应的内存之前,当这里的值被写入主存之后,该缓存行状态变为 E
- E-exclusive独享
缓存行只被缓存在该 CPU 的缓存中,未被修改过,与主存中数据一致
可在任何时刻当被其他 CPU读取该内存时变成 S 态,被修改时变为 M态
- S-shared共享
该缓存行可被多个 CPU 缓存,与主存中数据一致
- I-invalid无效
![](https://upload-images.jianshu.io/upload_images/4685968-d2325f1e0e5b7786.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 乱序执行优化
处理器为提高运算速度而做出违背代码原有顺序的优化
##并发的优势与风险
![](https://upload-images.jianshu.io/upload_images/4685968-e083e9bf164b7d73.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#3 项目准备
##3.1 项目初始化
![自定义4个基本注解](https://upload-images.jianshu.io/upload_images/4685968-9ea512f5c1b3b4ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![随手写个测试类](https://upload-images.jianshu.io/upload_images/4685968-7bc23c076be35936.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![运行正常](https://upload-images.jianshu.io/upload_images/4685968-c7fba914bceb792e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##3.2 并发模拟-Jmeter压测
![](https://upload-images.jianshu.io/upload_images/4685968-8c994437f5663dd6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0a6f7c5e0217aa17.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![添加"查看结果数"和"图形结果"监听器](https://upload-images.jianshu.io/upload_images/4685968-646e66ad4e2c7ffc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![log view 下当前日志信息](https://upload-images.jianshu.io/upload_images/4685968-cc70555c9f3b78b2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![图形结果](https://upload-images.jianshu.io/upload_images/4685968-01c21bb9069bcd28.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 3.3 并发模拟-代码
### CountDownLatch
![可阻塞线程,并保证当满足特定条件时可继续执行](https://upload-images.jianshu.io/upload_images/4685968-0d0481ec5302cadb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
###Semaphore(信号量)
![可阻塞线程,控制同一时间段内的并发量](https://upload-images.jianshu.io/upload_images/4685968-3133af3b8e419a39.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
以上二者通常和线程池搭配

下面开始做并发模拟
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

```
package com.mmall.concurrency.example.atomic;

import com.mmall.concurrency.annoations.ThreadSafe;
import lombok.extern.slf4j.Slf4j;
import java.util.concurrent.atomic.AtomicReference;

/**
 * @author JavaEdge
 * @date 18/4/3
 */
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
![输出结果](https://upload-images.jianshu.io/upload_images/4685968-b60dac7453bd0904.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- AtomicReference,AtomicReferenceFieldUpdater
![](https://upload-images.jianshu.io/upload_images/4685968-d726108a34669255.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- AtomicBoolean
![](https://upload-images.jianshu.io/upload_images/4685968-b5fb1eaf9938c163.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- AtomicStampReference : CAS的 ABA 问题
### 4.2.2 锁
synchronized:依赖 JVM
- 修饰代码块:大括号括起来的代码，作用于调用的对象
- 修饰方法: 整个方法，作用于调用的对象
![](https://upload-images.jianshu.io/upload_images/4685968-88b9935f21beef0e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 修饰静态方法:整个静态方法，作用于所有对象
![](https://upload-images.jianshu.io/upload_images/4685968-f0b3530e761400d1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
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
![volatile 写](https://upload-images.jianshu.io/upload_images/4685968-1b52dfe716f14632.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![volatile 读](https://upload-images.jianshu.io/upload_images/4685968-fe9dd1b03c64c7f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![计数类之 volatile 版,非线程安全的](https://upload-images.jianshu.io/upload_images/4685968-977262be174e2dbc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
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

![发布对象](https://upload-images.jianshu.io/upload_images/4685968-b368f6fe5b350cbe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


![对象逸出](https://upload-images.jianshu.io/upload_images/4685968-88d207fcc6bf1866.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 5.1 安全发布对象
![](https://upload-images.jianshu.io/upload_images/4685968-7400ab2abe1dbbfb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![非线程安全的懒汉模式](https://upload-images.jianshu.io/upload_images/4685968-ba18bdbe3a3c4ed1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![饿汉模式](https://upload-images.jianshu.io/upload_images/4685968-be2854c290143094.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![线程安全的懒汉模式](https://upload-images.jianshu.io/upload_images/4685968-e632243a5a97281a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
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
![](https://upload-images.jianshu.io/upload_images/4685968-823166cdf7936293.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9002671b71096f6c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 7 AQS
## 7.1 介绍
![数据结构](https://upload-images.jianshu.io/upload_images/4685968-918dcaea77d556e9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
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
![](https://upload-images.jianshu.io/upload_images/4685968-e6cbcd4254c642c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-dbefbf2c76ad5a2a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-41f5f5a5fd135804.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##CycliBarrier
```
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
![](https://upload-images.jianshu.io/upload_images/4685968-4fb51fa4926fd70e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
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
![await 超时导致程序抛异常](https://upload-images.jianshu.io/upload_images/4685968-0f899c23531f8ee8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
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
#9 线程池
##9.1 newCachedThreadPool
![](https://upload-images.jianshu.io/upload_images/4685968-1122da7a48223ba1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##9.2 newFixedThreadPool
![](https://upload-images.jianshu.io/upload_images/4685968-0ea942bf12e5210f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##9.3 newSingleThreadExecutor
看出是顺序执行的
![](https://upload-images.jianshu.io/upload_images/4685968-989d59429f589403.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 9.4 newScheduledThreadPool
![](https://upload-images.jianshu.io/upload_images/4685968-f7536ec7a1cf6ecc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c90e09d5bfe707e6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 10 死锁
![](https://upload-images.jianshu.io/upload_images/4685968-461f6a4251ae8ca4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-46d58773e597195f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 11 高并发之扩容思路
## 11.1 扩容
![](https://upload-images.jianshu.io/upload_images/4685968-8fabe01a7a9073ba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 11.1 扩容 - 数据库
![](https://upload-images.jianshu.io/upload_images/4685968-f1b501aa5f49953d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 12 高并发之缓存思路
## 12.1 缓存
![](https://upload-images.jianshu.io/upload_images/4685968-c5b8fa643df25009.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 1 缓存特征
![](https://upload-images.jianshu.io/upload_images/4685968-272a9236ceace316.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 2 缓存命中率影响因素
![](https://upload-images.jianshu.io/upload_images/4685968-302f50ee02ba8cf5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 3  缓存分类和应用场景
![](https://upload-images.jianshu.io/upload_images/4685968-52b2f576007d9b70.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##  12.2 高并发之缓存-特征、场景及组件介绍

### 1 Guava Cache
![](https://upload-images.jianshu.io/upload_images/4685968-23d4a01198f33926.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 2 缓存 - Memchche
![](https://upload-images.jianshu.io/upload_images/4685968-ddde5e19b73fd570.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7659178fc344a005.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-59c0c75277c9f31f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 3 缓存 - Redis
![](https://upload-images.jianshu.io/upload_images/4685968-c8267b97a065b4b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 12.3 redis的使用
- 配置类
![](https://upload-images.jianshu.io/upload_images/4685968-4134748d1b3181f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8634e07d480b8546.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 服务类
![](https://upload-images.jianshu.io/upload_images/4685968-fdb9daccd4778227.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0c8d8a14d833b9e5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-461ff2bf851c25ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a6efafc286fd0119.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 12.4 高并发场景问题及实战


### 缓存一致性
![](https://upload-images.jianshu.io/upload_images/4685968-8897cf0ea46fd70e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 13 高并发之消息队列思路
## 13.1 业务案例
![](https://upload-images.jianshu.io/upload_images/4685968-269e8e4d643ab023.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
将发短信封装成一条消息放进消息队列中,若发生短信过多,队列已满,需要控制发送的频率.
通过将事件封装成消息放入队列,实现了业务解耦,异步设计,确保了短信服务只要正常后,一定会将短信成功发到用户.

## 13.2 消息队列的特性
![](https://upload-images.jianshu.io/upload_images/4685968-4153efed9fa882d2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 为何需要消息队列呢
![](https://upload-images.jianshu.io/upload_images/4685968-4d0a52ea405e86af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 优点
![](https://upload-images.jianshu.io/upload_images/4685968-6ff5a7fbc96173b9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5b2f547310cfd06f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 队列
### kafka
![](https://upload-images.jianshu.io/upload_images/4685968-f387cab7dbc62cb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

、
