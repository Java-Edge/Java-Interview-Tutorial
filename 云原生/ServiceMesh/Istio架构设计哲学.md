# 架构设计
## 1.0架构
![](https://img-blog.csdnimg.cn/20210131154633344.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
Istio 服务网格从逻辑上分为数据平面和控制平面。
### 数据平面
由一组智能代理（Envoy）组成，被部署为 sidecar。这些代理负责协调和控制微服务之间的所有网络通信。他们还收集和报告所有网格流量的遥测数据。
#### Envoy
sidecar集合。Istio 使用 Envoy 代理的扩展版本。Envoy 是用 C++ 开发的高性能代理，用于协调服务网格中所有服务的入站和出站流量。Envoy 代理是唯一与数据平面流量交互的 Istio 组件。

Envoy 代理被部署为服务的 sidecar，在逻辑上为服务增加了 Envoy 的许多内置特性，例如:
动态服务发现
负载均衡
TLS 终端
HTTP/2 与 gRPC 代理
熔断器
健康检查
基于百分比流量分割的分阶段发布
故障注入
丰富的指标
这种 sidecar 部署允许 Istio 提取大量关于流量行为的信号作为属性。Istio 可以使用这些属性来实施策略决策，并将其发送到监视系统以提供有关整个网格行为的信息。

sidecar 代理模型还允许您向现有的部署添加 Istio 功能，而不需要重新设计架构或重写代码。您可以在设计目标中读到更多关于为什么我们选择这种方法的信息。

由 Envoy 代理启用的一些 Istio 的功能和任务包括:
流量控制功能：通过丰富的 HTTP、gRPC、WebSocket 和 TCP 流量路由规则来执行细粒度的流量控制。
网络弹性特性：重试设置、故障转移、熔断器和故障注入。
安全性和身份验证特性：执行安全性策略以及通过配置 API 定义的访问控制和速率限制。
基于 WebAssembly 的可插拔扩展模型，允许通过自定义策略实施和生成网格流量的遥测。

### 控制平面
管理并配置代理来进行流量路由。
- Pilot，负责将配置分发给 sidecar 组件
- Citadel，负责安全
- Mixer，负责遥测和策略，一种插件模型。但存在问题：
需要和数据平面进行两次通信，但其又是单独部署的进程外的组件，所以每次请求都要和进程外进行通信，降低整个请求的性能。插件模型虽然带来很好的扩展性，但也产生耦合：当需要添加新插件或修改已有插件，都要重新部署 mixer。所以下一版本就需要解耦

Istio 中的流量分为数据平面流量和控制平面流量。数据平面流量是指工作负载的业务逻辑发送和接收的消息。控制平面流量是指在 Istio 组件之间发送的配置和控制消息用来编排网格的行为。Istio 中的流量管理特指数据平面流量。
## 1.1 
![](https://img-blog.csdnimg.cn/20210131155633303.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
### 变化
adapter：
mixer 增加了一个进程外的 adapter概念，即把原来集成在组件内部的插件变成了进程外的一个适配器，如此，当你需要修改插件时，无需修改 mixer本身。

gallery：
负责 istio 的配置验证，提取处理和分发，这些原本都是 pilot 的功能，但他们会导致 pilot 和底层的平台比如 k8s 耦合。

### 缺点
- 性能
插件又拆分，导致网络请求次数又增加
- 易用性
组件都需要单独部署，维护困难。

可见解耦虽好，但也不是银弹，我们始终还得坚持软件架构的取舍原则！
MVP 理论：开发团队通过提供最小化可行产品，获取用户反馈，并在最小化可行产品上持续地进行迭代直到产品达到一个相对稳定的状态。

## 回归单体
复杂是万恶之源，学会停止焦虑，爱上单体一Istio 开发团队
修正原有架构的复杂性：
- 维护性
- 多组件分离的必要性
- 伸缩性
- 安全性

![](https://img-blog.csdnimg.cn/2021013116160920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)