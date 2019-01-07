
# 0 前言
全是干货的技术殿堂

> `文章收录在我的 GitHub 仓库，欢迎Star/fork：`
> 
> [Java-Interview-Tutorial](https://github.com/Wasabi1234/Java-Interview-Tutorial)
> 
> https://github.com/Wasabi1234/Java-Interview-Tutorial


jacoco是一个开源的覆盖率工具,通过插桩方式来记录代码执行轨迹.

ant是构建工具,内置任务和可选任务组成的.Ant运行时需要一个XML文件(构建文件)。


# 1 覆盖率软件对比
![](https://img-blog.csdnimg.cn/20200317101336438.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 2 流程
1. 配置jacocoagent参数,启动服务
2. 生成 jacoco.exec
3. ant 构建生成覆盖率报告

# 3 启动jcocoagent
javaagent:javaagent是JDK 1.5以后引入的,也可以叫做Java代理.
后面跟的参数是jcocoagent的jar包地址.

- includes:包含在执行分析中的类名列表，*表示全部
- output:表示使用tcpserver代理侦听由address和port属性指定的TCP端口，并将执行的数据写入此TCP连接，从而实现不停止项目运行实时生成代码覆盖率报告
- port:开启的端口号
address: 开启的ip地址,本地写127.0.0.1
jar:运行服务的jar包地址
java -javaagent:/fs/jacocoagent.jar=includes=*,output=tcpserver,port=8888,address=127.0.0.1

# 4 生成报告
- ant dump
![](https://img-blog.csdnimg.cn/2020031710433178.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
生成"jacoco.exec"
![](https://img-blog.csdnimg.cn/20200317105255613.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- ant report
![](https://img-blog.csdnimg.cn/20200317105008349.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 5 打开"index.html"报告,展示类的覆盖率文件
![](https://img-blog.csdnimg.cn/20200317102437112.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

什么方法级别覆盖率你都还不满足,想看到底哪行代码覆盖到了?
那你得知道这有多坑了,最基本的配置是做不到的,我们还需要配置自己的 class 文件路径和源码路径!
- 注意要具体到 class 目录和 java 目录!,即 com 目录的上一级目录,就能完美展示源码的覆盖率情况了
![](https://img-blog.csdnimg.cn/20200317143737980.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20200317144112905.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 绿色的为行覆盖充分
- 红色的为未覆盖的行
- 红色菱形的为分支全部未覆盖
- 黄色菱形的为分支部分覆盖
- 绿色菱形为分支完全覆盖

# 总结
基操到此结束!入门完毕,开始愉快的高级玩耍与自行适配优化吧~