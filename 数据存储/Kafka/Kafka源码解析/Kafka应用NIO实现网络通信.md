# 网络通信层
## Kafka网络通信层架构
![](https://img-blog.csdnimg.cn/20201229230602921.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## Kafka网络通信组成
- SocketServer
核心，主要实现了Reactor模式，用于处理外部多个Clients（广义Clients，可能包含Producer、Consumer或其他Broker）的并发请求，并负责将处理结果封装进Response中，返还给Clients。
SocketServer是Kafka网络通信层中最重要的子模块。它的Acceptor线程、Processor线程和RequestChannel等对象，都是实施网络通信的重要组成部分。
- KafkaRequestHandlerPool
I/O线程池，里面定义了若干个I/O线程，用于执行真实的请求处理逻辑。KafkaRequestHandlerPool线程池定义了多个KafkaRequestHandler线程，而KafkaRequestHandler线程是真正处理请求逻辑的地方。

两者共通处在于**SocketServer**中定义的**RequestChannel**对象和**Processor**线程。
在代码中，线程本质都是Runnable类型，不管是Acceptor类、Processor还是KafkaRequestHandler类。

相较于KafkaRequestHandler，Acceptor和Processor最多算请求和响应的“搬运工”。

# SocketServer
![](https://img-blog.csdnimg.cn/2020123115490250.png)


- AbstractServerThread类
这是Acceptor线程和Processor线程的抽象基类

- Acceptor线程类
接收和创建外部TCP连接的线程。每个SocketServer实例只会创建一个Acceptor线程。
唯一作用创建连接，并将接收到的Request传递给下游的Processor线程。

- Processor线程类
每个SocketServer实例默认创建若干个（num.network.threads）Processor线程。
负责
	- 将接收到的Request添加到RequestChannel的Request队列
	- 将Response返还给Request发送方

- Processor伴生对象类
仅定义一些与Processor线程相关的常见监控指标和常量等，如Processor线程空闲率等。

- ConnectionQuotas类
![](https://img-blog.csdnimg.cn/20201231192108734.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- TooManyConnectionsException类
![](https://img-blog.csdnimg.cn/20201231192238748.png)
- SocketServer类
实现了对以上所有组件的管理和操作，如创建和关闭Acceptor、Processor线程。

- SocketServer伴生对象类
定义了一些有用的常量，同时明确了SocketServer组件中的哪些参数是允许动态修改的。

# Acceptor线程
经典Reactor模式的Dispatcher接收外部请求并分发给下面的实际处理线程。在Kafka中，这个Dispatcher就是Acceptor线程。
## 参数
### endPoint
定义的Kafka Broker连接信息，比如`PLAINTEXT://localhost:9092`
![](https://img-blog.csdnimg.cn/20201231194908451.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### sendBufferSize
![](https://img-blog.csdnimg.cn/20201231195324473.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### recvBufferSize
![](https://img-blog.csdnimg.cn/20201231201712160.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

> 如果在你的生产环境中，Clients与Broker的通信网络延迟很大（RTT>10ms），推荐增加控制缓冲区大小的两个参数：sendBufferSize和recvBufferSize，一般默认值100KB太小了。

Acceptor线程的自定义属性:
- nioSelector
Java NIO库的Selector对象实例，也是后续所有网络通信组件实现Java NIO机制的基础
- processors
网络Processor线程池。Acceptor线程在初始化时，需要创建对应的网络Processor线程池。Processor线程是在Acceptor线程中管理和维护的。

## Processor相关API

- addProcessors
![](https://img-blog.csdnimg.cn/20201231202809640.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201231202849510.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- removeProcessors
![](https://img-blog.csdnimg.cn/20201231231308453.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)于是Acceptor类就具备Processor线程池管理功能。

- Acceptor类的run方法 - 处理Reactor模式中分发
![](https://img-blog.csdnimg.cn/2020123123451718.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

Acceptor线程会先为每个入站请求确定要处理它的Processor线程

Acceptor线程使用Java NIO的Selector、SocketChannel循环轮询就绪的I/O事件（**SelectionKey.OP_ACCEPT**）。一旦接收到外部连接请求，Acceptor就指定一个Processor线程，并将该请求交由它，让它创建真正的网络连接。

# Processor线程
- 源码
![](https://img-blog.csdnimg.cn/20210101161912994.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 执行流程
![](https://img-blog.csdnimg.cn/20210101163400246.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 每个Processor线程在创建时都会创建3个队列：可能是阻塞队列，也可能是一个Map对象
### newConnections
![](https://img-blog.csdnimg.cn/20210101170139315.png)
每当Processor线程接收新连接请求，都会将对应SocketChannel放入该队列。
之后调用configureNewConnections创建连接时，就从该队列中取出SocketChannel，然后注册新连接。

### inflightResponses
- 临时Response队列
![](https://img-blog.csdnimg.cn/20210101170709799.png)
- 为何是临时？
有些Response回调逻辑要在Response被返回发送方后，才能执行，因此需要暂存临时队列。

### responseQueue
每个Processor线程都会维护自己的Response队列，
而非像网上的某些文章说Response队列是线程共享的或是保存在RequestChannel中的。Response队列里面保存着需要被返还给发送方的所有Response对象。

## 工作逻辑
### configureNewConnections
- 负责处理新连接请求，注意每个Processor线程都维护着一个Selector类实例。
![](https://img-blog.csdnimg.cn/20210101171544153.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### processNewResponses
- 负责发送Response给Request发送方，并且将Response放入临时Response队列
![](https://img-blog.csdnimg.cn/20210101172805472.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### poll
![](https://img-blog.csdnimg.cn/20210101173612684.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


### processCompletedReceives
- 接收和处理Request
![](https://img-blog.csdnimg.cn/20210101174009918.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### processCompletedSends
![](https://img-blog.csdnimg.cn/20210101174550842.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### processDisconnected
![](https://img-blog.csdnimg.cn/20210101180227522.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### closeExcessConnections
- 关闭超限连接
![](https://img-blog.csdnimg.cn/20210101180511772.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)