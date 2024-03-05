## 1 容器生命周期管理

### 1.1 docker start

启动一或多个已被停止的容器。

```bash
# 启动已被停止的容器myrunoob
docker start myrunoob
```

### 1.2 docker stop

停止一个运行中的容器

```bash
docker stop myrunoob
```

### 1.3 docker restart

重启容器

```bash
docker restart myrunoob
```

### 1.4 docker run

创建一个新的容器并运行一个命令。

要根据 `docker images` 命令的结果启动对应镜像的容器，执行：

1. 运行 `docker images` 命令查看当前系统中所有可用的镜像列表。
2. 从结果中找到您想要启动的镜像的 `REPOSITORY` 和 `TAG`。
3. 使用 `docker run` 命令启动一个新的容器。该命令的基本格式为 `docker run [OPTIONS] IMAGE [COMMAND] [ARG...]`。其中 `IMAGE` 是镜像的名称，可能包括 `TAG`（如果未指定，则默认为 `latest`）。

案例：

1. 查看镜像列表：

```sh
docker images
```

输出：

```bash
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              18.04               c3c304cb4f22        2 weeks ago         64.2MB
nginx               latest              9beeba249f3e        3 weeks ago         109MB
```

启动名为 `nginx` 的镜像：

```sh
docker run -d -p 8080:80 --name mynginx nginx
```

在这个例子中：

- `-d` 选项表示在后台运行容器。
- `-p 8080:80` 表示将容器的 80 端口映射到主机的 8080 端口。
- `--name mynginx` 为您的容器设置了一个名字 `mynginx`，方便以后引用。
- `nginx` 是您选择的镜像名称。

如果您需要使用特定的标签，可以将其附加到镜像名称后面，例如 `nginx:1.17`。

根据具体需求添加或修改命令行选项，如需在容器启动时执行特定的命令或传递环境变量等。

实例：

```bash
docker run \
-p 6379:6379 --name redis \
# 将主机上的 /home/redis6/data 目录挂载到容器内部的 /data 目录，以便可以将 Redis 数据持久化到主机
-v /home/redis6/data:/data \
# 将主机上的 /home/redis6/conf/redis.conf 文件挂载到容器内部的 /etc/redis/redis.conf 文件，以便可以使用自定义的 Redis 配置文件
-v /home/redis6/conf/redis.conf:/etc/redis/redis.conf \
# 指定要使用的 Redis 镜像及版本号，并在后台运行容器
-d redis:6.2.7 \
# 在容器内部执行的命令，启动 Redis 服务，并使用 /etc/redis/redis.conf 配置文件
redis-server /etc/redis/redis.conf
```



```bash
-a stdin
  指定标准输入输出内容类型，可选 STDIN/STDOUT/STDERR 三项；

-d
  后台运行容器，并返回容器ID；

-i：--interactive    以交互模式运行容器，通常与 -t 同时使用，即使未连接STDIN也保持打开状态

-P: 随机端口映射，容器内部端口随机映射到主机的端口

-p: 指定端口映射，格式为：主机(宿主)端口:容器端口

-t: --tty  Allocate a pseudo-TTY为容器重新分配一个伪输入终端，通常与 -i 同时使用；

--name="nginx-lb"
  为容器指定一个名称

--dns 8.8.8.8: 指定容器使用的DNS服务器，默认和宿主一致；

--dns-search example.com: 指定容器DNS搜索域名，默认和宿主一致；

-h "mars": 指定容器的hostname；

-e username="ritchie": 设置环境变量；

--env-file=[]: 从指定文件读入环境变量；

--cpuset="0-2" or --cpuset="0,1,2": 绑定容器到指定CPU运行；

-m :设置容器使用内存最大值；

--net="bridge": 指定容器的网络连接类型，支持 bridge/host/none/container

--link=[]: 添加链接到另一个容器；

--expose=[]: 开放一个端口或一组端口；

--volume , -v: 绑定一个卷
# 设置容器的重启策略为 always，只能在 Docker 1.2 或更高版本中使用
--restart=always
```

