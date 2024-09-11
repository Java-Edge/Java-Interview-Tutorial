# 04-RabbitMQ & Spring整合开发

本文涉及源码仓库 [点击直达](https://github.com/Java-Edge/RabbitMQ-Tutorial.git)。

## 2 RabbitAdmin（Spring AMQP用户管理组件）

Spring 中直接注入即可。**autoStartup** 须置true，否则 Spring 容器不会加载它。从 Spring 容器获取 Exchange、Bingding、Routingkey 及Queue 的 @Bean 声明。

然后用 rabbitTemplate#execute 进行执行对应的声明、修改、删除等一系列 RabbitMQ 基础功能操作。如添加交换机、删除一个绑定、清空一个队列里的消息等。

依赖结构：

```java
public class RabbitAdmin implements AmqpAdmin, ApplicationContextAware, ApplicationEventPublisherAware,
       InitializingBean {
```

RabbitAdmin实现4个接口： 

- AmqpAdmin
- ApplicationContextAware
- ApplicationEventPublisherAware
- InitializingBean

以上Interfaces执行顺序：

ApplicationEventPublisherAware -> ApplicationContextAware -> InitializingBean.

### 2.1 AmqpAdmin

为AMQP指定一组基本的便携式AMQP管理操作：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/6b581c405850fd737842aae2f3833eb1.png)

RabbitAdmin借助ApplicationContextAware 和 InitializingBean获取在配置类中声明的exchange, queue, binding beans等信息，并调用channel的相应方法来声明。

- 首先，RabbitAdmin借助ApplicationContextAware获取applicationContext
- 然后，借助InitializingBean及上面的applicationContext，实现rabbitMQ entity的声明

### 2.2 afterPropertiesSet

```java
/**
 * 如autoStartup置true，则在ConnectionFactory上，
 * 以声明包含应用程序上下文中的所有交换和队列。
 	如回调失败，可能导致连接工厂的其他客户端失败，但由于仅声明交换、队列和绑定，因此不会预期失败。
 */
@Override
public void afterPropertiesSet() {

    synchronized (this.lifecycleMonitor) {
        // 防止堆栈溢出...
        final AtomicBoolean initializing = new AtomicBoolean(false);

				 // 注册一个回调
        this.connectionFactory.addConnectionListener(connection -> {

            if (!initializing.compareAndSet(false, true)) {
                // 若已在初始化，无需再次初始化...
                return;
            }
            try {
                /*
                 * 同一个 ConnectionFactory 可能会发生两次（若允许并发连接）。它是幂等的，所以没什么大不了的（一些网络流量）。
                 * 事实上，它甚至可能是一件好事：独占队列只有在为每个连接声明时才有意义。如果有人对此有问题：使用 auto-startup="false"。
                 */
                initialize();
            }
            finally {
                initializing.compareAndSet(true, false);
            }

        });

        this.running = true;

    }
}
```

