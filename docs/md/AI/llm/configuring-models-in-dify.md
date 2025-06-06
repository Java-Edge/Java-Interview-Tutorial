# 接入大模型

## 0 前言

Dify 是基于大语言模型的 AI 应用开发平台，初次使用时你需要先在 Dify 的 **设置 -- 模型供应商** 页面内添加并配置所需要的模型:  

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/c95919356dc219d46368fa949caebb6b.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/9186c0fc944a39fb95f969b8e1975c9c.png)

Dify支持主流模型供应商，如OpenAI GPT系、Anthropic Claude系。不同模型能力表现、参数类型不一，据不同情景应用需求选择喜欢的模型供应商。在 Dify 应用模型能力前，应前往不同的模型厂商官方网站获得他们的 API key 。

## 1 模型类型

Dify按模型使用场景将模型分类：

### 1.1 系统推理

在创建的应用中，用的是该类型的模型。智聊、对话名称生成、下一步问题建议用的也是推理模型。

> 已支持系统推理模型的供应商：[OpenAI](https://platform.openai.com/account/api-keys)、[Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai-service/)、[Anthropic](https://console.anthropic.com/account/keys)、Hugging Face Hub、Replicate、Xinference、OpenLLM、[讯飞星火](https://www.xfyun.cn/solutions/xinghuoAPI)、[文心一言](https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application)、[通义千问](https://dashscope.console.aliyun.com/api-key\_management?spm=a2c4g.11186623.0.0.3bbc424dxZms9k)、[Minimax](https://api.minimax.chat/user-center/basic-information/interface-key)、ZHIPU(ChatGLM)

### 1.2 Embedding

知识库应用中：

- 将分段过的文档做 Embedding
- 将用户的提问做 Embedding 处理

> 已支持的 Embedding 模型供应商：OpenAI、ZHIPU(ChatGLM)、Jina AI([Jina Embeddings](https://jina.ai/embeddings/))

### 1.3 Rerank

为增强检索能力，改善 LLM 搜索结果。

> 已支持的 Rerank 模型供应商：Cohere、Jina AI([Jina Reranker](https://jina.ai/reranker))

### 1.4 语音转文字

将对话型应用中，将语音转文字用的是该类型的模型。

> 已支持的语音转文字模型供应商：OpenAI

### 1.5 托管模型试用服务

为 Dify 云服务的用户提供了不同模型的试用额度，请在该额度耗尽前设置你自己的模型供应商，否则将会影响应用的正常使用。

* **OpenAI 托管模型试用：** 我们提供 200 次调用次数供你试用体验，可用于 GPT3.5-turbo、GPT3.5-turbo-16k、text-davinci-003 模型。

### 设置默认模型

Dify 在需要模型时，会根据使用场景来选择设置过的默认模型。在 `设置 > 模型供应商` 中设置默认模型。

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/c679cdb6308534018494bb76ace549ae.png)

系统默认推理模型：设置创建应用使用的默认推理模型,以及对话名称生成、下一步问题建议等功能也会使用该默认推理模型。

## 2 接入模型设置

在 Dify 的 `设置 > 模型供应商` 中设置要接入的模型。

模型供应商分为两种：

### 2.1 自有模型

该类型的模型供应商提供的是自己开发的模型。如 OpenAI，Anthropic 等。

接入自有模型的供应商后，Dify 会自动接入该供应商下的所有模型。

在 Dify 中设置对应模型供应商的 API key，即可接入该模型供应商。

> Dify 使用了 [PKCS1\_OAEP](https://pycryptodome.readthedocs.io/en/latest/src/cipher/oaep.html) 来加密存储用户托管的 API 密钥，每个租户均使用了独立的密钥对进行加密，确保你的 API 密钥不被泄漏。

### 2.2 托管模型

该类型的模型供应商提供的是第三方模型。如 Hugging Face，Replicate 等。

托管类型的供应商上面有很多第三方模型。接入模型需要一个个的添加。具体接入方式如下：

* [Hugging Face](../../development/models-integration/hugging-face.md)
* [Replicate](../../development/models-integration/replicate.md)
* [Xinference](../../development/models-integration/xinference.md)
* [OpenLLM](../../development/models-integration/openllm.md)

## 3 使用模型

配置完模型后，就可以在应用中使用这些模型了：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/c55e9ca6059b84da51ee9d246493d977.png)