# 09-lcel-chain-and-prompt-implementation

## Prompt+LLM

基本构成： 
PromptTemplate / ChatPromptTemplate -> LLM / ChatModel -> OutputParser

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("给我讲一个关于{foo}的笑话")
model = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)
chain = prompt | model
```

```python
chain.invoke({"foo": "狗熊"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/eb6f36588770b1203efd3242d9c9eec5.png)

## 自定义停止输出符

```python
chain = prompt | model.bind(stop=["\n"])
```

```python
chain.invoke({"foo": "狗熊"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/9e3f3622dd531c36a7439ea06315ceb4.png)

## 兼容openai函数调用的方式

```python
functions = [
    {
        "name": "joke",
        "description": "讲笑话",
        "parameters": {
            "type": "object",
            "properties": {
                "setup": {"type": "string", "description": "笑话的开头"},
                "punchline": {
                    "type": "string",
                    "description": "爆梗的结尾",
                },
            },
            "required": ["setup", "punchline"],
        },
    }
]
chain = prompt | model.bind(function_call={"name": "joke"}, functions=functions)
```

```python
chain.invoke({"foo": "男人"}, config={})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/f4f2f7b548bc00a827302fdc38a44f92.png)

## 输出解析器

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()
```

```python
chain.invoke({"foo": "女人"})
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/5d1e9a9d7e6fd77fcc42fe5fc8c6dc50.png)

## 与函数调用混合使用

```python
from langchain.output_parsers.openai_functions import JsonOutputFunctionsParser

chain = (
    prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonOutputFunctionsParser()
)
```

```python
chain.invoke({"foo": "女人"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/271ff583549eb52fd0163b52411ade58.png)

```python
#只输出setup
from langchain.output_parsers.openai_functions import JsonKeyOutputFunctionsParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

chain = (
    {"foo": RunnablePassthrough()} #使用RunnablePassthrough()跳过prompt
    | prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="punchline") # 定义输出的key
)
```

```py
#chain.invoke({"foo": "女人"})
#使用RunnablePassthrough()跳过prompt
chain.invoke("女人")
```

## 使用Runnables来连接多链结构

```python
from operator import itemgetter #获取可迭代对象中指定索引或键对应的元素

from langchain.schema import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt1 = ChatPromptTemplate.from_template("{person}来自于哪个城市?")
prompt2 = ChatPromptTemplate.from_template(
    "{city}属于哪个省? 用{language}来回答"
)

model = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)

chain1 = prompt1 | model | StrOutputParser()

chain2 = (
    {"city": chain1, "language": itemgetter("language")} #获取invoke中的language
    | prompt2
    | model
    | StrOutputParser()
)
chain1.invoke({"person": "马化腾"})
#chain2.invoke({"person": "马化腾", "language": "中文"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d5515677bcc74915fdc403ba339e3e3e.png)

```python
from langchain_core.runnables import RunnablePassthrough

prompt1 = ChatPromptTemplate.from_template(
    "生成一个{attribute}属性的颜色。除了返回这个颜色的名字不要做其他事:"
)
prompt2 = ChatPromptTemplate.from_template(
    "什么水果是这个颜色:{color},只返回这个水果的名字不要做其他事情:"
)
prompt3 = ChatPromptTemplate.from_template(
    "哪个国家的国旗有这个颜色:{color},只返回这个国家的名字不要做其他事情:"
)
prompt4 = ChatPromptTemplate.from_template(
    "有这个颜色的水果是{fruit},有这个颜色的国旗是{country}？"
)

model_parser = model | StrOutputParser()
# 生成一个颜色
color_generator = (
    {"attribute": RunnablePassthrough()} | prompt1 | {"color": model_parser}
)
color_to_fruit = prompt2 | model_parser
color_to_country = prompt3 | model_parser
question_generator = (
    color_generator | {"fruit": color_to_fruit, "country": color_to_country} | prompt4
)
```

