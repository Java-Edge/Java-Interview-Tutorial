管道符“|”将两个命令隔开，左边命令的输出作为右边命令的输入。连续使用管道意味着第一个命令的输出会作为 第二个命令的输入，第二个命令的输出又会作为第三个命令的输入，依此类推

# 1 文件管理
## 1.1 which
 用于查找文件
会在环境变量$PATH设置的目录里查找符合条件的文件

### 语法
```
which [文件...]
```

### 参数
```
-n<文件名长度> 　指定文件名长度，指定的长度必须大于或等于所有文件中最长的文件名。
-p<文件名长度> 　与-n参数相同，但此处的<文件名长度>包括了文件的路径。
-w 　指定输出时栏位的宽度。
-V 　显示版本信息。
```
### 实例
使用指令"which"查看指令"bash"的绝对路径
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797707_4685968-f799e89b19bd48b3.png)
上面的指令执行后，输出信息如下所示：
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797739_4685968-1f7df7394763eac3.png)

## 1.2 cp
复制文件或目录

### 语法
`cp [options] source dest`
`cp [options] source... directory`

### 参数：
```
-a：此选项通常在复制目录时使用，它保留链接、文件属性，并复制目录下的所有内容。其作用等于dpR参数组合。
-d：复制时保留链接。这里所说的链接相当于Windows系统中的快捷方式。
-f：覆盖已经存在的目标文件而不给出提示。
-i：与-f选项相反，在覆盖目标文件之前给出提示，要求用户确认是否覆盖，回答"y"时目标文件将被覆盖。
-p：除复制文件的内容外，还把修改时间和访问权限也复制到新文件中。
-r：若给出的源文件是一个目录文件，此时将复制该目录下所有的子目录和文件
-l：不复制文件，只是生成链接文件。
使用指令"cp"将当前目录"test/"下的所有文件复制到新目录"newtest"下
`$ cp –r test/ newtest     `
```

## 1.3 chmod 
文件调用权限三级 : 文件拥有者、群组、其他
利用 chmod 控制文件如何被他人所调用。
- r 表示可读取
- w 表示可写入
- x 表示可执行
- X 表示只有当该文件是个子目录或者该文件已经被设定过为可执行。

chmod也可以用数字来表示权限如 :
chmod abc file
其中a,b,c各为一个数字，分别表示User、Group、及Other的权限。

r=4，w=2，x=1
若要rwx属性则4+2+1=7；
若要rw-属性则4+2=6；
若要r-x属性则4+1=5。
将文件 file1.txt 设为所有人皆可读取 :
```
chmod ugo+r file1.txt
将文件 file1.txt 设为所有人皆可读取 

chmod a+r file1.txt
将文件 file1.txt 与 file2.txt 设为该文件拥有者，与其所属同一个群体者可写入，但其他以外的人则不可写入 :

chmod ug+w,o-w file1.txt file2.txt

将 ex1.py 设定为只有该文件拥有者可以执行 
chmod u+x ex1.py

将目前目录下的所有文件与子目录皆设为任何人可读取 
chmod -R a+r *
此外chmod也可以用数字来表示权限如 :

chmod 777 file
语法为：

chmod abc file
其中a,b,c各为一个数字，分别表示User、Group、及Other的权限。

r=4，w=2，x=1
若要rwx属性则4+2+1=7；
若要rw-属性则4+2=6；
若要r-x属性则4+1=5。
chmod a=rwx file
和

chmod 777 file
效果相同

chmod ug=rwx,o=x file
和

chmod 771 file
```

## 1.4 cat
功能:连接文件并打印到标准输出设备
`cat [-AbeEnstTuv] [--help] [--version] fileName`
-n 或 --number：由 1 开始对所有输出的行数编号
-b 或 --number-nonblank：和 -n 相似，只不过对于空白行不编号

实例：
把 textfile1 的文档内容加上行号后输入 textfile2 这个文档里：
`cat -n textfile1 > textfile2`

把 textfile1 和 textfile2 的文档内容加上行号（空白行不加）之后将内容附加到 textfile3 文档里：
`cat -b textfile1 textfile2 >> textfile3`

清空 /etc/test.txt 文档内容：
`cat /dev/null > /etc/test.txt`

cat 也可以用来制作镜像文件。例如要制作软盘的镜像文件，将软盘放好后输入：
`cat /dev/fd0 > OUTFILE`

相反的，如果想把 image file 写到软盘，输入：
`cat IMG_FILE > /dev/fd0`

## 1.5 more
类似 `cat` ，不过会以一页一页的形式显示，更方便使用者逐页阅读，而最基本的指令就是按空白键（space）就往下一页显示，按 b 键就会往回（back）一页显示，而且还有搜寻字串的功能（与 vi 相似），使用中的说明文件，请按 h
`more [-dlfpcsu] [-num] [+/pattern] [+linenum] [fileNames..] `
### 参数
```
-num 一次显示的行数
-d 提示使用者，在画面下方显示 [Press space to continue, 'q' to quit.] ，如果使用者按错键，则会显示 [Press 'h' for instructions.] 而不是 '哔' 声
-l 取消遇见特殊字元 ^L（送纸字元）时会暂停的功能
-f 计算行数时，以实际上的行数，而非自动换行过后的行数（有些单行字数太长的会被扩展为两行或两行以上）
-p 不以卷动的方式显示每一页，而是先清除萤幕后再显示内容
-c 跟 -p 相似，不同的是先显示内容再清除其他旧资料
-s 当遇到有连续两行以上的空白行，就代换为一行的空白行
-u 不显示下引号 （根据环境变数 TERM 指定的 terminal 而有所不同）
+/pattern 在每个文档显示前搜寻该字串（pattern），然后从该字串之后开始显示
+num 从第 num 行开始显示
fileNames 欲显示内容的文档，可为复数个数
```

### 实例
```
逐页显示 testfile 文档内容，如有连续两行以上空白行则以一行空白行显示。
more -s testfile

从第 20 行开始显示 testfile 之文档内容。
more +20 testfile
```

## 1.6 tac
从最后一行开始显示内容，并将所有内容输出 

## 1.7 head
只显示前几行 

