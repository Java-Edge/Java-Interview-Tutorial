# JDK性能调优神器

## 1 jps

类似Linux的ps，但jps只列Java进程。方便查看Java进程的启动类、传入参数和JVM参数。

直接运行，不加参数，列出Java程序的进程ID及Main函数名称，本质也是Java程序：

```bash
$ jps
23744 Jps
21969 jar
```

```bash
# 输出传递给Java进程的参数
$ jps -m
23553 Jps -m
21969 jar --spring.config.location=application-prod.yml
7126 jar --spring.config.location=application-prod.yml
2119 jar --spring.config.location=application-prod.yml
23196 jar
```

```bash
# 输出主函数的完整路径
$ jps -l
21969 monitor-manage.jar
7126 monitor-manage-1.jar
2119 monitor-manage.jar
23196 javaedge-301-forward.jar
23646 sun.tools.jps.Jps
```

```bash
# 只输出进程ID
$ jps -q
21969
23686
7126
2119
23196
```

```bash
# 显示传递给JVM的参数
$ jps -v
21969 jar -Dio.netty.leakDetectionLevel=advanced -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=256m -Xms2G -Xmx2G -XX:SurvivorRatio=8 -XX:+UseConcMarkSweepGC
23717 Jps -Denv.class.path=/usr/java/jdk1.8.0_241/lib/ -Dapplication.home=/usr/java/jdk1.8.0_241 -Xms8m
7126 jar -Dio.netty.leakDetectionLevel=advanced -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=256m -Xms2G -Xmx2G -XX:SurvivorRatio=8 -XX:+UseConcMarkSweepGC
2119 jar -Dio.netty.leakDetectionLevel=advanced -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=256m -Xms3G -Xmx3G -XX:SurvivorRatio=8 -XX:+UseConcMarkSweepGC
23196 jar -Dfile.encoding=UTF-8 -Xmx2048M -XX:+UseConcMarkSweepGC -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=10 -XX:GCLogFileSize=20M
```

## 2 jstat

观察Java应用程序运行时信息的工具，详细查看堆使用情况及GC情况

```bash
$ jstat -options
-class
-compiler
-gc
-gccapacity
-gccause
-gcmetacapacity
-gcnew
-gcnewcapacity
-gcold
-gcoldcapacity
-gcutil
-printcompilation
```

### 1.2.1 -class

显示加载class的数量及所占空间等信息。

```bash
# 显示JIT编译的信息
$ jstat -class -t 21969
Timestamp       Loaded  Bytes  Unloaded  Bytes     Time   
       587378.9  17316 31952.0        0     0.0      11.17
```

- Loaded：已加载的类的数量
- Bytes：已加载类的总大小（字节单位）
- Unloaded：已卸载的类的数量
- Bytes：已卸载类的总大小（字节单位）
- Time：执行类加载和卸载操作所花费的时间（ms）

### 1.2.2 -gc

显示gc信息，查看gc的次数及时间

```shell
$ jstat -gc 21969
 S0C    S1C    S0U    S1U      EC       EU        OC         OU       MC     MU    CCSC   CCSU   YGC     YGCT    FGC    FGCT     GCT   
34048.0 34048.0 194.9   0.0   272640.0 43565.7  1756416.0   104035.3  100480.0 95817.9 12672.0 11778.1  26862  237.015   0      0.000  237.015
```

1. S0C：年轻代中第一个Survivor区的容量，单位为KB。
2. S1C：年轻代中第二个Survivor区的容量，单位为KB。
3. S0U：年轻代中第一个Survivor区已使用大小，单位为KB。
4. S1U：年轻代中第二个Survivor区已使用大小，单位为KB。
5. EC：年轻代中Eden区的容量，单位为KB。
6. EU：年轻代中Eden区已使用大小，单位为KB。
7. OC：老年代的容量，单位为KB。
8. OU：老年代已使用大小，单位为KB。
9. MC：元空间的容量，单位为KB。
10. MU：元空间已使用大小，单位为KB。
11. CCSC：压缩类的容量，单位为KB。
12. CCSU：压缩类已使用大小，单位为KB。
13. YGC：Young GC的次数。
14. YGCT：Young GC所用的时间。
15. FGC：Full GC的次数。
16. FGCT：Full GC的所用的时间。
17. GCT：GC的所用的总时间。

