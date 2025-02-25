# 用PyTorch构建神经网络：面向Java开发者的入门指南



## 0 学习目标

掌握用Pytorch构建神经网络的基本流程和实现过程。使用Pytorch来构建神经网络，主要工具都在torch.nn包。nn依赖于autograd来定义模型，并对其自动求导。

### 构建神经网络的流程

- 定义一个拥有可学习参数的神经网络
- 遍历训练数据集
- 处理输入数据使其流经神经网络
- 计算损失值
- 将网络参数的梯度进行反向传播
- 以一定的规则更新网络的权重

## 1 定义一个神经网络



```python
import torch
import torch.nn as nn
import torch.nn.functional as F

# 定义网络类
class Net(nn.Module):

    def __init__(self):
        super(Net, self).__init__()
        # 定义第一层卷积神经网络, 输入通道维度=1, 输出通道维度=6, 卷积核大小3*3
        self.conv1 = nn.Conv2d(1, 6, 3)
        # 定义第二层卷积神经网络, 输入通道维度=6, 输出通道维度=16, 卷积核大小3*3
        self.conv2 = nn.Conv2d(6, 16, 3)
        # 定义三层全连接网络
        self.fc1 = nn.Linear(16 * 6 * 6, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)

    # 前向传播   
    def forward(self, x):
        # 在(2, 2)的池化窗口下执行最大池化操作
        x = F.max_pool2d(F.relu(self.conv1(x)), (2, 2)) # 卷积+激活+池化
        x = F.max_pool2d(F.relu(self.conv2(x)), 2)      # 再次卷积+激活+池化
        x = x.view(-1, self.num_flat_features(x))       # 展平数据
        x = F.relu(self.fc1(x))                         # 全连接+激活
        x = F.relu(self.fc2(x))                         # 全连接+激活
        x = self.fc3(x)                                 # 输出层
        return x

    def num_flat_features(self, x):
        # 计算size, 除了第0个维度上的batch_size
        size = x.size()[1:]
        num_features = 1
        for s in size:
            num_features *= s
        return num_features


net = Net()
print(net)
```

模型中所有的可训练参数，可通过net.parameters()获得。

```python
params = list(net.parameters())
print(len(params))
print(params[0].size())
```

假设图像的输入尺寸为32 * 32：

```python
# 生成随机数据，形状是(1, 1, 32, 32)，表示1个样本，1个通道，32x32像素
input = torch.randn(1, 1, 32, 32)  # 随机生成输入
# 调用forward方法，输出结果是(1, 10)的张量，表示10个类别的预测值。
out = net(input)                  # 前向传播
print(out)                        # 输出结果
```

有了输出张量后，就可以执行梯度归零和反向传播的操作了：

```python
net.zero_grad()
out.backward(torch.randn(1, 10))
```

torch.nn构建的神经网络只支持mini-batches的输入, 不支持单一样本的输入.

比如: nn.Conv2d 需要一个4D Tensor, 形状为(nSamples, nChannels, Height, Width). 如果你的输入只有单一样本形式, 则需要执行input.unsqueeze(0), 主动将3D Tensor扩充成4D Tensor.

## 2 损失函数

输入是一个输入的pair: (output, target)，再计算出一个数值来评估output和target之间的差距大小。

torch.nn中有若干不同的损失函数可供使用, 比如nn.MSELoss就是通过计算均方差损失来评估输入和目标值之间的差距。

应用nn.MSELoss计算损失的一个例子:

```python
# 网络的预测结果，形状是(1, 10)
output = net(input)
# 随机目标 目标值，调整为(1, 10)与output匹配
target = torch.randn(10)

# 改变target的形状为二维张量, 为了和output匹配
# 调整形状为(1, 10)
target = target.view(1, -1)
# 均方误差损失  类似Java中(output - target)^2的平均值。
criterion = nn.MSELoss()

# 计算损失 一个标量，表示预测和目标的差距。
loss = criterion(output, target)
print(loss)
```

