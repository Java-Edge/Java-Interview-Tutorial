# 领域服务

## 1 前言

领域中的服务表示一个无状态操作，以实现特定于某领域的任务。

当某操作不适合放在聚合、值对象时，最好的便是领域服务。有时倾向于使用聚合根的静态方法实现这些这些操作，但在DDD中，这是个坏味道哦。

### 1.1 案例

Product维护一个Backlogitem实例集，该建模可计算一个Product总业务优先级：

```java
public class Product extends ConcurrencySafeEntity {
    
    private Set<BacklogItem> backlogitems;
  
  	// 只需遍历所有Backlogitem实例，计算总业务优先级
    // 适当使用了值对象BusinessPriorityTotals
    public static BusinessPriorityTotals businessPriorityTotals() {
    }
}
```

起初完美。后分析聚合，发现Product对象过大，而Backlogitem本身就应成为一个聚合。因此，上面businessPriorityTotals方法已不再适用。

#### 使用Repository

由于Product不再包含Backlogitem集合，第一反应用BacklogltemRepository获取Backlogitem实例，好吗？

并不建议，因为**应尽量避免在聚合中使用Repository**。

#### 静态方法

将businessPriorityTotals()声明为static，再将Backlogitem集作入参。这几乎不对方法多少修改，只需传入新参：

```java
public class Product extends ConcurrencySafeEntity {

   private Set<BacklogItem> backlogitems;

   public static BusinessPriorityTotals businessPriorityTotals(Set<BacklogItem> aBacklogitems) {
   }
}

```

但Product是创建该static方法最佳位置？看来要将该方法放在合适地方不易！

由于该方法只用每个Backlogitem中的值对象，方法放在Backlogitem似乎更合适？但这里计算所得业务价值却属Product而非Backlogitem，进退维谷！

架构师发话了：这些问题用个单一建模工具即可解决，领域服务(Domain Service)。

## 2 啥是领域服务

### 2.1 啥不是领域服务?

“服务”？自然想到一个远程客户端与某复杂业务系统交互，该场景基本描述SOA中的一个服务。有多种技术和方法可以实现SOA服务，最终这些服务强调的都是系统层的

- RPC
- 或MQ

使我们可通过服务与分布在不同地方的系统进行业务交互。但**这些不是领域服务**。不要将领域服务与应用服务混淆：

- 应用服务不处理业务逻辑
- 但领域服务恰是处理业务逻辑
- 应用服务是领域模型很自然的客户，也是领域服务的客户

虽然领域服务中有“服务”，但不意味着需要远程的、重量级的事务操作。

## 3 啥时用？

**当领域中的某操作或转换过程不是实体或值对象的职责**，便应将该操作放在一个独立接口，即领域服务。

- 定义接口时要使用模型语言，并确保操作名称是通用语言中的术语
- 无状态

通常领域模型主要关注特定某领域的业务，领域服务有相似特点。由于领域服务可能在单个原子操作中处理多个领域对象，这将增加领域服务的复杂性。

有时，当**与另一个限界上下文交互**时，领域服务的确需要进行远程操作，但此时重点并非将领域服务作为一个服务provider，而是将其作为RPC客户端。

### 何时一个操作不属实体/值对象？

即何时使用领域服务：

- 执行一个显著的业务操作过程
- 对领域对象进行转换
- 以多个领域对象作为输入进行计算，产生一个值对象结果：计算过程应具有“显著的业务操作过程”。这也是领域服务很常见的应用场景，它可能需要多个聚合作为输入。

**当一个方法不便放在实体或值对象，使用领域服务便是最佳解决方案。**

## 4 真需要吗？

别过度使用，只在有必要时才做。过度领域服务，依旧导致贫血领域模型：所有业务逻辑都在领域服务。

## 5 案例

### 5.1 User认证

考虑身份与访问上下文，对一个User进行认证。系统必须对User认证，只有当Tenant处激活状态时才能对User认证。

为何领域服务在此时必要？难道不能简单将该认证操作放在实体？在客户角度，可能这样实现认证：

