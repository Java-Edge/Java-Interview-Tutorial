# 使用 Kubernetes 部署 Nginx 应用

## 0 环境

root@javaedge-k8s-node-1主机操作

node-1 master

node-2 slave

```bash
$ kubectl create deployment javaedge-nginx --image=nginx:1.24.0
deployment.apps/javaedge-nginx created

$ kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/javaedge-nginx-6996b98cc4-f28r2   1/1     Running   0          29s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   17h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/javaedge-nginx   1/1     1            1           29s

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/javaedge-nginx-6996b98cc4   1         1         1       29s

$ kubectl get all -o wide
NAME                                  READY   STATUS    RESTARTS   AGE   IP             NODE             NOMINATED NODE   READINESS GATES
pod/javaedge-nginx-6996b98cc4-f28r2   1/1     Running   0          15m   10.244.26.65   javaedge-k8s-node-2   <none>           <none>

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE   SELECTOR
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   17h   <none>

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS   IMAGES         SELECTOR
deployment.apps/javaedge-nginx   1/1     1            1           15m   nginx        nginx:1.24.0   app=javaedge-nginx

NAME                                        DESIRED   CURRENT   READY   AGE   CONTAINERS   IMAGES         SELECTOR
replicaset.apps/javaedge-nginx-6996b98cc4   1         1         1       15m   nginx        nginx:1.24.0   app=javaedge-nginx,pod-template-hash=6996b98cc4
```

可见，该 nginx 并未创建在 master 节点， 而去了 slave 节点。

## 1 端口暴露

pod的8088端口作为容器的8080端口进行映射，pod要对外提供访问，需有service才能被访问。可认为service是管理一组pod。

### 1.1 NodePort：把服务对外暴露公开



```bash
$@k8s-node-1 kubectl expose deployment javaedge-nginx  --port=90 --target-port=80 --type=NodePort
service/javaedge-nginx exposed

$@k8s-node-1 kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/javaedge-nginx-6996b98cc4-f28r2   1/1     Running   0          29m

NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/javaedge-nginx   NodePort    10.99.205.238   <none>        90:32708/TCP   3m48s
service/kubernetes       ClusterIP   10.96.0.1       <none>        443/TCP        18h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/javaedge-nginx   1/1     1            1           29m

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/javaedge-nginx-6996b98cc4   1         1         1       29m
```

- `90:32708/TCP` 中的 `90` 是 Service 的端口
- `32708` 是 NodePort 的端口，表示该 Service 被映射到 Node 的 `32708` 端口

因此，对外暴露的端口是 `32708`，而不是 `90`。k8s 集群中，可通过 `<NodeIP>:<NodePort>` 访问该 Service。

![](https://www.planttext.com/api/plantuml/png/RL4zQyCm4DtrAmxj3gOTadeeWP2r13gc6OHrJGNENP2lQQ3ql_SiMN5DivXdlNiVEgrxSL4-JvqXzWZsHRyMlWr0owSp4vA0tR6tu7euivyJ6oPnWJ0ckYr_EgIZK7d-ekfvTaui234SFmJuVM8Qe6EWQzCvmLxUQCTH6bZLyxXNZ9VGOWhhCzQ14TtYSijydUrLC9BhODC5jSWr4noS4u1ADPFRdxYy2rKCNiMofEmJdNi-FYphbJsO7tFhKi6-y0SpGLWi1kbu4SZofrgrzmx7QLq_b8NOEsx_YwoH_F2clm00)

添加一个新的 `Node` 组件，表示 Kubernetes 集群中的一个 Node。该 `Node` 上运行着 `Service` 的 `NodePort` 端口。`Service` 的 `NodePort` 端口将被映射到 Node 上的该端口。因此，外部客户端可通过 `<NodeIP>:<NodePort>` 访问该 Service：

-  `<NodeIP>` 是该 Node 的 IP 地址
-  `<NodePort>` 是 `NodePort: 32708`

#### PC浏览器访问



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/e8f256b1e0720aa1f735876b2cb5d94d.png)

把其中一个node关机。 查看node状态，刚才关机的node已not ready。但再次查看pod还有nginx pod，这就实现中间件容灾，一旦宕机，则可恢复重启。

删除 service：

```bash
kubectl delete service/javaedge-nginx
```

删除 deployment：

```bash
kubectl delete deployment/deployment_name
```

## 2 动态扩缩容（弹性伸缩）

### 2.1 扩容



