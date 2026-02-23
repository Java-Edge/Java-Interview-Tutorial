# IntelliJ IDEA 2025.3 最新变化

## 0 前言

欢迎阅读 IntelliJ IDEA 2025.3 版本的修复与改进概览。

本版本重点提升了开发体验、Spring 支持、构建工具、版本控制、终端等多个方面。以下是本次更新中最具影响力的改进，帮助你在日常开发中更高效、更安心地工作。

## 1 统一版本分发

### 1.1 整体质量提升

IntelliJ IDEA Ultimate 与 Community Edition 现已合并为单一版本，减少需维护的版本数，提升整体质量。

过去需要为社区版和旗舰版分别测试、验证和打包。现通过统一分发，简化开发流程、集中资源，从而实现更快迭代、更少不一致问题，以及更优质用户体验。

### 1.2 更小的安装包

尽管进行版本合并，但安装包体积比以往的 IntelliJ IDEA Ultimate 减少 30%，完全不用担心体积变大或性能变慢。

## 2 开发者体验

### 2.1 索引未完成时的更好体验

从几个版本前开始，IDE 已允许在索引尚未完全构建时进行部分工作，因为很多功能不再依赖完整索引。

本次更新完善了这一体验：你将不会再看到关于索引未完成的无用警告。IDE 现在只会报告与你当前任务相关的信息，让你更快回到工作状态。

一些后台进程也重命名，使其更贴近实际功能。如现会显示 *Analyzing project*（分析项目）而非 *Indexing*（建立索引）。

### 2.2 “查找用法”信息更详细

*Find Usages*（查找用法）功能是 IDE 中节省时间的重要工具。过去它只显示文件名，在复杂代码库中并不直观。现在它会在适当情况下显示[相对路径](https://youtrack.jetbrains.com/issue/IJPL-60969/Show-path-in-Show-usage-popup)，让定位更准确。

### 2.3 *Islands* 主题

全新的 *Islands* 主题带来了多项改进，其中最显眼的是新的标签页样式：当前激活的标签页更加清晰醒目。

## 3 Spring 支持

虽然本次版本的重点是支持 [Spring Framework 7](https://blog.jetbrains.com/idea/2025/11/intellij-idea-2025-3-spring-7/) 和 [Spring Boot 4](https://blog.jetbrains.com/idea/2025/11/spring-boot-4/)，但也关注了其他领域，确保检查与代码提示稳定可靠。

### 3.1 JPA 支持

用 Spring Data 时，若数据库连接未建立，JPA 实体将不再被错误地标记为异常。

### 3.2 Spring 调试器

持续改进 [Spring Debugger 插件](https://plugins.jetbrains.com/plugin/25302-spring-debugger)，并修复了影响远程调试的问题。

通过优化调试器 API 的上下文收集性能，现在调试速度提升 10 倍，对包含成千上万个 bean 的项目启动时间也没有影响。

## 4 语言支持

IntelliJ IDEA 一直致力于对最新 Java 版本提供顶级支持。在 2025.2 版本中，实现 Java 25 的首日支持。

本次更新进一步完善兼容性，确保所有内置工具与库都能在 Java 25 运行环境下稳定工作，并修复相关检查与问题。同时，也开始为未来的 Java 新特性做准备。

## 5 GitHub 与 GitLab 集成

版本控制和代码评审是开发者的日常操作，因此本次更新中的[显著改进]将让你受益匪浅。

之前，当你打开文件时，IDE 会自动将其标记为「已评审」。

现在，这一行为已修改为[需要手动操作]，从而避免仅浏览文件就被误标为已审查。

多行评论的用户体验也进行了[优化]，使代码评审更直观。

## 6 终端

[新版终端架构](http://www.javaedge.cn/md/java/jetbrains-terminal-a-new-architecture.html) 现已支持 PowerShell，为 Windows 用户带来了性能提升、错误修复和视觉改进。

## 7 构建工具

在 Maven 与 Gradle 集成方面，[运行 Spring 应用]时，使用 IntelliJ IDEA 的原生构建与运行功能将不再出现问题。

[依赖分析器（Dependency Analyzer）] 的弹窗也获得多项易用性改进。

## 8 性能优化

界面响应速度与整体性能仍是我们的首要任务。

本次版本继续[优化大项目的性能]，包括提升 TypeScript 高亮效率、修复 HTTP 客户端和代码导航中的卡顿问题。