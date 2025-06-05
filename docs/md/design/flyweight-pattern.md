# 享元模式（Flyweight Pattern）

## 1 简介

结构型模式。“享元”，被共享的单元，即通过复用对象而节省内存，注意前提是享元对象是不可变对象。

用于减少创建对象的数量，以减少内存占用和提高性能。尝试复用现有同类对象，若未找到匹配对象，则创建新对象。

### 意图

运用共享技术有效地支持大量细粒度的对象。

### 主要解决

在有大量对象时，有可能会造成内存溢出，我们把其中共同的部分抽象出来，如果有相同的业务请求，直接返回在内存中已有的对象，避免重新创建。

## 2 优点

大大减少对象的创建，降低系统的内存，使效率提高。

## 3 缺点

提高系统复杂度，需分离出外部状态、内部状态，且外部状态具有固有化的性质，不应随内部状态变化而变化，否则会造成系统混乱。

## 4 适用场景

- 系统中有大量对象

- 这些对象消耗大量内存

- 这些对象的状态大部分可外部化

- 这些对象可以按照内蕴状态分为很多组，当把外蕴对象从对象中剔除出来时，每一组对象都可以用一个对象来代替

- 系统不依赖于这些对象身份，这些对象是不可分辨的

- 系统有大量相似对象

- 需要缓冲池的场景

这些类必须有一个工厂对象加以控制。

### 如何解决

用唯一标识码判断，如果在内存中有，则返回这个唯一标识码所标识的对象。

### 关键代码

用 HashMap 存储这些对象。

### 应用实例

- String，若有则返回，无则创建一个字符串保存在字符串缓存池
- 数据库的数据池

## 5 原理

当一个系统中存在大量重复对象，若这些重复对象是【不可变】对象，就能用该模式将对象设计成享元，在内存中只保留一份实例供引用。减少了内存中对象数量，最终节省内存。

不仅是相同对象，相似对象也能提取对象中的相同部分（字段）设计成享元。

### “不可变对象”

一旦构造器初始化完成后，其状态（对象的成员变量或属性）就不会再被修改。所以，不可变对象不能暴露任何set()等修改内部状态的方法。之所以要求享元是不可变对象，是因为它会被多处代码共享使用，避免一处代码修改享元，影响到其他使用它的代码。

### 实现

主要通过工厂模式，在工厂类中，通过一个Map或List缓存已创建好的享元对象，以复用。

## 6 案例

### 6.1 象棋

一个游戏厅中有成千上万个“房间”，每个房间对应一个棋局。棋局要保存每个棋子的数据，比如：棋子类型（将、相、士、炮等）、棋子颜色（红方、黑方）、棋子在棋局中的位置。利用这些数据，我们就能显示一个完整的棋盘给玩家。具体的代码如下所示:

- ChessPiece类表示棋子
- ChessBoard类表示一个棋局，里面保存了象棋中30个棋子的信息

```java
/**
 * 棋子
 *
 * @author JavaEdge
 * @date 2022/5/28
 */
@AllArgsConstructor
@Getter
@Setter
public class ChessPiece {

    private int id;

    private String text;

    private Color color;

    private int positionX;

    private int positionY;

    public static enum Color {
        RED, BLACK
    }
}
```

```java
/**
 * 棋局
 */
public class ChessBoard {
    private Map<Integer, ChessPiece> chessPieces = new HashMap<>();

    public ChessBoard() {
        init();
    }

    private void init() {
        chessPieces.put(1, new ChessPiece(1, "車", ChessPiece.Color.BLACK, 0, 0));
        chessPieces.put(2, new ChessPiece(2, "馬", ChessPiece.Color.BLACK, 0, 1));
        //...省略摆放其他棋子的代码...
    }

    public void move(int chessPieceId, int toPositionX, int toPositionY) {
        //...省略...
    }
}
```

为记录每个房间当前的棋局情况，要给每个房间都创建一个ChessBoard棋局对象。因为游戏大厅中有成千上万房间，保存这么多棋局对象就会消耗大量内存。咋节省内存？

