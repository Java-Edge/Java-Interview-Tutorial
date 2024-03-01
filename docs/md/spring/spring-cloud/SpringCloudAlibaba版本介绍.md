# Spring Cloud Alibaba版本介绍
> 由于 Spring Boot 3.0，Spring Boot 2.7~2.4 和 2.4 以下版本之间变化较大，目前企业级客户老项目相关 Spring Boot 版本仍停留在 Spring Boot 2.4 以下，为了同时满足存量用户和新用户不同需求，社区以 Spring Boot 3.0 和 2.4 分别为分界线，同时维护 2022.x、2021.x、2.2.x 三个分支迭代。如果不想跨分支升级，如需使用新特性，请升级为对应分支的新版本。 为了规避相关构建过程中的依赖冲突问题，我们建议可以通过 [云原生应用脚手架](https://start.aliyun.com/) 进行项目创建。

## 2022.x 分支
>适配 Spring Boot 3.0，Spring Cloud 2022.x 版本及以上的 Spring Cloud Alibaba 版本按从新到旧排列如下表（最新版本用*标记）： (注意，该分支 Spring Cloud Alibaba 版本命名方式进行了调整，未来将对应 Spring Cloud 版本，前三位为 Spring Cloud 版本，最后一位为扩展版本，比如适配 Spring Cloud 2022.0.0 版本对应的 Spring Cloud Alibaba 第一个版本为：2022.0.0.0，第个二版本为：2022.0.0.1，依此类推)

Spring Cloud Alibaba Version	|Spring Cloud Version|	Spring Boot Version
---|----|--
2022.0.0.0*|Spring Cloud 2022.0.0|3.0.2
2022.0.0.0-RC2|Spring Cloud 2022.0.0|3.0.2
2022.0.0.0-RC1|Spring Cloud 2022.0.0|3.0.0

## 2021.x 分支
>适配 Spring Boot 为 2.4，Spring Cloud Hoxton 版本及以下的 Spring Cloud Alibaba 版本按从新到旧排列如下表（最新版本用*标记）：

Spring Cloud Alibaba Version|	Spring Cloud Version|	Spring Boot Version
---|----|--
2021.0.5.0*|Spring Cloud 2021.0.5|2.6.13
2021.0.4.0|Spring Cloud 2021.0.4|2.6.11
2021.0.1.0|Spring Cloud 2021.0.1|2.6.3
2021.1|Spring Cloud 2020.0.1|2.4.2
## 2.2.x 分支
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
## 组件版本关系
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