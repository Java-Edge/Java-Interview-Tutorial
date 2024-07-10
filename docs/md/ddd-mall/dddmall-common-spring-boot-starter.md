# dddmall-common-spring-boot-starter



#### 封装spring环境工具类

```java
/**
 * 环境工具类
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public class EnvironmentUtil {
    
    private static List<String> ENVIRONMENT_LIST = new ArrayList<>();
    
    static {
        ENVIRONMENT_LIST.add("dev");
        ENVIRONMENT_LIST.add("test");
    }
    
    /**
     * 判断当前是否为正式环境
     *
     * @return
     */
    public static boolean isProdEnvironment() {
        ConfigurableEnvironment configurableEnvironment = ApplicationContextHolder.getBean(ConfigurableEnvironment.class);
        String propertyActive = configurableEnvironment.getProperty("spring.profiles.active", "dev");
        return ENVIRONMENT_LIST.stream().noneMatch(propertyActive::contains);
    }
}
```

##### 应用：验证码开关



```java
public void checkoutValidCode(String verifyCode) {
    if (EnvironmentUtil.isProdEnvironment()) {
        if (StrUtil.isBlank(verifyCode)) {
            throw new ClientException("验证码已失效");
        }
        verifyCode = StrUtil.trim(verifyCode);
        this.verifyCode = StrUtil.trim(this.verifyCode);
        if (!StrUtil.equals(verifyCode, this.verifyCode)) {
            throw new ClientException("验证码错误");
        }
    }
}
```

#### sleep方法异常统一捕获

```java
/**
 * 线程池工具类
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public final class ThreadUtil {
    
    /**
     * 睡眠当前线程指定时间 {@param millis}
     *
     * @param millis 睡眠时间，单位毫秒
     */
    @SneakyThrows(value = InterruptedException.class)
    public static void sleep(long millis) {
        Thread.sleep(millis);
    }
}
```

@SneakyThrows，Lombok 注解之一，在方法中自动处理 InterruptedException 异常。

Java的Thread.sleep() 方法会抛 InterruptedException，当一个线程在睡眠期间被中断时，即另一个线程调用该线程的 interrupt() 方法时，就抛InterruptedException。

通常，需显式在方法中捕获并处理 InterruptedException。但用 @SneakyThrows 可简化，无需在方法中编写 try-catch 处理异常。

因为 @SneakyThrows(value = InterruptedException.class) 在编译时自动生成捕获和重新抛出 InterruptedException 异常的代码块。

减少代码冗余，提高代码可读性和简洁性。但注意用 @SneakyThrows 时，方法声明须包含对应的异常类型，否则编译器会报错。

#### 动态代理模式：增强线程池拒绝策略

```java
public final class RejectedProxyUtil {
    
    /**
     * 创建拒绝策略代理类
     *
     * @param rejectedExecutionHandler 真正的线程池拒绝策略执行器
     * @param rejectedNum              拒绝策略执行统计器
     * @return 代理拒绝策略
     */
    public static RejectedExecutionHandler createProxy(RejectedExecutionHandler rejectedExecutionHandler, AtomicLong rejectedNum) {
        // 动态代理模式: 增强线程池拒绝策略，比如：拒绝任务报警或加入延迟队列重复放入等逻辑
        return (RejectedExecutionHandler) Proxy
                .newProxyInstance(
                        rejectedExecutionHandler.getClass().getClassLoader(),
                        new Class[]{RejectedExecutionHandler.class},
                        new RejectedProxyInvocationHandler(rejectedExecutionHandler, rejectedNum));
    }
  ...
}
```

创建了一个代理对象，将原始的拒绝执行处理器（RejectedExecutionHandler）替换为增强后的处理器。

createProxy 方法使用 Java 的动态代理机制。调用 Proxy.newProxyInstance 创建一个代理对象实现 RejectedExecutionHandler 接口，并通过一个自定义的代理处理器（RejectedProxyInvocationHandler）处理方法调用。

