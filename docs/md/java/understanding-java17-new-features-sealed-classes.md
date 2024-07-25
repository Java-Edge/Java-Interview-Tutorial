# 深入理解 Java17 新特性：Sealed Classes

## 0 关键总结

- Java SE 15在2020年9月发布，预览功能引入“封闭类”(JEP 360)
- 封闭类是一种限制哪些其他类或接口可扩展它的类或接口
- 类似枚举，封闭类在领域模型中捕获替代方案，允许程序员和编译器推理其穷尽性
- 封闭类对于创建安全的层次结构也很有用，通过解耦可访问性和可扩展性，允许库开发者公开接口，同时控制所有实现
- 封闭类与记录和模式匹配一起工作，以支持更数据中心化的编程形式

## 1 预览功能

鉴于Java全球影响力和高兼容性承诺，语言功能设计错误代价非常高。如语言功能存在缺陷，保持兼容性不仅意味很难移除或显著改变功能，且现有功能还会限制未来功能发展。新功能要通过实际使用来验证，开发人员的反馈至关重要。为确保在快速发布节奏下有足够的时间进行实验和反馈，新语言功能将通过一或多个轮次的*预览*来测试，这些功能是平台的一部分，但需要单独选择进入，并且尚未成为永久功能，以便在根据开发人员的反馈进行调整时，不会破坏关键代码。

Java SE 15（2020年9月）引入了作预览功能。封闭允许类和接口更好地控制其允许的子类型，这对于一般领域建模和构建更安全的平台库都很有用。

一个类或接口可以声明为`sealed`，这意味着只有特定的一组类或接口可以直接扩展它：

```java
sealed interface Shape
    permits Circle, Rectangle { ... }
```

这声明了一个名为`Shape`的封闭接口。`permits`列表表示只有`Circle`和`Rectangle`可以实现`Shape`。（在某些情况下，编译器可以为我们推断出允许列表。）任何其他尝试扩展`Shape`的类或接口将会收到编译错误（或在运行时尝试生成声明`Shape`为超类型的非标签类文件时，收到运行时错误）。

我们已熟悉通过`final`类限制扩展；封闭可被认为是终结性的泛化。限制允许的子类型集可能带来两个好处：

- 超类型的作者可以更好地推理可能的实现，因为他们可以控制所有的实现
- 而编译器可以更好地推理穷尽性（例如在`switch`语句或强制转换中）

封闭类与[记录]配合得很好。

## 2 和枚举类型类似的和积类型

上面的接口声明表明，一个`Shape`可以是`Circle`或`Rectangle`，而不能是其他任何东西。即所有`Shape`的集合等于所有`Circle`的集合加上所有`Rectangle`的集合。因此，封闭类通常被称为*和类型*，因为它们的值集是其他类型固定列表的值集的总和。封闭类和和类型不是新事物，如Scala和Haskell都有封闭类，而ML有定义和类型的原语（有时称为*标签联合*或*判别联合*）。

和类型经常与*积类型*一起出现。记录是最近[引入Java]的积类型形式，因为它们的状态空间是其组件的状态空间的笛卡尔积的一个子集（如果这听起来复杂，可以将积类型想象为元组，记录是*命名元组*）。

用记录完成`Shape`的声明：

```java
sealed interface Shape
    permits Circle, Rectangle {

      record Circle(Point center, int radius) implements Shape { }

      record Rectangle(Point lowerLeft, Point upperRight) implements Shape { } 
}
```

和类型和积类型是咋配合的；“一个圆由一个中心和一个半径定义”，“一个矩形由两个点定义”，最后“一个形状要么是一个圆要么是一个矩形”。由于我们预计在同一个编译单元中共同声明基类型及其实现类型是很常见的，因此当所有子类型都在同一编译单元中声明时，允许省略`permits`子句，并推断为在该编译单元中声明的子类型集合：

```java
sealed interface Shape {

      record Circle(Point center, int radius) implements Shape { }

      record Rectangle(Point lowerLeft, Point upperRight) implements Shape { } 
}
```

