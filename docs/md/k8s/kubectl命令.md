# kubectl命令

## kubectl简介

Kubernetes集群管理工具，可帮你部署、管理和扩展Kubernetes集群中的应用程序和服务。使用kubectl，你可创建、更新、删除Pod、Service、Deployment、ConfigMap、Secret等Kubernetes资源对象，同时也可以查看和监控这些资源对象的状态和日志，并进行应用程序调试和故障排除。

还能帮你在不同的k8s集群和命名空间之间切换和操作，管理k8s对象的标签和注释，以及管理kubectl的配置文件等操作。

## 安装（Linux）

```bash
[root@javaedge-monitor-platform-dev k8s]# curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   138  100   138    0     0    262      0 --:--:-- --:--:-- --:--:--   262
100 46.9M  100 46.9M    0     0  1853k      0  0:00:25  0:00:25 --:--:-- 2383k
[root@javaedge-monitor-platform-dev k8s]# kubectl create -f pod_nginx.yml-bash: kubectl: command not found
[root@javaedge-monitor-platform-dev k8s]# curl -LO "https://dl.k8s.io/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   138  100   138    0     0    280      0 --:--:-- --:--:-- --:--:--   280
100    64  100    64    0     0     66      0 --:--:-- --:--:-- --:--:--   285
[root@javaedge-monitor-platform-dev k8s]# echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
kubectl: OK
[root@javaedge-monitor-platform-dev k8s]# sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
[root@javaedge-monitor-platform-dev k8s]# kubectl version --client
WARNING: This version information is deprecated and will be replaced with the output from kubectl version --short.  Use --output=yaml|json to get the full version.
Client Version: version.Info{Major:"1", Minor:"27", GitVersion:"v1.27.1", GitCommit:"4c9411232e10168d7b050c49a1b59f6df9d7ea4b", GitTreeState:"clean", BuildDate:"2023-04-14T13:21:19Z", GoVersion:"go1.20.3", Compiler:"gc", Platform:"linux/amd64"}
Kustomize Version: v5.0.1
[root@javaedge-monitor-platform-dev k8s]# 
```

## 4 kubectl常用命令

### 4.1 kubectl config

助你管理Kubernetes集群的配置信息。通过kubectl config命令，可添加、修改、删除kubeconfig文件中存储的Kubernetes集群、用户、命名空间、证书、API服务器等配置信息。

kubeconfig文件是YAML格式的配置文件，其中包含多个Kubernetes集群的信息。使用kubectl config命令可以更轻松地在不同的Kubernetes集群和命名空间之间切换和操作，提高Kubernetes管理的效率。

#### Mac



```bash
javaedge@JavaEdgedeMac-mini ~ % kubectl config view
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://127.0.0.1:6443
  name: docker-desktop
contexts:
- context:
    cluster: docker-desktop
    user: docker-desktop
  name: docker-desktop
current-context: docker-desktop
kind: Config
preferences: {}
users:
- name: docker-desktop
  user:
    client-certificate-data: REDACTED
    client-key-data: REDACTED
```


```bash
javaedge@JavaEdgedeMac-mini ~ % kubectl config get-contexts
CURRENT   NAME             CLUSTER          AUTHINFO         NAMESPACE
*         docker-desktop   docker-desktop   docker-desktop
```

#### Linux



```bash
[root@javaedge-monitor-platform-dev ~]# minikube kubectl config view
apiVersion: v1
clusters:
- cluster:
    certificate-authority: /root/.minikube/ca.crt
    extensions:
    - extension:
        last-update: Wed, 10 May 2023 23:05:41 CST
        provider: minikube.sigs.k8s.io
        version: v1.30.1
      name: cluster_info
    server: https://192.168.49.2:8443
  name: minikube
contexts:
- context:
    cluster: minikube
    extensions:
    - extension:
        last-update: Wed, 10 May 2023 23:05:41 CST
        provider: minikube.sigs.k8s.io
        version: v1.30.1
      name: context_info
    namespace: default
    user: minikube
  name: minikube
current-context: minikube
kind: Config
preferences: {}
users:
- name: minikube
  user:
    client-certificate: /root/.minikube/profiles/minikube/client.crt
    client-key: /root/.minikube/profiles/minikube/client.key
[root@javaedge-monitor-platform-dev ~]#
```

