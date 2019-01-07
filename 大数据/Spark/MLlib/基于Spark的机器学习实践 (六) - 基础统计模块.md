 # 0  [相关源码](https://github.com/Wasabi1234/Spark-MLlib-Tutorial)

# 1 基础统计模块及常用统计学知识介绍
◆ Spark 的基础统计模块即MLlib组件中的Basic Statistics部分

◆ Basic Statistics主要包括Correlation 与Hypothesis testing等

◆ 其大多被封装在orq.apache spark.mllib.stat._ 中

## 1.1 基础统计学知识
### 1.1.1 常用的统计学知识
◆ 描述性统计
平均数,方差,众数,中位数...

◆ 相关性度量
spark 提供了皮尔逊和斯皮尔曼相关系数,反映变量间相关关系密切程度

◆ 假设检验
根据一定假设条件，由样本推断总体的一种统计学方法,spark提供了皮尔森卡方检测

# 2 实战统计汇总
◆ 实战的数据来源是北京市历年降水量数据

◆ 学习使用spark对数据进描述性统计

◆ 在进行机器学习模型的训练前,可以了解数据集的总体情况

## 2.1 coding实战
- 保存降水量文件
![](https://upload-images.jianshu.io/upload_images/16782311-a89ea1a0720bf8ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 字符串值
![](https://upload-images.jianshu.io/upload_images/16782311-66b17a4a2ea33630.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-b6b775052e8e9816.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 实际内容只有一行,读取到数组的是一个超长字符串,需要进行分割.
![](https://upload-images.jianshu.io/upload_images/16782311-95314cc5dec4fc8f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- [所需依赖](https://spark.apache.org/docs/latest/mllib-statistics.html#summary-statistics)

![](https://upload-images.jianshu.io/upload_images/16782311-9d9c332d9fa900bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 导入
![](https://upload-images.jianshu.io/upload_images/16782311-4f1b78c0706d915b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- val data = txt.flatMap(_.split(",")).map(value => linalg.Vectors.dense(value.toDouble))
![](https://upload-images.jianshu.io/upload_images/16782311-91438edb8e8d24ae.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- data.take(10)
![](https://upload-images.jianshu.io/upload_images/16782311-f67b08873b671562.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 统计方法
- 最大值
![](https://upload-images.jianshu.io/upload_images/16782311-b979d67b3b39edf0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 平均值
![](https://upload-images.jianshu.io/upload_images/16782311-cced0e042a1db88e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 3 学习相关系数
## 3.1 相关性度量
◆ 是一种研究变量之间线性相关程度的量

◆ 主要学习皮尔逊相关系数:

![](https://upload-images.jianshu.io/upload_images/16782311-c650b1e808b139f0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/16782311-705c8ad096960127.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
>几组(x, y)的点集，以及各个点集中x和y之间的相关系数。我们可以发现相关系数反映的是变量之间的线性关系和相关性的方向（第一排），而不是相关性的斜率（中间），也不是各种非线性关系（第三排）。请注意：中间的图中斜率为0，但相关系数是没有意义的，因为此时变量Y是0

## 3.2 实战相关系数
我们对北京市历年降水量进行相关性统计,看看年份与降水量之间的相关性有多大
![](https://upload-images.jianshu.io/upload_images/16782311-f9d2972a3e1297fd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-88114ab970eba015.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 过滤
![](https://upload-images.jianshu.io/upload_images/16782311-98c397a70d831bf9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/16782311-0515c66172fd86ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 相关系数值
![](https://upload-images.jianshu.io/upload_images/16782311-80f9f273b374ba99.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 4 学习假设检验
## 4.1 假设检验
◆ 根据一定假设条件，由样本推断总体的一种统计学方法。基本思路是先提出假设(虚无假设),使用统计学方法进行计算,根据计算结果判断是否`拒绝`假设

◆ 假设检验的统计方法有很多,如卡方检验，T检验等

◆ spark实现的是皮尔森卡方检验,它可以实现适配度检测和独立性检测

## 4.2 皮尔森卡方检验
最常用的卡方检验,可以分为适配度检验和独立性检验

◆ 适配度检验:验证观察值的次数分配与理论值是否相等

◆ 独立性检验:两个变量抽样到的观察值是否相互独立

## 4.3 实战 : 判断性别与左撇子是否存在关系
![](https://upload-images.jianshu.io/upload_images/16782311-a531b613d399495e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 导入数据
![](https://upload-images.jianshu.io/upload_images/16782311-0655a04dea30e153.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 计算
![](https://upload-images.jianshu.io/upload_images/16782311-d2c6ce572c7ab032.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

否定了假设检验,所以性别与左撇子是有关的!

# Spark机器学习实践系列
- [基于Spark的机器学习实践 (一) - 初识机器学习](https://zhuanlan.zhihu.com/p/61667559)
- [基于Spark的机器学习实践 (二) - 初识MLlib](https://zhuanlan.zhihu.com/p/61784371)
- [基于Spark的机器学习实践 (三) - 实战环境搭建](https://zhuanlan.zhihu.com/p/61848834)
- [基于Spark的机器学习实践 (四) - 数据可视化
](https://zhuanlan.zhihu.com/p/61868232)
- [基于Spark的机器学习实践 (六) - 基础统计模块](https://zhuanlan.zhihu.com/p/62241911)

# X 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## [博客](https://blog.csdn.net/qq_33589510)

## [知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## [Github](https://github.com/Wasabi1234)