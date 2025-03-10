# 单元化架构最佳实践指南！

## 0 前言

- 单元化架构通过减少故障影响范围来增强系统的弹性。
- 单元化架构是对于那些无法接受停机或可能对最终用户产生负面影响的系统的良好选择。
- 单元化架构可能很复杂，有一些最佳实践可以遵循，以提高成功的机会。
- 在推出单元化架构或将现有的云原生/微服务架构改造/转变为单元化架构时，有一些实际步骤需要考虑。
- 单元不是微服务的替代品，而是一种帮助在大规模情况下管理微服务的方法。许多适用于微服务的最佳实践、问题和实际步骤也适用于单元。

一切都在不断失败，而单元化架构可以是接受这些失败、隔离它们并保持整个系统可靠运行的好方法。然而，这种架构在设计和实施上可能很复杂。本文探讨了组织可以用来成功的一些最佳实践、问题和采用指南。

##  1 单元化架构的最佳实践

组织在采用单元化架构以提高系统的可管理性和弹性时，应考虑几个最佳实践。

### 1.1 考虑用例

单元化架构可能更复杂、成本更高。并不是每个系统都需要像S3那样的规模和可靠性；考虑用例，以及是否值得额外投资。对于需要：

1. 高可用性。
2. 大规模扩展，以避免级联故障。
3. 非常低的RTO（恢复时间目标）。
4. 系统如此复杂，以至于自动化测试覆盖不足以覆盖所有测试用例。

