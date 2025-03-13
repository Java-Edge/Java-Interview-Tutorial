# 从语料理解到模型优化：为什么你的文本分析总是差点意思？

## 1 目的

本文旨在帮助Java 大佬们快速理解文本数据，如何检查语料可能的问题，并为后续模型训练提供超参数选择的参考。

## 2 常见的文本数据分析方法

- 统计标签的数量分布
- 计算句子长度分布
- 进行词频统计和关键词词云可视化

本文数据集特点：

- 用于二分类任务的中文情感分析数据集
- `train.tsv` 是训练集，`dev.tsv` 是验证集，数据格式相同

## 3 训练集 (`train.tsv`)

### 数据格式示例

```bash
sentence    label
早餐不好,服务不到位,晚餐无西餐,早餐晚餐相同,房间条件不好,餐厅不分吸烟区.房间不分有无烟房.    0
去的时候 ,酒店大厅和餐厅在装修,感觉大厅有点挤.由于餐厅装修本来该享受的早饭,也没有享受(他们是8点开始每个房间送,但是我时间来不及了)不过前台服务员态度好!    1
```

数据包含两列：

- 第一列：情感评论文本
- 第二列：标签，0 消极评论，1 积极评论

## 4 数据分析

### 4.1 统计训练集和验证集的标签分布

```python
import seaborn as sns
import pandas as pd
import matplotlib.pyplot as plt

plt.style.use('fivethirtyeight') 

train_data = pd.read_csv("./cn_data/train.tsv", sep="\t")
valid_data = pd.read_csv("./cn_data/dev.tsv", sep="\t")

sns.countplot(x="label", data=train_data)
plt.title("训练集标签分布")
plt.show()

sns.countplot(x="label", data=valid_data)
plt.title("验证集标签分布")
plt.show()
```

训练集标签数量分布：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/e7a711c8ffdc6719d44bf21db33aedc2.png)

验证集标签数量分布：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/eb0bd5a327b8c3f6c16715a22f9c645f.png)

**分析：** 深度学习模型评估，一般用ACC作为评估指标，若想将ACC的基线定义在50%左右，则需正负样本比例维持在1:1左右，否则就要进行必要的数据增强或数据删减。上图中训练和验证集正负样本都稍有不均衡, 可以进行一些数据增强。

### 4.2 计算句子长度分布

```python
# 在训练数据中添加新的句子长度列, 每个元素的值都是对应的句子列的长度
train_data["sentence_length"] = list(map(lambda x: len(x), train_data["sentence"]))

# 绘制句子长度列的数量分布图
sns.countplot("sentence_length", data=train_data)
# 主要关注count长度分布的纵坐标, 不需要绘制横坐标, 横坐标范围通过dist图进行查看
plt.xticks([])
plt.show()

# 绘制dist长度分布图
sns.distplot(train_data["sentence_length"])

# 主要关注dist长度分布横坐标, 不需要绘制纵坐标
plt.yticks([])
plt.show()


# 在验证数据中添加新的句子长度列, 每个元素的值都是对应的句子列的长度
valid_data["sentence_length"] = list(map(lambda x: len(x), valid_data["sentence"]))

# 绘制句子长度列的数量分布图
sns.countplot("sentence_length", data=valid_data)

# 主要关注count长度分布的纵坐标, 不需要绘制横坐标, 横坐标范围通过dist图进行查看
plt.xticks([])
plt.show()

# 绘制dist长度分布图
sns.distplot(valid_data["sentence_length"])

# 主要关注dist长度分布横坐标, 不需要绘制纵坐标
plt.yticks([])
plt.show()
```

训练集句子长度分布：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/78258f24ac495107b5619743dcf2ec2a.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/daeb95671888a0e2b49055e9ef36f343.png)

验证集句子长度分布：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/cdd6b22711a1ec0dce7cc3530124db2c.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/d8b68117dda516600e2d00eb14450c23.png)

分析：通过绘制句子长度分布图，可知我们的语料中大部分句子长度的分布范围, 因为模型的输入要求为固定尺寸的张量，合理的长度范围对之后进行句子截断补齐(规范长度)起到关键的指导作用. 上图中大部分句子长度的范围大致为20-250之间。

### 4.3 绘制句子长度与标签的散点图

```python
sns.stripplot(x='label', y='sentence_length', data=train_data)
plt.title("训练集正负样本句子长度分布")
plt.show()

sns.stripplot(x='label', y='sentence_length', data=valid_data)
plt.title("验证集正负样本句子长度分布")
plt.show()
```

训练集上正负样本的长度散点分布：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/72741e412abccaf229bc8b1855b1e5a3.png)

