#  1 当反射遇见重载
重载**level**方法，入参分别是**int**和**Integer**。
![](https://img-blog.csdnimg.cn/2021063020523870.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)若不使用反射，选用哪个重载方法很清晰，比如：
- 传入**666**就走int参数重载
- 传入`Integer.valueOf(“666”)`走Integer重载

那反射调用方法也是根据入参类型确定使用哪个重载方法吗？
使用`getDeclaredMethod`获取 `grade`方法，然后传入`Integer.valueOf(“36”)`
![](https://img-blog.csdnimg.cn/20210630205520594.png)
结果是：
![](https://img-blog.csdnimg.cn/20210630205642767.png)
因为反射进行方法调用是通过
## 方法签名
来确定方法。本例的`getDeclaredMethod`传入的参数类型`Integer.TYPE`其实代表`int`。
![](https://img-blog.csdnimg.cn/2021063020590337.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
所以不管传包装类型还是基本类型，最终都是调用int入参重载方法。

将`Integer.TYPE`改为`Integer.class`，则实际执行的参数类型就是Integer了。且无论传包装类型还是基本类型，最终都调用Integer入参重载方法。

综上，反射调用方法，是以反射获取方法时传入的方法名和参数类型来确定调用的方法。

# 2 泛型的类型擦除
泛型允许SE使用类型参数替代精确类型，实例化时再指明具体类型。利于代码复用，将一套代码应用到多种数据类型。

泛型的类型检测，可以在编译时检查很多泛型编码错误。但由于历史兼容性而妥协的泛型类型擦除方案，在运行时还有很多坑。

## 案例
现在期望在类的字段内容变动时记录日志，于是SE想到定义一个泛型父类，并在父类中定义一个统一的日志记录方法，子类可继承该方法。上线后总有日志重复记录。

- 父类
![](https://img-blog.csdnimg.cn/20210701102521658.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 子类1
![](https://img-blog.csdnimg.cn/20210701102727240.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 通过反射调用子类方法：
![](https://img-blog.csdnimg.cn/20210701103212354.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

虽Base.value正确设置为了JavaEdge，但父类setValue调用了两次，计数器显示2
![](https://img-blog.csdnimg.cn/20210701103441331.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

两次调用Base.setValue，是因为getMethods找到了两个`setValue`：
![](https://img-blog.csdnimg.cn/20210701104024581.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20210701103932953.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
### 子类重写父类方法失败原因
- 子类未指定String泛型参数，父类的泛型方法`setValue(T value)`泛型擦除后是`setValue(Object value)`，于是子类入参String的`setValue`被当作新方法
- 子类的`setValue`未加`@Override`注解，编译器未能检测到重写失败
![](https://img-blog.csdnimg.cn/20210701104847761.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

有的同学会认为是因为反射API使用错误导致而非重写失败：
- `getMethods`
得到**当前类和父类**的所有`public`方法
- `getDeclaredMethods`
获得**当前类**所有的public、protected、package和private方法

于是用`getDeclaredMethods`替换`getMethods`：
![](https://img-blog.csdnimg.cn/20210701110017589.png)![](https://img-blog.csdnimg.cn/20210701110341844.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
虽然这样做可以规避重复记录日志，但未解决子类重写父类方法失败的问题
- 使用Sub1时还是会发现有俩个`setValue`
![](https://img-blog.csdnimg.cn/20210701111541648.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

于是，终于明白还得重新实现**Sub2**，继承Base时将**String**作为泛型T类型，并使用 **@Override** 注解 **setValue**
![](https://img-blog.csdnimg.cn/20210701131719235.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- 但还是出现重复日志
![](https://img-blog.csdnimg.cn/20210701131952964.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
Sub2的`setValue`竟然调用了两次，难道是JDK反射有Bug！`getDeclaredMethods`查找到的方法肯定来自`Sub2`；而且Sub2看起来也就一个setValue，怎么会重复？

调试发现，Child2类其实有俩`setValue`：入参分别是String、Object。
![](https://img-blog.csdnimg.cn/20210701133219777.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
这就是因为**泛型类型擦除**。

## 反射下的泛型擦除“天坑”
Java泛型类型在编译后被擦除为**Object**。子类虽指定父类泛型T类型是**String**，但编译后T会被擦除成为Object，所以父类`setValue`入参是**Object**，value也是**Object**。
若**Sub2.setValue**想重写父类，那入参也须为**Object**。所以，编译器会为我们生成一个桥接方法。
Sub2类的class字节码：
```bash
➜  genericandinheritance git:(master) ✗ javap -c Sub2.class
Compiled from "GenericAndInheritanceApplication.java"
class com.javaedge.oop.genericandinheritance.Sub2 extends com.javaedge.oop.genericandinheritance.Base<java.lang.String> {
  com.javaedge.oop.genericandinheritance.Sub2();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method com/javaedge/oop/genericandinheritance/Base."<init>":()V
       4: return

  public void setValue(java.lang.String);
    Code:
       0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
       3: ldc           #3                  // String call Sub2.setValue
       5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
       8: aload_0
       9: aload_1
      10: invokespecial #5                  // Method com/javaedge/oop/genericandinheritance/Base.setValue:(Ljava/lang/Object;)V
      13: return

  public void setValue(java.lang.Object);
    Code:
       0: aload_0
       1: aload_1
       2: checkcast     #6                  // class java/lang/String
       // 入参为Object的setValue在内部调用了入参为String的setValue方法
       5: invokevirtual #7                  // Method setValue:(Ljava/lang/String;)V
       8: return
}
```
若编译器未帮我们实现该桥接方法，则Sub2重写的是父类泛型类型擦除后、入参是Object的setValue。这两个方法的参数，一个String一个Object，显然不符Java重写。

入参为Object的桥接方法上标记了`public  synthetic bridge`：
- synthetic代表由编译器生成的不可见代码
- bridge代表这是泛型类型擦除后生成的桥接代码
![](https://img-blog.csdnimg.cn/20210701135257552.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 修正
知道了桥接方法的存在，现在就该知道如何修正代码了。
- 通过**getDeclaredMethods**获取所有方法后，还得加上非isBridge这个过滤条件：
![](https://img-blog.csdnimg.cn/20210701143227136.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- 结果
![](https://img-blog.csdnimg.cn/20210701143616524.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
> 参考
> - https://docs.oracle.com/javase/8/docs/technotes/guides/reflection/index.html
> - https://docs.oracle.com/javase/tutorial/reflect/index.html
> - https://docs.oracle.com/javase/8/docs/technotes/guides/language/annotations.html
> - https://docs.oracle.com/javase/tutorial/java/annotations/index.html
> - https://docs.oracle.com/javase/8/docs/technotes/guides/language/generics.html
> - https://docs.oracle.com/javase/tutorial/java/generics/index.html