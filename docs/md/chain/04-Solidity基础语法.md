# 04-Solidity基础语法



## 1 什么是Solidity

一门面向合约的高级编程语言，主要用来编写以太坊只能合约。

Solidity受C语言，Python和js影响，但为编译成为以太坊虚拟机字节码在EVM上执行，很多特性和限制都和EVM相关。

Solidity 是静态类型语言，支持继承、库、自定义复杂类型和其他特性。目前Solidity 编程的最好方式是用 Remix。Remix是一个基于 Web 浏览器的 IDE，它可以让你编写Solidity智能合约，然后部署并运行该智能合约。

## 2 Solidity语言特性

Solidity语法接近js，一种面向对象的语言作为一种真正意义上运行在网络上的去中心合约，它又有很多不同：

- 以太坊底层基于帐户，而非 UTXO，所以增加了一个特殊的address 的数据类型用于定位用户和合约
  imooc账户
- 语言内嵌框架支持支付，提供了 payable 等关键字，可在语言层面直接支持支付
- 使用区块链进行数据存储。数据的每一个状态都可以永久存储，所以在使用时需要确定变量使用内存。还是区块链存储
- 运行环境是在去中心化的网络，所以需要强调合约或函数执行的调用的方式
- 不同的异常机制，一旦出现异常，所有的执行都将会被回撒，这主要是为了保证合约执行的原子性，以避免中间状态出现的数据不一致

## 3 智能合约示例

最外层是contract关键字，Solidity是一门面向合约的语言。

contract就是一种很好地体现，所有的合约结构都是在contract包围之中。像Java这种OO语言，最外层是 class 包围，但在 Solidity 中不是定义一个类，而是定义一个合约。

合约中可包含状态变量、函数、事件、自定义类型等。

```solidity
contract SolidityContract {}
```

合约的最简结构，首先是contract关键字，后面是合约名字，花括号“”中是合约体。

```solidity
pragma solidity ^0.4.22;

contract SolidityContract {
    uint8 public id;
    string internal name;
    
    struct Funder {
        address addr;
        uint amount;
    }
    
    Funder fund = Funder(msg.sender, 1);
    bytes bytesValue = "a";
    bytes1 bytes1Value = 0x1;
    uint8[3] nums = [1, 2, 3];
    // dynamicNums 定义有误，因为声明了大小为1的数组，却试图初始化3个元素
    // uint8[1] dynamicNums = [1, 2, 3]; // 这行代码是错误的
    uint8[] dynamicNums = [1, 2, 3]; // 修正为数组动态大小
    
    mapping (address => uint) myMapping;
    
    enum Color { Red, Green }
    
    address ownedAddr;
    
    function myFunction() internal returns (bool res) {
        throw; // 在Solidity 0.4.22中，应该使用 revert() 或 require() 来处理错误
    }
    
    modifier checkTime(uint _time) {
        require(now >= _time);
        _;
    }
    
    event LogEvent(address victim); // 修正了 "aderess" 为 "address"
}
```

## 4 Solidity编译版本

在Solidity文件中第一行：

```solidity
pragma solidity ^0.4.22;
```

pragma，编译指示的意思，不是program，是为说明这个Solidity文件可以使用哪些版本的编译器编译。

上面编译指示的意思就是编译器版本version的范围是0.4.23<=version<0.5.0

也可直接指定：

```solidity
pragma solidity >=0.4.24 <0.5.0
```

## 5 IDE

### Remix 编辑器

网页版的Solidity编辑器。Remix非常强大，可直接在浏览器中使用，不用开发者自己搭建开发环境。

Remix项目现在已经迁移到remix-ide：https : /github.com/etheraml/renix-ide 找到项目。

无需本地搭建，可直接使用的服务
solidity/https ://ethereum.github.io/browser
https://remix.ethereum.org/

#### 本地构建

```bash
git clone https://github.com/ethereum/remix-ide.git
cd remix-ide
npm install
npm run setupremix
npm start
```

一般使用打包好的NPM模块即可，先执行安装remix-ide:

```bash
npm install remix-ide -g
```

启动remix-ide: remix-ide

然后在浏览器中访问http://localhost:8080就可以看到完整的Remi页面。

主要有文件管理、控制台、代码编辑、编译、运行和配置等相关模块。

## 6 常见概念

### 6.1 状态变量

类似其他语言的成员变量，因为Solidity是一门面向合约的语言，以太坊的交易本质其实是一种状态机，从一
种状态到另一种状态。

