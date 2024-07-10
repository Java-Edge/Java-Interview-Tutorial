# 00-可能是全网最全的SpringBoot启动流程源码分析

```java
@SpringBootApplication(
    scanBasePackages = {"com.javaedge.base"}
)
public class BaseApplication {
    public BaseApplication() {
    }

    public static void main(String[] args) {
        SpringApplication.run(BaseApplication.class, args);
    }
}
```

## 1 启动入口

静态辅助类，可用于运行使用默认配置（即我们添加的一系列注解）的指定源的 SpringApplication 。

- primarySource - 要载入的主要源，即指定源，这里为传入的`Application.class`
  Class<?> ：泛型决定了任何类都可以传入

- args - 应用程序参数（通常从main方法传递）

- 返回：正在运行的ApplicationContext


```java
public static ConfigurableApplicationContext run(Class<?> primarySource, String... args) {
  return run(new Class<?>[] { primarySource }, args);
}
```

```java
public static ConfigurableApplicationContext run(Class<?>[] primarySources, String[] args) {
  return new SpringApplication(primarySources).run(args);
}
```

构造一个SpringApplication的实例，然后再调用这里实例的run方法就表示启动SpringBoot。因此，想要分析SpringBoot的启动过程，要熟悉：

- SpringApplication的构造过程
- SpringApplication的run方法执行过程

## 2 SpringApplication的构造过程

创建新 SpringApplication 实例。应用程序上下文将从指定的主要源加载 bean。实例可以在调用 run(String...)之前自定义。

```java
	public SpringApplication(Class<?>... primarySources) {
		this(null, primarySources);
	}
```

```java
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public SpringApplication(ResourceLoader resourceLoader, Class<?>... primarySources) {
		this.resourceLoader = resourceLoader;
		Assert.notNull(primarySources, "PrimarySources must not be null");
		this.primarySources = new LinkedHashSet<>(Arrays.asList(primarySources));
    
    // 判断是否是web程序：
    // jakarta.servlet.Servlet
    // org.springframework.web.context.ConfigurableWebApplicationContext
    // 须都在类加载器中存在，并设置到webEnvironment属性
		this.webApplicationType = WebApplicationType.deduceFromClasspath();

    // 从 META-INF/spring.factories 中找K=ApplicationContextInitializer的类并实例化后
    // 设置到SpringApplication的initializers属性。即找出所有的应用程序初始化器
		this.bootstrapRegistryInitializers = new ArrayList<>(
				getSpringFactoriesInstances(BootstrapRegistryInitializer.class));
    
		setInitializers((Collection) getSpringFactoriesInstances(ApplicationContextInitializer.class));

    // 从spring.factories文件中找出K=ApplicationListener的类并实例化后
    // 设置到SpringApplication的listeners属性。即找出所有的应用程序事件监听器
		setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class));
    // 找出main类，这里是 BaseApplication 类
		this.mainApplicationClass = deduceMainApplicationClass();
	}
```

### ApplicationContextInitializer

