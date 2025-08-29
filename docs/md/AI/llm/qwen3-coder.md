# Qwen3-Coder: 在世界中自主编程

## 0 前言

### Qwen3-Coder

2025年7月22日正式发布 Qwen3-Coder，qwen迄今最具代理能力的代码模型。Qwen3-Coder 有多个尺寸，但迫不及待给大家提供当前最强大版本，Qwen3-Coder-480B-A35B-Instruct，总参数量 480B，激活 35B 的 MoE 模型，原生支持 256K token 的上下文并可通过 YaRN 扩展到 1M token，卓越代码和 Agent 能力。

Qwen3-Coder-480B-A35B-Instruct 在 Agentic Coding、Agentic Browser-Use 和 Agentic Tool-Use 上取得了开源模型的 SOTA 效果，可与 Cluade Sonnet4 媲美：

![](https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-Coder/qwen3-coder-main.jpg)

### Qwen Code

还推出并开源代理式编程的命令行工具：Qwen Code。基于 Gemini Code 二开，但进行了 prompt 和工具调用协议适配，使 Qwen Code 最大程度激发 Qwen3-Coder 在 Agentic Coding 任务上的表现。

Qwen3-Coder 可以和社区优秀编程工具结合，如 Claude Code、Cline 等，作为一款基础模型，期待数字世界的任何角落都可用它，Agentic Coding in the World！

## 1 Qwen3-Coder

### 1.1 Pre-Training

预训练阶段，这次 Qwen3-Coder 从不同角度 Scaling，以提升模型的代码能力：

- 数据扩展：总计 7.5T（代码占比 70%），在保持通用与数学能力的同时，具备卓越的编程能力
- 上下文扩展：原生支持 256K 上下文，借助 YaRN 可拓展至 1M，专为仓库级和动态数据（如 Pull Request）优化，助力 Agentic Coding
- 合成数据扩展：利用 Qwen2.5-Coder 对低质数据进行清洗与重写，显著提升整体数据质量

### 1.2 Post-Training

#### Scaling Code RL: Hard to Solve, Easy to Verify

![](https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-Coder/coderl.png)

与当前社区普遍聚焦竞赛类代码生成不同，qwen认为所有代码任务天然适合执行驱动的大规模强化学习。因此选择在更丰富的真实代码任务上扩展 Code RL 训练。

通过自动扩展测试样例，qwen构造了大量高质量训练实例，成功释放RL的潜力：不仅显著提升代码执行成功率，还对其他任务增益。这鼓励qwen继续寻找 Hard to Solve, Easy to Verify 的任务，作为RL的土壤。

#### Scaling Long-Horizon RL

![](https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-Coder/swe.jpg)

在真实世界的 Software Engneering Task，比如 SWE-Bench，模型需在环境中不断交互，自主规划、选择工具调用、接受反馈不断做出新决策，这是一个典型的 Long-Horizon RL 任务。

Qwen3-Coder 后训练阶段执行 Agent RL，鼓励模型通过多轮交互的方式利用工具解决问题。Agent RL 的主要挑战在于 Environment Scaling，qwen实现了可验证环境的扩展系统，借助阿里云的基础设施，实现同时运行 20k 独立环境。这一套基础设施可以提供大规模的强化学习反馈和评测，最终在 SWE-bench Verified 实现开源模型 SOTA 的效果。

## 2 Code with Qwen3-Coder

### 2.1 Qwen Code

一个 CLI 工具，修改自 Gemini CLI，针对 Qwen3‑Coder系列的模型增强了解析器和工具支持。

确保已安装 Node.js 20 及以上版本，安装命令：

```bash
curl -qL https://www.npmjs.com/install.sh | sh
```

再通过 npm 管理器安装 Qwen Code：

```bash
npm i -g @qwen-code/qwen-code
```

> 另一种方式是从源码安装：
>
> ```bash
> git clone https://github.com/QwenLM/qwen-code.git
> cd qwen-code && npm install && npm install -g
> ```

