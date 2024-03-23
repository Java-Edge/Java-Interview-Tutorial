# JDK21新特性

[ENGINEERING](https://spring.io/blog/category/engineering) | [JOSH LONG](https://spring.io/team/joshlong) | SEPTEMBER 20, 2023 | [18 COMMENTS](https://spring.io/blog/2023/09/20/hello-java-21#disqus_thread)

Hi, Spring fans!

## Get the bits

Before we get started, do something for me quickly. If you haven’t already, go [install SKDMAN](https://sdkman.io/).

Then run:

```shell
COPYsdk install java 21-graalce && sdk default java 21-graalce
```

There you have it. You now have Java 21 and graalvm supporting Java 21 on your machine, ready to go. Java 21 is, in my estimation, the most critical release of Java, perhaps ever, in that it implies a whole new world of opportunities for people using Java. It brings a slew of nice APIs and additions, like pattern matching, culminating years of features slowly and steadily adding to the platform. But the most prominent feature, by far, is the new support for virtual threads project Loom). Virtual threads and GraalVM native images mean that today, you can write code that delivers performance and scalability on par with the likes of C, Rust, or Go while retaining the robust and familiar ecosystem of the JVM.

There’s never been a better time to be a JVM developer.

I just posted a video exploring new features and opportunities in Java 21 and GraalVM.

<iframe width="560" height="315" src="https://www.youtube.com/embed/8VJ_dSdV3pY?si=D7ecMMusRby85GC4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="" style="box-sizing: inherit; margin: 0px; padding: 0px; border: 0px;"></iframe>

In this blog, I hope to visit the same things, with some added data that lends itself to text.

## Why GraalVM instead of plain ol' Java?

First things first. If it wasn’t apparent from the above installation, I recommend installing graalvm first. It is OpenJDK, so you get all the OpenJDK bits, but it can also create GraalVM native images.

Why graalvm native images? well, it’s *fast* and super resource efficient. traditionally, that truism always had a rebuttal: "Yah, well, the JIT is still faster in plain old Java," to which I’d counter, "Yah, well, you can much more readily scale up new instances at a fraction of the footprint to account for whatever lost throughput you had, and *still* be ahead in terms of resource consumption spend!" Which was true.

But now we don’t even have to have that nuanced discussion. Per the [graalvm release blog](https://medium.com/graalvm/graalvm-for-jdk-21-is-here-ee01177dd12d), Oracle’s GraalVM native image with profile-guided optimization performance is now consistently *ahead* of JIT on benchmarks where it was only in some places ahead. Oracle GraalVM isn’t necessarily the same as the open-source GraalVM distribution, but the point is that the higher echelons of performance now exceed the JRE JIT.

![1*01_HtHD4jfuXOsgDMhkljQ](https://miro.medium.com/v2/resize:fit:4800/format:webp/1*01_HtHD4jfuXOsgDMhkljQ.png)

This excellent post from [10MinuteMail](https://www.digitalsanctuary.com/10minutemail/migrating-10minutemail-from-java-to-graalvm-native.htmlhttps://www.digitalsanctuary.com/10minutemail/migrating-10minutemail-from-java-to-graalvm-native.html) looks at how they used GraalVM and Spring Boot 3 to reduce their startup time from ~30 seconds down to about 3 milliseconds, and memory usage from 6.6GB down to 1GB, with the same throughput and CPU utilization. Amazing.

## Java 17

So many features in Java 21 build upon features first introduced in Java 17 (and, in some cases, earlier than that!). Let’s review some of those features before examining their final manifestation in Java 21.

### Multiline Strings

Do you know that Java supports multiline strings? It’s one of my favorite features, and it has made using JSON, JDBC, JPA QL, etc., more pleasant than ever:

```Java
COPYpackage bootiful.java21;

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

Nothing too surprising. Easy to understand. Triple quotes start and stop the multiline string. You can strip the leading, trailing, and indent space, too.

### Records

Records are one of my favorite features of Java! They’re freaking fantastic! Do you have a class whose identity is equivalent to the fields in the class? Sure you do. Think about your basic entities, your events, your DTOs, etc. Whenever you’ve used Lombok’s `@Data`, you could just as easily use a `record`. They have analogs in Kotlin (`data class`) and Scala (`case class`), so plenty of people know about them, too. It’s great that they’re finally in Java.

```Java
COPYpackage bootiful.java21;

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

This concise syntax results in a class with a constructor, associated storage in the course, getters (e.g.: `event.name()`), a valid `equals`, and a good `toString()` implementation.

### Enhanced Switch

I rarely used the existing `switch` statement because it was clunky, and usually, there were other patterns, like the [*visitor pattern*](https://en.wikipedia.org/wiki/Visitor_pattern), that got me most of the benefits. Now there’s a new `switch` that is an *expression*, not a statement, so I can assign the results of the `switch` to a variable, or return it.

Here’s an example of reworking a classic switch to use the new enhanced `switch`:

```Java
COPYpackage bootiful.java21;

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

1. This is a classic implementation with the older, clunkier switch statement
2. This is the new switch expression

### The Enhanced `instanceof` Check

The new `instanceof` test allows us to avoid the clunky check-and-cast of yore, which looks like this:

```Java
COPYvar animal = (Object) new Dog ();
if (animal instanceof Dog ){
var fido  = (Dog) animal;
fido.bark();
}
```

And replace it with:

```Java
COPYvar animal = (Object) new Dog ();
if (animal instanceof Dog fido ){
fido.bark();
}
```

The smart `instanceof` automatically assigns a downcast variable for use in the scope of the test. There’s no need to specify the class `Dog` twice in the same block. The smart `instanceof` operator usage is the first real taste of pattern matching in the Java platform. The idea behind pattern matching is simple: match types and extract data from those types.

### Sealed types

Technically sealed types are part of Java 17, too, but they don’t buy you much yet. The basic idea is that, in the olden times, the only way to limit the extensibility of a type was through visibility modifiers (`public`, `private`, etc.). In the `sealed` keyword, you can explicitly permit which classes may subclass another class. This is a fantastic leap forward because it gives the compiler visibility into which type might extend a given type, which allows it to do optimizations and to help us at compile time to understand whether all possible cases say in an enhanced `switch` expression - have been covered. Let’s take a look at it in action.

```Java
COPYpackage bootiful.java21;

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

1. We have an explicitly sealed interactive that only permits three types. The enhanced `switch` expression below will fail if we add a new class.
2. Classes that implement that sealed interface must either be declared `sealed` and thus declare which classes it permits as subclasses, or it must be declared as `final`.
3. We could use the new `instance of` check to make shorter work of working with each possible type, but we get no compiler help here.
4. unless we use the enhahced `switch` *with* pattern matching, as we do here.

Notice how clunky the classic version is. Ugh. I am so glad to be done with that. Another nice thing is that the `switch` expression will now tell us whether we’ve covered all possible cases, like with the `enum`. Thanks, compiler!

## Beyond Java 17

With all these things combined, we’re starting to wade comfortably into Java 21 land. From here on down, we’ll look at features that have come *since* java 17.

### Next Level Pattern Matching with `records`, `switch`, and `if.`

The enhanced `switch` expression and pattern matching are remarkable, and it makes me wonder how using Akka so many years ago would’ve felt using Java with this excellent new syntax. Pattern matching has an even nicer interaction when taken together with records because records - as discussed earlier - are the resumes of their components, and the compiler knows this. So, it can hoist those components into new variables, too. You can also use this pattern-matching syntax in `if` checks.

```Java
COPYpackage bootiful.java21;

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
                respond(new UserCreatedEvent("jlong")), "the new user with name jlong has been created"
        );
        Assertions.assertEquals(
                respond(new UserDeletedEvent(new User("jlong", 1))),
                "the user jlong has been deleted"
        );
    }

    String respond(Object o) {
        // ①
        if (o instanceof ShutdownEvent(Instant instant)) {
            System.out.println(
                "going to to shutdown the system at " + instant.toEpochMilli());
        }
        return switch (o) {
            // ②
            case UserDeletedEvent(var user) -> "the user " + user.name() + " has been deleted";
            // ③
            case UserCreatedEvent(var name) -> "the new user with name " + name + " has been created";
            default -> null;
        };
    }

}
```

1. We have a special case where if we get a particular event, we want to shut down, not produce a `String`, so we’ll use the new pattern matching support with an `if` statement.
2. Here, we’re matching not just the type but extracting out the `User user` of the `UserDeletedEvent`.
3. Here, we’re matching not just the type, but we’re extracting out the `String name` of the `UserCreatedEvent`.

All these things started to take root in earlier versions of Java but culminate here in Java 21 in what you might call data-oriented programming. It is not a replacement for object-oriented programming but a compliment to it. You can use things like pattern matching, enhanced switch, and the `instanceof` operator to give your code a new polymorphism without exposing the dispatch point in your public API.

There are so many other features new in Java 21. There’s a bunch of small but nice things and, of course, [project Loom](https://openjdk.org/projects/loom/) or *virtual threads*. (Virtual threads alone are worth the price of admission!) Let’s dive right into some of these fantastic features.

### Improved mathematics

In AI and algorithms, efficient mathematics is more important than ever. The new JDK has some nice improvements here, including parallel multiplication for BigIntegers and various overloads for divisions that throw an exception if there’s an overflow. Not just if there’s a divide-by-zero error.

```Java
COPYpackage bootiful.java21;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigInteger;

class MathematicsTest {

    @Test
    void divisions() throws Exception {
        //<1>
        var five = Math.divideExact( 10, 2) ;
        Assertions.assertEquals( five , 5);
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

1. This first operation is one of several overloads that make division safer and more predictable
2. There’s new support for parallelized multiplication with `BigInteger` instances. Remember that this is only really useful if the `BigInteger` has thousands of bits...

### `Future#state`

If you’re doing asynchronous programming (yes, that’s still a thing, even with Project Loom), then you’ll be pleased to know our old friend `Future<T>` now makes available a `state` instance that you can `switch` on to see the status of the ongoing asynchronous operation.

```Java
COPYpackage bootiful.java21;

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
                case CANCELLED, FAILED -> throw new IllegalStateException("couldn't finish the work!");
                case SUCCESS -> future.resultNow();
                default -> null;
            };
            Assertions.assertEquals(result, "hello, world!");
        }
    }
}
```

1. This returns a `state` object that lets us enumerate the submitted `Thread` states. It pairs nicely with the enhanced `switch` feature.

### AutoCloseable HTTP Client

The HTTP client API is where you might want to wrap async operations in the future and use Project Loom. The HTTP Client API has existed since Java 11, which is now a full ten releases in the distant past! But, now it has this spiffy new auto-closeable API.

```Java
COPYpackage bootiful.java21;

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
        try (var http = HttpClient
                .newHttpClient()){
            var request = HttpRequest.newBuilder(URI.create("https://httpbin.org"))
                    .GET()
                    .build() ;
            var response = http.send( request, HttpResponse.BodyHandlers.ofString());
            Assertions.assertEquals( response.statusCode() , 200);
            System.out.println(response.body());
        }
    }

}
```

1. We want to close the `HttpClient` automatically. Note that if you do launch any threads and send HTTP requests in them, you should *not* use auto-closeable unless care is taken only to let it reach the end of the scope *after* all the threads have finished executing.

### String Enhancements

I used `HttpResponse.BodyHandlers.ofString` to get a `String` response in that example. You can get all sorts of objects back, not just `String`. But `String` results are nice because they are a great segue to another fantastic feature in Java 21: the new support for working with `String` instances. This class shows two of my favorites: a `repeat` operation for `StringBuilder` and a way to detect the presence of Emojis in a `String`.

```Java
COPYpackage bootiful.java21;

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

1. This first example demonstrates using the `StringBuilder` to repeat a `String` (can we all collectively get rid of our various `StringUtils`, yet?)
2. This second example demonstrates detecting an emoji in a `String`.

Small quality-of-life improvements, I agree, but nice nonetheless.

### Sequenced Collections

You’ll need an ordered collection to sort those `String` instance. Java offers a few of them, `LinkedHashMap`, `List`, etc., but they didn’t have a common ancestor. Now they do; welcome, `SequencedCollection`! In this example, we work with a simple `ArrayList<String>` and use the fancy new factory methods for things like a `LinkedHashSet`. This new factory method does some math internally to guarantee that it won’t have to rebalance (and thus slowly rehash everything) before you’ve added as many elements as you’ve stipulated in the constructor.

```java
COPYpackage bootiful.java21;

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

1. This overrides the first-place element
2. This returns the first-place element

There are similar methods for `getLast` and `addLast`, and there’s even support for reversing a collection, with the `reverse` method.

### Virtual Threads and Project Loom

Finally, we get to Loom. You’ve no doubt heard a lot about Loom. The basic idea is to make scalable the code you wrote in college! What do I mean by that? Let’s write a simple network service that prints out whatever is given to us. We must read from one `InputStream` and accrue everything into a new buffer (a `ByteArrayOutputStream`). Then, when the request finishes, we’ll print the contents o the `ByteArrayOutputStream`. The problem is we might get a lot of data simultaneously. So, we will use threads to handle more than one request at the same time.

Here’s the code:

```Java
COPYpackage bootiful.java21;

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

It’s pretty trivial Networking-101 stuff. Create a `ServerSocket`, and wait for new clients (represented by instances of `Socket`) to appear. As each one arrives, hand it off to a thread from a threadpool. Each Thread reads data from the client `Socket` instance’s `InputStream` references. Clients might disconnect, experience latency, or have a large chunk of data to send, all of which is a problem because there are only so many threads available and we must not waste our precious little time on them.

We’re using threads to avoid a pileup of requests we can’t handle fast enough. But here again we’re defeated because, before Java 21, threads were expensive! They cost about two megabytes of RAM for each `Thread`. And so we pool them in a thread pool and reuse them. But even there, if we have too many requests, we’ll end up in a situation where none of the threads in the pool are available. They’re all stuck waiting on some request or another to finish. Well, sort of. Many are just sitting there, waiting for the next `byte` from the `InputStream`, but they’re unavailable for use.

The threads are blocked. They’re probably waiting for data from the client. The unfortunate state of things is that the server, waiting on that data, has no choice but to sit there, parked on a thread, not allowing anybody else to use it.

Until *now*, that is. Java 21 introduces a new sort of thread, a *virtual thread*. Now, we can create millions of threads for the heap. It’s easy. But fundamentally, the facts on the ground are that the actual threads, on which virtual threads execute, are expensive. So, how can the JRE let us have millions of threads for actual work? It has a vastly improved runtime that now notices when we block and suspend execution on the Thread until the thing we’re waiting for arrives. Then, it quietly puts us back on another thread. The actual threads act as carriers for virtual threads, allowing us to start millions of threads.

Java 21 has improvements in all the places that historically block threads, like blocking IO with `InputStream` and `OutputStream`, and `Thread.sleep`, so now they correctly signal to the runtime that it is ok to reclaim the Thread and repurpose it for other virtual threads, allowing work to progress even when a virtual thread is 'blocked'. You can see that in this example, which I shamelessly stole from [José Paumard](https://twitter.com/JosePaumard), one of the Java Developer Advocates at Oracle whose work I love.

```Java
COPYpackage bootiful.java21;

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

1. We’re using a new factory method in Java 21 to create a virtual thread. There’s an alternative factory method to create a `factory` method.

This example launches a lot of threads, to the point where it creates contention and will need to share the operating system carrier threads. Then it causes the threads to `sleep`. Sleeping would typically block, but not in virtual threads.

We’ll sample one of the threads (the first one launched) before and after each sleep to note the name of the carrier thread on which our virtual thread is running before and after each sleep. Notice that they’ve changed! The runtime has moved our virtual thread on and off different carrier threads with no changes to our code! That’s the magic of Project Loom. *Virtually* (pardon the pun) no code changes, and much improved scalability (thread reuse), on par with what you might otherwise only be able to get with something like reactive programming.

What about our network service? We do require *one* change. But it’s a basic one. Swap out the thread pool, like this:

```Java
COPYtry (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
...
}
```

Everything else remains the same, and now we get unparalleled scale! Spring Boot applications typically have a lot of `Executor` instances in play for all sorts of things, like integration, messaging, web services, etc. If you’re using Spring Boot 3.2, coming out in November 2023, and Java 21, then you can use this new property, and Spring Boot will automatically plug in virtual thread pools for you! Neat.

```properties
COPYspring.threads.virtual.enabled=true
```

## Conclusion

Java 21 is a huge deal. It offers syntax on par with many more modern languages and scalability that’s as good or better than many modern languages without complicating the code with things like async/await, reactive programming, etc.

If you want a native image, there is also the GraalVM project, which provides an ahead-of-time (AOT) compiler for Java 21. You can GraalVM to compile your highly scalable Boot applications into GraalVM native images that start in no time and take a tiny fraction of the RAM they took on the JVM. These applications also benefit from the beauty of Project Loom, blessing them with the unparalleled scale.

```Java
COPY./gradlew nativeCompile
```

Nice! We’ve now got a small binary that starts up in a small fraction of time, takes a tiny fraction of the RAM, and scales as well as the most scalable runtimes. Congrats! You’re a Java developer, and there’s never been a better time to be a Java developer!

https://spring.io/blog/2023/09/20/hello-java-21