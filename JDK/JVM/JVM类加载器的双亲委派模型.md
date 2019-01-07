说是双亲，其实多级单亲，无奈迎合历史的错误翻译吧。
# 1 工作流程
- 当一个类加载器收到一个类加载请求
在 JDK9 后，会首先搜索它的内建加载器定义的所有“具名模块”：
	- 如果找到合适的模块定义，将会使用该加载器来加载
	- 如果未找到，则会将该请求委派给父级加载器去加载
- 因此所有的类加载请求最终都应该被传入到启动类加载器(Bootstrap ClassLoader)中，只有当父级加载器反馈无法完成这个列的加载请求时（它的搜索范围内不存在这个类），子级加载器才尝试加载。

在类路径下找到的类将成为这些加载器的无名模块。

**这里的父子关系是组合而不是继承**。

- 双亲委派模型示意图
![](https://img-blog.csdnimg.cn/img_convert/2f38d489c0a1a948239765913d64cfcf.png)

# 双亲委派模型的优点
- 避免重复加载
父类已经加载了，子类就不需要再次加载。
eg，object 类。它存放在 rt.jar 中，无论哪个类加载器要加载这个类，最终都是委派给处于模型顶端的启动类加载器加载，因此 object 类在程序的各种加载环境中都是同一个类。 
- 更安全
解决了各个类加载器的基础类的统一问题，如果不使用该种方式，那么用户可以随意定义类加载器来加载核心 API，会带来安全隐患。

# 双亲委派模型的实现
```java
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

## 3.3 类加载的方式
1.  通过命令行启动应用时由JVM初始化加载含有main()方法的主类。
2.  通过Class.forName()方法动态加载，会默认执行初始化块（static{}），但是Class.forName(name,initialize,loader)中的initialze可指定是否要执行初始化块。
3.  通过ClassLoader.loadClass()方法动态加载，不会执行初始化块。

# 自定义类加载器
### 实现方式
- 遵守双亲委派模型
继承ClassLoader，重写findClass()方法。 
- 破坏双亲委派模型
继承ClassLoader，重写loadClass()方法。 

通常我们推荐采用第一种方法自定义类加载器，最大程度上的遵守双亲委派模型。 

如果有一个类加载器能加载某个类，称为**定义类加载器**，所有能成功返回该类的Class的类加载器都被称为**初始类加载器**。

自定义类加载的目的是想要手动控制类的加载，那除了通过自定义的类加载器来手动加载类这种方式，还有其他的方式么?

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

```java
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

```java
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
# 破坏双亲委派模型
双亲模型有个问题：父加载器无法向下识别子加载器加载的资源。
- 如下证明 JDBC 是启动类加载器加载，但 mysql 驱动是应用类加载器。而 JDBC 运行时又需要去访问子类加载器加载的驱动，就破坏了该模型。
![](https://img-blog.csdnimg.cn/2021011918265025.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
JDK 自己为解决该问题，引入线程上下问类加载器，可以通过Thread的setContextClassLoader()进行设置
- 当为启动类加载器时，使用当前实际加载驱动类的类加载器
![](https://img-blog.csdnimg.cn/20210119184938411.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 热替换
比如OSGI的模块化热部署，它的类加载器就不再是严格按照双亲委派模型，很多
可能就在平级的类加载器中执行了。

# FAQ
1. ClassLoader通过一个类全限定名来获取二进制流，如果我们需通过自定义类加载其来加载一个Jar包的时候,难道要自己遍历jar中的类,然后依次通过ClassLoader进行加载吗?或者说我们怎么来加载一个jar包呢? 
对于动态加载jar而言，JVM默认会使用第一次加载该jar中指定类的类加载器作为默认的ClassLoader。

假设我们现在存在名为sbbic的jar包，该包中存在ClassA和ClassB类(ClassA中没有引用ClassB)。
现在我们通过自定义的ClassLoaderA来加载在ClassA这个类，此时ClassLoaderA就成为sbbic.jar中其他类的默认类加载器。即ClassB默认也会通过ClassLoaderA去加载。

2. 如果一个类引用的其他的类,那么这个其他的类由谁来加载? 

如果ClassA中引用了ClassB呢?
当类加载器在加载ClassA的时候，发现引用了ClassB，此时类加载如果检测到ClassB还没有被加载，则先回去加载。当ClassB加载完成后，继续回来加载ClassA。即类会通过自身对应的来加载其加载其他引用的类。

3. 既然类可以由不同的加载器加载,那么如何确定两个类如何是同一个类?

JVM规定：对于任何一个类，都需要由加载它的类加载器和这个类本身一同确立在java虚拟机中的唯一性。即在jvm中判断两个类是否是同一个类取决于类加载和类本身，也就是同一个类加载器加载的同一份Class文件生成的Class对象才是相同的，类加载器不同，那么这两个类一定不相同。