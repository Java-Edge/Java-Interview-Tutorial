### 3.9 基于注解的容器配置

> **在配置Spring时注解是否比XML更好？**
> 
> 基于注解配置的引入引出了一个问题——这种方式是否比基于XML的配置更好。简短的回答是视情况而定。长一点的回答是每种方法都有它的优点和缺点，通常是由开发者决定哪一种策略更适合他们。由于注解的定义方式，注解在它们的声明中提供了许多上下文，导致配置更简短更简洁。然而，XML擅长连接组件而不必接触源代码或重新编译它们。一些开发者更喜欢接近源代码，而另一些人则认为基于注解的类不再是POJOs，此外，配置变的去中心化，而且更难控制。
> 
> 无论选择是什么，Spring都能容纳这两种风格，甚至可以将它们混合在一起。值得指出的是，通过它的Java配置选项，Spring允许注解以一种非入侵的方式使用，不触碰目标组件源码和那些工具，所有的配置风格由Spring工具套件支持。

基于注解的配置提供了一种XML设置的可替代方式，它依赖于字节码元数据来连接组件，而不是用尖括号声明的方式。代替使用XML来描述bean连接，开发者通过将注解使用在相关的类，方法或字段声明中，将配置移动到了组件类本身的内部。正如在“Example: The RequiredAnnotationBeanPostProcessor”那节提到的那样，使用`BeanPostProcessor`与注解结合是扩展Spring IoC容器的的常见方法。例如，Spring 2.0引入了`@Required`注解来执行需要的属性的可能性。Spring 2.5使以同样地通用方法来驱动Spring的依赖注入变为可能。本质上来说，`@Autowired`提供了如3.4.5小节描述的同样的能力。“Autowiring collaborators”但更细粒度的控制和更广的应用性。Spring 2.5也添加对JSR-250注解的支持，例如，`@PostConstruct`和`@PreDestroy` 
。Spring 3.0添加了对JSR-330，包含在`javax.inject`包内的注解（Java的依赖注入）的支持，例如`@Inject`和`@Named`。关于这些注解的细节可以在相关的小节找到。

> 注解注入在XML注入之前进行，因此对于通过两种方法进行组装的属性后者的配置会覆盖前者。

跟以前一样，你可以作为单独的bean定义来注册它们，但也可以通过在一个基于XML的Spring配置（注入包含上下文命名空间）中包含下面的标签来隐式的注册它们：

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

    <context:annotation-config/>

</beans>
```

（隐式注册的后处理器包括 `AutowiredAnnotationBeanPostProcessor`，`CommonAnnotationBeanPostProcessor`，`PersistenceAnnotationBeanPostProcessor`和前面提到的`RequiredAnnotationBeanPostProcessor`。）

> `<context:annotation-config/>`仅在定义它的同样的应用上下文中寻找注解的beans。这意味着，如果你在一个为`DispatcherServlet`服务的`WebApplicationContext`中放置了`<context:annotation-config/>`，它只能在你的控制器中寻找`@Autowired`注解的beans，而不是在你的服务层中。更多信息请看18.2小节，“The DispatcherServlet”。

#### 3.9.1 @Required

`@Required`注解应用到bean属性的setter方法上，例子如下：

```
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Required
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // ...

}
```

这个注解仅仅是表明受影响的bean属性必须在配置时通过显式的bean定义或自动组装填充。如果受影响的bean属性没有填充，容器会抛出一个异常，这允许及早明确的失败，避免`NullPointerExceptions`或后面出现类似的情况。仍然建议你在bean类本身加入断言，例如，加入到初始化方法中。这样做可以强制这些需要的引用和值，甚至是你在容器外部使用这个类的时候。

#### 3.9.2 @Autowired

> 在下面的例子中JSR 330的`@Inject`注解可以用来代替Spring的`@Autowired`注解。

你可以将`@Autowired`注解应用到构造函数上。

```
public class MovieRecommender {

    private final CustomerPreferenceDao customerPreferenceDao;

