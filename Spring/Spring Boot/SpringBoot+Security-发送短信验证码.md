#在core模块下properties包中创建SmsCodeProperties
![](https://upload-images.jianshu.io/upload_images/4685968-46c982a0460868e5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#在ValidateCodeProperties中new一个SmsCodeProperties对象，并实现getter、setter方法
![](https://upload-images.jianshu.io/upload_images/4685968-0557bfffe3b274ba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#在core模块下validate包中创建SmsCodeGenerator实现ValidateCodeGenerator接口

#创建SmsCodeSender接口，定义发送短信的抽象方法
![](https://upload-images.jianshu.io/upload_images/4685968-0efa986e2ff67784.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
实现SmsCodeSender接口
![](https://upload-images.jianshu.io/upload_images/4685968-342dfb15f354e35b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在ValidateCodeBeanConfig中把SmsCodeSenderImpl注入到容器中
![](https://upload-images.jianshu.io/upload_images/4685968-3e1b6cd36d038543.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
