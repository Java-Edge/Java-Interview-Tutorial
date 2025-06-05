# 基本使用 - 资源与规则

## 0 前言

Sentinel分为：

- Sentinel 核心库

- Dashboard

核心库不依赖 Dashboard，但结合可取得最好效果。

### 资源

可为任何东西：服务，方法，甚至一段代码。使用 Sentinel 来进行资源保护的步骤:

1. 定义资源
2. 定义规则
3. 检验规则是否生效

有了资源，就可随时灵活定义各种流量控制规则。编码时，只需考虑这代码是否需保护，需，就定义为一个资源。

对主流框架提供适配，只需按适配中的说明配置，Sentinel 就默认定义提供的服务，方法等为资源。

## 1 定义资源

### 1.1 方式一：主流框架适配

主流框架如Dubbo、Spring Cloud、gRPC、Spring WebFlux、Reactor都适配。

### 1.2 方式二：抛异常定义资源

`SphU` 包含 try-catch 风格 API。当资源发生限流后抛 `BlockException`。可捕捉，进行限流后处理:

```java
// 1.5.0 版开始可try-with-resources
// 资源名可使用任意有业务语义的字符串，如方法名、接口名或其它可唯一标识的字符串。
try (Entry entry = SphU.entry("resourceName")) {
  // 被保护的业务逻辑
} catch (BlockException ex) {
  // 资源访问阻止，被限流或被降级
  // 在此处进行相应处理
}
```

若 entry 的时候传入了热点参数，则exit时也要带上对应参数（`exit(count, args)`），否则可能会有统计错误。这时不能用 try-with-resources。另外通过 `Tracer.trace(ex)` 来统计异常信息时，由于 try-with-resources 语法中 catch 调用顺序的问题，会导致无法正确统计异常数，因此统计异常信息时也不能在 try-with-resources 的 catch 块中调用 `Tracer.trace(ex)`。

**注意：** `SphU.entry(xxx)` 需要与 `entry.exit()` 方法成对出现，匹配调用，否则会导致调用链记录异常，抛出 `ErrorEntryFreeException` 异常。

### 1.3 方式三：返回布尔值定义资源

`SphO` 提供 if-else 风格 API。当资源发生了限流之后会返回 `false`，这个时候可以根据返回值，进行限流之后的逻辑处理。示例代码如下:

```java
  // 资源名可使用任意有业务语义的字符串
  if (SphO.entry("自定义资源名")) {
    // 务必保证finally会被执行
    try {
      /**
      * 被保护的业务逻辑
      */
    } finally {
      SphO.exit();
    }
  } else {
    // 资源访问阻止，被限流或被降级
    // 进行相应的处理操作
  }
```

### 1.4 方式四：注解定义资源

通过 `@SentinelResource` 定义资源，并配置 `blockHandler` 和 `fallback` 函数来进行限流后处理：

```java
// 原业务方法.
@SentinelResource(value = "pilot_list", 
                 blockHandler = "blockHandler")
@GetMapping("/getList")
public ResultBody list() {
    Map<String, List<Pilot>> pilotServiceList = pilotService.getList();
    return ResultBody.success(pilotServiceList);
}

// 原方法调用被限流/降级/系统保护的时候调用
public ResultBody blockHandler(BlockException e) {
    log.warn("触发限流", e);
    return ResultBody.error("服务繁忙，请稍后再试");
}
```

注意 `blockHandler` 函数会在原方法被限流/降级/系统保护的时候调用，而 `fallback` 函数会针对所有类型的异常。

### 1.5 方式五：异步调用支持

Sentinel 支持异步调用链路的统计。在异步调用中，需要通过 `SphU.asyncEntry(xxx)` 方法定义资源，并通常需要在异步的回调函数中调用 `exit` 方法。

示例：

```java
try {
    AsyncEntry entry = SphU.asyncEntry(resourceName);

    // 异步调用.
    doAsync(userId, result -> {
        try {
            // 在此处处理异步调用的结果.
        } finally {
            // 在回调结束后 exit.
            entry.exit();
        }
    });
} catch (BlockException ex) {
    // Request blocked.
    // Handle the exception (e.g. retry or fallback).
}
```

`SphU.asyncEntry(xxx)` 不会影响当前（调用线程）的 Context，因此以下两个 entry 在调用链上是平级关系（处于同一层），而不是嵌套关系：

```java
// 调用链类似于：
// -parent
// ---asyncResource
// ---syncResource
asyncEntry = SphU.asyncEntry(asyncResource);
entry = SphU.entry(normalResource);
```

