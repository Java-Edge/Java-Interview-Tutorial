# 漫谈 Kubernetes 的本质

## 0 前言

一个“容器”，是由Linux Namespace、Linux Cgroups和rootfs三种技术构建出的进程的隔离环境。一个运行的Linux容器，可被看做

- 一组联合挂载在 */var/lib/docker/aufs/mnt* 上的rootfs，即“容器镜像”（Container Image），容器静态视图
- 一个由**Namespace**+**Cgroups**构成的隔离环境，即“容器运行时”（Container Runtime），容器动态视图

开发者不关心容器运行时差异。因为整个“开发-测试-发布”流程，承载容器信息进行传递的，是容器镜像，而非容器运行时。

这假设是容器技术圈在Docker成功后不久，迅速走向“容器编排”主要原因：作为云基础设施提供商，只要能将用户提交的Docker镜像容器方式运行，就能成为容器生态图的一个承载点，将整个容器技术栈价值，沉淀在这节点。

更重要的，只要从这承载点向Docker镜像制作者和使用者方向回溯，整条路径上的各个服务节点。如CI/CD、监控、安全、网络、存储等，都有发挥和盈利余地。

这逻辑正是所有云计算提供商热衷容器技术的重要原因：通过容器镜像，它们和开发者关联。从一个开发者和单一的容器镜像，到无数开发者和庞大容器集群，容器技术实现从“容器”到“容器云”。容器从一个小工具，跃为云计算主角，而能定义容器组织和管理规范的“容器编排”技术，坐上容器技术领域的“头把交椅”。最具代表性的容器编排工具：

- Docker公司Compose+Swarm
- Google、RedHat公司共同主导的k8s项目

k8s理论基础比工程实践走得靠前得多，归功Google 2015年4月发布的Borg论文。Borg承载Google整个基础设施的核心依赖，位居整个基础设施技术栈的最底层：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/4849932c4a9d727d7b9ca45b0f356fa4.png)

这图描绘当时Google已公开发表的整个基础设施栈。可找到MapReduce、BigTable等知名项目，也能看到Borg和其继任者Omega位于整个技术栈的最底层。所以Borg没开源。得益于Docker和容器技术风靡，它以另一种方式与开源社区见面，k8s。

k8s每个核心特性都脱胎于Borg/Omega系统设计与经验。逐渐觉察到Docker技术栈“稚嫩”和Mesos社区“老迈”，社区很快明白：k8s项目在Borg体系指导下，体现独有的先进与完备性，这才是一个基础设施领域开源项目核心价值。

## 1 k8s解决啥？

编排？调度？容器云？集群管理？至今无标准答案。不同发展阶段，k8s着力问题不同。

但大多数用户期望体验确定：现在我有应用的容器镜像，请帮我在一个给定集群上运行！还能给我提供路由网关、水平扩展、监控、备份、灾难恢复等一系列运维能力。

这不就是经典PaaS（eg. Cloud Foundry）项目能力？有Docker后，根本无需啥k8s、PaaS，只要用Docker公司**Compose+Swarm**项目，就可很方便DIY这些功能！

若k8s只停留在拉取用户镜像、运行容器及提供常见运维功能，早没了。定义核心功能过程中，正是依托Borg项目理论优势，才几个月迅速站稳脚跟，进而确定如下全局架构：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/7562971c1cb10a6f551d85697d93db9a.png)

类似Borg，都有Master、Node两种节点，即控制节点、计算节点。

### 1.1 控制节点

即Master节点，由三个独立组件协作：

- 负责API服务的kube-apiserver
- 负责调度的kube-scheduler
- 负责容器编排的kube-controller-manager

整个集群的持久化数据，由kube-apiserver处理后保存在Etcd。

### 1.2 计算节点

最核心

#### kubelet组件



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/14330eb5c2c90d804a786b3122fb766b.png)

负责同容器运行时（如Docker）打交道。该交互依赖CRI（Container Runtime Interface）的远程调用接口，该接口定义了容器运行时的核心操作，如启动一个容器需要的所有参数。

这也是为何k8s不关心部署的啥容器运行时、使用啥技术实现，只要你的容器运行时能运行标准的容器镜像，即可通过实现CRI接入K8s。

而具体的容器运行时，如Docker项目，一般通过OCI容器运行时规范同底层的Linux交互，即把CRI请求翻译成对Linux操作系统的调用（操作Namespace和Cgroups等）。

kubelet还通过gRPC协议，同Device Plugin插件交互。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/724763b6faadbebdd79fd44e08aa5e26.png)

这插件是k8s用来管理GPU等宿主机物理设备的主要组件，也是基于k8s进行机器学习训练、高性能作业支持等工作必须关注的功能。

另一重要功能，是调用网络插件、存储插件为容器配置网络和持久化存储。这两个插件与kubelet进行交互的接口：

- CNI（Container Networking Interface）
- CSI（Container Storage Interface）

