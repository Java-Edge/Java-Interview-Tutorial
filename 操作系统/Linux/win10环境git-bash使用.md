#添加.gitignore
vi .gitignore
然后按下键盘的“i”键，输入
按下“esc”键，再输入“:wq”保存退出，此时“test”工程根目录多了一个“.gitignore”文件
# 将文件提交到本地git缓存
```
git add .
git commit -m "initial"
```
# 提交远程

```
$ git push --set-upstream origin mmall_v1.0

Counting objects: 28, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (21/21), done.
Writing objects: 100% (28/28), 8.20 KiB | 0 bytes/s, done.
Total 28 (delta 1), reused 0 (delta 0)
remote: Resolving deltas: 100% (1/1), done.
To github.com:njuptmmall/mmall-fe.git
 * [new branch]      mmall_v1.0 -> mmall_v1.0
Branch mmall_v1.0 set up to track remote branch mmall_v1.0 from origin.

```
# 多人协作中

```
$ git merge origin master

```
# 打标签

```
$ git tag tag-dev-initial

```
# 标签提交

```
$ git push origin tag-dev-initial

```


git init

git commit -am "注释"

git checkout branch

```
Shusheng Shi@PC-of-sss MINGW64 ~/mmall/doc/mmall-fe (master)
$ git checkout -b mmall_v1.0
Switched to a new branch 'mmall_v1.0'

Shusheng Shi@PC-of-sss MINGW64 ~/mmall/doc/mmall-fe (mmall_v1.0)
$ git branch
  master
* mmall_v1.0

```

git merge

```
$ git merge origin master

```

git pull/git push

打标签
```
Shusheng Shi@PC-of-sss MINGW64 ~/mmall/doc/mmall-fe (mmall_v1.0)
$ git tag tag-dev-initial

Shusheng Shi@PC-of-sss MINGW64 ~/mmall/doc/mmall-fe (mmall_v1.0)
$ git push origin tag-dev-initial
Total 0 (delta 0), reused 0 (delta 0)
To gitee.com:ssshappymmall/mmall-fe.git
 * [new tag]         tag-dev-initial -> tag-dev-initial

```









