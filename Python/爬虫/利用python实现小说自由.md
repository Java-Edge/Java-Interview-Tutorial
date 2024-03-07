### 利用python实现小说自由

#### 一、用到的相关模块

1.reuqests模块

安装reuqest模块，命令行输入：

``` 
pip install requests
```

2.xpath解析

​		XPath 即为 XML 路径语言，它是一种用来确定 XML (标准通用标记语言子集)文档中某部分位置的语言。XPath 基于 XML 的树状结构，提供在数据结构树中找寻节点的能力。起初 XPath 的提出的初衷是将其作为一个通用的、介于 XPointer 与 XSL 间的语法模型。但是 XPath 很快的被开发者采用来当作小型查询语言。

​    简单的来说：Xpath（XML Path Language）是一门在 XML 和 HTML 文档中查找信息的语言，可用来在 XML 和 HTML 文档中对元素和属性进行遍历。

​	xml 是 一个HTML/XML的解析器，主要的功能是如何解析和提取 HTML/XML 数据。

安装xml：

``` 
pip install lxml
```



#### 二、实现步骤

1.首先我们打开一个小说的网址：https://www.qu-la.com/booktxt/17437775116/

2.右击“检查” 查看下这个网页的相关代码情况 

<img src="https://s2.loli.net/2024/03/01/y3XolKRDgu6VJbj.png">

我们可以发现所有的内容都被包裹在<ul class="cf”> 的ul中。

右击复制出xpath路径

//*[@id="list"]/div[3]/ul[2]

<img src="https://s2.loli.net/2024/03/01/kzjRUCqwheHxFuY.png"/>

通过xpath 解析出每个章节的标题，和链接。

3.根据对应的链接获取每个章节的文本。同样的方法找到章节文本的具体位置

//*[@id="txt"]

<img src="https://s2.loli.net/2024/03/01/1j5FktPoXpcnUJi.png"/>

3.for 循环获取所有链接的文本，保存为Txt文件。

#### 三、代码展示

```python
import requests
from lxml import etree
def getNovel():
    headers = {'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36'};
    html = requests.get('https://www.qu-la.com/booktxt/17437775116/',headers=headers).content
    doc=etree.HTML(html)
    contents=doc.xpath('//*[ @id="list"]/div[3]/ul[2]') #获取到小说的所有章节
    for content in contents:
        links=content.xpath('li/a/@href') #获取每个章节的链接
        for link in links: #循环处理每个章节
            url='https://www.qu-la.com'+link #拼接章节url
            html=requests.get(url).text
            doc=etree.HTML(html)
            content = doc.xpath('//*[@id="txt"]/text()') #获取章节的正文
            title = doc.xpath('//*[@id="chapter-title"]/h1/text()') #获取标题
            #所有的保存到一个文件里面
            with open('books/凡人修仙之仙界篇.txt', 'a') as file:
                file.write(title[0])
                print('正在下载{}'.format(title[0]))
                for items in content:
                    file.write(item)

    print('下载完成')
getNovel() #调用函数
```

#### 四、拓展思考

1.写一个搜索界面，用户输入书名自主下载对应的小说。

2.引入多进程异步下载，提高小说的下载速度。



