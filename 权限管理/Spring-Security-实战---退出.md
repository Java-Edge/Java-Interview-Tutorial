# 原理
1.  清除`Cookie`
2.  清除当前用户的`remember-me`记录
3.  使当前`session`失效
4.  清空当前的`SecurityContext`
5.  重定向到登录界面

`Spring Security`的退出请求（默认为`/logout`）由LogoutFilter过滤器拦截处理
# 实现
## 主页中添加退出链接
![](https://upload-images.jianshu.io/upload_images/4685968-0935915e58eaa3ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 配置MerryyouSecurityConfig
![](https://upload-images.jianshu.io/upload_images/4685968-a0fe80f3ad1291e1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 源码分析
## LogoutFilter#doFilter
```
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) req;
		HttpServletResponse response = (HttpServletResponse) res;
		// 1 匹配到/logout请求
		if (requiresLogout(request, response)) {
			Authentication auth = SecurityContextHolder.getContext().getAuthentication();
			// 2 清空Cookie、remember-me、session和SecurityContext
			this.handler.logout(request, response, auth);
			// 3 重定向到注册界面
			logoutSuccessHandler.onLogoutSuccess(request, response, auth);

			return;
		}

		chain.doFilter(request, response);
	}
```
![](https://upload-images.jianshu.io/upload_images/4685968-68d584c2060e53e4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- CookieClearingLogoutHandler清空Cookie
- PersistentTokenBasedRememberMeServices清空remember-me
- SecurityContextLogoutHandler 使当前session无效,清空当前的SecurityContext

![](https://upload-images.jianshu.io/upload_images/4685968-b8f83102ce2029ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## CookieClearingLogoutHandler#logout
![Cookie置为null](https://upload-images.jianshu.io/upload_images/4685968-beadce230a951c53.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## PersistentTokenBasedRememberMeServices#logout
![清空persistent_logins表中记录](https://upload-images.jianshu.io/upload_images/4685968-cdd72f2cbf485af4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## SecurityContextLogoutHandler#logout
使当前session失效
清空当前的SecurityContext
![](https://upload-images.jianshu.io/upload_images/4685968-29ae7f79f97c13da.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## AbstractAuthenticationTargetUrlRequestHandler#handle
获取配置的跳转地址
跳转请求
![](https://upload-images.jianshu.io/upload_images/4685968-8811937c5d90d67b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
