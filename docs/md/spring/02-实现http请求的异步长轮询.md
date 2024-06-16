# 02-实现http请求的异步长轮询

## 1 场景

客户端调用服务端接口，服务端这个接口比较耗时。为了优化服务端的性能。

服务端收到servlet请求后，释放掉servlet占用的线程资源。

> 传统的 servlet 请求处理是同步的，即每个请求占用一个线程，直到请求处理完毕。如果处理时间较长，会阻塞线程，导致性能下降。

开启一个异步线程去处理耗时的操作。当耗时操作处理完成后，将结果返回给客户端。

**注意：在此期间，客户端和服务端的http链接并不会断开，客户端依旧苦苦等待响应数据；**

## 2 技术选型

可用接口AsyncHandlerInterceptor实现拦截涉及异步处理的请求，注意不是HandlerInterceptor。

HandlerInterceptorAdapter适配器，适配了AsyncHandlerInterceptor和HandlerInterceptor，推荐用其来实现：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/2be35325b10b83b9ae159e91d7b4bf17.png)

```java
void afterConcurrentHandlingStarted(HttpServletRequest request,
                                    HttpServletResponse response,
                                    Object handler)
                             throws Exception
```

不过在 springboot3.x 中已废除，故本文使用AsyncHandlerInterceptor。

## 3 实现

### 3.1 实现异步线程池

释放Servlet线程，交由指定的线程池去处理，咋定义指定线程池？

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/8912a45334dbd2cb696da4902e9b9e84.png)

### 2.1.2 实现拦截器



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/99977920f0357862bbb59cb85d3acc6f.png)

### 2.1.3 Controller代码

方法返回的Callable：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240609233534463.png)

## 4 流程

### 4.1 流程图



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d51d633137767848ce57ad0bb7f41e93.webp)

执行效果：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/be127598730a3991f0fce351e886881e.webp)

参考：https://www.jianshu.com/p/8601736361df
