# LangChain4j概述

LangChain4j 的目标是简化将大语言模型（LLM）集成到 Java 应用程序中的过程。

## 1 实现方式

### 1.1 标准化 API

LLM 提供商（如 OpenAI 或 Google Vertex AI）和向量嵌入存储（如 Pinecone 或 Milvus）使用专有 API。LangChain4j 提供了标准化 API，避免了每次都需要学习和实现特定 API 的麻烦。要试验不同的 LLM 或嵌入存储，可以轻松切换而无需重写代码。LangChain4j 目前支持 [15+ 个主流 LLM 提供商](https://docs.langchain4j.dev/integrations/language-models/)和 [15+ 个嵌入存储](https://docs.langchain4j.dev/integrations/embedding-stores/)。

### 1.2 综合工具箱

过去的一年里，社区开发了许多由 LLM 驱动的应用程序，识别了常见的抽象、模式和技术。LangChain4j 已将这些精炼成一个现成的包。我们的工具箱涵盖从低级的提示词模板、聊天记忆模块管理、输出解析到高级模式如 AI 服务和 RAG 的工具。对于每个抽象层次，我们提供了一个接口，并基于常见技术提供了多个现成的实现。不论您是在构建聊天机器人，还是在开发一个从数据导入到检索的完整 RAG 管道，LangChain4j 提供了广泛的选择。

### 1.3 大量示例

这些 [示例](https://github.com/langchain4j/langchain4j-examples) 展示了如何开始创建各种由 LLM 驱动的应用程序，提供了灵感并让您能够快速开始构建。

LangChain4j 于 2023 年初在 ChatGPT 热潮中开始开发。但发现Java 领域缺乏与 Python 和 JavaScript 类似的 LLM 库和框架，便决定解决这一问题！虽然名字包含“LangChain”，但该项目融合了 LangChain、Haystack、LlamaIndex 及更广泛社区的理念，并加入自己的创新。

我们积极关注社区的最新进展，致力于快速整合新技术和集成，确保您始终保持最新状态。该库仍在积极开发中，虽然某些功能尚在开发，但核心功能已经就绪，您可以立即开始构建基于 LLM 的应用程序！

为便于集成，LangChain4j 还包括与 [Quarkus](https://docs.langchain4j.dev/tutorials/quarkus-integration) 和 [Spring Boot](https://docs.langchain4j.dev/tutorials/spring-boot-integration) 集成。

## 2 LangChain4j 的功能

- 与 [15+ 个 LLM 提供商](https://docs.langchain4j.dev/integrations/language-models) 的集成
- 与 [15+ 个向量嵌入存储](https://docs.langchain4j.dev/integrations/embedding-stores) 的集成
- 与 [10+ 个嵌入模型](https://docs.langchain4j.dev/category/embedding-models) 的集成
- 与 [4 个云端和本地图像生成模型](https://docs.langchain4j.dev/category/image-models) 的集成
- 与 [2 个评分（重新排序）模型](https://docs.langchain4j.dev/category/scoring-reranking-models) 的集成
- 与 OpenAI 的一个审核模型的集成
- 支持文本和图像输入（多模态）
- [AI 服务](https://docs.langchain4j.dev/tutorials/ai-services)（高级 LLM API）
- 提示词模板
- 持久化和内存中的 [聊天记忆模块](https://docs.langchain4j.dev/tutorials/chat-memory) 算法实现：消息窗口和 token 窗口
- [LLM 响应流式传输](https://docs.langchain4j.dev/tutorials/response-streaming)
- 常见 Java 数据类型和自定义 POJO 的输出解析器
- [工具（功能调用）](https://docs.langchain4j.dev/tutorials/tools)
- 动态工具（执行动态生成的 LLM 代码）
- RAG（检索增强生成）：
  - 数据导入：
    - 从多个来源（文件系统、URL、GitHub、Azure Blob Storage、Amazon S3 等）导入各种类型的文档（TXT、PDF、DOC、PPT、XLS 等）
    - 使用多种分割算法将文档切分成更小的片段
    - 对文档和片段进行后处理
    - 使用嵌入模型对片段进行嵌入
    - 将嵌入存储在向量嵌入存储中
  - 检索（简单和高级）：
    - 查询转换（扩展、压缩）
    - 查询路由
    - 从向量存储和/或任何自定义来源进行检索
    - 重新排序
    - 倒数排名融合
    - RAG 流程中每个步骤的自定义

- 文本分类
- Token 切分和 Token 计数估算工具

## 3 两个抽象层次

LangChain4j 在两个抽象层次上运行：

- [低级](https://docs.langchain4j.dev/tutorials/chat-and-language-models)。这层，您拥有最大自由，可以访问所有底层组件，如 `ChatLanguageModel`、`UserMessage`、`AiMessage`、`EmbeddingStore`、`Embedding` 等。这些是 LLM 应用程序的“原语”。您可以完全控制如何组合它们，但您需要编写更多的代码。
- [高级](https://docs.langchain4j.dev/tutorials/ai-services)。这层，您通过高级 API（如 `AiServices`）与 LLM 进行交互，这些 API 屏蔽了所有复杂性和样板代码。您仍然可以灵活地调整和微调行为，但这是以声明的方式完成的。

[![img](https://docs.langchain4j.dev/assets/images/langchain4j-components-76269e10e1cf4146cdf0cfe552ab6c4d.png)](https://docs.langchain4j.dev/intro)

## 4 LangChain4j 库结构

LangChain4j 具有模块化设计，包括：

- `langchain4j-core` 模块，定义了核心抽象（如 `ChatLanguageModel` 和 `EmbeddingStore`）及其 API。
- 主 `langchain4j` 模块，包含了诸如 `ChatMemory`、`OutputParser` 等有用工具，以及如 `AiServices` 这样的高级功能。
- 各种 `langchain4j-{integration}` 模块，每个模块提供与各种 LLM 提供商和嵌入存储的集成。您可以单独使用 `langchain4j-{integration}` 模块。对于额外的功能，只需导入主 `langchain4j` 依赖项。

## 5 LangChain4j 代码库

- [主代码库](https://github.com/langchain4j/langchain4j)
- [Quarkus 扩展](https://github.com/quarkiverse/quarkus-langchain4j)
- [Spring Boot 集成](https://github.com/langchain4j/langchain4j-spring)
- [示例](https://github.com/langchain4j/langchain4j-examples)
- [社区资源](https://github.com/langchain4j/langchain4j-community-resources)
- [内嵌嵌入](https://github.com/langchain4j/langchain4j-embeddings)

## 6 使用案例

我为什么需要这些功能？一些使用场景：

想要实现一个具有自定义行为并能访问您数据的 AI 聊天机器人：

- 客户支持聊天机器人可以：
  - 礼貌地回答客户问题
  - 接收/修改/取消订单
- 教育助手可以：
  - 教授各种学科
  - 解释不清楚的部分
  - 评估用户的理解/知识

希望处理大量非结构化数据（文件、网页等），并从中提取结构化信息。如：

- 从客户评论和支持聊天记录中提取见解
- 从竞争对手的网站中提取有趣的信息
- 从求职者的简历中提取见解

希望生成信息，如：

- 针对每位客户定制的电子邮件
- 为您的应用程序/网站生成内容：
  - 博客文章
  - 故事

希望转换信息，如：

- 摘要
- 校对和重写
- 翻译
