# 00-为啥选择 kubesphere

## 1 开发痛点

单体向分布式架构演变，基础模块及业务模块越来越多，开发很多时间都忙在打包部署：

- 修 Bug 然后打包部署
- 上线打包部署
- 每次上线全团队折腾至深夜
- 效率低下，版本延迟

## 2 Jenkins自动化部署

为提高效率，引入 Jenkins 解决大最基础的部署问题：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets//image-20240116133411920.png)

## 3 Kubernetes

Jenkins 已大幅提高效率，但还存在问题：

- 服务太多，每次部署要排队
- 虚拟机太多，维护 Shell 脚本成本高
- 资源利用率低，没用到点上

自建 K8s 集群，可解决繁锁的 Shell 脚本问题，结合 Jenkins 的 K8s 的插件，通过 Dockerfile + Yaml 部署。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/EhMglquf8XPHibWku1IRmFM0XAJN1Yv1pnwg8tDiaudDSMibrTQ3FrOb2Pn0xqIFgktQ5G6NAwAXQNib1yBwef5SMQ/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)

### 自建 K8s 的困难

- 运维集群困难，缺乏简单方便的可视化工具，团队大多是一线开发，网络知识不深入，运维经验有限
- 操作 K8s 都是纯脚本，维护困难，缺乏可视化工具，应用部署与配置修改全靠命令脚本手动执行
- 依旧无法回收服务器权限，排查问题还是要上 K8s，缺少资源监控与调度

## 4 就你了，KubeSphere！

调研使用了各种K8s可视化管理工具，对比国外开源的 Kubernetes Dashboard、Rancher，KubeSphere 还是比较适合国内程序员宝宝：

- 可视化的 K8s 管理工具，包含所有 K8s 功能
- DevOps一体化，降低部署复杂度，应用生命周期
- 多租户管理，满足不同部门的业务隔离需求
- 集成角色权限管理功能，满足对不同人员分配不权限的需求
- 在线日志查看，降低对服务器用户的管理
- 集群可视化管理，监控可视化

## 5 落地部署

### 5.1 当前架构部署



### 5.2 KubeSphere生产环境规划与安装

- 3 个 Master Node：8C 16G 100G
- 10+ Worker Node（初期），20+ Worker Node（后续增加）

部署SpringCloud的微服务套件，包括Eureka，Redis, 电商平台的微服务，如商品、订单、会员等。ToB 微服务，企业数字化 10+ 项目。

## 6  KubeSphere使用规则

### 团队及项目划分

- 按子公司及不同的端建议不同的企业空间 -- 企业空间
- 在项目管理中按不同的业务线，建立不同的项目组合
- 创建的用户，按 platform-regular 的角色
- 在企业空间、项目管理、流水线中添加成员



![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240116153005021.png)

### 6.2 节点管理及部署



- 节点标签，为每个节点配置标签，和 yml 配合使用
- 不使用主机网络模式
- 重要数据文件，挂载到宿主机目录
- 对外服务需提供 NodePort 配置

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240116153119586.png)



![image-20240116153133767](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240116153133767.png)



## 7 KubeSphere效果



- 全流程的 DevOps，释放开发频繁打包部署的工作，专注研发
- 可视化的资源监控，配合告警等措施，提升运维的能力
- 多租户，多空间，项目的隔离，使用者权限的分管，让跨业务团队的管理更精准
- 缩减原来的虚拟主机（4C 8G），组成资源更大的节点，资源利用率提升
- 支持在线化的动态扩容，操作方便，想增加或减少实例，操作一下就搞定
- 前端也实现虚器化部署，释放手动打包上传的工作量

## 8 Q&A

当时官方提供的 Maven 版本不是 3.6 的版本，如何解决？

自己制作了一个 3.6 的 Maven 基础镜像，然后在 Clusterconfiguration，找到 Maven 的 image，修改即可。



自建了nexus，如何修改 maven setting.xml？

在 CRDs 筛选 kubesphere-devops-system，找到 ks-install，修改里面的 maven setting.xml 即可，修改后，要登录 Jenkins，重新 reload 配置。



如何访问 Jenkins？

解决：Master 的 ip + 30180，登录帐号密码和 KubeSphere 的管理员。可以参考文件：https://juejin.cn/post/7124589639536476190



在容器中如何访问共享文件？

通过挂截 NFS 系统来访问。



容器中的文件随着容器销毁而消失，想要保存更长时间文件？

解决：通过挂截宿主机的文件/或磁盘。



容器在滚动部署过程中会被销毁，其他服务调用还是走旧 IP 访问，404？

解决：通过在 Kubernetes 的 Service 来调用（SVC）。



DevOps 与自建 Gitlab 搭配怎么触发构建？

解决：进入 Jenkins 在流水线上使用通用钩子触发。

## 9 规划

通过引入KubeSphere中间件管理平台，极大地提交了整体的交付效率，节省在部署环节的时间支付，通过工具更好的实现了CICD；提供了可视化的资源界面，能更清楚地知道各个服务器的资源使用情况，做到很好的监控。

随着平台的使用成熟，越来越多业务迁入平台，包括前端、java、或者其他子公司的业务。