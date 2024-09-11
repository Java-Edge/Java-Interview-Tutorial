# SpringBoot默认线程池

## 0 Spring封装的几种线程池



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/1ea3d6beb49a7d30efb82b59703b0f94.png)

## 1 SpringBoot默认线程池

即ThreadPoolTaskExecutor，但SpringBoot不同版本有区别。

### 1.1 TaskExecutionAutoConfiguration

```java
@ConditionalOnClass(ThreadPoolTaskExecutor.class)
@Configuration
// 确保前缀为 spring.task.execution 的属性配置项被加载到 bean TaskExecutionProperties 中
@EnableConfigurationProperties(TaskExecutionProperties.class)
public class TaskExecutionAutoConfiguration {

	/**
	 * Bean name of the application TaskExecutor.
	 */
	public static final String APPLICATION_TASK_EXECUTOR_BEAN_NAME = "applicationTaskExecutor";

	private final TaskExecutionProperties properties;

	private final ObjectProvider<TaskExecutorCustomizer> taskExecutorCustomizers;

	private final ObjectProvider<TaskDecorator> taskDecorator;

	public TaskExecutionAutoConfiguration(TaskExecutionProperties properties,
			ObjectProvider<TaskExecutorCustomizer> taskExecutorCustomizers,
			ObjectProvider<TaskDecorator> taskDecorator) {
		this.properties = properties;
		this.taskExecutorCustomizers = taskExecutorCustomizers;
		this.taskDecorator = taskDecorator;
	}

    // 定义 bean TaskExecutorBuilder taskExecutorBuilder
    // 这是一个 TaskExecutor 构建器
	@Bean
    // 仅在该 bean 尚未被定义时才定义
	@ConditionalOnMissingBean
	public TaskExecutorBuilder taskExecutorBuilder() {
		TaskExecutionProperties.Pool pool = this.properties.getPool();
		TaskExecutorBuilder builder = new TaskExecutorBuilder();
		builder = builder.queueCapacity(pool.getQueueCapacity());
		builder = builder.corePoolSize(pool.getCoreSize());
		builder = builder.maxPoolSize(pool.getMaxSize());
		builder = builder.allowCoreThreadTimeOut(pool.isAllowCoreThreadTimeout());
		builder = builder.keepAlive(pool.getKeepAlive());
		builder = builder.threadNamePrefix(this.properties.getThreadNamePrefix());
		builder = builder.customizers(this.taskExecutorCustomizers);
		builder = builder.taskDecorator(this.taskDecorator.getIfUnique());
		return builder;
	}

    // 懒惰模式定义 bean ThreadPoolTaskExecutor applicationTaskExecutor，
    // 基于容器中存在的  TaskExecutorBuilder
	@Lazy
    // 使用bean名称 : taskExecutor, applicationTaskExecutor
	@Bean(name = { APPLICATION_TASK_EXECUTOR_BEAN_NAME,
			AsyncAnnotationBeanPostProcessor.DEFAULT_TASK_EXECUTOR_BEAN_NAME })
    // 仅在容器中不存在类型为 Executor 的 bean 时才定义            
	@ConditionalOnMissingBean(Executor.class)
	public ThreadPoolTaskExecutor applicationTaskExecutor(TaskExecutorBuilder builder) {
		return builder.build();
	}
}
```

SpringBoot 提供的自动配置类，简化 Spring 应用中异步任务执行和任务调度的配置。

#### 作用

自动配置异步任务执行器（Executor）： 为应用配置一个默认的 ThreadPoolTaskExecutor，这是一个基于线程池的 TaskExecutor 实现。它适用于应用中通过 @Async 标注的异步方法的执行。如你不提供自定义配置，Spring Boot 将会使用这个自动配置的执行器来执行异步任务。

自动配置任务调度器（Scheduler）： 为应用配置一个默认的 ThreadPoolTaskScheduler，这是用于任务调度的组件，支持 @Scheduled 注解标注的方法。这个调度器允许你在应用中简便地安排定期执行的任务。