kubelet名字来自Borg里的同源组件Borglet。因为Borg不支持这里的容器技术，而只是简单使用Linux Cgroups对进程进行限制。即像Docker这样“容器镜像”在Borg不存在，Borglet组件自然也不需要像kubelet考虑咋和Docker交互、咋管理容器镜像，也无需支持CRI、CNI、CSI等诸多容器技术接口。

kubelet完全是为实现k8s项目对容器的管理能力而重新实现的一个组件，与Borg无直接传承关系。

虽不使用Docker，但Google内部确实在使用一个包管理工具Midas Package Manager (MPM)，可部分取代Docker镜像的角色。

## 2 Borg对k8s的指导

Master节点实现细节，Borg与k8s不尽相同，但出发点一致，即咋编排、管理、调度用户提交的作业。Borg完全能将Docker镜像看做一种新的应用打包方式，Borg过去在大规模作业管理与编排上的经验可直接“套”在k8s。

所以，一开始k8s就不像同期各种“容器云”项目，把Docker作为架构核心，而是仅把它作为最底层的一个容器运行时实现。而k8s着重Borg研究人员在论文中提到的：运行在大规模集群中的各种任务之间，实际上存在各种关系。这些关系处理，才是作业编排和管理系统最困难的。

### 2.1 任务之间的关系

- 一个Web应用与数据库之间的访问关系
- 一个负载均衡器和其后端服务
- 一个门户应用与授权组件之间的调用关系

同属于一个服务单位的不同功能之间，也完全可能存在这样关系，如：

- 一个Web应用与日志搜集组件之间的文件交换关系

而容器技术普及前，传统VM对这种关系处理都“粗粒度”：

- 很多功能不相关的应用被一锅部署在同台虚拟机，只是因为偶尔会互相发几个HTTP请求
- 一个应用被部署在虚拟机后，需手动维护很多跟它协作的守护进程（Daemon），用来处理它的日志搜集、灾难恢复、数据备份等辅助工作

### 2.2 “功能单位”划分

容器有独到“细粒度”优势：毕竟容器本质只是个进程，只要你愿意，那些原挤在同一VM里的各应用、组件、守护进程，都可被分别做成镜像，然后运行在一个个专属容器。它们互不干涉，拥有各自资源配额，可被调度在整个集群里的任一台机器。这正是PaaS系统最理想工作状态，即微服务思想落地的先决条件。

若只做到封装微服务、调度单容器，Swarm已绰绰有余。若再加Compose项目，甚至还具备处理一些简单依赖关系的能力，如一个“Web容器”和它要访问的数据库“DB容器”。

Compose中可为这样的两个容器定义一个“link”，而Docker则维护该“link”关系：Docker会在Web容器中，将DB容器的IP地址、端口等信息以环境变量注入，给应用进程使用，如：

```bash
DB_NAME=/web/db
DB_PORT=tcp://172.17.0.5:5432
DB_PORT_5432_TCP=tcp://172.17.0.5:5432
DB_PORT_5432_TCP_PROTO=tcp
DB_PORT_5432_TCP_PORT=5432
DB_PORT_5432_TCP_ADDR=172.17.0.5
```

### 2.3 平台项目自动处理容器间关系

典型例子，当DB容器变化时（如镜像更新，被迁移至其他宿主机），这些环境变量值会由Docker自动更新。

但若要求该项目能处理前面提到的所有类型的关系，甚至能支持未来可能的更多关系，这时，“link”这针对一种案例设计的解决方案过于简单。一旦要追求普适性，就要从顶层做好设计。

## 3 顶层设计

k8s主要设计思想，宏观角度以统一方式定义任务间的各种关系，并为将来支持更多关系留有余地。

如k8s对容器间的“访问”进行分类，先总结一类常见“紧密交互”的关系：

- 应用间需频繁交互
- 直接通过本地文件进行信息交换

常规环境下的应用往往被部在同一台机器：

- 通过Localhost通信
- 通过本地磁盘目录交换文件

而在k8s，这些容器会被划分为一个“Pod”。

### 3.1 Pod

Pod里的容器共享同一Network Namespace、同一组数据卷，以高效率交换信息。Pod是k8s中最基础的对象，源于Borg论文中的Alloc设计：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/5cc903a0688b6f3b0d0b2ab83ae55c8b.png)

> Borg alloc（allocation缩写）是一台机器上可运行1或多个任务的资源的保留集。无论是否用资源，资源都保持分配状态。 Alloc可用于为将来任务留出资源，在停止任务和重启任务之间保留资源，以及将来自不同作业的任务收集到同一台计算机。
>
> 如一个Web服务器实例和一个关联的logaver任务，用于复制服务器的URL日志从本地磁盘记录到分布式文件系统。分配资源与机器资源的处理方式相似。在一个内部运行的多个任务共享其资源。若必须将分配重定位到另一台计算机，则其任务将随之重新安排。
>
> 分配集就像一项工作：它是一组在多台机器保留资源的分配。创建分配集后，可提交1或多个作业以在其中运行。
>
> 为简便，使用“任务”指代分配或顶级任务（在分配外的一个），使用“作业”来指代作业或分配集。

而对另一种更常见需求，如

