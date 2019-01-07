# 1 泛型与类型擦除
泛型，JDK 1.5新特性，本质是参数化类型(Parametersized Type) 的应用，即所操作的数据类型被指定为一个参数。这种参数类型可用在：
- 类
- 接口
- 方法

的创建中, 分别称为：
- 泛型类
- 泛型接口
- 泛型方法

在Java还没有泛型的版本时。只能通过：
1. Object 是所有类型的父类
2. 类型强制转换

两个特性协作实现类型泛化。例如，在哈希表的存取中，JDK 1.5之前使用HashMap的get() 方法，返回值就是个Object。由于Java语言里面所有的类型都维承于**java.lang.Object**，所以Object转型成任何对象都有可能。但也因为有无限的可能性，就只有程序员和运行期的虚拟机才知道这个Objet到底是个什么类型的对象。
编译期间，编译器无法检查该Object的强制转型是否成功。若仅仅依赖程序员去保障正确性，许多ClassCastException的风险就会延迟到程序运行期。

Java语言中的泛型则不一样，它只在程序源码中存在，在编译后的字节码文件中，就已经替换为原来的原生类型(Raw Type) ，并在相应地方插入强制转换代码。
因此，对运行期的Java来说`Araylist<int>`、`Aralist<String>`是同一个类。所以泛型是Java语言的一颗语法糖Java称为类型擦除，基于这种方法实现的泛型称为伪泛型。
- 泛型擦除前的例子
![](https://img-blog.csdnimg.cn/img_convert/d347cb20042fbdffec7af32a5cef72b4.png)
把这段Java代码编译成Class文件，然后再用字节码反编译后，將会发现泛型都不见了，又变回了Java泛型出现之前的写法，泛型类型都变回了原类型。如：
![](https://img-blog.csdnimg.cn/img_convert/9f9d591480dae3af68c7017b6a39419d.png)
通过擦除实现泛型，丧失了一些泛型思想应有的优雅
- 当泛型遇见重载1
![](https://img-blog.csdnimg.cn/img_convert/c1980fb6370cdc0e40467bc8ed51fbf3.png)
不能被编译的，因为参数`List<Integer>`和`List<String>`编译之后都被擦除了。变成了一样的原生类型`List<E>`,擦除动作导致这两种方法的特征签名变得一模一样。初步看来，无法重载的原因已经找到了，但真的就如此吗? 只能说，泛型擦除成相同的原生类型只是无法重载的部分原因
- 当泛型遇见置载2
![](https://img-blog.csdnimg.cn/img_convert/7122295ac6c3431e2b732e6668008da6.png)
由于Java泛型的引入，各种场景（虚拟机解析、反射等）下的方法调用都可能对原有基础产生影响，如在泛型类中如何获取传入的参数化类型等。因此，JCP组织对虚拟机规范做出了相应的修改，引入了诸如**Signature、LocalVariableTypeTable** 等新的属性用于解决伴随泛型而来的参数类型的识别问题，Signature 是其中最重要的一项属性,它的作用就是存储一个方法在字节码层面的特征签名,这个属性中保存的参数类型并不是原生类型，而是包括了参数化类型的信息。修改后的虚拟机规范要求所有能识别49.0以上版本的Class文件的虚拟机都要能正确地识别Signature参数。

从Signature属性的出现我们还可以得出结论，所谓的擦除，仅仅是对方法的Code属性中的字节码进行擦除，实际上元数据还是保留了泛型信息,这也是我们能通过反射取得参数化类型的根本依据。
- 自动装箱: 拆箱与遍历循环
![](https://img-blog.csdnimg.cn/img_convert/ac763ea9a774a914879ccd27cbdd0498.png)
- 自动装箱: 拆箱与遍历循环编译后![](https://img-blog.csdnimg.cn/img_convert/51a73df3f1ed22fef870234c2ae178a6.png)
遍历循环则把代码还原成了迭代器的实现，这也是为何遍历循环需要被遍历的类实现Iterable接口的原因。最后再看看变长参数，它在调用的时候变成了一个数组类型的参数,在变长参数出现之前，程序员就是使用数组来完成类似功能的。
![](https://img-blog.csdnimg.cn/img_convert/8909a05f4b0a56f95cca330f36147b52.png)