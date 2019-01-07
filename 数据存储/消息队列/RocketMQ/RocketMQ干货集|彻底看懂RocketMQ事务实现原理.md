> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

面试中经常会问到比如RocketMQ的事务是如何实现的呢？学习框架，我们不仅要熟练使用，更要掌握设计及原理，才算熟悉一个框架。

# 1 RocketMQ 事务使用案例

```java
public class CreateOrderService {

  @Autowired
  private OrderDao orderDao;
  @Autowired
  private ExecutorService executorService;

  private TransactionMQProducer producer;

  // 初始化transactionListener 和 producer
  @Init
  public void init() throws MQClientException {
    TransactionListener transactionListener = createTransactionListener();
    producer = new TransactionMQProducer("myGroup");
    producer.setExecutorService(executorService);
    producer.setTransactionListener(transactionListener);
    producer.start();
  }

  // 创建订单服务的请求入口
  @PUT
  @RequestMapping(...)
  public boolean createOrder(@RequestBody CreateOrderRequest request) {
    // 根据创建订单请求创建一条消息
    Message msg = createMessage(request);
    // 发送事务消息
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

如上案例展示了一个订单创建服务，即往db插一条订单记录，并发一条创建订单的消息，要求写db和发消息俩个操作在一个事务内执行。
首先在init()方法中初始化了transactionListener和发生RocketMQ事务消息的变量producer。
- createOrder()
真正提供创建订单服务的方法，根据请求的参数创建一条消息，然后调用 producer发事务消息，并返回事务执行结果。

- createTransactionListener()
在init()方法中调用，构造实现RocketMQ的TransactionListener接口的匿名类，该接口需要实现如下两个方法：
	- executeLocalTransaction：执行本地事务，在这里我们直接把订单数据插入到数据库中，并返回本地事务的执行结果。
![](https://img-blog.csdnimg.cn/20200916061414290.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

	- checkLocalTransaction：反查本地事务，上述流程中是在db中查询订单号是否存在，若存在则提交事务，若不存在，可能本地事务失败了，也可能本地事务还在执行，所以返回UNKNOW
![](https://img-blog.csdnimg.cn/20200916061525276.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

这样便使用RocketMQ的事务简单实现了一个创建订单的分布式事务。

# 2 RocketMQ事务消息实现原理

## 2.1 Pro端如何发事务消息？
### DefaultMQProducerImpl#sendMessageInTransaction
```java
    public TransactionSendResult sendMessageInTransaction(final Message msg,
        final LocalTransactionExecuter localTransactionExecuter, final Object arg)
        throws MQClientException {
        TransactionListener transactionListener = getCheckListener();
        if (null == localTransactionExecuter && null == transactionListener) {
            throw new MQClientException("tranExecutor is null", null);
        }

        // ignore DelayTimeLevel parameter
        if (msg.getDelayTimeLevel() != 0) {
            MessageAccessor.clearProperty(msg, MessageConst.PROPERTY_DELAY_TIME_LEVEL);
        }

        Validators.checkMessage(msg, this.defaultMQProducer);

        SendResult sendResult = null;
        // 给待发送消息添加属性，表明是一个事务消息（即半消息）
        MessageAccessor.putProperty(msg, MessageConst.PROPERTY_TRANSACTION_PREPARED, "true");
        MessageAccessor.putProperty(msg, MessageConst.PROPERTY_PRODUCER_GROUP, this.defaultMQProducer.getProducerGroup());
        // 像发送普通消息一样，把这条事务消息发往Broker
        try {
            sendResult = this.send(msg);
        } catch (Exception e) {
            throw new MQClientException("send message Exception", e);
        }

        LocalTransactionState localTransactionState = LocalTransactionState.UNKNOW;
        Throwable localException = null;
        switch (sendResult.getSendStatus()) {
            // 事务消息发送成功
            case SEND_OK: {
                try {
                    if (sendResult.getTransactionId() != null) {
                        msg.putUserProperty("__transactionId__", sendResult.getTransactionId());
                    }
                    String transactionId = msg.getProperty(MessageConst.PROPERTY_UNIQ_CLIENT_MESSAGE_ID_KEYIDX);
                    if (null != transactionId && !"".equals(transactionId)) {
                        msg.setTransactionId(transactionId);
                    }
                    if (null != localTransactionExecuter) {
                        localTransactionState = localTransactionExecuter.executeLocalTransactionBranch(msg, arg);
                    } else if (transactionListener != null) {
                        log.debug("Used new transaction API");
                        // 开始执行本地事务
                        localTransactionState = transactionListener.executeLocalTransaction(msg, arg);
                    }
                    if (null == localTransactionState) {
                        localTransactionState = LocalTransactionState.UNKNOW;
                    }

                    if (localTransactionState != LocalTransactionState.COMMIT_MESSAGE) {
                        log.info("executeLocalTransactionBranch return {}", localTransactionState);
                        log.info(msg.toString());
                    }
                } catch (Throwable e) {
                    log.info("executeLocalTransactionBranch exception", e);
                    log.info(msg.toString());
                    localException = e;
                }
            }
            break;
            case FLUSH_DISK_TIMEOUT:
            case FLUSH_SLAVE_TIMEOUT:
            case SLAVE_NOT_AVAILABLE:
                localTransactionState = LocalTransactionState.ROLLBACK_MESSAGE;
                break;
            default:
                break;
        }

        // 事务过程的最后，给Broker发送提交或回滚事务的RPC请求。
        try {
            this.endTransaction(sendResult, localTransactionState, localException);
        } catch (Exception e) {
            log.warn("local transaction execute " + localTransactionState + ", but end broker transaction failed", e);
        }

        TransactionSendResult transactionSendResult = new TransactionSendResult();
        transactionSendResult.setSendStatus(sendResult.getSendStatus());
        transactionSendResult.setMessageQueue(sendResult.getMessageQueue());
        transactionSendResult.setMsgId(sendResult.getMsgId());
        transactionSendResult.setQueueOffset(sendResult.getQueueOffset());
        transactionSendResult.setTransactionId(sendResult.getTransactionId());
        transactionSendResult.setLocalTransactionState(localTransactionState);
        return transactionSendResult;
    }
