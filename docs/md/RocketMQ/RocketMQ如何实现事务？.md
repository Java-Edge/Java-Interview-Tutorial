# RocketMQ如何实现事务？

面试中经常会问到比如RocketMQ的事务是如何实现的呢？学习框架，不仅要熟练使用，更要掌握设计及原理，才算熟悉一个框架。

基于 rocketmq 4.9.4

## 1 RocketMQ 事务使用案例-订单创建

```java
public class CreateOrderService {

  @Autowired
  private OrderDao orderDao;
  @Autowired
  private ExecutorService executorService;

  private TransactionMQProducer producer;

  // 初始化transactionListener和发生RocketMQ事务消息的变量producer
  @Init
  public void init() throws MQClientException {
    TransactionListener transactionListener = createTransactionListener();
    producer = new TransactionMQProducer("myGroup");
    producer.setExecutorService(executorService);
    producer.setTransactionListener(transactionListener);
    producer.start();
  }

  // 创建订单服务的请求入口
  // 真正提供创建订单服务的方法，根据入参创建一条消息，然后调用producer发事务消息，并返回事务执行结果
  @PUT
  @RequestMapping(...)
  public boolean createOrder(@RequestBody CreateOrderRequest request) {
    // 根据创建订单请求，创建一条消息
    Message msg = createMessage(request);
    // 发事务消息
    SendResult sendResult = producer.sendMessageInTransaction(msg, request);
    // 返回：事务是否成功
    return sendResult.getSendStatus() == SendStatus.SEND_OK;
  }

  private TransactionListener createTransactionListener() {
    return new TransactionListener() {
      @Override
      public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        CreateOrderRequest request = (CreateOrderRequest ) arg;
        try {
          // 执行本地事务创建订单
          orderDao.createOrderInDB(request);
          // 如果没抛异常说明执行成功，提交事务消息
          return LocalTransactionState.COMMIT_MESSAGE;
        } catch (Throwable t) {
          // 失败则直接回滚事务消息
          return LocalTransactionState.ROLLBACK_MESSAGE;
        }
      }
      
      // 反查本地事务
      @Override
      public LocalTransactionState checkLocalTransaction(MessageExt msg) {
        // 从消息中获得订单ID
        String orderId = msg.getUserProperty("orderId");

        // 去db查询订单号是否存在，若存在则提交事务
        // 若不存在，可能是本地事务失败了，也可能是本地事务还在执行，所以返回UNKNOW
        return orderDao.isOrderIdExistsInDB(orderId)?
                LocalTransactionState.COMMIT_MESSAGE: LocalTransactionState.UNKNOW;
      }
    };
  }
}
```

往db插一条订单记录，并发一条创建订单的消息，要求写db和发消息俩个操作在一个事务内执行。

createTransactionListener()在init()中调用，构造实现RocketMQ的TransactionListener接口的匿名类。

### TransactionListener

该接口需实现如下方法：

#### executeLocalTransaction

```java
package org.apache.rocketmq.client.producer;

import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.common.message.MessageExt;

public interface TransactionListener {
    /**
     * 当发送事务的半消息成功时，将调用此方法执行本地事务
     *
     * @param msg 半消息
     * @param arg 自定义业务参数
     * @return 事务状态
     */
    LocalTransactionState executeLocalTransaction(final Message msg, final Object arg);
```

直接把订单数据插入DB，并返回本地事务执行结果

#### checkLocalTransaction

```java
/**
 * 当半消息未得到响应，broker将发送检查事务状态的消息，该方法就会被调用来获取本地事务的状态
 */
LocalTransactionState checkLocalTransaction(final MessageExt msg);
```

反查本地事务，上述流程中是在db中查询订单号是否存在，若存在则提交事务，若不存在，可能本地事务失败了，也可能本地事务还在执行，所以返回UNKNOW

## 2 RocketMQ事务消息实现原理

### 2.1 Pro咋发事务消息？

#### sendMessageInTransaction

DefaultMQProducerImpl#sendMessageInTransaction