```bash
[root@javaedge-monitor-platform-dev ~]# minikube kubectl config get-contexts
CURRENT   NAME       CLUSTER    AUTHINFO   NAMESPACE
*         minikube   minikube   minikube   default
[root@javaedge-monitor-platform-dev ~]# 
```

假如有两个集群，可以设置两个 context，但我们可以在本地使用同一个命令去使用不同 context连接不同的 k8s 集群。





### 4.2 kubectl cluster-info

获取当前k8s集群的信息和状态。该命令会返回k8s集群的API服务器地址、服务地址范围、DNS服务IP地址等信息，以及k8s集群的状态信息，包括节点状态、Pod状态、网络状态等。

可帮你快速了解k8s集群的健康状态和基本信息，以便更好了解和管理k8s集群。

Mac：

```bash
vaedge@JavaEdgedeMac-mini ~ % kubectl cluster-info
Kubernetes control plane is running at https://127.0.0.1:6443
CoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

Linux：

```bash
[root@javaedge-monitor-platform-dev ~]# minikube kubectl cluster-info
Kubernetes control plane is running at https://192.168.49.2:8443
CoreDNS is running at https://192.168.49.2:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
[root@javaedge-monitor-platform-dev ~]# 
```

### 4.3 kubectl get

获取k8s集群中的资源对象的信息。可获取Pod、Node、Service、Deployment、ConfigMap、Secret等不同类型的资源对象的详细信息，如资源的名称、命名空间、状态、标签、IP、端口等信息。可帮助监控和管理k8s集群中的资源对象。

- kubectl：这是与 Kubernetes 集群进行交互的命令行工具
- get：这是用于获取集群中资源信息的动作动词

#### 4.3.0 kubectl get deployment

用于列出k8s集群中的所有Deployment对象。Deployment是一种k8s资源，用于管理Pod的创建和更新。

该命令可查看Deployment的当前状态，如正在运行的Pod的数量、所在的节点、Pod的状态等信息。

```bash
# [deployment-name]是Deployment的名称，如果省略该参数，则会列出所有Deployment对象。
kubectl get deployment [deployment-name] [options]

```

常用的选项包括：

- `--namespace`: 指定Deployment所在的命名空间。
- `-o`或`--output`: 指定输出格式，常用的格式包括`json`、`yaml`、`wide`等。
- `-l`或`--selector`: 指定用于筛选Deployment的标签选择器。
- `--show-labels`: 显示Deployment的标签信息。
- `--sort-by`: 指定按照哪个字段排序。

实例：

```bash
# 查看名为 my-deployment 的Deployment对象的状态
kubectl get deployment my-deployment

# 要查看所有Deployment对象的状态
[root@javaedge-monitor-platform-dev k8s]# kubectl get deployment
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           95s

# 要查看所有标签中包含app=nginx的Deployment对象的状态，可以执行以下命令：
kubectl get deployment -l app=nginx

# 宽格式显示所有Deployment对象的状态
[root@javaedge-monitor-platform-dev k8s]# kubectl get deployment -o wide
NAME               READY   UP-TO-DATE   AVAILABLE   AGE     CONTAINERS   IMAGES         SELECTOR
nginx-deployment   3/3     3            3           8m19s   nginx        nginx:1.12.2   app=nginx

