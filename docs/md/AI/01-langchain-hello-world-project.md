# 01-LangChain的Hello World项目

## 1 创建一个LLM

- 自有算力平台+开源大模型（需要有庞大的GPU资源）企业自己训练数据
- 第三方大模型API（openai/千问...）数据无所谓

让LLM给孩子起具有中国特色的名字。

在LangChain中最基本的功能就是根据文本提示来生成新的文本

使用方法：predict

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/05/f73160fcf640d0a8442f2ba359849b33.png)

生成结果根据你调用的模型不同而会产生非常不同的结果差距，并且你的模型的tempurature参数也会直接影响最终结果（即LLM的灵敏度）。

## 2 自定义提示词模版

- 将提问的上下文模版化
- 支持参数传入

让LLM给孩子起**具有美国**特色的名字。

将提示词模版化后会产生很多灵活多变的应用，尤其当它支持参数定义时。

### 使用方法

langchain.prompts

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/2a7d027db8d1fdc9f74fdd3ea4a44905.png)

## 3 输出解释器

- 将LLM输出的结果各种格式化
- 支持类似json等结构化数据输出

让LLM给孩子起4个有中国特色的名字，并以数组格式输出而不是文本。

与chatGPT只能输出文本不同，langchain允许用户自定义输出解释器，将生成文本转化为序列数据使用方法：

langchain.schema



### 第一个实例

让LLM以人机对话的形式输出4个名字

名字和性别可以根据用户输出来相应输出

输出格式定义为数组

## 4 开始运行

### 4.1 引入openai key

设置环境变量：

```python
import os
os.environ["OPENAI_API_KEY"] = "xxx"
# 为了科学上网，所以需要添加
os.environ["OPENAI_PROXY"] = "xxx"
```

从环境变量读取：

```python
import openai
import os
openai.api_base =os.environ.get("OPENAI_PROXY")
openai.api_key = os.environ.get("OPENAI_API_KEY")
print("OPENAI_API_KEY:", openai_api_key)
print("OPENAI_PROXY:", openai_api_base)
```

### 4.2 运行前查看下安装情况

```bash
! pip show langchain
! pip show openai

3318.50s - pydevd: Sending message related to process being replaced timed-out after 5 seconds
Name: langchain
Version: 1.2.7
Summary: Building applications with LLMs through composability
Home-page: https://docs.langchain.com/
Author: 
Author-email: 
License: MIT
Location: /Users/javaedge/soft/PyCharmProjects/AIAgent/.venv/lib/python3.11/site-packages
Requires: langchain-core, langgraph, pydantic
Required-by: scrapegraphai
3323.94s - pydevd: Sending message related to process being replaced timed-out after 5 seconds
Name: openai
Version: 2.32.0
Summary: The official Python library for the openai API
Home-page: https://github.com/openai/openai-python
Author: 
Author-email: OpenAI <support@openai.com>
License: Apache-2.0
Location: /Users/javaedge/soft/PyCharmProjects/AIAgent/.venv/lib/python3.11/site-packages
Requires: anyio, distro, httpx, jiter, pydantic, sniffio, tqdm, typing-extensions
Required-by: langchain-openai, qwen-agent
```

### 4.3 openai 官方SDK

```python
llm = create_qwen_model(
    temperature=1,
    streaming=True,
)
res = llm.generate([[HumanMessage(content="介绍下你自己")]])

print(res.generations[0][0].text)
```

### 4.4 使用langchain调用

```python
from langchain.llms import OpenAI
import os

api_base =os.environ.get("OPENAI_PROXY")
api_key = os.environ.get("OPENAI_API_KEY")

llm = OpenAI(
    model="gpt-3.5-turbo",
    temperature=0,
    openai_api_key=api_key,
    openai_api_base=api_base
    )
llm.predict("介绍下你自己")
```

### 4.5 起名大师

```python
llm = create_qwen_model(
    temperature=1,
    streaming=True,
)
prompt = PromptTemplate.from_template("你是一个起名大师,请模仿示例起3个{county}名字,比如男孩经常被叫做{boy},女孩经常被叫做{girl}")
message = prompt.format(county="中国特色的",boy="狗蛋",girl="翠花")
print(message)
res = llm.generate([[HumanMessage(content=message)]])
print(res.generations[0][0].text)
```

### 格式化输出

```python
from langchain.schema import BaseOutputParser
#自定义class，继承了BaseOutputParser
class CommaSeparatedListOutputParser(BaseOutputParser):
    """Parse the output of an LLM call to a comma-separated list."""


    def parse(self, text: str):
        """Parse the output of an LLM call."""
        return text.strip().split(", ")

CommaSeparatedListOutputParser().parse("hi, bye")
```

```
['hi', 'bye']
```

### 完整案例

```python
#起名大师，输出格式为一个数组
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
import os
from langchain.schema import BaseOutputParser

#自定义类
class CommaSeparatedListOutputParser(BaseOutputParser):
    """Parse the output of an LLM call to a comma-separated list."""

    def parse(self, text: str):
        """Parse the output of an LLM call."""
        print(text)
        return text.strip().split(",")


api_base = os.getenv("OPENAI_API_BASE")
api_key = os.getenv("OPENAI_KEY")
llm = OpenAI(
    model="gpt-3.5-turbo-instruct",
    temperature=0,
    openai_api_key=api_key,
    openai_api_base=api_base
    )
prompt = PromptTemplate.from_template("你是一个起名大师,请模仿示例起3个具有{county}特色的名字,示例：男孩常用名{boy},女孩常用名{girl}。请返回以逗号分隔的列表形式。仅返回逗号分隔的列表，不要返回其他内容。")
message = prompt.format(county="美国男孩",boy="sam",girl="lucy")
print(message)
strs = llm.predict(message)
CommaSeparatedListOutputParser().parse(strs)
```

```bash
['jack', ' michael', ' jason']
```