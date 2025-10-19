# Trae功能更新

## v2.0.5

July 30, 2025

## Auto mode

True会智能地为您的任务选择最佳模型——在复杂性、速度和可用性之间取得平衡，为您提供最流畅的体验。自动模式默认开启。可随时从底部菜单进行更改。

https://docs.trae.ai/ide/auto-mode

May 16, 2025

## v1.4.8

- Enhanced plugin management to support enabling/disabling plugins by workspace
- Upgraded the VSCode kernel version to 1.100.3

## v1.3.9

Show release notes after an update

- Optimized some features.

##  v1.3.1

2025 年 04 月 22 日

 版本正式发布。提升稳定性。

##  v1.3.0

2025 年 04 月 21 日

### Unified AlPanel-Call Builder with @

![image-20250422142125037](/Users/javaedge/Library/Application Support/typora-user-images/image-20250422142125037.png)

We've merged the Chat and Builder panels. Now, you can talk to Al about everything in one place.

Try typing @Builder - it's the same familiar formula.

合并 Chat 与 Builder 面板。你可以通过 @Builder 方式将 Builder 作为智能体使用。

### More Diverse Contexts

We've expanded #Context. Use #Web for real-time search, or build docs with #Doc to give Alprecise references for smarter conversations.

支持将文档内容和网页内容作为上下文：

- \#Web：支持联网搜索，AI 会自动提取网页内的相关内容作为上下文。
- \#Doc：支持通过 URL 或上传 .md/.txt 文件的方式添加文档集。

### Define Rules to Shape Al Responses

Set Rules.md at the user or project level to refine Trae's behavior and response style - applyglobally or per project to ensure consistent results..

支持通过配置规则来规范 AI 的行为，包括：

- 个人规则：根据个人偏好创建适用于所有项目的规则。
- 项目规则： 创建仅适用于当前项目的规则。

### Support for Custom Agent Creation

You can now create your own Agent! Customize prompts, connect MCP or tools to boost skils andteamwork, and build a dedicated Al expert for specific tasks.

升级智能体（Agent）能力：

- 支持创建自定义智能体。你可以自定义智能体的提示词和工具集。
- 提供两个内置智能体：Builder 和 Builder with MCP。
- 支持为智能体开启 “自动运行” 模式，使智能体自动执行命令和调用工具，同时支持配置命令黑名单。

支持模型上下文协议（MCP）：

- 提供内置 MCP 市场，支持快速添加第三方 MCP Servers。
- 支持将 MCP Server 添加到智能体进行使用，从而丰富智能体的能力。

## v1.0.9

March 3, 2025

- Integrated DeepSeek R1 as built-in models.
- Completed kernel upgrade to version 1.97.
- Trae is now based on VS Code 1.97.2.
- Added intelligent plugin recommendations based on file.