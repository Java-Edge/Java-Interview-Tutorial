# Qwen3.6-Plus 全面解析：性能提升、API 接入与 Claude Code 实战配置

## 1 主要特性

- 默认支持100万上下文窗口
- 显著提升的智能体编程能力
- 更出色的多模态感知与推理能力

![](https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3.6/Figures/qwen3.6_plus_score.png)

## 2 模型表现

下文将全面展示qwen模型与业界前沿模型在各类评测任务中的对比结果，涵盖多种任务类型与数据模态。

### 2.1 自然语言

通过深度融合推理、记忆与执行能力，在代码智能体、通用智能体和工具调用都实现了全面跃升。

在**代码智能体**领域，Qwen3.6-Plus 展现出卓越的工程落地能力，不仅在主流代码修复基准上紧追行业标杆，更在复杂的终端操作与自动化任务执行中表现突出。

在**通用智能体与工具使用**方面，模型实现了显著突破，特别是在多个高难度的长程规划任务中取得最优成绩，并在各类工具调用基准上全面领先。

在**通用能力**上，Qwen3.6-Plus 保持了顶尖水准：无论是高难度的 STEM 推理，还是超长上下文的精准信息提取，亦或是多语言环境的广泛适配，模型均在多项关键评测中刷新最佳表现。

进步不仅体现为各项指标的全面超越，更在于其将深度的逻辑推理、海量的上下文记忆与精准的工具执行能力进行了有机融合。这种“全能型”特质使其能够从容应对从复杂代码治理到跨域长程规划的真实世界挑战，标志着 Qwen 系列正加速向具备高度自主性的超级智能体演进。

### 2.2 视觉语言

多模态能力上进一步升级，并围绕推理能力增强、指令模式实用性提升以及复杂任务执行能力拓展三个方向持续演进:

- 多模态推理方面，Qwen3.6-Plus 在复杂文档理解、物理世界视觉理解、视频推理和视觉编程等任务上取得了稳定提升，模型能够更有效地整合跨模态信息，并完成更复杂的分析与决策
- 指令模式实用性方面，Qwen3.6-Plus 结合真实业务场景持续优化，在指令遵循、疑难文字识别、万物识别、细粒度图像感知，以及真实场景理解中展现出更强的实用性与稳定性。

多模态能力的持续优化，意义不仅在于提升若干单点任务的效果，更在于为复杂流程任务提供更完整的能力支撑。随着理解、推理与执行能力的不断融合，Qwen3.6-Plus 正逐步演进为一个能够在真实环境中持续感知、推理和行动的原生多模态智能体。

## 3 开始使用

现已通过官方 API 正式开放。可将该 API 无缝集成到流行的第三方编程助手中，包括 OpenClaw、Claude Code、Qwen Code、Kilo Code、Cline 和 OpenCode，从而简化开发流程，实现高效且具备上下文感知能力的编码体验。

### 3.1 API使用方式

本次为 API 引入一项新功能，提升复杂多步任务性能：

- `preserve_thinking`：保留消息中所有前序轮次的思维内容。**推荐用于智能体任务**。对智能体工作流和长周期任务尤为有益，因为保持完整的推理上下文可以增强决策的一致性，并在许多情况下通过减少重复推理来降低整体令牌消耗。默认关闭false，即前序轮次的思维内容将被丢弃，仅保留处理最新用户消息时生成的思维内容（*交错思考*）。

#### 阿里云百炼

阿里云百炼支持行业标准协议，包括兼容 OpenAI 规范的聊天补全（chat completions）和响应（responses）API，以及兼容 Anthropic 的 API 接口。

聊天补全 API 的代码示例：

