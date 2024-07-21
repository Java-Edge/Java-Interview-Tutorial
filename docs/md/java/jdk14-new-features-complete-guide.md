# JDK14新特征最全详解

JDK 14一共发行了16个JEP(JDK Enhancement Proposals，JDK 增强提案)，筛选出JDK 14新特性。

\- 343: 打包工具 (Incubator)

\- 345: G1的NUMA内存分配优化

\- 349: JFR事件流

\- 352: 非原子性的字节缓冲区映射

\- 358: 友好的空指针异常

\- 359: Records (预览)

\- 361: Switch表达式 (标准)

\- 362: 弃用Solaris和SPARC端口

\- 363: 移除CMS(Concurrent Mark Sweep)垃圾收集器

\- 364: macOS系统上的ZGC

\- 365: Windows系统上的ZGC

\- 366: 弃用ParallelScavenge + SerialOld GC组合

\- 367: 移除Pack200 Tools 和 API

\- 368: 文本块 (第二个预览版)

\- 370: 外部存储器API (Incubator)

## 1 JEP 305的instanceof运算符

JEP 305新增使instanceof运算符具有模式匹配的能力。模式匹配使程序通用逻辑更简洁，代码更简单，同时在做类型判断和类型转换时也更安全。

###  设计初衷

包含判断表达式是否具有某种类型的逻辑时，程序会对不同类型进行不同的处理。

### instanceof-and-cast

```java
// 在方法的入口接收一个对象
public void beforeWay(Object obj) {
    // 通过instanceof判断obj对象的真实数据类型是否是String类型
    if (obj instanceof String) {
        // 如果进来了，说明obj的类型是String类型，直接进行强制类型转换。
        String str = (String) obj;
        // 输出字符串的长度
        System.out.println(str.length());
    }
}
```

1. 先判断obj的真实数据类型
2. 判断成立后进行了强制类型转换(将对象obj强制类型转换为String)
3. 声明一个新的本地变量str，指向上面的obj

但上述做法不是最理想：

- 语法臃肿乏味
- 同时执行类型检测校验和类型转换
- String类型出现3次，但最终要的可能只是一个String类型的对象变量
- 重复代码过多，冗余度高

JDK14提供新解决方案：新的instanceof模式匹配 ，用法如下，在`instanceof`的类型之后添加变量`str`。

若`instanceof`对`obj`的类型检查通过，`obj`会被转换成`str`表示的`String`类型。在新用法中，`String`类型仅出现一次：

```java
public void patternMatching(Object obj) {
    if (obj instanceof String str) {
          // can use str here
        System.out.println(str.length());
    } else {
        // can't use str here
    }
}
```

注意：若obj是String类型，则将obj类型转换为String，并将其赋值给变量str。绑定的变量作用域为if语句内部，并不在false语句块内。

### 简化equals()

`equals()`一般先检查目标对象的类型。`instanceof`的模式匹配可简化`equals()`实现。

```java
public class Student {
  private  String name ;

  public Student(String name) {
    this.name = name;
  }

//    @Override
//    public boolean equals(Object o) {
//        if (this == o) return true;
//        if (o == null || getClass() != o.getClass()) return false;
//        Student student = (Student) o;
//        return Objects.equals(name, student.name);
//    }
  // 简化后做法！  
  @Override
  public boolean equals(Object obj) {
    return (obj instanceof Student s) && Objects.equals(this.name, s.name);
  }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }
}
```

JDK 14后的instanceof的模式匹配极大的简化了类型检查和转型的问题。

## 2 JEP 361：Switch Expressions (Standard)

扩展switch分支选择语句的写法。Switch表达式在经过JDK 12(JEP 325)和JDK(JEP 354)的预览之后，在JDK 14中已稳定可用。

### 2.1 设计初衷

switch语句是个变化较大的语法。可是因为Java switch一直不够强大、熟悉swift或js语言的同学可对比发现，因为Java的很多版本都在不断改进switch语句：JDK 12扩展了switch语句，使其可用作语句或表达式，并且传统的和扩展的简化版switch都可以使用。

JDK 12对于switch的增强主要在于简化书写形式，提升功能点。

### 2.2 switch的进化

- Java 5+开始，可用枚举
- Java 7+开始，支持使用String类型的变量和表达式
- Java 11+开始，自动对省略break导致的贯穿提示警告（以前需用-X:fallthrough选项才能显示）

