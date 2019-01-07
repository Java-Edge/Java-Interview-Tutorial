RPC框架主要组成：
- 通信框架
- 通信协议
- 序列化和反序列化格式

# 1 分类
RPC框架主要分为：
## 1.1 绑定语言平台
### 1.1.1 Dubbo
国内最早开源的RPC框架，由阿里巴巴公司开发并于2011年末对外开源，仅支持Java

#### 架构
![](https://img-blog.csdnimg.cn/20210110214650214.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- Consumer 服务消费者
- Provider 服务提供者
- Registry 注册中心
- Monitor是监控系统

#### 交互流程
- **Consumer**通过**Registry**获取到**Provider**节点
- 再通过Dubbo的客户端SDK与Provider建立连接，并发起调用
- **Provider**通过Dubbo的服务端SDK接收到**Consumer**请求
- 处理后再把结果返回给Consumer

服务消费者、提供者都需引入Dubbo的SDK才来完成RPC调用，因为Dubbo是用Java实现，所以要求服务消费者、提供者也都必须用Java。

#### 主要实现
- 默认采用Netty作为通信框架
- 除了支持私有的Dubbo协议外，还支持RMI、Hession、HTTP、Thrift
- 支持多种序列化格式，比如Dubbo、Hession、JSON、Kryo、FST
### 1.1.2 Motan
微博内部使用的RPC框架，于2016年对外开源，仅支持Java。

#### 架构
![](https://img-blog.csdnimg.cn/20210110215649170.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

与Dubbo类似，都要在Client端（服务消费者）和Server端（服务提供者）引入SDK
- register
和注册中心交互，包括注册服务、订阅服务、服务变更通知、服务心跳发送等功能。Server端会在系统初始化时通过register模块注册服务，Client端会在系统初始化时通过register模块订阅到具体提供服务的Server列表，当Server列表发生变更时也由register模块通知Client。
- protocol
用来进行RPC服务的描述和RPC服务的配置管理，这一层还可以添加不同功能的filter用来完成统计、并发限制等功能。
- serialize
将RPC请求中的参数、结果等对象进行序列化与反序列化，即进行对象与字节流的互相转换，默认使用对Java更友好的Hessian 2进行序列化。
- transport
用来进行远程通信，默认使用Netty NIO的TCP长链接方式。
- cluster
Client端使用的模块，cluster是一组可用的Server在逻辑上的封装，包含若干可以提供RPC服务的Server，实际请求时会根据不同的高可用与负载均衡策略选择一个可用的Server发起远程调用。
### 1.1.3 Spring Cloud
国外Pivotal公司2014年对外开源的RPC框架，仅支持Java，使用最广。

是为了解决微服务架构中服务治理而提供的一系列功能的开发框架，它是完全基于Spring Boot进行开发的，Spring Cloud利用Spring Boot特性整合了开源行业中优秀的组件，整体对外提供了一套在微服务架构中服务治理的解决方案。
#### 架构
![](https://img-blog.csdnimg.cn/20210110220638929.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

#### 交互流程
- 请求统一通过API网关Zuul来访问内部服务，先经过Token进行安全认证
- 通过安全认证后，网关Zuul从注册中心Eureka获取可用服务节点列表
- 从可用服务节点中选取一个可用节点，然后把请求分发到这个节点
- 整个请求过程中，Hystrix组件负责处理服务超时熔断，Turbine组件负责监控服务间的调用和熔断相关指标，Sleuth组件负责调用链监控，ELK负责日志分析

### 选型
Spring Cloud不仅提供了基本的RPC框架功能，还提供了服务注册组件、配置中心组件、负载均衡组件、断路器组件、分布式消息追踪组件等一系列组件，称为“Spring Cloud全家桶”。如果你不想自己实现以上这些功能，那么Spring Cloud基本可以满足你的全部需求。而Dubbo、Motan基本上只提供了最基础的RPC框架的功能，其他微服务组件都需要自己去实现。

不过由于Spring Cloud的RPC通信采用了HTTP协议，相比Dubbo和Motan所采用的私有协议来说，在高并发的通信场景下，性能相对要差一些，所以对性能有苛刻要求的情况下，可以考虑Dubbo和Motan。

## 1.2 跨语言平台
### 1.2.1 gRPC
Google于2015年对外开源的跨语言RPC框架。
支持C++、Java、Python、Go、Ruby、PHP、Android Java、Objective-C。

#### 原理
通过IDL（Interface Definition Language）文件定义服务接口的参数和返回值类型，然后通过代码生成程序生成服务端和客户端的具体实现代码，这样在gRPC里，客户端应用可以像调用本地对象一样调用另一台服务器上对应的方法。
![](https://img-blog.csdnimg.cn/20210110221911343.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

#### 特性
- 通信协议采用HTTP2，因其提供了连接复用、双向流、服务器推送、请求优先级、首部压缩等机制，所以在通信过程中可以节省带宽、降低TCP连接次数、节省CPU，尤其对于移动端应用来说，可以帮助延长电池寿命
- IDL使用了ProtoBuf，ProtoBuf是由Google开发的一种数据序列化协议，它的压缩和传输效率极高，语法也简单，所以被广泛应用在数据存储和通信协议上
- 多语言支持，能够基于多种语言自动生成对应语言的客户端和服务端的代码。
### 1.2.2 Thrift
最初是由Facebook开发的内部系统跨语言的RPC框架，2007年贡献给了Apache。轻量级的跨语言RPC通信方案，支持多达25种编程语言。为了支持多种语言，跟gRPC一样，Thrift也有一套自己的接口定义语言IDL，可以通过代码生成器，生成各种编程语言的Client端和Server端的SDK代码，这样就保证了不同语言之间可以相互通信。
#### 架构![](https://img-blog.csdnimg.cn/20210110222933934.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

#### 特性
- 序列化格式
Binary、Compact、JSON、Multiplexed等。
- 通信方式
Socket、Framed、File、Memory、zlib等。
- 服务端支持多种处理方式
Simple 、Thread Pool、Non-Blocking等。

### 选型
那么涉及跨语言的服务调用场景，到底该选择gRPC还是Thrift呢？

从成熟度上来讲，Thrift因为诞生的时间要早于gRPC，所以使用的范围要高于gRPC，在HBase、Hadoop、Scribe、Cassandra等许多开源组件中都得到了广泛地应用。而且Thrift支持多达25种语言，这要比gRPC支持的语言更多，所以如果遇到gRPC不支持的语言场景下，选择Thrift更合适。

但gRPC作为后起之秀，因为采用了HTTP/2作为通信协议、ProtoBuf作为数据序列化格式，在移动端设备的应用以及对传输带宽比较敏感的场景下具有很大的优势，而且开发文档丰富，根据ProtoBuf文件生成的代码要比Thrift更简洁一些，从使用难易程度上更占优势，所以如果使用的语言平台gRPC支持的话，建议还是采用gRPC比较好。

# 总结
所以若你的业务场景仅一种语言，可选择跟语言绑定的RPC框架
如果涉及多个语言平台之间的相互调用，必须选择跨语言平台的RPC框架。

支持多语言是RPC框架未来的发展趋势。正是基于此判断，各个RPC框架都提供了Sidecar组件来支持多语言平台之间的RPC调用。

Dubbo也引入Sidecar组件来构建Dubbo Mesh提供多语言支持，如 dubbo-go。
Motan也开源了其内部的Sidecar组件：Motan-go，目前支持PHP、Java语言之间的相互调用。
Spring Cloud也提供了Sidecar组件spring-cloud-netflix-sideca，可以让其他语言也可以使用Spring Cloud的组件。

所以语言不会成为使用上面这几种RPC框架的约束，而gRPC和Thrift虽然支持跨语言的RPC调用，但是因为它们只提供了最基本的RPC框架功能，缺乏一系列配套的服务化组件和服务治理功能的支撑，所以使用它们作为跨语言调用的RPC框架，就需要自己考虑注册中心、熔断、限流、监控、分布式追踪等功能的实现，不过好在大多数功能都有开源实现，可以直接采用。