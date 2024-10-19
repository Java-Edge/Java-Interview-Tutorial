# LangServe如何革新LLM应用部署？

## 0 前言

随LLM技术演进，AI应用开发部署越来越复杂。LangServe应运而生，旨在简化AI服务部署和运维的框架。专为LLM部署和管理而设计；本文旨在讲解LangServe的功能特点和实践运用。

## 1 概述

LangServe 提供一整套将LLM部署成产品服务的解决方案。可将LLM应用链接入常见Python Web框架（如FastAPI、Pydantic、uvloop、asyncio），进而生成一套RESTful API。LangServe减少开发人员的运维部署任务，使他们可以更专注于LLM应用开发。不仅简化从开发到生产的过渡，还确保服务的高性能和安全性。它提供了包括模型管理器、请求处理器、推理引擎、结果缓存、监控与日志记录以及API网关等各类组件。LangServe的目标是让开发者能够轻松集成、部署和管理AI模型，从零到一无缝地实现LLM应用从原型到产品的过渡。

仓库地址：https://github.com/langchain-ai/langserve

## 2 功能

### 多模型支持

LangServe支持部署多种类型的AI模型，包括文本生成、图像识别、语音处理等，开发人员能够按需切换。

### 高效推理缓存

为了提高响应速度和节省计算资源，LangServe包含了一个高效的结果缓存系统，可以智能地存储和管理热点数据。

### 安全访问控制

通过角色和策略的管理，LangServe提供了灵活的访问控制机制，确保了服务的安全性和数据的隐私性。

### 实时监控与日志

内置的监控系统可以实时跟踪服务的运行状态，详尽的日志记录有助于问题的调试和分析。

### 简洁易用的API接口

LangServe的API设计简洁直观，易于理解和使用，大大减少了开发者的学习成本。

## 3 REST API 开发

### 1 环境准备

安装依赖：

`pip install "langserve[all]"`

该命令包含了服务端和客户端的安装。

**设置环境变量**：`OPENAI_API_KEY=<your valid openai api key>`

### 2 代码开发

简单的翻译接口。除了LangServe，还引入Web框架FastAPI和Web服务器uvicorn：

```python
from fastapi import FastAPI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI
from langserve import add_routes

# FastAPI是一个基于Python的Web框架，用于构建高性能、可扩展的API
app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="A simple API server using Langchain's Runnable interfaces",
)

# 接口1
add_routes(
    app,
    ChatOpenAI(),
    path="/openai",
)

# 接口2
system_message_prompt = SystemMessagePromptTemplate.from_template("""
    You are a helpful assistant that translates {input_language} to {output_language}.
""")
human_message_prompt = HumanMessagePromptTemplate.from_template("{text}")

chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])

add_routes(
    app,
    chat_prompt | ChatOpenAI(),
    path="/translate",
)

if __name__ == "__main__":
    import uvicorn
    # Python的Web服务器
    uvicorn.run(app, host="localhost", port=9999)
```

### 3 启动

```bash
python app.py
```

## 4 Postman调用测试

通常可直接访问 `http://localhost:9999/docs`，在浏览器在线的接口文档中找到对应的接口，并直接在网页上进行测试。目前由于新的Pydantic版本存在兼容性问题，无法生成OpenAPI文档，因此暂用Postman进行接口测试。

## 5 客户端调用测试

在后台开发LangServe客户端，进行远程调用REST API。

```python
from langchain.prompts.chat import ChatPromptTemplate
from langserve import RemoteRunnable

# 配置远程接口
openai_llm = RemoteRunnable("http://localhost:9999/openai/")

# 创建提示词
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "你是一名资深的AI大模型专家"),
        ("human", "请帮忙讲解一下，有哪些常用的通用开源大模型，中外各自罗列5个"),
    ]
).format_messages()

# LLM接口调用
openai_llm.invoke(prompt)

# 输出：
# AIMessage(content='当谈论通用开源大模型时，常常会提到自然语言处理（NLP）领域中的预训练模型。以下是中外各自常用的5个通用开源大模型：
# **国外：**
# 1. BERT（Bidirectional Encoder Representations from Transformers）：由Google开发，是一种基于Transformer架构的预训练模型，用于各种NLP任务。
# 2. GPT-3（Generative Pre-trained Transformer 3）：由OpenAI发布，是一个非常大的语言生成模型，可以用于文本生成等任务。
# 3. RoBERTa（A Robustly Optimized BERT Approach）：由Facebook发布的预训练模型，基于BERT进行了一些优化，用于提高性能。
# 4. T5（Text-to-Text Transfer Transformer）：由Google发布，是一个通用的文本生成模型，可以应用于多种NLP任务。
# 5. XLNet：由谷歌Brain团队发布，是一种自回归预训练模型，结合Transformer-XL和自回归方法。
# **国内：**
# 6. ERNIE（Enhanced Representation through kNowledge Integration）：由百度发布，是一种基于Transformer架构的多语言预训练模型，融合了知识融合的方法。
# 7. GPT-2（Generative Pre-trained Transformer 2）：由哈工大讯飞联合实验室发布，是一个类似于GPT-3的语言生成模型，用于文本生成等任务。
# 8. HFL/THU Bert：由清华大学自然语言处理与社会人文计算实验室发布，是一个BERT的中文预训练模型，适用于中文NLP任务。
# 9. RoFormer：由华为发布，是一种优化的中文预训练模型，用于中文NLP任务。
# 10. PaddleNLP：由百度发布，是一个NLP模型库，提供了多种预训练模型，包括BERT、ERNIE等，适用于各种NLP任务。')
```

## 总结

LangServe作为一款专注于AI模型部署和运维的平台，通过其精心设计的架构和丰富的功能集合，显著降低了AI项目的门槛，提升了开发效率和服务稳定性。无论是初创公司还是大型企业，LangServe都提供了一个可靠的解决方案，以应对AI领域中的挑战和机遇。随着AI技术的不断进步，LangServe将继续在AI服务的革新和发展中扮演关键角色。