
# 0 前言
全是干货的技术殿堂

> `文章收录在我的 GitHub 仓库，欢迎Star/fork：`
> [Java-Interview-Tutorial](https://github.com/Wasabi1234/Java-Interview-Tutorial)
> https://github.com/Wasabi1234/Java-Interview-Tutorial

# 下载安装及基本配置
[Git官网下载](https://git-scm.com/download/win)
[Git GUI下载](https://desktop.github.com/)

安装成功后，打开，右击选择options进行个性化设置：
- 外观
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI0OTg2XzIwMTkwODA1MTUxNDM0MTYwLnBuZw?x-oss-process=image/format,png)

- 字体 
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI0OTkyXzIwMTkwODA1MTUxNjE1ODQ3LnBuZw?x-oss-process=image/format,png)


- 版本
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI0OTUwXzIwMTkwODA1MTUxNzU2MjQzLnBuZw?x-oss-process=image/format,png)
# 1 版本控制
## 1.1 关于版本控制
版本控制是一种记录一个或若干文件内容变化，以便将来查阅特定版本修订情况的系统。开发中，我们仅对保存着软件源代码的文本文件作版本控制管理，但实际上，可以对任何类型的文件进行版本控制。

采用版本控制系统就可以将某个文件回溯到之前的状态，甚至将整个项目都回退到过去某个时间点的状态。
可以比较文件的变化细节，查出最后是谁修改了哪个地方，从而找出导致怪异问题出现的原因，又是谁在何时报告了某个功能缺陷等等。
使用版本控制系统通常还意味着，就算你乱来一气把整个项目中的文件改的改删的删，你也照样可以轻松恢复到原先的样子。但额外增加的工作量却微乎其微。

### 1.1.1 本地版本控制系统
许多人习惯用复制整个项目目录的方式来保存不同的版本，或许还会改名加上备份时间以示区别。这么做唯一的好处就是简单。不过坏处也不少：有时候会混淆所在的工作目录，一旦弄错文件丢了数据就没法撤销恢复。

为了解决这个问题，人们很久以前就开发了许多种本地版本控制系统，大多都是采用某种简单的数据库来记录文件的历次更新差异
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI0OTI5XzIwMTkwODA3MDk1NTMxNzk2LnBuZw?x-oss-process=image/format,png)
其中最流行的一种叫做 rcs，现今许多计算机系统上都还看得到它的踪影。甚至在流行的 Mac OS X 系统上安装了开发者工具包之后，也可以使用 rcs 命令。它的工作原理基本上就是保存并管理文件补丁（patch）。文件补丁是一种特定格式的文本文件，记录着对应文件修订前后的内容变化。所以，根据每次修订后的补丁，rcs 可以通过不断打补丁，计算出各个版本的文件内容,像WPS也有类似功能。

### 1.1.2 集中化的版本控制系统
如何让在不同系统上的开发者协同工作？
于是，集中化的版本控制系统（ Centralized Version Control Systems，CVCS ）应运而生。
诸如 CVS，Subversion 以及 Perforce 等，都有一个单一的集中管理的服务器，保存所有文件的修订版本，而协同工作的人们都通过客户端连到这台服务器，取出最新的文件或者提交更新。多年以来，这已成为版本控制系统的标准做法
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI1MDQxXzIwMTkwODA3MDk1NzUyNDgucG5n?x-oss-process=image/format,png)

每个人都可以在一定程度上看到项目中的其他人正在做些什么。
管理员也可以轻松掌控每个开发者的权限，并且管理一个 CVCS 要远比在各个客户端上维护本地数据库来得轻松容易。

#### 缺陷
中央服务器的单点故障。如果宕机一小时，那么在这一小时内，谁都无法提交更新，也就无法协同工作。
要是中央服务器的磁盘发生故障，碰巧没做备份，或者备份不够及时，就会有丢失数据的风险。
最坏的情况是彻底丢失整个项目的所有历史更改记录，而被客户端偶然提取出来的保存在本地的某些快照数据就成了恢复数据的希望。但这样的话依然是个问题，你不能保证所有的数据都已经有人事先完整提取出来过。
本地版本控制系统也存在类似问题，只要整个项目的历史记录被保存在单一位置，就有丢失所有历史更新记录的风险。

于是分布式版本控制系统（ Distributed Version Control System，简称 DVCS ）面世！

