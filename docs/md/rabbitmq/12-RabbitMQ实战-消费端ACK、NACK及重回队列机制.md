# 12-RabbitMQ实战-消费端ACK、NACK及重回队列机制

## 0 前言

当连接失败时，消息可能还在客户端和服务器之间传输 - 它们可能处于两侧的解码或编码的中间过程，在 TCP 堆栈缓冲区中，或在电线上飞行。
在这种情况下，传输中的信息将无法正常投递 - 它们需要被重新投递。Acknowledgements机制让服务器和客户端知道何时需要重新投递。

根据定义，使用消息代理（如RabbitMQ）的系统是分布式的。由于发送的协议方法（消息）不能保证到达协作方或由其成功处理，因此发布者和消费者都需要一个投递和处理确认的机制。

- 从Consumer到 RabbitMQ 的投递处理确认，在消息协议中即`acknowledgements`
- broker对publishers的确认是一个协议扩展，即`publisher confirms`

这两个功能都启发于 TCP。它们对于从publisher到broker和从broker到consumer的可靠投递都至关重要。即对数据安全至关重要，应用程序对数据安全的责任与broker一样多。

当 RabbitMQ 向 Con 传递消息时，它要知道何时考虑该消息才能成功发送。啥逻辑最佳取决于系统。因此，它主要是应用决定的。在 AMQP 0-9-1 中，当 Con：

- 使用`basicConsume`方法进行注册

```java
/**
 * 启动一个非本地、非独占的 consumer，并由服务器生成 consumerTag。
 * @param queue 队列的名称
 * @param autoAck 如果为 true，则服务器应视消息一旦传递即被确认；如果为 false，则服务器应等待显式确认。
 * @param callback consumer 对象的接口
 * @return 服务器生成的 consumerTag
 */
String basicConsume(String queue, boolean autoAck, Consumer callback);
```



- 或使用`basicGet` 方法按需获取消息

```java
/**
 * 通过com.rabbitmq.client.AMQP.Basic.Get从队列中检索消息
 * @param queue 队列的名称
 * @param autoAck 如果为 true，则服务器应视消息一旦传递即被确认；如果为 false，则服务器应等待显式确认。
 * @return 包含已检索消息数据的 {@link GetResponse}
 */
GetResponse basicGet(String queue, boolean autoAck);
```

就会进行。

## 1 消费者确认模式和数据安全考量

当节点向Con传递消息，它必须决定该消息是否应由Con考虑处理（或至少接收）。由于多种内容（客户端连接、消费者应用等）可能会失败，因此此决定是数据安全问题。消息传递协议通常提供一个确认机制，允许Con确认交付到他们连接到的节点。是否使用该机制由Con订阅时决定。

根据使用的确认模式，RabbitMQ可考虑在消息发出后：

- 立即成功传递（写入 TCP socket）
- 或收到明确（'manual'）客户确认时。手动发送的确认可能是ack、nack，并使用以下协议方法之一：
  - basic.ack：积极确认
  - basic.nack：消极确认
  - basicReject：消极确认，但还有一个limitation

```java
void basicReject(long deliveryTag, boolean requeue) throws IOException;
```

### 开启消费确认

```properties
spring.rabbitmq.listener.simple.acknowledge-mode=manual
```

Con ACK就是确认是否消费成功：

- NONE（自动确认/不确认）- 消费者收到消息后即自动确认，无论消息是否正确处理，都不会进一步检查。可能导致某些情况下消息丢失（如消费者处理失败时，RabbitMQ仍认为消息已成功处理）
- AUTO（自动处理确认）- RabbitMQ默认的模式。如果消费者处理消息时没有抛出异常，RabbitMQ会自动确认消息；如果处理时出现异常，消息将被重新投递，等待再次消费
- MANUAL（手动确认）- 若抛异常，消息不会丢失，一直处Unacked状态，消息不会再次发送给其他消费者。可选择显式关闭连接，消息会恢复到Ready状态并重新投递。消费者需要显式调用`ack`方法确认消息成功处理。如果消费者没有确认（如抛出异常或未处理消息），消息会保持在未确认状态（Unacked），不会再次投递。关闭消费者连接时，未确认的消息会重新回到队列中。

手动确认模式（MANUAL）适用于需要更精细控制的场景，能够确保消息不会因为处理失败而丢失。