    @Autowired
    public MovieRecommender(CustomerPreferenceDao customerPreferenceDao) {
        this.customerPreferenceDao = customerPreferenceDao;
    }

    // ...

}
```

> 从Spring框架4.3起，如果目标bena仅定义了一个构造函数，那么`@Autowired`注解的构造函数不再是必要的。如果一些构造函数是可获得的，至少有一个必须要加上注解，以便于告诉容器使用哪一个。

正如预料的那样，你也可以将`@Autowired`注解应用到“传统的”setter方法上：

```
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Autowired
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // ...

}
```

你也可以应用注解到具有任何名字和/或多个参数的方法上：

```
public class MovieRecommender {

    private MovieCatalog movieCatalog;

    private CustomerPreferenceDao customerPreferenceDao;

    @Autowired
    public void prepare(MovieCatalog movieCatalog,
            CustomerPreferenceDao customerPreferenceDao) {
        this.movieCatalog = movieCatalog;
        this.customerPreferenceDao = customerPreferenceDao;
    }

    // ...

}
```

你也可以应用`@Autowired`到字段上，甚至可以与构造函数混合用：

```
public class MovieRecommender {

    private final CustomerPreferenceDao customerPreferenceDao;

    @Autowired
    private MovieCatalog movieCatalog;

    @Autowired
    public MovieRecommender(CustomerPreferenceDao customerPreferenceDao) {
        this.customerPreferenceDao = customerPreferenceDao;
    }

    // ...

}
```

通过给带有数组的字段或方法添加`@Autowired`注解，也可以从`ApplicationContext`中提供一组特定类型的bean：

```
public class MovieRecommender {

    @Autowired
    private MovieCatalog[] movieCatalogs;

    // ...

}
```

同样也可以应用到具有同一类型的集合上：

```
public class MovieRecommender {

    private Set<MovieCatalog> movieCatalogs;

    @Autowired
    public void setMovieCatalogs(Set<MovieCatalog> movieCatalogs) {
        this.movieCatalogs = movieCatalogs;
    }

    // ...

}
```

> 如果你希望数组或列表中的项按指定顺序排序，你的bean可以实现`org.springframework.core.Ordered`接口，或使用`@Order`或标准`@Priority`注解。

只要期望的key是`String`，那么类型化的Maps就可以自动组装。Map的值将包含所有期望类型的beans，key将包含对应的bean名字：

```
public class MovieRecommender {

    private Map<String, MovieCatalog> movieCatalogs;

    @Autowired
    public void setMovieCatalogs(Map<String, MovieCatalog> movieCatalogs) {
        this.movieCatalogs = movieCatalogs;
    }

    // ...

}
```

默认情况下，当没有候选beans可获得时，自动组装会失败；默认的行为是将注解的方法，构造函数和字段看作指明了需要的依赖。这个行为也可以通过下面的方式去改变。

```
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Autowired(required=false)
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // ...

}
```

> 每个类只有一个构造函数可以标记为必需的，但可以注解多个非必需的构造函数。在这种情况下，会考虑这些候选者中的每一个，Spring使用最贪婪的构造函数，即依赖最满足的构造函数，具有最大数目的参数。
> 
> 建议在`@Required`注解之上使用`@Autowired`的`required`特性。`required`特性表明这个属性自动装配是不需要的，如果这个属性不能被自动装配，它会被忽略。另一方面`@Required`是更强大的，在它强制这个属性被任何容器支持的bean设置。如果没有值注入，会抛出对应的异常。

你也可以对那些已知的具有可解析依赖的接口使用`@Autowired`：`BeanFactory`，`ApplicationContext`，`Environment`, `ResourceLoader`，`ApplicationEventPublisher`和`MessageSource`。这些接口和它们的扩展接口，例如`ConfigurableApplicationContext`或`ResourcePatternResolver`，可以自动解析，不需要特别的设置。

```
public class MovieRecommender {

    @Autowired
    private ApplicationContext context;

    public MovieRecommender() {
    }

