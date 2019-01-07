把类加载阶段的“通过一个类的全限定名来获取描述此类的二进制字节流”这个动作交给虚拟机之外的类加载器来完成
这样的好处在于，我们可以自行实现类加载器来加载其他格式的类，只要是二进制字节流就行，这就大大增强了加载器灵活性

通常系统自带的类加载器分为三种：
> **启动类加载器**(Bootstrap ClassLoader):由C/C++实现,负责加载`<JAVA_HOME>\jre\lib`目录下或者是-Xbootclasspath所指定路径下目录以及系统属性sun.boot.class.path制定的目录中特定名称的jar包到虚拟机内存中。在JVM启动时,通过Bootstrap ClassLoader加载rt.jar,并初始化sun.misc.Launcher从而创建Extension ClassLoader和Application ClassLoader的实例. 
> **需要注意的是**,Bootstrap ClassLoader智慧加载特定名称的类库,比如rt.jar.这意味我们自定义的jar扔到`<JAVA_HOME>\jre\lib`也不会被加载. 
> 我们可以通过以下代码,查看Bootstrap ClassLoader到底初始化了那些类库:
> 
> ```
>  URL[] urLs = Launcher.getBootstrapClassPath().getURLs();
>         for (URL urL : urLs) {
>             System.out.println(urL.toExternalForm());
>         }
> ```
> 
> **扩展类加载器**（Extension Classloader）：只有一个实例,由sun.misc.Launcher$ExtClassLoader实现,负责加载`<JAVA_HOME>\lib\ext`目录下或是被系统属性java.ext.dirs所指定路径目录下的所有类库。
> 
> **应用程序类加载器**(Application ClassLoader):只有一个实例,由sun.misc.Launcher$AppClassLoader实现,负责加载系统环境变量ClassPath或者系统属性java.class.path制定目录下的所有类库，如果应用程序中没有定义自己的加载器，则该加载器也就是默认的类加载器.该加载器可以通过java.lang.ClassLoader.getSystemClassLoader获取.

以上三种是我们经常认识最多,除此之外还包括**线程上下文类加载器**(Thread Context ClassLoader)和**自定义类加载器**.

下来解释一下线程上下文加载器: 
每个线程都有一个类加载器(jdk 1.2后引入),称之为Thread Context ClassLoader,如果线程创建时没有设置,则默认从父线程中继承一个,如果在应用全局内都没有设置,则所有Thread Context ClassLoader为Application ClassLoader.可通过Thread.currentThread().setContextClassLoader(ClassLoader)来设置,通过Thread.currentThread().getContextClassLoader()来获取. 
我们来想想线程上下文加载器有什么用的?该类加载器容许父类加载器通过子类加载器加载所需要的类库,也就是打破了我们下文所说的双亲委派模型. 
这有什么好处呢?利用线程上下文加载器,我们能够实现所有的代码热替换,热部署,Android中的热更新原理也是借鉴如此的.

至于自定义加载器就更简单了,JVM运行我们通过自定义的ClassLoader加载相关的类库.

## 3.1 类加载器的双亲委派模型

