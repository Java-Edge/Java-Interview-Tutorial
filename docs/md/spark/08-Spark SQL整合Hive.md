# 08-Spark SQL整合Hive

## 0 相关源码

[sparksql-train](https://github.com/Java-Edge/sparksql-train)

## 1 整合原理及使用

- Spark，一个快速、可扩展的分布式计算引擎
- Hive，一个数据仓库工具，提供数据存储和查询功能

在 Spark 中用 Hive 可提高数据处理和查询效率。

### 1.1 场景

历史原因积累，很多数据原采用Hive处理，现想改用Spark操作，须要求Spark能无缝对接已有的Hive数据，实现平滑过渡。

### 1.2 MetaStore

Hive底层的元数据信息存储在MySQL，$HIVE_HOME/conf/hive-site.xml


Spark若能直接访问MySQL中已有的元数据信息  $SPARK_HOME/conf/hive-site.xml

### 1.3 前置条件

在使用 Spark 整合 Hive 前，需安装配置：

- Hadoop：数据存储和分布式计算
- Hive：数据存储和查询
- Spark：分布式计算

### 1.4 配置Spark连接Hive

在 Spark 中使用 Hive，需将 Hive 的依赖库添加到 Spark 的类路径。在 Java 代码中，可以使用 SparkConf 对象来设置 Spark 应用程序的配置。

在创建SparkSession时，需要配置Hive支持。这可以通过设置Hive相关的配置参数来实现。

示例：

```java
import org.apache.spark.SparkConf;
import org.apache.spark.sql.SparkSession;

public class SparkHiveIntegration {
    public static void main(String[] args) {
        SparkConf conf = new SparkConf()
                .setAppName("SparkHiveIntegration")
                .setMaster("local[*]")
          			 // Hive 的元数据存储路径
                .set("spark.sql.warehouse.dir", "/user/hive/warehouse");

        SparkSession spark = SparkSession.builder()
                .config(conf)
          			 // 启用了 Hive 支持
                .enableHiveSupport()
                .getOrCreate();
        spark.sql("SELECT * FROM mytable").show();
        spark.stop();
    }
}
```

Spark SQL 语法与 Hive SQL 语法略不同，参考 Spark SQL 官方文档。

## 2 ThiriftServer使用

```bash
javaedge@JavaEdgedeMac-mini sbin % pwd
/Users/javaedge/Downloads/soft/spark-2.4.3-bin-2.6.0-cdh5.15.1/sbin

javaedge@JavaEdgedeMac-mini sbin % ./start-thriftserver.sh --master local --jars /Users/javaedge/.m2/repository/mysql/mysql-connector-java/8.0.15/mysql-connector-java-8.0.15.jar

starting org.apache.spark.sql.hive.thriftserver.HiveThriftServer2, logging to /Users/javaedge/Downloads/soft/spark-2.4.3-bin-2.6.0-cdh5.15.1/logs/spark-javaedge-org.apache.spark.sql.hive.thriftserver.HiveThriftServer2-1-JavaEdgedeMac-mini.local.out
```

![](https://img-blog.csdnimg.cn/a3c149c8e9464b0386be53024ae56b0b.png)

### beeline

内置了一个客户端工具：

```bash
javaedge@JavaEdgedeMac-mini bin % ./beeline -u jdbc:hive2://localhost:10000
Connecting to jdbc:hive2://localhost:10000
log4j:WARN No appenders could be found for logger (org.apache.hive.jdbc.Utils).
log4j:WARN Please initialize the log4j system properly.
log4j:WARN See http://logging.apache.org/log4j/1.2/faq.html#noconfig for more info.
Connected to: Spark SQL (version 2.4.3)
Driver: Hive JDBC (version 1.2.1.spark2)
Transaction isolation: TRANSACTION_REPEATABLE_READ
Beeline version 1.2.1.spark2 by Apache Hive
0: jdbc:hive2://localhost:10000>
```

当你执行一条命令后：

![](https://img-blog.csdnimg.cn/541dbee0af184bc2a60724f446e4e2b1.png)

就能在 [Web UI](http://localhost:4040/sqlserver/) 看到该命令记录：

![](https://img-blog.csdnimg.cn/4f2f7f70d17c4dcf9f2d966ae1a2c43d.png)

## 3 通过代码访问数据

手敲命令行太慢，更多是代码访问：

```scala
package com.javaedge.bigdata.cp06

import java.sql.{Connection, DriverManager, PreparedStatement, ResultSet}

object JDBCClientApp {

  def main(args: Array[String]): Unit = {
    Class.forName("org.apache.hive.jdbc.HiveDriver")

    val conn: Connection = DriverManager.getConnection("jdbc:hive2://localhost:10000")
    val pstmt: PreparedStatement = conn.prepareStatement("show tables")

    val rs: ResultSet = pstmt.executeQuery()

    while (rs.next()) {
      // 每行结果集中第一列和第二列的数据，即表名和其他信息，以字符串形式输出到控制台
      println(rs.getObject(1) + " : " + rs.getObject(2))
    }
  }
}
```

最后打成 jar 包，扔到服务器定时运行即可执行作业啦。

### 3.1 ThiriftServer V.S Spark Application 例行作业

Thrift Server 独立的服务器应用程序，允许多个客户端通过网络协议访问其上运行的 Thrift 服务。Thrift 服务通常是由一组 Thrift 定义文件定义的，这些文件描述了可以从客户端发送到服务器的请求和响应消息的数据结构和协议。Thrift Server 可以使用各种编程语言进行开发，包括 Java、C++、Python 等，并支持多种传输和序列化格式，例如 TSocket、TFramedTransport、TBinaryProtocol 等。使用 Thrift Server，你可以轻松地创建高性能、可伸缩和跨平台的分布式应用程序。

Spark Application，基于 Apache Spark 的应用程序，它使用 Spark 编写的 API 和库来处理大规模数据集。Spark Application 可以部署在本地计算机或云环境中，并且支持各种数据源和格式，如 Hadoop 分布式文件系统（HDFS）、Apache Cassandra、Apache Kafka 等。Spark Application 可以并行处理数据集，以加快数据处理速度，并提供了广泛的机器学习算法和图形处理功能。使用 Spark Application，你可以轻松地处理海量数据，提取有价值的信息和洞察，并帮助你做出更明智的业务决策。

因此，Thrift Server 和 Spark Application 适用不同的场景和应用程序：

- 需要创建一个分布式服务并为多个客户端提供接口，使用 Thrift Server
- 需要处理大规模数据集并使用分布式计算和机器学习算法来分析数据，使用 Spark Application

## 4 Spark 代码访问 Hive 数据

### 4.1 执行Hive查询

如何在Spark中使用Spark SQL执行Hive查询呢？

通过SparkSession对象执行Hive查询。可以使用Spark SQL的语法来执行Hive的SQL语句。示例代码如下：

```scala
// 查询Hive中的表
spark.sql("SHOW TABLES").show()

// 执行其他Hive SQL语句
spark.sql("SELECT * FROM table_name").show()
```

## 5 Spark SQL 函数实战

### 5.0 parallelize

SparkContext的一个方法，将一个本地数据集转为RDD。parallelize方法接受一个集合作为输入参数，并根据指定并行度创建一个新RDD。

语法：

```scala
// data表示要转换为 RDD 的本地集合
// numSlices表示 RDD 的分区数，通常等于集群中可用的 CPU 核心数量。 
val rdd = 
sc.parallelize(data, numSlices)
```

将一个包含整数值的本地数组转换为RDD：

```scala
package com.javaedge.bigdata.cp06

import org.apache.spark.{SparkConf, SparkContext}

object DemoClientApp {

  def main(args: Array[String]): Unit = {

    // 创建 SparkConf 对象
    val conf = new SparkConf().setAppName("ParallelizeExample").setMaster("local[*]")

    // 创建 SparkContext 对象
    val sc = new SparkContext(conf)

    // 定义本地序列
    val data = Seq(1, 2, 3, 4, 5)

    // 使用 parallelize 方法创建 RDD
    val rdd = sc.parallelize(data)

    // 执行转换操作
    val result = rdd.map(_ * 2)

    // 显示输出结果
    result.foreach(println)
  }
}

output：
4
2
6
10
8
```

创建了一个包含整数值的本地序列 `data`，然后使用 `parallelize` 方法将其转换为一个 RDD。接下来，我们对 RDD 进行转换操作，并打印输出结果。

使用 `parallelize` 方法时，请确保正确配置 Spark 应用程序，并设置正确 CPU 核心数量和内存大小。否则，可能会导致应用程序性能下降或崩溃。

### 5.1 内置函数

都在这：

![](https://img-blog.csdnimg.cn/a115c9de90284c49b2275949bb555afb.png)

#### 统计 PV、UV 实例

```scala
package com.javaedge.bigdata.chapter06

import org.apache.spark.rdd.RDD
import org.apache.spark.sql.{DataFrame, SparkSession}

/**
 * 内置函数
 */
object BuiltFunctionApp {

  def main(args: Array[String]): Unit = {


    val spark: SparkSession = SparkSession.builder()
      .master("local").appName("HiveSourceApp")
      .getOrCreate()

    // day  userid
    val userAccessLog = Array(
      "2016-10-01,1122",
      "2016-10-01,1122",
      "2016-10-01,1123",
      "2016-10-01,1124",
      "2016-10-01,1124",
      "2016-10-02,1122",
      "2016-10-02,1121",
      "2016-10-02,1123",
      "2016-10-02,1123"
    )

    import spark.implicits._

    // Array ==> RDD
    val userAccessRDD: RDD[String] = spark.sparkContext.parallelize(userAccessLog)

    val userAccessDF: DataFrame = userAccessRDD.map(x => {
      val splits: Array[String] = x.split(",")
      Log(splits(0), splits(1).toInt)
    }).toDF

    userAccessDF.show()

    import org.apache.spark.sql.functions._

    // select day, count(user_id) from xxx group by day;
    userAccessDF.groupBy("day").agg(count("userId").as("pv")).show()

    userAccessDF.groupBy("day").agg(countDistinct("userId").as("uv")).show()
    spark.stop()
  }

  private case class Log(day: String, userId: Int)
}
```

### 5.2 自定义函数

```scala
package com.javaedge.bigdata.chapter06

import org.apache.spark.rdd.RDD
import org.apache.spark.sql.{DataFrame, SparkSession}


/**
 * 统计每个人爱好的个数
 * pk：3
 * jepson： 2
 *
 *
 * 1）定义函数
 * 2）注册函数
 * 3）使用函数
 */
object UDFFunctionApp {
  def main(args: Array[String]): Unit = {

    val spark: SparkSession = SparkSession.builder()
      .master("local").appName("HiveSourceApp")
      .getOrCreate()


    import spark.implicits._

    val infoRDD: RDD[String] = spark.sparkContext.textFile(
      "/Users/javaedge/Downloads/sparksql-train/data/hobbies.txt")
    val infoDF: DataFrame = infoRDD.map(_.split("###")).map(x => {
      Hobbies(x(0), x(1))
    }).toDF

    infoDF.show(false)

    // TODO... 定义函数 和 注册函数
    spark.udf.register("hobby_num", (s: String) => s.split(",").size)

    infoDF.createOrReplaceTempView("hobbies")

    //TODO... 函数的使用
    spark.sql("select name, hobbies, hobby_num(hobbies) as hobby_count from hobbies").show(false)

    // select name, hobby_num(hobbies) from xxx

    spark.stop()
  }

  private case class Hobbies(name: String, hobbies: String)
}

output：
+------+----------------------+
|name  |hobbies               |
+------+----------------------+
|pk    |jogging,Coding,cooking|
|jepson|travel,dance          |
+------+----------------------+

+------+----------------------+-----------+
|name  |hobbies               |hobby_count|
+------+----------------------+-----------+
|pk    |jogging,Coding,cooking|3          |
|jepson|travel,dance          |2          |
+------+----------------------+-----------+
```

## 6 总结

通过上述示例代码，可以看到如何在 Java 中使用 Spark 整合 Hive。通过使用 Hive 的数据存储和查询功能，可以在 Spark 中高效地处理和分析数据。当然，还有许多其他功能和配置可以使用，例如设置 Spark 应用程序的资源分配、数据分区、数据格式转换等。