# SpringBoot3.4发布声明

## 1 从 Spring Boot 3.3 升级到 3.4

### 1.1 RestClient 和 RestTemplate

新增对 `RestClient` 和 `RestTemplate` 自动配置的支持，可用 Reactor Netty 的 `HttpClient` 或 JDK 的 `HttpClient`。支持的客户端优先级：

- Apache HTTP Components (`HttpComponentsClientHttpRequestFactory`)
- Jetty Client (`JettyClientHttpRequestFactory`)
- Reactor Netty 的 `HttpClient` (`ReactorClientHttpRequestFactory`)
- JDK 的 `HttpClient` (`JdkClientHttpRequestFactory`)
- 简单的 JDK `HttpURLConnection` (`SimpleClientHttpRequestFactory`)

若类路径没有 HTTP 客户端库，默认可能用 `JdkClientHttpRequestFactory`，而非之前的 `SimpleClientHttpRequestFactory`。可以通过设置 `spring.http.client.factory` 来选择特定客户端，支持的值包括 `http-components`、`jetty`、`reactor`、`jdk` 和 `simple`。

所有五个客户端默认会遵循重定向。如需禁用此行为，可以将 `spring.http.client.redirects` 设置为 `dont-follow`。

### 1.2 Apache HTTP Components 和 Envoy

Apache HTTP Components 的 `HttpClient` 在 HTTP/1.1 的 TLS 升级默认行为有所改变。虽然大多数代理服务器可以正确处理升级，但使用 Envoy 或 Istio 时可能会遇到问题。

如果需要恢复以前的行为，可用新的 `ClientHttpRequestFactoryBuilder`。定义一个 `HttpComponentsClientHttpRequestFactoryBuilder` 并按以下方式自定义：

```java
@Bean
public HttpComponentsClientHttpRequestFactoryBuilder httpComponentsClientHttpRequestFactoryBuilder() {
    return ClientHttpRequestFactoryBuilder.httpComponents()
            .withDefaultRequestConfigCustomizer((builder) -> builder.setProtocolUpgradeEnabled(false));
}
```

### 1.3 配置属性的 Bean 验证

之前，当一个 `@ConfigurationProperties` 类标注了 `@Validated` 并通过 Bean Validation（如 Hibernate Validator）实现进行验证时，其嵌套属性会在绑定时被验证，无论是否使用 `@Valid` 。

Spring Boot 3.4 开始，验证行为与 Bean Validation 规范一致。验证从 `@ConfigurationProperties` 注解的类开始，并仅在嵌套属性对应的字段标注了 `@Valid` 时才进行级联验证。

升级时，请检查使用了 Bean Validation 约束的 `@ConfigurationProperties` 类，并在需要对嵌套属性进行级联验证的地方添加 `@Valid`。

### 1.4 基于 Bean 的条件

`@ConditionalOnBean` 和 `@ConditionalOnMissingBean` 在 `@Bean` 方法中使用并设置了 `annotation` 属性时，其行为有所更改。两者仍然默认使用 `@Bean` 方法的返回类型作为匹配的默认类型。然而，从 Spring Boot 3.4 开始，如果设置了 `annotation`，此默认值将不会被使用。如果需要恢复以前的行为，请同时指定一个与 `@Bean` 方法返回类型一致的 `value` 和 `annotation`。

### 1.5 优雅关机

嵌入式 Web 服务器（Jetty、Reactor Netty、Tomcat 或 Undertow）的优雅关机功能现已默认启用。如需恢复之前的立即关机行为， `server.shutdown` 置 `immediate`。

### 1.6 Paketo Tiny Builder 用于构建 OCI 镜像

