# 02-LangChain实战：用prompts模板调教LLM的输入出

超越chatGPT:学习使用prompts模板来调教LLM的输入输出，打造自己版本的"贾维斯"

## 1 Model I/O：LLM的交互接口

任何语言模型应用程序的核心要素都是......模型。LangChain 为您提供了与任何语言模型连接的构件。

![](https://python.langchain.com/v0.1/assets/images/model_io-e6fc0045b7eae0377a4ddeb90dc8cdb8.jpg)

即 Prompts -> Language models -> Output parsers。

## 2 基于prompts模板的输入工程

prompts模板：更加高级和灵活的提示词工程。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/f8d777be29f57cd712861204b0e2c9af.png)

### 2.1 优秀的提示词

【立角色】：引导Al进入具体场景，赋予其行家身份

【述问题】：告诉AI你的困惑和问题及背景信息

【定目标】：告诉AI你的需求，希望达成的目标

【补要求】：告诉AI回答时注意什么，或者如何回复

### 2.2 提示词模版

- 将提示词提炼成模板
- 实现提示词的复用、版本管理、动态变化等

### 2.3 提示词模版实战

#### 2.3.1 字符串模板-PromptTemplate



```python
from langchain.prompts import PromptTemplate

prompt = PromptTemplate.from_template("你是一个{name},帮我起1个具有{county}特色的{sex}名字")
prompt.format(name="算命大师",county="法国",sex="女孩")
```

#### 2.3.2 聊天模板-ChatPromptTemplate

直接构造一个完整 list

```python
# 对话模板具有结构，chatmodels
from langchain.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        ("system", "你是一个起名大师. 你的名字叫{name}."),
        ("human", "你好{name},你感觉如何？"),
        ("ai", "你好！我状态非常好!"),
        ("human", "你叫什么名字呢?"),
        ("ai", "你好！我叫{name}"),
        ("human", "{user_input}"),
    ]
)

chat_template.format_messages(name="陈大师", user_input="你的爸爸是谁呢?")
```

或者一个个构造，最后再合并

```python
from langchain.schema import SystemMessage
from langchain.schema import HumanMessage
from langchain.schema import AIMessage

# 直接创建消息
sy = SystemMessage(
  content="你是一个起名大师",
  additional_kwargs={"大师姓名": "陈瞎子"}
)

hu = HumanMessage(
  content="请问大师叫什么?"
)
ai = AIMessage(
  content="我叫陈瞎子"
)
[sy,hu,ai]
```

LangChain 已经将这些角色都提供了模板：

```python
from langchain.prompts import AIMessagePromptTemplate
from langchain.prompts import SystemMessagePromptTemplate
from langchain.prompts import HumanMessagePromptTemplate
from langchain.prompts import ChatMessagePromptTemplate
```

看示例：

```python
from langchain.prompts import ChatMessagePromptTemplate

prompt = "愿{subject}与你同在！"

chat_message_prompt = AIMessagePromptTemplate.from_template(template=prompt)
chat_message_prompt.format(subject="原力")

chat_message_prompt = ChatMessagePromptTemplate.from_template(role="天行者",template=prompt)
chat_message_prompt.format(subject="原力")
```

#### 2.3.3 自定义模板

```python
##函数大师：根据函数名称，查找函数代码，并给出中文的代码说明

from langchain.prompts import StringPromptTemplate


# 定义一个简单的函数作为示例效果
def hello_world(abc):
    print("Hello, world!")
    return abc


PROMPT = """\
你是一个非常有经验和天赋的程序员，现在给你如下函数名称，你会按照如下格式，输出这段代码的名称、源代码、中文解释。
函数名称: {function_name}
源代码:
{source_code}
代码解释:
"""

import inspect


def get_source_code(function_name):
    #获得源代码
    return inspect.getsource(function_name)

#自定义的模板class
class CustomPrompt(StringPromptTemplate):

    
    def format(self, **kwargs) -> str:
        # 获得源代码
        source_code = get_source_code(kwargs["function_name"])

        # 生成提示词模板
        prompt = PROMPT.format(
            function_name=kwargs["function_name"].__name__, source_code=source_code
        )
        return prompt

a = CustomPrompt(input_variables=["function_name"])
pm = a.format(function_name=hello_world)

print(pm)

#和LLM连接起来
from langchain.llms import OpenAI
import os
api_base = os.getenv("OPENAI_PROXY")
api_key = os.getenv("OPENAI_API_KEY")

llm = OpenAI(
    model="gpt-3.5-turbo-instruct",
    temperature=0,
    openai_api_key=api_key,
    openai_api_base=api_base
    )
msg = llm.predict(pm)
print(msg)
```

