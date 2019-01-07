- 源码
https://github.com/Wasabi1234/design-patterns
# 0 讲讲运算的核心——模型公式及其如何实现
## 0.1 业务需求：输入一个模型公式（加、减运算），然后输入模型中的参数，运算出结果
### 设计要求
● 公式可以运行时编辑，并且符合正常算术书写方式，例如a+b-c
● 高扩展性，未来增加指数、开方、极限、求导等运算符号时较少改动
● 效率可以不用考虑，晚间批量运算

需求不复杂，若仅仅对数字采用四则运算，每个程序员都可以写出来
但是增加了增加模型公式就复杂了

先解释一下为什么需要公式，而不采用直接计算的方法，例如有如下3个公式
● 业务种类1的公式：a+b+c-d
● 业务种类2的公式：a+b+e-d
● 业务种类3的公式：a-f
其中，a、b、c、d、e、f参数的值都可以取得，如果使用直接计算数值的方法需要为每个品种写一个算法，目前仅仅是3个业务种类，那上百个品种呢？凉透了吧！建立公式，然后通过公式运算才是王道

以实现加减法公式为例，说明如何解析一个固定语法逻辑
采用逐步分析方法，带领大家了解实现过程

想想公式中有什么？运算元素和运算符号
- 运算元素
指a、b、c等符号，需要具体赋值的对象，也叫做`终结符号`，为什么叫终结符号呢？
因为这些元素除了需要赋值外，不需要做任何处理，所有运算元素都对应一个具体的业务参数，这是语法中最小的单元逻辑，不可再分
- 运算符号
就是加减符号，需要我们编写算法进行处理，每个运算符号都要对应处理单元，否则公式无法运行，运算符号也叫做`非终结符号`

