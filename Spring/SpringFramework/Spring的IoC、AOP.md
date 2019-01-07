Spring AOP通过CGlib、JDK动态代理实现运行期的动态方法增强，以抽取出业务无关代码，使其不与业务代码耦合，从而降低系统耦合性，提高代码可重用性和开发效率。
所以AOP广泛应用在日志记录、监控管理、性能统计、异常处理、权限管理、统一认证等方面。

# 单例Bean如何注入Prototype的Bean？

要为单例Bean注入Prototype Bean，不只是修改Scope属性。由于单例Bean在容器启动时就会完成一次性初始化。所以最简单的，把Prototype Bean设置为通过代理注入，即把proxyMode属性设为**TARGET_CLASS**。

比如抽象类LearnService，可认为是有状态的，如果LearnService是单例的话，那必然会OOM
![](https://img-blog.csdnimg.cn/20210512164658255.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
实际开发时，很多人不假思索把LearnGo和LearnJava类加上 **@Service**，让它们成为Bean，也没有考虑到父类其实有状态：
```java
@Service
@Slf4j
public class LearnJava extends LearnService {

    @Override
    public void learn() {
        super.learn();
        log.info("java");
    }
}

@Service
@Slf4j
public class LearnGo extends LearnService {

    @Override
    public void learn() {
        super.learn();
        log.info("go");
    }
}
```
相信大多数同学都认为 **@Service** 的意义就在于Spring能通过 **@Autowired** 自动注入对象，就比如可以直接使用注入的List获取到LearnJava和LearnGo，而没想过类的生命周期：
```java
@Autowired
List<LearnService> learnServiceList;

@GetMapping("test")
public void test() {
    log.info("====================");
    learnServiceList.forEach(LearnService::learn);
}
```
- 当年开发父类的人将父类设计为有状态的，但不关心子类怎么使用父类的
- 而开发子类的同学，没多想就直接添加 **@Service**，让类成为Bean，再通过 **@Autowired**注入该服务
这样设置后，有状态的父类就可能产生内存泄漏或线程安全问题。

## 最佳实践

在给类添加 **@Service**把类型交由容器管理前，首先考虑类是否有状态，再为Bean设置合适Scope。
比如该案例，就为我们的两个类添加 **@Scope**即可，设为**PROTOTYPE**生命周期：
![](https://img-blog.csdnimg.cn/20210512170638576.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
但这样还是会内存泄漏，说明修改无用！

观察日志可得，第一次调用和第二次调用时，SayBye对象都是4c0bfe9e，SayHello也是一样问题。从日志第7到10行还可以看到，第二次调用后List的元素个数变为了2，说明父类SayService维护的List在不断增长，不断调用必然出现OOM：
```java
[17:12:45.798] [http-nio-30666-exec-1] [INFO ] [c.j.s.beansingletonandorder.LearnService:26  ] - I'm com.javaedge.springpart1.beansingletonandorder.LearnGo@4a5fe6a2 size:1
[17:12:45.798] [http-nio-30666-exec-1] [INFO ] [c.j.s.beansingletonandorder.LearnGo:20  ] - go
[17:12:45.839] [http-nio-30666-exec-1] [INFO ] [c.j.s.beansingletonandorder.LearnService:26  ] - I'm com.javaedge.springpart1.beansingletonandorder.LearnJava@6cb46b0 size:1
[17:12:45.840] [http-nio-30666-exec-1] [INFO ] [c.j.s.beansingletonandorder.LearnJava:17  ] - java
[17:12:57.380] [http-nio-30666-exec-2] [INFO ] [c.j.s.b.BeanSingletonAndOrderController:25  ] - ====================
[17:12:57.416] [http-nio-30666-exec-2] [INFO ] [c.j.s.beansingletonandorder.LearnService:26  ] - I'm com.javaedge.springpart1.beansingletonandorder.LearnGo@b859c00 size:2
[17:12:57.416] [http-nio-30666-exec-2] [INFO ] [c.j.s.beansingletonandorder.LearnGo:20  ] - go
[17:12:57.452] [http-nio-30666-exec-2] [INFO ] [c.j.s.beansingletonandorder.LearnService:26  ] - I'm com.javaedge.springpart1.beansingletonandorder.LearnJava@5426300 size:2
[17:12:57.452] [http-nio-30666-exec-2] [INFO ] [c.j.s.beansingletonandorder.LearnJava:17  ] - java
```
所以，问题就是：
### 单例Bean如何注入Prototype Bean？
Controller标记了 **@RestController**
**@RestController** = **@Controller** + **@ResponseBody**，又因为 **@Controller**标记了 **@Component**元注解，所以 **@RestController**也是一个Spring Bean。

Bean默认是单例的，所以单例的Controller注入的Service也是一次性创建的，即使Service本身标识了**prototype**的范围，也不会起作用。

修复方案就是让Service以代理方式注入。这样虽然Controller是单例的，但每次都能从代理获取Service。这样一来，prototype范围的配置才能真正生效：
![](https://img-blog.csdnimg.cn/20210512172431727.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

调试发现，注入的Service都是Spring生成的代理类：
![](https://img-blog.csdnimg.cn/20210512172721106.png)

如果不希望走代理，还有一种方案，每次直接从ApplicationContext中获取Bean：
![](https://img-blog.csdnimg.cn/20210512172928970.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
这里Spring注入的LearnService的List，第一个元素是LearnGo，第二个元素是LearnJava。但我们更希望的是先执行Java再执行Go，所以注入一个List Bean时， 还要能控制Bean的顺序。

一般来说，顺序如何都无所谓，但对AOP，顺序可能会引发致命问题。
# 监控切面顺序导致的Spring事务失效
通过AOP实现一个整合日志记录、异常处理和方法耗时打点为一体的统一切面。但后来发现，使用了AOP切面后，这个应用的声明式事务处理居然都是无效的。


现在分析AOP实现的监控组件和事务失效有什么关系，以及通过AOP实现监控组件是否还有其他坑。

先定义一个自定义注解Metrics，打上该注解的方法可以实现各种监控功能：
![](https://img-blog.csdnimg.cn/20210512190554206.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

然后，实现一个切面完成Metrics注解提供的功能。这个切面可以实现标记了@RestController注解的Web控制器的自动切入，如果还需要对更多Bean进行切入的话，再自行标记@Metrics注解。

测试MetricsAspect的功能。

Service中实现创建用户的时候做了事务处理，当用户名包含test字样时会抛出异常，导致事务回滚。为Service中的createUser添加@Metrics注解。
还可以手动为类或方法添加@Metrics注解，实现Controller之外的其他组件的自动监控。

```java
@Slf4j
@RestController //自动进行监控
@RequestMapping("metricstest")
public class MetricsController {
    @Autowired
    private UserService userService;
    @GetMapping("transaction")
    public int transaction(@RequestParam("name") String name) {
        try {
            userService.createUser(new UserEntity(name));
        } catch (Exception ex) {
            log.error("create user failed because {}", ex.getMessage());
        }
        return userService.getUserCount(name);
    }
}

@Service
@Slf4j
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Transactional
    @Metrics //启用方法监控
    public void createUser(UserEntity entity) {
        userRepository.save(entity);
        if (entity.getName().contains("test"))
            throw new RuntimeException("invalid username!");
    }

    public int getUserCount(String name) {
        return userRepository.findByName(name).size();
    }
}

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    List<UserEntity> findByName(String name);
}
```

使用用户名“test”测试一下注册功能，自行测试可以观察到日志中打出了整个调用的出入参、方法耗时：

但之后性能分析觉得默认的 **@Metrics**配置不太好，优化点：
- Controller的自动打点，不要自动记录入参和出参日志，避免日志量过大
- Service中的方法，最好可以自动捕获异常

优化调整：
- MetricsController手动添加 **@Metrics**，设置logParameters和logReturn为false
![](https://img-blog.csdnimg.cn/20210513134317508.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

- Service中的createUser方法的@Metrics注解，设置了ignoreException属性为true
![](https://img-blog.csdnimg.cn/20210513134421950.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

可是实际上线发现日志量并没有减少，而且事务回滚还失效了，从输出看到最后查询到了名为test的用户。

执行Service的createUser方法时，Spring 的 TransactionAspectSupport并没有捕获到异常，所以自然无法回滚事务。因为异常被MetricsAspect吞了。

切面本身是一个Bean，Spring对不同切面增强的执行顺序是由Bean优先级决定的，具体规则是：
- 入操作（Around（连接点执行前）、Before），切面优先级越高，越先执行
一个切面的入操作执行完，才轮到下一切面，所有切面入操作执行完，才开始执行连接点（方法）
- 出操作（Around（连接点执行后）、After、AfterReturning、AfterThrowing）
切面优先级越低，越先执行。一个切面的出操作执行完，才轮到下一切面，直到返回到调用点。
- 同一切面的Around比After、Before先执行

对于Bean可以通过 **@Order** 设置优先级：默认情况下Bean的优先级为最低优先级，其值是Integer的最大值。值越大优先级越低。
![](https://img-blog.csdnimg.cn/20210513142450888.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210513142719486.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
## 通知
### 执行顺序
新建一个TestAspectWithOrder10切面，通过 **@Order**注解设置优先级为10，做简单的日志输出，切点是TestController所有方法；
![](https://img-blog.csdnimg.cn/20210513143248251.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)
然后再定义一个类似的TestAspectWithOrder20切面，设置优先级为20：
![](https://img-blog.csdnimg.cn/20210513143327567.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

调用TestController的方法，观察日志输出：
```bash
TestAspectWithOrder10 @Around before
TestAspectWithOrder10 @Before
TestAspectWithOrder20 @Around before
TestAspectWithOrder20 @Before
TestAspectWithOrder20 @Around after
TestAspectWithOrder20 @After
TestAspectWithOrder10 @Around after
TestAspectWithOrder10 @After
```
Spring的事务管理同样基于AOP，默认，优先级最低，会先执行出操作，但自定义切面MetricsAspect默认情况下也是最低优先级。
这时就会产生问题：若出操作先执行捕获了异常，则Spring事务就会因为无法catch异常而无法回滚。

所以要指定MetricsAspect的优先级，可设置为最高优先级，即最先执行入操作最后执行出操作：
![](https://img-blog.csdnimg.cn/20210513150407535.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

切入的连接点是方法，注解定义在类上是无法直接从方法上获取到注解的。所以要改为优先从方法获取，若方法上获取不到再从类获取，若还是获取不到则使用默认注解：
```java
Metrics metrics = signature.getMethod().getAnnotation(Metrics.class);
if (metrics == null) {
    metrics = signature.getMethod().getDeclaringClass().getAnnotation(Metrics.class);
}
```
修正完后，事务就可以正常回滚了，并且Controller的监控日志也不再出现入参、出参。

监控平台如果想生产可用，需修改：
- 日志打点，改为对接Metrics监控系统
- 各种监控开关，从注解属性获取改为通过配置中心实时获取