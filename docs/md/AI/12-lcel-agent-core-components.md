# 12-LCEL-Agent核心组件

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240620163035957.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/6559bb5315f8e80c48c34288213f489c.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/8d9f7ad66d4203827ee65cd192368bad.png)

## 0 安装 hub 依赖

```python
!pip install langchainhub
```

可自己创建各种需要的 Agent [langchainhub](https://smith.langchain.com/hub?organizationId=f5b1b81c-e345-52f5-b04f-9328e27f4d23)：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/33694bca80d20a92a3de33be5e714eed.png)

## 1 第一个Agent

注意当前使用的langchain版本为0.1.4，调用方式和之前旧版本有所差异

```python
from langchain_openai import ChatOpenAI
from langchain import hub
from langchain.agents import load_tools
from langchain.agents import create_openai_functions_agent #不同的agent有不同的创建方式
from langchain.agents import AgentExecutor

#创建LLM
llm = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)

#定义agent的prompt
#https://smith.langchain.com/hub/hwchase17/openai-functions-agent
prompt = hub.pull("hwchase17/openai-functions-agent")
#定义工具,加载预制的工具,注意有的工具需要提供LLM
tools = load_tools(["llm-math"], llm=llm)
#创建agent
agent = create_openai_functions_agent(llm, tools, prompt)
#定义agent的执行器，这里注意与老版本的不同
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
agent_executor.invoke({"input": "你是谁"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/b1e521febc701c8603eb4c1b92aa4468.png)

## 2 Agent

- 中间步骤处理
- 提示词
- 模型配置(停止符必要的话)
- 输出解析器

```python
from langchain import hub
from langchain.agents import AgentExecutor, tool
from langchain.agents.output_parsers import XMLAgentOutputParser
from langchain_openai import ChatOpenAI
```

```python
#配置模型
model = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)
#可用工具
@tool
def search(query: str) -> str:
    """当需要了解最新的天气信息的时候才会使用这个工具。"""
    return "晴朗,32摄氏度,无风"
tool_list = [search]
tool_list
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/1d68094d4b56e1d1ef6b4b007e8c7e73.png)

```python
#提示词模版
# https://smith.langchain.com/hub
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/xml-agent-convo")
prompt
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/fcb0dfba228cf33ff99f06a621f70559.png)

## 3 中间步骤，实现一个log

```python
def convert_intermediate_steps(intermediate_steps):
    # 初始化一个空字符串变量 log，用于存储转换后的中间步骤信息
    log = ""
    # 遍历 intermediate_steps 中的每一个元素，该元素是一个元组，包含两个值：动作和观察
    for action, observation in intermediate_steps:
        # 将动作的工具名称和工具输入拼接成一个字符串，并在其后添加一个换行符
        log += (
            f"这是第 {intermediate_steps.index(action)+1} 步：{action.tool}</pot>"
            f""
        )
    # 返回转换后的中间步骤信息
    return log
```

```python
# 将工具列表插入到模版中
def convert_tools(tools):
    return "\n".join([f"{tool.name}: {tool.description}" for tool in tools])
```

## 4 定义agent

```python
agent = (
    # 第一个组件：将输入数据中的 "input" 字段传递给 lambda 函数
    {"input": lambda x: x["input"]},
    # 第二个组件：将输入数据中的 "intermediate_steps" 字段传递给 lambda 函数，并进行转换
    {"agent_scratchpad": lambda x: convert_intermediate_steps(x["intermediate_steps"])},
    # 第三个组件：将输入数据与 prompt 结合，使用 prompt 中的工具进行转换
    prompt.partial(tools=convert_tools(tool_list)),
    # 第四个组件：将输入数据绑定到模型，并在遇到 "</tool_input>" 或 "</final_answer>" 时停止
    model.bind(stop=["</tool_input>", "</final_answer>"]),
    # 第五个组件：将模型的输出解析为 XML 格式
    XMLAgentOutputParser()
)
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/e304f0aa1c0c368e04812dbb276482db.png)



```python
# 执行agent
agent_executor = AgentExecutor(agent=agent, tools=tool_list, verbose=True)
```

```python
agent_executor.invoke({"input": "上海今天的天气如何?"})
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/648b57ea3d0ecae0d31b630ef7d8407d.png)

## 5 agentType更新版



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/803178e471ed502d156e0e47d3e395e4.png)

## 6 一个比较复杂的agent

### 6.1 工具

#### 定义工具

```python
import os

os.environ["SERPAPI_API_KEY"] = "8a967ed100d1ffd51a6ccf42bdb474deaaa6ef4d727db979d772f93350953e98"
# Import things that are needed generically
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import BaseTool, StructuredTool, tool
from langchain_community.utilities import SerpAPIWrapper
```

```python
@tool
def search(query: str) -> str:
    """当需要查找实时信息的时候才会使用这个工具."""
    serp = SerpAPIWrapper()
    return serp.run(query)

