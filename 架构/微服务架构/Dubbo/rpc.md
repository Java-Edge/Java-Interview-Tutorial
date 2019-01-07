# 1 RPC是什么
![](https://img-blog.csdnimg.cn/20191114010847975.png)
remote procedure call (RPC) :远程`过程`调用

`过程` 就是业务处理、计算任务，更直白理解，就是程序。(像调用本地方法一样调用远程的过程。)

RPC采用Client-Server结构，通过request-response消息模式实现。

## 1.1 RPC VS RMI
RMI(remote method invocation)远程方法调用是oop领域中RPC的一种具体实现。

## 1.2 webservice、restfull接 口调用是RPC吗?
都是RPC,仅消息的组织方式及消息协议不同。

## 1.3 远程过程调用较本地调用有何不同?
- 速度相对慢
- 可靠性减弱

# 2 RPC的流程环节
![](https://img-blog.csdnimg.cn/20191114011312532.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

1. 客户端处理过程中`调用`Client stub (就像调用本地方法一样)，传递参数
2. Client stub将参数`编组`为消息，然后通过系统调用向服务端发送消息
3. 客户端本地操作系统将消息从客户端机器`发送`到服务端机器
4. 服务端操作系统将接收到的数据包`传递`给Server stub
5. Server stub `解组`消息为参数
6. Sever stub`再调用`服务端的过程，过程执行结果以反方向的相同步骤响应给客户端

流程需要解决什么问题呢?
# 3 RPC协议
RPC调用过程中需要将参数编组为消息进行发送，接收方需要解组消息为参数，过程处理结果同样需要经编组、解组。

消息由哪些部分构成及消息的表示形式就构成了消息协议。
`RPC调用过程中采用的消息协议称为RPC协议。`

RPC协议规定请求、响应消息的格式在TCP (网络传输控制协议)上可选用或自定义消息协议来完成RPC消息交互

我们可以选用通用的标准协议(如: http、 https) ，也可根据自身的需要定义自己的消息协议!

- 常见的RPC协议
![](https://img-blog.csdnimg.cn/20191114130245795.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

# 4 RPC框架(Java领域)
封装好参数编组、消息解组、底层网络通信的RPC程序开发框架，带来的便捷是可以直接在其基础上只需专注于过程代码编写。

➢ 传统的webservice框架
- Apache CXF
![](https://img-blog.csdnimg.cn/20191114130600432.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- Apache Axis2
![](https://img-blog.csdnimg.cn/20191114130702279.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- Java 自带的JAX-WS
![](https://img-blog.csdnimg.cn/20191114130758130.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
webService框架大多基于标准的SOAP协议。

➢ 新兴的微服务框架:
 
- Dubbo
![](https://img-blog.csdnimg.cn/20191114130841739.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- spring cloud alibaba
![](https://img-blog.csdnimg.cn/20191114131014282.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- Apache Thrift
![](https://img-blog.csdnimg.cn/20191114131042186.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
## 为何使用RPC
- 服务化
- 可重用
- 系统间交互调用
# 5 RPC相关术语
➢ Client、 Server、 calls、 replies、 service,  programs, procedures, version, marshalling(编组), unmarshalling(解组)
➢ 一个网络服务由一个或多个远程程序集构成
➢ 一个远程程序实现一个或多个远程过程
➢ 过程、过程的参数、结果在程序协议说明书中定义说明
➢ 为兼容程序协议变更、一个服务端可能支持多个版本的远程程序


- 欢迎扫码关注,掌握更多核心技术
 ![](https://img-blog.csdnimg.cn/20191114131953666.jpg)