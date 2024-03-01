# 基于电商履约场景的 DDD 实战

## 介绍

DDD（领域驱动设计，Domain-Driven Design），是一种架构设计的思想，那么使用 DDD 和 MVC 两种架构思想设计出来的系统的区别就在于：

- MVC 是面向数据库思维设计的，代码混乱，后期不易维护
- DDD 是面向业务逻辑设计的，更易于维护，代码清晰易懂

现在 DDD 架构比较火，对于大型项目来说，通过 DDD 对不同业务进行界限划分，使得系统结构清晰，方法主流程清晰，而对于小型项目来说，如果过度使用 DDD 可能会导致不必要的复杂性

学习 DDD 一定要和 MVC 进行对比，因为我们平常用的最多的就是 MVC，那么面试的时候，面试官一定会问你，为什么要学习 DDD？DDD 和 MVC 有什么区别呢？这些东西，在学完 DDD 之后，一定要自己总结一下，要不然只能是稀里糊涂的了解 DDD！

**接下来会根据履约场景分别按照 DDD 和 MVC 思想写出对应的代码，来对比一下思想上的差异**



## DDD 和 MVC 对比

先说一下履约场景的简单业务流程，之后再来编写代码

**履约系统的作用**：在用户支付成功之后，通知了电商平台，通过履约系统来履行约定，也就是在用户支付成功后，履约系统去做一系列的操作，保证商家把商品发货给用户



接下来说一下履约系统的整个流程：

1. 履约系统收到用户支付成功后的订单
2. 根据订单，生成履约单
3. 预分仓：有多个发货仓库，先分配一个距离比较近的仓库
4. 风控拦截：对一些有风险的操作进行拦截，比如说刷单、黄牛、黑客等操作
5. 合并处理：将多个相同发货仓库的订单，合并到一起进行处理
6. 人工审核：人工进行审核一下，检查一下订单有没有问题
   1. 重分仓：如果发现不合理，重新分配一个仓库
7. 人工拣货，复核打包
8. 发货：物流揽件、物流运输、物流派件、物流签收



**接下来针对预分仓这一个方法，来对 DDD 和 MVC 两种架构进行分析，看一下有什么区别：**

我们其实之前常用的架构思想就是 MVC 三层架构，是面向**数据库思维**的编码思想，而面向数据库思维进行编码会导致严重的脱离原有的业务语义



### MVC 架构编码

**首先说一下为什么说是面向数据库思维的方式去编码呢？**

对于预分仓来说，它的业务逻辑是：

1. 先拿到所有发货仓库的数据
2. 再拿到所有履约单的数据
3. 之后再去根据履约单，去和发货仓库一个一个对比，找出来最近的一个仓库
4. 再将履约单和发货仓库的对应关系保存下来

那么按照我们原有的面向数据库的思维方式，对于第一步，要先去数据库中查询出来所有的发货仓库的数据，第二步再去数据库中查询出来所有的履约单的数据，第三步再去循环履约单以及发货仓库，找到距离最近的发货仓库，第四步再去将履约单和发货仓库的对应关系给存储到数据库中，伪代码如下：

```java
public class FulfillService {
  // 预分仓逻辑
  public void preAllocateWarehouse() {
    // 1.查询仓库
    warehouseDao.find();
    // 2.查询履约单
    orderFulfillDao.find();
    // 3.将订单与仓库进行一系列匹配操作
    for (orderFulfill orderFulfill : orderFulfills) {
      for (Warehouse warehouse : warehouses) {
        // ...匹配
      }
    }
    // 4.将履约单与仓库对应关系存储到数据库中
    orderAllocateWarehouseDao.save();
  }
}
```



这样写出来预分仓的代码，里边会先有一堆的数据库查询，之后再去 for 循环遍历，之后再去将数据保存在数据库中，这与原有的业务语义发生了脱离，本来预分仓方法的目的是要拿履约单和仓库进行匹配，找到最适合的发货仓库，结果通过面向数据库思维，先添加了很多数据库操作的边干逻辑，从而导致整个代码的主干流程不清晰

如果你作为一个产品经理，来看这一段代码，你可能根本不知道这一堆数据库查询以及 for 循环到底是干嘛的

> 这就是 MVC 架构所带来的缺点，当代码多了之后，整个结构混乱，不宜维护



### DDD 架构编码

上边就是通过 MVC 架构设计的代码，整个过程中都是以面向数据库思维编写的，这样的系统如果发展了几年之后，可能根本就没有人愿意来接手这个代码

