# ChannelPipeline接口

## 1 概述

ChannelPipeline看作拦截流经Channel的入、出站事件的ChannelHandler的实例链，就易看出这些 ChannelHandler之间的交互如何组成一个应用程序数据和事件处理逻辑的核心。

每个新建的 Channel 都会被分配一个新ChannelPipeline。这项关联是永久性的；Channel既不能附加另外一个 ChannelPipeline，也不能分离其当前的。Netty组件生命周期中，这是一项固定操作，无需开发干预。

根据事件源，事件将会被ChannelInboundHandler/ChannelOutboundHandler处理。再调用 ChannelHandlerContext 实现，它将被转发给同一父类的下一个ChannelHandler。

### 1.1 ChannelHandlerContext

使ChannelHandler能和其ChannelPipeline及其他的ChannelHandler交互。 

ChannelHandler能通知其所属ChannelPipeline中的下一ChannelHandler，甚至动态修改其所属ChannelPipeline（指修改 ChannelPipeline 中的 ChannelHandler 的编排）。

ChannelHandlerContext 具有丰富的用于处理事件和执行 I/O 操作的 API。

下图同时具有入、出站 ChannelHandler 的 ChannelPipeline 的布局，即ChannelPipeline由一系列ChannelHandler组成。ChannelPipeline 还提供通过 ChannelPipeline 本身传播事件的方法。若一个入站事件被触发，它将被从 ChannelPipeline#head开始一直被传播到 Channel Pipeline#tail。

ChannelPipeline和其ChannelHandler：

