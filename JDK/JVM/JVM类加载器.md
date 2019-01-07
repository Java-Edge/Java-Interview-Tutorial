类加载器是如何定位具体的类文件并读取的呢?

# 1 类加载器
在类加载器家族中存在着类似人类社会的权力等级制度：
## 1.1 `Bootstrap` 
由C/C++实现，启动类加载器，属最高层，JVM启动时创建，通常由与os相关的本地代码实现，是最根基的类加载器。
### JDK8 时
> **需要注意的是**,Bootstrap ClassLoader智慧加载特定名称的类库,比如rt.jar.这意味我们自定义的jar扔到`<JAVA_HOME>\jre\lib`也不会被加载. 

负责将`<JAVA_ HOME>/jre/lib`或`-
Xbootclasspath`参数指定的路径中的，且是虚拟机识别的类库加载到内存中(按照名字识别,比如rt.jar，对于不能识别的文件不予装载)，比如：
- Object
- System
- String
- Java运行时的rt.jar等jar包
- 系统属性sun.boot.class.path指定的目录中特定名称的jar包

在JVM启动时，通过**Bootstrap ClassLoader**加载`rt.jar`，并初始化`sun.misc.Launcher`从而创建**Extension ClassLoader**和**Application ClassLoader**的实例。
查看Bootstrap ClassLoader到底初始化了那些类库:

```java
URL[] urLs = Launcher.getBootstrapClassPath().getURLs();
       for (URL urL : urLs) {
           System.out.println(urL.toExternalForm());
       }
```
### JDK9 后
负责加载启动时的基础模块类，比如：
- java.base
- java.management
- java.xml
## 1.2 `Platform ClassLoader` 
### JDK8 时`Extension ClassLoader`
只有一个实例，由sun.misc.Launcher$ExtClassLoader实现：
- 负责加载`<JAVA_HOME>\lib\ext`或`java.ext.dirs`系统变量指定的路径中的所有类库
- 加载一些扩展的系统类，比如XML、加密、压缩相关的功能类等

### JDK9时替换为平台类加载器
加载一些平台相关的模块，比如`java.scripting`、`java.compiler*`、 `java.corba*`。
### 那为何 9 时废除替换了呢？
JDK8 的主要加载 jre lib 的ext，扩展 jar 包时使用，这样操作并不推荐，所以废除。而 JDK9 有了模块化，更无需这种扩展加载器。
## 1.3 `Application ClassLoader`  
只有一个实例,由`sun.misc.Launcher$AppClassLoader`实现。
### JDK8 时
负责加载系统环境变量ClassPath或者系统属性java.class.path指定目录下的所有类库。
如果应用程序中没有定义自己的加载器，则该加载器也就是默认的类加载器。该加载器可以通过java.lang.ClassLoader.getSystemClassLoader获取。
### JDK9 后
应用程序类加载器，用于加载应用级别的模块，比如：
- jdk.compiler
- jdk.jartool
- jdk.jshell
![](https://img-blog.csdnimg.cn/2021011914324377.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- classpath路径中的所有类库

第二、三层类加载器为Java语言实现，用户也可以
## 1.4 自定义类加载器
用户自定义的加载器，是`java.lang.ClassLoader`的子类，用户可以定制类的加载方式;只不过自定义类加载器其加载的顺序是在所有系统类加载器的最后。

## 1.5 Thread Context ClassLoader
每个线程都有一个类加载器(jdk 1.2后引入),称之为Thread Context ClassLoader,如果线程创建时没有设置,则默认从父线程中继承一个,如果在应用全局内都没有设置,则所有Thread Context ClassLoader为Application ClassLoader.可通过Thread.currentThread().setContextClassLoader(ClassLoader)来设置,通过Thread.currentThread().getContextClassLoader()来获取. 

线程上下文加载器有什么用?
该类加载器容许父类加载器通过子类加载器加载所需要的类库,也就是打破了我们下文所说的双亲委派模型。
这有什么好处呢?
利用线程上下文加载器，我们能够实现所有的代码热替换,热部署,Android中的热更新原理也是借鉴如此。

#  2 验证类加载器
## 2.1 查看本地类加载器
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWM2YTlkN2YwOTEwZDNiZGMucG5n)
在JDK8环境中，执行结果如下
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWExYjA3N2UzYTRiYzRhZjMucG5n)
AppClassLoader的Parent为Bootstrap，它是通过C/C++实现的，并不存在于JVM体系内，所以输出为 null。


