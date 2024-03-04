# SpringCloudAlibaba介绍

> 大家好，我叫阿明。下面我会为大家准备Spring Cloud Alibaba系列知识体系，结合实战输出案列，让大家一眼就能明白得技术原理，应用于各公司得各种项目和生活中。让我们得生活越来越美好。
## SpringCloudAlibaba介绍
### Spring Cloud Alibaba 是什么？
*Spring Cloud Alibaba 为分布式应用开发提供一站式解决方案。它包含开发分布式应用程序所需的所有组件，使您可以轻松地使用 Spring Cloud 微服务框架开发应用程序。*
![服务模型](http://124.222.54.192:4000/public/upload/2024/02/28/202402281720261903.png)
### 微服务全景图
![服务链路](http://124.222.54.192:4000/public/upload/2024/02/28/202402281721334975.png)
### 核心特色
1. 简单易用：Spring Cloud Alibaba 作为一站式的微服务构建方案，用户只需要添加一些注解和少量配置，就可以通过阿里中间件来迅速搭建分布式应用系统。
2. 扩展性强：Spring Cloud Alibaba 基于 Spring Cloud 微服务解决方案规范，可便捷地对其中的组件进行扩展和替换。
3. 生产等级：核心组件都经过过阿里巴巴多年双十一洪峰考验，成熟稳定。
4. 能力全面：针对微服务架构中的服务注册与发现、分布式消息、微服务限流降级、分布式事务和微服务治理等重要领域，都提供了对应解决方案。
## Spring Cloud Alibaba体系

> Spring Cloud Alibaba 是一套基于 Spring Cloud 的微服务解决方案，它集成了阿里巴巴集团在微服务架构实施中所使用的一系列开源中间件和服务治理组件，帮助开发者构建、部署和管理微服务应用。


### Spring Cloud Alibaba
![](http://124.222.54.192:4000/public/upload/2024/02/29/202402291714045405.png)
>Spring Cloud Alibaba 致力于提供微服务开发的一站式解决方案。
### Nacos
![](http://124.222.54.192:4000/public/upload/2024/02/29/202402291559062416.png)


> 作为服务发现与配置中心，提供了一站式的分布式系统服务发现、配置管理以及动态配置推送等功能。

### Sentinel
![](http://124.222.54.192:4000/public/upload/2024/02/29/202402291559061148.png)

> 提供服务容错能力，包括流量控制、熔断降级、系统负载保护、热点key限流等多个维度的防护，保障微服务在异常情况下仍能稳定运行。

### RocketMQ
![](http://124.222.54.192:4000/public/upload/2024/02/29/202402291559069296.png)

> 阿里巴巴开源的消息队列产品，用于处理高并发、高可用的消息传递，支持发布/订阅、顺序消息、事务消息等多种消息模型。

### Dubbo
![ ](http://124.222.54.192:4000/public/upload/2024/02/29/202402291559065988.png)

> 高性能、轻量级的RPC框架，使得服务间的通信更为高效，并提供了丰富的服务治理功能。

### Seata
![ ](http://124.222.54.192:4000/public/upload/2024/02/29/202402291613447851.png)

> 分布式事务解决方案，旨在解决分布式环境下的事务一致性问题，支持AT、TCC、Saga等模式。

### Higress
![ ](http://124.222.54.192:4000/public/upload/2024/02/29/202402291559069065.png)

> Higress是基于阿里内部的Envoy Gateway实践沉淀、以开源Istio + Envoy为核心构建的下一代云原生网关，实现了流量网关 + 微服务网关 + 安全网关三合一的高集成能力，深度集成Dubbo、Nacos、Sentinel等微服务技术栈，能够帮助用户极大的降低网关的部署及运维成本且能力不打折；在标准上全面支持Ingress与Gateway API，积极拥抱云原生下的标准API规范；同时，Higress Controller也支持Nginx Ingress平滑迁移，帮助用户零成本快速迁移到Higress。

### Alibaba Cloud SMS

> 覆盖全球的短信服务，友好、高效、智能的互联化通讯能力，帮助企业迅速搭建客户触达通道。

### Alibaba Cloud OSS
>阿里云对象存储服务（Object Storage Service，简称 OSS），是阿里云提供的海量、安全、低成本、高可靠的云存储服务。您可以在任何应用、任何时间、任何地点存储和访问任意类型的数据。
### Alibaba Cloud SchedulerX

>阿里中间件团队开发的一款分布式任务调度产品，提供秒级、精准、高可靠、高可用的定时（基于 Cron 表达式）任务调度服务。


## 第二代Spring Cloud Alibaba主流时代
>  spring cloud 现在已经是一种标准了，各公司可以基于它的编程模型编写自己的组件 ，比如Netflix、阿里巴巴都有自己的一套通过spring cloud 编程模型开发的分布式服务组件 。Spring Cloud Alibaba 主要包含 Sentinel、Nacos、RocketMQ、Dubbo、Seata 等组件。

### 第一代spring cloud 的组件

> 第一代实现： Spring Cloud Netflix

组件名称| 功能 | 描述
-----| -----|-----
Eureka	|服务治理（注册、发现......）|
Ribbon|客户端负载均衡器|
Hystrix|服务之间远程调用时的熔断保护|Hystrix 的使用主要有三种方式  HystrixCommand 注解方式;结合 Feign 使用;结合 Zuul 使用
Feign|通过定义接口的方式直接调用其他服务的 API|
Zuul	|服务网关|提供了路由、监控、弹性、安全等服务。Zuul 能够与 Eureka、Ribbon、Hystrix 等组件配合使用。
Config|分布式配置中心组件|
Sleuth|用于请求链路跟踪|
Stream|用来为微服务应用构建消息驱动能力|

### Spring Cloud 二代组件

> 第二代实现： Spring Cloud Alibaba.
> Spring Cloud Alibaba 是阿里巴巴结合自身的微服务实践而推出的微服务开发的一站式解决方案，是 Spring Cloud 第二代实现的主要组成部分。Spring Cloud Alibaba 吸收了 Spring Cloud Netflix 的核心架构思想，并进行了高性能改进。自 Spring Cloud Netflix 进入停更维护后，Spring Cloud Alibaba 逐渐代替它成为主流的微服务框架。Spring Cloud Alibaba 是国内首个进入 Spring 社区的开源项目。2018 年 7 月，Spring Cloud Alibaba 正式开源，并进入 Spring Cloud 孵化器中孵化；2019 年 7 月，Spring Cloud 官方宣布 Spring Cloud Alibaba 毕业，并将仓库迁移到 Alibaba Github OSS 下。

第一代组件|第一代使用情况|第二代组件
-------- | -----|---
Eureka|暂停了 2.X 版本的开发，1.X 的版本还会维护|Nacos
Config|Apollo优势强于原有config|Apollo
Zuul|Zuul1 基于 Servlet 构建，使用的是阻塞的 IO，性能并不是很理想|spring cloud gateway或者新一代higress
Hystrix|Hystrix 停止开发|Sentinel


### 基于springcloud第二代微服务基本组合组件
组件|功能
---|--
Nacos|服务注册中心
Apollo|分布式配置中心
XXL-JOB|分布式定时任务中心
SpringBoot|微服务组件 
Sentinel|服务熔断限流组件 
 higress|微服务网关
Spring Cloud OpenFeign|服务通信调用
Seata|分布式事务
RocketMQ|消息队列
Skywalking|服务调用链监控系统
Redis|分布式缓存 
ELK|日志收集、查询系统
Prometheus|Metrics指标监控系统

## Spring Cloud Alibaba版本介绍
> 由于 Spring Boot 3.0，Spring Boot 2.7~2.4 和 2.4 以下版本之间变化较大，目前企业级客户老项目相关 Spring Boot 版本仍停留在 Spring Boot 2.4 以下，为了同时满足存量用户和新用户不同需求，社区以 Spring Boot 3.0 和 2.4 分别为分界线，同时维护 2022.x、2021.x、2.2.x 三个分支迭代。如果不想跨分支升级，如需使用新特性，请升级为对应分支的新版本。 为了规避相关构建过程中的依赖冲突问题，我们建议可以通过 [云原生应用脚手架](https://start.aliyun.com/) 进行项目创建。

### 2022.x 分支
>适配 Spring Boot 3.0，Spring Cloud 2022.x 版本及以上的 Spring Cloud Alibaba 版本按从新到旧排列如下表（最新版本用*标记）： (注意，该分支 Spring Cloud Alibaba 版本命名方式进行了调整，未来将对应 Spring Cloud 版本，前三位为 Spring Cloud 版本，最后一位为扩展版本，比如适配 Spring Cloud 2022.0.0 版本对应的 Spring Cloud Alibaba 第一个版本为：2022.0.0.0，第个二版本为：2022.0.0.1，依此类推)

Spring Cloud Alibaba Version	|Spring Cloud Version|	Spring Boot Version
---|----|--
2022.0.0.0*|Spring Cloud 2022.0.0|3.0.2
2022.0.0.0-RC2|Spring Cloud 2022.0.0|3.0.2
2022.0.0.0-RC1|Spring Cloud 2022.0.0|3.0.0

### 2021.x 分支
>适配 Spring Boot 为 2.4，Spring Cloud Hoxton 版本及以下的 Spring Cloud Alibaba 版本按从新到旧排列如下表（最新版本用*标记）：

Spring Cloud Alibaba Version|	Spring Cloud Version|	Spring Boot Version
---|----|--
2021.0.5.0*|Spring Cloud 2021.0.5|2.6.13
2021.0.4.0|Spring Cloud 2021.0.4|2.6.11
2021.0.1.0|Spring Cloud 2021.0.1|2.6.3
2021.1|Spring Cloud 2020.0.1|2.4.2
### 2.2.x 分支
>适配 Spring Boot 为 2.4，Spring Cloud Hoxton 版本及以下的 Spring Cloud Alibaba 版本按从新到旧排列如下表（最新版本用*标记）：

Spring Cloud Alibaba Version	|Spring Cloud Version	|Spring Boot Version
---|----|--
2.2.10-RC1*|Spring Cloud Hoxton.SR12|2.3.12.RELEASE
2.2.9.RELEASE|Spring Cloud Hoxton.SR12|2.3.12.RELEASE
2.2.8.RELEASE|Spring Cloud Hoxton.SR12|2.3.12.RELEASE
2.2.7.RELEASE|Spring Cloud Hoxton.SR12|2.3.12.RELEASE
2.2.6.RELEASE|Spring Cloud Hoxton.SR9|2.3.2.RELEASE
2.2.1.RELEASE|Spring Cloud Hoxton.SR3|2.2.5.RELEASE
2.2.0.RELEASE|Spring Cloud Hoxton.RELEASE|2.2.X.RELEASE
2.1.4.RELEASE|Spring Cloud Greenwich.SR6|2.1.13.RELEASE
2.1.2.RELEASE|Spring Cloud Greenwich|2.1.X.RELEASE
2.0.4.RELEASE(停止维护，建议升级)|Spring Cloud Finchley|2.0.X.RELEASE
1.5.1.RELEASE(停止维护，建议升级)|Spring Cloud Edgware|1.5.X.RELEASE
### 组件版本关系
>每个 Spring Cloud Alibaba 版本及其自身所适配的各组件对应版本如下表所示（注意，Spring Cloud Dubbo 从 2021.0.1.0 起已被移除出主干，不再随主干演进）：

Spring Cloud Alibaba Version	|Sentinel Version|	Nacos Version|	RocketMQ Version|	Dubbo Version|	Seata Version
---|----|--|--|--|--
2022.0.0.0|1.8.6|2.2.1|4.9.4|~|1.7.0
2022.0.0.0-RC2|1.8.6|2.2.1|4.9.4|~|1.7.0-native-rc2
2021.0.5.0|1.8.6|2.2.0|4.9.4|~|1.6.1
2.2.10-RC1|1.8.6|2.2.0|4.9.4|~|1.6.1
2022.0.0.0-RC1|1.8.6|2.2.1-RC|4.9.4|~|1.6.1
2.2.9.RELEASE|1.8.5|2.1.0|4.9.4|~|1.5.2
2021.0.4.0|1.8.5|2.0.4|4.9.4|~|1.5.2
2.2.8.RELEASE|1.8.4|2.1.0|4.9.3|~|1.5.1|
2021.0.1.0|1.8.3|1.4.2|4.9.2|~|1.4.2
2.2.7.RELEASE|1.8.1|2.0.3|4.6.1|2.7.13|1.3.0
2.2.6.RELEASE|1.8.1|1.4.2|4.4.0|2.7.8|1.3.0
2021.1 or 2.2.5.RELEASE or 2.1.4.RELEASE or 2.0.4.RELEASE|1.8.0|1.4.1|4.4.0|2.7.8|1.3.0
2.2.3.RELEASE or 2.1.3.RELEASE or 2.0.3.RELEASE|1.8.0|1.3.3|4.4.0|2.7.8|1.3.0
2.2.1.RELEASE or 2.1.2.RELEASE or 2.0.2.RELEASE|1.7.1|1.2.1|4.4.0|2.7.6|1.2.0
2.2.0.RELEASE|1.7.1|1.1.4|4.4.0|2.7.4.1|1.0.0
2.1.1.RELEASE or 2.0.1.RELEASE or 1.5.1.RELEASE|1.7.0|1.1.4|4.4.0|2.7.3|0.9.0
2.1.0.RELEASE or 2.0.0.RELEASE or 1.5.0.RELEASE|1.6.3|1.1.1|4.4.0|2.7.3|0.7.1