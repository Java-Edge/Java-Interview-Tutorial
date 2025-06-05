# 03-Spring 5 响应式编程：构建高性能全栈应用的关键

## 1 引言

Spring支持响应式编程，梳理 Spring 框架中的响应式编程技术栈，并引出贯穿整个教程的案例系统。

## 2 Spring5响应式编程技术栈

17年 Spring 发布 Spring 5，引入很多核心功能，重要的就是全面拥抱了响应式编程的设计思想和实践。Spring5响应式编程模型以 Proiect Reactor 库为基础，而后者实现响应式流规范。

响应式编程并非只针对系统中的某部分组件，而是需要适用于调用链路上的所有组件。只要有一个环节非响应式，这环节就会出现同步阻塞，即全栈式响应式编程。

Spring 5也针对响应式编程，构建了全栈式的开发组件，提供：

- 针对 Web 服务层开发的响应式 Web 框架 WebFlux
- 支持响应式数据访问的 Spring Data Reactive 框架

## 3 Spring WebFlux

WebFlux 框架名称中的 Flux 源 Project Reactor 框架中的 Flux 组件。WebFlux 不仅包含：

- 对创建和访问响应式HTTP 端点的支持
- 还可用来实现SSE、WebSocket

![](https://p.ipic.vip/rtccyj.png)

### 3.1 架构图

webflux架构图：

![](https://docs.spring.io/spring-framework/docs/5.0.0.M5/spring-framework-reference/html/images/webflux-overview.png)

### 3.2 实现原理

传统的 Spring MVC 构建在 Java EE 的Servlet 标准之上，该标准本身就是阻塞和同步的。

最新版Servlet在等待请求过程中，仍在线程池中保持着线程。Spring WebFlux则是构建在响应式流及它的实现框架 Reactor 基础上的一个开发框架，因此能基于 HTTP 协议用来构建异步非阻塞的 Web 服务。

- Spring MVC 是运行在传统的 Servlet 容器之上
- 而 Spring WebFlux 则需要支持异步的运行环境，如Netty、Undertow以及 Servlet 3.1 版本以上的 Tomcat和Jetty

WebFlux 提供异步非阻塞的 I/0 特性，适合开发I/O密集型服务。

不推荐 WebFlux、Spring MVC 混用，因为显然无法保证全栈式响应式流。

## 4 Spring Data Reactive

Spring Data 是 Spring 家族中专门针对数据访问而开发的一个框架，针对各种数据存储媒介抽象了一批 Repository 接口，以简化开发过程。

Spring Boot2架构图：

![](https://p.ipic.vip/2iwtt4.png)

## 5 案例ReactiveSpringCSS

CSS，客户服务系统 Customer Service System，构建一个精简但又完整的系统来展示 Spring 5 中响应式编程相关的设计理念和各项技术组件。

案例系统的目的在于演示技术实现过程，不在于介绍具体业务逻辑所以我们对案例的业务流程做了高度的简化。

ReactiveSpringCSS 中，存在一个 customer-service这是一个 Spring Boot 应用程序，也是整个案例系统中的主体服务。

![](https://p.ipic.vip/dt21ok.png)

### Web 层

使用 Spring WebFlux 组件来分别为系统中的三个服务构建响应式 RESTful 端点，并通过支持响应式请求的 Webclient 客户端组件来消费这些端点。

### Service层

完成事件处理和消息通信相关的业务场景。

- account-service 消息的发布者
- customer-service 消费者

Spring5也针对Spring Cloud Stream做响应式升级并提供对应的响应式编程组件。

### Repository层

引入 MongoDB、Redis 两款支持响应式流的 NOSQL：

- MongoDB为各个服务存储业务数据
- Redis主要用在 customer-service

分别引入 Spring 5中的 Spring Data MongoDB Reactive和 Spring Data Redis Reactive 进行整合。

![](https://p.ipic.vip/jne2k2.png)

## 总结

本教程是一款以案例驱动的响应式应用程序开发的教程。
今天我们就针对Spring5中所提供的响应式编程组件进行了展开，并引出了贯穿整课程体系的ReactiveSpringCSS案例系统。

## FAQ

Spring WebFlux V.S Spring MVC

两种不同 Web 框架：

1. 编程模型：Spring WebFlux 基于响应式编程模型，使用 Reactor 库来处理异步和非阻塞的 I/O 操作，而 Spring MVC 则是基于传统的 Servlet API，使用阻塞式 I/O 操作。

2. 线程模型：Spring WebFlux 使用少量的线程来处理大量的并发请求，通过 Reactor 库提供的事件循环机制来实现非阻塞式 I/O 操作。而 Spring MVC 则是使用线程池来处理请求，并且每个请求都会占用一个线程。

3. 响应式支持：Spring WebFlux 支持响应式编程，可以使用 Mono 和 Flux 类型来处理异步操作和流式数据。而 Spring MVC 则不支持响应式编程。

4. 异常处理：Spring WebFlux异常处理机制不同于Spring MVC，它用函数式编程模型处理异常。WebFlux异常处理器是函数，接收一个 ServerRequest 对象和一个 Throwable 对象，并返回一个`Mono<ServerResponse>`对象。而Spring MVC异常处理器是一个类，需实现HandlerExceptionResolver接口

5. 安全性：由于 Spring WebFlux 使用少量的线程来处理大量的并发请求，因此它可以更好地保护系统免受拒绝服务攻击。而 Spring MVC 则需要使用线程池来处理请求，容易受到拒绝服务攻击的影响。

总之，Spring WebFlux 和 Spring MVC 都是很好的 Web 框架，选择哪个取决于具体的应用场景和需求。如果需要处理大量的并发请求，并希望使用响应式编程模型来实现非阻塞式 I/O 操作，那么可以选择 Spring WebFlux；如果应用程序需要使用传统的 Servlet API，并且不需要响应式支持，那么可以选择 Spring MVC。

参考：

- https://docs.spring.io/spring-framework/docs/5.0.0.M5/spring-framework-reference/html/web-reactive.html