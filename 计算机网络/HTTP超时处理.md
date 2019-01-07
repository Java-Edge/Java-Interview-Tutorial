# 1 超时，网络终究是靠不住的
HTTP调用既然是网络请求，就可能超时，超时错误分两种，connect timeout和read timeout，前者可能是网络问题，或者服务端连接池不够用了。后者是连接已经建立了，但是服务端太忙了，不能及时处理完你的请求。

因此在实际开发中都需要注意考虑这些超时的处理措施。

框架设置的默认超时时间是否合理？
- 过短，请求还未处理完成，你有些急不可耐了呀！
- 过长
请求早已超出正常响应时间而挂了！

网络不稳定性，超时后可以通过定时任务请求重试
这时，就要注意考虑服务端接口幂等性设计，即是否允许重试？

框架是否会像浏览器那样限制并发连接数，以免在高并发下，HTTP调用的并发数成为瓶颈！

## 1.1 HTTP调用框架技术选型
- Spring Cloud全家桶或Dubbo
使用Feign进行声明式服务调用或 Dubbo自己的一套服务调用流程。
- 只使用Spring Boot
HTTP客户端，如Apache HttpClient

## 1.2 连接超时配置 && 读取超时参数
虽然应用层是HTTP协议，但网络层始终是TCP/IP协议。TCP/IP是面向连接的协议，在传输数据之前需先建立连接。
网络框架都会提供如下超时相关参数：
![](https://img-blog.csdnimg.cn/20201111193236911.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
- 连接超时参数ConnectTimeout
可自定义配置的建立连接最长等待时间
- 读取超时参数ReadTimeout
控制从Socket上读取数据的最长等待时间。

## 1.3 常见的写 bug 姿势
### 连接超时配置过长
比如60s。TCP三次握手正常建立连接所需时间很短，在ms级最多到s级，不可能需要十几、几十秒，多半是网络或防火墙配置问题。这时如果几秒还连不上，那么可能永远也连不上。所以设置特别长的连接超时无意义，1~5秒即可。
如果是纯内网调用，还可以设更短，在下游服务无法连接时，快速失败
### 无脑排查连接超时问题
服务一般会有多个节点，若别的客户端通过负载均衡连接服务端，那么客户端和服务端会直接建立连接，此时出现连接超时大概率是服务端问题
而若服务端通过Nginx反向代理来负载均衡，客户端连接的其实是Nginx，而非服务端，此时出现连接超时应排查Nginx


### 读取超时参数和读取超时“坑点”

#### 只要读取超时，服务端程序的正常执行就一定中断了？
##### 案例
client接口内部通过`HttpClient`调用服务端接口server，客户端读取超时2秒，服务端接口执行耗时5秒。
![](https://img-blog.csdnimg.cn/20201111204103629.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
调用client接口后，查看日志：
- 客户端2s后出现`SocketTimeoutException`，即读取超时![](https://img-blog.csdnimg.cn/2020111120432842.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
- 服务端却泰然地在3s后执行完成![](https://img-blog.csdnimg.cn/2020111120451912.png#pic_center)

Tomcat Web服务器是把服务端请求提交到线程池处理，只要服务端收到请求，网络层面的超时和断开便不会影响服务端的执行。因此，出现读取超时不能随意假设服务端的处理情况，需要根据业务状态考虑如何进行后续处理。

#### 读取超时只是Socket网络层面概念，是数据传输的最长耗时，故将其配置很短
比如100ms。

发生读取超时，网络层面无法区分如下原因：
- 服务端没有把数据返回给客户端
- 数据在网络上耗时较久或丢包

但TCP是连接建立完成后才传输数据，对于网络情况不是特差的服务调用，可认为：
- **连接超时**
网络问题或服务不在线
- **读取超时**
服务处理超时。读取超时意味着向Socket写入数据后，我们等到Socket返回数据的超时时间，其中包含的时间或者说绝大部分时间，是服务端处理业务逻辑的时间

#### 超时时间越长，任务接口成功率越高，便将读取超时参数配置过长
HTTP请求一般需要获得结果，属**同步调用**。
若超时时间很长，在等待 Server 返回数据同时，Client 线程（通常为 Tomcat 线程）也在等待，当下游服务出现大量超时，程序可能也会受到拖累创建大量线程，最终崩溃。
- 对**定时任务**或**异步任务**，读取超时配置较长问题不大
- 但面向用户响应的请求或是微服务平台的同步接口调用，并发量一般较大，应该设置一个较短的读取超时时间，以防止被下游服务拖慢，通常不会设置读取超时超过30s。

评论可能会有人问了，若把读取超时设为2s，而服务端接口需3s，不就永远拿不到执行结果？
的确，因此**设置读取超时要结合实际情况**：
- 过长可能会让下游抖动影响到自己
- 过短又可能影响成功率。甚至，有些时候我们还要根据下游服务的SLA，为不同的服务端接口设置不同的客户端读取超时。

## 1.4  最佳实践
连接超时代表建立TCP连接的时间，读取超时代表了等待远端返回数据的时间，也包括远端程序处理的时间。在解决连接超时问题时，我们要搞清楚连的是谁；在遇到读取超时问题的时候，我们要综合考虑下游服务的服务标准和自己的服务标准，设置合适的读取超时时间。此外，在使用诸如Spring Cloud Feign等框架时务必确认，连接和读取超时参数的配置是否正确生效。
# 2 Feign&&Ribbon
## 2.1 如何配置超时
为Feign配置超时参数的难点在于，Feign自身有两个超时参数，它使用的负载均衡组件Ribbon本身还有相关配置。这些配置的优先级是啥呢？

## 2.2 案例
- 测试服务端超时，假设服务端接口，只休眠10min
![](https://img-blog.csdnimg.cn/20201111211514444.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
- Feign调用该接口：
![](https://img-blog.csdnimg.cn/2020111121200699.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

- 通过Feign Client进行接口调用
![](https://img-blog.csdnimg.cn/20201111213831460.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

在配置文件仅指定服务端地址的情况下：

```bash
clientsdk.ribbon.listOfServers=localhost:45678
```

得到如下输出：

```bash
[21:46:24.222] [http-nio-45678-exec-4] [WARN ] [o.g.t.c.h.f.FeignAndRibbonController:26  ] - 
	执行耗时：222ms 错误：Connect to localhost:45679 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] 
		failed: Connection refused (Connection refused) executing 
			POST http://clientsdk/feignandribbon/server
```
Feign默认读取超时是1秒，如此短的读取超时算是“坑”。
- 分析源码
![](https://img-blog.csdnimg.cn/20201111215719405.png#pic_center)![](https://img-blog.csdnimg.cn/20201111215731406.png#pic_center)![](https://img-blog.csdnimg.cn/20201111215630631.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

## 自定义配置Feign客户端的两个全局超时时间
可以设置如下参数：
```bash
feign.client.config.default.readTimeout=3000
feign.client.config.default.connectTimeout=3000
```
修改配置后重试，得到如下日志：

```bash
[http-nio-45678-exec-3] [WARN ] [o.g.t.c.h.f.FeignAndRibbonController    :26  ] - 执行耗时：3006ms 错误：Read timed out executing POST http://clientsdk/feignandribbon/server
```
3秒读取超时生效。
注意：这里有一个大坑，如果希望只修改读取超时，可能会只配置这么一行：

```bash
feign.client.config.default.readTimeout=3000
```
测试会发现，这样配置无法生效。

## 要配置Feign读取超时，必须同时配置连接超时
查看`FeignClientFactoryBean`源码
- 只有同时设置`ConnectTimeout`、`ReadTimeout`，Request.Options才会被覆盖
![](https://img-blog.csdnimg.cn/20201111221444938.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

想针对单独的Feign Client设置超时时间，可以把default替换为Client的name：
```bash
feign.client.config.default.readTimeout=3000
feign.client.config.default.connectTimeout=3000
feign.client.config.clientsdk.readTimeout=2000
feign.client.config.clientsdk.connectTimeout=2000
```

## 单独的超时可覆盖全局超时
```bash
 [http-nio-45678-exec-3] [WARN ] [o.g.t.c.h.f.FeignAndRibbonController    :26  ] - 
 执行耗时：2006ms 错误：Read timed out executing 
 POST http://clientsdk/feignandribbon/server
```

## 除了可以配置Feign，也可配置Ribbon组件的参数以修改两个超时时间
参数首字母要大写，和Feign的配置不同。
```bash
ribbon.ReadTimeout=4000
ribbon.ConnectTimeout=4000
```

可以通过日志证明参数生效：

```bash
[http-nio-45678-exec-3] [WARN ] [o.g.t.c.h.f.FeignAndRibbonController    :26  ] - 
执行耗时：4003ms 错误：Read timed out executing 
POST http://clientsdk/feignandribbon/server
```

## 同时配置Feign和Ribbon的参数
谁会生效？
```bash
clientsdk.ribbon.listOfServers=localhost:45678
feign.client.config.default.readTimeout=3000
feign.client.config.default.connectTimeout=3000
ribbon.ReadTimeout=4000
ribbon.ConnectTimeout=4000
```
最终生效的是Feign的超时：

```bash
[http-nio-45678-exec-3] [WARN ] [o.g.t.c.h.f.FeignAndRibbonController    :26  ] - 
执行耗时：3006ms 错误：Read timed out executing 
POST http://clientsdk/feignandribbon/server
```

## 同时配置Feign和Ribbon的超时，以Feign为准
在`LoadBalancerFeignClient`源码
如果`Request.Options`不是默认值，就会创建一个`FeignOptionsClientConfig`代替原来Ribbon的`DefaultClientConfigImpl`，导致**Ribbon的配置被Feign覆盖**：
![](https://img-blog.csdnimg.cn/20201111222305978.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
但若这么配置，最终生效的还是Ribbon的超时（4秒），难点Ribbon又反覆盖了Feign？不，这还是因为坑点二，**单独配置Feign的读取超时无法生效**：
```bash
clientsdk.ribbon.listOfServers=localhost:45678
feign.client.config.default.readTimeout=3000
feign.client.config.clientsdk.readTimeout=2000
ribbon.ReadTimeout=4000
```