##  2 本地镜像管理（镜像操作命令）

### 2.1 image

```bash
# 列出本机所有 image 文件
$ docker image ls
```

```bash
# 删除 image 文件
$ docker image rm [imageName]
```

#### 实战

```bash
[root@scheduler-center-1 ~]# docker ps
CONTAINER ID   IMAGE                         COMMAND                  CREATED        STATUS        PORTS                                       NAMES
fb88be2a8283   xuxueli/xxl-job-admin:2.4.0   "sh -c 'java -jar $J…"   15 hours ago   Up 15 hours   0.0.0.0:8080->8080/tcp, :::8080->8080/tcp   xxl-job-admin
[root@scheduler-center-1 ~]# docker image rm xxl-job-admin
Error response from daemon: No such image: xxl-job-admin:latest
[root@scheduler-center-1 ~]# docker  rm xxl-job-admin
Error response from daemon: You cannot remove a running container fb88be2a828361ed7173d94a346a7c7c2a4aa11bb17d82450a4424ddf44651f0. Stop the container before attempting removal or force remove
[root@scheduler-center-1 ~]# docker  rm xuxueli/xxl-job-admin:2.4.0
Error response from daemon: No such container: xuxueli/xxl-job-admin:2.4.0
```

试图删除 Docker 容器和 Docker 镜像，但遇到报错：

1. **删除容器时报错：**

   ```bash
   docker rm xxl-job-admin
   ```

   错误信息：You cannot remove a running container fb88be2a8283... Stop the container before attempting removal or force remove

   原因：你不能删除正在运行的容器。在这种情况下，容器 "fb88be2a8283" 处于运行状态。

   解决方法：首先停止容器，然后再删除。停止容器：

   ```bash
   docker stop xxl-job-admin
   ```

   然后再尝试删除容器。

2. **删除镜像时报错：**

   ```bash
   docker image rm xxl-job-admin
   ```

   错误信息：Error response from daemon: No such image: xxl-job-admin:latest

   原因：Docker 引擎无法找到名为 "xxl-job-admin" 的镜像，可能是因为该镜像不存在或者被命名为 "xuxueli/xxl-job-admin:2.4.0"。

   解决方法：确保要删除的镜像名称是正确的。如果你要删除 "xuxueli/xxl-job-admin:2.4.0"，则应该使用如下命令：

   ```bash
   docker image rm xuxueli/xxl-job-admin:2.4.0
   ```

#### image inspect

查看 Docker 镜像详细信息：

```bash
[root@service-monitoring ~]# docker image inspect mysql:5.7.42-oracle | grep -i version
                "GOSU_VERSION=1.16",
                "MYSQL_VERSION=5.7.42-1.el7",
                "MYSQL_SHELL_VERSION=8.0.33-1.el7"
        "DockerVersion": "20.10.23",
                "GOSU_VERSION=1.16",
                "MYSQL_VERSION=5.7.42-1.el7",
                "MYSQL_SHELL_VERSION=8.0.33-1.el7"
```

有时可用于查看 lastest 标签的 image，版本号到底多少。

而 `docker inspect` 命令是用于查看 Docker 对象（如容器、镜像、网络等）的详细信息，它不仅可以查看镜像的元数据，还可以查看容器的元数据、网络的元数据等。

image文件是通用的，一台机器的 image 文件拷贝到另一台机器，照样可以使用。为节省时间，尽量使用别人制作好的 image 文件。即使定制，也应基于别人的 image 文件进行加工，而不是从0开始。

为方便共享，image 文件制作完成后，上传到仓库：

- Docker 官方仓库 Docker Hub 是最重要、最常用的 image 仓库
- 出售自己制作的 image 文件也可

### 2.2 images

```bash
docker images = docker image ls
```

列出当前系统所有可用 Docker 镜像。提供repository、tag、image ID、和size的摘要信息。可查看在本地机器下载或创建的镜像。

