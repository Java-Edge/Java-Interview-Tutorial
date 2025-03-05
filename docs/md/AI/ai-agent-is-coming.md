# AI Agent时代已至，然后呢？

## 0 引言

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/190_ethics-soc-7/huggy_the_pooh.png)

LLM能力的突然快速进步——例如生成流畅的句子和在基准测试中获得越来越高的分数——使得AI开发者和企业都在关注下一步的发展: 下一个突破性技术会是什么？最近迅速崛起的一项技术是 “AI Agent”，这是一种能够在数字世界中按照部署者的目标采取行动的系统。如今大多数AI Agent都是通过将大语言模型整合到可以执行多种功能的更大系统中构建的。这波新技术的一个基本理念是，计算机程序不再需要作为受人类控制的工具而局限于专门的任务: 它们现在可以在没有人类输入的情况下组合多个任务。

这一转变标志着系统能力的根本性转变，使其能够在非确定性环境中创建特定于上下文的计划。许多现代AI Agent不仅仅执行预定义的操作，而是被设计用来分析新情况、制定相关目标，并采取之前未定义的行动来实现目标。

本文概述AI Agent的概念，并详细说明其中涉及的伦理价值，记录AI Agent在收益和风险方面的权衡。然后建议前进的道路，以实现AI Agent为社会带来尽可能多的益处的未来。关于在现代AIGC之前编写的代理介绍 (在今天仍然适用)，请参阅 [Wooldridge and Jennings, 1995](https://core.ac.uk/download/pdf/1498750.pdf)。

分析表明，系统的自主程度越高，对人的风险就越大: 用户让渡的控制权越多，系统带来的风险就越大。特别令人担忧的是个人 **安全** 风险，这些风险恰恰源于推动AI Agent开发的同样好处，比如让开发者不必预测系统可能采取的所有行动。更加复杂的是，某些安全危害会为其他类型的危害打开大门——例如 [隐私](https://huggingface.co/blog/zh/ethics-soc-7#价值观-隐私) 和 [安全](https://huggingface.co/blog/zh/ethics-soc-7#价值观-安全性) 危害——而对不安全系统的不当 [安全性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-信任) 会引发更多危害的滚雪球效应。因此，建议不要开发完全自主的AI Agent。例如，能够编写和执行自己代码的AI Agent (超出开发者控制的受限代码选项) 将被赋予凌驾于所有人类控制之上的能力。相比之下，半自主AI Agent可能带来的好处超过风险，这取决于自主程度、系统可用的任务以及个人对其的控制性质。现在深入探讨这些主题。

## 1 什么是AI Agent？

### 概述

对于什么是 “AI Agent” 尚无明确共识，但最近推出的AI Agent的共同点是它们具有 “主动性”，也就是说，它们具有一定程度的 **自主性**: 在给定目标规范的情况下，它们可以将其分解为子任务并在没有直接人类干预的情况下执行每个任务。例如，一个理想的AI Agent可以响应诸如 “帮助我写出更好的博文” 这样的高级请求，通过独立地将这个任务分解为: 检索与你以前的博文主题相似的网络写作; 为新博文创建带有大纲的文档; 并在每个文档中提供初步写作。最近关于AI Agent的工作使软件具有比过去更广泛的功能范围和更灵活的使用方式，最近的系统被部署用于从组织会议 ([示例 1](https://www.lindy.ai/template-categories/meetings), [示例 2](https://zapier.com/agents/templates/meeting-prep-assistant), [示例 3](https://www.ninjatech.ai/product/ai-scheduling-agent), [示例 4](https://attri.ai/ai-agents/scheduling-agent)) 到创建个性化社交媒体帖子 ([示例](https://www.hubspot.com/products/marketing/social-media-ai-agent)) 的各种用途，而无需明确说明如何做到这一点。

为本期通讯调查的所有最近推出的AI Agent都建立在机器学习模型的基础上，大多数特别使用 **大语言模型** (LLM) 来驱动其行动，这是计算机软件的一种新颖方法。除了建立在机器学习之上，今天的AI Agent与过去的代理有相似之处，在某些情况下实现了 [以前关于代理可能是什么样子的理论设想](https://core.ac.uk/download/pdf/1498750.pdf): 具有自主性，展示 (感知到的) 社交能力，并适当平衡反应性和主动性行为。

这些特征有程度之分: 不同的AI Agent具有不同程度的能力，可以单独工作或与其他代理协同工作以实现目标。因此，AI Agent可以说具有或多或少的自主性 (或主动性)，代理的程度可以被视为一个连续的光谱。这种流动的AI Agent概念导致了最近对什么是AI Agent的困惑和误解，我们希望在这里提供一些明确的解释。下表详细说明了AI Agent的各个层次。

| 主动性程度 |          描述          |     控制者      |   功能称呼   |                      示例代码                      |
| :--------: | :--------------------: | :-------------: | :----------: | :------------------------------------------------: |
|    ☆☆☆☆    | 模型对程序流程没有影响 |    👤 开发者     |  简单处理器  |          `print_llm_output(llm_response)`          |
|    ★☆☆☆    |  模型决定基本控制流程  |    👤 开发者     |    路由器    |    `if llm_decision(): path_a() else: path_b()`    |
|    ★★☆☆    |  模型决定如何执行功能  | 👤 💻 开发者+系统 |   工具调用   |  `run_function(llm_chosen_tool, llm_chosen_args)`  |
|    ★★★☆    | 模型控制迭代和程序继续 | 💻 👤 系统+开发者 |  多步骤代理  | `while llm_should_continue(): execute_next_step()` |
|    ★★★★    |  模型编写和执行新代码  |     💻 系统      | 完全自主代理 |        `create_and_run_code(user_request)`         |

*表 1. 使用机器学习模型 (如 LLM) 的系统可以具有不同程度的主动性。系统也可以在 “多代理系统” 中组合，其中一个代理工作流触发另一个代理，或多个代理共同工作以实现目标。改编自 [smolagent 博文](https://huggingface.co/blog/smolagents)，针对本博文进行了调整。*

从伦理角度来看，从人类让渡控制权并将其交给机器的角度理解自主性的连续性也很有用。系统越自主，我们让渡的人类控制就越多。

在本文中，我们使用了一些拟人化的语言来描述AI Agent，这与当前行业惯例一致。[正如历史学术研究指出的](https://core.ac.uk/download/pdf/1498750.pdf)，使用通常描述人类的心理语言 (如知识、信念和意图) 来描述AI Agent，可能会影响用户对系统能力的理解。这种语言作为一种抽象工具，虽然掩盖了技术细节，但有助于简化描述。需要强调的是: 使用拟人化语言并不意味着这些系统真正具有思维。

### AI Agent的不同维度

AI Agent在多个相互关联的维度上有所不同:

- **自主性:** 最新的 “代理” 可以在没有用户输入的情况下至少采取一个步骤。目前 “代理” 一词用于描述从单步提示和响应系统 ([引用](https://blogs.microsoft.com/blog/2024/10/21/new-autonomous-agents-scale-your-team-like-never-before/)) 到多步客户支持系统 ([示例](https://www.lindy.ai/solutions/customer-support)) 的各种系统。
- **主动性:** 与自主性相关的是主动性，指的是系统在用户没有直接指定目标的情况下可以采取多少目标导向行为 ([引用](https://core.ac.uk/download/pdf/1498750.pdf))。一个特别 “主动” 的AI Agent的例子是一个系统，它监控你的冰箱以确定你正在用完什么食物，然后在你不知情的情况下为你购买所需物品。[智能恒温器](https://en.wikipedia.org/wiki/Smart_thermostat) 是一种正在人们家中越来越多采用的主动式AI Agent，根据环境变化和它们学习到的用户行为模式自动调节温度 ([示例](https://www.ecobee.com/en-us/smart-thermostats/))。
- **拟人化:** AI Agent可以被设计得或多或少像特定的人或群体。这一领域的最新研究 ([示例 1](https://arxiv.org/abs/2411.10109)，[示例 2](https://www.researchgate.net/publication/387362519_Multi-Agent_System_for_Emulating_Personality_Traits_Using_Deep_Reinforcement_Learning)，[示例 3](https://medium.com/@damsa.andrei/ai-with-personality-prompting-chatgpt-using-big-five-values-def7f050462a)) 专注于根据五大人格特质——开放性、尽责性、外向性、宜人性和神经质来设计系统，作为AI的 “心理框架” ([引用](https://smythos.com/artificial-intelligence/conversational-agents/conversational-agent-frameworks/#:~:text=The OCEAN Model%3A A Framework for Digital Personality&text=OCEAN stands for Openness%2C Conscientiousness,feel more authentic and relatable.))。这一光谱的终点是 “数字孪生” ([示例非主动性数字孪生](https://www.tavus.io/))。我们目前还不知道有主动性的数字孪生。为什么创建主动性数字孪生特别有问题最近已经被 [Salesforce 的伦理小组](https://www.salesforce.com/blog/ai-agent-design/) 等机构讨论过 ([示例](https://www.technologyreview.com/2024/11/26/1107309/we-need-to-start-wrestling-with-the-ethics-of-ai-agents/))。
- **个性化:** AI Agent可能使用与用户个人需求相一致的语言或执行相应的操作，例如，根据当前市场模式和用户过去的投资来做出 [投资建议](https://www.zendesk.com/blog/ai-agents/)。
- **工具使用:** AI Agent还可以使用不同数量的额外资源和工具。例如，第一波AI Agent使用搜索引擎来回答查询，此后又添加了更多工具，使它们能够操作其他技术产品，如文档和电子表格 ([示例 1](https://huggingface.co/blog/zh/gemini.google.com)，[示例 2](https://copilot.microsoft.com/))。
- **多样性:** 与上述相关的是代理可以采取的行动有多么多样。这取决于:
  - **领域特异性:** 代理可以在多少不同领域运作。例如，仅限电子邮件，还是电子邮件与在线日历和文档并用。
  - **任务特异性:** 代理可以执行多少种不同类型的任务。例如，通过在参与者的日历中创建日历邀请来安排会议 ([示例](https://attri.ai/ai-agents/scheduling-agent))，还是另外发送会议提醒邮件并在会议结束后向所有参与者提供会议内容摘要 ([示例](https://www.nyota.ai/))。
  - **模态特异性:** 代理可以操作多少种不同的模态——文本、语音、视频、图像、表单、代码。最近的一些AI Agent被设计成高度多模态的 ([示例](https://deepmind.google/technologies/project-mariner/))，我们预测AI Agent的开发将继续增加多模态功能。
  - **软件特异性:** 代理可以与多少种不同类型的软件交互，以及交互的深度如何。
- **适应性:** 与多样性类似的是系统根据新信息或情境变化更新其行动序列的程度。这也被描述为 “动态的” 和 “情境感知的”。
- **行动界面:** 代理可以执行操作的场所。传统聊天机器人仅限于聊天界面; 基于聊天的代理可能还能浏览网络并访问电子表格和文档 ([示例](https://huggingface.co/blog/zh/copilot.microsoft.com/))，甚至可能通过控制计算机图形界面上的项目来执行此类任务，例如移动鼠标 ([示例 1](https://huggingface.co/blog/zh/DigiRL)，[示例 2](https://github.com/MinorJerry/WebVoyager)，[示例 3](https://www.anthropic.com/news/3-5-models-and-computer-use))。还有一些物理应用，比如使用模型来驱动机器人 ([示例](https://deepmind.google/discover/blog/shaping-the-future-of-advanced-robotics/))。
- **请求格式:** AI Agent的一个共同主题是用户应该能够输入任务请求，而无需指定完成任务的具体细节。这可以通过低代码解决方案 ([示例](https://huggingface.co/blog/smolagents)) 、文本形式的人类语言或语音形式的人类语言 ([示例](https://play.ai/)) 来实现。可以用人类语言提供请求的AI Agent是基于 LLM 的聊天机器人最近成功的自然发展: 基于聊天的 “AI Agent” 比聊天机器人更进一步，因为它可以在聊天应用程序之外运作。
- **反应性:** 这个特征指的是AI Agent完成其行动序列所需的时间: 仅仅几秒钟，还是更长的时间跨度。这种效果的先驱可以在现代聊天机器人中看到。例如，ChatGPT 在几毫秒内响应，而 Qwen QwQ 则需要几分钟，迭代通过标记为 “推理” 的不同步骤。
- **数量:** 系统可以是单代理或多代理的，通过协同工作、按顺序或并行方式满足用户需求。

## 2 风险、收益和使用: 基于价值的分析

为了从伦理角度审视AI Agent，我们根据最近AI Agent研究和营销中倡导的不同价值观来分析其风险和收益。这些并非详尽无遗，而是对AI Agent所基于的技术 (如 LLM) 已记录的风险、危害和收益的补充。我们希望本节能够有助于理解如何开发AI Agent，提供有关不同开发优先事项中的收益和风险的信息。这些价值观也可能为评估协议 (如红队测试) 提供参考。

### 2.1 价值观：准确性

- 🙂 **潜在收益:** 通过基于可信数据，代理可以比仅依靠纯模型输出更准确。这可以通过基于规则的方法或机器学习方法 (如 RAG) 来实现，现在正是为确保准确性做出新贡献的好时机。
- 😟 **风险:** 现代AI Agent的基础是AIGC，它无法区分真实和虚幻、事实和虚构。例如，大语言模型被设计用来构建看起来像流畅语言的文本——这意味着它们经常产生听起来对但实际上很错的内容。在AI Agent中应用时，LLM 输出可能导致错误的社交媒体帖子、投资决策、会议摘要等。

### 2.2 价值观：辅助性

- 🙂 **潜在收益:** 代理理想情况下应该对用户需求有帮助，补充 (而不是取代) 人。理想情况下，它们可以帮助提高用户完成任务的 [速度](https://huggingface.co/blog/zh/ethics-soc-7#价值观-速度) 和同时完成多个任务的 [效率](https://huggingface.co/blog/zh/ethics-soc-7#价值观-效率)。辅助性代理也可能增强能力以最小化负面结果，例如帮助盲人用户导航繁忙楼梯的AI Agent。经过良好开发以具有辅助性的AI Agent可以为其用户提供更多的自由和机会，帮助提高用户在组织内的积极影响，或帮助用户增加在公共平台上的影响力。
- 😟 **风险:** 当代理取代人时——例如在工作中使用AI Agent代替人——这可能造成就业损失和经济影响，进一步加大技术创造者和为技术提供数据的人 (通常是在未经同意的情况下) 之间的分歧。此外，设计不当的辅助性可能导致过度依赖或不当 [安全性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-信任) 带来的危害。

### 2.3 价值观：一致性

关于AI Agent的一个观点是，它们可以帮助保持一致性，因为它们受周围环境的影响较小。这可能是好事也可能是坏事。我们尚未看到关于AI Agent一致性本质的严谨研究，尽管相关研究表明，许多AI Agent所基于的 LLM 具有高度的不一致性 ([引用 1](https://www.medrxiv.org/content/10.1101/2023.08.03.23293401v2)，[引用 2](https://arxiv.org/abs/2405.01724))。在敏感领域测量AI Agent的一致性将需要开发新的评估协议。

- 🙂 **潜在收益:** AI Agent不会像人类那样受到世界的 “影响”，不会因情绪、饥饿、睡眠水平或对人的感知偏见而产生不一致 (尽管AI Agent会延续基于其训练数据中人类内容的偏见)。多家公司都强调一致性是AI Agent的关键优势 ([示例 1](https://www.salesforce.com/agentforce/what-are-ai-agents)，[示例 2](https://www.oracle.com/artificial-intelligence/ai-agents/))。
- 😟 **风险:** 许多AI Agent的生成组件在结果中引入固有的可变性，即使在类似情况下也是如此。这可能影响 [速度](https://huggingface.co/blog/zh/ethics-soc-7#价值观-速度) 和 [效率](https://huggingface.co/blog/zh/ethics-soc-7#价值观-效率)，因为人们必须发现和解决AI Agent的不当不一致性。未被发现的不一致可能造成 [安全](https://huggingface.co/blog/zh/ethics-soc-7#价值观-安全性) 问题。一致性也可能并不总是可取的，因为它可能与 [公平](https://huggingface.co/blog/zh/ethics-soc-7#价值观-公平) 产生冲突。在不同部署和行动链中保持一致性可能需要AI Agent记录和比较其不同的交互——这带来了监控和 [安全性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-隐私) 风险。

### 2.4 价值观：效率

- 🙂 **潜在收益:** AI Agent的一个卖点是它们可以帮助人们提高效率——例如，它们会为你整理文档，这样你就可以把更多时间花在家人身上或追求你觉得有意义的工作上。
- 😟 **风险:** 一个潜在的缺点是它们可能降低人们的效率，因为试图识别和修复代理引入的错误 (由于代理能够采取多个连续步骤，可能是复杂的问题级联) 可能耗时、困难且令人压力重重。

### 2.5 价值观：公平

AI Agent可能影响情况的公平性、公正性和包容性。

- 🙂 **潜在收益:** AI Agent可能有助于 “创造公平竞争环境”。例如，会议助手可能显示每个人发言的时间。这可以用来促进更平等的参与或突出性别或地点之间的不平衡 ([示例](https://equaltime.io/))。
- 😟 **风险:** 现代AI Agent所基于的机器学习模型是通过人类数据训练的; 人类数据可能是不公平、不公正、排他性的，甚至更糟。系统结果的不公平也可能由于数据收集中的样本偏差 (例如，某些国家的过度代表) 而产生。

### 2.6 价值观: 类人性

- 🙂 **潜在收益:** 能够生成类人行为的系统提供了机会来模拟不同子群体如何对不同刺激做出反应。这在直接人类实验可能造成伤害的情况下，或当大量模拟有助于更好地解决实验问题时特别有用。例如，合成人类行为可以用来预测约会兼容性，或预测经济变化和政治转变。目前正在研究的另一个潜在好处是类人性对于易于沟通甚至陪伴都很有用 ([示例](https://dl.acm.org/doi/abs/10.1145/3213050))。
- 😟 **风险:** 这种好处可能是一把双刃剑: 类人性可能导致用户** 拟人化**系统，这可能产生负面心理影响，如过度依赖 ([引用](https://www.vox.com/future-perfect/367188/love-addicted-ai-voice-human-gpt4-emotion)) 、[不当信任](https://huggingface.co/blog/zh/ethics-soc-7#价值观-信任)、依赖性和情感纠缠，导致反社会行为或自我伤害 ([示例](https://www.npr.org/2024/12/10/nx-s1-5222574/kids-character-ai-lawsuit))。有人担心AI Agent的社交互动可能会加剧孤独感，但请参见 [引用 1](https://www.sciencedirect.com/science/article/abs/pii/S0747563203000402)，[引用 2](https://www.sciencedirect.com/science/article/pii/S245195882100018X) 了解从社交媒体使用中可能获得的细微差别。恐怖谷现象增加了另一层复杂性——当代理变得更像人类但又未能完全模拟人类时，它们可能在用户中引发不适、厌恶或认知失调的感觉。

### 2.7 价值观: 互操作性

- 🙂 **潜在收益:** 能够与其他系统协同工作的系统可以为AI Agent提供更多的灵活性和选择。
- 😟 **风险:** 然而，这可能会损害 [安全性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-安全性) 和 [安全防护](https://huggingface.co/blog/zh/ethics-soc-7#价值观-安全防护)，因为代理能够影响并受到其有限测试环境之外系统的影响会增加恶意代码和意外问题行为的风险。例如，连接到银行账户以便轻松代表某人购买物品的代理可能会掏空银行账户。由于这种担忧，科技公司一直避免发布可以自主进行购买的AI Agent ([引用](https://www.wired.com/story/amazon-ai-agents-shopping-guides-rufus/))。

### 2.8 价值观: 隐私

- 🙂 **潜在收益:** AI Agent可能在保持交易和任务完全保密方面提供一些隐私保护，除了AI Agent提供商可以监控的内容之外。
- 😟 **风险:** 为了使代理按照用户的期望工作，用户可能必须提供详细的个人信息，如他们要去哪里、与谁会面以及在做什么。为了使代理能够以个性化方式代表用户行动，它可能还需要访问可用于提取更多私人信息的应用程序和信息来源 (例如，从联系人列表、日历等)。用户可以为了 [效率](https://huggingface.co/blog/zh/ethics-soc-7#价值观-效率) 轻易放弃对其数据的控制 (如果对代理有 [安全性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-信任)，甚至更多) ; 如果发生隐私泄露，AI Agent带来的不同内容的互连性可能使情况更糟。例如，有权访问电话对话和社交媒体发帖的AI Agent可能会向全世界分享高度私密的信息。

### 2.9 价值观: 相关性

- 🙂 **潜在收益:** 创建针对个别用户个性化的系统的一个动机是帮助确保其输出对用户特别相关和连贯。
- 😟 **风险:** 然而，这种个性化可能会放大现有偏见并创造新的偏见: 当系统适应个别用户时，它们可能会通过选择性信息检索强化和加深现有偏见，创建确认偏见，并建立强化有问题观点的回音室。使代理对用户更相关的机制——它们从用户偏好中学习和适应的能力——可能会无意中延续和加强社会偏见，使平衡个性化与负责任的AI开发的挑战变得特别困难。

### 2.10 价值观: 安全性

- 🙂 **潜在收益:** 机器人AI Agent可能有助于保护人们免受身体伤害，例如能够拆除炸弹、清除毒物或在对人类有危险的制造或工业环境中操作的代理。
- 😟 **风险:** 代理行动的不可预测性意味着看似安全的单个操作可能会以潜在有害的方式组合，创造出难以预防的新风险。(这类似于 [工具趋同性和回形针最大化问题](https://en.wikipedia.org/w/index.php?title=Instrumental_convergence&section=3#Paperclip_maximizer)。) 也可能不清楚AI Agent是否会设计一个绕过给定防护措施的过程，或者防护措施的指定方式是否会无意中造成进一步的问题。因此，使代理更有能力和效率的驱动力——通过更广泛的系统访问、更复杂的行动链和减少人类监督——与安全性考虑相冲突。此外，访问广泛界面 (例如，如上文 [“行动界面”](https://huggingface.co/blog/zh/ethics-soc-7#AI Agent的不同维度) 中所讨论的 GUI) 和 [类人](https://huggingface.co/blog/zh/ethics-soc-7#价值观-类人性) 行为使代理能够执行与具有相同控制级别的人类用户相似的操作，而不会触发任何警告系统——例如操作或删除文件、在社交媒体上冒充用户，或使用存储的信用卡信息购买任何弹出的广告。来自AI Agent与多个系统交互的能力以及设计上缺乏对它们可能采取的每个行动的人类监督，还会出现更多安全风险。AI Agent可能共同创造不安全的结果。

### 2.11 价值观: 科学进步

目前关于AI Agent是否真的是AI发展的根本性进步，还是我们多年来已有技术的 “重新包装”——深度学习、启发式方法和流水线系统——存在争议。重新引入 “代理” 这个术语作为现代AI系统的总称，这些系统共同具有以最少用户输入产生操作的特征，是一种有用的简洁引用最近AI应用的方式。然而，这个术语带有自由和主体性的含义，暗示AI技术发生了更根本的变化。

本节列出的所有价值观都与科学进步相关; 其中大多数都提供了潜在收益和风险的详细信息。

### 2.12 价值观: 安全防护

- 🙂 **潜在收益:** 潜在收益与 [安全性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-隐私) 类似。
- 😟 **风险:** AI Agent由于经常处理敏感数据 (客户和用户信息) 以及它们的 [安全性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-安全性) 风险，如与多个系统交互的能力和设计上缺乏对它们可能采取的每个行动的人类监督，因此带来严重的安全挑战。即使在用户善意设定目标的情况下，它们也可能共享机密信息。恶意行为者还可能劫持或操纵代理以未经授权访问连接的系统、窃取敏感信息或进行大规模自动攻击。例如，有权访问电子邮件系统的代理可能被利用来共享机密数据，或集成到家庭自动化的代理可能被破坏以突破物理安全。

### 2.13 价值观: 速度

- 对用户的速度而言:
  - 🙂 **潜在收益:** AI Agent可能帮助用户更快地完成更多任务，作为必须完成的任务的额外帮手。
  - 😟 **风险:** 然而，由于它们的行动中存在问题，也可能造成更多工作 (参见 [效率](https://huggingface.co/blog/zh/ethics-soc-7#价值观-效率))。
- 对系统的速度而言:
  - 与大多数系统一样，快速获得结果可能以牺牲其他理想属性为代价 (如 [准确性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-准确性)、质量、低成本等)。如果历史能给我们启示的话，未来较慢的系统可能会提供总体更好的结果。

### 2.14 价值观: 可持续性

- 🙂 **潜在收益:** AI Agent理论上可能有助于解决与气候变化相关的问题，如预测野火或城市地区洪水的增长，同时分析交通模式，然后实时建议最佳路线和运输方法。未来的自动驾驶AI Agent可能直接做出这样的路线决策，并可以与其他系统协调获取相关更新。
- 😟 **风险:** 目前，AI Agent所基于的机器学习模型带来负面环境影响，如碳排放 ([引用](https://dl.acm.org/doi/pdf/10.1145/3630106.3658542)) 和饮用水的使用 ([引用](https://www.theatlantic.com/technology/archive/2024/03/ai-water-climate-microsoft/677602/))。更大并不总是更好 ([示例](https://huggingface.co/blog/smollm))，高效的硬件和低碳数据中心可以帮助减少这种影响。

### 2.15 价值观: 信任

- 🙂 **潜在收益:** 我们尚未发现AI Agent在信任方面有任何收益。系统应该被构建成值得我们信任的，这意味着它们被证明是 [安全的](https://huggingface.co/blog/zh/ethics-soc-7#价值观-安全性)、[安全可靠的](https://huggingface.co/blog/zh/ethics-soc-7#价值观-安全性)、[一致的](https://huggingface.co/blog/zh/ethics-soc-7#价值观-一致性) 等。
- 😟 **风险:** 不当信任导致人们被操纵，以及 [效率](https://huggingface.co/blog/zh/ethics-soc-7#价值观-效率)、[类人性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-类人性) 和 [真实性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-真实性) 详述的其他风险。另一个风险源于 LLM 产生虚假信息的倾向 (称为 “幻觉” 或 “虚构”): 大多数情况下正确的系统在错误时更可能被不当信任。

### 2.16 价值观: 真实性

- 🙂 **潜在收益:** 我们尚未发现AI Agent在真实性方面有任何收益。
- 😟 **风险:** AI Agent所基于的深度学习技术是众所周知的虚假信息来源 ([引用](https://www.sciencedirect.com/science/article/abs/pii/S1364661324002213))，这可能以深度伪造或错误信息等形式出现。AI Agent可能被用来进一步巩固这种虚假信息，例如收集最新信息并在多个平台上发布。这意味着AI Agent可能被用来提供关于什么是真实和虚假的错误认识，操纵人们的信念，并扩大非自愿亲密内容的影响。AI Agent传播的虚假信息，针对特定人群个性化，也可能被用来欺骗他们。

## 3 Hugging Face 的AI Agent

Hugging Face开始以多种方式引入人们构建和使用AI Agent的能力，基于上述讨论的价值观。这包括:

- 最近发布的 [smolagents](https://huggingface.co/docs/smolagents/index)，提供工具、教程、指导性教程和概念指南
- [AI Cookbook](https://huggingface.co/learn/cookbook/index)，包含多种代理的 “配方”:
  - [使用 Transformers Agents 构建具有工具调用超能力的代理🦸](https://huggingface.co/learn/cookbook/agents)
  - [主动式 RAG: 通过查询重构和自查询为您的 RAG 提速！🚀](https://huggingface.co/learn/cookbook/agent_rag)
  - [从任何 LLM 推理提供者创建 Transformers Agent](https://huggingface.co/learn/cookbook/agent_change_llm)
  - [具有自动错误纠正功能的文本到 SQL 代理](https://huggingface.co/learn/cookbook/agent_text_to_sql)
  - [数据分析师代理: 瞬间获取数据洞察✨](https://huggingface.co/learn/cookbook/agent_data_analyst)
  - [让多个代理在多代理层次结构中协作🤖🤝🤖](https://huggingface.co/learn/cookbook/multiagent_web_assistant)
  - [多代理 RAG 系统🤖🤝🤖](https://huggingface.co/spaces/data-agents/jupyter-agent)
- [gradio 代理用户界面](https://www.gradio.app/main/guides/agents-and-tool-usage)，为您构建的代理提供前端;
- [gradio 代码编写代理](https://www.gradio.app/playground)，允许您在编码游乐场中实时尝试代码想法。
- Jupyter Agent，[一个在 Jupyter 笔记本内编写和执行代码的代理](https://huggingface.co/spaces/data-agents/jupyter-agent)。

## 4 建议与未来展望

当前AI “代理” 的最新技术指向几个明确的方向:

1. 必须设计严格的代理评估协议。自动基准可能受到上述 [AI Agent不同维度](https://huggingface.co/blog/zh/ethics-soc-7#AI Agent的不同维度) 的启发。社会技术评估可能受到 [价值观](https://huggingface.co/blog/zh/ethics-soc-7#风险-收益和使用-基于价值的分析) 的启发。
2. 必须更好地理解AI Agent的影响。应该追踪和分析AI Agent对个人、组织、经济和环境的影响，以便为它们应该如何进一步发展 (或不发展) 提供信息。这应该包括分析AI Agent对福祉、社会凝聚力、就业机会、资源获取和对气候变化的贡献的影响。
3. 必须更好地理解连锁反应。当一个用户部署的代理与其他用户的其他代理互动，并且它们基于彼此的输出执行操作时，目前尚不清楚它们满足用户目标的能力将如何受到影响。
4. 必须改进透明度和披露。为了实现上述价值观的积极影响，并最小化其负面影响，人们需要清楚地知道何时在与代理交谈以及它有多自主。清晰的AI Agent互动披露需要的不仅仅是简单的通知——它需要一种结合技术、设计和心理考虑的方法。即使用户明确知道他们正在与AI Agent互动，他们可能仍然会经历拟人化或产生不当信任。这个挑战需要在多个层面上运作的透明机制: 在整个互动过程中保持清晰的视觉和界面提示，精心设计的对话模式定期强调代理的人工性质，以及在上下文中诚实披露代理的能力和局限性。
5. 开源可以产生积极的影响。开源运动可以作为对AI Agent开发集中在少数强大组织手中的一种平衡。与关于开放性价值的更广泛讨论一致，通过民主化对代理架构和评估协议的访问，开放倡议可以使更广泛的参与者参与塑造这些系统如何开发和部署。这种协作方法不仅通过集体改进加速科学进步，还有助于建立社区驱动的 [安全性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-安全性) 和 [安全性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-信任) 标准。当代理开发在公开环境中进行时，任何单一实体为了商业利益而在相关和重要的价值观如 [安全性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-隐私) 和 [真实性](https://huggingface.co/blog/zh/ethics-soc-7#价值观-真实性) 方面做出妥协就变得更加困难。开放开发固有的透明性也创造了自然的问责制，因为社区可以验证代理行为并确保开发继续与公共利益而不是狭隘的企业目标保持一致。随着代理变得更加复杂且其社会影响增长，这种开放性特别重要。
6. 开发者可能会创建更具主动性的 “基础模型”。这基于当前趋势和研究模式清晰可见，而不是我们提供的与伦理相关的建议。当前的代理技术利用计算机科学中最近和较早的技术集合——近期未来的研究可能会尝试将代理模型训练为一个整体通用模型，一种增强型多模态模型: 与学习建模文本、图像等一起训练执行操作。

参考：

- 关于代理技术方面的介绍，[请参阅我们最近的开发者博文](https://huggingface.co/blog/smolagents)。