接下来看一下按照 DDD 架构写出来的代码，这里写的比较简单，主要是和 MVC 对比，后边会将履约场景的代码给规范的写出来

```java
public class FulfillService {
  // 预分仓逻辑
  public void preAllocateWarehouse() {
    // 1.取出履约单
    OrderFulfill orderFulfill = orderFulfillRepository.getById(orderId);
    // 2.取出仓库信息
    Warehouses warehouses = warehouseRepository.find();
    // 3.寻找距离履约单最近的仓库
    Warehouse warehoiuse = warehouses.searchNearest(orderFulfill);
    // 4.检查仓库的库存是否充足
    Boolean checkInventoryResult = warehouse.checkInventoryResult(orderFulfill);
    if (!checkInventoryResult) {
      return;
    }
    // 5.锁定库存
    warehouse.lockInventory(orderFulfill);
    // 6.将仓库分给履约单
    orderFulfill.allocate(warehouse);
  }
}
```



上边是根据 DDD 思想写出来的代码，可以看到，就算你不是开发人员，你来看，整个方法的主干流程非常清晰，不会有很多数据库操作来干扰视线

这里 DDD 架构中，上边比如说寻找离履约单最近的仓库，我们是把方法写到 `Warehouses` 中去了，分配给履约单的方法写到 `OrderFulfill` 中去了，这两个其实相当于是实体类，之前在 MVC 中，肯定是不会向实体类中写方法的，这也是 DDD 与 MVC 有很大不同的一点，这些之后都会详细介绍



## DDD 业务建模流程

对于 DDD 开发项目来说，分为 3 个部分：**战略设计**、**战术设计**、**代码开发**

- 战略设计：划分有界上下文、确定子域类型、上下文映射，把上下文里的通用语言制定一套规范出来，后续开发根据这个规范来完成
- 战术设计：在战略设计的基础上，进一步细化领域模型，包含了上下文中有哪些类，类之间如何配合，战术设计中包含了聚合、实体、值对象、仓储、领域服务、业务组件、领域事件、命令这些更加具体的东西
- 代码开发



接下来先说一下从战略设计、战术设计、代码开发这三个方面来对 DDD 业务建模整体的流程进行分析讲解，从 0 到 1 带你完成一个 DDD 项目

## 第一部分：战略设计

在**战略设计**中，主要进行的工作就是：划分有界上下文、确定子域类型、上下文映射，把上下文里的通用语言制定一套规范

**接下来说一下这几个名词到底代表什么意思**

- **划分有界上下文**：将各个业务模块的责任划分清楚，各个模块只负责自己的任务，达到高内聚的效果，比如仓储服务负责发货、商品校验一些任务，而履约服务负责生成履约单以及使用仓储服务所提供的一些功能，**将各自负责的任务写到各自的上下文中去**
- **子域**：一般来说和有界上下文是一一对应的，比如履约有界上下文就对应了履约子域、订单上下文就对应了订单子域
- **上下文之间的映射：**映射指的是各个子域之间如何进行交互，以及子域之间的关系（比如生产者消费者映射关系、发布订阅映射关系等）
- **通用语言的制定：**在不同的上下文中，可能有些东西具体的细节定义不同，但是指的是同一个东西，因此需要指定统一的通用语言。这里举个例子，比如对于订单 Order 来说，在订单上下文中是订单的含义，而在履约上下文中，则是履约单的含义，但是他们指的都是同一个东西，因此需要通用语言的规范，各个上下文按照规范去做



>  至此，战略设计中设计的名词，我们就已经了解了，接下来开始 DDD 业务建模的第一部分：战略设计



### 战略设计：划分有界上下文

首先，对当前业务模块划分出来它的有界上下文

这里使用**事件风暴会议**来找出来履约系统的有界上下文



**如何使用事件风暴会议来划分履约系统的有界上下文？**

事件风暴会议是一种协作式的工作方法，通过可视化的方式，让团队成员参与到业务流程的分析和设计中，从而更好的定义业务需求



**使用事件风暴会议通过五个步骤划分履约有界上下文：**

1. 召集会议：程序员、用户、产品经理、管理者大家一起开会，将所有履约相关的事件全部说出来
2. 梳理事件：将履约相关的事件按照时间线进行排列
3. 梳理履约相关的用户界面和命令：对履约相关的事件，判断是否有用户界面，如果有的话，用户在界面会发出一个命令（点击按钮、提交表单），通过命令驱动各个事件的执行
4. 串联成完成流程：把用户界面 --> 命令 ---> 事件，按照时间先后顺序串联起来，形成完整的流程
5. 划分履约上下文：在完整的履约流程中，找出来哪些事情是履约上下文要解决的，进行上下文划分



