# SpringBoot统一异常处理流程

Spring 3.2新增**@ControllerAdvice** 注解用于定义

- @ExceptionHandler
- @InitBinder
- @ModelAttribute

并应用到所有@RequestMapping。

## 1 BasicErrorController

SpringBoot内置BasicErrorController对异常进行统一处理，当页面异常时，自动把请求转到/error(Spring Boot提供默认映射) ，可自定义页面内容，只需在classpath路径新建error页面。也可自定义error页路径， 如：

```java
server.error.path=/custom/error
```

BasicErrorController提供两种返回错误：

- 页面返回、当你是页面请求的时候就会返回页面
- json请求时，就会返回json错误

## 2  全局异常处理类：并用@ControllerAdvice注解

在Spring Boot中，全局异常处理可以通过使用`@ControllerAdvice`注解结合`@ExceptionHandler`来实现。下面是一个简单的例子：

1. **全局异常处理类**：

```java
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class GlobalExceptionHandler {

    // 返回视图的异常处理
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String defaultErrorHandler(Exception e, Model model) {
        model.addAttribute("error", e.getMessage());
        return "error"; // 这里可以指定你的错误视图页面
    }

    // 返回JSON的异常处理
    @ExceptionHandler(ApiException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public @ResponseBody Map<String, Object> jsonErrorHandler(ApiException e) {
        Map<String, Object> result = new HashMap<>();
        result.put("error", e.getMessage());
        return result;
    }
}
```

2. **自定义异常类**（示例）：

```java
public class ApiException extends RuntimeException {

    public ApiException(String message) {
        super(message);
    }
}
```

在这个例子中，`defaultErrorHandler`方法用于处理返回视图的异常，将异常信息放入`Model`中，并返回指定的错误视图页面。而`jsonErrorHandler`方法用于处理返回JSON的异常，返回一个包含错误信息的`Map`，通过`@ResponseBody`注解确保返回的是JSON数据。

请注意，具体的异常处理方法可以根据实际需求进行定制，可以处理不同类型的异常，并返回相应的视图或JSON数据。

- 返回视图，新建方法defaultErrorHandler，用@ExceptionHandler注解

- 返回JSON，须用jsonErrorHandler 用@ExceptionHandler和@ResponseBody 注解

## 3 自定义异常类

继承Exception（或RuntimeException）：

```java
package com.javaedge.common.exception;

import com.javaedge.common.constant.SystemConstant;
import lombok.Getter;

/**
 * 自定义异常
 */
@Getter
public class BizException extends RuntimeException {
    /**
     * 错误码
     */
    protected int errorCode;
    /**
     * 错误信息
     */
    protected String errorMsg;

    public BizException() {
        super(SystemConstant.FAIL_MSG);
        this.errorCode = SystemConstant.DEFAULT_FAIL_CODE;
        this.errorMsg = SystemConstant.FAIL_MSG;
    }

    public BizException(String errorMsg) {
        super(errorMsg);
        this.errorCode = SystemConstant.DEFAULT_FAIL_CODE;
        this.errorMsg = errorMsg;
    }

    public BizException(CommonError commonError) {
        super(commonError.getMessage());
        this.errorCode = commonError.getCode();
        this.errorMsg = commonError.getMessage();
    }

    public BizException(int code , String msg) {
        this.errorCode = code;
        this.errorMsg = msg;
    }

    @Override
    public Throwable fillInStackTrace() {
        return this;
    }
}

```

页面：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>服务器错误</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      font-size: 1.5em;
      color: #f00;
    }
  </style>
</head>
<body>
  <h1>服务器错误</h1>
  <p>非常抱歉，我们的服务器遇到了问题，无法完成您的请求。请稍后重试或联系网站管理员。</p>
</body>
</html>
```

若全部异常处理返回json，可用 **@RestControllerAdvice** 代替 **@ControllerAdvice** ，方法上就可不添加 **@ResponseBody**。

## 总结



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/06/71b47b0bb2e31669aad13aaa924f17b8.png)