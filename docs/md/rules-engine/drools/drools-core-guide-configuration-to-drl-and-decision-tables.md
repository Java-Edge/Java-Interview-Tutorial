# Drools 核心指南：从配置到 DRL 与决策表实战

## 1 概述

[Drools](https://www.drools.org/)，一种商业规则管理系统 (BRMS) 解决方案。提供一个规则引擎，该引擎处理事实并产生输出，作为规则和事实处理的结果。业务逻辑集中化，使变更快且成本低。

提供一种易于理解的格式，来编写规则，弥合业务和技术团队之间差距。

## 2 POM依赖

添加依赖：

```xml
<dependency>
    <groupId>org.kie</groupId>
    <artifactId>kie-ci</artifactId>
    <version>8.32.0.Final</version>
</dependency>

<dependency>
    <groupId>org.drools</groupId>
    <artifactId>drools-decisiontables</artifactId>
    <version>8.32.0.Final</version>
</dependency>
```

最新版：

- [kie-ci](https://mvnrepository.com/artifact/org.kie/kie-ci) 
- [drools-decisiontables](https://mvnrepository.com/artifact/org.drools/drools-decisiontables)

## 3 基本概念

- Facts – 规则输入的数据
- 工作内存 – 存储带有 *Facts* 的地方，在那里它们被用于模式匹配，可以被修改、插入和移除
- Rule – 代表一个将 *Facts* 与匹配动作关联的单一规则。它可以用 Drools 规则语言编写在 *.drl* 文件中，或者作为 *决策表* 写在 Excel 电子表格中
- 知识会话 – 它持有触发规则所需的所有资源；所有 *Facts* 都被插入会话中，然后触发匹配的规则
- 知识库 – 代表 Drools 生态系统中的知识，它有关于 *Rules* 所在资源的信息，同时它也创建知识会话
- 模块 – 一个模块持有多个可容纳不同会话的知识库

## 4 Java配置

为了在给定数据上触发规则，需用规则文件和 *Facts* 的位置信息实例化框架提供的类：

### 4.1 KieServices

一个线程安全的单例，作为一个中心枢纽，可访问Kie提供的其他服务。一般规则：

- getX()只返回另一个单例的引用
- newX()则创建一个新实例。 可通过其工厂获取KieServices引用：

KieServices类提供对所有 Kie 构建和运行时的访问。提供几个工厂、服务和实用方法。

#### 先得到一个KieServices实例

```java
KieServices kieServices = KieServices.Factory.get();
```

使用KieServices，将创建 *KieFileSystem*、*KieBuilder* 和 *KieContainer* 的新实例。

### 4.2 KieFileSystem

一个内存中的文件系统，负责读取和写入规则文件。

编程式定义 Drools 资源（如规则文件和决策表）的容器：

```java
private KieFileSystem getKieFileSystem() {
    KieFileSystem kieFileSystem = kieServices.newKieFileSystem();
    List<String> rules = Arrays.asList("com/javaedge/drools/rules/order-rules.drl", "com/javaedge/drools/rules/SuggestApplicant.drl", "com/javaedge/drools/rules/Product_rules.drl.xls");
    for (String rule : rules) {
        kieFileSystem.write(ResourceFactory.newClassPathResource(rule));
    }
    return kieFileSystem;
}
```

从classpath读取文件。

### 4.3 KieBuilder

将 KieFileSystem 传递给 KieBuilder 并用 *kb.buildAll()* 构建所有定义的规则来构建 KieFileSystem 的内容。

编译了规则并检查它们的语法错误：

```java
KieBuilder kieBuilder = kieServices.newKieBuilder(kieFileSystem);
kieBuilder.buildAll();
```

### 4.4 KieRepository

框架自动将构建结果的 *KieModule* 添加到 *KieRepository* 中：

```java
KieRepository kieRepository = kieServices.getRepository();Copy
```

### 4.5 KieContainer

包含规则的运行时环境，可以从中获取 KieSession。

现在可用其 *ReleaseId* 创建一个带有此 *KieModule* 的新 *KieContainer*。在这种情况下，Kie 会分配一个默认的 *ReleaseId*：

```java
ReleaseId krDefaultReleaseId = kieRepository.getDefaultReleaseId();
KieContainer kieContainer 
  = kieServices.newKieContainer(krDefaultReleaseId);Copy
```

### 4.6 KieSession

规则执行的上下文，用于触发规则评估和执行。

现可从 *KieContainer* 获取 *KieSession*。我们的应用程序与 *KieSession* 交互，它存储并执行运行时数据：

```java
KieSession kieSession = kieContainer.newKieSession();
```

### 完整配置

```java
public KieSession getKieSession() {
    KieBuilder kb = kieServices.newKieBuilder(getKieFileSystem());
    kb.buildAll();

    KieRepository kieRepository = kieServices.getRepository();
    ReleaseId krDefaultReleaseId = kieRepository.getDefaultReleaseId();
    KieContainer kieContainer = kieServices.newKieContainer(krDefaultReleaseId);

    return kieContainer.newKieSession();
}
```

## 5 实现规则

已完成设置，来看创建规则的几个选项。

通过分类申请人是否适合特定角色为例来探讨规则的实施，这是基于他当前的薪水和他拥有的工作经验年数。

#### 5.1 Drools 规则文件 (*.drl)

简而言之，Drools 规则文件包含所有的业务规则。

**一个规则包括一个 \*当-则\* 结构**，这里 *当* 部分列出要检查的条件，*则* 部分列出如果条件满足要采取的动作：

```java
package com.javaedge.drools.rules;

import com.javaedge.drools.model.Applicant;

global com.javaedge.drools.model.SuggestedRole suggestedRole;

dialect  "mvel"

rule "Suggest Manager Role"
    when
        Applicant(experienceInYears > 10)
        Applicant(currentSalary > 1000000 && currentSalary <= 
         2500000)
    then
        suggestedRole.setRole("Manager");
end
```

这条规则可以通过在 *KieSession* 中插入 *Applicant* 和 *SuggestedRole* 事实来触发：

```java
public SuggestedRole suggestARoleForApplicant(
    Applicant applicant,SuggestedRole suggestedRole){
    KieSession kieSession = kieContainer.newKieSession();
    kieSession.insert(applicant);
    kieSession.setGlobal("suggestedRole",suggestedRole);
    kieSession.fireAllRules();
    // ...
}
```

它测试 *Applicant* 实例上的两个条件，然后基于两个条件的满足，它在 *SuggestedRole* 对象中设置 *Role* 字段。

可以通过执行测试来验证这一点：

```java
@Test
public void whenCriteriaMatching_ThenSuggestManagerRole(){
    Applicant applicant = new Applicant("David", 37, 1600000.0,11);
    SuggestedRole suggestedRole = new SuggestedRole();
        
    applicantService.suggestARoleForApplicant(applicant, suggestedRole);
 
    assertEquals("Manager", suggestedRole.getRole());
}Copy
```

在这个例子中，我们使用了一些 Drools 提供的关键字。让我们了解它们的用法：

- ***package –\*** 这是我们在 *kmodule.xml* 中指定的包名，规则文件位于这个包内
- ***import*** – 这类似于 Java 的 *import* 声明，在这里我们需要指定我们正在插入 *KnowledgeSession* 中的类
- ***global –*** 这用于为会话定义全局级别变量；可以用来传递输入参数或获取输出参数以总结会话的信息
- ***dialect*** – 方言指定了在条件部分或动作部分的表达式中使用的语法。默认的方言是 Java。Drools 还支持方言 *mvel*；它是一种基于 Java 应用程序的表达式语言。它支持字段和方法/获取器访问
- ***rule*** – 这定义了一个带有规则名称的规则块
- ***when*** – 这指定了一个规则条件，在这个例子中检查的条件是 *Applicant* 有超过十年的 *experienceInYears* 和一定范围的 *currentSalary*
- ***then –*** 这个块在满足*when*块中的条件时执行操作。在这个例子中，*Applicant*角色被设定为经理

### **5.2. 决策表**

决策表提供了在预格式化的Excel电子表格中定义规则的能力。Drools提供的决策表的优势在于，即使对非技术人员来说也很容易理解。

当存在类似规则但具有不同值时，这种表格非常有用，这样可以更容易地在Excel表格中添加新行，而不是在*drl*文件中编写新规则。让我们看一下一个决策表的结构，以及基于产品类型对产品应用标签的示例：

![](https://p.ipic.vip/sr57dq.png)

决策表分为不同的部分，顶部部分类似于头部部分，在这里我们指定*RuleSet*（规则文件所在的包），*Import*（要导入的Java类）和*Notes*（关于规则目的的注释）。

**我们定义规则的中心部分称为\*RuleTable\*，它将适用于同一领域对象的规则分组在一起。**

在下一行中，我们有列类型*CONDITION*和*ACTION*。在这些列内，我们可以访问一行中提到的领域对象的属性及其在后续行中的值。

触发规则的机制类似于我们在*.drl*文件中看到的。

我们可以通过执行以下测试来验证应用这些规则的结果：

```java
@Test
public void whenProductTypeElectronic_ThenLabelBarcode() {
    Product product = new Product("Microwave", "Electronic");
    product = productService.applyLabelToProduct(product);
    
    assertEquals("BarCode", product.getLabel());
}
```

## 6 结论

在这篇简短的文章中，我们探讨了如何在应用程序中使用Drools作为业务规则引擎。我们还看到了在Drools规则语言中以及在易于理解的电子表格中编写规则的多种方式。

参考：

- https://blog.csdn.net/weixin_42176639/article/details/134959946