**方法论说完之后，开始对履约有界上下文划分进行实操：**

- 第一步：召开事件风暴会议


- 第二步：根据时间梳理事件

履约中的事件执行流程为：

![1706250276725](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706250276725.png)



- 第三步：梳理用户界面和命令

在履约环节中，主要就是预分仓之后，进行人工审核的时候，需要工作人员参与一下

先通过对履约单进行风控拦截，被风控拦截到的有风险的订单（刷单、黄牛）会交给人工审核：审核通过、取消订单、重分仓



- 第四步：串联起来形成完整流程

也就是上图中的流程



- 第五步：找出履约上下文需要做的事件

对于上图的流程，下库房之后的拣货、复核、商品打包、物流配送的一些操作，都不是履约需要负责的事件了，这些都是仓储所需要负责的



### 战略设计：确定子域

划分好有界上下文之后，接下来需要将每个有界上下文跟子域一一对应起来

每个子域都有自己的**类型**：

- **核心子域**：具备核心功能的子域，比如电商系统中的商品子域、订单子域、支付子域、履约子域、会员子域
- **支持子域**：提供支持作用的子域，也就是为了支持核心子域的功能而出现的，比如仓储子域、财务子域、报表子域
- **通用子域**：不是公司自己开发的，使用第三方通用的系统，比如第三方支付平台、第三方物流平台都是通用子域



那么在履约中所设计的上下文都有：订单上下文、仓储上下文、风控上下文、物流上下文，他们和子域的对应关系，以及对应的子域类型如下图

![1706251940854](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706251940854.png)





### 战略设计：上下文之间的映射

这里的映射指的就是各个有界上下文之间的交互关系

**映射有以下几种：**

- separate way：没有交互关系，很少见
- `cumtomer-supplier`：消费者、供应者关系（cs），互相之间可以商量接口的定义，一般同一个项目组中的各个小团队之间可以使用这种映射，距离比较近，商量起来很方便
- `publish-subscribe`：发布、订阅关系（ps），一方发布一个事件，另一方监听这个事件并进行处理
- `anti corruption layer`：防腐层（acl），acl 映射关系一般是和其他映射关系结合使用的，比如和 ps、cs 结合使用，以 ps 为例，发布者和订阅者刚开始约定了 8 个字段，但是后来可能一方要改变某些字段，如果修改两方的代码导致对代码入侵性太强了，可以加入防腐层，将双方的字段进行一个转化和适配
- `conformist`：双方没商量的映射关系，比如一方给另一方提供接口，这两方在不同的部门中，提供接口的一方按照自己的计划进行迭代升级，如果你使用的话，必须遵守提供接口方的规定，没有商量的余地
- partnership：强耦合、合作的映射关系，常用于中小型系统中，各个子域之间的耦合度比较高，一起进行开发、修改、上线，很少见
- `open host service + published language`：OHS+PL 映射关系，指的一般都是第三方的支付平台或第三方物流平台等等，他们开放出来平台接口，一般是开放出 HTTP 接口供我们去调用，这就是 OHS + PL 映射关系
- shared kernel：共享内核映射关系，两个有界上下文之间，共享一个数据模型，两个团队一起维护，不过现在很少见

上边的几种映射关系，只有 separate way、partnership、shared kernel 不常见，其他的都是比较常用的



**接下来就开始分析履约相关的一些上下文之间的映射关系了：**

订单和履约的映射关系：ps 关系，订单发布事件，履约收到事件，进行处理

履约和仓储的映射关系：conformist 关系，仓储对外提供接口，履约按照指定的接口规范调用即可，仓储作为上游提供服务，履约作为下游调用

履约和物流：conformist 关系，物流团队也是对外提供接口，履约按照指定的接口规范调用即可，物流作为上游提供服务，履约作为下游调用

物流和第三方物流：acl + OHS + PL 关系，通过 acl 防腐层进行接口之间的数据的适配，第三方物流对外提供指定的 HTTP 接口，物流按照指定格式调用即可

![1706256312071](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706256312071.png)









### 战略设计：通用语言的制定

这里还是再说一下为什么要指定通用语言吧

就比如说对于 `Order` 订单来说

- 在订单上下文中，有着自己对订单的理解，自己定义 Order 的细节
- 而在履约上下文中，也有着自己对订单的理解，自己定义履约中 Order 的细节

