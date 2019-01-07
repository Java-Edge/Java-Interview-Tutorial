一个 Deployment 控制器为 Pods 和 ReplicaSets 提供声明式的更新能力。
![](https://img-blog.csdnimg.cn/20210112221207576.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

你负责描述 Deployment 中的 目标状态，而 Deployment 控制器以受控速率更改实际状态， 使其变为期望状态。你可以定义 Deployment 以创建新的 ReplicaSet，或删除现有 Deployment， 并通过新的 Deployment 收养其资源。

> 不要管理 Deployment 所拥有的 ReplicaSet 。 如果存在下面未覆盖的使用场景，请考虑在 Kubernetes 仓库中提出 Issue。

# 场景
创建 Deployment 以将 ReplicaSet 上线。 ReplicaSet 在后台创建 Pods。 检查 ReplicaSet 的上线状态，查看其是否成功。
通过更新 Deployment 的 PodTemplateSpec，声明 Pod 的新状态 。 新的 ReplicaSet 会被创建，Deployment 以受控速率将 Pod 从旧 ReplicaSet 迁移到新 ReplicaSet。 每个新的 ReplicaSet 都会更新 Deployment 的修订版本。
如果 Deployment 的当前状态不稳定，回滚到较早的 Deployment 版本。 每次回滚都会更新 Deployment 的修订版本。
扩大 Deployment 规模以承担更多负载。
暂停 Deployment 以应用对 PodTemplateSpec 所作的多项修改， 然后恢复其执行以启动新的上线版本。
使用 Deployment 状态 来判定上线过程是否出现停滞。
清理较旧的不再需要的 ReplicaSet 。
# 创建 Deployment
下面是 Deployment 示例。其中创建了一个 ReplicaSet，负责启动三个 nginx Pods：
![](https://img-blog.csdnimg.cn/20201230151932819.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## 常用命令
### kubectl get deployments
- 检查 Deployment 是否已创建
![](https://img-blog.csdnimg.cn/20201230152411555.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
在检查集群中的 Deployment 时，所显示的字段有：
- NAME
集群中 Deployment 的名称。
- READY
应用程序的可用的 副本 数。显示的模式是“就绪个数/期望个数”。
- UP-TO-DATE
为了打到期望状态已经更新的副本数。
- AVAILABLE
应用可供用户使用的副本数。
- AGE
应用程序运行的时间。

请注意期望副本数是根据 .spec.replicas 字段设置 3。

```bash
kubectl get deployment -o wide
```
![](https://img-blog.csdnimg.cn/20201230152552424.png)
# 更新 Deployment
> 仅当 Deployment Pod 模板（即 .spec.template）发生改变时，例如模板的标签或容器镜像被更新， 才会触发 Deployment 上线。 其他更新（如对 Deployment 执行扩缩容的操作）不会触发上线动作。

按照以下步骤更新 Deployment：

先来更新 nginx Pod 以使用 nginx:1.13 镜像，而不是 nginx:1.12.2 镜像。

```bash
kubectl --record deployment.apps/nginx-deployment set image \
   deployment.v1.apps/nginx-deployment nginx=nginx:1.9.1
```
或使用如下命令
```bash
kubectl set image deployment nginx-deployment nginx=nginx:1.13
```

![](https://img-blog.csdnimg.cn/20201230155606597.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 检查 Deployment 上线历史
按照如下步骤检查回滚历史：

首先，检查 Deployment 修订历史：

```bash
kubectl rollout history deployment.v1.apps/nginx-deployment
```
输出：
![](https://img-blog.csdnimg.cn/20201230160137995.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
CHANGE-CAUSE 的内容是从 Deployment 的 kubernetes.io/change-cause 注解复制过来的。 复制动作发生在修订版本创建时。你可以通过以下方式设置 CHANGE-CAUSE 消息：

使用 kubectl annotate deployment.v1.apps/nginx-deployment kubernetes.io/change-cause="image updated to 1.9.1" 为 Deployment 添加注解。
追加 --record 命令行标志以保存正在更改资源的 kubectl 命令。
手动编辑资源的清单。
# 滚动发布
![](https://img-blog.csdnimg.cn/20210112221343847.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
