# 事件版本管理

有一种办法：发送会议邀请给所有团队，经过101次会议后，发布维护横幅，所有人同时点击发布按钮。或...

可用**适配器**，但微调。没错！就像软件开发中90%问题一样，有种**模式**帮助你找到聪明解决方案。

## 1 问题

你已经有了一个模式，消费者已知咋处理它，所以他们依赖你保持兼容性，但实际上，你要打破这种兼容性。

一个生产者和三个消费者例来探讨这问题：

![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff7ca2ea8-80fe-47b5-82bd-56df2a050670_855x351.png)

## 2 解决方案

与其陷入协调部署的陷阱，不如利用适配器模式并加以战略性调整。五步操作：

![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b047eef-afb3-4165-a23c-af1a6e2c56f2_1191x585.png)

### 2.1 创建新主题

当你引入一个新模式时，不要强迫所有消费者立即适应，而是创建一个新topic。这个topic将成为使用新模式生成的事件的归宿。

### 2.2 引入适配器

部署一个监听新topic的适配器，该适配器将事件翻译回旧模式格式，并重新发布到原始主题。这样，现有消费者可继续接收他们期望格式的事件，而无需立即进行任何更改。

### 2.3 更新生产者

修改生产者，使其使用新模式生成事件，并将这些事件发布到新创建的topic中。

![为迁移做准备 ](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F87c58005-b023-43c3-8bd6-d47a73d3a4cf_1409x884.png)

### 2.4 逐步迁移消费者

现在，旧格式和新格式并存，可按自己节奏开始迁移消费者。当你更新每个消费者以处理新模式时，只需将其指向新topic。

![两个消费者已经迁移，还有一个要完成](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faff5b931-d7d4-4964-908b-667377e338da_1162x566.png)

### 2.5 停用适配器

一旦所有消费者成功迁移到新模式，你可以安全地退役适配器和旧topic。

![迁移完成](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdf85d48c-e3cd-4626-bc5f-72f1fdda6c2a_1142x558.png)



## 3 优势：减少压力，增加灵活性

### 3.1 向后兼容

适配器确保现有消费者在过渡期间继续正常运行，无需立即更新，维护系统稳定性。

### 3.2 无需协调部署

通过解耦生产者和消费者的升级过程，消除了同步部署的需求。每个团队可以独立工作，降低出错的风险。

### 3.3 集中测试

随着每个消费者的迁移，测试可以更集中和可控。你可以逐一验证每个过渡，使问题更容易识别和解决。

### 3.4 减少会议

由于协调需求减少，你可以告别无数的会议。迁移过程变得更简单、更可预测，压力也更小。

## 4 总结

目标是找到一种最简单、最有效的解决方案来打破兼容性。

适配器模式为在 EDA 中处理事件版本管理提供了务实的方法。