# 错误场景![](https://img-blog.csdnimg.cn/e2023dfa73674c659fe29797527f1a26.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
验证请求的Token合法性的Filter。Token校验失败时，直接抛自定义异常，移交给Spring处理：
![](https://img-blog.csdnimg.cn/122fe2d581fc4684a2ad6deb491987e7.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
![](https://img-blog.csdnimg.cn/016ce84b7da3488fa65148e1e9a27ee7.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
![](https://img-blog.csdnimg.cn/87e550844437408f88f254387b0b2cd6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
测试HTTP请求：
![](https://img-blog.csdnimg.cn/18d36bd55d484550a4ad5bbee58fa49c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
日志输出如下：说明**IllegalRequestExceptionHandler**未生效。
![](https://img-blog.csdnimg.cn/81a7b9c33b7b48b5bc4353d11f6a4089.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
why？
这就需要精通Spring异常处理流程了。
# 解析
![](https://img-blog.csdnimg.cn/2c00379066d1490891b909c4013d1fdf.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
当所有Filter被执行完毕，Spring才会处理Servlet相关，而**DispatcherServlet**才是整个Servlet处理核心，它是前端控制器设计模式，提供 Spring Web MVC 的集中访问点并负责职责的分派。

在这，Spring处理了请求和处理器的对应关系及**统一异常处理**。

Filter内异常无法被统一处理，就是因为异常处理发生在 ***DispatcherServlet#doDispatch()***
![](https://img-blog.csdnimg.cn/13642402d76c4f2fbadf4da28d7239c4.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
但此时，**过滤器已全部执行完**。
# Spring异常统一处理
## ControllerAdvice如何被Spring加载并对外暴露？
#### WebMvcConfigurationSupport#handlerExceptionResolver()
实例化并注册一个ExceptionHandlerExceptionResolver 的实例
![](https://img-blog.csdnimg.cn/32e6572a6cfd4d93bacc992871875f24.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
最终按下图调用栈，Spring 实例化了ExceptionHandlerExceptionResolver类。
![](https://img-blog.csdnimg.cn/2055644a405542698006d57e0fba1f50.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
ExceptionHandlerExceptionResolver实现了**InitializingBean**
![](https://img-blog.csdnimg.cn/916c98b8d2dc4144b3ba690d27f19091.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
重写 ***afterPropertiesSet()*** ![](https://img-blog.csdnimg.cn/09a7b4e7ca2b48ef811b35f3c90089f1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
#### initExceptionHandlerAdviceCache
完成所有 ControllerAdvice 中的ExceptionHandler 初始化：查找所有 **@ControllerAdvice** 注解的 Bean，把它们放入exceptionHandlerAdviceCache。
这里即指自定义的IllegalRequestExceptionHandler
![](https://img-blog.csdnimg.cn/c1102552aa0a4d478d2ed537ba72cf61.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
![](https://img-blog.csdnimg.cn/184207f02e31465ba45de946e5a1b73c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
所有被 **@ControllerAdvice** 注解的异常处理器，都会在 **ExceptionHandlerExceptionResolver** 实例化时自动扫描并装载在其exceptionHandlerAdviceCache。
#### initHandlerExceptionResolvers
当第一次请求发生时，***DispatcherServlet#initHandlerExceptionResolvers()*** 将获取所有注册到 Spring 的 HandlerExceptionResolver 实例（ExceptionHandlerExceptionResolver正是），存到**handlerExceptionResolvers**
![](https://img-blog.csdnimg.cn/9560e3a409254a82af3b655a12fe24cb.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
![](https://img-blog.csdnimg.cn/be51ad0247c24552837631caf23b2004.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
## ControllerAdvice如何被Spring消费并处理异常？
### DispatcherServlet
#### doDispatch()
![](https://img-blog.csdnimg.cn/90c9d7b1254b49da8f865323eeb5e42a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
执行用户请求时，当查找、执行请求对应的 handler 过程中异常时：
1. 会把异常值赋给 dispatchException
2. 再移交 processDispatchResult()
#### processDispatchResult
![](https://img-blog.csdnimg.cn/287b3c8dae8e48c4a5ec8dccc7143dad.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
当Exception非空时，继续移交
#### processHandlerException
![](https://img-blog.csdnimg.cn/6b18557adc6844adaaac2562955ef9ef.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
从 handlerExceptionResolvers 获取有效的异常解析器以解析异常。

这里的 handlerExceptionResolvers 一定包含声明的IllegalRequestExceptionHandler#IllegalRequestException 的异常处理器的 ExceptionHandlerExceptionResolver 包装类。
# 修正
为利用到 Spring MVC 的异常处理机制，改造Filter：
- 手动捕获异常
- 将异常通过  HandlerExceptionResolver 进行解析处理

据此，修改 PermissionFilter，注入 HandlerExceptionResolver：
![](https://img-blog.csdnimg.cn/1b50cf3672214f418f908fd8f736a120.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
然后，在 doFilter 捕获异常并移交 HandlerExceptionResolver：
![](https://img-blog.csdnimg.cn/b83601b115024554854786652e2a2f92.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
现在再用错误 Token 请求，日志输出如下：
![](https://img-blog.csdnimg.cn/0f7cb17d0ccb4b3caf84ff6c78227656.png) 响应体：
![](https://img-blog.csdnimg.cn/e69723db189b4eca9231dc06fe3c7059.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)