## 3 违反封装？

历史上，对象建模鼓励隐藏抽象类型的实现集。被告知不要问“可能的`Shape`子类型是什么”，类似地被告知向特定实现类的下转型是种“代码异味”。

为啥现在添加看似违反这些长期原则的语言功能？（也可问类似问题，关于记录：要求在类的表示和其API之间建立特定关系是否违反封装？）

当然是“视情况而定”。建模一个抽象服务时，通过抽象类型与服务交互是一个积极的好处，因为减耦，并最大限度提高系统演进灵活性。但建模一个特定领域时，如该领域特性已很清楚，封装可能没太多优势。正如记录中所见，建模如XY点或RGB颜色这样简单数据时，使用对象的完全通用性来建模数据需要大量低价值工作，更糟糕的，往往掩盖实际发生的事。此时，封装成本不值得其带来的好处；将数据建模为数据更简单直接。

同样的论点适用于封闭类。建模一个已知且稳定的领域时，“我不会告诉你有哪些种类的形状”的封装可能不会带来我们期望从不透明抽象中获得的好处，甚至可能使客户更难处理一个实际上很简单的领域。

这不意味着封装是个错误；这仅意味着有时成本和收益的平衡不一致，可通过判断来确定何时有帮助，何时妨碍。当选择公开或隐藏实现时，须明确封装的收益和成本。它是否为我们提供演进实现的灵活性或仅是个信息破坏的障碍，阻碍对方已显而易见的东西？封装的好处通常巨大，但在建模已知领域的简单层次结构时，声明坚如磐石的抽象的开销有时可能超过收益。