还要考虑系统的大小。对于一些组织来说，每个单元代表一个完整的堆栈：每个服务都部署在每个单元中，单元之间不相互通信（[DoorDash](https://doordash.engineering/2024/01/16/staying-in-the-zone-how-doordash-used-a-service-mesh-to-manage-data-transfer-reducing-hops-and-cloud-spend/), [Slack](https://slack.engineering/slacks-migration-to-a-cellular-architecture/)）。对于其他组织来说，每个单元都有自己的有界业务上下文，系统由多个相互通信的单元层组成（[WSO2](https://github.com/wso2/reference-architecture/blob/master/reference-architecture-cell-based.md), [Uber的DOMA](https://www.uber.com/en-GB/blog/microservice-architecture/)）。后者可能更灵活，但无疑更复杂。

### 1.2 明确单元所有权

如果多个单元层相互通信，理想情况下，每个单元应该由一个单一的团队拥有，该团队有权构建和交付单元的功能到生产环境。

考虑使单元的边界“团队大小”，以便于建立所有权，并帮助团队根据业务需求发展系统。技术如领域驱动设计和事件风暴可以帮助找到这些边界。

###  1.3 隔离单元

单元应尽可能相互隔离，以最小化可靠性和安全问题的爆炸半径。这在现实世界中并不总是可能的，但共享资源应该谨慎进行，因为它可以显著降低使用单元的好处。

在AWS上，确保隔离的一个好方法是每个单元使用一个单独的账户。许多账户可能会带来管理问题，但它们默认提供了很好的爆炸半径保护，因为您必须显式允许跨账户访问数据和资源。

重要的是要考虑单个单元是否应该位于单个可用性区域，或者将其服务复制到多个可用性区域以利用可用性区域提供的物理隔离。这里有一个权衡。

#### 1.3.1 单个AZ

在单个AZ设计中，每个单元在单个可用性区域中运行：

![](https://p.ipic.vip/vt9j5t.jpg)

优点：可以检测到AZ故障，并采取行动处理它，例如将所有请求路由到其他区域。

缺点：

1. 恢复可能会因为需要将单元内容复制到另一个AZ而变得复杂，这可能会破坏单元设计的隔离属性
2. 根据路由器设计，客户端可能需要知道特定区域的端点。

#### 1.3.2 多个AZ

在多AZ设计中，每个单元跨越两个或更多可用性区域运行：

![](https://p.ipic.vip/4ytskx.jpg)

多AZ的优势在于使用[区域](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/regional-services.html)云资源（如Amazon DynamoDB）使单元在单个区域失败时更具弹性。

缺点：

1. 当服务仅在一个AZ中遇到问题时，可能会发生灰色故障，这使得排除给定单元的特定AZ变得困难
2. 此外，可能还会有额外的跨AZ数据传输成本。[DoorDash](https://doordash.engineering/2024/01/16/staying-in-the-zone-how-doordash-used-a-service-mesh-to-manage-data-transfer-reducing-hops-and-cloud-spend/) 使用监控和具有[AZ感知路由](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/zone_aware)的服务网格来优化成本，尽可能在同一个AZ内保持流量

#### 1.3.3 单元故障转移

如果单个AZ设计中的AZ变得不可用，会发生什么？受影响的用户请求将被路由到哪里？

一个答案是根本不处理故障转移：单元旨在隔离故障。必须修复故障，受影响的单元才能重新使用。

另一个选择是使用灾难恢复策略将单元数据复制到另一个AZ中的另一个单元，并开始将请求路由到新单元。这里的风险是复制可能会降低单元的隔离。复制过程将取决于数据需求和底层数据存储（区域云服务可以帮助这里：见[利用高可用云服务](https://www.infoq.com/articles/cell-based-architecture-adoption-guidelines/#leveragehighavailabilitycloudservice)）。

### 1.4 自动化部署

就像微服务一样，要大规模运行单元，您需要能够在几小时内甚至最好是几分钟内部署它们——而不是几天。快速部署需要标准化、自动化的方式来管理单元，这一点至关重要，取决于对工具、监控和流程的投资。

标准化并不意味着每个团队都需要使用相同的语言、数据库或技术。然而，应该存在一个被良好理解和标准化的方式来打包和部署应用程序到新的或现有的单元。理想情况下，配置/部署管道应该允许团队：

1. 创建新的单元。
2. 监控它们的健康状况。
3. 向它们部署更新的代码。
4. 监控部署状态。
5. 节流和扩展单元。

部署管道应该减少平台用户的复杂性和[认知负荷](https://techbeacon.com/app-dev-testing/forget-monoliths-vs-microservices-cognitive-load-what-matters)——这到底是什么样子将取决于组织的大小和技术栈。

### 1.5 使路由可靠

![](https://p.ipic.vip/6yhx6w.jpg)

单元上方的路由器可以说是系统中最关键的部分：没有它，其他什么都不工作，它可能成为单点故障。设计它尽可能简单是很重要的，因此有几件事需要考虑：

1. 技术：DNS、API网关、自定义服务。每个都有其自身的优缺点（例如，管理DNS的生命周期）。
2. 利用高可用服务。例如，如果路由器需要存储客户单元，使用S3或DynamoDB，它们具有非常高的SLA，而不是单个MySQL实例。
3. 分离[控制和数据平面](https://docs.aws.amazon.com/whitepapers/latest/advanced-multi-az-resilience-patterns/control-planes-and-data-planes.html)。例如，客户单元可以存储在S3中，路由器可以在桶中查找数据。单独的控制平面管理桶的内容，控制平面可以失败而不影响路由。
4. 考虑认证应该在哪里发生。例如，应该是：
   1. 在路由器中，这简化了下游服务，但如果失败会增加一个大的爆炸半径。
   2. 在单元中，这可能会增加每个单元的复杂性和重复性。
5. 路由器必须知道单元的位置和健康状况，以便将请求从失败或正在排出的单元路由出去。

### 1.6 限制单元间通信

如果多个单元层相互通信，它应该通过明确定义的API进行，这有助于封装单元的逻辑，并允许单元内的服务在不过分破坏API契约的情况下发展。根据复杂性需求，这个API可能由单元中的服务直接暴露，或者由单元边缘的网关暴露。

避免单元之间的频繁通信。限制单元之间的依赖将帮助它们保持故障隔离并避免级联故障。

您可能需要使用内部层来协调单元之间的流量，例如服务网格、API网关或自定义路由器。同样，必须小心确保所使用的任何东西都不是单点故障。异步消息传递也可能有所帮助，只要消息传递层是可靠的。

### 1.7 利用高可用云服务

如上文路由部分所述，许多云服务已经为高可用性而构建（通常使用像[EBS](https://www.youtube.com/watch?v=6IknqRZMFic)和[Azure AD](https://techcommunity.microsoft.com/t5/microsoft-entra-blog/identity-at-ignite-strengthen-resilience-with-identity/ba-p/2747271)这样的单元）。这些服务可以简化您的选择并避免重新发明轮子。

考虑云服务的[SLA](https://queue.acm.org/detail.cfm?id=3096459)，无论它们是全球的、区域的还是区域的，以及如果给定的云服务失败，将如何影响系统的性能。

## 2 基于单元架构的潜在问题

### 2.1 获取组织支持

单元化架构可能很复杂，运行成本更高，因此像许多技术项目一样，它需要组织的支持才能成功。

对于管理层来说，专注于业务影响可能是有帮助的，例如增加速度（团队可以更自信地部署新代码）和提高可用性（满意的客户和更好的声誉）。

它还需要架构、DevOps和开发团队的支持和投资，以构建和运行具有足够隔离、监控和自动化的单元，因此请确保尽早让他们参与以帮助指导过程。

### 2.2 避免单元间共享

在单元之间共享资源，如数据库，可能看起来是减少复杂性和成本的好方法，但它降低了单元之间的隔离，并使得一个单元中的故障更有可能影响其他单元。

关键问题是：如果这个共享资源失败，会有多少单元受到影响？如果答案是很多，那么存在问题，并且没有完全实现基于单元架构的好处。

共享数据库可以作为迁移到单元的旅程中的一个有用的步骤，但不应无限期共享；还应有一个拆分数据库的计划。

### 2.3 避免创建过于复杂的路由器

路由器可能是单点故障，并且随着复杂性的增加，遇到某种故障的风险会增加。向路由器添加功能以简化单元服务可能很诱人，但每个决策都必须权衡对系统整体可靠性的影响。执行一些故障模式分析以识别和减少路由器中的故障点。

例如，如果路由器需要从数据库中查找单元映射，那么在启动路由器时将数据库存储在内存中可能比依赖每个请求的数据访问更快、更可靠。

### 2.4 错过单元间的复制和迁移

可能很诱人，认为单元迁移是一个高级功能，并在项目开始时跳过它，但它对架构的成功至关重要。如果单元失败或变得过载（例如，两个大客户最终位于同一个单元），一些客户需要迁移到另一个单元。实际的样子将取决于路由和数据分区，但总体思路是：

1. 确定要迁移到的单元（要么是具有容量的现有单元，要么是新创建的一个）。

2. 从旧单元的数据库复制任何所需数据到目标单元。
3. 更新路由器配置，使目标单元对相关客户生效。

还需要与路由层集成，以确保在正确的时间将请求路由到正确的单元。

![](https://p.ipic.vip/22gdhz.jpg)

复制可能由单元故障触发，或者复制单元以便另一个单元始终准备就绪。这复制到底是什么样子将取决于单元的数据模式、恢复点目标（RPO）和恢复点目标（RTO）需求：数据库级复制、消息传递和S3都是选项。见[AWS上的灾难恢复工作负载白皮书](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html)以获取更多关于恢复策略的讨论。

### 2.5 避免云资源限制

如果系统每个单元消耗大量云资源，可能会遇到云提供商施加的[软限制或硬限制](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html?ref=wellarchitected)。软限制可以请求增加，但硬限制可能由服务或硬件限制施加，并且是固定的。

在AWS上，许多限制可以通过每个单元使用[单独的账户](https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/benefits-of-using-multiple-aws-accounts.html)来避免。

### 2.6 平衡逻辑和数据的复制

在保持单元尽可能隔离与避免服务之间逻辑和数据复制之间存在权衡。与微服务一样，存在“不要重复自己”（DRY）原则的相同权衡。

随着系统的发展，通过在不同单元的服务之间复制代码来避免紧密耦合和促进隔离可能更好，甚至在有意义的情况下复制数据。这个问题没有通用的对错答案：应该根据具体情况进行评估。进行[故障模式分析](https://learn.microsoft.com/en-us/azure/architecture/resiliency/failure-mode-analysis)可以帮助识别单元之间的依赖关系何时可能成为问题，以及何时应该被移除，可能通过复制来实现。

## 3 采用指南

你已经决定单元化架构是一个不错的选择——现在怎么办？

### 3.1 迁移

引用Martin Fowler的话：[如果你进行大爆炸式重写，唯一确定的事情就是大爆炸](https://twitter.com/GOTOber/status/1232995046959566848)。

将现有的微服务架构迁移为单元化架构可能会很棘手。常见的第一步是将第一个单元定义为现有系统，并在顶部放置一个路由器，然后像进行单体到微服务迁移一样剥离服务到新的单元。

![](https://p.ipic.vip/fne2v3.jpg)

组织可用许多单体到微服务策略。如：

1. 使用领域驱动设计（DDD）定义有界上下文，帮助决定什么放入新的单元。
2. 首先将服务逻辑迁移到单独的单元，然后在后续阶段将共享数据分割到单元特定的数据库。
3. 考虑在决定首先分割到单元的业务领域时，哪些业务领域会从更大的弹性中受益。
4. 确保有足够的自动化和可观察性来管理新的、更复杂的系统。

### 3.2 部署

在单元化架构中，部署单元是部署的单位。新应用程序版本应该首先部署到单个单元，以测试它们如何与系统的其余部分交互，同时最小化广泛故障的风险。使用像金丝雀或蓝/绿部署这样的技术进行增量更改，并在继续推出之前验证系统仍然按预期运行（通常在[波](https://aws.amazon.com/builders-library/automating-safe-hands-off-deployments/)中）。 

如果新版本有问题，应该回滚更改，并暂停部署，直到进一步调查可以确定问题。

“烘焙时间”的概念也很重要，以确保新单元有足够的时间来服务真实流量，以便监控可以检测问题。确切的时间将根据系统类型、风险承受能力和复杂性而有所不同。

### 3.3 可观察性

除了[正确监控微服务](https://www.infoq.com/articles/microservice-monitoring-right-way/)之外，还应该增加单元监控和仪表板，以查看聚合和单元级别的视图：

1. 单元的数量。
2. 单元的健康状况。
3. 部署波的状态。
4. 任何对单元重要的SLO指标。

这些都可以从标准云指标中派生出来，但可能需要额外的标记标准来获得单元级别的视图。

由于单元化架构可能会增加云使用量，因此跟踪资源使用情况和每个单元的成本至关重要。目标是允许团队提出问题，如“我的单元成本是多少？”、“我如何更有效地使用资源？”以及“单元大小是否优化？”。

### 3.4 扩展

在单元化架构中，扩展单元是扩展的单位：根据负载水平可以水平部署更多。确切的扩展标准将取决于工作负载，但可能包括请求数量、资源使用情况、客户大小等。扩展可以进行到什么程度将取决于单元的隔离程度——任何共享资源都将限制可扩展性。

架构还应该小心知道单元的限制，并避免发送超出其资源处理能力的流量，例如通过路由器或单元本身进行负载卸载。

### 3.5 单元大小

决定每个单元的大小是一个关键的权衡。许多较小的单元意味着较小的爆炸半径，因为每个单元处理的用户请求较少。小单元也更容易测试和管理（例如，更快的部署时间）。

另一方面，较大的单元可能更好地利用可用容量，更容易将大客户放入单个单元，并使整个系统更容易管理，因为单元较少。

![](https://p.ipic.vip/kcxf6m.jpg)

考虑：

1. 爆炸半径。
2. 性能。一个单元可以容纳多少流量，以及它如何影响其性能？
3. 预留空间，以防现有单元需要开始处理来自失败单元的流量。
4. 平衡分配的资源，以确保单元不会因处理预期负载而功能不足，但也不会功能过强，成本过高。

较小单元的优点是：

1. 它们有较小的爆炸半径，因此任何故障都会影响较小比例的用户。
2. 它们不太可能达到任何云提供商的配额限制。
3. 降低测试新部署的风险，因为针对较小的用户集合更容易。
4. 每个单元的用户较少意味着迁移和故障转移可以更快。

较大单元的优点是：

1. 它们更容易操作和复制，因为它们较少。
2. 它们更有效地利用容量。
3. 减少必须将大用户分割到多个单元的风险。

正确的选择将严重依赖于正在构建的确切系统。许多组织从较大的单元开始，随着信心和工具的改进而转向较小的单元。

### 3.6 数据分区

与单元大小密切相关的是分区数据和决定客户流量应该路由到哪个单元。许多因素可以通知分区方法，包括业务需求、数据属性的基数和单元的最大大小。

分区键可以是客户ID，如果请求可以分割成不同的客户。每个单元被分配一定比例的客户，以便同一个客户始终由同一个单元服务。如果某些客户比其他客户大，则需要确保没有单个客户比单元的最大大小大。

其他选项是地理区域、市场类型、轮询或基于负载。

无论采用哪种方法，覆盖路由器并手动将客户放置在特定单元中进行测试和隔离某些工作负载也可能是有益的。

### 3.7 映射

使用客户ID意味着路由器将需要将客户映射到单元。存储映射数据的最简单方法可能是一个表格，该表格将每个客户映射到单元：

![](https://p.ipic.vip/ke89o1.jpg)

其显著优点是它非常容易实现，并简化了在单元之间迁移客户：只需更新数据库中的映射。

这种方法的缺点是它需要一个数据库，这可能是单点故障，并引起性能问题。

其他方法是[一致性哈希](https://en.wikipedia.org/wiki/Consistent_hashing)和将一系列键映射到单元。然而，它们都不够灵活，因为它们有热单元的风险，使迁移更具挑战性。

### 3.8 衡量成功

理想情况下，组织应该考虑采用单元化架构来实现特定的业务目标，例如通过提高技术平台的稳定性来提高客户满意度。

通过迁移，应该可以衡量朝着这些目标取得的进展。通常，目标是在面对故障时的弹性，其中一些定量措施是有用的：

1. 健康指标，包括错误率或正常运行时间（例如，当EBS迁移到单元时，错误率大幅下降）。
2. MTTR（平均修复时间）。
3. 性能指标，包括p75、p95和p99的请求处理时间，以查看额外的层是否对延迟产生不利影响。如果客户现在由比之前系统更小的单元服务，性能可能会提高！
4. 资源使用情况，以确保成本没有失控，如果必要，可以优化。

这些都意味着良好的可观察性，以衡量性能、可靠性和成本。

## 4 结论

单元化架构可能令人生畏且复杂，但许多好的做法对微服务开发人员来说很熟悉。任何在这个规模上的架构都应该包括部署自动化、可观察性、扩展和故障恢复；单元化架构也不例外。这些在设计单元大小时、单元隔离、数据所有权和从故障中恢复的策略时必须考虑。

也许需要做出的关键决策是关于数据分区的，以及密切相关的，如何分配和映射请求流量到单元。更简单的方法可能更容易实现，但它们通常缺乏运行单元所需的灵活性。

公共云提供商提供许多高可用性服务，可以利用这些服务来提高可靠性，同时简化设计。AWS在单元化架构方面在线上占有最多的份额，有关他们如何将这种模式应用于自己的系统以及使用AWS服务实现的建议的讨论。

组织必须确保单元化架构适合他们，并且迁移不会造成比解决的问题更多的问题。将现有系统迁移到单元化架构可以分步骤进行，以最小化干扰，并验证更改按预期工作，然后再继续。

构建现代、可靠和可理解的分布式系统的挑战持续增长，单元化架构是接受、隔离和面对故障保持可靠的有价值方式。