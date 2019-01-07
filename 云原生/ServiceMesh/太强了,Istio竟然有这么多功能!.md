# 1 简介
Istio，希腊语，意扬帆起航。
![](https://img-blog.csdnimg.cn/20210131152226973.png)

一个完全开源的**服务网格**产品，对分布式应用是透明的。Istio 管理服务之间的流量，实施访问政策并汇总遥测数据，而不需要更改应用代码。Istio 以透明的方式对现有分布式应用进行分层，从而简化了部署复杂性。

也是一个平台，可与任何日志、遥测和策略系统集成。
服务于微服务架构，并提供保护、连接和监控微服务的统一方法。

在原有的数据平面的基础上，增加了控制平面。

## 为什么会火
- 发布及时(2017年5月发布0.1版本)
- 巨头厂商buff 加持
- 第二代Service Mesh
- Envoy的加入让Istio如虎添翼
- 功能强大

## 优点
- 轻松构建服务网格
- 应用代码无需更改
- 功能强大

# 2 核心功能
## 2.1 流量控制
路由、流量转移
流量进出
网络弹性能力
测试相关

### 2.1.1 核心资源(CRD) 
虚拟服务（Virtual Service） 和目标规则（Destination Rule） 是 Istio 流量路由功能的关键拼图。
#### 2.1.1.1 虚拟服务( Virtual Service )
![](https://img-blog.csdnimg.cn/20210131163938411.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

虚拟服务让你配置如何在服务网格内将请求路由到服务，这基于 Istio 和平台提供的基本的连通性和服务发现能力。每个虚拟服务包含一组路由规则，Istio 按顺序评估它们，Istio 将每个给定的请求匹配到虚拟服务指定的实际目标地址。您的网格可以有多个虚拟服务，也可以没有，取决于使用场景。

- 将流量路由到给定目标地址
- 请求地址与真实的工作负载解耦
- 包含一组路由规则
- 通常和目标规则( Destination Rule)成对出现
- 丰富的路由匹配规则

####  2.1.1.2 目标规则( Destination Rule)
定义虚拟服务路由目标地址的真实地址，即子集。
设置负载均衡的方式
- 随机
- 权重
- 最少请求数

####  2.1.1.3 网关(Gateway)
![](https://img-blog.csdnimg.cn/20210131170442239.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
> Egress 不一定使用。


#### 服务入口 (Service Entry)
- 使用服务入口（Service Entry） 来添加一个入口到 Istio 内部维护的服务注册中心，即把外部服务注册到网格中。
![](https://img-blog.csdnimg.cn/20210131170618942.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
添加了服务入口后，Envoy 代理可以向服务发送流量，就好像它是网格内部的服务一样。

配置服务入口允许您管理运行在网格外的服务的流量，它包括以下几种能力：
- 为外部目标 redirect 和转发请求，例如来自 web 端的 API 调用，或者流向遗留老系统的服务。
- 为外部目标定义重试、超时和故障注入策略。
- 添加一个运行在虚拟机的服务来扩展您的网格。
- 从逻辑上添加来自不同集群的服务到网格，在 Kubernetes 上实现一个多集群 Istio 网格。

你不需要为网格服务要使用的每个外部服务都添加服务入口。默认情况下，Istio 配置 Envoy 代理将请求传递给未知服务。但是，您不能使用 Istio 的特性来控制没有在网格中注册的目标流量。
#### Sidecar
![](https://img-blog.csdnimg.cn/20210131170830502.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
默认情况下，Istio 让每个 Envoy 代理都可以访问来自和它关联的工作负载的所有端口的请求，然后转发到对应的工作负载。您可以使用 sidecar 配置去做下面的事情：
- 微调 Envoy 代理接受的端口和协议集。
- 限制 Envoy 代理可以访问的服务集合。

你可能希望在较庞大的应用程序中限制这样的 sidecar 可达性，配置每个代理能访问网格中的任意服务可能会因为高内存使用量而影响网格的性能。

您可以指定将 sidecar 配置应用于特定命名空间中的所有工作负载，或者使用 workloadSelector 选择特定的工作负载。

### 2.1.2 网络弹性和测试
除了为你的网格导流，Istio 还提供了可选的故障恢复和故障注入功能，使你可以在运行时动态配置这些功能。使用这些特性可以让应用程序运行稳定，确保服务网格能够容忍故障节点，并防止局部故障级联影响到其他节点。
#### 超时
超时是 Envoy 代理等待来自给定服务的答复的时间量，以确保服务不会因为等待答复而无限期的挂起，并在可预测的时间范围内调用成功或失败。HTTP 请求的默认超时时间是 15 秒，这意味着如果服务在 15 秒内没有响应，调用将失败。

对于某些应用程序和服务，Istio 的缺省超时可能不合适。例如，超时太长可能会由于等待失败服务的回复而导致过度的延迟；而超时过短则可能在等待涉及多个服务返回的操作时触发不必要地失败。为了找到并使用最佳超时设置，Istio 允许您使用虚拟服务按服务轻松地动态调整超时，而不必修改您的业务代码。

#### 重试
重试设置指定如果初始调用失败，Envoy 代理尝试连接服务的最大次数。通过确保调用不会因为临时过载的服务或网络等问题而永久失败，重试可以提高服务可用性和应用程序的性能。重试之间的间隔（25ms+）是可变的，并由 Istio 自动确定，从而防止被调用服务被请求淹没。HTTP 请求的默认重试行为是在返回错误之前重试两次。

与超时一样，Istio 默认的重试行为在延迟方面可能不适合您的应用程序需求（对失败的服务进行过多的重试会降低速度）或可用性。您可以在虚拟服务中按服务调整重试设置，而不必修改业务代码。您还可以通过添加每次重试的超时来进一步细化重试行为，并指定每次重试都试图成功连接到服务所等待的时间量。

#### 熔断器
熔断器是 Istio 为创建具有弹性的微服务应用提供的另一个有用的机制。在熔断器中，设置一个对服务中的单个主机调用的限制，例如并发连接的数量或对该主机调用失败的次数。一旦限制被触发，熔断器就会“跳闸”并停止连接到该主机。使用熔断模式可以快速失败而不必让客户端尝试连接到过载或有故障的主机。

熔断适用于在负载均衡池中的“真实”网格目标地址，您可以在目标规则中配置熔断器阈值，让配置适用于服务中的每个主机
#### 故障注入
在配置了网络，包括故障恢复策略之后，可使用 Istio 的故障注入机制来为整个应用程序测试故障恢复能力。故障注入是一种将错误引入系统以确保系统能够承受并从错误条件中恢复的测试方法。使用故障注入特别有用，能确保故障恢复策略不至于不兼容或者太严格，这会导致关键服务不可用。

与其他错误注入机制（如延迟数据包或在网络层杀掉 Pod）不同，Istio 允许在应用层注入错误。这使您可以注入更多相关的故障，例如 HTTP 错误码，以获得更多相关的结果。

可以注入两种故障，它们都使用虚拟服务配置：
- 延迟
延迟是时间故障。它们模拟增加的网络延迟或一个超载的上游服务。
- 终止
终止是崩溃失败。他们模仿上游服务的失败。终止通常以 HTTP 错误码或 TCP 连接失败的形式出现。

### 流量镜像
流量镜像，也称为影子流量，是一个以尽可能低的风险为生产带来变化的强大的功能。镜像会将实时流量的副本发送到镜像服务。镜像流量发生在主服务的关键请求路径之外。

在此任务中，首先把流量全部路由到 v1 版本的测试服务。然后，执行规则将一部分流量镜像到 v2 版本。

## 2.2 可观察性
### 可观察性≠监控
监控是指从运维角度，被动地审视系统行为和状态，是在系统之外探查系统的运行时状态。
而可观察性是从开发者的角度主动地探究系统的状态，开发过程中去考虑把哪些系统指标暴露出去。而在原始时期的我们都是通过日志查看系统运行时状态，所以这也是一种理念创新。

### 组成
#### 指标（Metrics）
通过聚合的数据来监测你的应用运行情况。为了监控服务行为，Istio 为服务网格中所有出入的服务流量都生成了指标。这些指标提供了关于行为的信息，例如总流量数、错误率和请求响应时间。

除了监控网格中服务的行为外，监控网格本身的行为也很重要。Istio 组件可以导出自身内部行为的指标，以提供对网格控制平面的功能和健康情况的洞察能力。

Istio 指标收集由运维人员配置来驱动。运维人员决定如何以及何时收集指标，以及指标本身的详细程度。这使得它能够灵活地调整指标收集来满足个性化需求。
Istio中的指标分类:
##### 代理级别的指标( Proxy-level)
Istio 指标收集从 **sidecar 代理(Envoy)** 开始。每个代理为通过它的所有流量（入站和出站）生成一组丰富的指标。代理还提供关于它本身管理功能的详细统计信息，包括配置信息和健康信息。

Envoy 生成的指标提供了**资源（例如监听器和集群）粒度**上的网格监控。因此，为了监控 Envoy 指标，需要了解网格服务和 Envoy 资源之间的连接。

Istio 允许运维在每个工作负载实例上**选择生成和收集哪个 Envoy 指标**。默认情况下，Istio 只支持 Envoy 生成的统计数据的一小部分，以避免依赖过多的后端服务，还可以减少与指标收集相关的 CPU 开销。然而，运维可以在需要时轻松地扩展收集到的代理指标集。这支持有针对性地调试网络行为，同时降低了跨网格监控的总体成本。

Envoy 文档包括了 Envoy 统计信息收集的详细说明。Envoy 统计里的操作手册提供了有关控制代理级别指标生成的更多信息。

代理级别指标的例子：

```bash
# 当前集群中来自于上游服务的总的请求数
envoy_cluster_internal_upstream_rq{response_code_class="2xx",
	cluster_name="xds-grpc"} 7163

# 上游服务完成的请求数量
envoy_cluster_upstream_rq_completed{cluster_name="xds-grpc"} 7164
# 是SSL连接出错的数量
envoy_cluster_ssl_connection_error{cluster_name="xds-grpc"} 0
```
##### 服务级别的指标( Service-level)
监控服务通信的面向服务的指标。
- 四个基本的服务监控需求：延迟、流量、错误和饱和情况。Istio 带有一组默认的仪表板，用于监控基于这些指标的服务行为。
- 默认的 Istio 指标由 Istio 提供的配置集定义并默认导出到 Prometheus。运维人员可以自由地修改这些指标的形态和内容，更改它们的收集机制，以满足各自的监控需求。
收集指标任务为定制 Istio 指标生成提供了更详细的信息。

- 服务级别指标的使用完全是可选的。运维人员可以选择关闭指标的生成和收集来满足自身需要。

服务级别指标的例子

```bash
istio_requests_total{
  connection_security_policy="mutual_tls",
  destination_app="details",
  destination_principal="cluster.local/ns/default/sa/default",
  destination_service="details.default.svc.cluster.local",
  destination_service_name="details",
  destination_service_namespace="default",
  destination_version="v1",
  destination_workload="details-v1",
  destination_workload_namespace="default",
  reporter="destination",
  request_protocol="http",
  response_code="200",
  response_flags="-",
  source_app="productpage",
  source_principal="cluster.local/ns/default/sa/default",
  source_version="v1",
  source_workload="productpage-v1",
  source_workload_namespace="default"
} 214
```

#####  控制平面指标(Control plane )
每一个 Istio 的组件（Pilot、Galley、Mixer）都提供了对自身监控指标的集合。这些指标容许监控 Istio 自己的行为（这与网格内的服务有所不同）。

#### 访问日志
通过应用产生的事件来监控你的应用。
访问日志提供了一种从单个工作负载实例的角度监控和理解行为的方法。
Istio 可以从一组可配置的格式集生成服务流量的访问日志，为运维人员提供日志记录的方式、内容、时间和位置的完全控制。Istio 向访问日志机制暴露了**完整的源和目标元数据**，允许对网络通信进行详细的审查。
- 生成位置可选
访问日志可以在本地生成，或者导出到自定义的后端基础设施，包括 Fluentd。

- 日志内容
应用日志
Envoy 服务日志：`kubectl logs -l app=demo -C istio-proxy`

Istio 访问日志例子（JSON 格式）：

```bash
{
"level": "info",
"time": "2019-06-11T20:57:35.424310Z",
"instance": "accesslog.instance.istio-control",
"connection_security_policy": "mutual_tls",
"destinationApp": "productpage",
"destinationIp": "10.44.2.15",
"destinationName": "productpage-v1-6db7564db8-pvsnd",
"destinationNamespace": "default",
"destinationOwner": "kubernetes://apis/apps/v1/namespaces/default/deployments/productpage-v1",
"destinationPrincipal": "cluster.local/ns/default/sa/default",
"destinationServiceHost": "productpage.default.svc.cluster.local",
"destinationWorkload": "productpage-v1",
"httpAuthority": "35.202.6.119",
"latency": "35.076236ms",
"method": "GET",
"protocol": "http",
"receivedBytes": 917,
"referer": "",
"reporter": "destination",
"requestId": "e3f7cffb-5642-434d-ae75-233a05b06158",
"requestSize": 0,
"requestedServerName": "outbound_.9080_._.productpage.default.svc.cluster.local",
"responseCode": 200,
"responseFlags": "-",
"responseSize": 4183,
"responseTimestamp": "2019-06-11T20:57:35.459150Z",
"sentBytes": 4328,
"sourceApp": "istio-ingressgateway",
"sourceIp": "10.44.0.8",
"sourceName": "ingressgateway-7748774cbf-bvf4j",
"sourceNamespace": "istio-control",
"sourceOwner": "kubernetes://apis/apps/v1/namespaces/istio-control/deployments/ingressgateway",
"sourcePrincipal": "cluster.local/ns/istio-control/sa/default",
"sourceWorkload": "ingressgateway",
"url": "/productpage",
"userAgent": "curl/7.54.0",
"xForwardedFor": "10.128.0.35"
}
```

#### 分布式追踪
通过追踪请求来了解服务之间的调用关系，用于问题的排查以及性能分析。
分布式追踪通过监控流经网格的单个请求，提供了一种监控和理解行为的方法。追踪使网格的运维人员能够理解服务的依赖关系以及在服务网格中的延迟源。

Istio 支持通过 Envoy 代理进行分布式追踪。代理自动为其应用程序生成追踪 span，只需要应用程序转发适当的请求上下文即可。

Istio 支持很多追踪系统，包括 Zipkin、Jaeger、LightStep、Datadog。运维人员控制生成追踪的采样率（每个请求生成跟踪数据的速率）。这允许运维人员控制网格生成追踪数据的数量和速率。

更多关于 Istio 分布式追踪的信息可以在分布式追踪 FAQ 中找到。

Istio 为一个请求生成的分布式追踪数据：
![](https://img-blog.csdnimg.cn/20210131230904389.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## 网络安全
授权及身份认证

## 策略
限流
黑白名单

> 参考
> - https://istio.io/latest/zh/docs/concepts/traffic-management/#network-resilience-and-testing
> - https://istio.io/latest/zh/docs/concepts/observability/