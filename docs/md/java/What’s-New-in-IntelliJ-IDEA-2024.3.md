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

## 0 前言

IntelliJ IDEA 2024.3 引入了一系列可以提升您的开发体验的强大新功能。 IDE 现在提供代码逻辑结构的表示，简化了 Kubernetes 应用程序的调试体验，引入了集群范围的 Kubernetes 日志访问。

## 1 关键亮点

### 1.1 *Structure*工具窗口中的 *Logical*代码结构

![](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Logical_Structure_preview.png)

不仅可查看类、方法和字段，还可查看项目中组件之间的链接和交互。 例如，在 Spring Boot 应用程序中打开控制器时，您可以看到其端点和自动装配的应用程序组件。 这种增强型视图可以:

- 帮助理解项目结构
- 让您可跟踪代码用法和有意义的连接来浏览项目

### 1.2 改进的 Kubernetes 应用程序调试体验

![](https://www.jetbrains.com/idea/whatsnew/2024-3/img/K8s-debugging_preview.png)

进一步简化了 Kubernetes 应用程序的调试。 只需点击 *Debug*（调试）按钮旁边的省略号并选择 *Add Tunnel for Remote Debug*（为远程调试添加隧道）即可激活隧道调试。 这使您的工作站成为 Kubernetes 集群的虚拟部分，这样一来，您可以交换 pod 并使用您喜欢的工具在本地调试微服务。 其他微服务将与您的工作站交互，就好像它是您正在调试的 pod 一样，并包含对集群其余部分的完全访问。 即使非 Kubernetes 感知的调试器也能完美运行。 此外，Kubernetes UI 中 *Services*（服务）工具窗口下新的 *Forward Ports*（转发端口）部分可以简化端口转发。

### 1.3 Kubernetes 集群日志

![](https://www.jetbrains.com/idea/whatsnew/2024-3/img/K8s-log_preview.png)

现提供具有流式传输和模式匹配功能的集群范围 Kubernetes 日志访问 – 这是开发者及 DevOps 和 SRE 团队必备工具。 这项功能提供跨 pod、节点和服务的所有事件的集中视图，助快速发现问题，而无需手动检查每个日志：

- 实时流式传输可实现即时诊断
- 模式匹配可自动检测关键事件和错误，如内存不足问题或异常网络活动。 详阅[这篇博文](https://blog.jetbrains.com/idea/2024/09/intellij-idea-2024-3-eap-3/#kubernetes-cluster-logs)。

![](https://www.jetbrains.com/idea/whatsnew/2024-3/img/k2-mode_preview.png)

## 2 AI Assistant

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Inline-prompts_preview.png)

### 内联 AI 提示

IntelliJ IDEA 2024.3 引入内联 AI 提示，提供了直接在编辑器中与 AI Assistant 交互的无缝途径。 您可以用自然语言输入请求，AI Assistant 会立即分析并将其转换为代码更改，在装订区域用紫色标记以便跟踪。 内联 AI 提示具有上下文感知功能，可以自动包含相关文件和符号，从而更准确地生成代码。 此功能支持 Java、Kotlin、Scala、Groovy、JavaScript、TypeScript、Python、JSON 和 YAML 文件格式，并且可供所有 AI Assistant 订阅者使用。

![](https://www.jetbrains.com/idea/whatsnew/2024-3/img/AI-Assistant-context.png)

### 改进的上下文管理

在此更新中，对于 AI Assistant 在其建议中考虑的上下文，我们使其管理更加透明和直观。 改进的 UI 可让您查看和管理作为上下文包含的每个元素，提供完全的可见性和控制。 现在，打开的文件以及其中选择的代码都会自动添加到上下文中，您可以根据需要轻松添加或移除文件，自定义上下文以适合您的工作流。 此外，您还可以附加项目范围的指令来指导 AI Assistant 在整个代码库中的响应。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/AI-chat-model-selection.png)

### 选择聊天模型提供商的选项

如 Google Gemini、OpenAI 或您机器上的本地模型。 有更多选择，可自定义 AI 聊天的响应以适合您的具体工作流，享受适应性更强的个性化体验。

## 3 Java

### 常量条件中的改进

IntelliJ IDEA 数据流引擎可更准确处理别名情况，有助于减少检查中的误报，带来更可靠的编码体验。 此增强可以改进引用可能指向同一实例时的分析。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Code-formatter_preview.png)

### Java 代码格式化程序改进

IntelliJ IDEA 的代码格式化程序现在允许您在注解和字段声明之间保留空行，这是 JPA 实体中常用的样式，可以提高可读性。 此前，格式化程序默认会移除这些行。 控制此行为的新选项位于 *Settings | Editor | Code Style | Java | Blank Lines*（设置 | 编辑器 | 代码样式 | Java | 空行）下。

## 4 用户体验



### 索引编制期间的拼写和语法检查

![](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Spell_checks_during_indexing.png)

基于 2024.2 版本取得的进展，我们增加了项目模型构建和索引编制期间可用的关键功能的数量。 在 2024.3 版本中，拼写和语法检查在索引编制期间也可运行。 这样，您无需等待索引编制完成即可捕获错误，例如 Markdown 文档和文档标记中的错误。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Run-widget-mutiple-configs.png)

### *Run*（运行）微件：同时启动多个配置的选项

借助更新后的 *Run*（运行）微件，您可以按住 Ctrl 并点击弹出窗口中的 *Debug*（调试）图标，同时启动多个配置。 另外，此微件还会显示所有运行中配置的控件，提供清晰的状态概览并简化管理。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/tabs_preview.png)

