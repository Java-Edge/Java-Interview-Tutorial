- 订单服务源码
https://github.com/Wasabi1234/SpringCloud_OrderDemo
- 商品服务源码
https://github.com/Wasabi1234/SpringCloud_ProductDemo

# 0 分布式下服务注册的地位和原理
## 0.1 分布式系统中为什么需要服务发现
![](https://img-blog.csdnimg.cn/20191018224236498.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTgzNTRhNTc4MDAxZjIzODYucG5n?x-oss-process=image/format,png)
A 类比青楼中的嫖客, B 类比青楼女子,注册中心呢就相当于青楼中的妈咪
一般 嫖客服务一来,就肯定直接点名春花还是秋月呀,直接问妈咪要花魁就行

## 0.2 服务发现的两种方式
◆ 客户端发现
- Eureka

◆ 服务端发现
- Nginx
- Zookeeper
- Kubernetes


我们这里使用Eureka

◆ 基于Netflix Eureka做了二次封装
◆ 两个组件组成:
- Eureka Server注册中心
- Eureka Client服务注册
# 1 注册中心 Eureka Server
![新建项目](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTVhNzE4MDQ1MjVjZWQ3YWEucG5n?x-oss-process=image/format,png)
使用`@EnableEurekaServer`
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LThmODcyZjk5YjRmNGVlNzgucG5n?x-oss-process=image/format,png)
就可以让应用变为Eureka服务器，这是因为spring boot封装了Eureka Server，让你可以嵌入到应用中直接使用

- 直接运行成功如下
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWI3MWE2OGIyYWI1ZmEyYzUucG5n?x-oss-process=image/format,png)
- 但是不断报异常,why?
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWZmZmYxY2MwNGYxZThkYWUucG5n?x-oss-process=image/format,png)
这是因为该应用虽然是 Server 端,但也同时是 Client 端,也需要一个注册中心将自己注册进去
为消除其异常,修改下配置

- 配置需要注册的地址,也就是往自己身上注册
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTU0NDRhODY5MDBjMjUyZWMucG5n?x-oss-process=image/format,png)
- 通过观察源码,知道其实是一个 map, 所以配置如下
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWE4YmVmODhiMzIxMmNiYWUucG5n?x-oss-process=image/format,png)
启动仍旧报错,其实正常问题,因为服务端自己又是 Server, 又是 Client, 服务端未启动完成时,客户端肯定是无法找到服务端的
但是 eureka 的服务端/客户端采用心跳通信方式
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTg0OTBmOGM2MWE4NDM3ZDUucG5n?x-oss-process=image/format,png)
可看到地址已随配置被改变

- 接下来配置实例名
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWIzYzg5N2RmMmUxYTgwOGQucG5n?x-oss-process=image/format,png)

![](https://img-blog.csdnimg.cn/20191018215344300.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 但是该应用本身就是个注册中心,不需要将其显示在注册实例中,通过以下配置
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTRkMDE2NThjMDY5MzgwNDEucG5n?x-oss-process=image/format,png)
- 为防止冲突,将端口号回改为默认
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTUyOWU3ODQ2ZDNlZWJlMTkucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWEzZjVlYzdiMTRhZDQ4MTgucG5n?x-oss-process=image/format,png)

# 2 服务中心
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQ3MzU3ODgxZTY3NTM3NzUucG5n?x-oss-process=image/format,png)

- 为避免每次手动启动,将应用打成 war 包(jar)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWNhM2NiYWQ2NmJjNTIxZmYucG5n?x-oss-process=image/format,png)![通过 java 命令启动](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWUxMjEyM2U5MTg1MjE0NGUucG5n?x-oss-process=image/format,png)![启动成功效果](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTQ1YTBhZDg3NjFhY2Y0N2YucG5n?x-oss-process=image/format,png)
![Mac 下 Ctrl+C 退出服务](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWY2ZGM5YjFiOTBjMWE5NDgucG5n?x-oss-process=image/format,png)
![后台执行](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTRkZGNjOGJkNzQ4YmY2YjUucG5n?x-oss-process=image/format,png)
![查看其相关进程信息](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTVjNGI0OTNmNzhjMGRkOTEucG5n?x-oss-process=image/format,png)

- 如此该应用就方便了我们,不需要每次都去手动启动应用,在后台会重启,若想杀死进程直接 kill
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE2YjFlNGIwZTQwYjAxOTkucG5n?x-oss-process=image/format,png)

