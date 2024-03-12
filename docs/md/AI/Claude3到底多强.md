# Claude3到底多强

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240312140945613.png)

2024年3月4日，官方宣布推出 Claude 3 模型系列，它在广泛的认知任务中树立了新的行业基准。该系列包括三个按能力递增排序的最先进模型：Claude 3 Haiku、Claude 3 Sonnet 和 Claude 3 Opus。每个后续模型都提供越来越强大的性能，允许用户为其特定应用选择智能、速度和[成本](https://www.anthropic.com/api#pricing)之间的最佳平衡。

Opus 和 Sonnet 现在已经可以在 claude.ai 和目前在 [159个国家](https://www.anthropic.com/supported-countries)普遍可用的 Claude API 中使用。Haiku 很快也会上市。

#### Claude 3 模型系列

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2F5d20371eeb8d045465bb22cacfd269b5958b004d-2200x1174.png&w=3840&q=75)

#### 智能新标准

Opus， Claude最智能的模型，在大部分常用的 AI 系统评估基准上表现优于同行，包括本科水平专家知识（MMLU）、研究生水平专家推理（GPQA）、基础数学（GSM8K）等。它在复杂任务上展示了接近人类的理解和流利程度，引领了通用智能的前沿。

所有 [Claude 3](https://www.anthropic.com/claude-3-model-card) 模型在分析和预测、细腻的内容创作、代码生成以及使用西班牙语、日语和法语等非英语语言对话方面的能力都有所提升。

下面是 Claude 3 模型与 Claude同行在多个能力基准测试比较：

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2F9ad98d612086fe52b3042f9183414669b4d2a3da-2200x1954.png&w=3840&q=75)

#### 近乎即时的结果

Claude 3 模型可以为实时客户聊天、自动补全和数据提取任务提供动力，这些响应必须是即时和实时的。

Haiku 是市场上智能范畴性价比最高的模型。它可以在不到三秒的时间内读懂一个信息和数据密集的 arXiv 上的研究论文（约10k 个 Token），包括图表和图形。上市后， Claude预计性能会进一步提高。

对于大多数工作负载，Sonnet 的速度是 Claude 2 和 Claude 2.1 的两倍，智能水平也更高。它擅长迅速响应的任务，如知识检索或销售自动化。Opus 以与 Claude 2 和 2.1 相似的速度交付，但智能水平更高。

#### 强大的视觉能力

Claude 3 模型拥有与其他领先模型相当的复杂视觉能力。它们可以处理包括照片、图表、图形和技术图纸在内的广泛视觉格式。 Claude特别高兴为 Claude的企业客户提供这种新的方式，其中一些客户的知识库有多达50%以多种格式编码，如PDF、流程图或演示幻灯片。

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2F6b66d86ff0c180e95bc6ad2e6e4a1843aa74c80f-2200x960.png&w=3840&q=75)

#### 更少的拒绝

先前的 Claude 模型经常做出不必要的拒绝，这表明缺乏上下文理解。 Claude在这一领域取得了有意义的进展：与上一代模型相比，Opus、Sonnet 和 Haiku 大大减少了拒绝回应那些触及系统保护边界的提示。如下所示，Claude 3 模型对请求有更微妙的理解，识别真正的危害，并且更少地拒绝回答无害的提示。

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2Fd1fbcf3d58ebc2dcd2e98aac995d70bf50cb2e9c-2188x918.png&w=3840&q=75)

#### 提高准确率

各种规模的企业都依赖 Claude的模型为他们的客户服务，因此对于模型输出来说，保持高准确率是至关重要的。为了评估这一点， Claude使用了一套复杂的、真实的问题，这些问题针对目前模型的已知弱点。 Claude将回应分为正确答案、错误答案（或幻觉）以及不确定性声明，即模型表示它不知道答案，而不是提供错误信息。与 Claude 2.1 相比，Opus 在这些具挑战性的开放式问题上的准确度（或正确答案）表现出了两倍的提升，同时还展现出降低了错误答案的水平。

除了产生更值得信赖的回应外， Claude很快还将在 Claude 3 模型中启用引用功能，从而使它们能够指向参考材料中的精确句子以验证它们的答案。

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2F7cb598c6a9fa58c12b77f67ee2067feaac4a2de0-2200x896.png&w=3840&q=75)

#### 长上下文和近乎完美的回忆

Claude 3 模型系列在发布之初将提供 200K 上下文窗口。然而，所有三个模型都能够接受超过 100 万个 Token 的输入， Claude可能会向需要增强处理能力的选定客户提供这一点。

为了有效处理长上下文提示，模型需要强大的回忆能力。'大海捞针' (NIAH) 评估衡量模型从大量数据中准确回忆信息的能力。 Claude通过使用每个提示中的 30 个随机针/问题对之一，并在多样化的众包文档语料上进行测试，增强了这一基准测试的稳健性。Claude 3 Opus 不仅实现了近乎完美的回忆，准确率超过了 99%，在某些情况下，它甚至识别出评估自身的局限性，识别出“针”句似乎是人为插入到原文中的。

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2Fd2aa12b60e9c57e7057924bd8878d754c7b3d8e7-2200x1088.png&w=3840&q=75)

#### 负责任的设计

 Claude开发 Claude 3 模型系列，旨在让它们像它们的能力一样值得信赖。 Claude有几个专门的团队跟踪和减轻广泛的风险，范围从错误信息和CSAM到生物滥用、选举干预和自主复制技能。 Claude继续开发诸如 [Constitutional AI](https://www.anthropic.com/news/constitutional-ai-harmlessness-from-ai-feedback) 这样的方法来提高 Claude模型的安全性和透明度，并已调整 Claude的模型以减轻可能由新模式引发的隐私问题。

在日益复杂的模型中解决偏见问题是一项持续的努力，而 Claude在这次新发布中取得了进步。如模型卡所示，Claude 3 根据 [Bias Benchmark for Question Answering (BBQ)](https://aclanthology.org/2022.findings-acl.165/) 的评估显示出比 Claude以前的模型更少的偏见。 Claude仍然致力于推进减少偏见并促进 Claude模型中更大中立性的技术，确保它们不会倾向于任何特定的党派立场。

尽管 Claude 3 模型系列在生物学知识、网络相关知识和自主性方面相比以前的模型取得了进步，但它仍然符合 Claude [Responsible Scaling Policy](https://www.anthropic.com/news/anthropics-responsible-scaling-policy) 中的 AI 安全等级 2 (ASL-2)。