# 类加载器的特点
- 类加载器并不需要等到某个类"首次主动使用”的时候才加载它，JVM规范允许类加载器在预料到某个类将要被使用的时候就预先加载它。
- Java程序不能直接引用启动类加载器，直接设置classLoader为null，默认就使用启动类加载器
- 如果在加载的时候`.class`文件缺失,会在该类首次主动使用时通知LinkageError错误，如果一直没有被使用，就不会报错
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQ2ZGU1NDU2OTNmNGZjYjEucG5n)


低层次的当前类加载器，不能覆盖更高层次类加载器已经加载的类
如果低层次的类加载器想加载一个未知类，要非常礼貌地向上逐级询问:“请问，这个类已经加载了吗?”
被询问的高层次类加载器会自问两个问题
- 我是否已加载过此类
- 如果没有，是否可以加载此类

只有当所有高层次类加载器在两个问题的答案均为“否”时，才可以让当前类加载器加载这个未知类
左侧绿色箭头向上逐级询问是否已加载此类，直至`Bootstrap ClassLoader`,然后向下逐级尝试是否能够加载此类，如果都加载不了，则通知发起加载请求的当前类加载器，准予加载
在右侧的三个小标签里，列举了此层类加载器主要加载的代表性类库，事实上不止于此

通过如下代码可以查看Bootstrap 所有已加载类库
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTg0MGEwNDUwNWI1Y2I1YTgucG5n)
执行结果
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWNiNTdkZGNmZjBmZDI0ZWMucG5n)

Bootstrap加载的路径可以追加，不建议修改或删除原有加载路径
在JVM中增加如下启动参数，则能通过`Class.forName`正常读取到指定类，说明此参数可以增加Bootstrap的类加载路径:
```bash
-Xbootclasspath/a:/Users/sss/book/ easyCoding/byJdk11/src
```
如果想在启动时观察加载了哪个jar包中的哪个类，可以增加
```bash
-XX:+TraceClassLoading
```
此参数在解决类冲突时非常实用，毕竟不同的JVM环境对于加载类的顺序并非是一致的
有时想观察特定类的加载上下文，由于加载的类数量众多，调试时很难捕捉到指定类的加载过程，这时可以使用条件断点功能
比如，想查看HashMap的加载过程，在loadClass处打个断点，并且在condition框内输入如图
![设置条件断点](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTZhMjk0YjhhNzVkYWM4MTIucG5n)

### JVM如何确立每个类在JVM的唯一性
类的全限定名和加载这个类的类加载器的ID

在学习了类加载器的实现机制后，知道双亲委派模型并非强制模型，用户可以自定义类加载器，在什么情况下需要自定义类加载器呢?
- 隔离加载类
在某些框架内进行中间件与应用的模块隔离，把类加载到不同的环境
比如，阿里内某容器框架通过自定义类加载器确保应用中依赖的jar包不会影响到中间件运行时使用的jar包
- 修改类加载方式
类的加载模型并非强制，除Bootstrap外，其他的加载并非一定要引入，或者根据实际情况在某个时间点进行按需进行动态加载
- 扩展加载源
比如从数据库、网络，甚至是电视机机顶盒进行加载
- 防止源码泄露
Java代码容易被编译和篡改，可以进行编译加密。那么类加载器也需要自定义，还原加密的字节码。

实现自定义类加载器的步骤
- 继承ClassLoader
- 重写findClass()方法
- 调用defineClass()方法

一个简单的类加载器实现的示例代码如下
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTdiYjk1NGI1NThlOTAwMzAucG5n)

由于中间件一般都有自己的依赖jar包，在同一个工程内引用多个框架时，往往被迫进行类的仲裁。按某种规则jar包的版本被统一指定， 导致某些类存在包路径、类名相同的情况，就会引起类冲突，导致应用程序出现异常。
主流的容器类框架都会自定义类加载器，实现不同中间件之间的类隔离，有效避免了类冲突。