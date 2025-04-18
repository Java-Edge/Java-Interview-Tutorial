# 02-实现http请求的异步长轮询

## 1 场景

客户端调用服务端接口，服务端这接口较耗时。为优化服务端性能，服务端收到servlet请求后，释放掉servlet占用的线程资源。

### 1.1 传统servlet

请求处理是同步的，即每个请求占用一个线程，直到请求处理完毕。若处理时间较长，会阻塞线程，导致性能下降。

开启一个异步线程去处理耗时操作，处理完成后，将结果返给客户端。

> 注意：期间，客户端和服务端的http链接并不会断开，客户端依旧苦苦等待响应数据。

## 2 技术选型

可用接口AsyncHandlerInterceptor拦截涉及异步处理的请求。HandlerInterceptorAdapter适配器，适配了AsyncHandlerInterceptor和HandlerInterceptor，推荐用其来实现：

```java
package org.springframework.web.servlet.handler;

/**
 * Abstract adapter class for the {@link AsyncHandlerInterceptor} interface,
 * for simplified implementation of pre-only/post-only interceptors.
 */
public abstract class HandlerInterceptorAdapter implements AsyncHandlerInterceptor {
  
  void afterConcurrentHandlingStarted(HttpServletRequest request,
                                    HttpServletResponse response,
                                    Object handler)
                             throws Exception
```

但 SpringBoot3.x 中已废除，故本文用AsyncHandlerInterceptor。

## 3 实现

### 3.1 实现异步线程池

释放Servlet线程，交由指定的线程池去处理，咋定义指定线程池？

```java
@Configuration
public class InterceptorConfig implements WebMvcConfigurer {
  	
  	public void addInterceptors(InterceptorRegistry registry) {
    	registry.addInterceptor(myAsyncHandlerInterceptor).addPathPatterns("/**");
		}
  	
  
  	@Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        ThreadPoolTaskExecutor threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
        threadPoolTaskExecutor.setCorePoolSize(5);
        threadPoolTaskExecutor.setAllowCoreThreadTimeOut(true);
        threadPoolTaskExecutor.setMaxPoolSize(5);
        threadPoolTaskExecutor.setQueueCapacity(50);
        threadPoolTaskExecutor.setThreadNamePrefix("async-service-");
        threadPoolTaskExecutor.initialize();

        configurer.setTaskExecutor(threadPoolTaskExecutor);
    }
```

### 2.1.2 实现拦截器

```java
public class MyAsyncHandlerInterceptor implements AsyncHandlerInterceptor {

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        log.info("interceptor#preHandle called.");
        return true;
    }

    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {
        log.info("interceptor#postHandle called. ");
    }

    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        log.info("interceptor#afterCompletion called.");
    }

    /**
     * 该方法执行后，会执行Controller方法返回的callable方法
     * 这个方法的目的时，当servlet线程被释放后，执行清除例如ThreadLocal、MDC等资源的操作。
     */
    public void afterConcurrentHandlingStarted(HttpServletRequest request, HttpServletResponse response, Object handler) {
        log.info("interceptor#afterConcurrentHandlingStarted. ");
    }
}
```

### 2.1.3 Controller代码

方法返回的Callable：

```java
public class AsyncController {

    @RequestMapping(value = "/t2")
    public Callable<String> t2() {
        log.info("controller#handler called. Thread: " + Thread.currentThread().getName());

        Callable<String> callable = () -> {
            log.info("controller-callable#async task started. Thread: " + Thread.currentThread().getName());
            Thread.sleep(300);
            log.info("controller-callable#async task finished");
            return "async result";
        };

        log.info("controller#handler finished");
        return callable;
    }
}
```

## 4 流程

### 4.1 流程图

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d51d633137767848ce57ad0bb7f41e93.webp)

执行效果：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/be127598730a3991f0fce351e886881e.webp)

参考：https://www.jianshu.com/p/8601736361df
