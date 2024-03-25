# 06-RDD与DataFrame的互操作

```scala
val spark = SparkSession.builder()
  .master("local").appName("DatasetApp")
  .getOrCreate()
```

Spark SQL支持两种不同方法将现有RDD转换为DataFrame：

## 1 反射推断

包含特定对象类型的 RDD 的schema。
这种基于反射的方法可使代码更简洁，在编写 Spark 应用程序时已知schema时效果很好

```scala
// 读取文件内容为RDD，每行内容为一个String元素
val peopleRDD: RDD[String] = spark.sparkContext.textFile(projectRootPath + "/data/people.txt")

// RDD转换为DataFrame的过程
val peopleDF: DataFrame = peopleRDD
  // 1. 使用map方法将每行字符串按逗号分割为数组
  .map(_.split(","))
  // 2. 再次使用map方法，将数组转换为People对象
  .map(x => People(x(0), x(1).trim.toInt))
  // 3. 最后调用toDF将RDD转换为DataFrame
  .toDF()
```

## 2 通过编程接口

构造一个schema，然后将其应用到现有的 RDD。

### 2.0 适用场景

虽该法更冗长，但它允许运行时构造 Dataset，当列及其类型直到运行时才知道时很有用。

### 2.1 step1

```scala
// 定义一个RDD[Row]类型的变量peopleRowRDD，用于存储处理后的每行数据
val peopleRowRDD: RDD[Row] = peopleRDD
  // 使用map方法将每行字符串按逗号分割为数组，得到一个RDD[Array[String]]
  .map(_.split(","))
  // 再次使用map方法，将数组转换为Row对象，Row对象的参数类型需要和schema中定义的一致
  // 这里假设schema中的第一个字段为String类型，第二个字段为Int类型
  .map(x => Row(x(0), x(1).trim.toInt))
```

### 2.2 step2

```scala
// 描述DataFrame的schema结构
val struct = StructType(
  // 使用StructField定义每个字段
  StructField("name", StringType, nullable = true) ::
    StructField("age", IntegerType, nullable = false) :: Nil)
```

### 2.3 step3

使用SparkSession的createDataFrame方法将RDD转换为DataFrame

```scala
val peopleDF: DataFrame = spark.createDataFrame(peopleRowRDD, struct)

peopleDF.show()
```