- 官网首页
![](https://upload-images.jianshu.io/upload_images/4685968-4bbf5f7aae048c30.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 1 简介
- 名字的由来
Hadoop这个名字不是一个缩写，而是一个虚构的名字。该项目的创建者，Doug Cutting解释Hadoop的得名 ：“这个名字是我孩子给一个棕黄色的大象玩具命名的。我的命名标准就是简短，容易发音和拼写，没有太多的意义，并且不会被用于别处。小孩子恰恰是这方面的高手。”

- 介绍
![](https://upload-images.jianshu.io/upload_images/16782311-c809d35e6b3e3493.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# 2 应用
- 搭建大型数据仓库，PB级数据的存储、处理、分析、统计等业务
- 搜索引擎，从海量的数据中筛选出用户所需要的数据
- 日志分析，是目前大数据技术最主流的应用场景，因为数据挖掘、分析大部分都是基于日志的
- 商业智能，我们都知道数据是人工智能的燃料，通过海量的数据能够训练出比较好的机器学习模型
- 数据挖掘，从海量的数据中挖掘出有价值的数据，为公司提供效益，实现数据变现，就像是挖矿一样
![](https://upload-images.jianshu.io/upload_images/16782311-3e14918911d7c08c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 3 Hadoop 框架
包含了以下这些模块：
- Hadoop Common：这是一个通用的模块，是包含着其他Hadoop模块的一个通用模块
- Hadoop Distributed File System (HDFS)：这是一个分布式文件系统，该模块提供一个对应用程序数据的高通量访问的分布式文件系统，简称HDFS
- Hadoop YARN：这是一个用于作业调度与集群资源管理的框架
- Hadoop MapReduce：基于YARN的大数据量并行处理系统，也就是实现分布式计算的框架

## 3.1 Hadoop核心组件之 HDFS
HDFS是Hadoop核心组件之一，它用于实现分布式的文件系统.
HDFS源自于Google的GFS论文，论文发表于2003年10月.
由于GFS并没有开源，只是发表了论文，所以才发展出了HDFS，HDFS是GFS的克隆版。

## HDFS 的特点
- 扩展性，可以直接水平扩展，机器不够用了，直接增加机器即可
- 容错性，以多副本的方式存储在多个节点上
- 海量数据存储
- 将文件切分成指定大小的数据块并以多副本的存储在多个机器上，默认的数据块大小是128M
- 数据切分、多副本、容错等操作对用户是透明的，用户无需关注底层的数据切分

## 图解
- `Block Replication `表是数据块副本存储的格式信息
![](https://upload-images.jianshu.io/upload_images/16782311-c043dcf720ad62b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- `Datanodes` 示意数据节点中存储的一个个数据块
![](https://upload-images.jianshu.io/upload_images/16782311-ce1a8228167d022d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们以 `/users/sameerp/data/part-0, r:2, {1,3},... `为例来简单说明
- /users/sameerp/data/part-0 表示的是文件名
- r:2 表示每个数据块有多少个副本，这里的数字为2，就表示每个数据块都有2个副本
- {1,3} 表示数据块的编号

结合起来就是 `/users/sameerp/data/part-0` 这个文件有两个数据块，编号分别是 `1` 和` 3` ，而这两个数据块各自都有 `2` 个副本.

我们从上图中的`Datanodes`示意的数据节点里，也可以看到1和3都分别有两份，存储在了不同的数据节点上
![](https://upload-images.jianshu.io/upload_images/16782311-493fc75d6c668598.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 3.2 Hadoop核心组件之 YARN
YARN是Hadoop核心组件之一，它用于实现资源管理、调度系统.
YARN是Yet Another Resource Negotiator的首字母缩写，意为 “另一种资源协调者” 。YARN负责整个集群资源的管理和调度，例如有一个作业上来，那么要给这个作业分配多少cpu以及内存就是由YARN来完成。

## YARN特点
- 扩展性，如果机器资源不够用，则可以以增加机器的方式来提升资源的分配率
- 容错性，作业在执行过程当中，如果出现问题，YARN就会对这个作业进行一定次数的重设
- 多框架资源统一调度，这是Hadoop2.x才有的特性，也是非常重要的特性
![](https://upload-images.jianshu.io/upload_images/4685968-ce6788fca97f198c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
从上图中可以看到，YARN可以统一调度多种不同的框架，这样不管对运维人员还是开发人员来说，都减轻了不少负担.

## 3.3 MapReduce
MapReduce是Hadoop核心组件之一，它用于实现分布式并行计算。Hadoop中的MapReduce源自于Google的MapReduce论文，论文发表于2004年12月。MapReduce其实就是Google MapReduce的克隆版，是Google MapReduce的开源实现。

MapReduce特点：
- 扩展性，如果机器的计算能力不够用，则可以以增加机器的方式来提升集群的计算能力
- 容错性，当某个计算节点的机器挂掉，会把任务分配给其他节点的机器完成
- 海量数据离线处理

下图简单展示了MapReduce的计算流程：
![](https://upload-images.jianshu.io/upload_images/4685968-2f0d9fcc6e84e6c7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
上图是一个统计词频的计算流程
- 在Input环节中，我们把文本进行输入
- 然后在Splitting环节按照空格分割每个单词
- 接着在Mapping环节中把相同的单词都映射到同一个节点上
- 到了Shuffling环节就会对数据进行洗牌
- 最后到Reducing环节进行数据的整合
- 并将最终的结果写入到一个文件中

# 4 Hadoop优势
## 4.1  高可靠性
- 数据存储：数据块多副本
- 数据计算：重新调度作业计算

## 4.2 高扩展性
- 存储 / 计算资源不够时，可以横向的线性扩展机器
- 一个集群可以包含数以千记的节点

## 4.3 成本计算
- 可以存储在廉价机器上，降低成本
- 非常成熟的生态圈

关于Hadoop发展史可以参考这篇文章
*   [Hadoop十年解读与发展预测](http://www.infoq.com/cn/articles/hadoop-ten-years-interpretation-and-development-forecast)

# 5 Hadoop生态系统
## 5.1 狭义的Hadoop与广义的Hadoop
- 狭义的Hadoop：是一个适合大数据分布式存储（HDFS）、分布式计算（MapReduce）和资源调度（YARN）的平台，也就是Hadoop框架
- 广义的Hadoop：指的是Hadoop生态系统，Hadoop生态系统是一个很庞大的概念，Hadoop框架是其中最重要最基础的一个部分。生态系统中的每一子系统只解决某一个特定的问题域（甚至可能很窄），不搞统一型的一个全能系统，而是小而精的多个小系统。工作岗位招聘上写的Hadoop一般都是指广义的Hadoop，也就是Hadoop生态系统。

- Hadoop生态系统示意图：
![](https://upload-images.jianshu.io/upload_images/4685968-c2fcacf7e4e9f541.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 5.2 特点
- 开源以及社区活跃
- 囊括了大数据数理的方方面面
- 成熟的生态圈

## 5.3 Hadoop常用发行版及选型
Hadoop就像Linux一样，也有多个发行版，常用发行版有以下几种：

### 5.3.1 原生态的Apache Hadoop
原生态的Apache Hadoop框架在生产环境中不建议使用，因为Apache社区里的Hadoop生态系统的框架只是解决了单个框架的问题，如果想要将不同的框架，例如Hive、Hbase等框架综合起来使用的话，总是会产生jar包的冲突问题，而且这些冲突问题通常都是无法解决的。所以在学习的时候可以使用Apache Hadoop，但是生产环境中就不太建议使用了

### 5.3.2 HDP：Hortonworks Data Platform

### 5.3.3  CDH：Cloudera Distributed Hadoop
CDH以及HDP都是基于Apache Hadoop社区版衍生出来的，这两个发行版虽然是商业版的，但是不属于收费版本，除非需要提供技术服务，才需要收取一定的服务费用，并且它们也都是开源的。在国内绝大多数公司都会选择使用CDH版本，所以在这里也主要介绍CDH，选择CDH的主要理由如下：

CDH对Hadoop版本的划分非常清晰，只有两个系列的版本(现在已经更新到CDH6.2.x了，基于hadoop2.x)，分别是cdh3和cdh4，分别对应第一代Hadoop（Hadoop 1.0）和第二代Hadoop（Hadoop 2.0），相比而言，Apache版本则混乱得多；
CDH文档清晰且丰富，很多采用Apache版本的用户都会阅读cdh提供的文档，包括安装文档、升级文档等。
而且CDH提供了一个CM组件，让我们在安装它的时候只需要在浏览器上的页面中，点击各种下一步就可以完成安装，比起Apache Hadoop的安装要方便很多，而且很多操作都可以在图形界面上完成，例如集群的搭建以及节点切换等。CDH与Spark的合作是非常好的，所以在CDH中对Spark的支持比较好。最主要的是一般情况下使用同一版本的CDH，就不会发生jar冲突的情况。

CDH的下载地址如下：
[http://archive.cloudera.com/cdh5/cdh/5/](http://archive.cloudera.com/cdh5/cdh/5/)

> 注：选择版本的时候尽量保持一致，例如hive选择了cdh5.7.0的话，那么其他框架也要选择cdh5.7.0，不然有可能会发生jar包的冲突。