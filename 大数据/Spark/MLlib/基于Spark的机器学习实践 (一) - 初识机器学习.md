# 1  导学
## 1.1 开源大数据技术
![](https://upload-images.jianshu.io/upload_images/16782311-e9980be02d765820.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.2 提高竞争力必备
![](https://upload-images.jianshu.io/upload_images/16782311-b4f7a63bb90d78b9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.3 教程规划
![](https://upload-images.jianshu.io/upload_images/16782311-f5b26a645b8b7872.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-1dbdee413480deaf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-42f1e89564a43232.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-24d3dda73057c8c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-010b73a47220a05c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-453392fed649e5a1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-f3995056caf205b1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-00d28fe35034ccd8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-cdc77c1695ff0288.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-058e2791d0bcd83b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.7  预备知识
- 了解大数据相关基础知识
- 熟悉Linux基本命令
- 熟悉Scala语言的编程方法
- 有一定的数学基础

## 1.8  环境参数
- Spark : 2.3.0
- JDK : 1.8
- IDE : IDEA

# 2 机器学习概述
## 2.1 机器学习概念
![维基定义](https://upload-images.jianshu.io/upload_images/16782311-4012eb764b327175.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 2.2 机器学习发展史
![](https://upload-images.jianshu.io/upload_images/16782311-5f334c4401046d21.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-65f33a12c24a8ccc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 2.3 机器学习(ML) & 人工智能(AI)
![](https://upload-images.jianshu.io/upload_images/16782311-9cd8e197693e1e9b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 2.4 机器学习的一般功能
◆分类
识别图像中人脸的性别是男还是女

◆聚类
发掘喜欢类型的女朋友

◆回归
预测一下股市价格

### 分类与回归的区别
◆分类的类别是离散的,回归的输出是连续的

◆实例
- 性别分类的结果只能是{男,女}集合中的一个
- 而回归输出的值可能是一定范围内的任意数字,例如股票的价格。

## 2.4 机器学习的应用
◆ 自然语言处理,数据挖掘,生物信息识别(如人脸识别) , 计算机视觉等

## 2.5 机器学习的现状
◆应用领域十分广泛
如DNA测序,证券分析

◆国家战略
多次出现在政府工作报告中

◆人才缺乏
- 新兴发展领域，门]槛相对较高.
- 人才缺口巨大

# 3 机器学习核心思想
## 3.1 机器学习的方法
- 统计机器学习(本教程的主要内容)
- BP神经网络
- 深度学习

## 3.2 机器学习的种类
◆监督学习 

◆无监督学习 (也有介于两者的半监督学习)

◆强化学习

### 3.2.1 监督学习
◆ 学习一个模型,使模型能够对任意给定的输入作出相应的预测
学习的数据形式是(X,Y)组合
![](https://upload-images.jianshu.io/upload_images/16782311-8394209b72bce80e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- X,Y的组合
![](https://upload-images.jianshu.io/upload_images/16782311-7627f02ace8e2881.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 3.2.2 无监督学习
◆学习一个模型,使用的数据是没有被标记过的,自己默默地在学习隐含的特征,寻找模型与规律
输入数据形式只有X.例如聚类
![](https://upload-images.jianshu.io/upload_images/16782311-ffeb2e484ac0a7ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-fd8da7f5dd443b4f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-2376d48dea1b7d5b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 3.2.3 强化学习
◆在没有指示的情况下,算法自己评估预测结果的好坏
从而使得计算机在没有学习过的问题上,依然具有很好的泛化能力 

## 3.3 机器学习思想的总结
◆本质思想
使用现有的数据,训练出一个模型
然后再用这样一个模型去拟合其他的数据,给位置的数据做出预测

◆人类学习的过程
老师教数学题 ,学生举一反三 ,考试成绩是学习效果的检验

## 3.4 更深入一点的数学原理
◆在数学上找到衡量预测结果与实际结果之间偏差的一个函数
![](https://upload-images.jianshu.io/upload_images/16782311-e38716def94dfe69.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-9acf38ab3683a3a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

◆通过反复(迭代)地训练模型,学习特征,使偏差极小化(注意不是最小化)
- 比如并不是一直刷题就会满分,这不靠谱~
![](https://upload-images.jianshu.io/upload_images/16782311-309d1a5bf301601b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 而是很接近
![](https://upload-images.jianshu.io/upload_images/16782311-df99c99908398477.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

◆衡量预测偏差的函数称为:损失函数( loss function )

◆机器学习是一个求解最优化问题的过程

## 3.5 训练模型应避免的两种情况
◆过拟合:模型训练过度,假设过于严格
- 判别图片是否是一片树叶:模型认为树叶一定包含锯齿
![](https://upload-images.jianshu.io/upload_images/16782311-1afa9e394130b16c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

◆欠拟合: 模型有待继续训练,拟合能力不强
![](https://upload-images.jianshu.io/upload_images/16782311-954e9e7a792c105d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 判别图片是否是一-片树叶:模型认为只要是绿色的就是树叶
![](https://upload-images.jianshu.io/upload_images/16782311-d6950d7810fafadf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 4 机器学习的框架与选型
## 4.1 机器学习常用编程语言
◆Python

◆C++

◆Scala

## 4.2 机器学习常用框架
◆ 统计学习
Spark(ml/mllib) scikit-learn Mahout

## 4.3 使用Spark的好处
◆ 技术栈统一
便于整合Spark四个模块

◆ 机器学习模型的训练是迭代过程,基于内存的计算效率更高

◆ 天然的分布式:弥补单机算力不足,具备弹性扩容的能力

◆原型即产品
Spark 可直接适用在生产环境

◆支持主流深度学习框架运行

◆ 自带矩阵计算和机器学习库,算法全面

## 4.4 机器学习项目选型要点
◆充分考虑生产环境与业务场景

◆尽量选择文档更详尽,资料更完备,社区更活跃的开源项目

◆考虑研发团队情况,力求技术栈精简统一,避免冗杂

# 参考
[wiki/机器学习](https://zh.wikipedia.org/wiki/%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0)

# X 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## [博客](https://blog.csdn.net/qq_33589510)

## [知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## [Github](https://github.com/Wasabi1234)