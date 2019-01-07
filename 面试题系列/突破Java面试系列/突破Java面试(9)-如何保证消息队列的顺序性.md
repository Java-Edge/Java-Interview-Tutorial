
# 0 [Github](https://github.com/Wasabi1234)

# 1 面试题

如何保证消息的顺序性？

# 2 考点分析
MQ必问话题
- 考察你是否了解顺序性
- 考察你是否有办法保证消息的顺序性,因为这是生产系统中常见的一个问题.

# 3 详解
## 3.0 案例
一个MySQL binlog同步系统,日同步数据达到上亿.

- 在MySQL里`增删改`一条数据
- 即对应出增删改3条binlog
- 接着这三条binlog发送到MQ里面
- 消费出来依次执行

应该得保证消息按照顺序执行的吧!
不然本来是：增加->修改->删除
你楞是换了顺序给执行成:删除->修改->增加
全错!!!

该数据同步过来，最后本该被删除,结果你搞错顺序,最后它却被保留下来了，数据同步出错!

## 3.1 顺序错乱的场景
### 3.1.1 rabbitmq
一个queue，多个consumer，这不明显乱了
![](https://uploadfiles.nowcoder.com/files/20190625/5088755_1561478162632_2019062514582939.png)
### 3.1.2  kafka
一个topic，一个partition，一个consumer，内部多线程，这也明显乱了
![](https://uploadfiles.nowcoder.com/files/20190625/5088755_1561478162743_20190625154839683.png)

## 3.2 保证消息的顺序性
### 3.2.1 rabbitmq
拆分多个queue，每个queue一个consumer
就是多一些queue而已，确实麻烦点
或者就一个queue但是对应一个consumer，然后这个consumer内部用内存队列做排队，然后分发给底层不同的worker来处理
![](https://uploadfiles.nowcoder.com/files/20190625/5088755_1561478162589_20190625154145295.png)

### 3.2.2 kafka
一个topic，一个partition，一个consumer，内部单线程消费，写N个内存queue，然后N个线程分别消费一个内存queue即可
![](https://uploadfiles.nowcoder.com/files/20190625/5088755_1561478162731_20190625155015191.png)

# 参考
《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)
## [Github](https://github.com/Wasabi1234)