![](https://img-blog.csdnimg.cn/ac1d341696574bddac20a5c4e11bb399.png)

应用程序初始化器，做一些初始化的工作。

用于在刷新之前初始化 Spring ConfigurableApplicationContext 的回调接口。
通常用于需要对应用程序上下文进行某种编程初始化的 Web 应用程序中。如针对上下文的环境注册属性源或激活配置文件。

ApplicationContextInitializer 鼓励处理器检测 Spring 的 Ordered 接口是否已实现或 @Order 注解是否存在，并在调用之前对实例进行相应的排序（如果有）

```java
@FunctionalInterface
public interface ApplicationContextInitializer<C extends ConfigurableApplicationContext> {

	/**
	 * Initialize the given application context.
	 * @param applicationContext the application to configure
	 */
	void initialize(C applicationContext);

}
```

### ApplicationListener

![](https://img-blog.csdnimg.cn/99369dedaffb4cca8ef175134d025ad0.png)

ApplicationEvent监听器：

```java
@FunctionalInterface
public interface ApplicationListener<E extends ApplicationEvent> extends EventListener {

	void onApplicationEvent(E event);

	static <T> ApplicationListener<PayloadApplicationEvent<T>> forPayload(Consumer<T> consumer) {
		return event -> consumer.accept(event.getPayload());
	}

}
```

### SpringApplicationEvent



![](https://img-blog.csdnimg.cn/ac71f194695e41869b2ece3c1dcb99db.png)

应用程序的：

- 启动事件，ApplicationStartingEvent。一旦一个 SpringApplication 开始，事件就会尽早发布 - 在 or ApplicationContext 可用之前Environment，但在注册之后ApplicationListener。事件的来源是本身SpringApplication，但要注意不要在这个早期阶段过多地使用其内部状态，因为它可能会在生命周期的后期被修改

- 失败事件，ApplicationFailedEvent
- 准备事件，ApplicationPreparedEvent 事件发布为 当一个SpringApplication正在启动并且ApplicationContext已完全准备好但未refresh。将加载 Bean 定义，并在此阶段可以使用
- ApplicationEnvironmentPreparedEvent
- ContextClosedEvent

应用程序事件监听器跟监听事件是绑定的，如：

- ConfigServerBootstrapApplicationListener只跟ApplicationEnvironmentPreparedEvent事件绑定
- LiquibaseServiceLocatorApplicationListener只跟ApplicationStartingEvent事件绑定
- LoggingApplicationListener跟所有事件绑定

## 3 SpringApplication的执行

先看一些事件和监听器概念：

- SpringApplicationRunListeners类
- SpringApplicationRunListener类

### 3.1 SpringApplicationRunListeners

用于监听SpringApplication的run方法的执行。用于SpringApplicationRunListener监听器的批量执行。

finish：run方法结束之前调用；对应事件的类型是ApplicationReadyEvent或ApplicationFailedEvent

```java
class SpringApplicationRunListeners {

  // Log日志类
	private final Log log;

  // 持有SpringApplicationRunListener集合
	private final List<SpringApplicationRunListener> listeners;

	private final ApplicationStartup applicationStartup;

  // run方法执行时立马执行；对应事件类型ApplicationStartingEvent
	void starting(ConfigurableBootstrapContext bootstrapContext, Class<?> mainApplicationClass) {
		doWithListeners("spring.boot.application.starting", (listener) -> listener.starting(bootstrapContext),
				(step) -> {
					if (mainApplicationClass != null) {
						step.tag("mainApplicationClass", mainApplicationClass.getName());
					}
				});
	}

  // ApplicationContext创建之前并且环境信息准备好的时候调用；对应事件类型ApplicationEnvironmentPreparedEvent
	void environmentPrepared(ConfigurableBootstrapContext bootstrapContext, ConfigurableEnvironment environment) {
		doWithListeners("spring.boot.application.environment-prepared",
				(listener) -> listener.environmentPrepared(bootstrapContext, environment));
	}

  // ApplicationContext创建好并且在source加载之前调用一次；没有具体的对应事件
	void contextPrepared(ConfigurableApplicationContext context) {
		doWithListeners("spring.boot.application.context-prepared", (listener) -> listener.contextPrepared(context));
	}

  // ApplicationContext创建并加载之后，并在refresh之前调用
  // 对应事件类型ApplicationPreparedEvent
	void contextLoaded(ConfigurableApplicationContext context) {
		doWithListeners("spring.boot.application.context-loaded", (listener) -> listener.contextLoaded(context));
	}


	void started(ConfigurableApplicationContext context, Duration timeTaken) {
		doWithListeners("spring.boot.application.started", (listener) -> listener.started(context, timeTaken));
	}

	void ready(ConfigurableApplicationContext context, Duration timeTaken) {
		doWithListeners("spring.boot.application.ready", (listener) -> listener.ready(context, timeTaken));
	}

	void failed(ConfigurableApplicationContext context, Throwable exception) {
		doWithListeners("spring.boot.application.failed",
				(listener) -> callFailedListener(listener, context, exception), (step) -> {
					step.tag("exception", exception.getClass().toString());
					step.tag("message", exception.getMessage());
				});
	}

	private void callFailedListener(SpringApplicationRunListener listener, ConfigurableApplicationContext context,
			Throwable exception) {
		try {
			listener.failed(context, exception);
		}
		catch (Throwable ex) {
			if (exception == null) {
				ReflectionUtils.rethrowRuntimeException(ex);
			}
			if (this.log.isDebugEnabled()) {
				this.log.error("Error handling failed", ex);
			}
			else {
				String message = ex.getMessage();
				message = (message != null) ? message : "no error message";
				this.log.warn("Error handling failed (" + message + ")");
			}
		}
	}

	private void doWithListeners(String stepName, Consumer<SpringApplicationRunListener> listenerAction) {
		doWithListeners(stepName, listenerAction, null);
	}

	private void doWithListeners(String stepName, Consumer<SpringApplicationRunListener> listenerAction,
			Consumer<StartupStep> stepAction) {
		StartupStep step = this.applicationStartup.start(stepName);
		this.listeners.forEach(listenerAction);
		if (stepAction != null) {
			stepAction.accept(step);
		}
		step.end();
	}

}
```

SpringApplicationRunListener目前只有一个实现类EventPublishingRunListener：

![](https://img-blog.csdnimg.cn/43e4070548894969ad216b9f03927de2.png)

```java
/**
 * SpringApplicationRunListener to publish SpringApplicationEvents.
 * Uses an internal ApplicationEventMulticaster for the events that are fired
 * before the context is actually refreshed.
 */
class EventPublishingRunListener implements SpringApplicationRunListener, Ordered {

	private final SpringApplication application;

	private final String[] args;

	private final SimpleApplicationEventMulticaster initialMulticaster;

	@Override
	public void starting(ConfigurableBootstrapContext bootstrapContext) {
		multicastInitialEvent(new ApplicationStartingEvent(bootstrapContext, this.application, this.args));
	}

	@Override
	public void environmentPrepared(ConfigurableBootstrapContext bootstrapContext,
			ConfigurableEnvironment environment) {
		multicastInitialEvent(
				new ApplicationEnvironmentPreparedEvent(bootstrapContext, this.application, this.args, environment));
	}

	@Override
	public void contextPrepared(ConfigurableApplicationContext context) {
		multicastInitialEvent(new ApplicationContextInitializedEvent(this.application, this.args, context));
	}

	@Override
	public void contextLoaded(ConfigurableApplicationContext context) {
		for (ApplicationListener<?> listener : this.application.getListeners()) {
			if (listener instanceof ApplicationContextAware contextAware) {
				contextAware.setApplicationContext(context);
			}
			context.addApplicationListener(listener);
		}
		multicastInitialEvent(new ApplicationPreparedEvent(this.application, this.args, context));
	}

	@Override
	public void started(ConfigurableApplicationContext context, Duration timeTaken) {
		context.publishEvent(new ApplicationStartedEvent(this.application, this.args, context, timeTaken));
		AvailabilityChangeEvent.publish(context, LivenessState.CORRECT);
	}

	@Override
	public void ready(ConfigurableApplicationContext context, Duration timeTaken) {
		context.publishEvent(new ApplicationReadyEvent(this.application, this.args, context, timeTaken));
		AvailabilityChangeEvent.publish(context, ReadinessState.ACCEPTING_TRAFFIC);
	}

	@Override
	public void failed(ConfigurableApplicationContext context, Throwable exception) {
		ApplicationFailedEvent event = new ApplicationFailedEvent(this.application, this.args, context, exception);
		if (context != null && context.isActive()) {
			// Listeners have been registered to the application context so we should
			// use it at this point if we can
			context.publishEvent(event);
		}
		else {
			// An inactive context may not have a multicaster so we use our multicaster to
			// call all the context's listeners instead
			if (context instanceof AbstractApplicationContext abstractApplicationContext) {
				for (ApplicationListener<?> listener : abstractApplicationContext.getApplicationListeners()) {
					this.initialMulticaster.addApplicationListener(listener);
				}
			}
			this.initialMulticaster.setErrorHandler(new LoggingErrorHandler());
			this.initialMulticaster.multicastEvent(event);
		}
	}

  // 广播事件出去
	private void multicastInitialEvent(ApplicationEvent event) {
		refreshApplicationListeners();
		this.initialMulticaster.multicastEvent(event);
	}

	private void refreshApplicationListeners() {
		this.application.getListeners().forEach(this.initialMulticaster::addApplicationListener);
	}

	private static class LoggingErrorHandler implements ErrorHandler {

		private static final Log logger = LogFactory.getLog(EventPublishingRunListener.class);

		@Override
		public void handleError(Throwable throwable) {
			logger.warn("Error calling ApplicationEventListener", throwable);
		}

	}

}

```

它把监听过程封装成SpringApplicationEvent事件，并让内部属性initialMulticaster，ApplicationEventMulticaster接口的实现类SimpleApplicationEventMulticaster广播出去：

![](https://img-blog.csdnimg.cn/592743e862f9497c843910a41d1b777b.png)

广播出去的事件对象会被SpringApplication中的listeners属性进行处理。

![](https://img-blog.csdnimg.cn/f38849b829994ceba4c44c4795ca102f.png)

所以SpringApplicationRunListener和ApplicationListener之间的关系是通过ApplicationEventMulticaster广播出去的SpringApplicationEvent所联系。

[![img](https://raw.githubusercontent.com/fangjian0423/blogimages/master/images/startup2.jpg)](https://raw.githubusercontent.com/fangjian0423/blogimages/master/images/startup2.jpg)



#### 创建所有 Spring 运行监听器并发布应用启动事件

调用` getSpringFactoriesInstances` 获取配置的监听器名称，并实例化所有的类。

`SpringApplicationRunListener `所有监听器配置在 pring.factories ：

![](https://img-blog.csdnimg.cn/1475222f0d7d4739aa70fb2f808c491f.png)



### 3.2 run

```java
	public ConfigurableApplicationContext run(String... args) {
    // 开始执行，记录开始时间
		long startTime = System.nanoTime();
		DefaultBootstrapContext bootstrapContext = createBootstrapContext();
		ConfigurableApplicationContext context = null;
    // 设置系统属性 java.awt.headless 的值，默认为true
		configureHeadlessProperty();
    
    // 获取SpringApplicationRunListeners，内部只有一个EventPublishingRunListener
    // 创建所有 Spring 运行监听器并发布应用启动事件
		SpringApplicationRunListeners listeners = getRunListeners(args);
    
    // 会封装成SpringApplicationEvent事件然后广播出去给SpringApplication中的listeners所监听
    // 这里接受ApplicationStartingEvent事件的listener会执行相应操作
		listeners.starting(bootstrapContext, this.mainApplicationClass);
		try {
      // 初始化默认应用参数类
			ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);
      
      // 根据运行监听器和应用参数来准备 Spring 环境
			ConfigurableEnvironment environment = prepareEnvironment(listeners, bootstrapContext, applicationArguments);
			Banner printedBanner = printBanner(environment);
      
      // 创建Spring容器，即创建应用上下文
			context = createApplicationContext();
			context.setApplicationStartup(this.applicationStartup);
     // 准备应用上下文
			prepareContext(bootstrapContext, context, environment, listeners, applicationArguments, printedBanner);
			refreshContext(context);
      
      // 容器创建完成之后执行额外一些操作
			afterRefresh(context, applicationArguments);
			Duration timeTakenToStartup = Duration.ofNanos(System.nanoTime() - startTime);
			if (this.logStartupInfo) {
				new StartupInfoLogger(this.mainApplicationClass).logStarted(getApplicationLog(), timeTakenToStartup);
			}
      // 广播出ApplicationReadyEvent事件给相应的监听器执行
      // 发布应用上下文启动完成事件
			listeners.started(context, timeTakenToStartup);
			callRunners(context, applicationArguments);
		}
		catch (Throwable ex) {
			if (ex instanceof AbandonedRunException) {
				throw ex;
			}
			handleRunFailure(context, ex, listeners);
			throw new IllegalStateException(ex);
		}
		try {
			if (context.isRunning()) {
				Duration timeTakenToReady = Duration.ofNanos(System.nanoTime() - startTime);
        // 发布应用上下文就绪事件
				listeners.ready(context, timeTakenToReady);
			}
		}
		catch (Throwable ex) {
			if (ex instanceof AbandonedRunException) {
				throw ex;
			}
      // 过程报错的话会执行一些异常操作
      // 然后广播出ApplicationFailedEvent事件给相应的监听器执行
			handleRunFailure(context, ex, null);
			throw new IllegalStateException(ex);
		}
    // 返回Spring容器
		return context;
	}
```

#### 设置系统属性 java.awt.headless 的值

```java
private void configureHeadlessProperty() {
  System.setProperty(SYSTEM_PROPERTY_JAVA_AWT_HEADLESS,
      System.getProperty(SYSTEM_PROPERTY_JAVA_AWT_HEADLESS, Boolean.toString(this.headless)));
}
```

> 对于一个 Java 服务器来说经常要处理一些图形元素，例如地图的创建或者图形和图表等。这些API基本上总是需要运行一个X-server以便能使用AWT（Abstract Window Toolkit，抽象窗口工具集）。然而运行一个不必要的 X-server 并不是一种好的管理方式。有时你甚至不能运行 X-server,因此最好的方案是运行 headless 服务器，来进行简单的图像处理。