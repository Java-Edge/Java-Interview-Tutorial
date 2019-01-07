# 动态代理 V.S 静态代理
- Proxy类的代码被固定下来，不会因为业务的逐渐庞大而庞大
- 可以实现AOP编程，这是静态代理无法实现的
- 解耦，如果用在web业务下，可以实现数据层和业务层的分离
- 动态代理的优势就是实现无侵入式的代码扩展。
   
静态代理这个模式本身有个大问题，若类方法数量越来越多的时候，代理类的代码量十分庞大的。所以引入动态代理

# 动态代理
Java中动态代理的实现的关键：
- Proxy
- InvocationHandler

### InvocationHandler#invoke
- method
调用的方法，即需要执行的方法
- args
方法的参数
- proxy
代理类的实例
![](https://img-blog.csdnimg.cn/20210610160350321.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# JDK动态代理
JDK动态代理模式里有个拦截器，在JDK中，只要实现了**InvocationHandler**接口的类就是一个**拦截器类**。

假如写了个请求到action，经过拦截器，然后才会到action，执行后续操作。
拦截器就像一个过滤网，一层层过滤，只有满足一定条件，才能继续向后执行。
**拦截器的作用**：控制目标对象的目标方法的执行。

拦截器的具体操作步骤：
1. 引入类
目标类和一些扩展方法相关的类
2. 赋值
调用构造器，给相关对象赋值
3. 合并逻辑处理
在invoke方法中把所有的逻辑结合在一起。最终决定目标方法是否被调用

## 示例
![](https://img-blog.csdnimg.cn/20210610164051885.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210610164339779.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210610165337886.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20210610171204750.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
思考如下问题：
#### 代理对象由谁产生
JVM，不像静态代理，我们得自己new个代理对象。
#### 代理对象实现了什么接口
实现的接口是目标对象实现的接口。
同静态代理中代理对象实现的接口。那个继承关系图还是相同的。
代理对象和目标对象都实现一个共同的接口。就是这个接口。
所以Proxy.newProxyInstance()方法返回的类型就是这个接口类型。
#### 代理对象的方法体是什么
代理对象的方法体中的内容就是拦截器中invoke方法中的内容。

所有代理对象的处理逻辑，控制是否执行目标对象的目标方法。都是在这个方法里面处理的。

#### 拦截器中的invoke方法中的method参数是在什么时候赋值的
在客户端，代理对象调用目标方法的时候，此实例中为：
```java
proxyObj.business()；
```

实际上进入的是拦截器中的invoke方法，这时拦截器中的invoke方法中的method参数会被赋值。

#### 为啥这叫JDK动态代理
因为该动态代理对象是用JDK相关代码生成。

很多同学对动态代理迷糊，在于`proxyObj.business();`理解错了，至少是被表面所迷惑，没有发现这个proxyObj和Proxy之间的联系，一度纠结最后调用的这个`business()`是怎么和`invoke()`联系上的，而invoke又怎么知道business存在的。

其实上面的true和class $Proxy0就能解决很多的疑问，再加上下面将要说的$Proxy0的源码，完全可以解决动态代理的疑惑了。 

我们并没有显式调用invoke()，但是这个方法确实执行了。下面分析： 

从Client中的代码看，可以从newProxyInstance这个方法作为突破口，我们先来看一下Proxy类中newProxyInstance方法的源代码： 
```java
public static Object newProxyInstance(ClassLoader loader,
                                      Class<?>[] interfaces,
                                      InvocationHandler h) {
    final Class<?>[] intfs = interfaces.clone();
    final SecurityManager sm = System.getSecurityManager();
    if (sm != null) {
        checkProxyAccess(Reflection.getCallerClass(), loader, intfs);
    }

    /*
     * 查找或生成指定的代理类
     * 创建代理类$Proxy0
     * $Proxy0类实现了interfaces的接口,并继承了Proxy类
     */
    Class<?> cl = getProxyClass0(loader, intfs);

    /*
     * 使用指定的调用处理程序调用其构造器
     */
    try {
        if (sm != null) {
            checkNewProxyPermission(Reflection.getCallerClass(), cl);
        }
        // 形参为InvocationHandler类型的构造器
        final Constructor<?> cons = cl.getConstructor(constructorParams);
        final InvocationHandler ih = h;
        if (!Modifier.isPublic(cl.getModifiers())) {
            AccessController.doPrivileged(new PrivilegedAction<Void>() {
                public Void run() {
                    cons.setAccessible(true);
                    return null;
                }
            });
        }
        return cons.newInstance(new Object[]{h});
    } ...
}
```

Proxy.newProxyInstance做了如下事： 
- 根据参数loader和interfaces调用方法 getProxyClass(loader, interfaces)创建代理类`$Proxy0`。`$Proxy0`类 实现了interfaces的接口，并继承了Proxy类
- 实例化`$Proxy0`，并在构造器把DynamicSubject传过去，接着`$Proxy0`调用父类Proxy的构造器，为h赋值

$Proxy0的源码：
```java
package com.sun.proxy;

public final class $Proxy0 extends Proxy implements TargetInterface {
    private static Method m1;
    private static Method m3;
    private static Method m2;
    private static Method m0;

    public $Proxy0(InvocationHandler var1) throws  {
        super(var1);
    }

    public final boolean equals(Object var1) throws  {
        try {
            return (Boolean)super.h.invoke(this, m1, new Object[]{var1});
        }...
    }

    public final void business() throws  {
        try {
            super.h.invoke(this, m3, (Object[])null);
        }...
    }

    public final String toString() throws  {
        try {
            return (String)super.h.invoke(this, m2, (Object[])null);
        }...
    }

    public final int hashCode() throws  {
        try {
            return (Integer)super.h.invoke(this, m0, (Object[])null);
        }...
    }

    static {
        try {
            m1 = Class.forName("java.lang.Object").getMethod("equals", Class.forName("java.lang.Object"));
            m3 = Class.forName("com.javaedge.design.pattern.structural.proxy.dynamicproxy.jdkdynamicproxy.TargetInterface").getMethod("business");
            m2 = Class.forName("java.lang.Object").getMethod("toString");
            m0 = Class.forName("java.lang.Object").getMethod("hashCode");
        }...
    }
}

```
接着把得到的`$Proxy0`实例强转成TargetInterface，并将引用赋给TargetInterface。当执行proxyObj.business()，就调用了`$Proxy0`类中的business()方法，进而调用父类Proxy中的h的invoke()方法。即`InvocationHandler.invoke()`。 

Proxy#getProxyClass返回的是Proxy的Class类，而非“被代理类的Class类”！
![](https://img-blog.csdnimg.cn/20210610194616555.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# cglib动态代理
就是因为要用到cglib的jar包，所以叫**cglib动态代理**。

为什么要使用这个**cglib来实现这个动态代理**呢？因为spring框架要用。

具体的代码实现如下：
```java
目标对象类：
package com.sss.designPattern.proxy.dynamicProxy.cglbDynamicProxy;  
  
/** 
 * 被代理的类 
 * 目标对象类 
 */  
public class TargetObject {  
  
    /** 
     * 目标方法(即目标操作) 
     */  
    public void business() {  
        System.out.println("business");  
    }  
  
}  

拦截器类：
package com.sss.designPattern.proxy.dynamicProxy.cglbDynamicProxy;  
  
import net.sf.cglib.proxy.Enhancer;  
import net.sf.cglib.proxy.MethodInterceptor;  
import net.sf.cglib.proxy.MethodProxy;  
  
import java.lang.reflect.Method;  
  
/** 
 * 动态代理-拦截器 
 */  
public class MyInterceptor implements MethodInterceptor {  
    private Object target;//目标类  
  
    public MyInterceptor(Object target) {  
        this.target = target;  
    }  
  
    /** 
     * 返回代理对象 
     * 具体实现，暂时先不追究。 
     */  
    public Object createProxy() {  
        Enhancer enhancer = new Enhancer();  
        enhancer.setCallback(this);//回调函数  拦截器  
        //设置代理对象的父类,可以看到代理对象是目标对象的子类。所以这个接口类就可以省略了。  
        enhancer.setSuperclass(this.target.getClass());  
        return enhancer.create();  
    }  
  
    /** 
     * args 目标方法的参数 
     * method 目标方法 
     */  
    @Override  
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {  
        System.out.println("aaaaa");//切面方法a();  
        //。。。  
        method.invoke(this.target, objects);//调用目标类的目标方法  
        //。。。  
        System.out.println("bbbbb");//切面方法f();  
        return null;  
    }  
}  

测试类：
package com.sss.designPattern.proxy.dynamicProxy.cglbDynamicProxy;  
  
public class MainTest {  
    public static void main(String[] args) {  
        //目标对象  
        TargetObject target = new TargetObject();  
        //拦截器  
        MyInterceptor myInterceptor = new MyInterceptor(target);  
        //代理对象，调用cglib系统方法自动生成  
        //注意：代理类是目标类的子类。  
        TargetObject proxyObj = (TargetObject) myInterceptor.createProxy();  
        proxyObj.business();  
    }  
}  
```
区别：
首先从文件数上来说，cglib比jdk实现的少了个接口类。因为cglib返回的代理对象是目标对象的子类。而jdk产生的代理对象和目标对象都实现了一个公共接口。

动态代理分为两种：  
   *  jdk的动态代理  
      *  代理对象和目标对象实现了共同的接口  
      *  拦截器必须实现InvocationHanlder接口  
  
   *  cglib的动态代理  
      *  代理对象是目标对象的子类  
      *  拦截器必须实现MethodInterceptor接口  
      *  hibernate中session.load采用的是cglib实现的  

> 参考
> - https://blog.csdn.net/zcc_0015/article/details/22695647