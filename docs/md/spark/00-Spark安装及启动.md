# 00-Spark安装及启动

-   [相关源码](https://github.com/Java-Edge/Spark-MLlib-Tutorial)

## 1 环境安装

scala编写，提供多种语言接口，需JVM。官方提供Spark编译好的版本，不必手动编译。安装不难，配置需注意且不一定需Hadoop环境。

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/e675cdf2de254a2b9713a44fe068c2ff~tplv-k3u1fbpfcp-zoom-1.png)

2024年新的首页：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322100640623.png)

[下载](https://spark.apache.org/downloads.html)： 

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/392fae7db3044c8d841d3bb6c9c51589~tplv-k3u1fbpfcp-zoom-1.png) 



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/ca2ed1954af84339b14485c68708e366~tplv-k3u1fbpfcp-zoom-1.png)

解压

```bash
 tar zxvf spark-2.4.1-bin-hadoop2.7.tgz
```

## 2 官网配置

-   配置前尽量先阅读官方文档，避免直接从网上找配置教程
-   为节点设置好使用内存，否则可能导致节点利用率低
-   注意spark中IP与端口号配置，以免`UnknownHostException`

### 2.1 [官方配置链接](https://spark.apache.org/docs/latest/configuration.html)

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322101024091.png)

### 2.2 [应用默认配置](https://spark.apache.org/docs/latest/configuration.html#application-properties)

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322101230877.png)

### 2.3 [配置文件](https://spark.apache.org/docs/latest/configuration.html#environment-variables)

环境变量一览：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322101655207.png)

去 conf 目录下复制两份模板：

- /spark-env.sh
- conf/spark-env.sh.template

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322104500294.png)

开始自行配置，得到：

- spark-env.sh
- 

### 2.4 单机环境配置

本地IP：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f39dadf22ac54855b09df2aa45cb02c5~tplv-k3u1fbpfcp-zoom-1.image)

shell验证：

```bash
$ bin/spark-shell
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a3ecb95eefc49e493a45b117d742c1e~tplv-k3u1fbpfcp-zoom-1.image)

也可能出现：

```bash
[root@etl-gateway spark-2.4.8]#  bin/spark-shell
Java HotSpot(TM) 64-Bit Server VM warning: ignoring option PermSize=128M; support was removed in 8.0
Java HotSpot(TM) 64-Bit Server VM warning: ignoring option MaxPermSize=256M; support was removed in 8.0
Setting default log level to "WARN".
To adjust logging level use sc.setLogLevel(newLevel). For SparkR, use setLogLevel(newLevel).
2024-03-22 12:54:21,259 WARN spark.SparkConf: Note that spark.local.dir will be overridden by the value set by the cluster manager (via SPARK_LOCAL_DIRS in mesos/standalone/kubernetes and LOCAL_DIRS in YARN).
[root@icv-etl-gateway spark-2.4.8]# bin/spark-shell
Java HotSpot(TM) 64-Bit Server VM warning: ignoring option PermSize=128M; support was removed in 8.0
Java HotSpot(TM) 64-Bit Server VM warning: ignoring option MaxPermSize=256M; support was removed in 8.0
Setting default log level to "WARN".
To adjust logging level use sc.setLogLevel(newLevel). For SparkR, use setLogLevel(newLevel).
2024-03-22 12:56:04,783 WARN spark.SparkConf: Note that spark.local.dir will be overridden by the value set by the cluster manager (via SPARK_LOCAL_DIRS in mesos/standalone/kubernetes and LOCAL_DIRS in YARN).
```

#### jps验证

```
 75617 Master
 79700 Jps
 75684 Worker
```

## 3 实战Wordcount

### 3.1 Wordcount简介

词频统计，大数据分析最基础的一种任务，英文分词易，直接分割空格。

实现思路：先将文件中所有的单词提取出来，然后合并相同单词。

### 3.2 实现示意图



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/ced652a4cb734ceca901df3b40fdb5ca~tplv-k3u1fbpfcp-zoom-1.png)

### 3.3 项目搭建

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/80485d092f4d437b8c86ee2750f3a40e~tplv-k3u1fbpfcp-zoom-1.png) 



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/97c0295ac56146e499e47388f152788b~tplv-k3u1fbpfcp-zoom-1.png)

添加spark jar包：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/db73d86d46f14c4e9339c23fc5215e2d~tplv-k3u1fbpfcp-zoom-1.png)

全选jar包（先左键选中第一个，再拉到最后shift，再左键最后一个实现全选）：

 ![](https://codeselect.oss-cn-shanghai.aliyuncs.com/c1c1810895724ffc9fc69fc5dca77e0b~tplv-k3u1fbpfcp-zoom-1.png) 



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/4c14c25e0d2840deadee977ca5dd2b27~tplv-k3u1fbpfcp-zoom-1.png) 



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/ab29a4734cca47f6afe096b932b11ae5~tplv-k3u1fbpfcp-zoom-1.png)

新建WordCount类和测试文件。

编写函数：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d660824a8ca4c69a0a3f0766b963e0b~tplv-k3u1fbpfcp-zoom-1.image)

运行：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bb68364e985d42d1ac575e88dbe59515~tplv-k3u1fbpfcp-zoom-1.image)

本地调试没问题后，打包：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/020fd00c34894d83a9157d2802934c49~tplv-k3u1fbpfcp-zoom-1.image) 



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a1a75ce188f448a78f8e3558159cec7b~tplv-k3u1fbpfcp-zoom-1.image)

移除多余jar包：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/b5b872daf836409a9654d85c0b8639ed~tplv-k3u1fbpfcp-zoom-1.png)



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/459911cbdb4042d8b1d383ba9770261c~tplv-k3u1fbpfcp-zoom-1.png)



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/de61de2cfd724a43b64ba278a41f31b7~tplv-k3u1fbpfcp-zoom-1.image)

构建：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/a0b8c7af920344a8bb3bc7fa28111b60~tplv-k3u1fbpfcp-zoom-1.png)



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/456a8cad1f904e1ea015046e3cb812e5~tplv-k3u1fbpfcp-zoom-1.png)



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/22dcf11442634aba9bb65b958496025a~tplv-k3u1fbpfcp-zoom-1.png)

jar包放到spark/bin目录，使用 Spark-submit 运行：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b55c3a4091d34796a5eccee4c61710df~tplv-k3u1fbpfcp-zoom-1.image)

[WebUI](http://localhost:8081/#running-app)

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/344aa0da9f1a454f88b354b10e2290d2~tplv-k3u1fbpfcp-zoom-1.png)