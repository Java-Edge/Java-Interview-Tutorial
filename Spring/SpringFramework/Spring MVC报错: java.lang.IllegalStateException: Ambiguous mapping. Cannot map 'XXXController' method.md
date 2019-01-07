# 1 异常场景再现
- 今天写代码,又出Bug了!
![](https://img-blog.csdnimg.cn/20190913031742978.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 看看这两个方法的注解参数
![](https://img-blog.csdnimg.cn/20190913031914108.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
# 1 绝大多数的原因
该控制器下有两个相同的url，导致spring容器不知道该url映射到哪个方法,在程序源挑错指南网站高票答案也可看出:
![](https://img-blog.csdnimg.cn/20190913031207296.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 2 隐藏Bug !!!
在@RequestMapping注解中使用value,而非name!!
![](https://img-blog.csdnimg.cn/20190913032325543.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
### 看来即使源码中说他们其实是一个人的两个名字而已,但实质上是真正的同卵双生的双胞胎!!!
![](https://img-blog.csdnimg.cn/20190913031326735.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 3 解决Bug
于是我们将其中至少一个改value,应用又能正常启动!
![](https://img-blog.csdnimg.cn/20190913032053702.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 4 总结
- 注意controller映射,勿出现重复映射方法
- 映射注解参数全部使用value,而非name


[StackOveFlow链接](
https://stackoverflow.com/questions/29949423/spring-mvc-ambiguous-mapping-found-cannot-map-controller-bean-method/29949758)