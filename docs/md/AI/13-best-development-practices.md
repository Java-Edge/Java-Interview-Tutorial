# 13-最佳开发实践

## 1 LangChain 的定位



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/b2c7809d637ea3de610fc0e101253904.png)

- 【代码层】LangChain-Core: LCEL
- 【代码层】LangChain-Community 社区贡献
- 【代码层】LangChain 封装组件
- 一站式开发平台 LangSmith
- 便捷AI应用服务器部署套件LangServe

## 2 大模型选型

考虑模型、agent、prompt、chain评估：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/4fbeb7470036cae31b359e13c0ce6036.png)

### 2.1 闭源大模型+API

- 优点：省事、强大
- 缺点：成本、限速、数据隐私

### 2.2 开源大模型+自托管

优点：数据私有、更灵活、成本低

缺点：算力设施、技术支撑

## 3 使用 Ollama 在本地部署大模型

### 3.1 下载并运行应用程序



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/a872adde1e96e5dbd3ddb0e910f48088.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/de0bfb92df17722ebdbb5c0696fd7666.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/daa95f47315ba60e6790d27661f85021.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/85b62d04db4c06665b1fff64de5bec87.png)

### 3.2 从命令行中选取模型(ollama pull llam2)

[官网支持的模型](https://ollama.com/library?sort=newest)：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240621135627185.png)

挑选一个比较小的试玩下：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/46b83f44f00fb3965c35e700cb45eb85.png)

### 3.3 运行

[浏览器](localhost:11434)：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240621141710055.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/29fa4e05840db498501e59e03db1e63f.png)

## 4 本地大模型调用

既然部署本地完成了，来看看如何调用呢？

```python
from langchain_community.llms import Ollama

llm = Ollama(model="qwen2:0.5b")
llm.invoke(input="你是谁？")
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/af07e34926600fdd9946e2905c05bb7a.png)

### 使用流式

```python
#使用流式
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

llm = Ollama(
    model="qwen2:0.5b", callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
)
llm.invoke(input="第一个登上月球的人是谁?")
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/57bcab3fd266daac316d119b20199b37.png)

## 5 模型评估

### 5.1 远程大模型

```python
from langchain_openai import ChatOpenAI
from langchain.evaluation import load_evaluator
llm = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-plus"
)

evaluator = load_evaluator("criteria", llm=llm, criteria="conciseness")
eval_result = evaluator.evaluate_strings(
    prediction="four.",
    input="What's 2+2?",
)
print(eval_result)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/bb4d72b250043b2ee5bd0ae82541e655.png)

如果不简洁的回答：

```python
#inpt 输入的评测问题
#prediction 预测的答案
# 返回值 Y/N 是否符合
# 返回值score 1-0分数，1为完全，0为不完全
eval_result = evaluator.evaluate_strings(
    prediction="What's 2+2? That's an elementary question. The answer you're looking for is that two and two is four.",
    input="What's 2+2?",
)
print(eval_result)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/61c1b940051d6c7b5849cf6211fceefb.png)

### 5.2 本地大模型

```python
from langchain_community.chat_models import ChatOllama
llm = ChatOllama(model="qwen2:0.5b")
evaluator = load_evaluator("criteria", llm=llm, criteria="conciseness")
```

```python
#inpt 输入的评测问题
#prediction 预测的答案
# 返回值 Y或者N是否符合
# 返回值score 1-0分数，1为完全，0为不完全
eval_result = evaluator.evaluate_strings(
    prediction="What's 2+2? That's an elementary question. The answer you're looking for is that two and two is four.",
    input="What's 2+2?",
)
print(eval_result)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/ea116b14383b6db7194d7658810767fd.png)

### 5.3 内置评估标准

```python
# 内置的一些评估标准
from langchain.evaluation import Criteria

list(Criteria)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/f71d5563c6a00a18f2951bb3a4e2f9cd.png)




```python
llm = ChatOllama(model="qwen2:0.5b")
#使用enum格式加载标准
from langchain.evaluation import EvaluatorType
#自定义评估标准
custom_criterion = {
    "幽默性": "输出的内容是否足够幽默或者包含幽默元素",
}
eval_chain = load_evaluator(
    EvaluatorType.CRITERIA,
    llm=llm,
    criteria=custom_criterion,
)
query = "给我讲一个笑话"
prediction = "有一天，小明去买菜，结果买了一堆菜回家，结果发现自己忘了带钱。"
eval_result = eval_chain.evaluate_strings(prediction=prediction, input=query)
print(eval_result)
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/b626bd419b59ded036872353dbd91d41.png)

### 模型比较

```python
from langchain.model_laboratory import ModelLaboratory
from langchain.prompts import PromptTemplate
from langchain_openai import OpenAI
from langchain_community.llms.chatglm import ChatGLM
from langchain_community.chat_models import ChatOllama

#比较openai、ChatGLM、ChatOllama三个模型的效果
llms = [
    # OpenAI(temperature=0),
    ChatOllama(model="qwen2:0.5b"),
]
```

```python
model_lab = ModelLaboratory.from_llms(llms)
model_lab.compare("齐天大圣的师傅是谁？")
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/8c693bac93ab5309068b4a724dd9eac1.png)