```java
// client finds User and asks it to authenticate itself 
boolean authentic = false;

User user = DomainRegistry
				.userRepository()
				.userWithUsername(aTenantld, aUsername);
if (user != null) {
	authentic = user.isAuthentic(aPassword);
}			
return authentic;
```

问题在于：

- 客户端需知某些认证细节：他们要找到一个User，再对该User密码匹配
- 这种方法不能显式表达通用语言：这里询问的是一个User "是否被认证”，但没表达“认证”这个过程。有可能的话，应尽量使建模术语直接表达出团队成员的交流用语

更坏的，这种建模方式不能准确表达团队成员指的“对User进行认证”的过程。它缺少 “检查Tenant否处激活态”这个前提。若一个User所属Tenant处非激活态，便不该对该User进行认证。

解决方法：

```java
// 客户端查找User,然后User完成自我认证
boolean authentic = false;
Tenant tenant =
    DomainRegistry 
        .tenantRepository()
        .tenantOfId(aTenantId);

// 检查Tenant活跃性
if (tenant != null && tenant.isActive()) {
    User user =
        DomainRegistry
            .userRepository()
            .userWithUsername(aTenantId, aUsername);
            
  	// 将User#isAuthentic换成Tenant#authenticate
    if (user != null) {
        authentic = tenant.authenticate(user, aPassword)
    }
}
return authentic
```

但还有问题：

- 客户端需知更多认证细节，但这些他们不该知。当然，可将**Tenant#isActive**放在**authenticate**，但这不是一个显式模型
- 此时Tenant需知咋对密码进行操作

回忆认证过程的另一需求：必须对密码进行加密，且不能使用明文密码。

对于以上解决方案，似乎给模型带来太多问题。对于最后一种方案，必须从以下解决办法中选一种：

- 在Tenant中处理对密码的加密，再将加密后的密码传给User。但这违背单一职责原则
- 由于一个User必须保证对密码的加密，它可能已知一些加密信息。如果这样，可在User上创建一个方法，该方法对明文密码进行认证。但这种方式，认证过程变成Tenant的门面(Facade)，而实际认证功能全在User。另外，User的认证方法须声明为protected，以防外界客户端对认证方法的直接调用
- Tenant依赖User对密码进行加密，再将加密后的密码与原有密码进行匹配。这种方法似乎在对象协作之间增加额外步骤。此时，Tenant依然需知认证细节
- 让客户端对密码进行加密，然后将其传给Tenant：导致客户端承载本不该有的职责

以上方法无济于事，同时客户端依旧复杂。强加在客户端的职责应在我们自己的模型中处理。只与领域相关的信息决不能泄漏到客户端。即使客户端是个应用服务，它也不该负责对身份与访问权限的管理。

客户端需要处理的唯一业务职责是：调用单个业务操作，而由该业务操作去处理所有业务细节：

```java
// 应用服务只用于协调任务
UserDescriptor UserDescriptor = 
    DomainRegistry
        .authenticationService()
        .authenticate(aTenantId, aUsername, aPassword);
```

- 简单优雅。客户端只需获取到一个无状态的 Authenticationservice，并调用authenticate。所有认证细节放在领域服务，而非应用服务。在需要时，领域服务可使用任何领域对象完成操作，包括对密码的加密。客户端无需知道任何认证细节。
- 通用语言也得到满足，将所有领域术语都放在了身份管理领域，而非部分放在领域模型，部分放在客户端

领域服务方法返回一个UserDescirptor值对象，这是一个很小的对象，且安全的。与User相比，它只包含3个关键属性：

```java
public final class UserDescriptor extends AssertionConcern implements Serializable {

    private static final long serialVersionUID = 1L;

    private String emailAddress;
    private TenantId tenantId;

    private String username;
}
```

该UserDescriptor对象可存放在一次Web会话(Session)中。对于作为客户端的应用服务，它可进一步将该UserDescriptor返回给它自己的调用者。

### 5.2 货柜机服务

