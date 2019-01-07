集群是通过 desktop k8s集群创建的

# 创建两个 pod

![](https://img-blog.csdnimg.cn/20201230171631219.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
查看 刚才创建的 nginx-pod的 ip![](https://img-blog.csdnimg.cn/20201231144959527.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 进入 busybox并查看网络
![](https://img-blog.csdnimg.cn/20201230171755578.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 在 busybox 中ping得通nginx-pod![](https://img-blog.csdnimg.cn/20201231144835180.png)
可在k8s 节点上任一 pod 里 ping 通其它 pod。
- 原理模型如下：
![](https://img-blog.csdnimg.cn/20201231145818490.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