### 1.2.3 -gccapacity

比-gc多了各代的最大值和最小值

```bash
$ jstat -gccapacity 21969
 NGCMN    NGCMX     NGC     S0C   S1C       EC      OGCMN      OGCMX       OGC         OC       MCMN     MCMX      MC     CCSMN    CCSMX     CCSC    YGC    FGC 
340736.0 340736.0 340736.0 34048.0 34048.0 272640.0  1756416.0  1756416.0  1756416.0  1756416.0      0.0 1136640.0 100480.0      0.0 1048576.0  12672.0  26910     0
```



![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWI1ZGVjMWVmNDgzYzM5ODUucG5n?x-oss-process=image/format,png)

### 1.2.4 -gccause

最近一次GC统计和原因

```bash
$ jstat -gccause 21969
  S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT     GCT    LGCC                 GCC                 
  0.00   0.62  55.30   5.93  95.36  92.95  26917  237.468     0    0.000  237.468 Allocation Failure   No GC               
```

- LGCC：上次GC原因
- GCC：当前GC原因

常见 GC 原因：

- Allocation Failure：堆空间不足，无法为新对象分配空间，从而触发GC
- GCLocker Initiated GC：JNI关键区域长时间被占用，阻碍了垃圾回收时，会发生这种情况。这些区域释放后，GC被启动以回收空间
- Allocation Profiler：这表明垃圾回收是由一个监控对象分配的工具触发的。
- Java System.gc()：这表明垃圾回收是由应用程序代码中对`System.gc()`的显式调用触发的
- Heap Inspection Initiated GC：请求进行堆检查时，通常由监控工具或命令发起，垃圾回收被触发。=
- Class Unloading：GC是为了卸载不再使用的类并回收类元数据所占用的空间
- GC Cause Unknown：这表明无法确定触发垃圾回收的原因。
- No GC：从上次执行jstat命令以来，没有发生GC事件

###  1.2.5 -gcnew

new对象的信息

```bash
$ jstat -gcnew 21969
 S0C    S1C    S0U    S1U   TT MTT  DSS      EC       EU     YGC     YGCT  
34048.0 34048.0  181.5    0.0 15  15 17024.0 272640.0 219921.5  26926  237.544
```



![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWU4ZTkxN2Y1YjQ2YjgzMWMucG5n?x-oss-process=image/format,png)

### 1.2.6 -gcnewcapacity

new对象的信息及其占用量

```bash
$ jstat -gcnewcapacity 21969
  NGCMN      NGCMX       NGC      S0CMX     S0C     S1CMX     S1C       ECMX        EC      YGC   FGC 
  340736.0   340736.0   340736.0  34048.0  34048.0  34048.0  34048.0   272640.0   272640.0 26931     0
```

### 1.2.7 -gcold

显示老年代和永久代信息

```bash
$ jstat -gcold 21969
   MC       MU      CCSC     CCSU       OC          OU       YGC    FGC    FGCT     GCT   
100480.0  95817.9  12672.0  11778.1   1756416.0    104093.1  26934     0    0.000  237.609
```



![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWRkYzU1MTQ2ZDI3ZmY4ZDgucG5n?x-oss-process=image/format,png)

### 1.2.8 -gcoldcapacity

展现老年代的容量信息

```bash
$ jstat -gcoldcapacity 21969
   OGCMN       OGCMX        OGC         OC       YGC   FGC    FGCT     GCT   
  1756416.0   1756416.0   1756416.0   1756416.0 26950     0    0.000  237.741
```



![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTA0OWRjZjBhYzRkNjM0YjYucG5n?x-oss-process=image/format,png)

### 1.2.9 -gcutil

相比-gc 参数，只显示使用率而非使用量。
显示GC回收相关信息

