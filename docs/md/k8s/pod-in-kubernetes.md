# Kubernetes调度单位Pod

## 1 Pod简介



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/308b8381d61e84912f30657b4de009ca.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/f2ef0b60a8261d25ed311063eb425207.png)

不直接操作容器container。

一个 pod 可包含一或多个容器（container），它们共享一个 namespace（用户，网络，存储等），其中进程之间通过 localhost 本地通信，就相当于我们在本地起两个进程。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/cd84d1a576fcc8a7bb8ab149af7526f6.png)



## 2 创建 Pod

### 2.1 创建yml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx
    ports:
    - containerPort: 80
```

### 2.2 按yaml创建

```bash
$ kubectl create -f pod_nginx.ymlpod/nginx created
```

## 3 查看 Pod



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/84a98af202892387a9a09f600fe89013.png)


```bash
$ kubectl get pods
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          5s
```

第一次运行状态字段为 pull，因为要先拉取 nginx 的 image，ready：

```bash
$ kubectl get pods
NAME                                          READY   STATUS      RESTARTS   AGE
nginx     0/1     ImagePullBackOff     0          57s
```

查看 docker 面板，已成功拉取下来 nginx 镜像，再次查看：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/1a63af98f3e83d6438497e4a5507e142.png)

ready 为 1，说明已启动：

```bash
$ kubectl get pods
NAME                                          READY   STATUS      RESTARTS   AGE
nginx     1/1     Running     0          5m4s
```

pod 里面现在运行了一个 nginx 的 container。

### 3.1 查看详情

```bash
$ kubectl get pods -o wide
NAME    READY   STATUS    RESTARTS   AGE   IP           NODE       NOMINATED NODE   READINESS GATES
nginx   1/1     Running   0          82s   10.244.0.4（容器的地址）   minikube（在minikube的节点上）   <none>           <none>
```

### 3.2 进入容器

如查看其imageid

#### Linux

因为minikube安装的 k8s 单节点：

```bash
$ minikube ssh
Last login: Wed May 10 15:23:19 2023 from 192.168.49.1
docker@minikube:~$ docker ps
CONTAINER ID   IMAGE                       COMMAND                  CREATED          STATUS          PORTS     NAMES
48f7294a924d   nginx                       "/docker-entrypoint.…"   4 minutes ago    Up 4 minutes              k8s_nginx_nginx_default_6cfb9180-9961-46f3-9298-c53d2f40cb1b_0
```

注意名为“k8s_nginx_nginx_default_6cfb9180”的容器，其 container id=48f7294a924d，进入它：

```bash
docker@minikube:~$ docker exec -it 48f7294a924d sh
# exit
docker@minikube:~$ 
```

先检查网络：

```bash
$ docker network ls
NETWORK ID     NAME                          DRIVER    SCOPE
64ad1eca60f7   bridge                        bridge    local
hzirct52ilxb   demo                          overlay   swarm
9d1d55a25a87   docker_gwbridge               bridge    local
4689aefb8f9b   docker_my-bridge              bridge    local
8f8808195e46   examplevotingapp_back-tier    bridge    local
d9026565f4d5   examplevotingapp_front-tier   bridge    local
a18dcc0c886d   flaskredis_default            bridge    local
f2f555bed377   host                          host      local
muao6in9raiq   ingress                       overlay   swarm
103c61be6a54   minikube                      bridge    local
d02380dd3da4   none                          null      local

$ docker network  inspect bridge
...
```

进入容器：

```bash
$ kubectl exec -it nginx-1 -- sh
# ls
bin   dev                  docker-entrypoint.sh  home  lib64  mnt  proc  run   srv  tmp  var
boot  docker-entrypoint.d  etc                   lib   media  opt  root  sbin  sys  usr
```

若有两个 Nginx，默认进入第一个，-c 选项可指定进入哪一个。

#### Mac

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/07759a79fb2be7531a6e010dc5dfdad9.png)

直接点击 cli 工具进入：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/b0f23ebe977cbeefd386601b26f9ea08.png)

须通过 dockercli 才能访问里面的 nginx：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/16c4c0cd4db4c501897128d309cca8ef.png)

无法在本地命令行直接通信：

```bash
# 本地 PC 执行
$  curl 100.65.143.216:80
curl: (28) Failed to connect to 100.65.143.216 port 80 after 75813 ms: Couldn't connect to server
```

```bash
$ ping 100.65.143.216
PING 100.65.143.216 (100.65.143.216): 56 data bytes
Request timeout for icmp_seq 0
Request timeout for icmp_seq 1
```

### 3.3 本地PC通信

咋才能映射一个可访问ip，本地也能与 nginx 通信？

本地 PC：

```bash
# 建立本地与Pod之间的连接: 将本地机器的8086端口与Pod nginx的80端口连接起来
# 实现远程访问: 通过访问本地的8086端口，就可以访问到Pod nginx的80端口上运行的服务
$ pod-basic kubectl port-forward nginx 8086:80

Forwarding from 127.0.0.1:8086 -> 80
Forwarding from [::1]:8086 -> 80
Handling connection for 8086
Handling connection for 8086
```

```
**Forwarding from ...:** 表示正在将本地端口转发到Pod端口。

**127.0.0.1:** 本地回环地址，表示本地机器。

**[::1]:** IPv6的回环地址，也表示本地机器。

**Handling connection:** 表示正在处理连接。
```

#### 应用场景

- **调试Pod中的服务:** 在开发过程中，可以通过端口转发来方便地调试Pod中运行的服务
- **访问Pod内部的Web服务:** 如果Pod中运行了一个Web服务，可以通过端口转发来从本地访问这个服务

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/4fa9476ae52bfa1c18ad8805c60b5c99.png)

但这样如果把该命令停止，就无法访问。

## 4 删除 pod

### 4.1 若已存在

 删除失败：

```bash
$ kubectl create -f pod_nginx.yml
Error from server (AlreadyExists): error when creating "pod_nginx.yml": pods "nginx" already exists
```

### 4.2 就想删除

```bash
$ kubectl delete -f pod_nginx.yml
pod "nginx" deleted
$ kubectl get pods
No resources found in default namespace.
```