# 什么是DDD商城

## 1 项目描述

DDD商城是个从零到一的 C2C 商城项目，包含商城核心业务和基础架构两大模块。

包含商城系统用户、消息、商品、订单、优惠券、支付、网关、购物车等业务模块，通过商城系统中复杂场景，给出对应解决方案。使用 DDD 模型开发系统功能，帮助对 DDD 一知半解的开发者树立正确地开发思路。

![](https://images-machen.oss-cn-beijing.aliyuncs.com/1673165270664-5d0c4381-96ef-427b-a58d-9b21140eabe0-20230306173625527.png)

该系统总结了我从事后端以来，在实际工作中遇到各种场景问题的“疑难杂症”汇总，包含解决方案和代码实战。

提供了完整可运行的普惠版商城业务，也提供了偏架构层面有用的工具和参考，能帮助大家在实际项目中更好地解决问题。

## 2 你将学到

- 基于 DDD 实现的商品、购物车、订单、用户、消息及支付服务
- 掌握分布式锁、分布式事务、分布式搜索、分布式缓存、分布式限流以及分库分表等核心技术
- 完成基础组件抽象，规约、缓存、幂等、分布式 ID、数据持久层、脱敏以及日志等底层组件库。
- 基于 Agent 开发字节码流量监控，监控项目接口 QPS、响应时间和异常请求等核心指标。
- 掌握常用设计模式实战场景，策略、责任链、装饰器、观察者以及适配器等设计模式。

## 3 如何开始

DDD商城核心有两块，认真学习分别可以收获：

- 商城业务：通过学习DDD商城中复杂业务处理场景，增加自己的复杂业务处理能力。
- 基础架构：尝试跟着基础架构部分自己把轮子都造一遍，以此提高自己方案设计和公共代码开发能力。

### 3.1 商城核心业务

学习流程：

1. 初始化数据库，如商品库、订单库、用户库、支付库、购物车库等
2. 安装Nacos、MySQL、Seata、RocketMQ 等
3. 学习接口调用流程
4. 查看不同微服务之间的依赖关系，并根据文档中的描述进行修改指定参数
5. 找到自己感兴趣的模块功能 Debug 源代码，参考代码设计

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/6a22ca0407bb54c80f0a85db0e68fb9f.png)

### 3.2 基础架构

基础架构相关代码都在 `dddmall-framework-all` 模块，本专栏教你如何开发基础架构代码。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/e4bf3e96b095b778becc2e67aa2e3028.png)



