# Flink的广播状态（BroadcastState）

## 1 状态的含义

- 广播： 一个值会被广播到所有并行子任务，每个子任务都拥有这个值的一份完整拷贝
- 状态： 该值可被更新和读取
- 动态更新：这个广播的值可在运行时被动态更新，从而影响下游的计算

## 2 图解案例

### 2.1 Flink广播状态工作原理



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/cc858524463c90d6009802baa3288418.png)



- 数据流A：一个不断产生数据的流，这些数据是需要被广播出去的
- 广播：数据流A中的数据被广播到系统中的所有节点或任务
- 数据流B：另一个数据流，这个数据流中的数据会与广播过来的数据进行关联计算
- 更新后的规则配置：表示广播的数据被存储为状态，并且可以动态更新

### 2.2 广播状态的实际意义

#### 全局共享数据

- 数据流A中的数据被广播到所有并行子任务，这意味着每个子任务都可以访问这些数据，实现数据的全局共享。
- 这就好像在每个子任务中都有一份相同的配置表或规则集。

#### 动态更新配置

- 广播的数据可以被动态更新。当数据流A中的数据发生变化时，所有的子任务都会得到最新的数据，从而实现动态配置的更新。
- 这意味着我们可以实时调整系统的行为，而无需重启整个作业。

#### 关联计算

- 数据流B中的数据会与广播过来的数据进行关联计算。
- 例如，数据流B中的每个事件都会与广播的规则配置进行匹配，以决定如何处理该事件。

#### 举个例子

假设数据流A是一系列的规则配置，数据流B是用户行为日志。我们可以将规则配置广播到所有处理用户行为日志的子任务。这样，每个子任务都可以根据最新的规则来判断用户的行为是否符合规则，从而实现实时风控。

## 3 应用场景

- **参数传递：** 将一些配置参数、字典等信息广播到所有并行子任务，以便在处理数据时使用。
- **规则更新：** 动态更新规则，例如风控规则、推荐系统模型等，无需重启作业。
- **控制流：** 通过广播状态来控制下游算子的行为，比如暂停、恢复等。
- **规则引擎:** 动态更新规则，实现实时风控、推荐等。
- **参数配置:** 将全局配置参数广播到所有任务，实现统一配置管理。
- **维表关联:** 将维表数据广播到所有任务，实现实时关联计算。
- **状态同步:** 将状态信息广播到所有任务，实现状态同步。

## 4 优势

- **方便参数共享：** 无需通过数据流传递参数，简化了编程模型。
- **动态更新：** 可以根据需要动态调整系统行为，提高系统的灵活性。
- **高效：** 广播操作通常比通过数据流传递参数更加高效。

## 5 使用

Flink 中使用广播状态（BroadcastState）的三个基本步骤。

### 5.1 定义广播流的数据格式

首先，明确要广播的数据的类型，即广播流中的数据格式。这通常涉及定义一个 POJO或一个 case class，来表示广播的数据。如要广播一个包含用户ID和对应权限的配置，就可定义一个 UserPermission 类。

### 5.2 定义新的数据流，注册为广播流

- 创建一个新的数据流，这个数据流的数据就是我们要广播的数据
- 将这个数据流标记为广播流
- Flink 会将这个广播流中的数据广播到所有并行子任务中，每个子任务都有一份完整的副本

### 5.3 连接广播流和处理数据的流

- 将广播流和需要处理的数据流进行连接
- 在连接的过程中，广播流的数据会被广播到下游的每个并行子任务
- 下游任务可以通过上下文（Context）获取到广播的状态，然后在处理数据时使用

### 示例

```java
// 1. 定义广播流的数据格式
public static class UserPermission {
    public String userId;

    public List<String> permissions;
}

// 2. 定义新的数据流，注册为广播流
DataStream<UserPermission> broadcastStream = ...;
broadcastStream = broadcastStream.broadcast(new BroadcastStateDescriptor<>("userPermissions", UserPermission.class));

// 3. 连接广播流和处理数据的流
DataStream<Event> resultStream = eventStream.connect(broadcastStream)
    .process(new CoProcessFunction<Event, UserPermission, String>() {
        // ...
        @Override
        public void processElement1(Event event, ReadOnlyContext ctx, Collector<String> out) throws Exception {
            // 获取广播状态
            MapStateDescriptor<String, List<String>> desc = new MapStateDescriptor<>("userPermissions", String.class, List.class);
            ReadOnlyMapState<String, List<String>> broadcastState = ctx.getBroadcastState(desc);
            // ...
        }
    });
```

## 6 注意

- 广播状态适合于数据量较小、更新频率不高的场景。
- 对于大规模的数据广播，可能会对性能产生影响。
- 广播状态的更新会触发所有并行子任务的更新，因此需要谨慎使用。

## 7 总结

广播状态是 Flink 中一个非常有用的特性，它可以将一些全局信息高效地传播到所有并行子任务，从而实现灵活的控制和参数共享。使我们能够在分布式系统中实现高效的数据共享和动态配置更新。

需要动态更新的应用场景中的适用性，当你的应用需要频繁地调整参数或规则时，广播状态是一个很好的选择。