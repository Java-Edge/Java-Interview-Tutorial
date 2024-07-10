# 用了这么久的RabbitMQ异步编程竟然都是错的

优质项目一般都由同步、异步和定时任务三种处理模式相辅相成。当属异步编程充满坑点。

## 1 适用场景

### 1.1 服务于主流程的分支流程

注册流程，数据写DB是主流程，但注册后给用户发优惠券或欢迎短信的操作是分支流程，时效性不强，可异步。

### 1.2 用户无需实时看到结果的流程

如下单后的配货、送货流程完全可异步处理，每个阶段处理完成后，再给用户发推送或短信让用户知晓即可。

### 1.3 MQ

任务的缓冲的分发，流量削峰、服务解耦和消息广播。

当然了异步处理不仅仅是通过 MQ 来实现，还有其他方式

- 比如开新线程执行，返回 Future
- 还有各种异步框架，比如 Vertx，它是通过 callback 的方式实现

## 2 异步处理之坑

异步处理流程的：

- 可靠性问题
- 消息发送模式的区分问题
- 大量死信消息堵塞队列的问题

为方便操作，本文MQ选型RabbitMQ。

### 2.1 异步处理需要消息补偿闭环

RabbitMQ虽可将消息落地磁盘，即使MQ异常，消息数据也不会丢失，但异步流程在消息发送、传输、处理等环节，都可能消息丢失。MQ都无法确保百分百可用，业务设计必须考虑不可用时，异步流程该如何继续。

因此，异步处理流程，须考虑**补偿或建立主备双活流程**。

#### 2.1.1 案例

用户注册后异步发送欢迎消息：

- 用户注册落DB为同步流程

- 会员服务收到消息后发送欢迎消息为异步流程

