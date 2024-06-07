# 04-LLMs和Chat Models

## 1 模型

来看两种不同类型的模型--LLM 和聊天模型。然后，它将介绍如何使用提示模板来格式化这些模型的输入，以及如何使用输出解析器来处理输出。

LangChain 中的语言模型有两种类型：

### 1.1 Chat Models

聊天模型通常由 LLM 支持，但专门针对会话进行了调整。提供者 API 使用与纯文本补全模型不同的接口。它们的输入不是单个字符串，而是聊天信息列表，输出则是一条人工智能信息。

> GPT-4 和 Anthropic 的 Claude-2 都是作为聊天模型实现的。

### 1.2 LLM

LangChain 中的 LLM 指的是纯文本补全模型。它们封装的 API 将字符串提示作为输入，并输出字符串完成。OpenAI 的 GPT-3 就是作为 LLM 实现的。

这两种 API 类型具有不同的输入和输出模式。并非所有模型都一样。不同的模型有不同的最佳提示策略。如：

- Anthropic 模型最适合使用 XML
- OpenAI 的模型最适合使用 JSON

设计应用程序时牢记这点。示例将使用聊天模型，并提供几种选择：使用 Anthropic 或 OpenAI 等 API，或通过 Ollama 使用本地开源模型。

## 2 实例

### OpenAI与ChatOpenAI

```python
#调用chatmodels，以openai为例

from langchain.chat_models import ChatOpenAI
from langchain.schema.messages import HumanMessage,AIMessage
import os
api_base = os.getenv("OPENAI_PROXY")
api_key = os.getenv("OPENAI_API_KEY")

chat = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0,
    openai_api_key = api_key,
    openai_api_base = api_base

)

messages = [
    AIMessage(role="system",content="你好，我是tomie！"),
    HumanMessage(role="user",content="你好tomie，我是狗剩!"),
    AIMessage(role="system",content="认识你很高兴!"),
    HumanMessage(role="user",content="你知道我叫什么吗？")
]

response = chat.invoke(messages)
print(response)

#print(chat.predict("你好"))
```

## 3 流式调用

### 为啥要流式输出呢？

大模型都是一个个字打出来，免得让你觉得他每次神经网络计算太慢了，让你感觉他一直在持续输出。

```python
#LLM类大模型的流式输出方法

from langchain.llms import OpenAI
import os
api_base = os.getenv("OPENAI_PROXY")
api_key = os.getenv("OPENAI_API_KEY")

#构造一个llm
llm = OpenAI(
    model = "gpt-3.5-turbo-instruct",
    temperature=0,
    openai_api_key = api_key,
    openai_api_base = api_base,
    max_tokens=512,
)

for chunk in llm.stream("写一首关于秋天的诗歌"):
    print(chunk,end="",flush=False)
```

所以，token 就很重要了。

## 4 追踪Token的使用

```python
#LLM的toekn追踪
from langchain.llms import OpenAI
from langchain.callbacks import get_openai_callback
import os
api_base = os.getenv("OPENAI_PROXY")
api_key = os.getenv("OPENAI_API_KEY")

#构造一个llm
llm = OpenAI(
    model = "gpt-3.5-turbo-instruct",
    temperature=0,
    openai_api_key = api_key,
    openai_api_base = api_base,
    max_tokens=512,
)

with get_openai_callback() as cb:
    result = llm.invoke("给我讲一个笑话")
    print(result)
    print(cb)
```

```python
#chatmodels的token追踪
from langchain.chat_models import ChatOpenAI
from langchain.callbacks import get_openai_callback
import os
api_base = os.getenv("OPENAI_PROXY")
api_key = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(
    model = "gpt-4",
    temperature=0,
    openai_api_key = api_key,
    openai_api_base = api_base,
    max_tokens=512,
)

with get_openai_callback() as cb:
    result = llm.invoke("给我讲一个笑话")
    print(result)
    print(cb)
```

## 5 自定义输出

- 输出函数参数
- 输出json
- 输出List
- 输出日期

讲笑话机器人：希望每次根据指令，可以输出一个这样的笑话(小明是怎么死的？笨死的)

```python
from langchain.llms import  OpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from langchain.pydantic_v1 import BaseModel,Field,validator
from typing import  List
import os
api_base = os.getenv("OPENAI_PROXY")
api_key = os.getenv("OPENAI_API_KEY")

#构造LLM
model = OpenAI(
    model = "gpt-3.5-turbo-instruct",
    temperature=0,
    openai_api_key = api_key,
    openai_api_base = api_base,
)

#定义个数据模型，用来描述最终的实例结构
class Joke(BaseModel):
    setup:str = Field(description="设置笑话的问题")
    # 笑点
    punchline:str = Field(description="回答笑话的答案")

    #验证问题是否符合要求
    @validator("setup")
    def question_mark(cls,field):
        if field[-1] != "？":
            raise ValueError("不符合预期的问题格式!")
        return field

#将Joke数据模型传入
parser = PydanticOutputParser(pydantic_object=Joke)


prompt = PromptTemplate(
    template = "回答用户的输入.\n{format_instructions}\n{query}\n",
    input_variables = ["query"],
    partial_variables = {"format_instructions":parser.get_format_instructions()}
)

prompt_and_model = prompt | model
out_put = prompt_and_model.invoke({"query":"给我讲一个笑话"})
print("out_put:",out_put)
parser.invoke(out_put)
```

LLM的输出格式化成python list形式，类似['a','b','c']

```python
from langchain.output_parsers import  CommaSeparatedListOutputParser
from langchain.prompts import  PromptTemplate
from langchain.llms import OpenAI
import os
api_base = os.getenv("OPENAI_PROXY")
api_key = os.getenv("OPENAI_API_KEY")

#构造LLM
model = OpenAI(
    model = "gpt-3.5-turbo-instruct",
    temperature=0,
    openai_api_key = api_key,
    openai_api_base = api_base,
)

parser = CommaSeparatedListOutputParser()

prompt = PromptTemplate(
    template = "列出5个{subject}.\n{format_instructions}",
    input_variables = ["subject"],
    partial_variables = {"format_instructions":parser.get_format_instructions()}
)

_input = prompt.format(subject="常见的小狗的名字")
output = model(_input)
print(output)
#格式化
parser.parse(output)
```

