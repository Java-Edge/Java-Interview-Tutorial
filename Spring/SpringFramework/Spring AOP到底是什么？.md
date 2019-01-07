IoC和AOP生而就是为了解耦和扩展。

# 什么是 IoC?

一种设计思想，将设计好的对象交给Spring容器控制，而非直接在对象内部控制。

> 为啥要让容器来管理对象呢？你这程序员咋就知道甩锅呢？
![](https://img-blog.csdnimg.cn/20210512150222541.png)

拥有初级趣味的码农，可能只是觉着使用IoC方便，就是个用来解耦的，但这还远非容器的益处。
利用容器管理所有的框架、业务对象，我们可以做到：
- 无侵入调整对象的关系
- 无侵入地随时调整对象的属性
- 实现对象的替换

这使得框架开发者在后续实现一些扩展就很容易。

# 什么是AOP？

AOP实现了高内聚、低耦合，在切面集中实现横切关注点（缓存、权限、日志等），然后通过切点配置把代码注入到合适的位置。

# 基本概念
- **连接点（Join point）**
就是方法执行
- **切点（Pointcut）**
Spring AOP默认使用AspectJ查询表达式，通过在连接点运行查询表达式来匹配切点
- **增强（Advice）**
也叫作通知，定义了切入切点后增强的方式，包括前、后、环绕等。Spring AOP中，把增强定义为拦截器
- **切面（Aspect）**
切面=切点+增强

### Declaring Advice
有如下三类增强：
#### @Before
#### @After
#### @Around
**环绕通知**运行 **around** 匹配方法的执行。它有机会在方法运行之前和之后都工作，并确定方法实际运行何时、如何甚至是否执行。若你需要以线程安全的方式（例如启动和停止计时器）在方法执行前后共享状态，则通常会使用Around advice。

使用案例：
```java
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.ProceedingJoinPoint;

@Aspect
public class AroundExample {

    @Around("com.xyz.myapp.CommonPointcuts.businessService()")
    public Object doBasicProfiling(ProceedingJoinPoint pjp) throws Throwable {
        // start stopwatch
        Object retVal = pjp.proceed();
        // stop stopwatch
        return retVal;
    }
}
```
around advice 返回的值就是方法调用者看到的返回值。例如，一个简单的缓存aspect可以返回一个值从缓存（如果它有）或调用`procedd`如果它没有。请注意，可以多次调用`procedd`，或者根本不在around advice的主体内调用，这都是合法的。

推荐始终使用最不强大的advice形式，以满足需求。

使用 **@Around** 注解声明环绕通知时，第一个参数必须是ProceedingJoinPoint类型。
在通知的方法体中，调用 `proceed()` 会导致基础方法运行。 `proceed()` 也可以在Object[]中传递。数组中的值在进行时用作方法执行的参数。
#### Advice参数
Spring 提供全种类的通知，这意味着你在通知的方法签名中声明所需参数，而非和`Object[]`协作。
如何编写通用的通知，以便了解通知方法当前在通知啥玩意。
#### Access to the Current JoinPoint
任何通知方法都可能声明类型`org.aspectj.lang.JoinPoint` 的参数（请注意，围绕建议需要申报类型'继续JoinPoint'的第一参数，该参数是 JoinPoint 的子类。
JoinPoint 接口提供了许多有用的方法：
- getArgs()
返回方法的参数
- getThis()
返回代理对象
- getTarget()
返回目标对象
- getSignature()
Returns a description of the method that is being advised.
- toString()
Prints a useful description of the method being advised.