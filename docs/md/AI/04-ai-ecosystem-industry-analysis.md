# 04-AI产业拆解

## 1 行业全景图



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/05/b1d2fac151a37ffed573b572e7adb984.png)

## 2 结构拆解AI GC

生成式AI这个产业。分成上中下游三大块。

### 2.1 上游基础层

主要包括：

- 算力：包括AI芯片和云服务等，例如像英伟达、AMD以及华为等厂商提供的算力基础设施。大型模型基于Transformer架构，对算力的需求很大。
- 数据：新时代的石油，分为基础数据服务、数据集和向量数据库。
- 算法：算法基础包括TensorFlow、PyTorch等著名算法框架，以及百度、阿里、腾讯等公司提供的AI开发平台。

这是AI的基础，也是过去AI研究的重点。

### 2.2 中游-AIGC大模型层和工具层

大模型层分为：

- 通用模型：如OpenAI、腾讯的宏源、百度的1000万等，
- 行业模型，根据具体行业或业务进行微调或二次训练。工具层包括AI Agent，其中包括像OutGPT这样的工具，以及模型平台和模型服务等

### 2.3 下游应用层

包括：

- 内容消费：在各种平台上生成内容，如抖音、快手等
- 创作工具：提供基于AI的工具，如MID Generate
- 企业服务：根据行业提供各种应用，如微软、亚马逊等

产业中，我们的位置是在AI GC工具层，即AI Agent层，作为中间件，承上启下。应用开发者的位置可能更多在中游和下游，发挥着重要作用。

## 3 名词解释

当然，可以按以下类别对这些概念进行细分解释：

### 3.1 模型与架构

1. **LLM** (大型语言模型)：具有大量参数，能处理复杂语言任务的模型。
2. **chatGPT**：一种用于生成对话的自然语言处理模型。
3. **RWKV**：结合RNN和Transformer优点的神经网络架构。
4. **CNN** (卷积神经网络)：一种擅长处理图像数据的神经网络。
5. **RNN** (循环神经网络)：处理序列数据的神经网络。
6. **stable diffusion**：一种用于生成图像的扩散模型。
7. **DALL·E**：OpenAI开发的生成图像的模型。
8. **RAG** (检索增强生成)：结合检索和生成的模型。
9. **AIGC** (人工智能生成内容)：指利用AI生成文本、图像等内容的技术。

### 3.2 技术与方法

1. **多模态**：处理多种不同类型数据的模型。支持多种形态的模型，如文字、图像、音频等

2. **自监督学习**：利用数据本身结构进行训练的方法。

3. **预训练**：在大规模数据上训练模型，以获得初始参数。

4. **Few-shot**：使用少量样本进行训练和推理的能力。

5. **One-shot**：使用单个样本进行训练和推理的能力。

6. **Zero-shot**：无需样本也能进行推理的能力。

7. **Temperature**：控制生成模型输出多样性的参数。

8. **RLHF** (基于人类反馈的强化学习)：通过人类反馈优化AI行为的方法。

9. **Fine-tunes**：在预训练模型基础上，进行特定任务的微调。

10. **向量搜索**：通过向量化表示进行高效搜索的方法。

11. **向量数据库**：存储和检索向量化数据的数据库。

12. **NLP** (自然语言处理)：处理和生成自然语言的技术。

13. **CV** (计算机视觉)：理解和生成图像和视频的技术。

14. **分析式AI**：侧重于分析和理解数据的AI。

15. **知识图谱**：以图结构表示知识及其关系的数据结构。

16. **过拟合**：模型过度拟合训练数据而无法泛化到新数据的现象。

17. **AI推理**：AI对数据进行推断和决策的过程。

18. **生成对抗网络**：通过两个网络的对抗来提高生成结果质量的方法。一种神经网络类型，用于生成真实的图像。（Generative Adversarial Networks, GANs）是一种由 Ian Goodfellow 等人在 2014 年提出的深度学习模型。GANs 通过两个网络（生成器和判别器）相互对抗的方式来提高生成结果的质量。这两个网络的具体角色和对抗机制如下：

    1. **生成器（Generator）**：生成器接受一个随机噪声向量作为输入，并生成伪造的数据（例如图像）。它的目标是生成尽可能真实的数据，以便欺骗判别器。

    2. **判别器（Discriminator）**：判别器接受真实数据和生成器生成的伪造数据，并试图区分两者。判别器的目标是尽可能准确地识别出哪些数据是真实的，哪些是伪造的。

    在训练过程中，生成器和判别器会交替优化自己的参数：

    - 生成器的目标是生成越来越真实的伪造数据，以使判别器难以区分真假数据。
    - 判别器的目标是提高其区分能力，准确判断数据的真假。

    这种对抗机制形成了一个零和游戏，最终生成器会生成出非常逼真的数据，使得判别器难以辨别其真假。

    综上，生成对抗网络是一种通过两个网络的对抗来提高生成结果质量的方法，也是一种用于生成真实图像的神经网络类型。

19. **元学习**：学习如何学习的方法，提高模型在新任务上的适应能力。

20. **并行训练**：同时训练多个模型或在多台设备上训练单个模型的方法。

### 3.3 平台与工具

1. **HuggingFace**：提供自然语言处理模型和工具的公司。
2. **openAI**：开发和研究人工智能的机构。
3. **Azure**：微软的云计算服务平台。
4. **Heygan**：一种AI生成模型（可能是特定应用的名称）。
5. **Copilot**：编程助手工具，帮助开发者编写代码。
6. **midjourney**：AI驱动的艺术创作平台。
7. **D-ID**：用于生成和处理数字身份的技术。

### 3.4 概念与其他

1. **具身智能**：具有物理存在并能与环境互动的人工智能。
2. **AGI** (人工通用智能)：具有通用认知能力的AI。
3. **AI-Agents**：自主行动并完成任务的人工智能代理。使用AI代替人类执行任务的智能体
4. **RPM**：每分钟旋转数（Rotations Per Minute），这里可能表示模型的训练速度。
5. **知知识幻觉**：模型生成的看似合理但错误的知识。
6. **咒语**：特定输入词汇或短语，用来触发模型生成特定输出。
7. **哼唱**：AI生成的音乐或音频。
8. **CDN** (内容分发网络)：用于加速网络内容传输。
9. **上下文**：模型生成内容时参考的前后文信息。
10. **炼丹**：指模型训练和调优过程的比喻。
11. **炼炉**：可能是某种训练或计算环境的比喻。