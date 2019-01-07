# Redis的并发竞争问题
- 多客户端同时并发写一个key，可能本来应该先到的数据后到了，导致数据版本出错
- 多客户端同时获取一个key，修改值之后再写回去，只要顺序错了，数据也错了
# 解决方案
其实Redis本身就有解决这个问题的CAS类的乐观锁方案。
![](https://img-blog.csdnimg.cn/20190509175418361.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)