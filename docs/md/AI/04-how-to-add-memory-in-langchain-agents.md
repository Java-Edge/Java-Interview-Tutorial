# 04-如何给langchain-agents增加记忆

## 0 前言

在开发复杂的AI应用时,赋予Agent记忆能力是一个关键步骤。这不仅能提高Agent的性能,还能使其在多轮对话中保持上下文连贯性。本文将详细介绍如何在Langchain框架中为Agent添加记忆功能,并深入解析每个步骤的原理和最佳实践。

### Agent记忆功能的核心组件

在Langchain中，构建具有记忆功能的Agent主要涉及三个核心组件:

1. **工具(Tools)**: Agent用来执行特定任务的功能模块。
2. **记忆(Memory)**: 存储和检索对话历史的组件。
3. **大语言模型(LLM)**: 负责理解输入、决策和生成响应的核心智能体。

这三个组件的协同工作使Agent能够在多轮对话中保持连贯性并做出明智的决策。

## 1 构建Agent可用工具

首先,我们需要定义Agent可以使用的工具。

```python
# 构建一个搜索工具，Langchain提供的一个封装,用于进行网络搜索。
search = SerpAPIWrapper()
# 创建一个数学计算工具，特殊的链,它使用LLM来解析和解决数学问题。
llm_math_chain = LLMMathChain(
    llm=llm,
    verbose=True
)
tools = [
    Tool(
        name = "Search",
        func=search.run,
        description="useful for when you need to answer questions about current events or the current state of the world"
    ),
    Tool(
        name="Calculator",
        func=llm_math_chain.run,
        description="useful for when you need to answer questions about math"
    ),
]
print(tools)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/5d9e55e37c886ec71c107167782ea801.png)

## 2 增加memory组件

接下来,我们需要为Agent添加记忆功能。Langchain提供了多种记忆组件,这里我们使用`ConversationBufferMemory`:

```python
from langchain.memory import ConversationBufferMemory

# 记忆组件
memory = ConversationBufferMemory(
    # 指定了存储对话历史的键名
    memory_key="chat_history",
  	# 确保返回的是消息对象,而不是字符串,这对于某些Agent类型很重要
    return_messages=True
)
```

## 3 定义agent

现在我们有了工具和记忆组件,可以初始化我们的Agent了:

```python
from langchain.agents import AgentType, initialize_agent

agent_chain = initialize_agent(
    tools, 
    llm, 
    agent=AgentType.OPENAI_FUNCTIONS, 
    verbose=True, 
    handle_parsing_errors=True,
    memory=memory
)
```

这里的关键点是:

- `AgentType.OPENAI_FUNCTIONS`: 这种Agent类型特别适合使用OpenAI的function calling特性。
- `verbose=True`: 启用详细输出,有助于调试。
- `handle_parsing_errors=True`: 自动处理解析错误,提高Agent的稳定性。
- `memory=memory`: 将我们之前定义的记忆组件传递给Agent。



## 4 查看默认的agents prompt啥样

了解Agent使用的默认提示词模板非常重要,这有助于我们理解Agent的行为并进行必要的调整：

```python
print(agent_chain.agent.prompt.messages)
print(agent_chain.agent.prompt.messages[0])
print(agent_chain.agent.prompt.messages[1])
print(agent_chain.agent.prompt.messages[2])
```

这将输出Agent使用的默认提示词模板。通常包括系统消息、人类消息提示词模板和AI消息模板。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/b59551d90be5681c18a2af7d66c64442.png)

## 5 优化Agent配置

为了更好地利用记忆功能,我们需要修改Agent的配置,确保它在每次交互中都能访问对话历史。

需要使用agent_kwargs传递参数，将chat_history传入

```python
agent_chain = initialize_agent(
    tools, 
    llm, 
    agent=AgentType.OPENAI_FUNCTIONS, 
    verbose=True, 
    handle_parsing_errors=True,#处理解析错误
    agent_kwargs={
        "extra_prompt_messages":[MessagesPlaceholder(variable_name="chat_history"),MessagesPlaceholder(variable_name="agent_scratchpad")],
    },
    memory=memory #记忆组件
    )
```

这里的关键改变是:

- `agent_kwargs`: 通过这个参数,我们可以自定义Agent的行为

- extra_prompt_messages：我们添加了两个MessagesPlaceholder：

  - `chat_history`: 用于插入对话历史。
  - `agent_scratchpad`: 用于Agent的中间思考过程。

这样配置确保了Agent在每次决策时都能考虑到之前的对话内容。



## 6 验证优化后的提示词模板

最后,让我们检查一下优化后的提示词模板:

```python
print(agent_chain.agent.prompt.messages)
print(agent_chain.agent.prompt.messages[0])
print(agent_chain.agent.prompt.messages[1])
print(agent_chain.agent.prompt.messages[2])
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/fda63c82dfa231f54db0bebb44042ef5.png)

能看到新添加的`chat_history`和`agent_scratchpad`占位符。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/e58ebfbbe5d3ad195bee9aa6621f3f12.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/301deba253782403ea403bc8a6d2bce7.png)

## 7 总结

通过以上步骤,我们成功地为Langchain Agent添加了记忆功能。这使得Agent能够在多轮对话中保持上下文连贯性,大大提高了其在复杂任务中的表现。

添加记忆功能只是构建高效Agent的第一步。在实际应用中,你可能需要根据具体需求调整记忆组件的类型和参数,或者实现更复杂的记忆管理策略。

始终要注意平衡记忆的深度和Agent的响应速度。过多的历史信息可能会导致决策缓慢或偏离主题。因此,在生产环境中,你可能需要实现某种形式的记忆修剪或总结机制。