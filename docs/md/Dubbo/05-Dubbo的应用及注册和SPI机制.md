# 05-Dubbo的应用及注册和SPI机制


## Dubbo 的服务注册中应用级注册优化

### Dubbo 的注册中心

Dubbo 支持很多种注册中心，支持的主流注册中心包括：ZooKeeper、Nacos、Redis

Dubbo 需要引入注册中心依赖，并且配置注册中心地址，这里以 ZooKeeper 注册中心为例介绍如何使用

**引入依赖：**

其中引入的 `dubbo-dependencies-zookeeper` 将自动为应用增加 Zookeeper 相关客户端的依赖，减少用户使用 Zookeeper 成本，如使用中遇到版本兼容问题，用户也可以不使用 `dubbo-dependencies-zookeeper`，而是自行添加 Curator、Zookeeper Client 等依赖。

```xml
<properties>
    <dubbo.version>3.0.8</dubbo.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>${dubbo.version}</version>
    </dependency>
    <!-- This dependency helps to introduce Curator and Zookeeper dependencies that are necessary for Dubbo to work with zookeeper as transitive dependencies  -->
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-dependencies-zookeeper</artifactId>
        <version>${dubbo.version}</version>
        <type>pom</type>
    </dependency>
</dependencies>
```



要特别注意 ZooKeeper 版本和 Dubbo 版本之间的适配兼容，如下：

| Zookeeper Server 版本 | Dubbo 版本   | Dubbo Zookeeper 依赖包                | 说明                                           |
| --------------------- | ------------ | ------------------------------------- | ---------------------------------------------- |
| 3.4.x 及以下          | 3.0.x 及以上 | dubbo-dependencies-zookeeper          | 传递依赖 Curator 4.x 、Zookeeper 3.4.x         |
| 3.5.x 及以上          | 3.0.x 及以上 | dubbo-dependencies-zookeeper-curator5 | 传递依赖 Curator 5.x 、Zookeeper 3.7.x         |
| 3.4.x 及以上          | 2.7.x 及以下 | dubbo-dependencies-zookeeper          | 传递依赖 Curator 4.x 、Zookeeper 3.4.x         |
| 3.5.x 及以上          | 2.7.x 及以下 | 无                                    | 须自行添加 Curator、Zookeeper 等相关客户端依赖 |



**配置启用：**

```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
```



### Dubbo 支持多注册中心

Dubbo 在默认情况下：

- Service 服务会 `注册到所有的全局默认的注册中心` 去
- 会将 Reference 服务去 `对所有的全局默认注册中心进行订阅` 

**多注册中心配置如下：** 

```yml
# application.yml (Spring Boot)
dubbo
 registries
  beijingRegistry
   address: zookeeper://localhost:2181
  shanghaiRegistry
   address: zookeeper://localhost:2182
```

如果不进行 `默认项` 的配置，则该注册中心是默认的，上边两个注册中心没有指定默认项（默认 default = true），那么对于没有指定注册中心 id 的服务将会分别注册到上边的两个注册中心去

**也可以指定该注册中心不是默认的：** 

```yaml
# application.yml (Spring Boot)
dubbo
 registries
  beijingRegistry
   address: zookeeper://localhost:2181
   default: true
  shanghaiRegistry
   address: zookeeper://localhost:2182
   # 非默认
   default: false
```



**可以显式指定服务要注册的注册中心 id：**

```java
@DubboService(registry = {"beijingRegistry"})
public class DemoServiceImpl implements DemoService {}

@DubboService(registry = {"shanghaiRegistry"})
public class HelloServiceImpl implements HelloService {}
```





### Dubbo 的服务注册

Dubbo3 之前一直是接口级注册，Dubbo3 之后推出了应用级注册，接下来说一下为什么要换为应用级注册！

- **Dubbo 中 `接口级注册` 的缺点**

在 Dubbo3.0 之前的服务注册使用的是 `接口级注册` ，这种注册方式对于注册中心的压力是非常大的，比如一个应用有 3 个实例对象，那么在注册中心上注册的格式如下：

