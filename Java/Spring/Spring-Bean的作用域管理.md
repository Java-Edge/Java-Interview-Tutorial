 Spring框架支持5种作用域，有三种作用域是当开发者使用基于web的`ApplicationContext`的时候才生效的

下面就是Spring内置支持的作用域

| 作用域 | 描述 |
| --- | --- |
| 单例(singleton)   | （默认）每一个Spring IoC容器都拥有唯一的一个实例对象 |
| 原型(prototype) | 一个Bean定义可以创建任意多个实例对象 |
| 请求（request） | 一个HTTP请求会产生一个Bean对象，也就是说，每一个HTTP请求都有自己的Bean实例。只在基于web的Spring `ApplicationContext`中可用 |
| 会话（session） | 限定一个Bean的作用域为HTTP`session`的生命周期。同样，只有基于web的Spring `ApplicationContext`才能使用 |
| 全局会话(global session） | 限定一个Bean的作用域为全局HTTP`Session`的生命周期。通常用于门户网站场景，同样，只有基于web的Spring `ApplicationContext`可用 |
| 应用(application) | 限定一个Bean的作用域为`ServletContext`的生命周期。同样，只有基于web的Spring `ApplicationContext`可用 |

> 在Spring 3.0中，*线程作用域*是可用的，但不是默认注册的

#1.  singleton
全局只有一个共享的实例,所有将单例Bean作为依赖的情况下,容器返回将是同一个实例

换言之，当开发者定义一个Bean的作用域为单例时，Spring IoC容器只会根据Bean定义来创建该Bean的唯一实例。这些唯一的实例会缓存到容器中，后续针对单例Bean的请求和引用，都会从这个缓存中拿到这个唯一的实例
![](http://upload-images.jianshu.io/upload_images/4685968-0c56982970cc16e6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.1 单例Bean和单例模式
- 单例模式是将一个对象的作用域硬编码，一个ClassLoader只有唯一的一个实例 
- 而Spring的单例作用域，是`基于每个容器`，每个Bean只有一个实例
这意味着，如果开发者根据一个类定义了一个Bean在单个的Spring容器中，那么Spring容器会根据Bean定义创建一个唯一的Bean实例。默认情况下，它们为每个给定的org.springframework.context.ApplicationContext实例存在唯一的一个bean (有点别扭，也就是可以有多个Spring容器，每一个容器内存在唯一bean实例).这意味着如果你有两个或更多上下文，所有这些上下文都由同一Java的类加载器管理(因为在同一个jvm环境中)，则可能会有多个给定bean的实例。唯一需要做到的是必须在每个上下文中定义此bean.

所以你可以看到，bean只是`一个上下文的单例`
你不应该将Spring的单例概念与设计模式中的的单例混淆

 *单例作用域是Spring的默认作用域*，下面的例子是在基于XML的配置中配置单例模式的Bean。

```
<bean id="accountService" class="com.sss.DefaultAccountService"/>

<!-- the following is equivalent, though redundant (singleton scope is the default) -->
<bean id="accountService" class="com.sss.DefaultAccountService" scope="singleton"/>

```
#2. prototype
每次请求Bean实例时，返回的都是新实例的Bean对象
也就是说，每次注入到另外的Bean或者通过调用`getBean()`来获得的Bean都将是全新的实例。 
这是基于线程安全性的考虑，如果使用有状态的Bean对象用prototype 作用域，而无状态的Bean对象用singleton 作用域。

下面的例子说明了Spring的原型作用域。DAO通常不会配置为原型对象，因为典型的DAO是不会有任何的状态的。
![](http://upload-images.jianshu.io/upload_images/4685968-0a35694b27f5a359.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

下面的例子展示了XML中如何定义一个原型的Bean：
```
<bean id="accountService" class="com.sss.DefaultAccountService" scope="prototype"/>
```
与其他的作用域相比，Spring不会完全管理原型Bean的生命周期：
Spring容器只会初始化配置以及装载这些Bean，传递给Client。
但是之后就不会再去管原型Bean之后的动作了。
 
也就是说，初始化生命周期回调方法在所有作用域的Bean是都会调用的，但是销毁生命周期回调方法在原型Bean是不会调用的

所以，客户端代码必须注意清理原型Bean以及释放原型Bean所持有的一些资源。
 可以通过使用自定义的`bean post-processor`来让Spring释放掉原型Bean所持有的资源。

在某些方面来说，Spring容器的角色就是取代了Java的`new`操作符，所有的生命周期的控制需要由客户端来处理。
## 2-1 Singleton beans with prototype-bean dependencies
###在原型bean中放置单例
如果注入的单例对象真的是一个单例的bean(没有状态)，这个真的没一点问题
想象一下，对于我们的购物车，我们需要注入产品服务。此服务只会检查添加到购物车的产品是否库存。由于服务没有状态，并且会基于在方法签名中所传递的对象进行验证，因此不存在风险

当使用单例Bean的时候，而该单例Bean的依赖是原型Bean时，需要注意的是**依赖的解析都是在初始化的阶段**
因此，如果将原型Bean注入到单例的Bean之中，只会请求一次原型Bean，然后注入到单例Bean中。这个依赖的原型Bean仍然属于只有一个实例的。

然而，假设你需要单例Bean对原型的Bean的依赖
需要每次在运行时都请求一个新的实例，那么你就不能够将一个原型的Bean来注入到一个单例的Bean当中了，因为依赖注入只会进行*一次* 
当Spring容器在实例化单例Bean的时候，就会解析以及注入它所需的依赖
如果实在需要每次都请求一个新的实例，可以通过bean工厂手动获取实例,也可以参考[Dependencies](http://blog.didispace.com/books/spring-framework-4-reference/III.%20Core%20Technologies/Dependencies.html)中的**方法注入**部分。
##使用单例还是原型？
- Singleton适用于无状态的bean,比如一个service，DAO或者controller
他们都没有自己的状态(举个简单的例子，一个函数sin(x)，这个函数本身就是无状态的，所以我们现在喜欢的函数式编程也遵循这个理念)。而是根据传输的参数执行一些操作(作为HTTP请求参数)。
- 另一方面，我们可以通过状态bean管理一些状态。比如购物车bean，假如它是一个单例，那么两个不同消费者购买的产品将被放置在同一个对象上。而如果其中一个消费者想要删除一个产品，另一个消费者就铁定不高兴。这也就是状态类对象应该是原型
#3.  Request
Spring容器会在每次用到`loginAction`来处理每个HTTP请求的时候都会创建一个新的`LoginAction`实例。也就是说，`loginAction`Bean的作用域是HTTP`Request`级别的。 开发者可以随意改变实例的状态，因为其他通过`loginAction`请求来创建的实例根本看不到开发者改变的实例状态，所有创建的Bean实例都是根据独立的请求来的。当请求处理完毕，这个Bean也会销毁。
![](http://upload-images.jianshu.io/upload_images/4685968-49d6648d6c3d9556.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
每个请求初始化具有此作用域的Bean注解。这听起来像是原型作用域的描述，但它们有一些差异。
- 原型作用域在Spring的上下文中可用。而请求作用域仅适用于Web应用程序
- 原型bean根据需求进行初始化，而请求bean是在每个请求下构建的

需要说的是，request作用域bean在其作用域内有且仅有一个实例。而你可以拥有一个或多个原型作用域bean实例

在以下代码中，你可以看到请求作用域bean的示例：
```java
<bean id="shoppingCartRequest" class="com.sss.scope.ShoppingCartRequest" scope="request">
    <aop:scoped-proxy/> 
</bean>
```
当使用注解驱动组件或Java Config时，@RequestScope注解可以用于将一个组件分配给request作用域。
```java
@RequestScope
@Component
public class ShoppingCartRequest {
	// ...
}
// request bean
 
// injection sample
@Controller
public class TestController {
    @Autowired
    private ShoppingCartRequest shoppingCartRequest;
     
    @RequestMapping(value = "/test", method = RequestMethod.GET)
    public String test(HttpServletRequest request) {
        LOGGER.debug("shoppingCartRequest is :"+shoppingCartRequest);
        // ...
    }
}
```
请注意<bean>定义内存在的<aop: scoped-proxy />标签。这代表着使用代理对象。所以实际上，TestController持有的是代理对象的引用。我们所有的调用该对象都会转发到真正的ShoppingCartRequest对象。

有时我们需要使用DispatcherServlet的另一个servlet来处理请求。在这种情况下，我们必须确保Spring中所有请求都可用(否则可以抛出与下面类似的异常)。为此，我们需要在web.xml中定义一个监听器:
```java
<listener>   
  <listener-class>org.springframework.web.context.request.RequestContextListener</listener-class>
</listener>
```

调用/测试URL后，你应该能在日志中的发现以下信息:
```java
shoppingCartRequest is :com.migo.scope.ShoppingCartRequest@2586b11c
shoppingCartRequest is :com.migo.scope.ShoppingCartRequest@3bd5b945
```
如果我们尝试在单例bean中使用request作用域的bean，则会在应用程序上下文加载阶段抛出一个BeanCreationException
 #4. session
参考如下的Bean定义：

```
<bean id="userPreferences" class="com.foo.UserPreferences" scope="session"/>

```

Spring容器会在每次调用到`userPreferences`在一个单独的HTTP会话周期来创建一个新的`UserPreferences`实例。换言之，`userPreferences`Bean的作用域是HTTP`Session`级别的。 在`request-scoped`作用域的Bean上，开发者可以随意的更改实例的状态，同样，其他的HTTP`Session`基本的实例在每个Session都会请求`userPreferences`来创建新的实例，所以开发者更改Bean的状态，对于其他的Bean仍然是不可见的。当HTTP`Session`销毁了，那么根据这个`Session`来创建的Bean也就销毁了。

![](http://upload-images.jianshu.io/upload_images/4685968-e219a491ac3e8710.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
Session作用域的bean与request 作用域的bean没有太大不同。它们也与纯Web应用程序上下文相关联。注解为Session作用域的Bean对于每个用户的会话仅创建一次。他们在会话结束时被破坏销毁掉。

由Session作用域限制的Bean可以被认为是面向Web的单例，因为给定环境(用户会话)仅存在一个实例。但请记住，你无法在Web应用程序上下文中使用它们(说个好理解点的，就是一个函数内部自定义变量所在的作用域，函数执行完就销毁了，没有什么逃逸)。

想知道Session作用域bean在Spring中的操作，我们需要在配置文件中定义一个bean:
```java
<bean id="shoppingCartRequest" class="com.migo.scope.ShoppingCartSession" scope="session">

    <aop:scoped-proxy/> 

</bean>
```
通过`@Autowired`注解，查找这个bean的方式与request 作用域的bean相同。可以看到以下结果:
你可以看到，前5个打印输出代表相同的对象。最后一个是不同的。这是什么意思 ?简单来说，这代表 着一个新的用户使用自动注入的Session作用域访问该页面。我们可以通过打开两个浏览器的测试页(/test)来观察它。每个都将初始化一个新的会话Session，因此也就创建新的`ShoppingCartSession bean`实例。
#5. global session
> 该部分主要是描述`portlet`的，详情可以Google更多关于`portlet`的相关信息。

参考如下的Bean定义：

```
<bean id="userPreferences" class="com.foo.UserPreferences" scope="globalSession"/>

```

`global session`作用域比较类似之前提到的标准的HTTP`Session`，这种作用域是只应用于基于门户（portlet-based）的web应用的上下之中的。门户的Spec中定义的`global session`的意义：`global session`被所有构成门户的web应用所共享。定义为`global session`作用域的Bean是作用在全局门户`Session`的声明周期的。

如果在使用标准的基于Servlet的Web应用，而且定义了`global session`作用域的Bean，那么只是会使用标准的HTTP`Session`作用域，不会报错。
![](http://upload-images.jianshu.io/upload_images/4685968-100da62584121eeb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

关于全局会话作用域(Global session scope)属于4.3x的范畴了，Spring5已经没有了，Spring5文档是去掉了因为4的存在所以还是说两句，它保留给portlet应用程序。 是不是一脸懵逼，so，来解释一下portlet是什么。Portlet是能够生成语义代码(例如：HTML)片段的小型Java Web插件。它们基于portlet容器，可以像servlet一样处理HTTP请求。但是，与servlet不同，每个portlet都有不同的会话。在这种情况下，Spring提供了一个名为`global-session`的作用域。通过它，一个bean可以通过应用程序中的多个portlet共享。

至此，我们解释了请求和面向会话的作用域。第一个的作用是在每个request请求上创建新的bean。第二个在Session会话开始的时候初始化bean。

