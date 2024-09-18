# 00-JDK为何自己首先破坏双亲委派模型

## 0 前言

说是双亲，其实溯源，无奈迎合历史的错误翻译。

## 1 工作流程

- 当一个类加载器收到一个类加载请求
  在 JDK9 后，会首先搜索它的内建加载器定义的所有“具名模块”：
  - 如果找到合适的模块定义，将会使用该加载器来加载
  - 如果未找到，则会将该请求委派给父级加载器去加载
- 因此所有的类加载请求最终都应该被传入到启动类加载器(Bootstrap ClassLoader)中，只有当父级加载器反馈无法完成这个列的加载请求时（它的搜索范围内不存在这个类），子级加载器才尝试加载。

在类路径下找到的类将成为这些加载器的无名模块。

**这里的父子关系是组合而不是继承**。

### 双亲委派模型示意图



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/7af8214618af971939d27ba80460b21d.png)

## 2 双亲委派模型的优点

### 2.1 避免重复加载

父类已加载了，子类无需再加载。

e.g. object 类存放在 rt.jar 中，无论哪个类加载器要加载这个类，最终都是委派给处于模型顶端的启动类加载器加载，因此 object 类在程序的各种加载环境中都是同一个类。 

### 2.2 更安全

解决各类加载器的基础类的统一问题，若不使用该方式，则用户可随意定义类加载器来加载核心 API，带来安全隐患。

## 3 双亲委派模型的实现



```java
 protected Class<?> loadClass(String name, boolean resolve)
        throws ClassNotFoundException
    {
        synchronized (getClassLoadingLock(name)) {
            // 先检查该类是否已被加载
            Class c = findLoadedClass(name);
            if (c == null) { // 未被加载过，交给父类加载
                long t0 = System.nanoTime();
                try {
                    if (parent != null) { // 交给父类加载
                        c = parent.loadClass(name, false);
                    } else { // 父类不存在，交给启动类加载器加载
                        c = findBootstrapClassOrNull(name);
                    }
                } catch (ClassNotFoundException e) {
                   // 父类加载器抛出异常，无法完成类加载请求
                }

                if (c == null) {
                    long t1 = System.nanoTime();
                    // 父类加载器无法完成类加载请求时，调用自身findClass完成类加载
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

## 4 类加载的方式

- 通过命令行启动应用时，由JVM初始化加载含有main()方法的主类
- Class.forName()动态加载，默认执行初始化块（static{}），Class.forName(name,initialize,loader)中的initialze可指定是否要执行初始化块
- ClassLoader.loadClass()动态加载，不执行初始化块

## 5 自定义类加载器

### 5.1 实现方式

- 遵守双亲委派模型
  继承ClassLoader，重写findClass() 
- 破坏双亲委派模型
  继承ClassLoader，重写loadClass()

推荐第一种方法，最大程度遵守双亲委派模型。 

- 若有一个类加载器能加载某类，称为**定义类加载器**
- 所有能成功返回该类的Class的类加载器都被称为**初始类加载器**

自定义类加载，是为手动控制类的加载，除了自定义类加载器来手动加载类，还有其他方式吗？

利用现成的类加载器进行加载:

```java
// 1. 利用当前类加载器
Class.forName();

// 2. 通过系统类加载器
Classloader.getSystemClassLoader().loadClass();

