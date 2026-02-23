# 下一代搜索：AI 与 OpenSearch 的融合 —— 基于 MCP 的智能搜索

## 0 关键要点

- 随着传统关键词搜索逐渐达到瓶颈，行业正转向语义化、多模态、对话式和智能体（Agentic）AI 搜索。这种新型搜索能理解用户意图与上下文，让用户无需掌握技术或编写应用，就能用自然语言获取洞察。
- 基于 OpenSearch、LLM（大型语言模型）和 Model Context Protocol（MCP，模型上下文协议）构建的上下文感知型对话搜索解决方案，是下一代智能搜索的关键。MCP 负责在 AI 智能体与 OpenSearch 之间建立桥梁。
- AI 智能体是一类具备角色、任务与上下文管理能力的专用 AI 应用。典型的智能体系统包含 LLM（推理核心）、记忆模块（维持上下文）、工具（扩展能力）和 RAG（检索增强生成），可在交互中动态检索相关信息。
- 所提架构由三层组成：智能体层（智能核心）、MCP 协议层（MCP 客户端与服务器通信）、数据层（索引、搜索与分析）。
- MCP 服务器支持多种部署方式，包括本地、远程、混合（本地+云）以及云原生部署。不同模式可根据企业需求平衡安全、成本与性能。

## 1 引言

想象一位销售主管用自然语言问系统：“请显示本季度收入最高的十款产品，并预测下个月的销售趋势。” 系统能在几秒内给出完整洞察，而不必等 BI 团队数天出报告。

又或者你问：“为什么我的应用延迟很高？” 系统不仅会返回日志与指标，还会自动分析错误原因、性能瓶颈及最近的部署关联。

这就是“下一代智能体搜索”的体验。借助 LLM 驱动的 AI 智能体，通过标准化协议（如 MCP）与数据系统交互，实现真正的对话式、上下文感知搜索。

本文将介绍 MCP 如何连接 AI 智能体与 OpenSearch 构建智能搜索系统；并回顾搜索技术的演进、架构组成及实际实现案例。

## 2 OpenSearch 与行业应用

