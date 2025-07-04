# Java 新闻速递：JDK 25 进入收尾阶段，JDK 26 专家组成立，Hibernate Search 发布，Oracle 推出 Project Crema

## 0 前言

上周Java 新闻回顾重点：JDK 25进入Rampdown第一阶段、JDK 26专家组成立、Hibernate Search 8.0.0.Final发布、Grails 7.0.0第四个里程碑版本发布、Open Liberty 25.0.0.6测试版发布、Eclipse JNoSQL、Helidon 和 JBang 的小版本更新，以及 Oracle Labs 推出的新项目 Project Crema 预览。

## 1 OpenJDK

JEP 509：[JFR CPU时间分析（实验性）](https://openjdk.org/jeps/509) 已从“拟定为目标”升级为“已确定目标”，将会包含在 JDK 25。该JEP提议增强 JDK Flight Recorder（JFR），使其可在 Linux 系统记录 CPU 时间的分析信息。

## 2 JDK 25

JDK 25 的[早期访问版本 Build 26](https://github.com/openjdk/jdk/releases/tag/jdk-25%2B26)上周上线，包含自 Build 25 以来的多项[更新](https://github.com/openjdk/jdk/compare/jdk-25%2B25...jdk-25%2B26)，修复了多个[问题](https://bugs.openjdk.org/browse/JDK-8357287?jql=project %3D JDK AND fixversion %3D 25 and "resolved in build" %3D b26 order by component%2C subcomponent)。完整详情可见[发行说明](https://jdk.java.net/25/release-notes)。

根据 JDK 25 的[发布计划](https://openjdk.org/projects/jdk/25/#Schedule)，Oracle Java平台首席架构师 [Mark Reinhold](https://www.linkedin.com/in/markreinhold) [宣布](https://mail.openjdk.org/pipermail/jdk-dev/2025-June/010191.html)，JDK 25已进入 Rampdown Phase One，即主线源码仓库已分支为[JDK稳定版本仓库](https://github.com/openjdk/jdk/tree/jdk25)，不会再添加新JEP特性。JDK 25 正式发布（GA）将于 2025 年 9 月进行，最终包含18项功能：

- JEP 470：[加密对象的PEM编码（预览）](https://openjdk.org/jeps/470)
- JEP 502：[稳定值（预览）](https://openjdk.org/jeps/502)
- JEP 503：[移除32位x86平台支持](https://openjdk.org/jeps/503)
- JEP 505：[结构化并发（第五次预览）](https://openjdk.org/jeps/505)
- JEP 506：[作用域值](https://openjdk.org/jeps/506)
- JEP 507：[在模式匹配、instanceof 和 switch 中使用原始类型（第三次预览）](https://openjdk.org/jeps/507)
- JEP 508：[向量API（第十次孵化）](https://openjdk.org/jeps/508)
- JEP 509：[JFR CPU时间分析（实验性）](https://openjdk.org/jeps/509)
- JEP 510：[密钥派生函数API](https://openjdk.org/jeps/510)
- JEP 511：[模块导入声明](https://openjdk.org/jeps/511)
- JEP 512：[简洁的源文件和实例 main 方法](https://openjdk.org/jeps/512)
- JEP 513：[灵活的构造方法体](https://openjdk.org/jeps/513)
- JEP 514：[AOT 命令行参数优化](https://openjdk.org/jeps/514)
- JEP 515：[AOT 方法分析](https://openjdk.org/jeps/515)
- JEP 518：[JFR 协作采样](https://openjdk.org/jeps/518)
- JEP 519：[紧凑对象头](https://openjdk.org/jeps/519)
- JEP 520：[JFR 方法计时与追踪](https://openjdk.org/jeps/520)
- JEP 521：[新一代 Shenandoah 垃圾回收器](https://openjdk.org/jeps/521)

JDK 25 将是继 JDK 21、17、11 和 8 之后的下一代长期支持（LTS）版本。

## 3 JDK 26

JSR 401：[Java SE 26](https://jcp.org/en/jsr/detail?id=401) 已于上周正式批准，宣布成立四人专家组，成员包括 [Simon Ritter](https://www.linkedin.com/in/siritter/)（Azul Systems）、[Iris Clark](https://www.linkedin.com/in/iris-clark-49159b13b/)（Oracle）、[Stephan Herrmann](https://github.com/stephan-herrmann)（Eclipse Foundation）和 [Christoph Langer](https://www.linkedin.com/in/christoph-langer-764280208/)（SAP SE）。Clark 将担任规范负责人。JDK 26 的[计划时间表](https://openjdk.org/projects/jdk/26/spec/)包括：2025年11月到2026年2月的公开评审期，GA版本预计在2026年3月发布。

此外，JDK 26 的[Build 0](https://github.com/openjdk/jdk/releases/tag/jdk-26%2B0) 和 [Build 1](https://github.com/openjdk/jdk/releases/tag/jdk-26%2B1) 也在本周发布，修复了部分[初期问题](https://bugs.openjdk.org/browse/JDK-8355746?jql=project %3D JDK AND fixVersion %3D "26" AND "Resolved In Build" %3D b01 order by component%2C subcomponent)。

开发者可通过 [Java Bug Database](https://bugreport.java.com/bugreport/) 提交 JDK 25 的问题反馈。

## 4 Jakarta EE

Eclipse 基金会 Jakarta EE 开发者倡导者 [Ivar Grimstad](https://se.linkedin.com/in/ivargrimstad) 在他每周的 [Hashtag Jakarta EE 博客](https://www.agilejava.eu/)中更新了 Jakarta EE 11 和 EE 12 的进展：

> 该庆祝了！Jakarta EE 11 平台的所有发布审查材料都已提交，作为规范委员会的导师，我将于6月9日（周一）启动发布审查投票。这意味着最迟将在6月24日正式发布。希望那天有蛋糕……
>
> 随着 EE 11 推出，接下来的重点将转向 [Jakarta EE 12](https://jakarta.ee/specifications/platform/12/)。目前计划评审已完成，平台项目已启动并开始定义里程碑，[详细计划](https://jakartaee.github.io/platform/jakartaee12/JakartaEE12ReleasePlan)包括制定 *Milestone 0*，确保各个子规范项目准备就绪。

Jakarta EE 11 的发布经历了五个里程碑版本，包括2024年12月发布的 [Core Profile](https://jakarta.ee/specifications/coreprofile/)、2025年4月发布的 [Web Profile](https://jakarta.ee/specifications/webprofile/)，以及平台版的候选发布版本，预计正式发布将在2025年6月。

## 5 Eclipse JNoSQL

[Eclipse JNoSQL](https://www.jnosql.org/) 1.1.8 发布，作为 [Jakarta NoSQL](https://jakarta.ee/specifications/nosql/) 规范的兼容实现，此版本带来以下更新：

- 支持图数据库类型，新增 Java 的 Graph API，采用 Neo4j 的 [Cypher 查询语言](https://neo4j.com/product/cypher-graph-query-language/)
- 新增 Quarkus 扩展：[quarkus-jnosql-core](https://quarkus.io/extensions/io.quarkiverse.jnosql/quarkus-jnosql-core/)，支持 MongoDB、ArangoDB、Cassandra 和 Hazelcast

图形 API 的实现细节可参考这篇 [LinkedIn 博客](https://quarkus.io/extensions/io.quarkiverse.jnosql/quarkus-jnosql-core/)。

## 6 Spring Framework

[Spring Cloud](https://spring.io/projects/spring-cloud) 2022.0.11（代号 Kilburn）作为第11个维护版本，[已发布](https://spring.io/blog/2025/06/02/spring-cloud-2022-0-11-aka-kilburn-has-been-released)，包含多项Bug修复和依赖升级，尤其是：

- [Spring Cloud Config](https://spring.io/projects/spring-cloud-config) 4.0.11 修复了 [CVE-2025-22232](https://spring.io/security/cve-2025-22232)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway) 4.0.12 修复了 [CVE-2025-41235](https://spring.io/security/cve-2025-41235)

## 7 Hibernate

[Hibernate Search](https://hibernate.org/search/) 8.0.0.Final [正式发布](https://in.relation.to/2025/06/06/hibernate-search-8-0-0-Final/)，包括：

- 兼容 Hibernate ORM 7.0.0.Final
- 与 [Hibernate Models](https://github.com/hibernate/hibernate-models/blob/main/README.adoc) 集成增强
- 在 [Hibernate Search DSL](https://docs.jboss.org/hibernate/stable/search/reference/en-US/html_single/#search-dsl) 中支持请求指标聚合
- 各类Bug修复

更多详情请参阅[发行说明](https://hibernate.atlassian.net/issues/?jql=project%3D10061 AND fixVersion%3D33769)。

## 8 Helidon

Helidon 4.2.3 发布，主要改进包括：

- 在 [Metrics](https://helidon.io/docs/v4/se/metrics/metrics)、[Health Checks](https://helidon.io/docs/v4/se/health)、[OpenAPI](https://helidon.io/docs/v4/se/openapi/openapi) 和 [Config](https://helidon.io/docs/v4/se/config/introduction) API 输出中添加 **`nosniff`** 的 **`X-Content-Type-Options`** 头部，防止浏览器自动推断内容类型
- 修复了 **`SecurityEnvironment`** 类中 **`queryParams()`** 方法无法获取查询参数的问题

详细变更见 [更新日志](https://github.com/helidon-io/helidon/blob/4.2.3/CHANGELOG.md)。

## 9 Open Liberty

[Open Liberty](https://openliberty.io/) 25.0.0.6-beta [发布](https://openliberty.io/blog/2025/06/03/25.0.0.6-beta.html)，新特性包括：

- 为 Java EE 7 和 8 应用回移支持 [Microprofile Health 4.0](https://github.com/microprofile/microprofile-health/blob/main/README.adoc) 规范（`mpHealth-4.0`）
- 更新了[基于文件的健康检查机制](https://blogs-draft-openlibertyio.mqj6zf7jocq.us-south.codeengine.appdomain.cloud/blog/2025/04/08/25.0.0.4-beta.html#backport)，新增了 **`server.xml`** 中的 **`startupCheckInterval`** 属性及其环境变量 **`MP_HEALTH_STARTUP_CHECK_INTERVAL`**，默认值为100毫秒

## 10 Grails

[Grails](https://grails.org/) 7.0.0 的第四个里程碑版本发布，更新内容包括：

- 由于迁移至 Apache 软件基金会，进行了[构件命名重构](https://github.com/apache/grails-core/blob/7.0.x/RENAME.md)
- 将多个仓库（如 **`grails-views`**、**`gsp`** 等）的源码整合至 **`grails-core`** 仓库中

详细信息见 [发布说明](https://github.com/apache/grails-core/releases/tag/v7.0.0-M4)。

## 11 JBang

[JBang](https://www.jbang.dev/) 0.126.0 发布，带来文档改进、Bug 修复和新特性，包括：

- 将 **`ResourceRef`** 从类更改为接口
- 引入 **`LazyResourceRef`** 和 **`LazyResourceResolver`**，支持开发者按需加载远程资源

更多信息请查阅 [发布说明](https://github.com/jbangdev/jbang/releases/tag/v0.126.2)。

## 12 Project Crema

Oracle Labs 的 GraalVM 开发者倡导者 [Alina Yurenko](https://www.linkedin.com/in/alinayurenko/) 在 [X 平台](https://x.com/alina_yurenko/status/1930241191418708072)上分享了新项目 [Project Crema](https://github.com/oracle/graal/issues/11327) 的预览。

该项目旨在“打破 Native Image 的默认封闭世界假设，允许在运行时动态加载和执行类”，主要包括：

- Java 解释器，构建在 **Native Image Layers** 之上（一个支持依赖基础镜像链的新项目，[详情](https://github.com/oracle/graal/issues/7626)）
- 支持 [Java 调试线协议（JDWP）](https://docs.oracle.com/en/java/javase/24/docs/specs/jdwp/jdwp-spec.html)

Yurenko 表示，开发者应“持续关注更多更新！”