![](https://img-blog.csdnimg.cn/20201216145633538.png)

`docker image` 和 `docker images` 区别：

- `docker image` 命令是 Docker 17.06 版本后新增命令，用于管理 Docker 镜像。可用来列出本地镜像、删除本地镜像、构建镜像等操作。如使用 `docker image ls` 命令可以列出本地所有的镜像
- `docker images` 命令是早期版本的 Docker 命令，用于列出本地所有镜像。功能与 `docker image ls`完全相同，只是命令不同

### 2.3 rmi

不想要某 image 时可用。

等效命令：

```bash
docker rmi imageId
```

### 2.4 tag

### docker image build

从Dockerfile构建image

```bash
Usage:  docker image build [OPTIONS] PATH | URL | -
```

### history

```bash
docker history image_id
```

![](https://img-blog.csdnimg.cn/20201216160907238.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### docker save

可将Docker镜像保存成tar文件，方便在不同环境中迁移和分享镜像。

```bash
docker save
	# OPTIONS为可选参数
	[OPTIONS]
	# IMAGE为需要导出的Docker镜像的名称（可以是多个）
	IMAGE [IMAGE...]
```

如：

```bash
# 将myimage镜像保存为名为myimage.tar的tar文件，并指定了输出路径为/path/to/。
docker save -o /path/to/myimage.tar myimage
```

```bash
-o, --output string：指定输出的压缩文件（.tar或.tgz）路径和名称
-q, --quiet：静默模式，只输出错误信息和进度条
--tag string：指定要导出的镜像的tag名称
```

运行这个命令之前，要先使用docker pull命令下载需要导出的镜像。

### docker load

### docker import

## 3 container

### 3.1 容器文件

image 文件生成的容器实例，本身也是一个文件，称为容器文件。也就是说，一旦容器生成，就会同时存在两个文件：

- image 文件
- 容器文件

关闭容器并不会删除容器文件，仅是容器停止运行。

### docker container ls

```bash
# 列出本机正在运行的容器
[root@scheduler-center-1 ~]# docker container ls
CONTAINER ID   IMAGE                         COMMAND                  CREATED        STATUS        PORTS                                       NAMES
fb88be2a8283   xuxueli/xxl-job-admin:2.4.0   "sh -c 'java -jar $J…"   16 hours ago   Up 16 hours   0.0.0.0:8080->8080/tcp, :::8080->8080/tcp   xxl-job-admin
```

```bash
# 列出本机所有容器，包括终止运行的容器
docker container ls --all(-a)
```

输出结果包括容器 ID。很多地方都要提供这 ID，如上一节终止容器运行的docker container kill命令。

> 有人说 docker ps & docker ps -a 更方便查看 container 运行状态呀！因为 docker container options 是Docker 1.13中的更新，docker container ls 与 docker ps 功能相同，但语义更明确，简化Docker用法，更推荐新写法。


`-q`直接显示当前所有容器的 container id

```bash
docker container ls -aq
docker container ls -a | awk {'print$1'}
```

![](https://img-blog.csdnimg.cn/20201216150220194.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

过滤状态字段显示

```bash
docker container ls -f "status=exited"
```

![](https://img-blog.csdnimg.cn/20201216153544136.png)

### docker container rm

终止运行的容器文件，依然会占据硬盘空间，可以使用docker container rm命令删除。

```bash
docker container rm [containerID]
```

运行上面的命令之后，再使用`docker container ls -a`命令，就会发现被删除的容器文件已经消失了。

#### 全部删除

由于一个个指定 containerid 很麻烦，可以全部删除：

```bash
docker rm $(docker container ls -aq)
```

#### 条件过滤删除

比如，我们想把退出的给全部删除
![](https://img-blog.csdnimg.cn/20201216153056650.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- 筛选出退出状态的image 文件
  ![](https://img-blog.csdnimg.cn/20201216153718540.png)
  直接删除

```bash
docker rm $(docker container ls -f "status=exited" -q)
```

### docker container commit

根据容器的更改创建新image，比如在原 image 基础上安装了新的软件，那就可以上传新 image。

```bash
Usage:  docker container commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
```

![](https://img-blog.csdnimg.cn/20201216160219672.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)



可简写为

```bash
docker commit
```

## 4 容器操作命令

### 4.1 ps

`docker ps` ，用于列出当前正在运行的容器的命令。它可以显示容器的 ID、名称、状态、启动时间、所使用的镜像等信息。

如果在命令行中执行 `docker ps`，会输出当前正在运行的容器的列表，包括容器的 ID、名称、状态、启动时间、所使用的镜像等信息。例如：

```bash
CONTAINER ID   IMAGE                     COMMAND                  CREATED          STATUS          PORTS                                       NAMES
ec88509b8b1b   mysql:5.7.42-oracle       "docker-entrypoint.s…"   10 minutes ago   Up 10 minutes   0.0.0.0:3306->3306/tcp, 33060/tcp         mysql
```

上面的输出表示只有一个名为 `mysql` 的容器正在运行，它使用的是 `mysql:5.7.42-oracle` 镜像，并且将其 3306 端口映射到主机的 3306 端口。

```bash
[root@service-monitoring home]# docker ps -a
CONTAINER ID   IMAGE                 COMMAND                  CREATED          STATUS                      PORTS     NAMES
ec88509b8b1b   mysql:5.7.42-oracle   "docker-entrypoint.s…"   10 minutes ago   Exited (1) 10 minutes ago             mysql
60180275418c   hello-world           "/hello"                 2 days ago       Exited (0) 2 days ago                 laughing_mcclintock
[root@service-monitoring home]# 
```



### 4.2 inspect

docker inspect : 获取容器/镜像的元数据。

```bash
docker inspect [OPTIONS] NAME|ID [NAME|ID...]
```

```bash
-f :指定返回值的模板文件。
-s :显示总的文件大小。
--type :为指定类型返回JSON。
```

```bash
# 获取镜像mysql:5.6的元信息
runoob@runoob:~$ docker inspect mysql:5.6
[
    {
        "Id": "sha256:2c0964ec182ae9a045f866bbc2553087f6e42bfc16074a74fb820af235f070ec",
        "RepoTags": [
            "mysql:5.6"
        ],
        "RepoDigests": [],
        "Parent": "",
        "Comment": "",
        "Created": "2016-05-24T04:01:41.168371815Z",
        "Container": "e0924bc460ff97787f34610115e9363e6363b30b8efa406e28eb495ab199ca54",
        "ContainerConfig": {
            "Hostname": "b0cf605c7757",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "ExposedPorts": {
                "3306/tcp": {}
            },
...
```

获取正在运行的容器mymysql的 IP。

```bash
runoob@runoob:~$ docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mymysql
172.17.0.3
```

### pull

![](https://img-blog.csdnimg.cn/20201216192723247.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

### push

```bash
docker push
```

![](https://img-blog.csdnimg.cn/20201216185737770.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
注意 tag 必须是 hub 仓库的用户名，否则报错无权限。
![](https://img-blog.csdnimg.cn/20201216185850553.png)
但不推荐直接上传镜像，而是考虑安全问题，使用 Dockerfile 文件。即建立 hub 仓库和 GitHub 的映射，只要 GitHub 上有 Dockerfile 就会自动映射到 Dockerhub。

### docker search

`docker search`命令用于在Docker Hub上搜索可以用来构建和运行容器的镜像。可以按照以下格式使用该命令：

```bash
docker search [OPTIONS]
	# TERM是需要搜索的关键字
	TERM
```

如：

```bash
docker search portainer
```

上面的命令会在Docker Hub上搜索关键字为`portainer`的镜像，并列出匹配的相关信息，如镜像名称、描述、星级、官方/非官方等。

![](https://img-blog.csdnimg.cn/6c752cd75f5243a0a969d6a4c2ac7d64.png)

常用选项：

```bash
--filter=STARS=N：表示只列出点赞数大于或等于N的镜像
--filter=IS_OFFICIAL=true|false：表示只列出Docker官方发布的或者非官方发布的镜像
-s, --stars[0]：表示按点赞数排序，默认值为1，即只显示点赞数大于等于1的镜像
--format="{{.Name}}:{{.Description}}"：自定义输出格式，例如仅显示镜像名称和描述信息
```

`docker search`命令不仅能用来搜索公共仓库，还可以搜索私有仓库，只需要在关键字中包含私有仓库地址即可，如：

```bash
docker search docker.example.com/mysql
```

由于网络原因，`docker search`命令可能会存在访问异常或者网络超时等问题。

### docker exec

用于在运行中的容器中执行命令。允许你在容器内执行命令，就像在本地计算机一样：

- 对在运行中的容器中调试应用程序很有用
- 或在容器中运行交互式命令行工具

```bash
docker exec
# OPTIONS 参数可选，可以用于指定一些选项，例如执行命令的用户、工作目录等
	[OPTIONS]
		# CONTAINER 参数必需，指定要在其中执行命令的容器
		CONTAINER
			# COMMAND 和 ARG 参数也必需，指定要在容器内部执行的命令及其参数
			COMMAND [ARG...]
```



```bash
# 进个 py 项目的容器
docker exec -it image_id /bin/bash

# 查看 Python 的进程
ps -ef | grep python

# 进入容器项目的python
docker exec -it image_id python
# 查看 ip
docker exec -it image_id ip a


[root@service-monitoring ~]# docker exec -it mysql bash
bash-4.2# mysql -u root -p
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 5
Server version: 5.7.42 MySQL Community Server (GPL)

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 
```

### docker update

更新正在运行的容器的配置信息。可用于更新容器的 CPU、内存、网络、挂载卷等配置信息，而无需停止和重启容器。

```bash
docker update [OPTIONS] CONTAINER [CONTAINER...]

--cpu-shares：设置容器使用 CPU 的相对权重。默认为 0，表示与其他容器共享 CPU 时间
--memory：设置容器使用的内存限制。默认为 0，表示不限制内存使用
--restart：设置容器退出后的重启策略。默认为 "no"，表示容器退出后不重启
--ulimit：设置容器使用的系统资源限制，如最大打开文件数、最大进程数等
```

如将容器 `mycontainer` 的 CPU 权重设为 512，内存限制为 1GB，重启策略为 always：

```bash
docker update
	--cpu-shares 512
	--memory 1g
	--restart always mycontainer
```

该命令只能更新容器的配置信息，不能更新容器的镜像和文件系统。如果需要更新镜像和文件系统，需要先停止容器，然后使用 `docker rm` 命令删除容器，再使用 `docker run` 命令重新创建容器。

## 5 Docker-Compose

该系列命令须运行在 yaml文件所在目录。否则报错：

```bash
[root@javaedge-monitor-platform-dev ~]# docker-compose exec mysql bash
ERROR: 
        Can't find a suitable configuration file in this directory or any
        parent. Are you in the right directory?

        Supported filenames: docker-compose.yml, docker-compose.yaml
```



### docker compose



docker compose up [-d]

```bash
# 使用 docker-compose.yml 文件定义的容器,启动并在后台运行。
docker compose
	# 创建容器并启动
	up
		# 后台运行方式启动
		-d
```

容器启动后会一直在后台运行，可通过 `docker-compose ps` 查看状态。



要停止后台运行的容器,可以使用 `docker-compose stop` 命令。

## 6 network

Docker network 相关的常用命令主要包括：

3.  `docker network create` - 创建一个新网络
4.  `docker network connect` - 将容器连接到网络
5.  `docker network disconnect` - 将容器从网络断开
6.  `docker network rm` - 删除指定网络

### 6.1 docker network ls



列出 Docker 主机上的所有网络,包括网络名称、ID、驱动等信息。

```bash
docker network ls
```

### 6.2 docker network inspect

查看指定网络的详细配置信息。通过 network ID 或 name 指定网络:

```bash
docker@minikube:~$ docker network inspect bridge
[
    {
        "Name": "bridge",
        "Id": "675eddaf1c1e76a5c0fe4b56f86831cb7c7d0fc597d766fd7df533cf09e11832",
        "Created": "2023-05-10T15:05:28.409718304Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.17.0.0/16",
                    "Gateway": "172.17.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {},
        "Options": {
            "com.docker.network.bridge.default_bridge": "true",
            "com.docker.network.bridge.enable_icc": "true",
            "com.docker.network.bridge.enable_ip_masquerade": "true",
            "com.docker.network.bridge.host_binding_ipv4": "0.0.0.0",
            "com.docker.network.bridge.name": "docker0",
            "com.docker.network.driver.mtu": "1500"
        },
        "Labels": {}
    }
]
docker@minikube:~$ 
```

3. `docker network create`创建一个新的 Docker 网络。我们可以指定网络类型、驱动程序等配置创建定制化网络:

```bash
docker network create -d macvlan \
  --subnet=172.16.86.0/24 \
  --gateway=172.16.86.1 \
  -o parent=eth0 pub_net
```

4. `docker network connect`将一个容器连接到指定网络。需指定网络名称或 ID,以及容器名称或 ID:

```bash
 
docker network connect multi-host-network container1
```

5. `docker network disconnect`将容器从指定网络断开连接。使用方法与 `connect` 类似:

```bash
docker network disconnect multi-host-network container1
```

6. `docker network rm`删除指定的 Docker 网络。删除前,确保指定网络下没有任何容器在使用:

```bash
docker network rm multi-host-network 
```

所以,总结来说,Docker network 命令用于管理 Docker 的网络功能。我们可以创建各种类型的网络,将容器连接或断开网络,以及在需要时删除网络。熟练掌握 Docker 的网络功能和相关命令,可以让我们在使用 Docker 部署应用时,有更高的灵活性和便捷性。适当使用网络可以实现容器间通信、容器到宿主机通信等,这在日常开发和运维场景下非常常用。



```bash
[root@javaedge-monitor-platform-dev docker]# docker network ls
NETWORK ID     NAME               DRIVER    SCOPE
64ad1eca60f7   bridge             bridge    local
4689aefb8f9b   docker_my-bridge   bridge    local
f2f555bed377   host               host      local
d02380dd3da4   none               null      local
[root@javaedge-monitor-platform-dev docker]# 
```

## 7 日志 docker logs

获取容器的日志。

### 7.1 语法

```bash
docker logs [OPTIONS] CONTAINER
```

- **-f :** 跟踪日志输出
- **--since :**显示某个开始时间的所有日志
- **-t :** 显示时间戳
- **--tail :**仅列出最新N条容器日志

### 7.2 实例

跟踪查看容器mynginx的日志输出。

```bash
runoob@runoob:~$ docker logs -f mynginx
192.168.239.1 - - [10/Jul/2016:16:53:33 +0000] "GET / HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36" "-"
2016/07/10 16:53:33 [error] 5#5: *1 open() "/usr/share/nginx/html/favicon.ico" failed (2: No such file or directory), client: 192.168.239.1, server: localhost, request: "GET /favicon.ico HTTP/1.1", host: "192.168.239.130", referrer: "http://192.168.239.130/"
192.168.239.1 - - [10/Jul/2016:16:53:33 +0000] "GET /favicon.ico HTTP/1.1" 404 571 "http://192.168.239.130/" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36" "-"
192.168.239.1 - - [10/Jul/2016:16:53:59 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36" "-"
...
```

查看容器mynginx从2016年7月1日后的最新10条日志。

```bash
docker logs --since="2016-07-01" --tail=10 mynginx
```

#### 7.3 无法查找指定字符串

执行以下命令没有在docker logs的结果中查找字符串，而是会输出了所有的日志

```bash
docker logs nginx | grep 127
```

因为管道符仅对stdout有效，如果容器将日志记录到stderr，这种情况就会发生。

#### 解决方案

把stderr重定向到stdout：

```bash
docker logs nginx 2>&1 | grep 127
```

还有一种方式，但麻烦：

```bash
grep 127 `docker inspect --format={{.LogPath}} nginx`
```


docker-compose可直接使用内置命令：

```bash
docker-compose logs nginx | grep 127
```

## 8 docker scout quickview



```bash
docker scout quickview [IMAGE|DIRECTORY|ARCHIVE]
```

`docker scout quickview` 显示指定image的快速概览。它显示指定image和基础image中漏洞的摘要。如果可用，它还显示基础image的刷新和更新建议。

如果没有指定image，则使用最近构建的image。

支持以下类型的构件：

- image
- OCI 布局目录
- 由 `docker save` 创建的 Tarball 存档
- 本地目录或文件

默认情况下，该工具期望一个image引用，如：

- `redis`
- `curlimages/curl:7.87.0`
- `mcr.microsoft.com/dotnet/runtime:7.0`

如要分析的构件是 OCI 目录、Tarball 存档、本地文件或目录，或者如果您想要控制从何处解析图像，须在引用前加上以下之一：

- `image://`（默认）使用本地图像，或者回退到注册表查找
- `local://` 使用本地图像存储中的图像（不进行注册表查找）
- `registry://` 使用注册表中的图像（不使用本地图像）
- `oci-dir://` 使用 OCI 布局目录
- `archive://` 使用由 `docker save` 创建的 Tarball 存档
- `fs://` 使用本地目录或文件

### [选项]

| 选项         | 短格式 | 默认值 | 描述                                                         |
| ------------ | ------ | ------ | ------------------------------------------------------------ |
| `--env`      |        |        | 环境名称                                                     |
| `--latest`   |        |        | 最新索引的图像                                               |
| `--org`      |        |        | Docker 组织的命名空间                                        |
| `--output`   | `-o`   |        | 将报告写入文件                                               |
| `--platform` |        |        | 要分析的图像平台                                             |
| `--ref`      |        |        | 如果提供的 Tarball 包含多个引用，则要使用的引用。仅适用于存档。 |
| `--stream`   |        |        | 已弃用，流的名称                                             |

### [示例]

```bash
# 对image进行快速概览
$ docker scout quickview nacos/nacos-server:latest
```

![](https://javaedge.oss-cn-shanghai.aliyuncs.com/image-20240105132217485.png)

```bash
# 对最近构建的image进行快速概览
javaedge@JavaEdgedeMac-mini % docker scout qv
INFO New version 1.2.2 available (installed version is 0.20.0)
    ✓ SBOM of image already cached, 450 packages indexed

  Your image  nacos/nacos-server:latest  │    0C     4H    19M    22L
  Base image  centos:7                   │    1C    13H    29M    13L

What's Next?
  Learn more about vulnerabilities → docker scout cves nacos/nacos-server:latest
```

```bash
# 分析软件构件的漏洞。如未指定image，则使用最近构建的图像。
javaedge@JavaEdgedeMac-mini frp_0.52.3 % docker scout cves nacos/nacos-server:latest
INFO New version 1.2.2 available (installed version is 0.20.0)
    ✓ Provenance obtained from attestation
    ✓ SBOM of image already cached, 450 packages indexed
    ✗ Detected 20 vulnerable packages with a total of 44 vulnerabilities

   0C     1H     5M     0L  lxml 3.2.1
pkg:pypi/lxml@3.2.1

    ✗ HIGH CVE-2021-43818 [Improper Neutralization of Special Elements in Output Used by a Downstream Component ('Injection')]
      https://scout.docker.com/v/CVE-2021-43818
      Affected range : <4.6.5
      Fixed version  : 4.6.5
      CVSS Score     : 8.2
      CVSS Vector    : CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:H/A:N
```

## X help

```bash
docker --help
```

忘记命令咋办？用它！

参考

- https://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html