# Dify 深度研究工作流：告别碎片化搜索，解锁 AI 驱动的全面洞察

## 0 业务痛点

标准搜索查询通常会因复杂问题而失效。学术论文、市场分析或代码调试，要找到完整答案通常需拼凑数十个单独搜索。这正是**深度研究的**用武之地——它能够直面这一日常挑战。Google Gemini、ChatGPT 和 DeepSeek-R1 等领先 AI 平台已提供这项强大功能。

深度研究凭借其智能反馈循环脱颖而出：它能够识别知识缺口，锁定特定问题，进行系统性探索，并提供全面的报告。不同于传统的碎片化信息搜索，深度研究提供的答案既广泛又深入。

本文展示咋用 Dify 构建深度研究工作流，主要包含三个关键组件： **循环变量、结构化输出和代理节点** 。创建一个能够独立进行研究并提供有意义见解的工作流。

### 工作流概述

Dify 中的深度研究工作流程分三阶段：

1. **意图识别** ：工作流程捕捉您的研究主题，收集初始背景，并分析目标以确定明确的方向。
2. **迭代探索** ：工作流程使用循环变量来评估知识以发现差距、运行有针对性的搜索并逐步建立发现。
3. **综合** ：所有收集到的信息都成为一份带有适当引用的结构化报告。

它反映了专家研究人员的思考：“我已经知道什么？缺少什么？下一步我应该研究什么？”

## 1 第一阶段：研究基础

### 1.1 起始节点

应首先用基本输入参数配置**开始**节点：

- **研究主题** ：需要探索的核心问题
- **最大循环** ：本次研究会话的迭代预算

![](https://p.ipic.vip/fzs1bn.png)

### 背景知识获取

建议使用 **Exa Answer** 工具收集初步信息，确保模型在深入研究之前理解术语。

![img](https://framerusercontent.com/images/EhIWg3JSDcZhRLGQe5iki7CkiNI.png)

### 意图分析

需使用 **LLM** 节点来挖掘用户的真实意图，从而区分表面问题和进一步的信息需求。

![img](https://framerusercontent.com/images/i4mbdrFrSrUFuDp60fxG1mVvjvc.png)

## 2 第二阶段：动态研究周期

### 循环节点：研究引擎

[**循环**](https://docs.dify.ai/en/guides/workflow/node/loop)节点驱动着整个研究。在 Dify 中，它跨迭代传递信息，因此每个循环都建立在先前的发现之上。

Dify的深度研究工作流程跟踪六个关键变量：

- **findings**: 每个周期发现的新知识
- **executed_querys**: 以前使用的搜索查询（防止冗余）
- **current_loop**: 迭代计数器
- **visited_urls**: 正确引用的来源跟踪
- **image_urls**: 视觉内容引用
- **knowledge_gaps**: 已确定的信息需求

![img](https://framerusercontent.com/images/PWXvggJIDcgnnDNa8tmh04iLF5I.png)

#### 循环变量 V.S 标准变量

- **正常参考**遵循线性路径：节点 1 → 节点 2 → 节点 3
- **循环引用前一次迭代**创建一个知识网络：节点可以访问当前迭代和前一次迭代的输出

这种设计可以积累知识，避免重复工作，并在每个周期中增强焦点。

![](https://framerusercontent.com/images/yxMNQCGEtMrc9PaOTFSG4fJ2WI.png)

### 推理节点：提出更好的问题

[**推理**](https://docs.dify.ai/en/guides/workflow/structured-outputs)节点采用结构化输出格式：

```
{
    "reasoning": "Detailed justification for the chosen action path...",
    "search_query": "Specific follow-up question targeting knowledge gaps",
    "knowledge_gaps": "Information still needed to answer the original question"
}
```

通过在 LLM 节点中启用 Dify 的结构化输出编辑器，您将收到一致的 JSON，以便下游节点能够可靠地处理。这可以清晰地提取推理路径、搜索目标和知识缺口。

![](https://framerusercontent.com/images/O6n1ckQR5eEdvbpFDfqi44qU3zs.png)



![](https://framerusercontent.com/images/PK0R1abx04WqaEFyeqXkb8MyY.png)



![](https://framerusercontent.com/images/r0sVMLgkcczpNoaf3DcZQpJeM78.png)

### 代理节点：进行研究

好的问题只是开始。有效的研究需要果断的行动，而这正是 [**Agent**](https://docs.dify.ai/en/guides/workflow/node/agent) node 所擅长的。

这些节点充当自主研究人员的角色，根据具体情况选择最合适的工具。工作流为代理提供了以下功能：

**发现工具**

- **exa_search**: 进行网络搜索并收集结果
- **exa_content**: 从特定来源获取完整内容

**分析工具**

- **think** ：作为系统的反思引擎，灵感源自 Claude 的 Think Tool。它使代理能够评估发现、识别模式并确定后续步骤，这与研究人员暂停工作以整合笔记并规划其方法非常相似。

可通过仅向代理提供其所需的内容来优化性能：仅提供来自上一个 LLM 节点的 search_query，而不是整个上下文。这种专注的方法可以提高工具选择的准确性。

![](https://framerusercontent.com/images/0CLuSpFDGCISe9TmopYHKQFzc.png)

### URL 提取

工作流自动识别代理响应中的 URL 和视觉参考，从而正确跟踪所有信息源。

![](https://framerusercontent.com/images/QShn1pxxcdlxwuzw5DSbl8bMmw.png)

在每次迭代中，代理通过收集信息、处理内容和整合研究结果来完成一个完整的研究周期。

### 变量赋值

每个周期结束后， **变量分配器**节点都会更新研究状态。这确保每次迭代都建立在先前工作的基础上，而不是重复工作。

![](https://framerusercontent.com/images/ALkQmoYYwpswtscez8zK52NYQ.png)

## 3 第三阶段：研究综合

一旦多个探索周期完成， **最终摘要**节点就会采用所有累积变量（发现、来源和支持数据）来生成综合报告。

设置此节点是为了维护正确的 Markdown 引用并编制完整的参考文献列表。该工作流程还在关键节点设置了**答案**节点，以便在整个研究过程中提供流式更新。这些更新将最终报告构建成全面的分析和有效的参考文献，兼具分析深度和学术可信度。

![](https://framerusercontent.com/images/3mDsHnoCl7F8QP1F4ZS7FeiYa84.png)

## 总结

本《深度研究指南》展示了 Dify 代理工作流程的卓越成就。Dify将专家研究方法数字化，并通过自动化加速其进程。

未来的研究不仅仅在于拥有更多数据，更在于以更智能的方式探索数据。立即借鉴这些模式，构建您的研究引擎。

参考：

- https://github.com/dzhng/deep-research
- https://github.com/jina-ai/node-DeepResearch
- https://github.com/langchain-ai/local-deep-researcher
- https://github.com/nickscamara/open-deep-research