像`Shape`这样的类型不仅承诺其接口，还承诺实现它的类时，可更好询问“你是圆形吗”并转换为`Circle`，因为`Shape`明确命名`Circle`作为其已知子类型之一。就像记录是一种更透明的类，和类型是一种更透明的多态性。这就是为啥和类型和积类型如此频繁一起出现；它们都代表透明性和抽象之间的权衡，所以在一个地方有意义的地方，另一个地方也可能有意义。（和积类型通常被称为[*代数数据类型*](https://en.wikipedia.org/wiki/Algebraic_data_type)。）

## 4 穷尽性

像`Shape`这样的封闭类承诺一个可能子类型的穷尽列表，这有助于程序员和编译器以我们以前无法做到的方式推理形状。（其他工具也可以利用这些信息；Javadoc工具在生成的封闭类文档页面中列出了允许的子类型。）

Java SE 14引入一种有限形式的[模式匹配](https://openjdk.java.net/jeps/305)，将来会扩展。第一个版本允许我们在`instanceof`中使用*类型模式*：

```java
if (shape instanceof Circle c) {
    // 编译器已为我们将shape转换为Circle，并绑定到c
    System.out.printf("Circle of radius %d%n", c.radius()); 
}
```

从那里易跳到在`switch`中使用类型模式。可用`switch`表达式，其`case`标签是类型模式，如下计算形状的面积：

```java
float area = switch (shape) {
    case Circle c -> Math.PI * c.radius() * c.radius();
    case Rectangle r -> Math.abs((r.upperRight().y() - r.lowerLeft().y())
                                 * (r.upperRight().x() - r.lowerLeft().x()));
    // no default needed!
}
```

封闭的贡献在无需`default`子句，因为编译器从`Shape`的声明中知道`Circle`和`Rectangle`覆盖了所有的形状，因此`switch`中的`default`子句将不可达。（编译器仍会在`switch`表达式中默默地插入一个抛出默认子句，以防`Shape`的允许子类型在编译和运行时之间发生变化，但没有必要坚持程序员编写这个“以防万一”的默认子句。）这类似我们对待另一个穷尽性的来源——覆盖所有已知常量的`enum`上的`switch`表达式也不需要`default`子句（在这种情况下省略它通常是个好主意，因为这更有可能提醒我们错过了一个情况。）

像`Shape`这样的层次结构为其客户端提供一个选择：他们可完全通过抽象接口处理形状，但他们也可在有意义时“展开”抽象并通过更明确的类型进行交互。像模式匹配这样的语言特性使这种展开更易读写。

## 5 代数数据类型示例

“和积模式”可以是一种强大的模式。为了适用，它必须极不可能更改子类型列表，并且我们预见到让客户端直接区分子类型会更容易和更有用。

承诺一个固定的子类型集，并鼓励客户端直接使用这些子类型，是一种紧耦合。一般，我们被鼓励在设计中使用松耦合，以最大限度提高更改灵活性，但这种松耦合也有成本。语言中同时拥有“不透明”和“透明”抽象允许我们为特定情况选择合适工具。

一个可能会使用和积类型的地方是在`java.util.concurrent.Future`API。`Future`代表一个可能与其发起者并发运行的计算；`Future`表示的计算可能尚未开始，已开始但尚未完成，已成功完成或异常完成，已超时或被取消。`Future`的`get()`反映所有这些可能性：

```java
interface Future<V> {
    ...
    V get(long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;
}
```

- 如计算尚未完成，`get()`会阻塞直到完成模式之一发生
- 如成功，返回计算结果
- 如计算通过抛出异常完成，此异常将被包装在`ExecutionException`
- 如计算超时或被中断，将抛不同类型异常

此API非常精确，但用起来有些痛苦，因为有多个控制路径，正常路径（`get()`返回值）和许多失败路径，每个都必须在`catch`块处理：

```java
try {
    V v = future.get();
    // 处理正常完成
}
catch (TimeoutException e) {
    // 处理超时
}
catch (InterruptedException e) {
    // 处理取消
}
catch (ExecutionException e) {
    Throwable cause = e.getCause();
    // 处理任务失败
}
```

如Java 5引入`Future`时有封闭类、记录和模式匹配，可能这样定义返回类型：

```java
sealed interface AsyncReturn<V> {
    record Success<V>(V result) implements AsyncReturn<V> { }
    record Failure<V>(Throwable cause) implements AsyncReturn<V> { }
    record Timeout<V>() implements AsyncReturn<V> { }
    record Interrupted<V>() implements AsyncReturn<V> { }
}

...

interface Future<V> {
    AsyncReturn<V> get();
}
```

一个异步结果要么成功（带返回值），要么失败（带异常），要么超时，要么取消。

这是更统一描述可能结果的方式，而非通过返回值和异常分别描述其中一些结果。客户端仍须处理所有情况——无法避免任务可能失败的事实——但我们可更统一处理这些情况（更紧凑地）：

```java
AsyncResult<V> r = future.get();
switch (r) {
    case Success(var result): ...
    case Failure(Throwable cause): ...
    case Timeout(), Interrupted(): ...
}
```

## 6 和积类型是广义的枚举

理解和积类型的一个好方法是，它们是枚举的广义形式。一个枚举声明声明了一个具有穷尽常量实例集的类型：

```java
enum Planet { MERCURY, VENUS, EARTH, ... }
```

可将数据与每个常量关联，如行星的质量和半径：

```java
enum Planet {
    MERCURY (3.303e+23, 2.4397e6),
    VENUS (4.869e+24, 6.0518e6),
    EARTH (5.976e+24, 6.37814e6),
    ...
}
```

广义而言，一个封闭类枚举的不是封闭类的固定实例列表，而是固定实例类型的种类列表。如这个封闭接口列出各种类型的天体及与每种类型相关的数据：

```java
sealed interface Celestial {
    record Planet(String name, double mass, double radius)
        implements Celestial {}
    record Star(String name, double mass, double temperature)
        implements Celestial {}
    record Comet(String name, double period, LocalDateTime lastSeen)
        implements Celestial {}
}
```

正如你可穷尽地切换枚举常量，你也可以穷尽地切换各种天体类型：

```java
switch (celestial) {
    case Planet(String name, double mass, double radius): ...
    case Star(String name, double mass, double temp): ...
    case Comet(String name, double period, LocalDateTime lastSeen): ...
}
```

这种模式的例子随处可见：UI系统中的事件，面向服务系统中的返回码，协议中的消息等。

## 7 更安全的层次结构

到目前为止，我们讨论了封闭类在将*替代方案*纳入领域模型时的有用性。封闭类还有另一个完全不同的应用：安全层次结构。

Java一直允许我们通过将类标记为`final`来表示“这个类不能被扩展”。`final`存在承认了一个关于类的基本事实：有时它们被设计为可扩展，有时则不是，希望支持这两种模式。实际上，[*Effective Java*]建议我们“设计和记录用于扩展，否则禁止它”。这是很好的建议，如语言能更多帮助我们，可能更常被采纳。

可惜，语言在两方面未能帮助我们：

- 类的默认设置是可扩展，而非 final
- 并且`final`机制实际相当弱，因为它迫使作者在限制扩展和使用多态作为实现技术之间做出选择

`String`是个很好例子，平台安全性要求字符串不可变，因此`String`不能公开扩展——但对*实现*来说有多个子类型会非常方便。（解决这个问题的成本很高；[紧凑字符串]通过对仅包含`Latin-1`字符的字符串进行特殊处理，提供显著的内存占用和性能改进，但若`String`是封闭类而非final类，这会更容易和低成本。）

通过使用包私有构造函数并将所有实现放在同一包，模拟封闭类（但不是接口）效果的技巧众所周知。这有帮助，但仍不舒服，公开一个不打算扩展的公共抽象类。库作者更喜欢使用接口来公开不透明的抽象；抽象类被设计为一种实现辅助工具，而不是建模工具。（参见[Effective Java]，“优先使用接口而不是抽象类”。）

使用封闭接口，库作者无需在使用多态作为实现技术、允许不受控制的扩展或将抽象公开为接口之间做出选择——他们可三者兼得。作者可能选择让实现类可访问，但更可能的是，实现类将保持封装。

封闭类允许库作者解耦可访问性和可扩展性。拥有这种灵活性很好，但啥时应该使用它呢？当然，我们不会想要封闭像`List`这样的接口——用户创建新的`List`类型是完全合理且可取的。封闭可能有：

- 成本（用户无法创建新实现）
- 和收益（实现可以全局推理所有实现）

我们应该将封闭保留给收益超过成本时。

## 8 细则

`sealed`修饰符可用于类或接口。尝试封闭一个final类，无论：

- 显式声明的`final`修饰符
- 还是隐式final，如枚举和记录类

都是错误的。

封闭类有个`permits`列表，是唯一允许的直接子类型，它们必须：

- 在封闭类编译时可用
- 实际是封闭类的子类型
- 封闭类在同一模块（或在未命名模块中则在同一个包中）

这要求实际上意味着它们必须与封闭类*共同维护*，这是对这种紧耦合的合理要求。

若允许的子类型都在封闭类的同一编译单元中声明，可省略`permits`子句，并推断为同一编译单元中声明的所有子类型。封闭类不能用作lambda表达式的函数接口，也不能用作匿名类的基类型。

封闭类的子类型必须更明确地说明其可扩展性；封闭类的子类型须`sealed`、`final`或显式标记为`non-sealed`。（记录和枚举隐式为`final`，因此不需要显式标记。）如果类或接口没有封闭的直接超类型，标记为`non-sealed`是错误的。

将现有`final`类变为`sealed`是二进制和源代码兼容的。对于你不控制所有实现的非final类，将其封闭既不二进制兼容也不源代码兼容。将新的允许子类型添加到封闭类是二进制兼容但不源代码兼容的（这可能会破坏`switch`表达式的穷尽性）。

## 9 总结

封闭类有多种用途；它们在领域建模技术中很有用，当捕获领域模型中的穷尽替代方案时；在解耦可访问性和可扩展性时，它们也是有用的实现技术。封闭类型是[记录]的自然补充，因为它们共同形成了一种称为*代数数据类型*的常见模式；它们也是[模式匹配]的自然契合。