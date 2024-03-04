# 06-Spring 面试实战

## Spring 面试实战

Spring 在面试中考察的概率也是比较大的，这部分主要对 Spring 中可能出现的面试题做一个分析



### 谈一谈对 Spring IOC 的理解

Spring IOC 是为了去解决 `类与类之间的耦合` 问题的

如果不用 Spring IOC 的话，如果想要去使用另一个类的对象，必须通过 new 出一个实例对象使用：

```java
UserService userService = new UserServiceImpl();
```

这样存在的问题就是，如果在很多类中都使用到了 UserServiceImpl 这个对象，但是如果因为变动，不去使用 UserServiceImpl 这个实现类，而要去使用  UserManagerServiceImpl 这个实现类，那么我们要去很多创建这个对象的地方进行修改，这工作量是巨大的

有了 IOC 的存在，通过 Spring 去统一管理对象实例，我们使用 @Resource 直接去注入这个

```java
@Resource
UserService userServiceImpl;
```

如果要切换实现类，通过注解 @Service 来控制对哪个实现类进行扫描注册到 Spring 即可，如下

```java
@Controller
public class UserController {
  @Resource
  private UserService userService;
  
  // 方法...
}

public class UserService implements UserService {}

@Service
public class UserManagerServiceImpl implements UserService {}
```





### 谈一谈对 Spring AOP 的理解

Spring AOP 主要是 `去做一个切面的功能` ，可以将很多方法中 `通用的一些功能从业务逻辑中剥离出来` ，剥离出来的功能通常与业务无关，如 `日志管理`、`事务管理`等，在切面中进行管理

Spring AOP 实现的底层原理就是通过动态代理来实现的，`JDK 动态代理`和 `CGLIB 动态代理`

Spring AOP 会根据目标对象是否实现接口来自动选择使用哪一种动态代理，如果目标对象实现了接口，默认情况下会采用 JDK 动态代理，否则，使用 CGLIB 动态代理

