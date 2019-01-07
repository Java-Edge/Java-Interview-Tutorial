> 本文主要内容是:为什么要使用网关,整合Gateway,Gateway核心学习:Route,Predicate,Filter,最后使用Gateway聚合微服务请求

先总结至此的架构

![](https://img-blog.csdnimg.cn/20191210011538309.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
#  1 网关的价值
不使用网关行嘛?
- 各个请求直接打在各个微服务
![](https://img-blog.csdnimg.cn/20191210011922797.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

小规模看起来还行,如果微服务很多呢?上百个呢?带来哪些问题呢
1. 认证复杂,要对每个服务中每个接口做认证处理!
2. 客户端难以重构,随着架构迭代,很可能要重新划分微服务,由于拆分是动态进行的,客户端如果直接就与微服务通信的话,重构就很实现咯,很可能重新拆分微服务后域名都变了,客户端就需要做大量的改动
3. 其他微服务使用了浏览器不友好的协议,比如Thrift协议,直接访问的话没法的呀!

要解决以上这些问题,业界普遍做法就是构建一个网关,外部请求经过网关转发再打到相应的微服务,有以下好处
1. 简化了登录认证,而不需在每个服务都认证一遍
2. 对外暴露的永远是一个域名,不管内部的微服务如何拆分,域名都不会变,客户端重构的成本大大降低

# 2 Spring Cloud Gateway简介

◆ 是Spring Cloud的网关(第二代) , 未来会取代Zuul(第一代)
◆ 基于Netty、 Reactor以及WebFlux构建

## 2.1 优点
◆ 性能强劲
是第一代网关Zuul 1.x的1.6倍!性能PK :
- 推荐阅读
[纠错帖：Zuul & Spring Cloud Gateway & Linkerd性能对比](https://www.imooc.com/article/285068)

◆ 功能强大
- 内置了很多实用功能,比如转发、监控、限流等

◆  设计优雅,易扩展

## 2.1 缺点
◆  依赖Netty与Webflux ,不是Servlet编程模型,有一定的学习成本
◆ 不能在Servlet容器下工作,也不能构建成WAR包
◆ 不支持Spring Boot 1.x,至少都得2.x版本
# 3 编写Spring Cloud Gateway
- 新建项目并启动
![](https://img-blog.csdnimg.cn/20191210015121128.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
## 3.1 转发规律
- 访问${GATEWAY_ URL}/{微服务X}/xx 会转发到微服务X的/xx路径

# 4 核心概念
◆ Route(路由)
- Spring. Cloud. Gateway的基础元素,可简单理解成一条转发的规则。
包含: ID、目标URL、Predicate集合以及 Filter集合。

◆Predicate (谓词)
- 即java.util.function.Predicate , Spring Cloud Gateway使用
Predicate实现路由的匹配条件。

◆ Filter (过滤器)
- 修改请求以及响应

## 路由配置示例
![](https://img-blog.csdnimg.cn/20191210021341656.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
然而我们并未如此配置路由哦!而是如下
![](https://img-blog.csdnimg.cn/20191210015944806.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 5 架构剖析
![](https://img-blog.csdnimg.cn/20191210020457255.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
对应源码
- Gateway Handler Mapping :
org.springframework.cloud.gateway.handler.RoutePredicateHandlerMapping
- Gateway Web Handler :
org.springframework.cloud.gateway.handler.FilteringWebHandler


# 6 路由谓词工厂（Route Predicate Factories）
## 6.1 内置
![](https://img-blog.csdnimg.cn/20191210230920697.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 推荐阅读
[Spring Cloud Gateway-路由谓词工厂详解（Route Predicate Factories）](https://www.imooc.com/article/290804)


## 6.2 自定义路由谓词工厂
- 路由规则
![](https://img-blog.csdnimg.cn/20191210233111645.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 配置类
![](https://img-blog.csdnimg.cn/20191210232946122.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 自定义谓词工厂
![](https://img-blog.csdnimg.cn/20191210233307998.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

# 7 过滤器工厂（GatewayFilter Factories）
## 7.1 内置
- 推荐阅读
[Spring Cloud Gateway-过滤器工厂详解（GatewayFilter Factories）](https://www.imooc.com/article/290816)
- 添加配置,访问getway/**会增加一个header前缀哦,zai'ch
![](https://img-blog.csdnimg.cn/2019121023433512.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 打断点
![](https://img-blog.csdnimg.cn/20191211001604708.png)![](https://img-blog.csdnimg.cn/20191211001537211.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

## 7.2 自定义过滤器工厂
### 7.2.1 生命周期
- pre : Gateway转发请求之前
- post : Gateway转发请求之后

### 7.2.2 自定义
#### 方式1 
◆ 继承: AbstractGatewayFilterFactory
◆ 参考示例:
`org.springframework.cloud.gateway.filter.factory.RequestSizeGatewayFilterFactory`
![](https://img-blog.csdnimg.cn/2019121100195597.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 配置形式
![](https://img-blog.csdnimg.cn/20191211002024781.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
#### 方式2
◆ 继承 : AbstractNameValueGatewayFilterFactory
◆ 参考示例:
`org.springframework.cloud.gateway.filter.factory.AddRequestHeaderGatewayFilterFactory`
![](https://img-blog.csdnimg.cn/20191211002228821.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 配置形式
![](https://img-blog.csdnimg.cn/20191211002355178.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

`这种方式其实是第一种的简化版`
### 7.2.3 核心API
◆ exchange.getRequest().mutate().xxx //修改request
◆ exchange.mutate().xxx //修改exchange
◆ chain.filter(exchange) //传递给下一个过滤器处理
◆ exchange.getResponse() //拿到响应
### 7.2.4 实现一个过滤器工厂
记录日志功能
![](https://img-blog.csdnimg.cn/20191211003453670.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 配置文件,两个参数
![](https://img-blog.csdnimg.cn/20191211003742372.png)

## 7.3 全局过滤器
有执行顺序哦!
- 推荐阅读
[Spring Cloud Gateway-全局过滤器（Global Filters）](https://www.imooc.com/article/290821)

悬念：如何为Spring Cloud Gateway整合Sentinel？
Sentinel在V1.6+才支持gateway!

## 7.4 过滤器执行顺序
-  Order越小越靠前执行
-  过滤器工厂的Order按配置顺序从1开始递增
![](https://img-blog.csdnimg.cn/20191213004209463.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
-  如果配置了默认过滤器,则先执行相同Order的默认过滤器
![](https://img-blog.csdnimg.cn/20191213004315418.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
## 核心代码
- org.springframework.cloud.gateway.route.RouteDefinitionRouteLocator#loadGatewayFilters :为过滤器设置了Order数值,从1开始
![](https://img-blog.csdnimg.cn/20191213004609422.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- org.springframework.cloud.gateway.route.RouteDefinitionRouteLocator#getFilters :加载默认过滤器&路由过滤器,并对过滤器做了排序
![](https://img-blog.csdnimg.cn/20191213004714443.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- org.springframework.cloud.gateway.handler. FilteringWebHandler#handle :构建过滤器链并执行
![](https://img-blog.csdnimg.cn/20191213004836877.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

# 8 监控Spring Cloud Gateway
- 推荐阅读


[Spring Cloud Gateway监控](https://www.imooc.com/article/290822)
# 9 排错、调试技巧
- 推荐阅读


[Spring Cloud Gateway排错、调试技巧总结](https://www.imooc.com/article/290824)
# 10 限流
- 推荐阅读

[Spring Cloud Gateway限流详解](https://www.imooc.com/article/290828)


# 11 总结
◆ 路由、路由谓词工厂、过滤器工厂、全局过滤器...

◆ 网关集大成

● 注册到Nacos

● 集成Ribbon

● 容错(默认Hystrix ,也可用Sentinel )