```java
/**
 * @param event 货柜机柜门锁定事件
 */
@Transactional
public void onCabinetLocked(CabinetVendingMachineLockedEvent event) {
    CabinetVendingMachine cabinet = machineRepository.getCabinetVendingMachineById(event.getMachineId());
    try {
        Order order = cabinet.onLocked(event, commodityService);
        orderRepository.addOrder(order);
        // machineRepository.updateCabinetVendingMachine(cabinet);

        // RPC
        UserInfo userInfo = userService.getUserInfo(cabinet.getCurUserOpenId());
        // RPC
        payService.chargeForOrder(
                OrderInfo.Builder()
                        .machineId(order.getMachineId())
                        .orderId(order.getOrderId())
                        .type(order.getType())
                        .totalAmount(order.totalAmount())
                        .build(),
                userInfo
        );
        eventBus.post(new OrderCreatedEvent(cabinet.getMachineId(), order));
    } catch (DomainException e) {
        if (e.getErrCode() != TradeError.OrderAmountZero) {
            throw e;
        }
    }
}
```

若现在需要新增一个营销优惠逻辑，显然不适合放在应用服务层（不该有业务逻辑），同时也不属于userService、payService逻辑，咋办呢？就需要创建一个领域服务了。

```java
/**
 * @author JavaEdge
 */
@Service
public class ActivityService {

  public BigDecimal calculateOrderAmount(Order order, UserInfo userInfo) {
    return BigDecimal.ZERO;
  }
}

```

改成如下即可：

```java
// RPC
payService.chargeForOrder(
        OrderInfo.Builder()
                .machineId(order.getMachineId())
                .orderId(order.getOrderId())
                .type(order.getType())
                // .totalAmount(order.totalAmount())
                .totalAmount(activityService.calculateOrderAmount(order, userInfo))
                .build(),
        userInfo
);
```



## 6 如何建模领域服务？

根据创建领域服务的目的，有时对领域服务进行建模是非常简单的。你需要决定你所创建的领域服务是否需要一个**独立接口**。如果是，你的领域服务接口可能与以下接口相似：

```java
package com.saasovation.identityaccess.domain.model.identity;

public interface AuthenticationService {

    public UserDescriptor authenticate(
            TenantId aTenantId,
            String aUsername,
            String aPassword);
}
```

该接口和那些与身份相关的聚合（比如Tenant, User和Group）定义在相同的模块中，因为Authenticationservice也是一个与身份相关的概念。当前，我们将所有与身份相关的概念都放在identity模块中。该接口定义本身是简单的，只有一个 authenticate方法。
对于该接口的实现类，我们可以选择性地将其存放在不同地方。如果你正使用依赖倒置原则或六边形架构，那你可能会将这个多少有些技术性的实现类放置在领域模型外。比如，技术实现类可放置在基础设施层的某个模块中。

以下是对该接口的实现：

```java
/**
 * @author JavaEdge
 * @date 2021/1/14
 */
public class DefaultEncryptionAuthenticationService implements UserResource.Authenticationservice {


    public DefaultEncryptionAuthenticationService() {
        super();
    }


    @Override
    public UserDescriptor authenticate(TenantId aTenantld, String aUsername, String aPassword) {
        // 首先对null参数进行检查
        // 如果在正常情况下认证失败,那么该方法返回的UserDescriptor将为null
        if (aTenantld == null) {
            throw new IllegalArgumentException("Tenantld must not be null.");
        }
        if (aUsername == null) {
            throw new IllegalArgumentException("Username must not be null");
        }
        if (aPassword == null) {
            throw new IllegalArgumentException("Password must not be null.");
        }

        UserDescriptor userDescriptor = null;
        Tenant tenant =
                DomainRegistry
                        .tenantRepository()
                        .tenant0fId(aTenantld);
        if (tenant != null && tenant.isActive()) {
            String encryptedPassword =
                    DomainRegistry
                            .encryptionService().encryptedValue(aPassword);
            User user =
                    DomainRegistry
                            .userRepository()
                            .userFromAuthenticCredentials(aTenantld, aUsername,
                                    encryptedPassword);
            // 检查所获取到的User实例是否为null和是否处激活状态
            if (user != null && user.isEnabled()) {
                userDescriptor = user.userDescriptor();
            }
        }
        return userDescriptor;
    }
}
```

在对一个User进行认证时：

