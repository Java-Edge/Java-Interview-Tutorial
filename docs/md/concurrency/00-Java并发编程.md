# 00-Java并发编程

# 1 四句格言

>1.不要这样做
>
>2.没有什么是真的，一切可能都有问题
>
>3.它起作用,并不意味着它没有问题
>
>4.你仍然必须理解它

## 1.1 不要使用它

避免并发副作用的最简单方法就是不用。虽然它似乎足够安全，但它存在无数微妙的陷阱。

证明并发性的唯一因素是速度。只是希望运行更快是不合理的 - 首先应用一个分析器来发现你是否可以执行其他一些优化。

如果被迫并发，请采取最简单安全的实现。使用已有库并尽可能少写自己的代码。有了并发，就没有什么“简单事”。

## 1.2 一切都可能有问题

没有并发性的世界有一定的顺序和一致性。通过简单地将变量赋值给某个值，很明显它应该始终正常工作。

而在并发领域，必须质疑一切。即使将变量设置为某个值也可能不会按预期的方式工作。

在非并发程序中你可以忽略的各种事情突然变得非常重要。
例如，你必须知道处理器缓存以及保持本地缓存与主内存一致的问题。
必须了解对象构造的深度复杂性，以便你的构造对象不会意外地将数据暴露给其他线程更改。

## 1.3 起作用不意味着没问题

很容易编写出一个看似完美，实则有问题的并发程序，往往问题在极端情况下才暴露 - 在部署后不可避免地出现用户问题。

- 你无法证明并发程序是正确的，只能（有时）证明它是不正确的
- 大多数情况下即使它有问题，你可能也无法检测到
- 你通常无法编写有用的测试，因此必须依靠代码检查结合深入的并发知识来发现错误
- 即使是有效的程序也只能在其设计参数下工作。当超出这些设计参数时，大多数并发程序会以某种方式失败。

