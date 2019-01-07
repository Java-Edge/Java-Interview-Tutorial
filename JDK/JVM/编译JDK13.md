# 1 系统环境![](https://img-blog.csdnimg.cn/20191017060211961.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

Xcode
Oracle JDK: 13

先确保系统已安装freetype和ccache
- freetype: 2.9
- ccache: 3.3.5

```bash
$ brew install freetype ccache
```

# 2 下载源码
通过Mercurial代码管理版本管理工具从Repository中直接获取源码(Repository为http://hg.openjdk.java.net)
![](https://img-blog.csdnimg.cn/20191017041658679.png?x-oss-process=maimage/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 3 自动检测依赖
进入解压后的文件夹，然后运行`bash ./configure`。这是一项检测所需要的依赖是否安装好了的脚本。只需要根据其提供的错误提示，将相应错误修改完成即可。

# 4 配置参数
## 参数说明
```java
--with-debug-level=slowdebug 启用slowdebug级别调试
--enable-dtrace 启用dtrace
--with-jvm-variants=server 编译server类型JVM
--with-target-bits=64 指定JVM为64位
--enable-ccache 启用ccache，加快编译
--with-num-cores=8 编译使用CPU核心数
--with-memory-size=8000 编译使用内存
--disable-warnings-as-errors 忽略警告
```

```bash
bash configure
--with-debug-level=slowdebug --enable-dtrace
--with-jvm-variants=server
--with-target-bits=64
--enable-ccache
--with-num-cores=8
--with-memory-size=8000
--disable-warnings-as-errors
```
![](https://img-blog.csdnimg.cn/20191017044502543.png)
- 直接报错![](https://img-blog.csdnimg.cn/20191017050652111.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
```java
configure: error: No xcodebuild tool and no system framework headers found, use --with-sysroot or --with-sdk-name to provide a path to a valid SDK
```
运行了一下`xcodebuild`，错误信息如下：

```java
xcode-select: error: tool 'xcodebuild' requires Xcode,
but active developer directory
'/Library/Developer/CommandLineTools' is a command line tools instance
```
![](https://img-blog.csdnimg.cn/20191017050753547.png)
- 解决方案

```java
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

![](https://img-blog.csdnimg.cn/20191017050529899.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 继续执行bash configure得到如下
![](https://img-blog.csdnimg.cn/20191017051925449.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 5 开始编译

```java
make image
```

![](https://img-blog.csdnimg.cn/20191017053849361.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20191017053825868.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
完成了!

# 6 验证
![](https://img-blog.csdnimg.cn/20191017060746547.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 7 Clion 导入项目
![](https://img-blog.csdnimg.cn/20191017054958489.png)

![](https://img-blog.csdnimg.cn/20191017055022157.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 选择ok![](https://img-blog.csdnimg.cn/20191017054806273.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 8 编辑配置
![](https://img-blog.csdnimg.cn/2019101705584366.png)
如下图编辑DEBUG配置信息
- Executable 选择之前build出的镜像里的java可执行文件![](https://img-blog.csdnimg.cn/20191017055927932.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- Program arguments 填写-version，输出Java版本
- Before launch 注意：这里一定要移除Build，否则会报错无法调试

![](https://img-blog.csdnimg.cn/20191017055722718.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)