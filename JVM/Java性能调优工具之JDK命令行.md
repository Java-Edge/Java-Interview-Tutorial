## 1.1 jps
类似Linux的ps,但是jps只用于列出Java的进程
可以方便查看Java进程的启动类,传入参数和JVM参数等
直接运行,不加参数,列出Java程序的进程ID以及Main函数等名称
![jps命令本质也是Java程序](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTljMjE4OWRlZDljYmQ1M2UucG5n?x-oss-process=image/format,png)
![-m 输出传递给Java进程的参数](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE1ZDAzZGJkNWY4MDIxMDkucG5n?x-oss-process=image/format,png)
![-l 输出主函数的完整路径](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWJkOGY1NzU2NWQzNDY1NDMucG5n?x-oss-process=image/format,png)
![-q 只输出进程ID](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWUzODhhY2U5MmYzMDNkYWYucG5n?x-oss-process=image/format,png)
![-v 显示传递给jvm的参数](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTlhM2JhYjkzZjk0Y2U2YzgucG5n?x-oss-process=image/format,png)
## 1.2 jstat
用于观察Java应用程序运行时信息的工具,详细查看堆使用情况以及GC情况
![jstat -options](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWZiYzg1NWU5NDk3MTljNzcucG5n?x-oss-process=image/format,png)
### 1.2.1 jstat -class pid
显示加载class的数量及所占空间等信息
![-compiler -t:显示JIT编译的信息](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTcyM2Y5ZjA4MjMyMjcyMDQucG5n?x-oss-process=image/format,png)
### 1.2.2 -gc pid
可以显示gc的信息，查看gc的次数及时间
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTZiODFlOTZjOWNlNGExMjIucG5n?x-oss-process=image/format,png)
### 1.2.3 -gccapacity
比-gc多了各个代的最大值和最小值
![jstat -gccapacity 3661](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LThmMGMwNTY4YTgzM2M5MzkucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWI1ZGVjMWVmNDgzYzM5ODUucG5n?x-oss-process=image/format,png)
### -gccause
最近一次GC统计和原因
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE5ZTcxOTQ3NThlNGI5MzgucG5n?x-oss-process=image/format,png)
- LGCC:上次GC原因
- GCC:当前GC原因
![ -gcnew pid:new对象的信息。](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTMwNzQwZDQ1ODIyNzRmZGUucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWU4ZTkxN2Y1YjQ2YjgzMWMucG5n?x-oss-process=image/format,png)
### jstat -gcnewcapacity pid:new对象的信息及其占用量
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTVkNDIyNjNhNWNmYjQ1MjAucG5n?x-oss-process=image/format,png)

![-gcold 显示老年代和永久代信息](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTI3OTI1YWUyNzA3YWI5Y2MucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWRkYzU1MTQ2ZDI3ZmY4ZDgucG5n?x-oss-process=image/format,png)
![-gcoldcapacity展现老年代的容量信息](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTc0NjhlMDA4YTUwZGMyMDQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTA0OWRjZjBhYzRkNjM0YjYucG5n?x-oss-process=image/format,png)
### -gcutil
显示GC回收相关信息
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTNhYmVkNDJmOTdiOWZmYzQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWY5MDZjZTFhZDA2MDA3YTAucG5n?x-oss-process=image/format,png)
### -printcompilation
当前VM执行的信息
![jstat -printcompilation 3661](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWMxMzk3NmMzZjE4OTViYWIucG5n?x-oss-process=image/format,png)
### 还可以同时加两个数
![输出进程4798的ClassLoader信息,每1秒统计一次,共输出2次](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTBjMjcyNGI5MzIwOWU4ZjIucG5n?x-oss-process=image/format,png)
## 1.3 jinfo
`jinfo <option> <pid>`
查看正在运行的Java程序的扩展参数，甚至在运行时修改部分参数
## 查看运行时参数
```
jinfo -flag MaxTenuringThreshold 31518
-XX:MaxTenuringThreshold=15
```
![](https://img-blog.csdnimg.cn/20200216234802960.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## 在运行时修改参数值
```
> jinfo -flag PrintGCDetails 31518
-XX:-PrintGCDetails

> jinfo -flag +PrintGCDetails 31518

> jinfo -flag PrintGCDetails 31518

-XX:+PrintGCDetails

```

## 1.4 jmap
生成堆快照和对象的统计信息
![-histo 打印每个class的实例数目,内存占用,类全名信息. VM的内部类名字开头会加上前缀”*”. 如果live子参数加上后,只统计活的对象数量. ](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTUwMWQ2ZTFlMjBiMTExOTkucG5n?x-oss-process=image/format,png)

![-dump:[live,]format=b,file=<filename> 使用hprof二进制形式,输出jvm的heap内容到文件=. live子选项是可选的，假如指定live选项,那么只输出活的对象到文件. ](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTlhYzUyYmNiZTYzZmNmNDIucG5n?x-oss-process=image/format,png)

获得堆快照文件之后，我们可以使用多种工具对文件进行分析，例如jhat，visual vm等。
## 1.5 jhat
分析Java应用程序的堆快照文件,以前面生成的为例
![jhat heap.hprof ](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTMyMGI3YmQ3Njc4ODAyYjkucG5n?x-oss-process=image/format,png)
jhat在分析完成之后，使用HTTP服务器展示其分析结果，在浏览器中访问[http://127.0.0.1:7000/](https://link.jianshu.com?t=http://127.0.0.1:7000/)即可得到分析结果。
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWI2ZDNkNWM2OTI2ZTIxOTIucG5n?x-oss-process=image/format,png)
## 1.6b jstack
导出Java应用程序的线程堆栈
`jstack -l <pid>`


jstack可以检测死锁，下例通过一个简单例子演示jstack检测死锁的功能。java代码如下：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWI3OGE4NWQ0YzhjNGM2YzEucG5n?x-oss-process=image/format,png)
![使用jps命令查看进程号为11468，然后使用jstack -l 11468 > a.txt命令把堆栈信息打印到文件中](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWMzZGNmMDE4OGIyNDU0NDEucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTU0YWZlMTRmMzA2Y2Q5NTYucG5n?x-oss-process=image/format,png)
从这个输出可以知道：
1、在输出的最后一段，有明确的"Found one Java-level deadlock"输出，所以通过jstack命令我们可以检测死锁
2、输出中包含了所有线程，除了我们的north,sorth线程外，还有"Attach Listener", "C2 CompilerThread0", "C2 CompilerThread1"等等；
3、每个线程下面都会输出当前状态，以及这个线程当前持有锁以及等待锁，当持有与等待造成循环等待时，将导致死锁