从JDK12开始有大程度增强，JDK 14的该JEP是从[JEP 325](https://openjdk.java.net/jeps/325)和[JEP 354](https://openjdk.java.net/jeps/354)演变而来。但是，此JEP 361 Switch表达式 (标准)是独立的，并不依赖于这俩JEP。

### 2.3 以前的switch程序



```java
public class Demo01 {
    public static void main(String[] args){
        // 声明变量score，并为其赋值为'C'
        var score = 'C';
        // 执行switch分支语句
        switch (score) {
            case 'A':
                System.out.println("优秀");
                break;
            case 'B':
                System.out.println("良好");
                break;
            case 'C':
                System.out.println("中");
                break;
            case 'D':
                System.out.println("及格");
                break;
            case 'E':
                System.out.println("不及格");
                break;
            default:
                System.out.println("数据非法！");
        }
    }
}
```

经典的Java 11前的写法 ，不能忘写break，否则switch就会贯穿、导致程序出现错误(JDK 11会提示警告)。

### 2.4 无需break

在JDK 12前switch忘写break将导致贯穿，在JDK 12对switch的这一贯穿性做了改进。只要将case后面的":"改成箭头，即使不写break也不会贯穿，因此上面程序可改写为：

```java
public class Demo02{
    public static void main(String[] args){
        // 声明变量score，并为其赋值为'C'
        var score = 'C';
        // 执行switch分支语句
        switch (score){
            case 'A' -> System.out.println("优秀");
            case 'B' -> System.out.println("良好");
            case 'C' -> System.out.println("中");
            case 'D' -> System.out.println("及格");
            case 'E' -> System.out.println("不及格");
            default -> System.out.println("成绩数据非法！");
        }
    }
}
```

简洁很多了。注意，新老语法不能混用了，否则编译报错：

java: 在 switch 中使用了不同 case 类型：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/8f109cba49b95de8e49168ef64e55b8f.png)

### 2.5 JDK 14的switch表达式

JDK 12后的switch甚至可作为表达式，不再是单独的语句，如：

```java
public class Demo03 {
    public static void main(String[] args) {
        // 声明变量score，并为其赋值为'C'
        var score = 'C';
        // 执行switch分支语句
        String s = switch (score)
                {
                    case 'A' -> "优秀";
                    case 'B' -> "良好";
                    case 'C' -> "中";
                    case 'D' -> "及格";
                    case 'F' -> "不及格";
                    default -> "成绩输入错误";
                };
        System.out.println(s);
    }
}
```

上面程序直接将switch表达式的值赋值给s变量，这样switch不再是一个语句，而是一个表达式。

### 2.6 多值匹配

当你把switch中的case后的冒号改为箭头之后，此时switch就不会贯穿，但某些情况，程序本就希望贯穿。比如希望两个case共用一个执行体！

JDK 12之后的switch中的case也支持多值匹配，这样程序就变得更加简洁了，如：

```java
public class Demo04 {
    public static void main(String[] args) {
				 // 声明变量score，并为其赋值为'C'
        var score = 'B';
				 
        // 执行switch分支语句
        String s = switch (score)
                {
                    case 'A', 'B' -> "上等";
                    case 'C' -> "中等";
                    case 'D', 'E' -> "下等";
                    default -> "成绩数据输入非法！";
                };
        System.out.println(s);
    }
}
```

### 2.7 Yielding a value

用箭头标签时，箭头标签右边可为表达式、`throw`语句或是代码块。

如是代码块，需用`yield`语句来返回值。下面代码中的print方法中的`default`语句的右边是一个代码块。在代码块中使用`yield`来返回值。

JDK 14引入`yield`语句产生一个值，该值成为封闭的switch表达式的值。

```java
public void print(int days) {
  // 声明变量score，并为其赋值为'C'
  var score = 'B';
  String result = switch (score) {
      case 'A', 'B' -> "上等";
      case 'C' -> "中等";
      case 'D', 'E' -> "下等";
      default -> {
          if (score > 100) {
            yield "数据不能超过100";
          } else {
            yield score + "此分数低于0分";
          }
      }
  };
  System.out.println(result);
}
```

在switch表达式中不能使用break。switch表达式的每个标签都必须产生一个值或抛异常。

switch表达式须穷尽所有可能值。这意味着通常需要一个default语句。一个例外是枚举类型，如穷尽了枚举类型的所有可能值，则不需要使用default。在这种情况下，编译器会自动生成一个default语句。这是因为枚举类型中的枚举值可能发生变化。

如枚举类型Color 中原来只有3个值：RED、GREEN和BLUE。使用该枚举类型的switch表达式穷尽了3种情况并完成编译。之后Color中增加了一个新的值YELLOW，当用这个新的值调用之前的代码时，由于不能匹配已有的值，编译器产生的default会被调用，告知枚举类型发生改变

