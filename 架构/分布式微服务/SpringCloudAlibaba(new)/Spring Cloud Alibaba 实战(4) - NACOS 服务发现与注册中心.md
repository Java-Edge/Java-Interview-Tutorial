# 1 什么是Spring Cloud
◆ 快速构建分布式系统的工具集
![](https://img-blog.csdnimg.cn/20191003215227241.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20191003215316927.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

◆ 致力于提供微服务开发的一-站式解决方案。
- 包含微服务开发的必备组件
- 基于Spring Cloud ,符合Spring Cloud标准
- 阿里的微服务解决方案
![](https://img-blog.csdnimg.cn/20191003225837228.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 2 版本与差异性
 语义化的版本控制
        2：主版本，第几代
        1：次版本，一些功能的增加，但是架构没有太大的变化，是兼容的
        5：增量版本，bug修复
        release：里程碑，SNAPSHOT：开发版 M：里程碑 RELEASE：正式版
        
![](https://img-blog.csdnimg.cn/20191003232127260.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## Greewich SR3
Greenwich: release train (发布列车)
```
伦敦地铁站站名
Angel 
Brixton
Camden
Da lston
Edgware
Finchley
Greenwich
Hoxton(还没有正式发布)
```
Service Relase : bug修复

Greewich RELEASE: Greewich版本的第一个正式版

Greewich RELEASE -> 第一-个正式版本一-> 友
現bug- -> SR1版本一-> SR2版本


- 版本兼容性(孵化前)
![](https://img-blog.csdnimg.cn/20191004001111530.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

版本兼容性(孵化成功后)
![](https://img-blog.csdnimg.cn/20191004001158126.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 3生产环境如何选择版本?
坚决不用非稳定版本/end-of- life版本
尽量用最新一-代
- xx.RELEASE版本缓缓
- SR2之后一般可大规模使用

# 4整合Spring Cloud Alibaba
Spring Cloud
Spring Cloud Alibaba
整合之后无需再具体配置版本!
![](https://img-blog.csdnimg.cn/20191004004303873.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 5 服务提供者与服务消费者
- 服务提供者
服务的被调用方(即:为其他微服务提供接口的微服务)
- 服务消费者
服务的调用方(即:调用其他微服务接口的微服务)

![](https://img-blog.csdnimg.cn/20191004012238608.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 防止失败重复
![](https://img-blog.csdnimg.cn/20191004012414951.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


![](https://img-blog.csdnimg.cn/20191004012605152.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 架构演进
![](https://img-blog.csdnimg.cn/20191004012808316.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 点击pom节点即可查看nacos版本!
![](https://img-blog.csdnimg.cn/20191004013108846.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

[下载地址](https://github.com/alibaba/nacos/releases)
- 启动
```bash
sh startup.sh -m standalone
```
![](https://img-blog.csdnimg.cn/20191004014934257.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20191004015100714.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 将应用注册到Nacos
## spring-boot-starter-xxxx
xxxx-spring-boot-starter
spring-cloud-starter-{spring cloud子项目的名称}-[{模块名称}]
feign spring-cloud-starter-openfeign
sentinel spring-cloud-starter-alibaba-sentinel


◆用户中心注册到Nacos
- 添加依赖
![](https://img-blog.csdnimg.cn/20191004015359758.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 添加注解(现在非必须)
![](https://img-blog.csdnimg.cn/20191004015625981.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 写配置
![](https://img-blog.csdnimg.cn/20191004015735586.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)



# 服务发现的领域模型
- Namespace :实现隔离 ,默认public
- Group :不同服务可以分到一个组，默认DEFAULT GROUP
- Service :微服努
- Cluster :対指定微服努的一个虚似刺分,默认DEFAULT
- Instance :微服努実例

 ![](https://img-blog.csdnimg.cn/20191005005052694.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
元数据是什么?

- 官方描述
https://nacos.io/zh-cn/docs/concepts.html

级别: 
- 服务级别
- 集群级别
- 实例级别