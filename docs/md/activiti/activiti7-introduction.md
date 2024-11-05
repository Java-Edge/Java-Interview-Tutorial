# 02-Activiti7简介

## 0 前言

在现代企业应用开发中，工作流自动化已成为提升效率和降低复杂度的核心组件。作为一款开源的 Java 工作流引擎，Activiti7 提供了一个强大的工具集，帮助开发人员快速实现流程管理和业务流程自动化。本文将为 Java 技术专家提供 Activiti7 的入门指南，帮助您快速理解其架构、特性及基本使用方法。

## 1 为什么选择 Activiti7？

基于 Java 的轻量级工作流引擎，支持 BPMN 2.0 标准，能灵活集成到不同 Java 应用。

### 优势

- **开源和社区活跃**：Activiti 是一个由社区支持的开源项目，拥有庞大的用户群体和丰富的学习资源。
- **轻量级和可嵌入**：Activiti7 可以轻松嵌入到任何 Java 应用中，特别适用于微服务架构。
- **支持 BPMN 2.0**：Activiti7 完全兼容 BPMN 2.0 标准，能够实现复杂的业务流程设计。
- **RESTful API 支持**：Activiti7 提供了丰富的 REST API，便于与其他系统集成。
- 与 springboot 更好的原生支持
- 引入SpringSecurity作为默认用户与角色的默认安全机制

项目前主管Tom Baeyens，2010年立项，前身是 GBPM5，所以初始版本就是 5。

## 2 Activiti7 核心组件

在使用 Activiti7 之前，了解其核心组件有助于更好地理解其工作原理。以下是 Activiti7 的主要模块：

- **流程引擎（Process Engine）**：Activiti 的核心组件，负责管理流程的执行和状态。
- **流程定义（Process Definition）**：通过 BPMN 文件定义业务流程，描述任务、网关和事件的流程图。
- **任务管理（Task Management）**：用于管理和分配用户任务，可与用户表单和界面进行集成。
- **历史数据（History）**：记录流程实例的历史数据，便于审计和回溯。
- **REST API**：提供标准化的 API 接口，用于与外部系统交互。

### ProcessEngine

- RepositoryService
- RuntimeService
- ManagementService
- IdentityService
- TaskService
- HistoryService

对应：

- ProcessRuntime
- TaskRuntime

ProcessEngine 是整个系统的核心，它负责管理和协调各种服务，以实现业务流程的自动化。

- **RepositoryService:** 负责管理流程定义（BPMN模型等）。
- **RuntimeService:** 负责执行流程实例，包括启动、暂停、终止等操作。
- **ManagementService:** 提供对流程引擎的管理功能，比如部署流程定义、查询流程实例等。
- **IdentityService:** 管理用户和组。
- **TaskService:** 管理任务，包括分配任务、完成任务等。
- **HistoryService:** 存储流程的历史数据，用于审计和分析。

**ProcessRuntime 和 TaskRuntime** 作为 ProcessEngine 的两个重要的运行时组件，分别负责流程实例和任务的执行。

- **BPMN:** 业务流程建模符号，用于定义流程。

## 工作流常见业务场景介绍

### 线性审批



![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20241105151142813.png)

简单的当然 ifelse 最省事。

### 会签审批

如发布公文：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20241105151352702.png)

### 条件流程



![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20241105151418858.png)

## 3 Activiti7 基本使用

以下将展示如何在 Java 项目中集成 Activiti7 并完成一个简单的工作流示例。

###  3.1 添加 Maven 依赖

为项目添加 Activiti7  依赖：

```xml
<dependency>
    <groupId>org.activiti</groupId>
    <artifactId>activiti-engine</artifactId>
    <version>7.x.x</version>
</dependency>
```

### 3.2 配置流程引擎

创建一个 `ProcessEngineConfiguration` 实例来初始化流程引擎：

```java
import org.activiti.engine.ProcessEngine;
import org.activiti.engine.ProcessEngineConfiguration;

public class ActivitiConfig {
    public static ProcessEngine buildProcessEngine() {
        ProcessEngineConfiguration config = ProcessEngineConfiguration
                .createStandaloneInMemProcessEngineConfiguration();
        config.setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_TRUE);
        config.setJdbcUrl("jdbc:h2:mem:activiti;DB_CLOSE_DELAY=1000");
        config.setJdbcDriver("org.h2.Driver");
        config.setJdbcUsername("sa");
        config.setJdbcPassword("");
        return config.buildProcessEngine();
    }
}
```

上面的代码创建了一个内存数据库中的流程引擎配置，这在开发和测试阶段非常便捷。

### 3.3 定义 BPMN 流程

在 `resources` 文件夹下创建一个 `process.bpmn20.xml` 文件，定义一个简单的流程：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" targetNamespace="Examples">
    <process id="sampleProcess" name="Sample Process" isExecutable="true">
        <startEvent id="startEvent" name="Start" />
        <sequenceFlow sourceRef="startEvent" targetRef="userTask" />
        <userTask id="userTask" name="User Task" />
        <sequenceFlow sourceRef="userTask" targetRef="endEvent" />
        <endEvent id="endEvent" name="End" />
    </process>
</definitions>
```

该流程包含一个开始事件、一个用户任务和一个结束事件。

### 3.4 部署并启动流程

```java
import org.activiti.engine.RepositoryService;
import org.activiti.engine.RuntimeService;
import org.activiti.engine.repository.Deployment;
import org.activiti.engine.runtime.ProcessInstance;

public class ProcessStarter {
    public static void main(String[] args) {
        ProcessEngine engine = ActivitiConfig.buildProcessEngine();
        RepositoryService repositoryService = engine.getRepositoryService();
        
        // 部署流程定义
        Deployment deployment = repositoryService.createDeployment()
                .addClasspathResource("process.bpmn20.xml")
                .deploy();

        // 启动流程实例
        RuntimeService runtimeService = engine.getRuntimeService();
        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("sampleProcess");
        System.out.println("Process started with ID: " + processInstance.getId());
    }
}
```

运行此代码将会部署流程定义，并启动一个新的流程实例。

### 3.5 管理任务

流程实例启动后，您可以通过 `TaskService` 管理流程中的任务：

```java
import org.activiti.engine.TaskService;
import org.activiti.engine.task.Task;

public class TaskManager {
    public static void main(String[] args) {
        ProcessEngine engine = ActivitiConfig.buildProcessEngine();
        TaskService taskService = engine.getTaskService();

        // 获取并完成用户任务
        Task task = taskService.createTaskQuery().singleResult();
        if (task != null) {
            System.out.println("Completing Task: " + task.getName());
            taskService.complete(task.getId());
        }
    }
}
```

运行后可以看到用户任务被完成，流程将继续向结束事件推进。

## 4 常见问题及解决方案

1. **数据库连接问题**：确保正确配置数据库连接，建议在开发时使用 H2 内存数据库，生产环境切换到 MySQL 或其他数据库。
2. **流程定义更新**：如果流程定义发生更改，需重新部署流程定义，Activiti 支持版本管理。
3. **任务分配**：可以通过设置 `assignee` 属性来分配任务给特定用户。

## 5 总结

Activiti7 是一个强大且灵活的工作流引擎，适合 Java 技术专家在各种业务场景中实现流程自动化。通过本指南，您应当对 Activiti7 的基本架构和使用方法有了初步的认识。希望这篇入门博客可以帮助您快速上手 Activiti7，并在实际项目中应用流程管理和自动化的强大功能。

参考：

- [Activiti 官方文档](https://www.activiti.org/)
- [BPMN 2.0 标准介绍](https://www.omg.org/spec/BPMN/2.0/)