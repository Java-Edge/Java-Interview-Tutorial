先看一段代码
```java

  List<Integer> list = new ArrayList<Integer>();
  list.add(1);
  list.add(2);
  list.add(3);

  Iterator<Integer> it = list.iterator();

  Collections.sort(list);

  while (it.hasNext()) {
   System.out.println(it.next());
  }
```
Java7 运行效果
```java
1
2
3
```
Java8 运行效果 
![](http://upload-images.jianshu.io/upload_images/4685968-dd0b824ef1f2c8e4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#结果分析
在上面的代码中，我们先得到list的iterator，然后对list进行排序，最后遍历iterator。
从Java8的错误信息中可以看出it.next( )方法中检查list是否已经被修改，由于在遍历之前进行了一次排序，所以checkForComodification方法抛出异常ConcurrentModificationException。
这个可以理解，因为排序,肯定会修改list
但是为啥Java7中没问题呢？

#源码分析
首先看checkForComodification方法是如何判断的，如下所示：
```java
final void checkForComodification() {
  if (modCount != expectedModCount)
    throw new ConcurrentModificationException();
}
```
可以看出，有两个内部成员变量用来判断是否发生了修改: modCount 和 expectedModCount。

Iterator中记录了expectedModCount
List中记录了modCount
checkForComodification方法通过比较modCount 和 expectedModCount来判断是否发生了修改。

在Java7中，Collections.sort( list )调用的是Collections自身的sort方法，如下所示：
```java
public static <T extends Comparable<? super T>> void sort(List<T> list) {
   Object[] a = list.toArray();
   Arrays.sort(a);
   ListIterator<T> i = list.listIterator();
   for (int j=0; j<a.length; j++) {
     i.next();
     i.set((T)a[j]);
   }
}
```
可以看出，该排序算法只是改变了List中元素的值（i.set((T)a[j]);），并没有修改modCount字段。所以checkForComodification方法不会抛出异常。

而在Java8中，Collections.sort( list )调用的是ArrayList自身的sort方法，如下所示：

public static <T extends Comparable<? super T>> void sort(List<T> list) {
  list.sort(null);
}
ArrayList的sort方法实现如下：
![](http://upload-images.jianshu.io/upload_images/4685968-cba099d83fb00e29.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
可以看出最后一行，modCount++修改了modCount字段
所以checkForComodification方法会抛出异常

#关于Java8中Collections.sort方法的修改
之前，Collection.sort复制list中的元素以排序到数组中，对数组进行排序，然后使用数组中的元素更新列表，并将默认方法List.sort委托给Collection.sort。这不是一个最佳的设计
从8u20发布起，Collection.sort将被委托给List.sort,这意味着，例如，现有的以ArrayList实例调用Collection.sort的代码将使用由ArrayList实现的最佳排序
 
