# Cline 更新记录
## v3.40.0

- 当 Cline 完成任务时，新添加的Explain Changes "解释更改"按钮，可以帮助通过内联聊天审查代码。您可以回复评论，或将聊天作为上下文发送回 Cline。
- 使用新的 / 斜杠命令来解释分支、提交等中的更改。（尝试让 Cline 解释您需要审查的 PR！）
- 新的 `microwave` 隐形模型，限时免费！

## v3.38

- **MiniMax-M2** 目前在 Cline 中免费使用！
- **Gemini 3 Pro 预览版** 现已上线，具备业界领先的推理与编程能力。
- **AquaVoice 的 Avalon** 模型在 AISpeak 上的准确率高达 97.3%，现已用于语音转文字听写功能。

## v3.34.1

- 添加对 MiniMax 提供商的支持，包含 MiniMax-M2 模型
- 移除 Cline/code-supernova-1-million 模型
- 更改以在使用 OpenRouter 时允许用户手动输入模型名称（例如预设）

## v3.34

- Cline Teams 现在全年免费，适用于无限用户。包括 Jetbrains、RBAC、集中计费等。开始使用团队
- 在 Cline 提供商模型选择器中使用 GLM-4.6、Kimi-K2 和 Qwen3-Coder 的“exacto”版本，以获得成本、速度、准确性和工具调用的最佳平衡。

#### Cline for CLI 来了！

安装以直接在终端中使用 Cline 并启用子代理功能。Cline 可生成 `cline` 命令来处理聚焦任务，如探索大型代码库以获取信息。这通过在单独的子进程中运行这些操作来保持你的主上下文窗口清洁。

## v3.31

- UI 改进：新的任务标题和焦点链设计，占用更少空间，带来更清爽的体验
- 语音模式：实验性功能，需在设置中启用，以实现免提编码
- YOLO 模式：在设置中启用，可让 Cline 自动批准所有操作，并在计划/执行模式间自动切换
- JetBrains 更新：已为 Rider 提供支持，并根据所有反馈进行了大量改进！
- 持续免费模型：试试 `grok-code-fast-1` 或 `code-supernova`（隐身模型 🥷）！

## v3.30

- 免费“隐身”模型 🥷：试用 code-supernova，为 Cline 打造的代理式编码模型，支持 20 万上下文窗口与多模态。
- Grok 推广持续：免费 grok-code-fast-1 访问已延长
- JetBrains 支持已上线：你可以在 IntelliJ IDEA、PyCharm、WebStorm、Android Studio、GoLand、PhpStorm 等所有 JetBrains 系列 IDE 中使用 Cline

## v3.28

- 扩展的 Grok 推广：免费 grok-code-fast-1 访问延长！我们发现这个模型正在以惊人的速度改进，并且仍然免费提供

- GPT-5 优化：针对 GPT-5 模型系列的性能改进，微调系统提示

- ESC 取消：使用 ESC 键快速键盘导航以取消操作

- 修复了多个 Cline 窗口间的任务同步，`/deep-planning` 在 Windows/PowerShell 上的改进，Dify.ai 集成，DeepSeek-V3.1 支持，增强的 Gemini 速率限制，以及多个提供商修复

## v3.27

免费 `grok-code-fast-1` 直到9月10日

我们与xAI合作，从头开始构建这个模型用于代理编码，到目前为止——社区反馈令人难以置信。xAI正在通过更多使用不断改进模型的智能，所以今天就试试吧，让我们知道你的想法！

## v3.26

- 免费隐身模型：拥有 262K 上下文窗口的先进隐身模型，专为复杂编码任务设计，在 Cline 提供商中可免费使用。

- Z AI 提供商：全新的 API 提供商，提供 GLM-4.5 和 GLM-4.5 Air 模型，性能卓越，价格极具竞争力，特别针对中文语言任务和通用编程辅助进行了优化。

