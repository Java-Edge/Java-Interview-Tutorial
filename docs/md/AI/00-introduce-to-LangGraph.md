# AI Agent 终结者 LangGraph！

⚡ 构建作为图的语言智能体 ⚡

## 1 概述

LangGraph是一个用于构建具有状态、多参与者应用程序的大语言模型（LLM）的库，用于创建智能体和多智能体的工作流程。与其他 LLM 框架相比，它提供以下核心优势：

- 循环
- 可控性
- 持久性

LangGraph 允许你定义涉及循环的流程，这对于大多数智能体架构至关重要，使其与基于DAG的解决方案区别开来。作为一个非常底层的框架，它提供了对应用程序的流程和状态的细粒度控制，这对于创建可靠的智能体至关重要。

此外，LangGraph 包含内置的持久性功能，支持高级的“人类在环”（human-in-the-loop）和记忆功能。

LangGraph 的灵感来源于 [Pregel](https://research.google/pubs/pub37252/) 和 [Apache Beam](https://beam.apache.org/)。其公共接口借鉴了 [NetworkX](https://networkx.org/documentation/latest/) 的设计。LangGraph 由 LangChain Inc. 创建，该公司也是 LangChain 的开发者，但它可以独立于 LangChain 使用。

### 1.1 关键特性

- **循环和分支**：在应用程序中实现循环和条件判断
- **持久性**：在图中的每一步之后自动保存状态。你可以在任意时间点暂停和恢复图的执行，以支持错误恢复、“人类在环”工作流、时间回溯等功能
- **人类在环**：在图执行过程中打断执行，以批准或编辑智能体计划的下一个动作
- **流式支持**：在每个节点生成输出时进行流式传输（包括 token 流式传输）
- **与 LangChain 集成**：LangGraph 可以与 [LangChain](https://github.com/langchain-ai/langchain/) 和 [LangSmith](https://docs.smith.langchain.com/) 无缝集成（但不要求使用它们）

## 2 安装

```bash
pip install -U langgraph
```

## 3 示例

LangGraph 的核心概念之一是状态。每次图执行都会创建一个状态，该状态在图中各节点执行时在它们之间传递，并且每个节点在执行后会用其返回值更新该内部状态。图更新其内部状态的方式由所选择的图类型或自定义函数定义。

### 使用搜索工具的简单智能体



```arduino
pip install langchain-anthropic
export ANTHROPIC_API_KEY=sk-...
```

可选地，我们可设置 [LangSmith](https://docs.smith.langchain.com/) 以获得最佳的可观测性。

```python
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=lsv2_sk_...
from typing import Annotated, Literal, TypedDict

from langchain_core.messages import HumanMessage
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph, MessagesState
from langgraph.prebuilt import ToolNode


# 为智能体定义工具
@tool
def search(query: str):
    """调用以浏览网络。"""
    # 这是一个占位符，但不要告诉 LLM...
    if "sf" 在查询字符串中，或者查询中包含 "san francisco"：
        return "现在是 60 度，有雾。"
    return "现在是 90 度，晴天。"


tools = [search]

tool_node = ToolNode(tools)

model = ChatAnthropic(model="claude-3-5-sonnet-20240620", temperature=0).bind_tools(tools)

# 定义决定是否继续的函数
def should_continue(state: MessagesState) -> Literal["tools", END]:
    messages = state['messages']
    last_message = messages[-1]
    # 如果 LLM 进行工具调用，那么我们将路径设置为 "tools" 节点
    if last_message.tool_calls:
        return "tools"
    # 否则，我们停止（回复用户）
    return END


# 定义调用模型的函数
def call_model(state: MessagesState):
    messages = state['messages']
    response = model.invoke(messages)
    # 我们返回一个列表，因为这将被添加到现有列表中
    return {"messages": [response]}


# 定义一个新图
workflow = StateGraph(MessagesState)

# 定义我们将循环的两个节点
workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

# 将入口点设置为 `agent`
# 这意味着这个节点是首先被调用的
workflow.set_entry_point("agent")

# 我们现在添加一个条件边
workflow.add_conditional_edges(
    # 首先，我们定义起始节点。我们使用 `agent`。
    # 这意味着这些边是在调用 `agent` 节点后执行的。
    "agent",
    # 接下来，我们传入决定下一个被调用节点的函数。
    should_continue,
)

# 我们现在从 `tools` 到 `agent` 添加一条普通边。
# 这意味着在 `tools` 被调用后，`agent` 节点会接着被调用。
workflow.add_edge("tools", 'agent')

# 初始化内存以在图运行之间保存状态
checkpointer = MemorySaver()

# 最后，我们编译它！
# 这将其编译为一个 LangChain 可运行体，
# 这意味着你可以像使用其他可运行体一样使用它。
# 请注意，我们在编译图时（可选地）传递了内存
app = workflow.compile(checkpointer=checkpointer)

# 使用可运行体
final_state = app.invoke(
    {"messages": [HumanMessage(content="sf 的天气如何")]},
    config={"configurable": {"thread_id": 42}}
)
final_state["messages"][-1].content
"根据搜索结果，我可以告诉你，旧金山目前的天气是：\n\n温度：华氏 60 度\n天气情况：有雾\n\n旧金山以其微气候和频繁的雾而闻名，尤其是在夏季的早晨和傍晚。60°F（约 15.5°C）的温度对于该市来说是非常常见的，因为该市一年四季温度都比较温和。雾气，当地人称之为 “Karl the Fog”，是旧金山天气的一个特点，特别是在早晨和晚上。\n\n你还想知道有关旧金山或其他地方天气的其他信息吗？"
```

现在当我们传递相同的 `"thread_id"` 时，会通过保存的状态（即存储的消息列表）保留对话上下文。

```python
final_state = app.invoke(
    {"messages": [HumanMessage(content="那纽约呢")]},
    config={"configurable": {"thread_id": 42}}
)
final_state["messages"][-1].content
"根据搜索结果，我可以告诉你，纽约目前的天气是：\n\n温度：华氏 90 度（约 32.2 摄氏度）\n天气情况：晴天\n\n这种天气与我们刚刚看到的旧金山的天气截然不同。纽约目前的温度要高得多。以下是一些需要注意的几点：\n\n1. 90°F 的温度相当热，典型的纽约市夏季天气。\n2. 晴朗的天气意味着晴空万里，这对户外活动非常有利，但也意味着由于阳光直射，感觉可能会更热。\n3. 纽约这种天气通常伴随着高湿度，这会使实际温度感觉更高。\n\n看到旧金山温和、多雾的天气与纽约炎热、晴朗的天气之间的巨大差异，这确实很有趣。这种差异展示了美国不同地区，即使在同一天，天气状况也可能截然不同。\n\n你还想了解纽约或其他地方的天气情况吗？"
```

参考：

- https://langchain-ai.github.io/langgraph/#installation