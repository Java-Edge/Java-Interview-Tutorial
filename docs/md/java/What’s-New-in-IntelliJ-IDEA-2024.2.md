# IntelliJ IDEA 2024.2 最新变化

## 0 前言

IntelliJ IDEA 2024.2 允许你直接在 IDE 运行 Spring Data JPA 方法，即时验证存储库查询。

简化了 `cron` 表达式管理，提供内联描述和高级自动补全功能，并升级 HTTP 客户端，使其使用 GraalJS 执行引擎。

该版本通过在项目索引期间启用关键功能，提高 IntelliJ IDEA 整体启动效率。

## 1 主要亮点

### 1.1 改进的 Spring Data JPA 支持

为了持续提升 IntelliJ IDEA 对 Spring 框架的支持，增加了在 IDE 中运行 Spring Data JPA 方法的功能。

允许你在不运行应用程序和分析日志文件的情况下，查看方法将生成的查询。现在，可使用边栏图标直接在 JPA 控制台中执行任何存储库方法。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/6df73eeac4cbc8aa0ee52cd7641dac74.png)

### 1.2 改进的 `cron` 表达式支持

现在，处理代码中的 `cron` 表达式变得更加简单。当使用 Spring、Quarkus 或 Micronaut 实现定时服务时，旁边显示的描述使你可以轻松理解 `cron` 表达式。此外，自动补全功能提供了预填的示例，你可以直接添加并调整，而不必从头编写 `cron` 表达式。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/cron-expressions.png)

### 1.3 HTTP 客户端中使用 GraalJS 作为执行引擎

将 HTTP 客户端中使用的 JavaScript 执行引擎升级为 GraalJS。用 IntelliJ IDEA 的 HTTP 客户端测试端点并在 `.http` 文件中使用 JavaScript 处理结果时，可利用所有 GraalJS 功能，包括对 ECMAScript 2023 规范的全面支持。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/GraalJS-in-HTTP-Client.png)

### 1.4 更快的编码启动速度

在 2024.2 版本中，改进启动体验，使你可以更快地进入编码状态。通过升级，使 IDE 在项目模型未完全加载时仍然能够使用，并且在索引期间启用代码高亮、代码补全、意图操作、测试启动、活动 Gutter 标记、Lombok 支持等关键功能，从而显著减少等待时间。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Faster-time-to-code.png)

## 2 用户体验

### 2.1 改进的整行代码补全功能

在 2024.2 版本中，使接受整行代码补全建议的过程更加直观和精确。内联代码补全建议现在包括代码高亮功能，并且新的快捷键允许你从较长的建议中接受单个词或整行。还改进了接受的更改与代码集成的方式，消除了格式和相关问题。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/FFC-shortcut.png)

### 2.2 新 UI 默认启用

IntelliJ IDEA 2024.2 现在将新 UI 设置为所有用户的默认界面，经典界面则作为插件提供。新 UI 简洁现代，提供了更大、更易用的控件、一致的配色方案、清晰的图标、更高的对比度和更好的强调色。由于新 UI 的高采用率，且根据反馈修复了主要问题，相信它已经为所有人做好了准备。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/New_UI.png)

### 2.3 *搜索所有内容* 中的预览选项

*搜索所有内容* 对话框现在包含一个选项，可以预览你正在搜索的代码库元素。通过点击对话框工具栏上的 *预览* 图标，你可以在搜索结果下方显示一个预览窗格，提供额外的上下文，使你更容易在项目中导航。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Preview-in-SE.png)

### 2.4 新用户默认启用代理设置自动检测

IntelliJ IDEA 现在会自动检测你机器上配置的系统代理设置，并默认使用它们，以便无缝地与外部资源和服务进行交互。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Proxy_settings.png)

### 2.5 改进的 *自定义主工具栏* 对话框

重新设计了 *自定义主工具栏* 对话框中 UI 元素的布局和行为，使其更加直观和有序。现在，更容易搜索、添加和删除主工具栏中的操作。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Customize_Main_Toolbar.png)



## 3 Java

### 3.1 增强的日志管理

IntelliJ IDEA 2024.2 为 Java 引入了增强的日志管理。新功能包括字符串字面量的高亮显示和参数解析功能，允许你无缝地从占位符导航到相应的参数。更新的检查现在更好地处理不匹配的记录器参数数量，建议将 `System.out.println` 语句转换为记录器调用，并提供添加记录器调用保护的快速修复。[了解更多](https://blog.jetbrains.com/idea/2024/06/intellij-idea-2024-2-eap-6/#enhanced-log-management-for-java-and-kotlin)。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/log-management_4.png)







### 3.2 新增 *表达式与自身进行比较* 的检查

一个新的检查报告了表达式与自身进行比较而不是与另一个进行比较的情况。虽然这种比较有时是有意为之，但通常是由于疏忽所致。此检查帮助你识别并解决这些可能不是故意的比较，从而提高代码的准确性和可靠性。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Compared-to-itself-inspection.png)

### 3.3 *更改签名* 重构内联提示

