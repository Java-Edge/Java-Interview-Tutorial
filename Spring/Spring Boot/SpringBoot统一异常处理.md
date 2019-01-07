## 统一的响应处理
![](https://upload-images.jianshu.io/upload_images/4685968-2e1bf519944c0be7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 异常处理
![](https://upload-images.jianshu.io/upload_images/4685968-6e883a199e3b315b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 2 统一响应处理的开发
![](https://upload-images.jianshu.io/upload_images/4685968-67f070c747403897.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3cbeae097d4670c8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ec58ed7b6e7f0d11.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a507f0189bfb560b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 删除 src 目录,修改 pom 文件,只用作管理系统业务层代码
![](https://upload-images.jianshu.io/upload_images/4685968-2f317666e38efa42.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a51cb6c0c9ff5508.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-104bc27ca779a529.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d12ba26af1127250.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-630c908c1d94823f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 小技巧,先创建一个临时文件,再创建包就不会出现级联现象
![](https://upload-images.jianshu.io/upload_images/4685968-9d926f20c7f9aae2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-94a2b42354cb39eb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 有的类与方法不需要全局响应,应当排除,特设此注解
![](https://upload-images.jianshu.io/upload_images/4685968-0771b9a094d73189.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 3 统一异常处理的开发
![](https://upload-images.jianshu.io/upload_images/4685968-8854f0cb7023d551.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 4 统一配置的开发
![](https://upload-images.jianshu.io/upload_images/4685968-6bb685e42c95e09f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# BasicErrorController
SpringBoot内置了一个BasicErrorController对异常进行统一的处理，当在页面发生异常的时候会自动把请求转到/error(Spring Boot提供的一个默认的映射) 
，可以自定义页面内容，只需在classpath路径下新建error页面即可。当然我们也可以自定义error页面的路径 
如:
`server.error.path=/custom/error
BasicErrorController提供两种返回错误一种是页面返回、当你是页面请求的时候就会返回页面，另外一种是json请求的时候就会返回json错误

可以查看源码。

# 定义全局异常处理类：并用@ControllerAdvice注解
- 返回视图，新建方法defaultErrorHandler 用@ExceptionHandler注解
- 返回JSON，新建方法 用jsonErrorHandler 用@ExceptionHandler和@ResponseBody（必须）注解
![](https://upload-images.jianshu.io/upload_images/4685968-702bf9d222304e9b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#自定义异常类，继承Exception（或RuntimeException）
![](https://upload-images.jianshu.io/upload_images/4685968-010fd9a4f76fb914.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#页面
![](https://upload-images.jianshu.io/upload_images/4685968-a760a4fe8a240d5b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
