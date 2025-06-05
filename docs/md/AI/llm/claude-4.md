# Claude 4 震撼发布：编程能力登顶，智能体迈入新时代！

2025年5月23日●阅读时间约5分钟

## 0 前言

Claude 一边处理多个任务的插图：

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F9890d1bb39c15c41772af22d2282eb612469051c-2880x1620.jpg&w=3840&q=75)

Anthropic今天正式推出Claude模型新一代产品：**Claude Opus 4** 和 **Claude Sonnet 4**，编程能力、高阶推理以及AI智能体应用方面设立全新标准：

- Claude Opus 4是目前全球最强编程模型，在复杂且持续运行的任务和智能体流程中表现尤为突出
- Claude Sonnet 4则在Sonnet 3.7基础上一次重大升级，更精准理解并响应用户指令，同时在编程和推理方面表现更出色

<iframe frameborder="0" allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" title="A day with Claude" width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/oqUclC3gqKs?autoplay=0&amp;mute=1&amp;controls=1&amp;origin=https%3A%2F%2Fwww.anthropic.com&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;iv_load_policy=3&amp;modestbranding=1&amp;enablejsapi=1&amp;widgetid=1&amp;forigin=https%3A%2F%2Fwww.anthropic.com%2Fnews%2Fclaude-4&amp;aoriginsup=1&amp;gporigin=http%3A%2F%2Fjavaedge.cn%3A3000%2F&amp;vf=1" id="widget2" data-gtm-yt-inspected-11="true" style="box-sizing: inherit;"></iframe>

## 1 新功能

