# 1 初识Feign
## 1.1 Feign是什么？
Feign是声明式的Web服务客户端。它使编写Web服务客户端更加容易。要使用Feign，请创建一个接口并添加注解。它支持可插拔的注解，包括Feign注解和JAX-RS（Java API for RESTful Web Services）注解。 

Feign还支持可插拔的编码器和解码器。 Spring Cloud添加了对Spring MVC注解的支持，并支持使用Spring Web中默认使用的相同的HttpMessageConverters。 Spring Cloud集成了Eureka和Spring Cloud LoadBalancer，以在使用Feign时提供负载均衡的http客户端。

分布式系统实现远程调用的方式很多。按照协议划分，有 RPC，Webservice，http。不同协议下也有不同的框架实现，比如 dubbo 就是 RPC 框架，而本教程所讲解的 Feign 便可理解为一种 http 协议的框架实现，用于分布式服务之间通过 Http 进行远程调用。

## 1.2 项目中如何引用Feign？
在项目的 pom.xml 文件中使用
- group为`org.springframework.cloud`
- artifact id为`spring-cloud-starter-openfeign`

的起步依赖即可。
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```
spring boot 应用的启动类
```java
@SpringBootApplication
@EnableFeignClients
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```
StoreClient.java
```java
@FeignClient("stores")
public interface StoreClient {
    @RequestMapping(method = RequestMethod.GET, value = "/stores")
    List<Store> getStores();

