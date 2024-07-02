# 01-三分钟快速搭建基于FastAPI的AI Agent应用！

```txt
fastapi==0.108.0
langchain_core==0.1.28
langchain_openai == 0.0.5
langchain_community==0.0.25
langchain==0.1.10
redis==7.2.0
qdrant_client == 1.7.1
uvicorn==0.23.2
```



```bash
pip install -r requirements.txt
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/4a8934548721d36d454f028c2e4b6850.png)

想检查某依赖是否安装完毕：

```
pip show fastapi
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/189744f9c41a8a33665841942b77dd2d.png)

那就先引入 fastapi。

```python
# 这是一个使用 FastAPI 框架编写的简单应用程序的示例。
# 导入FastAPI模块
from fastapi import FastAPI

# 创建一个FastAPI应用实例
app = FastAPI()


# 定义一个路由，当访问'/'时会被触发
@app.get("/")
# 定义一个函数，返回一个字典，key为"Hello"，value为"World"
def read_root():
    return {"Hello": "World"}


# 如果主程序为 __main__，则启动服务器
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8090)
```

如何运行呢？

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/c1ed3a8292d04a179a56379192a6d74e.png)

直接点击它：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/a38bd4d9a95da9889228bca1e4b92512.png)

[直达API文档](http://localhost:8090/docs)：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/cbbfeed786d3bb3b07e005497e791bbb.png)

新增一个 chat 接口：

```python
# 这是一个使用 FastAPI 框架编写的简单应用程序的示例。
# 导入FastAPI模块
from fastapi import FastAPI, BackgroundTasks

# 创建一个FastAPI应用实例
app = FastAPI()


# 定义一个路由，当访问'/'时会被触发
@app.get("/")
# 定义一个函数，返回一个字典，key为"Hello"，value为"World"
def read_root():
    return {"Hello": "World"}


@app.post("/chat")
def chat():
    return {"response": "I am a chat bot!"}


# 如果主程序为 __main__，则启动服务器
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8090)
```

API文档立即更新：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/75d1401e9ea4aa2c3fe5afac6f8b3136.png)

同理，我们编写ws函数：

```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        print("Connection closed")
        await websocket.close()
```

使用 postman 构造 websocket 请求：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/2acb8156279b1639c140f8c5188803d3.png)

先点击 connect，再输入要发送的消息：你好。点击 send 即请求，响应了你好！

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/b98ba1a6ff1cd5964e5398e44c011d13.png)

## 完整代码

```python
# 这是一个使用 FastAPI 框架编写的简单应用程序的示例。
# 导入FastAPI模块
import os

from dotenv import load_dotenv, find_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_tools_agent, AgentExecutor, tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import StrOutputParser
from langchain.memory import ConversationTokenBufferMemory
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
import asyncio
import uuid
from langchain_community.vectorstores import Qdrant
from qdrant_client import QdrantClient
from Mytools import *

# 设置 API 密钥
DASHSCOPE_API_KEY = "xxx"
load_dotenv(find_dotenv())
os.environ["DASHSCOPE_API_KEY"] = DASHSCOPE_API_KEY
os.environ["SERPAPI_API_KEY"] = "xxx"

# 创建一个FastAPI应用实例
app = FastAPI()


# 定义一个工具函数
@tool
def test():
    """ Test tool"""""
    return "test"


# 定义一个Master类
class Master:
    def __init__(self):
        # 初始化ChatOpenAI模型
        self.chatmodel = ChatOpenAI(
            api_key=os.getenv("DASHSCOPE_API_KEY"),
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
            model="qwen-plus",
            temperature=0,
            streaming=True,
        )
        # 设置记忆存储键名
        self.MEMORY_KEY = "chat_history"
        # 初始化系统提示模板
        self.SYSTEMPL = ""
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "你是一个助手"
                ),
                (
                    "user",
                    "{input}"
                ),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ],
        )
        # 初始化记忆存储
        self.memory = ""
        # 初始化工具列表
        tools = [test]
        # 创建OpenAI工具代理
        agent = create_openai_tools_agent(
            self.chatmodel,
            tools=tools,
            prompt=self.prompt,
        )
        # 创建代理执行器
        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=True,
        )

    # 定义运行方法
    def run(self, query):
        # 调用代理执行器并获取结果
        result = self.agent_executor.invoke({"input": query})
        # 返回执行器的响应
        return result


# 定义根路由
@app.get("/")
# 定义根路由处理函数，返回一个包含"Hello"和"World"的字典
def read_root():
    return {"Hello": "World"}


# 定义聊天路由
@app.post("/chat")
# 定义聊天路由处理函数，接收一个字符串查询并调用Master类的run方法进行处理
def chat(query: str):
    master = Master()  # 初始化Master对象
    return master.run(query)


# 定义添加PDF路由
@app.post("/add_pdfs")
# 定义添加PDF路由处理函数，返回一个包含"response"键和"PDFs added!"值的字典
def add_pdfs():
    return {"response": "PDFs added!"}


# 定义添加文本路由
@app.post("add_texts")
# 定义添加文本路由处理函数，返回一个包含"response"键和"Texts added!"值的字典
def add_texts():
    return {"response": "Texts added!"}


# 定义WebSocket路由
@app.websocket("/ws")
# 定义WebSocket路由处理函数，接收一个WebSocket连接并启动一个无限循环
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        print("Connection closed")
        await websocket.close()


# 如果主程序为 __main__，则启动服务器
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8090)
```

fastapi 请求：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/1b568a645fa825cc6a20be186ef2394d.png)

postman 请求：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/620a8421df406a18d9eece93f88c99c5.png)

PyCharm 命令行记录：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/7c0427a3680f3b285ef56aaa4f759666.png)