可通过应用配置文件来定制配置： TaskExecutionAutoConfiguration 支持通过 application.properties 或 application.yml 配置文件来自定义任务执行和调度的相关参数，如线程池大小、队列容量等。这些参数分别位于 spring.task.execution 和 spring.task.scheduling 命名空间下。

#### 优势

与 Spring 生态系统的集成：自动配置的执行器和调度器与 Spring 的 @Async 和 @Scheduled 注解无缝集成

#### 使用场景

当你的应用需要执行异步任务或者按计划执行某些作业时，你通常会需要配置一个任务执行器或者任务调度器。在 Spring Boot 应用中，TaskExecutionAutoConfiguration 让这一步骤变得极为简单和自动化。

没有 TaskExecutionAutoConfiguration，你要手动配置线程池、异步执行器(TaskExecutor)和任务调度器(TaskScheduler)。即，你需要在你的 Spring 配置中显式地定义相关的Bean，并可能还要为这些Bean提供自定义的配置。

TaskExecutionAutoConfiguration 通过自动配置和简化配置工作，大大提高了开发效率，允许开发者更加专注于业务逻辑编写，而无需担心底层线程池和执行器的配置。

## 2 2.1版本后

有TaskExecutionAutoConfiguration自动配置类，帮我们自动配置默认线程池ThreadPoolTaskExecutor。

### 线程池默认参数

- 核心线程数 (corePoolSize): 8
- 最大线程数 (maxPoolSize): Integer.MAX_VALUE (无限制)
- 队列容量 (queueCapacity): Integer.MAX_VALUE (无限制)
- 空闲线程保留时间 (keepAliveSeconds): 60秒
- 线程池拒绝策略 (RejectedExecutionHandler): AbortPolicy（默认策略，超出线程池容量和队列容量时抛出RejectedExecutionException异常）

这些参数可通过在application.properties或application.yml文件中设置来进行自定义调整。


### 咋查看参数

在 Spring Boot 中，默认线程池由 TaskExecutorBuilder 类负责创建，它通常使用 ThreadPoolTaskExecutor 来配置默认的线程池。虽然默认的线程池参数可以根据不同的 Spring Boot 版本或特定配置而有所不同，但通常情况下，Spring Boot 默认的线程池参数如下：

SpringBoot默认的任务执行自动配置类。从@EnableConfigurationProperties(TaskExecutionProperties.class)可知，开启了属性绑定到TaskExecutionProperties类。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/1e69929a05fae30e8708e765ba1166c5.png)

打个断点可见默认参数：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/02bb0d80a73e3046530a7ff2c488a7e9.png)

进入TaskExecutionProperties，属性绑定以 spring.task.execution 为前缀。默认线程池coreSize=8，最大线程数maxSize = Integer.MAX_VALUE，以及任务等待队列queueCapacity = Integer.MAX_VALUE。因此，要对异步任务的执行线程池做一些基础配置，以防OOM。

```java
@ConfigurationProperties("spring.task.execution")
public class TaskExecutionProperties {

	private String threadNamePrefix = "task-";
	}

	public static class Pool {

		private int queueCapacity = Integer.MAX_VALUE;

		private int coreSize = 8;

		private int maxSize = Integer.MAX_VALUE;
```

### 方式一：@Async–采用ThreadPoolTaskExecutor

@Async默认用啥线程池？org.springframework.aop.interceptor.AsyncExecutionAspectSupport#determineAsyncExecutor

核心作用：根据@Async和方法上是否有指定的限定符来决定一个方法应该使用哪个AsyncTaskExecutor来执行异步任务。

- 方法首先尝试从一个缓存(this.executors)中查找并返回已经与方法关联的执行器
- 若缓存里没有，则该方法会尝试根据方法上的@Async指定的限定符，从Spring应用程序上下文中查找对应的执行器。（如@Async("taskExecutor")就找程序中已有的定义好的name="taskExecutor"的Bean）
- 如果没有指定限定符或找不到对应的Bean，它将尝试使用或创建一个默认的执行器
  - SpringBoot2.1后，会创建TaskExecutionAutoConfiguration帮我们自动配置好的默认线程池ThreadPoolTaskExecutor
  - SpringBoot2.1前，TaskExecutionAutoConfiguration没有帮我们配置默认线程池，最终会找到org.springframework.core.task.SimpleAsyncTaskExecutor
