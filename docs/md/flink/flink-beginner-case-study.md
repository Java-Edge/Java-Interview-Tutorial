# 02-Flink入门案例

源码：https://github.com/Java-Edge/Flink-Tutorial

下载安装：https://ci.apache.org/projects/flink/flink-docs-release-1.8/tutorials/local_setup.html



![](https://upload-images.jianshu.io/upload_images/16782311-da954c6628a3b830.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```bash
brew install apache-flink
```

## 1 需求

### 1.1 词频统计（word count）

批处理应用程序。

一个文件，统计文件中每个单词出现的次数，分隔符\t。统计结果直接打印控制台，生产肯定是Sink到目的地。

## 2 开发环境

### 2.1 前提

- Maven ≥3.0.4
- Java 8

### 2.2 Create Project

以下命令之一**创建项目**：

#### maven  archetype

```
 $ mvn archetype:generate                               \
      -DarchetypeGroupId=org.apache.flink              \
      -DarchetypeArtifactId=flink-quickstart-java      \
      -DarchetypeVersion=1.8.0
```

为新创建项目命名。 以交互方式询问groupId，artifactId和包名称：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/eefda0440572eb99ea75f0049d3e1d5f.)

#### 运行quickstart脚本

```bash
$ curl https://flink.apache.org/q/quickstart.sh | bash -s 1.8.0
```


![](https://upload-images.jianshu.io/upload_images/16782311-95b03d9808baefa4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 2.3 Inspect Project

工作目录中将有一个新目录。 如果使用curl，则该目录称为quickstart。 否则，它具有artifactId的名称：

![](https://upload-images.jianshu.io/upload_images/16782311-a654ecf786588102.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

IDEA直接打开。

示例包含两个类：StreamingJob和BatchJob是DataStream和DataSet程序的基本框架程序。 

主方法是程序的入口点，既可用于IDE测试/执行，也可用于正确部署。

建议将此项目导入IDE以进行开发和测试。 IntelliJ IDEA支持开箱即用的Maven项目。 

对于Flink，Java的默认JVM堆可能太小，须手动加大至少800M。

#### pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.javaedge.scala</groupId>
	<artifactId>flink-train-scala</artifactId>
	<version>1.0</version>
	<packaging>jar</packaging>

	<name>Flink Tutorial</name>
	<url>http://www.myorganization.org</url>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<flink.version>1.8.0</flink.version>
		<scala.binary.version>2.11</scala.binary.version>
		<scala.version>2.11.12</scala.version>
		<hadoop.version>2.6.0</hadoop.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.apache.flink</groupId>
			<artifactId>flink-scala_${scala.binary.version}</artifactId>
			<version>${flink.version}</version>
			<scope>provided</scope>
		</dependency>
		<dependency>
			<groupId>org.apache.flink</groupId>
			<artifactId>flink-streaming-scala_${scala.binary.version}</artifactId>
			<version>${flink.version}</version>
			<scope>provided</scope>
		</dependency>

		<dependency>
			<groupId>org.apache.flink</groupId>
			<artifactId>flink-table-planner_2.11</artifactId>
			<version>${flink.version}</version>
		</dependency>

		<dependency>
			<groupId>org.apache.flink</groupId>
			<artifactId>flink-table-api-scala-bridge_2.11</artifactId>
			<version>${flink.version}</version>
		</dependency>

		<!-- Scala Library, provided by Flink as well. -->
		<dependency>
			<groupId>org.scala-lang</groupId>
			<artifactId>scala-library</artifactId>
			<version>${scala.version}</version>
			<scope>provided</scope>
		</dependency>

		<dependency>
			<groupId>org.slf4j</groupId>
			<artifactId>slf4j-log4j12</artifactId>
			<version>1.7.7</version>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>log4j</groupId>
			<artifactId>log4j</artifactId>
			<version>1.2.17</version>
			<scope>runtime</scope>
		</dependency>

		<dependency>
			<groupId>mysql</groupId>
			<artifactId>mysql-connector-java</artifactId>
			<version>8.0.13</version>
		</dependency>

		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<version>1.18.8</version>
		</dependency>

        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-connector-filesystem_2.11</artifactId>
            <version>${flink.version}</version>
        </dependency>

		<dependency>
			<groupId>org.apache.hadoop</groupId>
			<artifactId>hadoop-client</artifactId>
			<version>${hadoop.version}</version>
		</dependency>

		<dependency>
			<groupId>org.apache.flink</groupId>
			<artifactId>flink-connector-kafka_2.11</artifactId>
			<version>${flink.version}</version>
		</dependency>

		<dependency>
			<groupId>org.apache.flink</groupId>
			<artifactId>flink-connector-kafka_2.11</artifactId>
			<version>${flink.version}</version>
		</dependency>

	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-shade-plugin</artifactId>
				<version>3.0.0</version>
				<executions>
					<!-- Run shade goal on package phase -->
					<execution>
						<phase>package</phase>
						<goals>
							<goal>shade</goal>
						</goals>
						<configuration>
							<artifactSet>
								<excludes>
									<exclude>org.apache.flink:force-shading</exclude>
									<exclude>com.google.code.findbugs:jsr305</exclude>
									<exclude>org.slf4j:*</exclude>
									<exclude>log4j:*</exclude>
								</excludes>
							</artifactSet>
							<filters>
								<filter>
									<!-- Do not copy the signatures in the META-INF folder.
									Otherwise, this might cause SecurityExceptions when using the JAR. -->
									<artifact>*:*</artifact>
									<excludes>
										<exclude>META-INF/*.SF</exclude>
										<exclude>META-INF/*.DSA</exclude>
										<exclude>META-INF/*.RSA</exclude>
									</excludes>
								</filter>
							</filters>
							<transformers>
								<transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
									<mainClass>com.javaedge.scala.StreamingJob</mainClass>
								</transformer>
							</transformers>
						</configuration>
					</execution>
				</executions>
			</plugin>

			<!-- Java Compiler -->
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<version>3.1</version>
				<configuration>
					<source>1.8</source>
					<target>1.8</target>
				</configuration>
			</plugin>

			<!-- Scala Compiler -->
			<plugin>
				<groupId>net.alchim31.maven</groupId>
				<artifactId>scala-maven-plugin</artifactId>
				<version>3.2.2</version>
				<executions>
					<execution>
						<goals>
							<goal>compile</goal>
							<goal>testCompile</goal>
						</goals>
					</execution>
				</executions>
			</plugin>

			<!-- Eclipse Scala Integration -->
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-eclipse-plugin</artifactId>
				<version>2.8</version>
				<configuration>
					<downloadSources>true</downloadSources>
					<projectnatures>
						<projectnature>org.scala-ide.sdt.core.scalanature</projectnature>
						<projectnature>org.eclipse.jdt.core.javanature</projectnature>
					</projectnatures>
					<buildcommands>
						<buildcommand>org.scala-ide.sdt.core.scalabuilder</buildcommand>
					</buildcommands>
					<classpathContainers>
						<classpathContainer>org.scala-ide.sdt.launching.SCALA_CONTAINER</classpathContainer>
						<classpathContainer>org.eclipse.jdt.launching.JRE_CONTAINER</classpathContainer>
					</classpathContainers>
					<excludes>
						<exclude>org.scala-lang:scala-library</exclude>
						<exclude>org.scala-lang:scala-compiler</exclude>
					</excludes>
					<sourceIncludes>
						<sourceInclude>**/*.scala</sourceInclude>
						<sourceInclude>**/*.java</sourceInclude>
					</sourceIncludes>
				</configuration>
			</plugin>
			<plugin>
				<groupId>org.codehaus.mojo</groupId>
				<artifactId>build-helper-maven-plugin</artifactId>
				<version>1.7</version>
				<executions>
					<!-- Add src/main/scala to eclipse build path -->
					<execution>
						<id>add-source</id>
						<phase>generate-sources</phase>
						<goals>
							<goal>add-source</goal>
						</goals>
						<configuration>
							<sources>
								<source>src/main/scala</source>
							</sources>
						</configuration>
					</execution>
					<!-- Add src/test/scala to eclipse build path -->
					<execution>
						<id>add-test-source</id>
						<phase>generate-test-sources</phase>
						<goals>
							<goal>add-test-source</goal>
						</goals>
						<configuration>
							<sources>
								<source>src/test/scala</source>
							</sources>
						</configuration>
					</execution>
				</executions>
			</plugin>
		</plugins>
	</build>

	<profiles>
		<profile>
			<id>add-dependencies-for-IDEA</id>

			<activation>
				<property>
					<name>idea.version</name>
				</property>
			</activation>

			<dependencies>
				<dependency>
					<groupId>org.apache.flink</groupId>
					<artifactId>flink-scala_${scala.binary.version}</artifactId>
					<version>${flink.version}</version>
					<scope>compile</scope>
				</dependency>
				<dependency>
					<groupId>org.apache.flink</groupId>
					<artifactId>flink-streaming-scala_${scala.binary.version}</artifactId>
					<version>${flink.version}</version>
					<scope>compile</scope>
				</dependency>
				<dependency>
					<groupId>org.scala-lang</groupId>
					<artifactId>scala-library</artifactId>
					<version>${scala.version}</version>
					<scope>compile</scope>
				</dependency>
			</dependencies>
		</profile>
	</profiles>

</project>
```

### 2.4 Build Project

构建/打包项目，转到项目目录并运行

```bash
mvn clean package
```

或用插件：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/08/6f9a08f83ba39e51392f28f64eefdb95.png)

