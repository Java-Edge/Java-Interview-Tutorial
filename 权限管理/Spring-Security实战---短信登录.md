# 0 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
## 1.[Java开发技术交流Q群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)

## 2.[完整博客链接](https://blog.csdn.net/qq_33589510)

## 3.[个人知乎](http://www.zhihu.com/people/shi-shu-sheng-)

## 4.[gayhub](https://github.com/Wasabi1234)

# [相关源码](https://github.com/Wasabi1234/Security)

在[Spring Security实战-认证](https://www.jianshu.com/p/04d107db075d)和[Spring Security实战(二)-授权(权限过滤器)](https://www.jianshu.com/p/a3630169351e)两章中.
我们已经详细解读过`Spring Security`如何处理用户名和密码登录
本文我们将仿照用户名密码来显示短信登录

# 项目文件结构
![](https://upload-images.jianshu.io/upload_images/4685968-51654f238e928134.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1 SmsCodeAuthenticationFilter
![](https://upload-images.jianshu.io/upload_images/4685968-b03d6005d3f5bb06.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
对应用户名密码登录的`UsernamePasswordAuthenticationFilter` 
同继承`AbstractAuthenticationProcessingFilter`
![](https://upload-images.jianshu.io/upload_images/4685968-143830f6061389a7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 认证请求的方法必须为`POST`
- 从request中获取手机号
- 封装成自己的`Authenticaiton`的实现类`SmsCodeAuthenticationToken（未认证）`
调用 `AuthenticationManager` 的 `authenticate `方法进行验证（即`SmsCodeAuthenticationProvider`）
# 2 SmsCodeAuthenticationToken
对应用户名密码登录的`UsernamePasswordAuthenticationToken`
![](https://upload-images.jianshu.io/upload_images/4685968-433753dbb1fb4eb8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# SmsCodeAuthenticationProvider
对应用户名密码登录的`DaoAuthenticationProvider`
![](https://upload-images.jianshu.io/upload_images/4685968-872c54cb7d6679a7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# SmsCodeAuthenticationSecurityConfig
短信登录配置
![](https://upload-images.jianshu.io/upload_images/4685968-ce892d46796646a5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# MerryyouSecurityConfig 
主配置文件
![](https://upload-images.jianshu.io/upload_images/4685968-43efae8b03ddac4c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d66f907a00af1daa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-68c90ecacaf6e6f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-db8b288771e0db52.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
