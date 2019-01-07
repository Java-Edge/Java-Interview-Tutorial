# 1 RabbitMQ
一款分布式消息中间件，基于erlang开发， 具备语言级别的高并发处理能力。和Spring框架是同一家公司。支持持久化、高可用。
## 核心概念
1. Queue: 真正存储数据的地方
2. Exchange: 接收请求，转存数据
3. Bind: 收到请求后存储到哪里
4. 消息生产者:发送数据的应用
5. 消息消费者: 取出数据处理的应用
![](https://img-blog.csdnimg.cn/2019110903371374.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
# 2 分布式事务问题
> 分布式事务是一个业务问题，不能脱离具体场景。

- 美团点评系统架构
![](https://img-blog.csdnimg.cn/20191109111135363.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 多系统间的分布式事务问题
![](https://img-blog.csdnimg.cn/20191109111326448.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 用户下单生成订单
![](https://img-blog.csdnimg.cn/20191109111524174.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 需要传递订单数据，由此产生两个事务一致性问题
![](https://img-blog.csdnimg.cn/20191109111712542.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 错误案例
![](https://img-blog.csdnimg.cn/20191109112532574.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

### 当接口调用失败时
订单系统事务回滚，提示用户操作失败。
自以为这样的接口调用写法，就不会有分布式事务问题。

### 接口调用成功或失败
都会产生分布式事务问题：
- 接口调用成功
订单系统数据库事务提交失败，运单系统没有回滚，产生数据
- 接口调用超时
订单系统数据库事务回滚，运单系统接口继续执行，产生数据

所以都会导致数据不一致问题。
# 3 正确实现分布式事务（五步法）
- 之前都是订单系统直接HTTP请求运单系统的接口，出问题了!![](https://img-blog.csdnimg.cn/2019110911365199.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 因此考虑发消息给MQ，异步暂存
![](https://img-blog.csdnimg.cn/20191109113742318.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 3.1 整体设计思路
![](https://img-blog.csdnimg.cn/2019110911390025.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
外卖下订单后，慢慢等待运单中心数据生成，并非强制要求同时。但要保证：
- 可靠生产
保证消息一定要发送到Rabitmq服务
- 可靠消费
保证消息取出来一定正确消费掉

最终使多方数据达到一致。
## 实现步骤
### 步骤1 - 可靠的消息生产记录消息发送
![](https://img-blog.csdnimg.cn/20191110002502550.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
#### 隐患
- 可能消息发送失败：
![](https://img-blog.csdnimg.cn/20191110002547799.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
为确保数据一定成功发送到MQ。在同一事务中，增加一个记录表的操作, 记录`每一条发往MQ的数据以及它的发送状态`。
- 于是在订单系统中增加一个本地信息表
![](https://img-blog.csdnimg.cn/20191110002746532.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

不再通过HTTP请求直接调用运单系统接口，而是使用MQ：
生成订单时，也保存本地信息表
![](https://img-blog.csdnimg.cn/20191110003415706.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110003248457.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110004913354.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
### 步骤2-可靠消息生产(修改消息发送状态)
- 利用RabbitMQ的事务发布确认机制(confirm)：开启后，MQ准确受理消息会返回回执
![](https://img-blog.csdnimg.cn/20191110003908628.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 然后就能知道如何更新本地信息表
![](https://img-blog.csdnimg.cn/2019111000394665.png)

- 确保在SpringBoot项目中开启Confirm机制
![](https://img-blog.csdnimg.cn/20191110004341395.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
#### 代码实现
![](https://img-blog.csdnimg.cn/201911100049513.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110005151992.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 若出现回执没收到、消息状态修改失败等特殊情况
兜底方案：定时检查消息表，超时没发送成功，再次重发。

### 步骤3 - 可靠消息处理(正常处理)
- 运单系统收到消息数据后，突然宕机或访问运单DB时，DB突然宕机，消息数据不就丢了？
![](https://img-blog.csdnimg.cn/20191110010205178.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

于是还需要如下处理：
➢  幂等性
防止重复消息数据的处理，一次用户操作，只对应一次数据处理
![](https://img-blog.csdnimg.cn/20191110010346674.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
➢  开启`手动ACK模式`
由消费者控制消息的重发/清除/丢弃
![](https://img-blog.csdnimg.cn/20191110010518296.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
### 步骤4 - 可靠消息处理(消息重发)
![](https://img-blog.csdnimg.cn/2019111001144842.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
消费者处理失败，需要MQ重发给消费者。出现异常一般会重试几次，由消费者自身记录重试次数，并进行次数控制。

### 步骤五 - 可靠消息处理(消息丢弃)
消费者处理失败，直接丢弃或者转移到死信队列(DLQ)。`重试次数过多、消息内容格式错误等情况，通过线上预警机制通知运维`。
![](https://img-blog.csdnimg.cn/20191110012037386.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
# 4 总结
## MQ实现分布式事务分析
### 优点
1. 通用性强
2. 拓展性强
3. 方案成熟

### 缺点
- 基于消息中间件，只适合异步场景
- 消息处理会有延迟，需要业务上能够容忍

尽量避免分布式事务，尽量将非核心事务做成异步。

> 参考
> - [美团配送系统架构演进实践](https://tech.meituan.com/2018/07/26/peisong-sys-arch-evolution.html)