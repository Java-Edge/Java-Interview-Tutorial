# 1  什么是Spring Cloud Alibaba
◆ 阿里巴巴结合自身微服务实践,开源的微服务全家桶
◆ 在Spring Cloud项目中孵化,很可能成为Spring Cloud第二代的标准实现
◆ 在业界广泛使用，已有很多成功案例
- Github issue :使用的公司及场景
![](https://img-blog.csdnimg.cn/20190915211051140.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190915211138514.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 2 应用场景
◆ 大型复杂的系统
例如大型电商系统
◆ 高并发系统
 例如大型门户网站,商品秒杀系统
◆ 需求不明确,且变更很快的系统
例如创业公司业务系统

# 3 Spring Cloud Alibaba和Spring Cloud 的区别和联系
SpringCloud Alibaba是SpringCloud的子项目，SpringCloud Alibaba符合SpringCloud标准
比较SpringCloud第一代与SpringCloud Alibaba的优势，如下如：
![](https://img-blog.csdnimg.cn/20190915212013759.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190915212129651.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 3 将学到
◆ Spring Cloud Alibaba核心组件的用法及实现原理
◆ Spring Cloud Alibaba结合微信小程序从”0”学习真正开发中的使用
◆ 实际工作中如何避免踩坑,正确的思考问题方式
◆ Spring Cloud Alibaba的进阶:代码的优化和改善,微服务监控

# 4 进阶知识点
![](https://img-blog.csdnimg.cn/20190915212426584.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 5 教程思路
![](https://img-blog.csdnimg.cn/20190915212526988.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 6 Spring Cloud Alibaba的重要组件精讲
## 服务发现 Nacos
- 服务发现原理剖析
- Nacos Server/Clinet
- 高可用Nacos搭建

## 负载均衡Ribbon
- 负载均衡常见模式
- RestTemplate整合Ribbon
- Ribbon配置自定义
- 如何扩展Ribbon

## 声明式HTTP客户端-Feign
- 如何使用Fegin
- Fegin配置自定义
- 如何扩展Fegin

## 服务容错Sentinel
- 服务容错原理
- Sentinel
- Sentinel Dashboard
- Sentinel核心原理分析

## 消息驱动RocketMQ
- SpringCloud Stream
- 实现异步消息推送与消费

## API网关GateWay
- 整合GateWay
- 三个核心
- 聚合微服务请求

## 用户认证与授权
- 认证授权常见方案
- 改造GateWay
- 扩展Fegin

## 配置管理Nacos
- 配置如何管理
- 配置动态刷新
- 配置管理的最佳实现

## 调用链监控Sleuth
- 调用链监控剖析
- Sleuth使用
- Zipkin使用

![](https://img-blog.csdnimg.cn/20190915214414883.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 7 软件环境
◆ JDK 8
◆ MySQL 8.0.13
◆ Maven 3.3.5