```java
/**
 * Declares all the exchanges, queues and bindings in the enclosing application context, if any. It should be safe
 * (but unnecessary) to call this method more than once.
 */
public void initialize() {
		// 获得container中的Exchange、Queue、Binding声明放入集合：
    Collection<Exchange> contextExchanges = new LinkedList<Exchange>(
          this.applicationContext.getBeansOfType(Exchange.class).values());
    Collection<Queue> contextQueues = new LinkedList<Queue>(
          this.applicationContext.getBeansOfType(Queue.class).values());
    Collection<Binding> contextBindings = new LinkedList<Binding>(
          this.applicationContext.getBeansOfType(Binding.class).values());

    @SuppressWarnings("rawtypes")
    Collection<Collection> collections = this.declareCollections
       ? this.applicationContext.getBeansOfType(Collection.class, false, false).values()
       : Collections.emptyList();
    for (Collection<?> collection : collections) {
       if (collection.size() > 0 && collection.iterator().next() instanceof Declarable) {
          for (Object declarable : collection) {
             if (declarable instanceof Exchange) {
                contextExchanges.add((Exchange) declarable);
             }
             else if (declarable instanceof Queue) {
                contextQueues.add((Queue) declarable);
             }
             else if (declarable instanceof Binding) {
                contextBindings.add((Binding) declarable);
             }
          }
       }
    }
    
    // 过滤不能declareable的bean
    final Collection<Exchange> exchanges = filterDeclarables(contextExchanges);
    final Collection<Queue> queues = filterDeclarables(contextQueues);
    final Collection<Binding> bindings = filterDeclarables(contextBindings);
		// 按RabbitMQ的方式拼接
    for (Exchange exchange : exchanges) {
       if ((!exchange.isDurable() || exchange.isAutoDelete())  && this.logger.isInfoEnabled()) {
          this.logger.info("Auto-declaring a non-durable or auto-delete Exchange ("
                + exchange.getName()
                + ") durable:" + exchange.isDurable() + ", auto-delete:" + exchange.isAutoDelete() + ". "
                + "It will be deleted by the broker if it shuts down, and can be redeclared by closing and "
                + "reopening the connection.");
       }
    }

    for (Queue queue : queues) {
       if ((!queue.isDurable() || queue.isAutoDelete() || queue.isExclusive()) && this.logger.isInfoEnabled()) {
          this.logger.info("Auto-declaring a non-durable, auto-delete, or exclusive Queue ("
                + queue.getName()
                + ") durable:" + queue.isDurable() + ", auto-delete:" + queue.isAutoDelete() + ", exclusive:"
                + queue.isExclusive() + ". "
                + "It will be redeclared if the broker stops and is restarted while the connection factory is "
                + "alive, but all messages will be lost.");
       }
    }
		
  	// 使用rabbitTemplate执行交互
    this.rabbitTemplate.execute(channel -> {
       // 声明RabbitMQ Entity
       declareExchanges(channel, exchanges.toArray(new Exchange[exchanges.size()]));
       declareQueues(channel, queues.toArray(new Queue[queues.size()]));
       declareBindings(channel, bindings.toArray(new Binding[bindings.size()]));
       return null;
    });
}
```

回顾消费者配置：

```
1. 设置交换机类型
2. 将队列绑定到交换机
```

### 交换机类型

- FanoutExchange：将消息分发到所有的绑定队列，无 routingkey 的概念
- HeadersExchange：通过添加属性 key-value 匹配
- DirectExchange：按 routingkey 分发到指定队列
- TopicExchange：多关键字匹配

```java
/**
 * @author JavaEdge
 */
@Configuration
@ComponentScan({"com.javaedge.spring.*"})
public class RabbitMQConfig {

    @Bean
    public ConnectionFactory connectionFactory(){
       CachingConnectionFactory connectionFactory = new CachingConnectionFactory();
       connectionFactory.setAddresses("localhost:5672");
       connectionFactory.setUsername("guest");
       connectionFactory.setPassword("guest");
       connectionFactory.setVirtualHost("/");
        // 开启confirm模式
        connectionFactory.setPublisherConfirms(true);
       return connectionFactory;
    }
    
    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
       RabbitAdmin rabbitAdmin = new RabbitAdmin(connectionFactory);
       rabbitAdmin.setAutoStartup(true);
       return rabbitAdmin;
    }
```

测试代码：

```java
@Test
public void testAdmin() throws Exception {
    rabbitAdmin.declareExchange(new DirectExchange("test.direct", false, false));
    rabbitAdmin.declareQueue(new Queue("test.direct.queue", false));
    rabbitAdmin.declareBinding(new Binding("test.direct.queue",
          Binding.DestinationType.QUEUE,
          "test.direct", "direct", new HashMap<>()));

    rabbitAdmin.declareExchange(new TopicExchange("test.topic", false, false));
    rabbitAdmin.declareQueue(new Queue("test.topic.queue", false));
    rabbitAdmin.declareBinding(
          BindingBuilder
                .bind(new Queue("test.topic.queue", false))       //直接创建队列
                .to(new TopicExchange("test.topic", false, false)) //直接创建交换机 建立关联关系
                .with("user.#"));  //指定路由Key


    rabbitAdmin.declareExchange(new FanoutExchange("test.fanout", false, false));
    rabbitAdmin.declareQueue(new Queue("test.fanout.queue", false));
    rabbitAdmin.declareBinding(
          BindingBuilder
          .bind(new Queue("test.fanout.queue", false))
          .to(new FanoutExchange("test.fanout", false, false)));

    // 清空队列数据
    rabbitAdmin.purgeQueue("test.topic.queue", false);
}
```

