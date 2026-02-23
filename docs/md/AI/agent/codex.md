# 从写代码到指挥智能体团队：Codex macOS 应用正式发布！

## 0 前言

![](https://p.ipic.vip/pf0gc2.png)

通过全新的 macOS 版 Codex 应用，大幅提升开发者能力。

今天，推出适用于 macOS 的 Codex 应用。这是一个强大的新界面，旨在轻松管理多个智能体、并行运行工作，并与智能体协作完成长时间任务。

限时为 ChatGPT 免费版和 ChatGPT Go 用户提供 Codex，并将 ChatGPT Plus、Pro、Business、Enterprise 和 Edu 速率额度翻倍。更高的额度适用于你在任何地方使用 Codex，包括应用内、CLI、你的 IDE 中，以及云端。

Codex 应用正在改变软件的开发方式以及谁可以开发：从与单个智能体配对进行有针对性的编辑，到在设计、开发、发布和维护软件的完整生命周期中监督并协调智能体团队。

## 1 Codex 应用：智能体的指挥中心

自 2025 年 4 月推出 Codex 以来，开发者与智能体协作的方式发生了根本性变化。模型现在能够端到端处理复杂且长时间运行的任务，开发者也在多个项目中协调多个智能体：委派工作、并行运行任务，并让智能体承担可能持续数小时、数天或数周的大型项目。核心挑战已从智能体能做什么，转变为人们如何以更大规模指挥、监督它们并与其协作。现有的 IDE 和基于终端的工具并非为支持这种工作方式而设计。

这种全新的构建方式与新的模型功能相结合，要求一种不同类型的工具，这就是推出 Codex 桌面应用的原因 — 它是智能体的指挥中心。

### 1.1 与多个智能体并行协作

Codex 应用为智能体进行多任务处理提供了一个专注的空间。智能体在按项目组织的独立线程中运行，因此你可以在任务之间无缝切换，而不会丢失上下文。该应用允许你查看线程中智能体的更改、对差异发表评论，甚至可以在编辑器中打开以进行手动更改。

它还包括对工作树的内置支持，因此多个智能体可以在同一个代码库上工作而不会发生冲突。每个智能体都在代码的一个独立副本上工作，使你能够探索不同的路径，而不必跟踪它们对代码库的影响。当智能体工作时，你可以在本地查看更改，或者让它在不影响本地 Git 状态的情况下继续进行。

该应用程序会从 Codex CLI 和 IDE 扩展中提取你的会话历史和配置，因此你可以立即开始将其用于现有项目。

### 1.2 以skill突破代码生成的界限

Codex 正在从一个编写代码的智能体，进化为能在你的电脑上利用代码完成任务的智能体。借助[skill⁠](https://agentskills.io/home)，可轻松将 Codex 的能力从代码生成扩展到信息收集与整合、问题解决、写作等更多类型的任务。

skill包将说明、资源和脚本整合在一起，使 Codex 可靠连接到工具、运行工作流，并根据你团队的偏好完成任务。Codex 应用包含一个专用界面，用于创建和管理skill。可明确要求 Codex 使用特定skill，或让它根据当前任务自动使用这些skill。

...案例见官网。

OpenAI 内部开发了数百项skills，帮助多个团队自信地将工作委托给 Codex，这些工作通常难以一致定义 — 从运行评估、监控训练任务，到起草文档和报告增长实验。

Codex 应用包括一个skill库，涵盖在 OpenAI 广受欢迎的工具和工作流程，下面重点介绍其中的几个。你可以在[开源仓库⁠](https://github.com/openai/skills)中找到完整列表。

- **实现设计：**从 [Figma⁠](https://github.com/openai/skills/blob/main/skills/.curated/figma-implement-design/SKILL.md) 获取设计上下文、资源和截图，并将其转换为生产就绪的 UI 代码，确保 1:1 的视觉一致性。
- **管理项目：**在 [Linear⁠](https://github.com/openai/skills/blob/main/skills/.curated/linear/SKILL.md) 中分流处理缺陷、跟踪版本发布、管理团队工作负载等，确保项目顺利进行。
- **部署到云端**：让 Codex 将你的 Web 应用创作部署到热门云托管平台，如 [Cloudflare⁠](https://github.com/openai/skills/blob/main/skills/.curated/cloudflare-deploy/SKILL.md)、[Netlify⁠](https://github.com/openai/skills/blob/main/skills/.curated/netlify-deploy/SKILL.md)、[Render⁠](https://github.com/openai/skills/blob/main/skills/.curated/render-deploy/SKILL.md) 和 [Vercel⁠](https://github.com/openai/skills/blob/main/skills/.curated/vercel-deploy/SKILL.md)。
- **生成图像：**使用由 GPT 图像提供支持的[图像生成功能⁠](https://github.com/openai/skills/blob/main/skills/.curated/imagegen/SKILL.md)来创建和编辑图像，以用于网站、UI 模型、产品视觉效果和游戏素材。
- **使用 OpenAI API 构建：**在使用 OpenAI API 开发时，[请参考最新文档⁠](https://github.com/openai/skills/blob/main/skills/.curated/openai-docs/SKILL.md)。
- **创建文档：**一套skill，用于读取、创建和编辑 [PDF⁠](https://github.com/openai/skills/blob/main/skills/.curated/pdf/SKILL.md)、[电子表格⁠](https://github.com/openai/skills/blob/main/skills/.curated/spreadsheet/SKILL.md)和 [docx⁠](https://github.com/openai/skills/blob/main/skills/.curated/doc/SKILL.md) 文件，具备专业的格式和布局。

当你在应用中创建一个新skill时，Codex 可以在你工作的任何地方使用，包括应用内、CLI，或你的 IDE 扩展中。你也可以将skill提交到代码仓库，让整个团队都能使用。点击[此处⁠](https://developers.openai.com/codex/enterprise/admin-setup#team-config)，了解更多关于使用团队配置共享skill的信息。

### 1.3 通过自动化功能来处理重复性工作

使用 Codex 应用，还可设置自动化功能 (Automation)，让 Codex 能够按照自动化功能的时间表在后台运行。自动化功能将指令与可选skill结合，并按你设定的时间表运行。当一个自动化功能完成后，结果会进入审核队列，这样你可以在需要时返回并继续工作。

OpenAI一直在使用自动化功能来处理那些重复但重要的任务，例如每日问题分流、查找并总结 CI 失败、生成每日发布简报、检查漏洞等。


设置一个自动化流程以定期创建新skill

### 1.4 适合你工作方式的个性选项

开发者在与智能体协作的方式上有不同的偏好。有些人想要一个直截了当、以执行为导向的合作伙伴；另一些人则喜欢更具沟通性、更有参与感的互动。Codex 现在让开发者可以在两种个性之间进行选择 — 简洁、务实的风格，以及更具对话感、更富同理心的风格。它们能力一样，旨在契合你最喜欢的方式。你只需在应用、CLI 和 IDE 扩展中使用 /personality 命令。

详细了解如何在[文档⁠](http://developers.openai.com/codex/app)中设置和使用 Codex 应用。

## 2 默认安全，设计可配置

正在整个 Codex 智能体中整合安全设计。Codex 应用与 Codex CLI 一样，使用原生、[开源⁠](https://github.com/openai/codex)且可配置的系统级沙盒。默认情况下，Codex 智能体仅限于在其工作文件夹或分支中编辑文件，并使用缓存的网页搜索，然后在需要提升权限（如网络访问）时请求许可以运行命令。你可为项目或团队[配置规则⁠](https://developers.openai.com/codex/rules)，允许特定命令在需要时自动以更高权限运行。

## 3 可用性与定价

Codex 应用从今天起可在 macOS 上使用。任何拥有 ChatGPT Plus、Pro、Business、Enterprise 或 Edu 订阅的用户，都可以使用其 ChatGPT 登录在 CLI、网页、IDE 扩展和应用中使用 Codex。ChatGPT 订阅中已包含试用额度，如有需要，可以选择购买额外的额度。

在有限时间内，Codex 也将向 ChatGPT 免费版和 ChatGPT Go 用户开放，让人们可使用智能体进行更多构建。所有付费套餐的现有 Codex 用户将速率额度翻倍。

## 4 下一步发展

企业和开发者越来越依赖 Codex 进行端到端开发。自 12 月中旬推出 GPT‑5.2-Codex 以来，Codex 整体使用量翻了一番。在过去一个月中，超过一百万名开发者在用 Codex。将继续扩展开发者使用 Codex 的平台和方式，包括在 Windows 提供该应用，提升模型的前沿能力，并打造速度更快的推理功能。

针对该应用程序，将根据实际反馈不断改进多智能体工作流，使并行工作管理更为简便，并能在不同智能体之间切换而不丢失上下文。也在开发支持云端触发器的自动化功能，这样 Codex 就能在后台持续运行，而不仅仅是在你的电脑开着时。

Codex 基于一个简单前提：所有事物都由代码控制。智能体在推理和生成代码方面越出色，它在所有形式的技术和知识型工作中就越有能力。然而，当今的一个关键挑战是前沿模型的能力与人们在实践中使用它们的便捷性之间的差距。Codex 旨在弥合这一差距，使我们更容易引导、监督模型，并将模型的全部智能应用于实际工作。专注将 Codex 打造成最优秀编码智能体，这也为其成为一款强大的智能体奠定了基础，使其能够胜任广泛的知识型工作任务，这些任务不仅限于编写代码。