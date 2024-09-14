# 微调还是不微调？

调整开源大语言模型（LLM）的系列博客的第二篇文章。本文讨论：“什么时候应该进行微调，什么时候应该考虑其他技术？”

- 在[第一部分](https://ai.meta.com/blog/adapting-large-language-models-llms/)中，我们探讨了将语言模型调整到领域数据的常见方法。
- 在[第三部分](https://ai.meta.com/blog/how-to-fine-tune-llms-peft-dataset-curation/)中，探索一些挑选优质训练数据集的经验法则。

## 引言

在 LLM 出现之前，微调通常用于小规模模型（100M – 300M 参数）。当时，最先进的领域应用通过监督微调（SFT）构建，即使用标注数据对预训练模型进行进一步训练，以适应自己的领域和下游任务。然而，随着大型模型（>1B 参数）的兴起，微调的问题变得更加复杂。最重要的是，大型模型的微调需要更大的资源和商业硬件。下表 1 列出了在三种情况下，微调 Llama 2 7B 和 Llama 2 13B 模型的峰值 GPU 内存使用量。[QLoRA](https://arxiv.org/abs/2305.14314) 这样的算法使得使用有限资源对大模型进行微调变得更加可行。作为示例，表 1 显示了 Llama 2 7B 的三种微调模式（全微调、LoRA 和 QLoRA）的峰值 GPU 内存。类似的内存减少也在使用 PEFT 或量化技术对 Llama 1 进行的微调中被[报道](https://arxiv.org/pdf/2312.12148)。除了计算资源外，参数全量微调的一个常见问题是灾难性遗忘（见本系列的[第一部分](https://ai.meta.com/blog/adapting-large-language-models-llms/)）。PEFT 技术旨在通过对少量参数进行训练来解决这些问题。

![img](https://scontent-tpe1-1.xx.fbcdn.net/v/t39.2365-6/453981305_872578258115765_7861429260207522729_n.png?_nc_cat=107&ccb=1-7&_nc_sid=e280be&_nc_ohc=5zr_aTQ3BzsQ7kNvgFZIdee&_nc_ht=scontent-tpe1-1.xx&_nc_gid=AmETPvVpRowHHk80yzvbfhT&oh=00_AYDpihv42Rar-j2QCzoxiCIKV1X_V5UXq_Gz-xwBKcjSaQ&oe=66FBE44B)

*表 1：在 Llama 2 7B 上使用不同微调方法（[*来源*](https://github.com/pytorch/torchtune?tab=readme-ov-file#fine-tuning-recipes)）的内存消耗（单位：GB）。QLoRA 使用了 4-bit NormalFloat 量化。*

## 适合微调的场景类型

1. **语气、风格和格式定制：**某些用例可能需要 LLM 反映特定的个性或为特定的受众服务。通过使用自定义数据集微调 LLM，我们可以调整聊天机器人的响应，使其更贴近特定用户的需求或预期体验。我们还可能希望以特定格式输出结果，例如 JSON、YAML 或 Markdown。

2. **提升准确性和处理边缘案例：**

   微调可以纠正通过提示词工程和上下文学习难以解决的幻觉或错误。它还可以增强模型执行新技能或任务的能力，而这些技能或任务难以通过提示表达。这一过程有助于纠正模型在执行复杂提示时的失误，并提高其生成预期输出的可靠性。我们提供两个示例：

   - Phi-2 在金融数据情感分析中的准确性从 [34% 提升至 85%](https://www.theaidream.com/post/exploring-phi-2-microsoft-s-latest-small-language-model-slm)。
   - ChatGPT 在 Reddit 评论情感分析中的准确性使用 100 个示例后[提升了 25 个百分点](https://wandb.ai/mostafaibrahim17/ml-articles/reports/Fine-Tuning-ChatGPT-for-Sentiment-Analysis-With-W-B--Vmlldzo1NjMzMjQx)（从 48% 到 73%）。通常，对于初始准确率较低的情况（< 50%），微调使用几百个示例就能带来显著提升。

3. **处理代表性不足的领域：**

   尽管 LLM 经过大量通用数据训练，但它们并不总是能够掌握每个小众领域的细微差别、术语或特定性。在法律、医疗或金融等领域，微调已被证明可以提高下游任务的准确性。我们提供两个示例：

   - 如文章中所述，患者的病历包含高度敏感的数据，通常不在公共领域中出现。因此，基于 LLM 的病历总结系统需要进行微调。
   - 对于像印度语言这样的代表性不足的语言，使用 PEFT 技术的微调在所有任务中都[有所帮助](https://www.sarvam.ai/blog/announcing-openhathi-series)。

4. **成本节约：**微调可以将 Llama 2 70B/GPT-4 等大模型的技能提炼到较小的模型中，如 Llama 2 7B，从而在不影响质量的情况下降低成本和延迟。此外，微调减少了对冗长或特定提示词（提示词工程中使用）的需求，从而节省 Token 并进一步降低成本。例如，[这篇文章](https://docs.llamaindex.ai/en/stable/optimizing/fine-tuning/fine-tuning.html)展示了如何通过微调 GPT-3.5 评审模型，将其从更昂贵的 GPT-4 模型中提炼出来，最终节省了成本。

5. **新任务/能力：**

   通过微调，往往可以实现新的能力。我们提供三个示例：

   - 微调 LLM 以[更好地使用或忽略](https://arxiv.org/pdf/2310.01352.pdf)来自检索器的上下文

   - 微调 LLM 评审模型来评估其他 LLM 的[指标，如扎根性、合规性或有用性](https://docs.llamaindex.ai/en/stable/optimizing/fine-tuning/fine-tuning.html)
   - 微调 LLM 来[增加上下文窗口](https://arxiv.org/html/2309.12307v2)

## 微调与其他领域适应技术的比较

### 微调 vs. 上下文学习（少样本学习）

上下文学习（ICL）是一种强大的提升 LLM 系统性能的方式。由于其简便性，ICL 应在进行任何微调活动之前尝试。此外，ICL 实验有助于评估微调是否能提升下游任务的性能。使用 ICL 时的一些常见考虑因素包括：

- 随着需要展示的示例数量增加，推理成本和延迟也随之增加。
- 示例越多，LLM [忽略部分示例的情况也越常见](https://arxiv.org/abs/2307.03172)。这意味着你可能需要一个基于 RAG 的系统，根据输入找到最相关的示例。
- LLM 可能会直接输出作为示例提供给它的知识。这种担忧在微调时也存在。

### 微调 vs. RAG

共识是，当 LLM 的基础性能不令人满意时，你可以“从 RAG 开始，评估其性能，如果不够理想，再转向微调”，或者“RAG 可能比微调更有优势” ([来源](https://applied-llms.org/?trk=feed_main-feed-card_feed-article-content))。然而，我们认为这种范式过于简化，因为在多个场景下，RAG 不仅**不是**微调的替代方案，反而更多的是微调的补充方法。根据问题的特性，可能需要尝试一种或两种方法。采用[这篇文章](https://towardsdatascience.com/rag-vs-finetuning-which-is-the-best-tool-to-boost-your-llm-application-94654b1eaba7)的框架，以下是一些问题，帮助你确定微调或 RAG（或两者）是否适合你的问题：

- 你的应用程序是否需要外部知识？微调通常不适合用于注入新知识。
- 你的应用程序是否需要自定义语调/行为/词汇或风格？对于这些类型的需求，微调通常是正确的方法。
- 你的应用程序对幻觉有多宽容？在压制虚假信息和想象性编造至关重要的应用中，RAG 系统提供了内置的机制来最小化幻觉。
- 有多少标注的训练数据可用？
- 数据的静态性/动态性如何？如果问题需要访问动态的数据语料库，微调可能不是正确的方法，因为 LLM 的知识可能很快变得过时。
- LLM 应用程序需要多大的透明性/可解释性？RAG 天生可以提供参考文献，这对于解释 LLM 输出非常有用。
- 成本和复杂性：团队是否具备构建搜索系统的专业知识或以前的微调经验？
- 应用程序中的任务多样性如何？

在大多数情况下，微调和 RAG 的混合解决方案将带来最佳效果——问题随之变成了做两者的成本、时间和独立收益。请参考上述问题，以指导你是否需要 RAG 和/或微调，并通过内部实验来分析错误并理解可能的指标提升。最后，微调探索确实需要一个稳健的数据收集和数据改进策略，我们建议在开始微调之前进行这一步。