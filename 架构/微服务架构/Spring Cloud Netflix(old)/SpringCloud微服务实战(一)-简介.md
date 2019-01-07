# 1 简介

![](https://ask.qcloudimg.com/http-save/yehe-1752328/lazf7suo0u.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/aezj5ftadb.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/uoigl4igim.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/x62fgcihp7.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/lmse4wfaqh.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/1s0n1x9l2f.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/r3vw288hcv.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/g6i547df33.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/8d3jv5xti8.png)

# 2 微服务介绍

![](https://ask.qcloudimg.com/http-save/yehe-1752328/9uhyzn8vo8.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/mpvw7mbfff.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/ccvukmf78j.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/ckbz5l7sc6.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/fegcog106o.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/kl5ka9b19c.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/y7hym3a5vr.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/gceq5838ev.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/14ieadadkn.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/zg0sh1yiyq.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/2oinpwqk4y.png)

分布式是多节点的

 各节点通过消息通信

![](https://ask.qcloudimg.com/http-save/yehe-1752328/pg6lbr73uj.png)

简单的微服务架构

![](https://ask.qcloudimg.com/http-save/yehe-1752328/e59meuvnse.png)

微服务架构的基础框架/组件

![](https://ask.qcloudimg.com/http-save/yehe-1752328/c3hzqz78hi.png)

仔细观察

![](https://ask.qcloudimg.com/http-save/yehe-1752328/q44lwhojhe.png)

两大派系

![](https://ask.qcloudimg.com/http-save/yehe-1752328/kqx1us4a1r.png)

SpringCloud是什么

# 3  服务注册与发现

![](https://ask.qcloudimg.com/http-save/yehe-1752328/qw71teptha.png)

## 注册中心Eureka Server

![](https://ask.qcloudimg.com/http-save/yehe-1752328/u8gq7l2ud0.png)

新建项目

 使用`@EnableEurekaServer`

![](https://ask.qcloudimg.com/http-save/yehe-1752328/3hkr414ixa.png)

 就可以让应用变为Eureka服务器，这是因为spring boot封装了Eureka Server，让你可以嵌入到应用中直接使用

 直接运行成功如下

![](https://ask.qcloudimg.com/http-save/yehe-1752328/mglmi7548p.png)

 但是不断报异常,why?

![](https://ask.qcloudimg.com/http-save/yehe-1752328/ikrepoj3jw.png)

 这是因为该应用虽然是 Server 端,但也同时是 Client 端,也需要一个注册中心将自己注册进去

 为消除其异常,修改下配置

 配置需要注册的地址,也就是往自己身上注册

![](https://ask.qcloudimg.com/http-save/yehe-1752328/l4rs1h24ii.png)

 通过观察源码,知道其实是一个 map, 所以配置如下

![](https://ask.qcloudimg.com/http-save/yehe-1752328/03edpjsxlw.png)

 启动仍旧报错,其实正常问题,因为服务端自己又是 Server, 又是 Client, 服务端未启动完成时,客户端肯定是无法找到服务端的

 但是 eureka 的服务端/客户端采用心跳通信方式

![](https://ask.qcloudimg.com/http-save/yehe-1752328/pfuy8lr3n9.png)

 可看到地址已随配置被改变

接下来配置实例名

![](https://ask.qcloudimg.com/http-save/yehe-1752328/0ky8zwdc0v.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/cnmeijfj9c.png)

实例名被修改成功

但是该应用本身就是个注册中心,不需要将其显示在注册实例中,通过以下配置

![](https://ask.qcloudimg.com/http-save/yehe-1752328/t7tcwjkt96.png)

 为防止冲突,将端口号回改为默认

![](https://ask.qcloudimg.com/http-save/yehe-1752328/hzf3ir9lih.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/1tngf9b7np.png)

## 服务中心

![](https://ask.qcloudimg.com/http-save/yehe-1752328/1i51rwfp1t.png)

为避免每次手动启动,将应用打成 war 包(jar)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/xs7vh6ohdh.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/m495isx5r8.png)

通过 java 命令启动

![](https://ask.qcloudimg.com/http-save/yehe-1752328/nif0a664oo.png)

启动成功效果

![](https://ask.qcloudimg.com/http-save/yehe-1752328/cylnv7ort1.png)

Mac 下 Ctrl+C 退出服务

![](https://ask.qcloudimg.com/http-save/yehe-1752328/vnenou4v11.png)

后台执行

![](https://ask.qcloudimg.com/http-save/yehe-1752328/87irddzvju.png)

查看其相关进程信息

如此该应用就方便了我们,不需要每次都去手动启动应用,在后台会重启,若想杀死进程直接 kill

![](https://ask.qcloudimg.com/http-save/yehe-1752328/1jncsodp5r.png)

![](https://ask.qcloudimg.com/http-save/yehe-1752328/li2attoymg.png)

- `@EnableDiscoveryClient`注解
这通过`META-INF/spring.factories`查找`DiscoveryClient`接口的实现
Discovery Client的实现将在`org.springframework.cloud.client.discovery.EnableDiscoveryClient`键下的`spring.factories`中添加一个配置类。
`DiscoveryClient`实现的示例是[Spring Cloud Netflix Eureka](https://link.jianshu.com/?t=http%253A%252F%252Fcloud.spring.io%252Fspring-cloud-netflix%252F)，[Spring Cloud Consul发现](https://link.jianshu.com/?t=http%253A%252F%252Fcloud.spring.io%252Fspring-cloud-consul%252F)和[Spring Cloud Zookeeper发现](https://link.jianshu.com/?t=http%253A%252F%252Fcloud.spring.io%252Fspring-cloud-zookeeper%252F)。

默认情况下，`DiscoveryClient`的实现将使用远程发现服务器自动注册本地Spring Boot服务器。可以通过在`@EnableDiscoveryClient`中设置`autoRegister=false`来禁用此功能。

# 参考

[SpringCloud Finchley三版本微服务实战](https://coding.imooc.com/class/187.html)

> 更多内容请关注JavaEdge公众号