    // ...

}
```

> `@Autowired`，`@Inject`，`@Resource`和`@Value`注解是通过Spring `BeanPostProcessor`实现处理，这反过来意味着你不能在你自己的`BeanPostProcessor`或`BeanFactoryPostProcessor`中应用这些注解（如果有的话）。这些类型必须显式的通过XML或使用Spring的`@Bean`方法来’wired up’。

#### 3.9.3 用@Primary微调基于注解的自动装配

因为根据类型的自动装配可能会导致多个候选目标，所以在选择过程中进行更多的控制经常是有必要的。一种方式通过Spring的`@Primary`注解来完成。当有个多个候选bean要组装到一个单值的依赖时，`@Primary`表明指定的bean应该具有更高的优先级。如果确定一个’primary’ bean位于候选目标中间，它将是那个自动装配的值。

假设我们具有如下配置，将`firstMovieCatalog`定义为主要的`MovieCatalog`。

```
@Configuration
public class MovieConfiguration {

    @Bean
    @Primary
    public MovieCatalog firstMovieCatalog() { ... }

    @Bean
    public MovieCatalog secondMovieCatalog() { ... }

    // ...

}
```

根据这样的配置，下面的`MovieRecommender`将用`firstMovieCatalog`进行自动装配。

```
public class MovieRecommender {

    @Autowired
    private MovieCatalog movieCatalog;

    // ...

}
```

对应的bean定义如下：

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

    <context:annotation-config/>

    <bean class="example.SimpleMovieCatalog" primary="true">
        <!-- inject any dependencies required by this bean -->
    </bean>

    <bean class="example.SimpleMovieCatalog">
        <!-- inject any dependencies required by this bean -->
    </bean>

    <bean id="movieRecommender" class="example.MovieRecommender"/>

</beans>
```

#### 3.9.4 微调基于注解且带有限定符的自动装配

当有多个实例需要确定一个主要的候选对象时，`@Primary`是一种按类型自动装配的有效方式。当需要在选择过程中进行更多的控制时，可以使用Spring的`@Qualifier`注解。为了给每个选择一个特定的bean，你可以将限定符的值与特定的参数联系在一起，减少类型匹配集合。在最简单的情况下，这是一个纯描述性值:

```
public class MovieRecommender {

    @Autowired
    @Qualifier("main")
    private MovieCatalog movieCatalog;

    // ...

}
```

`@Qualifier`注解也可以指定单个构造函数参数或方法参数：

```
public class MovieRecommender {

    private MovieCatalog movieCatalog;

    private CustomerPreferenceDao customerPreferenceDao;

    @Autowired
    public void prepare(@Qualifier("main")MovieCatalog movieCatalog,
            CustomerPreferenceDao customerPreferenceDao) {
        this.movieCatalog = movieCatalog;
        this.customerPreferenceDao = customerPreferenceDao;
    }

    // ...

}
```

对应的bean定义如下。限定符值为”main”的bean被组装到有相同值的构造函数参数中。

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

    <context:annotation-config/>

    <bean class="example.SimpleMovieCatalog">
        <qualifier value="main"/>

        <!-- inject any dependencies required by this bean -->
    </bean>

    <bean class="example.SimpleMovieCatalog">
        <qualifier value="action"/>

        <!-- inject any dependencies required by this bean -->
    </bean>

    <bean id="movieRecommender" class="example.MovieRecommender"/>

