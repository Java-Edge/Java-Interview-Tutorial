# 10-ali-tongyi-qianwen-status-codes-explanation

## 状态码参考

DashScope灵积模型服务的API调用将返回状态码以标识调用结果。通用状态码由DashScope约定，各算法模型还可能在通用状态码的基础上增加自定义的状态码和状态信息。请通过返回结果中的code和status字段定位调用成功或失败的详细信息。



下表列出DashScope通用状态码信息。各算法模型自定义的状态码信息则可在模型详情页进行查找。

| **HTTP返回码** | **错误代码 Code**                | **错误信息 Message****（具体信息内容可能跟随场景有所变化）** | **含义说明**                                                 |
| -------------- | -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 400            | InvalidParameter                 | Required parameter(s) missing or invalid, please check the request parameters. | 接口调用参数不合法。                                         |
| 400            | DataInspectionFailed             | Input or output data may contain inappropriate content.      | 数据检查错误，输入或者输出包含疑似敏感内容被绿网拦截。       |
| 400            | BadRequest.EmptyInput            | Required input parameter missing from request.               | 请求的输入不能为空。                                         |
| 400            | BadRequest.EmptyParameters       | Required parameter "parameters" missing from request.        | 请求的参数不能为空。                                         |
| 400            | BadRequest.EmptyModel            | Required parameter "model" missing from request.             | 请求输入的模型不能为空。                                     |
| 400            | InvalidURL                       | Invalid URL provided in your request.                        | 请求的 URL 错误。                                            |
| 400            | Arrearage                        | Access denied, plesase make sure your account is in good standing. | 客户账户因为欠费而被拒绝访问。                               |
| 400            | UnsupportedOperation             | The operation is unsupported on the referee object.          | 关联的对象不支持该操作（可以根据实际情况修改）。             |
| 401            | InvalidApiKey                    | Invalid API-key provided.                                    | 请求中的 ApiKey 错误。                                       |
| 403            | AccessDenied                     | Access denied.                                               | 无权访问此 API，比如不在邀测中，您调用的模型属于邀测中的模型，需要参考调用模型的文档申请访问权限。 |
| 403            | AccessDenied.Unpurchased         | Access to model denied. Please make sure you are eligible for using the model. | 客户没有开通此商品。                                         |
| 408            | RequestTimeOut                   | Request timed out, please try again later.                   | 请求超时。                                                   |
| 413            | BadRequest.TooLarge              | Payload Too Large                                            | 接入层网关返回请求体过大错误。特别针对qwen-long等支持超长上下文的模型，建议超过1M Tokens的上下文内容通过文件方式提交，否则请求内容放在API请求结构体中可能会导致请求报文超过接口允许的长度限制，导致此错误。 |
| 415            | BadRequest.InputDownloadFailed   | Failed to download the input file: xxx                       | 下载输入文件失败，可能是下载超时，失败或者文件超过限额大小，错误信息可以指出更细节内容。 |
| 415            | BadRequest.UnsupportedFileFormat | Input file format is not supported.                          | 输入文件的格式不支持。                                       |
| 429            | Throttling                       | Requests throttling triggered.                               | 接口调用触发限流。                                           |
| 429            | Throttling.RateQuota             | Requests rate limit exceeded, please try again later.        | 调用频次触发限流，比如每秒钟请求数。                         |
| 429            | Throttling.AllocationQuota       | Allocated quota exceeded, please increase your quota limit.  | 一段时间调用量触发限流，比如每分钟生成Token数。              |
| 429            | Throttling.AllocationQuota       | Free allocated quota exceeded.                               | 免费额度已经耗尽，并且模型未开通计费访问。                   |
| 500            | InternalError                    | An internal error has occured, please try again later or contact service support. | 内部错误。                                                   |
| 500            | InternalError.Algo               | An internal error has occured during execution, please try again later or contact service support. | 内部算法错误。                                               |
| 500            | SystemError                      | An system error has occured, please try again later.         | 系统错误。                                                   |
| 500            | InternalError.Timeout            | An internal timeout error has occured during execution, please try again later or contact service support. | 异步任务从网关提交给算法服务层之后等待时间3小时，如果3小时始终没有结果，则超时。 |

**说明**

HTTP返回码在某些特定协议之下可能不存在。

## **返回字段参考**

DashScope灵积模型服务在访问失败的情况下，除HTTP状态码外还会返回错误的细节信息，一个访问失败示例的调用可能有如下所示返回：

 

```json
{
  	"request_id": "54dc32fd-968b-4aed-b6a8-ae63d6fda4d5",
  	"code": "InvalidApiKey",
  	"message": "The API key in your request is invalid."
}
```



返回参数说明如下：

|      |      |      |
| ---- | ---- | ---- |
|      |      |      |

| **返回参数**   | **类型** | **说明**                                                     |
| -------------- | -------- | ------------------------------------------------------------ |
| HTTP请求返回码 | integer  | 200（HTTPStatus.OK）表示请求成功，否则表示请求失败，可以通过code获取错误码，通过message字段获取错误详细信息。 |
| request_id     | string   | 系统对一次API调用赋予的唯一标识。当排查问题的时候，开发者可以将request_id进行反馈以定位某次调用。 |
| code           | string   | 如果请求失败，code表示错误码。更多信息，请参见[状态码参考](https://help.aliyun.com/zh/dashscope/developer-reference/return-status-code-description#a65af597c2el0)的错误代码部分。 |
| message        | string   | 如果失败，内容为失败详细信息，参考错误码表“错误信息”部分，需要注意的是这部分内容可能会随着具体的情况有所不同，可能会输出更加有针对性的内容，不一定和上述码表中的信息完全一致。 |