## 1.8 tail
查看文件的内容，有一个常用的参数 -f 常用于查阅正在改变的日志文件
`tail -10 someFile`
查看文件后 10 行内容
`head -10 someFile`
查看文件前 10 行内容
`tail -f someFile`
用于调试,实时查看文件内容,会把 filename 文件里的最尾部的内容显示在屏幕上，并且不断刷新，只要 filename 更新就可以看到最新的文件内容
`tail [参数] [文件]  `
```
-f 循环读取
-q 不显示处理信息
-v 显示详细的处理信息
-c<数目> 显示的字节数
-n<行数> 显示行数
--pid=PID 与-f合用,表示在进程ID,PID死掉之后结束.
-q, --quiet, --silent 从不输出给出文件名的首部
-s, --sleep-interval=S 与-f合用,表示在每次反复的间隔休眠S秒
```
###实例
```
要显示 notes.log 文件最后 10 行
tail notes.log

要跟踪名为 notes.log 的文件增长情况
tail -f notes.log
此命令显示 notes.log 文件最后 10 行
当将某些行添加至 notes.log 文件时，tail 命令会继续显示这些行
显示一直继续，直到您按下（Ctrl-C）组合键停止显示。

显示文件 notes.log 的内容，从第 20 行至文件末尾:
tail +20 notes.log

显示文件 notes.log 的最后 10 个字符:
tail -c 10 notes.log
```
## 1.9 nl
和 cat 一样，只是 nl 要显示行号 

## 1.10 make 
编译
-j :指定作业数。


## 1.11 man rm （ rm --help ）
查看帮助

## 1.12 scp
用于Linux之间复制文件和目录

scp是secure copy的简写，是linux系统下基于ssh登陆进行安全的远程文件拷贝命令,和它类似的命令有cp，不过cp只是在本机进行拷贝不能跨服务器，而且scp传输是加密的

- 我们需要获得远程服务器上的某个文件，远程服务器没有配置ftp服务器，没有开启web服务器，也没有做共享，无法通过常规途径获得文件时，只需要通过scp命令便可轻松的达到目的
- 我们需要将本机上的文件上传到远程服务器上，远程服务器没有开启ftp服务器或共享，无法通过常规途径上传是，只需要通过scp命令便可以轻松的达到目的
 
### 语法
```
scp [-1246BCpqrv] [-c cipher] [-F ssh_config] [-i identity_file]
[-l limit] [-o ssh_option] [-P port] [-S program]
[[user@]host1:]file1 [...] [[user@]host2:]file2
```
简易写法:
```
scp [可选参数] file_source file_target 
```

### 参数说明：
```
-1： 强制scp命令使用协议ssh1
-2： 强制scp命令使用协议ssh2
-4： 强制scp命令只使用IPv4寻址
-6： 强制scp命令只使用IPv6寻址
-B： 使用批处理模式（传输过程中不询问传输口令或短语）
-C： 允许压缩。（将-C标志传递给ssh，从而打开压缩功能）
-p：保留原文件的修改时间，访问时间和访问权限。
-q： 不显示传输进度条。
-r： 递归复制整个目录。
-v：详细方式显示输出。scp和ssh(1)会显示出整个过程的调试信息。这些信息用于调试连接，验证和配置问题。
-c cipher： 以cipher将数据传输进行加密，这个选项将直接传递给ssh。
-F ssh_config： 指定一个替代的ssh配置文件，此参数直接传递给ssh。
-i identity_file： 从指定文件中读取传输时使用的密钥文件，此参数直接传递给ssh。
-l limit： 限定用户所能使用的带宽，以Kbit/s为单位。
-o ssh_option： 如果习惯于使用ssh_config(5)中的参数传递方式，
-P port：注意是大写的P, port是指定数据传输用到的端口号
-S program： 指定加密传输时所使用的程序。此程序必须能够理解ssh(1)的选项。
```

### 实例
#### 1、从本地复制到远程
命令格式：
```
1. scp local_file remote_username@remote_ip:remote_folder 
或者 
2. scp local_file remote_username@remote_ip:remote_file 
或者 
3. scp local_file remote_ip:remote_folder 
或者 
4. scp local_file remote_ip:remote_file 
```
第1,2个指定了用户名，命令执行后需要再输入密码
![](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361337586_16782311-ec0ae36f2fb687ec.png)

第1个仅指定了远程的目录，文件名字不变
第2个指定了文件名
第3,4个没有指定用户名，命令执行后需要输入用户名和密码，第3个仅指定了远程的目录，文件名字不变，第4个指定了文件名；
应用实例：
```
scp /home/space/music/1.mp3 root@www.runoob.com:/home/root/others/music 
scp /home/space/music/1.mp3 root@www.runoob.com:/home/root/others/music/001.mp3 
scp /home/space/music/1.mp3 www.runoob.com:/home/root/others/music 
scp /home/space/music/1.mp3 www.runoob.com:/home/root/others/music/001.mp3 
```
复制目录命令格式：
```
scp -r local_folder remote_username@remote_ip:remote_folder 
或者 
scp -r local_folder remote_ip:remote_folder 
```
第1个指定了用户名，命令执行后需要再输入密码
第2个没有指定用户名，命令执行后需要输入用户名和密码

应用实例：
```
scp -r /home/space/music/ root@www.runoob.com:/home/root/others/ 
scp -r /home/space/music/ www.runoob.com:/home/root/others/ 
```
上面命令将本地 music 目录复制到远程 others 目录下。

#### 2、从远程复制到本地
从远程复制到本地，只要将从本地复制到远程的命令的后2个参数调换顺序即可，如下实例

应用实例：
```
scp root@www.runoob.com:/home/root/others/music /home/space/music/1.mp3 
scp -r www.runoob.com:/home/root/others/ /home/space/music/
```
说明
1.如果远程服务器防火墙有为scp命令设置了指定的端口，我们需要使用 -P 参数来设置命令的端口号，命令格式如下：

> scp 命令使用端口号 4588
scp -P 4588 remote@www.runoob.com:/usr/local/sin.sh /home/administrator

2.使用scp命令要确保使用的用户具有可读取远程服务器相应文件的权限，否则scp命令是无法起作用的。

# 1.13 awk
一种处理文本文件的语言，是一个强大的文本分析工具.

之所以叫AWK是因为其取了三位创始人 Alfred Aho，Peter Weinberger, 和 Brian Kernighan 的 Family Name 的首字符。