为了使 *更改签名* 重构更易于访问和直观，添加一个新的内联提示，该提示显示在修改后的代码元素附近。单击它并确认更改后，IDE 会自动更新整个代码库中的所有相关方法引用。这确保了一致性并减少了错误的风险，从而简化了你的重构过程。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Change-Signature-refactoring-inlay-hint.png)

## 4 Scala

### 4.1 Scala 中更好的代码高亮

IntelliJ IDEA 2024.2 包括对错误和语法高亮的多个改进。现在，它会将参数子句中定义的类字段高亮显示为字段而不是参数。命名参数现在以不同的颜色高亮显示，使它们在代码中更易于识别。`Regex("...")` 中的正则表达式语法和 `"...".r` 中的正则表达式语法一样被高亮显示。我们修复了一些问题，这些问题导致有效的代码在重构后或由于无法解析符号类型而被标记为红色。在许多情况下，语义高亮现在会在你键入时应用。此外，在修复错误时，IDE 现在更具响应性，修复后立即移除红色代码。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/04_code_highlighting_named_params.png)

### 4.2 更好的 Scala 3 支持

新版本包括对 Scala 3 支持的诸多改进。`For` 解析与减少大括号语法一起使用时，现在始终能够正确处理。导出子句和扩展方法的支持得到了改进。此外，IDE 现在正确处理构造函数注解，并且导入建议包括枚举案例。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/02_Scala3_export_clauses.png)

### 4.3 更好的代码补全

IDE 现在可以自动填写方法的所有命名参数，并在 Scala 3 中自动补全联合类型的文字值。当预期为枚举类型时，现在会建议枚举案例。此功能适用于 Scala 3 枚举和联合类型、Scala 2 ADT 和枚举以及 Java 枚举，通过提供更相关的建议简化你的编码体验。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/06_code_completion_params.png)

### 4.4 其他改进

现在在调试器中将 `StringBuilder` 的内容显示为字符串。IntelliJ IDEA 还为 Scala 提供了入门提示。在导入 sbt 项目时，现在可以看到库下载进度。此外，Scala 支持现在包括 [Grazie](https://www.jetbrains.com/grazie/) 的功能，后者在 Scala 注释中提供高级拼写和语法检查。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/10_grazie_at_work.png)

### 4.5 改进的基于编译器的高亮

增强了基于编译器的错误高亮性能。在文件被修改时，不再应用过时的错误高亮信息。此外，IntelliJ IDEA 现在支持 Scala 编译器诊断，将它们作为常规快速修复提供，便于轻松应用。

## 5 代码编辑器

### 5.1 支持 Markdown 文件中的数学语法

现可原生渲染 Markdown 文件中的数学表达式。在处理 Markdown 时，可以使用 `$` 插入内联数学表达式，使用 `$$` 插入包含数学内容的代码块。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Math_in_Markdown.png)

### 5.2 语言感知的固定行

现可选择希望在哪些语言中显示固定行。可在 *Settings/Preferences | Editor | General | Sticky Lines* 中定制此功能或通过右键点击编辑器中的固定行来调出上下文菜单进行设置。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Sticky_lines_settings.png)

## 6 性能分析器

### 6.1 性能分析器中的项目方法聚焦

IntelliJ IDEA 的内置性能分析器已升级，简化了性能瓶颈的调查。现在，IntelliJ IDEA 在性能分析器中更关注你的代码，通过淡化和折叠库调用，确保你获取的性能数据集中在对应用性能影响最大的项目调用上，过滤掉不需要关注的方法。如果你需要查看库调用的详细信息，可以展开隐藏的调用以查看整个调用序列及相应的执行时间。点击调用旁边的超链接或 `+` 图标即可进一步探索。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Focus-on-project-methods.png)

## 7 运行/调试

### 7.1 *运行* 工具窗口中的性能图表

为使性能分析更快、更高效，我们在 *运行* 工具窗口中实现了新的 *性能* 选项卡。它提供了实时 CPU 和内存图表，并允许你通过捕获代码执行时间并直接在编辑器中查看来定位性能瓶颈。此外，你还可以捕获内存快照，以检查对象并识别内存泄漏的根本原因。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Performance_charts_in_the_Run_tool_window_2.png)

### 7.2 JSON、XML 和其他格式的字符串变量可视化

调试和浏览具有复杂数据格式的长字符串变量现在更加容易。更新后的调试器为 JSON、XML、HTML、JWT 和 URL 编码的字符串变量提供了正确格式化的可视化显示。只需点击变量旁边的 *查看* 超链接，调试器会根据变量内容自动选择相关的可视化工具。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Vizualizers.png)

### 7.3 当前功能分支更改的测试覆盖率

IntelliJ IDEA 2024.2 进一步提升了你快速检查和改进本地测试覆盖率的能力，而无需通过缓慢的 CI/CD 管道。*覆盖率* 工具窗口现在只显示当前功能分支中已更改的类，使你能够检查最近更改的测试覆盖率，而无需浏览整个项目状态。要查看整个项目的测试覆盖率并查看所有类，可以禁用 *仅显示修改的类* 选项。

![](https://www.jetbrains.com/idea/whatsnew/2024-2/img/Test-coverage-for-changes-in-the-current-feature-branch.png)