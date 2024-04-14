# 02-相似性检索的关键 - Embedding

## 1 文本Embedding

将整个文本转化为实数向量的技术。

Embedding优点是可将离散的词语或句子转化为连续的向量，就可用数学方法来处理词语或句子，捕捉到文本的语义信息，文本和文本的关系信息。

◉ 优质的Embedding通常会让语义相似的文本在空间中彼此接近

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414171159521.png)

◉ 优质的Embedding相似的语义关系可以通过向量的算术运算来表示：

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414171236237.png)

## 2 文本Embedding模型的演进与选型



![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414171349237.png)

目前的向量模型从单纯的基于 NLI 数据集（对称数据集）发展到基于混合数据（对称+非对称）进行训练，即可以做 QQ召回任务也能够做 QD 召回任务，通过添加 Instruction 来区分这两类任务，只有在进行 QD 召回的时候，需要对用户 query 添加上 Instruction 前缀。

## 3 VDB通用Embedding模型

模型选择：

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414171529413.png)

### GPU资源：



![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414171604449.png)

## 4 VDB垂类Embedding模型

用户提供垂类文档数据，VDB对模型进行微调，助力垂类应用效果更进一步。

优化1：对比学习拉近同义文本的距离，推远不同文本的距离

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414171841703.png)

优化2：短文本匹配和长文本匹配使用不同prompt，提升非对称类文本效果

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414171906692.png)

优化3：预训练阶段提升基座模型面向检索的能力，对比学习阶段提高负样本数

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414171927786.png)



![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414171944616.png)

## 5 存储、检索向量数据

### 5.1 为啥需要一个专用的向量数据库

1. 查询方式与传统数据库存在区别
2. 简单易用，无需关心细节
3. 为相似性检索设计，天生性能优势

### 5.2 腾讯云向量数据库的优势

“首家”：

- 通过信通院的标准化性能和规模测试
- 支持千亿级向量规模和最高500W QPS

自研：

- 内核源自集团自研OLAMA引擎
- 内部已有**40+**业务接入

性价比：

- 性能领先业内平均水平**1.5**倍
- 同时客户成本降低20%

## 6 VDB优势

### 流程简化



![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414172239208.png)

模型简化：

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414172322436.png)

共享GPU集群：

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414172401162.png)

## 7 腾讯云向量数据库：消除大模型幻觉，加速大模型在企业落地

### 7.1 端到端AI套件，AGI时代的知识库解决方案

提供**一站式**知识检索方案，实现业界内**最高召回率、大幅降低开发门槛**，帮助企业快速搭建RAG应用，解决大模型幻觉问题。

![](https://javaedge-1256172393.cos.ap-shanghai.myqcloud.com/image-20240414172516389.png)

### 7.2 源自集团多年积累，产品能力行业领先

源自腾讯自研向量检索引擎OLAMA，集团内部**40+**业务线上使用，日均处理**1600亿次**检索请求。

- 『首家』通过中国信通院向量数据库标准测试
- 单索引支持最高**千亿级**超大数据规模
- 单实例最高可达**500万 QPS**