# 00-Spark安装及启动

-   [相关源码](https://github.com/Wasabi1234/Spark-MLlib-Tutorial)

## 1 Spark环境安装

scala语言编写，提供多种语言接口，需要JVM。官方为我们提供了Spark 编译好的版本,可以不必进行手动编译。

Spark安装不难，配置需要注意，并且不一定需要Hadoop环境。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e675cdf2de254a2b9713a44fe068c2ff~tplv-k3u1fbpfcp-zoom-1.image)

[下载](https://spark.apache.org/downloads.html)： ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/392fae7db3044c8d841d3bb6c9c51589~tplv-k3u1fbpfcp-zoom-1.image) ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ca2ed1954af84339b14485c68708e366~tplv-k3u1fbpfcp-zoom-1.image)

解压

```
 tar zxvf spark-2.4.1-bin-hadoop2.7.tgz
```

## 2 Spark配置

-   配置前尽量先阅读官方文档，避免直接从网上找配置教程
-   要为节点设置好使用的内存，否则可能导致节点利用率低
-   注意spark中IP与端口号配置，以免`UnknownHostException`

### [官网配置]()

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/84540a145b4644ffa60203e2e12509bd~tplv-k3u1fbpfcp-zoom-1.image) ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1b188b29874747aaba635c290d75597b~tplv-k3u1fbpfcp-zoom-1.image)

[应用默认配置](https://spark.apache.org/docs/latest/configuration.html#application-properties)： ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2b15d22056c4c498b44b7e28600d970~tplv-k3u1fbpfcp-zoom-1.image)

[配置文件](https://spark.apache.org/docs/latest/configuration.html#environment-variables)： ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f7d926fb08b843cbbc28e01fac50bef6~tplv-k3u1fbpfcp-zoom-1.image)

复制两份模板，开启自行配置： ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8410312e6c02437aa274cbe4c41dce9c~tplv-k3u1fbpfcp-zoom-1.image)

## 单机环境配置

本地IP： ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f39dadf22ac54855b09df2aa45cb02c5~tplv-k3u1fbpfcp-zoom-1.image)

## shell验证

```
 bin/spark-shell
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a3ecb95eefc49e493a45b117d742c1e~tplv-k3u1fbpfcp-zoom-1.image)

#### jps验证

```
 75617 Master
 79700 Jps
 75684 Worker
```

## 4 实战Wordcount

## 4.1 Wordcount简介

◆ Wordcount 词频统计,是大数据分析中最为基础的一种任务 英文分词较容易,直接分割空格即可。

◆ 实现思路 首先将文件中所有的单词提取出来,然后合并相同单词

-   实现示意图 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ced652a4cb734ceca901df3b40fdb5ca~tplv-k3u1fbpfcp-zoom-1.image)

## 项目搭建

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/80485d092f4d437b8c86ee2750f3a40e~tplv-k3u1fbpfcp-zoom-1.image) ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97c0295ac56146e499e47388f152788b~tplv-k3u1fbpfcp-zoom-1.image)

-   添加spark jar包 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/db73d86d46f14c4e9339c23fc5215e2d~tplv-k3u1fbpfcp-zoom-1.image)
-   全选jar包,先左键选中第一个,再拉到最后shift,再左键最后一个实现全选. ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c1c1810895724ffc9fc69fc5dca77e0b~tplv-k3u1fbpfcp-zoom-1.image) ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4c14c25e0d2840deadee977ca5dd2b27~tplv-k3u1fbpfcp-zoom-1.image) ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab29a4734cca47f6afe096b932b11ae5~tplv-k3u1fbpfcp-zoom-1.image)
-   新建类 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8a64ac118b1f4f7bbf50e6c7f0f9401d~tplv-k3u1fbpfcp-zoom-1.image)
-   测试文件

```
 `pwd`/`ls |grep L`
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1437b484148d4555b00a2f116f41dd21~tplv-k3u1fbpfcp-zoom-1.image)

-   编写函数 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d660824a8ca4c69a0a3f0766b963e0b~tplv-k3u1fbpfcp-zoom-1.image)
-   运行成功 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bb68364e985d42d1ac575e88dbe59515~tplv-k3u1fbpfcp-zoom-1.image)
-   打包 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/020fd00c34894d83a9157d2802934c49~tplv-k3u1fbpfcp-zoom-1.image) ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a1a75ce188f448a78f8e3558159cec7b~tplv-k3u1fbpfcp-zoom-1.image)

移除这些多余的jar包 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b5b872daf836409a9654d85c0b8639ed~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/459911cbdb4042d8b1d383ba9770261c~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/de61de2cfd724a43b64ba278a41f31b7~tplv-k3u1fbpfcp-zoom-1.image)

-   构建

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a0b8c7af920344a8bb3bc7fa28111b60~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/456a8cad1f904e1ea015046e3cb812e5~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/22dcf11442634aba9bb65b958496025a~tplv-k3u1fbpfcp-zoom-1.image)

将jar包放到spark/bin目录下 使用 Spark-submit 运行 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b55c3a4091d34796a5eccee4c61710df~tplv-k3u1fbpfcp-zoom-1.image)

[WebUI](http://localhost:8081/#running-app)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/344aa0da9f1a454f88b354b10e2290d2~tplv-k3u1fbpfcp-zoom-1.image)