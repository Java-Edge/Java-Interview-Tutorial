# 03-Cadence基础语法

## 0 Cadence基础语法入门：流程编排语言的新星

Cadence是由Uber开发的一种领域特定语言（Domain-Specific Language，DSL），专门用于编写可扩展的长时间运行的业务流程。它是Temporal工作流引擎的核心组成部分，提供了一种简单yet强大的方式来处理分布式系统中的复杂工作流。在这篇博客中，我们将探索Cadence的基础语法，帮助你快速入门这个流程编排的新星。

## 1. 基本结构

Cadence工作流的基本结构包括工作流（Workflow）和活动（Activity）。工作流定义了业务流程的整体逻辑，而活动则是工作流中的具体任务。

### 工作流定义

```go
func MyWorkflow(ctx workflow.Context, param string) error {
    logger := workflow.GetLogger(ctx)
    logger.Info("Workflow started", "param", param)

    // 工作流逻辑
    
    return nil
}
```

### 活动定义

```go
func MyActivity(ctx context.Context, param string) (string, error) {
    logger := activity.GetLogger(ctx)
    logger.Info("Activity started", "param", param)

    // 活动逻辑
    
    return "Activity result", nil
}
```

## 2. 变量和数据类型

Cadence支持Go语言的基本数据类型，包括：

- 数值类型：int, float64
- 字符串：string
- 布尔值：bool
- 数组和切片
- 结构体

例如：

```go
var (
    count int
    name string
    isValid bool
    numbers []int
)

type Person struct {
    Name string
    Age int
}
```

## 3. 控制流

Cadence支持常见的控制流语句，如条件语句和循环。

### 条件语句

```go
if condition {
    // 执行某些操作
} else if anotherCondition {
    // 执行其他操作
} else {
    // 默认操作
}
```

### 循环

```go
for i := 0; i < 5; i++ {
    // 重复执行的代码
}

// 或者使用range遍历
for index, value := range someSlice {
    // 处理每个元素
}
```

## 4. 错误处理

Cadence使用Go风格的错误处理机制：

```go
result, err := workflow.ExecuteActivity(ctx, MyActivity, param).Get(ctx, nil)
if err != nil {
    return err
}
```

## 5. 并发和异步操作

Cadence提供了强大的并发和异步操作支持。

### Future

Future用于处理异步操作的结果：

```go
future := workflow.ExecuteActivity(ctx, MyActivity, param)
var result string
if err := future.Get(ctx, &result); err != nil {
    return err
}
```

### 并行执行活动

使用`workflow.Go`和`workflow.Await`实现并行执行：

```go
var result1, result2 string
workflow.Go(ctx, func(ctx workflow.Context) {
    workflow.ExecuteActivity(ctx, Activity1).Get(ctx, &result1)
})
workflow.Go(ctx, func(ctx workflow.Context) {
    workflow.ExecuteActivity(ctx, Activity2).Get(ctx, &result2)
})
workflow.Await(ctx, func() bool {
    return result1 != "" && result2 != ""
})
```

## 6. 定时器和延迟

Cadence提供了定时器功能，用于实现延迟和超时：

```go
// 延迟5秒
workflow.Sleep(ctx, 5*time.Second)

// 使用定时器
timer := workflow.NewTimer(ctx, 10*time.Second)
selector := workflow.NewSelector(ctx)
selector.AddFuture(timer, func(f workflow.Future) {
    // 定时器触发后执行的操作
})
selector.Select(ctx)
```

## 7. 查询

Cadence允许定义查询来获取工作流的当前状态：

```go
func (w *MyWorkflow) QueryState() (string, error) {
    return w.currentState, nil
}
```

## 结语

这篇博客介绍了Cadence的基础语法，包括工作流和活动的定义、变量、控制流、错误处理、并发操作、定时器以及查询等核心概念。Cadence的强大之处在于它能够以一种简单直观的方式处理复杂的分布式系统问题，使得开发人员可以专注于业务逻辑而不是底层的并发和容错处理。

随着你对Cadence的深入学习，你会发现它还有许多高级特性，如saga模式、子工作流、本地活动等。这些特性使得Cadence能够适应各种复杂的业务场景。

希望这篇入门指南能够帮助你开始Cadence的学习之旅。随着实践的深入，你将会发现Cadence如何改变你对分布式系统编程的看法，并为你的项目带来新的可能性。