- 创建或确定执行器后，方法会将其存进缓存中，以备下次执行同一方法时使用

```java
protected AsyncTaskExecutor determineAsyncExecutor(Method method) {
    // 尝试从缓存中获取已确定的执行器
    AsyncTaskExecutor executor = this.executors.get(method);
    if (executor == null) {
        Executor targetExecutor; // 声明一个目标执行器
        String qualifier = getExecutorQualifier(method); // 获取方法上的@Async注解中指定的执行器的限定名
        

        // 如果注解中有限定名则尝试根据该名字从BeanFactory中查找对应的执行器
        if (StringUtils.hasLength(qualifier)) {
            targetExecutor = findQualifiedExecutor(this.beanFactory, qualifier);
        }
        else {
            // 如果未指定限定名，则使用默认的执行器
            targetExecutor = this.defaultExecutor;
            
            // 如果默认执行器为空，则尝试从BeanFactory中获取默认的执行器
            if (targetExecutor == null) {
                synchronized (this.executors) {
                    // 双重检查锁定，确保只有一个线程可以初始化defaultExecutor
                    if (this.defaultExecutor == null) {
                        this.defaultExecutor = getDefaultExecutor(this.beanFactory);
                    }
                    targetExecutor = this.defaultExecutor;
                }
            }
        }
        
        // 如果没有合适的目标执行器，返回null
        if (targetExecutor == null) {
            return null;
        }
        
        // 如果目标执行器是AsyncListenableTaskExecutor则直接使用，否则使用适配器封装以确保它实现了AsyncListenableTaskExecutor
        //所以SpringBoot2.1之前最终会找到org.springframework.core.task.SimpleAsyncTaskExecutor
        executor = (targetExecutor instanceof AsyncListenableTaskExecutor ?
                (AsyncListenableTaskExecutor) targetExecutor : new TaskExecutorAdapter(targetExecutor));
        
        // 将确定的执行器放入缓存，以便下次直接使用
        this.executors.put(method, executor);
    }
    // 返回确定的AsyncTaskExecutor
    return executor;

}
```

这个方法首先查找类型为 TaskExecutor 的Bean，如果有多个此类型的Bean，然后尝试查找名称为 “taskExecutor” 的Bean。如果这两种方式都没找到，那么将返回 null，表示没有找到适当的Bean来执行异步任务。这种情况下，AsyncExecutionInterceptor 将不会有执行器来处理异步方法。

```java
// 会去 Spring 的容器中找有没有 TaskExecutor 或名称为 'taskExecutor' 为 Executor 的 
@Nullable
protected Executor getDefaultExecutor(@Nullable BeanFactory beanFactory) {
    if (beanFactory != null) {
        try {
            return beanFactory.getBean(TaskExecutor.class);
        } catch (NoUniqueBeanDefinitionException ex) {
            return beanFactory.getBean("taskExecutor", Executor.class);
        } catch (NoSuchBeanDefinitionException ex) {
            return beanFactory.getBean("taskExecutor", Executor.class);
        }
    }
    return null;
}
```

#### 实操

```java
@Service
public class SyncService {

	@Async
	public void testAsync1() {
		System.out.println(Thread.currentThread().getName());
		ThreadUtil.sleep(10, TimeUnit.DAYS);
	}
	
	@Async
	public void testAsync2() {
		System.out.println(Thread.currentThread().getName());
		ThreadUtil.sleep(10, TimeUnit.DAYS);
	}

}
```

注意需要在启动类上需要添加@EnableAsync，否则不会生效。

```java
@RestController
public class TestController {

	@Autowired
	SyncService syncService;
	
	@SneakyThrows
	@RequestMapping("/testSync")
	public void testTomcatThreadPool() {
		syncService.testAsync1();
		syncService.testAsync2();
	}

}
```

请求后观察控制台输出结果，打印线程名如下，这里采用TaskExecutionAutoConfiguration帮我们配置的默认线程池ThreadPoolTaskExecutor，就是以task-开头的

```
task-2
task-1
```

#### @Async注意点

