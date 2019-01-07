# 1 代码架构的意义
![](https://img-blog.csdnimg.cn/20190621180825370.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

代码架构就是详细设计中的核心内容!

## 1.1 代码架构承上启下,决定软件质量
◆ 承上
说明业务逻辑和业务领域模型
◆ 本身
保证代码有更好的可读性和可维护性、可扩展性
◆ 启下
承载代码运行的硬件部署架构

# 2 代码架构的操作
## 2.1 业务逻辑表达
向上沟通,提供交互入口
## 2.2 自身业务逻辑及技术实现
向下沟通,保存运行状态

# 3 代码架构的设计

先看一下DDD和分层架构的相关知识。
## 3.1 DDD
DDD（Domain Driven Design，领域驱动设计）作为一种软件开发方法，它可以帮助我们设计高质量的软件模型。在正确实现的情况下，我们通过DDD完成的设计恰恰就是软件的工作方式。

UL（Ubiquitous Language，通用语言）是团队共享的语言，是DDD中最具威力的特性之一。不管你在团队中的角色如何，只要你是团队的一员，你都将使用UL。由于UL的重要性，所以需要让每个概念在各自的上下文中是清晰无歧义的，于是DDD在战略设计上提出了模式BC（Bounded Context，限界上下文）。UL和BC同时构成了DDD的两大支柱，并且它们是相辅相成的，即UL都有其确定的上下文含义，而BC中的每个概念都有唯一的含义。

一个业务领域划分成若干个BC，它们之间通过Context Map进行集成。BC是一个显式的边界，领域模型便存在于这个边界之内。领域模型是关于某个特定业务领域的软件模型。通常，领域模型通过对象模型来实现，这些对象同时包含了数据和行为，并且表达了准确的业务含义。

从广义上来讲，领域即是一个组织所做的事情以及其中所包含的一切，表示整个业务系统。
由于“领域模型”包含了“领域”这个词，我们可能会认为应该为整个业务系统创建一个单一的、内聚的和全功能式的模型。然而，这并不是我们使用DDD的目标。正好相反，领域模型存在于BC内。
在微服务架构实践中，人们大量地使用了DDD中的概念和技术：

微服务中应该首先建立UL，然后再讨论领域模型。
一个微服务最大不要超过一个BC，否则微服务内会存在有歧义的领域概念。
一个微服务最小不要小于一个聚合，否则会引入分布式事务的复杂度。
微服务的划分过程类似于BC的划分过程，每个微服务都有一个领域模型。
微服务间的集成可以通过Context Map来完成，比如ACL（Anticorruption Layer，防腐层）。
微服务间最好采用Domain Event（领域事件）来进行交互，使得微服务可以保持松耦合。
.

下面介绍最为流行的分层代码架构
## 3.1 分层架构简介


分层架构的一个重要原则是每层只能与位于其下方的层发生耦合。
分层架构可以简单分为两种
- 严格分层架构
某层只能与位于其直接下方的层发生耦合
- 松散分层架构
松散分层架构中，则允许某层与它的任意下方层发生耦合。

分层架构的好处是显而易见的。首先，由于层间松散的耦合关系，使得我们可以专注于本层的设计，而不必关心其他层的设计，也不必担心自己的设计会影响其它层，对提高软件质量大有裨益。其次，分层架构使得程序结构清晰，升级和维护都变得十分容易，更改某层的具体实现代码，只要本层的接口保持稳定，其他层可以不必修改。即使本层的接口发生变化，也只影响相邻的上层，修改工作量小且错误可以控制，不会带来意外的风险。
要保持程序分层架构的优点，就必须坚持层间的松散耦合关系。设计程序时，应先划分出可能的层次，以及此层次提供的接口和需要的接口。设计某层时，应尽量保持层间的隔离，仅使用下层提供的接口。

## 3.2 分层架构的优点
单一职责
高内聚低耦合
提高复用性

开发人员可以只关注整个结构中的某一层。
可以很容易的用新的实现来替换原有层次的实现。
可以降低层与层之间的依赖。
有利于标准化。
利于各层逻辑的复用。


## 3.3 分层架构的缺陷
“金无足赤，人无完人”，分层架构也不可避免具有一些缺陷：

降低了系统的性能。这是显然的，因为增加了中间层，不过可以通过缓存机制来改善。
可能会导致级联的修改。这种修改尤其体现在自上而下的方向，不过可以通过依赖倒置来改善。

在每个BC中为了凸显领域模型，DDD中提出了分层架构模式

最基本的为三层架构
## 3.4 三层架构
表现层
业务逻辑层
数据持久层

但是职责定义并不明确,耦合度高

所以我们项目使用四层逻辑分层架构
## 3.5 逻辑分层架构
![](https://img-blog.csdnimg.cn/20190621235019157.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- User Interface - 用户接口
人机交互,为用户界面层（或表示层），负责向用户显示信息和解释用户命令。这里指的用户可以是另一个计算机系统，不一定是使用用户界面的人。

- Application - 应用层
定义软件要完成的任务，并且指挥表达领域概念的对象来解决问题。这一层所负责的工作对业务来说意义重大，也是与其它系统的应用层进行交互的必要渠道。应用层要尽量简单，不包含业务规则或者知识，而只为下一层中的领域对象协调任务，分配工作，使它们互相协作。它没有反映业务情况的状态，但是却可以具有另外一种状态，为用户或程序显示某个任务的进度。

- Domain - 领域层（或模型层）
表达业务概念，业务状态信息以及业务规则。尽管保存业务状态的技术细节是由基础设施层实现的，但是反映业务情况的状态是由本层控制并且使用的。领域层是业务软件的核心，领域模型位于这一层。

- Infrastructure - 基础实施层
向其他层提供通用的技术能力：为应用层传递消息，为领域层提供持久化机制，为用户界面层绘制屏幕组件，等等。基础设施层还能够通过架构框架来支持四个层次间的交互模式。


传统的四层架构都是限定型松散分层架构，即Infrastructure层的任意上层都可以访问该层（“L”型），而其它层遵守严格分层架构

在四层架构模式的实践中，对于分层的本地化定义主要为：
- User Interface层主要是Restful消息处理，配置文件解析，等等。
- Application层主要是多进程管理及调度，多线程管理及调度，多协程调度和状态机管理，等等。
- Domain层主要是领域模型的实现，包括领域对象的确立，这些对象的生命周期管理及关系，领域服务的定义，领域事件的发布，等等。
- Infrastructure层主要是业务平台，编程框架，第三方库的封装，基础算法，等等。

> 严格意义上来说，User Interface指的是用户界面，Restful消息和配置文件解析等处理应该放在Application层，User Interface层没有的话就空缺。但User Interface也可以理解为用户接口，所以将Restful消息和配置文件解析等处理放在User Interface层也行。

## 3.6 物理分层
- 魔改四层的六层架构
![](https://img-blog.csdnimg.cn/2019062201340683.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

◆ 用户接口
◆ 应用服务层接口:
◆ 核心层
- 应用服务实现层
- 领域层
- 数据访问层

◆ 基础设施层


- 架构设计图
![](https://img-blog.csdnimg.cn/20190622013814347.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

# 4 Go 语言规范
## 4.1 包名
◆ 完整包名组成:引入路径+包名
◆ 源代码中的包名称
- 可以和文件夹名称不一致,建议尽量一致
- 同一文件夹中所有源文件中的包名必须一致
◆ 代码引用时使用包名,而非文件夹名称
◆ 源代码导入的是文件夹路径名称
- 非包名
- 非文件名
## 4.2 源代码文件名
◆ 文件名称只是约定描述性的,并无任何编程含义


# 5 🧧系统 - 代码结构
![](https://img-blog.csdnimg.cn/20190622101718233.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190622102431607.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

# 6 🧧系统 - 包结构
![](https://img-blog.csdnimg.cn/20190622103131713.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

# 7 包设计规范
## 7.1 apis包 - 用户接口层
◆ 文件名称可以描述其业务含义的单词
◆ 定义外部交互逻辑和交互形式: UI、RESTful接口
◆ 不涉及任何业务,随时可以替换为其他形式的交互方式
◆ services构造和初始化

## 7.2 services包 - 应用层接口
◆ 文件名称使用可以描述其业务含义
◆ 需要对外暴露
- DTO、 service interface
- 枚举、常数等

## 7.3 core包 - 应用层/领域层/数据访问层
◆ 文件名称使用可以描述
业务含义 +分层名称
◆ Service实现
Domain、Dao、 PO

# 8 Go的包管理
## 8.1 历史
go get => vendor => go modules
◆ go get无版本概念
◆ vendor曲线救国,但仍未版本化
◆ go1.11 modules开启版本依赖新大门

> 详细过程推荐阅读
[Go 包管理的前世今生](https://www.infoq.cn/article/history-go-package-management)

## 8.2 Go modules
通过GO 1.11 MODULE环境变量来开启或者关闭,默认是auto

◆ off/on/auto
关闭,开启,自动识别

◆ 使用module后,GOPATH失去了部分意义

◆ 要用module ,第一步将项目从GOPATH中移出去

## 8.3 go.mod 文件
go.mod文件来管理依赖,定义模块依赖
◆ go.mod文件放在项目根目录
◆ go.mod文件面向行,由指令+参数组成
◆ 注释使用//

### 8.3.1 go.mod 主要指令
◆ module:定义当前模块和包路径
◆ require: 定义依赖的模块和版本
◆ exclude: 排除特定模块和版本的使用
◆ replace:模块源的替换

### 8.3.2 go.mod 命令
go.mod文件用go mod命令来创建和维护

◆ 命令格式
```
go mod <命令> [可选参数]
```
◆ 8个子命令
- init ,tidy,vendor,verify
- download,edit,graph ,why

### 8.3.3 实战演示
####  8.3.3.1 使用go mod init 创建和初始化go.mod文件
```
 go mod init javaedge.com/GoDemo
```
![](https://img-blog.csdnimg.cn/20190622113300232.png)
- 生成文件
![](https://img-blog.csdnimg.cn/20190622113357360.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

####  8.3.3.2 go get引入依赖
![](https://img-blog.csdnimg.cn/20190622200239750.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
####  8.3.3.3 tidy子命令更新模块依赖
对于已存在项目进行module化,即可使用该命令
会自动添加依赖的包,使用go build更新依赖
# 参考
[DDD分层架构的三种模式](https://www.jianshu.com/p/a775836c7e25)