合约的本质也是在合适的条件触发交易。

```solidity
pragma solidity >=0.4.22 <0.6.0;

constant StateVar {
    string name;

    uint32 id;
}
```

### 6.2 局部变量

也叫本地变量。局部变量不仅是函数中的变量，参数也属局部变量，包括入、出参都是局部变量。

状态变量和局部变量：

- 状态变量只会出现在一个位置
- 局部变量可以是函数的入参，出参和函数体中定义的变量

```solidity
pragma solidity >=0.4.22 <0.6.0;
contract Variable {
		// 状态变量
    uint8 stateVar;
    function variableTest(uint8 inArgLocalVar) returns (uint8 outArgLocalVar){
        uint8 functionBodyLocalVar;
        return 0;
    }
}
```

### 6.3 函数

简化版函数定义模型：

```solidity
function function Name (<parameter types>)[returns (<return types>)]
```

若函数有返回值，须用returns关键字 + 函数参数的返回值类型列表。

Solidity允许返回多值，所以要确定返回顺序。

相近关键字：

- return，和其他函数一样用于返回值
- returns，用于定义函数返回参数

### 6.4 返回多值

支持返回多值。

Solidity 函数的返回值不是一个单独类型，而是一个类型列表。

返回值的声明放在最后。

```solidity
pragma solidity >=0.4.22 <0.6.0;

/**
返回多值
*/
contract ReturnContract {
    // 只有一个返回值uint8
    function singleReturnTest() public pure returns (uint8) {
        uint8 num = 111;
        return num;
    }

    // 返回多值
    function multipleReturnTestOne()
        public
        pure
        returns (uint8, uint16, string)
    {
        uint8 num = 111;
        return (num, num, "multiple");
    }
}
```

### 6.5 构造函数

Solidity也有构造函数，就是和合约同名的函数，但只允许有一个。

合约创建时调用相关的代码完成初始化工作。

```solidity
pragma solidity ^0.4.24;

contract StateVariableContract {
    string name;
    uint32 id;
    
    // 使用constructor关键字标识构造函数
    constructor() {
        id = 10;
    }
    
    function getId() returns(uint32){
        return id;
    }
}
```

创建完合约执行 getld 就可发现ID已变为10。

constructor也可有参数，除非是为了继承，因此一般不要有参数。

constructor只能是public或internal类的，默认public。

如被标注为intemnal，合约就会被标注为abstract 的抽象合约。

### 6.6 异常

执行合约时经常会出现一些异常，都是EVM底层抛出的，Solidity也支持使用throw抛出异常，不同的是Solidity不支持异常捕获，抛出异常之后会回滚所有之前执行的操作。

在Remix中编译创建合约执行throwTest方法，可发现执行前、后num值都是10，并没有被修改。

throw关键字已不再推荐，因使用throw的场景一般是条件不满足的情况。可先执行相关条件检查，使用require、assert、rever函数代替throw。

```solidity
pragma solidity >=0.4.22 <0.6.0;

contract ThrowContract {
    uint8 public num = 10;

    function throwTest() public {
        num = 100;
        //抛出异常，自动回滚
        throw;
    }
}
```

### 6.7 注释

支持两种注释：

注释一般都是为了说明合约、接口、库函数相关功能和注意事项。可直接当文档使用。

- 单行注释，使用两个连续的双斜线
- 多行注释，使用一个单斜线和一个星号作为开始
- 一个星号一个单斜线作为结束

所以Solidity编译器很贴心地准备了从注释生成文档的功能。

### 6.8 值类型

#### 布尔bool

```solidity
bool b1;

bool b2 = false;

bool b3 = true;
```

#### 整形int uint

- int（有符号整型，有正有负）
- uint（无符号整型，无负数）
- 以8位为区间，支持int8，int16，int24至int256，uint同理
- nt默认为int256，uint默认为uint256

#### 函数类型

也就是我们所说的函数，本身也是一个特殊变量，可当做变量赋值，当做函数参数传递，当做返回值。

函数名，函数签名（返回值，参数类型，修饰符）

#### 地址(Address)

以太坊地址的长度，20字节，20*8=160位，可用uint160编码。地址是所有合约的基础，所有的合约都会继承地址对象，通过合约的地址串，调用合约内的函数。

#### 枚举类型（enums）

枚举类型是在Solidity中的一种用户自定义类型。

枚举可以显式的转换与整数进行转换，但不能进行隐式转换。显示的转换会在运行时检查数值范围，如果不匹配，将会引起异常。

