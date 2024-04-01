# (06-1)-ChannelHandler 家族

## 1 Channel 接口的生命周期

定义了一组和 ChannelInboundHandler API 密切相关的简单但强大的状态模型。

### 1.1 Channel 的状态

| 状 态               | 描 述                                                        |
| ------------------- | ------------------------------------------------------------ |
| ChannelUnregistered | Channel 已被创建，但还未注册到 EventLoop                     |
| ChannelRegistered   | Channel 已被注册到 EventLoop                                 |
| ChannelActive       | Channel 处于活动状态（已连接到它的远程节点）。它现在可收发数据 |
| ChannelInactive     | Channel 没连接到远程节点                                     |

#### 1.1.1 Channel的状态模型

Channel 正常生命周期如图。当这些状态改变时，将会生成对应事件。

这些事件将会被转发给 ChannelPipeline 中的 ChannelHandler，其可随后对它们做出响应。

![](https://img-blog.csdnimg.cn/43e351b4717d46b991e117c75585ebf3.png)

## 2 ChannelHandler 的生命周期

ChannelHandler 接口的生命周期操作，在 ChannelHandler 被添加到 ChannelPipeline 中或被从 ChannelPipeline 中移除时会调用这些操作。这些方法中的每一个都接受一个 ChannelHandlerContext 参数。

| 类型            | 描 述                                                 |
| --------------- | ----------------------------------------------------- |
| handlerAdded    | 当把 ChannelHandler 添加到 ChannelPipeline 中时被调用 |
| handlerRemoved  | 当从 ChannelPipeline 中移除 ChannelHandler 时被调用   |
| exceptionCaught | 当处理过程中在 ChannelPipeline 中有错误产生时被调用   |

Netty 定义如下 ChannelHandler 子接口： 

- ChannelInboundHandler，处理入站数据以及各种状态变化
- ChannelOutboundHandler，处理出站数据并且允许拦截所有的操作

##  3 ChannelInboundHandler

ChannelInboundHandler 接口的生命周期。

### 3.1 被调用时机

- 数据被接收时
- 或与其对应的 Channel 状态发生改变时

这些方法和 Channel 生命周期强相关。

![](https://img-blog.csdnimg.cn/b19244416d7f40f99820146cf9a8906a.png)

> ① 当所有可读的字节都已经从 Channel 中读取之后，将会调用该回调方法；所以，可能在 channelRead
>
> Complete()被调用之前看到多次调用 channelRead(...)。



当某 ChannelInboundHandler 实现重写 channelRead() 时，它将负责显式释放与池化的 ByteBuf 实例相关的内存。见ReferenceCountUtil.release()

```java
@Sharable
// 扩展了 ChannelInboundHandlerAdapter
public class DiscardHandler extends ChannelInboundHandlerAdapter {
  @Override
  public void channelRead(ChannelHandlerContext ctx, Object msg) {
    // 丢弃已接收的消息
    ReferenceCountUtil.release(msg);
  }
}
```

Netty 用 WARN 级记录未释放资源，使得非常简单在代码中发现违规实例。但这种方式管理资源可能繁琐。更简单的使用SimpleChannelInboundHandler。 如下是上述代码的变体：

```java
package io.netty.example.cp6;

import io.netty.channel.ChannelHandler.Sharable;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

/**
 * Listing 6.2 Using SimpleChannelInboundHandler
 *
 * @author JavaEdge
 */
@Sharable
public class SimpleDiscardHandler extends SimpleChannelInboundHandler<Object> {
    
    @Override
    public void channelRead0(ChannelHandlerContext ctx, Object msg) {
        // No need to do anything special
    }
}
```

SimpleChannelInboundHandler 会自动释放资源，所以你不应存储指向任何消息的引用供将来使用，因为这些引用都将会失效。因此，`SimpleChannelInboundHandler` 会自动释放资源的功能是由 `ReferenceCountUtil.release()` 方法实现的。该方法会减少消息的引用计数，并在引用计数为零时释放消息占用的资源。

```java
@Override
public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
    boolean release = true;
    try {
        // 类型匹配 检查接收到的消息是否符合处理器的泛型类型
        if (acceptInboundMessage(msg)) {
            @SuppressWarnings("unchecked")
            I imsg = (I) msg;
            // 如果是，则调用 channelRead0() 方法来处理消息
            channelRead0(ctx, imsg);
        } else {
            release = false;
            // 否则，将消息传递给下一个处理器
            ctx.fireChannelRead(msg);
        }
    } finally {
        // 在处理完消息后
        // 检查 autoRelease 属性是否为 true，以决定是否自动释放消息占用的资源
        if (autoRelease && release) {
            // 因为可能是堆外内存或内存池,所以需要释放ByteBuf
            ReferenceCountUtil.release(msg);
        }
    }
}
```

## 4 ChannelOutboundHandler

出站操作和数据由 ChannelOutboundHandler 处理。其方法被 Channel、ChannelPipeline 以及 ChannelHandlerContext 调用。

### 4.1 按需推迟操作或事件

ChannelOutboundHandler 的一个强大的功能，这使得可以通过一些复杂方法处理请求。如若到远程节点的写入被暂停，那你可以推迟flush操作并在稍后再继续。

是的，Netty中的ChannelOutboundHandler确实具有推迟操作或事件的功能。这通常通过ChannelHandlerContext的write和flush方法实现。

#### 示例

展示如何使用ChannelOutboundHandler推迟flush的操作：

```java
public class MyOutboundHandler extends ChannelOutboundHandlerAdapter {
    private boolean isWritePending = false;

  	// 当write方法被调用时，它将isWritePending标记设置为true，并调用ctx.write
    @Override
    public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
        isWritePending = true;
        ctx.write(msg, promise);
    }

  	// 当flush方法被调用时，如果isWritePending标记为true，则将它设置为false，并调用ctx.flush
    @Override
    public void flush(ChannelHandlerContext ctx) throws Exception {
        if (isWritePending) {
            isWritePending = false;
            ctx.flush();
        }
    }
}
```

可根据需要修改它以实现更复杂操作。

### 4.2 ChannelOutboundHandler API



表6-4显示所有由ChannelOutboundHandler本身定义的方法（忽略从ChannelHandler 继承的）：

![](https://img-blog.csdnimg.cn/3cfa2593177842e4891c89976e90a12e.png)

### 4.3 ChannelPromise V.S ChannelFuture

ChannelOutboundHandler中的大部分方法都需要一个ChannelPromise参数，以便在操作完成时得到通知。ChannelPromise是ChannelFuture的一个子类，定义一些可写的方法，如setSuccess()和setFailure()，从而使ChannelFuture不可变。这里借鉴的是 Scala 的 Promise 和 Future 的设计，当一个 Promise 被完成后，其对应的 Future 的值便不能再进行任何修改。

## 5 ChannelHandler 适配器

### 5.1 意义

简化编写 ChannelHandler 的任务的类。



可使用 ChannelInboundHandlerAdapter 和 ChannelOutboundHandlerAdapter 类作为自己的 ChannelHandler 的起始点。这两个适配器分别提供ChannelInboundHandler、ChannelOutboundHandler 的基本实现。通过扩展抽象类 ChannelHandlerAdapter，它们获得共同父接口 ChannelHandler 的方法。

图 6-2 ChannelHandlerAdapter 类的层次结构：

![](https://img-blog.csdnimg.cn/d6839964e15f4ca9b0b56e0bf5a930ca.png)

ChannelHandlerAdapter#isSharable()，若其对应实现被标注为Sharable，则该方法返true，即它可被添加到多个 ChannelPipeline。

 ChannelInboundHandlerAdapter、ChannelOutboundHandlerAdapter提供的方法体调用了其相关联的 ChannelHandlerContext上的等效方法，从而将事件转发到 ChannelPipeline 中的下一ChannelHandler。

在自己的 ChannelHandler 中使用这些适配器类，只需extend并重写需要自定义实现的方法。

## 6 资源管理

每当调用如下方法处理数据时，都要确保没有任何的资源泄漏：

- ChannelInboundHandler.channelRead()
- 或ChannelOutboundHandler.write()

Netty使用引用计数来处理池化的ByteBuf。所以完全使用完某个ByteBuf 后，调整其引用计数很重要。为助你诊断潜在（资源泄漏）问题，Netty提供class ResourceLeakDetector， 对你应用程序的缓冲区分配做大约1%的采样来检测内存泄露。相关开销非常小。若检测到内存泄露，将会产生类似日志消息：

```bash
LEAK: ByteBuf.release() was not called before it's garbage-collected. Enable advanced leak reporting to find out where the leak occurred. To enable advanced leak reporting, specify the JVM option
'-Dio.netty.leakDetectionLevel=ADVANCED' or call
ResourceLeakDetector.setLevel().
```

### 6.1 泄漏检测级别

Netty 目前定义了 4 种泄漏检测级别，如表 6-5：

| 类型     | 描 述                                                        |
| -------- | ------------------------------------------------------------ |
| DISABLED | 禁用泄漏检测。只有在详尽的测试之后才应设置为这个值           |
| SIMPLE   | 使用 1%的默认采样率检测并报告任何发现的泄露。这是默认级别，适合绝大部分的情况 |
| ADVANCED | 使用默认的采样率，报告所发现的任何的泄露以及对应的消息被访问的位置 |
| PARANOID | 类似于 ADVANCED，但是其将会对每次（对消息的）访问都进行采样。这对性能将会有很大的影响，应该只在调试阶段使用 |

泄露检测级别可以通过将下面的 Java 系统属性设置为表中的一个值来定义：

```bash
java -Dio.netty.leakDetectionLevel=ADVANCED
```

带该 JVM 选项重启应用，将看到应用程序最近被泄漏的缓冲区被访问的位置。如下是典型的由单元测试产生的泄漏报告：

```bash
Running io.netty.handler.codec.xml.XmlFrameDecoderTest

15:03:36.886 [main] ERROR io.netty.util.ResourceLeakDetector - LEAK: ByteBuf.release() was not called before it's garbage-collected.

Recent access records: 1

\#1: io.netty.buffer.AdvancedLeakAwareByteBuf.toString( AdvancedLeakAwareByteBuf.java:697)

io.netty.handler.codec.xml.XmlFrameDecoderTest.testDecodeWithXml( XmlFrameDecoderTest.java:157)

io.netty.handler.codec.xml.XmlFrameDecoderTest.testDecodeWithTwoMessages( XmlFrameDecoderTest.java:133)

...
```

实现 ChannelInboundHandler.channelRead()、ChannelOutboundHandler.write() 方法时，如何使用这个诊断工具防止泄露？看你的 channelRead()操作直接消费入站消息的情况；即它不会通过调用 ChannelHandlerContext.fireChannelRead() 方法将入站消息转发给下一个ChannelInboundHandler。代码清单 6-3 展示如何释放消息：

```java
@Sharable
public class DiscardInboundHandler extends ChannelInboundHandlerAdapter {
  @Override
  public void channelRead(ChannelHandlerContext ctx, Object msg) {
    // 释放资源
    ReferenceCountUtil.release(msg);
  }
}
```

### 6.2 消费入站消息的简单方式

消费入站数据是常见任务，所以Netty提供SimpleChannelInboundHandler的 ChannelInboundHandler 实现。该实现会在消息被 channelRead0() 消费之后自动释放消息。

消费入站数据，指在Netty应用中处理接收到的网络数据。当客户端发送数据到服务器时，服务器接收并读取这些数据。这些数据就是入站数据，因为它们从外部网络流入服务器。

Netty中的入站数据通常由ChannelInboundHandler处理。这些处理程序负责解码接收到的数据，将其转换为应用程序能理解的格式，并将其传递给下一Handler或应用程序本身。

#### 入站数据的消费步骤

1. 读取数据：使用ChannelHandlerContext#read从网络中读取数据
2. 解码数据：使用ChannelInboundHandlerAdapter#channelRead解码读取到的数据
3. 处理数据：使用业务逻辑处理程序处理解码后的数据
4. 传递数据：使用ChannelHandlerContext#fireChannelRead，将处理后的数据传递给下一个处理程序或应用程序本身



出站方向，若你处理了write()操作并丢弃一个消息，那你也应该负责释放它。代码清单 6-4 展示一个丢弃所有的写入数据的实现。

```java
@Sharable
public class DiscardOutboundHandler extends ChannelOutboundHandlerAdapter {
  
  @Override
  public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) {
    // 使用 ReferenceCountUtil.realse(...)释放资源
    ReferenceCountUtil.release(msg);
    promise.setSuccess();
  }
}
```

不仅要释放资源，还要通知 ChannelPromise。否则可能出现 ChannelFutureListener 收不到某消息已被处理的通知的case。

总之，如果一个消息被消费或者丢弃了，并且没有传递给 ChannelPipeline 中的下一个

ChannelOutboundHandler，用户就有责任调用 ReferenceCountUtil.release()。若消息到达实际的传输层，则当它被写入时或 Channel 关闭时，都将被自动释放。