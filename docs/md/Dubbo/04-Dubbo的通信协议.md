# 04-Dubbo的通信协议

## Dubbo 支持的通信协议

Dubbo 框架提供了自定义的高性能 RPC 通信协议：

- 基于 TCP 的 **Dubbo2 协议**

- 基于 HTTP/2 的 **Triple 协议**

Dubbo 框架是不和任何通信协议绑定的，对通信协议的支持非常灵活，支持任意的第三方协议，如：gRPC、Thrift、REST、JsonRPC、Hessian2



### 通信协议是什么？网络通信框架？

`通信协议` 就是对通信传输的数据进行定义，表示每一位的含义是什么

这里再说一下 Dubbo 中使用的网络通信框架有以下三个：Netty、Mina、Grizzly

### HTTP/1.x 通信协议的缺点

我们知道，Dubbo 中的 RPC 通信是比较快的，因为 Dubbo 就是为了追求极致的 RPC 通信性能，在 Dubbo2 版本中有 Dubbo 协议，在 Dubbo3 版本推出了新的 Tripple 协议

- **为什么 Dubbo 不选择 HTTP/1.x 协议呢？**

HTTP/1.x 的优点就是它的 `通用性` ，基本上所有的应用都可以接收 HTTP/1.x 请求并进行解析，但是缺点也很显然 `速度慢` ，HTTP/1.x 协议速度慢主要是由两个方面：

- 第一方面：传输的无用数据很多，降低了数据传输效率

- 第二方面：Http/1.x 中，在一条 Socket 连接中，一次只能发送一个 HTTP 请求，然后必须等收到了响应之后，再发送下一个 HTTP 请求

  如果不太理解的话，可以想象一下我们在 Java 中通过 HttpClient 发送 HTTP 请求的过程，是不是必须要 `httpclient.get('请求url')` 发起请求，请求之后必须要拿到该 httpclient 的响应进行解析，而不可以连续发送两个请求如下：

  httpclient.get('请求1');

  httpclient.get('请求2');

因此呢，针对以上的缺点，Dubbo 就推出了自己的通信协议



### Dubbo 协议

Dubbo2.x 中默认采用 Dubbo 协议，Dubbo 协议是采用 `单一长连接` 和 `NIO 异步通讯` ，因此适合 `小数据量高并发` 的服务调用，不适合传送大数据量的服务（如视频）

Dubbo 协议是 `基于 TCP` 传输层协议的 RPC 通信协议，目的就是为了简化 RPC 调用的复杂性，提高通信效率

- **Dubo 协议针对 HTTP/1.x 协议的优化** 

Dubbo 协议针对于 HTTP/1.x 协议的缺点，做出了优化，在 Dubbo 协议中尽量避免了传输无用的字节，并且还可以基于一个 Socket 连接同时发送多个 Dubbo 请求



- **Dubbo 协议的组成如下** 

![dubbo_protocol_header](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/dubbo_protocol_header.png)

如上就是 Dubbo 协议的定义

- 前 16 bit 是 Magic，也就是魔数，标识这是 Dubbo2 协议，以及版本号，Magic 一般都是固定的：0xdabb

接下来每个 bit 或者多个 bit 组合起来有不同的含义，这里就不赘述了

通信协议就是对拿到的一系列 bit 数据进行语义解析，拿到远程服务想要传输过来的数据，了解通信协议到底是用来做什么的就可以了！



- **为什么 Dubbo 协议采用异步单一长连接？**

因为现在的服务通常情况下是 `服务提供者比较少，服务消费者比较多` 

通过单一长连接可以减少连接握手验证等操作，避免服务消费者过多时，直接将提供者给压垮

并且使用异步 IO、复用线程池，避免 C10K 问题（C10K 问题就是如何让服务器可以同时处理 10K 并发的 TCP 连接）

不过现在由于硬件水平的提升，C10K 基本上不是问题了，而逐渐演变成了 C100K 的问题



- **为什么 Dubbo 协议不建议传大数据包？**

因为 Dubbo 协议采用单一长连接，如果每次请求的数据包大小为 500KB，假设网络为千兆网卡（1000Mb=128MB），根据测试经验发现每条连接最多只能压满 7MB，因此，理论上一个服务提供者需要 20 个服务消费者才能压满网卡

**如果每次传输的数据包较大** ，假设为 500KB，那么单个消费者的最大 TPS（每秒事务处理数）为：128MB / 500KB = 262

单个消费调用者处理单个提供者的最大 TPS 为 7MB / 500KB = 14，也就是说每秒只可以调用 14 次提供者，次数较少

如果可以接受的话，可以考虑使用 Dubbo 协议传输大的数据包，否则， `网络带宽` 将成为服务调用的性能瓶颈！

