# LM Studio让你的Mac秒变AI神器！

## 0 前言

M芯片Mac想跑大模型，强烈推荐LM Studio。因为它支持专门为M系列芯片优化过的模型文件，运行速度快了不止亿点点！intel mac 不支持哦！

本地运行大模型的工具中，LM Studio和Ollama是最受欢迎的两款。最近LM Studio新增了对MLX的支持。

## 1 MLX是啥？

苹果公司开源的一个机器学习框架，专门为M系列芯片做了优化，如采用了统一内存模型、对应统一内存架构。所以，使用这个框架就可以非常高效地部署和运行模型。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/a68b62aedf0efba5153b95dce676ed35.png)

MLX去年12月才开源，还很新，但是在社区支持下发展很快，主流模型都有对应的版本。在最新版本的LM Studio中也特意做了标注和筛选，方便苹果用户下载。

## 2 下载和使用LM Studio

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/1e73d5411db65c61f69f1362f54e918a.png)

打开软件，左边栏是它的主要功能页面，包括聊天模式、服务器模式、查看已有模型等等：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/e37cfb354f2c870db5d603b1a9c23940.png)

进入发现页面，就可以搜索和下载模型了：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/c21065af767e0f56e5d7bd3b3a452f9d.png)

LM Studio把MLX版的模型专门标注，列表里很容易找到。它默认是推荐Staff Pick也就是官方推荐的模型，如果你想要更多，那就选择Hugging Face（Search All）。

模型文件下载好：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/6acd6f37d6074b6d675987880a6b6ba6.png)

指定一个：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/34129353068a5fb23ba632dda674ac70.png)

就在聊天模式里加载它：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/11/554ae69382a5c3b6bbe2655f08eda305.png)

## 3 苹果AI落后？

苹果硬件积累远超那些PC厂商，看到最近发布的 M4 系列芯片你也就懂了。在内存带宽上，M4 Pro也比上一代大增75%，支持高达64GB的高速统一内存和273GB/s的内存带宽，直接达到任意AI PC芯片的两倍。

桌面端有MLX框架，发挥统一内存架构最大优势：

- CPU和GPU可以直接访问共享内存中的数据，不需要进行数据传输
- 小规模操作用CPU搞定。遇到计算密集型的需求再上GPU

到时明年我去香港买个港版，M4 urtra Mac Studio到手后我就开始测评！

## 4 总结

如今在 AI 软件领域，各家都在扩张自己的势力范围。如LM Studio，以前只是偏后端软件，帮你在本地跑大模型。现在，它把聊天模式往前提，添加RAG功能。主动从后端走向前端的打法会逐渐成为各家的共同选择。AI应用大混战时代来了。