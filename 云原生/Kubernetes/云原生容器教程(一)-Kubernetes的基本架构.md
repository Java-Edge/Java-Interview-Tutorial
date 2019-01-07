# 简介
Kubernetes，希腊语，意舵手。有时简写为“K8s”，其中“8”代表“K”和“s”之间的 8 个字母，是一个开源系统，支持在任何地方部署、扩缩和管理容器化应用。

# 1 Kubernetes架构
- 整体架构图
![](https://img-blog.csdnimg.cn/20201227162743754.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

Kubernetes的这种架构为服务发现提供了一种灵活的，松耦合的机制。与大多数分布式计算平台架构一样，Kubernetes集群至少包含一个主节点和多个计算节点。主服务器负责公开应用程序接口（API），安排部署并管理整个集群。
每个节点都运行一个运行时容器，例如Docker或rkt，以及一个与主机通信的代理。该节点还运行用于日志记录，监视，服务发现和可选附件的其他组件。节点是Kubernetes集群的主力军。它们向应用程序公开计算，网络和存储资源。节点可以是在云中运行的虚拟机（VM）或在数据中心内运行的裸机服务器。
![](https://img-blog.csdnimg.cn/20201227155709834.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

 只不过 
- manager 在这里是 Master
- worker 是 普通的 Node

Master会对外暴露很多接口供我们操作 k8s 集群，比如查看节点状态、将应用部署到k8s集群。
- Kubernetes 集群（Cluster）
![](https://img-blog.csdnimg.cn/20210112221020243.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 1.1 Master 节点功能
![](https://img-blog.csdnimg.cn/20201227155733397.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### 核心组件
#### etcd
分布式的 K.V 存储，保存了整个k8s集群的状态和配置
#### API Server
暴露给外界访问，可以通过 CLI 或 UI  操作通过 API Server 最终和整个集群交互，提供了资源操作的唯一入口，并提供认证、授权、访问控制、API注册和发现等机制；
#### controller manager
负责维护集群的状态，比如负载均衡、故障检测、自动扩展、滚动更新等；
#### Scheduler
负责资源的调度，按照预定的调度策略将Pod调度到相应的机器上。比如我要部署一个应用，该应用需要两个容器，那这俩容器又该运行在哪个 Node 呢？这就是负责的事情。

## 1.2 Node 节点功能
![](https://img-blog.csdnimg.cn/20201227160931908.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### 核心组件
#### Pod
基本算是 k8s 中容器里调度的最小单位，是具有**相同 namespace** 的一些 container 组合。吊舱是一个或多个容器的集合。吊舱是Kubernetes的管理核心单元。容器充当共享相同上下文和资源的容器的逻辑边界。 Pod的分组机制通过使多个依赖进程一起运行而弥补了容器化和虚拟化之间的差异。在运行时，可以通过创建副本集来扩展Pod，以确保部署始终运行所需数量的Pod。

#### Docker
每个 Node 都需要执行一个运行时容器，例如Docker或rkt。

#### kubelet
我们知道Node 节点受 Master 控制的，那就需要一个代理在 Node 中做这些事。负责维护容器的生命周期，同时也负责Volume（CSI）和网络（CNI）的管理。

#### Container runtime
![](https://img-blog.csdnimg.cn/20210112220908927.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

负责镜像管理以及Pod和容器的真正运行（CRI）
#### kube-proxy
负责为Service提供集群内部的服务发现和负载均衡。

#### Fluentd
日志采集和查询。

参考
- https://thenewstack.io/kubernetes-an-overview