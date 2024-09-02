# Netty堆外内存泄露排查

## 0 导读

Netty 是一个异步事件驱动的网络通信层框架，用于快速开发高可用高性能的服务端网络框架与客户端程序，简化 TCP 和 UDP 套接字服务器等网络编程。

Netty 底层基于 JDK 的 NIO，为啥不直接基于 JDK 的 NIO 或其他NIO框架：

- JDK  NIO 需了解太多概念，编程复杂
- Netty 底层 IO 模型随意切换，只需微改
- Netty自带拆包解包，异常检测等机制，让我们从 NIO 细节解脱，专注业务逻辑
- Netty解决JDK 很多包括空轮询在内Bug
- Netty底层对线程，Selector 做了很多小优化，精心设计 Reactor 线程可非常高效的并发处理
- 自带各种协议栈，处理任何一种通用协议都无需亲手
- Netty社区活跃，有问题随时邮件列表或issue
- Netty经各大RPC框架（Dubbo），消息中间件（RocketMQ），大数据通信（Hadoop）框架验证，健壮性毋庸置疑

## 1 背景

做基于 Websocket 的长连中间件，服务端使用实现了 Socket.IO 协议（基于WebSocket协议，提供长轮询降级能力） 的 [netty-socketio](https://github.com/mrniko/netty-socketio/) 框架，该框架为 Netty 实现，对比同样实现了 Socket.IO 协议的其他框架，Netty 的口碑都要更好，因此选这框架作为底层核心。

任何开源框架避免不了Bug，使用这开源框架时，就遇到一个堆外内存泄露Bug。

## 2 告警

某早突然收到告警，Nginx 服务端出现大量5xx：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/f1259545.png)

使用 Nginx 作为服务端 WebSocket 的七层负载，5xx通常表明服务端不可用。由于目前 Nginx 告警没有细分具体哪台机器不可用，接下来，就到 [CAT](https://tech.meituan.com/CAT_in_Depth_Java_Application_Monitoring.html) 检查整个集群的各项指标，发现两个异常：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/8c61b54b.png)

某台机器在同一时间点爆发GC，且在同一时间，JVM 线程阻塞：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/087dbf85.png)

## 3 排查过程

### 阶段1：怀疑log4j2

因为线程被大量阻塞，先想到定位哪些线程被阻塞，最后查出来是 Log4j2 狂打日志导致 Netty  NIO 线程阻塞（由于没及时保留现场，截图缺失）。

NIO 线程阻塞后，因服务器无法处理客户端请求，所以对Nginx来说就是5xx。

接下来，查看 Log4j2 配置文件：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/7bde54e9.png)

打印到控制台的这个 appender 忘记注释，初步猜测：因为项目打印日志过多，而 Log4j2 打印到控制台是同步阻塞打印，所以导致这问题。

接下来，把线上所有机器这行注释，以为“大功告成”，但没想到仅几天，5xx告警又来。看来，问题没想象那么简单。

### 阶段2：可疑日志浮现

查日志，特别是故障发生点前后的日志，又发现可疑地方：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/b98f7025.png)

极短时间内，狂打 `failed to allocate 64(bytes) of direct memory(...)`日志（瞬间十几个日志文件，每个日志文件几百M），日志里抛一个 Netty 自己封装的`OutOfDirectMemoryError`：堆外内存不够用，Netty 一直在“喊冤”。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/b7bf317ed0806740be7d3dade349ab19.png)

**堆外内存泄露**，这问题排查就像 C 语言内存泄露一样难，先想到，OOM 爆发前，有无异常。然后查遍 CAT 上与机器相关所有指标，查遍 OOM 日志之前的所有日志，均未发现任何异常！……

### 阶段3：定位OOM源

一筹莫展之际，突然一闪而过，OOM 下方几行日志变得耀眼（为啥之前就没想认真查看日志？估计是被堆外内存泄露吓怕了），这几行字是 `....PlatformDepedeng.incrementMemory()...`。

