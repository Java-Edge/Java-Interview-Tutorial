# JDK23新特性

## 0 前言

官宣发布：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/31b4ae5617cb03161004a9dbcbd57b24.png)

IDEA已支持下载：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/03c3d07bea34a18aba320798f8da5bde.png)

## 1 JEPs

### [JEP 455](https://openjdk.org/jeps/455)  Primitive Types in Patterns, instanceof, and switch (Preview)

通过允许在所有模式上下文中使用原始类型模式，增强了模式匹配，并扩展了 `instanceof` 和 `switch` 以适用于所有原始类型。这是一项[预览语言特性](https://openjdk.org/jeps/12)。

### [JEP 466](https://openjdk.org/jeps/466)  Class-File API (Second Preview)

提供解析、生成和转换 Java 类文件的标准 API。这是一项[预览 API](https://openjdk.org/jeps/12)。

### [JEP 467](https://openjdk.org/jeps/467)  Markdown文档注释

使 JavaDoc 文档注释能够用 Markdown 而非 HTML 和 JavaDoc `@` 标签的混合体编写。

### [JEP 469](https://openjdk.org/jeps/469)  Vector API (Eighth Incubator)

引入一个 API 来表达向量计算，这些计算在运行时可靠地编译为支持的 CPU 架构上的最佳向量指令，从而实现优于等效标量计算的性能。

### [JEP 471](https://openjdk.org/jeps/471)  废除 Memory-Access Methods in sun.misc.Unsafe for Removal

将 `sun.misc.Unsafe` 中的内存访问方法标记为将来版本中删除。这些不受支持的方法已被标准 API 取代，即 VarHandle API ([JEP 193](https://openjdk.org/jeps/193),  JDK 9) 和 Foreign Function & Memory API ([JEP 454](https://openjdk.org/jeps/454),  JDK 22)。强烈鼓励库开发者从 `sun.misc.Unsafe` 迁移到支持的替代品，以便应用程序能够顺利迁移到现代 JDK 版本。

### [JEP 473](https://openjdk.org/jeps/473)  Stream Gatherers (Second Preview)

增强 [Stream API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html) 以支持自定义中间操作。这将允许流管道以不容易用现有内置中间操作实现的方式转换数据。这是一项[预览 API](https://openjdk.org/jeps/12)。

### [JEP 474](https://openjdk.org/jeps/474)  ZGC: Generational Mode by Default

将ZGC默认模式切换为分代模式。弃用非分代模式，并计划在未来版本中删除。

### [JEP 476](https://openjdk.org/jeps/476)  Module Import Declarations (Preview)

简洁地导入模块导出的所有包。简化了模块库重用，但不需要导入代码本身处于模块中。[预览语言特性](https://openjdk.org/jeps/12)。

### [JEP 477](https://openjdk.org/jeps/477)  Implicitly Declared Classes and Instance Main Methods (Third Preview)

发展 Java 编程语言，以便初学者在不需要理解为大型程序设计的语言特性的情况下编写首个程序。远非使用语言的单独方言，初学者可为单类程序编写简化的声明，然后随技能提升，无缝扩展程序以使用更高级特性。经验丰富开发同样可享受简洁编写小程序乐趣，而无需使用旨在大规模编程的构造。[预览语言特性](https://openjdk.org/jeps/12)。

### [JEP 480](https://openjdk.org/jeps/480)  Structured Concurrency (Third Preview)

通过引入 *结构化并发* API简化并发编程。结构化并发将不同线程中运行的一组相关任务视为单一工作单元，简化错误处理和取消操作，提高可靠性，并增强可观察性。[预览 API](https://openjdk.org/jeps/12)。

### [JEP 481](https://openjdk.org/jeps/481)  Scoped Values (Third Preview)

引入 *作用域值*，使方法能在线程内与其被调用者共享不可变数据，并与子线程共享。作用域值比线程局部变量更易理解。还具有更低空间和时间成本，尤其与虚拟线程 ([JEP 444](https://openjdk.org/jeps/444)) 和结构化并发 ([JEP 480](https://openjdk.org/jeps/480)) 一起使用时。[预览 API](https://openjdk.org/jeps/12)。

### [JEP 482](https://openjdk.org/jeps/482)  Flexible Constructor Bodies (Second Preview)

允许在显式构造函数调用（即 `super(..)` 或 `this(..)`）之前出现语句。这些语句不能引用正在构造的实例，但它们可初始化其字段。在调用另一个构造函数之前初始化字段，当方法被覆盖时，可以使类更可靠。[预览语言特性](https://openjdk.org/jeps/12)。

## 2 内容

- [新特性](https://jdk.java.net/23/release-notes#newfeatures)
- [已移除的特性和选项](https://jdk.java.net/23/release-notes#removed) 
- [已弃用的特性和选项](https://jdk.java.net/23/release-notes#deprecated) 
- [已解决的显著问题](https://jdk.java.net/23/release-notes#issuesfixed) 
- [其他说明](https://jdk.java.net/23/release-notes#notes) 

### 默认 `javac` 中的注解处理已禁用 ([JDK-8321314](https://bugs.openjdk.org/browse/JDK-8321314))

tools/javac

JDK 23开始，只有在一些显式注解处理配置或在 `javac` 命令行上显式请求运行注解处理时，才会运行注解处理。这是与现有默认行为的一个变化，现有默认行为是在不需要任何显式注解处理相关选项的情况下，通过在类路径中搜索处理器来运行注解处理。

依赖于注解处理的 `javac` 调用需要更新，以继续运行注解处理器。在 JDK 21 和 22 中，`javac` 打印一条消息，识别这样的调用。为了保留旧行为，可以向 `javac` 传递 "-proc:full"。对 "-proc:full" 的支持已经回传到几个更新发布列车中，并且也支持最近的 Maven Compiler 插件版本。在更新版本的编译器插件中，相关属性将显示为："User Property: maven.compiler.proc"，用户可以通过命令行 `-Dmaven.compiler.proc=full` 进行配置。

## 3 新特性

### 带明确区域设置的控制台方法 ([JDK-8330276](https://bugs.openjdk.org/browse/JDK-8330276)) 

core-libs/java.io

`java.io.Console` 类添加了以下方法，这些方法接受一个 `java.util.Locale` 参数：

- `public Console format(Locale locale, String format, Object ... args)`
- `public Console printf(Locale locale, String format, Object ... args)`
- `public String readLine(Locale locale, String format, Object ... args)`
- `public char[] readPassword(Locale locale, String format, Object ... args)`

用户现在可以用指定的 `Locale` 格式化输出字符串或显示提示文本，该 `Locale` 可能与默认区域设置无关。例如，代码片段 `System.console().printf(Locale.FRANCE, "%1$tY-%1$tB-%1$te %1$tA", new Date())` 将显示：

```
2024-五月-16 星期四
```

### 添加 `jdk.SerializationMisdeclaration` JFR 事件 ([JDK-8275338](https://bugs.openjdk.org/browse/JDK-8275338)) 

core-libs/java.io:serialization

平台添加了一个新的 `jdk.SerializationMisdeclaration` JFR 事件类型。当与序列化相关的字段和方法的某些方面被错误声明时，此类事件在运行时触发。通过启用 `jdk.SerializationMisdeclaration`，JFR 将在 JVM 加载序列化类时为每个错误声明的方面触发一个事件。

例如，如果一个 `Serializable` 类的 `writeObject()` 方法具有正确的签名，但无意中被声明为 `public`，则序列化机制不会选择它。这可能会让类的开发者感到惊讶。为了帮助诊断这类问题，应启用 `jdk.SerializationMisdeclaration` 事件。

标准 `default.jfc` 配置文件 *不* 启用这些事件，而标准 `profile.jfc` 配置文件会启用。

添加系统属性以设置 `WatchService` 事件溢出前的最大数量 ([JDK-8330077](https://bugs.openjdk.org/browse/JDK-8330077)) 

core-libs/java.nio

`java.nio.file.WatchService` 实现在丢弃事件并排队 `OVERFLOW` 事件之前，会缓冲最大数量的事件。已添加一个新的系统属性 `jdk.nio.file.WatchService.maxEventsPerPoll`，允许某人指定在发出 `OVERFLOW` 事件之前可以排队的最大挂起事件数。此属性的值必须是一个正整数。

### 支持直到另一个瞬间的持续时间 ([JDK-8331202](https://bugs.openjdk.org/browse/JDK-8331202)) 

core-libs/java.time

`java.time.Instant` 类添加了一个新的方法，以获得直到指定 `Instant` 的 `Duration`。新方法 `Instant.until(Instant)` 产生的持续时间与 `Duration.between(Temporal, Temporal)` 相同，但更易于用户发现。此外，与 `Instant.until(Temporal, TemporalUnit)` 方法相比，新方法直接返回一个 `Duration`，无需单位转换。

### 新的 Parallel GC Full GC 算法 ([JDK-8329203](https://bugs.openjdk.org/browse/JDK-8329203)) 

hotspot/gc

Parallel GC 现在使用与 Serial GC 和 G1 GC Full GCs 中相同的 Full GC 算法。

以前的算法包括通过 Java 堆中的每个活动对象进行三次传递：

1. 标记活动对象
2. 计算每个活动对象的新位置
3. 移动对象到新位置并更新每个对象的字段

在第 2 步中计算的对象位置使用非堆内存存储，以避免通过 Java 堆中的活动对象进行第四次传递。问题是这种方案对于某些问题工作负载来说扩展性不好。此外，这种数据结构使用 Java 堆的 1.5% 作为非堆内存。

新算法对于问题工作负载的性能显著更好，并且不需要额外的内存，减少了所有工作负载的占用空间。

### 支持 KeychainStore-ROOT 密钥库 ([JDK-8320362](https://bugs.openjdk.org/browse/JDK-8320362)) 

security-libs/java.security

Apple 提供程序的 "KeychainStore" 现在支持两种类型的密钥库：

- "KeychainStore"：包含用户当前密钥链中的私钥和证书
- "KeychainStore-ROOT"：包含系统根证书密钥链中的证书

### 为 `java.security.debug` 系统属性添加线程和时间戳选项 ([JDK-8051959](https://bugs.openjdk.org/browse/JDK-8051959)) 

security-libs/java.security

`java.security.debug` 系统属性现在接受参数，为所有组件或特定组件的调试语句添加线程 ID、线程名称、调用者信息和时间戳信息。

可以将 `+timestamp` 附加到调试选项以打印该调试选项的时间戳。可以将 `+thread` 附加到调试选项以打印该调试选项的线程和调用者信息。

示例：`-Djava.security.debug=all+timestamp+thread` 为生成的每个调试语句添加时间戳和线程信息。

`-Djava.security.debug=properties+timestamp` 为 `properties` 组件生成的每个调试语句添加时间戳信息。

您还可以指定 `-Djava.security.debug=help`，它将显示支持的组件和参数的完整列表。

有关更多信息，请参见 [打印线程和时间戳信息](https://docs.oracle.com/en/java/javase/23/security/troubleshooting-security.html#GUID-EDB76EF1-D4B2-4D32-83C1-554129526FB4)。

### 在 `ccache` 和 `keytab` Kerberos 条目查找中启用区分大小写的检查 ([JDK-8331975](https://bugs.openjdk.org/browse/JDK-8331975)) 

security-libs/org.ietf.jgss:krb5

在查找 Kerberos 主体的 `keytab` 或 `credentials cache (ccache)` 条目时，主体名称与条目名称的比较是区分大小写的。然而，许多 Kerberos 实现将主体名称视为区分大小写。因此，如果两个主体的名称仅在大小写上有所不同，存在选择错误的 `keytab` 或 `ccache` 条目的风险。

引入了一个新的安全属性 `jdk.security.krb5.name.case.sensitive` 来控制名称比较。如果此属性设置为 "true"，则在 `keytab` 和 `ccache` 条目查找期间，主体名称的比较将是区分大小写的。默认值是 "false"，以确保向后兼容。

此外，如果指定了具有相同名称的系统属性，则它将覆盖在 `java.security` 文件中定义的安全属性值。

有关更多信息，请参见 [Kerberos 系统属性、安全属性和环境变量](https://docs.oracle.com/en/java/javase/23/security/kerberos-system-properties-security-properties-and-environment-variables.html)。

### 为 `javac` 添加新的 `-Xlint` 子选项以报告 "悬挂文档注释" ([JDK-8303689](https://bugs.openjdk.org/browse/JDK-8303689)) 

tools/javac

为 `javac` 的 `-Xlint` 选项提供了一个新的子选项，以检测源代码中文档注释放置的相关问题。

新子选项的名称是 `dangling-doc-comments`。可以显式指定子选项（例如 `-Xlint:dangling-doc-comments`），也可以隐式指定，作为所有子选项之一（例如 `-Xlint` 或 `-Xlint:all`）。启用子选项时，`javac` 将报告声明附近任何意外或错位的文档注释，例如：

- 在任何 `package` 或 `import` 声明之前为顶层类提供的文档注释；
- 在声明的第一个标记之后为声明提供的文档注释，如声明的任何注释或其他修饰符之后；或
- 在声明之前任何额外的文档注释，`javac` 将忽略这些注释。

与 `-Xlint` 的任何子选项一样，可以使用 `@SuppressWarnings` 注解在封闭声明上局部抑制警告，指定要抑制的子选项名称。

注意：启用子选项时，`javac` 可能会报告一些 "误报"，如果有任何装饰性注释以 `/**` 开始，因此可能类似于文档注释。例如，使用星号线在评论文本前后以帮助使评论 "脱颖而出"。在这种情况下，解决办法是更改注释，使其不以 `/**` 开始——也许可以将第二个星号更改为其他字符。

### 在 `javadoc` 中支持 JavaScript 模块 ([JDK-8317621](https://bugs.openjdk.org/browse/JDK-8317621)) 

tools/javadoc(tool)

`javadoc --add-script` 选项现在除了传统的脚本文件外，还支持 JavaScript 模块。通过检查传递给选项参数的文件的扩展名或内容，模块会自动检测。

### 在 API 文档中改进结构化导航 ([JDK-8320458](https://bugs.openjdk.org/browse/JDK-8320458)) 

tools/javadoc(tool)

标准 doclet 生成的 API 文档现在具有增强的导航功能，包括一个包含当前页面内容表的侧边栏，以及页眉中当前 API 元素的面包屑导航。

在类和接口的文档中，内容表中的条目可以使用侧边栏顶部的文本输入字段进行过滤。侧边栏底部的一个按钮允许当前会话展开或折叠内容表。

### 在 `javap` 中验证类 ([JDK-8182774](https://bugs.openjdk.org/browse/JDK-8182774)) 

tools/javap

新的 `javap` 选项 `-verify` 打印额外的类验证信息。

### 为创建严格的 JAXP 配置文件提供模板 ([JDK-8330542](https://bugs.openjdk.org/browse/JDK-8330542)) 

xml/jaxp

未来的 JDK 版本将继续使 XML 处理默认情况下更加受限。为了帮助开发人员准备这些变化，此版本包括一个 [JAXP 配置文件](https://docs.oracle.com/en/java/javase/23/docs/api/java.xml/module-summary.html#Conf) 模板，`$JAVA_HOME/conf/jaxp-strict.properties.template`，指定了更严格的 XML 处理设置。

可以使用以下步骤使用 JAXP 配置文件模板测试应用程序：

- 将模板文件复制到 `$JAVA_HOME/conf` 之外的位置：

  `cp $JAVA_HOME/conf/jaxp-strict.properties.template /<my_path>/jaxp-strict.properties`

- 运行应用程序，指定系统属性 `java.xml.config.file` 为复制 JAXP 配置文件模板的位置，以覆盖默认的 JAXP 配置：

  `java -Djava.xml.config.file=/<my_path>/jaxp-strict.properties myApp`

## 4 已移除的特性和选项

移除 `MethodHandles::byteArrayViewVarHandle`、`byteBufferViewVarHandle` 及相关方法的对齐访问模式 ([JDK-8318966](https://bugs.openjdk.org/browse/JDK-8318966)) 

core-libs/java.lang.invoke

由 `MethodHandles::byteArrayViewVarHandle` 返回的 var handle 不再支持原子访问模式，由 `MethodHandles::byteBufferViewVarHandle` 返回的 var handle 在访问堆缓冲区时也不再支持原子访问模式。此外，`ByteBuffer::alignedSlice` 和 `ByteBuffer::alignmentOffset` 方法已更新以反映这些变化。它们不再报告堆字节缓冲区的对齐切片或偏移量，当访问的 'unitSize' 大于 1 时。在这些情况下，它们改为抛出 `UnsupportedOperationException`。

被移除的功能基于参考 JVM 实现中的一个实现细节，JVM 规范并不要求这样做。因此，不能保证它在任意 JVM 实现上都能工作。这也允许参考实现更松散地对齐数组元素，如果认为有益的话 [1](https://bugs.openjdk.org/browse/JDK-8314882)。

受影响的客户应考虑使用直接（非堆）字节缓冲区，对于这些缓冲区可以可靠地保证对齐访问。或者，他们应该使用 `long[]` 来存储数据，它比 `byte[]` 有更强的对齐保证。可以通过新引入的外部函数和内存 API [3](https://bugs.openjdk.org/browse/JDK-8310626) 使用 `long[]` 数组支持的 `MemorySegment` 访问对齐的 int：

```
long[] arr = new long[10];
MemorySegment arrSeg = MemorySegment.ofArray(arr);
VarHandle vh = ValueLayout.JAVA_INT.varHandle(); // 访问对齐的 int
vh.setVolatile(arrSeg, 0L, 42); // 0L 是字节偏移
long result = vh.getVolatile(arrSeg, 0L); // 42
```

### 移除 `ThreadGroup.stop` ([JDK-8320786](https://bugs.openjdk.org/browse/JDK-8320786)) 

core-libs/java.lang

在此版本中已移除 `java.lang.ThreadGroup.stop()` 方法。这个固有不安全的方法在 JDK 1.2 (1998) 中已被弃用，在 Java 18 中弃用于删除，并在 Java 20 中重新规定/降级为无条件抛出 `UnsupportedOperationException`。使用此方法的代码将不再编译。在旧版本上编译的代码，如果在使用 JDK 23 或更新版本时执行，现在会抛出 `NoSuchMethodError` 而不是 `UnsupportedOperationException`。

### 移除 `Thread.suspend/resume` 和 `ThreadGroup.suspend/resume` ([JDK-8320532](https://bugs.openjdk.org/browse/JDK-8320532)) 

core-libs/java.lang

在此版本中已移除 `java.lang.Thread.suspend()`、`java.lang.Thread.resume()`、`java.lang.ThreadGroup.suspend()` 和 `java.lang.ThreadGroup.resume()` 方法。这些容易死锁的方法在 JDK 1.2 (1998) 中已被弃用，在 Java 14 中弃用于删除，并在 Java 19/20 中重新规定/降级为无条件抛出 `UnsupportedOperationException`。使用这些方法的代码将不再编译。在旧版本上编译的代码，如果在使用 JDK 23 或更新版本时执行，现在会抛出 `NoSuchMethodError` 而不是 `UnsupportedOperationException`。

### 移除模块 `jdk.random` ([JDK-8330005](https://bugs.openjdk.org/browse/JDK-8330005)) 

core-libs/java.util

已从 JDK 中移除 `jdk.random` 模块。该模块包含 `java.util.random.RandomGenerator` 算法的实现。这些实现已移动到 `java.base` 模块，`java.base` 模块现在将负责支持这些算法。

依赖 `jdk.random` 模块的应用程序，无论是通过构建脚本还是通过模块依赖项，都应删除对此模块的引用。

### 移除旧版本地化数据 ([JDK-8174269](https://bugs.openjdk.org/browse/JDK-8174269)) 

core-libs/java.util:i18n

已从 JDK 中移除旧版 `JRE` 本地化数据。旧版 `JRE` 本地化数据，`COMPAT` 是此本地化数据的别名，在 JDK 9 ([JEP252](https://openjdk.org/jeps/252)) 将基于 Unicode 联盟的 [Common Locale Data Registry](https://cldr.unicode.org/) 的 `CLDR` 本地化数据作为默认数据后仍然保留。`JRE` 本地化数据曾作为临时工具使用。自 JDK 21 起，用户在启动时会收到其未来移除的警告消息，因为使用 `JRE`/`COMPAT` 本地化数据已被弃用。现在 JDK 23 中已将其移除，因此在 `java.locale.providers` 系统属性中指定 `JRE` 或 `COMPAT` 已不再有任何效果。鼓励使用 `JRE`/`COMPAT` 本地化数据的应用程序迁移到 CLDR 本地化数据或考虑 [CSR](https://bugs.openjdk.org/browse/JDK-8325568) 中讨论的变通方法。[JEP 252: 默认使用 CLDR 本地化数据](https://openjdk.org/jeps/252) 已更新，为受此旧版本地化数据移除影响的开发者提供建议。

### 移除 JMX 主题委托 ([JDK-8326666](https://bugs.openjdk.org/browse/JDK-8326666)) 

core-svc/javax.management

为准备平台移除安全管理器，JMX "主题委托" 功能在此版本中已移除。

方法 `javax.management.remote.JMXConnector.getMBeanServerConnection(Subject delegationSubject)` 现在如果使用非空委托主体调用，将抛出 `UnsupportedOperationException`。如果客户端应用程序需要以多个身份执行操作，或代表多个身份执行操作，它现在需要对 `JMXConnectorFactory.connect()` 多次调用，并对返回的 `JMXConnector` 上的 `getMBeanServerConnection()` 方法多次调用。

有关更多信息，请参见 *Java 管理扩展指南* 中的 [安全](https://docs.oracle.com/en/java/javase/23/jmx/security.html#GUID-EFC2A37D-307F-4001-9D2F-6F0A2A3BC51D)。

### 移除 JMX 管理小程序 (m-let) 特性 ([JDK-8318707](https://bugs.openjdk.org/browse/JDK-8318707)) 

core-svc/javax.management

为准备平台移除安全管理器，m-let 特性已被移除。此移除对用于本地和远程监控的 JMX 代理、Java 虚拟机的内置仪表或使用 JMX 的工具没有影响。已移除的 API 类包括：

- `javax.management.loading.MLet`
- `javax.management.loading.MLetContent`
- `javax.management.loading.PrivateMLet`
- `javax.management.loading.MLetMBean`

### 使 `RegisterFinalizersAtInit` 选项过时 ([JDK-8320522](https://bugs.openjdk.org/browse/JDK-8320522)) 

hotspot/runtime

在此版本中，HotSpot VM 选项 (`-XX:[+-]RegisterFinalizersAtInit` ) 已作废。该选项在 JDK 22 中已弃用。

### `java` 启动器的 `-Xnoagent` 选项已过时 ([JDK-8312150](https://bugs.openjdk.org/browse/JDK-8312150)) 

hotspot/runtime

`java` 启动器的 `-Xnoagent` 选项已在此版本中移除，该选项在之前的版本中已弃用于删除。在弃用于删除之前，指定此选项时被视为非操作性的。现在使用此选项启动 `java` 将导致错误，并且进程将无法启动。在使用此选项启动 `java` 命令的应用程序中，应预期将其移除。

### 从 Linux 安装程序中移除过时的桌面集成 (JDK-8322234 (非公开))

install/install

从 Linux 安装程序中删除了非功能性桌面集成功能。安装程序将停止在 `/usr/share/icons`、`/usr/share/mime` 和 `/usr/share/applications` 子树中存放文件。

## 5 已弃用的特性和选项

### 弃用 `java.beans.beancontext` 包 ([JDK-8321428](https://bugs.openjdk.org/browse/JDK-8321428)) 

client-libs

`java.beans.beancontext.*` 包在 JDK 1.2 版本中添加，远早于注释、lambda 和模块等新语言特性，以及 "声明式配置"、"依赖注入" 和 "控制反转" 等编程范式。

基于 Apple 计算机在 1990 年代中后期开发的 OpenDoc 概念，此包旨在为 JavaBeans™ 组件的层次结构组装提供机制。这使得单个组件能够产生和消费其同级、祖先和后代作为接口表达的服务。

随着语言的进步，这些 API 现在既过时又表达了组件组装和交互的 "反模式"。因此，它们已被弃用于将来版本中删除。

开发者不应再使用这些 API。他们应计划将依赖于此包的任何现有代码迁移到替代解决方案，以预期它们将来的移除。

### JVM TI `GetObjectMonitorUsage` 函数不再支持虚拟线程 ([JDK-8328083](https://bugs.openjdk.org/browse/JDK-8328083)) 

hotspot/jvmti

在此版本中，JVM TI 函数 `GetObjectMonitorUsage` 已重新规定为在监视器被虚拟线程拥有时不返回监视器信息。现在它只规定在监视器被平台线程拥有时返回监视器所有者。此外，该函数返回的等待拥有的线程数组和等待被通知的线程数组，现在重新规定为只包括平台线程。

相应的 JDWP 命令 `ObjectReference.MonitorInfo` 已重新规定。`com.sun.jdi.ObjectReference` 定义的 `owningThread()`、`waitingThreads()` 和 `entryCount()` 方法也已重新规定。

### 弃用 `DontYieldALot` 标志 ([JDK-8331021](https://bugs.openjdk.org/browse/JDK-8331021)) 

hotspot/runtime

未记录的 `DontYieldALot` 产品标志被引入以缓解可能在 Solaris 操作系统上出现的调度异常。多年来一直不需要它，也没有按描述运行。该标志现在已被标记为弃用，并将在未来版本中作废然后移除。

### 弃用 `-XX:+UseEmptySlotsInSupers` ([JDK-8330607](https://bugs.openjdk.org/browse/JDK-8330607)) 

hotspot/runtime

选项 `-XX:+UseEmptySlotsInSupers` 在 JDK 23 中已被弃用，并将在 JDK 24 中变得过时。默认值为 "true"。这意味着 HotSpot JVM 将始终在字段布局中在超类分配字段，如果有对齐的空间可以容纳字段。依赖于实例字段位置的代码应意识到实例字段布局的这一细节。JVM 字段布局格式未由 JVMLS 规定，并可能更改。

### 弃用 `PreserveAllAnnotations` VM 选项 ([JDK-8329636](https://bugs.openjdk.org/browse/JDK-8329636)) 

hotspot/runtime

VM 选项 `PreserveAllAnnotations` 已被弃用。使用此选项将产生弃用警告。该选项将在将来版本中作废然后移除。此选项被引入以支持 Java 注解代码的测试，并且默认情况下始终处于禁用状态。

### 弃用 `UseNotificationThread` VM 选项 ([JDK-8329113](https://bugs.openjdk.org/browse/JDK-8329113)) 

hotspot/svc

VM 选项 `UseNotificationThread` 已被弃用。它将在将来版本中作废然后移除。当调试通知从隐藏的 "Service Thread" 切换为非隐藏的 "Notification Thread" 时，提供了此选项（默认为 true），以便在使用 "Notification Thread" 时如果出现任何问题可以禁用它。由于没有报告问题，"Notification Thread" 将成为未来发送通知的唯一方式，并且该选项将不再可用。

## 6 已解决的显著问题

### `jpackage` 在 Debian Linux 发行版上可能生成不准确的所需包列表 ([JDK-8295111](https://bugs.openjdk.org/browse/JDK-8295111)) 

tools/jpackage

修复了 Debian Linux 发行版上的一个问题，`jpackage` 有时无法从路径中包含符号链接的共享库构建准确的所需包列表，导致安装因缺少共享库而失败。

### `HttpServer` 不再立即发送响应头 ([JDK-6968351](https://bugs.openjdk.org/browse/JDK-6968351)) 

core-libs/java.net

HTTP 服务器不再在选择了分块模式或响应有正文时立即发送响应头。以前的行为由于在某些操作系统上延迟确认，导致响应时间变慢。有了这个变化，头将被缓冲，并在预期有响应正文时与响应正文一起发送。这应该会改善某些类型响应的性能。注意，现在最好总是关闭 HTTP 交换或响应正文流以强制发送响应头，除非没有响应正文。

### 将 `java.text.DecimalFormat` 空模式的默认最大小数位数更改 ([JDK-8326908](https://bugs.openjdk.org/browse/JDK-8326908)) 

core-libs/java.text

使用空字符串模式创建的 `java.text.DecimalFormat`，`DecimalFormat.getMaximumFractionDigits()` 返回的值现在将是 340，而不是以前的值 `Integer.MAX_VALUE`。这防止了在调用 `DecimalFormat.toPattern()` 时发生 `OutOfMemoryError`。如果所需的最大小数位数超过 340，建议使用方法 `DecimalFormat.setMaximumFractionDigits()` 来实现这种行为。

### `MessageFormat` 模式字符串中的转义 ([JDK-8323699](https://bugs.openjdk.org/browse/JDK-8323699)) 

core-libs/java.text

`MessageFormat` 对象是从包含嵌套子格式模式的模式字符串创建的。相反，`MessageFormat.toPattern()` 实例方法返回的模式字符串应该等同于（尽管不一定相同）原始模式。然而，如果嵌套子格式模式包含引用的（即，打算为纯文本）开括号或闭括号字符（`{` 或 `}`），在某些情况下，该引用可能在模式字符串中被错误地省略。

由于这个错误，从该模式创建新的 `MessageFormat` 可能无法正确解析，抛出异常，或者解析不同，导致新实例与原始实例不等效。

此问题现已修复。修复不会更改 `MessageFormat` 对象的行为，其 `MessageFormat.toPattern()` 输出已经正确引用。

### 在宽松日期/时间解析模式中对空格分隔符的宽松匹配 ([JDK-8324665](https://bugs.openjdk.org/browse/JDK-8324665)) 

core-libs/java.time

现在日期/时间字符串的解析允许 "宽松匹配" 空格。这一增强主要是为了解决 JDK 20 中引入的 [不兼容更改](https://www.oracle.com/java/technologies/javase/20-relnote-issues.html#JDK-8284840)，该版本在某些本地化中用 `NNBSP`（Narrow No-Break Space, `U+202F`）替换了时间和 am/pm 标记之间的 ASCII 空格（`U+0020`）。"宽松匹配" 在宽松解析样式中执行，适用于 `java.time.format` 和 `java.text` 包中的日期/时间解析器。在严格解析样式中，这些空格被视为不同，和以前一样。

要利用 `java.time.format` 包中的 "宽松匹配"，应用程序需要通过调用 `DateTimeFormatterBuilder.parseLenient()` 明确设置宽松性，因为默认解析模式是严格的：

```
    var dtf = new DateTimeFormatterBuilder()
        .parseLenient()
        .append(DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT))
        .toFormatter(Locale.ENGLISH);
```

在 `java.text` 包中，默认解析模式是宽松的。应用程序将能够自动解析所有空格分隔符，这是此功能带来的默认行为变化。如果他们需要严格解析文本，他们可以这样做：

```
    var df = DateFormat.getTimeInstance(DateFormat.SHORT, Locale.ENGLISH);
    df.setLenient(false);
```

### 将 `jdk.vm.internal.FillerArray` 填充数组对象的名称更改为 `[Ljdk/internal/vm/FillerElement;` ([JDK-8319548](https://bugs.openjdk.org/browse/JDK-8319548)) 

hotspot/gc

HotSpot 虚拟机内部的一个类，表示死（无法到达）内存区域，已重命名为符合 Java 类命名标准，以避免混淆解析虚拟机类直方图的外部应用程序 `jmap -histo`。

有些应用程序解析 `jmap -histo` 的输出时失败，遇到类 `jdk.vm.internal.FillerArray`。特别是，这个问题是这种类型的填充对象表示一个灵活大小的无法到达内存范围，但被命名为好像它是一个固定大小的非数组对象。然后，例如，从 `jmap -histo` 输出计算这些对象的实例大小时，可能导致非整实例大小，使应用程序感到困惑。

通过将此类的名称更改为类似数组的名称 `[Ljdk/internal/vm/FillerElement;`，已解决此问题。

### G1: 在引用处理期间增长标记栈 ([JDK-8280087](https://bugs.openjdk.org/browse/JDK-8280087)) 

hotspot/gc

在并发标记阶段，G1 可能会根据需要增加标记栈的大小，从最小值开始，可能达到 `-XX:MarkStackSize` 和 `-XX:MarkStackSizeMax` 命令行选项定义的最大值。

以前，G1 在重新标记暂停期间的引用处理阶段无法增长标记栈，这可能导致标记栈溢出错误，使虚拟机在达到 `-XX:MarkStackSizeMax` 限制之前退出。

此次更新允许在引用处理期间也扩展标记栈，防止这种过早溢出错误。

### 解决使用 `-XX:StartFlightRecording` 时的启动时间回归问题 ([JDK-8319551](https://bugs.openjdk.org/browse/JDK-8319551)) 

hotspot/jfr

JDK 22 中使用 `-XX:StartFlightRecording` 选项时，由于 JFR 字节码 instrumentation 的技术债务，小型应用程序的启动时间显著增加的问题已修复。现在的启动时间与 JDK 21 相当。

### 在 JVM TI、JDWP 和 JDI 中澄清了有争用监视器的含义 ([JDK-8256314](https://bugs.openjdk.org/browse/JDK-8256314)) 

hotspot/jvmti

JVMTI `GetCurrentContendedMonitor` 实现已与规范对齐。因此，只有当指定线程正在等待进入或重新进入监视器时，才返回监视器，并且当指定线程在 `java.lang.Object.wait` 中等待被通知时，不返回监视器。

JDWP `ThreadReference.CurrentContendedMonitor` 命令规格已更新以匹配 JVMTI `GetCurrentContendedMonitor` 规格。现在它指出："线程可能正在等待进入对象的监视器，或者在 java.lang.Object.wait 等待重新进入监视器后被通知、中断或超时。"

从命令描述中删除了这一部分："... 它可能正在等待，通过 java.lang.Object.wait 方法，为另一个线程调用 notify 方法。"

JDI `ThreadReference.currentContendedMonitor` 方法规格已更新以匹配 JVMTI `GetCurrentContendedMonitor` 规格。现在它指出："线程可能正在等待通过进入同步方法、同步语句或 Object.wait() 等待重新进入监视器后被通知、中断或超时。"

在方法描述中添加了这一部分："... 或 Object.wait() 等待重新进入监视器后被通知、中断或超时。"

从方法描述中删除了这一部分："status() 方法可以用来区分前两种情况和第三种情况。"

### 已纠正 JVMTI `GetObjectMonitorUsage` 的实现 ([JDK-8247972](https://bugs.openjdk.org/browse/JDK-8247972)) 

hotspot/jvmti

JVMTI `GetObjectMonitorUsage` 函数返回以下数据结构：

```
    typedef struct {
        jthread owner;
        jint entry_count;
        jint waiter_count;
        jthread* waiters;
        jint notify_waiter_count;
        jthread* notify_waiters;
    } jvmtiMonitorUsage;
```

此结构中的两个字段规定为：

- `waiter_count` [`jint`]：等待拥有此监视器的线程数
- `waiters` [`jthread*`]：`waiter_count` 等待的线程

在以前的版本中，`waiters` 字段包括了按指定等待进入或重新进入监视器的线程，但（错误地）也包括了在 `java.lang.Object.wait()` 中等待被通知的线程。这在当前版本中已修复。`waiter_count` 始终与 `waiters` 字段返回的线程数匹配。

此外，JDWP `ObjectReference.MonitorInfo` 命令规格已更新，以澄清 `waiters` 线程是什么：

> `waiters`："等待进入或重新进入监视器的线程总数，或等待被监视器通知。"

此 JDWP 命令的行为保持不变，并且与 `GetObjectMonitorUsage` 有意不同。

### 在超类构造之前声明的局部类不再具有封闭实例 ([JDK-8328649](https://bugs.openjdk.org/browse/JDK-8328649)) 

tools/javac

在超类构造函数调用参数表达式内部声明的局部类不再编译为具有立即封闭外部实例。

根据 JLS 21 §15.9.2，在静态上下文中声明的局部和匿名类没有立即封闭的外部实例。这包括在某些类 `C` 的构造函数中 `super()` 或 `this()` 调用的参数表达式内声明的类。以前，编译器错误地允许在这些参数表达式内声明的局部类包含对 `C` 外部实例的引用；现在不再允许。尽管以前允许，但这样的引用是无意义的，因为任何随后尝试实例化该类都会触发 `cannot reference this before supertype constructor has been called` 错误。注意，编译器已经正确禁止匿名类包含此类引用。

尽管在 `super()` 或 `this()` 参数表达式中声明一个匿名内部类是容易和常见的，例如在表达式 `super(new Runnable() { ... })` 中，但在 `super()` 或 `this()` 参数表达式中声明一个局部类就不那么常见了，因为它需要更多的语法技巧。这里有一个以前编译但现在在此更改后不再编译的示例：

```
import java.util.concurrent.atomic.*;
public class Example extends AtomicReference<Object> {
    public Example() {
        super(switch (0) {
            default -> {
                class Local {
                    { System.out.println(Example.this); }
                }
                yield null;
                // yield new Local();   // 生成编译器错误
            }
        });
    }
}
```

在此更改之后，对 `Example.this` 的引用将生成 `no enclosing instance of type Example is in scope` 编译器错误。

### `javadoc` 现在需要成员引用中的正确的类名 ([JDK-8164094](https://bugs.openjdk.org/browse/JDK-8164094)) 

tools/javadoc(tool)

已修复 `javadoc` 中的一个错误。以前，`@see` 和 `{@link...}` 标签允许使用嵌套类来限定封闭类的成员名称。它们不再这样做。因此，以前依赖此行为的文档注释现在在由 `javadoc` 处理时将触发警告或错误。

## 7 其他说明

### 添加 GlobalSign R46 和 E46 根 CA 证书 ([JDK-8316138](https://bugs.openjdk.org/browse/JDK-8316138)) 

security-libs/java.security

已向 cacerts 信任库添加了以下根证书：

```
+ GlobalSign
  + globalsignr46
    DN: CN=GlobalSign Root R46, O=GlobalSign nv-sa, C=BE

+ GlobalSign
  + globalsigne46
    DN: CN=GlobalSign Root E46, O=GlobalSign nv-sa, C=BE
```

### 添加 Certainly R1 和 E1 根证书 ([JDK-8321408](https://bugs.openjdk.org/browse/JDK-8321408)) 

security-libs/java.security

已向 cacerts 信任库添加了以下根证书：

```
+ Certainly
  + certainlyrootr1
    DN: CN=Certainly Root R1, O=Certainly, C=US

+ Certainly
  + certainlyroote1
    DN: CN=Certainly Root E1, O=Certainly, C=US
```

### `Subject.getSubject` API 现在需要在命令行上将 `java.security.manager` 系统属性设置为 '`allow`' ([JDK-8296244](https://bugs.openjdk.org/browse/JDK-8296244)) 

security-libs/javax.security

已最终弃用的 `Subject.getSubject(AccessControlContext)` 方法已重新规定，如果在不允许设置安全管理器的情况下调用，则抛出 `UnsupportedOperationException`。

当将来版本中移除安全管理器时，`Subject.getSubject(AccessControlContext)` 方法将进一步降级为无条件抛出 `UnsupportedOperationException`。

强烈鼓励使用 `Subject.doAs` 和 `Subject.getSubject` 的代码维护者尽快将此代码迁移到替代 API，`Subject.callAs` 和 `Subject.current`。可以使用 `jdeprscan` 工具扫描类路径以查找弃用 API 的使用情况，这可能有助于找到这两种方法的使用。

在此版本中，为了保持旧代码的运行，临时解决方案是在命令行上运行 `-Djava.security.manager=allow` 以允许设置安全管理器。`Subject.getSubject` 方法不会设置安全管理器，但由于 `AccessControlContext` 参数，它需要该特性被 "允许"。

作为背景，此版本中的更改是帮助应用程序准备最终移除安全管理器。对于此版本，当允许安全管理器时，即在命令行上将系统属性 `java.security.manager` 设置为空字符串、类名或值 "allow" 时，subject 授权和 `Subject` API 的行为与以前版本相比没有变化。

如果不允许安全管理器，即在命令行上未设置系统属性 `java.security.manager` 或将其设置为值 "disallow"，则 `doAs` 或 `callAs` 方法将执行一个带有 `Subject` 作为当前 subject 的操作，并限制执行操作的时间。Subject 可以通过在由操作执行的代码中调用 `Subject.current` 方法获得。`Subject.getSubject` 方法无法获得 Subject，因为该方法将抛出 `UnsupportedOperationException`。Subject 不会自动继承到使用 `Thread` API 创建或启动的新线程中。当使用 [结构化并发](https://openjdk.org/jeps/462) 时，Subject 将由子线程继承。

如上所述，强烈鼓励使用 `Subject.doAs` 和 `Subject.getSubject` 的代码维护者尽快将代码迁移到 `Subject.callAs` 和 `Subject.current`。

存储在 `AccessControlContext` 中的 Subject 并使用该上下文调用 `AccessController.doPrivileged` 的代码也应该尽快迁移，因为当安全管理器被移除时，此代码将停止工作。

使用 `Subject` API 的代码维护者还应该审计代码，查找可能依赖于当前 Subject 继承到新创建线程的任何情况。应该修改此代码，将 Subject 传递给新创建的线程，或修改为使用结构化并发。

### 方法 `RandomGeneratorFactory.create(long)` 和 `create(byte[])` 现在抛出 `UnsupportedOperationException` 而不是回退到 `create()` ([JDK-8332476](https://bugs.openjdk.org/browse/JDK-8332476)) 

core-libs/java.util

在以前的版本中，如果底层算法不支持 `long` 种子，则 `RandomGeneratorFactory.create(long)` 会回退到调用无参数的 `create()` 方法。`create(byte[])` 方法的工作方式类似。

从这个版本开始，这些方法现在抛出一个 `UnsupportedOperationException`，而不是默默地回退到 `create()`。

### `GZIPInputStream` 不再使用 `InputStream.available()` 检查是否存在串联的 GZIP 流 ([JDK-7036144](https://bugs.openjdk.org/browse/JDK-7036144)) 

core-libs/java.util.jar

已修改 `GZipInputStream` 的 `read` 方法，以删除在确定流是否包含串联的 GZIP 流时使用 `InputStream::available()`。这些方法现在将读取底层 `InputStream` 中的任何额外数据，并检查 GZIP 流标头的存在。

### 支持 CLDR 版本 45 ([JDK-8319990](https://bugs.openjdk.org/browse/JDK-8319990)) 

core-libs/java.util:i18n

基于 Unicode 联盟 CLDR 的本地化数据已升级到版本 45。除了通常添加新的本地化数据和翻译更改外，还有一个值得注意的数字格式变化来自上游 CLDR，影响了 `java.text.CompactNumberFormat` 类：

- 意大利语 "百万" 的紧凑形式切换回 "Mln" ([CLDR-17482](https://unicode-org.atlassian.net/browse/CLDR-17482)) 

请注意，本地化数据可能会在 CLDR 的未来版本中更改。尽管并非所有本地化数据更改都影响 JDK，但用户不应假设跨版本稳定。有关更多详细信息，请参阅 [Unicode 联盟的 CLDR 发布说明](https://cldr.unicode.org/index/downloads/cldr-45) 及其 [本地化数据差异](https://unicode.org/cldr/charts/45/delta/index.html)。

### `ClassLoadingMXBean` 和 `MemoryMXBean` 的 `isVerbose` 方法现在与其 `setVerbose` 方法一致 ([JDK-8338139](https://bugs.openjdk.org/browse/JDK-8338139)) 

core-svc/java.lang.management

`ClassLoadingMXBean::setVerbose(boolean enabled)` 方法将根据 `enabled` 是否为 true，将 `class+load*` 日志输出设置为 `stdout` 的 `info` 级别，否则设置为 `off`。相比之下，`isVerbose` 方法将检查是否在 *任何* 日志输出上启用了 `class+load` 日志的 `info` 级别。这可能导致当通过命令行将日志 `class+load=info` 输出到文件时，出现违反直觉的行为，因为即使在调用 `setVerbose(false)` 之后，`isVerbose` 也返回 true。`MemoryMXBean::isVerbose` 方法存在类似问题。从这个版本开始，行为如下：

- `ClassLoadingMXBean::isVerbose` 只有在 `class+load*` 日志（注意通配符的使用）在 `stdout` 日志输出上启用了 `info` 级别（或更高）时，才返回 true。
- `MemoryMXBean::isVerbose` 只有在 `gc` 日志在 `stdout` 日志输出上启用了 `info` 级别（或更高）时，才返回 true。

### 由于 `ICBufferFull` 安全点导致的延迟问题已解决 ([JDK-8322630](https://bugs.openjdk.org/browse/JDK-8322630)) 

hotspot/compiler

`invokevirtual` 字节码实现依赖于旋转起机器代码存根称为 "内联缓存存根" 以实现更好的性能。然而，这些存根是在固定大小的缓冲区中创建的，当缓冲区耗尽时，会安排安全点来重新填充缓冲区。这可能导致延迟问题。在并发类卸载使用 ZGC 时，这个问题尤其成问题。该问题已通过返回到存根最初设定的问题并用不同方式解决而无需任何存根来解决。

### Parallel GC 在堆完全扩展之前抛出 OOM ([JDK-8328744](https://bugs.openjdk.org/browse/JDK-8328744)) 

hotspot/gc

一个现有错误可能阻止了完全使用通过命令行标志 `-Xmx` 分配的 Java 堆。该错误已通过 [JDK-8328744](https://bugs.openjdk.org/browse/JDK-8328744) 修复。作为一个副作用，使用 Parallel GC 时，安装可能会出现增加的堆使用情况。客户如有必要，应调整最大堆大小。

### 将 LockingMode 默认从 `LM_LEGACY` 更改为 `LM_LIGHTWEIGHT` ([JDK-8319251](https://bugs.openjdk.org/browse/JDK-8319251)) 

hotspot/runtime

在 JDK 21 中引入了一种新的轻量级锁定机制，用于无争用对象监视器锁定 [JDK-8291555](https://bugs.openjdk.org/browse/JDK-8291555)。引入了 `LockingMode` 标志以允许选择这种新机制（`LM_LIGHTWEIGHT`，值 2）来代替默认机制（`LM_LEGACY`，值 1）。在此版本中，`LockingMode` 默认已更改为 `LM_LIGHTWEIGHT`。

这不会改变 Java 监视器锁定的任何语义行为。预计几乎所有应用程序在性能上都是中性的。

如果需要恢复到旧机制，可以设置命令行标志 `-XX:LockingMode=1`，但请注意旧模式预计将在未来版本中被移除。

### 放宽数组元素的对齐 ([JDK-8139457](https://bugs.openjdk.org/browse/JDK-8139457)) 

hotspot/runtime

数组元素基现在不再无条件地对齐到八字节。相反，它们现在对齐到其元素类型大小。这在某些 JVM 模式下改善了占用空间。由于 Java 数组元素对齐不向用户公开，因此对常规 Java 代码没有影响，这些代码访问各个元素。

对于批量访问方法，有一些含义。Unsafe 访问数组现在可能是未对齐的。例如，`Unsafe.getLong(byteArray, BYTE_ARRAY_BASE_OFFSET + 0)` 不能保证在不允许未对齐访问的平台工作上。一个变通方法是 `Unsafe.{get, put}Unaligned*` 方法族。允许查看 `byte[]` 的 `ByteBuffer` 和 `VarHandle` API 已更新以反映这一变化 ([JDK-8318966](https://bugs.openjdk.org/browse/JDK-8318966))。通过 `GetPrimitiveArrayCritical` 获取的数组不应在假设特定数组基对齐的情况下操作。

### 使 `TrimNativeHeapInterval` 成为产品开关 ([JDK-8325496](https://bugs.openjdk.org/browse/JDK-8325496)) 

hotspot/runtime

`TrimNativeHeapInterval` 已成为官方产品开关。它允许 JVM 在定期间隔时修剪本地堆。

此选项仅在 Linux 上与 glibc 可用。

### `clhsdb jstack` 默认不再扫描 `java.util.concurrent` 锁 ([JDK-8324066](https://bugs.openjdk.org/browse/JDK-8324066)) 

hotspot/svc-agent

`jhsdb clhsdb` 中的 `jstack` 命令已修改，只有在给出 `-l` 选项时才扫描 `java.util.concurrent` 锁。搜索这些锁是一个非常昂贵的操作，需要扫描整个堆。`jhsdb jstack` 和 `bin/jstack` 命令也有能力在输出中包含此锁定信息，但默认不这样做。

### Linux 上的本地可执行文件和库使用 `RPATH` 而不是 `RUNPATH` ([JDK-8326891](https://bugs.openjdk.org/browse/JDK-8326891)) 

infrastructure/build

在此版本中，Linux 上的本地可执行文件和库已切换为使用 `RPATH` 而不是 `RUNPATH`。

JDK 本地可执行文件和库使用嵌入式运行时搜索路径来定位其他内部 JDK 本地库。在 Linux 上，这些可以定义为 `RPATH` 或 `RUNPATH`。主要区别在于动态链接器在考虑 `LD_LIBRARY_PATH` 环境变量之前考虑 `RPATH`，而 `RUNPATH` 仅在 `LD_LIBRARY_PATH` 之后考虑。

通过改为使用 `RPATH`，不再可能使用 `LD_LIBRARY_PATH` 替换 JDK 内部本地库。

### 安装 DEB 和 RPM Java 包在版本目录中 (JDK-8325265 (非公开))

install/install

Oracle JDK 在 RPM 和 DEB 包中的安装目录名称已从 `/usr/lib/jvm/jdk-${FEATURE}-oracle-${ARCH}` 更改为 `/usr/lib/jvm/jdk-${VERSION}-oracle-${ARCH}`。

每个更新版本将在 Linux 平台上安装在单独的目录中。

安装程序将创建一个指向安装目录的 `/usr/java/jdk-${FEATURE}-oracle-${ARCH}` 链接，以允许程序找到 `${FEATURE}` 版本列车中的最新 JDK 版本。

### 增加 `CipherInputStream` 缓冲区大小 ([JDK-8330108](https://bugs.openjdk.org/browse/JDK-8330108)) 

security-libs/javax.crypto

`CipherInputStream` 的内部缓冲区大小已从 512 字节增加到 8192 字节。

### POST 仅 OCSP 请求的回退选项 ([JDK-8328638](https://bugs.openjdk.org/browse/JDK-8328638)) 

security-libs/javax.security

JDK 17 引入了一个性能改进，使 OCSP 客户端无条件地对小型请求使用 GET 请求，而对其他所有请求执行 POST 请求。这是 RFC 5019 和 RFC 6960 明确允许和推荐的。然而，我们已经看到，尽管 RFC 要求，但有些 OCSP 响应器对 GET 请求的响应并不好。

此版本引入了一个新的 JDK 系统属性，允许客户端回退到仅 POST 的行为。这通过使用 `-Dcom.sun.security.ocsp.useget={false,true}` 来解决与那些 OCSP 响应器的交互问题。这修正了最初引入 GET OCSP 请求的更改 ([JDK-8179503](https://bugs.openjdk.org/browse/JDK-8179503))。默认行为没有改变；该选项默认为 `true`。将选项设置为 `false` 以禁用 GET OCSP 请求。任何除 `false` 之外的值（不区分大小写）默认为 `true`。

这个选项是非标准的，可能会在有问题的 OCSP 响应器升级后消失。

### 增强 Kerberos 调试输出 ([JDK-8327818](https://bugs.openjdk.org/browse/JDK-8327818)) 

security-libs/org.ietf.jgss

与 JGSS/Kerberos 相关的调试输出，包括 JAAS `Krb5LoginModule`、JGSS 框架以及 Kerberos 5 和 SPNEGO 机制（无论是纯 Java 实现还是通过本地桥接实现）的调试输出，现在直接定向到标准错误输出流 (`System.err`) 而不是标准输出流 (`System.out`)。此外，调试输出现在带有类别标签前缀，如 `krb5loginmodule`、`jgss`、`krb5` 等。

### 内部类的类型元素名称始终是限定的 ([JDK-8309881](https://bugs.openjdk.org/browse/JDK-8309881)) 

tools/javac

`javax.lang.model.type.TypeMirror::toString` 对于内部类始终返回限定的类名。

### 添加 DejaVu Web 字体 ([JDK-8324774](https://bugs.openjdk.org/browse/JDK-8324774)) 

tools/javadoc(tool)

默认情况下，生成的 API 文档现在包括默认样式表使用的 DejaVu Web 字体。

已向标准 Doclet 添加了一个新的 `--no-fonts` 选项，以便在不需要 Web 字体时从生成的文档中省略它们。

原文：https://jdk.java.net/23/release-notes