## 语法
```
awk [选项参数] 'script' var=value file(s)
或
awk [选项参数] -f scriptfile var=value file(s)
```

## 选项参数说明：
```
-F fs or --field-separator fs
指定输入文件折分隔符，fs是一个字符串或者是一个正则表达式，如-F:。
-v var=value or --asign var=value
赋值一个用户定义变量。
-f scripfile or --file scriptfile
从脚本文件中读取awk命令。
-mf nnn and -mr nnn
对nnn值设置内在限制，-mf选项限制分配给nnn的最大块数目；-mr选项限制记录的最大数目。这两个功能是Bell实验室版awk的扩展功能，在标准awk中不适用。
-W compact or --compat, -W traditional or --traditional
在兼容模式下运行awk。所以gawk的行为和标准的awk完全一样，所有的awk扩展都被忽略。
-W copyleft or --copyleft, -W copyright or --copyright
打印简短的版权信息。
-W help or --help, -W usage or --usage
打印全部awk选项和每个选项的简短说明。
-W lint or --lint
打印不能向传统unix平台移植的结构的警告。
-W lint-old or --lint-old
打印关于不能向传统unix平台移植的结构的警告。
-W posix
打开兼容模式。但有以下限制，不识别：/x、函数关键字、func、换码序列以及当fs是一个空格时，将新行作为一个域分隔符；操作符**和**=不能代替^和^=；fflush无效。
-W re-interval or --re-inerval
允许间隔正则表达式的使用，参考(grep中的Posix字符类)，如括号表达式[[:alpha:]]。
-W source program-text or --source program-text
使用program-text作为源代码，可与-f命令混用。
-W version or --version
```

### 基本用法
- `log.txt`文本内容如下：

![](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361337662_16782311-7c4d9149600e38b9.png)


- 用法一
```
awk '{[pattern] action}' {filenames}   # 行匹配语句 awk '' 只能用单引号
```
#### 实例
- 每行按空格或TAB分割，输出文本中的1、4项
![](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361338000_16782311-7c8a68e0fc3290c7.png)

- 格式化输出
![](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361337739_16782311-ff6e06e5ae37d13b.png)

- 用法二：
```
awk -F  #-F相当于内置变量FS, 指定分割字符
```
#### 实例
- 使用","分割
![](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361337762_16782311-3bbacf96a97a1884.png)

- 或者使用内建变量
![](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361337654_16782311-47fbe52b5f9d0087.png)

- 使用多个分隔符.先使用空格分割，然后对分割结果再使用","分割
![](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361337693_16782311-470c7668e8af839f.png)

- 用法三
```
awk -v  # 设置变量
```
#### 实例
![](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361337864_16782311-01ac3c6820d428fd.png)
![](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361337679_16782311-caaaf8a11434a562.png)

- 用法四
```
awk -f {awk脚本} {文件名}
```
#### 实例
```
awk -f cal.awk log.txt
```

## 1.14 tree
Linux tree命令用于以树状图列出目录的内容。
执行tree指令，它会列出指定目录下的所有文件，包括子目录里的文件。
### 语法
 ```
tree [-aACdDfFgilnNpqstux][-I <范本样式>][-P <范本样式>][目录...]
```
```
参数说明：

-a 显示所有文件和目录。
-A 使用ASNI绘图字符显示树状图而非以ASCII字符组合。
-C 在文件和目录清单加上色彩，便于区分各种类型。
-d 显示目录名称而非内容。
-D 列出文件或目录的更改时间。
-f 在每个文件或目录之前，显示完整的相对路径名称。
-F 在执行文件，目录，Socket，符号连接，管道名称名称，各自加上"*","/","=","@","|"号。
-g 列出文件或目录的所属群组名称，没有对应的名称时，则显示群组识别码。
-i 不以阶梯状列出文件或目录名称。
-I<范本样式> 不显示符合范本样式的文件或目录名称。
-l 如遇到性质为符号连接的目录，直接列出该连接所指向的原始目录。
-n 不在文件和目录清单加上色彩。
-N 直接列出文件和目录名称，包括控制字符。
-p 列出权限标示。
-P<范本样式> 只显示符合范本样式的文件或目录名称。
-q 用"?"号取代控制字符，列出文件和目录名称。
-s 列出文件或目录大小。
-t 用文件和目录的更改时间排序。
-u 列出文件或目录的拥有者名称，没有对应的名称时，则显示用户识别码。
-x 将范围局限在现行的文件系统中，若指定目录下的某些子目录，其存放于另一个文件系统上，则将该子目录予以排除在寻找范围外。
```
### 实例
以树状图列出当前目录结构。可直接使用如下命令：
```
tree
```
![](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361338300_16782311-e6c9bacd21e17203.png)

# 2 磁盘管理
## 2.1 pwd
显示工作目录
执行pwd指令可立刻得知您目前所在的工作目录的绝对路径名称。

## 2.2 cd
切换当前工作目录至 dirName
若目录名称省略，则变换 home 目录

## 2.3 mkdir
建立名称为 dirName 子目录
*   -p 确保目录名称存在，不存在的就建一个

## 2.4 ls
显示指定工作目录下之内容（列出目前工作目录所含之文件及子目录)。
` ls [-alrtAFR] [name...]`
```
-a 显示所有文件及目录 (ls内定将文件名或目录名称开头为"."的视为隐藏档，不会列出)
-h 用"K","M","G"来显示文件和目录的大小。
-l 除文件名称外，亦将文件型态、权限、拥有者、文件大小等资讯详细列出 = ll
-r 将文件以相反次序显示(原定依英文字母次序)
-t 将文件依建立时间之先后次序列出
-A 同 -a ，但不列出 "." (目前目录) 及 ".." (父目录)
-F 在列出的文件名称后加一符号；例如可执行档则加 "*", 目录则加 "/"
-R 若目录下有文件，则以下之文件亦皆依序列出
```
列出根目录(\)下的所有目录：
```
# ls /
bin               dev   lib         media  net   root     srv  upload  www
boot              etc   lib64       misc   opt   sbin     sys  usr
home  lost+found  mnt    proc  selinux  tmp  var
```
列出目前工作目录下所有名称是 s 开头的文件，越新的排越后面 :
`ls -ltr s*`
将 /bin 目录以下所有目录及文件详细资料列出 :
`ls -lR /bin`
列出目前工作目录下所有文件及目录；目录于名称后加 "/", 可执行档于名称后加 "*" :
`ls -AF`


