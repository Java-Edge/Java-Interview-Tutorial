# 0  [相关源码](https://github.com/Wasabi1234/Spark-MLlib-Tutorial)

# 1 回归分析概述
## 1.1 回归分析介绍
◆ 回归与分类类似，只不过回归的预测结果是`连续`的,而分类的预测结果是`离散`的

◆ 如此,使得很多回归与分类的模型可以经过改动而通用

◆ 因此对于回归和分类中基本原理相同或类似的模型 ,不再赘述

# 1.2 Spark中集成的回归算法
◆ Spark实现的回归算法很丰富 ,有很多模型同样可以用于分类
- [官方文档回归算法列表](https://spark.apache.org/docs/latest/ml-classification-regression.html)
![](https://upload-images.jianshu.io/upload_images/16782311-409e9504e2c21b09.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.3 回归与分类的区别与联系
![](https://upload-images.jianshu.io/upload_images/16782311-fbb81c60c8420fd1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 2 线性回归算法概述
## 2.1 线性回归简介
◆ 在回归分析中，自变量与因变量之间满足或基本满足`线性关系`,可以使用线性模型进行拟合

◆ 如回归分析中，只有一个自变量的即为一元线性回归,其自变量与因变量之间的关系可以用一条直线近似表示

◆ 同理,对于多变量的回归称为`多元线性回归`,其可以用一个平面或超平面来表示

## 2.2 使用线性回归的前提条件
◆ 自变量与因变量之间具有线性趋势,在前面介绍过[相关系数](https://zhuanlan.zhihu.com/p/62241911)


◆ 独立性
因变量之间取值相互独立,不存在关联

## 2.3 线性回归的例子
◆ 例如探究沸点与气压的关系,研究浮力与表面积之间的关系,物理上经典的探索力与加速度之间的关系

# 3 线性回归算法原理
## 3.1 回顾机器学习模型
◆ 对于统计学习来讲,机器学习模型就是一个函数表达式,其训练过程就是在不断更新这个函数式的`参数`,以便这个函数能够对未知数据产生最好的预测效果

◆ 机器学习的这个过程，与人的学习过程原理是一样的,都是先学习而后使用,故归属于人工智能领域

## 3.2 何为好的预测效果?
◆ 前面说"以便达到最好的预测效果”, 那么如何量化"好的预测效果”呢?

◆ 衡量预测效果好坏的函数称为代价函数(cost function) ,或损失函数(loss function).

◆ 例如:用一个模型预测是否会下雨,如果模型预测错误一天,则损失函数加1 
那么机器学习算法的直接目标就是想方设法调节这个函数的参数
以便能够使预测错误的天数减少,也就是降低损失函数值,同时,也提高了预测的准确率

## 3.3 再谈线性回归
◆ 线性回归是最简单的数学模型之一

◆ 线性回归的步骤是先用既有的数据,探索自变量X与因变量Y之间存在的关系
这个关系就是线性回归模型中的参数.有了它,我们就可以用这个模型对未知数据进行预测

◆ 机器学习的模型基本的训练过程亦是如此,属于`监督学习`

## 3.4 线性回归模型
◆ 线性回归的数学表达式是
![](https://upload-images.jianshu.io/upload_images/16782311-f6d23d8abc71b207.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

◆ 上式分别为一元线性回归与写成矩阵形式的线性回归模型

# 4 最小二乘法
## 4.1 何为最小二乘法
◆ 又称最小平方法,通过最小化`残差平方和`来找到最佳的函数匹配

◆ 即最小二乘法以残差的平方和作为损失函数,用于衡量模型的好坏

◆ 利用最小二乘法可以实现对`曲线`的拟合

## 4.2 最小二乘法原理
◆ 以一元线性回归为例,演示推倒过程
![](https://upload-images.jianshu.io/upload_images/16782311-157c6a8b1b45cbf3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 4.3 最小二乘法例子
![](https://upload-images.jianshu.io/upload_images/16782311-cc99ad894223a26b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 5 随机梯度下降
## 5.1 何为随机梯度下降
◆ 随机梯度下降(SGD)是机器学习中常用的一种优化方法

◆ 它是通过`不断迭代更新`的手段,来寻找某一个函数的`全局最优解`的方法

◆ 与最小二乘法类似,都是优化算法,随机梯度下降特别适合变量众多,受控系统复杂的模型,尤其在深度学习中具有十分重要的作用

## 5.2 从梯度说起
◆ 梯度是微积分中的一个算子,用来求某函数在该点处沿着哪条路径`变化最快`,通俗理解即为在哪个路径上几何形态更为“陡峭”

◆ 其数学表达式为(以二元函数为例) 
![](https://upload-images.jianshu.io/upload_images/16782311-15e2635fcceeafe9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 5.3 随机梯度下降原理
◆ 线性模型的梯度下降推倒过程
![](https://upload-images.jianshu.io/upload_images/16782311-8e1ea4f98eaceedb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/16782311-0ea411e744dbffdc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 5.4 随机梯度下降优点
◆ 随机梯度下降的"随机”体现在进行梯度计算的样本是随机抽取的n个,与直接采用全部样本相比,这样`计算量更少`

◆ 随机梯度下降善于解决大量训练样本的情况

◆ `学习率`决定了梯度下降的速度,同时,在SGD的基础上引入了”动量”的概念，从而进一步加速收敛速度的优化算法也陆续被提出

# 6 实战Spark预测房价 - 项目展示及代码概览
- 代码
![](https://upload-images.jianshu.io/upload_images/16782311-6b60ba9160b7f7df.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 数据加载及转换
- 数据集文件 - Price降序排列
![](https://upload-images.jianshu.io/upload_images/16782311-b1ad70ec843fedcc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

由于训练集有序，为提高准确率，应打乱顺序-shuffle
- 预测结果
![](https://upload-images.jianshu.io/upload_images/16782311-ede5dc9729062e09.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# 7  逻辑回归算法及原理概述
## 7.1 线性 VS 非线性
◆ 线性简言之就是两个变量之间存在一 次方函数关系

◆ 自然界中变 量间更多的关系是非线性的,绝对的线性关系相对很少

◆ 因此,在选择数学模型进行拟合的时候,很多情况使用非线性函数构造的模型可能比线性函数模型更好

## 7.2 逻辑回归
◆ 逻辑回归即logistic回归,是一种广义上的线性回归,但是与线性回归模型不同的是,其引入了非线性函数

◆ 因此,逻辑回归可以用于非线性关系的回归拟合,这一点是线性回归所不具备的

## 7.3 逻辑回归算法原理
### Sigmoid函数
◆  **逻辑函数**（英语：**logistic function**）或**逻辑曲线**（英语：**logistic curve**）是一种常见的[S函数](https://zh.wikipedia.org/wiki/S%E5%87%BD%E6%95%B0 "S函数")，它是[皮埃尔·弗朗索瓦·韦吕勒](https://zh.wikipedia.org/w/index.php?title=%E7%9A%AE%E5%9F%83%E5%B0%94%C2%B7%E5%BC%97%E6%9C%97%E7%B4%A2%E7%93%A6%C2%B7%E9%9F%A6%E5%90%95%E5%8B%92&action=edit&redlink=1)在1844或1845年在研究它与人口增长的关系时命名的。

- 一个简单的Logistic函数可用下式表示：
![](https://upload-images.jianshu.io/upload_images/16782311-68f068d3ee7de8b3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[广义Logistic曲线](https://zh.wikipedia.org/w/index.php?title=%E5%B9%BF%E4%B9%89Logistic%E6%9B%B2%E7%BA%BF&action=edit&redlink=1)可以模仿一些情况人口增长（*P*）的S形曲线。起初阶段大致是[指数增长](https://zh.wikipedia.org/wiki/%E6%8C%87%E6%95%B8%E5%A2%9E%E9%95%B7 "指数增长")；然后随着开始变得饱和，增加变慢；最后，达到成熟时增加停止。

- 标准Logistic函数
![](https://upload-images.jianshu.io/upload_images/16782311-d5884706d6fed47a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 逻辑回归原理
◆ 改进线性回归模型
![](https://upload-images.jianshu.io/upload_images/16782311-74e3ef0e7908d009.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# 8 正则化原理
## 8.1 模型是训练得越多越好吗?
◆ 我们通常理解是“千锤百炼”肯定质量过硬,而机器学习是一样的吗?
![](https://upload-images.jianshu.io/upload_images/16782311-4e45452fd7d9f9b8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 8.2 过拟合、欠拟合与刚刚好
◆ 人学习太过容易不懂得变通,过于教条,变成所谓的”书呆子”
机器学习也是一样

◆ 我们把机器学习模型训练得太过 ,陷入“教条”的状态称之为`过拟合`(over fitting)

◆ 反之,预测能力不强,宛若“智障”的模型称之为`欠拟合`(under fitting)

◆ 下面分别演示了用三个不同的数学模型对样本点进行拟合,产生的三种状态
![](https://upload-images.jianshu.io/upload_images/16782311-b7180600cdb260e9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 8.3 如何达到刚刚好呢?
◆ 对于欠拟合状态,只需要加大训练轮次,增加特征量,使用非线性模型等即可实现

◆ 而相反,过拟合却往往更加棘手 

◆ 常用的减少过拟合的方法有交叉验证法,正则化方法等

### 8.3.1 交叉验证法
◆ 所谓交叉验证法,就是在训练过程中,将`训练数据集`拆分为`训练集`和`验证集`两个部分
- 训练集专用训练模型
- 验证集只为检验模型预测能力

当二者同时达到最优,即是模型最优的时候
![](https://upload-images.jianshu.io/upload_images/16782311-533fdf4016c49fe8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 8.4 正则化原理
◆ 我们在前面的示例中可以看到,对于过拟合现象,往往都是模型过于复杂，超过实际需要

◆ 那么,能否在损失函数的计算中,对模型的复杂程度进行量化,越复杂的模型,就越对其进行”惩罚”， 以便使模型更加”中庸”

◆ 上面的思路就是正则化的思想,通过动态调节惩罚程度, 来防止模型过于复杂

◆ 令损失函数为
![](https://upload-images.jianshu.io/upload_images/16782311-c24293178f5dd34a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

◆ 则经过优化的参数为
![](https://upload-images.jianshu.io/upload_images/16782311-58184d91b1064441.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

◆ 其中
![](https://upload-images.jianshu.io/upload_images/16782311-152c616fc9110b55.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

为正则化项,反应了模型的复杂程度,在不同算法中有差异,例如可以为
![](https://upload-images.jianshu.io/upload_images/16782311-60c08327e59516a2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 9实战Spark逻辑回归
- 该算法官方归类于分类算法
![](https://upload-images.jianshu.io/upload_images/16782311-197265e0c4248e54.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 逻辑回归算法
![](https://upload-images.jianshu.io/upload_images/16782311-8efbee021f3b9a7a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 分类结果（因为分类，所以都是显示的都是1500）
![](https://upload-images.jianshu.io/upload_images/16782311-2aa13469b7dede06.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 10 保序回归算法概述
## 10.1 何为保序回归?
◆ 保序回归是用于拟合`非递减数据`(非递增也一样)的一种回归分析,同时,保序回归能够使得拟合之后的误差最小化
**保序回归**（英文：**Isotonic regression**）在[数值分析](https://zh.wikipedia.org/wiki/%E6%95%B0%E5%80%BC%E5%88%86%E6%9E%90 "数值分析")中指的是在[保序](https://zh.wikipedia.org/w/index.php?title=%E4%BF%9D%E5%BA%8F&action=edit&redlink=1 "保序（页面不存在）")约束下搜索一个[加权](https://zh.wikipedia.org/wiki/%E5%8A%A0%E6%AC%8A "加权") w 的最小二乘 y 以拟合变量 x，它是一个二次规划问题：
![](https://upload-images.jianshu.io/upload_images/16782311-151bc6c41ec70c7b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

保序回归应用于[统计](https://zh.wikipedia.org/wiki/%E7%BB%9F%E8%AE%A1 "统计")[推理](https://zh.wikipedia.org/wiki/%E6%8E%A8%E7%90%86 "推理")、[多维标度](https://zh.wikipedia.org/wiki/%E5%A4%9A%E7%BB%B4%E6%A0%87%E5%BA%A6 "多维标度")等研究中。

◆ 比较保序回归与线性回归
![](https://upload-images.jianshu.io/upload_images/16782311-9aecfbf46285f81c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 10.2 保序回归的应用
◆ 保序回归用于拟合非递减数据 ,不需要事先判断线性与否,只需数据总体的趋势是非递减的即可
例如研究某种药物的使用剂量与药效之间的关系

# 11 保序回归算法原理
## 11.1 保序回归的原理
◆ 适用保序回归的前提应是结果数据的非递减,那么,我们可以通过判断数据是否发生减少来来触发计算

◆ 算法描述
![](https://upload-images.jianshu.io/upload_images/16782311-36a736f2d3e72f38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

◆ Spark实现求解该模型的算法是pool adjacent violators算法(PAVA)

◆ 例如原序列为{1,3,2,4,6}经过保序回归为{1,3,3,3,6}

# 12 实战保序回归数据分析
![](https://upload-images.jianshu.io/upload_images/16782311-98f05c520941f7ed.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- [官网文档介绍](https://spark.apache.org/docs/latest/ml-classification-regression.html#isotonic-regression)
![](https://upload-images.jianshu.io/upload_images/16782311-3cfedd140d44e2d1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 保序回归属于回归算法族。标准保序回归是一个问题，给定一组有限的实数Y = y1，y2，...，yn表示观察到的响应，X = x1，x2，...，xn未知的响应值拟合找到一个函数最小化
![](https://upload-images.jianshu.io/upload_images/16782311-2d1a505aa68a9d72.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
相对于x1≤x2≤...≤xn的完全顺序，其中`wi`是正的权重。由此产生的函数称为保序回归。
它可被视为顺序限制约束的最小二乘问题。基本上保序回归是最适合原始数据点的单调函数。
我们实现了一个[pool adjacent violators algorithm](http://doi.org/10.1198/TECH.2010.10111)
算法，该算法使用一种并行化保序回归的方法。
训练输入是一个DataFrame，它包含三列 ： 标签，功能和权重。
此外，IsotonicRegression算法有一个称为等渗默认为true的可选参数。该论证指定等渗回归是等渗的（单调递增的）还是反单调的（单调递减的）。
训练返回`IsotonicRegressionModel`，可用于预测已知和未知特征的标签。
保序回归的结果被视为分段线性函数。因此，预测规则是：
 1  如果预测输入与训练特征完全匹配，则返回相关联的预测。如果有多个具有相同特征的预测，则返回其中一个。哪一个是未定义的（与java.util.Arrays.binarySearch相同）
2 如果预测输入低于或高于所有训练特征，则分别返回具有最低或最高特征的预测。
3 如果存在具有相同特征的多个预测，则分别返回最低或最高。
![](https://upload-images.jianshu.io/upload_images/16782311-71418e0240f64ec4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 代码
![](https://upload-images.jianshu.io/upload_images/16782311-e5a857faf062460c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 计算结果，预测效果最为惊艳！！！
![](https://upload-images.jianshu.io/upload_images/16782311-86d4efa7cfc56267.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# Spark机器学习实践系列
- [基于Spark的机器学习实践 (一) - 初识机器学习](https://zhuanlan.zhihu.com/p/61667559)
- [基于Spark的机器学习实践 (二) - 初识MLlib](https://zhuanlan.zhihu.com/p/61784371)
- [基于Spark的机器学习实践 (三) - 实战环境搭建](https://zhuanlan.zhihu.com/p/61848834)
- [基于Spark的机器学习实践 (四) - 数据可视化](https://zhuanlan.zhihu.com/p/61868232)
- [基于Spark的机器学习实践 (六) - 基础统计模块](https://zhuanlan.zhihu.com/p/62241911)
- [基于Spark的机器学习实践 (七) -  回归算法](https://zhuanlan.zhihu.com/p/62474386)

# X 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## [博客](https://blog.csdn.net/qq_33589510)

## [知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## [Github](https://github.com/Wasabi1234)