### 1.1.3 分布式版本控制系统
像 Git，Mercurial，Bazaar 以及 Darcs 等，客户端并不只提取最新版本的文件快照，而是把代码仓库完整地镜像下来。

#### 优势
任何一处协同工作用的服务器发生故障，事后都可以用任何一个镜像出来的本地仓库恢复。因为每一次的提取操作，实际上都是一次对代码仓库的完整备份
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI0OTU3XzIwMTkwODA3MTAwMTA3OTU0LnBuZw?x-oss-process=image/format,png)

许多这类系统都可以指定和若干不同的远端代码仓库进行交互。籍此，你就可以在同一个项目中，分别和不同工作小组的人相互协作。你可以根据需要设定不同的协作流程，比如层次模型式的工作流，而这在以前的集中式系统中是无法实现的。

# 2 Git 发展史
Linux 内核开源项目有着为数众广的参与者。绝大多数的 Linux 内核维护工作都花在了提交补丁和保存归档的繁琐事务上（1991－2002年间）。到 2002 年，整个项目组开始启用分布式版本控制系统 BitKeeper 来管理和维护代码。

到了 2005 年，开发 BitKeeper 的商业公司同 Linux 内核开源社区的合作关系结束，他们收回了免费使用 BitKeeper 的权力。这就迫使 Linux 开源社区（特别是 Linux 的缔造者 Linus Torvalds ）不得不吸取教训，只有开发一套属于自己的版本控制系统才不至于重蹈覆辙。他们对新的系统制订了若干目标：

速度
简单的设计
对非线性开发模式的强力支持（允许上千个并行开发的分支）
完全分布式
有能力高效管理类似 Linux 内核一样的超大规模项目（速度和数据量）
自诞生于 2005 年以来，Git 日臻成熟完善，在高度易用的同时，仍然保留着初期设定的目标。它的速度飞快，极其适合管理大项目，它还有着令人难以置信的非线性分支管理系统（见第三章），可以应付各种复杂的项目开发需求。

# 2 Git 命令
## 2.1 Git配置
```bash
$ git config --global user.name "Your Name"
$ git config --global user.email "email@example.com"
```
`git config`命令的`--global`参数，表明这台机器上的所有Git仓库都会使用这个配置，也可以对某个仓库指定不同的用户名和邮箱地址。

## 2.2 版本库
#### 初始化一个Git仓库
```bash
$ git init
```
#### 添加文件到Git仓库
包括两步：
```bash
$ git add <file>
$ git commit -m "description"
```
`git add`可以反复多次使用，添加多个文件，`git commit`可以一次提交很多文件，`-m`后面输入的是本次提交的说明，可以输入任意内容。

### 查看工作区状态
```bash
$ git status
```
### 查看修改内容
```bash
$ git diff
```
```bash
$ git diff --cached
```
```bash
$ git diff HEAD -- <file>
```
- `git diff` 可以查看工作区(work dict)和暂存区(stage)的区别
- `git diff --cached` 可以查看暂存区(stage)和分支(master)的区别
- `git diff HEAD -- <file>` 可以查看工作区和版本库里面最新版本的区别
### 查看提交日志
```bash
$ git log
```
简化日志输出信息
```bash
$ git log --pretty=oneline
```
### 查看命令历史
```bash
$ git reflog
```
### 版本回退
```bash
$ git reset --hard HEAD^
```
以上命令是返回上一个版本，在Git中，用`HEAD`表示当前版本，上一个版本就是`HEAD^`，上上一个版本是`HEAD^^`，往上100个版本写成`HEAD~100`。
### 回退指定版本号
```bash
$ git reset --hard commit_id
```
commit_id是版本号，是一个用SHA1计算出的序列

### 工作区、暂存区和版本库
工作区：在电脑里能看到的目录；
版本库：在工作区有一个隐藏目录`.git`，是Git的版本库。
Git的版本库中存了很多东西，其中最重要的就是称为stage（或者称为index）的暂存区，还有Git自动创建的`master`，以及指向`master`的指针`HEAD`。

![理解](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI1MTIyX2FIUjBjSE02THk5MWNHeHZZV1JtYVd4bGN5NXViM2RqYjJSbGNpNWpiMjB2Wm1sc1pYTXZNakF4T1RBME1UVXZOVEE0T0RjMU5WOHhOVFUxTXpNd01USXlOVFU1WHpRMk9EVTVOamd0TXpBM1pEa3pZakUyT1RKa04yWTFaZw?x-oss-process=image/format,png)

