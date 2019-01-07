# 0 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
## 1.[Java开发技术交流Q群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## 2.[完整博客链接](https://blog.csdn.net/qq_33589510)

## 3.[个人知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## 4.[gayhub](https://github.com/Wasabi1234)

# [相关源码](https://github.com/Wasabi1234/Security)

>有个用户初访并登录了你的网站，然而第二天又来了，却必须再次登录
于是就有了“记住我”这样的功能来方便用户使用，然而有一件不言自明的事情，那就是这种认证状态的”旷日持久“早已超出了用户原本所需要的使用范围
这意味着，他们可以关闭浏览器，然后再关闭电脑，下周或者下个月，乃至更久以后再回来，只要这间隔时间不要太离谱，该网站总会知道谁是谁，并一如既往的为他们提供所有相同的功能和服务——与许久前他们离开的时候别无二致。

# 1 基本原理
![](https://upload-images.jianshu.io/upload_images/4685968-317096f60360168a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 用户认证成功之后调用`RemeberMeService`根据用户名名生成Token由`TokenRepository`写到数据库，同时也将Token写入到浏览器的Cookie中
- 重启服务之后，用户再次登入系统会由`RememberMeAuthenticationFilter`过滤，从Cookie中读取Token信息,与`persistent_logins`表匹配判断是否使用记住我功能
- 最后由`UserDetailsService`查询用户信息
# 2 实现
## 2.1 建表
![](https://upload-images.jianshu.io/upload_images/4685968-a771e5f9457443fa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 2.2 登陆页面添加记住我复选框
name须为remeber-me
![](https://upload-images.jianshu.io/upload_images/4685968-0b32d1c0a7aff542.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9e86ec2dddc32601.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9c6c6de2156d5c45.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 2.3 配置 MerryyouSecurityConfig
![](https://upload-images.jianshu.io/upload_images/4685968-f98c18fb31ee9f5a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 3 效果
![](https://upload-images.jianshu.io/upload_images/4685968-b368a69213ba1549.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4a305b038a3f24dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 4 源码分析
## 4.1 首次登录
`AbstractAuthenticationProcessingFilter#successfulAuthentication`
![](https://upload-images.jianshu.io/upload_images/4685968-e16c3c70ba65b3d3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        ...
		// 1 将已认证过的Authentication置于SecurityContext
		SecurityContextHolder.getContext().setAuthentication(authResult);
		// 2 登录成功调用rememberMeServices
		rememberMeServices.loginSuccess(request, response, authResult);

		// Fire event
		if (this.eventPublisher != null) {
			eventPublisher.publishEvent(new InteractiveAuthenticationSuccessEvent(
					authResult, this.getClass()));
		}

		successHandler.onAuthenticationSuccess(request, response, authResult);
	}
```
## AbstractRememberMeServices#loginSuccess
![](https://upload-images.jianshu.io/upload_images/4685968-ad0b62d5cea345e7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- .判断是否勾选记住我
![](https://upload-images.jianshu.io/upload_images/4685968-0ad4a507703fc377.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
   protected void onLoginSuccess(HttpServletRequest request,
			HttpServletResponse response, Authentication successfulAuthentication) {
		// 1 获取用户名
		String username = successfulAuthentication.getName();
		// 2 创建Token
		PersistentRememberMeToken persistentToken = new PersistentRememberMeToken(username, generateSeriesData(), generateTokenData(), new Date());
		try {
			// 3 存 DB
			tokenRepository.createNewToken(persistentToken);
			// 4 写到浏览器的Cookie
			addCookie(persistentToken, request, response);
		}
		catch (Exception e) {
			logger.error("Failed to save persistent token ", e);
		}
	}
```
# 二次登录Remember-me
## RememberMeAuthenticationFilter#doFilter
```
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) req;
		HttpServletResponse response = (HttpServletResponse) res;
		// 1 判断SecurityContext中有无Authentication
		if (SecurityContextHolder.getContext().getAuthentication() == null) {
			// 2 从Cookie查询用户信息返回RememberMeAuthenticationToken
			Authentication rememberMeAuth = rememberMeServices.autoLogin(request,
					response);

			if (rememberMeAuth != null) {
				// Attempt authenticaton via AuthenticationManager
				try {
					// 3 如果不为空则由authenticationManager认证
					rememberMeAuth = authenticationManager.authenticate(rememberMeAuth);

					// Store to SecurityContextHolder
					SecurityContextHolder.getContext().setAuthentication(rememberMeAuth);

					onSuccessfulAuthentication(request, response, rememberMeAuth);
......
```
## AbstractRememberMeServices#autoLogin
![](https://upload-images.jianshu.io/upload_images/4685968-859c92a22f978375.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
public final Authentication autoLogin(HttpServletRequest request, HttpServletResponse response) {
     // 1 获取Cookie
     String rememberMeCookie = extractRememberMeCookie(request);
     if (rememberMeCookie == null) {
         return null;
     }

     if (rememberMeCookie.length() == 0) {
         logger.debug("Cookie was empty");
         cancelCookie(request, response);
         return null;
     }

     UserDetails user = null;

     try {
         // 2 解析Cookie
         String[] cookieTokens = decodeCookie(rememberMeCookie);
         // 3 获取用户凭证
         user = processAutoLoginCookie(cookieTokens, request, response);
         // 4 检查用户凭证
         userDetailsChecker.check(user);

         logger.debug("Remember-me cookie accepted");
         // 5 返回Authentication
         return createSuccessfulAuthentication(request, user);
     }
     ...
     cancelCookie(request, response);
     return null;
 }
```
