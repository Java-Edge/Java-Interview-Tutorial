# 05-Flink实战DataStream API编程

## 0 概述

DataStream 程序是对数据流（如过滤、更新状态、定义窗口、聚合）进行转换的常规程序。

数据流的起始从各种源（如MQ、socket流、文件）创建。结果通过 sink 返回，如可将数据写入文件或标准输出（如命令行终端）。Flink 程序可在各种上下文运行，可独立运行，也可嵌入其它程序。任务执行可运行在本地JVM或多台机器的集群。

基于流式数据的编程模型，面向应用，描述的是流式数据的业务逻辑。

创建DataStream程序，建议从 [Flink 程序剖析](https://nightlies.apache.org/flink/flink-docs-release-1.18/zh/docs/dev/datastream/overview/#anatomy-of-a-flink-program)开始，逐渐添加自己的 [stream transformation](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/dev/datastream/operators/overview/)。其余部分作为附加的算子和高级特性的参考。

## 1 DataStream是啥?

DataStream API得名自 `DataStream` 类，该类表示 Flink 程序中的数据集合。可认为是能包含重复项的不可变数据集。这些数据可为有界、无界，但用于处理它们的API相同。

`DataStream` 类似 Java 集合，但：

- 不可变，一旦被创建，就不能添加或删除元素
- 也不能简单察看内部元素，只能用 `DataStream` API 处理

`DataStream` API 操作也叫转换（transformation）。可通过在 Flink 程序中添加 source 创建一个初始的 `DataStream`。然后，基于 `DataStream` 派生新的流，并使用 map、filter 等 API 把 `DataStream` 和派生的流连接。

## 2 Flink 程序剖析

Flink 程序看起来像转换 `DataStream` 的常规程序。每个程序的编程八股文：

1. 获取一个执行环境
2. 加载/创建初始数据
3. 指定数据相关的转换
4. 指定计算结果的存储位置
5. 触发程序执行

> All Flink Scala APIs are deprecated and will be removed in a future Flink version. You can still build your application in Scala, but you should move to the Java version of either the DataStream and/or Table API.
>
> See [FLIP-265 Deprecate and remove Scala API support](https://cwiki.apache.org/confluence/display/FLINK/FLIP-265+Deprecate+and+remove+Scala+API+support)

对这些步骤逐一进行概述，更多细节请参考相关章节。Java DataStream API所有核心类都在 [org.apache.flink.streaming.api ](https://github.com/apache/flink/blob/master//flink-streaming-java/src/main/java/org/apache/flink/streaming/api)。

### 2.1 获取一个执行环境

StreamExecutionEnvironment，所有 Flink 程序基础，使用 `StreamExecutionEnvironment` 的静态方法获取 `StreamExecutionEnvironment`：

```java
getExecutionEnvironment();

createLocalEnvironment();

createRemoteEnvironment(String host, int port, String... jarFiles);
```

使用 `getExecutionEnvironment()` 就够，因为该方法会根据上下文做正确处理：

- 若你在 IDE 中执行你的程序或将其作为一般的 Java 程序执行，它将创建一个本地环境，该环境将在你的本地机器上执行你的程序
- 若你基于程序创建一个 JAR 文件，并通过[命令行](https://nightlies.apache.org/flink/flink-docs-master/zh/docs/deployment/cli/)运行它，Flink 集群管理器将执行程序的 main 方法，同时 `getExecutionEnvironment()` 返回一个执行环境以在集群上执行

### 2.2 加载/创建初始数据

为指定 data sources，执行环境提供了一些方法，支持使用各种方法从文件读数据：逐行读数据，像读 CSV 文件或使用任何第三方提供的 source。若只是将一个文本文件作为一个行的序列来读取，可用：

```java
final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

// 这将生成一个 DataStream
DataStream<String> text = env.readTextFile("file:///path/to/file");
// 然后，就能在DataStream上应用转换（transformation）来创建新的派生 DataStream
```

可调用 DataStream 上具有转换功能的方法来

### 2.3 应用转换

如一个 map 的转换：

```java
DataStream<String> input = ...;

DataStream<Integer> parsed = input.map(new MapFunction<String, Integer>() {
    @Override
    public Integer map(String value) {
      	// 把原始集合中的每一个字符串转换为一个整数
      	// 来创建一个新的 DataStream
        return Integer.parseInt(value);
    }
});
```

有了 DataStream，就能通过创建 sink 把它写到外部系统。

### 2.4 创建 sink

```java
writeAsText(String path);

print();
```

### 2.5 触发程序执行

#### ① execute

一旦指定完整程序，需调StreamExecutionEnvironment#execute()**触发程序执行**。根据 `ExecutionEnvironment` 的类型，执行会:

- 在你的本地机器上触发
- 或将你的程序提交到某个集群执行

`execute()` 方法将等待作业完成，然后返回 `JobExecutionResult`，其包含执行时间和累加器结果。

```java
// 作业执行的结果。提供对作业的执行时间及此作业创建的所有累加器的访问权限。
@Public
public class JobExecutionResult extends JobSubmissionResult {

    private final long netRuntime;

    private final Map<String, OptionalFailure<Object>> accumulatorResults;
    ...
}
```

#### ② executeAsynce

若不想等待作业完成，可调 treamExecutionEnvironment#executeAsync() 触发作业异步执行。它会返回一个 `JobClient`，可通过它与刚提交的作业进行通信。如下是使用 `executeAsync()` 实现 `execute()` 语义的示例。

```java
final JobClient jobClient = env.executeAsync();

final JobExecutionResult jobExecutionResult = jobClient.getJobExecutionResult().get();
```

程序执行的最后一部分对理解何时及如何执行 Flink 算子很重要。所有 Flink 程序都是延迟执行：

- main被执行时，数据加载和转换不会直接发生。每个算子都被创建并添加到 dataflow 形成的有向图
- 执行被执行环境的 `execute()` 显式触发时，这些算子才真正执行
- 程序在本地or集群执行取决于执行环境的类型

延迟计算允许你构建复杂的程序，Flink 会将其作为一个整体的计划单元来执行。

## 3 案例



### 3.1 流窗口字数统计



在5s窗口中对来自Web套接字的单词进行计数，可本地运行：

```java
public class WindowWordCount {

    public static void main(String[] args) throws Exception {

        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        DataStream<Tuple2<String, Integer>> dataStream = env
                .socketTextStream("localhost", 9999)
                .flatMap(new Splitter())
                .keyBy(0)
                .timeWindow(Time.seconds(5))
                .sum(1);

        dataStream.print();

        env.execute("Window WordCount");
    }

    public static class Splitter implements FlatMapFunction<String, Tuple2<String, Integer>> {
        @Override
        public void flatMap(String sentence, Collector<Tuple2<String, Integer>> out) throws Exception {
            for (String word: sentence.split(" ")) {
                out.collect(new Tuple2<String, Integer>(word, 1));
            }
        }
    }
}
```

要运行示例程序，先从终端使用 netcat 启动输入流：

```bash
nc -lk 9999
```

键入一些单词就能返回一个新单词。 这些将是字数统计程序的输入。 若查看大于1的计数，请在5s内反复键入相同单词（若不能快速输入，则将窗口大小从5s增大点）。

Socket输入：

```bash
javaedge@JavaEdgedeMac-mini ~ % nc -lk 9999
JavaEdge
```

### 3.2 socketFunction case



```java
public class JavaDataStreamSourceApp {

    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        socketFunction(env);
        env.execute("JavaDataStreamSourceApp");
    }

    public static void socketFunction(StreamExecutionEnvironment env) {
        DataStreamSource<String> data = env.socketTextStream("localhost", 9999);
        data.print().setParallelism(1);
    }
}
```

数据流：

```bash
javaedge@JavaEdgedeMac-mini ~ % nc -lk 9999
javaedge
```

输出：

```bash
18:53:39,464 INFO  org.apache.flink.streaming.api.functions.source.SocketTextStreamFunction  - Connecting to server socket localhost:9999
javaedge
```

### 3.3 带分隔符



创建一个新数据流，其中包含从套接字无限接收的字符串。 接收的字符串由系统的默认字符集解码，使用“\ n”作为分隔符。 当socket关闭时，阅读器立即终止。

![](https://img-blog.csdnimg.cn/20190719234315820.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 4 Data source

Flink 内置数据源（Source），程序从中读取其输入的地方。

 `StreamExecutionEnvironment.addSource(sourceFunction)` 将一个 source 关联到程序。

Flink 内置很多 source functions，也可编写自定义的非并行 source：

- 实现 `SourceFunction` 接口
- 也可实现 `ParallelSourceFunction` 接口或继承 `RichParallelSourceFunction` 类



通过 `StreamExecutionEnvironment` 可访问多种预定义的 stream source：

### 4.1 基于文件

#### readTextFile(path)

TextInputFormat逐行读取文本文件，即符合规范的文件，并将它们作为字符串返回。

#### readFile(fileInputFormat, path)

按指定的文件输入格式指定读取（一次）文件。

#### readFile(fileInputFormat, path, watchType, interval, pathFilter, typeInfo) 

这是前两个内部调用的方法。它path根据给定的内容读取文件fileInputFormat。根据提供的内容watchType，此源可以定期监视（每intervalms）新数据（FileProcessingMode.PROCESS_CONTINUOUSLY）的路径，或者处理当前在路径中的数据并退出（FileProcessingMode.PROCESS_ONCE）。使用该pathFilter，用户可以进一步排除正在处理的文件。

#### 实现

在底层，Flink 将文件读取过程拆分为两个子任务，每个子任务由一个单独的实体实现：

##### 目录监控

由单个**非并行**（并行度 = 1）任务实现。

单个监控任务的作用是扫描目录（定期或仅扫描一次，取决于 `watchType`），找到要处理的文件，将它们划分为 *分片*，并将这些分片分配给下游 reader。Reader 是将实际获取数据的角色。每个分片只能被一个 reader 读取，而一个 reader 可以一个一个地读取多个分片。

##### 数据读取

由多个并行运行的任务执行。并行度和作业的并行度相等

1. 若 `watchType=FileProcessingMode.PROCESS_CONTINUOUSLY`，当一个文件被修改，其内容会被完全重新处理。这可能打破 “精确一次” 语义，因为在文件末尾追加数据将导致重新处理文件的**所有**内容
2. 若 `watchType=FileProcessingMode.PROCESS_ONCE`，source 扫描**一次**路径然后退出，无需等待 reader 读完文件内容。reader 会继续读取数据，直到所有文件内容都读完。关闭 source 会导致在那之后不再有检查点。可能导致节点故障后恢复速度变慢，因为作业将从最后一个检查点恢复读取

### 4.2 基于Socket

socketTextStream：从Socket读取。元素可以由分隔符分隔。

### 4.3 基于集合

#### fromCollection(Collection) 

从Java Java.util.Collection创建数据流。集合中的所有数据元必须属于同一类型。

#### fromCollection(Iterator, Class) 

从迭代器创建数据流。该类指定迭代器返回的数据元的数据类型。

#### fromElements(T ...) 

从给定的对象序列创建数据流。所有对象须属同一类型。

#### fromParallelCollection(SplittableIterator, Class)

并行地从迭代器创建数据流。该类指定迭代器返回的数据元的数据类型。

创建包含迭代器中的元素的新数据流。迭代器是可拆分的（Splittable），允许框架创建返回迭代器中元素的并行数据流源。
由于迭代器在实际执行之前将保持未修改状态，因此迭代器返回的数据类型须以类型类的形式显式给出（因为 Java 编译器擦除泛型类型信息）。

参数：
iterator – 生成数据流元素的迭代器 type – 迭代器生成的数据的类。不能是泛型类。

返回：
表示迭代器中元素的数据流

```java
public <OUT> DataStreamSource<OUT> fromParallelCollection(
        SplittableIterator<OUT> iterator, Class<OUT> type) {
    return fromParallelCollection(iterator, TypeExtractor.getForClass(type));
}
```



#### generateSequence(from, to)

并行生成给定间隔中的数字序列。

### 4.4 Kafka 数据源

需要引入Kafka Connector

### 4.5 自定义

#### 数据源方式SourceFunction

使用用户定义的源函数为任意源功能创建DataStream。 

默认，源具有1的并行性：

```java
package com.javaedge.java.chapter4;

import org.apache.flink.streaming.api.functions.source.SourceFunction;

public class JavaCustomNonParallelSourceFunction implements SourceFunction<Long> {
  
    boolean isRunning = true;

    long count = 1;

    @Override
    public void run(SourceFunction.SourceContext<Long> ctx) throws Exception {
        while (true) {
            ctx.collect(count);
            count += 1;
            Thread.sleep(1000);
        }
    }

    @Override
    public void cancel() {
        isRunning = false;
    }
}
```

scala版：

```scala
package com.javaedge.scala.chapter4

import org.apache.flink.streaming.api.functions.source.SourceFunction

class CustomNonParallelSourceFunction extends SourceFunction[Long]{

  var count = 1L
  var isRunning = true

  override def cancel(): Unit = {
    isRunning = false
  }

  override def run(ctx: SourceFunction.SourceContext[Long]): Unit = {
    while(isRunning) {
      ctx.collect(count)
      count += 1
      Thread.sleep(1000)
    }
  }
}
```

#### 启用并行执行

用户定义的源要实现 ParallelSourceFunction。

```java
package com.javaedge.java.chapter4;

import org.apache.flink.streaming.api.functions.source.ParallelSourceFunction;
import org.apache.flink.streaming.api.functions.source.SourceFunction;

public class JavaCustomParallelSourceFunction implements ParallelSourceFunction<Long> {
    boolean isRunning = true;
    long count = 1;

    @Override
    public void run(SourceFunction.SourceContext<Long> ctx) throws Exception {
        while (true) {
            ctx.collect(count);
            count += 1;
            Thread.sleep(1000);
        }
    }

    @Override
    public void cancel() {
        isRunning = false;
    }
}
```

或继承`RichParallelSourceFunction`：

```java
package com.javaedge.java.chapter4;

import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.source.RichParallelSourceFunction;

public class JavaCustomRichParallelSourceFunction extends RichParallelSourceFunction<Long> {
    boolean isRunning = true;
    long count = 1;

    @Override
    public void run(SourceContext<Long> ctx) throws Exception {
        while (true) {
            ctx.collect(count);
            count += 1;
            Thread.sleep(1000);
        }
    }

    @Override
    public void open(Configuration parameters) throws Exception {
        super.open(parameters);
    }

    @Override
    public void close() throws Exception {
        super.close();
    }

    @Override
    public void cancel() {
        isRunning = false;
    }
}
```



```scala
  /**
   * 使用用户定义的源函数创建数据流，以实现任意源功能。
   * 默认，源的并行度=1。要启用并行执行，
   * 用户定义源应实现 ParallelSourceFunction 或扩展 RichParallelSourceFunction。这些情况下，生成的源将有环境的并行性。
   * 要在之后更改此设置，调 DataStreamSource.setParallelism（int）
   */
  def addSource[T: TypeInformation](function: SourceFunction[T]): DataStream[T] = {
    require(function != null, "Function must not be null.")
    
    val cleanFun = scalaClean(function)
    val typeInfo = implicitly[TypeInformation[T]]
    asScalaStream(javaEnv.addSource(cleanFun).returns(typeInfo))
  }
```



#### addSource

关联一个新的 source function。例如，你可以使用 `addSource(new FlinkKafkaConsumer<>(...))` 从 Kafka 获取数据。

```scala
package com.javaedge.scala.chapter4

import org.apache.flink.streaming.api.functions.source.SourceFunction

class CustomNonParallelSourceFunction extends SourceFunction[Long]{

  var count = 1L
  var isRunning = true

  override def cancel(): Unit = {
    isRunning = false
  }

  override def run(ctx: SourceFunction.SourceContext[Long]): Unit = {
    while(isRunning) {
      ctx.collect(count)
      count += 1
      Thread.sleep(1000)
    }
  }
}
```



```scala
package com.javaedge.scala.chapter4

import org.apache.flink.streaming.api.scala.StreamExecutionEnvironment
import org.apache.flink.api.scala._

object DataStreamSourceApp {

  def main(args: Array[String]): Unit = {
    val env = StreamExecutionEnvironment.getExecutionEnvironment
    nonParallelSourceFunction(env)
    env.execute("DataStreamSourceApp")
  }

  def nonParallelSourceFunction(env: StreamExecutionEnvironment): Unit = {
    val data = env.addSource(new CustomNonParallelSourceFunction)
    data.print().setParallelism(1)
  }
}
```

## 5 DataStream Transformations 算子

算子将一或多个DataStream转换为新的DataStream。程序可以将多个转换组合成复杂的数据流拓扑。本节介绍基本转换，应用这些转换后的有效物理分区以及对Flink 算子链接的见解。

### 5.0 map

access.log

```bash
202512120010,javaedge.com,2000
202512120010,a.com,6000
202512120010,b.com,5000
202512120010,javaedge.com,4000
202512120010,a.com,1000
```

```java
public static void map(StreamExecutionEnvironment env) {

    DataStreamSource<String> source = env.readTextFile("data/access.log");

    SingleOutputStreamOperator<Access> mapStream = source.map(new MapFunction<String, Access>() {
        @Override
        public Access map(String value) throws Exception {
            String[] splits = value.split(",");
            Long time = Long.parseLong(splits[0].trim());
            String domain = splits[1].trim();
            Double traffic = Double.parseDouble(splits[2].trim());

            return new Access(time, domain, traffic);
        }
    });
    mapStream.print();
}
```



### 5.1 filter

DataStream→DataStream

计算每个数据元的布尔函数，并保存函数返回true的数据元。过滤掉xxx的过滤器

```java
public static void filterFunction(StreamExecutionEnvironment env) {
    DataStreamSource<Long> data = env.addSource(new JavaCustomNonParallelSourceFunction());
    data.map(new MapFunction<Long, Long>() {
        @Override
        public Long map(Long value) throws Exception {
            System.out.println("value = [" + value + "]");
            return value;
        }
    }).filter(new FilterFunction<Long>() {
        @Override
        public boolean filter(Long value) throws Exception {
            return value % 2 == 0;
        }
    }).print().setParallelism(1);
}
```

### 5.2 union

DataStream *→DataStream

两个或多个数据流的联合，创建包含来自所有流的所有数据元的新流

若将数据流与自身联合，则会在结果流中获取两次数据元：
![](https://img-blog.csdnimg.cn/20190720232750613.png)

```java
package com.javaedge.java.chapter4;

import org.apache.flink.api.common.functions.FilterFunction;
import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.streaming.api.collector.selector.OutputSelector;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.datastream.SplitStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;

import java.util.ArrayList;
import java.util.List;

public class JavaDataStreamTransformationApp {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        unionFunction(env);
        env.execute("JavaDataStreamTransformationApp");
    }

    public static void unionFunction(StreamExecutionEnvironment env) {
        DataStreamSource<Long> data1 = env.addSource(new JavaCustomNonParallelSourceFunction());
        DataStreamSource<Long> data2 = env.addSource(new JavaCustomNonParallelSourceFunction());
        data1.union(data2).print().setParallelism(1);
    }
}
```

### 5.3 split拆分

DataStream→SplitStream。按标准将流拆分为两个或更多个流：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/024431d0d5640d04b46a5d1799540e68.png)

### 5.4 select

SplitStream→DataStream。从拆分流中选择一个或多个流：

![](https://img-blog.csdnimg.cn/20190720234320281.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

```scala
public static void splitSelectFunction(StreamExecutionEnvironment env) {
    DataStreamSource<Long> data = env.addSource(new JavaCustomNonParallelSourceFunction());

    SplitStream<Long> splits = data.split(new OutputSelector<Long>() {
        @Override
        public Iterable<String> select(Long value) {
            List<String> output = new ArrayList<>();
            if (value % 2 == 0) {
                output.add("even");
            } else {
                output.add("odd");
            }
            return output;
        }
    });

    splits.select("odd").print().setParallelism(1);
}

// 输出：
1
1
2
2
3
3
...
```

### FlatMap

DataStream → DataStream。接收一个元素并产生0、1或多个元素。 将句子分割成单词的平面映射函数：

```java
dataStream.flatMap(new FlatMapFunction<String, String>() {
    @Override
    public void flatMap(String value, Collector<String> out)
        throws Exception {
        for(String word: value.split(" ")){
            out.collect(word);
        }
    }
});
```



## 6 Data Sinks

Data sinks 使用 DataStream 并将它们转发到文件、套接字、外部系统或打印它们。Flink 自带多种内置的输出格式，封装在 DataStreams 的算子：

- `writeAsText()` / `TextOutputFormat` - 将元素按行写成字符串。通过调用每个元素的 toString() 方法获得字符串。
- `writeAsCsv(...)` / `CsvOutputFormat` - 将元组写成逗号分隔值文件。行和字段的分隔符是可配置的。每个字段的值来自对象的 *toString()* 方法
- `print()` / `printToErr()` - 在标准输出/标准错误流上打印每个元素的 *toString()* 值。 可选地，可以提供一个前缀（msg）附加到输出。这有助于区分不同的 *print* 调用。如果并行度大于1，输出结果将附带输出任务标识符的前缀。
- `writeUsingOutputFormat()` / `FileOutputFormat` - 自定义文件输出的方法和基类。支持自定义 object 到 byte 的转换
- writeToSocket` - 根据 `SerializationSchema` 将元素写入套接字` 
- addSink- 调用自定义 sink function。Flink 捆绑了连接到其他系统（例如 Apache Kafka）的连接器，这些连接器被实现为 sink functions

DataStream 的 `write*()` 主要用于调试。它们不参与 Flink 的 checkpointing，即这些函数通常具有至少有一次语义。刷新到目标系统的数据取决于 OutputFormat 的实现。这意味着并非所有发送到 OutputFormat 的元素都会立即显示在目标系统中。失败情况下，这些记录可能丢失。

为将流可靠、精准一次传输到文件系统，请使用 `FileSink`。通过 `.addSink(...)` 方法调用的自定义实现也可以参与 Flink 的 checkpointing，以实现“精准一次”。

### addSink

调用自定义接收器函数。Flink捆绑了其他系统（如Apache Kafka）的连接器，这些系统实现为接收器函数。

### 实战

Socket发送的数据，把String类型转成对象，然后把Java对象保存至MySQL

新建一个实体类：

```java
package com.javaedge.java.chapter4;

import lombok.Data;

@Data
public class Student {

    private int id;

    private String name;

    private int age;
}
```

MySQL建库建表：

```sql
create database javaedge_flink;

create table student
(
    id   int(11) NOT NULL AUTO_INCREMENT,
    name varchar(25),
    age  int(10),
    primary key (id)
);
```

socket传送数据：

```bash
javaedge@JavaEdgedeMac-mini ~ % nc -lk 7777
1,JavaEdge,18
```

接收：

```java
public class JavaCustomSinkToMySQL {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        DataStreamSource<String> source =  env.socketTextStream("localhost", 7777);

        SingleOutputStreamOperator<Student> studentStream =  source.map(new MapFunction<String, Student>() {
            @Override
            public Student map(String value) throws Exception {
                String[] splits = value.split(",");
                Student stu = new Student();
                stu.setId(Integer.parseInt(splits[0]));
                stu.setName(splits[1]);
                stu.setAge(Integer.parseInt(splits[2]));
                return stu;
            }
        });
        studentStream.addSink(new SinkToMySQL());
        env.execute("JavaCustomSinkToMySQL");
    }
}
```

### 自定义Sink总结

```java
RichSinkFunction<T>
```

T就是你想要写入对象的类型

重写方法：open/ close 生命周期方法

invoke：每条记录执行一次

数据接收器使用DataStream并将它们转发到文件，套接字，外部系统或打印它们。Flink带有各种内置输出格式，这些格式封装在DataStreams上的 算子操作后面：

```
writeAsText()/ TextOutputFormat- 按字符串顺序写入元素。通过调用每个元素的toString（）方法获得字符串。

writeAsCsv(...)/ CsvOutputFormat- 将元组写为逗号分隔值文件。行和字段分隔符是可配置的。每个字段的值来自对象的toString（）方法。

print()/ printToErr() - 在标准输出/标准错误流上打印每个元素的toString（）值。可选地，可以提供前缀（msg），其前缀为输出。这有助于区分不同的打印调用。如果并行度大于1，则输出也将与生成输出的任务的标识符一起添加。

writeUsingOutputFormat()/ FileOutputFormat- 自定义文件输出的方法和基类。支持自定义对象到字节的转换。

writeToSocket - 根据a将元素写入套接字 SerializationSchema

addSink - 调用自定义接收器函数。Flink捆绑了其他系统（如Apache Kafka）的连接器，这些系统实现为接收器函数。

write*()方法DataStream主要用于调试目的。他们没有参与Flink的检查点，这意味着这些函数通常具有至少一次的语义。刷新到目标系统的数据取决于OutputFormat的实现。这意味着并非所有发送到OutputFormat的数据元都会立即显示在目标系统中。此外，在失败的情况下，这些记录可能会丢失。
```

要将流可靠，准确地一次传送到文件系统，请使用flink-connector-filesystem。此外，通过该.addSink(...)方法的自定义实现可以参与Flink的精确一次语义检查点。