当一个类加载器收到一个类加载的请求，它首先会将该请求委派给父类加载器去加载，每一个层次的类加载器都是如此，因此所有的类加载请求最终都应该被传入到顶层的启动类加载器(Bootstrap ClassLoader)中，只有当父类加载器反馈无法完成这个列的加载请求时（它的搜索范围内不存在这个类），子类加载器才尝试加载。其层次结构示意图如下： 
![双亲委派模型示意图](http://upload-images.jianshu.io/upload_images/4685968-73c4e96204d512c2?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

不难发现,该种加载流程的好处在于：

1.  可以避免重复加载，父类已经加载了，子类就不需要再次加载
2.  更加安全，很好的解决了各个类加载器的基础类的统一问题，如果不使用该种方式，那么用户可以随意定义类加载器来加载核心api，会带来相关隐患。

接下来,我们看看双亲委派模型是如何实现的：

```
 protected Class<?> loadClass(String name, boolean resolve)
        throws ClassNotFoundException
    {
        synchronized (getClassLoadingLock(name)) {
            // 首先先检查该类已经被加载过了
            Class c = findLoadedClass(name);
            if (c == null) {//该类没有加载过，交给父类加载
                long t0 = System.nanoTime();
                try {
                    if (parent != null) {//交给父类加载
                        c = parent.loadClass(name, false);
                    } else {//父类不存在，则交给启动类加载器加载
                        c = findBootstrapClassOrNull(name);
                    }
                } catch (ClassNotFoundException e) {
                   //父类加载器抛出异常，无法完成类加载请求
                }

                if (c == null) {//
                    long t1 = System.nanoTime();
                    //父类加载器无法完成类加载请求时，调用自身的findClass方法来完成类加载
                    c = findClass(name);
                    sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                    sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                    sun.misc.PerfCounter.getFindClasses().increment();
                }
            }
            if (resolve) {
                resolveClass(c);
            }
            return c;
        }
    }

```

这里有些童鞋会问,JVM怎么知道一个某个类加载器的父加载器呢?如果你有此疑问,请重新再看一遍.

## 3.2 类加载器的特点

1.  运行任何一个程序时，总是由Application Loader开始加载指定的类。
2.  一个类在收到加载类请求时，总是先交给其父类尝试加载。
3.  Bootstrap Loader是最顶级的类加载器，其父加载器为null。

## 3.3 类加载的三种方式

1.  通过命令行启动应用时由JVM初始化加载含有main()方法的主类。
2.  通过Class.forName()方法动态加载，会默认执行初始化块（static{}），但是Class.forName(name,initialize,loader)中的initialze可指定是否要执行初始化块。
3.  通过ClassLoader.loadClass()方法动态加载，不会执行初始化块。

## 3.4 自定义类加载器的两种方式

1、遵守双亲委派模型：继承ClassLoader，重写findClass()方法。 
2、破坏双亲委派模型：继承ClassLoader,重写loadClass()方法。 
通常我们推荐采用第一种方法自定义类加载器，最大程度上的遵守双亲委派模型。 
自定义类加载的目的是想要手动控制类的加载,那除了通过自定义的类加载器来手动加载类这种方式,还有其他的方式么?

> 利用现成的类加载器进行加载:
> 
> ```
> 1. 利用当前类加载器
> Class.forName();
> 
> 2. 通过系统类加载器
> Classloader.getSystemClassLoader().loadClass();
> 
> 3. 通过上下文类加载器
> Thread.currentThread().getContextClassLoader().loadClass();
> ```
> 
> l 
> 利用URLClassLoader进行加载:
> 
> ```
> URLClassLoader loader=new URLClassLoader();
> loader.loadClass();
> ```

* * *

**类加载实例演示：** 
命令行下执行HelloWorld.java

```
public class HelloWorld{
    public static void main(String[] args){
        System.out.println("Hello world");
    }
}
```

该段代码大体经过了一下步骤:

1.  寻找jre目录，寻找jvm.dll，并初始化JVM.
2.  产生一个Bootstrap ClassLoader；
3.  Bootstrap ClassLoader加载器会加载他指定路径下的java核心api，并且生成Extended ClassLoader加载器的实例，然后Extended ClassLoader会加载指定路径下的扩展java api，并将其父设置为Bootstrap ClassLoader。
4.  Bootstrap ClassLoader生成Application ClassLoader，并将其父Loader设置为Extended ClassLoader。
5.  最后由AppClass ClassLoader加载classpath目录下定义的类——HelloWorld类。

我们上面谈到 Extended ClassLoader和Application ClassLoader是通过Launcher来创建,现在我们再看看源代码:

```
 public Launcher() {
        Launcher.ExtClassLoader var1;
        try {
            //实例化ExtClassLoader
            var1 = Launcher.ExtClassLoader.getExtClassLoader();
        } catch (IOException var10) {
            throw new InternalError("Could not create extension class loader", var10);
        }

        try {
            //实例化AppClassLoader
            this.loader = Launcher.AppClassLoader.getAppClassLoader(var1);
        } catch (IOException var9) {
            throw new InternalError("Could not create application class loader", var9);
        }
        //主线程设置默认的Context ClassLoader为AppClassLoader.
        //因此在主线程中创建的子线程的Context ClassLoader 也是AppClassLoader
        Thread.currentThread().setContextClassLoader(this.loader);
        String var2 = System.getProperty("java.security.manager");
        if(var2 != null) {
            SecurityManager var3 = null;
            if(!"".equals(var2) && !"default".equals(var2)) {
                try {
                    var3 = (SecurityManager)this.loader.loadClass(var2).newInstance();
                } catch (IllegalAccessException var5) {
                    ;
                } catch (InstantiationException var6) {
                    ;
                } catch (ClassNotFoundException var7) {
                    ;
                } catch (ClassCastException var8) {
                    ;
                }
            } else {
                var3 = new SecurityManager();
            }

            if(var3 == null) {
                throw new InternalError("Could not create SecurityManager: " + var2);
            }

            System.setSecurityManager(var3);
        }

    }
```

## 3.5 非常重要

双亲委派模型好处：eg，object 类。它存放在 rt.jar 中，无论哪个类加载器要加载这个类，最终都是委派给处于模型顶端的启动类加载器加载，因此 object 类在程序的各种加载环境中都是同一个类。 

在这里呢我们需要注意几个问题: 
1\. 我们知道ClassLoader通过一个类的全限定名来获取二进制流,那么如果我们需要通过自定义类加载其来加载一个Jar包的时候,难道要自己遍历jar中的类,然后依次通过ClassLoader进行加载吗?或者说我们怎么来加载一个jar包呢? 
2\. 如果一个类引用的其他的类,那么这个其他的类由谁来加载? 
3\. 既然类可以由不同的加载器加载,那么如何确定两个类如何是同一个类?

我们来依次解答这两个问题: 
对于动态加载jar而言,JVM默认会使用第一次加载该jar中指定类的类加载器作为默认的ClassLoader.假设我们现在存在名为sbbic的jar包,该包中存在ClassA和ClassB这两个类(ClassA中没有引用ClassB).现在我们通过自定义的ClassLoaderA来加载在ClassA这个类,那么此时此时ClassLoaderA就成为sbbic.jar中其他类的默认类加载器.也就是,ClassB也默认会通过ClassLoaderA去加载.

那么如果ClassA中引用了ClassB呢?当类加载器在加载ClassA的时候,发现引用了ClassB,此时类加载如果检测到ClassB还没有被加载,则先回去加载.当ClassB加载完成后,继续回来加载ClassA.换句话说,类会通过自身对应的来加载其加载其他引用的类.

JVM规定,对于任何一个类,都需要由加载它的类加载器和这个类本身一同确立在java虚拟机中的唯一性,通俗点就是说,在jvm中判断两个类是否是同一个类取决于类加载和类本身,也就是同一个类加载器加载的同一份Class文件生成的Class对象才是相同的,类加载器不同,那么这两个类一定不相同.
