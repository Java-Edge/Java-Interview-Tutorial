一般来说，在调用依赖服务的接口的时候，比较常见的一个问题，就是超时

超时是在一个复杂的分布式系统中，导致不稳定，或者系统抖动，或者出现说大量超时，线程资源hang死，吞吐量大幅度下降，甚至服务崩溃

分布式复杂的系统里，可能你的依赖接口的性能很不稳定，有时候2ms，200ms，2s

如果你不对各种依赖接口的调用，做超时的控制，来给你的服务提供安全保护措施，那么很可能你的服务就被各种垃圾的依赖服务的性能给拖死了

# 1 TimeoutMilliseconds

- Timeout value in milliseconds for a command

![](https://ask.qcloudimg.com/http-save/1752328/b9efgx46d9.png)

手动设置timeout时长，一个command运行超出这个时间，就认为是timeout

然后将hystrix command标识为timeout，同时执行fallback降级逻辑

- default => executionTimeoutInMilliseconds: 1000 = 1 second
默认是1000，也就是1000毫秒

![](https://ask.qcloudimg.com/http-save/1752328/oe2pxk64pi.png)

# 2 TimeoutEnabled
- Whether timeout should be triggered
是否应触发超时
![](https://ask.qcloudimg.com/http-save/1752328/zy2ur2twot.png)
- 控制是否要打开timeout机制，默认是true
![](https://ask.qcloudimg.com/http-save/1752328/5u56gzo4v3.png)
让一个command执行timeout，然后看是否会调用fallback降级
# 参考

- 《Java工程师面试突击第1季-中华石杉老师》

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)

## [Github](https://github.com/Wasabi1234)
