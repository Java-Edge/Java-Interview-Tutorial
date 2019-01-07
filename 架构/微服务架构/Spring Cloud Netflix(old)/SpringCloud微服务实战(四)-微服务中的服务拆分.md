# 相关源码
- [订单服务源码](https://github.com/Wasabi1234/SpringCloud_OrderDemo)
- [商品服务源码](https://github.com/Wasabi1234/SpringCloud_ProductDemo)
- [商品服务模块全部源码](https://github.com/Wasabi1234/productdemo)
# 1 微服务拆分的起点
## 1.1 如何拆分?
### 先明白起点和终点
- 起点
既有架构的形态
- 终点
好的架构不是设计出来的，而是进化而来的，一直在演进ing

**单一应用架构=》垂直应用架构=》分布式服务架构=》流动计算架构**
![](https://img-blog.csdnimg.cn/20201208204147756.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
### 需要考虑的因素与坚持的原则
#### 什么适合微服务
以下业务形态不适合：
- 系统中包含很多很多强事务场景
- 业务相对稳定，迭代周期长
- 访问压力不大，可用性要求不高

#### 康威定律
- 沟通的问题会影响系统设计
Organizations which design systems are constrained toproduce designs which are copies of the communication structures of these organizations.
任何组织在设计一套系统(广义概念上的系统)时，所交付的设计方案在结构上都与该组织的沟通结构保持一致。
#### 微服务的团队结构
- 传统 V.S 微服务
![](https://img-blog.csdnimg.cn/20201208204932253.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

# 2 服务拆分方法论
## 扩展立方模型( Scale Cube )
- X轴水平复制、Z轴数据分区、Y轴功能解耦
![](https://img-blog.csdnimg.cn/20201208205635194.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
## 如何拆“功能”
- 单一职责、松耦合、高内聚
- 关注点分离
	- 按职责
	- 按通用性
	- 按粒度级别

## 服务和数据的关系
- 先考虑业务功能，再考虑数据
- 无状态服务

![](https://img-blog.csdnimg.cn/2020120821003488.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- 点餐业务服务拆分分析![](https://img-blog.csdnimg.cn/20201208210124299.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
# 3 商品服务编码实战
- SQL
![](https://img-blog.csdnimg.cn/img_convert/841d91124cef6e2981c79f4b7ee0ba7c.png)
- 在 IDEA 中新建项目
![](https://img-blog.csdnimg.cn/img_convert/fec80ae9da17243846faf3d1b1db8767.png)
- 项目初始化 pom 文件![](https://img-blog.csdnimg.cn/img_convert/fbf74840462460dcc73b30f64dbda178.png)

> web 和 webflux
旧版只有web一种模式，默认使用web。新版需指定，新增依赖
`org.springframework.boot.spring-boot-starter-web`

- 为启动类添加该注解
![](https://img-blog.csdnimg.cn/img_convert/681386584031757fc013fb8af6de1114.png)
- 基本配置信息![](https://img-blog.csdnimg.cn/img_convert/8ec219f94f6d351e929597820e84b5ba.png)
- 启动该类,将此服务注册到 eureka
![](https://img-blog.csdnimg.cn/img_convert/3c642e159854551efecd8bd216c396f5.png)
- 添加所需依赖![](https://img-blog.csdnimg.cn/img_convert/79f171887c1b1fb6a08f0418f3e68814.png)
- 业务需求![](https://img-blog.csdnimg.cn/img_convert/73de3ce888e4ea1fad6af605a571de95.png)
- 配置数据库相关信息![](https://img-blog.csdnimg.cn/img_convert/a8668e22a6c0fe8358704258ab98dad7.png)
![](https://img-blog.csdnimg.cn/img_convert/3c642e159854551efecd8bd216c396f5.png)
- 添加所需依赖
![](https://img-blog.csdnimg.cn/img_convert/79f171887c1b1fb6a08f0418f3e68814.png)
- 编写dto类![](https://img-blog.csdnimg.cn/img_convert/4eba672dd89d6a5e74e50c701b0483d3.png)
## 开始单元测试
- 编写测试类
![](https://img-blog.csdnimg.cn/img_convert/e3317a236d943b74f994a21bba11e87d.png)
![](https://img-blog.csdnimg.cn/img_convert/8ab9252312a03ea7f3512ab209be52c7.png)
- 必须要有此二注解，否则NPE![](https://img-blog.csdnimg.cn/img_convert/caf0663c93204e74ce3fcf89e4076456.png)
- 测试通过![](https://img-blog.csdnimg.cn/img_convert/6ae459db78a3e24b7c1db7b37815fed0.png)
## 开始实现第二个功能
![](https://img-blog.csdnimg.cn/img_convert/afdfb4af3e990c69aca8c5c305452891.png)
![](https://img-blog.csdnimg.cn/img_convert/92187fc34c0c5606fcb0a0e878a71bc2.png)
- 测试通过![](https://img-blog.csdnimg.cn/img_convert/780d775a07e7006684e3c90206eeb850.png)
- 编写service 层
![](https://img-blog.csdnimg.cn/img_convert/74e525ad947aff5e623fa7cbe80cb780.png)
- 编码技巧，测试类可直接继承启动类的测试类，减少注解个数，做到最大可能的解耦
![](https://img-blog.csdnimg.cn/img_convert/3ba6e7ddb46450b0d27a54e470de16bd.png)
![](https://img-blog.csdnimg.cn/img_convert/3800c9e031bc8dfc227bfa405956ff43.png)
![](https://img-blog.csdnimg.cn/img_convert/dae4e56b5b2d89d60eb119233bdc4941.png)
- 编写 vo 包下的类
![](https://img-blog.csdnimg.cn/img_convert/02877436f176255d85049ec2425b8399.png)
![](https://img-blog.csdnimg.cn/img_convert/ea5229d12e614107f96ea9abdd53ef76.png)
![](https://img-blog.csdnimg.cn/img_convert/ad850f5675287615fa1838639d25b7fc.png)
- 完成 controller 类
![](https://img-blog.csdnimg.cn/img_convert/e97534a9981cc286c520dcce7f01bdf4.png)
- 启动程序
![](https://img-blog.csdnimg.cn/img_convert/11aa372f0eba2221e8042da652759292.png)
- 优化返回值![](https://img-blog.csdnimg.cn/img_convert/1dca05f5798c64dbf92d66ffccada091.png)
# 4 订单服务
- SQL
![](https://img-blog.csdnimg.cn/img_convert/9e1035d05ac27c45afb22b807934b950.png)
- 业务需求![](https://img-blog.csdnimg.cn/img_convert/94f8f2ee483090c63be3723e7419470e.png)
## DAO
![](https://img-blog.csdnimg.cn/img_convert/ccf3edd927720c500593b222ebcd94d8.png)
![](https://img-blog.csdnimg.cn/img_convert/2cf28f2f1532398a3193bd7e7393f2f3.png)
![](https://img-blog.csdnimg.cn/img_convert/d2fad22f02a9a10d5ff8a0a56d287bf8.png)
- 启动
![](https://img-blog.csdnimg.cn/img_convert/871b7fbefe0f7fac74e12ed60dfd6f1d.png)
![](https://img-blog.csdnimg.cn/img_convert/0e1e87afd366a4d17b44ac34133943b4.png)
- 配置数据库信息并正常启动![](https://img-blog.csdnimg.cn/img_convert/330c3001b4d52b4fb860603244f71ffa.png)
![](https://img-blog.csdnimg.cn/img_convert/4a674690dcf7cb0f3a29f2b84a70890e.png)
- save数据成功![](https://img-blog.csdnimg.cn/img_convert/bb1329f9514488b82a71608698a622e9.png)
![](https://img-blog.csdnimg.cn/img_convert/9c4912da186eb1a370919d61e4ab4a8d.png)
![](https://img-blog.csdnimg.cn/img_convert/106a13422315d70d3b9b4616a6bb0192.png)
## service
![](https://img-blog.csdnimg.cn/img_convert/603cf57f3c983498a9f00620a25bc60d.png)
## controller
![](https://img-blog.csdnimg.cn/img_convert/c63e2cf9d098035894cc6930e32679e1.png)
- 自定义异常![](https://img-blog.csdnimg.cn/img_convert/dd67f6ea062dab73325477ff96c54d32.png)
![](https://img-blog.csdnimg.cn/img_convert/15a93d76813ce5979933c44f7f9f42ff.png)
![](https://img-blog.csdnimg.cn/img_convert/8f2e73cd44a6d16a6a154eb6b57b211e.png)
- sb 引用了 gson, 所以不需要指定版本![](https://img-blog.csdnimg.cn/img_convert/200b8e6a02320f32a752aaca383ce049.png)
- 测试接口![](https://img-blog.csdnimg.cn/img_convert/bd8a04c3de71bc68518c0c315ae2eac6.png)
# 5 拆数据
如何拆“数据”?
- 每个微服务都有单独的数据存储
- 依据服务特点选择不同结构的数据库类型
- 难点在确定边界
- 针对边界设计API
- 依据边界权衡数据冗余

参考
- https://zh.wikipedia.org/wiki/%E5%BA%B7%E5%A8%81%E5%AE%9A%E5%BE%8B