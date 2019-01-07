> 全是干货的技术号：
> 本文已收录在github，欢迎 star/fork：
> https://github.com/Wasabi1234/Java-Interview-Tutorial

实际的系统几乎不可能仅有单一的bean，都是很多个bean协作提供服务。本文目标也就是讨论如何冲破单一 bean 定义而让多 bean 协作实现系统。

# 1 什么是依赖注入（Dependency Injection）？
之前文章说过， DI其实是一个过程。该过程中，bean可通过如下方式定义它们之间的依赖关系：
1. 构造器参数
2. 工厂方法参数
3. 从工厂方法构造或返回的对象实例上设置的属性

接着，容器在创建bean时就会注入这些依赖关系。

该过程实质上就是 bean 本身操作的反转，因此得名 Inversion of Control（IoC，控制反转），而非对象自己直接通过使用其构造器或通过服务定位设计模式来控制其依赖项的实例化或位置。

使用 DI 代码会更整洁，当bean维护其依赖项时，也更解耦。bean不需要查找其依赖项，也无需知晓其依赖项的位置或具体类。如此一来，类也更便于测试，尤其是当依赖项为接口或抽象类时，可方便在UT中使用mock。

知晓了其原理了，那么在开发中又是如何实践的呢？

# 2 DI 的实现形式有哪些？
## 2.1 构造器注入
通过Spring容器调用具有多参数的构造器而完成，每个参数代表一个依赖项。调用具有特定参数的静态工厂方法来构造 bean 基本等效。

- 如下示例中的类仅可使用构造器注入的 DI：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200907014622310.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

### 2.1.1  构造器参数解析
构造器参数解析匹配通过 **参数的类型** 触发。若在 bean 定义的构造器参数中不存在歧义，则在 bean 定义中定义构造器参数的顺序是当 bean 实例化时这些参数提供给相应的构造器的顺序。说半天估计你也晕了，看如下案例：
![](https://img-blog.csdnimg.cn/20200908014453818.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

假设 ThingSencond 和 ThingThird 类无继承关系，那么就没有歧义。因此，下面的配置也能工作良好，而无需在 `<constructor-arg/>` 标签中显式指定构造器参数的顺序或类型。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200908014559577.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)


