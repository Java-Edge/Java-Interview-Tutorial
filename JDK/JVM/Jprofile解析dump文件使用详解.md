# 1 Jprofile简介
- [官网](https://www.ej-technologies.com/products/jprofiler/overview.html)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200229024741487.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 下载对应的系统版本即可
![](https://img-blog.csdnimg.cn/20200229024854171.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

性能查看工具JProfiler，可用于查看java执行效率，查看线程状态，查看内存占用与内存对象，还可以分析dump日志.


# 2 功能简介
- 选择attach to a locally running jvm
![](https://img-blog.csdnimg.cn/20200229025200914.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 选择需要查看运行的jvm，双击或者点击start
![](https://img-blog.csdnimg.cn/20200229025304638.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 等待进度完成，弹出模式选择
![](https://img-blog.csdnimg.cn/20200229025406155.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
   - Instrumentation模式记录所有的信息。包括方法执行次数等Sampling模式则只支持部分功能，不纪录方法调用次数等，并且更为安全
由于纪录信息很多，java运行会变的比正常执行慢很多，sampling模式则不会
	- 常规使用选择sampling模式即可，当需要调查方法执行次数才需要选择Instrumentation模式，模式切换需要重启jprofiler

- 点击OK
![](https://img-blog.csdnimg.cn/20200229025604706.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 选择Live Momory可以查看内存中的对象和大小
![](https://img-blog.csdnimg.cn/202002290257375.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 选择cpu views点击下图框中的按钮来纪录cpu的执行时间
![](https://img-blog.csdnimg.cn/20200229025934939.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 这时候可以在外部对需要录的jvm操作进行记录了,得出的结果可以轻松看出方法执行调用过程与消耗时间比例：

- 根据cpu截图的信息，可以找到效率低的地方进行处理，如果是Instrumentation模式则在时间位置会显示调用次数


在Thread界面则可以实时查看线程运行状态，黄色的是wait 红色是block 绿色的是runnable蓝色是网络和I/O请求状态
![](https://img-blog.csdnimg.cn/20200229030202768.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

选择ThreadDumps,可以录制瞬时线程的调用堆栈信息，如下图所示：
![](https://img-blog.csdnimg.cn/20200229030320692.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

#  3 dump 文件分析
## 3.1 dump 生成
### JProfiler 在线 

当JProfiler连接到JVM之后选择Heap Walker，选择Take snapshot图标，然后等待即可
![](https://img-blog.csdnimg.cn/20200229030546342.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200229030602936.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
如果内存很大，jprofiler万一参数设置的不正确打不开就需要要重新生成，内存小的时候无所谓

### 使用JProfiler生成文件
当JProfiler连接到JVM之后选择菜单上的Profiling->save HPROF snapshot 弹出下拉框保存即可，这时候生成的文件就可以一直保存在文件上

### jmap

```bash
jmap -dump:format=b,file=文件名 pid

windows下不用[]，路径要加引号

jmap -dump:format=b,file="D:\a.dump" 8632
```
命令中文件名就是要保存的dump文件路径， pid就是当前jvm进程的id


### JVM启动参数
在发生outofmemory的时候自动生成dump文件:

```bash
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=D:\heapdump
```
Pah后面是一个存在的可访问的路径，将改参数放入jvm启动参数可以在发生内存outofmemory的时候自动生成dump文件，但是正式环境使用的时候不要加这个参数，不然在内存快满的时候总是会生成dump而导致jvm卡半天，需要调试的时候才需要加这个参数

注意：通过WAS生成的PHD文件dump不能分析出出问题的模板，因为PHD文件不包含对象的值内容，无法根据PHD文件找到出问题的模板，所以PHD文件没有太大的参考价值

## 3.2 dump文件分析
dump文件生成后，将dump压缩传输到本地，不管当前dump的后缀名是什么，直接改成*.hprof，就可以直接用jprofiler打开了

打开的过程时间可能会很长，主要是要对dump进行预处理，计算什么的，注意 这个过程不能点skip，否则就不太好定位大文件
- 直接打开`.hprof`文件
![](https://img-blog.csdnimg.cn/20200229003455158.png)
- 注意如下过程,中途可以喝一杯☕️,不要作死手滑点击了 skip!
![](https://img-blog.csdnimg.cn/20200227174740284.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)![](https://img-blog.csdnimg.cn/20200229002551182.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200229002604848.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200229002723570.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200229002943350.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2020022900330228.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200229032220529.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
这样界面的时候下面可以开始进行操作了!

# 4 模块功能点详解
也可以使用工具栏中的“转到开始”按钮访问第一个数据集

## 4.1 内存视图 Memory Views
JProfiler的内存视图部分可以提供动态的内存使用状况更新视图和显示关于内存分配状况信息的视图。所有的视图都有几个聚集层并且能够显示现有存在的对象和作为垃圾回收的对象。
- 所有对象 All Objects
显示类或在状况统计和尺码信息堆上所有对象的包。你可以标记当前值并显示差异值。
- 记录对象 Record Objects 
显示类或所有已记录对象的包。你可以标记出当前值并且显示差异值。
- 分配访问树 Allocation Call Tree 
显示一棵请求树或者方法、类、包或对已选择类有带注释的分配信息的J2EE组件。
- 分配热点 Allocation Hot Spots 
显示一个列表，包括方法、类、包或分配已选类的J2EE组件。你可以标注当前值并且显示差异值。对于每个热点都可以显示它的跟踪记录树。
- 类追踪器 Class Tracker 
类跟踪视图可以包含任意数量的图表，显示选定的类和包的实例与时间。




## 4.2 堆遍历 Heap Walker
### 使用背景
在视图中找到增长快速的对象类型，在memory视图中找到Concurrenthashmap---点右键----选择“Show Selectiion In Heap Walker”，切换到HeapWarker 视图；切换前会弹出选项页面，注意一定要选择“Select recorded  objects”，这样Heap Walker会在刚刚的那段记录中进行分析；否则，会分析tomcat的所有内存对象，这样既耗时又不准确；



在JProfiler的堆遍历器(Heap Walker)中，你可以对堆的状况进行快照并且可以通过选择步骤下寻找感兴趣的对象。堆遍历器有五个视图：
- 类 Classes 
显示所有类和它们的实例，可以右击具体的类"Used Selected Instance"实现进一步跟踪。
- 分配 Allocations 
为所有记录对象显示分配树和分配热点。
- 索引 References 
为单个对象和“显示到垃圾回收根目录的路径”提供索引图的显示功能。还能提供合并输入视图和输出视图的功能。
- 时间 Time 
显示一个对已记录对象的解决时间的柱状图。
- 检查 Inspections 
显示了一个数量的操作，将分析当前对象集在某种条件下的子集，实质是一个筛选的过程。

### 在HeapWalker中，找到泄漏的对象
HeapWarker 会分析内存中的所有对象，包括对象的引用、创建、大小和数量.
通过切换到References页签，可以看到这个类的具体对象实例。 为了在这些内存对象中，找到泄漏的对象（应该被回收），可以在该对象上点击右键，选择“Use Selected Instances”缩小对象范围
![](https://img-blog.csdnimg.cn/2020022904291115.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

###  通过引用分析该对象
References 可以看到该对象的的引用关系，选项显示引用的类型
![](https://img-blog.csdnimg.cn/20200229043146569.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- incoming
显示这个对象被谁引用
- outcoming
显示这个对象引用的其他对象

选择“Show In Graph”将引用关系使用图形方式展现；

- 选中该对象，点击`Show Paths To GC Root`，会找到引用的根节点
![](https://img-blog.csdnimg.cn/20200229043837414.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### 通过创建分析该对象
如果还不能定位内存泄露的地方，我们可以尝试使用Allocations页签，该页签显示对象是如何创建出来的；
我们可以从创建方法开始检查，检查所有用到该对象的地方，直到找到泄漏位置；
## 图表 Graph
你需要在references视图和biggest视图手动添加对象到图表，它可以显示对象的传入和传出引用，能方便的找到垃圾收集器根源。

tips：在工具栏点击"Go To Start"可以使堆内存重新计数，也就是回到初始状态。

　　

## CPU 视图 CPU Views
　　JProfiler 提供不同的方法来记录访问树以优化性能和细节。线程或者线程组以及线程状况可以被所有的视图选择。所有的视图都可以聚集到方法、类、包或J2EE组件等不同层上。CPU视图部分包括：

　　

访问树 Call Tree 
显示一个积累的自顶向下的树，树中包含所有在JVM中已记录的访问队列。JDBC,JMS和JNDI服务请求都被注释在请求树中。请求树可以根据Servlet和JSP对URL的不同需要进行拆分。
热点 Hot Spots 
显示消耗时间最多的方法的列表。对每个热点都能够显示回溯树。该热点可以按照方法请求，JDBC，JMS和JNDI服务请求以及按照URL请求来进行计算。
访问图 Call Graph 
显示一个从已选方法、类、包或J2EE组件开始的访问队列的图。
方法统计 Method Statistis
显示一段时间内记录的方法的调用时间细节。
## 线程视图 Thread Views
　　JProfiler通过对线程历史的监控判断其运行状态，并监控是否有线程阻塞产生，还能将一个线程所管理的方法以树状形式呈现。对线程剖析，JProfiler提供以下视图:

　　

线程历史 Thread History 
显示一个与线程活动和线程状态在一起的活动时间表。
线程监控 Thread Monitor 
显示一个列表，包括所有的活动线程以及它们目前的活动状况。
线程转储 Thread Dumps 
显示所有线程的堆栈跟踪。
## 监控器视图 Monitor Views
　　JProfiler提供了不同的监控器视图，如下所示:

　　

当前锁定图表 Current Locking Graph 
显示JVM中的当前锁定情况。
当前监视器 Current Monitors 
显示当前正在等待或阻塞中的线程操作。
锁定历史图表 Locking History Graph 
显示记录在JVM中的锁定历史。
监控器历史 Monitor History 
显示等待或者阻塞的历史。
监控器使用统计 Monitor Usage Statistics 
计算统计监控器监控的数据。
## VM遥感勘测技术视图 VM Telemetry Views
　　观察JVM的内部状态，JProfiler提供了不同的遥感勘测视图，如下所示:

　　

内存 Memory 
显示堆栈的使用状况和堆栈尺寸大小活动时间表。
记录的对象 Recorded Objects 
显示一张关于活动对象与数组的图表的活动时间表。
记录的生产量 Recorded Throughput 
显示一段时间累计的JVM生产和释放的活动时间表。
垃圾回收活动 GC Activity
显示一张关于垃圾回收活动的活动时间表。
类 Classes 
显示一个与已装载类的图表的活动时间表。
线程 Threads 
显示一个与动态线程图表的活动时间表。
CPU负载 CPU Load 
显示一段时间中CPU的负载图表。


> 参考
> - [使用JProfiler进行内存分析](https://www.cnblogs.com/onmyway20xx/p/3963735.html)