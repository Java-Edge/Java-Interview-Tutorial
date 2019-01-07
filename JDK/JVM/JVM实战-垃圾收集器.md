![](https://img-blog.csdnimg.cn/20200324202121830.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

HotSpot虚拟机提供了多种垃圾收集器,每种收集器都有各自的特点,没有最好的垃圾收集器,只有最适合的垃圾收集器.我们可以根据自己实际的应用需求选择最适合的垃圾收集器.

使用分代垃圾收集器,基于以下观察事实(弱分代假设)
- 大多数分配对象的存活时间短
- 存活时间久的对象很少引用存活时间短的对象

由此, HotSpot VM 将堆分为两个物理区空间,这就是分代(永久代只存储元数据, eg. 类的数据结构,保留字符串( Interned String))


根据新生代和老年代各自的特点,我们应该分别为它们选择不同的收集器,以提升垃圾回收效率.
![](https://img-blog.csdnimg.cn/img_convert/58f4a15c353193eb5d92efd41ade7272.png)

# 1 Serial
主要应用于Y-GC的垃圾回收器，采用串行单线程方式完成GC任务，其中“Stop The World"简称STW,即垃圾回收的某个阶段会暂停整个应用程序的执行
F-GC的时间相对较长，频繁FGC会严重影响应用程序的性能
![Serial 回收流程](https://img-blog.csdnimg.cn/img_convert/ebed677b68f68e6c61a54c214c29c984.png)
`单线程 Stop-The-World 式`，STW:工作线程全部停止。
![](https://img-blog.csdnimg.cn/img_convert/96b8ea78d1075c693728013a76c5512e.png)
![](https://img-blog.csdnimg.cn/20200416204647729.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 单线程 
只会使用一个CPU或一条GC线程进行垃圾回收,并且在垃圾回收过程中暂停其他所有的工作线程,从而用户的请求或图形化界面会出现卡顿.

## 适合Client模式
一般客户端应用所需内存较小,不会创建太多的对象,而且堆内存不大,因此垃圾回收时间比较短,即使在这段时间停止一切用户线程,也不会感到明显停顿.

## 简单高效 
由于Serial收集器只有一条GC线程,避免了线程切换的开销.

## 采用"复制"算法 
# 2 ParNew垃圾收集器
- ParNew是Serial的多线程版本。
![](https://img-blog.csdnimg.cn/img_convert/d9765f452cebd7604ab2bf2f78486906.png)

## 2.1 多线程并行执行 
ParNew由多条GC线程并行地进行垃圾清理.但清理过程仍然需要暂停一切其他用户线程.但由于有多条GC线程同时清理,清理速度比Serial有一定的提升.

## 2.2 适合多CPU的服务器环境 
由于使用了多线程,因此适合CPU较多的服务器环境.

- 与Serial性能对比 
ParNew和Serial唯一区别就是使用了多线程进行垃圾回收,在多CPU的环境下性能比Serial会有一定程度的提升;但线程切换需要额外的开销,因此在单CPU环境中表现不如Serial,双CPU环境也不一定就比Serial高效.默认开启的收集线程数与CPU数量相同.

## 2.3 采用"复制"算法

## 2.4 追求"降低停顿时间" 
和Serial相比,ParNew使用多线程的目的就是缩短垃圾收集时间,从而减少用户线程被停顿的时间.
# 3 Parallel Scavenge垃圾收集器
Parallel Scavenge和ParNew一样都是并行的多线程、新生代收集器,都使用"复制"算法进行垃圾回收.但它们有个巨大不同点:

- ParNew收集器追求降低GC时用户线程的停顿时间,适合交互式应用,良好的反应速度提升用户体验.
- Parallel Scavenge追求CPU吞吐量,能够在较短的时间内完成指定任务,因此适合不需要太多交互的后台运算.

> 吞吐量：指用户线程运行时间占CPU总时间的比例。CPU总时间包括 : 用户线程运行时间 和 GC线程运行的时间. 
> 因此，吞吐量越高表示用户线程运行时间越长，从而用户线程能够被快速处理完。

- 降低停顿时间的两种方式 
1.在多CPU环境中使用多条GC线程,从而垃圾回收的时间减少,从而用户线程停顿的时间也减少; 
2.实现GC线程与用户线程并发执行。所谓并发，就是用户线程与GC线程交替执行，从而每次停顿的时间会减少，用户感受到的停顿感降低，但线程之间不断切换意味着需要额外的开销，从而垃圾回收和用户线程的总时间将会延长。

- Parallel Scavenge提供的参数
 - -XX:GCTimeRadio
直接设置吞吐量大小,GC时间占总时间比率.相当于是吞吐量的倒数.

 - -XX:MaxGCPauseMillis
设置最大GC停顿时间.
Parallel Scavenge会根据这个值的大小确定新生代的大小.如果这个值越小,新生代就会越小,从而收集器就能以较短的时间进行一次回收;但新生代变小后,回收的频率就会提高,吞吐量也降下来了,因此要合理控制这个值.
 - -XX:+UseAdaptiveSizePolicy
通过命令就能开启GC **自适应的调节策略(区别于ParNew)**.我们只要设置最大堆(-Xmx)和MaxGCPauseMillis或GCTimeRadio,收集器会自动调整新生代的大小、Eden和Survior的比例、对象进入老年代的年龄,以最大程度上接近我们设置的MaxGCPauseMillis或GCTimeRadio.

> Parallel Scavenge不能与CMS一起使用。

# **以下都是老年代垃圾收集器**
## 1 Serial Old垃圾收集器
Serial Old收集器是Serial的老年代版本,它们都是单线程收集器,也就是垃圾收集时只启动一条GC线程,因此都适合客户端应用.

它们唯一的区别就是Serial Old工作在老年代,使用"标记-整理"算法;而Serial工作在新生代,使用"复制"算法. 
![](https://img-blog.csdnimg.cn/img_convert/d00b542c1fb7546f3fc7fe05dc99db63.png)


## 2 Parallel Old垃圾收集器

Parallel Old收集器是Parallel Scavenge的老年代版本,一般它们搭配使用,追求CPU吞吐量. 
它们在垃圾收集时都是由多条GC线程并行执行,并暂停一切用户线程,使用"标记-整理"算法.因此,由于在GC过程中没有使垃圾收集和用户线程并行执行,因此它们是追求吞吐量的垃圾收集器. 
![](https://img-blog.csdnimg.cn/img_convert/a3a8a3c96812df81cacfbbccb04d5d48.png)
![](https://img-blog.csdnimg.cn/20200416205038206.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 3  CMS垃圾收集器(Concurrent Mark Sweep): 低延迟为先!
回收停顿时间比较短，对许多应用来说,快速响应比端到端的吞吐量更为重要。管理新生代的方法与 parallel 和 serial 相同。在老年代则尽可能并发执行,每个 GC 周期只有2次短的停顿。
一种追求最短停顿时间的收集器,它在垃圾收集时使得用户线程和GC线程并发执行,因此在GC过程中用户也不会感受到明显卡顿.但用户线程和GC线程之间不停地切换会有额外的开销,因此垃圾回收总时间就会被延长.

**垃圾回收过程**
前两步需要"Stop The World"

- 初始标记 
停止一切用户线程,仅使用一条初始标记线程对所有与GC Roots直接相关联的对象进行标记,速度很快,因为没啥根对象.
- 并发标记 
使用多条并发标记线程并行执行,并与用户线程并发执行.此过程进行可达性分析,标记出所有废弃的对象,速度很慢. 就像你麻麻在你屋子里收拾垃圾,并不影响你在屋里继续浪.这里也是新一代的收集器努力优化的地方
- 重新标记 
显然,你麻麻再怎么努力收垃圾,你的屋子可能还是一堆被你新生的垃圾!漏标了很多垃圾!所以此时必须 STW,停止一切用户线程!
使用多条重新标记线程并行执行,将刚才并发标记过程中新出现的废弃对象标记出来.这个过程的运行时间介于初始标记和并发标记之间.
- 并发清除 
只使用一条并发清除线程,和用户线程们并发执行,清除刚才标记的对象.这个过程非常耗时.

![](https://img-blog.csdnimg.cn/img_convert/3748f7fddc911b57cd0f4501035b9e80.png)

- 线程角度![](https://img-blog.csdnimg.cn/20200324202758394.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

**CMS的缺点**

- 吞吐量低 
由于CMS在垃圾收集过程使用用户线程和GC线程并行执行,从而线程切换会有额外开销,因此CPU吞吐量就不如在GC过程中停止一切用户线程的方式来的高.
- 无法处理浮动垃圾,导致频繁Full GC 
由于垃圾清除过程中,用户线程和GC线程并发执行,也就是用户线程仍在执行,那么在执行过程中会产生垃圾,这些垃圾称为"浮动垃圾".
如果CMS在垃圾清理过程中,用户线程需要在老年代中分配内存时发现空间不足,就需再次发起Full GC,而此时CMS正在进行清除工作,因此此时只能由Serial Old临时对老年代进行一次Full GC.
- 使用"标记-清除"算法产生碎片空间 
由于CMS采用的是“标记-清除算法"，因此戸生大量的空间碎片，不利于空间利用率。为了解决这个问题，CMS可以通过配置
```
-XX:+UseCMSCompactAtFullCollection
```
参数，强制JVM在FGC完成后対老年代迸行圧縮，执行一次空间碎片整理，但是空间碎片整理阶段也会引发STW。为了减少STW次数，CMS还可以通过配置
```
-XX:+CMSFullGCsBeforeCompaction=n
```
参数，在执行了n次FGC后, JVM再在老年代执行空间碎片整理。

在并发收集失败的情况下，Java虚拟机会使用其他两个压缩型垃圾回收器进行一次垃圾回收。由于G1的出现，CMS在Java 9中已被废弃。

# 三色标记算法 - 漏标问题引入
没有遍历到的 - 白色
自己标了,孩子也标了 - 黑色
自己标了,孩子还没标 - 灰色

- 第一种情况 ,已经标好了 ab,还没 d,如下,此时B=>D 消失,突然A=D了,因为 A已黑了,不会再 看他的孩子,于是 D 被漏标了!
![](https://img-blog.csdnimg.cn/20200324203803767.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20200324203902985.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)![](https://img-blog.csdnimg.cn/20200324204437162.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 漏标的解决方案
把 A 再标成灰色,看起来解决了?其实依然漏标!

CMS方案: Incremental Update的非常隐蔽的问题:
并发标记，依旧产生漏标!

![](https://img-blog.csdnimg.cn/20200324204937207.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2020032420523942.png)

于是产生了 G1!


G1（Garbage First）是一个横跨新生代和老年代的垃圾回收器。实际上，它已经打乱了前面所说的堆结构，直接将堆分成极其多个区域。每个区域都可以充当Eden区、Survivor区或者老年代中的一个。它采用的是标记-压缩算法，而且和CMS一样都能够在应用程序运行过程中并发地进行垃圾回收。

G1能够针对每个细分的区域来进行垃圾回收。在选择进行垃圾回收的区域时，它会优先回收死亡对象较多的区域。这也是G1名字的由来。

# G1收集器(Garbage-First)
Hotspot 在JDK7中推出了新一代 G1 ( Garbage-First Garbage Collector )垃圾回收，通过
```
-XX:+UseG1GC
```
参数启用
和CMS相比，Gl具备压缩功能，能避免碎片向題，G1的暂停时间更加可控。性能总体还是非常不错的,G1是当今最前沿的垃圾收集器成果之一。

![](https://img-blog.csdnimg.cn/20200416212655781.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
当今最前沿的垃圾收集器成果之一.
## G1的特点
- 追求停顿时间
- 多线程GC
- 面向服务端应用
- 整体来看基于标记-整理和局部来看基于复制算法合并 
不会产生内存空间碎片.
- 可对整个堆进行垃圾回收
- 可预测的停顿时间
## G1的内存模型
没有分代概念,而是将Java堆划分为一块块独立的大小相等的Region.当要进行垃圾收集时,首先估计每个Region中的垃圾数量,每次都从垃圾回收价值最大的Region开始回收,因此可以获得最大的回收效率.

![](https://img-blog.csdnimg.cn/img_convert/1b6aecdf894dbef83eead24c57a53400.png)

G1将Java堆空间分割成了若干相同大小的区域，即region
包括
- Eden
- Survivor
- Old
- Humongous 

其中，`Humongous `是特殊的Old类型,专门放置大型对象.
这样的划分方式意味着不需要一个连续的内存空间管理对象.G1将空间分为多个区域,**优先回收垃圾最多**的区域.
G1采用的是**Mark-Copy** ，有非常好的空间整合能力,不会产生大量的空间碎片
G1的一大优势在于可预测的停顿时间,能够尽可能快地在指定时间内完成垃圾回收任务
在JDK11中，已经将G1设为默认垃圾回收器，通过jstat命令可以查看垃圾回收情况,在YGC时S0/S1并不会交换.
## Remembered Set
一个对象和它内部所引用的对象可能不在同一个Region中,那么当垃圾回收时,是否需要扫描整个堆内存才能完整地进行一次可达性分析?
当然不是,每个Region都有一个Remembered Set,用于记录本区域中所有对象引用的对象所在的区域,从而在进行可达性分析时,只要在GC Roots中再加上Remembered Set即可防止对所有堆内存的遍历.
## G1垃圾收集过程

- 初始标记 
标记与GC Roots直接关联的对象,停止所有用户线程,只启动一条初始标记线程,这个过程很快.
- 并发标记 
进行全面的可达性分析,开启一条并发标记线程与用户线程并行执行.这个过程比较长.
- 最终标记 
标记出并发标记过程中用户线程新产生的垃圾.停止所有用户线程,并使用多条最终标记线程并行执行.
- 筛选回收 
回收废弃的对象.此时也需要停止一切用户线程,并使用多条筛选回收线程并行执行.

![](https://img-blog.csdnimg.cn/img_convert/2b407cb7a63bc9c6ce67d5863d68444b.png)

S0/S1的功能由G1中的Survivor region来承载,通过GC日志可以观察到完整的垃圾回收过程如下，其中就有Survivor regions的区域从0个到1个
![](https://img-blog.csdnimg.cn/img_convert/ce92bb3baddb8af14e5cfa1f4737093d.png)
 红色标识的为G1中的四种region,都处于Heap中.
G1执行时使用4个worker并发执行，在初始标记时，还是会触发STW,如第一步所示的Pause
## 回收算法
依旧前面例子:
![](https://img-blog.csdnimg.cn/20200324205602561.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200324205533638.png)
因此,还是能追踪到 D,如果不维护 rset,需要扫描其他所有对象!因此只需要扫描该 region 即可~

针对新生代的垃圾回收器共有三个：Serial，Parallel Scavenge和Parallel New。这三个采用的都是标记-复制算法。其中，Serial是一个单线程的，Parallel New可以看成Serial的多线程版本。Parallel Scavenge和Parallel New类似，但更加注重吞吐率。此外，Parallel Scavenge不能与CMS一起使用。

针对老年代的垃圾回收器也有三个：刚刚提到的Serial Old和Parallel Old，以及CMS。Serial Old和Parallel Old都是标记-压缩算法。同样，前者是单线程的，而后者可以看成前者的多线程版本。

CMS采用的是标记-清除算法，并且是并发的。除了少数几个操作需要Stop-the-world之外，它可以在应用程序运行过程中进行垃圾回收。在并发收集失败的情况下，Java虚拟机会使用其他两个压缩型垃圾回收器进行一次垃圾回收。由于G1的出现，CMS在Java 9中已被废弃[3]。

G1（Garbage First）是一个横跨新生代和老年代的垃圾回收器。实际上，它已经打乱了前面所说的堆结构，直接将堆分成极其多个区域。每个区域都可以充当Eden区、Survivor区或者老年代中的一个。它采用的是标记-压缩算法，而且和CMS一样都能够在应用程序运行过程中并发地进行垃圾回收。

G1能够针对每个细分的区域来进行垃圾回收。在选择进行垃圾回收的区域时，它会优先回收死亡对象较多的区域。这也是G1名字的由来。


100g内存时,到头性能.
且G1 浪费空间,fullgc 特别慢!很多阶段都是 STW 的,所以有了 ZGC!
# ZGC
听说你是 zerpo paused GC?
Java 11引入了ZGC，宣称暂停时间不超过10ms,支持 4TB,JDK13 到了 16TB!

和内存无关,TB 级也只停顿 1-10ms
![](https://img-blog.csdnimg.cn/20200324211051586.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- UMA
![](https://img-blog.csdnimg.cn/20200324211303399.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- NUMA
知道NUMA存在并且能利用，哪个CPU要分配对象，优先分配离得近的内存

- 目前不分代(将来可能分冷热对象)
ZGC 学习 Asul 的商用C4收集器

## 颜色指针
![](https://img-blog.csdnimg.cn/20200324212327248.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
原来的GC信息记录在哪里呢?对象头部
ZGC记录在指针，跟对象无关,因此可以immediate memory reuse
低42位指向对象，2^42=4T  JDK13      	 2^44=16T, 目前最大就 16T,还能再大吗????
后面四位伐表对象不同状态m0 m1 remapped finalizable
18为unused

### 灵魂问题
内存中有个地址
地址中装了01001000 , mov 72,到底是一个立即数，还是一条指令?
CPU->内存，通过总线连接，-> 数据总线地址总线控制总线,所以看是从啥总线来的即可
主板地址总线最宽 48bit 48-4 颜色位,就只剩 44 位了,所以最大 16T.

## ZGC 阶段
1.pause mark start
2.concurrent mark
3.relocate
![](https://img-blog.csdnimg.cn/20200324214821947.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
4.remap

对象的位置改变了,将其引用也改变过去 - 写屏障(与 JMM 的屏障不同,勿等同!)

而 ZGC 使用的读屏障!
# GC的优势在哪里
- 流行于现代的各大语言和平台
- 效率和稳定性
 - 程序员不需要负责释放及销毁对象
 - 消除了不稳定性,延迟以及维护等几乎全部(普遍的)的可能
- 保证了互操作性
 - 不需要与APIs之间交互的内存管理契约
 -  与不协调的库,框架,应用程序流畅地交互操作