# 0 主要内容
![](https://upload-images.jianshu.io/upload_images/4685968-98d2f60376422b87.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#1 JVM字节码指令与 javap
![](https://upload-images.jianshu.io/upload_images/4685968-b7c70f5b346ef29d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 样例代码
![](https://upload-images.jianshu.io/upload_images/4685968-562849e9307f4f8a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 将结果重定向到一个 txt 文件中，便于分析
![](https://upload-images.jianshu.io/upload_images/4685968-864542f0bc938769.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## Field Descriptors
字段描述符表示类，实例或局部变量的类型。它是由语法生成的一系列字符：
```
FieldDescriptor:
    FieldType

FieldType:
    BaseType
    ObjectType
    ArrayType	

BaseType:
    B
    C
    D
    F
    I
    J
    S
    Z

ObjectType:
    L ClassName ;

ArrayType:
    [ ComponentType

ComponentType:
    FieldType
```
`L ClassName；`： 引用类型
`[`  ： 数组类型
都是ASCII字符

ClassName表示以内部形式编码的二进制类或接口名称

字段描述符的解释类型如表
![](https://upload-images.jianshu.io/upload_images/4685968-16239c4760aaa62e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
表示数组类型的字段描述符仅在表示具有255或更少维度的类型时才有效

int类型的实例变量的字段描述符就是I.

Object类型的实例变量的字段描述符是`Ljava / lang / Object`
请注意，使用的是类Object的二进制名称的内部形式。 

一个多维double数组实例变量的字段描述符，double d [] [] []，是[[[D
## Method Descriptors
方法描述符表示方法采用的参数及其返回的值：
```
MethodDescriptor:
    ( ParameterDescriptor* ) ReturnDescriptor
```
参数描述符表示传递给方法的参数：
```
ParameterDescriptor:
    FieldType
```
返回描述符表示从方法返回的值的类型。它是由语法生成的一系列字符：
```
ReturnDescriptor:
    FieldType
    VoidDescriptor

VoidDescriptor:
    V
```
字符V表示该方法没有返回值（其返回类型为void）

方法描述符仅在表示总长度为255或更小的方法参数时才有效，其中该长度包括在实例或接口方法调用的情况下对此的贡献
总长度是通过对各个参数的贡献求和来计算的，其中long或double类型的参数对长度贡献两个单位，而任何其他类型的参数贡献一个单位

### 方法的方法描述符
比如方法
```
Object m(int i, double d, Thread t) {..}
```
是`（IDLjava / lang / Thread;）Ljava / lang / Object;`
注意，使用了Thread和Object的二进制名称的内部形式 

无论m是类方法还是实例方法,对于m的方法描述符是相同的
虽然传递了一个实例方法，但是除了预期的参数之外，对当前类实例的引用不会反映在方法描述符中
对此的引用由调用实例方法的Java虚拟机的方法调用指令隐式传递
对此的引用不会传递给类方法。
```
Classfile /Volumes/doc/IDEAProjects/monitor_tuning/target/classes/com/sss/monitortuning/cp8/Test1.class
  Last modified 2019-1-4; size 629 bytes
  MD5 checksum 91438ed9eb3506def6a5580d6b448ebb
  Compiled from "Test1.java"
public class com.sss.monitortuning.cp8.Test1
  minor version: 0
  major version: 52  // JDK版本号
  flags: ACC_PUBLIC, ACC_SUPER
// 常量池
Constant pool:
   #1 = Methodref          #5.#24         // java/lang/Object."<init>":()V
   #2 = Fieldref           #25.#26        // java/lang/System.out:Ljava/io/PrintStream;
   #3 = Methodref          #27.#28        // java/io/PrintStream.println:(I)V
   #4 = Class              #29            // com/sss/monitortuning/cp8/Test1 即类名
   #5 = Class              #30            // java/lang/Object
   #6 = Utf8               <init>
   #7 = Utf8               ()V
   #8 = Utf8               Code
   #9 = Utf8               LineNumberTable
  #10 = Utf8               LocalVariableTable
  #11 = Utf8               this
  #12 = Utf8               Lcom/sss/monitortuning/cp8/Test1;
  #13 = Utf8               main
  #14 = Utf8               (Ljava/lang/String;)V
  #15 = Utf8               args
  #16 = Utf8               Ljava/lang/String;
  #17 = Utf8               a
  #18 = Utf8               I
  #19 = Utf8               b
  #20 = Utf8               c
  #21 = Utf8               MethodParameters
  #22 = Utf8               SourceFile
  #23 = Utf8               Test1.java
  #24 = NameAndType        #6:#7          // "<init>":()V
  #25 = Class              #31            // java/lang/System
  #26 = NameAndType        #32:#33        // out:Ljava/io/PrintStream;
  #27 = Class              #34            // java/io/PrintStream
  #28 = NameAndType        #35:#36        // println:(I)V
  #29 = Utf8               com/sss/monitortuning/cp8/Test1
  #30 = Utf8               java/lang/Object
  #31 = Utf8               java/lang/System
  #32 = Utf8               out
  #33 = Utf8               Ljava/io/PrintStream;
  #34 = Utf8               java/io/PrintStream
  #35 = Utf8               println
  #36 = Utf8               (I)V
{
  public com.sss.monitortuning.cp8.Test1();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 7: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  this   Lcom/sss/monitortuning/cp8/Test1;

  public static void main(java.lang.String);
    descriptor: (Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=4, args_size=1
         0: iconst_2
         1: istore_1
         2: iconst_3
         3: istore_2
         4: iload_1
         5: iload_2
         6: iadd
         7: istore_3
         8: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
        11: iload_3
        12: invokevirtual #3                  // Method java/io/PrintStream.println:(I)V
        15: return
      LineNumberTable:
        line 9: 0
        line 10: 2
        line 11: 4
        line 12: 8
        line 13: 15
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      16     0  args   Ljava/lang/String;
            2      14     1     a   I
            4      12     2     b   I
            8       8     3     c   I
    MethodParameters:
      Name                           Flags
      args
}
SourceFile: "Test1.java"

 /***
     public static void main(java.lang.String);
     descriptor: (Ljava/lang/String;)V
     flags: ACC_PUBLIC, ACC_STATIC
     Code:
     # 操作数栈的深度2
     # 本地变量表最大长度（slot为单位），64位的是2，其他是1，索引从0开始，如果是非static方法索引0代表this，后面是入参，后面是本地变量
     # 1个参数，实例方法多一个this参数
     stack=2, locals=4, args_size=1
     0: iconst_2  #常量2压栈
     1: istore_1  #出栈保存到本地变量1里面
     2: iconst_3  #常量3压栈
     3: istore_2  #出栈保存到本地变量2里面
     4: iload_1    #局部变量1压栈
     5: iload_2    #局部变量2压栈
     6: iadd        # 栈顶两个元素相加，计算结果压栈
     7: istore_3  # 出栈保存到局部变量3里面
     8: getstatic     #16                 // Field java/lang/System.out:Ljava/io/PrintStream;
     11: iload_3
     12: invokevirtual #22                 // Method java/io/PrintStream.println:(I)V
     15: return
     LineNumberTable:
     // 代码行数 ： 常量池
     line 5: 0
     line 6: 2
     line 7: 4
     line 8: 8
     line 9: 15
     LocalVariableTable:
     Start  Length  Slot  Name   Signature
     0      16     0  args   Ljava/lang/String;
     2      14     1     a   I
     4      12     2     b   I
     8       8     3     c   I
     **/
```
# 基于栈的架构
![](https://upload-images.jianshu.io/upload_images/4685968-b642515f808bfef0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
把常量2压栈,存到本地变量1中
![](https://upload-images.jianshu.io/upload_images/4685968-2ad691ed43d31bc7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

把常量3压栈,存到本地变量2中
![](https://upload-images.jianshu.io/upload_images/4685968-7be399e19ea7592c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
将本地变量1数据压栈
将本地变量2数据压栈
![](https://upload-images.jianshu.io/upload_images/4685968-d1b964019cf5a0a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

栈顶两元素相加,存到本地变量3
![](https://upload-images.jianshu.io/upload_images/4685968-4298c2d9b2e6293c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-72c447370ff99ef7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-962f378779b48b9c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 3 i++  与 ++i
![](https://upload-images.jianshu.io/upload_images/4685968-c744b124347c1aef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
对于 for 循环,无任何区别!
# 4 字符串拼接 + 
