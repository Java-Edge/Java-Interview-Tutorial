# RabbitMQ的 RPC 消息模式你会了吗？

前文学习了如何使用工作队列在多个工作者之间分配耗时的任务。若需要在远程计算机上运行一个函数并等待结果呢？这种模式通常被称为**远程过程调用** (RPC)。

本节使用 RabbitMQ 构建一个 RPC 系统：一个客户端和一个可扩展的 RPC 服务器。由于我们没有耗时的任务可以分配，因此我们将创建一个返回斐波那契数的虚拟 RPC 服务。

### 客户端接口

创建一个简单的客户端类，暴露 `call` 方法，该方法发送一个 RPC 请求并阻塞，直到收到响应：

```java
FibonacciRpcClient fibonacciRpc = new FibonacciRpcClient();
String result = fibonacciRpc.call("4");
System.out.println("fib(4) 是 " + result);
```

> 虽然 RPC 是计算中很常见的模式，但它经常受到批评。问题在于当程序员不确定函数调用是本地调用还是缓慢的 RPC 调用时，会引发困惑。这种混淆会导致系统不可预测，并增加调试的复杂性。错误使用 RPC 不仅没有简化软件，反而可能导致难以维护的“代码结构混乱”。
> 鉴于此，请遵循以下建议：
> 确保明确区分本地函数调用和远程函数调用。
> 记录你的系统，使组件之间的依赖关系清晰。
> 处理错误情况。例如，当 RPC 服务器长时间不可用时，客户端应如何响应？
> 如有疑虑，请尽量避免使用 RPC。如果可能，应该使用异步管道——与 RPC 类似的阻塞操作不同，结果将被异步推送到下一个计算阶段。

### 回调队列

在 RabbitMQ 上实现 RPC 很简单。客户端发送一个请求消息，服务器通过响应消息进行回复。为接收响应，需要在请求中附上一个“回调”队列地址。可用默认的队列（在 Java 客户端中是独占的）。试试这个代码：

```java
callbackQueueName = channel.queueDeclare().getQueue();

BasicProperties props = new BasicProperties.Builder()
    .replyTo(callbackQueueName)
    .build();

channel.basicPublish("", "rpc_queue", props, message.getBytes());
// ...然后从 callback_queue 读取响应消息...
```

需要导入：

```java
import com.rabbitmq.client.AMQP.BasicProperties;
```

> 消息属性
> AMQP 0-9-1 协议预定义了一组 14 个与消息一起发送的属性。大多数属性很少使用，以下属性是常用的：
> `deliveryMode`：标记消息为持久 (值为 `2`) 或瞬时 (其他值) 的模式
> `contentType`：用于描述编码的 mime 类型。例如，对于常用的 JSON 编码，建议将此属性设置为：`application/json`
> `replyTo`：通常用于命名回调队列
> `correlationId`：用于将 RPC 响应与请求相关联

### Correlation Id

在前面提到的方法中，我们建议为每个 RPC 请求创建一个回调队列。这很低效，但幸好有一个更好的方法——为每个客户端创建一个回调队列。

这会引发一个新问题：在回调队列中收到响应时，不清楚该响应属于哪个请求。这时 `correlationId` 属性派上用场。为每个请求设置一个唯一值。稍后，回调队列中收到消息时，看此属性，并根据它来匹配响应和请求。如看到一个未知 `correlationId` 值，可以安全地丢弃消息——它不属于我们的请求。

为啥应该忽略回调队列中的未知消息，而不非直接失败？因为服务器端可能会发生竞态条件。虽然不太可能，但可能 RPC 服务器在发送完答案后崩溃，但在为请求发送确认消息之前就崩溃了。如果发生这种情况，重启后的 RPC 服务器将重新处理该请求。因此，客户端的我们必须优雅地处理重复的响应，RPC 最好是幂等的。

### 总结

RPC模式工作流程：

- 对于一个 RPC 请求，客户端发送一条带有两个属性的消息：`replyTo`，其值设置为为该请求创建的匿名独占队列；`correlationId`，其值为每个请求设置的唯一标识。
- 请求被发送到 `rpc_queue` 队列。
- RPC 工作者（即服务器）在该队列上等待请求。一旦收到请求，它将完成任务，并通过 `replyTo` 字段指定的队列将结果发送回客户端。
- 客户端在回复队列中等待数据。当消息到达时，它检查 `correlationId` 属性。如果匹配请求中的值，它将响应返回给应用程序。

### 实现全流程

斐波那契任务：

```java
private static int fib(int n) {
    if (n == 0) return 0;
    if (n == 1) return 1;
    return fib(n-1) + fib(n-2);
}
```

我们定义了斐波那契函数。该函数假设只接收有效的正整数输入。（对于较大数字，该算法效率较低，它可能是最慢的递归实现。）

服务器代码可在此处找到：[RPCServer.java](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java/RPCServer.java)。

客户端代码略显复杂，完整的示例源代码可参考 [RPCClient.java](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java/RPCClient.java)。

编译并设置类路径：

```bash
javac -cp $CP RPCClient.java RPCServer.java
```

我们的 RPC 服务现在已准备就绪。启动服务器：

```bash
java -cp $CP RPCServer
# => [x] 正在等待 RPC 请求
```

要请求斐波那契数，运行客户端：

```bash
java -cp $CP RPCClient
# => [x] 请求 fib(30)
```

此处展示的设计并非 RPC 服务的唯一实现方式，但它有以下优势：

- 如果 RPC 服务器太慢，你可以通过运行另一个服务器实例进行扩展。试着在新的控制台中运行第二个 `RPCServer`。
- 在客户端，RPC 只需发送和接收一条消息。无需像 `queueDeclare` 这样的同步调用。因此，RPC 客户端只需一个网络往返即可完成一次 RPC 请求。

代码仍然相对简单，并未尝试解决更复杂但重要的问题，如：

- 如果没有服务器运行，客户端应该如何响应？
- RPC 是否需要某种超时机制？
- 如果服务器发生故障并引发异常，是否应该将其转发给客户端？
- 在处理消息前，是否应检查其有效性（如范围、类型）以防止无效消息的进入？