find / -name libNativeMethod.so
等同 ll |grep someFile

## 2.5 df
Linux df命令用于显示目前在Linux系统上的文件系统的磁盘使用情况统计。

### 语法
```
df [选项]... [FILE]...

文件-a, --all 包含所有的具有 0 Blocks 的文件系统
文件--block-size={SIZE} 使用 {SIZE} 大小的 Blocks
文件-h, --human-readable 使用人类可读的格式(预设值是不加这个选项的...)
文件-H, --si 很像 -h, 但是用 1000 为单位而不是用 1024
文件-i, --inodes 列出 inode 资讯，不列出已使用 block
文件-k, --kilobytes 就像是 --block-size=1024
文件-l, --local 限制列出的文件结构
文件-m, --megabytes 就像 --block-size=1048576
文件--no-sync 取得资讯前不 sync (预设值)
文件-P, --portability 使用 POSIX 输出格式
文件--sync 在取得资讯前 sync
文件-t, --type=TYPE 限制列出文件系统的 TYPE
文件-T, --print-type 显示文件系统的形式
文件-x, --exclude-type=TYPE 限制列出文件系统不要显示 TYPE
文件-v (忽略)
文件--help 显示这个帮手并且离开
文件--version 输出版本资讯并且离开
```

### 实例
- 显示文件系统的磁盘使用情况统计：
![](https://uploadfiles.nowcoder.com/images/20190916/5088755_1568601910877_95BD0D1D78F772066257C351235F9735 "图片标题") 
第一列指定文件系统的名称
第二列指定一个特定的文件系统1K-块 1K是1024字节为单位的总内存。用和可用列正在使用中，分别指定的内存量。
使用列指定使用的内存的百分比，而最后一栏"安装在"指定的文件系统的挂载点。

- 用一个-i选项的df命令的输出显示inode信息而非块使用量。
![](https://uploadfiles.nowcoder.com/images/20190916/5088755_1568602617440_5A15A6A7AD23F48A48E27F854AC42AE7 "图片标题") 

- 显示所有的信息:
![](https://uploadfiles.nowcoder.com/images/20190916/5088755_1568602688912_C26AAE3739D0CC390F54DAB23F9C5BA3 "图片标题") 

- 我们看到输出的末尾，包含一个额外的行，显示总的每一列。
-h选项，通过它可以产生可读的格式df命令的输出：
![](https://uploadfiles.nowcoder.com/images/20190916/5088755_1568602782036_F5C01B86C9B2C16F93A1E7BB5AAF91D9 "图片标题") 


## 2.6 mount
用于挂载Linux系统外的文件。

### 语法
```
mount [-hV]
mount -a [-fFnrsvw] [-t vfstype]
mount [-fnrsvw] [-o options [,...]] device | dir
mount [-fnrsvw] [-t vfstype] [-o options] device dir
```

### 参数
```
-V：显示程序版本
-h：显示辅助讯息
-v：显示较讯息，通常和 -f 用来除错。
-a：将 /etc/fstab 中定义的所有档案系统挂上。
-F：这个命令通常和 -a 一起使用，它会为每一个 mount 的动作产生一个行程负责执行。在系统需要挂上大量 NFS 档案系统时可以加快挂上的动作。
-f：通常用在除错的用途。它会使 mount 并不执行实际挂上的动作，而是模拟整个挂上的过程。通常会和 -v 一起使用。
-n：一般而言，mount 在挂上后会在 /etc/mtab 中写入一笔资料。但在系统中没有可写入档案系统存在的情况下可以用这个选项取消这个动作。
-s-r：等于 -o ro
-w：等于 -o rw
-L：将含有特定标签的硬盘分割挂上。
-U：将档案分割序号为 的档案系统挂下。-L 和 -U 必须在/proc/partition 这种档案存在时才有意义。
-t：指定档案系统的型态，通常不必指定。mount 会自动选择正确的型态。
-o async：打开非同步模式，所有的档案读写动作都会用非同步模式执行。
-o sync：在同步模式下执行。
-o atime、-o noatime：当 atime 打开时，系统会在每次读取档案时更新档案的『上一次调用时间』。当我们使用 flash 档案系统时可能会选项把这个选项关闭以减少写入的次数。
-o auto、-o noauto：打开/关闭自动挂上模式。
-o defaults:使用预设的选项 rw, suid, dev, exec, auto, nouser, and async.
-o dev、-o nodev-o exec、-o noexec允许执行档被执行。
-o suid、-o nosuid：
允许执行档在 root 权限下执行。
-o user、-o nouser：使用者可以执行 mount/umount 的动作。
-o remount：将一个已经挂下的档案系统重新用不同的方式挂上。例如原先是唯读的系统，现在用可读写的模式重新挂上。
-o ro：用唯读模式挂上。
-o rw：用可读写模式挂上。
-o loop=：使用 loop 模式用来将一个档案当成硬盘分割挂上系统。
```

### 实例
将 /dev/hda1 挂在 /mnt 之下。
```
#mount /dev/hda1 /mnt
```
将 /dev/hda1 用唯读模式挂在 /mnt 之下。
```
#mount -o ro /dev/hda1 /mnt
```
将 /tmp/image.iso 这个光碟的 image 档使用 loop 模式挂在 /mnt/cdrom之下。用这种方法可以将一般网络上可以找到的 Linux 光 碟 ISO 档在不烧录成光碟的情况下检视其内容。
```
#mount -o loop /tmp/image.iso /mnt/cdrom
```
# 3 文档编辑

## 3.1 grep

查找内容包含指定的范本样式的文件，如果发现某文件的内容符合所指定的范本样式
预设grep指令会把含有范本样式的那一列显示出来。  
若不指定任何文件名称，或是所给予的文件名为"-"，则grep指令会从标准输入设备读取数据。
-r或--recursive 此参数的效果和指定"-d recurse"参数相同。
-v或--revert-match 反转

反向查找。前面各个例子是查找并打印出符合条件的行，通过"-v"参数可以打印出不符合条件行的内容。
查找文件名中包含 test 的文件中不包含test 的行，此时，使用的命令为：
`grep -v test *test*`

### 实例

1、在当前目录中，查找后缀有 file 字样的文件中包含 test 字符串的文件，并打印出该字符串的行。此时，可以使用如下命令：
```
$ grep test test* #查找前缀有“test”的文件包含“test”字符串的文件  
testfile1:This a Linux testfile! #列出testfile1 文件中包含test字符的行  
testfile_2:This is a linux testfile! #列出testfile_2 文件中包含test字符的行  
testfile_2:Linux test #列出testfile_2 文件中包含test字符的行 
```

2、以递归的方式查找符合条件的文件

例如，查找指定目录/etc/acpi 及其子目录（如果存在子目录的话）下所有文件中包含字符串"update"的文件，并打印出该字符串所在行的内容，使用的命令为：
```shell
$ grep -r update /etc/acpi #以递归的方式查找“etc/acpi”  
#下包含“update”的文件  
/etc/acpi/ac.d/85-anacron.sh:# (Things like the slocate updatedb cause a lot of IO.)  
Rather than  
/etc/acpi/resume.d/85-anacron.sh:# (Things like the slocate updatedb cause a lot of  
IO.) Rather than  
/etc/acpi/events/thinkpad-cmos:action=/usr/sbin/thinkpad-keys--update 
```

3、反向查找。前面各个例子是查找并打印出符合条件的行，通过"-v"参数可以打印出不符合条件行的内容。

查找文件名中包含 test 的文件中不包含test 的行，此时，使用的命令为：
```
$ grep-v test* #查找文件名中包含test 的文件中不包含test 的行  
testfile1:helLinux!  
testfile1:Linis a free Unix-type operating system.  
testfile1:Lin  
testfile_1:HELLO LINUX!  
testfile_1:LINUX IS A FREE UNIX-TYPE OPTERATING SYSTEM.  
testfile_1:THIS IS A LINUX TESTFILE!  
testfile_2:HELLO LINUX!  
testfile_2:Linux is a free unix-type opterating system.  
```
## 3.2 ag
这里隆重介绍该命令比grep快千百万倍!闪电级别迅速搜索!

类似ack， grep的工具, 它来在文件中搜索相应关键字。
- 它比ack还要快 （和grep不在一个数量级上）
- 它会忽略.gitignore和.hgignore中的匹配文件
- 如果有你想忽略的文件，你需要将(congh .min.js cough*)加入到.ignore文件中
- 它的命令名称更短:-)

在ubuntu下,我们可以通过`sudo apt-get install silversearcher-ag`
安装

### 使用
关于文本搜索，最常见的用法是：
```shell
ag "string-to-search"
```
ag 会遍历当前目录下的文本文件，在每个文件的每一行中查找 "string-to-search" 这种模式，把文件名、行号和匹配的内容高亮显示出来。由于模式可以是一个正则表达式，使得搜索功能极为强大。

如果想在某个指定的目录下搜索，或只搜索某个文件的内容，在搜索的字符串后面加上路径就行：
```
ag "string-to-search" /path/to/directory
```

除此以外，ag -G 提供了强大的过滤功能，使搜索在特定的文件中进行。下面的例子只搜索 java 类型的文件：
```
ag -G ".+\.java" "string-to-search" /path/to/directory
```
ag 根据输入智能判定大小写的匹配方式。如果查询的字符串只含有小写字符，使用大小写不敏感的匹配方式；如果出现了大写字符，就改为大小写敏感的匹配方式。如果想要直接使用不敏感的匹配方式，请用 ag -i 选项。
另一个很有用的选项是 ag -w 的全词匹配，它要求匹配的字符串前后都需要有合适的分隔符。

如果想要搜索不满足特定模式的行，用 ag -v 对搜索结果取反。

最后，如果只关心有哪些文件匹配（而不在意文件的内容），可以用 ag -l 显示有匹配的文件名，类似的 ag -L 显示没有任何匹配的文件名。

# 4 系统管理

## 4.1 groupadd
创建一个新的工作组，新工作组的信息将被添加到系统文件中
- 语法
groupadd(选项)(参数)
```
g：指定新建工作组的[id](http://man.linuxde.net/id "id命令")；
-r：创建系统工作组，系统工作组的组ID小于500；
-K：覆盖配置文件“/ect/[login](http://man.linuxde.net/login "login命令").defs”；
-o：允许添加组ID号不唯一的工作组。</pre>
```
- 参数
组名：指定新建工作组的组名
- 实例
建立一个新组，并设置组ID加入系统
```
groupadd -g 344 linuxde
```
此时在/etc/passwd文件中产生一个组ID（GID）是344的项目

## 4.2 ps 
显示当前进程 (process) 的状态
-  -A 显示进程信息
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797789_4685968-512aff1e593d1599.png)
-  -u user  显示指定用户信息
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797781_4685968-7c7a71f3b9dfb4b3.png)
- -ef  显示所有命令，连带命令行
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797799_4685968-e3ae42585f4e4276.png)
- pstree |grep java
查看进程树
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797755_4685968-bd8146a54c354da0.png)

