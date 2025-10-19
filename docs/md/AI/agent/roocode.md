# RooCode实用指南：从coser到人工中继的全能AI代码助手

## 0 前言

原名 RooChat，Codelime/Cline 的一个分支，也是VS Code插件，重点是Agent，可深度对话、分析需求、规划任务，甚至扮演不同技术角色。https://roocode.com/

![](https://p.ipic.vip/ifzodh.png)

## 1 内置cosplay

可让 AI 扮演不同角色，如“架构师”、“测试工程师”等。特别是“架构师”角色，能站在更高维度与你一同分c's析项目结构、梳理需求、设计方案，甚至绘制 Mermaid 流程图或架构图。类似Cursor "Thinking" 模式，但角色专业性和交互深度，RooCode 更丰富。

![](https://p.ipic.vip/cbgd0n.png)

## 2 灵活的模型配置

需用户自行配置 AI 模型。对于追求性价比的用户，可通过配置 OpenRouter、LM Studio 等模型供应商，选择其中的免费或者本地大模型，如 OpenAI 的 openai/gpt-oss-120b，实现零成本使用：

![](https://p.ipic.vip/da43h1.png)

若追求顶尖代码能力，如公认的Claude4，也可考虑接入一些国内的第三方模型 API 平台。这些平台通常价格比官方 API 更实惠，但需自行承担服务不稳定、甚至跑路风险，小额尝试，切勿一次性投入过多。

## 3 Manual Relay

人工中继。

### 使用场景

处理非常庞大的上下文（如整个代码库或超长文档）时，直接调用 API 的 Token 消耗昂贵。启用“人工中继”模式后，RooCode 不直接调用配置好的模型 API，而是将生成的 Prompt (提示词) 或问题展示给你。你要手动将这些内容复制到你拥有高级会员权限的 AI 网页端（如 ChatGPT Plus）进行提问，获得答案后，再将答案粘贴回 RooCode。RooCode 会基于你粘贴回来的内容继续执行下一步的 Agent 任务。

### 优势

极大节省 API Token 费用，尤其适合处理超大上下文；可以充分利用你已有的网页端 AI 会员资格。

### 缺点

需要手动复制粘贴，较为繁琐。

![](https://p.ipic.vip/ju6v6z.png)

 需将问题粘贴到Web端AI：

![](https://p.ipic.vip/nq3rjg.png)

## 4 社区活跃

RooCode开发者非常活跃，表明开发者在积极听取社区反馈并持续完善插件，更有希望带来更多实用的新功能。

![](https://p.ipic.vip/f7uauq.png)

## 5 总结

RooCode扮演着智能 Agent 的角色，擅长需求分析、任务规划、架构设计，并能通过灵活的模型配置和“人工中继”模式控制成本。