原来，堆外内存是否够用，是 Netty 自己统计，是否可找到统计代码，看 Netty 堆外内存统计逻辑？翻代码，找到这段 `PlatformDepedent` 类里

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/45a1dcb4d6c38084cba3d92c12e07da7.png)

已使用堆外内存计数的操作，计数器为 `DIRECT_MEMORY_COUNTER`，若发现已使用内存大于堆外内存的上限（用户自行指定），就抛出一个自定义 OOM Error，异常里面的文本内容正是我们在日志里面看到的。

验证这个方法是否在堆外内存分配时调用。

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/3455fb60.png)

Netty 每次分配堆外内存之前，都会计数。思路开始清晰。

### 阶段4：反射进行堆外内存监控

CAT上关于堆外内存的监控没有任何异常（应该是没有统计准确，一直维持在 1M），又确认堆外内存已快超过上限，并已知 Netty 底层用的哪个字段统计。

那接下来就是反射拿到这字段，然后自己统计 Netty 使用堆外内存的情况。

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/7d9c0164.png)

堆外内存统计字段是 `DIRECT_MEMORY_COUNTER`，反射拿到这字段，定期 Check 值，就可监控 Netty 堆外内存增长：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/3fdadcaf.png)

拿到字段，每隔一秒打印。

前面分析，爆发大量 OOM 现象前，没有任何可疑现象。那只有两种情况：

- 突然某瞬间分配大量堆外内存导致OOM
- 堆外内存缓慢增长，到达某点后，最后一根稻草将机器压垮

这段代码加上后，打包上线。

### 阶段5：缓慢增长 or 瞬间飙升？

代码上线后，初始内存 16384k（16M），因为线上使用池化堆外内存，默认一个 chunk 16M：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/655fce12.png)

没一会，内存开始缓慢飙升，且没有释放迹象，二十几min后内存使用：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/4a9d9bab.png)

猜测可能是第二种情况：内存缓慢增长造成OOM，由于内存实在增长太慢，于是调整机器负载权重为其他机器两倍，但仍以数K级别持续增长。过个周末再看，周一tail -f查看日志：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/4709776b.png)

不出所料，内存一直缓慢增长，一周末时间，堆外内存已飙到快1G。虽然堆外内存以几个K的速度在缓慢增长，但只要一直持续下去，总有把内存打爆的时候（线上堆外内存上限设置2G）。

内存为啥缓慢增长，伴随啥而增长？因为应用是面向用户端的WebSocket，会不会每次有用户进来，交互后离开，内存都会增长些，然后不释放？

### 阶段6：线下模拟

本地起好服务，把监控堆外内存的单位改为以B为单位（因为本地流量较小，打算一次一个客户端连接），另外，本地也使用非池化内存（内存数字较小，容易看出问题），在服务端启动之后，控制台打印信息：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/5a6fa180.png)

在没有客户端接入的时候，堆外内存一直是0，意料之中。打开浏览器，输入网址，开始模拟流程：

- 新建一个客户端链接
- 断开链接
- 再新建一个客户端链接
- 再断开链接

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/779d6ad4.png)

如上图，一次 Connect 和 Disconnect 为一次连接的建立与关闭，绿框日志分别是两次连接的生命周期。

内存每次都是在连接被关闭时暴涨 256B，然后不释放。问题进一步缩小，肯定是连接被关闭时，触发框架Bug，而且这Bug在触发之前分配了 256B 内存，随Bug被触发，内存也没释放。

开始“撸源码”！

### 阶段7：线下排查

将本地服务重启，开始线下排查。目光定位 netty-socketio 框架的 Disconnect 事件（客户端WebSocket连接关闭时会调用到这里），基本上可以确定，在 Disconnect 事件前后申请的内存没有释放。

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/7fe4b40b.png)

debug 时，要选择只挂起当前线程，这样单步跟踪时，控制台仍可看到堆外内存统计线程在打印日志。

