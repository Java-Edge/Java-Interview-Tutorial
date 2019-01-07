尽管不像SOLID、KISS、DRY原则一样家喻户晓，但它却非常实用。
- 啥是“高内聚、松耦合”？
- 如何利用迪米特法则来实现“高内聚、松耦合”？
- 有哪些代码设计是明显违背迪米特法则的？对此又该如何重构？

# 何为“高内聚、松耦合”？
“高内聚、松耦合”，能有效地提高代码可读性、可维护性，缩小功能改动导致的代码改动范围。
很多设计原则都以实现代码“高内聚、松耦合”为目的，比如：
- 单一职责原则
- 基于接口而非实现编程

“高内聚、松耦合”是个较通用的设计思想，可用来指导不同粒度代码的设计与开发，比如系统、模块、类，甚至是函数，也可以应用到不同的开发场景中，比如微服务、框架、组件、类库等。

本文以“类”作为这个设计思想的应用对象来讲解。

- “高内聚”用来指导类本身的设计
- “松耦合”用来指导类与类之间依赖关系的设计

这两者并非完全独立不相干。高内聚有助于松耦合，松耦合又需要高内聚的支持。
## 什么是“高内聚”？
- 相近功能，应放到同一类
- 不相近的功能，不要放到同一类

相近的功能往往会被同时修改，放到同一类中，修改会比较集中，代码容易维护。

单一职责原则就是实现代码高内聚非常有效的设计原则。
## 什么是“松耦合”？
在代码中，类与类之间的依赖关系简单清晰。

即使两个类有依赖关系，一个类的代码改动不会或者很少导致依赖类的代码改动。依赖注入、接口隔离、基于接口而非实现编程及迪米特法则，都是为实现代码松耦合。

