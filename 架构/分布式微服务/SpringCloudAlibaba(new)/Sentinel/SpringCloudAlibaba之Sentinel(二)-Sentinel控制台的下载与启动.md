> `文章已收录在我的 GitHub 仓库，欢迎Star/fork：`
> [Java-Interview-Tutorial](https://github.com/Wasabi1234/Java-Interview-Tutorial)
> 听说点赞、评论、收藏的人长得都很好看哦。

# 1 下载
- 下载
[官方下载站点](https://github.com/alibaba/Sentinel/releases)

- 当前最新版本1.7.2 版本
![](https://img-blog.csdnimg.cn/20200513094946766.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 2 启动

```bash
java -Dserver.port=8088 -Dcsp.sentinel.dashboard.server=localhost:8088 
-Dproject.name=sentinel-dashboard 
-jar sentinel-dashboard-1.7.2.jar
```
![](https://img-blog.csdnimg.cn/20200513100451552.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 访问
[http://localhost:8080/#/login](http://localhost:8080/#/login)
- 账号密码 : sentinel
![](https://img-blog.csdnimg.cn/2020051310064034.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 首页
![](https://img-blog.csdnimg.cn/20200515092929771.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- Sentinel是懒加载的,一定时间后
![](https://img-blog.csdnimg.cn/20191027212416647.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)