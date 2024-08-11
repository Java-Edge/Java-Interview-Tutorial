# 05-流式操作：如何使用 Flux 和 Mono 高效构建响应式数据流？

## 1 通过 Flux 对象创建响应式流

- 基于各种工厂模式的静态创建方法
- 编程的方式动态创建 Flux

静态方法在使用上相对简单，但不如动态方法灵活。

## 2 静态方法创建 Flux

just()、range()、interval() 及各种 from- 前缀的方法组。

因为 Flux 可代表 0 个数据，所以也有一些专门用于创建空序列的工具方法。

### 2.1 just()

just()可指定序列中包含的全部元素，创建出来的 Flux 序列在发布这些元素之后会自动结束。一般情况下，在已知元素数量和内容时，使用 just() 方法是创建 Flux 的最简单直接的做法。

示例：

```java
Flux.just("Hello", "World")
  .subscribe(System.out::println);
```

```
Hello
World
```

### fromXXX() 方法组

如已有一个数组、一个 Iterable 对象或 Stream 对象，就可通过 fromXXX() 方法组来从这些对象中自动创建 Flux，包括 fromArray()、fromIterable() 和 fromStream() 方法。

示例：

```java
Flux.fromArray(new Integer[] {1, 2, 3})
	.subscribe(System.out::println);
```

执行结果

```
1
2
3
```

### range()

如果你快速生成一个整数数据流，那么可以采用 range() 方法，该方法允许我们指定目标整数数据流的起始元素以及所包含的个数，序列中的所有对象类型都是 Integer，这在创建连续的年份信息或序号信息等场景下非常有用。使用 range() 方法创建 Flux 对象的示例代码如下所示。

```
Flux.range(2020, 5).subscribe(System.out::println);
```

显然，这段代码会在控制台中打印出 5 行记录，从 2020 开始，到 2024 结束。

### interval()

在 Reactor 框架中，interval() 方法可以用来生成从 0 开始递增的 Long 对象的数据序列。通过 interval() 所具备的一组重载方法，我们可以分别指定这个数据序列中第一个元素发布之前的延迟时间，以及每个元素之间的时间间隔。interval() 方法相对复杂，我们先附上它的弹珠图，如下所示。

