#1 泛型与类型擦除
泛型是JDK 1.5的一项新增特性，它的本质是参数化类型(Parametersized Type) 的应用，也就是说所操作的数据类型被指定为一个参数。这种参数类型可以用在类，接口和方法的创建中, 分別称为泛型类、泛型接口和泛型方法。

在Java语言处于还没有出现泛型的版本时。只能通过Object 是所有类型的父类和类型强制转换两个特点的配合来实现类型泛化。例如，在哈希表的存取中,JDK 1.5之前使用HashMap的get() 方法，返回值就是个0bject。由于Java语言里面所有的类型都维承于java.lang.Object 所以Object转型成任何对象都是有可能的。但是也因为有无限的可能性。就只有程序员和运行期的虚拟机才知道这个Objet到底是个什么类型的对象。在编译期间，编译器无法检查这个Object的强制转型是否成功。如果仅仅依赖程序员去保障这项操作的正确性，许多ClassCastException的风险就会转嫁到程予运行期之中。

Java语言中的泛型则不一样，它只在程序源码中存在，在编译后的字节码文件中，就已经替换为原来的原生类型(Raw Type) ，并且在相应的地方插入了强制转型代码，因此，对于运行期的Java来说Araylist<int>Aralist<String>就是同一个类。所以泛型是Java语言的一颗语法糖Java称为类型擦除，基于这种方法实现的泛型称为伪泛型。

![泛型擦除前的例子](https://upload-images.jianshu.io/upload_images/4685968-2c93db4ccfaf1fc4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
把这段Java代码编译成Class文件，然后再用字节码反编译后，將会发现泛型都不见了，又变回了Java泛型出现之前的写法，泛型类型都变回了原类型.如
![](https://upload-images.jianshu.io/upload_images/4685968-73b7f4720749ecbb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
通过擦除來实现泛型丧失了一些泛型思想应有的优雅
![当泛型遇见重载1](https://upload-images.jianshu.io/upload_images/4685968-38a718d9584c5ed6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
不能被编译的，因为参数List<Integer>和List<String>编译之后都被擦除了。变成了一样的原生类型List<E>,擦除动作导致这两种方法的特征签名变得一模一样。初步看来，无法重载的原因已经找到了，但真的就如此吗? 只能说，泛型擦除成相同的原生类型只是无法重载的部分原因

![当泛型遇见置载2](https://upload-images.jianshu.io/upload_images/4685968-f6c1eeaed390cd9a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
由于Java泛型的引入,各种场景(虚拟机解析,反射等> 下的方法调用都可能对原有基础产生影响，如在泛型类中如何获取传入的参数化类型等。因此，JCP组织对虚拟机规范做出了相应的修改，引人了诺如Signature,LocalVariableTypeTable 等新的属性用于解决伴随泛型而来的参数类型的识别问题，Signature 是其中最重要的一项属性,它的作用就是存储一个方法在字节码层面的特征签名,这个属性中保存的参数类型并不是原生类型，而是包括了参数化类型的信息。修改后的虚拟机规范裂水所有能识别49.0以上版本的Class
文件的虚拟机都要能正确地识别Signature参数.

从Signature属性的出现我们还可以得出结论，所谓的擦除，仅仅是对方法的Code属性中的宇节码进行擦除，实际上元数据还是保留了泛型信息,这也是我们能通过反射取得参数化类型的根本依据。
![自动装箱: 拆箱与遍历循环](https://upload-images.jianshu.io/upload_images/4685968-2866b12ca5564476.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![自动装箱: 拆箱与遍历循环编译后](https://upload-images.jianshu.io/upload_images/4685968-0433b37de73e7230.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
遍历循环则把代码还原成了迭代器的实现，这也是为何遍历循环需要被遍历的类实现Iterable接口的原因。最后再看看变长参数，它在调用的时候变成了一个数组类型的参数,在变长参数出现之前，程序员就是使用数组来完成类似功能的。
![](https://upload-images.jianshu.io/upload_images/4685968-7fe6b94f0458dfda.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



