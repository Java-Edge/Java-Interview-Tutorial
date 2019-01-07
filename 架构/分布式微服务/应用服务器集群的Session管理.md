应用服务器的高可用设计主要基于服务无状态这一特性，但事实上，业务总
是有状态：
- 在电商网站，需要有购物车记录用户的购买信息，用户每次购买请求都是向购物车中增加商品
- 在社交类网站，需要记录用户的当前登录状态、最新发布的消息及好友状态等，用户每次刷新页面都需要更新这些信息

Web 应用中将这些多次请求修改使用的上下文对象称作会话(Session)。单机情况下，Session 可由部署在服务器上的Web 容器( 如Tomcat) 管理。
在使用负载均衡的集群环境中，由于负载均衡服务器可能会将请求分发到集群中的任何一台应用服务器上，所以保证每次请求依然能够获得正确的Session比单机时要复杂很多。

集群环境下,Session 管理主要有以下几种手段：
# 1 Session 复制
早期系统使用的一种服务器集群Session管理机制。应用服务器开启Web 容器的Session复制功能，在集群中的几台服务器之间同步Session对象，使得每台服务器上都保存所有用户的Session信息,这样任何一台机器宕机都不会导致 Session 数据丢失，而服务器使用Session时，也只需在本机获取。
![使用Session复制实现应用服务器共享Session](https://img-blog.csdnimg.cn/img_convert/411c16da5c3fc96abbaddec730873749.png)
## 1.1 优点
虽然简单,从本机读取Session信息也很快速,但只能使用在集群规模比较小的情况下
## 1.2 缺点
- 当集群规模较大时,集群服务器间需要大量的通信进行Session复制,占用服务器和网络的大量资源,系统不堪负担
- 而且由于所有用户的Session信息在每台服务器上都有备份,在大量用户访问的情况下,甚至会出现服务器内存不够Session使用的情况
- 而大型网站的核心应用集群就是数千台服务器,同时在线用户可达千万,因此并不适用这种方案

# 2 Session绑定(黏滞sticky)
可利用负载均衡的源地址Hash算法实现。

负载均衡服务器（比如 nginx）总是将来源于同一IP的请求分发到同一台服务器上(也可以根据Cookie信息将同一个户的请求总是分发到同一台服务器上，当然这时负载均衡服务器必须工作在HTTP 协议层)。这样在整个会话期间，用户所有的请求都在同一台服务器上处理，即Session绑定在某台特定服务器上，保证Session总能在这台服务器上获取
- 利用负载均衡的会话黏滞机制将请求绑定到特定服务器
![](https://img-blog.csdnimg.cn/img_convert/90aeb7bbe9c097fc64202a41b5c56fc4.png)

![](https://img-blog.csdnimg.cn/20210111171014990.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

但是Session绑定的方案显然不符合我们对系统高可用的需求。
## 缺点
一旦某台服务器宕机,那么该机器上的Session也就不复存在了,用户请求切换到其他机器后因为没有Session而无法完成业务处理

因此虽然大部分负载均衡服务器都提供源地址负载均衡算法,但很少有网站利用这个算法进行Session管理。

# 3 利用Cookie 记录Session
早期系统使用C/S架构,一种管理Session的方式是将Session记录在客户端,每次请求服务器的时候,将Session放在请求中发送给服务器,服务器处理完请求后再将修改过的Session响应给客户端
如今的B/S架构,网站没有客户端,但是可以利用刘览器支持的Cookie记录Session
![利用Cookie 记录Session信息](https://img-blog.csdnimg.cn/img_convert/616947f67d8d6ade6fd1036ca3bd44f7.png)
## 3.1 缺点
- 受Cookie大小限制,能记录的信息有限
- 每次请求响应都需要传输Cookie,影响性能
- 如果用户关闭Cookie,访问就会不正常

但是
## 3.2 优点
由于Cookie的
- 简单易用
- 可用性高
- 支持应用服务器的线性伸缩
- 而大部分应用需要记录的Session 信息又比较小

因此事实上，许多网站都或多或少地使用Cookie记录Session。
# 4 Session服务器
那么有没有可用性高、伸缩性好、性能也不错，对信息大小又没有限制的服务器集群Session管理方案呢?

答案就是Session服务器!利用独立部署的Session服务器(集群)统一管理Session,应用服务器每次读写Session时,都访问Session服务器
![利用Session服务器共享Session](https://img-blog.csdnimg.cn/img_convert/fef53864d08dd19b42c0074d01ad31fc.png)
这种方案事实上是将应服务器的状态分离,分为
- 无状态的应用服务器
- 有状态的Session服务器

然后针对这两种服务器的不同特性分别设计其架构

对于有状态的Session服务器,一种比较简单的方法是利用
- 分布式缓存
即使用cacheDB存取session信息，应用服务器接受新请求将session信息保存在redis中，当应用服务器发生故障时，web服务器会遍历寻找可用节点，分发请求，当应用服务器发现session不在本机内存时，则去redis中查找，如果找到则复制到本机，这样实现session共享和高可用。
![](https://img-blog.csdnimg.cn/20210111171119796.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 数据库等

在这些产品的基础上进行包装,使其符合Session 的存储和访问要求。如果业务场景对Session 管理有比较高的要求，比如利用Session 服务集成单点登录(SSO)、用户服务等功能，则需要开发专门的Session服务管理平台。