- 先根据aTenantld从Tenant的资源库中取出对应的Tenant
- 如果Tenant存在且处于激活状态，下一步我们将加密传入的明文密码
  加密在于我们需要通过加密后的密码获取一个User。在获取一个User时，我们不但需要传aTenantld和username，还需要传入加密后的密码进行匹配（对于两个明文相同的密码，加密后也是相同的）。User的资源库将根据这三个参数来定位一个User。

如果用户提交的aTenantld, username和password都正确，我们将获得相应的User实例。但此时我们依然不能对该User进行认证，我们还需要处理最后一条需求：

- 只有在一个User被激活后，我们才能对该User进行认证。

即便我们通过资源库找到了一个User，该User也有可能处于未激活。通过向User添加激活功能，Tenants可从另一层面控制对User的认证。因此，认证过程的最后一步即是检查所获取到的User实例是否为null和是否处激活状态。

## 7 独立接口有必要吗

这里的Authenticationservice接口并没有一个技术上的实现，真的有必要为其创建一个独立接口并将其与实现类分离在不同的层和模块中吗？
没必要。我们只需要创建一个实现类即可，其名字与领域服务的名字相同。

对于领域服务来说，以上的例子同样是可行的。我们甚至会认为这样的例子更合适，因为我们知道不会再有另外的实现类。
**但不同的租户可能有不同的安全认证标准，所以产生不同的认证实现类也是有可能的**。
然而此时，SaaSOvation的团队成员决定弃用独立接口，而是采用了上例中的实现方法。

## 8 给领域服务的实现类命名

常见的命名实现类的方法便是给接口名加上Impl后缀。按这种方法，我们的认证实现类为AuthenticatioinServicelmpl。实现类和接口通常被放在相同包下，这是一种好的做法吗？

如果你釆用这种方式来命名实现类，这往往意味着你根本就不需要一个独立接口。因此，在命名一个实现类时，我们需要仔细地思考。这里的 AuthenticationServicelmpI并不是好的实现类名，而DefaultEncryptionAuthenticationService也不见得能好到哪。

基于这些原因，团队决定去除独立接口，而直接使用Authenticationservice作为实现类。

如果领域服务具有多个实现类，应根据各种实现类的特点进行命名。而这往往又意味着在你的领域中存在一些特定的行为功能。

> 有人认为采用相似名字命名接口和实现类有助代码浏览和定位。但还有人认为将接口和实现类放在相同包中会使包变很大，这是种糟糕的模块设计，因此偏向于将接口和实现类放在不同包，**依赖倒置原则**便是如此：将接口Encryptionservice放在领域模型，而将 MD5EncryptionService放在基础设施层。

对于非技术性的领域服务，去除独立接口不会破坏可测试性。因为这些领域服务所依赖的所有接口都可以注入进来或通过服务工厂(Service Factory)进行创建。
非技术性的领域服务，比如计算性的服务等都必须进行正确性测试。

有时，领域服务总是和领域密切相关，并且不会有技术性的实现，或者不会有多个实现，此时采用独立接口便只是一个风格上的问题。
独立接口对于解偶来说是有用处的，此时客户端只需要依赖于接口，而不需要知道具体的实现。但是，如果我们使用了依赖注入或者工厂，即便接口和实现类是合并在一起的，我们依然能达到这样的目的。

以下的DomainRegistry可在客户端和服务实现之间进行解耦，此时的DomainRegistry便是一个服务工厂。

```java
//DomainRegistry在客户端与具体实现之间解耦
UserDescriptor userDescriptor =
	DomainRegistry
		.authenticationservice()
		.authenticate(aTenantld, aUsername, aPassword);
```

或者，如果你使用的是依赖注入，你也可以得到同样的好处:

```java
public class SomeApplicationService ... {
	@Autowired
	private Authenticationservice authenticationservice;
```

