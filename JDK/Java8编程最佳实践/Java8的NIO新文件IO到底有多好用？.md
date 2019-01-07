>在丑陋的 Java I/O 编程方式诞生多年以后，Java终于简化了文件读写的基本操作。

打开并读取文件对于大多数编程语言来是非常常用的，由于 I/O 糟糕的设计以至于很少有人能够在不依赖其他参考代码的情况下完成打开文件的操作。

在 Java7 中对此引入了巨大的改进。这些新元素被放在 **java.nio.file** 包下面，过去人们通常把 **nio** 中的 **n** 理解为 **new** 即新的 **io**，现在更应该当成是 **non-blocking** 非阻塞 **io**(**io**就是*input/output输入/输出*)。**java.nio.file** 库终于将 Java 文件操作带到与其他编程语言相同的水平。最重要的是 Java8 新增的 streams 与文件结合使得文件操作编程变得更加优雅。
看一下文件操作的两个基本组件：

1. 文件或者目录的路径；
2. 文件本身。

# 文件和目录路径
一个 **Path** 对象表示一个文件或者目录的路径，是一个跨操作系统（OS）和文件系统的抽象，目的是在构造路径时不必关注底层操作系统，代码可以在不进行修改的情况下运行在不同的操作系统上。**java.nio.file.Paths** 类包含一个重载方法 **static get()**，该方法接受一系列 **String** 字符串或一个*统一资源标识符*(URI)作为参数，并且进行转换返回一个 **Path** 对象。

当 **toString()** 方法生成完整形式的路径， **getFileName()** 方法总是返回当前文件名。
通过使用 **Files** 工具类，可以测试一个文件是否存在，测试是否是一个"普通"文件还是一个目录等等。"Nofile.txt"这个示例展示我们描述的文件可能并不在指定的位置；这样可以允许你创建一个新的路径。"PathInfo.java"存在于当前目录中，最初它只是没有路径的文件名，但它仍然被检测为"存在"。一旦我们将其转换为绝对路径，我们将会得到一个从"C:"盘(因为我们是在Windows机器下进行测试)开始的完整路径，现在它也拥有一个父路径。
“真实”路径的定义在文档中有点模糊，因为它取决于具体的文件系统。例如，如果文件名不区分大小写，即使路径由于大小写的缘故而不是完全相同，也可能得到肯定的匹配结果。在这样的平台上，**toRealPath()** 将返回实际情况下的 **Path**，并且还会删除任何冗余元素。

这里你会看到 **URI** 看起来只能用于描述文件，实际上 **URI** 可以用于描述更多的东西；通过 [维基百科](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier) 可以了解更多细节。现在我们成功地将 **URI** 转为一个 **Path** 对象。

**Path** 中看到一些有点欺骗的东西，这就是调用 **toFile()** 方法会生成一个 **File** 对象。听起来似乎可以得到一个类似文件的东西(毕竟被称为 **File** )，但是这个方法的存在仅仅是为了向后兼容。虽然看上去应该被称为"路径"，实际上却应该表示目录或者文件本身。这是个非常草率并且令人困惑的命名，但是由于 **java.nio.file** 的存在我们可以安全地忽略它的存在。

##  选取路径部分片段
**Path** 对象可以非常容易地生成路径的某一部分：


可以通过 **getName()** 来索引 **Path** 的各个部分，直到达到上限 **getNameCount()**。**Path** 也实现了 **Iterable** 接口，因此我们也可以通过增强的 for-each 进行遍历。请注意，即使路径以 **.java** 结尾，使用 **endsWith()** 方法也会返回 **false**。这是因为使用 **endsWith()** 比较的是整个路径部分，而不会包含文件路径的后缀。通过使用 **startsWith()** 和 **endsWith()** 也可以完成路径的遍历。但是我们可以看到，遍历 **Path** 对象并不包含根路径，只有使用 **startsWith()** 检测根路径时才会返回 **true**。