### 提高的默认标签页上限

我们将编辑器中的默认标签页上限提高到了 30 个。 这意味着在 IDE 开始关闭最近使用最少的标签页之前，您现在可以保留更多标签页。 您可以在 *Settings | Editor | General | Editor Tabs*（设置 | 编辑器 | 常规 | 编辑器标签页）中控制此设置。

- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Rename-action_1.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Rename-action_2.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Rename-action_1.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Rename-action_2.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Rename-action_1.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Rename-action_2.png)

### 优化的 *Rename*（重命名）操作位置

我们优化了 *Rename*（重命名）操作在编辑器和 *Project*（项目）工具窗口中的元素上调用时在上下文菜单中的位置。 此操作现在位于顶层，方便经常使用鼠标的用户快速重命名文件、变量和其他元素。

- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Occurences-highlighting_1.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Occurences-highlighting_2.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Occurences-highlighting_1.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Occurences-highlighting_2.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Occurences-highlighting_1.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Occurences-highlighting_2.png)

### 高亮显示所选文本的所有匹配项

默认情况下，IntelliJ IDEA 现在会自动高亮显示您在文件中选择的文本的所有实例。 这使得跟踪所选文本在整个代码中出现的位置更加简单。 如果您更喜欢此前的行为，您可以在 *Settings | Editor | General | Appearance*（设置 | 编辑器 | 常规 | 外观）中禁用此功能。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Icon-for-messages-and-i18s.png)

### 消息和 i18n 文件的新图标

通过新的专属图标，我们使消息和 i18n 文件更易区分。 此更新可以帮助您快速定位和管理项目中的本地化文件，使其更容易与配置文件区分。

- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Java-New-popup_1.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Java-New-popup_2.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Java-New-popup_1.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Java-New-popup_2.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Java-New-popup_1.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Java-New-popup_2.png)

### Java 源根更新的 *New*（新建）弹出窗口

用于将文件添加到 Java 源根的 *New*（新建）弹出窗口现在仅显示最相关的选项，减少了混乱并简化了您的工作流。 如果您更喜欢此前的扩展模板列表，您可以转到 *Settings | Advanced Settings | Java*（设置 | 高级设置 | Java）轻松恢复。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Floating-toolbar-for-json-xml-yaml-sql.png)

### JSON、XML 和 YAML 文件的浮动工具栏

我们为 JSON、XML 和 YAML 文件启用了浮动工具栏，使访问基于上下文和 AI 驱动的操作更加简单。 选择任意一段代码，工具栏就会出现可用操作。

## 5 终端

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/new-terminal_1.png)

### 新终端改进 Beta

新终端现在提供增强的命令处理，其 UI 的对齐也得到改进，营造出更流畅、更直观的体验。 现在，终端的响应速度更快，处理提示的速度也更快。 会话现在可以无缝切换，并且各标签页的状态保持一致，确保工作流不会中断。 自动补全可以更快访问命令名称、标志和路径，帮助减少手动输入。 我们还引入额外自定义选项，包括提示样式、会话名称和环境变量，让您更好地控制终端环境。

## 6 版本控制系统

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/PR_MR-titles-description-generation.png)

### 拉取与合并请求的标题和描述生成

现在，AI Assistant 可以帮助您直接从 IDE 为拉取与合并请求生成准确的标题和描述，从而简化您的工作流并确保您的描述清晰直观。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Gitignore-filter.png)

