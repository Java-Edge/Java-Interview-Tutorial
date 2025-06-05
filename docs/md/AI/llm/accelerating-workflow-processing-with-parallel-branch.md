# Dify v0.8.0：使用并行分支加速工作流处理

## 0 前言

Dify Workflow 因其用户友好的设置和强大的功能而广受欢迎。然而，之前的版本以串行方式执行各个步骤，等待每个节点完成后再转到下一个节点。虽提供清晰结构，但这会降低复杂任务的处理速度，增加延迟和响应时间。

Dify v0.8.0 通过引入并行处理功能解决了这些限制。Workflow 现在可以并发执行多个分支，从而能够同时处理不同的任务。这显著提高了执行效率，使 LLM 应用程序能够更快、更灵活地处理复杂的工作负载。

### 创建并行分支

要在工作流中定义并行分支：

1. 将鼠标悬停在节点上
2. 点击出现的 + 图标
3. 添加不同的节点类型

各个分支将并行执行并合并其输出。请参阅[文档](https://docs.dify.ai/guides/workflow/orchestrate-node)以获取详细说明。

![](https://framerusercontent.com/images/QkwBs9JTNzarDPeT3fiiW9uLHg.gif)

工作流包含多种并行场景。可尝试使用这些场景来加快流程。如已在早期版本构建工作流，请考虑用并行模式重构，提高性能。

## 1 简单并行

基本场景，可从一个固定节点（如起始节点）创建多个并行分支。可同时处理类似的子任务，如翻译或模型比较。

模型比较工作流程中的简单并行性：

https://framerusercontent.com/assets/CSv597nulCSy0uNXY95cOnpeY.mp4

## 2 嵌套并行

允许在工作流中实现多层级并行结构。从初始节点开始，工作流分支出多个并行路径，每个路径包含各自的并行流程。“科学写作助手”示例展示了两个嵌套层级：

![](https://framerusercontent.com/images/Qw9cSS2B7WthYmU7mcdwVbuY.png)

1. **第一级（框 1）：** 从问题分类器中，出现了两个主要分支：
   a.概念解释（框 1）
   b. 处理偏离主题的对话（“拒绝闲聊”分支）

概念解释（concept explanation）分支（框1）包括：

   \- Metaphors and analogies branch for enhanced concept understanding 
   \- 隐喻和类比分支可增强概念理解

   \- Theme extraction | Second level nesting (Box 2) for detailed concept analysis and content generation
   \- 主题提取 | 第二级嵌套（框 2）用于详细的概念分析和内容生成

2. **第二级（框 2）：** 主题提取分支执行两个并行任务：
   a. 提取主题并搜索（提取主题 -> Serper）获取背景信息
   b.提取主题并生成学习计划（学习计划->参数提取器->TavilySearch）

这种多层嵌套并行结构非常适合诸如深入概念分析和科学传播内容创作等复杂、多阶段的任务。它能够同时处理不同的概念层面，包括基本解释、类比、背景研究和学习计划，从而提高处理效率和输出质量。

## 3 迭代并行

涉及循环结构内的并行处理。“股票新闻情绪分析”演示这种方法：

![](https://framerusercontent.com/images/aVZRG8dmzQ47Vp9QEXjWPFU.png)

1. **Setup:** Search and extract multiple news URLs for a specific stock.
   **设置：** 搜索并提取特定股票的多个新闻 URL。

2. **Iterative processing:** For each URL, execute in parallel: 
   **迭代处理：** 对于每个 URL，并行执行：

   a. Content retrieval: Use JinaReader to scrape and parse webpage content. 
   a.内容检索：使用 JinaReader 抓取并解析网页内容。

   b. Opinion extraction: Identify optimistic and pessimistic views using a parameter extractor. 
   b. 观点提取：使用参数提取器识别乐观和悲观的观点。

   c. Opinion summarization: Use two independent LLM models to summarize optimistic and pessimistic views concurrently.
   c. 观点总结：使用两个独立的 LLM 模型同时总结乐观和悲观的观点。

3. **Combine results:** Consolidate all findings into a single table.
   **合并结果：** 将所有发现合并到一张表中。

This method efficiently processes large volumes of news articles, analyzing sentiment from multiple perspectives to help investors make informed decisions. Parallel processing within iterations accelerates tasks with similar data structures, saving time and improving performance.
该方法能够高效处理海量新闻文章，从多个角度分析情绪，帮助投资者做出明智的决策。迭代中的并行处理能够加速具有相似数据结构的任务，从而节省时间并提升性能。

## 4 条件并行

条件分支并行根据条件运行不同的并行任务分支。“面试准备助手”示例展示了此设置：

![](https://framerusercontent.com/images/FN3HzbcjYTsIKTMDc7l1ojpK6Z0.png)

1. **Main condition (IF/ELSE node):** Splits process based on dialogue_count: 
   **主要条件（IF/ELSE 节点）：** 根据 dialog_count 拆分流程：

   a. First dialogue: Confirm interview role and company 
   a. 第一次对话：确认面试职位和公司

   b. Later dialogues: Enter deeper processing
   b. 后续对话：进入更深层次的处理

2. **Secondary condition (IF/ELSE 2 node):** In later dialogues, branches based on existing company info and interview questions: 
   **次要条件（IF/ELSE 2 节点）：** 在后续对话中，根据现有的公司信息和面试问题进行分支：

   a. Missing company info: Run parallel tasks to search company, scrape webpage, summarize company info 
   a. 缺少公司信息：运行并行任务来搜索公司、抓取网页、汇总公司信息

   b. Missing interview questions: Generate multiple questions in parallel
   b. 缺少面试问题：并行生成多个问题

3. **Parallel task execution:** For question generation, multiple LLM nodes start at the same time, each creating a different question
   **并行任务执行：** 对于问题生成，多个 LLM 节点同时启动，每个节点创建不同的问题

This IF/ELSE structure lets Workflow flexibly run different parallel tasks based on current state and needs. (The question classifier node can serve a similar function.) This improves efficiency while keeping things orderly. It suits situations needing simultaneous complex tasks based on various conditions, like this interview prep process.
这种 IF/ELSE 结构允许 Workflow 根据当前状态和需求灵活地运行不同的并行任务。（问题分类器节点可以实现类似的功能。）这在保持有序的同时提高了效率。它适用于需要根据各种条件同时执行复杂任务的情况，例如本面试准备流程。

## 5 受益于工作流并行

这四种并行方法（简单、嵌套、迭代和条件）提升了 Dify Workflow 的性能。它们支持多模型协作，简化复杂任务，并动态调整执行路径。这些升级提升了效率，拓宽了应用范围，更好地处理棘手的工作情况。您可以在探索页面的配套模板中快速试用这些新功能。
Dify将继续增强 Workflow，提供更强大、更灵活的自动化解决方案。令人期待！