## 路径分析
**Files** 工具类包含一系列完整的方法用于获得 **Path** 相关的信息。
![](https://img-blog.csdnimg.cn/2020061404121948.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200614041449822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
在调用最后一个测试方法 **getPosixFilePermissions()** 之前我们需要确认一下当前文件系统是否支持 **Posix** 接口，否则会抛出运行时异常。

##  **Paths**的增减修改
我们必须能通过对 **Path** 对象增加或者删除一部分来构造一个新的 **Path** 对象。我们使用 **relativize()** 移除 **Path** 的根路径，使用 **resolve()** 添加 **Path** 的尾路径(不一定是“可发现”的名称)。

对于下面代码中的示例，我使用 **relativize()** 方法从所有的输出中移除根路径，部分原因是为了示范，部分原因是为了简化输出结果，这说明你可以使用该方法将绝对路径转为相对路径。
这个版本的代码中包含 **id**，以便于跟踪输出结果：
![](https://img-blog.csdnimg.cn/202006140422082.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200614042152834.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200614042236314.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

# 目录
**Files** 工具类包含大部分我们需要的目录操作和文件操作方法。出于某种原因，它们没有包含删除目录树相关的方法
![](https://img-blog.csdnimg.cn/20200614042352714.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
删除目录树的方法实现依赖于 **Files.walkFileTree()**，"walking" 目录树意味着遍历每个子目录和文件。*Visitor* 设计模式提供了一种标准机制来访问集合中的每个对象，然后你需要提供在每个对象上执行的操作。
此操作的定义取决于实现的 **FileVisitor** 的四个抽象方法，包括：

- **preVisitDirectory()**
![](https://img-blog.csdnimg.cn/20200612112108661.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)在访问目录中条目之前在目录上运行。 
- **visitFile()**：调用目录中的文件
![](https://img-blog.csdnimg.cn/20200612112146580.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70) 

- **visitFileFailed()**
  ![](https://img-blog.csdnimg.cn/20200612112303196.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)调用无法被访问的文件。如果该文件的属性不能被读取，该文件是无法打开一个目录，以及其他原因，该方法被调用。
- **postVisitDirectory()**
在访问目录中条目之后在目录上运行，包括所有的子目录。
![](https://img-blog.csdnimg.cn/20200612112501522.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
为了简化，**java.nio.file.SimpleFileVisitor** 提供了所有方法的默认实现
![](https://img-blog.csdnimg.cn/20200612112627631.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

在自己的匿名内部类中，只需要重写非标准行为的方法：**visitFile()** 和 **postVisitDirectory()** 实现删除文件和删除目录。两者都应该返回标志位决定是否继续访问
作为探索目录操作的一部分，现在我们可以有条件地删除已存在的目录。在以下例子中，**makeVariant()** 接受基本目录测试，并通过旋转部件列表生成不同的子目录路径。这些旋转与路径分隔符 **sep** 使用 **String.join()** 贴在一起，然后返回一个 **Path** 对象。

如果你对于已经存在的目录调用 **createDirectory()** 将会抛出异常。**createFile()** 使用参数 **Path** 创建一个空文件; **resolve()** 将文件名添加到 **test Path** 的末尾。

我们尝试使用 **createDirectory()** 来创建多级路径，但是这样会抛出异常，因为这个方法只能创建单级路径。我已经将 **populateTestDir()** 作为一个单独的方法，因为它将在后面的例子中被重用。对于每一个变量 **variant**，我们都能使用 **createDirectories()** 创建完整的目录路径，然后使用此文件的副本以不同的目标名称填充该终端目录。然后我们使用 **createTempFile()** 生成一个临时文件。

在调用 **populateTestDir()** 之后，我们在 **test** 目录下面下面创建一个临时目录。请注意，**createTempDirectory()** 只有名称的前缀选项。与 **createTempFile()** 不同，我们再次使用它将临时文件放入新的临时目录中。你可以从输出中看到，如果未指定后缀，它将默认使用".tmp"作为后缀。

为了展示结果，我们首次使用看起来很有希望的 **newDirectoryStream()**，但事实证明这个方法只是返回 **test** 目录内容的 Stream 流，并没有更多的内容。要获取目录树的全部内容的流，请使用 **Files.walk()**。

<!-- File Systems -->

## 文件系统
为了完整起见，我们需要一种方法查找文件系统相关的其他信息。在这里，我们使用静态的 **FileSystems** 工具类获取"默认"的文件系统，但也可以在 **Path** 对象上调用 **getFileSystem()** 以获取创建该 **Path** 的文件系统。
可以获得给定 *URI* 的文件系统，还可以构建新的文件系统(对于支持它的操作系统)。
			
![](https://img-blog.csdnimg.cn/20200614021747925.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
![](https://img-blog.csdnimg.cn/20200614020058345.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)



# 路径监听
通过 **WatchService** 可以设置一个进程对目录中的更改做出响应。

一旦我们从 **FileSystem** 中得到了 **WatchService** 对象，我们将其注册到 **test** 路径以及我们感兴趣的项目的变量参数列表中，可以选择 
**ENTRY_CREATE**
![](https://img-blog.csdnimg.cn/2020061403052653.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
**ENTRY_DELETE** 
![](https://img-blog.csdnimg.cn/2020061403054766.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
**ENTRY_MODIFY**(其中创建和删除不属于修改)。
![](https://img-blog.csdnimg.cn/20200614025256263.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

接下来对 **watcher.take()** 的调用会在发生某些事情之前停止所有操作，所以我们希望 **deltxtfiles()** 能够并行运行以便生成我们感兴趣的事件。为了实现这个目的，通过调用 **Executors.newSingleThreadScheduledExecutor()** 产生一个 **ScheduledExecutorService** 对象，然后调用 **schedule()** 方法传递所需函数的方法引用，并且设置在运行之前应该等待的时间。

此时，**watcher.take()** 将等待并阻塞在这里。当目标事件发生时，会返回一个包含 **WatchEvent** 的 **Watchkey** 对象。


如果说"监视这个目录"，自然会包含整个目录和下面子目录，但实际上的：只会监视给定的目录，而不是下面的所有内容。如果需要监视整个树目录，必须在整个树的每个子目录上放置一个 **Watchservice**。
 
# 文件查找
粗糙的方法，在 `path` 上调用 `toString()`，然后使用 `string` 操作查看结果。

`java.nio.file` 有更好的解决方案：通过在 `FileSystem` 对象上调用 `getPathMatcher()` 获得一个 `PathMatcher`，然后传入感兴趣的模式。

## 模式
### `glob` 
`glob` 比较简单，实际上功能非常强大，因此可以使用 `glob` 解决许多问题。
![](https://img-blog.csdnimg.cn/20200614034905302.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

在 `matcher` 中，`glob` 表达式开头的 `**/` 表示“当前目录及所有子目录”，这在当你不仅仅要匹配当前目录下特定结尾的 `Path` 时非常有用。
单 `*` 表示“任何东西”，然后是一个点，然后大括号表示一系列的可能性---我们正在寻找以 `.tmp` 或 `.txt` 结尾的东西


###  `regex`
如果问题更复杂，可以使用 `regex`

# 文件读写
如果一个文件很“小”，即“它运行得足够快且占用内存小”，那 `java.nio.file.Files` 类中的实用程序将帮助你轻松读写文本和二进制文件。

- `Files.readAllLines()` 一次读取整个文件（因此，“小”文件很有必要），产生一个`List<String>`
![](https://img-blog.csdnimg.cn/20200614035132756.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
- 只需将 `Path` 传递给 `readAllLines()` ![](https://img-blog.csdnimg.cn/20200614035343174.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

- `readAllLines()` 有一个重载版本，包含一个 `Charset` 参数来存储文件的 Unicode 编码
![](https://img-blog.csdnimg.cn/2020061403544248.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- `Files.write()` 被重载以写入 `byte` 数组或任何 `Iterable` 对象（它也有 `Charset` 选项）：
![](https://img-blog.csdnimg.cn/20200614035815598.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

```java
ClassReader cr = new ClassReader("com/javaedge/asm/TestAsm");
ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_MAXS);
ClassVisitor cv = new MyClassVisitor(cw);
cr.accept(cv, ClassReader.SKIP_DEBUG);

byte[] data = cw.toByteArray();
Files.write(Paths.get("src/main/java/com/javaedge/asm/out.class"), data);
System.out.println("generate success!");
```

如果文件大小有问题怎么办？ 比如说：

1. 文件太大，如果你一次性读完整个文件，你可能会耗尽内存。

2. 您只需要在文件的中途工作以获得所需的结果，因此读取整个文件会浪费时间。

`Files.lines()` 方便地将文件转换为行的 `Stream`：
![](https://img-blog.csdnimg.cn/2020061404061469.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
流式处理，跳过 13 行，然后选择下一行并将其打印出来。

`Files.lines()` 对于把文件处理行的传入流时非常有用，但是如果你想在 `Stream` 中读取，处理或写入怎么办？这就需要稍微复杂的代码：
![](https://img-blog.csdnimg.cn/20200614040718517.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)
因为我们在同一个块中执行所有操作，所以这两个文件都可以在相同的 try-with-resources 语句中打开。
`PrintWriter` 是一个旧式的 `java.io` 类，允许你“打印”到一个文件，所以它是这个应用的理想选择

# 总结
虽然本章对文件和目录操作做了相当全面的介绍，但是仍然有没被介绍的类库中的功能——一定要研究 `java.nio.file` 的 Javadocs，尤其是 `java.nio.file.Files` 这个类。

Java 7 和 8 对于处理文件和目录的类库做了大量改进。如果您刚刚开始使用 Java，那么您很幸运。在过去，它令人非常不愉快，Java 设计者以前对于文件操作不够重视才没做简化。对于初学者来说这是一件很棒的事，对于教学者来说也一样。我不明白为什么花了这么长时间来解决这个明显的问题，但不管怎么说它被解决了，我很高兴。使用文件现在很简单，甚至很有趣，这是你以前永远想不到的。