> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

# 1 单线程模型设计
![](https://img-blog.csdnimg.cn/20200901030321960.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
## 单线程模型为何效率高
- 纯内存操作
- 基于非阻塞的IO多路复用机制
- 避免了多线程的频繁上下文切换
# 2 文件事件处理器
Redis 基于 Reactor 模式开发了自己的网络事件处理器 - 文件事件处理器（file event handler，后文简称为 `FEH`），而该处理器又是单线程的，所以redis设计为单线程模型。
- 采用**I/O多路复用**同时监听多个socket，根据socket当前执行的事件来为 socket 选择对应的事件处理器。
- 当被监听的socket准备好执行`accept`、`read`、`write`、`close`等操作时，和操作对应的文件事件就会产生，这时FEH就会调用socket之前关联好的事件处理器来处理对应事件。

所以虽然FEH是单线程运行，但通过I/O多路复用监听多个socket，不仅实现高性能的网络通信模型，又能和 Redis 服务器中其它同样单线程运行的模块交互，保证了Redis内部单线程模型的简洁设计。

- 下面讲讲文件事件处理器的几个组成部分。
![](https://img-blog.csdnimg.cn/20200901160813736.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
##  2.1 socket
文件事件就是对socket操作的抽象， 每当一个 socket 准备好执行连接accept、read、write、close等操作时， 就会产生一个文件事件。 一个服务器通常会连接多个socket， 多个socket可能并发产生不同操作，每个操作对应不同文件事件。
##  2.2 I/O多路复用程序
I/O 多路复用程序会负责监听多个socket。


尽管文件事件可能并发出现， 但 I/O 多路复用程序会将所有产生事件的socket放入队列， 通过该队列以有序、同步且每次一个socket的方式向文件事件分派器传送socket。
当上一个socket产生的事件被对应事件处理器执行完后， I/O 多路复用程序才会向文件事件分派器传送下个socket， 如下：
![](https://img-blog.csdnimg.cn/20200901161358251.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
### I/O多路复用程序的实现
Redis 的 I/O 多路复用程序的所有功能都是通过包装常见的 select 、 epoll 、 evport 和 kqueue 这些 I/O 多路复用函数库实现的。
每个 I/O 多路复用函数库在 Redis 源码中都对应一个单独的文件：
![](https://img-blog.csdnimg.cn/20200901165112600.png#pic_center)


因为 Redis 为每个 I/O 多路复用函数库都实现了相同的 API ， 所以 I/O 多路复用程序的底层实现是可以互换的。Redis 在 I/O 多路复用程序的实现源码`ae.c`文件中宏定义了相应规则，使得程序在编译时自动选择系统中性能最高的 I/O 多路复用函数库作为 Redis 的 I/O 多路复用程序的底层实现：性能降序排列。
![](https://img-blog.csdnimg.cn/2020090117061454.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

##  2.3 文件事件分派器
文件事件分派器接收 I/O 多路复用程序传来的socket， 并根据socket产生的事件类型， 调用相应的事件处理器。
##   2.4 文件事件处理器
服务器会为执行不同任务的套接字关联不同的事件处理器， 这些处理器是一个个函数， 它们定义了某个事件发生时， 服务器应该执行的动作。

### 处理器映射
Redis 为各种文件事件需求编写了多个处理器，若客户端：
- 连接Redis，对连接服务器的各个客户端进行应答，就需要将socket映射到**连接应答处理器**
- 写数据到Redis，接收客户端传来的命令请求，就需要映射到**命令请求处理器**
- 从Redis读数据，向客户端返回命令的执行结果，就需要映射到**命令回复处理器**

当主服务器和从服务器进行复制操作时， 主从服务器都需要映射到特别为复制功能编写的复制处理器。
## 2.5 文件事件的类型
I/O 多路复用程序可以监听多个socket的 `ae.h/AE_READABLE` 事件和 `ae.h/AE_WRITABLE` 事件， 这两类事件和套接字操作之间的对应关系如下：

- 当socket可读（比如客户端对Redis执行`write`/`close`操作），或有新的可应答的socket出现时（即客户端对Redis执行`connect`操作），socket就会产生一个`AE_READABLE`事件
![](https://img-blog.csdnimg.cn/20200901163905592.png#pic_center)
- 当socket可写时（比如客户端对Redis执行read操作），socket会产生一个AE_WRITABLE事件。
![](https://img-blog.csdnimg.cn/20200901164103757.png#pic_center)

I/O多路复用程序可以同时监听`AE_REABLE`和`AE_WRITABLE`两种事件，要是一个socket同时产生这两种事件，那么文件事件分派器优先处理`AE_REABLE`事件。即一个socket又可读又可写时， Redis服务器先读后写socket。


# 3 总结
最后，让我们梳理一下客户端和Redis服务器通信的整个过程：
![](https://img-blog.csdnimg.cn/20200901190856764.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

0. Redis启动初始化时，将**连接应答处理器**跟**AE_READABLE**事件关联。
1. 若一个客户端发起连接，会产生一个`AE_READABLE`事件，然后由**连接应答处理器**负责和客户端建立连接，创建客户端对应的socket，同时将这个socket的`AE_READABLE`事件和**命令请求处理器**关联，使得客户端可以向主服务器发送命令请求。
2. 当客户端向Redis发请求时（不管读还是写请求），客户端socket都会产生一个`AE_READABLE`事件，触发命令请求处理器。处理器读取客户端的命令内容， 然后传给相关程序执行。
3. 当Redis服务器准备好给客户端的响应数据后，会将socket的`AE_WRITABLE`事件和`命令回复处理器`关联，当客户端准备好读取响应数据时，会在socket产生一个`AE_WRITABLE`事件，由对应命令回复处理器处理，即将准备好的响应数据写入socket，供客户端读取。
4. 命令回复处理器全部写完到 socket 后，就会删除该socket的`AE_WRITABLE`事件和命令回复处理器的映射。

参考
- 《Redis 设计与实现》

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)