# 0 什么是 Dockerfile？
Dockerfile 是一个用来构建镜像的文本文件，文本内容包含了一条条构建镜像所需的指令和说明。

# 1  FROM
定制的镜像都是基于 FROM 的镜像，后续的操作都是基于该 image。


- FROM scratch
制作base image

- FROM centos
使用base image

- FROM ubuntu:14.04

## 最佳实践
考虑安全性，请尽量使用官方 image 作为 base image。

# 2 LABEL

```shell
LABEL maintainer= "javaedge@gmail.com'
LABEL version="1.O"
LABEL description="This is a description"
```
## 最佳实践
这就像代码的注释，必须写好元数据。

# 3 RUN
用于执行后面跟着的命令行命令。有以下俩种格式：
## Shell格式

```shell
RUN apt-get install -y vim
CMD echo "hello docker"
ENTRYPOINT echo "hello docker"
```
- Dockerfile
![](https://img-blog.csdnimg.cn/20201216172757750.png)

```bash
docker build -t javaedge/centos-shell .
```
![](https://img-blog.csdnimg.cn/20201216173036468.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

```bash
docker image ls
docker run javaedge/centos-shell
```

![](https://img-blog.csdnimg.cn/20201216173058724.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)


```shell
RUN <命令行命令>
# <命令行命令> 等同于，在终端操作的 shell 命令。
```
## Exec 格式

```bash
RUN [ "apt-get" , "install" , "-y", "vim" ]
CMD [ " /bin/echo" , "hello docker" ]
ENTRYPOINT [ "/bin/echo" , "hello docker" ]
```

- Dockerfile2
![](https://img-blog.csdnimg.cn/20201216173827345.png)
![](https://img-blog.csdnimg.cn/20201216174116135.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 那如何修改才能让 exec 格式的命令能被 shell 识别呢，修正：
![](https://img-blog.csdnimg.cn/20201216174518222.png)![](https://img-blog.csdnimg.cn/20201216174538116.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
```exec
RUN ["可执行文件", "参数1", "参数2"]
# 例如：
# RUN ["./test.php", "dev", "offline"] 等价于 RUN ./test.php dev offline
```

```bash
RUN yum update && yum install -y vim \
	python-dev  # 反斜线换行
	
RUN apt-get update && apt-get install -y perl \
	pwgen --no-install-recommends && rm -rf \
	/var/lib/apt/lists/* # 注意清理cache
	
RUN /bin/bash -C 'source $HOME/.bashrc; echo
$HOME'
```


Dockerfile 的指令每执行一次都会在 docker 上新建一层。所以过多无意义的层，会造成镜像膨胀过大。例如：

```shell
FROM centos
RUN yum install wget
RUN wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz"
RUN tar -xvf redis.tar.gz
以上执行会创建 3 层镜像。可简化为以下格式：
FROM centos
RUN yum install wget \
    && wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz" \
    && tar -xvf redis.tar.gz
```
如上，以 && 符号连接命令，这样执行后，只会创建 1 层镜像。
## 最佳实践
- 可读性
复杂RUN用反斜线换行
- 避免无用分层
合并多条命令成一行

# 4 WORKDIR
类似 linux 的cd 命令。

```shell
WORKDIR /test # 如果没有会自动创建test目录
WORKDIR demo
RUN pwd # 输出结果应为/test/demo
```
## 最佳实践
使用WORKDIR，不要用 RUN cd
尽量使用绝对目录而非相对目录。

# 5 ADD & COPY
## COPY
复制指令，从上下文目录中复制文件或者目录到容器里指定路径。
### 格式：

```bash
COPY [--chown=<user>:<group>] <源路径1>...  <目标路径>
COPY [--chown=<user>:<group>] ["<源路径1>",...  "<目标路径>"]
```
`[--chown=<user>:<group>]`：可选参数，用户改变复制到容器内文件的拥有者和属组。

<源路径>：源文件或者源目录，这里可以是通配符表达式，其通配符规则要满足 Go 的 filepath.Match 规则。例如：

```shell
COPY hom* /mydir/
COPY hom?.txt /mydir/
```
<目标路径>：容器内的指定路径，该路径不用事先建好，路径不存在的话，会自动创建。
## ADD
ADD 指令和 COPY 的使用格式一致（同样需求下，官方推荐使用 COPY）。功能也类似，区别：
- ADD 的优点
在执行 <源文件> 为 tar 压缩文件的话，压缩格式为 gzip, bzip2 以及 xz 的情况下，会自动复制并解压到 <目标路径>。
- ADD 的缺点
在不解压的前提下，无法复制 tar 压缩文件。会令镜像构建缓存失效，从而可能会令镜像构建变得比较缓慢。具体是否使用，可以根据是否需要自动解压来决定。

```shell
ADD hello /

# 添加到根目录并解压
ADD test.tar.gz / 

WORKDIR /root
ADD hello test/  # /root/test/hello

WORKDIR /root
COPY hello test/
```
## 最佳实践
大部分情况，COPY优先于ADD
ADD比COPY多个解压功能
添加远程文件/目录请使用curl或者wget

# 6 ENV
```bash
ENV MYSQL VERSION 5.6 # 设置常量
RUN apt-get install -y mysql-server= "$(MYSQL_VERSION]" \
	&& rm -rf /var/lib/apt/lists/* # 引用常量
```
## 最佳实践
尽量使用，可增加项目的可维护性。
# 7 上下文路径
指令最后一个 `.` 是上下文路径
- 上下文路径
指 docker 在构建镜像，有时候想要使用到本机的文件（比如复制），docker build 命令得知这个路径后，会将路径下的所有内容打包。

由于 docker 的运行模式是 C/S。我们本机是 C，docker 引擎是 S。实际的构建过程是在 docker 引擎下完成的，所以这个时候无法用到我们本机的文件。这就需要把我们本机的指定目录下的文件一起打包提供给 docker 引擎使用。
如果未说明最后一个参数，那么默认上下文路径就是 Dockerfile 所在的位置。

> 上下文路径下不要放无用的文件，因为会一起打包发送给 docker 引擎，如果文件过多会造成过程缓慢。


# VOLUME & EXPOSE
存储和网络

# CMD & ENTRYPOINT 

# 实战
- 项目源码
![](https://img-blog.csdnimg.cn/20201216204315195.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- python app.py![](https://img-blog.csdnimg.cn/20201216204352396.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20201216204419843.png)
![](https://img-blog.csdnimg.cn/20201216204954213.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
## 如何调试Dockerfile？
- 比如执行到如下步骤时报错
![](https://img-blog.csdnimg.cn/20201216211834630.png)
那就进入该临时中转镜像即可

```bash
docker run -it 4320f8b526bc /bin/bash
```
进入后，直接查看 app，原来是个文件，并非路径！检查下 Dockerfile
![](https://img-blog.csdnimg.cn/20201216212243976.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
注意那行意思是将 app.py 放到根目录下并命名为 app，所以它不是个目录。
![](https://img-blog.csdnimg.cn/20201216212451654.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
之后再 build，run 即可。


参考
- 更多最佳实践，尽在官方 Dockerfile 文件
https://github.com/docker-library
https://docs.docker.com/engine/reference/builder/