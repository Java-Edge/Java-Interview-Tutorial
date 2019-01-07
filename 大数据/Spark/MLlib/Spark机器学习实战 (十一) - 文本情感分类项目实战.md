# 0  [相关源码](https://github.com/Wasabi1234/Spark-MLlib-Tutorial)

将结合前述知识进行综合实战，以达到所学即所用。文本情感分类这个项目会将分类算法、文本特征提取算法等进行关联，使大家能够对Spark的具体应用有一个整体的感知与了解。

# 1  项目总体概况
 
# 2 数据集概述
- [数据集](http://www.cs.cornell.edu/people/pabo/movie-review-data/)
![](https://upload-images.jianshu.io/upload_images/16782311-d611e8c7d918a2c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 3 数据预处理
![](https://upload-images.jianshu.io/upload_images/16782311-9c4b1335a1025f15.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 4 文本特征提取
- [官方文档介绍](https://spark.apache.org/docs/latest/ml-features.html#tf-idf)
![](https://upload-images.jianshu.io/upload_images/16782311-a29a0c99a1677fbd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 提取，转换和选择特征
本节介绍了使用特征的算法，大致分为以下几组：
- 提取：从“原始”数据中提取特征
- 转换：缩放，转换或修改特征
- 选择：从中选择一个子集一组更大的特征局部敏感散列（LSH）：这类算法将特征变换的各个方面与其他算法相结合。
(TF-IDF) 是在文本挖掘中广泛使用的特征向量化方法，以反映术语对语料库中的文档的重要性。
用t表示一个术语，用d表示文档，用D表示语料库。术语频率`TF（t，d）`是术语t出现在文档d中的次数，而文档频率`DF（t，D）`是包含术语的文档数T

如果我们仅使用术语频率来衡量重要性，那么过分强调经常出现但很少提供有关文档的信息的术语非常容易，例如： “a”，“the”和“of”。
如果术语在语料库中经常出现，则表示它不包含有关特定文档的特殊信息。

- 反向文档频率是术语提供的信息量的数字度量：
![](https://upload-images.jianshu.io/upload_images/16782311-4d698292019b5466.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其中`| D |`是语料库中的文档总数。由于使用了对数，如果一个术语出现在所有文档中，其IDF值将变为0.
请注意，应用平滑术语以避免语料库外的术语除以零。 

- `TF-IDF`测量仅仅是TF和IDF的乘积
![](https://upload-images.jianshu.io/upload_images/16782311-eae3cb1ce4d99258.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

术语频率和文档频率的定义有几种变体。在MLlib中，我们将TF和IDF分开以使它们变得灵活。

#### TF：HashingTF和CountVectorizer都可用于生成术语频率向量。

`HashingTF`是一个转换器，它接受一组术语并将这些集合转换为固定长度特征向量。
在文本处理中，“一组术语”可能是一些单词。` HashingTF`利用散列技巧。通过应用散列函数将原始特征映射到索引（术语）。这里使用的哈希函数是MurmurHash 3.然后，基于映射的索引计算术语频率。这种方法避免了计算全局术语到索引映射的需要，这对于大型语料库来说可能是昂贵的，但是它遭受潜在的哈希冲突，其中不同的原始特征可能在散列之后变成相同的术语。为了减少冲突的可能性，我们可以增加目标特征维度，即哈希表的桶的数量。由于散列值的简单模数用于确定向量索引，因此建议使用2的幂作为要素维度，否则要素将不会均匀映射到向量索引。默认要素尺寸为218 = 262,144218 = 262,144。可选的二进制切换参数控制术语频率计数。设置为true时，所有非零频率计数都设置为1.这对于模拟二进制而非整数计数的离散概率模型特别有用。

CountVectorizer将文本文档转换为术语计数向量

IDF：IDF是一个Estimator，它适合数据集并生成IDFModel。 IDFModel采用特征向量（通常从HashingTF或CountVectorizer创建）并缩放每个特征。直观地说，它降低了在语料库中频繁出现的特征。

注意：spark.ml不提供文本分割工具.

在下面的代码段中，我们从一组句子开始。我们使用Tokenizer将每个句子分成单词。对于每个句子（单词包），我们使用HashingTF将句子散列为特征向量。我们使用IDF重新缩放特征向量;这通常会在使用文本作为功能时提高性能。然后我们的特征向量可以传递给学习算法。
```
import org.apache.spark.ml.feature.{HashingTF, IDF, Tokenizer}

val sentenceData = spark.createDataFrame(Seq(
  (0.0, "Hi I heard about Spark"),
  (0.0, "I wish Java could use case classes"),
  (1.0, "Logistic regression models are neat")
)).toDF("label", "sentence")

val tokenizer = new Tokenizer().setInputCol("sentence").setOutputCol("words")
val wordsData = tokenizer.transform(sentenceData)

val hashingTF = new HashingTF()
  .setInputCol("words").setOutputCol("rawFeatures").setNumFeatures(20)

val featurizedData = hashingTF.transform(wordsData)
// alternatively, CountVectorizer can also be used to get term frequency vectors

val idf = new IDF().setInputCol("rawFeatures").setOutputCol("features")
val idfModel = idf.fit(featurizedData)

val rescaledData = idfModel.transform(featurizedData)
rescaledData.select("label", "features").show()
```

# 5 训练分类模型
- 代码
![](https://upload-images.jianshu.io/upload_images/16782311-ce527c956c0e4ede.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- data.show(false)  
- println(neg.count(),data.count())//合并
![](https://upload-images.jianshu.io/upload_images/16782311-bba28deeee3d8887.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- result.show(false)
- println(s"""accuracy is $accuracy""")
![](https://upload-images.jianshu.io/upload_images/16782311-ad61913bd0f91008.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 6 Spark机器学习实践系列
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

# X 交流学习
![](https://upload-images.jianshu.io/upload_images/16782311-8d7acde57fdce062.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## [博客](https://blog.csdn.net/qq_33589510)

## [知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## [Github](https://github.com/Wasabi1234)
