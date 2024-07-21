# 智能合约的 helloworld 项目

## 1 Flow是什么？

开放世界的区块链。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/dfc13f50cda171e47ea7c0d63abf8b7f.png)

由Dapper Labs公司推出的开源区块链平台，旨在构建一个去中心化、可扩展且高吞吐量的生态系统。

### 1.1 项目背景

- 2017年，Dapper Labs制定了ERC721标准，并以此制作了加密猫游戏，引爆了NFT市场。
- 为了进一步推动NFT市场的增长，Dapper Labs开始开发Flow区块链平台。

### 1.2 技术特点



- Flow采用了一种独特的“分片”技术，将整个网络划分为多个较小的子网络（称为“分片”），每个分片独立运行，但通过通信协议相互连接。
- 这种设计使得Flow能够实现高吞吐量，同时保持较低的交易成本。

### 1.3 生态系统



Flow生态系统包括各种组件，如智能合约、钱包、交易所等，为开发者提供了丰富的工具来创建和管理应用程序。

### 1.4 应用场景



- NFT市场：Flow支持多种类型的NFT，包括收藏品、艺术品、游戏资产等，并具有强大的交易功能。
- DeFi应用：Flow上的DeFi项目可以利用其高吞吐量和低交易成本的优势，提供更好的用户体验。

### 社区参与



Flow鼓励社区成员参与平台的开发和治理，通过代币经济和治理机制来激励参与者。

### 安全性

Flow采用了多项安全措施，如零知识证明、同态加密等技术，以保护用户的数据和隐私。

### 未来计划

Dapper Labs计划在未来几年内，通过持续的开发和更新，增强Flow的功能和性能，使其成为更广泛的应用基础。

### 资源链接



- 官网：https://zh.onflow.org/
- 项目网站：https://www.flowverse.co/

Flow作为一款新兴的区块链平台，以其独特的设计理念和技术优势，有望在未来的数字世界中发挥重要作用。

### 多节点架构

- 更高的性能
- 更高的可扩容性
- 兼顾去中心化

Flow技术白皮书：https://zh.onflow.org/technical-paper

## 2 认识cadence

用于Fow区块链的新型智能合约编程语言，为数字资产而专门打造的智能合约编程语言。

面向资源编程，丰富的SDK，详细的开发文档，对开发友好，大部分语法都受到 Swift、Kotlin 和 TypeScript 的启发。更多语言特性：https://developers.flow.com/cadence#cadences-programming-language-pillars



## 3 Playground使用

[Web IDE](https://play.flow.com/)：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/d5cfec9eeabf5402ffe258bd7de95834.png)

点击这里可以看到一些demo 项目，可自学：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/c3ae29bda80144cd3685de8b2d3dcaa8.png)

## 4 智能合约的 helloworld 项目

这段代码是一个基于Flow平台的Cadence智能合约，名为HelloWorld。该智能合约定义了一个简单的问候系统，包含一个字符串字段和两个公共函数。

```java
// HelloWorld.cdc
//
// Welcome to Cadence! This is one of the simplest programs you can deploy on Flow.
//
// The HelloWorld contract contains a single string field and a public getter function.
//
// Follow the "Hello, World!" tutorial to learn more: https://docs.onflow.org/cadence/tutorial/02-hello-world/
pub contract HelloWorld {
  // Declare a public field of type String.
  //
  // All fields must be initialized in the init() function.
  pub var greeting: String

  // Public function that sets our friendly greeting!
  // In your own applications you may want to tighten up this access control.
  access(all) fun changeGreeting(newGreeting: String) {
    self.greeting = newGreeting
  }

  // Public function that returns our friendly greeting!
  access(all) fun hello(): String {
      return self.greeting
  }

  // The init() function is required if the contract contains any fields.
  init() {
    self.greeting = "Hello, World!"
  }
}

```

### 合约结构

1. **合约名称**：`HelloWorld`
   - 合约在Flow区块链上部署后，可以通过这个名称引用。

2. **公开字段**：`greeting`
   - 类型：`String`
   - 作用：存储问候语的内容。
   - 初始化：在合约的`init`函数中初始化为"Hello, World!"。

### 公共函数

1. **changeGreeting(newGreeting: String)**
   - 访问权限：`access(all)`，即任何人都可以调用。
   - 参数：`newGreeting`，类型为`String`。
   - 作用：将字段`greeting`的值更改为新的问候语。
   - 注意：在实际应用中，可能需要更严格的访问控制，以防止任意更改问候语。

2. **hello()**
   - 访问权限：`access(all)`，即任何人都可以调用。
   - 返回值：返回类型为`String`。
   - 作用：返回当前存储的问候语，即字段`greeting`的值。

### 初始化函数

- **init()**
  - 作用：初始化合约的字段。Cadence合约中所有的字段都必须在初始化函数中进行初始化。
  - 初始化内容：将`greeting`字段初始化为"Hello, World!"。

### 总结

这段Cadence智能合约通过定义一个简单的问候语系统，展示了以下几个概念和功能：

- 如何声明和初始化合约字段。
- 如何定义并公开访问控制函数，以允许外部用户更改和读取字段值。
- 使用`init`函数进行字段初始化，确保合约在部署时处于一致状态。

用于初学者学习Cadence语言和Flow区块链平台的基本概念和操作。

### 完成第一个合约开发

编写完合约部分代码，需要确认用户并部署：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/2c11aa0dd1801fadb14d152bfab28f51.png)

有时候，你代码的编译报错已经解决了，但报错提示还是存留，可刷新页面就没了。

显示合约名称，说明部署成功了：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/b9523eb1ab6c53b4909a1ab60716d0b1.png)

合约内再定义一个函数：

```solidity
  pub fun sayHello(name:String) : String {
    return name;
  }
```

加完后，记得重新 Deploy。脚本部分：

```solidity
import Helloword from 0x05

pub fun main():String {
  return Helloword.sayHello(name:"hi,JavaEdge")
}

```

点击运行脚本：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/c63cad12c0bf61d09b45436fcb275c34.png)

## 本地环境安装测试

安装指引：https://developers.flow.com/tools/flow-cli/install

Linux/macOS命令：

```bash
sh -ci "$(curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh)"
```

macOS命令：

```bash
brew upgrade flow-cli
```

Windows，打开PowerShell
执行命令：

```bash
iex “&{$(irm'https://storage.googleapis.com/flow-cli/install.ps1’)}”
```

### 检查安装成功

执行命令:flow cadence

第一个Cadence命令

```bash
flow cadence
log(” Hello, World!”)
```

Flow CLI 命令行界面:https://docs.onflow.org/flow-cli/

```bash
javaedge@JavaEdgedeMac-mini ~ % sh -ci "$(curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/v0.41.3/install.sh)" -- v0.41.2
Downloading version v0.41.2 ...
                 #        #          #            #                                                                                            -=O=-
Successfully installed the Flow CLI to /usr/local/bin.
Make sure /usr/local/bin is in your $PATH environment variable.
javaedge@JavaEdgedeMac-mini ~ %
```