```java
public TransactionSendResult sendMessageInTransaction(final Message msg,
    final LocalTransactionExecuter localTransactionExecuter, final Object arg) {
    SendResult sendResult = null;
    // 给待发送消息添加属性，表明是事务消息（即半消息）
    MessageAccessor.putProperty(msg, MessageConst.PROPERTY_TRANSACTION_PREPARED, "true");
    // 像发送普通消息，把这条事务消息发往Broker
    try {
        sendResult = this.send(msg);
    }
    LocalTransactionState localTransactionState = LocalTransactionState.UNKNOW;
    Throwable localException = null;
    switch (sendResult.getSendStatus()) {
        // 事务消息发送成功
        case SEND_OK: {
            try {
                String transactionId = msg.getProperty(MessageConst.PROPERTY_UNIQ_CLIENT_MESSAGE_ID_KEYIDX);
                msg.setTransactionId(transactionId);
                // 开始执行本地事务
                localTransactionState = transactionListener.executeLocalTransaction(msg, arg);
            }
        }
    }
    // 事务过程的最后，给Broker发送提交或回滚事务的RPC请求。
    try {
        this.endTransaction(sendResult, localTransactionState, localException);
    }
}
```

#### endTransaction

DefaultMQProducerImpl#endTransaction

```java
public void endTransaction(
    final SendResult sendResult,
    final LocalTransactionState localTransactionState,
    final Throwable localException) {

    // 根据事务消息和本地事务的执行结果localTransactionState，决定后续行为
    // producer就是给Broker发送了一个单向的RPC请求，告知Broker完成事务的提交或者回滚
    switch (localTransactionState) {
        // 提交事务消息
        case COMMIT_MESSAGE:
            requestHeader.setCommitOrRollback(MessageSysFlag.TRANSACTION_COMMIT_TYPE);
            break;
        // 回滚事务消息
        case ROLLBACK_MESSAGE:
            requestHeader.setCommitOrRollback(MessageSysFlag.TRANSACTION_ROLLBACK_TYPE);
            break;
    }
    this.mQClientFactory.getMQClientAPIImpl().endTransactionOneway(brokerAddr, requestHeader, remark,
        this.defaultMQProducer.getSendMsgTimeout());
}
```

有事务反查机制作兜底，该RPC请求即使失败或丢失，也不会影响事务最终的结果。最后构建事务消息的发送结果，并返回。

### 2.2 Broker咋处理事务消息？

#### SendMessageProcessor#asyncSendMessage

```java
CompletableFuture<PutMessageResult> putMessageResult = null;
String transFlag = origProps.get(MessageConst.PROPERTY_TRANSACTION_PREPARED);
if (Boolean.parseBoolean(transFlag)) {
    if (this.brokerController.getBrokerConfig().isRejectTransactionMessage()) {
        response.setCode(ResponseCode.NO_PERMISSION);
        return CompletableFuture.completedFuture(response);
    }
    putMessageResult = this.brokerController.getTransactionalMessageService().asyncPrepareMessage(msgInner);
} else {
    putMessageResult = this.brokerController.getMessageStore().asyncPutMessage(msgInner);
}
```

进去看真正处理半消息的业务逻辑，这段处理逻辑在类

#### TransactionalMessageBridge

putHalfMessage

```java
public PutMessageResult putHalfMessage(MessageExtBrokerInner messageInner) {
    return store.putMessage(parseHalfMessageInner(messageInner));
}
```

parseHalfMessageInner

```java
private MessageExtBrokerInner parseHalfMessageInner(MessageExtBrokerInner msgInner) {
    // 记录消息的 topic 和 queue，到新的属性中
    MessageAccessor.putProperty(msgInner, MessageConst.PROPERTY_REAL_TOPIC, msgInner.getTopic());
    MessageAccessor.putProperty(msgInner, MessageConst.PROPERTY_REAL_QUEUE_ID,
        String.valueOf(msgInner.getQueueId()));
    msgInner.setSysFlag(
        MessageSysFlag.resetTransactionValue(msgInner.getSysFlag(), MessageSysFlag.TRANSACTION_NOT_TYPE));
    // 替换消息的 topic 为 RMQ_SYS_TRANS_HALF_TOPIC
    msgInner.setTopic(TransactionalMessageUtil.buildHalfTopic());
    // 替换消息的 queue 为 0
    msgInner.setQueueId(0);
    msgInner.setPropertiesString(MessageDecoder.messageProperties2String(msgInner.getProperties()));
    return msgInner;
}
```

#### 设计思想

RocketMQ并非将事务消息保存至消息中 client 指定的 queue，而是记录原 topic、queue 后，把这事务消息保存在

- 特殊内部 topic：`RMQ_SYS_TRANS_HALF_TOPIC`
- 序号为 `0` 的 queue

这套 topic、queue 对Con不可见，因此里面的**消息也永远不会被消费**。保证在事务提交成功前，Con 是消费不到这事务消息的。

### 2.3 Broker咋事务反查?

