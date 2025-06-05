# v0.15.0：父子检索重磅上线，大幅提升 AI 回复的精准与深度

## 0 前言

v0.15.0新增父子检索功能，RAG系统中实现的一项先进技术，旨在增强信息访问和上下文理解。借助这项技术，Dify 现可通过提供更全面、更符合上下文的信息来提高 AI 生成回复的质量和准确性。

## 1 语境与精确度的困境

用知识检索系统时，用户常常面临令人沮丧的抉择，搜索结果：

- 要么过于碎片化，缺乏必要的上下文信息来理解信息
- 要么过于宽泛，牺牲了精准度，却充斥着过多无关的细节。这使得用户更难以高效地找到并使用所需的精准信息。

所选的块大小显著影响系统生成准确全面响应的能力。因此，在精度和上下文之间找到理想的平衡对于提高知识检索过程的整体性能和可靠性至关重要。

## 2 用于检索的子块和用于上下文的父块

父子检索利用双层分层方法解决了上下文和精确度之间的矛盾，这种方法有效地平衡了 RAG 系统中精确匹配和全面上下文信息之间的权衡。这种结构化的双层信息访问的基本机制如下：

### 带有子块的查询匹配

- 使用小而集中的信息片段（通常简洁到段落中的单个句子）来匹配用户的查询。
- 这些子块可以实现精确且相关的初始检索。

### 使用父块进行上下文丰富

- 然后检索包含匹配的子块的更大、更全面的部分（例如一个段落、一个部分，甚至整个文档）。
- 这些父块为语言模型（LLM）提供了全面的上下文。



![](https://framerusercontent.com/images/sKznH92du2qPB6JNFjAMfAL6VE.png)

这种分层检索方法能够保留检索信息更广泛的叙述或背景，并降低在分块过程中忽略关键上下文细节的风险。例如，在客户支持方面，它使自动化系统能够通过参考全面的产品文档，提供更详细、更符合语境的响应。因此，在内容生成方面，它不仅提供精准的答案，还提供丰富的支持性背景信息，从而提升语言模型输出的质量。以下是使用同一文档对通用检索和父子检索进行对比的示例。

![](https://framerusercontent.com/images/kocZcixfdwJ5d79FXzAQZ3yy0.png)

## 3 亲子检索分步指南

- **数据源：** 选择数据源并导入要用作知识的数据。
- **块设置：** 选择常规或父子分块策略，设置参数以拆分和清理文档，并预览结果。

在父子分块中，有两种模式来拆分父块： **段落**和**完整文档** 。

  - **段落** ：此模式根据分隔符和最大块长度将文本拆分为段落，并使用拆分后的文本作为父块进行检索。此模式更适合段落清晰且相对独立的文本。
  - **完整文档** ：将整个文档作为父块并直接检索。当需要在内聚上下文中检索整个文档时，完整文档更适用。

在这两种模式下，子块都是通过根据分隔符和最大块长度进一步分割父块来生成的。

![](https://framerusercontent.com/images/AwizCYhbTkm5Zi2GlFYFoenmhco.png)

- Choose and configure **Index Method** and **Retrieval Setting**.
  选择并配置**索引方法**和**检索设置** 。

- Wait until processing completed and **go to documents**.
  等待处理完成并**转到文档** 。

- **Edit & Save Parent or Child chunks
  编辑并保存父块或子块**

  While allowing users to edit parent chunks and child chunks separately, we also retain the ability for parent chunks to regenerate child chunks. Its purpose is to allow users to improve retrieval efficiency by editing and adding child chunks as much as possible.
  我们在允许用户分别编辑父块和子块的同时，也保留了父块重新生成子块的功能，目的是为了让用户尽可能地通过编辑和添加子块来提高检索效率。
  If you edit parent chunks, there are two saving options:
  如果您编辑父块，则有两个保存选项：

  - Not regenerate the child chunks. (default)
    不重新生成子块。（默认）
  - Save and regenerate the child chunks. (with second confirmation)
    保存并重新生成子块。（需第二次确认）

编辑子块不会改变父块的内容。这样，用户可以将子块作为自定义标签来检索该父块。

![](https://framerusercontent.com/images/5ujVdD4aZhDgz2Xq5W9rg9MiKQ.png)

现在您可以将您的知识与您的应用程序集成在一起。🎉

## 4 本次更新的其他亮点

### 更人性化的父子 Chunk 关系展示

作为低代码平台，Dify 致力于让没有技术背景的用户也能轻松理解和使用此功能。为此，我们为区块预览设计了全新的、用户友好的界面。

- 每个父块都是一个单独的模块。子块在开头以灰色背景颜色和块编号标记。
- 将鼠标悬停在子块上，它将以蓝色突出显示并显示字数信息。

![](https://framerusercontent.com/images/kzCMSFolT4bU5uiTdTXVTkXU.png)

为了预览检索测试，我们将父块放在弹出窗口的左侧，该弹出窗口包含命中子块的最高分数。所有命中的子块都列在右侧，并以蓝色突出显示，并显示相应的分数。

![](https://framerusercontent.com/images/bjfnBy8UaK9SuYtPYmI3dnjkt2o.png)

本次更新，Dify 的父子检索功能为用户提供更精准、更全面的搜索结果，提升信息获取的效率和准确率。如需了解更多详细操作，请参考[知识库｜Dify](https://docs.dify.ai/guides/knowledge-base) 文档获取详细说明，并在 Dify.AI 上亲身体验！