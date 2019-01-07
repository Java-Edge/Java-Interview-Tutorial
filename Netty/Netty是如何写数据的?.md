# 1 写数据的核心问题
| 快递场景(包裹) | Netty写数据(数据) |
|--|--|
|揽收到仓库  | write:写到一个buffer |
|从仓库发货  | flush:把buffer里的数据发送出去 |
|揽收到仓库并立马发货( 加急件)  | writeAndFlush: 写到buffer, 立马发送 |
|揽收与发货之间有个缓冲的仓库  | Write和Flush之间有个ChannelOutboundBuffer |
## 1.1 写炸了
- 对方仓库爆仓时，送不了的时候，会停止送，协商等电话通知什么时候好了,再送。
Netty写数据，写不进去时，会停止写，然后注册一个 OP_WRITE事件，来通知什么时候可以写进去了再写。

##  1.2 挺能写的
- 发送快递时，对方仓库都直接收下，这个时候再发送快递时，可以尝试发送更多的快递试试，这样效果更好。
Netty批量写数据时，如果尝试写的都写进去了，接下来会尝试写更多(调整**maxBytesPerGatheringWrite**) 
![](https://img-blog.csdnimg.cn/20201224104422236.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 1.3 我还能写
- 发送快递时，发到某个地方的快递特别多，我们会连续发，但是快递车毕竟有限，也会考虑下其他地方

- Netty只要有数据要写，且能写的出去，则一直尝试，直到写不出去或满16次(writeSpinCount) 
![](https://img-blog.csdnimg.cn/20201224104950996.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

写16次还没有写完，就直接 schedule 一个 task 来继续写，而不是用注册写事件来触发，更简洁有力。

##  1.4 写不过来了
- 揽收太多，发送来不及时，爆仓，这个时候会出个告示牌:收不下了，最好过2天再来邮寄吧。
- Netty待写数据太多，超过一定的水位线(writeBufferWaterMark.high()) ，会将可写的标志位改成 false，让应用端自己做决定要不要发送数据（写）了（很真实，将责任推给用户）。
![](https://img-blog.csdnimg.cn/20201224105333812.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


# 2 核心流程
![](https://img-blog.csdnimg.cn/20201223214920258.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- Write - 写数据到buffer :
ChannelOutboundBuffer#addMessage
![](https://img-blog.csdnimg.cn/20201223220441929.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


- Flush -发送buffer里面的数据:
AbstractChannel.AbstractUnsafe#flush
	- 准备数据: ChannelOutboundBuffer#addFlush
![](https://img-blog.csdnimg.cn/20201223221431638.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 写完了更新状态
![](https://img-blog.csdnimg.cn/20201224095301130.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

	- 发送: NioSocketChannel#doWrite
![](https://img-blog.csdnimg.cn/20201223224449500.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 3 写数据的根本
- Single write
sun.nio.ch.SocketChannelmpl#write(java.nio.ByteBuffer)
- gathering write（批量写）
sun.nio.ch.SocketChannelmpl#write(java.nio.ByteBuffer[], int, int)

写数据写不进去时，会停止写，注册一个 **OP_WRITE** 事件，来通知什么时候可以写进去了。
 **OP_WRITE**不代表有数据可写，而是可以写进去，所以正常情况下不要注册它，否则会一直触发。

- channelHandlerContext.channel().write()
从TailContext开始执行
- channelHandlerContext.write()
从当前的Context开始