# 快速搭建Kubernetes集群

## 1 MacOS

### 1.1 下载 

从 docker 下载 docker-desktop (opens new window)，并完成安装

### 1.2 启用 k8s 集群

启动 docker-desktop，打开preference 面板

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/e14acf26e6eeb52021abd8eaf3b4f7de.png)

切换到 Kubernetes 标签页，并勾选启动 Enable Kubernetes，点击 Apply

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/43c1477686aeeee06c6d5c6548ef73e6.png)



## 2 Linux（CentOS7）

https://kubernetes.io/zh-cn/docs/setup/production-environment/

至少两台机器：

- k8s master
- k8s slave

设置好两个主机的 hostname 后，设置配置文件：

### 2.1 服务器配置最低要求

- 2g内存
- 2CPU
- 30g硬盘
- 内网互通（防火墙务必关闭）

按照上面的要求创建至少2台（一主一从）云服务器。

### 2.2 Linux配置

#### ① 设置不同的hostname



```bash
hostnamectl set-hostname xxx 
```

#### ② 设置host与ip绑定

每个节点都要操作

```bash
vim /etc/hosts

## hosts
172.17.32.8 k8s-master
172.17.32.13 k8s-node
```

#### ③ 关闭ﬁrewalld服务

```bash
systemctl stop firewalld

systemctl disable firewalld
```



#### ④ 时间同步

若使用的云服务器，则忽略此步。

因为本地机器和云服务器时间可能不一致，所以需要同步时间。 

启动chronyd服务

```bash
systemctl start chronyd

systemctl enable chronyddate
```



![](https://p.ipic.vip/098e19.jpg) 

#### ⑤ 关闭 selinux 安全策略

需要重启后生效！

```bash
$ sed -i 's/enforcing/disabled/' /etc/selinux/config

$ vim /etc/selinux/config
# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.
SELINUX=disabled
# SELINUXTYPE= can take one of three two values:
#     targeted - Targeted processes are protected,
#     minimum - Modification of targeted policy. Only selected processes are protected. 
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted
# 临时关闭
$ setenforce 0
```



#### ⑥ 关闭 swap 分区

swap分区即虚拟内存分区，云服务器没有这个概念，可不设置。

作用：物理内存使用完，之后将磁盘空间虚拟成内存来使用。

启用swap设备会对系统的性能产生很负面影响，因此k8s要求每个节点都要禁用swap设备。

```bash
vi /etc/fstab
# /etc/fstab
# Created by anaconda on Thu May 17 07:47:58 2018
#
# Accessible filesystems, by reference, are maintained under '/dev/disk'
# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info
#
UUID=434ab0f6-eed6-49f5-9118-3744d8cbfb7e /                       ext4    defaults        1 1

# 如果有，则注释该⾏
/dev/mapper/centos-swap swap


# 临时关闭
swapoff -a
# 重启
reboot

# 检测  若 total 或者 free 正数，说明你没关闭成功
$ free -m
              total        used        free      shared  buff/cache   available
Mem:          16045        7769         961         927        7315        7014
Swap:             0           0           0
```

#### ⑦ 添加网桥过滤和地址转发功能

转发 IPv4 并让 iptables 看到桥接流量。

```bash
cat > /etc/sysctl.d/kubernetes.conf << EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

# 应⽤ sysctl 参数使其⽣效⽽不重新启动
$ sysctl --system
```

### 基础环境（每台云服务器）

- 安装JDK环境
- 安装Docker，设置开机自启动

### 配置cgroup

```bash
vim /etc/docker/daemon.json

{
  "registry-mirrors": ["https://4t9ixk24.mirror.aliyuncs.com"],
  "exec-opts": ["native.cgroupdriver=systemd"]
}
```

保证 k8s 和 docker 使用同一个systemd。

### 重启刷新

 ```bash
[root@javaedge-monitor-platform-dev ~]# systemctl daemon-reload
[root@javaedge-monitor-platform-dev ~]# systemctl restart docker
# 验证cgroupdriver 是否⽣效，看到systemd就表示OK
[root@javaedge-k8s-node-2 ~]# docker info -f {{.CgroupDriver}}
systemd
[root@javaedge-k8s-node-2 ~]# 
[root@javaedge-k8s-node-1 ~]# docker info | grep -i cgroup
 Cgroup Driver: systemd
 Cgroup Version: 1
[root@javaedge-k8s-node-1 ~]# 
 ```

以上内容全部配置好以后，重启 。所有节点都要执行以上操作！！！