若在异步回调中需要嵌套其它的资源调用（无论是 `entry` 还是 `asyncEntry`），只需要借助 Sentinel 提供的上下文切换功能，在对应的地方通过 `ContextUtil.runOnContext(context, f)` 进行 Context 变换，将对应资源调用处的 Context 切换为生成的异步 Context，即可维持正确的调用链路关系。示例如下：

```java
public void handleResult(String result) {
    Entry entry = null;
    try {
        entry = SphU.entry("handleResultForAsync");
        // Handle your result here.
    } catch (BlockException ex) {
        // Blocked for the result handler.
    } finally {
        if (entry != null) {
            entry.exit();
        }
    }
}

public void someAsync() {
    try {
        AsyncEntry entry = SphU.asyncEntry(resourceName);

        // Asynchronous invocation.
        doAsync(userId, result -> {
            // 在异步回调中进行上下文变换，通过 AsyncEntry 的 getAsyncContext 方法获取异步 Context
            ContextUtil.runOnContext(entry.getAsyncContext(), () -> {
                try {
                    // 此处嵌套正常的资源调用.
                    handleResult(result);
                } finally {
                    entry.exit();
                }
            });
        });
    } catch (BlockException ex) {
        // Request blocked.
        // Handle the exception (e.g. retry or fallback).
    }
}
```

此时的调用链就类似于：

```
-parent
---asyncInvocation
-----handleResultForAsync
```

更详细的示例可以参考 Demo 中的 [AsyncEntryDemo](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-basic/src/main/java/com/alibaba/csp/sentinel/demo/AsyncEntryDemo.java)，里面包含了普通资源与异步资源之间的各种嵌套示例。

## 2 规则的种类

Sentinel 所有规则都可在内存态中动态地查询及修改，修改之后立即生效。同时 Sentinel 也提供相关 API，供您来定制自己的规则策略。

### 2.1 流控规则（FlowRule）

#### 重要属性

|      Field      | 说明                                                         | 默认值                    |
| :-------------: | :----------------------------------------------------------- | :------------------------ |
|    resource     | 资源名，资源名是限流规则的作用对象                           |                           |
|      count      | 限流阈值                                                     |                           |
|      grade      | 限流阈值类型，QPS 或线程数模式                               | QPS 模式                  |
|    limitApp     | 流控针对的调用来源                                           | `default`：不区分调用来源 |
|    strategy     | 调用关系限流策略：直接、链路、关联                           | 根据资源本身（直接）      |
| controlBehavior | 流控效果（直接拒绝 / 排队等待 / 慢启动模式），不支持按调用关系限流 | 直接拒绝                  |

同一个资源可同时有多个限流规则。

#### Web设置

