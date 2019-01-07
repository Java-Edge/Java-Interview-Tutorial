#  1 优雅关闭的常见作用

最常见的，比如业务开发中，服务突然异常，刚进来的用户请求还在，通过优雅关闭，给他们 30s 时间继续执行，以免直接报错出去。
# 2 Netty 优雅关闭流程图

![](https://img-blog.csdnimg.cn/20201224142834412.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 修改 NioEventLoop 的 State 标志位
- NioEventLoop 判断 State 执行退出

 先不接活，后尽量干完手头的活（先关 boss 后关 worker：非百分百保证）
![](https://img-blog.csdnimg.cn/20201224143009104.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

打断点，主要看 workGroup 的关闭
- 这里就传入了两个时间![](https://img-blog.csdnimg.cn/20201224144059120.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 为啥两个时间呢？
- 一个为了优雅
**DEFAULT_SHUTDOWN_QUIET_PERIOD**
- 一个为了可控
**DEFAULT_SHUTDOWN_TIMEOUT**


从启动状态更改为终止态
![](https://img-blog.csdnimg.cn/20201224144902149.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
然后在 NioEventLoop 的判断关闭位置打断点
![](https://img-blog.csdnimg.cn/20201224145956947.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 有未完成的任务就执行，没有就结束。
![](https://img-blog.csdnimg.cn/20201224152537877.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 关闭服务的目的
关闭所有连接及Selector
- java.nio.channels.Selector#keys
	- java.nio.channels.spi.AbstractlnterruptibleChannel#close
	- java.nio.channels. SelectionKey#cancel
- selector.close()
![](https://img-blog.csdnimg.cn/20201224154403568.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

关闭所有线程：退出循环体`for (;;)`
