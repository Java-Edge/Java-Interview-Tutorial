# JDK21新特性

## 获取资源

在开始之前，请快速为我做一件事。如果你还没有安装[SKDMAN](https://sdkman.io/)，请先去安装。

然后运行以下命令：

```shell
sdk install java 21-graalce && sdk default java 21-graalce
```

这样你就拥有了Java 21和支持Java 21的GraalVM。Java 21在我看来是Java有史以来最重要的版本之一，它为Java用户带来了全新的机会。它引入了许多不错的API和功能，如模式匹配，这些都是多年逐步加入平台的功能的集大成者。但最重要的功能无疑是对虚拟线程（项目Loom）的新支持。虚拟线程和GraalVM本地镜像意味着现在你可以编写出性能和可扩展性堪比C、Rust或Go的代码，同时保留JVM的强大和熟悉的生态系统。

现在是成为JVM开发者的最佳时机。

我刚刚发布了一段视频，探索Java 21和GraalVM的新功能和机会。

<iframe width="560" height="315" src="https://www.youtube.com/embed/8VJ_dSdV3pY?si=D7ecMMusRby85GC4" title="YouTube视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="" style="box-sizing: inherit; margin: 0px; padding: 0px; border: 0px;"></iframe>

在这篇博客中，我希望探讨相同的内容，并附上适合文本的一些额外数据。

## 为什么选择GraalVM而不是普通的Java？

首先，如果从上面的安装步骤还不清楚的话，我建议先安装GraalVM。它是OpenJDK，所以你可以获得所有的OpenJDK功能，但它还可以创建GraalVM本地镜像。

为什么选择GraalVM本地镜像？因为它非常快且资源高效。传统上，这个说法总是会被反驳："是的，但JIT在普通的Java中仍然更快"，对此我会反驳："是的，但你可以更容易地扩大新实例的规模，占用的资源更少，并且在资源消耗方面仍然领先！"这是真的。

但现在我们甚至不需要进行这种细微的讨论了。根据[graalvm发布博客](https://medium.com/graalvm/graalvm-for-jdk-21-is-here-ee01177dd12d)，Oracle的GraalVM本地镜像通过配置导向的优化性能现在在基准测试中始终领先于JIT，Oracle GraalVM与开源的GraalVM发行版不完全相同，但重点是高性能现在超过了JRE JIT。

![1*01_HtHD4jfuXOsgDMhkljQ](https://miro.medium.com/v2/resize:fit:4800/format:webp/1*01_HtHD4jfuXOsgDMhkljQ.png)

这篇来自[10MinuteMail](https://www.digitalsanctuary.com/10minutemail/migrating-10minutemail-from-java-to-graalvm-native.htmlhttps://www.digitalsanctuary.com/10minutemail/migrating-10minutemail-from-java-to-graalvm-native.html)的优秀文章展示了他们如何使用GraalVM和Spring Boot 3将启动时间从约30秒减少到约3毫秒，内存使用量从6.6GB减少到1GB，并保持相同的吞吐量和CPU利用率。惊人。

## Java 17

Java 21中的许多功能都是在Java 17中首次引入的功能的基础上构建的（在某些情况下甚至比这更早）。在探讨它们在Java 21中的最终表现之前，让我们回顾一些这些功能。

### 多行字符串

你知道Java支持多行字符串吗？这是我最喜欢的功能之一，使得使用JSON、JDBC、JPA QL等变得比以往任何时候都更愉快：

```Java
package bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class MultilineStringTest {

    @Test
    void multiline() throws Exception {

        var shakespeare = """

                To be, or not to be, that is the question:
                Whether 'tis nobler in the mind to suffer
                The slings and arrows of outrageous fortune,
                Or to take arms against a sea of troubles
                And by opposing end them. To die—to sleep,
                No more; and by a sleep to say we end
                The heart-ache and the thousand natural shocks
                That flesh is heir to: 'tis a consummation
                Devoutly to be wish'd. To die, to sleep;
                To sleep, perchance to dream—ay, there's the rub:
                For in that sleep of death what dreams may come,
                """;
        Assertions.assertNotEquals(shakespeare.charAt(0), 'T');

        shakespeare = shakespeare.stripLeading();
        Assertions.assertEquals(shakespeare.charAt(0), 'T');
    }

}
```

没有什么太令人惊讶的地方。很容易理解。三重引号开始和结束多行字符串。你也可以去除开头、结尾和缩进的空格。

### 记录类（Records）

记录类是我最喜欢的Java功能之一！它们非常棒！你有没有一个类，其身份等同于类中的字段？当然有。想想你的基本实体、你的事件、你的DTOs等。每当你使用Lombok的`@Data`时，你就可以同样轻松地使用`record`。它们在Kotlin（`data class`）和Scala（`case class`）中都有类似的实现，所以很多人也都知道它们。它们终于在Java中出现了，真是太好了。

```Java
package bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class RecordTest {

    record JdkReleasedEvent(String name) { }

    @Test
    void records() throws Exception {
        var event = new JdkReleasedEvent("Java21");
        Assertions.assertEquals( event.name() , "Java21");
        System.out.println(event);

    }
}
```

这种简洁的语法生成了一个带有构造函数、相关存储、getter（如：`event.name()`）、有效的`equals`和良好的`toString()`实现的类。

### 增强的Switch

我很少使用现有的`switch`语句，因为它很笨重，通常有其他模式，如[*访问者模式*](https://en.wikipedia.org/wiki/Visitor_pattern)，能提供大部分好处。现在有了一个新的`switch`，它是一个*表达式*，而不是语句，所以我可以将`switch`的结果赋值给一个变量或返回它。

下面是一个重新设计的经典`switch`示例，使用了新的增强`switch`：

```Java
package bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;

class EnhancedSwitchTest {

    // ①
    int calculateTimeOffClassic(DayOfWeek dayOfWeek) {
        var timeoff = 0;
        switch (dayOfWeek) {
            case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY:
                timeoff = 16;
                break;
            case SATURDAY, SUNDAY:
                timeoff = 24;
                break;
        }
        return timeoff;
    }

    // ②
    int calculateTimeOff(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> 16;
            case SATURDAY, SUNDAY -> 24;
        };
    }

    @Test
    void timeoff() {
        Assertions.assertEquals(calculateTimeOffClassic(DayOfWeek.SATURDAY), calculateTimeOff (DayOfWeek.SATURDAY));
        Assertions.assertEquals(calculateTimeOff(DayOfWeek.FRIDAY), 16);
        Assertions.assertEquals(calculateTimeOff(DayOfWeek.FRIDAY), 16);
    }
}
```

1. 这是使用较老的、更笨重的`switch`语句的经典实现
2. 这是新的`switch`表达式

### 增强的`instanceof`检查

新的`instanceof`测试让我们可以避免过去的笨重的检查和强制转换，如下所示：

```Java
var animal = (Object) new Dog ();
if (animal instanceof Dog ){
var fido  = (Dog) animal;
fido.bark();
}
```

替换为：

```Java
var animal = (Object) new Dog ();
if

 (animal instanceof Dog fido ){
fido.bark();
}
```

智能`instanceof`自动分配一个下行转换变量，以便在测试范围内使用。没有必要在同一个块中两次指定类`Dog`。智能`instanceof`操作符的使用是Java平台中模式匹配的第一个实际尝试。模式匹配的思想很简单：匹配类型并从这些类型中提取数据。

### 密封类型

技术上来说，密封类型也是Java 17的一部分，但它们目前还没有太大用处。基本思想是，在过去，限制类型扩展性的唯一方法是通过可见性修饰符（`public`、`private`等）。在`sealed`关键字中，你可以明确允许哪些类可以继承另一个类。这是一个巨大的进步，因为它让编译器可以看到哪些类型可能扩展给定类型，这使得它可以进行优化，并在编译时帮助我们理解是否所有可能的情况（如在增强的`switch`表达式中）都已被覆盖。让我们看看它的实际应用。

```Java
package bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class SealedTypesTest {

    // ①
    sealed interface Animal permits Bird, Cat, Dog {
    }

    // ②
    final class Cat implements Animal {
        String meow() {
            return "meow";
        }
    }

    final class Dog implements Animal {
        String bark() {
            return "woof";
        }
    }

    final class Bird implements Animal {
        String chirp() {
            return "chirp";
        }
    }

    @Test
    void doLittleTest() {
        Assertions.assertEquals(communicate(new Dog()), "woof");
        Assertions.assertEquals(communicate(new Cat()), "meow");
    }

    // ③
    String classicCommunicate(Animal animal) {
        var message = (String) null;
        if (animal instanceof Dog dog) {
            message = dog.bark();
        }
        if (animal instanceof Cat cat) {
            message = cat.meow();
        }
        if (animal instanceof Bird bird) {
            message = bird.chirp();
        }
        return message;
    }

    // ④
    String communicate(Animal animal) {
        return switch (animal) {
            case Cat cat -> cat.meow();
            case Dog dog -> dog.bark();
            case Bird bird -> bird.chirp();
        };
    }

}
```

1. 我们有一个显式密封的接口，只允许三种类型。下面的增强`switch`表达式如果我们添加一个新类将会失败。
2. 实现这个密封接口的类必须声明为`sealed`并明确声明允许哪些类作为子类，或者必须声明为`final`。
3. 我们可以使用新的`instanceof`检查来缩短处理每种可能类型的代码，但我们在这里没有得到编译器的帮助。
4. 除非我们使用带有模式匹配的增强`switch`，如这里所示。

注意经典版本有多么笨重。真是太糟糕了。我很高兴能摆脱它。另一个好处是，现在`switch`表达式会告诉我们是否已经覆盖了所有可能的情况，就像使用`enum`一样。谢谢你，编译器！

## 超越Java 17

结合所有这些功能，我们开始舒适地进入Java 21的领域。从这里开始，我们将查看自Java 17以来的新增功能。

### 使用`record`、`switch`和`if`实现的高级模式匹配

增强的`switch`表达式和模式匹配令人惊叹，让我想知道多年前使用Akka时使用Java会是什么感觉。模式匹配在与记录类一起使用时有更好的交互，因为记录类——如前所述——是其组件的摘要，编译器知道这一点。所以，它也可以将这些组件提升为新的变量。你也可以在`if`检查中使用这种模式匹配语法。

```Java
package bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.time.Instant;

class RecordsTest {

    record User(String name, long accountNumber) {
    }

    record UserDeletedEvent(User user) {
    }

    record UserCreatedEvent(String name) {
    }

    record ShutdownEvent(Instant instant) {
    }

    @Test
    void respondToEvents() throws Exception {
        Assertions.assertEquals(
                respond(new UserCreatedEvent("jlong")), "新用户jlong已创建"
        );
        Assertions.assertEquals(
                respond(new UserDeletedEvent(new User("jlong", 1))),
                "用户jlong已删除"
        );
    }

    String respond(Object o) {
        // ①
        if (o instanceof ShutdownEvent(Instant instant)) {
            System.out.println(
                "将在" + instant.toEpochMilli() + "关闭系统");
        }
        return switch (o) {
            // ②
            case UserDeletedEvent(var user) -> "用户" + user.name() + "已删除";
            // ③
            case UserCreatedEvent(var name) -> "新用户" + name + "已创建";
            default -> null;
        };
    }

}
```

1. 我们有一个特殊情况，如果我们收到特定事件，我们希望关闭系统，而不是生成一个`String`，所以我们将使用带有`if`语句的新模式匹配支持。
2. 在这里，我们不仅匹配类型，还提取出`UserDeletedEvent`中的`User user`。
3. 在这里，我们不仅匹配类型，还提取出`UserCreatedEvent`中的`String name`。

所有这些功能在Java的早期版本中开始生根发芽，但在Java 21中达到了顶峰，这可以称为面向数据的编程。这不是面向对象编程的替代品，而是它的补充。你可以使用模式匹配、增强的`switch`和`instanceof`操作符为你的代码赋予新的多态性，而不在你的公共API中暴露分派点。

Java 21中还有许多其他新功能。有很多小但不错的东西，当然还有[项目Loom](https://openjdk.org/projects/loom/)或*虚拟线程*。（仅虚拟线程就值得关注！）让我们深入探讨一些这些令人惊叹的功能。

### 改进的数学功能

在AI和算法中，高效的数学运算比以往任何时候都更重要。新的JDK在这方面有一些不错的改进，包括BigIntegers的并行乘法和各种抛出异常的除法重载，如果有溢出的话。不仅仅是如果有除以零的错误。

```Java
package bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigInteger;

class MathematicsTest {

    @Test
    void divisions() throws Exception {
        //<1>
        var five = Math.divideExact(10, 2);
        Assertions.assertEquals(five, 5);
    }

    @Test
    void multiplication() throws Exception {
        var start = BigInteger.valueOf(10);
        // ②
        var result = start.parallelMultiply(BigInteger.TWO);
        Assertions.assertEquals(BigInteger.valueOf(10 * 2), result);
    }
}
```

1. 这是使除法更安全、更可预测的几个重载之一
2. 对`BigInteger`实例的新并行乘法支持。请记住，只有在`BigInteger`具有数千位时，这才真正有用...

### `Future#state`

如果你正在进行异步编程（是的，即使有了项目Loom，这仍然是一个问题），那么你会很高兴知道我们的老朋友`Future<T>`现在提供了一个`state`实例，你可以在`switch`中查看正在进行的异步操作的状态。

```Java
package bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.concurrent.Executors;

class FutureTest {

    @Test
    void futureTest() throws Exception {
        try (var executor = Executors
                .newFixedThreadPool(Runtime.getRuntime().availableProcessors())) {
            var future = executor.submit(() -> "hello, world!");
            Thread.sleep(100);
            // ①
            var result = switch (future.state()) {
                case CANCELLED, FAILED -> throw new IllegalStateException("无法完成工作！");
                case SUCCESS -> future.resultNow();
                default -> null;
            };
            Assertions.assertEquals(result, "hello, world!");
        }
    }
}
```

1. 这返回一个`state`对象，允许我们枚举提交的`Thread`状态。它与增强的`switch`功能很好地配合。

### 可自动关闭的HTTP客户端

HTTP客户端API是你可能希望在将来包装异步操作并使用项目Loom的地方。HTTP客户端API自Java 11以来一直存在，现在已经是过去十个版本的全新API了！但现在它有了这个新的可自动关闭的API。

```Java
package bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

class HttpTest {

    @Test
    void http () throws Exception {



        // ①
        try (var http = HttpClient.newHttpClient()){
            var request = HttpRequest.newBuilder(URI.create("https://httpbin.org"))
                    .GET()
                    .build();
            var response = http.send(request, HttpResponse.BodyHandlers.ofString());
            Assertions.assertEquals(response.statusCode(), 200);
            System.out.println(response.body());
        }
    }

}
```

1. 我们希望自动关闭`HttpClient`。请注意，如果你确实启动了任何线程并在其中发送HTTP请求，除非确保仅在所有线程执行完毕后才让其达到范围末尾，否则不应使用自动关闭。

### 字符串增强功能

在上面的示例中，我使用了`HttpResponse.BodyHandlers.ofString`来获取`String`响应。你可以得到各种对象，不仅仅是`String`。但`String`结果很好，因为它们是我们进入Java 21另一个出色功能的绝佳途径：对处理`String`实例的新支持。这个类展示了我最喜欢的两个功能：`StringBuilder`的`repeat`操作和检测`String`中是否存在表情符号的方法。

```Java
package bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class StringsTest {

    @Test
    void repeat() throws Exception {
        // ①
        var line = new StringBuilder()
                .repeat("-", 10)
                .toString();
        Assertions.assertEquals("----------", line);
    }

    @Test
    void emojis() throws Exception {
        // ②
        var shockedFaceEmoji = "\uD83E\uDD2F";
        var cp = Character.codePointAt(shockedFaceEmoji.toCharArray(), 0);
        Assertions.assertTrue(Character.isEmoji(cp));
        System.out.println(shockedFaceEmoji);
    }
}
```

1. 第一个示例演示了使用`StringBuilder`重复一个`String`（我们可以一起摆脱各种`StringUtils`吗？）
2. 第二个示例演示了在`String`中检测表情符号。

虽然是小的改进，但确实很不错。

### 顺序集合

你需要一个有序集合来排序这些`String`实例。Java提供了一些这样的集合，如`LinkedHashMap`、`List`等，但它们没有共同的祖先。现在它们有了；欢迎使用`SequencedCollection`！在这个示例中，我们使用一个简单的`ArrayList<String>`并使用一些新的工厂方法来处理诸如`LinkedHashSet`之类的东西。这个新的工厂方法在内部进行了一些数学运算，以保证在你添加到构造函数中规定的元素数量之前，它不需要重新平衡（从而缓慢地重新哈希所有内容）。

```java
package bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashSet;
import java.util.SequencedCollection;

class SequencedCollectionTest {

    @Test
    void ordering() throws Exception {
        var list = LinkedHashSet.<String>newLinkedHashSet(100);
        if (list instanceof SequencedCollection<String> sequencedCollection) {
            sequencedCollection.add("ciao");
            sequencedCollection.add("hola");
            sequencedCollection.add("ni hao");
            sequencedCollection.add("salut");
            sequencedCollection.add("hello");
            sequencedCollection.addFirst("ola"); //<1>
            Assertions.assertEquals(sequencedCollection.getFirst(), "ola"); // ②
        }
    }
}
```

1. 这将覆盖第一个元素
2. 这将返回第一个元素

还有类似`getLast`和`addLast`的方法，甚至还有`reverse`方法支持反转集合。

### 虚拟线程和项目Loom

最后，我们来到了Loom。你无疑已经听过很多关于Loom的事情。基本思想是让你在大学编写的代码具有可扩展性！这是什么意思呢？让我们编写一个简单的网络服务，打印出我们收到的任何内容。我们必须从一个`InputStream`读取数据，并将所有内容积累到一个新的缓冲区（一个`ByteArrayOutputStream`）。然后，当请求完成时，我们将打印`ByteArrayOutputStream`的内容。问题是我们可能会同时收到大量数据。因此，我们将使用线程来处理多个请求。

下面是代码：

```Java
package bootiful.java21;

import java.io.ByteArrayOutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.Executors;

class NetworkServiceApplication {

    public static void main(String[] args) throws Exception {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            try (var serverSocket = new ServerSocket(9090)) {
                while (true) {
                    var clientSocket = serverSocket.accept();
                    executor.submit(() -> {
                        try {
                            handleRequest(clientSocket);
                        } catch (Exception e) {
                            throw new RuntimeException(e);
                        }
                    });
                }
            }
        }
    }

    static void handleRequest(Socket socket) throws Exception {
        var next = -1;
        try (var baos = new ByteArrayOutputStream()) {
            try (var in = socket.getInputStream()) {
                while ((next = in.read()) != -1) {
                    baos.write(next);
                }
            }
            var inputMessage = baos.toString();
            System.out.println("request: %s".formatted(inputMessage));
        }
    }
}
```

这是相当简单的网络101内容。创建一个`ServerSocket`，等待新的客户端（由`Socket`实例表示）出现。当每个客户端到达时，将其交给线程池中的一个线程。每个线程从客户端`Socket`实例的`InputStream`引用中读取数据。客户端可能会断开连接、出现延迟或发送大量数据，这都是一个问题，因为我们只有这么多线程可用，我们必须不浪费它们的宝贵时间。

我们使用线程来避免处理不过来的请求积压。但即便如此，如果我们有太多的请求，我们仍然会遇到线程池中的线程不可用的情况。它们都被卡在等待某个请求完成的状态。好吧，多多少少是这样。许多线程只是坐在那里，等待`InputStream`中的下一个字节，但它们不可用。

线程被阻塞了。它们可能正在等待来自客户端的数据。情况不幸的是，服务器在等待这些数据时别无选择，只能坐在那里，停在一个线程上，不允许其他人使用它。

直到*现在*。Java 21引入了一种新的线程，即*虚拟线程*。现在，我们可以为堆创建数百万个线程。这很简单。但从根本上说，实际的线程（虚拟线程在其上执行）是昂贵的。那么，JRE如何让我们拥有数百万个实际工作的线程呢？它有一个大大改进的运行时，现在注意到我们何时阻塞并暂停线程的执行，直到我们等待的内容到达。然后，它悄悄地将我们放在另一个线程上。实际的线程充当虚拟线程的载体，允许我们启动数百万个线程。

Java 21在所有历史上阻塞线程的地方都有改进，如阻塞IO的`InputStream`和`OutputStream`，以及`Thread.sleep`，现在它们正确地向运行时发出信号，表明可以回收线程并将其重新用于其他虚拟线程，允许工作在虚拟线程“阻塞”时继续。你可以在这个示例中看到这一点，我无耻地从[José Paumard](https://twitter.com/JosePaumard)那里偷来了，他是Oracle的Java开发者倡导者之一，我非常喜欢他的工作。

```Java
package bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ConcurrentSkipListSet;
import java.util.concurrent.Executors;
import java.util.stream.IntStream;

class LoomTest {

    @Test
    void loom() throws Exception {

        var observed = new ConcurrentSkipListSet<String>();

        var threads = IntStream
                .range(0, 100)
                .mapToObj(index -> Thread.ofVirtual() // ①
                        .unstarted(() -> {
                            var first = index == 0;
                            if (first) {
                                observed.add(Thread.currentThread().toString());
                            }
                            try {
                                Thread.sleep(100);
                            } catch (InterruptedException e) {
                                throw new RuntimeException(e);
                            }
                            if (first) {
                                observed.add(Thread.currentThread().toString());
                            }
                            try {
                                Thread.sleep(20);
                            } catch (InterruptedException e) {
                                throw new RuntimeException(e);
                            }
                            if (first) {
                                observed.add(Thread.currentThread().toString());
                            }
                            try {
                                Thread.sleep(20);
                            } catch (InterruptedException e) {
                                throw new RuntimeException(e);
                            }
                            if (first) {
                                observed.add(Thread.currentThread().toString());
                            }
                        }))
                .toList();

        for (var t : threads)
            t.start();

        for (var t : threads)
            t.join();

        System.out.println(observed);

        Assertions.assertTrue(observed.size() > 1);

    }

}
```

1. 我们使用Java 21中的新工

厂方法创建一个虚拟线程。还有一个替代的工厂方法来创建一个`factory`方法。

这个示例启动了许多线程，导致竞争，并且需要共享操作系统载体线程。然后它使线程进入`sleep`状态。通常情况下，`sleep`会阻塞，但在虚拟线程中不会。

我们将在每次`sleep`前后采样一个线程（第一个启动的线程），以记录我们的虚拟线程在`sleep`前后的载体线程名称。注意它们变了！运行时将我们的虚拟线程在不同的载体线程之间移动，而我们的代码没有任何变化！这就是项目Loom的魔力。*几乎*（不好意思用了双关语）没有代码变化，极大地提高了可扩展性（线程重用），与您可能仅在使用反应式编程时才能获得的可扩展性相当。

我们的网络服务呢？我们确实需要进行*一个*更改。但这是一个基本的更改。像这样交换线程池：

```Java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
...
}
```

其他一切保持不变，现在我们获得了无与伦比的可扩展性！Spring Boot应用程序通常在各种事情上都有很多`Executor`实例，如集成、消息传递、Web服务等。如果你使用的是Spring Boot 3.2（2023年11月发布）和Java 21，那么你可以使用这个新属性，Spring Boot会自动为你插入虚拟线程池！很酷。

```properties
spring.threads.virtual.enabled=true
```

## 结论

Java 21是一个重大版本。它提供了与许多现代语言相当的语法和与许多现代语言同等甚至更好的可扩展性，而不会使代码复杂化，比如async/await、反应式编程等。

如果你想要一个本地镜像，还有GraalVM项目，它为Java 21提供了一个提前编译（AOT）编译器。你可以使用GraalVM将高度可扩展的Boot应用程序编译成GraalVM本地镜像，启动时间极短，所需RAM仅为JVM的一小部分。这些应用程序还受益于项目Loom的优势，赋予它们无与伦比的可扩展性。

```Java
./gradlew nativeCompile
```

太棒了！我们现在有了一个启动时间极短，占用RAM极少，并且可扩展性极佳的小二进制文件。恭喜你！你是一名Java开发者，现在是成为Java开发者的最佳时机！

https://spring.io/blog/2023/09/20/hello-java-21