那么他们说的其实都是一个东西，但是在不同的上下文中，对于同样的 Order 的理解不同，以及具体的定义细节也是不同的，**因此需要有统一的一套通用语言，在每一个上下文中，所有的名词、命名规范、业务操作、业务事件、业务语义都按照统一的一套规则和规范去做**





> 至此，DDD 业务建模中的战略设计，也就是理论部分就完成了，接下来说一下战术设计，即具体的细节，该作何来做



## 第二部分：战术设计

### 名词介绍

第二部分来说一下战术设计都要做哪些事情

在战术设计中，牵扯到了具体的类层面的设计，涉及到每一个上下文里有哪些类，类之间如何配合

在战术设计中，包含了：

- 聚合（Aggregate）：将多个联系很强的类聚合在一起，聚合后的东西就是一个聚合，下边的 Order 就是一个聚合

  ```java
  public class Order {
    // 唯一表示
    private orderId;
    // 多个订单细节
    List<OrderItem> orderItems;
    // 发货地址
    DeliveryAddress deliveryAddress;
  }
  ```

  

- 实体（Entity）：实体比较好理解，就是实体类，比如对于订单来说，它的实体就是 Order 类，需要唯一标识

- 值对象（Value Object）：值对象是一种特定的实体，它代表了一个不可变的、没有唯一标识的对象。就比如在电商系统中，Money 是一个值对象，当存在多个 Money 对象时，只要他们的货币类型和金额相同，那它们就是相同的，值对象中通过属性值就可以判断是不是相同的，因此不再需要唯一标识

- 仓储（Repository）：将聚合数据、实体数据和持久层进行持久化的组件，通过仓储进行数据的查询、修改、保存等操作，包括和 MySQL、Redis、ES、MQ 进行交互

- 领域服务（Domain Service）：用于存放无法单独放在某个聚合中的一些业务逻辑

- 业务组件（Business Component）：业务组件就是一段业务逻辑，既不是聚合，也不是领域服务，就比如订单状态机，表示订单的不同状态，这就是一个业务组件

  ```java
  // 订单状态及业务组件
  public class OrderStateMachine {}
  ```

- 领域事件（Domain Event）：通过领域事件来串联起整个业务，就比如通过订单支付事件（OrderPayedEvent）驱动发起履约的流程，订单上下文发布【订单支付事件】，履约上下文订阅【订单支付事件】，监听到事件发生后，就开始执行履约的流程

- 命令（Command）：由人驱动发起的命令，例如点击按钮、提交表单等等，这些都是命令



### 贫血模型和充血模型

这里先说一下贫血模型和充血模型的概念

- 贫血模型

贫血模型就是我们之前使用 MVC 架构写出来的实体类的 class，这些 class 一般都是贫血模型

贫血指的是这些 class 中只存储一些数据，和数据库表中的字段是一一对应的，而对这些数据的一些业务逻辑操作，全部放在了其他地方（Service）

那么之前我们用 MVC 架构写出来的东西，业务逻辑全部封装在 Service 中，Domain 中的实体类中只有数据，没有业务逻辑，因此说 Service 是充血模型，Domain 是贫血模型

Service 中包装了太多的业务逻辑所导致的问题就是 Service 中的代码太多，导致代码看起来非常混乱



- 充血模型

在 DDD 中，是 `将聚合设计成充血模型` 了，聚合其实就是一堆实体类的集合，将业务行为放在聚合中去，将业务逻辑从 Service 中提取出来，按照业务语义放到对应的聚合中去，比如说对于 Order 订单来说，保存订单的操作，可以放在 Order 这个聚合中去：

```java
public class Order {
  // 唯一表示
  private orderId;
  // 多个订单细节
  List<OrderItem> orderItems;
  // 发货地址
  DeliveryAddress deliveryAddress;
  
  // 业务行为
  public void saveOrder(/*省略*/) {/*省略*/}
}
```





### 领域服务有什么用？

**这里讲一下领域服务到底是干什么的：**

上边讲了将一些业务逻辑给抽取到聚合中去，但是还有一些业务逻辑可能设计了多个聚合，并不只属于某一个聚合，而是作为一个业务组件存在的，因此不能抽取到某一个聚合中

那么可以再去设计一个领域服务 DomainService，将业务逻辑放到领域服务中去







### 如何验证你的 DDD 架构设计的好不好呢？

有一个很简单的方法就是，让产品经理或者不懂代码的人，来看你代码的流程，如果代码可以很清晰的还原出来业务语义，那么就证明你的 DDD 架构设计的非常好了！





