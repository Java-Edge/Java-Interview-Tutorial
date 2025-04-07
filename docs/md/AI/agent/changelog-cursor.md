# AI 代码编辑器

旨在让你获得超凡的生产力， Cursor 是使用 AI 编写代码的最佳方式。

## 0.48.x-聊天标签、自定义模式 & 更快的索引

引入**聊天标签**，支持并行对话，并重新设计**模式系统**，允许添加自定义模式。

优化**成本可见性**、**索引性能**和**MCP（多代码处理）可靠性**。聊天完成后，系统会播放**音效通知**。

### 内置模式（测试版）

Cursor现提供两种内置模式：Agent和Ask

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/04/d2f54328d2417d5fbd9eff2026a2694c.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2025/04/1203dbce232aa7b0e8911ba8e1a11b43.png)

原"Edit"模式更名为"Manual"，以更准确反映其功能。

- **Ask 模式**默认可访问所有搜索工具，因此 `@Codebase` 工具已被移除。系统会在需要时自动搜索代码库。想强制搜索代码库，可直接自然语言告诉 Cursor如："搜索代码库"
- 可在模式菜单中**禁用 Ask 模式的搜索功能**，这样 Ask 模式就只能看到你提供的上下文：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/04/3d99a91af540e03dd9e94d7fd993809a.png)

### 自定义模式（测试版）

允许你根据自己的工作流创建新的模式，并配置不同工具和提示词。支持自定义快捷键：

- ⌘I：默认用于Agent模式
- ⌘L：用于切换侧边栏
- 如解除 `⌘I` 的绑定，它也会切换侧边栏

可在**"设置" → "功能" → "聊天" → "自定义模式"**中开启。

可在**"设置" → "功能" → "聊天" → "默认聊天模式"**中选择默认模式，可设置为**最近使用的模式**或**自定义模式**。

![](https://www.cursor.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcustom-modes.19f7c3f2.png&w=3840&q=75)

### 聊天标签

现可在聊天中创建多个标签页（⌘T），同时进行多个对话。如在一个标签页使用 Agent 模式，在另一个标签页进行不同任务。

如果某个标签页**正在等待输入**，它的标题上会出现**橙色小圆点**。

### 更快的索引

- 现在，同一团队内的**相似代码库**索引速度大幅提升
- **大型仓库的重复索引时间**大幅减少。如Cursor 代码库的索引时间已从**20min缩短到不到 1 min**

### 音效通知（测试版）

Cursor 现在可以在聊天**完成**时播放**音效通知**。你可以在**"设置" → "功能" → "聊天" → "完成时播放音效"**中开启该功能。

### 基于使用情况的成本可见性

对于**按使用量计费的模型**，可在**聊天历史**中查看**每次聊天的成本及详细费用**。

### 全新引导体验

- 优化了**新用户引导流程**，助快速上手 Cursor
- 你可以**导入设置**，选择**主题**、**快捷键**等个性化选项

### 其他更新

- **团队共享代码库的索引性能优化**
- **垂直侧边栏**暂不可用（仅影响已加入"抢先体验"的用户）
- **MCP 服务器支持改进**，当需要启用 MCP 时，系统会提示用户
- **聊天界面会在接近请求或使用限制时提示计费信息**
- **团队管理员配置的自动运行控制更清晰**，明确何时启用
- **由于稳定性问题，自动运行（auto-run）功能被移除**（之前启用该功能的用户会自动关闭）

### 优化

- **快捷键调整**：
  - **"全部拒绝"（Reject all diffs）快捷键**从 `⌘⌫`（Cmd+Backspace）更改为 `⌘⇧⌫`（Cmd+Shift+Backspace）
- **Windows 平台 MCP 更加稳定**
- **MCP 服务器配置时，错误信息更清晰，方便排查问题**
- **聊天消息现在显示输入的 Token 数量**（点击右上角的**三个点**查看）

## 0.47.x-稳定性、快捷键 & 预览

本次更新主要优化**稳定性**和**性能**，提升现有功能的**流畅度**。

### 主要更新

- **快捷键优化**：所有快捷键现在可以在**"设置" → "快捷键"**菜单中查看和修改
- **抢先体验**：可以在**"设置" → "Beta" → "更新频率"**中开启"抢先体验"模式
- **自动选择模型**：Cursor 会**根据任务类型**自动选择**最合适的高级模型**，确保在模型负载高或故障时仍能保持性能
- **新增主题**：Cursor Dark、Cursor Midnight、Cursor Dark（高对比度）
- **UI 改进**：优化工具调用 UI、思考状态 UI、错误提示，并新增**版本更新通知**
- **规则优化**：支持**嵌套的 `.cursor/rules` 目录**，同时提升 UX，让规则的生效状态更清晰
- **MCP 更新**：新增**全局服务器配置**（`~/.cursor/mcp.json`）及**环境变量支持**
- **Sonnet 3.7 思考优化**：优化 3.7 模型的思考逻辑，现在"思考"操作消耗**2 个请求**（之前是 1 个）
- **文件忽略优化**：`.cursorignore` 规则更稳定，文件排除更精准
- **支持批量上传图片**到聊天窗口

### 修复

- **0.47.2** - Cursor Tab 支持**单行选择**
- **0.47.6** - **加速应用**代码变更，**提示 `.cursorignore` 阻止编辑**的情况

## 0.46 - Agent准备就绪与UI焕新

**2025年2月19日**

- **Agent准备就绪**：Agent现已成为默认模式，带来更强大且统一的AI体验。不再有Chat、Composer和Agent之间的混淆——只有一个智能界面，能适应你的需求。

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/04/b5806689ef4a81f742656ebc994cc9f5.png)

- **UI焕新**：第一阶段的界面更新，带来全新的默认Cursor主题，专为专注设计。我们还简化了@-上下文菜单，让Agent更精准
- **网页搜索**：Agent现在可以自动搜索网络获取最新信息，无需显式@Web命令
- **忽略文件**：`.cursorignore`现不仅能阻止文件被索引，还能禁止文件在聊天中添加或用于Tab补全。引入`.cursorindexingignore`，专门用于控制文件索引
- **Agent工具限制**：当达到25次工具调用限制时，你可以按“继续”按钮继续操作（计为新请求）
- **项目规则**：
  - 新增全局应用规则的能力，并提供视觉指示以显示规则何时生效
- **MCP改进**：
  - Agent现可在Yolo模式下自动运行MCP工具
  - 通过`<项目根目录>/.cursor/mcp.json`配置项目服务器
  - 支持Agent使用MCP资源作为上下文

## 0.45 - .cursor/rules、更强的代码库理解、全新Tab模型

**2025年1月23日**

- **`.cursor/rules`**：用户可以在`.cursor/rules`目录中编写多个仓库级规则并保存到磁盘，Agent会自动选择适用的规则。
- **Deepseek模型**：0.45和0.44版本支持Deepseek R1和Deepseek v3，可在设置 > 模型中启用。我们在美国自托管这些模型。
- **总结之前的Composer**：当对话过长时，你可以开始新对话，同时引用之前的对话。
- **Agent感知最近更改**：Agent可以使用工具查看你的最近更改，还能看到用户消息之间的变动。
- **更强的代码库理解**：我们训练了一个新的代码库理解模型，将在0.45版本中逐步推广给所有用户。
- **Fusion模型**：我们训练了一个新的Tab模型，在跳转和长上下文处理上显著提升，很快将推广给用户。
- **可选长上下文**：在标记长文件时，用户可以选择使用高级模型请求更大的上下文窗口，这将消耗更多快速请求。

**更新 (0.45.1-0.45.11)**：增加MCP支持、团队可配置的黑名单。

**更新 (0.45.12-13)**：F1 > “检查更新”。

## 0.44-代理功能改进、Yolo模式、Cursor Tab更新

2024年12月17日

- 代理现在可查看终端退出代码，支持后台运行命令，并且命令变得可编辑
- 代理能够读取代码检查器（linter）错误并自动修复问题
- 在Yolo模式下，代理可以自动执行终端命令
- 新增@docs、@git、@web 和 @folder 功能供代理使用
- 代理会自动将更改保存到磁盘
- 代理可以同时编辑多个位置
- 代理能够通过更智能的应用模型重新应用更改
- Composer 的更改和检查点现在会在重载后保留