方向传播的链条：若我们跟踪loss反向传播的方向, 使用.grad_fn属性打印，可看到一张完整的计算图如下:

```python
input -> conv2d -> relu -> maxpool2d -> conv2d -> relu -> maxpool2d
      -> view -> linear -> relu -> linear -> relu -> linear
      -> MSELoss
      -> loss
```

当调用loss.backward()时, 整张计算图将对loss进行自动求导, 所有属性requires_grad=True的Tensors都将参与梯度求导的运算, 并将梯度累加到Tensors中的.grad属性中.

```python
# 输出损失的计算节点 PyTorch会自动构建计算图（类似Java的依赖树），grad_fn告诉你loss是怎么计算出来的，比如通过MSE、线性层等操作。
print(loss.grad_fn)  # MSELoss
print(loss.grad_fn.next_functions[0][0])  # Linear
print(loss.grad_fn.next_functions[0][0].next_functions[0][0])  # ReLU
```

## 3 反向传播（backpropagation）

神经网络训练的核心，用于计算每个参数的梯度。loss.backward()即可。

执行反向传播之前，要先将梯度清零，否则梯度会在不同的批次数据之间被累加。就像是**重置计数器**或**清空缓存**。目的是防止**梯度累加**导致的计算错误，通常在每次训练迭代开始前调用，相当于给神经网络一个"干净的纸"进行新一轮计算。

```python
# 梯度清零
net.zero_grad()

# 反向传播前的梯度
print('conv1.bias.grad before backward')
print(net.conv1.bias.grad)

# 反向传播
loss.backward()

# 反向传播后的梯度
print('conv1.bias.grad after backward')
print(net.conv1.bias.grad)
# 可以看到conv1.bias的梯度从0变成非零值，表示反向传播生效。
```

## 4 更新网络参数

训练的最后一步是根据梯度更新参数，常用方法是随机梯度下降（SGD）。更新参数最简单的算法。

公式为：
$$
weight = weight - learning_rate * gradient
$$
传统Python代码实现SGD:

```python
learning_rate = 0.01
for f in net.parameters():
    f.data.sub_(f.grad.data * learning_rate)
```

再用Pytorch官方推荐标准代码:

```python
# 先导入优化器的包, optim中包含若干常用的优化算法, 比如SGD, Adam等
import torch.optim as optim

# 创建优化器对象  PyTorch提供的优化器，封装了SGD逻辑，类似Java中的工具类。
optimizer = optim.SGD(net.parameters(), lr=0.01)

# 将优化器执行梯度清零
optimizer.zero_grad()

output = net(input)
loss = criterion(output, target)

# 对损失值执行反向传播
loss.backward()
# 参数的更新通过一行标准代码执行  根据梯度自动更新所有参数，比手动循环更简洁
optimizer.step()
```

## 5 总结

构建一个神经网络的典型流程：

- 定义一个拥有可学习参数的神经网络
- 遍历训练数据集
- 处理输入数据使其流经神经网络
- 计算损失值
- 将网络参数的梯度进行反向传播
- 以一定的规则更新网络的权重

损失函数定义：

- 采用torch.nn.MSELoss()计算均方误差
- 通过loss.backward()进行反向传播计算时，整张计算图将对loss进行自动求导所有属性requires_grad=True的Tensors都将参与梯度求导的运算，并将梯度累加到Tensors中的.grad属性

反向传播计算方法：

- 在Pytorch中执行反向传播非常简便，全部的操作就是loss.backward()
- 在执行反向传播之前，要先将梯度清零，否则梯度会在不同的批次数据之间被累加
  - net.zero_grad()
  - loss.backward()

参数更新方法：

- 定义优化器来执行参数的优化与更新

  - optimizer = optim.SGD(net.parameters(), lr=0.01)

- 通过优化器来执行具体的参数更新

  - optimizer.step()

这就像Java中设计一个复杂的对象系统，只不过PyTorch帮你自动处理了数学部分（梯度计算）。