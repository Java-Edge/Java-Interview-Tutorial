# 0  [相关源码](https://github.com/Wasabi1234/Spark-MLlib-Tutorial)

将结合前述知识进行综合实战，以达到所学即所用。在推荐系统项目中，讲解了推荐系统基本原理以及实现推荐系统的架构思路，有其他相关研发经验基础的同学可以结合以往的经验，实现自己的推荐系统。

# 1 推荐系统简介
## 1.1 什么是推荐系统
![](https://upload-images.jianshu.io/upload_images/16782311-7ae6fc8d7c9c0a71.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-7c3942c83c952a06.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-82ae7b95cdd0e8d5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.2 推荐系统的作用
### 1.2.1 帮助顾客快速定位需求,节省时间
### 1.2.2 大幅度提高销售量

## 1.3 推荐系统的技术思想
### 1.3.1 推荐系统是一种机器学习的工程应用
### 1.3.2 推荐系统基于知识发现原理

## 1.4 推荐系统的工业化实现
- Apache Spark
![](https://upload-images.jianshu.io/upload_images/16782311-92487b04cfc389d6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- Apache Mahout
![](https://upload-images.jianshu.io/upload_images/16782311-e7587a76a3143a88.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- SVDFeature(C++)
![](https://upload-images.jianshu.io/upload_images/16782311-e19ae8ddaa7711fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- LibMF(C+ +,Lin Chih-Jen)
![](https://upload-images.jianshu.io/upload_images/16782311-023fdc238313ccfb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 2 推荐系统原理

![](https://upload-images.jianshu.io/upload_images/16782311-0264e854955efc56.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[可能是推荐系统最详细且简单的入门教程](https://zhuanlan.zhihu.com/p/63140175)

## 官方文档指南
### 协同过滤
协同过滤通常用于推荐系统。这些技术旨在填写用户项关联矩阵的缺失条目。 
spark.ml目前支持基于模型的协同过滤，其中用户和产品由一小组可用于预测缺失条目的潜在因素描述。
spark.ml使用交替最小二乘（ALS）算法来学习这些潜在因素。 spark.ml中的实现具有以下参数：

- numBlocks
用户和项目将被分区为多个块的数量，以便并行化计算（默认为10）。

- rank
模型中潜在因子的数量（默认为10）。

- maxIter
要运行的最大迭代次数（默认为10）。

- regParam
指定ALS中的正则化参数（默认为1.0）。

- implicitPrefs
指定是使用显式反馈ALS变体还是使用适用于隐式反馈数据的变量（默认为false，这意味着使用显式反馈）。

- alpha
适用于ALS的隐式反馈变量的参数，其控制偏好观察中的基线置信度（默认为1.0）。
nonnegative指定是否对最小二乘使用非负约束（默认为false）。

> 注意：基于DataFrame的ALS API目前仅支持用户和项ID的整数。 user和item id列支持其他数字类型，但id必须在整数值范围内。

### 显性与隐性反馈
基于矩阵分解的协同过滤的标准方法将用户项矩阵中的条目视为用户对项目给出的显式偏好，例如，给予电影评级的用户。

在许多现实世界的用例中，通常只能访问隐式反馈（例如，观看，点击，购买，喜欢，分享等）。 
spark.ml中用于处理此类数据的方法取自Collaborative Filtering for Implicit Feedback Datasets。本质上，这种方法不是试图直接对评级矩阵进行建模，而是将数据视为表示用户操作观察强度的数字（例如点击次数或某人花在观看电影上的累积持续时间）。然后，这些数字与观察到的用户偏好的置信水平相关，而不是与项目的明确评级相关。然后，该模型试图找到可用于预测用户对项目的预期偏好的潜在因素。

### 缩放正则化参数
我们通过用户在更新用户因素时产生的评级数或在更新产品因子时收到的产品评级数来缩小正则化参数regParam以解决每个最小二乘问题。 这种方法被命名为“ALS-WR”，并在“Netflix奖的大规模并行协同过滤”一文中进行了讨论。 它使regParam较少依赖于数据集的规模，因此我们可以将从采样子集中学习的最佳参数应用于完整数据集，并期望获得类似的性能。

### 冷启动策略
在使用ALS模型进行预测时，通常会遇到测试数据集中的用户和/或项目，这些用户和/或项目在训练模型期间不存在。这通常发生在两种情况中：

- 在生产中，对于没有评级历史且未对模型进行过训练的新用户或项目（这是“冷启动问题”）。
- 在交叉验证期间，数据在训练和评估集之间分割。当使用Spark的CrossValidator或TrainValidationSplit中的简单随机分割时，实际上很常见的是在评估集中遇到不在训练集中的用户和/或项目
默认情况下，当模型中不存在用户和/或项目因子时，Spark会在ALSModel.transform期间分配NaN预测。这在生产系统中很有用，因为它表示新用户或项目，因此系统可以决定使用某些后备作为预测。

但是，这在交叉验证期间是不合需要的，因为任何NaN预测值都将导致评估指标的NaN结果（例如，使用RegressionEvaluator时）。这使得模型选择不可能。

Spark允许用户将coldStartStrategy参数设置为“drop”，以便删除包含NaN值的预测的DataFrame中的任何行。然后将根据非NaN数据计算评估度量并且该评估度量将是有效的。以下示例说明了此参数的用法。

注意：目前支持的冷启动策略是“nan”（上面提到的默认行为）和“drop”。将来可能会支持进一步的战略。

在以下示例中，我们从MovieLens数据集加载评级数据，每行包含用户，电影，评级和时间戳。 然后，我们训练一个ALS模型，默认情况下，该模型假设评级是显式的（implicitPrefs为false）。 我们通过测量评级预测的均方根误差来评估推荐模型。
```
import org.apache.spark.ml.evaluation.RegressionEvaluator
import org.apache.spark.ml.recommendation.ALS

case class Rating(userId: Int, movieId: Int, rating: Float, timestamp: Long)
def parseRating(str: String): Rating = {
  val fields = str.split("::")
  assert(fields.size == 4)
  Rating(fields(0).toInt, fields(1).toInt, fields(2).toFloat, fields(3).toLong)
}

val ratings = spark.read.textFile("data/mllib/als/sample_movielens_ratings.txt")
  .map(parseRating)
  .toDF()
val Array(training, test) = ratings.randomSplit(Array(0.8, 0.2))

// Build the recommendation model using ALS on the training data
val als = new ALS()
  .setMaxIter(5)
  .setRegParam(0.01)
  .setUserCol("userId")
  .setItemCol("movieId")
  .setRatingCol("rating")
val model = als.fit(training)

// Evaluate the model by computing the RMSE on the test data
// Note we set cold start strategy to 'drop' to ensure we don't get NaN evaluation metrics
model.setColdStartStrategy("drop")
val predictions = model.transform(test)

val evaluator = new RegressionEvaluator()
  .setMetricName("rmse")
  .setLabelCol("rating")
  .setPredictionCol("prediction")
val rmse = evaluator.evaluate(predictions)
println(s"Root-mean-square error = $rmse")

// Generate top 10 movie recommendations for each user
val userRecs = model.recommendForAllUsers(10)
// Generate top 10 user recommendations for each movie
val movieRecs = model.recommendForAllItems(10)

// Generate top 10 movie recommendations for a specified set of users
val users = ratings.select(als.getUserCol).distinct().limit(3)
val userSubsetRecs = model.recommendForUserSubset(users, 10)
// Generate top 10 user recommendations for a specified set of movies
val movies = ratings.select(als.getItemCol).distinct().limit(3)
val movieSubSetRecs = model.recommendForItemSubset(movies, 10)
```

如果评级矩阵是从另一个信息源派生的（即从其他信号推断出来），您可以将implicitPrefs设置为true以获得更好的结果：
```
val als = new ALS()
  .setMaxIter(5)
  .setRegParam(0.01)
  .setImplicitPrefs(true)
  .setUserCol("userId")
  .setItemCol("movieId")
  .setRatingCol("rating")
```
# 3 推荐系统实战coding
## 3.1 分割数据集
- 数据集 tab分割
![](https://upload-images.jianshu.io/upload_images/16782311-8dd6ada2eac2d75b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 代码分割数据集
![](https://upload-images.jianshu.io/upload_images/16782311-dc21d9374bf339e7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 分割结果
![](https://upload-images.jianshu.io/upload_images/16782311-b3e6d8de4c6d4048.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 3.2 预测评分
- 预测代码
![](https://upload-images.jianshu.io/upload_images/16782311-333ad9c9ca24b8f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 预测结果
![](https://upload-images.jianshu.io/upload_images/16782311-0fc79f868629f2c7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 3.3 MovieLens数据集推荐
- 数据集推荐代码
![](https://upload-images.jianshu.io/upload_images/16782311-0f4b9de351211085.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

 MovieLens数据集由GroupLens研究组在 University of Minnesota — 明尼苏达大学（与我们使用数据集无关）中组织的。 MovieLens是电影评分的集合，有各种大小。 数据集命名为1M，10M和20M，是因为它们包含1,10和20万个评分。 最大的数据集使用约14万用户的数据，并覆盖27,000部电影。 除了评分之外，MovieLens数据还包含类似“Western”的流派信息和用户应用的标签，如“over the top”和“Arnold Schwarzenegger”。 这些流派标记和标签在构建内容向量方面是有用的。内容向量对项目的信息进行编码，例如颜色，形状，流派或真正的任何其他属性 - 可以是用于基于内容的推荐算法的任何形式。

MovieLens的数据在过去20年中已经由大学的学生以及互联网上的人们进行收集了。 MovieLens有一个[网站](https://link.zhihu.com/?target=https%3A//movielens.org/)，您可以注册，贡献自己的评分，并接收由GroupLens组实施的几个推荐者算法[这里](https://link.zhihu.com/?target=http%3A//eigentaste.berkeley.edu/)之一的推荐内容。

- 用户ID
![](https://upload-images.jianshu.io/upload_images/16782311-7c751cf392cef583.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 所推电影
![](https://upload-images.jianshu.io/upload_images/16782311-3f45650cb8d62075.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# Spark机器学习实践系列
- [基于Spark的机器学习实践 (一) - 初识机器学习](https://zhuanlan.zhihu.com/p/61667559)
- [基于Spark的机器学习实践 (二) - 初识MLlib](https://zhuanlan.zhihu.com/p/61784371)
- [基于Spark的机器学习实践 (三) - 实战环境搭建](https://zhuanlan.zhihu.com/p/61848834)
- [基于Spark的机器学习实践 (四) - 数据可视化](https://zhuanlan.zhihu.com/p/61868232)
- [基于Spark的机器学习实践 (六) - 基础统计模块](https://zhuanlan.zhihu.com/p/62241911)
- [基于Spark的机器学习实践 (七) -  回归算法](https://zhuanlan.zhihu.com/p/62474386)
- [基于Spark的机器学习实践 (八) -  分类算法](https://zhuanlan.zhihu.com/p/62660665)
- [基于Spark的机器学习实践 (九) -  聚类算法](https://zhuanlan.zhihu.com/p/62766320)
- [基于Spark的机器学习实践 (十) -   降维算法](https://zhuanlan.zhihu.com/p/62871129)
- [基于Spark的机器学习实践(十一) - 文本情感分类项目实战](https://zhuanlan.zhihu.com/p/63067995)
- [基于Spark的机器学习实践 (十二) - 推荐系统实战](https://zhuanlan.zhihu.com/p/63188144)

# X 交流学习
![](https://upload-images.jianshu.io/upload_images/16782311-8d7acde57fdce062.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## [博客](https://blog.csdn.net/qq_33589510)

## [知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## [Github](https://github.com/Wasabi1234)
