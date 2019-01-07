# 1 从使用者考虑

用，户使用RPC框架开发过程时需要做什么?

- 定义过程接口
![](https://img-blog.csdnimg.cn/20191114132816733.png)
- 服务端实现过程
- 客户端使用生成的stub代理对象
![](https://img-blog.csdnimg.cn/20191114132906197.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

# 2 设计客户端
客户端生成过程接口的代理对象
设计客户端代理工厂，用JDK动态代理即可生成接口的代理对象。
![](https://img-blog.csdnimg.cn/20191114132958985.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

## 思考
1、在ClientStubInvocationHandler中 需完成哪些事情?
![](https://img-blog.csdnimg.cn/2019111413331941.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

2、将请求的内容编组为消息这件事由谁来做?
![](https://img-blog.csdnimg.cn/20191114133337475.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

3、消息协议是固定不变的吗?它与什么有关?
看框架对协议的支持广度，如果支持多种协议，就是会灵活变化的，它与具体的服务相关，
A服务提供者可能选用的是协议1，B服务提供者可能选用协议2。


4、某服务是用的什么消息协议这个信息从哪来?
从获取的服务信息中来，因此需要一个服务信息发现者。

`把发现者设计出来, 要求:可灵活支持多种发现机制`

![](https://img-blog.csdnimg.cn/20191115003249371.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2019111500530155.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
5、我们想要做到可以支持多种协议，我们的类该如何设计?
面向接口、策略模式、组合
![](https://img-blog.csdnimg.cn/20191115005522357.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 问题:
➢ marshalling和unmarshalling方法该定义怎样的参数与返回值?
➢ 编组、解组的操作对象是请求、响应，请求、响应的内容是不同的。编组、解组两个方法是否满足?

## 设计客户端协议层

6. 定义框架标准的请求, 响应类

![](https://img-blog.csdnimg.cn/20191115005858703.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

7. 将协议层扩展为四个![](https://img-blog.csdnimg.cn/20191115010053143.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
消息协议独立为一层(客户端、服务端均需要)

网络层
发送请求,获得响应  
要发起网络请求,则须知道服务地址
![](https://img-blog.csdnimg.cn/20191115123239178.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

- 客户端完整类图
![](https://img-blog.csdnimg.cn/20191115123823652.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
实现客户端
按照类图设计，填码!
看ClientStubProxyFactory核心类的代码示例!

在实现过程中，协议层涉及一个重要概念
- 参数序列化、反序列


#  3 设计服务端
## 3.1 RPCServer
客户端请求过来了，服务端首先需要通过RPCServer接收请求。
![](https://img-blog.csdnimg.cn/20191115235722470.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20191115235736165.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

- RPCServer
![](https://img-blog.csdnimg.cn/20191116001129440.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

## 3.2 思考
RPCServer接收到客户端请求后，还需要做哪些工作?
![](https://img-blog.csdnimg.cn/20191115235943756.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

网络层在RPCServer中提供多线程来处理请求，消息协议层复用客户端设计的。
(设计一个`请求处理类`，来完成网络层以上的事情。)

## 3.3 RequestHandler
RPCServer接收到请求后，将请求交给RequestHandler来处理
RequestHandler调用协议层来解组请求消息为Request对象，然后调用过程!
![](https://img-blog.csdnimg.cn/20191116000813865.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

### 人性的拷问
➢ RequestHandler如何得到过程对象?
➢ Request中有什么?
➢ 服务名、方法名、参数类型、参数值
➢ 是否需要一个过程注册模块?

看看之后的设计
![](https://img-blog.csdnimg.cn/20191116002808402.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

➢ `过程注册模块`:让用户将他们的过程注册到RPC框架
➢ `过程暴露模块`:想对外发布(暴露)服务注册、暴露可以由同一个类实现

![](https://img-blog.csdnimg.cn/20191116003017951.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

1. RPCServer 中实现网络层: Netty, 使用RequestHandler
2. ServiceRegister 模块实现服务注册、发布。
3. RequestHandler 中实现消息协议处理、过程调用

## 代码实现
- 首先,用户需要设置你的端口和协议哦
![](https://img-blog.csdnimg.cn/20191116003532999.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)


![](https://img-blog.csdnimg.cn/20191116003822920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)