# 12-Redis 闭源？

无聊刷 X 时，刚好著名的《Redis设计与实现》译者大佬的动态，Redis 真的要抛弃贫贱的开发者，不再开源了吗？![image-20240326232325993](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240326232325993.png)

其实，早在 19 年我大学毕业时，redis 就有了行动。

Redis当年增加新的可用源代码许可证RSAL（Redis Source Available License）。

## Redis的开源许可是如何规定的？

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240326233246037.png)

Redis数据库核心代码仍用BSD开源许可，但自建的Redis模块RediSearch，Redis Graph，ReJSON等不再是开源软件，他们的使用将必须遵守RSAL。

Redis Labs（Redis的制造商）在2018年8月份已经对Redis自建模块的许可协议进行过变更，由之前的AGPL（Affero GPL），变更为非OSI（开发源代码促进会）规范的Apache2.0和Commons Clause相结合的许可。这个规范已经将Redis模块变成“源码可用”，此次的许可协议变更几乎将Redis的模块“闭源”。

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240326233426179.png)

2018年8月Redis Labs对于Redis及各自建模块的授权规范。

这些变化当然有Redis Labs自身的商业考量。但是自从云计算平台流行后，传统开源社区及其精神屡屡收到冲击，开源社区和云提供商之间的冲突已经浮到台面上。

截至 2024 年 3 月末的模块许可证：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240326233554525.png)

## BSD是啥？

回顾开源历史，要从BSD说起。1979年加州大学伯克利分校发布BSD Unix，被称为开放源代码的先驱，BSD许可证就是随着BSD Unix发展起来的。Redis核心（Redis Core）所采用的就是BSD许可证。

BSD开源协议是给于使用者很大自由，基本上使用者可以”为所欲为”,可以自由的使用，修改源代码，也可以将修改后的代码作为开源或者专有软件再发布。最新的BSD许可也称3-Clause BSD，当你发布使用了BSD协议的代码，或则以BSD协议代码为基础做二次开发自己的产品时，需满足：

- 如果再发布的产品中包含源代码，则在源代码中必须带有原来代码中的BSD协议。
- 如果再发布的只是二进制类库/软件，则需要在类库/软件的文档和版权声明中包含原来代码中的BSD协议
- 不可以用开源代码的作者/机构名字和原来产品的名字做市场推广

而上面提到的Apache Licence则是另外一个知名非盈利开源组织Apache基金会所采用的许可协议。目前的版本是Apache Licence 2.0。此前Redis部分模块就是用该协议许可。

## Apache Licence

和BSD类似，同样鼓励代码共享和尊重原作者的著作权，同样允许代码修改，再发布。采用该协议需满足：

- 需要给代码的用户一份Apache Licence。
- 如果你修改了代码，需要再被修改的文件中说明。
- 在延伸的代码中（修改和有源代码衍生的代码中）需要带有原来代码中的协议，商标，专利声明和其他原来作者规定需要包含的说明
- 如果再发布的产品中包含一个Notice文件，则在Notice文件中需要带有Apache Licence。你可以在Notice中增加自己的许可，但不可以表现为对Apache Licence构成更改

## AGPL协议

而2018年8月前Redis模块所使用的AGPL协议则要从GNU开始说起。1983年，自由软件运动的先驱、精神领袖理查德·斯托曼决心要开发一个完全自由的、与Unix完全兼容但功能更强大的操作系统，以便为所有的计算机使用者提供一个功能齐全、性能良好的基本系统，为了把这个系统和UNIX区分开来，他采用“递归”方式把它定义为GNU，即：GNU’s Not Unix，一般读作[gru:]。

1985年理查德·斯托曼又创立了自由软件基金会（FSD）来为GNU计划提供技术、法律以及财政支持。GNU计划开发了一系列知名的软件，GNU/Linux（或简称Linux）、Emacs文字编辑器、GCC编译器，以及大部分UNIX系统的程序库和工具。

