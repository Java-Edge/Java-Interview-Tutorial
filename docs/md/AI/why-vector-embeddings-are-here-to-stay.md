# 为什么向量Embedding技术注定长期存在？

## 0 前言

每隔几周，都会有一款全新的生成式人工智能（GenAI）模型问世——它更聪明、更快、更便宜，看起来似乎能超越其他所有模型。尽管名字换了一批又一批，但宣传的说辞却几乎一模一样。仅在过去几周内，我们就见证了：

- [DeepSeek推出的新AI更聪明、更快、更便宜，是OpenAI模型的有力对手](https://www.techradar.com/computing/artificial-intelligence/deepseeks-new-ai-is-smarter-faster-cheaper-and-a-real-rival-to-openais-models)
- [Anthropic的最新Claude模型或将成为下一个AI霸主](https://www.zdnet.com/article/why-anthropics-latest-claude-model-could-be-the-new-ai-to-beat-and-how-to-try-it/)
- [Google称其最新Gemini模型具备“推理”能力，是迄今最强版本](https://www.theverge.com/news/635502/google-gemini-2-5-reasoning-ai-model)

如果你密切关注相关研究、新闻稿和融资消息，就会发现更新速度之快令人眼花缭乱，甚至难以跟上节奏。

正如前Mozilla.ai高级机器学习工程师Vicky Boykis在[文章](https://vickiboykis.com/what_are_embeddings/)中所写：“大语言模型领域每天都有令人兴奋的新发展。但在这些前沿热点中，很多关键的基础概念却被忽视了。”

创新就像攀岩。有些进展像是一个落脚点——虽然有用，但一旦踩过就不会回头；而有些则像绳索——你越是深入，越能持续依赖它向上攀爬。很多时候，最经久不衰的理念，才是推动技术不断向前的核心力量。

如果忽视这些基础概念，Boykis指出，“这些模型对我们来说将永远是黑箱。我们将无法真正建立在它们的基础上，或掌握它们的核心原理。”

如果你想在生成式AI的基础上进行构建，那么“嵌入（embeddings）”无疑是最好的入门点之一。尽管这一概念已诞生数十年，但它所代表的核心思想仍有巨大潜力未被充分挖掘。它能经受住时间考验，本身就是其价值的有力证明。

对于工程技术领导者来说，让模型保持“黑箱”状态是不可接受的。想在GenAI浪潮中领先，必须深入理解embeddings技术。但优秀的技术领导者不会止步于此。他们会主动寻找利用RAG（检索增强生成）等技术来扩展embeddings能力的机会，也会关注如何借助向量检索等工具更好地支持embeddings的应用。

## 1 embeddings技术简史

embeddings技术可以把文本、图像、音频等数据转化为向量，供机器学习（ML）模型解析和处理复杂信息。可以把embeddings理解为ML模型共用的一种“通用语言”。每种数据格式好比不同的“方言”，而embeddings就是让它们都能“对话”的桥梁。

这种“通用语言”的思想——即通过数据之间的关联来表示信息——最早可追溯到1950s。英国语言学家John Rupert Firth在[1962年的一篇论文](https://cs.brown.edu/courses/csci2952d/readings/lecture1-firth.pdf)中写道：“You shall know a word by the company it keeps!”（通过一个词所处的语境来理解它的含义）。语言学家意识到，单词本身的意义之外，其上下文同样关键。

![](https://cdn.sanity.io/images/sy1jschh/production/6950254a022e49bae7b82ded030ab1d42cfd7c98-1197x1118.jpg?w=3840&q=80&fit=clip&auto=format)

这个想法花了几十年才发展出数学意义。embeddings背后的理论基础是“分布式语义学”，其现代数学模型可追溯至1990年代的相关研究。不过当时的embeddings方法受限较大，表示方式过于稀疏。

2013年，Google研究人员推出Word2Vec，可从大规模数据集中学习词语稠密向量表示的工具包。这一技术是embeddings技术的重大突破，也极大推动NLP发展，因为它证明embeddings可以学习和表达词语之间的关系。

下面的图像用颜色编码展示了不同词语之间的相似关系。如“man”和“woman”的相似度高于它们与“king”或“queen”之间的相似度。

![](https://cdn.sanity.io/images/sy1jschh/production/afd79d70534fd1b4c2df496eb222d5abd1430cd4-1398x751.jpg?w=3840&q=80&fit=clip&auto=format)

2017年，《Attention Is All You Need》这篇论文提出了变换器（Transformer）架构，展示了模型如何关注句子中的每一个词。

随后在2018年，Google发布了开源框架BERT（Bidirectional Encoder Representations from Transformers），展示了这种新方法的强大：它能生成上下文相关的词向量。与Word2Vec不同，BERT可以根据句子上下文对同一个词赋予不同的向量表示。

Transformer架构的引入堪称一次技术分水岭。即便到了今天，GPT等大模型的很多核心能力仍建立在这一基础之上。

Boykis写道，理解embeddings并不容易：“它们既不是数据的输入，也不是模型的输出结果，而是嵌在机器学习流程中的中间部分，用来优化模型表现。”

要理解embeddings的本质，不妨回归“意义是如何被表达”的核心：当我们说出“家”这个词时，是用一个声音承载了很多潜在含义。这个声音能在人与人之间传递。同样，embeddings也是对各种数据形式的一种压缩表达，不过它服务的不是人与人之间的沟通，而是为机器模型的训练和运行提供支持。

## 2 embeddings在AI中的角色

有些概念属于基础，有些则处在技术前沿，而embeddings技术兼具两者。它早在GenAI出现之前就已经存在，而当下AI的很多突破也正是通过对embeddings的创新应用实现的。

### 2.1 理解语义的“细腻程度”

embeddings技术让算法能够感知概念之间的语义相似性，而无需明确编写规则。例如，“happy”和“joyful”之间比“happy”和“cat”更相近。embeddings能帮助模型识别这些关系。

因此，在文本分类、机器翻译等NLP任务中，embeddings成为核心组件。没有embeddings的话，模型会把“cat”和“kitten”看成两个毫无关联的词，仅因为拼写不同。

### 2.2 可迁移性

embeddings可以先在某一任务或领域中训练，然后迁移到其他任务或领域。所学到的语义结构具备通用性，这正是GenAI持续进化的基础。

如果没有这种可迁移性，GenAI应用只能是各自孤立的工具；而借助embeddings，它们才能持续成长，变得更加智能和全面。

### 2.3 计算效率

高维数据往往杂乱无章、难以处理。embeddings通过降低维度，同时保留数据之间的关联，大大加快了模型训练速度，并降低了计算成本。

### 2.4 NLP与LLM

几乎所有现代自然语言处理模型，包括GPT在内的大语言模型，都依赖embeddings技术。这些模型将文本（包括词语、句子、段落等）转换为向量，从而在语义空间中理解内容。这不仅是实现诸如语义搜索、问答系统和迁移学习等功能的关键，更是模型推理的起点。

### 2.5 推荐系统

大多数推荐和个性化系统也依赖embeddings技术。系统通常将用户和物品表示为相同向量空间中的向量。例如，Netflix就构建了一个[用于个性化推荐的基础模型](https://netflixtechblog.com/foundation-model-for-personalized-recommendation-1a0bd8e02d39)，其中广泛应用了embeddings。

用embeddings向量表示与影视内容相关的各种元数据：

![](https://cdn.sanity.io/images/sy1jschh/production/20fdb8ee516f81813c7d591cdda760d93410fc9e-1339x745.jpg?w=3840&q=80&fit=clip&auto=format)

Google Play、Overstock、Airbnb等众多公司也都在推荐系统中使用embeddings，以达到类似目的。

## 3 embeddings技术的光明前景

embeddings不仅已经成为AI的核心组成部分，它的发展也带动了诸多新场景的创新。随着GenAI的演进，embeddings会无处不在；而随着应用范围扩大，支持embeddings的技术——如向量存储与搜索——也将越来越重要。

### 3.1 多模态embeddings将不断解锁新知识

多模态embeddings能让模型将图像、音频等不同类型数据统一编码到一个向量空间，从而实现跨模态推理。模型可以同时理解“cat”这个词、一张猫的图片和猫叫声之间的关系，从而实现更强的搜索和理解能力。

例如，通过Google的[Multimodal Embeddings API](https://cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-multimodal-embeddings)，你既可以用“cat”这个词，也可以用一张猫的图片来搜索相关内容。

![](https://cdn.sanity.io/images/sy1jschh/production/3088af95b623055c0fc7358ccad12db1b79795d7-1196x790.jpg?w=3840&q=80&fit=clip&auto=format)

虽然多模态embeddings并不新鲜，但其发展前景极其广阔。

每增加一项信息，LLM不仅多学一个知识点，而是为其整体知识网络新增一个节点，从而激发更多联想与推理能力。例如，训练模型看一本新书固然不错，但如果能解析整部视频资料，其价值更是指数级提升。

### 3.2 RAG技术持续发展，embeddings需求激增

RAG（检索增强生成）是一种提升GenAI准确性的方法，它通过向量检索技术从可信数据源中提取信息，在模型生成回答前将其作为上下文输入。

embeddings不仅是RAG的关键支持技术，还可以帮助高效检索相关文档、聚类文本、识别趋势和重复内容，使RAG更加实用。

2025年3月，Google就强调了[文本embeddings技术的突破](https://developers.googleblog.com/en/gemini-embedding-text-model-now-available-gemini-api/)，并指出其在RAG等多种场景中的应用潜力。

Menlo Ventures的[研究](https://menlovc.com/2024-the-state-of-generative-ai-in-the-enterprise/)显示，2024年，embeddings技术已经成为企业中最主流的AI设计模式。

![Redis](https://cdn.sanity.io/images/sy1jschh/production/48cfdf33a7de59044a82d17f898bde48cc8f166e-2041x1005.jpg?w=3840&q=80&fit=clip&auto=format)

在注重准确性和知识一致性的企业级应用中，RAG将成为最具变革性的GenAI技术之一，而embeddings就是其中的基石。

### 3.3 向量数据库和向量搜索将持续增长

随着embeddings技术不断发展和普及，围绕它构建的支撑技术也将越来越关键。其中最值得关注的，就是向量数据库和向量搜索。

embeddings通过向量表示信息，因此对向量的高效存储与检索是GenAI应用的核心。Redis在这方面表现尤为突出——它不仅速度快，更是实时性强，能满足高吞吐、低延迟的AI应用需求。

换句话说，企业不能再用“差不多”的方式来处理向量存储；优化向量管理策略，会直接提升你在GenAI领域的整体表现。

Redis提供的向量存储与搜索能力支持多种AI与数据工具。我们的[基准测试](https://redis.io/blog/benchmarking-results-for-vector-databases/)表明，在多个性能指标上，Redis都是当前最快的解决方案。

![](https://cdn.sanity.io/images/sy1jschh/production/535a483ffd59b24e5fd1e00a83e1a681719ad6f8-800x486.jpg?w=3840&q=80&fit=clip&auto=format)

LangChain联合创始人兼CEO Harrison Chase 表示：“我们在OpenGPTs中所有持久化存储都用的是Redis Cloud，包括检索使用的向量存储、消息存储、代理配置等。能在一个数据库中完成所有这一切，Redis的吸引力非常大。”

在审视GenAI这场范式转变时，不能只盯着最前沿的模型。就像潮水上涨会带动所有船只一样，GenAI的崛起也会带动embeddings、向量搜索和向量存储等基础技术同步升级。作为工程领导者，你需要确保在这些领域都做到最好。

## 4 embeddings让信息检索更高效

信息是庞大而混乱的。从印刷术到ChatGPT，每一次对信息“压缩与组织”的突破，都会带来知识的爆炸式增长。

本质上，embeddings就是让我们更容易找到有用信息。因此，embeddings注定不会消失，反而会成为生成式AI新闻浪潮中为数不多的“锚点”。Redis正通过高性能向量数据库为这一生态提供坚实支撑。

对于工程技术领导者来说，理解embeddings技术，并应用能够支持它的工具，是今天构建GenAI基础，也是面向未来布局的最佳方式。

