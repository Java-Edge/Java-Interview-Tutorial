# 0 联系我

![](http://upload-images.jianshu.io/upload_images/4685968-2d56bbf40529ecd3?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题")

## 1.[Java开发技术交流Q群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## 2.[完整博客链接](https://blog.csdn.net/qq_33589510/)

## 3.[个人知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## 4.[gayhub](https://github.com/Wasabi1234)

# [相关源码](https://github.com/Wasabi1234/Security)

# Spring Security对授权的定义
![](https://upload-images.jianshu.io/upload_images/4685968-287dd1fcd541c0a7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3afcd62f73f8ada2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-dc809532626a053c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


![](https://upload-images.jianshu.io/upload_images/4685968-83fc058ef1bced6f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![过滤器的执行顺序图](https://upload-images.jianshu.io/upload_images/4685968-1195c2fc358bb38e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![auto-config='true'时的过滤器列表](https://upload-images.jianshu.io/upload_images/4685968-f0d904aaee8e0116.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 0 UsernamePasswordAuthenticationFilter
整个调用流程是，先调用其父类 `AbstractAuthenticationProcessingFilter.doFilter()` 
然后再执行` UsernamePasswordAuthenticationFilter.attemptAuthentication() `进行验证
## 0.1 AbstractAuthenticationProcessingFilter
```
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) req;
		HttpServletResponse response = (HttpServletResponse) res;

        // 1 判断当前filter是否可以处理当前请求，不可则移交至下一个filter
		if (!requiresAuthentication(request, response)) {
			chain.doFilter(request, response);

			return;
		}
        ...
		Authentication authResult;

		try {
            // 2 抽象方法由子类UsernamePasswordAuthenticationFilter实现
			authResult = attemptAuthentication(request, response);
			if (authResult == null) {
				// return immediately as subclass has indicated that it hasn't completed
				// authentication
				return;
			}
            // 2 认证成功后，处理一些与session相关的方法 
			sessionStrategy.onAuthentication(authResult, request, response);
		}
	    ...
		// Authentication success
		if (continueChainBeforeSuccessfulAuthentication) {
			chain.doFilter(request, response);
		}
        // 3 认证成功后的相关回调方法 主要将当前的认证置于 SecurityContextHolder
		successfulAuthentication(request, response, chain, authResult);
	}
```
### 执行流程
- 判断filter是否可以处理当前请求，如果不可以则放行交给下一个filter
- 调用抽象方法attemptAuthentication进行验证，由子类`UsernamePasswordAuthenticationFilter`实现
- 认证成功以后，回调一些与 session 相关的方法；
- 认证成功以后，认证成功后的相关回调方法；认证成功以后，认证成功后的相关回调方法；
![](https://upload-images.jianshu.io/upload_images/4685968-ba8ba83dcfcba188.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 将当前认证成功的 Authentication 置于 SecurityContextHolder
- 调用其它可扩展的 handlers 继续处理该认证成功以后的回调事件（实现`AuthenticationSuccessHandler`接口）
## UsernamePasswordAuthenticationFilter
 ```
public Authentication attemptAuthentication(HttpServletRequest request,
			HttpServletResponse response) throws AuthenticationException {
		//  1 请求方式须为POST
		if (postOnly && !request.getMethod().equals("POST")) {
			throw new AuthenticationServiceException(
					"Authentication method not supported: " + request.getMethod());
		}

		//  2 从request中获取username和password
		String username = obtainUsername(request);
		String password = obtainPassword(request);
		if (username == null) {
			username = "";
		}
		if (password == null) {
			password = "";
		}
		username = username.trim();

		// 3 构建UsernamePasswordAuthenticationToken（两个参数的构造方法setAuthenticated(false)）
		UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(
				username, password);

		// Allow subclasses to set the "details" property
		setDetails(request, authRequest);
		// 4 调用 AuthenticationManager 进行验证（子类ProviderManager遍历所有的AuthenticationProvider认证）
		return this.getAuthenticationManager().authenticate(authRequest);
	}
```
![](https://upload-images.jianshu.io/upload_images/4685968-49e13457838f797b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 执行流程
1.  认证请求的方法必须为`POST`
2.  从request中获取 username 和 password
3.  封装`Authenticaiton`的实现类`UsernamePasswordAuthenticationToken`，（`UsernamePasswordAuthenticationToken`调用两个参数的构造方法setAuthenticated(false)）
4.  调用 `AuthenticationManager` 的 `authenticate` 方法进行验证；可参考[ProviderManager](https://www.jianshu.com/p/04d107db075d)部分


# 1 SecurityContextPersistenceFilter
通过观察Filter的名字，就能大概猜出来这个过滤器的作用，持久化SecurityContext实例
`org.springframework.security.web.context.SecurityContextPersistenceFilter `
![](https://upload-images.jianshu.io/upload_images/4685968-c5cad3b4aa1edb5d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![org.springframework.security.context.HttpSessionContextIntegrationFilter](https://upload-images.jianshu.io/upload_images/4685968-f1f7f234c2dd5103.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

该 Filter 位于过滤器的顶端,所有过滤器的入口
```
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) req;
		HttpServletResponse response = (HttpServletResponse) res;

		if (request.getAttribute(FILTER_APPLIED) != null) {
			// 确保对于每个请求只应用一次过滤器
			chain.doFilter(request, response);
			return;
		}

		final boolean debug = logger.isDebugEnabled();

		request.setAttribute(FILTER_APPLIED, Boolean.TRUE);

		if (forceEagerSessionCreation) {
			HttpSession session = request.getSession();

			if (debug && session.isNew()) {
				logger.debug("Eagerly created session: " + session.getId());
			}
		}
        // 将 request/response 对象交给该对象维护  
		HttpRequestResponseHolder holder = new HttpRequestResponseHolder(request,response);
        //通过SecurityContextRepository接口的实现类装载SecurityContext实例  
        //HttpSessionSecurityContextRepository将产生SecurityContext实例的任务交给SecurityContextHolder.createEmptyContext()  
        //SecurityContextHolder再根据策略模式的不同，  
        //把任务再交给相应策略类完成SecurityContext的创建  
        //如果没有配置策略名称，则默认为  
        //ThreadLocalSecurityContextHolderStrategy，  
        //该类直接通过new SecurityContextImpl()创建实例
		SecurityContext contextBeforeChainExecution = repo.loadContext(holder);

		try {
            //将产生的SecurityContext再通过SecurityContextHolder->  
            //ThreadLocalSecurityContextHolderStrategy设置到ThreadLocal 
			SecurityContextHolder.setContext(contextBeforeChainExecution);
            //继续把请求流向下一个过滤器执行  
			chain.doFilter(holder.getRequest(), holder.getResponse());

		}
		finally {
            // 所有过滤器执行完后

            //先从SecurityContextHolder获取SecurityContext实例  
			SecurityContext contextAfterChainExecution = SecurityContextHolder
					.getContext();
			//关键性地除去SecurityContextHolder内容 - 在任何事情之前执行此操作
			//再把SecurityContext实例从SecurityContextHolder中清空
                        //若没有清空,会受到服务器的线程池机制的影响  
			SecurityContextHolder.clearContext();
            //将SecurityContext实例持久化到session中 
			repo.saveContext(contextAfterChainExecution, holder.getRequest(),
					holder.getResponse());
			request.removeAttribute(FILTER_APPLIED);

			if (debug) {
				logger.debug("SecurityContextHolder now cleared, as request processing completed");
			}
		}
	}
```
- 在执行其他过滤器之前，率先判断用户的session中是否已经存在一个SecurityContext了。如果存在，就把SecurityContext拿出来，放到SecurityContextHolder中，供Spring Security的其他部分使用。如果不存在，就创建一个SecurityContext出来，还是放到SecurityContextHolder中(session中 )，供Spring Security的其他部分使用。
- 在所有过滤器执行完毕后，清空SecurityContextHolder，因为SecurityContextHolder是基于ThreadLocal的，如果在操作完成后清空ThreadLocal，会受到服务器的线程池机制的影响
# 2 LogoutFilter过滤器
![](https://upload-images.jianshu.io/upload_images/4685968-a21b90fe0599be03.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8eb385a75bb9adf9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

该类有两个构造函数 
![](https://upload-images.jianshu.io/upload_images/4685968-d06e2d53613534a2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
构造函数的参数,就是之前解析HTTP标签通过创建LogoutFilter过滤器的bean定义时通过构造参数注入进来的
下面的部分源码为LogoutFilter的bean定义 
```
public BeanDefinition parse(Element element, ParserContext pc) {  
        String logoutUrl = null;  
        String successHandlerRef = null;  
        String logoutSuccessUrl = null;  
        String invalidateSession = null;  
  
        BeanDefinitionBuilder builder = BeanDefinitionBuilder.rootBeanDefinition(LogoutFilter.class);  
  
        if (element != null) {  
            //分别解析logout标签的属性  
            Object source = pc.extractSource(element);  
            builder.getRawBeanDefinition().setSource(source);  
            logoutUrl = element.getAttribute(ATT_LOGOUT_URL);  
            successHandlerRef = element.getAttribute(ATT_LOGOUT_HANDLER);  
            WebConfigUtils.validateHttpRedirect(logoutUrl, pc, source);  
            logoutSuccessUrl = element.getAttribute(ATT_LOGOUT_SUCCESS_URL);  
            WebConfigUtils.validateHttpRedirect(logoutSuccessUrl, pc, source);  
            invalidateSession = element.getAttribute(ATT_INVALIDATE_SESSION);  
        }  
  
        if (!StringUtils.hasText(logoutUrl)) {  
            logoutUrl = DEF_LOGOUT_URL;  
        }  
        //向LogoutFilter中注入属性值filterProcessesUrl  
        builder.addPropertyValue("filterProcessesUrl", logoutUrl);  
  
        if (StringUtils.hasText(successHandlerRef)) {  
            if (StringUtils.hasText(logoutSuccessUrl)) {  
                pc.getReaderContext().error("Use " + ATT_LOGOUT_URL + " or " + ATT_LOGOUT_HANDLER + ", but not both",  
                        pc.extractSource(element));  
            }  
            //如果successHandlerRef不为空，就通过构造函数注入到LogoutFilter中  
            builder.addConstructorArgReference(successHandlerRef);  
        } else {  
            // Use the logout URL if no handler set  
            if (!StringUtils.hasText(logoutSuccessUrl)) {  
                //如果logout-success-url没有定义，则采用默认的/  
                logoutSuccessUrl = DEF_LOGOUT_SUCCESS_URL;  
            }  
            //通过构造函数注入logoutSuccessUrl值  
            builder.addConstructorArgValue(logoutSuccessUrl);  
        }  
  
        if (!StringUtils.hasText(invalidateSession)) {  
            invalidateSession = DEF_INVALIDATE_SESSION;  
        }  
        //默认Logout的Handler是SecurityContextLogoutHandler  
        ManagedList handlers = new ManagedList();  
        SecurityContextLogoutHandler sclh = new SecurityContextLogoutHandler();  
        if ("true".equals(invalidateSession)) {  
            sclh.setInvalidateHttpSession(true);  
        } else {  
            sclh.setInvalidateHttpSession(false);  
        }  
        handlers.add(sclh);  
        //如果有remember me服务，需要添加remember的handler  
        if (rememberMeServices != null) {  
            handlers.add(new RuntimeBeanReference(rememberMeServices));  
        }  
        //继续将handlers通过构造参数注入到LogoutFilter的bean中  
        builder.addConstructorArgValue(handlers);  
  
        return builder.getBeanDefinition();  
    }  
```
在`LogoutFilter`的bean实例化时，两个类变量logoutSuccessUrl、List<LogoutHandler> handlers已经通过构造函数注入到LogoutFilter的实例中

接下来，继续看
## doFilter 
```
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {  
    HttpServletRequest request = (HttpServletRequest) req;  
    HttpServletResponse response = (HttpServletResponse) res;  
    
    //判断是否需要退出，主要通过请求的url是否是filterProcessesUrl值来识别  
    if (requiresLogout(request, response)) {  
        //通过SecurityContext实例获取认证信息  
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();  
  
        if (logger.isDebugEnabled()) {  
            logger.debug("Logging out user '" + auth + "' and transferring to logout destination");  
        }  

        this.handler.logout(request, response, auth);

        //退出成功后，进行redirect操作  
        logoutSuccessHandler.onLogoutSuccess(request, response, auth);  
  
        return;  
    }  
  
    chain.doFilter(request, response);  
}  
```
第一个过滤器 `SecurityContextPersistenceFilter` 不是只产生了一个空的`SecurityContext`嘛？
就是一个没有认证信息的 `SecurityContext` 实例 
![](https://upload-images.jianshu.io/upload_images/4685968-22eb81c7009786c6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这个返回的不是null么？产生这个疑问，肯定是被`SecurityContextPersistenceFilter`过滤器分析时误导的

实际上，每个过滤器只处理自己负责的事情，LogoutFilter默认只拦截
`j_spring_security_logout`
这个url
其实退出功能肯定是登录到应用之后才会使用到的，登录对应的Filter肯定会把认证信息添加到SecurityContext中去的，后面再分析。 

## 处理退出任务
![](https://upload-images.jianshu.io/upload_images/4685968-6748fd4ebe2cdccb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这里的handler至少有一个SecurityContextLogoutHandler， 
如果有`remember me`服务搭配，就还有一个Handler

remember me的handler有两种， 
- 如果配置了持久化信息，如（token-repository-ref、data-source-ref属性）
org.springframework.security.web.authentication.rememberme.PersistentTokenBasedRememberMeServices 
![](https://upload-images.jianshu.io/upload_images/4685968-77aeffc622af77f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 如果没有配置
org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices 
![](https://upload-images.jianshu.io/upload_images/4685968-0683b01efad46e72.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

先来看SecurityContextLogoutHandler 
![](https://upload-images.jianshu.io/upload_images/4685968-10aa7dd3533afcb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
完成两个任务
- 让session失效
- 清除SecurityContext实例  

再来看remember me的handler 
1.配置了持久化属性时的handler：PersistentTokenBasedRememberMeServices 
![](https://upload-images.jianshu.io/upload_images/4685968-d28d84a0c9b1a098.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
也完成两个任务
- 清除cookie
- 从持久化中清除remember me数据  

如果定义了token-repository-ref属性，则通过依赖的持久化bean清除  
如果定义了data-source-ref属性，直接通过  
JdbcTokenRepositoryImpl清除数据，也就是执行delete操作 

2.未配置持久化属性的handler：TokenBasedRememberMeServices 
这个handler没有覆盖父类的logout方法，所以直接调用父类的logout方法，仅仅清除cookie 

退出成功后执行onLogoutSuccess操作，完成redirect 
`logoutSuccessHandler.onLogoutSuccess(request, response, auth); `
这个语句是直接redirect到logout标签中的logout-success-url属性定义的url 

至此，整个logoutFilter任务已经完成了，总结一下，主要任务为 
1.从SecurityContext中获取Authentication，然后调用每个handler处理logout 
2.退出成功后跳转到指定的url

- 只处理注销请求，默认为/j_spring_security_logout
- 在用户发送注销请求时，销毁用户Session，清空SecurityContextHolder，然后重定向到注销成功页面。可以与rememberMe之类的机制结合，在注销的同时清空用户Cookie
# 3 AbstractAuthenticationProcessingFilter
![AbstractAuthenticationProcessingFilterler类图](https://upload-images.jianshu.io/upload_images/4685968-d6ad4ec9e1041ca6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f8447d804b6616d6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

处理 Form 模式登录的过滤器
## 3.1 基础
*   Spring Security 验证身份的方式是利用 Filter，再加上 HttpServletRequest 的一些信息进行过滤。
*   类 Authentication 保存的是身份认证信息。
*   类 AuthenticationProvider 提供身份认证途径。
*   类 AuthenticationManager 保存的 AuthenticationProvider 集合，并调用 AuthenticationProvider 进行身份认证
## 3.2 设计模式
### 3.2.1 抽象工厂模式
AbstractAuthenticationProcessingFilter 是一个抽象类，主要的功能是身份认证。OAuth2ClientAuthenticationProcessingFilter（Spring OAuth2）、RememberMeAuthenticationFilter（RememberMe）都继承了 AbstractAuthenticationProcessingFilter ，并重写了方法 attemptAuthentication 进行身份认证。

```
/**
     * Performs actual authentication. 进行真正的认证
     * <p>
     * The implementation should do one of the following: 具体实现需要做如下事情
     * <ol>
     * <li>Return a populated authentication token for the authenticated user, indicating
     * successful authentication</li> 返回一个具体的 Authentication认证对象
     * <li>Return null, indicating that the authentication process is still in progress.
     * Before returning, the implementation should perform any additional work required to
     * complete the process.</li> 返回 null，表示实现的子类不能处理该身份认证，还需要别的类进行身份认证（往 FilterChain 传递）
     * <li>Throw an <tt>AuthenticationException</tt> if the authentication process fails</li> 抛出异常 AuthenticationException 表示认证失败。
     * </ol>
     *
     * @param request from which to extract parameters and perform the authentication
     * @param response the response, which may be needed if the implementation has to do a
     * redirect as part of a multi-stage authentication process (such as OpenID).
     *
     * @return the authenticated user token, or null if authentication is incomplete.
     *
     * @throws AuthenticationException if authentication fails.
     */
    public abstract Authentication attemptAuthentication(HttpServletRequest request,
            HttpServletResponse response) throws AuthenticationException, IOException,
            ServletException;
```
这个方法的目的很明确，就是需要`子类提供身份认证的具体实现`
子类根据 `HttpServletRequest` 等信息进行身份认证，并返回 `Authentication `对象、  ` null  `、    `异常`，分别表示认证成功返回的身份认证信息、需要其他 Filter 继续进行身份认证、认证失败

下面是一个 OAuth2ClientAuthenticationProcessingFilter 对于方法 attemptAuthentication 的实现
```
@Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, IOException, ServletException {

        OAuth2AccessToken accessToken;
        try {
            accessToken = restTemplate.getAccessToken();
        } catch (OAuth2Exception e) {
            BadCredentialsException bad = new BadCredentialsException("Could not obtain access token", e);
            publish(new OAuth2AuthenticationFailureEvent(bad));
            throw bad;            
        }
        try {
            OAuth2Authentication result = tokenServices.loadAuthentication(accessToken.getValue());
            if (authenticationDetailsSource!=null) {
                request.setAttribute(OAuth2AuthenticationDetails.ACCESS_TOKEN_VALUE, accessToken.getValue());
                request.setAttribute(OAuth2AuthenticationDetails.ACCESS_TOKEN_TYPE, accessToken.getTokenType());
                result.setDetails(authenticationDetailsSource.buildDetails(request));
            }
            publish(new AuthenticationSuccessEvent(result));
            return result;
        }
        catch (InvalidTokenException e) {
            BadCredentialsException bad = new BadCredentialsException("Could not obtain user details from token", e);
            publish(new OAuth2AuthenticationFailureEvent(bad));
            throw bad;            
        }

    }
```
`attemptAuthentication `是怎么被调用的？
身份认证流程很简单，但是身份认证完成之前、完成之后，也需要做很多的操作
大部分操作都是一尘不变的，身份认证之前确认是否要进行身份验证、保存身份认证信息、成功处理、失败处理等
具体流程，在下面的方法中体现。可以看出这就是个工厂，已经确定好身份认证的流程，所以我们需要做的事情就是重写身份认证机制（` attemptAuthentication`）即可
```
/**
     * Invokes the
     * {@link #requiresAuthentication(HttpServletRequest, HttpServletResponse)
     * requiresAuthentication} method to determine whether the request is for
     * authentication and should be handled by this filter. If it is an authentication
     * request, the
     * {@link #attemptAuthentication(HttpServletRequest, HttpServletResponse)
     * attemptAuthentication} will be invoked to perform the authentication. There are
     * then three possible outcomes:
     * <ol>
     * <li>An <tt>Authentication</tt> object is returned. The configured
     * {@link SessionAuthenticationStrategy} will be invoked (to handle any
     * session-related behaviour such as creating a new session to protect against
     * session-fixation attacks) followed by the invocation of
     * {@link #successfulAuthentication(HttpServletRequest, HttpServletResponse, FilterChain, Authentication)}
     * method</li>
     * <li>An <tt>AuthenticationException</tt> occurs during authentication. The
     * {@link #unsuccessfulAuthentication(HttpServletRequest, HttpServletResponse, AuthenticationException)
     * unsuccessfulAuthentication} method will be invoked</li>
     * <li>Null is returned, indicating that the authentication process is incomplete. The
     * method will then return immediately, assuming that the subclass has done any
     * necessary work (such as redirects) to continue the authentication process. The
     * assumption is that a later request will be received by this method where the
     * returned <tt>Authentication</tt> object is not null.
     * </ol>
     */
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // 是否需要身份认证
        if (!requiresAuthentication(request, response)) {
            // 不需要身份认证，传递到 FilterChain 继续过滤
            chain.doFilter(request, response);

            return;
        }

        if (logger.isDebugEnabled()) {
            logger.debug("Request is to process authentication");
        }

        Authentication authResult;

        try {
            // 进行身份认证，该方法需要子类重写
            authResult = attemptAuthentication(request, response);
            if (authResult == null) {
                // return immediately as subclass has indicated that it hasn't completed
                // authentication
                return;
            }
            // 身份认证成功，保存 session
            sessionStrategy.onAuthentication(authResult, request, response);
        }
        // 身份认证代码出错
        catch (InternalAuthenticationServiceException failed) {
            logger.error(
                    "An internal error occurred while trying to authenticate the user.",
                    failed);
            // 身份认证失败一系列事物处理，包括调用 RememberMeServices 等
            unsuccessfulAuthentication(request, response, failed);

            return;
        }
        // 身份认证失败异常
        catch (AuthenticationException failed) {
            // Authentication failed
            // 身份认证失败一系列事物处理，包括调用 RememberMeServices 等
            unsuccessfulAuthentication(request, response, failed);

            return;
        }

        // Authentication success
        // 身份认证成功之后是否需要传递到 FilterChain
        if (continueChainBeforeSuccessfulAuthentication) {
            chain.doFilter(request, response);
        }

        // 身份认证成功一系列事物处理，包括调用 RememberMeServices 等
        successfulAuthentication(request, response, chain, authResult);
    }
}
```

### 3.2.2 策略模式
看一下方法 doFilter 的内部调用
 ```
/**
     * Default behaviour for successful authentication.
     * <ol>
     * <li>Sets the successful <tt>Authentication</tt> object on the
     * {@link SecurityContextHolder}</li>
     * <li>Informs the configured <tt>RememberMeServices</tt> of the successful login</li>
     * <li>Fires an {@link InteractiveAuthenticationSuccessEvent} via the configured
     * <tt>ApplicationEventPublisher</tt></li>
     * <li>Delegates additional behaviour to the {@link AuthenticationSuccessHandler}.</li>
     * </ol>
     *
     * Subclasses can override this method to continue the {@link FilterChain} after
     * successful authentication.
     * @param request
     * @param response
     * @param chain
     * @param authResult the object returned from the <tt>attemptAuthentication</tt>
     * method.
     * @throws IOException
     * @throws ServletException
     */
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response, FilterChain chain, Authentication authResult)
            throws IOException, ServletException {

        if (logger.isDebugEnabled()) {
            logger.debug("Authentication success. Updating SecurityContextHolder to contain: "
                    + authResult);
        }

        // 认证成功设置身份认证信息
        SecurityContextHolder.getContext().setAuthentication(authResult);

        // RememberMeServices 设置成功登录信息，如 Cookie 等
        rememberMeServices.loginSuccess(request, response, authResult);

        // 认证成功发送事件
        // Fire event
        if (this.eventPublisher != null) {
            eventPublisher.publishEvent(new InteractiveAuthenticationSuccessEvent(
                    authResult, this.getClass()));
        }

        // 认证成功处理器
        successHandler.onAuthenticationSuccess(request, response, authResult);
    }
```

Spring Security 还是很贴心的把这个方法的修饰符设定成了 protected，以满足我们重写身份认证成功之后的机制，虽然大多数情况下并不需要
不需要的原因是认证成功之后的流程基本最多也就是这样，如果想改变一些行为，可以直接传递给 AbstractAuthenticationProcessingFilter 一些具体实现即可，如 AuthenticationSuccessHandler（认证成功处理器）。根据在这个处理器内可以进行身份修改、返回结果修改等行为。下面是该对象的定义。
![](https://upload-images.jianshu.io/upload_images/4685968-aa15b85fb5e27842.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
各种各样的 AuthenticationSuccessHandler 可以提供多种多样的认证成功行为，这是一种策略模式。
## 3.3 后记
Spring Security 采取了多种设计模式，这是 Spring 家族代码的一贯特性。让人比较着急的是，Spring Security 虽然可以做到开箱即用，但是想要自定义代码的话，必须要熟悉 Spring Security 代码。比如如何使用 RememberMeServices。RememberMeService 有三个方法，登录成功操作、登录失败操作、自动登录操作。你可以重写这些方法，但你如果不看源码，你无法得知这些方法会在什么时候调用、在哪个 Filter 中调用、需要做什么配置。

- 处理form登陆的过滤器，与form登陆有关的所有操作都是在此进行的。
- 默认情况下只处理/j_spring_security_check请求，这个请求应该是用户使用form登陆后的提交地址
- 此过滤器执行的基本操作时，通过用户名和密码判断用户是否有效，如果登录成功就跳转到成功页面（可能是登陆之前访问的受保护页面，也可能是默认的成功页面），如果登录失败，就跳转到失败页面
# 4 DefaultLoginPageGeneratingFilter
![](https://upload-images.jianshu.io/upload_images/4685968-f2dfc0a6c2263a79.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-26c59c33610cffcb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
此过滤器用来生成一个默认的登录页面，默认的访问地址为`/spring_security_login`，这个默认的登录页面虽然支持用户输入用户名，密码，也支持rememberMe功能，但是因为太难看了，只能是在演示时做个样子，不可能直接用在实际项目中
# 5 BasicProcessingFilter
![](https://upload-images.jianshu.io/upload_images/4685968-3e8a4203cd216d35.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
此过滤器用于进行basic验证，功能与AuthenticationProcessingFilter类似，只是验证的方式不同。有关basic验证的详细情况，在后面详细介绍
# 6 SecurityContextHolderAwareRequestFilter
![](https://upload-images.jianshu.io/upload_images/4685968-647e8172d3e562ba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0485cbb83e52673c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
此过滤器用来包装客户的请求。目的是在原始请求的基础上，为后续程序提供一些额外的数据。比如getRemoteUser()时直接返回当前登陆的用户名之类的
# 7 RememberMeProcessingFilter
![](https://upload-images.jianshu.io/upload_images/4685968-d018a5ba85993a0e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
此过滤器实现RememberMe功能，当用户cookie中存在rememberMe的标记，此过滤器会根据标记自动实现用户登陆，并创建SecurityContext，授予对应的权限
# 8 AnonymousProcessingFilter
过滤器的执行顺序图中可以看出该过滤器是在`UsernamePasswordAuthenticationFilter`等过滤器之后，如果它前面的过滤器都没有认证成功，Spring Security则为当前的`SecurityContextHolder`中添加一个`Authenticaiton` 的匿名实现类`AnonymousAuthenticationToken`
![](https://upload-images.jianshu.io/upload_images/4685968-f81c298099107bc3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
为了保证操作统一性，当用户没有登陆时，默认为用户分配匿名用户的权限
```
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		// 1 若之前过滤器都未认证通过，则SecurityContextHolder中Authentication为空
		if (SecurityContextHolder.getContext().getAuthentication() == null) {
			// 2 为当前SecurityContextHolder添加一个匿名的 AnonymousAuthenticationToken
			SecurityContextHolder.getContext().setAuthentication(
					createAuthentication((HttpServletRequest) req));
        ...
		}
		else {
          ...
		}

		chain.doFilter(req, res);
	}

	// 3 创建匿名的 AnonymousAuthenticationToken
	protected Authentication createAuthentication(HttpServletRequest request) {
		AnonymousAuthenticationToken auth = new AnonymousAuthenticationToken(key,principal, authorities);
		auth.setDetails(authenticationDetailsSource.buildDetails(request));

		return auth;
	}
	
	 // 创建一个用户名 anonymousUser  授权ROLE_ANONYMOUS
	public AnonymousAuthenticationFilter(String key) {
		this(key, "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS"));
	}
```
### 执行流程
- 判断SecurityContextHolder中Authentication为否为空
- 如果空则为当前的SecurityContextHolder中添加一个匿名的AnonymousAuthenticationToken（用户名为 anonymousUser 的AnonymousAuthenticationToken）

# 9 ExceptionTranslationFilter
![](https://upload-images.jianshu.io/upload_images/4685968-3ba775fe74f50a6f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3f314f55c64b5389.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
处理FilterSecurityInterceptor抛出的异常，然后将请求重定向到对应页面，或返回对应的响应错误代码
```
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) req;
		HttpServletResponse response = (HttpServletResponse) res;

		try {
			chain.doFilter(request, response);
		}
		catch (Exception ex) {
			// Try to extract a SpringSecurityException from the stacktrace
			// 判断是不是 AuthenticationException
			Throwable[] causeChain = throwableAnalyzer.determineCauseChain(ex);
			RuntimeException ase = (AuthenticationException) throwableAnalyzer
					.getFirstThrowableOfType(AuthenticationException.class, causeChain);

			if (ase == null) {
				// 判断是不是AccessDeniedException
				ase = (AccessDeniedException) throwableAnalyzer.getFirstThrowableOfType(
						AccessDeniedException.class, causeChain);
			}

			if (ase != null) {
				handleSpringSecurityException(request, response, chain, ase);
			}
			else {
				// Rethrow ServletExceptions and RuntimeExceptions as-is
				if (ex instanceof ServletException) {
					throw (ServletException) ex;
				}
				else if (ex instanceof RuntimeException) {
					throw (RuntimeException) ex;
				}

				// Wrap other Exceptions. This shouldn't actually happen
				// as we've already covered all the possibilities for doFilter
				throw new RuntimeException(ex);
			}
		}
	}
```
# 10 SessionFixationProtectionFilter
![](https://upload-images.jianshu.io/upload_images/4685968-ad4353b756685f39.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
防御会话伪造攻击
# 11  FilterSecurityInterceptor
![](https://upload-images.jianshu.io/upload_images/4685968-3636e90651cb2812.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7b508fc6517d5633.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
此过滤器为认证授权过滤器链中最后一个过滤器，该过滤器之后就是请求真正的/persons 服务

用户的权限控制都包含在这个过滤器中
- 如果用户尚未登陆，则抛出`AuthenticationCredentialsNotFoundException`“尚未认证异常”
- 如果用户已登录，但是没有访问当前资源的权限，则抛出`AccessDeniedException`“拒绝访问异常”。
- 如果用户已登录，也具有访问当前资源的权限，则放行
![](https://upload-images.jianshu.io/upload_images/4685968-c6554cbbfb20571a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
public void invoke(FilterInvocation fi) throws IOException, ServletException {
		if ((fi.getRequest() != null) && (fi.getRequest().getAttribute(FILTER_APPLIED) != null) && observeOncePerRequest) {
			// filter already applied to this request and user wants us to observe
			// once-per-request handling, so don't re-do security checking
			fi.getChain().doFilter(fi.getRequest(), fi.getResponse());
		}
		else {
			// first time this request being called, so perform security checking
			if (fi.getRequest() != null) {
				fi.getRequest().setAttribute(FILTER_APPLIED, Boolean.TRUE);
			}
			// 1 before invocation重要
			InterceptorStatusToken token = super.beforeInvocation(fi);

			try {
				// 2 可以理解开始请求真正的 /persons 服务
				fi.getChain().doFilter(fi.getRequest(), fi.getResponse());
			}
			finally {
				super.finallyInvocation(token);
			}
			// 3 after Invocation
			super.afterInvocation(token, null);
		}
	}
```
- 1 before invocation重要
- 2 请求真正的 /persons 服务
- 3 after Invocation
三个部分中，最重要的是 1，该过程中会调用 AccessDecisionManager 来验证当前已认证成功的用户是否有权限访问该资源
### before invocation: AccessDecisionManager
```
protected InterceptorStatusToken beforeInvocation(Object object) {
		...
		Collection<ConfigAttribute> attributes = this.obtainSecurityMetadataSource()
				.getAttributes(object);
		...
		Authentication authenticated = authenticateIfRequired();
		// Attempt authorization
		try {
			// 1 重点
			this.accessDecisionManager.decide(authenticated, object, attributes);
		}
		...
	}
```
`authenticated`就是当前认证的`Authentication`
那么`object` 和`attributes`又是什么呢？
## attributes & object之谜
![](https://upload-images.jianshu.io/upload_images/4685968-e7deba6a977fde68.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b071b286d34326ba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- object为当前请求的` url:/persons`
- `getAttributes`就是使用当前的访问路径去匹配我们自定义的匹配规则
![](https://upload-images.jianshu.io/upload_images/4685968-17c54f72326b20ad.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
0-15返回 permitALL即不需要认证 ,16对应anyRequest返回 authenticated即当前请求需要认证
![](https://upload-images.jianshu.io/upload_images/4685968-9dc8de38ab77ede7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
可以看到当前的authenticated为匿名AnonymousAuthentication用户名为anonymousUser

# 12 FilterChainProxy
![](https://upload-images.jianshu.io/upload_images/4685968-2e9a2a7c3df6db7d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
通过FilterChainProxy的初始化、自定义标签的分析后，Spring Security需要的运行环境已经准备好了。 

这样当用户访问应用时，过滤器就开始工作了。web.xml配置的Filter：org.springframework.web.filter.DelegatingFilterProxy就不介绍了，该类仅仅是初始化一个FilterChainProxy，然后把所有拦截的请求交给FilterChainProxy处理。 

FilterChainProxy的doFilter方法如下 
```
	@Override
	public void doFilter(ServletRequest request, ServletResponse response,FilterChain chain) throws IOException, ServletException {
		boolean clearContext = request.getAttribute(FILTER_APPLIED) == null;
		if (clearContext) {
			try {
				request.setAttribute(FILTER_APPLIED, Boolean.TRUE);
				doFilterInternal(request, response, chain);
			}
			finally {
				SecurityContextHolder.clearContext();
				request.removeAttribute(FILTER_APPLIED);
			}
		}
		else {
			doFilterInternal(request, response, chain);
		}
	}

	private void doFilterInternal(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {

		FirewalledRequest fwRequest = firewall
				.getFirewalledRequest((HttpServletRequest) request);
		HttpServletResponse fwResponse = firewall
				.getFirewalledResponse((HttpServletResponse) response);
        //获取http标签中创建的所有Filter 
		List<Filter> filters = getFilters(fwRequest);

		if (filters == null || filters.size() == 0) {
			if (logger.isDebugEnabled()) {
				logger.debug(UrlUtils.buildRequestUrl(fwRequest)
						+ (filters == null ? " has no matching filters"
								: " has an empty filter list"));
			}

			fwRequest.reset();

			chain.doFilter(fwRequest, fwResponse);

			return;
		}
        //把实际doFilter任务交给VirtualFilterChain处理 
		VirtualFilterChain vfc = new VirtualFilterChain(fwRequest, chain, filters);
		vfc.doFilter(fwRequest, fwResponse);
	}
```
现在来分析VirtualFilterChain的doFilter方法
```
		@Override
		public void doFilter(ServletRequest request, ServletResponse response)
				throws IOException, ServletException {
            //判断过滤器的个数是否与当前位置相等 
			if (currentPosition == size) {
				if (logger.isDebugEnabled()) {
					logger.debug(UrlUtils.buildRequestUrl(firewalledRequest)
							+ " reached end of additional filter chain; proceeding with original chain");
				}

				// Deactivate path stripping as we exit the security filter chain
				this.firewalledRequest.reset();

				originalChain.doFilter(request, response);
			}
			else {
                //当前位置加一
				currentPosition++;
                //根据当前位置从过滤器列表中取出一个Filter  
				Filter nextFilter = additionalFilters.get(currentPosition - 1);

				if (logger.isDebugEnabled()) {
					logger.debug(UrlUtils.buildRequestUrl(firewalledRequest)
							+ " at position " + currentPosition + " of " + size
							+ " in additional filter chain; firing Filter: '"
							+ nextFilter.getClass().getSimpleName() + "'");
				}
                //执行取出Filter的doFilter方法  
				nextFilter.doFilter(request, response, this);
			}
		}
	}
```
注意这里 
![](https://upload-images.jianshu.io/upload_images/4685968-3c470b7a5a9c0cc0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

VirtualFilterChain把自身作为参数传递给doFilter方法，这样doFilter方法最后会调用VirtualFilterChain的doFilter方法，这样控制就又回到了VirtualFilterChain，于是VirtualFilterChain又将当前位置currentPosition前移，调用下一个Filter的doFilter方法。当additionalFilters中所有元素的doFilter都执行完毕，VirtualFilterChain执行fi.getChain().doFilter，而fi.getChain()的值就是FilterChainProxy的doFilter方法中的参数chain的值。 
这样我们就理解了FilterChainProxy是如何处理整个Filter链的了
# 13 AccessDecisionManager 授权
![](https://upload-images.jianshu.io/upload_images/4685968-e029547b90e0a3fa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Spring Security默认使用`AffirmativeBased`实现` AccessDecisionManager  `的` decide `方法以实现授权
```
public void decide(Authentication authentication, Object object,
			Collection<ConfigAttribute> configAttributes) throws AccessDeniedException {
		int deny = 0;
		// 1 调用 AccessDecisionVoter 进行 vote(投票)
		for (AccessDecisionVoter voter : getDecisionVoters()) {
			int result = voter.vote(authentication, object, configAttributes);
            ...
			switch (result) {
			// 1.1 只要有 voter 投票 ACCESS_GRANTED，则直接返回
			case AccessDecisionVoter.ACCESS_GRANTED://1
				return;
			// 1.2 只要有 voter 投票为 ACCESS_DENIED，则计数
			case AccessDecisionVoter.ACCESS_DENIED://-1
				deny++;
				break;
			default:
				break;
			}
		}

		if (deny > 0) {
		// 2 如果有两个以上 AccessDecisionVoter (投票者)投 ACCESS_DENIED，则直接拒绝通过
			throw new AccessDeniedException(messages.getMessage(
					"AbstractAccessDecisionManager.accessDenied", "Access is denied"));
		}
		// To get this far, every AccessDecisionVoter abstained
		checkAllowIfAllAbstainDecisions();
	}
```
## 执行流程
- 调用AccessDecisionVoter 进行vote(投票)
- 只要有投通过（ACCESS_GRANTED）票，则直接判为通过。
- 如果没有投通过则 deny++ ,最后判断if（deny>0 抛出AccessDeniedException（未授权）
![](https://upload-images.jianshu.io/upload_images/4685968-63d04a8bb7c50152.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
到此为止`authentication`当前用户信息，`fl`当前访问的资源路径及`attributes`当前资源路径的决策（是否需要认证）
剩下就是判断当前用户的角色`Authentication.authorites`是否有权限访问决策访问当前资源`fi`
![](https://upload-images.jianshu.io/upload_images/4685968-0a1a75e4b7bb89e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