客户端连接后然后关闭，断点进入 `onDisconnect` 回调，特意在此多停留一会，发现控制台内存并没有飙升（7B这个内存暂时没分析，只需知道，客户端连接断开后，我们断点hold住，内存还未开始涨）。接下来，神奇一幕出现，将断点放开，让程序跑完：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/2810f794.png)

Debug 松掉后，内存立马飙升！Debug 时，挂起的是当前线程，那么肯定是当前线程某个地方申请了堆外内存，然后没有释放，继续“快马加鞭“，深入源码。

每次单步调试，都会观察控制台的内存飙升情况。很快，来到这：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/7174003c.png)

这行没执行前，控制台内存依然263B。执行完该行，立刻从263B涨到519B（涨256B）：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/cf8136d5.png)

Bug 范围进一步缩小。将本次程序跑完，客户端再来一次连接，断点打在 `client.send()` ， 关闭客户端连接，之后直接进入这方法，随后过程长，因为与 Netty 的时间传播机制有关。

最后，跟踪到`handleWebsocket`：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/0a1219a7.png)

上图断点上一行，调用 `encoder` 分配一段内存，调完后，控制台立马彪256B。怀疑肯定是这里申请的内存没释放，它这里接下来调用 `encoder.encodePacket()` 方法，猜想把数据包内容以二进制写到这段256B的内存。

追踪到这段 encode 代码，单步执行后，定位到：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/ce93915f.png)

把 packet 里面一个字段值转换为一个 char。用 idea 预执行时，却抛NPE！即框架申请到一段内存之后，在 encoder GG，还给自己挖个NPE深坑，导致内存无法释放（最外层有堆外内存释放逻辑，现在无法执行到了）。而且越攒越多，直到被“最后一根稻草”压垮，堆外内存爆了。

### 阶段8：Bug解决

只需解决这NPE。让这个 `subType` 字段不为空。先通过 idea 的线程调用栈，定位到这 packet 在哪定义：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/eda50251.png)

debugger 面板盯 packet 对象，然后上线移动光标，便光速定位到。原来，定义 packet 对象这个地方在我们前面的代码其实已经出现过，查看 `subType` 字段，果然 null。接下来，解决 Bug 就很容易了。

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/827cbf63.png)

给这字段赋值即可，由于这里是连接关闭事件，所以给他指定名为 DISCONNECT 的字段（改天深入研究 Socket.IO 协议），反正这 Bug 是在连接关闭时触发，就粗暴了！

### 解决 Bug 过程

将框架源码下载本地，然后加上这行，最后重新 Build，pom 里改下名字，推送公司仓库。项目就可直接使用。

改完 Bug 后，去 GitHub找到引发这段 Bug  Commit：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/49c2505c.png)

为啥这位 `dzn` commiter 会写出这么一段如此明显的 Bug，时间就在今年3月30号，项目启动前夕！

### 阶段9：线下验证

进行本地验证，在服务起来之后，我们疯狂地建立连接，疯狂地断开连接，并观察堆外内存的情况：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/19665214.png)

Bingo！不管我们如何断开连接，堆外内存不涨了。至此，Bug Fix，最后把代码推到线上验证。

### 阶段10：线上验证

这次线上验证，避免了较土的打日志方法，把堆外内存这指标“喷射”到 CAT，再观察一段时间的堆外内存情况：

![](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2018b/eabe22b1.png)

过完一段时间，堆外内存已稳定不涨。

## 总结

遇到堆外内存泄露别怕，耐心分析，总能找到思路，多看日志，多分析。

若用 Netty 堆外内存，可自行监控堆外内存的使用情况，无需借助第三方工具，“反射”拿到堆外内存情况。

逐渐缩小范围，直到 Bug 被找到。当我们确认某个线程的执行带来 Bug 时，可单步执行，可二分执行，定位到某行代码之后，跟到这段代码，然后继续单步执行或者二分的方式来定位最终出 Bug 的代码。这个方法屡试不爽，最后总能找到想要的 Bug。

熟练掌握 idea 调试。最常见调试方式是预执行表达式和通过线程调用栈，死盯某个对象，就能够掌握这个对象的定义、赋值之类。