# 02-Redis的IO多路复用
## 了解 Redis 的 IO 多路复用吗？

我们都知道 Redis 性能是很高的，它的高性能是基于 **两个方面** ：

- 基于 **内存** 操作
- **IO 多路复用**

基于内存操作比较容易理解，将所有的操作都放在 **内存** 中进行处理即可，所以对于 Redis 来说，内存可能会成为 **性能的瓶颈**



### Redis 采用的 IO 多路复用模型

第二个方面就是 Redis 中所使用的 IO 模型：**IO 多路复用**

**IO 多路复用** 是一种 IO 模型，它的思想是：使用单个线程来处理多个客户端连接

**多路** 即同时监听多个客户端连接通道上的事件，**复用** 即使用单个线程处理多个客户端连接，复用同一个线程去处理请求，而不是重复创建线程

Redis 基于 **IO 多路复用** 的思想，实现了通过 **单个线程** 处理大量客户端请求的功能，Redis 中的 **IO 多路复用** 如下图：

![image-20240327102349198](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240327102349198.png)

当应用想要与 Redis 进行通信的话，就会和 Redis 建立 TCP 网络连接，客户端与服务端之间通信就是靠 Socket 来完成的，Socket 就是对底层操作系统进行网络通信封装的一组 **抽象接口**

那么 Redis 的 IO 多路复用指的就是在 Redis 的服务端，他会通过 **一个线程** 来处理 **多个 Socket** 中的事件，包括连接建立、读、写事件等，当有 Socket 发生了事件，就会将该 Socket 加入到 **任务队列** 中等待事件分发器来处理即可

这里的 **IO 多路复用** 的核心就是通过一个线程处理多个 Socket 上的事件，常见的 **IO 多路复用底层实现** 有：select、poll、epoll（这里就先略过底层的实现了，主要看整体的 IO 多路复用模型）





上边只解释了 IO 多路复用是什么，Redis 使用这个 IO 模型肯定是因为它快，因此要将 IO 多路复用和其他的一些IO 模型进行对比，才能知道它到底 **快在哪里**

常见的 IO 模型有：BIO、NIO、AIO 这三种 IO 模型：（这里主要说一下 BIO 和 NIO，AIO 还没有广泛使用，常用的 Netty 就是基于 NIO 的）

- **BIO** 

先说一下 **BIO** ：BIO 是同步阻塞式的：当客户端有连接发送到服务端时，服务端会为每一个客户端都创建一个线程来进行处理

那么它的 **问题** 有两个：

1、在并发量很大的情况下，服务端需要创建大量的线程来处理客户端请求，占用大量系统资源

2、一个线程监听一个 Socket，如果该 Socket 上没有事件的话，线程会一直阻塞等待，造成资源浪费

![BIO](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705479146307.png)

- **NIO**

那么 BIO 的缺点显而易见，需要 **创建大量线程** ，并且线程会阻塞等待

接下来说一下 NIO，它是基于 **IO 多路复用** 实现非阻塞的，主要有 3 个核心概念：Channel、Buffer、Selector

**Selector：** 就是 IO 多路复用中去监听多个 Socket 的线程

**Channel：** 就是和客户端之间建立连接的通道

**Buffer：** 在 NIO 中数据传输时依靠 Buffer 进行传输的，也就是数据会从 Channel 读取到 Buffer 缓冲区，再拿到 Buffer 中的数据进行处理

**那么 NIO 基于 IO 多路复用所带来的好处就是通过单线程就可以监听处理大量的客户端连接、请求事件，不需要创建大量线程，也不会阻塞很长时间，导致资源浪费**

![NIO](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1705479910470.png)





### 总结

因此 Redis 对于连接、读写事件的处理就是基于 **IO 多路复用** 来做的，这样通过单个线程来处理多个客户端连接中发生的事件，既节省系统资源，而且 **基于内存** 操作，处理起来速度是比较快的



**这里最后说一下 IO 多路复用、select、poll、epoll、Reactor 模式之间的关系：** IO 多路复用的底层实现有 select、poll、epoll，而 Reactor 模式是对 IO 多路复用的封装，更方便使用，Reactor 模式又分为了单 Reactor 单线程模型，单 Reactor 多线程模型、主从 Reactor 模型



> 扩展：Redis6.0 引入多线程

这里提一下 Redis6.0 引入的多线程（默认关闭）：目的是为了提高 **网络IO** 的处理性能

- Redis 的多线程只是用来处理网络请求

- 对于读写命令的执行，还是使用单线程进行处理，因此并不存在线程安全的问题

为什么要引入多线程呢，因为网络 IO 的处理是比较慢的，引入的多线程就是下图中的 IO 线程，主要对 Socket 中的请求事件解析，解析之后还是交给单线程进行命令的执行

![image-20240327125357628](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240327125357628.png)