## 2 投递标识：Delivery Tags

如何确定投递（确认表明他们各自的投递）。

当一个 Con（订阅）被注册，MQ将使用`basic.deliver`方法发送（推送）消息。该方法带有delivery tag，该tag可唯一标识channel上的投递。因此，Delivery tags作用域在每个 channel 内。

Delivery Tags是单调增长的正整数，由客户库提供。客户端库方法，承认交付以交付标签作为参数。由于每个通道的递送标签范围很广，因此必须在接收的同一通道上确认交付。在不同的通道上确认将导致'未知交货标签'协议异常并关闭通道。

## 3 ACK投递

用于交付确认的 API 方法通常暴露为客户库中通道上的操作。Java 客户端用户将使用channel：

```java
// 假设已有channel实例
boolean autoAck = false;
channel.basicConsume(queueName, autoAck, "a-consumer-tag",
     new DefaultConsumer(channel) {
         @Override
         public void handleDelivery(String consumerTag,
                                    Envelope envelope,
                                    AMQP.BasicProperties properties,
                                    byte[] body)
             throws IOException
         {
             long deliveryTag = envelope.getDeliveryTag();
             // positively acknowledge a single delivery, the message will
             // be discarded
             channel.basicAck(deliveryTag, false);
         }
     });
```

## 4 Acknowledging Multiple Deliveries at Once

Manual确认模式可批量进行，以减少网络流量。basicReject史上都无该字段，这就是为啥basicNack被MQ引入作为协议的扩展。

将acknowledgement方法的`multiple`字段置`true`来实现：

- multiple=true：MQ 将确认所有未完成的delivery tag，并包括确认中指定的tag。与确认相关其他内容一样，这个作用域是channel内。比如，若channel Ch有未确认的delivery tag 5、6、7、8，当一个`delivery tag=8`、`multiple=true`的acknowledgement frame到达该channel，则从 5 到 8 的所有投递都将被确认
- multiple=false：仍不确认投递 5、6 和 7

要确认与MQ Java客户端的多次投递，将Channel#basicAck的multiple参数置true。

```java
boolean autoAck = false;
channel.basicConsume(queueName, autoAck, "a-consumer-tag",
     new DefaultConsumer(channel) {
         @Override
         public void handleDelivery(String consumerTag,
                                    Envelope envelope,
                                    AMQP.BasicProperties properties,
                                    byte[] body)
             throws IOException
         {
             long deliveryTag = envelope.getDeliveryTag();
             // positively acknowledge all deliveries up to
             // this delivery tag
             channel.basicAck(deliveryTag, true);
         }
     });
```

## 5 NACK和Requeuing of Deliveries

有时，消费者无法及时处理投递，但其他实例可能能够处理。这时可能更想让它重新入队，让其他Con接收和处理它。
`basicReject`和`basicNack`就是用于实现这种想法的两个协议方法。这些方法通常用于消极地确认投递。

此类投递可被Broker丢弃或重新入队。此行为由`requeue`字段控制：

- 当字段设置为true，Broker将用指定的delivery tag重新入队投递（或多个投递）。

这两个方法通常暴露作为客户端库中channel上的操作。Java 客户端用户可以调用：

- Channel#basicReject
- Channel#basicNack

```java
boolean autoAck = false;
channel.basicConsume(queueName, autoAck, "a-consumer-tag",
     new DefaultConsumer(channel) {
         @Override
         public void handleDelivery(String consumerTag,
                                    Envelope envelope,
                                    AMQP.BasicProperties properties,
                                    byte[] body)
             throws IOException
         {
             long deliveryTag = envelope.getDeliveryTag();
             // negatively acknowledge, the message will
             // be discarded
             channel.basicReject(deliveryTag, false);
         }
     });
```

### 消费端的重回队列

重回队列针对没有处理成功的消息，将消息重新投递给Broker。
重回队列会把消费失败的消息重新添加到队列尾端，供Con重新消费。
一般在实际应用中，都会关闭重回队列，即设置为false。

## 6 RabbitMQ ACK 机制的意义

ACK机制可保证Con拉取到了消息，若处理失败了，则队列中还有这个消息，仍然可以给Con处理。

ack机制是 Con 告诉 Broker 当前消息是否成功消费，至于 Broker 如何处理 NACK，取决于 Con 是否设置了 requeue：若 requeue=false， 则NACK 后 Broker 还是会删除消息的。