# 3 Eureka Client的使用
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWVlOGFmNDkxZTVhMzEyYTUucG5n?x-oss-process=image/format,png)
- `@EnableDiscoveryClient`注解
这通过`META-INF/spring.factories`查找`DiscoveryClient`接口的实现
Discovery Client的实现将在`org.springframework.cloud.client.discovery.EnableDiscoveryClient`键下的`spring.factories`中添加一个配置类。
`DiscoveryClient`实现的示例是[Spring Cloud Netflix Eureka](http://cloud.spring.io/spring-cloud-netflix/)，[Spring Cloud Consul发现](http://cloud.spring.io/spring-cloud-consul/)和[Spring Cloud Zookeeper发现](http://cloud.spring.io/spring-cloud-zookeeper/)。

默认情况下，`DiscoveryClient`的实现将使用远程发现服务器自动注册本地Spring Boot服务器。可以通过在`@EnableDiscoveryClient`中设置`autoRegister=false`来禁用此功能。

- 启动Server, 再启动 Client
![发现并没有注册成功实例](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTlkYTQxNmNjZDYzM2M3OTkucG5n?x-oss-process=image/format,png)
- 因为没有配置注册目标地址信息
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE5N2Y1ZTE0MDFkNWE0ZWQucG5n?x-oss-process=image/format,png)
- 之后再次重启,依旧无法注册成功,几经勘察,添加以下依赖后,成功运行,注册到服务器
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWRhYjNlNzQxNjQ2ZDg3ZGEucG5n?x-oss-process=image/format,png)
- 再指定 client 名字
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTc3YjdlMDgzOTdhYWI2NWUucG5n?x-oss-process=image/format,png)
- 发现成功注册
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTQ0N2FlM2NlYTI0ODYxY2UucG5n?x-oss-process=image/format,png)
- 此为 client 应用ip 地址
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTM5M2E1ZmYxNDdiZmIxZjEucG5n?x-oss-process=image/format,png)
- 但其实可以自定义
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWFiOWYxZDBmODEyYzUzMTAucG5n?x-oss-process=image/format,png)
- 接着点击进入那个链接,URL如下
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTljYzFkMmE4ZTJlNTc3MmEucG5n?x-oss-process=image/format,png)
- Eureka保证分布式CAP理论中的AP
有时会发现如下红色警戒!
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTI3MzI2NWNkNmNlYTYyYzIucG5n?x-oss-process=image/format,png)
Eureka看明白了这一点，因此在设计时就`优先保证可用性`
我们可以容忍注册中心返回的是几分钟以前的注册信息，但不能接受服务直接宕机。也就是说，`服务注册功能对可用性的要求要高于一致性`!

如果Eureka服务节点在短时间里丢失了大量的心跳连接(可能发生了网络故障)，那么这个 Eureka节点会
- 进入“自我保护模式”
但该节点对于新的服务还能提供注册服务, 当网络故障恢复后，这个Eureka节点会退出“自我保护模式”
- 同时保留那些“心跳死亡”的服务注册信息不过期
对于“死亡”的仍然保留，以防还有客户端向其发起请求

#### `Eureka的哲学是，同时保留“好数据”与“坏数据”总比丢掉任何数据要更好`

- 在开发模式,最好关闭该模式(默认是开启的),注意仅能在开发环境关闭哦!
- 生产环境禁止关闭!!!
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWEwNGYyMTg2NTAxY2UxYTMucG5n?x-oss-process=image/format,png)
# 4 Eureka的高可用
如果一台 eureka 宕机了咋办呢,为了实现高可用, 如果直接加一台服务器并无任何卵用,

## 4.1 将两台 eureka 互相注册
![](https://img-blog.csdnimg.cn/20191018222856832.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 复制得到两份 eureka,并以端口区分
![](https://img-blog.csdnimg.cn/20191018223100946.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 将 eureka1注册到 eureka2上并启动
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTdlZmIxMWE2OWUxNTYwNzYucG5n?x-oss-process=image/format,png)
- 将 eureka2注册到 eureka1上并启动
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTdhYWExZmE2ODdiMjNhODQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWNiNDdiOTIwMWQ2MWMwYzAucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTBkYTJjZTg4N2NiNWFmMzkucG5n?x-oss-process=image/format,png)

发现 client 在1,2同时都注册成功了!
假如此时 eureka1宕机了,会发生什么呢?
![](https://img-blog.csdnimg.cn/2019101822331787.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 我们来将1给关闭
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTY0M2E4NGRlODNmMGQ2YjcucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTU5MmU0MWNiNDI4NzFmOWUucG5n?x-oss-process=image/format,png)
- 发现2依旧存活,并且 client 还在连接![](https://img-blog.csdnimg.cn/20191018223436753.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 若此时再 client 端重启又会发生什么呢?
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191018223534480.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 因为无法注册,自然报错了, E2上也没有 client 端再连接了
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWU5NDRmMzYzYjljNGZiYzcucG5n?x-oss-process=image/format,png)
- 那么问题来了,怎么才能保证 E1宕机后, client 仍能注册在 E2上呢? 只要保持每次都同时往两个 E 注册
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTg2NDJiNzJmMzIxMzlmNjAucG5n?x-oss-process=image/format,png)
## 同理可得,当有3个 E 时,如此相互注册
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTBkZWQ0NTNmZTE3MTBjMWUucG5n?x-oss-process=image/format,png)
![](https://img-blog.csdnimg.cn/20191018223757518.png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWExM2FiYjg2ZTEyNmVmYjgucG5n?x-oss-process=image/format,png)
- 新建 E3
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWFkMzdhNjg1M2RmOTMzMGQucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTM0M2ZiZTJhYzY0MTc4OTIucG5n?x-oss-process=image/format,png)
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTkyZjJlMTZkNDdmYzgxNTQucG5n?x-oss-process=image/format,png)
对于我们的本地开发环境,部署一个 E 即可,不再集群
# 5 Eureka总结
◆ @EnableEurekaServer @EnableEurekaClient
◆ 心跳检测、健康检查、负载均衡等功能
◆ Eureka的高可用,生产上建议至少两台以上
◆ `分布式系统中 ,服务注册中心是最重要的基础部分`

- 结构图
![](https://img-blog.csdnimg.cn/201910182146089.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

参考

- [互联网Java进阶面试训练营](https://github.com/shishan100/Java-Interview-Advanced)