```bash
$ jstat -gcutil 21969
  S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT     GCT   
  0.00   0.47  76.48   5.93  95.36  92.95  26951  237.749     0    0.000  237.749
```

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWY5MDZjZTFhZDA2MDA3YTAucG5n?x-oss-process=image/format,png)

### 1.2.10 -printcompilation

当前VM执行的信息

```bash
$ jstat -printcompilation 21969
Compiled  Size  Type Method
   19762      5    1 org/apache/commons/pool2/impl/BaseGenericObjectPool getMaxTotal
```

### 同时加两个数

输出进程的ClassLoader信息，每1s统计一次，共输出2次

```bash
$ jstat -class -t 21969 1000 2
Timestamp       Loaded  Bytes  Unloaded  Bytes     Time   
       590027.5  17316 31952.0        0     0.0      11.17
       590028.5  17316 31952.0        0     0.0      11.17
```

## 3 jinfo

```bash
jinfo <option> <pid>
```

查看正在运行的Java程序的扩展参数，甚至在运行时修改部分参数

### 3.1 查看运行时参数

```bash
$ jinfo -flag MaxTenuringThreshold 21969
-XX:MaxTenuringThreshold=15
```

### 3.2 运行时修改参数值



```bash
$ jinfo -flag PrintGCDetails 21969
-XX:-PrintGCDetails

$ jinfo -flag +PrintGCDetails 21969
```

jmap和jhat可以帮助观察线上JVM中对象分布，了解到底哪些对象占据多少内存。

## 4 jmap

生成堆快照和对象的统计信息，了解系统运行时的内存区域。

若只是了解JVM运行状况，然后去进行JVM GC优化，jstat就够，但若发现JVM新增对象速度很快，想看**到底啥对象占了这么多内存。**

若发现有的对象在代码中可优化创建时机，避免那种对象对内存占用过大，那也许可以去反过来优化代码。若不是OOM了，也没必要着急优化代码。

但了解JVM中对象分布有好处，如年轻代里总有500K左右未知对象，如何看这500K对象到底是啥呢。

### 4.1 -heap

打印堆内存相关参数设置和当前堆内存里的一些基本各区域情况。如Eden区总容量、已经使用的容量、剩余的空间容量，两个Survivor区的总容量、已经使用的容量和剩余的空间容量，老年代的总容量、已经使用的容量和剩余的容量。

这些信息jstat不是有了吗？是的，一般不会用jmap看这些，毕竟还没jstat全，因为无gc相关统计。

### 4.2 -histo

了解系统运行时的对象分布。打印Java对象堆的直方图：

```
java -histo:live 21969
```

按各对象占内存空间大小，降序排列，可简单了解当前JVM中对象的内存占用，快速了解哪个对象占用大量内存空间。

### 4.3 生成堆内存转储快照

但有时还想更深入点，用jmap生成一个堆内存快照放到一个文件：

```bash
jmap -dump:live,format=b,file=dump.hprof PID
```

该命令会在当前目录生成一个dump.hrpof文件，二进制格式，把这时刻JVM堆内存里所有对象快照放到文件。

-histo 打印每个class的实例数目,内存占用,类全名信息. VM的内部类名字开头会加上前缀”*”. 如果live子参数加上后,只统计活的对象数量. 

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTUwMWQ2ZTFlMjBiMTExOTkucG5n?x-oss-process=image/format,png)

```bash
-dump:[live,]format=b,file=<filename> 
```

使用hprof二进制形式,输出jvm的heap内容到文件=. live子选项是可选的，假如指定live选项,那么只输出活的对象到文件. 
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTlhYzUyYmNiZTYzZmNmNDIucG5n?x-oss-process=image/format,png)

获得堆快照文件之后，可使用多种工具对文件进行分析，如jhat，visual vm。

### jmap + MAT 实战内存溢出

堆区

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE3OTk4OThjODJkMTU0MTQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTU5Y2FmN2E3MjkxNWM3YzYucG5n?x-oss-process=image/format,png)