在Broker的TransactionalMessageCheckService服务中启动了一个定时器，定时从事务消息queue中读出所有待反查的事务消息。

AbstractTransactionalMessageCheckListener#resolveHalfMsg

针对每个需要反查的半消息，Broker会给对应的Producer发一个要求执行事务状态反查的RPC请求

```java
public void resolveHalfMsg(final MessageExt msgExt) {
    executorService.execute(new Runnable() {
        @Override
        public void run() {
            try {
                sendCheckMessage(msgExt);
            } catch (Exception e) {
                LOGGER.error("Send check message error!", e);
            }
        }
    });
}
```

AbstractTransactionalMessageCheckListener#sendCheckMessage

```java
public void sendCheckMessage(MessageExt msgExt) {
    CheckTransactionStateRequestHeader checkTransactionStateRequestHeader = new CheckTransactionStateRequestHeader();
    checkTransactionStateRequestHeader.setCommitLogOffset(msgExt.getCommitLogOffset());
    checkTransactionStateRequestHeader.setOffsetMsgId(msgExt.getMsgId());
    checkTransactionStateRequestHeader.setMsgId(msgExt.getUserProperty(MessageConst.PROPERTY_UNIQ_CLIENT_MESSAGE_ID_KEYIDX));
    checkTransactionStateRequestHeader.setTransactionId(checkTransactionStateRequestHeader.getMsgId());
    checkTransactionStateRequestHeader.setTranStateTableOffset(msgExt.getQueueOffset());
    msgExt.setTopic(msgExt.getUserProperty(MessageConst.PROPERTY_REAL_TOPIC));
    msgExt.setQueueId(Integer.parseInt(msgExt.getUserProperty(MessageConst.PROPERTY_REAL_QUEUE_ID)));
    msgExt.setStoreSize(0);
    String groupId = msgExt.getProperty(MessageConst.PROPERTY_PRODUCER_GROUP);
    Channel channel = brokerController.getProducerManager().getAvailableChannel(groupId);
    if (channel != null) {
        // 针对每个需要反查的半消息，Broker会给对应Producer发送要求执行事务状态反查的RPC请求
        brokerController.getBroker2Client().checkProducerTransactionState(groupId, channel, checkTransactionStateRequestHeader, msgExt);
    } else {
        LOGGER.warn("Check transaction failed, channel is null. groupId={}", groupId);
    }
}
```

Broker2Client#checkProducerTransactionState

```java
public void checkProducerTransactionState(
    final String group,
    final Channel channel,
    final CheckTransactionStateRequestHeader requestHeader,
    final MessageExt messageExt) throws Exception {
    // Broker给对应Producer发送要求执行 事务状态反查的RPC请求
    RemotingCommand request =
        RemotingCommand.createRequestCommand(RequestCode.CHECK_TRANSACTION_STATE, requestHeader);
    request.setBody(MessageDecoder.encode(messageExt, false));
    try {
        this.brokerController.getRemotingServer().invokeOneway(channel, request, 10);
    } catch (Exception e) {
        log.error("Check transaction failed because invoke producer exception. group={}, msgId={}, error={}",
                group, messageExt.getMsgId(), e.toString());
    }
}
```

根据RPC返回响应中的反查结果，来决定这个半消息是需要提交还是回滚，或者后续继续来反查。

最后，提交或者回滚事务。首先把半消息标记为已处理

1. 如果是提交事务，就把半消息从半消息队列中复制到该消息真正的topic和queue中
2. 如果是回滚事务，什么都不做

EndTransactionProcessor#processRequest

```java
// 如果是回滚事务
else if (MessageSysFlag.TRANSACTION_ROLLBACK_TYPE == requestHeader.getCommitOrRollback()) {
    result = this.brokerController.getTransactionalMessageService().rollbackMessage(requestHeader);
    if (result.getResponseCode() == ResponseCode.SUCCESS) {
        RemotingCommand res = checkPrepareMessage(result.getPrepareMessage(), requestHeader);
        if (res.getCode() == ResponseCode.SUCCESS) {
            this.brokerController.getTransactionalMessageService().deletePrepareMessage(result.getPrepareMessage());
        }
        return res;
    }
}
```

最后结束该事务。

## 3 总结

整体实现流程

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/0f5aec188c3d691417da8567eeba27a9.png)

RocketMQ是基于两阶段提交来实现的事务，把这些事务消息暂存在一个特殊的queue中，待事务提交后再移动到业务队列中。最后，RocketMQ的事务适用于解决本地事务和发消息的数据一致性问题。

参考：

- https://juejin.im/post/6844904193526857742