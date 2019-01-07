我们常使用 JDK 提供的迭代接口进行 Java 集合的迭代。
```java
Iterator iterator = list.iterator();
while (iterator.hasNext()) {
    String string = iterator.next();
    //do something
}
```
迭代可以简单地理解为遍历，是一个标准化遍历各类容器里面的所有对象的方法类。Iterator 模式是用于遍历集合类的标准访问方法。它可以把访问逻辑从不同类型集合类中抽象出来，从而避免向客户端暴露集合内部结构。 

在没有迭代器时，我们都这么处理：
数组处理：
```java
int[] arrays = new int[10];
for(int i = 0 ; i < arrays.length ; i++){
     int a = arrays[i];
     // do sth
}
```
ArrayList处理：
```java
List<String> list = new ArrayList<String>();
for(int i = 0 ; i < list.size() ;  i++){
   String string = list.get(i);
   // do sth
}
```
这些方式，都需要事先知道集合内部结构，访问代码和集合结构本身紧耦合，无法将访问逻辑从集合类和客户端代码中分离。同时每一种集合对应一种遍历方法，客户端代码无法复用。 

实际应用中，若需要将上面将两个集合进行整合，则很麻烦。所以为解决如上问题， Iterator 模式诞生了。
它总是用同一种逻辑遍历集合，从而客户端无需再维护集合内部结构，所有内部状态都由 Iterator 维护。客户端不直接和集合类交互，它只控制 Iterator，向它发送”向前”，”向后”，”取当前元素”的命令，即可实现对客户端透明地遍历整个集合。

# java.util.Iterator
在 Java 中 Iterator 为一个接口，它只提供迭代的基本规则，在 JDK 中他是这样定义的：对 collection 进行迭代的迭代器。
![](https://img-blog.csdnimg.cn/20210627215010751.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

迭代器取代了Java集合框架中的 Enumeration。迭代器与枚举有两点不同：
1. 迭代器允许调用者利用定义良好的语义在迭代期间，从迭代器所指向的 collection 移除元素
2. 优化方法名

其接口定义如下：
![](https://img-blog.csdnimg.cn/20210627215245597.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
```java
Object next()：返回迭代器刚越过的元素的引用，返回值是 Object，需要强制转换成自己需要的类型

boolean hasNext()：判断容器内是否还有可供访问的元素

void remove()：删除迭代器刚越过的元素
```
一般只需使用 next()、hasNext() 即可完成迭代：
```java
for(Iterator it = c.iterator(); it.hasNext(); ) {
 　　Object o = it.next();
 　　 // do sth
}
```
所以Iterator一大优点是无需知道集合内部结构。集合的内部结构、状态都由 Iterator 维护，通过统一的方法 hasNext()、next() 来判断、获取下一个元素，至于具体的内部实现我们就不用关心了。
# 各个集合的 Iterator 实现
ArrayList 的内部实现采用数组，所以我们只需要记录相应位置的索引即可。

## ArrayList 的 Iterator 实现
在 ArrayList 内部首先是定义一个内部类 Itr，该内部类实现 Iterator 接口，如下：
![](https://img-blog.csdnimg.cn/20210703230958705.png)

- ArrayList#iterator() ：返回的是 Itr() 内部类
![](https://img-blog.csdnimg.cn/20210703231158870.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
### 成员变量
在 Itr 内部定义了三个 int 型的变量：
- cursor
下一个元素的索引位置
- lastRet
上一个元素的索引位置
```java
int cursor;             
int lastRet = -1;     
int expectedModCount = modCount;
```
所以lastRet 一直比 cursor 小 1。所以 hasNext() 实现很简单：
![](https://img-blog.csdnimg.cn/20210703231439532.png)
### next()
实现其实也是比较简单，只要返回 cursor 索引位置处的元素即可，然后更新cursor、lastRet ：
```java
public E next() {
    checkForComodification();
    // 记录索引位置
    int i = cursor;
    // 如果获取元素大于集合元素个数，则抛出异常
    if (i >= size)
        throw new NoSuchElementException();
    Object[] elementData = ArrayList.this.elementData;
    if (i >= elementData.length)
        throw new ConcurrentModificationException();
    // cursor + 1    
    cursor = i + 1;
    // lastRet + 1 且返回cursor处元素
    return (E) elementData[lastRet = i];
}   
```
checkForComodification() 主要判断集合的修改次数是否合法，即判断遍历过程中集合是否被修改过。
modCount 用于记录 ArrayList 集合的修改次数，初始化为 0。每当集合被修改一次（结构上面的修改，内部update不算），如 add、remove 等方法，modCount + 1。
所以若 modCount 不变，则表示集合内容未被修改。该机制主要用于实现 ArrayList 集合的快速失败机制。所以要保证在遍历过程中不出错误，我们就应该保证在遍历过程中不会对集合产生结构上的修改（当然 remove 方法除外），出现了异常错误，我们就应该认真检查程序是否出错而不是 catch 后不做处理。
![](https://img-blog.csdnimg.cn/20210703233049909.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
### remove() 
调用 ArrayList 本身的 remove() 方法删除 lastRet 位置元素，然后修改 modCount 即可。
![](https://img-blog.csdnimg.cn/20210703233234428.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- SubList.this#remove(lastRet)
![](https://img-blog.csdnimg.cn/20210703233837589.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
- ArrayList#remove
![](https://img-blog.csdnimg.cn/20210703233933396.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)