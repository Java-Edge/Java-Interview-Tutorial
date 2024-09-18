# Java NIO为何导致堆外内存OOM了？

某天告警：某台机器部署的一个服务突然无法访问。第一反应登录机器查看日志，因为服务挂掉，很可能因OOM。在机器日志发现如下信息：

```
nio handle failed java.lang.OutOfMemoryError: Direct buffer memory at org.eclipse.jetty.io.nio.xxxx

at org.eclipse.jetty.io.nio.xxxx at org.eclipse.jetty.io.nio.xxxx
```

说明确实OOM，但哪个区导致的呢？看到：**Direct buffer memory**，还看到一大堆jetty相关方法调用栈，仅凭这些日志，就能分析OOM原因。

## 1 Direct buffer memory

堆外内存，JVM堆内存之外的内存，不是JVM管理，但Java代码却能在JVM堆外使用内存空间。这些空间就是Direct buffer memory，即直接内存，由os直管。但称其为直接内存有些奇怪，更爱称其为“堆外内存”。

Jetty作为JVM进程运行我们写好的系统的流程：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/84fd02eef73b2b43188398dbef14e260.png)﻿

这次OOM是Jetty在使用堆外内存时导致。Jetty可能不停使用堆外内存，然后导致堆外内存空间不足，无法使用更多堆外内存，就OOM。Jetty不停使用堆外内存：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/fa1f7fe8e6309a58a251a885d7d6be83.png)﻿

## 2 解决OOM的底层技术

Jetty是用Java写的，那他咋通过Java代码申请堆外内存？这堆外内存空间又咋释放？这涉及Java NIO底层。

JVM性能优化相对较易，但若解决OOM，除一些弱智原因如有人在代码里不停创建对象。其他很多生产OOM问题，都很有技术难度！

## 3 堆外内存咋申请？

在Java代码里申请使用堆外内存，是用的DirectByteBuffer类，可通过它构建一个DirectByteBuffer对象，该对象本身是在JVM堆内存里。

但你构建该对象同时，就会在堆外内存划出一块内存空间跟这对象关联，看下图知关系：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/8966c653cf20f923dabb9fb87e5e6c7f.png)

## 4 咋释放堆外内存？

当你的DirectByteBuffer对象无人引用，成垃圾后，就会在某次YGC或Full GC被回收。

只要回收一个DirectByteBuffer对象，就会释放其关联的堆外内存：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/faacf83eae5298d2a30db500f3f4ee6e.png)

## 5 那为啥还会堆外内存溢出？

若你创建很多DirectByteBuffer对象，占大量堆外内存，然后这些DirectByteBuffer对象还无GC线程来回收，就不会释放！

当堆外内存都被大量DirectByteBuffer对象关联使用，若你再要使用额外堆外内存，就会内存溢出！

啥时会出现大量DirectByteBuffer对象一直存活，导致大量堆外内存无法释放？可能是数据网关系统高并发，创建了过多DirectByteBuffer，占用大量堆外内存，此时再继续想用堆外内存，就会OOM！但该系统显然不是这种情况。

## 6 堆外内存溢出原因实情！

jstat观察线上系统运行情况，同时根据日志看看一些请求处理耗时，分析过往gc日志，看系统各接口调用耗时后，分析思路如下。

### 6.1 先看接口调用耗时

系统并发量不高，但每个请求处理较耗时，平均每个请求需1s。

### 6.2 jstat

发现，随系统不停被调用，会一直创建各种对象，包括Jetty本身不停创建DirectByteBuffer对象去申请堆外内存空间，直到Eden满，就触发YGC：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/92b8eb2122dedd775ca2c451862d5c50.png)

但往往GC一瞬间，可能有的请求还没处理完，此时就有不少DirectByteBuffer对象处于存活状态，还没被回收，当然之前不少DirectByteBuffer对象对应的请求可能处理完毕了，他们可被回收。

此时肯定有些DirectByteBuffer对象以及一些其他的对象处存活状态，就需转入Survivor区。记得该系统上线时，内存分配极不合理，年轻代就一两百M，老年代却七八百M，导致年轻代Survivor只有10M。因此往往YGC后，一些存活对象（包括一些DirectByteBuffer）超过10M，无法放入Survivor，直接进入Old：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/ac98e407c5988270d264ab533a2b2d56.png)﻿

于是反复的执行这样的过程，导致一些DirectByteBuffer对象慢慢进入Old，Old的DirectByteBuffer 对象越来越多，而且这些DirectByteBuffer都关联很多堆外内存：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/e5b8b3c43586ee67d0bf9c966a72a3f9.png)

这些老年代里的DirectByteBuffer其实很多都是可回收状态，但因老年代一直没塞满，所以没触发full gc，自然就不回收老年代的这些DirectByteBuffer！当然老年代里这些没被回收的DirectByteBuffer就一直关联占据了大量的堆外内存空间了！

直到最后，当你要继续使用堆外内存时，所有堆外内存都被老年代里大量的DirectByteBuffer给占用了，虽然他们可以被回收，但是无奈因为始终没有触发老年代的full gc，所以堆外内存也始终无法被回收掉。最后导致OOM！

## 7 这Java NIO咋这么沙雕？

Java NIO没考虑过会发生这种事吗？

考虑了！他知道可能很多DirectByteBuffer对象也许没人用，但因未触发gc就导致他们一直占据堆外内存。Java NIO对此应对处理：每次分配新的堆外内存时，都调用System.gc()，提醒JVM主动执行一次GC，去回收一些没人引用的DirectByteBuffer对象垃圾，及时释放堆外内存空间，自然就可分配更多对象到堆外内存。但因为我们又在JVM设置：

```bash
-XX:+DisableExplicitGC
```

导致这System.gc()不生效，因此导致OOM。

## 8 终极优化

项目有如下问题：

- 内存设置不合理，导致DirectByteBuffer对象一直慢慢进入老年代，堆外内存一直无法释放
- 设置-XX:+DisableExplicitGC，导致Java NIO无法主动提醒去回收掉一些垃圾DirectByteBuffer对象，也导致了无法释放堆外内存

### 解决方案

- 合理分配内存，给年轻代更多内存，让Survivor区域有更大的空间
- 放开-XX:+DisableExplicitGC限制，让System.gc()生效

优化后，DirectByteBuffer一般就不会不断进入老年代了。只要他停留在年轻代，随着young gc就会正常回收释放堆外内存了。

只要放开-XX:+DisableExplicitGC限制，Java NIO发现堆外内存不足了，自然会通过System.gc()提醒JVM去主动垃圾回收，回收掉一些DirectByteBuffer，进而释放堆外内存。