枚举类型应至少有一名成员，枚举元素默认为uint8，当元素数量足够多时，会自动变为uint16，第一个元素默认为0，使用超出范围的数值时会报错。

#### 定长字节数组

solidity内置了一些数组的数据类型：bytes1，…，bytes32，允许值以步长1递增。

byte默认表示bytes1，byte是类型，bytes是类型，bytes1是内置数组。

bytes1只能存储1个字节，即8位的内容，bytes2最多只能存储2个字节，即16位的内容。以此类推…

- 长度可读取length(返回bytes5类型的长度，而不是赋值的长度)
- 长度不可修改
- 可通过下标访问
- 内容不可修改
- 内置成员：length，返回数组长度
- 存储方式：16进制ascii码



Solidity是一种为实现智能合约而设计的编程语言，运行在Ethereum虚拟机（EVM）之上。本文将带你了解Solidity的基础语法，包括运算符、控制语句、修饰符以及数据类型，为你的Solidity学习之旅奠定坚实的基础。

## 7 运算符

Solidity支持一系列的运算符，这些运算符与大多数编程语言相似，包括算术运算符、比较运算符、逻辑运算符等。

### 算术运算符

- `+`：加法
- `-`：减法
- `*`：乘法
- `/`：除法
- `%`：取余

### 比较运算符

- `==`：等于
- `!=`：不等于
- `>`：大于
- `<`：小于
- `>=`：大于等于
- `<=`：小于等于

### 逻辑运算符

- `&&`：逻辑与
- `||`：逻辑或
- `!`：逻辑非

### 位运算符

- `&`：位与
- `|`：位或
- `^`：位异或
- `~`：位非
- `<<`：左移
- `>>`：右移

### 赋值运算符

- `=`：赋值
- `+=`：加后赋值
- `-=`：减后赋值
- `*=`：乘后赋值
- `/=`：除后赋值
- `%=`：取余后赋值

## 8 控制语句

Solidity的控制语句用于控制程序的执行流程，包括条件语句和循环语句。

### 条件语句

- `if`：如果条件为真，则执行代码块。
- `else if`：如果前面的`if`条件为假，且当前`else if`条件为真，则执行代码块。
- `else`：如果所有前面的条件都为假，则执行代码块。

```solidity
if (x < 10) {
    x += 1;
} else if (x > 10) {
    x -= 1;
} else {
    // x 等于 10
}
```

### 循环语句

- `for`：重复执行代码块，直到指定的条件不再满足。
- `while`：在条件为真的情况下，重复执行代码块。
- `do...while`：先执行一次代码块，然后检查条件，如果条件为真，则继续执行。

```solidity
for (uint i = 0; i < 10; i++) {
    x += i;
}
```

## 9 修饰符

Solidity的修饰符用于定义函数和变量的可见性以及行为。

### 可见性修饰符

- `public`：任何地方都可以访问。
- `private`：仅在当前合约内部可以访问。
- `internal`：仅在当前合约及其继承合约中可以访问。
- `external`：仅在合约外部可以访问，通常用于接收以太币的函数。

### 状态修饰符

- `view`：函数不会修改状态变量，可以读取状态变量。
- `pure`：函数不会读取或修改状态变量，只能使用参数。
- `payable`：函数可以接收以太币。

```solidity
function getBalance() public view returns (uint) {
    return address(this).balance;
}
```

## 10 数据类型

Solidity提供了一系列的数据类型，用于存储和操作数据。

### 值类型

- `bool`：布尔值，`true`或`false`。
- `int`/`uint`：有符号和无符号整数，支持不同位数，如`int8`、`uint256`。
- `fixed`/`ufixed`：有符号和无符号的固定小数点类型。
- `address`：以太坊地址类型，存储以太坊地址。

### 引用类型

- `array`：数组，可以存储固定或动态大小的元素序列。
- `struct`：结构体，用于表示复合数据类型。
- `mapping`：映射，键值对的数据结构。

### 字面量和字面量类型

- 字面量可以直接赋值给变量，如`uint x = 123;`。
- 字面量类型包括整数字面量、布尔字面量、字符串字面量等。

```solidity
uint256 constant x = 32**22 + 8;
```

通过以上内容，你已经对Solidity的基本语法有了初步的了解。接下来，你可以通过实践编写智能合约，加深对Solidity语言特性的理解和掌握。记得，学习编程的最佳方式是动手实践！