```markdown
tri://192.168.65.61:20880/com.zqy.UserService
tri://192.168.65.62:20880/com.zqy.UserService
tri://192.168.65.63:20880/com.zqy.UserService

tri://192.168.65.61:20880/com.zqy.ProductService
tri://192.168.65.62:20880/com.zqy.ProductService
tri://192.168.65.63:20880/com.zqy.ProductService
```

那么当一个 `服务提供者` 上提供很多接口的时候，就需要在注册中心上 `注册大量的节点` ，导致注册中心压力比较大，并且如果提供者新增接口的话，消费者也需要去修改本地缓存的注册中心节点，也会比较耗费性能

**简单一句话概括就是，在 Dubbo3.0 之前，接口级注册要注册的信息太多了！**

而在 SpringCloud 中，和 Dubbo 的 `注册粒度不同` ，SpringCloud 是进行应用级的注册，因此下边无论多少个接口，都不影响 SpringCloud 的注册，注册的格式如下：

```markdown
应用名：
	192.168.65.61:8080
	192.168.65.62:8080
	192.168.65.63:8080
```



- **因此，Dubbo3 中改成了 `应用级服务注册！`**

简单来说，应用及服务注册带来的好处就是，**大大减少了注册的数据！但同时给服务消费者寻找服务带来了复杂性！**

在 Dubbo3.0 中，默认情况下，会同时进行 `接口级注册` 和 `应用级注册` ，这是为了兼容！因为当服务提供者升级到 3.0 之后，可能有些服务消费者还处于 Dubbo2.7 的版本，并没有应用级注册的能力！

如果确认所有的消费者都已经成功迁移 Dubbo3.0 的话，就可以在 yml 文件中配置只进行应用级注册：

```yaml
# application.yml
dubbo:
  application:
    name: dubbo-app
    register-mode: instance # 只进行应用级注册
    # register-mode: interface # 只进行接口级注册
    # register-mode: all # 默认，同时进行接口级、应用级注册，为了兼容
```



- **Dubbo 的服务提供者如何进行 `应用级注册`**

我们先来思考一下，服务消费者如果需要使用服务，需要哪些信息？

服务消费者本身是只有接口相关的信息的，比如 com.zqy.hello.UserService 这个接口信息，那么消费者就要通过这个接口信息来找到提供者中对应的服务

因此提供者必须将接口 -> 服务的信息给暴露出来

1、首先，服务提供者进行应用级注册，在注册中心上的数据为：

```yml
# 应用名 -> 应用地址的映射
dubbo-provider: 192.168.65.61:20880
```



2、此时注册中心上只有应用地址的 ip:port 信息，那么服务消费者还不知道他所使用的接口对应的应用是哪一个

因此服务提供者还存储了 `接口名 -> 应用名` 的映射：

```yml
# 接口名和应用名的映射
com.zqy.dubbo.service.UserService: dubbo-provider
```

那么此时，消费者就可以根据接口名获取到对应的应用地址了

3、但是消费者怎样去知道这个应用中是否有自己需要的服务呢？

因此服务提供者将自己应用中的所有 Dubbo 服务信息都给存储了 MetaDataInfo 中去，并且在服务启动之后，会暴露一个 `应用元数据服务` ，这是 Dubbo 内置的一个服务

那么消费者就可以调用这个 `应用元数据服务` 来获取该应用中的 Dubbo 服务信息了

这样一来呢，Dubbo 中服务的具体信息就不在注册中心上了，而是在元数据中进行存储，避免了注册中心压力过大！



- **再说一下 Dubbo 的应用元数据服务**

上边说到了 Dubbo 服务提供者会暴露一个 `应用元数据` 服务

这个 `应用元数据服务` 其实就是用来减轻注册中心压力的，之前使用接口级注册的时候，会将服务的信息都给注册到注册中心去，导致注册中心压力很大

现在会将服务的信息给存储到 `应用元数据服务` 中去，来供消费者查询服务的具体信息

那么服务提供者需要将服务的元数据信息给暴露出去，让服务消费者可以查询到，暴露的方式有两种，可以通过 `metadata-type` 来配置：

```yaml
# application.yaml
dubbo:
  application:
    name: dubbo-provider
    metadata-type: local # 或 remote
```