[OpenSearch](https://opensearch.org/) 是一套开源搜索与分析系统，广泛用于日志分析、实时应用监控和网站搜索。截至目前，下载量近 [9 亿次](https://opensearch.org/announcements/opensearch-3-0-enhances-vector-database-performance/)，并有数千名贡献者和 [14 家核心成员](https://opensearch.org/blog/driving-community-contributions/)，包括 [AWS](https://aws.amazon.com/opensearch-service/)、SAP、Oracle 等。根据 [DB-Engines 排名](https://db-engines.com/en/ranking/search+engine)，OpenSearch 已跻身全球前五大搜索引擎。

从电商搜索到可观测性平台，OpenSearch 在多个行业支持关键字、语义和日志分析场景。下面看看搜索技术是如何一步步演进的。

## 3 搜索的演进：从关键词到智能体

搜索技术演进：

![](https://p.ipic.vip/l1vs2l.jpg)

### 3.1 关键词搜索

又称“词法搜索”，是最传统的搜索方式，即通过精确的词或短语匹配。OpenSearch 默认使用 [TF-IDF 或 Okapi BM25F](https://kmwllc.com/index.php/2020/03/20/understanding-tf-idf-and-bm-25/) 算法（即 [Lucene](https://lucene.apache.org/) 索引）。这种方法快速、确定且与语言无关，但忽略了用户意图和上下文。

例如，搜索“*男士黑色夹克*”可能会返回包含“*穿黑衬衫的男人*”或“*其他颜色夹克*”的结果。

您可以在 [Hugging Face](https://huggingface.co/opensearch-project) 上的 [OpenSearch AI 演示](https://huggingface.co/spaces/opensearch-project/OpenSearch-AI) 中尝试关键词搜索，方法是选择搜索类型为 "keyword search"。

### 3.2 语义搜索

语义搜索比关键词搜索更智能，它在执行查询时会考虑用户意图与上下文。此方式将文本转为向量嵌入（数值表示），形成 [向量数据库](https://opensearch.org/platform/vector-engine/)。OpenSearch 支持多种[预训练模型](https://docs.opensearch.org/latest/ml-commons-plugin/pretrained-models/)，可将文本、图片、音频、视频等数据转为向量。

在同样的查询下（如“男士黑色夹克”），语义搜索将仅返回真正相关的结果。

您可以在 Hugging Face 上的 OpenSearch AI 演示中尝试关键词搜索，方法是选择搜索类型为 "vector search"。

### 3.3 多模态或混合搜索

多模态搜索结合关键词与语义搜索结果，还能同时检索文字与图片等不同数据类型。用户可在同一结果中看到文本与图片匹配的内容。

例如，在演示页面，[Hugging Face](https://huggingface.co/opensearch-project) 上的 [OpenSearch AI 演示](https://huggingface.co/spaces/opensearch-project/OpenSearch-AI)，您可能会看到同时显示关键词和图像的结果。&

### 3.4 对话式搜索

[对话式搜索](https://docs.opensearch.org/latest/vector-search/ai-search/conversational-search/) 允许用户用自然语言提问（如问答形式）。LLM 支撑这种交互，但需借助记忆系统保存上下文：

- 可使用 ChatGPT、Claude 等 LLM 的会话内置记忆；
- 或使用外部数据库（如 PostgreSQL、Redis、OpenSearch）or [Agentic Frameworks](https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-frameworks/frameworks.html) (e.g., LangChain, Strands, LlamaIndex)保存长时记忆。

结合 [RAG 技术](https://opensearch.org/blog/using-opensearch-for-retrieval-augmented-generation-rag/)，LLM 能连接外部数据源（如 OpenSearch），为查询补充实时信息。

通常，用户明确说明需要搜索什么，并从 OpenSearch 检索数据。它最适合简单到中等查询和直接的信息检索。

关键区别在于记忆（内置或外部）维护对话历史以保持上下文连续性。同时，RAG 通过从外部数据源检索相关信息来增强 LLM 响应，以提供更准确和最新的答案。

### 3.5 智能体搜索（Agentic Search）

[智能体搜索](https://docs.opensearch.org/latest/vector-search/ai-search/agentic-search/index/) 是对话式搜索的进化版。智能体具备记忆、推理、任务编排能力，可自主决定在 OpenSearch 上执行的步骤，如搜索、分析、关联、执行等。

智能体可访问多个数据源，通过 [Model Context Protocol（MCP）](https://modelcontextprotocol.io/docs/getting-started/intro) 协调多种工具完成查询任务。

OpenSearch 中的 [智能体搜索](https://docs.opensearch.org/latest/vector-search/ai-search/agentic-search/index/) 将帮助您用自然语言提问，如简单英语。

智能体搜索是对话式搜索的超集。与对话式搜索不同，智能体将具有内置记忆能力，并使用 LLM 推理能力编排任务工作流，并在 OpenSearch 上做出查询执行决策。这些任务包括搜索、分析、关联和执行。智能体还将根据需要自主迭代工作流计划。

智能体搜索可以通过编排多个工具来连接多个数据源，以进行信息检索并增强响应。通过智能体搜索，用户可以保持对话完整，并通过 [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro) 在 OpenSearch 上执行 [工具](https://huggingface.co/learn/agents-course/en/unit1/tools)（又称任务），这将在本文后续部分讨论。

在深入探讨下一代智能体搜索架构和实现细节之前，让我们看看智能体如何在智能体 AI 应用架构中发挥关键作用。

## 4 什么是 AI 智能体？

AI 智能体（专用 AI 应用）是配备了角色、任务和上下文管理能力的大型语言模型。一个典型的 AI 智能体集成了用于推理的 LLM、用于维持交互相关上下文的记忆、用于扩展能力的工具，以及用于选择性知识检索的 RAG，所有这些都旨在通过仅检索相关信息并保留关键细节来高效管理 LLM 的有限上下文窗口。给定一个任务，智能体通过与可用工具的迭代推理来实现目标，同时动态管理进入上下文窗口的信息以优化响应生成。

![](https://p.ipic.vip/mmwzlm.jpg)

**Figure 2: AI 智能体的核心架构**

让我们回顾两个流行的 OpenSearch 业务用例，以了解 OpenSearch 智能体搜索将如何帮助。

| **搜索用例：销售分析师创建执行销售报告**销售分析师（AI 智能体）负责为执行领导层创建每周销售绩效报告。AI 智能体利用分析管理器（LLM 编排器），它充当大脑并指导：**分析什么**（按类别每周销售、热门产品、客户趋势和营销活动影响），**在哪里查找**（销售数据库、库存系统、营销平台、客户分析），**如何调查**（生成查询以聚合销售数据、关联活动并比较趋势）一旦执行计划准备就绪，AI 智能体通过 MCP 使用可用工具：销售数据库（Salesforce）查询收入、订单和产品绩效电子商务平台（MySQL）API 检索库存水平和客户订单详情营销平台（SAP ERP）API 审查活动绩效并关联销售高峰AI 智能体还可能使用参考文档（知识库/RAG），例如：销售报告模板和 KPI 定义数据库模式和字段定义历史销售报告和季节性模式业务规则（例如，如何定义“活跃客户”）第 2 天，如果执行官（用户）需要参考第 1 天按类别的销售摘要，AI 智能体会记住（记忆）第 1 天的发现，并继续上下文感知的对话。 | **可观测性用例：DevOps 工程师调查生产中断**DevOps 工程师（AI 智能体）负责调查和解决生产应用性能问题。AI 智能体利用事件管理器（LLM 编排器），它充当大脑并指导，**调查什么**（慢查询日志、API 延迟指标、最近部署），**在哪里查找**（应用可观测性信息，如日志、指标、跟踪），**如何调查**（生成查询以分析错误日志与延迟指标和跟踪，并将其与最近部署时间线关联）一旦执行计划准备就绪，AI 智能体通过 MCP 使用可用工具：OpenSearch 查询应用日志、指标和跟踪GitHub API 审查最近代码部署以进行关联PagerDuty API（或其他）关联相关警报AI 智能体还可能使用参考文档（知识库/RAG），例如：故障排除运行手册系统架构设计文档历史事件和解决方案第 2 天，如果 DevOps 工程师（AI 智能体）需要参考第 1 天事件应用的补丁，AI 智能体会记住（记忆）第 1 天的发现，并继续上下文感知的对话。 |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
|                                                              |                                                              |

## 5 为什么需要智能体？

### LLM：昨日的大脑问题

大型语言模型功能模型（FMs）在大量语料库上训练，但没有实时数据信息。因此，单独使用 LLM 就像使用昨日的大脑。RAG 通过连接 LLM 到外部数据源（如 OpenSearch 或 RDBMS 等）来解决这个问题。

例如，如果 DevOps 工程师询问实时应用性能指标或生产应用的洞察。LLM 单独无法提供信息。LLM 需要使用现有数据存储如 OpenSearch 来增强响应，提供实时洞察。

传统 RAG 要求用户指定确切查询，并从单一来源一步检索。AI 智能体通过自主推理问题、通过 MCP 编排多个数据源（例如 OpenSearch、GitHub、CloudWatch）、关联发现并迭代直到找到解决方案来增强 RAG。

### 会话记忆

LLM 单独不存储用户对话历史。LLM 独立处理每个提示，而不保留之前的交互。智能体可以通过各种记忆机制维护对话历史，如[短期和长期记忆](https://www.ibm.com/think/topics/ai-agent-memory#498277086)。

因此，需要设置记忆与外部数据库，并使用 RAG 技术保持对话。从 OpenSearch 3.3 开始，[智能体记忆](https://docs.opensearch.org/latest/ml-commons-plugin/agentic-memory/)作为内置功能提供。[现代 AI 智能体](https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-memory-building-context-aware-agents/)框架带有内置记忆，无需维护单独数据库。

### 知识库

LLM 没有您公司的专有数据。您可以将公司数据作为知识库提供给 LLM。LLM 使用此知识库通过 RAG 技术增强其响应。

### 工具

每个智能体将有某些工具，通过利用 LLM 的推理和规划能力来执行任务。例如，OpenSearch 提供了一[套工具](https://docs.opensearch.org/latest/ml-commons-plugin/agents-tools/tools/index/)，执行搜索、分析、关联和执行等任务。您也可以使用智能体框架实现自己的智能体工具。

## 6 开发 AI 智能体的挑战

构建 AI 智能体是一项简单任务，但将其与现有系统如数据库和 Web 服务集成很复杂。每个用例都需要实现特定 API 或另一种与相应服务的集成方式。例如，数据库使用 JDBC 连接，Web 服务使用 REST API 调用。

如前几节所述，销售助手智能体使用不同的连接器连接到不同数据源以执行全面分析。

![](https://p.ipic.vip/o4ysr4.jpg)

**Figure 3: 使用自定义连接器每个数据源的销售助手智能体**

MCP将帮助克服这种复杂性，提供单一和简化的连接方式（通用方式）。

## 7 MCP：通用连接器

MCP 提供统一的 API 来连接不同服务，使 AI 智能体集成无缝。MCP 设置有两个组件。

- **Model Context Protocol**：一个开源、标准化和安全的协议（基于 [JSON-RPC 2.0](https://www.jsonrpc.org/)），管理 MCP 客户端和 MCP 服务器之间的通信。想想它就像一个通用电源适配器或旅行电源适配器，您可以在不同国家的不同插座中使用它，适配器可以简化输入电源并提供所需的连接性和输出。更多关于 MCP 的信息可以在[这篇文章](https://modelcontextprotocol.io/docs/getting-started/intro)中找到。
- **MCP Server**：MCP Server 是一个特殊程序，作为 AI 模型和外部数据源之间的安全桥梁。它提供在相应服务上执行任务的工具。

![](https://p.ipic.vip/ybo5fd.jpg)

**Figure 4: 使用 MCP 的销售助手智能体**

## 8 OpenSearch 智能体搜索如何工作？

在本节中，我们选择了本地部署模型来进行演示，以简化设置。生产部署应使用托管混合或云原生选项，以获得更好的安全性和可扩展性。

![](https://p.ipic.vip/grglkn.jpg)

**Figure 5: OpenSearch 智能体搜索 – MCP 设置和流程**

### 架构概述

- **智能体层**
  Claude Desktop 既充当对话界面（即智能体 AI 应用），又充当 MCP 客户端，可以[下载](https://claude.ai/download)到您的本地机器。如上图所示，它通过互联网与 Claude Sonnet 4.5 LLM 通信进行推理，并指示 MCP 从 OpenSearch 检索信息。
- **协议层（MCP 客户端和服务器）**
  MCP 客户端通过 '`claude_desktop_config.json'` 配置，将保存连接到 OpenSearch 的配置，并通过 MCP 协议启动与 MCP 服务器的通信。MCP 服务器作为独立服务运行，在 MCP 协议和 OpenSearch 之间架起桥梁。它将 OpenSearch 操作作为 MCP 工具公开，将协议消息转换为 REST API 调用，并格式化结果以供 LLM 使用。
- **数据层**
  OpenSearch 存储和索引数据，通过 MCP 服务器公开操作。

### OpenSearch MCP 服务器设置

OpenSearch 从版本 3.0 或更高版本开始默认提供 MCP 服务器。您可以在本地机器上下载和安装 [OpenSearch MCP 服务器](https://github.com/opensearch-project/opensearch-mcp-server-py)，或者也可以按照本文提供的实现指南进行操作。MCP 服务器在将 MCP 工具查询转换为 OpenSearch 原生 REST HTTP API 调用、提交翻译后的查询到 OpenSearch 并处理结果、将其格式化为 LLM 兼容响应方面发挥关键作用。

服务器还将 OpenSearch 操作（如搜索、分析等）作为 MCP 工具公开。默认情况下，它将提供在 OpenSearch 上执行任务的工具。可用的[默认工具](https://github.com/opensearch-project/opensearch-mcp-server-py?tab=readme-ov-file#available-tools)包括：

- **ListIndexTool** 列出 OpenSearch 中的所有索引，包括完整信息，如 docs.count、docs.deleted 和 store.size。
- **IndexMappingTool** 检索 OpenSearch 中索引的索引映射和设置信息。
- **SearchIndexTool** 使用 OpenSearch 中的查询领域特定语言 (DSL) 编写的查询搜索索引。
- **GetShardsTool** 检索 OpenSearch 中分片的信息。
- **ClusterHealthTool** 返回集群健康的基本信息。
- **CountTool** 返回匹配查询的文档数量。
- **ExplainTool** 返回特定文档匹配（或不匹配）查询的原因信息。
- **MsearchTool** 允许在一个请求中执行多个搜索操作。

## 9 MCP 服务器部署模式

通常，MCP 服务器安装提供以下部署选项。

- **本地部署**
  MCP 服务器可以在个人工作站上与 Claude Desktop 一起运行。这种部署适合开发和测试。
- **远程部署**
  外部服务提供商（例如 Salesforce、SAP 等）通过 MCP 服务器公开其系统，通常出于安全和治理原因。
- **托管混合（本地/云）部署**
  组织在本地或云环境中部署一个集中的“[MCP Hub](https://www.truefoundry.com/blog/what-is-mcp-hub)”。组织的 MCP Hub 将提供标准化、可扩展、受控的多数据源访问。
- **云原生部署**
  主要云提供商如 [AWS](https://github.com/awslabs/mcp)、[GCP](https://docs.cloud.google.com/mcp/overview) 和 [Azure](https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/overview) 提供自己的 MCP 服务。

请注意，您也可以根据需求实现自己的 MCP 服务器工具。

## 10 实现指南

本节演示如何配置 Claude Desktop 与 OpenSearch MCP 服务器以实现智能体搜索功能。我们将逐步指导安装、配置，并使用两个示例数据集（电商订单和可观测性数据）提供查询示例。完整的源代码和逐步设置说明可在 [NextGenSearch-OpenSearch-MCP](https://github.com/daggumalli/NextGenSearch-OpenSearch-MCP) 获取。

## 11 智能体搜索 – 用户和 MCP 交互流程

以下是用户和 MCP 交互步骤的高级流程，演示当用户发出查询时，如何翻译查询，以及 MCP 如何从 OpenSearch 获取并向用户呈现数据。

![](https://p.ipic.vip/1w1v1j.jpg)

**Figure 6: 用户和 MCP 交互流程**

现在，让我们看看整体架构如何实际运行。

## 12 演示：智能体搜索实战

以下示例演示使用连接到 OpenSearch 的 Claude Desktop 进行 MCP 启用的智能体搜索。

### 演示环境

对于此演示，我们使用 OpenSearch 作为安装包提供的两个默认数据集。请参考实现指南或 [OpenSearch Dashboards 快速入门指南](https://docs.opensearch.org/latest/dashboards/quickstart/) 获取更多详细信息。

- 示例电商订单：用于客户行为分析的零售交易数据
- 示例可观测性日志、跟踪和指标：用于系统监控查询的日志、跟踪和指标

请注意，我们在本文/演示中使用简单的英文数据。但您也可以为 OpenSearch 上的向量数据实现相同功能。

### 通用查询：

让我们看看使用此设置的一些通用自然语言查询。首次使用时，您可能需要发出类似“使用 MCP 连接到我的 OpenSearch”的查询，以便初始化 MCP 连接。

#### MCP 工具查询：“*List Tools*”。

'List tools' 查询将为您提供 MCP 配置下可用于 OpenSearch 的工具列表。

#### 索引查询：“*List index or list indices of sales data and observability data*”

这是一个 NLP 查询，其中 LLM 理解我们的查询上下文，并遍历所有可用工具，选择 ListIndexTool 作为列出 OpenSearch 中所有可用索引的适当工具。

#### 集群管理查询：“*Is the cluster healthy?*”

这是一个平台运营查询，用于检查 OpenSearch 集群健康。对于此查询，LLM 使用 ClusterHealthTool 向用户提供响应。

![](https://p.ipic.vip/noj1nz.jpg)

**Figure 7: MCP 通用查询**

现在，深入探讨销售数据上的分析洞察。

### 销售分析师演示：商业洞察的对话式智能体搜索

#### 销售分析师：热门产品类别查询：

“*Can you find the most popular category of products ordered last quarter?*”

此查询聚合并提供上季度产品订单的最热门类别结果。

#### 销售分析师 – AI 洞察查询：

“*Based on sales data, what is the interesting part to you?*”

在此查询中，我们利用纯 AI 分析洞察销售数据。

![](https://p.ipic.vip/n4aq9y.jpg)

**Figure 8: 销售分析师 - 商业洞察查询**

#### 销售分析师 – 执行董事会 BI 查询

“*Can you create a graph based on sales data for the executive board?*”

这是一个非常有用的场景，执行官无需依赖或等待他们的 BI 团队提供销售绩效报告；相反，他们可以通过用简单英语查询来按需生成。

![](https://p.ipic.vip/yrmhfv.jpg)

**Figure 9: 销售分析师 - 执行董事会 BI 查询**

**注意**：Claude Desktop 可以创建 React.js 代码，可以转换为仪表板。

Claude Desktop 还可以发布公共仪表板。例如，这是上述仪表板的快速参考 [above dashboard](https://claude.ai/public/artifacts/74b56fce-e102-4949-b843-55fd0ad6ec16)。

现在，让我们看看 DevOps 角色以及他们如何利用整个 MCP 设置与 OpenSearch。

### DevOps 演示：可观测性数据的对话式洞察

DevOps 工程师花费大量时间通过在不同仪表板和工具之间切换以及使用自定义脚本来排查生产问题，[增加平均检测时间 (MTTD) 和平均恢复时间 (MTTR)](https://www.suse.com/c/mttr-vs-mttd-what-is-the-difference/)。

此调查过程可能根据问题的复杂性持续数小时到数天。使用 OpenSearch 智能体搜索与 MCP，这些工作流程是对话式的。无需编写完整的领域特定语言 ([DSL](https://docs.opensearch.org/latest/query-dsl/)) 查询或在不同数据集和系统之间导航，工程师可以用简单英语提出运营问题。

#### DevOps 工程师 – 应用性能调查查询

“*What's causing high latencies in my application?*”

此查询将扫描不同 OpenSearch 索引中可用的所有可观测性数据，自动识别相关字段，并生成延迟问题的总结解释。

#### DevOps 工程师 – 监控和可观测性查询

“*Show me nodes with high CPU usage and their active tasks*”

与延迟查询相同，此查询选择正确的可观测性字段，并返回高 CPU 节点的干净摘要”

![](https://p.ipic.vip/zz3v6z.jpg)

**Figure 10: DevOps 工程师 - 应用性能和可观测性查询**

#### DevOps 工程师 - 可观测性 - 关联分析查询

“*Give me CPU-to-Latency Correlation insights dashboard*”

如下面演示截图所示，无需在两个屏幕或仪表板之间切换或手动关联。CPU 和延迟指标都被关联，智能搜索提供关联分析洞察的全面视图。

![](https://p.ipic.vip/ze6clh.jpg)

**Figure 11: DevOps 工程师 - CPU 到延迟关联查询和仪表板**

有关上述关联的快速参考，请参见 [analysis published dashboard](https://claude.ai/public/artifacts/2b2ed2e5-d738-4f51-80cb-2f70a84e3ab9)。

#### DevOps 工程师 – 可观测性 – 异常检测查询

“*Can you detect any anomalies in this observability data and create a dashboard?*”

传统可观测性平台需要在您的数据上设置和训练异常检测模型，而 LLM 可以自动理解您的可观测性信号，并使用简单英语查询识别异常。

![](https://p.ipic.vip/g5yewo.jpg)

**Figure 12: DevOps 工程师 - 异常检测查询和仪表板**

有关上述的快速参考，请参见 [anomaly detection published dashboard](https://claude.ai/public/artifacts/1c552830-be87-4b6a-b738-5aa0aeb66ca2)。

## 13 结论

从关键词搜索到智能体搜索的演进代表了组织与数据交互方式的根本转变。虽然语义搜索理解用户查询的意图和上下文，但通过 MCP 和大型语言模型与 OpenSearch 的结合，我们正步入一个新的时代，在这个时代，搜索感觉更像是一场对话而不是查询。

MCP 标准化协议消除了集成复杂性，使 AI 智能体能够连接到不同数据源、思考上下文，甚至基于推理对发现的内容采取行动。随着 AI 的持续演进，像 MCP 这样的标准化协议与强大搜索引擎如 OpenSearch 的结合，将使智能、上下文感知的数据访问对每个组织都变得可及。