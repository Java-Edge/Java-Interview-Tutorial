# 开放式系统互连（OSI，Open Systems Interconnection）模型

## 0 前言

开放式系统互连（OSI，Open Systems Interconnection）模型，由国际标准化组织（ISO）在1984年提出，目的是为了促进不同厂商生产的网络设备之间的互操作性。

定义了一种在层之间进行协议实现的网络框架，控制从一层传递到下一层。在概念上将计算机网络架构分7层，按照逻辑顺序进行。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/fa3cfb581a3093e0b0529cd82e978ae3.png)

用户角度：

- 较低层处理电信号、二进制数据块及这些数据在网络中的路由
- 较高层涵盖网络请求和响应、数据的表示及网络协议

OSI模型最初被构想为构建网络系统的标准架构，并且今天许多流行的网络技术都反映了OSI的分层设计。

### tcp/ip

先有协议栈，才有参考模型。TCP/IP协议栈是在OSI参考模型之前就已经存在的，并且是先有协议栈，然后才有了参考模型。TCP/IP协议栈和OSI参考模型之间的关系可以这样理解：

### 1. TCP/IP协议栈历史

TCP/IP协议栈起源于1970s，由美国国防部高级研究计划局（DARPA）开发，用于支持ARPANET（互联网的前身）。

随ARPANET发展，TCP/IP协议栈逐渐成为互联网核心协议，1983年成为ARPANET标准协议。

1982年，TCP/IP协议栈被正式标准化，成为互联网的基础协议。

### 2. OSI参考模型的历史

- **起源**：OSI参考模型由国际标准化组织（ISO）在1984年提出，目的是为了提供一个通用的网络通信框架，促进不同厂商设备之间的互操作性。
- **发展**：OSI参考模型虽然提出了一个理想的网络通信框架，但由于TCP/IP协议栈已经在互联网中广泛应用，OSI模型并没有完全取代TCP/IP协议栈。

### 3. TCP/IP协议栈与OSI参考模型的关系

- **层次对应**：尽管TCP/IP协议栈和OSI参考模型在层次划分上有所不同，但它们之间存在一定的对应关系。
  - **应用层**：对应OSI模型的应用层、表示层和会话层。
  - **传输层**：对应OSI模型的传输层。
  - **网络层**：对应OSI模型的网络层。
  - **网络接口层**：对应OSI模型的数据链路层和物理层。

- **实际应用**：在实际应用中，TCP/IP协议栈更为广泛使用，而OSI参考模型更多地用于教学和理论研究，帮助理解网络通信的各个层次和功能。

### 总结

TCP/IP协议栈是在OSI参考模型之前就已经存在的，并且是先有协议栈，然后才有了参考模型。TCP/IP协议栈在互联网中得到了广泛应用，而OSI参考模型则提供了一个通用的网络通信框架，帮助理解和设计网络系统。尽管两者在层次划分上有所不同，但它们之间存在一定的对应关系，共同促进了网络通信技术的发展。

## 1 物理层（Physical Layer）

OSI模型的物理层负责将数字数据位从发送（源）设备的物理层通过网络通信介质传输到接收（目的）设备的物理层。

物理层的技术包括以太网电缆和集线器。此外，集线器和其他中继器是标准网络设备，功能位于物理层，连接器也是如此。

在物理层，数据使用物理介质支持的信号类型进行传输：电压、无线电频率或红外或普通光的脉冲。

## 2 数据链路层（Data Link Layer）

在从物理层获取数据时，数据链路层检查物理传输错误，并将位打包成数据帧。数据链路层还管理物理寻址方案，例如以太网网络的MAC地址，控制网络设备对物理介质的访问。

由于数据链路层是OSI模型中最复杂的层次，通常被分为两个部分：

- 介质访问控制子层
- 逻辑链路控制子层

## 3 网络层

网络层在数据链路层之上添加了路由的概念。当数据到达网络层时，会检查每个帧中包含的源地址和目的地址，以确定数据是否到达最终目的地。如果数据到达最终目的地，本层将数据格式化为传递到传输层的数据包。否则，网络层会更新目的地址，并将帧推送到较低的层次。
为支持路由，网络层维护了诸如IP地址之类的逻辑地址，用于网络上的设备。网络层还管理这些逻辑地址与物理地址之间的映射。在IPv4网络中，通过地址解析协议（ARP）来完成这种映射；IPv6使用邻居发现协议（NDP）。

## 4 传输层

在网络连接中传递数据。TCP（传输控制协议）和UDP（用户数据报协议）是该层最常见的网络协议示例。不同的传输协议可以支持一系列可选功能，包括错误恢复、流量控制和重传支持。

## 5 会话层

管理启动和拆除网络连接的事件序列和流程。支持可以动态创建和在各个网络上运行的多种类型的连接。

## 6 表示层

OSI模型中功能最简单的部分。处理消息数据的语法处理，如格式转换和加密/解密，以支持位于其上方的应用层。

## 7 应用层

为最终用户应用程序提供网络服务。网络服务是与用户数据一起工作的协议。例如，在Web浏览器应用程序中，应用层协议HTTP将发送和接收Web页面内容所需的数据打包。这个第7层提供数据给（并从）表示层获取数据。