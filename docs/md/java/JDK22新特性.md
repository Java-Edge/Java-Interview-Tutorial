# JDK22新特性

Java 22发布大吉！

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/7bbb5156bb9aa5b2af3f27216d310f2b.png)

又是一个重大进步，值得升级的版本。有些重大的最终发布功能，如Project Panama及一系列更优秀的预览功能。不可能覆盖全部，但确实想谈谈我最喜爱的。将涉及许多功能。想在家跟着做，代码[在这](https://github.com/Java-Edge/java22.git)。

我爱Java 22，当然，我也爱 GraalVM，它们都在发布新版本！Java 当然是我们最喜爱的运行时和语言，而 GraalVM 是一个高性能的 JDK 发行版，它支持更多语言并允许提前编译（称 GraalVM native images）。GraalVM 包含了 Java 22 新版的所有好东西，还有一些额外的工具，所以我总是推荐下载那个版本。我特别感兴趣的是 GraalVM native image。生成的二进制文件几乎可以立即启动，并且与它们的 JRE 相比，消耗的 RAM 明显少。GraalVM 不是新事物，但值得记住的是，Spring Boot 有一个很棒的引擎，支持将你的 Spring Boot 应用程序转化为 GraalVM native images。

## 1 安装

我正在使用一个出色的 Java 包管理器 [SDKMAN](https://sdkman.io/)。我还在运行带有 macOS 的 Apple Silicon 芯片。所以，这个事实和我喜欢并鼓励使用 GraalVM 的事实稍后会有些重要，所以不要忘了。将会有测试！

```plaintext
sdk install java 22-graalce
```

我还会设置它为你的默认选择：

```plaintext
sdk default java 22-graalce
```

在继续之前，打开一个新的 shell，然后通过运行 `javac --version`，`java --version`，和 `native-image --version` 来验证一切是否正常。

如果你是在遥远的未来阅读这篇文章的（我们已经有飞行汽车了吗？）而且有 `50-graalce`，那么就尽情安装那个版本！版本越新越好！

## 2 你总得从某处开始...

在这一点上，我想要开始构建了！所以，我去了互联网上第二喜欢的地方，Spring Initializr - [start.spring.io](https://start.spring.io/) - 并生成了一个新的项目，使用以下规格：

- 我选择了 `3.3.0-snapshot` 版本的 Spring Boot。3.3 还没有正式发行，但应该在短短几个月内就会。与此同时，不断前进！这个版本对 Java 22 有更好的支持。
- 我选择了 `Maven` 作为构建工具。
- 我添加了 `GraalVM Native Support` 支持，`H2 Database`，和 `JDBC API` 支持。

我在我的 IDE 中打开了项目，像这样：`idea pom.xml`。现在我需要配置一些 Maven 插件以支持 Java 22 和一些我们将在本文中看到的预览功能。这是我的完整配置的 `pom.xml`。它有点密集，所以我会在代码结束后来介绍一下。

```xml
COPY<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.0-SNAPSHOT</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>demo</name>
    <description>Demo project for Spring Boot</description>
    <properties>
        <java.version>22</java.version>
    </properties>
    <dependencies>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.graalvm.sdk</groupId>
            <artifactId>graal-sdk</artifactId>
            <version>23.1.2</version>
        </dependency>
        <dependency>
            <groupId>org.graalvm.nativeimage</groupId>
            <artifactId>svm</artifactId>

 <version>23.1.2</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.graalvm.buildtools</groupId>
                <artifactId>native-maven-plugin</artifactId>
                <version>0.10.1</version>
                <configuration>
                    <buildArgs>
                        <buildArg> --features=com.example.demo.DemoFeature</buildArg>
                        <buildArg> --enable-native-access=ALL-UNNAMED </buildArg>
                        <buildArg> -H:+ForeignAPISupport</buildArg>
                        <buildArg> -H:+UnlockExperimentalVMOptions</buildArg>
                        <buildArg> --enable-preview</buildArg>
                    </buildArgs>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <configuration>
                    <argLine>--enable-preview</argLine>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <enablePreview>true</enablePreview>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <compilerArguments> --enable-preview </compilerArguments>
                    <jvmArguments> --enable-preview</jvmArguments>
                </configuration>
            </plugin>
            <plugin>
            <groupId>io.spring.javaformat</groupId>
            <artifactId>spring-javaformat-maven-plugin</artifactId>
            <version>0.0.41</version>
            <executions>
                <execution>
                    <phase>validate</phase>
                    <inherited>true</inherited>
                    <goals>
                        <goal>validate</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        </plugins>
    </build>
    <repositories>
    <repository>
            <id>spring-milestones</id>
            <name>Spring Milestones</name>
            <url>https://repo.spring.io/milestone</url>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
        <repository>
            <id>spring-snapshots</id>
            <name>Spring Snapshots</name>
            <url>https://repo.spring.io/snapshot</url>
            <releases>
                <enabled>false</enabled>
            </releases>
        </pository>
    </repositories>
    <pluginRepositories>
        <pluginRepository>
            <id>spring-milestones</id>
            <name>Spring Milestones</name>
            <url>https://repo.spring.io/milestone</url>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </pluginRepository>
        <pluginRepository>
            <id>spring-snapshots</id>
            <name>Spring Snapshots</name>
            <url>https://repo.spring.io/snapshot</url>
            <releases>
                <enabled>false</enabled>
            </releases>
        </pluginRepository>
    </pluginRepositories>
</project>
```

我知道，我知道！很多！但实际上并不是这样。这个 `pom.xml` 几乎和我从 Spring Initializr 获取的一模一样。主要改变：

- 重新定义 `maven-surefire-plugin` 和 `maven-compiler-plugin` 支持预览功能。
- 添加 `spring-javaformat-maven-plugin` 用来支持格式化我的源代码。
- 添加两个新依赖项：`org.graalvm.sdk:graal-sdk:23.1.2` 和 `org.graalvm.nativeimage:svm:23.1.2`，都是专门为后面我们将需要的 GraalVM `Feature` 实现创建的
- 在 `native-maven-plugin` 和 `spring-boot-maven-plugin` 的 `<configuration>` 部分添加了配置节

非常快就到了，Spring Boot 3.3 将会正式发布并支持 Java 22，所以可能这个构建文件的一半会消失。

## 3 编程快速说明

 `LanguageDemonstrationRunner` ，一个功能性接口，声明可抛 `Throwable`。

```java
package com.example.demo;

@FunctionalInterface
interface LanguageDemonstrationRunner {

    void run() throws Throwable;

}
```

我还有一个 `ApplicationRunner`，反过来，它注入了我所有的功能接口实现，然后调用它们的 `run` 方法，捕获并处理 `Throwable`。

```java
    // ...	
    @Bean
    ApplicationRunner demo(Map<String, LanguageDemonstrationRunner> demos) {
        return _ -> demos.forEach((_, demo) -> {
            try {
                demo.run();
            } //
            catch (Throwable e) {
                throw new RuntimeException(e);
            }
        });
    }
    // ...
```

## 4 再见，JNI！

终于等待已久的 [Project Panama](https://openjdk.org/projects/panama) 的发布。最期待的三个特性之一，另外两特性：

- 虚拟线程
- GraalVM native images

它们至少已经成为现实六个月了。Project Panama 是让我们能够利用长期以来被拒之门外的 C 和 C++ 代码的星系。回想起来，如果它支持 [ELF](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format)，我想象。例如 Rust 和 Go 程序可以编译成与 C 兼容的二进制文件，所以我想象（但没有尝试过）这意味着与这些语言的互操作也足够容易。在本节中，当我提到“原生代码”时，我指的是以某种方式编译的二进制文件，它们可以像 C 库那样被调用。

从历史上看，Java 一直是孤立的。对于 Java 开发人员来说，重新使用原生 C 和 C++ 代码并不容易。这是有道理的。原生、特定于操作系统的代码只会破坏 Java 的“一次编写，到处运行”的承诺。它一直是有点禁忌的。但我不明白为什么会这样。公平地说，尽管缺乏易用的原生代码互操作功能，我们也做得不错。几乎任何你想要做的事情，可能都有一个纯 Java 解决方案存在，它可以在 Java 运行的任何地方运行。它运行得很好，直到它不再运行。Java 在这里错过了关键的机会。想象一下：

- 如果 Kubernetes 是用 Java 构建的？
- 如果当前的 AI 革命是由 Java 驱动的？

这两个概念会不可思议，当 Numpy、Scipy 和 Kubernetes 最初创建时，但是今天？今天，他们发布了 Panama 项目。

Panama 项目引入了一种容易连接原生代码的方法。支持两个级别。你可以以相当低级的方式操纵内存，并将数据在原生代码中来回传递。我说“来回”，但我可能应该说“向下和向上”到原生代码。Panama 项目支持“向下调用”，即从 Java 调用原生代码，以及“向上调用”，即从原生代码调用 Java。你可以调用函数、分配和释放内存、读取和更新 `struct` 中的字段等等。

让我们来看一个简单的例子。代码使用新的 `java.lang.foreign.*` API 查找一个叫做 `printf` 的符号（基本上就是 `System.out.print()`），分配内存（有点像 `malloc`）缓冲区，然后将该缓冲区传递给 `printf` 函数。

```java
package com.example.demo;

import org.springframework.stereotype.Component;

import java.lang.foreign.Arena;
import java.lang.foreign.FunctionDescriptor;
import java.lang.foreign.Linker;
import java.lang.foreign.SymbolLookup;
import java.util.Objects;

import static java.lang.foreign.ValueLayout.ADDRESS;
import static java.lang.foreign.ValueLayout.JAVA_INT;

@Component
class ManualFfi implements LanguageDemonstrationRunner {

    // 这是包私有的，因为我们稍后会需要它
    static final FunctionDescriptor PRINTF_FUNCTION_DESCRIPTOR =
            FunctionDescriptor.of(JAVA_INT, ADDRESS);

    private final SymbolLookup symbolLookup;

    // SymbolLookup 是 Panama API，但我有一个我正在注入的实现
    ManualFfi(SymbolLookup symbolLookup) {
        this.symbolLookup = symbolLookup;
    }

    @Override
    public void run() throws Throwable {
        var symbolName = "printf";
        var nativeLinker = Linker.nativeLinker();
        var methodHandle = this.symbolLookup.find(symbolName)
            .map(symbolSegment -> nativeLinker.downcallHandle(symbolSegment, PRINTF_FUNCTION_DESCRIPTOR))
            .orElse(null);
        try (var arena = Arena.ofConfined()) {
            var cString = arena.allocateFrom("hello, Panama!");
            Objects.requireNonNull(methodHandle).invoke(cString);
        }
    }

}
```

这是我提出的 `SymbolLookup` 的定义。它是一种复合体，尝试一个 `SymbolLookup`，如果第一个失败，则尝试另一个。

```java
@Bean
SymbolLookup symbolLookup() {
    var loaderLookup = SymbolLookup.loaderLookup();
    var stdlibLookup = Linker.nativeLinker().defaultLookup();
    return name -> loaderLookup.find(name).or(() -> stdlibLookup.find(name));
}
```

运行这个，你会看到它打印出 `hello, Panama!`.

您可能想知道为什么我没有选择更有趣的例子。事实证明，在所有os中你既能理所当然地享有，在计算机上也能感知到自己做了些什么的东西几乎没有。IO 似乎是我能想到的所有东西，而且控制台 IO 更容易理解。

但 GraalVM 原生镜像咋样呢？它并不支持你可能想做的*每件*事。至少目前，它不在苹果芯片运行，只在 x86 芯片。我开发了这个例子，并设置[了 GitHub 操作](spring-tips/java22/main/.github/workflows/maven.yml)在 x86 Linux 环境中查看结果。对于我们这些不使用英特尔芯片的 Mac 开发者来说，这有点遗憾，但我们大多数人不是将产品部署到苹果设备上，我们是部署到 Linux 和 x86 上，所以这不是一个破坏协议的事情。

还有一些其他[限制](https://github.com/oracle/graal/blob/master/docs/reference-manual/native-image/ForeignInterface.md)。如GraalVM 原生映像仅支持我们复合中的第一个 `SymbolLookup`, `loaderLookup`。如果那个不起作用，那么它们都将不起作用。

GraalVM 想要知道你在运行时会做的一些动态事情，包括外部函数调用。你需要提前告诉它。对于其他需要此类信息的大多数事情，如反射、序列化、资源加载等，你需要编写 `.json` 配置文件（或让 Spring 的 AOT 引擎为你编写）。这个特性是如此新，以至于你必须走下几个抽象层次并编写一个 GraalVM `Feature` 类。`Feature` 有回调方法，在 GraalVM 的本地编译生命周期中被调用。你将告诉 GraalVM 我们最终会在运行时调用的原生函数的签名，即*形态*。这是 `Feature`。只有一行价值。

```java
package com.example.demo;

import org.graalvm.nativeimage.hosted.Feature;
import org.graalvm.nativeimage.hosted.RuntimeForeignAccess;

import static com.example.demo.ManualFfi.PRINTF_FUNCTION_DESCRIPTOR;

public class DemoFeature implements Feature {

    @Override
    public void duringSetup(DuringSetupAccess access) {
        // 这是唯一重要的一行。注意：我们正在分享
        // 我们稍早从 ManualFfi bean 中的 PRINTF_FUNCTION_DESCRIPTOR。
        RuntimeForeignAccess.registerForDowncall(PRINTF_FUNCTION_DESCRIPTOR);
    }

}
```

然后我们需要连接所有的特性，通过将 `--features` 属性传递给 GraalVM 原生图像 Maven 插件配置来告知 GraalVM。我们还需要解锁外部 API 支持和解锁实验性事物。（我不知道为什么在 GraalVM 原生镜像中这是实验性的，而在 Java 22 本身中它不再是实验性的）。还需要告诉 GraalVM 允许所有未命名类型的原生访问。所以，总的来说，这是最终的 Maven 插件配置。

```xml
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
    <version>0.10.1</version>
    <configuration>
        <buildArgs>
            <buildArg>--features=com.example.demo.DemoFeature</buildArg>
            <buildArg>--enable-native-access=ALL-UNNAMED</buildArg>
            <buildArg>-H:+ForeignAPISupport</buildArg>
            <buildArg>-H:+UnlockExperimentalVMOptions</buildArg>
            <buildArg>--enable-preview</buildArg>
        </buildArgs>
    </configuration>
</plugin>
```

这是一个了不起的结果。我将这个示例中的代码编译成一个在 GitHub Actions 运行中的 GraalVM 原生图像然后执行它。应用程式，我提醒您 - 具有 Spring JDBC 支持、完整和嵌入式 SQL 99 兼容的 Java 数据库叫做 H2，以及类路径上的所有内容 - 在 0.031 秒（31 毫秒，或 31 千分之一秒）内执行，占用数十兆字节的 RAM，并从 GraalVM 原生镜像调用原生 C 代码！

我真的很高兴，大家。我已经等这一天很久了。

但这确实感觉有点低级。归根到底，你在使用一个 Java API 来以编程方式创建和维护原生代码中的结构。这有点像使用 JDBC 中的 SQL。JDBC 允许你在 Java 中操纵 SQL 数据库记录，但你不是在 Java 中编写 SQL 并在 Java 中编译它并在 SQL 中执行它。存在一个抽象增量；你将字符串发送到 SQL 引擎，然后以 `ResultSet` 对象的形式获取回来的记录。Panama 中的低级 API 也是如此。它起作用，但你没有调用原生代码，你正在查找符号和操纵内存。

所以，他们发布了一个与之分离但相关的工具叫做 `jextract`。你可以指向一个 C 头文件，如 `stdio.h`，`printf` 函数定义在其中，它会生成模仿底层 C 代码调用签名的 Java 代码。我没有在这个示例中使用它，因为生成的 Java 代码最终与底层平台绑定。我指它去 `stdio.h` 并获得了很多 macOS 特定的定义。我可以隐藏所有这些在运行时检查操作系统的后面，然后动态加载特定的实现，但是，嗯，这篇博客已经太长了。如果你想看怎么运行 `jextract`，这是我用的可以在 macOS 和 Linux 上工作的 bash 脚本。你的里程可能会有所不同。

```bash
#!/usr/bin/env bash
LINUX=https://download.java.net/java/early_access/jextract/22/3/openjdk-22-jextract+3-13_linux-x64_bin.tar.gz
MACOS=https://download.java.net/java/early_access/jextract/22/3/openjdk-22-jextract+3-13_macos-x64_bin.tar.gz

OS=$(uname)

DL=""
STDIO=""

if [ "$OS" = "Darwin" ]; then
    DL="$MACOS"
    STDIO=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/stdio.h
elif [ "$OS" = "Linux" ]; then
    DL=$LINUX
    STDIO=/usr/include/stdio.h
else
    echo "Are you running on Windows? This might work inside the Windows Subsystem for Linux, but I haven't tried it yet.."
fi

LOCAL_TGZ=tmp/jextract.tgz
REMOTE_TGZ=$DL
JEXTRACT_HOME=jextract-22

mkdir -p "$(

 dirname  $LOCAL_TGZ )"
wget -O $LOCAL_TGZ $REMOTE_TGZ
tar -zxf "$LOCAL_TGZ" -C .
export PATH=$PATH:$JEXTRACT_HOME/bin

jextract  --output src/main/java  -t com.example.stdio $STDIO
```

想想看，我们拥有简单的外部函数互操作性、提供惊人扩展性的虚拟线程，以及静态链接的、快如闪电、内存高效、自足的 GraalVM 原生图像二进制文件。再次告诉我，为何你要开始一个新的 Go 项目？:-)

## 5 勇敢的新世界

Java 22 是一个惊人的新版本。它带来了一系列巨大的功能和提升生活品质的改进。记住，不可能总是这样美好！没有人能每六个月就一贯地推出改变游戏规则的新功能。这是不可能的。所以，我们不妨心存感激，尽情享受目前吧，好吗？ :) 在我看来，上一个版本 Java 21，或许是我见过的自 Java 5 以来最重要的一次发布，甚至可能是最早。这可能是最大的一次！

那里有许多特性值得你关注，包括：

- 数据导向编程
- 虚拟线程

六月前为支持那次发布所做的博客中，覆盖这些及更多内容，[*Hello, Java 21*](http://www.javaedge.cn/md/java/jdk/JDK21%E6%96%B0%E7%89%B9%E6%80%A7.html)。

## 6 虚拟线程、结构化并发和作用域值

虚拟线程是真正重要的部分。阅读我刚才链接给你的博客，往下翻。 (不要像 [the Primeagen](https://www.youtube.com/watch?v=w87od6DjzAg) 那样，他读了文章但在还没读到最佳部分 - 虚拟线程之前就走神了！我的朋友……为什么??)

如果你正在运行 I/O 绑定的服务，虚拟线程是提高你的云基础设施花费、硬件等的一个方法。它们使得你可以将现有的针对 `java.io` 中的阻塞 I/O API 编写的代码转换为虚拟线程，并处理更好的规模化。通常的效果是，你的系统不再不断地等待线程的可用性，从而平均响应时间下降，更好的是，你会发现系统能够同时处理更多的请求！我无法强调它的重要性。虚拟线程是*棒极了*！如果你在使用 Spring Boot 3.2，你只需要指定 `spring.threads.virtual.enabled=true` 即可享受它们！

虚拟线程是旨在使 Java 成为我们都知道它应该得到的精简、高效的规模化机器的一系列新功能的一部分，而且它正在起作用！虚拟线程是三个旨在协同工作的功能中的唯一一个已经在发布形式中交付的功能。

结构化并发和作用域值都还没有落地。结构化并发为构建并发代码提供了一个更优雅的编程模型，而作用域值则提供了一个效率更高、更通用的 `ThreadLocal<T>` 替代方案，特别适用于虚拟线程的背景下，其中你现在可以实际拥有*数百万*个线程。想象一下对于每一个这样的线程都有重复的数据！

这些功能在 Java 22 中处于预览阶段。我不知道它们现在是否值得展示。在我心中，虚拟线程是魔法的一部分，它们之所以如此神奇，正是因为你真的不需要了解它们！只设置那一个属性，你就可以启动了。

虚拟线程为你提供了类似 Python、Rust、C#、TypeScript、JavaScript 的 `async`/`await` 或 Kotlin 中的 `suspend` 之类的惊人规模，而无需使用那些语言功能所需的固有冗长代码和繁琐工作。这是少数几次，除了可能是 Go 的实现，Java 在结果上是直接更胜一筹的时候。Go 的实现是理想的，但那只是因为他们在 1.0 版本中就内置了这一点。事实上，Java 的实现更为杰出，精确地说是因为它与较老的平台线程模型共存。

## 7 隐式声明的类和实例main方法

这个预览功能是巨大的生活质量提升！尽管结果代码更小，而我非常欢迎它。不幸的是，它目前还与 Spring Boot 不兼容。基本概念是，总有一天你将能够只有一个顶层 main 方法，而不需要今天 Java 中的所有仪式。作为应用程序的入口点，这不是很好吗？没有 `class` 定义，没有 `public static void`，也没有不必要的 `String[]` 参数。

```java
void main() {
    System.out.println("Hello, world!");
}
```

## 8 父类之前的语句

这是一个不错的生活质量功能。基本上，Java 不允许你在子类中调用 super 构造函数前访问 `this`。其是为避免与无效状态相关的一类错误。但这有点过于严厉了，并迫使开发者在想在调用 super 方法前进行任何不一般的计算时，不得不转而使用 `private static` 辅助方法。这是有时所需的体操动作的一个例子。我从 [the JEP](https://openjdk.org/jeps/447) 页面偷来了：

```java
class Sub extends Super {

    Sub(Certificate certificate) {
        super(prepareByteArray(certificate));
    }

    // 辅助方法
    private static byte[] prepareByteArray(Certificate certificate) {
        var publicKey = certificate.getPublicKey();
        if (publicKey == null)
            throw new IllegalArgumentException("null certificate");
        return switch (publicKey) {
            case RSAKey rsaKey -> ///...
            case DSAPublicKey dsaKey -> ...
            //...
            default -> //...
        };
    }

}
```

你可以看到这问题。这个新的 JEP，目前还是预览功能，将允许你将该方法直接内联在构造函数，增强可读性并消除代码冗余！

## 9 未命名的变量和模式

创建线程或使用 Java 8 的流和收集器时，你将创建很多 lambda。实际上，Spring 中有很多情况你会用 lambdas。只需考虑所有 `*Template` 对象及其以回调为中心的方法。 `JdbcClient` 和 `RowMapper<T>` 跳入脑海！

Lambda 首次在 2014 年的 Java 8 版本中介绍。但它们的惊人品质是几乎前 20 年的 Java 代码在一夜之间如果方法期望单个方法接口实现即可参与 lambdas。

Lambdas 是惊人的。它们在 Java 语言中引入了一个新的复用单元。最棒的是它们被设计为以某种方式嫁接到运行时的现有规则，包括自动将所谓的*功能接口*或 SAMs（单抽象方法）接口适应到 lambdas。

唯一抱怨是，属于包含作用域的 lambda 中引用的东西须置 final。这问题终于修复！一直以来，必须拼出每个 lambda 参数，即使我根本没打算用它，还好有了 Java 22，这也得到修复了！这是个冗长例子，仅为展示两处 `_` 字符的使用：

```java
package com.example.demo;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

@Component
class AnonymousLambdaParameters implements LanguageDemonstrationRunner {

    private final JdbcClient db;

    AnonymousLambdaParameters(DataSource db) {
        this.db = JdbcClient.create(db);
    }

    record Customer(Integer id, String name) {
    }

    @Override
    public void run() throws Throwable {
        var allCustomers = this.db.sql("select * from customer ")
            // 这里！ 
            .query((rs, _) -> new Customer(rs.getInt("id"), rs.getString("name")))
            .list();
        System.out.println("all: " + allCustomers);
    }

}
```

该类使用 Spring 的 `JdbcClient` 查询底层数据库。它分页查询结果，然后涉及 lambda，它符合 `RowMapper<Customer>` 类型，将结果适应到与我的领域模型一致的记录。 `RowMapper<T>` 接口，我们的 lambda 符合它，有一个方法 `T mapRow(ResultSet rs, int rowNum) throws SQLException`，期望两个参数：我将需要的 `ResultSet`及几乎不需要的 `rowNum`。多亏 Java 22，我不需要指定它，只需插入 `_` 即可！

再看个JDK22 才能成功的例子：

会提示：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/3a11a372935c5be056ec09612fa4e72d.png)

自动修改后：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/1d5bee7bca6f11911014d3077eb28eb8.png)

参数 's' 从未被使用
检查信息：报告未被使用或无法从入口点访问的类、方法或字段。
入口点可以是 main 方法、测试、指定范围外的类、从 module-info.java 访问的类等。可以通过使用名称模式或注解来配置自定义入口点。
示例：

```java
public class Department {
  private Organization myOrganization;
}
```

在这个示例中，Department 明确引用了 Organization，但如果 Department 类本身未被使用，则检查将报告这两个类。
该检查还会报告其方法未使用的参数，以及所有方法实现和重写者，以及声明但未使用的局部变量。

## 10 聚集者

另一个在预览中也很好的功能。 [Viktor Klang](https://twitter.com/viktorklang)，他在 [Akka](https://doc.akka.io/docs/akka/current/typed/actors.html) 上的了不起工作以及他在 Lightbend 期间对 Scala futures 的贡献。如今，他是 Oracle 的一名 Java 语言架构师，他一直在研究的就是新的 Gatherer API。Stream API 也是在 Java 8 中引入的，这给了 Javaer 一个机会，与 lambdas 一起，大大简化和现代化他们现有的代码，并向更多函数式编程方向发展。

它构建了一个在值的流上进行一系列转换的模型。然而，这个抽象模型并不尽完美。Streams API 提供大量便利方法，几乎满足 99% 场景，但当你遇到找不到合适方法的case时，会感到极大挫败感，因为之前并没有一种简易方式可直接扩展新操作。过去10年，关于为 Streams API 引入新操作的提案数不胜数，甚至在最初 lambda 表达式提案中，就有讨论和妥协，目的是让编程模型有足够灵活性[来支持新操作的加入](https://cr.openjdk.org/~vklang/Gatherers.html)。现在，这一目标作为一个预览性质功能终于实现。

Gatherers 提供了一个稍微更底层的抽象层次，使你能在不需要将 `Stream` 具体化为 `Collection` 的情况下，在 Streams 上引入多种新操作。以下是一个我毫不掩饰地直接从 [Viktor 和他的团队那里取得的](https://docs.oracle.com/en/java/javase/22/docs/api/java.base/java/util/stream/Gatherer.html)示例。

```java
package com.example.demo;

import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.function.BiFunction;
import java.util.function.Supplier;
import java.util.stream.Gatherer;
import java.util.stream.Stream;

@Component
class Gatherers implements LanguageDemonstrationRunner {

    private static <T, R> Gatherer<T, ?, R> scan(
            Supplier<R> initial,
             BiFunction<? super R, ? super T, ? extends R> scanner) {

        class State {
            R current = initial.get();
        }
        return Gatherer.<T, State, R>ofSequential(State::new,
                Gatherer.Integrator.ofGreedy((state, element, downstream) -> {
                    state.current = scanner.apply(state.current, element);
                    return downstream.push(state.current);
                }));
    }

    @Override
    public void run() {
        var listOfNumberStrings = Stream
                .of(1, 2, 3, 4, 5, 6, 7, 8, 9)
                .gather(scan(() -> "", (string, number) -> string + number)
                        .andThen(java.util.stream.Gatherers.mapConcurrent(10, s -> s.toUpperCase(Locale.ROOT)))
                )
                .toList();
        System.out.println(listOfNumberStrings);
    }

}
```

该段代码的重点在于，这里描述了一个名为 `scan` 的方法，它返回一个 `Gatherer<T,?,R>` 类型的实现。每个 `Gatherer<T,O,R>` 对象都需要一个初始化函数和一个整合函数。虽然这种实现自带默认的合并函数和完成函数，但你也可以自行覆盖它们。它通过读取所有的数字条目，并为每一个条目逐步构造一个字符串，字符串随着数字的增加不断累积。结果就像这样：先是 `1`，然后是 `12`，接着是 `123`，直到 `1234` 等等。 上述例子还展示了 gatherers 是可以组合使用的。在这里，我们实际上操作了两个 `Gatherer` 对象：一个用于执行扫描过程，另一个则把每个元素转成大写，并且这一转换是并发进行的。 如果您还没能完全理解，没关系，对于大多数人而言，这部分内容可能会有些深奥。大多数人可能无需自己编写 Gatherers。但是，如果你想挑战一下，也是可以试试的。我的朋友 [Gunnar Morling](https://www.morling.dev/blog/zipping-gatherer/) 就在前几天完成了这样的工作。Gatherers 方法的巧妙之处在于，它使社区能够根据自己的需求去设计解决方案。我很好奇这对于 Eclipse Collections、Apache Commons Collections 或者 Guava 这样的著名项目会带来什么影响？它们是否会推出 Gatherers？还有其他什么项目会加入这一趋势？我期待看到很多实用的 gatherers 能够聚集到同一个地方。 

## 11 Class Parsing API（预览）

JDK 新增的部分，适合框架和基础架构开发人员。可解答例如咋构建 `.class` 文件和咋读取 `.class` 文件的问题。

目前市场上有很多好用但不兼容，总是稍微有点落后的工具，如 ASM（领域的重量级解决方案），ByteBuddy，CGLIB 等。JDK 本身在代码库就包含三种此类解决方案！这类库在行业随处可见，且对像 Spring 这样框架开发至关重要，Spring 动态地在运行时创建类来支持业务逻辑。

可将它看作反射 API，但它作用于 `.class` 文件——硬盘上实际的字节码，而非加载进 JVM 的对象。

例展示咋把一个 `.class` 文件加载进一个 `byte[]` 数组，并对其分析：

```java
package com.example.demo;

import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.lang.classfile.ClassFile;
import java.lang.classfile.FieldModel;
import java.lang.classfile.MethodModel;

@Component
@ImportRuntimeHints(ClassParsing.Hints.class)
class ClassParsing implements LanguageDemonstrationRunner {

    static class Hints implements RuntimeHintsRegistrar {

        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
            hints.resources().registerResource(DEFAULT_CUSTOMER_SERVICE_CLASS);
        }

    }

    private final byte[] classFileBytes;

    private static final Resource DEFAULT_CUSTOMER_SERVICE_CLASS = new ClassPathResource(
            "/simpleclassfile/DefaultCustomerService.class");

    ClassParsing() throws Exception {
        this.classFileBytes = DEFAULT_CUSTOMER_SERVICE_CLASS.getContentAsByteArray();
    }

    @Override
    public void run() {
        // this is the important logic
        var classModel = ClassFile.of().parse(this.classFileBytes);
        for (var classElement : classModel) {
            switch (classElement) {
                case MethodModel mm -> System.out.printf("Method %s%n", mm.methodName().stringValue());
                case FieldModel fm -> System.out.printf("Field %s%n", fm.fieldName().stringValue());
                default -> {
                    // ... 
                }
            }
        }
    }

}
```

涉及到运行时读取资源。为应对这过程，我实现了一个名为 Spring AOT `RuntimeHintsRegistrar` 的组件，它能生成一个 `.json` 文件。这个 JSON 文件记录着我正在读取的资源信息，比如具体来说就是 `DefaultCustomerService.class` 文件的数据。不过，这些都是幕后的技术细节，主要是为了在 GraalVM 上进行本地镜像编译的时候使用。 而代码底部的部分则颇有意思，我们对 `ClassElement` 实例进行了枚举，并通过模式匹配的方法一一提取了各个要素。

## 12 String Templates（预览）

为 Java 带来了字符串插值功能！Java 中的多行字符串（String）已经使用了一段时间。这个新功能允许开发者将编译后字符串中可见的变量直接嵌入到字符串值里面。

理论上，这个机制还可以自定义！不满意现有的语法？你完全可以创造一个属于你自己的版本。

```java
package com.example.demo;

import org.springframework.stereotype.Component;

@Component
class StringTemplates implements LanguageDemonstrationRunner {

    @Override
    public void run() throws Throwable {
        var name = "josh";
        System.out.println(STR.""" 
            name: \{name.toUpperCase()}
            """);
    }

}
```

## 13 总结

作为一名 Java 和 Spring 开发者，现在是一个前所未有的好时机！我一直强调这一点。我们仿佛获得了一个崭新的语言和运行时环境，这一进步奇妙地保持了对历史版本的兼容。这是我目睹 Java 社区所开展的最具雄心壮志的软件项目之一，我们很幸运能够见证其成果的诞生。从现在起，我打算将 Java 22 和支持 Java 22 的 GraalVM 用于我的所有开发工作，我希望您也能跟我一起。