```bash
[root@javaedge-k8s-node-1 ~]# kubectl get allNAME                                  READY   STATUS    RESTARTS   AGE
pod/javaedge-nginx-6996b98cc4-gncwc   1/1     Running   0          13m

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   21h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/javaedge-nginx   1/1     1            1           3h37m

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/javaedge-nginx-6996b98cc4   1         1         1       3h37m


$ kubectl scale --replicas=2 deployment javaedge-nginx
deployment.apps/javaedge-nginx scaled


$ kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/javaedge-nginx-6996b98cc4-gncwc   1/1     Running   0          13m
pod/javaedge-nginx-6996b98cc4-n4qkk   1/1     Running   0          8s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   21h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/javaedge-nginx   2/2     2            2           3h37m

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/javaedge-nginx-6996b98cc4   2         2         2       3h37m
```

当突然高并发时，就能临时扩容。

### 2.2 缩容

现在流量平稳了，咱们

```bash
$ kubectl scale --replicas=1 deployment javaedge-nginx
deployment.apps/javaedge-nginx scaled

$ kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/javaedge-nginx-6996b98cc4-gncwc   1/1     Running   0          16m

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   21h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/javaedge-nginx   1/1     1            1           3h40m

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/javaedge-nginx-6996b98cc4   1         1         1       3h40m
```

可见 pod/javaedge-nginx-6996b98cc4-n4qkk被干掉。

### 2.3 删除容器



```bash
$ kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/javaedge-nginx-6996b98cc4-gncwc   1/1     Running   0          21m

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   21h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/javaedge-nginx   1/1     1            1           3h45m

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/javaedge-nginx-6996b98cc4   1         1         1       3h45m

# 删除部署信息，pod也会随之删除
$ kubectl delete deployment.apps/javaedge-nginx
deployment.apps "javaedge-nginx" deleted
[root@javaedge-k8s-node-1 ~]# kubectl get all
NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   21h
# 删除service信息
$ kubectl delete service/javaedge-nginx
```



## 3 负载均衡

之前设置那个是节点类型，现在使用集群类型，可实现负载均衡 port: 集群端口 target-port: 内部nginx

默认端口 ClusterIP: 集群方式，k8s会自动分配一个集群ip。

### 3.1 新建deployment



```bash
[root@javaedge-k8s-node-1 ~]# kubectl create deployment edge-nginx --image=nginx:1.24.0
deployment.apps/edge-nginx created

$ kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/edge-nginx-6d57745bc8-pgmdk       1/1     Running   0          37s
pod/javaedge-nginx-6996b98cc4-m84s5   1/1     Running   0          7m49s

NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/javaedge-nginx   NodePort    10.109.194.31   <none>        90:31104/TCP   6m50s
service/kubernetes       ClusterIP   10.96.0.1       <none>        443/TCP        21h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/edge-nginx       1/1     1            1           37s
deployment.apps/javaedge-nginx   1/1     1            1           7m49s

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/edge-nginx-6d57745bc8       1         1         1       37s
replicaset.apps/javaedge-nginx-6996b98cc4   1         1         1       7m49s
```

### 3.2 端口暴露



```bash
$ kubectl expose deployment edge-nginx  --port=88 --target-port=80 --type=ClusterIP
service/edge-nginx exposed

$ kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/edge-nginx-6d57745bc8-pgmdk       1/1     Running   0          77s
pod/javaedge-nginx-6996b98cc4-m84s5   1/1     Running   0          8m29s

NAME                     TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
service/edge-nginx       ClusterIP   10.106.187.202   <none>        88/TCP         13s
service/javaedge-nginx   NodePort    10.109.194.31    <none>        90:31104/TCP   7m30s
service/kubernetes       ClusterIP   10.96.0.1        <none>        443/TCP        21h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/edge-nginx       1/1     1            1           77s
deployment.apps/javaedge-nginx   1/1     1            1           8m29s

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/edge-nginx-6d57745bc8       1         1         1       77s
replicaset.apps/javaedge-nginx-6996b98cc4   1         1         1       8m29s
```

所以，不能随便命名。

### 3.3 扩容



```bash
$ kubectl scale --replicas=3 deployment edge-nginx
deployment.apps/edge-nginx scaled

$ kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/edge-nginx-6d57745bc8-dm998       1/1     Running   0          9s
pod/edge-nginx-6d57745bc8-pgmdk       1/1     Running   0          3m57s
pod/edge-nginx-6d57745bc8-zsw9v       1/1     Running   0          9s
pod/javaedge-nginx-6996b98cc4-m84s5   1/1     Running   0          11m

NAME                     TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
service/edge-nginx       ClusterIP   10.106.187.202   <none>        88/TCP         2m53s
service/javaedge-nginx   NodePort    10.109.194.31    <none>        90:31104/TCP   10m
service/kubernetes       ClusterIP   10.96.0.1        <none>        443/TCP        21h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/edge-nginx       3/3     3            3           3m57s
deployment.apps/javaedge-nginx   1/1     1            1           11m

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/edge-nginx-6d57745bc8       3         3         3       3m57s
replicaset.apps/javaedge-nginx-6996b98cc4   1         1         1       11m

$ curl http://10.106.187.202:88/
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
```

