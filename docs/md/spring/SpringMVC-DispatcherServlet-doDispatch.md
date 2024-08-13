# SpringMVC源码解析-DispatcherServlet-doDispatch

## 0 前言

DispatcherServlet是前端控制器设计模式的实现，提供Spring Web MVC的集中访问点， 而且负责职责的分派，且与Spring Ioc容器无缝集成。

## 1 作用

DispatcherServlet主要用于职责调度，控制流程：

- 文件上传解析，若请求类型是multipart，将通过MultipartResolver进行文件上传解析
- 通过HandlerMapping，将请求映射到处理器（返回一个HandlerExecutionChain，包括一个处理器、多个HandlerInterceptor拦截器）
- 通过HandlerAdapter支持多种类型的处理器(HandlerExecutionChain中的处理器)
- 通过ViewResolver解析逻辑视图名到具体视图实现
- 本地化解析
- 渲染具体的视图
- 若执行过程中遇到异常将交给HandlerExceptionResolver解析

## 2  DispatcherServlet工作流程



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/7d0e3466035646a074ca489a1e1851f9.png)

也是个Servlet。其处理的请求必须在同一web.xml文件里用url-mapping定义映射。这是标准的J2EE servlet配置。

```java
	protected void doDispatch(HttpServletRequest request, HttpServletResponse response) {
		HttpServletRequest processedRequest = request;
		HandlerExecutionChain mappedHandler = null;
		boolean multipartRequestParsed = false;

		WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);

		try {
			ModelAndView mv = null;
			Exception dispatchException = null;

			try {
				processedRequest = checkMultipart(request);
				multipartRequestParsed = (processedRequest != request);

				// Determine handler for the current request.
				mappedHandler = getHandler(processedRequest);
				if (mappedHandler == null) {
					noHandlerFound(processedRequest, response);
					return;
				}

				// Determine handler adapter for the current request.
				HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

				// Process last-modified header, if supported by the handler.
				String method = request.getMethod();

				if (!mappedHandler.applyPreHandle(processedRequest, response)) {
					return;
				}

				// Actually invoke the handler.
				mv = ha.handle(processedRequest, response, mappedHandler.getHandler());
       ...
			}
     ...
	}
```

注意：

```java
processedRequest = checkMultipart(request);
```

检查该请求是不是文件上传的请求。

## 3 checkMultipart

转换请求到multipart请求，使multipart解析器可用。若无解析器被设置，只需使用现有请求

```java
protected HttpServletRequest checkMultipart(HttpServletRequest request) {
    if (this.multipartResolver != null && this.multipartResolver.isMultipart(request)) {
      ...
          try {
             return this.multipartResolver.resolveMultipart(request);
          }
          ...
    }
    // If not returned before: return original request.
    return request;
}
```

先判断multipartResolver是否为空，multipartResolver需配置，通常配置如下：

```xml
<bean id="multipartResolver"
		class="org.springframework.web.multipart.commons.CommonsMultipartResolver"/>
```

- 若未配置MultipartResolver，则认为不是文件上传请求
- 若配置了MultipartResolver，调用isMultipart验证是否为文件上传请求：

