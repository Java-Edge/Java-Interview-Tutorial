#  05-Loader机制

loader机制让大模型具备实时学习的能力：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/cbf5df8cd1b29adecec27fc658f7f3fd.png)

## 0 Loader机制

案例环境准备：

```python
import os

os.environ["OPENAI_API_KEY"] = "sk-javaedge"
os.environ["OPENAI_PROXY"] = "https://api.chatanywhere.tech"


import os
from dotenv import load_dotenv
# Load environment variables from openai.env file
load_dotenv("openai.env")

# Read the OPENAI_API_KEY from the environment
api_key = os.getenv("OPENAI_API_KEY")
api_base = os.getenv("OPENAI_API_BASE")
os.environ["OPENAI_API_KEY"] = api_key
os.environ["OPENAI_API_BASE"] = api_base
```

## 1 加载markdown

准备一个 md 文件：

```markdown
# 我是一个markdown加载示例
- 第一项目
- 第二个项目
- 第三个项目

## 第一个项目
编程严选网，最厉害专业的AI研究基地

## 第二个项目
AIGC打造未来AI应用天地

## 第三个项目
编程严选网是一个非常牛逼的AI媒体
```

```python
#使用loader来加载markdown文本
from langchain.document_loaders import TextLoader

loader = TextLoader("loader.md")
loader.load()
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/afda3b9852f22f5db86ae87d4596f409.png)

## 2 加载cvs

```csv
Project,DES,Price,People,Location
AI GC培训,培训课程,500,100,北京
AI工程师认证,微软AI认证,6000,200,西安
AI应用大会,AI应用创新大会,200门票,300,深圳
AI 应用咨询服务,AI与场景结合,1000/小时,50,香港
AI项目可研,可行性报告,20000,60,上海
```

```python
#使用 CSVLoader 来加载 csv 文件
from langchain.document_loaders.csv_loader import CSVLoader

#loader = Loader(file_path="loader.")
loader = CSVLoader(file_path="loader.csv")
data = loader.load()
print(data)
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/b73e5f8fc222172accbb969f244e34c8.png)

## 3 加载html

先下包：

```python
! pip install "unstructured[xlsx]"
```

加载文件目录

```python
from langchain.document_loaders import UnstructuredHTMLLoader

loader = UnstructuredHTMLLoader("loader.html")
data = loader.load()
data
```

会加载 html 所有内容。

```python
from langchain.document_loaders import BSHTMLLoader
loader = BSHTMLLoader("loader.html")
data = loader.load()
data
```

只加载去除标签后的关键内容：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/c4bf9ca3d5fa7552b4d146074a3d2a3b.png)

## 4 加载JSON

先装 jq 包：

```python
 ! pip install jq
```



```python
from langchain.document_loaders import JSONLoader
loader = JSONLoader(
    file_path = "simple_prompt.json",jq_schema=".template",text_content=True
)
data = loader.load()
print(data)
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/8dc7055c72a7d75008d45b9dcc395a1e.png)

## 5 加载PDF

先装包：

```python
! pip install pypdf
```

```python
from langchain.document_loaders import PyPDFLoader
loader = PyPDFLoader("loader.pdf")
pages = loader.load_and_split()
pages[0]
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/fc1407f642d6549421f3c4cf10dbddc0.png)