nginx返回都一样，咋测试实现了负载均衡？

通过 k8s（不是 docker 的docker exec -it）进入容器内部，pod 是 k8s 最小单位，所以进入 pod 的 name：

```bash
$ kubectl exec -it edge-nginx-6d57745bc8-dm998 -- /bin/bash
root@edge-nginx-6d57745bc8-pgmdk:/# cd /usr/share/nginx/html
root@edge-nginx-6d57745bc8-dm998:/usr/share/nginx/html# apt-get update
root@edge-nginx-6d57745bc8-dm998:/usr/share/nginx/html# apt-get install
root@edge-nginx-6d57745bc8-zsw9v:/usr/share/nginx/html# vim index.html
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/f4be6e0df82e541bdeb4a31868a41053.png)

ctrl+d退出当前 pod，再对其他两个副本同样操作即可。

重新访问集群 ip：

```bash
curl http://10.106.187.202:88/
```

发现打印了不同的 JavaEdge 00x。

若动态扩容，新nginx节点会自动加入pod，进入负载均衡的效果。

## 4 yml描述文件

前面部署操作nginx容器都是通过命令，繁琐，不小心就失败。

可通过yaml配置文件实现容器部署，不需再写命令行。yaml就是对象描述文件，把要实现的容器作为一个对象去声明，指定他的相关属性。如将：

- 部署deployment作为yaml
- 构建pod作为yaml
- 实现负载均衡作为yaml
- 构建service作为yaml
- ……

运行： kubectl apply -f xxx.yaml 可实现文件中的内容：

```yml
apiVersion: apps/v1 ## 同k8s集群版本⼀致，通过kubectl api-versions查看
kind: Deployment ## 本配置⽂件的类型
metadata: ## 元数据，配置的⼀些基本属性和信息
  name: nginx-deployment ## 当前 Deployment 的命名
  labels: ## 标签，定义⼀个或多个资源，类似于 docker t
    app: nginx ## 设置key为app，value为nginx的标签
spec: ## 当前 Deployment 的具体描述，在k8s中的配置
  replicas: 2 ## 指定将要部署的应⽤副本数
  selector: ## 标签选择器，同上labels
    matchLabels: ## 匹配并选择包含标签app:nginx的相关资源
      app: nginx
  template: ## 使⽤Pod模板
    metadata: ## Pod元数据
      labels: ## Pod标签选择，选择包含[app:nginx]标签的Po
        app: nginx
    spec: ## 定义Pod中的容器详细描述
      containers: ## 同docker中的容器

      - name: my-nginx ## 容器名称
        image: nginx:1.24.0 ## 容器所使用的镜像名称及版本号
```

```bash
$ vim ngx-k8s_deployment.yaml

$ kubectl apply -f ngx-k8s_deployment.yaml
deployment.apps/nginx-deployment created
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/f379b0e1b8f829c15c75f4d1809fc626.png)

### 4.1 缩容

到1个咋办？

#### 修改 yaml

副本数改成1：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/092b8d221be16d5f617d380d1e7f9f28.png)

#### apply

```bash
$ kubectl apply -f ngx-k8s_deployment.yaml
deployment.apps/nginx-deployment configured
```

现在 pod 数和副本数都变成1：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/c7dbb3c2d3f458d9d27248441a280ffd.png)

```bash
$ kubectl expose deployment nginx-deployment  --port=88 --target-port=80 --type=NodePort --dry-run -o yaml
W0630 15:27:30.699552    3888 helpers.go:692] --dry-run is deprecated and can be replaced with --dry-run=client.
apiVersion: v1
kind: Service
metadata:
  creationTimestamp: null
  labels:
    app: nginx
  name: nginx-deployment
spec:
  ports:
  - port: 88
    protocol: TCP
    targetPort: 80
  selector:
    app: nginx
  type: NodePort
status:
  loadBalancer: {}
```

对此，新建yaml：

```yaml
apiVersion: v1
kind: Service
metadata:
  creationTimestamp: null
  labels:
    app: nginx
  name: nginx-deployment
spec:
  ports:
  - port: 89
    protocol: TCP
    targetPort: 80
  selector:
    app: nginx
  type: NodePort
status:
  loadBalancer: {}
```

```bash
$ kubectl apply -f k8s_ngx_expose.yaml
service/nginx-deployment created
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/514baa4ccded57c947aed5f26a0ad30c.png)

根据该端口访问也没问题：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/b80dacdeceadeb3d1fc10255782f91ab.png)

### 根据已有 pod 生成对应 yaml

```bash
$ kubectl get pod edge-nginx-6d57745bc8-dm998 -o yaml > k8s_ngx_pod.yaml
```

想先创建 deployment，再创建 service，也可写在一个 yaml，“---”分割：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/e7daf5e398fee3c60fcf3143ace4ae55.png)