- 扩展推理与工具调用功能（Extended thinking with tool use）：两款新模型均可在进行深入思考时调用工具（如[网页搜索](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/web-search-tool)），可在推理与工具使用之间切换，以提升回答质量
- 新增模型能力：支持并行调用多个工具、更精准执行指令；若开发者开放本地文件访问权限，Claude还能大幅提升记忆能力，提取并保存关键事实，帮助模型保持上下文一致性并逐步构建隐性知识
- Claude Code 正式发布：在预览阶段获得大量积极反馈后，扩展了开发者与Claude协作方式。现支持通过GitHub Actions后台运行，并与VS Code和JetBrains原生集成，可在代码文件中直接显示修改，提升协作效率。
- 新增API能力：Anthropic API推出[四项新功能](https://www.anthropic.com/news/agent-capabilities-api)，助开发者构建更强大AI智能体，包括代码执行工具、MCP连接器、文件API以及提示缓存功能（最长可达1h）

Claude Opus 4与Sonnet 4属混合型模型，支持两种运行模式：

- 即时响应
- 深度推理

Pro、Max、Team和Enterprise订阅用户可使用两个模型及其扩展推理功能，免费用户也可用Sonnet 4。这两款模型已上线Anthropic API、Amazon Bedrock和Google Cloud的Vertex AI平台，价格与此前版本保持一致：

- Opus 4每百万tokens收费为15`$`（输入）/75`$`（输出）
- Sonnet 4则为3`$`/15`$`

------

## 2 Claude 4

Anthropic目前最强大模型，也是全球顶尖编程模型，在SWE-bench（72.5%）和Terminal-bench（43.2%）领先。在需持续专注数小时的大型任务中表现出色，远超所有Sonnet模型，大幅提升AI智能体的执行能力。

Claude Opus 4在编程和复杂问题解决方面表现尤为出色，推动了

### 2.1 前沿智能体产品发展

- Cursor称其为“编程领域的最新标杆”，并极大提升对复杂代码库的理解能力
- Replit反馈其精度显著提升，能高效处理跨文件的复杂改动
- Block认为这是首个在编辑和调试过程中能稳定提升代码质量的模型，其内部代号为“goose”的智能体正使用它
- Rakuten通过一项耗时7h的开源重构任务验证了它的稳定性
- Cognition指出，Opus 4能解决其他模型无法应对的挑战，成功处理以往模型常出错的关键任务

Claude Sonnet 4在Sonnet 3.7基础明显提升，SWE-bench成绩达72.7%，在兼顾性能与效率的同时，增强模型可控性。虽多数场景不及Opus 4，但提供更实用性能组合。

### 2.2 实用性能组合

- GitHub表示，Claude Sonnet 4在智能体场景表现卓越，将用于GitHub Copilot全新编程智能体
- Manus称其在复杂指令执行、清晰推理和输出美观度方面都有明显改进
- iGent报告称其在自动开发多功能应用方面表现优异，导航错误率几乎降为零
- Sourcegraph认为这是软件开发领域的一次重大飞跃，模型更能保持任务专注，理解更深入，生成的代码更优雅
- Augment Code表示，Sonnet 4成功率更高、代码修改更精细、在复杂任务中处理更谨慎，是他们的首选主力模型

这些模型全面推动客户的AI战略：Opus 4在编程、科研、写作和科学发现等领域突破边界，而Sonnet 4则以更高性价比提升日常工作效率，是Sonnet 3.7的理想升级。

Claude在软件工程任务中的对比图

![](https://p.ipic.vip/i038v4.jpg)

Claude 4模型在SWE-bench Verified测试中领先，这是一个真实软件工程任务的性能基准。

![](https://p.ipic.vip/gmpshe.jpg)

Claude 4系列在编程、推理、多模态能力及智能体任务中均表现出色。

------

## 3 模型改进

除了扩展推理、并行工具使用与记忆能力提升外，我们大幅减少了模型在完成任务时“走捷径”或利用“漏洞”的行为。在特别容易出现这些行为的智能体任务中，新模型发生此类情况的概率比Sonnet 3.7低65%。

Opus 4在记忆能力方面也远超以往模型。当开发者允许其访问本地文件时，它能高效创建并维护“记忆文件”，记录关键信息，提升长期任务的连贯性与表现。

最后，我们为Claude 4引入了“思考摘要”功能，可利用小模型浓缩复杂的思维过程。仅约5%的情况下需要进行摘要，大多数推理过程足够简洁可完整展示。

------

## 4 Claude Code

现已全面开放的Claude Code，将Claude的强大功能延伸至您的开发流程中：支持终端使用、主流IDE集成、并可后台运行。

为VS Code与JetBrains推出了测试版扩展，Claude提出的代码修改将直接显示在文件中，使代码审查与追踪更加便捷。在IDE终端中运行Claude Code即可安装。

还发布了可扩展的Claude Code SDK，方便您基于其核心构建自己的智能体与应用。还提供了一个示例：GitHub上的Claude Code（测试版）。在PR中标记Claude Code，即可自动响应审查意见、修复CI错误或修改代码。安装方式：在Claude Code中运行/install-github-app。

------

## 5 快速上手

这些模型是迈向“虚拟协作者”的重要一步——能保持完整上下文、持续专注长期项目，并带来颠覆性成果。我们进行了大量测试与评估，以最大限度地降低风险并确保安全，包括[启用ASL-3等级保护措施](https://www.anthropic.com/news/activating-asl3-protections)。

## 6 附录

#### 性能基准数据来源

- **OpenAI**：
  - [o3发布文章](https://openai.com/index/introducing-o3-and-o4-mini/)
  - [o3系统卡片](https://cdn.openai.com/pdf/2221c875-02dc-4789-800b-e7758f3722c1/o3-and-o4-mini-system-card.pdf)
  - [GPT-4.1发布文章](https://openai.com/index/gpt-4-1/)
  - [GPT-4.1官方评测数据](https://github.com/openai/simple-evals/blob/main/multilingual_mmlu_benchmark_results.md)
- **Gemini**：
  - [Gemini 2.5 Pro Preview模型卡片](https://storage.googleapis.com/model-cards/documents/gemini-2.5-pro-preview.pdf)
- **Claude**：
  - [Claude 3.7 Sonnet发布文章](https://www.anthropic.com/news/claude-3-7-sonnet)

------

#### 性能基准说明

Claude Opus 4 和 Sonnet 4 是混合推理模型。本文所展示的基准测试分数，展示了模型在**启用或未启用扩展推理**时的最高表现。每项测试结果下方注明了是否使用了扩展推理功能：

- **未使用扩展推理的测试**：
  - SWE-bench Verified
  - Terminal-bench
- **使用扩展推理（支持最多64K tokens）的测试**：
  - TAU-bench（未提供不使用扩展推理的结果）
  - GPQA Diamond
    - 未使用扩展推理时：Opus 4得分为74.9%，Sonnet 4为70.0%
  - MMMLU
    - 未使用扩展推理时：Opus 4得分为87.4%，Sonnet 4为85.4%
  - MMMU
    - 未使用扩展推理时：Opus 4得分为73.7%，Sonnet 4为72.6%
  - AIME
    - 未使用扩展推理时：Opus 4得分为33.9%，Sonnet 4为33.1%

------

#### TAU-bench 测试方法

我们为航空与零售领域的代理策略添加了提示附录，引导Claude在使用工具和扩展推理时，更好地发挥其推理能力。模型在多轮对话任务中被鼓励记录自己的思考过程，与平常的推理模式区分开来，以充分发挥其分析能力。

为适应Claude因更深入思考而增加的响应步骤数量，最大步骤数从30步上调至100步（大多数任务在30步内完成，仅有一个超过50步）。

------

#### SWE-bench 测试方法

Claude 4系列在此项测试中仍使用此前版本中介绍的简单工具架构，仅包含两种工具：[bash终端工具与文件编辑工具](https://www.anthropic.com/engineering/swe-bench-sonnet)，通过字符串替换方式操作文件。不再包含Claude 3.7 Sonnet使用的[第三种“计划工具”](https://www.anthropic.com/engineering/claude-think-tool)。

所有Claude 4模型的测试基于完整的500道题目进行评分。OpenAI的模型成绩则基于[477道题的子集](https://openai.com/index/gpt-4-1/)。

------

#### “高计算量”测试方法

为获取更复杂任务下的准确评分，我们采用以下策略增加测试复杂度并启用并行计算资源：

- 多次并行生成答案
- 丢弃会破坏可见回归测试的代码补丁（类似于[Agentless（Xia等人，2024）](https://arxiv.org/abs/2407.01489)的拒绝采样方法；不使用隐藏测试信息）
- 使用内部评分模型，在保留下来的候选答案中选出最优解

最终得分如下：

- Opus 4：79.4%
- Sonnet 4：80.2%