验证集上正负样本的长度散点分布：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/60d78402b3f171b454f73bf40ac7bbd4.png)

分析：通过查看正负样本长度散点图，有效定位异常点的出现位置，帮助我们更准确进行人工语料审查。 上图中在训练集正样本中出现异常点，它的句子长度近3500左右，需人工审查。

### 4.4 统计不同的词汇总数

```python
# 导入jieba用于分词
# 导入chain方法用于扁平化列表
import jieba
from itertools import chain

# 进行训练集的句子进行分词, 并统计出不同词汇的总数
train_vocab = set(chain(*map(lambda x: jieba.lcut(x), train_data["sentence"])))
print("训练集共包含不同词汇总数为：", len(train_vocab))

# 进行验证集的句子进行分词, 并统计出不同词汇的总数
valid_vocab = set(chain(*map(lambda x: jieba.lcut(x), valid_data["sentence"])))
print("训练集共包含不同词汇总数为：", len(valid_vocab))
```

输出效果：

```bash
训练集共包含不同词汇总数为： 12147
训练集共包含不同词汇总数为： 6857
```

### 4.5 生成高频形容词词云

```python
# 使用jieba中的词性标注功能
import jieba.posseg as pseg

def get_a_list(text):
    """用于获取形容词列表"""
    # 使用jieba的词性标注方法切分文本,获得具有词性属性flag和词汇属性word的对象, 
    # 从而判断flag是否为形容词,来返回对应的词汇
    r = []
    for g in pseg.lcut(text):
        if g.flag == "a":
            r.append(g.word)
    return r

# 导入绘制词云的工具包
from wordcloud import WordCloud

def get_word_cloud(keywords_list):
    # 实例化绘制词云的类, 其中参数font_path是字体路径, 为了能够显示中文, 
    # max_words指词云图像最多显示多少个词, background_color为背景颜色 
    wordcloud = WordCloud(font_path="./SimHei.ttf", max_words=100, background_color="white")
    # 将传入的列表转化成词云生成器需要的字符串形式
    keywords_string = " ".join(keywords_list)
    # 生成词云
    wordcloud.generate(keywords_string)

    # 绘制图像并显示
    plt.figure()
    plt.imshow(wordcloud, interpolation="bilinear")
    plt.axis("off")
    plt.show()

# 获得训练集上正样本
p_train_data = train_data[train_data["label"]==1]["sentence"]

# 对正样本的每个句子的形容词
train_p_a_vocab = chain(*map(lambda x: get_a_list(x), p_train_data))
#print(train_p_n_vocab)

# 获得训练集上负样本
n_train_data = train_data[train_data["label"]==0]["sentence"]

# 获取负样本的每个句子的形容词
train_n_a_vocab = chain(*map(lambda x: get_a_list(x), n_train_data))

# 调用绘制词云函数
get_word_cloud(train_p_a_vocab)
get_word_cloud(train_n_a_vocab)
```

训练集正样本形容词词云： 

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/ea72e29c3e63d3d480f00516b08b79b0.png)

训练集负样本形容词词云：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/c0ce099d7b523abca74027e913cc4904.png)



### 4.6 获得形容词词云

```python
# 获得验证集上正样本
p_valid_data = valid_data[valid_data["label"]==1]["sentence"]

# 对正样本的每个句子的形容词
valid_p_a_vocab = chain(*map(lambda x: get_a_list(x), p_valid_data))
#print(train_p_n_vocab)

# 获得验证集上负样本
n_valid_data = valid_data[valid_data["label"]==0]["sentence"]

# 获取负样本的每个句子的形容词
valid_n_a_vocab = chain(*map(lambda x: get_a_list(x), n_valid_data))

# 调用绘制词云函数
get_word_cloud(valid_p_a_vocab)
get_word_cloud(valid_n_a_vocab)
```

验证集正样本形容词词云：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/ab9d71deaf7dc1c9b11ebed4d77b3291.png)

验证集负样本形容词词云：

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/d960fcfd7cdc99efc1391cbb2ececafc.png)

分析：根据高频形容词词云显示，可对当前语料质量进行简单评估，同时对违反语料标签含义的词汇进行人工审查和修正，保证绝大多数语料符合训练标准。上图中的正样本大多数是褒义词，而负样本大多数是贬义词，基本符合要求，但负样本词云中也存在"便利"这样的褒义词，因此可人工进行审查。

## 5 总结

本文为各位 Javaer 提供了一系列文本数据分析方法，帮助更好地理解语料，为后续的机器学习模型训练提供基础。

