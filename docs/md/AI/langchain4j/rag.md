# 09-RAG

LLM 的知识仅限于其训练数据。如希望使 LLM 了解特定领域的知识或专有数据，可：

- 使用本节介绍的 RAG
- 使用你的数据对 LLM 进行微调
- [结合使用 RAG 和微调](https://gorilla.cs.berkeley.edu/blogs/9_raft.html)

## 1 啥是 RAG？

RAG 是一种在将提示词发送给 LLM 之前，从你的数据中找到并注入相关信息的方式。这样，LLM 希望能获得相关的信息并利用这些信息作出回应，从而减少幻觉概率。

可通过各种[信息检索](https://en.wikipedia.org/wiki/Information_retrieval)方法找到相关信息。这些方法包括但不限于：

- 全文（关键词）搜索。该方法使用 TF-IDF 和 BM25 等技术，通过匹配查询（例如用户提问）中的关键词与文档数据库中的内容来搜索文档。它根据这些关键词在每个文档中的频率和相关性对结果进行排名
- 向量搜索，也称“语义搜索”。文本文档通过嵌入模型转换为数值向量。然后根据查询向量与文档向量之间的余弦相似度或其他相似度/距离度量，查找并对文档进行排名，从而捕捉更深层次的语义含义
- 混合搜索。结合多种搜索方法（例如全文搜索 + 向量搜索）通常能提高搜索效果

本文主要关注向量搜索。全文搜索和混合搜索目前仅通过 Azure AI Search 集成支持，详情参见 `AzureAiSearchContentRetriever`。计划在不久的将来扩展 RAG 工具箱，以包含全文搜索和混合搜索。

## 2 RAG 的阶段

RAG 过程分为两个不同阶段：索引和检索。LangChain4j 提供用于两个阶段的工具。

### 2.1 索引

文档会进行预处理，以便在检索阶段实现高效搜索。

该过程可能因使用的信息检索方法而有所不同。对向量搜索，通常包括清理文档，利用附加数据和元数据对其进行增强，将其拆分为较小的片段（即“分块”），对这些片段进行嵌入，最后将它们存储在嵌入存储库（即向量数据库）。

通常在离线完成，即用户无需等待该过程的完成。可通过例如每周末运行一次的定时任务来重新索引公司内部文档。负责索引的代码也可以是一个仅处理索引任务的单独应用程序。

但某些场景，用户可能希望**上传自定义文档**以供 LLM 访问。此时，索引应在线进行，并成为主应用程序的一部分。

#### 索引阶段的简化流程图



![](https://github.com/langchain4j/langchain4j/blob/main/docs/static/img/rag-ingestion.png?raw=true)

### 2.2 检索

通常在线进行，当用户提交一个问题时，系统会使用已索引的文档来回答问题。

该过程可能会因所用的信息检索方法不同而有所变化。对于向量搜索，通常包括嵌入用户的查询（问题），并在嵌入存储库中执行相似度搜索。然后，将相关片段（原始文档的部分内容）注入提示词并发送给 LLM。

#### 检索阶段的简化流程图

![](https://github.com/langchain4j/langchain4j/blob/main/docs/static/img/rag-retrieval.png?raw=true)





## 3 简单 RAG

LangChain4j 提供了“简单 RAG”功能，使你尽可能轻松使用 RAG。无需学习嵌入技术、选择向量存储、寻找合适的嵌入模型、了解如何解析和拆分文档等操作。只需指向你的文档，LangChain4j 就会自动处理！

若需定制化RAG，请跳到rag-apis。

> 当然，这种“简单 RAG”的质量会比定制化 RAG 设置的质量低一些。然而，这是学习 RAG 或制作概念验证的最简单方法。稍后，您可以轻松地从简单 RAG 过渡到更高级的 RAG，逐步调整和自定义各个方面。

### 3.1 导入 `langchain4j-easy-rag` 依赖



```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-easy-rag</artifactId>
    <version>0.34.0</version>
</dependency>
```

### 3.2 加载文档

```java
List<Document> documents = FileSystemDocumentLoader.loadDocuments("/home/langchain4j/documentation");
```

这将加载指定目录下的所有文件。

#### 底层发生了什么？

Apache Tika 库被用于检测文档类型并解析它们。由于我们没有显式指定使用哪个 `DocumentParser`，因此 `FileSystemDocumentLoader` 将加载 `ApacheTikaDocumentParser`，该解析器由 `langchain4j-easy-rag` 依赖通过 SPI 提供。

#### 咋自定义加载文档？


若想加载所有子目录中的文档，可用 `loadDocumentsRecursively` ：

```java
List<Document> documents = FileSystemDocumentLoader.loadDocumentsRecursively("/home/langchain4j/documentation");
```

还可通过使用 glob 或正则表达式过滤文档：

```java
PathMatcher pathMatcher = FileSystems.getDefault().getPathMatcher("glob:*.pdf");
List<Document> documents = FileSystemDocumentLoader.loadDocuments("/home/langchain4j/documentation", pathMatcher);
```

> 使用 `loadDocumentsRecursively` 时，可能要在 glob 中使用双星号（而不是单星号）：`glob:**.pdf`。

### 3.3 预处理

并将文档存储在专门的嵌入存储中也称向量数据库。这是为了在用户提出问题时快速找到相关信息片段。可用 15+ 种[支持的嵌入存储](https://github.com/langchain4j/langchain4j-embeddings)，但为简化操作，使用内存存储：

```java
InMemoryEmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();
EmbeddingStoreIngestor.ingest(documents, embeddingStore);
```

#### 底层发生了啥？

- `EmbeddingStoreIngestor` 通过 SPI 从 `langchain4j-easy-rag` 依赖中加载 `DocumentSplitter`。每个 `Document` 被拆分成较小的片段（即 `TextSegment`），每个片段不超过 300 个 token，且有 30 个 token 的重叠部分。
- `EmbeddingStoreIngestor` 通过 SPI 从 `langchain4j-easy-rag` 依赖中加载 `EmbeddingModel`。每个 `TextSegment` 都使用 `EmbeddingModel` 转换为 `Embedding`。

> 选择 [bge-small-en-v1.5](https://huggingface.co/BAAI/bge-small-en-v1.5) 作为简单 RAG 的默认嵌入模型。该模型在 [MTEB 排行榜](https://huggingface.co/spaces/mteb/leaderboard) 上取得了不错的成绩，其量化版本仅占用 24 MB 空间。因此，我们可以轻松将其加载到内存中，并在同一进程中通过 [ONNX Runtime](https://onnxruntime.ai/) 运行。
>
> 可在完全离线的情况下，在同一个 JVM 进程中将文本转换为嵌入。LangChain4j 提供 5 种流行的嵌入模型[开箱即用](https://github.com/langchain4j/langchain4j-embeddings)。

3. 所有 `TextSegment` 和 `Embedding` 对被存储在 `EmbeddingStore` 中

4. 创建一个AI 服务，它将作为我们与 LLM 交互的 API：

```java
interface Assistant {

    String chat(String userMessage);
}

ChatLanguageModel chatModel = OpenAiChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName(GPT_4_O_MINI)
    .build();

Assistant assistant = AiServices.builder(Assistant.class)
    .chatLanguageModel(chatModel)
    .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
    .contentRetriever(EmbeddingStoreContentRetriever.from(embeddingStore))
    .build();
```

配置 `Assistant` 使用 OpenAI 的 LLM 来回答用户问题，记住对话中的最近 10 条消息，并从包含我们文档的 `EmbeddingStore` 中检索相关内容。

5. 对话！

```java
String answer = assistant.chat("如何使用 LangChain4j 实现简单 RAG？");
```

## 4 访问源信息

如希望访问增强消息的检索源，可将返回类型包装在 `Result` 类中：

```java
interface Assistant {

    Result<String> chat(String userMessage);
}

Result<String> result = assistant.chat("如何使用 LangChain4j 实现简单 RAG？");

String answer = result.content();
List<Content> sources = result.sources();
```

流式传输时，可用 `onRetrieved()` 指定一个 `Consumer<List<Content>>`：

```java
interface Assistant {

    TokenStream chat(String userMessage);
}

assistant.chat("如何使用 LangChain4j 实现简单 RAG？")
    .onRetrieved(sources -> ...)
    .onNext(token -> ...)
    .onError(error -> ...)
    .start();
```

## 5 RAG API

LangChain4j 提供丰富的 API 让你可轻松构建从简单到高级的自定义 RAG 流水线。本节介绍主要的领域类和 API。

### 5.1 文档（Document）

`Document` 类表示整个文档，例如单个 PDF 文件或网页。当前，`Document` 只能表示文本信息，但未来的更新将支持图像和表格。

```java
package dev.langchain4j.data.document;

/**
 * 表示通常对应于单个文件内容的非结构化文本。此文本可能来自各种来源，如文本文件、PDF、DOCX 或网页 （HTML）。
 * 每个文档都可能具有关联的元数据，包括其来源、所有者、创建日期等
 */
public class Document {

    /**
     * Common metadata key for the name of the file from which the document was loaded.
     */
    public static final String FILE_NAME = "file_name";
    /**
     * Common metadata key for the absolute path of the directory from which the document was loaded.
     */
    public static final String ABSOLUTE_DIRECTORY_PATH = "absolute_directory_path";
    /**
     * Common metadata key for the URL from which the document was loaded.
     */
    public static final String URL = "url";

    private final String text;
    private final Metadata metadata;
```

#### API


- `Document.text()` 返回 `Document` 的文本内容
- `Document.metadata()` 返回 `Document` 的元数据（见下文）
- `Document.toTextSegment()` 将 `Document` 转换为 `TextSegment`（见下文）
- `Document.from(String, Metadata)` 从文本和 `Metadata` 创建一个 `Document`
- `Document.from(String)` 从文本创建一个带空 `Metadata` 的 `Document`

### 5.2 元数据（Metadata）

每个 `Document` 都包含 `Metadata`，用于存储文档的元信息，如名称、来源、最后更新时间、所有者或任何其他相关细节。

`Metadata` 以KV对形式存储，其中键是 `String` 类型，值可为 `String`、`Integer`、`Long`、`Float`、`Double` 中的任意一种。

#### 用途

- 在将文档内容包含到 LLM 的提示词中时，可以将元数据条目一并包含，向 LLM 提供额外信息。例如，提供文档名称和来源可以帮助 LLM 更好地理解内容。
- 在搜索相关内容以包含在提示词中时，可以根据元数据条目进行过滤。例如，您可以将语义搜索范围限制为属于特定所有者的文档。


- 当文档的来源被更新（例如文档的特定页面），您可以通过其元数据条目（例如“id”、“source”等）轻松找到相应的文档，并在嵌入存储中更新它，以保持同步。

#### API


- `Metadata.from(Map)` 从 `Map` 创建 `Metadata`
- `Metadata.put(String key, String value)` / `put(String, int)` / 等方法添加元数据条目
- `Metadata.getString(String key)` / `getInteger(String key)` / 等方法返回元数据条目的值，并转换为所需类型
- `Metadata.containsKey(String key)` 检查元数据中是否包含指定键的条目
- `Metadata.remove(String key)` 从元数据中删除指定键的条目
- `Metadata.copy()` 返回元数据的副本
- `Metadata.toMap()` 将元数据转换为 `Map`
  </details>

### 5.3 文档加载器（Document Loader）

可从 `String` 创建一个 `Document`，但更简单的是使用库中包含的文档加载器之一：

- `FileSystemDocumentLoader` 来自 `langchain4j` 模块
- `UrlDocumentLoader` 来自 `langchain4j` 模块
- `AmazonS3DocumentLoader` 来自 `langchain4j-document-loader-amazon-s3` 模块
- `AzureBlobStorageDocumentLoader` 来自 `langchain4j-document-loader-azure-storage-blob` 模块
- `GitHubDocumentLoader` 来自 `langchain4j-document-loader-github` 模块
- `TencentCosDocumentLoader` 来自 `langchain4j-document-loader-tencent-cos` 模块

### 5.4 文本片段转换器

`TextSegmentTransformer` 类似于 `DocumentTransformer`（如上所述），但它用于转换 `TextSegment`。

与 `DocumentTransformer` 类似，没有统一的解决方案，建议根据您的数据自定义实现 `TextSegmentTransformer`。

提高检索效果的有效方法是将 `Document` 的标题或简短摘要包含在每个 `TextSegment` 。

### 5.5 嵌入

`Embedding` 类封装了一个数值向量，表示嵌入内容（通常是文本，如 `TextSegment`）的“语义意义”。

阅读更多关于向量嵌入的内容：

- https://www.elastic.co/what-is/vector-embedding
- https://www.pinecone.io/learn/vector-embeddings/
- https://cloud.google.com/blog/topics/developers-practitioners/meet-ais-multitool-vector-embeddings

#### API


- `Embedding.dimension()` 返回嵌入向量的维度（即长度）
- `CosineSimilarity.between(Embedding, Embedding)` 计算两个 `Embedding` 之间的余弦相似度
- `Embedding.normalize()` 对嵌入向量进行归一化（就地操作）

### 嵌入模型

`EmbeddingModel` 接口代表一种特殊类型的模型，将文本转换为 `Embedding`。

当前支持的嵌入模型可以在[这里](/category/embedding-models)找到。

#### API


- `EmbeddingModel.embed(String)` 嵌入给定的文本
- `EmbeddingModel.embed(TextSegment)` 嵌入给定的 `TextSegment`
- `EmbeddingModel.embedAll(List<TextSegment>)` 嵌入所有给定的 `TextSegment`
- `EmbeddingModel.dimension()` 返回该模型生成的 `Embedding` 的维度

### 嵌入存储

`EmbeddingStore` 接口表示嵌入存储，也称为向量数据库。它用于存储和高效搜索相似的（在嵌入空间中接近的）`Embedding`。

当前支持的嵌入存储可以在[这里](/integrations/embedding-stores)找到。

`EmbeddingStore` 可以单独存储 `Embedding`，也可以与相应的 `TextSegment` 一起存储：

- 它可以仅按 ID 存储 `Embedding`，嵌入的数据可以存储在其他地方，并通过 ID 关联。
- 它可以同时存储 `Embedding` 和被嵌入的原始数据（通常是 `TextSegment`）。

#### API


- `EmbeddingStore.add(Embedding)` 将给定的 `Embedding` 添加到存储中并返回随机 ID
- `EmbeddingStore.add(String id, Embedding)` 将给定的 `Embedding` 以指定 ID 添加到存储中
- `EmbeddingStore.add(Embedding, TextSegment)` 将给定的 `Embedding` 和关联的 `TextSegment` 添加到存储中，并返回随机 ID
- `EmbeddingStore.addAll(List<Embedding>)` 将一组 `Embedding` 添加到存储中，并返回一组随机 ID
- `EmbeddingStore.addAll(List<Embedding>, List<TextSegment>)` 将一组 `Embedding` 和关联的 `TextSegment` 添加到存储中，并返回一组随机 ID
- `EmbeddingStore.search(EmbeddingSearchRequest)` 搜索最相似的 `Embedding`
- `EmbeddingStore.remove(String id)` 按 ID 从存储中删除单个 `Embedding`
- `EmbeddingStore.removeAll(Collection<String> ids)` 按 ID 从存储中删除多个 `Embedding`
- `EmbeddingStore.removeAll(Filter)` 删除存储中与指定 `Filter` 匹配的所有 `Embedding`
- `EmbeddingStore.removeAll()` 删除存储中的所有 `Embedding`

#### 嵌入搜索请求（EmbeddingSearchRequest）

`EmbeddingSearchRequest` 表示在 `EmbeddingStore` 中的搜索请求。其属性如下：

- `Embedding queryEmbedding`: 用作参考的嵌入。
- `int maxResults`: 返回的最大结果数。这是一个可选参数，默认为 3。
- `double minScore`: 最低分数，范围为 0 到 1（含）。仅返回得分 >= `minScore` 的嵌入。这是一个可选参数，默认为 0。
- `Filter filter`: 搜索时应用于 `Metadata` 的过滤器。仅返回 `Metadata` 符合 `Filter` 的 `TextSegment`。

#### 过滤器（Filter）

关于 `Filter` 的更多细节可以在[这里](https://github.com/langchain4j/langchain4j/pull/610)找到。

#### 嵌入搜索结果（EmbeddingSearchResult）

`EmbeddingSearchResult` 表示在 `EmbeddingStore` 中的搜索结果，包含 `EmbeddingMatch` 列表。

#### 嵌入匹配（Embedding Match）

`EmbeddingMatch` 表示一个匹配的 `Embedding`，包括其相关性得分、ID 和嵌入的原始数据（通常是 `TextSegment`）。

### 嵌入存储导入器

`EmbeddingStoreIngestor` 表示一个导入管道，负责将 `Document` 导入到 `EmbeddingStore`。

在最简单的配置中，`EmbeddingStoreIngestor` 使用指定的 `EmbeddingModel` 嵌入提供的 `Document`，并将它们与其 `Embedding` 一起存储在指定的 `EmbeddingStore` 中：

```java
EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
        .embeddingModel(embeddingModel)
        .embeddingStore(embeddingStore)
        .build();

ingestor.ingest(document1);
ingestor.ingest(document2, document3);
ingestor.ingest(List.of(document4, document5, document6));
```

可选地，`EmbeddingStoreIngestor` 可以使用指定的 `DocumentTransformer` 来转换 `Document`。这在您希望在嵌入之前对文档进行清理、增强或格式化时非常有用。

可选地，`EmbeddingStoreIngestor` 可以使用指定的 `DocumentSplitter` 将 `Document` 拆分为 `TextSegment`。这在文档较大且您希望将其拆分为较小的 `TextSegment` 时非常有用，以提高相似度搜索的质量并减少发送给 LLM 的提示词的大小和成本。

可选地，`EmbeddingStoreIngestor` 可以使用指定的 `TextSegmentTransformer` 来转换 `TextSegment`。这在您希望在嵌入之前对 `TextSegment` 进行清理、增强或格式化时非常有用。

示例：

```java
EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()

    // 为每个 Document 添加 userId 元数据条目，便于后续过滤
    .documentTransformer(document -> {
        document.metadata().put("userId", "12345");
        return document;
    })

    // 将每个 Document 拆分为 1000 个 token 的 TextSegment，具有 200 个 token 的重叠
    .documentSplitter(DocumentSplitters.recursive(1000, 200, new OpenAiTokenizer()))

    // 为每个 TextSegment 添加 Document 的名称，以提高搜索质量
    .textSegmentTransformer(textSegment -> TextSegment.from(
            textSegment.metadata("file_name") + "\n" + textSegment.text(),
            textSegment.metadata()
    ))

    .embeddingModel(embeddingModel)
    .embeddingStore(embeddingStore)
    .build();
```

## 6 高级 RAG

请阅读[this](https://github.com/langchain4j/langchain4j/pull/538)：

![](https://docs.langchain4j.dev/assets/images/advanced-rag-fb84283d02470b835ff2f4913f08fdbf.png)

### 6.1 RetrievalAugmentor

进入RAG流程的入口点，负责使用从各种源检索到相关 `Content`（内容）来增强 `ChatMessage`（聊天消息）。

创建AI服务时，可指定一个 `RetrievalAugmentor` 实例：

```java
Assistant assistant = AiServices.builder(Assistant.class)
    ...
    .retrievalAugmentor(retrievalAugmentor)
    .build();
```

每次调用AI服务时，指定的 `RetrievalAugmentor` 将被调用来增强当前的 `UserMessage`（用户消息）。

可用默认的 `RetrievalAugmentor` 实现（如下所述），也可自定义。

### 6.2 默认的 Retrieval Augmentor

LangChain4j 提供开箱即用的 `RetrievalAugmentor` 接口实现：`DefaultRetrievalAugmentor`，适用于大多数 RAG 使用场景。灵感来自 [这篇文章](https://blog.langchain.dev/deconstructing-rag) 和 [这篇论文](https://arxiv.org/abs/2312.10997)。

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240924092943606.png)

### 6.3 查询（Query）

`Query` 代表 RAG 流程中的用户查询。它包含查询的文本和查询元数据。

#### 6.3.1 查询元数据

`Query` 中的 `Metadata`（元数据）包含一些可能在 RAG 流程的各个组件中有用的信息，如：

- `Metadata.userMessage()` - 需要增强的原始 `UserMessage`
- `Metadata.chatMemoryId()` - 带有 `@MemoryId` 的方法参数的值。可用于标识用户，并在检索时应用访问限制或过滤器
- `Metadata.chatMemory()` - 所有之前的 `ChatMessage`。有助理解提出 `Query` 时的上下文

### 6.4 查询转换器（Query Transformer）

`QueryTransformer` 将给定的 `Query` 转换为一个或多个 `Query`。目的是通过修改或扩展原始查询来提升检索质量。

一些已知的改进检索的方法：

- 查询压缩
- 查询扩展
- 查询重写
- 回溯提示词
- 假设性文档嵌入（HyDE）

更多细节参见[这里](https://blog.langchain.dev/query-transformations/)。

#### 6.4.1 默认查询转换器

`DefaultQueryTransformer` 是 `DefaultRetrievalAugmentor` 中使用的默认实现，它不对 `Query` 进行任何修改，只是直接传递它。

#### 6.4.2 查询压缩转换器

`CompressingQueryTransformer` 使用LLM来压缩给定的 `Query` 和之前的对话，使之成为一个独立的 `Query`。这在用户可能提出参考之前问题的后续问题时非常有用。

如：

```
用户：告诉我关于 John Doe 的信息
AI：John Doe 是一个……
用户：他住在哪里？
```

仅靠 “他住在哪里？” 这个查询无法检索到所需信息，因为没有明确说明 “他” 是谁，导致上下文不清晰。

使用 `CompressingQueryTransformer` 时，LLM 会读取整个对话，将 “他住在哪里？” 转换为 “John Doe 住在哪里？”。

#### 6.4.3 查询扩展转换器

`ExpandingQueryTransformer` 使用LLM将给定的 `Query` 扩展为多个 `Query`。这很有用，因为 LLM 可以用不同的方式重写和重新表述查询，从而帮助检索到更多相关内容。

### 6.5 内容（Content）

代表与用户 `Query` 相关的内容。目前，它仅限于文本内容（即 `TextSegment`），将来可能支持其他模态（如图片、音频、视频等）。

### 6.6 内容检索器（Content Retriever）

`ContentRetriever` 使用给定的 `Query` 从底层数据源中检索 `Content`。底层数据源可以是几乎任何东西：

- 嵌入存储
- 全文搜索引擎
- 向量与全文搜索的混合
- 网络搜索引擎
- 知识图谱
- SQL 数据库
- 等等

#### 6.6.1 嵌入存储内容检索器

`EmbeddingStoreContentRetriever` 使用 `EmbeddingModel` 来嵌入查询，从 `EmbeddingStore` 检索相关的 `Content`。

示例：

```java
EmbeddingStore embeddingStore = ...
EmbeddingModel embeddingModel = ...

ContentRetriever contentRetriever = EmbeddingStoreContentRetriever.builder()
    .embeddingStore(embeddingStore)
    .embeddingModel(embeddingModel)
    .maxResults(3)
     // maxResults 也可以根据查询动态指定
    .dynamicMaxResults(query -> 3)
    .minScore(0.75)
     // minScore 也可以根据查询动态指定
    .dynamicMinScore(query -> 0.75)
    .filter(metadataKey("userId").isEqualTo("12345"))
    // filter 也可以根据查询动态指定
    .dynamicFilter(query -> {
        String userId = getUserId(query.metadata().chatMemoryId());
        return metadataKey("userId").isEqualTo(userId);
    })
    .build();
```

#### 6.6.2 网络搜索内容检索器

`WebSearchContentRetriever` 使用 `WebSearchEngine` 从网络中检索相关 `Content`。

所有支持的 `WebSearchEngine` 集成可以在 [此处](/category/web-search-engines) 找到。

以下是一个示例：

```java
WebSearchEngine googleSearchEngine = GoogleCustomWebSearchEngine.builder()
        .apiKey(System.getenv("GOOGLE_API_KEY"))
        .csi(System.getenv("GOOGLE_SEARCH_ENGINE_ID"))
        .build();

ContentRetriever contentRetriever = WebSearchContentRetriever.builder()
        .webSearchEngine(googleSearchEngine)
        .maxResults(3)
        .build();
```

完整示例[这里](https://github.com/Java-Edge/langchain4j-examples/blob/main/rag-examples/src/main/java/_3_advanced/_08_Advanced_RAG_Web_Search_Example.java)。

#### 6.6.3 SQL 数据库内容检索器

`SqlDatabaseContentRetriever` 是 `ContentRetriever` 的实验性实现，位于 `langchain4j-experimental-sql` 模块中。

它使用 `DataSource` 和LLM为给定的自然语言 `Query` 生成并执行 SQL 查询。

有关更多信息，请参阅 `SqlDatabaseContentRetriever` 的 Javadoc。

 [示例](https://github.com/Java-Edge/langchain4j-examples/blob/main/rag-examples/src/main/java/_3_advanced/_10_Advanced_RAG_SQL_Database_Retreiver_Example.java)。

#### 6.6.4 Azure AI 搜索内容检索器

`AzureAiSearchContentRetriever` 可以在 `langchain4j-azure-ai-search` 模块中找到。

#### 6.6.5 Neo4j 内容检索器

`Neo4jContentRetriever` 可以在 `langchain4j-neo4j` 模块中找到。

### 6.7 查询路由器（Query Router）

`QueryRouter` 负责将 `Query` 路由到适当的 `ContentRetriever`。

#### 默认查询路由器

`DefaultQueryRouter` 是 `DefaultRetrievalAugmentor` 中使用的默认实现。它将每个 `Query` 路由到所有配置的 `ContentRetriever`。

#### 语言模型查询路由器

`LanguageModelQueryRouter` 使用大语言模型（LLM）来决定将给定的 `Query` 路由到哪里。

### 6.8 内容聚合器（Content Aggregator）

更多细节即将推出。

#### 默认内容聚合器

`DefaultContentAggregator`

更多细节即将推出。

#### 内容重排序聚合器

`ReRankingContentAggregator`

### 6.9 内容注入器（Content Injector）

#### 默认内容注入器

`DefaultContentInjector`

### 6.10 并行化处理

当只有一个 `Query`和一个 `ContentRetriever` 时，`DefaultRetrievalAugmentor` 在同一线程中执行查询路由和内容检索。否则，使用 `Executor` 进行并行化处理。默认情况下，使用修改后的（`keepAliveTime` 为 1 秒而不是 60秒）`Executors.newCachedThreadPool()`，但你也可以在创建 `DefaultRetrievalAugmentor` 时提供自定义的 `Executor` 实例：

```java
DefaultRetrievalAugmentor.builder()
        ...
        .executor(executor)
        .build;
```

## Examples

- [Easy RAG](https://github.com/langchain4j/langchain4j-examples/blob/main/rag-examples/src/main/java/_1_easy/Easy_RAG_Example.java)
- [Naive RAG](https://github.com/langchain4j/langchain4j-examples/blob/main/rag-examples/src/main/java/_2_naive/Naive_RAG_Example.java)
- [Advanced RAG with Query Compression](https://github.com/langchain4j/langchain4j-examples/blob/main/rag-examples/src/main/java/_3_advanced/_01_Advanced_RAG_with_Query_Compression_Example.java)
- [Advanced RAG with Query Routing](https://github.com/langchain4j/langchain4j-examples/blob/main/rag-examples/src/main/java/_3_advanced/_02_Advanced_RAG_with_Query_Routing_Example.java)
- [Advanced RAG with Re-Ranking](https://github.com/langchain4j/langchain4j-examples/blob/main/rag-examples/src/main/java/_3_advanced/_03_Advanced_RAG_with_ReRanking_Example.java)
- [Advanced RAG with Including Metadata](https://github.com/langchain4j/langchain4j-examples/blob/main/rag-examples/src/main/java/_3_advanced/_04_Advanced_RAG_with_Metadata_Example.java)
- [Advanced RAG with Metadata Filtering](https://github.com/langchain4j/langchain4j-examples/blob/main/rag-examples/src/main/java/_3_advanced/_05_Advanced_RAG_with_Metadata_Filtering_Examples.java)
- [Advanced RAG with multiple Retrievers](https://github.com/langchain4j/langchain4j-examples/blob/main/rag-examples/src/main/java/_3_advanced/_07_Advanced_RAG_Multiple_Retrievers_Example.java)
- [Advanced RAG with Web Search](https://github.com/langchain4j/langchain4j-examples/blob/main/rag-examples/src/main/java/_3_advanced/_08_Advanced_RAG_Web_Search_Example.java)
- [Advanced RAG with SQL Database](https://github.com/langchain4j/langchain4j-examples/blob/main/rag-examples/src/main/java/_3_advanced/_10_Advanced_RAG_SQL_Database_Retreiver_Example.java)
- [Skipping Retrieval](https://github.com/langchain4j/langchain4j-examples/blob/main/rag-examples/src/main/java/_3_advanced/_06_Advanced_RAG_Skip_Retrieval_Example.java)
- [RAG + Tools](https://github.com/langchain4j/langchain4j-examples/blob/main/customer-support-agent-example/src/test/java/dev/langchain4j/example/CustomerSupportAgentApplicationTest.java)
- [Loading Documents](https://github.com/langchain4j/langchain4j-examples/blob/main/other-examples/src/main/java/DocumentLoaderExamples.java)



## 案例

### Naive_RAG



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/49bfd49ca4dc429d48db9711daef6485.png)