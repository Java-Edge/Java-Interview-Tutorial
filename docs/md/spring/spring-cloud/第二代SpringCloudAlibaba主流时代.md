
# 第二代Spring Cloud Alibaba主流时代
>  spring cloud 现在已经是一种标准了，各公司可以基于它的编程模型编写自己的组件 ，比如Netflix、阿里巴巴都有自己的一套通过spring cloud 编程模型开发的分布式服务组件 。Spring Cloud Alibaba 主要包含 Sentinel、Nacos、RocketMQ、Dubbo、Seata 等组件。

## 第一代spring cloud 的组件

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

## Spring Cloud 二代组件

> 第二代实现： Spring Cloud Alibaba.
> Spring Cloud Alibaba 是阿里巴巴结合自身的微服务实践而推出的微服务开发的一站式解决方案，是 Spring Cloud 第二代实现的主要组成部分。Spring Cloud Alibaba 吸收了 Spring Cloud Netflix 的核心架构思想，并进行了高性能改进。自 Spring Cloud Netflix 进入停更维护后，Spring Cloud Alibaba 逐渐代替它成为主流的微服务框架。Spring Cloud Alibaba 是国内首个进入 Spring 社区的开源项目。2018 年 7 月，Spring Cloud Alibaba 正式开源，并进入 Spring Cloud 孵化器中孵化；2019 年 7 月，Spring Cloud 官方宣布 Spring Cloud Alibaba 毕业，并将仓库迁移到 Alibaba Github OSS 下。

第一代组件|第一代使用情况|第二代组件
-------- | -----|---
Eureka|暂停了 2.X 版本的开发，1.X 的版本还会维护|Nacos
Config|Apollo优势强于原有config|Apollo
Zuul|Zuul1 基于 Servlet 构建，使用的是阻塞的 IO，性能并不是很理想|spring cloud gateway或者新一代higress
Hystrix|Hystrix 停止开发|Sentinel


## 基于springcloud第二代微服务基本组合组件
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
