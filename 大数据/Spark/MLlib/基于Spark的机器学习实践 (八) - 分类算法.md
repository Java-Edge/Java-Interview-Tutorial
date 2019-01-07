# 0  [相关源码](https://github.com/Wasabi1234/Spark-MLlib-Tutorial)
# 1 朴素贝叶斯算法及原理概述
## 1.1 朴素贝叶斯简介
◆ 朴素贝叶斯算法是基于`贝叶斯定理`和`特征条件独立假设`的一种`分类方法`

◆ 朴素贝叶斯算法是一种基于联合概率分布的统计学习方法

◆ 朴素贝叶斯算法实现简单,效果良好,是一种常用的机器学习方法

## 1.2 贝叶斯定理
◆ 朴素贝叶斯算法的一个基础是贝叶斯定理

**贝叶斯定理**（英语：Bayes' theorem）是[概率论]中的一个[定理]，描述在已知一些条件下，某事件的发生概率。
比如，如果已知某癌症与寿命有关，使用贝叶斯定理则可以通过得知某人年龄，来更加准确地计算出他罹患癌症的概率。

通常，事件A在事件B已发生的条件下发生的概率，与事件B在事件A已发生的条件下发生的概率是不一样的。
然而，这两者是有确定的关系的，贝叶斯定理就是这种关系的陈述。
贝叶斯公式的一个用途，即通过已知的三个概率而推出第四个概率。贝叶斯定理跟[随机变量]的[条件概率]以及[边缘概率分布]有关。

作为一个普遍的原理，贝叶斯定理对于所有概率的解释是有效的。这一定理的主要应用为[贝叶斯推断]，是[推论统计学]中的一种推断法。这一定理名称来自于[托马斯·贝叶斯]。

