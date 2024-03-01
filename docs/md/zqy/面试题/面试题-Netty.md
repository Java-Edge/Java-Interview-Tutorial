---
typora-copy-images-to: imgs
---

# Netty 面试题

# 作者

- 【11来了】：目前在读研究生，现处于研二，现在计划更新常用中间件系统性学习内容，2024年初会进行暑期实习面试，到时候会在公众号分享面试分析！

- 微信公众号

  - 在我后台回复 「资料」 可领取`编程高频电子书`！
  - 在我后台回复「面试」可领取`硬核面试笔记`！


  - [pdf 学习导航](https://blog.csdn.net/qq_45260619/article/details/135672159)

![1705899628218](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705899628218.png)

- CSDN：https://blog.csdn.net/qq_45260619



# Netty

## Netty 是什么呢？Netty 用于做什么呢？

答：

Netty 是一个 NIO 客户服务端框架，可以`快速开发网络应用程序`，如协议服务端和客户端，极大简化了网络编程，如 TCP 和 UDP 套接字服务（来自官网） 

热门开源项目如 Dubbo、RocketMQ 底层都是用了 Netty



## Netty 架构原理图

问到 Netty 了，那么 NIO、BIO、AIO 肯定是要了解的，由于面试突击里之前已经写过这块的内容了，这里就不重复说了

下边说一下 Netty 的架构原理图，从整体架构学习：

**Netty 处理流程：** 

1、BossGroup 和 WorkerGroup 都是线程组，BossGroup 负责接收客户端发送来的连接请求，NioEventLoop 是真正工作的线程，用来响应客户端的 accept 事件

2、当接收到连接建立 Accept 事件，获取到对应的 SocketChannel，封装成 NIOSocketChannel，并注册到 Worker 线程池中的某个 NioEventLoop 线程的 selector 中

3、当 Worker 线程监听到 selector 中发生自己感兴趣的事件后，就由 handler 进行处理

![1705751652234](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705751652234.png)



## Netty怎么实现高性能设计？

答：

那么 Netty 作为高性能的网络 IO 框架，一定要了解 Netty 在哪些方面保证了高性能：

1. 传输：用什么样的通道将数据发送给对方，BIO、NIO 或者 AIO，IO 模型在很大程度上决定了框架的性能。`IO模型的选择`
   - Netty 使用 NIO 进行网络传输，可以提供非阻塞的 IO 操作，极大提升了性能
2. 协议：采用什么样的通信协议，HTTP 或者内部私有协议。协议的选择不同，性能模型也不同。相比于公有协议，内部私有协议的性能通常可以被设计的更优。`协议的选择`
   - Netty 支持丰富的网络协议，如 TCP、UDP、HTTP、HTTP/2、WebSocket 等，既保证了灵活性，又可以实现高性能
   - 并且 Netty 可以定制私有协议，避免传输不必要的数据，进一步提升性能
3. 线程模型：数据报如何读取？读取之后的编解码在哪个线程进行，编解码后的消息如何派发，Reactor 线程模型的不同，对性能的影响也非常大。`线程模型的选择`
   - Netty 使用主从 Reactor 多线程模型，进一步提升性能


## 介绍一下 AIO、BIO 和 NIO？

答：

面试中问到网络相关的内容，其中 BIO、NIO 的内容肯定是必问的，AIO 可以了解一下，一定要清楚 BIO 和 NIO 中通信的流程

我也画了两张图，可以记下这两张图

- **AIO：**

AIO 是异步非阻塞 IO，

从 Java.1.7 开始，Java 提供了 AIO（异步IO），Java 的 AIO 也被称为 “NIO.2”

Java AIO 采用`订阅-通知`模式，应用程序向操作系统注册 IO 监听，之后继续做自己的事情，当操作系统发生 IO 事件并且已经准备好数据时，主动通知应用程序，应用程序再进行相关处理

（Linux 平台没有这种异步 IO 技术，而是使用 epoll 对异步 IO 进行模拟）



- **BIO：**

BIO 即同步阻塞 IO，服务端实现模式为一个连接对应一个线程，即客户端有连接请求时服务器端就需要启动一个线程进行处理

`BIO简单工作流程：`

1. 服务器端启动一个 ServerSocket
2. 客户端启动 Socket 对服务器进行通信，默认情况下服务器端需要对每个客户端建立一个线程与之通讯
3. 客户端发出请求后, 先咨询服务器是否有线程响应，如果没有则会等待，或者被拒绝
4. 如果有响应，客户端线程会等待请求结束后，再继续执行

使用 BIO 通信的流程图如下：

![1705479146307](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705479146307.png)



`BIO存在问题：`

1. 当并发量较大时，需要创建大量线程来处理连接，比较占用系统资源
2. 连接建立之后，如果当前线程暂时没有数据可读，则线程会阻塞在 Read 操作上，造成线程资源浪费

- **NIO：**

从 Java1.4 开始，Java 提供了 NIO，NIO 即 “Non-blocking IO”（同步非阻塞IO）

NIO 的几个核心概念：

1. Channel、Buffer：BIO是基于字节流或者字符流的进行操作，而NIO 是基于`缓冲区`和`通道`进行操作的，数据总是从通道读取到缓冲区中，或者从缓冲区写入到通道中

2. Selector：选择器用于监听多个通道的事件（如，连接打开，数据到达），因此，单个线程可以监听多个数据通道，极大提升了单机的并发能力

   当 Channel 上的 IO 事件未到达时，线程会在 select 方法被挂起，让出 CPU 资源，直到监听到 Channel 有 IO 事件发生，才会进行相应的处理

- **NIO和BIO有什么区别？**

1. NIO是以`块`的方式处理数据，BIO是以`字节流或者字符流`的形式去处理数据。 
2. NIO是通过`缓存区和通道`的方式处理数据，BIO是通过`InputStream和OutputStream流`的方式处理数据。 
3. NIO的通道是双向的，BIO流的方向只能是单向的。
4. NIO采用的多路复用的同步非阻塞IO模型，BIO采用的是普通的同步阻塞IO模型。
5. NIO的效率比BIO要高，NIO适用于网络IO，BIO适用于文件IO。

**NIO如何实现了同步非阻塞？**

通过 Selector 和 Channel 来进行实现，一个线程使用一个 Selector 监听多个 Channel 上的 IO 事件，通过配置监听的通道Channel为非阻塞，那么当Channel上的IO事件还未到达时，线程会在select方法被挂起，让出CPU资源。直到监听到Channel有IO事件发生时，才会进行相应的响应和处理。



使用 NIO 通信的流程图如下：

![1705479910470](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705479910470.png)



## 介绍一下 Netty 使用的线程模型？

答：

Netty 主要基于 `主从 Reactor 多线程模型`，其中主从 Reactor 多线程模型将 Reactor 分为两部分：

- mainReactor：监听 Server Socket，用来处理网络 IO 连接建立操作，将建立的 SocketChannel 指定注册给 subReactor
- subReactor：和建立起来的 socket 做数据交互和业务处理操作

因为客户端的连接数量相对来说比较少，而数据的读和写会比较多一点，使用 mainReactor 只接受客户端连接，由其他线程 subReactor 负责读和写，将业务处理剥离出，让线程池来处理，降低了 Reactor 的性能开销

**主从 Reactor 多线程模型如下**

![1705752803480](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705752803480.png)



**扩展：单 Reactor 单线程模型、单 Reactor 多线程模型**

- `单 Reactor 单线程模型`

  通过 1 个线程负责客户端连接、网络数据的读写、业务处理

  `缓存 Redis 就是单 Reactor 单线程模型`

![1705752332831](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705752332831.png)

- `单 Reactor 多线程模型`

  通过 1 个线程负责客户端的连接、网络数据的读写，将业务处理剥离出去，通过线程池来进行处理

![1705752319907](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705752319907.png)

**三种 Reactor 模型的优缺点：**

- 单 Reactor 单线程模型是单线程进行业务处理，当负载过重时，处理速度将会变慢，影响系统性能，因此引出单 Reactor 多线程模型
- 单 Reactor 多线程模型时多个线程处理业务，业务处理速度上来了，但是单 Reactor 承担了所有时间的监听和响应，可能存在性能问题。当有数百万客户端进行连接或者服务端需要对客户端握手进行安全认证，认证本身非常消耗性能，因此出现了主从 Reactor 多线程模型
- 主从 Reactor 多线程模型中 1 个主 Reactor 只用来处理网络 IO 的连接建立操作，而对于接入认证、IP 黑白名单过滤、握手等操作由从 Reactor 进行处理，这样进一步提升性能，在主从 Reactor 多线程模型中，从 Reactor 有多个，可以与 CPU 个数相同







## TCP 粘包、拆包是什么？如何解决？

答：

TCP本身的机制决定了一定会有粘包、拆包，因为 TCP 传输协议时基于数据流传输的，而流化的数据没有界限，因此 TCP 作为传输层协议并不了解上层业务数据的具体含义，会根据 TCP 缓冲区的实际情况进行数据包的划分，所以业务上认为的一个完整的包，可能被 TCP 拆成多个包或者把多个小的包封装成一个大的包进行发送。



**产生原因：**

- 粘包：客户端发送的包的大小比socket的缓存小或者接收方读取socket缓存不及时，因此多个包一起发送了
- 拆包：客户端发送的包的大小比socket的缓存大或者发送的数据大于协议的MTU（最大传输单元）必须拆包，那么这个包就被拆分成了多个包进行发送

**解决方法：**

有三种方式：

- 通过指定分隔符来进行分割
- 通过指定固定长度来进行分割
- 上边两种方式灵活性不好，因此常用的是通过指定接收数据的长度来解决，也就是`LengthFieldBasedFrameDecoder()`这个类







## Netty 中常用组件?

答：

- `Channel`：Netty 网络操作抽象类，包括了基本的 IO 操作，如 bind、connect、read、write 等等
- `EventLoop`：主要是配合 Channel 处理 IO 操作，用来处理连接的生命周期中所发生的事件
- `ChannelFuture`：Netty 中的所有 IO 操作都是异步的，我们通过 ChannelFuture 的 addListener() 注册一个 ChannelFutureListener 监听事件，当操作执行完毕后，监听就会返回结果
- `ChannelHandler`：作为处理器，用于处理入站和出战的数据
- `ChannelHandlerContext`：用于包裹 ChannelHandler，维护了 pipeline 这个双向链表中的 pre 和 next 指针，这样可以方便的找到与其相邻的 ChannelHandler，并且过滤出一些符合执行条件的 ChannelHandler，Netty 的异步事件在 pipeline 中传播就是依靠 ChannelHandlerContext
- `ChannelPipeline`：每一个 Channel 都会分配一个 ChannelPipeline，pipeline 是一个双向链表的结构，Netty 中产生的 IO 异步事件都会在这个 pipeline 中传播







## Netty 如何发送消息？

答：

- 有两种发送消息的方式：
  - 直接写入 Channel，消息从 ChannelPipeline 的尾节点开始向前传播至头节点，代码 `channelHandlerContext.channel().write()` 
  - 使 write 事件从当前 ChannelHandler 开始沿着 pipeline 向前传播，代码`channelHandlerContext.write()`

**这里解释一下，上边发送消息为什么是向前传播：**

在 Netty 中，IO 异步事件基本上分为两类：inbound（入站） 事件、outbound（出站） 事件，那么入站事件是沿着 pipeline 的头结点一直向后传播，因此出站事件就是沿着 pipeline 的尾结点一直向前传播，而上边发送消息也就是出站事件，因此是沿着 pipeline `从后向前`进行传播 







## 直接内存比堆内存快在了哪里？

答：

首先直接内存（也称为 `堆外内存`）不是 Java 虚拟机中的内存，是直接向系统内存申请的空间，来源于 NIO，通过 Java 中的 DirectByteBuffer 来进行操作。

直接内存相比于堆内存，避免了数据的二次拷贝。

- 我们先来分析`不使用直接内存`的情况，我们发送数据需要将数据先写入 Socket 的缓冲区内，那么如果数据存储在 JVM 的堆内存中的话，会先将堆内存中的数据复制一份到直接内存中，再将直接内存中的数据写入到 Socket 缓冲区中，之后进行数据的发送 

  - **`为什么不能直接将 JVM 堆内存中的数据写入 Socket 缓冲区中呢？`**

    在 JVM 堆内存中有 GC 机制，GC 后可能会导致堆内存中数据位置发生变化，那么如果直接将 JVM 堆内存中的数据写入 Socket 缓冲区中，如果写入过程中发生 GC，导致我们需要写入的数据位置发生变化，就会将错误的数据写入 Socket 缓冲区

- 那么如果使用直接内存的时候，我们将`数据直接存放在直接内存中`，在堆内存中只存放了对直接内存中数据的引用，这样在发送数据时，直接将数据从直接内存取出，放入 Socket 缓冲区中即可，`减少了一次堆内存到直接内存的拷贝`  

  ![1697978301568](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1697978301568.png)









## 什么是 Netty 的零拷贝？什么是 TCP 缓冲区？

答：

Netty 通过零拷贝技术减少数据复制次数，提升性能！

Netty 的零拷贝主要在以下三个方面：

- Netty 的接收和发送使用堆外内存（直接内存）进行 Socket 读写，不需要进行字节缓冲区的二次拷贝。 

- Netty 提供 CompositeByteBuf 组合缓冲区类，可以将多个 ByteBuf 合并为一个逻辑上的 ByteBufer，避免了各个 ByteBufer 之间的拷贝，将几个小 buffer 合并成一个大buffer的繁琐操作。

- Netty 的文件传输使用了 FileChannel 的 transferTo 方法，该方法底层使用了 `sendfile` 函数实现了 cpu 零拷贝。

  `sendfile` 函数通过网络发送数据的流程为：

  （3次拷贝、2次上下文切换，这里上下文切换是在用户空间发起write操作，此时用户态切换为内核态，write调用完毕后又会从内核态切换回用户态）

  ![1705758506116](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705758506116.png)

  下边画一个直观一些的图片，从 `应用程序的角度` 来看 Netty 的零拷贝：

  ![1705759216555](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705759216555.png)



**但是不能只了解零拷贝是怎样的，我们还要知道，不使用零拷贝时，传统 IO 是怎么传输数据的：**

- 传统的 IO 操作会有 4 次拷贝，4 次用户态和内核态之间的切换，因此性能是比较低的
- 这里说一下是 `哪 4 次内核态的切换`
  - 首先，应用程序去磁盘读取数据进行发送时，此时会从用户态切换到内核态，通过 DMA 拷贝将数据放到文件读取缓冲区中
  - 再从内核态切换到用户态，将文件读取缓冲区的数据通过 CPU 拷贝读取到应用进程缓冲区中
  - 再从用户态切换到内核态，将数据从应用进程缓冲区通过 CPU 拷贝放到 Socket 发送缓冲区中，之后的数据会从 Socket 发送缓冲区中通过 DMA 拷贝发送到网络设备缓冲区中
  - 操作完成之后，再从内核态切换到用户态

![1705758762211](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705758762211.png)





**什么是TCP 缓冲区？**

每个 TCP 的 Socket 的内核中都有一个发送缓冲区（SO_SNDBUF）和一个接收缓冲区（SO_RECVBUF）`（在通过 TCP 需要进行网络数据传输时，数据都是会写入 Socket 的缓冲区中的，之后再通过网络协议发送出去）` 









## 了解 Netty 中的 ByteBuf 类吗？

答：

在 Java NIO 编程中，Java 提供了 ByteBuffer 作为字节缓冲区类型（缓冲区可以理解为一段内存区域），来表示一个连续的字节序列。

Netty 中并没有使用 Java 的 ByteBuffer，而是使用了新的缓冲类型 ByteBuf，特性如下：

- 允许自定义缓冲类型

- 复合缓冲类型中内置的透明的零拷贝实现

- 开箱即用的动态缓冲类型，具有像 StringBuffer 一样的动态缓冲能力

- 不再需要调用 flip() 方法

  Java 的 ByteBuffer 类中，需要使用 flip() 来进行读写两种模式的切换

- 正常情况下具有比 ByteBuffer 更快的响应速度

**Java 中的 ByteBuffer：**

主要需要注意有 3 个属性：position、limit、capacity

- capacity：当前数组的容量大小
- position：写入模式的可写入数据的下标，读取模式的可读取数据下标
- limit：写入模式的可写入数组大小，读取模式的最多可以读取数据的下标

假如说数组容量是 10，那么三个值初始值为：

```
position = 0
limit = 10
capacity = 10
```

假如写入 4 个字节的数据，此时三个值如下：

```
position = 4
limit = 10
capacity = 10
```

如果切换到读取数据模式（使用 `flip()`），会改变上边的三个值，会从 position 的位置开始读取数据到 limit 的位置

```
position = 0
limit = 4
capacity = 10
```



**Netty 中的 ByteBuf：**

ByteBuf 主要使用两个指针来完成缓冲区的读写操作，分别是： `readIndex` 和 `writeIndex`

- 当写入数据时，writeIndex 会增加
- 当读取数据时，readIndex 会增加，但不会超过 writeIndex

ByteBuf 的使用：

```java
public static void main(String[] args) {
    ByteBuf buffer = Unpooled.buffer(10);
    System.out.println("----------初始化ByteBuf----------");
    printByteBuffer(buffer);

    System.out.println("----------ByteBuf写入数据----------");
    String str = "hello world!";
    buffer.writeBytes(str.getBytes());
    printByteBuffer(buffer);

    System.out.println("----------ByteBuf读取数据----------");
    while (buffer.isReadable()) {
        System.out.print((char)buffer.readByte());
    }
    System.out.println();
    printByteBuffer(buffer);


    System.out.println("----------ByteBuf释放无用空间----------");
    buffer.discardReadBytes();
    printByteBuffer(buffer);

    System.out.println("----------ByteBuf清空----------");
    buffer.clear();
    printByteBuffer(buffer);
}
private static void printByteBuffer(ByteBuf buffer) {
    System.out.println("readerIndex:" + buffer.readerIndex());
    System.out.println("writerIndex:" + buffer.writerIndex());
    System.out.println("capacity:" + buffer.capacity());
}
/**输出**/
----------初始化ByteBuf----------
readerIndex:0
writerIndex:0
capacity:10
----------ByteBuf写入数据----------
readerIndex:0
writerIndex:12
capacity:64
----------ByteBuf读取数据----------
hello world!
readerIndex:12
writerIndex:12
capacity:64
----------ByteBuf释放无用空间----------
readerIndex:0
writerIndex:0
capacity:64
----------ByteBuf清空----------
readerIndex:0
writerIndex:0
capacity:64
```



**ByteBuf 的 3 种使用模式：**

ByteBuf 共有 3 种使用模式：

- 堆缓冲区模式（Heap Buffer）

  堆缓冲区模式又称为 “支撑数据”，其数据存放在 JVM 的`堆空间`

  `优点：` 

  - 数据在 JVM 堆中存储，可以快速创建和释放，并且提供了数组直接快速访问的方法

  `缺点：` 

  - 每次数据与 IO 进行传输时，都需要将数据复制到直接缓冲区（这里为什么要将数据复制到直接缓冲区的原因在上边的 `直接内存比堆内存快在了哪里？` 问题中已经讲过） 

  `创建代码：` 

  ```java
  ByteBuf buffer = Unpooled.buffer(10);
  ```

- 直接缓冲区模式（Direct Buffer）

  直接缓冲区模式属于堆外分配的直接内存，不占用堆的容量

  `优点：` 

  - 使用 socket 传输数据时性能很好，避免了数据从 JVM 堆内存复制到直接缓冲区

  `缺点：`

  - 相比于堆缓冲区，直接缓冲区分配内存空间和释放更为昂贵

  `创建代码：`

  ```java
  ByteBuf buffer = Unpooled.directBuffer(10);
  ```

- 复合缓冲区模式（Composite Buffer）

  本质上类似于提供一个或多个 ByteBuf 的组合视图

  `优点：` 

  - 提供一种方式让使用者自由组合多个 ByteBuf，避免了复制和分配新的缓冲区

  `缺点：` 

  - 不支持访问其支撑数据，如果要访问，需要先将内容复制到堆内存，再进行访问

  `创建代码：`

  ```java
  public static void main(String[] args) {
  //        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(Test.class);
      // 创建一个堆缓冲区
      ByteBuf heapBuf = Unpooled.buffer(2);
      String str1 = "hi";
      heapBuf.writeBytes(str1.getBytes());
      // 创建一个直接缓冲区
      ByteBuf directBuf = Unpooled.directBuffer(5);
      String str2 = "nihao";
      directBuf.writeBytes(str2.getBytes());
      // 创建一个复合缓冲区
      CompositeByteBuf compositeByteBuf = Unpooled.compositeBuffer(10);
      compositeByteBuf.addComponents(heapBuf, directBuf);
      // 检查是否支持支撑数组，发现并不支持
      if (!compositeByteBuf.hasArray()) {
          for (ByteBuf buf : compositeByteBuf) {
              // 第一个字节偏移量
              int offset = buf.readerIndex();
              // 总共数据长度
              int length = buf.readableBytes();
              byte[] bytes = new byte[length];
              // 不支持访问支撑数组，需要将内容复制到堆内存中，即 bytes 数组中，才可以进行访问
              buf.getBytes(offset, bytes);
              printByteBuffer(bytes, offset, length);
          }
      }
  }
  
  private static void printByteBuffer(byte[] array, int offset, int length) {
      System.out.println("array:" + array);
      System.out.println("array->String:" + new String(array));
      System.out.println("offset:" + offset);
      System.out.println("len:" + length);
  }
  /**输出**/
  array:[B@4f8e5cde
  array->String:hi
  offset:0
  len:2
  array:[B@504bae78
  array->String:nihao
  offset:0
  len:5
  ```

  



## Netty 中 ByteBuf 如何分配？有池化的操作吗？

答：

ByteBuf 的分配接口定义在了 `ByteBufAllocator` 中，他的直接抽象类是 `AbstractByteBufAllocator`，而 `AbstractByteBufAllocator` 有两种实现：`PooledByteBufAllocator` 和 `UnpooledByteBufAllocator`

![1698045359020](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698045359020.png)

- PooledByteBufAllocator 提供了池化的操作，将 ByteBuf 实例放入池中，提升了性能，将内存碎片化减到了最小UnpooledByteBufAllocator。（这个实现采用了一种内存分配的高效策略，成为 jemalloc，已经被好几种现代操作系统所采用）
- UnpooledByteBufAllocator 在每次创建缓冲区时，都会返回一个新的 ByteBuf 实例，这些实例由 JVM 负责 gc 回收







## NioEventLoopGroup 默认启动了多少线程？

答：

NioEventLoopGroup 是一个多线程的事件循环器，默认启动了电脑可用线程数的两倍，在调用 NioEventLoopGroup 的构造方法之后，如果不传入线程数，最后启动的默认线程数的计算公式为：

![1698047197939](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1698047197939.png)













## Netty 如何解决 Selector 空轮询 Bug 的策略

答：

空轮询 Bug 也就是网络上发生了唤醒 Selector 的事件，但是 Selector 去取事件取不到，就一直去取，发生了空轮询，导致 CPU 使用率达到 100%



**Netty解决机制：**

判断如果发生了 N（默认是512次） 次空轮询，就新建一个Selector，把原来Selector事件都迁移过来









## 为什么没有使用 Netty 5？

答：

Netty版本分别是netty3.x、netty4.x、netty5.x
Netty5出现重大bug，已经被官网废弃，目前推荐使用Netty4.x稳定版本



> 了解 Netty 序列化吗？





> 如何设计一个内存池或者内存分配器？

答：

https://www.cnblogs.com/crazymakercircle/p/16181994.html



聊聊：如何设计一个Java对象池，减少GC和内存分配消耗
重要性：对对象池透彻理解，并且具备实操能力，也是编程高手的标志之一。

对象池顾名思义就是存放对象的池，与我们常听到的线程池、数据库连接池、http连接池等一样，都是典型的池化设计思想。

对象池的优点就是可以集中管理池中对象，减少频繁创建和销毁长期使用的对象，从而提升复用性，以节约资源的消耗，可以有效避免频繁为对象分配内存和释放堆中内存，进而减轻jvm垃圾收集器的负担，避免内存抖动。

Apache Common Pool2 是Apache提供的一个通用对象池技术实现，可以方便定制化自己需要的对象池，大名鼎鼎的 Redis 客户端 Jedis 内部连接池就是基于它来实现的。

说明：此题是一个实操性质的题目，后续尼恩带大家参考netty对象池，从0到1，架构、设计、实现一个高性能对象池组件

关于对象池的知识，请参见Netty内存池（史上最全 + 5W字长文）
————————————————
版权声明：本文为CSDN博主「40岁资深老架构师尼恩」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/crazymakercircle/article/details/124588880