# 分布式服务化与 SOA/ESB 区别
服务汇聚到ESB：
- 暴露和调用
- 增强和中介
- 统计和监控

分布式服务化作为SOA的另一种选择，以不同方式把ESB的一些功能重做了一遍。
SOA/ESB：代理调用，直接增强。
# 1 RPC是什么
RPC，Remote Procedure Call，远程`过程`调用。
`过程` 就是业务处理、计算任务，也就是程序，像调用本地方法一样调用远程方法。

RPC的概念与技术早在1981年由Nelson提出。1984年，Birrell和Nelson把其用于支持异构型分布式系统间的通讯。Birrell的RPC 模型引入存根进程( stub) 作为远程的本地代理，调用RPC运行时库来传输网络中的调用。
Stub和RPC runtime屏蔽了网络调用所涉及的许多细节，特别是，参数的编码/译码及网络通讯是由stub和RPC runtime完成的，因此这一模式被各类RPC所采用。

这到底是如何能做到本地方法调用时转换成远程呢？
RPC采用Client-Server结构，通过request-response消息模式实现。

- RPC VS RMI
RMI，remote method invocation，远程方法调用是OOP领域中RPC的一种具体实现。

- webservice、restfull接口调用是RPC吗?
都是RPC，仅消息的组织方式及消息协议不同。

远程过程调用较本地调用区别：
- 速度相对慢
- 可靠性减弱

# RPC原理
```java
// 本地
UserService service = new UserService();
User user = service.findById(1);

// RPC
UserService service = Rpcfx.create(UserService.class, url);
User user = service.findById(1);
```
![](https://img-blog.csdnimg.cn/20191114011312532.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

1. 客户端处理过程中`调用`Client stub (就像调用本地方法一样)，传递参数
2. Client stub将参数`编组`为消息，然后通过系统调用向服务端发送消息
3. 客户端本地操作系统将消息从客户端机器`发送`到服务端机器
4. 服务端操作系统将接收到的数据包`传递`给Server stub
5. Server stub `解组`消息为参数
6. Sever stub`再调用`服务端的过程，过程执行结果以反方向的相同步骤响应给客户端

核心是代理机制：
1. 本地代理存根Stub，通过动态代理或 AOP 拦截请求
2. 本地序列化反序列化
3. 网络通信
4. 远程序列化反序列化
5. 远程服务存根Skeleton
6. 调用实际业务服务
7. 原路返回服务结果
8. 返回给本地调用方
![](https://img-blog.csdnimg.cn/20210217185336743.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


流程需要解决什么问题呢?
# 3 RPC协议
RPC调用过程中需要将参数编组为消息进行发送，接收方需要解组消息为参数，过程处理结果同样需要经编组、解组。

消息由哪些部分构成及消息的表示形式就构成了消息协议。
`RPC调用过程中采用的消息协议称为RPC协议。`

RPC协议规定请求、响应消息的格式在TCP (网络传输控制协议)上可选用或自定义消息协议来完成RPC消息交互

我们可以选用通用的标准协议(如: http、 https) ，也可根据自身的需要定义自己的消息协议!

- 常见的RPC协议
![](https://img-blog.csdnimg.cn/20191114130245795.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 4 RPC框架(Java领域)
封装好参数编组、消息解组、底层网络通信的RPC程序开发框架，带来的便捷是可以直接在其基础上只需专注于过程代码编写。

➢ 传统的webservice框架
- Apache CXF
![](https://img-blog.csdnimg.cn/20191114130600432.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Apache Axis2
![](https://img-blog.csdnimg.cn/20191114130702279.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Java 自带的JAX-WS
![](https://img-blog.csdnimg.cn/20191114130758130.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
webService框架大多基于标准的SOAP协议。

➢ 新兴的微服务框架:
 
- Dubbo
![](https://img-blog.csdnimg.cn/20191114130841739.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- spring cloud alibaba
![](https://img-blog.csdnimg.cn/20191114131014282.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Apache Thrift
![](https://img-blog.csdnimg.cn/20191114131042186.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## 为何使用RPC
- 服务化
- 可重用
- 系统间交互调用
# 5 RPC相关术语
- Client、 Server、 calls、 replies、service、programs、procedures、version、marshalling(编组)、unmarshalling(解组)
- 一个网络服务由一个或多个远程程序集构成
- 一个远程程序实现一个或多个远程过程
- 过程、过程的参数、结果在程序协议说明书中定义说明
- 为兼容程序协议变更、一个服务端可能支持多个版本的远程程序