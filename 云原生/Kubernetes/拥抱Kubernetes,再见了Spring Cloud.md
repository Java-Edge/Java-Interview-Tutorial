相信很多开发者在熟悉微服务工作后，才发现：
以为用 Spring Cloud 已经成功打造了微服务架构帝国，殊不知引入了 k8s 后，却和 Cloud Native 的生态发展脱轨。

从 2013 年的 Spring Boot
> 2012年10月，Mike Youngstrom在Spring jira中创建了一个功能需求，要求在Spring框架中支持无容器Web应用程序体系结构。他建议通过main方法引导的Spring容器内配置Web容器服务。这一需求促成了2013年初开始的Spring Boot项目的开发。2014年4月，Spring Boot 1.0.0发布。从那以后，一些Spring Boot小版本开始出现。
- Spring Boot 1.1（2014年6月）：改进的模板支持，gemfire支持，elasticsearch和apache solr的自动配置
- Spring boot 1.2（2015年3月）：升级到servlet 3.1/tomcat 8/jetty 9和spring 4.1，支持banner/jms /SpringBoot Application注释
- Spring boot 1.3（2016年12月）：升级到spring4.2，新的spring-boot-devtools，缓存技术的自动配置（ehcache，hazelcast，redis，guava和infinispan）以及完全可执行的jar支持
- Spring boot 1.4（2017年1月）：升级到spring 4.3，couchbase/neo4j支持，启动失败分析和RestTemplateBuilder
- Spring boot 1.5（2017年2月）：支持kafka /ldap，第三方库升级，放弃对CRaSH支持和执行器日志终端用以动态修改应用程序日志级别
- Spring boot的简便性使java开发人员能够快速大规模地应用于项目。 Spring boot可以说是Java中开发基于RESTful微服务Web应用的最快方法之一。它也非常适合docker容器部署和快速原型设计
- Spring Boot 2.0.0，于2018年3月1日发布，新版本特点有：
基于 Java 8，支持 Java 9；支持 Quartz 调度程序；支持嵌入式 Netty，Tomcat, Undertow 和 Jetty 均已支持 HTTP/2；执行器架构重构，支持 Spring MVC, WebFlux 和 Jersey；对响应式编程提供最大支持；引入对 Kotlin 1.2.x 的支持，并提供了一个 runApplication 函数，用Kotlin 通用的方式启动 Spring Boot 应用程序。

 一直到 Spring Cloud，第一批选型它的大公司很早就构建出了完整微服务生态，很多解決方案开放源码，很多坑点已被踩完相当稳定。
对于很多想要使用微服务架构的中小公司，绝对是最佳进场时机，直接使用 Spring Cloud 全家桶，绝对是稳定而正确的选择。

但当引入了 k8s 后，仿佛就变天了。

# k8s  和 Spring Cloud 的激烈冲突
Java 生态的 Spring Cloud 可谓是迄今最完整的微服務框架，基本滿足所有微服务架构需求，网上的教程也不胜枚举。
但也因为 Spring Cloud 生态过于完整，如今  k8s 大行其道，当我们把原来基于 Spring Cloud 开发的服务放到 k8s 后， 一些机制自成一格，不受 k8s 生态的工具和机制管控。

因為从扩展部署、运维角度出发的 k8s，在最原始容器、應用程式部署及网络层管理的基础上，已逐步实现並贴近应用层的需要，一些微服务架构下的基础需求（如：Service Discovery、API Gateway 等）开始直接或间接被纳入  k8s 生态。
导致双方有很多组件功能重复，且只能择一而终， 一旦你选了 Spring Cloud 的解決方案，就得放弃  k8s 那边的机制。
# Spring Cloud 官方提供的解决方案
- 为解决该问题，官方在 Github 上提供了开源方案，说明如何以 Spring Cloud 整合 Kubernetes 生态下的元件，主要讨论从原本组件架构过度并一直到 Kubernetes 原生环境后的处理方法
https://github.com/spring-cloud/spring-cloud-kubernetes

该解決方案重点如下：
## 服务发现 (Service Discovery)
Spring Cloud 的经典解决方案：Netflix Eureka、Alibaba Nacos、Hashicorp。主要原理都是在服务部署时，去注册自己的服务，让其他服务可检索到自己。
```java
spring.cloud.service-registry.auto-registration.enabled
@EnableDiscoveryClient(autoRegister=false)
```
但在  k8s ，服務的注册和查询由 Service 元件负责，其连线名称，是利用內部 DNS 实现。这代表我們要將服务发现功能，接上 k8s 的 Service 机制。
为达成目的，方案中提供了 DiscoveryClient 组件，让基于 Spring Cloud 所开发的程序可方便查询其他服务。
使用了 Kubernetes 原生的服务发现，才能被 Istio 追踪，未來才能纳入 Service Mesh 的管控。
# 配置管理 (Configuration Management)
Spring Cloud 的解决方案：spring-cloud-config。但在 Kubernetes 上，有 ConfigMap 和 Secret 可使用，而且通常还会搭配 Vault 管理敏感配置。

而该方案提供了 ConfigMapPropertySource 和 SecretsPropertySource，來存取 Kubernetes 上的 ConfigMap 和 Secret。
## 负载均衡和熔断器 (Load Balancing & Circuit Breaker)

Spring Cloud原有方案：Netflix Ribbon 和 Hystrix，但在 k8s 有 Service 实现负载均衡，以及 Istio 可实现熔断器，开发者只需专注 crud。
由于负载均衡和熔断器會依赖服务发现机制，因此 Ribbon 和 Hytrix 原先的功能在 k8s 原生环境下失效。
该解決方案內虽然有提到一些关于 Ribbon 整合 Kubernetes 原生环境的实现，但相关链接已消失，应该是放弃了。
所以推荐避免使用客户端的负载均衡和熔断器。


# Spring Cloud V.S k8s 重叠方案
![](https://img-blog.csdnimg.cn/20201226153733174.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

我们当然也能完全不理會  k8s 原生组件，完全采用 Spring Boot 和 Spring Cloud 的解決方案，只把 k8s 当做部署应用的工具和平台。但显然在未來，Service Mesh 及其通用的 Cloud Native 技术发展，就会和Spring Cloud脱轨，无法再和我们的应用深度整合。

相比于 Spring Cloud 生态都只能使用 Java ， k8s 生态的发展和设计更为通用且广泛，一些 Spring Cloud 內的元件功能，在 Kubernetes 除了包含支援以外，甚至有更多的整合和考量及延伸的功能。
由于 CNCF 的推波助澜及更多国际大厂投入，新工具、运维方法、整合能力层出不穷。因此，在选型微服务架构时，k8s 的各种原生解決方案，都需要被放入评估考量中。
目前网络上很多 Spring Boot 和 Spring Cloud 的很多已经过时，而且都没整合  k8s，与当下主流的基础设施环境有落差，学习时都要自己斟酌考量。