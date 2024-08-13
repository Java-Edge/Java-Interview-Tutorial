# Flink部署及任务提交

## 1 本地安装

只需几个简单的步骤即可启动并运行Flink示例程序。

### 1.1 安装：下载并启动Flink

Java 8。
直接下载flink二进制包到本地并解压。

## 2 配置  flink-conf.yaml

jobmanager.rpc.address: 10.0.0.1  配置主节点的ip

jobmanager   主节点
taskmanager  从节点

### 配置. bash_profile

```bash
vim ~/.bash_profile

# Flink
export FLINK_HOME=/Users/javaedge/Downloads/soft/flink-1.17.0
export PATH=$FLINK_HOME/bin:$PATH

source ~/.bash_profile
```

## 3 启动集群

```bash
$ flink-1.17.0 % cd bin
$ bin % ./start-cluster.sh
Starting cluster.
Starting standalonesession daemon on host JavaEdgedeMac-mini.local.
Starting taskexecutor daemon on host JavaEdgedeMac-mini.local.
# 验证集群启动成功
$ jps
```

![](https://img-blog.csdnimg.cn/e5a1cdcd747144ffa9d42b9393c01b2e.png)

## 4 提交任务

先启动一个 socket 传输：

````bash
$ nc -lk 9527
javaedge
666
888
````

再提交任务：

```bash
./flink run -c org.apache.flink.streaming.examples.socket.SocketWindowWordCount ../examples/streaming/SocketwindowWordCount.jar --hostname localhost --port 9527
```

打开[控制台](http://localhost:18081)，可见有个运行中任务了：

![](https://img-blog.csdnimg.cn/531cf22842a342cd868a796a821fbe1d.png)

![](https://img-blog.csdnimg.cn/5dedc9a9132b4437a49e0dd51938404c.png)

![](https://img-blog.csdnimg.cn/8200b82d10ed49f58346af85a8631e04.png)

任务执行结果：

![](https://img-blog.csdnimg.cn/a7d4c2ddfce449ceaf7710542fb4c055.png)

## 5 并行度

任务执行时，将一个任务划分为多个并行子任务来执行的能力。

- Flink中每个并行子任务被称为一个Task
- 整个任务则被称为一个Job

### 5.1 env全局设置

使用`StreamExecutionEnvironment` 对象设置并行度，影响该环境中所有算子的并行度：

```java
final ExecutionEnvironment env = ExecutionEnvironment.getExecutionEnvironment();
env.setParallelism(4);
```

### 5.2 算子级别设置

直接在算子上设置并行度，这会覆盖全局设置的并行度。

每个算子都可以单独设置并行度, 1个job可以包含不同的并行度。

```java
final DataStream<String> input = env.addSource(new FlinkKafkaConsumer010<>("topic", new SimpleStringSchema(), props));
input.flatMap(new MyFlatMapFunction()).setParallelism(2).print();
```

### 5.3 配置文件级别

flink-conf.yaml

### 5.4 Client 级别

任务提交的命令行进行设置

### 5.5 并行度越大越好吗？

设置要根据具体场景和资源而调整：

- 过高的并行度可能会导致资源浪费和性能下降
- 过低的并行度可能会导致无法充分利用资源，影响任务的执行效率

```bash
./flink run -c org.apache.flink.streaming.examples.socket.SocketWindowWordCount -p 2  ../examples/streaming/SocketwindowWordCount.jar --hostname localhost --port 9527
```