![](https://img-blog.csdnimg.cn/ad0795cef6cf44d98c0477004442d6d7.png)

在这里我们看到了一个类是:ServletFileUpload文件上传工具包：commons-fileupload中的类。
SpringMVC对文件上传的处理是借助于commons-fileupload包实现：

![](https://img-blog.csdnimg.cn/ce38734bb42047ca8cf45f8c7c3ac2e4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

先判断是否为POST请求，不是则直接返回false。接着调用isMultipartContent继续验证：

![](https://img-blog.csdnimg.cn/d1d897035f314c68a3c8bad7874af93c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

若请求是POST请求，且请求头中的Context-Type是以multipart/开头，就认为是文件上传请求

```java
protected HttpServletRequest checkMultipart(HttpServletRequest request) throws MultipartException {
	if (this.multipartResolver != null && this.multipartResolver.isMultipart(request)) {
		if (WebUtils.getNativeRequest(request, MultipartHttpServletRequest.class) != null) {
		
		}
		else if (request.getAttribute(WebUtils.ERROR_EXCEPTION_ATTRIBUTE) instanceof MultipartException) {
			
		}
		else {
			return this.multipartResolver.resolveMultipart(request);
		}
	}
	
	return request;
}
```

若为文件上传请求，则继续判断该请求是否：

- 已被转换为MultipartHttpServletRequest类型。
  在Spring-Web有个过滤器org.springframework.web.multipart.support.MultipartFilter，
  若在web.xml中配置该过滤器，则会在过滤器中提前判断是否为文件上传请求，并将请求转换为MultipartHttpServletRequest类型。这个过滤器中默认使用的MultipartResolver为StandardServletMultipartResolver

- 若不是MultipartHttpServletRequest类型，则判断是否出现异常。

若上面这两步都返回false，则执行 this.multipartResolver.resolveMultipart(request)

```java
// 将请求转换为MultipartHttpServletRequest类型
public MultipartHttpServletRequest resolveMultipart(final HttpServletRequest request) throws MultipartException {
	if (this.resolveLazily) {
		return new DefaultMultipartHttpServletRequest(request) {
			@Override
			protected void initializeMultipart() {
				MultipartParsingResult parsingResult = parseRequest(request);
				setMultipartFiles(parsingResult.getMultipartFiles());
				setMultipartParameters(parsingResult.getMultipartParameters());
				setMultipartParameterContentTypes(parsingResult.getMultipartParameterContentTypes());
			}
		};
	}
	else {
		MultipartParsingResult parsingResult = parseRequest(request);
		return new DefaultMultipartHttpServletRequest(request, parsingResult.getMultipartFiles(),
				parsingResult.getMultipartParameters(), parsingResult.getMultipartParameterContentTypes());
	}
}
```

在CommonsMultipartResolver中有一个属性叫resolveLazily，这个属性值代表是不是延迟解析文件上传，默认为false。最终返回的是一个DefaultMultipartHttpServletRequest的类。这里有一个重要的方法是：parseRequest，这个方法干的事是解析文件上传请求。它的底层是commons-fileupload那一套，不同的是Spring在获取FileItem之后，又进行了一下封装，封装为便于Spring框架整合。

下面我们接着看这一句话：

```java
multipartRequestParsed = (processedRequest != request);
```

processedRequest是checkMultipart(request)这个方法返回的值，如果processedRequest和request不相等的话，则认为是文件上传的请求。

## 4 getHandler(processedRequest)

为此请求返回HandlerExecutionChain。按顺序尝试所有的handler mapping：

```java
// Determine handler for the current request.
mappedHandler = getHandler(processedRequest);
```

获取当前请求对应的处理类，在这个处理链中会包含对应的拦截器的信息。HandlerExecutionChain这个类中包含变和不变量的两部分内容


```java
protected HandlerExecutionChain getHandler(HttpServletRequest request) {
	for (HandlerMapping hm : this.handlerMappings) {
		HandlerExecutionChain handler = hm.getHandler(request);
		if (handler != null) {
			return handler;
		}
	}
	return null;
}
```

循环handlerMappings，然后获取对应的执行链，只要找到一个对应的执行链就返回。SpringMVC默认加载三个请求处理映射类：

- RequestMappingHandlerMapping
- SimpleUrlHandlerMapping
- BeanNameUrlHandlerMapping

共同父类：AbstractHandlerMapping。

hm.getHandler(request)这个getHandler方法在AbstractHandlerMapping中，其子类都没有重写这个方法。

### AbstractHandlerMethodMapping#getHandler

```java
@Override
public final HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
	// 两个子类重写该方法：AbstractHandlerMethodMapping和AbstractUrlHandlerMapping
	Object handler = getHandlerInternal(request);
	// 如果没有找到的话，默认处理类
	if (handler == null) {
		handler = getDefaultHandler();
	}
	// 如果没有默认的处理类，返回null
	if (handler == null) {
		return null;
	}
	// Bean name or resolved handler?
	if (handler instanceof String) {
		String handlerName = (String) handler;
		handler = getApplicationContext().getBean(handlerName);
	}
	// 包装为执行器链
	HandlerExecutionChain executionChain = getHandlerExecutionChain(handler, request);
	// 是否跨域请求
	if (CorsUtils.isCorsRequest(request)) {
		CorsConfiguration globalConfig = this.corsConfigSource.getCorsConfiguration(request);
		CorsConfiguration handlerConfig = getCorsConfiguration(handler, request);
		CorsConfiguration config = (globalConfig != null ? globalConfig.combine(handlerConfig) : handlerConfig);
		executionChain = getCorsHandlerExecutionChain(request, executionChain, config);
	}
	return executionChain;
}
```

### AbstractHandlerMethodMapping#getHandlerInternal

```java
	@Override
	protected HandlerMethod getHandlerInternal(HttpServletRequest request) {
		// 得到请求 url 的查询路径
		String lookupPath = getUrlPathHelper().getLookupPathForRequest(request);
		}
		// 获取并发读锁
		this.mappingRegistry.acquireReadLock();
		try {
			// 得到查询路径对应的处理器方法
			HandlerMethod handlerMethod = lookupHandlerMethod(lookupPath, request);
			return (handlerMethod != null ? handlerMethod.createWithResolvedBean() : null);
		}
		...
	}
```

### getHandlerExecutionChain

创建执行器链的内容：

```java
protected HandlerExecutionChain getHandlerExecutionChain(Object handler, HttpServletRequest request) {
	// 判断handler是不是执行器链，如果不是创建一个执行器链
	HandlerExecutionChain chain = (handler instanceof HandlerExecutionChain ?
			(HandlerExecutionChain) handler : new HandlerExecutionChain(handler));
	
	String lookupPath = this.urlPathHelper.getLookupPathForRequest(request);
	// 包装拦截器
	for (HandlerInterceptor interceptor : this.adaptedInterceptors) {
		if (interceptor instanceof MappedInterceptor) {
			MappedInterceptor mappedInterceptor = (MappedInterceptor) interceptor;
			if (mappedInterceptor.matches(lookupPath, this.pathMatcher)) {
				chain.addInterceptor(mappedInterceptor.getInterceptor());
			}
		}
		else {
			chain.addInterceptor(interceptor);
		}
	}
	return chain;
}
```

这个方法主要是创建执行器链，添加拦截器。

### 判断

```java
if (mappedHandler == null || mappedHandler.getHandler() == null) {
	noHandlerFound(processedRequest, response);
	return;
}
```

如果没有找到对应的处理类的话，这里通常会返回404，如果throwExceptionIfNoHandlerFound属性值为true的情况下会抛出异常。

继续往下分析：

```java
HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());
```

## 5 getHandlerAdapter

获取处理适配器：

```java
protected HandlerAdapter getHandlerAdapter(Object handler) throws ServletException {
    if (this.handlerAdapters != null) {
       for (HandlerAdapter adapter : this.handlerAdapters) {
          if (adapter.supports(handler)) {
             return adapter;
          }
       }
    }
}
```

- SimpleControllerHandlerAdapter
  适配SimpleUrlHandlerMapping和BeanNameUrlHandlerMapping的映射的，也就是实现Controller接口的Handler
- AbstractHandlerMethodAdapter
  适配RequestMappingHandlerMapping，也就是我们常用的RequestMapping注解
- HttpRequestHandlerAdapter
  适配远程调用的
- SimpleServletHandlerAdapter
  适配Servlet实现类的

### supports

```java
@Override
public final boolean supports(Object handler) {
    return (handler instanceof HandlerMethod handlerMethod && supportsInternal(handlerMethod));
}
```

### supportsInternal

总是返回true ，因为任何方法参数和返回值类型会以某种方式加以处理。 
不被任何HandlerMethodArgumentResolver识别的方法参数被解释为一个请求参数，如果它是一个简单的类型，或者作为模型属性否则。 
没有任何HandlerMethodReturnValueHandler识别的返回值将被解释为一个模型属性

```java
public class RequestMappingHandlerAdapter extends AbstractHandlerMethodAdapter
		implements BeanFactoryAware, InitializingBean {
  
  @Override
  protected boolean supportsInternal(HandlerMethod handlerMethod) {
      return true;
	}
}
```

如果是GET请求，内容没有变化则直接返回

## 6 applyPreHandle

应用已注册的preHandle拦截方法

```java
if (!mappedHandler.applyPreHandle(processedRequest, response)) {
    return;
}
```

应用已注册拦截器的 preHandle 方法。返回：

- true 如果执行链应继续下一个拦截器或处理程序本身
- 否则，DispatcherServlet 假定此拦截器已经处理了响应本身

```java
boolean applyPreHandle(HttpServletRequest request, HttpServletResponse response) throws Exception {
    for (int i = 0; i < this.interceptorList.size(); i++) {
       HandlerInterceptor interceptor = this.interceptorList.get(i);
       if (!interceptor.preHandle(request, response, this.handler)) {
          triggerAfterCompletion(request, response, null);
          return false;
       }
       this.interceptorIndex = i;
    }
    return true;
}
```

## 7 handle()

```java
// Actually invoke the handler.
mv = ha.handle(processedRequest, response, mappedHandler.getHandler());
```

执行handle

```java
applyDefaultViewName(processedRequest, mv);
mappedHandler.applyPostHandle(processedRequest, response, mv);
```

如果返回的mv不为null，并且没有设置view，则设置默认的view，应用postHandle拦截器。

## 8 processDispatchResult



```java
private void processDispatchResult(HttpServletRequest request, HttpServletResponse response,
		HandlerExecutionChain mappedHandler, ModelAndView mv, Exception exception) {
  ...
	// 调用处理拦截器的afterCompletion
	if (mappedHandler != null) {
		mappedHandler.triggerAfterCompletion(request, response, null);
	}
}
```

如果

- 出现异常，返回异常页面
- 没有异常，ModelAndView不为null，则正常渲染页面，调用拦截器的afterCompletion方法