### *Find in Files*（在文件中查找）的更新

*Find in Files*（在文件中查找）功能得到增强，增加了新的搜索范围 *Project Files Excluding Git-Ignored*（项目文件，不包括 Git 忽略的文件）。 此选项将从搜索结果中排除 `.gitignore` 文件中忽略的任意文件，帮助您在项目中搜索时只关注相关代码。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/precommit-checks-setting.png)

### 禁用后台预提交检查的选项

现在，您可以使用 *Settings | Version Control | Commit*（设置 | 版本控制 | 提交）下的新选项 *Run advanced checks after a commit is done*（提交完成后运行高级检查）在提交过程中管理后台检查。 通过此设置，您可以决定是否在提交后运行测试和检查。 如果您希望在提交之前完成这些检查，将其禁用即可。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/branch_name_on_Welcome_screen.png)

### *Welcome*（欢迎）屏幕上的分支名称

*Welcome*（欢迎）屏幕现在会显示分支名称，帮助您在处理多个项目版本时保持整齐，并在工作目录之间轻松切换。

## 7 调试器

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/HotSwap_preview.png)

### HotSwap 功能增强的用户体验

我们使 HotSwap 功能的使用更加简单直观。 此功能允许您在调试会话期间重新加载修改后的类，无需重新启动应用程序。 现在，当您使用有效的调试器会话编辑代码时，IntelliJ IDEA 会自动检测更改并提示您通过编辑器中方便的按钮重新加载。 这样可以实时更新代码，简化开发流程。 请记住，HotSwap 有一些限制，特别是在结构更改方面。 您可以在[此处](https://www.jetbrains.com/help/idea/altering-the-program-s-execution-flow.html#hotswap-limitations)了解详情。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Exception-breakpoints.png)

### 创建异常断点的意图操作

现在，您可以从编辑器设置异常断点。 在抛出或捕获点，通过 macOS 上的 ⌥↩ 或 Windows/Linux 上的 Alt+Enter 打开上下文菜单，然后选择 *Enable exception breakpoint*（启用异常断点）。 此新功能使异常断点的设置更加方便，因为您不需要打开 *Breakpoints*（断点）对话框或在控制台中浏览堆栈跟踪。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Line-execution-time_preview.png)

### 行执行时间提示

当您想要测量大量代码行的执行时间时，IntelliJ IDEA 2024.3 让您无需使用日志和计时器干扰代码。 调用 *Run to Cursor*（运行到光标）操作后，您将在编辑器的装订区域中看到每行的执行时间。 要进行更深入的分析，可以使用装订区域中的相同提示深入到被调用的方法，其对应行也将附带执行时间数据。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Merged-async-trace.png)

### 异步代码的合并堆栈跟踪

IntelliJ IDEA 2024.3 解决了异步代码故障排查的挑战，其中任务在一个线程中调度，在另一个线程中执行，每一个都维护自己的堆栈跟踪。 现在，IDE 会在控制台中打印合并的堆栈跟踪，而不仅仅是工作线程的堆栈跟踪，从而使执行流更易跟踪。 此增强默认对测试启用。

## 8 分析器

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/allocations_dark.png)

### 堆内存使用情况

分析器已通过堆内存使用情况图得到增强，此图显示在线程通道上方的 *Timeline*（时间线）标签页中。 这种新的可视化可以帮助您将内存分配与线程活动链接起来，提供有价值的洞察，揭示潜在的内存泄漏和性能瓶颈。

## 9 构建工具

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/MultiModuleCompilation.png)

### 多模块项目的更快编译

在 IntelliJ IDEA 2024.3 中，我们将并行编译设为默认。 在过去的版本中，一次只能编译一个项目模块，这对于大型项目来说并不是最快的方式。 现在，IDE 编译的所有基于 Maven 的项目的编译时间都将更快，并且 CPU 和内存消耗也已得到优化。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Trusted-certificates.png)

### 不可信 SSL 证书的无缝处理

IntelliJ IDEA 现在会在 Maven 同步和构建期间自动检测 SSL 相关问题。 如果原因是证书不可信，IDE 将通过信任证书来解决这个问题，无需手动操作。 此更新消除了通过日志查找隐秘的 SSL 错误的猜测工作，并且无需在 JDK 的信任库中进行繁琐的手动证书管理。

### 对 Maven 的拆分本地仓库的支持