在其他Java主题中，我们培养了一种感觉-决定论。一切都按照语言的承诺（或隐含）进行，这是令人欣慰和期待的 - 毕竟，编程语言的目的是让机器做我们想要的。
从确定性编程的世界进入并发编程领域，有种称为[Dunning-Kruger](https://en.wikipedia.org/wiki/Dunning%E2%80%93Kruger_effect)效应的认知偏差
概括为“你知道得越少，你以为你知道得越多。”这意味着，相对不熟练的人拥有着虚幻的自我优越感，错误地评估他们的能力远高于实际。

无论你多么确定代码是线程安全的，它可能已经无效了。你可以很容易地了解所有的问题，然后几个月或几年后你会发现一些概念让你意识到你编写的大多数内容实际上都容易受到并发错误的影响。当某些内容不正确时，编译器不会告诉你。为了使它正确，你必须在研究代码时在脑里模拟所有并发问题。

在Java的所有非并发领域，“没有明显的错误和没有明显的编译错误”似乎意味着一切都好。而对于并发，没有任何意义。

## 1.4 必须理解

在格言1-3之后，你可能会对并发性感到害怕，并且认为，“到目前为止，我已经避免了它，也许我可以继续避免。

你可能知道其他编程语言更好地设计用于构建并发程序 - 甚至是在JVM上运行的程序，例如Clojure或Scala。为什么不用这些语言编写并发部分并将Java用于其他所有部分呢？

唉，你不能轻易逃脱，即使你从未明确地创建一个线程，但可能你使用的框架创建了 - 例如，Swing或者像**Timer** 定时器。
最糟糕的事情：当你创建组件，你必须假设这些组件可能在多线程环境中重用。即使你的解决方案是放弃并声明你的组件“非线程安全”，你仍然必须知道这样的声明是重要的，它是什么意思

人们有时会认为并发性太难，不能包含在介绍语言的书中。认为并发是一个独立主题，在日常编程中出现的少数情况（例如图形用户界面）可以用特殊的习语来处理。如果你可以避免它，为什么要介绍这样的复杂的主题。
不幸的是，你无法选择何时在Java程序中出现线程。你从未写过自己的线程，并不意味可以避免编写线程代码。例如Web系统本质上是多线程的Web服务器通常包含多个处理器，而并行性是利用这些处理器的理想方式。这样的系统看起来简单，必须理解并发才能正确地编写它。

Java是一种多线程语言，肯定存在并发问题。因此，有许多Java程序正在使用中，或者只是偶然工作，或者大部分时间工作并且不时地发生问题。有时这种问题是相对良性的，但有时它意味着丢失有价值的数据，如果你没有意识到并发问题，你最终可能会把问题放在其他地方而不是你的代码。如果将程序移动到多处理器系统，则可以暴露或放大这类问题。基本上，了解并发性使你意识到正确的程序可能会表现出错误的行为。

# 2 残酷的真相

Java是在充满自信，热情和睿智的氛围中创建的。在发明一种编程语言时，很容易就像语言的初始可塑性会持续存在一样，你可以把某些东西拿出来，如果不能解决问题，那么就修复它。一旦人们开始使用你的语言，变化就会变得更加严重。
语言设计的过程本身就是一门艺术。
通过匆忙设计语言而产生的认知负荷和技术债务最终会赶上我们。

[Turing completeness](https://en.wikipedia.org/wiki/Turing_completeness)是不足够的;语言需要更多的东西：它们必须能够创造性地表达，而不是用不必要的东西来衡量我们。解放我们的心理能力只是为了扭转并再次陷入困境，这是毫无意义的。我承认，尽管存在这些问题，我们已经完成了令人惊奇的事情，但我也知道如果没有这些问题我们能做得更多。

热情使原始Java设计师因为看起来有必要而投入功能。信心（以及原始语言）让他们认为任何问题都可以解决。
有人认为任何加入Java的东西是固定的和永久性的 - 这是非常有信心，相信第一个决定永远是正确的，因此我们看到Java的体系中充斥着糟糕的决策。其中一些决定最终没有什么后果，例如你可以告诉人们不要使用Vector，但保留了对之前版本的支持。

线程包含在Java 1.0中。当然，并发性是影响语言的基本语言设计决策，很难想象以后才添加它，客观的说，当时并不清楚基本的并发性。像C能够将线程视为一个附加功能，因此Java设计师也纷纷效仿，包括一个Thread类和必要的JVM支持。
C语言是原始的，这限制了它的野心。这些限制使附加线程库合理。当采用原始模型并将其粘贴到复杂语言中时，Java的大规模扩展迅速暴露了基本问题。在Thread类中的许多方法的弃用以及后续的高级库浪潮中，这种情况变得明显，这些库试图提供更好的并发抽象。

为了在高级语言中获得并发性，所有语言功能都会受到影响，例如标识符为可变值。在函数和方法中，所有不变和防止副作用的方法都会导致简化并发编程（纯函数式编程语言基础）的变化，但当时对于主流语言的创建者来说似乎是奇怪的想法。最初的Java设计师要么对这些选择有所了解，要么认为它们太不同了，并且会抛弃许多潜在的语言采用者。语言设计社区当时根本没有足够的经验来理解调整在线程库中的影响。

Java经历告诉我们，结果是相当灾难性的。程序员很容易陷入认为Java 线程并不那么困难的陷阱。工作的程序充满了微妙的并发bug。
为了获得正确的并发性，语言功能必须从头开始设计并考虑并发性。Java将不再是为并发而设计的语言，而只是一种允许它的语言。
尽管有这些基本的不可修复的缺陷，Java的后续版本添加了库，以便在使用并发时提升抽象级别。事实上，我根本不会想到有可能在Java 8中进行改进：并行流和**CompletableFutures** 史诗般的变化。
重点介绍并行流和**CompletableFutures**。虽然它们可以大大简化你对并发和后续代码的思考方式，但基本问题仍然存在：由于Java的原始设计，代码的所有部分仍然容易受到攻击，你仍然必须理解这些复杂和微妙的问题。Java中的线程绝不是简单或安全的;那种经历必须降级为另一种更新的语言。

# 4 创建和运行任务

任务是一段可以独立运行的代码。

为了解释创建和运行任务的一些基础知识，本节介绍一种比并行流或CompletableFutures更简单的机制：Executor。
Executor管理一些低级Thread对象（Java中并发的最原始形式）。你创建一个任务，然后将其交给Executor运行。

有多种类型的Executor用于不同的目的。在这里，我们将展示规范形式，代表创建和运行任务的最简单和最佳方法。

# 5 终止长时间运行的任务

任务独立运行，因此需要一种机制来关闭它们。典型的方法使用一个标志，这引入共享内存问题，我们将使用Java的“Atomic”库规避。

## 6 Completable Futures

当你将衣服带到干洗店时，他们会给你一张收据。你继续完成其他任务，最终你的衣服很干净，你可以拿起它。收据是你与干洗店在后台执行的任务的连接。这是Java 5中引入的Future。

Future比以前的方法更方便，但你仍然必须出现并用收据取回干洗，并等待任务是否完成。对于一系列操作，Futures并没有真正帮助那么多。

Java8 的 CompletableFuture 是一个更好的解决方案：它允许你将操作链接在一起，因此你不必将代码写入接口串行的操作。有了CompletableFuture，就可以更容易地做出“采购原料，组合原料，烹饪食物，提供食物，清理菜肴，储存菜肴”等一系列链式的串行操作。

# 7 死锁

某些任务必须阻塞等待其他任务的结果。被阻塞的任务有可能等待另一个阻塞的任务。如果被阻塞的任务链循环到第一个，还是没有人可以取得任何进展，你就会陷入死锁。

最大的问题在运行程序时没有立即出现死锁。你的系统可能容易出现死锁，并且只会在某些条件下死锁。程序可能在某个平台上运行正常，例如你的开发机器，但部署到不同的硬件时死锁。

死锁通常源于细微的编程错误;一系列无心的决定，最终意外地创建了一个依赖循环。

# Parallel Streams（并行流）

可以通过简单地将parallel()添加到表达式来并行化流。这是一种简单，强大，坦率地说是利用多处理器的惊人方式。

添加parallel()来提高速度似乎是微不足道的，演示并解释一些盲目添加parallel()到Stream表达式的缺陷。

Java 8流的一个显着优点是，在某些情况下，它们可以很容易地并行化。这来自精心的库设计，特别是流使用内部迭代 - 它们控制着自己的迭代器。他们使用一种特殊的迭代器Spliterator，被限制为易于自动分割。简单用parallel()然后流中的所有内容都作为一组并行任务运行。如果你的代码是使用Streams编写的，那么并行化以提高速度似乎是一种琐事。

考虑来自Streams的Prime.java。

- 查找质数：
  ![](https://img-blog.csdnimg.cn/2020070523310519.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

当注释掉parallel()行时，结果大约是parallel()的三倍。
并行流似乎是一个甜蜜的交易。你所需要做的就是将编程问题转换为流，然后插入parallel()以加快速度。有时这很容易，但有陷阱。

## parallel()不是灵丹妙药

流和并行流的不确定性的探索：求和数字的增量序列。
从一个计时方法rigorously 开始，它采用**LongSupplier**，测量**getAsLong()**调用的长度，将结果与**checkValue**进行比较并显示结果。

```java
// concurrent/Summing.java
import java.util.stream.*;
import java.util.function.*;
import onjava.Timer;
public class Summing {
    static void timeTest(String id, long checkValue,    LongSupplier operation){
        System.out.print(id + ": ");
        Timer timer = newTimer();
        long result = operation.getAsLong();
        if(result == checkValue)
            System.out.println(timer.duration() + "ms");
        else
            System.out.format("result: %d%ncheckValue: %d%n", result, checkValue);
        }
    public static final int SZ = 100_000_000;// This even works://
    public static final int SZ = 1_000_000_000;
    public static final long CHECK = (long)SZ * ((long)SZ + 1)/2; // Gauss's formula
    public static void main(String[] args){
        System.out.println(CHECK);
        timeTest("Sum Stream", CHECK, () ->
        LongStream.rangeClosed(0, SZ).sum());
        timeTest("Sum Stream Parallel", CHECK, () ->
        LongStream.rangeClosed(0, SZ).parallel().sum());
        timeTest("Sum Iterated", CHECK, () ->
        LongStream.iterate(0, i -> i + 1)
        .limit(SZ+1).sum());
        // Slower & runs out of memory above 1_000_000:
        // timeTest("Sum Iterated Parallel", CHECK, () ->
        //   LongStream.iterate(0, i -> i + 1)
        //     .parallel()
        //     .limit(SZ+1).sum());
    }
}
```

输出结果：

```
5000000050000000
Sum Stream: 167ms
Sum Stream Parallel: 46ms
Sum Iterated: 284ms
```

**CHECK**值是使用Carl Friedrich Gauss在1700年代后期仍在小学时创建的公式计算出来的.

**main()** 的第一个版本使用直接生成 **Stream** 并调用 **sum()** 的方法。我们看到流的好处在于十亿分之一的SZ在没有溢出的情况下处理（我使用较小的数字，因此程序运行时间不长）。使用 **parallel()** 的基本范围操跟快。

如果使用**iterate()**来生成序列，则减速是戏剧性的，可能是因为每次生成数字时都必须调用lambda。但是如果我们尝试并行化，那么结果通常比非并行版本花费的时间更长，但是当**SZ**超过一百万时，它也会耗尽内存（在某些机器上）。当然，当你可以使用**range()**时，你不会使用**iterate()**，但如果你生成的东西不是简单的序列，你必须使用**iterate()**。应用**parallel()**是一个合理的尝试，但会产生令人惊讶的结果。我们将在后面的部分中探讨内存限制的原因，但我们可以对流并行算法进行初步观察：

- 流并行性将输入数据分成多个部分，因此算法可以应用于那些单独的部分。
- 阵列分割成本低廉，均匀且具有完美的分裂知识。
- 链接列表没有这些属性;“拆分”一个链表仅仅意味着把它分成“第一元素”和“其余列表”，这相对无用。
- 无状态生成器的行为类似于数组;使用上述范围是无可争议的。
- 迭代生成器的行为类似于链表; **iterate()** 是一个迭代生成器。

现在让我们尝试通过在数组中填充值来填充数组来解决问题。因为数组只分配了一次，所以我们不太可能遇到垃圾收集时序问题。

首先我们将尝试一个充满原始**long**的数组：

```java
// concurrent/Summing2.java
// {ExcludeFromTravisCI}import java.util.*;
public class Summing2 {
    static long basicSum(long[] ia) {
        long sum = 0;
        int size = ia.length;
        for(int i = 0; i < size; i++)
            sum += ia[i];return sum;
    }
    // Approximate largest value of SZ before
    // running out of memory on mymachine:
    public static final int SZ = 20_000_000;
    public static final long CHECK = (long)SZ * ((long)SZ + 1)/2;
    public static void main(String[] args) {
        System.out.println(CHECK);
        long[] la = newlong[SZ+1];
        Arrays.parallelSetAll(la, i -> i);
        Summing.timeTest("Array Stream Sum", CHECK, () ->
        Arrays.stream(la).sum());
        Summing.timeTest("Parallel", CHECK, () ->
        Arrays.stream(la).parallel().sum());
        Summing.timeTest("Basic Sum", CHECK, () ->
        basicSum(la));// Destructive summation:
        Summing.timeTest("parallelPrefix", CHECK, () -> {
            Arrays.parallelPrefix(la, Long::sum);
        return la[la.length - 1];
        });
    }
}
```

输出结果：

```
200000010000000
Array Stream
Sum: 104ms
Parallel: 81ms
Basic Sum: 106ms
parallelPrefix: 265ms
```

第一个限制是内存大小;因为数组是预先分配的，所以我们不能创建几乎与以前版本一样大的任何东西。并行化可以加快速度，甚至比使用 **basicSum()** 循环更快。有趣的是， **Arrays.parallelPrefix()** 似乎实际上减慢了速度。但是，这些技术中的任何一种在其他条件下都可能更有用 - 这就是为什么你不能做出任何确定性的声明，除了“你必须尝试一下”。”

最后，考虑使用盒装**Long**的效果:

```java
// concurrent/Summing3.java
// {ExcludeFromTravisCI}
import java.util.*;
public class Summing3 {
    static long basicSum(Long[] ia) {
        long sum = 0;
        int size = ia.length;
        for(int i = 0; i < size; i++)
            sum += ia[i];
            return sum;
    }
    // Approximate largest value of SZ before
    // running out of memory on my machine:
    public static final int SZ = 10_000_000;
    public static final long CHECK = (long)SZ * ((long)SZ + 1)/2;
    public static void main(String[] args) {
        System.out.println(CHECK);
        Long[] aL = newLong[SZ+1];
        Arrays.parallelSetAll(aL, i -> (long)i);
        Summing.timeTest("Long Array Stream Reduce", CHECK, () ->
        Arrays.stream(aL).reduce(0L, Long::sum));
        Summing.timeTest("Long Basic Sum", CHECK, () ->
        basicSum(aL));
        // Destructive summation:
        Summing.timeTest("Long parallelPrefix",CHECK, ()-> {
            Arrays.parallelPrefix(aL, Long::sum);
            return aL[aL.length - 1];
            });
    }
}
```

输出结果：

```
50000005000000
Long Array
Stream Reduce: 1038ms
Long Basic
Sum: 21ms
Long parallelPrefix: 3616ms
```

现在可用的内存量大约减半，并且所有情况下所需的时间都会很长，除了**basicSum()**，它只是循环遍历数组。令人惊讶的是， **Arrays.parallelPrefix()** 比任何其他方法都要花费更长的时间。

我将 **parallel()** 版本分开了，因为在上面的程序中运行它导致了一个冗长的垃圾收集，扭曲了结果：

```java
// concurrent/Summing4.java
// {ExcludeFromTravisCI}
import java.util.*;
public class Summing4 {
    public static void main(String[] args) {
        System.out.println(Summing3.CHECK);
        Long[] aL = newLong[Summing3.SZ+1];
        Arrays.parallelSetAll(aL, i -> (long)i);
        Summing.timeTest("Long Parallel",
        Summing3.CHECK, () ->
        Arrays.stream(aL)
        .parallel()
        .reduce(0L,Long::sum));
    }
}
```

输出结果：

```
50000005000000
Long Parallel: 1014ms
```

它比非parallel()版本略快，但并不显着。

这种时间增加的一个重要原因是处理器内存缓存。使用**Summing2.java**中的原始**long**，数组**la**是连续的内存。处理器可以更容易地预测该阵列的使用，并使缓存充满下一个需要的阵列元素。访问缓存比访问主内存快得多。似乎 **Long parallelPrefix** 计算受到影响，因为它为每个计算读取两个数组元素，并将结果写回到数组中，并且每个都为**Long**生成一个超出缓存的引用。

使用**Summing3.java**和**Summing4.java**，**aL**是一个**Long**数组，它不是一个连续的数据数组，而是一个连续的**Long**对象引用数组。尽管该数组可能会在缓存中出现，但指向的对象几乎总是超出缓存。

这些示例使用不同的SZ值来显示内存限制。

为了进行时间比较，以下是SZ设置为最小值1000万的结果：


虽然Java 8的各种内置“并行”工具非常棒，但我认为它们被视为神奇的灵丹妙药：“只需添加parallel()并且它会更快！”我希望我已经开始表明情况并非所有都是如此，并且盲目地应用内置的“并行”操作有时甚至会使运行速度明显变慢。

- parallel()/limit()交点

使用parallel()时会有更复杂的问题。从其他语言中吸取的流是围绕无限流模型设计的。如果你拥有有限数量的元素，则可以使用集合以及为有限大小的集合设计的关联算法。如果你使用无限流，则使用针对流优化的算法。

Java 8将两者合并起来。例如，**Collections**没有内置的**map()**操作。在Collection和Map中唯一类似流的批处理操作是**forEach()**。如果要执行**map()**和**reduce()**等操作，必须首先将Collection转换为存在这些操作的Stream:

```java
// concurrent/CollectionIntoStream.java
import onjava.*;
import java.util.*;
import java.util.stream.*;
public class CollectionIntoStream {
    public static void main(String[] args) {
    List<String> strings = Stream.generate(new Rand.String(5))
    .limit(10)
    .collect(Collectors.toList());
    strings.forEach(System.out::println);
    // Convert to a Stream for many more options:
    String result = strings.stream()
    .map(String::toUpperCase)
    .map(s -> s.substring(2))
    .reduce(":", (s1, s2) -> s1 + s2);
    System.out.println(result);
    }
}
```

输出结果：

```
pccux
szgvg
meinn
eeloz
tdvew
cippc
ygpoa
lkljl
bynxt
:PENCUXGVGINNLOZVEWPPCPOALJLNXT
```

**Collection**确实有一些批处理操作，如**removeAll()**，**removeIf()**和**retainAll()**，但这些都是破坏性的操作.**ConcurrentHashMap**对**forEachand**和**reduce**操作有特别广泛的支持。

在许多情况下，只在集合上调用**stream()**或者**parallelStream()**没有问题。但是，有时将**Stream**与**Collection**混合会产生意外。这是一个有趣的难题：
