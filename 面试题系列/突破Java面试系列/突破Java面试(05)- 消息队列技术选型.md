# 1 面试题
消息队列(以下简称MQ),面试必问技术,工作必会技术,掌握它,是你的义务!!!

- 为什么使用MQ啊？
- MQ有什么优点和缺点啊？
- kafka、activemq、rabbitmq、rocketmq都有什么区别以及适合哪些场景？

# 2 考点分析
其实面试官主要是想看看：

## 2.1 知否系统缘何使用MQ？
大量的候选人，说自己项目里用了redis、mq，但是其实他并不知道自己为什么要用这个东西。
其实说白了，就是为了用而用，或者是别人设计的架构，他从头到尾没思考过!!!

没有对自己的架构问过为什么的人，一定是平时没有思考的人，面试官对这类候选人印象通常很不好。因为进了团队担心你就木头木脑的干呆活儿，不会自己思考。

## 2.2 既然用MQ，知否好处？
系统中引入MQ之后会不会有什么坏处？
你要是没考虑过这个，那你盲目弄个MQ进系统里，后面出了问题你是不是就自己删库跑路给公司留坑？你要是没考虑过引入一个技术可能存在的弊端和风险，面试官把这类候选人招进来了，基本可能就是挖坑型选手。

就怕你干1年挖一堆坑，自己跑路了，给公司后患无穷,你还野火烧不尽

## 2.3 既然你用了某种MQ,做过调研否？
你别傻乎乎的自己拍脑袋看个人喜好就瞎用了一个MQ，比如kafka。
甚至都从没调研过业界到底流行的MQ有哪几种？
每一个MQ的优点和缺点是什么？
每一个MQ没有绝对的好坏，但是就是看用在哪个场景可以扬长避短，利用其优势，规避其劣势。

如果是一个不考虑技术选型的候选人招进了团队，面试官交给他一个任务，去设计个什么系统，他在里面用一些技术，可能都没考虑过选型，最后选的技术可能并不一定合适，一样是留坑

> 同学啊，如果你看到这里，连activemq、rabbitmq、rocketmq、kafka是什么都不知道？连个hello world demo都没写过？那你。。。还不快关注我的公众号去学习这些!!!
通过网上查阅技术资料和博客，用于快速入门，是比较合适的
但是如果要比如系统梳理你的面试技术体系，或者是系统的深入的研究和学习一些东西，看博客实际上是不太合适的
那也没事，这个教程的定位是不会去讲这些的，建议你马上暂停一下，然后搜一下我的博客，这4个东西是什么？每个东西找一个教你hello world的博客，自己跟着做一遍。我保证你1个小时之内就可以快速入门这几个东西。
等你先知道这几个东西是什么，同时写过hello world之后，你再来继续看我们的教程

# 3 面试题详解
## 3.1 缘何使用MQ
其实就是问问你
- 消息队列都有哪些使用场景
- 你项目里具体是什么场景
- 说说你在这个场景里用消息队列搞什么

面试官问你这个问题，期望的一个回答是说，你有个什么业务场景，这个业务场景有个什么技术挑战，如果不用MQ可能会很麻烦，但是你现在用了MQ之后带给了你很多的好处

先说一下
### 3.1.1 消息队列的常见使用场景
其实场景有很多，但是比较核心的有3个：解耦、异步、削峰

