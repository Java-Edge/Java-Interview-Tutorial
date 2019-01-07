微服务之间的大多都是使用 HTTP 通信，这自然少不了使用 HttpClient。
在不适用 Spring 前，一般使用 Apache HttpClient 和 Ok HttpClient 等，而一旦引入 Spring，就有了更好选择 -  RestTemplate。

接口：
![](https://img-blog.csdnimg.cn/f7633a690cec471787c55a5b34722db1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
想接受一个 Form 表单请求，读取表单定义的两个参数 para1 和 para2，然后作为响应返回给客户端。

定义完接口后，使用 RestTemplate 来发送一个这样的表单请求，代码示例如下：
![](https://img-blog.csdnimg.cn/96362640fa3b4354b5b0a32687c302b1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
上述代码定义了一个 Map，包含了 2 个表单参数，然后使用 RestTemplate 的 postForObject 提交这个表单。
执行代码提示 400 错误，即请求出错：
![](https://img-blog.csdnimg.cn/a2dfa488fb0f415aacb08441bd35e76d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
就是缺少 para1 表单参数，why？
# 解析
RestTemplate 提交的表单，最后提交请求啥样？
Wireshark 抓包：
![](https://img-blog.csdnimg.cn/94de06901df043ac9fa9a8de77ed9fd6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
实际上是将定义的表单数据以 JSON 提交过去了，所以我们的接口处理自然取不到任何表单参数。
why？怎么变成 JSON 请求体提交数据呢？注意 RestTemplate  执行调用栈：
![](https://img-blog.csdnimg.cn/63895ac7bac84bde8dce1d208938af54.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
最终使用的 Jackson 工具序列化了表单
![](https://img-blog.csdnimg.cn/8f4582ece1c244baabe31b43463db638.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
用到 JSON 的关键原因在
### RestTemplate.HttpEntityRequestCallback#doWithRequest
![](https://img-blog.csdnimg.cn/c779397a10a14cf3a9b5fe3635b22b8b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
根据当前要提交的 Body 内容，遍历当前支持的所有编解码器:
- 若找到合适编解码器，用之完成 Body 转化

看下 JSON 的编解码器对是否合适的判断
### AbstractJackson2HttpMessageConverter#canWrite
![](https://img-blog.csdnimg.cn/cf45893c65b5498eb2d16638ce7873e5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
可见，当使用的 Body 为 HashMap，是可完成 JSON 序列化的。
所以后续将这个表单序列化为请求 Body了。

但我还是疑问，为何适应表单处理的编解码器不行？
那就该看编解码器判断是否支持的实现：
### FormHttpMessageConverter#canWrite![](https://img-blog.csdnimg.cn/ee0f19a3ed6c43269a58ddb3179591f5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
可见只有当我们发送的 Body 是 MultiValueMap 才能使用表单来提交。
原来使用 RestTemplate 提交表单必须是 MultiValueMap！
而我们案例定义的就是普通的 HashMap，最终是按请求 Body 的方式发送出去的。
# 修正
换成 MultiValueMap 类型存储表单数据即可：
![](https://img-blog.csdnimg.cn/ace1283803104462bab2261d6f9789d3.png)
修正后，表单数据最终使用下面的代码进行了编码：
### FormHttpMessageConverter#write
![](https://img-blog.csdnimg.cn/312d71a80572443b8bb153dcdbd15e0e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
发送出的数据截图如下：
![](https://img-blog.csdnimg.cn/244f8819935244d59083e66ca6b16ea4.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
这就对了！其实官方文档也说明了：
![](https://img-blog.csdnimg.cn/7020d620d5b544a29d022877dcfac1a8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

> 参考：
> - https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/client/RestTemplate.html