依赖倒置容器（比如Spring）将完成服务实例的注入工作。由于客户端并不负责服务的实例化，它并不知道接口类和实现类是分开的还是合并。
与服务工厂和依赖注入相比，有时他们更倾向于将领域服务作为构造函数参数或者方法参数传入,因为这样的代码拥有很好的可测试性，甚至比依赖注入更加简单。也有人根据实际情况同时采用以上三种方式，并且优先采用基于构造函数的注入方式。本章中有些例子使用了DomainRegistry,但这并不是说我们应该优 先考虑这种方式。互联网上很多源代码例子都倾向于使用构造函数注入，或者直接将领域服务作为方法参数传入。

## 9 计算案例

该例子来自于敏捷项目管理上下文。该例子中的领域服务从多个聚合的值对象中计算所需结果。
目前来看，我们没有必要使用独立接口。该领域服务总是采用相同方式进行计算。除非有需求变化，不然我们没必要分离接口和实现。


上很多源代码例子都倾向于使用构造函数注入，或者直 接将领域服务作为方法参数传入。
中有些例子使用了DomainRegistry,但这并不是说我们应该优 先考虑这种方式

釆用领域服务比静态方法更好。此时的领域服务和当前的静态方法完成类似功能：计算并返回一个BusinessPriorityTotals值对象。但是，该领域服务还需要完 成额外的工作，包括找到一个Product中所有未完成的Backlogitem, 然后单独计算它们的BusinessPriority。

BacklogltemRepository用于查找所有未完成的Backlogitem实例。一个未完成的Backlogitem是拥有Planned、Scheduled或Committed状态的Backlogitem，而状态为Done或Removed的Backlogitem则是已完成的。
不推荐将资源库对 Backlogitem的获取放在聚合实例，相反，将其放在领域服务中则是一种好的做法。

有了一个Product下所有未完成的BacklogItem，我们便可对遍历之并计算BusinessPriority总和。总和进一步用于实例化一个 BusinessPriorityTotals，然后返回给客户端。
领域服务不一定非常复杂，即使有时的确会出现这种情况。上面的例子则是非常简单的。请注意，在上面的例子中，绝对不能将业务逻辑放到应用层。即使你认 为这里的for循环非常简单，它依然是业务逻辑。当然，还有另外的原因：

实例化BusinessPriorityTotals时，它的totalValue属性由totalBenefit和 totalPenalty相加所得。这是和领域密切相关的业务逻辑，自然不能泄漏到应用层。你可能会说，可以将totalBenefit和totalPenalty作为两个参数分别传给应用服务。虽然这是一种改进模型的方式，但这也并不意味着将剩下的计算逻辑放在应用层就是合理的。

```java
BusinessPriorityTotals businessPriorityTotals =
  new BusinessPriorityTotals(
      totalBenefit,
      totalPenalty,
       // aTotalValue
      totalBenefit + totalPenalty,
      totalCost,
      totalRisk);
return businessPriorityTotals;
```

```java
public class Productservice ... {
	private BusinessPriorityTotals productBusinessPriority(
		String aTenantld,
		String aProductld) {
		BusinessPriorityTotals productBusinessPriority = DomainRegistry
		.businessPrioritycalculator()
		.businessPriorityTotals(
		new Tenantld(aTenantld),
		new Productld(aProductld));
		return productBusinessPriority;
	}
}
```

上例中，应用层中的一个私有方法负责获取一个Product的总业务优先级。该方法可能只需要向Productservice的客户端（比如用户界面）提供BusinessPriorityTotals 的部分数据即可。

## 转换服务

在基础设施层中，更加技术性的领域服务通常是那些用于集成目的的服务。 正是这个原因，我们将与此相关的例子放在了集成限界上下文中，你将看到领域服务接口、实现类、适配器和不同的转换器。

## 为领域服务创建一个迷你层

有时可能希望在实体和值对象上创建一个领域服务的迷你层。但这样可能导致贫血领域模型。
但对有些系统，为领域服务创建一个不至于导致贫血领域模型的迷你层很值得。这取决于领域模型的特征。对于本书的身份与访问上下文来说，这样的做法是非常有用的。
如果你正工作在这样的领域里，并且你决定为领域服务创建一个迷你层，这样的迷你层不同于应用层中的服务。
应用服务关心的是事务和安全，但这些不该出现在领域服务。


> 虽然我们不会将业务逻辑放在应用层，但是应用层却可以作为领域服务的客户端。