### 履约上下文业务流程梳理

这里再来梳理一下履约中的业务流程，之后就开始对履约上下文进行战术设计了

1. 接收订单：通过监听【订单支付成功】事件
2. 保存订单：将订单相关数据保存在履约的上下文中
3. 预分仓：先对订单分配一个距离比较近的仓库
4. 风控拦截：通过风控上下文提供的接口，拦截有风险的请求
   1. 人工审核：将拦截到的风险请求给人工进行审核
   2. 审核通过、重分仓、取消订单：人工审核后，对订单状态进行更新
5. 分物流：通过物流上下文提供的接口，分配一个合适的物流公司
6. 下库房：通过仓储上下文提供的接口，将履约订单指派给指定的仓库





### DDD 中的接口层和应用服务层

**接口层**， 是 DDD 最靠外的一个层次，用于向外部提供 Http 调用

而像 MQ 中的消费者，也算是接口层，是基于 MQ 事件消费的接口

当接口层收到外部了 Http 请求之后，可以通过防腐层做一些数据的适配，将外部数据转为内部数据，之后再去执行对应的一系列的业务逻辑

**应用服务层**，用于进行业务流程编排，就比如由 ApplicationService 来进行履约整个流程的编排，负责基于仓储、聚合、领域服务来执行各种各样的动作，完成整个业务流程中所需要执行的动作





### DDD 战术设计细节

![履约流程战术设计 ](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/履约流程战术设计 .png)

我将履约流程中的战术设计给画了出来，其实 DDD 业务建模中，**最重要的就是战术设计** 

通过战术设计，基本上就将你负责的上下文的模型给建立好，通过战术建模就可以看出来

接下来对上边的这张战术设计的流程图介绍一下**（圆圈内的都是履约上下文）**：

1. 首先订单上下文发布【订单支付成功】的事件，被履约上下文的监听器监听到，进入到 `接口层` ，也就是履约上下文的入口
2. 履约上下文的 `应用服务层` 负责整个履约链路的执行
3. 首先是 `保存履约单` ，这里就涉及到数据的持久化，交给 `仓储` 来做，其中履约单作为一个 `聚合` 包含了多个实体，以及一些 `业务逻辑` （DDD 精华：将聚合设计为充血模型）
4. 接下来就是风控拦截，调用风控上下文提供的 API，与风控上下文使用 conformist 映射关系，完全遵守风控的接口规范（因为不处于一个团队，风控团队按照自己的计划迭代接口）
5. 接下来是预分仓和分物流，这里创建了一个履约的领域服务，因为这里边的业务逻辑没有办法单独放到某个聚合中去，将预分仓和分物流这两个逻辑抽取到领域服务中
   1. 预分仓：创建一个 Warehouses 仓库集合的业务组件和 Warehouse 仓库的业务组件，通过这两个业务组件执行一些仓库相关的业务操作，通过调用仓储上下文的 API 接口拿到仓库集合，并且挑选距离最近的仓库，之后再检查选出来的仓库库存是否充足，并锁定库存（调用仓储上下文的 API 接口）
   2. 分物流：和预分仓类似，这里就不重复说了



那么至此，履约的**战术设计**就已经完成了



## 阿里巴巴开源的 Cola 架构设计

Alibaba 开源了 Cola 架构，目前发展到了 Cola 4.0，Cola 的思想与 DDD 建模设计有一些相通之处，但并不是完全一样，

Cola 架构不仅提供了建模思想，而且提供了可落地的工具和实践指导

Cola 架构的具体内容，可以在 CSDN 上详细看张建飞大佬写的文章！这里我主要将核心部分给写下来！



**应用架构的本质就是将类与类、包与包之间的组织关系变得更加清晰，易于维护，达到高内聚、低耦合！**

好的应用架构都遵循着一个规律：以业务为中心进行建模

Cola 架构的层次划分为：Adapter 层、Application 层、Domain 层、Infrastructure 层

![1706589859049](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706589859049.png)



1、适配层（Adapter Layer）：负责与外界进行交互

2、应用层（Application Layer）：负责获取输入，组装上下文，调用领域层进行业务处理，也可以直接访问基础设施层

3、领域层（Domain Layer）：封装了核心业务逻辑，为 App 层提供业务实体以及业务逻辑计算

4、基础设施层（Infrastructure Layer）：负责技术细节问题的处理，如数据库的 CRUD、RPC、搜索引擎等



分层是大粒度的职责划分，接下来还要更细粒度的进行包结构的划分，才能具体的指导代码结构

