worker thread

# 执行示意图
![](https://img-blog.csdnimg.cn/20201223202743725.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
Handler执行资格:
- 实现了ChannellnboundHandler
- 实现方法channelRead不能加注解@Skip
# 执行流程
- 多路复用器( Selector )接收到OP_ READ事件
- 处理 OP_READ事件: NioSocketChannel.NioSocketChannelUnsafe.read
- 分配一个初始1024字节的byte buffer来接受数据
- 从 Channet接受数据到byte buffer
- 记录实际接受数据大小， 调整下次分配byte buffer大小

`触发pipeline.fireChannelRead(byteBuf)把读取到的数据传播出去`

判断接受 byte buffer是否满载而归:是，尝试继续读取直到没有数据或满16次;否，结束本轮读取，等待下次**OP_READ**事件

# 处理业务的本质
数据在pipeline中所有的handler的channelRead()执行过程。

- Handler要实现io.netty.channel.ChannelnboundHandler#channelRead (ChannelHandlerContext ctx,Object msg)，且不能加注解@Skip才能被执行到。
- 中途可退出，不保证执行到Tail Handler。

默认处理线程就是Channel绑定的NioEventLoop线程，也可以设置其他
```java
pipeline.addLast(new UnorderedThreadPoolEventExecutor(10), serverHandler)
```
