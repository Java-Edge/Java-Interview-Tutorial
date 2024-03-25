# 00-为啥要学习Spark？

## 1 你将获得

- 快速构建 Spark 核心知识体系
- Spark 三大计算场景案例实操
- 逐句注释的保姆级代码讲解
- 在故事中搞懂 Spark 开发实战技巧

## 2 专栏介绍

Spark 还有那么火吗？会不会已经过时？若对此感到困惑，大可不必。经十多年发展，Spark 已由当初“大数据新秀”成长为数据应用领域的中流砥柱，早已成为各大头部互联网公司的标配。如字节、美团、Netflix 等公司基于 Spark 构建的应用，在为公司旗下的核心产品提供服务。

即对于数据应用领域的任何一名工程师，Spark 开发都是必备技能。

虽然 Spark 好用，而且是大数据开发必修课，但入门也面临难题：

- 学习资料多杂，自己根本梳理不出脉络，更甭提构建结构化知识体系
- 学习 Spark，一定要先学 Scala？新学一门编程语言，真不是件容易的事儿。
- Spark 开发算子太多，记不住，来了新业务需求，又不知道从何下手
- ……

咋解决这些问题，顺利打开 Spark 应用开发大门呢？

结合多年学习、应用和实战 Spark 的丰富经验，梳理了一套零基础入门 Spark 的“三步走”方法论：

- **熟悉 Spark 开发 API 与常用算子**
- **吃透 Spark 核心原理**
- **玩转 Spark 计算子框架**

助你零基础上手 Spark 。这“三步走”方法论再配合 4 个不同场景的小项目，吴磊老师会从基本原理到项目落地，深入浅出玩转 Spark。

## 3 专栏模块设计

结合 Spark 最常用的计算子框架，专栏设计为 4 个模块，它与“三步走”方法论的对应关系：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240321175835357.png)

### 3.1 基础知识模块

从“Word Count”开始，详解 RDD 常用算子含义、用法与适用场景及 RDD 编程模型、调度系统、Shuffle 管理、内存管理等核心原理，打下坚实理论基础。

###  3.2 Spark SQL 模块

五大知识板块，掌握大数据处理技术Spark SQL，每个大数据工程师都不应错过的必备大数据开发技能！

熟悉 Spark SQL 开发 API，讲解 Spark SQL 的核心原理与优化过程，以及 Spark SQL 与数据分析有关的部分，如数据的转换、清洗、关联、分组、聚合、排序，等等。

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240325160350635.png)

#### ① Spark SQL快速入门

- SQL on Hadoop
- Spark SQL概述、架构、常见误区
- spark-shell/spark-sql启动流程分析

#### ② Spark SQL API编程

- SparkSession & SQLContext
- DataSet & DataFrame API
- DataFrame & DataSet
- 与RDD的互操作

#### ③ Data Source API

- Data Source API处理text/JSON/
- Parquet/JDBC数据
- SaveMode的正确选择
- 配置参数统一管理

#### ④ 整合Hive操作及函数

- Spark整合Hive的数据操作
- ThriftServer的使用
- Spark SQL内置函数&自定义函数实战

#####  学学大牛如何调优与思考

学习技术受用一时，领悟思想受用一生！

Spark调优策略：

- 合理设置资源
- 广播变量带来的好处
- Shuffle调优
- Spark与GC相关概念理解
- JVM GC引起的相关问题调优

Presto：

- Presto概述、架构
- Presto部署
- Presto API操作
- 综合案例实战

关于大数据云平台建设：

- 大数据云平台建设涉及哪些功能
- 产品化设计思路
- 元数据在大数据平台中的设计思路
- Spark V.S Flink

另一个大纲：

- Spark SQL:从“小汽车摇号分析”开始

- 台前幕后:DataFrame与 Spark SQL 的由来
- 数据源与数据格式:DataFrame 从何而来?
- 数据转换:如何在 DataFrame 之上做数据处理?
- 数据关联:不同的关联形式与实现机制该怎么选?
- 数据关联优化:都有哪些 Join 策略，开发者该如何取舍?
- 配置项详解:哪些参数会影响应用程序执行性能?
- Hive + Spark 强强联合:分布式数仓的不二之选
- Spark Ul：如何高效地定位性能问题?

### 3.3 Spark MLlib 模块

从“房价预测”入手，了解 Spark 在机器学习中的应用，深入学习 Spark MLlib 丰富的特征处理函数和它支持的模型与算法，并带你了解 Spark + XGBoost 集成是如何帮助开发者应对大多数的回归与分类问题。

### 3.4 Structured Streaming 模块

重点讲解 Structured Streaming 是怎么同时保证语义一致性与数据一致性的，以及如何应对流处理中的数据关联，并通过 Kafka + Spark 这对“Couple”的系统集成，来演示流处理中的典型计算场景。