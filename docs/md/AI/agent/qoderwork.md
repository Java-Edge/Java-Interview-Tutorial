# 别折腾ClawBot了！阿里QoderWork：只要会打字，电脑就能自己干活

## 0 前言

阿里的[QoderWork](https://qoder.com/qoderwork)：

![](https://p.ipic.vip/fwphwl.png)

相比前端半吊子开发的🦞bot，其最大优势：安装使用 ，全程不折腾！

## 1 能做啥？

正常对话或用自己的Skill，能实现很多功能：

- 生成可编辑的PPT
- 总结网页发布到X
- 整理PC文件、下载并分类保存等。

## 2 为啥能做？

任何能用电脑完成的日常工作，都可用AI工具完成。

如Claude Code 有了 MCP 和 Skill 后无所不能，写文章、做视频、做PPT。

Clawdbot也是通过chat让大模型去控制电脑，调用各种命令行、脚本、Skill、MCP工具，帮你完成各种复杂任务。

**产品形态会影响用户认知。**这也是为什么Anthropic有Claude Code后，还推办公专用的Claude Cowork，其实能力都同理。

QoderWork亦如此，也是基于AI工具Qoder的能力。但界面对非开发者更友好，像个桌面办公助手。

也支持MCP和Skill，如今是个会打字的人，都能让AI辅助工作。

## 3 常用案例

### PC文件整理

添加待整理目录，之后说出整理目标即可

![](https://p.ipic.vip/xetqfo.png)

### 清理硬盘

> 扫描硬盘文件，看有什么清理优化方案

![](https://p.ipic.vip/or3yu6.png)

## 4 啥是Skill？

给 AI 的操作手册。文件夹里包含一个Skill.md（操作手册），还可放一些脚本和参考资料，常见目录结构：

![](https://p.ipic.vip/qnk5tt.png)

## 5 创建Skill

内置：

![](https://p.ipic.vip/vexexa.png)

还能上传新技能：

> https://xiangyangqiaomu.feishu.cn/wiki/IXlVw1ceEiUkxAk525FctKjinKd

下载后，打开QoderWork设置，按图标顺序操作。

上传zip包即可完成安装：

![](https://p.ipic.vip/wp7fc3.png)

安装技能：

![](https://p.ipic.vip/od5nce.png)

安装成功：

![](https://p.ipic.vip/eg37o8.png)

Vercel推的[Skill聚合站](https://skills.sh/)：

![](https://p.ipic.vip/a6l3fc.png)

挑好技能，复制安装命令发给QoderWork安装：

![](https://p.ipic.vip/0rn6m0.png)

创建 Skill，只需复制下面提示词发给QoderWork。

> 帮我一起使用 /create-skill 创建技能。会问你技能应该做什么。

让AI引导，你来描述想解决的问题和任务，很快就能做出属于你的第一个技能。

## 6 咋用技能？

### 6.1 精准指定

用@指定Skill：

![](https://p.ipic.vip/03ayik.png)

### 6.2 自动触发

大模型会理解意图，自动触发调用Skill。

也可说：“用xxx内容创作配图技能，为窦唯写一篇介绍”。

## 7 Skill任务案例

### 7.1 音频转时间轴文本

把播客或会议录音转成带字幕时间轴的Word文档。

只需上传mp3附件：

**“为这个录音生成中英双语字幕文件（SRT格式），并导出带时间轴的文字记录 Word 文档。”**

生成后，让大模型总结或校准。

### 7.2 生成视频

组合Listenhub API，即梦生图，Manim库。

把任意PDF或一句话生成视频，片头片尾都带自己品牌。

## 8 总结

AI界推陈出新过快，很多中高层领导都已被折腾焦虑不已。自🦞bot火爆后，阿里就光速支持Clawdbot云部署和QoderWork。

国内AI厂商出手，才更适合本土化使用，便宜量大。

更重要的还是复用自身的经验，Skill就是最好载体，因为他们是真实的使用场景。

重复、繁琐、有逻辑可循的PC操作，都可变成技能，开始沉淀自己的职场经验吧！