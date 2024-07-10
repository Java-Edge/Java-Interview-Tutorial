# dddmall-base-spring-boot-starter

META-INF/spring.factories 自动装配

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=org.opengoofy.congomall.springboot.starter.base.config.ApplicationBaseAutoConfiguration
```

```java
/**
 * 应用基础自动装配
 */
public class ApplicationBaseAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public ApplicationContextHolder congoApplicationContextHolder() {
        return new ApplicationContextHolder();
    }
    
    @Bean
    @ConditionalOnMissingBean
    public ApplicationContentPostProcessor congoApplicationContentPostProcessor() {
        return new ApplicationContentPostProcessor();
    }
    
    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(value = "congomall.fastjson.safa-mode", havingValue = "true")
    public FastJsonSafeMode congoFastJsonSafeMode() {
        return new FastJsonSafeMode();
    }
}
```

#### ApplicationContentPostProcessor



```java
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationListener;

import javax.annotation.Resource;

/**
 * 应用初始化后置处理器，防止Spring事件被多次执行
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public class ApplicationContentPostProcessor implements ApplicationListener<ApplicationReadyEvent> {
    
    @Resource
    private ApplicationContext applicationContext;
    
    /**
     * 执行标识，确保Spring事件 {@link ApplicationReadyEvent} 有且执行一次
     */
    private boolean executeOnlyOnce = true;
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        synchronized (ApplicationContentPostProcessor.class) {
            if (executeOnlyOnce) {
                applicationContext.publishEvent(new ApplicationInitializingEvent(this));
                executeOnlyOnce = false;
            }
        }
    }
}
```

实现 `ApplicationListener<ApplicationReadyEvent>  `接口，表示它是一个监听应用启动事件的监听器。

onApplicationEvent，加synchronized锁保证线程安全。先判断 executeOnlyOnce 是否为 true，是则发布一个 ApplicationInitializingEvent 事件，表示应用正在初始化。然后将 executeOnlyOnce 置 false，确保事件只被执行一次。

作用：应用启动完成后，通过发布 ApplicationInitializingEvent 事件来触发一些初始化操作。通过 executeOnlyOnce 的设置，确保事件只执行一次，避免重复执行。

##### 确保事件只执行一次的场景

应用初始化：某些应用启动后需要进行初始化操作，如加载配置、创建数据库连接等。这些初始化操作只需在应用启动时执行一次。
资源加载：在应用启动时加载一些资源，如读取配置文件、加载字典数据等。这些操作可以通过确保只执行一次来避免资源的重复加载和浪费。
缓存预热：在应用启动时，将某些数据加载到缓存中，以提高后续请求的响应速度。这个操作通常只需要在应用启动时执行一次，避免重复加载和缓存数据不一致的问题。
注册回调函数：有时需要在特定事件发生时触发回调函数，但只需在第一次事件发生时注册回调函数即可。后续的事件发生时，可以通过确保只执行一次来避免重复触发回调。
数据库迁移或升级：在应用升级或迁移时，可能需要执行一些数据库变更操作。通过确保只执行一次，可以避免重复执行数据库变更脚本并保持数据的一致性。
这些场景都需要确保事件只执行一次，避免重复操作和可能出现的问题。通过设置标志位或其他方式，可以在多线程环境下实现事件只执行一次的效果。

#### FastJson安全模式



```java
import org.springframework.beans.factory.InitializingBean;

/**
 * FastJson安全模式，开启后，关闭类型隐式传递
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public class FastJsonSafeMode implements InitializingBean {
    
    @Override
    public void afterPropertiesSet() throws Exception {
        System.setProperty("fastjson2.parser.safeMode", "true");
    }
}
```

#### 方便非spring类获取bean



```java
public class ApplicationContextHolder implements ApplicationContextAware {
    
    private static ApplicationContext CONTEXT;
    
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        ApplicationContextHolder.CONTEXT = applicationContext;
    }
    
    /**
     * Get ioc container bean by type.
     */
    public static <T> T getBean(Class<T> clazz) {
        return CONTEXT.getBean(clazz);
    }
    
    /**
     * Get ioc container bean by name and type.
     */
    public static <T> T getBean(String name, Class<T> clazz) {
        return CONTEXT.getBean(name, clazz);
    }
    
    /**
     * Get a set of ioc container beans by type.
     */
    public static <T> Map<String, T> getBeansOfType(Class<T> clazz) {
        return CONTEXT.getBeansOfType(clazz);
    }
    
    /**
     * Find whether the bean has annotations.
     */
    public static <A extends Annotation> A findAnnotationOnBean(String beanName, Class<A> annotationType) {
        return CONTEXT.findAnnotationOnBean(beanName, annotationType);
    }
    
    /**
     * Get ApplicationContext.
     */
    public static ApplicationContext getInstance() {
        return CONTEXT;
    }
}
```

主要在于提供一种全局访问 `ApplicationContext` 的方式，便于在非 Spring 管理的类中获取 Spring 管理的 Bean。

如某些工具类或者第三方库中无法直接使用 Spring 注入的场景下，这个类很方便从 Spring 容器中获取需要的 Bean 实例。通过静态方法的调用，减少了对 `ApplicationContext` 的直接依赖，使得代码更为简洁和灵活。