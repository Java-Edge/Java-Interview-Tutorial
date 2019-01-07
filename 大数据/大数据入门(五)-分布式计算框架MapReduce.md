# 1 概述
源自于Google的MapReduce论文，发表于2004年12月。

Hadoop MapReduce是Google MapReduce的克隆版
## 优点
海量数量离线处理
易开发
易运行
## 缺点
实时流式计算

# 2 MapReduce编程模型
## wordcount词频统计
![](https://img-blog.csdnimg.cn/img_convert/d30aef6db2174113c919b20226580eed.png)
# MapReduce执行流程
- 将作业拆分成Map阶段和Reduce阶段
- Map阶段: Map Tasks
- Reduce阶段、: Reduce Tasks
## MapReduce编程模型执行步骤
- 准备map处理的输入数据
- Mapper处理
- Shuffle
- Reduce处理
- 结果输出
![](https://img-blog.csdnimg.cn/img_convert/b3514b6cf271ddcffe0b15c1c5a9521d.png)
- InputFormat
![](https://img-blog.csdnimg.cn/img_convert/fd11b71639ce1170689a5265dd1b525d.png)
![](https://img-blog.csdnimg.cn/img_convert/da4cd5f1a39b89744943351ea7897f71.png)
![](https://img-blog.csdnimg.cn/img_convert/1d604b7e3f0846ce6529d0f603c983d4.png)
![](https://img-blog.csdnimg.cn/img_convert/74a2e3d81bbb2a2a0781697e85a72f30.png)

#### OutputFormat
OutputFormt接口决定了在哪里以及怎样持久化作业结果。Hadoop为不同类型的格式提供了一系列的类和接口，实现自定义操作只要继承其中的某个类或接口即可。你可能已经熟悉了默认的OutputFormat，也就是TextOutputFormat，它是一种以行分隔，包含制表符界定的键值对的文本文件格式。尽管如此，对多数类型的数据而言，如再常见不过的数字，文本序列化会浪费一些空间，由此带来的结果是运行时间更长且资源消耗更多。为了避免文本文件的弊端，Hadoop提供了SequenceFileOutputformat，它将对象表示成二进制形式而不再是文本文件，并将结果进行压缩。
# 3 核心概念
Split
InputFormat
OutputFormat
Combiner
Partitioner
![](https://img-blog.csdnimg.cn/img_convert/b23a2498ad2bb7feef2f9cf94f652d70.png)

## 3.1 Split
![](https://img-blog.csdnimg.cn/img_convert/1f8b94642f966347e5fbc19579f3a8b5.png)
## 3.2 InputFormat
# 4 MapReduce 1.x 架构
![](https://img-blog.csdnimg.cn/img_convert/978682a09b5d5e6e4c849aade6714cb3.png)

![](https://img-blog.csdnimg.cn/img_convert/4d8cba7a246ba45e895e6b0aac5826c2.png)
![](https://img-blog.csdnimg.cn/img_convert/1358b4bbd10d5ffcf4cf4f3f28d63b64.png)
![](https://img-blog.csdnimg.cn/img_convert/040342a516484c19a2ddac1c5216ed98.png)
![](https://img-blog.csdnimg.cn/img_convert/c643cc847b1bca3a9616f6f9b7f605f5.png)
# 5 MapReduce 2.x 架构
![](https://img-blog.csdnimg.cn/img_convert/b3760e5dff90acb65e3c7c0ae1c9f81e.png)
# 6 Java 实现 wordCount
![](https://img-blog.csdnimg.cn/img_convert/db8dbeb277b8a8b4ed7bf9dd02f6993e.png)
![clean package](https://img-blog.csdnimg.cn/img_convert/60c4b7482beb8c6d2db82e1298cda8b3.png)
![上传到Hadoop服务器](https://img-blog.csdnimg.cn/img_convert/d75de8ab33fec0b89631c4a242d9b5ea.png)
![全路径没有问题](https://img-blog.csdnimg.cn/img_convert/d7cf025e655cd15ffeac59f2b8df3d84.png)
![](https://img-blog.csdnimg.cn/img_convert/dd9815d16b7b059ee5370081c8593f6b.png)
# 7 重构
![](https://img-blog.csdnimg.cn/img_convert/bc92c2418c746f4a52013bc7a10b4ec4.png)
# 8 Combiner编程
![](https://img-blog.csdnimg.cn/img_convert/ed77f8d1c4a79eb349e0b816e9b4d7b3.png)
# 9 Partitoner
![](https://img-blog.csdnimg.cn/img_convert/95c49f4305150ef0987d6f6733b7ddaf.png)
![](https://img-blog.csdnimg.cn/img_convert/9cbb065c8bbba1da3972cbbe1eae4301.png)