## 4 项目地址
[Github仓库地址](https://github.com/Java-Edge/ddd-mall.git)


## 5 服务列表



|      | 模块名称                | 服务名称                          | 访问地址                                                     |
| ---- | ----------------------- | --------------------------------- | ------------------------------------------------------------ |
| 1    | dddmall-message       | 消息发送 eg：邮件、公众号、短信等 | [http://localhost:8001(opens new window)](http://localhost:8001/) |
| 2    | dddmall-customer-user | C 端用户                          | [http://localhost:8002(opens new window)](http://localhost:8002/) |
| 3    | dddmall-gateway       | 外部网关                          | [http://localhost:8003(opens new window)](http://localhost:8003/) |
| 4    | dddmall-product       | 商品服务                          | [http://localhost:8004(opens new window)](http://localhost:8004/) |
| 5    | dddmall-product-job   | 商品 Job 服务                     | [http://localhost:9001(opens new window)](http://localhost:9001/) |
| 6    | dddmall-cart          | 购物车服务                        | [http://localhost:8005(opens new window)](http://localhost:8005/) |
| 7    | dddmall-order         | 订单服务                          | [http://localhost:8006(opens new window)](http://localhost:8006/) |
| 8    | dddmall-pay           | 支付服务                          | [http://localhost:8007(opens new window)](http://localhost:8007/) |
| 9    | dddmall-basic-data    | 基础数据服务                      | [http://localhost:8008(opens new window)](http://localhost:8008/) |
| 10   | dddmall-bff           | BFF 商城聚合层                    | [http://localhost:8009(opens new window)](http://localhost:8009/) |

## 6 技术架构选型



|      | 技术                | 名称                   | 官网                                                         |
| ---- | ------------------- | ---------------------- | ------------------------------------------------------------ |
| 1    | Spring Boot         | 基础框架               | [https://spring.io/projects/spring-boot(opens new window)](https://spring.io/projects/spring-boot) |
| 2    | MyBatis-Plus        | 持久层框架             | [https://baomidou.com(opens new window)](https://baomidou.com/) |
| 3    | HikariCP            | 数据库连接池           | [https://github.com/brettwooldridge/HikariCP(opens new window)](https://github.com/brettwooldridge/HikariCP) |
| 4    | Redis               | 分布式缓存数据库       | [https://redis.io(opens new window)](https://redis.io/)      |
| 5    | RocketMQ            | 消息队列               | [https://rocketmq.apache.org(opens new window)](https://rocketmq.apache.org/) |
| 6    | ShardingSphere      | 数据库生态系统         | [https://shardingsphere.apache.org(opens new window)](https://shardingsphere.apache.org/) |
| 7    | SpringCloud Alibaba | 分布式框架             | [https://github.com/alibaba/spring-cloud-alibaba(opens new window)](https://github.com/alibaba/spring-cloud-alibaba) |
| 8    | SpringCloud Gateway | 网关框架               | [https://spring.io/projects/spring-cloud-gateway(opens new window)](https://spring.io/projects/spring-cloud-gateway) |
| 9    | Seata               | 分布式事务框架         | [http://seata.io/zh-cn/index.html(opens new window)](http://seata.io/zh-cn/index.html) |
| 10   | Canal               | MySQL 订阅 BinLog 组件 | [https://github.com/alibaba/canal(opens new window)](https://github.com/alibaba/canal) |
| 11   | MinIO               | 文件存储框架           | [https://min.io(opens new window)](https://min.io/)          |
| 12   | Swagger3            | 项目 API 文档框架      | [http://swagger.io(opens new window)](http://swagger.io/)    |
| 13   | Knife4j             | Swagger 增强框架       | [https://doc.xiaominfo.com(opens new window)](https://doc.xiaominfo.com/) |
| 14   | Maven               | 项目构建管理           | [http://maven.apache.org(opens new window)](http://maven.apache.org/) |
| 15   | Redisson            | Redis Java 客户端      | [https://redisson.org(opens new window)](https://redisson.org/) |
| 16   | Sentinel            | 流控防护框架           | [https://github.com/alibaba/Sentinel(opens new window)](https://github.com/alibaba/Sentinel) |
| 17   | Hippo4j             | 动态线程池框架         | [https://hippo4j.cn(opens new window)](https://hippo4j.cn/)  |
| 18   | XXL-Job             | 分布式定时任务框架     | [http://www.xuxueli.com/xxl-job(opens new window)](http://www.xuxueli.com/xxl-job) |
| 19   | SkyWalking          | 分布式链路追踪框架     | [https://skywalking.apache.org(opens new window)](https://skywalking.apache.org/) |
| 20   | JetCache            | Java 缓存框架          | [https://github.com/alibaba/jetcache(opens new window)](https://github.com/alibaba/jetcache) |

## 7 项目结构说明



```txt
├── dddmall-basic-data  || -- # 基础数据服务
│   ├── dddmall-basic-data-application
│   ├── dddmall-basic-data-domain
│   ├── dddmall-basic-data-infrastructure
│   ├── dddmall-basic-data-interface
├── dddmall-bff  || -- # 商城 BFF 聚合层
│   ├── dddmall-bff-biz
│   ├── dddmall-bff-remote
│   ├── dddmall-bff-web
├── dddmall-cart  || -- # 购物车服务
│   ├── dddmall-cart-application
│   ├── dddmall-cart-domain
│   ├── dddmall-cart-infrastructure
│   ├── dddmall-cart-interface
├── dddmall-coupon  || -- # 优惠券服务
├── dddmall-customer-user  || -- # C端用户服务
│   ├── dddmall-customer-user-application
│   ├── dddmall-customer-user-domain
│   ├── dddmall-customer-user-infrastructure
│   ├── dddmall-customer-user-interface
│   ├── dddmall-customer-user-mock
├── dddmall-framework-all  || -- # 基础组件
│   ├── dddmall-base-spring-boot-starter  || -- # 顶层抽象基础组件
│   ├── dddmall-cache-spring-boot-starter  || -- # 缓存组件
│   ├── dddmall-common-spring-boot-starter  || -- # 公共工具包组件
│   ├── dddmall-convention-spring-boot-starter  || -- # 项目规约组件
│   ├── dddmall-database-spring-boot-starter  || -- # 数据库持久层组件
│   ├── dddmall-ddd-framework-core  || -- # DDD抽象接口组件
│   ├── dddmall-designpattern-spring-boot-starter  || -- # 设计模式抽象组件
│   ├── dddmall-distributedid-spring-boot-starter  || -- # 分布式ID组件
│   ├── dddmall-flow-monitor-agent  || -- # 微服务流量监控组件
│   ├── dddmall-httputil-spring-boot-starter  || -- # Http网络调用组件
│   ├── dddmall-idempotent-spring-boot-starter  || -- # 分布式幂等组件
│   ├── dddmall-log-spring-boot-starter  || -- # 日志打印组件
│   ├── dddmall-minio-spring-boot-starter  || -- # 文件存储组件
│   ├── dddmall-openfeign-spring-boot-starter  || -- # 微服务调用组件
│   ├── dddmall-rocketmq-spring-boot-starter  || -- # 分布式消息队列组件
│   ├── dddmall-sensitive-spring-boot-starter  || -- # 前端返回数据脱敏组件
│   ├── dddmall-swagger-spring-boot-starter  || -- # 文档API组件
│   ├── dddmall-web-spring-boot-starter  || -- # Web组件
│   ├── dddmall-xxljob-spring-boot-starter  || -- # 定时任务组件
├── dddmall-gateway  || -- # 网关服务
├── dddmall-message  || -- # 消息服务
│   ├── dddmall-message-application
│   ├── dddmall-message-domain
│   ├── dddmall-message-infrastructure
│   ├── dddmall-message-interface
├── dddmall-order  || -- # 订单服务
│   ├── dddmall-order-application
│   ├── dddmall-order-domain
│   ├── dddmall-order-infrastructure
│   ├── dddmall-order-interface
├── dddmall-pay  || -- # 支付服务
│   ├── dddmall-pay-application
│   ├── dddmall-pay-domain
│   ├── dddmall-pay-infrastructure
│   ├── dddmall-pay-interface
├── dddmall-product  || -- # 商品服务
│   ├── dddmall-product-application
│   ├── dddmall-product-domain
│   ├── dddmall-product-infrastructure
│   ├── dddmall-product-interface
│   ├── dddmall-product-job
├── dddmall-test-all  || -- # 测试用例
│   ├── dddmall-flow-monitor-agent-test
│   ├── dddmall-h2-test
│   ├── dddmall-oom-test
│   ├── dddmall-smooth-sharding-test
│   ├── dddmall-yaml-test
├── dev-support  || -- # 开发工具包
```