就得用上享元模式。在内存中有大量相似对象。这些相似对象的id、text、color都一样，仅positionX、positionY不同。将棋子的id、text、color属性拆出设计成独立类，并作为享元供多个棋盘复用。棋盘只需记录每个棋子的位置信息：

```java
/**
 * 享元类
 */
public class ChessPieceUnit {

    private int id;

    private String text;

    private Color color;

    public static enum Color {
        RED, BLACK
    }
}
```

```java
public class ChessPieceUnitFactory {

    private static final Map<Integer, ChessPieceUnit> PIECES = new HashMap<>();

    static {
        PIECES.put(1, new ChessPieceUnit(1, "車", ChessPieceUnit.Color.BLACK));
        PIECES.put(2, new ChessPieceUnit(2, "馬", ChessPieceUnit.Color.BLACK));
        //...省略摆放其他棋子的代码...
    }

    public static ChessPieceUnit getChessPiece(int chessPieceId) {
        return PIECES.get(chessPieceId);
    }
}
```

```java
@AllArgsConstructor
@Data
public class NewChessPiece {

    private ChessPieceUnit chessPieceUnit;

    private int positionX;

    private int positionY;
}
```

```java
/**
 * 棋局
 */
public class NewChessBoard {

    private Map<Integer, NewChessPiece> chessPieces = new HashMap<>();

    public NewChessBoard() {
        init();
    }

    private void init() {
        chessPieces.put(1, new NewChessPiece(
                ChessPieceUnitFactory.getChessPiece(1), 0, 0));
        chessPieces.put(1, new NewChessPiece(
                ChessPieceUnitFactory.getChessPiece(2), 1, 0));
        //...摆放其他棋子
    }

    public void move(int chessPieceId, int toPositionX, int toPositionY) {
        //...
    }
}
```

利用工厂类缓存ChessPieceUnit信息（id、text、color）。通过工厂类获取到的ChessPieceUnit就是享元。所有ChessBoard对象共享这30个ChessPieceUnit对象（因为象棋中只有30个棋子）。在使用享元模式之前，记录1万个棋局，我们要创建30万（30*1万）个棋子的ChessPieceUnit对象。利用享元模式，只需创建30个享元对象供所有棋局共享使用即可，大大节省内存。

主要通过工厂模式，在工厂类中，通过Map缓存已创建过的享元对象，达到复用。

###  6.2 文本编辑器

若文本编辑器只实现文字编辑功能，不包含图片、表格编辑。简化后的文本编辑器，要在内存表示一个文本文件，只需记录文字、格式两部分信息。格式又包括字体、大小、颜色。

一般按文本类型（标题、正文……）设置文字格式，标题是一种格式，正文是另一种。但理论上可给文本文件中的每个文字都设置不同格式。为实现如此灵活格式设置，且代码实现又不复杂，把每个文字都当作一个独立对象，并在其中包含它的格式信息：

```java
/**
 * 文字
 */
@AllArgsConstructor
@Data
public class Character {

    private char c;

    private Font font;

    private int size;

    private int colorRGB;
}
```

```java
public class Editor {

    private List<Character> chars = new ArrayList<>();

    public void appendCharacter(char c, Font font, int size, int colorRGB) {
        Character character = new Character(c, font, size, colorRGB);
        chars.add(character);
    }
}
```

文本编辑器中，每敲一个字，就调Editor#appendCharacter()，创建一个新Character对象，保存到chars数组。若一个文本文件中，有上万、十几万、几十万的文字，就得在内存存储大量Character对象，咋节省内存？

一个文本文件用到的字体格式不多，毕竟不可能有人把每个文字都置不同格式。所以，字体格式可设计成享元，让不同文字共享：

