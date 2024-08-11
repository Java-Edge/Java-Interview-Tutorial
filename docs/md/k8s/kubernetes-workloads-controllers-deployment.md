# Kubernetes工作负载资源之Deployment

## 0 前言

一个 Deployment 控制器为 Pods、ReplicaSets 提供声明式的更新能力。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/fc93ed25d1d650d284828cf5334fa13c.png)

你负责描述 Deployment 中的目标状态，而 Deployment 控制器以受控速率更改实际状态，使其变为期望状态。你可定义 Deployment 以创建新 ReplicaSet 或删除现有 Deployment， 并通过新的 Deployment 收养其资源。

> 不要管理 Deployment 所拥有的 ReplicaSet 。 如存在下面未覆盖的使用场景，请考虑向 k8s提出 Issue。

## 1 适用场景

创建 Deployment 以将 ReplicaSet 上线。ReplicaSet 在后台创建 Pods。检查 ReplicaSet 的上线状态，查看其是否成功。

通过更新 Deployment 的 PodTemplateSpec，声明 Pod 的新状态 。新 ReplicaSet 会被创建，Deployment 以受控速率将 Pod 从旧 ReplicaSet 迁移到新 ReplicaSet。每个新的 ReplicaSet 都会更新 Deployment 的修订版本。

若 Deployment 的当前状态不稳定，回滚到较早的 Deployment 版本。 每次回滚都会更新 Deployment 的修订版本。

扩大 Deployment 规模以承担更多负载。

暂停 Deployment 以应用对 PodTemplateSpec 所作的多项修改， 然后恢复其执行以启动新的上线版本。

使用 Deployment 状态来判定上线过程是否出现停滞。

清理旧的不再需要的 ReplicaSet。

## 2 启动 pod

### 2.1编写yaml

编写deployment_nginx.yml，创建了一个 ReplicaSet，负责启动三个 nginx Pods：

```yaml
apiVersion: apps/v1
kind: Deployment  # 资源类型
metadata:
  name: nginx-deployment  # Deployment的名称
  labels:
    app: nginx  # 标签，用于标识这个Deployment
spec:
  replicas: 3  # 指定Pod的副本数量
  selector:
    matchLabels:
      app: nginx  # 选择器，用于匹配具有指定标签的Pod
  template:
    metadata:
      labels:
        app: nginx  # Pod模板的标签，与选择器匹配
    spec:
      containers:
      - name: nginx  # 容器的名称
        image: nginx:1.12.2  # 使用的镜像
        ports:
        - containerPort: 80  # 容器监听的端口
```

### 2.2 启动

```bash
$ kubectl create -f deployment_nginx.yml
deployment.apps/nginx-deployment created

$ kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx                         3         3         3       2m9s
nginx-deployment-655c8cc5f8   3         3         3       118s
```

## 3 检查 Deployment

关注是否已创建

### 3.1 kubectl get deployments

```bash
$ kubectl get deployments
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3           3           401d
```

### 3.2 字段解释

- NAME
  集群中 Deployment 的名称。
- READY
  应用程序的可用的副本数。显示的模式是“就绪个数/期望个数”
- UP-TO-DATE
  为达到期望状态，已更新的副本数
- AVAILABLE
  应用可供用户使用的副本数
- AGE
  应用程序运行的时间

注意期望副本数是根据 .spec.replicas 字段设置3。

```bash
kubectl get deployment -o wide
```

## 4 更新 Deployment

> 仅当 Deployment Pod 模板（即 .spec.template）发生改变时，如模板的标签或容器镜像被更新， 才触发 Deployment 上线。 其他更新（如对 Deployment 执行扩缩容）不会触发上线动作。

### 先更新 nginx Pod

以使用 nginx:1.13 镜像，而非旧的 nginx:1.12.2 镜像：

```bash
kubectl --record deployment.apps/nginx-deployment set image \
   deployment.v1.apps/nginx-deployment nginx=nginx:1.9.1
```

或如下命令：

```bash
kubectl set image deployment nginx-deployment nginx=nginx:1.13
```

## 5 检查 Deployment 上线历史

检查回滚历史的标准步骤。

### 5.1 检查 Deployment 修订历史：

```bash
$ kubectl rollout history deployment.v1.apps/nginx-deployment
deployment.apps/nginx-deployment 
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
```

**CHANGE-CAUSE** 的内容是从 Deployment 的 kubernetes.io/change-cause 注解复制过来的。 复制动作发生在修订版本创建时。

可通过如下方式

### 5.2 设置 CHANGE-CAUSE 的信息

```bash
kubectl annotate deployment.v1.apps/nginx-deployment kubernetes.io/change-cause="image updated to 1.9.1"
```

为 Deployment 添加注解。追加 --record 命令行标志以保存正在更改资源的 kubectl 命令。手动编辑资源的清单。

## 6 图解滚动发布



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/cc4d021faac032fddde732ac5dba2a1a.png)