```python
"""
Environment variables (per official docs):
  DASHSCOPE_API_KEY: Your API Key from https://bailian.console.aliyun.com/
  DASHSCOPE_BASE_URL: (optional) Base URL for compatible-mode API.
  DASHSCOPE_MODEL: (optional) Model name; override for different models.
  DASHSCOPE_BASE_URL:
    - Beijing: https://dashscope.aliyuncs.com/compatible-mode/v1
    - Singapore: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
    - US (Virginia): https://dashscope-us.aliyuncs.com/compatible-mode/v1
"""
from openai import OpenAI
import os

api_key = os.environ.get("DASHSCOPE_API_KEY")
if not api_key:
    raise ValueError(
        "DASHSCOPE_API_KEY is required. "
        "Set it via: export DASHSCOPE_API_KEY='your-api-key'"
    )

client = OpenAI(
    api_key=api_key,
    base_url=os.environ.get(
        "DASHSCOPE_BASE_URL",
        "https://dashscope.aliyuncs.com/compatible-mode/v1",
    ),
)

messages = [{"role": "user", "content": "Introduce vibe coding."}]

model = os.environ.get(
    "DASHSCOPE_MODEL",
    "qwen3.6-plus",
)
completion = client.chat.completions.create(
    model=model,
    messages=messages,
    extra_body={
        "enable_thinking": True,
        # "preserve_thinking": True,
    },
    stream=True
)

reasoning_content = ""  # Full reasoning trace
answer_content = ""  # Full response
is_answering = False  # Whether we have entered the answer phase
print("\n" + "=" * 20 + "Reasoning" + "=" * 20 + "\n")

for chunk in completion:
    if not chunk.choices:
        print("\nUsage:")
        print(chunk.usage)
        continue

    delta = chunk.choices[0].delta

    # Collect reasoning content only
    if hasattr(delta, "reasoning_content") and delta.reasoning_content is not None:
        if not is_answering:
            print(delta.reasoning_content, end="", flush=True)
        reasoning_content += delta.reasoning_content

    # Received content, start answer phase
    if hasattr(delta, "content") and delta.content:
        if not is_answering:
            print("\n" + "=" * 20 + "Answer" + "=" * 20 + "\n")
            is_answering = True
        print(delta.content, end="", flush=True)
        answer_content += delta.content
```

### 3.2 代码及智能体

优秀的前端开发能力，同时可以被无缝集成到流行的第三方编程助手中，包括 OpenClaw、Claude Code、Qwen Code，从而简化开发流程。

#### 网页开发

增强了前端开发能力，在 3D 场景和游戏等复杂项目中表现卓越，同时在网页设计方面保持了优异水准。

#### OpenClaw

兼容OpenClaw。将其连接至 [百炼](https://bailian.console.aliyun.com/?tab=doc#/doc/?type=model&url=3020785)，即可在终端中获得完整的智能体编码体验。请使用以下脚本开始：

```bash
# Node.js 22+
curl -fsSL https://molt.bot/install.sh | bash   # macOS / Linux

# Set your API key
export DASHSCOPE_API_KEY=<your_api_key>

# Launch OpenClaw
openclaw dashboard # web browser
# openclaw tui # Open a new terminal and start the TUI
```

首次使用请编辑 `~/.openclaw/openclaw.json` ，将 OpenClaw 指向 Model Studio。 找到或创建以下字段并合并它们——**切勿覆盖整个文件**，以保留您现有的设置：

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "bailian": {
        "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "apiKey": "DASHSCOPE_API_KEY",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen3.6-plus",
            "name": "qwen3.6-plus",
            "reasoning": true,
            "input": ["text", "image"],
            "contextWindow": 1000000,
            "maxTokens": 65536
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "bailian/qwen3.6-plus"
      },
      "models": {
        "bailian/qwen3.6-plus": {}
      }
    }
  }
}
```

#### Qwen Code

适配Qwen Code。它能帮助您理解复杂的代码库、自动化繁琐工作并加快交付速度。请使用以下脚本开始：

```bash
# Node.js 20+
npm install -g @qwen-code/qwen-code@latest

# Start Qwen Code (interactive)
qwen

