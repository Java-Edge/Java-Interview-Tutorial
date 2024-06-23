# 02-langchain的agents如何实现的？

## 0 前言

这将所有可用的代理按照几个维度进行分类。

### 预期模型类型

用于聊天模型（接收信息，输出信息）或 LLM（接收字符串，输出字符串）。这主要影响所使用的提示策略。

### 支持聊天历史记录

这些代理类型是否支持聊天历史记录。如果支持，就意味着可以作为聊天机器人使用。如果不支持，则意味着它更适合单一任务。支持聊天记录通常需要更好的模型，因此早期针对较差模型的代理类型可能不支持聊天记录。

### 支持多输入工具

这些代理类型是否支持多输入工具。如果一个工具只需要单一输入，那么 LLM 通常更容易知道如何调用它。因此，早期几种针对较差模型的代理类型可能不支持它们。

### 支持并行函数调用

让 LLM 同时调用多个工具可以大大加快代理的速度，无论是否有任务需要通过这样做来协助。不过，LLM 要做到这一点要困难得多，因此有些代理类型不支持这一点。

### 所需模型参数

该代理是否要求模型支持任何附加参数。有些代理类型会利用 OpenAI 函数调用等功能，这就需要其他模型参数。如果不需要，则表示一切都通过提示完成。

何时应考虑使用该代理类型：

| Agent Type                                                   | Intended Model Type | Supports Chat History | Supports Multi-Input Tools | Supports Parallel Function Calling | Required Model Params | When to Use                                                  |
| ------------------------------------------------------------ | ------------------- | --------------------- | -------------------------- | ---------------------------------- | --------------------- | ------------------------------------------------------------ |
| [OpenAI Tools](https://js.langchain.com/v0.1/docs/modules/agents/agent_types/openai_tools_agent/) | Chat                | ✅                     | ✅                          | ✅                                  | `tools`               | 若使用的最新OpenAI model (1106+)                             |
| [OpenAI Functions](https://js.langchain.com/v0.1/docs/modules/agents/agent_types/openai_functions_agent/) | Chat                | ✅                     | ✅                          |                                    | `functions`           | 如果您使用的是 OpenAI 模型，或者是针对函数调用进行了微调并公开了与 OpenAI 相同函数参数的开源模型 |
| [XML](https://js.langchain.com/v0.1/docs/modules/agents/agent_types/xml/) | LLM                 | ✅                     |                            |                                    |                       | Anthropic模型或其他擅长 XML 的模型                           |
| [Structured Chat](https://js.langchain.com/v0.1/docs/modules/agents/agent_types/structured_chat/) | Chat                | ✅                     | ✅                          |                                    |                       | 如果您需要支持具有多个输入的工具，并且正在使用不支持函数调用的模型 |
| [ReAct](https://js.langchain.com/v0.1/docs/modules/agents/agent_types/react/) | LLM                 | ✅                     |                            |                                    |                       | 简化模型                                                     |

来看看内置的主要agent类型：

## 1 OPENAI_FUNCTIONS

Openai函数调用型，某些模型（如 OpenAI 的 gpt-3.5-turbo 和 gpt-4）已经过微调，可以检测函数何时应该被调用，并响应应该传递给函数的输入。在 API 调用中，你可描述函数，并让模型智能地选择输出一个包含参数的 JSON 对象来调用这些函数。

OPENAI_FUNCTIONS代理旨在与这些模型配合使用。

## 2 ZERO_SHOT_REACT_DESCRIPTION

零样本增强生成型

```python
from langchain.agents import (
    load_tools,
    initialize_agent,
    AgentType,
)
import os
os.environ["SERPAPI_API_KEY"] = "xxx"

# 定义llm
class QwenTurboTongyi(Tongyi):
    model_name = "qwen-turbo"
llm = QwenTurboTongyi(temperature=1)




tools = load_tools(["serpapi","llm-math"],llm=llm)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)
print(agent)
print(agent.agent.llm_chain.prompt.template)
agent.invoke("现在美国总统是谁？他的年龄除以2是多少？")
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/523d5ab41fef3cf7a709cb23b743ac26.png)



## 3 CHAT_ZERO_SHOT_REACT_DESCRIPTION

零样本增强生成型（对话），使用了chatmodel

```python
tools = load_tools(["serpapi","llm-math"],llm=llm)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CHAT_ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)
print(agent)
print(agent.agent.llm_chain.prompt.messages[0].prompt.template)
agent.invoke("现在美国总统是谁？他的年龄除以2是多少？")
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/736bfe538df5d91bc8f4ad4a55352efd.png)



## 4 CONVERSATIONAL_REACT_DESCRIPTION

对话增强生成型

```python
from langchain.memory import ConversationBufferMemory
#记忆组件
memory = ConversationBufferMemory(
    memory_key="chat_history",
)

tools = load_tools(["serpapi","llm-math"],llm=llm)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    memory=memory,#记忆组件
    verbose=True,
)
print(agent)
print(agent.agent.llm_chain.prompt.template)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d3558db0fd9eca4369d665fb945a6356.png)

```python
agent.run("hi i am JavaEdge")
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d03f63e3124715d9bedf21ab069b1b09.png)

```python
agent.run("what is my name?")
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/6aad26a620cd6fee9d5c001a5396b918.png)

```python
agent.run("有什么好吃的中国菜可以推荐给我吗?")
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/f08d14ad21f36656938a845b663569ba.png)

```python
agent.run(input="我都没吃过！我名字的最后一个字母是什么？1998年的世界杯谁夺冠了？")
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7703e26f80d9f7fbd3fc8fba6adb7bea.png)

## 5 STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION

结构化对话生成增强型

```python
from langchain.memory import ConversationBufferMemory
#记忆组件
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
)
tools = load_tools(["serpapi","llm-math"],llm=llm)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
    memory=memory,#记忆组件
    handle_parsing_errors=True,
    verbose=True,
)
print(agent)
print(agent.agent.llm_chain.prompt.messages[0].prompt.template)
print(agent.agent.llm_chain.prompt.messages[1].prompt.template)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/c90e6821165da540f3311af5385e62a7.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/0be9c5a29dd9a3b0596ed846e202cbc8.png)