## 4.3 ifconfig
IP 地址配置，可以使用 setup 命令启动字符界面来配置

## 4.4 uname
用于显示系统信息

uname可显示电脑以及操作系统的相关信息。

- 语法
```
uname [-amnrsv][--help][--version]
```

- 参数说明：
```
-a或--all 　显示全部的信息。
-m或--machine 　显示电脑类型。
-n或-nodename 　显示在网络上的主机名称。
-r或--release 　显示操作系统的发行编号。
-s或--sysname 　显示操作系统名称。
-v 　显示操作系统的版本。
--help 　显示帮助。
--version 　显示版本信息。
```

### 实例
- 显示系统信息
![uname -a](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797876_4685968-08845792c0c83cdf.png)

- 显示计算机类型
![uname -m](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797869_4685968-9d7b208bab923bad.png)

- 显示计算机名
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797826_4685968-b852a808b54bc7f4.png)

- 显示操作系统发行编号
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797880_4685968-cb2a31c803610718.png)

- 显示操作系统名称
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797934_4685968-480838647bcb1d54.png)

- 显示系统时间
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797965_4685968-a9b950b9e56c507d.png)




## rpm -aq|grep php
查看安装介质




# grep someText *
在当前目录所有文本中查找



#env
环境配置，相当 window 下 set

env |grep PATH
查看环境变量

# export
相当于 set classpath

# echo
输出变量名



