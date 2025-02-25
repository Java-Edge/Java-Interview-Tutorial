# 用 PyTorch 构建 CIFAR10 图像分类器

## 0 目标

- 了解分类器的任务和数据样式
- 掌握如何用 PyTorch 实现一个图像分类器

## 1 分类器任务和数据介绍

### 1.1 任务描述

构造一个神经网络分类器，对输入的图像分类，判断它们属哪类。

本案例目标是区分 CIFAR10 数据集中的不同图像。

### 1.2 数据介绍：CIFAR10 数据集

数据集特点：

- CIFAR10 包含 10 种不同类别的小型彩色图像
- 每张图像尺寸为 3 × 32 × 32，代表 3 个颜色通道（RGB）
- 10 个类别分别为："plane"（飞机）、"car"（汽车）、"bird"（鸟）、"cat"（猫）、"deer"（鹿）、"dog"（狗）、"frog"（青蛙）、"horse"（马）、"ship"（船）、"truck"（卡车）

![](https://my-img.javaedge.com.cn/javaedge-blog/2025/02/30d475d656aff6ba52542d91fa39fb4a.png)

## 2 训练分类器的步骤

以下是使用 PyTorch 实现分类器的详细步骤，适合 Java 程序员从零开始学习。

### 2.1 使用 torchvision 下载 CIFAR10 数据集

用 PyTorch 的 `torchvision` 模块下载 CIFAR10 数据集，并对图像进行预处理。

```python
# 引入 PyTorch 的核心库和图像处理相关的库
import torch
import torchvision
# torchvision.transforms是pytorch中的图像预处理包，包含很多种对图像数据进行变换的函数
import torchvision.transforms as transforms

# 定义数据变换：将 PIL 格式图像转为张量，并标准化到 [-1, 1] 区间
# 这相当于创建了一个图像预处理的管道，类似 Java 的 Builder 模式。将图像转换为张量并进行标准化处理
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

# 下载并加载训练集
# 类似 Java 中创建数据源和迭代器。CIFAR10是一个图像数据集
trainset = torchvision.datasets.CIFAR10(root='./data', train=True,
                                      download=True, transform=transform)
# DataLoader类似Java的 Iterator，以批量加载数据
trainloader = torch.utils.data.DataLoader(trainset, batch_size=4,
                                        shuffle=True, num_workers=2)


testset = torchvision.datasets.CIFAR10(root='./data', train=False,
                                     download=True, transform=transform)
testloader = torch.utils.data.DataLoader(testset, batch_size=4,
                                       shuffle=False, num_workers=2)

# 定义类别名称
classes = ('plane', 'car', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck')
```

数据格式：`torchvision` 的输出是 PIL 图像，需通过 `transforms.ToTensor()` 转为 PyTorch 张量，并通过 `Normalize` 标准化到 [-1, 1] 范围。

> PIL 图像：值范围通常是 [0, 255]（8 位无符号整数，代表像素强度）。

#### 2.1.1 transforms.ToTensor是啥？

##### ① 为啥要转换？

深度学习模型需要张量，Java 中，你可能惯用int[]或List存储数据，但深度学习框架（如 PyTorch）需用数学张量（torch.Tensor）表示数据。张量是多维数组，类似于 Java 的多维数组，但更优化了矩阵运算和 GPU 加速。

如图像的每个像素值需要作为浮点数输入到神经网络，而非整数。

张量支持自动求导、并行计算和 GPU 加速，这是 PyTorch 高效处理数据的基础。

##### ② 格式调整

PIL 图像或 NumPy 数组的形状是 (H, W, C)（高度、宽度、通道），但 PyTorch 模型期望输入为 (C, H, W)（先通道后空间），所以需要转换。

这就像在 Java 中将一个 ArrayList 转换为某种特定格式的集合，以便适配某个 API。

##### ③ 值范围转换

原始值 [0, 255] 转换为 [0, 1.0]，让数据更适合神经网络处理（神经网络通常对小范围浮点数更敏感）。

##### ④ Java 类比

想象你在 Java 中有一个 Image 对象（类似 PIL 图像），但某个库需要 double[] 格式的数据。你需要写一个方法将 Image 转换为 double[]，并调整值范围（如除以 255）。ToTensor 就是这个转换过程。

#### 2.1.2 transforms.Normalize是啥？

```python
# 第一个 (0.5, 0.5, 0.5)：每个颜色通道的均值（mean）
# 第二个 (0.5, 0.5, 0.5)：每个颜色通道的标准差（standard deviation）
transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
```

对张量进行标准化处理。

对每个像素值，公式为：
$$
normalizedValue = (value - mean) / std
$$
如对于 RGB 图像的每个通道（R、G、B），值从 [0, 1] 调整为均值为 0、标准差为 1 的分布。

- **输入**：经过 ToTensor 后的张量，值范围为 [0, 1]。
- **输出**：值范围大致为 [-1, 1]（以均值为 0、标准差为 1 为中心）。

##### ① 为啥要标准化？

提高训练效率：

- 神经网络的梯度下降优化算法（如 SGD）对输入数据的分布敏感。若数据值范围很大或分布不均，训练会变得很慢，甚至收敛困难
- 标准化后，数据分布更均匀（均值为 0，标准差为 1），让模型更容易学习特征

一致性：不同图像的像素值可能有不同分布（如有些图像偏暗、有些偏亮）。标准化确保所有图像都遵循相同的分布，便于模型处理。

数值稳定性：深度学习模型中的权重初始化和激活函数（如 ReLU）对输入范围敏感。标准化后的数据更适合这些操作。

##### ② Java类比

想象你在 Java 中处理一组数据（如用户年龄），数据范围可能从 0 到 100。为让一个算法更好处理这些数据，可能用 Z-Score 标准化（(age - mean) / std），让数据分布更集中（均值为 0，标准差为 1）。Normalize 就是对图像像素值做的类似操作。

在 Java 开发中，你可能处理过数据归一化（如将用户评分从 [0, 100] 归一化到 [0, 1]），以便算法更稳定。标准化在这里类似，调整像素值分布，让神经网络更容易学到模式。

#### 2.1.3 为啥选择 [0.5, 0.5, 0.5] 作均值和标准差？

CIFAR10 数据集特性：

- CIFAR10 的图像已通过 ToTensor 转换为 [0, 1] 范围。
- 对于 RGB 图像，0.5 是一个合理的经验值，因为 CIFAR10 的像素值分布大致是以 0.5 为中心（均值接近 0.5，标准差接近 0.5）
- 选择这些值可以让数据分布更接近标准正态分布，提升模型训练效果。

通用性：在许多图像分类任务中，(0.5, 0.5, 0.5) 是一个常见的选择，尤其在没有具体统计时作为默认值。

##### ① Java 程序员提示

这有点像在 Java 中设置一个默认配置（如默认线程池大小），但这里是针对图像数据的统计特性设置默认参数。

#### 2.1.4 转换后的数据能做啥？

- **输入神经网络**：转换后的张量（形状 (C, H, W)，值范围 [-1, 1]）可直接输入到你定义的卷积神经网络（如上节中的 Net）。
- **加速训练**：标准化后的数据分布更适合梯度下降优化，加快模型收敛。
- **提高精度**：统一的数据格式和分布让模型更容易捕捉图像特征，从而提升分类准确率。

#### 展示训练集图片

```python
import matplotlib.pyplot as plt
import numpy as np

# 定义展示图片的函数
def imshow(img):
    img = img / 2 + 0.5  # 还原标准化后的图像到 [0, 1]
    npimg = img.numpy()
    plt.imshow(np.transpose(npimg, (1, 2, 0)))
    plt.show()

# 从数据加载器中读取一批图片
dataiter = iter(trainloader)
images, labels = next(dataiter)

# 展示图片网格
imshow(torchvision.utils.make_grid(images))
# 打印对应标签
print(' '.join(f'{classes[labels[j]]:5}' for j in range(4)))
```

- **输出示例**：显示 4 张图片及其标签（如 "cat  ship  ship  plane"）。

### 2.2 定义卷积神经网络

定义一个简单的卷积神经网络（CNN），处理 CIFAR10 的 3 通道图像。

```python
import torch.nn as nn
import torch.nn.functional as F

class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        # 第一层卷积：输入 3 通道，输出 6 通道，卷积核 5x5
        self.conv1 = nn.Conv2d(3, 6, 5)
        # 最大池化层：2x2 窗口
        self.pool = nn.MaxPool2d(2, 2)
        # 第二层卷积：输入 6 通道，输出 16 通道，卷积核 5x5
        self.conv2 = nn.Conv2d(6, 16, 5)
        # 全连接层
        self.fc1 = nn.Linear(16 * 5 * 5, 120)  # 16 个 5x5 的特征图
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)  # 输出 10 个类别

    def forward(self, x):
        # 卷积 -> ReLU 激活 -> 池化
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        # 展平为 1 维向量
        x = x.view(-1, 16 * 5 * 5)
        # 全连接层 + ReLU
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        # 最后一层全连接输出
        x = self.fc3(x)
        return x

# 实例化模型
net = Net()
```

- **类结构**：`Net` 继承自 `nn.Module`，类似于 Java 中的类继承，定义网络的层结构
- **卷积层**：`nn.Conv2d` 类似 Java 中的对象，处理图像的特征提取
- **全连接层**：`nn.Linear` 类似于矩阵运算，将特征映射到类别

### 2.3 定义损失函数

用交叉熵损失函数（`CrossEntropyLoss`）和SGD优化器。

```python
import torch.optim as optim

# 定义损失函数和优化器
# 交叉熵损失：适用于多分类任务，计算预测概率和真实标签之间的差异
criterion = nn.CrossEntropyLoss()
# SGD优化器：通过梯度下降更新模型参数，lr为学习率，momentum增加收敛速度
optimizer = optim.SGD(net.parameters(), lr=0.001, momentum=0.9)
```

### 2.4 在训练集上训练模型

训练模型需要多次迭代（epoch），使用梯度下降优化参数。

```python
for epoch in range(2):  # 训练 2 个周期  控制训练轮数
    running_loss = 0.0
    for i, data in enumerate(trainloader, 0): # 内层循环处理每批数据
# 训练代码：
        # 获取输入和标签
        inputs, labels = data

        # 梯度清零
        optimizer.zero_grad()

        # 前向传播
        outputs = net(inputs)

        # 计算损失
        loss = criterion(outputs, labels)

        # 反向传播和优化
        loss.backward()
        optimizer.step()

        # 记录损失
        running_loss += loss.item()
        if (i + 1) % 2000 == 0:  # 每 2000 步打印一次
            print(f'[{epoch + 1}, {i + 1:5d}] loss: {running_loss / 2000:.3f}')
            running_loss = 0.0

print('Finished Training')
```

#### 保存模型

训练完成后，保存模型状态字典：

```python
# 保存路径
PATH = './cifar_net.pth'
# 保存模型参数 类似Java的序列化
torch.save(net.state_dict(), PATH)

# 类似Java的反序列化
net.load_state_dict(torch.load(PATH))
```

### 2.5 在测试集上测试模型

展示测试集中的若干图片：

```python
# 读取测试集数据
dataiter = iter(testloader)
images, labels = next(dataiter)

# 展示图片
imshow(torchvision.utils.make_grid(images))
# 打印真实标签
print('GroundTruth: ', ' '.join(f'{classes[labels[j]]:5}' for j in range(4)))
```

输出示例：`GroundTruth:    cat  ship  ship  plane`

#### 加载模型并预测

加载保存的模型，对测试图片进行分类：

```python
# 实例化模型
net = Net()
# 加载训练好的参数
net.load_state_dict(torch.load(PATH))

# 预测
outputs = net(images)
# 取概率最大的类别作为预测结果
_, predicted = torch.max(outputs, 1)

# 打印预测结果
print('Predicted: ', ' '.join(f'{classes[predicted[j]]:5}' for j in range(4)))
```

输出示例：`Predicted:    cat  ship  ship  plane`

#### 整体测试集表现

计算模型在整个测试集上的准确率：

```python
correct = 0
total = 0
with torch.no_grad():  # 不计算梯度以节省内存
    for data in testloader:
        images, labels = data
        outputs = net(images)
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

print('Accuracy of the network on the 10000 test images: %d %%' % (100 * correct / total))
```

输出示例：`Accuracy of the network on the 10000 test images: 53 %`

#### 按类别分析准确率

细化分析模型在每个类别的表现：

```python
# 创建两个数组来统计每个类别的正确预测数、总数
class_correct = [0. for _ in range(10)]
class_total = [0. for _ in range(10)]
with torch.no_grad():
    for data in testloader:
        images, labels = data
        outputs = net(images)
        _, predicted = torch.max(outputs, 1)
        c = (predicted == labels).squeeze()
        for i in range(4):  # 每次处理 4 张图片
            label = labels[i]
            class_correct[label] += c[i].item()
            class_total[label] += 1

for i in range(10):
    print('Accuracy of %5s : %2d %%' % (classes[i], 100 * class_correct[i] / class_total[i]))
```

输出示例：

```
Accuracy of plane : 62 %
Accuracy of   car : 62 %
Accuracy of  bird : 45 %
Accuracy of   cat : 36 %
Accuracy of  deer : 52 %
Accuracy of   dog : 25 %
Accuracy of  frog : 69 %
Accuracy of horse : 60 %
Accuracy of  ship : 70 %
Accuracy of truck : 48 %
```

## 3 在 GPU 上训练模型

为加速训练，可将模型和数据转移到GPU。

定义设备并检查是否可用 CUDA：

```python
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
print(device)
```

输出示例：`cuda:0`（若 GPU 可用）或 `cpu`（若无 GPU）。

将模型和数据转移到GPU：

```python
# 将模型转移到 GPU
net.to(device)

# 训练时将输入和标签转移到 GPU
inputs, labels = data[0].to(device), data[1].to(device)
```

确保你的环境安装了 CUDA 支持，并更新 PyTorch 为 GPU 版本。

## 4 总结

### 分类器的任务和数据样式

- **任务**：使用神经网络分类器对 CIFAR10 数据集中的图像进行分类，判断它们属于 10 个类别之一
- **数据**：CIFAR10 数据集包含 10 个类别的 3 × 32 × 32 彩色图像

### 训练分类器的步骤

1. **下载数据集**：使用 `torchvision` 下载 CIFAR10 数据集，并预处理为张量格式
2. **定义网络**：构建一个卷积神经网络（CNN），包含卷积层、池化层和全连接层
3. **定义损失和优化**：使用交叉熵损失函数和 SGD 优化器
4. **训练模型**：在训练集上进行多次迭代，优化模型参数
5. **测试模型**：在测试集上评估模型性能，计算准确率和按类别分析

### 在 GPU 上训练模型

- **设备选择**：使用 `torch.device` 选择 CPU 或 GPU
- **模型转移**：将模型和数据转移到 GPU 上以加速训练