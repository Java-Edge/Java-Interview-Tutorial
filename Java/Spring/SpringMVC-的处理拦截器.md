#0 目录
![](http://upload-images.jianshu.io/upload_images/4685968-0e96e02f95af818c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-14563a0520de7e61.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-48c508160847ed78.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-060046ab31685f80.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 ![](http://upload-images.jianshu.io/upload_images/4685968-174b6d94bc2397c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1 Spring MVC拦截器流程图
![](http://upload-images.jianshu.io/upload_images/4685968-ca4e9021f653c954.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#2 Spring Web MVC 的处理器拦截器
![](https://upload-images.jianshu.io/upload_images/4685968-1b14ff00f1e4ab85.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

类似于Servlet 开发中的过滤器Filter，用于对处理器进行预处理和后处理

HandlerInterceptor接口定义了三个方法
##2.1  preHandle
该方法将在**请求处理之前进行调用**,只有当该方法返回true时,才会继续调用下一个`Interceptor`的`preHandle()`,如果已是最后一个`Interceptor`就会是调用当前请求的`Controller`
##2.2 postHandle
该方法将在请求处理后,`DispatcherServlet`进行视图返回**渲染之前进行调用**,可以在这个方法中对`Controller`处理之后的`ModelAndView`对象进行操作(比如这里加入公用信息以便页面显示)
##2.3 afterCompletion
该方法也是需要当前对应的`Interceptor`的`preHandle`方法的返回值为`true`时才会执行,该方法将在整个请求结束之后,也就是在`DispatcherServlet` 渲染了对应的视图之后执行
**用于资源清理**

#3 拦截器配置
##3.1 针对某种mapping拦截器配置
```xml
 <bean  
   class="org.springframework.web.servlet.handler.BeanNameUrlHandlerMapping">  
   <property name="interceptors">  
      <list>  
         <ref bean="handlerInterceptor1"/>  
         <ref bean="handlerInterceptor2"/>  
      </list>  
   </property>  
</bean>  
<bean id="handlerInterceptor1"class="springmvc.intercapter.HandlerInterceptor1"/>  
<bean id="handlerInterceptor2"class="springmvc.intercapter.HandlerInterceptor2"/> 
```
##3.2 针对所有mapping配置全局拦截器
```xml
<!--拦截器 -->  
<mvc:interceptors>  
   <!--多个拦截器,顺序执行 -->  
   <mvc:interceptor>  
      <mvc:mapping path="/**"/>  
      <bean class="com.sss.filter.HandlerInterceptor1"></bean>  
   </mvc:interceptor>  
   <mvc:interceptor>  
      <mvc:mapping path="/**"/>  
      <bean class="com.sss.filter.HandlerInterceptor2"></bean>  
   </mvc:interceptor>  
</mvc:interceptors>  
```
#4 实践
 用户访问其他页面时,从Seesion中获取到用户，未登录则重定向到登录页面。
```java
Public class LoginInterceptor implements HandlerInterceptor{   
    @Override  
    Public boolean preHandle(HttpServletRequest request,  
            HttpServletResponse response, Object handler) throws Exception {  
  
        //如果是登录页面则放行  
        if(request.getRequestURI().indexOf("login.action")>=0){  
            return true;  
        }  
        HttpSession session = request.getSession();  
        //如果用户已登录也放行  
        if(session.getAttribute("user")!=null){  
            return true;  
        }  
        //用户没有登录挑战到登录页面  
        request.getRequestDispatcher("/WEB-INF/jsp/login.jsp").forward(request, response);  
          
        return false;  
    }  
```