这篇技术博客涵盖了Cadence的基础语法和核心概念，包括：

1. 基本结构（工作流和活动的定义）
2. 变量和数据类型
3. 控制流（条件语句和循环）
4. 错误处理
5. 并发和异步操作
6. 定时器和延迟
7. 查询

这些内容应该能给初学者一个良好的Cadence语法概览。博客的结构是从基础到稍微高级的特性逐步展开的，每个部分都包含了代码示例，以帮助读者更好地理解概念。

如果您想要对某个特定部分进行更深入的探讨，或者添加更多的示例，请告诉我。我也可以根据您的需求调整博客的风格或内容深度。

# Cadence基础语法入门：流程编排语言的新星

Cadence是由Uber开发的一种领域特定语言（Domain-Specific Language，DSL），专门用于编写可扩展的长时间运行的业务流程。它是Temporal工作流引擎的核心组成部分，提供了一种简单yet强大的方式来处理分布式系统中的复杂工作流。在这篇博客中，我们将探索Cadence的基础语法，帮助你快速入门这个流程编排的新星。

## 1. 基本结构

Cadence工作流的基本结构包括工作流（Workflow）和活动（Activity）。工作流定义了业务流程的整体逻辑，而活动则是工作流中的具体任务。

### 工作流定义

```go
func MyWorkflow(ctx workflow.Context, param string) error {
    logger := workflow.GetLogger(ctx)
    logger.Info("Workflow started", "param", param)

    // 工作流逻辑
    
    return nil
}
```

### 活动定义

```go
func MyActivity(ctx context.Context, param string) (string, error) {
    logger := activity.GetLogger(ctx)
    logger.Info("Activity started", "param", param)

    // 活动逻辑
    
    return "Activity result", nil
}
```

## 2. 变量和数据类型

Cadence支持Go语言的基本数据类型，包括：

- 数值类型：int, float64
- 字符串：string
- 布尔值：bool
- 数组和切片
- 结构体

例如：

```go
var (
    count int
    name string
    isValid bool
    numbers []int
)

type Person struct {
    Name string
    Age int
}
```

## 3. 控制流

Cadence支持常见的控制流语句，如条件语句和循环。

### 条件语句

```go
if condition {
    // 执行某些操作
} else if anotherCondition {
    // 执行其他操作
} else {
    // 默认操作
}
```

### 循环

```go
for i := 0; i < 5; i++ {
    // 重复执行的代码
}

// 或者使用range遍历
for index, value := range someSlice {
    // 处理每个元素
}
```

## 4. 错误处理

Cadence使用Go风格的错误处理机制：

```go
result, err := workflow.ExecuteActivity(ctx, MyActivity, param).Get(ctx, nil)
if err != nil {
    return err
}
```

## 5. 并发和异步操作

Cadence提供了强大的并发和异步操作支持。

### Future

Future用于处理异步操作的结果：

```go
future := workflow.ExecuteActivity(ctx, MyActivity, param)
var result string
if err := future.Get(ctx, &result); err != nil {
    return err
}
```

### 并行执行活动

使用`workflow.Go`和`workflow.Await`实现并行执行：

```go
var result1, result2 string
workflow.Go(ctx, func(ctx workflow.Context) {
    workflow.ExecuteActivity(ctx, Activity1).Get(ctx, &result1)
})
workflow.Go(ctx, func(ctx workflow.Context) {
    workflow.ExecuteActivity(ctx, Activity2).Get(ctx, &result2)
})
workflow.Await(ctx, func() bool {
    return result1 != "" && result2 != ""
})
```

## 6. 定时器和延迟

Cadence提供了定时器功能，用于实现延迟和超时：

```go
// 延迟5秒
workflow.Sleep(ctx, 5*time.Second)

// 使用定时器
timer := workflow.NewTimer(ctx, 10*time.Second)
selector := workflow.NewSelector(ctx)
selector.AddFuture(timer, func(f workflow.Future) {
    // 定时器触发后执行的操作
})
selector.Select(ctx)
```

## 7. 查询

Cadence允许定义查询来获取工作流的当前状态：

```go
func (w *MyWorkflow) QueryState() (string, error) {
    return w.currentState, nil
}
```