![目录](https://upload-images.jianshu.io/upload_images/4685968-d1ad6dbf94d38f20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1 MapReduce概述
![](https://upload-images.jianshu.io/upload_images/4685968-8a3f8a5a26992bb9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 MapReduce编程模型之通过wordcount词频统计分析案例入门
![](https://upload-images.jianshu.io/upload_images/4685968-7563d21e44338bbd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# MapReduce执行流程
![](https://upload-images.jianshu.io/upload_images/4685968-f92ef9dac3edcb2a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-49d9b19a457d7847.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-e1f014833eae5eb8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- InputFormat
![](https://upload-images.jianshu.io/upload_images/4685968-1907b9114cc42568.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3ac372af0238dc7b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-2f4a418b7d835e6b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b3e573bdacdb712d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- OutputFormat
OutputFormt接口决定了在哪里以及怎样持久化作业结果。Hadoop为不同类型的格式提供了一系列的类和接口，实现自定义操作只要继承其中的某个类或接口即可。你可能已经熟悉了默认的OutputFormat，也就是TextOutputFormat，它是一种以行分隔，包含制表符界定的键值对的文本文件格式。尽管如此，对多数类型的数据而言，如再常见不过的数字，文本序列化会浪费一些空间，由此带来的结果是运行时间更长且资源消耗更多。为了避免文本文件的弊端，Hadoop提供了SequenceFileOutputformat，它将对象表示成二进制形式而不再是文本文件，并将结果进行压缩。
# 3 MapReduce核心概念
![](https://upload-images.jianshu.io/upload_images/4685968-28c6a0131a2dcc95.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ae3ef868da0913d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 3.1 Split
![](https://upload-images.jianshu.io/upload_images/4685968-d6bf69ad9f81e9e4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 3.2 InputFormat
# 4 MapReduce 1.x 架构
![](https://upload-images.jianshu.io/upload_images/4685968-fb32aecae4a71f2f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/4685968-decb115b06993cc7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a282262365c87c60.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b232e0cc860fd46d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f4c54d1443a85677.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 5 MapReduce 2.x 架构
![](https://upload-images.jianshu.io/upload_images/4685968-263326493524cfda.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 6 Java 实现 wordCount
![](https://upload-images.jianshu.io/upload_images/4685968-b2f88b1b8ad3d584.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![clean package](https://upload-images.jianshu.io/upload_images/4685968-d81f900ba386685c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![上传到Hadoop服务器](https://upload-images.jianshu.io/upload_images/4685968-7fb51bf009c4e2db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![全路径没有问题](https://upload-images.jianshu.io/upload_images/4685968-4c23190abdf6b39e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8f625f9805d6e160.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 7 重构
![](https://upload-images.jianshu.io/upload_images/4685968-e23904523132b5f9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 8 Combiner编程
![](https://upload-images.jianshu.io/upload_images/4685968-49b3ab702137d23e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 9 Partitoner
![](https://upload-images.jianshu.io/upload_images/4685968-bd17e7b57d287240.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4572a64d4f8206b0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 10 JobHistoryServer