# Linux 查看端口占用情况可以使用 lsof 和 netstat 命令
## lsof
lsof(list open files)是一个列出当前系统打开文件的工具.

### 语法
lsof 查看端口占用语法格式：
```
lsof -i:端口号
```

### 实例
查看服务器 8000 端口的占用情况：

##netstat -npl
查看端口

# mv
用来为文件或目录改名、或将文件或目录移入其它位置。
## 语法
`mv [options] source dest`
`mv [options] source... directory`
参数说明：
- -i: 若指定目录已有同名文件，则先询问是否覆盖旧文件;
- -f: 在mv操作要覆盖某已有的目标文件时不给任何指示;
## mv参数设置与运行结果
mv 文件名 文件名	:将源文件名改为目标文件名
mv 文件名 目录名	:将文件移动到目标目录
mv 目录名 目录名	:目标目录已存在，将源目录移动到目标目录；目标目录不存在则改名
mv 目录名 文件名	:出错
## 实例
将文件 aaa 更名为 bbb :
`mv aaa bbb`
将info目录放入logs目录中。注意，如果logs目录不存在，则该命令将info改名为logs。
`mv info/ logs `
再如将/usr/student下的所有文件和目录移到当前目录下，命令行为：
`$ mv /usr/student/*  . `

#rm -r
递归删除， -f 表示 force

>somefile
清空文件内容

which java
查看 java 进程对应的目录

#who
显示当前用户

#users
显示当前会话

# zip -r filename.zip filesdir
某个文件夹打 zip 包

# unzip somefile.zip
解压 zip 文档到当前目录

gunzip somefile.cpio.gz
解压 .gz

cpio -idmv < somefile.cpio
CPIO 操作

ps auxwww|sort -n -r -k 5|head -5
按资源占用情况来排序，第一个 5 表示第几列，第二个 5 表示前几位

hostname -i
显示本机机器名，添加 i ，显示 etc/hosts 对应 ip 地址

## rpm 
rpm -ivh some.rpm
安装软件

rpm -Uvh some.rpm
更新软件

rpm -qa |grep somesoftName
是否已安装某软件


# 5 备份压缩
## tar 
备份文件 
是用来建立，还原备份文件的工具程序，它可以加入，解开备份文件内的文件。
##参数：
-f<备份文件>或--file=<备份文件> 指定备份文件。
-v或--verbose 显示指令执行过程。
-x或--extract或--get 从备份文件中还原文件。
-z或--gzip或--ungzip 通过gzip指令处理备份文件。
###实例
压缩文件 非打包
```java
# touch a.c       
# tar -czvf test.tar.gz a.c   //压缩 a.c文件为test.tar.gz
a.c
```
列出压缩文件内容
```java
# tar -tzvf test.tar.gz 
-rw-r--r-- root/root     0 2010-05-24 16:51:59 a.c
```
解压文件
tar -xzvf test.tar.gz a.c
打包
tar –cvzf somefile.tar.gz fileDir


# shutdown -i6 -y 0
立即重启服务器

# reboot
立即重启服务器，相当于 shutdow –r now

# halt

立即关机， shutdown -h

shutdonw -r 23:30

shutdown -r +15

shutdonw -r +30

定时重启

gdmsetup

启动系统配置管理界面，需要在图形界面执行

setup

启动文字配置管理界面

vi /etc/sysconfig/network

修改机器名 , 然后要重启机器或者 service network restart

# locale
显示系统语言

export LANG=zh_CN.GBK

设定系统语言，解决 consol 中文乱码

ln -s src_full_file the_link_name

创建软链接

last

倒序查看已登陆用户历史

history

查看历史命令



date -s 10/09/2009

修改日期

date -s 13:24:00

修改时间，直接 date 显示时间

df -k

查看文件磁盘空间

df -v

查看文件空间

du

查看磁盘空间使用情况

# free

查看内存使用情况

# 6 系统管理
## 6.1 top

实时显示 process 的动态

```shell
d : 改变显示的更新速度，或是在交谈式指令列( interactive command)按 s
q : 没有任何延迟的显示速度，如果使用者是有 superuser 的权限，则 top 将会以最高的优先序执行
c : 切换显示模式，共有两种模式，一是只显示执行档的名称，另一种是显示完整的路径与名称S : 累积模式，会将己完成或消失的子行程 ( dead child process ) 的 CPU time 累积起来
s : 安全模式，将交谈式指令取消, 避免潜在的危机
i : 不显示任何闲置 (idle) 或无用 (zombie) 的行程
n : 更新的次数，完成后将会退出 top
b : 批次档模式，搭配 "n" 参数一起使用，可以用来将 top 的结果输出到档案内
```

top -c
以批处理模式显示程序信息

top -b
以累积模式显示程序信息

top -S
设置信息更新次数

top -n 2

//表示更新两次后终止更新显示
设置信息更新时间

top -d 3

//表示更新周期为3秒
显示指定的进程信息

top -p 139

//显示进程号为139的进程信息，CPU、内存占用率等
显示更新十次后退出

top -n 10
使用者将不能利用交谈式指令来对行程下命令

top -s
将更新显示二次的结果输入到名称为 top.log 的档案里

top -n 2 -b < top.log
vmstat 5 10

没 5 秒刷新一次，刷新 10 次； time 、 timex 、 uptime 、 iostat 、 sar

cat /proc/cpuinfo|grep processor|wc – l

获取 cpu 个数

## 6.2 service 
service <service>
打印指定服务<service>的命令行使用帮助。
service <service> start
启动指定的系统服务<service>
service <service> stop
停止指定的系统服务<service>
service <service> restart
重新启动指定的系统服务<service>，即先停止（stop），然后再启动（start）。
chkconfig --list
查看系统服务列表，以及每个服务的运行级别。
chkconfig <service> on
设置指定服务<service>开机时自动启动。
chkconfig <service> off
设置指定服务<service>开机时不自动启动。

ntsysv

以全屏幕文本界面设置服务开机时是否自动启动。
service mysqld start

启动 mysql 服务，其他如

service mysqld stop

停止 mysql 服务

serice mysqld status

显示 mysql 服务状态

service –status-al
查看已有服务

## 6.3 Systemd 
设计目标是，为系统的启动和管理提供一套完整的解决方案。
根据 Linux 惯例，字母d是守护进程（daemon）的缩写。 Systemd 这个名字的含义，就是它要守护整个系统。
Systemd 并不是一个命令，而是一组命令，涉及到系统管理的方方面面。

