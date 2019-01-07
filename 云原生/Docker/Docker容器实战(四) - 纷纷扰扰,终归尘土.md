伴随着Docker公司的容器技术生态在云计算市场中站稳了脚跟，围绕着Docker项目进行的各个层次的集成与创新产品，也如雨后春笋般出现在这个新兴市场当中。
而Docker公司，不失时机地发布了Docker Compose、Swarm和Machine“三件套”，在重定义PaaS走出了最关键的一步。

这段时间大量围绕着Docker项目的网络、存储、监控、CI/CD，甚至UI项目纷纷出台，涌现出如Rancher、Tutum这样在开源与商业上均取得了巨大成功的创业公司。

2014~2015年间，容器社区真是热闹非凡。

繁荣背后,更多担忧,即对Docker公司商业化战略的种种顾虑。

Docker项目此时已经成为Docker公司一个商业产品。而开源，只是Docker公司吸引开发者群体的一个重要手段。
不过这么多年来，开源社区的商业化其实都是类似的思路，无非是高不高调、心不心急的问题罢了。

真正令大多数人不满意的是Docker公司在Docker开源项目的发展上，始终保持绝对权威,并在多场合挑战其他玩家（CoreOS、RedHat，谷歌微软）的切身利益。

其实在Docker项目刚刚兴起时
Google也开源了一个在内部使用多年、经历过生产环境验证的Linux容器
# 1 lmctfy（Let Me Container That For You）
![](https://img-blog.csdnimg.cn/20190903001505838.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

然而，面对Docker项目的强势崛起，这个对用户没那么友好的Google容器项目根本没有招架之力。所以，知难而退的Google公司，向Docker公司表示了合作的愿望：关停这个项目，和Docker公司共同推进一个中立的容器运行时（container runtime）库作为Docker项目的核心依赖。

不过，Docker公司并没有认同这个明显会削弱自己地位的提议，还在不久后，自己发布了一个容器运行时库
# 2 Libcontainer
![](https://img-blog.csdnimg.cn/20190903003257729.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
这次匆忙的、由一家主导的、并带有战略性考量的重构，成了Libcontainer被社区长期诟病代码可读性差、可维护性不强的一个重要原因。

至此，Docker公司在容器运行时层面上的强硬态度，以及Docker项目在高速迭代中表现出来的不稳定和频繁变更的问题，开始让社区叫苦不迭。

这种情绪在2015年达到了一个小高潮，容器领域的其他几位玩家开始商议“切割”Docker项目的话语权 --- 成立一个中立的基金会。
2015年6月22日，由Docker公司牵头，CoreOS、Google、RedHat等公司共同宣布，Docker公司将Libcontainer捐出，并改名为
# 3 runc
![](https://img-blog.csdnimg.cn/20190903003421391.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)交由一个完全中立的基金会管理，然后以runc为依据，大家共同制定一套容器和镜像的标准和规范。
这套标准和规范，就是
# 4 **OCI（ Open Container Initiative ）**
![](https://img-blog.csdnimg.cn/20190904001537969.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
OCI的提出，意在将容器运行时和镜像的实现从Docker项目中完全剥离出来
- 一方面可以改善Docker公司在容器技术上一家独大的现状
- 另一方面也为其他玩家不依赖于Docker项目构建各自的平台层能力提供了可能

OCI更多是高端玩家出于自身利益一个妥协结果
尽管Docker是OCI的发起者和创始成员，却很少在OCI的技术推进和标准制定等事务上扮演关键角色，也没动力推进这些所谓标准。
这也是OCI组织效率持续低下的根本原因。

眼看着OCI无力改变Docker公司容器领域一家独大现状，Google和RedHat等第二把武器摆上了台面。

Docker之所以不担心OCI威胁，就在于它的Docker项目是容器生态的事实标准，而它所维护的Docker社区也足够庞大。
可是，一旦这场斗争被转移到容器之上的平台层，或者说PaaS层，Docker公司的竞争优势捉襟见肘
在这个领域里，像Google和RedHat这样的成熟公司，都拥有着深厚的技术积累
而像CoreOS这样的创业公司，也拥有像Etcd这样被广泛使用的开源基础设施项目。
可是Docker公司呢？它却只有一个Swarm。

所以这次，Google、RedHat等开源基础设施领域玩家们，发起名为
# 5 CNCF（Cloud Native Computing Foundation）
的基金会
![](https://img-blog.csdnimg.cn/20190904002014145.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
基金会希望，以 **`Kubernetes`** 项目为基础，建立一个由`开源基础设施领域厂商主导的、按照独立基金会方式运营`的平台级社区，来`对抗以Docker公司为核心的容器商业生态`。

CNCF社区就需要至少确保两件事情

## 5.1 在容器编排,**Kubernetes**具备强大优势
在容器编排领域，Kubernetes项目需要面对来自Docker公司和Mesos社区两个方向的压力。
- Swarm擅长是跟Docker生态的无缝集成
- Mesos擅长大规模集群的调度与管理

这两个方向，也是大多数人做容器集群管理项目时最容易想到的两个出发点
也正因为如此，Kubernetes项目如果继续在这两个方向上做文章恐怕就不太明智了。

Kubernetes选择的应对方式是
### Borg
Kubernetes项目早期的GitHub Issue和Feature大多来自于Borg和Omega系统的内部特性
落到Kubernetes项目上，就是Pod、Sidecar等功能和设计模式。

Kubernetes项目的基础特性是Google公司在容器化基础设施领域多年来实践经验的沉淀与升华
是Kubernetes项目能够从一开始就避免同Swarm和Mesos社区同质化的重要手段!

## 5.2 CNCF社区必须以**Kubernetes**项目为核心，覆盖足够多场景
如何把这些先进的思想通过技术手段在开源社区落地，并培育出一个认同这些理念的生态？
RedHat就发挥了重要作用。

当时**Kubernetes**团队规模很小，能够投入的工程能力也十分紧张，而这恰恰是RedHat的长处
更难得的是，RedHat是世界上为数不多的、能真正理解开源社区运作和项目研发真谛的合作伙伴。
所以，RedHat与Google联盟的成立，不仅保证了RedHat在Kubernetes项目上的影响力，也正式开启了容器编排领域“三国鼎立”的局面。

> Mesos社区与容器技术的关系，更像是“借势”，而不是这个领域真正的参与者和领导者
> 这个事实，加上它所属的Apache社区固有的封闭性，导致了Mesos社区虽然技术最为成熟，却在容器编排领域鲜有创新
这也是为何Google很快就把注意力转向了激进的Docker公司
Docker公司对Mesos社区也是类似的看法,所以从一开始，Docker公司就把应对Kubernetes项目的竞争摆在了首要位置：一方面，不断强调“Docker Native”的“重要性”，另一方面，与Kubernetes项目在多个场合进行了直接的碰撞。

发展态势，很快超过Docker公司的预期。
Kubernetes项目并没有跟Swarm项目展开同质化的竞争，所以“Docker Native”的说辞并没有太大的杀伤力
相反地，Kubernetes项目让人耳目一新的设计理念和号召力，很快就构建出了一个与众不同的容器编排与管理的生态。

就这样，Kubernetes项目在GitHub上的各项指标开始一骑绝尘，将Swarm项目远远地甩在了身后。
有了这个基础，CNCF社区就可以放心地解决第二个问题了。

在已经囊括了容器监控事实标准的
# 6 Prometheus
项目之后
![](https://img-blog.csdnimg.cn/20190904003456378.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190904003540329.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
CNCF社区迅速在成员项目中添加了
- Fluentd
![](https://img-blog.csdnimg.cn/20190904003638833.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190904003805591.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
-  jagerTracing
![](https://img-blog.csdnimg.cn/20190904004141329.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190904004259522.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- CNI
![](https://img-blog.csdnimg.cn/20190904004442161.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

等一系列容器生态的知名工具和项目。
而在看到了CNCF社区对用户表现出来的巨大吸引力之后，大量的公司和创业团队也开始专门针对CNCF社区而非Docker公司制定推广策略。

面对这样的竞争态势，Docker公司决定更进一步
在2016年，Docker公司宣布了一个震惊所有人的计划：放弃现有的Swarm项目，将容器编排和集群管理功能全部内置到Docker项目中
显然，Docker公司意识到了Swarm项目目前唯一的竞争优势，就是跟Docker项目的无缝集成。那么，如何让这种优势最大化呢？那就是把Swarm内置到Docker项目当中。

实际上，从工程角度来看，这种做法的风险很大。
内置容器编排、集群管理和负载均衡能力，固然可以使得Docker项目的边界直接扩大到一个完整的PaaS项目的范畴，但这种变更带来的技术复杂度和维护难度，长远来看对Docker项目是不利的。
不过，在当时的大环境下，Docker公司的选择恐怕也带有一丝孤注一掷的意味。

而Kubernetes的应对策略则是反其道而行之，开始在整个社区推进“民主化”架构
从API到容器运行时的每一层，Kubernetes项目都为开发者暴露出了可以扩展的插件机制
鼓励用户通过代码的方式介入到Kubernetes项目的每一个阶段。
Kubernetes项目的这个变革的效果立竿见影，很快在整个容器社区中催生出了大量的、基于Kubernetes API和扩展接口的二次创新工作，比如：

- 热度极高的微服务治理项目Istio
![](https://img-blog.csdnimg.cn/20190904004635785.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 广泛采用的有状态应用部署框架Operator
![](https://img-blog.csdnimg.cn/20190904004806161.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 开源创业项目 --- Rook,通过Kubernetes的可扩展接口，把Ceph这样的重量级产品封装成简单易用的容器存储插件
![](https://img-blog.csdnimg.cn/20190904004859809.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

就这样，在这种鼓励二次创新的整体氛围当中，Kubernetes社区在2016年之后得到了空前的发展
不同于之前局限于“打包、发布”这样的PaaS化路线，这一次容器社区的繁荣，是一次完全以Kubernetes项目为核心的“百花争鸣”。

面对Kubernetes社区的崛起和壮大，Docker公司也不得不面对自己豪赌失败的现实
但在早前拒绝了微软的天价收购之后，Docker公司实际上已经没有什么回旋余地，只能选择逐步放弃开源社区而专注于自己的商业化转型。

所以，从2017年开始，Docker公司先是将Docker项目的容器运行时部分
- Containerd
![](https://img-blog.csdnimg.cn/20190904005045114.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

捐赠给CNCF社区，标志着Docker项目已经全面升级成为一个PaaS平台
紧接着，Docker公司宣布将Docker项目改名为
- Moby
![](https://img-blog.csdnimg.cn/20190904005214749.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)然后交给社区自行维护，而Docker公司的商业产品将占有Docker这个注册商标。

Docker公司这些举措背后的含义非常明确：它将全面放弃在开源社区同Kubernetes生态的竞争，转而专注于自己的商业业务
并且通过将Docker项目改名为Moby的举动，将原本属于Docker社区的用户转化成了自己的客户。

2017年10月，Docker公司出人意料地宣布，将在自己的主打产品Docker企业版中内置**Kubernetes**项目
持续了近两年之久的“编排之争”落下帷幕!

2018年1月30日，RedHat斥资2.5亿美元收购CoreOS

2018年3月28日，一切纷争的始作俑者，Docker公司的CTO Solomon Hykes宣布辞职，纷纷扰扰的容器技术圈子，至此尘埃落定。

 
 
# 7 总结
容器技术圈子在短短几年里发生了很多变数，但很多事情其实也都在情理之中。就像Docker这样一家创业公司，在通过开源社区的运作取得了巨大的成功之后，就不得不面对来自整个云计算产业的竞争和围剿。而这个产业的垄断特性，对于Docker这样的技术型创业公司其实天生就不友好。

在这种局势下，接受微软的天价收购，在大多数人看来都是一个非常明智和实际的选择。可是Solomon Hykes却多少带有一些理想主义的影子，既然不甘于“寄人篱下”，那他就必须带领Docker公司去对抗来自整个云计算产业的压力。
只不过，Docker公司最后选择的对抗方式，是将开源项目与商业产品紧密绑定，打造了一个极端封闭的技术生态。而这，其实违背了Docker项目与开发者保持亲密关系的初衷。

相比之下，Kubernetes社区，正是以一种更加温和的方式，承接了Docker项目的未尽事业，即：以开发者为核心，构建一个相对民主和开放的容器生态。
这也是为何，Kubernetes项目的成功其实是必然的。

Docker公司在过去五年里的风云变幻，以及Solomon Hykes本人的传奇经历，都已经在云计算的长河中留下了浓墨重彩的一笔。


# 参考

- Github
- docker官网
- Docker实战
- 深入剖析Kubernetes