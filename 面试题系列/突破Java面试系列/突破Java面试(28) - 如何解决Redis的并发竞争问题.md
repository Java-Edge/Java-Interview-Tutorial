
# 1 面试题
redis的并发竞争问题是什么？如何解决这个问题？了解Redis事务的CAS方案吗？

# 2 考点分析
这个也是线上非常常见的一个问题，就是多客户端同时并发写一个key，可能本来应该先到的数据后到了，导致数据版本错了。或者是多客户端同时获取一个key，修改值之后再写回去，只要顺序错了，数据就错了。

而且redis自己就有天然解决这个问题的CAS类的乐观锁方案

#  3 详解
- redis并发竞争问题以及解决方案
![](https://img-blog.csdnimg.cn/20190509175418361.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)

# 参考

《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)

## [Github](https://github.com/Wasabi1234)

