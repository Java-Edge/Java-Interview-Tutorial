你一定经常见到一个两三千行的 controller 类，类之所以发展成如此庞大，有如下原因：
- 长函数太多
- 类里面有特别多的字段和函数
量变引起质变，可能每个函数都很短小，但数量太多
#  1 程序的modularity
你思考过为什么你不会把all code写到一个文件？因为你的潜意识里明白：
- 相同的功能模块无法复用
- 复杂度远超出个人理解极限

一个人理解的东西是有限的，在国内互联网敏捷开发环境下，更没有人能熟悉所有代码细节。

解决复杂的最有效方案就是分而治之。所以，各种程序设计语言都有自己的模块划分（**modularity**）方案：
- 从最初的按文件划分
- 到后来使用OO按类划分

开发者面对的不再是细节，而是模块，模块数量显然远比细节数量少，理解成本大大降低，开发效率也提高了，再也不用 996， 每天都能和妹纸多聊几句了。

modularity，本质就是分解问题，其背后原因，就是个人理解能力有限。

> 说这么多我都懂，那到底怎么把大类拆成小类？

# 2 大类是怎么来的？
## 2.1 职责不单一
**最容易产生大类的原因**。

CR一段代码：
![](https://img-blog.csdnimg.cn/6544c51823ed4e45a1182220fae18d03.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

该类持有大类的典型特征，包含一坨字段：这些字段都缺一不可吗？
- userId、name、nickname等应该是一个用户的基本信息
- email、phoneNumber 也算是和用户相关联
很多应用都提供使用邮箱或手机号登录方式，所以，这些信息放在这里，也能理解
- authorType，作者类型，表示作者是签约作者还是普通作者，签约作者可设置作品的付费信息，但普通作者无此权限
- authorReviewStatus，作者审核状态，作者成为签约作者，需要有一个申请审核的过程，该状态字段就是审核状态
- editorType，编辑类型，编辑可以是主编，也可以是小编，权限不同

这还不是 User 类的全部。但只看这些内容就能看出问题：
- 普通用户既不是作者，也不是编辑
作者和编辑这些相关字段，对普通用户无意义
- 对那些成为作者的用户，编辑的信息意义不大
因为作者不能成为编辑。编辑也不会成为作者，作者信息对成为编辑的用户无意义

总有一些信息对一部分人毫无意义，但对另一部分人又必需。出现该问题的症结在于只有“一个”用户类。

普通用户、作者、编辑，三种不同角色，来自不同业务方，关心的是不同内容。仅因为它们都是同一系统的用户，就把它们都放到一个用户类，导致任何业务方的需求变动，都会反复修改该类，**严重违反单一职责原则**。
所以破题的关键就是职责拆分。

虽然这是一个类，但它把不同角色关心的东西都放在一起，就愈发得臃肿了。

只需将不同信息拆分即可：
```java
public class User {
  private long userId;
  private String name;
  private String nickname;
  private String email;
  private String phoneNumber;
  ...
}

public class Author {
  private long userId;
  private AuthorType authorType;
  private ReviewStatus authorReviewStatus;
  ...
}

public class Editor {
  private long userId;
  private EditorType editorType;
  ...
}
```
拆出 Author、Editor 两个类，将和作者、编辑相关的字段分别移至这两个类里。
这俩类分别有个 userId 字段，用于关联该角色和具体用户。
## 2.2 字段未分组
有时觉得有些字段确实都属于某个类，结果就是，这个类还是很大。

之前拆分后的新 User 类：
```java
public class User {
  private long userId;
  private String name;
  private String nickname;
  private String email;
  private String phoneNumber;
  ...
}
```
这些字段应该都算用户信息的一部分。但依然也不算是个小类，因为该类里的字段并不属于同一种类型的信息。
如，userId、name、nickname算是用户的基本信息，而 email、phoneNumber 则属于用户的联系方式。

需求角度看，基本信息是那种一旦确定一般就不变的内容，而联系方式则会根据实际情况调整，如绑定各种社交账号。把这些信息都放到一个类里面，类稳定程度就差点。

据此，可将 User 类的字段分组：
```java
public class User {
  private long userId;
  private String name;
  private String nickname;
  private Contact contact;
  ...
}

public class Contact {
  private String email;
  private String phoneNumber;
  ...
}
```
引入一个 Contact 类（联系方式），把 email 和 phoneNumber 放了进去，后面再有任何关于联系方式的调整就都可以放在这个类里面。
此次调整，把不同信息重新组合，但每个类都比原来要小。

前后两次拆分到底有何不同？
- 前面是根据职责，拆分出不同实体
- 后面是将字段做了分组，用类把不同的信息分别封装

大类拆解成小类，本质上是个设计工作，依据单一职责设计原则。

若把大类都拆成小类，类的数量就会增多，那人们理解的成本是不是也会增加呢？
**这也是很多人不拆分大类的借口。**

各种程序设计语言中，本就有如包、命名空间等机制，将各种类组合在一起。在你不需要展开细节时，面对的是一个类的集合。
再进一步，还有各种程序库把这些打包出来的东西再进一步打包，让我们只要面对简单的接口，而不必关心各种细节。

软件正这样层层封装构建出来的。