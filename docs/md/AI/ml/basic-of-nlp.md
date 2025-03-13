# NLP入门

## 0 目标

- 了解啥是NLP
- 了解NLP的发展简史
- 了解NLP的应用场景
- 了解本教程中的NLP

## 1 啥是NLP？

计算机科学与语言学中关注于计算机与人类语言间转换的领域。

## 2 发展简史

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/8b8f1018e60cc213528e58c83629a5d7.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/47ec99996359ae976bebece4ee28ffeb.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/97d97fbc38d6e002d3808b6b545b65a3.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/24ed2c62a015d244eb3b792e1fdf6a8e.png)

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/03/5f816f6e0b649e7e023aae10c84d48c8.png)

## 3 应用场景

- 语音助手
- 机器翻译
- 搜索引擎
- 智能问答
- ...

### 3.1 语音助手

科大讯飞语音识别技术访谈：

<video src="/Volumes/mobileData/data/%E5%AD%A6%E4%B9%A0%E8%B5%84%E6%96%99/01-%E9%98%B6%E6%AE%B51-3%EF%BC%88python%E5%9F%BA%E7%A1%80%20%E3%80%81python%E9%AB%98%E7%BA%A7%E3%80%81%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0%EF%BC%89/03-%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E4%B8%8ENLP/01-%E8%AE%B2%E4%B9%89/HTML/mkdocs_NLP/img/xunfei.mp4"></video>

### 3.2  机器翻译

CCTV上的机器翻译系统, 让世界聊得来！

<video src="/Volumes/mobileData/data/%E5%AD%A6%E4%B9%A0%E8%B5%84%E6%96%99/01-%E9%98%B6%E6%AE%B51-3%EF%BC%88python%E5%9F%BA%E7%A1%80%20%E3%80%81python%E9%AB%98%E7%BA%A7%E3%80%81%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0%EF%BC%89/03-%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E4%B8%8ENLP/01-%E8%AE%B2%E4%B9%89/HTML/mkdocs_NLP/img/fanyi.mp4"></video>

## 4 本专栏的NLP

### 4.1 课程理念与宗旨

本系列课程将开启你的NLP之旅, 全面从企业实战角度出发, 课程设计内容对应企业开发标准流程和企业发展路径, 助力你成为一名真正的AI-NLP工程师。

### 4.2 内容先进性说明

本课程内容结合当下时代背景, 更多关注NLP在深度学习领域的进展, 这也将是未来几年甚至几十年NLP的重要发展方向, 简化传统NLP的内容, 如语言规则, 传统模型, 特征工程等, 带来效果更好, 应用更广的Transfomer, 迁移学习等先进内容。

### 4.3 内容大纲概要

| 模块名称     | 主要内容                                                     | 案例                             |
| ------------ | ------------------------------------------------------------ | -------------------------------- |
| 文本预处理   | 文本处理基本方法，文本张量表示、文本数据分析、文本增强方法等 | 路透社新闻类型分类任务           |
| 经典序列模型 | HMM与CRF模型的作用, 使用过程, 差异比较以及发展现状等         |                                  |
| RNN及其变体  | RNN, LSTM, GRU模型的作用, 构建, 优劣势比较等                 | 全球人名分类任务, 英译法翻译任务 |
| Transformer  | Transformer模型的作用, 细节原理解析, 模型构建过程等          | 构建基于Transformer的语言模型    |
| 迁移学习     | fasttext工具的作用, 迁移学习理论, NLP标准数据集和预训练模型的使用等 | 全国酒店评论情感分析任务         |

## 5 云服务器使用入门

### 5.1 基本操作

```shell
# 查看cpu逻辑核
lscpu
```

```text
Architecture:          x86_64
CPU op-mode(s):        32-bit, 64-bit
Byte Order:            Little Endian
CPU(s):                4
On-line CPU(s) list:   0-3
Thread(s) per core:    2
Core(s) per socket:    2
座：                 1
NUMA 节点：         1
厂商 ID：           GenuineIntel
CPU 系列：          6
型号：              85
型号名称：        Intel(R) Xeon(R) Platinum 8269CY CPU @ 2.50GHz
步进：              7
CPU MHz：             2500.000
BogoMIPS：            5000.00
超管理器厂商：  KVM
虚拟化类型：     完全
L1d 缓存：          32K
L1i 缓存：          32K
L2 缓存：           1024K
L3 缓存：           36608K
NUMA 节点0 CPU：    0-3
Flags:                 fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx pdpe1gb rdtscp lm constant_tsc rep_good nopl eagerfpu pni pclmulqdq monitor ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt aes xsave avx f16c rdrand hypervisor lahf_lm abm 3dnowprefetch invpcid_single fsgsbase tsc_adjust bmi1 hle avx2 smep bmi2 erms invpcid rtm mpx avx512f avx512dq rdseed adx smap avx512cd avx512bw avx512vl xsaveopt xsavec xgetbv1 arat avx512_vnni
```

