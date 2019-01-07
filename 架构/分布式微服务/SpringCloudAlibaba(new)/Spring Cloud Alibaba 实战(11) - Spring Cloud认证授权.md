> 本文主要内容:
> - 如何实现用户认证与授权？
> - 实现的三种方案,全部是通过画图的方式讲解.以及三种方案的对比
> - 最后根据方案改造Gateway和扩展Feign

# 0 [相关源码](https://github.com/Wasabi1234/Spring-Cloud-Alibaba-in-Acrion-GateWay)

# 1 有状态 vs 无状态
## 1.1 有状态
![](https://img-blog.csdnimg.cn/20191213010821405.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

也可使用粘性会话，即:对相同IP的请求，NGINX总 会转发到相同的Tomcat实例，这样就就无需图中的Session Store了。不过这种方式有很多缺点:比如用户断网重连，刷新页面，由于IP变了，NGINX会转发到其他Tomcat实例，而其他实例没有Session，于是就认为用户未登录。这让用户莫名其妙。
> 粘性会话不是本章重点，如果感兴趣可以百度一下(用得越来越少了)

## 1.2 无状态
![](https://img-blog.csdnimg.cn/2019121301151674.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
这里讲的是解密Token直接拿到用户信息;事实上要看项目的具体实现;有时候Token里不一定带有用户信息;而是利用Token某个地方查询，才能获得用户信息。

## 1.3 对比小结
![](https://img-blog.csdnimg.cn/20191213011730593.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

# 2 微服务认证方案

## 2.1 “处处安全”
### 推荐阅读
◆ [OAuth2实现单点登录SSO](https://www.cnblogs.com/cjsblog/p/10548022.html)

◆ [OAuth 2.0系列文章](http://ifeve.com/oauth2-tutorial-all/)
### 代表实现
- Spring Cloud Security : https://cloud. spring.io/spring-cloud-security/reference/html/
- Jboss Keycloak : https://www.keycloak.org

### 示例代码
- [Spring Cloud Security认证授权示例代码](https://github.com/chengjiansheng/cjs-oauth2-sso-demo.git)
- [Keycloak认证授权示例代码](https://www.github.com/eacdy/spring-cloud-yes.git)(基于Servlet实现,无法和SpringCloudGateway整合)

### 优劣分析
安全性好
但是实现成本高,而且多次token交换和认证,所以有性能开销
## 2.2  外部无状态，内部有状态
![](https://img-blog.csdnimg.cn/20191214003549661.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 架构过于复杂,微服务和传统架构混合双搭 ![](https://img-blog.csdnimg.cn/20191215000659660.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)

## 2.3  网关认证授权，内部裸奔
![](https://img-blog.csdnimg.cn/2019121500361097.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
登录成功后,网关颁发token,之后用户的每个请求都会携带该token,网关对其解密是否合法,过期等,token中会携带用户信息,所以网关还可解析token即可知道用户是谁,比如解析出了id和name,就会将其加入请求的header中进行转发,每个服务就知道是啥子用户啦!

## 优劣
优点是实现简单,性能佳,但是一旦网关的登录认证被攻破,就凉了
## 2.4  “内部裸奔”改进方案
![](https://img-blog.csdnimg.cn/20191215004048655.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
请求经过网关到认证授权中心去登录,成功则颁发token,之后用户请求都会携带该token,但是网关不对token做操作
这样降低了网关的设计复杂度,网关不再关注用户是谁了(不再解密解析token),只负责转发
让系统也避免了裸奔的尴尬
但是要想解密token,还是需要密钥,现在每个微服务都要去做解密工作,意味着每个服务都知道密钥了.被泄露的风险随之增大,需要防止这种情况,可以定期更新密钥,想办法不让开发直接看到密钥本身(但是一般吧,除非有内部脑残人士才会泄露密钥,一般还是很安全的)
### 优劣分析
实现并不复杂,降低了网关的复杂度,但是密钥如果泄露了,就完了,这个可以借助后面的方法避免,先留坑

## 2.5 方案对比与选择
![](https://img-blog.csdnimg.cn/2019121501225481.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 3 访问控制模型(授权)
- Access Control List (ACL)
- Role-based access control (RBAC 最流行)
![](https://img-blog.csdnimg.cn/20191215012556502.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- Attribute- based access control (ABAC)
- Rule-based access control
- Time-based access control

我们使用的token其实就是JWT,what's that?

# 4 JWT
## 4.1 定义
JWT全称Json web token ,是一个开放标准(RFC 7519) ,用来在各方之间安全地传输信息。JWT可被验证和信任,因为它是数字签名的。
![](https://img-blog.csdnimg.cn/20191215015618650.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
## 4.2 组成
![](https://img-blog.csdnimg.cn/20191215015733815.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
## 4.3 公式
### token算法
- Token = Base64(Header).Base64(Payload).Base64(Signature)
示例: aaaa.bbbbb.ccccc

### 签名算法
◆ Signature = Header指定的签名算法
(Base64(header).Base64(payload), 秘钥)
● 秘钥: HS256("aaaa.bbbbb",秘钥)
- 推荐阅读
[JWT操作工具类分享](https://www.imooc.com/article/290892)

- 为用户中心引入JWT
![](https://img-blog.csdnimg.cn/20191215020531741.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 引入工具类后生成的JWT,并新建JWT操作类,并简单测试生成JWT
![](https://img-blog.csdnimg.cn/20191215021059630.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 写配置
![](https://img-blog.csdnimg.cn/2019121502232440.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 同样的方式为内容中心添加JWT配置,不再赘述,注意secret都保持一致


# 5 实现认证授权
##  实现小程序登录
- 小程序登录流程,我们java代码需要做的就是实现图中的4,5,6步骤
![](https://img-blog.csdnimg.cn/20191215022640870.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 用户点击登录按钮后,弹出如下,点击允许,即表示同意获取个人信息![](https://img-blog.csdnimg.cn/2019121502274559.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- login
![](https://img-blog.csdnimg.cn/20191215024020805.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 在用户中心新建 dto类
![](https://img-blog.csdnimg.cn/20191215024542179.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191215024730988.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191215162634318.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191215164401518.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 小程序API工具包
◆WxJava : https://github.com/Wechat-Group/WxJava
- 在用户中心添加依赖
![](https://img-blog.csdnimg.cn/20191215175351336.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191215175500411.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
服务实现
![](https://img-blog.csdnimg.cn/20191215180959460.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 6 AOP实现登录状态检查
## 实现方式
- Servlet过滤器
- filter拦截器
- Spring AOP

我们当然使用优雅地AOP切面编程这种可插拔的方式

## 6.1 用户中心
- 引入依赖
![](https://img-blog.csdnimg.cn/20191215182349944.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 定义注解
![](https://img-blog.csdnimg.cn/20191215182444836.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
具体代码看github
## 6.2  内容中心
与用户中心类似,不再赘述
使用feign时并没有传递token,所以当做未认证处理
### 6.2.1  Feign实现Token传递
#### 实现方式 @RequestHeader
- 修改控制器,之后将编译报错的代码都注释掉
![](https://img-blog.csdnimg.cn/20191215191055981.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
需要修改控制器,这不好,弃用
#### 实现方式 RequestInterceptor
![](https://img-blog.csdnimg.cn/20191215191644939.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
#### 实现方式 RestTemplate实现Token传递
exchange()
ClientHttpRequestInterceptor
![](https://img-blog.csdnimg.cn/20191215191920647.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 7  AOP实现用户权限验证 - 授权
- 需求:用户role须是管理员才有权访问
![](https://img-blog.csdnimg.cn/20191215192426991.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
## 7.1 实现方案 - 土方法
- 通过注入的属性值判断,对于API多的就不合时宜了!![](https://img-blog.csdnimg.cn/20191215192543532.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
> 当然你用过滤器,拦截器实现也是可以的.
## 7.2 优雅地用AOP实现
- 定义注解
![](https://img-blog.csdnimg.cn/20191215192815799.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 控制器方法上添加注解
![](https://img-blog.csdnimg.cn/20191215192925993.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191215193107628.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191215204107586.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
- 修改网关配置
![](https://img-blog.csdnimg.cn/20191215211643746.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9qYXZhZWRnZS5ibG9nLmNzZG4ubmV0,size_1,color_FFFFFF,t_70)
# 总结
◆ 登录认证的四种方案
◆ AOP实现认证授权
◆ N种访问控制模型
◆ Feign传递Token
◆ JWT
◆ RestTemplate传递Token