# 07 LCEL-langchain-expression-language

一种在langchain之上封装的高级解释语言，简化链条开发，支持真实生产环境而发明。

- 更好的流式支持
- 更好的异步支持
- 优化执行时间
- 支持重试和反馈
- 轻松获取中间步骤
- 输入输出强验证
- 无缝追踪集成
- 无缝部署集成

SEO Meta-title: 在Langchain之上封装的高级解释语言：简化链条开发，支持生产环境

Meta-description: 了解如何在Langchain上使用高级解释语言，提升流式支持、异步支持、优化执行时间及支持重试和反馈。

Slug: langchain-advanced-explanation-language

Excerpt: 探索一种在Langchain之上封装的高级解释语言，简化链条开发，提供更好的流式和异步支持，优化执行时间，并支持重试和反馈，完美适用于真实生产环境。

------



## Runnable接口

为了方便自定义链，创造了Runnable协议它适用于大多数组件，是一个标准接口，可以轻松地定义自定义链并以标准方式调用它们。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/0e9b8d2cb399bf676719b87758805460.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/bf3bddea27042d134f337a2b902f3d96.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d2744a54890eb61e1aa9c929ddb0f908.png)

prompt 核心组件：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/33d7d7a1bce1ba51fcd83a6fd011af28.png)

- Prompt+LLM
- RAG
- SQL查询
- Agents
- Chains
- 添加记忆
- 使用工具
- 道德审查
- 管理提示词
- 代码小助手

## 案例

```python
# 定义llm
class QwenTurboTongyi(Tongyi):
    model_name = "qwen-turbo"
llm = QwenTurboTongyi(
    model_name="qwen-turbo",
    temperature=1,
    streaming=True
)
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("给我讲一个关于 {topic}的笑话")
output_parser = StrOutputParser()

chain = prompt | llm | output_parser

chain.invoke({"topic": "JavaEdge"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/3e9f8473f655f6423bedd3bebb3b2b15.png)

### Prompt

```python
prompt_value = prompt.invoke({"topic": "刺猬"})
prompt_value
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/551d0e029be6230b0aa0e3fba4a25d82.png)

```python
prompt_value.to_messages()
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/848fdfca7688d8b09653c06c90f33a2f.png)

```python
prompt_value.to_string()
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/e2a4d0e79f591726ac107dff0b253775.png)

## LCEL的Pipeline



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/a0f71a638413dfe6841d395ffa80bec3.png)

## 兼容 OpenAI 接口的通义千问

```python
from openai import OpenAI
import os

def get_response():
    client = OpenAI(
        api_key=os.getenv("DASHSCOPE_API_KEY"),
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",# DashScope SDK的base_url
    )
    completion = client.chat.completions.create(
        model="qwen-plus",
        messages=[{'role': 'system', 'content': 'You are a helpful assistant.'},
                  {'role': 'user', 'content': '你是谁？'}]
    )
    print(completion.model_dump_json())

if __name__ == '__main__':
    get_response()
```

输出：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/189ab561f4e6828fe6c2a8e24b1d32c0.png)

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)
prompt = ChatPromptTemplate.from_template("给我讲一个关于{topic}的笑话")
chain = prompt | model
```

### input schema

```python
# prompt
# 打印输入数据的模式，也就是输入数据应该是什么样的格式
chain.input_schema.schema()
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/eda13f5d61521fcc8c6ad28ef83a156a.png)

```python
# 查看输入数据模式的函数
prompt.input_schema.schema()
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/018e9fb5a69c2019ee64703b2b0b30a3.png)

```python
model.input_schema.schema()
```

### Output Schema

```python
# The output schema of the chain is the output schema of its last part, in this case a ChatModel, which outputs a ChatMessage
chain.output_schema.schema()
```

### Stream（流式）

类似 chatgpt 的不断输出的体验：

```python
for s in chain.stream({"topic": "熊"}):
    print(s.content, end="", flush=True)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/e1604eff9d300f81564bce0bd8e69829.png)

### Invoke

就需要全部运行完才输出，给人感觉就很慢：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/059c01c82581b41bd9c3f2b7cfc8a551.png)

### Batch

```python
chain.batch([{"topic": "熊"}, {"topic": "猫"}])
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d354b3cea19df8bf43b6ca5987809667.png)

```python
# max_concurrency控制并发数
chain.batch([{"topic": "熊"}, {"topic": "猫"}, {"topic": "狗"}], config={"max_concurrency": 5})
```

### Async Stream 异步

```python
async for s in chain.astream({"topic": "女人"}):
    print(s.content, end="", flush=True)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/63c383f3106eb2c186a4ab19401a7958.png)

```python
await chain.ainvoke({"topic": "男人"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/42f76290e081e266c158428fb932ff19.png)

### Async Batch

```python
await chain.abatch([{"topic": "熊"},{"topic": "女人"}])
```

### 异步获取中间步骤（只支持 OpenAI的 key）

### 并行支持

```python
from langchain_core.runnables import RunnableParallel

chain1 = ChatPromptTemplate.from_template("给我讲一个关于{topic}的笑话") | model
chain2 = (
    ChatPromptTemplate.from_template("写两行关于{topic}的诗歌")
    | model
)
combined = RunnableParallel(joke=chain1, poem=chain2)
```

```python
%%time
chain1.invoke({"topic": "熊"})
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/a370b497b2aeb9e86f270465dd324032.png)

### 并行执行

```python
%%time
combined.invoke({"topic": "熊"})
```

### 并行批处理，适用于大量生成

```python
%%time
chain1.batch([{"topic": "熊"}, {"topic": "猫"}])
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/a51c5e13033257832160af69f438552d.png)

### 并行执行

```python
%%time
combined.batch([{"topic": "熊"}, {"topic": "猫"}])
```

参考：

https://github.com/devinyf/langchain_qianwen

https://python.langchain.com/v0.2/docs/integrations/llms/tongyi/