# 06-how-to-use-langchain-built-in-tools

如何加载使用tool？

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/128a7490cfe007548cc4c52af15c86f0.png)

## 1 加载预制tool的方法

langchain预制了大量的tools，基本这些工具能满足大部分需求，[github](https://github.com/langchain-ai/langchain/tree/v0.1.17rc1/docs/docs/integrations/tools)：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/4650d87d99e252aaff4e57dda87b4606.png)

## SerpAPI

最常见的聚合搜索引擎 https://serper.dev/dashboard

```python
from langchain.utilities import SerpAPIWrapper
search = SerpAPIWrapper()
search.run("Obama's first name?")
```

相当于自动帮我们调用了搜索引擎获得结果：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/ce8c4886a39d6c06c62642a7d5f78241.png)

支持自定义参数，比如将引擎切换到bing，设置搜索语言等

```python
params = {
    "engine": "bing",
    "gl": "us",
    "hl": "en",
}
search = SerpAPIWrapper(params=params)
```

结果就不太一样了对吧：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/cb13e0201a848a7e78142210d9f05bf8.png)

## 使用Dall-E

Dall-E是openai出品的文到图AI大模型

```python
from langchain.agents import initialize_agent, load_tools

tools = load_tools(["dalle-image-generator"])
agent = initialize_agent(
    tools, 
    llm, 
    agent="zero-shot-react-description",
    verbose=True
)
output = agent.run("Create an image of a halloween night at a haunted museum")
```

## Eleven Labs Text2Speech

ElevenLabs 是非常优秀的TTS合成API

## tookit的使用

Tookit，tookit是langchain已经封装好的一系列工具，一个工具包是一组工具来组合完成特定的任务。

Azure认知服务 https://portal.azure.com/#allservices：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/3eb2e10a46fe7d5729f9ec2d4c56b779.png)

- AzureCogsFormRecognizerTool：从文档里提取文本
- AzureCogsSpeech2TextTool：语音到文本
- AzureCogsText2SpeechTool：文本到语音

### 安装相关包

```python
! pip install --upgrade azure-ai-formrecognizer > /dev/null

! pip install --upgrade azure-cognitiveservices-speech > /dev/null

! pip install azure-ai-textanalytics
```



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/32c2dc65daeb940ed0f95b9e36110dd7.png)

[Azure AI services - Microsoft Azure](https://portal.azure.com/#view/Microsoft_Azure_ProjectOxford/CognitiveServicesHub/~/SpeechServices)：免费注册

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/cbd501a111796915c10d119de27d2a4f.png)

```python
import os

os.environ["AZURE_COGS_KEY"] = "c10"
os.environ["AZURE_COGS_ENDPOINT"] = "https://eastus.api.cognitive.microsoft.com/"
os.environ["AZURE_COGS_REGION"] = "eastus"

#创建toolkit
from langchain.agents.agent_toolkits import AzureCognitiveServicesToolkit

toolkit = AzureCognitiveServicesToolkit()

[tool.name for tool in toolkit.get_tools()]

#agent使用
from langchain.chat_models import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
llm = ChatOpenAI(temperature=0,model="gpt-4-1106-preview")
agent = initialize_agent(
    tools=toolkit.get_tools(),
    llm=llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)

audio_file = agent.run("Tell me a joke and read it out for me.")

print(audio_file)
#from IPython import display

#audio = display.Audio(audio_file)
#display.display(audio)
```