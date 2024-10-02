# Kafka门派知多少

Kafka不是一个单纯的消息引擎系统，而是能实现Exactly-once处理语义的实时流处理平台。Storm/Spark Streaming/Flink，在大规模流处理领域主流，Kafka经长期迭代，已能稍比肩：

- Kafka社区对这些框架心存敬意
- 目前国内鲜有大厂将Kafka用于流处理的尴尬境地，毕竟Kafka是从消息引擎“半路出家”转型成流处理平台，在流处理方面表现还需检验

从流处理平台扩展到流处理生态圈，Kafka更是还有很长的路要走，Kafka Streams提供了Kafka实时处理流数据的能力，但是其实还有一个重要的组件**Kafka Connect**。

在评估流处理平台时，框架本身的性能、所提供操作算子（Operator）的丰富度固然重要，**但框架与上下游交互的能力也很重要**。能与之数据传输的外部系统越多，围绕打造的生态圈越牢固，因而也就有更多人愿意用，形成正反馈促进生态圈发展。

就Kafka而言，Kafka Connect通过一个个具体连接器（Connector），串联上下游的外部系统。

Kafka生态圈：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/3acd4c24db3299a38bee83f802f51fad.png)

外部系统只是Kafka Connect组件支持的一部分而已，使用Kafka Connect组件的用户越来越多，相信在未来会有越来越多的人开发自己的连接器。

清晰了解Kafka的发展脉络和生态圈现状，指导我们选择合适的Kafka版本大有裨益。

## Kafka门派几何?

不是指版本，而是指存在多个组织或公司发布不同的Kafka

> 你一定听说过Linux发行版，比如CentOS、RedHat、Ubuntu等，都是Linux系统，但为什么有不同的名字呢？
> 其实就是因为它们是不同公司发布的Linux系统，即不同的发行版。虽说在Kafka领域没有发行版的概念，但你姑且可以这样近似地认为市面上的确存在着多个Kafka“发行版”。

下面我就来梳理一下这些所谓的“发行版”以及你应该如何选择它们。
当然了，“发行版”这个词用在Kafka框架上并不严谨，但为了便于我们区分这些不同的Kafka，勉强套用

## Apache Kafka

最“正宗”的Kafka，也应该是你最熟悉的发行版了。自Kafka开源伊始，它便在Apache基金会孵化并最终毕业成为顶级项目，它也被称为社区版Kafka
它是后面其他所有发行版的基础。也就是说，后面提到的发行版

- 原封不动地继承了Apache Kafka
- 在此之上扩展了新功能

总之Apache Kafka是我们学习和使用Kafka的基础。

## Confluent Kafka

> 2014年，Kafka的3个创始人Jay Kreps、Naha Narkhede和饶军离开LinkedIn创办了Confluent公司，专注于提供基于Kafka的企业级流处理解决方案。
> 2019年1月，Confluent公司成功融资D轮1.25亿美元，估值也到了25亿美元，足见资本市场的青睐。

Confluent公司主要从事商业化Kafka工具开发，并在此基础发布Confluent Kafka。Confluent Kafka提供Apache Kafka没有的高级特性，如跨数据中心备份、Schema注册中心及集群监控工具。

## Cloudera/Hortonworks Kafka

Cloudera的CDH和Hortonworks的HDP是著名大数据平台，集成目前主流的大数据框架，帮助用户实现从分布式存储、集群调度、流处理到机器学习、实时数据库等全方位的数据处理。很多创业公司搭建数据平台时首选这俩产品。都集成了Apache Kafka。

2018年10月两家公司合并，共同打造世界领先的数据平台，也许以后CDH和HDP也会合并成一款产品，但能肯定Apache Kafka依然包含其中，并作为新数据平台的一部分对外提供服务。

## 特点比较

### Apache Kafka

依然是开发人数最多、版本迭代速度最快的Kafka
在2018年度Apache基金会邮件列表开发者数量最多的Top 5排行榜中，Kafka社区邮件组排名第二位。如果你使用Apache Kafka碰到任何问题并提交问题到社区，社区都会比较及时地响应你。这对于我们Kafka普通使用者来说无疑是非常友好的。

但是Apache Kafka的劣势在于它仅仅提供最最基础的组件，特别是对于前面提到的Kafka Connect而言，社区版Kafka只提供一种连接器，即读写磁盘文件的连接器，而没有与其他外部系统交互的连接器，在实际使用过程中需要自行编写代码实现，这是它的一个劣势

Apache Kafka没有提供任何监控框架或工具。显然在线上环境不加监控肯定是不可行的，你必然需要借助第三方的监控框架实现对Kafka的监控。好消息是目前有一些开源的监控框架可以帮助用于监控Kafka（比如Kafka manager）。

**`如果仅仅需要一个消息引擎系统亦或是简单的流处理应用场景，同时需要对系统有较大把控度，那么推荐使用Apache Kafka`**

### Confluent Kafka

Confluent Kafka分免费版和企业版，前者和Apache Kafka像，除常规组件外，免费版还包含

- Schema注册中心：集中管理Kafka消息格式以实现数据前向/后向兼容
- REST proxy：开放HTTP接口方式，允许你通过网络访问Kafka各种功能

这两个Apache Kafka都没。

免费版包含更多连接器，都是Confluent公司开发并认证过的，可免费使用它。企业版功能更多，最有用的当属跨数据中心备份和集群监控。多IDC间数据同步及对集群的监控历来是Kafka痛点。

但Confluent Kafka缺陷在于，Confluent公司暂未发展国内业务的计划，相关资料及技术支持欠缺，很多国内Confluent Kafka使用者无法找到对应中文文档，因此目前Confluent Kafka国内普及率低。

如果要用到Kafka一些高级特性，推荐Confluent Kafka。

###  CDH/HDP Kafka

大数据云公司发布的Kafka（CDH/HDP Kafka）。
这些大数据平台天然集成Apache Kafka，通过便捷化界面操作将Kafka安装、运维、管理、监控统一在控制台。如你是这些平台用户一定觉得非常方便，因为所有操作都可在前端完成，而不必去执行复杂的Kafka命令。另外这些平台提供的监控界面也非常友好，你通常不需要进行任何配置就能有效地监控 Kafka。

但这样结果是：

- 直接降低你对Kafka集群掌控度
  毕竟你对下层的Kafka集群一无所知，你怎么能做到心中有数呢？
- 滞后性
  它有自己的发布周期，是否能及时地包含最新版本的Kafka就成问题。比如CDH 6.1.0版本发布时Apache Kafka已经演进到了2.1.0版本，但CDH中的Kafka依然是2.0.0版本，显然那些在Kafka 2.1.0中修复的Bug只能等到CDH下次版本更新时才有可能被真正修复

如需快速搭建消息引擎系统或者你需要搭建的是多框架构成的数据平台且Kafka只是其中一个组件，那么推荐使用这些大数据云公司提供的Kafka。

## 总结

Apache Kafka，即社区版Kafka：

- 迭代速度快，社区响应度高，使用它可以让你有更高的把控度
- 但仅提供基础核心组件，缺高级特性

Confluent Kafka，Confluent公司提供的Kafka

- 集成很多高级特性且由Kafka原班人马打造，质量有保证
- 但相关文档资料不全，普及率较低，没有参考范例

CDH/HDP Kafka，大数据云公司提供的Kafka，内嵌Apache Kafka

- 优势在于操作简单，节省运维成本
- 缺陷在于把控度低，演进速度较慢。