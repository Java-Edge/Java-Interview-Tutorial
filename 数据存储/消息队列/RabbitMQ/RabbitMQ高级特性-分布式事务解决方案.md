> 全是干货的技术号：
> 本文已收录在
>
> github：
>
> https://github.com/Wasabi1234/Java-Interview-Tutorial
> 
> 码云：
> 
>https://gitee.com/JavaEdge/Java-Interview-Tutorial
>
> 欢迎 star/fork

# 1 极速了解MQ
> 介绍Rabbitmg用于解决分布式事务必须掌握的5个核心概念

一款分布式消息中间件，基于erlang语言开发， 具备语言级别的高并发处理能力。和Spring框架是同一家公司。
支持持久化、高可用

## 核心5个概念:
1. Queue: 真正存储数据的地方
2. Exchange: 接收请求，转存数据
3. Bind: 收到请求后存储到哪里
4. 消息生产者:发送数据的应用
5. 消息消费者: 取出数据处理的应用
![](https://img-blog.csdnimg.cn/2019110903371374.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)



# 2、分布式事务问题
> 分布式事务是一个业务问题，不能脱离具体的场景。

## 2.1 分布式事务的几种解决方案
● 基于数据库XA/ JTA协议的方式
需要数据库厂商支持; JAVA组件有atomikos等
● 异步校对数据的方式
支付宝、微信支付主动查询支付状态、对账单的形式;
● 基于可靠消息(MQ)的解决方案
异步场景;通用性较强;拓展性较高
● TCC编程式解决方案
严选、阿里、蚂蚁金服自己封装的DTX

本文目标:针对所有人群，学会基于可靠消息来解决分布式事务问题。
分布式事务的解决方案，业务针对性很强，重要的是思路，而不是照搬

- 美团点评系统架构
![](https://img-blog.csdnimg.cn/20191109111135363.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

## 2.2 多系统间的分布式事务问题
![](https://img-blog.csdnimg.cn/20191109111326448.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

- 用户下单生成订单
![](https://img-blog.csdnimg.cn/20191109111524174.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 需要传递订单数据,由此产生两个事务一致性问题
![](https://img-blog.csdnimg.cn/20191109111712542.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

## 错误的案例
![](https://img-blog.csdnimg.cn/20191109112532574.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

### 当接口调用失败时，订单系统事务回滚,提示用户操作失败
`误以为这样的接口调用写法，就不会有分布式事务问题`

### 接口调用成功或者失败，都会产生分布式事务问题:
1. 接口调用成功，订单系统数据库事务提交失败，运单系统没有回滚，产生数据
2. 接口调用超时，订单系统数据库事务回滚，运单系统接口继续执行，产生数据

上述两种情况，都会导致数据不一致的问题

# 3、实现分布式事务 - 五步法
> 通过MQ解决分布式事务的5个步骤, 以及分布式事务处理中要注意的地方

- 之前都是订单系统发送HTTP请求运单系统的接口,出问题了!![](https://img-blog.csdnimg.cn/2019110911365199.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 因此我们考虑发消息给MQ, 异步暂存!
![](https://img-blog.csdnimg.cn/20191109113742318.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

## 3.1 整体设计思路
![](https://img-blog.csdnimg.cn/2019110911390025.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
外卖下订单后,可以慢慢等待运单中心数据生成,并非强制要求同时性


1. 可靠生产:保证消息一定要发送到Rabitmq服务
2. 可靠消费:保证消息取出来一定正确消费掉

最终使多方数据达到一致。

## 3.2 步骤1 - 可靠的消息生产记录消息发送
![](https://img-blog.csdnimg.cn/20191110002502550.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 存在隐患 - 可能消息发送失败呀!
![](https://img-blog.csdnimg.cn/20191110002547799.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

➢ 为了确保数据一定成功发送到MQ。
➢ 在同一事务中，增加一个记录表的操作, 记录`每一条发往MQ的数据以及它的发送状态`
于是我们在订单系统中增加一个本地信息表![](https://img-blog.csdnimg.cn/20191110002746532.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

于是在代码实践中,不再通过HTTP接口调用运单系统接口,而是使用MQ

生成订单时,也保存本地信息表
![](https://img-blog.csdnimg.cn/20191110003248457.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110003415706.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110004913354.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
## 3.3 步骤2 - 可靠消息生产(修改消息发送状态)
- 利用RabbitMQ事务发布确认机制(confirm)
开启后，MQ准确受理消息会返回回执
![](https://img-blog.csdnimg.cn/20191110003908628.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 然后就能知道如何更新本地信息表了
![](https://img-blog.csdnimg.cn/2019111000394665.png)

-确保在SB中开启Confirm机制
![](https://img-blog.csdnimg.cn/20191110004341395.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/201911100049513.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191110005151992.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

- 如果出现回执没收到、消息状态修改失败等特殊情况
`兜底方案:定时检查消息表，超时没发送成功，再次重发`

## 3.4 步骤3 - 可靠消息处理(正常处理)
- 运单系统收到消息数据后,突然宕机,或者访问运单DB时,DB突然宕机,消息数据不就丢了吗!!!
![](https://img-blog.csdnimg.cn/20191110010205178.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
于是需要以下特性:

➢  幂等性
防止重复消息数据的处理，一次用户操作，只对应一次数据处理
![](https://img-blog.csdnimg.cn/20191110010346674.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
➢  开启`手动ACK模式`
由消费者控制消息的重发/清除/丢弃
![](https://img-blog.csdnimg.cn/20191110010518296.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
### 3.5 步骤4 - 可靠消息处理(消息重发)
![](https://img-blog.csdnimg.cn/2019111001144842.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
消费者处理失败，需要MQ再次重发给消费者。
出现异常一般会重试几次，由消费者自身记录重试次数，并进行次数控制(不会永远重试!)

## 3.6 步骤五 - 可靠消息处理(消息丢弃)
消费者处理失败，直接丢弃或者转移到死信队列(DLQ)
`重试次数过多、消息内容格式错误等情况，通过线上预警机制通知运维人员`
![](https://img-blog.csdnimg.cn/20191110012037386.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
# 4 总结及扩展
## 4.1 MQ方案的优点和缺点
口优点
1. 通用性强
2. 拓展性强
3. 方案成熟

口缺点
4. 基于消息中间件，只适合异步场景
5. 消息处理会有延迟，需要业务上能够容忍

尽量避免分布式事务;
尽量将非核心事务做成异步;

## 4.2 拓展
### 分布式事务解决方案的理论依据
CAP理论
BASE理论
2PC协议
3PC协议
Paxos算法.
Raft一致性协议

 
# 参考
[美团配送系统架构演进实践](https://tech.meituan.com/2018/07/26/peisong-sys-arch-evolution.html)

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)