</beans>
```

对于回退匹配，bean名字被认为是默认的限定符值。因此你可以定义一个id为`main`的bean来代替内嵌的限定符元素，会有同样的匹配结果。然而，尽管你可以使用这个约定根据名字引用特定的beans，但是`@Autowired`从根本上来讲是使用可选的语义限定符来进行类型驱动注入的。这意味着限定符的值，即使回退到bean名称，总是缩小语义类型匹配的集合；它们没有从语义上将一个引用表达为一个唯一的bean id。好的限定符值是”main”或”EMEA”或”persistent”，表达一个特定组件的性质，这个组件是独立于bean `id`的，即使前面例子中像这个bean一样的匿名bean会自动生成id。

正如前面讨论的那样，限定符也可以应用到类型结合上，例如，`Set<MovieCatalog>`。在这个例子中，根据声明的限定符匹配的所有beans作为一个集合进行注入。这意味着限定符不必是唯一的；它们只是构成过滤标准。例如，你可以定义多个具有同样限定符值”action”的`MovieCatalog`，所有的这些都将注入到带有注解`@Qualifier("action")`的`Set<MovieCatalog>`中。

> 如果你想通过名字表达注解驱动的注入，不要主要使用`@Autowired`，虽然在技术上能通过`@Qualifier`值引用一个bean名字。作为可替代产品，可以使用JSR-250 `@Resource`注解，它在语义上被定义为通过组件唯一的名字来识别特定的目标组件，声明的类型与匹配过程无关。`@Autowired`有不同的语义：通过类型选择候选beans，特定的`String`限定符值被认为只在类型选择的候选目标中，例如，在那些标记为具有相同限定符标签的beans中匹配一个”account”限定符。
> 
> 对于那些本身定义在集合/映射或数组类型中的beans来说，`@Resource`是一个很好的解决方案，适用于特定的集合或通过唯一名字区分的数组bean。也就是说，自Spring 4.3起，集合/映射和数组类型中也可以通过Spring的`@Autowired`类型匹配算法进行匹配，只要元素类型信息在`@Bean`中保留，返回类型签名或集合继承体系。在这种情况下，限定符值可以用来在相同类型的集合中选择，正如在前一段中概括的那样。
> 
> 自Spring 4.3起，`@Autowired`也考虑自引用注入，例如，引用返回当前注入的bean。注意自注入是备用；普通对其它组件的依赖关系总是优先的。在这个意义上，自引用不参与普通的候选目标选择，因此尤其是从不是主要的；恰恰相反，它们最终总是最低的优先级。在实践中，自引用只是作为最后的手段，例如，通过bean的事务代理调用同一实例的其它方法：在考虑抽出受影响的方法来分隔代理bean的场景中。或者，使用`@Resource`通过它的唯一名字可能得到一个返回当前bean的代理。
> 
> `@Autowired`可以应用到字段，构造函数和多参数方法上，允许通过限定符注解在参数层面上缩减候选目标。相比之下，`@Resource`仅支持字段和bean属性的带有单个参数的setter方法。因此，如果你的注入目标是一个构造函数或一个多参数的方法，坚持使用限定符。

你可以创建自己的定制限定符注解。简单定义一个注解，在你自己的定义中提供`@Qualifier`注解：

```
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Qualifier
public @interface Genre {

    String value();
}
```

然后你可以在自动装配的字段和参数上提供定制的限定符：

```
public class MovieRecommender {

    @Autowired
    @Genre("Action")
    private MovieCatalog actionCatalog;
    private MovieCatalog comedyCatalog;

    @Autowired
    public void setComedyCatalog(@Genre("Comedy") MovieCatalog comedyCatalog) {
        this.comedyCatalog = comedyCatalog;
    }

    // ...

}
```

接下来，提供候选bean定义的信息。你可以添加`<qualifier/>`标记作为`<bean/>`标记的子元素，然后指定匹配你的定制限定符注解的类型和值。类型用来匹配注解的全限定类名称。或者，如果没有名称冲突的风险，为了方便，你可以使用简写的类名称。下面的例子证实了这些方法。

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

    <context:annotation-config/>

    <bean class="example.SimpleMovieCatalog">
        <qualifier type="Genre" value="Action"/>
        <!-- inject any dependencies required by this bean -->
    </bean>

    <bean class="example.SimpleMovieCatalog">
        <qualifier type="example.Genre" value="Comedy"/>
        <!-- inject any dependencies required by this bean -->
    </bean>

    <bean id="movieRecommender" class="example.MovieRecommender"/>

</beans>
```

在3.10小节，“类路径扫描和管理组件”中，你将看到一个基于注解的替代方法，在XML中提供限定符元数据。特别地，看3.10.8小节，“用注解提供限定符元数据”。

