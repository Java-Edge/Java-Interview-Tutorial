# 0 [相关源码](https://github.com/Wasabi1234/Scrapy-Tutorial)

# 1 技术选型 爬虫能做什么
## 1.1 scrapy VS requests + beautifulsoup
做爬虫的时候，经常都会听到`scrapy` VS `requests + beautifulsoup`的组合
在本次分布式爬虫实现中只用scrapy而不用后者的原因是：
- `requests` 和 `beautifulsoup` 都是库，`scrapy`是一个框架
框架中可以应用`requests`等，可以集合很多第三方库
- 基于`twisted`(异步IO框架)
性能是最大的优势
-  方便扩展
提供了很多内置的功能，提高开发速度
-  内置`css`和`xpath selector`
对html或者xml进行分析,非常方便,`beautifulsoup`缺点就是慢

实践中还是会用到requests，但是不会用到beautifulsoup，因为它的功能可以直接使用scrapy的select完成.

## 1.2  网页分类
### 常见类型的服务
- 静态网页
事先在服务器端生成好的页面，内容固定
- 动态网页
从服务器端取数据返回
- webservice（REST API）
也是属于动态网页的一种，只是通过ajax方式和后台交互的一种技术

## 1.3 爬虫能做什么
- 搜索引擎-百度，google，垂直领域搜索引擎（有一个目标，知道自己到底爬什么数据）
- 推荐引擎-今日头条（根据浏览习惯猜测感兴趣的内容进行推送）
- 机器学习的数据样本
- 数据分析-金融数据分析，舆情分析

# 2 正则表达式
## 2.1 为何需要
为什么有css或者xpath selector还要学正则表达式，有时候根据selector获得了整个标签内的内容，但是还要进行进一步的筛选，比如里面的数字信息等

## 2.2 作用
可以帮我们判断某个字符串是否符合某一个模式
提取整个字符串里面的重要的部分信息

## 2.3 常用字符的用法
```
^ : 以什么字符开头
$ : 以什么字符结尾
. : 任意字符
* ：出现任意次数，0次或者更多次
()：还提取按模式取出来的子串。例如，".*(b.*b).*"表示不管前后是什么的两个b之间的子串
? ：下面详解
+ ：字符至少出现一次
{1}：前面的字符出现一次
{3，}: 要求前面的字符必须出现3次以上
{2,5}：前面的字符至少出现2次，最少出现5次
| ： 或的关系
[] : 中括号里面的内容只要满足任何一个即可，也可以是一个区间，中括号里面的^表示不等于，中括号里面的符号就是符号，不是特殊符号的含义
\s ：表示空格符
\S : 刚好与小s的意思相反，只要不是空格都可以
\w : 表示[A-Za-z0-9_]其中的任意一个字符
\W : 与\w的意思刚好相反
[\u4E00-\u9FA5] : unicode编码，含义是汉字，意思是只要出现汉字就可以。
\d : 表示数字
```