## 4 Web应用与DB间的访问关系

k8s提供“Service”服务。像这样的两个应用，故意不部署在同一机器，即使Web应用所在机器宕机，DB也不受影响。

可一个容器的IP地址等信息不固定，Web应用咋找到DB容器的Pod？k8s给Pod绑定一个

### 4.1 Service（服务）

Service声明的IP地址等信息“终生不变”。Service作为Pod的代理入口（Portal），代替Pod对外暴露一个固定的网络地址。

Web应用Pod，需关心DB Pod的Service信息。Service后端真正代理的Pod的IP地址、端口等信息的自动更新、维护，才是k8s的职责。

围绕容器、Pod不断向真实的技术场景扩展，得到k8s核心功能“全景图”：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/7562971c1cb10a6f551d85697d93db9a.png)

- 从容器出发，先遇到容器间“紧密协作”关系难题，于是扩展到Pod
- 有了Pod，希望一次启动多个应用的实例，就需Deployment这个Pod的多实例管理器
- 有了这组相同Pod后，又需通过一个固定的IP地址、端口以LB方式访问它，就有了Service

若现在两个不同Pod间不仅有“访问关系”，还要求在发起时加上授权信息。如Web应用访问DB需Credential（数据库用户名密码），k8s咋处理？

k8s提供Secret对象，一个保存在Etcd里的KV对：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/05a9ab57e0c72009c6883fee08beeb94.png)

把Credential信息以Secret方式存在Etcd，k8s就会在你的指定Pod（如Web应用Pod）启动时，自动把Secret里的数据以Volume方式挂载到容器。这样，Web应用就能访问DB。

除了应用之间的关系，应用运行形态是影响“咋容器化该应用”的第二因素。为此，k8s定义了基于Pod改进后的对象。如：

- Job：一次性运行的Pod（如大数据任务）
- DaemonSet：每个宿主机上，须且只能运行一个副本的守护进程服务
- CronJob：定时任务

正是k8s定义容器之间关系和形态的主要方法。k8s不像其他项目那样，为每个管理功能创建一个指令，然后在项目中实现其中逻辑。这种做法，的确可解决当前问题，但更多问题来临后，力不从心。k8s推崇：

- 先通过一个“编排对象”，如Pod/Job/CronJob等描述你试图管理的应用
- 再为它定义一些“服务对象”，如Service/Secret/Horizontal Pod Autoscaler（自动水平扩展器）等。这些对象，会负责具体的平台级功能。

这种使用方法即“声明式API”。这种API对应的“编排对象”和“服务对象”，都是k8s中的API对象（API Object）。

这就是k8s最核心的设计理念。

## 5 k8s咋启动一个容器化任务

制作好一个Nginx容器镜像，希望让平台帮我启动。且要求平台帮我运行两个完全相同的Nginx副本，以LB方式共同对外提供服务。

若DIY，可能需启动两台VM，分别安装两个Nginx，然后用keepalived为这两个VM做一个虚拟IP。

而用k8s，要做的就是写YAML（nginx-deployment.yaml）：

```yaml
apiVersion: apps/v1  # 指定API版本
kind: Deployment  # 指定资源类型为Deployment，用于管理Pod的部署和扩缩容
metadata: # 定义资源的元数据，包括名称和标签
  name: nginx-deployment  # 指定Deployment名称
  labels: # 定义标签，用于标识和选择资源
    app: nginx
spec: # 定义Deployment的详细规格
  replicas: 2  # 指定Pod副本数，即需要创建的Pod实例数量
  selector: # 定义选择器，用于匹配具有指定标签的Pod
    matchLabels: # 匹配具有指定标签的Pod
      app: nginx
  template: # 定义Pod模板的元数据和规格。
    metadata: # 定义Pod模板的元数据
      labels: #  定义Pod的标签
        app: nginx
    spec: # 定义Pod中容器的详细信息
      containers: # 定义容器列表
      - name: nginx  # 指定容器名称
        image: nginx:1.7.9  # 指定容器使用的镜像
        ports: # 定义容器暴露的端口
        - containerPort: 80
```

该YAML文件定义一个Deployment对象，其主体部分（spec.template部分）是用Nginx镜像的Pod。

然后执行：

```bash
$ kubectl create -f nginx-deployment.yaml
```

两个完全相同的Nginx容器副本就被启动。

## 6 总结

容器可分为：

- 容器运行时
- 容器镜像

### 调度

过去很多的集群管理项目（Yarn、Mesos及Swarm）擅长把一个容器，按某种规则，放在某最佳节点运行。

### 编排

而k8s擅长按用户意愿和整个系统规则，全自动化处理容器之间各种关系。所以k8s本质是为用户提供具有普遍意义的容器编排工具。而不仅限于一个工具，真正价值在于提供一套基于容器构建分布式系统的基础依赖。

参考：

- https://storage.googleapis.com/pub-tools-public-publication-data/pdf/43438.pdf?spm=a2c6h.12873639.article-detail.9.6ae633cflAcXUE&file=43438.pdf