# 为什么会存在二次编解码

- 把解决半包粘包问题的常用三种解码器叫一次解码器ByteToMessageDecoder![](https://img-blog.csdnimg.cn/20201221180652228.png)

即从`io.netty.buffer. ByteBuf` ( 原始数据流)  =》 `io.netty.buffer .ByteBuf` ( 用户数据)

但是在实际业务项目中，除可选的的压缩解压缩，还需一层解码，因为一次解码的结果是字节，需要和项目中所使用的对象做转化，方便使用，这层解码器可以称为“二次解码器”，相应的对应编码器是为了将Java对象转化成字节流方便存储或传输。
于是有了二次解码器：**MessageToMessageDecoder<l>**
`io.netty.buffer.ByteBuf` ( 用户数据) =》 Java Object

### 为何不一步到位?
合并1次解码(解决粘包、半包)和2次解码( 解决可操作问题) ?
可以，但不建议：
- 没有分层， 不够清晰
- 耦合性高，不容易置换方案
比如现在使用 protobuf，以后想用 json，就很麻烦咯。

# 常用的二次编解码方案
- Java序列化
- Marshaling
- XML
- JSON
- MessagePack
- Protobuf

## 编解码方案选型
- 空间
编码后占用空间，需要比较不同的数据大小情况。
- 时间
编解码速度，需要比较不同的数据大小情况。
- 可读性
- 多语言(Java 、C、Python 等)的支持

其中以谷歌的Protobuf最为知名。
### Protobuf
- 灵活的、高效的用于序列化数据的协议
- 相比较XML和JSON格式，Protobuf更小、更快、更便捷
- Protobuf是跨语言的，并且自带了一个编译器(protoc) ，只需要用它进行编译，可以自动生成Java、python、 C++等代码，不需要再写其他代码。