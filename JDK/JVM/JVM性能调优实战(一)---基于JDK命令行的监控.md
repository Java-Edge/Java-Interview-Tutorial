# 1 JVM的参数类型
![](https://upload-images.jianshu.io/upload_images/4685968-c3d630c35921ef3e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 标准参数
![](https://upload-images.jianshu.io/upload_images/4685968-d9a2caed3c70e363.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## X 参数
![](https://upload-images.jianshu.io/upload_images/4685968-36aa325e5aa882d2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![JDK8默认混合模式](https://upload-images.jianshu.io/upload_images/4685968-d51270fdcaa59b7b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![更为编译执行](https://upload-images.jianshu.io/upload_images/4685968-e63d2a9dc4b84f81.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## XX 参数
![](https://upload-images.jianshu.io/upload_images/4685968-df514d5bb6b1ba93.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ee3ab014c641a459.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-eb6ad233da284eb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-dd0e0efc049f68ca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 查看JVM运行时参数
![](https://upload-images.jianshu.io/upload_images/4685968-3dc1345851a41222.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3efa76cbfa5f3729.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 查看XX选项的值
- -XX:+PrintCommandLineFlags
-  -XX:+PrintFlagsInitial -XX:+PrintFlagsFinal
![](https://upload-images.jianshu.io/upload_images/4685968-3365ede0c36c24e7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-2fa01042c93bb9ed.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![重定向到文本文件](https://upload-images.jianshu.io/upload_images/4685968-ba9262a02db7b704.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## jps
![jps](https://upload-images.jianshu.io/upload_images/4685968-b001d1166ef29bd4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![jps -l](https://upload-images.jianshu.io/upload_images/4685968-7fd046c9ca7419f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## jinfo
![](https://upload-images.jianshu.io/upload_images/4685968-958eb9084e37765d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 3 jstat查看JVM统计信息
![](https://upload-images.jianshu.io/upload_images/4685968-6152877a6fd3d12f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 3.1 类装载
![](https://upload-images.jianshu.io/upload_images/4685968-fcf19859fe9853c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 3.2 GC
![](https://upload-images.jianshu.io/upload_images/4685968-cfcd242ffae74229.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0673720236b8c6dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## -gc输出结果
![](https://upload-images.jianshu.io/upload_images/4685968-21033eab9130f123.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### JVM 的内存结构
![](https://upload-images.jianshu.io/upload_images/4685968-d1b10aef1ac30942.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## JIT 编译
![](https://upload-images.jianshu.io/upload_images/4685968-21d0f29d0f6ebbcf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b58d13ff46ce4199.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 4 jmap + MAT 实战内存溢出
## 堆区
![](https://upload-images.jianshu.io/upload_images/4685968-1799898c82d15414.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-59caf7a72915c7c6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 非堆区
![](https://upload-images.jianshu.io/upload_images/4685968-0ad3bbee4eb603b1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3e2f874a0e5fca13.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7ef84c46801894f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 5 导出内存映像文件
## OutofMemory（OOM）相关的选项
如果程序发生了OOM后，JVM可以配置一些选项来做些善后工作，比如把内存给dump下来，或者自动采取一些别的动作
- -XX:+HeapDumpOnOutOfMemoryError
在内存出现OOM的时候，把Heap转存(Dump)到文件以便后续分析，文件名通常是`java_pid<pid>.hprof`
- -XX:HeapDumpPath=<path>
指定heap转存文件的存储路径，需要指定的路径下有足够的空间来保存转存文件
- -XX:OnOutOfMemoryError
指定一个可行性程序或者脚本的路径，当发生OOM的时候，去执行这个脚本
![](https://upload-images.jianshu.io/upload_images/4685968-6c2f25ca31c79899.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-38da79139ddf1ff7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5d3a5066ab57066d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d368c169ca25e061.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-2d0c94547582fdbb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-3d4c21c5f43717de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 6 MAT分析内存溢出