查看计算环境：

```shell
cd /home/ec2-user/
vim README
```

你将看到所有的虚拟环境

```text
Please use one of the following commands to start the required environment with the framework of your choice:
for MXNet(+Keras2) with Python3 (CUDA 10.1 and Intel MKL-DNN) ____________________________________ source activate mxnet_p36
for MXNet(+Keras2) with Python2 (CUDA 10.1 and Intel MKL-DNN) ____________________________________ source activate mxnet_p27
for MXNet(+AWS Neuron) with Python3 ___________________________________________________ source activate aws_neuron_mxnet_p36
for TensorFlow(+Keras2) with Python3 (CUDA 10.0 and Intel MKL-DNN) __________________________ source activate tensorflow_p36
for TensorFlow(+Keras2) with Python2 (CUDA 10.0 and Intel MKL-DNN) __________________________ source activate tensorflow_p27
for TensorFlow(+AWS Neuron) with Python3 _________________________________________ source activate aws_neuron_tensorflow_p36
for TensorFlow 2(+Keras2) with Python3 (CUDA 10.1 and Intel MKL-DNN) _______________________ source activate tensorflow2_p36
for TensorFlow 2(+Keras2) with Python2 (CUDA 10.1 and Intel MKL-DNN) _______________________ source activate tensorflow2_p27
for TensorFlow 2.3 with Python3.7 (CUDA 10.2 and Intel MKL-DNN) _____________________ source activate tensorflow2_latest_p37
for PyTorch 1.4 with Python3 (CUDA 10.1 and Intel MKL) _________________________________________ source activate pytorch_p36
for PyTorch 1.4 with Python2 (CUDA 10.1 and Intel MKL) _________________________________________ source activate pytorch_p27
for PyTorch 1.6 with Python3 (CUDA 10.1 and Intel MKL) ________________________________ source activate pytorch_latest_p36
for PyTorch (+AWS Neuron) with Python3 ______________________________________________ source activate aws_neuron_pytorch_p36
for Chainer with Python2 (CUDA 10.0 and Intel iDeep) ___________________________________________ source activate chainer_p27
for Chainer with Python3 (CUDA 10.0 and Intel iDeep) ___________________________________________ source activate chainer_p36
for base Python2 (CUDA 10.0) _______________________________________________________________________ source activate python2
for base Python3 (CUDA 10.0) _______________________________________________________________________ source activate python3
```

如需用python3 + pytorch新版:

```shell
source activate pytorch_latest_p36
```

查看具体的python和pip版本：  

```shell
python3 -V

# 查看pip版本
pip -V

# 查看重点的科学计算包，tensorflow，pytorch等
pip list
```

> - 输出效果:

```text
Python 3.6.10 :: Anaconda, Inc.
pip 20.0.2 from /home/ec2-user/anaconda3/envs/pytorch_latest_p36/lib/python3.6/site-packages/pip (python 3.6)
```

------

- 查看图数据情况：

```shell
# 开启图数据库，这里后期我们将重点学习的数据库
neo4j start

# 关闭数据库
neo4j stop
```

------

> - 输出效果:

```text
Active database: graph.db
Directories in use:
  home:         /var/lib/neo4j
  config:       /etc/neo4j
  logs:         /var/log/neo4j
  plugins:      /var/lib/neo4j/plugins
  import:       /var/lib/neo4j/import
  data:         /var/lib/neo4j/data
  certificates: /var/lib/neo4j/certificates
  run:          /var/run/neo4j
Starting Neo4j.
Started neo4j (pid 17565). It is available at http://0.0.0.0:7474/
There may be a short delay until the server is ready.
See /var/log/neo4j/neo4j.log for current status.

Stopping Neo4j.. stopped
```

------

- 运行一个使用Pytorch的程序:

```shell
cd /data

python3 pytorch_demo.py
```

输出效:

```text
Net(
  (conv1): Conv2d(1, 6, kernel_size=(3, 3), stride=(1, 1))
  (conv2): Conv2d(6, 16, kernel_size=(3, 3), stride=(1, 1))
  (fc1): Linear(in_features=576, out_features=120, bias=True)
  (fc2): Linear(in_features=120, out_features=84, bias=True)
  (fc3): Linear(in_features=84, out_features=10, bias=True)
)
```