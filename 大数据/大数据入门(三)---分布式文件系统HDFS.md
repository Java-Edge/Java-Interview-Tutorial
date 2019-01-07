# 1 HDFS概述及设计目标
## 1.1 什么是HDFS：
- Hadoop实现的一个分布式文件系统（Hadoop Distributed File System），简称HDFS
- 源自于Google的GFS论文
- 论文发表于2003年，HDFS是GFS的克隆版

## 1.2 HDFS的设计目标：
![](https://upload-images.jianshu.io/upload_images/4685968-7ee31a7012547b5c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 非常巨大的分布式文件系统
- 运行在普通廉价的硬件上
- 易扩展、为用户提供性能不错的文件存储服务

### [HDFS官方文档地址](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)

# 2 HDFS架构
HDFS是主/从式的架构。一个HDFS集群会有一个NameNode（简称NN），也就是命名节点，该节点作为主服务器存在（master server）.
- NameNode用于管理文件系统的命名空间以及调节客户访问文件
- 此外，还会有多个DataNode（简称DN），也就是数据节点，数据节点作为从节点存在（slave server）
- 通常每一个集群中的DataNode，都会被NameNode所管理，DataNode用于存储数据。

HDFS公开了文件系统名称空间，允许用户将数据存储在文件中，就好比我们平时使用操作系统中的文件系统一样，用户无需关心底层是如何存储数据的
而在底层，一个文件会被分成一个或多个数据块，这些数据库块会被存储在一组数据节点中。在CDH中数据块的默认大小是128M，这个大小我们可以通过配置文件进行调节
在NameNode上我们可以执行文件系统的命名空间操作，如打开，关闭，重命名文件等。这也决定了数据块到数据节点的映射。

我们可以来看看HDFS的架构图
![](https://upload-images.jianshu.io/upload_images/16782311-473fab5519df59d5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

HDFS被设计为可以运行在普通的廉价机器上，而这些机器通常运行着一个Linux操作系统。HDFS是使用Java语言编写的，任何支持Java的机器都可以运行HDFS
使用高度可移植的Java语言编写的HDFS，意味着可以部署在广泛的机器上
一个典型的HDFS集群部署会有一个专门的机器只能运行`NameNode`，而其他集群中的机器各自运行一个`DataNode`实例。虽然一台机器上也可以运行多个节点，但是并不建议这么做，除非是学习环境。

## 总结
- HDFS是主/从式的架构，一个HDFS集群会有一个NameNode以及多个DataNode
- 一个文件会被拆分为多个数据块进行存储，默认数据块大小是128M
- 即便一个数据块大小为130M，也会被拆分为2个Block，一个大小为128M，一个大小为2M
- HDFS是使用Java编写的，使得其可以运行在安装了JDK的操作系统之上

### NN
- 负责客户端请求的响应
- 负责元数据（文件的名称、副本系数、Block存放的DN）的管理

### DN
- 存储用户的文件对应的数据块（Block）
- 会定期向NN发送心跳信息，汇报本身及其所有的block信息和健康状况

# 3 HDFS副本机制
在HDFS中，一个文件会被拆分为一个或多个数据块
默认情况下，每个数据块都会有三个副本
每个副本都会被存放在不同的机器上，而且每一个副本都有自己唯一的编号

- 如下图
![](https://upload-images.jianshu.io/upload_images/16782311-645dc0e247a461dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 4 HDFS 副本存放策略
NameNode节点选择一个DataNode节点去存储block副本得过程就叫做副本存放，这个过程的策略其实就是在可靠性和读写带宽间得权衡。

《Hadoop权威指南》中的默认方式：
- 第一个副本会随机选择，但是不会选择存储过满的节点。
- 第二个副本放在和第一个副本不同且随机选择的机架上。
- 第三个和第二个放在同一个机架上的不同节点上。
- 剩余的副本就完全随机节点了
![](https://upload-images.jianshu.io/upload_images/16782311-019d6daca91ad6d7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 可以看出这个方案比较合理
- 可靠性：block存储在两个机架上
- 写带宽：写操作仅仅穿过一个网络交换机
- 读操作：选择其中得一个机架去读
- block分布在整个集群上

# 5 HDFS伪分布式环境搭建
## 5.1 [官方安装文档地址](http://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/hadoop-project-dist/hadoop-common/SingleCluster.html)

## 5.2 环境参数
*   Mac OS 10.14.4
*   JDK1.8
*   Hadoop 2.6.0-cdh5.7.0
*   ssh
*   rsync

## 5.3 安装配置
下载`Hadoop 2.6.0-cdh5.7.0`的tar.gz包并解压：
![CentOS 环境安装步骤](https://upload-images.jianshu.io/upload_images/4685968-927332d15a02dcda.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
MacOS安装环境
![安装jdk](https://upload-images.jianshu.io/upload_images/4685968-bcb2025026a057d6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![jdk安装路径](https://upload-images.jianshu.io/upload_images/4685968-a6dae1598afd3fa7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![/usr/libexec/java_home -V:列出所有版本的JAVA_HOME](https://upload-images.jianshu.io/upload_images/4685968-3644ada3cb314a27.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
设置 JAVA_HOME
- 添加java_home到.bash_profile文件中
```
export JAVA_HOME=$(/usr/libexec/java_home)
export PATH=$JAVA_HOME/bin:$PATH
export CLASS_PATH=$JAVA_HOME/lib 
```
![ Mac OS X ssh设置](https://upload-images.jianshu.io/upload_images/4685968-f9a0dca736dc38f5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 输入命令ssh localhost，可能遇到如下问题
![](https://upload-images.jianshu.io/upload_images/16782311-69c8ccf6d15103f3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 原因是没打开远程登录，进入系统设置->共享->远程登录打开就好
![](https://upload-images.jianshu.io/upload_images/16782311-d6900878b1a54c98.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这时你再ssh localhost一下
![](https://upload-images.jianshu.io/upload_images/16782311-99395bdeeb984887.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 5.3 下载 Hadoop
[下载](http://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0.tar.gz)

```
tar -zxvf hadoop-2.6.0-cdh5.7.0.tar.gz
```
- 解压到doc目录,解压完后，进入到解压后的目录下，可以看到hadoop的目录结构如下![image](http://upload-images.jianshu.io/upload_images/16782311-aa6a4dce86e60078?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- bin目录存放可执行文件
- etc目录存放配置文件
- sbin目录下存放服务的启动命令
- share目录下存放jar包与文档

以上就算是把hadoop给安装好了，接下来就是编辑配置文件，把JAVA_HOME配置一下
```
cd etc/
cd hadoop
vim hadoop-env.sh
export JAVA_HOME=/usr/local/jdk1.8/  # 根据你的环境变量进行修改
```
![image](http://upload-images.jianshu.io/upload_images/16782311-dba238283b832628?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


![官方指南](https://upload-images.jianshu.io/upload_images/4685968-17d4b56c74fdc223.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 编辑 hadoop-env.sh 文件
```
export JAVA_HOME=${/usr/libexec/java_home}
```
![image](http://upload-images.jianshu.io/upload_images/16782311-5be35af70fa17a28?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![image](http://upload-images.jianshu.io/upload_images/16782311-ebd055005d66ad6a?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
由于我们要进行的是单节点伪分布式环境的搭建，所以还需要配置两个配置文件，分别是core-site.xml以及hdfs-site.xml


Hadoop也可以在伪分布模式下的单节点上运行，其中每个Hadoop守护进程都在单独的Java进程中运行
- [配置](http://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/hadoop-project-dist/hadoop-common/SingleCluster.html#Configuration)
![](https://upload-images.jianshu.io/upload_images/16782311-8dfa64dd3a262121.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 路径
![](https://upload-images.jianshu.io/upload_images/16782311-6b0e6180f3028c47.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 具体配置
![](https://upload-images.jianshu.io/upload_images/16782311-9620a0c192ba4e98.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-81509d828d9aa1e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 配置 datanode 节点数
![](https://upload-images.jianshu.io/upload_images/4685968-6d06260d15d72d03.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 5.4 启动 hdfs
- [官方文档说明](http://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.7.0/hadoop-project-dist/hadoop-common/SingleCluster.html#Execution)
![](https://upload-images.jianshu.io/upload_images/16782311-d8ecde72ce153ff2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 在启动之前需要先格式化文件系统
```
$ bin/hdfs namenode -format
```
![](https://upload-images.jianshu.io/upload_images/16782311-c1b127b99f749950.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
> 只有第一次启动才需要格式化

-  使用服务启动脚本启动服务
```
$ sbin/start-dfs.sh
```
![](https://upload-images.jianshu.io/upload_images/16782311-6f4e73a0cf17203b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 检查是否有以下几个进程，如果少了一个都是不成功的
![](https://upload-images.jianshu.io/upload_images/16782311-e3fd4aea41b0dd1c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


访问http://localhost:50070/
![](https://upload-images.jianshu.io/upload_images/16782311-ddd1b6186ac12add.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

表示HDFS已经安装成功
![](https://upload-images.jianshu.io/upload_images/16782311-33353ba0aa6aecfa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-8a139f269e6feaee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 然后将Hadoop的安装目录配置到环境变量中，方便之后使用它的命令
![](https://upload-images.jianshu.io/upload_images/16782311-1c18482152b2fcfa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-b8124c6336296d87.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 关闭
![](https://upload-images.jianshu.io/upload_images/4685968-706daaaa9dfab81c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如上，可以看到节点的信息。到此，我们伪分布式的hadoop集群就搭建完成了.

# 6 HDFS Shell  
以上已经介绍了如何搭建伪分布式的Hadoop，既然环境已经搭建起来了，那要怎么去操作呢？这就是本节将要介绍的内容：

HDFS自带有一些shell命令，通过这些命令我们可以去操作HDFS文件系统，这些命令与Linux的命令挺相似的，如果熟悉Linux的命令很容易就可以上手HDFS的命令
![](https://upload-images.jianshu.io/upload_images/4685968-b34f39ea1d975010.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
官网指南
![](https://upload-images.jianshu.io/upload_images/4685968-cbc2a3f6aa35274d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
先启动 HDFS

![配置 hadoop 环境变量](https://upload-images.jianshu.io/upload_images/4685968-9bb6d7865a91b9b6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![成功](https://upload-images.jianshu.io/upload_images/4685968-7770ead8128c2c0c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![指令集](https://upload-images.jianshu.io/upload_images/4685968-5bca91ff8de554d8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![dfs fs 无差异](https://upload-images.jianshu.io/upload_images/4685968-39d7c9829ffced30.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![上传一个 txt 文件](https://upload-images.jianshu.io/upload_images/4685968-a8dd55e6f99ea125.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-e32707d1a30bd060.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
创建文件夹
![](https://upload-images.jianshu.io/upload_images/4685968-6dfd7ff16dc65852.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
多层次文件夹
![](https://upload-images.jianshu.io/upload_images/4685968-f64d72bef63d318f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
遍历所有文件夹
![](https://upload-images.jianshu.io/upload_images/4685968-5b5355ca953d307f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-367aa58d6b31ed14.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7ad7c5c59cc978d3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-83bf628859b34b9e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
删除文件/文件夹
![](https://upload-images.jianshu.io/upload_images/4685968-68c39b6fddbfa75c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b13c9bc8a8d03485.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![所上传的文件](https://upload-images.jianshu.io/upload_images/4685968-40055ec3d4a0da44.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# Java 操作 HDFS 开发环境搭建
![](https://upload-images.jianshu.io/upload_images/4685968-381ac0adfb2f3c6e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c5d5adb7825168c8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0a9065275919bb12.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5ae5c80b4caabdad.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-2688c0fb206867cc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![pom 文件](https://upload-images.jianshu.io/upload_images/4685968-61d08444a162e330.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# JavaAPI 操作 HDFS文件系统
![](https://upload-images.jianshu.io/upload_images/4685968-dfc91ea23d77fc40.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![测试通过](https://upload-images.jianshu.io/upload_images/4685968-aa1edb1c01f82dd9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-94a0553c6decebc2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 测试创建文件方法
![](https://upload-images.jianshu.io/upload_images/4685968-773bcd368fec91cc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-61992182acb1e985.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 查看 HDFS 文件的内容
![](https://upload-images.jianshu.io/upload_images/4685968-d88cab0836f7a519.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8fcf854dab30dbd8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 上传文件到 HDFS
![](https://upload-images.jianshu.io/upload_images/4685968-c0c215082e54ed20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 上传文件到 HDFS(带进度条)
![](https://upload-images.jianshu.io/upload_images/4685968-63ba46e79fa25c36.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![测试通过](https://upload-images.jianshu.io/upload_images/4685968-93590fe5360afe43.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-eda4bb3c70eed096.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 下载文件到本地
![](https://upload-images.jianshu.io/upload_images/4685968-316e43d4be856a95.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![测试通过](https://upload-images.jianshu.io/upload_images/4685968-532c3463f7eb8f92.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-db7104ed5716bbfe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 查看某个目录下的所有文件
![](https://upload-images.jianshu.io/upload_images/4685968-2a781cd5918278c9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![测试通过](https://upload-images.jianshu.io/upload_images/4685968-4d7c9515a28eb7b0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b724751d6431c43a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 删除文件/文件夹
![](https://upload-images.jianshu.io/upload_images/4685968-bdc70c79da5a2397.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c379433d0c8253d4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-49f8890bacd084e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)

## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)

## [Github](https://github.com/Wasabi1234)