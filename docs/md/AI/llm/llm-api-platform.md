# 免费大模型API平台

## 1 列表



| 大模型                | 免费版本                                                     | 免费限制                                                     | 控制台（api_key等）                                          | 文档地址                                                     |
| :-------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| 讯飞星火              | `spark-lite`                                                 | tokens：总量无限 QPS：2 有效期：不限                         | [访问链接 219](https://console.xfyun.cn/services/cbm)        | [文档查看 71](https://www.xfyun.cn/doc/spark/Web.html)       |
| 百度千帆              | `yi_34b_chat`, `ERNIE-Speed-8K`, `ERNIE-Speed-128K`, `ERNIE-Lite-8K`, `ERNIE-Lite-8K-0922`, `ERNIE-Tiny-8K` | Lite、Speed-8K：RPM = 300，TPM = 300000 Speed-128K：RPM = 60，TPM = 300000 | [访问链接 101](https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application) | [文档查看 44](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/klqx7b1xf) |
| 腾讯混元              | `hunyuan-lite`                                               | 限制并发数为 5 路                                            | [访问链接 77](https://console.cloud.tencent.com/cam/capi)    | [链接 37](https://cloud.tencent.com/document/api/1729/105701) |
| Cloudflare Workers AI | `所有模型`                                                   | 免费可以每天使用1万次，一个月可以30万次；测试版本本的模型无限制 | [访问链接 169](https://dash.cloudflare.com/)                 | [文档查看 75](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/) |
| 字节扣子              | 豆包·Function call模型(32K)、通义千问-Max(8K)、MiniMax 6.5s(245K)、Moonshot（8K）、Moonshot（32K）、Moonshot（128K） | 当前扣子 API 免费供开发者使用，每个空间的 API 请求限额如下：QPS (每秒发送的请求数)：2 QPM (每分钟发送的请求数)：60 QPD (每天发送的请求数)：3000 | [访问链接 114](https://www.coze.cn/space)                    | [文档查看 39](https://www.coze.cn/docs/developer_guides/coze_api_overview) |
| 字节火山方舟          | doubao系列、Moonshot系列等                                   | 2024年5月15日至8月30日期间，每个模型高达5亿tokens的免费权益，共计6个模型有30亿tokens。 | [访问链接 66](https://www.volcengine.com/docs/82379/1263512) | [文档查看 66](https://www.volcengine.com/docs/82379/1263512) |
| Llama Family          | “Atom-13B-Chat”,“Atom-7B-Chat”,“Atom-1B-Chat”,“Llama3-Chinese-8B-Instruct” | 1.每天 8-22 点：接口限速每分钟 20 次并发 2.每天 22-次日 8 点：接口限速每分钟 50 次并发 | [访问链接 84](https://llama.family/docs/secret)              | [文档查看 29](https://llama.family/docs/chat-completion-v1)  |
| Groq                  | gemma-7b-it、mixtral-8x7b-32768、llama3-70b-8192、llama3-8b-8192 |                                                              |                                                              |                                                              |
| 硅基流动              |                                                              | 注册就送，包含2000w个token，可以多注册几个手机号             | [https://cloud.siliconflow.cn/i/lbFmA6dI](https://cloud.siliconflow.cn/i/lbFmA6dI) |                                                              |

## 2 列表



| 大模型   | 免费版本     | 免费限制                                                     | 控制台（api_key等）                                   | 文档地址                                               |
| :------- | :----------- | :----------------------------------------------------------- | :---------------------------------------------------- | :----------------------------------------------------- |
| 讯飞星火 | `spark-lite` | 安全封控等级太高了，老是提醒内容违规被禁止，巨难受，其他的就不会 | [访问链接 219](https://console.xfyun.cn/services/cbm) | [文档查看 71](https://www.xfyun.cn/doc/spark/Web.html) |
| 零一万物 |              |                                                              | https://platform.lingyiwanwu.com/                     |                                                        |
| 智谱AI   |              |                                                              | https://bigmodel.cn/                                  |                                                        |
| gemini   |              |                                                              |                                                       |                                                        |
|          |              |                                                              |                                                       |                                                        |
|          |              |                                                              |                                                       |                                                        |
|          |              |                                                              |                                                       |                                                        |
|          |              |                                                              |                                                       |                                                        |
|          |              |                                                              |                                                       |                                                        |

| 时间    | 企业              | 事件                                                         |
| ------- | ----------------- | ------------------------------------------------------------ |
| 1月25日 | AMD               | 将DeepSeek - V3模型集成到了Instinct MI300X GPU上             |
| 1月30日 | 微软              | 宣布DeepSeek - R1模型已通过AzureAI Foundry和H100提供         |
| 1月31日 | 英伟达            | DeepSeek - R1模型现已作为NVIDIA AI服务预览版提供，为开发者开启了测试和验证阶段的访问 |
| 1月31日 | 英特尔            | DeepSeek能够在搭载酷睿处理器的AI PC上快速使用                |
| 1月31日 | 英特尔            | 用户可以在AmazonSageMaker中部署DeepSeek - R1模型             |
| 2月1日  | 华为云/云基座基础 | 基础软件与华为云团队联合宣布上线基于华为云盘古云服务的DeepSeek - R1推理服务 |
| 2月2日  | 腾讯云            | 在高性能应用服务器HA上支持一键部署DeepSeek - R1模型          |
| 2月5日  | 天翼云            | 天翼云在其智算产品体系中全面接入DeepSeek - R1模型            |
| 2月8日  | 阿里云            | 在PAIModelGallery支持云上一键部署DeepSeek - V3和DeepSeek - R1模型 |
| 2月8日  | 百度智能云        | 百度智能云千帆平台正式上架DeepSeek - R1和DeepSeek - V3模型   |
| 2月9日  | 火山引擎          | 宣布全面支持DeepSeek系列大模型                               |
| 2月9日  | 沐曦              | 联合中国开源大模型平台OpenI.AI发布了全套DeepSeek - R1千亿训练模型 |
| 2月14日 | 天数智芯          | 正式上线包括DeepSeek - R1 - 11B/DeepSeek - Q - 1.5B、DeepSeek - R1 - 11B - Qwen - 7B、DeepSeek - R1 - 33B/DeepSeek - Qwen - 7B等多个大模型服务 |
| 2月14日 | 摩尔线程          | 宣布已实现对DeepSeek基础模型推理服务的部署，并即将开放自主设计的鲲鹏（EAGLE）GPU集群算力，支持DeepSeek - R1模型及新一代蒸馏模型的分布式部署 |
| 2月21日 | 海光信息          | 宣布其技术团队已完成DeepSeek - V3和R1模型与海光DCU的适配并上线 |
| 2月23日 | 无问芯穹          | 宣布其Infinity - 1 AI云盘对DeepSeek - R1/11B - 112B模型的支持 |
| 2月24日 | PPD谱新云         | PPD谱新算力云支持了DeepSeek - V3、DeepSeek - R1以及蒸馏模型DeepSeek - R1 - Distill - llama - 7B |
| 2月24日 | 360数字安全       | 360推出“DeepSeek版”安全大模型，发挥其安全大数据优势          |
| 2月24日 | 云轴科技ZStack    | 云轴科技ZStack宣布其Alfresco平台/Stor2Stor全面支持企业私有化部署DeepSeek - R1模型 |
| 2月25日 | 壁仞科技          | 其自主研发的旗戟系列GPU产品正式上线DeepSeek - R1模型推理服务 |