# Arthas使用

## 0 下载

[github release](https://github.com/alibaba/arthas/releases)：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/a19bfa49622ac800bd72953c769c9e0c.png)

## 1 启动

解压后，在文件夹里有`as.sh`，直接用`./as.sh`的方式启动：

```bash
./as.sh
```

或者命令行执行（使用和目标进程一致的用户启动，否则可能attach失败）：

```shell
java -jar arthas-boot.jar
```

![](https://img-blog.csdnimg.cn/230feb4801af43a39525379c6a78d3a8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

执行该程序的用户需要和目标进程具有相同的权限。

```bash
java -jar arthas-boot.jar -h 打印更多参数信息。
```

选择应用的Java进程即可。
输入6，再`enter`。Arthas会attach到目标进程上，并输出日志：
![](https://img-blog.csdnimg.cn/f8ae02ea1a40474b8353d945a94e6b79.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_SmF2YUVkZ2U=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2 dashboard

输入dashboard，enter，展示当前进程信息，按ctrl+c可中断执行：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/f1065c616ab6bac63aea0a11a2f760be.png)

##  3 thread

获取到进程的Main Class：
![](https://my-img.javaedge.com.cn/javaedge-blog/2024/07/65574efdab0f56bc8d2de7b3c4cdbc09.png)

参考

- https://arthas.aliyun.com/doc/advanced-use.html

