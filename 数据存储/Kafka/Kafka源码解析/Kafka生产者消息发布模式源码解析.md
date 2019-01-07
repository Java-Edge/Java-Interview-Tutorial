# 1 同步发送模式源码![](https://img-blog.csdnimg.cn/2020120317351811.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 2 异步发送模式源码流程
![](https://img-blog.csdnimg.cn/20201203190449846.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20201203190700487.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

# 3 总结
## 3.1 同步发送模式特点
- 同步的向服务器发送RPC请求进行生产
- 发送错误可以重试
- 可以向客户端发送ack

## 3.2 异步发送模式特点
- 最终也是通过向服务器发送RPC请求完成的(和同步发送模式一样)
- 异步发送模式先将一定量消息放入队列中，待达到一-定数量后再一起发送;
- 异步发送模式不支持发送ack,但是Client可以调用回调函数获取发送结果。

所以，性能比较高的场景使用异步发送，准确性要求高的场景使用同步发送。