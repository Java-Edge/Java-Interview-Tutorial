# 0 摘要
*   本文从源码层面简单讲解SpringMVC的处理器映射环节，也就是查找Controller详细过程
# 1 SpringMVC请求流程
![](http://upload-images.jianshu.io/upload_images/4685968-eef6c5ac8e72964d..jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
* Controller查找在上图中对应的步骤1至2的过程
![SpringMVC详细运行流程图](https://upload-images.jianshu.io/upload_images/4685968-3beebf916a013f9f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#2 SpringMVC初始化过程
##2.1 先认识两个类
- Handler 
通常指用于处理request请求的实际对象，可以类比 XxxController。在Spring Mvc中并没有具体的类叫 Handler。
1.  `RequestMappingInfo`
封装`RequestMapping`注解
包含HTTP请求头的相关信息
一个实例对应一个`RequestMapping`注解
2.  `HandlerMethod`
封装Controller的处理请求方法
包含该方法所属的bean对象、该方法对应的method对象、该方法的参数等
![RequestMappingHandlerMapping的继承关系](https://upload-images.jianshu.io/upload_images/4685968-e88884b624b22a65.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![初始化调用链](https://upload-images.jianshu.io/upload_images/4685968-8b9fb142018bf8f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##2.2  RequestMappingHandlerMapping、AbstractHandlerMethodMapping
`RequestMappingHandlerMapping` 实现了`InitalizingBean`
Spring容器在启动的时候会执行`InitalizingBean.afterPropertiesSet()`方法`RequestMappingHandlerMapping`实现了这个方法，这里也是Spring MVC初始化的入口。
然后进入`AbstractHandlerMethodMapping`的`afterPropertiesSet`
这个方法会进入该类的`initHandlerMethods`
负责从`applicationContext`中扫描beans,然后从bean中查找并注册处理器方法
##2.3 真正的初始化方法initHandlerMethods()
###Spring4.0.3版本
```
//Scan beans in the ApplicationContext, detect and register handler methods.
protected void initHandlerMethods() {
  ...

  //获取applicationContext中所有的bean name
  String[] beanNames = (this.detectHandlerMethodsInAncestorContexts ?
        BeanFactoryUtils.beanNamesForTypeIncludingAncestors(getApplicationContext(), Object.class) :
        getApplicationContext().getBeanNamesForType(Object.class));
  
  //遍历beanName数组
  for (String beanName : beanNames) {
      //isHandler会根据bean来判断bean定义中是否带有Controller注解或RequestMapping注解
      if (isHandler(getApplicationContext().getType(beanName))){
        detectHandlerMethods(beanName);
      }
  }
  handlerMethodsInitialized(getHandlerMethods());
}

```
###Spring5.0.4版本
```java
   /**
	 * Scan beans in the ApplicationContext, detect and register handler methods.
	 */
	protected void initHandlerMethods() {
		if (logger.isDebugEnabled()) {
			logger.debug("Looking for request mappings in application context: " + getApplicationContext());
		}
        //获取所有容器托管的 beanName
		String[] beanNames = (this.detectHandlerMethodsInAncestorContexts ?
				BeanFactoryUtils.beanNamesForTypeIncludingAncestors(obtainApplicationContext(), Object.class) :
				obtainApplicationContext().getBeanNamesForType(Object.class));

		for (String beanName : beanNames) {
			if (!beanName.startsWith(SCOPED_TARGET_NAME_PREFIX)) {
				Class<?> beanType = null;
				try {
                    //获取 Class 信息
					beanType = obtainApplicationContext().getType(beanName);
				}
				catch (Throwable ex) {
					// An unresolvable bean type, probably from a lazy bean - let's ignore it.
					if (logger.isDebugEnabled()) {
						logger.debug("Could not resolve target class for bean with name '" + beanName + "'", ex);
					}
				}
                // isHandler()方法判断这个类是否有 @RequestMapping 或 @Controller
				if (beanType != null && isHandler(beanType)) {
                    //发现并注册 Controller @RequestMapping方法
					detectHandlerMethods(beanName);
				}
			}
		}
        //Spring MVC框架没有实现、可以用于功能扩展
		handlerMethodsInitialized(getHandlerMethods());
	}
```
![RequestMappingHandlerMapping#isHandler](https://upload-images.jianshu.io/upload_images/4685968-3f4f724908ccf668.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
*   上图方法即判断当前bean定义是否带有Controlller注解或RequestMapping注解
如果只有`RequestMapping`生效吗？不会的!
因为这种情况下Spring初始化的时候不会把该类注册为Spring bean,遍历beanNames时不会遍历到这个类，所以这里把`Controller`换成`Compoent`也可以，不过一般不这么做
##2.3 从handler中获取HandlerMethod
当确定bean为handler后,便会从该bean中查找出具体的handler方法（即`Controller`类下的具体定义的请求处理方法）,查找代码如下
###Spring4.0.3
```
   /**
	 * Look for handler methods in a handler
	 * @param handler the bean name of a handler or a handler instance
	 */
protected void detectHandlerMethods(final Object handler) {
  //获取当前Controller bean的class对象
  Class<?> handlerType = (handler instanceof String) ?
        getApplicationContext().getType((String) handler) : handler.getClass();

  //避免重复调用 getMappingForMethod 来重建 RequestMappingInfo 实例
  final Map<Method, T> mappings = new IdentityHashMap<Method, T>();
  //同上，也是该Controller bean的class对象
  final Class<?> userType = ClassUtils.getUserClass(handlerType);
  
  //获取当前bean的所有handler method
  //根据 method 定义是否带有 RequestMapping 
  //若有则创建RequestMappingInfo实例
  Set<Method> methods = HandlerMethodSelector.selectMethods(userType, new MethodFilter() {
			@Override
			public boolean matches(Method method) {
				T mapping = getMappingForMethod(method, userType);
				if (mapping != null) {
					mappings.put(method, mapping);
					return true;
				}
				else {
					return false;
				}
			}
  });

   //遍历并注册当前bean的所有handler method
   for (Method method : methods) {
            //注册handler method，进入以下方法
			registerHandlerMethod(handler, method, mappings.get(method));
   }
 
```
###Spring5.0.4
```java
	/**
	 * Look for handler methods in a handler.
	 * @param handler the bean name of a handler or a handler instance
	 */
	protected void detectHandlerMethods(final Object handler) {
		Class<?> handlerType = (handler instanceof String ?
				obtainApplicationContext().getType((String) handler) : handler.getClass());

		if (handlerType != null) {
			final Class<?> userType = ClassUtils.getUserClass(handlerType);
			Map<Method, T> methods = MethodIntrospector.selectMethods(userType,
					(MethodIntrospector.MetadataLookup<T>) method -> {
						try {
                            //获取 RequestMappingInfo
							return getMappingForMethod(method, userType);
						}
						catch (Throwable ex) {
							throw new IllegalStateException("Invalid mapping on handler class [" +
									userType.getName() + "]: " + method, ex);
						}
					});
			if (logger.isDebugEnabled()) {
				logger.debug(methods.size() + " request handler methods found on " + userType + ": " + methods);
			}
			for (Map.Entry<Method, T> entry : methods.entrySet()) {
				Method invocableMethod = AopUtils.selectInvocableMethod(entry.getKey(), userType);
				T mapping = entry.getValue();
                //注册RequestMappingInfo
				registerHandlerMethod(handler, invocableMethod, mapping);
			}
		}
	}
```
以上代码有两个地方有调用了`getMappingForMethod`
##2.4 创建RequestMappingInfo
这一步会获取方法和类上的`@RequestMapping`并通过 `@RequestMaping`配置的参数生成相应的RequestMappingInfo。RequestMappingInfo中保存了很多Request需要匹配的参数。
1、匹配请求Url PatternsRequestCondition patternsCondition;
2、匹配请求方法 GET等 RequestMethodsRequestCondition methodsCondition;
3、匹配参数例如@Requestmaping(Params="action=DoXxx") ParamsRequestCondition paramsCondition;
4、匹配请求头信息 HeadersRequestCondition headersCondition;
5、指定处理请求的提交内容类型（Content-Type），例如application/json, text/html; ConsumesRequestCondition consumesCondition;
6、指定返回的内容类型，仅当request请求头中的(Accept)类型中包含该指定类型才返回ProducesRequestCondition producesCondition;
7、用于用户定制请求条件 RequestConditionHolder customConditionHolder; 举个例子，当我们有一个需求只要请求中包含某一个参数时都可以掉这个方法处理，就可以定制这个匹配条件。
``` 
    //使用方法和类型级别RequestMapping注解来创建RequestMappingInfo
	@Override
	protected RequestMappingInfo getMappingForMethod(Method method, Class<?> handlerType) {
		RequestMappingInfo info = null;
        //获取method的@RequestMapping
		RequestMapping methodAnnotation = AnnotationUtils.findAnnotation(method, RequestMapping.class);
		if (methodAnnotation != null) {
			RequestCondition<?> methodCondition = getCustomMethodCondition(method);
			info = createRequestMappingInfo(methodAnnotation, methodCondition);
            //获取method所属bean的@RequtestMapping注解
			RequestMapping typeAnnotation = AnnotationUtils.findAnnotation(handlerType, RequestMapping.class);
			if (typeAnnotation != null) {
				RequestCondition<?> typeCondition = getCustomTypeCondition(handlerType);
                //合并两个@RequestMapping注解
				info = createRequestMappingInfo(typeAnnotation, typeCondition).combine(info);
			}
		}
		return info;
	}
```
###Spring5.0.4
```java
   /**
	 * Uses method and type-level @{@link RequestMapping} annotations to create
	 * the RequestMappingInfo.
	 * @return the created RequestMappingInfo, or {@code null} if the method
	 * does not have a {@code @RequestMapping} annotation.
	 * @see #getCustomMethodCondition(Method)
	 * @see #getCustomTypeCondition(Class)
	 */
	@Override
	@Nullable
	protected RequestMappingInfo getMappingForMethod(Method method, Class<?> handlerType) {
		RequestMappingInfo info = createRequestMappingInfo(method);
		if (info != null) {
			RequestMappingInfo typeInfo = createRequestMappingInfo(handlerType);
			if (typeInfo != null) {
				info = typeInfo.combine(info);
			}
		}
		return info;
	}


   /**
	 * Delegates to {@link #createRequestMappingInfo(RequestMapping, RequestCondition)},
	 * supplying the appropriate custom {@link RequestCondition} depending on whether
	 * the supplied {@code annotatedElement} is a class or method.
	 * @see #getCustomTypeCondition(Class)
	 * @see #getCustomMethodCondition(Method)
	 */
	@Nullable
	private RequestMappingInfo createRequestMappingInfo(AnnotatedElement element) {
		RequestMapping requestMapping = AnnotatedElementUtils.findMergedAnnotation(element, RequestMapping.class);
		RequestCondition<?> condition = (element instanceof Class ?
				getCustomTypeCondition((Class<?>) element) : getCustomMethodCondition((Method) element));
		return (requestMapping != null ? createRequestMappingInfo(requestMapping, condition) : null);
	}
```
根据handler method创建`RequestMappingInfo`实例
- 首先判断该 mehtod 是否含有  `RequestMpping`
若有则直接根据该注解的内容创建`RequestMappingInfo`对象
- 创建后判断当前method所属的bean是否也含有RequestMapping
若含有则会根据该类上的注解创建一个`RequestMappingInfo`实例,然后再合并method上的`RequestMappingInfo`对象，最后返回合并后的对象。

回看`detectHandlerMethods`，有两处调用了`getMappingForMethod`，个人觉得这里是可以优化的，在第一处判断method是否为handler时，创建的`RequestMappingInfo`对象可以保存起来，直接拿来后面使用，就少了一次创建`RequestMappingInfo`实例过程。
然后紧接着进入`registerHandlerMehtod`
##2.5  注册RequestMappingInfo
###Spriing4.0.3版本
```
protected void registerHandlerMethod(Object handler, Method method, T mapping) {
  //创建HandlerMethod
  HandlerMethod newHandlerMethod = createHandlerMethod(handler, method);
  HandlerMethod oldHandlerMethod = handlerMethods.get(mapping);
  //检查配置是否存在歧义性
  if (oldHandlerMethod != null && !oldHandlerMethod.equals(newHandlerMethod)) {
      throw new IllegalStateException("Ambiguous mapping found. Cannot map '" + newHandlerMethod.getBean()
            + "' bean method \n" + newHandlerMethod + "\nto " + mapping + ": There is already '"
            + oldHandlerMethod.getBean() + "' bean method\n" + oldHandlerMethod + " mapped.");
  }
  this.handlerMethods.put(mapping, newHandlerMethod);
  if (logger.isInfoEnabled()) {
      logger.info("Mapped \"" + mapping + "\" onto " + newHandlerMethod);
  }
  //获取@RequestMapping注解的value，然后添加value->RequestMappingInfo映射记录至urlMap中
  Set<String> patterns = getMappingPathPatterns(mapping);
  for (String pattern : patterns) {
      if (!getPathMatcher().isPattern(pattern)) {
        this.urlMap.add(pattern, mapping);
      }
  }
}
```
这里T的类型是`RequestMappingInfo`
这个对象就是封装的具体Controller下的方法的`RequestMapping`注解的相关信息
一个 ` RequestMapping  `注解对应一个`RequestMappingInfo`实例
`HandlerMethod`和`RequestMappingInfo`类似，是对Controlelr下具体处理方法的封装。
第一行,根据handler和mehthod创建`HandlerMethod`对象
第二行通过handlerMethods map来获取当前mapping对应的`HandlerMethod`
然后判断是否存在相同的RequestMapping配置。如下这种配置就会导致此处抛
    `Invocation of init method failed; nested exception is java.lang.IllegalStateException: Ambiguous mapping found. Cannot map...`
    异常
##Spring5.0.4版本
这一步 Spring Mvc 会保存 
Map<RequestmappingInfo, HandlerMethod>
Map<url, RequestmappingInfo>的映射关系
DispatcherServlet.doDispatch()方法联系起来，doDispatch方法通过 url 在Map<url, RequestmappingInfo>中获取对应的 RequestMappingInfo 再根据request的信息和RequestMappingInfo的各个条件比较是否满足处理条件，如果不满足返回 404 如果满足通过RequestMappingInfo在Map<RequestmappingInfo, HandlerMethod>获取正真处理该请求的方法HandlerMathod.
最后通过反射执行具体的方法（Controller 方法）。
![](https://upload-images.jianshu.io/upload_images/4685968-c406b09344ec50c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
进入register看看
```java
public void register(T mapping, Object handler, Method method) {
			this.readWriteLock.writeLock().lock();
			try {
                //创建HandlerMethod
				HandlerMethod handlerMethod = createHandlerMethod(handler, method);
				assertUniqueMethodMapping(handlerMethod, mapping);

				if (logger.isInfoEnabled()) {
					logger.info("Mapped \"" + mapping + "\" onto " + handlerMethod);
				}
                //保存RequestMappingInfo 和 HandlerMathod的映射关系
				this.mappingLookup.put(mapping, handlerMethod);

				List<String> directUrls = getDirectUrls(mapping);
				for (String url : directUrls) {
                    //保存 Request Url 和 RequestMappingInfo 的对应关系
					this.urlLookup.add(url, mapping);
				}

				String name = null;
				if (getNamingStrategy() != null) {
					name = getNamingStrategy().getName(handlerMethod, mapping);
					addMappingName(name, handlerMethod);
				}

				CorsConfiguration corsConfig = initCorsConfiguration(handler, method, mapping);
				if (corsConfig != null) {
					this.corsLookup.put(handlerMethod, corsConfig);
				}

				this.registry.put(mapping, new MappingRegistration<>(mapping, handlerMethod, directUrls, name));
			}
			finally {
				this.readWriteLock.writeLock().unlock();
			}
		}
```
```
@Controller
@RequestMapping("/AmbiguousTest")
public class AmbiguousTestController {
    @RequestMapping(value = "/test1")
    @ResponseBody
    public String test1(){
        return "method test1";
    }

    @RequestMapping(value = "/test1")
    @ResponseBody
    public String test2(){
        return "method test2";
    }
}

```
在SpingMVC启动（初始化）阶段检查RequestMapping配置是否有歧义
确认配置正常以后会把该RequestMappingInfo和HandlerMethod对象添加至handlerMethods（LinkedHashMap）
接着把RequestMapping注解的value和ReuqestMappingInfo对象添加至urlMap中
## registerHandlerMethod方法总结
- 检查`RequestMapping`注解配置是否有歧义
- 构建`RequestMappingInfo`到`HandlerMethod`的映射map
该map便是`AbstractHandlerMethodMapping`的成员变量handlerMethods。LinkedHashMap。
- 构建`AbstractHandlerMethodMapping`的成员变量urlMap，MultiValueMap
这个数据结构可以把它理解成Map。其中String类型的key存放的是处理方法上RequestMapping注解的value。就是具体的uri

有如下Controller
```
@Controller
@RequestMapping("/UrlMap")
public class UrlMapController {

    @RequestMapping(value = "/test1", method = RequestMethod.GET)
    @ResponseBody
    public String test1(){
        return "method test1";
    }

    @RequestMapping(value = "/test1")
    @ResponseBody
    public String test2(){
        return "method test2";
    }

    @RequestMapping(value = "/test3")
    @ResponseBody
    public String test3(){
        return "method test3";
    }
}

```
*   初始化完成后，对应`AbstractHandlerMethodMapping`的urlMap的结构如下
![](http://upload-images.jianshu.io/upload_images/4685968-31e763842ad02d43..jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
*   以上便是SpringMVC初始化的主要过程

查找过程

*   为了理解查找流程，带着一个问题来看，现有如下Controller

```
@Controller
@RequestMapping("/LookupTest")
public class LookupTestController {

    @RequestMapping(value = "/test1", method = RequestMethod.GET)
    @ResponseBody
    public String test1(){
        return "method test1";
    }

    @RequestMapping(value = "/test1", headers = "Referer=https://www.baidu.com")
    @ResponseBody
    public String test2(){
        return "method test2";
    }

    @RequestMapping(value = "/test1", params = "id=1")
    @ResponseBody
    public String test3(){
        return "method test3";
    }

    @RequestMapping(value = "/*")
    @ResponseBody
    public String test4(){
        return "method test4";
    }
}

```

*   有如下请求

<figure style="box-sizing: inherit; margin: 24px 0px;">![image](http://upload-images.jianshu.io/upload_images/4685968-b92869d6d8f452d1..jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

</figure>

*   这个请求会进入哪一个方法？
*   web容器（Tomcat、jetty）接收请求后，交给DispatcherServlet处理。FrameworkServlet调用对应请求方法（eg:get调用doGet），然后调用processRequest方法。进入processRequest方法后，一系列处理后，在line:936进入doService方法。然后在Line856进入doDispatch方法。在line:896获取当前请求的处理器handler。然后进入AbstractHandlerMethodMapping的lookupHandlerMethod方法。代码如下

```
protected HandlerMethod lookupHandlerMethod(String lookupPath, HttpServletRequest request) throws Exception {
  List<Match> matches = new ArrayList<Match>();
   //根据uri获取直接匹配的RequestMappingInfos
  List<T> directPathMatches = this.urlMap.get(lookupPath);
  if (directPathMatches != null) {
      addMatchingMappings(directPathMatches, matches, request);
  }
  //不存在直接匹配的RequetMappingInfo，遍历所有RequestMappingInfo
  if (matches.isEmpty()) {
      // No choice but to go through all mappings
      addMatchingMappings(this.handlerMethods.keySet(), matches, request);
  }
   //获取最佳匹配的RequestMappingInfo对应的HandlerMethod
  if (!matches.isEmpty()) {
      Comparator<Match> comparator = new MatchComparator(getMappingComparator(request));
      Collections.sort(matches, comparator);

      if (logger.isTraceEnabled()) {
        logger.trace("Found " + matches.size() + " matching mapping(s) for [" + lookupPath + "] : " + matches);
      }
      //再一次检查配置的歧义性
      Match bestMatch = matches.get(0);
      if (matches.size() > 1) {
        Match secondBestMatch = matches.get(1);
        if (comparator.compare(bestMatch, secondBestMatch) == 0) {
            Method m1 = bestMatch.handlerMethod.getMethod();
            Method m2 = secondBestMatch.handlerMethod.getMethod();
            throw new IllegalStateException(
                  "Ambiguous handler methods mapped for HTTP path '" + request.getRequestURL() + "': {" +
                  m1 + ", " + m2 + "}");
        }
      }

      handleMatch(bestMatch.mapping, lookupPath, request);
      return bestMatch.handlerMethod;
  }
  else {
      return handleNoMatch(handlerMethods.keySet(), lookupPath, request);
  }
}

```

*   进入lookupHandlerMethod方法，其中lookupPath="/LookupTest/test1",根据lookupPath，也就是请求的uri。直接查找urlMap，获取直接匹配的RequestMappingInfo list。这里会匹配到3个RequestMappingInfo。如下

<figure style="box-sizing: inherit; margin: 24px 0px;">![image](http://upload-images.jianshu.io/upload_images/4685968-77d93dc665b733ce..jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

</figure>

*   然后进入addMatchingMappings方法

```
private void addMatchingMappings(Collection<T> mappings, List<Match> matches, HttpServletRequest request) {
  for (T mapping : mappings) {
      T match = getMatchingMapping(mapping, request);
      if (match != null) {
        matches.add(new Match(match, handlerMethods.get(mapping)));
      }
  }
}

```

*   这个方法的职责是遍历当前请求的uri和mappings中的RequestMappingInfo能否匹配上，如果能匹配上，创建一个相同的RequestMappingInfo对象。再获取RequestMappingInfo对应的handlerMethod。然后创建一个Match对象添加至matches list中。执行完addMatchingMappings方法，回到lookupHandlerMethod。这时候matches还有3个能匹配上的RequestMappingInfo对象。接下来的处理便是对matchers列表进行排序，然后获取列表的第一个元素作为最佳匹配。返回Match的HandlerMethod。这里进入RequestMappingInfo的compareTo方法，看一下具体的排序逻辑。代码如下

```
public int compareTo(RequestMappingInfo other, HttpServletRequest request) {
  int result = patternsCondition.compareTo(other.getPatternsCondition(), request);
  if (result != 0) {
      return result;
  }
  result = paramsCondition.compareTo(other.getParamsCondition(), request);
  if (result != 0) {
      return result;
  }
  result = headersCondition.compareTo(other.getHeadersCondition(), request);
  if (result != 0) {
      return result;
  }
  result = consumesCondition.compareTo(other.getConsumesCondition(), request);
  if (result != 0) {
      return result;
  }
  result = producesCondition.compareTo(other.getProducesCondition(), request);
  if (result != 0) {
      return result;
  }
  result = methodsCondition.compareTo(other.getMethodsCondition(), request);
  if (result != 0) {
      return result;
  }
  result = customConditionHolder.compareTo(other.customConditionHolder, request);
  if (result != 0) {
      return result;
  }
  return 0;
}

```

*   代码里可以看出，匹配的先后顺序是value>params>headers>consumes>produces>methods>custom，看到这里，前面的问题就能轻易得出答案了。在value相同的情况，params更能先匹配。所以那个请求会进入test3()方法。再回到lookupHandlerMethod，在找到HandlerMethod。SpringMVC还会这里再一次检查配置的歧义性，这里检查的原理是通过比较匹配度最高的两个RequestMappingInfo进行比较。此处可能会有疑问在初始化SpringMVC有检查配置的歧义性，这里为什么还会检查一次。假如现在Controller中有如下两个方法，以下配置是能通过初始化歧义性检查的。

```
@RequestMapping(value = "/test5", method = {RequestMethod.GET, RequestMethod.POST})
@ResponseBody
public String test5(){
    return "method test5";
}
@RequestMapping(value = "/test5", method = {RequestMethod.GET, RequestMethod.DELETE})
@ResponseBody
public String test6(){
    return "method test6";
}

```

*   现在执行 http://localhost:8080/SpringMVC-Demo/LookupTest/test5 请求，便会在lookupHandlerMethod方法中抛
    `java.lang.IllegalStateException: Ambiguous handler methods mapped for HTTP path 'http://localhost:8080/SpringMVC-Demo/LookupTest/test5'`异常。这里抛该异常是因为RequestMethodsRequestCondition的compareTo方法是比较的method数。代码如下

```
public int compareTo(RequestMethodsRequestCondition other, HttpServletRequest request) {
  return other.methods.size() - this.methods.size();
}

```

*   什么时候匹配通配符？当通过urlMap获取不到直接匹配value的RequestMappingInfo时才会走通配符匹配进入addMatchingMappings方法。

#总结
Spring Mvc的初始化过程比较清晰，整个过程Spring 提供的方法很多都是 protected修饰的这样我们可以通过继承灵活的定制我们的需求。
回顾一下整个初始化过程：


通过Spring容器对 InitalizingBean.afterPropertiesSet()方法的支持开始初始化流程。


获取容器中的所有 bean 通过 isHandler()方法区分是否需要处理。


通过方法上的@RequestMapping注解创建 RequestMappingInfo


注册、保存保存 Map<RequestmappingInfo, HandlerMethod>、Map<url, RequestmappingInfo>的映射关系方便后续调用和Request匹配。

