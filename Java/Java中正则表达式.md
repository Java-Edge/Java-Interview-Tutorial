主要用到的是这两个类
- java.util.regex.Pattern
- java.util.regex.Matcher。

Pattern对应正则表达式，一个Pattern与一个String对象关联，生成一个Matcher，它对应Pattern在String中的一次匹配； 
调用Matcher对象的find()方法，Matcher对象就会更新为下一次匹配的匹配信息。示例：
```java
Pattern pattern = Pattern.compile("\\d{4}-\\d{2}-]]d{2}");
String string = "2010-12-20 2011-02-14";
Matcher matcher = pattern.matcher(string);
while(matcher.find()) {
    System.out.println(matcher.group(0));
}
```
#Pattern
Pattern是Java语言中的正则表达式对象。
要使用正则表达式，首先必须从字符串“编译”出Pattern对象，这需要用到`Pattern.compile(String regex)`
e.g
`Pattern pattern = Pattern.compile("a.b+");`

如果要指定匹配模式，可以在表达式中使用(?modifier)修饰符指定，也可以使用预定义常量。
下面的两个Pattern对象的生成方法不同，结果却是等价的。
```java
Pattern pattern = Pattern.compile("(?i)a.b+");
Pattern pattern = Pattern.compile("a.b+",Pattern.CASE_INSENSITIVE);
```
如果要同时指定多种模式，可以连写模式修饰符，也可以直接用|运算符将预定义常量连接起来，以下两个Pattern对象也是等价的。
```java
Pattern pattern = Pattern.compile("(?is)a.b+");
Pattern pattern = Pattern.compile("a.b+",Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
```
##Pattern的主要方法
![](https://upload-images.jianshu.io/upload_images/4685968-2d16306314c523f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
可检验字符串`input`能否由正则表达式`regex`匹配
因为是静态方法，所以不需要编译生成各个对象，方便随手使用。
要注意的是，它检验的是“整个字符串能否由表达式匹配”，而不是“表达式能否在字符串中找到匹配”。
可以认为`regex`的首尾自动加上了匹配字符串起始和结束位置的锚点 \A和\z 。
```
Pattern.matches("\\d{6}","a123456");   //false
Pattern.matches("\\d{6}","123456");     //true
```
![](https://upload-images.jianshu.io/upload_images/4685968-1b2adbbaecc536c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

通常，Pattern对象需要配合下面将要介绍的Matcher一起完成正则操作。如果只用正则表达式来切分字符串，只用Pattern的这个方法也可以。

这个方法接收的参数类型是`CharSequence`它可能有点陌生
![](https://upload-images.jianshu.io/upload_images/4685968-595ead2c2e84e926.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
它是String的父类m因而可以应对常见的各种表示“字符串”的类。下面的代码仅以String为例：
```
String s = "2018-3-26";
Pattern pattern = Pattern.compile("\\s+");
for(String part : pattern.split(s)){
    System.out.println(part);
}
```
这个方法与上面的方法很相似，只是多了一个参数limit，它用来限定返回的String数组的最大长度。
也就是说，它规定了字符串至多只能“切”limit-1次。如果不需要对字符串比较大，进行尽可能多的切分，使用这个方法。
```
String s = " 2010-12-20  ";
Pattern pattern = Pattern.compile("\\s+");
for(String part : Pattern.split(s,2)){
    System.out.println(part);
}
```
既然limit是一个int类型，那么它自然可以设定为各种值，下表总结了limit在各个取值区间对结果的影响（未指定limit时，最终返回包含n个元素的数组，实际能切分的次数是 n-1 ）：
                                                                                
- limit < 0
等于未设定limit时，保留末尾的空字符串
- limit = 0 
等于未设定limit时，切分n-1次，忽略末尾的空字符串
- 0 < limit < n
返回数组包含limit个元素，切分limit-1次，最后一个元素是第limit-1次切分后，右侧剩下的所有文本
- limit >= n
等于未指定limit时
![](https://upload-images.jianshu.io/upload_images/4685968-fa810753f0963f0a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
用来取消字符串text中所有转义字符的特殊含义，实质就是在字符串首尾添加 \Q 和 \E。
通常，如果需要把某个字符串作为没有任何特殊意义的正则表达式（比如从外界读入的字符串，用在某个复杂的正则表达式中），就可以使用这个方法：
```
"aacb".matches("a*.b");            //true
"a*.b".matches("a*.b");             //false
"a*.b".matches("a*.b");             //false
"a*.b".matches(Pattern.quote("a*.b"));        //true
```
#Matcher
Matcher可以理解为“某次具体匹配的结果对象”
把编译好的Pattern对象“应用”到某个String对象上，就获得了作为“本次匹配结果”的Matcher对象。
之后，就可以通过它获得关于匹配的信息。
```java
Pattern pattern = Pattern.compile("\\d{4}-\\d{2}-\\d{2}");
Matcher matcher = pattern.matcher("2010-12-20 2011-02-14");
while(matcher.find()){
    System.out.println(matcher.group());
}
```
对编译好的Pattern对象调用matcher(String text)方法，传入要匹配的字符串text，就得到了Matcher对象，每次调用一次find()方法，如果返回true，就表示“找到一个匹配”，此时可以通过下面的若干方法获得关于本次匹配的信息。

1. String group(int n)

返回当前匹配中第n对捕获括号捕获的文本，如果n为0，则取匹配的全部内容；如果n小于0或者大于最大分组编号数，则报错。

2. String group()

返回当前匹配的全部文本，相当于group(0)。

3. int groupCount()

返回此Matcher对应Pattern对象中包含的捕获分组数目，编号为0的默认分组不计在内。

4. int start(n)

返回当前匹配中第n对捕获括号匹配的文本在原字符串中的起始位置。

5. int start()

返回当前匹配的文本在原字符串中的起始位置，相当于start(0)。

6. int end(n)

返回当前匹配中第n对捕获括号匹配的文本在原字符串中的结束位置。

7. int end()

返回当前匹配的文本在原字符串中的结果位置，相当于end(0)。

8. String replaceAll(String replacement)

如果进行正则表达式替换，一般用到的是Matcher的replaceAll()方法，它会将原有文本中正则表达式能匹配的所有文本替换为replaceement字符串。

#String
许多时候只需要临时使用某个正则表达式，而不需要重复使用，这时候每次都生成Pattern对象和Matcher对象再操作显得很烦琐。所以，Java的String类提供了正则表达式操作的静态成员方法，只需要String对象就可以执行正则表达式操作。
![](https://upload-images.jianshu.io/upload_images/4685968-0cf5b4ba1db44cc8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这个方法判断当前的String对象能否由正则表达式`regex`匹配。
请注意，这里的“匹配”指的并不是`regex`能否在`String`内找到匹配，而是指`regex`匹配整个`String`对象，因此非常适合用来做数据校验。
```
"123456".matches("\\d{6}");            //true
"a123456".matches("\\d{6}");          //true
2. String replaceFirst(String regex,String replacement)
```
用来替换正则表达式regex在字符串中第一次能匹配的文本，可以在replacement字符串中用$num引用regex中对应捕获分组匹配的文本。
`"2010-12-20 2011-02-14".replaceFirst("(\\d{4})-(\\d{2})-(\\d{2})","$2/$3/$1");`
![](https://upload-images.jianshu.io/upload_images/4685968-f1582726822b7e82.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
用来进行所有的替换，它的结果等同于Matcher类的`replaceAll()`，replacement字符串中也可以用$num的表示法引用regex中对应捕获分组匹配的文本。
`"2010-12-20 2011-02-14".replaceAll("(\\d{4})-(\\d{2})-(\\d{2})","$2/$3/$1");`
![image.png](https://upload-images.jianshu.io/upload_images/4685968-5fd716b8e540d5e2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
等价于Pattern中对应的split()方法
# [Java String.split()用法小结](http://www.cnblogs.com/mingforyou/p/3299569.html)

在java.lang包中有String.split()方法,返回是一个数组

我在应用中用到一些,给大家总结一下,仅供大家参考:

1、如果用“.”作为分隔的话,必须是如下写法,String.split("\\."),这样才能正确的分隔开,不能用String.split(".");

2、如果用“|”作为分隔的话,必须是如下写法,String.split("\\|"),这样才能正确的分隔开,不能用String.split("|");

“.”和“|”都是转义字符,必须得加"\\";

3、如果在一个字符串中有多个分隔符,可以用“|”作为连字符,比如,“acount=? and uu =? or n=?”,把三个都分隔出来,可以用String.split("and|or");

使用String.split方法分隔字符串时,分隔符如果用到一些特殊字符,可能会得不到我们预期的结果。 

我们看jdk doc中说明  

public String[] split(String regex)

 Splits this string around matches of the given regular expression. 

参数regex是一个 regular-expression的匹配模式而不是一个简单的String,他对一些特殊的字符可能会出现你预想不到的结果,比如测试下面的代码用竖线 | 分隔字符串,你将得不到预期的结果
```
String[] aa = "aaa|bbb|ccc".split("|");

    //String[] aa = "aaa|bbb|ccc".split("\\|"); 这样才能得到正确的结果

    for (int i = 0 ; i <aa.length ; i++ ) {

      System.out.println("--"+aa[i]); 

    }
```
用竖 * 分隔字符串运行将抛出java.util.regex.PatternSyntaxException异常,用加号 + 也是如此。
```
String[] aa = "aaa*bbb*ccc".split("*");

    //String[] aa = "aaa|bbb|ccc".split("\\*"); 这样才能得到正确的结果    

    for (int i = 0 ; i <aa.length ; i++ ) {

      System.out.println("--"+aa[i]); 

    }
```
显然, + * 不是有效的模式匹配规则表达式,用"\\*" "\\+"转义后即可得到正确的结果。

"|" 分隔串时虽然能够执行,但是却不是预期的目的,"\\|"转义后即可得到正确的结果。

还有如果想在串中使用"\"字符,则也需要转义.首先要表达"aaaa\bbbb"这个串就应该用"aaaa\\bbbb",如果要分隔就应该这样才能得到正确结果,
`String[] aa = "aaa\\bbb\\bccc".split("\\\\");`
