# 04-如何给langchain-agents增加记忆

## 0 Agent增加记忆的正确做法

- 工具
- Memory
- LLM

## 1 构建agent可用工具

```python
#构建一个搜索工具
search = SerpAPIWrapper()
#创建一个数学计算工具
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

### 增加memory组件

```python
#记忆组件
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)
```

### 定义agent

```python
agent_chain = initialize_agent(
    tools, 
    llm, 
    agent=AgentType.OPENAI_FUNCTIONS, 
    verbose=True, 
    handle_parsing_errors=True,#处理解析错误
    memory=memory #记忆组件
    )
```

### 查看默认的agents prompt啥样

```python
print(agent_chain.agent.prompt.messages)
print(agent_chain.agent.prompt.messages[0])
print(agent_chain.agent.prompt.messages[1])
print(agent_chain.agent.prompt.messages[2])
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/b59551d90be5681c18a2af7d66c64442.png)

### 需要使用agent_kwargs传递参数，将chat_history传入

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

### 查看重新渲染后的提示词模版

```python
print(agent_chain.agent.prompt.messages)
print(agent_chain.agent.prompt.messages[0])
print(agent_chain.agent.prompt.messages[1])
print(agent_chain.agent.prompt.messages[2])
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/fda63c82dfa231f54db0bebb44042ef5.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/e58ebfbbe5d3ad195bee9aa6621f3f12.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/301deba253782403ea403bc8a6d2bce7.png)