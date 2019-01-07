笔记本/台式机电脑的性能足够强劲（内存不低于 8G），可以直接安装 docker-desktop，并启用其中内嵌的 Kubernetes 集群，用做学习、测试，也可以用作日常开发。

# 下载 docker-desktop
从 docker 下载 docker-desktop (opens new window)，并完成安装

# 启用 Kubernetes 集群
MAC
启动 docker-desktop
打开 docker-desktop 的 preference 面板
![](https://img-blog.csdnimg.cn/20201230114051360.png)

切换到 Kubernetes 标签页

并勾选启动 Enable Kubernetes，点击 Apply
![](https://img-blog.csdnimg.cn/20201230114128502.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

```bash
kubectl config view
```
![](https://img-blog.csdnimg.cn/20201230114528963.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

```bash
kubectl config get-contexts
```
![](https://img-blog.csdnimg.cn/20201230114602407.png)

```bash
kubectl cluster-info
```
![](https://img-blog.csdnimg.cn/20201230122623807.png)

```
kubectl get pods -o wide
```

![](https://img-blog.csdnimg.cn/20201230133412779.png)

```
docker network inspect bridge
```

```json
[
    {
        "Name": "bridge",
        "Id": "e6a5227c83898fa2904259426de838145d62539d01fb7f3fe241f65db38a3c3b",
        "Created": "2020-12-30T02:51:44.917984338Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.17.0.0/16",
                    "Gateway": "172.17.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {},
        "Options": {
            "com.docker.network.bridge.default_bridge": "true",
            "com.docker.network.bridge.enable_icc": "true",
            "com.docker.network.bridge.enable_ip_masquerade": "true",
            "com.docker.network.bridge.host_binding_ipv4": "0.0.0.0",
            "com.docker.network.bridge.name": "docker0",
            "com.docker.network.driver.mtu": "1500"
        },
        "Labels": {}
    }
]
```

- 另一种进入nginx容器的方法
```
kubectl exec -it nginx sh
```
![](https://img-blog.csdnimg.cn/2020123013362484.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
> kubectl exec [POD] [COMMAND] is DEPRECATED and will be removed in a future version. Use kubectl exec [POD] -- [COMMAND] instead.

因为刚才创建的 nginx pod 里只有一个容器，所以我们就进入了那个。可如果nginx pod 里有俩容器，默认只会进第一个，如何进第二个呢？

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
# 删除资源

```bash
kubectl delete -f xxx.yaml                      # 删除一个配置文件对应的资源对象  
kubectl delete pod,service baz foo              # 删除名字为baz或foo的pod和service  
kubectl delete pods,services -l name=myLabel    # -l 参数可以删除包含指定label的资源对象                            
kubectl delete pod foo --grace-period=0 --force # 强制删除一个pod，在各种原因pod一直terminate不掉的时候很有用
```

```bash
kubectl delete pods imagename
```
# 更新资源
```bash
# 将foo.yaml中描述的对象扩展为3个
kubectl scale --replicas=3 -f foo.yaml
# 增加description='my frontend'备注,已有保留不覆盖
kubectl annotate pods foo description='my frontend' 
# 增加status=unhealthy 标签，已有则覆盖
kubectl label --overwrite pods foo status=unhealthy 
```
- kubectl scale rs nginx --replicas=2 更新某 pod 内集群数
![](https://img-blog.csdnimg.cn/20201230145136314.png)
![](https://img-blog.csdnimg.cn/20201230145258337.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 创建资源
```bash
# 创建一个service，暴露 nginx 这个rc
kubectl expose deployment nginx-deployment --type=NodePort
```
![](https://img-blog.csdnimg.cn/20201230163612837.png)
- kubectl get svc![](https://img-blog.csdnimg.cn/20201230163704898.png)
切换上下文

```
kubectl config use-context xxx 即可
```