![1706590463634](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706590463634.png)



- Adapter 层：
  - web 负责处理 Controller
  - wireless 负责处理无线端的适配
  - wap 负责处理 wap 端的适配
- App 层
  - executor 负责处理 request
  - consumer 负责处理外部 message
  - scheduler 负责处理定时任务
- Domain 层
  - model 领域模型
  - ability 领域能力，包括 DomainService
  - gateway 领域网关，用于解耦
- Infrastructure 层
  - gatewayimpl 网关的实现
  - mapper 数据库映射
  - config 配置信息
- Client SDK 
  - api 服务对外提供的 API
  - dto 服务对外的 DTO



DDD 对设计能力要求很高，设计的好不好，要看以下三点：

- 有没有帮助系统解耦
- 有没有提高业务语义表达能力
- 有没有提高系统的可维护性和可观测性



### Cola 代码架构

**接下来我们先去 COLA 源码仓库把代码下载下来，分析一下 COLA 架构如何设计，之后再去完成电商履约场景的代码设计**

整个 Cola 架构如下图，包括了 5 个部分：

![1706594826199](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706594826199.png)



**接下来说一下 Web 请求的整个调用流程：** 

![1706595603047](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706595603047.png)

- Web 请求的入口就是 adapter 层的 Controller，在 Controller 中，接收命令参数（Query、Command），并且调用 Service 服务来进行处理
- Service 接口在 client 层，Service 实现类在 app 层，因此最终是走到 app 层进行业务逻辑的处理
- 在 app 的 Service 实现类中，会调用 Executor（app 层） 来对 Command 进行处理，在 Executor 中通过 Mapper（infra 层） 来操作数据库，通过数据库查询出来的对象是 DO（infra 层），将 DO 转换为 CO（client 层）进行返回



**更复杂一些的逻辑流程**

上边说了一个简单逻辑的流程

接下来说一下稍微复杂一些的保存操作，如果在保存之后，还需要发布一个事件，那就需要使用 Gateway 来进行解耦操作，将保存数据的操作和发布事件的操作给提取到 Gateway 中去，那么 Executor 就只需要调用 Gateway 的保存方法即可，数据库的操作以及事件的发布全部交给 GatewayImpl 来做如下：

![1706596361549](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706596361549.png)





> 至此，Cola 架构整体的一个流程就梳理完毕了，还有一些细节地方没有说，比如 Convertor，这个就相当于 DDD 中的防腐层，用于将外部对象转为内部对象，比如将 web 端发来的 DTO 对象转为内部的 DO 对象等等
>
> 这些细节的东西会在接下来的实战环节说明





## 基于 Cola 实现电商履约架构设计

我们在实际进行架构设计的时候，不用每一个方法都严格按照 Cola 或者 DDD 去设计，可以根据自己的需求以及习惯，做出一些合理的变动

这里将履约这个模块分为 6 个部分（后两个模块不重要，主要是前 4 个模块要清楚每一个模块的作用）：

![1706605483679](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706605483679.png)

- api：与外界负责交互的模块
- application：原来的 app 层，负责全局服务的处理
- domain：领域层
- infrastructure：基础设施层
- rpc：与其他模块进行 rpc 通信的接口
- start：启动 SpringBoot 项目的模块



### 订单履约流程

订单履约的流程，当订单支付成功之后，订单上下文会发送一个【订单支付成功】的事件，在履约上下文中，就可以监听【订单支付成功】事件，之后开始履约的流程

- 首先会进入到 api 层

监听器放在 api 层，与外界进行交互，监听器收到事件之后，将外部的事件转为 Command，再调用 application 层提供的【应用服务】来进行处理

```java
api -- 
@Component
@Slf4j
public class OrderPayedEventListener implements MessageListenerConcurrently {
    @Autowired
    private FulfillApplicationService fulfillApplicationService;

    @Override
    public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
        try {
            for (MessageExt messageExt : list) {
                String message = new String(messageExt.getBody());
                log.info("OrderPayedEventListener message:{}", message);

                // 1、将message转化为OrderPayedEvent领域事件
                OrderPayedEvent orderPayedEvent = JSONObject.parseObject(message, OrderPayedEvent.class);
                // 2、把领域事件，转换为一个command
                OrderFulfillCommand orderFulfillCommand = buildCommand(orderPayedEvent);
                // 3、交给app层的应用服务逻辑，去推动命令的流程编排和执行
                fulfillApplicationService.executeOrderFulfill(orderFulfillCommand);
            }
            return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
        } catch (Exception e) {
            log.error("consumer error", e);
            return ConsumeConcurrentlyStatus.RECONSUME_LATER;
        }
    }
}
```

