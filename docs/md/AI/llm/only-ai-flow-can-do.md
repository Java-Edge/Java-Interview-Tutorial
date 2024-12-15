# Only AI Flow Can Do！

## 0 大纲

- 作为骨灰级程序员，咋用 AI flow 提高编码效率
- 零代码基础，如何使用 AI 辅助编程工具实现自己的想法
- 盘点常用的 AI 辅助编程工具和使用场景
- 如何选择适合自己的 AI 辅助编程工具

如今的 AI flow 系列软件包括：Cursor、Bolt、Windsurf、v0、通义灵码......

## 1 编码咋提效？

AI flow已和我日常工作学习和创作无缝融合，使用 AI flow 写代码，体验非常流畅，编程效率大大提升。

### 1.1 代码补全

Tab一下，代码自动补全，各厂家有训练自己的智能补全模型，在项目工程感知上下文，给出智能代码补全建议。苦了那些只能在云桌面开发的同学，毕竟私有部署太昂贵！

以前可以叫我 cv 侠，现在请叫我 `Tab`侠。

### 1.2 Debug && Fixbug

AI flow 作为各行业都有资深经验的编程大师，助你 Debug 和 Fix 代码错误。遇到报错了：

- 以前：复制错误信息，打开浏览器被迫定向到 CSDN 或者 stackoverflow，海底捞针找解决方案，并反反复复颠三倒四地改代码

- 现在，在提示错误的位置，点击 Debug 或 Fix 按钮，就会结合项目上下文，给出错因和可行解决方案。甚至给你写出修复后代码，按照 AI flow 的建议修改，或者在给出的修复代码上点击 Apply，就可以快速找到和修复问题

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/8c7ae3ddf48031cb950298c7ed546407.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/d60937b3d53829070f14744eafb40207.png)

有了 AI flow，相当于有了24h技术顾问，随时帮你自动查问题、分析问题、写代码修复问题。让你更专注架构设计。再也不用担心出现偶发的 bug 啦！

### 1.3 实时对话 && 联网搜索

对中国宝宝更友好的的ChatGPT能力和AI search应用。

随时在 AI flow 编辑器右侧打开对话框，激情四射聊任何话题！

在输入框输入 `@web` 即可联网检索，具备 AI 搜索产品标准的 RAG 能力：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/88018ea19f193c89375ef234a586e762.png)

再也不用订阅ChatGPT！

### 1.4 写提示词

想写提示词控制 AI 生成内容，而又不太擅长提示词工程，就能让 AI flow 帮你写提示词。

### 1.5 写页面

做 Web 项目开发，我们经常需要写前端页面。我最近一年习惯用 NextJS 框架做全栈开发，页面组件用 React 写，使用 TailwindCSS 写样式，UI 组件库用的是 Shadcn/UI。

使用 AI flow 前的登录页面：

- 在 UI 组件库找到可以引入的组件
- 或自己写 HTML + TailwindCSS 实现需要的组件。样式要调的美观，耗时良久。

而用 AI flow，一句话描述我的需求快速得到满足需求的登录组件。

### 1.6 截图生成组件

看到某网站的某组件不错，想将其样式和逻辑复制到个人项目。只需截图要抄的组件，让它仿照写出。

这比以前Copy别人网站的样式，通过审查元素查看 HTML、CSS源码，效率高太多。

### 1.7 写常用的代码逻辑 / 函数

以前从0开始抄写一个个功能函数，使用 AI flow 只需一句话描述功能需求 / 入参和出参就能快速生成所需函数。还有人会去刷leetcode吗天天？？

### 1.8 代码重构

技术架构更新时，经常要重构代码。

比如以前将老系统从 php 迁移到 java，自己重构一个项目的所有数据库操作代码，需要大量人天资源。

而用 AI flow，一句话描述需求，让它用新的数据库客户端去重构所有的数据库操作逻辑即可，等它重构完，我需要检查一遍是否有重构不当的代码，让 AI flow 按我的风格继续改写。

只要人工确认过一次重构，剩余的数据读写代码，都会参考第一次重构的风格，快速完成。

唉！也难怪即使有很多需要维护的老系统，如今企业还是不招人了！

### 1.9 国际化

做出海应用，就得支持多语言。

如NextJS框架多语言方案用 next-intl，只需在项目的 messages 目录下放置语言的 json 文件。

以前，要先写好 en.json 内容，再复制到 ChatGPT，让它翻译成其他语言 json 文件，如 zh.json / ja.json 等，再把翻译好的 json 文件都放置到 messages 目录。

