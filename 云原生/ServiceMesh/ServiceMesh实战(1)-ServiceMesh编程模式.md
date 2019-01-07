# 1 微服务架构的挑战
## 1.1 网络通信
- 服务间网络通信
![](https://img-blog.csdnimg.cn/20210129185147719.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
### 分布式计算的8个谬论
Fallacies of Distributed Computing Explained：
- 网络是可靠的
- 网络延迟是0
- 带宽是无限的
- 网络是安全的
- 网络拓扑从不改变
- 只有一个管理员
- 传输成本是0
- 网络是同构的

为啥会有这些明显不现实的悖论呢？因为我们开发人员就是这样很少考虑网络问题，这都是我们对网络的极度幻想！

### 如何管理和控制服务间的通信
- 服务注册、发现
- 路由，流量转移
- 弹性能力（熔断、超时、重试）
- 安全
- 可监控

# 2 Service Mesh演进史
## 2.1 远古 - 控制逻辑和业务逻辑耦合
- 人们没有形成对网络控制逻辑的完整思路，导致总是在业务逻辑中添加一些网络控制逻辑，导致逻辑耦合，代码难以维护！
![](https://img-blog.csdnimg.cn/20210129191057344.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20210129190926790.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
服务发现（Service discovery ）是自动找到满足给定查询请求的服务实例的过程。例如名为Teams的服务需要查找将属性环境设置为生产的名为Players的服务的实例。您将调用一些服务发现过程，该过程将返回合适的服务器列表。对于更多的整体架构，这是一个简单的任务，通常使用DNS，负载均衡器以及一些关于端口号的约定来实现（例如，所有服务将其HTTP服务器绑定到端口8080）。
在更加分散的环境中，任务开始变得越来越复杂，以前可以盲目地依靠其DNS查找来找到依赖关系的服务现在必须处理诸如客户端负载平衡，多个不同环境（例如，登台与生产） ），地理位置分散的服务器等。如果之前只需要一行代码来解析主机名，那么现在您的服务就需要很多样板代码来处理更高版本所带来的各种情况。

断路器是Michael Nygard在他的书Release It中分类的一种模式。Martin Fowler对该模式的总结：
> 断路器的基本原理非常简单。将受保护的方法调用包装在断路器对象，该对象将监视故障。一旦故障达到阈值，断路器将跳闸，并且所有对该断路器的进一步调用都会返回错误，而根本不会进行受保护的调用。通常，如果断路器跳闸，您还需要某种监视器警报。

这些非常简单的设备可为你的服务之间的交互增加更多的可靠性。但随分布水平提高，它们往往会变得更加复杂。系统中出现问题的可能性随着分布的增加而呈指数级增长，因此，即使诸如“断路器跳闸时出现某种监视器警报”之类的简单事情也不一定变得简单明了。一个组件中的一个故障会在许多客户端和客户端的客户端之间造成一连串的影响，从而触发数千个电路同时跳闸。过去仅需几行代码，现在又需要样板代码来处理仅在这个新世界中存在的情况。

实际上，上面列出的两个示例很难正确实现，以至于大型，复杂的库（如Twitter的Finagle和Facebook的Proxygen）非常受欢迎，因为它避免在每个服务中重写相同逻辑。


## 2.2 公共库
- 公共库把这些网络管控的功能整合成一个个单独的工具包，独立部署，解决了耦合。
![](https://img-blog.csdnimg.cn/20210130174816630.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
该模型被大多数开创了微服务架构的组织所采用，例如Netflix，Twitter和SoundCloud。
### 好处
- 解耦
- 消除重复

但随着系统中服务数量的增加，发现了此模型的
### 缺点
- 组织仍需要花费其工程团队的时间来建立将库与其他生态系统联系起来的粘合剂。有时，这笔费用是明确的，因为工程师被分配到了专门负责构建工具的团队中，但是价格标签通常是不可见的，因为随着您花费时间在产品上工作，价格标签会逐渐显现出来
- 限制了可用于微服务的工具，运行时和语言。微服务库通常是为特定平台编写的，无论是编程语言还是运行时（如JVM）。如果组织使用的平台不是库支持的平台，则通常需要将代码移植到新平台本身。这浪费了宝贵的工程时间。工程师不必再致力于核心业务和产品，而必须再次构建工具和基础架构。这就是为什么诸如SoundCloud和DigitalOcean之类的中型组织决定仅支持其内部服务的一个平台的原因，分别是Scala和Go
- 治理。库模型可以抽象化解决微服务体系结构需求所需的功能的实现，但是它本身仍然是需要维护的组件。确保成千上万的服务实例使用相同或至少兼容的库版本并非易事，并且每次更新都意味着集成，测试和重新部署所有服务-即使该服务本身未遭受任何损害更改。


## 2.3 下一代架构
与我们在网络栈中看到的类似，非常需要将大规模分布式服务所需的功能提取到基础平台中。
![](https://img-blog.csdnimg.cn/20210130182804829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
人们使用HTTP等高级协议编写应用程序和服务，而无需考虑TCP如何控制其网络上的数据包。这种情况正是微服务所需要的，工程师可以专注业务逻辑，避免浪费时间编写自己的服务基础结构代码或管理整个团队中的库和框架。


不幸的是，更改网络栈以添加此层并不可行。

许多从业人员发现的解决方案是将其作为一组代理来实现。即服务不会直接连接到其下游依赖，而是所有流量都将通过一小段软件透明地添加所需的功能。

在该领域中最早记录在案的发展使用了sidecar的概念。sidecar是在你的应用旁边运行并为其提供附加功能的辅助进程。 2013年，Airbnb撰写了有关Synapse和Nerve的开源文件，其中包括Sidecar的开源实现。一年后，Netflix推出了Prana，这是一种辅助工具，致力于允许非JVM应用程序从其NetflixOSS生态系统中受益。
## 2.4 sidecar
![](https://img-blog.csdnimg.cn/20210130184333528.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
其实这种模式很早就出现了，比如 k8s 的 pod部署多个容器，其一就是处理日志的filebeat，其本质就是个 sidecar，只不过我们一般都是部署一个处理网络请求的 sidecar。
至此，已经很接近 service mesh 了。

尽管有许多此类开源代理实现，但它们往往旨在与特定的基础结构组件一起使用。例如服务发现，Airbnb的Nerve＆Synapse假定服务已在Zookeeper中注册，而对于Prana，则应使用Netflix自己的Eureka服务注册表。

随着微服务架构的日益普及，我们最近看到了新一轮的代理浪潮，这些代理足够灵活以适应不同的基础架构组件和偏好。这个领域的第一个广为人知的系统是Linkerd，它是由Buoyant根据工程师在Twitter微服务平台上的先前工作创建的。很快，Lyft的工程团队发布了Envoy，它遵循类似的原则。
##  2.5 战至终章 - Service Mesh
在这种模型中，你的每个服务都将有一个伴随代理服务。鉴于服务仅通过Sidecar代理相互通信，因此我们最终得到了类似于下图的部署，可以说就是 sidecar 的网络拓扑组合。
![](https://img-blog.csdnimg.cn/20210130185202640.png)
![](https://img-blog.csdnimg.cn/20210130185225646.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

### 定义
Buoyant的CEO William Morgan 指出，代理之间的互连形成了网状网络（mesh network）。 2017年初，William为该平台编写了一个定义，并将其称为Service Mesh：
服务网格是用于处理服务到服务之间通信的**基础设施层**。它主要负责在现代的云原生应用这种复杂的服务拓扑场景下，进行可靠地**请求分发**。实际上，它通常被实现为一组轻量级的**网络代理**，部署在你的应用代码旁边，**并且对你的应用程序完全透明**。

他的定义中最有力的方面可能是，它摆脱了将代理视为独立组件的想法，并认识到它们形成的网络本身就是有价值的东西。
![](https://img-blog.csdnimg.cn/20210130190349989.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 2.6 你以为结束了?其实才刚开始-Service Mesh V2
随着人们将其微服务部署移至更复杂的运行时（如Kubernetes和Mesos），人们已开始使用这些平台提供的工具来正确实现网状网络的想法。他们正从一组独立工作的独立代理转移到一个适当的，集中式的控制平面。
![](https://img-blog.csdnimg.cn/20210130190548117.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
纵观我们的鸟瞰图，我们看到实际的服务流量仍然直接从代理流向代理，但是控制平面知道每个代理实例。控制平面使代理可以实现访问控制和指标收集之类的事情，这需要合作：
![](https://img-blog.csdnimg.cn/20210130190613379.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
最近开源的Istio项目是此类系统的最突出示例。

# 3 ServiceMesh 的功能
## 流量控制
路由：
蓝绿部署
灰度发布
A/B测试

流量转移
超时重试
熔断
故障注入
流量镜像

## 策略
流量控制
黑白名单
## 网络安全
授权及身份认证
## 可观察性
指标收集和展示
日志收集
分布式追踪

# 4 辨析
## 4.1 V.S k8s
### k8s
负责容器编排调度，本质是管理应用的生命周期，即调度器。给予Service Mesh支持和帮助，因为其 pod 是最小的调度单元，先天支持多容器的部署，便于植入 sidecar 服务。
### Service Mesh
解决服务间网络通信问题，本质上是管理服务通信，即代理。是对 k8s 网络功能方面的扩展延伸

## 4.2 V.S API网关
### API 网关
- API网关实际上部署在应用的边界，没有侵入到应用内部，主要是对内部的 API 进行聚合和抽象以方便外部的调用，对流量进行抽象。
![](https://img-blog.csdnimg.cn/20210131143829274.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

API网关有负载均衡、服务发现、流量控制等作用。
### Service Mesh

- 由Sidecar完全接管发送到应用的请求，处理完成之后再发送到另外的微服务，是对应用内部的网络细节进行描述。![](https://img-blog.csdnimg.cn/20210131143739279.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

所以综合来看，功能有重叠，但角色不同。Service Mesh在应用内，API网关在应用之上(边界)。

# 5 Service Mesh标准
## UDPA ( Universal Data Plane API )
统一数据平面 API，为不同的数据平面提供统一的 API，方便你的无缝接入，比如 Envoy、Linkerd等数据平面。有了 UDPA 就无需关心他们的实现细节，按标准接入即可。 该标准由云原生基金会提出。
![](https://img-blog.csdnimg.cn/20210131144215657.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## SMI ( Service Mesh Interface )
侧重于数据控制平面，为用户提供一个统一的使用体验。 你也发现了，Google 和 aws 并没有参与。![](https://img-blog.csdnimg.cn/20210131144225957.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# Service Mesh产品发展史
![](https://img-blog.csdnimg.cn/20210131145554362.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
## Linkerd
第一个Service Mesh产品
2016年底在GitHub发布 0x
2017年加入CNCF，4月发布1.0版本
Conduit - Linkerd2.0: 支持 k8s，轻量级，但是用的 rust，没人会，没人用，无疾而终。
## Envoy
2016年9月发布，定位Sidecar代理，第3个从CNCF毕业的产品。
稳定可靠，性能出众，Istio的默认数据平面，xDS协议成为数据平面的事实标准。

## Istio
2017年5月发布0.1版本，主角光环：Google, IBM，Lyft 背书。第二代Service Mesh，增加了控制平面，奠定目前Service Mesh的产品形态。
收购Envoy，直接拥有高水准的数据平面，受到社区强烈追捧。

## AWS App Mesh
- 2018年re:Invent公布
- 2019年4月GA发布
- 支持自家的多种计算资源的部署
![](https://img-blog.csdnimg.cn/20210131150603901.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## 国内现状
- 蚂蚁金服: SOFA Mesh, MOSN数据平面
- 几大云厂商(腾讯、阿里、百度)
- 华为、微博

## 国际竞争
- 构建云原生应用的重要一环，巨头云厂商都很重视(市场考虑)
![](https://img-blog.csdnimg.cn/20210131151105655.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)



# 总结
![](https://img-blog.csdnimg.cn/20210130190442747.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
全面理解ServiceMesh在大规模系统中的影响还为时过早。总之这种方法有两个好处
- 不必编写定制软件来处理微服务体系结构的最终商品代码，这将使许多小型组织可以享受以前仅大型企业才能使用的功能，从而创建各种有趣的用例
- 这种体系结构可能使我们最终实现使用最佳工具/语言完成工作的梦想，而不必担心每个平台的库和模式的可用性

> 参考
> - https://philcalcado.com/2017/08/03/pattern_service_mesh.html
> - https://medium.com/airbnb-engineering/smartstack-service-discovery-in-the-cloud-4b8a080de619
> - https://netflixtechblog.com/prana-a-sidecar-for-your-netflix-paas-based-applications-and-services-258a5790a015
> - https://buoyant.io/2020/10/12/what-is-a-service-mesh/