# 04-Flink编程范式及核心概念

## 0 前言

- Flink APl 的抽象分层
- Flink 程序上处理流式数据的最基础代码套路

## 1 API综述

Flink程序是实现分布式集合转换的常规程序（例如，过滤，映射，更新状态，加入，分组，定义窗口，聚合）。最初从源创建集合（例如，通过从文件，kafka主题或从本地的内存集合中读取）。结果通过接收器返回，接收器可以例如将数据写入（分布式）文件或标准输出（例如，命令行终端）。 Flink程序可以在各种环境中运行，独立运行或嵌入其他程序中。执行可以在本地JVM中执行，也可在许多计算机的集群上执行。

### 1.1 不同抽象层次的数据流编程API

Flink 为开发流/批处理应用程序提供了不同层次的抽象：

![](https://nightlies.apache.org/flink/flink-docs-release-1.19/fig/levels_of_abstraction.svg)

最低级抽象仅提供有状态和近实时的流处理。通过Process Function嵌入DataStream API。允许用户自由处理来自一或多个流的事件，并提供一致的、容错的状态。用户还可注册事件时间和处理时间回调，使程序能实现复杂计算。

实际上，许多应用程序不需低级抽象，而是可针对核心API进行编程：DataStream API（有界/无界流）。这些流API提供数据处理常见的构建块，如各种形式的用户指定转换、连接、聚合、窗口、状态等。在这些API中处理的数据类型表示为各自编程语言中的类。

低级Process Function与DataStream API集成，使得可按需用低级抽象。DataSet API为有界数据集提供了额外的原语，如循环/迭代。



Flink 1.9之前只有DataStream/DataSet两种API，1.9后逐步弃用DataSet API，1.14 完全不使用。

因此，1.9 后只建议使用DataStream、Table、SQL API。成为流批统一的计算引擎，DataSet只能批处理，而其他 API 支持流批处理。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/b07581615c6ecd895b3f9a4058336e9b.png)

Flink提供三层API。 每个API在简洁性和表达性之间提供不同权衡，并针对不同的用例。

![](https://img-blog.csdnimg.cn/20190721130911565.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)



#### core API

提供一套针对流处理的函数。包括DataStream APl 和 DataSet Api，Flink 1.14 已弃用 DataSet Api。

根据数据源的类型，即有界或无界源，可编写批处理程序或流程序：

DataSet API用于批处理，核心类在 flink-java 模块，不推荐再用：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/0473dafb3288493e9b38d0856d0cea3d.png)

DataStream API用于流式处理，核心实现类则在 flink-streaming-java 模块：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/26e69ad46db40b22a1b247a1df05eb79.png)

> API示例用StreamingExecutionEnvironment和DataStream API。 DataSet API中的概念完全相同，只需用ExecutionEnvironment和DataSet替换。

#### Table API

以表(二维数据结构 Schema)为中心。Table API是一种围绕表的声明性DSL，这些表可能是动态变化的表（当表示流时）。Table API遵循（扩展的）关系模型：表有附加的架构（类似于关系数据库中的表），API提供了类似的操作，如选择、投影、连接、分组、聚合等。Table API程序声明性地定义了应该执行什么逻辑操作，而不是指定操作的具体代码。尽管Table API可以通过各种类型的用户定义函数进行扩展，但它的表达能力不如核心API，使用起来更简洁（代码量更少）。此外，Table API程序在执行前还会经过一个优化器，应用优化规则。
可以在表和DataStream/DataSet之间无缝转换，允许程序混合使用Table API与DataStream和DataSet API。

#### SQL

Flink提供的最高级别抽象是SQL。这种抽象在语义和表达能力上与Table API相似，但将程序表示为SQL查询表达式。SQL抽象与Table API紧密交互，可以在Table API中定义的表上执行SQL查询。

```java
tableEnv.scan("table1").select(...)

tableEnv.sqlQuery("select ... from table1")
```

大数据处理流程：

```bash
MapReduce: input -> map(reduce)       -> output
Storm: input -> Spout/Bolt            -> output
Spark: input -> transformation/action --> output
Flink: input -> transformation/sink   --> output
```

## 2 DataStream

Flink特殊类DataStream表示程序中的数据，可视为可以包含重复项的不可变数据集合。DataStream元素数量可为无限。

