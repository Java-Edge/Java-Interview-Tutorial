# 迭代器模式

## 1 概念

### 1.1 定义

行为型，Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.（它提供一种方法访问一个容器对象中各个元素，而又不需暴露该对象的内部细节。）

基本不会有人业务开发使用的模式，没人会单独写一个迭代器，除非是产品性质的开发。迭代器是为容器服务的，如Collection、Map，迭代器模式就是为解决遍历这些容器中的元素。

迭代器模式的通用类图：

![](https://p.ipic.vip/73x0w7.png)

容器只要负责新增、移除元素即可，遍历由迭代器进行。

### 1.2 角色

#### Iterator抽象迭代器

定义访问和遍历元素的接口，基本固定的3个方法：

  - hasNext()，是否已访问到底部
  - next()，访问下一个元素
  - remove，从基础集合中删除该迭代器返回的最后一个元素（可选操作）。此方法只能调用一次，每个next一次。

```java
public interface Iterator<E> {

  boolean hasNext();

  E next();

  default void remove() {
      throw new UnsupportedOperationException("remove");
  }

  default void forEachRemaining(Consumer<? super E> action) {
      Objects.requireNonNull(action);
      while (hasNext())
          action.accept(next());
  }
}
```

#### ConcreteIterator具体迭代器

实现迭代器接口，完成容器元素的遍历。

```java
public class ConcreteIterator implements Iterator {
     private Vector vector = new Vector();
     // 定义当前游标
     public int cursor = 0;
     @SuppressWarnings("unchecked")
     public ConcreteIterator(Vector _vector){
             this.vector = _vector;
     }

     // 判断是否到达尾部
     public boolean hasNext() {
             if(this.cursor == this.vector.size()){
                    return false;
             }else{
                    return true;
             }
     }

     // 返回下一个元素
     public Object next() {
             Object result = null;
             if(this.hasNext()){
                    result = this.vector.get(this.cursor++);
             }else{
                    result = null;
             }
             return result;
     }

     // 删除当前元素
     public boolean remove() {
             this.vector.remove(this.cursor);
             return true;
     }
}
```

#### Aggregate抽象容器

提供创建具体迭代器角色的接口，必然提供一个类似createIterator()这样的方法，在Java中一般是iterator()方法。

```java
public interface Aggregate {
     //是容器必然有元素的增加
     public void add(Object object);
     //减少元素
     public void remove(Object object);
     //由迭代器来遍历所有的元素
     public Iterator iterator();
}
```

#### Concrete Aggregate具体容器

实现容器接口定义的方法，创建出容纳迭代器的对象。

```java
public class ConcreteAggregate implements Aggregate {
     //容纳对象的容器
     private Vector vector = new Vector();
     //增加一个元素
     public void add(Object object) {
             this.vector.add(object);
     }
     //返回迭代器对象
     public Iterator iterator() {
             return new ConcreteIterator(this.vector);
     }
     //删除一个元素
     public void remove(Object object) {
             this.remove(object);
     }
}
```

开发系统时，迭代器的删除方法应该完成两个逻辑：

- 删除当前元素
- 当前游标指向下一个元素

### 1.3 场景类

```java
public class Client {
     public static void main(String[] args) {
             //声明出容器
             Aggregate agg = new ConcreteAggregate();
             //产生对象数据放进去
             agg.add("abc");
             agg.add("aaa");
             agg.add("1234");     
             //遍历一下
             Iterator iterator = agg.iterator();
             while(iterator.hasNext()){
                     System.out.println(iterator.next());
             }
     }
}
```

简单地说，迭代器就类似于一个数据库中的游标，可以在一个容器内上下翻滚，遍历所有它需要查看的元素。

## 2 适用场景

- 访问一个集合对象的内容而无需暴露它的内部表示
- 为遍历不同的集合结构提供一个统一的接口

案例使用了迭代器模式，为啥使原本简单应用变复杂？因为我们在简单的应用中使用迭代器，注意到：

```java
for(IProject project:projectList)
```

它为啥能运行？不是因为ArrayList已实现iterator()方法，我们才能如此简单应用。

JDK 1.2新增

### 2.1 java.util.Iterator接口

并逐步把Iterator应用到各集合类（Collection），JDK 1.5有个java.util.Iterable接口，多少接口继承了它？

BlockingQueue、Collection、List、Queue、Set和SortedSet

它多少个实现类？

AbstractCollection,AbstractList,AbstractQueue,AbstractSequentialList,AbstractSet,ArrayBlockingQueue,ArrayList,AttributeList,BeanContextServicesSupport,BeanContextSupport,ConcurrentLinkedQueue,CopyOnWriteArrayList,CopyOnWriteArraySet,DelayQueue,EnumSet,HashSet,JobStateReasons,LinkedBlockingQueue,LinkedHashSet,LinkedList,PriorityBlockingQueue,PriorityQueue,RoleList,RoleUnresolvedList,Stack,SynchronousQueue,TreeSet,Vector

基本常用类都在这个表，正因迭代器模式已内置到基本API，才能如此轻松、便捷使用。

### 2.2 Iterable接口

java.util.Iterable接口1.8前只有一个方法：

```java
public interface Iterable<T> {
    /**
     * Returns an iterator over elements of type {@code T}.
     *
     * @return an Iterator.
     */
    Iterator<T> iterator();
  
 		...
}
```

即通过iterator()去遍历聚集类中的所有方法或属性，Java已将迭代器备好，我们再去写迭代器，就多余了，少有项目独立写迭代器。

## 3 优点

分离了集合对象的遍历行为

## 4 缺点

类的个数成对增加

### 实例

现在还在开发或者维护的几百个项目，信息很乱，能否先把这些项目最新情况重新打印一份给我？

项目信息类图：

![](https://i-blog.csdnimg.cn/blog_migrate/d410cad7bac8a06a9baf4929e41ba82a.png)

- 项目信息接口

```java
public interface IProject {
     // 从老板这里看到的就是项目信息
     public String getProjectInfo();
}
```

- 项目信息的实现

```java
public class Project implements IProject {
     //项目名称
     private String name = "";
     //项目成员数量
     private int num = 0;
     //项目费用
     private int cost = 0;
     //定义一个构造函数，把所有老板需要看到的信息存储起来
     public Project(String name,int num,int cost){
             //赋值到类的成员变量中
             this.name = name;
             this.num = num;
             this.cost=cost;
     }
     //得到项目的信息
     public String getProjectInfo() {
             String info = "";
             //获得项目的名称
             info = info+ "项目名称是：" + [this.name](http://this.name/);
             //获得项目人数
             info = info + "\t项目人数: "+ this.num;
             //项目费用
             info = info+ "\t 项目费用："+ this.cost;
             return info;
     }
}
```

通过构造函数把要显示的数据传递过来，然后放到getProjectInfo中显示

- 报表的场景

```java
public class Boss {
             public static void main(String[] args) {
                     //定义一个List，存放所有的项目对象
                     ArrayList projectList = new ArrayList();
                     //增加星球大战项目
                     projectList.add(new Project("星球大战项目",10,100000));
                     //增加扭转时空项目
                     projectList.add(new Project("扭转时空项目",100,10000000));
                     //增加超人改造项目
                     projectList.add(new Project("超人改造项目",10000,1000000000));
                     //这边100个项目
                     for(int i=4;i<104;i++){
                             projectList.add(new Project("第"+i+"个项目",i*5,i*1000000));
                     }
                     //遍历一下ArrayList，把所有的数据都取出
                     for(IProject project:projectList){
             System.out.println(project.getProjectInfo());
                                        }
             }
}
```

然后看一下我们的运行结果，如下所示：
![](https://i-blog.csdnimg.cn/blog_migrate/2c6a45e64ddb14f2b32b954d3cc30c31.png)

又看了一遍程序,应该还有另外一种实现方式，因为是遍历嘛，让我想到的就是Java的迭代器接口java.util.iterator，它的作用就是遍历Collection集合下的元素，那我们的程序还可以有另外一种实现，通过实现iterator接口来实现遍历

![增加迭代接口的类图](https://i-blog.csdnimg.cn/blog_migrate/52be9b4902619bcb12219c0efe7e864c.png)

看着是不是复杂了很多？是的，是有点复杂了，是不是我们把简单的事情复杂化了？
我们先分析一下我们的类图java.util.Iterator接口中声明了三个方法，这是JDK定义的， ProjectIterator 实现该接口，并且聚合了Project对象，也就是把Project对象作为本对象的成员变量使用。看类图还不是很清晰，我们一起看一下代码，先看IProject接口的改变

- 项目信息接口

```java
public interface IProject {
     //增加项目
     public void add(String name,int num,int cost);
     //从老板这里看到的就是项目信息
     public String getProjectInfo();
     //获得一个可以被遍历的对象
     public IProjectIterator iterator();
}
```

这里多了两个方法，一个是add方法，这个方法是增加项目，也就是说产生了一个对象后，直接使用add方法增加项目信息。我们再来看其实现类

- 项目信息

```java
public class Project implements IProject {
     //定义一个项目列表，说有的项目都放在这里
     private ArrayList projectList = new ArrayList();
     //项目名称
     private String name = "";
     //项目成员数量
     private int num = 0;
     //项目费用
     private int cost = 0;
     public Project(){

     }
     //定义一个构造函数，把所有老板需要看到的信息存储起来
     private Project(String name,int num,int cost){
             //赋值到类的成员变量中
             [this.name](http://this.name/) = name;
             this.num = num;
             this.cost=cost;
     }
     //增加项目
     public void add(String name,int num,int cost){
             this.projectList.add(new Project(name,num,cost));
     }
     //得到项目的信息
     public String getProjectInfo() {
             String info = "";
             //获得项目的名称
             info = info+ "项目名称是：" + [this.name](http://this.name/);
             //获得项目人数
             info = info + "\t项目人数: "+ this.num;
             //项目费用
             info = info+ "\t 项目费用："+ this.cost;
             return info;
     }
     //产生一个遍历对象
     public IProjectIterator iterator(){
             return new ProjectIterator(this.projectList);
     }
}
```

通过构造函数，传递了一个项目所必需的信息，然后通过iterator()方法，把所有项目都返回到一个迭代器中。Iterator()方法看不懂不要紧，继续向下阅读。再看IProjectIterator接口

- 项目迭代器接口

```java
public interface IProjectIterator extends Iterator {
}
```

大家可能对该接口感觉很奇怪，你定义的这个接口方法、变量都没有，有什么意义呢？有意义，所有的Java书上都会说要面向接口编程，你的接口是对一个事物的描述，也就是说我通过接口就知道这个事物有哪些方法，哪些属性，我们这里的IProjectIterator是要建立一个指向Project类的迭代器，目前暂时定义的就是一个通用的迭代器，可能以后会增加IProjectIterator的一些属性或者方法。当然了，你也可以在实现类上实现两个接口，一个是Iterator,一个是IProjectIterator（这时候，这个接口就不用继承Iterator），杀猪杀尾巴，各有各的杀法。
`如果我要实现一个容器或者其他API提供接口时，我一般都自己先写一个接口继承，然后再继承自己写的接口，保证自己的实现类只用实现自己写的接口（接口传递，当然也要实现顶层的接口）`
我们继续看迭代器的实现类

- 项目迭代器

```java
public class ProjectIterator implements IProjectIterator {
     //所有的项目都放在ArrayList中
     private ArrayList projectList = new ArrayList();
     private int currentItem = 0; 
     //构造函数传入projectList
     public ProjectIterator(ArrayList projectList){
             this.projectList = projectList;
     }
     //判断是否还有元素，必须实现
     public boolean hasNext() {
             //定义一个返回值
             boolean b = true;
             if(this.currentItem>=projectList.size()||this.projectList.get(this.currentItem)==null){
                  b =false;
          }
             return b;
     }
     //取得下一个值
     public IProject next() {
             return (IProject)this.projectList.get(this.currentItem++);
     }
     //删除一个对象
     public void remove() {
             //暂时没有使用到
     }
}
```

细心的读者可能会从代码中发现一个问题，java.util.iterator接口中定义next()方法的返回值类型是E，而你在ProjectIterator中返回值却是IProject，E和IProject有什么关系？

E是JDK 1.5中定义的新类型：元素（Element），是一个泛型符号，表示一个类型，具体什么类型是在实现或运行时决定，总之它代表的是一种类型，你在这个实现类中把它定义为ProjectIterator，在另外一个实现类可以把它定义为String，都没有问题。它与Object这个类可是不同的，Object是所有类的父类，随便一个类你都可以把它向上转型到Object类，也只是因为它是所有类的父类，它才是一个通用类，而E是一个符号，代表所有的类，当然也代表Object了。

都写完毕了，看看我们的Boss类有多少改动

- 老板看报表

```java
public class Boss {
             public static void main(String[] args) {
                     //定义一个List，存放所有的项目对象
                     IProject project = new Project();
                     //增加星球大战项目
                     project.add("星球大战项目ddddd",10,100000);
                     //增加扭转时空项目
                     project.add("扭转时空项目",100,10000000);
                     //增加超人改造项目
                     project.add("超人改造项目",10000,1000000000);
                     //这边100个项目
                     for(int i=4;i<104;i++){
                             project.add("第"+i+"个项目",i*5,i*1000000);
                     }
                     //遍历一下ArrayList，把所有的数据都取出
                     IProjectIterator projectIterator = project.iterator();
                     while(projectIterator.hasNext()){
                             IProject p = (IProject)projectIterator.next();
                             System.out.println(p.getProjectInfo());
                     }
             }
}
```

运行结果如下所示：

![](https://p.ipic.vip/vrrgkx.png)

## 5 Coding



![](https://p.ipic.vip/ab3wl8.png)

```java
@Data
public class Course {

    private String name;
}

```

```    java
public interface CourseIterator {

    Course nextCourse();

    boolean isLastCourse();
}
```

```java
public class CourseIteratorImpl implements CourseIterator {
    private List courseList;
    private int position;
    Course course;

    public CourseIteratorImpl(List courseList) {
        this.courseList = courseList;
    }

    @Override
    public Course nextCourse() {
        System.out.println("返回课程,位置是: " + position);
        course = (Course) courseList.get(position);
        position++;
        return course;
    }

    @Override
    public boolean isLastCourse() {
        if (position < courseList.size()) {
            return false;
        }
        return true;
    }
}
```

```java
public interface CourseAggregate {

    void addCourse(Course course);

    void removeCourse(Course course);

    CourseIterator getCourseIterator();
}
```

```java
public class CourseAggregateImpl implements CourseAggregate {

    private List courseList;

    public CourseAggregateImpl() {
        this.courseList = new ArrayList();
    }

    @Override
    public void addCourse(Course course) {
        courseList.add(course);
    }

    @Override
    public void removeCourse(Course course) {
        courseList.remove(course);
    }

    @Override
    public CourseIterator getCourseIterator() {
        return new CourseIteratorImpl(courseList);
    }
}
```

```java
public class Test {

    public static void main(String[] args) {
        Course course1 = new Course("Java课程");
        Course course2 = new Course("Python课程");
        Course course3 = new Course("前端课程");
        Course course4 = new Course("大数据课程");
        Course course5 = new Course(" AI课程");
        Course course6 = new Course("PHP课程");

        CourseAggregate courseAggregate = new CourseAggregateImpl();
        courseAggregate.addCourse(course1);
        courseAggregate.addCourse(course2);
        courseAggregate.addCourse(course3);
        courseAggregate.addCourse(course4);
        courseAggregate.addCourse(course5);
        courseAggregate.addCourse(course6);

        System.out.println("-----课程列表-----");
        printCourses(courseAggregate);
        courseAggregate.removeCourse(course4);
        courseAggregate.removeCourse(course5);
        System.out.println("-----删除操作之后的课程列表-----");
        printCourses(courseAggregate);
    }

    private static void printCourses(CourseAggregate courseAggregate) {
        CourseIterator courseIterator = courseAggregate.getCourseIterator();
        while (!courseIterator.isLastCourse()) {
            Course course = courseIterator.nextCourse();
            System.out.println(course.getName());
        }
    }
}
```

## 6 MyBatis中的应用

```java
package org.apache.ibatis.cursor.defaults;

public class DefaultCursor<T> implements Cursor<T> {

    private final CursorIterator cursorIterator = new CursorIterator();
  
    @Override
    public Iterator<T> iterator() {
        if (iteratorRetrieved) {
            throw new IllegalStateException("Cannot open more than one iterator on a Cursor");
        }
        iteratorRetrieved = true;
        return cursorIterator;
    }
  	...
}
```

## 7 最佳实践

别自己实现迭代器模式！