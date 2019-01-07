# 1 定义

一种数据类型，只包含自定义的特定数据，是一组有共同特性的数据的集合。

创建需要enum关键字，如：

```java
public enum Color{  
    RED, GREEN, BLUE, BLACK, PINK, WHITE;  
}
```

enum的语法看似与类不同，但它实际上就是一个类。


![](https://upload-images.jianshu.io/upload_images/4685968-228b52f5fa93a9ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

把上面的编译成 Gender.class, 然后用 ` javap -c Gender `反编译

![](https://upload-images.jianshu.io/upload_images/4685968-9852d077a2de2d35.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可得到
- Gender 是 final 的
- Gender 继承自 java.lang.Enum 类
- 声明了字段对应的两个 static final Gender 的实例
- 实现了 values() 和  valueOf(String) 静态方法
- static{} 对所有成员进行初始化

结合字节码，还原 Gender 的普通类形式

```java
public final class Gender extends java.lang.Enum {

  public static final Gender Male;
  public static final Gender Female;

  private static final Gender[] $VALUES;
 
  static {
    Male = new Gender("Male", 0);
    Female = new Gender("Female", 1);
 
    $VALUES = new Gender[] {Male, Female};
  }


 
  public static Gender[] values() {
    return $VALUE.clone();
  }
 
  public static Gender valueOf(String name) {
    return Enum.valueOf(Gender.class, name);
  }
}
```
创建的枚举类型默认是java.lang.enum<枚举类型名>（抽象类）的子类

每个枚举项的类型都为public static final 。

上面的那个类是无法编译的，因为编译器限制了我们显式的继承自 java.Lang.Enum 类, 报错 "The type Gender may not subclass Enum explicitly", 虽然 java.Lang.Enum 声明的是

![](https://upload-images.jianshu.io/upload_images/4685968-2450866103cae77c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这样看来枚举类其实用了多例模式，枚举类的实例是有范围限制的
它同样像我们的传统常量类，只是它的元素是有限的枚举类本身的实例
它继承自 java.lang.Enum, 所以可以直接调用 java.lang.Enum 的方法，如 name(), original() 等
name 就是常量名称
![](https://upload-images.jianshu.io/upload_images/4685968-383713783bf352b9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
original 与 C 的枚举一样的编号
![](https://upload-images.jianshu.io/upload_images/4685968-00bf5c602976042e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
因为Java的单继承机制，emum不能再用extends继承其他的类。
![](http://upload-images.jianshu.io/upload_images/4685968-90bea20f4849fbbe?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240) 
可以在枚举类中自定义构造方法，但必须是  private 或  package protected, 因为枚举本质上是不允许在外面用 new Gender() 方式来构造实例的(Cannot instantiate the type Gender)

结合枚举实现接口以及自定义方法，可以写出下面那样的代码
![](https://upload-images.jianshu.io/upload_images/4685968-a8dab432a6c35ed1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
方法可以定义成所有实例公有，也可以让个别元素独有

需要特别注明一下，上面在 Male {} 声明一个 print() 方法后实际产生一个 Gender 的匿名子类，编译后的 Gender$1，反编译它
![](https://upload-images.jianshu.io/upload_images/4685968-27dfd6ac22ad7f6e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
所以在 emum Gender 那个枚举中的成员  Male 相当于是
```
public static final Male = new Gender$1("Male", 0); //而不是 new Gender("Male", 0)
```
上面` 4: Invokespecial #1` 要调用到下面的` Gender(java.lang.String, int, Gender$1) `方法

若要研究完整的 Male 元素的初始化过程就得 javap -c Gender 看 Gender.java 产生的所有字节码，在此列出片断
![](https://upload-images.jianshu.io/upload_images/4685968-b19cc56ada851c37.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在 static{} 中大致看下 Male 的初始过程：加载 Gender$1, 并调用它的 Gender$1(java.lang.String, int) 构造函数生成一个 Gender$1 实例赋给 Male 属性



既然enum是一个类，那么它就可以像一般的类一样拥有自己的属性与方法。但Java要求必须先定义enum实例。

否则会编译错误。
```java
public enum Color {  
        RED("红色", 1), GREEN("绿色", 2), BLANK("白色", 3), YELLO("黄色", 4);  
        // 成员变量  
        private String name;  
        private int index;  
  
        // 构造方法  
        private Color(String name, int index) {  
            this.name = name;  
            this.index = index;  
        }  
  
        // 普通方法  
        public static String getName(int index) {  
            for (Color c : Color.values()) {  
                if (c.getIndex() == index) {  
                    return c.name;  
                }  
            }  
            return null;  
        }  
  
        // get set 方法  
        public String getName() {  
            return name;  
        }  
  
        public void setName(String name) {  
            this.name = name;  
        }  
  
        public int getIndex() {  
            return index;  
        }  
  
        public void setIndex(int index) {  
            this.index = index;  
        }  
    }
```
枚举实例的创建过程：枚举类型符合通用模式 Class Enum<E extends Enum<E>>，而 E 表示枚举类型的名称。枚举类型的每一个值都将映射到 protected Enum(String name, int ordinal) 构造函数中，在这里，每个值的名称都被转换成一个字符串，并且序数设置表示了此设置被创建的顺序。
```java
public enum Color{  
    RED, GREEN, BLUE, BLACK, PINK, WHITE;  
}
```
相当于调用了六次Enum<Color>构造方法

Enum<Color>("RED", 0);

Enum<Color>("GREEN", 1);

Enum<Color>("BLUE", 2);

Enum<Color>("BLACK", 3);

Enum<Color>("PINK",4);

Enum<Color>("WHITE", 5);

**枚举类型的常用方法：**

int compareTo(E o)  比较此枚举与指定对象的顺序。

Class<E> getDeclaringClass()  返回与此枚举常量的枚举类型相对应的 Class 对象。

String name()   返回此枚举常量的名称，在其枚举声明中对其进行声明。

int ordinal()  返回枚举常量的序数（它在枚举声明中的位置，其中初始常量序数为零

String toString()    返回枚举常量的名称，它包含在声明中。

static <T extends Enum<T>> T valueOf(Class<T> enumType, String name)         返回带指定名称的指定枚举类型的枚举常量。

二、常用用法
用法一：常量

在JDK1.5 之前，我们定义常量都是： public static fianl.... 。现在好了，有了枚举，可以把相关的常量分组到一个枚举类型里，而且枚举提供了比常量更多的方法。

用法二：switch

JDK1.6之前的switch语句只支持int,char,enum类型，使用枚举，能让我们的代码可读性更强。

```java
enum Color{  
    RED, GREEN, BLUE, BLACK, PINK, WHITE;  
}  
public class TestEnum {  
    public void changeColor(){  
        Color color = Color.RED;  
        System.out.println("原色：" + color);  
        switch(color){  
        case RED:  
            color = Color.GREEN;  
            System.out.println("变色：" + color);  
            break;  
        case GREEN:  
            color = Color.BLUE;  
            System.out.println("变色：" + color);  
            break;  
        case BLUE:  
            color = Color.BLACK;  
            System.out.println("变色：" + color);  
            break;  
        case BLACK:  
            color = Color.PINK;  
            System.out.println("变色：" + color);  
            break;  
        case PINK:  
            color = Color.WHITE;  
            System.out.println("变色：" + color);  
            break;  
        case WHITE:  
            color = Color.RED;  
            System.out.println("变色：" + color);  
            break;  
        }  
    }  
    public static void main(String[] args){  
        TestEnum testEnum = new TestEnum();  
        testEnum.changeColor();  
    }  
}
```
用法三：实现接口 
```java
public interface Behaviour {  
        void print();  
  
        String getInfo();  
    }  
  
    public enum Color implements Behaviour {  
        RED("红色", 1), GREEN("绿色", 2), BLANK("白色", 3), YELLO("黄色", 4);  
        // 成员变量  
        private String name;  
        private int index;  
  
        // 构造方法  
        private Color(String name, int index) {  
            this.name = name;  
            this.index = index;  
        }  
  
        // 接口方法  
  
        @Override  
        public String getInfo() {  
            return this.name;  
        }  
  
        // 接口方法  
        @Override  
        public void print() {  
            System.out.println(this.index + ":" + this.name);  
        }  
    }
```
用法四：枚举集合的应用

java.util.EnumSet和java.util.EnumMap是两个枚举集合。EnumSet保证集合中的元素不重复;EnumMap中的 key是enum类型，而value则可以是任意类型。关于这个两个集合的使用就不在这里赘述，可以参考JDK文档 
```java
public class Test {  
    public static void main(String[] args) {  
        // EnumSet的使用  
        EnumSet<EnumTest> weekSet = EnumSet.allOf(EnumTest.class);  
        for (EnumTest day : weekSet) {  
            System.out.println(day);  
        }  
   
        // EnumMap的使用  
        EnumMap<EnumTest, String> weekMap = new EnumMap(EnumTest.class);  
        weekMap.put(EnumTest.MON, "星期一");  
        weekMap.put(EnumTest.TUE, "星期二");  
        // ... ...  
        for (Iterator<Entry<EnumTest, String>> iter = weekMap.entrySet().iterator(); iter.hasNext();) {  
            Entry<EnumTest, String> entry = iter.next();  
            System.out.println(entry.getKey().name() + ":" + entry.getValue());  
        }  
    }  
}
```
**三、综合实例**
### **最简单的使用**
最简单的枚举类
```
public enum Weekday {
    SUN,MON,TUS,WED,THU,FRI,SAT
}
```
如何使用它呢？
先来看看它有哪些方法：
![](http://upload-images.jianshu.io/upload_images/4685968-35a9dd148edc6e33.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这是Weekday可以调用的方法和参数。发现它有两个方法：values()和valueOf()。还有我们刚刚定义的七个变量
![](http://upload-images.jianshu.io/upload_images/4685968-fa00c9920429758d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这些事枚举变量的方法。我们接下来会演示几个比较重要的
![](http://upload-images.jianshu.io/upload_images/4685968-5d50a66ebb8e91fb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


这段代码，我们演示了几个常用的方法和功能：

1.  Weekday.valueOf() 方法：

    > 它的作用是传来一个字符串，然后将它转变为对应的枚举变量。前提是你传的字符串和定义枚举变量的字符串一样，区分大小写。如果你传了一个不存在的字符串，那么会抛出异常。

2.  Weekday.values()方法。

    > 这个方法会返回包括所有枚举变量的数组。在该例中，返回的就是包含了七个星期的Weekday[]。可以方便的用来做循环。

3.  枚举变量的toString()方法。

    > 该方法直接返回枚举定义枚举变量的字符串，比如MON就返回【”MON”】。

4.  枚举变量的.ordinal()方法。

    > 默认情况下，枚举类会给所有的枚举变量一个默认的次序，该次序从0开始，类似于数组的下标。而.ordinal()方法就是获取这个次序（或者说下标）

5.  枚举变量的compareTo()方法。

    > 该方法用来比较两个枚举变量的”大小”，实际上比较的是两个枚举变量的次序，返回两个次序相减后的结果，如果为负数，就证明变量1”小于”变量2 （变量1.compareTo(变量2)，返回【变量1.ordinal() - 变量2.ordinal()】）
![](http://upload-images.jianshu.io/upload_images/4685968-923692b42baa2349.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
    > 这是compareTo的源码，会先判断是不是同一个枚举类的变量，然后再返回差值。

6.  枚举类的name()方法。

    > 它和toString()方法的返回值一样，事实上，这两个方法本来就是一样的： 
![](http://upload-images.jianshu.io/upload_images/4685968-d181d6c426276721.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-fe515ac7983e6ab2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
    > 这两个方法的默认实现是一样的，唯一的区别是，你可以重写toString方法。name变量就是枚举变量的字符串形式。

还有一些其他的方法我就暂时不介绍了，感兴趣的话可以自己去看看文档或者源码，都挺简单的。

> **要点：**
> 
> *   使用的是enum关键字而不是class。   
> *   多个枚举变量直接用逗号隔开。  
> *   枚举变量最好大写，多个单词之间使用”_”隔开（比如：INT_SUM）。 
> *   定义完所有的变量后，以分号结束，如果只有枚举变量，而没有自定义变量，分号可以省略（例如上面的代码就忽略了分号）。 
> *   在其他类中使用enum变量的时候，只需要【类名.变量名】就可以了，和使用静态变量一样。

但是这种简单的使用显然不能体现出枚举的强大，我们来学习一下复杂的使用：
### **枚举的高级使用方法**

就像我们前面的案例一样，你需要让每一个星期几对应到一个整数，比如星期天对应0。上面讲到了，枚举类在定义的时候会自动为每个变量添加一个顺序，从0开始。

假如你希望0代表星期天，1代表周一。。。并且你在定义枚举类的时候，顺序也是这个顺序，那你可以不用定义新的变量，就像这样：

```
public enum Weekday {
    SUN,MON,TUS,WED,THU,FRI,SAT
}
```

这个时候，星期天对应的ordinal值就是0，周一对应的就是1，满足你的要求。但是，如果你这么写，那就有问题了：

```
public enum Weekday {
    MON,TUS,WED,THU,FRI,SAT,SUN
}
```

我吧SUN放到了最后，但是我还是希0代表SUN，1代表MON怎么办呢？默认的ordinal是指望不上了，因为它只会傻傻的给第一个变量0，给第二个1。。。

所以，我们需要自己定义变量！

看代码：

![](http://upload-images.jianshu.io/upload_images/4685968-fdf98a1ea141a011.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们对上面的代码做了一些改变：

首先，我们在每个枚举变量的后面加上了一个括号，里面是我们希望它代表的数字。

然后，我们定义了一个int变量，然后通过构造函数初始化这个变量。

你应该也清楚了，括号里的数字，其实就是我们定义的那个int变量。这句叫做自定义变量。

> 请注意：这里有三点需要注意：
> 
> 1.  一定要把枚举变量的定义放在第一行，并且以分号结尾。 
>     
>     
> 2.  构造函数必须私有化。事实上，private是多余的，你完全没有必要写，因为它默认并强制是private，如果你要写，也只能写private，写public是不能通过编译的。 
>     
>     
> 3.  自定义变量与默认的ordinal属性并不冲突，ordinal还是按照它的规则给每个枚举变量按顺序赋值。

好了，你很聪明，你已经掌握了上面的知识，你想，既然能自定义一个变量，能不能自定义两个呢？

当然可以：

![](http://upload-images.jianshu.io/upload_images/4685968-cee750c1c0d7901b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

你可以定义任何你想要的变量。学完了这些，大概枚举类你也应该掌握了，但是，还有没有其他用法呢?

### **枚举类中的抽象类**

如果我在枚举类中定义一个抽象方法会怎么样？

> 你要知道，枚举类不能继承其他类，也不能被其他类继承。至于为什么，我们后面会说到。

你应该知道，有抽象方法的类必然是抽象类，抽象类就需要子类继承它然后实现它的抽象方法，但是呢，枚举类不能被继承。。你是不是有点乱？

我们先来看代码：
![](http://upload-images.jianshu.io/upload_images/4685968-32d0eed617cdeaca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

你好像懂了点什么。但是你好像又不太懂。为什么一个变量的后边可以带一个代码块并且实现抽象方法呢？

别着急，带着这个疑问，我们来看一下枚举类的实现原理。

## **枚举类的实现原理**

从最简单的看起：
![](http://upload-images.jianshu.io/upload_images/4685968-00c7d0f4978c2ad8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
还是这段熟悉的代码，我们编译一下它，再反编译一下看看它到底是什么样子的：

![](http://upload-images.jianshu.io/upload_images/4685968-f8e73f4ed6998e8b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


你是不是觉得很熟悉？反编译出来的代码和我们用静态变量自己写的类出奇的相似！

而且，你看到了熟悉的values()方法和valueOf()方法。

仔细看，这个类继承了java.lang.Enum类！所以说，枚举类不能再继承其他类了，因为默认已经继承了Enum类。

并且，这个类是final的！所以它不能被继承！

回到我们刚才的那个疑问：
![](http://upload-images.jianshu.io/upload_images/4685968-807cffe33ade9e46.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
为什么会有这么神奇的代码？现在你差不多懂了。因为RED本身就是一个TrafficLamp对象的引用。实际上，在初始化这个枚举类的时候，你可以理解为执行的是`TrafficLamp RED = new TrafficLamp（30）` ，但是因为TrafficLamp里面有抽象方法，还记得匿名内部类么？

我们可以这样来创建一个TrafficLamp引用：

![](http://upload-images.jianshu.io/upload_images/4685968-264162c898ce02b3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


而在枚举类中，我们只需要像上面那样写【`RED(30){}`】就可以了，因为java会自动的去帮我们完成这一系列操作

## **枚举类的其他用法**
![ switch语句](http://upload-images.jianshu.io/upload_images/4685968-8cbb5f4a39c40739.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
虽然枚举类不能继承其他类，但是还是可以实现接口的
![接口定义](http://upload-images.jianshu.io/upload_images/4685968-265c6343caa65f2d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![实现接口](http://upload-images.jianshu.io/upload_images/4685968-31928ca30e595778.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![使用接口组织枚举](http://upload-images.jianshu.io/upload_images/4685968-7925fc791b404899.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### **使用枚举创建单例模式**

***使用枚举创建的单例模式：***

```
public enum EasySingleton{
    INSTANCE;
}
```

代码就这么简单，你可以使用EasySingleton.INSTANCE调用它，比起你在单例中调用getInstance()方法容易多了。

我们来看看正常情况下是怎样创建单例模式的：

***用双检索实现单例：***

下面的代码是用双检索实现单例模式的例子，在这里getInstance()方法检查了两次来判断INSTANCE是否为null，这就是为什么叫双检索的原因，记住双检索在java5之前是有问题的，但是java5在内存模型中有了volatile变量之后就没问题了。

```
public class DoubleCheckedLockingSingleton{
     private volatile DoubleCheckedLockingSingleton INSTANCE;

     private DoubleCheckedLockingSingleton(){}

     public DoubleCheckedLockingSingleton getInstance(){
         if(INSTANCE == null){
            synchronized(DoubleCheckedLockingSingleton.class){
                //double checking Singleton instance
                if(INSTANCE == null){
                    INSTANCE = new DoubleCheckedLockingSingleton();
                }
            }
         }
         return INSTANCE;
     }
}
```

你可以访问DoubleCheckedLockingSingleTon.getInstance()来获得实例对象。

***用静态工厂方法实现单例：***

```
public class Singleton{
    private static final Singleton INSTANCE = new Singleton();

    private Singleton(){}

    public static Singleton getSingleton(){
        return INSTANCE;
    }
}
```

你可以调用Singleton.getInstance()方法来获得实例对象。

* * *

上面的两种方式就是懒汉式和恶汉式单利的创建，但是无论哪一种，都不如枚举来的方便。而且传统的单例模式的另外一个问题是一旦你实现了serializable接口，他们就不再是单例的了。但是枚举类的父类【Enum类】实现了Serializable接口，也就是说，所有的枚举类都是可以实现序列化的，这也是一个优点。

## **总结**
> *   可以创建一个enum类，把它看做一个普通的类。除了它不能继承其他类了。(java是单继承，它已经继承了Enum),可以添加其他方法，覆盖它本身的方法 
>     
>     
> *   switch()参数可以使用enum 
>     
>     
> *   values()方法是编译器插入到enum定义中的static方法，所以，当你将enum实例向上转型为父类Enum是，values()就不可访问了。解决办法：在Class中有一个getEnumConstants()方法，所以即便Enum接口中没有values()方法，我们仍然可以通过Class对象取得所有的enum实例 
>     
>     
> *   无法从enum继承子类，如果需要扩展enum中的元素，在一个接口的内部，创建实现该接口的枚举，以此将元素进行分组。达到将枚举元素进行分组。 
>     
>     
> *   enum允许程序员为eunm实例编写方法。所以可以为每个enum实例赋予各自不同的行为。
