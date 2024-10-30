# Claude3到底多强

![](https://codeselect.oss-cn-shanghai.aliyuncs.com/image-20240312140945613.png)

2024年3月4日，官方宣布推出 Claude 3 模型系列，它在广泛的认知任务中树立了新的行业基准。该系列包括三个按能力递增排序的最先进模型：Claude 3 Haiku、Claude 3 Sonnet 和 Claude 3 Opus。每个后续模型都提供越来越强大的性能，允许用户为其特定应用选择智能、速度和[成本](https://www.anthropic.com/api#pricing)之间的最佳平衡。

Opus 和 Sonnet 现在已经可以在 claude.ai 和目前在 [159个国家](https://www.anthropic.com/supported-countries)普遍可用的 Claude API 中使用。Haiku 很快也会上市。

#### Claude 3 模型系列

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2F5d20371eeb8d045465bb22cacfd269b5958b004d-2200x1174.png&w=3840&q=75)

#### 智能新标准

Opus， Claude最智能的模型，在大部分常用的 AI 系统评估基准上表现优于同行，包括本科水平专家知识（MMLU）、研究生水平专家推理（GPQA）、基础数学（GSM8K）等。它在复杂任务上展示了接近人类的理解和流利程度，引领了通用智能的前沿。

所有 [Claude 3](https://www.anthropic.com/claude-3-model-card) 模型在分析和预测、细腻的内容创作、代码生成以及使用西班牙语、日语和法语等非英语语言对话方面的能力都有所提升。

下面是 Claude 3 模型与 Claude同行在多个能力基准测试比较：

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2F9ad98d612086fe52b3042f9183414669b4d2a3da-2200x1954.png&w=3840&q=75)

#### 近乎即时的结果

Claude 3 模型可以为实时客户聊天、自动补全和数据提取任务提供动力，这些响应必须是即时和实时的。

Haiku 是市场上智能范畴性价比最高的模型。它可以在不到三秒的时间内读懂一个信息和数据密集的 arXiv 上的研究论文（约10k 个 Token），包括图表和图形。上市后， Claude预计性能会进一步提高。

对于大多数工作负载，Sonnet 的速度是 Claude 2 和 Claude 2.1 的两倍，智能水平也更高。它擅长迅速响应的任务，如知识检索或销售自动化。Opus 以与 Claude 2 和 2.1 相似的速度交付，但智能水平更高。

#### 强大的视觉能力

Claude 3 模型拥有与其他领先模型相当的复杂视觉能力。它们可以处理包括照片、图表、图形和技术图纸在内的广泛视觉格式。 Claude特别高兴为 Claude的企业客户提供这种新的方式，其中一些客户的知识库有多达50%以多种格式编码，如PDF、流程图或演示幻灯片。

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2F6b66d86ff0c180e95bc6ad2e6e4a1843aa74c80f-2200x960.png&w=3840&q=75)

#### 更少的拒绝

先前的 Claude 模型经常做出不必要的拒绝，这表明缺乏上下文理解。 Claude在这一领域取得了有意义的进展：与上一代模型相比，Opus、Sonnet 和 Haiku 大大减少了拒绝回应那些触及系统保护边界的提示。如下所示，Claude 3 模型对请求有更微妙的理解，识别真正的危害，并且更少地拒绝回答无害的提示。

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2Fd1fbcf3d58ebc2dcd2e98aac995d70bf50cb2e9c-2188x918.png&w=3840&q=75)

#### 提高准确率

各种规模的企业都依赖 Claude的模型为他们的客户服务，因此对于模型输出来说，保持高准确率是至关重要的。为了评估这一点， Claude使用了一套复杂的、真实的问题，这些问题针对目前模型的已知弱点。 Claude将回应分为正确答案、错误答案（或幻觉）以及不确定性声明，即模型表示它不知道答案，而不是提供错误信息。与 Claude 2.1 相比，Opus 在这些具挑战性的开放式问题上的准确度（或正确答案）表现出了两倍的提升，同时还展现出降低了错误答案的水平。

除了产生更值得信赖的回应外， Claude很快还将在 Claude 3 模型中启用引用功能，从而使它们能够指向参考材料中的精确句子以验证它们的答案。

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2F7cb598c6a9fa58c12b77f67ee2067feaac4a2de0-2200x896.png&w=3840&q=75)

#### 长上下文和近乎完美的回忆

Claude 3 模型系列在发布之初将提供 200K 上下文窗口。然而，所有三个模型都能够接受超过 100 万个 Token 的输入， Claude可能会向需要增强处理能力的选定客户提供这一点。

