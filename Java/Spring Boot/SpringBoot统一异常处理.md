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
