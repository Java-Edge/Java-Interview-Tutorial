# 前言
定义俩共享变量及俩方法：
- 第一个方法，
- 第二个方法
- （r1，r2）的可能值有哪些？
![](https://img-blog.csdnimg.cn/05139ccfbb40447a869632ff35959841.png)

在单线程环境下，可先调用第一个方法，最终（r1，r2）为（1，0）
也可以先调用第二个方法，最终为（0，2）。

![](https://img-blog.csdnimg.cn/20200404214401993.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
# 1 Java内存模型的意义
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTkyYTFmZGY0OGJlMTllMDYucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTIzZTVlOWE0OWFkZWI1YTEucG5n?x-oss-process=image/format,png)
JMM 与硬件内存架构对应关系![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTVlMTM3NGEwYWJmOWM5MjkucG5n?x-oss-process=image/format,png)
JMM抽象结构图
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQ0ZWE4ODQzYTg4YTk0MGQucG5n?x-oss-process=image/format,png)
内存模型描述程序的可能行为。

Java虚拟机规范中试图定义一种Java内存模型，`来屏蔽掉各种硬件和os的内存访问差异`，规定：
- 线程如何、何时能看到其他线程修改过的共享变量的值
- 必要时，如何同步地访问共享变量

以实现让Java程序在各种平台下都能达到一致性的内存访问效果。

JMM通过检查执行跟踪中的每个读操作，并根据某些规则检查该读操作观察到的写操作是否有效来工作。

只要程序的所有执行产生的结果都可由JMM预测。具体实现者任意实现，包括操作的重新排序和删除不必要的同步。

JMM决定了在程序的每个点上可以读取什么值。
## 1.1 共享变量（Shared Variables）
可在线程之间共享的内存称为`共享内存或堆内存`。所有实例字段、静态字段和数组元素都存储在堆内存。
不包括局部变量与方法参数，因为这些是线程私有的，不存在共享。

对同一变量的两次访问(读或写)，若有一个是写请求，则是冲突的！
# 2 主内存与工作内存
工作内存缓存
![](https://img-blog.csdnimg.cn/20191014024209488.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
JMM的主要是定义了`各个变量的访问规则`，在JVM中的如下底层细节：
- 将变量存储到内存
- 从内存中取出变量值

为获得较好执行效率，JMM并未限制执行引擎使用处理器的特定寄存器或缓存来和主内存进行交互，也没有限制即时编译器调整代码执行顺序这类权限。

JMM规定：
- 所有变量都存储在主内存(Main Memory)
- 每条线程有自己的工作内存(Working Memory)
保存了该线程使用到的`变量的主内存副本拷贝`(线程所访问对象的引用或者对象中某个在线程访问到的字段，不会是整个对象的拷贝)
线程对变量的所有操作(读，赋值等)都必须在工作内存进行，不能直接读写主内存中的变量
volatile变量依然有工作内存的拷贝,，是他特殊的操作顺序性规定，看起来如同直接在主内存读写
不同线程间，无法直接访问对方工作内存中的变量，线程间变量值的传递均要通过主内存

线程、主内存、工作内存三者的交互关系：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTEyMjA5YjEyZDU3OGEyZWQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWJiM2QzN2MxNTVjZDgyZDgucG5n?x-oss-process=image/format,png)

JVM模型与JMM不是同一层次的内存划分，基本毫无关系的，硬要对应起来，从变量，内存，工作内存的定义来看
- 主内存 《=》Java堆中的对象实例数据部分
- 工作内存 《=》虚拟机栈中的部分区域
 
从更底层的层次来看：
- 主内存直接对应物理硬件的内存
- 为更好的运行速度，虚拟机（甚至硬件系统的本身的优化措施）可能会让工作内存优先存储于寄存器和高速缓存器，因为程序运行时主要访问读写的是工作内存
# 3 内存间同步操作
## 3.1 线程操作的定义
###  操作定义
write要写的变量以及要写的值。
read要读的变量以及可见的写入值(由此，我们可以确定可见的值)。
lock要锁定的管程(监视器monitor)。
unlock要解锁的管程。
外部操作(socket等等..)
启动和终止
### 程序顺序
如果一个程序没有数据竞争，那么程序的所有执行看起来都是顺序一致的

本规范只涉及线程间的操作;
一个变量如何从主内存拷贝到工作内存,从工作内存同步回主内存的实现细节

JMM 本身已经定义实现了以下8种操作来完成，且都具备`原子性`
- lock(锁定)
作用于主内存变量，把一个变量标识为一条线程独占的状态
- unlock(解锁)
作用于主内存变量，把一个处于锁定状态的变量释放,释放后的变量才可以被其它线程锁定
unlock之前必须将变量值同步回主内存
- read(读取)
作用于主内存变量，把一个变量的值从主内存传输到工作内存，以便随后的load
- load(载入)
作用于工作内存变量，把read从主内存中得到的变量值放入工作内存的变量副本
- use(使用)
作用于工作内存变量，把工作内存中一个变量的值传递给执行引擎，每当虚拟机遇到一个需要使用到的变量的值得字节码指令时将会执行这个操作
- assign(赋值)
作用于工作内存变量，把一个从执行引擎接收到的值赋给工作内存的变量，每当虚拟机遇到一个给变量赋值的字节码指令时执行这个操作
- store(存储)
作用于工作内存变量，把工作内存中一个变量的值传送到主内存，以便随后的write操作使用
- write(写入)
作用于主内存变量，把store操作从工作内存中得到的值放入主内存的变量中

- 把一个变量从主内存`复制`到工作内存
就要顺序执行read和load

- 把变量从工作内存`同步`回主内存
就要顺序地执行store和write操作

JMM只要求上述两个操作必须`按序执行`，而没有保证连续执行
也就是说read/load之间、store/write之间可以插入其它指令
如对主内存中的变量a,b访问时，一种可能出现的顺序是read a->readb->loadb->load a

JMM规定执行上述八种基础操作时必须满足如下
## 3.1 同步规则
◆ 对于监视器 m 的解锁与所有后续操作对于 m 的加锁 `同步`(之前的操作保持可见)
◆对 volatile变量v的写入，与所有其他线程后续对v的读同步

◆ `启动` 线程的操作与线程中的第一个操作同步
◆ 对于每个属性写入默认值(0， false, null)与每个线程对其进行的操作同步
◆ 线程 T1的最后操作与线程T2发现线程T1已经结束同步。( isAlive ,join可以判断线程是否终结)
◆ 如果线程 T1中断了T2,那么线程T1的中断操作与其他所有线程发现T2被中断了同步通过抛出*InterruptedException*异常，或者调用*Thread.interrupted*或*Thread.isInterrupted*

- 不允许read/load、store/write操作之一单独出现
不允许一个变量从主内存读取了但工作内存不接收，或从工作内存发起回写但主内存不接收
- 不允许一个线程丢弃它的最近的assign
即变量在工作内存中改变(为工作内存变量赋值)后必须把该变化同步回主内存
- 新变量只能在主内存“诞生”，不允许在工作内存直接使用一个未被初始化(load或assign)的变量
换话说就是一个变量在实施use，store之前，必须先执行过assign和load
- 如果一个变量事先没有被load锁定，则不允许对它执行unlock，也不允许去unlock一个被其它线程锁定的变量
- 对一个变量执行unloack前，必须把此变量同步回主内存中(执行store，write)

> 参考
> - https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html#jls-17.4.1