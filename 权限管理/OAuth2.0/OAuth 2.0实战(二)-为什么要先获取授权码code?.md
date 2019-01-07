> `文章收录在我的 GitHub 仓库，欢迎Star/fork：`
> [Java-Interview-Tutorial](https://github.com/Wasabi1234/Java-Interview-Tutorial)
> https://github.com/Wasabi1234/Java-Interview-Tutorial

xx软件最终是通过访问令牌请求到我的公众号里的文章。访问令牌是通过授权码换来的。你有想过为何要用授权码换令牌，而不直接颁发访问令牌呢？

# OAuth 2.0 的角色
资源拥有者、客户端(即第三方软件)、授权服务和受保护资源。

- 资源拥有者=> 我
- 客户端 => xx软件
- 授权服务 -> 公众号开放平台的授权服务
- 受保护资源 -> 我的公众号里的文章


![](https://img-blog.csdnimg.cn/20201018001849588.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)


# 一定要授权码吗?

第 4 步授权服务生成授权码，倘若我们不要授权码，这步直接返回访问令牌`access_token` 。那就不能重定向，因为这样会把安全保密性要求极高的访问令牌暴露在浏览器，增加访问令牌失窃风险。这显然不行的呀！即若无授权码，就只能把访问令牌发给第三方软件的后端服务：
![](https://img-blog.csdnimg.cn/20201018005205945.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

看着好像没问题？我访问xx软件，xx软件说要排版文章我得给它授权，不然vx公众号不干，然后xx软件就引导我跳转到了公众号的授权服务。到授权服务之后，开放平台验证xx的合法性及我的登录状态后，生成授权页面。我赶紧扫码同意授权，于是开放平台知道可以把我的文章数据给xx软件。

于是，开放平台生成访问令牌 `access_token`，并且通过后端服务方式返回给xx软件。xx就能正常工作。

但是当我被浏览器重定向到授权服务，我和xx间的连接就断了，相当于此时我和授权服务建立连接后，将一直“停留在授权服务页面”。我再也没有重连到xx。

但这时xx已拿到我授权后的访问令牌，也使用访问令牌获取了我的号里的文章数据。这时，考虑我的感受。xx应该要通知到我，但是如何做呢？现在连接可是断了的呀！
为了让xx通知到我，我必须跟xx重建 “连接”。即第二次重定向，我授权后，又重新重定向回到xx的地址，这样我就跟xx有了新连接。


为重建连接，又不能暴露访问令牌，就有这样的**临时、间接凭证：授权码**。因为xx最终要拿到高安全要求的访问令牌，并非授权码，**授权码可以暴露在浏览器**。
有了授权码，访问令牌可以在后端服务间传输，同时还可重建我&xx间的连接。
所以，通过授权码，既考虑了我的用户体验，又考虑了通信安全。

执行授权码流程时，授权码和访问令牌在xx和授权服务间到底怎么流转的？

# 授权码许可类型的通信过程

## 间接通信
间接通信就是指获取授权码的交互。
![](https://img-blog.csdnimg.cn/20201018044054921.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

> 我：“xx，我要访问你了。”
xx：“我把你引到授权服务，我需要授权服务给我一个授权码。”
授权服务：“xx，我把**授权码发给浏览器**了。”
小兔软件：“ 那我从浏览器拿到了授权码。”

xx和授权服务间，并无直接通信，而是通过中间人(浏览器).

## 直接通信
授权码换取访问令牌的交互，是“直接”的。
![](https://img-blog.csdnimg.cn/20201018044618552.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

三方软件xx获取到授权码后，向授权服务发起获取访问令牌 `access_token` 的请求。

三方软件要代表资源拥有者去访问受保护资源
授权服务负责颁发访问令牌，受保护资源负责接收并验证访问令牌。

# 开发微信小程序场景
比如获取用户登录态信息的过程：
- 通过 `wx.login(Object object)` 获取登录凭证 code，该步是在小程序内部通过调用微信提供的 SDK 实现的
- 再通过该 code 换取用户的 session_key 等信息，即官方文档的 `auth.code2Session` 方法，同时该方法也是被强烈建议通过开发者的后端服务来调用

参考
- https://leokongwq.github.io/2017/02/28/why-oauth2-use-authorization-code.html


- https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html


- https://segmentfault.com/q/1010000014642301


- https://tools.ietf.org/html/rfc6749


![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)