- 启动类上需要添加@EnableAsync
- 注解方法须是public
- 注解方法不要定义为static
- 方法一定要从另一个类中调用，也就是从类的外部调用，类的内部调用是无效的

Spring 基于AOP 实现了异步，因此，需要获取到容器中的代理对象才能具有异步功能。假定原对象叫obj，容器中的代理对象叫做 objproxy，在执行 fun() 会同时执行aop带来的其他方法。但是如果在fun() 中调用了 fun2()，那 fun2() 是原始的方法，而不是经过aop代理后的方法，就不会具有异步的功能。

### 方式二：直接注入 ThreadPoolTaskExecutor

2.1版本以后我们有TaskExecutionAutoConfiguration自动配置类，它会去配置默认的线程池，此时注入的ThreadPoolTaskExecutor就是默认的线程池。

```java
@RestController
public class TestController {

	@Resource
	ThreadPoolTaskExecutor taskExecutor; //SpringBoot2.1之前直接注入会报错
	
	@SneakyThrows
	@RequestMapping("/testSync")
	public void testTomcatThreadPool() {
		ThreadPoolExecutor threadPoolExecutor = taskExecutor.getThreadPoolExecutor();
	}

}
```

通过debug可以看到默认的线程池参数如下，就是我们上面介绍的