- application 层

在 application 层，就通过 Executor 执行履约的操作

```java
@Component
public class FulfillApplicationService {

    @Autowired
    private OrderFulfillCommandExecutor orderFulfillCommandExecutor;
   
    public void executeOrderFulfill(OrderFulfillCommand orderFulfillCommand) {
        // 通过 Executor 来进行履约的处理
        orderFulfillCommandExecutor.execute(orderFulfillCommand);
    }
}
```



这里我们将 Executor 的具体实现也放在 application 层中去，在 Executor 中实现具体的履约流程：

- 首先是 `保存订单` ，这里先将 Command 给转成履约单 FulfillOrder，再将履约单进行保存操作，并且插入日志

  这里保存履约单的操作写到了 Gateway 中去，因为 Gateway 就是与下层 Infrastructure 层交互的

  保存订单之后通过 【fulfillOrderLogDomainService】 来插入操作日志，这里将日志的插入操作写入到了 【fulfillOrderLogDomainService】 （即履约订单日志领域服务）中去，在这个 【DomainService】 中再调用 Gateway 去和 Infrastructure 进行交互，因为这里在插入日志信息的时候，还有一些额外的信息需要设置一下，所以在 DomainService 层进行了设置，之后再通过 Gateway 进行保存，可以保证 Gateway 层的职责比较单一（仅仅和 Infrastructure 交互或者其他模块交互）

- 其次是 `风控拦截` ，风控拦截已经是其他模块的功能了，毫无疑问使用 Gateway 来和其他上下文进行通信，这里在 Gateway 中就可以直接和风控模块暴露的 rpc 接口进行通信了（使用 Gateway 层解耦）

  如果该订单被风控拦截了，使用【domainEventGateway】来发布被拦截的领域事件

- 接下来是 `预分仓` ，由于预分仓这里，我们需要一些距离计算的方法来选择合适的仓库，而 Gateway 的目的是和其他模块进行交互，功能比较单一，因此预分仓这里我们再去创建一个【warehouseDomainService】即仓库的领域服务，在仓库的领域服务中再通过 Gateway 和仓库交互来获取所有仓库并且进行仓库的选择

  预分仓之后通过 【fulfillOrderLogDomainService】 来插入操作日志

- 下来是 `分物流` ，这里和预分仓是类似的，分物流中的操作也比较复杂，所以不能直接放到 Gateway 中去，要先创建一个【logisticsDomainService】物流的领域服务，在物流的领域服务中去执行分物流的一系列操作

  分物流之后通过 【fulfillOrderLogDomainService】 来插入操作日志

- 最后是 `下库房` ，先通过 Gateway 来和库房上下文进行交互，调用库房上下文暴露的接口来保存履约单

  下库房之后通过 【fulfillOrderLogDomainService】 来插入操作日志

```java
@Component
@Slf4j
public class OrderFulfillCommandExecutor {
	// ...

    // 专门负责订单履约流程的编排，把这个流程按照战术建模的设计，完成落地开发
    @Transactional(rollbackFor = Exception.class)
    public void execute(OrderFulfillCommand orderFulfillCommand) {
        // 第一步，保存订单，需要去使用履约订单仓储/gateway来进行保存
        FulfillOrder fulfillOrder = fulfillOrderFactory.createFulfillOrder(orderFulfillCommand);
        log.info("创建fulfillOrder实体：{}", JSONObject.toJSONString(fulfillOrder));
        fulfillOrderGateway.save(fulfillOrder);
        fulfillOrderLogDomainService.saveOrderCreatedLog(fulfillOrder);


        // 第二步，风控拦截
         Boolean interceptResult = riskControlApiGateway.riskControlIntercept(fulfillOrder);
        log.info("风控拦截：{}", JSONObject.toJSONString(interceptResult));
        if (!interceptResult) {
            fulfillOrder.riskReject();
            // 如果被风控拦截了，此时就需要发布订单被拦截的领域事件，通知人工审核
            domainEventGateway.publishOrderInterceptedEvent(new OrderInterceptedEvent(fulfillOrder.getFulfillId().getFulfillId()));
            return;
        }else {
            fulfillOrder.riskPass();
        }

        // 第三步，预分仓
        Warehouse warehouse = warehouseDomainService.preAllocateWarehouse(fulfillOrder);
        log.info("预分仓：{}", JSONObject.toJSONString(fulfillOrder.getFulfillOrderWarehouse().getWarehouseId()));
        fulfillOrderLogDomainService.saveOrderWarehousedLog(fulfillOrder);

        // 第四步，分物流
        logisticsDomainService.allocateLogistics(fulfillOrder, warehouse);
        fulfillOrderLogDomainService.saveOrderLogisticsLog(fulfillOrder);
        log.info("分物流：{}",fulfillOrder.getLogisticsOrder().getLogisticsId());

        // 第五步，下发库房
        warehouseApiGateway.sendFulfillOrder(fulfillOrder, warehouse);
        fulfillOrderLogDomainService.saveOrderInStoredLog(fulfillOrder);
        log.info("下发库房");
    }
}
```



