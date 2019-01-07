# 1 传统socket网络编程
## 1.1 实战
- 服务端：ServerBoot![](https://img-blog.csdnimg.cn/20201030213336474.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- Server
![](https://img-blog.csdnimg.cn/20201030213559990.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- ClientHandler
![](https://img-blog.csdnimg.cn/20201030213829559.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 客户端：Client![](https://img-blog.csdnimg.cn/20201031231247937.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- 先后启动 `ServerBoot`、`Client`，分别输出如下：
![](https://img-blog.csdnimg.cn/2020103021583498.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
![](https://img-blog.csdnimg.cn/20201030215847930.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)


## 1.2 传统HTTP服务器原理
1. 创建一个`ServerSocket`
2. 监听并绑定一个端口一系列客户端来请求这个端口服务器使用Accept，获得一个来自客户端的Socket连接对象
3. 启动一个新线程处理连接读Socket， 
    -  得到字节流解码协议
    -  得到Http请求对象处理Http请求
    -  得到一个结果
    -  封装成一个HttpResponse对象编码协议
    -  将结果序列化字节流写Socket，
    -  将字节流发给客户端
- 继续循环步骤3

## 1.3 C/S 交互流程
![](https://img-blog.csdnimg.cn/20201031235442892.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

# 2  Netty版socket网络编程
![](https://img-blog.csdnimg.cn/20201101002011137.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

下面分别介绍图中对应组件。

# 3 Netty核心组件
## 3.1 NioEventLoop
###  3.1.1 简介
#### EventLoop
- 其实一个 eventloop 就是一个 eventexecutor
![](https://img-blog.csdnimg.cn/20201101233439486.png#pic_center)

`NioEventLoopGroup` 是一个处理 I/O 操作的多线程事件循环。Netty 为不同类型传输提供各种 `EventLoopGroup` 实现。
在此示例中，我们实现服务器端应用程序，因此将使用两个 NioEventLoopGroup。第一个，通常称为'boss'，接受传入的连接。第二个（通常称为'工作人员'）在上司接受连接并登记到工作人员后处理接受连接的流量。使用多少线程以及如何映射到创建的通道取决于 EventLoopGroup 实现，甚至可能通过构造函数进行配置。

- Netty的发动机
![](https://img-blog.csdnimg.cn/20200806005304407.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- Server端
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTI3MDg2OTI0YjRkZjI5ZGUucG5n?x-oss-process=image/format,png)
- Client端![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWI0OTYyMjE5ZjNhZWFmOTkucG5n?x-oss-process=image/format,png)

>  `while(true)`就对应一个 run 方法

- NioEventLoop#run
![](https://img-blog.csdnimg.cn/20200806010144389.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200806010449923.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

netty有不同的io编程模型实现。
- 以NIO为例，对IO事件的处理是在NioEventLoop里做的，事件的注册在下面的方法
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTI4YTk2ZWVhZmQ3M2I2NWUucG5n?x-oss-process=image/format,png)
![](https://img-blog.csdnimg.cn/20200806010950284.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

不同事件调用unsafe的不同方法，netty对底层socket的操作都是通过unsafe来做的
unsafe主要由两种不同的实现：
1. NioMessageUnsafe
`NioServerSocketChannel`使用的是NioMessageUnsafe来做socket操作
2. NioByteUnsafe
`NioSocketChannel`使用NioByteUnsafe来做socket操作


- 处理每一个连接![](https://img-blog.csdnimg.cn/20200806012815139.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200806013038646.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200806013158967.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### EventExecutorGroup
`EventExecutorGroup` 负责经由其使用`next()`方法提供`EventExecutor`。 除此之外，还负责处理自己的生命周期，并允许在全局模式中关闭它们。

### EventExecutor
![](https://img-blog.csdnimg.cn/20201101220442372.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

该`EventExecutor`是个特殊的`EventExecutorGroup`，附带一些快捷方法，看是否有`Thread`在事件循环执行。 
除此之外，它还继承了`EventExecutorGroup`以允许通用的方法来访问。

### eventloopGroup
![](https://img-blog.csdnimg.cn/20201101221237486.png#pic_center)

特殊的 `EventExecutorGroup`，它允许注册 `Channel`，即事件循环期间可以执行 channel 操作，得到处理，供以后选用

## 3.2 Channel
![](https://img-blog.csdnimg.cn/20201101220136788.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQzYzE5NzRhZWI3ZDU3YjkucG5n?x-oss-process=image/format,png)
- 以服务端的NioMessageUnsafe为例来看下read()方法的实现,对应是否有新连接进来的情况
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWVjMmY5MTE4NjU2MTgzNjUucG5n?x-oss-process=image/format,png)
![AbstractNioMessageChannel#doReadMessages](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWUxMWNhMjliOTQ1OTEwMDgucG5n?x-oss-process=image/format,png)
![NioServerSocketChannel#doReadMessages](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTU4ZGRmNTgxMGZlMmIxZmQucG5n?x-oss-process=image/format,png)
直接把底层的 channel 封装成 NioSocketChannel
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTVkZDMyYTA2YzBmZWExMWIucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTFiN2M5ZjVmZDQ0YjhkMzIucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTIyNmIwNDk0YmMzOTNkYmIucG5n?x-oss-process=image/format,png)
## 3.3 ByteBuf 
![](https://img-blog.csdnimg.cn/20201101234831579.png#pic_center)
![](https://img-blog.csdnimg.cn/20201102220535322.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)



## 3.4 Pipeline
![](https://img-blog.csdnimg.cn/20201102230637949.png#pic_center)

![小样例中对应内容,实际非常复杂](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTViNzgxYTJhM2Q1ZTc3ZWEucG5n?x-oss-process=image/format,png)
netty 将其抽象成逻辑链,看看 netty 是怎么把每个 pipeline 加入到客户端连接的
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWNiNjc0YzllMDMyNDYzNDAucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWZhZTBjYzNjNDQzNjc1NTEucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTkwMGMzZTQyN2U0Mzc2ZTkucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTkxMmUxMWUyYTVkN2YzMjMucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWY5YzFjOTk5ZTJlYTk0ODEucG5n?x-oss-process=image/format,png)
## 3.5 ChannelHandler
![](https://img-blog.csdnimg.cn/20201102230752799.png#pic_center)

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTc4ZDFkNmVjYjQwOWE5ZTcucG5n?x-oss-process=image/format,png)