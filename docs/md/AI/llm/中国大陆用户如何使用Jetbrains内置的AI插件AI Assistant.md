# 中国大陆用户如何使用Jetbrains内置的AI插件AI Assistant

## 1 安装AI Assistant插件

AI功能依赖AI Assistant插件：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/6f43ca236690cb8d850cfca7fb22e824.png)

## 2 功能

解释代码、回答有关代码片段的 问题、提交消息等等。

### 在需要时更快地编码

AI Assistant 可以自动补全单行、函数和整个代码块，并与您的编码样式、项目上下文和命名约定保持一致。AI Assistant 还可以根据您的自然语言提示直接在编辑器中提供代码选项建议。

### 在上下文中寻找解决方案

需要研究错误或找到实现新功能的方式吗？只需在聊天中提出问题，AI Assistant 将自动使用您的项目上下文中的必要详细信息补充查询 – 无需复制和粘贴代码段。将一些任务委托给 JetBrains AI（例如，“将 MyClass 重写为抽象类”），或者通过上下文菜单调用内联操作，例如 Explain Сode（解释代码）、Suggest Refactoring（提供重构建议）

### 让 AI 为您完成繁琐的工作

将例行或重复性任务委托给 AI Assistant，这样一来，您可以专注于更具创造性和满足感的活动。AI Assistant 可以帮助进行代码重构，为声明生成文档，编写测试，以及总结 VCS 提交中的更改。

### 快速掌握未知概念

借助 AI Assistant 轻松理解新的和复杂的代码 – 在聊天中提出问题，AI Assistant 将根据您的项目上下文提供详细解释。您正在学习一种新的编程语言吗？使用 AI 转换您的代码，帮助您在不同语言之间无缝工作。

### 改进和优化您的代码

使用 AI Assistant 提高您的代码质量。诊断错误和异常，并获得详细的解释和修正建议。使用 AI 驱动的重构提示来优化和清理您的代码，确保代码保持高效且易于维护。

## 3 大陆如何使用？

该插件不对中国大陆用户开放。访问仅限于提供 OpenAI 服务的地区。什么给官网发邮件啊，什么“工具”改成全局模式呀，都不奏效，本文总结一个成功方法！

### 3.1 改Jetbrains账户Country

进入：https://account.jetbrains.com/profile-details，将Country/Region改为United States (US)：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/661ed9f7fc93ce750b932d40400ffa61.png)

Cat代理端口设置7890，规则模式就行。

### 3.2 系统设置代理

windows：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/351bf63501bed42f5ada9ace1f62ea43.png)

MacOS：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/8a8f3d4620cfedefc46f985ff3ffaf26.png)

### 3.3 IDE设置代理

IDE的`HTTP PROXY`置Auto-detect proxy settings，自动使用系统的代理设置。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/ee8ffdaf98b151712ea123b5d1400e04.png)

## 4 开始激情对话！

同意数据分享请求：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20240924132909698.png)

对话成功：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/fa949d6bed2345a4b82bbd4f876585a9.png)

## 5 大陆版插件-基于阿里云通义千问大模型

参见：[携手阿里云：JetBrains AI Assistant 正式发布！](http://www.javaedge.cn/md/llm/%E6%90%BA%E6%89%8B%E9%98%BF%E9%87%8C%E4%BA%91%EF%BC%9AJetBrains%20AI%20Assistant%20%E6%AD%A3%E5%BC%8F%E5%8F%91%E5%B8%83%EF%BC%81.html)

## 6 官方使用教程

- https://www.jetbrains.com/help/go/ai-assistant.html#ai-chat
- https://www.jetbrains.com/help/idea/2023.2/ai-assistant.html

