# 00-Kubernetes的基本架构

## 0 前言

Kubernetes，希腊语，意舵手。有时简写为“K8s”，其中“8”代表“K”和“s”之间的 8 个字母，是一个开源系统，支持在任何地方部署、扩缩和管理容器化应用。

## 1 k8s架构



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/dfec2ed3d000ef02c7f3430fc2de81bf.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/66a53adacdad0200ca1f797435a7f33e.png)

这种架构为服务发现提供灵活，低耦合机制。与大多数分布式计算平台架构一样，k8s集群至少包含：

- 一个主节点
- 多个计算节点

主服务器负责公开API，安排部署并管理整个集群。每个节点都运行一个运行时容器，如Docker及一个与主机通信的代理。该节点还运行用于日志记录，监视，服务发现和可选附件的其他组件。节点是Kubernetes集群的主力军。它们向应用程序公开计算，网络和存储资源。节点可以是在云中运行的虚拟机（VM）或在数据中心内运行的裸机服务器。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/712b48028c4bd045eb20fdae1ae7dac4.png)

Kubernetes组件：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/51120ad23b216a6946e3c4ebef2106bf.svg)

 分布式集群架构的系统都类似，只不过在 k8s 中：

- manager即k8s Master
- worker即Node x节点

Master对外暴露很多接口，供我们操作 k8s 集群，如查看节点状态、将应用部署到k8s集群。类似一种 C/S 交互架构。

Kubernetes 集群（Cluster）：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/61dae653d5260f6861a455fb1bf42f0c.png)

## 2 Master节点



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/e64704474497799f428346db7c5b22f2.png)

k8s对象的定义，如pod、副本集和服务，被提交给 master。根据定义的需求和资源可用性，master 将 pod 调度到特定节点。该节点从容器镜像注册表中拉取镜像，并与本地容器运行时协调以启动容器。

[etcd](https://github.com/coreos/etcd) 来自 CoreOS 的开源分布式KV DB，它充当k8s集群所有组件的单一真实来源 ( [SSOT )。](https://en.wikipedia.org/wiki/Single_source_of_truth) master 查询 etcd 以检索节点、pod 和容器状态的各种参数。

来看其中的核心组件：

### etcd

分布式 KV 存储，保存整个k8s集群的状态和配置。

### API Server

暴露给外界访问，可通过 CLI 或 UI  操作通过 API Server 最终和整个集群交互，提供了资源操作的唯一入口，并提供认证、授权、访问控制、API注册和发现等机制。

1. 提供 k8s API如CRUD操作。kubectl 和其他客户端都通过 API Server 与 k8s 集群进行交互
2. 验证和确认请求，识别恶意或非法请求。API Server 使用 ServiceAccount 对象鉴权用户，确保只有被授权的用户才能访问相应API
3. 查询元数据并决定将请求路由到哪个节点。API Server 发送请求到 etcd 集群，查询与请求相关的元数据和资源信息，然后确定将请求转发到哪个节点
4. 持久化对象编辑。当对象创建或更新时，API Server 会将对象编辑持久化到 etcd 集群
5. 记录审计日志。API Server 会记录所有请求及其详细信息,为审计提供数据支持
6. TLS 认证和 RBAC 授权。API Server 使用证书对所有请求进行 TLS 认证和 RBAC 授权,保证集群安全
7. 汇总监控数据。API Server 可以从各个节点和控制平面组件收集监控数据,为外部监控系统提供统一数据接口
8. 服务发现。API Server 暴露了服务发现的 API,此 API 用于查找任何 Kubernetes 服务的 endpoints

所以,总体来说,API Server 提供了 Kubernetes 系统的统一入口,承担了认证授权、查询请求解析、对象持久化等非常重要的功能,是 Kubernetes 集群的控制中心和连接点。

### controller manager

负责维护集群的状态，如负载均衡、故障检测、自动扩展、滚动更新、副本数量设置等。

### Scheduler

负责资源的调度，按预定调度策略将Pod调度到相应机器。

如我通过API 要下达一个命令，要求部署一个应用，而该应用需要两个容器，那这俩容器该运行在哪个 Node ？这就是Scheduler干的事。

## 3 Node节点



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/24fff666d490a861b6f45fdda10eee3a.png)

### ① Pod

k8s中容器里调度最小单位，相同namespace的一些 container 组合。吊舱是一个或多个容器的集合。吊舱是Kubernetes的管理核心单元。容器充当共享相同上下文和资源的容器的逻辑边界。

Pod的分组机制通过使多个依赖进程一起运行，而弥补了容器化和虚拟化间的差异。运行时，可通过创建副本集来扩展Pod，以确保部署始终运行所需数量的Pod。

### ② Docker

每个 Node 都需要执行一个运行时容器，例如Docker或rkt。

### ③ kubelet

Master 如何控制 Node 的呢？需要一个代理在 Node 中做这些事：

- 负责维护容器的生命周期
- 也负责Volume（CSI）和网络（CNI）的管理

### ④ Container runtime

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/03816fdb2e2d3465c540cd09aabafa38.png)

负责镜像管理以及Pod和容器的真正运行（CRI）

### ⑤ kube-proxy

负责为Service提供集群内部的服务发现和负载均衡。

### ⑥ Fluentd

日志采集和查询。

参考

- https://kubernetes.io/zh-cn/docs/concepts/overview/components/