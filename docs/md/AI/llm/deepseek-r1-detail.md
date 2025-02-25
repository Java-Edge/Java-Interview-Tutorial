# DeepSeek-R1论文细节时间线梳理

## 0 前言

2025年1月10日，DeepSeek发布名为R1的大语言模型，该初创公司声称其在推理任务上可与OpenAI的ChatGPT o1媲美。该应用在创纪录的时间内登顶App Store排行榜，不仅吸引科技行业关注，也引发了全球范围内的广泛讨论。其中一个尤引人注目的声明是：*该模型训练成本低于600万美元*（而OpenAI在GPT-4花费高达1亿美元）。这一消息在股市和新闻媒体中引发轩然大波。

但对我们研发，更有趣的是尝试理解DeepSeek究竟做了什么，以及他们是如何做到的。我们从关键事实和初步印象开始，然后探讨从他们的论文中了解到的模型架构、训练数据、评估方法以及所使用的技术。最后，我们将看看复现他们结果的尝试以及未来的发展方向。 

## 1 DeepSeek-R1相关事实

### 1.1 谁构建了它？

DeepSeek是一家成立于2023年5月的中国AI初创公司，总部位于杭州和北京。它由位于杭州的中国对冲基金High-Flyer支持。High-Flyer和DeepSeek均由[梁文峰](https://fortune.com/2025/01/27/deepseek-founder-liang-wenfeng-hedge-fund-manager-high-flyer-quant-trading/)创立。

2025年1月10日，DeepSeek发布了他们的移动应用；2025年1月20日，公司在[Huggingface上发布了R1的权重](https://huggingface.co/deepseek-ai/DeepSeek-R1)，并在[GitHub上发布了R1的推理代码](https://github.com/deepseek-ai/DeepSeek-R1)。

### 1.2 DeepSeek到底构建了什么？

DeepSeek构建了两种类型的模型以及使用它们的应用程序。这两种模型的最新版本分别是V3和R1：

- V3，顾名思义，是通用语言模型的第三个版本
- R1是基于V3-Base的推理模型

他们还提供了模型的蒸馏版本，以便可以在笔记本电脑上运行。V3有两个版本：

- 一个基于Llama（Meta的开源权重模型）
- 另一个基于Qwen（阿里巴巴的开源权重模型）

虽然他们发布了R1模型的权重和运行模型推理的代码，但他们未发布任何训练代码或所有硬件优化相关代码。

## 2 使用DeepSeek的印象

我们身边打工人通过公司数据中心部署的DeepSeek，而其他人则使用ollama在PC运行R1的蒸馏模型。然后，我们花了一些时间像使用其他模型一样使用它——从编码到推理问题的任务。

根据近期使用体验，以下是一些初步印象和想法：

- 多语言表现在英语和中文表现出色，但法语表现不够流畅，偶尔会出现意外的中文或阿拉伯字符，并且在复杂推理时偶尔会切换回英语
- 推理风格有时过冗长——有时会绕圈子
- 我们希望了解更多关于DeepSeek如何考虑安全和隐私方面的信息——特别是从用户角度
- 模型实例有各种大小，可安装在各种消费级硬件，包括节能模型
- 托管版本似乎具有与本土政府世界观一致的护栏。模型本身可能反映了与该世界观一致的视角。
- 无法了解用于训练它的数据（尽管值得注意的是，Llama、OpenAI、Claude也是如此）。这使得一些政府和企业感到不安

## 3 咋用DeepSeek？

### 3.1 官方

- 可在[DeepSeek官网](https://www.deepseek.com/)或其同名APP试用该模型

### 3.2 本地运行工具

用**ollama run deepseek-r1:32b**在本地运行蒸馏版本的模型

### 3.3 云服务商

也迅速跟进。可在[GCP Vertex AI](https://github.com/GoogleCloudPlatform/generative-ai/blob/main/open-models/use-cases/vertex_ai_deepseek_smolagents.ipynb)、[AWS Bedrock](https://aws.amazon.com/blogs/machine-learning/deploy-deepseek-r1-distilled-llama-models-in-amazon-bedrock/)和[Azure AI Foundry](https://azure.microsoft.com/en-us/blog/deepseek-r1-is-now-available-on-azure-ai-foundry-and-github/)上部署DeepSeek模型。还可将其部署为[一个NVIDIA NIM](https://blogs.nvidia.com/blog/deepseek-r1-nim-microservice/)。

DeepSeek模型足够有趣，值得考虑将其添加到你的AI平台工具箱，与其他开源权重模型一起使用，因为应用程序构建者会希望为不同目的实验或使用不同的模型。

## 4 DeepSeek报告的性能结果可信吗？

DeepSeek的结果尚未被复现。正密切关注Huggingface在[openR1](https://github.com/huggingface/open-r1)上复现它的尝试。我们还想了解模型在训练期间是否接触过基准数据，以及论文中使用的评估方法是否合适。话虽如此，我们无任何具体理由认为这些结果不真实。

引发热议的一点是2.788M GPU小时（估计556万美元）的训练成本（参见[这篇论文](https://arxiv.org/html/2412.19437v1)中的第一个表格）。V3论文清楚说明了支持这一价格点的假设，但也提出警告，称这仅代表最后一次训练运行的成本。鉴于行业对这一系列模型的迅速报道，怀疑这个数字在许多报道中被断章取义。

## 5 DeepSeek的技术组件

R1是在V3-Base上使用监督微调（SFT）和强化学习（RL）进行训练的。它们是经高度优化的Transformer模型，基于环境限制（特别是[美国政府对NVIDIA H100芯片的出口管制](https://www.csis.org/analysis/understanding-biden-administrations-updated-export-controls)）针对特定的硬件/软件框架进行了优化。DeepSeek还以一些有趣方式结合新旧技术。

### 5.1 [V3-Base](https://arxiv.org/html/2412.19437v1)

V3-Base使用强大的混合专家（Mixture-of-Experts）方法。与Mixtral类似，但[更高效](https://arxiv.org/abs/2401.06066):

- V3-Base训练6710亿个参数
- 而Llama有个4050亿的版本

V3-Base和Llama 3.1 405B都用FP8量化。V3-Base在14.8万亿个token上进行了训练，而Llama在15万亿个token上进行了训练。它们都支持128K上下文窗口。

#### 关键区别

- V3论文提到他们只使用278.8万GPU小时：据了解，用于训练V3的278.8万GPU小时仅用于最后一次完整的训练运行
- 而[Llama 3.1 405B FP8的Hugging Face页面](https://huggingface.co/meta-llama/Llama-3.1-405B-FP8)显示他们使用3930万累计GPU小时：报告的数字是累计数字

最终，如何解析这些词语的细节将会揭晓，但目前仍不清楚是否可以进行一对一比较。例如，V3是在一些由当时未发布的R1生成的数据上进行训练的；这时，V3的训练成本是否应包括R1的训练成本呢？

R1是在V3-Base上使用SFT和强化学习（RL）构建的，以增强模型的推理能力。R1使用长链思维模式进行推理。R1随后被蒸馏成更小的密集模型。与V3-Base一样，他们发布了基于Llama、Qwen的版本。

他们还发布R1-Zero，不使用SFT，并有一些限制，如可读性和语言混合。这些限制意味R1-Zero可能对研究人员比用户更有趣。为克服这些限制，他们在RL前应用了多阶段训练和冷启动数据。

V3是通过使用R1的推理、验证和反思模式生成的数据进一步改进V3-Base而构建的，从而创建了一个更全面的模型V3。

所有这些模型都是使用NVIDIA H800 GPU训练。这些是为中国市场制造的H100 GPU版本，并如前所述，为[遵守美国的出口管制](https://www.reuters.com/technology/nvidia-tweaks-flagship-h100-chip-export-china-h800-2023-03-21/)，它们在某种程度受限。H800芯片的芯片间互连速度是H100一半（NVLink上约为400GB/s vs 900GB/s）。

### 5.2 训练成本

训练R1的成本[据报道为558万美元](https://techcrunch.com/2025/01/27/deepseek-punctures-tech-spending-plans-and-what-analysts-are-saying/)。我们知道他们是错的，但不清楚他们错得有多离谱。这计算来自V3技术报告，是训练DeepSeek V3的成本。CNN[正确地指出](https://www.cnn.com/2025/01/27/tech/deepseek-stocks-ai-china/index.html)这个成本是基础模型的成本——但他们没帮助人们理解两者之间区别。

R1是在V3-Base之上训练，因此训练R1的累计成本肯定高于训练基础模型的成本。V3技术报告表一中的数字似乎是一次完整训练运行的成本，可能是最后一次完整的训练运行。如想复制训练过程，可能需要进行不止一次完整的训练运行。

还有相互矛盾报道称，[DeepSeek可以使用50,000个A100](https://www.bbc.com/news/articles/c0qw7z2v1pgo)，这与OpenAI用于[训练GPT-4的25,000个A100](https://www.acorn.io/resources/learning-center/openai/)更接近。

若你今天在美国租用50,000个A100 GPU，可能需支付约1.35美元/GPU小时（如能找到这么多可用GPU）。大约是每周1134万美元。在DeepSeek的案例中，他们似乎使用其对冲基金支持者High-Flyer[早先获得](https://www.reuters.com/technology/artificial-intelligence/high-flyer-ai-quant-fund-behind-chinas-deepseek-2025-01-29)的GPU，这些GPU原本用于高频交易。

## 6 深入探讨DeepSeek的独特之处

DeepSeek以多种复杂方式修改了模型架构、训练技术和数据，以充分利用他们可用的有限硬件。现在让我们从底层开始逐一探讨这些内容。

### 6.1 针对可用硬件的优化

与H100相比，DeepSeek必须使用的H800有两个关键限制：

- 它们的GPU到GPU互连带宽是H100的一半
- 内存要小得多：80GB V.S 188GB

有趣的是，DeepSeek似乎将这些限制转为优势。“DeepSeek-V3的经济训练成本……是通过我们对算法、框架和硬件的优化协同设计实现，”DeepSeek团队写道。即他们做出的决策使他们能够充分利用他们的可用资源。

如他们用[FP8](https://fp8.ai/)显著减少所需内存量。V3论文指出，“低精度训练已成为高效训练的一个有前途解决方案”。但这项工作前，FP8被认为是高效但效果较差；DeepSeek展示了咋有效用它。“这项工作，我们引入一个FP8混合精度训练框架，并首次在超大规模模型上验证其有效性。通过支持FP8计算和存储，实现加速训练和减少GPU内存使用。”

他们进一步在非常底层的层次对受限硬件进行优化。V3论文还指出，“我们还开发了高效的跨节点全对全通信内核，以充分利用InfiniBand（IB）和NVLink带宽。精心优化了内存占用，使得在不使用昂贵的张量并行的情况下训练DeepSeek-V3成为可能。结合这些，实现了高训练效率。”这是一些非常深入的工作，以充分利用他们受限的硬件。

论文还讨论了“至于训练框架，我们设计了DualPipe算法以实现高效的管道并行，它具有更少的管道气泡，并通过计算-通信重叠隐藏大部分训练期间的通信。这种重叠确保了随着模型的进一步扩展，只要我们保持恒定的计算-通信比，我们仍然可以在节点之间使用细粒度的专家，同时实现接近零的全对全通信开销。”相对于“正常”的分布式训练扩展方式（通常只是“向堆中添加更多硬件”），恒定的计算-通信比和接近零的全对全通信开销引人注目。

这是一个明显的例子，说明需求是发明之母。

### 6.2 强化学习在训练后对基准性能的影响

DeepSeek在V2和V3中使用了GRPO（组相对策略优化）进行强化学习。但显然，强化学习对推理模型R1的影响很大——它对基准性能的影响是显著的。

通过使用GRPO将奖励应用于模型，DeepSeek避免了用大型“批评”模型；这再次节省内存。但GRPO采用基于规则的方法，虽然它在有客观答案的问题（如编码和数学）效果更好，但在答案主观或多变的领域可能遇难。随更多人在不同环境中使用它，跟踪这些权衡将是有趣的。

### 6.3 多头潜在注意力（MLA）

多头潜在注意力是DeepSeek在V2论文中引入的一种多头注意力的变体。根据[这篇文章](https://planetbanatt.net/articles/mla.html)，虽然以前的多头注意力技术被认为是一种权衡，即在LLM训练中为获得更好扩展性而降低模型质量，但DeepSeek表示，MLA不仅允许扩展，还提高了模型质量。期待深入研究这一点。

### 6.4 蒸馏 vs 强化学习

R1论文有关于蒸馏与强化学习的有趣讨论。DeepSeek团队写道，他们的工作使得以下结论成为可能：

- “首先，将更强大的模型蒸馏到较小的模型中会产生出色的结果，而依赖于本文中提到的大规模RL的较小模型需要巨大的计算能力，甚至可能无法达到蒸馏的性能
- 其次，虽然蒸馏策略既经济又有效，但超越智能边界可能仍需更强大的基础模型和更大规模强化学习。” 

第一个结论有趣且直观。第二个结论令人放心——至少，他们并没有完全颠覆我们对深度学习在显著计算需求方面的理解。

### 6.4 可从失败中学到啥？

DeepSeek尝试了什么但没有成功？ 

- 首先，使用过程奖励模型（PRM）来指导强化学习在大规模上是不可行的。但它仍可用于重新排名前N个响应
- 其次，蒙特卡罗树搜索（MCTS），即AlphaGo和AlphaZero使用的方法，无法扩展到一般推理任务，因为问题空间不像国际象棋甚至围棋那样“受限”。还记得[不到十年前](https://www.buzzfeed.com/tomchivers/im-sorry-dave-im-afraid-i-cant-do-that)，围棋空间被认为过于复杂以至于无法计算？现在，它被认为是“受限的”。

### 6.5 其他趣事

- 一个非常令人印象深刻的编码基准
- 训练后+扩展推理，看起来是制作非常有效模型的可行策略

## 7 还会发生什么惊喜？

### 7.1 打破基准和模型的循环

每次发布新的更好模型，我们都怀疑它在训练时是否接触过基准数据。“它是为考试而学习，还是真正掌握了学科？”

因为基准数据集的恶性循环；这是一个无休止的误导性炒作螺旋。你创建了一个好的基准数据集，下一个模型为获胜而对其进行优化，获得炒作，然后你需创建另一“公平”的基准……它增加了价值，直到下一个模型对其进行优化，依此类推。[人类的最后考试](https://www.zdnet.com/article/humanitys-last-exam-benchmark-is-stumping-top-ai-models-can-you-do-any-better/)只有在下一个模型发布之前才是它所说的那样。

即当LLM在当前基准自信生成正确答案时，若其应用场景也是复杂度相似的现实数据，那将很棒。另一方面，当LLM在较新基准（或其应用领域）失败时，通常是因它对错误答案过于自信。这是因为新的基准数据具有它在训练时不知道的复杂性。

该循环需要停止，我们需要更好、更通用的评估机制和信息丰富的指标，而不是每隔几周就依赖新基准。（[其他地方](https://www.thoughtworks.com/en-us/insights/blog/generative-ai/LLM-benchmarks,-evals,-and-tests)提到过这一点。）

### 7.2 复现DeepSeek R1的结果

我们都密切关注Huggingface的[openR1](https://github.com/huggingface/open-r1)，因为开源社区正在尝试复现这些结果。因为复现结果

#### 需要条件

1. GPU：2048个，不是很大数字，就像每次训练运行550万美元并不是超大数目。但你的公司应该不行
2. 训练代码。DeepSeek没有开源他们的代码
3. 训练数据——可能是最大缺口

DeepSeek可能不会发布他们的整个训练数据集，就像OpenAI或Anthropic也不会发布他们的数据集。据我们所知，DeepSeek还没发布用于长链思维训练的数据样本。因此，勇敢的开源社区已开始创建数据集。[OpenThoughts](https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k)就是一例。

参考：

- https://arxiv.org/abs/2501.12948