# 04-prompt-helping-llm-understand-knowledge

## 1 Prompt

Prompt 可理解为指导AI模型生成特定类型、主题或格式内容的文本。

NLP中，Prompt 通常由一个问题或任务描述组成，如“给我写一篇有关RAG的文章”，这句话就是Prompt。

Prompt赋予LLM小样本甚至零样本学习的能力：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/60bb50c2370bb664ea272352fad4e56e.png)

LLM能力本质上说是续写，通过编写更好的prompt来指导模型，并因此获得更好的结果：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/8e94dc98956c285ea6e6ac9a57c95071.png)

无具体指令，模型只会续写。输出结果可能出人意料或远高于任务要求：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/995fc47ef64b133f33318ded8ba2dc1b.png)

告知模型去完善句子，因此输出结果和最初输入完全符合。Prompt Engineering就是探讨如何设计最佳Prompt，用于指导LLM高效完成某项任务。

## 2 Prompt的进阶技巧CoT

Chain of Thought，让模型输出更多的上下文与思考过程，提升模型输出下一个token的准确率。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/9c554a0a731db1e07f157385fd341391.png)

## 3 优化Prompt，提升模型推理能力和问答准确率

### 3.1 分布式引导提问

把解决问题的思路分成多步，引导模型分步执行

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/24e6ddc90f71dc3959b4cabbc3ee8db2.png)

### 3.2 Prompt代码化

LLM通常都会有代码数据，prompt代码化进一步提升模型的推理能力。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/3ada22decb2aac3c0bab807d409debb7.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/da958107c238696309a1cc17f9ff564a.png)