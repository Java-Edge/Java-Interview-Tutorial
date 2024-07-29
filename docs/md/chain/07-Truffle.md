# 07-Truffle

## 0 简介

Truffle是一个针对基于以太坊的Solidity语言的一套开发框架。它本身是基于JavaScript的。

## 1 为我们带来了什么？

首先对客户端做了深度集成。开发、测试、部署一行命令都可以搞定。不用再记那么多环境地址，繁重的配置更改，及记住诸多的命令。
它提供了一套类似maven或gradle这样的项目构建机制，能自动生成相关目录，默认是基于Web的。当前这个打包机制是自定义的，比较简陋，不与当前流行打包方案兼容。但自己称会弃用，与主流兼容，好在它也支持自定义打包流程。
提供了合约抽象接口，可以直接通过var meta = MetaCoin.deployed()拿到合约对象后，在JavaScript中直接操作对应的合约函数。原理是使用了基于web3.js封装的Ether Pudding工具包。简化开发流程。
提供了控制台，使用框架构建后，可以直接在命令行调用输出结果，可极大方便开发调试。
提供了监控合约，配置变化的自动发布，部署流程。不用每个修改后都重走整个流程。

## 2 世界级的开发环境

测试框架，以太坊的资源管理通道，致力于让以太坊上的开发变得简单，Truffle有以下：

1. 内置的智能合约编译，链接，部署和二进制文件的管理。
2. 快速开发下的自动合约测试。
3. 脚本化的，可扩展的部署与发布框架。
4. 部署到不管多少的公网或私网的网络环境管理功能
5. 使用EthPM&NPM提供的包管理，使用ERC190标准。
6. 与合约直接通信的直接交互控制台（写完合约就可以命令行里验证了）。
7. 可配的构建流程，支持紧密集成。
8. 在Truffle环境里支持执行外部的脚本。

## 3 安装

```
$ npm install -g truffle
```

### 环境要求

- NodeJS 5.0+
- Windows, Linux,或Mac OS X

## 4 命令



| 命令            | 说明                                                         |
| --------------- | ------------------------------------------------------------ |
| build           | 构建一个开发中的app版本，创建.build目录。<br>可选参数：<br>--dist: 创建一个可发布的app版本。仅在使用默认构造器时可用。 |
| console         | 运行一个控制台，里面包含已初始的合约，并随时可用的合约对象。<br>可选参数：<br>--network 名称: 指定要使用的网络<br>--verbose-rpc: 输出Truffle与RPC通信的详细信息 |
| compile         | 智能编译你的合约，仅会编译自上次编译后修改过的合约，除非另外指定强制更新。<br>可选参数：<br>--compile-all: 强制编译所有合约，<br>--network 名称: 指定使用的网络，保存编译的结果到指定的网络上。 |
| create:contract | 工具方法使用脚手架来创建一个新合约，名称需要符合驼峰命名<br>$ truffle create:contract MyContract |
| create:test     | 工具方法，使用脚手架来创建一个新的测试方法。名称需要符合驼峰命名。<br>$ truffle create:test MyTest |
| exec            | 在Truffle的环境下执行一个Javascript文件。环境中包含，web3，基于网络设置的默认provider，作为全局对象的你的合约对象。这个Javascript文件需要export一个函数，这样Truffle可以执行。查看10. 外部脚本来了解更多。 |
| init            | 在当前目录初始化一个新APP，一个全新工程，默认的合约和前端配置 |
| serve           | 在http://localhost:8080提供编译好的app版本的服务，并在需要的时候自动构建，自动部署。与truffle watch类似，区别在于增加了web服务功能。<br>可选参数：<br>--port: 指定HTTP服务的端口，默认是8080。<br>--network 名称: 名称: 指定使用的网络，保存编译后的资料保存到那个网络 |
| test            | 运行所有在./test目录下的测试文件                             |
| watch           | Watch合约、APP，和配置文件变化。在需要时自动构建APP          |

https://archive.trufflesuite.com/boxes/

```
truffle unbox webpack
migrate --reset --network
```

```bash
create:
truffle create contract math,创建一个新的合约，放在contract目录下
truffle create migration math,创建一个部署脚本，放在migrations目录下
truffle create test math,创建一个测试脚本，放在test目录下

包相关命令:
truffle init,初始化工程
truffle install name@version,安装包
truffle publish,发布自己的包给别人用
truffle unbox,下载合约模板
truffle networks[--clean],在发布包之前清除网络配置

其他命令:
truffle console,启动控制台和以太坊客户端交互，可以通过network指定网络，也可以使用--verbose-rpc打印交互信息
truffle exec name.js,执行js文件
truffle opcode name.sol,用来查看合约操作码
truffle viersion
truffle watch,可以监听项目文件修改，如果修改了，就会重新自动构建项目
truffle help
```