    @RequestMapping(method = RequestMethod.POST, value = "/stores/{storeId}", consumes = "application/json")
    Store update(@PathVariable("storeId") Long storeId, Store store);
}
```
## 1.3 代码解释
在`@FeignClient`注解中，String值（上面的“stores”）是一个任意的客户端名称，用于创建负载均衡器的客户端。也可以使用url属性（绝对值或仅是主机名）指定URL。应用程序上下文中的Bean名称是接口的全限定名称。如果想要指定别名，那么还可以指定`@FeignClient`注解的`qualifier`属性值哦。

上面的负载均衡器客户端将要发现“stores”服务的物理地址。
如果你的应用程序是Eureka客户端，则它将在Eureka服务的注册表中解析该服务。如果你不想使用Eureka，则可以使用SimpleDiscoveryClient在外部配置中简单地配置服务器列表。

- 订单服务源码
https://github.com/Wasabi1234/SpringCloud_OrderDemo
- 商品服务源码
https://github.com/Wasabi1234/SpringCloud_ProductDemo


## SpringCloud中服务间两种restful调用方式
- RestTemplate
- Feign

### RestTemplate的三种使用方式

![](https://img-blog.csdnimg.cn/img_convert/063d576b00269001ec9f0bfb067816b2.png)
![](https://img-blog.csdnimg.cn/img_convert/f0895d41315208052bbaec517ef3eb79.png)
# 3 负载均衡器：Ribbion
- RestTemplate
- Feign
- Zuul
- ServerList
- IRule
- ServerListFilter
# 2 基于 Ribbon 实现微服务调用
## Client Side Load Balancer: Ribbon
Ribbon 是一个客户端负载均衡器,可很好地控制HTTP和TCP客户端的行为.
Feign已经使用Ribbon，所以若使用@FeignClient，则本节也适用也是必备知识点.

- Ribbon 中的中心概念是指定客户端的概念
每个负载平衡器是集合组件的一部分，它们一起工作以根据需要与远程服务器通信,并且集合具有你将其作为应用程序开发人员（例如使用@FeignClient注解）的名称.
Spring Cloud 使用 RibbonClientConfiguration 为每个命名的客户端根据需要创建一个新的集合作为ApplicationContext.这包含 ILoadBalancer，RestClient和ServerListFilter.

## 基于 Feign 实现微服务调用
[Feign](https://github.com/Netflix/feign) 是一个声明式的Web服务客户端.
这使得Web服务客户端的写入更加方便,要使用 Feign 创建一个接口，并对其添加注解。它提供了可插拔式的注解，包括Feign注解和JAX-RS注解。Feign还支持可插拔编码器和解码器.
Spring Cloud增加了对Spring MVC注解的支持，并使用Spring Web中默认使用的`HttpMessageConverters`.
Spring Cloud集成Ribbon和Eureka以在使用Feign时提供负载均衡的http客户端.

## 3.1 如何加入Feign
要在项目中包含Feign，请使用group`org.springframework.cloud`和artifact ID `spring-cloud-starter-feign`的启动器.

在 `@FeignClient` 注解中,String 值（上面的`eureka-client-ad-sponsor`）是一个任意的客户端名称，用于创建Ribbon负载均衡器,还可以使用`url`属性（绝对值或只是主机名）指定URL.
应用程序上下文中的bean的名称是该接口的完全限定名,要指定自己的别名,可以使用`@FeignClient`注释的`qualifier`值.
# 4 追踪源码自定义负载均衡策略
![command+option+B进入其实现类](https://img-blog.csdnimg.cn/img_convert/4fb791522ada13cb0b503e2aec7fa5a0.png)
![再跟进到 LoadBalancerClient 中](https://img-blog.csdnimg.cn/img_convert/945094b6c2275270825b7d8aebf73883.png)
![](https://img-blog.csdnimg.cn/img_convert/db9dc5803dd372f936d41709d1cc5d22.png)
![](https://img-blog.csdnimg.cn/img_convert/5cbcccd206c9bb4f75fb2a33a904a765.png)
![RibbonLoadBalancerClient#choose()](https://img-blog.csdnimg.cn/img_convert/6b954e1a106f3735f33c054365f5c396.png)
![RibbonLoadBalancerClient#getServer(ILoadBalancer loadBalancer)](https://img-blog.csdnimg.cn/img_convert/0cf79d86e8d09048f08daf3bd25c8a9d.png)
![](https://img-blog.csdnimg.cn/img_convert/2fda2407d0b51457ddff09a277476993.png)
![ILoadBalancer](https://img-blog.csdnimg.cn/img_convert/e228d4476292937d12a96f13e460e6e3.png)
![RibbonLoadBalancerClient#getServer(ILoadBalancer loadBalancer)](https://img-blog.csdnimg.cn/img_convert/04d1885e5a21fe10c54f18cc404d1095.png)
![](https://img-blog.csdnimg.cn/img_convert/98ba75b0af776caf8e706ca1bb410868.png)
![ILoadBalancer#getAllServers(),并进入](https://img-blog.csdnimg.cn/img_convert/e8af6c3781f24ece5bbd03ed8ec8150e.png)

启动两个 Product 服务
![product#1](https://img-blog.csdnimg.cn/img_convert/f11557f931b43f380b3ffac85390609f.png)
![product#2](https://img-blog.csdnimg.cn/img_convert/79cfe88a14018a7c52f36f0db703cb06.png)
再 debug 启动 Order 服务
![](https://img-blog.csdnimg.cn/img_convert/8275e6638952a618e295bd3ca889cf5f.png)
![三个服务成功注册](https://img-blog.csdnimg.cn/img_convert/00142dcc753ad666b4d70a21f28dc937.png)

![在此打断点,并 debug 运行](https://img-blog.csdnimg.cn/img_convert/d0ba6166c6cb6e810091493b951160e2.png)
![](https://img-blog.csdnimg.cn/img_convert/d7212904083a83e0e7653e2f4a1ae010.png)
![获取服务列表](https://img-blog.csdnimg.cn/img_convert/0dd6ac9fee77c000a83e3554a7648563.png)
- 再看看其负载均衡策略
![](https://img-blog.csdnimg.cn/img_convert/1a9f8b77e0a7c6886ea0ff8c9f1629a6.png)
![可见默认即轮询](https://img-blog.csdnimg.cn/img_convert/dc071d047d0d2754254d16a80b50a330.png)
负载均衡请求
![请求到2](https://img-blog.csdnimg.cn/img_convert/c0f669b36777a2ba01e41a22a88fa033.png)
![请求到1](https://img-blog.csdnimg.cn/img_convert/9e6e5ecce3648ceb500d880626ab86bb.png)
的确是轮询请求
![](https://img-blog.csdnimg.cn/img_convert/d753dca767a82af670902dbc09f5759d.png)
![通过启动日志也可看出具体使用的策略](https://img-blog.csdnimg.cn/img_convert/3a00d51d5e8466c21baf9575ec7d91c1.png)
为了检验是否为轮询,在此打断点
![](https://img-blog.csdnimg.cn/img_convert/be186884fb3b94e9ebd25c7c48fa4f5e.png)
![符合预期,确实为轮询](https://img-blog.csdnimg.cn/img_convert/2e2652649adb5237e9a6948dec4ff016.png)
如果希望使用其他负载均衡规则该咋办呢,看官网文档
![](https://img-blog.csdnimg.cn/img_convert/be30a4ce37058d54fef33899bde2815a.png)
![如希望用随机规则替代默认的轮询规则](https://img-blog.csdnimg.cn/img_convert/ebaf05c5ebab148bbd30c68167c0ba86.png)
![配置全路径名](https://img-blog.csdnimg.cn/img_convert/916522ea7fda52a30c89295156d2384d.png)
![成功替换默认规则](https://img-blog.csdnimg.cn/img_convert/cbda241ffea8ef8476b4d7d89c06e1d8.png)

# Feign的使用
[Feign](https://github.com/Netflix/feign)是一个声明式的Web服务客户端。这使得Web服务客户端的写入更加方便 要使用Feign创建一个界面并对其进行注释。它具有可插入注释支持，包括Feign注释和JAX-RS注释。Feign还支持可插拔编码器和解码器。Spring Cloud增加了对Spring MVC注释的支持，并使用Spring Web中默认使用的`HttpMessageConverters`。Spring Cloud集成Ribbon和Eureka以在使用Feign时提供负载均衡的http客户端。

### 如何加入Feign
1. 要在您的项目中包含Feign，请使用组`org.springframework.cloud`和工件ID `spring-cloud-starter-openfeign`的启动器
![](https://img-blog.csdnimg.cn/img_convert/4c775bb31650d21696ff530e5c480b69.png)

2. 在启动类添加注解@EnableFeignClients
可以在@EnableFeignClients属性defaultConfiguration中以与上述相似的方式指定默认配置
不同之处在于，此配置将适用于所有feigh客户端
![](https://img-blog.csdnimg.cn/img_convert/5d9ba063201581aa973ea7b497365fbc.png)
调用商品服务的目标接口
![](https://img-blog.csdnimg.cn/img_convert/30d89da349ebdd16485d5c434d19631e.png)
3. 声明调用的服务接口方法
- @FeignClient 
name属性为某所需调用的某个服务的接口
在`@FeignClient`注释中，String值（以上“存储”）是一个任意的客户端名称，用于创建Ribbon负载平衡器,还可以使用url属性（绝对值或只是主机名）指定URL。应用程序上下文中的bean的名称是该接口的完全限定名称。要指定自己的别名值，可以使用`@FeignClient`注释的`qualifier`值。
![添加@FeignClient注解](https://img-blog.csdnimg.cn/img_convert/a70575ca62aa9c41d97a1b35e19e5391.png)

- 声明式REST客户端(伪RPC )
- 采用了基于接口的注解
# 6 获取商品列表(Feign)

![dao层测试接口正常](https://img-blog.csdnimg.cn/img_convert/1db017843f5691d8694d834d627013d0.png)
![service 层单测正常](https://img-blog.csdnimg.cn/img_convert/f27a50f535549c8f99ba13eab84e6e1b.png)
![准备提供该接口](https://img-blog.csdnimg.cn/img_convert/3144d3953f20d1cf30d3ddc725befc60.png)
![Order 服务中访问接口](https://img-blog.csdnimg.cn/img_convert/c3836d538196abd315f240cc118dc42d.png)
![报错](https://img-blog.csdnimg.cn/img_convert/b004b87b8f6702b8a88054c8602cfe86.png)
因为参数使用了 RequestBody 注解,所以需 POST 请求
![](https://img-blog.csdnimg.cn/img_convert/3a9e9fdef3d3382ab6bc91bf6743e56b.png)
![](https://img-blog.csdnimg.cn/img_convert/d05ae310914224703cdddd511f1df192.png)
![](https://img-blog.csdnimg.cn/img_convert/5bf2648013f572253e011137de2e190e.png)
![](https://img-blog.csdnimg.cn/img_convert/d05374f653409c0c12dda193690418bc.png)
![](https://img-blog.csdnimg.cn/img_convert/2bc1790b4db13e32bdabeb6dbf4e785f.png)
# 7 扣库存(Feign)
![调用接口](https://img-blog.csdnimg.cn/img_convert/35baa3ce789648731d85e3232013d793.png)
![发现报错](https://img-blog.csdnimg.cn/img_convert/7abd811562529dae4ab624d87cd1d311.png)
![控制台](https://img-blog.csdnimg.cn/img_convert/545b00ce686cf662db2ce52058b25247.png)
由于缺失无参构造器
![](https://img-blog.csdnimg.cn/img_convert/0f842044bb5021e797f62607fd256327.png)