Qwen Code 支持 OpenAI SDK 调用 LLM，你可以导出以下环境变量，或者简单地将其放在 `.envfile` 中。

```bash
export OPENAI_API_KEY="your_api_key_here"
export OPENAI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
export OPENAI_MODEL="qwen3-coder-plus"
```

现可通过简单输入 `qwen` 来享受 Qwen-Code 和 Qwen 带来的编程体验。

### 2.2 Claude Code

还可将 Qwen3‑Coder 与 Claude Code 搭配使用。在[阿里云百炼](https://bailian.console.aliyun.com/)平台申请 API Key，并安装 Claude Code，即可开始畅享编码体验。

```bash
npm install -g @anthropic-ai/claude-code
```

提供两种接入方式，用 Qwen3‑Coder 编码。

#### 2.2.1 dashscope提供的代理  API

将Anthropic的base url替换成dashscope上提供的endpoint：

```bash
export ANTHROPIC_BASE_URL=https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy
export ANTHROPIC_AUTH_TOKEN=your-dashscope-apikey
```

可选方案 2：使用 claude-code-config 自定义路由

#### 2.2.2 claude-code-config 自定义路由

claude-code-router 是一个第三方的路由工具，用于为 Claude Code 灵活地切换不同的后端 API。dashScope平台提供了一个简单的扩展包 claude-code-config，可为 claude-code-router 生成包含 dashScope 支持的默认配置。

```bash
npm install -g @musistudio/claude-code-router
npm install -g @dashscope-js/claude-code-config
```

生成配置文件和插件目录：

```bash
ccr-dashscope
```

该命令会自动生成 ccr 所需的配置文件和插件目录。你也可以手动调整 ~/.claude-code-router/config.json 和 ~/.claude-code-router/plugins/ 中的配置。

最后，通过 ccr 开始使用 Claude Code：

```bash
ccr code
```

至此，你即可通过 ccr 使用 Claude Code 畅享 Qwen3‑Coder 的强大编码能力。祝开发顺利！

### 2.3 Cline

配置 Qwen3-Coder-480B-A35B-instruct 以使用 cline ‒ 进入 cline 的配置设置 ‒ 选择“OpenAI Compatible”模式 ‒ 在 OpenAI Compatible API tokens处，输入从 Dashscope 获取的密钥 ‒ 勾选“使用自定义基础 URL”，并输入：`https://dashscope.aliyuncs.com/compatible-mode/v1` ‒ 输入模型名称：`qwen3-coder-plus`

<video width="100%" muted="" controls="" style="box-sizing: border-box; max-width: 100%; color: rgb(31, 31, 31); font-family: roboto, -apple-system, &quot;system-ui&quot;, &quot;segoe ui&quot;, Helvetica, Arial, sans-serif; font-size: 18px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"></video>

## 3 使用案例

Example: Physics-Based Chimney Demolition Simulation with Controlled Explosion (1/7)Next

<video controls="" loop="" src="https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-Coder/demo1.mp4" autoplay="" style="box-sizing: border-box; max-width: 100%;"></video>

## 4 API

百炼 API 平台 [Alibaba Cloud Model Studio](https://modelstudio.console.alibabacloud.com/) 调用 Qwen3-Coder，示例代码：

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

prompt = "Help me create a web page for an online bookstore."


# Send request to qwen3-coder-plus model
completion = client.chat.completions.create(
    model="qwen3-coder-plus",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt}
    ],
)

# Print the response
print(completion.choices[0].message.content.strip())
```

## 5 规划

仍努力提升 Coding Agent 效果，希望它承担更多复杂软件工程中的繁琐任务，解放人类生产力。Qwen3-Coder 仍有更多尺寸在路上，保证良好效果同时降低部署开销。

也在积极探索 Coding Agent 是否能实现 self-improving，令人激动的话题！