### 6.3.1 systemctl
是 Systemd 的主命令，用于管理系统。
Systemd 可以管理所有系统资源。不同的资源统称为 Unit（单位）。
Unit 一共分成12种。

Service unit：系统服务
Target unit：多个 Unit 构成的一个组
Device Unit：硬件设备
Mount Unit：文件系统的挂载点
Automount Unit：自动挂载点
Path Unit：文件或路径
Scope Unit：不是由 Systemd 启动的外部进程
Slice Unit：进程组
Snapshot Unit：Systemd 快照，可以切回某个快照
Socket Unit：进程间通信的 socket
Swap Unit：swap 文件
Timer Unit：定时器

systemctl list-units命令可以查看当前系统的所有 Unit 。

netstat -nap | grep port

# 7 系统设置
## 7.1  yum（ Yellow dog Updater, Modified）
是一个在Fedora和RedHat以及SUSE中的Shell前端软件包管理器。

基于RPM包管理，能够从指定的服务器自动下载RPM包并且安装，可以自动处理依赖性关系，并且一次安装所有依赖的软体包，无须繁琐地一次次下载、安装。

yum提供了查找、安装、删除某一个、一组甚至全部软件包的命令，而且命令简洁而又好记。
## 语法
```java
yum [options] [command] [package ...]
```
- options：可选，选项包括
  - -h（帮助）
  - -y当安装过程提示选择全部为"yes"
  - -q（不显示安装的过程）等等。
- command：要进行的操作。
- package操作的对象。

##常用命令 
1.列出所有可更新的软件清单命令：yum check-update
2.更新所有软件命令：yum update
3.仅安装指定的软件命令：yum install <package_name>
4.仅更新指定的软件命令：yum update <package_name>
5.列出所有可安裝的软件清单命令：yum list
6.删除软件包命令：yum remove <package_name>
7.查找软件包 命令：yum search <keyword>
8.清除缓存命令:
yum clean packages: 清除缓存目录下的软件包
yum clean headers: 清除缓存目录下的 headers
yum clean oldheaders: 清除缓存目录下旧的 headers
yum clean, yum clean all (= yum clean packages; yum clean oldheaders) :清除缓存目录下的软件包及旧的headers

## 7.2 rpm (redhat package manager)
用于管理套件.
原本是 Red Hat Linux 发行版专门用来管理 Linux 各项套件的程序，由于它遵循 GPL 规则且功能强大方便，因而广受欢迎。逐渐受到其他发行版的采用.
RPM 套件管理方式的出现，让 Linux 易于安装，升级，间接提升了 Linux 的适用度.

### 参数
```
-a 　查询所有套件。
-b<完成阶段><套件档>+或-t <完成阶段><套件档>+ 　设置包装套件的完成阶段，并指定套件档的文件名称。
-c 　只列出组态配置文件，本参数需配合"-l"参数使用。
-d 　只列出文本文件，本参数需配合"-l"参数使用。
-e<套件档>或--erase<套件档> 　删除指定的套件。
-f<文件>+ 　查询拥有指定文件的套件。
-h或--hash 　套件安装时列出标记。
-i 　显示套件的相关信息。
-i<套件档>或--install<套件档> 　安装指定的套件档。
-l 　显示套件的文件列表。
-p<套件档>+ 　查询指定的RPM套件档。
-q 　使用询问模式，当遇到任何问题时，rpm指令会先询问用户。
-R 　显示套件的关联性信息。
-s 　显示文件状态，本参数需配合"-l"参数使用。
-U<套件档>或--upgrade<套件档> 升级指定的套件档。
-v 　显示指令执行过程。
```

### 实例
- 安装软件
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800798213_4685968-6e768569db02b008.png)

- 显示软件安装信息
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797889_4685968-82311863daa57faa.png)

## 7.3 chkconfig
检查，设置系统的各种服务。
查询操作系统在每一个执行等级中会执行哪些系统服务

```java
chkconfig [--add][--del][--list][系统服务] 或 chkconfig [--level <等级代号>][系统服务][on/off/reset]
```

### 参数：
```java
--add 　增加所指定的系统服务，让chkconfig指令得以管理它，并同时在系统启动的叙述文件内增加相关数据。
--del 　删除所指定的系统服务，不再由chkconfig指令管理，并同时在系统启动的叙述文件内删除相关数据。
--level<等级代号> 　指定读系统服务要在哪一个执行等级中开启或关毕。
```
```java
列出chkconfig所知道的所有命令。
- chkconfig -list 
```
```java
开启服务。
- chkconfig telnet/mysqld on //开启Telnet/mysql服务
- chkconfig -list //列出chkconfig所知道的所有的服务的情况
```
```java
关闭服务
- chkconfig telnet off  //关闭Telnet服务
- chkconfig -list //列出chkconfig所知道的所有的服务的情况
```
## 7.4  Ctrl命令
## Ctrl C
 kill foreground process 
发送 SIGINT 信号给前台进程组中的所有进程，强制终止程序的执行
## Ctrl  Z
  suspend foreground process 
 发送 SIGTSTP 信号给前台进程组中的所有进程，常用于挂起一个进程，而并非结束进程，用户可以使用使用fg/bg操作恢复执行前台或后台的进程。fg命令在前台恢复执行被挂起的进 程，此时可以使用ctrl-z再次挂起该进程，bg命令在后台恢复执行被挂起的进程，而此时将无法使用ctrl-z 再次挂起该进程；一个比较常用的功能：
正在使用vi编辑一个文件时，需要执行shell命令查询一些需要的信息，可以使用ctrl-z挂起vi，等执行                   完shell命令后再使用fg恢复vi继续编辑你的文件（当然，也可以在vi中使用！command方式执行shell命令, 但是没有该方法方便）。

## ctrl-d:
Terminate input, or exit shell 
一个特殊的二进制值，表示 EOF，作用相当于在终端中输入exit后回车
## ctrl-/    
发送 SIGQUIT 信号给前台进程组中的所有进程，终止前台进程并生成 core 文件

## ctrl-s   
中断控制台输出

## ctrl-q   
恢复控制台输出

## ctrl-l    
清屏



