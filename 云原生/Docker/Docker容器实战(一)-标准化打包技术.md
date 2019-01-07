# 简介
相比于盛极一时的
- AWS
![](https://img-blog.csdnimg.cn/20190829000005552.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- OpenStack
![](https://img-blog.csdnimg.cn/20190829000158193.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 以Cloud Foundry为代表的PaaS项目，却成了当时云计算技术中的一股清流
![](https://img-blog.csdnimg.cn/20190829000421341.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
Cloud Foundry项目已经基本度过了最艰难的概念普及和用户教育阶段，开启了以开源PaaS为核心构建平台层服务能力的变革

只是,后来一个叫 **`Docker`** 的开源项目横空出世
当时还名叫**dotCloud**的**Docker**公司，也是PaaS热潮中的一员
![](https://img-blog.csdnimg.cn/20190829000752958.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)相比于Heroku、Pivotal、Red Hat等PaaS新宠，**dotCloud**微不足道，主打产品跟主流的Cloud Foundry社区脱节，门可罗雀!
**dotCloud**公司突然决定：开源自己的容器项目 **`Docker`**！！！

显然，这个决定在当时根本没人在乎。
“容器”这个概念从来就不是什么新鲜的东西，也不是Docker公司发明的。
即使在当时最热门的PaaS项目Cloud Foundry中，容器也只是其最底层、最没人关注的那一部分。

**PaaS项目被大家接纳的一个主要原因是它提供“应用托管”能力**
那时主流用户的普遍用法，就是租一批AWS或者OpenStack的虚拟机，然后像以前管理物理服务器那样，用脚本或者手工的方式在这些机器上部署应用。
当然，部署过程难免碰到云端虚拟机和本地环境不一致问题，当时的云计算服务，比的就是谁能更好模拟本地服务器环境，带来更好“上云”体验。
而PaaS开源项目的出现，就是当时解决这个问题的一个最佳方案。


虚拟机创建后，运维只需在这些机器上部署一个Cloud Foundry项目，然后开发者只要执行一条命令就能把本地的应用部署到云上：
```bash
cf push "My APP"
```
**`Cloud Foundry这样的PaaS项目，最核心的组件就是应用的打包和分发机制`**。
Cloud Foundry为每种主流编程语言都定义了一种打包格式，“cf push”等同于用户把应用的可执行文件和启动脚本打进一个压缩包内，上传到云上Cloud Foundry的存储中。

接着，Cloud Foundry会通过调度器选择一个可以运行这个应用的虚拟机，然后通知这个机器上的Agent把应用压缩包下载下来启动。

由于需要在一个虚拟机上启动很多个来自不同用户的应用，Cloud Foundry会调用操作系统的Cgroups和Namespace机制为每一个应用单独创建一个称作“沙盒”的隔离环境，然后在“沙盒”中启动这些应用进程
这样就实现了把多个用户的应用互不干涉地在虚拟机里批量地、自动地运行起来的目的。

**`这就是PaaS项目最核心的能力`**
这些Cloud Foundry用来运行应用的隔离环境，或者说“沙盒”，就是所谓的“容器”。

而Docker项目，实际上跟Cloud Foundry的容器并没有太大不同，所以在它发布后不久，Cloud Foundry的首席产品经理James Bayer就在社区里做了一次详细对比，告诉用户Docker实际上只是一个同样使用Cgroups和Namespace实现的“沙盒”而已，没有什么特别的黑科技，也不需要特别关注。

Docker项目迅速崛起。如此之快，以至于Cloud Foundry以及所有的PaaS社区还没来得及成为它的竞争对手，就直接出局。
Docker项目确实与Cloud Foundry的容器在大部分功能和实现原理上都是一样的，可偏偏就是这剩下的一小部分不一样的功能，成了Docker项目接下来“呼风唤雨”的不二法宝。

# Docker镜像

PaaS之所以能帮助用户大规模部署应用到集群里，是因为提供了一套**应用打包**的功能。打包功能恰好成了PaaS日后不断遭到用户诟病的一个“软肋”。
一旦用上了PaaS，用户就必须为每种语言、每种框架，甚至每个版本的应用维护一个打好的包。
这个打包过程，没有任何章法可循，更麻烦的是，明明在本地运行得好好的应用，却需要做很多修改和配置工作才能在PaaS里运行起来。而这些修改和配置，并没有什么经验可以借鉴，基本上得靠不断试错，直到你摸清楚了本地应用和远端PaaS匹配的“脾气”才能够搞定。

最后结局就是，“cf push”确实是能一键部署了，但是为了实现这个一键部署，用户为每个应用打包的工作可谓一波三折，费尽心机。

**`Docker镜像解决的，恰恰就是打包这个根本性问题`**
Docker镜像，其实就是一个压缩包。但这个压缩包内容比PaaS的应用可执行文件+启停脚本的组合就要丰富多了。
大多数Docker镜像是直接由一个完整操作系统的所有文件和目录构成，所以这个压缩包里的内容跟你本地开发和测试环境用的os一样。

假设你的应用在本地运行时，能看见的环境是CentOS 7.2操作系统的所有文件和目录，那么只要用CentOS 7.2的ISO做一个压缩包，再把你的应用可执行文件也压缩进去，那么无论在哪里解压这个压缩包，都可以得到与你本地测试时一样的环境。当然，你的应用也在里面！！！

这就是Docker镜像最厉害的地方：只要有这个压缩包在手，你就可以使用某种技术创建一个“沙盒”，在“沙盒”中解压这个压缩包，然后就可以运行你的程序了。
更重要的是，这个压缩包包含了完整的os文件和目录，也就是包含了这个应用运行所需要的所有依赖，所以你可以先用这个压缩包在本地进行开发和测试，完成之后，再把这个压缩包上传到云端运行。在这个过程中，你完全不需要进行任何配置或者修改，因为这个压缩包赋予了你一种极其宝贵的能力：**本地环境和云端环境的一致**！

**`这就是Docker镜像的精髓。`**

有了Docker镜像，PaaS里最核心的打包系统一下子就没了用武之地，最让用户抓狂的打包过程也随之消失了。
相比之下，在当今的互联网里，Docker镜像需要的操作系统文件和目录，可谓唾手可得。
所以，你只需要提供一个下载好的操作系统文件与目录，然后使用它制作一个压缩包即可，这个命令就是：
```bash
docker build "我的镜像"
```
一旦镜像制作完成，用户就可以让Docker创建一个“沙盒”来解压这个镜像，然后在“沙盒”中运行自己的应用，这个命令就是：
```bash
$ docker run "我的镜像"
```
当然，docker run创建的“沙盒”，也是使用Cgroups和Namespace机制创建出来的隔离环境。

Docker提供了一种非常便利的打包机制。直接打包了应用运行所需要的整个操作系统，保证了本地环境和云端环境的高度一致，避免了用户通过“试错”来匹配两种不同运行环境之间差异的痛苦过程。

不过，Docker项目固然解决了应用打包的难题，但正如前面所介绍的那样，它并不能代替PaaS完成大规模部署应用的职责。
遗憾的是，考虑到Docker公司是一个与自己有潜在竞争关系的商业实体，再加上对Docker项目普及程度的错误判断，Cloud Foundry项目并没有第一时间使用Docker作为自己的核心依赖，去替换自己那套饱受诟病的打包流程。
反倒是一些机敏的创业公司，纷纷在第一时间推出了Docker容器集群管理的开源项目（比如Deis和Flynn），它们一般称自己为CaaS，即Container-as-a-Service，用来跟“过时”的PaaS们划清界限。

而在2014年底的DockerCon上，Docker公司雄心勃勃地对外发布了自家研发的“Docker原生”容器集群管理项目Swarm，不仅将这波“CaaS”热推向了一个前所未有的高潮，更是寄托了整个Docker公司重新定义PaaS的宏伟愿望。

参考
- docker官网
- Docker实战
-  深入剖析Kubernetes