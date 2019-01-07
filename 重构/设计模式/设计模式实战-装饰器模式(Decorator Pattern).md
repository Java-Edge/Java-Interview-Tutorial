# 导读
一般有两种方式可以给一个类或对象新增行为：
- 继承
子类在拥有自身方法同时还拥有父类方法。但这种方法是静态的，用户无法控制增加行为的方式和时机。
- 关联
将一个类的对象嵌入另一个对象，由另一个对象决定是否调用嵌入对象的行为以便扩展自身行为，这个嵌入的对象就叫做装饰器(Decorator)。

# 定义
对象结构型模式。

动态地给一个对象增加额外功能，装饰器模式比生成子类实现更为灵活。
装饰模式以对用户透明的方式**动态**给一个对象附加功能。用户不会觉得对象在装饰前、后有何不同。装饰模式可在无需创造更多子类情况下，扩展对象的功能。

# 角色
- Component 接口: 抽象构件
定义了对象的接口，可以给这些对象动态增加功能

- ConcreteComponent 具体类: 具体构件
定义了具体的构件对象，实现了 在抽象构件中声明的方法，装饰器可以给它增加额外的职责（方法）

- Decorator 抽象类: 装饰类
抽象装饰类是抽象构件类的子类，用于给具体构件增加职责，但是具 体职责在其子类中实现；

- ConcreteDecorator 具体类: 具体装饰类
具体装饰类是抽象装饰类的子类，负责向构 件添加新的职责。
![](https://img-blog.csdnimg.cn/20210531150553798.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzNTg5NTEw,size_16,color_FFFFFF,t_70)


# 代码实例
窗口 接口
```java
public interface Window {
 	// 绘制窗口
	public void draw();
	 // 返回窗口的描述
	public String getDescription();
}
```
无滚动条功能的简单窗口实现
```java
public class SimpleWindow implements Window {
	public void draw() {
		// 绘制窗口
	}

	public String getDescription() {
		return "simple window";
	}
}
```

以下类包含所有Window类的decorator，以及修饰类本身。
```java
//  抽象装饰类 注意实现Window接口
public abstract class WindowDecorator implements Window {
	// 被装饰的Window
    protected Window decoratedWindow;

    public WindowDecorator (Window decoratedWindow) {
        this.decoratedWindow = decoratedWindow;
    }
    
    @Override
    public void draw() {
        decoratedWindow.draw();
    }

    @Override
    public String getDescription() {
        return decoratedWindow.getDescription();
    }
}


// 第一个具体装饰器 添加垂直滚动条功能
public class VerticalScrollBar extends WindowDecorator {
	public VerticalScrollBar(Window windowToBeDecorated) {
		super(windowToBeDecorated);
	}

	@Override
	public void draw() {
		super.draw();
		drawVerticalScrollBar();
	}

	private void drawVerticalScrollBar() {
		// Draw the vertical scrollbar
	}

	@Override
	public String getDescription() {
		return super.getDescription() + ", including vertical scrollbars";
	}
}


// 第二个具体装饰器 添加水平滚动条功能
public class HorizontalScrollBar extends WindowDecorator {
	public HorizontalScrollBar (Window windowToBeDecorated) {
		super(windowToBeDecorated);
	}

	@Override
	public void draw() {
		super.draw();
		drawHorizontalScrollBar();
	}

	private void drawHorizontalScrollBar() {
		// Draw the horizontal scrollbar
	}

	@Override
	public String getDescription() {
		return super.getDescription() + ", including horizontal scrollbars";
	}
}
```

# 优点
使用装饰模式来实现扩展比继承更加灵活，它以对客户透明的方式动态地给一个对象附加更多的责任。装饰模式可以在不需要创造更多子类的情况下，将对象的功能加以扩展。

与继承相比，关联关系的优势在于不破坏类的封装性，而且继承是一种耦合度较大的静态关系，无法在程序运行时动态扩展。
可通过动态方式扩展一个对象的功能，通过配置文件可以在运行时选择不同装饰器，从而实现不同行为。

在软件开发阶段，关联关系虽然不会比继承关系减少编码量，但到了软件维护阶段，由于关联关系使系统具有较好的松耦合性，所以更容易维护。

通过使用不同具体装饰类以及这些装饰类的排列组合，可以创造出很多不同行为的组合。可以使用多个具体装饰类来装饰同一对象，得到功能更强大的对象。

具体构件类与具体装饰类可以独立变化，用户可以根据需要增加新的具体构件类、具体装饰类，在使用时再对其进行组合，原有代码无须改变，符合“开闭原则”。
#  缺点
产生很多小对象，这些对象区别在于它们之间相互连接的方式不同，而不是它们的类或属性值不同，同时还将产生很多具体装饰类。这些装饰类和小对象的产生将增加系统的复杂度，加大学习与理解的难度。

比继承更灵活，也意味着比继承更易出错，排查也更困难，对于多次装饰的对象，调试时寻找错误可能需要逐级排查，较为烦琐。

# 适用场景
在不影响其他对象的情况下，以动态、透明的方式给单个对象添加职责。
需要动态地给一个对象增加功能，这些功能也可以动态地被撤销。
当不能采用继承的方式对系统进行扩充或者采用继承不利于系统扩展和维护时。

不能采用继承的场景：
- 系统存在大量独立扩展，为支持每一种组合将产生大量的子类，使得子类数目呈爆炸性增长
- 类定义不能继承（如final类）

# 扩展
一个装饰类的接口必须与被装饰类的接口保持相同，对于客户端来说无论是装饰之前的对象还是装饰之后的对象都可以一致对待。
尽量保持具体构件类的轻量，也就是说不要把太多的逻辑和状态放在具体构件类中，可以通过装饰类对其进行扩展。

装饰模式可分为：
- 透明装饰模式
要求客户端完全针对抽象编程，装饰模式的透明性要求客户端程序不应该声明具体构件类型和具体装饰类型，而应该全部声明为抽象构件类型
- 半透明装饰模式
允许用户在客户端声明具体装饰者类型的对象，调用在具体装饰者中新增的方法。

> 参考
> - https://zh.wikipedia.org/wiki/%E4%BF%AE%E9%A5%B0%E6%A8%A1%E5%BC%8F#/