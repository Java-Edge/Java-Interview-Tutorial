# 01-Hadoop

## 1 Hadoop概述

Hadoop项目作者的孩子给一个棕黄色的大象样子的填充玩具的命名。

### Hadoop能做什么

搭建大型数据仓库，PB级数据的存储、处理、分析、统计等业务

### Hadoop核心组件 - 分布式文件系统HDFS

源于Google的GFS论文，发表于2003.10。HDFS是GFS的克隆版

HDFS特点：扩展性&容错性&海量数量存储

将文件切分成指定大小的数据块，并以多副本的存储在多个机器上。数据切分、多副本、容错等操作对用户是透明的。

Block Replication

```scala
Namenode(Filename, numReplicas, block-ids, ..)
/users/javaedge/data/part-0, r:2, {1,3},...
/users/javaedge/data/part-1, r:3, {2,4,5},...
```

Datanodes：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/85d901caafb32c34a448d652a9b34bc2.png)

## Hadoop核心组件 - 资源调度系统YARN

Yet Another Resource Negotiator，Hadoop 的集群资源管理系统。 YARN 在 Hadoop 2 中被引入以改进 MapReduce 实现，但它也足以支持其他分布式计算范例。

特点：扩展性&容错性&多框架资源统一调度。

YARN 提供了用于请求和使用集群资源的 API，但这些 API 通常不被用户代码直接使用。相反，用户写入分布式计算框架提供的更高级别的 API，这些框架本身构建在 YARN 之上，并对用户隐藏资源管理细节。这种情况如下图所示，一些分布式计算框架（MapReduce、Spark 等）作为 YARN 应用程序在集群计算层（YARN）和集群存储层（HDFS 和 HBase）上运行。

YARN applications：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7a8bdc29840e8ede23ffed04a25a2d6a.png)

![](https://upload-images.jianshu.io/upload_images/4685968-ce6788fca97f198c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## Hadoop核心组件之分布式计算框架MapReduce

源自于Google的MapReduce论文，发表于2004年12月。MapReduce是Google MapReduce的克隆版

MapReduce特点：扩展性&容错性&海量数量离线处理

![](https://upload-images.jianshu.io/upload_images/4685968-2f0d9fcc6e84e6c7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## Hadoop优势



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/8c3b69cfe7a78e0554038f1b931aa6f1.png)

### 高可靠性

- 数据存储：数据块多副本
- 数据计算：重新调度作业计算

### 高扩展性

- 存储/计算资源不够时，可以横向的线性扩展机器
- 一个集群中可以包含数以干计的节点

### 其它

存储在廉价机器上，降低成本

成熟的生态圈

## 狭义Hadoop V.S 广义Hadoop

狭义的Hadoop：是一个适合大数据分布式存储( HDFS )、分布式计算(MapReduce)和资源调度( YARN )的平台。

- 广义的Hadoop

  指的是Hadoop生态系统，Hadoop生态系统是一个庞大概念，hadoop是其中最重要最基础的一个部分;生态系统中的每一子系统只解决某一个特定的问题域 (甚至可能很窄)，不搞统一型的一个全能系统，而是小而精的多个小系统。

![](https://upload-images.jianshu.io/upload_images/4685968-c2fcacf7e4e9f541.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## Hadoop生态系统的特点

- 开源、社区活跃
- 囊括了大数据处理的方方面面
- 成熟的生态圈

##  Hadoop常用发行版及选型

- Apache Hadoop
- CDH : Cloudera Distributed Hadoop
- HDP : Hortonworks Data Platform

## SQL on Hadoop

基于Hadoop生态的一个SQL引擎架构。受查询数据量、查询类型、并发等因素影响，SQL引擎无银弹。

使用SQL语句对大数据进行统计分析，数据是在Hadoop。

参考

- https://help.aliyun.com/zh/dataworks/user-guide/create-a-data-layer?spm=a2c4g.11186623.0.i7&accounttraceid=418da419505d4c17b808f28c2caf709ddrap