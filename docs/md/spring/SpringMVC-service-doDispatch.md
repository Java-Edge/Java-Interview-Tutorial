# SpringMVC源码解析从service到doDispatch

## 0 前言

请求被Servlet处理前，会先被过滤器处理，之后调用Servlet#service对相应请求进行处理响应。所以分析入口是Servlet的service方法。


用SpringMVC时，通常在web.xml配置：

```xml
<servlet>
	<servlet-name>spring-mvc</servlet-name>
	<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
	<init-param>
		<param-name>contextConfigLocation</param-name>
		<param-value>classpath:learn-spring-mvc.xml</param-value>
	</init-param>
	<load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
	<servlet-name>spring-mvc</servlet-name>
	<url-pattern>/</url-pattern>
</servlet-mapping>
```

所有的请求（除静态资源）将由DispatcherServlet处理：

## 1 DispatcherServlet



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/76b0847eabdac89f2a9d63c571992469.png)

Spring的DispatcherServlet继承FrameworkServlet，FrameworkServlet继承HttpServletBean，HttpServletBean继承HttpServlet，HttpServlet继承GenericServlet，GenericServlet实现最顶级的Servlet和ServletConfig接口。

```java
public class DispatcherServlet extends FrameworkServlet

  protected void doService(HttpServletRequest request, HttpServletResponse response) {
    ...

      try {
        doDispatch(request, response);
      }
    ...
    }
}
```

DispatcherServlet没找到service(ServletRequest req, ServletResponse res)，但在其父类HttpServlet找到了，去HttpServlet看看这个方法的内容：

## 2 HttpServlet#service

```java
@Override
public void service(ServletRequest req, ServletResponse res) {
    HttpServletRequest request = (HttpServletRequest) req;
    HttpServletResponse response = (HttpServletResponse) res;
    service(request, response);
}
```

将ServletRequest和ServletResponse转换为HttpServletRequest、HttpServletResponse，因为web开发，用HTTP协议。

接下来调用FrameworkServlet中重写的service方法：

## 3 FrameworkServlet#service

```java
@Override
protected void service(HttpServletRequest request, HttpServletResponse response) {
    if (HTTP_SERVLET_METHODS.contains(request.getMethod())) {
       super.service(request, response);
    }
}
```

根据请求的方法类型转换对应的枚举类。

HttpMethod定义的枚举类型：GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS, TRACE，也是RFC标准中几种请求类型。
所以这里会执行super.service这个方法。即调用HttpServlet中的service方法。

## 4 HttpServlet#service

```java
protected void service(HttpServletRequest req, HttpServletResponse resp) {
		// 获取请求类型
    String method = req.getMethod();
		// get请求
    if (method.equals(METHOD_GET)) {
        //检查是不是开启了页面缓存
        long lastModified = getLastModified(req);
        if (lastModified == -1) {
            // servlet doesn't support if-modified-since, no reason
            // to go through further expensive logic
						 //没有开启页面缓存调用doGet
            doGet(req, resp);
        }
        ...
    }...
    } else if (method.equals(METHOD_POST)) {
        doPost(req, resp);
    } else if (method.equals(METHOD_PUT)) {
        doPut(req, resp);
    } else if (method.equals(METHOD_DELETE)) {
        doDelete(req, resp);
    } else if (method.equals(METHOD_OPTIONS)) {
        doOptions(req,resp);
    } else if (method.equals(METHOD_TRACE)) {
        doTrace(req,resp);
    } else {
				 //服务器不支持的方法 直接返回错误信息
        String errMsg = lStrings.getString("http.method_not_implemented");
        Object[] errArgs = new Object[1];
        errArgs[0] = method;
        errMsg = MessageFormat.format(errMsg, errArgs);
        resp.sendError(HttpServletResponse.SC_NOT_IMPLEMENTED, errMsg);
    }
}
```

平时web开发主要是继承HttpServlet这个类，然后重写doPost或doGet。FrameworkServlet子类就重写了这些方法。只说最常用的doGet和doPost。两个方法体一样，都是调用processRequest

## 5 FrameworkServlet#processRequest

```java
protected final void processRequest(HttpServletRequest request, HttpServletResponse response) {
 
	long startTime = System.currentTimeMillis();
	Throwable failureCause = null;
	LocaleContext previousLocaleContext = LocaleContextHolder.getLocaleContext();
	// 国际化
	LocaleContext localeContext = buildLocaleContext(request);
	RequestAttributes previousAttributes = RequestContextHolder.getRequestAttributes();
	//构建ServletRequestAttributes对象
	ServletRequestAttributes requestAttributes = buildRequestAttributes(request, response, previousAttributes);
	//异步管理
	WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);
	asyncManager.registerCallableInterceptor(FrameworkServlet.class.getName(), new RequestBindingInterceptor());
    //初始化ContextHolders
	initContextHolders(request, localeContext, requestAttributes);
	//执行doService
	try {
		doService(request, response);
	}
	
}
```

国际化的设置，创建ServletRequestAttributes对象，初始化上下文holders(即将Request对象放入到线程上下文中)，调用doService方法。

### 国际化

DispatcherServlet#buildLocaleContext这个方法中完成的，其源码如下：

```java
protected LocaleContext buildLocaleContext(final HttpServletRequest request) {
	if (this.localeResolver instanceof LocaleContextResolver) {
		return ((LocaleContextResolver) this.localeResolver).resolveLocaleContext(request);
	}
	else {
		return new LocaleContext() {
			@Override
			public Locale getLocale() {
				return localeResolver.resolveLocale(request);
			}
		};
	}
}
```

没有配置国际化解析器的话，那么它会使用默认的解析器：AcceptHeaderLocaleResolver，即从Header中获取国际化的信息。
除了AcceptHeaderLocaleResolver之外，SpringMVC中还提供了这样的几种解析器：CookieLocaleResolver、SessionLocaleResolver、FixedLocaleResolver。分别从cookie、session中去国际化信息和JVM默认的国际化信息(Local.getDefault())。

initContextHolders主要是将Request请求、ServletRequestAttribute对象和国际化对象放入到上下文中：

```java
private void initContextHolders(
		HttpServletRequest request, LocaleContext localeContext, RequestAttributes requestAttributes) {
	if (localeContext != null) {
		LocaleContextHolder.setLocaleContext(localeContext, this.threadContextInheritable);//threadContextInheritable默认为false
	}
	if (requestAttributes != null) {//threadContextInheritable默认为false
		RequestContextHolder.setRequestAttributes(requestAttributes, this.threadContextInheritable);
	}
}
```

RequestContextHolder这个类有什么用呢？有时想在某些类中获取HttpServletRequest对象，比如在AOP拦截的类中，那么我们就可以这样来获取Request的对象

```java
HttpServletRequest request = (HttpServletRequest) RequestContextHolder.getRequestAttributes().resolveReference(RequestAttributes.REFERENCE_REQUEST);
```

## 6 DispatcherServlet#doService



```java
@Override
protected void doService(HttpServletRequest request, HttpServletResponse response) {
  ...
	try {
		doDispatch(request, response);
	}
	finally {
		if (!WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {
			// Restore the original attribute snapshot, in case of an include.
			if (attributesSnapshot != null) {
				restoreAttributesAfterInclude(request, attributesSnapshot);
			}
		}
	}
}
```

处理include标签的请求，将上下文放到request的属性中，将国际化解析器放到request的属性中，将主题解析器放到request属性中，将主题放到request的属性中，处理重定向的请求数据，最后调用doDispatch这个核心的方法对请求进行处理。