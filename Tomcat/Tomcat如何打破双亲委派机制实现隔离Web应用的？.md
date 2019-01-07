Tomcat通过自定义类加载器WebAppClassLoader打破双亲委派，即重写了JVM的类加载器ClassLoader的findClass方法和loadClass方法，以优先加载Web应用目录下的类。

Tomcat负责加载我们的Servlet类、加载Servlet所依赖的JAR包。Tomcat本身也是个Java程序，因此它需要加载自己的类和依赖的JAR包。

若在Tomcat运行两个Web应用程序，它们有功能不同的同名Servlet，Tomcat需同时加载和管理这两个同名的Servlet类，保证它们不会冲突。所以Web应用之间的类需要隔离

若两个Web应用都依赖同一三方jar，比如Spring，则Spring jar被加载到内存后，Tomcat要保证这两个Web应用能共享之，即Spring jar只被加载一次，否则随着三方jar增多，JVM的内存会占用过大。
所以，和 JVM 一样，需要隔离Tomcat本身的类和Web应用的类。
# Tomcat类加载器的层次结构
- Tomcat的类加载器层次结构
![](https://img-blog.csdnimg.cn/06ef794a266541b89089131a8c51d8f6.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

- 前三个是加载器实例名，不是类名。![](https://img-blog.csdnimg.cn/f59d56811c574170a2969f620d4be934.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

## WebAppClassLoader
若使用JVM默认的AppClassLoader加载Web应用，AppClassLoader只能加载一个Servlet类，在加载第二个同名Servlet类时，AppClassLoader会返回第一个Servlet类的Class实例。
因为在AppClassLoader眼里，同名Servlet类只能被加载一次。

于是，Tomcat自定义了一个类加载器**WebAppClassLoader**， 并为每个Web应用创建一个**WebAppClassLoader**实例。

每个Web应用自己的Java类和依赖的JAR包，分别放在`WEB-INF/classes`和`WEB-INF/lib`目录下，都是WebAppClassLoader加载的。

Context容器组件对应一个Web应用，因此，每个Context容器创建和维护一个WebAppClassLoader加载器实例。
不同加载器实例加载的类被认为是不同的类，即使类名相同。这就相当于在JVM内部创建相互隔离的Java类空间，每个Web应用都有自己的类空间，Web应用之间通过各自的类加载器互相隔离。

## SharedClassLoader
两个Web应用之间怎么共享库类，并且不能重复加载相同的类？

双亲委派机制的各子加载器都能通过父加载器去加载类，于是考虑把需共享的类放到父加载器的加载路径。

应用程序即是通过该方式共享JRE核心类。
Tomcat搞了个类加载器SharedClassLoader，作为WebAppClassLoader的父加载器，以加载Web应用之间共享的类。

若WebAppClassLoader未加载到某类，就委托父加载器SharedClassLoader去加载该类，SharedClassLoader会在指定目录下加载共享类，之后返回给WebAppClassLoader，即可解决共享问题。

## CatalinaClassLoader
如何隔离Tomcat本身的类和Web应用的类？

兄弟关系：两个类加载器是平行的，它们可能拥有同一父加载器，但两个兄弟类加载器加载的类是隔离的。

于是，Tomcat搞了CatalinaClassLoader，专门加载Tomcat自身的类。

问题是，当Tomcat和各Web应用之间需要共享一些类时该怎么办？

## CommonClassLoader
共享依旧靠父子关系。
再增加个CommonClassLoader，作为CatalinaClassLoader和SharedClassLoader的父加载器。

CommonClassLoader能加载的类都可被CatalinaClassLoader、SharedClassLoader 使用，而CatalinaClassLoader和SharedClassLoader能加载的类则与对方相互隔离。WebAppClassLoader可以使用SharedClassLoader加载到的类，但各个WebAppClassLoader实例之间相互隔离。

# Spring的加载问题
JVM默认情况下，若一个类由类加载器A加载，则该类的依赖类也由相同的类加载器加载。
比如Spring作为一个Bean工厂，它需要创建业务类的实例，并且在创建业务类实例之前需要加载这些类。Spring是通过调用Class.forName来加载业务类的，我们来看一下forName的源码：
```java
public static Class<?> forName(String className) {
    Class<?> caller = Reflection.getCallerClass();
    return forName0(className, true, ClassLoader.getClassLoader(caller), caller);
}
```
会使用调用者，即Spring的加载器去加载业务类。

Web应用之间共享的jar可交给SharedClassLoader加载，以避免重复加载。Spring作为共享的三方jar，本身由SharedClassLoader加载，Spring又要去加载业务类，按照前面那条规则，加载Spring的类加载器也会用来加载业务类，但是业务类在Web应用目录下，不在SharedClassLoader的加载路径下，这该怎么办呢？
## 线程上下文加载器
于是有了线程上下文加载器，一种类加载器传递机制。因为该类加载器保存在线程私有数据里，只要是同一个线程，一旦设置了线程上下文加载器，在线程后续执行过程中就能把这个类加载器取出来用。因此Tomcat为每个Web应用创建一个WebAppClassLoader类加载器，并在启动Web应用的线程里设置线程上下文加载器，这样Spring在启动时就将线程上下文加载器取出来，用来加载Bean。Spring取线程上下文加载的代码如下：
```java
cl = Thread.currentThread().getContextClassLoader();
```

在StandardContext的启动方法，会将当前线程的上下文加载器设置为WebAppClassLoader。
![](https://img-blog.csdnimg.cn/fc59c5e9cfd6473183c67cf7bd91329a.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

启动方法结束时，会恢复线程的上下文加载器：
```java
Thread.currentThread().setContextClassLoader(originalClassLoader);
```

> 这是为什么呢？

线程上下文加载器其实是线程的一个私有数据，跟线程绑定，这个线程完成启动Context组件后，会被回收到线程池，之后被用来做其他事情，为了不影响其他事情，需恢复之前的线程上下文加载器。
优先加载web应用的类，当加载完了再改回原来的。

线程上下文的加载器就是指定子类加载器来加载具体的某个桥接类，比如JDBC的Driver的加载。
# 总结
Tomcat的Context组件为每个Web应用创建一个WebAppClassLoader类加载器，由于不同类加载器实例加载的类是互相隔离的，因此达到了隔离Web应用的目的，同时通过CommonClassLoader等父加载器来共享第三方JAR包。而共享的第三方JAR包怎么加载特定Web应用的类呢？可以通过设置线程上下文加载器来解决。

多个应用共享的Java类文件和JAR包，分别放在Web容器指定的共享目录：
- CommonClassLoader
对应 `<Tomcat>/common/*`
- CatalinaClassLoader
对应 `<Tomcat >/server/*`
- SharedClassLoader
对应 `<Tomcat >/shared/*`
- WebAppClassloader
对应 `<Tomcat >/webapps/<app>/WEB-INF/*`

可以在Tomcat conf目录下的Catalina.properties文件里配置各种类加载器的加载路径。


当出现ClassNotFound错误时，应该检查你的类加载器是否正确。
线程上下文加载器不仅仅可以用在Tomcat和Spring类加载的场景里，核心框架类需要加载具体实现类时都可以用到它，比如我们熟悉的JDBC就是通过上下文类加载器来加载不同的数据库驱动的。