# 05-快速理解SparkSQL的DataSet

## 1 定义

一个数据集是分布式的数据集合。Spark 1.6增加新接口Dataset，提供

- RDD的优点：强类型、能够使用强大lambda函数
- Spark SQL优化执行引擎的优点

可从JVM对象构造Dataset，然后函数式转换（map、flatMap、filter等）操作。Dataset API在Scala和Java中可用。

Python不支持Dataset API，但由于Python动态性质，许多Dataset API优点已经能使用（可通过名称自然访问行的字段row.columnName）。R的情况类似。

> Python支持DataFrame API是因为DataFrame API是基于Python#Pandas库构建，而Pandas库提供强大易用的数据分析工具集。因此，Spark提供对Pandas DataFrame对象的支持，使Python使用DataFrame API非常方便。Python的Pandas也提供强类型保证，使Spark可在保持动态特性同时提供类型检查和类型推断。因此，虽Python不支持Spark的Dataset API，但它支持Spark的DataFrame API，这为Python用户提供一种方便的数据处理方式。

## 2 案例

```scala
package com.javaedge.bigdata.cp04

import org.apache.spark.sql.{DataFrame, Dataset, SparkSession}

object DatasetApp {

  def main(args: Array[String]): Unit = {
    val projectRootPath = "/Users/javaedge/Downloads/soft/sparksql-train"
    val spark = SparkSession.builder()
      .master("local").appName("DatasetApp")
      .getOrCreate()
    import spark.implicits._

    // 创建一个包含一条记录的Seq，这条记录包含一个名为 "JavaEdge" 年龄为 18 的人员信息
    val ds: Dataset[Person] = Seq(Person("JavaEdge", "18"))
      // 将Seq转换为一个Dataset[Person]类型数据集，该数据集只包含一条记录
      .toDS()
    ds.show()

    val primitiveDS: Dataset[Int] = Seq(1, 2, 3).toDS()
    primitiveDS.map(x => x + 1).collect().foreach(println)

    val peopleDF: DataFrame = spark.read.json(projectRootPath + "/data/people.json")
    val peopleDS: Dataset[Person] = peopleDF.as[Person]
    peopleDS.show(false)
    peopleDF.select("name").show()
    peopleDS.map(x => x.name).show()

    spark.stop()
  }

  /**
   * 自定义的 case class，其中包含两个属性
   */
  private case class Person(name: String, age: String)

}

output：
+--------+---+
|    name|age|
+--------+---+
|JavaEdge| 18|
+--------+---+

2
3
4
+----+-------+
|age |name   |
+----+-------+
|null|Michael|
|30  |Andy   |
|19  |Justin |
+----+-------+

+-------+
|   name|
+-------+
|Michael|
|   Andy|
| Justin|
+-------+

+-------+
|  value|
+-------+
|Michael|
|   Andy|
| Justin|
+-------+
```

## 3 DataFrame V.S Dataset

```scala
val peopleDF: DataFrame = spark.read.json(projectRootPath + "/data/people.json")
val peopleDS: Dataset[Person] = peopleDF.as[Person]
peopleDS.show(false)
```

```scala
// 弱语言类型，运行时才报错
peopleDF.select("nameEdge").show()
```

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240324223437191.png)

编译期报错：

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240324223553844.png)