## 2.4 coding 演示
- 新建项目
![](https://upload-images.jianshu.io/upload_images/16782311-044ee7531f7bbc4f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- ^ : 以什么字符开头
此处以J开头即可!
![](https://upload-images.jianshu.io/upload_images/16782311-dbff005bf24e0694.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- $ : 以什么字符结尾
此处以4结尾即可!
![](https://upload-images.jianshu.io/upload_images/16782311-d697513f733b0142.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- J开头,中间为任意字符,最后以4结尾
![](https://upload-images.jianshu.io/upload_images/16782311-74e4a24852f06fb8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### ? : 非贪婪匹配模式
默认的情况下，匹配是贪婪模式，匹配最大长度
比如对于 "bobby123"这个待匹配的，结果就是bb，而不是bobb，所以这就是贪婪，反向匹配（或者理解成直到结束符合的最后一个结果）
    非贪婪匹配就是从左边开始，只需要出现一个结果就可以了,".*?(b.*?b).*"表示对两个b从左到右只要出现一次就可
    ".*?(b.*b).*"第二个b不要问好，那么第二个b就是贪婪模式，会持续匹配到最后一个b

- 现在源数据变更为
![](https://upload-images.jianshu.io/upload_images/16782311-5879cf2a41792265.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 欲取得字符串`boooooooob`
![](https://upload-images.jianshu.io/upload_images/16782311-41ee2c3b02fa0010.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 然而现实,却是
![](https://upload-images.jianshu.io/upload_images/16782311-8b0c9c9cae36ee19.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 非贪婪模式尽可能少的匹配所搜索的字符串，而默认的贪婪模式则尽可能多的匹配所搜索的字符串。例如，对于字符串“oooo”，“o+?”将匹配单个“o”，而“o+”将匹配所有“o”。

`此处贪婪匹配最开始时反向匹配,从右向左,所以得到bb结果串!`就无法提取目标串!何解?
- 那就需要我们的 `?`了!变成一种非贪婪模式
![](https://upload-images.jianshu.io/upload_images/16782311-3e56b904197d8cd4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 于是我们,更改匹配规则
![](https://upload-images.jianshu.io/upload_images/16782311-5866813f1ac830ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 结果令人失望!居然还多了个小b!!!
![](https://upload-images.jianshu.io/upload_images/16782311-371b45fc4a2456de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
虽然左部分正常匹配左边的b了,但是规则的右部分依旧贪婪匹配!必须让规则右边的b不要那么贪婪!给他也加个`?`修饰~即可!
![](https://upload-images.jianshu.io/upload_images/16782311-230fde678e60f455.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 终于......提取成功啦!
![](https://upload-images.jianshu.io/upload_images/16782311-2c341306b20bec4b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 限定出现次数
![](https://upload-images.jianshu.io/upload_images/16782311-7546529e1ca86e26.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### | : 表示或关系
![](https://upload-images.jianshu.io/upload_images/16782311-40ea977c28f8c40a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 下面更改源字符串
![](https://upload-images.jianshu.io/upload_images/16782311-5676c7055bda1a78.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 规则
![](https://upload-images.jianshu.io/upload_images/16782311-0bc401a3cd15a1fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 结果
![](https://upload-images.jianshu.io/upload_images/16782311-696e273e8a97cd5f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 想要提取完整的怎么做呢?
![注意括号位置](https://upload-images.jianshu.io/upload_images/16782311-c5c7803a496d0b58.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 结果
![](https://upload-images.jianshu.io/upload_images/16782311-ad4b5c106bb531a8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### []
![](https://upload-images.jianshu.io/upload_images/16782311-3aba4c9b0c804a28.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 规则
![](https://upload-images.jianshu.io/upload_images/16782311-2a6705c91af63203.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 结果
![](https://upload-images.jianshu.io/upload_images/16782311-3a05089a42bbb249.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 匹配电话号码
![](https://upload-images.jianshu.io/upload_images/16782311-e100c9bf45c9c840.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 规则
![](https://upload-images.jianshu.io/upload_images/16782311-119daf557f2dc0c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 其中有`^`
![](https://upload-images.jianshu.io/upload_images/16782311-90cd3f91413dea76.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### \s
![](https://upload-images.jianshu.io/upload_images/16782311-59d1a9904c64e966.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/16782311-7fcb04acb3413633.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- \S只能匹配一个非空字符!!!
![](https://upload-images.jianshu.io/upload_images/16782311-58d54390da5ca65b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-a68cc9af421cb2e9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### \w
![](https://upload-images.jianshu.io/upload_images/16782311-705a2f572d8b5fd7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-d88aae469536b9a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-416dd0329e49ab58.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
w不满足的空格,W满足!
![](https://upload-images.jianshu.io/upload_images/16782311-90e24d3b03705591.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 汉字编码
![](https://upload-images.jianshu.io/upload_images/16782311-5b07f1b9356e9447.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 源字符串
![](https://upload-images.jianshu.io/upload_images/16782311-fae31c435b60b33e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 想提取到底是什么大学
![这样是不行滴](https://upload-images.jianshu.io/upload_images/16782311-d3aff72cd8a39318.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 这样也是不行的,又产生了贪婪匹配问题
![](https://upload-images.jianshu.io/upload_images/16782311-b77beac352c050bb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 所以要加上`?`取消贪婪
![](https://upload-images.jianshu.io/upload_images/16782311-cdc9c870d9dc531f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
完美提取XX大学

### d D
![](https://upload-images.jianshu.io/upload_images/16782311-3b8eda594600a6cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 源字符串
![](https://upload-images.jianshu.io/upload_images/16782311-f0981c910da96d74.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 想提取1997
- 这样是不够的,只能提取出7
![](https://upload-images.jianshu.io/upload_images/16782311-d8bd0a18b8c58f1f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 这样就ok啦!
![](https://upload-images.jianshu.io/upload_images/16782311-df8eed92e5b44864.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 或者必须取消贪婪
![](https://upload-images.jianshu.io/upload_images/16782311-56251d0557b38728.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 综合实战
- 源字符串
![](https://upload-images.jianshu.io/upload_images/16782311-c33a51cf5fa11b7c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 可提取1,2,3,4
![](https://upload-images.jianshu.io/upload_images/16782311-babeb1906a567ab7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 以下为完美解决规则
![](https://upload-images.jianshu.io/upload_images/16782311-76aad02ed5ffcfd4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 3  深度优先和广度优先原理
爬虫的基本原理，一个网站的url设计是分层的，树形结构，能够让我们爬取网站的时候更加有策略。
在设计网站url时候是不会有环路的，但是在真实网站url链接的结构中，是有环路的。
比如，从首页到达某个页面，这个页面上会有返回首页的链接。如果一直进入这个死循环，那么其他页面就爬取不到内容了。所以需要用到网页的去重。
伯乐在线网站的文章爬取其中获取到的文章url是不会重复的，就不需要去重。但大多数文章都需要去重。
- 树形结构的URL设计
![](https://upload-images.jianshu.io/upload_images/16782311-90436c379c16832b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/16782311-46ccb794eb7ec556.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> scrapy默认使用深度优先实现的，深度优先使用递归实现的，广度优先是采用队列来实现的

- 深度优先
![](https://upload-images.jianshu.io/upload_images/16782311-62d9562eed01676b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 广度优先
![](https://upload-images.jianshu.io/upload_images/16782311-8f8f2dcc7709dcda.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 4 爬虫去重策略
- 将访问过的url保存到数据库中
获取url时查询一下是否爬过了.虽然数据库中有缓存,但是每次都查询效率很低.
- 将url保存到set中
只需要O(1)的代价就可以查询到url，但是内存占用会越来越大
假设有1亿条url，那么就需要1亿 x 2byte x 50字符/1024/1024/1024=8G
- url经过`md5`等方法后保存到set中
将url压缩到固定长度而且不重复，`scrapy`实际上就是应用这种方法
- 用bitmap方法
将访问过的url通过hash函数映射到某一位，对内存压缩更大，缺点是冲突比较高
- bloomfilter方法对bitmap进行改进
多重hash函数降低冲突可能性。即减少内存，又减少冲突。

# 5  字符串编码
字符串编码，写文件以及网络传输过程中，调用某些函数，经常碰到提示编码错误.
- 计算机只能处理数字,文本转换为数字才能处理.
计算机中8个bit作为一个字节，所以一个字节能表示最大的数字就是255

- 计算机是美国人发明的
一个字节可以表示所有字符了,所以ASCII(一个字节)编码就成为美国人的标准编码

- 但是ASCII处理中文明显是不够的
中文不止255个汉字，所以中国制定了`GB2312`编码，用两个字节表示一个汉字.
GB2312还把ASCII包含进去了，同理，日文，韩文等等上百个国家为了解决这个问题就都发展了一套字节的编码，标准就越来越多，如果出现多种语言混合显示就一定会出现乱码.

- 于是`unicode`出现了,将所有语言统一到一套编码里

看一下ASCII和unicode编码:
- 字母A用ASCII编码十进制是65，二进制 0100 0001
- 汉字"中" 已近超出ASCII编码的范围，用unicode编码是20013二进制是01001110 00101101
- A用unicode编码只需要前面补0二进制是 00000000 0100 0001


- 乱码问题解决了，但是如果内容全是英文，unicode编码比ASCII编码需要多一倍的存储空间，传输也会变慢
- 所以此时出现了可变长的编码utf-8
把英文：1字节，汉字3字节，特别生僻的变成4-6字节，如果传输大量的英文，utf8作用就很明显。Unicode编码虽然占用空间但是因为占用空间大小等额，在内存中处理会简单一些。

- 关于Mac(Linux同理)下编码格式问题
![](https://upload-images.jianshu.io/upload_images/16782311-df2e9431c166e51e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 以下为 Python2 操作环境!!!
- py字符串在内存中全是用Unicode进行编码的
- 在Mac下实际上默认是utf8编码
![](https://upload-images.jianshu.io/upload_images/16782311-7d3452622127046b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 在调用encode之前,必须把前面的变量转化为Unicode编码.
![](https://upload-images.jianshu.io/upload_images/16782311-3cb07667d152174d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 原本是utf8编码的不能直接编码成utf8,因为Python中使用encode方法,前面的变量必须都是Unicode编码的
![](https://upload-images.jianshu.io/upload_images/16782311-73a1177de66db0ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 所以每次执行encode前必须先decode成Unicode编码
![](https://upload-images.jianshu.io/upload_images/16782311-95bcb6ac79e23da7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 正因为Python2存在编解码问题,所以老项目都需要一个文件头
![](https://upload-images.jianshu.io/upload_images/16782311-f1cc0aac66c0c4ca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Python3则不存在此问题,内部全部使用Unicode编码!!!
# 以下为 Python3 操作环境!!!
![](https://upload-images.jianshu.io/upload_images/16782311-11e54d8287c5b0ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 参考
[正则表达](https://zh.wikipedia.org/wiki/%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F)

# X 交流学习
![](https://img-blog.csdnimg.cn/20190504005601174.jpg)
## [Java交流群](https://jq.qq.com/?_wv=1027&k=5UB4P1T)
## [博客](https://blog.csdn.net/qq_33589510)

## [Github](https://github.com/Wasabi1234)



