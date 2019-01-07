基于最新的release-4.7.1代码分析。

- 客户端是个单独模块，在rocketmq/client
![](https://img-blog.csdnimg.cn/20200810004153816.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)


# 从UT看Producer API

阅读源码，不推荐从入口开始看到底，毕竟你也看不到底。而应该带着问题分析源码：Producer是如何发消息的。

推荐从UT单元测试用例入手。因为UT用例都是测试代码中的一个小流程。
规范的开源框架，单元测试覆盖率都很高，很容易找到我们所需流程所对应的用例。因此从这些用例入手，调试跟踪调用栈，看清关键代码流程。

先分析一下RocketMQ客户端的单元测试，看看Producer API应该如何使用。

Producer的所有测试用例都在同个测试类 DefaultMQProducerTest，可以了解到Producer的主要功能。

- 主要测试用例
![](https://img-blog.csdnimg.cn/20200810010435935.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
init和terminate是测试开始初始化和测试结束销毁时需要执行的代码
testXXX方法都是各种场景发消息的测试用例

- Producer相关的核心类和接口
![](https://img-blog.csdnimg.cn/2020081000535348.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

- 门面模式（Facade Pattern）
给客户端提供了一个可以访问系统的接口，隐藏系统内部的复杂性。

接口MQProducer就是门面，客户端只要使用这个接口就可以访问Producer实现消息发送的相关功能，使用上不必再与其他复杂实现类打交道。

类DefaultMQProducer实现了接口MQProducer，方法实现大多没有业务逻辑，只是封装对其他实现类的方法调用，也可视为是门面。
Producer大部分业务逻辑实现都在类DefaultMQProducerImpl。

有时实现分散在很多内部类，不方便用接口来对外提供服务，就可仿照RocketMQ，使用门面模式隐藏内部实现，对外提供服务。

- 接口MQAdmin定义了一些元数据管理的方法，在消息发送过程会用到。
![](https://img-blog.csdnimg.cn/20200810011148410.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

# 启动过程
通过单元测试中的代码可以看到，在init()和terminate()这两个测试方法中，分别执行了Producer的start和shutdown方法。
说明RocketMQ Producer是个有状态服务，在发送消息前需要先启动Producer。这个启动过程，实际上就是为了发消息做的准备工作，所以，在分析发消息流程之前，我们需要先理清Producer中维护了哪些状态，在启动过程中，Producer都做了哪些初始化的工作。有了这个基础才能分析其发消息的实现流程。

## init()
![](https://img-blog.csdnimg.cn/20200810011454369.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- 创建DefaultMQProducer实例
- 设置一些参数值
- 然后调用start。

跟进start方法的实现，继续分析其初始化过程。

- DefaultMQProducer#start()直接调用DefaultMQProducerImpl#start()
![](https://img-blog.csdnimg.cn/20200811015222932.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200811015357340.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2020081102080787.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

RocketMQ使用一个成员变量serviceState来记录和管理自身的服务状态，这实际上是(State Pattern)设计模式的变体。
状态模式允许一个对象在其内部状态改变时改变它的行为，对象看起来就像是改变了它的类。
与标准的状态模式不同的是，它没有使用状态子类，而是使用分支流程（switch-case）来实现不同状态下的不同行为，在管理比较简单的状态时，使用这种设计会让代码更加简洁。这种模式非常广泛地用于管理有状态的类，推荐你在日常开发中使用。

在设计状态的时候，有两个要点是需要注意的
1. 不仅要设计正常的状态，还要设计中间状态和异常状态，否则，一旦系统出现异常，你的状态就不准确了，很难处理这种异常状态。比如在这段代码中，RUNNING和SHUTDOWN_ALREADY是正常状态，CREATE_JUST是一个中间状态，START_FAILED是一个异常状态。
2. 这些状态之间的转换路径考虑清楚，并在进行状态转换的时候，检查上一个状态是否能转换到下一个状态。
比如这里，只有处于CREATE_JUST态才能转为RUNNING状，可确保这服务一次性，只能启动一次。避免了多次启动服务。

# 启动过程的实现：
1. 通过一个单例模式（Singleton Pattern）的MQClientManager获取MQClientInstance的实例mQClientFactory，没有则自动创建新的实例
2. 在mQClientFactory中注册自己
3. 启动mQClientFactory
4. 给所有Broker发送心跳。

其中实例mQClientFactory对应的类MQClientInstance是RocketMQ客户端中的顶层类，大多数情况下，可以简单地理解为每个客户端对应类MQClientInstance的一个实例。这个实例维护着客户端的大部分状态信息，以及所有的Producer、Consumer和各种服务的实例，想要学习客户端整体结构的同学可以从分析这个类入手，逐步细化分析下去。

我们进一步分析一下MQClientInstance#start()中的代码：
![](https://img-blog.csdnimg.cn/20200811021928563.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

- DefaultMQProducerImpl：Producer的内部实现类，大部分Producer的业务逻辑，也就是发消息的逻辑，都在这类。
![](https://img-blog.csdnimg.cn/20200811022137241.png)

- MQClientInstance：封装了客户端一些通用的业务逻辑，无论是Producer还是Consumer，最终需要与服务端交互时，都需要调用这个类中的方法

- MQClientAPIImpl：这个类中封装了客户端服务端的RPC，对调用者隐藏了真正网络通信部分的具体实现
- NettyRemotingClient：RocketMQ各进程之间网络通信的底层实现类
![](https://img-blog.csdnimg.cn/20200811022346818.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

# 消息发送过程
接下来我们一起分析Producer发送消息的流程。

在Producer的接口MQProducer中，定义了19个不同参数的发消息的方法，按照发送方式不同可以分成三类：

单向发送（Oneway）：发送消息后立即返回，不处理响应，不关心是否发送成功；
同步发送（Sync）：发送消息后等待响应；
异步发送（Async）：发送消息后立即返回，在提供的回调方法中处理响应。
这三类发送实现基本上是相同的，异步发送稍微有一点儿区别，我们看一下异步发送的实现方法"DefaultMQProducerImpl#send()"（对应源码中的1132行）：

```java
@Deprecated
public void send(final Message msg, final MessageQueueSelector selector, final Object arg, final SendCallback sendCallback, final long timeout)
    throws MQClientException, RemotingException, InterruptedException {
    final long beginStartTime = System.currentTimeMillis();
    ExecutorService executor = this.getAsyncSenderExecutor();
    try {
        executor.submit(new Runnable() {
            @Override
            public void run() {
                long costTime = System.currentTimeMillis() - beginStartTime;
                if (timeout > costTime) {
                    try {
                        try {
                            sendSelectImpl(msg, selector, arg, CommunicationMode.ASYNC, sendCallback,
                                timeout - costTime);
                        } catch (MQBrokerException e) {
                            throw new MQClientException("unknownn exception", e);
                        }
                    } catch (Exception e) {
                        sendCallback.onException(e);
                    }
                } else {
                    sendCallback.onException(new RemotingTooMuchRequestException("call timeout"));
                }
            }

        });
    } catch (RejectedExecutionException e) {
        throw new MQClientException("exector rejected ", e);
    }
}
```

我们可以看到，RocketMQ使用了一个ExecutorService来实现异步发送：使用asyncSenderExecutor的线程池，异步调用方法sendSelectImpl()，继续发送消息的后续工作，当前线程把发送任务提交给asyncSenderExecutor就可以返回了。单向发送和同步发送的实现则是直接在当前线程中调用方法sendSelectImpl()。

我们来继续看方法sendSelectImpl()的实现：

```java
// 省略部分代码
MessageQueue mq = null;

// 选择将消息发送到哪个队列（Queue）中
try {
    List<MessageQueue> messageQueueList =
        mQClientFactory.getMQAdminImpl().parsePublishMessageQueues(topicPublishInfo.getMessageQueueList());
    Message userMessage = MessageAccessor.cloneMessage(msg);
    String userTopic = NamespaceUtil.withoutNamespace(userMessage.getTopic(), mQClientFactory.getClientConfig().getNamespace());
    userMessage.setTopic(userTopic);

    mq = mQClientFactory.getClientConfig().queueWithNamespace(selector.select(messageQueueList, userMessage, arg));
} catch (Throwable e) {
    throw new MQClientException("select message queue throwed exception.", e);
}

// 省略部分代码

// 发送消息
if (mq != null) {
    return this.sendKernelImpl(msg, mq, communicationMode, sendCallback, null, timeout - costTime);
} else {
    throw new MQClientException("select message queue return null.", null);
}
// 省略部分代码
```

方法sendSelectImpl()中主要的功能就是选定要发送的队列，然后调用方法sendKernelImpl()发送消息。

选择哪个队列发送由MessageQueueSelector#select决定。
RocketMQ使用策略模式解决不同场景下需要使用不同队列选择算法问题。

RocketMQ提供了很多MessageQueueSelector的实现，例如随机选择策略，哈希选择策略和同机房选择策略等
![](https://img-blog.csdnimg.cn/20200812191539598.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

也可以自己实现选择策略。如果要保证相同key消息的严格顺序，你需要使用哈希选择策略，或提供一个自己实现的选择策略。

再看方法
# sendKernelImpl()
构建发送消息的
- 请求头部 RequestHeader
![](https://img-blog.csdnimg.cn/20200812200019102.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

- 上下文SendMessageContext
![](https://img-blog.csdnimg.cn/2020081220020479.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)


然后调用方法MQClientAPIImpl#sendMessage()，将消息发送给队列所在Broker。
![](https://img-blog.csdnimg.cn/20200812200447525.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

至此，消息被发送给远程调用的封装类MQClientAPIImpl，完成后续序列化和网络传输等步骤。

RocketMQ的Producer无论同步还是异步发送消息，都统一到了同一流程。
异步发送消息的实现，也是通过一个线程池，在异步线程执行的调用和同步发送相同的底层方法来实现的。

- 方法的一个参数区分同步or异步发送
这使得整个流程统一，很多同步异步代码可复用，代码结构清晰简单，易维护。

使用同步发送，当前线程会阻塞等待服务端的响应，直到收到响应或者超时方法才会返回，所以在业务代码调用同步发送的时候，只要返回成功，消息就一定发送成功了。
而异步发送，发送的逻辑都是在Executor的异步线程中执行的，所以不会阻塞当前线程，当服务端返回响应或者超时之后，Producer会调用Callback方法来给业务代码返回结果。业务代码需要在Callback中来判断发送结果。

# 总结
本文分析了RocketMQ客户端消息生产的实现过程，包括Producer初始化和发送消息的主流程。Producer中包含的几个核心的服务都是有状态的，在Producer启动时，由MQClientInstance类中来统一启动。

在发送消息的流程中，RocketMQ分了三种发送方式：
1. 单向
2. 同步
3. 异步


这三种发送方式对应的发送流程基本相同，同步和异步发送由已封装好的MQClientAPIImpl类分别实现。

# 面试场景快问快答
- DefaultMQProducer有个属性defaultTopicQueueNums，它是用来设置topic的ConsumeQueue的数量的吗？有同学可能认为consumeQueue的数量是创建topic的时候指定的，跟producer没有关系，那这参数有什么用呢？
这参数是控制客户端在生产消费的时候会访问同一个主题的队列数量，假设一个主题有100个队列，对每个客户端，它没必要100个队列都访问，只需使用其中几个队列。

- 在RocketMq的控制台上可以创建topic，需要指定writeQueueNums，readQueueNums，perm，这三个参数是有什么用呢？这里为什么要区分写跟读队列呢？不应该只有一个consumeQueue？
writeQueueNums和readQueueNums是在服务端来控制每个客户端在生产和消费的时候，分别访问多少个队列。这两参数是服务端参数，优先级高于客户端控制的参数defaultTopicQueueNums的。perm是设置Topic读写等权限的参数。

- 用户请求-->异步处理--->用户收到响应结果。异步处理的作用是：用更少的线程来接收更多的用户请求，然后异步处理业务逻辑。异步处理完后，如何将结果通知给原先的用户呢？即使有回调接口，我理解也是给用户发个短信之类的处理，那结果怎么返回到定位到用户，并返回之前请求的页面上呢？需要让之前的请求线程阻塞吗？那也无法达到【用更少的线程来接收更多的用户请求】的目的丫。
如果局限于：“APP/浏览器 --[http协议]-->web 服务”这样的场景，受限于http协议，前端和web服务的交互一定是单向和同步的。一定要等待结果然后返回响应，但是，这种情况仍然可以使用异步方法。像spring web这种框架，它把处理web请求都给你封装好了，你只要写个handler很方便。但这handler只能是一个同步方法，它必须在返回值中给出响应结果，所以导致很多同学思维转不过来。