进一步解释一些命令：
- `git add`实际上是把文件添加到暂存区
- `git commit`实际上是把暂存区的所有内容提交到当前分支
### 撤销修改
#### 丢弃工作区的修改
```bash
$ git checkout -- <file>
```
该命令是指将文件在工作区的修改全部撤销，这里有两种情况：
1. 一种是file自修改后还没有被放到暂存区，现在，撤销修改就回到和版本库一模一样的状态；
2. 一种是file已经添加到暂存区后，又作了修改，现在，撤销修改就回到添加到暂存区后的状态。

总之，就是让这个文件回到最近一次git commit或git add时的状态。

#### 丢弃暂存区的修改
分两步：
第一步，把暂存区的修改撤销掉(unstage)，重新放回工作区：
```bash
$ git reset HEAD <file>
```
第二步，撤销工作区的修改
```bash
$ git checkout -- <file>
```
小结：
1. 当你改乱了工作区某个文件的内容，想直接丢弃工作区的修改时，用命令`git checkout -- <file>`。
2. 当你不但改乱了工作区某个文件的内容，还添加到了暂存区时，想丢弃修改，分两步，第一步用命令`git reset HEAD <file>`，就回到了第一步，第二步按第一步操作。

3. 已经提交了不合适的修改到版本库时，想要撤销本次提交，进行版本回退，前提是没有推送到远程库。

### 删除文件
```bash
$ git rm <file>
```
`git rm <file>`相当于执行
```bash
$ rm <file>
$ git add <file>
```
#### 进一步的解释
Q：比如执行了`rm text.txt` 误删了怎么恢复？
A：执行`git checkout -- text.txt` 把版本库的东西重新写回工作区就行了
Q：如果执行了`git rm text.txt`我们会发现工作区的text.txt也删除了，怎么恢复？
A：先撤销暂存区修改，重新放回工作区，然后再从版本库写回到工作区
```bash
$ git reset head text.txt
$ git checkout -- text.txt
```
Q：如果真的想从版本库里面删除文件怎么做？
A：执行`git commit -m "delete text.txt"`，提交后最新的版本库将不包含这个文件

## git rm 与 git rm --cached
当我们需要删除暂存区或分支上的文件, 同时工作区也不需要这个文件了, 可以使用

```bash
git rm file_path 
```

当我们需要删除暂存区或分支上的文件, 但本地又需要使用, 只是不希望这个文件被版本控制, 可以使用

```bash
git rm --cached file_path
```


## 2.3 远程仓库
#### 创建SSH Key
```bash
$ ssh-keygen -t rsa -C "youremail@example.com"
```
### 关联远程仓库
```bash
$ git remote add origin https://github.com/username/repositoryname.git
```
### 推送到远程仓库
```bash
$ git push -u origin master
```
`-u` 表示第一次推送master分支的所有内容，此后，每次本地提交后，只要有必要，就可以使用命令`git push origin master`推送最新修改。

### 从远程克隆
在使用git来进行版本控制时，为了得一个项目的拷贝(copy),我们需要知道这个项目仓库的地址(Git URL). 
Git能在许多协议下使用，所以Git URL可能以ssh://, http(s)://, git://,或是只是以一个用户名（git 会认为这是一个ssh 地址）为前辍.