非堆区

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTBhZDNiYmVlNGViNjAzYjEucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTNlMmY4NzRhMGU1ZmNhMTMucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTdlZjg0YzQ2ODAxODk0ZjIucG5n?x-oss-process=image/format,png)

### 导出内存映像文件

#### OOM相关选项

如果程序发生OOM，JVM可配置一些选项来做些善后工作，比如把内存给dump下来，或者自动采取一些别的动作

- -XX:+HeapDumpOnOutOfMemoryError
  在内存出现OOM的时候，把Heap转存(Dump)到文件以便后续分析，文件名通常是`java_pid<pid>.hprof`
- `-XX:HeapDumpPath=<path>`
  指定heap转存文件的存储路径，需要指定的路径下有足够的空间来保存转存文件
- -XX:OnOutOfMemoryError
  指定一个可行性程序或者脚本的路径，当发生OOM的时候，去执行这个脚本


内存溢出自动导出

- -XX:+ HeapDumpOnOutOfMemoryError
- -XX:HeapDumpPath=./

使用jmap命令手动导出
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTM4ZGE3OTEzOWRkZjFmZjcucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTVkM2E1MDY2YWI1NzA2NmQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQzNjhjMTY5Y2EyNWUwNjEucG5n?x-oss-process=image/format,png)

```
option : -heap , -clstats , -dump: <dump-options> , -F
```

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTNkNGMyMWM1ZjQzNzE3ZGUucG5n?x-oss-process=image/format,png)

## 5 jhat

### 在浏览器中分析堆转出快照

接着就能使用jhat分析堆快照，jhat内置web服务器，支持通过浏览器可视化分析堆转储快照。

启动jhat服务器，可指定http端口号，默认7000：

##### jhat dump.hprof -port 7000

接着你就在浏览器上访问当前这台机器的7000端口号，就可以通过图形化的方式去分析堆内存里的对象分布情况了。
![jhat heap.hprof ](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTMyMGI3YmQ3Njc4ODAyYjkucG5n?x-oss-process=image/format,png)
jhat分析完成后，使用HTTP服务器展示其分析结果，在浏览器中访问[http://127.0.0.1:7000/](https://link.jianshu.com?t=http://127.0.0.1:7000/)：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWI2ZDNkNWM2OTI2ZTIxOTIucG5n?x-oss-process=image/format,png)

## 6 jstack

导出Java应用程序的线程堆栈。

```bash
jstack -l <pid>
```

可检测死锁。

### 案例一

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWI3OGE4NWQ0YzhjNGM2YzEucG5n?x-oss-process=image/format,png)

jps命令查看进程号为11468，然后使用

```
jstack -l 11468 > a.txt
```

把堆栈信息打印到文件

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWMzZGNmMDE4OGIyNDU0NDEucG5n?x-oss-process=image/format,png)

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTU0YWZlMTRmMzA2Y2Q5NTYucG5n?x-oss-process=image/format,png)

输出信息可知：

- 在输出的最后一段，有明确的"Found one Java-level deadlock"输出，所以通过jstack可检测死锁
- 输出中包含了所有线程，除了我们的north,sorth线程外，还有"Attach Listener", "C2 CompilerThread0", "C2 CompilerThread1"等
- 每个线程下面都会输出当前状态，以及这个线程当前持有锁以及等待锁，当持有与等待造成循环等待时，将导致死锁

### 案例二



