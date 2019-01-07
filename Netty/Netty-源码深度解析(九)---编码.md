# 概述
## 一个问题
![](https://upload-images.jianshu.io/upload_images/4685968-84804df4d0671c4b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-19eb33dede2bb8e9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
编码器实现了` ChannelOutboundHandler`，并将出站数据从 一种格式转换为另一种格式，和我们方才学习的解码器的功能正好相反。Netty 提供了一组类， 用于帮助你编写具有以下功能的编码器:
- 将消息编码为字节
- 将消息编码为消息 
我们将首先从抽象基类 MessageToByteEncoder 开始来对这些类进行考察
# 1 抽象类 MessageToByteEncoder
![MessageToByteEncoder API](https://upload-images.jianshu.io/upload_images/4685968-fc2c1f94df8cb05e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
解码器通常需要在` Channel `关闭之后产生最后一个消息(因此也就有了 `decodeLast()`方法)
这显然不适于编码器的场景——在连接被关闭之后仍然产生一个消息是毫无意义的

## 1.1 ShortToByteEncoder
其接受一` Short` 型实例作为消息，编码为`Short`的原子类型值，并写入`ByteBuf`，随后转发给`ChannelPipeline`中的下一个 `ChannelOutboundHandler`
每个传出的 Short 值都将会占用 ByteBuf 中的 2 字节
 ![ShortToByteEncoder](https://upload-images.jianshu.io/upload_images/4685968-97f463faa149d584.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8e071d7bafdfc0a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.2 Encoder
![](https://upload-images.jianshu.io/upload_images/4685968-729af7889f8ae41c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Netty 提供了一些专门化的 `MessageToByteEncoder`，可基于此实现自己的编码器
`WebSocket08FrameEncoder `类提供了一个很好的实例
![](https://upload-images.jianshu.io/upload_images/4685968-69f5cff063544148.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 抽象类 MessageToMessageEncoder
你已经看到了如何将入站数据从一种消息格式解码为另一种
为了完善这幅图，将展示 对于出站数据将如何从一种消息编码为另一种。`MessageToMessageEncoder `类的 `encode() `方法提供了这种能力
![MessageToMessageEncoderAPI](https://upload-images.jianshu.io/upload_images/4685968-c2eba110d2a993ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
为了演示,使用` IntegerToStringEncoder` 扩展了 `MessageToMessageEncoder`
- 编码器将每个出站 Integer 的 String 表示添加到了该 List 中
![](https://upload-images.jianshu.io/upload_images/4685968-4299c17d7c63ef14.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![IntegerToStringEncoder的设计](https://upload-images.jianshu.io/upload_images/4685968-f7ec09a39121010e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

关于有趣的 MessageToMessageEncoder 的专业用法，请查看 `io.netty.handler. codec.protobuf.ProtobufEncoder `类，它处理了由 Google 的 Protocol Buffers 规范所定义 的数据格式。
# 一个java对象最后是如何转变成字节流，写到socket缓冲区中去的
![](https://upload-images.jianshu.io/upload_images/4685968-24fca24338bf2433.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

pipeline中的标准链表结构
java对象编码过程
write：写队列
flush：刷新写队列
writeAndFlush: 写队列并刷新
## pipeline中的标准链表结构
![标准的pipeline链式结构](https://upload-images.jianshu.io/upload_images/4685968-e31d12a7a18ae15d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
数据从head节点流入，先拆包，然后解码成业务对象，最后经过业务`Handler`处理，调用`write`，将结果对象写出去
而写的过程先通过`tail`节点，然后通过`encoder`节点将对象编码成`ByteBuf`，最后将该`ByteBuf`对象传递到`head`节点，调用底层的Unsafe写到JDK底层管道
## Java对象编码过程
为什么我们在pipeline中添加了encoder节点，java对象就转换成netty可以处理的ByteBuf，写到管道里？

我们先看下调用write的code
![](https://upload-images.jianshu.io/upload_images/4685968-d0f990dfe8feec5e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
业务处理器接受到请求之后，做一些业务处理，返回一个`user`
- 然后，user在pipeline中传递
![AbstractChannel#](https://upload-images.jianshu.io/upload_images/4685968-73ef914536864393.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![DefaultChannelPipeline#](https://upload-images.jianshu.io/upload_images/4685968-120b0e1792d9fb6c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![AbstractChannelHandlerContext#](https://upload-images.jianshu.io/upload_images/4685968-9eb7d051da8c055e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![AbstractChannelHandlerContext#](https://upload-images.jianshu.io/upload_images/4685968-c19b9919da807791.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 情形一
![AbstractChannelHandlerContext#](https://upload-images.jianshu.io/upload_images/4685968-b0a3e8ee071ee4ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![AbstractChannelHandlerContext#](https://upload-images.jianshu.io/upload_images/4685968-7d045ca0ab92822f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 情形二
![AbstractChannelHandlerContext#](https://upload-images.jianshu.io/upload_images/4685968-a9a361e8b6b0c0b5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-800871bb8d968ecb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![AbstractChannelHandlerContext#invokeWrite0](https://upload-images.jianshu.io/upload_images/4685968-6bbc148ee05a7145.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![AbstractChannelHandlerContext#invokeFlush0](https://upload-images.jianshu.io/upload_images/4685968-8aa6125ace28d5ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
handler 如果不覆盖 flush 方法,就会一直向前传递直到 head 节点
![](https://upload-images.jianshu.io/upload_images/4685968-bddea4d884dbbbd5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

落到 `Encoder`节点，下面是 `Encoder` 的处理流程
![](https://upload-images.jianshu.io/upload_images/4685968-74ef3d309d447ade.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
按照简单自定义协议，将Java对象 User 写到传入的参数 out中，这个out到底是什么？

需知` User `对象，从`BizHandler`传入到 `MessageToByteEncoder`时，首先传到 `write` 
![](https://upload-images.jianshu.io/upload_images/4685968-667d8c9562155645.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 1. 判断当前Handelr是否能处理写入的消息(匹配对象)
![](https://upload-images.jianshu.io/upload_images/4685968-716c1fa479aeed87.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4a1d643f04edb25b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d46fa8bcf1ce03a3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
  - 判断该对象是否是该类型参数匹配器实例可匹配到的类型
![TypeParameterMatcher#](https://upload-images.jianshu.io/upload_images/4685968-c2ee03c7c6e9b816.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![具体实例](https://upload-images.jianshu.io/upload_images/4685968-9e5abcf80fc0d548.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 2 分配内存
![](https://upload-images.jianshu.io/upload_images/4685968-4d65f0f5674af21d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5476a7fdb230815b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 3 编码实现
- 调用`encode`，这里就调回到  `Encoder` 这个`Handler`中  
![](https://upload-images.jianshu.io/upload_images/4685968-b9df1d4be3dfabe3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 其为抽象方法,因此自定义实现类实现编码方法
![](https://upload-images.jianshu.io/upload_images/4685968-6f47b5610e0afa2f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-357ce06307b4b0cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 4  释放对象
- 既然自定义Java对象转换成`ByteBuf`了，那么这个对象就已经无用，释放掉 (当传入的`msg`类型是`ByteBuf`时，就不需要自己手动释放了)
![](https://upload-images.jianshu.io/upload_images/4685968-933bdca4347cbc93.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ac7d7e987a786b0e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 5 传播数据
//112 如果buf中写入了数据，就把buf传到下一个节点,直到 header 节点
![](https://upload-images.jianshu.io/upload_images/4685968-72ef8f66aaced620.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 6 释放内存
//115  否则，释放buf，将空数据传到下一个节点    
// 120 如果当前节点不能处理传入的对象，直接扔给下一个节点处理
// 127 当buf在pipeline中处理完之后，释放
![](https://upload-images.jianshu.io/upload_images/4685968-10b7d01223813755.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### Encoder处理传入的Java对象
- 判断当前`Handler`是否能处理写入的消息
    - 如果能处理，进入下面的流程
    - 否则，直接扔给下一个节点处理
- 将对象强制转换成`Encoder ` 可以处理的 `Response`对象
- 分配一个`ByteBuf`
- 调用`encoder`，即进入到 Encoder 的 encode方法，该方法是用户代码，用户将数据写入ByteBuf
- 既然自定义Java对象转换成ByteBuf了，那么这个对象就已经无用了，释放掉(当传入的msg类型是ByteBuf时，无需自己手动释放)
- 如果buf中写入了数据，就把buf传到下一个节点，否则，释放buf，将空数据传到下一个节点
- 最后，当buf在pipeline中处理完之后，释放节点

总结就是，`Encoder`节点分配一个`ByteBuf`，调用`encode`方法，将Java对象根据自定义协议写入到ByteBuf，然后再把ByteBuf传入到下一个节点，在我们的例子中，最终会传入到head节点
```
public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
    unsafe.write(msg, promise);
}
```
这里的msg就是前面在Encoder节点中，载有java对象数据的自定义ByteBuf对象
## write - 写buffer队列
![](https://upload-images.jianshu.io/upload_images/4685968-307c73b5dfd72d23.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![ChannelOutboundInvoker#](https://upload-images.jianshu.io/upload_images/4685968-96833b7477fefe2c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1ae909693fc84ebf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![write(Object msg, boolean flush, ChannelPromise promise)](https://upload-images.jianshu.io/upload_images/4685968-c08cff4eba7e1db2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e4253f83c5e64716.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8af14874dc519026.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7d5e1e346cf7cacb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![HeadContext in DefaultChannelPipeline#write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise)](https://upload-images.jianshu.io/upload_images/4685968-82841997d30ade96.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![Unsafe in Channel#write(Object msg, ChannelPromise promise)](https://upload-images.jianshu.io/upload_images/4685968-ef289b46a21326ee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
以下过程分三步讲解
![](https://upload-images.jianshu.io/upload_images/4685968-0685a9bb2338e8d3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### direct ByteBuf
![](https://upload-images.jianshu.io/upload_images/4685968-0c4f5243677578a7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![AbstractChannel#filterOutboundMessage(Object msg)](https://upload-images.jianshu.io/upload_images/4685968-045f2edbcc3ac462.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 首先，调用` assertEventLoop `确保该方法的调用是在`reactor`线程中
- 然后，调用 `filterOutboundMessage() `，将待写入的对象过滤，把非`ByteBuf`对象和`FileRegion`过滤，把所有的非直接内存转换成直接内存`DirectBuffer`
![](https://upload-images.jianshu.io/upload_images/4685968-6624e78825702577.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![AbstractNioChannel#newDirectBuffer](https://upload-images.jianshu.io/upload_images/4685968-e3b5ee7cc58e8fba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### 插入写队列
- 接下来，估算出需要写入的ByteBuf的size

![](https://upload-images.jianshu.io/upload_images/4685968-7c49f8cfc8abb137.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 最后，调用 ChannelOutboundBuffer 的addMessage(msg, size, promise) 方法，所以，接下来，我们需要重点看一下这个方法干了什么事情
![ChannelOutboundBuffer](https://upload-images.jianshu.io/upload_images/4685968-5d5799967e956bf8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

想要理解上面这段代码，须掌握写缓存中的几个消息指针
![](https://upload-images.jianshu.io/upload_images/4685968-de798f9d24c6ca9d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
ChannelOutboundBuffer 里面的数据结构是一个单链表结构，每个节点是一个 Entry，Entry 里面包含了待写出ByteBuf 以及消息回调 promise下面分别是
### 三个指针的作用
- flushedEntry 
表第一个被写到OS Socket缓冲区中的节点
![ChannelOutboundBuffer](https://upload-images.jianshu.io/upload_images/4685968-07a5e15190603fb2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- unFlushedEntry 
表第一个未被写入到OS Socket缓冲区中的节点
![ChannelOutboundBuffer](https://upload-images.jianshu.io/upload_images/4685968-87709ad85523cc40.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- tailEntry
表`ChannelOutboundBuffer`缓冲区的最后一个节点
![ChannelOutboundBuffer](https://upload-images.jianshu.io/upload_images/4685968-8c220a874c9b76b6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
###  图解过程
- 初次调用write 即 `addMessage` 后
![](https://upload-images.jianshu.io/upload_images/4685968-01ff08665e5fb3d5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
`fushedEntry`指向空，`unFushedEntry`和 `tailEntry `都指向新加入节点

- 第二次调用 `addMessage`后
![](https://upload-images.jianshu.io/upload_images/4685968-c3f5e605fcabd30d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 第n次调用 `addMessage`后
![](https://upload-images.jianshu.io/upload_images/4685968-f3340e19079c3e27.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


可得,调用n次`addMessage`后
- `flushedEntry`指针一直指向`null`，表此时尚未有节点需写到Socket缓冲区
- `unFushedEntry`后有n个节点，表当前还有n个节点尚未写到Socket缓冲区

#### 设置写状态
![ChannelOutboundBuffer#addMessage](https://upload-images.jianshu.io/upload_images/4685968-6f2250e10cdbbd9c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 统计当前有多少字节需要需要被写出
![ChannelOutboundBuffer#addMessage(Object msg, int size, ChannelPromise promise)](https://upload-images.jianshu.io/upload_images/4685968-5543bf8e6d4579e9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 当前缓冲区中有多少待写字节
![ChannelOutboundBuffer#](https://upload-images.jianshu.io/upload_images/4685968-0171d03c0fc61952.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-f0219d7b269f9a6e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![ChannelConfig#getWriteBufferHighWaterMark()](https://upload-images.jianshu.io/upload_images/4685968-b61cc201e20ffe40.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c8732e196722e9d1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-17856713165403bf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 所以默认不能超过64k
![WriteBufferWaterMark](https://upload-images.jianshu.io/upload_images/4685968-5d7ec5b3129fcadb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-d19715897fdf72b5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 自旋锁+CAS 操作,通过 pipeline 将事件传播到channelhandler 中监控
![](https://upload-images.jianshu.io/upload_images/4685968-bccfb48e0b7c36c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## flush：刷新buffer队列
### 添加刷新标志并设置写状态
- 不管调用`channel.flush()`，还是`ctx.flush()`，最终都会落地到`pipeline`中的`head`节点
![DefaultChannelPipeline#flush](https://upload-images.jianshu.io/upload_images/4685968-ecb565a2254297d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 之后进入到`AbstractUnsafe`
![AbstractChannel#flush()](https://upload-images.jianshu.io/upload_images/4685968-6a2b9b242520c3ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- flush方法中，先调用
![ChannelOutboundBuffer#addFlush](https://upload-images.jianshu.io/upload_images/4685968-c14e8c30f202db83.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![ChannelOutboundBuffer#decrementPendingOutboundBytes(long size, boolean invokeLater, boolean notifyWritability)](https://upload-images.jianshu.io/upload_images/4685968-09b36f5b96a13a2d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a01a7b4688477996.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![和之前那个实例相同,不再赘述](https://upload-images.jianshu.io/upload_images/4685968-04c753ec32f58d92.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 结合前面的图来看，上述过程即 
首先拿到 `unflushedEntry` 指针，然后将` flushedEntry `指向`unflushedEntry`所指向的节点，调用完毕后
![](https://upload-images.jianshu.io/upload_images/4685968-28a4e504c8b9a158.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 遍历 buffer 队列,过滤bytebuf
- 接下来，调用 `flush0()`
![](https://upload-images.jianshu.io/upload_images/4685968-37c6cb089cce16d1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 发现这里的核心代码就一个 `doWrite`
![AbstractChannel#](https://upload-images.jianshu.io/upload_images/4685968-669bf7e04ff0e99a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# AbstractNioByteChannel
- 继续跟
```
protected void doWrite(ChannelOutboundBuffer in) throws Exception {
    int writeSpinCount = -1;

    boolean setOpWrite = false;
    for (;;) {
        // 拿到第一个需要flush的节点的数据
        Object msg = in.current();

        if (msg instanceof ByteBuf) {
            boolean done = false;
            long flushedAmount = 0;
            // 拿到自旋锁迭代次数
            if (writeSpinCount == -1) {
                writeSpinCount = config().getWriteSpinCount();
            }
            // 自旋，将当前节点写出
            for (int i = writeSpinCount - 1; i >= 0; i --) {
                int localFlushedAmount = doWriteBytes(buf);
                if (localFlushedAmount == 0) {
                    setOpWrite = true;
                    break;
                }

                flushedAmount += localFlushedAmount;
                if (!buf.isReadable()) {
                    done = true;
                    break;
                }
            }

            in.progress(flushedAmount);

            // 写完之后，将当前节点删除
            if (done) {
                in.remove();
            } else {
                break;
            }
        } 
    }
}
```
- 第一步，调用`current()`先拿到第一个需要`flush`的节点的数据
![ChannelOutboundBuffer#current](https://upload-images.jianshu.io/upload_images/4685968-d3e67e72eef65f8f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 第二步,拿到自旋锁的迭代次数
![](https://upload-images.jianshu.io/upload_images/4685968-1d6de61347280fb4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


- 第三步 调用 JDK 底层 API 进行自旋写
自旋的方式将`ByteBuf`写到JDK NIO的`Channel`
强转为ByteBuf，若发现没有数据可读，直接删除该节点
![](https://upload-images.jianshu.io/upload_images/4685968-4d37a05bf05ffe07.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 拿到自旋锁迭代次数

![image.png](https://upload-images.jianshu.io/upload_images/4685968-d210766988601cf9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 在并发编程中使用自旋锁可以提高内存使用率和写的吞吐量,默认值为16
![ChannelConfig](https://upload-images.jianshu.io/upload_images/4685968-a8475bef6ecf13e2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 继续看源码
![](https://upload-images.jianshu.io/upload_images/4685968-ecafbd59548a6fd0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![AbstractNioByteChannel#](https://upload-images.jianshu.io/upload_images/4685968-dce60c0a5bf11941.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
-  `javaChannel()`，表明 JDK NIO Channel 已介入此次事件
![NioSocketChannel#](https://upload-images.jianshu.io/upload_images/4685968-a4397658d76d4698.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![ByteBuf#readBytes(GatheringByteChannel out, int length)](https://upload-images.jianshu.io/upload_images/4685968-cbb0d3b5f759ee4b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 得到向JDK 底层已经写了多少字节
![PooledDirectByteBuf#](https://upload-images.jianshu.io/upload_images/4685968-3c02f943cdd66670.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e7b52e9aa0e733c9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 从 Netty 的 bytebuf 写到 JDK 底层的 bytebuffer
![](https://upload-images.jianshu.io/upload_images/4685968-ecf02ba9cc614c0f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ccdaa9ea3aff5b95.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 第四步,删除该节点
节点的数据已经写入完毕，接下来就需要删除该节点
![](https://upload-images.jianshu.io/upload_images/4685968-624394ec70aace1b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
首先拿到当前被`flush`掉的节点(`flushedEntry`所指)
然后拿到该节点的回调对象 `ChannelPromise`, 调用 `removeEntry()`移除该节点
![](https://upload-images.jianshu.io/upload_images/4685968-331da9841bbbdc9b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这里是逻辑移除，只是将flushedEntry指针移到下个节点，调用后
![](https://upload-images.jianshu.io/upload_images/4685968-a3ee365cf099451f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
随后，释放该节点数据的内存，调用` safeSuccess `回调，用户代码可以在回调里面做一些记录，下面是一段Example
```
ctx.write(xx).addListener(new GenericFutureListener<Future<? super Void>>() {
    @Override
    public void operationComplete(Future<? super Void> future) throws Exception {
       // 回调 
    }
})
```
最后，调用 `recycle`，将当前节点回收
## writeAndFlush: 写队列并刷新
`writeAndFlush`在某个`Handler`中被调用之后，最终会落到 `TailContext `节点
![](https://upload-images.jianshu.io/upload_images/4685968-7de9bca98e530e24.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```

public ChannelFuture writeAndFlush(Object msg, ChannelPromise promise) {
    write(msg, true, promise);

    return promise;
}

```
![AbstractChannelHandlerContext#](https://upload-images.jianshu.io/upload_images/4685968-2d386c037c13aa70.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![AbstractChannelHandlerContext#](https://upload-images.jianshu.io/upload_images/4685968-3f7d85e213c1523e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

最终，通过一个`boolean`变量，表示是调用` invokeWriteAndFlush`，还是` invokeWrite`，`invokeWrite`便是我们上文中的write过程
![AbstractChannelHandlerContext#](https://upload-images.jianshu.io/upload_images/4685968-8d312140e4d95ba0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
可以看到，最终调用的底层方法和单独调用` write `和` flush `一样的
![](https://upload-images.jianshu.io/upload_images/4685968-d6e4563b1ff4f249.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-579fcadc81f33348.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
由此看来，`invokeWriteAndFlush`基本等价于`write`之后再来一次`flush`

# 总结
- 调用`write`并没有将数据写到Socket缓冲区中，而是写到了一个单向链表的数据结构中，`flush`才是真正的写出
- `writeAndFlush`等价于先将数据写到netty的缓冲区，再将netty缓冲区中的数据写到Socket缓冲区中，写的过程与并发编程类似，用自旋锁保证写成功
- netty中的缓冲区中的ByteBuf为DirectByteBuf
![](https://upload-images.jianshu.io/upload_images/4685968-42527f4855e71919.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 当 BizHandler 通过 writeAndFlush 方法将自定义对象往前传播时,其实可以拆分成两个过程
- 通过 pipeline逐渐往前传播,传播到其中的一个 encode 节点后,其负责重写 write 方法将自定义的对象转化为 ByteBuf,接着继续调用 write 向前传播

- pipeline中的编码器原理是创建一个`ByteBuf`,将Java对象转换为`ByteBuf`，然后再把`ByteBuf`继续向前传递,若没有再重写了,最终会传播到 head 节点,其中缓冲区列表拿到缓存写到 JDK 底层 ByteBuffer

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)

## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)

## [Github](https://github.com/Wasabi1234)
