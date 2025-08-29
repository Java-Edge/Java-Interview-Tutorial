# 面向开发者的GPT-5

我们最先进的编码与智能体任务模型

## 0 简介

北京时间2025年8月8日凌晨一点，正式在 API 平台发布 GPT‑5——我们迄今为止在编码和智能体任务方面表现最佳的模型。

GPT‑5 在关键编码基准测试中处于行业SOTA。

### SOTA

State of the Art,，直译为最先进水平或当前最优。

在人工智能和机器学习领域，它有一个比较明确的专业含义：

- 指在某一特定任务或基准测试（benchmark）上，**当前所有公开已知方法中性能最高的记录**。
- 它并不是一个固定标准，而是会随着新的技术和模型出现不断被刷新。

**举例理解**：

- 假设业界有一个代码理解的测试集（比如 HumanEval），过去最好成绩是 90 分，那就是当时的 SOTA。
- 如果 GPT-5 在这个测试里拿了 94 分，就刷新了 SOTA，也就是说它成了“新的最强王者”。

**意义**：

1. **技术标杆**：说明 GPT-5 在该任务上的表现，已经超过所有已知的模型或方法。
2. **行业信号**：会被学术界和产业界视作重要突破，引发跟进研究或应用。
3. **商业价值**：在市场宣传中，SOTA 能有效传递“性能最好”的竞争优势。

可将SOTA 理解成 AI 竞赛的 **世界纪录** —— 只要有新选手刷新纪录，它就会被改写。

在 SWE-bench Verified 测试中得分 74.9%，在 Aider polyglot 测试中得分 88%。我们训练了GPT‑5，使其成为真正编码协作伙伴。擅长生成高质量代码并处理诸如修复漏洞、修改代码及解答复杂代码库相关问题等任务。具备可控性和协作性——能以极高精度执行非常详细指令，并在工具调用前及期间提前解释其操作原因。前端编码方面也表现出色，内部测试在 70% 前端 Web 开发任务表现优于 OpenAI o3。

与初创公司和企业早期测试者合作，使用真实世界编码任务对 GPT‑5 训练。除了编码基准测试SOTA，截至目前，GPT‑5 还是[customer A]、[customer B]和[customer C]的默认模型：

- **Cursor** 表示，GPT‑5“具有显著的智能，易于操控，甚至拥有其他模型中不具备的人格特质”
- **Windsurf** 指出，GPT‑5 在其评估中达到最先进水平，且“与其他前沿模型相比，工具调用错误率仅为其一半”

GPT‑5 在持续型智能体任务中同样表现卓越——在两个月前刚发布的工具调用基准测试 τ2-bench telecom 中，以 96.7% 成绩刷新业界最优水平。在事实准确性基准测试 LongFact 和 FActScore 中，GPT‑5 错误率仅为 o3 的五分之一。GPT‑5 改进的工具智能使其能够可靠地串联数十次工具调用（无论串行还是并行），保持路径一致性，这使其在执行复杂的现实世界端到端任务时表现得远优于其他模型。它还更精确地遵循工具指令，更好地处理工具错误，并在长背景信息内容检索方面表现出色。**Manus** 表示，GPT‑5 “在各种智能体任务中表现出色，即使在未修改任何代码或调整提示的情况下”。**Inditex** 指出：“真正让 [GPT‑5] 脱颖而出的是其推理的深度：细致入微、多层次的答案，体现了对实际主题的深刻理解。”

### API

API 中引入新功能，让开发人员对模型回复具有更多控制权。GPT‑5 支持：

- 新的 `verbosity` 参数（取值：`低`、`中`、`高`），帮助控制控制回答是简短扼要 or 详尽全面
- `reasoning_effort` 参数可设置为`最小`值，以更快获取答案，无需先行大量推理
- 新增一种工具类型——自定义工具——使 GPT‑5 能用纯文本而非 JSON 调用工具。自定义工具支持基于背景信息无关文法的约束配置

将在 API 中发布 GPT‑5 的三版——`gpt-5`、`gpt-5-mini` 和 `gpt-5-nano`——以赋予开发人员更多灵活性，在性能、成本和延迟权衡。ChatGPT 中的 GPT‑5 是包含推理、非推理和路由器模型的系统，但 API 平台中的 GPT‑5 是驱动 ChatGPT 实现最佳性能的推理模型。GPT‑5 的最小推理模型与 ChatGPT 中的非推理模型是不同模型，且更适合开发者。