- 增强的 LM Studio 支持：改进对 LM Studio 本地模型的支持，兼容 v0 API 端点，并可配置最大令牌数，实现更佳的自定义体验。

## v3.25

- **专注链：** 通过自动TODO事项列表管理，让 Cline 专注于长期任务，将复杂任务分解为可管理的步骤，并提供实时进度跟踪和被动提醒。步骤显示在便捷的待办事项列表中，可在任务执行过程中进行编辑。
- **自动压缩：** 当对话接近模型的上下文窗口限制时，自动总结您的任务和下一步操作。这显著帮助 Cline 在长时间任务会话中保持专注！
- **深度规划：** 新的 `/deep-planning` 斜杠命令将 Cline 转变为架构师，它会调查您的代码库，提出澄清问题，并在编写任何代码之前创建全面的计划。
- **Claude Sonnet 4 的 1M 上下文：** Cline/OpenRouter 用户可立即访问，Anthropic 用户需要 Tier 4，Bedrock 用户必须在支持的区域。选择 `claude-sonnet-4:1m` 模型获得 1M 上下文，或使用原版获得 200K。
- 工作流（Workflows）：创建和**管理工作流文件**；可通过**斜杠命令**注入到对话中；轻松实现**重复性任务的自动化**


## v3.23

- **GPT-5支持：** 添加了对新 GPT-5 模型系列的支持，包括 GPT-5、GPT-5 Mini 和 GPT-5 Nano，并支持提示缓存。GPT-5 现在是新用户的默认模型
- **改进的入门体验：** 新用户现在会看到"开始导览"按钮，打开 VSCode 演练以帮助他们更轻松地开始使用 Cline。
- **增强的计划模式：** 在计划模式中更好地支持探索参数，在执行前进行更彻底的规划。

## v3.20

- __Cerebras 提供商支持：__ 通过更新的模型选择（仅限 Qwen 和 Llama 3.3 70B）和将 Qwen 3 32B 的上下文窗口从 16K 增加到 64K 令牌来增强性能。
- __Windows 版 Claude Code：__ 改进了系统提示处理以修复 E2BIG 错误，并为常见设置问题提供了更好的错误消息和指导。
- __Hugging Face 提供商：__ 添加为新的 API 提供商，支持其推理 API 模型。
- __Moonshot 中文端点：__ 为 Moonshot 提供商添加了选择中文端点的功能，并将 Moonshot AI 添加为新提供商。
- __增强稳定性：__ 强大的检查点超时处理，修复了禁用时 MCP 服务器启动的问题，并改进了多个 VSCode 窗口间的身份验证同步。
- __Gemini CLI 提供商：__ 添加了新的 Gemini CLI 提供商，允许您使用本地 Gemini CLI 身份验证免费访问 Gemini 模型。
- __WebFetch 工具：__ Gemini 2.5 Pro 和 Claude 4 模型现在支持 WebFetch 工具，允许 Cline 直接在对话中检索和总结网页内容。
- __自我认知：__ 使用前沿模型时，Cline 对自己的能力和功能集有自我认知。
- __改进的差异编辑：__ 改进了差异编辑，为前沿模型实现了创纪录的低差异编辑失败率。
- __Claude 4 模型：__ 现在支持 Anthropic Claude Sonnet 4 和 Claude Opus 4，在 Anthropic 和 Vertex 提供商中均可使用。
- __新设置页面：__ 重新设计的设置，现在分为选项卡以便更轻松的导航和更清洁的体验。
- __Nebius AI Studio：__ 添加 Nebius AI Studio 作为新提供商。（感谢 @Aktsvigun！）
- __工作流：__ 创建和管理可通过斜杠命令注入到对话中的工作流文件，使自动化重复任务变得容易。
- __可折叠任务列表：__ 在共享屏幕时隐藏您的最近任务，以保持提示的私密性。
- __Vertex AI 全球端点：__ 为 Vertex AI 用户改进了可用性并减少了速率限制错误。