其实，控制字符都是可以通过stty命令更改的，可在终端中输入命令"stty -a"查看终端配置
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797671_4685968-e43eb0501196bbea.png)


## 7.5 kill 
kill  PID
杀掉某进程
kill -9 PID
此命令将信号 9（SIGKILL 信号）发送到有效用户拥有的所有进程，即使是那些在其他工作站上启动以及属于其他进程组的进程也是如此。如果一个您请求的列表正被打印，它也被停止。

## 7.6 source
也称为“点命令”，也就是一个点符号（.）
常用于重新执行刚修改的初始化文件，使之立即生效，而不必注销并重新登录。
```shell
source filename 或 . filename
```
source命令除了上述的用途之外，还有一个另外一个用途。在对编译系统核心时常常需要输入一长串的命令，如：
```shell
make mrproper
make menuconfig
make dep
make clean
make bzImage
…………
```
如果把这些命令做成一个文件，让它自动顺序执行，对于需要多次反复编译系统核心的用户来说会很方便，而用source命令就可以做到这一点，它的作用就是把一个文件的内容当成shell来执行，
先在linux的源代码目录下（如/usr/src/linux-2.4.20）建立一个文件，如make_command，在其中输入一下内容：
```shell
make mrproper &&
make menuconfig &&
make dep &&
make clean &&
make bzImage &&
make modules &&
make modules_install &&
cp arch/i386/boot/bzImage /boot/vmlinuz_new &&
cp System.map /boot &&
vi /etc/lilo.conf &&
lilo -v
```
文件建立好之后，每次编译核心的时候，只需要在/usr/src/linux-2.4.20下输入：
`source make_command`
即可，如果你用的不是lilo来引导系统，可以把最后两行去掉，配置自己的引导程序来引导内核。
顺便补充一点，&&命令表示顺序执行由它连接的命令，但是只有它之前的命令成功执行完成了之后才可以继续执行它后面的命令。

## 7.7 sudo
以系统管理者的身份执行指令，即经由 sudo 所执行的指令就好像是 root 亲自执行。

- 使用权限
在 /etc/sudoers 中有出现的使用者

### 语法
```
sudo -V
sudo -h
sudo -l
sudo -v
sudo -k
sudo -s
sudo -H
sudo [ -b ] [ -p prompt ] [ -u username/#uid] -s
sudo command
```

### 参数说明
```
-V 显示版本编号
-h 会显示版本编号及指令的使用方式说明
-l 显示出自己（执行 sudo 的使用者）的权限
-v 因为 sudo 在第一次执行时或是在 N 分钟内没有执行（N 预设为五）会问密码，这个参数是重新做一次确认，如果超过 N 分钟，也会问密码
-k 将会强迫使用者在下一次执行 sudo 时问密码（不论有没有超过 N 分钟）
-b 将要执行的指令放在背景执行
-p prompt 可以更改问密码的提示语，其中 %u 会代换为使用者的帐号名称， %h 会显示主机名称
-u username/#uid 不加此参数，代表要以 root 的身份执行指令，而加了此参数，可以以 username 的身份执行指令（#uid 为该 username 的使用者号码）
-s 执行环境变数中的 SHELL 所指定的 shell ，或是 /etc/passwd 里所指定的 shell
-H 将环境变数中的 HOME （家目录）指定为要变更身份的使用者家目录（如不加 -u 参数就是系统管理者 root ）
command 要以系统管理者身份（或以 -u 更改为其他人）执行的指令
```

### 实例
- 切换为root
![](https://uploadfiles.nowcoder.com/images/20190724/5088755_1563904905075_E14F10977961EBC60E71E5E91BA65926 "图片标题") 


## whereis
只能用于程序名的搜索，而且只搜索二进制文件（参数-b）、man说明文件（参数-m）和源代码文件（参数-s）。如果省略参数，则返回所有信息。

## fuser
查询文件、目录、socket端口和文件系统的使用进程
### 1.查询文件和目录使用者
fuser最基本的用法是查询某个文件或目录被哪个进程使用：
```java
# fuser -v ./ 
                     USER        PID ACCESS COMMAND
./:                  dailidong  17108 ..c.. bash
                     root      25559 ..c.. sudo
                     root      26772 ..c.. bash
```
### 2.查询端口使用者
```java
# fuser -vn tcp 3306

                            USER        PID ACCESS COMMAND
3306/tcp:            mysql      2535 F.... mysqld
```
# 在 vim 命令模式
:noh  取消/ sth 的搜索结果高亮特效
## ip
查看本机的 IP 地址
```
ip addr show  
```
![](https://uploadfiles.nowcoder.com/files/20190317/5088755_1552800797787_4685968-3e2b6e161f3fd27c.png)

# 软件包管理器
apt-get是Debian、Ubuntu、Linux Mint、elementary OS等Linux发行版的默认软件包管理器
apt-get purge packagename 等同于 apt-get remove packagename --purge
## apt-get remove 
只删除软件包，不删除配置文件
## apt-get purge 
删除软件包并删除配置文件

配置文件只包括/etc目录中的软件服务使用的配置信息，不包括home目录中的

# 8 Linux常见问题与解决方案
## 1 Repository list的更新日期久远
- yum判断你上次更新repository list的时间太久远(2周以上)，所以不让使用者操作yum，以避免安装到旧的软件包！
![](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361337809_16782311-0c28f0cbed11c750.png)

## 解决方案
- 清除yum repository缓存
![sudo yum clean all](https://uploadfiles.nowcoder.com/files/20190601/5088755_1559361337928_16782311-ca4bebd6a0ddae16.png)

## 问题：linux下有些工具安装之后，除了要修改root下的.bashfile(也就是添加个环境变量) ，还要修改etc/profile 下的环境变量 ， 两个profile是干什么用的？区别？

解答：
- /etc/profile ：这个文件是每个用户登录时都会运行的环境变量设置，属于系统级别的环境变量，设置在里 面的东西对所有用户适用
- .bashfile 是单用户登录时比如root会运行的,只对当前用户适用，而且只有在你使用的也是bash作为shell时才行. rpm是red hat,fedora,centos这几个发行版使用的安装包,和其它tar.gz的区别是有个文件头,多了一些信息。 rpm包多数是二进制文件,可以直接运行的,但tar.gz包很多是源代码,要编译后才能运行。 二进制文件和windows下的exe文件一个意思,可以直接运行。