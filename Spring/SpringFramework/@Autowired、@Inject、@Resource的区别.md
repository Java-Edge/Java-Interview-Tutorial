# 共同点
- 装配bean
- 写在字段上
- 写在setter方法上

# @Autowired
该注解属Spring，默认按类型装配。
可以作用在变量、setter方法、构造器。

默认要求依赖对象必须存在，如果要允许`null`值，可以设置它的`required`属性为`false`，这样当没有找到相应bean的时候，程序不会抛错。

```java
@Autowired(required=false) 
```

若想使用名称装配，需要配合`@Qualifier`一起食用，如下：
```java
@Autowired() @Qualifier("baseDao")    
private BaseDao baseDao;
```

# @Resource
默认按名称装配(JDK1.6开始支持的注解)。@Resource是JSR250规范的实现，需要导入javax.annotation实现注入。
不可以用在构造器。

名称可以通过name属性进行指定，若没有指定`name`属性：
- 当注解写在字段上时，默认取字段名，按照名称查找
- 如果注解写在setter方法上默认取属性名进行装配
- 当找不到与名称匹配的bean时才按照类型进行装配

> name属性一旦指定，就只会按照名称进行装配。

只不过注解处理器我们使用的是Spring提供的，是一样的，无所谓解耦不解耦的说法，两个在便利程度上是等同的。

### @Resource作用于字段
```java
@Resource(name="base")    
private BaseDao baseDao; 
```
Spring注入p的过程：
- 查找xml中是否有id为baseDao的元素
- 如果没有找到，则看是否有name属性（@Resource name=“base”），有则查找name
- 否则查找BaseDao类型的元素

> **byName** 通过参数名自动装配，如果一个bean的name 和另外一个bean的 property 相同，就自动装配
**byType** 通过参数的数据类型自动自动装配，如果一个bean的数据类型和另外一个bean的property属性的数据类型兼容，就自动装配

# @Inject
JSR330 (Dependency Injection for Java)中的规范，需要导入javax.inject.Inject。根据类型进行自动装配的，如果需要按名称进行装配，则需要配合@Named。
可以作用在变量、setter方法、构造器。

@Autowired、@Inject用法基本一样，不同的是@Autowired有一个request属性。


# 使用注解的方式
在基于注解方式配置Spring的配置文件中，你可能会见到
![](https://img-blog.csdnimg.cn/img_convert/e1db938f59a5e7cfe80959703c3dfbce.png)
作用是向 Spring 容器注册
```bash
AutowiredAnnotationBeanPostProcessor
CommonAnnotationBeanPostProcessor
PersistenceAnnotationBeanPostProcessor
RequiredAnnotationBeanPostProcessor
```
注册这4个BeanPostProcessor的作用，就是为了你的系统能够识别相应的注解。

例如要使用@Autowired，就必须事先在 Spring 容器中声明 `AutowiredAnnotationBeanPostProcessor Bean`，传统声明方式如下
```xml
<bean class="org.springframework.beans.factory.annotation. AutowiredAnnotationBeanPostProcessor "/> 
```
要使用@ Resource 、@ PostConstruct、@ PreDestroy等注解就必须声明`CommonAnnotationBeanPostProcessor`
```xml
<bean class="org.springframework.beans.factory.annotation. CommonAnnotationBeanPostProcessor"/> 
```
要使用@PersistenceContext注解，就必须声明`PersistenceAnnotationBeanPostProcessor`的
```xml
<bean class="org.springframework.beans.factory.annotation.PersistenceAnnotationBeanPostProcessor"/> 
```
要使用 @Required的注解，就必须声明`RequiredAnnotationBeanPostProcessor`
```xml
<bean class="org.springframework.beans.factory.annotation.RequiredAnnotationBeanPostProcessor"/> 
```
如果总是需要按照传统的方式一条一条配置显得有些繁琐和没有必要
于是spring给我们提供`<context:annotation-config/>`的简化配置方式，自动帮你完成声明。

都2021了，一般都会配置`包扫描路径`选项
```xml
<context:component-scan base-package=”XX.XX”/>
```
该配置项其实也包含了自动注入上述processor的功能，可以将 `<context:annotation-config/> `移除了.

**比如：**

```xml
<context:component-scan base-package="carPoolingController, carPoolingService, carPoolingDao" />
```
就把controller包下 service包下 dao包下的注解全部扫描了

一般使用 @Resource，因为这样我们就能实现和spring框架的解耦（不过注解处理器还是Spring提供）。