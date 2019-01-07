授权服务的核心就是颁发访问令牌，而OAuth 2.0规范并没有约束访问令牌内容的生成规则，只要符合唯一性、不连续性、不可猜性。可以灵活选择令牌的形式，既可以是没有内部结构且不包含任何信息含义的随机字符串，也可以是具有内部结构且包含有信息含义的字符串。

之前生成令牌的方式都是默认一个随机字符串。而在结构化令牌这方面，目前用得最多的就是JWT令牌。

# 1 简介
JSON Web Token（JWT）是一个开放标准（RFC 7519），它定义了一种紧凑、自包含的方式，作为JSON对象在各方之间安全地传输信息，是用一种结构化封装的方式来生成token的技术。
结构化后的token可被赋予丰富含义，这是与无意义的随机字符串形式token的最大区别。

# 2 JWT结构
JWT这种结构化体可分为

## HEADER（头部）
装载令牌类型和算法等信息，是JWT的头部。
- typ 表示第二部分PAYLOAD是JWT类型
- alg 表示使用HS256对称签名的算法

## PAYLOAD（数据体）
JWT的数据体，代表了一组数据。
- sub
令牌的主体，一般设为资源拥有者的唯一标识）
- exp
令牌的过期时间戳
- iat
令牌颁发的时间戳


是JWT规范性的声明，PAYLOAD表示的一组数据允许我们自定义声明。

## SIGNATURE（签名）
签名后的JWT整体结构，是被`.`分割的三段内容：`header.payload.signature`。JWT令牌直接用肉眼，看起来还是毫无意义，但如果拷贝到 https://jwt.io/  在线校验，即可看到解码后的有意义数据。

`SIGNATURE`表示对JWT信息的签名。
### 作用
可能你觉得，有了`HEADER`和`PAYLOAD`就可让令牌携带信息在网络中传输了，但在网络中传输这样的信息体不安全。必须加密签名，而`SIGNATURE`就是对信息的签名结果，当受保护资源接收到三方软件的签名后需要验证令牌的签名是否合法。

# 3 令牌内检
## 定义
既然授权服务颁发令牌，受保护资源服务就要验证令牌。而受保护资源调用授权服务提供的检验令牌的服务的这种校验令牌方式就叫令牌内检。

