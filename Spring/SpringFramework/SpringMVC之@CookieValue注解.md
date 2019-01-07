#使用**@CookieValue**注解映射**cookie**值
***@CookieValue*** 注解能将一个方法参数与一个**HTTP cookie**的值进行绑定,即可自动解析cookie。
看一个这样的场景：以下的这个cookie存储在一个HTTP请求中：

```
	t=4CBCBDA72BB84FC8BE0515344C6FDF46
```

下面的代码演示了拿到 t 这个cookie值的方法：
定义@RequestMapping注解的处理方法

```
    @RequestMapping(path = "/logout/", method = {RequestMethod.GET, RequestMethod.POST})
    @ResponseBody
    public String logout(@CookieValue("ticket") String ticket) {
        userService.logout(ticket);
        return "redirect:/";
    }
```
若注解的目标方法参数不是 String 类型，则类型转换会自动进行
这个注解可以注解到处理器方法上，在Servlet环境和Portlet环境都能使用。