![](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240221122122874.png)

- **Dubbo 协议所存在的缺点**

Dubbo 协议目前所存在的缺点就是 `通用性不足` ，如果其他应用想要调用 Dubbo 服务，就必须按照 Dubbo 协议的格式去发送请求，因此 Dubbo 协议在通用性上不如 HTTP 协议



### Tripple 协议

因此 Dubbo 框架为了提升协议的通用性，可以和 SpringCloud 以及其他语言应用进行通信，在 Dubbo3.x 版本推出了基于 HTTP/2 的 Triple 协议，也就是说 Tripple 协议在发送数据时会根据 HTTP/2 协议的格式来发送！

HTTP/2 兼容 HTTP/1，并且性能更好，在 `兼容性` 和 `性能` 上都有所提升！

**Tripple 协议是 Dubbo3 推出的主力协议，Tripple 的含义就是三，表示是第三代，Tripple 协议的特点:**  

1、Tripple 协议是 Dubbo3 设计的基于 HTTP2 的 RPC 通信协议规范， `通用性` 能有所提升，并且由于是基于 HTTP/2 的，因此 `性能` 上也要比 HTTP/1.x 要好一些

2、Tripple 协议支持 `流式调用`

由于 Tripple 协议是基于 HTTP/2 的，因此这里对 HTTP/2 协议再介绍一下

- **介绍一下 HTTP/2 协议**

HTTP/2 协议是对 HTTP/1 协议的升级，HTTP/1 的缺点就是任何一个普通的 HTTP 请求，就算只发送很短的一个字符串，也要带上一个请求头，并且这个请求头比较大，占用多个字节，**导致数据传输效率不高！** 

HTTP/1 协议的请求格式如下：

![image-20240221162128239](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240221162128239.png)

可以看到下边红色部分的实体也就是我们需要传输的数据

而上边都是请求头中的一些数据，像一些空格、换行符都是没有必要存在的字符，因此在 HTTP/2 中做了优化

**HTTP/2 中所做的优化：**

1、HTTP/2 中 `将请求和响应数据分割为更小的帧`

2、并且 `引入 HPACK 算法对标头压缩` ，减小标头大小

3、并且 `支持 Stream` ：

![image-20240221172508947](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/image-20240221172508947.png)

1、帧长度：总共 24 bit，表示的最大数字为 2^24bit = 16M，所以一个帧最大为：9B（头部） + 16M（内容）

2、帧类型，8bit，分为数据帧和控制帧

​	2.1、数据帧分为：HEADERS 帧和 DATA 帧，用来传输请求头、请求体

​	2.2、控制帧分为：SETTINGS、PING、PRIORITY，用来进行管理

3、标志位，8bit，可以用来表示当前帧是请求的最后一帧，方便服务端解析

4、流标识符，32bit，表示 Stream ID，最高位保留不用

5、实际传输的数据，如果帧类型是 HEADERS，则这里存储的就是请求头，如果帧类型是 DATA，则这里存储的就是请求体



- **HTTP/2 中的 Stream 流**

HTTP/2 除了使用 HPACK 来压缩请求头的大小，他还支持 Stream，通过 Stream 可以极大程度上提升 HTTP/2 的并发度

在 HTTP/1 中，在一个 TCP 连接上，只能先发送一个请求，之后必须等这个请求相应之后，才可以发送第二个请求，这样速度太慢了

因此，在 HTTP/2 中，可以在一个 TCP 连接上维护多个 Stream，这样就可以并发的给服务端发送多个帧了

比如说，客户端要给服务端发送 3 个请求，如果只建立一个 Stream，那么每次只能发送 1 个请求，之后等拿到了响应结果之后，再发送第 2 个请求

如果建立了三个 Stream，客户端就可以使用三个线程，同时将 3 个请求通过这三个 Stream 发送给服务端去

- **在 HTTP/2 中客户端发送请求的流程为：**

1、新建 TCP 连接

2、新建一个 Stream：生成一个新的 StreamID，生成一个控制帧，帧里记录了生成的 StreamID，通过 TCP 连接发送出去

3、发送请求的请求头：生成要发送请求的 HEADERS 帧，使用 ASCII 编码，HPACK 进行压缩，将压缩后的数据放到帧的 Payload 区域，记录 StreamID，通过 TCP 连接发送出去

4、发送请求的请求体：将要发送请求的请求体中的数据按照指定的压缩算法（请求中指定的压缩算法，比如 gzip）进行压缩，使用压缩后的数据生成生成 DATA 帧，记录 StreamID，通过 TCP 连接发送出去

- **在 HTTP/2 中服务端接收请求的流程为：**

