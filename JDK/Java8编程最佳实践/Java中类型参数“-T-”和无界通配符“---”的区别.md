首先要区分开两种不同的场景：
- 声明一个泛型类或泛型方法
类型参数“<T>”主要用于第一种，声明泛型类或泛型方法
- 使用泛型类或泛型方法
无界通配符“<?>”主要用于第二种，使用泛型类或泛型方法

# 1  <T>声明泛型类的类型参数
List<T>最应该出现的地方，应该是定义一个泛型List容器
但List是库里自带的容器，看看ArrayList的源码头一行：
![](https://upload-images.jianshu.io/upload_images/4685968-84ea03662073cea7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
ArrayList<E>中的“E”也是类型参数。只是表示容器中元素Element的时候，习惯用“E”
换一个简单的例子，我们自己定义一个新泛型容器叫Box<T>。
```
class Box<T>{
    private T item1;
    private T item2;
}
```
为什么这里要用类型参数？因为这是一种”约束“，为了保证Box里的item1, item2都是同一个类型T。Box<String>，代表两个item都是String。Box<Integer>里两个item都是Integer。

List容器库里都帮我们写好了，所以我们是不会去定义List<T>的

那什么时候会出现List<T>
要么是作为泛型类的成员字段或成员方法的参数间接出现。还是刚才Box<T>的例子，
```
class Box<T>{
    private List<T> item;
    public List<T> get(){return item;}
    public void set(List<T> t){item=t;}
}
```
现在Box类里有三个地方出现了List<T>：
- 成员字段item的类型
- get( )方法的返回值
- set( )方法的参数

这里写成List<T>为了表示和Box<T>类型参数保持一致
# 2 <T>声明泛型方法
另外一种会出现List<T>的地方是泛型方法
比如Function类的reduce是个静态泛型方法，负责对列表里的所有元素求和
这里的List<T>出现在参数，函数返回值和函数内部，也是为了保持泛型类型的一致性
```
class Fuction{
    public static <T> List<T> reduce(List<T> list){
        //...do something
    }
}
```
# 3  声明泛型类不能用无界通配符<?>
反观List<?>，首先要明确`通配符不能拿来声明泛型`
像下面这样用通配符"?"来表示类型参数的约束是不行的
![Error Example](https://upload-images.jianshu.io/upload_images/4685968-ffe6bcebda2d1168.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
通配符是拿来使用定义好的泛型的
比如用<?>声明List容器的变量类型，然后用一个实例对象给它赋值的时候就比较灵活。
![](https://upload-images.jianshu.io/upload_images/4685968-b0642daae444a300.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 4 <?>的坑
List<?>这个写法非常坑。因为，这时候通配符会捕获具体的String类型，但编译器不叫它String，而是起个临时的代号，比如”capture#1“
所以以后再也不能往list里存任何元素，包括String,唯一能存的就是null
![](https://upload-images.jianshu.io/upload_images/4685968-7f914a83dbef3b07.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-973e44c8d7a90e88.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
另外如果拿List<?>做参数，也会有奇妙的事情发生。还是刚才Box<T>的例子，有get()和set()两个方法，一个存，一个取。
![](https://upload-images.jianshu.io/upload_images/4685968-1ae09c9e4b5cfdb0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
新的getSet()方法，只是把item先用get()方法读出来，然后再用set()方法存回去。按理说不可能有问题。实际运行却会报错。
```
error: incompatible types: Object cannot be converted to capture#1
```
原因和前面一样，通配符box<?>.set()的参数类型被编译器捕获，命名为capture#1，和box<?>.get()返回的Object对象无法匹配

解决方法，是要给getSet()方法写一个辅助函数
![](https://upload-images.jianshu.io/upload_images/4685968-7e4ad9a8b84347bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 5. 有界通配符<? extends XXX>，<? super XXX>
实际更常用的是<? extends XXX>或者<? super XXX>两种，带有上下界的通配符
