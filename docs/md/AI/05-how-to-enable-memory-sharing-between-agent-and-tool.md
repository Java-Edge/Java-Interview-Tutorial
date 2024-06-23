# 05-如何实现agent和tool之间共享记忆



工具类只能只读 memory。

## 0 在agent与tool之间共享记忆

- 自定义一个工具用来LLMChain来总结内容
- 使用readonlymemory来共享记忆
- 观察共享与不共享的区别

## 1 创建一条链来总结对话

```python
template = """以下是一段AI机器人和人类的对话:
{chat_history}
根据输入和上面的对话记录写一份对话总结.
输入: {input}"""

prompt = PromptTemplate(
    input_variables=["input","chat_history"],
    template=template,
)

memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
)
readonlymemory = ReadOnlySharedMemory(memory=memory)
summary_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=True,
    memory=readonlymemory,
)
```

## 2 构建工具

```python
#搜索工具
search = SerpAPIWrapper()
#总结工具
def SummaryChainFun(history):
    print("\n==============总结链开始运行==============")
    print("输入历史: ",history)
    summary_chain.run(history)

tools = [
    Tool(
        name="Search",
        func=search.run,
        description="当需要了解实时的信息或者你不知道的事时候可以使用搜索工具",
    ),
    Tool(
        name="Summary",
        func=SummaryChainFun,
        description="当你被要求总结一段对话的时候可以使用这个工具，工具输入必须为字符串，只在必要时使用",
    ),
]
print(tools)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/b2fa17bfc77cf914d1c597512c63e63a.png)

## 3 创建记忆组件

```python
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
)
```

## 4 创建agent

```python
agent_chain = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    handle_parsing_errors=True,
    memory=memory,
)
```

```python
print(agent_chain.agent.llm_chain.prompt.template)
```

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240618131457570.png)

```python
agent_chain.run(input="美国第45任总统是谁?")
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/fa2456d2491e0e7fb1a5fddd852dce5a.png)

```python
agent_chain.run(input="他的夫人叫什么名字?")
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7e26f479bc05e80afe332a74c30e1c5c.png)

```python
print(agent_chain.memory.buffer)
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/edfffd21c4ab8042703224c154064996.png)

```python
agent_chain.run(input="我们都聊了什么？")
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/bad49b44b70676cd06e893f0aecc6814.png)

```python
agent_chain.run(input="帮我总结下目前的对话内容，给我5岁的儿子看看")
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/96bcebc64cab354166a7c5922dde135a.png)

```python
print(agent_chain.memory.buffer)
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/df9a2fb021596c9fcd02d21b60a0ce39.png)