![](https://img-blog.csdnimg.cn/00269d5770e149a4a66811fcdd352db9.png)

### 1.2 ChannelPipeline 相对论

从事件途经 ChannelPipeline 的角度，ChannelPipeline 的头尾端取决于该事件是入站还是出站。而 Netty 总将 ChannelPipeline 的入站口（上图左侧） 作头，出站口（图右）作尾。

当你完成调用 ChannelPipeline.add*() 将入站处理器（ChannelInboundHandler）和出站处理器（ ChannelOutboundHandler）混合添加到 ChannelPipeline 后，每个ChannelHandler 从头到尾的顺序位置正如同我们方才所定义它们的一样。因此，若你将图 6-3 中的处理器（ChannelHandler）从左到右编号，则第一个被入站事件看到的 ChannelHandler 将是1，而第一个被出站事件看到的 ChannelHandler 将是 5。



在 ChannelPipeline 传播事件时，它会测试 ChannelPipeline 中的下一个 ChannelHandler 的类型是否和事件的运动方向匹配。不匹配，ChannelPipeline 将跳过该 ChannelHandler 并前进到下一个，直到它找到和该事件所期望的方向相匹配的为止。（当然，ChannelHandler 也可以同时实现 ChannelInboundHandler 接口和 ChannelOutboundHandler 接口。）

### 1.3 pipeline是啥？

每个Netty SocketChannel包含一个ChannelPipeline。 

可将ChannelInboundHandler、ChannelOutboundHandler实例都添加到Netty ChannelPipeline。

添加了ChannelInboundHandler、ChannelOutboundHandler实例的ChannelPipeline：

![](https://img-blog.csdnimg.cn/20210529143039987.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

从SocketChannel接收到数据后，该数据将传递到ChannelPipeline中的第一个ChannelInboundHandler，处理完数据，将数据传递到ChannelPipeline中的下一ChannelInboundHandler。

ChannelInboundHandler可在将接收到的数据传递到pipeline中的下一处理器之前对其进行转换。如原始字节转为HTTP对象。然后，管道中的下一处理器将看到HTTP对象。

将数据写回SocketChannel时，它以相同方式发生。数据从ChannelOutboundHandler传递到ChannelPipeline#ChannelOutboundHandler，直到SocketChannel。 ChannelOutboundHandler实例也可转换流程中的数据。

尽管该图将ChannelInboundHandler、ChannelOutboundHandler实例显示为单独列表，但实际位于同一list（管道）。

因此，若ChannelInboundHandler决定将某些内容写回SocketChannel，则数据将通过比ChannelInboundHandler写入数据更早的ChannelPipeline中位于所有ChannelOutboundHandler实例。

![](https://img-blog.csdnimg.cn/20210529145551909.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

Netty具有编解码器（编码器+解码器）。Netty编解码器将字节转换为消息对象（Java对象)，或将消息对象转换为字节。如编解码器可将：

- 传入的HTTP请求的原始字节转换为HTTP对象
- 或将HTTP响应对象转换回原始字节

Netty编解码器对象只是1或2个ChannelHandler实现。编解码器通常组成：

- 将请求字节转换为对象的ChannelInboundHandler
- 将响应对象转换为字节的ChannelOutboundHandler

Netty提供不同协议的编解码器，如HTTP，WebSocket，SSL/TLS。为将这些协议与Netty一起用，须将相应协议编解码器ChannelInboundHandler和ChannelOutboundHandler添到要使用的SocketChannel的ChannelPipeline中。

## 2  pipeline初始化

创建Channel时被创建：

```java
protected AbstractChannel(Channel parent) {
        this.parent = parent;
        id = newId();
        unsafe = newUnsafe();
        pipeline = new DefaultChannelPipeline(this);
}
```

```java
// 双向链表结构
protected DefaultChannelPipeline(Channel channel) {
        this.channel = ObjectUtil.checkNotNull(channel, "channel");
        succeededFuture = new SucceededChannelFuture(channel, null);
        voidPromise =  new VoidChannelPromise(channel, true);

  			 // Pipeline中的两大哨兵
        tail = new TailContext(this);
        head = new HeadContext(this);

        head.next = tail;
        tail.prev = head;
}
```

Pipeline节点的数据结构ChannelHandlerContext

```java
public interface ChannelHandlerContext extends AttributeMap, ChannelInboundInvoker, ChannelOutboundInvoker {
```

看其实现类：

![](https://img-blog.csdnimg.cn/ccd17ef356d042aa837af67e0ecdb461.png)

基本数据结构组件：

```java
abstract class AbstractChannelHandlerContext implements ChannelHandlerContext, ResourceLeakHint {
    volatile AbstractChannelHandlerContext next;
    volatile AbstractChannelHandlerContext prev;
  	...
}
```

## 3 修改 ChannelPipeline

ChannelHandler 可添加、删除或替换其他 ChannelHandler，来实时修改 ChannelPipeline 布局。也可将它自己从 ChannelPipeline 中移除。

### 3.1 API

**ChannelHandler** 用于修改 **ChannelPipeline** 的方法：

| 名称                                                   | 描 述                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| AddFirstaddBefore <br>addAfteraddLastChannelRegistered | 将一个ChannelHandler 添加到ChannelPipeline                   |
| remove                                                 | Channel 已被注册到 EventLoop                                 |
| replace                                                | 将 ChannelPipeline 中的一个 ChannelHandler 替换为另一个 Channel |

使用：

```java
ChannelPipeline pipeline = ..;
// 创建一个 FirstHandler 的实例
FirstHandler firstHandler = new FirstHandler();
// 将该实例作为"handler1"添加到 ChannelPipeline
pipeline.addLast("handler1", firstHandler);
// 将一个SecondHandler实例作为"handler2"添加到ChannelPipeline的第一个槽。即放置在已有的"handler1"前
pipeline.addFirst("handler2", new SecondHandler());
// 将一个 ThirdHandler 的实例作为"handler3"添加到 ChannelPipeline 的最后一个槽中
pipeline.addLast("handler3", new ThirdHandler());
...
// 通过名称移除"handler3"
pipeline.remove("handler3");
// 通过引用移除FirstHandler（它是唯一的，所以不需要它的名称）
pipeline.remove(firstHandler);
// 将 SecondHandler("handler2")替换为 FourthHandler:"handler4"
pipeline.replace("handler2", "handler4", new ForthHandler());
```

### 3.2 ChannelHandler的执行和阻塞

通常 ChannelPipeline 中的每个 ChannelHandler 都是通过它的 EventLoop（I/O 线程）处理传递给它的事件。所以关键就是别阻塞这线程，因为对整体 I/O 处理产生负面影响。但若不得不处理

#### 与使用阻塞 API 的遗留代码交互

对此，ChannelPipeline 有接受一个 EventExecutorGroup 的add()方法。若一个事件被传递给一个自定义的 EventExecutorGroup，它将被包含在这个 EventExecutorGroup 中的某 EventExecutor 处理，从而被从该Channel 本身的 EventLoop 中移除。对这种case，Netty 提供 DefaultEventExecutorGroup 的默认实现。

还有别的通过类型或者名称来访问 ChannelHandler 的方法。这些方法都在下表 ChannelPipeline 的用于访问 ChannelHandler 的操作：

| 名称    | 描 述                                              |
| ------- | -------------------------------------------------- |
| get     | 通过类型或者名称返回 ChannelHandler                |
| context | 返回和 ChannelHandler 绑定的 ChannelHandlerContext |
| names   | 返回 ChannelPipeline 中所有 ChannelHandler 的名称  |

### 用户代码

```java
/**
 * @author JavaEdge
 */
public final class Server {

    public static void main(String[] args) throws Exception {
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childOption(ChannelOption.TCP_NODELAY, true)
                    .childAttr(AttributeKey.newInstance("childAttr"), "childAttrValue")
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch) {
                            ch.pipeline().addLast(new OutBoundHandlerA());
                            ch.pipeline().addLast(new OutBoundHandlerC());
                            ch.pipeline().addLast(new OutBoundHandlerB());
                        }
                    });

            ChannelFuture f = b.bind(8888).sync();

            f.channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}
```

#### 判断是否重复添加

```java
@Override
public final ChannelPipeline addLast(ChannelHandler... handlers) {
  return addLast(null, handlers);
}
```

```java
    @Override
    public final ChannelPipeline addLast(EventExecutorGroup executor, ChannelHandler... handlers) {
        ObjectUtil.checkNotNull(handlers, "handlers");

        for (ChannelHandler h: handlers) {
            if (h == null) {
                break;
            }
            addLast(executor, null, h);
        }

        return this;
    }
```

```java
public final ChannelPipeline addLast(EventExecutorGroup group, String name, ChannelHandler handler) {
  final AbstractChannelHandlerContext newCtx;
  synchronized (this) {
    // core
    checkMultiplicity(handler);
    ...
  }
```

```java
private static void checkMultiplicity(ChannelHandler handler) {
  if (handler instanceof ChannelHandlerAdapter) {
    ChannelHandlerAdapter h = (ChannelHandlerAdapter) handler;
    if (!h.isSharable() && h.added) {
      throw new ChannelPipelineException(
        h.getClass().getName() +
        " is not a @Sharable handler, so can't be added or removed multiple times.");
    }
    h.added = true;
  }
}
```

### 创建节点并添加至链表



![](https://img-blog.csdnimg.cn/f18a2875e5ce43b5ab86dd1b2f9e8b15.png)

### 回调添加完成事件

![](https://img-blog.csdnimg.cn/627d34e45eeb4bed920b42be5801e237.png)

```java
private void callHandlerAddedInEventLoop(final AbstractChannelHandlerContext newCtx, EventExecutor executor) {
  newCtx.setAddPending();
  executor.execute(new Runnable() {
    @Override
    public void run() {
      callHandlerAdded0(newCtx);
    }
  });
}
```

```java
    private void callHandlerAdded0(final AbstractChannelHandlerContext ctx) {
        try {
          	// core
            ctx.callHandlerAdded();
        } catch (Throwable t) {
            boolean removed = false;
            try {
                atomicRemoveFromHandlerList(ctx);
                ctx.callHandlerRemoved();
                removed = true;
            } catch (Throwable t2) {
                if (logger.isWarnEnabled()) {
                    logger.warn("Failed to remove a handler: " + ctx.name(), t2);
                }
            }

            if (removed) {
                fireExceptionCaught(new ChannelPipelineException(
                        ctx.handler().getClass().getName() +
                        ".handlerAdded() has thrown an exception; removed.", t));
            } else {
                fireExceptionCaught(new ChannelPipelineException(
                        ctx.handler().getClass().getName() +
                        ".handlerAdded() has thrown an exception; also failed to remove.", t));
            }
        }
    }
```



```java
final void callHandlerAdded() throws Exception {
  // We must call setAddComplete before calling handlerAdded. Otherwise if the handlerAdded method generates
  // any pipeline events ctx.handler() will miss them because the state will not allow it.
  if (setAddComplete()) {
    handler().handlerAdded(this);
  }
}
```



```java
final boolean setAddComplete() {
  for (;;) {
    int oldState = handlerState;
    if (oldState == REMOVE_COMPLETE) {
      return false;
    }
    // Ensure we never update when the handlerState is REMOVE_COMPLETE already.
    // oldState is usually ADD_PENDING but can also be REMOVE_COMPLETE when an EventExecutor is used that is not
    // exposing ordering guarantees.
    if (HANDLER_STATE_UPDATER.compareAndSet(this, oldState, ADD_COMPLETE)) {
      return true;
    }
  }
}
```



![](https://img-blog.csdnimg.cn/017eb875bd6140c487660c474c91debe.png)

![](https://img-blog.csdnimg.cn/c7e8cd1717da4d0bb1665be07db7ba35.png)



![](https://img-blog.csdnimg.cn/bd7e89bd2c23426f988976e23677422f.png)

![](https://img-blog.csdnimg.cn/2c20f982eb064997a9f35dfc20f84da7.png)

用户方自定义实现即可：
![](https://img-blog.csdnimg.cn/img_convert/f2e977c9e5fd098f12d5fcdd8104baf5.png)

## 4 触发事件

ChannelPipeline 的 API 公开了用于调用入站和出站操作的附加方法。

### 4.1 入站

**ChannelPipeline** 的入站操作，用于通知 ChannelInboundHandler 在 ChannelPipeline 中所发生的事件：

![](https://img-blog.csdnimg.cn/c234c630618f457c84bd6b8c55f35851.png)

在出站这边，处理事件将会导致底层的套接字上发生一系列的动作。

### 4.2 出站

**ChannelPipeline** 的出站操作：

![](https://img-blog.csdnimg.cn/9853a2247b5243f491d3f05d9e271b26.png)

### 4.3 小结

- ChannelPipeline 保存了与 Channel 相关联的 ChannelHandler
- ChannelPipeline 可根据需要，通过添加或删除 ChannelHandler 动态修改
- ChannelPipeline 有着丰富的 API 用以被调用，以响应入站和出站事件

## 5 outBound事件的传播



![](https://img-blog.csdnimg.cn/img_convert/43cda580840407231a92de3bce550662.png)

![](https://img-blog.csdnimg.cn/fdd492a570ae4586abbc234ca69f2692.png)

![](https://img-blog.csdnimg.cn/img_convert/3808ec5e28f7983ade05969964b2899e.png)

![](https://img-blog.csdnimg.cn/img_convert/ed69ed24d5b42448ae1016636d438861.png)

![](https://img-blog.csdnimg.cn/img_convert/84c8b22110899727254e3c8dc2353180.png)

![](https://img-blog.csdnimg.cn/img_convert/81772d8372e55d93f3eaeb7a500b97a7.png)

![](https://img-blog.csdnimg.cn/img_convert/0357d85c7f5a299cb16deacb1abb2400.png)

![](https://img-blog.csdnimg.cn/img_convert/b8a28787ae1dd6f38cd9fd691b22c257.png)
![](https://img-blog.csdnimg.cn/img_convert/c9119754b1d485b1573f735f10a6535c.png)

![](https://img-blog.csdnimg.cn/img_convert/eb190e3dc814efa3d46a93a36b3aaa00.png)

![](https://img-blog.csdnimg.cn/img_convert/a06de21da851b53ec017a211ba81c53e.png)

![](https://img-blog.csdnimg.cn/img_convert/a3c8673107d84d381862e424f8e0956a.png)

![](https://img-blog.csdnimg.cn/img_convert/21978114afc47f3bf9039c0b5859cc6f.png)

同理以后的过程

![](https://img-blog.csdnimg.cn/img_convert/1ba9f88dd30283c2aaf3b473aafe4595.png)

## 6 异常的传播

![](https://img-blog.csdnimg.cn/img_convert/54bc885fe4abb6737846b9e7125b88e4.png)
![](https://img-blog.csdnimg.cn/img_convert/b80a0b7f67615fb0e30a6160e900e802.png)
![](https://img-blog.csdnimg.cn/img_convert/08b8c4c16d5e646e115145222ed4c0c5.png)
![](https://img-blog.csdnimg.cn/img_convert/8b29c48c514182ad78245b4d87855715.png)
![](https://img-blog.csdnimg.cn/img_convert/276ae221a3018167cc431abe7febd20f.png)
![](https://img-blog.csdnimg.cn/img_convert/0da1965184ab2a4670dff96b7492f690.png)
![](https://img-blog.csdnimg.cn/img_convert/9f9070b6def4be2249fa9a726e90254a.png)
![对应 tail 为当前节点的情形](https://img-blog.csdnimg.cn/img_convert/3f948bebd09842f8734bda3470c589ff.png)
![](https://img-blog.csdnimg.cn/img_convert/8f267b19e563c0acf9795c9b25e753ca.png)

### 最佳实践

在最后定义异常处理器，否则默认是 tail 节点的警告打印信息：

![](https://img-blog.csdnimg.cn/img_convert/820d053864b6568c5fa3cfd172bc49d3.png)

所有异常最终处理位置：

![](https://img-blog.csdnimg.cn/img_convert/e57b6260dc64415a36d00430a34f94f1.png)

## 7 总结

### 7.1 netty咋判断ChannelHandler类型?

调用 pipeline 添加节点时，用 instanceof 关键字判断当前节点是 inboound 还是 outbound 类型，分别用不同 boolean 类型变量标识。

### 7.2 ChannelHandler的添加，应遵循啥顺序？

- inbound 事件类型顺序正相关
- outbound 逆相关

### 7.3 用户手动触发事件传播，不同触发方式有何区别?

异常处理器要么从 head or tail 节点开始传播：

- inbound事件则从当前节点开始传递到最后节点
- outbound事件则从当前节点开始传递到第一个 outbound节点