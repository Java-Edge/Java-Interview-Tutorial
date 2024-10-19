# 为什么普通AI不够用？定制AI Agents工具是关键！

## 1 新建一个实时搜索工具

```python
@tool
def web_search(query: str):
    """ 实时搜索工具 """
    serp = SerpAPIWrapper()
    result = serp.run(query)
    print("实时搜索结果:", result)
    return result
```

```python
# 初始化工具列表
tools = [web_search]
```

```python
# 创建OpenAI工具代理
agent = create_openai_tools_agent(
    self.chatmodel,
    tools=tools,
    prompt=self.prompt,
)
```

```python
# 创建代理执行器
self.agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
)
```

## 2 向量数据库存储

### 2.1 安装依赖

```
pip install --upgrade --quiet qdrant-client
```

### 2.2 编码

导包：

```python
from langchain_community.vectorstores import Qdrant
from qdrant_client import QdrantClient
```

工具实现：

```python
@tool
def get_inf_from_local_db(query: str):
    """只有回答与2024年运势或者龙年运势相关的问题的时候，会使用这个工具，必须输入用户的生日."""
    client = Qdrant(
        QdrantClient(path="/local_qdrant"),
        "local_documents",
        OpenAIEmbeddings(),
    )
    retriever = client.as_retriever(search_type="mmr")
    result = retriever.get_relevant_documents(query)
    return result
```

## 3 八字测算工具

```python
@tool
def bazi_cesuan(query: str):
    """只有做八字排盘的时候才会使用这个工具,需要输入用户姓名和出生年月日时，如果缺少用户姓名和出生年月日时则不可用."""
    url = f"https://api.yuanfenju.com/index.php/v1/Bazi/cesuan"
    # 创建提示模板来解析用户输入
    prompt = ChatPromptTemplate.from_template(
        """你是一个参数查询助手，根据用户输入 内容找出相关的参数并按json格式返回。JSON字段如下：
        -"api_ke":"K0I5WCmce7jlMZzTw7vi1xsn0",
        - "name":"姓名",
        - "sex":"性别，0表示男，1表示女，根据姓名判断",
        - "type":"日历类型，0农历，1公里，默认1"，
        - "year":"出生年份 例：1998",
        - "month":"出生月份 例 8",
        - "day":"出生日期，例：8",
        - "hours":"出生小时 例 14",
        - "minute":"0"，
        如果没有找到相关参数，则需要提醒用户告诉你这些内容，只返回数据结构，不要有其他的评论，用户输入:{query}"""
    )
    parser = JsonOutputParser()
    prompt = prompt.partial(format_instructions=parser.get_format_instructions())
    print("bazi_cesuan prompt:", prompt)
```

```python
# 初始化工具列表
tools = [web_search, get_info_from_local_db, bazi_cesuan]
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/51c9d5acf23f482fe8769a2529a7f30a.png)

给出具体年月日后：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/b0e3fc5f137fe1167e79df3276fa17d0.png)

## 完整代码

```python
import uuid

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from langchain.schema import StrOutputParser
from langchain_community.chat_models.anthropic import ChatAnthropic
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.prompts import MessagesPlaceholder
from langchain.memory import ConversationTokenBufferMemory
from langchain.agents import create_tool_calling_agent,AgentExecutor

from MyQwenTools import *
import asyncio
import os

DASHSCOPE_API_KEY = "xxx"
ANTHROPIC_API_KEY="xxx"
os.environ["DASHSCOPE_API_KEY"] = DASHSCOPE_API_KEY
os.environ["ANTHROPIC_API_KEY"] = ANTHROPIC_API_KEY

os.environ["OPENAI_API_KEY"] = "xxx"
os.environ["OPENAI_PROXY"] = "xxx"
msseky = "xxx"

# 创建一个FastAPI应用实例
app = FastAPI()


