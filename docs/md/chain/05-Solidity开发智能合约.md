# 05-Solidity开发智能合约

## 0 Solidity和智能合约

Solidity开发可运行的智能合约步骤：

1. 源代码通过编译成字节码（Bytecode），同时会产生二进制接口规范（ABI）
2. 通过交易将字节码部署到以太坊网络，部署成功会产生一个智能合约账户
3. 通过web3.js+ABI去调用智能合约中的函数来实现数据的读取和修改

下面开始简单例子入手Solidity。

## 1 以太坊的前端 API

### 1.1 Web3.js

[地址]( https://github.com/ChainSafe/web3.js)：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/b6d5c849520d758833cd6037087fb6ed.png)

安装：

```bash
npm install web3
```

使用方法：

```JavaScript
// In Node.js
const Web3 = require('web3');
const web3 = new Web3('ws://localhost:8546');
console.log(web3);
// Output
{
    eth: ...,
    shh: ...,
    utils: ...,
}
```

也可像以下方法使用：

```js
import Web3 from 'web3';
import { BlockHeader, Block } from 'web3-eth' // ex. package types
const web3 = new Web3('ws://localhost:8546');
```

使用举例：

```js
web3.eth.getAccounts().then(console.log);
```

### 1.2 Ethereumjs

以太坊的实用程序功能集合，如ethereumjs-util和ethereumjs-tx，[github](https://github.com/orgs/ethereumjs/repositories?type=all)：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/c5a6d05d7ff4eaa268f55d17291aff53.png)

安装：

```bash
npm install ethereumjs-util
```

使用方法:

```js
import assert from 'assert'
import { isValidChecksumAddress, unpadBuffer, BN } from 'ethereumjs-util'

const address = '0x2F015CG60E0be116B1f0CD534704Dd9c92118FB6A'
assert.ok(isValidChecksumAddress(address))

assert.equal(unpadBuffer(Buffer.from('000000006600', 'hex'), Buffer.from('6600', 'hex'))
             
assert.equal(new BN('dead', 16).add(new BN('101010', 2)), 57047)
```

#### Ethereumjs-API

Account class：私钥/公钥和地址相关功能 (创建、验证、转换)

举例: Const generateAddress2

generateAddress2(from: Buffer, salt: Buffer, initCode: Buffer): Buffer

| Name     | Type   | Description        |
| -------- | ------ | ------------------ |
| from     | Buffer | 谁开始创建新地址   |
| salt     | Buffer | 加盐               |
| initCode | Buffer | 创建合约的初始代码 |

#### ethereumjs-wallet

[ethereumjs-wallet](https://github.com/ethereumjs/ethereumjs-wallet/blob/master/docs/README.md)： 轻量级钱包实现：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/93633dd8bfcaf74c5676afd761f9ec4a.png)

目前，它支持密钥创建和各种格式之间的转换。

使用方法：

import Wallet from 'ethereumjs-wallet'
Thirdparty API: import { thirdparty } from 'ethereumjs-wallet'
HD Wallet API: import { hdkey } from 'ethereumjs-wallet'

#### 其他常用接口

- light.js - 为轻客户端优化的高级反式JS库
- flex-contract 和 flex-ether - 零配置的高级库，用于与智能合约进行交互并进行交易
- ez-ens - ens-简单的零配置以太坊域名服务地址解析器
- web3x - web3.js的TypeScript端口。好处包括小巧的构造和全类型的安全性，包括与合同进行交互时的安全性
- Nethereum - 跨平台的以太坊开发框架
- Tasit SDK - 一个React Native库，使用在移动端与以太坊进行交互
- Delphereum - 以太坊区块链的Delphi接口，允许开发适用于Windows，macOS，iOS和Android的dApp开发
- Fortmatic - 一种易于使用的SDK，无需扩展或下载即可构建web3 dApp
- Portis - 具有SDK的非托管钱包，可轻松与DApp进行交互而无需安装任何东西

## 2 以太坊的后端 API

### 2.1 Web3.py - Python Web3

需要Python 3.7.2+

安装：

```bash
pip install web3
```

测试Provider：

```python
>>> from web3 import Web3, EthereumTesterProvider
>>> w3 = Web3(EthereumTesterProvider())
>>> w3.isConnected()
True
```

local Provider：

```python
>>> from web3 import Web3
# IPCProvider:
>>> w3 = Web3(Web3.IPCProvider('/path/to/geth.ipc'))
# HTTPProvider:
>>> w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
# WebsocketProvider:
>>> w3 = Web3(Web3.WebsocketProvider('wss://127.0.0.1:8546'))
>>> w3.isConnected()
True
```

获取最后的区块

```js
web3.eth.get_block("latest")
```

获取区块number

```python
web3.eth.block_number
```

检查账户余额

```python
# 输入钱包地址
web3.eth.get_balance('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')
```

### 2.2 Web3j：Java Ethereum Dapp API

轻量级、高度模块化、反应式、类型安全的Java和Android库，用于处理智能合约并与以太坊网络上的客户端（节点）集成。

运行时的依赖：

- RxJava：反应式扩展的Java-VM实现，一个库，用于使用可观察序列组合异步和基于事件的程序
- OKHttp：默认情况下高效的HTTP客户端
- Jackson Core : 快速J将SON序列化/反序列化
- Bouncy Castle : （Android上的Spongy Castle ）用于加密
- Jnr-unixsocket：类Unix系统的IPC（Android上不可用）
- Java-WebSocket：该存储库包含一个纯Java编写的基本WebSocket服务器和客户端实现。底层类是用java实现的。它允许非阻塞事件驱动模型（类似于web浏览器的WebSocket API）。

Java:

```xml
<dependency>
    <groupId>org.web3j</groupId>
    <artifactId>core</artifactId>
    <version>4.8.7</version>
    </dependency>
```

Android:

```xml
<dependency>
    <groupId>org.web3j</groupId>
    <artifactId>core</artifactId>
    <version>4.8.7-android</version>
    </dependency>
```

### 2.3 Ethereum-php

Ethereum JSON-RPC API的类型，支持PHP-7.1+。

在composer.json文件中添加类库

```json
{
    "minimum-stability": "dev",
    "autoload": {
        "psr-4": {
            "Ethereum\\\": "src/"
        }
    },
    "repositories": [
        {
            "type": "git",
            "url": "https://github.com/digitaldonkey/ethereum-php.git"
        }
    ],
    "require": {
        "digitaldonkey/ethereum-php": "dev-master"
    }
}
```

用法：composer require digitaldonkey/ethereum-php

```php
require __DIR__.'/vendor/autoload.php';
use Ethereum\Ethereum;
try {
    // Connect to Ganache
    $eth = new Ethereum('http://127.0.0.1:7545');
    // Should return Int 63
    echo $eth->eth_protocolVersion() ->val();
}
catch (\Exception $exception) {
    die("Unable to connect.");
}
```

### 其它

- Nethereum - .Net Web3
- Ethereum.rb - Ruby Web3
- Eventeum - 由Kauri用Java编写的以太坊智能合约事件和后端微服务之间的桥梁
- Ethereum-jsonrpc-gateway - 一个网关，允许您运行多个以太坊节点以实现冗余和负载平衡。可以作为Infura的替代品（或在其之上）运行。用Golang写的
- Ethereum Contract Service - 一种MESG服务，可根据其地址和ABI与任何以太坊合约进行交互
- Ethereum Service - 一种MESG服务，用于与以太坊中的事件进行交互并与其进行交互
- Marmo - Python, JS和Java SDK，以简化与以太坊的交互。使用中继器将交易成本分担给中继器

## 3 开发环境部署

### 3.1 npm

Node Package Manager，一个软件包管理系统，专管理用 js 编写的软件包。可免费下载别人写好的js软件包，并用到项目中，当然也可以上传共享自己写的js软件包。

Node.js内置npm，只要安装node.js，就可直接使用npm。

node官网: https://nodejs.org/en/

安装完 node.js 后，把npm更新到最新版本：

```bash
npm install npm@latest -g
```

#### 项目使用npm

1. 初始化：根据提示填写信息，即可产生package.json文件
   cd <项目根目录>
   npm init
2. 使用npm下载安装包

安装需要使用的包

```bash
npm install lodash
```



安装完成后，package.json中会添加版本信息，如下：

```json
{
    "dependencies": {
        "lodash": "^1.0.0"
    }
}
```

使用安装的包：

```js
var lodash = require('lodash');
var output = lodash.without([1,2,3],1);
console.log(output);
```

更新包

法一：根据版本号更新

```bash
npm install lodash@版本号
```

法二：更新最新版本

```bash
- npm install lodash
- npm install lodash@latest
```

法三：修改package.json中包的版本号，下次npm install会自动更新会修改后的版本。

#### npm常用命令

```bash
#全局安装 lodash
npm install -g lodash

#本地安装 lodash（默认安装最新版本）
npm install lodash
npm install lodash@latest

#安装指定版本
npm install lodash@1.0.0

#卸载
npm uninstall lodash

#查看已安装
npm ls

#更新 lodash 到最新版本
npm update lodash

#搜索 lodash
npm search lodash
```

#### 常见错误

Error: Cannot find moduel

packages 没有被安装

解决方法：

```bash
# 无作用域包安装
npm install <package_name>

# 有作用域包安装
npm install <@scope/package_name>
```

安装出错，错误提示:npm resource busy or locked...

可先清除再重新安装

```bash
npm cache clean

npm install
```

#### 版本控制符

版本号由三位数字组成（例如：1.2.3）:

- 第一位表示主版本
- 第二位表示次要版本
- 第三位表示补丁版本

```bash
^表示用于确定主版本号，~用于确定主版本号+次要版本号

^1：等同于1.xx，以1开头所有版本

~2.2：等同于2.2.x，以2.2开头所有版本

~2.2.1：以2.2开头，且最后一位补丁号≥1的所有版本，即2.2.1与2.2.9之间版本，包括头尾
```

如：

```json
"dependencies": {
  "my_dep": "^1.0.0",
  "another_dep": "~2.2.0"
},
```

### 3.2 Ganache（过时）

运行在PC上的以太坊开发者的个人区块链。

Ganache，Truffle Suite的一部分，通过把合约和交易放到前面来简化dapp的开发。

用Ganache可快速看到你的应用咋影响区块链的。细节如：你的账户、余额、合约及Gas成本。也可调整Ganache的采矿控制来更好的适用你的应用。

Ganache为那些不在GUI工作的人提供一个命令行工具。非常适合自动化测试和持续集成的环境。

```bash
sodu npm install -g ganache-cli
```

安装完成后命令行输入

```bash
$ ganache-cli
```

查看是否安装成功

启动ganache-cli指令：

```bash
ganache-cli
```

图形界面的版本，下载地址:https://github.com/trufflesuite/ganache/releases

#### Ganache常见命令参数

调整挖矿时间（Ganache默认是在交易产生时进行挖矿）：

```bash
//10秒产生一个区块
ganache-cli -b 10
```

指定主机端口与网络ID:

```bash
//指定IP，端口及网络ID
ganache-cli -h 127.0.0.1 -p 8545 -i 8888
```

设置gas价格和gas上限:

```bash
ganache-cli -g 20000000
ganache-cli -l 10000000
```

输出RPC调用请求体:

```bash
ganache-cli -v
```

-v不是version缩写，而是verbose的意思，RPC调用默认只输出方法名，如eth_getBlockByNumber，而使用-v则会输出请求体

#### 常见命令参数

指定默认生成账户的以太币: 

```bash
ganache-cli -e 1000
```



指定默认生成的账户数量: 

```bash
ganache-cli -a 50
```



助记词相关:

```bash
ganache-cli -d
ganache-cli -m "boil razor arrest first space chicken social explain leader soon unique upset"
ganache-cli -s "hello"


-d: 让Ganache启动节点时使用固定的预定义助记词，这样其他连接Ganache的轻钱包不用每次重新导入助记词。
-m: 可指定助记词，使用相同的助记词会生成一个相同的HD钱包；
-s: 指定一个种子用来生成助记词，然后使用助记词生成HD钱包，相同的种子会产生相同的助记词从而生成相同的HD钱包。
```

锁定和解锁账户：

```bash
# 使用--secure --unlock
ganache-cli --secure --unlock "0x67a3119994ffc7b384e086e443bf7a73a96a45c06ae3d1b163586ebc8e6f22"
--unlock "0xac0603889ceee85ff0075de364d4fc92d383cecc57c2a2c3465404c8296feab15"

# 或用-n -u
ganache-cli -n -u 0 -u 1
```

指定账户：

```bash
ganache-cli --account="<privatekey>",balance" [--account="<privatekey>",balance"]
```

#### 在工程中启动Ganache的server

Ganache除了可以直接提供Provider之外，还可以作为一个HTTP Server，这样其他的一些服务或者应用就可以通过HTTP的方式调用对应的接口。使用非常简单，我们使用上面建立的工程，不过要添加一个依赖CircularJSON，执行下面的命令安装

```bash
npm i circular-json -S
```

在工程中启动Ganache的server，然后在工程目录下面创建一个server.js文件：

```JavaScript
// 读写文件
const fs = require('fs');
// 提供测试服务
const ganache = require("ganache-cli");
// 格式化输对像
const CircularJSON = require('circular-json');
var server = ganache.server();
// 监听8545端口
server.listen(8545, function(err, blockchain){
    console.log(err);
    console.log(blockchain)
    // fs.writeFileSync('blockchain.txt', CircularJSON.stringify(blockchain));
    // 输出ganache-cli中区块链数据结构及内容到blockchain文件中
    fs.writeFileSync('blockchain.txt', CircularJSON.stringify(blockchain, null, '\t')
    // 打印钱包助记词
    console.log(blockchain.mnemonic);
});
```

启动服务器不需要web3.js，但是需要文件，所以引入Node.js的ts模块和circular-json将对象转换为字符串，因为对象中有循环引用，所以不能直接使用JSON，而是使用了CircularJSON。

上面设置监听端口8545，回调函数中我们打印了一下blockchain的助记词，当然也可以打印其他blockchain中的数据。blockchain的数据比较多，所以没有直接使用console输出，而是写入blockchain.txt文件中，多看这个文件有助于理解以太坊区块链数据结构。

因为数据比较多，这里就不一一给出blockchain的数据了，感兴趣可以自己动手试一试，然后看一下blockchain文件中的数据。

#### 配置工程中依赖的Ganache

Ganache作为工程依赖的配置和命令行使用命令参数基本一致，以下为Ganache工程依赖常用的配置

| 参数                  | 说明                                           |
| --------------------- | ---------------------------------------------- |
| accounts              | 和命令行的--accounts相同                       |
| logger                | 实现了log方法的对象，例如console，用于输出日志 |
| mnemonic              | 字符串，设置助记词                             |
| port                  | 整数，设置端口                                 |
| seed                  | 字符串，设置种子                               |
| total_accounts        | 数字类型，账号数量                             |
| default_balance_ether | 每一个生成账户，默认的以太坊数量               |
| network_id            | 整数，网络ID                                   |
| blocked               | boolean值，是否锁定账户                        |
| unlocked_accounts     | 数组，不确定账户、地址或者索引值               |
| db_path               | 区块数据存放位置                               |

### Geth

又名Go Ethereum，是以太坊协议的三种实现之一，由Go语言开发，完全开源的项目。Geth可以被安装在很多操作系统上，包括Windows、Linux、Mac的OSX、Android或者IOS系统.
Geth官网: https://geth.ethereum.org/：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/78c7abf455bb4bffe910f76a69f76f7a.png)

Geth的Github地址: https://github.com/ethereum/go-ethereum：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/8966b85a0f7749c4c23de748114ce1b9.png)

作者: DeeLThink https://www.bilibili.com/read/cv16165148

输入 geth version，检查是否安装成功

#### Geth常用命令

USAGE

```bash
geth [options] command [command options] [arguments...]：geth [选项] 命令 [命令选项][参数...]
```

COMMANDS

```bash
account  Manage accounts
//管理账户
attach    Start an interactive JavaScript environment (connect to node)
//启动交互式JavaScript环境（连接到节点）
bug       opens a window to report a bug on the geth repo
//给github源代码仓库提issue，提交bug
console   Start an interactive JavaScript environment
//启动交互式JavaScript环境
```

| copydb     | Create a local chain from a target chaindata folder  //从文件夹创建本地链 |
| ---------- | ------------------------------------------------------------ |
| dump       | Dump a specific block from storage   //Dump（分析）一个特定的块存储 |
| dumpconfig | Show configuration values                                    |
| export     | Export blockchain into file                                  |
| import     | Import a blockchain file                                     |
| init       | Bootstrap and initialize a new genesis block                 |
| js         | Execute the specified JavaScript files   //执行指定的JavaScript文件(多个) |

```bash
license   Display license information    //显示许可信息
makecache Generate ethash verification cache (for testing)   //生成ethash验证缓存(用于测试)
makedag Generate ethash mining DAG (for testing)   //生成ethash挖矿DAG(用于测试)
monitor Monitor and visualize node metrics    //监控和可视化节点指标
removedb Remove blockchain and state databases   //删除区块链和状态数据库
version Print version numbers    //打印版本号
wallet Manage Ulam presale wallets   //管理Ethereum预售钱包
help, h Shows a list of commands or help for one command   //显示一个命令或帮助一个命令列表
```

## 4 投票的例子

以下是一个简单的Solidity合约示例，它实现了电子投票的功能。这个合约的主要目标是确保投票权被正确分配，并防止被操纵。
首先，我们创建了一个委托投票机制，允许选民将他们的投票权委托给他们信任的人。为了做到这一点，我们需要为每个选民（即“表决”）创建一个独立的地址，并赋予他们投票权。然后，作为合约的创造者——即“主席”，我们将为每个选项提供一个简称为“winningProposal()”的函数，用于返回获得最多投票的提案。
在投票时间结束时，“winningProposal()”函数会返回获得最多投票的提案，从而实现电子投票的功能。

```solidity
pragma solidity ^0.4.22
//@title 委托投票

contract Ballot{  
    //这里声明了一个新的复合类型用于稍后的变量  
    //它用来表示一个选民  
    struct Voter {  
        uint weight; //计票的权重  
        bool voted; //若为真，代表该人已投票  
        address delegate; //被委托人  
        uint vote; //投票提案的索引  
    }  
    //提案的类型  
    struct Proposal {  
        bytes32 name; //简称（最长32个字节）  
        uint voteCount; //得票数  
    }

    address public chairperson;

    // 这声明了一个状态变量，为每个可能的地址存储一个 `Voter`。
    mapping(address => Voter) public voters;

    // 一个 `Proposal` 结构类型的动态数组
    Proposal[] public proposals;

    // 为 `proposalNames` 中的每个提案，创建一个新的（投票）表决
    constructor(bytes32[][] proposalNames) public {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        //对于提供的每个提案名称，
        //创建一个新的 Proposal 对象并把它添加到数组的末尾。
        for (uint i = 0; i < proposalNames.length; i++) {
            // `Proposal({...})` 创建一个临时 Proposal 对象，
            // `proposals.push({...})` 将其添加到 `proposals` 的末尾
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    // 授权 `voter` 对这个（投票）表决进行投票
    // 只有 `chairperson` 可以调用该函数
    function giveRightToVote(address voter) public {
        // 若 `require` 的第一个参数的计算结果为 `false`，
        // 则终止执行，撤销所有对状态和以太币余额的改动。
        // 在旧版的 EVM 中这曾经会消耗所有 gas，但现在不会了。
        // 使用 require 来检查函数是否被正确地调用，是一个好习惯。
        // 你也可以在 require 的第二个参数中提供一个对错误情况的解释。
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );

        require(
            !voters[voter].voted,
            "The voter already voted."
        );

        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }

    //把你的投票委托到投票者 `to`。
    function delegate(address to) public {
        //传引用
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        //委托是可以传递的，只要被委托者 `to` 也设置了委托。
        //一般来说，这种循环委托是危险的。因为，如果传递的链条太长，则可能需消耗的gas要多于区块中剩余的（大于区块设置的gasLimit），这种情况，委托不会被执行。
        //而在另一些情况下，如果形成闭环，则会让合约完全卡住。
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
        }
        //不允许闭环委托
        require(to != msg.sender, "Found loop in delegation.");

        // `sender` 是一个引用，相当于对 `voters[msg.sender].voted` 进行修改
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            // 若被委托者已经投过票了，直接增加得票数
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            // 若被委托者还没投票，增加委托者的权重
            delegate_.weight += sender.weight;
        }
    }

    //把你的票(包括委托给你的票)，  
    //投给提案 `proposals[proposal].name`.  
    function vote(uint proposal) public {  
        Voter storage sender = voters[msg.sender];  
        require(!sender.voted, "Already voted.");  
        sender.voted = true;  
        sender.vote = proposal;

        //如果 `proposal` 超过了数组的范围，则会自动抛出异常，并恢复所有的改动  
        proposals[proposal].voteCount += sender.weight;  
    }

    //@dev 结合之前所有的投票，计算出最终胜出的提案  
    function winningProposal() public view  
    returns (uint winningProposal_)  
    {  
        uint winningVoteCount = 0;  
        for (uint p = 0; p < proposals.length; p++) {  
            if (proposals[p].voteCount > winningVoteCount) {  
                winningVoteCount = proposals[p].voteCount;  
                winningProposal_ = p;  
            }  
        }
    }

    //调用winningProposal()函数以获取提案数组中获胜者的索引，并以此返回获胜者的名称
    function winnerName() public view
        returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}
```

参考：

- https://github.com/MetaMask