1、服务端从 TCP 连接中不断接受帧

2、当接收到控制帧，表示客户端要和服务端建立一个 Stream，服务端记录下来 StreamID，在 Dubbo3 中会生成一个 ServerStreamObserver 对象

3、当接收到 HEADERS 帧，取出 StreamID，找到对应的 ServerStreamObserver 对象，解压之后得到请求头，将请求头信息存入该 ServerStreamObserver 对象中

4、当接收到 DATA 帧，取出 StreamID，找到对应的 ServerStreamObserver 对象，将请求体解压之后，按照业务逻辑处理请求体

5、处理完之后，将结果生成 HEADERS 帧和 DATA 帧发送给客户端



- **基于 HTTP/2 的数据帧机制，Tripple 协议支持 UNARY、SERVER_STREAM、BI_STREAM 三种模式**

1、**UNARY** ：最普通的，服务端接受完所有请求帧之后，才处理数据

2、**SERVER_STREAM** ：服务端流式调用，服务端接收完所有请求帧之后，才处理数据，但是可以多次发送响应 DATA 帧给客户端

3、**BI_STREAM** ：双端流式调用，客户端可以多次发送 DATA 帧，服务端不断接收 DATA 帧进行处理，并且将处理结果作为响应 DATA 帧多次发送给客户端，客户端收到之后，也会立即进行处理（也就是客户端和服务端都可以不断接收 DATA 帧，进行处理）



- **接下来说一下 Tripple 协议支持的流式调用（就是基于 HTTP/2 的帧实现）**

流式调用是在 Dubbo3.x 版本新增的，如果我们需要使用流式调用的话，需要自己定义对应的方法

首先引入一下需要使用的类 `StreamObserver` 的依赖：

```xml
<dependency>
  <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-common</artifactId>
    <version>3.0.7</version>
</dependency>
```

并且引入一下 Tripple 协议的依赖

```xml
<dependency>
  <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-rpc-tripple</artifactId>
    <version>3.0.7</version>
</dependency>
```



比如说，我们在 UserService 接口中定义了流式调用：

```java
public interface UserService {
    String hello(String name);
    
    // 服务端流式调用
    default void helloServerStream(String name, StreamObserver<String> response) {}
    // 双端流式调用
    default StreamObserver<String> helloStream(StreamObserver<String> response) {return response;}
}
```



**服务端流式调用** 的话，返回值需要为 `void` ，参数中需要有  `StreamObserver<String>` ，

服务端对应接口实现方法为：

```java
// UserServiceImpl implements UserService
@Override
public void sayHelloServerStream(String name, StreamObserver<String> response) {
    response.onNext(name + " hello");
    response.onNext(name + " world");
    response.onCompleted();
}
```

客户端调用者代码为：

```java
userService.helloServerStream("11", new StreamObserver<String>(){
    @Override
    public void onNext(String data) {
        // 服务端返回的数据
    }
    @Override
    public void onError(Throwable throwable) {}
    @Override
    public void onCompleted(String data) {
        // 服务端执行完毕
    }
})
```



**双端流式调用** 的话，返回值和参数都要有 StreamObserver

服务端对应接口实现方法为：

```java
// UserServiceImpl implements UserService
@Override
public StreamObserver<String> sayHelloStream(StreamObserver<String> response) {
    return new StreamObserver<String>() {
        @Override
        public void onNext(String data) {
            // 接收客户端发送的数据
            response.onNext("result:" + data);
        }
        @Override
        public void onError(Throwable throwable) {}
        @Override
        public void onCompleted(String data) {
            // 服务端执行完毕
        }
    }
}
```



客户端调用者代码为：

```java
StreamObserver<String> streamObserver = userService.sayHelloStream(new StreamObserver<String>() {
    @Override
    public void onNext(String data) {
         System.out.println("接收到响应数据："+ data);
    }
    @Override
    public void onError(Throwable throwable) {}
    @Override
    public void onCompleted(String data) {
        // 接收数据完毕
    }
})
// 客户端发送数据
streamObserver.onNext("第一次发送数据");
streamObserver.onNext("第二次发送数据");
streamObserver.onCompleted();

```



- **接下来总结一下 Tripple 协议中的流式调用的优点以及应用场景**

首先，流式调用的优点就是 `客户端可以多次向服务端发送消息，并且服务端也可以多次接收` ，通过 onNext 方法多次发送，比如用户在处理完一部分数据之后，将这一部分数据发送给服务端，之后再去处理下一部分数据，避免了一次发送很多数据的情况

流式调用的应用场景为：接口需要发送大量数据，这些数据通过一个 RPC 请求无法发送完毕，需要分批发送，并且需要保证发送的有序性

