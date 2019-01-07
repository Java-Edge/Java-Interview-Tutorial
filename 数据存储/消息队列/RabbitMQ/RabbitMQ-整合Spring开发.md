> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

[相关源码](https://github.com/Wasabi1234/RabbitMQ_Tutorial)
# 1 你将学到
- RabbitMQ 整合 Spring AMQP实战
- RabbitMQ   整合 Spring Boot实战
- RabbitMQ 整合 Spring Cloud实战

# 2 SpringAMQP用户管理组件 - RabbitAdmin
RabbitAdmin 类可以很好的操作 rabbitMQ，在 Spring 中直接进行注入即可

**autoStartup** 必须设置为 true,否则 Spring 容器不会加载它.

## 2.1 源码分析
RabbitAdmin 的底层实现
- 从 Spring 容器中获取 Exchange、Bingding、Routingkey 以及Queue 的 @Bean 声明
- 然后使用 rabbitTemplate 的 execute 方法进行执行对应的声明、修改、删除等一系列 RabbitMQ 基础功能操作。例如添加交换机、删除一个绑定、清空一个队列里的消息等等
- 依赖结构
![](https://img-blog.csdnimg.cn/20190701130301812.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
RabbitAdmin实现了4个Interface： AmqpAdmin, ApplicationContextAware, ApplicationEventPublisherAware,InitializingBean。

### AmqpAdmin
为AMQP指定一组基本的便携式AMQP管理操作
![](https://img-blog.csdnimg.cn/20190701131344162.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
### ApplicationEventPublisherAware
实现该接口的类，通过函数setApplicationEventPublisher()获得它执行所在的ApplicationEventPublisher。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20190701155733978.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

### ApplicationContextAware
实现该接口的类，通过函数setApplicationContext()获得它执行所在的ApplicationContext。一般用来初始化object
![](https://img-blog.csdnimg.cn/20190702041941650.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
### InitializingBean
![](https://img-blog.csdnimg.cn/20190702042042485.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
若class中实现该接口，在Spring Container中的bean生成之后，自动调用函数afterPropertiesSet()。
因其实现了InitializingBean接口,其中只有一个方法,且在Bean加载后就执行
该功能可以被用来检查是否所有的mandatory properties都设置好

- 以上Interfaces的执行顺序
ApplicationEventPublisherAware -> ApplicationContextAware -> InitializingBean.

RabbitAdmin借助于 ApplicationContextAware 和 InitializingBean来获取我们在配置类中声明的exchange, queue, binding beans等信息并调用channel的相应方法来声明。
- 首先,RabbitAdmin借助于ApplicationContextAware来获取ApplicationContext applicationContext
- 然后，借助于InitializingBean以及上面的applicationContext来实现rabbitMQ entity的声明


下面是RabbitAdmin中afterPropertiesSet()函数的代码片段。这里在创建connection的时候调用函数initialize()。
于是以此为突破口进行源码分析
- RabbitAdmin#afterPropertiesSet
![](https://img-blog.csdnimg.cn/20190702050143931.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
这里

最后分别调用函数declareExchanges(),declareQueues(),declareBindings()来声明RabbitMQ Entity

- 先定义了三个集合,利用applicationContext.getBeansOfType来获得container中的Exchange，Queue,Binding声明放入集合中
![](https://img-blog.csdnimg.cn/20190702050619423.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)


- 然后调用filterDeclarables()来过滤不能declareable的bean![](https://img-blog.csdnimg.cn/20190702051006589.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 按照RabbitMQ的方式拼接
![](https://img-blog.csdnimg.cn/20190702055307309.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 使用rabbitTemplate执行交互
![](https://img-blog.csdnimg.cn/20190702055350722.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## 2.2 实操

回顾一下消费者配置
```
1. 设置交换机类型

2. 将队列绑定到交换机

交换机类型：

    FanoutExchange 类型: 将消息分发到所有的绑定队列，无 routingkey 的概念

    HeadersExchange 类型：通过添加属性 key-value 匹配

    DirectExchange :按照 routingkey 分发到指定队列

    TopicExchange : 多关键字匹配

```
![](https://img-blog.csdnimg.cn/20190702065621582.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

- 测试代码![](https://img-blog.csdnimg.cn/20190702065336309.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 查看管控台![](https://img-blog.csdnimg.cn/20190702065439712.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190702065520705.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
# 3 SpringAMQP - RabbitMQ声明式配置使用
SpringAMQP 声明即在 rabbit 基础 API 里面声明一个 exchange、Bingding、queue。使用SpringAMQP 去声明，就需要使用 @Bean 的声明方式
![](https://img-blog.csdnimg.cn/20190702082752208.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 查看管控台![](https://img-blog.csdnimg.cn/20190702090044875.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190702092111226.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
# 3 消息模板 - RabbitTemplate
上节中最后提到,这是与与 SpringAMQP 整合发送消息的关键类,它提供了丰富的发送消息方法
包括可靠性投递消息方法、回调监听消息接口 `ConfirmCallback`、返回值确认接口 `ReturnCallback `等.
同样我们需要注入到 Spring 容器中，然后直接使用.
RabbitTemplate 在 Spring 整合时需要实例化，但是在 Springboot 整合时，在配置文件里添加配置即可
- 先声明bean
![](https://img-blog.csdnimg.cn/20190702094556582.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 测试![](https://img-blog.csdnimg.cn/20190702095800431.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
# 4 SpringAMQP消息容器-SimpleMessageListenerContainer
这个类非常的强大，我们可以对他进行很多的设置，用对于消费者的配置项，这个类都可以满足。它有监听单个或多个队列、自动启动、自动声明功能。
- 设置事务特性、事务管理器、事务属性、事务并发、是否开启事务、回滚消息等。但是我们在实际生产中，很少使用事务，基本都是采用补偿机制
- 设置消费者数量、最小最大数量、批量消费
- 设置消息确认和自动确认模式、是否重回队列、异常捕获 Handler 函数
- 设置消费者标签生成策略、是否独占模式、消费者属性等
- 设置具体的监听器、消息转换器等等。

> SimpleMessageListenerContainer 可以进行动态设置，比如在运行中的应用可以动态的修改其消费者数量的大小、接收消息的模式等。
- 很多基于 RabbitMQ 的自制定化后端管控台在进行设置的时候，也是根据这一去实现的
![](https://img-blog.csdnimg.cn/20190702103609861.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190702103830482.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190702103941759.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190702104108857.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190702104212629.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
# 5 SpringAMQP消息适配器-MessageListenerAdapter
消息监听适配器,通过反射将消息处理委托给目标监听器的处理方法,并进行灵活的消息类型转换.
允许监听器方法对消息内容类型进行操作,完全独立于RabbitMQ API

默认情况下，传入Rabbit消息的内容在被传递到目标监听器方法之前被提取，以使目标方法对消息内容类型进行操作以String或者byte类型进行操作，而不是原始Message类型。 （消息转换器）
消息类型转换委托给MessageConverter接口的实现类。 默认情况下，将使用SimpleMessageConverter。 （如果您不希望进行这样的自动消息转换，
那么请自己通过#setMessageConverter MessageConverter设置为null）

如果目标监听器方法返回一个非空对象（通常是消息内容类型，例如String或byte数组），它将被包装在一个Rabbit Message 中，并发送使用来自Rabbit ReplyTo属性或通过#setResponseRoutingKey(String)指定的routingKey的routingKey来传送消息。（使用rabbitmq 来实现异步rpc功能时候会使用到这个属性）。

注意：发送响应消息仅在使用ChannelAwareMessageListener入口点（通常通过Spring消息监听器容器）时可用。 用作MessageListener不支持生成响应消息。

## 源码分析
![](https://img-blog.csdnimg.cn/20190703112518590.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
继承自`AbstractAdaptableMessageListener`类,实现了`MessageListener`和`ChannelAwareMessageListener`接口
而`MessageListener`和`ChannelAwareMessageListener`接口的`onMessage`方法就是具体容器监听队列处理队列消息的方法


![](https://img-blog.csdnimg.cn/20190703112741904.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## 实操
- 委托类MessageDelegate,类中定义的方法也就是目标监听器的处理方法
![](https://img-blog.csdnimg.cn/20190703110706732.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 配置类代码![](https://img-blog.csdnimg.cn/20190703110826994.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 运行测试代码
![](https://img-blog.csdnimg.cn/20190703110927685.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 结果
![](https://img-blog.csdnimg.cn/2019070311101753.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)


从源码分析小节中的成员变量,我们可以看出使用MessageListenerAdapter处理器进行消息队列监听处理
- 如果容器没有设置setDefaultListenerMethod
则处理器中默认的处理方法名是`handleMessage`
- 如果设置了setDefaultListenerMethod
![](https://img-blog.csdnimg.cn/20190703113640114.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
则处理器中处理消息的方法名就是setDefaultListenerMethod方法参数设置的值
![](https://img-blog.csdnimg.cn/20190703113929481.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

也可以通过setQueueOrTagToMethodName方法为不同的队列设置不同的消息处理方法。
`MessageListenerAdapter`的`onMessage`方法
- 如果将参数改为String运行会出错!应当是字节数组,这时就需要使用转换器才能保证正常运行
![](https://img-blog.csdnimg.cn/20190703114102112.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 使用转换器
![](https://img-blog.csdnimg.cn/20190703114713677.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703114734657.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703115029275.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
测试代码运行成功!
![](https://img-blog.csdnimg.cn/20190703120217719.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703120434742.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703120525213.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
# 6 消息转换器 - MessageConverter
我们在进行发送消息的时候，正常情况下消息体为二进制的数据方式进行传输，如果希望内部帮我们进行转换，或者指定自定义的转换器，就需要用到 `MessageConverter `了

- 我们自定义常用转换器,都需要实现这个接口,然后重写其中的两个方法
![](https://img-blog.csdnimg.cn/20190703124244469.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## 常见的转换器
- Json 转换器 - jackson2JsonMessageConverter
Java 对象的转换功能

- DefaultJackson2JavaTypeMapper 映射器
Java对象的映射关系
- 自定义二进制转换器
比如图片类型、PDF、PPT、流媒体
## 实操
- Order类
![](https://img-blog.csdnimg.cn/20190703124732639.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703124859608.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 配置JSON转换器![](https://img-blog.csdnimg.cn/20190703125153881.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 测试代码
![](https://img-blog.csdnimg.cn/2019070312561814.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703125706999.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 配置Java对象转换器
![](https://img-blog.csdnimg.cn/20190703130109286.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 测试代码及结果
![](https://img-blog.csdnimg.cn/20190703130309588.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 多个Java对象映射转换![](https://img-blog.csdnimg.cn/20190703130554776.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 测试代码及结果
![](https://img-blog.csdnimg.cn/2019070313131050.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703131346801.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 全局转换器
![](https://img-blog.csdnimg.cn/20190703182004723.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 图片转换器实现
![](https://img-blog.csdnimg.cn/20190703182523521.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- PDF转换器实现
![](https://img-blog.csdnimg.cn/20190703182650464.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703185719599.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 测试代码及结果
![](https://img-blog.csdnimg.cn/20190703185752598.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)![](https://img-blog.csdnimg.cn/20190703185834535.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
# 7 RabbitMQ与SpringBoot2.x整合实战
## 7.1 配置详解
- publisher-confirms 
实现一个监听器监听 broker  给我们返回的确认请求`RabbitTemplate.ConfirmCallback`

- publisher-returns
保证消息对 broker 可达,若出现路由键不可达情况,则使用监听器对不可达消息后续处理,保证消息路由成功 - ` RabbitTemplate.ReturnCallback`
> 在发送消息的时候对 template 进行配置 `mandatory = true` 保证监听有效
> 在生产端还可以配置其他属性，比如发送重试、超时时间、次数、间隔等
## Pro
- 配置文件
![](https://img-blog.csdnimg.cn/20190703191738927.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 主配置
![](https://img-blog.csdnimg.cn/20190703190758641.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

- 添加一个自定义的交换机
![](https://img-blog.csdnimg.cn/20190703225705132.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 添加一个Q
![](https://img-blog.csdnimg.cn/20190703230430261.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 建立绑定关系
![](https://img-blog.csdnimg.cn/20190703230941421.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703231011535.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190703233404929.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 测试及结果
![](https://img-blog.csdnimg.cn/20190703235354725.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## Con配置
消费端的 RabbitListener 是一个组合注解，里面可以注解配置 。
@QueueBinding @Queue @Exchange 直接通过这个组合注解一次性搞定消费端交换机、队列、绑定、路由、并且配置监听功能等。

- 将Pro中的绑定全部删除,再启动Con的sb服务
![](https://img-blog.csdnimg.cn/20190704000336742.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190704000401500.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## 发送一个 Java 实体对象
- 在Con声明队列、交换机、routingKey基本配置
![](https://img-blog.csdnimg.cn/20190704092634274.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- Con
![](https://img-blog.csdnimg.cn/20190704092733133.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
> Payload 注解中的路径要跟Pro的实体路径完全一致，要不然会找到不到该类,这里为了简便就不写一个 common.jar 了，在实际开发里面，这个 Java Bean 应该放在 common.jar中

- 注意实体要实现 Serializable 序列化接口，要不然发送消息会失败
![](https://img-blog.csdnimg.cn/20190704093852589.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- Pro 照样跟着写一个发消息的方法
![](https://img-blog.csdnimg.cn/20190704094016584.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 测试代码及结果
![](https://img-blog.csdnimg.cn/20190704094212455.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190704094310427.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
# 8  RabbitMQ & Spring Cloud Stream整合实战
Spring Cloud全家桶在整个中小型互联网公司异常的火爆,Spring Cloud Stream也就渐渐的被大家所熟知,本小节主要来绍RabbitMQ与Spring Cloud Stream如何集成
## 8.1 编程模型
要了解编程模型，您应该熟悉以下核心概念
- 目标绑定器
提供与外部消息传递系统集成的组件
- 目标绑定
外部消息传递系统和应用程序之间的桥接提供的生产者和消费者消息（由目标绑定器创建）
- 消息
生产者和消费者用于与目标绑定器（以及通过外部消息传递系统的其他应用程序）通信的规范数据结构
![](https://img-blog.csdnimg.cn/20190704100414674.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## 8.2 应用模型
Spring Cloud Stream应用程序由中间件中立核心组成。该应用程序通过Spring Cloud Stream注入其中的输入和输出通道与外界通信。通过中间件特定的Binder实现，通道连接到外部代理。
![](https://img-blog.csdnimg.cn/20190704100544237.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## 8.3 RabbitMQ绑定概述![](https://img-blog.csdnimg.cn/20190704101501891.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
默认情况下，RabbitMQ Binder实现将每个目标映射到TopicExchange。对于每个使用者组，Queue绑定到该TopicExchange。每个使用者实例都为其组的Queue具有相应的RabbitMQ Consumer实例。对于分区生成器和使用者，队列以分区索引为后缀，并使用分区索引作为路由键。对于匿名使用者（没有组属性的用户），使用自动删除队列（具有随机的唯一名称）。

Barista接口: Barista接口是定义来作为后面类的参数，这一接口定义来通道类型和通道名称，通道名称是作为配置用，通道类型则决定了app会使用这一 通道进行发送消息还是从中接收消息

## 8.4 扩展 - 注解
- @Output:输出注解，用于定义发送消息接口
- @Input:输入注解，用于定义消息的消费者接口
- @StreamListener:用于定义监听方法的注解

使用Spring Cloud Stream非常简单，只需要使用好这3个注解即可，在实现高性能消息的生产和消费的场景非常适合，但是使用SpringCloudStream框架有一个非常大的问题就是不能实现可靠性的投递，也就是没法保证消息的100%可靠性，会存在少量消息丢失的问题

这个原因是因为SpringCloudStream框架为了和Kafka兼顾所以在实际工作中使用它的目的就是针对高性能的消息通信的!这点就是在当前版本Spring Cloud Stream的定位

## 8.5 实操
### Pro
- pom核心文件
![](https://img-blog.csdnimg.cn/20190704105257283.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- Sender
![](https://img-blog.csdnimg.cn/20190704110913136.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
注解`@EnableBinding`声明了这个应用程序绑定了2个通道：INPUT和OUTPUT。这2个通道是在接口`Barista`中定义的（Spring Cloud Stream默认设置）。所有通道都是配置在一个具体的消息中间件或绑定器中
- Barista接口
![](https://img-blog.csdnimg.cn/20190704112934707.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
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
![](https://img-blog.csdnimg.cn/20190704113317198.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 应用启动类
![](https://img-blog.csdnimg.cn/20190704113434327.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- Barista接口
![](https://img-blog.csdnimg.cn/20190704113713148.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 配置文件
![](https://img-blog.csdnimg.cn/20190704114526499.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 接收
![](https://img-blog.csdnimg.cn/20190704114755779.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 启动Con服务,查看管控台
![](https://img-blog.csdnimg.cn/2019070411503383.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190704115119708.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/201907041151564.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
- 运行Pro测试代码及结果
![](https://img-blog.csdnimg.cn/2019070411543336.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190704115517511.png)
![](https://img-blog.csdnimg.cn/2019070411555535.png)

# 9 总结
本文我们学习了Spring AMQP的相关知识,通过实战对RabbitMQ集成Spring有了直观的认识，这样为
我们后续的学习、工作使用都打下了坚实的基础，最后我们整合了SpringBoot与Spring Cloud Stream,更方便更高效的集成到我们的应用服务中去!
# 参考
[SpringAMQP 用户管理组件 RabbitAdmin 以及声明式配置](https://juejin.im/post/5c541218e51d450134320378)
[Spring Boot - RabbitMQ源码分析](https://zhuanlan.zhihu.com/p/54450318)
[SpringAMQP 之 RabbitTemplate](https://juejin.im/post/5c5c29efe51d457fff4102f1)
[SpringAMQP 消息容器 - SimpleMessageListenerContainer](https://juejin.im/user/5c3dfed2e51d4552232fc9cd)
[MessageListenerAdapter详解](https://www.jianshu.com/p/d21bafe3b9fd)
[SpringAMQP 消息转换器 - MessageConverter](https://juejin.im/post/5c5d925de51d457fc75f7a0c)
[RabbitMQ 与 SpringBoot2.X 整合](https://juejin.im/post/5c64e3fd6fb9a049d132a557)
[Spring Cloud Stream](https://cloud.spring.io/spring-cloud-static/spring-cloud-stream/2.2.0.RELEASE/spring-cloud-stream.html#spring-cloud-stream-reference)

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)