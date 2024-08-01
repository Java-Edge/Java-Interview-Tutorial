# 01-一键部署神器kubeadm

## 0 前言

容器的核心是“容器化”应用，如应用既可能是

- Java Web、MySQL
- Cassandra这样的分布式系统

想用容器运行后者，单通过Docker把一个Cassandra镜像run没用。Cassandra应用容器化的关键，在于处理这些Cassandra容器间的编排关系：

- 哪些Cassandra容器是主，哪些从
- 主从容器区分
- 之间咋自动发现和通信
- Cassandra容器的持久化数据咋保持

这也是k8s主要原因：体现容器化“表达能力”，独有的先进性和完备性。使其不仅能运行Java Web&MySQL常规组合，还能处理Cassandra容器集群等复杂编排问题。

对编排能力的剖析、解读和最佳实践是容器技术研究重点。

k8s发布初期，部署完全依靠社区维护的脚本。作为Go项目，已免去很多类似Python项目要安装语言级依赖的麻烦。但除了将各组件编译成二进制文件，用户还要负责为这些二进制文件编写一系列运维工作：

- 对应配置文件
- 配置自启动脚本
- 为kube-apiserver配置授权文件

目前，各云厂商最常用部署方法，是用SaltStack、Ansible等运维工具自动化执行这些步骤。但依然繁琐。因为，SaltStack这类专业运维工具本身学习成本，就可能比k8s项目还高。

直到2017，社区才发起独立部署工具kubeadm：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/13493e0ea6c97feca5f43d26acff2a1d.png)

让用户能通过两条指令完成一个k8s集群部署：

```bash
# 创建一个Master节点
$ kubeadm init

# 将一个Node节点加入当前集群
$ kubeadm join <Master节点的IP和端口>
```

这一键部署出来的集群能用于生产环境？

## 1 kubeadm工作原理

部署时，k8s每个组件都是一个要被执行的、单独的二进制文件。所以SaltStack这样的运维工具或由社区维护的脚本功能，就是要把这些二进制文件传输到指定机器，然后编写控制脚本启停这些组件。

### 1.1 为何不用容器部署k8s？

只要给每个k8s组件做个容器镜像，然后在每台宿主机上用docker run指令启动这些组件容器，不就行？

k8s早期确实有脚本用Docker部署k8s项目，相比SaltStack等部署方式，的确简单。但也带来麻烦：

### 1.2 咋容器化kubelet？

kubelet是k8s操作Docker等容器运行时的核心组件。除了跟容器运行时交互，kubelet在配置容器网络、管理容器数据卷时，都要直接操作宿主机。

若现在kubelet本身就运行在一个容器，则直接操作宿主机就烦了：

- 网络配置还好，kubelet容器可通过不开启Network Namespace（即Docker的host network模式），直接共享宿主机的网络栈
- 可要让kubelet隔着容器的Mount Namespace和文件系统，操作宿主机的文件系统，难。如若用户想用NFS做容器的持久化数据卷，则kubelet就要在容器进行绑定挂载前，在宿主机的指定目录上，先挂载NFS的远程目录

#### 问题来了

由于现在kubelet运行在容器，即它要执行“mount -F nfs”命令，被隔离在一个单独的Mount Namespace中。即kubelet做的挂载操作，不能被“传播”到宿主机。有人急了：

- 可用setns()系统调用，在宿主机的Mount Namespace中执行这些挂载操作
- Docker应支持一个–mnt=host参数

但至今，在容器里运行kubelet，仍无好法，也不推荐你用容器部署k8s。因此，kubeadm选择

### 1.3 妥协方案

- kubelet直接运行在宿主机
- 然后用容器部署其他k8s组件

所以，使用kubeadm第一步，就是在宿主机手动安装三个2进制文件：

- kubeadm
- kubelet
- kubectl

kubeadm作者已为各发行版Linux准备好安装包，只需执行：

```bash
$ apt-get install kubeadm
```

接下来，就能使用“kubeadm init”部署Master节点

## 2 kubeadm init工作流程

kubeadm先一系列检查，确定这台机器是否能用来部署k8s。

### 2.1 Preflight Checks



- Linux内核版本3.10以上
- Linux Cgroups模块是否可用
- 机器hostname是否标准？k8s项目里，机器名及一切存储在Etcd中的API对象，须使用标准的DNS命名（RFC 1123）
- 用户安装的kubeadm和kubelet的版本是否匹配
- 机器上是否已安装k8s的二进制文件
- k8s的工作端口10250/10251/10252端口是否已被占用
- ip、mount等Linux指令是否存在
- Docker是否已安装
- ...

### 2.2 证书

生成k8s对外提供服务所需的各种证书和对应目录。