- **local** ：默认情况，如果是 local 的话，会将服务的元数据给放在服务提供者的本地，之后暴露 `应用元数据服务` 来供消费者进行查询，也就是上边我们说的情况

![image-20240220191439946](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240220191439946.png)

- **remote** ：如果是 remote 的话，表示会将服务的元数据放在远程主机，则提供者不会暴露 `应用元数据服务` ，而是通过将服务的元数据信息存储在远程的 `元数据中心` 中去，`元数据中心` 可以是 ZooKeeper 也可以是 Nacos，那么消费者需要查询服务的信息时，去 `元数据中心` 中查询即可！

![image-20240220191503783](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240220191503783.png)

**这两种暴露方式在性能上有什么区别呢？**

- 如果是暴露 `应用元数据服务` 的话，每一个服务提供者都会暴露一个 `应用元数据服务` ，因此这个 `元数据服务` 是比较分散的，一般不会出现单点压力较大的情况
- 如果是使用 `元数据中心` 的话，当整个微服务集群压力比较大的时候，会导致这个 `元数据中心` 压力也大

因此，综上看来，暴露 `应用元数据服务` 这一种方式比较好，而 Dubbo 中默认的也就是这一种方式



那么，应用级注册就已经说完了，**为什么需要应用级注册呢？**

就是为了减轻注册中心的压力，至于具体非常细的细节可以不用抠的非常认真，知道它原理是什么，用于解决什么问题的即可

## Dubbo 的 SPI 机制

### SPI 机制原理介绍

在 Dubbo 中 SPI 是一个非常重要的模块，基于 SPI 可以很容易的进行扩展，可以 `很灵活的替换接口的实现类`，**通过 SPI 可以在运行期间动态的寻找具体的实现类！** 

并且 Dubbo 的 SPI 还实现了自己的 IOC 和 AOP！

其实 SPI 的原理很简单，就是我们定义一个接口 UserService，在定义一个配置文件（假设为文件 a），此时假设 UserService 有两个实现类：UserServiceImpl1、UserServiceImpl2，用户根据自己的需求在文件 a 中指定需要加载哪一个实现类，如下：

```bash
# 指定接口对应实现类的全限定类名
com.example.hello.UserService=com.example.hello.impl.UserServiceImpl1
```

![image-20240219140242325](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240219140242325.png)

像 Java 中也提供了 SPI 机制，但是 Dubbo 中并没有使用 Java 提供的 SPI ，而是 **基于 Java 提供的 SPI 实现了一套功能更强的 SPI 机制！**

Dubbo 中通过 SPI 指定实现类的配置文件放在 META-INF/dubbo 路径下（一般 SPI 机制的配置文件都在 META-INF 目录下）



### Dubbo 为什么不用 JDK 中的 SPI 而是自己实现一套呢？

其实很容易想到，为什么不用呢，就是因为太弱了！

JDK 提供的 SPI 机制不满足 Dubbo 的需求，因此 Dubbo 才要开发自己的 SPI 机制

回答的思路就是，先说 JDK 的 SPI 哪里不满足呢？那就是列出 JDK 的 SPI 缺点

之后再说在 Dubbo 中的针对它的哪些需求做了哪些的改进

这些 JDK 的 SPI 缺点、Dubbo SPI 优点，网上一查一大堆，这里我也给列一下：

- **JDK SPI 的缺点：**

JDK 的 SPI 机制在查找实现类的时候，由于配置文件根根据接口的全限定类名命名的，需要先遍历 `META-INF/services/` 目录下的所有配置文件，找到对应的配置文件，再将配置文件中的全部实现类都取出来，进行实例化操作

因此呢，它的缺点就是无法按需加载实现类，导致出现资源浪费，并且指定了配置目录 `META-INF/services/` ，不是很灵活

- **Dubbo SPI 的优点：**

Dubbo 的 SPI 对配置文件的目录规定了多个，各自的职责不同：

- META-INF/services/ 目录：该目录下的 SPI 配置文件是为了用来兼容 Java SPI 。
- META-INF/dubbo/ 目录：该目录存放用户自定义的 SPI 配置文件。
- META-INF/dubbo/internal/ 目录：该目录存放 Dubbo 内部使用的 SPI 配置文件。

