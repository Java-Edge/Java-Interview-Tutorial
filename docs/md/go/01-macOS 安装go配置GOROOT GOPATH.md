# 01-macOS 安装go配置GOROOT GOPATH

## 1 获取go相关信息



```bash
javaedge@JavaEdgedeMac-mini src % brew info go
==> Downloading https://mirrors.ustc.edu.cn/homebrew-bottles/api/cask.jws.json
######################################################################### 100.0%
==> go: stable 1.21.0 (bottled), HEAD
Open source programming language to build simple/reliable/efficient software
https://go.dev/
Not installed
From: https://github.com/Homebrew/homebrew-core/blob/HEAD/Formula/go.rb
License: BSD-3-Clause
==> Options
--HEAD
	Install HEAD version
javaedge@JavaEdgedeMac-mini src %
```

## 2 安装

安装包地址：

- https://golang.org/dl/
- https://golang.google.cn/dl/
- https://studygolang.com/dl

```bash
brew install go
```

此处我下载的是最新版本1.15
brew安装go是在目录

```bash
/usr/local/Cellar
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/05/47e0c6e53025028efaf74d2d96caa659.png)

## 3 配置GOROOT、GOPATH、PATH

编辑文件

```bash
export GOROOT="/usr/local/Cellar/go/1.15.3/libexec"
export GOPATH="/Users/apple/doc/GoProjects"
export PATH="/Users/apple/doc/GoProjects/bin:$PATH"
export GO111MODULE=on
export GOPROXY=https://mirrors.aliyun.com/goproxy/
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/05/a35f582cb62d9eaec00053c650a4f194.png)

### GOROOT

go 安装目录：

- brew安装，进入go目录之后可看到bin目录在libexec下
- 源码安装，可按习惯直接复制到/usr/local/go，此时GOROOT 为/usr/local/go

### GOPATH

go的工作目录，即写代码位置。也可配置`$HOME`来配置。

安装上述编辑好.bash_profile文件好保存退出，执行命令