为了有效处理长上下文提示，模型需要强大的回忆能力。'大海捞针' (NIAH) 评估衡量模型从大量数据中准确回忆信息的能力。 Claude通过使用每个提示中的 30 个随机针/问题对之一，并在多样化的众包文档语料上进行测试，增强了这一基准测试的稳健性。Claude 3 Opus 不仅实现了近乎完美的回忆，准确率超过了 99%，在某些情况下，它甚至识别出评估自身的局限性，识别出“针”句似乎是人为插入到原文中的。

![img](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F4zrzovbb%2Fwebsite%2Fd2aa12b60e9c57e7057924bd8878d754c7b3d8e7-2200x1088.png&w=3840&q=75)

#### 负责任的设计

 Claude开发 Claude 3 模型系列，旨在让它们像它们的能力一样值得信赖。 Claude有几个专门的团队跟踪和减轻广泛的风险，范围从错误信息和CSAM到生物滥用、选举干预和自主复制技能。 Claude继续开发诸如 [Constitutional AI](https://www.anthropic.com/news/constitutional-ai-harmlessness-from-ai-feedback) 这样的方法来提高 Claude模型的安全性和透明度，并已调整 Claude的模型以减轻可能由新模式引发的隐私问题。

在日益复杂的模型中解决偏见问题是一项持续的努力，而 Claude在这次新发布中取得了进步。如模型卡所示，Claude 3 根据 [Bias Benchmark for Question Answering (BBQ)](https://aclanthology.org/2022.findings-acl.165/) 的评估显示出比 Claude以前的模型更少的偏见。 Claude仍然致力于推进减少偏见并促进 Claude模型中更大中立性的技术，确保它们不会倾向于任何特定的党派立场。

尽管 Claude 3 模型系列在生物学知识、网络相关知识和自主性方面相比以前的模型取得了进步，但它仍然符合 Claude [Responsible Scaling Policy](https://www.anthropic.com/news/anthropics-responsible-scaling-policy) 中的 AI 安全等级 2 (ASL-2)。

# GPTs推荐

## 1 OpenAI GPTs

### 1.1 [科技文章翻译](https://chatgpt.com/g/g-uBhKUJJTl-ke-ji-wen-zhang-fan-yi)

请直接输入要翻译的内容或者网页url即可开始翻译。如果需要复制翻译后的Markdown，请点击翻译结果下的剪贴板📋图标。

### 1.2 [Code Tutor](https://chatgpt.com/g/g-HxPrv1p8v-code-tutor)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/1537df8e807796542c4a6a3d9566f1a9.png)

不同于普通的编程助手，它不会简单给出答案，而是引导你思考，一步步地帮助你深入理解问题的本质。

这不仅能帮助你解决眼前的问题，更能提升你的编程思维和解决问题的能力。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/683ffb4789428d0e1396dd37bb3a42b6.png)

比如，在理解Python中的lists和dictionaries的区别时，“代码导师”并没有在立马给出答案，反而在鼓励我说出我所知道的关于它们的一切。

![](https://appserversrc.8btc.cn/FpIRl345k9kqpRW9xicriZHAller)

这种引导式学习方法，让我们在解决问题的过程中，不断地思考和总结，从而更深入地理解编程的本质。

它不仅仅是一个问题解答者，更是一个激发我们思考的良师益友！

## 2 Coze

coze bot对标 GPTs，还能举一反三，帮你全面学习一个新知识点，常用推荐：

### 2.1 [编程问题解答](https://www.coze.com/store/bot/7333256624091496453?bid=MDQEEBD2-JiIy8RDOfgQPFnfEskEHtV0pHay8ZG6U9-MVOy6u3LLGWV023s6uEsAEXRtnQQA&from=bots_card)

# ChatGPT为啥不用Websocket而是EventSource？

## 1 前言

在ChatGPT官网我们可以看到，对话的方式仅仅只有一个`post`请求，而没有使用`IM`中使用的`websocket`链接。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/6462b9dffb8a2d79d2be30d7b6c5a18f.png)

和普通`POST`请求不一样的，返回信息`Response`没了，取而代之的是`EventStream`。

这`EventStream`是啥玩意？gpt 一下，原来是Web API中的`EventSource`接口返回的数据。

## 2 MDN官方描述

`EventSource` 接口是 web 内容与服务器发送事件 一个 `EventSource` 实例会对HTTP服务器开启一个持久化的连接，以 `text/event-stream` 格式发送事件，此连接会一直保持开启直到通过调用 `EventSource.close()` 关闭。

EventSource也称为 Server-Sent Events，SSE。

## 3  EventSource V.S  Websocket

### 3.1 EventSource

#### 3.1.1 优势

##### ① 简单易用

EventSource API非常简单，只需要创建一个 `EventSource` 对象并指定服务器端的 URL，就可以开始接收服务器推送的消息。相比之下，WebSocket 需要处理更多的事件和状态变化。

##### ② 服务器推送

EventSource适用于服务器主动向客户端推送数据，客户端只能接收服务器发送的事件。

**服务器端实现简单**：服务器端可以通过简单的 HTTP 响应流推送事件给客户端，而不需要处理复杂的 WebSocket 协议。

##### ③ 自动重连

EventSource 有内置的自动重新连接功能，断开连接后会自动尝试重新连接，适用于长期保持连接并接收事件流的场景。

这在 WebSocket 中需要手动实现。

##### ④ 兼容性

EventSource在大多数现代浏览器中得到支持，无需额外的库支持。

**利用现有的 HTTP 基础设施**：EventSource 使用标准的 HTTP 协议，易通过现有的代理、防火墙和负载均衡器，而这些在 WebSocket 中可能需要额外配置。

**长连接**：SSE 建立后会保持一个长期的 HTTP 连接，并不断从服务器接收数据。

#### 3.1.2  劣势

##### ① 单向通信

只支持从服务器到客户端的单向通信，客户端无法向服务器发送数据。如需双向通信（例如聊天应用），WebSocket 更适合。

##### ① 较少的功能

相比于WebSocket，EventSource提供的功能较为有限，仅限于接收服务器发送的事件。

##### ② 性能和效率

**效率较低**：在大量小消息或高频率消息传输的场景下，WebSocket 的二进制传输和帧控制带来更高的效率。

#### 3.1.3 适用场景

考虑以上优劣，EventSource 适用于以下场景：

- **实时更新**：需要从服务器实时接收数据更新，如股票行情、新闻推送等。
- **简单的通知系统**：例如简单的服务器状态或系统通知。
- **资源受限的应用**：对于只需要简单实时通信的应用，EventSource 的实现和维护成本更低。

综上所述，选择 EventSource 而非 WebSocket 主要是因为其简单性、HTTP 兼容性、自动重连功能以及更易于实现和维护的服务器端需求。然而，如果应用需要复杂的双向通信和高效的数据传输，WebSocket 会是更好的选择。

### 3.2 WebSocket

#### 3.2.1 优势

##### ① 双向通信

WebSocket支持双向通信，客户端和服务器可以彼此发送数据。

##### ② 实时性

WebSocket提供了更低的延迟和更快的数据传输速度，适用于实时性要求较高的应用场景。

##### ③ 丰富的功能

WebSocket提供了更多的功能，例如数据帧的自定义和二进制数据的传输等。

#### 3.2.2 劣势

##### ① 复杂性

WebSocket API相对于EventSource更为复杂，使用起来可能需要更多的代码和理解。

##### ② 需要服务器支持

使用WebSocket需要服务器端实现对应的WebSocket协议，而EventSource只需要服务器端支持发送事件即可。

##### ③ 兼容性

相对于EventSource，WebSocket在某些较旧的浏览器或网络环境中的支持可能不够广泛。

综上，`EventSource` 适用于服务器主动推送事件给客户端，并且在保持长期连接和接收事件流时表现良好。 `WebSocket` 适用于需要实时双向通信和更丰富功能的场景，但需要服务器端和客户端都支持 `WebSocket` 协议，选择使用哪种技术应基于具体需求和应用场景进行评估。

## 4 ChatGPT选择理由

个人猜测是考虑到：

### 4.1 仅服务器推送

`EventSource`专注于服务器向客户端主动推送事件的模型，这对于`ChatGPT`对话非常适用。`ChatGPT`通常是作为一个长期运行的服务，当有新的回复可用时，服务器可以主动推送给客户端，而不需要客户端频繁发送请求。

### 4.2 自动重连和容错

`EventSource`具有内置的自动重连机制，它会自动处理连接断开和重新连接的情况。这对于`ChatGPT`对话而言很重要，因为对话可能需要持续一段时间，连接的稳定性很重要。

### 4.3 简单易用

相比`WebSocket`，`EventSource`的API更加简单易用，只需实例化一个`EventSource`对象，并处理服务器发送的事件即可。这使得开发者可以更快速地实现对话功能，减少了一些复杂性。

### 4.3 浏览器兼容性

`EventSource`在大多数现代浏览器中得到广泛支持，包括移动端浏览器。相比之下，`WebSocket`在某些旧版本的浏览器中可能不被完全支持，需要考虑兼容性问题。

`WebSocket`也是一种很好的选择，特别是当需要实现更复杂的实时双向通信、自定义协议等功能时，或者对浏览器的兼容性要求较高时。最终选择使用`WebSocket`还是`EventSource`应该根据具体的项目需求和技术考虑来确定。

注意`EventSource`只支持GET请求。ChatGPT是通过自己重写方法来发起POST请求的。