### 错误修复：

- Composer 不再访问已删除的文件。

[Nov 24, 2024]

## 0.43 - 新Composer UI、Agent、提交信息

- 侧边栏中的Composer UI，带有内联差异比较

- Composer中的早期版本Agent，可自主选择上下文并使用终端

- 自动生成Git提交信息

- 聊天/Composer中的文件推荐标签

- 聊天/Composer中的@Recommended功能，用于语义搜索上下文

- 改进的图像拖放体验

- 多项性能改进

- Beta测试：预览即将推出的Bug查找功能

  ![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/a91b66c6d32e9c18ef406abc60ac8e7b.png)

  使用点击 run new，会提示消耗很大，可选择 free 尝试使用：

  ![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20241223160511510.png)

分析结果：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20241223160601102.png)

其他说明：

- 已停止长上下文聊天Beta版
- 将Composer控制面板整合到侧边栏

此版本为Cursor增加了多个实用的协作编程和AI辅助功能，特别是在代码上下文管理和生成提交信息方面。

**2024年10月9日**

## **0.42 - Composer历史记录，@Lint错误，VS Code 1.93.1**

Composer历史记录允许您在重启后访问以前的Composer会话。还可在会话中编辑和重新提交以前的邮件。

我们对Debug with AI进行了轻微改进，并在Chat中添加了@Lint错误。

现基于VS Code 1.93.1。

Python自动导入光标选项卡在此版本中更加稳定。

使用聊天、Composer和cmd-k输入框中的模型搜索（Cmd-option- /）可更轻松切换模型。

Composer现在仅应用上下文中的文件以防幻觉。

使用光标.与WSL现在应该更稳定。

**更新（0.42.1 - 0.42.5）：**修复了以下上游安全问题：CVE-2024-43601。还修复了一些Composer错误和光标选项卡错误。允许Composer自动应用不在其上下文中的文件。还包括对CVE-2024-48919的额外缓解措施。减少了一些长尾连接错误。当Claude在聊天中预测错误的文件路径时添加逃生舱口。

**2024年9月17日**

## **0.41 - 光标选项卡Python自动导入，Composer改进，远程SSH到Mac支持**

光标选项卡现在可以自动导入Python文件中的符号！还显着提高了光标选项卡的稳定性。

Composer便笺簿（以前称项目）现在可以包含标记文件并在聊天和Composer中引用。

Composer现可添加到AI窗格中。此版本还包括许多稳定性修复和图像支持！

应用和Composer速度更快。

添加了对通过远程SSH在Mac上使用光标的支持。

**更新（0.41.1 - 0.41.3）：**改进入门用户体验，修复Composer取消错误，修复某些代码块上的应用按钮不起作用，并修复光标选项卡看到格式错误的编辑的错误。

**2024年8月22日**

## **0.40 - 新的聊天UX，默认开启的Composer，新的光标选项卡模型**

我们有一个新的聊天UX！期待您尝试并分享您的想法。

Composer现默认开启，所有Pro/Business用户都可点击cmd+I使用。添加了Composer项目（测试版），允许在多个Composer之间共享指令。

还训练了一个更智能、更上下文感知的新光标选项卡模型。

TypeScript文件的自动导入（测试版） - 当Tab建议未导入的符号时，我们现在将自动将其导入到当前文件中。您可以在“设置”>“功能”>“光标选项卡”中启用它！

**更新（0.40.1 - 0.40.4）：**修复了远程SSH上的应用错误、一些聊天错误、加快了欧洲/亚洲用户的光标选项卡速度、修复了一些未解决的光标选项卡错误和隐藏聊天输入的通知，并包括一个修复光标询问权限的文件在MacOS上的~/Library文件夹中（上游问题：microsoft/vscode#208105）

**2024年8月2日**

## **0.39 - 更快的光标选项卡，更多Composer改进**

光标选项卡（以前称为Copilot++）默认为分块流式传输。此版本还包括几个光标选项卡加速。未来版本会有更多！

并发Composer支持、Composer控制面板和各种错误修复，例如接受的文件被删除。