找到包含应用程序的打包好的JAR，包含已作为依赖项添加到应用程序的连接器和库：

```
target / <artifact-id>  -  <version> .jar
```

![](https://upload-images.jianshu.io/upload_images/16782311-428f7112b41ad200.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如用与StreamingJob不同的类作为应用程序的主类/入口点，建议相应更改pom.xml文件中的mainClass设置。 这样，Flink可从JAR文件运行应用程序，而无需另外指定主类。

## 3 公式型编程

### 3.1 组成

Flink 程序由流（Streams）和转换（Transformations）组成：

- 数据流Source：一个不会结束的数据流
- Transformations：取一或多个数据流作为输入，生成数据流结果
- Sink：输出数据流

### 3.2 编码步骤

#### ① 准备环境-env

set up the batch execution environment

#### ② 加载数据-source

从环境获取数据，如：

```java
env.readTextFile(textPath);
```

#### ③ 处理数据-transformation

step 3 : 开发业务逻辑的核心代码 
transform the resulting `DataSet<String> `using operations,like

```
.filter()
.flatMap()
.join()
.coGroup()
```

#### ④ 输出结果-sink

step 4 : execute program

## 4 Flink批处理应用（Java）

新建文本demo.txt：

```
Hello JavaEdge
Hello World
```

测试代码：

```java
public class BatchWCApp {

    public static void main(String[] args) throws Exception {

       String input = "/Users/javaedge/Downloads/IDEAProjects/Flink-Tutorial/doc/demo.txt";
        
        // step1 获取运行环境 DataSet Api 版本, 已弃用
        final ExecutionEnvironment env = ExecutionEnvironment.getExecutionEnvironment();

        // step2 读取数据
        DataSet<String> text = env.readTextFile(input);
        
        // step3 transform
        text.print();
    }
}
```

### 4.1 功能拆解

#### ① 读取数据

Hello	JavaEdge

#### ② 每行数据按指定分隔符拆分（Split）

Hello
JavaEdge

#### ③ 为每个单词赋上次数1（Map）

(Hello,1)
(JavaEdge,1)	

#### ④ 按单词分组 groupBy

#### ⑤ 求和（Sum）

### 4.2 案例



![](https://upload-images.jianshu.io/upload_images/16782311-c739e445c5955566.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

结果

![](https://upload-images.jianshu.io/upload_images/16782311-b844789d02efe33f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 5 实时处理应用



```java
public class StreamingWCApp {
    public static void main(String[] args) throws Exception {

        // 创建上下文
      	// 新版本是流批统一，既支持流处理，也支持批处理
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // 对接数据源的数据
        DataStreamSource<String> source = env.socketTextStream("localhost", 9527);

        // 业务逻辑处理： transformation
        source.flatMap(new FlatMapFunction<String, String>() {
                    @Override
                    public void flatMap(String value, Collector<String> out) throws Exception {
                        String[] words = value.split(",");
                        for (String word : words) {
                            out.collect(word.toLowerCase().trim());
                        }
                    }
                }).filter(new FilterFunction<String>() {
                    @Override
                    public boolean filter(String value) throws Exception {
                        return StringUtils.isNotEmpty(value);
                    }
                }).map(new MapFunction<String, Tuple2<String, Integer>>() {
                    @Override
                    public Tuple2<String, Integer> map(String value) throws Exception {
                        return new Tuple2<>(value, 1);
                    }
                }).keyBy(new KeySelector<Tuple2<String, Integer>, String>() {
                    @Override
                    public String getKey(Tuple2<String, Integer> value) throws Exception {
                        return value.f0;
                    }
                }).sum(1)
                .print();

        env.execute("StreamingWCApp");
    }
}
```

可能遇到拒绝连接，记得

```bash
nc -lk 9527
javaedge
123
```

socket发送数据后，控制台收到结果：

![](https://img-blog.csdnimg.cn/e169cf8c23764c518632ac0f7d698703.png)

## 6 Flink实时处理应用重构

咋突破端口的限制？需重构，传参`args`：

![](https://img-blog.csdnimg.cn/20190505224529559.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

获得参数：

![](https://img-blog.csdnimg.cn/20190505224814590.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

## 7 FAQ

### 依赖

Configuring Dependencies，Connectors, Libraries：

每个Flink应用程序都依赖一组Flink库。 至少，应用程序依赖于Flink API。 许多应用程序还依赖于某些连接器库（如Kafka，Cassandra等）。 运行Flink应用程序时（在分布式部署中或在IDE中进行测试），Flink运行时库也须可用。

