# 代理模式（Proxy Pattern）

## 1 定义

为其他对象提供一种代理，以控制对这个对象的访问，代理对象在客户端和目标对象之间起到中介作用。

结构型模式。

在代理模式中，创建具有现有对象的一个代理对象，以便向外界提供功能接口。

## 2 解决痛点

在直接访问对象时带来的问题，如要访问的对象在远程机器。

有些对象由于某些原因，如：

- 对象创建开销很大
- 需安全控制
- 需进程外的访问

直接访问会给使用者或系统带来麻烦，就可在访问此对象时加上一个对此对象的访问层。

在不改变原始类（或叫被代理类）代码情况下，引入代理类，给原始类附加功能。代理模式常用在业务系统中开发一些非功能性需求，如：监控、统计、鉴权、限流、事务、幂等、日志。

## 3 何时使用

即适用场景。

保护、增强目标对象。

想在访问一个类时做一些控制。

如何解决：增加中间层。

关键代码：实现与被代理类组合。

## 4 实例

- Windows 里的快捷方式
- 猪八戒去找高翠兰结果是孙悟空变的，可以这样理解：把高翠兰的外貌抽象出来，高翠兰本人和孙悟空都实现了这个接口，猪八戒访问高翠兰的时候看不出来这个是孙悟空，所以说孙悟空是高翠兰代理类
- 买火车票不一定在火车站买，也可去代售点
- 一张支票或银行存单是账户中资金的代理。支票在市场交易中用来代替现金，并提供对签发人账号上资金的控制
- aop

## 5 优点

- 将代理对象与真实被调用的目标对象分离
- 降低系统耦合度，扩展性好
- 保护目标对象
- 增强目标对象

## 6 缺点

- 由于在客户端和真实主题之间增加代理对象，因此有些类型的代理模式可能会造成请求处理变慢
- 实现代理模式需要额外的工作，有些代理模式的实现非常复杂

## 7 按职责划分

1、远程代理
2、虚拟代理
3、Copy-on-Write 代理
4、保护（Protect or Access）代理
5、Cache代理
6、防火墙（Firewall）代理
7、同步化（Synchronization）代理
8、智能引用（Smart Reference）代理

## 8 模式对比

### V.S 适配器模式

- 适配器模式主要改变所考虑对象的接口
- 代理模式不能改变所代理类的接口

### V.S 装饰器模式

- 装饰器模式为增强功能
- 代理模式是为加以控制

### V.S 委派模式

委派就是说全权代理。代理只参与某环节，委派参与整个环节，委派可算是一个静态代理。

## 9 角色

- 抽象接口
  定义目标类及代理类的共同接口，这样在任何可以使用目标对象的地方都可以使用代理对象。
- 目标对象
  定义了代理对象所代表的目标对象，专注于业务功能的实现。
- 代理对象
  代理对象内部含有目标对象的引用，收到客户端的调用请求时，代理对象通常不会直接调用目标对象的方法，而是在调用之前和之后实现一些额外的逻辑。

## 10 案例 - 图片

创建一个 Image 接口和实现了 Image 接口的实体类。
ProxyImage 是个代理类，减少 RealImage 对象加载的内存占用。

ProxyPatternDemo 类使用 ProxyImage 来获取要加载的 Image 对象，并按需显示。

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/422060bbaaff2889a0f7e7a8fca6bfe2.jpeg)

抽象接口：

```java
public interface Image {
   void display();
}
```

目标对象：

```java
public class RealImage implements Image {
 
   private String fileName;
 
   public RealImage(String fileName){
      this.fileName = fileName;
      loadFromDisk(fileName);
   }
 
   @Override
   public void display() {
      System.out.println("Displaying " + fileName);
   }
 
   private void loadFromDisk(String fileName){
      System.out.println("Loading " + fileName);
   }
}
```

代理对象：

```java
public class ProxyImage implements Image {
 
   private RealImage realImage;
  
   private String fileName;
 
   public ProxyImage(String fileName){
      this.fileName = fileName;
   }
 
   @Override
   public void display() {
      if(realImage == null){
         realImage = new RealImage(fileName);
      }
      realImage.display();
   }
}
```

测试类：被请求时，使用 ProxyImage 获取 RealImage 类的对象：

```java
public class ProxyPatternDemo {
   
   public static void main(String[] args) {
      Image image = new ProxyImage("test_10mb.jpg");
 
      // 图像将从磁盘加载
      image.display(); 
      System.out.println("");
      // 图像不需要从磁盘加载
      image.display();  
   }
}
```

## 11 MyBatis案例

### 动态代理



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/2f2b3d0e517e1c983ad81d2df3218e2f.png)



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/a8fb0202e5ea44ed4e452a590771eb9e.png)