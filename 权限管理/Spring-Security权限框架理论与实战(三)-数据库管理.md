![](https://upload-images.jianshu.io/upload_images/4685968-d9c6f52adccbc979.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1 UserDetailsService
![](https://upload-images.jianshu.io/upload_images/4685968-c8f0070960521fd1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
Spring Security中进行身份验证的是AuthenticationManager接口，ProviderManager是它的一个默认实现，但它并不用来处理身份认证，而是委托给配置好的AuthenticationProvider，每个AuthenticationProvider会轮流检查身份认证。检查后或者返回Authentication对象或者抛出异常。

验证身份就是加载响应的UserDetails，看看是否和用户输入的账号、密码、权限等信息匹配。
此步骤由实现`AuthenticationProvider`的`DaoAuthenticationProvider`（它利用UserDetailsService验证用户名、密码和授权）处理
![](https://upload-images.jianshu.io/upload_images/4685968-91e07e978a20bd3d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-053e8c886972452f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- GrantedAuthority 
Authentication 的 getAuthorities() 可以返回当前 Authentication 对象拥有的权限，即当前用户拥有的权限。其返回值是一个 GrantedAuthority 类型的数组，每一个 GrantedAuthority 对象代表赋予给当前用户的一种权限。GrantedAuthority 是一个接口，其通常是通过 UserDetailsService 进行加载，然后赋予给 UserDetails 的。
GrantedAuthority 中只定义了一个 getAuthority() 方法，该方法返回一个字符串，表示对应权限的字符串表示，如果对应权限不能用字符串表示，则应当返回 null。
Spring Security 针对 GrantedAuthority 有一个简单实现 SimpleGrantedAuthority。该类只是简单的接收一个表示权限的字符串。Spring Security 内部的所有 AuthenticationProvider 都是使用 SimpleGrantedAuthority 来封装 Authentication 对象。

包含 GrantedAuthority 的 UserDetails对象在构建 Authentication对象时填入数据

![](https://upload-images.jianshu.io/upload_images/4685968-f8288ec7db6cb45e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# UserDetails
如果希望扩展登录时加载的用户信息，最简单直接的办法就是实现UserDetails接口，定义一个包含所有业务数据的对象
![](https://upload-images.jianshu.io/upload_images/4685968-919fd8d52a137126.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# Authentication
![](https://upload-images.jianshu.io/upload_images/4685968-122d44eaa4bccce1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 认证过程
- 用户使用用户名和密码进行登录
- Spring Security 将获取到的用户名和密码封装成一个实现了 `Authentication `接口的 `UsernamePasswordAuthenticationToken`
![](https://upload-images.jianshu.io/upload_images/4685968-668a0d1a6f9b68e3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 将上述产生的 token 对象传递给 AuthenticationManager 进行登录认证
AuthenticationManager 认证成功后将会返回一个封装了用户权限等信息的 Authentication 对象
- 通过调用 SecurityContextHolder.getContext().setAuthentication(...) 将 AuthenticationManager 返回的 Authentication 对象赋予给当前的 SecurityContext

上述介绍的就是 Spring Security 的认证过程。在认证成功后，用户就可以继续操作去访问其它受保护的资源了，但是在访问的时候将会使用保存在 SecurityContext 中的 Authentication 对象进行相关的权限鉴定。
## Web 应用的认证过程
如果用户直接访问登录页面，那么认证过程跟上节描述的基本一致，只是在认证完成后将跳转到指定的成功页面，默认是应用的根路径。如果用户直接访问一个受保护的资源，那么认证过程将如下：
- 引导用户进行登录，通常是重定向到一个基于 form 表单进行登录的页面，具体视配置而定
- 用户输入用户名和密码后请求认证，后台会获取用户名和密码封装成一个 `UsernamePasswordAuthenticationToken `对象，然后把它传递给` AuthenticationManager `进行认证
- 如果认证失败将继续执行步骤 1，如果认证成功则会保存返回的` Authentication `到 `SecurityContext`，然后默认会将用户重定向到之前访问的页面
- 用户登录认证成功后再次访问之前受保护的资源时就会对用户进行权限鉴定，如不存在对应的访问权限，则会返回 403 错误码

在上述步骤中将有很多不同的类参与，但其中主要的参与者是 ExceptionTranslationFilter
## ExceptionTranslationFilter
用来处理来自 `AbstractSecurityInterceptor `抛出的` AuthenticationException `和 `AccessDeniedException `
`AbstractSecurityInterceptor `是 Spring Security 用于拦截请求进行权限鉴定的，其拥有两个具体的子类
- 拦截方法调用的 MethodSecurityInterceptor 
- 拦截 URL 请求的 FilterSecurityInterceptor


- 当捕获`AuthenticationException`时调用`AuthenticationEntryPoint `引导用户进行登录
- 捕获` AccessDeniedException`，但是用户还没有通过认证，则调用 `AuthenticationEntryPoint` 引导用户进行登录认证，否则将返回一个表示不存在对应权限的 403 错误码
## 在 request 之间共享 SecurityContext
既然 `SecurityContext `是存放在 ThreadLocal 中的，而且在每次权限鉴定的时候都是从 ThreadLocal 中获取 `SecurityContext` 中对应的 `Authentication `所拥有的权限，并且不同的 request 是不同的线程，为什么每次都可以从 ThreadLocal 中获取到当前用户对应的 `SecurityContext `呢？

在 Web 应用中这是通过` SecurityContextPersistentFilter `实现的，默认情况下其会在每次请求开始的时候从 session 中获取 `SecurityContext`，然后把它设置给 SecurityContextHolder，在请求结束后又会将 SecurityContextHolder 所持有的 SecurityContext 保存在 session 中，并且清除 SecurityContextHolder 所持有的 SecurityContext
这样当我们第一次访问系统的时候，SecurityContextHolder 所持有的` SecurityContext 肯定是空的`，待我们`登录成功后`，SecurityContextHolder 所持有的 `SecurityContext 就不是空的了`，且包含有认证成功的 Authentication 对象，待请求结束后我们就会将 SecurityContext 存在 session 中，等到下次请求的时候就可以从 session 中获取到该 SecurityContext 并把它赋予给 SecurityContextHolder 了，由于 SecurityContextHolder 已经持有认证过的 Authentication 对象了，所以下次访问的时候也就不再需要进行登录认证了。
# AuthenticationProvider
认证是由 AuthenticationManager 来管理的，但是真正进行认证的是 AuthenticationManager 中定义的 AuthenticationProvider
AuthenticationManager 中可以定义有多个 AuthenticationProvider。当我们使用 authentication-provider 元素来定义一个 AuthenticationProvider 时，如果没有指定对应关联的 AuthenticationProvider 对象，Spring Security 默认会使用 DaoAuthenticationProvider。
DaoAuthenticationProvider 在进行认证的时候需要一个 UserDetailsService 来获取用户的信息 UserDetails，其中包括用户名、密码和所拥有的权限等。所以如果我们需要改变认证的方式，我们可以实现自己的 AuthenticationProvider；如果需要改变认证的用户信息来源，我们可以实现 UserDetailsService。

