##### 1.使用安装包安装mysql

- 双击打开安装文件

![](https://ask.qcloudimg.com/http-save/1752328/cw9nywaip4.png)

- 双击pkg文件安装
- 一路向下，记得保存最后弹出框中的密码（它是你mysql root账号的密码）
- 正常情况下，安装成功。
- 此时只是安装成功，但还需要额外的配置：

(1) 进入系统偏好设置

![](https://ask.qcloudimg.com/http-save/1752328/a8fba18v0e.png)

(2) 点击mysql

![](https://ask.qcloudimg.com/http-save/1752328/ffxqm8g6bj.png)

(3) 开启mysql服务

![](https://ask.qcloudimg.com/http-save/1752328/ty88tisg8c.png)

- 将mysql加入系统环境变量

```
进入/usr/local/mysql/bin,查看此目录下是否有mysql

执行vim ~/.bash_profile
      在该文件中添加mysql/bin的目录，见pic7：
      PATH=$PATH:/usr/local/mysql/bin
添加完成后，按esc，然后输入wq保存。
最后在命令行输入source ~/.bash_profile
```

![](https://ask.qcloudimg.com/http-save/1752328/psh3ryu5db.png)

![](https://ask.qcloudimg.com/http-save/1752328/pc26xvt2de.png)

通过

`mysql -u root -p`

登录mysql了，会让你输入密码

苹果->系统偏好设置->最下边点mysql 在弹出页面中 关闭mysql服务（点击stop mysql server）

step2：

进入终端输入：cd /usr/local/mysql/bin/

回车后 登录管理员权限 sudo su

回车后输入以下命令来禁止mysql验证功能 ./mysqld\_safe --skip-grant-tables &

回车后mysql会自动重启（偏好设置中mysql的状态会变成running）

step3. 

输入命令 ./mysql

回车后，输入命令 FLUSH PRIVILEGES; 

回车后，输入命令 

- MySQL 5.7.6 and later: ALTER USER 'root'@'localhost' IDENTIFIED BY '你的新密码'; SET PASSWORD FOR 'root'@'localhost' = PASSWORD('newpass');
- MySQL 5.7.5 and earlier: SET PASSWORD FOR 'root'@'localhost' = PASSWORD('你的新密码');
![](https://ask.qcloudimg.com/http-save/1752328/jplrl9wub1.png)
![](https://ask.qcloudimg.com/http-save/1752328/ky8i099tuo.png)
至此，密码修改完成，可以成功登陆。