如需了解 ChatGPT 中的 GPT‑5，以及更多关于 ChatGPT 改进的信息，请访问我们的博客[LINK]。如需了解更多关于企业如何积极采用 GPT‑5 的信息，请参阅我们的[企业博客⁠](https://openai.com/zh-Hans-CN/index/gpt-5-new-era-of-work/)。

### 编码

迄今发布最强大编码模型。编码基准测试和实际应用场景中均优于 o3，且经过专门优化，在 Cursor、Windsurf 和 Codex CLI 等智能体编码产品中表现尤为出色。GPT‑5 给我们的 Alpha 测试者留下了深刻印象，在他们多次内部私密评估中创下了多项纪录。 

## 1 实际编码任务的早期反馈

### Cursor

> “我们的团队发现，GPT-5 具有显著的智能，易于操控，甚至拥有任何其他模型中不具备的人格特质。它不仅能发现那些难以察觉的深层隐藏漏洞，还能运行长时间的多轮后台任务，确保复杂任务顺利完成——这些正是过去其他模型难以解决的问题。它已成为我们日常工作的得力工具，从规划和实施 PR 到完成端到端构建，无所不能。”

Cursor 联合创始人兼首席执行官 Michael Truell

### Windsurf

> “GPT-5 在我们内部评估中表现优异，该评估主要衡量模型在真实软件工程任务中的性能。我们还发现，该模型相较于其他前沿模型，工具调用错误率降低了一半。它能够以连贯且易于理解的方式持续解决复杂任务。”

Windsurf 工程主管 Edison Zhang

### Vercel

> “GPT-5 通过了我们所有测试。我们在使用它进行 v0.dev 开发时的初步印象是，它是目前最佳的前端 AI 模型，在美学感知和代码质量方面均达到顶尖水平，堪称独树一帜。它在硬核计算机科学与艺术感知能力的交汇点上表现卓越，标志着从过去简单的代码补全功能到能够跨设备和屏幕运行的全栈应用的跨越式发展。”

Vercel 首席执行官兼创始人 Guillermo Rauch

### JetBrains

> “GPT-5 正在改变编码游戏规则。作为默认模型，它使 JetBrains AI 助手和编码智能体 Junie 的性能和质量提升了超过 1.5 倍。”对于我们全新的无代码平台 Kineto，GPT-5 使其构建的应用在设计、前端和整体体验方面实现了端到端质量的翻倍。

Kirill Skrygan，JetBrains 首席执行官

### Factory

> GPT-5 在规划和长背景信息可靠性方面表现卓越，尤其擅长与 Factory 的 Code Droid 协同执行复杂的异步重构任务。它拥有强大的智能体功能，增强了 Code Droid 绘制影响图、细致收集背景信息、提出分步计划、生成精确差异、更新测试和运行持续集成 (CI) 的能力。

Factory 联合创始人兼首席技术官 Eno Reyes

### Lovable

> “我们对 GPT-5 的内部测试表明，它将使数百万 Lovable 用户在应用开发过程中走得更远。它能够通过单个提示生成高级应用，并能够调试现有大型项目中的复杂问题。它在处理大型代码库的推理和代码重构以提高可维护性方面表现出色。”

Lovable AI 负责人 Alexandre Pesant

### Gitlab

> “GPT-5 在复杂的软件工程任务中表现出色。该模型始终只需更少的工具调用即可解决问题，同时生成更稳定可靠、更易于维护的代码。GPT-5 的可靠性和效率让我们对部署它充满信心。”

GitLab 首席技术官 Sabrina Farmer

### Augment Code

> “GPT-5 是一款领先的编码模型。它在跨文件推理和依赖关系解析方面表现尤为出色，并且在进行大规模代码修改时能够谨慎操作并进行明确验证。我们认为这是一种适用于大型项目场景的理想选择，尤其是在涉及多个文件的更改并需要考虑整个项目范围内的限制条件时。”

Augment Code 联合创始人兼首席科学家 Guy Gur-Ari

### GitHub

> “在我们的评估中，我们发现 OpenAI 的 GPT-5 在 o3 的先进推理能力基础上进一步提升，使开发人员能够解决更复杂的问题——从代码重构到处理大型代码库。我们很高兴将这一技术引入 GitHub Copilot，助力数百万开发人员利用这一全新智能，解决更宏大的技术挑战。”

GitHub 首席执行官 Thomas Dohmke

### Cognition

> “GPT-5 相较于之前的 OpenAI 模型（如 GPT-4.1）代表了巨大的飞跃。我们认为 GPT-5 处于智能体能力的前沿，并在需要复杂代码理解的任务中表现出色。在我们的初级 SWE 评估中，GPT-5 在代码探索和规划方面表现尤为突出。”

Cognition 联合创始人兼首席执行官 Scott Wu

## 2 评测

### SWE-bench Verified

在基于真实软件工程任务的 SWE-bench Verified 评估中，GPT‑5 的得分达到 74.9%，较 o3 版本的 69.1% 有所提升。GPT‑5以更高效率和速度获得高分：与 o3 在高推理强度下相比，GPT‑5 的输出令牌数量减少 22%，工具调用次数减少 45%。

![](https://p.ipic.vip/x1dvlf.png)

在 [SWE-bench Verified⁠](https://openai.com/index/introducing-swe-bench-verified/) 基准测试中，模型会获得代码仓库和问题描述，并需要生成补丁来解决问题。文本标签用于标识推理强度。我们的评分排除了 500 个问题中的 23 个，因其解决方案在我们的测试环境中无法稳定通过。GPT‑5 收到一个简短的提示，强调要彻底验证解决方案；而相同的提示对 o3 没有帮助。

### Aider polyglot 

在评估代码编辑能力的 Aider polyglot 测试中，GPT‑5 以88% 的得分刷新纪录，其错误率较 o3 版本降低了三分之二。

![](https://p.ipic.vip/a75y1p.png)

### Aider Polyglot⁠

在 [Aider Polyglot⁠](https://aider.chat/2024/12/21/polyglot.html#the-polyglot-benchmark) (diff) 中，模型会收到来自 Exercism 的编码练习，且必须将其解决方案以代码差异的形式编写出来。推理模型在高推理强度下运行。

GPT‑5 在深度分析代码库方面表现出色，能够精准解答关于代码模块运作机制及相互协作的问题。在像 OpenAI 的强化学习框架这样复杂的代码库中，我们发现 GPT‑5 能够帮助我们分析和解答关于代码的问题，从而加速我们日常工作的效率。 

## 3 前端工程

在为 Web 应用生成前端代码时，GPT‑5 展现出更优的审美水准、更强的能力和更高的准确性。在与 o3 的并排比较中，GPT‑5 在 70% 的情况下更受我们的测试人员青睐。

以下是一些精选的有趣示例，展示 GPT‑5 仅需单次提示就能完成的任务：

### 3.1 Espresso Lab 网站

<iframe src="https://gpt5-coding-examples.vercel.app/espresso" title="GPT 示例：Espresso 网站" class="aspect-3/4 @md:aspect-4/3 mb-2 min-h-[400px] w-full border-none" loading="lazy" style="box-sizing: border-box; border: 0px none rgb(229, 231, 235); --tw-border-spacing-x: 0; --tw-border-spacing-y: 0; --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-gradient-from-position: ; --tw-gradient-via-position: ; --tw-gradient-to-position: ; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgba(59,130,246,.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; --tw-contain-size: ; --tw-contain-layout: ; --tw-contain-paint: ; --tw-contain-style: ; display: block; vertical-align: middle; margin-bottom: 0.5rem; aspect-ratio: 4 / 3; min-height: 400px; width: 1005.33px;"></iframe>

**提示：**请为一项服务设计一个美观且真实的登录页，该服务面向顶级咖啡爱好者，提供每月 200 美元的订阅计划，包含咖啡烘焙设备租赁及专业指导，助其打造完美意式浓缩咖啡。目标受众为旧金山湾区的中年人群，可能从事科技行业，受过良好教育，拥有可支配收入，并对咖啡的艺术与科学充满热情。优化转化率，以实现 6 个月的订阅注册。

### 3.2 音频步进序列器应用

<iframe src="https://cdn.openai.com/gpt-examples/d373b1b4-5e68-4439-8e57-cab2dc246abb/audio-step-sequencer.html" title="GPT 示例：音频步进序列器" class="aspect-3/4 @md:aspect-4/3 mb-2 min-h-[400px] w-full border-none" loading="lazy" style="box-sizing: border-box; border: 0px none rgb(229, 231, 235); --tw-border-spacing-x: 0; --tw-border-spacing-y: 0; --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-gradient-from-position: ; --tw-gradient-via-position: ; --tw-gradient-to-position: ; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgba(59,130,246,.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; --tw-contain-size: ; --tw-contain-layout: ; --tw-contain-paint: ; --tw-contain-style: ; display: block; vertical-align: middle; margin-bottom: 0.5rem; aspect-ratio: 4 / 3; min-height: 400px; width: 798.333px;"></iframe>



**提示：**在单个 HTML 文件中创建单页应用，满足以下要求：

- `名称：音频步进序列器`
- `堆栈：WebAudio API。`
- `目标：16 步鼓网格。`
- `功能：节奏、摇摆、模式保存/加载、导出 WAV（渲染简单缓冲区）。`
- `界面应具有未来感，让播放变得有趣！`

### 3.3 外太空游戏

<iframe src="https://gpt5-coding-examples.vercel.app/asteroid-game" title="GPT 示例：太空游戏" class="aspect-3/4 @md:aspect-4/3 mb-2 min-h-[400px] w-full border-none" loading="lazy" style="box-sizing: border-box; border: 0px none rgb(229, 231, 235); --tw-border-spacing-x: 0; --tw-border-spacing-y: 0; --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-gradient-from-position: ; --tw-gradient-via-position: ; --tw-gradient-to-position: ; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgba(59,130,246,.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; --tw-contain-size: ; --tw-contain-layout: ; --tw-contain-paint: ; --tw-contain-style: ; display: block; vertical-align: middle; margin-bottom: 0.5rem; aspect-ratio: 4 / 3; min-height: 400px; width: 798.333px;"></iframe>

**`提示：`**`制作一款 2D 太空游戏，玩家可以驾驶飞船，躲避并摧毁小行星，并与其他由计算机控制的 AI 进行空战。在飞船设计上要富有创意。确保游戏玩法正常且有趣。将代码输出到单个 next.js 页面文件 (page.tsx) 中，该文件可直接粘贴到由 create-next-app 创建的 next.js 应用中，并附带运行所需的任何背景信息或说明。`

更多 GPT‑5 生成示例，访问[这里⁠](https://platform.openai.com/docs/guides/latest-model?gallery=open)的图库。

## 4 编码协作

GPT‑5 不仅是出色的程序员，还是更优秀的协作者，尤其在 Cursor、Windsurf 和 Codex CLI 等智能体编码产品中表现突出。在运行过程中，GPT‑5 能够在工具调用间隙输出执行计划、状态更新和操作摘要。相比我们以往的模型，GPT‑5 在执行复杂任务时更具主动性，无需等待用户确认指令，也不会因任务复杂度高而迟疑。

当用户请求为其餐厅创建网站时，GPT‑5 会快速制定计划、搭建应用框架、安装依赖项、生成网站内容、运行构建流程以检查编译错误、总结工作成果，并提出潜在的下一步建议。完整创建网站的实际耗时约为三分钟。

## 5 智能体任务和早期反馈

除智能体编码外，GPT‑5 在各类智能体任务中的表现都更为出色。GPT‑5 在指令遵循（在 o3‑mini 评分下，[Scale MultiChallenge⁠](https://arxiv.org/abs/2501.17399) 上的得分达到 69.6%）和工具调用（在 τ2 -bench telecom 上的得分达到 96.7%）的基准测试中创下了新纪录。通过增强的工具智能，GPT‑5 能更可靠地串联多个操作步骤来完成现实世界任务。

### Manus

> “GPT-5 是一个重大飞跃。它在我们的内部基准测试中取得了迄今为止单个模型的最佳性能。GPT-5 在各种智能体任务中都表现出色，即使在我们尚未修改任何代码或调整提示词之前。通过新的前导消息机制和更精准的工具控制体系，我们的智能体在稳定性和可控性方面实现了质的飞跃。”

Manus 联合创始人兼首席科学家 Yichao ‘Peak’ Ji

### Mercado Libre

> “GPT-5 在所有评估模型中表现最为出色。工具执行精度较 o4-mini 提升了 9%，较 GPT-4.1 提升了 36%，而工具与消息的综合准确率分别提升了 24% 和 47%。新的 ‘verbosity’ 参数是获得恰当细节水平答案的关键，从而提升了模型的回复质量。”

### Notion

> “GPT-5 在智能与速度之间实现了完美的平衡。作为我们首个引入 Notion AI 的推理模型，它在处理长期任务时表现出色，成功率较之前提升了 15%。其快速响应能力，尤其在低推理模式下，使 GPT-5 成为解决复杂任务的一站式理想选择。”

Notion AI 工程主管 Abhishek Modi

### Genspark

> “GPT-5 在 Genspark 的 Super Agent 基准测试中，相较于 GPT-4.1，用户满意度提升了 79%。该基准测试旨在评估复杂工具使用及具有挑战性的端到端任务。与我们的实时系统相比，GPT-5 还使不满意的响应减少了 34%，这对系统可靠性至关重要。此外，GPT-5 在 HTML 和 PowerPoint 生成方面展现出更强大的创造性判断力，能够生成更精致、更现代的设计，并更好地遵循指令。”

Genspark 联合创始人兼首席技术官 Kay Zhu

### Inditex

> GPT-5 不仅会响应，更懂得预判。它彻底改变了我们将销售数据转化为可操作洞察的方式，能够主动分析背景信息并提前提供建议，甚至在我们想到提问之前就已完成，从而节省了无数次迭代。其对提示的精准解读——对语气、范围和结构的精确控制——结合细致入微、多层次的推理能力，使其更像是一位专家级合作伙伴，而非单纯的工具。

Inditex 数据与 AI 负责人 Oscar Mateos Ventura

### Zendesk

> “在 Zendesk，我们正在将 GPT-5 直接集成到我们的生产工作流程中。在我们的 AI 智能体中，它能够提供更完整、更少遗漏细节的回复，将回退升级率降低了超过 20%。在 App Builder 中，它比之前快了 25 至 30%，并能够实现每分钟多达 3 至 4 倍的提示迭代——这极大地加快了客户的开发速度。”

Zendesk 产品、工程与 AI 部门总裁 Shashi Upadhyay

### Canva

> “GPT-5 代表了人工智能领域的一次重大飞跃。我们特别对其在编码、多步骤任务和智能体系统方面的能力印象深刻，我们的评估显示，其在完成复杂任务的成功率上提升了 44%。该模型能够理解并遵循更复杂、更精细的提示，我们还观察到它能够解决此前大型语言模型 (LLMs) 无法一次性解决的问题。”

Canva AI 产品负责人 Danny Wu

### Atlassian

> “在测试中，GPT-5 在 Rovo 的多智能体协调以及 RovoDev 的编码任务中均表现出色。它能够轻松处理模糊性，明确用户意图，并有效调度子智能体以完成复杂的多步骤任务——包括深入研究。在各种场景下，它都能以更高的令牌效率提供高质量解决方案，使其成为需要大量推理的开发工作流的强大工具。”

Atlassian AI 与产品工程高级副总裁兼负责人 Taroon Mandhana

### Harvey

> “在我们对 GPT-5 的早期访问中，该模型在所有领域，尤其是我们所在的法律领域，实现自主行为的潜力是显而易见的。该模型在法律推理、工具使用与协调以及长篇文书起草能力方面有着令人印象深刻的结合——这些都是我们用例中至关重要的能力。”

Harvey 首席执行官兼联合创始人 Winston Weinberg

### BBVAClay优步 (Uber)

> GPT-5 擅长编写代码和处理技术任务，从而实现工作流程的自动化。在某一案例中，模型甚至帮助我们完成了一项非常战略性的任务，原本需要二到三周的时间，现在只需几个小时即可完成，展现出令人惊叹的主动性。”GPT-5 因其速度和处理西班牙语的能力脱颖而出，在准确性方面超越了旧模型，并且运行速度是旧模型的两倍。”

BBVA 全球 AI 应用负责人 Elena Alfaro

> “GPT-5 是一个重大飞跃。它在我们的内部基准测试中取得了迄今为止单个模型的最佳性能。GPT-5 在各种智能体任务中都表现出色，即使在我们尚未修改任何代码或调整提示词之前。通过新的前导消息机制和更精准的工具控制体系，我们的智能体在稳定性和可控性方面实现了质的飞跃。”


## 6 工具调用

我们努力优化了工具调用机制，以满足开发者的实际需求。GPT‑5 在遵循工具指令、处理工具错误以及自主实现串行或并行的多工具调用方面表现更佳。当收到指令时，GPT‑5 还可以在工具调用前及期间输出前置消息，以便在执行较长的智能体任务时向用户更新进度。

两个月前，Sierra.ai 发布了τ2-bench telecom 测试基准，该基准作为高难度工具使用评估体系，重点揭示了语言模型在用户可变更环境状态下的性能显著衰减现象。根据其[发布报告⁠](https://arxiv.org/pdf/2506.07982)，所有参评模型的得分均未超过 49%。而 GPT‑5 的得分为 97%。

在 [τ2-bench⁠](https://arxiv.org/pdf/2506.07982) 测试中，模型必须使用工具来完成一项客户服务任务，其中可能存在能够与系统交互并根据系统状态采取行动的用户。推理模型在高推理强度下运行。

![](https://p.ipic.vip/p9bjab.png)

GPT‑5 在长背景信息性能方面也展现出显著提升。在 OpenAI-MRCR（一种衡量长背景信息检索能力的指标）中，GPT‑5 的表现优于 o3 和 GPT‑4.1，且随着输入长度的增加，这种优势会显著扩大。

![](https://p.ipic.vip/y69ifo.png)

在 [OpenAI-MRCR⁠](https://huggingface.co/datasets/openai/mrcr)（多轮共指解析）中，多个相同的“针”用户请求被插入到由相似请求和响应组成的长“草堆”中，模型被要求重现第 i 个“针”的响应。平均匹配比率衡量模型回复与正确答案之间的平均字符串匹配比率。在 256k 最大输入令牌处的数据点代表 128k 至 256k 输入令牌范围内的平均值，依此类推。这里，256k 代表 256 × 1,024 = 262,114 个令牌。推理模型在高推理强度下运行。

还开源[BrowseComp Long Context](https://huggingface.co/datasets/openai/BrowseCompLongContext)，评估长背景信息问答的新基准。在此基准中，模型会收到用户查询、一长串相关搜索结果，并必须基于搜索结果回答问题。设计时，旨在使其具有现实性、挑战性，并确保基准答案绝对可靠。对输入量为 128K 至 256K 令牌的数据，GPT‑5 的正确率 89%。

在 API 中，所有 GPT‑5 模型最多可接受 272,000 个输入令牌，并生成最多 128,000 个推理及输出令牌，总上下文长度为 400,000 个令牌。

#### 事实性

GPT‑5 比我们之前的模型更值得信赖。在 LongFact 和 FactScore 基准测试的提示下，GPT‑5 的事实错误率比 o3 低约 80%。这使得 GPT‑5 尤其适用于正确性要求高的智能体任务场景，特别是在代码生成、数据处理和决策支持等关键领域。

![](https://p.ipic.vip/sabpii.png)

分数越高越差。[LongFact⁠](https://arxiv.org/abs/2403.18802) 和 [FActScore⁠](https://arxiv.org/abs/2305.14251) 由开放式事实求证问题组成。使用基于LLM的评分系统，通过浏览功能对这些基准测试中的提示进行事实核查，并测量事实错误陈述的比例。推理模型采用了高推理强度。搜索功能未启用。

通常，GPT‑5 经过训练后能够更好地认识到自身的局限性，并更有效地应对突发状况。我们还对 GPT‑5 进行了训练，使其在健康相关问题上更加准确。与所有语言模型一样，建议在重要场合使用 GPT‑5 时进行验证。

## 7 新功能

### 7.1 最低推理强度

开发人员可通过 API 中的 `reasoning_effort` 参数控制 GPT‑5 的推理耗时。除原`低`、`中`（默认值）和`高`三档参数外，GPT‑5 还支持`最低`模式，该模式会将 GPT‑5 的推理强度降到到最低，以快速返回答案。

- 调高，可优化输出质量
- 降低，可提升响应速度

并非所有任务都能通过额外的推理获得同等收益，建议根据实际应用场景测试调参，以确定最佳配置方案。

如相对简单的长背景信息检索任务中，提升推理能力（`低`以上级别）带来的增益有限，但视觉推理基准测试 [CharXiv Reasoning⁠（在新窗口中打开）](https://arxiv.org/abs/2406.18521) 能提升几个百分点。

![](https://p.ipic.vip/ng9n6y.png)

GPT‑5 的推理强度在不同任务上带来不同收益。对于 CharXiv 推理任务，GPT‑5 被授予访问一个 Python 工具的权限。

### 7.2 Verbosity

为调控 GPT‑5 回答的默认长度，新增 `verbosity` API 参数，该参数支持`低`、`中`（默认值）和`高`三档可选值。如果显式指令与冗余参数发生冲突，则显式指令优先。例如，如果您让 GPT‑5“写一篇五段论文章”，该模型的回复始终应包含五段内容，无论冗长程度如何（不过，各段落的长度可能有所不同）。

#### Verbosity=low

**Why is the sky blue?**

Because of Rayleigh scattering. Air molecules are much smaller than the wavelength of visible light, so they scatter short wavelengths (blue/violet) far more than long ones (red). The scattered blue light comes to your eyes from all directions, making the sky look blue. We don’t see violet as much because the Sun emits less of it, our eyes are less sensitive to it, and some is absorbed in the upper atmosphere. At sunrise and sunset, the longer path through air removes more blue, leaving the sky reddish.

#### Verbosity=medium

**Why is the sky blue?**

Because of Rayleigh scattering. Sunlight contains all colors, but air molecules scatter shorter wavelengths (blue/violet) much more strongly than longer wavelengths (red). The scattering strength goes roughly as 1/(wavelength)^4, so blue light gets redirected across the sky and into your eyes.

We don’t see a violet sky because:

- The Sun emits slightly less violet than blue.
- The upper atmosphere absorbs some violet/UV.
- Human eyes are less sensitive to violet.

At sunrise and sunset, sunlight passes through more atmosphere, scattering out most of the blues along the way and leaving the longer red/orange wavelengths to dominate.

#### Verbosity=high

**Why is the sky blue?**

The sky looks blue because sunlight gets scattered by the tiny molecules in Earth’s atmosphere. This process is called Rayleigh scattering.

Key points:

- Sunlight is made of many colors (wavelengths). Shorter wavelengths, like violet and blue, are scattered much more strongly by air molecules than longer wavelengths like red. The scattering strength increases sharply as wavelength gets shorter.
- As sunlight passes through the atmosphere, the shorter-wavelength light (especially blue) is scattered in all directions, so no matter where you look away from the Sun, you see that scattered blue light — the “blue sky.”

Why not violet?

- The Sun emits less violet than blue.
- Our eyes are less sensitive to violet.
- Some violet/UV is absorbed higher up by ozone.

Together, that makes the scattered light we perceive look mainly blue.

Why are sunsets red/orange?

- Near sunrise and sunset, sunlight travels a much longer path through the atmosphere.
- Much of the blue light gets scattered out of the direct path before it reaches your eyes, leaving the remaining direct sunlight enriched in reds and oranges.

Other influences:

- Haze, pollution, smoke, or dust have larger particles that scatter light less selectively (called Mie scattering), making the sky look paler or whitish.
- The blue sky is partially polarized due to the scattering geometry, which is why polarized sunglasses can darken parts of it.
- On worlds with different atmospheres and particle sizes (like Mars), skies can look butterscotch or reddish for similar scattering reasons.

If Earth had no atmosphere, there would be nothing to scatter sunlight, and the sky would appear black even in daytime, with the Sun as a bright disk.

### 7.3 工具调用前的前置消息

如果收到指令，GPT‑5 将在工具调用前及调用期间输出用户可见的前置消息。与隐藏的推理消息不同，这些可见的消息使 GPT‑5 能够向用户传达计划和进展，帮助最终用户理解其在工具调用背后的方法和意图。

### 7.4 自定义工具

正推出一种新的工具类型，即自定义工具，它允许 GPT‑5 使用纯文本而非 JSON 调用工具。为了限制 GPT‑5 遵循自定义工具格式，开发人员可以提供正则表达式，甚至更详细的[背景信息无关文法⁠](https://platform.openai.com/docs/guides/function-calling#context-free-grammars)。

之前，为开发人员自定义工具设计的接口要求必须采用 JSON 格式调用，而 JSON 是 Web API 及开发人员群体广泛使用的通用格式。然而，要输出有效的 JSON，模型必须完美地转义所有引号、反斜杠、换行符和其他控制字符。尽管我们的模型经过充分训练能够输出 JSON 格式，但当输入内容较长时（例如数百行代码或一份 5 页报告），其出错概率会显著上升。借助自定义工具，GPT‑5 可以将工具输入以纯文本形式编写，无需对所有需要转义的字符进行转义处理。

在 SWE-bench 中，使用自定义工具而非 JSON 工具进行验证时，GPT‑5 的得分与之前大致相同。

## 8 安全性

GPT‑5 在安全性方面取得了重大突破，是一款更加稳健、可靠且实用的新型模型。与我们之前的模型相比，GPT‑5 出现幻觉的可能性显著降低，能够更诚实地向用户传达其行为和能力，并在确保安全边界的前提下，尽可能提供最有用答案。

## 9 可用性和定价

GPT‑5 现已在 API 平台以三种规格提供：`gpt-5`、`gpt-5-mini` 和 `gpt-5-nano`。它支持回复 API、聊天完成 API，并作为 Codex CLI 的默认模型。API 中的所有 GPT‑5 模型均支持 `reasoning_effort` 和 `verbosity `API 参数，以及自定义工具。此外，它们还支持并行工具调用、内置工具（Web 搜索、文件搜索、图像生成等）、核心 API 功能（流式处理、结构化输出等），以及节省成本的功能，如提示缓存和批量 API。 

查看 GPT‑5 [文档⁠](https://platform.openai.com/docs/models/gpt-5)、[定价详情⁠](https://platform.openai.com/docs/pricing)和[提示指南](https://cookbook.openai.com/examples/gpt-5/gpt-5_prompting_guide)，立即开始使用。

## 10 详细基准测试

### Intelligence

|                                     | GPT-5(high) | GPT-5 mini(high) | GPT-5 nano(high) | OpenAI o3(high) | OpenAI o4-mini(high) | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano |
| ----------------------------------- | ----------- | ---------------- | ---------------- | --------------- | -------------------- | ------- | ------------ | ------------ |
| AIME ’25(no tools)                  | 94.6%       | 91.1%            | 85.2%            | 86.4%           | 92.7%                | 46.4%   | 40.2%        | -            |
| FrontierMath(with python tool only) | 26.3%       | 22.1%            | 9.6%             | 15.8%           | 15.4%                | -       | -            | -            |
| GPQA diamond(no tools)              | 85.7%       | 82.3%            | 71.2%            | 83.3%           | 81.4%                | 66.3%   | 65.0%        | 50.3%        |
| HLE[1](no tools)                    | 24.8%       | 16.7%            | 8.7%             | 20.2%           | 14.7%                | 5.4%    | 3.7%         | -            |
| HMMT 2025(no tools)                 | 93.3%       | 87.8%            | 75.6%            | 81.7%           | 85.0%                | 28.9%   | 35.0%        | -            |

[1] There is a small discrepancy with numbers reported in our previous blog post, as those were run on a former version of HLE.

##### Multimodal

|                                               | GPT-5(high) | GPT-5 mini(high) | GPT-5 nano(high) | OpenAI o3(high) | OpenAI o4-mini(high) | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano |
| --------------------------------------------- | ----------- | ---------------- | ---------------- | --------------- | -------------------- | ------- | ------------ | ------------ |
| MMMU                                          | 84.2%       | 81.6%            | 75.6%            | 82.9%           | 81.6%                | 74.8%   | 72.7%        | 55.4%        |
| MMMU-Pro(avg across standard and vision sets) | 78.4%       | 74.1%            | 62.6%            | 76.4%           | 73.4%                | 60.3%   | 58.9%        | 33.0%        |
| CharXiv reasoning(python enabled)             | 81.1%       | 75.5%            | 62.7%            | 78.6%           | 72.0%                | 56.7%   | 56.8%        | 40.5%        |
| VideoMMMU, max frame 256                      | 84.6%       | 82.5%            | 66.8%            | 83.3%           | 79.4%                | 60.9%   | 55.1%        | 30.2%        |
| ERQA                                          | 65.7%       | 62.9%            | 50.1%            | 64.0%           | 56.5%                | 44.3%   | 42.3%        | 26.5%        |

### Coding

|                                                   | GPT-5(high) | GPT-5 mini(high) | GPT-5 nano(high) | OpenAI o3(high) | OpenAI o4-mini(high) | GPT-4.1  | GPT-4.1 mini | GPT-4.1 nano |
| ------------------------------------------------- | ----------- | ---------------- | ---------------- | --------------- | -------------------- | -------- | ------------ | ------------ |
| SWE-Lancer: IC SWE Diamond Freelance Coding Tasks | US$11万     | US$7.5万         | US$4.9万         | US$8.6万        | US$6.6万             | US$3.4万 | US$3.1万     | US$9000      |
| SWE-bench Verified[2]                             | 74.9%       | 71.0%            | 54.7%            | 69.1%           | 68.1%                | 54.6%    | 23.6%        | -            |
| Aider polyglot(diff)                              | 88.0%       | 71.6%            | 48.4%            | 79.6%           | 58.2%                | 52.9%    | 31.6%        | 6.2%         |

### Instruction Following

|                                               | GPT-5(high) | GPT-5 mini(high) | GPT-5 nano(high) | OpenAI o3(high) | OpenAI o4-mini(high) | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano |
| --------------------------------------------- | ----------- | ---------------- | ---------------- | --------------- | -------------------- | ------- | ------------ | ------------ |
| Scale multichallenge[3](o3-mini grader)       | 69.6%       | 62.3%            | 54.9%            | 60.4%           | 57.5%                | 46.2%   | 42.2%        | 31.1%        |
| Internal API instruction following eval(hard) | 64.0%       | 65.8%            | 56.1%            | 47.4%           | 44.7%                | 49.1%   | 45.1%        | 31.6%        |
| COLLIE                                        | 99.0%       | 98.5%            | 96.9%            | 98.4%           | 96.1%                | 65.8%   | 54.6%        | 42.5%        |

[3] Note: we find that the default grader in MultiChallenge (GPT-4o) frequently mis-scores model responses. We find that swapping the grader to a reasoning model, like o3-mini, improves accuracy on grading significantly on samples we’ve inspected.

### Function Calling

|                    | GPT-5(high) | GPT-5 mini(high) | GPT-5 nano(high) | OpenAI o3(high) | OpenAI o4-mini(high) | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano |
| ------------------ | ----------- | ---------------- | ---------------- | --------------- | -------------------- | ------- | ------------ | ------------ |
| Tau2-bench airline | 62.6%       | 60.0%            | 41.0%            | 64.8%           | 60.2%                | 56.0%   | 51.0%        | 14.0%        |
| Tau2-bench retail  | 81.1%       | 78.3%            | 62.3%            | 80.2%           | 70.5%                | 74.0%   | 66.0%        | 21.5%        |
| Tau2-bench telecom | 96.7%       | 74.1%            | 35.5%            | 58.2%           | 40.5%                | 34.0%   | 44.0%        | 12.1%        |

### Long Context

|                                        | GPT-5(high) | GPT-5 mini(high) | GPT-5 nano(high) | OpenAI o3(high) | OpenAI o4-mini(high) | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano |
| -------------------------------------- | ----------- | ---------------- | ---------------- | --------------- | -------------------- | ------- | ------------ | ------------ |
| OpenAI-MRCR: 2 needle 128k             | 95.2%       | 84.3%            | 43.2%            | 55.0%           | 56.4%                | 57.2%   | 47.2%        | 36.6%        |
| OpenAI-MRCR: 2 needle 256k             | 86.8%       | 58.8%            | 34.9%            | -               | -                    | 56.2%   | 45.5%        | 22.6%        |
| Graphwalks bfs <128k                   | 78.3%       | 73.4%            | 64.0%            | 77.3%           | 62.3%                | 61.7%   | 61.7%        | 25.0%        |
| Graphwalks parents <128k               | 73.3%       | 64.3%            | 43.8%            | 72.9%           | 51.1%                | 58.0%   | 60.5%        | 9.4%         |
| BrowseComp Long Context 128k           | 90.0%       | 89.4%            | 80.4%            | 88.3%           | 80.0%                | 85.9%   | 89.0%        | 89.4%        |
| BrowseComp Long Context 256k           | 88.8%       | 86.0%            | 68.4%            | -               | -                    | 75.5%   | 81.6%        | 19.1%        |
| VideoMME(long, with subtitle category) | 86.7%       | 78.5%            | 65.7%            | 84.9%           | 79.5%                | 78.7%   | 68.4%        | 55.2%        |

### Hallucinations

|                                                              | GPT-5(high) | GPT-5 mini(high) | GPT-5 nano(high) | OpenAI o3(high) | OpenAI o4-mini(high) | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano |
| ------------------------------------------------------------ | ----------- | ---------------- | ---------------- | --------------- | -------------------- | ------- | ------------ | ------------ |
| LongFact-Concepts hallucination rate(no tools)[lower is better] | 1.0%        | 0.7%             | 1.0%             | 5.2%            | 3.0%                 | 0.7%    | 1.1%         | -            |
| LongFact-Objects hallucination rate(no tools)[lower is better] | 1.2%        | 1.3%             | 2.8%             | 6.8%            | 8.9%                 | 1.1%    | 1.8%         | -            |
| FActScore hallucination rate(no tools)[lower is better]      | 2.8%        | 3.5%             | 7.3%             | 23.5%           | 38.7%                | 6.7%    | 10.9%        | -            |