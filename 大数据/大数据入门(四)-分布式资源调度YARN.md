# 1 YARN产生背景
YARN是Hadoop2.x才有的，所以在介绍YARN之前，我们先看一下MapReduce1.x时所存在的问题：
- 单点故障
- 节点压力大
- 不易扩展

## 1.1 MapReduce1.x时的架构
![](https://upload-images.jianshu.io/upload_images/16782311-037c574135d58806.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到，1.x时,即 Master/Slave 主从结构，在集群上的表现就是一个`JobTracker`带多个`TaskTracker`

- JobTracker
负责资源管理和作业调度
- TaskTracker
    - 定期向JobTracker汇报本节点的健康状况、资源使用情况以及作业执行情况
    - 接收来自JobTracker的命令，例如启动任务或结束任务等。

## 1.2 该架构存在的问题
- 整个集群中只有一个`JobTracker`，就代表着会存在单点故障的情况
- `JobTracker`节点的压力很大，不仅要接收来自客户端的请求，还要接收大量`TaskTracker`节点的请求
- 由于`JobTracker`是单节点，所以容易成为集群中的瓶颈，而且也不易域扩展
- `JobTracker`承载的职责过多，基本整个集群中的事情都是`JobTracker`来管理
- 1.x版本的整个集群只支持`MapReduce`作业，其他例如`Spark`的作业就不支持了

由于1.x版本不支持其他框架的作业，所以导致我们需要根据不同的框架去搭建多个集群。这样就会导致资源利用率比较低以及运维成本过高，因为多个集群会导致服务环境比较复杂
![](https://upload-images.jianshu.io/upload_images/16782311-90dc1aed42e4375b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



在上图中我们可以看到，不同的框架不仅需要搭建不同的集群
而且这些集群很多时候并不是总是在工作，如上图可以看到，Hadoop集群在忙的时候Spark就比较闲，Spark集群比较忙的时候Hadoop集群就比较闲，而MPI集群则是整体并不是很忙
这样就无法高效的利用资源，因为这些不同的集群无法互相使用资源
除此之外，我们还得运维这些个不同的集群，而且文件系统是无法共享的
如果当需要将Hadoop集群上的HDFS里存储的数据传输到Spark集群上进行计算时，还会耗费相当大的网络IO流量

所以我们就想着要把这些集群都合并在一起，让这些不同的框架能够运行在同一个集群上，这样就能解决这各种各样的问题了.如下
![](https://upload-images.jianshu.io/upload_images/4685968-469362479c6b7111.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

正是因为在1.x中，有各种各样的问题，才使得YARN得以诞生，而YARN就可以令这些不同的框架运行在同一个集群上，并为它们调度资源

- Hadoop2.x的架构图：
![](https://upload-images.jianshu.io/upload_images/4685968-0440f80c507a3627.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在上图中，我们可以看到，集群最底层的是HDFS，在其之上的就是YARN层，而在YARN层上则是各种不同的计算框架。所以不同计算框架可以共享同一个HDFS集群上的数据，享受整体的资源调度，进而提高集群资源的利用率，这也就是所谓的 xxx on YARN

# 2  YARN 架构
## 2.1 概述
- YARN是资源调度框架
- 通用的资源管理系统
- 为上层应用提供统一的资源管理和调度

## 2.2  核心组件
### 2.2.1 ResourceManager(RM)
- 整个集群同一时间提供服务的RM只有一个，它负责集群资源的统一管理和调度
- 还需要处理客户端的请求，例如：提交作业或结束作业等
- 并且监控集群中的NM，一旦某个NM挂了，那么就需要将该NM上运行的任务告诉AM来如何进行处理。

### 2.2.2 NodeManager(NM)
整个集群中会有多个NM，它主要负责自己本身节点的资源管理和使用，以及定时向RM汇报本节点的资源使用情况。接收并处理来自RM的各种命令，例如：启动Container。NM还需要处理来自AM的命令，例如：AM会告诉NM需要启动多少个Container来跑task。

### 2.2.3 ApplicationMaster(AM)
每个应用程序都对应着一个AM。例如：MapReduce会对应一个、Spark会对应一个。它主要负责应用程序的管理，为应用程序向RM申请资源（Core、Memory），将资源分配给内部的task。AM需要与NM通信，以此来启动或停止task。task是运行在Container里面的，所以AM也是运行在Container里面。

### 2.2.4 Container
 封装了CPU、Memory等资源的一个容器，相当于是一个任务运行环境的抽象

### 2.2.5 Client
客户端，它可以提交作业、查询作业的运行进度以及结束作业

# 3 YARN 执行流程
## [官网](https://hadoop.apache.org/docs/stable/hadoop-yarn/hadoop-yarn-site/YARN.html)
![](https://upload-images.jianshu.io/upload_images/16782311-12755b060ee017a2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-f2ff770d798140ae.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
1.client向yarn提交job，首先找ResourceManager分配资源，
2.ResourceManager开启一个Container,在Container中运行一个Application manager
3.Application manager找一台nodemanager启动Application master，计算任务所需的计算
4.Application master向Application manager（Yarn）申请运行任务所需的资源
5.Resource scheduler将资源封装发给Application master
6.Application master将获取到的资源分配给各个nodemanager
7.各个nodemanager得到任务和资源开始执行map task
8.map task执行结束后，开始执行reduce task
9.map task和 reduce task将执行结果反馈给Application master
10.Application master将任务执行的结果反馈pplication manager。

另外找到两篇关于YARN执行流程不错的文章：

*   [【图文】YARN 工作流程](https://wenku.baidu.com/view/3483f6914793daef5ef7ba0d4a7302768e996fda.html)
*   [Yarn应用程序运行流程剖析](https://www.cnblogs.com/yurunmiao/p/4494582.html)

# 4 YARN 环境搭建
## 4.1 [官方文档指南](http://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/hadoop-project-dist/hadoop-common/SingleCluster.html)  
![](https://upload-images.jianshu.io/upload_images/16782311-ca0973d9b8811709.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-3d06a9d0cb1d5396.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 1
![](https://upload-images.jianshu.io/upload_images/16782311-7b656017694569d8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-7fdd6c9976747815.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 2
![](https://upload-images.jianshu.io/upload_images/16782311-56b51478c7f12100.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 3
![](https://upload-images.jianshu.io/upload_images/16782311-229f7ab638f639fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 有1不健康节点
![](https://upload-images.jianshu.io/upload_images/16782311-ec9264ff8b1ac72a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 错误解决：
从上图中，可以看到有一个不健康的节点，也就是说我们的单节点环境有问题，点击红色框框中标记的数字可以进入到详细的信息页面，在该页面中看到了如下信息：
![](https://upload-images.jianshu.io/upload_images/16782311-c8f28ee9d80f54e4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 于是查看yarn的日志文件：yarn-root-nodemanager-localhost.log，发现如下警告与异常
![](https://upload-images.jianshu.io/upload_images/16782311-33bd765ff18c1a77.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 很明显是因为磁盘的使用空间达到了90%，所以我们需要删除一些没有的数据，或者扩容磁盘空间才行。于是删除了一堆，让磁盘空间降低到90%以下了：


## 验证
![](https://upload-images.jianshu.io/upload_images/16782311-e20088c8fd2a5c28.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
到此为止，我们的yarn环境就搭建完成了.

# 5 提交 PI 的 MapReduce 作业到 TARN 上执行
## 5.1 提交作业
虽然我们没有搭建MapReduce的环境，但是我们可以使用Hadoop自带的一些测试例子来演示一下如何提交作业到YARN上执行。Hadoop把example的包放在了如下路径，可以看到有好几个jar包：
- hadoop-2.6.0-cdh5.7.0/share/hadoop/mapreduce/
![](https://upload-images.jianshu.io/upload_images/16782311-1ab275434b204b80.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 在这里我们使用hadoop-mapreduce-examples-2.6.0-cdh5.7.0.jar这个jar包来进行演示：
![](https://upload-images.jianshu.io/upload_images/16782311-ace32444a534d265.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 5.2 命令说明
```
hadoop jar hadoop-mapreduce-examples-2.6.0-cdh5.7.0.jar pi 2 3
```

- hadoop jar 执行一个jar包作业的命令
- hadoop-mapreduce-examples-2.6.0-cdh5.7.0.jar 需要被执行的jar包路径
- pi 表示计算圆周率，可以写其他的
- 末尾的两个数据分别表示指定运行2次map， 以及指定每个map任务取样3次，两数相乘即为总的取样数。

## 5.3 运行以上命令后，到浏览器页面上进行查看，会有以下三个阶段：

### 5.3.1 接收资源
- 这个阶段就是ApplicationMaster到ResourceManager上申请作业所需要的资源
![](https://upload-images.jianshu.io/upload_images/16782311-700abea2f3c6915e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 5.3.2 运行作业
- 这时候NodeManager就会把task运行在启动的Container里
![](https://upload-images.jianshu.io/upload_images/16782311-f715bc9673de56df.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 5.3.3 作业完成
![](https://upload-images.jianshu.io/upload_images/16782311-32291f22a86b614d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

