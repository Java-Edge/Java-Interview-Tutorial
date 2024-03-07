### python高级爬虫实战之Headers信息校验-Cookie

#### 一、什么是cookie

​		上期我们了解了User-Agent，这期我们来看下如何利用Cookie进行用户模拟登录从而进行网站数据的爬取。

首先让我们来了解下什么是Cookie：

​		Cookie指某些网站为了辨别用户身份、从而储存在用户本地终端上的数据。当客户端在第一次请求网站指定的首页或登录页进行登录之后，服务器端会返回一个Cookie值给客户端。如果客户端为浏览器，将自动将返回的cookie存储下来。当再次访问改网页的其他页面时，自动将cookie值在Headers里传递过去，服务器接受值后进行验证，如合法处理请求，否则拒绝请求。

### 二、如何利用cookie

​		举个例子我们要去微博爬取相关数据，首先我们会遇到登录的问题，当然我们可以利用python其他的功能模块进行模拟登录，这里可能会涉及到验证码等一些反爬手段。

![截屏2024-03-04 下午7.53.55](https://s2.loli.net/2024/03/04/j7RxseHBKSlGMD5.png)

换个思路，我们登录好了，通过开发者工具“右击” 检查（或者按F12） 获取到对应的cookie，那我们就可以绕个登录的页面，利用cookie继续用户模拟操作从而直接进行操作了。

![截屏2024-03-04 下午8.02.39](https://s2.loli.net/2024/03/04/qLygJpvH6RYTlzE.png)

利用cookie实现模拟登录的两种方法：

- [ ] 将cookie插入Headers请求头

  ```
  Headers={"cookie":"复制的cookie值"}
  ```

  

- [ ] 将cookie直接作为requests方法的参数

```
cookie={"cookie":"复制的cookie值"}
requests.get(url,cookie=cookie)
```

#### 三、利用selenium获取cookie，实现用户模拟登录

实现方法：利用selenium模拟浏览器操作，输入用户名，密码 或扫码进行登录，获取到登录的cookie保存成文件，加载文件解析cookie实现用户模拟登录。

```python
from selenium import webdriver
from time import sleep
import json
#selenium模拟浏览器获取cookie
def getCookie:
	driver = webdriver.Chrome()
  driver.maximize_window()
  driver.get('https://weibo.co m/login.php')
  sleep(20) # 留时间进行扫码
  Cookies = driver.get_cookies() # 获取list的cookies
  jsCookies = json.dumps(Cookies) # 转换成字符串保存
  with open('cookies.txt', 'w') as f:
    f.write(jsCookies)
    
def login:
	 filename = 'cookies.txt'
   #创建MozillaCookieJar实例对象
   cookie = cookiejar.MozillaCookieJar()
   #从文件中读取cookie内容到变量
   cookie.load(filename, ignore_discard=True, ignore_expires=True)
   response = requests.get('https://weibo.co m/login.php',cookie=cookie)
```

#### 四、拓展思考

​		如果频繁使用一个账号进行登录爬取网站数据有可能导致服务器检查到异常，对当前账号进行封禁，这边我们就需要考虑cookie池的引入了。