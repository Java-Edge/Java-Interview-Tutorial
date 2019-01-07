# 1 前言
**实体是领域模型中的领域对象。**

传统开发人员总将关注点放在数据，而不是领域。因为在软件开发中，DB占据主导地位。首先考虑的是数据的属性(即数据库的列)和关联关系(外键关联)，而不是富有行为的领域概念。导致将数据模型直接反映在对象模型，那些表示领域模型的实体(Entity)被包含了大量getter/setter。虽然在实体模型中加入getter/setter并非大错， 但这不是DDD的做法。

由于团队成员起初过于强调实体的作用却忽视了值对象。受到DB和持久化框架影响，实体被该团队滥用，于是他们开始讨论如何避免大范围使用实体...

# 2 为什么使用实体
当我们需要考虑一个对象的个性特征，或需要区分不同对象时，就引入实体这个领域概念。

一个实体是一个**唯一**的东西，可以在一段时间内持续变化。
这些对象重要的不是属性，而是其延续性和标识，会跨越甚至超出软件生命周期。

也正是 **唯一身份标识和可变性(mutability)** 特征将实体对象区别于值对象。

实体建模并非总是完美方案。很多时候，一个领域概念应该建模成值对象，而非实体对象。这意味着DDD并不总能满足业务需求，开发CRUD软件系统时可能更适用。
若将CRUD应用在错误的系统——那些更复杂的，需采用DDD的系统一一就有我们后悔的了。由于只从数据出发，CRUD系统是不能创建出好的业务模型的。

在可以使用DDD时，我们会将数据模型转变为实体模型。
> 通过标识区分对象，而非属性，此时应将标识作为主要的模型定义。同时保持简单类定义，关注对象在生命周期中的连续性和唯一标识性。不应该通过对象的状态形式和历史来区分不同的实体对象……对于什么是相同的东西，模型应该给出定义。

那么如何正确地使用和设计实体？

# 3 唯一标识
在实体设计早期，关注能体现实体身份唯一性的主要属性和行为及如何查询实体，忽略次要的属性和行为。
> 设计实体时，首先考虑实体的本质特征，特别是实体的唯一标识和对实体的查找，而不是一开始便关注实体的属性和行为。只有在对实体的本质特征有用的情况下，才加入相应的属性和行为［Evans, p.93］。

找到多种能够实现唯一标识性的方式，同时考虑如何在实体生命周期内维持唯一性。
实体的唯一标识不见得一定有助对实体的查找和匹配。将唯一标识用于实体匹配通常取决于标识的可读性。
比如，若系统提供根据人名查找功能，但此时一个Person实体的唯一标识可能不是人名，因为重名情况很多。若某系统提供根据公司税号的查找功能，税号便可作为Company实体的唯一标识。

值对象可用于存放实体的唯一标识。值对象是不变(immutable)的，这就保证了实体身份的稳定性，并且与身份标识相关的行为也可得到集中处理。便可避免将身份标识相关的行为泄漏到模型的其他部分或客户端中去。

## 3.1 创建实体身份标识的策略
通常来说，每种技术方案都存在副作用。比如将关系型DB用于对象持久化时，这样的副作用将泄漏到领域模型。创建前需考虑标识生成的时间、关系型数据的引用标识和ORM在标识创建过程中的作用等，还会考虑如何保证唯一标识的稳定性。

