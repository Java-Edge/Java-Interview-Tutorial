# 1 简介
## 1.1 定义
封装某些作用于某种数据结构中各元素的操作，它可以在不改变数据结构的前提下定义作用于这些数据元素的新的操作

## 思想
将数据结构和数据操作分离

## 目的
稳定的数据结构和易变的操作的解耦

## 适用场景
假如一个对象中存在着一些与本对象不相干（或者关系较弱）的操作，可以使用访问者模式把这些操作封装到访问者中去，这样便避免了这些不相干的操作污染这个对象。

假如一组对象中，存在着相似的操作，可以将这些相似的操作封装到访问者中去，这样便避免了出现大量重复的代码

访问者模式适用于对功能已经确定的项目进行重构的时候适用，因为功能已经确定，元素类的数据结构也基本不会变了；如果是一个新的正在开发中的项目，在访问者模式中，每一个元素类都有它对应的处理方法，每增加一个元素类都需要修改访问者类，修改起来相当麻烦。

# 2  示例
如果老师教学反馈得分大于等于85分、学生成绩大于等于90分，则可以入选成绩优秀奖；如果老师论文数目大于8、学生论文数目大于2，则可以入选科研优秀奖。

在这个例子中，老师和学生就是Element，他们的数据结构稳定不变。从上面的描述中，我们发现，对数据结构的操作是多变的，一会儿评选成绩，一会儿评选科研，这样就适合使用访问者模式来分离数据结构和操作。

## 2.1 创建抽象元素

```java
public interface Element {
    void accept(Visitor visitor);
}
```

## 2.2 创建具体元素
创建两个具体元素 Student 和 Teacher，分别实现 Element 接口

```java
public class Student implements Element {
    private String name;
    private int grade;
    private int paperCount;

    public Student(String name, int grade, int paperCount) {
        this.name = name;
        this.grade = grade;
        this.paperCount = paperCount;
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }
        
    ......
      
}
public class Teacher implements Element {
    private String name;
    private int score;
    private int paperCount;

    public Teacher(String name, int score, int paperCount) {
        this.name = name;
        this.score = score;
        this.paperCount = paperCount;
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }

        ......
      
}
```

## 2.3 创建抽象访问者

```java
public interface Visitor {

    void visit(Student student);

    void visit(Teacher teacher);
}
```

## 2.4 创建具体访问者
创建一个根据分数评比的具体访问者 GradeSelection，实现 Visitor 接口

```java
public class GradeSelection implements Visitor {

    @Override
    public void visit(Student student) {
        if (student != null && student.getGrade() >= 90) {
            System.out.println(student.getName() + "的分数是" + student.getGrade() + "，荣获了成绩优秀奖。");
        }
    }

    @Override
    public void visit(Teacher teacher) {
        if (teacher != null && teacher.getScore() >= 85) {
            System.out.println(teacher.getName() + "的分数是" + teacher.getScore() + "，荣获了成绩优秀奖。");
        }
    }
}
```

## 2.5  调用

```java
public class VisitorClient {

    public static void main(String[] args) {
    	// 抽象元素 => 具体元素
        Element element = new Student("lijiankun24", 90, 3);
		// 抽象访问者 => 具体访问者
        Visitor visitor = new GradeSelection();
        // 具体元素 接收 具体访问者的访问
        element.accept(visitor);
    }
}
```

上述代码即是一个简单的访问者模式的示例代码，输出如下所示：


上述代码可以分为三步：
1. 创建一个元素类的对象
2. 创建一个访问类的对象
3. 元素对象通过 Element#accept(Visitor visitor) 方法传入访问者对象

# 3 ASM 中的访问者模式
ASM 库就是 Visitor 模式的典型应用。

## 3.1 ASM 中几个重要的类
- ClassReader
将字节数组或者 class 文件读入到内存当中，并以树的数据结构表示，树中的一个节点代表着 class 文件中的某个区域
可以将 ClassReader 看作是 Visitor 模式中的访问者的实现类

- ClassVisitor（抽象类）
ClassReader 对象创建之后，调用 ClassReader#accept() 方法，传入一个 ClassVisitor 对象。在 ClassReader 中遍历树结构的不同节点时会调用 ClassVisitor 对象中不同的 visit() 方法，从而实现对字节码的修改。在 ClassVisitor 中的一些访问会产生子过程，比如 visitMethod 会产生 MethodVisitor 的调用，visitField 会产生对 FieldVisitor 的调用，用户也可以对这些 Visitor 进行自己的实现，从而达到对这些子节点的字节码的访问和修改。
在 ASM 的访问者模式中，用户还可以提供多种不同操作的 ClassVisitor 的实现，并以责任链的模式提供给 ClassReader 来使用，而 ClassReader 只需要 accept 责任链中的头节点处的 ClassVisitor。
- ClassWriter
ClassVisitor 的实现类，它是生成字节码的工具类，它一般是责任链中的最后一个节点，其之前的每一个 ClassVisitor 都是致力于对原始字节码做修改，而 ClassWriter 的操作则是老实得把每一个节点修改后的字节码输出为字节数组。

## 3.2 ASM 的工作流程
1. ClassReader 读取字节码到内存中，生成用于表示该字节码的内部表示的树，ClassReader 对应于访问者模式中的元素
2. 组装 ClassVisitor 责任链，这一系列 ClassVisitor 完成了对字节码一系列不同的字节码修改工作，对应于访问者模式中的访问者 Visitor
3. 然后调用 ClassReader#accept() 方法，传入 ClassVisitor 对象，此 ClassVisitor 是责任链的头结点，经过责任链中每一个 ClassVisitor 的对已加载进内存的字节码的树结构上的每个节点的访问和修改
4. 最后，在责任链的末端，调用 ClassWriter 这个 visitor 进行修改后的字节码的输出工作