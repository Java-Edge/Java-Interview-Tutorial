# 1  概述

Flink中的DataStream程序是实现数据流转换的常规程序（例如，过滤，更新状态，定义窗口，聚合）。 

最初从各种源（例如，消息队列，套接字流，文件）创建数据流。 

结果通过接收器返回，接收器可以例如将数据写入文件或标准输出（例如命令行终端）。 

Flink程序可以在各种环境中运行，独立运行或嵌入其他程序中。 执行可以在本地JVM中执行，也可以在许多计算机的集群上执行。

- 有关Flink API基本概念的介绍，请参阅
[基本概念](https://blog.csdn.net/qq_33589510/article/details/89893394)

# 2 入门案例

以下程序是流窗口字数统计应用程序的完整工作示例，它在5秒窗口中对来自Web套接字的单词进行计数。 您可以复制并粘贴代码以在本地运行它。

```
import org.apache.flink.api.common.functions.FlatMapFunction;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.windowing.time.Time;
import org.apache.flink.util.Collector;

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

```
nc -lk 9999
```

只需键入一些单词就可以返回一个新单词。 这些将是字数统计程序的输入。 如果要查看大于1的计数，请在5秒内反复键入相同的单词（如果不能快速输入，则将窗口大小从5秒增加☺）。

- Socket输入
![](https://ask.qcloudimg.com/http-save/1752328/wzmcioxeij.png)
- 程序输出
![](https://ask.qcloudimg.com/http-save/1752328/ssb0i8ncgh.png)

创建一个新数据流，其中包含从套接字无限接收的字符串。 接收的字符串由系统的默认字符集解码，使用“\ n”作为分隔符。 当socket关闭时，阅读器立即终止。![](https://ask.qcloudimg.com/http-save/1752328/ezbqvit9ec.png)

- Scala版本
![](https://ask.qcloudimg.com/http-save/1752328/xn76h3cjx7.png)3 Data source源是您的程序从中读取输入的位置。可以使用
`StreamExecutionEnvironment.addSource（sourceFunction）`
将源附加到程序
Flink附带了许多预置实现的源函数，但你可以通过为非并行源实现SourceFunction，或者通过实现ParallelSourceFunction接口或为并行源扩展RichParallelSourceFunction来编写自己的自定义源。

可以从`StreamExecutionEnvironment`访问几个预定义的流源：

## 3.1 基于文件

- readTextFile(path)
TextInputFormat逐行读取文本文件，即符合规范的文件，并将它们作为字符串返回。
- readFile(fileInputFormat, path)
按指定的文件输入格式指定读取（一次）文件。
- readFile(fileInputFormat, path, watchType, interval, pathFilter, typeInfo) 
这是前两个内部调用的方法。它path根据给定的内容读取文件fileInputFormat。根据提供的内容watchType，此源可以定期监视（每intervalms）新数据（FileProcessingMode.PROCESS\_CONTINUOUSLY）的路径，或者处理当前在路径中的数据并退出（FileProcessingMode.PROCESS\_ONCE）。使用该pathFilter，用户可以进一步排除正在处理的文件。

### _实现：_

在引擎盖下，Flink将文件读取过程分为两个子任务

- 目录监控
- 数据读取

这些子任务中的每一个都由单独的实体实现。监视由单个非并行（并行性= 1）任务实现，而读取由并行运行的多个任务执行。

后者的并行性等于工作并行性。单个监视任务的作用是扫描目录（定期或仅一次，具体取决于watchType），找到要处理的文件，将它们分层分割，并将这些拆分分配给下游读卡器。读者是那些将阅读实际数据的人。每个分割仅由一个读取器读取，而读取器可以逐个读取多个分割。

> 如果watchType设置为FileProcessingMode.PROCESS\_CONTINUOUSLY，则在修改文件时，将完全重新处理其内容。这可以打破“完全一次”的语义，因为在文件末尾追加数据将导致其所有内容被重新处理。
> 如果watchType设置为FileProcessingMode.PROCESS\_ONCE，则源扫描路径一次并退出，而不等待读者完成读取文件内容。当然读者将继续阅读，直到读取所有文件内容。在该点之后关闭源将导致不再有检查点。这可能会导致节点发生故障后恢复速度变慢，因为作业将从上一个检查点恢复读取。

## 3.2 基于Socket

- socketTextStream
从套接字读取。数据元可以用分隔符分隔。

## 3.3 基于集合

- fromCollection(Collection) 
从Java Java.util.Collection创建数据流。集合中的所有数据元必须属于同一类型。
- fromCollection(Iterator, Class) 
从迭代器创建数据流。该类指定迭代器返回的数据元的数据类型。
- fromElements(T ...) 
从给定的对象序列创建数据流。所有对象必须属于同一类型。
- fromParallelCollection(SplittableIterator, Class) 
并行地从迭代器创建数据流。该类指定迭代器返回的数据元的数据类型。
- generateSequence(from, to) 
并行生成给定间隔中的数字序列。

## 3.4 自定义数据源方式SourceFunction

使用用户定义的源函数为任意源功能创建DataStream。 

默认情况下，源具有1的并行性。

![](https://ask.qcloudimg.com/http-save/1752328/aglj65lb5h.png)

![](https://ask.qcloudimg.com/http-save/1752328/0b29ukasfv.png)

要启用并行执行，用户定义的源应

- 实现`ParallelSourceFunction`
![](https://ask.qcloudimg.com/http-save/1752328/1d3ajh06li.png)
![](https://ask.qcloudimg.com/http-save/1752328/xyiokn5hcj.png)
- 或继承`RichParallelSourceFunction`
![](https://ask.qcloudimg.com/http-save/1752328/gbeg7rej32.png)
![](https://ask.qcloudimg.com/http-save/1752328/3w96cgk7yj.png)
在这些情况下，生成的源将具有环境的并行性。
要改变它，然后调用`DataStreamSource.setParallelism（int）`
![](https://ask.qcloudimg.com/http-save/1752328/ngazuing2r.png)
- addSource
附加新的源函数。例如，要从Apache Kafka中读取，您可以使用 addSource(new FlinkKafkaConsumer08<>(...))

![](https://ask.qcloudimg.com/http-save/1752328/7e98to58pr.png)

![](https://ask.qcloudimg.com/http-save/1752328/ia5pp14jlo.png)

![](https://ask.qcloudimg.com/http-save/1752328/k887l5m0dg.png)

# 4 算子

算子将一个或多个DataStream转换为新的DataStream。程序可以将多个转换组合成复杂的数据流拓扑。

本节介绍了基本转换，应用这些转换后的有效物理分区以及对Flink 算子链接的见解。

## 4.1 filter

DataStream→DataStream

- 计算每个数据元的布尔函数，并保存函数返回true的数据元。过滤掉零值的过滤器
![](https://ask.qcloudimg.com/http-save/1752328/2g5g1jyunq.png)
- Scala![](https://ask.qcloudimg.com/http-save/1752328/szggznqgpl.png) 
- Java![](https://ask.qcloudimg.com/http-save/1752328/oerailqvch.png)4.2 unionDataStream \*→DataStream

两个或多个数据流的联合，创建包含来自所有流的所有数据元的新流

> 如果将数据流与自身联合，则会在结果流中获取两次数据元
> ![](https://ask.qcloudimg.com/http-save/1752328/n3ehjmf4dv.png)

- Scala
![](https://ask.qcloudimg.com/http-save/1752328/mlayom53vm.png)
- Java
![](https://ask.qcloudimg.com/http-save/1752328/j5heov3nz4.png)

## split拆分

DataStream→SplitStream

根据某些标准将流拆分为两个或更多个流。

![](https://ask.qcloudimg.com/http-save/1752328/b7s3sdx7s5.png)

## select

SplitStream→DataStream

从拆分流中选择一个或多个流。

![](https://ask.qcloudimg.com/http-save/1752328/3hzr045qzz.png)

- Scala
![](https://ask.qcloudimg.com/http-save/1752328/reqekv0nc3.png)
- Java
![](https://ask.qcloudimg.com/http-save/1752328/epk90u1n9a.png)

# 5 Data Sinks

数据接收器使用DataStream并将它们转发到文件，套接字，外部系统或打印它们。Flink带有各种内置输出格式，这些格式封装在DataStreams上的算子操作后面：

- writeAsText()/ TextOutputFormat
按字符串顺序写入数据元。通过调用每个数据元的toString（）方法获得字符串。
- writeAsCsv(...)/ CsvOutputFormat
将元组写为逗号分隔值文件。行和字段分隔符是可配置的。每个字段的值来自对象的toString（）方法。
- print()/ printToErr() 
在标准输出/标准错误流上打印每个数据元的toString（）值。可选地，可以提供前缀（msg），其前缀为输出。这有助于区分不同的打印调用。如果并行度大于1，则输出也将与生成输出的任务的标识符一起添加。
- writeUsingOutputFormat()/ FileOutputFormat
自定义文件输出的方法和基类。支持自定义对象到字节的转换。
- writeToSocket
根据一个套接字将数据元写入套接字 SerializationSchema
- addSink
调用自定义接收器函数。Flink捆绑了其他系统（如Apache Kafka）的连接器，这些系统实现为接收器函数。

数据接收器使用DataStream并将它们转发到文件，套接字，外部系统或打印它们。Flink带有各种内置输出格式，这些格式封装在DataStreams上的 算子操作后面：

writeAsText()/ TextOutputFormat- 按字符串顺序写入元素。通过调用每个元素的toString（）方法获得字符串。

writeAsCsv(...)/ CsvOutputFormat- 将元组写为逗号分隔值文件。行和字段分隔符是可配置的。每个字段的值来自对象的toString（）方法。

print()/ printToErr() - 在标准输出/标准错误流上打印每个元素的toString（）值。可选地，可以提供前缀（msg），其前缀为输出。这有助于区分不同的打印调用。如果并行度大于1，则输出也将与生成输出的任务的标识符一起添加。

writeUsingOutputFormat()/ FileOutputFormat- 自定义文件输出的方法和基类。支持自定义对象到字节的转换。

writeToSocket - 根据a将元素写入套接字 SerializationSchema

addSink - 调用自定义接收器函数。Flink捆绑了其他系统（如Apache Kafka）的连接器，这些系统实现为接收器函数。

请注意，write\*()方法DataStream主要用于调试目的。他们没有参与Flink的检查点，这意味着这些函数通常具有至少一次的语义。刷新到目标系统的数据取决于OutputFormat的实现。这意味着并非所有发送到OutputFormat的数据元都会立即显示在目标系统中。此外，在失败的情况下，这些记录可能会丢失。

要将流可靠，准确地一次传送到文件系统，请使用flink-connector-filesystem。此外，通过该.addSink(...)方法的自定义实现可以参与Flink的精确一次语义检查点。

# 参考

[DataStream API](https://ci.apache.org/projects/flink/flink-docs-master/dev/datastream_api.html)