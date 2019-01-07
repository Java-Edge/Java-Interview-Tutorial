```
public void testContainsKeyOrValue(){

        Scanner sc = new Scanner(System.in);
        //Key
        System.out.println("请输入要查询的学生id：");
        String id = sc.next();
        System.out.println("你输入的学生id为："+id+",在学生映射表中是否存在"+
            students.containsKey(id));
        if(students.containsKey(id)){
            System.out.println("对应的学生为："+students.get(id).name);
        }

        //Value
        System.out.println("请输入要查询的学生姓名：");
        String name = sc.next();
        if(students.containsValue(new Student(null,name))){
            System.out.println("在学生映射表中，确实包含学生："+name);
        }
        else{
            System.out.println("在学生映射表中不存在这个学生");
        }
    }

```
运行结果： 

```
请输入学生id: 
1 
输入学生姓名以创建学生: 
小明 
成功添加学生:小明 
请输入学生id: 
2 
输入学生姓名以创建学生: 
哈哈 
成功添加学生:哈哈 
请输入学生id: 
3 
输入学生姓名以创建学生: 
极客咯 
成功添加学生:极客咯 
总共有3个学生 
学生：小明 
学生：哈哈 
学生：极客咯 
请输入要查询的学生id： 
2 
你输入的学生id为：2,在学生映射表中是否存在true 
对应的学生为：哈哈 
请输入要查询的学生姓名： 
小明 
在学生映射表中不存在这个学生
```

结果分析： 
可以看到，通过containsKey(Object key)方法比较的结果返回true，是我们想要的结果。通过containsValue(Object value)方法比较的结果返回是false，但是我们确实是有一个名字叫小明的学生啊。为什么呢？

查看containsKey(Object key)和containsValue(Object value)的API说明：

- containsKey(Object key)：Returns true if this map contains a mapping for the specified key. More formally, returns true if and only if this map contains a mapping for a key k such that (key==null ? k==null : key.equals(k)). (There can be at most one such mapping.)
- containsValue(Object value)：Returns true if this map maps one or more keys to the specified value. More formally, returns true if and only if this map contains at least one mapping to a value v such that (value==null ? v==null : value.equals(v)). This operation will probably require time linear in the map size for most implementations of the Map interface.

可以看到，都调用了equals()方法进行比较！因此可以回答为什么了，我们的Key是String类型的，String类型的equals()比较的是字符串本身的内容，所以我们根据键去查找学生的结果是true。而Value是Student类型的，equals()是直接用==实现的，==比较的是对象的引用地址，当然返回结果是false（参考equals()与==的区别与实际应用）。所以，要在Map中通过学生的名字判断是否包含该学生，需要重写equals()方法。
在Student.java中重写equals()方法：

```
@Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        Student other = (Student) obj;
        if (name == null) {
            if (other.name != null)
                return false;
        } else if (!name.equals(other.name))
            return false;
        return true;
    }
```
再次运行，得到运行结果： 
请输入学生id: 
1 
输入学生姓名以创建学生: 
小明 
成功添加学生:小明 
请输入学生id: 
2 
输入学生姓名以创建学生: 
哈哈 
成功添加学生:哈哈 
请输入学生id: 
3 
输入学生姓名以创建学生: 
极客咯 
成功添加学生:极客咯 
总共有3个学生 
学生：小明 
学生：哈哈 
学生：极客咯 
请输入要查询的学生id： 
2 
你输入的学生id为：2,在学生映射表中是否存在true 
对应的学生为：哈哈 
请输入要查询的学生姓名： 
小明 

在学生映射表中，确实包含学生：小明

结果分析： 
通过重写equals()实现了Map中通过学生姓名查找学生对象（containsValue()方法）。