####  3.1.1.1 解耦
![](https://img-blog.csdnimg.cn/20190516174449953.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
A系统发送个数据到BCD三个系统，接口调用发送

那如果E系统也要这个数据呢？
那如果C系统现在不需要了呢？
现在A系统又要发送第二种数据了呢？

A系统负责人濒临崩溃中。。。再来点更加崩溃的事儿，A系统要时时刻刻考虑BCDE四个系统如果挂了咋办？我要不要重发？我要不要把消息存起来？头都秃了啊!!!

##### 面试技巧
你需要去考虑一下你负责的系统中是否有类似的场景，就是一个系统或者一个模块，调用了多个系统或者模块，互相之间的调用很复杂，维护起来很麻烦。
但是其实这个调用是不需要直接同步调用接口的，如果用MQ给他异步化解耦，也是可以的，你就需要去考虑在你的项目里，是不是可以运用这个MQ去进行系统的解耦。在简历中体现出来这块东西，用MQ作解耦。

####  3.1.1.2 异步
![](https://img-blog.csdnimg.cn/20190516175129333.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

- 使用MQ进行异步化之后的接口性能优化
![在这里插入图片描述](https://img-blog.csdnimg.cn/2019051617523565.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

A系统接收一个请求，需要在自己本地写库，还需要在BCD三个系统写库
自己本地写库要3ms，BCD三个系统分别写库要300ms、450ms、200ms
最终请求总延时是3 + 300 + 450 + 200 = 953ms，接近1s，用户感觉搞个什么东西，慢死了慢死了!!!卸载!
![](https://img-blog.csdnimg.cn/20190516175419852.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190516175503573.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

####  3.1.1.3 削峰
![](https://img-blog.csdnimg.cn/20190516175633796.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

每天0点到11点，A系统风平浪静，每秒并发请求数量就100个。结果每次一到11点~1点，每秒并发请求数量突然会暴增到1万条。但是系统最大的处理能力就只能是每秒钟处理1000个请求啊。。。尴尬了，系统会死。。。
![](https://img-blog.csdnimg.cn/20190516175748284.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)


## 3.2 MQ的优缺点

优点上面已经说了，就是在特殊场景下有其对应的好处，解耦、异步、削峰

缺点呢？显而易见的

### 3.2.1 系统可用性降低
![](https://img-blog.csdnimg.cn/20190516175809538.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
系统引入的外部依赖越多，越容易挂掉，本来你就是A系统调用BCD三个系统的接口就好了，人ABCD四个系统好好的，没啥问题
你偏加个MQ进来，万一MQ挂了咋整？MQ挂了，整套系统崩溃了，你不就完了么。

### 3.2.2 系统复杂性提高
硬生生加个MQ进来
- 你怎么保证消息没有重复消费？
- 怎么处理消息丢失的情况？
- 怎么保证消息传递的顺序性？

头大头大，问题一大堆，痛苦不已

一致性问题：A系统处理完了直接返回成功了，人都以为你这个请求就成功了；但是问题是，要是BCD三个系统那里，BD两个系统写库成功了，结果C系统写库失败了，咋整？你这数据就不一致了。

所以MQ实际是一种非常复杂的架构，你引入它有很多好处，但是也得针对它带来的坏处做各种额外的技术方案和架构来规避掉，最好之后，你会发现，妈呀，系统复杂度提升了一个数量级，也许是复杂了10倍。但是关键时刻，用，还是得用的。。。

## 3.3 kafka、activemq、rabbitmq、rocketmq各自的优缺点
常见的MQ其实就这几种，别的还有很多其他MQ，但是比较冷门的，那么就别多说了

作为一个码农，你起码得知道各种mq的优点和缺点吧，咱们来画个表格看看
![](https://img-blog.csdnimg.cn/20190516180246505.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
综上所述，各种对比之后，倾向于是：

一般的业务系统要引入MQ，最早大家都用ActiveMQ，但是现在确实大家用的不多了，没经过大规模吞吐量场景的验证，社区也不是很活跃，所以大家还是算了吧，我个人不推荐用这个了；

后来大家开始用RabbitMQ，但是确实erlang语言阻止了大量的java工程师去深入研究和掌控他，对公司而言，几乎处于不可控的状态，但是确实人是开源的，比较稳定的支持，活跃度也高；

不过现在确实越来越多的公司，会去用RocketMQ，确实很不错，但是我提醒一下自己想好社区万一突然黄掉的风险，对自己公司技术实力有绝对自信的，我推荐用RocketMQ，否则回去老老实实用RabbitMQ吧，人是活跃开源社区，绝对不会黄

所以中小型公司，技术实力较为一般，技术挑战不是特别高，用RabbitMQ是不错的选择；大型公司，基础架构研发实力较强，用RocketMQ是很好的选择

如果是大数据领域的实时计算、日志采集等场景，用Kafka是业内标准的，绝对没问题，社区活跃度很高，绝对不会黄，何况几乎是全世界这个领域的事实性规范

# 参考
《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)
## [Github](https://github.com/Wasabi1234)