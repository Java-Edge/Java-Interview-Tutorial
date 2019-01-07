![](https://upload-images.jianshu.io/upload_images/4685968-4594f185b89db236.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ea990c6795d719d3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#spark
![](https://upload-images.jianshu.io/upload_images/4685968-810c4a8be64e48bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c8f78fa73984d807.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-eb83698544026b55.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d908ed20c941dd8e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c727a7612d4b6753.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-01398f6e205e6cd5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-bf301dfb1fe3c01d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# Spark 开发语言及运行模式介绍
![](https://upload-images.jianshu.io/upload_images/4685968-8b3d2d46e818d6c3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-eb63d4ca980fa4b5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# Scala安装
![下载 Scala](https://upload-images.jianshu.io/upload_images/4685968-d4431a614751f8eb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![配置到系统环境变量](https://upload-images.jianshu.io/upload_images/4685968-81265bea4c1a2f3a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![配置成功](https://upload-images.jianshu.io/upload_images/4685968-9c14e18115dc2ada.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# Spark环境搭建及 wordCount 案例实现
![下载 spark](https://upload-images.jianshu.io/upload_images/4685968-76844e3e8e94366b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![解压编译](https://upload-images.jianshu.io/upload_images/4685968-0f083cc5b549578a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![spark-shell可执行程序](https://upload-images.jianshu.io/upload_images/4685968-f889075789d3cad2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
如何提交应用程序
![](https://upload-images.jianshu.io/upload_images/4685968-dc340ebe573f9714.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
开启2个即可
![](https://upload-images.jianshu.io/upload_images/4685968-4066936b025411cb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![ ./spark-shell --master local[2]
](https://upload-images.jianshu.io/upload_images/4685968-0a5652814d2509bb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
读取输出文件内容
![](https://upload-images.jianshu.io/upload_images/4685968-c2de1d2277879a33.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0463c90a9dfd79f0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![3行数据](https://upload-images.jianshu.io/upload_images/4685968-6acc2471cde7fd1e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
按空格拆分
![](https://upload-images.jianshu.io/upload_images/4685968-2a4b181322f94b08.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
为每个单词赋1,表出现频率
![a.map(word => (word,1))](https://upload-images.jianshu.io/upload_images/4685968-b220e9dc003a820f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
统计
![](https://upload-images.jianshu.io/upload_images/4685968-650c8a07c5cf2176.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
以上操作其实通过一条方法链即可完成!!!
![sc.textFile("file:///Volumes/doc/data/hello.txt").flatMap(line => line.split(" ")).map(word => (word,1)).reduceByKey(_+_).collect](https://upload-images.jianshu.io/upload_images/4685968-5340375fe135fdcb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
GUI 管理界面
![访问该地址即可](https://upload-images.jianshu.io/upload_images/4685968-3e6c4938dbb268c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![http://localhost:4040](https://upload-images.jianshu.io/upload_images/4685968-f2c4908689442cf8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# Flink 概述
- https://flink.apache.org/
![官网首页](https://upload-images.jianshu.io/upload_images/4685968-6766af69e7187d00.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 使用 Flink 完成 wordcount 统计
## Flink 环境部署
![下载](https://upload-images.jianshu.io/upload_images/4685968-60cdfa6598d5b1f6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![下载镜像到本地](https://upload-images.jianshu.io/upload_images/4685968-0794d75e25a4117b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![解压](https://upload-images.jianshu.io/upload_images/4685968-5310ed2afc89f3f6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
查看官网指南
![](https://upload-images.jianshu.io/upload_images/4685968-3cff114925535274.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
启动本地的一个 flink
![](https://upload-images.jianshu.io/upload_images/4685968-899eaff6c1b721cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-053fa607d576d2dd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![浏览器访问:http://localhost:8081/](https://upload-images.jianshu.io/upload_images/4685968-dc8d34aa2842b7ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
使用方法
![](https://upload-images.jianshu.io/upload_images/4685968-8693e7b57afe4c4c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# Beam 概述
- https://beam.apache.org/
![](https://upload-images.jianshu.io/upload_images/4685968-6c4a525e70410547.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![官网](https://upload-images.jianshu.io/upload_images/4685968-8f173ff8c119cdf7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-75e8093bc751e36c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 将 wordCount的 Beam 程序以多种不同 Runner运行
Java 版本快速入门指南
![](https://upload-images.jianshu.io/upload_images/4685968-a68581703ebfa3e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9a379e8d66067042.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![maven 命令执行成功](https://upload-images.jianshu.io/upload_images/4685968-76dca0c2ade97582.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![运行命令](https://upload-images.jianshu.io/upload_images/4685968-4108086f9e17fd62.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ab128c37e5e03fe8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![生成文件](https://upload-images.jianshu.io/upload_images/4685968-fc6684285c9656b4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![查询结果](https://upload-images.jianshu.io/upload_images/4685968-6409ef80cbbd0eb1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# X 交流学习
![](https://upload-images.jianshu.io/upload_images/16782311-8d7acde57fdce062.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)


## [博客](https://blog.csdn.net/qq_33589510)



## [Github](https://github.com/Wasabi1234)
