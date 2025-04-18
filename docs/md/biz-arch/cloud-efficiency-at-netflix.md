# Netflix云计算效率优化秘诀！

## 背景

在 Netflix，我们使用亚马逊网络服务（AWS）来满足我们的云基础设施需求，如计算、存储和网络，以构建和运行我们喜爱的流媒体平台。我们的生态系统使工程团队能够利用开源和专有解决方案的组合，大规模运行应用程序和服务。反过来，我们的自助服务平台允许团队更高效地创建和部署工作负载，有时甚至是自定义工作负载。这种多样化的技术环境会从各种基础设施实体中产生大量丰富的数据，数据工程师和分析师会从中协作，在一个持续的反馈循环中为工程组织提供可操作的见解，从而最终提升业务。

我们实现这一目标的一个重要方法是将高度精选的数据源民主化，这些数据将 Netflix 各项服务和团队的使用情况和成本模式阳光化。数据与洞察组织与我们的工程团队密切合作，共享关键的效率指标，使内部利益相关者能够做出明智的业务决策。

## 数据是关键



这就是我们的团队 Platform DSE（数据科学工程）的作用所在，它使我们的工程合作伙伴能够了解他们正在使用哪些资源，他们使用这些资源的效率和效果如何，以及与资源使用相关的成本。我们希望我们的下游消费者能够使用我们的数据集做出具有成本意识的决策。



为了以可扩展的方式满足这些众多的分析需求，我们开发了一种由两部分组成的解决方案：

1. Foundational Platform Data (FPD)基础平台数据：该组件为所有平台数据提供一个集中的数据层，具有一致的数据模型和标准化的数据处理方法。
2. Cloud Efficiency Analytics (CEA)云效率分析：该组件建立在 FPD 的基础上，提供一个分析数据层，在各种业务用例中提供时间序列效率指标。

![](https://cdn-images-1.readmedium.com/v2/resize:fit:800/0*vDQJiJUttlRSpVBo)

### 基础平台数据 (FPD)


我们与不同的平台数据提供商合作，获取他们各自平台的库存、所有权和使用数据。下面举例说明这一框架如何应用于 Spark 平台。FPD 与生产商签订数据合同，以确保数据质量和可靠性；这些合同使团队能够利用通用数据模型获得所有权。标准化的数据模型和处理促进了可扩展性和一致性。

![img](https://cdn-images-1.readmedium.com/v2/resize:fit:800/1*cln5xplS7lpdE0KOh0LE1Q.jpeg)

### 云效率分析（CEA 数据）

一旦基础数据准备就绪，CEA 就会消耗库存、所有权和使用数据，并应用适当的业务逻辑来生成不同粒度的成本和所有权归属。CEA 的数据模型方法是分门别类和透明化；我们希望下游消费者了解为什么他们会看到资源显示在他们的名字/机构下，以及这些成本是如何计算的。这种方法的另一个好处是，当引入新的业务逻辑或业务逻辑发生变化时，能够快速进行透视。

![](https://cdn-images-1.readmedium.com/v2/resize:fit:800/0*bvD7xqAO9T9m4s4G)

出于成本核算的目的，我们将资产分配给单个所有者，或在资产为多租户时分配成本。不过，我们也为不同的消费者提供不同汇总的使用情况和成本。

## 数据原则



作为效率指标的真实来源，我们团队的任务是提供准确、可靠和可访问的数据，提供全面的文档资料，以便在复杂的效率空间中游刃有余，并提供定义明确的服务水平协议（SLA），以便在延迟、中断或变更期间与下游消费者达成期望。

虽然所有权和成本看似简单，但由于业务基础设施和平台特定功能的广度和范围，数据集的复杂性相当高。服务可能有多个所有者，每个平台的成本启发法都是独一无二的，而且基础设施数据的规模也很大。当我们努力将基础设施的覆盖范围扩大到所有垂直业务领域时，我们面临着一系列独特的挑战：

### 适合大多数人的几种尺寸



尽管在将上游平台数据转化为 FPD 和 CEA 的过程中签订了数据合同并采用了标准化数据模型，但通常仍存在一定程度的特定平台独有的定制化问题。作为真相的集中来源，我们始终感到处理负担的紧张。在决策制定过程中，我们需要与数据生产者和消费者进行持续的透明对话，经常进行优先级检查，并与业务需求保持一致，因为我们是这一领域的明智领导者。

### 数据保证

为了保证数据的正确性和可信度，我们必须对管道中每一层的健康指标进行审核和可见性，以便快速调查问题并找出异常的根本原因。由于上游延迟和数据转换所需的时间，在确保数据正确性的同时保持数据的完整性变得非常具有挑战性。我们不断改进我们的审核工作，并结合反馈意见来完善和满足我们的 SLA。

### 抽象层

我们重视人而不是流程，工程团队为企业其他部门构建定制的 SaaS 解决方案的情况并不少见。虽然这有利于创新并提高了开发速度，但在理解和解释使用模式以及以对企业和最终消费者有意义的方式进行成本归因时，可能会产生一些难题。有了来自 FPD 的明确库存、所有权和使用数据，以及分析层中的精确归因，我们就能为下游用户提供衡量指标，无论他们是利用内部平台还是直接在 AWS 资源上进行构建。

## 未来展望

展望未来，我们的目标是继续为 FPD 和 CEA 搭建平台，力争在来年实现几乎全面的成本洞察覆盖。从长远来看，我们计划将 FPD 扩展到安全和可用性等其他业务领域。我们的目标是通过预测分析和 ML 来优化使用和检测成本中的异常情况，从而转向主动方法。

最终，我们的目标是让我们的工程组织在构建和维护让我们享受 Netflix 流媒体服务的各种服务时，能够做出注重效率的决策。