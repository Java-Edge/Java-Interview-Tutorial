# 03-OAuth2.0实战-轻松学会使用JWT，让你的OAuth2.0实现更加安全高效！

## 0 前言

授权服务的核心：颁发访问令牌（accessToken），而OAuth 2.0规范未约束accessToken内容生成规则，只要符合：

- 唯一性
- 不连续性
- 不可猜性

可灵活选择令牌形式：

- 既可为无内部结构 && 不含任何信息含义的随机字符串
- 也可为有内部结构 && 含有信息含义的字符串 

以前生成令牌都是默认一个随机字符串。而结构化令牌，目前用得最多是JWT令牌。

- 加密token

- 无状态token

- 低截取风险

  经过加密的

- 支持跨域：无需存储到 cookie，而是在 header 里传输

- 无CSRF


## 1 简介

JSON Web Token（JWT）是个开放标准（RFC 7519），定义一种紧凑、自包含方式，作为JSON对象在各方之间安全地传输信息，结构化封装的方式生成token。
结构化后的token可被赋予丰富含义，与无意义随机字符串token的最大区别。

## 2 JWT结构

如：

```bash
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

在https://jwt.io/解码：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/05/b419e34461dbcb0ff25ec11c5b53b7ce.png)

### 2.1 HEADER

装载令牌类型和算法等信息：

- typ 表示第二部分PAYLOAD是JWT类型
- alg 表示用HS256对称签名算法

### 2.2 PAYLOAD（数据体）

代表一组数据：

- sub：令牌主体，一般设为资源拥有者的唯一标识
- exp：令牌的过期时间戳
- iat：令牌颁发的时间戳


是JWT规范性的声明，PAYLOAD表示的一组数据允许我们自定义声明。

### 2.3 SIGNATURE（签名）

签名后的JWT整体结构，被`.`分割的三段内容：`header.payload.signature`。JWT令牌肉眼看也无意义，拷贝到 https://jwt.io/  在线校验，即可看到解码后有意义数据。

`SIGNATURE`表示对JWT信息的签名。

#### 作用

有了`HEADER`和`PAYLOAD`就可让令牌携带信息在网络中传输，但网络中传输这样的信息体不安全。须加密签名，`SIGNATURE`就是对信息的签名结果，当受保护资源接收到三方软件的签名后需要验证令牌的签名是否合法。

## 3 令牌内检

### 3.1 定义

既然授权服务颁发令牌，受保护资源服务就要验证令牌。而受保护资源调用授权服务提供的检验令牌的服务的这种校验令牌方式就叫令牌内检。

### 3.2 特点

有时授权服务依赖DB，然后受保护资源服务也依赖该DB，即“共享DB”。

微服务架构下，不同系统间依靠服务而非DB通信，如【授权服务】给【受保护资源服务】提供一个RPC服务：

![](https://img-blog.csdnimg.cn/20201019174105826.png#pic_center)

JWT令牌本身包含了之前所要依赖DB或依赖RPC服务才能拿到的信息，如某用户为某软件进行授权等信息。

## 4 JWT实现方案

有JWT令牌后的通信方式：

![](https://img-blog.csdnimg.cn/20201019174832919.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

授权服务发个令牌，受保护资源服务接令牌，然后开始解析令牌所含信息，无需再去查询DB或RPC调用。即实现了令牌内检。

### 4.1 HMAC 流程

Hash-based Message Authentication Code，基于哈希函数的消息认证码。验证数据完整性和真实性，通常使用一个共享密钥来计算并验证消息认证码。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/05/f624246b830b9f96d9f58b730ffccb7c.png)

1. 使用Base64编码header和payload，并用"."串联成一个字符串
2. 使用secret key对上一步得到的字符串进行HMAC签名操作，生成一个签名值
3. Base64编码签名值，与JWT的header和payload一起组成最终的JWT

接收方在验证JWT时需按照相同的流程计算签名值并将其与JWT中的签名值进行比较，如相同，表明JWT有效。由于签名值的生成过程需要使用密钥，因此只有持有密钥的人才能正确地计算签名值，从而保证JWT安全性。

### 4.2 RSA 流程

Rivest-Shamir-Adleman，一种公钥加密算法，也可用于数字签名。

基于两个大质数的乘积难以分解这一数学难题，利用公钥和私钥配对实现信息的加密和解密，广泛应用于网络安全、数字签名、电子商务等领域。

![](https://img-blog.csdnimg.cn/202101111740200.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)



1. 使用Base64算法将header和payload进行编码，并用"."串联成字符串
2. 使用private key对上一步得到的字符串进行RSA签名操作，生成一个签名值
3. 将签名值进行Base64编码，与JWT的header和payload一起组成最终的JWT。

接收方验证JWT时：

1. 从JWT解析出签名值
2. 使用public key对JWT的header和payload进行RSA验签操作，得到一个验证结果
3. 将该结果与JWT中的签名值进行比较，如果相同则表明JWT是有效的

由于私钥只有签发者拥有，因此只有签发者才能正确地给JWT进行签名，而任何人都可以使用公钥进行验签，从而保证了JWT的安全性和可信度。

## 5 为啥令牌要编码且签名？

授权服务颁发JWT后给到xx软件，xx拿着令牌请求受保护资源服务（我在公众号里的文章）。显然令牌要在公网传输。所以传输过程，令牌要做到：

- 编码，防乱码
- 签名及加密，防数据信息泄露

[jjwt](https://github.com/jwtk/jjwt) 开源的JWT工具，封装了Base64URL编码和对称HMAC、非对称RSA等一系列签名算法，可方便生成一个签名的JWT令牌及解析一个JWT令牌。

```java
// 密钥
String sharedTokenSecret="hellooauthhellooauthhellooauthhellooauth";
Key key = new SecretKeySpec(sharedTokenSecret.getBytes(),
                SignatureAlgorithm.HS256.getJcaName());

