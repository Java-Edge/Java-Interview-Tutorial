# 11-LCEL记忆的添加方式

```python
from operator import itemgetter

from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "你是一个乐于助人的机器人"),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ]
)

memory = ConversationBufferMemory(return_messages=True)

memory.load_memory_variables({})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/888862a225b127453f77c9c7cb444564.png)

## 1 增加一条链

```python
chain = (
    RunnablePassthrough.assign(
        history=RunnableLambda(memory.load_memory_variables) | itemgetter("history")
    )
    | prompt
    | model
)

inputs = {"input": "你好我是JavaEdge"}
response = chain.invoke(inputs)
response
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/ff2309e91c2d24c89c5a362696adf116.png)

```python
inputs = {"input": "我叫什么名字?"}
response = chain.invoke(inputs)
response
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/63be04dde9f9f8d43f4a56c72f8056b0.png)

关闭会话就没了，就需要长久记忆存储。

## 2 使用Redis来实现长时记忆

```python
! pip install redis
```

```python
from typing import Optional

from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_community.chat_models import ChatOpenAI
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "你是一个擅长{ability}的助手"),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    #使用redis存储聊天记录
    lambda session_id: RedisChatMessageHistory(session_id, url="redis://localhost:6379/0"),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
#每次调用都会保存聊天记录，需要有对应的session_id
chain_with_history.invoke(
    {"ability": "历史", "question": "中国建都时间最长的城市是哪个?"},
    config={"configurable": {"session_id": "JavaEdge"}},
)
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/af383e2a5906e6d13edebfdce3372ab8.png)

```python
chain_with_history.invoke(
    {"ability": "历史", "question": "它有多少年建都历史？"},
    config={"configurable": {"session_id": "JavaEdge"}},
)
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/e5ab4a6e59dd37e9f56a7357b8dec141.png)

聊天记录都存下来了：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7cdf8430b8827f803c18698ea5f0c348.png)