```java
public class CharacterStyle {
  
  private Font font;
  
  private int size;
  
  private int colorRGB;

  @Override
  public boolean equals(Object o) {
    CharacterStyle otherStyle = (CharacterStyle) o;
    return font.equals(otherStyle.font)
            && size == otherStyle.size
            && colorRGB == otherStyle.colorRGB;
  }
}

public class CharacterStyleFactory {
  private static final List<CharacterStyle> styles = new ArrayList<>();

  public static CharacterStyle getStyle(Font font, int size, int colorRGB) {
    CharacterStyle newStyle = new CharacterStyle(font, size, colorRGB);
    for (CharacterStyle style : styles) {
      if (style.equals(newStyle)) {
        return style;
      }
    }
    styles.add(newStyle);
    return newStyle;
  }
}

public class Character {
  
  private char c;
  
  private CharacterStyle style;
}

public class Editor {
  private List<Character> chars = new ArrayList<>();

  public void appendCharacter(char c, Font font, int size, int colorRGB) {
    Character character = new Character(c, CharacterStyleFactory.getStyle(font, size, colorRGB));
    chars.add(character);
  }
}
```

### 6.3 Shape

无论何时接收到请求，都会创建一个特定颜色的圆。

它将向 ShapeFactory 传递信息（red / green / blue/ black / white），以便获取它所需对象的颜色。

