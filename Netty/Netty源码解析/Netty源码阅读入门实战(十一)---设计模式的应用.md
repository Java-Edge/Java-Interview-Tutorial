# 1 单例模式
![](https://upload-images.jianshu.io/upload_images/4685968-9b803fe2d26399f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![基本类型的单例模式代码](https://upload-images.jianshu.io/upload_images/4685968-d124270bfb25f1c8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.1 Netty 实例
### 1.1.1 ReadTimeoutException
![](https://upload-images.jianshu.io/upload_images/4685968-dce4593d73d22c91.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
可以看出,构造器私有,防止随意创建
static保证延迟加载
### 1.1.2 MqttEncoder
![](https://upload-images.jianshu.io/upload_images/4685968-56f7adba2a8b680d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 策略模式
![](https://upload-images.jianshu.io/upload_images/4685968-943ab2a6eb1dbd11.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![基本类型的策略模式代码](https://upload-images.jianshu.io/upload_images/4685968-bcdb46e02ae9e6dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![根据 executers 去选择相应的策略](https://upload-images.jianshu.io/upload_images/4685968-80496d2c059849ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![两种策略](https://upload-images.jianshu.io/upload_images/4685968-903970320629afd6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1f79a5db0277c5d9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-15847b9f112f49b9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 3 装饰者模式
![](https://upload-images.jianshu.io/upload_images/4685968-f680f150b11909e9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![image.png](https://upload-images.jianshu.io/upload_images/4685968-c1199bbd20e6cbbe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## Netty 实践
![](https://upload-images.jianshu.io/upload_images/4685968-1a595bb0283837fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a2bcac01fb1a9b62.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f20cd72c2749e792.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e75b6de3e52c7707.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 4 观察者模式
## 4.1 常规操作
![](https://upload-images.jianshu.io/upload_images/4685968-bc7c11d735fc3d13.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-03a2c36361288039.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-691a448d048a1111.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d29d8e53675ed1cb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![运行](https://upload-images.jianshu.io/upload_images/4685968-54515e2c54fda02c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![结果](https://upload-images.jianshu.io/upload_images/4685968-5a30b395af55c896.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 4.2  Netty 的实践
- 在调用 writeAndFlush 后,其实返回的就是被观察者ChannelFulture![](https://upload-images.jianshu.io/upload_images/4685968-213cc842863c727d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 添加观察者
![](https://upload-images.jianshu.io/upload_images/4685968-ed7c2dda4ae3ba34.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9865acc713728d1c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
下面让我们深入writeAndFlush 看看
- 从 pipeline 开始传播
![](https://upload-images.jianshu.io/upload_images/4685968-d5111155812ed041.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 从 tail节点从后往前进行传播
![](https://upload-images.jianshu.io/upload_images/4685968-f8b640347e551652.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- promise就是被观察者
![](https://upload-images.jianshu.io/upload_images/4685968-df152421fc7b72b9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0ac34179fbeeb367.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b496b0fd418c2072.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
下面看看添加观察者的源码实现~
![](https://upload-images.jianshu.io/upload_images/4685968-6138ab80897738cb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-15255dad9454240f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a74fa2fb21472190.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
