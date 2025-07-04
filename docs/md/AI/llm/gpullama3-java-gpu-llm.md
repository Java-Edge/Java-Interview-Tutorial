# 告别 CUDA！GPULlama3.java 横空出世，Java 首次实现原生 GPU 跑大模型

## 0 前言

曼彻斯特大学 [Beehive Lab](https://github.com/beehive-lab) 发布 [GPULlama3.java](https://github.com/beehive-lab/GPULlama3.java)，这是首个支持 GPU 自动加速的 Java 原生 [Llama3](https://www.llama.com/models/llama-3/) 实现。该项目基于  [TornadoVM](https://github.com/beehive-lab/TornadoVM)，让开发者无需编写 CUDA 或原生代码，即可在 Java 中实现LLM的 GPU 推理。这有望彻底改变 Javaer 在企业环境中构建 AI 应用的方式。

## 1 GPULlama3.java 的核心

TornadoVM —— 一款创新的异构编程框架，它扩展了 OpenJDK 和 GraalVM，使 Java 程序能自动在 GPU、FPGA 以及多核 CPU 加速运行。与传统 GPU 编程方式不同，TornadoVM 无需手动重写 CUDA 或 OpenCL 代码，开发者可完全用 Java 编写逻辑，TornadoVM 负责底层加速。

根据 [TornadoVM 官方文档](https://tornadovm.readthedocs.io/en/latest/introduction.html) 的介绍，该系统通过扩展 Graal JIT 编译器，添加专用后端，在运行时将 Java 字节码转换为 GPU 可执行代码。只需用 `@Parallel` 注解标记方法，TornadoVM 就能将普通 Java 字节码转换为 Graal 中间表示（IR），应用 GPU 优化策略，并生成目标平台代码，如 OpenCL C（跨平台）、PTX（NVIDIA）或 SPIR-V（二进制格式，支持 Intel 显卡）。

```java
// 来自 TornadoVM 文档的 TaskGraph 示例
TaskGraph taskGraph = new TaskGraph("computation")
    .transferToDevice(DataTransferMode.FIRST_EXECUTION, data)
    .task("process", MyClass::compute, input, output)
    .transferToHost(DataTransferMode.EVERY_EXECUTION, output);

TornadoExecutionPlan executor = new TornadoExecutionPlan(taskGraph.snapshot());
executor.execute();
```

根据 [TornadoVM 编程指南](https://tornadovm.readthedocs.io/en/latest/programming.html)，开发者可用与硬件无关的 API，在不同硬件平台上运行相同的 Java 代码。TornadoVM 运行时会自动处理所有设备相关的优化、内存管理和数据传输。

## 2 支持后端

GPULlama3.java 支持三种主要后端，可运行在多种硬件：

- **NVIDIA 显卡**：支持 OpenCL 和 PTX 两种后端
- **Intel 显卡**：包括 Arc 独显和集成的 HD Graphics，支持 OpenCL
- **Apple Silicon**：M1/M2/M3 可通过 OpenCL 运行（但由于 Apple 已弃用 OpenCL，未来将转向 Metal）

项目运行时可通过命令行参数配置：

```bash
# 使用 GPU 加速运行（项目 README 示例）
./llama-tornado --gpu --verbose-init --opencl --model beehive-llama-3.2-1b-instruct-fp16.gguf --prompt "Explain the benefits of GPU acceleration."
```

该项目依赖 Java 的现代功能，具体包括：

- 要求 **Java 21 及以上版本**，以使用 Vector API 和 Foreign Memory API
- 支持 **GGUF 模型格式**，方便模型打包与部署
- 支持 **量化格式**（Q4_0 和 Q8_0），以降低内存占用

GPULlama3.java 基于 [Alfonso Peterssen 的原始 LLama3.java 实现](https://github.com/mukel/llama3.java) 开发，并在此基础引入 TornadoVM GPU 加速功能。正如 [Peterssen 在 Devoxx 2024 大会](https://youtu.be/zgAMxC7lzkc?si=pPqZzeu81ESWjUdx) 展示，他的工作首次实现无需原生依赖即可运行 Llama 模型。TornadoVM 团队进一步将其适配为异构加速架构。

## 3 Java LLM 项目

GPULlama3.java 的发布也使其成为 Java LLM 项目的一员，其他相关项目还包括：

- [JLama](https://github.com/tjake/Jlama)：一个现代 Java LLM 推理引擎，支持分布式部署
- [Llama3.java](https://github.com/mukel/llama3.java)：专注 CPU 优化的纯 Java 实现

正如 [Quarkus 官方博客关于 Java LLM 的文章](https://quarkus.io/blog/quarkus-jlama/) 所指出的，Java 生态系统正不断拓展其 AI/机器学习能力，使开发者能够无需离开 Java 平台就能构建 LLM 驱动的应用程序。

[TornadoVM](https://www.infoq.com/articles/tornadovm-java-gpu-fpga/) 起源于曼彻斯特大学的研究项目，自 2013 年以来持续发展，目标是让 Java 开发者更容易使用异构计算。该框架目前仍在不断增加后端支持并进行性能优化。

## 4 当前进度

GPULlama3.java 目前处于测试阶段，团队正在持续优化性能并收集基准测试数据。由于 Apple 弃用 OpenCL，当前在 Apple Silicon 上的性能不佳，TornadoVM 团队正在开发 Metal 后端，以提升兼容性并优化 Transformer 操作。



## 5 总结

总的来说，GPULlama3.java 的发布标志着 Java 生态在 GPU 加速 LLM 推理方面迈出了重要一步。得益于 TornadoVM 的加持，Java 开发者无需跳出熟悉的开发环境，就能享受到 GPU 加速的强大计算能力。尽管目前仍在开发中，但该项目已展示出 Java 在 AI 应用中无限的可能性，特别是在对安全性、可扩展性与可维护性有高要求的企业级场景下。

对想要在 Java 中尝试 GPU 加速 LLM 推理的开发者而言，该项目已经 [开源发布于 GitHub](https://github.com/beehive-lab/GPULlama3.java)，并配有文档和示例，方便快速上手。