// 3. 通过上下文类加载器
Thread.currentThread().getContextClassLoader().loadClass();
```

利用URLClassLoader进行加载：

```java
URLClassLoader loader=new URLClassLoader();
loader.loadClass();
```

## 6 类加载示例

命令行执行HelloWorld.java

```java
public class HelloWorld{
    public static void main(String[] args){
        System.out.println("Hello world");
    }
}
```

该段代码经过步骤：

1.  寻找jre目录，寻找jvm.dll，并初始化JVM
2.  产生一个Bootstrap ClassLoader
3.  Bootstrap ClassLoader加载器会加载他指定路径下的java核心api，并且生成Extended ClassLoader加载器的实例，然后Extended ClassLoader会加载指定路径下的扩展java api，并将其父设置为Bootstrap ClassLoader
4.  Bootstrap ClassLoader生成Application ClassLoader，并将其父Loader设置为Extended ClassLoader
5.  最后由AppClass ClassLoader加载classpath目录下定义的类—HelloWorld类

Extended ClassLoader和Application ClassLoader是通过Launcher创建，现在看源码：

```java
 public Launcher() {
        Launcher.ExtClassLoader var1;
        try {
            // 实例化ExtClassLoader
            var1 = Launcher.ExtClassLoader.getExtClassLoader();
        } catch (IOException var10) {
            throw new InternalError("Could not create extension class loader", var10);
        }

        try {
            // 实例化AppClassLoader
            this.loader = Launcher.AppClassLoader.getAppClassLoader(var1);
        } catch (IOException var9) {
            throw new InternalError("Could not create application class loader", var9);
        }
        // 主线程设置默认的Context ClassLoader为AppClassLoader.
        // 因此在主线程中创建的子线程的Context ClassLoader 也是AppClassLoader
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

## 7 破坏双亲委派模型

### 7.1 双亲模型的问题

父加载器无法向下识别子加载器加载的资源。

### 7.2 证明

- JDBC由启动类加载器加载
- 但 MySQL 驱动是应用类加载器

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/023109a62fe6260a820c9a853c89d720.png)

而 JDBC 运行时又需要去访问子类加载器所加载的驱动，就得破坏该模型。为此，JDK引入线程上下文类加载器，可通过Thread#setContextClassLoader()设置。

当为启动类加载器时，使用当前实际加载驱动类的类加载器：

```java
// JDK8
//  Worker method called by the public getConnection() methods.
private static Connection getConnection(
    String url, java.util.Properties info, Class<?> caller) throws SQLException {
    /*
     * When callerCl is null, we should check the application's
     * (which is invoking this class indirectly)
     * classloader, so that the JDBC driver class outside rt.jar
     * can be loaded from here.
     */
    ClassLoader callerCL = caller != null ? caller.getClassLoader() : null;
    synchronized(DriverManager.class) {
        // synchronize loading of the correct classloader.
        if (callerCL == null) {
            callerCL = Thread.currentThread().getContextClassLoader();
        }
    }
```

```java
// JDK22
// 被 public getConnection()调用的工作方法
@CallerSensitiveAdapter
private static Connection getConnection(
    String url, java.util.Properties info, Class<?> caller) throws SQLException {
    /*
     * 若调用者被定义为Bootstrap类加载器或平台类加载器，则使用线程的CCL作初始化类加载器，
     * 以便找到类路径上的JDBC，或与应用程序捆绑的JDBC
     */
    ClassLoader callerCL = caller != null ? caller.getClassLoader() : null;
    if (callerCL == null || callerCL == ClassLoader.getPlatformClassLoader()) {
        callerCL = Thread.currentThread().getContextClassLoader();
    }
```

### 7.3 热替换

如OSGI的模块化热部署，其类加载器就不再是严格按照双亲委派模型，很多可能就在平级的类加载器中执行。

## FAQ

Q：ClassLoader通过一个类全限定名获取二进制流，如需通过自定义类加载去加载一个Jar包，难道要自己遍历jar中的类，然后依次通过ClassLoader进行加载吗？或者说咋加载一个jar包?

A：动态加载jar，JVM默认用第一次加载该jar中指定类的类加载器作为默认ClassLoader。

假设现有名为sbbic的jar包，该包中存在ClassA、ClassB类（ClassA没有引用ClassB）。现通过自定义ClassLoaderA加载ClassA类，此时ClassLoaderA就成为sbbic.jar中其他类的默认类加载器。即ClassB默认也会通过ClassLoaderA去加载。

Q：若一个类引用的其他类，那这个其他类由谁加载？ 若ClassA引用了ClassB呢？

A：当类加载器加载ClassA时，发现引用了ClassB，此时类加载若检测到ClassB还没被加载，则先会去加载。当ClassB加载完成后，继续回来加载ClassA。即类会通过自身对应的类加载器来加载其引用的类。

Q：既然类可由不同加载器加载，咋确定两个类是同一个类？

A：JVM规定任一类，都要由加载它的类加载器和这个类本身一同确立在java虚拟机中的唯一性。即JVM判断两个类是否是同一个类取决于类加载和类本身，即同一个类加载器加载的同一份Class文件生成的Class对象才相同，若类加载器不同，这两个类一定不相同。