在使用 Maven 的 `spring-boot:build-image` 目标为 JVM 应用程序构建 OCI 镜像时，默认的 Cloud Native Buildpacks 构建器已从 `paketobuildpacks/builder-jammy-base` 更改为 `paketobuildpacks/builder-jammy-java-tiny`。这将生成更小的镜像。但由于 `tiny` 构建器不包含 shell，因此可能无法适用于需要通过启动脚本运行的应用程序。有关自定义构建器的详细信息，请参阅 [Maven 文档](https://docs.spring.io/spring-boot/3.4/maven-plugin/build-image.html#build-image.examples.builder-configuration)。

### 1.7 使用 Testcontainers 定义动态属性

通过将 `DynamicPropertyRegistry` 注入到 `@Bean` 方法中来定义动态属性的功能已被弃用，现在默认会导致失败。替代方法是实现一个单独的 `@Bean` 方法，返回一个 `DynamicPropertyRegistrar`，此方法应注入属性值来源的容器。这种方式解决了一些容器生命周期问题，并确保属性值来源的容器在属性被使用之前已经启动。

如果仍希望注入 `DynamicPropertyRegistry`（需承担可能的生命周期问题），可以将 `spring.testcontainers.dynamic-property-registry-injection` 设置为 `warn` 或 `allow`。前者会记录警告但允许注入，后者则会完全恢复 Spring Boot 3.3 的行为。

### 1.8 @AutoConfigureTestDatabase 与容器的集成

`@AutoConfigureTestDatabase` 注解现在会自动检测数据库是否来源于容器。如果是，则无需再添加 `replace=Replace.NONE`。

如需恢复旧的行为，可以在注解中设置 `replace=Replace.AUTO_CONFIGURED`。

### 1.9 控制 Actuator 端点的访问权限

启用和禁用端点的支持已被重新设计，替换为更细粒度的访问控制模型。新的模型不仅支持禁用端点（访问级别为 `none`）和完全启用端点（访问级别为 `unrestricted`），还支持只允许端点操作的“只读”访问（访问级别为 `read-only`）。

以下属性已被弃用：

- `management.endpoints.enabled-by-default`
- `management.endpoint.<id>.enabled`

其替代属性为：

- `management.endpoints.access.default`
- `management.endpoint.<id>.access`

同样，`@Endpoint` 注解中的 `enableByDefault` 属性已被弃用，新的 `defaultAccess` 属性取代了它。

作为更改的一部分，`enabled-by-default` 的应用现在更加一致，并与是否使用了 `@ConditionalOnEnabledEndpoint` 无关。如果升级后失去了某个端点的访问权限，可以将 `management.endpoint.<id>.access` 设置为 `read-only` 或 `unrestricted`，或者将 `management.endpoint.<id>.enabled` 设置为 `true`，以使端点重新可用。

另外，还引入了一个新属性，用于控制 Actuator 端点访问级别的上限：

- `management.endpoints.access.max-permitted`

此属性限制所有配置的访问级别。例如，如果 `management.endpoints.access.max-permitted` 设置为 `read-only`，而 `management.endpoint.loggers.access` 设置为 `unrestricted`，则日志记录端点仅允许只读访问。

### 1.10 Cloud Foundry 中 @ConditionalOnAvailableEndpoint 暴露的更改

在使用 `@ConditionalOnAvailableEndpoint` 注解时，原本使用的枚举值 `EndpointExposure.CLOUD_FOUNDRY` 已被弃用，建议改用 `EndpointExposure.WEB`。对于典型的 Spring Boot 应用，这一更改通常不会有影响。但如果你定义了自定义的 Cloud Foundry 特定 Actuator 端点 bean，则需要将条件更新为使用 `EndpointExposure.WEB`。

### 1.11 HtmlUnit 4.3

HtmlUnit 已升级至 4.3。本次升级中，依赖坐标从 `net.sourceforge.htmlunit:htmlunit` 变更为 `org.htmlunit:htmlunit`，包名也从 `com.gargoylesoftware.htmlunit.` 更新为 `org.htmlunit.`。升级时，请相应调整构建配置和代码导入。

### 1.12 Selenium HtmlUnit 4.22

Selenium HtmlUnit 已更新至 4.22。本次升级中，依赖坐标从 `org.seleniumhq.selenium:htmlunit-driver` 变更为 `org.seleniumhq.selenium:htmlunit3-driver`。升级时，请相应调整构建配置。

### 1.13 WebJars 定位器集成

[为了更快的启动时间和更高效的 WebJars 资源解析](https://github.com/spring-projects/spring-framework/issues/27619)，你需要在构建文件（如 pom.xml）中将依赖从 `org.webjars:webjars-locator-core` 更新为 `org.webjars:webjars-locator-lite`。这两项依赖由 Spring Boot 统一管理。需要注意，Spring 对 `org.webjars:webjars-locator-core` 的支持已被弃用，并将在未来版本中移除。有关详细信息，请参阅 [参考文档的相关章节](https://docs.spring.io/spring-boot/3.4/reference/web/servlet.html#web.servlet.spring-mvc.static-content)。

### 1.14 OkHttp 依赖管理的移除

Spring Boot 不再直接依赖 OkHttp，因此也不再对其版本进行管理。如果你的应用程序包含 OkHttp 依赖，请更新构建以选择适合需求的 OkHttp 版本。

### 1.15 原生镜像中的 Netty

Spring Boot 3.4 使用的 Netty 版本尚未完全被 Native Build Tools 提供的 GraalVM 可达性元数据支持。要在原生镜像中正常使用 Netty，需手动升级 GraalVM 可达性元数据版本。

对于 Maven：

```xml
<plugin>
	<groupId>org.graalvm.buildtools</groupId>
	<artifactId>native-maven-plugin</artifactId>
	<configuration>
		<metadataRepository>
			<version>0.3.14</version>
		</metadataRepository>
	</configuration>
</plugin>
```

### 1.16 @MockBean 和 @SpyBean 的弃用

`@MockBean` 和 `@SpyBean` 注解已被弃用，建议使用 Spring Framework 提供的 `@MockitoBean` 和 `@MockitoSpyBean`。新的注解功能与 Spring Boot 提供的注解功能并不完全一致。例如，`@MockitoBean` [尚不支持在 `@Configuration` 类中使用](https://github.com/spring-projects/spring-framework/issues/33934)，你可能需要在测试类中直接注解字段。

### 1.17  Spring Boot 3.2 的弃用项

Spring Boot 3.2 中标记为弃用并计划在 3.4 中移除的类、方法和属性现已被移除。在升级之前，请确保没有调用这些弃用的功能。

### 1.18 最低要求更改

## 2 新功能和亮点

### 2.1 结构化日志

新增了对结构化日志的支持，包括 Elastic Common Schema（`ecs`）、Graylog 扩展日志格式（`gelf`）和 Logstash（`logstash`）的内置支持。可以通过设置 `logging.structured.format.file` 为 `ecs`、`gelf` 或 `logstash` 来启用结构化文件日志记录。类似地，可以通过设置 `logging.structured.format.console` 来启用结构化控制台日志记录。

有关更多信息，包括如何定义自定义格式，请参阅[参考文档](https://docs.spring.io/spring-boot/3.4/reference/features/logging.html#features.logging.structured)。

### `@Fallback` Bean

`@ConditionalOnSingleCandidate` 现在支持 `@Fallback` Bean。如果存在一个主 Bean，或者没有主 Bean 但存在一个非回退的单一候选 Bean，则该条件会匹配。

### 定义附加 Bean

在类型匹配时，基于 Bean 的条件现在会忽略非默认候选 Bean。通过声明某个 Bean 为非默认候选（使用 `@Bean(defaultCandidate=false)`），现在可以定义一个特定类型的 Bean，而不会导致相同类型的自动配置 Bean 退出。这简化了配置，例如在同一个应用程序中使用 [两个 `DataSource` Bean](https://docs.spring.io/spring-boot/3.4/how-to/data-access.html#howto.data-access.configure-two-datasources) 或 [两个 `EntityManagerFactory` Bean](https://docs.spring.io/spring-boot/3.4/how-to/data-access.html#howto.data-access.use-multiple-entity-managers)。

### ClientHttpRequestFactory 构建器

新增了 `ClientHttpRequestFactoryBuilder` 接口，可以为特定技术创建 `ClientHttpRequestFactory` 实例。构建器支持对底层组件进行细粒度自定义，并提供一致的方式来应用通用设置。

以下构

建器可以通过接口的静态工厂方法创建：

- Apache HTTP Components（`ClientHttpRequestFactoryBuilder.httpComponents()`）
- Jetty Client（`ClientHttpRequestFactoryBuilder.jetty()`）
- Reactor Netty 的 `HttpClient`（`ClientHttpRequestFactoryBuilder.reactor()`）
- JDK 的 `HttpClient`（`ClientHttpRequestFactoryBuilder.jdk()`）
- 简单的 JDK `HttpURLConnection`（`ClientHttpRequestFactoryBuilder.simple()`）

有关更多详细信息，包括如何通过配置属性应用通用设置，请参阅[参考文档](https://docs.spring.io/spring-boot/3.4/reference/io/rest-client.html#io.rest-client.clienthttprequestfactory.configuration)。

### 可观察性改进

#### 应用程序分组

新增了 `spring.application.group` 属性，用于对应用程序进行分组，例如将属于某个业务部门的多个应用程序归类。当设置此属性时，它也会出现在日志消息中。此行为可通过 `logging.include-application.group` 属性控制。应用程序分组信息还会自动添加到 OpenTelemetry 的 `Resource` 中。

#### OTLP

支持通过 gRPC 传输发送 OTLP span。要启用此功能，请将新配置属性 `management.otlp.tracing.transport` 设置为 `grpc`。该属性默认为 `http`。此外，还新增了相应的服务连接支持。

新增的 `management.otlp.logs` 配置属性可用于自动配置 OpenTelemetry 的 `OtlpHttpLogRecordExporter` 和 `SdkLoggerProvider`。

#### 其他可观察性更新

`ProcessInfoContributor` 现在还会显示堆和非堆内存的使用信息。

新增的 `management.otlp.tracing.export.enabled`、`management.wavefront.tracing.export.enabled` 和 `management.zipkin.tracing.export.enabled` 属性，可用于更细粒度地启用或禁用跟踪导出。

### 对 MockMvc 的 AssertJ 支持

当类路径中存在 AssertJ 时，将自动配置 `MockMvcTester`。`MockMvcTester` 提供了一种流畅的 API，用于定义请求和断言。它可以在任何可以注入 `MockMvc` 的地方使用。

有关更多详细信息，请参阅 Spring Framework 参考文档的[专用章节](https://docs.spring.io/spring-framework/reference/6.2-SNAPSHOT/testing/mockmvc/assertj.html)。

### Spring Pulsar

Spring Boot 现在提供了配置默认租户和命名空间的属性。这些默认值适用于主题 URL 未完全限定时生产或消费消息的情况。可以通过 `spring.pulsar.defaults.topic.tenant` 和 `spring.pulsar.defaults.topic.namespace` 配置这些属性，或者定义自己的 `PulsarTopicBuilder` bean。如果需要禁用默认值，将 `spring.pulsar.defaults.topic.enabled=false`。

新增了 `PulsarContainerFactoryCustomizer` 接口，用于自定义自动配置的 `PulsarContainerFactory`。

`spring.pulsar.consumer.subscription.name` 配置属性现在应用于自动配置的 Pulsar 监听器容器。

引入了两个用于配置 Pulsar 客户端并发性的属性：

- `spring.pulsar.client.threads.io`：控制用于处理与代理连接的线程数。
- `spring.pulsar.client.threads.listener`：控制用于消息监听器的线程数。

此外，新属性 `spring.pulsar.listener.concurrency` 可控制自动配置的 Pulsar 消息监听器容器的并发性。

### Couchbase 身份验证

Couchbase 集群现在支持通过客户端证书进行身份验证，作为用户名和密码身份验证的替代方案。详细信息请参阅[参考文档](https://docs.spring.io/spring-boot/3.4/reference/data/nosql.html#data.nosql.couchbase)。

### FreeMarker

FreeMarker 变量现可通过定义一个或多个类型为 `FreeMarkerVariablesCustomizer` 的 bean 来自定义。自定义器将按定义的顺序（如果有）依次调用。

### 嵌入式 ActiveMQ Classic Broker 的支持

由于 ActiveMQ Classic 重新支持嵌入式 Broker，自动配置已更新以支持此功能。

需要注意，与 Spring Boot 2.7.x 不同，ActiveMQ starter 仅限于客户端。如果需要使用嵌入式 Broker，需要将 `org.apache.activemq:activemq-broker` 添加到应用程序中。

### 配置元数据

注解处理器现在支持检测 `Enum` 类型的默认值。如果你为自定义属性手动添加了元数据来提供默认值，请确保将其移除。

### 弃用和替换自动配置类

为简化自动配置的演进，Spring Boot 引入了对自动配置类的弃用和替换支持。替换可以在新的 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.replacements` 文件中声明。更多详情请参阅[参考文档](https://docs.spring.io/spring-boot/3.4/reference/features/developing-auto-configuration.html#features.developing-auto-configuration.locating-auto-configuration-candidates.deprecating)。

### 虚拟线程

如果启用了虚拟线程，以下组件将默认使用虚拟线程：

- `OtlpMeterRegistry`
- Undertow Web 服务器

### 镜像构建改进

Spring Boot 默认使用 [`paketobuildpacks/builder-jammy-java-tiny`](https://github.com/paketo-buildpacks/builder-jammy-java-tiny) 构建器。此构建器原生支持 ARM 和 x64 平台。

Maven插件新增了 `trustBuilder` 选项，用于控制 CNB 生命周期的调用方式，以提高安全性。默认信任的构建器包括 Paketo 项目、Heroku 和 Google 的构建器。详情请参阅 [Maven](https://docs.spring.io/spring-boot/3.4/maven-plugin/build-image.html#build-image.customization)文档。

新增的 `imagePlatform` 选项允许为不同于主机平台的操作系统和架构构建镜像，前提是主机平台支持模拟其他系统（

例如，使用 Apple Silicon 的 Mac 上的 Rosetta 模拟 AMD 架构）。详情请参阅 [Maven](https://docs.spring.io/spring-boot/3.4/maven-plugin/build-image.html#build-image.customization)文档。

### Docker Compose 改进

Docker Compose 现在支持多个 Docker Compose 配置文件。

#### 命令行参数

新属性 `spring.docker.compose.start.arguments` 和 `spring.docker.compose.stop.arguments` 可以用来指定在启动和停止服务时传递给 Docker Compose 子命令的额外命令行参数。新增了 `spring.docker.compose.arguments` 属性，用于向 Docker Compose 传递参数。

#### 更新支持

- Postgres [`POSTGRES_HOST_AUTH_METHOD=trust` 环境变量](https://github.com/docker-library/docs/tree/657557822ecebebf0fa6bea96536125881c5bfb2/postgres#postgres_host_auth_method) 现在被支持。
- 通过分别使用 `redis/redis-stack` 和 `redis/redis-stack-server` 容器镜像，添加了对 Redis Stack 和 Redis Stack Server 的支持。
- 通过使用 `grafana/otel-lgtm` 容器镜像，添加了对 [Grafana LGTM](https://grafana.com/blog/2024/03/13/an-opentelemetry-backend-in-a-docker-image-introducing-grafana/otel-lgtm/) 的支持。
- 添加了对 Hazelcast 的支持（使用 `HazelcastConnectionDetails`）。
- 添加了对 OTLP 日志记录的支持。

### Testcontainers 改进

- 添加了对 `org.testcontainers.kafka.KafkaContainer` 的支持。
- 通过分别使用 `redis/redis-stack` 和 `redis/redis-stack-server` 容器镜像，添加了对 Redis Stack 和 Redis Stack Server 的支持。
- 添加了对 `org.testcontainers.grafana.LgtmStackContainer` 的支持。
- 添加了对 Hazelcast 的支持（使用 `HazelcastConnectionDetails`）。
- 添加了对 OTLP 日志记录的支持。
- 添加了对 `RedisContainer` 的支持。

### Actuator

#### 可插拔的 Actuator 暴露器

现在可以扩展 Spring Boot，以可插拔的方式暴露 actuator 端点。可以实现新的 `EndpointExposureOutcomeContributor` 接口来影响 `@ConditionalOnAvailableEndpoint` 条件。

这个扩展应该使得提供类似我们现有的 Cloud Foundry 支持的额外平台集成变得更加容易。

#### SSL 信息和健康检查

如果您使用的是 SSL 包，现在有一个新端点显示 SSL 信息（有效期、发行者、主题等），可在 `/actuator/info` 下获取。该端点还会显示即将过期的证书，以提醒您需要尽快轮换证书。新增了名为 `management.health.ssl.certificate-validity-warning-threshold` 的配置属性来配置阈值。

还添加了一个新的健康检查来监控 SSL 证书。如果证书无效，它将状态设置为 `OUT_OF_SERVICE`。

#### `/actuator/scheduledtasks` 端点中的额外信息

[`/scheduledtasks` Actuator 端点](https://docs.spring.io/spring-boot/3.4/api/rest/actuator/scheduledtasks.html#scheduled-tasks.retrieving) 现在公开了有关计划任务的额外元数据，例如 "下一次预定执行时间" 和 "上次执行时间、状态和异常"。

## 3 依赖升级

Spring Boot 3.4 迁移到了几个 Spring 项目的新版：

- [Spring AMQP 3.2](https://github.com/spring-projects/spring-amqp/releases/tag/v3.2.0)
- [Spring Authorization Server 1.4](https://github.com/spring-projects/spring-authorization-server/releases/tag/1.4.0)
- [Spring Batch 5.2](https://github.com/spring-projects/spring-batch/releases/tag/v5.2.0)
- [Spring Data 2024.1](https://github.com/spring-projects/spring-data-commons/wiki/Spring-Data-2024.1-Release-Notes)
- [Spring Framework 6.2](https://github.com/spring-projects/spring-framework/releases/tag/v6.2.0)
- [Spring HATEOAS 2.4](https://github.com/spring-projects/spring-integration/releases/tag/2.4.0)
- [Spring Integration 6.4](https://github.com/spring-projects/spring-integration/releases/tag/v6.4.0)
- [Spring Kafka 3.3](https://github.com/spring-projects/spring-kafka/releases/tag/v3.3.0)
- [Spring Pulsar 1.2](https://github.com/spring-projects/spring-pulsar/releases/tag/1.2.0)
- [Spring Security 6.4](https://github.com/spring-projects/spring-security/releases/tag/6.4.0)
- [Spring Session 3.4](https://github.com/spring-projects/spring-session/releases/tag/3.4.0)

许多第三方依赖项也已更新，其中一些更值得注意的包括：

- Apache Http Client 5.4
- [AssertJ 3.26](https://github.com/assertj/assertj/releases/tag/assertj-build-3.26.0)
- [Artemis 2.37](https://activemq.apache.org/components/artemis/download/release-notes-2.37.0)
- Elasticsearch Client 8.15
- [Flyway 10.20](https://documentation.red-gate.com/flyway/release-notes-and-older-versions/release-notes-for-flyway-engine)
- [Gson 2.11](https://github.com/google/gson/releases/tag/gson-parent-2.11.0)
- Hibernate 6.6
- HtmlUnit 4.5.0
- JUnit Jupiter 5.11
- Jackson 2.18.0
- Jedis 5.2
- Kafka 3.8
- Lettuce 6.4
- [Liquibase 4.29](https://docs.liquibase.com/start/release-notes/liquibase-release-notes/liquibase-4.29.0.html)
- Log4j 2.24
- [HtmlUnit 4.3](https://github.com/HtmlUnit/htmlunit/releases/tag/4.3.0)
- [MariaDB 3.4](https://mariadb.com/kb/en/mariadb-connector-j-3-4-0-release-notes/)
- [Micrometer 1.14](https://github.com/micrometer-metrics/micrometer/releases/tag/v1.14.0)
- [Micrometer Tracing 1.4](https://github.com/micrometer-metrics/tracing/releases/tag/v1.4.0)
- [Mockito 5.13](https://github.com/mockito/mockito/releases/tag/v5.13.0)
- MongoDB 5.2.0
- [MySQL 9.1](https://dev.mysql.com/doc/relnotes/connector-j/en/news-9-1-0.html)
- [OpenTelemetry 1.41](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.41.0)
- [Oracle Database 23.4](https://download.oracle.com/otn-pub/otn_software/jdbc/23c/JDBC-UCP-ReleaseNotes-23ai.txt)
- R2DBC MySQL 1.3
- Rabbit AMQP Client 5.22
- Rabbit Stream Client 0.18.0
- [Reactor 2024.0](https://github.com/reactor/reactor/releases/tag/2024.0.0)
- [Selenium 4.25](https://raw.githubusercontent.com/SeleniumHQ/selenium/selenium-4.25.0/java/CHANGELOG)
- [Testcontainers 1.20.3](https://github.com/testcontainers/testcontainers-java/releases/tag/1.20.3)
- [XMLUnit 2.10](https://github.com/xmlunit/xmlunit/releases/tag/v2.10.0)

### 杂项

除了上述变化外，还包括许多小的调整和改进：

- 现在可以使用 `Customizer<Liquibase>` bean 在使用 Liquibase 之前对其进行自定义。
- 现在可以通过定义 `JCachePropertiesCustomizer` bean 来自定义用于创建 JCache `CacheManager` 的属性。
- 现在可以通过定义名为 `viewNameTranslator` 的 bean 来自定义 Spring MVC 使用的 `RequestToViewNameTranslator`。
- 现在可以使用 `LettuceClientOptionsBuilderCustomizer` bean 来自定义 Lettuce 的 `ClientOptions`。对于整个 `LettuceClientConfiguration` 的更广泛配置，继续使用 `LettuceClientConfigurationBuilderCustomizer`。
- 可以使用新的自定义器 `ProxyConnectionFactoryCustomizer` 来自定义 R2DBC 的 `ProxyConnectionFactory`。
- 如果发生 Spring Security 注销，现在会发布一个审计事件。
- 现在可以使用新的属性 `spring.mail.ssl.*` 通过 SSL 包配置 `JavaMailSender` 上的 TLS。
- 现在可以使用新的 `spring.gson.strictness` 属性配置 GSON 的严格性。
- 现在可以在 JavaBean 风格的配置属性的字段上使用 `@Name` 来自定义其名称。
- 当从另一个 `DataSource` 派生时，`DataSourceBuilder` 现在可以使用源 DataSource 的 URL 确定驱动程序类名称，如果它不公开驱动程序类名称。
- [就绪和存活健康探针](https://docs.spring.io/spring-boot/3.4-SNAPSHOT/reference/actuator/endpoints.html#actuator.endpoints.kubernetes-probes) 现在在 Cloud Foundry 平台上自动启用。
- 可以使用新属性 `spring.application.version` 读取和设置应用程序版本。属性的默认值取自清单中的 `Implementation-Version`。
- 自动配置的 `EntityManagerFactoryBuilder` 也定义了原生（例如 Hibernate）属性。
- 即使没有使用 `@EnableScheduling`，Spring Integration 的 `TaskScheduler` 现在也支持虚拟线程。
- `@ConditionalOnAvailableEndpoint` 现在有一个 `value` 别名用于 `endpoint`。
- 添加了一个新的配置属性 `spring.data.web.pageable.serialization-mode`，用于配置 Spring Data Web 的序列化模式。
- 使用 `SpringApplication.from(…)` 语法时，现在可以指定要激活的额外配置文件。
- Spring Boot 插件不再在构建包环境中设置 `BP_NATIVE_IMAGE: true`。
- 注册的 `@ConfigurationProperties` beans 现在尊重 `@DependsOn`、`@Description`、`@Fallback`、`@Lazy`、`@Primary`、`@Scope` 和 `@Role` 注解。
- 现在支持 Log4j2 的 `MultiFormatStringBuilderFormattable` 在结构化日志中。
- 添加了一个新的配置属性 `spring.jms.listener.max-messages-per-task`，用于配置监听器在单个任务中处理的最大消息数。
- 默认的安全配置现在暴露了映射到附加路径的健康组。此外，两个 `EndpointRequest` 类现在提供了 `toAdditionalPaths(…)` 方法。
- 现在可以通过属性设置会话 cookie 的[分区](https://developer.mozilla.org/en-US/docs/Web/Privacy/Privacy_sandbox/Partitioned_cookies)属性。
- 添加了一个新的 `server.jetty.max-form-keys` 属性，用于自定义 Jetty 的最大表单键。
- 添加了新的属性 `management.otlp.logging.connect-timeout` 和 `management.otlp.tracing.connect-timeout` 以配置与 OTLP 收集器的连接超时。
- 添加了通过 OTLP 传输日志时的 gRPC 传输支持。
- 如果在构建过程中绑定了容器中使用的目录，现在会显示警告。
- 如果使用 `--enable-sbom=sbom` 构建原生镜像，现在会自动检测到这个 SBOM。
- `DatabaseDriver` 枚举现在支持 ClickHouse JDBC 驱动程序。
- 可以使用新属性 `management.logging.export.enabled`
- 和 `management.otlp.logging.export.enabled` 禁用日志导出。
  - 可以通过定义带有 `@BatchTaskExectuor` 注解的 `TaskExecutor` bean 来自定义 Spring Batch 使用的 `TaskExecutor`。
  - Spring Session 自动配置现在支持响应式 Web 应用程序中的 `indexed` 存储库类型。
  - 如果未配置池挂起并且创建了检查点，`HikariCheckpointRestoreLifecycle` 现在会记录一条警告。

## 3.4 版本 Spring Boot 的弃用

  - 弃用 `spring.gson.lenient`，改用 `spring.gson.strictness`。
  - 弃用 `@MockBean` 和 `@SpyBean`，改用 Spring Framework 的 `@MockitoBean` 和 `MockitoSpyBean`。
  - 弃用 `org.springframework.boot.ResourceBanner#getApplicationVersion(Class<?>)`，改用 `spring.application.version` 属性。
  - 弃用 `org.springframework.boot.SpringApplication#logStartupInfo(boolean)`，改用 `org.springframework.boot.SpringApplication#logStartupInfo(ConfigurationApplicationContext)`。
  - 弃用 `org.springframework.boot.logging.logback.ApplicationNameConverter`，改用 `org.springframework.boot.logging.logback.EnclosedInSquareBracketsConverter`。
  - 弃用 `org.springframework.boot.actuate.autoconfigure.endpoint.expose.EndpointExposure#CLOUD_FOUNDRY`，改用 `org.springframework.boot.actuate.autoconfigure.endpoint.expose.EndpointExposure#WEB`。
  - 弃用 `org.springframework.boot.actuate.autoconfigure.tracing.otlp.OtlpTracingConnectionDetails#getUrl()`，改用 `getUrl(Transport)`。
  - 弃用 `org.springframework.boot.actuate.autoconfigure.tracing.OpenTelemetryAutoConfiguration`，改用 `org.springframework.boot.actuate.autoconfigure.tracing.OpenTelemetryTracingAutoConfiguration`。
  - 弃用 `OtlpAutoConfiguration`，改用 `OtlpTracingAutoConfiguration`。
  - 弃用 `management.endpoints.enabled-by-default` 和 `management.endpoint.<id>.enabled`，改用 `management.endpoints.access.default` 和 `management.endpoint.<id>.access`。
  - 弃用 `@Endpoint` 上的 `enableByDefault`，改用 `defaultAccess`。