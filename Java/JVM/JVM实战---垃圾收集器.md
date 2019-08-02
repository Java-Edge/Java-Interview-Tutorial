使用分代垃圾收集器,基于以下观察事实(弱分代假设)
- 大多数分配对象的存活时间短
- 存活时间久的对象很少引用存活时间短的对象

由此, HotSpot VM 将堆分为两个物理区空间,这就是分代(永久代只存储元数据, eg. 类的数据结构,保留字符串( Interned String))


根据新生代和老年代各自的特点,我们应该分别为它们选择不同的收集器,以提升垃圾回收效率.
![](http://upload-images.jianshu.io/upload_images/4685968-3a367913acebef67.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 1 新生代垃圾收集器

##  1.1  Serial垃圾收集器
一个主要应用于Y-GC的垃圾回收器，采用串行单线程的方式完成GC任务，其中“Stop The World"简称STW,即垃圾回收的某个阶段会暂停整个应用程序的执行
F-GC的时间相对较长，频繁FGC会严重影响应用程序的性能
![Serial 回收流程](https://upload-images.jianshu.io/upload_images/4685968-407a95f442c62819.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
`单线程 Stop-The-World 式`
![](http://upload-images.jianshu.io/upload_images/4685968-ebdf41221960630c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 单线程 
只会使用一个CPU或一条GC线程进行GC,并且在GC过程中暂停其他所有的工作线程,因此用户的请求或图形化界面会出现卡顿
- 适合Client模式
一般客户端应用所需内存较小,不会创建太多的对象,而且堆内存不大,因此GC时间比较短,即使在这段时间停止一切用户线程,也不会感到明显停顿
- 简单高效 
由于Serial收集器只有一条GC线程,避免了线程切换的开销
- 采用"复制"算法 
## 1.2 ParNew垃圾收集器
ParNew是Serial的多线程版本.
![](http://upload-images.jianshu.io/upload_images/4685968-e4947c56e4c734f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 2.1 多线程并行执行 
ParNew由多条GC线程并行地进行垃圾清理.
但清理过程仍然需要暂停一切其他用户线程.
但由于有多条GC线程同时清理,清理速度比Serial有一定的提升
## 2.2 适合多CPU的服务器环境 
由于使用多线程,是许多运行在 server 模式下的虚拟机首选的新生代收集器
- 与Serial性能对比 
ParNew和Serial唯一区别就是使用了多线程垃圾回收,在多CPU的环境下性能比Serial会有一定程度的提升
但线程切换需要额外的开销,因此在单CPU环境中表现不如Serial,双CPU环境也不一定就比Serial高效
默认开启的收集线程数与CPU数量相同
## 2.3 采用"复制"算法
## 2.4 追求"降低停顿时间" 
和Serial相比,ParNew使用多线程的目的就是缩短GC时间,从而减少用户线程被停顿的时间
# 3 Parallel : 吞吐量为先!
## 3.1 Scavenge垃圾收集器
Parallel Scavenge和ParNew一样都是并行的多线程、新生代收集器,都使用"复制"算法(`Stop-The-World`)进行垃圾回收

但它们有个巨大不同点:
- ParNew收集器追求降低GC时用户线程的停顿时间,适合交互式应用,良好的反应速度提升用户体验.
- Parallel Scavenge追求可控的CPU吞吐量,能够在较短的时间内完成指定任务,适合不需太多交互的后台运算

>吞吐量是指用户线程运行时间占CPU总时间的比例.
>CPU总时间包括 : 用户线程运行时间 和 GC线程运行的时间. 
> 因此,吞吐量越高表示用户线程运行时间越长,从而用户线程能够被快速处理完.

- 降低停顿时间的两种方式 
1.在多CPU环境中使用多条GC线程,从而垃圾回收的时间减少,从而用户线程停顿的时间也减少;
2.实现GC线程与用户线程并发执行。所谓并发，就是用户线程与GC线程交替执行，从而每次停顿的时间会减少，用户感受到的停顿感降低，但线程之间不断切换意味着需要额外的开销，从而垃圾回收和用户线程的总时间将会延长。

- Parallel Scavenge提供的参数
 - -XX:GCTimeRadio
直接设置吞吐量大小,GC时间占总时间比率.相当于是吞吐量的倒数.

 - -XX:MaxGCPauseMillis
设置最大GC停顿时间
Parallel Scavenge会根据这个值的大小确定新生代的大小.
这个值越小,新生代就越小,从而收集器就能以较短时间进行一次GC
但新生代变小后,回收的频率就会提高,吞吐量也降下来了,因此要合理控制这个值
 - -XX:+UseAdaptiveSizePolicy
开启GC **自适应的调节策略(区别于ParNew)**.
我们只要设置最大堆(-Xmx)和MaxGCPauseMillis或GCTimeRadio,收集器会自动调整新生代的大小、Eden和Survior的比例、对象进入老年代的年龄,以最大程度上接近我们设置的MaxGCPauseMillis或GCTimeRadio
## 3.2 Old垃圾收集器
Parallel Scavenge的老年代版本,一般它们搭配使用,追求CPU吞吐量

它们在垃圾收集时都是由多条GC线程并行执行,并暂停一切用户线程,使用"标记-整理"算法.因此,由于在GC过程中没有使垃圾收集和用户线程并行执行,因此它们是追求吞吐量的垃圾收集器. 
![](http://upload-images.jianshu.io/upload_images/4685968-7dfdda76a61a31cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# **老年代垃圾收集器**
# 1 Serial Old垃圾收集器
Serial的老年代版本,都是单线程收集器,GC时只启动一条GC线程,因此都适合客户端应用.


它们唯一的区别就是
- Serial Old工作在老年代,使用"标记-整理"算法
- Serial工作在新生代,使用"复制"算法. 
![](http://upload-images.jianshu.io/upload_images/4685968-b150a60a1bae36a8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 4  CMS垃圾收集器(Concurrent Mark Sweep Collector) : 低延迟为先!
回收停顿时间比较短、目前比较常用的垃圾回收器。它通过初始标记(InitialMark)、并发标记(Concurrent   Mark)、重新标记( Remark)、并发清除( Concurrent Sweep )四个步骤完成垃圾回收工作
由于CMS采用的是“标记-清除算法"，因此戸生大量的空间碎片。为了解决这个问题，CMS可以通过配置
```
-XX:+UseCMSCompactAtFullCollection
```
参数，强制JVM在FGC完成后対老年代迸行圧縮，执行一次空间碎片整理，但是空间碎片整理阶段也会引发STW。为了减少STW次数，CMS还可以通过配置
```
-XX:+CMSFullGCsBeforeCompaction=n
```
参数，在执行了n次FGC后, JVM再在老年代执行空间碎片整理

对许多应用来说,快速响应比端到端的吞吐量更为重要

管理新生代的方法与 parallel 和 serial 相同
在老年代则尽可能并发执行,每个 GC 周期只有2次短的停顿

一种追求最短停顿时间的收集器
在GC时使得用户线程和GC线程并发执行,因此在GC过程中用户也不会感受到明显卡顿
但用户线程和GC线程之间不停地切换会有额外的开销,因此垃圾回收总时间就会被延长
**垃圾回收过程**
前两步需要"Stop The World"
- 初始标记 (Initial Mark)
停止一切用户线程,仅使用一条初始标记线程对所有与GC Roots直接相关联的 老年代对象进行标记,速度很快
- 并发标记 (Concurrent Marking Phase)
使用多条并发标记线程并行执行,并与用户线程并发执行.此过程进行可达性分析,标记所有这些对象可达的存货对象,速度很慢
- 重新标记 ( Remark)
因为并发标记时有用户线程在执行，标记结果可能有变化
停止一切用户线程,并使用多条重新标记线程并行执行,重新遍历所有在并发标记期间有变化的对象进行最后的标记.这个过程的运行时间介于初始标记和并发标记之间
- 并发清除 (Concurrent Sweeping)
只使用一条并发清除线程,和用户线程们并发执行,清除刚才标记的对象
这个过程非常耗时
![](http://upload-images.jianshu.io/upload_images/4685968-fb1723e25639cf21.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 4.1 **CMS的缺点**
- 吞吐量低 
由于CMS在GC过程用户线程和GC线程并行,从而有线程切换的额外开销
因此CPU吞吐量就不如在GC过程中停止一切用户线程的方式来的高
- 无法处理浮动垃圾,导致频繁Full GC 
由于垃圾清除过程中,用户线程和GC线程并发执行,也就是用户线程仍在执行,那么在执行过程中会产生垃圾,这些垃圾称为"浮动垃圾"
如果CMS在GC过程中,用户线程需要在老年代中分配内存时发现空间不足,就需再次发起Full GC,而此时CMS正在进行清除工作,因此此时只能由Serial Old临时对老年代进行一次Full GC
- 使用"标记-清除"算法产生碎片空间 
由于CMS使用了"标记-清除"算法, 因此清除之后会产生大量的碎片空间,不利于空间利用率.不过CMS提供了应对策略:
   - 开启-XX:+UseCMSCompactAtFullCollection 
开启该参数后,每次FullGC完成后都会进行一次内存压缩整理,将零散在各处的对象整理到一块儿.但每次都整理效率不高,因此提供了以下参数.
   - 设置参数-XX:CMSFullGCsBeforeCompaction 
本参数告诉CMS,经过了N次Full GC过后再进行一次内存整理.

# 5 G1收集器(Garbage-First)
Hotspot 在JDK7中推出了新一代 G1 ( Garbage-First Garbage Collector )垃圾回收，通过
```
-XX:+UseG1GC
```
参数启用
和CMS相比，Gl具备压缩功能，能避免碎片向題，G1的暂停时间更加可控。性能总体还是非常不错的,G1是当今最前沿的垃圾收集器成果之一.

## 5.1 G1的特点
- 追求停顿时间
- 多线程GC
- 面向服务端应用
- 整体来看基于标记-整理和局部来看基于复制算法合并 
不会产生内存空间碎片
- 可对整个堆进行垃圾回收
- 可预测的停顿时间
## 5.2 G1的内存模型
没有新生代和老年代的概念,而是将Java堆划分为一块块独立的大小相等的Region.
当要进行垃圾收集时,首先估计每个Region中的垃圾数量,每次都从垃圾回收价值最大的Region开始回收,因此可以获得最大的回收效率
![](https://upload-images.jianshu.io/upload_images/4685968-db8d827f816cca34.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
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

## 5.3 Remembered Set
一个对象和它内部所引用的对象可能不在同一个Region中,那么当垃圾回收时,是否需要扫描整个堆内存才能完整地进行一次可达性分析?
当然不是,每个Region都有一个Remembered Set,用于记录本区域中所有对象引用的对象所在的区域,从而在进行可达性分析时,只要在GC Roots中再加上Remembered Set即可防止对所有堆内存的遍历.
## 5.4 G1垃圾收集过程

- 初始标记 
标记与GC Roots直接关联的对象,停止所有用户线程,只启动一条初始标记线程,这个过程很快.
- 并发标记 
进行全面的可达性分析,开启一条并发标记线程与用户线程并行执行.这个过程比较长.
- 最终标记 
标记出并发标记过程中用户线程新产生的垃圾.停止所有用户线程,并使用多条最终标记线程并行执行.
- 筛选回收 
回收废弃的对象.此时也需要停止一切用户线程,并使用多条筛选回收线程并行执行.
![这里写图片描述](http://upload-images.jianshu.io/upload_images/4685968-0ea2b3a18ecc561a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

S0/S1的功能由G1中的Survivor region来承载,通过GC日志可以观察到完整的垃圾回收过程如下，其中就有Survivor regions的区域从0个到1个
![](https://upload-images.jianshu.io/upload_images/4685968-ad5f6b99b3de502e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 红色标识的为G1中的四种region,都处于Heap中.
G1执行时使用4个worker并发执行，在初始标记时，还是会触发STW,如第一步所示的Pause






































