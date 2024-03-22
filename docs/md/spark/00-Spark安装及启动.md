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

新建项目，命名Spark-MLlib-Tutorial。添加spark jar包：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322151840640.png)

全选jar包（先左键选中第一个，再拉到最后shift，再左键最后一个实现全选）：

 ![](https://codeselect.oss-cn-shanghai.aliyuncs.com/c1c1810895724ffc9fc69fc5dca77e0b~tplv-k3u1fbpfcp-zoom-1.png) 



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322153542613.png) 



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322153616467.png)

#### 新建WordCount类和测试文件

编写函数：

```scala
import org.apache.spark.SparkContext

/**
  * @author JavaEdge
  * @date 2019-04-09
  */
object WordCount {

  def main(args: Array[String]): Unit = {
    val sc = new SparkContext("local", "WordCount")

    val file = sc.textFile("/Volumes/doc/spark-2.4.1-bin-hadoop2.7/LICENSE")

    // 先分割成单词数组，然后合并，再与1形成KV映射
    val result = file.flatMap(_.split(" ")).map((_, 1)).reduceByKey((a, b) => a + b).sortBy(_._2)
    result.foreach(println(_))
  }
}
```

运行即可看到单词统计结果。

### 3.4 提交任务

#### ① 打包

本地调试没问题后，打包：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322153742793.png) 



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322160808861.png)

移除多余jar包：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322163346414.png)



![](https://codeselect.oss-cn-shanghai.aliyuncs.com/459911cbdb4042d8b1d383ba9770261c~tplv-k3u1fbpfcp-zoom-1.png)

仅需项目 jar 包：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240322163643739.png)

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/de61de2cfd724a43b64ba278a41f31b7~tplv-k3u1fbpfcp-zoom-1.png)

#### ② 构建

Build Artifacts：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322162433035.png)

Build：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322162456902.png)

看到生成的 jar 包了：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240322162743464.png)

jar包放到spark/bin目录，使用 Spark-submit 运行：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/b55c3a4091d34796a5eccee4c61710df~tplv-k3u1fbpfcp-zoom-1.png)

### 3.5 WebUI

根据 spark-shell 里任务输出的端口号进行访问即可，如当前任务是 http://localhost:port/#running-app ：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/344aa0da9f1a454f88b354b10e2290d2~tplv-k3u1fbpfcp-zoom-1.png)