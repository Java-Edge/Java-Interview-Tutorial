# 1 面试题

了解什么是Redis的雪崩和穿透吗？Redis崩溃之后会怎么样？系统该如何应对这种情况？如何处理Redis的穿透？

# 2 考点分析

缓存必问题，因为缓存雪崩和穿透，是缓存最大的两个问题，要么不出现，一旦出现就是致命的！

# 3 缓存雪崩

## 3.1 发生的现象

![](https://ask.qcloudimg.com/http-save/1752328/b03hr8eln4.png)

## 3.2 缓存雪崩的解决方案

![](https://ask.qcloudimg.com/http-save/1752328/xwm3e0kbx1.png)

- 事前：redis高可用，主从+哨兵，redis cluster，避免全盘崩溃
- 事中：本地ehcache缓存 + hystrix限流&降级，避免MySQL被打死
- 事后：redis持久化，快速恢复缓存数据

# 4 缓存穿透

## 4.1 缓存穿透现象以及解决方案

![](https://ask.qcloudimg.com/http-save/1752328/m9f7vqfaa3.png)

# 参考

《Java工程师面试突击第1季-中华石杉老师》


# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](http://www.shishusheng.com)
## [Github](https://github.com/Wasabi1234)