# Spring框架使用了哪些设计模式

## 1 简单工厂模式

当A对象需调用B对象的方法，需在A中new一个B实例，这叫硬编码耦合，一旦需求变更，如使用C类代替B时，就要改写A类的方法。假如应用有上千个类硬编码耦合了B，改得动吗？
于是有简单工厂模式，即静态工厂方法：由一个工厂类根据传入参数，动态决定创建哪个产品类。

BeanFactory，Spring IOC容器中的一个核心接口，简单工厂模式的体现，定义如下：

```java
public interface BeanFactory {

	String FACTORY_BEAN_PREFIX = "&";

	Object getBean(String name) throws BeansException;

	<T> T getBean(String name, Class<T> requiredType) throws BeansException;

	Object getBean(String name, Object... args) throws BeansException;

	<T> T getBean(Class<T> requiredType) throws BeansException;

	<T> T getBean(Class<T> requiredType, Object... args) throws BeansException;

	<T> ObjectProvider<T> getBeanProvider(Class<T> requiredType);

	<T> ObjectProvider<T> getBeanProvider(ResolvableType requiredType);

	boolean containsBean(String name);

	boolean isSingleton(String name) throws NoSuchBeanDefinitionException;

	boolean isPrototype(String name) throws NoSuchBeanDefinitionException;

	boolean isTypeMatch(String name, ResolvableType typeToMatch) throws NoSuchBeanDefinitionException;

	boolean isTypeMatch(String name, Class<?> typeToMatch) throws NoSuchBeanDefinitionException;

	@Nullable
	Class<?> getType(String name) throws NoSuchBeanDefinitionException;

	@Nullable
	Class<?> getType(String name, boolean allowFactoryBeanInit) throws NoSuchBeanDefinitionException;

	String[] getAliases(String name);
}
```

可通过其具体实现类（如ClassPathXmlApplicationContext）获取Bean：

```java
BeanFactory bf = new ClassPathXmlApplicationContext("spring.xml");
User userBean = (User) bf.getBean("userBean");
```

使用者无需自己new，而是通过工厂类的方法getBean获取对象实例，这就是简单工厂模式，只不过Spring是用反射创建Bean。

## 2 工厂方法模式

简单工厂中，由工厂类进行所有逻辑判断、实例创建。

若不想在工厂类中判断，可为不同产品提供不同工厂，不同工厂生产不同产品，每个工厂都只对应一个相应对象，即工厂方法模式。

Spring FactoryBean，工厂Bean：

```java
package org.springframework.beans.factory;

import org.springframework.lang.Nullable;

public interface FactoryBean<T> {
    @Nullable
    T getObject() throws Exception;

    @Nullable
    Class<?> getObjectType();

    default boolean isSingleton() {
        return true;
    }
}
```

定义一个类UserFactoryBean实现FactoryBean接口，主要是在getObject方法里new一个User对象。
这样通过getBean(id) 获得的是该工厂所产生的User实例，而非UserFactoryBean本身实例：

```java
BeanFactory bf = new ClassPathXmlApplicationContext("user.xml");
User userBean = (User) bf.getBean("userFactoryBean");
```

## 3 单例模式

一个类在整个系统运行过程中，只允许产生一个实例。

Spring Bean默认单例模式。Spring通过单例注册表（HashMap）实现：

```java
public class DefaultSingletonBeanRegistry {
    
    // 保存各种单实例对象
    private final Map<String, Object> singletonObjects = new ConcurrentHashMap<String, Object>;

    protected Object getSingleton(String beanName) {
    // 先从Map拿Object
    Object singletonObject = singletonObjects.get(beanName);
    
    // 若没拿到,则通过反射创建一个对象实例，并添加到HashMap中
    if (singletonObject == null) {
      singletonObjects.put(beanName,
                           Class.forName(beanName).newInstance());
   }
   
   // 返回对象实例
   return singletonObjects.get(beanName);
  }
}
```

## 4 代理模式

它与被代理对象实现相同接口，客户端必须通过代理才能与被代理的目标类进行交互，而代理一般在交互的过程中（交互前后），进行某些特定处理，比如在调用这个方法前做前置处理，调用这个方法后做后置处理。

### 好处

可以在目标对象业务功能的基础上添加一些公共的逻辑，比如我们想给目标对象加入日志、权限管理和事务控制等功能，我们就可以使用代理类来完成，而没必要修改目标类，从而使得目标类保持稳定。

符合OCP，不随意修改别人写好的代码或方法。

代理又分为

### 静态代理

定义接口，被代理对象（目标对象）与代理对象（Proxy)一起实现相同接口：

```java
// 抽象接口
public interface IStudentDao {
    void save();
}

// 目标对象
public class StudentDao implements IStudentDao {
    public void save() {
        System.out.println("保存成功");
    }
}

// 代理对象
public class StudentDaoProxy implements IStudentDao{
    // 持有目标对象的引用
    private IStudentDao target;
    public StudentDaoProxy(IStudentDao target){
        this.target = target;
    }

    // 在目标功能对象方法的前后加入事务控制
    public void save() {
        System.out.println("开始事务");
        target.save();//执行目标对象的方法
        System.out.println("提交事务");
    }
}

public static void main(String[] args) {
    //创建目标对象
    StudentDao target = new StudentDao();

    //创建代理对象,把目标对象传给代理对象,建立代理关系
    StudentDaoProxy proxy = new StudentDaoProxy(target);
   
    //执行的是代理的方法
    proxy.save();
}
```

### 动态代理

Spring AOP采用动态代理，即代理类在程序运行时由JVM动态创建。
静态代理的例子中，代理类（StudentDaoProxy）是自定义的，在程序运行之前已编译完成。

而动态代理，代理类不是在Java代码中定义，而是运行时根据我们在Java代码中的“指示”动态生成。

#### 如何“指示”JDK去动态生成代理类

java.lang.reflect包提供：

- Proxy类
- InvocationHandler接口

通过该类和接口可生成动态代理对象：

##### ① 定义一个InvocationHandler类

将需扩展的逻辑集中放到该类。如下案例模拟了添加事务控制：

```java
public class MyInvocationHandler implements InvocationHandler {

    private Object obj;

    public MyInvocationHandler(Object obj) {
        this.obj = obj;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {

        System.out.println("开始事务");
        Object result = method.invoke(obj, args);
        System.out.println("开始事务");
        
        return result;
    }
}
```

##### ② 使用Proxy.newProxyInstance动态创建代理对象

```java
public static void main(String[] args) {
  // 创建目标对象StudentDao
  IStudentDao stuDAO = new StudentDao();
  
  // 创建MyInvocationHandler对象
  InvocationHandler handler = new MyInvocationHandler(stuDAO);
  
  // 使用Proxy.newProxyInstance动态的创建代理对象stuProxy
  IStudentDao stuProxy = (IStudentDao) 
 Proxy.newProxyInstance(stuDAO.getClass().getClassLoader(), stuDAO.getClass().getInterfaces(), handler);
  
  //动用代理对象的方法
  stuProxy.save();
}
```

动态代理优势在于方便对代理类的函数进行统一处理，不用修改每个代理类中的方法。

Spring实现了通过动态代理对类进行方法级别的切面增强，即动态生成目标对象的代理类，并在代理类的方法中设置拦截器，通过执行拦截器中的逻辑增强了代理方法的功能，从而实现AOP。