共同点是都要被解析，不同点是所有运算元素具有相同的功能，可以用一个类表示
而运算符号则是需要分别进行解释，加法需要加法解析器，减法需要减法解析器
![初步分析加减法类图](https://upload-images.jianshu.io/upload_images/4685968-20e02e6082b295f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这是一个很简单的类图
`VarExpression`用来解析运算元素，各个公式能运算元素的数量是不同的，但每个运算元素都对应一个`VarExpression`对象
`SybmolExpression`负责解析符号，由两个子类
- `AddExpression`（负责加法运算）
- `SubExpression`（负责减法运算）
解析器的开发工作已经完成了，但是需求还没有完全实现。我们还需要对解析器进行封装，
来实现

解析的工作完成了，我们还需要把安排运行的先后顺序（加减法不用考虑，但是乘除法呢？注意`扩展性`），并且还要返回结果，因此我们需要增加一个封装类来进行封装处理，由于我们只做运算，暂时还不与业务有关联，定义为`Calculator`类
![优化后加减法类图](https://upload-images.jianshu.io/upload_images/4685968-b1132df6ea4c1750.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


Calculator的作用是封装，根据迪米特法则，`Client`只与直接的朋友`Calculator`交流，与其他类没关系
![完整加减法类图](https://upload-images.jianshu.io/upload_images/4685968-563b1c27fb3a17c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 代码实现
- Expression抽象类
![](https://upload-images.jianshu.io/upload_images/4685968-6d9e07d2038340b8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 变量解析器
![](https://upload-images.jianshu.io/upload_images/4685968-78db7a734f7f7d50.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 抽象运算符号解析器
![](https://upload-images.jianshu.io/upload_images/4685968-0f33735f2cf8f3b0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
每个运算符号都只和自己左右两个数字有关系，但左右两个数字有可能也是一个解析的结果，无论何种类型，都是Expression的实现类，于是在对运算符解析的子类中增加了一个构造函数，传递左右两个表达式。
-  加法解析器
![](https://upload-images.jianshu.io/upload_images/4685968-350762ee245d3ff2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 减法解析器
![](https://upload-images.jianshu.io/upload_images/4685968-ac9f07e4aa2d2dcf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Calculator
我们还需要对解析器进行封装
![](https://upload-images.jianshu.io/upload_images/4685968-c719421db3da94db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
Calculator构造函数接收一个表达式，然后把表达式转化为char数组，并判断运算符号，如果是“+”则进行加法运算，把左边的数（left变量）和右边的数（right变量）加起来就可以了
那左边的数为什么是在栈中呢？例如这个公式：a+b-c，根据for循环，首先被压入栈中的应该是有a元素生成的VarExpression对象，然后判断到加号时，把a元素的对象VarExpression从栈中弹出，与右边的数组b进行相加，b又是怎么得来的呢？当前的数组游标下移一个单元格即可，同时为了防止该元素再次被遍历，则通过++i的方式跳过下一个遍历——于是一个加法的运行结束。减法也采用相同的运行原理。
- 客户模拟类
为了满足业务要求，我们设置了一个Client类来模拟用户情况，用户要求可以扩展，可以修改公式，那就通过接收键盘事件来处理
![](https://upload-images.jianshu.io/upload_images/4685968-9bf6148def8eb334.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其中，getExpStr是从键盘事件中获得的表达式，getValue方法是从键盘事件中获得表达式中的元素映射值
● 首先，要求输入公式。
● 其次，要求输入公式中的参数。
● 最后，运行出结果
![](https://upload-images.jianshu.io/upload_images/4685968-a53403fe275570e6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
我们是不是可以修改公式？当然可以，我们只要输入公式，然后输入相应的值就可以了，公式是在运行时定义的，而不是在运行前就制定好的
先公式，然后赋值，运算出结果

需求已经开发完毕，公式可以自由定义，只要符合规则（有变量有运算符合）就可以运算出结果；若需要扩展也非常容易，只要增加BaseSymbolExpression的子类就可以了，这就是解释器模式。
# 1 定义与类型
- 解释器模式
Given a language, define a representation for its grammar along with an interpreter that uses the representation to interpret sentences in the language.（给定一门语言，定义它的文法的一种表示，并定义一个解释器，该解释器使用该表示来解释语言中的句子。）
一种按照规定语法进行解析的方案，在现在项目中使用较少
![](https://upload-images.jianshu.io/upload_images/4685968-41b74e2346a80811.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![解释器模式通用类图](https://upload-images.jianshu.io/upload_images/4685968-fcd85a6a0b055752.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

● AbstractExpression——抽象解释器
具体的解释任务由各个实现类完成
具体的解释器分别由`TerminalExpression`和`Non-terminalExpression`完成

● TerminalExpression——终结符表达式
实现与文法中的元素相关联的解释操作，通常一个解释器模式中只有一个终结符表达式，但有多个实例，对应不同的终结符
具体到我们例子就是`VarExpression`类，表达式中的每个终结符都在栈中产生了一个VarExpression对象

● NonterminalExpression——非终结符表达式
文法中的每条规则对应于一个非终结表达式
具体到我们的例子就是加减法规则分别对应到`AddExpression`和`SubExpression`
非终结符表达式根据逻辑的复杂程度而增加，原则上每个文法规则都对应一个非终结符表达式

● Context——环境角色
具体到我们的例子中是采用`HashMap`代替
# 2 通用源码
解释器是一个比较少用的模式，以下为其通用源码，可以作为参考
- 抽象表达式通常只有一个方法
![](https://upload-images.jianshu.io/upload_images/4685968-a0e8b3afbd88683f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
抽象表达式是生成语法集合（也叫做语法树）的关键，每个语法集合完成指定语法解析任务，它是通过递归调用的方式，最终由最小的语法单元进行解析完成
- 终结符表达式
![](https://upload-images.jianshu.io/upload_images/4685968-9c990ddfa42780c9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
通常，终结符表达式比较简单，主要是处理场景元素和数据的转换
- 非终结符表达式
![](https://upload-images.jianshu.io/upload_images/4685968-7b2c6172af3b4f75.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
每个非终结符表达式都代表了一个文法规则，并且每个文法规则都只关心自己周边的文法规则的结果（注意是结果），因此这就产生了每个非终结符表达式调用自己周边的非终结符表达式，然后最终、最小的文法规则就是终结符表达式，终结符表达式的概念就是如此，不能够再参与比自己更小的文法运算了
- 客户类
通常Client是一个封装类，封装的结果就是传递进来一个规范语法文件，解析器分析后产生结果并返回，避免了调用者与语法解析器的耦合关系
![](https://upload-images.jianshu.io/upload_images/4685968-70c7679925681b40.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 3 适用场景
● 重复发生的问题可以使用解释器模式
例如，多个应用服务器，每天产生大量的日志，需要对日志文件进行分析处理，由于各个服务器的日志格式不同，但是数据要素是相同的，按照解释器的说法就是终结符表达式都是相同的，但是非终结符表达式就需要制定了。在这种情况下，可以通过程序来一劳永逸地解决该问题。

● 一个简单语法需要解释的场景
为什么是简单？看看非终结表达式，文法规则越多，复杂度越高，而且类间还要进行递归调用（看看我们例子中的栈）。想想看，多个类之间的调用你需要什么样的耐心和信心去排查问题。因此，解释器模式一般用来解析比较标准的字符集，例如SQL语法分析，不过该部分逐渐被专用工具所取代。

在某些特用的商业环境下也会采用解释器模式，我们刚刚的例子就是一个商业环境，而且现在模型运算的例子非常多，目前很多商业机构已经能够提供出大量的数据进行分析。
![](https://upload-images.jianshu.io/upload_images/4685968-a74b726ec34e9db7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
尽量不要在重要的模块中使用解释器模式，否则维护会是一个很大的问题。在项目中可以使用shell、JRuby、Groovy等脚本语言来代替解释器模式，弥补Java编译型语言的不足
# 4 优点
解释器是一个简单语法分析工具，它最显著的优点就是扩展性，修改语法规则只要修改相应的非终结符表达式就可以了，若扩展语法，则只要增加非终结符类就可以了
![](https://upload-images.jianshu.io/upload_images/4685968-a77a3dc29e75bba2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 5 缺点
● 解释器模式会引起类膨胀
每个语法都要产生一个非终结符表达式，语法规则比较复杂时，就可能产生大量的类文件，为维护带来了非常多的麻烦

● 解释器模式采用递归调用方法
每个非终结符表达式只关心与自己有关的表达式，每个表达式需要知道最终的结果，必须一层一层地剥茧，无论是面向过程的语言还是面向对象的语言，递归都是在必要条件下使用的，它导致调试非常复杂。想想看，如果要排查一个语法错误，我们是不是要一个断点一个断点地调试下去，直到最小的语法单元。

● 效率问题
解释器模式由于使用了大量的循环和递归，效率是一个不容忽视的问题，特别是一用于解析复杂、冗长的语法时，效率是难以忍受的。
![](https://upload-images.jianshu.io/upload_images/4685968-222dc1da41689cdf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 6 相关设计模式
![](https://upload-images.jianshu.io/upload_images/4685968-733e88e24ca3071d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
适配器模式不需要预先知道要适配的规则
而解释器模式则需要将规则写好,并根据规则进行解释
# 7 实际应用
## Java 正则对象
![](https://upload-images.jianshu.io/upload_images/4685968-9574c4c8c57e8666.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## Spring解析器
![](https://upload-images.jianshu.io/upload_images/4685968-0bdcd6e2007a9ab7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 8 最佳实践
解释器模式在实际的系统开发中使用得非常少，因为它会引起效率、性能以及维护等问题，一般在大中型的框架型项目能够找到它的身影，如一些数据分析工具、报表设计工具、科学计算工具等，若你确实遇到“一种特定类型的问题发生的频率足够高”的情况，准备使用解释器模式时，可以考虑一下Expression4J、MESP（Math Expression String Parser）、Jep等开源的解析工具包（这三个开源产品都可以通过百度、Google搜索到，请读者自行查询），功能都异常强大，而且非常容易使用，效率也还不错，实现大多数的数学运算完全没有问题，自己没有必要从头开始编写解释器。有人已经建立了一条康庄大道，何必再走自己的泥泞小路呢？
