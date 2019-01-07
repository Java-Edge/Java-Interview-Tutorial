# 服务拆分方法论
## 扩展立方模型( Scale Cube )
- X轴水平复制、Z轴数据分区、Y轴功能解耦
![](https://img-blog.csdnimg.cn/20201208205635194.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 如何拆“功能”
- 单一职责、松耦合、高内聚
- 关注点分离
	- 按职责
	- 按通用性
	- 按粒度级别

## 服务和数据的关系
- 先考虑业务功能，再考虑数据
- 无状态服务

![](https://img-blog.csdnimg.cn/2020120821003488.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 点餐业务服务拆分分析![](https://img-blog.csdnimg.cn/20201208210124299.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 商品服务编码实战
- SQL
![](https://img-blog.csdnimg.cn/img_convert/841d91124cef6e2981c79f4b7ee0ba7c.png)

- 项目初始化 pom 文件![](https://img-blog.csdnimg.cn/img_convert/fbf74840462460dcc73b30f64dbda178.png)

> web 和 webflux
旧版只有web一种模式，默认使用web。新版需指定，新增依赖
`org.springframework.boot.spring-boot-starter-web`

- 为启动类添加该注解
![](https://img-blog.csdnimg.cn/img_convert/681386584031757fc013fb8af6de1114.png)

## 开始单元测试
- 编写测试类
![](https://img-blog.csdnimg.cn/img_convert/e3317a236d943b74f994a21bba11e87d.png)
![](https://img-blog.csdnimg.cn/img_convert/8ab9252312a03ea7f3512ab209be52c7.png)
- 必须要有此二注解，否则NPE![](https://img-blog.csdnimg.cn/img_convert/caf0663c93204e74ce3fcf89e4076456.png)

## 开始实现第二个功能
![](https://img-blog.csdnimg.cn/img_convert/afdfb4af3e990c69aca8c5c305452891.png)
![](https://img-blog.csdnimg.cn/img_convert/92187fc34c0c5606fcb0a0e878a71bc2.png)

- 编码技巧，测试类可直接继承启动类的测试类，减少注解个数，做到最大可能的解耦
![](https://img-blog.csdnimg.cn/img_convert/3ba6e7ddb46450b0d27a54e470de16bd.png)
![](https://img-blog.csdnimg.cn/img_convert/3800c9e031bc8dfc227bfa405956ff43.png)
![](https://img-blog.csdnimg.cn/img_convert/dae4e56b5b2d89d60eb119233bdc4941.png)



# 订单服务
- SQL
![](https://img-blog.csdnimg.cn/img_convert/9e1035d05ac27c45afb22b807934b950.png)

- sb 引用了 gson, 所以不需要指定版本![](https://img-blog.csdnimg.cn/img_convert/200b8e6a02320f32a752aaca383ce049.png)
# 拆数据
如何拆“数据”?
- 每个微服务都有单独的数据存储
- 依据服务特点选择不同结构的数据库类型
- 难点在确定边界
- 针对边界设计API
- 依据边界权衡数据冗余

# 相关源码
- [订单服务源码](https://github.com/Wasabi1234/SpringCloud_OrderDemo)
- [商品服务源码](https://github.com/Wasabi1234/SpringCloud_ProductDemo)
- [商品服务模块全部源码](https://github.com/Wasabi1234/productdemo)

> 参考
> - https://zh.wikipedia.org/wiki/%E5%BA%B7%E5%A8%81%E5%AE%9A%E5%BE%8B
> - https://martinfowler.com/articles/microservices.html