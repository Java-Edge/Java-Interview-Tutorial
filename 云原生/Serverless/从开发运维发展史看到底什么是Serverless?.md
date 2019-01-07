# 1 什么是服务端？
- Server，服务端，Serverless解决问题的边界
- less，更少，Serverless解决问题的目的。

搭配在一起其实就是“更少在意服务端”。

web 应用开发：
- 前端，负责终端体验，即View层
- 后端，负责商业的业务逻辑和数据处理，即Control层和Model层。

在个人PC启动一个端口，浏览器访问即可调试代码，但要将应用部署到互联网，还需运维。

部署运维应用时，要考虑容灾容错，都要保障异地多活，部署多个应用实例。每个应用实例跟我们在本地开发时一样，只是IP改为私有网络IP。

随云服务商兴起，鲜有互联网企业自己维护物理机。云服务的运维体系中各个环节都已有成熟的云服务产品或解决方案。

为使多个应用实例在容灾容错场景下稳定切换流量，就需负载均衡和反向代理服务：
- 负载均衡
将流量均衡分配到各应用机器
- 反向代理
常见如Nginx，从请求中解析出域名信息，并将请求转发到上游upstream的监听地址

服务端的边界，就是上图中的整个蓝色部分，它是负责应用或代码的线上运维。Serverless解决问题的边界，就是服务端的边界，即服务端运维。

# 2 从远古到未来的less
以前服务端运维全由自己负责，而Serverless则是我们较少负责服务端运维，大多运维操作交给自动化工具。

Web网站研发至少有两个角色：研发和运维工程师。
研发负责前后端，但只关心业务逻辑，整个MVC架构开发、版本管理和线上故障修复；
运维只关心应用的服务端运维事务：
- 部署上线小程的Web应用，绑定域名以及日志监控
- 在用户访问量大的时候，他要给这个应用扩容
- 在用户访问量小的时候，他要给这个应用缩容
- 在服务器挂了的时候，他还要重启或者换一台服务器

## 2.1 远古
研发无需关心任何部署运维操作。研发每次发布新应用，都要电话运维，让运维部署上线最新代码。运维要管理好迭代版本的发布，分支合并，将应用上线，遇到遇到问题时回滚。如果线上出故障，还要抓取线上日志发给研发解决。

这样的职责分工
- 优点
分工明确，研发专心做业务
- 缺点
运维成了无情的点击工具人，被困在大量运维工作，处理各种发布相关琐事。

研发和运维隔离，服务端运维都交给运维且纯人工操作。

但仔细想想，发布版本和处理线上故障这种工作应该是研发的职责，却都要运维协助，是不是无益增加人力成本呢？

## 2.2 DevOps
运维的很多工作都是重复性劳动，尤其是发布新版本，与其每次都等研发电话，线上故障后还要自己查日志发过去，效率很低，不如自己做个运维控制台OpsConsole，将部署上线和日志抓取工作交由研发自己处理。

OpsConsole上线后：
- 运维稍轻松，但优化架构节省资源和扩缩容资源方案，还要定期审查
- 研发除开发任务，每次发版或解决线上事故，都要自己到OpsConsole平台

这就是DevOps，研发兼任部分运维工作，运维将部分服务端运维操作工具自动化，解放自己去做更专业工作。看起来研发负责的事情更多了？
但其实版本控制、线上故障都应该是研发处理，且运维已将这部分人力操作工具化了，更加高效，实际上还降低了研发负担。

如何更高效，连OpsConsole平台都不需要用呢？

## 2.3 NoOps
运维发现资源优化和扩缩容方案还可利用性能监控+流量估算解决。于是运维又基于研发的开发流程，OpsConsole系统再帮研发做了一套代码自动化发布流水线：
代码扫描 =》测试 =》灰度验证 =》上线。

现在研发连OpsConsole都无需登录，只要将最新代码合进Git仓库指定的develop分支，剩下就都由流水线自动化处理发布上线。

此时研发已无需运维了，踏入免运维NoOps时代。运维的服务端运维工作全部自动化，研发也回到最初，只需关心业务实现。

可见，随服务端运维发展，对研发来说，运维存在感越来越弱，都有自动化工具替代，这就是“Serverless”。
那运维岂不是把自己玩失业了？

## 2.4  未来
并不，而是
- 运维要转型去做更底层服务，做基础架构建设，提供更智能、节省资源、周到的服务
- 研发则可完全不被运维操作困扰，依靠Serverless服务，做好业务即可

免运维NoOps并不是说服务端运维不存在了，而是通过全知全能的服务，覆盖研发部署的所有需求。
NoOps是理想状态，所以只能无限逼近NoOps，单词也是less，而非NoServer或Server0。

当下大多公司都还在DevOps时代，但Serverless的概念已然提出，NoOps时代正在到来。

- Server限定Serverless解决问题的边界，即服务端运维
- less说明Serverless解决问题的目的，即免运维NoOps

所以Serverless应该叫服务端免运维，要解决的就是将运维工作彻底透明化，研发只关心业务，不用关心部署运维和线上各种问题。

# 3 什么是Serverless?
狭义Serverless：
- Serverless computing架构
- FaaS架构
- Trigger（事件驱动）+ FaaS（函数即服务）+ BaaS（后端即服务，持久化或第三方服务）
- FaaS + BaaS