**上边的履约流程总共有 5 个步骤，这里只挑选两个具有代表性（Gateway 分别和 Infrastructure、其他模块交互的两种情况）的步骤说一下：**

这里先说一下第一步：保存订单，在保存订单的时候，需要两步：

1、通过 【fulfillOrderGateway】 与 Infrastructure 交互，进行订单的保存

2、通过 【fulfillOrderLogDomainService】 进行日志的插入操作

这里在 Gateway 中直接调用了 Infrastructure 层的 DAO 进行数据库操作，整个流程就结束了

```java
@Component
public class FulfillOrderGatewayImpl implements FulfillOrderGateway {
	@Override
    public void save(FulfillOrder fulfillOrder) {
        FulfillOrderDO fulfillOrderDO = fulfillOrderDOConverter.convert(fulfillOrder);
        List<FulfillOrderItemDO> fulfillOrderItemDOs = mapStructSupport.convertToFulfillOrderItemDOs(fulfillOrder.getFulfillOrderItems());

        fulfillOrderDAO.save(fulfillOrderDO);
        fulfillOrderItemDAO.saveBatch(fulfillOrderItemDOs);
    }
}
```



接下来再看一下第二步：风控拦截，需要 2 步：

1、通过 【riskControlApiGateway】与风控模块进行交互，判断当前订单是否要被拦截

2、如果被拦截了，需要通过【domainEventGateway】发布【订单被拦截的事件】

这里在 Gateway 中直接就引入了风控模块的 API，通过 RPC 直接调用

```java
@Component
public class RiskControlApiGatewayImpl implements RiskControlApiGateway {
    @DubboReference(version = "1.0.0", retries = 0)
    private RiskApi riskApi;
	@Override
    public Boolean riskControlIntercept(FulfillOrder fulfillOrder) {
        // 通过 Converter 将 fulfillOrder 转为发往风控拦截的请求 FulfillOrderRiskRequest
        FulfillOrderRiskRequest fulfillOrderRiskRequest = fulfillOrderRiskRequestConverter.convert(fulfillOrder);
        // 调用风控拦截的 API 判断是否拦截
        FulfillOrderRiskDTO fulfillOrderRiskDTO = riskApi.fulfillOrderRiskControlIntercept(fulfillOrderRiskRequest);
        if(fulfillOrderRiskDTO == null) {
            log.warn("风控调用失败");
            return false;
        }
        if(!fulfillOrderRiskDTO.getRiskResult()) {
            log.warn("风控检查拒绝通过");
            return false;
        }
        return true;
    }

}
```





**上边代码比较多，可能看着不太清晰，这里我画张图：**

![1706613224189](https://11laile-note-img.oss-cn-beijing.aliyuncs.com/1706613224189.png)

这里还涉及一些实体对象的转换，监听器收到事件的时候，拿到的是消息，先将消息转为【OrderFulfillCommand】之后，再传入 Application 层，再将 【Command】转为【FulfillOrder】之后，传入 Domain 层，再转为【FulfillOrderDO】传入 Infrastructure 层

【OrderFulfillCommand】-> 【FulfillOrder】 使用 FulfillOrderFactory 来进行转换了，通过这个 Factory 创建一个履约单对象

【FulfillOrder】 ->【FulfillOrderDO】 使用 Converter 来进行转换，Converter 都放在了 Infrastructure 层



> 至此，订单履约流程的架构设计就完成了
>
> 那么可以发现，整个流程，从上到下，api -> application -> domain -> infrastructure，每个层的职责都是很清晰的，但是也正是因为职责划分的很清晰，从而导致代码在写起来的时候，需要比 MVC 架构多写很多的内容
>
> 因此对于中小型项目来说，盲目引入 DDD 只会导致项目的工作量剧增，DDD 的目的就是前期通过良好的分层、建模，后期可以降低维护成本















