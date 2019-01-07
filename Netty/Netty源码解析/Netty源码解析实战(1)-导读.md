# 1 简介
Netty 由其作者 Trustin Lee
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200506020243622.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


 在 2008 年提交第一个commit至今，转眼间已经走过了十二年。
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020050602013649.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
Netty 本身是基于 Java 中 NIO 接口能力进行封装而成的框架。对 NIO 的学习和掌握是不可避免的。
可以熟练的使用框架进行业务的开发，仅仅只是学习刚开了一个头。只有深入到框架的内部，对一个结果的背后都了解了“为什么”，“是什么”，“怎么样”，才能算对框架实现了掌握。而到了这一步，深入的探究源码是最好的手段。

# 2 什么是 Netty
- 异步事件驱动框架,可快速开发高性能的服务端和客户端
- 封装了JDK底层BIO和NIO模型，提供更加简单易用安全的 API
- 自带编解码器解决拆包粘包问题，无需用户困扰
-  reactor线程模型支持高并发海量连接
- 自带各种协议栈

# 3 Netty 的特点
- 设计
针对多种传输类型的统一接口 - 阻塞和非阻塞
简单但更强大的线程模型
真正的无连接的数据报套接字支持
链接逻辑支持复用
- 易用性
大量的 Javadoc 和 代码实例
除了在 JDK 1.6 + 额外的限制。（一些特征是只支持在Java 1.7 +。可选的功能可能有额外的限制。）
- 性能
比核心 Java API 更好的吞吐量，较低的延时
资源消耗更少，这个得益于共享池和重用
减少内存拷贝
- 健壮性
消除由于慢，快，或重载连接产生的 OutOfMemoryError
消除经常发现在 NIO 在高速网络中的应用中的不公平的读/写比
- 安全
完整的 SSL / TLS 和 StartTLS 的支持
运行在受限的环境例如 Applet 或 OSGI
- 社区
发布的更早和更频繁
社区驱动

# 4 为什么要研究 Netty

- 各大开源项目选择Netty作为底层通信框架
- 更好的使用,少走弯路
- 遇到bug ?单机连接数上不去?性能遇到瓶颈?如何调优?
- reactor线程模型
- 庞大的项目是如何组织的 ,设计模式,体验优秀的设计