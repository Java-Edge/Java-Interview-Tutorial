本章首先让大家学习到Spring Security权限框架的架构，之后大家可以学习到Spring Security权限框架的核心概念，包括拦截器、数据库管理、缓存、自定义决策等等，之后会手把手带大家基于Spring Boot+Spring Security搭建一套演练环境，并带着大家在Spring Security权限框架常见的应用场景下对框架常用的API功能进行编码...
# 1 Spring Security权限管理框架介绍
![](https://upload-images.jianshu.io/upload_images/4685968-1fade9926243b887.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.1 常见认证模式
### 1.1.1 Basic 模式
HTTP协议规范中有两种认证方式，一种是Basic认证，另外一种是Digest 认证，这两种方式都属于无状态认证方式
- 所谓无状态即服务端都不会在会话中记录相关信息，客户端每次访问都需要将用户名和密码放置报文一同发送给服务端，但这并不表示你在浏览器中每次访问都要自己输入用户名和密码，可能是你第一次输入账号后浏览器就保留在内存中供后面的交互使用


既然是HTTP协议规范，那其实就是约束浏览器厂商与web容器厂商实现各自软件时的行为约束，例如典型的一个认证交互过程是：浏览器向 web容器发送http请求报文，web容器接收到 http请求报文后解析需要访问的资源，如果该资源刚好是受保护资源，web容器则向浏览器发送认证http 响应报文，浏览器接收到报文后弹出窗口让用户输入账号及密码，接着再次发送包含了账号信息的http请求报文，web容器对账号信息进行鉴权，通过验证则返回对应资源，否则重新认证。

Basic Access Authentication scheme是在HTTP1.0提出的认证方法，它是一种基于challenge/response的认证模式，针对特定的 realm需要提供用户名和密码认证后才可访问，其中密码使用明文传输

Basic模式认证过程如下
①浏览器发送http报文请求一个受保护的资源
②服务端的web容器将http响应报文的响应码设为401 ，响应头部加入WWW-Authenticate: Basic realm=”myTomcat”。
③浏览器弹出对话框让用户输入用户名和密码，并用Base64进行编码，实际是用户名+冒号+ 密码进行Base64编码，即Base64(username:password)，这次浏览器就会在 HTTP报文头部加入Authorization: Basic bXl0b21jYXQ=
④服务端web容器获取HTTP报文头部相关认证信息，匹配此用户名与密码是否正确，是否有相应资源的权限，如果认证成功则返回相关资源，否则再执行②，重新进行认证。
⑤以后每次访问都要带上认证头部。

服务端返回的认证报文中包含了realm=”myTomcat”，realm的值用于定义保护的区域，在服务端可以通过realm 将不同的资源分成不同的域，域的名称即为realm的值，每个域可能会有自己的权限鉴别方案。

Basic认证模式有两个明显的缺点
①无状态导致每次通信都要带上认证信息，即使是已经认证过的资源
②传输安全性不足，认证信息用Base64编码，基本就是明文传输，很容易对报文截取并盗用认证信息
### 1.1.2 Digest
 HTTP协议规范的另一种认证模式Digest模式，在HTTP1.1 时被提出来，主要为解决Basic模式安全问题，用于替代原来的Basic认证模式， Digest认证也是采用challenge/response认证模式，基本的认证流程比较类似，整个过程如下
①浏览器发送http报文请求一个受保护的资源
②服务端的web容器将http响应报文的响应码设为401 ，响应头部比Basic模式复杂
```
WWW-Authenticate: Digest realm=”myTomcat”,qop="auth",nonce="xxxxxxxxxxx",opaque="xxxxxxxx"  
```
其中qop的auth表示鉴别方式；nonce 是随机字符串；opaque服务端指定的值，客户端需要原值返回
③浏览器弹出对话框让用户输入用户名和密码，浏览器对用户名、密码、nonce值、HTTP请求方法、被请求资源 URI等组合后进行MD5运算，把计算得到的摘要信息发送给服务端。请求头部类似如下
```
Authorization: Digest username="x xxxx",realm="myTomcat",qop="auth",nonce="xxxx x",uri="xxxx",cnonce="xxxxxx",nc=00000001,response="x xxxxxxxx",opaque="xxxxxxxxx"
```
其中username 是用户名；cnonce是客户端生成的随机字符串；nc是运行认证的次数； response就是最终计算得到的摘要。
④服务端web容器获取HTTP报文头部相关认证信息，从中获取到username ，根据username获取对应的密码，同样对用户名、密码、nonce值、 HTTP请求方法、被请求资源URI等组合进行MD5运算，计算结果和 response进行比较，如果匹配则认证成功并返回相关资源，否则再执行②，重新进行认证
⑤以后每次访问都要带上认证头部

其实通过哈希算法对通信双方身份的认证十分常见，它的好处就是不必把具备密码的信息对外传输，只需将这些密码信息加入一个对方给定的随机值计算哈希值，最后将哈希值传给对方，对方就可以认证你的身份
Digest思想同样采如此，用了一种 nonce随机数字符串，双方约好对哪些信息进行哈希运算即可完成双方身份的验证
Digest模式避免了密码在网络上明文传输，提高了安全性
但它仍然存在缺点，例如认证报文被攻击者拦截到,攻击者可以获取到资源
### 1.1.3 X.509证书
https://www.jianshu.com/p/e31de93aec32
### 1.1.4 LDAP 认证
https://www.jianshu.com/p/d3f8c8f5d661
### 1.1.5 Form模式
另外一种模式提供更加灵活的认证，也就是基于Form 的认证模式，各种语言体系的web容器都可以实现各自的Form模式，这里只介绍 Java体系的Form认证模式：
①浏览器发送http报文请求一个受保护的资源
②服务端的web容器判断此uri为受保护资源，于是将请求重定向到自定义的登陆页面上，例如 login.html页面，可以自定义登陆页面的样式，但要遵守的约定是表单的action必须以`j_security_check`结尾，即`<form action='xxxxxx/j_security_check' method='POST'>`
用户名和密码输入框元素的name必须为'j_username' 和'j_password'。
③浏览器展示自定义的登录页面让用户输入用户名和密码，然后提交表单
④服务端web容器获取表单的用户名和密码，匹配此用户名与密码是否正确，是否有相应资源的权限，如果认证成功则返回相关资源，否则再执行②，重新进行认证
⑤后面在同个会话期间的访问都不用再进行认证，因为认证的结果已经保存在服务端的session里面。     

Form模式跳出了HTTP规范提供了自定义的更加灵活的认证模式，由于每种语言都可以自己定义实现自己的Form 模式，所以它没有一个通用的标准，而且它也存在密码明文传输安全问题