- 详情参见
[DDD领域驱动设计实战 - 创建实体身份标识的常用策略](https://javaedge.blog.csdn.net/article/details/108899385)

## 3.2 标识稳定性
绝大多数场景不应修改实体的唯一标识，可在实体的整个生命周期中保持标识的稳定性。

可通过一些简单措施确保实体标识不被修改。可将标识的setter方法向用户隐藏。也可在setter方法种添加逻辑以确保标识在已经存在的情况下不会再被更新，比如可使用一些断言：
- `username`属性是`User`实体的领域标识，该属性只能进行一次修改，并且只能在User对象内修改。setter方法`setUsername`实现了自封装性， 且对客户端不可见。当实体的public方法自委派给该setter方法时，该方法将检查`username`属性，看是否已被赋值。若是，表明该User对象的领域标识已经存在，程序将抛异常。
![](https://img-blog.csdnimg.cn/20201002034914322.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_25,color_FFFF00,t_70#pic_center)
这个setter方法并不会阻碍Hibernate重建对象，因对象在创建时，它的属性都是使用默认值，且采用无参构造器，因此`username`属性的初始值为null。然后，Hibernate将调用setter方法，由于username属性此时为null，该 setter方法得以正确地执行，username属性也将被赋予正确的标识值。



# 4 各种状态的实体

DDD的不同设计过程，实体的形态也不同。

## 4.1 业务形态

在战略设计时，实体是领域模型的一个重要对象。领域模型中的实体是多个属性、操作或行为的载体。
事件风暴中，可以根据命令、操作或者事件，找出产生这些行为的业务实体对象，进而按业务规则将依存度高和业务关联紧密的多个实体对象和值对象进行聚类，形成聚合。
**实体和值对象是组成领域模型的基础单元。**

## 4.2 代码形态
实体的表现形式是实体类，该类包含了实体的属性和方法，通过这些方法实现实体自身的业务逻辑。在DDD里，这些实体类通常采用充血模型，与该实体相关的所有业务逻辑都在实体类的方法中实现，跨多个实体的领域逻辑则在领域服务中实现。

## 4.3 运行形态
实体以DO（领域对象）形式存在，每个实体对象都有唯一ID。可以对实体做多次修改，所以一个实体对象可能和它之前状态存在较大差异。但它们**拥有相同的身份标识(identity)**，所以始终是同一实体。

比如商品是商品上下文的一个实体，通过唯一的商品ID标识，不管这商品的数据（比如价格）如何变，商品ID不会变，始终是同一商品。

## 4.4 数据库形态
DDD是先构建领域模型，针对实际业务场景构建实体对象和行为，再将实体对象映射到数据持久化对象。

在领域模型映射到数据模型时，一个实体可能对应0个、1个或者多个数据库持久化对象。大多数情况下实体与持久化对象是一对一。在某些场景中，有些实体只是暂驻静态内存的一个运行态实体，它不需要持久化。比如，基于多个价格配置数据计算后生成的折扣实体。

有些复杂场景，实体与持久化对象可能是一对多或多对一：
- 一对多：用户user与角色role两个持久化对象可生成权限实体，一个实体对应两个持久化对象
- 多对一：有时为避免DB的联表查询，会将客户信息customer和账户信息account两类数据保存至同一张数据库表，客户和账户两个实体可根据需要从一个持久化对象中生成


> 探索实体的本质
一开始团队便遇到陷阱，在Java代码中建模大量实体-关系。将太多关注点放在数据库、表、列和对象映射上。导致所创建 的模型实际上只是含有大量getter/setter的贫血领域模型。他们应该在DDD 上有更多的思考。那时正值他们将安全处理机制从核心域中分离之际，他们学到了如何使用通用语言来更好地辅助建模。
但如果我们认为对象就是一组命名的类和在类上定义的操作，除此之外并不包含其他内容，那就错了。在领域模型中还可包含很多其他内容。团队讨论和规范文档可以帮助我们创建更有意义的通用语言。到最后，团队可以直接使用通用语言来进行对话,而此时的模型也能够非常准确地反映通用语言。
如果一些特定的领域场景会在今后继续使用，这时可以用一个轻量的文档将它们记录下来。简单形式的通用语言可以是一组术语和一些简单的用例场景。 但是，如果我们就此认为通用语言只包含术语和用例场景，那么我们又错了。在最后，通用语言应该直接反映在代码中，而要保持设计文档的实时更新是非常困难的，甚至是不可能的。

# 5 创建实体
新建一个实体时，我们总是期望通过构造器就能初始化足够多的实体状态，因为这有助于表明该实体的身份，也可帮助客户端更容易查找该实体。

在使用及早生成唯一标识的策略时，构造器至少需接受一个唯一标识参数。若还有可能通过其他方式查找实体，比如名字或描述信息，那应该将这些参数也一并传给构造器。

有时一个实体维护一或多个不变条件(Invariant，在整个实体生命周期中都必须保持事务一致性的一种状态) 。
> 不变条件主要是聚合所关注的，但由于聚合根通常也是实体，故这里我们也稍作提及。

如果实体的不变条件要求该实体所包含的对象都不能为null状态，或者由其他状态计算所得，那么这些状态需要作为参数传递给构造器。

```java
public class User extends Entity {
	...
	// 每一个User对象都必须包含tenantld、username, password和person属性。
	// 即在User对象得到正确实例化后，这些属性不能为null
	// 由User对象的构造器和实例变量对应的setter方法保证这点
	protected User (Tenantld aTenantld, String aUsername,
		String aPassword, Person aPerson) (
		this();
		this.setPassword(aPassword);
		this.setPerson(aPerson);
		this.setTenantld(aTenantld);
		this.setUsername(aUsername);
		this.initialize();
	}
	...
	protected void setPassword(String aPassword) { 
		if (aPassword == null) {
			throw new 11legalArgumentException(
				"The password may not be set to null.");
		)
		this.password = aPassword;
	)
	
	protected void setPerson(Person aPerson) (
		if (aPerson == null) ( 
			throw new IllegalArgumentException(
			"The person may not be set to null.");
		}
		this.person = aPerson;
	}
	
	protected void setTenantld(Tenantld aTenantld) ( 
		if (aTenantld == null)(
			throw new IllegalArgumentException(
				"The tenantld may not be set to null."); }
		this.tenantld = aTenantld;
	}
	protected void setUsername(String aUsername) (
		if (this.username != null) (
			throw new IIlegalStateException(
				"The username may not be changed.n);
		}
		if (aUsername == null) ( 
			throw new IllegalArgumentException(
				"The username may not be set to null."); 
		}
		this.username = aUsername;
	}	
```
User对象展示了一种自封装性。在构造器对实例变量赋值时，它把操作委派给了实例变量所对应的setter方法，这样便保证了实例变量的自封装性。实例变量的自封装性使用setter方法来决定何时给实例变量赋值。
每个setter方法都“代表着实体”对所传进的参数做非null检查，这里的断言称为守卫(Guard)。setter方法的自封装性技术可能会变得非常复杂。对于那些非常复杂的创建实体的情况，我们可以使用工厂。
在上面的例子中，你是否注意到User对象的构造函数被声明为 `protected`? Tenant实体即为User实体的工厂也是同一个模块中唯一能够访问User 构造函数的类。这样一来，只有Tenant能够创建User实例。

```java
public class Tenant extends Entity {
	// 该工厂简化对User的创建，同时保证了Tenantld在User和Person对象中的正确性
	// 该工厂能够反映通用语言。
	public User registerUser(
		String aUsername,
		String aPassword,
		Person aPerson) {
		aPerson.setTenantld(this.tenantld());
		
		User user = new User(this.tenantld(), aUsername, aPassword, aPerson);
		return user;
}
```
参考
- https://tech.meituan.com/2017/12/22/ddd-in-practice.html
- 《实现领域驱动设计》
- 实体和值对象：从领域模型的基础单元看系统设计