```

#### 4.3.1 kubectl get pods

可获取Kubernetes集群中所有的Pod资源对象，并显示它们的名称、所属命名空间、状态、IP地址、节点名称等基本信息。 -o wide 参数则会扩展输出的信息，包括显示Pod所在的节点名称、节点IP地址、Pod的调度情况等详细信息。

这些详细信息有利于更好了解和跟踪Kubernetes资源对象的状态，便于用户进行资源的调度和管理。在排查或解决Kubernetes应用程序故障时，kubectl get pods -o wide 命令也是有用工具。

```bash
[root@javaedge-monitor-platform-dev k8s]# kubectl get pods -o wide
NAME                                READY   STATUS    RESTARTS   AGE     IP            NODE       NOMINATED NODE   READINESS GATES
nginx-deployment-655c8cc5f8-d6j5b   1/1     Running   0          6h36m   10.244.0.23   minikube   <none>           <none>
```

STATUS：Pod的状态，包括

- Running（正在运行）

- Completed（运行完成）

  表示一个Pod中的所有容器都已正常执行完了其在yaml或Dockerfile中定义的命令或脚本，并已成功退出。当容器完成其任务并退出，但其所属的Pod并未被删除时，Pod的状态字段将显示"Completed"。一旦处“Completed”状态的 Pod 对象被删除后，该 Pod 对象所在 Node 上的 file system 中的 container log 将不再被保存，若需要保存日志，可在 yaml 中做出相关配置。

- CrashLoopBackOff（异常退出）

- Pending（等待中）

- Error（错误）

```bash
$ docker network inspect bridge
```

另一种进入nginx容器的方法：
![](https://img-blog.csdnimg.cn/2020123013362484.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

> kubectl exec [POD] [COMMAND] is DEPRECATED and will be removed in a future version. Use kubectl exec [POD] -- [COMMAND] instead.

#### kubectl get nodes

获取当前集群中的节点信息。
该命令以表格的形式列出所有节点的基本信息，如节点名称、状态、版本、内存和CPU使用情况等。

```bash
-o 或 --output：指定输出格式，常见的包括 table（表格，默认）、json（JSON格式）、yaml（YAML格式）等。
--show-labels：显示节点的标签信息。
--sort-by：按照指定的字段对节点进行排序，如 --sort-by=.status.capacity.cpu。
--selector：使用标签选择特定的节点，如 --selector="app=web"。
--no-headers：不显示表格的标题行。
```



```bash
# 获取所有节点的基本信息：
[root@javaedge-k8s-node-1 ~]# kubectl get nodes
NAME             STATUS     ROLES           AGE   VERSION
javaedge-k8s-node-1   NotReady   control-plane   16h   v1.27.0
[root@javaedge-k8s-node-1 ~]# 
```



```bash
# 以 JSON 格式输出节点信息：
[root@javaedge-k8s-node-1 ~]# kubectl get nodes -o json
{
    "apiVersion": "v1",
    "items": [
        {
            "apiVersion": "v1",
            "kind": "Node",
            "metadata": {
                "annotations": {
                    "kubeadm.alpha.kubernetes.io/cri-socket": "unix:///var/run/containerd/containerd.sock",
                    "node.alpha.kubernetes.io/ttl": "0",
                    "volumes.kubernetes.io/controller-managed-attach-detach": "true"
                },
                "creationTimestamp": "2023-06-29T08:49:23Z",
                "labels": {
                    "beta.kubernetes.io/arch": "amd64",
                    "beta.kubernetes.io/os": "linux",
                    "kubernetes.io/arch": "amd64",
                    "kubernetes.io/hostname": "javaedge-k8s-node-1",
                    "kubernetes.io/os": "linux",
                    "node-role.kubernetes.io/control-plane": "",
                    "node.kubernetes.io/exclude-from-external-load-balancers": ""
                },
                "name": "javaedge-k8s-node-1",
                "resourceVersion": "78895",
                "uid": "c24142f9-1fb8-4f4a-92f3-0bed37bd4874"
            },
            "spec": {
                "podCIDR": "10.244.0.0/24",
                "podCIDRs": [
                    "10.244.0.0/24"
                ],
                "taints": [
                    {
                        "effect": "NoSchedule",
                        "key": "node-role.kubernetes.io/control-plane"
                    },
                    {
                        "effect": "NoSchedule",
                        "key": "node.kubernetes.io/not-ready"
                    }
                ]
            },
            "status": {
                "addresses": [
                    {
                        "address": "192.168.0.190",
                        "type": "InternalIP"
                    },
                    {
                        "address": "javaedge-k8s-node-1",
                        "type": "Hostname"
                    }
                ],
                "allocatable": {
                    "cpu": "8",
                    "ephemeral-storage": "94998384074",
                    "hugepages-1Gi": "0",
                    "hugepages-2Mi": "0",
                    "memory": "32843156Ki",
                    "pods": "110"
                },
                "capacity": {
                    "cpu": "8",
                    "ephemeral-storage": "103079844Ki",
                    "hugepages-1Gi": "0",
                    "hugepages-2Mi": "0",
                    "memory": "32945556Ki",
                    "pods": "110"
                },
                "conditions": [
                    {
                        "lastHeartbeatTime": "2023-06-30T01:28:36Z",
                        "lastTransitionTime": "2023-06-29T08:49:22Z",
                        "message": "kubelet has sufficient memory available",
                        "reason": "KubeletHasSufficientMemory",
                        "status": "False",
                        "type": "MemoryPressure"
                    },
                    {
                        "lastHeartbeatTime": "2023-06-30T01:28:36Z",
                        "lastTransitionTime": "2023-06-29T08:49:22Z",
                        "message": "kubelet has no disk pressure",
                        "reason": "KubeletHasNoDiskPressure",
                        "status": "False",
                        "type": "DiskPressure"
                    },
                    {
                        "lastHeartbeatTime": "2023-06-30T01:28:36Z",
                        "lastTransitionTime": "2023-06-29T08:49:22Z",
                        "message": "kubelet has sufficient PID available",
                        "reason": "KubeletHasSufficientPID",
                        "status": "False",
                        "type": "PIDPressure"
                    },
                    {
                        "lastHeartbeatTime": "2023-06-30T01:28:36Z",
                        "lastTransitionTime": "2023-06-29T08:49:22Z",
                        "message": "container runtime network not ready: NetworkReady=false reason:NetworkPluginNotReady message:Network plugin returns error: cni plugin not initialized",
                        "reason": "KubeletNotReady",
                        "status": "False",
                        "type": "Ready"
                    }
                ],
                "daemonEndpoints": {
                    "kubeletEndpoint": {
                        "Port": 10250
                    }
                },
                "images": [
                    {
                        "names": [
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/etcd@sha256:6e1676ae2e54aeeb1b4bdec90a4bd59c3850dca616d20dbb1fa8ea9c01f7c5be",
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/etcd:3.5.7-0"
                        ],
                        "sizeBytes": 101636884
                    },
                    {
                        "names": [
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/kube-apiserver@sha256:fa09fbe54e651e9d22727150075cf79541b645acad33f6a7c2ee0fd41ec6a8e0",
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/kube-apiserver:v1.27.0"
                        ],
                        "sizeBytes": 33226398
                    },
                    {
                        "names": [
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/kube-controller-manager@sha256:13422cd7e7887e2b197ee3d4824d3661f5c967349fbc95043fdc3b752e205592",
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/kube-controller-manager:v1.27.0"
                        ],
                        "sizeBytes": 30826129
                    },
                    {
                        "names": [
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/kube-proxy@sha256:d13b4571200af516e05da2d104e0790cad034c768d99b397e373effe161b1d23",
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/kube-proxy:v1.27.0"
                        ],
                        "sizeBytes": 23905048
                    },
                    {
                        "names": [
                            "quay.io/tigera/operator@sha256:780eeab342e62bd200e533a960b548216b23b8bde7a672c4527f29eec9ce2d79",
                            "quay.io/tigera/operator:v1.30.4"
                        ],
                        "sizeBytes": 21216944
                    },
                    {
                        "names": [
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/kube-scheduler@sha256:d17ae8ece259f2257de48146044aef38d204026fc7af887ee810b66749ca462b",
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/kube-scheduler:v1.27.0"
                        ],
                        "sizeBytes": 18086820
                    },
                    {
                        "names": [
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/coredns@sha256:be7652ce0b43b1339f3d14d9b14af9f588578011092c1f7893bd55432d83a378",
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/coredns:v1.10.1"
                        ],
                        "sizeBytes": 16188753
                    },
                    {
                        "names": [
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/pause@sha256:0fc1f3b764be56f7c881a69cbd553ae25a2b5523c6901fbacb8270307c29d0c4",
                            "registry.cn-shanghai.aliyuncs.com/lee_k8s_images/pause:3.9"
                        ],
                        "sizeBytes": 319115
                    }
                ],
                "nodeInfo": {
                    "architecture": "amd64",
                    "bootID": "189f8156-4ef4-46cc-b769-16b2739dd39c",
                    "containerRuntimeVersion": "containerd://1.6.21",
                    "kernelVersion": "3.10.0-1062.4.1.el7.x86_64",
                    "kubeProxyVersion": "v1.27.0",
                    "kubeletVersion": "v1.27.0",
                    "machineID": "f1f0371d4ada497d92e606102c37754d",
                    "operatingSystem": "linux",
                    "osImage": "CentOS Linux 7 (Core)",
                    "systemUUID": "A67383B1-17F0-4CAA-B3E4-2CBBC940AA1B"
                }
            }
        }
    ],
    "kind": "List",
    "metadata": {
        "resourceVersion": ""
    }
}
```



```bash
# 显示节点的标签信息：
[root@javaedge-k8s-node-1 ~]# kubectl get nodes --show-labels
NAME             STATUS     ROLES           AGE   VERSION   LABELS
javaedge-k8s-node-1   NotReady   control-plane   16h   v1.27.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=javaedge-k8s-node-1,kubernetes.io/os=linux,node-role.kubernetes.io/control-plane=,node.kubernetes.io/exclude-from-external-load-balancers=
[root@javaedge-k8s-node-1 ~]# 
```





```bash
# 按照 CPU 使用情况对节点进行排序
[root@javaedge-k8s-node-1 ~]# kubectl get nodes --sort-by=.status.capacity.cpu
NAME             STATUS     ROLES           AGE   VERSION
javaedge-k8s-node-1   NotReady   control-plane   16h   v1.27.0
[root@javaedge-k8s-node-1 ~]# 
```



使用标签选择特定的节点：

```bash
[root@javaedge-k8s-node-1 ~]# kubectl get nodes --selector="app=web"
No resources found
[root@javaedge-k8s-node-1 ~]# 
```



#### kubectl get rs

列出Kubernetes集群中的所有ReplicaSet对象。ReplicaSet是一种Kubernetes资源，用于管理Pod的创建和更新。使用该命令可以查看ReplicaSet的当前状态，例如正在运行的Pod的数量、所在的节点、Pod的状态等信息。

```bash
# [replicaset-name]是ReplicaSet的名称，如果省略该参数，则会列出所有ReplicaSet对象
kubectl get rs [replicaset-name] [options]