我们新增了对 Maven 的拆分本地仓库的全面支持，这是 Maven 3.9 中引入的一项功能。 它允许您根据需要分离本地仓库。 您可以按远程仓库对其分组，将本地安装的工件存储在专属文件夹中，甚至使用专门的前缀按分支对工件进行分类。 此前，在 Maven 中启用拆分仓库可能导致 IntelliJ IDEA 中的同步失败，引发构建或依赖项问题。 现在，全面支持可以确保流畅的同步和高效的仓库管理。

## 10 框架和技术

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Derived_methods_completion_preview.png)

### Spring Data 仓库的派生方法生成

IntelliJ IDEA 现在可以在 Spring Data 仓库中自动生成派生查询方法。 如果需要派生查询方法，您不必再手动更新仓库源代码。 只需在需要的地方输入方法名称，IntelliJ IDEA 就会建议可能的方法名称，提供正确的方法签名和返回值类型，并为您更新仓库代码。

- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/HTTP-Client-env-syntax.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/HTTP-Client-import_requests.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/HTTP-Client-env-syntax.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/HTTP-Client-import_requests.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/HTTP-Client-env-syntax.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/HTTP-Client-import_requests.png)

### HTTP 客户端更新

IntelliJ IDEA 2024.3 引入了使用 `$env.ENV_VAR` 语法在 HTTP 客户端内直接访问环境变量的功能。 这使请求和脚本中的变量管理和使用更加灵活。 此外，现在还可以将请求从一个 `.http` 文件导入到另一个 .http 文件并运行，可以一次性导入所有请求，也可以按名称导入特定请求。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Ktor.png)

### Ktor 3.0 版本

Ktor 3.0 是一个用于在 JVM 上使用 Kotlin 构建服务器应用程序的工具包，现已搭载新功能并且性能得到提升。 新版本采用 Kotlin 2.0，切换到 [kotlinx-io](http://kotlinx.io/) 库提升了 IO 相关操作的性能。 [了解详情](https://blog.jetbrains.com/kotlin/2024/10/ktor-3-0/)。

[![](https://www.jetbrains.com/idea/whatsnew/2024-3/img/GraalVM-debug_preview.png)](https://www.jetbrains.com/idea/whatsnew/2024-3/img/GraalVM-debug.png)

### GraalVM 原生镜像的简化调试体验 旗舰版

我们大幅简化了使用 Docker 容器调试 GraalVM 原生镜像的体验，您现在可以在任意平台上构建和调试原生 Java 应用程序。 只需在运行配置中指定一个容器用于构建应用程序，另一个容器用于运行应用程序。 应用程序运行后，您可以在 Java 代码中和汇编程序级别调试应用。 为了简化设置，我们提供了预配置所有必要软件和库的 Docker 镜像。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/OpenTofu.png)

### OpenTofu 和 Terraform 增强

OpenTofu 现已获得支持。 此更新包括对加密方法、密钥提供程序的自动补全以及针对未知引用的检查。

Terraform 运行配置操作可以通过 *Search Everywhere*（随处搜索）访问，IDE 将自动检测未使用的变量和本地变量以保持代码清洁。 `Init`、`Validate`、`Plan`、`Apply` 和 `Destroy` 的控制已经得到改进，*Run Configuration*（运行配置）表单也已简化。 此外，改进的使用指示器和未使用资源警告可以增强导航并帮助您识别停用代码。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/DevContainers.png)

### 增强的 Dev Container

Dev Container 构建现在可以在远程 Docker 引擎上更顺畅地运行，有助于防止本地目录无法远程访问时出现错误。 WSL 的稳定性也得到增强，镜像构建有所改进，连接也变得稳定。

`devcontainer.json` 文件更一致地处理 `features`，新的 `updateRemoteUID` 选项通过设置正确的用户身份来避免访问冲突。 Dev Container 中的 IDE 设置可以通过 `devcontainer.json` 文件或 *Add currently modified settings from IDE*（从 IDE 添加当前修改的设置）按钮进行自定义，所有可用选项均可自动补全。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/Docker-Compose-improvements.png)

### Docker Compose 改进

IntelliJ IDEA 2024.3 为 Docker Compose 提供了扩展支持。 现在，它在 `env_file` 自动补全中会优先考虑 `.env` 文件，使环境设置速度更快。 `cache_to`、`no_cache`、`tags` 和 `platforms` 这些新的构建选项提供了对缓存和平台定位的更大控制。 `depends_on.required` 和 `depends_on.restart` 的增强处理可以更有效地管理依赖容器的启动和关闭顺序。