每次新增 / 修改 / 删除要支持多语言的内容，要先更新 en.json 的内容，再按上面流程更新其他语言文件的内容。之前组内负责国际化的同事每天痛不欲生，我试用期还没结束，他就离职了！

有了AI flow，还是先更新 en.json 内容，然后到其他语言文件中，一个Tab，快速补全，自动填充翻译好的内容。

## 2 快捷键

### 2.1 Tab

升级pro版，解锁无限制 Tab 智能补全。

### 2.2 Command + L

代码看到一半，想快速打开对话框咨询各种问题。

### 2.3 Command + K

在文件中唤起 Ctrl + K 的位置原地写代码，如果点 Apply 就会覆盖当前位置的代码。

一般会在创建一个新的函数，或者重构某段逻辑的时候使用，原地修改代码，diff 效果更明显。

### 2.4 Command + I

唤起 AI flow Composer 窗口，输入需求，一次性创建 / 修改 / 删除多个文件件 / 文件。

Composer 是划时代功能，真正开启“一句话让 AI 创建一个项目“的时代。零编码基础的人，也可以使用 AI flow Composer 快速创建项目结构，实现基本的代码逻辑，对于做一些 demo 类应用开发，非常有用。

另一场景，如多语言适配，只需修改 en.json 一个文件的内容，通过 AI flow Composer 一次性修改所有语言的 json 文件！

但涉及多个文件代码生成时，质量肯定比单文件生成要差，需人工提质。

## 3 0基础，学IT，用AI实现每一个idea

我们后端，都不懂前端，咋做一个完整导航出海站呢？

### 3.1 Composer

新建一个文件夹，作为 AI flow 工程目录。

打开Composer窗口，描述需求：

```
请你生成一个独立IP展示网站，包含两个页面，首页显示我所有的自媒体社交平台，about 页面显示我的个人背景介绍。网站主题色使用羊皮纸黄色，要求兼容手机端访问。
```

一个回车下去！AI flow Composer 会根据你的需求生成一个项目结构，并生成基本的代码逻辑。等代码生成完，你只需要点 Accept all，生成的代码都应用到工程目录：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/98f849a18d7a84d163366ef058b81ef6.png)

由于用的人实在太多，经常会不可用，重试即可让它继续完成任务！

浏览器打开项目的入口文件：index.html预览：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/ac78a5c0c59b866ece7afd5cb9ad8f26.png)

Composer 对话框继续细化需求，如 “一栏显示五个作品，配图使用真实的图片“，点 Submit 提交，AI flow Composer 会根据你的需求修改代码。

repeat这过程：enter你的需求 -> Accept all 应用修改 -> 预览。直到网站让你顺眼了。

只能感慨，怪不得前端失业了，怪不得招一个 java 就能全栈了，事实如此！

Only AI Flow Can Do！

因为使用 AI flow Composer 只是在PC完成一个项目，还要精通全球分布式部署：如把生成的代码打包上传服务器部署或用 Vercel / Cloudflare 云部署平台。

### 3.2 使用 Bolt.new 构建产品

完全不懂开发的也别急，还有Bolt.new，网页版的 AI 辅助编程工具：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/384009c51009d1dc0a97c5ecce04c86c.png)

输入框描述需求，如：

```bash
创建一个课程主页，介绍课程交付的主页内容，列出课程资料，课程资料是一个图文列表，也放一些学员评价，让课程主页更加吸引人
```

看我一个回车！开始生成代码，在右侧把整个项目的代码结构都展示出来。

左侧对话框继续细化需求，让它优化代码，同时在右侧 Preview 面板预览。

一直优化到你满意，点击Deploy或Open in StackBlitz，代码即可部署上线，得到可公开访问的链接：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/278b1e938c8fb82ee16d455c7ced9b9f.png)

打开它，就能看到你的项目：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/d2ab0f75569289ea06642ea42566b58e.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/1637e55db2e4e0d43d912ed989aada9c.png)

> 适合编程完全 0 基础选手，从0创建项目，简直无门槛，还支持云端部署功能，让你的产品直接被全球观众鉴赏！

### 3.3 Claude 3.5 sonet构建单页应用

在 Claude 描述需求，快速创建单页应用的代码，直接通过 Claude Artifact 面板预览，也可发布上线，获得一个可公开访问链接。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/6f4108e70560729871b1dc42c8072973.png)

点击右下角即可发布：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/590d85b19dae22fe83cfb3a709e9d27a.png)

> Claude，尤其是 sonnet 代码生成能力一直强项，很适合实现单页应用或组件。不支持项目级多层级文件能力。

### 3.4 v0.dev 生成组件