Dubbo 的 SPI 代码中还实现了 IOC 和 AOP，可以对扩展的实现类进行依赖注入，以及 AOP 拦截，也就是方法增强

并且 Dubbo 中的 SPI 是通过 `K-V` 方式配置的，因此可以 `按需加载实现类` ，优化了 JDK SPI 的缺点

从这几个点呢，可以看出 Dubbo 的 SPI 机制是非常灵活的，可以针对实现类做出拦截扩展操作，并且性能也不错，按需加载，不会出现资源浪费



### Dubbo 中 SPI 使用

**先说一下 Dubbo 中的 SPI 使用：**

- 第一步：配置文件如下（配置文件在 META-INF/dubbo 目录下，Dubbo 会自动去扫描该目录中的配置文件）：

```yaml
userServiceImpl1 = com.example.hello.impl.UserServiceImpl1
userServiceImpl2 = com.example.hello.impl.UserServiceImpl2
```

- 第二步：SPI 接口：

```java
@SPI("userServiceImpl2") // 可以指定默认的 SPI 实现类为 userServiceImpl2
public interface UserService {
    void sayHello();
}
```

- 第三步：加载实现类

```java
public class DubboSPITest {
   @Test
   public void sayHello() throws Exception {
       ExtensionLoader<Robot> extensionLoader =
           ExtensionLoader.getExtensionLoader(UserService.class);
       UserService userServiceImpl1 = extensionLoader.getExtension("userServiceImpl1");
       userServiceImpl1.sayHello();
       UserService userServiceImpl2 = extensionLoader.getExtension("userServiceImpl2");
       userServiceImpl2.sayHello();
       UserService defaultUserServiceImpl = extensionLoader.getDefaultExtension();
        defaultUserServiceImpl.sayHello();
   }
}
```





**Dubbo 的 SPI 实现中，包含了 IOC 和 AOP，接下来说一下 Dubbo 如何实现了 IOC 和 AOP**

### Dubbo 的 IOC？

Dubbo 通过 SPI 来创建接口的扩展实现类时，那么如果这个实现类中有其他扩展点的依赖的话，Dubbo 会自动将这些依赖注入到这个扩展实现类中

Dubbo 中的 IOC 和 AOP 的代码都是在 `ExtensionLoader # createExtension()` 方法中（为了代码简洁性，省略一些无关代码）：

```java
    @SuppressWarnings("unchecked")
    private T createExtension(String name, boolean wrap) {
        Class<?> clazz = getExtensionClasses().get(name);
        try {
            T instance = (T) extensionInstances.get(clazz);
            if (instance == null) {
                extensionInstances.putIfAbsent(clazz, createExtensionInstance(clazz));
                instance = (T) extensionInstances.get(clazz);
                instance = postProcessBeforeInitialization(instance, name);
                // IOC 代码
                injectExtension(instance);
                instance = postProcessAfterInitialization(instance, name);
            }

        }
    }
```



SPI 中 IOC 的核心方法就是 `injectExtension()`：

```java
    private T injectExtension(T instance) {
        try {
            // 使用反射遍历所有的方法
            for (Method method : instance.getClass().getMethods()) {
                // 如果不是 setter 方法就跳过
                if (!isSetter(method)) {
                    continue;
                }
                // 获取 setter 方法的参数
                Class<?> pt = method.getParameterTypes()[0];
                if (ReflectUtils.isPrimitives(pt)) {
                    continue;
                }

                try {
                    // 获取 setter 中需要设置的属性，比如 setUserName，该方法就是取出来 set 后边的名称 String property = "UserName"
                    String property = getSetterProperty(method);
                    // 寻找需要注入的属性
                    Object object = injector.getInstance(pt, property);
                    if (object != null) {
                        // 通过反射进行注入
                        method.invoke(instance, object);
                    }
                } 
            }
        } 
        return instance;
    }
```



Dubbo 的 IOC 是 `通过 setter 方法注入依赖` 的：