```

常用的选项包括：

- `--namespace`: 指定ReplicaSet所在的命名空间。
- `-o`或`--output`: 指定输出格式，常用的格式包括`json`、`yaml`、`wide`等。
- `-l`或`--selector`: 指定用于筛选ReplicaSet的标签选择器。
- `--show-labels`: 显示ReplicaSet的标签信息。
- `--sort-by`: 指定按照哪个字段排序。



```bash
# 查看名为`my-replicaset`的ReplicaSet对象的状态，可以执行以下命令：
kubectl get rs my-replicaset

# 要查看所有ReplicaSet对象的状态，可以执行以下命令：
kubectl get rs

# 要查看所有标签中包含app=nginx的ReplicaSet对象的状态
kubectl get rs -l app=nginx

# 要以宽格式显示所有ReplicaSet对象的状态，可以执行以下命令：
kubectl get rs -o wide

```

#### kubectl get svc

显示 k8s 集群中所有服务（svc）的信息。
svc：这是资源类型，表示 Kubernetes 中的服务。服务提供了一种基于标签访问 Pod（Kubernetes 中最小的可部署单元）的抽象层。


表格输出：

- NAME：服务的名称
- TYPE：服务的类型，可为ClusterIP、NodePort、LoadBalancer 或 ExternalName之一
- CLUSTER-IP：分配给服务的集群内部 IP 地址
- EXTERNAL-IP：与服务关联的外部 IP 地址（如果适用）
- PORT(S)：服务暴露的端口号和协议
- AGE：服务创建后经过的时间。

适用于检查集群中服务的当前状态，并快速了解它们的名称、类型和 IP 地址。

```bash
[root@javaedge-k8s-node-1 ~]# kubectl get svc -o wide
NAME             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE    SELECTOR
javaedge-nginx   NodePort    10.99.205.238   <none>        90:32708/TCP   155m   app=javaedge-nginx
kubernetes       ClusterIP   10.96.0.1       <none>        443/TCP        20h    <none>
```

也可在宿主机访问内部 ip：

```bash
[root@javaedge-k8s-node-1 ~]# curl http://10.99.205.238:90/
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
[root@javaedge-k8s-node-1 ~]# 
```



因为刚才创建的 nginx pod 里只有一个容器，所以我们就进入了那个。可如果nginx pod 里有俩容器，默认只会进第一个，如何进第二个呢？

#### 4.3.2 kubectl describe

```bash
kubectl describe pods nginx
```

```bash
➜  pod-basic kubectl describe pods nginx
Name:         nginx
Namespace:    default
Priority:     0
Node:         docker-desktop/192.168.65.3
Start Time:   Wed, 30 Dec 2020 12:35:54 +0800
Labels:       app=nginx
Annotations:  <none>
Status:       Running
IP:           10.1.0.6
IPs:
  IP:  