广义Serverless：
- 服务端免运维
- 具备Serverless特性的云服务
![](https://img-blog.csdnimg.cn/20210130002445332.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

广义Serverless包含的东西更多，适用范围更广，但我们经常在工作中提到的Serverless一般都是指狭义Serverless，这是历史原因。
2014 年11月份，亚马逊推出真正意义上的第一款Serverless FaaS服务：Lambda。Serverless的概念才进入了大多数人的视野，也因此Serverless曾经一度就等于FaaS。

## 3.1 狭义Serverless
用FaaS+BaaS这种Serverless架构开发的应用。
XaaS(X as a Service)，X即服务，云服务商爱用的一种命名，比如SaaS、PaaS、IaaS。



### FaaS(Function as a Service)
函数即服务，也叫Serverless Computing，可让我们随时随地创建、使用、销毁一个函数。
通常函数的使用过程：需先从代码加载到内存，即实例化，然后被其它函数调用时执行。FaaS中也一样，函数需实例化，然后被触发器Trigger或被其他函数调用。二者最大的区别就是在Runtime，也就是函数的上下文，函数执行时的语境。

FaaS的Runtime是预先设置好的，Runtime里面加载的函数和资源都是云服务商提供的，我们可以使用却无法控制。可理解为FaaS的Runtime是临时的，函数调用完后，这个临时Runtime和函数一起销毁。

FaaS的函数调用完后，云服务商会销毁实例，回收资源，所以FaaS推荐无状态的函数。如果你是前端，可能好理解，就是函数不可改变Immutable，一个函数只要参数固定，返回的结果也必须固定。

比如MVC架构的Web应用，View层是客户端展现的内容，通常无需函数算力；Control就是函数的典型使用场景。一个HTTP数据请求，就会对应一个Control函数，我们完全可用FaaS函数代替Control函数。
HTTP数据请求量
- 大时，FaaS函数会自动扩容多实例同时运行
- 小时，会自动缩容
- 没有请求时，还会缩容到0实例
![](https://img-blog.csdnimg.cn/20210130002502945.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

微信小程序云开发，也是一种serverless的应用场景，让前端工程师不仅可以开发页面还可以通过云函数(Faas)来写业务，而且还提供了基础存储(Baas)。Serverless发展的一个方向，也就是追求这种一体化的开发体验。

既然Runtime不可控，FaaS函数无状态，函数实例又不停扩容缩容，那我需要持久化存储一些数据怎么办，MVC里面的Model层怎么解决？

### BaaS(Backend as a Service)
后端即服务。BaaS是一个集合，是指具备高可用性和弹性，而且免运维的后端服务。说简单点，就是专门支撑FaaS的服务。FaaS就像高铁的车头，如果我们的后端服务还是老旧的绿皮火车车厢，那肯定是要散架的，而BaaS就是专门为FaaS准备的高铁车厢。

MVC架构中的Model层，就需要用BaaS。Model层以MySQL为例，后端服务最好将FaaS操作的数据库的命令，封装成HTTP的OpenAPI，提供给FaaS调用，自己控制这个API的请求频率以及限流降级。这个后端服务本身可通过连接池、MySQL集群等方式去优化。各大云服务商自身也在改造自己的后端服务，BaaS也在日渐壮大。

BaaS主要是解决“状态”的问题，因为FaaS是无状态的。与云上现有的RDS不同是，BaaS需要提供快速接入，快速链接，免运维。对于云厂商，要提供这种服务，以为着要对现有的RDS等服务做很大的改造：多用户多连接，还有计费模型。对于企业来说，现有的产品如何BaaS化封装，提供给FaaS使用，借助FaaS的优势降低服务端成本。前几年市场上做的是面向移动端的BaaS，因为浏览器前端无法encrypt，不过FaaS的出现才改变了市场。长时间运行的服务，考虑容器方案。

![](https://img-blog.csdnimg.cn/20210130002514908.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
基于Serverless架构，完全可以把传统MVC架构转换为BaaS+View+FaaS的组合，重构或实现。

狭义Serverless（最常见）= Serverless computing架构 = FaaS架构 = Trigger（事件驱动）+ FaaS（函数即服务）+ BaaS（后端即服务，持久化或第三方服务）= FaaS + BaaS

Serverless毋庸置疑正是因为FaaS架构才流行起来，进入大家认知的。所以我们最常见的Serverless都是指Serverless Computing架构，也就是由Trigger、FaaS和BaaS架构组成的应用。这也是我给出的狭义Serverless的定义。

## 3.2 广义Serverless
广义Serverless则是具备Serverless特性的云服务。现在的云服务商，正在积极地将自己提供的各种云服务Serverless化

将狭义的Serverless推升至广义，具备以下特性的，就是Serverless服务。要达成NoOps，都应该具备什么条件？
运维的职责：
- 无需用户关心服务端的事情（容错、容灾、安全验证、自动扩缩容、日志调试等等)
- 按使用量（调用次数、时长等）付费，低费用和高性能并行，大多数场景下节省开支
- 快速迭代&试错能力（多版本控制，灰度，CI&CD等等）

广义Serverless，其实就是指服务端免运维，当下趋势。
- 日常谈Serverless时，基本指狭义Serverless
- 当提到某个服务Serverless化的时候，往往都是指广义的Serverless

> 参考
> - https://server.51cto.com/sOS-615878.htm