在某些情况下，使用没有值的注解就是足够的。当注解为了通用的目的时，这是非常有用的，可以应用到跨几个不同类型的依赖上。例如，当网络不可用时，你可以提供一个要搜索的离线目录。首先定义一个简单的注解：

```
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Qualifier
public @interface Offline {

}
```

然后将注解添加到要自动装配的字段或属性上：

```
public class MovieRecommender {

    @Autowired
    @Offline
    private MovieCatalog offlineCatalog;

    // ...

}
```

现在bean定义只需要一个限定符类型：

```
<bean class="example.SimpleMovieCatalog">
    <qualifier type="Offline"/>
    <!-- inject any dependencies required by this bean -->
</bean>
```

你也可以定义接收命名属性之外的定制限定符注解或代替简单的值属性。如果要注入的字段或参数指定了多个属性值，bean定义必须匹配所有的属性值才会被认为是一个可自动装配的候选目标。作为一个例子，考虑下面的注解定义：

```
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Qualifier
public @interface MovieQualifier {

    String genre();

    Format format();

}
```

这种情况下`Format`是枚举类型：

```
public enum Format {
    VHS, DVD, BLURAY
}
```

要自动装配的字段使用定制限定符进行注解，并且包含了两个属性值：`genre`和`format`。

```
public class MovieRecommender {

    @Autowired
    @MovieQualifier(format=Format.VHS, genre="Action")
    private MovieCatalog actionVhsCatalog;

    @Autowired
    @MovieQualifier(format=Format.VHS, genre="Comedy")
    private MovieCatalog comedyVhsCatalog;

    @Autowired
    @MovieQualifier(format=Format.DVD, genre="Action")
    private MovieCatalog actionDvdCatalog;

    @Autowired
    @MovieQualifier(format=Format.BLURAY, genre="Comedy")
    private MovieCatalog comedyBluRayCatalog;

    // ...

}
```

最后，bean定义应该包含匹配的限定符值。这个例子也证实了bean元属性可以用来代替`<qualifier/>`子元素。如果可获得`<qualifier/>`，它和它的属性优先级更高，如果当前没有限定符，自动装配机制会将`<meta/>`内的值作为备用，正如下面的例子中的最后两个bean定义。

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

    <context:annotation-config/>

    <bean class="example.SimpleMovieCatalog">
        <qualifier type="MovieQualifier">
            <attribute key="format" value="VHS"/>
            <attribute key="genre" value="Action"/>
        </qualifier>
        <!-- inject any dependencies required by this bean -->
    </bean>

    <bean class="example.SimpleMovieCatalog">
        <qualifier type="MovieQualifier">
            <attribute key="format" value="VHS"/>
            <attribute key="genre" value="Comedy"/>
        </qualifier>
        <!-- inject any dependencies required by this bean -->
    </bean>

    <bean class="example.SimpleMovieCatalog">
        <meta key="format" value="DVD"/>
        <meta key="genre" value="Action"/>
        <!-- inject any dependencies required by this bean -->
    </bean>

    <bean class="example.SimpleMovieCatalog">
        <meta key="format" value="BLURAY"/>
        <meta key="genre" value="Comedy"/>
        <!-- inject any dependencies required by this bean -->
    </bean>

</beans>
```

#### 3.9.5 使用泛型作为自动装配限定符

除了`@Qualifier`注解外，也可以使用Java的泛型类型作为限定符的一种暗示方式。例如，假设你有如下配置：

```
@Configuration
public class MyConfiguration {

    @Bean
    public StringStore stringStore() {
        return new StringStore();
    }

    @Bean
    public IntegerStore integerStore() {
        return new IntegerStore();
    }

}
```

假设上面的beans实现了一个泛型接口，例如，`Store<String>`和`Store<Integer>`，你可以`@Autowire` `Store`接口，泛型将作为限定符使用：

```
@Autowired
private Store<String> s1; // <String> qualifier, injects the stringStore bean

