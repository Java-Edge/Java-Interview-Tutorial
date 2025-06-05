# SpringMVC拦截处理器

## 1 工作原理流程图

![](https://p.ipic.vip/vp2z0x.png)

## 2 Spring Web MVC 的处理器拦截器

```java
public interface HandlerInterceptor {

	default boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {

		return true;
	}

	default void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			@Nullable ModelAndView modelAndView) throws Exception {
	}

	default void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
			@Nullable Exception ex) throws Exception {
	}

}
```

类似Servlet的过滤器Filter，对处理器进行预处理、后处理。HandlerInterceptor接口方法：

### 2.1 preHandle

```java
@SuppressWarnings("serial")
public class DispatcherServlet extends FrameworkServlet {
  
  	protected void doDispatch() {
      ...
      if (!mappedHandler.applyPreHandle(processedRequest, response)) {
				return;
			 }
    }
}
```

最终会调用HandlerInterceptor#preHandle：

```java
public class HandlerExecutionChain {

  boolean applyPreHandle(HttpServletRequest request, HttpServletResponse response) throws Exception {
  HandlerInterceptor[] interceptors = getInterceptors();
  if (!ObjectUtils.isEmpty(interceptors)) {
    for (int i = 0; i < interceptors.length; i++) {
      HandlerInterceptor interceptor = interceptors[i];
      if (!interceptor.preHandle(request, response, this.handler)) {
        ...
}
```

调用所有的HandlerInterceptor拦截器并调用其preHandle方法。

执行controller处理逻辑前执行，返回值为boolean，返回值为true时接着执行postHandle和afterCompletion，若返回false则中断执行。



拦截处理程序的执行。 HandlerMapping确定的适当处理器对象后调用，但在HandlerAdapter调用处理器之前。

DispatcherServlet是在执行链中处理的handler，其中包括了任意数量的拦截器，处理器本身在链的末尾，即最后才处理 handler。 利用该方法，每个拦截器可以决定中止执行链，特别发送一个HTTP错误或写入客户端响应。



异步请求处理参见AsyncHandlerInterceptor 。
true如果执行链应与下一个拦截器或处理程序本身进行。 否则，DispatcherServlet认为，这种拦截器已经处理了响应本身。

在业务处理器处理请求前被调用，只有当该方法返回true，才会继续调用下个`Interceptor`的`preHandle()`，若已是最后一个`Interceptor`，就调用当前请求的`Controller`

### 2.2  postHandle

applyPostHandle，获取所有的拦截器并调用其postHandle方法：

```java
/**
 * Apply postHandle methods of registered interceptors.
 */
void applyPostHandle(HttpServletRequest request, HttpServletResponse response, @Nullable ModelAndView mv)
    throws Exception {

  HandlerInterceptor[] interceptors = getInterceptors();
  if (!ObjectUtils.isEmpty(interceptors)) {
    for (int i = interceptors.length - 1; i >= 0; i--) {
      HandlerInterceptor interceptor = interceptors[i];
      interceptor.postHandle(request, response, this.handler, mv);
    }
  }
}
```

执行controller的处理后，即业务处理器处理请求执行完成后，并在ModelAndView处理生成视图之前执行。

请求处理后，`DispatcherServlet`进行视图返回**渲染之前进行调用**，可在该方法中对`Controller`处理之后的`ModelAndView`对象进行操作（如加入公用信息，以便页面显示）。

### 2.3 afterCompletion

DispatchServlet执行完ModelAndView后执行，即完成之后回调，呈现视图后。 将在处理程序执行的任何结果调用，从而允许适当的资源清理。

需当前对应的`Interceptor`的`preHandle`方法的返回值为`true`时才会执行。该方法将在整个请求结束之后，即DispatcherServlet渲染了对应的视图之后执行，**用于资源清理**。

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
Public class LoginInterceptor implements HandlerInterceptor {   
    @Override  
    Public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {  
  
        // 若是登录页面则放行  
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