# 为什么 MyBatis 的 Mapper 接口不需要实现类就能运行？

## 0 前言

Mybatis中声明一个Mapper接口，没编写任何实现类，就能返回接口实例，并调用接口方法返回数据库数据，why？

## 1 自定义JDK动态代理，实现自动映射器Mapper

### 1.1 示例

```java
// 一个POJO
@Data
@AllArgsConstructor
public class User {
    private Integer id;
    private String name;
    private int age;
}

// 一个接口UserMapper
public interface UserMapper {
    User getUserById(Integer id);
}
```

咋用动态代理实现实例化接口，并调用接口方法返回数据？

自定义InvocationHandler：

```java
public class MapperProxy implements InvocationHandler {

    @SuppressWarnings("unchecked")
    public <T> T newInstance(Class<T> clz) {
        return (T) Proxy.newProxyInstance(clz.getClassLoader(), new Class[]{clz}, this);
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) {
        if (Object.class.equals(method.getDeclaringClass())) {
            try {
                // 如hashCode()、toString()、equals()等方法，将target指向当前对象this
                return method.invoke(this, args);
            } catch (Throwable t) {
                log.error("invoke error", t);
            }
        }
        // 👇 这里就是“投鞭断流”发生的地方！
        return new User((Integer) args[0], "JavaEdge", 18);
    }
}
```

上面代码中的 target，在执行 Object.java 内的方法时，target 被指向了 this，target 已经变成了傀儡、象征、占位符。

写个测试代码：

```java
public class Demo {

    public static void main(String[] args) {
        MapperProxy proxy = new MapperProxy();

        UserMapper mapper = proxy.newInstance(UserMapper.class);
        User user = mapper.getUserById(1001);

        System.out.println("ID:" + user.getId());
        System.out.println("Name:" + user.getName());
        System.out.println("Age:" + user.getAge());

        System.out.println(mapper.toString());
    }
}
```

output：

```
ID:1001
Name:JavaEdge
Age:18
com.javaedge.mybatis.MapperProxy@376b4233
```

这便是 Mybatis 自动映射器 Mapper 的底层实现原理。

### 1.2 投鞭断流式的拦截

在**投鞭断流**式的拦截时，已经没有target。即MyBatis的代理机制“强势介入”方法调用，直接接管控制流，不再调用任何真实实现（因为根本没有实现类），而是“一刀切”地将所有接口方法调用拦截下来，转交给 SQL 执行引擎处理。关键点在于：

#### ① 没有“目标对象”（target）

传统动态代理通常会有一个被代理的真实对象，如：

```java
UserService userService = new UserServiceImpl();
```

代理只是在其前后加逻辑。

#### ② 没有实现类

MyBatis 的 Mapper 接口根本没有实现类！

所以，代理不是“增强”某对象，而是“完全取代”方法调用逻辑——直接解析方法名、参数，去 XML 或注解中找 SQL，然后执行数据库操作。

这种 **“无 target、全拦截、自定义执行逻辑”** 的代理模式，可称 **“投鞭断流”式代理** ——
 **“方法调用之流，被代理一鞭截断，改道流向数据库！”**

## 2 Mybatis自动映射器Mapper源码分析

测试类：

```java
public static void main(String[] args) {
		SqlSession sqlSession = MybatisSqlSessionFactory.openSession();
		try {
			StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
			List<Student> students = studentMapper.findAllStudents();
			for (Student student : students) {
				System.out.println(student);
			}
		} finally {
			sqlSession.close();
		}
	}
```

Mapper长这样：

```java
public interface StudentMapper {
	List<Student> findAllStudents();
	Student findStudentById(Integer id);
	void insertStudent(Student student);
}
```

org.apache.ibatis.binding.MapperProxy.java：

```java
public class MapperProxy<T> implements InvocationHandler, Serializable {

  private static final long serialVersionUID = -6424540398559729838L;
  private final SqlSession sqlSession;
  private final Class<T> mapperInterface;
  private final Map<Method, MapperMethod> methodCache;

  public MapperProxy(SqlSession sqlSession, Class<T> mapperInterface, Map<Method, MapperMethod> methodCache) {
    this.sqlSession = sqlSession;
    this.mapperInterface = mapperInterface;
    this.methodCache = methodCache;
  }

  @Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    if (Object.class.equals(method.getDeclaringClass())) {
      try {
        return method.invoke(this, args);
      } catch (Throwable t) {
        throw ExceptionUtil.unwrapThrowable(t);
      }
    }

    final MapperMethod mapperMethod = cachedMapperMethod(method);
    // ⚡ 直接执行 SQL，不调用任何“target”
    return mapperMethod.execute(sqlSession, args);
  }
  // ...
```

org.apache.ibatis.binding.MapperProxyFactory.java源码：

```java
public class MapperProxyFactory<T> {

  private final Class<T> mapperInterface;

  @SuppressWarnings("unchecked")
  protected T newInstance(MapperProxy<T> mapperProxy) {
    return (T) Proxy.newProxyInstance(mapperInterface.getClassLoader(), new Class[] { mapperInterface }, mapperProxy);
  }
```

这便是 Mybatis 使用动态代理之**投鞭断流**。

## 3 接口Mapper内的方法能重载吗？

类似：

```
public User getUserById(Integer id);
public User getUserById(Integer id, String name);
```

不能。**投鞭断流**时，Mybatis用 package+Mapper+method 全限名作为 key，去 xml 内寻找唯一 sql 来执行。

类似：key=x.y.UserMapper.getUserById，重载时将导致矛盾。对Mapper接口，Mybatis禁止方法重载。

虽新版 MyBatis（3.5+）在某些条件下**可以支持重载**（通过 `@Param` 注解明确参数名，结合方法签名完整匹配），但**官方仍强烈不建议**，因为：

- XML 中 `<select id="xxx">` 的 `id` 必须唯一
- 可读性差
- 容易出错