@Autowired
private Store<Integer> s2; // <Integer> qualifier, injects the integerStore bean
```

当自动装配`Lists`，`Maps`和`Arrays`时，也会应用泛型限定符：

```
// Inject all Store beans as long as they have an <Integer> generic
// Store<String> beans will not appear in this list
@Autowired
private List<Store<Integer>> s;
```

#### 3.9.6 CustomAutowireConfigurer

`CustomAutowireConfigurer`是一个能使你注册自己的定制限定符注解类型的`BeanFactoryPostProcessor`，即使它们不使用Spring的`@Qualifier`注解进行注解。

```
<bean id="customAutowireConfigurer"
        class="org.springframework.beans.factory.annotation.CustomAutowireConfigurer">
    <property name="customQualifierTypes">
        <set>
            <value>example.CustomQualifier</value>
        </set>
    </property>
</bean>
```

`AutowireCandidateResolver`通过下面的方式决定自动装配的候选目标：

*   每个bean定义的`autowire-candidate`

*   在`<beans/>`元素可获得的任何`default-autowire-candidates`模式

*   存在`@Qualifier`注解和任何在`CustomAutowireConfigurer`中注册的定制注解

当多个beans符合条件成为自动装配的候选目标时，”primary” bean的决定如下：如果在候选目标中某个确定的bean中的`primary`特性被设为`true`，它将被选为目标bean。

#### 3.9.7 @Resource

Spring也支持使用JSR-250 `@Resource`对字段或bean属性setter方法进行注入。这是在Java EE 5和6中的一种通用模式，例如在JSF 1.2管理的beans或JAX-WS 2.0的端点。Spring对它管理的对象也支持这种模式。

`@Resource`采用名字属性，默认情况下Spring将名字值作为要注入的bean的名字。换句话说，它遵循*by-name*语义，下面的例子证实了这一点：

```
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Resource(name="myMovieFinder")
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

}
```

如果没有显式的指定名字，默认名字从字段名或setter方法中取得。在字段情况下，它采用字段名称；在setter方法情况下，它采用bean的属性名。因此下面的例子将名字为`movieFinder`的bean注入到它的setter方法中：

```
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Resource
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

}
```

> 注解提供的名字被`CommonAnnotationBeanPostProcessor`感知的`ApplicationContext`解析为bean名字。如果你显式地配置了Spring的`SimpleJndiBeanFactory`，名字会通过JNDI解析。但是建议你依赖默认行为，简单使用Spring的JNDI查找功能保护间接查找级别。

在`@Resource`特有的没有显式名字指定的情况下，类似于`@Autowired`，`@Resource`会进行主要的匹配类型来代替指定名字的bean并解析已知的可解析依赖：`BeanFactory`，`ApplicationContext`，`ResourceLoader`，`ApplicationEventPublisher`和`MessageSource`接口。

因此在下面的例子中，`customerPreferenceDao`字段首先查找名字为`customerPreferenceDao`的bean，然后回退到主要的类型为`CustomerPreferenceDao`的类型匹配。”context”字段会注入基于已知的可解析依赖类型`ApplicationContext`。

```
public class MovieRecommender {

    @Resource
    private CustomerPreferenceDao customerPreferenceDao;

    @Resource
    private ApplicationContext context;

    public MovieRecommender() {
    }

    // ...

}
```

#### 3.9.8 @PostConstruct和@PreDestroy
`CommonAnnotationBeanPostProcessor`不仅识别`@Resource`注解，而且识别JSR-250生命周期注解。在Spring 2.5引入了对这些注解的支持，也提供了在初始化回调函数和销毁回调函数中描述的那些注解的一种可替代方式。假设`CommonAnnotationBeanPostProcessor`在Spring的`ApplicationContext`中注册，执行这些注解的方法在生命周期的同一点被调用，作为对应的Spring生命周期接口方法或显式声明的回调方法。在下面的例子中，缓存会预先放置接近初始化之前，并在销毁之前清除。

```
public class CachingMovieLister {

    @PostConstruct
    public void populateMovieCache() {
        // populates the movie cache upon initialization...
    }

    @PreDestroy
    public void clearMovieCache() {
        // clears the movie cache upon destruction...
    }

}
```