```python
question_generator.invoke("强烈的")
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/9716d17b47c89565c73a1f3d1313f552.png)

## 多链执行与结果合并

```python
     输入
     / \
    /   \
分支1   分支2
    \   /
     \ /
   合并结果
```

## 唯物辩证链

```python
planner = (
    ChatPromptTemplate.from_template("生成一个关于{input}的论点")
    | ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)
    | StrOutputParser()
    | {"base_response": RunnablePassthrough()}
)

arguments_for = (
    ChatPromptTemplate.from_template(
        "列出以下内容的优点或积极方面:{base_response}"
    )
    | ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)
    | StrOutputParser()
)
arguments_against = (
    ChatPromptTemplate.from_template(
        "列出以下内容的缺点或消极方面:{base_response}"
    )
    | ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)
    | StrOutputParser()
)

final_responder = (
    ChatPromptTemplate.from_messages(
        [
            ("ai", "{original_response}"),
            ("human", "积极:\n{results_1}\n\n消极:\n{results_2}"),
            ("system", "根据评论生成最终的回复"),
        ]
    )
    | ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)
    | StrOutputParser()
)

chain = (
    planner
    | {
        "results_1": arguments_for,
        "results_2": arguments_against,
        "original_response": itemgetter("base_response"),
    }
    | final_responder
)
```

```python
chain.invoke({"input": "生个牛马"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/631cec13e7617885b28e72b3b00271de.png)

## 查询SQL

```python
from langchain_core.prompts import ChatPromptTemplate

template = """Based on the table schema below, write a SQL query that would answer the user's question:
{schema}

Question: {question}
SQL Query:"""
prompt = ChatPromptTemplate.from_template(template)
```

```python
from langchain_community.utilities import SQLDatabase
db = SQLDatabase.from_uri("sqlite:///Chinook.db")
```

```python
db.get_table_info()
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/518a2e0ab1d6ea4044d2ceaab38f44cb.png)



```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)

def get_schema(_):
    return db.get_table_info()



sql_response = (
  	# RunnablePassthrough 本身允许你在不改变输入的情况下传递数据。它通常与 RunnableParallel 结合使用，将数据传递到Map中的新键
    RunnablePassthrough.assign(schema=get_schema)
    | prompt
    | model.bind(stop=["\nSQLResult:"])
    | StrOutputParser()
)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/714070c3e1d8db7c0ab4ce3eb48839c7.png)

不对，重新触发生成：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d28be40600ccbf19054d332e996c7c28.png)

```python
def run_query(query):
    print(query)
    return db.run(query)

template = """Based on the table schema below, question, sql query, and sql response, write a natural language response:
{schema}

Question: {question}
SQL Query: {query}
SQL Response: {response}"""
prompt_response = ChatPromptTemplate.from_template(template)

full_chain = (
    RunnablePassthrough.assign(query=sql_response).assign(
        schema=get_schema,
        response=lambda x: db.run(x["query"]),
    )
    | prompt_response
    | model
)
```

```python
full_chain.invoke({"question": "How many artists are there?"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/fff786b7ac78c7b21d616ed2e8dfae5c.png)

## 自定义输出解析器

### python编程助手



~~~python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import (
    ChatPromptTemplate,
)
from langchain_experimental.utilities import PythonREPL
from langchain_openai import ChatOpenAI

template = """根据用户需求帮助用户编写python代码. 

只需要返回markdown格式的python代码, 比如:

```python
....
```"""
prompt = ChatPromptTemplate.from_messages([("system", template), ("human", "{input}")])

model = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)

#自定义输出解析，只返回python代码
def _sanitize_output(text: str):
    _, after = text.split("```python")
    return after.split("```")[0]

#定义链
chain = prompt | model | StrOutputParser() | _sanitize_output | PythonREPL().run
~~~

```python
chain.invoke({"input": "10以内的偶数"})
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/f20bba10c6e23ac26e592610fdaa398d.png)