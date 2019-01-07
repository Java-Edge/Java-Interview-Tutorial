# 基于分隔符解码器分析
![](https://img-blog.csdnimg.cn/img_convert/6e5ccd6e4dbc0b76acd7378fa123e880.png)
- 构造器
传入一系列分隔符,通过解码器将二进制流分成完整数据包
![](https://img-blog.csdnimg.cn/img_convert/e3ceaee097260be3683f426f146bb814.png)
- decode 方法
![](https://img-blog.csdnimg.cn/img_convert/1a4ad5b71c24cb4e10dcaccbbbd7bb68.png)
## 5.1 分析解码步骤
### 5.1.1 行处理器
- 行处理器决断
![](https://img-blog.csdnimg.cn/img_convert/3330270eecb311430f7b841c0079fd92.png)
- 定义位置
![](https://img-blog.csdnimg.cn/img_convert/617a33968693a495162ff707f2b1f44a.png)
- 初始化位置
![](https://img-blog.csdnimg.cn/img_convert/48d683d3100f6939b5666a8714611f8b.png)
- 判断分隔符
![](https://img-blog.csdnimg.cn/img_convert/b8a0d73e4ad235cc9a8efa4aa243302b.png)
### 5.1.2  找到最小分隔符
![](https://img-blog.csdnimg.cn/img_convert/96adc0f7cfe6716b30e042debcb9b506.png)
![](https://img-blog.csdnimg.cn/img_convert/1dc639cacbe97e55a080645ce552d9ff.png)
遍历所有分隔符,计算以每一个分隔符分割的数据包的长度
### 5.1.3  解码
####  5.1.3.1 找到分隔符
![](https://img-blog.csdnimg.cn/img_convert/62b8f4ca63f29eb8049a82ce4dd78246.png)
非空,说明已经找到分隔符
和之前一样,在此先判断当前是否处于丢弃模式
![](https://img-blog.csdnimg.cn/img_convert/dd9ea0167823fa360c2c186a53d85278.png)
#### 非丢弃模式
显然第一次时为 false, 因此非丢弃模式
![](https://img-blog.csdnimg.cn/img_convert/47af8a52d821575330e24163df12cc03.png)
当前数据包大于允许解析最大数据长度时,直接将该段数据包连同最小分隔符跳过(丢弃)
![](https://img-blog.csdnimg.cn/img_convert/8d0315dc80d0b91161008e1f17272768.png)
没有超过的就是正常合理逻辑的数据包的长度,判断解析出的数据包是否包含分隔符
![](https://img-blog.csdnimg.cn/img_convert/395ddb574bf9dd70d827ae9a55939434.png)
#### 丢弃模式
![](https://img-blog.csdnimg.cn/img_convert/2e505b53bea91753069d28142572278f.png)
![](https://img-blog.csdnimg.cn/img_convert/65e7742a4ef5c967a4da97019221d49f.png)
####  5.1.3.2  未找到分隔符
![](https://img-blog.csdnimg.cn/img_convert/c4be606f970608fff619669d3b414be8.png)
![](https://img-blog.csdnimg.cn/img_convert/3e5e0a18cef41c66c7d80759ffa3e6f9.png)
#####  5.1.3.2.1 非丢弃模式
![](https://img-blog.csdnimg.cn/img_convert/1b5c194ecfbefdfe21bffafa4b7c0947.png)
当前可读字节长大于允许解析最大数据长度时,记录该丢弃字节数
#####  5.1.3.2.2 丢弃模式
![](https://img-blog.csdnimg.cn/img_convert/c8497c1855a67318b454f22a095f57d8.png)
# 基于长度域解码器参数分析
![](https://img-blog.csdnimg.cn/img_convert/1fff8345386306039b7fe459a270d3f0.png)
## 重要参数
![](https://img-blog.csdnimg.cn/img_convert/ca4458be6ba6039009ac390549243e51.png)
- maxFrameLength (包的最大长度)
防止太大导致内存溢出,超出包的最大长度 Netty 将会做一些特殊处理

- lengthFieldOffset (消息体长度)
长度域的偏移量lengthFieldOffset，0表示无偏移
`ByteBuf`的什么位置开始就是`length`字段
- lengthFieldLength 
长度域`length`字段的长度
- lengthAdjustment 
有些情况可能会把header也包含到length长度中，或者length字段后面还有一些不包括在length长度内的，可以通过lengthAdjustment调节
- initialBytesToStrip 
起始截掉的部分，如果传递给后面的Handler的数据不需要消息头了，可以通过这个设置
可以通过消息中的一个表示消息长度的字段值动态分割收到的ByteBuf

## 基于长度
![](https://img-blog.csdnimg.cn/img_convert/81113b8de217e46a9cc94c6bb773513b.png)
这类数据包协议比较常见，前几个字节表示数据包长度（不包括长度域），后面为具体数据
拆完后数据包是一个完整的带有长度域的数据包（之后即可传递到应用层解码器进行解码），
创建一个如下方式的`LengthFieldBasedFrameDecoder`即可实现这类协议
![](https://img-blog.csdnimg.cn/img_convert/f2ec3453b620495d12a17481321bdad3.png)
## 6.2 基于长度截断
若应用层解码器不需用到长度字段，那么我们希望 Netty 拆包后，如此
![](https://img-blog.csdnimg.cn/img_convert/b22dc926ce613ef43c006197ba8a62ce.png)
长度域被截掉，我们只需指定另一个参数 `initialBytesToStrip` 即可实现
表 Netty 拿到一个完整数据包后向业务解码器传递之前，应该跳过多少字节
![](https://img-blog.csdnimg.cn/img_convert/d6613c45a64861fc1a4d6ba121f3932b.png)
`initialBytesToStrip` 为4，表获取一个完整数据包后，忽略前面4个字节，应用解码器拿到的就是`不带长度域`的数据包
## 6.3 基于偏移长度
![](https://img-blog.csdnimg.cn/img_convert/ba8c20aa51bcc2781a9c6edbb171ab04.png)
此方式二进制协议更为普遍，前几个固定字节表示协议头，通常包含一些`magicNumber`，`protocol version` 之类的`meta`信息，紧跟着后面的是一个长度域，表示包体有多少字节的数据
只需要基于第一种情况，调整第二个参数既可以实现
![](https://img-blog.csdnimg.cn/img_convert/7eb96f4b2cd343df5d36431f2b4f6fe7.png)
`lengthFieldOffset `为4，表示跳过4个字节才是长度域。

## 6.4 基于可调整长度的拆包
有的二进制协议会设计成如下方式
![](https://img-blog.csdnimg.cn/20201224210348849.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
长度域在前，`header`在后
- 长度域在数据包最前面表示无偏移，`lengthFieldOffset = 0`
- 长度域的长度为3，即`lengthFieldLength = 3`
- 长度域表示的包体的长度略过了header，这里有另外一个参数` lengthAdjustment`，包体长度调整的大小，长度域的数值表示的长度加上这个修正值表示的就是带header的包，这里是 `12+2`，header和包体一共占14字节
## 6.5 基于偏移可调整长度的截断
二进制协议带有两个header
![](https://img-blog.csdnimg.cn/img_convert/f354d53692b1d3b916dbfe94523981a6.png)
拆完后，`HDR1` 丢弃，长度域丢弃，只剩下第二个`header`和有效包体
这种协议中，一般`HDR1`可以表示`magicNumber`，表示应用只接受以该`magicNumber`开头的二进制数据，RPC 里面用的较多
### 参数设置
- 长度域偏移为1，即` lengthFieldOffset`为1
- 长度域长度为2，即 `lengthFieldLength`为2
- 长度域表示的包体的长度略过`HDR2`，但拆包时`HDR2`也被 Netty 当作包体的一部分来拆，`HDR2`的长度为1，即 `lengthAdjustment` 为1
- 拆完后，截掉前面三个字节，即`initialBytesToStrip` 为 3
![](https://img-blog.csdnimg.cn/img_convert/f5e4e16dc7d37d9224d70fa4c2294703.png)
## 6.6 基于偏移可调整变异长度的截断
前面所有的长度域表示的都是不带`header`的包体的长度
如果让长度域表示的含义包含整个数据包的长度，如下
![](https://img-blog.csdnimg.cn/img_convert/e2af40fe7eab722bfe934be738098b39.png)
长度域字段值为16， 其字段长度为2，`HDR1`的长度为1，`HDR2`的长度为1，包体的长度为12，`1+1+2+12=16`
### 参数设置
除长度域表示的含义和上一种情况不一样外，其他都相同，因为 Netty 不了解业务情况，需告诉 Netty ，长度域后再跟多少字节就可形成一个完整数据包，这里显然是13字节，长度域为16，因此减掉3才是真是的拆包所需要的长度，`lengthAdjustment`为-3

若你的协议基于长度，即可考虑不用字节来实现，而是直接拿来用，或者继承他，简单修改即可

# 7 基于长度域解码器分析
## 7.1 构造方法
![](https://img-blog.csdnimg.cn/img_convert/ea5b6159c7dc0e3d71281982085b8b66.png)
```java
public LengthFieldBasedFrameDecoder(ByteOrder byteOrder, int maxFrameLength, int lengthFieldOffset, int lengthFieldLength, int lengthAdjustment, int initialBytesToStrip, boolean failFast) {
    // 省略参数校验
    this.byteOrder = byteOrder;
    this.maxFrameLength = maxFrameLength;
    this.lengthFieldOffset = lengthFieldOffset;
    this.lengthFieldLength = lengthFieldLength;
    this.lengthAdjustment = lengthAdjustment;
    lengthFieldEndOffset = lengthFieldOffset + lengthFieldLength;
    this.initialBytesToStrip = initialBytesToStrip;
    this.failFast = failFast;
}
```
把传参数保存在 field即可
- byteOrder 
字节流表示的数据是大端还是小端，用于长度域的读取
- lengthFieldEndOffset
紧跟长度域字段后面的第一个字节的在整个数据包中的偏移量
- failFast
    - 为true 表读取到长度域，TA的值的超过`maxFrameLength`，就抛 `TooLongFrameException`
    - 为`false` 表只有当真正读取完长度域的值表示的字节之后，才抛 `TooLongFrameException`，默认设为`true`，建议不要修改，否则可能会造成内存溢出
## 7.2 实现拆包抽象
具体的拆包协议只需要实现
```
void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) 
```
`in` 表目前为止还未拆的数据，拆完之后的包添加到 `out`这个list中即可实现包向下传递

- 第一层实现
![](https://img-blog.csdnimg.cn/img_convert/f2aa0c5b96d6fdc21dcacd79f6d85cd0.png)

重载的`protected`方法`decode`实现真正的拆包,以下三步走

## 基于长度域解码器步骤
- 计算需要抽取的数据包长度
- 跳过字节逻辑处理
- 丢弃模式下的处理

### 1 计算需要抽取的数据包的长度
```java
    protected Object decode(ChannelHandlerContext ctx, ByteBuf in) throws Exception {
        // 拿到实际的未调整过的包长度
        long frameLength = getUnadjustedFrameLength(in, actualLengthFieldOffset, lengthFieldLength, byteOrder);

        if (frameLength < lengthFieldEndOffset) {
            failOnFrameLengthLessThanLengthFieldEndOffset(in, frameLength, lengthFieldEndOffset);
        }

        if (frameLength > maxFrameLength) {
            exceededFrameLength(in, frameLength);
            return null;
        }
    }
```
- 拿到长度域的实际字节偏移 
![](https://img-blog.csdnimg.cn/img_convert/2e9e8fcb91c9eaf09928f8d781c478c0.png)
- 调整包的长度
![](https://img-blog.csdnimg.cn/img_convert/186b196b9b29a50b41c35100ccb98cfd.png)

- 如果当前可读字节还未达到长度长度域的偏移，那说明肯定是读不到长度域的，直接不读
![](https://img-blog.csdnimg.cn/img_convert/f52e76daa06d59ecce315e343ada171b.png)

上面有个`getUnadjustedFrameLength`，若你的长度域代表的值表达的含义不是基本的int,short等基本类型，可重写该方法
![](https://img-blog.csdnimg.cn/img_convert/f1fc04a1951e938ec40577970a1d9e38.png)
比如，有的奇葩的长度域里面虽然是4个字节，比如 0x1234，但是TA的含义是10进制，即长度就是十进制的1234，那么覆盖这个函数即可实现奇葩长度域拆包
2. 长度校验
- 整个数据包的长度还没有长度域长，直接抛异常
![](https://img-blog.csdnimg.cn/img_convert/c5822ed8e9a32e9fed36a891a20a20ca.png)
![](https://img-blog.csdnimg.cn/img_convert/ec3099e75ad2824f773d2c17c5c22cfc.png)
- 数据包长度超出最大包长度，进入丢弃模式
![](https://img-blog.csdnimg.cn/img_convert/475ee382f04ddbf5d6d897393b4beacb.png)
    - 当前可读字节已达到`frameLength`，直接跳过`frameLength`个字节，丢弃之后，后面有可能就是一个合法的数据包 
    - 当前可读字节未达到`frameLength`，说明后面未读到的字节也需丢弃，进入丢弃模式，先把当前累积的字节全部丢弃

`bytesToDiscard` 表还需丢弃多少字节
![](https://img-blog.csdnimg.cn/img_convert/fe6763b703f5210fedf3c4b43b65bdfe.png)
- 最后，调用`failIfNecessary`判断是否需要抛出异常
    - 不需要再丢弃后面的未读字节(`bytesToDiscard == 0`)，重置丢弃状态
      - 如果没有设置快速失败(`!failFast`)，或者设置了快速失败并且是第一次检测到大包错误(`firstDetectionOfTooLongFrame`)，抛出异常，让handler处理
      - 如果设置了快速失败，并且是第一次检测到打包错误，抛出异常，让handler去处理
![](https://img-blog.csdnimg.cn/img_convert/76973ccd9056c11efbd795aff23936f6.png)

前面我们可以知道`failFast`默认为`true`，而这里`firstDetectionOfTooLongFrame`为`true`，所以，第一次检测到大包肯定会抛出异常
![](https://img-blog.csdnimg.cn/img_convert/c63869cb940ffb20aa9becc926736cd5.png)
### 3 丢弃模式的处理
`LengthFieldBasedFrameDecoder.decoder `方法入口处还有一段代码
![](https://img-blog.csdnimg.cn/img_convert/0c28d0869edb0ad13500175279776839.png)
- 若当前处在丢弃模式，先计算需要丢弃多少字节，取当前还需可丢弃字节和可读字节的最小值，丢弃后，进入 `failIfNecessary`，对照着这个函数看，默认情况下是不会继续抛出异常，而如果设置了 failFast为false，那么等丢弃完之后，才会抛出异常
![](https://img-blog.csdnimg.cn/img_convert/80b495521eaa298645ed92973fbb5646.png)
### 2 跳过指定字节长度的逻辑处理
在丢弃模式的处理及长度校验都通过后
- 先验证当前是否已读到足够的字节，若读到了，在下一步抽取一个完整的数据包之前，需根据`initialBytesToStrip`的设置来跳过某些字节，当然，跳过的字节不能大于数据包的长度，否则抛 `CorruptedFrameException` 异常
![](https://img-blog.csdnimg.cn/img_convert/2967bc1c855f984eac29e9a292859749.png)
### 抽取frame
- 拿到当前累积数据的读指针，然后拿到待抽取数据包的实际长度进行抽取，抽取之后，移动读指针
![](https://img-blog.csdnimg.cn/img_convert/ca65bf1fb69e0a607c2cbe6d6da8c9a1.png)
- 抽取的过程即调用了一下 `ByteBuf` 的`retainedSlice` API，该API无内存copy的开销
![](https://img-blog.csdnimg.cn/img_convert/8fc0e5d3bd3d3e8bb36406cd6ecebf3f.png)
从真正抽取数据包来看看，传入的参数为 int 型，所以自定义协议中，如果你的长度域是8字节，那么前4字节基本没用
## 小结
- 如果你使用了Netty，并且二进制协议基于长度，考虑使用`LengthFieldBasedFrameDecoder`吧，通过调整各种参数，一定会满足你
- `LengthFieldBasedFrameDecoder`的拆包包括合法参数校验，异常包处理，以及最后调用 ByteBuf 的retainedSlice来实现无内存copy的拆包
# 8 解码器总结
## 8.1 ByteToMessageDecoder 解码步骤
- 累加字节流
- 调用子类的decode方法进行解析
- 将解析到的ByteBuf向下传播

## 8.2 基于长度解码器步骤
- 计算需要抽取的数据包长度
- 跳过字节逻辑处理
- 丟弃模式下的处理
## 8.3 两个问题
- 解码器抽象的解码过程
- netty里面有哪些拆箱即用的解码器