类似3.3的应用场景，还可用 v0.dev，Vercel 推出的一个网页版的 AI 辅助编程工具。内置Shadcn/UI基础组件库，所渲染的UI组件在审美方面遥遥领先，也支持和 figma 联动：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/3a0c081ff6d4db8b3b1e004412ab1d82.png)

### 3.5 Pagen 生成 landscape

为你的idea生成一个落地页：

- 技术论坛演示
- 给用户介绍产品服务

0基础，仅需填写产品名称和描述，选择一个看得上的模板：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/4d58a17ee535d06d1f792c4fbc82d7b4.png)

只需几秒生成landscape：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/74b95bbc798dab91809ca11dc5965fb1.png)

## 4 实力大测评

### 4.1 AI flow

#### ① cursor

第一个面世的AI flow产品，可完整实现项目的能力，自动调试 / 重构能力和知识库问答能力。

1. 支持 VS Code 全部插件和配置。前端用户无缝上手
2. 一个Tab就能全自动完成代码编写，甚至独立完成一个项目，让用户爽爆了

时代洪水终究是淹没了前端的弟弟们。以后开发新项目，后端大佬们都能站在AI flow的肩膀开发完整 web 应用。

#### ② Windsurf

Codeium 推出，也是基于 VS Code 开发。

相比 cursor，在上下文感知和记忆方面更强，对大型复杂项目开发重构支持更好，最致命的，更便宜！此刻 cursor 肯定感慨：既生瑜何生亮，天要亡我凯撒大帝！

#### ③ Pear AI

YC 投资的一个项目，基于 VS Code的开源项目：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/18256651237992ac1b24106987ca9ef1.png)

### 4.2 编辑器 AI 扩展

AI flow火前，就有很多项目基于 VS Code 做 AI 扩展，最知名的：

#### ① Github Copilot

最早的 AI 辅助编程插件。出身顶流，自带光环和各种 buff，如今看来可惜战略失误，已经明日黄花：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/8935c528ba2457f8c73fbe31e6f35e7d.png)

#### ② Continue

开源，可对接任意大模型：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/5892d748c20e3c776e359cd029b30258.png)

#### ③ Cline

开源的 VS Code 插件，无官网：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/06c17230c391ea30ca14199dd3c29e27.png)



### 4.3 UI生成

根据prompt或截图，生成前端组件，不用再手写结构和样式，如：

- cursor
- v0.dev
- Claude
- screenshot-to-code：开源产品，可以自行部署，只要上传截图，就能快速复刻UI组件

### 4.4 全自动实现完整项目

- cursor
- Bolt.new

想快速构建 AI 智能体：

- Replit Agent

![](https://mmbiz.qpic.cn/mmbiz_png/RwxY4xJSwr7v4I2bGibhBGQroJicnMODFXCkgJiargQCol4RHtRm3ZjMUxB5gsHKngImXKM2Fp78YzJZEkW5TYAyg/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

- Wordware

![](https://mmbiz.qpic.cn/mmbiz_png/RwxY4xJSwr7v4I2bGibhBGQroJicnMODFXPcsJGuHlHf8CQqal4T8ib5xT5MR6Ip9Z8D7iaSgzSEG3Rpks7RpFkTibw/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



## 5 选型

### 5.1 场景

高频编码：cursor / Windsurf等AI flow。

偶尔写Demo验证idea或偶尔写个 UI 组件：Bolt.new / v0.dev / Claude 等网页工具。

### 5.2 价格

愿为优质生产力付费，可升级 AI flow 应用的 Pro 会员，解锁无限智能补全。

不想按月付费的，可选择本地部署开源版 AI flow 应用，对接本地大模型，享受更高配置灵活度和更低使用成本。

### 5.3 使用习惯

- 习惯VS Code，无脑选 cursor或 Windsurf
- 只会用 IDEA，懒得看其它软件，就装插件：Github Copilot，Continue，Cline 
- 很少写代码，只是偶尔需要写个 Demo 验证想法，可选 Bolt.new 或 v0.dev。

### 5.4 功能花样

推荐综合使用，汇集各种场景：

- 重点使用 AI flow 应用和 Bolt.new
- 搭配 v0.dev、Claude

## 6 总结

AI 会完全取代程序员吗？No！

人类最神奇的：

- 想象力
- 创造力
- 对项目的架构设计
- 对作品的审美
- 对逻辑的抽象
- 最复杂的人性

AI都无法取代。AI 可从零到一，甚至到 90，但最关键的还是你的那最后十分。一个优秀且领域专业的软件设计师，不可能被 AI 取代。

别太焦虑 AI 会不会淘汰自己，拥抱 AI，使用 AI，发挥提效，才是此刻你该做的。

