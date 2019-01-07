# 服务降级
- 优先核心服务,非核心服务不可用或弱可用
- 通过HystrixCommand注解指定
- fallbackMethod (回退函数)中具体实现降级逻辑
## Feign Hystrix回退
Hystrix支持回退的概念 : 当电路断开或出现错误时执行的默认代码路径.
要为给定的 `@FeignClient` 启用回退,请将 `fallback` 属性设置为实现回退的类名.
![](https://upload-images.jianshu.io/upload_images/4685968-a0e529ea777453b2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
