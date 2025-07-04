# Qwen3 Embedding：新一代文本表征与排序模型

qwen正式发布 Qwen3 Embedding 系列模型, Qwen 模型家族的新成员。该系列模型专为文本表征、检索与排序任务设计，基于 Qwen3 基础模型进行训练，充分继承了 Qwen3 在多语言文本理解能力方面的优势。在多项基准测试中，Qwen3 Embedding 系列在文本表征和排序任务中展现了卓越的性能。 qwen使用了 Apache 2.0 协议在 Hugging Face 和 ModelScope 上开源了这一系列的文本表征及排序模型，并在 GitHub 公布了技术报告及相关代码。

![img](https://mitalinlp.oss-cn-hangzhou.aliyuncs.com/dingkun/models/qwen-embedding/q3e-mteb-result-0605.png)

**排序模型评测结果**

|               Model                | Param |  MTEB-R   |  CMTEB-R  |  MMTEB-R  |   MLDR    | MTEB-Code | FollowIR  |
| :--------------------------------: | :---: | :-------: | :-------: | :-------: | :-------: | :-------: | :-------: |
|      **Qwen3-Embedding-0.6B**      | 0.6B  |   61.82   |   71.02   |   64.64   |   50.26   |   75.41   |   5.09    |
| Jina-multilingual-reranker-v2-base | 0.3B  |   58.22   |   63.37   |   63.73   |   39.66   |   58.98   |   -0.68   |
|   gte-multilingual-reranker-base   | 0.3B  |   59.51   |   74.08   |   59.44   |   66.33   |   54.18   |   -1.64   |
|         BGE-reranker-v2-m3         | 0.6B  |   57.03   |   72.16   |   58.36   |   59.51   |   41.38   |   -0.01   |
|      **Qwen3-Reranker-0.6B**       | 0.6B  |   65.80   |   71.31   |   66.36   |   67.28   |   73.42   |   5.41    |
|       **Qwen3-Reranker-4B**        |  4B   | **69.76** |   75.94   |   72.74   |   69.97   |   81.20   | **14.84** |
|       **Qwen3-Reranker-8B**        |  8B   |   69.02   | **77.45** | **72.94** | **70.19** | **81.22** |   8.05    |

> **Note**:
>
> - q'wen使用MTEB(eng, v2), MTEB(cmn, v1), MTEB (Multilingual) 以及MTEB (Code)中的检索数据集进行测试, 分别记作MTEB-R, CMTEB-R, MMTEB-R, MTEB-Code.
> - 排序结果基于[Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B)的top-100向量召回结果进行排序.

**主要特点**:

**卓越的泛化性**: Qwen3 Embedding 系列在多个下游任务评估中达到行业领先水平。其中，8B 参数规模的Embedding模型在MTEB多语言Leaderboard榜单中位列第一（截至 2025 年 6 月 5 日，得分 **70.58**），性能超越众多商业 API 服务。此外，该系列的排序模型在各类文本检索场景中表现出色，显著提升了搜索结果的相关性。

**灵活的模型架构**: Qwen3 Embedding 系列提供从 0.6B 到 8B 参数规模的 3 种模型配置，以满足不同场景下的性能与效率需求。开发者可以灵活组合表征与排序模块，实现功能扩展。此外，模型支持以下定制化特性：1) 表征维度自定义：允许用户根据实际需求调整表征维度，有效降低应用成本；2) 指令适配优化：支持用户自定义指令模板，以提升特定任务、语言或场景下的性能表现。

**全面的多语言支持**: Qwen3 Embedding 系列支持超过 100 种语言，涵盖主流自然语言及多种编程语言。该系列模型具备强大的多语言、跨语言及代码检索能力，能够有效应对多语言场景下的数据处理需求。

## 模型总览

|     Model Type     |        Models        | Size | Layers | Sequence Length | Embedding Dimension | MRL Support | Instruction Aware |
| :----------------: | :------------------: | :--: | :----: | :-------------: | :-----------------: | :---------: | :---------------: |
| **Text Embedding** | Qwen3-Embedding-0.6B | 0.6B |   28   |       32K       |        1024         |     Yes     |        Yes        |
|                    |  Qwen3-Embedding-4B  |  4B  |   36   |       32K       |        2560         |     Yes     |        Yes        |
|                    |  Qwen3-Embedding-8B  |  8B  |   36   |       32K       |        4096         |     Yes     |        Yes        |
| **Text Reranking** | Qwen3-Reranker-0.6B  | 0.6B |   28   |       32K       |          -          |      -      |        Yes        |
|                    |  Qwen3-Reranker-4B   |  4B  |   36   |       32K       |          -          |      -      |        Yes        |
|                    |  Qwen3-Reranker-8B   |  8B  |   36   |       32K       |          -          |      -      |        Yes        |

注：`MRL Support` 表示 Embedding 模型是否支持最终向量的自定义维度。`Instruction Aware` 表示 Embedding 或 Reranking 模型是否支持根据不同任务定制输入指令。

## 模型架构

基于 Qwen3 基础模型， qwen的 Embedding 模型和 Reranking 模型分别采用了双塔结构和单塔结构的设计。通过 LoRA 微调， qwen最大限度地保留并继承了基础模型的文本理解能力。具体实现如下：1) Embedding 模型接收单段文本作为输入，取模型最后一层`[EOS]`标记对应的隐藏状态向量，作为输入文本的语义表示；2) Reranking 模型则接收文本对（例如用户查询与候选文档）作为输入，利用单塔结构计算并输出两个文本的相关性得分。

![img](https://mitalinlp.oss-cn-hangzhou.aliyuncs.com/dingkun/models/qwen-embedding/q3e-model-arc.png)

## 模型训练

Qwen3 Embedding 系列模型的训练继承了 GTE-Qwen 系列的多阶段训练范式，但针对具体应用场景进行了深度优化。在 Embedding 模型的训练过程中， qwen采用三阶段训练架构：第一阶段通过超大规模弱监督数据进行对比学习预训练；第二阶段基于高质量标注数据进行监督训练；最终通过模型融合策略融合多个候选模型，以提升整体性能。这种分阶段训练机制有效平衡了模型的泛化能力与任务适配性。

在 Reranking 模型的训练中，基于实验验证结果， qwen直接采用高质量标注数据进行监督训练，以提升训练效率。特别需要说明的是，在 Embedding 模型的第一阶段弱监督训练中， qwen构建了多任务适配的 Prompt 体系，利用 Qwen3 基础模型的文本生成能力， qwen针对不同任务类型和语言特性，动态生成了一系列弱监督文本对，突破了传统方法依赖社区论坛或开源数据筛选获取弱监督文本对的局限性，实现了大规模弱监督数据的高效生成。

![](https://mitalinlp.oss-cn-hangzhou.aliyuncs.com/dingkun/models/qwen-embedding/q3e-train-pipeline.png)

## 未来发展

Qwen3 Embedding 系列模型是一个新的起点，依托于 Qwen 基础模型的持续优化,  qwen将继续提升文本表征与排序模型的训练效率，以增强模型在实际场景中的部署性能。此外， qwen还计划拓展多模态表征体系，构建跨模态语义理解能力。 qwen期待更多开发者基于 Qwen3 Embedding 系列探索更广泛的应用场景，推动模型在不同业务场景中的深入应用。