![](https://img-blog.csdnimg.cn/d727d53dfbdc4777a540848dd3314a73.png)

使用 interval() 方法创建 Flux 示意图（来自 Reactor 官网）

可以看到，上图中每个元素发布时相当于添加了一个定时器的效果。使用 interval() 方法的示例代码如下所示。

```java
Flux.interval(Duration.ofSeconds(2), Duration.ofMillis(200)).subscribe(System.out::println);
```

这段代码的执行效果相当于在等待 2 秒钟之后，生成一个从 0 开始逐一递增的无界数据序列，每 200 毫秒推送一次数据。

### empty()、error() 和 never()

根据上一讲介绍的 Reactor 异步序列的语义，我们可以分别使用 empty()、error() 和 never() 这三个方法类创建一些特殊的数据序列。其中，如果你希望创建一个只包含结束消息的空序列，那么可以使用 empty() 方法，使用示例如下所示。显然，这时候控制台应该没有任何的输出结果。

```java
Flux.empty().subscribe(System.out::println);
```

然后，通过 error() 方法可以创建一个只包含错误消息的序列。如果你不希望所创建的序列不发出任何类似的消息通知，也可以使用 never() 方法实现这一目标。当然，这几个方法都比较少用，通常只用于调试和测试。

### 小结

不难看出，静态创建 Flux 的方法简单直接，一般用于生成那些事先已经定义好的数据序列。

而如果：

- 数据序列事先无法确定
- 或生成过程中包含复杂的业务逻辑

就需要用到动态创建方法。

## 3 通过动态方法创建 Flux

动态创建 Flux 所采用的就是以编程的方式创建数据序列，最常用的就是 generate() 方法和 create() 方法。

### generate() 方法

generate() 方法生成 Flux 序列依赖于 Reactor 所提供的 SynchronousSink 组件，定义如下。

```java
public static <T> Flux<T> generate(Consumer<SynchronousSink<T>> generator)
```

用于同步的 Sink 组件，即元素生成过程是同步执行。

next()至多被调用一次。使用 generate() 创建 Flux：

```java
// 动态创建一个 Flux 序列
Flux.generate(sink -> {
    sink.next("javaedge");
    sink.complete();
}).subscribe(System.out::println);
```

这里调用一次next()，并通过complete()结束这数据流。若不调用complete()，就会生成一个所有元素均为“javaedge”的无界数据流。

在序列生成过程引入状态，可用generate()重载：

```java
Flux.generate(() -> 1, (i, sink) -> {
            sink.next(i);
            if (i == 5) {
                sink.complete();
            }
            return ++i;
}).subscribe(System.out::println);
```

引入一个代表中间状态变量 i，然后根据 i 判断是否终止序列。

### create()

类似generate()，但用FluxSink组件：

```java
public static <T> Flux<T> create(Consumer<? super FluxSink<T>> emitter)
```

FluxSink 还定义背压策略，且可在一次调用中产生多个元素。使用 create() 创建 Flux：

```java
Flux.create(sink -> {
            for (int i = 0; i < 5; i++) {
                sink.next("javaedge" + i);
            }
            sink.complete();
}).subscribe(System.out::println);
```

控制台上得到从“javaedge0”到“javaedge4”5个数据。

以上就是通过Flux 对象创建响应式流的方法，还可通过 Mono 对象创建响应式流。

## 4 通过 Mono 对象创建响应式流

可认为它是 Flux 的一种特例，所以很多创建 Flux 的方法同样适用。针对静态创建 Mono 的场景，前面给出的 just()、empty()、error() 和 never() 等方法同样适用。除了这些方法之外，比较常用的还有 justOrEmpty() 等方法。

justOrEmpty() 方法会先判断所传入的对象中是否包含值，只有在传入对象不为空时，Mono 序列才生成对应的元素，该方法示例代码如下。

```java
Mono.justOrEmpty(Optional.of("javaedge"))
	.subscribe(System.out::println);
```

如想动态创建 Mono，我们同样也可以通过 create() 方法并使用 MonoSink 组件，示例代码如下。

```java
Mono.create(sink ->
sink.success("javaedge")).subscribe(System.out::println);
```

## 5 订阅响应式流

可通过 subscribe() 添加相应的订阅逻辑。调用 subscribe() 方法时可指定需要处理的消息通知类型。

Flux 和 Mono 提供了一批非常有用的 subscribe() 方法重载方法，大大简化订阅的开发例程。这些重载方法包括：

```java
//订阅流的最简单方法，忽略所有消息通知
subscribe();
 
//对每个来自 onNext 通知的值调用 dataConsumer，但不处理 onError 和 onComplete 通知
subscribe(Consumer<T> dataConsumer);
 
//在前一个重载方法的基础上添加对 onError 通知的处理
subscribe(Consumer<T> dataConsumer, Consumer<Throwable> errorConsumer);
 
//在前一个重载方法的基础上添加对 onComplete 通知的处理
subscribe(Consumer<T> dataConsumer, Consumer<Throwable> errorConsumer,
Runnable completeConsumer);
 
//这种重载方法允许通过请求足够数量的数据来控制订阅过程
subscribe(Consumer<T> dataConsumer, Consumer<Throwable> errorConsumer,
Runnable completeConsumer, Consumer<Subscription> subscriptionConsumer);
 
//订阅序列的最通用方式，可以为我们的 Subscriber 实现提供所需的任意行为
subscribe(Subscriber<T> subscriber);
```

在“Spring 为什么选择 Reactor 作为响应式编程框架”提到 Reactor 中的消息通知类型有三种，即:

- 正常消息
- 错误消息
- 完成消息

通过上述 subscribe() 重载方法，可以:

- 只处理其中包含的正常消息
- 也可同时处理错误消息和完成消息

如下代码示例展示同时处理正常和错误消息的实现方法。

```java
Mono.just(“javaedge”)
         .concatWith(Mono.error(new IllegalStateException()))
         .subscribe(System.out::println, System.err::println);
```

以上代码的执行结果如下所示，我们得到了一个“javaedge”，同时也获取了 IllegalStateException。

```java
javaedge 
java.lang.IllegalStateException
```

有时候我们不想直接抛出异常，而是希望采用一种

## 容错策略

### 返回一个默认值

就可以采用如下方式。

```java
Mono.just(“javaedge”)
          .concatWith(Mono.error(new IllegalStateException()))
          .onErrorReturn(“default”)
          .subscribe(System.out::println);
```

以上代码的执行结果如下所示，当产生异常时我们使用 onErrorReturn() 方法返回一个默认值“default”。

```
javaedge 
default
```

### 另外一种容错策略

通过 switchOnError() 方法使用另外的流来产生元素，以下代码演示了这种策略，执行结果与上面的示例一致。

```
Mono.just(“javaedge”)
         .concatWith(Mono.error(new IllegalStateException()))
         .switchOnError(Mono.just(“default”))
         .subscribe(System.out::println);
```



我们可以充分利用 Lambda 表达式来使用 subscribe() 方法，例如下面这段代码。

```
Flux.just("javaedge1", "javaedge2", "javaedge3").subscribe(data -> System.out.println("onNext:" + data), err -> {
        }, () -> System.out.println("onComplete"));
```



这段代码的执行效果如下所示，可以看到，我们分别对 onNext 通知和 onComplete 通知进行了处理。

```
onNext:javaedge1
onNext:javaedge2
onNext:javaedge3
onComplete
```

## 总结

本文介绍了如何创建 Flux 和 Mono 对象，以及如何订阅响应式流的系统方法。想要创建响应式流，可以利用 Reactor 框架所提供的各种工厂方法来达到静态创建的效果，同时也可以使用更加灵活的编程式方式来实现动态创建。而针对订阅过程，Reactor 框架也提供了一组面向不同场景的 subscribe 方法。

## FAQ

在 Reactor 中，通过编程的方式动态创建 Flux 和 Mono 有哪些方法？

一旦我们创建了 Flux 和 Mono 对象，就可以使用操作符来操作这些对象从而实现复杂的数据流处理。下文引入 Reactor 框架所提供的各种操作符。