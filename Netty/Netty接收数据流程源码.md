# 1 Netty读数据的技巧
## 1.1 AdaptiveRecvByteBufAllocator
自适应数据大小的分配器。

打水时，拿多大桶去装?
![](https://img-blog.csdnimg.cn/2020122315004699.png)

- 小了不够
- 大了浪费

所以根据自己实际装预估下次情况，从而决定下次带多大桶。

AdaptiveRecvByteBufAllocator对bytebuf的猜测
- 果断地放大
- 谨慎地缩小( 需连续2次的判断)

##  1.2 defaultMaxMessagesPerRead
连续读。
排队打水时，假设当前桶装满了，这时你会觉得可能还要打点水才够用，所以直接拿个新桶等装，而非回家，直到后面出现
- 有桶没有装满
- 装了很多桶了，需要给别人留个机会

等原因才停止，回家。

# 2  执行流程
如下都是worker线程的事。

多路复用器( Selector )接收到**OP_READ**事件
处理**OP_READ**事件：NioSocketChannel.NioSocketChannelUnsafe.read()
- 分配一个初始1024字节的byte buffer来接受数据
- 从Channel接受数据到byte buffer
- 记录实际接受数据大小，调整下次分配byte buffer大小
- 触发 pipeline.fireChannelRead(byteBuf)把读取到的数据传播出去
- 判断接受byte buffer是否满载而归:是，尝试继续读取直到没有数据或满16次;否，结束本轮读取，等待下次**OP_READ**事件

和连接事件类似，我们肯定还是主要在 NioEventLoop
- 此处先处理的 OP_ACCEPT 建立连接事件,直接让它过了
![](https://img-blog.csdnimg.cn/20201223170919526.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 这次来的才是处理读请求的
![](https://img-blog.csdnimg.cn/20201223171143887.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

#  3 读取数据的根本 API
- sun.nio.ch.SocketChannellmpl#read(java.nio.ByteBuffer)
![](https://img-blog.csdnimg.cn/20201223182222298.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201223182306800.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 4 read方法区别
- NioSocketChannel#read 读数据
- NioServerSocketChannel#read 创建连接

# 5 fireChannelRead区别
- pipeline.fireChannelReadComplete()
 一次读事件处理完成
- pipeline fireChannelRead(byteBuf)
一次读数据完成， 一次读事件处理可能会包含多次读数据操作
![](https://img-blog.csdnimg.cn/20201223185312785.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 6 为啥最多只尝试读16次?
给别人留机会。