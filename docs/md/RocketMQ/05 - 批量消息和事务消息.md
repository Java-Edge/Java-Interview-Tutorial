# RocketMQ实战(05) - 批量消息和事务消息

## 1 批量消息
### 1.1 为何使用批量消息
- 调优时，如DB批量处理，有些请求进行合并发送等都是类似批量实现原理
- RocketMQ批量发送也是为性能，特别在消息数量特别大时，批量效果就很明显

### 1.2 限制

- 同一批次的消息，应具有相同主题、相同的消息配置
- 不支持延迟消息
- 建议一个批量消息大小最好不要超过1MB

## 2 事务消息
### 2.1 定义

RocketMQ的事务消息，指Producer端消息发送事件和本地事务事件，同时成功/失败。

### 2.2 设计流程

![](https://img-blog.csdnimg.cn/20191111003437136.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

## 3 MQ与DB一致性原理

### 流程图

![](https://yqfile.alicdn.com/cad691dfc1e9da6c1f7ae8b197004cd177b39c8e.png)

发消息到MQ服务器，此时消息状态为SEND_OK，此消息Con不可见。

执行DB操作；DB执行成功Commit，DB执行失败Rollback：

- DB执行成功，回复Broker，将状态改为COMMIT_MESSAGE

- DB执行失败，回复Broker，将状态改为ROLLBACK_MESSAGE

注意此过程有可能失败。

MQ内部提供一个名为“事务状态服务”的服务，会检查事务消息的状态，若发现消息未COMMIT，则通过Producer启动时注册的TransactionCheckListener来回调业务系统，业务系统在checkLocalTransactionState方法中检查DB事务状态，如果成功，则回复COMMIT_MESSAGE，否则回复ROLLBACK_MESSAGE。

```java
package org.apache.rocketmq.client.producer;

import org.apache.rocketmq.common.message.MessageExt;

/**
 * @deprecated This interface will be removed in the version 5.0.0, interface {@link TransactionListener} is recommended.
 */
@Deprecated
public interface TransactionCheckListener {
    LocalTransactionState checkLocalTransactionState(final MessageExt msg);
}

```



![](https://img-blog.csdnimg.cn/20191111003556278.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2019111100375423.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

### 实例

#### 创建Producer

创建TransactionMQProducer，并注册TransactionCheckListener。

```java
TransactionCheckListener transactionCheckListener = new TransactionCheckListener() {
	@Override
	public LocalTransactionState checkLocalTransactionState(MessageExt messageExt) {
		try {
			Object msg = HessianUtils.decode(messageExt.getBody());
			return getCommitStatus(messageExt.getTopic(), messageExt.getTags(), msg);
		} catch (IOException e) {
			logger.error(e.getMessage(), e);
			return LocalTransactionState.COMMIT_MESSAGE;
		}
	}
};
// 设置事务会查监听器
producer.setTransactionCheckListener(transactionCheckListener);
```

#### 发送事务消息

```java
Message message = new Message(topic, tag, HessianUtils.encode(msg));
// 发送事务性消息
TransactionSendResult sendResult = producer.sendMessageInTransaction(message, new LocalTransactionExecuter() {

	@Override
	public LocalTransactionState executeLocalTransactionBranch(Message arg0, Object arg1) {
		Boolean result = transactionTemplate.execute(new TransactionCallback<Boolean>() {
			@Override
			public Boolean doInTransaction(TransactionStatus status) {
				try {
					// insert or update db
					return true;
				} catch (Exception e) {
					logger.error("insert / update failed!", e);
					status.setRollbackOnly();
					return false;
				}
			}
		});
		if (result == null || !result) {
			return LocalTransactionState.ROLLBACK_MESSAGE;
		}
				return LocalTransactionState.COMMIT_MESSAGE;
	}
}, null);
if (sendResult.getLocalTransactionState() != LocalTransactionState.COMMIT_MESSAGE) {
	logger.error("send transaction msg failed! topic={}, tags={}, message={}, sendResult={}", topic, tag, msg, JSON.toJSONString(sendResult));
	return sendResult;
}

return sendResult;
```

## 4 案例分析

### 4.1 单机环境下的事务示意图

A给B转账

| 1    | 锁定A的账户        |
| ---- | ------------------ |
| 2    | 锁定B的账户        |
| 3    | 检查A账户是否有1元 |
| 4    | A的账户扣减1元     |
| 5    | 给B的账户加1元     |
| 6    | 解锁B的账户        |
| 7    | 解锁A的账户        |

**以上过程在代码层面甚至可以简化到在一个事物中执行两条sql语句。**

### 4.2  集群环境下事务

**和单机事务不同，A、B账户可能不在同一个DB中，此时无法像在单机情况下使用事物来实现。此时可以通过一下方式实现，将转账操作分成两个操作。**

**a)  A账户**

| 1    | 锁定A的账户        |
| ---- | ------------------ |
| 2    | 检查A账户是否有1元 |
| 3    | A的账户扣减1元     |
| 4    | 解锁A的账户        |

**b)  MQ消息**

**A账户数据发生变化时，发送MQ消息，MQ服务器将消息推送给转账系统，转账系统来给B账号加钱。**

**c)  B账户**

| 1    | 锁定B的账户    |
| ---- | -------------- |
| 2    | 给B的账户加1元 |
| 3    | 解锁B的账户    |

即**大事务 = 小事务 + 异步**

交易系统和其他系统之间保持最终一致性的解决方案：

![img](https://yqfile.alicdn.com/eebd1c50af7b0f638a1ffedc4230a2c36e991b58.png)

### 2.3 约束

- 不支持定时、批量

- 为避免一个消息被多次检查，导致半数队列消息堆积
RocketMQ限制了单个消息的默认检查次数为15次
通过修改broker配置文件中的`transactionCheckMax`参数进行调整

特定的时间段之后才检查事务
通过broker配置文件参数transactionTimeout或用户配置
`CHECK_IMMUNITY_TIME_IN_SECONDS`调整时间

- 一个事务消息可能被检查或消费多次
- 提交过的消息重新放到用户目标主题可能会失败
- 事务消息的生产者ID不能与其他类型消息的生产者ID共享

### 2.4 事务消息的状态
- TransactionStatus.CommitTransaction
提交事务，允许消费者消费这个消息
- TransactionStatus. RollbackTransaction
回滚事务，消息将会被删除或不再允许消费
- Transaction Status.Unknown
中间状态，MQ需要重新检查来确定状态