![](https://p.ipic.vip/hfw18y.png)

#### 代码定义

调用 `FlowRuleManager.loadRules()` 硬编码定义流量控制规则：

```java
private static void initFlowQpsRule() {
    List<FlowRule> rules = new ArrayList<>();
    FlowRule rule1 = new FlowRule();
    rule1.setResource(resource);
    // Set max qps to 20
    rule1.setCount(20);
    rule1.setGrade(RuleConstant.FLOW_GRADE_QPS);
    rule1.setLimitApp("default");
    rules.add(rule1);
    FlowRuleManager.loadRules(rules);
}
```

更多详细内容可以参考 [流量控制](https://sentinelguard.io/zh-cn/docs/flow-control.html)。

### 2.2 熔断降级规则（DegradeRule）

#### 属性

|       Field        | 说明                                                         | 默认值     |
| :----------------: | :----------------------------------------------------------- | :--------- |
|      resource      | 资源名，即规则的作用对象                                     |            |
|       grade        | 熔断策略，支持慢调用比例/异常比例/异常数策略                 | 慢调用比例 |
|       count        | 慢调用比例模式下为慢调用临界 RT（超出该值计为慢调用）；异常比例/异常数模式下为对应的阈值 |            |
|     timeWindow     | 熔断时长，单位为 s                                           |            |
|  minRequestAmount  | 熔断触发的最小请求数，请求数小于该值时即使异常比率超出阈值也不会熔断（1.7.0 引入） | 5          |
|   statIntervalMs   | 统计时长（单位为 ms），如 60*1000 代表分钟级（1.8.0 引入）   | 1000 ms    |
| slowRatioThreshold | 慢调用比例阈值，仅慢调用比例模式有效（1.8.0 引入）           |            |

同一个资源可同时有多个降级规则。

#### Web 设置



![](https://p.ipic.vip/z30ehi.png)

 `DegradeRuleManager.loadRules()` 硬编码定义流量控制规则。

```java
private static void initDegradeRule() {
    List<DegradeRule> rules = new ArrayList<>();
    DegradeRule rule = new DegradeRule(resource);
        .setGrade(CircuitBreakerStrategy.ERROR_RATIO.getType());
        .setCount(0.7); // Threshold is 70% error ratio
        .setMinRequestAmount(100)
        .setStatIntervalMs(30000) // 30s
        .setTimeWindow(10);
    rules.add(rule);
    DegradeRuleManager.loadRules(rules);
}
```

### 2.3 系统保护规则

SystemRule，Sentinel 系统自适应限流从整体维度对应用入口流量进行控制，结合应用的 Load、CPU 使用率、总体平均 RT、入口 QPS 和并发线程数等几个维度的监控指标，通过自适应的流控策略，让系统的入口流量和系统的负载达到一个平衡，让系统尽可能跑在最大吞吐量的同时保证系统整体的稳定性。

#### 属性

|       Field       | 说明                                   | 默认值      |
| :---------------: | :------------------------------------- | :---------- |
| highestSystemLoad | `load1` 触发值，用于触发自适应控制阶段 | -1 (不生效) |
|       avgRt       | 所有入口流量的平均响应时间             | -1 (不生效) |
|     maxThread     | 入口流量的最大并发数                   | -1 (不生效) |
|        qps        | 所有入口资源的 QPS                     | -1 (不生效) |
|  highestCpuUsage  | 当前系统的 CPU 使用率（0.0-1.0）       | -1 (不生效) |

#### 硬编码

 `SystemRuleManager.loadRules()` 定义流量控制规则：

```java
private void initSystemProtectionRule() {
  List<SystemRule> rules = new ArrayList<>();
  SystemRule rule = new SystemRule();
  rule.setHighestSystemLoad(10);
  rules.add(rule);
  SystemRuleManager.loadRules(rules);
}
```

### 2.4 访问控制规则

AuthorityRule，当需根据调用方来限制资源是否通过，可用Sentinel访问控制（黑白名单）功能。根据资源的请求来源（origin）判断，若：

- 配置白名单，仅origin在白名单才可通过
- 若配置黑名单，仅origin在黑名单时不通过，其余请求通过

授权规则，即黑白名单规则（AuthorityRule），对其

#### 配置项

- `resource`：资源名，即限流规则的作用对象
- `limitApp`：对应的黑名单/白名单，不同 origin 用 `,` 分隔，如 `appA,appB`
- `strategy`：限制模式，`AUTHORITY_WHITE` 为白名单模式，`AUTHORITY_BLACK` 为黑名单模式，默认为白名单模式

更多详情可以参考 [来源访问控制](http://www.javaedge.cn/md/sentinel/origin-authority-control.html)。

### 2.5 热点规则

ParamFlowRule，详情参考 [热点参数限流](https://sentinelguard.io/zh-cn/docs/parameter-flow-control.html)。

## 查询更改规则

引入transport模块后，可以通过以下的 HTTP API 来获取所有已加载的规则：

```
http://localhost:8719/getRules?type=<XXXX>
```

type取值：

- flow：JSON格式返回现有的限流规则
- degrade：返回现有生效的降级规则列表
- system 则返回系统保护规则

获取所有热点规则：

```
http://localhost:8719/getParamRules
```

其中，type 可以输入 `flow`、`degrade` 等方式来制定更改的规则种类，`data` 则是对应的 JSON 格式的规则。

## 定制持久化规则

上面的规则配置，都在内存。即如果应用重启，这个规则就会失效。因此我们提供了开放的接口，您可以通过实现 [`DataSource`](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-datasource-extension/src/main/java/com/alibaba/csp/sentinel/datasource/AbstractDataSource.java) 接口的方式，来自定义规则的存储数据源。通常我们的建议有：

- 整合动态配置系统，如zk、Nacos，动态实时刷新配置规则
- 结合 RDBMS、NoSQL、VCS 实现该规则
- 配合 Sentinel Dashboard 使用

更多详情请参考 [动态规则配置](https://sentinelguard.io/zh-cn/docs/dynamic-rule-configuration.html)。

## 规则生效的效果

### 判断限流降级异常

通过以下方法判断是否为 Sentinel 的流控降级异常：

```java
BlockException.isBlockException(Throwable t);
```

除了在业务代码逻辑上看到规则生效，我们也可以通过下面简单的方法，来校验规则生效的效果：

- **暴露的 HTTP 接口**：通过运行下面命令 `curl http://localhost:8719/cnode?id=<资源名称>`，观察返回的数据。如果规则生效，在返回的数据栏中的 `block` 以及 `block(m)` 中会有显示
- **日志**：Sentinel 提供秒级的资源运行日志以及限流日志，详情可以参考 [日志文档](https://sentinelguard.io/zh-cn/docs/logs.html)

### block 事件

Sentinel 提供以下扩展接口，可以通过 `StatisticSlotCallbackRegistry` 向 `StatisticSlot` 注册回调函数：

- `ProcessorSlotEntryCallback`: callback when resource entry passed (`onPass`) or blocked (`onBlocked`)
- `ProcessorSlotExitCallback`: callback when resource entry successfully completed (`onExit`)

可以利用这些回调接口来实现报警等功能，实时的监控信息可以从 `ClusterNode` 中实时获取。

## 其它 API

### 业务异常统计 Tracer

业务异常记录类 `Tracer` 用于记录业务异常。相关方法：

- `trace(Throwable e)`：记录业务异常（非 `BlockException` 异常），对应的资源为当前线程 context 下 entry 对应的资源。
- `trace(Throwable e, int count)`：记录业务异常（非 `BlockException` 异常），异常数目为传入的 `count`。
- `traceEntry(Throwable, int, Entry)`：向传入 entry 对应的资源记录业务异常（非 `BlockException` 异常），异常数目为传入的 `count`。

如果用户通过 `SphU` 或 `SphO` 手动定义资源，则 Sentinel 不能感知上层业务的异常，需要手动调用 `Tracer.trace(ex)` 来记录业务异常，否则对应的异常不会统计到 Sentinel 异常计数中。注意不要在 try-with-resources 形式的 `SphU.entry(xxx)` 中使用，否则会统计不上。

从 1.3.1 版本开始，注解方式定义资源支持自动统计业务异常，无需手动调用 `Tracer.trace(ex)` 来记录业务异常。Sentinel 1.3.1 以前的版本需要手动记录。

### 上下文工具类 ContextUtil

相关静态方法：

**标识进入调用链入口（上下文）**：

以下静态方法用于标识调用链路入口，用于区分不同的调用链路：

- `public static Context enter(String contextName)`
- `public static Context enter(String contextName, String origin)`

其中：

- contextName，调用链路入口名称（上下文名称）
- origin，调用来源名称。origin默认为空
- 返回值类型为 `Context`，即生成的调用链路上下文对象

`ContextUtil.enter(xxx)` 仅在调用链路入口处生效，即仅在当前线程的初次调用生效，后面再调用不会覆盖当前线程的调用链路，直到 exit。`Context` 存于 ThreadLocal，因此切换线程时可能丢掉，若需跨线程用，可结合 `runOnContext` 方法。

流控规则中若选择“流控方式”为“链路”方式，则入口资源名即为上面的 `contextName`。

**退出调用链（清空上下文）**：

- `public static void exit()`：该方法用于退出调用链，清理当前线程的上下文。

**获取当前线程的调用链上下文**：

- `public static Context getContext()`：获取当前线程的调用链路上下文对象。

**在某个调用链上下文中执行代码**：

- `public static void runOnContext(Context context, Runnable f)`：常用于异步调用链路中 context 的变换。

### 指标统计配置

Sentinel 底层采用高性能的滑动窗口数据结构来统计实时的秒级指标数据，并支持对滑动窗口进行配置。主要有以下两个配置：

- `windowIntervalMs`：滑动窗口的总的时间长度，默认为 1000 ms
- `sampleCount`：滑动窗口划分的格子数目，默认为 2；格子越多则精度越高，但是内存占用也会越多

![sliding-window-leap-array](https://user-images.githubusercontent.com/9434884/51955215-0af7c500-247e-11e9-8895-9fc0e4c10c8c.png)

我们可以通过 `SampleCountProperty` 来动态地变更滑动窗口的格子数目，通过 `IntervalProperty` 来动态地变更滑动窗口的总时间长度。注意这两个配置都是**全局生效**的，会影响所有资源的所有指标统计。

## Dashboard

详情请参考：[Sentinel Dashboard 文档](https://sentinelguard.io/zh-cn/docs/dashboard.html)。

参考：

- [主流框架的适配](https://sentinelguard.io/zh-cn/docs/open-source-framework-integrations.html)
- [Sentinel 注解支持文档](https://sentinelguard.io/zh-cn/docs/annotation-support.html)