```
#### DefaultMQProducerImpl#endTransaction

```java
    public void endTransaction(
        final SendResult sendResult,
        final LocalTransactionState localTransactionState,
        final Throwable localException) throws RemotingException, MQBrokerException, InterruptedException, UnknownHostException {
        final MessageId id;
        if (sendResult.getOffsetMsgId() != null) {
            id = MessageDecoder.decodeMessageId(sendResult.getOffsetMsgId());
        } else {
            id = MessageDecoder.decodeMessageId(sendResult.getMsgId());
        }
        String transactionId = sendResult.getTransactionId();
        final String brokerAddr = this.mQClientFactory.findBrokerAddressInPublish(sendResult.getMessageQueue().getBrokerName());
        EndTransactionRequestHeader requestHeader = new EndTransactionRequestHeader();
        requestHeader.setTransactionId(transactionId);
        requestHeader.setCommitLogOffset(id.getOffset());
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
            case UNKNOW:
                requestHeader.setCommitOrRollback(MessageSysFlag.TRANSACTION_NOT_TYPE);
                break;
            default:
                break;
        }

        requestHeader.setProducerGroup(this.defaultMQProducer.getProducerGroup());
        requestHeader.setTranStateTableOffset(sendResult.getQueueOffset());
        requestHeader.setMsgId(sendResult.getMsgId());
        String remark = localException != null ? ("executeLocalTransactionBranch exception: " + localException.toString()) : null;
        this.mQClientFactory.getMQClientAPIImpl().endTransactionOneway(brokerAddr, requestHeader, remark,
            this.defaultMQProducer.getSendMsgTimeout());
    }

```

有事务反查机制作兜底，该RPC请求即使失败或丢失，也不会影响事务最终的结果。最后构建事务消息的发送结果，并返回。

## 2.2 Broker端如何处理事务消息？

### SendMessageProcessor#asyncSendMessage
![](https://img-blog.csdnimg.cn/20200916211653891.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

跟进去看看真正处理半消息的业务逻辑，这段处理逻辑在类
#### TransactionalMessageBridge
- putHalfMessage
![](https://img-blog.csdnimg.cn/20200916212151654.png#pic_center)
- parseHalfMessageInner
![](https://img-blog.csdnimg.cn/20200916214551186.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
### 设计思想
RocketMQ并非将事务消息保存至消息中 client 指定的 queue，而是记录了原始的 topic 和 queue 后，把这个事务消息保存在
- 特殊的内部 topic：`RMQ_SYS_TRANS_HALF_TOPIC`
-  序号为 `0` 的 queue

这套 topic 和 queue 对消费者不可见，因此里面的**消息也永远不会被消费**。这就保证在事务提交成功之前，这个事务消息对 Consumer 是消费不到的。

## 2.3 Broker端如何事务反查?
在Broker的TransactionalMessageCheckService服务中启动了一个定时器，定时从事务消息queue中读出所有待反查的事务消息。

AbstractTransactionalMessageCheckListener#resolveHalfMsg
- 针对每个需要反查的半消息，Broker会给对应的Producer发一个要求执行事务状态反查的RPC请求
![](https://img-blog.csdnimg.cn/20200916221307297.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
- AbstractTransactionalMessageCheckListener#sendCheckMessage![](https://img-blog.csdnimg.cn/20200916223006535.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
- Broker2Client#checkProducerTransactionState
![](https://img-blog.csdnimg.cn/20200916223225844.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
根据RPC返回响应中的反查结果，来决定这个半消息是需要提交还是回滚，或者后续继续来反查。

最后，提交或者回滚事务。首先把半消息标记为已处理
1. 如果是提交事务，就把半消息从半消息队列中复制到该消息真正的topic和queue中
2. 如果是回滚事务，什么都不做
- EndTransactionProcessor#processRequest
![](https://img-blog.csdnimg.cn/20200916231519852.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

最后结束该事务。
# 3 总结
- 整体实现流程
![](https://img-blog.csdnimg.cn/20200916233705701.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

RocketMQ是基于两阶段提交来实现的事务，把这些事务消息暂存在一个特殊的queue中，待事务提交后再移动到业务队列中。最后，RocketMQ的事务适用于解决本地事务和发消息的数据一致性问题。

参考
- https://juejin.im/post/6844904193526857742


![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)