查看管控台：

![](https://img-blog.csdnimg.cn/20190702065439712.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)



![](https://img-blog.csdnimg.cn/20190702065520705.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## CachingConnectionFactory

ConnectionFactory实现类，当缓存模式为CacheMode#CHANNEL默认值时，所有createConnection调用将返回相同的 Connection，并忽略对com.rabbitmq.client.Connection#close的调用，同时缓存 com.rabbitmq.client.Channel。

默认，仅有一个 Channel 会被缓存，其他请求的 Channel 将根据需求创建和销毁。在高并发环境下，建议增加#setChannelCacheSize(int) "channelCacheSize" 值。

当缓存模式为CacheMode#CONNECTION，每次createConnection都会使用一个新的（或缓存的）连接；连接会根据setConnectionCacheSize(int) "connectionCacheSize"值进行缓存。在此模式下，连接和通道都会被缓存。CacheMode#CONNECTION与自动声明队列等 Rabbit Admin 功能不兼容。

此 ConnectionFactory 需显式关闭从其 Connection(s) 获得的所有 Channel。对于直接访问 RabbitMQ 的代码，这是通常的建议。然而，对于此 ConnectionFactory，此操作是必须的，以便实际允许 Channel 的重用。Channel#close会将通道放回缓存中（如果有空间），否则将彻底关闭通道。

## 3 SpringAMQP - RabbitMQ声明式配置使用

SpringAMQP 声明即在 rabbit 基础 API 里面声明一个 exchange、Bingding、queue。使用SpringAMQP 去声明，就需要使用 @Bean 声明：

![](https://img-blog.csdnimg.cn/20190702082752208.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

查看管控台![](https://img-blog.csdnimg.cn/20190702090044875.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190702092111226.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 3 消息模板 - RabbitTemplate

与 Spring AMQP 整合发送消息的关键类，提供丰富的发消息方法，包括：

- 可靠性投递消息方法
- 回调监听消息接口 `ConfirmCallback`、
- 返回值确认接口 `ReturnCallback `等

需注入 Spring 容器中，然后直接使用。RabbitTemplate 在 Spring 整合时需要实例化，但在 Springboot 整合时，在配置文件里添加配置即可。

先声明@Bean：

```java
@Bean
public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
  RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
  return rabbitTemplate;
}
```

测试：

```java
@Autowired
private RabbitTemplate rabbitTemplate;


@Test
public void testSendMessage() throws Exception {
  MessageProperties messageProperties = new MessageProperties();
  messageProperties.getHeaders().put("desc", "信息描述..");
  messageProperties.getHeaders().put("type", "自定义消息类型..");
  Message message = new Message("JavaEdge RabbitMQ".getBytes(), messageProperties);

  rabbitTemplate.convertAndSend("topic001", "spring.amqp", message, message1 -> {
    System.err.println("------添加额外的设置---------");
    message1.getMessageProperties().getHeaders().put("desc", "额外修改的信息描述");
    message1.getMessageProperties().getHeaders().put("attr", "额外新加的属性");
    return message1;
  });
}
```

## 4 消息容器（SimpleMessageListenerContainer）

消费者的配置项，该类都可满足。监听一或多个队列、自动启动、自动声明功能。

- 设置事务特性、事务管理器、事务属性、事务并发、是否开启事务、回滚消息等。但是我们在实际生产中，很少使用事务，基本都是采用补偿机制
- 设置消费者数量、最小最大数量、批量消费
- 设置消息确认和自动确认模式、是否重回队列、异常捕获 Handler 函数
- 设置消费者标签生成策略、是否独占模式、消费者属性等
- 设置具体的监听器、消息转换器等等。

> SimpleMessageListenerContainer 可动态设置，如在运行中的应用可动态修改其消费者数量的大小、接收消息的模式等。

很多基于 RabbitMQ 的自制定化后端管控台在进行设置时，也是根据这一去实现：
![](https://img-blog.csdnimg.cn/20190702103609861.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)



![](https://img-blog.csdnimg.cn/20190702103830482.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190702103941759.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190702104108857.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190702104212629.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 5 消息适配器（MessageListenerAdapter）

通过反射将消息处理委托给目标监听器的处理方法，并进行灵活的消息类型转换。允许监听器方法对消息内容类型进行操作，完全独立于RabbitMQ API。

默认，传入Rabbit消息的内容在被传递到目标监听器方法之前被提取，以使目标方法对消息内容类型进行操作以String或byte类型进行操作，而非原始Message类型。 （消息转换器）

消息类型转换委托给MessageConverter接口的实现类。 默认用SimpleMessageConverter。 （如不希望自动消息转换，请自己通过#setMessageConverter MessageConverter置null）。

如目标监听器方法返回一个非空对象（通常是消息内容类型，例如String或byte数组），它将被包装在一个Rabbit Message 中，并发送使用来自Rabbit ReplyTo属性或通过#setResponseRoutingKey(String)指定的routingKey的routingKey来传送消息。（使用rabbitmq 来实现异步rpc功能时候会使用到这个属性）。

注意：发送响应消息仅在使用ChannelAwareMessageListener入口点（通常通过Spring消息监听器容器）时可用。 用作MessageListener不支持生成响应消息。

### 源码

![](https://img-blog.csdnimg.cn/20190703112518590.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
继承自`AbstractAdaptableMessageListener`类,实现了`MessageListener`和`ChannelAwareMessageListener`接口
而`MessageListener`和`ChannelAwareMessageListener`接口的`onMessage`方法就是具体容器监听队列处理队列消息的方法


![](https://img-blog.csdnimg.cn/20190703112741904.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 实操

- 委托类MessageDelegate,类中定义的方法也就是目标监听器的处理方法
  ![](https://img-blog.csdnimg.cn/20190703110706732.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 配置类代码![](https://img-blog.csdnimg.cn/20190703110826994.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 运行测试代码
  ![](https://img-blog.csdnimg.cn/20190703110927685.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 结果
  ![](https://img-blog.csdnimg.cn/2019070311101753.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


从源码分析小节中的成员变量,我们可以看出使用MessageListenerAdapter处理器进行消息队列监听处理

- 如果容器没有设置setDefaultListenerMethod
  则处理器中默认的处理方法名是`handleMessage`
- 如果设置了setDefaultListenerMethod
  ![](https://img-blog.csdnimg.cn/20190703113640114.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
  则处理器中处理消息的方法名就是setDefaultListenerMethod方法参数设置的值
  ![](https://img-blog.csdnimg.cn/20190703113929481.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

也可以通过setQueueOrTagToMethodName方法为不同的队列设置不同的消息处理方法。
`MessageListenerAdapter`的`onMessage`方法

- 如果将参数改为String运行会出错!应当是字节数组,这时就需要使用转换器才能保证正常运行
  ![](https://img-blog.csdnimg.cn/20190703114102112.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 使用转换器
  ![](https://img-blog.csdnimg.cn/20190703114713677.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
  ![](https://img-blog.csdnimg.cn/20190703114734657.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
  ![](https://img-blog.csdnimg.cn/20190703115029275.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
  测试代码运行成功!
  ![](https://img-blog.csdnimg.cn/20190703120217719.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
  ![](https://img-blog.csdnimg.cn/20190703120434742.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
  ![](https://img-blog.csdnimg.cn/20190703120525213.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 6 消息转换器（MessageConverter）

发消息时，正常消息体为二进制数据方式传输，如希望内部帮我们转换或指定自定义转换器，就要用 `MessageConverter `。

自定义常用转换器都要实现这个接口，重写其中的两个方法：

```java
public interface MessageConverter {

    /**
     * Convert a Java object to a Message.
     */
    Message toMessage(Object object, MessageProperties messageProperties) throws MessageConversionException;

    /**
     * Convert from a Message to a Java object.
     */
    Object fromMessage(Message message) throws MessageConversionException;
}
```

### 常见转换器

- JSON转换器jackson2JsonMessageConverter：Java 对象的转换功能
- DefaultJackson2JavaTypeMapper 映射器：Java对象的映射关系
- 自定义二进制转换器：如图片类型、PDF、PPT、流媒体

```java
public class Order {

    private String id;
    
    private String name;
    
    private String content;
}
```

```java
public class Packaged {

    private String id;
    
    private String name;
    
    private String description;
}
```

### 配置JSON转换器



```java
/**
 * 支持JSON格式的转换器
 */
MessageListenerAdapter adapter = new MessageListenerAdapter(new MessageDelegate());
adapter.setDefaultListenerMethod("consumeMessage");

Jackson2JsonMessageConverter jackson2JsonMessageConverter = new Jackson2JsonMessageConverter();
adapter.setMessageConverter(jackson2JsonMessageConverter);

container.setMessageListener(adapter);
```

测试代码

```java
@Test
public void testSendJsonMessage() throws Exception {
    Order order = new Order();
    order.setId("001");
    order.setName("Message Order");
    order.setContent("Description Information");

    ObjectMapper mapper = new ObjectMapper();
    String json = mapper.writeValueAsString(order);
    System.err.println("Order 4 JSON: " + json);
    
    MessageProperties messageProperties = new MessageProperties();
    // 一定要修改contentType为 application/json
    messageProperties.setContentType("application/json");
    Message message = new Message(json.getBytes(), messageProperties);
    
    rabbitTemplate.send("topic001", "spring.order", message);
}
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/0eacba1fc35d1b67a28c532a3c50d620.png)

### 配置Java对象转换器



![](https://img-blog.csdnimg.cn/20190703130109286.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

测试代码及结果

```java
@Test
public void testSendJavaMessage() throws Exception {
    Order order = new Order();
    order.setId("001");
    order.setName("Order Message");
    order.setContent("Order Description Information");
    ObjectMapper mapper = new ObjectMapper();
    String json = mapper.writeValueAsString(order);
    System.err.println("Order 4 JSON: " + json);
    
    MessageProperties messageProperties = new MessageProperties();
    //这里注意一定要修改contentType为 application/json
    messageProperties.setContentType("application/json");
    messageProperties.getHeaders().put("__TypeId__", "com.javaedge.spring.entity.Order");
    Message message = new Message(json.getBytes(), messageProperties);
    
    rabbitTemplate.send("topic001", "spring.order", message);
}
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/0b5988a4066f317b74b22183f1981246.png)

### 多个Java对象映射转换

```java
      /**
       * DefaultJackson2JavaTypeMapper & Jackson2JsonMessageConverter 多个Java对象映射转换
       */
      MessageListenerAdapter adapter = new MessageListenerAdapter(new MessageDelegate());
      adapter.setDefaultListenerMethod("consumeMessage");
      Jackson2JsonMessageConverter jackson2JsonMessageConverter = new Jackson2JsonMessageConverter();
      DefaultJackson2JavaTypeMapper javaTypeMapper = new DefaultJackson2JavaTypeMapper();

      Map<String, Class<?>> idClassMapping = new HashMap<>(16);
idClassMapping.put("order", com.javaedge.spring.entity.Order.class);
idClassMapping.put("packaged", com.javaedge.spring.entity.Packaged.class);

javaTypeMapper.setIdClassMapping(idClassMapping);

jackson2JsonMessageConverter.setJavaTypeMapper(javaTypeMapper);
      adapter.setMessageConverter(jackson2JsonMessageConverter);
      container.setMessageListener(adapter);
```

测试代码及结果

```java
@Test
public void testSendMappingMessage() throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    
    Order order = new Order();
    order.setId("001");
    order.setName("Order Message");
    order.setContent("Order Description Information");
    String orderJson = mapper.writeValueAsString(order);
    System.err.println("Order 4 JSON: " + orderJson);
    
    MessageProperties messageProperties1 = new MessageProperties();
    //这里注意一定要修改contentType为 application/json
    messageProperties1.setContentType("application/json");
    messageProperties1.getHeaders().put("__TypeId__", "order");
    Message message1 = new Message(orderJson.getBytes(), messageProperties1);
    rabbitTemplate.send("topic001", "spring.order", message1);
    
    Packaged pack = new Packaged();
    pack.setId("002");
    pack.setName("Package Message");
    pack.setDescription("Package Description Information");
    
    String packageJson = mapper.writeValueAsString(pack);
    System.err.println("pack 4 json: " + packageJson);

    MessageProperties messageProperties2 = new MessageProperties();
    //这里注意一定要修改contentType为 application/json
    messageProperties2.setContentType("application/json");
    messageProperties2.getHeaders().put("__TypeId__", "packaged");
    Message message2 = new Message(packageJson.getBytes(), messageProperties2);
    rabbitTemplate.send("topic001", "spring.pack", message2);
}
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/4c2f80bdeff320de95f34dce7a9d083a.png)

### 全局转换器

```java
MessageListenerAdapter adapter = new MessageListenerAdapter(new MessageDelegate());
adapter.setDefaultListenerMethod("consumeMessage");
/**
 * 全局转换器
 */
ContentTypeDelegatingMessageConverter convert = new ContentTypeDelegatingMessageConverter();

TextMessageConverter textConvert = new TextMessageConverter();
convert.addDelegate("text", textConvert);
convert.addDelegate("html/text", textConvert);
convert.addDelegate("xml/text", textConvert);
convert.addDelegate("text/plain", textConvert);

Jackson2JsonMessageConverter jsonConvert = new Jackson2JsonMessageConverter();
convert.addDelegate("json", jsonConvert);
convert.addDelegate("application/json", jsonConvert);

ImageMessageConverter imageConverter = new ImageMessageConverter();
convert.addDelegate("image/png", imageConverter);
convert.addDelegate("image", imageConverter);

PDFMessageConverter pdfConverter = new PDFMessageConverter();
convert.addDelegate("application/pdf", pdfConverter);

adapter.setMessageConverter(convert);
container.setMessageListener(adapter);

return container;
```

### 图片转换器实现

```java
/**
 * @author JavaEdge
 */
public class ImageMessageConverter implements MessageConverter {

    @Override
    public Message toMessage(Object object, MessageProperties messageProperties) throws MessageConversionException {
       throw new MessageConversionException("Convert Error! ");
    }

    @Override
    public Object fromMessage(Message message) throws MessageConversionException {
       System.err.println("-----------Image MessageConverter----------");
       
       Object _extName = message.getMessageProperties().getHeaders().get("extName");
       String extName = _extName == null ? "png" : _extName.toString();
       
       byte[] body = message.getBody();
       String fileName = UUID.randomUUID().toString();
       String path = "/Volumes/doc/test_file/" + fileName + "." + extName;
       File f = new File(path);
       try {
          Files.copy(new ByteArrayInputStream(body), f.toPath());
       } catch (IOException e) {
          e.printStackTrace();
       }
       return f;
    }
}
```

### PDF转换器实现

```java
/**
 * @author JavaEdge
 */
public class PDFMessageConverter implements MessageConverter {

    @Override
    public Message toMessage(Object object, MessageProperties messageProperties) throws MessageConversionException {
       throw new MessageConversionException("Convert Error! ");
    }

    @Override
    public Object fromMessage(Message message) throws MessageConversionException {
       System.err.println("-----------PDF MessageConverter----------");
       
       byte[] body = message.getBody();
       String fileName = UUID.randomUUID().toString();
       String path = "/Volumes/doc/test_file/" + fileName + ".pdf";
       File f = new File(path);
       try {
          Files.copy(new ByteArrayInputStream(body), f.toPath());
       } catch (IOException e) {
          e.printStackTrace();
       }
       return f;
    }
}
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/22efe2746569208e9828794450822b08.png)

测试代码及结果

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/4a7613d785eae45b49ce250acecfc508.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/206eb62602834b223bb248fe4db9fed1.png)

## 7 RabbitMQ与SpringBoot2.x整合实战

### 7.1 配置详解

publisher-confirms：实现一个监听器监听 broker  给我们返回的确认请求`RabbitTemplate.ConfirmCallback`

publisher-returns：保证消息对 broker 可达,若出现路由键不可达情况,则使用监听器对不可达消息后续处理,保证消息路由成功 - ` RabbitTemplate.ReturnCallback`

> 发消息时，对 template 进行配置 `mandatory = true` 保证监听有效。生产端还可配置其他属性，如发送重试、超时时间、次数、间隔等。

### Pro

配置文件



![](https://img-blog.csdnimg.cn/20190703191738927.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

主配置
![](https://img-blog.csdnimg.cn/20190703190758641.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

添加一个自定义的交换机
![](https://img-blog.csdnimg.cn/20190703225705132.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

添加一个Q
![](https://img-blog.csdnimg.cn/20190703230430261.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

建立绑定关系
![](https://img-blog.csdnimg.cn/20190703230941421.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703231011535.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703233404929.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

测试及结果
![](https://img-blog.csdnimg.cn/20190703235354725.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

### Con配置

消费端的 RabbitListener 是一个组合注解，里面可以注解配置 。
@QueueBinding @Queue @Exchange 直接通过这个组合注解一次性搞定消费端交换机、队列、绑定、路由、并且配置监听功能等。

将Pro中的绑定全部删除,再启动Con的sb服务
![](https://img-blog.csdnimg.cn/20190704000336742.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190704000401500.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

### 发送一个 Java 实体对象

在Con声明队列、交换机、routingKey基本配置
![](https://img-blog.csdnimg.cn/20190704092634274.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

Con
![](https://img-blog.csdnimg.cn/20190704092733133.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

> Payload 注解中的路径要跟Pro的实体路径完全一致，要不然会找到不到该类,这里为了简便就不写一个 common.jar 了，在实际开发里面，这个 Java Bean 应该放在 common.jar中

注意实体要实现 Serializable 序列化接口，要不然发送消息会失败
![](https://img-blog.csdnimg.cn/20190704093852589.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

Pro 照样跟着写一个发消息的方法
![](https://img-blog.csdnimg.cn/20190704094016584.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

测试代码及结果
![](https://img-blog.csdnimg.cn/20190704094212455.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190704094310427.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 8  RabbitMQ & Spring Cloud Stream整合实战

Spring Cloud全家桶在整个中小型互联网公司异常的火爆,Spring Cloud Stream也就渐渐的被大家所熟知,本小节主要来绍RabbitMQ与Spring Cloud Stream如何集成

### 8.1 编程模型

要了解编程模型，你应该熟悉以下核心概念

- 目标绑定器
  提供与外部消息传递系统集成的组件
- 目标绑定
  外部消息传递系统和应用程序之间的桥接提供的生产者和消费者消息（由目标绑定器创建）
- 消息
  生产者和消费者用于与目标绑定器（以及通过外部消息传递系统的其他应用程序）通信的规范数据结构
  ![](https://img-blog.csdnimg.cn/20190704100414674.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

### 8.2 应用模型

Spring Cloud Stream应用程序由中间件中立核心组成。该应用程序通过Spring Cloud Stream注入其中的输入和输出通道与外界通信。通过中间件特定的Binder实现，通道连接到外部代理。
![](https://img-blog.csdnimg.cn/20190704100544237.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

### 8.3 RabbitMQ绑定概述



![](https://img-blog.csdnimg.cn/20190704101501891.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

默认情况下，RabbitMQ Binder实现将每个目标映射到TopicExchange。对于每个使用者组，Queue绑定到该TopicExchange。每个使用者实例都为其组的Queue具有相应的RabbitMQ Consumer实例。对于分区生成器和使用者，队列以分区索引为后缀，并使用分区索引作为路由键。对于匿名使用者（没有组属性的用户），使用自动删除队列（具有随机的唯一名称）。

Barista接口: Barista接口是定义来作为后面类的参数，这一接口定义来通道类型和通道名称，通道名称是作为配置用，通道类型则决定了app会使用这一 通道进行发送消息还是从中接收消息

### 8.4 扩展 - 注解

- @Output:输出注解，用于定义发送消息接口
- @Input:输入注解，用于定义消息的消费者接口
- @StreamListener:用于定义监听方法的注解

使用Spring Cloud Stream非常简单，只需要使用好这3个注解即可，在实现高性能消息的生产和消费的场景非常适合，但是使用SpringCloudStream框架有一个非常大的问题就是不能实现可靠性的投递，也就是没法保证消息的100%可靠性，会存在少量消息丢失的问题

这个原因是因为SpringCloudStream框架为了和Kafka兼顾所以在实际工作中使用它的目的就是针对高性能的消息通信的!这点就是在当前版本Spring Cloud Stream的定位

### 8.5 实操

Pro pom核心文件
![](https://img-blog.csdnimg.cn/20190704105257283.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

Sender
![](https://img-blog.csdnimg.cn/20190704110913136.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
注解`@EnableBinding`声明了这个应用程序绑定了2个通道：INPUT和OUTPUT。这2个通道是在接口`Barista`中定义的（Spring Cloud Stream默认设置）。所有通道都是配置在一个具体的消息中间件或绑定器中

Barista接口
![](https://img-blog.csdnimg.cn/20190704112934707.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- @Input
  声明了它是一个输入类型的通道，名字是Barista.INPUT_CHANNEL，也就是position3的input_channel。这一名字与上述配置app2的配置文件中position1应该一致，表明注入了一个名字叫做input_channel的通道，它的类型是input，订阅的主题是position2处声明的mydest这个主题  

- @Output
  声明了它是一个输出类型的通道，名字是output_channel。这一名字与app1中通道名一致，表明注入了一个名字为output_channel的通道，类型是output，发布的主题名为mydest。

- Bindings — 声明输入和输出通道的接口集合。
- Binder — 消息中间件的实现，如Kafka或RabbitMQ
- Channel — 表示消息中间件和应用程序之间的通信管道
- StreamListeners — bean中的消息处理方法，在中间件的MessageConverter特定事件中进行对象序列化/反序列化之后，将在信道上的消息上自动调用消息处理方法。
- Message Schemas — 用于消息的序列化和反序列化，这些模式可以静态读取或者动态加载，支持对象类型的演变。

将消息发布到指定目的地是由发布订阅消息模式传递。发布者将消息分类为主题，每个主题由名称标识。订阅方对一个或多个主题表示兴趣。中间件过滤消息，将感兴趣的主题传递给订阅服务器。订阅方可以分组，消费者组是由组ID标识的一组订户或消费者，其中从主题或主题的分区中的消息以负载均衡的方式递送。

### Con



- Pom核心文件
  ![](https://img-blog.csdnimg.cn/20190704113317198.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 应用启动类
  ![](https://img-blog.csdnimg.cn/20190704113434327.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Barista接口
  ![](https://img-blog.csdnimg.cn/20190704113713148.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 配置文件
  ![](https://img-blog.csdnimg.cn/20190704114526499.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 接收
  ![](https://img-blog.csdnimg.cn/20190704114755779.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 启动Con服务,查看管控台
  ![](https://img-blog.csdnimg.cn/2019070411503383.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
  ![](https://img-blog.csdnimg.cn/20190704115119708.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
  ![](https://img-blog.csdnimg.cn/201907041151564.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 运行Pro测试代码及结果
  ![](https://img-blog.csdnimg.cn/2019070411543336.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
  ![](https://img-blog.csdnimg.cn/20190704115517511.png)
  ![](https://img-blog.csdnimg.cn/2019070411555535.png)

## 9 总结

本文学习Spring AMQP知识，通过实战对RabbitMQ集成Spring有直观认识，最后整合SpringBoot与Spring Cloud Stream，更方便更高效的集成到我们的应用服务中去！

参考：

-  [SpringAMQP 用户管理组件 RabbitAdmin 以及声明式配置](https://juejin.im/post/5c541218e51d450134320378) [Spring Boot
-  RabbitMQ源码分析](https://zhuanlan.zhihu.com/p/54450318)
-  [SpringAMQP 之 RabbitTemplate](https://juejin.im/post/5c5c29efe51d457fff4102f1)
-  [SpringAMQP 消息容器 -SimpleMessageListenerContainer](https://juejin.im/user/5c3dfed2e51d4552232fc9cd)
-  [MessageListenerAdapter详解](https://www.jianshu.com/p/d21bafe3b9fd)
-  [SpringAMQP 消息转换器 -MessageConverter](https://juejin.im/post/5c5d925de51d457fc75f7a0c)
-  [RabbitMQ 与 SpringBoot2.X整合](https://juejin.im/post/5c64e3fd6fb9a049d132a557) 