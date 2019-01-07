
# JDK动态代理
## 实例
jdk中实现**InvocationHandler**接口的类就是个**拦截器类**，还使用了些反射的相关概念。
假如写了个请求到action，经过拦截器，然后才会到action。

- **拦截器的作用**
控制目标对象的目标方法的执行。拦截器就像一个过滤网，一层层的过滤，只要满足一定条件，才能继续向后执行。

- 拦截器的具体操作步骤：
1.引入类：目标类和一些扩展方法相关的类。
2.赋值：调用构造函数给相关对象赋值
3.合并逻辑处理：在invoke方法中把所有的逻辑结合在一起。最终决定目标方法是否被调用。

下面看具体的代码实例：
```java
目标接口类：
package com.sss.designPattern.proxy.dynamicProxy.jdkDynamicProxy;  
  
/** 
 * 目标接口： 
 * 包含目标方法的声明 
 */  
public interface TargetInterface {  
    /** 
     * 目标方法 
     */  
    void business();  
}  

目标类：
package com.sss.designPattern.proxy.dynamicProxy.jdkDynamicProxy;  
  /** 
 * 被代理的类 
 * 目标对象类 
 * 实现目标接口. 
 * 继而实现目标方法。 
 */  
public class TargetObject implements TargetInterface {  
  
    /** 
     * 目标方法(即目标操作) 
     */  
    @Override  
    public void business() {  
        System.out.println("business");  
    }  
  
}  

拦截器：
package com.sss.designPattern.proxy.dynamicProxy.jdkDynamicProxy;  
  
import java.lang.reflect.InvocationHandler;  
import java.lang.reflect.Method;  
  
/** 
 * 动态代理-拦截器 
 */  
public class MyInterceptor implements InvocationHandler {  
    private Object target;//目标类  
  
    public MyInterceptor(Object target) {  
        this.target = target;  
    }  
  
    /** 
     * args 目标方法的参数 
     * method 目标方法 
     */  
    @Override  
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {  
        System.out.println("aaaaa");//切面方法a();  
        //。。。  
        method.invoke(this.target, args);//调用目标类的目标方法  
        //。。。  
        System.out.println("bbbbb");//切面方法f();  
        return null;  
    }  
}  

具体通过调用代理对象，来调用目标对象的目标方法的具体测试：
[java] view plain copy
package com.sss.designPattern.proxy.dynamicProxy.jdkDynamicProxy;  
  
import java.lang.reflect.Proxy;  
  
public class MainTest {  
    public static void main(String[] args) {  
        //目标对象  
        TargetObject target = new TargetObject();  
        //拦截器  
        MyInterceptor myInterceptor = new MyInterceptor(target);  
  
        /* 
         *  Proxy.newProxyInstance参数： 
         *  1、目标类的类加载器 
         *  2、目标类的所有的接口 
         *  3、拦截器 
         */  
        //代理对象，调用系统方法自动生成  
        TargetInterface proxyObj = (TargetInterface) Proxy.newProxyInstance(target.getClass().getClassLoader(), target.getClass().getInterfaces(), myInterceptor);  
        proxyObj.business();  
    }  
}  
```
看完代码实例，要**对这个动态代理进一步理解，要考虑到以下的问题。
1、代理对象是由谁产生的？**
JVM，不像上次的静态代理，我们自己得new个代理对象出来。
**2、代理对象实现了什么接口？**
实现的接口是目标对象实现的接口。
同静态代理中代理对象实现的接口。那个继承关系图还是相同的。
代理对象和目标对象都实现一个共同的接口。就是这个接口。
所以Proxy.newProxyInstance()方法返回的类型就是这个接口类型。
**3、代理对象的方法体是什么？**
代理对象的方法体中的内容就是拦截器中invoke方法中的内容。所有代理对象的处理逻辑，控制是否执行目标对象的目标方法。都是在这个方法里面处理的。
**4、拦截器中的invoke方法中的method参数是在什么时候赋值的？**
在客户端，代理对象调用目标方法的时候，此实例中为：proxyObj.business()；实际上进入的是拦截器中的invoke方法，这个时候
，拦截器中的invoke方法中的method参数会被赋值。

**最后，为啥这个方式叫做jdk动态代理呢？**
因为这个动态代理对象是用jdk的相关代码生成的，所以这个叫**jdk动态代理**。
后面的cglib动态代理，就是因为要用到cglib的jar包，所以才叫**cglib动态代理**。

了解了一个，那么另一个也就差不多啦。就继续往下看吧。

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
[java] view plain copy
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

区别：
首先从文件数上来说，cglib比jdk实现的少了个接口类。因为cglib返回的代理对象是目标对象的子类。而jdk产生的代理对象和目标对象都实现了一个公共接口。


```
动态代理分为两种：  
   *  jdk的动态代理  
      *  代理对象和目标对象实现了共同的接口  
      *  拦截器必须实现InvocationHanlder接口  
  
   *  cglib的动态代理  
      *  代理对象是目标对象的子类  
      *  拦截器必须实现MethodInterceptor接口  
      *  hibernate中session.load采用的是cglib实现的  
