# Java 25 (LTS) 重磅发布：AI、性能、安全全面革新，新手入门门槛再创新低！

## 0 前言

JDK 25 于 9 月 16 日正式发布，新版本提供了 18 个 JDK 增强建议，改进了 Java 语言，扩展了 AI 功能，帮助开发人员提高工作效率。该平台提升了性能、安全性和稳定性，可帮助企业加快业务增长。长期支持服务使客户能够按自身节奏进行迁移。

Oracle 正式发布 [Java 25](https://www.oracle.com/cn/java/)，这是备受欢迎的编程语言和开发平台的全新版本。Java 25 ([Oracle JDK 25](https://www.oracle.com/cn/java/technologies/downloads/)) 提供了数千项改进，不仅可显著提高开发人员的工作效率，还增强了平台的性能、稳定性和安全性，以此帮助企业加快业务增长。Oracle 将为 Java 25 提供长达至少 8 年的长期支持服务。

IDC 软件开发研究副总裁 Arnal Dayaratna 表示： “随着 Java 迈入第四个十年，它将继续交付更多先进特性来确保应用，包括 AI 驱动型应用和集成了 AI 功能的应用，在各种硬件平台上高效运行并实现出色的可扩展性。Oracle 将继续引领 Java 编程语言和 Java 平台不断发展，尤其是在 AI 和安全性方面。Oracle 也将坚持一贯的 6 个月一次的更新节奏，为进一步加速创新贡献自己的力量。我们相信 Java 能够持续交付现代化特性，出色满足新一代 AI 驱动型应用的开发需求。”

Oracle Java Platform 高级副总裁兼 OpenJDK 管理委员会主席 Georges Saab 表示： “今年是 Java 的 30 周年，也是 Java 发展史上的一个重要里程碑。未来，Java 平台和语言将进一步发展，帮助开发人员轻松、快速地构建融合了创新型 AI 和安全性功能的应用。Java 25 凸显了 Oracle 长期以来在 Java 上的不懈投入。Oracle 不仅从 Java 特性和功能上着手来驱动 AI 解决方案，还简化语言，让新手开发人员和 IT 团队更容易学习与使用 Java。”

Oracle 计划为 Java 25 提供长达至少 8 年的长期支持，这将赋予各类组织出色的灵活性，既能够以尽可能少的维护投入在更长时期内运行相关应用，同时能够按自身节奏有条不紊地进行迁移。按照计划，Oracle JDK 25 将根据《Oracle 免费条款和条件》(NFTC) 获得季度性安全和性能更新直至 2028 年 9 月。随后，Oracle JDK 25 将按照 Java SE OTN 许可协议发布更新直至 2033 年 9 月。

Java 25 的特性是 Oracle 与全球 Java 开发人员社区成员通过 OpenJDK 社区和 Java Community Process (JCP) 共同合作的成果。此外，欢迎关注将于 2026 年 3 月 17-19 日在美国加利福尼亚州红木海岸举办的 JavaOne 2026 大会，了解全球社区带来的 Java 前沿创新功能。点击 [这里](https://inside.java/2025/08/04/javaone-returns-2026/)了解 JavaOne 2026 大会的更多信息，点击[这里](https://go.oracle.com/LP=149517)注册和获取最新动态。

IDC 现代软件开发和开发者趋势研究经理 Adam Resnick 表示： “自 30 年前诞生以来，Java 一直是构建大型企业级应用程序的可靠且安全的语言。正如今年 JavaOne 大会上所强调的那样，Java 有望在新手开发者和编程学生中进一步普及。简化复杂性并提供即时反馈的新功能，使构建初级程序变得更加容易。Java 的持续演进体现了一种深思熟虑的平衡，在保持企业级解决方案所需的稳健性的同时，也使其更容易被经验不足的开发者所接受。”

## 1 关键 JDK 增强建议（JEP）

### 1.1 语言特性

#### [JEP 507](https://openjdk.org/jeps/507): Primitive Types in Patterns, instanceof, and switch（模式匹配支持原始类型，第三次预览）

通过使 Java 更加统一且更具表达能力，帮助开发人员提高 Java 编程的工作效率。例如，开发人员可以消除他们在使用模式匹配、instanceof 和 switch 时遇到的基元类型的限制，从而增强模式匹配。该功能还在所有模式上下文中支持基元类型模式，并扩展 instanceof 和 switch，使其能够与所有基元类型一起使用。基元类型支持将尤其有益于开发人员构建集成了 AI 推理功能的应用。

增强的模式匹配，允许在 `instanceof` 和 `switch` 中使用原始类型。

```java
switch (x.getYearlyFlights()) {
	case 0, 1 -> standardRate();
	case 2 -> issueDiscount();
	case int i when i >= 100 -> issueGoldCard();
	case int i when i > 2 && i < 100 -> issueSilverDiscount();
}
```

#### [JEP 511](https://openjdk.org/jeps/511): Module Import Declarations（模块导入声明）

允许通过 `import module [模块名]` 一行代码导入整个模块的所有公共 API。

```java
import module java.base;

String[] fruits = new String[] { "apple", "berry", "citrus" };

Map<String, String> m =
    Stream.of(fruits).collect(Collectors.toMap(s -> s.toUpperCase().substring(0,1), Function.identity()));
```

如果多个模块中包含同名类（如 `Date`），可通过显式导入来解决冲突：

```java
import module java.base;      // 导出 java.util，其中有 Date 类
import module java.sql;       // 导出 java.sql，其中也有 Date 类

import java.sql.Date;         // 解决 Date 的命名冲突

Date d = ...                  // 解析为 java.sql.Date
```

开发人员可以轻松导入由模块导出的所有程序包，无需将导入代码放到模块中，从而提高工作效率。

简化了所有开发人员对模块化库的重用，让初学者能用第三方库和基本 Java 类而无需了解它们在程序包层次结构的位置。

开发人员还可在用模块所导出 API 的多个部分时，避免多项按需类型导入声明的噪声 — 这有益于综合使用 AI 推理和来自多个流行库的工作流的简单应用。

#### [JEP 512](https://openjdk.org/jeps/512): Compact Source Files and Instance Main Methods（简化源码文件与实例主方法）

[“Paving the On-Ramp”](https://openjdk.org/projects/amber/design-notes/on-ramp) 系列功能中的亮点之一。[Compact Source Files and Instance Main Methods](https://openjdk.org/jeps/512) 在 JDK 25 中定稿。它简化了 Java 编写最小化程序的方式，将“Hello World”精简至三行，非常适合教学和脚本化用途。

```java
void main() {
	IO.printin("Hello, World!");
}
```

针对 Java 编程提供一个流畅的启动入口，帮助初学者以及系统和 IT 管理员更轻松地使用 Java 语言。这使学生无需了解针对大型程序而设计的语言特性，即可简单编写自己的第一个程序，随后在技能增长过程中不断完善代码。此外，非 Java 专家型系统和 IT 管理员可以简单编写小型程序，如脚本和命令行实用程序。

#### [JEP 513](https://openjdk.org/jeps/513): Flexible Constructor Bodies（灵活构造函数体）

在 JDK 25 中定稿，允许在构造函数调用 `super` 之前添加语句，如数据校验或设置默认值。

```java
class Person {

    int age;

    void show() {
        System.out.println("Age: " + this.age);
    }

    Person(..., int age) {
        if (age < 0)
            throw new IllegalArgumentException(...);
        this.age = age;
        show();
    }

}

class Employee extends Person {

    String officeID;

    @Override
    void show() {
        System.out.println("Age: " + this.age);
        System.out.println("Office: " + this.officeID);
    }

    Employee(..., int age, String officeID) {
        super(..., age);
        if (age < 18  || age > 67)
            throw new IllegalArgumentException(...);
        this.officeID = officeID;
    }

}
```

允许在显式调用构造函数前执行输入验证和安全计算，帮助开发人员提高代码安全性和可靠性。通过支持更自然的构造函数表达式和在字段对其他类代码（例如从一个超类构造函数调用的方法）可见前进行字段初始化，这可以提高代码安全性。此外，该特性还保留了现有的保证，即子类构造函数中的代码不会干扰超类实例化，能够提高可靠性。

### 1.2 库

#### [JEP 505](https://openjdk.org/jeps/505): Structured Concurrency（结构化并发，第五次预览）

将一组并发任务视为一个整体，简化异常处理与取消机制，提升稳定性和可观测性。

```java
Response handle() throws InterruptedException {
    try (var scope = StructuredTaskScope.open()) {
        Subtask<String> user = scope.fork(() -> findUser());
        Subtask<Integer> order = scope.fork(() -> fetchOrder());
        scope.join();
        return new Response(user.get(), order.get());
    }
}
```

简化并发编程，帮助开发人员提高多线程代码的可维护性、可靠性和可观察性。通过将在不同线程中运行的相关任务组视为单个工作单元，结构化并发可以降低因取消和关闭而产生的常见风险，如线程泄漏和取消延迟。这尤其有益于通常需要并行运行多项任务的 AI 开发工作。

#### [JEP 506](https://openjdk.org/jeps/506): Scoped Values（作用域值）

[Project Loom](https://openjdk.org/projects/loom/) 的第二个重要功能。[Scoped Values](https://openjdk.org/jeps/506) 提供了一种在特定作用域内可访问的不可变值。用途与 `ThreadLocal` 类似，用于提供上下文信息，但并不是 `ThreadLocal` 的替代品。

```java
class Framework {

    private static final ScopedValue<FrameworkContext> CONTEXT
                        = ScopedValue.newInstance();    

    void serve(Request request, Response response) {
        var context = createContext(request);
        where(CONTEXT, context)                         
                   .run(() -> Application.handle(request, response));
    }
    
    public PersistedObject readKey(String key) {
        var context = CONTEXT.get();                    
        var db = getDBConnection(context);
        db.readKey(key);
    }

}
```

支持开发人员在线程内和线程之间共享不可变数据，从而提高项目的易用性、可理解性、性能和稳健性。这尤其有益于使用了 AI 平台、Web 框架和微服务的应用。此外，作用域值相比线程局部变量更易于推理，空间和时间成本更低，尤其是当与虚拟线程和结构化并发共同使用时。

#### [JEP 502](https://openjdk.org/jeps/502): Stable Values（稳定值，预览）

提供一种不可变的数据容器，类似常量，但比 `final` 更灵活。

```java
class OrderController {

    private final StableValue<Logger> logger = StableValue.of();

    Logger getLogger() {
        return logger.orElseSet(() -> Logger.create(OrderController.class));
    }

    void submitOrder(User user, List<Product> products) {
        getLogger().info("order started");
        ...
        getLogger().info("order submitted");
    }

}
```

为稳定值（保存不可变数据的对象）引入一个 API，帮助开发人员提高灵活性。由于 JVM 将稳定值视为常量，稳定值可实现与声明一个字段为 final 时同等的性能优化，同时提供更高的初始化时机灵活性。

#### [JEP 508](https://openjdk.org/jeps/508): Vector API（向量 API，第十次孵化）

允许以矢量方式编写计算代码，能在支持的 CPU 上编译为高效的矢量指令，性能优于标量计算。

通过一个 API，以一种在运行时可靠地编译为受支持 CPU 架构上的优化向量指令的方式来表达向量计算，帮助开发人员提高生产力。因此，开发人员可以实现优于等效标量计算的表现，这些计算通常用于 AI 推理和计算场景。

### 1.3 安全库

#### [JEP 470](https://openjdk.org/jeps/470): PEM Encodings of Cryptographic Objects（加密对象的 PEM 编码，预览）

提供了 API，用于将密钥、证书吊销列表等加密对象编码为常用的 PEM 格式。

通过一个新的用于对象编码的 API 帮助开发人员提高工作效率。该 API 不仅可对表示加密密钥、证书和证书吊销列表的对象编码，将其转化为已得到广泛应用且具有增强型隐私保护的邮件传输格式，还能从邮件传输格式解码回对象。这使开发人员可以更轻松地将 Java 应用和安全验证系统/设备（例如 Yubikey）集成在一起。

#### [JEP 510](https://openjdk.org/jeps/510): Key Derivation Function API（密钥派生函数 API）

在 JDK 24 中作为预览功能发布，如今在 JDK 25 中正式定稿。该 API 用于从一个密钥和其他数据中派生出新的密钥。以下示例展示了如何使用 KDF API：

```java
// 创建指定算法的 KDF 对象
KDF hkdf = KDF.getInstance("HKDF-SHA256"); 

// 创建 ExtractExpand 参数规范
AlgorithmParameterSpec params =
    HKDFParameterSpec.ofExtract()
                     .addIKM(initialKeyMaterial)
                     .addSalt(salt).thenExpand(info, 32);

// 派生一个 32 字节的 AES 密钥
SecretKey key = hkdf.deriveKey("AES", params);
```

为密钥派生函数（使用密码学算法，从一个密钥和其他数据中派生出更多密钥）提供一个 API，帮助开发人员为新兴的量子计算环境做好准备。这为支持混合公钥加密提供了一个必要的构建块，有助于平稳过渡到量子安全加密。

### 1.4 性能更新

#### [JEP 519](https://openjdk.org/jeps/519): Compact Object Headers（紧凑对象头）

由 JDK 24 的实验特性转为正式功能。它可将对象头最小化，从而减少堆占用约 10–20%，并降低 GC 压力。

```plaintext
$ java -XX:+UseCompactObjectHeaders ...
```

在 64 位架构上将对象标头大小缩减至 64 位，帮助开发人员提高工作效率。这在降低实际工作负载上对象大小和内存占用的同时，还有助于提高部署密度和增强数据局部性。

#### [JEP 514](https://openjdk.org/jeps/514): Ahead-of-Time Command-Line Ergonomics（AOT 命令行优化）

简化了创建 AOT 缓存的流程。用户只需在运行时添加参数 `-XX:AOTCacheOutput=[缓存名]`，JVM 关闭时会自动生成缓存。

```bash
# 创建 AOT 缓存
$ java -XX:AOTCacheOutput=app.aot -cp app.jar com.example.App ...

# 使用 AOT 缓存
$ java -XX:AOTCache=app.aot -cp app.jar com.example.App ...
```

更轻松地创建 Ahead-of-Time 缓存而无表达能力丢失，帮助开发人员提高工作效率。这将简化常见用例所需的命令，加快 Java 应用的启动速度。

#### [JEP 515](https://openjdk.org/jeps/515): Ahead-of-Time Method Profiling（AOT 方法分析）

允许将方法性能分析数据写入 AOT 缓存，从而加速应用程序启动时的 JIT 编译。

提高应用性能，帮助开发人员提高工作效率。通过将初始方法执行概要信息的收集从生产运行转移到训练运行，并通过 Ahead-of-Time 缓存传送概要信息，预热时间得以缩短。这使 JIT 编译器得以在应用启动时即时生成本机代码，而不是一直等到概要信息收集完毕。它还消除了对应用代码、库或框架的所有修改需求，消除了对应用执行的所有限制。

### 1.5 监视功能更新

#### [JEP 509](https://openjdk.org/jeps/509): JFR CPU-Time Profiling（JFR CPU 时间分析，实验性）

提供更精确的 CPU 时间分析，仅支持 Linux 系统。

```plaintext
$ java -XX:StartFlightRecording=jdk.CPUTimeSample#enabled=true,filename=profile.jfr ...
```

增强 JDK Flight Recorder (JFR) 来捕获更准确的 Linux 平台上 CPU 时间分析信息，识别待优化的程序元素，从而帮助开发人员提高工作效率和程序效率。

#### [JEP 518](https://openjdk.org/jeps/518): JFR Cooperative Sampling（JFR 协作采样）

通过改进线程堆栈采样机制，提高了 JFR 的稳定性。该变更不会影响现有行为，但能提升性能。

增强 JFR 在异步执行 Java 线程堆栈采样时的稳定性，帮助开发人员提高代码可靠性。这使 JFR 可以尽可能减少事件采样器中的安全点偏差，同时避免在安全点之外生成用于堆栈跟踪的风险性启发函数。它还允许创建样本请求来响应硬件事件，或在信号处理函数中创建样本请求，降低采样器线程的必要工作量。

#### [JEP 520](https://openjdk.org/jeps/520): JFR Method Timing & Tracing（JFR 方法计时与追踪）

该特性允许 JFR 追踪和计时方法执行，可通过命令行启用并分析结果。

##### 方法追踪示例

```plaintext
$ java -XX:StartFlightRecording:
jdk.MethodTrace#filter=org.springframework.data.jpa.repository.support.SimpleJpaRepository::findAll, \
filename=recording.jfr ...
$jfr view --cell-height 30 --width 200 jdk.MethodTrace recording.jfr
```

##### 方法计时示例

```plaintext
$ java -XX:StartFlightRecording=method-timing='org.springframework.data.jpa.repository.support.SimpleJpaRepository::findAll',dumponexit=true,filename=recording.jfr -jar target/spring-petclinic-3.5.0-SNAPSHOT.jar
$ jfr view method-timing recording.jfr
```

允许开发人员识别应用性能瓶颈、优化代码以及查找错误根因，帮助开发人员提高工作效率。这是通过使用字节码增强来扩展 JFR，使 JFR 得以进行方法时间分析和跟踪实现的。

#### JEP 521 - Generational Shenandoah（分代 Shenandoah）

[分代 Shenandoah](https://openjdk.org/jeps/521) 在 JDK 25 中成为正式功能，可通过以下参数启用：

```plaintext
$ java -XX:+UseShenandoahGC -XX:ShenandoahGCMode=generational ...
```

### 1.6 移除的功能

JDK 25 仅有一个被移除的特性。

#### JEP 503 - 移除 32 位 x86 端口

[移除 32 位 x86 端口](https://openjdk.org/jeps/509) 删除了所有与 32 位 x86 架构相关的代码和构建支持。自 JDK 25 起，不再提供 32 位 OpenJDK 二进制版本。

------



## 2 云端创新赋能全球 Java 社区

Oracle Cloud Infrastructure (OCI) 是一个支持 Java 25 的超大规模云技术平台，当 Java 部署在 OCI 中，可带来更出色的性能、效率、创新以及成本节约。通过在 OCI 上免费提供 Oracle Java SE 以及 Java SE Subscription Enterprise Performance Pack 等高级特性，Java 25 助力开发人员构建和部署速度更快、更出色且经过优化的应用。

[Oracle Java SE Universal Subscription](https://www.oracle.com/cn/java/java-se-subscription/) 可为客户提供优质的支持服务。该产品包含了 Java SE Subscription Enterprise Performance Pack，提供对整个 Java 产品组合的支持、Java Management Service 以及按业务计划进行升级的灵活性。这有助于 IT 团队管理复杂性、降低安全风险并控制成本。

除了基于 OCI 的 Java 和 Java Universal SE Subscription 外，Java 25 还将驱动更出色的应用性能，将通过广泛的 AI 和安全性功能，包括后量子加密 (PQC) 支持，来增强 Java SE Platform 实施和 JDK 的性能、稳定性以及安全性。

## 3 全球喜迎 Oracle JDK 25

Gradle, Inc. 倡导主管 Trisha Gee 表示： “当 Java 开始每 6 个月发布一个新版本时，我们很难想象它可以将有趣的新特性拆分成足够小的元素来交付，预感到一些新版本可能不会带来很多新特性。事实证明，我们错了。如今，每一个 Java 新版本都带来了有趣且切实有用的特性，出色展示了如何将大型功能拆分为小的独立特性。例如，各种模式匹配特性自成一体，是独立交付的，但综合起来却是一个梦幻般的 Java 新特性集，为开发人员思考如何解决问题提供了一种新的方法。我相信 Java 将会越来越强大。”

古斯塔夫·埃菲尔大学 (Université Gustave Eiffel) 副教授 Rémi Forax 表示：“JEP 512 带来了‘紧凑源文件和实例主方法’，能够为初学者显著简化 Java，允许初学者在不使用传统样板代码 public static void main(String[] args) 的情况下编写程序。现在，学生用户可以从简单程序入手，然后在成长过程中逐步扩展到更高级概念。这是一种更平稳的，从基本编程概念到完全面向对象编程的学习路径。”

圣何塞州立大学 (San José State University) 名誉教授 Cay Horstmann 表示：“我喜欢 Java 25 的紧凑源文件、实例主方法和模块导入声明，这些特性能够降低新手程序员在 Java 上的进入门槛，还有益于资深程序员将 Java 扩展到日常小型任务。我发现使用 Java 这一具有工业强度，而且有强大的工具支持为后盾的强类型语言来重写脆弱的 Shell 和 Python 脚本可以取得令人满意的效果。”

Java Specialists’ Newsletter 撰稿人 Heinz M. Kabutz 博士表示： “当宣布从 Java 9 开始每 6 个月发布一次特性时，我曾持怀疑态度。Oracle 能做到这一点吗？我有自己的疑虑，因为我们已经习惯了每三年发布一个新版本。但事实证明 Oracle 怀着对 Java 的满腔热忱做到了。在 Oracle 的领导下，在一个庞大社区的推动下，Java 超越了其他语言。Java 的记录、紧凑源文件、模块导入特性大大降低了 Java 的入门难度，同时虚拟线程、外部内存 API、向量 API 和 ZGC 使 Java 能够被用于构建技术先进的可扩展系统。”

XDEV Software GmbH 首席执行官 Richard Fichtner 表示： “Java 的强大优势在于社区支持。在 JUG Oberpfalz，我们重启了 2025 年的 ‘(Re)Start with Java’ 对话，开发人员也一直对 Java 语言的变化印象深刻。现代 Java 比以前效率更高、更安全、更富创新力，这也是 Java 社区和协作所取得成果的证明。”

## 4 总结

Java 25 是又一次成功的半年期版本发布。作为一个长期支持版本（LTS），它将受到众多开发者的关注。

参考：

- 如想了解从 Java 21 到 25 的完整变化，可以观看 [Road to Java 25 系列视频](https://www.youtube.com/playlist?list=PLX8CzqL3ArzXJ2_0FIGleUisXuUm4AESE) 或 [Java 25 发布直播回放](https://www.youtube.com/watch?v=duIceCXObrA)
- 有关 Java 25 特性的更多信息，请阅读 [Java 25 技术博客文章](https://blogs.oracle.com/java/post/the-arrival-of-java-25)