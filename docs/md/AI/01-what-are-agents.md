# 01-what-are-agents

## 0 前言



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/c21f39493b86912da7fdb049694e5b9b.png)

- 无需为不同任务使用单独软件
- 使用日常语言来命令你的设备
- “代理”是人工智能的高级形式
- 未来五年将成为现实
- 人人都有的私人助理Agent
- 应用在干行百业之中(医疗、教育、娱乐....)

## 1 Agents 是什么？

Al Agents是基于LLM的能够自主理解、自主规划决策、执行复杂任务的智能体，Agents不是chatGPT的升级版,它不仅告诉你“如何做”,更会帮你去做,如果各种Copilot是副驾驶，那么Agents就是主驾驶。

Agents = LLM +规划技能+记忆 + 工具使用

本质上Agents是一个LLM的编排与执行系统：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/56daeed79e2fb6bbd2d9e4c0347a782f.png)

一个精简的Agents决策流程，一个循环一个任务：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/fea623b624eddc2e7b1ee3f60d0f7b5a.png)

## 2 LangChain 中的 Agents 如何实现



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/9ed02986c9dcabe95a86d2d9588aed47.png)

1. 提出需求/问题
2. 问题+Prompt组合
3. ReAct Loop
4. 查找Memory
5. 查找可用工具
6. 执行工具并观察结果

如有必要，重复1~6，

7. 得到最终结果

## 3 最简单的 Agents 实现

### 3.0 需求

- 会做数学题
- 不知道答案的时候可以搜索

### 3.1 安装通义千问

```python
!pip install langchain==0.2.1  # 安装langchain
!pip install langchain-community==0.2.1  # 安装第三方集成
!pip install python-dotenv==1.0.1  # 使用 .env 文件来管理应用程序的配置和环境变量
!pip install dashscope==1.19.2  # 安装灵积模型库
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/761d6829d32ea4e43bb6146394ced29c.png)

定义.env文件，里面配置你的API-KEY：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/1020b35cc89abc89e50578568590b9f3.png)

```python
import os
from dotenv import find_dotenv, load_dotenv
from langchain_community.llms import Tongyi
from langchain_core.runnables import RunnableSequence
from langchain.prompts import PromptTemplate

load_dotenv(find_dotenv())
DASHSCOPE_API_KEY = os.environ["DASHSCOPE_API_KEY"]
```

```python
# 定义llm
llm = QwenTurboTongyi(temperature=1)
```

### 3.2 搭建工具

- serpai是一个聚合搜索引擎，需要安装谷歌搜索包以及申请账号 https://serpapi.com/manage-api-key
- llm-math是一个封装好的数学计算链

```python
# 安装谷歌搜索包
! pip install google-search-results
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/9cf06b6e257d377ee3d1c7987dbc40fe.png)

```python
import os 
os.environ["SERPAPI_API_KEY"] = "XXXX"
```

SERPAPI_API_KEY值即为你刚才注册的免费 [Api Key](https://serpapi.com/manage-api-key)：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/f542ad9ee1ff6109312cef768fed65f3.png)

```python
from langchain.agents import load_tools
tools = load_tools(["serpapi","llm-math"], llm=llm)
```

### 3.3 定义agent

使用小样本增强生成类型

```python
from langchain.agents import initialize_agent
from langchain.agents import AgentType

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,#这里有不同的类型
    verbose=True,#是否打印日志
)
```

```python
agent.run("请问现任的美国总统是谁？他的年龄的平方是多少?")
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d8f668075ede40afe29985298b109237.png)