## “内聚”和“耦合”的关系
图中左边部分的代码结构是“高内聚、松耦合”；右边部分正好相反，是“低内聚、紧耦合”。
![](https://img-blog.csdnimg.cn/474e839624224ad0b7b35f9f216ab43e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
## 左半部分的代码设计
类的粒度较小，每个类的职责都比较单一。相近的功能都放到了一个类中，不相近的功能被分割到了多个类中。
这样类更加独立，代码的内聚性更好。
因为职责单一，所以每个类被依赖的类就会比较少，代码低耦合。
一个类的修改，只会影响到一个依赖类的代码改动。
只需要测试这一个依赖类是否还能正常工作即可。

## 右边部分的代码设计
类粒度比较大，低内聚，功能大而全，不相近的功能放到了一个类中。
导致很多其他类都依赖该类。
修改这个类的某功能代码时，会影响依赖它的多个类。
我们需要测试这三个依赖类，是否还能正常工作。这也就是所谓的“牵一发而动全身”。

高内聚、低耦合的代码结构更加简单、清晰，相应地，在可维护性和可读性上确实要好很多。

# 迪米特法则
Law of Demeter，LOD，这个名字看不出这个原则讲的是什么。
它还有另外一个名字，叫作最小知识原则，The Least Knowledge Principle：
Each unit should have only limited knowledge about other units: only units “closely” related to the current unit. Or: Each unit should only talk to its friends; Don’t talk to strangers.
每个模块（unit）只应该了解那些与它关系密切的模块（units: only units “closely” related to the current unit）的有限知识（knowledge）。或者说，每个模块只和自己的朋友“说话”（talk），不和陌生人“说话”（talk）。

结合经验，定义描述中的“模块”替换成“类”：

> 不该有直接依赖关系的类之间，不要有依赖；
> 有依赖关系的类之间，尽量只依赖必要的接口（也就是定义中的“有限知识”）。

可见，迪米特法则包含前后两部分，讲的是两件事情，我用两个实战案例分别来解读一下。
# 案例
**不该有直接依赖关系的类之间，不要有依赖。**

实现了简化版的搜索引擎爬取网页，包含如下主要类：
- NetworkTransporter，负责底层网络通信，根据请求获取数据
![](https://img-blog.csdnimg.cn/461d68b211254631adedf747ee28f87d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
- HtmlDownloader，通过URL获取网页
![](https://img-blog.csdnimg.cn/27ed63b4a4f0439095e8f12a1785de40.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)


- Document，表示网页文档，后续的网页内容抽取、分词、索引都是以此为处理对象
![](https://img-blog.csdnimg.cn/7ad339dd22614416b56fe15e2d96933c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
### 分析
这段代码虽然“能用”，但不够“好用”，有很多设计缺陷：
- NetworkTransporter，作为一个底层网络通信类，我们希望它的功能尽可能通用，而不只是服务于下载HTML。所以，不应该直接依赖太具体的发送对象HtmlRequest。
这点，NetworkTransporter类的设计违背迪米特法则，依赖了不该有直接依赖关系的HtmlRequest类。

应该如何重构？
假如你现在要去买东西，你肯定不会直接把钱包给收银员，让收银员自己从里面拿钱，而是你从钱包里把钱拿出来交给收银员。
HtmlRequest对象相当于钱包，HtmlRequest里的address和content对象就相当于钱。
应该把address和content交给NetworkTransporter，而非直接把HtmlRequest交给NetworkTransporter：
![](https://img-blog.csdnimg.cn/c1c2dbc6d3e64fd681373fa854734df2.png)

HtmlDownloader类的设计没问题。不过，因为修改了NetworkTransporter#send()，而这个类用到了send()，所以要做相应修改，修改后的代码如下所示：
```java
public class HtmlDownloader {

  private NetworkTransporter transporter;
  
  public Html downloadHtml(String url) {
    HtmlRequest htmlRequest = new HtmlRequest(url);
    Byte[] rawHtml = transporter.send(
      htmlRequest.getAddress(), htmlRequest.getContent().getBytes());
    return new Html(rawHtml);
  }
}
```

Document的问题较多：
- 构造器中的`downloader.downloadHtml()`逻辑复杂，耗时长，不应放到构造器，会影响代码的可测试性
- HtmlDownloader对象在构造器通过new来创建，违反了基于接口编程，也影响代码可测试性
- 业务含义上说，Document网页文档没必要依赖HtmlDownloader类，违背迪米特法则

问题虽多，但修改简单：
```java
public class Document {

  private Html html;
  private String url;
  
  public Document(String url, Html html) {
    this.html = html;
    this.url = url;
  }
  // ...
}

// 工厂方法创建Document
public class DocumentFactory {
  private HtmlDownloader downloader;
  
  public DocumentFactory(HtmlDownloader downloader) {
    this.downloader = downloader;
  }
  
  public Document createDocument(String url) {
    Html html = downloader.downloadHtml(url);
    return new Document(url, html);
  }
}
```
## 序列化
**有依赖关系的类之间，尽量只依赖必要的接口。**

Serialization类负责对象的序列化和反序列化。
```java
public class Serialization {

  public String serialize(Object object) {
    String serializedResult = ...;
    //...
    return serializedResult;
  }
  
  public Object deserialize(String str) {
    Object deserializedResult = ...;
    //...
    return deserializedResult;
  }
}
```
单看类的设计，没问题。
但若把它放到特定应用场景，假设项目中的有些类只用到序列化操作，而另一些类只用到反序列化。
那么，基于 **有依赖关系的类之间，尽量只依赖必要的接口**，只用到序列化操作的那部分类不应依赖反序列化接口，只用到反序列化操作的那部分类不应依赖序列化接口。

据此，应将Serialization类拆分为两个更小粒度的类：
- 一个只负责序列化（Serializer类）
- 一个只负责反序列化（Deserializer类）

拆分后，使用序列化操作的类只需依赖Serializer类，使用反序列化操作的类依赖Deserializer类。
```java
public class Serializer {
  public String serialize(Object object) {
    String serializedResult = ...;
    ...
    return serializedResult;
  }
}

public class Deserializer {
  public Object deserialize(String str) {
    Object deserializedResult = ...;
    ...
    return deserializedResult;
  }
}
```
尽管拆分后的代码更能满足迪米特法则，但却违背高内聚。高内聚要求相近功能放到同一类中，这样可以方便功能修改时，修改的地方不至于太散乱。
针对本案例，若业务要求修改了序列化实现方式，从JSON换成XML，则反序列化实现逻辑也要一起改。
在未拆分时，只需修改一个类。在拆分之后，却要修改两个类。这种设计思路的代码改动范围变大了！

既不想违背高内聚，也不想违背迪米特法则，怎么办？
引入两个接口即可：
```java
public interface Serializable {
  String serialize(Object object);
}

public interface Deserializable {
  Object deserialize(String text);
}

public class Serialization implements Serializable, Deserializable {

  @Override
  public String serialize(Object object) {
    String serializedResult = ...;
    ...
    return serializedResult;
  }
  
  @Override
  public Object deserialize(String str) {
    Object deserializedResult = ...;
    ...
    return deserializedResult;
  }
}

public class DemoClass_1 {
  private Serializable serializer;
  
  public Demo(Serializable serializer) {
    this.serializer = serializer;
  }
  //...
}

public class DemoClass_2 {
  private Deserializable deserializer;
  
  public Demo(Deserializable deserializer) {
    this.deserializer = deserializer;
  }
  //...
}
```

尽管还是要往DemoClass_1的构造器传入包含序列化和反序列化的Serialization实现类，但依赖的Serializable接口只包含序列化操作，DemoClass_1无法使用Serialization类中的反序列化接口，对反序列化操作无感知，就符合了迪米特法则的“依赖有限接口”。

实际上，上面的的代码实现思路，也体现“面向接口编程”，结合迪米特法则，可总结出：“基于最小接口而非最大实现编程”。

**新的设计模式和设计原则也就是在大量的实践中，针对开发痛点总结归纳出来的套路。**

## 多想一点
对于案例二的重构方案，你有啥不同观点？

整个类只包含序列化、反序列化俩操作，只用到序列化操作的使用者，即便能够感知到仅有的一个反序列化方法，问题也不大。
为了满足迪米特法则，将一个简单的类，拆出两个接口，是否有过度设计之嫌？

设计原则本身无对错，只有能否用对之说。不要为了应用设计原则而应用，具体问题具体分析。

对Serialization类，只包含两个操作，确实没太大必要拆成俩接口。
但若我们对Serialization类添加更多功能，实现更多更好用的序列化、反序列化方法，重新考虑该问题：
```java
public class Serializer { // 参看JSON的接口定义
  public String serialize(Object object) { //... }
  public String serializeMap(Map map) { //... }
  public String serializeList(List list) { //... }
  
  public Object deserialize(String objectString) { //... }
  public Map deserializeMap(String mapString) { //... }
  public List deserializeList(String listString) { //... }
}
```
这种场景下，第二种设计思路更好。因为基于之前的应用场景来说，大部分代码只用到序列化功能。对于这部分使用者，不必了解反序列化，而修改之后的Serialization类，反序列化的“知识”，从一个函数变成了三个。一旦任一反序列化操作有代码改动，我们都需要检查、测试所有依赖Serialization类的代码是否还能正常工作。为了减少耦合和测试工作量，我们应该按照迪米特法则，将反序列化和序列化的功能隔离开来。

# 总结
## 高内聚、松耦合
重要的设计思想，能够有效提高代码的可读性和可维护性，缩小功能改动导致的代码改动范围。“高内聚”用来指导类本身的设计，“松耦合”用来指导类与类之间依赖关系的设计。

所谓高内聚，就是指相近的功能应该放到同一个类中，不相近的功能不要放到同一类中。相近的功能往往会被同时修改，放到同一个类中，修改会比较集中。所谓松耦合指的是，在代码中，类与类之间的依赖关系简单清晰。即使两个类有依赖关系，一个类的代码改动也不会或者很少导致依赖类的代码改动。
## 迪米特法则

不该有直接依赖关系的类之间，不要有依赖；有依赖关系的类之间，尽量只依赖必要的接口。迪米特法则是希望减少类之间的耦合，让类越独立越好。每个类都应该少了解系统的其他部分。一旦发生变化，需要了解这一变化的类就会比较少。