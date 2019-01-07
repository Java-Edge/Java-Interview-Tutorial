# 执行过程
## boss thread
- NioEventLoop 中的 selector轮询创建连接事件 (ОР_АССЕРT) 
- 创建 socket channel
- 初始化 socket channel 并从 worker group 中选择一个 NioEventLoop

## worker thread
- 将socket channel注册到选择的NioEventLoop的selector
- 注册读事件(OP_ READ)到selector 上

接收连接请求的处理本质是对 OP_ACCEPT 的处理，即在 NioEventLoop 中，因为注册到了NioEventLoop的 selector。
分别调试启动 EchoServer 和 EchoClient

- 跳至对应 handler![](https://img-blog.csdnimg.cn/20201223125406418.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- - 当前为 bosseventloop，不是 workereventloop
![](https://img-blog.csdnimg.cn/20201223125901394.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 所以这里 false，又来到注册![](https://img-blog.csdnimg.cn/20201223125950211.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201223130101591.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201223132439212.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 创建完连接后了，已经可以开始接收数据了，即准备读数据了
![](https://img-blog.csdnimg.cn/20201223133012149.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
最后观察下 server 的日志信息
![](https://img-blog.csdnimg.cn/20201223133321385.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 前5行都是服务启动，后面的就是为了创建连接
- 服务启动过程多了个 bind 过程，且只绑定了一个接口，而对于下面的创建连接过程它有两个端口：客户端端口+server 监听的端口，这就是 socketChannel

# 接收连接的核心代码

```java
// 阻塞轮询。非阻塞轮询。超时等待轮询
selector.select()/ selectNow()/select(timeoutMillis) 发现 OP_ACCEPT 事件,处理:
SocketChannel socketChannel = serverSocketChannel.accept()
selectionKey = javaChannel().register(eventLoop().unwrappedSelector(), 0, this);
selectionKey.interestOps(OP_READ);
```

创建连接的初始化和注册是通过`pipeline.fireChannelRead`在`ServerBootstrapAcceptor`中完成

第一次Register并非监听`OP_READ`，而是0

```java
selectionKey = javaChannel().register(eventLoop().unwrappedSelector(), 0, this)
```

最终监听`OP_READ`是通过"Register"完成后的`fireChannelActive`
(io.netty.channel.AbstractChannel.AbstractUnsafe#register0)触发

Worker's NioEventLoop是通过Register操作执行来启动。

接受连接的读操作，不会尝试读取更多次(16次)。
因为无法知道后续是否还有连接，不可能一直尝试。