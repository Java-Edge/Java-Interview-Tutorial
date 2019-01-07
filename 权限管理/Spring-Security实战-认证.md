# 0 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
## 1.[Java开发技术交流Q群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## 2.[完整博客链接](https://blog.csdn.net/qq_33589510)

## 3.[个人知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## 4.[gayhub](https://github.com/Wasabi1234)

# [相关源码](https://github.com/Wasabi1234/Security)

# 核心验证器
## AuthenticationManager
提供了认证方法的入口，接收一个Authentiaton对象作为参数
![](https://upload-images.jianshu.io/upload_images/4685968-5fcf60940d107440.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-caaeabc3589b8136.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## ProviderManager
`AuthenticationManager `的一个实现类
![](https://upload-images.jianshu.io/upload_images/4685968-12d4df65060fa60e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
提供了基本的认证逻辑和方法
它包含了一个` List<AuthenticationProvider> `对象
![](https://upload-images.jianshu.io/upload_images/4685968-c095d20420801dbe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
通过 `AuthenticationProvider `接口来扩展出不同的认证提供者(当Spring Security默认提供的实现类不能满足需求的时候可以扩展AuthenticationProvider 覆盖supports(Class<?> authentication) 方法)
# 验证逻辑
- `AuthenticationManager `接收 `Authentication `对象作为参数，并通过 `authenticate(Authentication) `方法对之验证
- `AuthenticationProvider`实现类用来支撑对 `Authentication `对象的验证动作
- `UsernamePasswordAuthenticationToken`实现了`Authentication`主要是将用户输入的用户名和密码进行封装，并供给 `AuthenticationManager `进行验证
验证完成以后将返回一个认证成功的 Authentication 对象
# Authentication
Authentication接口中的主要方法
```
public interface Authentication extends Principal, Serializable {
	// 权限集合，可使用AuthorityUtils.commaSeparatedStringToAuthorityList("admin,ROLE_ADMIN")返回字符串权限集合
	Collection<? extends GrantedAuthority> getAuthorities();
	// 用户名密码认证时可以理解为密码
	Object getCredentials();
	// 认证请求包含的一些附加信息(如 IP 地址,数字证书号)
	Object getDetails();
	// 用户名密码认证时可理解为用户名
	Object getPrincipal();
	// 是否被认证
	boolean isAuthenticated();
	// 设置是否能被认证
	void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException;
```
# ProviderManager
`AuthenticationManager`的实现类，提供了基本认证实现逻辑和流程
```
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		// 1.获取当前的Authentication的认证类型
		Class<? extends Authentication> toTest = authentication.getClass();
		AuthenticationException lastException = null;
		Authentication result = null;
		boolean debug = logger.isDebugEnabled();
		
        // 2.遍历所有的 providers 使用 supports 方法判断该 provider 是否支持当前的认证类型
		for (AuthenticationProvider provider : getProviders()) {
			if (!provider.supports(toTest)) {
				continue;
			}

			if (debug) {
				logger.debug("Authentication attempt using "
						+ provider.getClass().getName());
			}

			try {
				// 3.若支持,调用 provider#authenticat 认证
				result = provider.authenticate(authentication);

				if (result != null) {
					// 4.认证通过则重新生成 Authentication 对应的 Token
					copyDetails(authentication, result);
					break;
				}
			}
			catch (AccountStatusException e) {
				prepareException(e, authentication);
				// SEC-546: Avoid polling additional providers if auth failure is due to
				// invalid account status
				throw e;
			}
			catch (InternalAuthenticationServiceException e) {
				prepareException(e, authentication);
				throw e;
			}
			catch (AuthenticationException e) {
				lastException = e;
			}
		}

		if (result == null && parent != null) {
			// Allow the parent to try.
			try {
				// 5.如果 1 没有验证通过，则使用父类 AuthenticationManager 进行验证
				result = parent.authenticate(authentication);
			}
			catch (ProviderNotFoundException e) {
				// ignore as we will throw below if no other exception occurred prior to
				// calling parent and the parent
				// may throw ProviderNotFound even though a provider in the child already
				// handled the request
			}
			catch (AuthenticationException e) {
				lastException = e;
			}
		}
		// 6. 是否查出敏感信息
		if (result != null) {
			if (eraseCredentialsAfterAuthentication
					&& (result instanceof CredentialsContainer)) {
				// Authentication is complete. Remove credentials and other secret data
				// from authentication
				((CredentialsContainer) result).eraseCredentials();
			}

			eventPublisher.publishAuthenticationSuccess(result);
			return result;
		}

		// Parent was null, or didn't authenticate (or throw an exception).

		if (lastException == null) {
			lastException = new ProviderNotFoundException(messages.getMessage(
					"ProviderManager.providerNotFound",
					new Object[] { toTest.getName() },
					"No AuthenticationProvider found for {0}"));
		}

		prepareException(lastException, authentication);

		throw lastException;
	}
```
- 遍历所有的 Providers，然后依次执行该 Provider 的验证方法
    - 如果某一个 Provider 验证成功，跳出循环不再执行后续的验证
    - 如果验证成功，会将返回的 result 即 Authentication 对象进一步封装为 Authentication Token,比如 UsernamePasswordAuthenticationToken、RememberMeAuthenticationToken 等
这些 Authentication Token 也都继承自 Authentication 对象
- 如果 1 没有任何一个 Provider 验证成功，则试图使用其 parent Authentication Manager 进行验证
- 是否需要擦除密码等敏感信息
# AuthenticationProvider
![](https://upload-images.jianshu.io/upload_images/4685968-ffd10f03926e2bc4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
`AuthenticationProvider `本身也就是一个接口
它的实现类`AbstractUserDetailsAuthenticationProvider` 和`AbstractUserDetailsAuthenticationProvider`的子类`DaoAuthenticationProvider` 
是Spring Security中一个核心的Provider,对所有的数据库提供了基本方法和入口
## DaoAuthenticationProvider
![](https://upload-images.jianshu.io/upload_images/4685968-b0e7f914f3d81137.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
主要做了以下事情
### 对用户身份进行加密
 1.可直接返回BCryptPasswordEncoder
也可自己实现该接口使用自己的加密算法
![](https://upload-images.jianshu.io/upload_images/4685968-4a07decbf9022c46.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-85b017505411284b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 实现了 AbstractUserDetailsAuthenticationProvider 两个抽象方法
#### 获取用户信息的扩展点
![](https://upload-images.jianshu.io/upload_images/4685968-9a9efbf34aa5b9bb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### 实现 additionalAuthenticationChecks 的验证方法(主要验证密码)
![](https://upload-images.jianshu.io/upload_images/4685968-3df9f4d9fb0b4169.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## AbstractUserDetailsAuthenticationProvider
AbstractUserDetailsAuthenticationProvider为DaoAuthenticationProvider提供了基本的认证方法
```
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		Assert.isInstanceOf(UsernamePasswordAuthenticationToken.class, authentication,
				messages.getMessage(
						"AbstractUserDetailsAuthenticationProvider.onlySupports",
						"Only UsernamePasswordAuthenticationToken is supported"));

		// Determine username
		String username = (authentication.getPrincipal() == null) ? "NONE_PROVIDED"
				: authentication.getName();

		boolean cacheWasUsed = true;
		UserDetails user = this.userCache.getUserFromCache(username);

		if (user == null) {
			cacheWasUsed = false;

			try {
				#1.获取用户信息由子类实现即DaoAuthenticationProvider
				user = retrieveUser(username,
						(UsernamePasswordAuthenticationToken) authentication);
			}
			catch (UsernameNotFoundException notFound) {
				logger.debug("User '" + username + "' not found");

				if (hideUserNotFoundExceptions) {
					throw new BadCredentialsException(messages.getMessage(
							"AbstractUserDetailsAuthenticationProvider.badCredentials",
							"Bad credentials"));
				}
				else {
					throw notFound;
				}
			}

			Assert.notNull(user,
					"retrieveUser returned null - a violation of the interface contract");
		}

		try {
			#2.前检查由DefaultPreAuthenticationChecks类实现（主要判断当前用户是否锁定，过期，冻结User接口）
			preAuthenticationChecks.check(user);
			#3.子类实现
			additionalAuthenticationChecks(user,
					(UsernamePasswordAuthenticationToken) authentication);
		}
		catch (AuthenticationException exception) {
			if (cacheWasUsed) {
				// There was a problem, so try again after checking
				// we're using latest data (i.e. not from the cache)
				cacheWasUsed = false;
				user = retrieveUser(username,
						(UsernamePasswordAuthenticationToken) authentication);
				preAuthenticationChecks.check(user);
				additionalAuthenticationChecks(user,
						(UsernamePasswordAuthenticationToken) authentication);
			}
			else {
				throw exception;
			}
		}
		#4.检测用户密码是否过期对应#2 的User接口
		postAuthenticationChecks.check(user);

		if (!cacheWasUsed) {
			this.userCache.putUserInCache(user);
		}

		Object principalToReturn = user;

		if (forcePrincipalAsString) {
			principalToReturn = user.getUsername();
		}

		return createSuccessAuthentication(principalToReturn, authentication, user);
	}
```

AbstractUserDetailsAuthenticationProvider主要实现了AuthenticationProvider的接口方法 authenticate 并提供了相关的验证逻辑；

- 获取用户返回UserDetails AbstractUserDetailsAuthenticationProvider定义了一个抽象的方法
![](https://upload-images.jianshu.io/upload_images/4685968-fde5d799c0b0ed16.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 三步验证工作
`preAuthenticationChecks`
`additionalAuthenticationChecks`（抽象方法，子类实现）
`postAuthenticationChecks`
- 将已通过验证的用户信息封装成 `UsernamePasswordAuthenticationToken `对象返回
该对象封装了用户的身份信息，以及相应的权限信息
![](https://upload-images.jianshu.io/upload_images/4685968-e411f697f841a53b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# UserDetailsService
UserDetailsService是一个接口，提供了一个方法
![](https://upload-images.jianshu.io/upload_images/4685968-ae8159ecf66ecf34.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
通过用户名` username` 调用` loadUserByUsername `返回了一个`UserDetails`接口对象（对应AbstractUserDetailsAuthenticationProvider的三步验证方法）
![](https://upload-images.jianshu.io/upload_images/4685968-303f42bacc1fab9b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Spring 为UserDetailsService提供了一个默认实现类 
![](https://upload-images.jianshu.io/upload_images/4685968-569504ddcf72a9b4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-faac61aec991bced.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## JdbcUserDetailsManager
该实现类主要是提供基于JDBC对 User 进行增、删、查、改的方法
![](https://upload-images.jianshu.io/upload_images/4685968-118aca9943775fe2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## InMemoryUserDetailsManager
该实现类主要是提供基于内存对 User 进行增、删、查、改的方法
![](https://upload-images.jianshu.io/upload_images/4685968-dd6a14877f89431e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-cc160eef09490d27.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 总结
`UserDetailsService`接口作为桥梁，是`DaoAuthenticationProvier`与特定用户信息来源进行解耦的地方
`UserDetailsService`由`UserDetails和UserDetailsManager`所构成
`UserDetails`和`UserDetailsManager`各司其责，一个是对基本用户信息进行封装，一个是对基本用户信息进行管理；

特别注意，UserDetailsService、UserDetails以及UserDetailsManager都是可被用户自定义的扩展点，我们可以继承这些接口提供自己的读取用户来源和管理用户的方法
比如我们可以自己实现一个 与特定 ORM 框架，比如 Mybatis，相关的UserDetailsService和UserDetailsManager
![](https://upload-images.jianshu.io/upload_images/4685968-3096a1cb87b305f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![Spring Security认证流程类图](https://upload-images.jianshu.io/upload_images/4685968-2637d4f15987caca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
