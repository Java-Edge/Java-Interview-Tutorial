#  1 定义
- 一个用于构建消息驱动的微服务的框架
用人话说就是 : 致力于简化MQ通信的框架

![](https://img-blog.csdnimg.cn/20191208191009130.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- [官方项目地址](https://spring.io/projects/spring-cloud-stream)

# 2 编程模型
![](https://img-blog.csdnimg.cn/20191208191232585.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

◆ Destination Binder (目标绑定器)
- 与消息中间件通信的组件
◆ Destination Bindings (目标绑定)
Binding是连接应用程序跟消息中间件的桥梁,用于消息的消费和生产，由binder创建
◆ Message(消息)
可见该编程模型异常强大,短短几行代码,就实现了消息的对接和处理
input/output就是微服务接收和发出消息

下面开始对内容中心编码
# 3 编写生产者
- 添加依赖
![](https://img-blog.csdnimg.cn/20191208192640270.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_6,color_FFFFFF,t_70)
- 在启动类添加注解
![](https://img-blog.csdnimg.cn/201912081928294.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 写配置
![](https://img-blog.csdnimg.cn/2019120819295724.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 4 编写消费者
编码用户中心
- 添加依赖
![](https://img-blog.csdnimg.cn/2019120819362355.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 启动类上添加注解
![](https://img-blog.csdnimg.cn/20191208194031591.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 写配置
![](https://img-blog.csdnimg.cn/20191208194321619.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 5 自定义接口
## 5.1 发送消息
- 新建mysource接口
![](https://img-blog.csdnimg.cn/20191208222441725.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 启动类注解
![](https://img-blog.csdnimg.cn/20191208223715913.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 写配置,注意要和接口中的名字一致
![](https://img-blog.csdnimg.cn/20191208223948727.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 测试代码
![](https://img-blog.csdnimg.cn/20191208224437324.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
> 注意,由于mybatis会扫描启动类注解上scan注解所限制路径下的所有接口,所以一旦有接口未被xml mapper,即抛异常,所以编码时必须将扫描注解范围限定死在mapper包下!

##  5.2 消费消息
用户中心编码

- 写接口
![](https://img-blog.csdnimg.cn/20191208225451515.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 添注解
![](https://img-blog.csdnimg.cn/20191208225636189.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 加配置
![](https://img-blog.csdnimg.cn/20191208225943529.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191208234547892.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

# 透过现象看本质
当我们定义好Source/Sink接口后,在启动类使用EnableBinding指定了接口后,就会使用IOC创建对应名字的代理类,所以配置文件中也必须同名


# 消息过滤
- 推荐阅读
[Spring Cloud Stream实现消息过滤消费](https://www.imooc.com/article/290424)

# 监控
记得多看端点哦!
output/input其实就是一个channel
![](https://img-blog.csdnimg.cn/20191209000457232.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
## 排错依据的重要端点
- /actuator/bindings
- /actuator/channels
- /actuator/health

# 异常处理
- 推荐阅读
[Spring Cloud Stream错误处理详解](https://www.imooc.com/article/290435)

![](https://img-blog.csdnimg.cn/20191209002040226.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

#  整合RocketMQ实现分布式事务
Stream本身并未考虑分布式事务问题,都是RocketMQ的能力
## 重构生产者
对内容中心一顿操作:删除不必要代码
- 自定义的MySource接口,因为Spring内置的就已经满足我们的需求了
![](https://img-blog.csdnimg.cn/20191210001552794.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 接着别忘了删除启动类中对他的引用
- 删除TestController中对应测试代码
- 清理yml中Spring消息编程模型整合RocketMQ的部分
![](https://img-blog.csdnimg.cn/20191210000151287.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- myoutput删除
![](https://img-blog.csdnimg.cn/20191210000825428.png)
- 修正如下![](https://img-blog.csdnimg.cn/20191210001110814.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
## 代码重构
### 改造ShareService
- 即改造以下代码(直接删除)
![](https://img-blog.csdnimg.cn/20191210001239638.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 添加Source
![](https://img-blog.csdnimg.cn/20191210001407558.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 开始使用source发送消息,但是send只能直接发送消息(或者带有超时)
![](https://img-blog.csdnimg.cn/20191210001749688.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
而我们之前使用rocketmqtemplate传递参数时可以带个arg
![](https://img-blog.csdnimg.cn/20191210001906126.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
那现在我们该怎么传arg呢???
记得前面埋下的伏笔,header也是很有用处的!
我们可以将要传的参数放入header中,如下:
![](https://img-blog.csdnimg.cn/2019121000211688.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
rocketmqtemplate功成身退,我们可以使用stream编程模型完全替代了

### 改造AddBonusTransactionListener
- 现在这里的arg是null了
![](https://img-blog.csdnimg.cn/20191210002453861.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)
- 需要从header中获取arg了(有坑,后面再说),在这里打个断点
![](https://img-blog.csdnimg.cn/20191210002602194.png)
- 完善配置(IDEA无法识别,但确实会生效),实现事务功能
![](https://img-blog.csdnimg.cn/20191210003618835.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 注意上面的group名称要与下一致
![](https://img-blog.csdnimg.cn/20191210003758104.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 启动内容中心
- 发送请求
![](https://img-blog.csdnimg.cn/20191210004739106.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 发现dto其实是字符串,并不是DTO对象
![](https://img-blog.csdnimg.cn/20191210004910926.png)
- 所以继续修正代码
![](https://img-blog.csdnimg.cn/20191210005043741.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191210005131113.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 这样就是正常的对象了
![](https://img-blog.csdnimg.cn/20191210005321539.png)
因为从header中获取的都是字符串哦!切记!

## 重构消费者
对用户中心删除不必要代码,与内容中心类似,不再详述
- 删除
![](https://img-blog.csdnimg.cn/20191210005546890.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 将`MyTestStreamConsumer`改为`AddBonusStreamConsumer`
### 重构如下
![](https://img-blog.csdnimg.cn/2019121001022563.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191210010318142.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)


# 总结
- 推荐阅读
[Spring Cloud Stream知识点盘点](https://www.imooc.com/article/290489#comment)