k8s对外提供服务时，除非专门开启“不安全模式”，否则都要通过HTTPS才能访问kube-apiserver。这就要为k8s集群配置好证书文件。

kubeadm为k8s项目生成的证书文件都放在Master节点的`/etc/kubernetes/pki`目录下。最主要的证书文件是ca.crt和对应的私钥ca.key。

用户使用kubectl获取容器日志等streaming操作时，需通过kube-apiserver向kubelet发起请求，这个连接也必须是安全的。kubeadm为这步生成的：

- `apiserver-kubelet-client.crt`文件
- 对应私钥`apiserver-kubelet-client.key`

k8s集群还有Aggregate API Server等特性，也需专门证书。你可选择不让kubeadm为你生成这些证书，而是拷贝现有的证书到如下证书目录：

```bash
/etc/kubernetes/pki/ca.{crt,key}
```

这时，kubeadm就会跳过证书生成的步骤，把它完全交给用户处理。

### 2.3 配置文件

**证书生成后，kubeadm接下来会为其他组件生成访问kube-apiserver所需的配置文件**

这些文件的路径：`/etc/kubernetes/xxx.conf`

```bash
ls /etc/kubernetes/
admin.conf  controller-manager.conf  kubelet.conf  scheduler.conf
```

这些文件记录当前Master节点的：

- 服务器地址
- 监听端口
- 证书目录等信息

这样，对应客户端（如scheduler，kubelet等）就能直接加载相应文件，使用里面的信息与kube-apiserver建立安全连接。

接着

### 2.4 为Master组件生成Pod配置文件

k8s的三个Master组件：

- kube-apiserver
- kube-controller-manager
- kube-scheduler

都会被使用Pod部署。这时，k8s集群尚不存在，难道kubeadm直接执行docker run启动这些容器？

No！k8s**特殊的容器启动方法** - "Static Pod"，允许把要部署的Pod的YAML文件放在一个指定目录。这当这台机器上的kubelet启动时，会自动检查该目录，加载所有Pod YAML，然后在该节点启动它们。

kubelet被设计为完全独立的组件，其他Master组件更像辅助性的系统容器。kubeadm的Master组件的YAML文件会被生成在`/etc/kubernetes/manifests`路径。如`kube-apiserver.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    scheduler.alpha.kubernetes.io/critical-pod: ""
  creationTimestamp: null
  labels:
    component: kube-apiserver
    tier: control-plane
  name: kube-apiserver
  namespace: kube-system
spec:
  containers:
  - command:
    - kube-apiserver
    - --authorization-mode=Node,RBAC
    - --runtime-config=api/all=true
    - --advertise-address=10.168.0.2
    ...
    - --tls-cert-file=/etc/kubernetes/pki/apiserver.crt
    - --tls-private-key-file=/etc/kubernetes/pki/apiserver.key
    image: k8s.gcr.io/kube-apiserver-amd64:v1.11.1
    imagePullPolicy: IfNotPresent
    livenessProbe:
      ...
    name: kube-apiserver
    resources:
      requests:
        cpu: 250m
    volumeMounts:
    - mountPath: /usr/share/ca-certificates
      name: usr-share-ca-certificates
      readOnly: true
    ...
  hostNetwork: true
  priorityClassName: system-cluster-critical
  volumes:
  - hostPath:
      path: /etc/ca-certificates
      type: DirectoryOrCreate
    name: etc-ca-certificates
  ...
```

Pod里只定义了一个容器，使用镜像：k8s.gcr.io/kube-apiserver-amd64:v1.11.1，k8s官方维护的一个组件镜像

该容器的启动命令（commands）：

```bash
kube-apiserver --authorization-mode=Node,RBAC …
```

即：容器里kube-apiserver二进制文件 + 指定的配置参数

- 如要修改一个已有集群的`kube-apiserver`的配置，需修改该YAML

- 这些组件的参数可在部署时指定

这步完成后，kubeadm还会再生成一个`Etcd`的Pod YAML，用来通过同样的Static Pod启动Etcd。

最后Master组件的Pod YAML文件：

```bash
$ ls /etc/kubernetes/manifests/
etcd.yaml  kube-apiserver.yaml  kube-controller-manager.yaml  kube-scheduler.yaml
```

一旦这些YAML出现在被kubelet监视的`/etc/kubernetes/manifests`目录，kubelet就会自动创建这些YAML中定义的Pod（Master组件的容器）。Master容器启动后，kubeadm会检查`localhost:6443/healthz`（Master组件的健康检查URL），等Master组件完全运行。

### 2.5 为集群生成一个bootstrap token

只要持有该token，任一安装kubelet和kubadm的节点，都可通过kubeadm join加入该集群。

该token的值和使用方法会在kubeadm init结束后被打印。

### 2.6 将ca.crt等Master节点的重要信息