![](https://p.ipic.vip/jtnqze.png)

步骤 1：创建一个接口。

```java
public interface Shape {
   void draw();
}
```

步骤 2：创建实现接口的实体类。

```java
public class Circle implements Shape {
    private String color;
    private int x;
    private int y;
    private int radius;

    public Circle(String color) {
        this.color = color;
    }

    @Override
    public void draw() {
        System.out.println("Circle: Draw() [Color : " + color
                + ", x : " + x + ", y :" + y + ", radius :" + radius);
    }
}
```

步骤 3：创建一个工厂，生成基于给定信息的实体类的对象。

```java
public class ShapeFactory {
    private static final HashMap<String, Shape> circleMap = new HashMap<>();

    public static Shape getCircle(String color) {
        Circle circle = (Circle) circleMap.get(color);

        if (circle == null) {
            circle = new Circle(color);
            circleMap.put(color, circle);
            System.out.println("Creating circle of color : " + color);
        }
        return circle;
    }
}
```

步骤 4：使用该工厂，通过传递颜色信息来获取实体类的对象。

```java
public class FlyweightPatternDemo {
    private static final String colors[] =
            {"Red", "Green", "Blue", "White", "Black"};

    public static void main(String[] args) {

        for (int i = 0; i < 20; ++i) {
            Circle circle =
                    (Circle) ShapeFactory.getCircle(getRandomColor());
            circle.setX(getRandomX());
            circle.setY(getRandomY());
            circle.setRadius(100);
            circle.draw();
        }
    }

    private static String getRandomColor() {
        return colors[(int) (Math.random() * colors.length)];
    }

    private static int getRandomX() {
        return (int) (Math.random() * 100);
    }

    private static int getRandomY() {
        return (int) (Math.random() * 100);
    }
}
```

步骤 5：执行程序，输出结果。

### 6.4 Integer

```java
Integer i1 = 56;
Integer i2 = 56;
Integer i3 = 129;
Integer i4 = 129;
System.out.println(i1 == i2);
System.out.println(i3 == i4);
```

Java为基本数据类型提供了对应包装器：

| 基本数据类型 | 对应的包装器类型 |
| ------------ | ---------------- |
| int          | Integer          |
| long         | Long             |
| float        | Float            |
| double       | Double           |
| boolean      | Boolean          |
| short        | Short            |
| byte         | Byte             |
| char         | Character        |

```java
Integer i = 56; //自动装箱
int j = i; //自动拆箱
```

数值56是基本数据类型int，当赋值给包装器类型（Integer）变量的时候，触发自动装箱操作，创建一个Integer类型的对象，并且赋值给变量i。底层相当于执行：

```java
// 底层执行了：Integer i = Integer.valueOf(59);
Integer i = 59;
```

反过来，当把包装器类型的变量i，赋值给基本数据类型变量j的时候，触发自动拆箱操作，将i中的数据取出，赋值给j。其底层相当于执行了下面这条语句：

```java
// 底层执行了：int j = i.intValue();
int j = i;
```

#### Java对象在内存的存储

```java
User a = new User(123, 23); // id=123, age=23
```

内存存储结构图：a存储的值是User对象的内存地址，即a指向User对象

![](https://p.ipic.vip/43t0tq.png)

通过“==”判定相等时，实际上是在判断两个局部变量存储的地址是否相同，即判断两个局部变量是否指向相同对象。

```java
Integer i1 = 56;
Integer i2 = 56;
Integer i3 = 129;
Integer i4 = 129;
System.out.println(i1 == i2);
System.out.println(i3 == i4);
```

前4行赋值语句都会触发自动装箱操作，即创建Integer对象并赋值给i1、i2、i3、i4变量。i1、i2尽管存储数值相同56，但指向不同Integer对象，所以通过`==`来判定是否相同的时候，会返回false。同理，i3==i4判定语句也会返回false。

不过，上面的分析还是不对，答案并非是两个false，而是一个true，一个false。因为Integer用了享元模式复用对象，才导致这样的运行差异。通过自动装箱，即调用valueOf()创建Integer对象时，如果要创建的Integer对象的值在-128到127之间，会从IntegerCache类中直接返回，否则才调用new方法创建：

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}
```

实际上，这里的IntegerCache相当于，我们上一节课中讲的生成享元对象的工厂类，只不过名字不叫xxxFactory而已。我们来看它的具体代码实现。这个类是Integer的内部类，你也可以自行查看JDK源码。

```java
/**
 * Cache to support the object identity semantics of autoboxing for values between
 * -128 and 127 (inclusive) as required by JLS.
 *
 * The cache is initialized on first usage.  The size of the cache
 * may be controlled by the {@code -XX:AutoBoxCacheMax=<size>} option.
 * During VM initialization, java.lang.Integer.IntegerCache.high property
 * may be set and saved in the private system properties in the
 * sun.misc.VM class.
 */
private static class IntegerCache {
    static final int low = -128;
    static final int high;
    static final Integer cache[];

    static {
        // high value may be configured by property
        int h = 127;
        String integerCacheHighPropValue =
            sun.misc.VM.getSavedProperty("java.lang.Integer.IntegerCache.high");
        if (integerCacheHighPropValue != null) {
            try {
                int i = parseInt(integerCacheHighPropValue);
                i = Math.max(i, 127);
                // Maximum array size is Integer.MAX_VALUE
                h = Math.min(i, Integer.MAX_VALUE - (-low) -1);
            } catch( NumberFormatException nfe) {
                // If the property cannot be parsed into an int, ignore it.
            }
        }
        high = h;

        cache = new Integer[(high - low) + 1];
        int j = low;
        for(int k = 0; k < cache.length; k++)
            cache[k] = new Integer(j++);

        // range [-128, 127] must be interned (JLS7 5.1.7)
        assert IntegerCache.high >= 127;
    }

    private IntegerCache() {}
}
```

Q：为啥IntegerCache只缓存-128到127之间整型值？

IntegerCache类被加载时，缓存的享元对象会被集中一次性创建好。整型值太多，不可能IntegerCache类预先创建好所有，既占太多内存，也使加载IntegerCache类时间过长。只能选择缓存对大部分应用来说最常用整型值，即一个字节大小（-128到127之间数据）。

JDK也提供方法可自定义缓存最大值，两种方式：

如果你通过分析应用的JVM内存占用情况，发现-128到255之间的数据占用的内存比较多，可将缓存最大值从127调到255，但JDK没有提供设置最小值方法。

```bash
# 方法一
-Djava.lang.Integer.IntegerCache.high=255
# 方法二
-XX:AutoBoxCacheMax=255
```

因为56处于-128和127之间，i1和i2会指向相同的享元对象，所以`i1==i2`返回true。而129大于127，并不会被缓存，每次都会创建一个全新的对象，也就是说，i3和i4指向不同的Integer对象，所以i3==i4返回false。

实际上，除了Integer类型之外，其他包装器类型，比如Long、Short、Byte等，也都利用了享元模式来缓存-128到127之间的数据。比如，Long类型对应的LongCache享元工厂类及valueOf()函数代码如下所示：

```java
private static class LongCache {
    private LongCache(){}

    static final Long cache[] = new Long[-(-128) + 127 + 1];

    static {
        for(int i = 0; i < cache.length; i++)
            cache[i] = new Long(i - 128);
    }
}

public static Long valueOf(long l) {
    final int offset = 128;
    if (l >= -128 && l <= 127) { // will cache
        return LongCache.cache[(int)l + offset];
    }
    return new Long(l);
}
```

平时开发对下面这样三种创建整型对象的方式，优先用后两种：

```java
// 第一种创建方式不会用到IntegerCache
Integer a = new Integer(123);
// 后两种创建方法可用IntegerCache缓存，返回共享对象
Integer a = 123;
Integer a = Integer.valueOf(123);
```

极端案例：

若程序需创建1万个 `-128~127` 之间的Integer对象：

- 使用第一种创建方式，需分配1万个Integer对象的内存空间
- 使用后两种创建方式，最多只需分配256个Integer对象的内存空间

### 6.5 String

```java
String s1 = "JavaEdge";
String s2 = "JavaEdge";
String s3 = new String("JavaEdge");

// true
System.out.println(s1 == s2);
// false
System.out.println(s1 == s3);
```

跟Integer设计相似，String利用享元模式复用相同字符串常量（即“JavaEdge”）。JVM会专门开辟一块存储区来存储字符串常量，即“字符串常量池”，对应内存存储结构示意图：

![](https://p.ipic.vip/hynfbg.png)

不同点：

- Integer类要共享对象，是在类加载时，一次性全部创建好
- 字符串，没法预知要共享哪些字符串常量，所以无法事先创建，只能在某字符串常量第一次被用到时，存储到常量池，再用到时，直接引用常量池中已存在的

## 7 竞品

### 7.1 V.S 单例

- 单例模式，一个类只能创建一个对象
- 享元模式，一个类可创建多个对象，每个对象被多处代码引用共享。类似单例的变体：多例。

还是要看设计意图，即要解决啥问题：

- 享元模式是为对象复用，节省内存
- 单例模式是为限制对象个数

### 7.2 V.S 缓存

享元模式得实现，通过工厂类“缓存”已创建好的对象。“缓存”实际上是“存储”，跟平时说的“数据库缓存”、“CPU缓存”、“MemCache缓存”是两回事。平时所讲的缓存，主要为提高访问效率，而非复用。

### 7.3  V.S 对象池

C++内存管理由程序员负责。为避免频繁地进行对象创建和释放导致内存碎片，可以预先申请一片连续的内存空间，即对象池。每次创建对象时，我们从对象池中直接取出一个空闲对象来使用，对象使用完成之后，再放回到对象池中以供后续复用，而非直接释放掉。

![](https://img-blog.csdnimg.cn/2eddeff69489437797bf59b07d1219a2.png)

虽然对象池、连接池、线程池、享元模式都是为复用，但对象池、连接池、线程池等池化技术中的“复用”和享元模式中的“复用”是不同概念：

- 池化技术中的“复用”可以理解为“重复使用”，主要目的是节省时间（比如从数据库池中取一个连接，不需要重新创建）。在任意时刻，每一个对象、连接、线程，并不会被多处使用，而是被一个使用者独占，当使用完成之后，放回到池中，再由其他使用者重复利用
- 享元模式中的“复用”可以理解为“共享使用”，在整个生命周期中，都是被所有使用者共享的，主要目的是节省空间

## X 总结

- 单例模式是为保证对象全局唯一
- 享元模式是为实现对象复用，节省内存。缓存是为提高访问效率，而非复用
- 池化技术中的“复用”理解为“重复使用”，主要为节省时间

Integer的-128到127之间整型对象会被事先创建好，缓存在IntegerCache类。当使用自动装箱或valueOf()创建这个数值区间的整型对象时，会复用IntegerCache类事先创建好的对象。IntegerCache类就是享元工厂类，事先创建好的整型对象就是享元对象。

String类，JVM开辟一块存储区（字符串常量池）存储字符串常量，类似Integer的IntegerCache。但并非事先创建好需要共享的对象，而是在程序运行期间，根据需要创建和缓存字符串常量

享元模式对GC不友好。因为享元工厂类一直保存对享元对象的引用，导致享元对象在无任何代码使用时，也不会被GC。因此，某些情况下，若对象生命周期很短，也不会被密集使用，利用享元模式反倒浪费更多内存。务必验证享元模式真的能大大节省内存吗。