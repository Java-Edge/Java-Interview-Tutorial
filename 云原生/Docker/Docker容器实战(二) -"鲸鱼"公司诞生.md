![](https://ask.qcloudimg.com/http-save/1752328/2dg9glp5jt.png)

一天天的,PaaS深入人心，Cloud Foundry为首的传统PaaS，开始蓄力基础设施领域的

**平台化**和**PaaS化**,于是发现了PaaS中的问题。

# 0 虚拟化

![](https://img-blog.csdnimg.cn/20210130181042995.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 一个物理机可以部署多个app
- 每个app独立运行在一个VM里

## 虚拟化的优点
- 资源池
一个物理机的资源分配到不同的虚拟机里
- 很容易扩展
加物理机器or加虚拟机
- 很容易云化
亚马逊AWS、阿里云


## 虚拟化的局限性
每一个虚拟机都是一个完整的操作系统 ,要给其分配资源，当虚拟机数量增多时,操作系统本身消耗的资源势必增多

- 开发和运维的挑战
![](https://img-blog.csdnimg.cn/20210130181359864.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
## 容器解决了什么问题
![](https://img-blog.csdnimg.cn/20210130181428699.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 解决了开发和运维之间的矛盾
- 在开发和运维之间搭建了一个桥梁,是实现devops的最佳解决方案

## 什么是容器
![](https://img-blog.csdnimg.cn/2021013018164982.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 对软件和其依赖的标准化打包
- 应用之间相互隔离
- 共享同一个OS Kernel
- 可以运行在很多主流操作系统上

- 容器 V.S 虚拟机
![=](https://img-blog.csdnimg.cn/20210130181622725.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


- 虚拟化+容器
![](https://img-blog.csdnimg.cn/20210130181605762.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- Docker，容器技术实现的一种
![](https://img-blog.csdnimg.cn/20210130181532518.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 1 如何给应用打包

Cloud Foundry/OpenShift/Clodify都没给出答案，走向碎片化歪路

此时，名不见经传的PaaS创业公司dotCloud，却选择了开源自研的容器项目**Docker**

谁也不会料到,就这样一个平淡无奇古天乐一般的技术，开启了名为“Docker”的新时代

这个🐳公司，最重要的战略之一就是：坚持把**“开发者”群体放在至高无上的位置**

 Docker项目的推广策略从一开始就呈现出一副“憨态可掬”的亲人姿态，把每一位后端技术人员（而不是资本家）作为主要的传播对象。

简洁的UI，有趣的demo，“1分钟部署一个WordPress网站”“3分钟部署一个Nginx集群”，这种同开发者之间与生俱来的亲近关系，使Docker项目迅速成为了全世界会议上最受追捧的新星

> Docker项目，给后端开发者提供了走向聚光灯的机会
> 比如Cgroups和Namespace这种已经存在多年却很少被人们关心的特性，在2014年和2015年竟然频繁入选各大技术会议的分享议题，就因为听众们想要知道Docker这个东西到底是怎么一回事儿。

- **一方面解决了应用打包和发布这一困扰运维人员多年的技术难题**
- **另一方面，第一次把一个纯后端的技术概念，通过友好的设计和封装，交到开发者手里**

不需要精通TCP/IP/Linux内核原理，一个前端或者网站的后端工程师，都会对如何把自己的代码打包成一个随处可以运行的Docker镜像充满好奇和兴趣。

**解决了应用打包这个根本问题，同开发者与生俱来的亲密关系，再加上PaaS概念已深入人心的契机，成为Docker平淡无奇项目一炮而红的重要原因**

一个以“容器”为中心的、全新的云计算市场，正呼之欲出

而作为这个生态的一手缔造者，此时的dotCloud公司突然宣布将公司名称改为 **`Docker`**

Docker公司在2014年

# 2 发布Swarm项目

虽然通过“容器”完成对经典PaaS的“降维打击”，但是Docker项目和Docker公司还得回到PaaS项目原本躬耕多年的田地：

**`如何让开发者把应用部署在我的项目上`**

Docker项目从发布之初就全面发力，从技术/社区/商业/市场全方位争取到的开发者群体，实际上为此后吸引整个生态到自家“PaaS”上的一个铺垫

**只不过这时，“PaaS”的定义已全然不是Cloud Foundry描述的那样，而是变成了一套以Docker容器为技术核心，以Docker镜像为打包标准的、全新的“容器化”思路**

**这正是Docker项目从一开始悉心运作“容器化”理念和经营整个Docker生态的主要目的**

而Swarm项目，正是接下来承接Docker公司所有这些努力的关键所在

# 3 总结

## 3.1 Docker项目迅速崛起的原因

- Docker镜像通过技术手段解决了PaaS的根本性问题
- Docker容器同开发者之间有着与生俱来的密切关系
- PaaS概念已经深入人心的完美契机。

崭露头角的Docker公司，终于以一个更加强硬的姿态来面对这个曾经无比强势，但现在却完全不知所措的云计算市场

而2014年底的DockerCon欧洲峰会，才正式拉开了Docker公司扩张的序幕!

# 参考

- docker官网
- Docker实战
- 深入剖析Kubernetes