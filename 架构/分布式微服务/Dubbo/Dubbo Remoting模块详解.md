> `文章收录在我的 GitHub 仓库，欢迎Star/fork：`
> [Java-Interview-Tutorial](https://github.com/Wasabi1234/Java-Interview-Tutorial)
> https://github.com/Wasabi1234/Java-Interview-Tutorial

dubbo-remoting 模块提供了多种客户端和服务端通信功能。

- 最底层部分即为 Remoting 层
![](https://img-blog.csdnimg.cn/20201014183014779.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

包括 Exchange、Transport和Serialize 三层。本文主要描述 Exchange 和 Transport 两层。

# Dubbo 整体架构设计图

- Dubbo直接集成已有的第三方网络库，如Netty、Mina、Grizzly 等 NIO 框架。
![](https://img-blog.csdnimg.cn/20201014183424412.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

dubbo-remoting-zookeeper使用 Apache Curator 实现了与 Zookeeper 的交互。

# dubbo-remoting-api 模块
是其他 `dubbo-remoting-*` 模块的顶层抽象，其他 dubbo-remoting 子模块都是依赖第三方 NIO 库实现 dubbo-remoting-api 模块。

- buffer 包
![](https://img-blog.csdnimg.cn/20201014191918676.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
定义了缓冲区相关的接口、抽象类以及实现类。在各个 NIO 框架中都有自己的缓冲区实现。但这里的 buffer 包在更高层面，抽象了各个 NIO 框架的缓冲区，同时也提供了一些基础实现。

- exchange 包
抽象了 Request 和 Response，并为其添加很多特性。这是整个远程调用核心部分。

- transport 包
抽象网络传输层，但只负责抽象单向消息传输，即请求消息由 Client 端发出，Server 端接收；响应消息由 Server 端发出，Client端接收。有很多网络库可以实现网络传输，如Netty， transport 包是在网络库上层的一层抽象。

# 传输层核心接口
“端点（Endpoint）”，可通过一个 `ip` 和 `port` 唯一确定一个端点，两端点间会创建 `TCP` 连接，双向传输数据。Dubbo 将 Endpoint 之间的 TCP 连接抽象为（Channel）通道，将发起请求的 Endpoint 抽象为Client，接收请求的 Endpoint 抽象为Server。

## Endpoint 接口
![](https://img-blog.csdnimg.cn/20201014212143943.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

- getXXX() 用于获得 Endpoint 本身的一些属性，如Endpoint 的本地地址、关联的 URL 信息以及底层 Channel 关联的 ChannelHandler。
- send() 负责数据发送
- close() 及 startClose() 用于关闭底层 Channel 
- isClosed() 方法用于检测底层 Channel 是否已关闭

# Channel
对 Endpoint 双方连接的抽象，就像传输管道。消息发送端往 Channel 写入消息，接收端从 Channel 读取消息。

- 接口的定义
继承 Endpoint 接口，也具备开关状态以及发送数据能力
可在 Channel 上附加 KV 属性
![](https://img-blog.csdnimg.cn/2020101421344765.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
# ChannelHandler
注册在 Channel 上的消息处理器，接口的定义
![](https://img-blog.csdnimg.cn/20201014213814331.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
`@SPI` 注解表明该接口是一个扩展点。

有一类特殊的 ChannelHandler 专门负责实现编解码功能，从而实现字节数据与有意义的消息之间的转换，或是消息之间的相互转换
![](https://img-blog.csdnimg.cn/20201014214221888.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

该接口也是一个扩展接口，encode()、decode() 被 @Adaptive 注解修饰，也就会生成适配器类，其中会根据 URL 中的 codec 值确定具体的扩展实现类。

DecodeResult 这个枚举是在处理 TCP 传输时粘包和拆包使用的，例如，当前能读取到的数据不足以构成一个消息时，就会使用 `NEED_MORE_INPUT` 枚举。

接下来看Client 和 RemotingServer 两个接口，分别抽象了客户端和服务端，两者都继承了 Channel、Resetable 等接口，也就是说两者都具备了读写数据能力。

# Client、RemotingServer 
都继承了 Endpoint，只是在语义上区分请求和响应职责，都具备发送数据能力。
![](https://img-blog.csdnimg.cn/2020101421540523.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
Client 和 Server 的主要区别：
- Client 只能关联一个 Channel
- Server 可接收多个 Client 发起的 Channel 连接，所以在 RemotingServer 接口中定义了查询 Channel 的相关方法
![](https://img-blog.csdnimg.cn/20201014215545409.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

# Transporter 
- Dubbo 在 Client 和 Server 之上又封装了一层Transporter 接口
![](https://img-blog.csdnimg.cn/202010142222445.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

 `@SPI` 注解扩展接口，默认使用“netty”扩展名
 `@Adaptive` 注解表示动态生成适配器类，会先后根据“server”“transporter”的值确定 `RemotingServer` 的扩展实现类，先后根据“client”“transporter”的值确定 Client 接口的扩展实现。

- 几乎对每个支持的 NIO 库，都有接口实现
![](https://img-blog.csdnimg.cn/20201014222623811.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

**为什么要单独抽象出 Transporter层，不直接让上层使用 Netty？**
正是利用了依赖反转原则（DIP)，Netty、Mina、Grizzly 等 NIO 库对外接口和使用方式不同，若在上层直接依赖 Netty 或Grizzly，就依赖了具体的 NIO 库，而非依赖一个有传输能力的抽象，后续要切换实现的话，就需修改依赖和接入的相关代码。

有了 Transporter 层，就可通过 Dubbo SPI 修改使用的具体 Transporter 扩展实现，从而切换到不同 Client 和 RemotingServer 实现，切换底层 NIO 库，而无须修改代码。即使有更先进的 NIO 库出现，也只需开发相应的 `dubbo-remoting-*` 实现模块提供 Transporter、Client、RemotingServer 等核心接口的实现，即可接入，完全符合开放封闭原则。

# Transporters
不是一个接口，而是门面类，封装了 Transporter 对象的创建（通过 Dubbo SPI）以及 ChannelHandler 的处理
```java
public class Transporters {
    private Transporters() {
    ...
    public static RemotingServer bind(URL url, 
            ChannelHandler... handlers) throws RemotingException {
        ChannelHandler handler;
        if (handlers.length == 1) {
            handler = handlers[0];
        } else {
            handler = new ChannelHandlerDispatcher(handlers);
        }
        return getTransporter().bind(url, handler);
    }
    public static Client connect(URL url, ChannelHandler... handlers)
           throws RemotingException {
        ChannelHandler handler;
        if (handlers == null || handlers.length == 0) {
            handler = new ChannelHandlerAdapter();
        } else if (handlers.length == 1) {
            handler = handlers[0];
        } else { // ChannelHandlerDispatcher
            handler = new ChannelHandlerDispatcher(handlers);
        }
        return getTransporter().connect(url, handler);
    }
    public static Transporter getTransporter() {
        // 自动生成Transporter适配器并加载
        return ExtensionLoader.getExtensionLoader(Transporter.class)
            .getAdaptiveExtension();
    }
}
```

在创建 Client 和 RemotingServer 的时候，可指定多个 ChannelHandler 绑定到 Channel 来处理其中传输的数据。Transporters.connect() 方法和 bind() 方法中，会将多个 ChannelHandler 封装成一个 ChannelHandlerDispatcher 对象。

ChannelHandlerDispatcher 也是 ChannelHandler 接口的实现类之一，维护了一个 CopyOnWriteArraySet 集合，它所有的 ChannelHandler 接口实现都会调用其中每个 ChannelHandler 元素的相应方法。另外，ChannelHandlerDispatcher 还提供了增删该 ChannelHandler 集合的相关方法。

- Endpoint 接口抽象了“端点”的概念，这是所有抽象接口的基础
- 上层使用方会通过 Transporters 门面类获取到 Transporter 的具体扩展实现，然后通过 Transporter 拿到相应的 Client 和 RemotingServer 实现，就可以建立（或接收）Channel 与远端进行交互
- 无论是 Client 还是 RemotingServer，都会使用 ChannelHandler 处理 Channel 中传输的数据，其中负责编解码的 ChannelHandler 被抽象出为 Codec2 接口。

- Transporter 层整体结构图
![](https://img-blog.csdnimg.cn/202010142239086.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)



参考
- https://dubbo.apache.org/en-us/docs/dev/design.html

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)