GPL是GNU最重要的一款协议，全称是GNU通用公共许可证（GNU General Public License）。GPL要求软件以源代码的形式发布，并规定任何用户能够以源代码的形式将软件复制或发布给别的用户；如果用户使用了受 GPL 保护的任何软件的一部分，那么该软件就继承了 GPL 软件，并因此而成为 GPL 软件，也就是说必须随应用程序一起发布源代码，也因此GPL很难被商业软件所应用。所以后来GNU推出了LGPL许可证，全称是：GNU较宽松公共许可证 (GNU Lesser General Public License）。LGPL允许实体连接私人代码到开放源代码，并可以在任何形式下发布这些合成的二进制代码。只要这些代码是动态连接的就没有限制。

BSD、Apache、GPL/LGPL 都是经过OSI（Open Source Initiative）组织批准认可的协议（OSI目前已经通过批准了58种开源协议）。虽然各个开源组织在持续的更新协议的的内容，例如GNU下面的GPL目前已经更新到第三版的AGPL(Affero GPL)，以应对软件运行方式的变化。但是随着大规模云计算的发展，开源项目的利益还是持续受到了侵害和挑战。比如Redis Labs对开源协议的持续调整，就是它所声称的“云服务商一直都在销售基于不是他们自己开发的开源项目的云服务，白白享用了开源社区的成果，却并不给开源社区做贡献”。

这似乎代表了目前开源社区的一种声音，比如不被OSI认可Commons Clause 协议 V1.0 就规定：

> *“本软件由许可方根据以下定义的条款提供给您，但须符合以下条件。*
> *在不限制许可中的其他条件的情况下，根据许可证授予的权利不包括、并且不授予您销售软件的权利。*
> *综上所述，“出售”是指根据许可证授予您的任何或所有权利，以向第三方提供费用或其他报酬（包括但不限于与软件相关的托管或咨询/支持服务的费用），产品或服务的价值完全或基本上来自软件的功能。许可证要求的任何许可声明或归属也必须包含此 Commons Cause License Condition 声明。”*

简单地说就是：不许销售，不许存在于商业环境。

## 2024.3.20 

就在不久前，redis 核心模块声明：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240326234110833.png)

Redis从 7.4 开始使用 RSALv2 与 SSPLv1，不再满足 OSI 关于 “开源软件” 的定义。但不要搞错：**Redis “不开源” 不是 Redis 的耻辱，而是“开源/OSI”的耻辱** —— 它反映出开源组织/理念的过气。

## 开软软件自由的头号大敌

是云计算服务！“**开源**” 与 “**闭源**” 也不再是软件行业的核心矛盾，斗争的焦点变为 “**云上服务**” 与 “**本地优先**”。公有云厂商搭着开源软件便车白嫖社区成果，注定引发社区的强烈反感！

抵御云厂商白嫖，修改协议是最常见做法：但AGPLv3 过于严格容易敌我皆伤，SSPL 因为明确表达这种敌我歧视，不被算作开源。**业界需要一种新的歧视性软件许可证协议，来达到名正言顺区分敌我的效果**。

## 开源风格已经过气

**真正重要的事情一直都是软件自由**，而“开源”只是实现软件自由的一种手段。而如果“开源”的理念无法适应新阶段矛盾斗争的需求，甚至会妨碍软件自由，它一样会过气，并不再重要，并最终被新的理念与实践所替代。

> “我想直率地说：多年来，我们就像个傻子一样，他们拿着我们开发的东西大赚了一笔”。—— Redis Labs 首席执行官 Ofer Bengal

当 Redis 宣布更改协议后，马上就有 AWS 员工跳出来 Fork Redis —— “Redis 不开源了，我们的分叉才是真开源！” 然后 AWS CTO 出来叫好，并假惺惺地说：这是我们员工的个人行为 —— 云厂商们真是杀人诛心，恬不知耻！

![](https://media.greatfire.org/cdn-cgi/image/width=451/proxy/?url=https://mmbiz.qpic.cn/mmbiz_png/Wkpr3rA9wF293gNoicBEehmKsJcCEa4S9xfgOGCNe1k8EqnbmHFNjPMP5PCog2OxaGHrsmiaNkTAmo8ffiaY9jWZQ/640?wx_fmt=png&from=appmsg)