我们自己的线程，如果写在main 方法，那就是
##  main 线程
- 在创建 NioEventLoopGroup（创建一组NioEventLoop） 的过程中就创建了 selector
![](https://img-blog.csdnimg.cn/20201222154534893.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201222155153778.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 这里因为我们当前线程其实是 main 线程，所以为 false
![](https://img-blog.csdnimg.cn/20201222173246785.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 创建 ServerSocketChannel
![](https://img-blog.csdnimg.cn/20201222202819384.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 初始化 server socket channel
- 给 server socket channel 从 boss group 选择一个 NioEventLoop

## boss thread
- 将 serverSocketChannel 注册到选择的 NioEventLoop 的 selector
![](https://img-blog.csdnimg.cn/20201222202450218.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 绑定地址启动
![](https://img-blog.csdnimg.cn/20201222202125991.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 注册接受连接事件(OP_ACCEPT) 到selector
![](https://img-blog.csdnimg.cn/20201222201914463.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 第一次注册并非监听`OP_ACCEPT`，而是0
![](https://img-blog.csdnimg.cn/20201222185443799.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 最终监听的`OP_ ACCEPT`通过bind完成后的fireChannelActive()触发
![](https://img-blog.csdnimg.cn/20201222201130853.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
NioEventLoop 是通过 Register 操作的执行来完成启动。