有些仓库可以通过不只一种协议来访问
例如，Git本身的源代码你既可以用 git:// 协议来访问：
git clone [git://git.kernel.org/pub/scm/git/git.git](https://link.jianshu.com?t=git://git.kernel.org/pub/scm/git/git.git)
也可以通过http 协议来访问:
git clone [http://www.kernel.org/pub/scm/git/git.git](https://link.jianshu.com?t=http://www.kernel.org/pub/scm/git/git.git)
git://协议较为快速和有效,但是有时必须使用http协议,比如你公司的防火墙阻止了你的非http访问请求.如果你执行了上面两行命令中的任意一个,你会看到一个新目录: 'git',它包含有所的Git源代码和历史记录.
在默认情况下，Git会把"Git URL"里最后一级目录名的'.git'的后辍去掉,做为新克隆(clone)项目的目录名: (例如. git clone [http://git.kernel.org/linux/kernel/git/torvalds/linux-2.6.git](https://link.jianshu.com?t=http://git.kernel.org/linux/kernel/git/torvalds/linux-2.6.git) 会建立一个目录叫'linux-2.6')
另外，如果访问一个Git URL需要用法名和密码，可以在Git URL前加上用户名，并在它们之间加上@符合以表示分割，然后执行git clone命令，git会提示你输入密码。
示例
git clone [v_shishusheng@http://www.kernel.org/pub/scm/git/git.git](https://link.jianshu.com?t=http://v_shishusheng@http://www.kernel.org/pub/scm/git/git.git)
这样将以作为[v_shishusheng](https://link.jianshu.com?t=http://v_shishusheng)用户名访问[http://www.kernel.org/pub/scm/git/git.git](https://link.jianshu.com?t=http://www.kernel.org/pub/scm/git/git.git)，然后按回车键执行git clone命令，git会提示你输入密码。
另外，我们可以通过-b <name>来指定要克隆的分支名，比如
$ git clone -b master2 ../server .
表示克隆名为master2的这个分支，如果省略-b <name>表示克隆master分支。
```bash
$ git clone https://github.com/usern/repositoryname.git
```

### 删除远程仓库文件
可能某些不需要的目录上传到远程仓库去了，下面开始操作
- 预览将要删除的文件

```bash
git rm -r -n --cached 文件/文件夹名称 
```
![](https://img-blog.csdnimg.cn/2020030909581747.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
> 加上 -n 参数，执行命令时，不会删除任何文件，而是展示此命令要删除的文件列表预览

- 确认后删除

```bash
git rm -r --cached 文件/文件夹名称
```
![](https://img-blog.csdnimg.cn/20200309100251449.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
- 提交到本地并推送到远程服务器

```bash
git commit -m "提交说明"
```
![](https://img-blog.csdnimg.cn/20200309100358480.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)

```bash
git push origin master
```
![](https://img-blog.csdnimg.cn/2020030910043664.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_1,color_FFFFFF,t_70)
## 2.4 分支
### 2.4.1 创建分支
```bash
$ git branch <branchname>
```
### 2.4.2 查看分支
```bash
$ git branch
```
`git branch`命令会列出所有分支，当前分支前面会标一个*号。

### 2.4.3 切换分支
```bash
$ git checkout <branchname>
```

### 2.4.4 创建+切换分支
```bash
$ git checkout -b <branchname>
```

### 2.4.5 合并某分支到当前分支
```bash
$ git merge <branchname>
```

### 2.4.6 删除分支
```bash
$ git branch -d <branchname>
```
### 2.4.7 查看分支合并图
```bash
$ git log --graph
```
当Git无法自动合并分支时，就必须首先解决冲突。解决冲突后，再提交，合并完成。用`git log --graph`命令可以看到分支合并图。

#### 普通模式合并分支
```bash
$ git merge --no-ff -m "description" <branchname>
```
因为本次合并要创建一个新的commit，所以加上`-m`参数，把commit描述写进去。合并分支时，加上`--no-ff`参数就可以用普通模式合并，能看出来曾经做过合并，包含作者和时间戳等信息，而fast forward合并就看不出来曾经做过合并。

#### 保存工作现场
```bash
$ git stash
```
#### 查看工作现场
```bash
$ git stash list
```
#### 恢复工作现场
```bash
$ git stash pop
```
#### 丢弃一个没有合并过的分支
```bash
$ git branch -D <branchname>
```

#### 查看远程库信息
```bash
$ git remote -v
```

#### 在本地创建和远程分支对应的分支
```bash
$ git checkout -b branch-name origin/branch-name，
```
本地和远程分支的名称最好一致；

#### 建立本地分支和远程分支的关联
```bash
$ git branch --set-upstream branch-name origin/branch-name；
```


#### 从本地推送分支 （将本地项目与远程仓库项目关联）
```bash
$ git push origin branch-name
```
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI1MDg1X2FIUjBjSE02THk5MWNHeHZZV1JtYVd4bGN5NXViM2RqYjJSbGNpNWpiMjB2Wm1sc1pYTXZNakF4T1RBME1UVXZOVEE0T0RjMU5WOHhOVFUxTXpNd01USXlOemd5WHpFMk56Z3lNekV4TFdFME9XSmtZV000WW1RNVpUSXpNRE11Y0c1bg?x-oss-process=image/format,png)
如果推送失败，先用git pull抓取远程的新提交；

#### 从远程抓取分支
```bash
$ git pull
```
如果有冲突，要先处理冲突。

### 标签
tag就是一个让人容易记住的有意义的名字，它跟某个commit绑在一起。
#### 新建一个标签
```bash
$ git tag <tagname>
```
命令`git tag <tagname>`用于新建一个标签，默认为HEAD，也可以指定一个commit id。
#### 指定标签信息
```bash
$ git tag -a <tagname> -m <description> <branchname> or commit_id
```
`git tag -a <tagname> -m "blablabla..."`可以指定标签信息。
#### PGP签名标签
```bash
$ git tag -s <tagname> -m <description> <branchname> or commit_id
```
`git tag -s <tagname> -m "blablabla..."`可以用PGP签名标签。
#### 查看所有标签
```bash
$ git tag
```
#### 推送一个本地标签
```bash
$ git push origin <tagname>
```
#### 推送全部未推送过的本地标签
```bash
$ git push origin --tags
```
#### 删除一个本地标签
```bash
$ git tag -d <tagname>
```
#### 删除一个远程标签
```bash
$ git push origin :refs/tags/<tagname>
```

#### 调整commit之间的顺序
- 首先看一下当前的提交历史，代码如下：
```
$ git log --oneline
```
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI1MTM0X2FIUjBjSE02THk5MWNHeHZZV1JtYVd4bGN5NXViM2RqYjJSbGNpNWpiMjB2Wm1sc1pYTXZNakF4T1RBME1UVXZOVEE0T0RjMU5WOHhOVFUxTXpNd01USXlPREExWHpRMk9EVTVOamd0TW1RM1lqVmxOREkwTXpFeU1HRTFNaTV3Ym1j?x-oss-process=image/format,png)
下面将add N提交挪到c2提交之前，下面开始操作：
```
$ git rebase -i b0aa963
```
特别说明：b0aa963用来确定commit范围，表示从此提交开始到当前的提交（不包括b0aa963提交）。

运行此命令后，弹出VIM编辑器
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI1MDY4X2FIUjBjSE02THk5MWNHeHZZV1JtYVd4bGN5NXViM2RqYjJSbGNpNWpiMjB2Wm1sc1pYTXZNakF4T1RBME1UVXZOVEE0T0RjMU5WOHhOVFUxTXpNd01USXlOekV3WHpRMk9EVTVOamd0TjJNMFkyWTVOemc0TkRneE16bGlOUzV3Ym1j?x-oss-process=image/format,png)
截图说明：

（1）.顶部的commit提交排列顺序与git log排列相反，最先提交的在最上面。

（2）.前面的pick表示保留此次commit提交不做修改。

（3）.底部给出所有可用的命令。

只要手动调整一下对应提交的位置即可：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI1MDgwX2FIUjBjSE02THk5MWNHeHZZV1JtYVd4bGN5NXViM2RqYjJSbGNpNWpiMjB2Wm1sc1pYTXZNakF4T1RBME1UVXZOVEE0T0RjMU5WOHhOVFUxTXpNd01USXlOakkyWHpRMk9EVTVOamd0TjJGa016SXdORFkyTXpOaFlqUXpNaTV3Ym1j?x-oss-process=image/format,png)
最后保存离开就可以自动完成，再来看一下提交历史记录：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWRmaWxlcy5ub3djb2Rlci5jb20vZmlsZXMvMjAxOTA4MDcvNTA4ODc1NV8xNTY1MTQzNjI1MTY1X2FIUjBjSE02THk5MWNHeHZZV1JtYVd4bGN5NXViM2RqYjJSbGNpNWpiMjB2Wm1sc1pYTXZNakF4T1RBME1UVXZOVEE0T0RjMU5WOHhOVFUxTXpNd01USXlOalkwWHpRMk9EVTVOamd0TUdOaFpqQmtNRE5sTnpCaU1UVXhOQzV3Ym1j?x-oss-process=image/format,png)
.调整影响：

无论是调整commit顺序或者删除commit，都有可能产生冲突或者错误。

比如，后面的提交对前面的他比较有依赖性，而删除前面的提交，则势必会出现问题，就好比穿越时空来到父母恋爱之时，这时候如果热恋中的父母分手，那自己又会从哪里来呢。

# 参考
[Git Book](https://git-scm.com/book/en/v2)