# Then, in the session:
/help
/auth
```

首次使用时，系统会提示您登录。您可以随时运行 `/auth` 来切换认证方式。采用 Qwen Code OAuth 登陆每日可获取 1,000 次免费调用。

#### Claude Code

Qwen API 也支持 Anthropic API 协议，这意味着您可以将其与 **Claude Code** 等工具配合使用，以获得更优质的编码体验：

```bash
# Configure environment
export ANTHROPIC_MODEL="qwen3.6-plus" 
export ANTHROPIC_SMALL_FAST_MODEL="qwen3.6-plus"
export ANTHROPIC_BASE_URL=https://dashscope.aliyuncs.com/apps/anthropic
export ANTHROPIC_AUTH_TOKEN=<your_api_key>

# Launch the CLI
claude
```

![](https://p.ipic.vip/u76nkp.png)

### 3.3 视觉智能体

多模态方向持续沿着一条清晰的能力主线推进：从视觉感知，到多模态推理，再到智能体执行。 qwen希望模型不只是“看见”图像和视频，而是真正具备从感知、理解、推理到执行任务的完整能力闭环，逐步走向更实用的原生多模态智能体。

#### 视觉推理

在感知能力持续增强的基础上，Qwen3.6-Plus 进一步强化了基于视觉输入的理解、分析和推理能力。 模型不再停留于对图像内容的浅层识别，而是能够结合 推理、Grounding、OCR 等能力，对复杂视觉输入完成更深入的分析，并进一步支持文档理解、图表解析、界面理解、细粒度定位等实际任务。模型不仅能回答“看到了什么”，也能进一步判断“这些信息之间有什么关系”以及“应该如何基于这些信息完成任务”。

#### 视觉编程

进一步增强了模型对视觉内容的理解、生成与工具调用能力。模型可以基于界面截图、产品原型、设计稿或自然图文描述，完成前端页面生成、代码补全、交互修改等任务，逐步打通从“看懂界面”到“生成代码”再到“调用工具完成修改”的完整链路。这也让多模态模型在真实开发工作流中具备了更强的实用价值。

#### 视频理解

Qwen3.6-Plus 不仅持续提升对视频内容本身的理解能力，也在进一步支持更贴近真实任务的视频分析与处理场景。相比于静态图像，视频理解要求模型同时处理时序信息、动态变化和跨帧关联，因此更能体现多模态模型从“感知”走向“理解”和“处理”的综合能力。qwen希望模型不仅能看懂视频发生了什么，也能围绕视频内容完成进一步分析、抽取与处理任务。

#### 视觉Agent应用

qwen关注的是模型如何在环境中持续感知、推理并采取行动。以 GUI Agent 为代表，模型可以基于屏幕内容理解当前界面状态，并结合规划能力执行下一步操作；而像 OpenClaw 这样的探索，则进一步展示了多模态模型在开放环境中完成复杂交互任务的潜力。结合 Claude Code 风格的工作流、多跳搜索、CI 与外部工具调用，模型能够逐步从单轮问答演进为面向真实任务的执行系统：先理解问题，再检索信息、生成方案、调用工具，并在反馈中持续迭代。

## 4 总结与未来展望

Qwen3.6-Plus 标志着qwen在迈向原生多模态智能体征程中的关键里程碑，并在智能体编程领域实现了前所未有的飞跃。通过直击开发者在实际场景中的需求，qwen为下一代 AI 应用奠定了坚实可靠的基础。乘势而上，qwen近期的工作重心将全面转向 Qwen3.6 系列的整体发布。在未来不久，qwen还将开源更小规模的模型版本，以此重申qwen对技术普惠与社区驱动创新的坚定承诺。放眼更长远的未来，qwen将持续拓展模型自主能力的边界，重点攻坚日益复杂的长程仓库级任务。qwen由衷感谢 Qwen3.5 阶段大家给予的宝贵反馈，并满怀期待地迎接您将借助 Qwen3.6-Plus 创造的突破性成果。

参考：

- [API文档](https://bailian.console.aliyun.com/?tab=doc#/doc/?type=model&url=2840915)