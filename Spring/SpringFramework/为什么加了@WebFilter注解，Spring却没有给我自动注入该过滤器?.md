在 Spring 编程中，主要配合如下注解构建过滤器：
-  @ServletComponentScan
- @WebFilter

那这看起来只是用上这俩注解就能继续摸鱼了呀。但上了生产后，还是能遇到花式问题：
- 工作不起来
- 顺序不对
- 执行多次等

大多因为想当然觉得使用简单，没有上心。还是有必要精通过滤器执行的流程和原理。
# @WebFilter 过滤器无法被自动注入
为统计接口耗时，实现一个过滤器：
![](https://img-blog.csdnimg.cn/e1f8f6ce7b4c47cab322388c54309807.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
该过滤器标记了 **@WebFilter**。所以启动程序加上扫描注解 **@ServletComponentScan** 让其生效：
![](https://img-blog.csdnimg.cn/6aef56e0ecf742aba96c9a3a83353992.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
然后，提供一个 UserController：
![](https://img-blog.csdnimg.cn/6a4d432b3f9b4232a8abf44e8c35a697.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
发现应用启动失败
![](https://img-blog.csdnimg.cn/7d5b595b43024955aa17314dd55f7890.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
TimeCostFilter 看起来是个普通 Bean啊，为何不能被自动注入？
# 源码解析
本质上，过滤器被 **@WebFilter** 修饰后，TimeCostFilter 只会被包装为 FilterRegistrationBean，而 TimeCostFilter 本身只会作为一个 InnerBean 被实例化，这意味着 TimeCostFilter 实例并不会作为 Bean 注册到 Spring 容器。
![](https://img-blog.csdnimg.cn/6af1a896b40b48e7997aab35fe393ef1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
所以当我们想自动注入 TimeCostFilter 时，就会失败。知道这个结论后，我们可以带着两个问题去理清一些关键的逻辑：
### FilterRegistrationBean 是什么？它是如何被定义的
javax.servlet.annotation.WebFilter
![](https://img-blog.csdnimg.cn/d50c1424b7ca4aedaeb5c176d108246c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
所以它不属 Spring，而是 Servlet 规范。
Spring Boot 项目使用它时，Spring Boot 使用了 `org.springframework.boot.web.servlet.FilterRegistrationBean` 包装 @WebFilter 标记的实例。
实现上来说，即 FilterRegistrationBean#Filter 属性就是 @WebFilter 标记的实例。这点我们可以从之前给出的截图中看出端倪。

定义一个 Filter 类时，我们可能想的是，会自动生成它的实例，然后以 Filter 的名称作为 Bean 名来指向它。
但调试发现，在 Spring Boot 中，Bean 名字确实是对的，只是 Bean 实例其实是 FilterRegistrationBean。

> 这 FilterRegistrationBean 最早是如何获取的呢？

得追溯到 @WebFilter 注解是如何被处理的。
### @WebFilter 是如何工作的
使用 **@WebFilter** 时，Filter 被加载有两个条件：
- 声明了 **@WebFilter**
- 在能被 **@ServletComponentScan** 扫到的路径下

直接搜索对 **@WebFilter** 的使用，可发现 **WebFilterHandler** 使用了它：
![](https://img-blog.csdnimg.cn/f54dc1da4efb42088f36b65cd49dc4d1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
因此，我们选择在 **doHandle()** 打断点
![](https://img-blog.csdnimg.cn/3f62fe089b9b4b56a89c2ff3fd44ab74.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
debug启动，观察调用栈：
![](https://img-blog.csdnimg.cn/a3a423af4efb4123bef27cddd97f0997.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
可见对 **@WebFilter** 的处理是在SB启动时，在**ServletComponentRegisteringPostProcessor**被触发，实现对如下注解的的扫描和处理：
-  **@WebFilter**
- **@WebListener**
- **@WebServlet** 

WebFilterHandler则负责处理 **@WebFilter** 的使用：

最后，**WebServletHandler** 通过父类 **ServletComponentHandler** 的模版方法模式，处理了所有被 **@WebFilter** 注解的类：
![](https://img-blog.csdnimg.cn/c87248e1484644efb912bf3e74513419.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)可见最终注册的 FilterRegistrationBean就是自定义的WebFilter。

看第二个问题：
# 何时实例化TimeCostFilter
TimeCostFilter 是何时实例化的呢？为什么它没有成为一个普通 Bean?
可在 TimeCostFilter 构造器中加断点，便于快速定位初始化时机：
![](https://img-blog.csdnimg.cn/5e0390b6343046a6812e69da17266688.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
结合源码，可发现：
- Tomcat 启动时（***onstartUp***），才会创建 FilterRegistrationBean
- FilterRegistrationBean 在被创建时（***createBean***）会创建 **TimeCostFilter** 装配自身，而 **TimeCostFilter** 是通过 ***ResolveInnerBean*** 创建的
- **TimeCostFilter** 实例最终是一种 **InnerBean**
![](https://img-blog.csdnimg.cn/4e37161a2335439da027266872c8118f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

所以最终 TimeCostFilter 实例是一种 **InnerBean**，也就无法自动注入了。
# 修正
找到根因，就知道如何解决了。

前文解析可知，使用 **@WebFilter** 修饰过滤器时，TimeCostFilter 类型的 Bean 并没有注册至 Spring 容器，真正注册的是 FilterRegistrationBean。
考虑到还可能存在多个 Filter，可这样修改：
![](https://img-blog.csdnimg.cn/a233451d6ac14ffe9154042be51aa677.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
- 注入 **FilterRegistrationBean** 类型，而非 **TimeCostFilter** 类型
- 注入的名称是包含包名的全限定名，不能直接用 `TimeCostFilter`，以便存在多个过滤器时，能精确匹配。

# 总结
**@WebFilter** 这种方式构建的 Filter 无法直接根据过滤器定义类型自动注入，因为这种Filter本身是以内部Bean呈现，最终是通过**FilterRegistrationBean**呈现给Spring。
所以可通过自动注入**FilterRegistrationBean**类型完成自动装配。