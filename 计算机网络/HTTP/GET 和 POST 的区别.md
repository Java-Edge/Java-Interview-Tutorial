"标准"答案

>  GET使用URL或Cookie传参，POST则将数据放在body中
>  GET的URL会有长度上的限制，POST的数据可以非常大
>  POST比GET安全，因为数据在地址栏上不可见
>  

这都是一些经典面试材料抄袭的"经典"的答案，没有一点权威意义,不一提，今天我们就从官方RFC文档一探究竟

GET 和 POST 是由 HTTP 协议定义的
 在HTTP协议中，Methods

![](https://img-blog.csdnimg.cn/20210222095323729.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)


和Header

![](https://img-blog.csdnimg.cn/20210222095331905.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)



 是不相干的两个概念，使用哪个Method与应用层的数据如何传输是没有关系的
 
![](https://img-blog.csdnimg.cn/20210222095341530.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

Methods 定义

>  译文 ： 请求方法token是请求语义的主要来源;
>  它表示客户端发出此请求的目的以及客户端对成功结果的期望。
>  如果这些附加语义与方法不冲突，请求方法的语义可能会进一步由某些头字段的
>  语义进一步专门化，如果存在于请求中（第5节）
>  method = token
>  

HTTP 协议也没有要求，如果Method是POST数据就要放在BODY中

![](https://img-blog.csdnimg.cn/20210222095353673.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
>  译文 ： POST 方法请求目标资源 根据资源自身的特定语义 处理请求中包含的表示
>  例如，POST 用于以下功能：
>  1.供数据块，例如输入HTML 表格的字段的数据处理过程;
>  2.在公告栏，新闻组，邮件列表，博客或类似的文章组中发布消息;
>  3.创建一个尚未被原服务器识别的新资源;
>  4.将数据附加到资源的现有表示中