Containers:
  nginx:
    Container ID:   docker://f4e45055b4b33430ecd775494c6bd8a8fe0c351ab1333016fcdc588182f40e41
    Image:          nginx
    Image ID:       docker-pullable://nginx@sha256:4cf620a5c81390ee209398ecc18e5fb9dd0f5155cd82adcbae532fec94006fb9
    Port:           80/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Wed, 30 Dec 2020 12:40:42 +0800
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-tqpkf (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  default-token-tqpkf:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-tqpkf
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                 node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason   Age   From     Message
  ----    ------   ----  ----     -------
  Normal  Pulled   60m   kubelet  Successfully pulled image "nginx" in 35.578083503s
  Normal  Created  60m   kubelet  Created container nginx
  Normal  Started  60m   kubelet  Started container nginx
```


- `kubectl api-resources`: kubectl命令，用于列出Kubernetes集群上可用的API资源。显示资源的名称、简称、API版本、是否命名空间化以及资源的类型

- `--api-group=networking.istio.io`: 选项，指定所需的API组（在这里是`networking.istio.io`）。Istio的网络组件通常使用此API组

### kubectl explain

`kubectl explain` 命令用于查看 Kubernetes 中各种资源对象的详细信息，包括资源的字段、字段类型、默认值等。这个命令非常有用，可以帮助您了解和理解 Kubernetes 资源的定义。下面是 `kubectl explain` 命令的详解：

### 命令结构：

```bash
kubectl explain [RESOURCE] [--recursive] [--api-version=version] [--kind=kind] [--field-selector fieldSelector] [flags]
```

- **RESOURCE**: 指定要查看的 Kubernetes 资源的类型，比如 `pods`、`services`、`deployments` 等。

- **--recursive**: 可选标志，如果指定了这个标志，将显示指定资源类型的所有子资源的详细信息。

- **--api-version=version**: 可选标志，指定要查看的 API 版本。

- **--kind=kind**: 可选标志，指定资源类型的 API 对象。

- **--field-selector fieldSelector**: 可选标志，用于根据字段选择器过滤资源。例如，`--field-selector=status.phase=Running` 可以筛选状态为 Running 的 Pod。

- **flags**: 其他标志，根据需要指定。

### 示例：

1. 查看 Pod 资源的详细信息：

   ```bash
   kubectl explain pods
   ```

2. 查看 Service 资源的详细信息：

   ```bash
   kubectl explain services
   ```

3. 查看 Deployment 资源的详细信息：

   ```bash
   kubectl explain deployments
   ```

4. 查看 Pod 的详细信息，并显示所有子资源：

   ```bash
   kubectl explain pods --recursive
   ```

### 结果解释：

`kubectl explain` 命令的输出结果将包含资源的字段、类型、默认值等信息。每个字段都有其相应的含义和用途，以及可能的值范围。

例如：

```bash
KIND:     Pod
VERSION:  v1

DESCRIPTION:
     Pod is a collection of containers that can run on a host. This resource is created
     by clients and scheduled onto hosts.
...
...
```

在这个示例中，描述了 Pod 资源的基本信息，其中包括资源的类型（KIND）为 `Pod`，版本（VERSION）为 `v1`，以及对 Pod 的基本描述。

通过 `kubectl explain`，您可以深入了解 Kubernetes 中各种资源对象的定义，帮助您正确地创建和配置这些资源。







## 删除资源



```bash
# 删除一个配置文件对应的资源对象
kubectl delete -f xxx.yaml       
# 删除名字为baz或foo的pod和service                  
kubectl delete pod,service baz foo   
# -l 参数可以删除包含指定label的资源对象                                        
kubectl delete pods,services -l name=myLabel   
# 强制删除一个pod，在各种原因pod一直terminate不掉的时候很有用 
kubectl delete pod foo --grace-period=0 --force 
```

```bash
kubectl delete pods imagename
```

删除pod：

```bash
[root@javaedge-k8s-node-1 ~]# kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/javaedge-nginx-6996b98cc4-f28r2   1/1     Running   0          3h5m

NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/javaedge-nginx   NodePort    10.99.205.238   <none>        90:32708/TCP   159m
service/kubernetes       ClusterIP   10.96.0.1       <none>        443/TCP        20h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/javaedge-nginx   1/1     1            1           3h5m

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/javaedge-nginx-6996b98cc4   1         1         1       3h5m
[root@javaedge-k8s-node-1 ~]# kubectl delete service/javaedge-nginx pod/javaedge-nginx-6996b98cc4-f28r2
service "javaedge-nginx" deleted
pod "javaedge-nginx-6996b98cc4-f28r2" deleted
[root@javaedge-k8s-node-1 ~]# kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/javaedge-nginx-6996b98cc4-bzlrh   1/1     Running   0          14s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   20h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/javaedge-nginx   1/1     1            1           3h6m

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/javaedge-nginx-6996b98cc4   1         1         1       3h6m
[root@javaedge-k8s-node-1 ~]# 
```

发现删除不了，删了一个会出现一个新的，这是因为k8s管理了容器，有一个备份，如果宕机一个节点，那么会再启动一个pod。强制删除：

```bash
# --grace-period=参数用于指定执行强制删除操作的优雅周期（Grace Period）。该值表示删除 Pod 前等待的时间（以秒为单位），以确保容器内的所有进程平滑地终止并清理任何正在进行中的任务。如果未提供--grace-period参数的值，默认值为0，表示立即强制删除 Pod。 
[root@javaedge-k8s-node-1 ~]# kubectl delete pod javaedge-nginx-6996b98cc4-6npvx  --grace-period=0 --force --namespace default
TODO 但是好像还是修不了，唉！

## 或
kubectl patch pod xxx -n xxx -p '{"metadata":{"finalizers":null}}'
```

查看 Pod 属于哪个命名空间：

```
kubectl get pods javaedge-nginx-6996b98cc4-6npvx -o yaml | grep namespace
```



## 更新资源

```bash
# 将foo.yaml中描述的对象扩展为3个
kubectl scale --replicas=3 -f foo.yaml
# 增加description='my frontend'备注,已有保留不覆盖
kubectl annotate pods foo description='my frontend' 
# 增加status=unhealthy 标签，已有则覆盖
kubectl label --overwrite pods foo status=unhealthy 
```

kubectl scale rs nginx --replicas=2 更新某 pod 内集群数：

![](https://img-blog.csdnimg.cn/20201230145136314.png)
![](https://img-blog.csdnimg.cn/20201230145258337.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)



## 创建资源

```bash
# 创建一个service，暴露 nginx 这个rc
[root@javaedge-monitor-platform-dev k8s]# kubectl expose deployment nginx-deployment --type=NodePort
service/nginx-deployment exposed
```

若你刚创建完了就后悔了，那么删除它：

```bash
[root@javaedge-monitor-platform-dev k8s]# kubectl expose deployment nginx-deployment --type=NodePort
Error from server (AlreadyExists): services "nginx-deployment" already exists
[root@javaedge-monitor-platform-dev k8s]# kubectl delete services nginx-deployment
service "nginx-deployment" deleted
[root@javaedge-monitor-platform-dev k8s]# 
```





```bash
[root@javaedge-monitor-platform-dev k8s]# kubectl get svcNAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
kubernetes         ClusterIP   10.96.0.1       <none>        443/TCP        5d16h
nginx-deployment   NodePort    10.107.209.46   <none>        80:31860/TCP   8s
[root@javaedge-monitor-platform-dev k8s]# 
```

31860，即该 Nginx 监听了 minikube（或者说是 k8s 集群的 node 的地址） 的31860端口。这就实现了服务的对外访问的暴露。

```bash
[root@javaedge-monitor-platform-dev k8s]# minikube ip
192.168.49.2
[root@javaedge-monitor-platform-dev k8s]# curl 192.168.49.2:31860
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
[root@javaedge-monitor-platform-dev k8s]# 
```



切换上下文：

```bash
kubectl config use-context xxx
```

参考

- https://kubernetes.io/docs/tasks/tools/