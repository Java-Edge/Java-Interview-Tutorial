# 1 导读
## 1.1 来源
REST这个词,是Roy Thomas Fielding在他2000年的博士论文中提出的。

他参与设计了HTTP协议，也是Apache Web Server项目（可惜现在已经是 Nginx 的天下）的co-founder。
论文地址：[Architectural Styles and the Design of Network-based Software Architectures](http://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm)
REST章节：[Fielding Dissertation: CHAPTER 5: Representational State Transfer (REST)](http://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)

## 1.2 名称
Fielding将他对互联网软件的架构原则,定名为REST ,即Representational State Transfer的缩写，资源在网络中以某种表现形式进行状态转移。

如果一个架构符合REST原则,就称它为RESTful架构。

Resource `Re`presentational `S`tate `T`ransfer，通过URI+动作来操作一个资源。
##  1.3 拆文解字
### Resource
资源，即数据（网络的核心）。将网络上的信息实体看作是资源，比如可以是：
- 文本
- 图片
- 服务
- 音频
...


#### 标识
资源用URI统一标识，URI只使用名词来指定资源，原则上不使用动词，因为它们是资源的标识。
最佳实践：
URL root:
```bash
[https://example.org/api/v1/](https://example.org/api/v1/)
[https://api.example.com/v1/](https://api.example.com/v1/)
```
API versioning:
可以放在URL里，也可以用HTTP的header：
```bash
/api/v1/
```

URI使用名词而非动词，推荐复数：
BAD
*   /getProducts
*   /listOrders
*   /retrieveClientByOrder?orderId=1

GOOD
*   GET /products
return the list of all products
*   POST /products
add a product to the collection
*   GET /products/4
retrieve product
*   PATCH/PUT /products/4
update product

###  Representational 表现层
Representational：某种表现形式，比如用JSON，XML，JPEG。

- 文本
txt、html、 xml、json、二进制
- 图片
jpg、png
- http协议的 content-type 和 accept

Case：
book是一个资源，获取不同的格式

### State Transfer
State Transfer：状态转化。通过HTTP动词实现，用以操作这些资源。

- 幂等性
每次HTTP请求相同的参数，相同的URI，产生的结果是相同的
- GET-获取资源
http://www.book.com/book/001
- POST-创建资源，不具有幂等性
http://www.book.com/book/
- PUT-创建(更新)资源
http://www.book.com/book/001
- DELETE-删除资源
http://www.book.com/book/001

REST描述的是在网络中client和server的一种交互形式。REST本身不实用，实用的是如何设计 RESTful API（REST风格的网络接口）。

Server提供的RESTful API中，URL中只使用名词来指定资源，原则上不使用动词。

“资源”是REST架构或者说整个网络处理的核心。比如：

```bash
[http://api/v1/newsfeed](http://api.qc.com/v1/newsfeed)
获取某人的新鲜事
[http://api/v1/friends](http://api.qc.com/v1/friends)
获取某人的好友列表
[http://api/v1/profile](http://api.qc.com/v1/profile)
获取某人的详细信息
```

用HTTP协议里的动词来实现资源的添加，修改，删除等操作，即通过HTTP动词实现资源的状态扭转：

```bash
DELETE [http://api.qc.com/v1/](http://api.qc.com/v1/friends)friends
删除某人的好友 （在http parameter指定好友id）
POST [http://api.qc.com/v1/](http://api.qc.com/v1/friends)friends
添加好友
UPDATE [http://api.qc.com/v1/profile](http://api.qc.com/v1/profile)
更新个人资料
```
禁止使用： 

```bash
GET [http://api.qc.com/v1/deleteFriend](http://api.qc.com/v1/deleteFriend) 
```

Server和Client之间传递某资源的一个表现形式，比如用JSON，XML传输文本，或者用JPG，WebP传输图片等。当然还可以压缩HTTP传输时的数据（on-wire data compression）。

用 HTTP Status Code传递Server的状态信息。比如最常用的 200 表示成功，500 表示Server内部错误等。

Web端不再用之前典型的JSP架构，而是改为前段渲染和附带处理简单的商务逻辑（比如AngularJS或者BackBone的一些样例）。Web端和Server只使用上述定义的API来传递数据和改变数据状态。格式一般是JSON。iOS和Android同理可得。由此可见，Web，iOS，Android和第三方开发者变为平等的角色通过一套API来共同消费Server提供的服务。

# 为什么要用RESTful架构
以前网页是前端后端融在一起的，比如JSP等。在桌面时代问题不大，但近年移动互联网的发展，各种类型的Client层出不穷，RESTful可以通过一套统一的接口为 Web，iOS和Android提供服务。另外对于广大平台来说，比如Facebook platform，微博开放平台，微信公共平台等，它们不需要有显式的前端，只需要一套提供服务的接口，于是RESTful更是它们最好的选择。

RESTful架构下：
![](https://img-blog.csdnimg.cn/img_convert/c92c2a8400cac46ca1693e0cdbaedb2e.png)
### Server API的RESTful设计原则
保证 HEAD 和 GET 方法是安全的，不会对资源状态有所改变（污染）。比如严格杜绝如下情况：

```bash
GET /deleteProduct?id=1
```

资源的地址推荐用嵌套结构。比如：

```bash
GET /friends/10375923/profile
UPDATE /profile/primaryAddress/city
```

警惕返回结果的大小。如果过大，及时进行分页（pagination）或者加入限制（limit）。HTTP协议支持分页（Pagination）操作，在Header中使用 Link 即可。

使用正确的HTTP Status Code表示访问状态：[HTTP/1.1: Status Code Definitions](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html)

在返回结果用明确易懂的文本（注意返回的错误是要给人看的，避免用 1001 这种错误信息），而且适当加入注释。

关于安全：
自己的接口就用https，加上一个key做一次hash放在最后即可。考虑到国情，HTTPS在无线网络里不稳定，可以使用应用层的加密手段把整个HTTP的payload加密。

RESTful 是无状态的。

> 参考
> - [Getting Started · Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
> - [授权机制说明](http://open.weibo.com/wiki/%E6%8E%88%E6%9D%83%E6%9C%BA%E5%88%B6%E8%AF%B4%E6%98%8E)
> https://www.zhihu.com/question/28557115/answer/48094438