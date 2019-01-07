集合类型的自动注入是Spring提供的另外一个强大功能。我们在方便的使用依赖注入的特性时，必须要思考对象从哪里注入、怎么创建、为什么是注入这一个对象的。虽然编写框架的目的是让开发人员无需关心太多底层细节，能专心业务逻辑的开发，但是作为开发人员不能真的无脑去使用框架。
务必学会注入集合等高级用法，让自己有所提升！

现在有一需求：存在多个用户Bean，找出来存储到一个List。
# 1 注入方式
## 1.1 收集方式
多个用户Bean定义：
![](https://img-blog.csdnimg.cn/ac65da5cd0bd43818389f5deab4803e6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

有了集合类型的自动注入后，即可收集零散的用户Bean：
![](https://img-blog.csdnimg.cn/20d0ea3055e348a2860e82ceeca9f36f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

这样即可完成集合类型注入：
![](https://img-blog.csdnimg.cn/1d3ae50349f743738a2d7473936e2a3a.png)


但当持续增加一些user时，可能就不喜欢用上述的注入集合类型了，而是这样：
## 1.2 直接装配方式
![](https://img-blog.csdnimg.cn/b3cf4f059ebe48a2b352ea48b274fe9d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
![](https://img-blog.csdnimg.cn/b1cea2e7b6fb4f7b9ac241002cc2e953.png)

分开玩，大家应该不会有啥问题，若两种方式共存了，会咋样？
运行程序后发现直接装配方式的未生效：
![](https://img-blog.csdnimg.cn/ce05a1948eaa414082d8f18685dfdad1.png)

这是为啥呢？
# 2 源码解析
就得精通这两种注入风格在Spring分别如何实现的。
## 2.1 收集装配
###  DefaultListableBeanFactory#resolveMultipleBeans
```java
private Object resolveMultipleBeans(DependencyDescriptor descriptor, @Nullable String beanName,
      @Nullable Set<String> autowiredBeanNames, @Nullable TypeConverter typeConverter) {
   final Class<?> type = descriptor.getDependencyType();
   if (descriptor instanceof StreamDependencyDescriptor) {
      // 装配stream
      return stream;
   }
   else if (type.isArray()) {
      // 装配数组
      return result;
   }
   else if (Collection.class.isAssignableFrom(type) && type.isInterface()) {
      // 装配集合
      // 获取集合的元素类型
      Class<?> elementType = descriptor.getResolvableType().asCollection().resolveGeneric();
      if (elementType == null) {
         return null;
      }
      // 根据元素类型查找所有的bean
      Map<String, Object> matchingBeans = findAutowireCandidates(beanName, elementType,
            new MultiElementDescriptor(descriptor));
      if (matchingBeans.isEmpty()) {
         return null;
      }
      if (autowiredBeanNames != null) {
         autowiredBeanNames.addAll(matchingBeans.keySet());
      }
      // 转化查到的所有bean放置到集合并返回
      TypeConverter converter = (typeConverter != null ? typeConverter : getTypeConverter());
      Object result = converter.convertIfNecessary(matchingBeans.values(), type);
      // ...
      return result;
   }
   else if (Map.class == type) {
      // 解析map
      return matchingBeans;
   }
   else {
      return null;
   }
}
```
#### 1 获取集合类型的elementType
目标类型定义为List<User> users，所以元素类型为User：
![](https://img-blog.csdnimg.cn/f8d0c4f475bb431ea81cd62c880a34cf.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
#### 2 根据元素类型找出所有Bean
有了elementType，即可据其找出所有Bean：
![](https://img-blog.csdnimg.cn/a2d520efa38749b79dc754c4eccaf158.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

#### 3 将匹配的所有的Bean按目标类型转化
上一步获取的所有的Bean都以`java.util.LinkedHashMap.LinkedValues`存储，和目标类型大不相同，所以最后按需转化。

本案例中，需转化为List：
![](https://img-blog.csdnimg.cn/4fa60adda03b4c9e8ca483a4729d32bf.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
## 2.2 直接装配方式
#### DefaultListableBeanFactory#findAutowireCandidates
不再赘述。

最后就是根据目标类型直接寻找匹配Bean名称为users的`List<user>`装配给userController#users属性。

当同时满足这两种装配方式时，Spring会如何处理呢？
## DefaultListableBeanFactory#doResolveDependency
![](https://img-blog.csdnimg.cn/c644acc0147a4c09adb3c18d3325083b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)
显然这两种装配集合的方式不能同存，结合本案例：
- 当使用收集装配时，能找到任一对应Bean，则返回
- 若一个都没找到，才采用直接装配

所以后期以List方式直接添加的user Bean都不生效！
# 3 修正
务必避免两种方式共存去装配集合！只选用一种方式即可。
比如只使用直接装配：
![](https://img-blog.csdnimg.cn/73198359e18e441ab5c2bbc0337eb2ac.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)只使用收集方式：
![](https://img-blog.csdnimg.cn/16d5c6659cd94bb68a4fad26224cbcf0.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASmF2YUVkZ2Uu,size_20,color_FFFFFF,t_70,g_se,x_16)

如何做到让用户2优先输出呢？
控制spring bean加载顺序：
1. Bean上使用@Order注解，如@Order(2)。数值越小表示优先级越高。默认优先级最低。
2. @DependsOn 使用它，可使得依赖的Bean如果未被初始化会被优先初始化。
3. 添加@Order(number)注解，number越小优先级越高，越靠前
4. 声明user这些Bean时将id=2的user提到id=1之前