## 特点
有时授权服务依赖DB，然后受保护资源服务也依赖该DB，即“共享DB”。微服务架构下，不同系统间依靠服务而非DB通信，比如授权服务给受保护资源服务提供一个RPC服务：![](https://img-blog.csdnimg.cn/20201019174105826.png#pic_center)
JWT令牌本身包含了之前所要依赖DB或依赖RPC服务才能拿到的信息，比如某用户为某软件进行授权等信息。

# 4 JWT令牌怎么用？
- 有JWT令牌后的通信方式
![](https://img-blog.csdnimg.cn/20201019174832919.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

授权服务发个令牌，受保护资源服务接这令牌，然后开始解析令牌所含信息，无需再去查询DB或RPC调用。即实现了令牌内检。

## HMAC 流程
![](https://img-blog.csdnimg.cn/20210111174003184.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## RSA 流程
![](https://img-blog.csdnimg.cn/202101111740200.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


# 5 为什么令牌要编码且签名？
授权服务颁发JWT后给到xx软件，xx拿着令牌请求受保护资源服务，即我在公众号里的文章。显然令牌要在公网传输。
所以传输过程令牌还要做到：
- 编码，以防乱码
- 签名及加密，以防数据信息泄露。

> JJWT是开源较方便的JWT工具，开箱即用。封装Base64URL编码和对称HMAC、非对称RSA的一系列签名算法。

使用JJWT可方便生成一个经过签名的JWT令牌，以及解析一个JWT令牌。

```java
String sharedTokenSecret="hellooauthhellooauthhellooauthhellooauth";//密钥
Key key = new SecretKeySpec(sharedTokenSecret.getBytes(),
                SignatureAlgorithm.HS256.getJcaName());

//生成JWT令牌
String jwts=
Jwts.builder().setHeaderParams(headerMap).setClaims(payloadMap).signWith(key,SignatureAlgorithm.HS256).compact()

//解析JWT令牌
Jws<Claims> claimsJws =Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwts);
JwsHeader header = claimsJws.getHeader();
Claims body = claimsJws.getBody();  
```
# 6 优点
## 6.1 计算代替存储
时间换空间。
这种计算并结构化封装，减少了“共享DB” 因远程调用而带来的网络传输性能损耗，所以可能节省时间。
## 6.2 加密
因JWT令牌内部已包含重要信息，所以传输过程都必须被要求密文传输，被强制要求加密也保障了传输安全性。
## 6.3 增强系统可用性和可伸缩性
JWT令牌，通过“自编码”方式包含身份验证需信息，不再需要服务端额外存储，所以每次的请求都是无状态会话。符合尽可能遵循无状态架构设计原则，即增强了系统可用性和伸缩性。

## 6.4 降低 AuthServer 压力
客户端获取令牌后，后续资源服务器可做自校验，无需到AuthServer校验。
## 6.5 简化AuthServer实现
无需对用户状态会话进行维护和管理
# 7 缺点
## 无状态和吊销无法两全

- 无法在使用过程中修改令牌状态。
比如我在使用xx时，可能因为莫须有原因修改了在公众号平台的密码或突然取消了给xx的授权。这时，令牌状态就该有变更，将原来对应令牌置无效。

但使用JWT时，每次颁发的令牌都不会存在服务端，无法改变令牌状态。这表示JWT令牌在有效期内畅通无阻。

那么可以把JWT令牌存储在一个分布式内存数据库比如Redis中吗？
NO！这违背JWT意义 - **将信息结构化存入令牌本身**。通常有两种方案：
1. 将每次生成JWT令牌时的秘钥粒度缩小到用户级别，即一个用户一个秘钥
如此，当用户取消授权或修改密码，可让该密钥一起修改。这种方案一般还需配套单独密钥管理服务
2. 在不提供用户主动取消授权的环境里面，若只考虑修改密码场景，即可把用户密码作为JWT的密钥。这也是用户粒度。这样用户修改密码也就相当于修改了密钥。

## 网络传输开销
随 claims 增多而增大。
# 8 令牌的生命周期
> 令牌都有有效期，只是JWT可把有效期的信息存在本身结构。

OAuth 2.0的令牌生命周期，通常有三种情况：

1. 令牌自然过期
![](https://img-blog.csdnimg.cn/20201019193446950.png#pic_center)
该过程不排除**主动销毁令牌**的可能，比如令牌被泄露，授权服务可让令牌失效。

2. 访问令牌失效后可使用刷新令牌请求新令牌，提高用户使用三方软件的体验。

3. 让三方软件比如xx，主动发起令牌失效请求，然后授权服务收到请求后让令牌立即失效。
何时需要该机制?
比如用户和三方软件间存在一种订购关系：我购买了xx软件，那么到期或退订时且我授权的token还未到期情况下，就需这样一种令牌撤回协议，支持xx主动发起令牌失效请求。作为开放平台，也建议有责任的三方软件遵守这样的一种令牌撤回协议。
![](https://img-blog.csdnimg.cn/20201019202136483.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)


# 9 总结
OAuth 2.0 的核心是授权服务，没有令牌就没有OAuth，令牌表示授权后的结果。令牌在OAuth 2.0系统中对于第三方软件都是不透明的。需要关心令牌的，是授权服务和受保护资源服务。

1. JWT 默认是不加密，但也是可以加密的。生成原始 Token 以后，可以用密钥再加密一次
2. JWT 不加密的情况下，不能将秘密数据写入 JWT
3. JWT 不仅可以用于认证，也可以用于交换信息。有效使用 JWT，可以降低服务器查询数据库的次数
4. JWT 的最大缺点是，由于服务器不保存 session 状态，因此无法在使用过程中废止某个 token，或者更改 token 的权限。也就是说，一旦 JWT 签发了，在到期之前就会始终有效，除非服务器部署额外的逻辑
5. JWT 本身包含了认证信息，一旦泄露，任何人都可以获得该令牌的所有权限。为了减少盗用，JWT 的有效期应该设置得比较短。对于一些比较重要的权限，使用时应该再次对用户进行认证
6. 为了减少盗用，JWT 不应该使用 HTTP 协议明码传输，要使用 HTTPS 协议传输

参考
- [JSON Web Token 入门教程](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)
- 在OAuth 2.0中，如何使用JWT结构化令牌？
- https://tools.ietf.org/html/rfc6749#section-4.4