// 生成JWT令牌
String jwts=
Jwts.builder()
 .setHeaderParams(headerMap)
 .setClaims(payloadMap)
 .signWith(key,SignatureAlgorithm.HS256)
 .compact()

// 解析JWT令牌
Jws<Claims> claimsJws =Jwts.parserBuilder()
  .setSigningKey(key)
  .build()
  .parseClaimsJws(jwts);

JwsHeader header = claimsJws.getHeader();
Claims body = claimsJws.getBody();
```

## 6 优点

### 6.1 计算代替存储

时间换空间。
这种计算并结构化封装，减少了“共享DB” 因远程调用而带来的网络传输性能损耗，所以可能节省时间。

### 6.2 加密

因JWT令牌内部已包含重要信息，所以传输过程都必须被要求密文传输，被强制要求加密也保障了传输安全性。

### 6.3 增强系统可用性和可伸缩性

JWT令牌通过“自编码”包含身份验证所需信息，无需服务端额外存储，所以每次的请求都是无状态会话。符合尽可能遵循无状态架构设计原则，增强了系统可用性和伸缩性。

### 6.4 降低 AuthServer 压力

客户端获取令牌后，后续资源服务器可做自校验，无需到AuthServer校验。

### 6.5 简化AuthServer实现

无需对用户状态会话进行维护和管理

## 7 缺点

### 7.1 无状态和吊销无法两全

无法在使用过程中修改令牌状态。比如我在使用xx时，可能莫须有原因修改了在公众号平台的密码或突然取消了给xx的授权。这时，令牌状态就该有变更，将原来对应令牌置无效。但使用JWT时，每次颁发的令牌都不会存在服务端，无法改变令牌状态。这表示JWT令牌在有效期内都会畅通无阻。



那可以把JWT令牌存储在一个分布式内存数据库，如Redis吗？
NO！这违背JWT意义 - **将信息结构化存入令牌本身**。通常有两种方案：

1. 将每次生成JWT令牌时的密钥粒度缩小到用户级别，即一个用户一个密钥
   如此，当用户取消授权或修改密码，可让该密钥一起修改。这种方案一般还需配套单独密钥管理服务
2. 在不提供用户主动取消授权的环境里面，若只考虑修改密码场景，即可把用户密码作为JWT的密钥。这也是用户粒度。这样用户修改密码也就相当于修改了密钥。

### 7.2 网络传输开销

随 claims 增多而增大。

## 8 令牌的生命周期

令牌都有【有效期】，只是JWT可将有效期的信息存在自身结构中。

OAuth 2.0的令牌生命周期：

1. 令牌自然过期

![](https://img-blog.csdnimg.cn/20201019193446950.png#pic_center)

该过程不排除**主动销毁令牌**的可能，比如令牌被泄露，授权服务可让令牌失效。

2. 访问令牌失效后可使用刷新令牌请求新令牌，提高用户使用三方软件的体验。

3. 让三方软件比如xx，主动发起令牌失效请求，然后授权服务收到请求后让令牌立即失效。

## 9 何时需要该机制?

比如用户和三方软件存在订购关系：我购买xx软件，到期或退订时且我授权的token还未到期时，就需这样一种令牌撤回协议，支持xx主动发起令牌失效请求。作为开放平台，有责任的三方软件也应遵守这样的令牌撤回协议。

![](https://img-blog.csdnimg.cn/20201019202136483.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

## 10 引入jjwt依赖

###  ≤ 0.10.0

它将所有的功能都打包在一个单独的 `jjwt` artifact 中。

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>
```

