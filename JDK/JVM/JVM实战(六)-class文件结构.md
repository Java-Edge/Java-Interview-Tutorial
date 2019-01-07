# 1 JVM的“平台无关性”

Java具有平台无关性，即任何操作系统都能运行Java代码。
之所以能实现这一点，是因为Java运行在虚拟机之上,不同的操作系统都拥有各自的Java虚拟机,因此Java能实现"一次编写,处处运行"。

而JVM不仅具有平台无关性，还具有语言无关性：
- 平台无关性是指不同操作系统都有各自的JVM
- 语言无关性是指Java虚拟机能运行除Java以外的代码!

但JVM对能运行的语言是有严格要求的。首先来了解下Java代码的运行过程：
Java源代码首先需要使用Javac编译器编译成class文件，然后启动JVM执行class文件，从而程序开始运行。
即JVM只认识class文件，它并不管何种语言生成了class文件，只要class文件符合JVM的规范就能运行。

因此目前已经有Scala、JRuby、Jython等语言能够在JVM上运行。它们有各自的语法规则，不过它们的编译器都能将各自的源码编译成符合JVM规范的class文件，从而能够借助JVM运行它们。
![](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTYwNTI5MTQxNTU4NDg3?x-oss-process=image/format,png)

Class文件是JVM的输入, Java虚拟机规范中定义了Class文件的结构。Class文件是JVM实现平台无关、技术无关的基础。

# 2 纵观Class文件结构
class文件包含Java程序执行的字节码，数据严格按照格式紧凑排列在class文件中的二进制流，中间无任何分隔符。
文件开头有一个0xcafebabe(16进制)特殊的一个标志。
- 下图展示为16进制