![](https://changelog.cursor.sh/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffast-cursor-tab.9d7bc1b7.gif&w=1200&q=75)

更快的光标选项卡建议！

**更新（0.39.1 - 0.39.6）：**修复了几个光标选项卡渲染错误、文件资源管理器无响应的错误以及光标选项卡挂起的错误。

**2024年7月23日**

## **0.38 - Copilot++分块流式传输（测试版），Composer改进**

Copilot++现具有分块流式传输（测试阶段）！它以更小的块更快地显示编辑。要启用它，单击设置齿轮并在“功能”>“Copilot++”下启用“分块流式传输”。

还为Composer添加文件选择器、箭头键导航和模型切换。

现在基于VS Code 1.91.1。

新默认模型：Claude 3.5 Sonnet置为默认模型。

**更新（0.38.1）：**修复了OpenAI API Key用户将迁移到Claude 3.5 Sonnet的错误

**2024年7月13日**

## **0.37 - Composer（测试版）**

新的实验性多文件编辑功能。要启用它，单击设置齿轮，转到Beta，并激活“Composer”。要使用它，请按Cmd+I。

**2024年7月3日**

## **0.36 - 即时应用，文档管理**

当聊天建议代码块时，单击“应用”可立即查看对文件的更改（仅限足够小的文件）。

文档管理！转到光标设置>功能>文档重新索引您的文档。

使用您自己的API密钥进行Claude时的错误修复。

**更新（0.36.1-0.36.2）：**修复#1526，macOS x64设备上的cmd-shift-F。还修复了官方文档需要很长时间才能显示，以及cmd-K粘性存在错误。

**2024年6月8日**

## **0.35 - 默认开启的光标预测，远程隧道和更强大的SSH**

- 默认开启的光标预测，带全新UI
- 现在支持远程隧道！远程SSH支持也更加强大（现在支持多个代理跳转等）。
- 为聊天消息添加了上下文提示，以便您可以查看将要使用/已使用的内容
- 改进了Cmd K上下文构建
- 修复了Windows/Linux上Copilot++的部分补全
- **更新（0.35.1）**：默认情况下禁用Copilot++部分接受，并使按键绑定可配置（转到光标设置>功能>Cpp重新启用）。使gpt-4o成为默认模型。

**2024年5月26日**

## 0.34 - VS Code 1.89，新的预测UI，Gemini 1.5 Flash，Copilot++部分补全

- 将VS Code 1.89合并到Cursor
- 新的光标预测UI
- Gemini 1.5 Flash可在长上下文模式下使用
- 接受Copilot++的部分补全
- 提高了Copilot++在linter错误上的性能
- 可切换的代码库搜索重新排序器
- 解释器模式下的GPT-4o
- **更新（0.34.1-0.34.6）：**修复了模型切换中的长上下文模型、空的人工智能评论选项卡、Copilot++预览错误、Mac图标大小和远程SSH修复。

**2024年5月3日**

## **0.33 - 网络稳定性，Command-K自动选择**

- 稳定性：此版本修复了一个持续影响某些用户连接错误的问题。它还应该提高Cursor在不稳定网络上的性能。
- Command-K自动选择：我们还添加了Command-K的自动选择！这意味着您现在可以按Command-K，它将自动选择您正在处理的区域，但您仍然可以手动选择，如果您愿意。
- **更新（0.33.1-0.33.3）：**修复设置切换，修复Copilot++ diffbox性能，入门调整。

**2024年4月12日**

## **0.32 - 改进的Copilot++ UX，新的GPT-4模型**

- Copilot++ UX：建议预览现在具有语法高亮显示，我们发现这使得快速理解更改变得更加容易。
- 光标帮助面板（测试版）：您还可以向Cursor询问有关Cursor的问题！光标帮助面板包含有关功能、键盘快捷键等的的信息。您可以在“设置”>“Beta”中启用它。
- 新的GPT-4模型：从几天前开始，您可以在Cursor中尝试gpt-4-turbo-2024-04-09，方法是在“设置”>“模型”中将其打开。
- .cursorrules：您可以通过在存储库的根目录中创建.cursorrules文件来为AI编写仓库级规则。您可以使用它来提供有关您正在构建的内容、样式指南或常用方法信息的上下文。
- **更新（0.32.1-0.32.7）：**修复了新的Copilot++语法高亮显示的性能问题，将AI Notes默认设置为禁用，将主要Copilot++模型的名称更改为legacy，修复了Copilot++在SSH上变慢的问题，修复了Copilot++预览框。

[2024年4月1日](https://changelog.cursor.sh/#031---长上下文聊天测试版)

## [0.31 - 长上下文聊天测试版](https://changelog.cursor.sh/#031---长上下文聊天测试版)

- 长上下文聊天（测试版）：这是一个新的实验性功能，可以让你与*大量*文件进行交互！要启用它，请转到"设置">"测试版"。然后，在新聊天的右上角选择"长上下文聊天"，并尝试@一个文件夹或整个代码库。
- 修复：此版本修复了在聊天中显示空白/部分响应的错误。

更新（0.31.1 - 0.31.3）：重新添加AI审查（alpha）、修复"Cursor设置"菜单项，并修复@web无法返回响应的错误。

[2024年3月20日](https://changelog.cursor.sh/#030---更快的代码助手++)

## [0.30 - 更快的代码助手++，Claude](https://changelog.cursor.sh/#030---更快的代码助手++)

- 更快的代码助手++：我们使代码助手++速度提高了约2倍！这一速度提升来自新模型/更快的推理。约50%的用户已经使用这个模型，并将在几天内全面推广。如果你想立即启用该模型，可以在编辑器底部栏控制你的模型。
- 稳定的Claude支持：所有最新的Claude模型现在可供专业版和API密钥用户使用。前往"设置">"模型"打开它们。专业用户每天免费获得10次请求，并可以继续使用API密钥价格使用Claude。
- 团队邀请：我们让邀请同事加入Cursor团队变得更加容易。你可以从编辑器设置或在[cursor.com/settings](https://cursor.com/settings)发送邀请。
- 管理员改进：团队管理员现在可以将自己标记为未付费用户，并可以查看团队成员上次使用产品的时间。
- 新设置：我们将所有设置移至右上角的齿轮中。不再有"更多"选项卡！

[2024年3月12日](https://changelog.cursor.sh/#claude支持)

## [Claude支持](https://changelog.cursor.sh/#claude支持)

如果你是专业版或商业版用户，可以在设置页面添加"claude-3-opus"作为自定义模型，每天免费使用10次快速请求（无限制慢速请求，但延迟呈指数增长）。

我们预计很快会推出更永久的解决方案（包括API密钥用户）。

[2024年3月1日](https://changelog.cursor.sh/#029---优化)

## [0.29 - 优化](https://changelog.cursor.sh/#029---优化)

默认启用AI笔记（在任何符号上按住Shift），改进编辑器内聊天，自动执行解释器模式，更好的入门样式，更好看的反馈模态，以及一些稳定性修复。

更新（0.29.1）：修复了代码助手++有时即使存在建议也不显示的问题，修复了提示行有时会覆盖幽灵文本的问题，以及修复了AI笔记在Windows上无法工作的问题。

[2024年2月23日](https://changelog.cursor.sh/#028---vs-code-1862)

## [0.28 - VS Code 1.86.2](https://changelog.cursor.sh/#028---vs-code-1862)

Cursor现在基于VS Code 1.86.2！除其他外，这为树视图添加了粘性滚动支持。此外，cmdk提示栏现在是粘性的。

更新（0.28.1）：修复了代码库聊天的间距问题，修复了[getcursor/cursor#1236](https://github.com/getcursor/cursor/issues/1236)。

[2024年2月15日](https://changelog.cursor.sh/#027---代码检查器-解释器模式更新)

## [0.27 - 代码检查器、解释器模式更新](https://changelog.cursor.sh/#027---代码检查器-解释器模式更新)

两个新的实验性功能更新：

- 代码检查器：你现在可以在聊天旁边的"更多"选项卡中打开AI代码检查器。每次保存时，它会扫描你的文件中的小错误。
- 解释器模式：我们对支持解释器模式的后端进行了重大改进！它现在在使用工具和理解项目方面应该更好。

更新（0.27.1-0.27.4）：修复Windows构建、聊天上下文UI、入门问题。

[2024年2月9日](https://changelog.cursor.sh/#026---ai预览测试版)

## [0.26 - AI预览测试版](https://changelog.cursor.sh/#026---ai预览测试版)

AI预览：这是一个新的实验性代码阅读功能。在聊天旁边的"更多"选项卡中启用后，只需按住Shift键即可为你所在的符号生成一些快速笔记。如果你希望我们在这个方向上投入更多时间，请[告诉我们](https://forum.cursor.com/)。

其他变化：

- 细粒度聊天回复（开始方法是悬停在要回复的响应区域上）
- 代码助手++生活质量改进（更频繁地显示幽灵文本，在状态栏上切换开/关，更容易查看建议框）
- 更顺畅的入门（修复Windows设置导入，选择导入文件夹/窗口状态）

[2024年2月2日](https://changelog.cursor.sh/#025---command-k-视觉支持)

## [0.25 - Command-K视觉支持](https://changelog.cursor.sh/#025---command-k-视觉支持)

现在你可以将图像拖放到Command-K提示栏中！

其他变化：

- 你现在可以搜索过去的聊天记录。
- 聊天中的"应用差异"现在应该更快一些。

更新：

- 0.25.2：代码助手++性能改进
- 0.25.3：修复cmd-K错误：[getcursor/cursor#1226](https://github.com/getcursor/cursor/issues/1226)。

[2024年1月25日](https://changelog.cursor.sh/#024---web-gpt-4-0125-preview)

## [0.24 - @Web、gpt-4-0125-preview](https://changelog.cursor.sh/#024---web-gpt-4-0125-preview)

在聊天中使用@Web将赋予AI抓取网页的能力！它可以使用的工具包括搜索引擎和文档网站爬虫。

这个功能仍处于实验阶段。我们非常希望改进AI理解外部库的能力，欢迎你的[意见](https://forum.cursor.com/)帮助我们改进：）。

专业版和API密钥用户还可以通过"设置">"OpenAI API">"配置模型"来尝试gpt-4-0125-preview。我们正在为专业用户测试这个新模型，看它是否比所有旧版本的gpt-4表现更好。如果是，将作为默认体验推出。

更新（0.24.3-0.24.4）：添加配置OpenAI基础URL的能力，修复[getcursor/cursor#1202](https://github.com/getcursor/cursor/issues/1202)。

[2024年1月18日]

## [0.23 - 新模型、应用按钮 v2]

- "cursor-fast"：这是一个在command-k和聊天中可用的新模型。预计比gpt-3.5更智能，格式错误更少。
- 应用按钮：我们为聊天中的"应用代码块"体验添加了一些改进。
- 聊天代码检查：如果AI在聊天中建议涉及虚构代码符号的代码更改，我们将对其进行下划线标注。适用于Python、TypeScript、Rust。
- 更多聊天符号链接：当聊天引用`代码符号`时，你通常可以直接点击到它。

更新（0.23.3-0.23.9）：修复Command-K、更新日志自动打开、使用代码助手++编辑非常长的行、"删除索引"按钮、连接错误被隐藏以及代理认证。

[2024年1月6日](https://changelog.cursor.sh/#0220---开发容器)

## [0.22.0 - 开发容器](https://changelog.cursor.sh/#0220---开发容器)

现在支持开发容器！此版本还：

- 将Cursor升级到VS Code 1.85，支持将选项卡拖出到新窗口。
- 改进WSL的稳定性。

[2023年12月29日](https://changelog.cursor.sh/#0210---多个command-k-代码助手ui)

## [0.21.0 - 多个Command-K、代码助手++UI](https://changelog.cursor.sh/#0210---多个command-k-代码助手ui)

现在你可以并行运行多个Command-K！此外，现在更容易查看代码助手++建议的更改。

[2023年12月16日](https://changelog.cursor.sh/#0200---代码助手-预览-ai审查)

## [0.20.0 - 代码助手++、@预览、AI审查](https://changelog.cursor.sh/#0200---代码助手-预览-ai审查)

- @预览：我们让查看你所@的代码块变得更容易。
- 代码助手++：我们继续改进代码助手++幽灵文本体验。令人惊讶的是，我们中的许多人现在甚至不安装其他自动完成插件就享受使用代码助手++。
- AI审查（测试版）：这是一个新的实验性功能，让GPT-4扫描你的git差异或PR中的错误。你可以在聊天旁边的"更多"选项卡中启用它。非常感谢你的[反馈](https://forum.cursor.com/)。

更新（0.20.1-0.20.2）：我们添加了摘要，以便更容易整理AI审查标记的错误，并修复了"与主分支比较"的错误。

[2023年12月14日](https://changelog.cursor.sh/#0191---解释器模式windows错误)

## [0.19.1 - 解释器模式Windows错误](https://changelog.cursor.sh/#0191---解释器模式windows错误)

修复解释器模式中的CRLF错误：https://github.com/getcursor/cursor/issues/1131。

[2023年12月14日](https://changelog.cursor.sh/#0190---代码助手改进)

## [0.19.0 - 代码助手++改进](https://changelog.cursor.sh/#0190---代码助手改进)

我们使代码助手++更快、更智能、更受限，并切换到幽灵文本+按Tab接受的UI。我们很想听听你的反馈。

[2023年12月6日](https://changelog.cursor.sh/#0184-0185---入门-反馈)

## [0.18.4-0.18.5 - 入门和反馈](https://changelog.cursor.sh/#0184-0185---入门-反馈)

轻微的入门变更。允许用户对聊天响应提供反馈。

[2023年12月2日](https://changelog.cursor.sh/#0182---小写-文件夹修复)

## [0.18.2 - 小写@文件夹修复](https://changelog.cursor.sh/#0182---小写-文件夹修复)

修复在聊天中使用@文件夹时所有文件夹被切换为小写的错误。

[2023年11月30日](https://changelog.cursor.sh/#0180---更好的上下文聊天-更快的代码助手)

## [0.18.0 - 更好的上下文聊天、更快的代码助手++](https://changelog.cursor.sh/#0180---更好的上下文聊天-更快的代码助手)

1. 更好的上下文聊天：特别是，后续对话现在更智能！
2. 更快的代码助手++：通过各种网络优化，速度提高了几百毫秒。我们仍有几百毫秒的优化空间。
3. 更可靠的代码助手++更改：闪烁更少，更好地突出显示新内容。

[Nov 27, 2023](https://changelog.cursor.sh/#0170---image-support-interpreter-mode-beta--folders)

## [0.17.0 - 图像支持、解释器模式测试版、@ 文件夹](https://changelog.cursor.sh/#0170---image-support-interpreter-mode-beta--folders)

- **聊天中的图像支持**: 您现在可以拖放图像到聊天中发送给 AI。
- **解释器模式测试版**: 现在可以在“更多”选项卡中启用解释器模式。此功能为聊天提供了访问 Python 笔记本、语义搜索等工具的能力。
- **@ 文件夹**: 现在您可以使用 @ 符号引用特定文件夹！我们会尝试挑选出最相关的代码片段供 AI 查看。
- **Copilot++ 改进**: 我们优化了 Copilot++ 的延迟，并增加了更改 Copilot++ 快捷键（不再固定为 Option/Alt）的选项。未来会有更多改进，尤其是在模型本身的性能方面！

[2023 年 11 月 15 日](https://changelog.cursor.sh/#0160---copilot-improvements-and-vs-code-1842)

## [0.16.0 - Copilot++ 改进和 VS Code 1.84.2](https://changelog.cursor.sh/#0160---copilot-improvements-and-vs-code-1842)

**Copilot++ 改进**:

1. **缓存功能**: 添加或删除一个字母，建议仍然会保留！
2. **不干扰智能感知和 CMD-K**。
3. 修复了处理大型文件时的延迟问题，以及蓝色高亮残留的问题。
4. Copilot++ 可以识别 Lint 错误，并利用这些信息改进建议。

Cursor 现在基于 VS Code 1.84.2，此版本修复了几个笔记本相关的 bug，并确保所有最新扩展能够正常工作。

[2023 年 11 月 12 日](https://changelog.cursor.sh/#0152-0155---copilot-improvements-bug-fixes)

## [0.15.2-0.15.5 - Copilot++ 改进及 Bug 修复](https://changelog.cursor.sh/#0152-0155---copilot-improvements-bug-fixes)

- **Copilot++ 改进**: 包括绿色高亮显示 Copilot++ 添加的内容、可以连续接受多个 Copilot++ 建议、支持 SSH 上的 Copilot++，以及修复了 Copilot++ UI 与自动完成插件交互的问题。
- **Bug 修复**: 修复了当在文件顶部删除内容时 CMD-K 会进入异常状态的 bug；修复了导致某些文件未被索引的问题。

[2023 年 11 月 10 日](https://changelog.cursor.sh/#0150-0151---new-models-copilot-beta)

## [0.15.0-0.15.1 - 新模型和 Copilot++ 测试版](https://changelog.cursor.sh/#0150-0151---new-models-copilot-beta)

- **Command-dot 功能**: 现在可以使用 Command-dot 菜单，让 Command-K 内联

修复 Lint 错误。

- **新模型**: 您可以插入 API 密钥，尝试最新的 GPT-4 和 GPT-3 Turbo 模型。我们正在评估这些模型的编码能力，计划向专业用户推出。
- **应用聊天建议**: 点击任意代码块上的播放按钮，即可让 AI 将聊天建议应用到当前文件中。
- **Copilot++ 测试版**: 这是 Copilot 的一个附加功能，根据您最近的编辑建议光标周围的差异。在右侧聊天栏的“更多”选项卡中启用。注意：为覆盖 AI 成本，仅对专业用户开放。
  - 此功能非常实验性，请不要抱太高期望！[您的反馈](https://forum.cursor.com/) 将决定我们未来的方向。

[2023年11月9日]

## [0.14.1 - 索引修复]

修复了索引卡住的问题。索引容量现在按用户分配，因此对大多数用户来说应该更公平且更快。

[2023年11月3日]

## [0.14.0 - Pro++、单词换行差异等]

- Pro++计划：如果达到快速请求限制，现在可以购买更多。
- 聊天滚动：取消了粘性滚动，使聊天更易于阅读。
- Cmd-K差异：现在遵循单词换行！可以从红色文本复制。
- 修复了无法在差异视图中使用聊天的错误。
- 改进了错误日志记录，有助于提高稳定性。
- 样式调整：一些按钮和提示看起来更好看！
- 屏幕闪烁：进行了可减少显示器屏幕闪烁的更改。

[2023年10月20日]

## [0.13.0-0.13.4 - 新的VS Code版本]

Cursor现在基于VS Code 1.83.1。这确保了所有扩展的最新版本可以在Cursor中无问题地工作。感谢每个人在论坛上敦促我们这样做！

还有一个实验性的Bash模式：在设置中启用，让聊天在运行Bash命令的帮助下回答问题。如果您觉得它有用，请告诉我们，我们将花更多时间使其成为生产就绪版本！

更新：此更改导致了SSH连接到旧Linux发行版的问题。现在已修复！

[2023年10月5日]

## [0.12.1-0.12.3 - 小修复]

修复了以下错误：
(1) .cursorignore现在完全尊重.gitignore语法
(2) 如果索引达到80%，代码库查询将使用嵌入式索引
(3) 移除了启动时的淡入动画
(4) 不再在终端中覆盖cmd-delete
(5) 修复cmd-F随机启用区分大小写选项的问题
(6) 内联gpt-4在我们找到更好的用户体验之前被关闭
(7) 索引更加稳定和快速
(8) 搜索和扩展中的进度指示器
(9) 修复了向服务器传递不正确的bearer令牌的错误

[2023年10月1日]

## [0.12.0 - 索引、终端中的cmd-k、@git、/edit、错误修复]

1. 索引现在应该更快、更稳定，并使用更少的系统资源。您还可以在`.cursorignore`中配置忽略的文件。控件位于"更多"选项卡中。
2. 终端中现在可以使用Cmd-k！虽然实现有点粗糙，但出奇地有用。
3. 在聊天中使用@git询问git提交和PR！
4. 在聊天中使用/edit编辑整个文件（如果少于400行）。预计编辑速度快，质量达到GPT-4水平。这使用非公开模型，目前仅对未使用自己API密钥的用户可用。
5. 错误修复！修复了"从慢速模式中退出"的UI，添加了API切换时的模型类型自动切换逻辑，改进了@符号速度，修复了Windows按键命令为Ctrl-Shift-Y而不是Ctrl-Y，等等。

[2023年9月20日]

## [0.11.1-0.11.8 - 补丁]

修复了Cmd-k、SSH、Python支持、Vim（回退到1.25.2版本，直到此问题得到解决：https://github.com/VSCodeVim/Vim/issues/8603）和其他扩展的问题。

[2023年9月19日]

## [0.11.0 - 内联聊天]

现在您可以在Cmd-K中在差异和文本响应之间切换。这有助于阐明模型对差异的思考过程，或快速获取关于文件的内联答案。

[2023年9月10日]

## [0.10.4 - 修复内置游标Python默认值]

游标Python的默认值与Pylance不同，这影响了多个用户。在此更新中，我们使它们更接近Pylance的默认值。

[2023年9月9日]

## [0.10.2 - 0.10.3 - 减少扩展推荐]

修复了一些用户过于频繁收到扩展弹出推荐的问题。

[2023年9月8日]

## [0.10.1 - 样式]

更新了一些CSS！

## [0.10.0 - 更好的文档管理、分阶段推出]

### 文档

此更新的主要添加是更好的文档支持。这意味着您可以添加和删除文档，并检查实际使用的URL。您还可以查看最终展示给GPT-4的网页，以便为您提供答案。

您可以将URL粘贴到聊天中，模型将自动将其包含在使用的上下文中。团队还可以共享私人文档。

### 分阶段推出

继此更新之后，未来的更新应采用分阶段推出。这将意味着更高的稳定性保证和更频繁的更新。

### 聊天中的长文件

我们继续改进与大文件聊天的体验。如果您@多个太大而无法放入GPT-4上下文窗口的文件，我们将智能地选择最相关的代码块向模型展示。

### 错误修复：

- 从Jupyter复制粘贴聊天文本
- 一些聊天焦点问题
- UI调整
- 更好的状态管理 - 防止编辑器使用过多内存导致崩溃

[2023年9月7日]

## [0.9.5 - 索引热修复]

修复了如果您默认关闭索引时出现的索引错误。

[2023年9月5日]

## [0.9.4 - 修复Cmd-K意外输出反引号]

Cmd-K在使用`@file`时将不再输出反引号。

[2023年9月1日]

## [0.9.3 - GitHub认证热修复]

您现在应该可以再次使用GitHub登录。

[2023年8月31日]

## [0.9.2 - 大型持久状态热修复]

可能导致 https://github.com/getcursor/cursor/issues/843 问题。

[2023年8月30日]

## [0.9.1 - SSH热修复]

修复SSH问题的热修复。

## [0.9.0 - 可审核的代码库上下文、VS Code左侧栏]

- 您现在可以切换到VS Code侧边栏方向
- 对于"带代码库"的聊天，您现在可以查看Cursor向GPT-4展示的代码库上下文。我们希望这将使提示代码库答案更容易
- API密钥输入框现在是密码类型
- 修复了在关闭索引选项后立即对代码进行索引的错误
- 新图标！非常感谢出色的Atanas Mahony制作这个图标

[2023年8月27日]

## [0.8.6 - 设置中的电子邮件]

Cursor设置中注销按钮下的电子邮件未更新。

[2023年8月26日]

## [0.8.5 - 高级按钮]

使高级上下文按钮在非Git仓库中也显示。

[2023年8月22日]

## [0.8.4 - WSL修复]

在所有WSL（Windows子系统Linux）发行版中应用了来自Github的补丁，可以自动或通过"修复WSL"命令面板命令进行。

## [0.8.3 - 代码库索引控制]

修复了代码库索引控制被不经意间移除的错误。

## [0.8.2 - Cmd-k后续、大文件聊天等]

- 现在可以回复Cmd-K输出，使模型修改其工作变得更加容易
- 如果@引用一个将被上下文限制截断的长文件，您将可以选择自动分块文件并用多个GPT进行扫描
- "带代码库"响应中的代码块和代码符号现在通常可点击
- 对"带代码库"的后续聊天消息将保留代码库上下文
- 聊天中的错误消息更加友好！减少烦人的弹出窗口
- 活动栏元素现在可以通过拖放重新排序
- SSH支持现在更加健壮！请继续告诉我们是否仍遇到任何SSH问题

2023年8月15日

## **0.7.3 - 修复 Windows 上的 cursor 命令**

修复了在 Windows 上安装 `cursor` 命令的错误。

2023年8月11日

## **0.7.2 & 0.7.6-nightly - 修复大文件的 cmd-k 生成**

不再使用认知计算！

2023年8月10日
**0.7.1 & 0.7.5-nightly - 修复：光标位置错误**

1. 修复 https://github.com/getcursor/cursor/issues/711。
2. 修复 cmd-k 连接错误。
3. 修复空行的 cmd-k 快速模式 bug。
4. 修复 bm25 搜索无限加载。
5. 修复后续操作中的 @Codebase。

2023年8月10日

## **0.7.0 - 编辑器内聊天**

对于不想侧边栏聊天的用户，现在可以将聊天窗口弹出到编辑器中！我们还修复了许多 bug。

2023年7月28日

## **0.6.0 - 由 GPT-4 驱动的 Copilot 体验**

**长 AI 补全**
当你在任意行按下 ⌘/^+↩️ 时，现在将使用 GPT-4 为你提供快速补全！我们知道有时候我们都希望 Copilot 能够编写整个函数或大段代码。但 Copilot 可能会很慢，有时也不够智能 :(。因此我们尝试通过一种由 GPT-4 提供支持的新补全体验来解决这个问题。只需按下 ⌘/^+↩️，你就能获得来自 GPT-4 的长补全。

**更好地支持远程 SSH**
远程 SSH 现已内置于 Cursor。你无需修改行为，它应该可以直接工作 :) 我们知道这曾是许多依赖远程机器进行开发的用户的一大障碍。如果你仍遇到问题，请告诉我们，我们将尽快修复。

**AI 代码检查器**
AI 代码检查器现已对所有专业版用户开放！AI 将用蓝色突出显示代码中可疑的部分。你还可以添加自己想要的代码检查规则，这些规则很容易用自然语言表达，但传统代码检查器无法覆盖。

2023年7月28日
**0.5.1 - 性能热修复**
修复了频繁使用 cmd-k 时可能出现的性能问题。

Jul 27, 2023

## 0.5.0 - 企业订阅支持及杂项修复

1. 企业支持！
2. 恢复了 Qmd 支持。
3. 聊天中新增实验性 @Codebase 支持（即将在 cmd-k 中推出！）
4. Linter 功能回归

## [0.4.0 - “适用于所有代码库的 with codebase”！]

现在您可以与任何代码库进行聊天。无需拥有 Github 仓库或通过 Github 登录。

[2023 年 7 月 22 日](https://changelog.cursor.sh/#031---jupyter-cmd-k-context-building)

## [0.3.1 - Jupyter CMD-k 上下文构建](https://changelog.cursor.sh/#031---jupyter-cmd-k-context-building)

Cmd-K 现在可以再次查看您在 Jupyter 中的所有单元格！

[2023 年 7 月 21 日](https://changelog.cursor.sh/#030---ssh-and-wsl-fixes)

## [0.3.0 - SSH 和 WSL 修复](https://changelog.cursor.sh/#030---ssh-and-wsl-fixes)

- SSH 和 WSL 应该可以再次正常工作。
- 在新窗口屏幕上可以看到最近的文件夹。
- 带有代码库上下文的聊天中出现的空消息不再无限加载。

## [0.2.50 - 热修复](https://changelog.cursor.sh/#0250---hotfixes)

- Cmd-L 现在可以正确聚焦到聊天中。
- 高级上下文控件只有在您已索引代码库时才会显示。

[2023 年 7 月 19 日]

## [0.2.49 - 适用于代码库范围聊天的高级上下文]

此版本包括：

- 对代码库范围聊天的上下文构建能力提供更多控制。
- 改进了 CMD-k 的代码生成流程，确保无 Linter 错误（在相关情况下，您将看到“尝试修复 Linter 错误”按钮）。
- CMD-K 的一些 UI/UX 调整。
- Bug 修复。

[2023 年 7 月 15 日](https://changelog.cursor.sh/#0248---infinite-chat-loop-hotfix)

## [0.2.48 - 无限聊天循环热修复](https://changelog.cursor.sh/#0248---infinite-chat-loop-hotfix)

此更新修复了聊天窗格中的无限循环 bug。

[2023 年 7 月 12 日](https://changelog.cursor.sh/#0247---patch-for-wslssh-search-and-extensions)

## [0.2.47 - WSL/SSH 的搜索和扩展补丁](https://changelog.cursor.sh/#0247---patch-for-wslssh-search-and-extensions)

此更新修复了 WSL 和 SSH 用户的搜索（Cmd/Win+Shift+F）及许多扩展的问题。

[2023 年 7 月 11 日](https://changelog.cursor.sh/#0246---patch-for-cmd-k-generates)

## [0.2.46 - CMD-k 生成的补丁](https://changelog.cursor.sh/#0246---patch-for-cmd-k-generates)

此更新改进了 CMD-k 在未选择任何代码时的提示。

[2023 年 7 月 10 日](https://changelog.cursor.sh/#0245---arm-windows-cmd-shift-f)

## [0.2.45 - ARM Windows 的 Cmd-Shift-F](https://changelog.cursor.sh/#0245---arm-windows-cmd-shift-f)

此更新为 ARM Windows 计算机提供了 Ctrl+Shift+F 的乐观修复。

[2023 年 7 月 7 日](https://changelog.cursor.sh/#0244---improvements-to-many-features-fixes-to-python)

## [0.2.44 - 多项功能改进，修复 Python](https://changelog.cursor.sh/#0244---improvements-to-many-features-fixes-to-python)

- 改进了“@添加新文档”体验。
- 恢复了对 Python/Pylance 的支持。
- 改善了 @ 符号的键盘使用体验。
- 更清晰地显示 AI 正在查看哪些文档。
- 当您引用文档时，AI 会附带引用响应。
- 修复了 Jupyter 的 Cmd-K。
- 聊天/编辑工具提示更少遮挡代码。
- 改进了在自定义主题开启时 Cursor 的外观。
- 导入 VS Code 扩展时现在会考虑已启用/禁用的扩展。
- CMD-k 对长差异（超过 100 行代码）的支持更好。

## [0.2.43 - CMD+K 修复](https://changelog.cursor.sh/#0243---fix-for-cmdk)

修复了 CMD+K 的一些边缘案例。

[2023 年 7 月 4 日](https://changelog.cursor.sh/#0242---fix-for-cmdshiftf-mac-arm)

## [0.2.42 - CMD+Shift+F (Mac ARM) 修复](https://changelog.cursor.sh/#0242---fix-for-cmdshiftf-mac-arm)

修复了针对未安装 Rosetta 的 Mac ARM 用户的 VS Code 代码库范围搜索。

[2023 年 7 月 4 日]

## [0.2.41 - “with codebase” 功能热修复]

修复了聊天中 “with codebase” 功能的问题。

[2023 年 7 月 4 日](https://changelog.cursor.sh/#0240---release-for-linux)

## [0.2.40 - Linux 版本发布](https://changelog.cursor.sh/#0240---release-for-linux)

此版本对 Mac 和 Windows 无任何更改，但修复了 Linux 用户的问题，现在他们可以升级到最新版本。

[2023 年 7 月 3 日](https://changelog.cursor.sh/#0239---new-inline-edits)

## [0.2.39 - 新的内联编辑](https://changelog.cursor.sh/#0239---new-inline-edits)

CMD+K 的 UI 已更改：它现在是编辑器内的，“粘滞的”，并且兼容 @ 符号。我们希望这可以帮助您保持工作流顺畅，更快地对提示进行迭代。（此外，现在可以在聊天中使用上下箭头来查看历史记录。）

此外，Cursor 的 AI 现在将使用流行的文档来改善回答。例如，如果您询问“如何使用 boto3 获取所有 S3 存储桶？” 它将搜索 boto3 文档以找到答案。要添加自己的文档或显式引用现有文档，请在聊天中键入 '@library_name'。

### Bug 修复：

1. 长代码选择不会再导致编辑器崩溃。
2. 自动修复错误不会再弹出问题视图（特别是修复了当启用“保存时自动修复”时的一个烦人 bug）。

[2023 年 6 月 27 日](https://changelog.cursor.sh/#0237---more-fixes)

## [0.2.37 - 更多修复](https://changelog.cursor.sh/#0237---more-fixes)

- 改善了 @ 符号的键盘使用体验。
- 修复了 CMD+K 对某些用户失效的 bug。
- 改善了对扩展的支持（特别是重新启用了欢迎视图）。

[2023 年 6 月 27 日](https://changelog.cursor.sh/#0236---hotfixes)

## [0.2.36 - 热修复](https://changelog.cursor.sh/#0236---hotfixes)

1. 如果您没有打开文件夹，聊天功能现在可以再次工作。
2. CMD-Shift-E 再次可以在聊天中修复错误。
3. `cursor://` 深层链接现在有效，因此您应该可以登录扩展了。
4. 自动滚动功能再次有效。
5. 修复了几个内联差异的 CMD-Z bug。
6. 您现在可以在 Cursor 中再次使用运行和调试功能（工具栏回来了）。
7. 早期支持斜线命令。
8. 如果您未登录，我们将再次显示登录弹窗。
9. Cursor 现在基于 VSCodium 1.79.2 版本，附带安全更新和一些小功能。

## [0.2.35 - 聊天热修复](https://changelog.cursor.sh/#0235---hotfix-for-chat)

修复了在某些非 Git 文件夹中聊天功能失效的问题。

[2023 年 6 月 24 日](https://changelog.cursor.sh/#0234---chat-v2)

## [0.2.34 - 聊天 v2](https://changelog.cursor.sh/#0234---chat-v2)

聊天功能进行了全面升级！现在您可以使用 @ 符号向 AI 展示文件/代码/文档。聊天历史更清晰，更容易查看 AI 能看到的内容，并且代码块在粘贴时会自动格式化。

[2023 年 6 月 16 日](https://changelog.cursor.sh/#0233---azure-support)

## [0.2.33 - Azure 支持](https://changelog.cursor.sh/#0233---azure-support)

我们新增了使用 Azure OpenAI 凭据的支持。同时还进行了小幅改进和修复。

[2023 年 6 月 14 日](https://changelog.cursor.sh/#0232---small-improvements)

## [0.2.32 - 小幅改进](https://changelog.cursor.sh/#0232---small-improvements)

修复了上一个版本引入的保存时格式化问题，同时对 AI linter 和代码库范围聊天进行了小幅优化。

[2023 年 6 月 11 日](https://changelog.cursor.sh/#0231---hotfix-for-chat-focus)

## [0.2.31 - 聊天聚焦热修复](https://changelog.cursor.sh/#0231---hotfix-for-chat-focus)

聊天功能现在不会再抢走您的焦点！

[2023 年 6 月 9 日](https://changelog.cursor.sh/#0230---show-the-ai-documentation)

## [0.2.30 - 显示 AI 文档](https://changelog.cursor.sh/#0230---show-the-ai-documentation)

现在您可以让 AI 阅读文档，这将提高其回答有关您常用库问题的能力。使用此功能，只需点击聊天窗格右上角的“文档”按钮。

[2023 年 6 月 6 日]

## [0.2.28 & 0.2.29 - 代码库上下文修复]

对代码库上下文 v1 的热修复。

[2023 年 6 月 6 日]

## [0.2.27 - 代码库上下文 v2]

我们改进了代码库上下文功能！

为充分利用此功能，请导航至设置（右上角按钮），然后选择“同步当前代码库”。

通过 Github 登录后，添加您希望同步的仓库！

完成后，您将在搜索窗格和聊天中（通过按 CMD+Enter）看到改进的代码库上下文版本。

[2023 年 6 月 6 日]

## [0.2.26 - 代码库上下文 v1]

### 代码库上下文 v1

推出第一个版本的代码库范围上下文！

转到“搜索”窗格即可查看新上下文。或在聊天中按 CMD+Enter，即可获得使用完整代码库上下文的响应。

![](https://changelog.cursor.sh/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FcodebaseContext.d0caa93e.gif&w=3840&q=75)

## [v0.2.25 - 扩展热修复（2023-06-03）](https://changelog.cursor.sh/#v0225---hot-fix-for-extensions-2023-06-03)

还修复了许多人遇到的 Jupyter 问题。

[2023 年 6 月 2 日](https://changelog.cursor.sh/#v0224---minor-fixes-2023-06-02)

## [v0.2.24 - 小修复（2023-06-02）](https://changelog.cursor.sh/#v0224---minor-fixes-2023-06-02)

修复了 Toolformer 和 AI linter 的一些小问题。

[2023 年 6 月 1 日](https://changelog.cursor.sh/#v0223---ai-linting-2023-06-01)

## [v0.2.23 - AI Linting（2023-06-01）](https://changelog.cursor.sh/#v0223---ai-linting-2023-06-01)

在“更多”标签中，您可以让 GPT-3.5 或 GPT-4 定期检查代码中的问题。

[2023 年 5 月 20 日](https://changelog.cursor.sh/#v0218---upgrades-to-gpt-4-and-please-give-us-feedback-2023-05-20)

## [v0.2.18 - GPT-4 升级及反馈请求！！（2023-05-20）](https://changelog.cursor.sh/#v0218---upgrades-to-gpt-4-and-please-give-us-feedback-2023-05-20)

### GPT-4 升级

- 所有用户可免费获得 10 次 GPT-4 请求！！
- 在模型间切换变得更加容易，GPT-4 的过渡更加顺畅。

### 请提供反馈！！

![img](https://changelog.cursor.sh/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FfeedbackModal.9eb91dd1.png&w=640&q=75)

- 添加了一个新反馈按钮，位于应用程序的右上角。
- 我们非常重视您的反馈以及 bug 报告！过去几周我们已修复了许多问题，并将继续改进产品。
- 我们还推出了新的反馈对话框以便于报告问题和建议。

[2023 年 5 月 18 日](https://changelog.cursor.sh/#v0217---fixes-2023-05-018)

## [v0.2.17 - 修复！（2023-05-18）](https://changelog.cursor.sh/#v0217---fixes-2023-05-018)

### Bug 修复

- 修复了“无限加载”问题。
- 重新引入了“新 AI 项目”功能。

[2023 年 5 月 17 日](https://changelog.cursor.sh/#v0216---terminal-debugger-and-our-biggest-bug-bash-yet-v0212)

## [v0.2.16 - 终端调试器，以及最大规模 Bug 修复（2023-05-17）](https://changelog.cursor.sh/#v0216---terminal-debugger-and-our-biggest-bug-bash-yet-v0212)

### 终端内调试

- 按 CMD+D 自动调试终端错误。
- 按 CMD+Shift+L，模型会将终端上下文添加到聊天中。

### 活动栏固定

- 您可以将自定义扩展固定到左上角的活动栏。

  ![img](https://changelog.cursor.sh/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FpinnedExtensions.1362cfc6.png&w=640&q=75)

### 更好的 Jupyter 支持

- 支持整个笔记本的上下文导入。
- 一些小 bug 修复。

### 差异生成改进

- 局部差异接受/拒绝。
- 生成操作可在您点击其他地方时继续。

- 修复了选中区域外编辑的差异 bug。

### 生活质量改进

- 按 ESC 键退出聊天。
- 修复了聊天中代码块缩小的问题。
- 提升了远程 SSH 的易用性。
- 改进了 Cursor Tutor 的引导体验。
- 为 Toolformer 提供了更好的提示词。

[2023 年 5 月 9 日](https://changelog.cursor.sh/#v0211---enhanced-chat-experience-2023-05-09)

## [v0.2.11 - 增强聊天体验（2023-05-09）](https://changelog.cursor.sh/#v0211---enhanced-chat-experience-2023-05-09)

### Bug 修复

- 修复了“更多”标签的问题。
- 更新了聊天中 Option+Enter 功能。

[2023 年 5 月 6 日](https://changelog.cursor.sh/#v0210---crucial-bug-fixes-2023-05-06)

## [v0.2.10 - 关键 Bug 修复（2023-05-06）](https://changelog.cursor.sh/#v0210---crucial-bug-fixes-2023-05-06)

### Bug 修复

- 针对两个长期存在的问题的热修复：
  - 聊天窗口在某些工作区中无法正常使用。
  - 偶尔按下回车键无响应。

[2023 年 5 月 4 日](https://changelog.cursor.sh/#v029---enhanced-features--improvements-2023-05-04)

## [v0.2.9 - 功能增强及改进（2023-05-04）](https://changelog.cursor.sh/#v029---enhanced-features--improvements-2023-05-04)

### 新功能

- 一键从 VS Code 导入扩展（测试版）。作为用户热切期盼的功能，我们很高兴推出一键扩展导入的测试版！
- Alpha 功能：🧠 提问整个代码仓库 🛠️。按住 ⌥+Enter 在聊天中试验这一功能！它允许模型深入理解您的请求，在文件中搜索，并提供精心准备的答案。此功能仍处于 Alpha 阶段，我们将持续改进，欢迎反馈！

### Bug 修复

- 改进了编辑和生成的提示。
- 修复了登录问题。
- 添加了隐藏工具提示的功能（Cursor 配置 > 高级 > 聊天/编辑工具提示）。
- 为项目生成功能延长了提示词长度。
- GPT-4 项目生成功能现已开放。

[2023 年 4 月 29 日](https://changelog.cursor.sh/#v028---multi-file-diffs--remote-ssh-2023-04-29)

## [v0.2.8 - 多文件差异与远程 SSH（2023-04-29）](https://changelog.cursor.sh/#v028---multi-file-diffs--remote-ssh-2023-04-29)

### 新功能

- 实验性支持多文件差异。
- 🌐 通过“OpenRemote - SSH”扩展支持远程 SSH。

[2023 年 4 月 19 日](https://changelog.cursor.sh/#v026---gpt-4--project-generation-2023-04-19)

## [v0.2.6 - GPT-4 & 项目生成（2023-04-19）](https://changelog.cursor.sh/#v026---gpt-4--project-generation-2023-04-19)

### 新功能

- GPT-4 现已对专业用户开放：
  - 包含 150k GPT-4 Token。
  - 设置齿轮中切换模型。
  - 所有 AI 功能的质量提升。
- 新实验性功能：从单个提示生成完整项目。

[2023 年 4 月 17 日](https://changelog.cursor.sh/#v025---scroll-bar-hotfix-2023-04-17)

## [v0.2.5 - 滚动条热修复（2023-04-17）](https://changelog.cursor.sh/#v025---scroll-bar-hotfix-2023-04-17)

### Bug 修复

- 滚动条的热修复。

[2023 年 4

月 16 日](https://changelog.cursor.sh/#v024---chat-scrolling--ghost-mode-2023-04-16)

## [v0.2.4 - 聊天滚动和幽灵模式（2023-04-16）](https://changelog.cursor.sh/#v024---chat-scrolling--ghost-mode-2023-04-16)

### 新功能

- 修复了聊天中的滚动问题。
- 幽灵模式，允许选择不在服务器上存储任何数据。

### Bug 修复

- 更优雅的编辑，现在支持 CMD-Z。
- 修复了流式差异中的各种 bug。

[2023 年 4 月 14 日](https://changelog.cursor.sh/#v023---enhanced-error-handling-2023-04-14)

## [v0.2.3 - 增强错误处理（2023-04-14）](https://changelog.cursor.sh/#v023---enhanced-error-handling-2023-04-14)

### 新功能

- 悬停在错误上即可让 AI 解释或修复。

### Bug 修复

- 修复了 Linux 上的设置图标问题。
- 启动时不再安装 “cursor” 命令。

### 即将推出

- GPT-4 支持。

[2023 年 4 月 7 日](https://changelog.cursor.sh/#v022---bug-fixes-galore-2023-04-07)

## [v0.2.2 - 大量 Bug 修复（2023-04-07）](https://changelog.cursor.sh/#v022---bug-fixes-galore-2023-04-07)

### Bug 修复

- 修复了 Mac 自动更新问题。
- 修复了“未定义 URI”问题。
- 关闭了“cursor .” 命令的自动安装功能（并修复了该功能的安装问题）。

[2023 年 4 月 6 日](https://changelog.cursor.sh/#v021---more-bug-fixes-2023-04-06)

## [v0.2.1 - 更多 Bug 修复（2023-04-06）](https://changelog.cursor.sh/#v021---more-bug-fixes-2023-04-06)

### Bug 修复

- 包括 Bug 修复。

[2023 年 4 月 6 日](https://changelog.cursor.sh/#v020---introducing-cursor-020-2023-04-06)

## [v0.2.0 - 推出 Cursor 0.2.0！（2023-04-06）](https://changelog.cursor.sh/#v020---introducing-cursor-020-2023-04-06)

- 我们已将 Cursor 构建转移到基于 VSCodium 分支的版本，放弃了之前基于 Codemirror 的方法。
- 这样我们可以专注于 AI 功能，同时利用 VSCode 成熟的文本编辑功能。
- 我们的目标是创建一个专为与 AI 配合编程优化的 IDE。
- 目前它类似于带有 AI 功能的标准代码编辑器，但我们计划显著改进编程体验。

### 新功能

- 迁移到基于 VSCodium 分支的版本。
- 专注于增强 AI 的协同编程能力。

[2023 年 3 月 30 日](https://changelog.cursor.sh/#v0112-2023-03-30)

## [v0.1.12（2023-03-30）](https://changelog.cursor.sh/#v0112-2023-03-30)

### 新功能

- 使用 AI 现在需要登录。
- 可使用 OpenAI API 密钥以成本价享受无限请求（如可用，支持 GPT-4）。

### Bug 修复

- 清理了聊天样式。
- 其他小改动。

[2023 年 3 月 28 日](https://changelog.cursor.sh/#v0111-2023-03-28)

## [v0.1.11（2023-03-28）](https://changelog.cursor.sh/#v0111-2023-03-28)

### Bug 修复

- 修复了终端的一个小问题。

[2023 年 3 月 28 日](https://changelog.cursor.sh/#v0110-2023-03-28)

## [v0.1.10（2023-03-28）](https://changelog.cursor.sh/#v0110-2023-03-28)

### Bug 修复

- 修复了一些键盘快捷键的问题。
- 其他一些小改进。

[2023 年 3 月 27 日](https://changelog.cursor.sh/#v019-2023-03-27)

## [v0.1.9（2023-03-27）](https://changelog.cursor.sh/#v019-2023-03-27)

### 新功能

- 在当前文件夹中打开终端。
- 添加了可选的付费计划，以避免服务器容量限制。

### Bug 修复

- 修改了自动更新功能，现在会通知有新版本可用。
- 其他问题修复。

[2023 年 3 月 25 日](https://changelog.cursor.sh/#v017-2023-03-25)

## [v0.1.7（2023-03-25）](https://changelog.cursor.sh/#v017-2023-03-25)

### 新功能

- 支持文件名的模糊搜索。

### Bug 修复

- 修复了终端相关问题。
- 滚动条恢复正常。
- 其他修复（包括许多来自 PR 的修复 🙂）。

[2023 年 3 月 24 日](https://changelog.cursor.sh/#v016-2023-03-24)

## [v0.1.6（2023-03-24）](https://changelog.cursor.sh/#v016-2023-03-24)

### Bug 修复

- 修复了快捷键问题。

[2023 年 3 月 23 日](https://changelog.cursor.sh/#v015-2023-03-23)

## [v0.1.5（2023-03-23）](https://changelog.cursor.sh/#v015-2023-03-23)

### 新功能

- 自动应用聊天建议。
- 可要求 AI 修复语言错误。
- 聊天历史可在会话之间保存。

### Bug 修复

- 聊天中的内容更易于选择和复制。
- 侧边栏支持调整大小。
- 终端不再干扰聊天。

### 即将推出

- 语言服务器/CoPilot 的修复。

[2023 年 3 月 18 日](https://changelog.cursor.sh/#v012-013-2023-03-18)

## [v0.1.2-0.1.3（2023-03-18）](https://changelog.cursor.sh/#v012-013-2023-03-18)

### 新功能

- 内置终端。
- 差异会自动继续。

### Bug 修复

- 更多差异修复。
- 提示栏中上/下箭头的快捷键进行了调整。
- 可从提示栏打开聊天历史。

### 即将推出

- 聊天将自动将建议的更改插入编辑器。

[2023 年 3 月 14 日](https://changelog.cursor.sh/#v0037-2023-03-14)

## [v0.0.37（2023-03-14）](https://changelog.cursor.sh/#v0037-2023-03-14)

### 新功能

- 支持 Windows 和 Linux 🥳。
- 可进行任意长度的编辑。

### Bug 修复

- 差异不再消失。
- 在同一文件的多个选项卡中编辑时无问题。

### 即将推出

- 使用 AI 一键修复所有 Lint 错误 😎。

[2023 年 3 月 25 日](https://changelog.cursor.sh/#v017-2023-03-25)

## [v0.1.7（2023-03-25）](https://changelog.cursor.sh/#v017-2023-03-25)

### 新功能

- 支持文件名的模糊搜索。

### Bug 修复

- 修复了终端相关问题。
- 滚动条恢复正常。
- 其他修复（包括许多来自 PR 的修复 🙂）。

[2023 年 3 月 24 日](https://changelog.cursor.sh/#v016-2023-03-24)

## [v0.1.6（2023-03-24）](https://changelog.cursor.sh/#v016-2023-03-24)

### Bug 修复

- 修复了快捷键问题。

[2023 年 3 月 23 日](https://changelog.cursor.sh/#v015-2023-03-23)

## [v0.1.5（2023-03-23）](https://changelog.cursor.sh/#v015-2023-03-23)

### 新功能

- 自动应用聊天建议。
- 可要求 AI 修复语言错误。
- 聊天历史可在会话之间保存。

### Bug 修复

- 聊天中的内容更易于选择和复制。
- 侧边栏支持调整大小。
- 终端不再干扰聊天。

### 即将推出

- 语言服务器/CoPilot 的修复。

[2023 年 3 月 18 日](https://changelog.cursor.sh/#v012-013-2023-03-18)

## [v0.1.2-0.1.3（2023-03-18）](https://changelog.cursor.sh/#v012-013-2023-03-18)

### 新功能

- 内置终端。
- 差异会自动继续。

### Bug 修复

- 更多差异修复。
- 提示栏中上/下箭头的快捷键进行了调整。
- 可从提示栏打开聊天历史。

### 即将推出

- 聊天将自动将建议的更改插入编辑器。

[2023 年 3 月 14 日](https://changelog.cursor.sh/#v0037-2023-03-14)

## [v0.0.37（2023-03-14）](https://changelog.cursor.sh/#v0037-2023-03-14)

### 新功能

- 支持 Windows 和 Linux 🥳。
- 可进行任意长度的编辑。

### Bug 修复

- 差异不再消失。
- 在同一文件的多个选项卡中编辑时无问题。

### 即将推出

- 使用 AI 一键修复所有 Lint 错误 😎。