这些集合在某些关键方面与常规Java集合不同。 首先，它们是`不可变的`，这意味着`一旦创建它们,就无法添加或删除元素。 也不能简单地检查里面的元素`。

最初通过在Flink程序中添加源来创建集合，并通过诸如map，filter等API对它们转换，来从这些集合中派生新集合。

![](https://img-blog.csdnimg.cn/20190614205101132.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/2019061420541887.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

底层使用数据源。

## 3 Flink 项目流程剖析

Flink程序看起来像是转换数据集合的常规程序。 每个程序包含相同的基本部分：

- 获得执行环境，
- 加载/创建初始数据，
- 指定此数据的转换，
- 指定放置计算结果的位置，
- 触发程序执行

### Scala版本

我们现在将概述每个步骤
Scala DataSet API的所有核心类都可以在org.apache.flink.api.scala包中找到
而Scala DataStream API的类可以在org.apache.flink.streaming.api.scala中找到

StreamExecutionEnvironment是所有Flink程序的基础
可以在StreamExecutionEnvironment上使用这些静态方法获取一个：

```java
1：getExecutionEnvironment()

2：createLocalEnvironment()

3：createRemoteEnvironment(host: String, port: Int, jarFiles: String*)
```

法1示例代码
![](https://img-blog.csdnimg.cn/20190615024710917.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

法2示例代码
![](https://img-blog.csdnimg.cn/20190615015217293.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

> 此方法将环境的默认并行度设置为给定参数，默认为通过[[setDefaultLocalParallelism（Int）]]设置的值。
> ![](https://img-blog.csdnimg.cn/20190615020923426.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

通常，只需要使用`getExecutionEnvironment（）`，因为这将根据上下文执行正确的操作：

- 如果在IDE中执行程序或作为常规Java程序，它将创建一个本地环境，将执行在本地机器上的程序。 
- 如果从程序中创建了一个JAR文件，并通过命令行调用它，则Flink集群管理器将执行你的main方法，`getExecutionEnvironment（）`将返回一个执行环境，用于在集群上执行程序。

指定数据源，执行环境可通过各种途径从文件中读取：

- 逐行读取
- CSV文件
- 使用完全自定义数据输入格式

将文本文件作为一系列行读取：

```scala
val env = StreamExecutionEnvironment.getExecutionEnvironment()

val text: DataStream[String] = env.readTextFile("file:///path/to/file")
```

这将提供一个`DataStream`，然后就可以在其上应用转换来创建新的派生`DataStream`

也可以通过使用转换函数调用`DataSet`上的方法来应用转换。 例如，map转换如下所示：

```scala
val input: DataSet[String] = ...

val mapped = input.map { x => x.toInt }
```

这将通过将原始集合中的每个String转换为Integer来创建新的`DataStream`

一旦有了包含最终结果的DataStream，就可以通过创建接收器将其写入外部系统。 这些只是创建接收器的一些示例方法：

```java
writeAsText(path: String)

print()
```

一旦指定了完整的程序，就需要通过调用`StreamExecutionEnvironment`上的`execute（）`触发程序执行
根据`ExecutionEnvironment`的类型，将在本地计算机上触发执行或提交程序以在集群上执行。

execute（）方法返回一个JobExecutionResult，它包含执行时间和累加器结果。
![](https://img-blog.csdnimg.cn/20190615031103241.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

> 触发程序执行。环境将执行导致"sink"操作运作程序的所有部分
> Sink操作例如是打印结果或将它们转发到消息队列。
> 该法将记录程序执行并使用提供的名称显示。
> ![](https://img-blog.csdnimg.cn/20190615031759942.png)
> ![](https://img-blog.csdnimg.cn/20190615031916536.png)

## 4 延迟执行

所有Flink程序都是延迟执行：当执行程序的main方法时，数据加载和转换不会立即执行。而是创建每个操作并将其添加到程序的计划中。 
当执行环境上的`execute（）`调用显式触发执行时，实际执行操作。 
程序是在本地执行还是在集群上执行取决于执行环境的类型

延迟执行使我们可以构建Flink作为一个整体计划单元执行的复杂程序，进行内部的优化。

## 5 指定keys



![](https://img-blog.csdnimg.cn/20190615040357494.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190615040440912.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

上述程序中的这些数据如何确定呢？

某些转换（join，coGroup，keyBy，groupBy）要求在元素集合上定义key
其他转换（Reduce，GroupReduce，Aggregate，Windows）允许数据在应用之前在key上分组。

- DataSet分组为

```java
DataSet<...> input = // [...]
DataSet<...> reduced = input
  .groupBy(/*define key here*/)
  .reduceGroup(/*do something*/);
```

虽然可以使用DataStream指定key

```java
DataStream<...> input = // [...]
DataStream<...> windowed = input
  .keyBy(/*define key here*/)
  .window(/*window specification*/);
```

Flink的数据模型不基于键值对。 因此，无需将数据集类型物理打包到键和值中。 键是“虚拟的”：它们被定义为实际数据上的函数，以指导分组操作符。

注意：在下面的讨论中，将使用DataStream API和keyBy。 对于DataSet API，只需要用DataSet和groupBy替换。

### 5.1 定义元组的键



![](https://img-blog.csdnimg.cn/20190615233711722.png)
即 ：按给定的键位置（对于元组/数组类型）对DataStream的元素进行分组，以与分组运算符（如分组缩减或分组聚合)一起使用。

最简单的情况是在元组的一个或多个字段上对元组进行分组：

```java
val input: DataStream[(Int, String, Long)] = // [...]
val keyed = input.keyBy(0)
```

元组在第一个字段（整数类型）上分组。

```java
val input: DataSet[(Int, String, Long)] = // [...]
val grouped = input.groupBy(0,1)
```

在这里，我们将元组分组在由第一个和第二个字段组成的复合键上。

关于嵌套元组的注释：如果你有一个带有嵌套元组的DataStream，例如：

```java
DataStream<Tuple3<Tuple2<Integer, Float>,String,Long>> ds;
```

指定keyBy（0）将使系统使用完整的Tuple2作为键（以Integer和Float为键）。 如果要“导航”到嵌套的Tuple2中，则必须使用下面解释的字段表达式键。

### 5.2  指定key的字段表达式

可以使用基于字符串的字段表达式来引用嵌套字段，并定义用于分组，排序，连接或coGrouping的键。

字段表达式可以非常轻松地选择（嵌套）复合类型中的字段，例如Tuple和POJO类型。

我们有一个WC POJO，其中包含两个字段“word”和“count”。

Java：

![](https://img-blog.csdnimg.cn/20190616054634950.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

Scala：![](https://img-blog.csdnimg.cn/20190616060913538.png)

要按字段分组，我们只需将其名称传递给keyBy（）函数。

```java
// some ordinary POJO (Plain old Java Object)
class WC(var word: String, var count: Int) {
  def this() { this("", 0L) }
}
val words: DataStream[WC] = // [...]
val wordCounts = words.keyBy("word").window(/*window specification*/)

// or, as a case class, which is less typing
case class WC(word: String, count: Int)
val words: DataStream[WC] = // [...]
val wordCounts = words.keyBy("word").window(/*window specification*/)
```

### 5.2.1 字段表达式语法：

- 按字段名称选择POJO字段
  例如，“user”指的是POJO类型的“user”字段

- 通过1偏移字段名称或0偏移字段索引选择元组字段
  例如，“_ 1”和“5”分别表示Scala Tuple类型的第一个和第六个字段。

- 可以在POJO和Tuples中选择嵌套字段
  例如，“user.zip”指的是POJO的“zip”字段，其存储在POJO类型的“user”字段中。 支持任意嵌套和混合POJO和元组，例如“_2.user.zip”或“user._4.1.zip”。

- 可以使用“_”通配符表达式选择完整类型
  这也适用于非Tuple或POJO类型的类型。

### 5.2.2 字段表达示例

```java
class WC(var complex: ComplexNestedClass, var count: Int) {
  def this() { this(null, 0) }
}

class ComplexNestedClass(
    var someNumber: Int,
    someFloat: Float,
    word: (Long, Long, String),
    hadoopCitizen: IntWritable) {
  def this() { this(0, 0, (0, 0, ""), new IntWritable(0)) }
}
```

这些是上面示例代码的有效字段表达式：

- “count”：WC类中的count字段。

- “complex”：递归选择POJO类型ComplexNestedClass的字段复合体的所有字段。

- “complex.word._3”：选择嵌套Tuple3的最后一个字段。

- “complex.hadoopCitizen”：选择Hadoop IntWritable类型。

### 5.3 指定key的key选择器函数

定义键的另一种方法是“键选择器”功能。 键选择器函数将单个元素作为输入并返回元素的键。 key可以是任何类型，并且可以从确定性计算中导出。

以下示例显示了一个键选择器函数，它只返回一个对象的字段：

Java
![](https://img-blog.csdnimg.cn/20190616085900692.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

Scala
![](https://img-blog.csdnimg.cn/20190616090516508.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 6 指定转换函数

大多数转换都需要用户自定义的函数。 本节列出了如何指定它们的不同方法

### 6.1 Java版本

### 6.1.1 实现接口

最基本的方法是实现一个提供的接口：

```java
class MyMapFunction implements MapFunction<String, Integer> {
  public Integer map(String value) { return Integer.parseInt(value); }
};
data.map(new MyMapFunction());
```

![](https://img-blog.csdnimg.cn/20190616091818195.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

### 6.1.2 匿名类

可以将函数作为匿名类传递：

```java
data.map(new MapFunction<String, Integer> () {
  public Integer map(String value) { return Integer.parseInt(value); }
});
```

### 6.1.3 Java 8 Lambdas

Flink还支持Java API中的Java 8 Lambdas。

```java
data.filter(s -> s.startsWith("http://"));

data.reduce((i1,i2) -> i1 + i2);
```

### 6.1.4 增强函数

所有需要用户定义函数的转换都可以将增强函数作为参数。 例如，与其写成

```
class MyMapFunction implements MapFunction<String, Integer> {
  public Integer map(String value) { return Integer.parseInt(value); }
};
```

![](https://img-blog.csdnimg.cn/20190616163503374.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

不如写成

```java
class MyMapFunction extends RichMapFunction<String, Integer> {
  public Integer map(String value) { return Integer.parseInt(value); }
};
```

![](https://img-blog.csdnimg.cn/20190616213320182.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
并像往常一样将函数传递给map转换：

```java
data.map(new MyMapFunction());
```

也可以定义为匿名类：

```java
data.map (new RichMapFunction<String, Integer>() {
  public Integer map(String value) { return Integer.parseInt(value); }
});
```

除了用户定义的函数（map，reduce等）之外，Rich函数还提供了四种方法：open，close，getRuntimeContext和setRuntimeContext。 
这些用于参数化函数（请参阅将参数传递给函数），创建和完成本地状态，访问广播变量以及访问运行时信息（如累加器和计数器）

## 7 支持的数据类型

Flink对DataSet或DataStream中可以包含的元素类型设置了一些限制。 原因是系统分析类型以确定有效的执行策略。

有六种不同类别的数据类型：

- Java 元组 and Scala Case 类
- Java POJOs
- 原生类型
- Regular Classes
- Values
- Hadoop Writables
- Special Types

### 7.1 元组 and Case 类

#### 7.1.1 Java版本

元组是包含固定数量的具有各种类型的字段的复合类型。 Java API提供从Tuple0到Tuple25的类。 

![](https://img-blog.csdnimg.cn/20190616214358129.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
元组的每个字段都可以是包含更多元组的任意的Flink的类型，从而产生嵌套元组。 可以使用字段名称tuple.f4直接访问元组的字段，也可以使用通用getter方法tuple.getField（int position）。 字段索引从0开始。

> 这与Scala的元组形成对比，但Java的常规索引更为一致。

```java
DataStream<Tuple2<String, Integer>> wordCounts = env.fromElements(
    new Tuple2<String, Integer>("hello", 1),
    new Tuple2<String, Integer>("world", 2));

wordCounts.map(new MapFunction<Tuple2<String, Integer>, Integer>() {
    @Override
    public Integer map(Tuple2<String, Integer> value) throws Exception {
        return value.f1;
    }
});

wordCounts.keyBy(0); // also valid .keyBy("f0")
```

### 7.1.2 Scala版本

Scala case类（和Scala元组是case类的特例）是包含固定数量的具有各种类型的字段的复合类型。 元组字段由它们的1偏移名称寻址，例如第一个字段的_1。 字段按名称访问。

```java
case class WordCount(word: String, count: Int)
val input = env.fromElements(
    WordCount("hello", 1),
    WordCount("world", 2)) // Case Class Data Set

input.keyBy("word")// key by field expression "word"

val input2 = env.fromElements(("hello", 1), ("world", 2)) // Tuple2 Data Set

input2.keyBy(0, 1) // key by field positions 0 and 1
```

## 7.2 POJOs

如果满足以下要求，则Flink将Java和Scala类视为特殊的POJO数据类型：

- public限定
- 它必须有一个没有参数的公共构造函数（默认构造函数）。
- 所有字段都是public的，或者必须通过getter和setter函数访问。 对于名为foo的字段，getter和setter方法必须命名为getFoo（）和setFoo（）。
- Flink必须支持字段的类型。 目前，Flink使用Avro序列化任意对象（例如Date）。

Flink分析POJO类型的结构，即它了解POJO的字段。 因此，POJO类型比一般类型更容易使用。 此外，Flink可以比一般类型更有效地处理POJO。

包含两个公共字段的POJO。

### 7.2.1 Java版本

```java
public class WordWithCount {

    public String word;
    public int count;

    public WordWithCount() {}

    public WordWithCount(String word, int count) {
        this.word = word;
        this.count = count;
    }
}

DataStream<WordWithCount> wordCounts = env.fromElements(
    new WordWithCount("hello", 1),
    new WordWithCount("world", 2));

wordCounts.keyBy("word"); // key by field expression "word"
```

### 7.2.2 Scala 版本

```java
class WordWithCount(var word: String, var count: Int) {
    def this() {
      this(null, -1)
    }
}

val input = env.fromElements(
    new WordWithCount("hello", 1),
    new WordWithCount("world", 2)) // Case Class Data Set

input.keyBy("word")// key by field expression "word"
```

## 7.3 原生类型

Flink支持所有Java和Scala原生类型，如Integer，String和Double。

## 7.4 General Class Types

Flink支持大多数Java和Scala类（API和自定义）。 限制适用于包含无法序列化的字段的类，如文件指针，I / O流或其他本机资源。 遵循Java Beans约定的类通常可以很好地工作。

所有未标识为POJO类型的类都由Flink作为常规类类型处理。 Flink将这些数据类型视为黑盒子，并且无法访问其内容（即，用于有效排序）。 使用序列化框架Kryo对常规类型进行反序列化。

## 7.5 Values

值类型手动描述其序列化和反序列化。
它们不是通过通用序列化框架，而是通过使用读取和写入方法实现org.apache.flinktypes.Value接口来为这些操作提供自定义代码。当通用序列化效率非常低时，使用值类型是合理的。

一个示例是将元素的稀疏向量实现为数组的数据类型。知道数组大部分为零，可以对非零元素使用特殊编码，而通用序列化只需编写所有数组元素。

org.apache.flinktypes.CopyableValue接口以类似的方式支持手动内部克隆逻辑。

Flink带有与基本数据类型对应的预定义值类型。 （ByteValue，ShortValue，IntValue，LongValue，FloatValue，DoubleValue，StringValue，CharValue，BooleanValue）。这些值类型充当基本数据类型的可变变体：它们的值可以被更改，允许程序员重用对象并从垃圾收集器中消除压力。

## 7.6 Hadoop Writables

可以使用实现org.apache.hadoop.Writable接口的类型。 write（）和readFields（）方法中定义的序列化逻辑将用于序列化。

## 7.7 Special Types

可以使用特殊类型，包括Scala的Either，Option和Try
Java API有自己的自定义Either实现。 与Scala的Either类似，它代表两种可能类型的值，左或右。 两者都可用于错误处理或需要输出两种不同类型记录的运算符。

## 7.8 Type Erasure & Type Inference

> 仅适用于Java

Java编译器在编译后抛弃了大部分泛型类型信息。这在Java中称为类型擦除。这意味着在运行时，对象的实例不再知道其泛型类型。例如，DataStream <String>和DataStream <Long>的实例于JVM看起来相同。

Flink在准备执行程序时（当调用程序的主要方法时）需要类型信息。 Flink Java API尝试重建以各种方式丢弃的类型信息，并将其显式存储在数据集和运算符中。你可以通过DataStream.getType（）检索类型。该方法返回TypeInformation的一个实例，这是Flink表示类型的内部方式。

类型推断有其局限性，在某些情况下需要程序员的“合作”。这方面的示例是从集合创建数据集的方法，例如

```
ExecutionEnvironment.fromCollection（）
```

可以在其中传递描述类型的参数。但是像MapFunction <I，O>这样的通用函数也可能需要额外的类型信息。

ResultTypeQueryable接口可以通过输入格式和函数实现，以明确告知API其返回类型。调用函数的输入类型通常可以通过先前操作的结果类型来推断。