#### 2.3.4 使用jinji2与f-string来实现提示词模板格式化

f-string是python内置的一种模板引擎

```python
from langchain.prompts import PromptTemplate

fstring_template = """
给我讲一个关于{name}的{what}故事
"""

prompt = PromptTemplate.from_template(fstring_template)

prompt.format(name="翠花", what="悲伤")
```

#### 2.3.5 组合式提示词模板

- Final prompt: 最终返回的提示词模板
- Pipeline prompts：组成提示词管道的模板

```python
from langchain.prompts.pipeline import PipelinePromptTemplate
from langchain.prompts.prompt import PromptTemplate
```

三层提示词设计：

```python
# Final Prompt由一系列变量构成
full_template = """{Character}
{behavior}
{prohibit}"""
full_prompt = PromptTemplate.from_template(full_template)
```

第一层基本性格设计：

```python
Character_template = """你是{person}，你有着{xingge}."""
Character_prompt = PromptTemplate.from_template(Character_template)
```

第二层行为设计：

```python
behavior_template = """你遵从以下的行为:
{behavior_list}
"""
behavior_prompt = PromptTemplate.from_template(behavior_template)
```

第三层不允许的行为：

```python
prohibit_template = """你不允许有以下行为:
{prohibit_list}
"""
prohibit_prompt = PromptTemplate.from_template(prohibit_template)
```

将三层提示词组合起来：

```python
input_prompts = [
    ("Character", Character_prompt),
    ("behavior", behavior_prompt),
    ("prohibit", prohibit_prompt)
]
pipeline_prompt = PipelinePromptTemplate(final_prompt=full_prompt, pipeline_prompts=input_prompts)
```

打印下组合后模板里的可传递参数：

```python
pipeline_prompt.input_variables
```

```python
pm = pipeline_prompt.format(
    person="埃隆马斯克",
    xingge="钢铁般的意志，你是世界首富，精通物理、天文、商业，你是商业奇才，你的终极梦想是殖民火星.",
    behavior_list="1.你喜欢冒险 \n 2.你非常崇拜爱因斯坦 \n 3.你总是乐于助人，回答用户各种问题.",
    prohibit_list="1.你不可以说自己是一个人工智能助手或者机器人 \n 2.当你不知道答案的时候，可以说让我再想想. "
)
print(pm)
```

执行结果：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/da45aac257e475ccd99e634d5a5d4775.png)

### 2.4 序列化：使用文件管理提示词模板

- 便于共享
- 便于版本管理
- 便于存储
- 支持常见格式(json/yaml/txt)

#### 一个提示词模板

simple_prompt.yaml：

```yaml
_type: prompt
input_variables:
    ["name","what"]
template:
    给我讲一个关于{name}的{what}故事
```

simple_prompt.json：

```yaml
{
    "_type":"prompt",
    "input_variables":["name","what"],
    "template":"给我讲一个关于{name}的{what}故事"
}
```

```python
from langchain.prompts import load_prompt
```

```python
#加载yaml格式的prompt模版
prompt = load_prompt("simple_prompt.yaml")
print(prompt.format(name="小黑",what="恐怖的"))
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/c967c952e9f17632703ea36df2ecc4b4.png)

```python
#加载json格式的prompt模版
prompt = load_prompt("simple_prompt.json")
print(prompt.format(name="小红",what="搞笑的"))
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/a1b472fcf0081b52546c673c9f636b19.png)

支持加载文件格式的模版，并且对prompt的最终解析结果进行自定义格式化

```python
prompt = load_prompt("prompt_with_output_parser.json")
prompt.output_parser.parse(
    "George Washington was born in 1732 and died in 1799.\nScore: 1/2"
)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/f0df4ca2007c2c6f57ec52f0baba830d.png)

参考：

- https://python.langchain.com/v0.1/docs/modules/model_io/