JDK 动态代理和 CGLIB 动态代理具体的细节这里就不讲了，可以参考之前我写的文章：[JDK和CGLIB动态代理](https://blog.csdn.net/qq_45260619/article/details/134361337)





### Spring 的 Bean 是线程安全的吗？

**能说说 Spring 中的 Bean 是线程安全的吗？**

首先来分析一下什么时候会线程不安全，如果每个线程过来操作都创建一个新的对象，那么肯定不对出现线程安全的问题，如果多个线程操作同一个对象，那么就会出现线程不安全问题

而 Spring 中的 Bean 默认是 `单例` 的，也就是在 Spring 容器中，只有这一份 Bean 对象，每个线程过来都是操作这一份变量，那么肯定是线程不安全的



### Spring 的事务实现原理

**Spring 事务的实现原理了解过吗？**

Spring 的事务就是通过 `动态代理` 来实现的，如果开启事务，会在整个事务方法执行之前开启事务，如果执行过程中出现异常，将事务进行回滚，如果没有异常就提交事务，这些对事务的操作是业务无关的，因此在动态代理中执行



### Spring 事务的传播机制

**Spring 中事务的传播机制了解吗？**

Spring 事务的传播机制就是定义在多个事务存在的时候，Spring 该如何去处理这些事务的行为

事务传播机制有以下 7 种：

- `PROPAGATION_REQUIRED`：如果当前没有事务，就新建一个事务，如果当前存在事务，就加入该事务。这是最常见的选择，也是 Spring 默认的事务的传播
- `PROPAGATION_REQUIRES_NEW`：新建事务，无论当前是否存在事务，都会创建新的事务，新建的事务将和外层的事务没有任何关系，是两个独立的事务，外层事务失败回滚之后，不能回滚内层事务执行的结果，内层事务失败抛出异常，外层事务捕获，也可以不处理回滚操作
- `PROPAGATION_SUPPORTS`：支持当前事务，如果当前存在事务，就加入该事务，如果当前没有事务，就以非事务方式执行
- `PROPAGATION_NESTED`：如果当前事务存在，则运行在一个嵌套的事务中。如果当前没有事务，则按 REQUIRED 属性执行
- `PROPAGATION_MANDATORY`：支持当前事务，如果当前存在事务，就加入该事务，如果当前没有事务，就抛出异常
- `PROPAGATION_NOT_SUPPORTED`：以非事务方式执行操作，如果当前存在事务，就把当前事务挂起
- `PROPAGATION_NEVER`：以非事务方式执行，如果当前存在事务，则抛出异常。



**其中常用的事务传播机制就是前边 4 种，下边解释一下：**

对于 `PROPAGATION_REQUIRED` 来说，是默认的事务传播机制，比如 A 方法调用 B 方法，A 方法开启了事务，那么 B 方法会加入 A 方法的事务，A 方法或 B 方法种只要出现异常，这个事务就会回滚

对于 `PROPAGATION_REQUIRES_NEW` 来说，如果 A 方法开启事务，A 方法调用 B 方法，A 方法的事务级别为`PROPAGATION_REQUIRED`，B 方法的事务级别为 `PROPAGATION_REQUIRES_NEW`，那么执行到 B 方法时，A 方法的事务就会挂起，给 B 方法创建一个新的事务开始执行，此时 A 和 B 是不同的事务，当 B 的事务执行完毕之后，在执行 A 的事务（每次创建的事务都是一个新的物理事务，也就是每创建一个新的事务，都会为这个事务绑定一个新的数据库连接）

对于 `PROPAGATION_SUPPORTS` 这个事务级别很简单，这里也不说了，看上边的说明也能看懂

对于 `PROPAGATION_NESTED` 来说，如果 A 方法开启事务，A 方法调用 B 方法，A 方法的事务级别为`PROPAGATION_REQUIRED`，B 方法的事务级别为 `PROPAGATION_NESTED`，如果执行 B 方法出现异常，B 方法会回滚，而在 A 方法的事务可以选择回滚也可以选择不回滚，当 B 的事务开始执行时，它将取得一个 savepoint，当 B 的事务执行失败，会回滚到这个 savepoint 上，B 的事务是 A 事务的一部分，当 A 事务执行结束之后才会去提交 B 事务



其中  `PROPAGATION_REQUIRED` 和 `PROPAGATION_NESTED` 这两个比较类似，不过 NESTED 使用了保存点（savepoint），事务可以回滚到 savepoint，而不是回滚整个事务



**事务传播机制总结：**

面试的时候，肯定不会一个一个去问你，某一个事务传播机制对应的特性是什么，这样问也没有意义

把常用的 4 个事务传播机制给记住，面试官问的话，可能会这么去问：

现在有两个方法 A 和 B，A 调用 B，如果希望 A 出错了，此时仅仅回滚 A 方法，而不去回滚 B 方法，那么需要使用哪一种传播机制呢？

当然是使用 `PROPAGATION_REQUIRES_NEW` 让两个事务之间独立即可

如果希望出现异常的时候，B 方法只可以回滚自己，而 A 方法可以带着 B 方法回滚，该使用哪一种传播机制呢？

那当然使用  `PROPAGATION_NESTED` 了，嵌套事务，内部事务会在外部事务执行之后，才决定是否提交





### Spring 中的设计模式

**Spring 中使用了哪些设计模式？**

这个其实出现的频率也是比较高的，因为设计模式本来就很容易问，结合上 Spring 正好充当一个提问的背景

问 Spring 中使用了哪些设计模式，用的最多的就是：工厂模式、单例模式、代理模式

- `工厂模式`，其实就是在 Spring IOC 中使用了，IOC 其实就是通过一个大的工厂管理 Spring 中所有的 Bean，如果需要使用 Bean，去工厂中获取
- `单例模式`，Spring 中的 Bean 都是作为单例存在的，确保了每个类在系统运行期间都只有一个实例对象，这个就是通过单例模式来实现的，之前我面试的时候问到单例模式时，面试官还让手写了单例，这个一定要掌握一下，这里写一种单例的实现：

```java
public class SingletonDemo {
  private static volatile UserService userService;
  public static UserService getInstance() {
    if (userService == null) {
      synchronized (UserService.class) {
        // 双端检锁
        if (userService == null) {
          userService = new UserServiceImpl();
        }
      }
    }
    return userService;
  }
}
```



- `代理模式`，主要体现在 Spring AOP 中，通过动态代理为其他对象创建一个代理对象，来控制对其他对象的访问，可以通过代理模式添加一些业务无关的通用功能

