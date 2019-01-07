# Ribbon自动重试请求
一些HTTP客户端往往会内置一些重试策略，其初衷是好的，毕竟因为网络问题导致丢包虽然频繁但持续时间短，往往重试就能成功，
但要留心这是否符合我们期望。

## 案例
短信重复发送的问题，但短信服务的调用方用户服务，反复确认代码里没有重试逻辑。
那问题究竟出在哪里？

- Get请求的发送短信接口，休眠2s以模拟耗时：
![](https://img-blog.csdnimg.cn/20201111225415763.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

配置一个Feign供客户端调用：
![](https://img-blog.csdnimg.cn/20201111225647955.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

Feign内部有一个Ribbon组件负责客户端负载均衡，通过配置文件设置其调用的服务端为两个节点：

```bash
SmsClient.ribbon.listOfServers=localhost:45679,localhost:45678
```

- 客户端接口，通过Feign调用服务端
![](https://img-blog.csdnimg.cn/20201111230748895.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
在45678和45679两个端口上分别启动服务端，然后访问45678的客户端接口进行测试。因为客户端和服务端控制器在一个应用中，所以45678同时扮演了客户端和服务端的角色。

在45678日志中可以看到，29秒时客户端收到请求开始调用服务端接口发短信，同时服务端收到了请求，2秒后（注意对比第一条日志和第三条日志）客户端输出了读取超时的错误信息：

```bash
[http-nio-45678-exec-4] [INFO ] [c.d.RibbonRetryIssueClientController:23  ] - client is called
[http-nio-45678-exec-5] [INFO ] [c.d.RibbonRetryIssueServerController:16  ] - http://localhost:45678/ribbonretryissueserver/sms is called, 13600000000=>a2aa1b32-a044-40e9-8950-7f0189582418
[http-nio-45678-exec-4] [ERROR] [c.d.RibbonRetryIssueClientController:27  ] - send sms failed : Read timed out executing GET http://SmsClient/ribbonretryissueserver/sms?mobile=13600000000&message=a2aa1b32-a044-40e9-8950-7f0189582418
```
而在另一个服务端45679的日志中还可以看到一条请求，客户端接口调用后的1秒：
```bash
[http-nio-45679-exec-2] [INFO ] [c.d.RibbonRetryIssueServerController:16  ] - http://localhost:45679/ribbonretryissueserver/sms is called, 13600000000=>a2aa1b32-a044-40e9-8950-7f0189582418
```
客户端接口被调用的日志只输出了一次，而服务端的日志输出了两次。虽然Feign的默认读取超时时间是1秒，但客户端2秒后才出现超时错误。
说明**客户端自作主张进行了一次重试**，导致短信重复发送。
## 源码揭秘
查看Ribbon源码，MaxAutoRetriesNextServer参数默认为1，也就是Get请求在某个服务端节点出现问题（比如读取超时）时，Ribbon会自动重试一次：
![](https://img-blog.csdnimg.cn/20201111232018867.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

![](https://img-blog.csdnimg.cn/20201111232254555.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

### 解决方案
1. 把发短信接口从Get改为Post
API设计规范：有状态的API接口不应定义为Get。根据HTTP协议规范，Get请求适用于数据查询，Post才是把数据提交到服务端用于修改或新增。选择Get还是Post的依据，应该是API行为，而非参数大小。
> 常见误区：Get请求的参数包含在Url QueryString中，会受浏览器长度限制，所以一些开发会选择使用JSON以Post提交大参数，使用Get提交小参数。

2. 将`MaxAutoRetriesNextServer`参数配为0，禁用服务调用失败后在下一个服务端节点的自动重试。在配置文件中添加一行即可：

```bash
ribbon.MaxAutoRetriesNextServer=0
```
### 问责
至此，问题出在用户服务还是短信服务？
也许双方都有问题吧。
- Get请求应该是无状态或者幂等的，短信接口可以设计为支持幂等调用
- 用户服务的开发同学，如果对Ribbon的重试机制有所了解的话，或许就能在排查问题上少走弯路

## 最佳实践
对于重试，因为HTTP协议认为Get请求是数据查询操作，是无状态的，又考虑到网络出现丢包是比较常见的事情，有些HTTP客户端或代理服务器会自动重试Get/Head请求。如果你的接口设计不支持幂等，需要关闭自动重试。但，更好的解决方案是，遵从HTTP协议的建议来使用合适的HTTP方法。

# 并发限制爬虫抓取
HTTP请求调用还有一个常见的问题：并发数的限制，导致程序处理性能无法提升。
## 案例
某爬虫项目，整体爬取数据效率很低，增加线程池数量也无谓，只能堆机器。
现在模拟该场景，探究问题本质。

假设要爬取的服务端是这样的一个简单实现，休眠1s返回数字1：
![](https://img-blog.csdnimg.cn/20201111233015454.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

爬虫需多次调用该接口抓取数据，为确保线程池不是并发瓶颈，使用了一个无线程上限的`newCachedThreadPool`，然后使用`HttpClient`执行HTTP请求，把请求任务循环提交到线程池处理，最后等待所有任务执行完成后输出执行耗时：
![](https://img-blog.csdnimg.cn/20201111233347439.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

- 使用默认的`PoolingHttpClientConnectionManager`构造的`CloseableHttpClient`，测试一下爬取10次的耗时：
![](https://img-blog.csdnimg.cn/20201111233512569.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
虽然一个请求需要1s执行完成，但线程池可扩张使用任意数量线程。
按道理，10个请求并发处理的时间基本相当于1个请求的处理时间，即1s，但日志中显示实际耗时5秒：
![](https://img-blog.csdnimg.cn/20201111233832252.png#pic_center)

## 源码解析
`PoolingHttpClientConnectionManager`源码有两个重要参数：
![](https://img-blog.csdnimg.cn/20201111234051864.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
- defaultMaxPerRoute=2，即同一主机/域名的最大并发请求数为2。我们的爬虫需要10个并发，显然是**默认值太小限制了爬虫的效率**。
- maxTotal=20，即所有主机整体最大并发为20，这也是HttpClient整体的并发度。**我们请求数是10最大并发是10，20不会成为瓶颈**。举一个例子，使用同一个HttpClient访问10个域名，defaultMaxPerRoute设置为10，为确保每一个域名都能达到10并发，需要把maxTotal设置为100。

`HttpClient`是常用的HTTP客户端，那为什么默认值限制得这么小？
很多早期的浏览器也限制了同一个域名两个并发请求。对于同一个域名并发连接的限制，其实是HTTP 1.1协议要求的，这里有这么一段话：

> Clients that use persistent connections SHOULD limit the number of simultaneous connections that they maintain to a given server. A single-user client SHOULD NOT maintain more than 2 connections with any server or proxy. A proxy SHOULD use up to 2*N connections to another server or proxy, where N is the number of simultaneously active users. These guidelines are intended to improve HTTP response times and avoid congestion.
HTTP 1.1协议是20年前制定的，现在HTTP服务器的能力强很多了，所以有些新的浏览器没有完全遵从2并发这个限制，放开并发数到了8甚至更大。
如果需要通过HTTP客户端发起大量并发请求，不管使用什么客户端，请务必确认客户端的实现默认的并发度是否满足需求。

尝试声明一个新的HttpClient放开相关限制，设置maxPerRoute为50、maxTotal为100，然后修改一下刚才的wrong方法，使用新的客户端进行测试：
![](https://img-blog.csdnimg.cn/20201111234405368.png#pic_center)
输出如下，10次请求在1秒左右执行完成。可以看到，因为放开了一个Host 2个并发的默认限制，爬虫效率得到了大幅提升：
![](https://img-blog.csdnimg.cn/20201111234518322.png#pic_center)
## 最佳实践
若你的客户端有比较大的请求调用并发，比如做爬虫，或是扮演类似代理的角色，又或者是程序本身并发较高，如此小的默认值很容易成为吞吐量的瓶颈，需要及时调整。