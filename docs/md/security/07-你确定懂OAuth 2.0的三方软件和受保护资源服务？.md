# 07-你确定懂OAuth 2.0的三方软件和受保护资源服务？

## 0 前言

本文旨在阐明 OAuth2.0 体系中第三方软件和受保护资源服务的职责。

## 1 构建第三方软件应用

若基于公众号开放平台构建一个xx文章排版软件的轻应用，需要先到公众号开放平台申请注册成为开发者，再创建个应用就可以开始开发了。

### 1.1 开发过程的关键节点

#### 1.1.1 注册信息

xx软件须先有身份，才能参与 OAuth 2.0 流程。即xx需要拥有 `app_id` 、 `app_serect`、自己的回调地址 `redirect_uri`、申请权限等信息。这称为**静态注册**，即xx开发人员提前登录到公众号开放平台手动注册，以便后续使用这些注册的相关信息来请求访问令牌。

#### 1.1.2 引导授权

当用户要用三方软件操作在受保护资源上的数据，就需要三方软件引导授权。我要用xx来对我公众号里的文章排版时，我首先访问的一定是xx软件，而不是授权服务&受保护资源服务。

但xx又需要我的授权，只有授权服务才能允许我的操作。所以xx需要将我引导至授权服务

```java
String oauthUrl = "http://localhost:8081/Oauth?reqType=oauth";
response.sendRedirect(toOauthUrl);
```

让用户我来为三方软件授权，得到授权后，三方软件才可代表用户去访问数据。即xx获得授权后，就能代表我去排版文章。

#### 1.1.3 使用访问令牌（accessToken）

**第三方软件的最终目的：拿到令牌后去使用令牌**。目前OAuth 2.0 令牌只支bearer类型令牌，即任意字符串格式的令牌。

官方规范给出的使用accessToken请求的方式，有如下：

##### ① Form-Encoded Body Parameter（表单参数）



![](https://img-blog.csdnimg.cn/20201020221534153.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

##### ② URI Query Parameter（URI 查询参数）



![](https://img-blog.csdnimg.cn/20201020221551723.png#pic_center)

##### ③ Authorization Request Header Field（授权请求头部字段）



![](https://img-blog.csdnimg.cn/20201020221605988.png#pic_center)

##### 选型

- OAuth 2.0 官方建议，系统在接入 OAuth 2.0 前信息传递的请求载体是 JSON，若继续采用表单参数提交，令牌就无法加入
- 若采用参数传递，URI 会被整体复制，安全性最差
- 请求头部字段无上述顾虑，因此被官方推荐

但我推荐采用表单提交 POST 方式提交令牌，类似代码如下。毕竟官方建议指在接入 OAuth 2.0 前，若你已采用 JSON 请求体条件下，才不建议使用表单提交。倘若一开始三方软件和平台都一致采用表单提交，就没问题了。因为**表单提交在保证安全传输同时，无需处理 Authorization 头部信息。**

```java
String protectedURl="http://localhost:8081/ProtectedServlet";
Map<String, String> paramsMap = new HashMap<String, String();
paramsMap.put("app_id","APPID_XX);
paramsMap.put("app_secret","APPSECRET_XX");
paramsMap.put("token",accessToken);

String result = HttpURLClient.doPost(protectedURl,HttpURLClient.mapToStr(paramsMap));
```

#### 1.1.4 使用刷新令牌

Q：若访问令牌过期了，xx总不能立马提示让我这客户重新授权吧！？

A：就需要刷新令牌。需注意何时决定使用刷新令牌。

xx排版软件收到accessToken同时，也会收到accessToken的过期时间 `expires_in`。优秀的三方软件应将 `expires_in` 值保存并定时检测；若发现 `expires_in` 即将过期，则需利用 `refresh_token` 重新请求授权服务，获取新的有效accessToken。

除定时检测提前发现访问令牌是否快过期，还有“现场”发现。如xx访问我的公众号文章时，突然收到accessToken已失效响应，此时xx立即使用 `refresh_token` 请求一个访问令牌，以便继续代表我使用我的这些文章数据。

综上：

- 定时检测方案，需开发定时任务
- “现场”发现，就没这额外工作咯

还是推荐定时检测，因带来“提前量”，以便更好掌握主动权。

刷新令牌是一次性的，使用后就失效，但其有效期会比accessToken长。

**若刷新令牌也过期呢？**需将刷新令牌和accessToken都放弃，几乎回到系统初始状态，只能让用户重授权。

### 1.2  服务市场

啥是服务市场？

![](https://img-blog.csdnimg.cn/2020102022540819.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

三方开发者开发的软件，都发布到这样一个“市场”里售卖。

## 2 构建受保护资源服务

受保护资源最终指向 API，比如排版软件中的受保护资源就是文章查询 API、批量查询 API 等及公众号头像、昵称的 API。授权服务最终保护的就是这些 API。

构建受保护资源服务时，除检查令牌的合法性，更关键是权限范围。校验权限的占比大。肯定要看该令牌到底能操作啥、能访问啥数据。

### 2.1 不同权限对应不同操作

**操作**对应 API，如公众号平台提供有查询、新增、删除文章 API。若xx请求过来的一个access_token的 scope 权限范围只对应查询、新增 API，那包含该 access_token 值的请求，无法执行删除文章 API。

### 2.2 不同权限对应不同数据

数据，指某 API 里包含的字段信息。如有一个查询我的信息的API，返回值包括 Contact（email、phone、qq）、Like（Basketball、Swimming）、Personal Data（sex、age、nickname）。若xx请求过来的一个访问令牌 access_token 的 scope 权限范围只对应 Personal Data，那么包含该 access_token 值的请求就不能获取到 Contact 和 Like 的信息。

这种权限范围的粒度要比“不同的权限对应不同的操作”的粒度要小，遵循最小权限范围原则。

### 2.3 不同用户对应不同数据

这种权限实际上只是换了一种维度，将其定位到用户。

一些基础类信息，比如获取地理位置、天气预报，不带用户归属属性，即这些并不归属某用户，是公有信息。这样信息，平台提供出去的 API 接口都是“中性”的，没有用户属性。

但更多场景却是基于用户属性。用户每次推送文章，xx都要知道文章是哪个用户的。用户为xx授权，xx获取的 access_token 实际上就包含公众号用户的这个用户属性。
公众号开放平台的受保护资源服务每次接收到xx的请求，都会根据该请求中
access_token 的值找到对应的用户 ID，继而根据用户 ID 查询到该用户的文章，即不同用户对应不同文章数据。

## 3 微服务的API GATEWAY意义

若有很多受保护资源服务，如提供：

- 用户信息查询的用户资源服务
- 文章查询的文章资源服务
- 视频查询的视频资源服务

每个受保护资源服务岂不是都要把上述权限范围校验执行一遍，不就大量重复？为解决这问题，应有统一网关层处理校验，所有请求都经过，再跳转到不同受保护资源服务。如此无需在每个受保护资源服务上都做权限校验，只在 API GATEWAY 做即可。

参考：

- 如何安全、快速地接入OAuth 2.0