![](https://img-blog.csdnimg.cn/20190822021614774.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)



![](https://img-blog.csdnimg.cn/20190822021315238.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
class文件是一组以8字节为单位的二进制字节流，对于占用空间大于8字节的数据项,按照高位在前的方式分割成多个8字节进行存储。
它的内容具有严格的规范，文件中没有任何分隔符，全是连续的0/1。

class文件中的所有内容被分为两种类型：
- 无符号数 
基本的数据类型,以u1、u2、u4、u8,分别代表1字节、2字节、4字节、8字节的无符号数
- 表 
class文件中所有数据(即无符号数)要么单独存在,要么由多个无符号数组成二维表.即class文件中的数据要么是单个值,要么是二维表.通常以_info 结尾

## 文件格式
 javap工具生成非正式的"虚拟机汇编语言” ,格式如下:

```java
<index> <opcode> [<operand1> [<operand2> ...]][<comment>]
```

- `<index>`是指令操作码在数组中的下标,该数组以字节形式来存储当前方法的Java虚拟机代码;也可以是相对于方法起始处的字节偏移量
- `<opcode>`是指令的助记码
- `< operand>`是操作数
- `<comment>`是行尾的注释



## 实践
- Demo1.java
![](https://img-blog.csdnimg.cn/20190823232245291.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Demo1.txt![](https://img-blog.csdnimg.cn/20190823232156855.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190823232641596.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
版本号规则: JDK5,6,7,8
分别对应49,50,51,52
## 2.1 魔数(Magic Number)
class文件的头4个字节称为魔数,唯一作用是确定这个文件是否为一个能被JVM接受的Class文件.
作用就相当于文件后缀名,只不过后缀名容易被修改,不安全.
是用16进制表示的"CAFEBABE".
## 2.2 版本信息
紧接着魔数的4个字节是版本号.它表示本class中使用的是哪个版本的JDK.
在高版本的JVM上能够运行低版本的class文件,但在低版本的JVM上无法运行高版本的class文件.

## 2.3 常量池
### 2.3.1 什么是常量池?
紧接着版本号之后的就是常量池.
常量池中存放两种类型的常量:

- 字面量 (Literal)
接近Java语言的常量概念,如:字符串文本、final常量值等.
- 符号引用 (Symbolic Reference)
属于编译原理方面,包括下面三类常量: 
	 - 类和接口的全限定名
	 - 字段的名称和描述符
	 - 方法的名称和描述符
	 
## 2.3.2 常量池的特点
- 长度不固定 
常量池的大小不固定,因此常量池开头放置一个u2类型的无符号数,代表当前常量池的容量.
**该值从1开始,若为5表示池中有4项常量,索引值1~5**
- 常量由二维表表示 
开头有个常量池容量计数值,接下来就全是一个个常量了,只不过常量都是由一张张二维表构成,除了记录常量的值以外,还记录当前常量的相关信息
- class文件的资源仓库
- 与本class中其它部分关联最多的数据类型
- 占用Class文件空间最大的部分之一 ,也是第一个出现的表类型项目

### 2.3.3  常量池中常量的类型
根据常量的数据类型不同,被细分为14种常量类型,都有各自的二维表示结构
每种常量类型的头1个字节都是tag,表示当前常量属于14种类型中的哪一个.
![这里写图片描述](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9waWMxLnpoaW1nLmNvbS92Mi0xY2E2NmU3NmFhMWEyMjYzNGUzYzQ2YjVmZDQ2M2FkY19yLnBuZw?x-oss-process=image/format,png)
以CONSTANT_Class_info常量为例，它的二维表示结构如下： 
**CONSTANT_Class_info表**

|类型|名称  |数量| 
|--|--|--|
| u1 |tag  |1|
| u2 |name_index  |1|

- tag 表示当前常量的类型(当前常量为CONSTANT_Class_info,因此tag的值应为7,表一个类或接口的全限定名); 
- name_index 表示这个类或接口全限定名的位置.它的值表示指向常量池的第几个常量.它会指向一个**CONSTANT_Utf8_info**类型的常量

|类型|名称  |数量| 
|--|--|--|
| u1 |tag  |1|
| u2 |length  |1|
| u1 |bytes  |length|

**CONSTANT_Utf8_info**表字符串常量
- tag 表当前常量的类型,这里是1 
- length 表该字符串的长度
- bytes为这个字符串的内容(采用缩略的UTF8编码)

**Java中定义的类、变量名字必须小于64K** 
类、接口、变量等名字都属于符号引用，它们都存储在常量池中
而不管哪种符号引用，它们的名字都由**CONSTANT_Utf8_info**类型的常量表示，这种类型的常量使用u2存储字符串的长度
由于2字节最多能表示65535个数，因此这些名字的最大长度最多只能是64K

**UTF-8编码 VS 缩略UTF-8编码** 
前者每个字符使用3个字节表示，而后者把128个ASCII码用1字节表示，某些字符用2字节表示，某些字符用3字节表示。 

- Demo1.txt中的常量池部分
![](https://img-blog.csdnimg.cn/20190823232901622.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 类信息包含的静态常量，编译之后就能确认
![](https://img-blog.csdnimg.cn/20190823233205779.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## JVM 指令
|  |  |
|--|--|
invokeinterface	|用以调用接口方法，在运行时搜索一个实现了这个接口方法的对象，找出适合的方法进行调用。（Invoke interface method）
invokevirtual	|指令用于调用对象的实例方法，根据对象的实际类型进行分派（Invoke instance method; dispatch based on class）
invokestatic	|用以调用类方法（Invoke a class (static) method ）
invokespecial	|指令用于调用一些需要特殊处理的实例方法，包括实例初始化方法、私有方法和父类方法。（Invoke instance method; special handling for superclass, private, and instance initialization method invocations ）

invokedynamic	JDK1.7新加入的一个虚拟机指令，相比于之前的四条指令，他们的分派逻辑都是固化在JVM内部，而invokedynamic则用于处理新的方法分派：它允许应用级别的代码来确定执行哪一个方法调用，只有在调用要执行的时候，才会进行这种判断,从而达到动态语言的支持。(Invoke dynamic method)


## 2.4 访问控制
在常量池结束之后是2字节的访问控制
表示这个class文件是类/接口、是否被public/abstract/final修饰等. 

由于这些标志都由是/否表示,因此可以用0/1表示. 
访问标志为2字节,可以表示16位标志,但JVM目前只定义了8种,未定义的直接写0. 
|标志名称	| 标志值 |含义
|--|--|--|
| ACC_INTERFACE |  |是一个接口,而不是一个类
ACC_MODULE |        |   声明的模块； 可能无法从其模块外部访问。 仅当ClassFile具有Module属性时才可以设置。
ACC_STATIC   |   0x0008 |声明为静态
![](https://img-blog.csdnimg.cn/20190824003331383.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- Demo1.txt中的构造方法
![](https://img-blog.csdnimg.cn/20190824001922551.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

Demo1这个示例中，我们并没有写构造函数。
由此可见，`没有定义构造函数时，会有隐式的无参构造函数`

## 2.5 类索引、父类索引、接口索引集合
表示当前class文件所表示类的名字、父类名字、接口们的名字.
它们按照顺序依次排列,类索引和父类索引各自使用一个u2类型的无符号常量,这个常量指向CONSTANT_Class_info类型的常量,该常量的bytes字段记录了本类、父类的全限定名. 
由于一个类的接口可能有好多个,因此需要用一个集合来表示接口索引,它在类索引和父类索引之后.这个集合头两个字节表示接口索引集合的长度,接下来就是接口的名字索引. 
## 2.6 字段表的集合
### 2.6.1 什么是字段表集合?
用于存储本类所涉及到的成员变量,包括实例变量和类变量,但不包括方法中的局部变量. 
每一个字段表只表示一个成员变量,本类中所有的成员变量构成了字段表集合.
### 2.6.2 字段表结构的定义
![这里写图片描述](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTcwNTEwMTc1NjM4NDM2?x-oss-process=image/format,png)

- access_flags 
字段的访问标志。在Java中，每个成员变量都有一系列的修饰符，和上述class文件的访问标志的作用一样，只不过成员变量的访问标志与类的访问标志稍有区别。
- name_index 
本字段名字的索引。指向一个CONSTANT_Class_info类型的常量，这里面存储了本字段的名字等信息。
- descriptor_index 
描述符。用于描述本字段在Java中的数据类型等信息(下面详细介绍)
- attributes_count 
属性表集合的长度。
- attributes 
属性表集合。到descriptor_index为止是字段表的固定信息，光有上述信息可能无法完整地描述一个字段，因此用属性表集合来存放额外的信息，比如一个字段的值。(下面会详细介绍)
### 2.6.3  什么是描述符?
成员变量(包括静态成员变量和实例变量) 和 方法都有各自的描述符。 
对于字段而言，描述符用于描述字段的数据类型； 
对于方法而言，描述符用于描述字段的数据类型、参数列表、返回值。

在描述符中，基本数据类型用大写字母表示，对象类型用“L对象类型的全限定名”表示，数组用“[数组类型的全限定名”表示。 
描述方法时，将参数根据上述规则放在()中，()右侧按照上述方法放置返回值。而且，参数之间无需任何符号。
### 2.6.4 字段表集合的注意点

- 一个class文件的字段表集合中不能出现从父类/接口继承而来字段；
- 一个class文件的字段表集合中可能会出现程序猿没有定义的字段 
如编译器会自动地在内部类的class文件的字段表集合中添加外部类对象的成员变量，供内部类访问外部类。
- Java中只要两个字段名字相同就无法通过编译。但在JVM规范中，允许两个字段的名字相同但描述符不同的情况，并且认为它们是两个不同的字段。


- Demo1.txt中的程序入口main方法
![](https://img-blog.csdnimg.cn/20190824002128156.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/2019082400225092.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70) 
## 2.7 方法表的集合
在class文件中，所有的方法以二维表的形式存储，每张表来表示一个函数，一个类中的所有方法构成方法表的集合。 
方法表的结构和字段表的结构一致，只不过访问标志和属性表集合的可选项有所不同。
![这里写图片描述](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTYwNjEwMTEzNzM0NTU5?x-oss-process=image/format,png)
方法表的属性表集合中有一张Code属性表，用于存储当前方法经编译器编译过后的字节码指令。

### **方法表集合的注意点**

- 如果本class没有重写父类的方法，那么本class文件的方法表集合中是不会出现父类/父接口的方法表；
- 本class的方法表集合可能出现程序猿没有定义的方法 
编译器在编译时会在class文件的方法表集合中加入类构造器和实例构造器。
- 重载一个方法需要有相同的简单名称和不同的特征签名。JVM的特征签名和Java的特征签名有所不同： 
 - Java特征签名：方法参数在常量池中的字段符号引用的集合
 - JVM特征签名：方法参数＋返回值
 
## 2.8 属性表的集合

![](https://img-blog.csdnimg.cn/20190824004202215.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 1![](https://img-blog.csdnimg.cn/20190824004232751.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 2
![](https://img-blog.csdnimg.cn/2019082400425144.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 程序完整运行分析
![](https://img-blog.csdnimg.cn/20190824004554877.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190824004639785.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190824004654676.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190824004709591.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190824004835459.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190824004727517.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190824004849121.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190824005033311.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/2019082400582822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190824005917921.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20190824005953346.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/2019082401001818.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)



![](https://img-blog.csdnimg.cn/2019082401003190.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)









![](https://img-blog.csdnimg.cn/20190824010045825.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20190824010233509.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 总结
我们将JVM运行的核心逻辑进行了详细剖析。

> JVM运行原理中更底层实现，针对不同的操作系统或者处理器，会有不同的实现。
这也是JAVA能够实现“`一处编写，处处运行`”的原因。
开发人员理解到这个层次，就足够掌握高深的多线程

参考
- 《码出高效》