# 1 key设计
![](https://upload-images.jianshu.io/upload_images/4685968-15eb9ce3be0894bb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-30588bd3bc353ffc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
看看这个

 embstr 是啥,即内部编码
![](https://upload-images.jianshu.io/upload_images/4685968-35565cd6182a7b83.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f2f8842275bd988a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-994e5c32b3b0ef3d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e2781a574b1c4db3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 value 设计
![value 设计](https://upload-images.jianshu.io/upload_images/4685968-73990c79faa70710.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![bigkey](https://upload-images.jianshu.io/upload_images/4685968-40cd901f5d753eec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![bigkey 的危害](https://upload-images.jianshu.io/upload_images/4685968-bb8247c4aa04f744.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![网络阻塞](https://upload-images.jianshu.io/upload_images/4685968-050ff3940c783ef0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![慢查询](https://upload-images.jianshu.io/upload_images/4685968-50f0adc71f3c40a4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![节点数据不均衡](https://upload-images.jianshu.io/upload_images/4685968-1ec5da41137588f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![反序列消耗](https://upload-images.jianshu.io/upload_images/4685968-42b68c07d0b961b8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![发现 bigkey](https://upload-images.jianshu.io/upload_images/4685968-2ba5991d4d1b1f83.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![应用方发现](https://upload-images.jianshu.io/upload_images/4685968-f4b4f3b45f81c911.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![redis-cli bigkeys](https://upload-images.jianshu.io/upload_images/4685968-0a59469d6afdd569.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![scan + debug object](https://upload-images.jianshu.io/upload_images/4685968-ccefba442ed405fb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![主动报警](https://upload-images.jianshu.io/upload_images/4685968-456c3d32e0fb27e5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![内核统计](https://upload-images.jianshu.io/upload_images/4685968-9fd7d6211a6d57d2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 3 发现 bigkey 的方法
![bigkey 发现](https://upload-images.jianshu.io/upload_images/4685968-4e6f277f32c23e89.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![应用方发现](https://upload-images.jianshu.io/upload_images/4685968-96f4dd1d891978b8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![redis-cli bigkeys](https://upload-images.jianshu.io/upload_images/4685968-e548f1c340e3c7ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4a2079a1ddd8ac35.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ec0a875721fab8f6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4702b1e354c6142e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![scan + debug object](https://upload-images.jianshu.io/upload_images/4685968-7c8436e513c4aaef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![主动报警](https://upload-images.jianshu.io/upload_images/4685968-38a57e2f1fedfc62.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![内核统计](https://upload-images.jianshu.io/upload_images/4685968-8b590f89279646bf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 4 bigkey 删除
![](https://upload-images.jianshu.io/upload_images/4685968-7d39d728a87084d6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![bigkey 删除-Java](https://upload-images.jianshu.io/upload_images/4685968-f623b494a4552c4f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![bigkey 预防](https://upload-images.jianshu.io/upload_images/4685968-a693df8a5e403842.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![总结](https://upload-images.jianshu.io/upload_images/4685968-24d85b543ccde862.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 5 选择合适的数据结构
![](https://upload-images.jianshu.io/upload_images/4685968-58a9bd47344c432f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![一个例子,三种方案](https://upload-images.jianshu.io/upload_images/4685968-e63037fd94130701.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![方案一](https://upload-images.jianshu.io/upload_images/4685968-9fe926e534ddcf0d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![方案二](https://upload-images.jianshu.io/upload_images/4685968-3b9246295a71fce9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![方案三](https://upload-images.jianshu.io/upload_images/4685968-eb1b2fea4328d34c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![三种方案的内存对比](https://upload-images.jianshu.io/upload_images/4685968-45182e36a5e70292.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![三种方案内存分析](https://upload-images.jianshu.io/upload_images/4685968-667e9b962b11f8de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![三种方案优缺点对比](https://upload-images.jianshu.io/upload_images/4685968-e29431c39961aaad.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 6 键值的生命周期的管理
![](https://upload-images.jianshu.io/upload_images/4685968-9e7bd8cf180fcef1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 7 命令使用技巧
![](https://upload-images.jianshu.io/upload_images/4685968-2cb9dca6b5fbb120.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-6e9219854f173559.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c5b65bfa60a62b1a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c7a3b4b6f8a4aecc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e744577f496780d5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9308dd16f97087ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 8 Java客户端优化
![](https://upload-images.jianshu.io/upload_images/4685968-480f951542617d85.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a898e7ea1e0262cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 9 连接池参数说明
![](https://upload-images.jianshu.io/upload_images/4685968-4a4a3882717446aa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c1daed423182e395.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![如何预估最大连接池](https://upload-images.jianshu.io/upload_images/4685968-7916147af4cc2652.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d57a28f47cb7f53a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


