# Qwen3：思深，行速

![](https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/qwen3-banner.png)

 [Hugging Face](https://huggingface.co/collections/Qwen/qwen3-67dd247413f0e2e4f653967f) [ModelScope](https://modelscope.cn/collections/Qwen3-9743180bdc6b48)

[Kaggle](https://www.kaggle.com/models/qwen-lm/qwen-3)

 [DEMO](https://huggingface.co/spaces/Qwen/Qwen3-Demo)

[DISCORD](https://discord.gg/yPEP2vHTu4)

## 0 引言

**Qwen3-235B-A22B** 在代码、数学、通用能力等基准测试中，与 DeepSeek-R1、o1、o3-mini、Grok-3 和 Gemini-2.5-Pro 等顶级模型相比，表现极具竞争力结果。

小型 MoE 模型 **Qwen3-30B-A3B** 的激活参数数量是 QwQ-32B 的 10%，表现更胜一筹：

![](https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3/qwen3-235a22.jpg)

甚至 Qwen3-4B 小模型也能匹敌 Qwen2.5-72B-Instruct 性能：

![](https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3/qwen3-30a3.jpg)

### 开源

两个 MoE 模型的权重：

- **Qwen3-235B-A22B**，拥有 2350 多亿总参数和 220 多亿激活参数的大模型
- **Qwen3-30B-A3B**，拥有约 300 亿总参数和 30 亿激活参数的小型 MoE 模型

六个 Dense 模型也已开源，包括 **Qwen3-32B**、**Qwen3-14B**、**Qwen3-8B**、**Qwen3-4B**、**Qwen3-1.7B** 和 **Qwen3-0.6B**，均在 Apache 2.0 许可下开源。

| Models     | Layers | Heads (Q / KV) | Tie Embedding | Context Length |
| :--------- | :----: | :------------: | :-----------: | :------------: |
| Qwen3-0.6B |   28   |     16 / 8     |      Yes      |      32K       |
| Qwen3-1.7B |   28   |     16 / 8     |      Yes      |      32K       |
| Qwen3-4B   |   36   |     32 / 8     |      Yes      |      32K       |
| Qwen3-8B   |   36   |     32 / 8     |      No       |      128K      |
| Qwen3-14B  |   40   |     40 / 8     |      No       |      128K      |
| Qwen3-32B  |   64   |     64 / 8     |      No       |      128K      |

| Models          | Layers | Heads (Q / KV) | # Experts (Total / Activated) | Context Length |
| :-------------- | :----: | :------------: | :---------------------------: | :------------: |
| Qwen3-30B-A3B   |   48   |     32 / 4     |            128 / 8            |      128K      |
| Qwen3-235B-A22B |   94   |     64 / 4     |            128 / 8            |      128K      |

经过后训练的模型，如 **Qwen3-30B-A3B**及它们的预训练基座模型（如 **Qwen3-30B-A3B-Base**），现已在 **Hugging Face**、**ModelScope** 和 **Kaggle** 等平台开放使用。

### 部署

推荐用 **SGLang** 和 **vLLM** 等框架

### 本地使用

推荐 **Ollama**、**LMStudio**、**MLX**、**llama.cpp** 和 **KTransformers**。它们已确保用户可轻松将 Qwen3 集成到他们的工作流程，无论用于研究、开发还是生产环境。

Qwen3发布和开源将极大地推动大型基础模型研究与开发。为全球研究人员、开发者和组织赋能，帮助他们利用这些前沿模型构建创新解决方案。

### 试用入口

- Qwen Chat 网页版 ([chat.qwen.ai](https://chat.qwen.ai/)) 和
- 手机APP

## 1 亮点

### 1.1 多种思考模式

Qwen3支持两种思考模式：

1. 思考模式：会逐步推理，经深思熟虑后给出最终答案。适合需深入思考的复杂问题
2. 非思考模式：提供快速、近乎即时响应，适用速度要求高于深度的简单问题

这种灵活性使用户能够根据具体任务控制模型进行“思考”度，如：

- 复杂的问题可以通过扩展推理步骤来解决
- 简单的问题可直接快速作答，无需延迟

两种模式结合大大增强模型实现稳定且高效的“思考预算”控制能力。如上文，Qwen3 展现出可扩展且平滑的性能提升，这与分配的计算推理预算直接相关。这样的设计让用户能更轻松为不同任务配置特定预算，在成本效益和推理质量之间实现更优平衡。

![](https://qianwen-res.oss-accelerate.aliyuncs.com/assets/blog/qwen3/thinking_budget.png)

### 1.2 多语言

Qwen3 模型支持 **119 种语言和方言**。这一广泛的多语言能力为国际应用开辟了新的可能性，让全球用户都能受益于这些模型的强大功能。

### 1.3 增强的 Agent 能力

优化 Qwen3 模型的 Agent 和 代码能力，同时也加强对 MCP 支持。

示例展示 Qwen3 是如何思考并与环境进行交互的。

## 2 预训练

Qwen2.5是在 18 万亿个 token 上预训练，Qwen3使用数据量几乎是其两倍，涵盖 119 种语言方言。

为构建这庞大数据集，不仅从网络收集数据，还从 PDF 文档中提取信息。使用 Qwen2.5-VL 从这些文档中提取文本，并用 Qwen2.5 改进提取内容的质量。为了增加数学和代码数据的数量，利用 Qwen2.5-Math 和 Qwen2.5-Coder 这两个数学和代码领域的专家模型合成数据，合成了包括教科书、问答对以及代码片段等多种形式的数据。

预训练过程分三阶段。

### 2.1 第一阶段（S1）

模型在超过 30 万亿个 token 进行预训练，上下文长度为 4K token。这一阶段为模型提供基本的语言技能和通用知识。

### 2.2 第二阶段（S2）

增加知识密集型数据（如 STEM、编程和推理任务）的比例来改进数据集，随后模型又在额外 5 万亿个 token 上进行了预训练。

### 2.3 最后阶段

使用高质量的长上下文数据将上下文长度扩展到 32K token，确保模型能够有效地处理更长的输入。

![](https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/qwen3-base.jpg)

由于模型架构改进、训练数据增加及更有效训练方法，Qwen3 Dense 基础模型的整体性能与参数更多的Qwen2.5基础模型相当。如Qwen3-1.7B/4B/8B/14B/32B-Base 分别与 Qwen2.5-3B/7B/14B/32B/72B-Base 表现相当。

特别在 STEM、编码和推理领域，Qwen3 Dense 基础模型的表现甚至 ＞ 更大规模的 Qwen2.5 模型。

Qwen3 MoE 基础模型，仅用 10% 激活参数达到与 Qwen2.5 Dense 基础模型相似性能。带来训练和推理成本显著节省。

## 3 后训练

![](https://qianwen-res.oss-accelerate.aliyuncs.com/assets/blog/qwen3/post-training.png)

为开发同时具备思考推理和快速响应能力的混合模型，实施了四阶段的训练流程：

- （1）长思维链冷启动
- （2）长思维链强化学习
- （3）思维模式融合
- （4）通用强化学习

#### 3.1 第一阶段

用多样的的长思维链数据对模型进行了微调，涵盖了数学、代码、逻辑推理和 STEM 问题等多种任务和领域。这一过程旨在为模型配备基本的推理能力。

### 3.2 第二阶段

重点是大规模强化学习，利用基于规则的奖励来增强模型的探索和钻研能力。

### 3.3 第三阶段

在一份包括长思维链数据和常用的指令微调数据的组合数据上对模型进行微调，将非思考模式整合到思考模型中。确保了推理和快速响应能力的无缝结合。

### 3.4 第四阶段

在包括指令遵循、格式遵循和 Agent 能力等在内的 20 多个通用领域的任务上应用了强化学习，以进一步增强模型的通用能力并纠正不良行为。

## 4 实战Qwen3

在不同框架用Qwen3。

注意，必须使用 Python3.11+。

### transformers

在 Hugging Face `transformers` 中使用 Qwen3-30B-A3B 的标准示例：

```python
from modelscope import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen3-30B-A3B"

# load the tokenizer and the model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)

# prepare the model input
prompt = "Give me a short introduction to large language model."
messages = [
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=True # Switch between thinking and non-thinking modes. Default is True.
)
model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

# conduct text completion
generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=32768
)
output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist() 

# parsing thinking content
try:
    # rindex finding 151668 (</think>)
    index = len(output_ids) - output_ids[::-1].index(151668)
except ValueError:
    index = 0

thinking_content = tokenizer.decode(output_ids[:index], skip_special_tokens=True).strip("\n")
content = tokenizer.decode(output_ids[index:], skip_special_tokens=True).strip("\n")

print("thinking content:", thinking_content)
print("content:", content)
```

禁用思考模式，只需修改参数 `enable_thinking` ：

```python
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=False  # True is the default value for enable_thinking.
)
```

对于部署，可用 `sglang>=0.4.6.post1` 或 `vllm>=0.8.4` 来创建一个与 OpenAI API 兼容的 API endpoint：

SGLang：

```shell
python -m sglang.launch_server --model-path Qwen/Qwen3-30B-A3B --reasoning-parser qwen3
```

vLLM：

```shell
vllm serve Qwen/Qwen3-30B-A3B --enable-reasoning --reasoning-parser deepseek_r1
```

要禁用思考模式，可移除参数 `--reasoning-parser`（以及 `--enable-reasoning`）。

### 本地开发

可运行：

```bash
ollama run qwen3:30b-a3b
```

用 ollama 与模型进行交互。也可用 LMStudio 或 llama.cpp 及 ktransformers 等代码库进行本地开发。

### 高级用法

提供一种软切换机制，允许用户在 `enable_thinking=True` 时动态控制模型的行为。可在用户提示或系统消息中添加 `/think` 和 `/no_think` 来逐轮切换模型的思考模式。多轮对话中，模型会遵循最近指令。

多轮对话示例：

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

class QwenChatbot:
    def __init__(self, model_name="Qwen3-30B-A3B/Qwen3-30B-A3B"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        self.history = []

    def generate_response(self, user_input):
        messages = self.history + [{"role": "user", "content": user_input}]

        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        inputs = self.tokenizer(text, return_tensors="pt")
        response_ids = self.model.generate(**inputs, max_new_tokens=32768)[0][len(inputs.input_ids[0]):].tolist()
        response = self.tokenizer.decode(response_ids, skip_special_tokens=True)

        # Update history
        self.history.append({"role": "user", "content": user_input})
        self.history.append({"role": "assistant", "content": response})

        return response

# Example Usage
if __name__ == "__main__":
    chatbot = QwenChatbot()

    # First input (without /think or /no_think tags, thinking mode is enabled by default)
    user_input_1 = "How many r's in strawberries?"
    print(f"User: {user_input_1}")
    response_1 = chatbot.generate_response(user_input_1)
    print(f"Bot: {response_1}")
    print("----------------------")

    # Second input with /no_think
    user_input_2 = "Then, how many r's in blueberries? /no_think"
    print(f"User: {user_input_2}")
    response_2 = chatbot.generate_response(user_input_2)
    print(f"Bot: {response_2}") 
    print("----------------------")

    # Third input with /think
    user_input_3 = "Really? /think"
    print(f"User: {user_input_3}")
    response_3 = chatbot.generate_response(user_input_3)
    print(f"Bot: {response_3}")
```

### Agent示例

Qwen3 在工具调用能力方面表现出色。推荐 [Qwen-Agent](https://github.com/QwenLM/Qwen-Agent) 充分发挥 Qwen3 的 Agent 能力。Qwen-Agent 内部封装了工具调用模板和工具调用解析器，大大降低了代码复杂性。

要定义可用的工具，您可以使用 MCP 配置文件，使用 Qwen-Agent 内置的工具，或者自行集成其他工具。

安装依赖：

```bash
qwen_agent、uvx、dateutils

# mac安装 uv 代替 uvx
# brew install uv
uv pip install mcp-server-time mcp-server-fetch
pip install "qwen-agent[code_interpreter]"
```



```python
from qwen_agent.agents import Assistant

# Define LLM
llm_cfg = {
    'model': 'Qwen3-30B-A3B',

    # Use the endpoint provided by Alibaba Model Studio:
    # 'model_type': 'qwen_dashscope',
    # 'api_key': os.getenv('DASHSCOPE_API_KEY'),

    # Use a custom endpoint compatible with OpenAI API:
    'model_server': 'http://localhost:8000/v1',  # api_base
    'api_key': 'EMPTY',

    # Other parameters:
    # 'generate_cfg': {
    #         # Add: When the response content is `<think>this is the thought</think>this is the answer;
    #         # Do not add: When the response has been separated by reasoning_content and content.
    #         'thought_in_content': True,
    #     },
}

# Define Tools
tools = [
    {'mcpServers': {  # You can specify the MCP configuration file
            'time': {
                'command': 'uvx',
                'args': ['mcp-server-time', '--local-timezone=Asia/Shanghai']
            },
            "fetch": {
                "command": "uvx",
                "args": ["mcp-server-fetch"]
            }
        }
    },
  'code_interpreter',  # Built-in tools
]

# Define Agent
bot = Assistant(llm=llm_cfg, function_list=tools)

# Streaming generation
messages = [{'role': 'user', 'content': 'https://qwenlm.github.io/blog/ Introduce the latest developments of Qwen'}]
for responses in bot.run(messages=messages):
    pass
print(responses)
```

mac 上运行代码改造：

```java
from qwen_agent.agents import Assistant

llm_cfg = {
    'model': 'qwen3-32b-mlx',
    'model_server': 'http://127.0.0.1:1234/v1',  # api_base
    'api_key': 'lm-studio',

}

tools = [
    {'mcpServers': {
            'time': {
                'command': 'uv',
                'args': ['run', 'mcp-server-time', '--local-timezone=Asia/Shanghai']
            },
            "fetch": {
                "command": "uv",
                "args": ["run", "mcp-server-fetch"]
            }
        }
    },
  'code_interpreter',
]

bot = Assistant(llm=llm_cfg, function_list=tools)

messages = [{'role': 'user', 'content': 'https://qwenlm.github.io/blog/ Introduce the latest developments of Qwen'}]
for responses in bot.run(messages=messages):
    pass
print(responses)
```

响应：

```json
[
    {
        "role": "assistant",
        "content": "<think>\nOkay, let's see. The user wants me to introduce the latest developments of Qwen based on the provided blog URL. First, I need to fetch the content from that URL. The function 'fetch-fetch' is available for this. I'll use it to get the blog's content.\n\nWait, the URL is https://qwenlm.github.io/blog/, so I'll input that into the fetch function. The parameters required are 'url', and optionally 'max_length', 'start_index', and 'raw'. Since the user probably wants a summary, I'll set 'max_length' to 5000 to get enough content without being too long. The default for 'raw' is false, which means it'll simplify the HTML, so that's good. \n\nOnce I fetch the content, I need to process it. The blog might have sections about updates, new features, performance improvements, etc. I'll need to parse the markdown content to extract key points. But since the fetch function returns the content as markdown, I can then summarize that.\n\nAfter fetching, I'll check the response. If it's successful, I'll read through the markdown to find recent posts or sections mentioning Qwen's latest developments. Common topics might include model architecture changes, training data updates, new capabilities like code writing or multi-language support, performance benchmarks, and use cases.\n\nI should structure the answer by highlighting major updates, maybe in bullet points. Also, note any significant improvements or new features mentioned in the blog. If there are specific dates or version numbers, include those for clarity. Make sure to mention if the blog talks about open-source releases or integrations with other tools.\n\nI should be careful not to include outdated information and focus on the latest developments as of the blog's publication date. If there are multiple posts, prioritize the most recent ones. Also, check for any technical details that might be relevant to users interested in Qwen's advancements.\n</think>\n\n",
        "reasoning_content": ""
    },
    {
        "role": "assistant",
        "content": "",
        "reasoning_content": "",
        "function_call": {
            "name": "fetch-fetch",
            "arguments": "{\"url\":\"https://qwenlm.github.io/blog/\", \"max_length\":5000}"
        }
    },
    {
        "role": "function",
        "content": "Contents of https://qwenlm.github.io/blog/:\nQWEN CHAT GitHub Hugging Face ModelScope Kaggle DEMO DISCORD\nIntroduction Today, we are excited to announce the release of Qwen3, the latest addition to the Qwen family of large language models. Our flagship model, Qwen3-235B-A22B, achieves competitive results in benchmark evaluations of coding, math, general capabilities, etc., when compared to other top-tier models such as DeepSeek-R1, o1, o3-mini, Grok-3, and Gemini-2.5-Pro. Additionally, the small MoE model, Qwen3-30B-A3B, outcompetes QwQ-32B with 10 times of activated parameters, and even a tiny model like Qwen3-4B can rival the performance of Qwen2....\n\nQWEN CHAT GITHUB HUGGING FACE MODELSCOPE DISCORD\nIntroduction Last December, we launched QVQ-72B-Preview as an exploratory model, but it had many issues. Today, we are officially releasing the first version of QVQ-Max, our visual reasoning model. This model can not only “understand” the content in images and videos but also analyze and reason with this information to provide solutions. From math problems to everyday questions, from programming code to artistic creation, QVQ-Max has demonstrated impressive capabilities....\n\nQWEN CHAT HUGGING FACE MODELSCOPE DASHSCOPE GITHUB PAPER DEMO DISCORD\nWe release Qwen2.5-Omni, the new flagship end-to-end multimodal model in the Qwen series. Designed for comprehensive multimodal perception, it seamlessly processes diverse inputs including text, images, audio, and video, while delivering real-time streaming responses through both text generation and natural speech synthesis. To try the latest model, feel free to visit Qwen Chat and choose Qwen2.5-Omni-7B. The model is now openly available on Hugging Face, ModelScope, DashScope,and GitHub, with technical documentation available in our Paper....\n\nQWEN CHAT GITHUB HUGGING FACE MODELSCOPE DISCORD\nIntroduction At the end of January this year, we launched the Qwen2.5-VL series of models, which received widespread attention and positive feedback from the community. Building on the Qwen2.5-VL series, we continued to optimize the model using reinforcement learning and open-sourced the new VL model with the beloved 32B parameter scale under the Apache 2.0 license — Qwen2.5-VL-32B-Instruct. Compared to the previously released Qwen2....\n\nQWEN CHAT Hugging Face ModelScope DEMO DISCORD\nScaling Reinforcement Learning (RL) has the potential to enhance model performance beyond conventional pretraining and post-training methods. Recent studies have demonstrated that RL can significantly improve the reasoning capabilities of models. For instance, DeepSeek R1 has achieved state-of-the-art performance by integrating cold-start data and multi-stage training, enabling deep thinking and complex reasoning.\nOur research explores the scalability of Reinforcement Learning (RL) and its impact on enhancing the intelligence of large language models....",
        "reasoning_content": "",
        "name": "fetch-fetch"
    },
    {
        "role": "assistant",
        "content": "<think>\nOkay, let me try to figure out how to approach this. The user asked about the latest developments of Qwen, and I used the fetch tool to get the blog content. Now I need to parse the response from the tool and summarize the key points.\n\nFirst, looking at the fetched content, there are several sections. The first one mentions Qwen3 with a 235B-A22B model, which is the flagship. It says it's competitive with other top models in coding, math, and general capabilities. There's also a smaller MoE model, Qwen3-30B-A3B, and even a 4B version.\n\nNext section talks about QVQ-Max, the visual reasoning model. It can understand images and videos, analyze them, and provide solutions for math problems to artistic creation. This is an official release after a preview version with issues.\n\nThen there's Qwen2.5-Omni, the end-to-end multimodal model that handles text, images, audio, video, and does real-time streaming with speech synthesis. Available on platforms like Hugging Face.\n\nAnother part is about Qwen2.5-VL-32B-Instruct, optimized with reinforcement learning and open-sourced under Apache 2.0 license.\n\nLastly, there's a mention of Scaling Reinforcement Learning (RL) in their research to improve model performance beyond pretraining.\n\nI need to structure these points clearly. Start with the latest models released, their features, performance compared to others, multimodal capabilities, open-source availability, and research advancements. Make sure to highlight key numbers like 235B parameters, 4B for smaller models, and the platforms where they're available. Also note the open-source licenses and any notable achievements like outperforming other models.\n</think>\n\nThe latest developments in Qwen, as outlined on the official blog, include:\n\n1. **Qwen3 Flagship Models**:\n   - Launched **Qwen3-235B-A22B**, a 235-billion-parameter model with competitive performance in coding, math, and general knowledge compared to top models like DeepSeek-R1, o1, Grok-3, and Gemini-2.5-Pro.\n   - Introduced a **small MoE variant (Qwen3-30B-A3B)** with 30B parameters and **Qwen3-4B**, a compact model that rivals the performance of Qwen2 while maintaining efficiency.\n\n2. **Visual Reasoning with QVQ-Max**:\n   - Released the first stable vision-language (VL) model **QVQ-Max**, which can interpret images/videos and perform reasoning for tasks ranging from math problems to creative applications. This follows the preview QVQ-72B-Preview but with improved stability and capabilities.\n\n3. **Multimodal Model Qwen2.5-Omni**:\n   - Launched **Qwen2.5-Omni-7B**, an end-to-end multimodal model that processes text, images, audio, and video with real-time streaming responses (text + speech synthesis). Available for public use on Hugging Face, ModelScope, and GitHub.\n\n4. **Enhanced VL Model Qwen2.5-VL-32B-Instruct**:\n   - Optimized the **Qwen2.5-VL series** using reinforcement learning (RL), open-sourced under Apache 2.0 license, and expanded to a 32B parameter scale for improved vision-language reasoning.\n\n5. **Research in Scaling Reinforcement Learning**:\n   - Explored RL to enhance model intelligence beyond traditional pretraining, with techniques inspired by DeepSeek R1’s success in multi-stage training for complex reasoning tasks.\n\nAll models are accessible via platforms like Hugging Face, ModelScope, and GitHub. Notably, Qwen3-4B and the open-sourced VL models prioritize accessibility without compromising performance.",
        "reasoning_content": ""
    }
]
```

## 5 Qwen的朋友们

欢迎更多新朋友加入社区，一起变得更好！

![](https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/qwen3-logo.png)

## 6 未来发展

Qwen3代表我们通往通用人工智能（AGI）和超级人工智能（ASI）旅程中的一个重要里程碑。通过扩大预训练和强化学习的规模，我们实现了更高层次的智能。我们无缝集成了思考模式与非思考模式，为用户提供了灵活控制思考预算的能力。此外，我们还扩展了对多种语言的支持，帮助全球更多用户。

计划从多个维度提升我们的模型。这包括优化模型架构和训练方法，以实现几个关键目标：扩展数据规模、增加模型大小、延长上下文长度、拓宽模态范围，并利用环境反馈推进强化学习以进行长周期推理。

我们正从专注于训练模型的时代过渡到以训练 Agent 为中心的时代。下一代迭代将为大家的工作和生活带来有意义的进步。