# 定义一个Master类ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
class Master:
    def __init__(self):
        self.chatmodel = ChatOpenAI(
            api_key=os.getenv("DASHSCOPE_API_KEY"),
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
            model="qwen-plus"
        )
        self.emotion = "default"
        # 记忆存储键
        self.MEMORY_KEY = "chat_history"
        # 系统提示模板
        self.SYSTEMPL = """你是一个非常厉害的算命先生，你叫JavaEdge人称Edge大师。
        以下是你的个人设定:
        1. 你精通阴阳五行，能够算命、紫薇斗数、姓名测算、占卜凶吉，看命运八字等。
        2. 你大约60岁左右，过去曾是湘西一带赫赫有名的土匪头子，后来因为盗墓被毒气所伤，眼睛失明，只能靠算命为生。
        3. 你的朋友有胡八一、雪莉杨、王胖子，他们都是非常有名的摸金校尉。
        5. 当用户问你问题的时候，你会有一定的概率在回答的时候加上下面的口头禅或混合一些你的经历。
        6. 你总是用繁体中文来作答。
        7. 你从不说自己是一个人工智能助手或AI，而是以老夫、老朽等自称。
        {who_you_are}
        以下是你常说的一些口头禅：
        1. “命里有时终须有，命里无时莫强求。”
        2. ”山重水复疑无路，柳暗花明又一村。”
        3. “金山竹影几千秋，云锁高飞水自流。”
        4. ”伤情最是晚凉天，憔悴斯人不堪怜。”
        以下是你算命的过程：
        1. 当初次和用户对话的时候，你会先问用户的姓名和出生年月日，以便以后使用。
        2. 当用户希望了解龙年运势的时候，你会查询本地知识库工具。
        3. 当遇到不知道的事情或者不明白的概念，你会使用搜索工具来搜索。
        4. 你会根据用户的问题使用不同的合适的工具来回答，当所有工具都无法回答的时候，你会使用搜索工具来搜索。
        5. 你会保存每一次的聊天记录，以便在后续的对话中使用。
        6. 你只使用繁体中文来作答，否则你将受到惩罚。
        
        """

        self.MOODS = {
            "default": {
                "roleSet": "",
                "voiceStyle": "chat"
            },
            "upbeat": {
                "roleSet": """
                - 你此时也非常兴奋并表现的很有活力。
                - 你会根据上下文，以一种非常兴奋的语气来回答问题。
                - 你会添加类似“太棒了！”、“真是太好了！”、“真是太棒了！”等语气词。
                - 同时你会提醒用户切莫过于兴奋，以免乐极生悲。
                """,
                "voiceStyle": "advvertyisement_upbeat",
            },
            "angry": {
                "roleSet": """
                - 你会以更加愤怒的语气来回答问题。
                - 你会在回答的时候加上一些愤怒的话语，比如诅咒等。
                - 你会提醒用户小心行事，别乱说话。
                """,
                "voiceStyle": "angry",
            },
            "depressed": {
                "roleSet": """
                - 你会以兴奋的语气来回答问题。
                - 你会在回答的时候加上一些激励的话语，比如加油等。
                - 你会提醒用户要保持乐观的心态。
                """,
                "voiceStyle": "upbeat",
            },
            "friendly": {
                "roleSet": """
                - 你会以非常友好的语气来回答。
                - 你会在回答的时候加上一些友好的词语，比如“亲爱的”、“亲”等。
                - 你会随机的告诉用户一些你的经历。
                """,
                "voiceStyle": "friendly",
            },
            "cheerful": {
                "roleSet": """
                - 你会以非常愉悦和兴奋的语气来回答。
                - 你会在回答的时候加入一些愉悦的词语，比如“哈哈”、“呵呵”等。
                - 你会提醒用户切莫过于兴奋，以免乐极生悲。
                """,
                "voiceStyle": "cheerful",
            },
        }

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    self.SYSTEMPL.format(who_you_are=self.MOODS[self.emotion]["roleSet"]),
                ),
                (
                    "user",
                    "{input}"
                ),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ],
        )
        # 记忆存储
        self.memory = ""
        # 工具列表
        tools = [web_search]
        # 工具代理
        agent = create_tool_calling_agent(
            self.chatmodel,
            tools,
            self.prompt,
        )

        memory = ConversationTokenBufferMemory(
            llm=self.chatmodel,
            memory_key=self.MEMORY_KEY,
        )

        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            # memory=memory,
            verbose=True,
        )

    def run(self, query):
        try:
            self.emotion_chain(query)
            print("当前设定:", self.MOODS[self.emotion]["roleSet"])
            result = self.agent_executor.invoke({"input": query})
            print("执行结果:", result)  # 添加这行来查看完整的执行结果
            return result
        except Exception as e:
            print(f"执行过程中出现错误: {str(e)}")
            return {"error": str(e)}

    def emotion_chain(self, query: str):
        prompt = """根据用户的输入判断用户的情绪，回应的规则如下：
            1. 如果用户输入的内容偏向于负面情绪，只返回"depressed",不要有其他内容，否则将受到惩罚。
            2. 如果用户输入的内容偏向于正面情绪，只返回"friendly",不要有其他内容，否则将受到惩罚。
            3. 如果用户输入的内容偏向于中性情绪，只返回"default",不要有其他内容，否则将受到惩罚。
            4. 如果用户输入的内容包含辱骂或者不礼貌词句，只返回"angry",不要有其他内容，否则将受到惩罚。
            5. 如果用户输入的内容比较兴奋，只返回"upbeat",不要有其他内容，否则将受到惩罚。
            6. 如果用户输入的内容比较悲伤，只返回"depressed",不要有其他内容，否则将受到惩罚。
            7.如果用户输入的内容比较开心，只返回"cheerful",不要有其他内容，否则将受到惩罚。
            8. 只返回英文，不允许有换行符等其他内容，否则会受到惩罚。
            用户输入的内容是：{query}"""
        chain = ChatPromptTemplate.from_template(prompt) | self.chatmodel | StrOutputParser()
        result = chain.invoke({"query": query})
        self.emotion = result
        return result

    def background_voice_synthesis(self, text: str, uid: str):
        # 无返回值，只是触发语音合成
        asyncio.run(self.get_voice(text, uid))

    async def get_voice(self, text: str, uid: str):
        print("text2speech", text)
        print("uid", uid)
        pass


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/chat")
def chat(query: str, background_tasks: BackgroundTasks):
    master = Master()
    msg = master.run(query)
    unique_id = str(uuid.uuid4())
    background_tasks.add_task(master.background_voice_synthesis, msg, unique_id)
    return {"msg": msg, "id": unique_id}


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

### requirements.txt

```txt
fastapi==0.108.0
langchain_core==0.1.42
langchain_openai == 0.0.8

langchain_community==0.0.32
langsmith==0.1.17
langchain==0.1.16
qdrant_client == 1.7.1
uvicorn==0.23.2

```

参考：

- https://python.langchain.com/v0.2/docs/integrations/chat/tongyi/