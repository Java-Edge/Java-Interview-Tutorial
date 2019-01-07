实际生产过程中，若要求构建的过滤器针对全局路径有效，且无任何特殊需求（主要针对 Servlet 3.0 的一些异步特性支持），则完全可直接使用 Filter 接口（或继承 Spring 对 Filter 接口的包装类 OncePerRequestFilter），并使用**@Component** 将其包装为 Spring 中的普通 Bean，也可达到预期需求。

不过不管使用哪种方式，可能都遇到问题：业务代码重复执行多次。

这里以 **@Component** + Filter 接口实现方式呈现案例。
创建一SB应用：
![](https://img-blog.csdnimg.cn/c456333c13e5482d90a3875ac5c6d8e2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
UserController：
![](https://img-blog.csdnimg.cn/3f732602dad946daac2ef662858d1174.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
DemoFilter：
![](https://img-blog.csdnimg.cn/931f474caedf46739b60b272a07154e9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
查看调用接口后的日志：
![](https://img-blog.csdnimg.cn/c2ee9c2675f84407a078fe7c93abecf6.png)业务代码竟然被执行两次？？？

预期是 Filter 的业务执行不会影响核心业务，所以当抛异常时，还是会调用`chain.doFilter`。
但有时，我们会忘记及时返回而误闯其它`chain.doFilter`，最终导致自定义过滤器被执行多次。

而检查代码时，往往不能光速看出问题，所以这是类典型错误，虽然原因很简单。
现在我们来分析为何会执行两次，以精通 Filter 的执行。
# 源码解析
首先我们要搞清
## 责任链模式
我们看Tomcat的Filter实现ApplicationFilterChain，采用责任链模式，像递归调用，区别在于：
- 递归调用，同一对象把子任务交给同一方法本身
- 责任链，一个对象把子任务交给**其它对象**的同名方法

核心在于上下文 FilterChain 在不同对象 Filter 间的传递与状态的改变，通过这种链式串联，即可对同种对象资源实现不同业务场景的处理，实现业务解耦。
### FilterChain 结构
![](https://img-blog.csdnimg.cn/69f2e0298d26439c9d2ca42a19adbd83.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
1. 请求来临时，会执行到 ***StandardWrapperValve#invoke()*** ，该方法会创建 ApplicationFilterChain，并通过 ***ApplicationFilterChain#doFilter()***  触发过滤器执行
2. ***ApplicationFilterChain#doFilter()*** 会执行其私有方法 internalDoFilter
3. 在 internalDoFilter 方法中获取下一个Filter，并使用 request、response、this（当前ApplicationFilterChain 实例）作为参数来调用 doFilter()：
public void doFilter(ServletRequest request, ServletResponse response,
FilterChain chain) throws IOException, ServletException
4. 在 Filter 类的 doFilter() 中，执行Filter定义的动作并继续传递，获取第三个参数 ApplicationFilterChain，并执行其 doFilter()
5. 此时会循环执行进入第 2 步、第 3 步、第 4 步，直到第3步中所有的 Filter 类都被执行完毕为止
6. 所有的Filter过滤器都被执行完毕后，会执行 servlet.service(request, response) 方法，最终调用对应的 Controller 层方法

现在，让我们先看负责请求处理的触发时机：
### StandardWrapperValve#invoke()
FilterChain 在何处被创建，又是在何处进行初始化调用，从而激活责任链开始链式调用？
```java
public final void invoke(Request request, Response response)
    throws IOException, ServletException {
    // ...
    // 创建filterChain 
    ApplicationFilterChain filterChain =
        ApplicationFilterFactory.createFilterChain(request, wrapper, servlet);
// ...
try {
    if ((servlet != null) && (filterChain != null)) {
        // Swallow output if needed
        if (context.getSwallowOutput()) {
             // ...
             // 执行责任链
             filterChain.doFilter(request.getRequest(),
                            response.getResponse());
             // ...
         }
// ...
}
```
那FilterChain为何能被链式调用，调用细节如何？查阅： 
### ApplicationFilterFactory.createFilterChain()
```java
public static ApplicationFilterChain createFilterChain(ServletRequest request,
        Wrapper wrapper, Servlet servlet) {
    // ...
    ApplicationFilterChain filterChain = null;
    if (request instanceof Request) {
        // ...
        // 创建FilterChain
        filterChain = new ApplicationFilterChain();
        // ...
    }
    // ...
    // Add the relevant path-mapped filters to this filter chain
    for (int i = 0; i < filterMaps.length; i++) {
        // ...
        ApplicationFilterConfig filterConfig = (ApplicationFilterConfig)
            context.findFilterConfig(filterMaps[i].getFilterName());
        if (filterConfig == null) {
            continue;
        }
        // 增加filterConfig到Chain
        filterChain.addFilter(filterConfig);
    }

    // ...
    return filterChain;
}
```
它创建 FilterChain，并将所有 Filter 逐一添加到 FilterChain 中。

继续查看
### ApplicationFilterChain
**javax.servlet.FilterChain** 的实现类
![](https://img-blog.csdnimg.cn/a086671f1117459e820cbb768553fe26.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
用于管理特定请求的一组过滤器的执行。 当所有定义的过滤器都执行完毕后，对 ***doFilter()*** 的下一次调用将执行 ***servlet#service()*** 本身。
#### 实例变量
过滤器集
![](https://img-blog.csdnimg.cn/9dafeaf064244ad980dee5e22c61ce8d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)过滤器链中当前位置
![](https://img-blog.csdnimg.cn/a82237385d1141e581a28cc736521cdd.png)链中当前的过滤器数
![](https://img-blog.csdnimg.cn/6532e64173a04b31a8bb842e9aa767e7.png)
#### addFilter![](https://img-blog.csdnimg.cn/9a120216a76f46dd8053bfa8c6f3a059.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
每个被初始化的 Filter 都会通过 ***filterChain.addFilter()*** ，加入Filters，并同时更新n，使其等于 Filters数组长度。

至此，Spring 完成对 FilterChain 创建准备工作。
#### doFilter()
调用此链中的下一个过滤器，传递指定请求、响应。 若此链无更多过滤器，则调用 ***servlet#service()***
![](https://img-blog.csdnimg.cn/fb6fb766642040749904839912e9b6af.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
被委派到当前类的私有方法
#### internalDoFilter（过滤器逻辑的核心）
每被调用一次，pos 变量值自增 1，即从类成员变量 Filters 中取下一个 Filter：
![](https://img-blog.csdnimg.cn/6d2e361f3d344aeba4c2dd6eb93f7328.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
***filter.doFilter(request, response, this)*** 会调用过滤器实现的 doFilter()，第三个参数为 this，即当前ApplicationFilterChain实例 ，这意味着用户需要在过滤器中显式调用一次 ***javax.servlet.FilterChain#doFilter***，才能完成整个链路。

当`pos < n`，说明已执行完所有过滤器，才调用 ***servlet.service(request, response)*** 执行真正业务。从 ***internalDoFilter()*** 执行到 ***Controller#saveUser()*** 。
![](https://img-blog.csdnimg.cn/0011ff410ca545e29d0a0cc736212663.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

回到案例，***DemoFilter#doFilter()*** 捕获异常的部分执行了一次，随后在 try 外面又执行一次，因而当抛出异常时，doFilter() 会被执行两次，相应的 ***servlet.service(request, response)*** 方法及对应的 Controller 处理方法也被执行两次。
# 修正
只需除去重复的 ***filterChain.doFilter(request, response)*** ：
![](https://img-blog.csdnimg.cn/1773dfaf02d84824b5bcfe8276876c6f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
使用过滤器时，切忌多次调用 ***FilterChain#doFilter()*** 。