# (08)-学习Netty BootStrap的核心知识，成为网络编程高手！

## 0 定义

深入 ChannelPipeline、ChannelHandler 和 EventLoop 后，如何将这些部分组织起来，成为可运行的应用程序？

引导（Bootstrapping）！引导一个应用程序是指对它进行配置，并使它运行起来的过程—尽管该过程的具体细节可能并不如它的定义那样简单，尤其是对于一个网络应用程序来说。

和它对应用程序体系架构的分层抽象一致，Netty处理引导的方式使你的【应用程序的逻辑或实现】和【网络层】相

隔离，而无论它是客户端还是服务器。所有的框架组件都将会在后台结合在一起并启用。引导是我们一直以来都在组装的完整拼图（Netty 的核心概念以及组件，也包括如何完整正确地组织并且运行一个 Netty 应用程序）中缺失的那一块。当你把它放到正确的位置上时，你的Netty应用程序就完整了。

## 1 Bootstrap 类

引导类的层次结构包括一个抽象父类和两个具体的引导子类：

![](https://img-blog.csdnimg.cn/151f4405e398448f9d368944bc34c46e.png)

相比于将具体的引导类分别看作用于服务器、客户端的引导，记住它们的本意是用来支撑不同的应用程序的功能的更有裨益，即：

- 服务器致力于使用一个父 Channel 接受来自客户端的连接，并创建子 Channel 用于它们之间的通信

- 而客户端将最可能只需要一个单独的、没有父 Channel 的 Channel 用于所有的网络交互

  正如同我们将看到的，这也适用于无连接的传输协议，如 UDP，因为它们并不是每个连接都需要一个单独的 Channel



客户端和服务器两种应用程序类型之间通用的引导步骤由 AbstractBootstrap 处理，而特定于客户端或服务器的引导步骤则分别由 Bootstrap 或 ServerBootstrap 处理。

接下来将详细地探讨这两个类，首先从不那么复杂的 Bootstrap 类开始。

### 1.1 为何引导类是 Cloneable

有时可能需要创建多个类似或完全相同配置的Channel。为支持这种模式而又无需为每个 Channel 都创建并配置一个新的引导类实例， AbstractBootstrap 被标记为 Cloneable。在一个已配置完成的引导类实例上调用clone()方法将返回另一个可立即使用的引导类实例。

这种方式只会创建引导类实例的EventLoopGroup的浅拷贝，所以，【被浅拷贝的 EventLoopGroup】将在所有克隆的Channel实例之间共享。这能接受，因为通常这些克隆的Channel的生命周期都很短暂，一个典型场景：创建一个Channel以进行一次HTTP请求。

AbstractBootstrap 类的完整声明：

```java
// 子类型 B 是其父类型的一个类型参数，因此可以返回到运行时实例的引用以支持方法的链式调用（流式语法）
public abstract class AbstractBootstrap<B extends AbstractBootstrap<B, C>, C extends Channel> implements Cloneable {
```

其子类的声明：

```java
public class Bootstrap extends AbstractBootstrap<Bootstrap, Channel> {
}

public class ServerBootstrap extends AbstractBootstrap<ServerBootstrap, ServerChannel> {
}
```

## 2 引导客户端和无连接协议

Bootstrap类被用于客户端或使用了无连接协议的应用程序。表8-1很多继承自AbstractBootstrap：

![表 8-1：Bootstrap类的API](https://img-blog.csdnimg.cn/e3b44090c4cf43c58edb9b51846470c3.png)

![](https://img-blog.csdnimg.cn/70ca22b684484949a52feddc2e7cdb11.png)

### 2.1 引导客户端

Bootstrap 类负责为客户端和使用无连接协议的应用程序创建 Channel，如图 8-2：

![图 8-2：引导过程](https://img-blog.csdnimg.cn/c5e35039b88340f7bf2459d3d70dc027.png)

代码清单 8-1 引导了一个使用 NIO TCP 传输的客户端。

```java
代码清单 8-1：引导一个客户端

EventLoopGroup group = new NioEventLoopGroup();
// 创建一个Bootstrap类的实例，以创建和连接新的客户端
Channel
Bootstrap bootstrap = new Bootstrap();

/**
 * 使用流式语法；这些方法（除了connect()方法）将通过每次方法调用所返回的对 Bootstrap 实例的引用
 * 链接在一起。
 */

// 设置 EventLoopGroup，提供用于处理 Channel 事件的 EventLoop
bootstrap.group(group)
  			 // 指定要使用的 Channel 实现
        .channel(NioSocketChannel.class)
  			 // 设置用于 Channel 事件和数据的ChannelInboundHandler
        .handler(new SimpleChannelInboundHandler<ByteBuf>() {
            @Override
            protected void channelRead0(
                    ChannelHandlerContext channelHandlerContext,
                    ByteBuf byteBuf) throws Exception {
                System.out.println("Received data");
            }
        });
// 连接到远程主机
ChannelFuture future = bootstrap.connect(new InetSocketAddress("www.JavaEdge.com", 80));
future.addListener(new ChannelFutureListener() {
    @Override
    public void operationComplete(ChannelFuture channelFuture) throws Exception {
        if (channelFuture.isSuccess()) {
            System.out.println("Connection established");
        } else {
            System.err.println("Connection attempt failed");
            channelFuture.cause().printStackTrace();
        }
    }
});
```

### 2.2 Channel 和 EventLoopGroup 的兼容性

代码清单 8-2 所示目录清单来自 io.netty.channel 包。从包名及类名前缀可见，对 NIO 及 OIO 传输，都有相关EventLoopGroup 和 Channel 实现。

相互兼容的 EventLoopGroup 和 Channel：

![](https://img-blog.csdnimg.cn/f9822c7e57a54a10a9af36d0f29b3324.png)

必须保持这种兼容性，不能混用具有不同前缀的组件，如 NioEventLoopGroup 和 OioSocketChannel。代码清单 8-3 展示了试图这样做的一个例子

```java
EventLoopGroup group = new NioEventLoopGroup();
// 创建一个新的 Bootstrap类的实例，以创建新的客户端Channel
Bootstrap bootstrap = new Bootstrap();
// 指定一个适用于 NIO 的 EventLoopGroup 实现
bootstrap.group(group)
  			 // 指定一个适用于OIO 的 Channel 实现类
        .channel(OioSocketChannel.class)
  			 // 设置一个用于处理 Channel的 I/O 事件和数据的ChannelInboundHandler
        .handler(new SimpleChannelInboundHandler<ByteBuf>() {
            @Override
            protected void channelRead0(ChannelHandlerContext channelHandlerContext, ByteBuf byteBuf)
                    throws Exception {
                System.out.println("Received data");
            }
        });
// 尝试连接到远程节点
ChannelFuture future = bootstrap.connect(new InetSocketAddress("www.JavaEdge.com", 80));
future.syncUninterruptibly();
```

这段代码将会导致 IllegalStateException，因为它混用了不兼容的传输

```bash
Exception in thread "main" java.lang.IllegalStateException: incompatible event loop type: io.netty.channel.nio.NioEventLoop
	at io.netty.channel.AbstractChannel$AbstractUnsafe.register(AbstractChannel.java:462)
```

#### IllegalStateException

引导的过程中，在调用 bind()或 connect()前，必须调用以下方法来设置所需的组件：

- group()
- channel()或者 channelFactory()
- handler()

若不这样做，将导致 IllegalStateException。对 handler()方法的调用尤其重要，因为它需要配置好 ChannelPipeline。

## 3 引导服务器

从 ServerBootstrap API 概要视图开始对服务器引导过程的概述。然后，探讨引导服务器过程中所涉及的几个步骤及几个相关的主题，包含从一个 ServerChannel 的子 Channel 中引导一个客户端这样的特殊情况。

### 3.1 ServerBootstrap 类

表 8-2 列出了 ServerBootstrap 类的方法：

![表8-2 ServerBootstrap类的方法](https://img-blog.csdnimg.cn/a098977176174ae0a271b6c41119dac4.png)

### 3.2 引导服务器

表 8-2 中列出一些表 8-1 不存在的方法：childHandler()、childAttr()和 childOption()。这些调用支持特别用于服务器应用程序的操作。

ServerChannel 的实现负责创建子 Channel，这些子 Channel 代表了已被接受的连接。因此，负责引导 ServerChannel 的 ServerBootstrap 提供了这些方法，以简化将设置应用到已被接受的子 Channel 的 ChannelConfig 的任务。

图 8-3 展示 ServerBootstrap 在 bind()方法被调用时创建了一个 ServerChannel，并且该 ServerChannel 管理了多个子 Channel。

![图 8-3：ServerBootstrap 和 ServerChannel](https://img-blog.csdnimg.cn/bafaecc93c284aec83721811a0c9005e.png)

代码8-4 实现图 8-3 中所展示的服务器的引导过程：

```java
package io.netty.example.cp8;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

import java.net.InetSocketAddress;

/**
 * 代码清单 8-4 引导服务器
 *
 * @author JavaEdge
 * @date 2023/5/20
 */
public class Demo84 {

    public static void main(String[] args) {
        NioEventLoopGroup group = new NioEventLoopGroup();
        // 创建 ServerBootstrap
        ServerBootstrap bootstrap = new ServerBootstrap();
        // 设置 EventLoopGroup，其提供了用于处理Channel 事件的EventLoop
        bootstrap.group(group)
                // 指定要使用的 Channel 实现
                .channel(NioServerSocketChannel.class)
                // 设置用于处理已被接受的子Channel的I/O及数据的 ChannelInboundHandler
                .childHandler(new SimpleChannelInboundHandler<ByteBuf>() {
                    @Override
                    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf byteBuf) throws Exception {
                        System.out.println("Received data");
                    }
                });
        // 通过配置好的ServerBootstrap的实例绑定该Channel
        ChannelFuture future = bootstrap.bind(new InetSocketAddress(8080));
        future.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture channelFuture) throws Exception {
                if (channelFuture.isSuccess()) {
                    System.out.println("Server bound");
                } else {
                    System.err.println("Bound attempt failed");
                    channelFuture.cause().printStackTrace();
                }
            }
        });
    }
}
```

## 4 从 Channel 引导客户端

服务器正在处理一个客户端请求，该请求需要它充当第三方系统的客户端。当一个应用程序（如一个代理服务器）必须要和现有的系统（如 Web 服务或数据库）集成时，就可能发生这种情况。此时，将需要从已被接受的子 Channel 中引导一个客户端 Channel。

可按 8.2.1 节中所描述的方式创建新的 Bootstrap 实例，但是这并不是最高效的解决方案，因为它要求你为每个新创建的客户端 Channel 定义另一个 EventLoop，会产生额外的线程，以及在已被接受的子 Channel 和客户端 Channel 之间交换数据时不可避免的上下文切换。

### 更好的解决方案

将已被接受的子 Channel 的 EventLoop 传递给 Bootstrap 的 group()方法来共享该 EventLoop。因为分配给 EventLoop 的所有 Channel 都使用同一线程，所以这避免了：

- 额外的线程创建
- 前面所提到的相关的上下文切换

该共享的解决方案图：

![图 8-4：在两个 Channel 之间共享 EventLoop](https://img-blog.csdnimg.cn/9508d23686264f31b1cb7bcc2d20e3f8.png)

实现 EventLoop 共享涉及通过调用 group()方法来设置 EventLoop，如代码8-5：

```java
package io.netty.example.cp8;

import io.netty.bootstrap.Bootstrap;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;

import java.net.InetSocketAddress;

/**
 * 代码清单 8-5 引导服务器
 *
 * @author JavaEdge
 * @date 2023/5/20
 */
public class Demo85 {

    public static void main(String[] args) {
        // 创建 ServerBootstrap 以创建ServerSocketChannel，并绑定它
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        // 设置 EventLoopGroup，其将提供用以处理 Channel 事件的 EventLoop
        serverBootstrap.group(new NioEventLoopGroup(), new NioEventLoopGroup())
                // 指定要使用的 Channel 实现
                .channel(NioServerSocketChannel.class)
                // 设置用于处理已被接受的 子 Channel 的 I/O 和数据的ChannelInboundHandler
                .childHandler(
                        new SimpleChannelInboundHandler<ByteBuf>() {
                            ChannelFuture connFuture;

                            @Override
                            public void channelActive(ChannelHandlerContext ctx) throws Exception {
                                // 创建一个 Bootstrap 类的实例以连接到远程主机
                                Bootstrap bootstrap = new Bootstrap();
                                // 指定 Channel 的实现
                                bootstrap.channel(NioSocketChannel.class)
                                        // 为入站 I/O 设置 ChannelInboundHandler
                                        .handler(
                                                new SimpleChannelInboundHandler<ByteBuf>() {
                                                    @Override
                                                    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf in) throws Exception {
                                                        System.out.println("Received data");
                                                    }
                                                });
                                // 使用与分配给已被接受的子Channel相同的EventLoop
                                bootstrap.group(ctx.channel().eventLoop());
                                // 连接到远程节点
                                connFuture = bootstrap.connect(new InetSocketAddress("www.manning.com", 80));
                            }

                            @Override
                            protected void channelRead0(ChannelHandlerContext channelHandlerContext, ByteBuf byteBuf) throws Exception {
                                if (connFuture.isDone()) {
                                    // 当连接完成时，执行一些数据操作（如代理）
                                    // do something with the data
                                    System.out.println();
                                }
                            }
                        });
        // 通过配置好的ServerBootstrap绑定该 ServerSocketChannel
        ChannelFuture future = serverBootstrap.bind(new InetSocketAddress(8080));
        future.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture channelFuture) throws Exception {
                if (channelFuture.isSuccess()) {
                    System.out.println("Server bound");
                } else {
                    System.err.println("Bind attempt failed");
                    channelFuture.cause().printStackTrace();
                }
            }
        });
    }
}
```

这一节中所讨论的主题以及所提出的解决方案都反映了编写 Netty 应用程序的一个一般准则：尽可能复用 EventLoop，以减少线程创建所带来的开销。

## 5 在引导过程中添加多个 ChannelHandler

在所有我们展示过的代码示例中，我们都在引导的过程中调用了 handler()或者 childHandler()方法添加单ChannelHandler。这对于简单的应用程序来说可能已经足够，但不能满足复杂需求。如一个必须要支持多种协议的应用程序将会有很多ChannelHandler，而不会是一个庞大而又笨重的类。

正如你经常所看到的一样，可根据需要，通过在 ChannelPipeline 中将它们链接在一起来部署尽可能多的 ChannelHandler。但若在引导的过程中你只能设置一个 ChannelHandler，你应该怎么实现这点？

正是针对于这个用例，Netty 提供了一个特殊的 ChannelInboundHandlerAdapter 子类

```java
@Sharable
public abstract class ChannelInitializer<C extends Channel> extends ChannelInboundHandlerAdapter {
```

它定义了下面的方法：

```java
/**
 * This method will be called once the {@link Channel} was registered. After the method returns this instance
 * will be removed from the {@link ChannelPipeline} of the {@link Channel}.
 *
 * @param ch            the {@link Channel} which was registered.
 * @throws Exception    is thrown if an error occurs. In that case it will be handled by
 *                      {@link #exceptionCaught(ChannelHandlerContext, Throwable)} which will by default close
 *                      the {@link Channel}.
 */
protected abstract void initChannel(C ch) throws Exception;
```

该方法提供将多个 ChannelHandler 添加到一个 ChannelPipeline 中的简便方法。只需向Bootstrap或ServerBootstrap实例提供你的 ChannelInitializer 实现即可，并且一旦 Channel 被注册到了它的 EventLoop 后，就会调用你的initChannel()版本。该方法返回后，ChannelInitializer 的实例将会从 ChannelPipeline 中移除它自己。

代码8-6 定义了ChannelInitializerImpl类，并通过ServerBootstrap#childHandler()注册它（注册到 ServerChannel 的子 Channel 的 ChannelPipeline）。这看似复杂的操作实际上简单直接。

```java
代码清单 8-6 引导和使用 ChannelInitializer、

package io.netty.example.cp8;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpClientCodec;
import io.netty.handler.codec.http.HttpObjectAggregator;

import java.net.InetSocketAddress;

/**
 * 代码清单 8-6 引导和使用 ChannelInitializer
 *
 * @author JavaEdge
 * @date 2023/5/20
 */
public class Demo86 {

    public static void main(String[] args) throws InterruptedException {
        // 创建 ServerBootstrap 以创建和绑定新的 Channel
        ServerBootstrap bootstrap = new ServerBootstrap();
        // 设置 EventLoopGroup，其将提供用以处理 Channel 事件的 EventLoop
        bootstrap.group(new NioEventLoopGroup(), new NioEventLoopGroup())
                // 指定 Channel 的实现
                .channel(NioServerSocketChannel.class)
                // 注册一个 ChannelInitializerImpl 的实例来设置 ChannelPipeline
                .childHandler(new ChannelInitializerImpl());
        // 绑定到地址
        ChannelFuture future = bootstrap.bind(new InetSocketAddress(8080));
        future.sync();
    }

    // 用以设置 ChannelPipeline 的自定义ChannelInitializerImpl 实现
    final class ChannelInitializerImpl extends ChannelInitializer<Channel> {
        @Override
        protected void initChannel(Channel ch) throws Exception {
            // 将所需的ChannelHandler添加到ChannelPipeline
            ChannelPipeline pipeline = ch.pipeline();
            pipeline.addLast(new HttpClientCodec());
            pipeline.addLast(new HttpObjectAggregator(Integer.MAX_VALUE));
        }
    }
}
```

大部分场景下，若你不需要使用只存在于SocketChannel上的方法，使用ChannelInitializer<Channel>即可，否则你可以使用ChannelInitializer<SocketChannel>，其中SocketChannel扩展了Channel。

如果你的应用程序使用了多个 ChannelHandler，请定义你自己的 ChannelInitializer 实现来将它们安装到 ChannelPipeline。

## 6 使用 Netty 的 ChannelOption 和属性

在每个 Channel 创建时都手动配置它可能相当乏味，完全可不必这样，你能使用 option() 将 ChannelOption 应用到引导。你给的值会被自动应用到引导所创建的**所有 Channel**。可用的 ChannelOption 包括底层连接的详细信息，如：

- keep-alive

```java
.childOption(ChannelOption.SO_KEEPALIVE, true)
```

- 或超时属性
- 缓冲区设置

Netty 应用程序通常与公司的专有软件集成，而 Channel 这样的组件可能甚至会在正常的 Netty 生命周期之外被使用。某些常用的属性和数据不可用时，Netty 提供AttributeMap抽象（由Channel和引导类提供的集合）及 AttributeKey<T>（一个用于插入和获取属性值的泛型类）。使用这些工具，便可安全将任何类型的数据项与客户端和服务器 Channel（包含 ServerChannel 的子 Channel）相关联。

如设计一个用于跟踪用户和 Channel 之间的关系的服务器应用程序。可将用户ID存储为 Channel 的一个属性来完成。类似技术可被用来：

- 基于用户的 ID 将消息路由给用户
- 或关闭活动较少的 Channel

代码8-7展示如何使用 ChannelOption 配置 Channel，以及如何使用属性存储整型值。

```java
package io.netty.example.cp8;

import io.netty.bootstrap.Bootstrap;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.http.HttpClientCodec;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.util.AttributeKey;

import java.net.InetSocketAddress;

/**
 * 代码清单 8-7 使用属性值
 *
 * @author JavaEdge
 * @date 2023/5/20
 */
public class Demo87 {

    public static void main(String[] args) throws InterruptedException {
        // 创建一个 AttributeKey 以标识该属性
        final AttributeKey<Integer> id = AttributeKey.newInstance("ID");
        // 创建一个 Bootstrap 类的实例以创建客户端 Channel 并连接它们
        Bootstrap bootstrap = new Bootstrap();
        // 设置 EventLoopGroup，其提供了用以处理 Channel 事件的 EventLoop
        bootstrap.group(new NioEventLoopGroup())
                // 指定Channel的实现
                .channel(NioSocketChannel.class)
                // 设置用以处理 Channel 的I/O 以及数据的 ChannelInboundHandler
                .handler(new SimpleChannelInboundHandler<ByteBuf>() {
                             @Override
                             public void channelRegistered(ChannelHandlerContext ctx) throws Exception {
                                 // 使用 AttributeKey 检索属性以及它的值
                                 Integer idValue = ctx.channel().attr(id).get();
                                 // do something with the idValue
                             }

                             @Override
                             protected void channelRead0(ChannelHandlerContext channelHandlerContext, ByteBuf byteBuf)
                                     throws Exception {
                                 System.out.println("Received data");
                             }
                         }
                );
        bootstrap.option(ChannelOption.SO_KEEPALIVE, true)
                // 设置 ChannelOption，其将在 connect()或者bind()方法被调用时被设置到已经创建的Channel 上
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000);
        // 存储该 id 属性
        bootstrap.attr(id, 123456);
        // 使用配置好的 Bootstrap实例连接到远程主机
        ChannelFuture future = bootstrap.connect(new InetSocketAddress("www.manning.com", 80));
        future.syncUninterruptibly();
    }
}
```

## 7 引导 DatagramChannel

之前都是基于 TCP 的 SocketChannel，但 Bootstrap 类也能被用于无连接的协议。为此，Netty 提供各种 DatagramChannel 实现。唯一区别：不再调用 connect()，只调用 bind()，如代码8-8：

```java
package io.netty.example.cp8;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.oio.OioEventLoopGroup;
import io.netty.channel.socket.DatagramPacket;
import io.netty.channel.socket.oio.OioDatagramChannel;

import java.net.InetSocketAddress;

/**
 * 代码清单 8-8 使用属性值
 *
 * @author JavaEdge
 * @date 2023/5/20
 */
public class Demo88 {

    public static void main(String[] args) throws InterruptedException {
        // 创建一个 Bootstrap 的实例以创建和绑定新的数据报 Channel
        Bootstrap bootstrap = new Bootstrap();
        // 设置 EventLoopGroup，其提供了用以处理 Channel 事件的 EventLoop
        bootstrap.group(new OioEventLoopGroup())
                // 指定Channel的实现
                .channel(OioDatagramChannel.class)
                // 设置用以处理 Channel 的I/O 以及数据的 ChannelInboundHandler
                .handler(
                        new SimpleChannelInboundHandler<DatagramPacket>() {
                            @Override
                            public void channelRead0(ChannelHandlerContext ctx, DatagramPacket msg) throws Exception {
                                // Do something with the packet
                            }
                        }
                );
        // 调用 bind()方法，因为该协议是无连接的
        ChannelFuture future = bootstrap.bind(new InetSocketAddress(0));
        future.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture channelFuture) throws Exception {
                if (channelFuture.isSuccess()) {
                    System.out.println("Channel bound");
                } else {
                    System.err.println("Bind attempt failed");
                    channelFuture.cause().printStackTrace();
                }
            }
        });
    }
}
```

## 8 关闭

引导使你的应用程序启动并且运行起来，但迟早你都要优雅将其关闭。当然，你也能让 JVM 在退出时处理好一切，但这不符合优雅的定义，优雅指干净地释放资源。关闭 Netty 应用程序无需太多魔法，但还是有些事需要关注。

最重要的，你要关闭 EventLoopGroup，它将处理任何挂起的事件和任务，并且随后释放所有活动的线程。这就是EventLoopGroup.shutdownGracefully()的作用。该方法调用返回一个 Future，这Future将在关闭完成时接收到通知。shutdownGracefully()也是异步操作，所以你需要：

- 阻塞等待直到它完成
- 或向所返回的 Future 注册一个监听器以在关闭完成时获得通知

代码清单 8-9 符合优雅关闭的定义：

```java
代码清单 8-9 优雅关闭

package io.netty.example.cp8;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.util.concurrent.Future;

/**
 * 代码清单 8-9 优雅关闭
 *
 * @author JavaEdge
 * @date 2023/5/20
 */
public class Demo89 {

    public static void main(String[] args) throws InterruptedException {
        // 创建处理 I/O 的EventLoopGroup
        EventLoopGroup group = new NioEventLoopGroup();
        // 创建一个 Bootstrap类的实例并配置它
        Bootstrap bootstrap = new Bootstrap();
        bootstrap.group(group)
                .channel(NioSocketChannel.class);
        // ...
        // shutdownGracefully()方法将释放所有的资源，并且关闭所有的当前正在使用中的 Channel
        Future<?> future = group.shutdownGracefully();
        // block until the group has shutdown
        future.syncUninterruptibly();
    }
}
```

或者，你也可以在调用 EventLoopGroup.shutdownGracefully()前，显式在所有活动的 Channel 上调用 Channel.close()。但任何情况下，都请记得关闭 EventLoopGroup 本身。

## 9 总结

学习了如何引导 Netty 服务器和客户端应用程序，包括那些使用无连接协议的应用程序。也涵盖一些特殊情况，包括：

- 在服务器应用程序中引导客户端 Channel
- 使用 ChannelInitializer 来处理引导过程中的多个 ChannelHandler 的安装
- 如何设置 Channel 的配置选项
- 及如何使用属性来将信息附加到 Channel
- 如何优雅地关闭应用程序，以有序释放所有资源。

后文将研究 Netty 提供的帮助你测试你的 ChannelHandler 实现的工具。