使用动态代理模式，可在不修改原始拒绝执行处理器代码的情况下，对其功能扩展。如在任务被拒绝时触发报警、将任务加入延迟队列以便稍后再次尝试执行等额外逻辑。灵活地定制拒绝策略，并增强线程池的容错能力和业务逻辑。

#### 快速消费线程池

```java
/**
 * 快速消费线程池
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public class EagerThreadPoolExecutor extends ThreadPoolExecutor {
    
    public EagerThreadPoolExecutor(int corePoolSize,
                                   int maximumPoolSize,
                                   long keepAliveTime,
                                   TimeUnit unit,
                                   TaskQueue<Runnable> workQueue,
                                   ThreadFactory threadFactory,
                                   RejectedExecutionHandler handler) {
        super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, threadFactory, handler);
    }
    
    private final AtomicInteger submittedTaskCount = new AtomicInteger(0);
    
    public int getSubmittedTaskCount() {
        return submittedTaskCount.get();
    }
    
    @Override
    protected void afterExecute(Runnable r, Throwable t) {
        submittedTaskCount.decrementAndGet();
    }
    
    @Override
    public void execute(Runnable command) {
        submittedTaskCount.incrementAndGet();
        try {
            super.execute(command);
        } catch (RejectedExecutionException ex) {
            TaskQueue taskQueue = (TaskQueue) super.getQueue();
            try {
                if (!taskQueue.retryOffer(command, 0, TimeUnit.MILLISECONDS)) {
                    submittedTaskCount.decrementAndGet();
                    throw new RejectedExecutionException("Queue capacity is full.", ex);
                }
            } catch (InterruptedException iex) {
                submittedTaskCount.decrementAndGet();
                throw new RejectedExecutionException(iex);
            }
        } catch (Exception ex) {
            submittedTaskCount.decrementAndGet();
            throw ex;
        }
    }
}
```

```java
/**
 * 快速消费任务队列
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public class TaskQueue<R extends Runnable> extends LinkedBlockingQueue<Runnable> {
    
    @Setter
    private EagerThreadPoolExecutor executor;
    
    public TaskQueue(int capacity) {
        super(capacity);
    }
    
    @Override
    public boolean offer(Runnable runnable) {
        int currentPoolThreadSize = executor.getPoolSize();
        // 如果有核心线程正在空闲，将任务加入阻塞队列，由核心线程进行处理任务
        if (executor.getSubmittedTaskCount() < currentPoolThreadSize) {
            return super.offer(runnable);
        }
        // 当前线程池线程数量小于最大线程数，返回 False，根据线程池源码，会创建非核心线程
        if (currentPoolThreadSize < executor.getMaximumPoolSize()) {
            return false;
        }
        // 如果当前线程池数量大于最大线程数，任务加入阻塞队列
        return super.offer(runnable);
    }
    
    public boolean retryOffer(Runnable o, long timeout, TimeUnit unit) throws InterruptedException {
        if (executor.isShutdown()) {
            throw new RejectedExecutionException("Executor is shutdown!");
        }
        return super.offer(o, timeout, unit);
    }
}
```

可自定义线程池的任务处理策略。先尽可能地将任务分配给空闲的核心线程来处理，以保证快速消费和处理任务。

为啥要优先将任务分配给空闲的核心线程？核心线程是线程池的基础，它们始终存在并且可以立即执行任务，避免了线程创建和销毁的开销。通过利用核心线程处理任务，可以最大限度地利用线程池的资源，提高任务处理的效率。

如果核心线程都已经被占用，那么会进一步判断当前线程池的线程数量是否已达到最大限制。如果还未达到最大限制，则返回 false，让线程池创建一个非核心线程来处理任务。这样可以控制线程池的线程数量，避免无限制地创建线程，从而保护系统资源的稳定性。

如果线程池的线程数量已经达到或超过最大限制，那么新任务将被添加到阻塞队列中等待处理。这样，即使线程池已满，任务也不会被丢弃，而是会在阻塞队列中等待有可用线程来处理。

综上所述，这样的设计可以根据线程池的状态和任务数量，采取不同的策略来处理任务，以实现快速消费和高效利用线程池资源的目标。