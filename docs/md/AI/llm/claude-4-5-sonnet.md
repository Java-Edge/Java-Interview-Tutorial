# Claude Sonnet 4.5 携 Agent SDK 亮相，重塑开发工作流！

混合推理模型，为智能体带来更强大智能，支持 200K 上下文窗口

[试用 Claude](https://claude.ai/redirect/website.v1.771b1b58-f425-4a97-8a54-47e2c373bf96) | [获取 API 访问权限](https://console.anthropic.com/)

## 1 介绍 Claude Sonnet 4.5

Claude Sonnet 4.5 是目前全球最强的编程模型。它在构建复杂智能体方面表现最出色，是最擅长使用电脑的模型，在逻辑推理和数学能力上也有显著提升。

代码无处不在，它驱动着你使用的每一个应用、表格和软件工具。而能熟练使用这些工具并解决复杂问题，正是现代工作的核心。

Claude Sonnet 4.5 让这一切成为可能。此次发布还伴随了一系列重要的产品升级。在 [Claude Code](https://anthropic.com/news/enabling-claude-code-to-work-more-autonomously) 中，我们加入了备受用户期待的“检查点”功能，可随时保存进度，并一键回到先前状态。我们还重新设计了终端界面，并发布了 [VS Code 原生扩展](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)。在 Claude API 中，我们增加了新的 [上下文编辑和记忆功能](https://anthropic.com/news/context-management)，让智能体可以运行更长时间、处理更复杂的任务。在 Claude [应用](https://claude.ai/redirect/website.v1.6e3b59f5-bfac-4640-a43b-b82b5d1ba4ff/download)中，我们把代码执行和 [文件创建功能](https://www.anthropic.com/news/create-files)（支持表格、幻灯片、文档）直接整合进对话界面。此外， [Claude for Chrome](https://www.anthropic.com/news/claude-for-chrome) 浏览器扩展也已向上月加入候补名单的 Max 用户开放。

我们还向开发者开放了自用的 Claude Code 构建模块，命名为 [Claude Agent SDK](https://anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)。驱动我们前沿产品的底层基础设施，现在也向你开放，用来构建属于你的智能系统。

这是我们迄今最符合安全对齐标准的前沿模型，与之前的 Claude 系列相比，在多个方面都有大幅改进。

Claude Sonnet 4.5 现已全球上线。开发者可通过 [Claude API](https://docs.claude.com/en/docs/about-claude/models/overview) 使用 `claude-sonnet-4-5` 模型。价格与 Claude Sonnet 4 相同，仍为每百万 tokens 收费 $3/$15。

## 2 前沿智能

Claude Sonnet 4.5 在 SWE-bench Verified 测试中表现最为突出，该测试用于评估 AI 在实际编程任务中的能力。实际使用中，我们观察到它在复杂的多步骤任务中能持续专注运行超过 30 小时。

![Chart showing frontier model performance on SWE-bench Verified with Claude Sonnet 4.5 leading](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F6421e7049ff8b2c4591497ec92dc4157b2ac1b30-3840x2160.png&w=3840&q=75)

在 OSWorld 测试（评估模型执行真实电脑任务的能力）中，Sonnet 4.5 的得分达到 61.4%，领先所有同类模型。仅四个月前，Sonnet 4 还以 42.2% 居首。我们的 [Claude for Chrome](https://www.anthropic.com/news/claude-for-chrome) 扩展正充分利用这些增强能力。演示中，Claude 能直接在浏览器中操作网站、编辑表格并完成任务。

<iframe frameborder="0" allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" title="Claude for Chrome brings AI where you’re already working (Instrumental)" width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/oXfVkbb7MCg?autoplay=0&amp;mute=0&amp;controls=1&amp;origin=https%3A%2F%2Fwww.anthropic.com&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;iv_load_policy=3&amp;modestbranding=1&amp;enablejsapi=1&amp;widgetid=1&amp;forigin=https%3A%2F%2Fwww.anthropic.com%2Fnews%2Fclaude-sonnet-4-5&amp;aoriginsup=1&amp;gporigin=https%3A%2F%2Fwww.anthropic.com%2Fclaude%2Fsonnet&amp;vf=1" id="widget2" data-gtm-yt-inspected-12="true" style="box-sizing: inherit;"></iframe>

模型在逻辑推理和数学等多个领域的评测中也有明显进步：

![Benchmark table comparing frontier models across popular public evals](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F67081be1ea2752e2a554e49a6aab2731b265d11b-2600x2288.png&w=3840&q=75)

金融、法律、医学和理工科等领域的专家发现，Sonnet 4.5 在专业知识和推理能力上相比旧版本（包括 Opus 4.1)有显著提升。

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F7175bc18c46562f1228280a7abda751219a2aae1-3840x2160.png&w=3840&q=75)

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2Ffd313a5edb996d98b9fc73ee5b3e6a34fbbcbb83-3840x2160.png&w=3840&q=75)

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F442f96fd96de39e3ff3a05b288e2647dd7ec2f58-3840x2160.png&w=3840&q=75)

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F711e6e1178f0ed7ca9aa85a5e0e9940a807c436a-3840x2160.png&w=3840&q=75)

