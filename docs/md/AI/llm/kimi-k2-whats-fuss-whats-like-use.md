# Kimi K2：为什么它这么火？实际使用体验如何？

## 0 前言

**Kimi K2** 的大型语言模型近期在科技圈引起了不小的轰动。我天朝AI公司 [Moonshot AI](https://www.moonshot.ai/) 开发，这家公司背后有阿里巴巴支持。Kimi K2 发布被不少人视作另一个 [DeepSeek](https://www.thoughtworks.com/insights/blog/generative-ai/deepseek-five-things-business-technology-leaders-know) 时刻。和 DeepSeek 一样，Kimi K2 也是开源权重的模型，也就是说，它的训练参数可以免费下载和自定义使用。而且同样地，它在多个测试中展现出超越主流模型的性能。

## 1 K2咋工作的？

Kimi 采用MoE模型架构，即内部包含多个子网络，每个子网络擅长解决特定类型的问题。该设计优势在于可提升运行效率，速度更快，计算成本更低。

### 使用成本

尽管有 **320 亿个活跃参数**（总参数量达到 1 万亿），但使用成本不高。

举个例子：

- Claude Opus 4 模型每百万个输入 token 收费 $15，每百万个输出 token 收费 $75
- Kimi 价格仅 $0.15（输入）和 $2.50（输出）

价格差距非常明显！

### Agentic LLM

Kimi 还被称为一种 [具备代理能力的 LLM（Agentic LLM）](https://moonshotai.github.io/Kimi-K2/)。Moonshot AI 在产品介绍中表示，Kimi 是“专门为代理类任务精心优化”的。

与常见的大模型采取复杂推理步骤的方式不同，Kimi更强调从外部经验中“学习”，该思路也正是研究人员 David Silver 和 Richard Sutton 在其论文 [《经验时代》（The Era of Experience）](https://storage.googleapis.com/deepmind-media/Era-of-Experience /The Era of Experience Paper.pdf) 中提出的理念，而 Moonshot AI 团队也引用该论文。

## 3 它真的算另一DeepSeek？

Kimi K2 的发布被一些人称为“又一个 DeepSeek 时刻”，确实，这又是一个由我天朝公司推出的开源模型，表现优于不少国际大厂模型。但与年初 DeepSeek 引发的广泛讨论相比，Kimi K2 似乎没有带来同样程度的文化和经济影响。

但也正因为如此，可能更说明问题——现在天朝推出高性能开源大模型已不再令人惊讶，这本身就是 AI 领域格局正在变化的信号。

但这并不意味着 OpenAI 或 Anthropic 等巨头会马上被取代，但像 DeepSeek 和 Kimi 这样的技术突破，展示 AI 领域多样性，进一步激发创新与实验。

## 4 K2 在编程方面表现咋？

在编程任务方面，Kimi K2 表现相当亮眼。据 Moonshot 介绍，这款模型在多个评测基准上超越了其他主流模型（[参考资料](https://moonshotai.github.io/Kimi-K2/)）。虽然最终效果还需在实际应用中验证，但许多开发者在尝试之后都给予了积极反馈。

K2 还能与 [Claude Code](https://www.thoughtworks.com/insights/blog/generative-ai/claude-code-codeconcise-experiment)（Anthropic 推出的编程工具）集成，未来我们可能会听到更多关于它在代码方面的应用案例。

## 5 一线开发者体验

采访某知名国际技术咨询公司的软件工程师 **Zhenjia Zhou**。他从模型发布起就开始在自己的项目中进行测试。

Q：你为啥开始使用 Kimi K2？啥吸引你？

A：我在模型发布当天就用了！主要是 Claude Sonnet 4 对于个人项目来说太贵了，所以我试着将 Kimi K2 与 Claude Code 搭配使用，主要是用来写后端的 Python 代码。

Q：它和其他模型相比，有什么明显的不同吗？

A：我用 [Cursor](https://www.thoughtworks.com/radar/tools/cursor) 时通常搭配 openAI o1。相比之下，Kimi 在调用工具方面更“聪明”。如我喜欢用 Sequential Thinking 的 [MCP server](https://www.thoughtworks.com/insights/blog/generative-ai/model-context-protocol-beneath-hype)，o1 通常不会主动调用它，除非我特别提示“请用顺序思考解决这个问题”。Claude Sonnet 3.7 也有类似问题。

Q：你最喜欢 Kimi 的什么地方？

A：它便宜而且开源！Claude Sonnet 4 非常贵，比如一个任务可能就要花 $10–20 美元。而用 Kimi K2，我大概能用 50 元人民币（约 7 美元）完成十个类似任务。而且因为它开源，我甚至可以自己部署模型，进一步降低成本。

这让我效率大大提升。我可以并行处理任务——只要这十个任务之间没有冲突，我就能开十个 Claude Code 实例，各自用 Kimi K2 来工作。

Claude Code 刚出来时我就想这样用，但用 Claude Sonnet 4 的话开销太大了。

Q：有没有你不太满意的地方？

A：我觉得 Kimi K2 响应速度比较慢，目前比 Sonnet 4 慢一些。而且它的上下文窗口相对也较小。

Q：什么时候你会优先选择它，而不是其他成熟模型？

A：就目前使用来看，我觉得 Claude Code 并不是最适合 Kimi K2 的平台——虽然用 Kimi 比较便宜，但 Claude Code 本身是为 Claude Sonnet 4 设计的。当我把 Kimi K2 接进去时，就好像“Claude 的身体里装了个不同的灵魂”。

不过，如果以后 Kimi K2 有比 Claude Code 更好用的界面，那我可能会更多使用它来替代 Claude。

Q：你咋看“又一个 DeepSeek 时刻”这个说法？

A：我觉得这说明开源语言模型在 AI 领域可以发挥重要作用——不仅是成本上的优势，还有性能上的竞争力。

Q：你怎么看开源模型的优势？

A：我觉得主要有两点吸引人：

- 对于非常注重隐私的公司，可以自建部署模型
- 开源意味着更多服务提供方

如现在 Claude Sonnet 4 只能通过 AWS 和 Claude 平台用，他们可以决定 API 的价格。而对于开源模型，未来会有更多平台提供服务，可能会出现价格战，API 使用成本就会下降。

## 6 总结

Kimi K2 目前还处于非常早期的阶段，我们会持续关注，未来可能也会自己做一些测试。