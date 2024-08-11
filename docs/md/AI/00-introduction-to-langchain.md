# 00-初识LangChain



## 1 langchain是啥及其发展过程

LLM大模型与AI应用的粘合剂。

LangChain是一个开源框架，旨在简化使用LLM构建端到端应用程序的过程，也是ReAct（reason+act）论文的落地实现。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/05/7bd28b1fe46a63a3117ae07d0ffb8732.png)

2022年10月25日开源：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/30841cf393dbdd44c364bea125183d50.png)

至今（2024-08-11）已有90K+ star：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/54f3ef7328b82e605c692f1ccb17a1d9.png)

种子轮一周1000万美金，A轮2500万美金，11个月里累计发布200多次，提交4000多次代码：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/05/03f30403c65751c0be2455f7ab53b833.png)

## 2 langchain能做啥？

能力一览

```
模型 A
构造提示词 -> LLMs -> 模型生产结果 -> 结果处理 -> 最终结果

模型 B
构造提示词 -> LLMs -> 模型生产结果 -> 结果处理 -> 最终结果

模型 N...
构造提示词 -> LLMs -> 模型生产结果 -> 结果处理 -> 最终结果
```

### 2.1 Langchain I/O系统



```
+------------+                +------------------------+                +------------+
|            |       输入      |    +--------------+    |      输入       |            |
|  用户输入  | -------------> |    |    prompt    |    | -------------> |    LLMs      |
|            |                |    +--------------+    |                |            |
|            |                |                        |                |            |
|            |       输出      |    +--------------+    |      输出       |            |
|            | <------------- |    |    Output    |    | <------------- |            |
+------------+                |    |    Parsers   |    |                +------------+
                              |    +--------------+    |
                              +------------------------+
                                   Langchain I/O系统
```

1. 解决LLM各种问题的提示词工程方案之一
2. 提供与LLMs交互的各种组件，极大提升开发效率
3. 可以文件方式加载提示词、链等，方便共享提示词和做提示词版本管理
4. 丰富的链式工具箱

### 2.2 LLMs & Prompt

提供目前市面上几乎所有 LLM 的通用接口，同时还提供 提示词 的管理和优化能力，也提供非常多的相关适用工具，以方便开发人员利用 LangChain 与 LLMs 进行交互。

### 2.3 Chains

LangChain 把提示词、LLM、结果解析封装成 Chain，并提供标准接口，以便允许不同Chain形成交互序列，为 AI 原生应用提供了端到端的 Chain。

### 2.4 RAG（Retrieval Augemented Generation）

检索增强生成式，一种解决预训练语料数据无法及时更新而带来的回答内容陈旧的方式。LangChain提供支持的Chain。

这些 Chain 会先和外部数据源交互以获得对应数据，再利用所获数据与 LLMs 交互。典型应用场景如：基于特定数据源的问答机器人。

### 2.5 Agent

对于一个任务，代理主要涉及让 LLMs 来对任务进行拆分、执行该行动、并观察执行结果，代理会重复执行这个过程，直到该任务完成为止。LangChain 为 代理 提供了标准接口，可供选择的代理及一些端到端的代理的示例。

### 2.6 Memory

chain 或 agent 调用之间的状态持久化。LangChain 为 内存 提供了标准接口并提供一系列的内存实现。

### 2.7 Evaluation

提供了非常多的评估能力，以更方便对 LLMs 进行评估。

## 3 langchain的优劣

### 3.1 优点

- 平台大语言模型调用能力，支持多平台多模型调用，为用户提供灵活选择
- 轻量级SDK（python、javas），将LLMs与传统编程语言集成
- 多模态支持，提供多模态数据支持，如图像、音频等

### 3.2 缺点

- 学习曲线相对较高
- 官方文档不是很完善
- 缺乏大型工业化应用实践

## 4 langchain使用环境的搭建

### 4.1 为啥用Python？

- 高级的接近人类语言的编程语言，易于学习
- 动态语言
- 直译式语言，可以跳过编译逐行执行代码广泛应用于web应用、软件、数据科学和机器学习
- AI方向的主流语言
- 活跃的python社区
- 数据巨大且丰富的库

### 4.2 环境要求

#### Python

>= 3.8.1，推荐 3.10.12
>https://www.python.org/downloads/

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/05/821925b48c4f94730a8fad4048ffa09a.png)

#### 安装 jupyter

参阅：[安装使用教程](http://www.javaedge.cn/md/AI/05-%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83%E5%AE%89%E8%A3%85.html)

#### 安装 LangChain

官网：https://python.langchain.com

命令安装

```bash
$ pip install langchain
$ conda install langchain -c conda-forge
```

也可以使用VS code/PyCharm的jupyter插件启动。