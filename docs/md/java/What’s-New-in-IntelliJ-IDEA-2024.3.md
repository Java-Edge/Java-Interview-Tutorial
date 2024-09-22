# IntelliJ IDEA 2024.3 最新变化

## 0 前言

IntelliJ IDEA 2024.3 第一个 EAP 版本已发布，提前体验

下一个重大版本的一部分改进。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/550786d43cef4bce118c52abb4272334.png)

持续关注 EAP 更新，未来几周内将推出更多 IntelliJ IDEA 新功能。尝试这些新功能，分享您的反馈，共同完善 IDE。

## 1 AI 助手

### 1.1 内嵌 AI 提示词

推出一种全新方式，直接在编辑器中与 AI 助手互动：实验性的内嵌输入功能，可在你键入时检测并处理请求。你可用自然语言表达意图，AI 助手会立即解析并将其转化为代码修改，无需额外操作。此功能目前支持 Java。

只需在想调整的地方输入提示词，按 *Tab*，若结果不理想，可 *Ctrl+Z* 撤销更改，修改提示词后再试

![](https://blog.jetbrains.com/wp-content/uploads/2024/09/image-1.gif)

## 2 Java

### 2.1 常量条件改进

显著增强了数据流引擎的功能，特别是在处理别名情况时的支持。能在引用可能指向同一实例的情况下提供更准确的分析。

例子：

![](https://blog.jetbrains.com/wp-content/uploads/2024/09/image-8.png)

之前，IntelliJ IDEA 会将 `a1` 和 `a2` 视为完全不同的实例，这通常是合理的假设。然而，情况并非总是如此。

![](https://blog.jetbrains.com/wp-content/uploads/2024/09/image-7.png)

如果我们将相同的引用传递给两个参数，该函数实际上会输出“ALIASED!”——表明 `a1` 和 `a2` 实际上是同一实例。

![](https://blog.jetbrains.com/wp-content/uploads/2024/09/image.gif)

通过改进的数据流引擎，IntelliJ IDEA 现在能够更准确地处理这种别名情况，减少检查中的误报，提供更可靠的编码体验。

## 3 用户体验

### 3.1 索引期间的拼写和语法检查

在 2024.2 版本的基础上，继续优化项目模型构建和索引期间的等待时间，确保关键功能即时可用。此次更新中，拼写和语法检查现在在索引进行时也可用，这样可在无需等待索引完成的情况下捕捉 Markdown 文档和标签中的错误。

![](https://blog.jetbrains.com/wp-content/uploads/2024/09/image-4.png)

### 3.2 *Welcome* 界面中显示分支名称

*Welcome* 界面现在显示分支名称，帮助你在处理多个项目版本时保持有序，并轻松切换工作目录。

![](https://blog.jetbrains.com/wp-content/uploads/2024/09/image-3.png)

### 3.3 IntelliJ IDEA 中的工作区

此次 EAP 版本包含最近推出的工作区功能，允许同时管理多个项目，每个项目使用不同的技术栈和构建工具，且独立运行。目前，设置工作区需要从 JetBrains Marketplace 安装[插件](https://plugins.jetbrains.com/plugin/24765-multi-project-workspace)。更多关于此功能的概念、使用场景及实现细节，参阅[博客文章](https://blog.jetbrains.com/idea/2024/08/workspaces-in-intellij-idea/)。

该功能仍处于早期开发阶段：

![](https://blog.jetbrains.com/wp-content/uploads/2024/09/image-2.png)

## 4 Debugger

### 增强版 HotSwap 功能

使其更加易用和直观。HotSwap 机制允许您在调试会话期间重新加载已修改的类，而无需重新启动应用程序。现在，当您在激活的调试器会话中编辑代码时，IntelliJ IDEA 会自动检测到更改，并通过编辑器中的便捷按钮提示您重新加载这些更改。

这简化了开发过程，使代码更新可实时进行。

> HotSwap 具有一些限制，特别是在结构性更改方面。了解更多信息，请参见[此处](https://www.jetbrains.com/help/idea/altering-the-program-s-execution-flow.html#hotswap-limitations)。

![img](https://blog.jetbrains.com/wp-content/uploads/2024/09/HotSwap.gif)

## 5 Build tools

### 多模块项目中的编译加速

在以前的 IntelliJ IDEA 版本中，项目模块是逐个编译的，对于大型项目来说，这并不是最快的方式。尽管并行编译已经作为选项存在了一段时间，但由于担心高 CPU 和内存使用，它一直未成为默认设置。

随着更多人使用现代化且更强大的硬件，决定在 IntelliJ IDEA 2024.3 中将并行编译设置为默认选项。这意味着所有基于 Maven 的项目在 IDE 中的编译速度将显著提升。通过自动模式，IDE 还确保不会消耗过多资源。

![](https://blog.jetbrains.com/wp-content/uploads/2024/09/MultiModuleCompilation.png)

### 无缝处理不受信任的 SSL 证书

从 IntelliJ IDEA 2024.3 EAP 2 开始，IDE 会在 Maven 同步或构建过程中自动检测到 SSL 相关问题。如果问题是由不受信任的证书引起的，IntelliJ IDEA 将提供解决方案，帮助您信任该证书——无需手动干预。

这一更新消除了在日志中排查 SSL 错误的猜测工作，免去在 JDK 的受信任存储中手动管理证书的繁琐步骤。

![img](https://blog.jetbrains.com/wp-content/uploads/2024/09/image-16.png)