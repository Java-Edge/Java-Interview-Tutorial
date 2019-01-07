操作模式
- Commmand mode命令模式
等待用户输入命令
eg.撤销,剪切,复制
d:删除当前字符
dd:删除至行末
- Insert Mode输入模式
- Last Line Mode底行模式(也可归类为命令模式)

初始进入文件时为命令模式(底行模式)

键i
vi从命令模式切换到输入模式
键esc
切换到底行模式
键:wq
保存,推出文件

vim + file
打开文件,并且光标在文件的最后一行

vim +n file  定位到文件指定行(若文件过长,十分实用)
打开文件,并且光标在文件第n行
如果行号超过文件最大行,则定位到最后一行

vim +/string file
打开文件后,光标定位到string第一次出现的位置
键n:跳转下一个出现位置
键N:跳转上一个出现位置

vim aa bb cc
一次创建(若文件不存在)或打开多个文件
期间在底行模式键:n
切换到下一个文件(按开始vim文件的顺序)
在最后一个文件后还如此操作,会出现
![](http://upload-images.jianshu.io/upload_images/4685968-1fa20577da5662e4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
键:N或者:prev切回上个文件
# 常用指令
## 底行模式
:w将文件的修改从内存写入硬盘中,即保存修改
:q 推出当前打开的文件
:! 强制执行
:ls 列出当前打开的所有文件
:n/N切换到后/前一个文件
:15快速定位到第15行
/xxx 向后搜索xxx第一次出现位置
?xxx 向前搜索
:set number 显示行号
## 命令模式
![](http://upload-images.jianshu.io/upload_images/4685968-1eea7e247175a61a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/4685968-4bdce6ab5f7adee5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# X 联系我
![](http://upload-images.jianshu.io/upload_images/4685968-6a8b28d2fd95e8b7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "图片标题") 
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)
## [Github](https://github.com/Wasabi1234)





