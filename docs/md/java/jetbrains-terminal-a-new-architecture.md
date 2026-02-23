# JetBrains 终端：全新架构

## 0 前言

全新重构的 JetBrains 终端架构已在 2025.1 版本的 JetBrains IDE 中进入 Beta 阶段。

它基于稳定、符合标准的核心构建，并采用 IDE 编辑器来渲染界面。这一改变让我们能够在保持跨平台（本地与远程）兼容性与性能的前提下，引入更多新功能。

本文来了解 JetBrains IDE 终端架构的演进历程，解释我们为何选择这种全新方案，作为未来 IDE 新特性的基础——甚至可能成为独立工具的雏形。

要启用新终端，在设置或 *Terminal engine* 下拉菜单中选择 *Reworked 2025*。将在收集足够反馈后，逐步将其设为默认选项。

![](https://p.ipic.vip/317r83.png)

![](https://p.ipic.vip/m9au5r.png)

## 1 经典终端

![](https://blog.jetbrains.com/wp-content/uploads/2025/09/AD_4nXf6EA5XOKMNvK3Z_MaQuDdLOKBzCnGJMoocVcQbpfMmDwgV25ncFBnERU2GR1lhUcGoVi2xGwlv2-iuEOINWxkt-tio8LIEhBMNMOvDY_UUYnDg_EWtLO8MYxKs1oh_a1vhGVabYg.png)

多年来，JetBrains IDE 一直内置基于 [JediTerm](https://github.com/JetBrains/jediterm) 的终端 —— 功能强大、经多年验证的 Java 终端仿真器，提供符合 xterm/VT100 标准的稳定环境。

这种经典架构带来：

- **完全透明性**：用户输入会直接传递给 shell（如 Bash、Zsh 或 fish），确保所有命令行快捷键、自动补全框架和插件都能如常工作。
- **可靠性**：Vim、tmux、htop 等 TUI 程序的表现与外部终端一致。
- **简洁性**：开发者与运维工程师可以依赖内置终端，它的行为与常规命令行完全一致，熟悉的快捷键（如 *Ctrl+C*、*Ctrl+L*）照常可用。

## 2 新终端（2023–2024）

![](https://blog.jetbrains.com/wp-content/uploads/2025/09/AD_4nXdQIkDQMvZ40ZXTZdaxCOIe6qiyAYSksKoeD2Gx0ngADXWKC68ER1MDvy3T35yDoeM4TjkI0mszMh3vmYwjWFqBF_DxGIbuBaP_KK8L8-1pYtmR1D-3rWATPw0VlgS4qAFW12suPg.png)

2023 年，我们开始尝试一种更“智能”的终端思路。

该版本不再直接将输入交由 shell 处理，而是让 IDE 先拦截用户输入（如按键、提示文本等），仅在按下 *Enter* 后才将命令发送给 shell。

初衷包括：

- 使用 IDE 编辑器的高级 UI 能力来本地渲染输入；
- 引入结构化的命令块输出，让命令与结果更清晰；
- 为未来的 AI 辅助、弹窗补全等 IDE 级功能打下基础。

但这种激进改变带来了严重的兼容性问题：

- **与 shell 行为冲突**：Bash、Zsh、fish 等 shell 依赖实时接收按键输入来实现自动补全、*Ctrl+R* 历史搜索等功能。由于输入被延迟发送，导致这些功能无法使用。
- **快捷键失效**：*Ctrl+C* 无法可靠终止进程，*Ctrl+L*、方向键行为异常，自定义快捷键（如 .bashrc、.zshrc 或 Oh My Zsh 插件中的设置）也被破坏。
- **TUI 程序异常**：Vim、less、tmux 等终端应用依赖标准 I/O 序列。由于输出被截取和改写，它们的交互界面经常损坏或按键丢失。
- **UI 过度干预**：某些 shell 提示符、配色主题和插件（如 Powerlevel10k、Starship）无法正常显示，因为新终端试图以 IDE 提示符替代原生输出。

用户对这些问题的反馈非常迅速。大量 EAP 测试者选择回退到经典终端或使用外部终端，认为新架构破坏了命令行的基本体验。负面反馈的规模让我们意识到：偏离 POSIX 标准的方案无法被多数开发者接受。

### 2.1 重新审视：兼容性必须放在首位

最大的教训是——**兼容性与一致性** 对终端体验至关重要。反馈指出：

- **肌肉记忆不可忽视**：标准快捷键（*Ctrl+C*、*Ctrl+L*、方向键、*Ctrl+R* 等）必须与预期完全一致
- **原生 shell 环境**（Oh My Zsh、fish、自定义别名、Powerlevel10k、Starship 等主题与扩展）必须完整加载，不能被 IDE 层重写
- **性能与响应速度** 不得退步。输入与命令执行应与原生终端一样快甚至更快
- **TUI 程序集成** 必须保持完好，终端需完全遵循 POSIX 与 xterm/VT100 标准

因此，我们得出结论：终端必须保持为一个透明的数据通道，既不篡改输入，也不改写输出。

任何新功能（如 AI 建议、结构化输出）都必须建立在完整兼容传统终端行为的基础之上。

## 3 重构版终端（2025）

> “如果我看得更远，那是因为我站在巨人的肩膀上。”
>  —— *艾萨克·牛顿*

![](https://blog.jetbrains.com/wp-content/uploads/2025/09/AD_4nXf08eEbecInZjltA7b01L7WHyu19Lkz158SwnWlCp1ghI0Zvs_7i2nRDMpgyjVf5Zx__fcvTKh8joPvyynlmYHsC_O7MeUYbKKkuaUTLT4uKarhAnZbyeMocrPY6V2951IlK1DfPw.png)

在认真分析用户反馈与之前方案的不足后，回归更稳健的基础：

- **以 JediTerm 为核心仿真器**：继续使用底层 xterm/VT100 引擎，直接连接 PTY，确保命令、信号与按键完整传递给用户选择的 shell，实现最强的 **兼容性与一致性**。所有 shell 功能、快捷键、插件都能像外部终端一样正常运行。
- **通过 IDE 编辑器渲染**：终端显示集成到 IntelliJ 平台的编辑器组件中（支持 GPU 加速），让文本渲染与潜在的 UI 增强成为可能（例如命令与输出的区块式分组显示）。重要的是：这些增强不会破坏 shell 逻辑或 CLI 行为。
- **远程开发支持**：正重点优化远程终端性能，确保在远程工作流中也能获得一致体验。

**我们坚持「先兼容，再创新」的原则：**

- 所有 shell 快捷键、信号、TUI 程序行为必须与原生终端完全一致
- 终端需保持输入流畅、输出稳定、资源占用低
- 区块输出、AI 集成、命令历史搜索等功能将逐步、可选地加入，而不会破坏传统体验

## 4 未来计划

展望未来，将继续在 **速度与一致性** 的基础上叠加更多功能：

- **AI 深度集成**：结合本地与云端模型，协助执行日常任务、DevOps 脚本和基础设施命令模板，同时保留原生 shell 能力。
- **全屏模式**：让你专注于终端工作。
- **会话恢复**：支持 IDE 重启后恢复上次终端状态。
- **安全性与云端增强**，并计划开放插件 API，供高级用户定制。
- 甚至有可能推出 **独立版终端应用**，用于系统级使用。

JetBrains IDE 终端的演进过程展示了一个重要理念：**创新不应以牺牲核心兼容性为代价**。

在“新终端”的实验中深刻体会到开发者对经典 CLI 行为的依赖，因此迅速回归了完全遵循 POSIX 标准的路线。