![](https://img-blog.csdnimg.cn/img_convert/d45d7272e28b2e3e79a414a1ea2c8d05.png)

## 3 2.1版本前

### 方式一：通过@Async–采用SimpleAsyncTaskExecutor

最主要的就是此时我们没有TaskExecutionAutoConfiguration自动配置类，也就不会去配置默认的线程池，根据上面分析的determineAsyncExecutor方法，此时@Async会去采用默认的SimpleAsyncTaskExecutor。

```java
@Service
public class SyncService {

	@Async
	public void testAsync1() {
		System.out.println(Thread.currentThread().getName());
		ThreadUtil.sleep(10, TimeUnit.DAYS);
	}
	
	@Async
	public void testAsync2() {
		System.out.println(Thread.currentThread().getName());
		ThreadUtil.sleep(10, TimeUnit.DAYS);
	}

}
```


注意需要再启动类上需要添加@EnableAsync注解，否则不会生效。

```java
@RestController
public class TestController {

	@Autowired
	SyncService syncService;
	
	@SneakyThrows
	@RequestMapping("/testSync")
	public void testTomcatThreadPool() {
		syncService.testAsync1();
		syncService.testAsync2();
	}

}
```

验证输出结果，确实是采用了SimpleAsyncTaskExecutor线程池：

```
SimpleAsyncTaskExecutor-1
SimpleAsyncTaskExecutor-2
```

### 方式二：直接注入 ThreadPoolTaskExecutor

最主要的就是此时我们没有TaskExecutionAutoConfiguration自动配置类，也就不会去配置默认的线程池，此时直接注入就会报错，所以需要自己定义！

#### 直接注入报错

```java
@RestController
public class TestController {

	@Resource
	ThreadPoolTaskExecutor taskExecutor; //SpringBoot2.1之前直接注入会报错
	
	@SneakyThrows
	@RequestMapping("/testSync")
	public void testTomcatThreadPool() {
		ThreadPoolExecutor threadPoolExecutor = taskExecutor.getThreadPoolExecutor();
	}

}
```

此时发现在工程启动的时候就报错！

![](https://img-blog.csdnimg.cn/img_convert/1dcf22b9ab414adffb7a1195c691912a.png)

### 解决：自定义一个线程池

```java
@Configuration
public class ThreadPoolConfiguration {

    @Bean("taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
        //设置线程池参数信息
        taskExecutor.setCorePoolSize(10);
        taskExecutor.setMaxPoolSize(50);
        taskExecutor.setQueueCapacity(200);
        taskExecutor.setKeepAliveSeconds(60);
        taskExecutor.setThreadNamePrefix("myExecutor--");
        taskExecutor.setWaitForTasksToCompleteOnShutdown(true);
        taskExecutor.setAwaitTerminationSeconds(60);
        //修改拒绝策略为使用当前线程执行
        taskExecutor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        //初始化线程池
        taskExecutor.initialize();
        return taskExecutor;
    }

}
```

此时运行debug，可以看到不会启动报错，对应的线程池参数也是我们自定义的了。

注意当我们上面自定义了线程池疑惑，@Sync对应的线程池也是我们自定义的这个，不会再采用默认的SimpleAsyncTaskExecutor。

![](https://img-blog.csdnimg.cn/img_convert/ec91c013e8ebd97896beaf0645abf5f6.png)

## 4 默认线程池好吗？

TaskExecutionAutoConfiguration？
默认参数如下：

- 核心线程数 (corePoolSize): 8
- 最大线程数 (maxPoolSize): Integer.MAX_VALUE (无限制)
- 队列容量 (queueCapacity): Integer.MAX_VALUE (无限制)
- 空闲线程保留时间 (keepAliveSeconds): 60秒
- 线程池拒绝策略 (RejectedExecutionHandler): AbortPolicy（默认策略，超出线程池容量和队列容量时抛出RejectedExecutionException异常）

有啥问题？

- 资源耗尽风险：由于最大线程数设置为Integer.MAX_VALUE，在高并发场景下，如果任务持续涌入，理论上可以创建无数线程，这将迅速消耗系统资源（如内存、CPU），可能导致服务器崩溃或极端性能下降。实际上，即使操作系统允许创建如此多的线程，这种设置也是极度不可取的
- 响应性降低：虽然核心线程数设置为8是比较合理的起始点，但无限制的最大线程数意味着在高负载下，线程创建不会受限，这可能会影响到系统的响应时间和整体稳定性。过多的线程上下文切换会消耗大量CPU资源，降低处理效率
- 队列无限增长：队列容量也设置为Integer.MAX_VALUE，这意味着当线程池中的线程都在忙碌且有新任务到来时，这些任务将不断堆积在队列中。如果生产速率持续高于消费速率，队列将无限增长，最终可能导致OutOfMemoryError
- 异常处理策略过于简单粗暴：采用AbortPolicy作为拒绝策略，在线程池和队列都满载的情况下，新的任务提交将直接抛出RejectedExecutionException异常，而没有进行任何备份处理或降级策略，这可能会导致部分业务操作失败，且未被捕获处理的异常可能会影响到整个应用的稳定性
- 缺乏灵活性和控制：对于不同的业务需求，线程池参数应当根据具体情况进行调整。例如，对响应时间敏感的服务可能需要更小的队列和更快的拒绝策略以避免任务长时间等待；而对于可延迟处理的任务，则可能需要更大的队列或不同的拒绝策略

### SimpleAsyncTaskExecutor

SimpleAsyncTaskExecutor 是Spring框架提供的一个简单的异步任务执行器，它并不是一个真正的线程池实现。它的主要特点是每次调用 #execute(Runnable) 方法时都会创建一个新的线程来执行任务。这意味着它不会重用线程，而是一次性的。

#### 问题

线程资源浪费： 每次执行任务时都创建新线程，这会导致线程的生命周期短暂，频繁地创建和销毁线程会消耗系统资源，包括CPU时间和内存。
系统资源耗尽： 在高并发场景下，如果大量任务同时提交，SimpleAsyncTaskExecutor 可能会创建大量线程，这可能会迅速耗尽系统资源，如线程数限制和内存资源。
缺乏线程管理： 真正的线程池通常包含线程管理机制，如线程重用、线程池大小控制、任务队列管理等。SimpleAsyncTaskExecutor 缺乏这些特性，因此在面对大量并发任务时可能无法有效地管理资源。
没有任务队列： 由于 SimpleAsyncTaskExecutor 不使用任务队列，它无法有效地缓冲任务。当任务提交速度超过执行速度时，新提交的任务可能会因为没有可用的线程而立即失败。
不适合长期运行的服务： 对于需要长期运行的服务，使用 SimpleAsyncTaskExecutor 可能会导致系统不稳定，因为它没有为长期运行的任务提供稳定的线程资源。

总结： SimpleAsyncTaskExecutor可简单地用于异步任务执行，但由于设计限制，不推荐生产环境使用，特别在要求高并发或资源使用高效的场景。