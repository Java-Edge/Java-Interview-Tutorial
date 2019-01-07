***@ResponseBody*** 注解与 ***@RequestBody*** 注解类似。 ***@ResponseBody*** 注解可被应用于方法上，标志该方法的返回值将被直接写回到HTTP响应体(Response)中去（而不会被放置到Model中或者被解析为一个视图名）。举个栗子：
```
@RequestMapping(path = "/something", method = RequestMethod.PUT)
@ResponseBody
public String helloWorld() {
   return "Hello World"
}
```
上面的代码结果是文本 Hello World 将被写入HTTP的响应流中。

> 注:Spring MVC的 ***@ResponseBody*** 
> 方法是有风险的，因为它会根据客户的请求——包括URL的路径后缀，来渲染不同的内容类型。因此，禁用后缀模式匹配或者禁用仅为内容协商开启的路径文件后缀名携带，都是防范RFD攻击的有效方式。
