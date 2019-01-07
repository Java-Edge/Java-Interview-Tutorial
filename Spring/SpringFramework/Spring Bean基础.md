> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

Spring管理的这些bean藉由配置元数据创建，例如被`@Bean`注解。那么在 Spring 内部又是如何存储这些信息的呢？

# 1 BeanDefinition
## 1.1 域
在容器内，这些bean定义被表示为BeanDefinition对象，它包含但不限于如下元数据：

> 这些元数据会转换为构成每个bean定义内的一组属性。

### 1.1.1 包限定类名
![](https://img-blog.csdnimg.cn/20200822235222411.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

被定义bean的实际实现类
![](https://img-blog.csdnimg.cn/20200822235354122.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)


### 1.1.2  bean行为
这些状态指示bean在容器中的行为（作用域、生命周期回调等）。如下即为作用域：
![](https://img-blog.csdnimg.cn/2020082300061144.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
- 默认的作用域也就是`singleton`![](https://img-blog.csdnimg.cn/20200823002109786.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

### 1.1.3 需要的其它bean引用

这些引用也就是常见的协作或依赖对象。
![](https://img-blog.csdnimg.cn/20200823003439840.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

- 例如对于如下类：
![](https://img-blog.csdnimg.cn/20200823003353158.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70#pic_center)
![](https://img-blog.csdnimg.cn/2020082300363158.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

除了包含有关如何创建特定bean信息的bean定义外，`ApplicationContext`实现还允许注册在容器外部（用户自定义的）创建的现有对象。
这是通过`getBeanFactory()`方法访问`ApplicationContext`的`BeanFactory`完成的，该方法返回其`DefaultListableBeanFactory`实现。 
![](https://img-blog.csdnimg.cn/20200824022732376.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

`DefaultListableBeanFactory`通过`registerSingleton（..）`和`registerBeanDefinition（..）`方法支持此注册。当然了，我们开发的应用程序一般只使用通过常规的bean定义内的元数据定义的bean。

 DefaultListableBeanFactory支持通过如下两种方式进行注册：
 - registerSingleton(String beanName, Object singletonObject)
bean实例就是传递给registerSingleton方法的singletonObject对象
![](https://img-blog.csdnimg.cn/202008240239272.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
- registerBeanDefinition(String beanName, BeanDefinition beanDefinition)
容器根据BeanDefinition实例化bean


当然了，一般的应用程序还是仅通过元数据定义的bean来定义bean。

Bean元数据和显式编码提供的单例实例需尽早地注册，方便容器在自动装配和其他自省（指在运行时来判断一个对象的类型的能力）过程能正确推理它们。虽然在某种程度上支持覆盖现有的元数据或单例实例，但在运行时（与对工厂的实时访问并发）对新bean的注册并不被正式支持，并且可能导致并发访问异常，比如bean容器中的状态不一致。

# 2 如何给 bean 命名？
每个bean都有一或多个标识符，这些标识符在其所在容器中必须唯一。一个bean通常只有一个标识符。但若它就是需要有一个以上的，那么多余标识符被视为别名。

在bean定义中，可组合使用id、name 属性指定bean的标识符。 
- 最多指定一个名称的`id`属性。一般来说，这些名字由字母数字组成（如myBean，fooService），但也可能包含特殊字符。 
- 如果还想为bean引入其他别名，可在`name`属性指定任意数量的其他名称。用逗号`,`、分号`;`或空格分隔。 

在Spring 3.1前，`id`属性定义为`xsd:ID`类型，该类型限制了可能的字符。从3.1开始，它被定义为`xsd:string`类型。注意，Bean的`id`唯一性仍由容器强制执行，而不再是XML解析器。

开发者无需提供bean的`name`或`id`。如果未明确提供，容器将为该bean生成一个唯一`name`。但如果想通过使用`ref`元素或服务定位器模式查找来按名称引用该bean，则必须提供一个`name`。不提供名称的原因和内部beans和自动装配有关。


> 可以为bean提供多个名称。这些名称视作同一bean的别名，例如允许应用中的每个组件通过使用特定于组件本身的bean名称来引用公共依赖。

## 2.1 Bean命名规范
与对实例字段名称的命名规范相同。即小写字母开头，后跟驼峰式大小写。
示例：`userService`，`roleController`。

扫描类路径下的组件，Spring就会按照该习惯为未命名的组件生成bean名称：将类名初始字符转换为小写。其实这个规范即是JDK 里的Introspector#decapitalize方法，Spring正使用了它：
![](https://img-blog.csdnimg.cn/20200825021307553.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
### decapitalize
`java.beans.Introspector.decapitalize`
```java
public static String decapitalize(String name) {
    if (name == null || name.length() == 0) {
        return name;
    }
    // 如果有多个字符且第一和第二个字符均为大写字母
    // 则会保留原始大小写
    if (name.length() > 1 && Character.isUpperCase(name.charAt(1)) &&
                    Character.isUpperCase(name.charAt(0))){
        return name;
    }
    // 使用简单的类名，并将其初始字符转换为小写
    char chars[] = name.toCharArray();
    chars[0] = Character.toLowerCase(chars[0]);
    return new String(chars);
}
```

## 2.2  如何为单个bean指定多个别名？
有时希望为单个Bean提供多个名称，尤其是在多系统环境。

### XML配置
可使用`<alias/>`标签：
```bash
<alias name="srcName" alias="extName"/>
```
定义别名后，可将`同一容器`中名为`srcName`的bean称为`extName`。

环境示例：
- 子系统A的配置元数据可通过名称`subA-ds`引用数据源
- 子系统B可通过名称`subB-ds`引用数据源
- 使用这俩子系统的主系统通过名称`main-ds`引用数据源。

要使所有三个名称都引用相同的对象，可将以下别名定义添加到配置元数据：
```xml
<alias name="subA-ds" alias="subB-ds"/>
<alias name="subA-ds" alias="main-ds" />
```

现在，每个组件和主应用程序都可以通过唯一名称引用数据源，并且可保证不与任何其它定义冲突（等于高效创建了名称空间），而且引用的是同一bean。

### Java代码配置
使用`@Bean`注解的`name`属性接收一个String数组。示例如下：

```java
@Configuration
public class AppConfig {

    @Bean({"dataSource", "subA-ds", "subB-ds"})
    public DataSource dataSource() {
        // ...
    }
}
```

# 3 如何实例化 bean？
BeanDefinition可看做是创建对象的配方。容器在被询问时，会查看被命名过的bean的BeanDefinition，并使用该BeanDefinition中的配置元数据创建（或直接从缓存池获取）对应的对象实例。

比如在XML方式下，在`<bean/>`标签的`class`属性指定要实例化的对象的类型。这个`class`属性，其实就是BeanDefinition实例的`Class`属性，因此该属性一般强制必须指定。

可通过如下方式使用`Class`属性来实例化 bean：
## 3.1 构造器
在容器自身通过反射调用其构造器直接创建bean时，指定要构造的bean类，类似new运算符。该方式下，类基本上都能被Spring兼容。即bean类无需实现任何特定接口或以特定方式编码。 指定bean类即可。注意，根据所用的IoC类型，有时需要一个默认的无参构造器。

## 3.2 静态工厂方法
指定包含将要创建对象的静态工厂方法的实际类，容器将在类上调用静态工厂方法以创建bean。

定义使用静态工厂方法创建的bean时，可使用`class`属性来指定包含静态工厂方法的类，并使用`factory-method`属性指定工厂方法本身的名称。开发者应该能够调用此方法并返回一个存活对象，该对象随后将被视为通过构造器创建的。

> 这种BeanDefinition的一种用法是在老代码中调用static工厂。

看个例子，如下BeanDefinition指定将通过调用工厂方法来创建bean。该定义不指定返回对象的类型，而仅指定包含工厂方法的类。该示例中的`initInstance()`方法须是静态方法。
```xml
<bean id="serverService"
    class="examples.ServerService"
    factory-method="initInstance"/>
```
可与上面的BeanDefinition协同的类：
```java
public class ServerService {
    private static ServerService serverService = new ServerService();
    private ServerService() {}

    public static ServerService createInstance() {
        return serverService;
    }
}
```
## 3.3 实例工厂方法
使用该方式实例化会从容器中调用现有bean的非静态方法来创建新bean。要使用此机制，需将`class`属性置空，并在`factory-bean`属性中，在当前（或父/祖先）容器中指定包含要创建该对象的实例方法的bean的名称。`factory-method`设置工厂方法本身的名称。
示例如下，来看看如何配置这样的bean：
![](https://img-blog.csdnimg.cn/20200827233737553.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)


- 相应的类：
![](https://img-blog.csdnimg.cn/20200827234025514.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
- 一个工厂类也可以容纳一个以上的工厂方法，如下：
![](https://img-blog.csdnimg.cn/20200827234328990.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

这种方式还表明，即使是工厂bean也可以通过依赖注入进行管理和配置。
“factory bean”是指在Spring容器中配置并通过实例或静态工厂方法创建对象的bean。相比之下，`FactoryBean`是指特定于Spring的FactoryBean实现类。

# 4 如何确定Bean的运行时类型？
bean元数据定义中的指定类只是初始类引用，可能结合使用的如下方式之一：
- 声明的工厂方法
- FactoryBean类，该情况可能导致bean的运行时类型不同
- 实例级工厂方法（通过指定的factory-bean名称解析），该情况下直接就不设置了

因此，看起来确定bean运行时类型绝非易事，该如何准确获取呢？
## BeanFactory.getType
推荐调用 `BeanFactory.getType`确定bean的运行时类型。
![](https://img-blog.csdnimg.cn/20200828012107627.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
该方法可确定给定名称bean的类型。 更确切地，返回针对相同bean名称的`BeanFactory.getBean`调用将返回的对象的类型。
且该方法的实现考虑了前面穷举的所有情况，并针对于FactoryBean ，返回FactoryBean所创建的对象类型，和`FactoryBean.getObjectType()`返回一致。 
![](https://img-blog.csdnimg.cn/20200828121006639.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)

![](https://img-blog.csdnimg.cn/20200825235213822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70#pic_center)
