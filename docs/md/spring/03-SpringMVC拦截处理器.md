# 03-SpringMVC拦截处理器

## 1 工作原理流程图



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/b2f01056d69390b83a38d2b3385d4732.png)

## 2 Spring Web MVC 的处理器拦截器



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/6ca1bc0105aabaf41667dad19d267e42.png)

类似Servlet的过滤器Filter，用于对处理器进行预处理和后处理。HandlerInterceptor接口定义如下方法：

### 2.1 preHandle



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/a1e7971e070dc2aa8255e3f0411c9e4d.png)

最终会调用HandlerInterceptor的

## 1 preHandle



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/5a9e302523148147cc77fafdf2e57011.png)

调用所有的HandlerInterceptor拦截器并调用其preHandle方法。

执行controller处理逻辑前执行，返回值为boolean，返回值为true时接着执行postHandle和afterCompletion，若返回false则中断执行。



拦截处理程序的执行。 HandlerMapping确定的适当处理器对象后调用，但在HandlerAdapter调用处理器之前。

DispatcherServlet是在执行链中处理的handler，其中包括了任意数量的拦截器，处理器本身在链的末尾，即最后才处理 handler。 利用该方法，每个拦截器可以决定中止执行链，特别发送一个HTTP错误或写入客户端响应。



异步请求处理参见AsyncHandlerInterceptor 。
true如果执行链应与下一个拦截器或处理程序本身进行。 否则，DispatcherServlet认为，这种拦截器已经处理了响应本身。

在**请求处理之前进行调用**，只有当该方法返回true，才会继续调用下个`Interceptor`的`preHandle()`，若已是最后一个`Interceptor`，就调用当前请求的`Controller`

### 2.2  postHandle

applyPostHandle，获取所有的拦截器并调用其postHandle方法：
![](https://img-blog.csdnimg.cn/20200605105309725.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

在执行controller的处理后，在ModelAndView处理前执行。

拦截处理程序的执行。 调用后的HandlerAdapter实际上调用的处理，但DispatcherServlet的呈现视图之前。 可以公开额外的模型对象通过给定的ModelAndView中的视图。
DispatcherServlet的在执行链流程处理程序，其中包括任何数量的拦截器的，与所述处理程序本身在末端。 利用这种方法，每个拦截器可以后处理的执行，在执行链的相反的顺序得到应用。
注：特殊注意事项适用于异步请求处理。 欲了解更多详情，请参见AsyncHandlerInterceptor 。

在请求处理后，`DispatcherServlet`进行视图返回**渲染之前进行调用**，可在这个方法中对`Controller`处理之后的`ModelAndView`对象进行操作(比如这里加入公用信息，以便页面显示)

### 2.3 afterCompletion

在DispatchServlet执行完ModelAndView之后执行。



请求处理，即完成之后回调，呈现视图后。 将在处理程序执行的任何结果调用，从而允许适当的资源清理。
注意：如果此拦截器的才会被调用preHandle方法已成功完成，返回true ！
如同postHandle方法，该方法将在以相反的顺序链中的每个拦截器被调用，所以第一个拦截器将是最后被调用。
注：特殊注意事项适用于异步请求处理。 欲了解更多详情，请参见AsyncHandlerInterceptor 。

需当前对应的`Interceptor`的`preHandle`方法的返回值为`true`时才会执行。该方法将在整个请求结束之后，即DispatcherServlet` 渲染了对应的视图之后执行，**用于资源清理**

## 3 拦截器配置

### 3.1 针对某种mapping拦截器配置

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

### 3.2 针对所有mapping配置全局拦截器

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

## 4 实践

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