# 06-Claude Opus 4.6 发布：更强编程与长程代理能力，测试版支持 100 万 token 上下文

## 0 前言

2026 年 2 月 5 日，正在升级最聪明的模型。

全新的 Claude Opus 4.6 在前代模型的基础上，进一步提升了编程能力。它在规划任务时更加谨慎，能够更长时间地持续执行具备自主性的任务，在大型代码库中运行得更加稳定，同时在代码审查和调试方面也更强，能够更好地发现并纠正自身错误。

Opus 系列模型中的首次尝试，Opus 4.6 在测试版中支持高达 100 万 token 的上下文窗口。

Opus 4.6 还能将这些增强能力应用到各种日常工作中，例如进行财务分析、开展研究，以及使用和创建文档、表格和演示文稿。在 [Cowork](https://claude.com/blog/cowork-research-preview) 中，Claude 可以自主并行处理多项任务，Opus 4.6 能够代表你充分发挥这些能力。

在多项评测中，该模型都达业界最先进水平：

- 具备代理式编程能力的评测 [Terminal-Bench 2.0](https://www.tbench.ai/news/announcement-2-0) 中，取得最高分；在复杂的多学科推理测试 [Humanity’s Last Exam](https://agi.safe.ai/) 中，也领先于所有其他前沿模型。在 [GDPval-AA](https://artificialanalysis.ai/evaluations/gdpval-aa)（一项衡量模型在金融、法律等高经济价值知识工作中表现的评测）中，Opus 4.6 比行业中表现第二好的模型（OpenAI 的 GPT-5.2）高出约 144 个 Elo 分值²，比自身的前代模型 Claude Opus 4.5 高出 190 分。此外，在衡量模型在线查找高难度信息能力的 [BrowseComp](https://openai.com/index/browsecomp/) 评测中，Opus 4.6 也优于其他所有模型。

正如[系统卡](https://www.anthropic.com/claude-opus-4-6-system-card)所展示的那样，Opus 4.6 的整体安全性表现与行业中任何其他前沿模型相比都同样优秀，甚至更好。在多项安全评估中，其行为偏离的发生率都保持在较低水平。

知识型工作：

![](https://p.ipic.vip/j2baty.jpg)

Opus 4.6 在多个专业领域的真实工作任务中都达到了业界最先进水平。

代理式搜索：

![](https://p.ipic.vip/wt5rr1.jpg)

编程：

![](https://p.ipic.vip/9w6r9q.jpg)

推理：

![](https://p.ipic.vip/p4xsg8.jpg)

在 Claude Code 中，你现在可以组建 [*代理团队*](https://code.claude.com/docs/en/agent-teams)，让多个代理协同完成任务。在 API 层面，Claude 可以通过 [*上下文压缩*](https://platform.claude.com/docs/en/build-with-claude/compaction) 对自身上下文进行总结，从而在不触及限制的情况下执行更长时间的任务。我们还引入了 [*自适应思考*](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)，模型可以根据上下文线索判断需要使用多少扩展思考能力；同时新增了 [*effort*](https://platform.claude.com/docs/en/build-with-claude/effort) 控制，让开发者在智能水平、速度和成本之间拥有更多调节空间。

我们对 [Claude in Excel](https://claude.com/claude-in-excel) 进行了大幅升级，并以研究预览形式发布了 [Claude in PowerPoint](https://claude.com/claude-in-powerpoint)，让 Claude 在日常工作场景中变得更加强大。

Claude Opus 4.6 现已在 [claude.ai](https://claude.ai/redirect/website.v1.6e3b59f5-bfac-4640-a43b-b82b5d1ba4ff)、我们的 API 以及所有主流云平台上线。如果你是开发者，可以通过 [Claude API](https://platform.claude.com/docs/en/about-claude/models/overview) 使用 `claude-opus-4-6`。价格保持不变，[定价页面](https://claude.com/pricing#api)。

下文将详细介绍该模型、本次新增的产品更新、各项评测结果，以及我们开展的大规模安全测试。

## 1 初步体验

用 Claude 打造 Claude。我们的工程师每天都在使用 Claude Code 编写代码，每一个新模型都会先在我们自己的工作中接受检验。对于 Opus 4.6，我们发现它：

- 无需额外提示，就能自动把注意力集中在任务中最具挑战性的部分
- 在相对简单的部分推进得很快
- 面对模糊问题时判断更加稳健
- 并且在长时间的会话中依然保持高效

Opus 4.6 往往会进行更深入、更谨慎的思考，在给出最终答案前反复检查自己的推理过程。这让它在复杂问题上能给出更好的结果，但在简单任务上可能会带来额外的成本和延迟。如果你发现模型在某些任务上“想得太多”，建议将 effort 从默认的 high 调整为 medium。通过 `/effort` [参数](https://platform.claude.com/docs/en/build-with-claude/effort) 控制。

以下是部分早期体验合作伙伴对 Claude Opus 4.6 的反馈，包括它在无需频繁人工干预的情况下自主工作的能力、在以往模型失败的场景中取得成功的表现，以及它对团队工作方式带来的影响：

Notion

> 能应对复杂请求，真正把事情做完：将任务拆解为具体步骤，逐一执行，并在任务目标宏大时依然产出完成度很高的成果。对 Notion 用户来说，它更像是一位得力的协作者，而不只是一个工具。

**Sarah Sachs**
AI Lead, Notion

------

GitHub

> 能胜任开发者每天面对的复杂、多步骤编程工作——尤其是在需要规划和工具调用的代理式工作流中表现突出。这开始解锁前沿层面的长周期任务能力。

**Mario Rodriguez**
Chief Product Officer, GitHub

**Replit**

> Claude Opus 4.6 在代理式规划方面实现了巨大飞跃。它能将复杂任务拆分为相互独立的子任务，并行运行工具和子代理，还能非常精准地识别阻塞点。

**Michele Catasta**
President, Replit

------

**Asana**

> 为我们的 AI Teammates 提供支持时，展现出了卓越的推理和规划能力。同时，它也是一款出色的编程模型——在大型代码库中定位并做出正确修改的能力。

**Amritansh Raghav**
Interim CTO, Asana

**Cognition**

> 复杂问题上的推理水平，能考虑到其他模型容易忽略的边界情况，并且持续给出更加优雅、周密的解决方案。在 Devin Review 中对 Opus 4.6 的表现尤为印象深刻，它显著提升了我们的漏洞发现率。

**Scott Wu**
CEO, Cognition

------

**Windsurf**

> 相比 Opus 4.5 有着明显提升，尤其是在需要细致探索的任务上，比如调试和理解陌生代码库。我们注意到 Opus 4.6 会进行更长时间的思考，而当任务需要更深层推理时，这种投入是非常值得的。

**Jeff Wang**
CEO, Windsurf

**Thomson Reuters**

> 在长上下文性能上实现了实质性的飞跃。在我们的测试中，它能够以高度一致的表现处理规模大得多的信息，这让我们在设计和部署复杂研究工作流时更加有底气。这一领域的进步，为我们打造真正值得专业人士信赖的专家级系统，提供了更强大的基础组件。

**Joel Hron**
Chief Technology Officer, Thomson Reuters

------

**Norges Bank**

> 在 40 次网络安全调查中，Claude Opus 4.6 有 38 次在与 Claude 4.5 模型的盲测排名中取得最佳结果。所有模型都在同一套代理式框架下端到端运行，最多使用 9 个子代理和 100+ 次工具调用。

**Stian Kirkeberg**
Head of AI & ML, NBIM

**Cursor**

> 从我们的内部基准测试和实际测试来看，长时间运行的任务上代表了新的前沿水平。同时，它在代码审查方面也非常高效。

**Michael Truell**
Co-founder & CEO, Cursor

------

**Harvey**

> 在 BigLaw Bench 上取得了所有 Claude 模型中最高的 90.2% 得分。其中 40% 的结果为满分，84% 的得分高于 0.8，在法律推理方面表现得极其出色。

**Niko Grupen**
Head of AI Research, Harvey

**Rakuten**

> 一天之内自主关闭了 13 个问题，并将 12 个问题分配给合适的团队成员，管理着一个约 50 人、涵盖 6 个代码仓库的组织。它同时处理了产品层面和组织层面的决策，能够在多个领域间综合上下文，并且清楚何时需要升级交由人类处理。

**Yusuke Kaji**
General Manager, AI, Rakuten

------

**Lovable**

> 设计质量上有明显提升。它与我们的设计系统配合得非常好，而且更加自主，这正是 Lovable 所重视的核心价值。人们应该专注于创造真正重要的东西，而不是事无巨细地管理 AI。

**Fabian Hedin**
Co-founder, Lovable

**Box**

> 在高强度推理任务中表现出色，例如跨法律、金融和技术内容的多源分析。Box 的评测显示，其性能提升了 10%，从 58% 提升至 68%，并在技术领域取得了接近满分的成绩。

**Yashodha Bhavnani**
Head of AI, Box

------

**Figma**

> 能在 Figma Make 中生成复杂、交互性强的应用和原型，展现出令人印象深刻的创意广度。它能够在第一次尝试中就把详细设计和多层次任务准确转化为代码，成为团队探索和构建想法时极具价值的起点。

**Loredana Crisan**
Chief Design Officer, Figma

**Shopify**

> 在几乎不需要额外提示的情况下就能理解意图，并且会主动超出预期，探索并创造出一些在我看到之前甚至没意识到自己想要的细节。这种体验更像是在与模型一起工作，而不是等待它完成任务。

**Paulo Arruda**
Staff Engineer, Shopify

------

**Bolt.new**

> 无论是上手测试还是评测结果，都表明在设计系统和大型代码库方面带来了显著提升，而这些正是能为企业创造巨大价值的使用场景。它甚至一次性生成了一个完整可用的物理引擎，在单次执行中处理了一个范围极大的多层任务。

**Eric Simons**
CEO, Bolt.new

**Ramp**

> Claude Opus 4.6 是我近几个月看到的最大一次飞跃。我已经可以更放心地把一整串跨技术栈的任务交给它去执行。它足够聪明，知道如何为不同环节使用合适的子代理。

**Jerry Tsui**
Staff Software Engineer, Ramp

------

**SentinelOne**

> 像一位资深工程师一样完成了一个包含数百万行代码的迁移任务。它先进行整体规划，在过程中不断调整策略，并最终用一半的时间完成了工作。

**Gregor Stewart**
Chief AI Officer, SentinelOne

**Vercel**

> 我们只有在开发者能够真切感受到差异时，才会在 v0 中上线模型。Claude Opus 4.6 轻松达到了这一标准。它在边界情况上的前沿级推理能力，帮助 v0 实现了我们最核心的目标：让任何人都能把想法从原型提升到可投入生产的产品。

**Zeb Hermann**
General Manager, v0, Vercel

------

**Shortcut**

> 带来的性能提升几乎令人难以置信。那些对 Opus [4.5] 来说仍然颇具挑战的真实任务，突然之间变得轻而易举。这对 Shortcut 上的表格代理来说，感觉像是一个分水岭时刻。

**Nico Christie**
Co-founder & CTO, Shortcut.ai

## 2评测

在代理式编程、计算机使用、工具调用、搜索以及[金融](https://claude.com/blog/opus-4-6-finance)等多个领域中，Opus 4.6 都是行业领先模型，而且往往优势明显。Claude Opus 4.6 与我们之前的模型以及其他行业模型在多项基准测试中的对比结果：

![](https://p.ipic.vip/b1g1ro.jpg)

Opus 4.6 在从大型文档集合中检索关键信息方面表现出色。这一点在长上下文任务中尤为明显：它能够在几十万 token 的信息中保持更低的偏移，更好地追踪细节，甚至能捕捉到连 Opus 4.5 都会遗漏的关键信息。

人们对 AI 模型的一个常见抱怨是“[上下文腐化](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)”，即随着对话 token 数不断增加，模型性能逐渐下降。Opus 4.6 在这方面相较前代有了显著改进：在 [MRCR v2](https://huggingface.co/datasets/openai/mrcr) 的 8-needle、100 万 token 版本测试中（该测试用于评估模型在海量文本中定位“隐藏”信息的能力），Opus 4.6 的得分为 76%，而 Sonnet 4.5 仅为 18.5%。这代表着模型在真正利用超长上下文并保持高性能方面发生了质的飞跃。

总体来看，Opus 4.6 在长上下文中查找信息的能力更强，在吸收信息后的推理表现更好，并且整体的专家级推理能力有了显著提升。

长上下文检索

![](https://p.ipic.vip/44agbm.jpg)

Opus 4.6 在长上下文检索方面取得了显著进步。

长上下文推理

![](https://p.ipic.vip/ej094f.jpg)

最后，下方图表展示了 Claude Opus 4.6 在多项评测中的表现，这些评测涵盖软件工程能力、多语言编程、长期一致性、网络安全能力以及生命科学知识等方面。

根因分析

![](https://p.ipic.vip/fkmc83.jpg)
 Opus 4.6 在诊断复杂软件故障方面表现尤为突出。

多语言编程

![](https://p.ipic.vip/da6n47.jpg)

长期一致性

![](https://p.ipic.vip/6tl4tg.jpg)

网络安全

![](https://p.ipic.vip/9bwowb.jpg)

生命科学

![](https://p.ipic.vip/lw2eeu.jpg)

## 3 安全提升

这些智能水平的提升并未以牺牲安全性为代价。在我们的自动化行为审计中，Opus 4.6 在欺骗、讨好式迎合、强化用户妄想以及协助不当用途等偏离行为上的发生率都很低。整体与前代 Claude Opus 4.5 一样保持了高度对齐，而后者此前已是我们对齐度最高的前沿模型。

近期所有 Claude 模型中“过度拒答”（即对无害问题未能作答）发生率最低的。

对比 Opus 4.6 与其他 Claude 模型在整体偏离行为上的柱状图

![](https://p.ipic.vip/ontqgn.jpg)

各代 Claude 模型在自动化行为审计中的整体偏离行为得分（详见 [Claude Opus 4.6 系统卡](https://www.anthropic.com/claude-opus-4-6-system-card)）。

针对 Claude Opus 4.6，我们开展了迄今为止最全面的一套安全评估，引入了多项全新的测试方法，并升级了多项既有评估。这其中包括针对用户福祉的新评估、更复杂的危险请求拒绝能力测试，以及对模型是否可能暗中执行有害行为的更新评估。我们还尝试了来自 [可解释性研究](https://www.anthropic.com/research/team/interpretability) 的新方法，开始探索模型为何会表现出某些行为，从而在常规测试之外更早发现潜在问题。

所有能力与安全评估的详细说明，均可在 [Claude Opus 4.6 系统卡](https://www.anthropic.com/claude-opus-4-6-system-card) 中查看。

Opus 4.6 在某些方面表现尤为突出的能力（这些能力既可能带来益处，也可能被滥用），我们引入了新的防护措施。尤其是在网络安全方面，由于模型能力显著增强，我们开发了 6 种新的网络安全 [探针](https://www.anthropic.com/research/next-generation-constitutional-classifiers)，用于检测潜在的有害输出，从而更好地监控不同形式的滥用风险。

与此同时，我们也在加速模型在网络*防御*领域的应用，利用它帮助发现并修复开源软件中的漏洞（详见我们最新的 [网络安全博客文章](https://red.anthropic.com/2026/zero-days/)）。我们认为，让网络防御人员使用 Claude 这样的 AI 模型来缩小差距至关重要。网络安全形势变化迅速，我们也会随着对潜在威胁的认识不断更新防护措施；在不久的将来，甚至可能引入实时干预机制来阻止滥用行为。

## 4 产品与 API 更新

我们在 Claude、Claude Code 以及 Claude 开发者平台上进行了全面升级，以充分释放 Opus 4.6 的能力。

### 4.1 Claude 开发者平台

API为开发者提供更精细的 effort 控制，以及对长时间运行代理的更高灵活性，新功能：

#### 自适应思考（Adaptive thinking）

过去，开发者只能在开启或关闭扩展思考之间二选一。现在，通过 [自适应思考](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)，Claude 可以自行判断何时需要进行更深入的推理。在默认的 high effort 下，模型会在合适的场景启用扩展思考；开发者也可以通过调整 effort，让模型变得更或更不“谨慎”。

#### Effort 控制

现在共有四种 [effort](https://platform.claude.com/docs/en/build-with-claude/effort) 级别可选：low、medium、high（默认）和 max。我们鼓励开发者多加尝试，找到最适合自己场景的配置。

#### 上下文压缩（Context compaction，测试版）

长时间对话和代理式任务常常会触及上下文窗口上限。[上下文压缩](https://platform.claude.com/docs/en/build-with-claude/compaction) 会在对话接近可配置阈值时，自动总结并替换较早的上下文，使 Claude 能够在不触及限制的情况下持续执行任务。

#### 100 万 token 上下文（测试版）

Opus 4.6 是我们首个支持 100 万 token 上下文的 Opus 系列模型。超过 20 万 token 的提示将采用高级定价：输入/输出分别为每百万 token $10 / $37.50。

#### 12.8 万 token 输出

Opus 4.6 支持最多 128k token 的输出，可一次性完成更大规模的输出任务，无需拆分成多次请求。

#### 仅限美国的推理（US-only inference）

对于需要在美国境内运行的工作负载，可使用 [US-only inference](https://platform.claude.com/docs/en/build-with-claude/data-residency)，价格为标准 token 定价的 1.1 倍。

### 4.2 产品更新

在 Claude 和 Claude Code 中，新增多项功能，帮助知识型工作者和开发者借助日常工具应对更复杂的任务。

我们在 Claude Code 中以研究预览形式推出了 [代理团队](https://code.claude.com/docs/en/agent-teams)。你现在可以同时启动多个代理，让它们并行协作、自主协调，非常适合可拆分为多个独立、偏重阅读任务的场景，例如大型代码库审查。你也可以通过 Shift+Up/Down 或 [tmux](https://github.com/tmux/tmux/wiki) 随时接管任意子代理。

Claude 现在也能更好地与你常用的办公工具协同工作。Claude in Excel 在处理耗时更长、难度更高的任务时性能显著提升，能够在行动前进行规划，自动吸收非结构化数据并推断合适的数据结构，还能一次性完成多步骤修改。再结合 Claude in PowerPoint，你可以先在 Excel 中处理和组织数据，再将其以视觉化方式呈现在 PowerPoint 中。Claude 会读取你的版式、字体和母版，确保输出内容符合品牌风格，无论你是基于模板创建，还是根据描述生成完整演示文稿。Claude in PowerPoint 现已面向 Max、Team 和 Enterprise 套餐开放研究预览。

## 5 注释

[1] 由 Artificial Analysis 独立运行。完整方法论详见 [此处](https://artificialanalysis.ai/methodology/intelligence-benchmarking#gdpval-aa)。

[2] 这意味着在该评测中，Claude Opus 4.6 约有 70% 的情况下得分高于 GPT-5.2（若两者完全持平，该比例应为 50%）。

- 对于 GPT-5.2 和 Gemini 3 Pro，我们在图表和表格中对比的是各自报告的最佳模型版本。
- **Terminal-Bench 2.0**：我们同时报告了在自有基础设施上复现的结果以及其他实验室公布的成绩。除 OpenAI 的 Codex CLI 外，所有实验均使用 Terminus-2 框架，资源配置为 1× 保证 / 3× 上限，每个任务在分批运行中采样 5–15 次，详见系统卡。
- **Humanity’s Last Exam**：Claude 模型在“使用工具”模式下运行，启用了网页搜索、网页抓取、代码执行、程序化工具调用，在 50k token 触发上下文压缩、总 token 上限 300 万，最大推理 effort，并开启自适应思考。同时使用领域黑名单进行去污染处理，详见系统卡。
- **SWE-bench Verified**：得分基于 25 次试验取平均值；在调整提示后，我们曾观察到 81.42% 的成绩。
- **MCP Atlas**：Claude Opus 4.6 在 max effort 下运行；在 high effort 下也达到了行业领先的 62.7%。
- **BrowseComp**：Claude 模型启用了网页搜索、网页抓取、程序化工具调用，在 50k token 触发上下文压缩、总 token 上限 1000 万，最大推理 effort，且未启用 thinking。引入多代理框架后，得分可提升至 86.8%，详见系统卡。
- **ARC AGI 2**：Claude Opus 4.6 在 max effort、120k thinking 预算下运行。
- **CyberGym**：Claude 模型在无 thinking、默认 effort、temperature 和 `top_p` 设置下运行，同时提供了一个允许多轮交错思考的 “think” 工具。
- **OpenRCA**：在每个故障案例中，若 Claude 生成的所有根因要素均与真实答案一致，则得 1 分，否则得 0 分；总体准确率为所有案例的平均得分。