在abator中可生成iBatis的代码。其中，Sql_map中带有的两个函数是：

- `updateByPrimaryKeySelective`
只是更新新的model中不为空的字段
- `updateByPrimaryKey`
将为空的字段在数据库中置为NULL

例如
![CartServiceImpl#update](https://upload-images.jianshu.io/upload_images/4685968-5094f0370413dcff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
若DAO中使用的是  `updateByPrimaryKeySelective`，则按照不为空的值去更新。
如果使用`updateByPrimaryKey`，这在未定义的字段更新后就没有了。

#SQL语句对比分析
![](https://upload-images.jianshu.io/upload_images/4685968-256cf17f28f92973.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
一系列的isNull判断
![](https://upload-images.jianshu.io/upload_images/4685968-d8f750d3e5325c24.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

没有判断，直接加载
