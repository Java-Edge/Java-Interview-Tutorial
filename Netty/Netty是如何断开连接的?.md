多路复用器(Selector) 接收到**OP_READ**事件:
处理**OP_READ**事件: NioSocketChannel.NioSocketChannelUnsafe.read()
- 接受数据
- 判断接受的数据大小是否<0,如果是，说明是关闭，开始执行关闭:
	- 关闭channel(包含cancel多路复用器的key)
	- 清理消息:不接受新信息，fail 掉所有queue中消息
	- 触发fireChannellnactive和fireChannelUnregistered。

# 源码
关闭连接，会触发**OP_READ** 事件：
- 所以在此增加条件断点
![](https://img-blog.csdnimg.cn/2020122411174696.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 客户端断开连接时打断点![](https://img-blog.csdnimg.cn/20201224112013728.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 写数据完成了
读取字节数是**-1**代表正常关闭。![](https://img-blog.csdnimg.cn/20201224113537117.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 释放缓存![](https://img-blog.csdnimg.cn/20201224113834281.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
到了最后，关闭 selection上的 selectionkey，这样selector 上就不会再发生该channel上的各种事件了。

# 关闭连接的根本 API（JDK 原生）
- Channel的关闭包含了SelectionKey的cancel
![](https://img-blog.csdnimg.cn/20201224125907148.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
如果发送数据的时候，突然把连接关闭掉了，这种不正常的取消连接如何执行的呢？
- 数据读取进行时，强行关闭，会抛IOException
![](https://img-blog.csdnimg.cn/2020122413114118.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 这里捕获
![](https://img-blog.csdnimg.cn/20201224131243429.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 处理 IO 异常![](https://img-blog.csdnimg.cn/20201224131343809.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 所以正常关闭和异常关闭处理是不同的![](https://img-blog.csdnimg.cn/20201224131500158.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