但一般处理消息失败都是因为代码逻辑出bug，即使队列中后来仍然保留该消息，然后再给Con消费，依旧报错。当然，若一台机器宕机，消息还有，还可以给另外机器消费，这种情景下 ACK 很有用。

若不使用 ACK 机制，直接把出错消息存库，便于日后查bug或重新执行。 参考 Quartz 定时任务调度，Quartz可以让失败的任务重新执行一次，或者不管，或者怎么怎么样，但是 RabbitMQ 好像缺了这一点。

## 7 ACK和NACK

置` autoACK=false` 时，就可用手工ACK。手工方式包括：

- 手工ACK，会发送给Broker一个应答，代表消息处理成功，Broker就可回送响应给Pro
- 手工NACK，表示消息处理失败，若设置了重回队列，Broker端就会将没有成功处理的消息重新发送

### 使用

Con消费时，若由于业务异常，可**手工 NACK** 记录日志，然后进行补偿

```java
void basicNack(long deliveryTag, 
			   boolean multiple,
			   boolean requeue)
```

若由于服务器宕机等严重问题，就需要**手工 ACK** 保障Con消费成功

```java
void basicAck(long deliveryTag, boolean multiple)
```

## 8 实战

Con，关闭自动签收功能

```java
/**
 * ACK & 重回队列 - Con
 *
 * @author JavaEdge
 */
public class Consumer {
    public static void main(String[] args) throws Exception {
       ConnectionFactory connectionFactory = new ConnectionFactory();
       connectionFactory.setHost("localhost");
       connectionFactory.setPort(5672);
       connectionFactory.setVirtualHost("/");
       Connection connection = connectionFactory.newConnection();
       Channel channel = connection.createChannel();

       String exchangeName = "test_ack_exchange";
       String queueName = "test_ack_queue";
       String routingKey = "ack.#";
       channel.exchangeDeclare(exchangeName, "topic", true, false, null);
       channel.queueDeclare(queueName, true, false, false, null);
       channel.queueBind(queueName, exchangeName, routingKey);
       // 手工签收须关闭:autoAck = false
       channel.basicConsume(queueName, false, new MyConsumer(channel));
    }
}
```

对第一条消息（序号0）进行NACK，并设置重回队列：

```java
/**
 * ACK & 重回队列 - 自定义Con
 *
 * @author JavaEdge
 */
public class MyConsumer extends DefaultConsumer {
    private final Channel channel;

    public MyConsumer(Channel channel) {
        super(channel);
        this.channel = channel;
    }

    @Override
    public void handleDelivery(String consumerTag, Envelope envelope,
                               AMQP.BasicProperties properties, byte[] body) throws IOException {
        System.err.println("-----------Consume Message----------");
        System.err.println("body: " + new String(body));
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        if ((Integer) properties.getHeaders().get("num") == 0) {
            channel.basicNack(envelope.getDeliveryTag(), false, true);
        } else {
            channel.basicAck(envelope.getDeliveryTag(), false);
        }
    }
}
```

Pro 对消息设置序号，以便区分：

```java
/**
 * ACK & 重回队列 - Pro
 *
 * @author JavaEdge
 */
public class Producer {
    public static void main(String[] args) throws Exception {
        ConnectionFactory connectionFactory = new ConnectionFactory();
        connectionFactory.setHost("localhost");
        connectionFactory.setPort(5672);
        connectionFactory.setVirtualHost("/");

        Connection connection = connectionFactory.newConnection();
        Channel channel = connection.createChannel();

        String exchange = "test_ack_exchange";
        String routingKey = "ack.save";

        for (int i = 0; i < 3; i++) {
            Map<String, Object> headers = new HashMap<>(16);
            headers.put("num", i);
            AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder()
                    .deliveryMode(2)
                    .contentEncoding("UTF-8")
                    .headers(headers)
                    .build();
            String msg = "JavaEdge RabbitMQ ACK Message " + i;
            channel.basicPublish(exchange, routingKey, true, properties, msg.getBytes());
        }
    }
}
```

启动Con、启动Pro。这里第一条消息由于调用NACK，并设置重回队列，导致该条消息一直重复发送，消费端就会一直循环消费：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/8ea91a959977a7804f49d20c52475f3f.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/ba900cf4b51cc53bedf311b4d1b43821.png)