通过ConfigMap保存在Etcd，供后续部署Node节点使用。这个ConfigMap的名字是cluster-info。

### 2.7 安装默认插件

k8s默认

- kube-proxy：提供整个集群的服务发现

  ![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/52ff06743b91756349e9bd95d716cbcf.png)

- DNS：提供整个集群的DNS功能

这俩插件必装，也只是两个容器镜像，所以kubeadm只要用k8s客户端创建两个Pod。

## 3 kubeadm join的执行流程

kubeadm init生成bootstrap token后，就能在任一安装kubelet和kubeadm的机器上执行kubeadm join。

### 为啥执行kubeadm join需要这样一个token？

- 任何一台机器想要成为Kubernetes集群中的一个节点，就必须在集群的kube-apiserver上注册
- 可要想跟apiserver打交道，这台机器须获取相应证书文件（CA文件）
- 可为了一键安装，就不能让用户去Master节点手动拷贝这些文件

所以，kubeadm至少需要发起一次“不安全模式”的访问到kube-apiserver，从而拿到保存在ConfigMap中的cluster-info（它保存了APIServer的授权信息）。而bootstrap token，扮演的就是这个过程中的安全验证的角色。

有cluster-info里的kube-apiserver的地址、端口、证书，kubelet就能以“安全模式”连接到apiserver上，这样一个新的节点就部署完成。

接下来，你只要在其他节点重复这指令。

## 4 配置kubeadm的部署参数

kubeadm部署k8s集群最关键的两个步骤：

- kubeadm init
- kubeadm join

kubeadm确实简单易用，咋定制集群组件参数？如要指定kube-apiserver启动参数，咋办？

推荐用kubeadm init部署Master节点时，使用指令：

```bash
$ kubeadm init --config kubeadm.yaml
```

这时，你就可给kubeadm提供一个YAML文件（如kubeadm.yaml），主要内容如下：

```bash
apiVersion: kubeadm.k8s.io/v1alpha2
kind: MasterConfiguration
kubernetesVersion: v1.11.0
api:
  advertiseAddress: 192.168.0.102
  bindPort: 6443
  ...
etcd:
  local:
    dataDir: /var/lib/etcd
    image: ""
imageRepository: k8s.gcr.io
kubeProxy:
  config:
    bindAddress: 0.0.0.0
    ...
kubeletConfiguration:
  baseConfig:
    address: 0.0.0.0
    ...
networking:
  dnsDomain: cluster.local
  podSubnet: ""
  serviceSubnet: 10.96.0.0/12
nodeRegistration:
  criSocket: /var/run/dockershim.sock
  ...
```

通过制定这样一个部署参数配置文件，方便在文件里填写各种自定义部署参数。

如要指定kube-apiserver参数，只要在这文件里加一段：

```bash
...
apiServerExtraArgs:
  advertise-address: 192.168.0.103
  anonymous-auth: false
  enable-admission-plugins: AlwaysPullImages,DefaultStorageClass
  audit-log-path: /home/johndoe/audit.log
```

然后，kubeadm就会使用上面这些信息替换/etc/kubernetes/manifests/kube-apiserver.yaml里的command字段里的参数。

## 5 总结

kubeadm实现每步部署功能时，都最大程度重用k8s已有功能。而kubeadm的源代码，就在kubernetes/cmd/kubeadm目录，k8s项目一部分。app/phases文件夹下的代码，对应本文详介的每个步骤。

kubeadm几乎完全是一位高中生的作品。他叫Lucas Käldström，芬兰人，今年只有19岁。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/273387fcb7fa409239b75ef89ed92e30.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/df668b57a66d0d3c37faa517eb7bf12d.png)

kubeadm，是他17岁时用业余时间完成的一个社区项目。


kubeadm能够用于生产环境吗？至今（2019年12月）不能。

因为kubeadm最欠缺，一键部署一个高可用的k8s集群。即：Etcd、Master组件都应该是多节点集群，而不是现在这样的单点。这也正是kubeadm接下来发展的主要方向。

Lucas也正在积极地把kubeadm phases开放给用户，即用户可更自由定制kubeadm的每一个部署步骤。这些举措，都可以让这个项目更加完善，对它的发展走向也充满了信心。

若有部署规模化生产环境的需求，推荐kops或SaltStack更复杂的部署工具。

- 作为k8s项目的原生部署工具，kubeadm对Kubernetes项目特性的使用和集成，确实要比其他项目“技高一筹”，值得参考
- kubeadm的部署方法，不会涉及到太多运维，也不需要我们额外学习复杂的部署工具。而它部署的k8s集群，跟一个完全使用二进制文件搭建起来的集群几乎没有任何区别

参考

- 深入剖析Kubernetes
- https://kubernetes.io/zh-cn/docs/reference/setup-tools/kubeadm/