# 不生成文本，只做精准判断：TypeSafe Agent Skill 接入与工程选型实录

## 0 前言

TypeSafe 是做 "System One" 模型的公司，旗舰模型 Jev 不生成文本，而是直接返回**类型化判断 + 概率**——把"语义理解"做成可编程原语，主打路由、排序、抽取、校验四类场景。

![](https://p.ipic.vip/0s270y.png)

官方提供的skill 本体只有一个 10KB 的 SKILL.md：

1. **活文档指针**：要求 agent 动手前先读 docs.typesafe.ai 的当前文档/cookbook，避免文档腐化——这个设计是加分项
2. **设计方法论**：Choice/Noul/Score 三原语的选择、state 设计、confidence 语义（比如"Noul 接近 0.5 表示 yes/no 等概率，不是中等强度"这类细节）、并行提问与级联校验。这部分写得确实扎实，不只是厂商广告

## 1 匹配度

- project-launcher 是 Python 3.11 + 静态 Web 的服务启停管控台，核心链路（config/services.json → 启停/监控/日志）**目前没有任何 LLM 集成**，对这个 skill 来说是纯死重
- 但它有明确的未来落点：自然语言指令（"把基金相关服务都起来"）、启动顺序智能建议、日志异常判断——正是路由+抽取+校验场景。skill 是被动触发的，平时零打扰

## 2 成本与风险

| 项       | 评估                                                         |
| -------- | ------------------------------------------------------------ |
| 体积     | 1 个文件 10KB，description 约 70 词/turn，可忽略             |
| 作用域   | 项目级，只影响这个项目，不污染全局                           |
| 厂商锁定 | 实际接入需要 TypeSafe API key，Jev 是新产品生态小；但方法论本身可迁移，不接 API 也能借鉴 |
| 删除成本 | 一个目录，随时可删，无损失                                   |

## 3 安装

方式：Codex 原生 `skill-installer` 脚本（没有用 `claude plugin` 或 `npx skills`，符合"一种安装方式"要求）

位置：`/Users/javaedge/soft/VSProjects/project-launcher/.agents/skills/typesafe-ai/`（SKILL.md 10040B + LICENSE，与上游一致）

**下一轮对话起生效**

## 4 建议

先留着。做"自然语言管控/智能启动"这类功能时，让它读一遍活文档，拿它的 Choice/Noul/Score + confidence 设计和 OpenAI/Anthropic 的 structured output 对比一下再选型。如果几个月后没做相关 AI 功能，删掉即可。