### 1.2.1 陈述
贝叶斯定理是关于随机事件A和B的[条件概率](https://zh.wikipedia.org/wiki/%E6%9D%A1%E4%BB%B6%E6%A6%82%E7%8E%87 "条件概率")的一则定理。
![](https://upload-images.jianshu.io/upload_images/16782311-3d113674c459e2af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其中P(A|B)是指在事件B发生的情况下事件A发生的概率。

在贝叶斯定理中，每个名词都有约定俗成的名称：

*   P(*A*|*B*)是已知B发生后A的[条件概率](https://zh.wikipedia.org/wiki/%E6%9D%A1%E4%BB%B6%E6%A6%82%E7%8E%87 "条件概率")，也由于得自B的取值而被称作A的[后验概率](https://zh.wikipedia.org/wiki/%E5%90%8E%E9%AA%8C%E6%A6%82%E7%8E%87 "后验概率")。
*   P(*A*)是A的[先验概率](https://zh.wikipedia.org/wiki/%E5%85%88%E9%AA%8C%E6%A6%82%E7%8E%87 "先验概率")（或[边缘概率](https://zh.wikipedia.org/wiki/%E8%BE%B9%E7%BC%98%E6%A6%82%E7%8E%87 "边缘概率")）。之所以称为"先验"是因为它不考虑任何B方面的因素。
*   P(*B*|*A*)是已知A发生后B的条件概率，也由于得自A的取值而被称作B的[后验概率](https://zh.wikipedia.org/wiki/%E5%90%8E%E9%AA%8C%E6%A6%82%E7%8E%87 "后验概率")。
*   P(*B*)是B的[先验概率](https://zh.wikipedia.org/wiki/%E5%85%88%E9%AA%8C%E6%A6%82%E7%8E%87 "先验概率")或边缘概率。

按这些术语，贝叶斯定理可表述为：

后验概率 = (似然性*先验概率)/标准化常量
也就是说，后验概率与先验概率和相似度的乘积成正比。

另外，比例P(B|A)/P(B)也有时被称作标准似然度（standardised likelihood），贝叶斯定理可表述为：

后验概率 = 标准似然度*先验概率

### 1.2.2 二中择一的形式
- 贝氏定理通常可以再写成下面的形式
![](https://upload-images.jianshu.io/upload_images/16782311-cc3c8df917af9e59.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 其中*A*<sup>*C*</sup>是A的[补集](https://zh.wikipedia.org/wiki/%E8%A3%9C%E9%9B%86 "补集")（即非A）。故上式亦可写成：
![](https://upload-images.jianshu.io/upload_images/16782311-cab0211eae779780.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 在更一般化的情况，假设{Ai}是事件集合里的部分集合，对于任意的Ai，贝氏定理可用下式表示：
![](https://upload-images.jianshu.io/upload_images/16782311-6be00c0ae29c78d2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.3 朴素贝叶斯算法
◆ 朴素叶斯算法的基本假设是`条件独立性`,这是一一个较强的前提条件,因而朴素贝叶斯算法易于实现,但是分类性能可能不会很高

◆ 朴素贝叶斯算法要求输入变量是`条件独立`的,但是如果它们之间存在概率依存关系,就超出该算法范畴,属于`贝叶斯网络`

◆ 首先计算先验概率及条件概率
![](https://upload-images.jianshu.io/upload_images/16782311-6f2f91e23ad4dc0f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其中![](https://upload-images.jianshu.io/upload_images/16782311-28c5c55240f6a1f6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
代表第j个特征可能取第I个值

◆ 对于每一个给定的特征向量X ,在不同类别中出现的概率为
![](https://upload-images.jianshu.io/upload_images/16782311-6d09bbd4bc4a2608.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

◆ 那么,最终预测结果y自然是其中概率最大的那个:
![](https://upload-images.jianshu.io/upload_images/16782311-2b724b4c887de02d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.4 朴素贝叶斯算法示例
![](https://upload-images.jianshu.io/upload_images/16782311-abd352c00f742155.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/16782311-c5f0bae1df4874ee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 那么某个特征`[1,B]T`应属于哪一类呢?
![](https://upload-images.jianshu.io/upload_images/16782311-b391138c46aafbfc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 2 实战朴素贝叶斯分类
![](https://upload-images.jianshu.io/upload_images/16782311-dd4cb9a7737b9695.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- [官方文档指南](https://spark.apache.org/docs/latest/ml-classification-regression.html#naive-bayes)
![](https://upload-images.jianshu.io/upload_images/16782311-e46ccb328ad54732.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 朴素贝叶斯分类器是一类简单的概率多类分类器，它基于应用贝叶斯定理，在每对特征之间具有强（天真）独立假设。
朴素贝叶斯可以非常有效地训练。通过对训练数据的单次传递，它计算给定每个标签的每个特征的条件概率分布。
对于预测，它应用贝叶斯定理来计算给定观察的每个标签的条件概率分布。
MLlib支持多项式朴素贝叶斯和伯努利朴素贝叶斯。
输入数据：这些模型通常用于文档分类。在该上下文中，每个观察是一个文档，每个特征代表一个术语。特征值是术语的频率（在多项式朴素贝叶斯中）或零或一个，表示该术语是否在文档中找到（在伯努利朴素贝叶斯中）。要素值必须为非负值。使用可选参数“multinomial”或“bernoulli”选择模型类型，默认为“multinomial”。对于文档分类，输入特征向量通常应该是稀疏向量。由于训练数据仅使用一次，因此不必对其进行缓存。
通过设置参数λ（默认为1.0）可以使用加法平滑。

![](https://upload-images.jianshu.io/upload_images/16782311-103eef5779079e8e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- file.show
![](https://upload-images.jianshu.io/upload_images/16782311-854f4919dc1637d2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-6c3d92730814df28.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 打乱顺序 - data.show
![](https://upload-images.jianshu.io/upload_images/16782311-6369639b8d04f28c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-95ea9d2c6412705b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 在特征标签形成vector数组
![](https://upload-images.jianshu.io/upload_images/16782311-a599f65fb182139d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-5efc06ac622549e1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 训练集预测
![](https://upload-images.jianshu.io/upload_images/16782311-5a8405782559058a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-34f3dc456762e362.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
都是正确的,完美预测!

[分类数据]是[机器学习]中的一项常见任务。
假设某些给定的数据点各自属于两个类之一，而目标是确定新数据点将在哪个类中。
对于支持向量机来说，数据点被视为

![](https://upload-images.jianshu.io/upload_images/16782311-6ba96aeafa5ca63b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

维向量，而我们想知道是否可以用

![](https://upload-images.jianshu.io/upload_images/16782311-6170d080cc67b4bb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

维[超平面]来分开这些点。这就是所谓的[线性分类器]。
可能有许多超平面可以把数据分类。最佳超平面的一个合理选择是以最大间隔把两个类分开的超平面。因此，我们要选择能够让到每边最近的数据点的距离最大化的超平面。如果存在这样的超平面，则称为最大间隔超平面，而其定义的线性分类器被称为最大[间隔分类器]，或者叫做最佳稳定性[感知器]

# 3 支持向量机算法
## 3.1 简介
◆ 支持向量机(SVM)是一种用来分类的算法,当然,在这基础上进行改进,也可以进行回归分析(SVR)

◆ SVM是最优秀的分类算法之一，即便是在如今深度学习盛行的时代,仍然具有很广泛的应用

◆ SVM被设计成一种二分类的算法， 当然,也有人提出了使用SVM进行多分类的方法,但是SVM依然主要被用在`二分类`中

在[机器学习]中，**支持向量机**（英语：**support vector machine**，常简称为**SVM**，又名**支持向量网络**）是在[分类]与[回归分析]中分析数据的[监督式学习](https://zh.wikipedia.org/wiki/%E7%9B%A3%E7%9D%A3%E5%BC%8F%E5%AD%B8%E7%BF%92 "监督式学习")模型与相关的学习[算法](https://zh.wikipedia.org/wiki/%E7%AE%97%E6%B3%95 "算法")。

给定一组训练实例，每个训练实例被标记为属于两个类别中的一个或另一个，SVM训练算法创建一个将新的实例分配给两个类别之一的模型，使其成为非概率[二元][线性分类器]。

SVM模型是将实例表示为空间中的点，这样映射就使得单独类别的实例被尽可能宽的明显的间隔分开。然后，将新的实例映射到同一空间，并基于它们落在间隔的哪一侧来预测所属类别。

除了进行线性分类之外，SVM还可以使用所谓的[核技巧]有效地进行非线性分类，将其输入隐式映射到高维特征空间中。

当数据未被标记时，不能进行监督式学习，需要用[非监督式学习]，它会尝试找出数据到簇的自然聚类，并将新数据映射到这些已形成的簇。将支持向量机改进的聚类算法被称为**支持向量聚类**，当数据未被标记或者仅一些数据被标记时，支持向量聚类经常在工业应用中用作分类步骤的预处理。

> H1 不能把类别分开。H2 可以，但只有很小的间隔。H3 以最大间隔将它们分开。![](https://upload-images.jianshu.io/upload_images/16782311-a42259bccfbb16f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## 3.2 简单的分类
◆ 可能大家认为最简单的一种分类方法大概就是划分`"阈值"`了

◆ 例如判断一一个人是否是秃头:头顶区域头发数量小于100根则是秃头

◆ 而SVM也是遵循这个道理,只不过它的"阈值”寻找过程更复杂,也更科学

## 3.3 SVM的基本思想
◆ SVM的主要思想是寻找能够将数据进行分类的平面或超平面,在平面上的则是A类,在平面下的则是B类, 因此，SVM是一种二分类算法

◆ 因此，这个“阈值”更贴切地说应该称为“边界”, 而这个"边界"恰恰就是通过向量来表示的,故而这个"边界"我们就称为支持向量
![](https://upload-images.jianshu.io/upload_images/16782311-b540eb7f8e9d2c98.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-85ca2238f464ebcf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 3.4 SVM处理非线性问题
◆ 在很多情况下,数据集并不是线性可分的,譬如:
![](https://upload-images.jianshu.io/upload_images/16782311-03e7e1c1c88cc563.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 3.5 SVM的核函数
◆ SVM虽然只能进行线性分类, 但是,可以通过引入`核函数`,将非线性的数据,转化为另一个空间中的线性可分数据,这叫做支持向量机的核技巧,可以认为是支持向量机的精髓之一
![](https://upload-images.jianshu.io/upload_images/16782311-92d12f08b9136bef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


##3.6 SVM的类别
◆ 基于硬间隔最大化的线性可分 支持向量机

◆ 基于软间隔最大化的线性支持向量机

◆ 使用核函数的非线性支持向量机

## 3.7 线性支持向量机的数学原理
![](https://upload-images.jianshu.io/upload_images/16782311-92f9e4731aa9a181.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-2ccc43b139838f0c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-b8e74962ce52186e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-e33cd39008d92d88.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



# 4 实战SVM分类
- [官方文档指南](https://spark.apache.org/docs/latest/ml-classification-regression.html#linear-support-vector-machine)
![](https://upload-images.jianshu.io/upload_images/16782311-72aed5e3f1d2d446.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 支持向量机在高维或无限维空间中构造超平面或超平面集，其可用于分类，回归或其他任务。 直观地，通过与任何类的最近的训练数据点具有最大距离的超平面（所谓的功能边界）实现良好的分离，因为通常边缘越大，分类器的泛化误差越低。 
Spark ML中的LinearSVC支持使用线性SVM进行二进制分类。 在内部，它使用OWLQN优化器优化铰链损耗
![](https://upload-images.jianshu.io/upload_images/16782311-dd8913e4633bd2f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 代码
![](https://upload-images.jianshu.io/upload_images/16782311-870ba3be8ce64442.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- iris数据集特征三列,所以报错
![](https://upload-images.jianshu.io/upload_images/16782311-986173aed5f3dc02.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 只是用2列
![](https://upload-images.jianshu.io/upload_images/16782311-4f1f6188be0f7b8b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 计算结果
![](https://upload-images.jianshu.io/upload_images/16782311-89801ea244ed75f0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 5 决策树算法
## 5.1 决策树介绍
◆ 决策树因其进行决策判断的结构与数据结构中的树相同,故而得名

◆ 决策树算法既可以实现分类,也可以实现回归, 一-般用作分类的比较多
例如if-then就是一种简单的决策树

◆ 决策树的解法有很多
例如ID3,C4.5等,其使用了信息论中熵的概念

## 5.2 决策树的缺点
◆ 对输入特征要求较高,很多情况下需要作预处理
◆ 识别类别过多时,发生错误的概率较大

## 5.3 决策树示例
◆ 如图展示了一个能否批准贷款的决策树
![](https://upload-images.jianshu.io/upload_images/16782311-b71e54202d120a67.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 5.4 决策树的特征选择
◆ 输入变量的特征有很多,选择特征作为分类判断的依据之一便是能够具有很好的区分度

◆ 那么也就是说,选择出的变量能够更具有代表性,以至于区分程度更高,作为决策树的判断节点

##5.5 信息增益
◆ 定义随机变量X的`信息熵`
![](https://upload-images.jianshu.io/upload_images/16782311-cc6ab37d37e89ecc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

◆ 已知随机变量X ,对于变量Y的不确定性,使用`条件熵`来衡量
![](https://upload-images.jianshu.io/upload_images/16782311-fe3eb0ecf897b3dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

◆ 当得知X而使得Y的不确定性减少的程度即为`信息增益` 
![](https://upload-images.jianshu.io/upload_images/16782311-8909b5eaa1018811.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 5.6 决策树生成 - ID3算法
◆ ID3算法是一种决策树生成算法,其对于决策树各个节点应用信息增益准则从而选取特征,在树的每一层进行`递归`,从而构建整棵树

◆ 从根节点开始 ,在每层选择信息增益最大的作为该节点的判断特征

◆ 对所有节点进行相同操作,直到没有特征选择或者所有特征的信息增益均很小为止

## 5.7 决策树的剪枝
◆ 决策树是针对训练集进行递归生成的,这样对于训练集效果自然非常好,但是对未知数据的预测结果可能并不会很好

◆ 即使用决策树生成算法生成的决策树模型过于复杂,对未知数据的泛化能力下降,即出现了`过拟合`现象

◆ 过拟合是因为树的结构过于复杂,将树的结构精简,就能够减轻过拟合现象,即决策树的剪枝

◆ 决策树从叶节点开始递归地向根节点剪枝

◆ 判断一个节点能否被减掉,只需比较修剪后与修剪前的损失函数值大小即可

◆ 如果在修剪之后,损失函数值小于等于原先的损失函数值,则将该父节点变为新的叶节点即可

##5.8 CART算法
◆ CART即分类与回归决策树,其实是一棵二叉树,根据判断结果划分为”是否”二分类

◆ 决策树生成 
基于训练集生成 一个尽可能大的决策树

◆ 决策树剪枝
使用验证集对生成的决策树进行剪枝,以便使损失函数最小化

# 6 实战基于决策树的分类--案例1
- [官方文档指南](https://spark.apache.org/docs/latest/ml-classification-regression.html#decision-tree-classifier)
![](https://upload-images.jianshu.io/upload_images/16782311-e631ea61c1f3b2de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
> 决策树是一种流行的分类和回归方法。有关spark.ml实现的更多信息可以在决策树的部分中找到。
示例
以下示例以LibSVM格式加载数据集，将其拆分为训练和测试集，在第一个数据集上训练，然后评估保持测试集。我们使用两个特征变换器来准备数据;这些帮助标记和分类特征的索引类别，向决策树算法可识别的DataFrame添加元数据。
```
import org.apache.spark.ml.Pipeline
import org.apache.spark.ml.classification.DecisionTreeClassificationModel
import org.apache.spark.ml.classification.DecisionTreeClassifier
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator
import org.apache.spark.ml.feature.{IndexToString, StringIndexer, VectorIndexer}

// Load the data stored in LIBSVM format as a DataFrame.
val data = spark.read.format("libsvm").load("data/mllib/sample_libsvm_data.txt")

// Index labels, adding metadata to the label column.
// Fit on whole dataset to include all labels in index.
val labelIndexer = new StringIndexer()
  .setInputCol("label")
  .setOutputCol("indexedLabel")
  .fit(data)
// Automatically identify categorical features, and index them.
val featureIndexer = new VectorIndexer()
  .setInputCol("features")
  .setOutputCol("indexedFeatures")
  .setMaxCategories(4) // features with > 4 distinct values are treated as continuous.
  .fit(data)

// Split the data into training and test sets (30% held out for testing).
val Array(trainingData, testData) = data.randomSplit(Array(0.7, 0.3))

// Train a DecisionTree model.
val dt = new DecisionTreeClassifier()
  .setLabelCol("indexedLabel")
  .setFeaturesCol("indexedFeatures")

// Convert indexed labels back to original labels.
val labelConverter = new IndexToString()
  .setInputCol("prediction")
  .setOutputCol("predictedLabel")
  .setLabels(labelIndexer.labels)

// Chain indexers and tree in a Pipeline.
val pipeline = new Pipeline()
  .setStages(Array(labelIndexer, featureIndexer, dt, labelConverter))

// Train model. This also runs the indexers.
val model = pipeline.fit(trainingData)

// Make predictions.
val predictions = model.transform(testData)

// Select example rows to display.
predictions.select("predictedLabel", "label", "features").show(5)

// Select (prediction, true label) and compute test error.
val evaluator = new MulticlassClassificationEvaluator()
  .setLabelCol("indexedLabel")
  .setPredictionCol("prediction")
  .setMetricName("accuracy")
val accuracy = evaluator.evaluate(predictions)
println(s"Test Error = ${(1.0 - accuracy)}")

val treeModel = model.stages(2).asInstanceOf[DecisionTreeClassificationModel]
println(s"Learned classification tree model:\n ${treeModel.toDebugString}")
```

这里要详解管道概念
## 6.1 [ML Pipeline](https://spark.apache.org/docs/latest/ml-pipeline.html#ml-pipelines)
Spark ML Pipeline 的出现，是受到了 [scikit-learn](http://scikit-learn.org/stable/) 项目的启发，并且总结了 MLlib 在处理复杂机器学习问题上的弊端，旨在向用户提供基于 DataFrame 之上的更加高层次的 API 库，以更加方便的构建复杂的机器学习工作流式应用。一个 Pipeline 在结构上会包含一个或多个 PipelineStage，每一个 PipelineStage 都会完成一个任务，如数据集处理转化，模型训练，参数设置或数据预测等，这样的 PipelineStage 在 ML 里按照处理问题类型的不同都有相应的定义和实现。接下来，我们先来了解几个重要概念。

在本节中，我们将介绍ML管道的概念。 ML Pipelines提供了一组基于DataFrame构建的统一的高级API，可帮助用户创建和调整实用的机器学习流程。

### 6.1.1 [主要概念(Main concepts in Pipelines)](https://spark.apache.org/docs/latest/ml-pipeline.html#main-concepts-in-pipelines)

#### 6.1.1.1 DataFrame
- 此ML API使用Spark SQL中的DataFrame作为ML数据集，它可以包含各种数据类型.
例如，DataFrame可以具有存储文本，特征向量，真实标签和预测的不同列.

它较之 RDD，包含了 schema 信息，更类似传统数据库中的二维表格。它被 ML Pipeline 用来存储源数据。

DataFrame 可以被用来保存各种类型的数据，如我们可以把特征向量存储在 DataFrame 的一列中，这样用起来是非常方便的。

机器学习可以应用于各种数据类型，例如矢量，文本，图像和结构化数据。 此API采用Spark SQL的DataFrame以支持各种数据类型。

DataFrame支持许多基本和结构化类型, 除了Spark SQL指南中列出的类型之外，DataFrame还可以使用ML Vector类型。

可以从常规RDD隐式或显式创建DataFrame

#### 6.1.1.2  Transformer
- Transformer是一种可以将一个DataFrame转换为另一个DataFrame的算法.
例如，ML模型是变换器，其将具有特征的DataFrame转换为具有预测的DataFrame.

Transformer 中文可以被翻译成转换器，是一个 PipelineStage，实现上也是继承自 PipelineStage 类
![](https://upload-images.jianshu.io/upload_images/16782311-912a49be2e82f225.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
主要是用来把 一个 DataFrame 转换成另一个 DataFrame，比如一个模型就是一个 Transformer，因为它可以把 一个不包含预测标签的测试数据集 DataFrame 打上标签转化成另一个包含预测标签的 DataFrame，显然这样的结果集可以被用来做分析结果的可视化.

#### 6.1.1.3 Estimator
- Estimator是一种算法，可以适应DataFrame以生成Transformer.
例如，学习算法是Estimator，其在DataFrame上训练并产生模型。

Estimator 中文可以被翻译成评估器或适配器，在 Pipeline 里通常是被用来操作 DataFrame 数据并生产一个 Transformer，如一个随机森林算法就是一个 Estimator，因为它可以通过训练特征数据而得到一个随机森林模型。实现上 Estimator 也是继承自 PipelineStage 类
![](https://upload-images.jianshu.io/upload_images/16782311-12ea8fd76035816f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


####  6.1.1.4 Parameter
Parameter 被用来设置 Transformer 或者 Estimator 的参数。

要构建一个 Pipeline，首先我们需要定义 Pipeline 中的各个 PipelineStage，如指标提取和转换模型训练等。有了这些处理特定问题的 Transformer 和 Estimator，我们就可以按照具体的处理逻辑来有序的组织 PipelineStages 并创建一个 Pipeline，如 val pipeline = new Pipeline().setStages(Array(stage1,stage2,stage3,…))。然后就可以把训练数据集作为入参并调用 Pipelin 实例的 fit 方法来开始以流的方式来处理源训练数据，这个调用会返回一个 PipelineModel 类实例，进而被用来预测测试数据的标签，它是一个 Transformer。

#### 6.1.1.5 Pipeline
管道：管道将多个Transformers和Estimators链接在一起以指定ML工作流程。

### 6.1.2  [How It Works](https://spark.apache.org/docs/latest/ml-pipeline.html#how-it-works)
管道被指定为阶段序列，并且每个阶段是变换器或估计器。 这些阶段按顺序运行，输入DataFrame在通过每个阶段时进行转换。 对于Transformer阶段，在DataFrame上调用transform（）方法。 对于Estimator阶段，调用fit（）方法以生成Transformer（它成为PipelineModel或拟合管道的一部分），并在DataFrame上调用Transformer的transform（）方法。

- 我们为简单的文本文档工作流说明了这一点。 下图是管道的培训时间使用情况。
![](https://upload-images.jianshu.io/upload_images/16782311-67fe51734c481647.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

上图中，顶行表示具有三个阶段的管道。前两个（Tokenizer和HashingTF）是变形金刚（蓝色），第三个（LogisticRegression）是Estimator（红色）。底行表示流经管道的数据，其中柱面表示DataFrame。在原始DataFrame上调用Pipeline.fit（）方法，该原始DataFrame具有原始文本文档和标签。 Tokenizer.transform（）方法将原始文本文档拆分为单词，向DataFrame添加一个带有单词的新列。 HashingTF.transform（）方法将单词列转换为要素向量，将包含这些向量的新列添加到DataFrame。现在，由于LogisticRegression是一个Estimator，因此Pipeline首先调用LogisticRegression.fit（）来生成LogisticRegressionModel。如果Pipeline有更多的Estimators，它会在将DataFrame传递给下一个阶段之前在DataFrame上调用LogisticRegressionModel的transform（）方法。

管道是估算器。因此，在Pipeline的fit（）方法运行之后，它会生成一个PipelineModel，它是一个Transformer。这个PipelineModel在测试时使用;下图说明了这种用法。
![](https://upload-images.jianshu.io/upload_images/16782311-23b4f23464f5b5dd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在上图中，PipelineModel具有与原始Pipeline相同的阶段数，但原始Pipeline中的所有Estimators都变为Transformers。 当在测试数据集上调用PipelineModel的transform（）方法时，数据将按顺序通过拟合的管道传递。 每个阶段的transform（）方法都会更新数据集并将其传递给下一个阶段。

Pipelines和PipelineModel有助于确保培训和测试数据经过相同的功能处理步骤。

- 代码
![](https://upload-images.jianshu.io/upload_images/16782311-69722d96c69b2c18.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 结果
![](https://upload-images.jianshu.io/upload_images/16782311-08f15887a2a18223.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 7 实战基于决策树的分类--案例2
- [分布式身高 - 体重散点图](https://echarts.baidu.com/examples/editor.html?c=scatter-weight)
![](https://upload-images.jianshu.io/upload_images/16782311-94df6fda48b89ac8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 复制数据得到女生数据集
![](https://upload-images.jianshu.io/upload_images/16782311-c701a225273d6c32.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 复制数据得到男生数据集
![](https://upload-images.jianshu.io/upload_images/16782311-1d56004516a9b1a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 代码
![](https://upload-images.jianshu.io/upload_images/16782311-44696b414c611959.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 预测结果
![](https://upload-images.jianshu.io/upload_images/16782311-4246b8f713cb27b2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 参考
[贝叶斯定理](https://zh.wikipedia.org/wiki/%E8%B4%9D%E5%8F%B6%E6%96%AF%E5%AE%9A%E7%90%86)
[使用 ML Pipeline 构建机器学习工作流](https://www.ibm.com/developerworks/cn/opensource/os-cn-spark-practice5/index.html)

# Spark机器学习实践系列
- [基于Spark的机器学习实践 (一) - 初识机器学习](https://zhuanlan.zhihu.com/p/61667559)
- [基于Spark的机器学习实践 (二) - 初识MLlib](https://zhuanlan.zhihu.com/p/61784371)
- [基于Spark的机器学习实践 (三) - 实战环境搭建](https://zhuanlan.zhihu.com/p/61848834)
- [基于Spark的机器学习实践 (四) - 数据可视化](https://zhuanlan.zhihu.com/p/61868232)
- [基于Spark的机器学习实践 (六) - 基础统计模块](https://zhuanlan.zhihu.com/p/62241911)
- [基于Spark的机器学习实践 (七) -  回归算法](https://zhuanlan.zhihu.com/p/62474386)
- [基于Spark的机器学习实践 (八) -  分类算法](https://zhuanlan.zhihu.com/p/62660665)


# X 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## [博客](https://blog.csdn.net/qq_33589510)

## [知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## [Github](https://github.com/Wasabi1234)