![](https://img-blog.csdnimg.cn/20210519145034718.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)



![](https://img-blog.csdnimg.cn/20210519145230528.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

### 线上执行有啥影响？

会发生停顿，Safe-Point 停顿（STW）。

## 7 jcmd

执行 JVM 相关分析命令（整合命令）。

```bash
JFR.stop
JFR.start
JFR.dump
JFR.check
VM.native_memory
VM.check_commercial_features
VM.unlock_commercial_features
ManagementAgent.stop
ManagementAgent.start_local
ManagementAgent.start
VM.classloader_stats
GC.rotate_log
Thread.print
GC.class_stats
GC.class_histogram
GC.heap_dump
GC.finalizer_info
GC.heap_info
GC.run_finalization
GC.run
VM.uptime
VM.dynlibs
VM.flags
VM.system_properties
VM.command_line
VM.version
help
```

```bash
# 查看Java进程的版本信息
[root@backend-dev logs]# jcmd 26551 VM.version
26551:
Java HotSpot(TM) 64-Bit Server VM version 25.241-b07
JDK 8.0_241

# 列出当前所有的Java进程
jcmd -l

# 查看指定Java进程的命令行参数
[root@backend-dev logs]# jcmd 26551 VM.command_line
26551:
VM Arguments:
jvm_args: -javaagent:/data/software/skywalking-agent/skywalking-agent.jar -Dskywalking.agent.service_name=monitor-manager-2-pro -Dskywalking.collector.backend_service=ip:11800 -Dio.netty.leakDetectionLevel=advanced -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=256m -Xms2G -Xmx2G -XX:SurvivorRatio=8 -XX:+UseConcMarkSweepGC 
java_command: monitor-manage-2.jar --spring.config.location=application-prod.yml
java_class_path (initial): monitor-manage-2.jar:/data/software/skywalking-agent/skywalking-agent.jar
Launcher Type: SUN_STANDARD

# 查看指定Java进程的线程堆栈信息
[root@backend-dev logs]# jcmd 26551 Thread.print

# 查看指定Java进程的GC情况
[root@backend-dev logs]# jcmd 26551 GC.class_histogram

# 查看指定Java进程的内存使用情况
[root@backend-dev logs]# jcmd 26551 VM.native_memory
26551:
Native memory tracking is not enabled

# 查看指定Java进程的类加载情况
[root@backend-dev logs]# jcmd 26551 GC.class_stats
26551:
GC.class_stats command requires -XX:+UnlockDiagnosticVMOptions
```

## 8 jrunscript/jjs

JDK自带的命令行工具，用于执行js代码。

1. `jrunscript`用法

   - 执行JavaScript文件

     ```
     jrunscript <filename.js>
     ```

   - 进入交互式模式

     ```
     jrunscript
     ```

   - 执行一行JavaScript代码

     ```
     jrunscript -e "<code>"
     ```

2. `jjs`用法

   - 执行JavaScript文件

     ```
     jjs <filename.js>
     ```

   - 进入交互式模式

     ```
     jjs
     ```

   - 执行一行JavaScript代码

     ```
     jjs -scripting -e "<code>"
     ```

   - 调用Java API

     ```
     jjs -scripting -classpath <class_path> -e "<code>"
     ```

以上是`jrunscript`和`jjs`的一些常见用法。这两个命令行工具可以方便地执行JavaScript代码，并且可以与Java API进行交互。

## 9 jconsole

```bash
$ jconsole
```



![](https://img-blog.csdnimg.cn/689b2f17fae24fc7a4d64ff5611b1b02.png)





![](https://img-blog.csdnimg.cn/20210117152211879.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210117152221938.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210117152231546.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210117152246493.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)



## 10 jvisualVM

基于图形界面的 Java 应用程序监视和分析工具，可以用于监视本地或远程的 Java 应用程序。以下是 jvisualVM 命令的一些详解：

```
- jvisualvm：启动 jvisualVM 工具。
- jvisualvm --openjmx \<hostname:port\>：连接到远程主机上运行的 Java 应用程序，其中 \<hostname:port\> 是远程主机的名称和端口号。
- jvisualvm --cp:a \<path\>：添加指定路径下的 jar 文件或目录到 classpath 中。
- jvisualvm --cp:p \<path\>：将指定路径下的 jar 文件或目录添加到 boot classpath 中。
- jvisualvm --cp:s \<path\>：将指定路径下的 jar 文件或目录添加到系统 classpath 中。
- jvisualvm --openfile \<filename\>：打开指定的堆转储文件。
- jvisualvm --jdkhome \<path\>：指定 JDK 的安装路径。
```



这些命令可以通过在命令行中输入 `jvisualvm -help` 来查看。

![](https://img-blog.csdnimg.cn/20210117152646321.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)