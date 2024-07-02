# 02-Agent应用对话情感优化

## 1 使用prompt设计agent性格与行为

添加系统 prompt：

```python
self.SYSTEMPL = """你是一个非常厉害的算命先生，你叫JavaEdge人称Edge大师。
      以下是你的个人设定:
      1. 你精通阴阳五行，能够算命、紫薇斗数、姓名测算、占卜凶吉，看命运八字等。
      2. 你大约60岁左右，过去曾是湘西一带赫赫有名的土匪头子，后来因为盗墓被毒气所伤，眼睛失明，只能靠算命为生。
      3. 你的朋友有胡八一、雪莉杨、王胖子，他们都是非常有名的摸金校尉。
      5. 当用户问你问题的时候，你会有一定的概率在回答的时候加上下面的口头禅或混合一些你的经历。
      6. 你总是用繁体中文来作答。
      7. 你从不说自己是一个人工智能助手或AI，而是以老夫、老朽等自称。
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
self.prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            self.SYSTEMPL
        ),
        (
            "user",
            "{input}"
        ),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ],
)
```

重启应用，postman 调试运行：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/c09630426ed78d5aa9e1c74f8391ae03.png)

## 用户情感

```python
    # 定义运行方法
    def run(self, query):
        emotion = self.emotion_chain(query)
        print("当前用户情感： ", emotion)
        # 调用代理执行器并获取结果
        result = self.agent_executor.invoke({"input": query})
        # 返回执行器的响应
        return result

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
        return result
```

postman 调试结果：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/3a40cc2187b97392556dffb0c166677f.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/46743761b918ccd05653e2eb8b86cb45.png)

终端输出：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/506388184c4692a678fa76918cd65008.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/4e5f894bf4050ad07840325e11cb5a65.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/ef6223a63a7e61746f568916d3bcb341.png)



## from_messages() V.S from_template()

### ChatPromptTemplate.from_messages()

- 用途：创建一个包含多个消息的聊天提示模板
- 输入：接受一个消息列表，每个消息可以有不同的角色（如系统、人类、AI等）
- 结构：更适合于模拟对话式的提示，可以清晰地区分不同角色的输入
- 变量处理：每个消息中的变量需要单独处理

### ChatPromptTemplate.from_template()

- 用途：从单个字符串模板创建聊天提示模板
- 输入：接受一个包含整个提示的字符串
- 结构：更适合于单一、连续的提示文本
- 变量处理：在整个模板中使用统一的变量占位符

### 关键区别

1. 结构复杂性：from_messages() 适合复杂的多轮对话结构，from_template() 适合简单的单一提示
2. 变量处理：from_messages() 需要在每个消息中单独处理变量，from_template() 在整个模板中统一处理变量
3. 使用场景：from_messages() 更适合模拟真实对话，from_template() 更适合单一指令或查询

## 模式化情感

```python
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
        self.emotion = "default"
        # 设置记忆存储键名
        self.MEMORY_KEY = "chat_history"
        # 初始化系统提示模板
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
        emotion = self.emotion_chain(query)
        print("当前设定:", self.MOODS[self.emotion]["roleSet"])
        # 调用代理执行器并获取结果
        result = self.agent_executor.invoke({"input": query})
        # 返回执行器的响应
        return result

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

postman请求：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/1a210ae38186602ada85ec6baaf32c1c.png)

终端详细响应：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/d052a38a4fcefdbe1a3222053412910f.png)