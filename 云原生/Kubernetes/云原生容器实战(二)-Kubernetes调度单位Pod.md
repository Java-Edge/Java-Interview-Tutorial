# K8S最小调度单位Pod
![](https://img-blog.csdnimg.cn/20210112220718366.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/2020122717311732.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

我们不直接操作容器container
一个 pod 里可包含一或多个container，共享一个 namespace（用户，网络，存储等），其中的进程之间通过 localhost 本地通信

- 创建一个 yml 文件，并创建

```
kubectl create -f pod_nginx.yml
```

![](https://img-blog.csdnimg.cn/20201230123615919.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

```
kubectl get pods
```
第一次运行状态字段为 pull，因为要先拉取 nginx 的 image，ready
![](https://img-blog.csdnimg.cn/20201230123831908.png)

- 查看 docker 面板，已经成功拉取下来 nginx 镜像，再次查看![](https://img-blog.csdnimg.cn/20201230124118185.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- ready 为 1，说明已启动![](https://img-blog.csdnimg.cn/2020123012415544.png)
pod 里面现在运行了一个 nginx 的 container，查看详情

```bash
kubectl get pods -o wide
```
![](https://img-blog.csdnimg.cn/20201230124514125.png)

如果想进入容器咋办呢？查看他的 imageid![](https://img-blog.csdnimg.cn/20201230124815316.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 直接点击 cli 工具进入
![](https://img-blog.csdnimg.cn/20201230125014402.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
但是我们必须通过 dockercli 才能访问里面的 nginx，无法在本地命令行直接通信![](https://img-blog.csdnimg.cn/20201230140725330.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201230140800829.png)
![](https://img-blog.csdnimg.cn/20201230140852190.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

那如何才能映射一个可访问的 ip，让我们在本地也能与 nginx 通信呢？
![](https://img-blog.csdnimg.cn/20201230142100447.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20201230141916719.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
但这样如果把该命令停止，就会无法访问了。
# 删除 pod
```bash
kubectl delete -f pod_nginx.yml
```
![](https://img-blog.csdnimg.cn/20201230142311875.png)
![](https://img-blog.csdnimg.cn/20201230142412869.png)
