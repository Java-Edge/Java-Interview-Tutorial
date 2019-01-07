# 1 必备常识
- 通过Image创建( copy )
- 在Image layer（只读）之上建立一个container layer (可读写)
- 可类比OOP：类和实例
image 相当于一个类，container 就是每个实例
- Image负责app的存储和分发，Container负责运行app


![](https://img-blog.csdnimg.cn/20201214232523826.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
Dockerfile

```shel
FROM scratch
ADD hello /
CMD ["/hello"]
```

```bash
docker container ls
```
当前无运行的容器
![](https://img-blog.csdnimg.cn/20201214232851920.png)
```bash
docker container ls -a
```
显示所有运行和已退出的容器
![](https://img-blog.csdnimg.cn/20201214233113952.png)




| CONTAINER ID  | IMAGE |COMMAND|CREATED             STATUS                     PORTS               NAMES
|--|--|--|--|
|  |  | |


```bash
// 如果本地没有，则默认拉取最新的远程镜像
docker run centos
```
但如果直接这么运行，直接就退出了，啥也看不到。
![](https://img-blog.csdnimg.cn/20201216123318541.png)
这时就想要
# 2 交互式运行容器
```bash
docker run -it centos
```
![](https://img-blog.csdnimg.cn/20201216123737797.png)

```bash
docker container ls -a
```
现在查看就是 up 状态了
![](https://img-blog.csdnimg.cn/20201216124346212.png)
- 现在退出刚才运行的 centos
![](https://img-blog.csdnimg.cn/20201216131852679.png)
- 再次查看容器状态![](https://img-blog.csdnimg.cn/20201216131954946.png)
- 可还发现有很多重复的退出的容器 centos，怎么删除重复的呢![](https://img-blog.csdnimg.cn/20201216132056330.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 经过一顿`docker container rm`即可
![](https://img-blog.csdnimg.cn/20201216132844403.png)
# 3 构建自定义的 Docker image
- 先进入原 image centos
![](https://img-blog.csdnimg.cn/2020121615480766.png)

由于本身没有 vim，我们正好安装下

```bash
yum install -y yum
```
安装完成后，退出该 image
![](https://img-blog.csdnimg.cn/20201216155042755.png)
- 提交刚才安装过 vim 的新的image
![](https://img-blog.csdnimg.cn/20201216160157694.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 可见的确大点![](https://img-blog.csdnimg.cn/20201216160354762.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 我们直接见证 image 的变迁历史即可
![](https://img-blog.csdnimg.cn/20201216160941763.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

但不推荐这种创建新 image 的方式，因为别人不知道这个 image 到底经历了啥，即是否安全呢？

所以我们就常通过创建 Dockerfile 文件明晰 image 变化。

```shell
FROM centos
RUN yum install -y vim
```

![](https://img-blog.csdnimg.cn/20201216161355806.png)


```bash
docker build -t javaedge/centos-vim-new .
```

![](https://img-blog.csdnimg.cn/20201216161831492.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
从日志可见中间有个临时中转生成的 image，最后完成时被删除。
```bash
[+] Building 20.9s (6/6) FINISHED
 => [internal] load .dockerignore                                                                                                   0.0s
 => => transferring context: 2B                                                                                                     0.0s
 => [internal] load build definition from Dockerfile                                                                                0.0s
 => => transferring dockerfile: 77B                                                                                                 0.0s
 => [internal] load metadata for docker.io/library/centos:latest                                                                    0.0s
 => [1/2] FROM docker.io/library/centos                                                                                             0.0s
 => => resolve docker.io/library/centos:latest                                                                                      0.0s
 => [2/2] RUN yum install -y vim                                                                                                   20.3s
 => exporting to image                                                                                                              0.5s
 => => exporting layers                                                                                                             0.5s
 => => writing image sha256:6fa5d61ccad62a224b2fd2d8d8526aa52bc12f42c6b27ab31e7df1f62768705d                                        0.0s
 => => naming to docker.io/javaedge/centos-vim-new                                                                                  0.0s
```
所以以后直接分享 Dockerfile 即可，别人拿到文件就能创建自己想要的 image。