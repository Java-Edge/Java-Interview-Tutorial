# 02-Grok Code Fast

2025 年 8 月 28 日

## 0 Grok Code Fast 1

 xAI非常激动地向大家推出 **grok-code-fast-1**——一款速度快、成本低的推理模型，专为智能体编码（agentic coding）而生。

![](https://x.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgrok-code-fast.18c66acf.webp&w=1200&q=75)

## 1 快速日常使用

虽然现有模型已经非常强大，但在智能体编码工作流中——需要频繁循环推理和调用工具时，往往显得迟缓。作为智能体编码工具的重度用户，工程师发现还有提升空间：需要一种更灵活、响应更快、专为日常任务优化的方案。

于是从零开始构建 `grok-code-fast-1`，采用全新模型架构。首先精心组建了包含大量编程内容的预训练语料库；随后在后期训练阶段，又挑选了真实 Pull Request 与编码任务的高质量数据集。

整个训练过程中， x与合作伙伴紧密协作，在其智能体平台上不断调优模型行为。`grok-code-fast-1` 已经熟练掌握 grep、终端、文件编辑等常用工具，使用起来就像在你最爱的 IDE 中一样得心应手。

 xAI已与部分合作伙伴达成协议，限时免费提供 `grok-code-fast-1`，包括 GitHub Copilot、Cursor、Cline、Roo Code、Kilo Code、opencode 和 Windsurf。

## 2 极速

 xAI的推理与超算团队研发了多项创新技术，显著提升服务响应速度，实现“模型在你读完思考轨迹的第一段之前，就已经调用了数十个工具”。 xAI还对 Prompt（提示）缓存进行了优化，在合作伙伴环境中常能保持 90% 以上的命中率。

## 3 全能程序员

`grok-code-fast-1` 在整个软件开发栈上表现极其全面，尤其擅长 TypeScript、Python、Java、Rust、C++ 与 Go。它能够在最少监督下完成常见编程任务——从零到一搭建项目、解答代码库问题，到精准定位并修复 bug。

### 3.1 示例1：Battle Simulator

![](https://p.ipic.vip/erx687.png)

Grok Code Fast 的速度惊人，几乎是目前最快的模型。它快到我不得不在 Cursor 中调整自己的工作方式。

我利用 Grok Code Fast 在 Cursor 上用不到一天的时间，就快速搭建了这个战斗模拟器原型。由于它响应极快且能很好地遵循指令，我发现把任务拆得更小、更聚焦会取得更好效果，这样可以迅速迭代，并精准地让模型按照我的需求工作。

在开发这款战斗模拟器时，我的流程是先让模型设计整体功能，再将这些功能细分并分阶段实现。这比一次性投放大量提示要高效得多。于是，战斗模拟器就这样顺利成形——我在 Cursor 中不断进行快速迭代，直到达到满意的效果。

### 3.2 示例2：UI设计

![](https://p.ipic.vip/c1hphg.png)

 xAI在与几位朋友共同开发 flavo.ai（一个 AI 网页构建器）时，一直使用 Grok Code Fast 来进行前端 UI 设计。

借助它，从创意到设计稿的时间可以控制在一分钟以内，这彻底改变了原型制作的方式。移动端自适应同样表现出色，生成的界面在桌面和手机上都相当美观，几乎不需要额外调整。

用 Grok 进行前端开发的有效做法：

1. **明确需求**：开始前须清晰知道自己要构建什么。模糊的请求往往得不到理想结果。确定需求后，让 Grok 为你生成可视化的设计稿。
2. **快速迭代**：每个设计稿通常在 60 秒以内即可完成。因此我会一次性创建多个版本，约 5‑10 种不同方案。
3. **挑选并落地**：从中挑出最接近需求的那一版，然后基于它进行后续开发。高速生成的特性让 xAI能够在正式投入之前轻松探索多种设计方向。

这种体验与传统的软件开发截然不同，更像是用代码快速草绘。它非常适合快速把想法落地并验证哪些方案可行。

## 4 经济实惠

 xAI把 `grok-code-fast-1` 设计为大众可及，费用如下：

- 每百万输入 Token $0.20
- 每百万输出 Token $1.50
- 每百万缓存输入 Token $0.02

该模型专为开发者日常任务打造，在性能与成本之间取得了理想平衡。它以低廉、体积小的形式提供强劲表现，是快速、经济完成常规编码工作的多面手。

### 4.1 模型性能

输出成本/每1M的Token数：

![](https://p.ipic.vip/yied37.png)

### 4.2 方法论

TPS（每秒 Token 数）指标通过各模型提供商的 API，直接测量响应生成速度，仅统计最终回复的 Token。

- Gemini 2.5 Pro、GPT‑5 与 Claude Sonnet 4：使用对应公开 API 测得
- Grok Code Fast 1 与 Grok 4：使用 xAI API 测得
- Qwen3‑Coder：在 DeepInfra 上以低精度 (fp4) 部署，响应质量有所下降

 xAI采用了综合评估方法，将公共基准与真实场景测试相结合。在完整的 SWE‑Bench‑Verified 子集上，`grok-code-fast-1` 通过内部评测框架取得 **70.8%** 的得分。

尽管 SWE‑Bench 等基准提供有价值的参考，但它们未能完全捕捉真实软件工程中的细节，尤其是智能体编码工作流下的终端用户体验。

为指导模型训练， xAI将这些基准与日常人工评估相结合——由经验丰富的开发者对模型在日常任务中的整体表现进行打分。同时构建了自动化评测，用于监控关键行为，帮助 xAI在设计上做出权衡。

在研发 `grok-code-fast-1` 时， xAI始终把可用性和用户满意度放在首位，并以真实的人类评估为指引。最终，这款模型被程序员评为“快速且可靠”，适合日常编码任务。

## 5 让每个人都能使用 Grok Code（限时免费）

限时免费开放 `grok-code-fast-1`，仅在特定合作伙伴平台提供。以下是合作伙伴对该模型的评价——它曾以代号 **sonic** 暗线发布。

 xAI很高兴在独家合作伙伴渠道上免费提供 Grok Code Fast 1。

###  ① GitHub Copilot

“在早期测试中，Grok Code Fast 已经展示出在智能体编码任务中的速度与质量。为开发者赋能是 GitHub Copilot 的核心使命，这款新工具为 xAI的用户提供了极具吸引力的选择。”

Chief Product Officer, GitHub

### ② Cline

*"**Grok Code Fast 在 Cline 中表现突出，能够在长时间的编码过程中保持进度，聪明地使用工具，并以极少的监督生成高质量代码。这让人感觉是智能化编程的一大步，不仅快，而且很有能力。**"*

Head of AI, Cline

### ③ opencode

*"**Grok Code Fast 是首个足够快速、在编码工具中使用起来还能带来乐趣的推理模型——我们的许多用户已经把它设为默认工具，甚至让每日 token 使用量翻了一番。**"*

Founder, opencode

### ④ cursor

"Grok Code 的速度真的惊人！我们在 Cursor 中发布了代号为 “sonic” 的模型，开发者对其高速表现赞不绝口。"

VP of Developer Experience, Cursor

### ⑤ kilo

"我们的社区对 Grok Code Fast 的速度赞誉有加，并且对该模型在 Kilo Code 中调用工具的能力感到非常满意。"

Developer Relations Engineer, Kilo Code

### ⑥ Roo Code

"Roo Code 社区对 Code 模式下的 Grok Code Fast 爱不释手。它能以飞快的速度制定方案，并以出乎意料的品味和直觉执行。"

Co‑founder, Roo Code

### ⑦ windsurf

"我们非常享受与 xAI 团队合作测试并迭代模型的过程，惊喜地发现它的成本比其他模型低一个数量级，同时速度极快。每当速度提升、成本下降，就会为像 Windsurf 这样的智能 IDE 开辟新可能。我们对 xAI 在编码领域的进展印象深刻，并期待未来继续紧密合作。"

Head of Product Growth, Cognition

## 6 提示词工程指南

 xAI团队编写了《[Prompt Engineering Guide](https://docs.x.ai/docs/guides/grok-code-prompt-engineering)》，帮助你从 `grok-code-fast-1` 中获取最佳效果。

模型通过 xAI API 提供，费用同上：$0.20 / 1M 输入 Token、$1.50 / 1M 输出 Token、$0.02 / 1M 缓存输入 Token。

https://console.x.ai/home：

![xAI Logo](https://x.ai/_next/static/media/xai.985f0fcf.svg)

![Prompt Engineering Guide icon](https://x.ai/_next/static/media/prompt-engineering.fc779cee.svg)

## 7 接下来几周的计划

上周， xAI悄然以代号 **sonic** 发布了 `grok-code-fast-1`。在隐蔽发布期间，团队持续监控社区反馈，并陆续上线多个模型检查点进行改进。

随着新模型系列的迭代升级， xAI将快速采纳你的建议。非常感谢开发者社区的支持，欢迎随时[分享所有反馈](https://discord.gg/x-ai)，无论正面还是负面。

 xAI计划以天为单位而非周来推送更新。已经在训练中的新变体将支持多模态输入、并行工具调用以及更长上下文长度。

阅读 `grok-code-fast-1` 的[模型卡片](https://data.x.ai/2025-08-26-grok-code-fast-1-model-card.pdf)。期待看到你们的创意作品！