- 第一步：通过反射获取实例的所有方法，找到 setter 方法
- 第二步：通过 ObjectFactory（这里的 ObjectFactory 其实是 AdaptiveExtensionFactory 实例，这个实例就是 Dubbo 中的扩展工厂） 获取依赖对象（也就是需要注入的对象），来进行 setter 属性注入的！





### Dubbo 的 AOP？

Dubbo 的 AOP 其实就是通过 `装饰者模式` 来实现的，在包装类上进行增强

Dubbo 的 IOC 和 AOP 都在 `org.apache.dubbo.common.extension.ExtensionLoader # createExtension()` 这个方法中，AOP 相关的源码如下：

```java
 private T createExtension(String name, boolean wrap) {
        try {
            if (wrap) {
                List<Class<?>> wrapperClassesList = new ArrayList<>();
                // 拿到缓存中的包装类 WrapperClass
                if (cachedWrapperClasses != null) {
                    wrapperClassesList.addAll(cachedWrapperClasses);
                    // 将所有的包装类按照 order 进行排序，order 比较小的包装类在较外层
                    wrapperClassesList.sort(WrapperComparator.COMPARATOR);
                    Collections.reverse(wrapperClassesList);
                }

                if (CollectionUtils.isNotEmpty(wrapperClassesList)) {
                    // 通过 for 循环，进行 Wrapper 的包装，进行包装类的层层嵌套
                    // 比如有三个 Wrapper 类，AWrapper、BWrapper、CWrapper
                    // 那么经过包装之后也就是：AWrapper(BWrapper(CWrapper(被包装类)))
                    // 执行流程：先执行 AWrapper 包装的方法，再执行 BWrapper 包装的方法，再执行 CWrapper 包装的方法，再执行被包装类的方法
                    for (Class<?> wrapperClass : wrapperClassesList) {
                        Wrapper wrapper = wrapperClass.getAnnotation(Wrapper.class);
                        boolean match = (wrapper == null)
                                || ((ArrayUtils.isEmpty(wrapper.matches())
                                                || ArrayUtils.contains(wrapper.matches(), name))
                                        && !ArrayUtils.contains(wrapper.mismatches(), name));
                        if (match) {
                            // 先调用包装类的构造方法创建包装类，有 3 个包装类，因此是 3 次 for 循环，外层包装类包裹了里边的包装类
                            // 比如第一次就是 instance = CWrapper(被包装类)
                            // 第二次就是 instance = BWrapper(CWrapper(被包装类))
                            // 第三次就是 instance = AWrapper(BWrapper(CWrapper(被包装类)))
                            instance = injectExtension(
                                    (T) wrapperClass.getConstructor(type).newInstance(instance));
                        }
                    }
                }
            }
            return instance;
        } 
    }
}
```



上边的方法主要是扫描 wrapperClassesList（包装类），而这个包装类集合其实就是 cachedWrapperClasses

cachedWrapperClasses 是 Dubbo 在扫描类（执行 loadClass）的时候，会去判断这个类是不是包装类，如果是包装类，就加入到 cachedWrapperClasses 中

通过 for 循环进行包装类的包装，下边举一个 SPI AOP 的例子，**也就是通过 Wrapper 包装实现 Dubbo 中的 AOP 机制** ：

```java
// Person 接口
@SPI("person")
public interface Person {
    void hello();
}
// SPI 接口实现类
public class Student implements Person {
    public void hello() {
        System.out.println("I am student");
    }
}
// Wrapper 包装类
public class StudentWrapper implements Person {
    private Person person;
    public StudentWrapper(Person person) {
        this.person = person;
    }
    public void hello() {
        System.out.println("before");
        person.hello();
        System.out.println("after");
    }
}
// Dubbo 配置文件（配置文件名与 Person 接口保持一致）：resources/META-INF/dubbo/com.zqy.hello.Person
student=com.zqy.hello.impl.Student
filter=com.zqy.hello.wrapper.StudentWrapper
    
// 运行测试类即可看到包装类输出效果
public static void main(String[] args) {
    ExtensionLoader<Person> loader = ExtensionLoader.getExtensionLoader(Person.class);
    Person studesnt = loader.getExtension("student");
    studesnt.hello();
}
```