print(search.name)
print(search.description)
print(search.args)
```

### 6.2 检索增强RAG

#### ① RAG增强生成

```python
from langchain_community.embeddings import DashScopeEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import FAISS

loader = WebBaseLoader("https://docs.smith.langchain.com/user_guide")
docs = loader.load()
print(f"Loaded {len(docs)} documents")
documents = RecursiveCharacterTextSplitter(
    chunk_size=1000, chunk_overlap=200
).split_documents(docs)

vector = FAISS.from_documents(documents, DashScopeEmbeddings())
retriever = vector.as_retriever()
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/0fac784b57bb247574e3d0ed648494f0.png)

#### ② 搜索匹配文档块

```python
retriever.get_relevant_documents("如何debug?")[0]
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/c222bc1153065da595145893ce1c1d16.png)

#### ③ 把检索器加入到工具中

```python
from langchain.tools.retriever import create_retriever_tool
retriever_tool = create_retriever_tool(
    retriever,
    "langsmith_search",
    "搜索有关 LangSmith 的信息。关于LangSmith的任何问题，你一定要使用这个工具！",
)
retriever_tool
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/598becfa9ae3f1ef76145fd31ab7539e.png)

#### ④ 可用工具集

```python
tools = [search, retriever_tool]
tools
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/75a43d005a4fb405830b4fb736ce32d5.png)



### 6.3 记忆

#### ① 定义模型

```python
from langchain_openai import ChatOpenAI
llm = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)
```

从hub中获取模版

```python
from langchain import hub

# 一个最简单的模版,带记忆
prompt = hub.pull("hwchase17/openai-functions-agent")
prompt.messages
```

说明支持历史记忆：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/4d07dfee633bd1b2a3747110a929669e.png)

创建agent

```python
from langchain.agents import create_openai_functions_agent
agent = create_openai_functions_agent(llm, tools, prompt)
```

创建agent执行器AgentExecutor

```python
from langchain.agents import AgentExecutor
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

执行

```python
agent_executor.invoke({"input": "hi!"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/37b51a8b5d99aa0f70384286b1ba3706.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/8509685872941a663659eee2b25ca121.png)

实时信息提问

```python
agent_executor.invoke({"input": "美股投资潜力如何?"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/1deda48b9edde991d0d810eec9e38e9c.png)

#### ② 前面的交互都不带记忆

```python
agent_executor.invoke({"input": "截止目前我们都聊了什么?"})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/88a868bfaec41d4f4cb215c58d2325be.png)

#### ③ 交互时添加记忆

```python
agent_executor.invoke({"input": "hi! 我叫bob", "chat_history": []})
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/ab557bc413286559fe5f6bc68b771f9c.png)

#### ④ 手动构造记忆数据

```python
from langchain_core.messages import AIMessage, HumanMessage
agent_executor.invoke(
    {
        "chat_history": [
            HumanMessage(content="hi! 我叫JavaEdge"),
            AIMessage(content="你好，JavaEdge！很高兴认识你。有什么我可以帮助你的吗？"),
        ],
        "input": "我叫什么名字?",
    }
)
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7bd6c8ad2ff25a9e90b7a70f978426dd.png)

##### 使用RunnableWithMessageHistory自动构造记忆数据

```python
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
message_history = ChatMessageHistory()
```

```python
agent_with_chat_history = RunnableWithMessageHistory(
    agent_executor,
    #注意此处session_id没有用到，因为我们没用类似redis的存储,只是用了一个变量
    lambda session_id: message_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

```python
#调用方式
agent_with_chat_history.invoke(
    {"input": "hi! 我叫JavaEdge"},
    #注意此处session_id没有用到，因为我们没用类似redis的存储,只是用了一个变量
    config={"configurable": {"session_id": "foo_001"}},
)
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/1df230e06712e8b96c76802ca6d3d616.png)

```python
#调用方式
agent_with_chat_history.invoke(
    {"input": "我叫什么名字?"},
    #注意此处session_id没有用到，因为我们没用类似redis的存储,只是用了一个变量
    config={"configurable": {"session_id": "foo_001"}},
)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/3f17da094634bc331920fd0efc2d19d4.png)

```python
#调用方式
agent_with_chat_history.invoke(
    {"input": "截止目前我们都聊了什么?"},
    #注意此处session_id没有用到，因为我们没用类似redis的存储,只是用了一个变量
    config={"configurable": {"session_id": "foo_001"}},
)
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/325130e04c1e4e5915f799e2c65d4991.png)