### ≥  0.11.x

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId> <!-- or jjwt-gson if Gson is preferred -->
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

 jjwt 库在 0.10.0 版本之后推荐的引入方式。它将 jjwt 库拆分成了三个独立的模块：

- **`jjwt-api`:** 包含 JWT 规范的接口和抽象类，定义了 JWT 的基本操作，但不包含任何具体实现。这是你**必须**引入的依赖。
- **`jjwt-impl`:** 包含了 `jjwt-api` 中接口的具体实现，负责 JWT 的生成、解析、签名和验证等核心逻辑。`scope` 设置为 `runtime`，意味着在编译时不需要，但在运行时是必需的。
- **`jjwt-jackson` (或 `jjwt-gson`):** 提供了使用 Jackson (或 Gson) 库进行 JSON 处理的功能。用于将 JWT 的 payload 部分转换为 Java 对象，或将 Java 对象转换为 JWT 的 payload。同样，`scope` 设置为 `runtime`。

###  区别

1. **模块化：** 0.10.0 版本之后引入了模块化设计，将 jjwt 库拆分为 `jjwt-api`、`jjwt-impl` 和 `jjwt-jackson` (或 `jjwt-gson`) 三个模块：
   - **更小的依赖体积：** 只引入需要的模块，减少了最终应用程序的体积。
   - **更好的依赖管理：** 更清晰的依赖关系，避免了潜在的冲突。
   - **更灵活的配置：** 可以根据需要选择不同的 JSON 处理库 (Jackson 或 Gson)。
2. **性能和安全性改进：** 0.10.0 及以上版本通常包含性能优化和安全修复。使用较新的版本可以获得更好的性能和更高的安全性。
3. **API 变更：** 0.10.0 版本引入了一些 API 变更，因此使用 0.9.1 版本的代码可能需要进行修改才能在新版本上运行。
4. **维护状态：** 0.9.1 版本已经非常老旧，不再维护。使用最新版本可以获得 bug 修复和安全更新。

### 生成 JWT



```java
// 1. 对密钥执行base64编码
String base64 = new BASE64Encoder().encode(USER_KEY.getBytes());

// 2. 对base64生成一个秘钥对象
SecretKey secretKey = Keys.hmacShaKeyFor(base64.getBytes());

// 3. 通过jwt生成token字符串
Stu stu = new Stu(1001, "编程严选网", 18);
String stuJson = new Gson().toJson(stu);

String myJWT = Jwts.builder()
        // 设置用户自定义数据
        .setSubject(stuJson)
        // 使用哪个秘钥对象进行jwt的生成
        .signWith(secretKey)
        // 压缩并且生成jwt
        .compact();

System.out.println(myJWT);
}
```