## 3 JEP 368：文本块 (JDK 13后的第二个预览版)

### 3.1 引入

Java开发通常需进行大量字符串文本拼接等相关组织操作，从JDK 13到JDK 14开始文本块新特性，提高Java程序书写大段字符串文本的可读性和方便性。

### 3.2 设计初衷

文本块功能在JDK 13中作为预览功能(JEP 355)被引入。这个功能在JDK 14中得到了更新。文本块是使用3个引号分隔的多行字符串。

### 3.3 描述

文本块可表示任何字符串，具有更高表达能力和更少复杂度。

文本块开头定界符是(""")，后面跟0或多个空格，最后跟一个行终止符。内容从开头定界符的行终止符之后的第一个字符开始。结束定界符也是(""")。内容在结束定界符的第一个双引号之前的最后一个字符处结束。

与字符串文字中的字符不同，文本块的内容中可以直接包含双引号字符。当然也允许在文本块中使用\“，但不是必需也不建议用。与字符串文字中的字符不同，内容可以直接包含行终止符。允许在文本块中用\n，但不是必需也不建议用。

如文本块：

```java
line 1
line 2
line 3
```

就等效于字符串文字：

```java
"line 1\nline 2\nline 3\n"
```

或字符串文字的串联：

```java
"line 1\n" +
"line 2\n" +
"line 3\n"
```

文本块功能在JDK 13中作为预览功能(JEP 355)被引入。这个功能在JDK 14中得到了更新。文本块是使用3个引号分隔的多行字符串。根据文本块在源代码中的出现形式，多余的用于缩进的白字符会被去掉。相应的算法会在每一行中去掉同样数量的白字符，直到其中任意的一行遇到非白字符为止。每一行字符串末尾的白字符会被自动去掉。

下面代码中的文本块`xml`会被去掉前面的2个白字符的缩进。

```java
String xml = """
  <root>
    <a>Hello</a>
    <b>
      <c>
        <d>World</d>
      </c>
    </b>
  </root>
  """;
```

缩进的去除是要考虑到作为结束分隔符的3个引号的位置的。如果把上面的文本块改成下面代码的格式，则没有缩进会被去掉。注意最后一行中3个引号的位置。去除的白字符的数量需要考虑到全部行中前导的白字符数量，包括最后一行。最终去除的白字符数量是这些行中前导白字符数量的最小值。

```java
String xml2 = """
  <root>
    <a>Hello</a>
    <b>
      <c>
        <d>World</d>
      </c>
    </b>
  </root>
""";
```

在文本块中同样可以使用\n和\r这样的转义字符。除了String本身支持的转义字符之外，文本块还支持2个特殊的转义字符：

\- \：阻止插入换行符。

\- \s：表示一个空格。可以用来避免末尾的白字符被去掉。

由于\的使用，下面代码中的longString实际上只有一行。

```java
String longString = """
    hello \
    world \
    goodbye
    """;
```

在下面的代码中，通过使用\s，每一行的长度都为10。

```java
String names = """
    alex     \s
    bob      \s
    long name\s
    """;
```

### 3.4 HTML

使用原始字符串语法：

```java
String html = "<html>\n" +
              "    <body>\n" +
              "        <p>Hello, world</p>\n" +
              "    </body>\n" +
              "</html>\n";
```

使用文本块文本块语法：

```java
String html = """
              <html>
                  <body>
                      <p>Hello, world</p>
                  </body>
              </html>
              """;
```

### 3.5 SQL

原始的字符串语法：

```java
String query = "SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`\n" +
               "WHERE `CITY` = 'INDIANAPOLIS'\n" +
               "ORDER BY `EMP_ID`, `LAST_NAME`;\n";
```

文本块语法：

```java
String query = """
               SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`
               WHERE `CITY` = 'INDIANAPOLIS'
               ORDER BY `EMP_ID`, `LAST_NAME`;
               """;
```

### 3.6 多语言示例

原始字符串语法：

```java
ScriptEngine engine = new ScriptEngineManager().getEngineByName("js");
Object obj = engine.eval("function hello() {\n" +
                         "    print('\"Hello, world\"');\n" +
                         "}\n" +
                         "\n" +
                         "hello();\n");
```

文本块语法：

```java
ScriptEngine engine = new ScriptEngineManager().getEngineByName("js");
Object obj = engine.eval("""
                         function hello() {
                             print('"Hello, world"');
                         }
                         
                         hello();
                         """);
```