就像刚才的案例，当引用另一个bean时，类型已知，所以可以触发匹配。然而，当使用简单类型时，例如`<value>true</value>`， Spring无法确定值的类型，因此在没有帮助的情况下也就无法通过类型进行匹配。看如下案例：
![](https://img-blog.csdnimg.cn/20200908020414717.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
### 2.1.2 构造器参数类型匹配
在前面的案例中，若使用 `type` 属性显式指定构造器参数的类型，则容器可以使用与简单类型相匹配的类型。如下所示：
![](https://img-blog.csdnimg.cn/20200908180230647.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

### 2.1.3 构造器参数顺序
可使用 `index` 属性显式指定构造器参数的顺序，如下所示（注意从零开始计数）
![](https://img-blog.csdnimg.cn/20200908021002588.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
除了解决多个简单值的不确定性，还解决了构造器具有相同类型的两个参数时的不确定性。

### 2.1.4 构造器参数名称
也可以使用构造器参数名称消除歧义，如下案例：
![](https://img-blog.csdnimg.cn/2020090820005225.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
请记住，要使这一操作开箱即用，我们的代码必须在启用调试标识的情况下进行编译，以便Spring可以从构造器中查找参数名。
如果不能或不希望使用debug标识编译代码，可使用JDK的`@ConstructorProperties` 注解显式设置该构造函数的参数如何与构造对象的getter方法相对应。
![](https://img-blog.csdnimg.cn/20200908200754236.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

看如下案例：
![](https://img-blog.csdnimg.cn/20200908202206268.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

## 2.2 setter注入
通过调用无参构造器或无参静态工厂方法实例化bean后，通过容器在bean上调用setter方法来完成基于setter注入。

如下案例是一个不依赖于特定于容器的接口，基类或注解，而且只能setter注入方式DI的POJO类。
![](https://img-blog.csdnimg.cn/20200908204911235.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

ApplicationContext为其管理的bean的提供了构造器和setter DI的支持。也支持在已通过构造器注入某些依赖后，还支持setter DI。可通过`BeanDefinition`的形式配置依赖项，将其与`PropertyEditor`实例结合使用，以将属性从一种格式转为另一种。但大多数开发者并非以编程方式直接使用这些类，而是使用
- XML形式的 bean定义
- 带注解的组件，即被`@Component`，`@Controller`等注解的类
- 基于Java的`@Configuration`类中的`@Bean`方法

然后将这些源在内部转换为`BeanDefinition`实例，并用于加载整个IoC容器实例。

# 3 构造器注入还是 setter 注入呢？
这么详细地分别介绍完后，那么到底哪种 DI 方式好呢？
由于可混用构造器和setter DI，因此将构造器用于强制性依赖项，并搭配将setter方法或配置方法用于可选依赖项是个很好的最佳实践。
注意，可在setter方法上使用`@Required`注解，以使该属性成为必需的依赖；但最好使用带有编程式验证的参数的构造器注入。

而且注意，Spring团队推荐构造器注入，因为它可以让开发者将应用的组件实现为不可变对象，并确保所需的依赖项不为null。此外，构造器注入的组件始终以完全初始化的状态返回给客户端（调用）代码。不过注意了哦，大量的构造器自变量是一种坏代码，因为这意味着该类可能承担了太多职责（违反单一职责的编程原则），应对其重构以更好地解决关注点的解耦问题。

Setter注入主要应仅用于可以在类中分配合理的默认值的可选依赖项。否则，必须在代码使用依赖项的所有地方都执行判空检查。 setter注入的一个好处是，setter方法使该类的对象在以后可重新配置或注入。

使用对特定类最有意义的DI方案。有时，在处理没有源代码的第三方类库时，将为你做出选择。例如，若第三方类库未公开任何setter方法，则构造器注入可能就是DI的唯一可用方案咯。

# 4 deponds-on 属性有何用？
你以为这个东西面试没人问？看图！
![](https://img-blog.csdnimg.cn/20200908233438363.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
若一个bean是另一个的依赖，则通常意味着将一个bean设为另一个的属性。通常可使用XML形式配置元数据中的`<ref/>`元素完成此操作。但有时bean之间的依赖关系不那么直接。一个示例是何时需要触发类中的静态初始化器，例如用于数据库驱动程序注册。`depends-on`属性可显式强制初始化一或多个使用该元素的bean之前的bean。

- 看如下案例，使用`depends-on`属性表示对单个bean的依赖关系：
![](https://img-blog.csdnimg.cn/20200908232122195.png#pic_center)

要表示对多个 bean 的依赖，请提供 bean 名称列表作为依赖属性的值（逗号、空格和分号都是有效的分隔符）：
![](https://img-blog.csdnimg.cn/20200908233150660.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
`depends-on`属性既可以指定一个 初始化期（initialization-time） 依赖项，也可指定一个对应的析构期(destruction-time)依赖项。在销毁给定bean之前，首先销毁定义与给定bean的依赖关系的依赖bean。因此，`depends-on`还可以用来控制关闭顺序。
# 5 lazy-init属性有何作用？
在默认的初始化过程中，ApplicationContext会及早地创建并配置所有的单例bean。一般来说，这种预实例化是有好处的，毕竟相比于若干天后的亡羊补牢，这样可立即发现配置或​上下文环境的错误。
当然了，如果你的业务决定了不想要这种默认行为，也可将bean定义标记为延迟初始化来防止对单例bean的预实例化。延迟初始化的bean告诉IoC容器在首次请求时而不是在应用启动阶段就创建一个bean实例。

如下案例：
- XML形式，通过`<bean/>`标签内的`lazy-init`属性控制
![](https://img-blog.csdnimg.cn/20200909012354606.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)
- 注解形式![](https://img-blog.csdnimg.cn/20200909200141429.png#pic_center)
无需多虑，默认值为`true`就是要延迟初始化。![](https://img-blog.csdnimg.cn/20200909201120831.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)

当上述的配置被  `ApplicationContext` 使用时，在 `ApplicationContext` 启动时不会预实例化惰性bean，未使用该属性的非惰性bean才会被预实例化。

不过需要注意的是，当lazy-init bean是未lazy-init的单例bean的依赖时，`ApplicationContext`在启动阶段还是会创建lazy-init bean，因为它必须要满足单例的依赖关系，lazy-init bean会被注入到其它未lazy-init 的单例bean中。

另外如果需要，可通过`<bean/>`标签内的 `default-lazy-init` 属性控制容器级别的延迟初始化，案例如下：
![](https://img-blog.csdnimg.cn/20200911005914816.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70#pic_center)