### 校验JWT



```java
@Test
public void checkJWT() {
    // 前端传来的jwt
    String jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ7XCJpZFwiOjEwMDEsXCJuYW1lXCI6XCJpbW9vYyDmhZXor77nvZFcIixcImFnZVwiOjE4fSJ9.THFIuA6VxihfflzDFE0u3_E2gFeeWrH-qQjFnpCgof4";

    // 1. 对秘钥进行base64编码
    String base64 = new BASE64Encoder().encode(USER_KEY.getBytes());

    // 2. 对base64生成一个秘钥的对象
    SecretKey secretKey = Keys.hmacShaKeyFor(base64.getBytes());

    // 3. 校验jwt

    // 构造解析器
    JwtParser jwtParser = Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build();
    // 解析成功，可以获得Claims，从而去get相关的数据，如果此处抛出异常，则说明解析不通过，也就是token失效或者被篡改
    // 解析jwt
    Jws<Claims> jws = jwtParser.parseClaimsJws(jwt);

    String stuJson = jws.getBody().getSubject();
    Stu stu = new Gson().fromJson(stuJson, Stu.class);

    System.out.println(stu);
}
```

 创建属性配置文件：

![](https://img-blog.csdnimg.cn/178cef41820949968241ff836dafcad1.png)

代码引用它：

```java
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

@Component
@Data
@PropertySource("classpath:jwt.properties")
@ConfigurationProperties(prefix = "auth")
public class JWTProperties {
    private String key;
}
```

万一 auth.key 泄露了呢？防止内鬼，定期更新 key，就需要动态配置中心。

【hire-api】服务

![](https://img-blog.csdnimg.cn/53ed5c1871504bf5ac9bdd35fb6917ff.png)

新建配置：

![](https://img-blog.csdnimg.cn/5d2f7814f4ec4531a23ddc5ce8680718.png)

业务服务都启动完成后，修改配置，重新发布：

![](https://img-blog.csdnimg.cn/5bae1b8b3668428599e0d604c97bd26f.png)

这是通过 @RefreshScope 注解实现的

```java
@Component
@Slf4j
@RefreshScope
public class JWTUtils {

    public static final String at = "@";

    @Autowired
    private JWTProperties jwtProperties;

    @Value("${jwt.key}")
    public String JWT_KEY;
  	
  	...
}
```

## 11 总结

OAuth 2.0 的核心是授权服务，没有令牌就没有OAuth，令牌表示授权后的结果。令牌在OAuth 2.0系统中对于第三方软件都是不透明的。需要关心令牌的，是授权服务和受保护资源服务。

1. JWT默认不加密，但也可加密。生成原始 Token 后，可用密钥再加密一次
2. JWT不加密时，不能将秘密数据写入JWT
3. JWT不仅可用于认证，也可以用于交换信息。有效使用 JWT，可降低服务器查询数据库的次数
4. JWT 的最大缺点是，由于服务器不保存 session 状态，因此无法在使用过程中废止某个 token，或者更改 token 的权限。即一旦 JWT 签发了，在到期之前就会始终有效，除非服务器部署额外逻辑
5. JWT本身包含认证信息，一旦泄露，任何人都能获得该令牌的所有权限。为了减少盗用，JWT 的有效期应该设置得比较短。对于一些比较重要的权限，使用时应该再次对用户进行认证
6. 为减少盗用，JWT 不应使用 HTTP 协议明码传输，要使用 HTTPS 协议传输

参考：

- [JSON Web Token 入门教程](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)
- 在OAuth 2.0中，如何使用JWT结构化令牌？
- https://tools.ietf.org/html/rfc6749#section-4.4