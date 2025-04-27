# JDK24新特性

![](https://www.oracle.com/a/pr/img/rc24-java24.jpg)

Java 24有 20 多项新功能，包括新的 AI 和后量子密码功能，为开发人员提供构建 AI 应用所需的工具。

## 1 语言特性

- **[JEP 488](https://openjdk.org/jeps/488):** Primitive Types in Patterns, instanceof, and switch（第二预览版）— 使语言更统一且更具表达能力，帮助开发消除在使用模式匹配、instanceof 和 switch 时遇到的基元类型的限制，从而增强模式匹配。在所有模式上下文中支持基元类型模式，并扩展 instanceof 和 switch，使其能够与所有基元类型一起使用。集成 AI 推理的开发将能从原始类型支持大大受益
- **[JEP 492](https://openjdk.org/jeps/492):** Flexible Constructor Bodies（第三预览版）— 在构造函数主体中引入两个不同的序言和表述阶段，提高代码可靠性。开发能更自然将他们当前必须考虑的逻辑融入辅助静态方法、辅助中间构造函数或构造函数参数。保留了现有的保证，即子类构造函数中的代码不能干扰超类实例化，能够在重写方法时使类更加可靠。这个方法不必创建私人助手，仅需一行代码就可以调用 this/super，非常好用。流收集器功能也很有趣，期待库能想出许多可供借鉴的新的中间操作
- **[JEP 494](https://openjdk.org/jeps/494):** Module Import Declarations（第二预览版）— 开发可轻松导入由模块导出的所有程序包，无需将导入代码放到模块中，提高工作效率。简化所有开发对模块化库的重用，让初学者轻松用第三方库和基本 Java 类，无需了解它们在程序包层次结构中的位置。帮助开发快速将业务逻辑与原生 AI 推理、库或服务调用集成
- **[JEP 495](https://openjdk.org/jeps/495):** Simple Source Files and Instance Main Methods（第四预览版）— 帮助学生无需了解为大型程序而设计的语言功能，即可顺利编写第一个程序，加快了上手 Java 编程的速度。有鉴于此，教育工作者和导师可以循序渐进地介绍概念，学生也可以编写简化的单类程序声明，并随着个人技能的提升，无缝扩展程序并使用更高级的功能。此外，经验丰富的 Java 开发人员也可以以简洁而高效的方式编写小程序，无需使用为大型项目设计的工具。

## 2 库

- **[JEP 485](https://openjdk.org/jeps/485):** Stream Gatherers — 通过增强 Stream API 来支持自定义中间操作，让流管道以现有内置中间操作无法轻松实现的方式转换数据，从而帮助开发人员提高阅读、编写和维护 Java 代码的效率。
- **[JEP 484](https://openjdk.org/jeps/484):** Class-File API — 通过提供用于解析、生成和转换 Java 类文件的标准 API，以及跟踪 Java Virtual Machine 规范定义的类文件格式，帮助开发人员提高工作效率。
- **[JEP 487](https://openjdk.org/jeps/487):** Scoped Values（第四预览版）— 支持开发人员在线程内和线程之间共享不可变数据，从而提高项目的易用性、可理解性、性能和稳健性。
- **[JEP 489](https://openjdk.org/jeps/489):** Vector API （九次孵化阶段）— 新推出的 API 允许以一种在运行时，可靠地编译为支持的 CPU 架构上的向量指令方式表达向量计算，帮助开发人员提高生产力。因此，开发人员可以实现优于等效标量计算的表现，这些计算通常用于 AI 推理和计算场景。
- **[JEP 499](https://openjdk.org/jeps/499):** Structured Concurrency（第四预览版）— 通过面向结构化并发的新 API 简化并发编程，帮助开发人员提高多线程代码的可维护性、可靠性和可观察性。通过将在不同线程中运行的相关任务组视为单个工作单元，结构化并发可以减少因取消和关闭而产生的常见风险，例如线程泄漏和取消延迟。

## 3 安全库

- **[JEP 478](https://openjdk.org/jeps/478):** Key Derivation Function API（预览版）— 通过为传输中的数据提供加密安全，帮助开发人员为新兴的量子计算环境做好准备。这有助于提高保密性和通信完整性。
- **[JEP 496](https://openjdk.org/jeps/496):** Quantum-Resistant Module-Lattice-Based Key Encapsulation Mechanism — 支持实施抗量子的基于模块晶格的密钥封装机制 (ML-KEM)，帮助提高 Java 应用的安全性。此功能是 Java 平台朝着后量子就绪以及最终交付后量子加密 (PQC) 技术支持迈出的重要一步，因为密钥封装机制用于通过公钥加密技术通过不安全的通信通道保护对称密钥。
- **[JEP 497](https://openjdk.org/jeps/497):** Quantum-Resistant Module-Lattice-Based Digital Signature Algorithm — 支持实施抗量子的基于模块晶格的数字签名算法 (ML-DSA)，帮助提高 Java 应用的安全性。与 JEP 496 一样，此功能是 Java 平台迈向后量子就绪以及最终交付 PQC 技术支持的重要举措，因为数字签名主要用于检测未经授权的数据修改和验证签字人的身份。ML-DSA 旨在防止未来的量子计算攻击，目前已被美国国家标准与技术研究所 (NIST) 列为 FIPS 204 中的标准化项目。

## 4 工具

- **[JEP 493](https://openjdk.org/jeps/493):** Linking Run-Time Images without JMODs — jlink 工具无需使用 JDK 的 JMOD 文件，即可创建定制运行时映像，能够将 JDK 的大小缩减约 25%，进而帮助开发人员提高效率。有鉴于此，开发人员可以从模块链接运行时映像，无论这些模块是独立的 JMOD 文件、模块化 JAR 文件还是以前链接的运行时映像的一部分。构建 JDK 时必须启用此功能；此功能不会默认启用，某些 JDK 供应商可以选择不启用此功能。

## 5 性能和运行时更新

- **[JEP 450](https://openjdk.org/jeps/450):** Compact Object Headers（实验版） — 在 64 位架构上，将 HotSpot JVM 中的对象标头大小从 96 位和 128 位缩减至 64 位，帮助开发人员提高工作效率。有助减少堆大小、提高部署密度和增加数据局部性
- **[JEP 475](https://openjdk.org/jeps/475):** Late Barrier Extension for G1 — 通过将 G1 垃圾收集器屏障从早期的 C2 JIT 编译管道扩展切换到后期屏障扩展，这意味着如果该项操作在独立于平台的优化和寄存器分配之后发生，就可以降低开销，还可以帮助开发人员提高效率。通过简化 G1 垃圾收集器屏障的实施，此功能有助于提高 C2 生成的代码的效率、可理解性、可恢复性和质量
- **[JEP 483](https://openjdk.org/jeps/483):** Ahead-of-Time Class Loading & Linking — 在 HotSpot Java Virtual Machine 启动时，使应用的类在加载和链接状态下立即可用，从而帮助开发人员提高工作效率并缩短启动时间。此功能不需要使用 jlink 或 jpackage 工具，不需要对从命令行启动应用的方式进行任何更改，也不需要对应用、库或框架的代码进行任何更改。因此，该功能有助于为启动和预热时间的持续进步奠定基础。
- **[JEP 490](https://openjdk.org/jeps/490):** ZGC: Remove the Non-Generational Mode — 通过删除 Z Garbage Collector (ZGC) 的非分代模式，帮助开发人员降低支持两种不同模式的维护成本
- **[JEP 491](https://openjdk.org/jeps/491):** Synchronize Virtual Threads without Pinning — 提高使用同步方法和语句的 Java 代码和库的可扩展性，帮助开发人员提高工作效率。该功能允许虚拟线程释放其底层平台线程，让开发人员能够访问更多的虚拟线程来管理其应用的工作负载

## 6 源代码

- **[JEP 404](https://openjdk.org/jeps/404):** Generational Shenandoah（实验版） — 通过实验性的分代收集功能增强 Shenandoah 垃圾收集器，以提高可持续吞吐量、负载峰值抵抗力和内存利用率，帮助开发人员提高工作效率。
- **[JEP 479](https://openjdk.org/jeps/479):** Remove the Windows 32-bit x86 Port — 删除对 Windows 32 位 x86 端口的源代码和构建支持，简化了 JDK 的构建和测试架构，帮助开发人员提高效率。
- **[JEP 501](https://openjdk.org/jeps/501):** Deprecate the 32-bit x86 Port for Removal — 弃用 32 位 x86 端口，以便能够在接下来的版本中删除该端口，帮助开发人员提高工作效率。开发人员无需实施 32 位 x86 回退，即可访问需要特定平台支持的新功能。

通过引入安全的现代化特性，同时逐渐弃用和删除不安全的特性，Oracle 强调致力于保持 Java 的完整性并遵循软件开发优秀实践。

Oracle 即将在接下来的 Java 版本中删除这三个特性：

-  [JEP 472](https://openjdk.org/jeps/472): Prepare to Restrict the Use of JNI;
-  [JEP 486](https://openjdk.org/jeps/486): Permanently Disable the Security Manager;
-  [JEP 498](https://openjdk.org/jeps/498): Warn upon Use of Memory-Access Methods in sun.misc.Unsafe

## 7 大佬们的观点

NYJavaSIG 董事长 Frank Greco 表示：“我期待能够使用 Java 24 中进一步完善的 Java Vector API，进一步增强预测和生成式 AI 应用。直接在 Java 中启用高效的 AI 算法，有助于确保 AI 应用在各种现代硬件平台中高效运行和可扩展。”

XDEV Software GmbH 首席执行官 Richard Fichtner 表示：“Java 24 推出了 Stream Gatherers，这是一个强大的增强功能，可帮助开发人员对流中的元素分组和处理方式进行细粒度控制。这使得复杂的数据转换更具表现力和效率。我喜欢这个功能，它支持更可读和可维护的流管道，我们再也无需使用自定义收集器或 flatMap 体操等解决方法。”

[Java 24](https://openjdk.org/projects/jdk/24/)通过改进，如[简单源文件和实例主方法](https://openjdk.org/jeps/495)、[模式、instanceof和switch中的原始类型](https://openjdk.org/jeps/488)、[模块导入声明](https://openjdk.org/jeps/494)、[灵活的构造函数体](https://openjdk.org/jeps/492)以及API增强，如[流收集器](https://openjdk.org/jeps/485)等，继续增强语言功能——还有很多其他功能。

## 8 简单源文件和实例主方法（JEP 495）

隐式类和导入语句、更短的`main()`方法、“`println()`”用于输出值——这些功能使初学者更容易开始使用Java。如果你是一位经验丰富的开发人员，这些功能可以帮助你用更少的代码行创建脚本、游戏和实用工具。

—[Java 24：“HelloWorld”和“main()”邂逅极简主义](https://blog.jetbrains.com/idea/2024/02/helloworld-and-main-meet-minimalistic/)，以及详细博文——[Java 24：构建游戏、原型、实用工具等——减少样板代码](https://blog.jetbrains.com/idea/2025/02/java-24-build-games-prototypes-utilities-and-more-with-less-boilerplate/)，其中讨论了它的实际用例。帮助新开发人员开始编写程序，如[简单计算](https://blog.jetbrains.com/idea/2024/02/helloworld-and-main-meet-minimalistic/#example-1.-variable-declarations)、[打印模式](https://blog.jetbrains.com/idea/2024/02/helloworld-and-main-meet-minimalistic/#example-2.-print-patterns)（例如，使用指定字符打印大写字母），创建[简单的控制台和基于GUI的游戏](https://blog.jetbrains.com/idea/2025/02/java-24-build-games-prototypes-utilities-and-more-with-less-boilerplate/#1.-build-games-and-create-interesting-graphics)，还可以帮助经验丰富的开发人员创建实用工具，如[处理文件](https://blog.jetbrains.com/idea/2025/02/java-24-build-games-prototypes-utilities-and-more-with-less-boilerplate/#2.-processing-log-files)或[访问网络资源](https://blog.jetbrains.com/idea/2025/02/java-24-build-games-prototypes-utilities-and-more-with-less-boilerplate/#3.-building-utilities)（例如，股票价格爬虫）。

### 创建具有实例主方法的简单源文件

当你使用IntelliJ IDEA创建和运行简单的文件时，你可以像运行其他可执行类一样运行它（省去了你必须使用的编译或运行时命令行参数）。如果你忘记了将语言级别设置为24，IntelliJ IDEA可以检测到这一点，并提示你进行设置（如下所示）：

![](https://blog.jetbrains.com/wp-content/uploads/2025/02/new-proj.gif)

### 将隐式类转换为常规类

当你准备好升级并使用其他概念（如用户定义的类）时，你可能希望将隐式类转换为常规类。你可以使用上下文操作“*将隐式声明的类转换为常规类*”，如下所示（此操作将添加相关的导入语句）：

![](https://blog.jetbrains.com/wp-content/uploads/2025/02/convert-to-reg-class.gif)

### 将常规类转换为隐式类

有时，一个打包的类可能更适合作为隐式类，因为它可能没有使用常规类的概念。如果是这样，你可以通过使用操作“*转换为隐式声明的类*”来实现（如下所示）。在转换过程中，IntelliJ IDEA将移除不再需要的导入语句：

![](https://blog.jetbrains.com/wp-content/uploads/2025/03/explicit-to-implicit.gif)

### 幕后——具有实例方法main()的隐式类

幕后，Java编译器会创建一个隐式顶层类，并提供一个无参构造函数，这样这些类就不需要以与常规类不同的方式处理。

通过IntelliJ IDEA的反编译器功能为源代码文件*AnimateText.java*反编译的类：

![](https://blog.jetbrains.com/wp-content/uploads/2024/02/decompile.gif)

### 与控制台交互——println()与System.out.println()调用

为了简化新开发人员与控制台的交互，即向控制台输出消息以及从中读取输入，Java 23中创建了一个新类——`java.io.IO`。它只包含少量重载的`readln()`和`println()`方法（如下所示）：

![img](https://blog.jetbrains.com/wp-content/uploads/2025/02/IO-class-struc.png)

`java.io.IO`类会自动导入到隐式类中。因此，你现在可以使用`println()`向控制台输出消息（并使用`readln()`从中读取），而无需使用`System.out.println()`。有趣的是，`println()`是在Java 24中添加到这个类中的。

### 隐式类中重载的main方法

当你在隐式类中重载`main()`方法时，需要考虑一个优先顺序，以确定哪个是“主”`main()`方法。以下是隐式类中`main()`方法的有效签名：

- `public static void main(String args[]) {}`
- `public void main(String args[]) {}`
- `public static void main() {}`
- `static void main() {}`
- `public void main() {}`
- `void main() {}`

如果你的隐式类中重载了`main()`方法，IntelliJ IDEA会在正确的或首选的“main”方法旁边显示运行图标：

![img](https://blog.jetbrains.com/wp-content/uploads/2025/03/which-main.gif)

### 隐式类中缺少main方法

如果在隐式类中未检测到有效的`main`方法，IntelliJ IDEA可以为你添加一个，如下图所示：

![img](https://blog.jetbrains.com/wp-content/uploads/2024/02/create-a-main-method.gif)

## 9 模式中的原始类型、instanceof和switch（预览功能）

目前正处于第二次预览中，该功能[模式中的原始类型、instanceof和switch](https://openjdk.org/jeps/488)通过在所有模式中引入原始类型，增强了Java的模式匹配能力。这允许你直接在`instanceof`和`switch`表达式中使用原始类型模式（以前仅限于对象），简化代码并减少手动类型转换的需求。

### 快速示例

此功能使你能够在带有守护模式的`switch`表达式中使用原始类型：

```java
public String getHTTPCodeDesc(int code) {
    return switch (code) {
        case 100 -> "Continue";
        case 200 -> "OK";
        case 301 -> "Moved Permanently";
        case 302 -> "Found";
        case 400 -> "Bad Request";
        case 500 -> "Internal Server Error";
        case 502 -> "Bad Gateway";
        case int i when i > 100 && i < 200 -> "Informational";
        case int i when i > 200 && i < 300 -> "Successful";
        case int i when i > 302 && i < 400 -> "Redirection";
        case int i when i > 400 && i < 500 -> "Client Error";
        case int i when i > 502 && i < 600 -> "Server Error";
        default -> "Unknown error";
    };
}
```

同样，你也可以在`instanceof`操作符中使用原始类型。

此功能再次作为预览功能推出，没有任何变化。我在之前的博文——[Java 23和IntelliJ IDEA](https://blog.jetbrains.com/idea/2024/09/java-23-and-intellij-idea/#primitive-types-in-patterns)中介绍了此功能以及IntelliJ IDEA对它的支持。我建议你查看该博文以了解详细信息。这篇博文回答了诸如将原始类型添加到模式匹配意味着什么、多个示例以及IntelliJ IDEA中的[强大数据流分析](https://blog.jetbrains.com/idea/2024/09/java-23-and-intellij-idea/#robust-data-flow-analysis-in-intellij-idea)等问题。

### 与该功能的创造者进行访谈

我们还采访了该功能的所有者，[Aggelos Biboudis](https://x.com/biboudis)（Oracle的首席技术员工）、[Brian Goetz](https://x.com/BrianGoetz)（Oracle的Java语言架构师）和[Tagir Valeev](https://x.com/tagir_valeev)（JetBrains的Java团队技术主管）。

<iframe title="JEP Explained. JEP 455: Primitive Types in Patterns, instanceof, and switch" width="500" height="281" src="https://www.youtube.com/embed/tqBV4MZ-qSM?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" style="box-sizing: inherit; max-height: 100%; max-width: 100%; position: absolute; top: 0px; left: 0px; width: 849px; height: 477.138px;"></iframe>

查看该视频，了解为什么将原始数据类型添加到Java语言中以及他们提议的变更细节。

## 10 模块导入声明

处于第二次预览阶段的[模块导入声明](https://openjdk.org/jeps/494)使你能够通过单个声明导入模块导出的所有包。它简化了模块化库的重用，而无需要求导入代码自身模块化。例如，声明`import module java.base;`会导入`java.base`模块导出的包中的所有公共顶层类和接口，消除了多个单独导入语句的需求。这提高了代码的可读性，尤其是在使用大量API时。

### 快速示例

假设你的代码包含多个导入语句，如下所示：

```java
import java.io.*;
import java.util.HashMap;
import java.util.Map;
import java.lang.reflect.*;
import java.nio.*;
```

这些可以被一个导入模块语句替换，如下所示：

```java
import java.base.*;
```

### 模块java.base（或其他模块）导出了哪些包？

当你使用IntelliJ IDEA时，回答这个问题非常简单。点击编辑器中的模块名称或使用相关快捷键（转到声明或用法），你可以查看该模块的定义，以了解该模块导出了哪些模块。如下图所示：

![img](https://blog.jetbrains.com/wp-content/uploads/2025/03/java-base-mod.gif)

### 与该功能的创造者进行访谈

我们还采访了该功能的所有者，[GavinBierman](https://x.com/GavinBierman)（Oracle的编程语言设计师）。

<iframe loading="lazy" title="JEP Explained. JEP 476: Module Import Declarations" width="500" height="281" src="https://www.youtube.com/embed/mSYA3cZ5o6c?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" style="box-sizing: inherit; max-height: 100%; max-width: 100%; position: absolute; top: 0px; left: 0px; width: 849px; height: 477.138px;"></iframe>

Gavin介绍了单类型导入和类型导入按需声明的区别，解释了它们是什么以及为什么个人和组织更倾向于一种风格而不是另一种。他还谈到了“模块导入声明”功能如何自动从模块的传递依赖项中按需导入。他涵盖了如何处理模糊导入、名称模糊性以及如何向OpenJDK团队提交有关此功能的反馈。

## 11 灵活的构造函数体

处于第三次预览阶段的此功能在超类从其构造函数中调用方法时非常有用，你希望在子类中覆盖此方法，并希望在该方法中访问子类中的字段。以前，在从超类构造函数中调用方法时，子类字段尚未初始化。现在可以初始化字段并防止意外情况发生。以下示例代码展示了此功能：

```java
abstract class Action {
    public Action() {
        System.out.println("performing " + getText());
    }
    public abstract String getText();
}

class DoubleAction extends Action {
    private final String text;
    private DoubleAction(String text) {
        this.text = text; // 在Java 23之前，启用预览功能时，这无法编译。
        super();
    }
    @Override public String getText() {
        return text + text;
    }
}
```

如果你是第一次接触这个功能，不要错过我的详细博文——[Java 22中的构造函数改造 | IntelliJ IDEA博客](https://blog.jetbrains.com/idea/2024/02/constructor-makeover-in-java-22/)，其中讨论了这个功能的来龙去脉。

## 12 预览功能

这篇博文中介绍的功能都是预览功能，而不是生产功能。随着Java六个月的新发布周期，新语言功能作为预览功能发布。它们可能会在后续的Java版本中以第二次或更多次预览的形式重新引入，可能会有也可能没有变化。一旦它们足够稳定，可能会作为标准语言功能添加到Java中。

预览语言功能是完整的，但不是永久的，这意味着这些功能已经准备好供开发人员使用，尽管它们的细节可能会根据开发人员的反馈在未来版本的Java中发生变化。与API不同，语言功能在未来无法被弃用。因此，如果你对任何预览语言功能有反馈，请随时在JDK邮件列表上分享（需要免费注册）。

由于这些功能的工作方式，IntelliJ IDEA致力于仅支持当前JDK的预览功能。预览语言功能可能会在Java版本之间发生变化，直到它们被放弃或作为标准语言功能添加。使用较旧版本的Java SE平台的预览语言功能的代码可能无法在较新的版本上编译或运行。

## 13 总结

Java 24引入了关键增强功能，如简单源文件、原始类型模式、模块导入声明和灵活的构造函数体。IntelliJ IDEA自较早的版本开始就支持Java 24，并且后续版本还会增加更多增强功能！

参考：

- https://blogs.oracle.com/java/post/the-arrival-of-java-24
- https://blog.jetbrains.com/idea/2025/03/java-24-and-intellij-idea/