# Spring之BeanNameAware和BeanFactoryAware接口

若 Spring 检测到 bean 实现了 Aware 接口，则会为其注入相应的依赖。所以**通过让bean 实现 Aware 接口，则能在 bean 中获得相应的 Spring 容器资源**。

Aware接口是回调，监听器和观察者设计模式的混合，它表示bean有资格通过回调方式被Spring容器通知。 

有时，我们得在 Bean 的初始化中使用 Spring 框架自身的一些对象来执行一些操作，比如

- 获取 ServletContext 的一些参数
- 获取 ApplicationContext 中的 BeanDefinition 的名字
- 获取 Bean 在容器中的名字等等。

为了让 Bean 可以获取到框架自身的一些对象，Spring 提供了一组Aware接口。

这些接口均继承自`org.springframework.beans.factory.Aware`标记接口，并提供一个将由 Bean 实现的set方法，Spring通过基于setter的依赖注入方式使相应的对象可以被Bean使用。

## 1 BeanFactory

Spring 针对 BeanFactory 类型的容器提供的 Aware 接口：

- BeanNameAware：注入当前 bean 对应 beanName。Spring将Bean ID传递给setBeanName()方法，通过Bean的引用获得Bean的ID，一般业务中很少用到Bean的ID
- BeanClassLoaderAware：注入加载当前 bean 的 ClassLoader
- BeanFactoryAware：注入当前BeanFactory容器的引用

![](https://img-blog.csdnimg.cn/e46266d73e0b40ec9ce9878bb5c089bf.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 1.1 BeanNameAware

使对象能够知道容器中定义的bean名称。 

```java
public class MyBeanName implements BeanNameAware {
    @Override
    public void setBeanName(String beanName) {
        System.out.println(beanName);
    }
}
```

beanName属性表示在Spring容器中注册的bean id，在我们的实现中，只是显示bean名称。

在Spring配置类中注册这种类型的bean：

```java
@Configuration
public class Config {
    @Bean(name = "myCustomBeanName")
    public MyBeanName getMyBeanName() {
        return new MyBeanName();
    }
} 
```

 启动应用程序上下文并从中获取bean：

```java
AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(Config.class);
MyBeanName myBeanName = context.getBean(MyBeanName.class); 
```

setBeanName方法打印出了“myCustomBeanName”。

若从@Bean注解中删除name =“...”代码，则在这种情况下，将getMyBeanName()方法名称分配给bean，所以输出将是“getMyBeanName”。 

### 1.2 BeanClassLoaderAware

将 bean 的类加载器 提供给 bean 实例的回调。在bean属性的填充之后调用，但在初始化回调之前调用。

![](https://img-blog.csdnimg.cn/ea025fd6f1f342c1872044fe0833af14.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 1.3 BeanFactoryAware

用于注入BeanFactory对象，就能访问创建对象的BeanFactory。  

![](https://img-blog.csdnimg.cn/b3894a31a5d34131a2121f0f438ad2c9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

可将IoC容器中的BeanFactory引用分配给beanFactory属性。

## 2 ApplicationContext 类型的容器

也提供了 Aware 接口，只不过这些 Aware 接口的注入实现，通过 BeanPostProcessor 的方式注入，但其仍是为了注入依赖。

![](https://img-blog.csdnimg.cn/9ab13beee7e84c22b777bc75d2ef63c2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 2.1 EnvironmentAware

注入 Enviroment，一般用于获取配置属性；

### 2.2 EmbeddedValueResolverAware

注入 EmbeddedValueResolver（Spring EL解析器），一般用于参数解析；

### 2.3 ResourceLoader

### 2.4 ApplicationEventPublisherAware

### 2.5 MessageSourceAware

注入 ApplicationContext 容器本身。

### 2.6 ApplicationContextAware

该接口的实现类，通过 setApplicationContext 获得该对象运行所在的ApplicationContext：

- 一般用于初始化object
- 也可用来获取所有Bean definition名字

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/2efc4ef485044cffcaeef0ec3a7645d6.png)

任何希望被通知它运行的ApplicationContext对象要实现的接口。如当一个对象需要访问一组协作 bean 时。通过 bean 引用进行配置比仅为了bean=lookfor实现此接口更有意义！

若对象需访问文件资源，即想要调用getResource ，想要发布应用程序事件或需要访问 MessageSource，也可实现此接口。但这种特定场景中，最好实现更具体的：

- ResourceLoaderAware 
- ApplicationEventPublisherAware
- 或MessageSourceAware接口

在填充普通 bean 的属性后，但在初始化回调之前调用，如：

- org.springframework.beans.factory.InitializingBean.afterPropertiesSet()
- 或自定义init-method

在：

- ResourceLoaderAware.setResourceLoader 
- ApplicationEventPublisherAware.setApplicationEventPublisher
- 和MessageSourceAware之后调用（若适用）。


- **BeanFactoryAware**:获得BeanFactory对象，可以用来检测Bean的作用域。
- **BeanNameAware**:获得Bean在配置文件中定义的名字。
- **ResourceLoaderAware**:获得ResourceLoader对象，可以获得classpath中某个文件。
- **ServletContextAware**:在一个MVC应用中可以获取ServletContext对象，可以读取context中的参数。
- **ServletConfigAware**： 在一个MVC应用中可以获取ServletConfig对象，可以读取config中的参数。

Spring容器将调用setApplicationContext(ApplicationContext ctx)，把应用上下文作为参数传入。与BeanFactory类似都为获取Spring容器，但：

- Spring容器在调用setApplicationContext时会把它自己作为setApplicationContext 的参数传入
- Spring容器在调用setBeanDactory前，需要程序员自己指定（注入）setBeanDactory里的参数BeanFactory