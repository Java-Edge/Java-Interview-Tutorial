# 0  [相关源码](https://github.com/Wasabi1234/Spark-MLlib-Tutorial)

# 1 k-平均算法(k-means clustering)概述
## 1.1 回顾无监督学习
◆ 分类、回归都属于监督学习

◆ 无监督学习是不需要用户去指定标签的

◆ 而我们看到的分类、回归算法都需要用户输入的训练数据集中给定一个个明确的y值

## 1.2  k-平均算法与无监督学习
◆  k-平均算法是无监督学习的一种

◆ 它不需要人为指定一个因变量,即标签y ,而是由程序自己发现,给出类别y

◆ 除此之外，无监督算法还有PCA,GMM等

> 源于信号处理中的一种[向量量化](https://zh.wikipedia.org/wiki/%E5%90%91%E9%87%8F%E9%87%8F%E5%8C%96 "向量量化")方法，现在则更多地作为一种聚类分析方法流行于[数据挖掘](https://zh.wikipedia.org/wiki/%E6%95%B0%E6%8D%AE%E6%8C%96%E6%8E%98 "数据挖掘")领域。
*k*-平均[聚类](https://zh.wikipedia.org/wiki/%E8%81%9A%E7%B1%BB "聚类")的目的是：把n 个点（可以是样本的一次观察或一个实例）划分到*k*个聚类中，使得每个点都属于离他最近的均值（此即聚类中心）对应的聚类，以之作为聚类的标准。
这个问题将归结为一个把数据空间划分为Voronoi cells的问题。

> 这个问题在计算上是[NP困难](https://zh.wikipedia.org/wiki/NP%E5%9B%B0%E9%9A%BE "NP困难")的，不过存在高效的[启发式算法](https://zh.wikipedia.org/wiki/%E5%90%AF%E5%8F%91%E5%BC%8F%E7%AE%97%E6%B3%95 "启发式算法")。
一般情况下，都使用效率比较高的启发式算法，它们能够快速收敛于一个[局部最优](https://zh.wikipedia.org/w/index.php?title=%E5%B1%80%E9%83%A8%E6%9C%80%E4%BC%98&action=edit&redlink=1 "局部最优（页面不存在）")解。
这些算法通常类似于通过迭代优化方法处理高斯混合分布的[最大期望算法](https://zh.wikipedia.org/wiki/%E6%9C%80%E5%A4%A7%E6%9C%9F%E6%9C%9B%E7%AE%97%E6%B3%95 "最大期望算法")（EM算法）。
而且，它们都使用聚类中心来为数据建模；然而*k*-平均聚类倾向于在可比较的空间范围内寻找聚类，期望-最大化技术却允许聚类有不同的形状。

> *k*-平均聚类与[*k*-近邻](https://zh.wikipedia.org/wiki/%E6%9C%80%E8%BF%91%E9%84%B0%E5%B1%85%E6%B3%95 "最近邻居法")之间没有任何关系（后者是另一流行的机器学习技术）。

# 2 k-平均算法原理
## 2.1 k-平均算法描述
◆ 设置需要聚类的类别个数K ,以及n个训练样本,随机初始化K个聚类中心

◆ 计算每个样本与聚类中心的距离,样本选择最近的聚类中心作为其
类别;重新选择聚类中心

◆ 迭代执行上一步,直到算法收敛

- 算法图示
![](https://upload-images.jianshu.io/upload_images/16782311-d9152e9d67684601.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-c7c69b4bbcabb904.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 3 Kmeans算法实战
- [官方文档指南](https://spark.apache.org/docs/latest/ml-clustering.html#k-means)
![](https://upload-images.jianshu.io/upload_images/16782311-e7ab9ee6e73c9aa0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> k-means是最常用的聚类算法之一，它将数据点聚类成预定义数量的聚类
MLlib实现包括一个名为kmeans ||的k-means ++方法的并行变体。
KMeans作为Estimator实现，并生成KMeansModel作为基本模型。

![](https://upload-images.jianshu.io/upload_images/16782311-6a112931df18d82f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-7568aba401445eb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 代码
![](https://upload-images.jianshu.io/upload_images/16782311-f91a20e67c4c14aa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 结果
![](https://upload-images.jianshu.io/upload_images/16782311-b855d8d809ddaf4d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 4 LDA算法概述
## 4.1 LDA算法介绍
◆ LDA即文档主题生成模型 ,该算法是一种无监督学习

◆ 将主题对应聚类中心,文档作为样本,则LDA也是一种聚类算法

◆ 该算法用来将多个文档划分为K个主题 ,与Kmeans类似

> **隐含狄利克雷分布**（英语：Latent Dirichlet allocation，简称**LDA**），是一种[主题模型]，它可以将文档集中每篇文档的主题按照[概率分布]的形式给出。
同时它是一种[无监督学习]算法，在训练时不需要手工标注的训练集，需要的仅仅是文档集以及指定主题的数量k即可。
此外LDA的另一个优点则是，对于每一个主题均可找出一些词语来描述它。
LDA首先由 David M. Blei、[吴恩达](https://zh.wikipedia.org/wiki/%E5%90%B4%E6%81%A9%E8%BE%BE "吴恩达")和[迈克尔·I·乔丹](https://zh.wikipedia.org/wiki/%E8%BF%88%E5%85%8B%E5%B0%94%C2%B7%E4%B9%94%E4%B8%B9_(%E5%AD%A6%E8%80%85) "迈克尔·乔丹 (学者)")于2003年提出，目前在[文本挖掘]领域包括文本主题识别、文本分类以及文本相似度计算方面都有应用。
# 5 LDA算法原理
## 5.1 LDA算法概述
◆ LDA是一种基于概率统计的生成算法

◆ 一种常用的主题模型，可以对文档主题进行聚类,同样也可以用在其他非文档的数据中

◆ LDA算法是通过找到词、文档与主题三者之间的统计学关系进行推断的

## 5.2 LDA算法的原理
◆ 文档的条件概率可以表示为
![](https://upload-images.jianshu.io/upload_images/16782311-6203ebb1fe84cb48.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-4b885a65cf39cb87.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 6  LDA算法实践
- [官方文档指南](https://spark.apache.org/docs/latest/ml-clustering.html#latent-dirichlet-allocation-lda)
![](https://upload-images.jianshu.io/upload_images/16782311-eae00adefd2ad293.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> LDA实现为支持EMLDAOptimizer和OnlineLDAOptimizer的Estimator，并生成LDAModel作为基本模型。如果需要，专家用户可以将EMLDAOptimizer生成的LDAModel转换为DistributedLDAModel。

![](https://upload-images.jianshu.io/upload_images/16782311-70e9752c099a2269.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 代码
![](https://upload-images.jianshu.io/upload_images/16782311-1a1a52464209536c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- prediction.show()
![](https://upload-images.jianshu.io/upload_images/16782311-2bf1fe76e8c92d77.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- topics.show(false)
![](https://upload-images.jianshu.io/upload_images/16782311-a1f556e05cb243a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# Spark机器学习实践系列
- [基于Spark的机器学习实践 (一) - 初识机器学习](https://zhuanlan.zhihu.com/p/61667559)
- [基于Spark的机器学习实践 (二) - 初识MLlib](https://zhuanlan.zhihu.com/p/61784371)
- [基于Spark的机器学习实践 (三) - 实战环境搭建](https://zhuanlan.zhihu.com/p/61848834)
- [基于Spark的机器学习实践 (四) - 数据可视化](https://zhuanlan.zhihu.com/p/61868232)
- [基于Spark的机器学习实践 (六) - 基础统计模块](https://zhuanlan.zhihu.com/p/62241911)
- [基于Spark的机器学习实践 (七) -  回归算法](https://zhuanlan.zhihu.com/p/62474386)
- [基于Spark的机器学习实践 (八) -  分类算法](https://zhuanlan.zhihu.com/p/62660665)
- [基于Spark的机器学习实践 (九) -  聚类算法](https://zhuanlan.zhihu.com/p/62766320)

# X 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## [博客](https://blog.csdn.net/qq_33589510)

## [知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## [Github](https://github.com/Wasabi1234)