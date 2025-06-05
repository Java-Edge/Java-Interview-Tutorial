# Spring 原型 Bean 的“单例劫”：@Lookup 如何破局，确保每次获取新实例？

## 1 案例：原型 Bean 被固定

使用原型 Bean：

```java
package com.javaedge.spring.service;

/**
 * @author JavaEdge
 */
@Service
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class JavaService {
}
```

这么用：

```java
package com.javaedge.spring.controller;

@RestController
public class MyController {

    @Autowired
    private JavaService javaService;

    @GetMapping("hello")
    public String hello() {
        return "hello: " + javaService;
    }
```

不管访问多少次[http://localhost:12345/hello](http://localhost:12345/hello)，返回值不变：

![](https://p.ipic.vip/jqzjki.png)

不是定义成原型 Bean了，没生效？

## 2 答疑

当一个属性成员 javaService 声明为@Autowired，创建 MyController Bean 时，会先用构造器反射出实例，然后装配各标记@Autowired的属性成员。

装配方法AbstractAutowireCapableBeanFactory#populateBean，会用很多BeanPostProcessor，其中AutowiredAnnotationBeanPostProcessor通过 DefaultListableBeanFactory#findAutowireCandidates 寻找到 JavaService 类型 Bean，再设置给对应属性（即 javaService成员）。

### inject

AutowiredAnnotationBeanPostProcessor.AutowiredFieldElement：

```java
protected void inject(Object bean, @Nullable String beanName, PropertyValues pvs) {
   Field field = (Field) this.member;
   Object value;
   // 寻找bean
   if (this.cached) {
      value = resolvedCachedArgument(beanName, this.cachedFieldValue);
   }
   else {
     // ...
     value = beanFactory.resolveDependency(desc, beanName, autowiredBeanNames, typeConverter);
   }
   if (value != null) {
      // 将bean设置给成员字段
      ReflectionUtils.makeAccessible(field);
      field.set(bean, value);
   }
}
```

找到要自动注入的 Bean 后，即反射设置给对应field。这个field的执行只发生一次，所以后续就固定，不会因ServiceImpl标记了 **SCOPE_PROTOTYPE** 而改变。

所以，当一个单例Bean用@Autowired标记其属性时，该属性值会被固定！

## 3 修正

不能将 JavaService 的 Bean 固定到属性，而应每次用时都重新获取一次。修正方案：

### 3.1 自动注入 Context

即自动注入ApplicationContext，再定义 getJavaService 方法以获取一个新 JavaService 实例：

```java
@RestController
public class MyController {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private JavaService javaService;

    @GetMapping("hello")
    public String hello() {
        return "hello: " + getJavaService();
    }

    public JavaService getJavaService() {
  		return applicationContext.getBean(JavaService.class);
    }
}
```

### 使用 Lookup 注解

还是要添加一个 getServiceImpl 方法，不过这个方法是被 Lookup 标记的：

```java
@RestController
public class MyController {

    @Autowired
    private JavaService javaService;

    @GetMapping("hello")
    public String hello() {
        return "hello: " + getJavaService();
    }
 
  	@Lookup
    public JavaService getJavaService() {
  		return null;
    }
}
```

这样每次访问该接口，都会创建新的Bean。

## 4 Lookup原理

最终执行因@Lookup而走入CglibSubclassingInstantiationStrategy.LookupOverrideMethodInterceptor，其关键实现参考 LookupOverrideMethodInterceptor的

### intercept

```java
private final BeanFactory owner;

public Object intercept(Object obj, Method method, Object[] args, MethodProxy mp) throws Throwable {
   LookupOverride lo = (LookupOverride) getBeanDefinition().getMethodOverrides().getOverride(method);
   Assert.state(lo != null, "LookupOverride not found");
   Object[] argsToUse = (args.length > 0 ? args : null);  // if no-arg, don't insist on args at all
   if (StringUtils.hasText(lo.getBeanName())) {
      return (argsToUse != null ? this.owner.getBean(lo.getBeanName(), argsToUse) :
            this.owner.getBean(lo.getBeanName()));
   }
   else {
      return (argsToUse != null ? this.owner.getBean(method.getReturnType(), argsToUse) :
            this.owner.getBean(method.getReturnType()));
   }
}
```

方法调用最终没有走入案例代码实现的return null语句，而是通过 BeanFactory 获取 Bean。从这点看出，在getServiceImpl方法实现中，随便咋写都行，不重要。

如用下面实现来测试这结论：

```java
@Lookup
public ServiceImpl getServiceImpl() {
    // 日志会输出么？
    log.info("executing this method");
    return null;
}  
```

以上代码，添加了一行代码输出日志。测试后，发现没有日志输出。这也验证了，用@Lookup注解一个方法时，方法具体实现已不重要。

Q：再回溯分析，为啥走入CGLIB搞出的类？

A：因为我们有方法标记Lookup。可从下面这段验证，参考 SimpleInstantiationStrategy#instantiate：

```java
@Override
public Object instantiate(RootBeanDefinition bd, String beanName, BeanFactory owner) {
   // Don't override the class with CGLIB if no overrides.
   if (!bd.hasMethodOverrides()) {
      return BeanUtils.instantiateClass(constructorToUse);
   }
   else {
      // Must generate CGLIB subclass.
      return instantiateWithMethodInjection(bd, beanName, owner);
   }
}
```

当 hasMethodOverrides 为 true，则用 CGLIB。而本案例该条件成立在于解析HelloWorldController这Bean时，发现有方法被@Lookup，此时就会添加相应方法到属性methodOverrides 里面去（此过程由 AutowiredAnnotationBeanPostProcessor#determineCandidateConstructors 完成）。

添加后效果图如下：