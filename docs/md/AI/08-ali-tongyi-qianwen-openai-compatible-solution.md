# 08-阿里通义千问和OpenAI接口兼容的解决方案

DashScope提供了与OpenAI兼容的使用方式。如果您之前使用OpenAI SDK或者其他OpenAI兼容接口（例如langchain_openai SDK），以及HTTP方式调用OpenAI的服务，只需在原有框架下调整API-KEY、base_url、model等参数，就可以直接使用DashScope模型服务。

## **兼容OpenAI需要信息**

### **Base_URL**

base_url表示模型服务的网络访问点或地址。通过该地址，您可以访问服务提供的功能或数据。在Web服务或API的使用中，base_url通常对应于服务的具体操作或资源的URL。当您使用OpenAI兼容接口来使用DashScope模型服务时，需要配置base_url。

- 当您通过OpenAI SDK或其他OpenAI兼容的SDK调用时，需要配置的base_url如下：

   

  ```http
  https://dashscope.aliyuncs.com/compatible-mode/v1
  ```

- 当您通过HTTP请求调用时，需要配置的完整访问endpoint如下：

   

  ```http
  POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
  ```

### **灵积API-KEY**

需要开通灵积模型服务并获得API-KEY。

## 通过OpenAI SDK调用

### **前提条件**

- Python环境。

- OpenAI SDK。

   

  ```shell
  # 如果下述命令报错，请将pip替换为pip3
  pip install -U openai
  ```

- 已开通灵积模型服务并获得API-KEY：[开通DashScope并创建API-KEY](https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key)。

### **使用方式**

您可以参考以下非流式输出与流式输出示例来使用OpenAI SDK访问DashScope服务上的千问模型。

#### **非流式调用示例**

```python
from openai import OpenAI
import os

def get_response():
    client = OpenAI(
        api_key=os.getenv("DASHSCOPE_API_KEY"), # 如果您没有配置环境变量，请在此处用您的API Key进行替换
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",  # 填写DashScope SDK的base_url
    )
    completion = client.chat.completions.create(
        model="qwen-plus",
        messages=[{'role': 'system', 'content': 'You are a helpful assistant.'},
                  {'role': 'user', 'content': '你是谁？'}]
        )
    print(completion.model_dump_json())

if __name__ == '__main__':
    get_response()
```

#### **流式调用示例**

```python
from openai import OpenAI
import os

def get_response():
    client = OpenAI(
        api_key=os.getenv("DASHSCOPE_API_KEY"), # 如果您没有配置环境变量，请在此处用您的API Key进行替换
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",  # 填写DashScope SDK的base_url
    )
    completion = client.chat.completions.create(
        model="qwen-plus",
        messages=[{'role': 'system', 'content': 'You are a helpful assistant.'},
                  {'role': 'user', 'content': '你是谁？'}],
        stream=True
        )
    for chunk in completion:
        print(chunk.model_dump_json())

if __name__ == '__main__':
    get_response()
```

### **输入参数配置**

输入参数与OpenAI的接口参数对齐。

## 通过langchain_openai SDK调用

### **前提条件**

- 请确保您的计算机上安装了Python环境。

- 通过运行以下命令安装langchain_openai SDK。

   

  ```shell
  # 如果下述命令报错，请将pip替换为pip3
  pip install -U langchain_openai
  ```

- 已开通灵积模型服务并获得API-KEY：[开通DashScope并创建API-KEY](https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key)。

- 我们推荐您将API-KEY配置到环境变量中以降低API-KEY的泄漏风险，详情可参考[通过环境变量配置API-KEY](https://help.aliyun.com/zh/dashscope/developer-reference/configure-api-key-through-environment-variables)。您也可以在代码中配置API-KEY，**但是泄漏风险会提高**。

- 请选择您需要使用的模型：[支持的模型列表](https://help.aliyun.com/zh/dashscope/developer-reference/compatibility-of-openai-with-dashscope/#eadfc13038jd5)。

### **使用方式**

您可以参考以下非流式输出与流式输出示例来通过langchain_openai SDK使用DashScope的千问模型。

#### **非流式输出**

非流式输出使用invoke方法实现，参考：

```python
from langchain_openai import ChatOpenAI
import os

def get_response():
    llm = ChatOpenAI(
        api_key=os.getenv("DASHSCOPE_API_KEY"), # 如果您没有配置环境变量，请在此处用您的API Key进行替换
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1", # 填写DashScope base_url
        model="qwen-plus"
        )
    messages = [
        {"role":"system","content":"You are a helpful assistant."}, 
        {"role":"user","content":"你是谁？"}
    ]
    response = llm.invoke(messages)
    print(response.json(ensure_ascii=False))

if __name__ == "__main__":
    get_response()
```

#### **流式输出**

流式输出使用stream方法实现，无需在参数中配置stream参数。

 

```python
from langchain_openai import ChatOpenAI
import os

def get_response():
    llm = ChatOpenAI(
        api_key=os.getenv("DASHSCOPE_API_KEY"),
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1", 
        model="qwen-plus"
        )
    messages = [
        {"role":"system","content":"You are a helpful assistant."}, 
        {"role":"user","content":"你是谁？"},
    ]
    response = llm.stream(messages)
    for chunk in response:
        print(chunk.json(ensure_ascii=False))

if __name__ == "__main__":
    get_response()
```