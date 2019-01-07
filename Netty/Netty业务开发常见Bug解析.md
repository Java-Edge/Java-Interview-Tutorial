# 不显式初始化initialBytesToStrip
- LengthFieldBasedFrameDecoder#initialBytesToStrip 
![](https://img-blog.csdnimg.cn/20201225182621987.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# ChannelHandler顺序错误
- 解码编码顺序一定要注意
![](https://img-blog.csdnimg.cn/20201225184210496.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# ChannelHandler 共享问题
- 不该共享的共享了，并发时就有数据问题
这个很容易理解，犯错了也会很严重，必须避免。

- 该共享的不共享，每个 pipeline 自己又单独添加了，就等于重复存了该 handler 浪费内存![](https://img-blog.csdnimg.cn/20201225184449539.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 分配ByteBuf方式错误
分配器直接用`ByteBufAllocator.DEFAULT`等，而不是采用`ChannelHandlerContext.alloc()`
![](https://img-blog.csdnimg.cn/20201225185314274.png)
# 未考虑ByteBuf的释放
对于堆外内存或内存池，我们必须手动去释放它，因为 GC 不负责处理。如果忘记释放，就会完蛋。
所以一般继承![](https://img-blog.csdnimg.cn/20201225185503558.png)
完成内存释放。![](https://img-blog.csdnimg.cn/20201225185537898.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

#  write(msg)就一定能写数据？
![](https://img-blog.csdnimg.cn/2020122519025658.png)

- ChannelHandlerContext.channel().writeAndFlush(msg)
![](https://img-blog.csdnimg.cn/20201225220504340.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