## 3 我们最“对齐”的模型

除了性能更强，Claude Sonnet 4.5 也是我们迄今最符合安全标准的前沿模型。得益于更强的能力和更深入的安全训练，我们显著减少了模型的不良行为，比如迎合性、欺骗性、权力追求，以及鼓励幻想性思维等倾向。同时，我们在防御提示注入攻击方面也取得重大进展，这对使用智能体和电脑操作功能的用户尤为重要。

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F33efc283321feeff94dd80973dbcd38409806cf5-3840x2160.png&w=3840&q=75)

详细的安全和对齐评测（包括首次采用可解释性技术的分析）可在 Claude Sonnet 4.5 的 [系统卡](https://www.anthropic.com/claude-sonnet-4-5-system-card) 中查看。

Claude Sonnet 4.5 以我们定义的 AI 安全等级 3（ASL-3）标准发布，配套 [负责任扩展框架](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy)。其中包括一系列安全分类器，用于检测潜在危险内容，尤其是与化学、生物、放射和核（CBRN）武器相关的信息。
 这些分类器可能偶尔误判正常内容，因此我们允许用户在必要时切换至风险较低的 Sonnet 4 模型继续对话。自 [首次发布](https://www.anthropic.com/news/constitutional-classifiers) 以来，我们已将误判率降低十倍，相比 Opus 4 又进一步减半。



## 4 Claude Agent SDK

经过六个月的持续改进，我们深知构建 AI 智能体需要解决哪些难题：如何让智能体在长时间任务中管理记忆、如何平衡自主性与用户控制、如何协调多个子智能体协同工作。

<iframe frameborder="0" allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" title="Building agents with the Claude Agent SDK" width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/OZ-aLrJ0oVg?autoplay=0&amp;mute=0&amp;controls=1&amp;origin=https%3A%2F%2Fwww.anthropic.com&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;iv_load_policy=3&amp;modestbranding=1&amp;enablejsapi=1&amp;widgetid=3&amp;forigin=https%3A%2F%2Fwww.anthropic.com%2Fnews%2Fclaude-sonnet-4-5&amp;aoriginsup=1&amp;gporigin=https%3A%2F%2Fwww.anthropic.com%2Fclaude%2Fsonnet&amp;vf=1" id="widget4" data-gtm-yt-inspected-12="true" style="box-sizing: inherit;"></iframe>

现在，这些成果都已向开发者开放。[Claude Agent SDK](https://anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) 与 Claude Code 使用相同的底层架构，但不仅限于编程任务，对多种应用场景都能带来显著收益。你可以用它构建属于自己的 AI 智能体。

我们最初开发 Claude Code，是因为市面上没有理想的工具。现在，Agent SDK 为你提供同样的基础，让你能打造出同样强大的解决方案。

## 5 研究预览：Imagine with Claude

我们还发布了一个名为 “[Imagine with Claude](https://claude.ai/redirect/website.v1.6e3b59f5-bfac-4640-a43b-b82b5d1ba4ff/imagine)” 的限时研究预览。

<iframe frameborder="0" allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" title="An experimental new way to design software" width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/dGiqrsv530Y?autoplay=0&amp;mute=0&amp;controls=1&amp;origin=https%3A%2F%2Fwww.anthropic.com&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;iv_load_policy=3&amp;modestbranding=1&amp;enablejsapi=1&amp;widgetid=5&amp;forigin=https%3A%2F%2Fwww.anthropic.com%2Fnews%2Fclaude-sonnet-4-5&amp;aoriginsup=1&amp;gporigin=https%3A%2F%2Fwww.anthropic.com%2Fclaude%2Fsonnet&amp;vf=1" id="widget6" data-gtm-yt-inspected-12="true" style="box-sizing: inherit;"></iframe>

在这个实验中，Claude 可以实时生成软件，不依赖任何预设代码或功能。你能直接看到 Claude 即时响应、动态创造的全过程。

这是一个有趣的展示，体现了 Claude Sonnet 4.5 的潜力——当强大的模型遇上合适的基础设施，会产生怎样的创新可能。

“Imagine with Claude” 将为 Max 用户开放五天，你可以在 [claude.ai/imagine](https://claude.ai/redirect/website.v1.6e3b59f5-bfac-4640-a43b-b82b5d1ba4ff/imagine) 体验。

## 6 更多信息

我们建议所有用户升级至 Claude Sonnet 4.5。无论你通过应用、API 还是 Claude Code 使用 Claude，Sonnet 4.5 都可无缝替换原版本，并在相同价格下带来更好的性能。

Claude Code 更新已向所有用户开放，[Claude Developer Platform](https://claude.com/platform/api) 及 Claude Agent SDK 也已向所有开发者提供。代码执行与文件创建功能对所有付费计划用户开放。

完整的技术细节和评测结果可查看 [系统卡](https://www.anthropic.com/claude-sonnet-4-5-system-card)、[模型页面](https://www.anthropic.com/claude/sonnet) 和 [官方文档](https://docs.claude.com/en/docs/about-claude/models/overview)。
 你也可以浏览我们的 [工程博文](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)、[AI 智能体上下文管理文章](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)，以及关于 [网络安全研究](https://red.anthropic.com/2025/ai-for-cyber-defenders) 的报告。

#### 说明

*注1：从事网络安全或生物研究的客户可联系客户经理申请加入白名单。*

**方法说明**

- **SWE-bench Verified**：Claude 使用包含 bash 和文件编辑工具的基础环境，Sonnet 4.5 得分为 77.2%，在 500 个问题的完整数据集上平均 10 次运行。
- **OSWorld**：使用官方框架测试，最高 100 步，平均 4 次运行。
- **AIME**、**MMMLU**、**Finance Agent** 等评测的详细方法和结果均列于系统卡中。
- **Claude Sonnet 4.5** 在各项指标中均领先同类模型。

**发布日期：2025 年 9 月 29 日**

Sonnet 4.5 是目前全球在智能体、编程及计算机使用领域表现最出色的模型。在长时间任务中表现最为精准和细致，具备更强的专业知识覆盖，包括编程、金融与网络安全等领域。

- **Claude Sonnet 4**

  Sonnet 4 在多个方面相较 Sonnet 3.7 都有显著提升，尤其是在编程能力上。
   它为各种 AI 应用场景提供了强劲的性能支持，无论是面向用户的智能助理还是大规模任务处理。

  [了解更多]

- **Claude Sonnet 3.7 与 Claude Code**

  **发布日期：2025 年 2 月 24 日**

  Sonnet 3.7 是首个混合推理模型，也是迄今为止智能水平最高的版本。
   它在编程、内容生成、数据分析和规划等方面都达到了行业领先水平。

## 7 可用性与定价

任何人都可以在 Claude.ai 的网页端、iOS 或 Android 应用中使用 Sonnet 4.5 进行对话。

对于希望构建智能体的开发者，Sonnet 4.5 可在 Claude Developer Platform 上直接使用，也支持接入 Amazon Bedrock 与 Google Cloud 的 Vertex AI。

Sonnet 4.5 还可与行业领先的编程智能体 Claude Code 配合，处理复杂的编程任务。

Sonnet 4.5 的价格为每百万输入 Token 3 美元、每百万输出 Token 15 美元。

通过 [Prompt 缓存](https://docs.claude.com/en/docs/build-with-claude/prompt-caching) 可节省最高 90% 成本，通过 [批处理](https://docs.claude.com/en/docs/build-with-claude/message-batches#pricing) 可节省 50% 成本。
更多详情请访问 [定价页](https://claude.com/pricing#api)。

## 8 应用场景

Sonnet 4.5 是目前最强的智能体模型，同时也是全球在编程和计算机操作方面表现最佳的 AI 模型。

它可以快速给出即时响应，也能进行可视化的逐步思考。API 用户还可精细控制模型的“思考时长”。常见应用包括：

### **长期运行的智能体**

Sonnet 4.5 在指令理解、工具选择、错误修复和复杂推理方面表现卓越，非常适合客户服务型智能体和复杂 AI 工作流。

### **代码生成**

Sonnet 4.5 是构建自主编程智能体的理想选择，能够覆盖软件开发全流程：
 从初始规划、调试修复、维护升级到大型重构。
 它在规划与解决复杂编程任务方面都具有出色表现，可支持端到端的软件开发。
 同时，Sonnet 4.5 支持高达 64K 的输出 Token，非常适合生成和规划大规模代码。

### **浏览器与计算机操作**

Sonnet 4.5 在计算机操作能力上居于领先地位，能够可靠地完成浏览器相关任务，例如竞品分析、采购流程、客户入职等。
 Sonnet 3.5 是首个能够自主使用计算机的前沿模型，而 Sonnet 4.5 在这一能力上更精准、更稳定，并且会持续优化。

### **网络安全**

结合 Claude Code，使用 Sonnet 4.5 的团队可以部署能够自主修补漏洞的智能体，
 从被动检测转向主动防御。

### **金融分析**

Sonnet 4.5 可处理从基础财务分析到高级预测分析的各种任务。
 例如，它能持续监控全球监管变动，并主动调整合规系统，
 从传统的人工审计准备迈向智能化风险管理。

### **商务任务**

Sonnet 4.5 擅长生成和编辑办公文件，如演示文稿、文档和表格。

### **科研研究**

Sonnet 4.5 能在外部与内部数据源中进行搜索与整合，生成对复杂信息的系统洞察。

### **内容生成与分析**

Sonnet 4.5 在写作和内容分析上表现出色，能够理解语气与细微差别，创作更具吸引力的内容并进行深度分析。

## 9 基准测试

Sonnet 4.5 是迄今为止最强的编程模型，在 SWE-bench Verified 测试中取得了 **77.2%** 的成绩。在计算机操作测试 OSWorld 中也达到了 **61.4%**，刷新了业界记录。

Sonnet 4.5 同样在金融分析、网络安全与科研领域展现出卓越实力，能协调多个智能体并高效处理大量数据，满足高可靠性应用的需求。