![](https://img-blog.csdnimg.cn/20201127221717165.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 蓝线
  MQ异步处理（主线），消息可能丢失（虚线代表异步调用）
- 绿线
  补偿Job定期消息补偿（备线），以补偿主线丢失的消息
- 考虑到极端的MQ中间件失效的情况
  要求备线的处理吞吐能力达到主线性能

#### 代码示例

- UserController 注册+发送异步消息。注册方法，一次性注册10个用户，用户注册消息不能发送出去的概率为50%。
  ![](https://img-blog.csdnimg.cn/20201127223505740.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- MemberService 会员服务监听用户注册成功的消息，并发送欢迎短信。使用ConcurrentHashMap存放那些发过短信的用户ID实现幂等，避免相同的用户补偿时重复发短信
  ![](https://img-blog.csdnimg.cn/20201127223957666.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


对于MQ消费程序，处理逻辑务必考虑去重（支持幂等）因为：

- MQ消息可能会因为中间件本身配置错误、稳定性等原因出现重复
- 自动补偿重复，比如本例，同一条消息可能既走MQ也走补偿，肯定会出现重复，而且考虑到高内聚，补偿Job本身不会做去重处理
- 人工补偿重复。出现消息堆积时，异步处理流程必然会延迟。如果我们提供了通过后台进行补偿的功能，那么在处理遇到延迟的时候，很可能会先进行人工补偿，过了一段时间后处理程序又收到消息了，重复处理。我之前就遇到过一次由MQ故障引发的事故，MQ中堆积了几十万条发放资金的消息，导致业务无法及时处理，运营以为程序出错了就先通过后台进行了人工处理，结果MQ系统恢复后消息又被重复处理了一次，造成大量资金重复发放。

### 小结

异步处理的时候需要考虑消息重复的可能性，处理逻辑需要实现幂等，防止重复处理。

接着定义补偿Job即备线操作。

在CompensationJob中定义@Scheduled定时任务，5s一次补偿操作，因为Job不知道哪些用户注册的消息可能丢失，所以全量补偿。

#### 补偿逻辑

- 每5s补偿一次，按顺序一次补偿5个用户，下次补偿操作从上一次补偿的最后一个用户ID开始
- 补偿任务提交到线程池进行“异步”处理，提高处理能力

![](https://img-blog.csdnimg.cn/2020112722475788.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

为实现高内聚，主线和备线处理消息，最好使用同一方法。本案例的`MemberService`监听到MQ消息和`CompensationJob`补偿，调用的都是`welcome`。z这里的补偿逻辑简单，实际生产代码应该做到：

- 考虑配置补偿的频次、每次处理数量，以及补偿线程池大小等参数为合适的值，以满足补偿的吞吐量
- 考虑备线补偿数据进行适当延迟
  比如，对注册时间在30秒之前的用户再进行补偿，以方便和主线MQ实时流程错开，避免冲突。
- 诸如当前补偿到哪个用户的offset数据，需要落地数据库。
- 补偿Job本身需要高可用，可以使用类似XXLJob或ElasticJob等任务系统。
  运行程序，执行注册方法注册10个用户，输出如下：

```bash
[17:01:16.570] [http-nio-45678-exec-1] [INFO ] [o.g.t.c.a.compensation.UserController:28  ] - sent mq user 1
[17:01:16.571] [http-nio-45678-exec-1] [INFO ] [o.g.t.c.a.compensation.UserController:28  ] - sent mq user 5
[17:01:16.572] [http-nio-45678-exec-1] [INFO ] [o.g.t.c.a.compensation.UserController:28  ] - sent mq user 7
[17:01:16.573] [http-nio-45678-exec-1] [INFO ] [o.g.t.c.a.compensation.UserController:28  ] - sent mq user 8
[17:01:16.594] [org.springframework.amqp.rabbit.RabbitListenerEndpointContainer#0-1] [INFO ] [o.g.t.c.a.compensation.MemberService:18  ] - receive mq user 1
[17:01:18.597] [org.springframework.amqp.rabbit.RabbitListenerEndpointContainer#0-1] [INFO ] [o.g.t.c.a.compensation.MemberService:28  ] - memberService: welcome new user 1
[17:01:18.601] [org.springframework.amqp.rabbit.RabbitListenerEndpointContainer#0-1] [INFO ] [o.g.t.c.a.compensation.MemberService:18  ] - receive mq user 5
[17:01:20.603] [org.springframework.amqp.rabbit.RabbitListenerEndpointContainer#0-1] [INFO ] [o.g.t.c.a.compensation.MemberService:28  ] - memberService: welcome new user 5
[17:01:20.604] [org.springframework.amqp.rabbit.RabbitListenerEndpointContainer#0-1] [INFO ] [o.g.t.c.a.compensation.MemberService:18  ] - receive mq user 7
[17:01:22.605] [org.springframework.amqp.rabbit.RabbitListenerEndpointContainer#0-1] [INFO ] [o.g.t.c.a.compensation.MemberService:28  ] - memberService: welcome new user 7
[17:01:22.606] [org.springframework.amqp.rabbit.RabbitListenerEndpointContainer#0-1] [INFO ] [o.g.t.c.a.compensation.MemberService:18  ] - receive mq user 8
[17:01:24.611] [org.springframework.amqp.rabbit.RabbitListenerEndpointContainer#0-1] [INFO ] [o.g.t.c.a.compensation.MemberService:28  ] - memberService: welcome new user 8
[17:01:25.498] [scheduling-1] [INFO ] [o.g.t.c.a.compensation.CompensationJob:29  ] - 开始从用户ID 0 补偿
[17:01:27.510] [compensation-threadpool-1] [INFO ] [o.g.t.c.a.compensation.MemberService:28  ] - memberService: welcome new user 2
[17:01:27.510] [compensation-threadpool-3] [INFO ] [o.g.t.c.a.compensation.MemberService:28  ] - memberService: welcome new user 4
[17:01:27.511] [compensation-threadpool-2] [INFO ] [o.g.t.c.a.compensation.MemberService:28  ] - memberService: welcome new user 3
[17:01:30.496] [scheduling-1] [INFO ] [o.g.t.c.a.compensation.CompensationJob:29  ] - 开始从用户ID 5 补偿
[17:01:32.500] [compensation-threadpool-6] [INFO ] [o.g.t.c.a.compensation.MemberService:28  ] - memberService: welcome new user 6
[17:01:32.500] [compensation-threadpool-9] [INFO ] [o.g.t.c.a.compensation.MemberService:28  ] - memberService: welcome new user 9
[17:01:35.496] [scheduling-1] [INFO ] [o.g.t.c.a.compensation.CompensationJob:29  ] - 开始从用户ID 9 补偿
[17:01:37.501] [compensation-threadpool-0] [INFO ] [o.g.t.c.a.compensation.MemberService:28  ] - memberService: welcome new user 10
[17:01:40.495] [scheduling-1] [INFO ] [o.g.t.c.a.compensation.CompensationJob:29  ] - 开始从用户ID 10 补偿
```

可见

- 共10个用户，MQ发送成功的用户有四个：1、5、7、8
- 补偿任务第一次运行，补偿了用户2、3、4，第二次运行补偿了用户6、9，第三次运行补充了用户10

针对消息的补偿闭环处理的最高标准是，能够达到补偿全量数据的吞吐量。即若补偿备线足够完善，即使直接把MQ停机，虽然会略微影响处理的及时性，但至少确保流程都能正常执行。

### 小结

实际开发要考虑异步流程丢消息或处理中断场景。
异步流程需有备线以补偿，比如这里的全量补偿方式，即便异步流程彻底失效，通过补偿也能让业务继续进行。


## 2.2  RabbitMQ广播、工作队列模式坑

## 消息模式是广播 Or 工作队列

- 消息广播，即希望同一消息，不同消费者都能分别消费
- 队列模式，即不同消费者共享消费同一个队列的数据，相同消息只能被某一个消费者消费一次。

比如同一用户的注册消息

- 会员服务需监听以发送欢迎短信
- 营销服务需监听以发送新用户小礼物

但会员、营销服务可能都有多实例，业务需求同一用户的消息，可同时广播给不同的服务（广播模式），但对于同一个服务的不同实例（比如会员服务1和会员服务2），不管哪个实例来处理，处理一次即可（工作队列模式）：
![](https://img-blog.csdnimg.cn/20201127230225344.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

实现代码时务必确认MQ系统的机制，确保消息的路由按期望。
RocketMQ实现类似功能比较简单直白：若消费者属于一个组，那么消息只会由同组的一个消费者消费；若消费者属不同组，每个组都能消费一遍消息。

而RabbitMQ的消息路由模式采用队列+交换器，队列是消息载体，交换器决定消息路由到队列的方式。

## step1:会员服务-监听用户服务发出的新用户注册消息

若启动俩会员服务，那么同一用户的注册消息应只能被其中一个实例消费。

分别实现RabbitMQ队列、交换器、绑定三件套。

- 队列使用匿名队列
- 交换器使用DirectExchange，交换器绑定到匿名队列的路由Key是空字符串

收到消息之后，打印所在实例使用的端口。

- 消息发布者、消费者、以及MQ的配置
  ![](https://img-blog.csdnimg.cn/20201127233922967.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

使用12345和45678两个端口启动两个程序实例后，调用sendMessage接口发送一条消息，输出的日志，显示同一会员服务两个实例都收到了消息：

![](https://img-blog.csdnimg.cn/20201127234101574.png)![](https://img-blog.csdnimg.cn/20201127234107101.png)

问题在于不明

### RabbitMQ直接交换器和队列的绑定关系

RabbitMQ的直接交换器根据**routingKey**路由消息。而程序每次启动都会创建匿名（随机命名）队列，所以每个会员服务实例都对应独立的队列，以空**routingKey**绑定到直接交换器。
用户服务发消息时也设置了空**routingKey**，所以直接交换器收到消息后，发现匹配俩队列，于是都转发消息
![](https://img-blog.csdnimg.cn/20201128144541373.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

#### 修复

对会员服务不要使用匿名队列，而使用同一队列。
将上面代码中的匿名队列换做普通队列：

```java
private static final String QUEUE = "newuserQueue";
@Bean
public Queue queue() {
    return new Queue(QUEUE);
}
```

这样对同一消息，俩实例中只有一个实例可收到，不同消息被轮询发给不同实例。

- 现在的交换器和队列关系
  ![](https://img-blog.csdnimg.cn/20201128145123378.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

## step2:用户服务-广播消息给会员、营销服务

期望会员、营销服务都能收到广播消息，但会员/营销服务中的每个实例只需收到一次消息。

声明一个队列和一个FanoutExchange，然后模拟俩用户服务和俩营销服务：

```java
@Slf4j
@Configuration
@RestController
@RequestMapping("fanoutwrong")
public class FanoutQueueWrong {
    private static final String QUEUE = "newuser";
    private static final String EXCHANGE = "newuser";
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @GetMapping
    public void sendMessage() {
        rabbitTemplate.convertAndSend(EXCHANGE, "", UUID.randomUUID().toString());
    }
    //声明FanoutExchange，然后绑定到队列，FanoutExchange绑定队列的时候不需要routingKey
    @Bean
    public Declarables declarables() {
        Queue queue = new Queue(QUEUE);
        FanoutExchange exchange = new FanoutExchange(EXCHANGE);
        return new Declarables(queue, exchange,
                BindingBuilder.bind(queue).to(exchange));
    }
    //会员服务实例1
    @RabbitListener(queues = QUEUE)
    public void memberService1(String userName) {
        log.info("memberService1: welcome message sent to new user {}", userName);

    }
    //会员服务实例2
    @RabbitListener(queues = QUEUE)
    public void memberService2(String userName) {
        log.info("memberService2: welcome message sent to new user {}", userName);

    }
    //营销服务实例1
    @RabbitListener(queues = QUEUE)
    public void promotionService1(String userName) {
        log.info("promotionService1: gift sent to new user {}", userName);
    }
    //营销服务实例2
    @RabbitListener(queues = QUEUE)
    public void promotionService2(String userName) {
        log.info("promotionService2: gift sent to new user {}", userName);
    }
}
```

请求四次sendMessage注册四个用户。日志发现一条用户注册的消息，要么被会员服务收到，要么被营销服务收到，这不是广播。可使用的明明是**FanoutExchange**，为什么没起效呢？
![](https://img-blog.csdnimg.cn/2020112815100948.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

因为广播交换器会忽略routingKey，广播消息到所有绑定的队列。该案例的俩会员服务和两个营销服务都绑定了同一队列，所以四服务只能收到一次消息：
![](https://img-blog.csdnimg.cn/20201128151019504.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

#### 修复

拆分队列，会员和营销两组服务分别使用一条独立队列绑定到广播交换器

```java
@Slf4j
@Configuration
@RestController
@RequestMapping("fanoutright")
public class FanoutQueueRight {
    private static final String MEMBER_QUEUE = "newusermember";
    private static final String PROMOTION_QUEUE = "newuserpromotion";
    private static final String EXCHANGE = "newuser";
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @GetMapping
    public void sendMessage() {
        rabbitTemplate.convertAndSend(EXCHANGE, "", UUID.randomUUID().toString());
    }
    @Bean
    public Declarables declarables() {
        //会员服务队列
        Queue memberQueue = new Queue(MEMBER_QUEUE);
        //营销服务队列
        Queue promotionQueue = new Queue(PROMOTION_QUEUE);
        //广播交换器
        FanoutExchange exchange = new FanoutExchange(EXCHANGE);
        //两个队列绑定到同一个交换器
        return new Declarables(memberQueue, promotionQueue, exchange,
                BindingBuilder.bind(memberQueue).to(exchange),
                BindingBuilder.bind(promotionQueue).to(exchange));
    }
    @RabbitListener(queues = MEMBER_QUEUE)
    public void memberService1(String userName) {
        log.info("memberService1: welcome message sent to new user {}", userName);
    }
    @RabbitListener(queues = MEMBER_QUEUE)
    public void memberService2(String userName) {
        log.info("memberService2: welcome message sent to new user {}", userName);
    }
    @RabbitListener(queues = PROMOTION_QUEUE)
    public void promotionService1(String userName) {
        log.info("promotionService1: gift sent to new user {}", userName);
    }
    @RabbitListener(queues = PROMOTION_QUEUE)
    public void promotionService2(String userName) {
        log.info("promotionService2: gift sent to new user {}", userName);
    }
}
```

- 现在的交换器和队列结构
  ![](https://img-blog.csdnimg.cn/20201127234844740.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

从日志输出可以验证，对每条MQ消息，会员服务和营销服务分别都会收到一次，一条消息广播到两个服务同时，在每一个服务的两个实例中通过轮询接收：
![](https://img-blog.csdnimg.cn/20201128151246619.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

异步的消息路由模式一旦配置出错，轻则可能导致消息重复处理，重则可能导致重要的服务无法接收到消息，最终造成业务逻辑错误。

### 小结

微服务场景下不同服务多个实例监听消息的情况，一般不同服务需要同时收到相同的消息，而相同服务的多个实例只需要轮询接收消息。我们需要确认MQ的消息路由配置是否满足需求，以避免消息重复或漏发问题。

## 2.3  死信堵塞MQ之坑

**始终无法处理的死信消息，可能会引发堵塞MQ。**
若线程池的任务队列无上限，最终可能导致OOM，类似的MQ也要注意任务堆积问题。对于突发流量引起的MQ堆积，问题并不大，适当调整消费者的消费能力应该就可以解决。但在很多时候，消息队列的堆积堵塞，是因为有大量始终无法处理的消息。

### 2.3.1 案例

用户服务在用户注册后发出一条消息，会员服务监听到消息后给用户派发优惠券，但因用户并没有保存成功，会员服务处理消息始终失败，消息重新进入队列，然后还是处理失败。这种在MQ中回荡的同一条消息，就是死信。

随着MQ被越来越多的死信填满，消费者需花费大量时间反复处理死信，导致正常消息的消费受阻，最终MQ可能因数据量过大而崩溃。

- 定义一个队列、一个直接交换器，然后把队列绑定到交换器
  ![](https://img-blog.csdnimg.cn/20201127231407610.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- sendMessage发送消息到MQ，访问一次提交一条消息，使用自增标识作为消息内容
  ![](https://img-blog.csdnimg.cn/20201127231137373.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 收到消息后，直接NPE，模拟处理出错
  ![](https://img-blog.csdnimg.cn/20201127231018634.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

调用sendMessage接口发送两条消息，然后来到RabbitMQ管理台，可以看到这两条消息始终在队列，不断被重新投递，导致重新投递QPS达到1063。
![](https://img-blog.csdnimg.cn/20201128212535997.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

在日志中也可看到大量异常信息。

### 修复方案

- 解决死信无限重复进入队列最简单方案
  在程序处理出错时，直接抛`AmqpRejectAndDontRequeueException`，避免消息重新进入队列

```java
throw new AmqpRejectAndDontRequeueException("error");
```

但更希望对同一消息，能先重试，解决因网络抖动问题导致的偶发消息处理失败，若依旧失败，再把消息投递到专门设置的DLX。对来自DLX的数据，可能只是记录日志并告警，即使出现异常也不会再重复投递。

逻辑如下：

![](https://p.ipic.vip/ppfuwz.png)

针对该问题，我们来看

### Spring AMQP的简便解决方案

1. 定义死信交换器、死信队列。其实都是普通交换器和队列，只不过专门用于处理死信消息
2. 通过`RetryInterceptorBuilder`构建一个`RetryOperationsInterceptor`以处理失败时候的重试。策略是最多尝试5次（重试4次）；并且采取指数退避重试，首次重试延迟1秒，第二次2秒，以此类推，最大延迟是10秒；如果第4次重试还是失败，则使用`RepublishMessageRecoverer`把消息重新投入一个DLX
3. 定义死信队列的处理程序。本案例只记录日志

#### 代码

![](https://img-blog.csdnimg.cn/20201128221449114.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

执行程序，发送两条消息，查看日志：
![](https://img-blog.csdnimg.cn/20201128223636744.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- msg2的4次重试间隔分别是1秒、2秒、4秒、8秒，再加上首次的失败，所以最大尝试次数是5
- 4次重试后，RepublishMessageRecoverer把消息发往DLX
- 死信处理程序输出了`got dead message msg2`。

虽然几乎同时发俩消息，但msg2在msg1四次重试全部结束后才开始处理，因为默认`SimpleMessageListenerContainer`只有一个消费线程。可通过增加消费线程避免性能问题：

- 直接设置`concurrentConsumers`参数为10，来增加到10个工作线程
  ![](https://img-blog.csdnimg.cn/20201127230402610.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
  也可设置`maxConcurrentConsumers`参数，让`SimpleMessageListenerContainer`动态调整消费者线程数。

### 小结

一般在遇到消息处理失败的时候，可设置重试。若重试还是不行，可把该消息扔到专门的死信队列处理，不要让死信影响到正常消息处理。