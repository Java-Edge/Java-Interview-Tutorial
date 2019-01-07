# 创建项目
在开始爬取之前，必须创建一个新的Scrapy项目。 进入打算存储代码的目录中，运行下列命令:
![scrapy startproject tutorial](https://upload-images.jianshu.io/upload_images/4685968-dd19b6402d59a948.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
该命令将会创建包含下列内容的 tutorial 目录
![](https://upload-images.jianshu.io/upload_images/4685968-1bd18954ebd5a48e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- tutorial/
该项目的python模块。之后将在此加入代码
- scrapy.cfg
项目的配置文件
![](https://upload-images.jianshu.io/upload_images/4685968-953fefa79cee7379.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- items.py
项目中的item文件
![](https://upload-images.jianshu.io/upload_images/4685968-fa172e84e7984fa1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- pipelines.py
项目中的pipelines文件
![](https://upload-images.jianshu.io/upload_images/4685968-98843df3ed7aafff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- settings.py
项目的设置文件
![](https://upload-images.jianshu.io/upload_images/4685968-553e93709e222110.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- spiders/
放置spider代码的目录
# 1 定义Item
保存爬取到的数据的容器
使用方法和python字典类似， 并且提供了额外保护机制来避免拼写错误导致的未定义字段错误。

类似在ORM中做的一样，可通过创建一个 [`scrapy.Item`]类， 并且定义类型为 [`scrapy.Field`]的类属性来定义一个Item

首先根据需要从`dmoz.org`获取到的数据对item进行建模。
我们需要从dmoz中获取名字，url，以及网站的描述。
对此，在item中定义相应的字段
编辑 `tutorial` 目录中的 `items.py` 文件
![](https://upload-images.jianshu.io/upload_images/4685968-7fab5c8a39245614.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
通过定义item， 可很方便的使用Scrapy的其他方法。而这些方法需要知道item的定义

# 2 编写第一个爬虫
Spider是用户编写用于从单个网站(或者一些网站)爬取数据的类

其包含了一个用于下载的初始URL，如何跟进网页中的链接以及如何分析页面中的内容， 提取生成 [item] 的方法。

为了创建一个Spider，您必须继承 [`scrapy.Spider`]类， 且定义以下三个属性:

## [`name`]
用于区别Spider, 该名字必须是唯一的,定义spider名字的字符串(string)
spider的名字定义了Scrapy如何定位(并初始化)spider，所以其必须是唯一的
不过可生成多个相同的spider实例(instance)，这没有任何限制。
name是spider最重要的属性，且`必须`定义

如果该spider爬取单个网站(single domain)，一个常见的做法是以该网站(domain)(加或不加 [后缀](http://en.wikipedia.org/wiki/Top-level_domain) )来命名spider
 例如，如果spider爬取 `mywebsite.com` ，该spider通常会被命名为 `mywebsite` 

##  [`start_urls`]
包含了Spider在启动时进行爬取的url列表
因此，第一个被获取到的页面将是其中之一。
后续的URL则从初始的URL获取到的数据中提取
URL列表。当没有制定特定的URL时，spider将从该列表中开始进行爬取。 因此，第一个被获取到的页面的URL将是该列表之一。 后续的URL将会从获取到的数据中提取。
## [`parse()`]
spider的一个方法。 被调用时，每个初始URL完成下载后生成的 [`Response`](https://scrapy-chs.readthedocs.io/zh_CN/0.24/topics/request-response.html#scrapy.http.Response "scrapy.http.Response") 对象将会作为唯一的参数传递给该函数。 该方法负责解析返回的数据(response data)，提取数据(生成item)以及生成需要进一步处理的URL的 [`Request`]对象

## 明确目标(mySpider/items.py)
我们打算抓取 http://www.itcast.cn/channel/teacher.shtml 网站里的所有讲师的姓名、职称和个人信息。

打开 mySpider 目录下的 items.py。

Item 定义结构化数据字段，用来保存爬取到的数据，有点像 Python 中的 dict，但是提供了一些额外的保护减少错误。

可以通过创建一个 scrapy.Item 类， 并且定义类型为 scrapy.Field 的类属性来定义一个 Item（可以理解成类似于 ORM 的映射关系）。

接下来，创建一个 ItcastItem 类，和构建 item 模型（model）。
![](https://upload-images.jianshu.io/upload_images/4685968-a62e7966d9dd7b1d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 制作爬虫 （spiders/itcastSpider.py）
爬虫功能要分两步：
### 1. 爬数据

在当前目录下输入命令，将在mySpider/spider目录下创建一个名为itcast的爬虫，并指定爬取域的范围
![scrapy genspider itcast "itcast.cn"](https://upload-images.jianshu.io/upload_images/4685968-1802e101764d0b33.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 打开 mySpider/spider目录里的 itcast.py，默认增加了下列代码
![](https://upload-images.jianshu.io/upload_images/4685968-67f1f02b2d9cfcc1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

也可以由我们自行创建itcast.py并编写上面的代码，只不过使用命令可以免去编写固定代码的麻烦

要建立一个Spider， 你必须用`scrapy.Spider`类创建一个子类，并确定三个强制的属性 和 一个方法。
- name = "" ：这个爬虫的识别名称，必须是唯一的，在不同的爬虫必须定义不同的名字。
- allow_domains = [] 是搜索的域名范围，也就是爬虫的约束区域，规定爬虫只爬取这个域名下的网页，不存在的URL会被忽略。
- start_urls = () ：爬取的URL元祖/列表。爬虫从这里开始抓取数据，所以，第一次下载的数据将会从这些urls开始。其他子URL将会从这些起始URL中继承性生成。
- parse(self, response) ：解析的方法，每个初始URL完成下载后将被调用，调用的时候传入从每一个URL传回的Response对象来作为唯一参数，主要作用如下：

负责解析返回的网页数据(response.body)，提取结构化数据(生成item)
生成需要下一页的URL请求。
将start_urls的值修改为需要爬取的第一个url