`deploy.placement.preferences`、`deploy.resources.pids` 和 `deploy.resources.reservations.devices` 等新键允许灵活的服务放置和资源限制。 现在，多上下文构建和特权构建通过 `build.additional_contexts` 和 `build.privileged` 获得支持。

额外选项包括 `cgroup` 配置、自定义 `extra_hosts` 映射和 `healthcheck.start_interval`。 增强的端口设置和 `secrets.environment` 现在通过环境变量简化了密钥管理。

### 对 WSL 中项目的更出色支持

我们持续提高托管在适用于 Linux 的 Windows 子系统 (WSL) 中并由开发者从 Windows 在 IDE 中打开的项目的可靠性。 特别是，我们引入了对符号链接的支持，并改用 Hyper-V 套接字与 WSL 交互来提高性能。 我们持续推动重大平台更改，提高包括 WSL 在内的远程环境的性能。

## 11 Kubernetes

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/NetworkPolicies.png)

### 网络策略支持

IDE 现在提供对网络策略的支持，用于管理集群中 pod 之间的网络流量。 它们允许您定义哪些 pod 可以从其他 pod、服务或外部源发送或接收流量。 网络策略的主要目的是控制和限制网络流量、管理 pod 隔离、确保安全以及规范外部访问。

## 12 数据库工具

- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_text_to_sql_diff.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_text_to_sql_prompt.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_text_to_sql_diff.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_text_to_sql_prompt.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_text_to_sql_diff.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_text_to_sql_prompt.png)

### 文本到 SQL：AI 生成结果的编辑器内差异

我们改进了[在编辑器中使用 AI Assistant 的体验](https://www.jetbrains.com/help/datagrip/2024.3/use-ai-in-editor.html#ai-generate-code-with-prompts)。 现在，当您要求 AI Assistant 处理某段代码时，编辑器区域会包含原始代码和生成的代码的差异。 AI Assistant 的建议以不同的颜色高亮显示，并在装订区域标有 *Revert*（还原）图标。 您还可以在差异中自行编辑结果查询。 您的更改将以相同的方式高亮显示。 例如，您可以让 AI Assistant 使用查询检索更多数据，然后将 `ORDER BY` 子句添加到生成的结果中。

- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_sql_error_handling_explained.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_sql_error_handling_fixed.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_sql_error_handling_actions.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_sql_error_handling_explained.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_sql_error_handling_fixed.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_sql_error_handling_actions.png)
- ![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/ai_sql_error_handling_explained.png)

### 通过 AI Assistant 进行的 SQL 错误处理

在错误消息区域中，可以通过一些新操作使用 AI Assistant 处理 SQL 查询执行错误。 *Explain with AI*（使用 AI 解释）会打开 AI 聊天，自动发送提示，然后 AI Assistant 将做出响应并解释错误。 *Fix with AI*（使用 AI 修正）操作会在编辑器中为查询执行错误生成修正。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/JOIN_editor_inspection_dark.png)

### 针对 `JOIN` 子句数量是否过多的检查

在某些情况下，不建议运行包含过多 `JOIN` 子句的查询，因为这会降低性能。 编辑器现在可以识别并高亮显示此类查询。 您可以在 IDE 设置中启用此检查。 为此，导航到 *Editor | Inspections*（编辑器 | 检查），展开 *SQL* 部分，然后选择 *Excessive JOIN count*（JOIN 计数过多）。

![img](https://www.jetbrains.com/idea/whatsnew/2024-3/img/floating_paging_dark.png)

### 浮动分页工具栏

为了使[数据编辑器](https://www.jetbrains.com/help/datagrip/2024.3/data-editor-and-viewer.html)中的网格分页更加明显，我们将控件从工具栏移动到数据编辑器的底部中心。

### MySQL 和 MariaDB 的片段内省和智能刷新

IntelliJ IDEA 现在支持片段内省。 此前，内省器只能对 MySQL 或 MariaDB 数据库中的架构执行完整内省，但不能刷新单个对象的元数据。 每次 DDL 语句在控制台中执行并且该执行可能修改数据库架构中的对象时，IDE 都会启动对整个架构的全面内省。 这非常耗时，并且经常会扰乱工作流。

现在，IntelliJ IDEA 可以分析 DDL 语句，确定哪些对象可能受其影响并仅刷新这些对象。 如果您在 *Database Explorer*（数据库资源管理器）中选择单个条目并调用 *Refresh*（刷新）操作，则只有一个对象会被刷新，而不是像以前一样整个架构都被刷新。