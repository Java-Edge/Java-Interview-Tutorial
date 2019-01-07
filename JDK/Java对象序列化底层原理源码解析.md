# What

Java序列化是指把Java对象保存为二进制字节码的过程，Java反序列化是指把二进制码重新转换成Java对象的过程。

那么为什么需要序列化呢？

第一种情况是：一般情况下Java对象的声明周期都比Java虚拟机的要短，实际应用中我们希望在JVM停止运行之后能够持久化指定的对象，这时候就需要把对象进行序列化之后保存。

第二种情况是：需要把Java对象通过网络进行传输的时候。因为数据只能够以二进制的形式在网络中进行传输，因此当把对象通过网络发送出去之前需要先序列化成二进制数据，在接收端读到二进制数据之后反序列化成Java对象。
#How
本部分以序列化到文件为例讲解Java序列化的基本用法。
```java
package test;

import java.io.*;

/**
 * @author v_shishusheng
 * @date 2018/2/7
 */
public class SerializableTest {
    public static void main(String[] args) throws Exception {
        FileOutputStream fos = new FileOutputStream("temp.out");
        ObjectOutputStream oos = new ObjectOutputStream(fos);
        TestObject testObject = new TestObject();
        oos.writeObject(testObject);
        oos.flush();
        oos.close();

        FileInputStream fis = new FileInputStream("temp.out");
        ObjectInputStream ois = new ObjectInputStream(fis);
        TestObject deTest = (TestObject) ois.readObject();
        System.out.println(deTest.testValue);
        System.out.println(deTest.parentValue);
        System.out.println(deTest.innerObject.innerValue);
    }
}

class Parent implements Serializable {

    private static final long serialVersionUID = -4963266899668807475L;

    public int parentValue = 100;
}

class InnerObject implements Serializable {

    private static final long serialVersionUID = 5704957411985783570L;

    public int innerValue = 200;
}

class TestObject extends Parent implements Serializable {

    private static final long serialVersionUID = -3186721026267206914L;

    public int testValue = 300;

    public InnerObject innerObject = new InnerObject();
}
```
程序执行完用sublime打开temp.out文件，可以看到
```java
aced 0005 7372 0017 636f 6d2e 7373 732e
7465 7374 2e54 6573 744f 626a 6563 74d3
c67e 1c4f 132a fe02 0002 4900 0974 6573
7456 616c 7565 4c00 0b69 6e6e 6572 4f62
6a65 6374 7400 1a4c 636f 6d2f 7373 732f
7465 7374 2f49 6e6e 6572 4f62 6a65 6374
3b78 7200 1363 6f6d 2e73 7373 2e74 6573
742e 5061 7265 6e74 bb1e ef0d 1fc9 50cd
0200 0149 000b 7061 7265 6e74 5661 6c75
6578 7000 0000 6400 0001 2c73 7200 1863
6f6d 2e73 7373 2e74 6573 742e 496e 6e65
724f 626a 6563 744f 2c14 8a40 24fb 1202
0001 4900 0a69 6e6e 6572 5661 6c75 6578
7000 0000 c8
```
# Why
调用ObjectOutputStream.writeObject()和ObjectInputStream.readObject()之后究竟做了什么？temp.out文件中的二进制分别代表什么意思？
## 1. ObjectStreamClass类

方文档对这个类的介绍如下

> Serialization’s descriptor for classes. It contains the name and serialVersionUID of the class. The ObjectStreamClass for a specific class loaded in this Java VM can be found/created using the lookup method.

可以看到是类的序列化描述符，这个类可以描述需要被序列化的类的元数据，包括被序列化的类的名字以及序列号。可以通过lookup()方法来查找/创建在这个JVM中加载的特定的ObjectStreamClass对象。

##2.序列化:writeObject()
调用wroteObject()进行序列化之前会先调用ObjectOutputStream的构造函数生成一个ObjectOutputStream对象，构造函数如下:
```java
public ObjectOutputStream(OutputStream out) throws IOException {
    verifySubclass();
  // bout表示底层的字节数据容器
  bout = new BlockDataOutputStream(out);
  handles = new HandleTable(10, (float) 3.00);
  subs = new ReplaceTable(10, (float) 3.00);
  enableOverride = false;
  writeStreamHeader(); // 写入文件头
  bout.setBlockDataMode(true); // flush数据
  if (extendedDebugInfo) {
        debugInfoStack = new DebugTraceInfoStack();
  } else {
        debugInfoStack = null;
  }
}
```
构造函数中首先会把bout绑定到底层的字节数据容器，接着会调用writeStreamHeader()方法，该方法实现如下:
```java
protected void writeStreamHeader() throws IOException {
    bout.writeShort(STREAM_MAGIC);
    bout.writeShort(STREAM_VERSION);
}
```
在writeStreamHeader()方法中首先会往底层字节容器中写入表示序列化的Magic Number以及版本号，定义为
```java
/**
 * Magic number that is written to the stream header. 
 */
final static short STREAM_MAGIC = (short)0xaced;

/**
 * Version number that is written to the stream header. 
 */
final static short STREAM_VERSION = 5;
```
接下来会调用writeObject()方法进行序列化,实现如下:
```java
public final void writeObject(Object obj) throws IOException {
    if (enableOverride) {
        writeObjectOverride(obj);
 return;  }
    try {
		// 调用writeObject0()方法序列化
        writeObject0(obj, false);
  } catch (IOException ex) {
        if (depth == 0) {
            writeFatalException(ex);
  }
        throw ex;
  }
}
```
正常情况下会调用writeObject0()进行序列化操作,该方法实现如下:
```java
  private void writeObject0(Object obj, boolean unshared)
        throws IOException
    {
        boolean oldMode = bout.setBlockDataMode(false);
        depth++;
        try {
            // handle previously written and non-replaceable objects
            int h;
            if ((obj = subs.lookup(obj)) == null) {
                writeNull();
                return;
            } else if (!unshared && (h = handles.lookup(obj)) != -1) {
                writeHandle(h);
                return;
            } else if (obj instanceof Class) {
                writeClass((Class) obj, unshared);
                return;
            } else if (obj instanceof ObjectStreamClass) {
                writeClassDesc((ObjectStreamClass) obj, unshared);
                return;
            }

            // check for replacement object
            Object orig = obj;
           //  获取要序列化的对象的Class对象
            Class<?> cl = obj.getClass();
            ObjectStreamClass desc;
            for (;;) {
                // REMIND: skip this check for strings/arrays?
                Class<?> repCl;
                 // 创建描述cl的ObjectStreamClass对象
                desc = ObjectStreamClass.lookup(cl, true);
                if (!desc.hasWriteReplaceMethod() ||
                    (obj = desc.invokeWriteReplace(obj)) == null ||
                    (repCl = obj.getClass()) == cl)
                {
                    break;
                }
                cl = repCl;
            }
            if (enableReplace) {
                Object rep = replaceObject(obj);
                if (rep != obj && rep != null) {
                    cl = rep.getClass();
                    desc = ObjectStreamClass.lookup(cl, true);
                }
                obj = rep;
            }

            // if object replaced, run through original checks a second time
            if (obj != orig) {
                subs.assign(orig, obj);
                if (obj == null) {
                    writeNull();
                    return;
                } else if (!unshared && (h = handles.lookup(obj)) != -1) {
                    writeHandle(h);
                    return;
                } else if (obj instanceof Class) {
                    writeClass((Class) obj, unshared);
                    return;
                } else if (obj instanceof ObjectStreamClass) {
                    writeClassDesc((ObjectStreamClass) obj, unshared);
                    return;
                }
            }

            // 根据实际的类型进行不同的写入操作
            // remaining cases
            if (obj instanceof String) {
                writeString((String) obj, unshared);
            } else if (cl.isArray()) {
                writeArray(obj, desc, unshared);
            } else if (obj instanceof Enum) {
                writeEnum((Enum<?>) obj, desc, unshared);
            } else if (obj instanceof Serializable) {
                // 被序列化对象实现了Serializable接口
                writeOrdinaryObject(obj, desc, unshared);
            } else {
                if (extendedDebugInfo) {
                    throw new NotSerializableException(
                        cl.getName() + "\n" + debugInfoStack.toString());
                } else {
                    throw new NotSerializableException(cl.getName());
                }
            }
        } finally {
            depth--;
            bout.setBlockDataMode(oldMode);
        }
    }
```
从代码里面可以看到，程序会
- 生成一个描述被序列化对象类的类元信息的ObjectStreamClass对象
- 根据传入的需要序列化的对象的实际类型进行不同的序列化操作。从代码里面可以很明显的看到，
   - 对于String类型、数组类型和Enum可以直接进行序列化
   - 如果被序列化对象实现了Serializable对象，则会调用writeOrdinaryObject()方法进行序列化
这里可以解释一个问题:Serializbale接口是个空的接口，并没有定义任何方法，为什么需要序列化的接口只要实现Serializbale接口就能够进行序列化。

答案是:Serializable接口这是一个标识，告诉程序所有实现了”我”的对象都需要进行序列化。

因此，序列化过程接下来会执行到writeOrdinaryObject()这个方法中，该方法实现如下:
```java
    private void writeOrdinaryObject(Object obj,
                                     ObjectStreamClass desc,
                                     boolean unshared)
        throws IOException
    {
        if (extendedDebugInfo) {
            debugInfoStack.push(
                (depth == 1 ? "root " : "") + "object (class \"" +
                obj.getClass().getName() + "\", " + obj.toString() + ")");
        }
        try {
            desc.checkSerialize();

            // 写入Object标志位
            bout.writeByte(TC_OBJECT);
            // 写入类元数据
            writeClassDesc(desc, false);
            handles.assign(unshared ? null : obj);
            if (desc.isExternalizable() && !desc.isProxy()) {
                writeExternalData((Externalizable) obj);  // 写入被序列化的对象的实例数据
            } else {
                writeSerialData(obj, desc);
            }
        } finally {
            if (extendedDebugInfo) {
                debugInfoStack.pop();
            }
        }
    }
```
在这个方法中首先会往底层字节容器中写入TC_OBJECT，表示这是一个新的Object
```java
/**
 * new Object.
 */
final static byte TC_OBJECT =       (byte)0x73;
```
接下来会调用writeClassDesc()方法写入被序列化对象的类的类元数据，writeClassDesc()方法实现如下:
```java
private void writeClassDesc(ObjectStreamClass desc, boolean unshared)
    throws IOException
{
    int handle;
    if (desc == null) {
        // 如果desc为null
        writeNull();
    } else if (!unshared && (handle = handles.lookup(desc)) != -1) {
        writeHandle(handle);
    } else if (desc.isProxy()) {
        writeProxyDesc(desc, unshared);
    } else {
        writeNonProxyDesc(desc, unshared);
    }
}
```
在这个方法中会先判断传入的desc是否为null，如果为null则调用writeNull()方法
```java
private void writeNull() throws IOException {
    // TC_NULL =         (byte)0x70;
    // 表示对一个Object引用的描述的结束
    bout.writeByte(TC_NULL);
}
```
如果不为null，则一般情况下接下来会调用writeNonProxyDesc()方法，该方法实现如下:
```java
private void writeNonProxyDesc(ObjectStreamClass desc, boolean unshared)
    throws IOException
{
    // TC_CLASSDESC =    (byte)0x72;
    // 表示一个新的Class描述符
    bout.writeByte(TC_CLASSDESC);
    handles.assign(unshared ? null : desc);
 
    if (protocol == PROTOCOL_VERSION_1) {
        // do not invoke class descriptor write hook with old protocol
        desc.writeNonProxy(this);
    } else {
        writeClassDescriptor(desc);
    }
 
    Class cl = desc.forClass();
    bout.setBlockDataMode(true);
    if (cl != null && isCustomSubclass()) {
        ReflectUtil.checkPackageAccess(cl);
    }
    annotateClass(cl);
    bout.setBlockDataMode(false);
    bout.writeByte(TC_ENDBLOCKDATA);
 
    writeClassDesc(desc.getSuperDesc(), false);
}
```
在这个方法中首先会写入一个字节的TC_CLASSDESC，这个字节表示接下来的数据是一个新的Class描述符，接着会调用writeNonProxy()方法写入实际的类元信息，writeNonProxy()实现如下:
```java
void writeNonProxy(ObjectOutputStream out) throws IOException {
    out.writeUTF(name); // 写入类的名字
    out.writeLong(getSerialVersionUID()); // 写入类的序列号
 
    byte flags = 0;
    // 获取类的标识
    if (externalizable) {
        flags |= ObjectStreamConstants.SC_EXTERNALIZABLE;
        int protocol = out.getProtocolVersion();
        if (protocol != ObjectStreamConstants.PROTOCOL_VERSION_1) {
            flags |= ObjectStreamConstants.SC_BLOCK_DATA;
        }
    } else if (serializable) {
        flags |= ObjectStreamConstants.SC_SERIALIZABLE;
    }
    if (hasWriteObjectData) {
        flags |= ObjectStreamConstants.SC_WRITE_METHOD;
    }
    if (isEnum) {
        flags |= ObjectStreamConstants.SC_ENUM;
    }
    out.writeByte(flags); // 写入类的flag
 
    out.writeShort(fields.length); // 写入对象的字段的个数
    for (int i = 0; i < fields.length; i++) {
        ObjectStreamField f = fields[i];
        out.writeByte(f.getTypeCode());
        out.writeUTF(f.getName());
        if (!f.isPrimitive()) {
            // 如果不是原始类型，即是对象或者Interface
            // 则会写入表示对象或者类的类型字符串
            out.writeTypeString(f.getTypeString());
        }
    }
}
```
writeNonProxy()方法中会按照以下几个过程来写入数据:
- 1. 调用writeUTF()方法写入对象所属类的名字，对于本例中name = com.sss.test.对于writeUTF()这个方法，在写入实际的数据之前会先写入name的字节数，代码如下:
```java
void writeUTF(String s, long utflen) throws IOException {
        if (utflen > 0xFFFFL) {
            throw new UTFDataFormatException();
        }
        // 写入两个字节的s的长度
        writeShort((int) utflen);
        if (utflen == (long) s.length()) {
            writeBytes(s);
        } else {
            writeUTFBody(s);
        }
    }
```
- 2. 接下来会调用writeLong()方法写入类的序列号UID,UID是通过getSerialVersionUID()方法来获取。
- 3. 接着会判断被序列化的对象所属类的flag，并写入底层字节容器中(占用两个字节)。类的flag分为以下几类:
    - final static byte SC_EXTERNALIZABLE = 0×04;表示该类为Externalizable类，即实现了Externalizable接口。
    - final static byte SC_SERIALIZABLE = 0×02;表示该类实现了Serializable接口。
    - final static byte SC_WRITE_METHOD = 0×01;表示该类实现了Serializable接口且自定义了writeObject()方法。
    - final static byte SC_ENUM = 0×10;表示该类是个Enum类型。
对于本例中flag = 0×02表示只是Serializable类型。
- 4. 依次写入被序列化对象的字段的元数据。
<1> 首先会写入被序列化对象的字段的个数，占用两个字节。本例中为2，因为TestObject类中只有两个字段，一个是int类型的testValue，一个是InnerObject类型的innerValue。
<2> 依次写入每个字段的元数据。每个单独的字段由ObjectStreamField类来表示。

1.写入字段的类型码，占一个字节。 类型码的映射关系如下
![ 类型码的映射关系](http://upload-images.jianshu.io/upload_images/4685968-e7b2078da0bee13c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
2.调用writeUTF()方法写入每个字段的名字。注意，writeUTF()方法会先写入名字占用的字节数。
3.如果被写入的字段不是基本类型，则会接着调用writeTypeString()方法写入代表对象或者类的类型字符串，该方法需要一个参数，表示对应的类或者接口的字符串，最终调用的还是writeString()方法，实现如下
```java
private void writeString(String str, boolean unshared) throws IOException {
    handles.assign(unshared ? null : str);
    long utflen = bout.getUTFLength(str);
    if (utflen <= 0xFFFF) {
        // final static byte TC_STRING = (byte)0x74;
        // 表示接下来的字节表示一个字符串
        bout.writeByte(TC_STRING);
        bout.writeUTF(str, utflen);
    } else {
        bout.writeByte(TC_LONGSTRING);
        bout.writeLongUTF(str, utflen);
    }
}
```
在这个方法中会先写入一个标志位TC_STRING表示接下来的数据是一个字符串，接着会调用writeUTF()写入字符串。

执行完上面的过程之后，程序流程重新回到writeNonProxyDesc()方法中
```java
private void writeNonProxyDesc(ObjectStreamClass desc, boolean unshared)
    throws IOException
{
    // 其他省略代码
 
    // TC_ENDBLOCKDATA = (byte)0x78;
    // 表示对一个object的描述块的结束
    bout.writeByte(TC_ENDBLOCKDATA);
 
    writeClassDesc(desc.getSuperDesc(), false); // 尾递归调用，写入父类的类元数据
}
```
接下来会写入一个字节的标志位TC_ENDBLOCKDATA表示对一个object的描述块的结束。

然后会调用writeClassDesc()方法，传入父类的ObjectStreamClass对象，写入父类的类元数据。

需要注意的是writeClassDesc()这个方法是个递归调用，调用结束返回的条件是没有了父类，即传入的ObjectStreamClass对象为null，这个时候会写入一个字节的标识位TC_NULL.

在递归调用完成写入类的类元数据之后，程序执行流程回到wriyeOrdinaryObject()方法中，
```java
private void writeOrdinaryObject(Object obj,
                                 ObjectStreamClass desc,
                                 boolean unshared) throws IOException
{
    // 其他省略代码
    try {
        desc.checkSerialize();
        // 其他省略代码
        if (desc.isExternalizable() && !desc.isProxy()) {
            writeExternalData((Externalizable) obj);
        } else {
            writeSerialData(obj, desc); // 写入被序列化的对象的实例数据
        }
    } finally {
        if (extendedDebugInfo) {
            debugInfoStack.pop();
        }
    }
}
```
从上面的分析中我们可以知道，当写入类的元数据的时候，是先写子类的类元数据，然后递归调用的写入父类的类元数据。

接下来会调用writeSerialData()方法写入被序列化的对象的字段的数据，方法实现如下:
```java
private void writeSerialData(Object obj, ObjectStreamClass desc)
    throws IOException
{
    // 获取表示被序列化对象的数据的布局的ClassDataSlot数组，父类在前
    ObjectStreamClass.ClassDataSlot[] slots = desc.getClassDataLayout();
    for (int i = 0; i < slots.length; i++) {
        ObjectStreamClass slotDesc = slots[i].desc;
        if (slotDesc.hasWriteObjectMethod()) {
           // 如果被序列化对象自己实现了writeObject()方法，则执行if块里的代码
 
           // 一些省略代码
        } else {
            // 调用默认的方法写入实例数据
            defaultWriteFields(obj, slotDesc);
        }
    }
}
```
在这个方法中首先会调用getClassDataSlot()方法获取被序列化对象的数据的布局，关于这个方法官方文档中说明如下：
```java

/**
 * Returns array of ClassDataSlot instances representing the data layout
 * (including superclass data) for serialized objects described by this
 * class descriptor.  ClassDataSlots are ordered by inheritance with those
 * containing "higher" superclasses appearing first.  The final
 * ClassDataSlot contains a reference to this descriptor.
 */
 ClassDataSlot[] getClassDataLayout() throws InvalidClassException;
```
需要注意的是这个方法会把从父类继承的数据一并返回，并且表示从父类继承的数据的ClassDataSlot对象在数组的最前面。

对于没有自定义writeObject()方法的对象来说，接下来会调用defaultWriteFields()方法写入数据，该方法实现如下:
```java
private void defaultWriteFields(Object obj, ObjectStreamClass desc)
    throws IOException
{
    // 其他一些省略代码
 
    int primDataSize = desc.getPrimDataSize();
    if (primVals == null || primVals.length < primDataSize) {
        primVals = new byte[primDataSize];
    }
    // 获取对应类中的基本数据类型的数据并保存在primVals字节数组中
    desc.getPrimFieldValues(obj, primVals);
    // 把基本数据类型的数据写入底层字节容器中
    bout.write(primVals, 0, primDataSize, false);
 
    // 获取对应类的所有的字段对象
    ObjectStreamField[] fields = desc.getFields(false);
    Object[] objVals = new Object[desc.getNumObjFields()];
    int numPrimFields = fields.length - objVals.length;
    // 把对应类的Object类型(非原始类型)的对象保存到objVals数组中
    desc.getObjFieldValues(obj, objVals);
    for (int i = 0; i < objVals.length; i++) {
        // 一些省略的代码
 
        try {
            // 对所有Object类型的字段递归调用writeObject0()方法写入对应的数据
            writeObject0(objVals[i],
                         fields[numPrimFields + i].isUnshared());
        } finally {
            if (extendedDebugInfo) {
                debugInfoStack.pop();
            }
        }
    }
}
```
可以看到，在这个方法中会做下面几件事情:

<1> 获取对应类的基本类型的字段的数据，并写入到底层的字节容器中。
<2> 获取对应类的Object类型(非基本类型)的字段成员，递归调用writeObject0()方法写入相应的数据。

从上面对写入数据的分析可以知道，写入数据是是按照先父类后子类的顺序来写的。

至此，Java序列化过程分析完毕，总结一下，在本例中序列化过程如下:

![](http://upload-images.jianshu.io/upload_images/4685968-7826ad825f2ef569.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
现在可以来分析下第二步中写入的temp.out文件的内容了。
```java
aced        Stream Magic
0005        序列化版本号
73          标志位:TC_OBJECT,表示接下来是个新的Object
72          标志位:TC_CLASSDESC,表示接下来是对Class的描述
0020        类名的长度为32
636f 6d2e 6265 6175 7479 626f 7373 2e73 com.beautyboss.s
6c6f 6765 6e2e 5465 7374 4f62 6a65 6374 logen.TestObject
d3c6 7e1c 4f13 2afe 序列号
02          flag，可序列化
00 02       TestObject的字段的个数，为2
49          TypeCode，I，表示int类型
0009        字段名长度，占9个字节
7465 7374 5661 6c75 65      字段名:testValue
4c          TypeCode:L,表示是个Class或者Interface
000b        字段名长度，占11个字节
696e 6e65 724f 626a 6563 74 字段名:innerObject
74          标志位：TC_STRING，表示后面的数据是个字符串
0023        类名长度，占35个字节
4c63 6f6d 2f62 6561 7574 7962 6f73 732f  Lcom/beautyboss/
736c 6f67 656e 2f49 6e6e 6572 4f62 6a65  slogen/InnerObje
6374 3b                                  ct;
78          标志位:TC_ENDBLOCKDATA,对象的数据块描述的结束
```
接下来开始写入数据,从父类Parent开始
```java
0000 0064 parentValue的值:100
0000 012c testValue的值:300
```
接下来是写入InnerObject的类元信息
```java
73 标志位,TC_OBJECT:表示接下来是个新的Object
72 标志位,TC_CLASSDESC：表示接下来是对Class的描述
0021 类名的长度，为33
636f 6d2e 6265 6175 7479 626f 7373 com.beautyboss
2e73 6c6f 6765 6e2e 496e 6e65 724f .slogen.InnerO
626a 6563 74 bject
4f2c 148a 4024 fb12 序列号
02 flag，表示可序列化
0001 字段个数，1个
49 TypeCode,I,表示int类型
00 0a 字段名长度,10个字节
69 6e6e 6572 5661 6c75 65 innerValue
78 标志位:TC_ENDBLOCKDATA,对象的数据块描述的结束
70 标志位:TC_NULL,Null object reference.
0000 00c8 innervalue的值:200
```
## 3. 反序列化:readObject()
反序列化过程就是按照前面介绍的序列化算法来解析二进制数据。

有一个需要注意的问题就是，如果子类实现了Serializable接口，但是父类没有实现Serializable接口，这个时候进行反序列化会发生什么情况？

答：如果父类有默认构造函数的话，即使没有实现Serializable接口也不会有问题，反序列化的时候会调用默认构造函数进行初始化，否则的话反序列化的时候会抛出.InvalidClassException:异常，异常原因为no valid constructor。
# Other
## 1. static和transient字段不能被序列化。
序列化的时候所有的数据都是来自于ObejctStreamClass对象，在生成ObjectStreamClass的构造函数中会调用fields = getSerialFields(cl);这句代码来获取需要被序列化的字段，getSerialFields()方法实际上是调用getDefaultSerialFields()方法的，getDefaultSerialFields()实现如下:
```java
private static ObjectStreamField[] getDefaultSerialFields(Class<?> cl) {
    Field[] clFields = cl.getDeclaredFields();
    ArrayList<ObjectStreamField> list = new ArrayList<>();
    int mask = Modifier.STATIC | Modifier.TRANSIENT;
 
    for (int i = 0; i < clFields.length; i++) {
        if ((clFields[i].getModifiers() & mask) == 0) {
            // 如果字段既不是static也不是transient的才会被加入到需要被序列化字段列表中去
            list.add(new ObjectStreamField(clFields[i], false, true));
        }
    }
    int size = list.size();
    return (size == 0) ? NO_FIELDS :
        list.toArray(new ObjectStreamField[size]);
}
```
从上面的代码中可以很明显的看到，在计算需要被序列化的字段的时候会把被static和transient修饰的字段给过滤掉。

在进行反序列化的时候会给默认值。
##2. 如何实现自定义序列化和反序列化？
只需要被序列化的对象所属的类定义了void writeObject(ObjectOutputStream oos)和void readObject(ObjectInputStream ois)方法即可，Java序列化和反序列化的时候会调用这两个方法，那么这个功能是怎么实现的呢？

1. 在ObjectClassStream类的构造函数中有下面几行代码:
```java
cons = getSerializableConstructor(cl);
writeObjectMethod = getPrivateMethod(cl, "writeObject",
    new Class<?>[] { ObjectOutputStream.class },
    Void.TYPE);
readObjectMethod = getPrivateMethod(cl, "readObject",
    new Class<?>[] { ObjectInputStream.class },
    Void.TYPE);
readObjectNoDataMethod = getPrivateMethod(
    cl, "readObjectNoData", null, Void.TYPE);
hasWriteObjectData = (writeObjectMethod != null);
```

```java
cons = getSerializableConstructor(cl);
writeObjectMethod = getPrivateMethod(cl, "writeObject",
    new Class<?>[] { ObjectOutputStream.class },
    Void.TYPE);
readObjectMethod = getPrivateMethod(cl, "readObject",
    new Class<?>[] { ObjectInputStream.class },
    Void.TYPE);
readObjectNoDataMethod = getPrivateMethod(
    cl, "readObjectNoData", null, Void.TYPE);
hasWriteObjectData = (writeObjectMethod != null);
```

```java
cons = getSerializableConstructor(cl);
writeObjectMethod = getPrivateMethod(cl, "writeObject",
    new Class<?>[] { ObjectOutputStream.class },
    Void.TYPE);
readObjectMethod = getPrivateMethod(cl, "readObject",
    new Class<?>[] { ObjectInputStream.class },
    Void.TYPE);
readObjectNoDataMethod = getPrivateMethod(
    cl, "readObjectNoData", null, Void.TYPE);
hasWriteObjectData = (writeObjectMethod != null);
```
getPrivateMethod()方法实现如下:
```java
private static Method getPrivateMethod(Class<?> cl, String name,
                                   Class<?>[] argTypes,
                                   Class<?> returnType)
{
    try {
        Method meth = cl.getDeclaredMethod(name, argTypes);
        meth.setAccessible(true);
        int mods = meth.getModifiers();
        return ((meth.getReturnType() == returnType) &&
                ((mods & Modifier.STATIC) == 0) &&
                ((mods & Modifier.PRIVATE) != 0)) ? meth : null;
    } catch (NoSuchMethodException ex) {
        return null;
    }
}
```
可以看到在ObejctStreamClass的构造函数中会查找被序列化类中有没有定义为void writeObject(ObjectOutputStream oos) 的函数，如果找到的话，则会把找到的方法赋值给writeObjectMethod这个变量，如果没有找到的话则为null。

2. 在调用writeSerialData()方法写入序列化数据的时候有
```java
private void writeSerialData(Object obj, ObjectStreamClass desc)
    throws IOException
{
    ObjectStreamClass.ClassDataSlot[] slots = desc.getClassDataLayout();
    for (int i = 0; i < slots.length; i++) {
        ObjectStreamClass slotDesc = slots[i].desc;
        if (slotDesc.hasWriteObjectMethod()) {
            // 其他一些省略代码
            try {
                curContext = new SerialCallbackContext(obj, slotDesc);
                bout.setBlockDataMode(true);
                // 在这里调用用户自定义的方法
                slotDesc.invokeWriteObject(obj, this);
                bout.setBlockDataMode(false);
                bout.writeByte(TC_ENDBLOCKDATA);
            } finally {
                curContext.setUsed();
                curContext = oldContext;
                if (extendedDebugInfo) {
                    debugInfoStack.pop();
                }
            }
 
            curPut = oldPut;
        } else {
            defaultWriteFields(obj, slotDesc);
        }
    }
}
```
首先会调用hasWriteObjectMethod()方法判断有没有自定义的writeObject(),代码如下
```java
boolean hasWriteObjectMethod() {
    return (writeObjectMethod != null);
}
```
hasWriteObjectMethod()这个方法仅仅是判断writeObjectMethod是不是等于null，而上面说了，如果用户自定义了void writeObject(ObjectOutputStream oos)这么个方法，则writeObjectMethod不为null，在if()代码块中会调用slotDesc.invokeWriteObject(obj, this);方法，该方法中会调用用户自定义的writeObject()方法。


Java编程思想相关知识点

当程序运行时，有关对象的信息就存储在了内存当中，但是当程序终止时，对象将不再继续存在。我们需要一种储存对象信息的方法，使我们的程序关闭之后他还继续存在，当我们再次打开程序时，可以轻易的还原当时的状态。这就是对象序列化的目的。 

java的对象序列化将那些实现了Serializable接口的对象转换成一个字节序列，并且能够在以后将这个字节序列完全恢复为原来的对象，甚至可以通过网络传播。 这意味着序列化机制自动弥补了不同OS之间的差异.

如此，java实现了“轻量级持久性”，为啥是轻量级，因为在java中我们还不能直接通过一个类似public这样的关键字直接使一个对象序列化，并让系统自动维护其他细节问题。因此我们只能在程序中显示地序列化与反序列化

对象序列化的概念加入到语言中是为了支持两种主要特性：
- java的远程方法调用（RMI），它使存活于其他计算机上的对象使用起来就像存活于本机上一样。当远程对象发送消息时，需要通过对象序列化来传输参数和返回值。
- 对于Java Bean来说，对象序列化是必须的。使用一个Bean时，一般情况下是在设计阶段对它的状态信息进行配置。这种状态信息必须保存下来，并在程序启动的时候进行后期恢复，这种具体工作就是由对象序列化完成的。

使用——对象实现Serializable接口（仅仅是一个标记接口，没有任何方法）。

序列化一个对象：
        1. 创建某些OutputStream对象
        2. 将其封装在一个ObjectOutputStream对象内
        3. 只需调用writeObject（）即可将对象序列化
            注：也可以为一个String调用writeObject()；也可以用与DataOutputStream相同的方法写入所有基本数据类型（它们具有同样的接口）
    
反序列化
   将一个InputStream封装在ObjectInputStream内，然后调用readObject()。最后获得的是一个引用，它指向一个向上转型的Object，所以必须向下转型才能直接设置它们

对象序列化不仅保存了对象的“全景图”，而且能够追踪对象内所包含的所有引用，并保存这些对象；接着又能对对象内包含的每个这样的引用进行追踪；以此类推。这种情况有时被称为“对象网”。

例子：
    ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("worm.out");
    out.writeObject(w);
    out.close();
    ObjectInputStream in = new ObjectInputStream(new FileInputStream("worm.out");
    String s = (String)in.readObject();

 在对一个Serializable对象进行还原的过程中，没有调用任何构造器，包括默认的构造器。
整个对象都是通过InputStream中取得数据恢复而来的。

寻找类：必须保证java虚拟机能够找到相关的.class文件。找不到就会得到一个ClassNotFOundExcption的异常。

序列化的控制——通过实现Externalizable接口——代替实现Serializable接口——来对序列化过程进行控制。
    1. Externalizable接口继承了Serializable接口，增加了两个方法，writeExternal()和readExternal()，这两个方法会在序列化和反序列化还原的过程中被自动调用。
    2. Externalizable对象，在还原的时候所有普通的默认构造器都会被调用（包括在字段定义时的初始化）(只有这样才能使Externalizable对象产生正确的行为)，然后调用readExternal().
    3. 如果我们从一个Externalizable对象继承，通常需要调用基类版本的writeExternal()和readExternal()来为基类组件提供恰当的存储和恢复功能。
    4. 为了正常运行，我们不仅需要在writeExternal()方法中将来自对象的重要信息写入，还必须在readExternal（）中恢复数据

 防止对象的敏感部分被序列化，两种方式：
        1. 将类实现Externalizable，在writeExternal()内部只对所需部分进行显示的序列化
        2. 实现Serializable，用transient(瞬时)关键字（只能和Serializable一起使用）逐个字段的关闭序列化，他的意思：不用麻烦你保存或恢复数据——我自己会处理。

Externalizable的替代方法
        1. 实现Serializable接口，并添加名为writeObject()和readObject()的方法，这样一旦对象被序列化或者被反序列化还原，就会自动的分别调用writeObject()和readObject()的方法（它们不是接口的一部分，接口的所有东西都是public的）。只要提供这两个方法，就会使用它们而不是默认的序列化机制。
        2. 这两个方法必须具有准确的方法特征签名，但是这两个方法并不在这个类中的其他方法中调用，而是在ObjectOutputStream和ObjectInputStream对象的writeObject()和readObject()方法
            [图片上传失败...(image-c92672-1517928660769)] 
        3. 技巧：在你的writeObject()和readObject()内部调用defaultWriteObject()和defaultReadObject来选择执行默认的writeObject()和readObject()；如果打算使用默认机制写入对象的非transient部分，那么必须调用defaultwriteObject()和defaultReadObject()，且作为writeObject()和readObject()的第一个操作。

使用“持久性”
    1. 只要将任何对象序列化到单一流中，就可以恢复出与我们写出时一样的对象网，并且没有任何意外重复复制出的对象。当然，我们可以在写出第一个对象和写出最后一个对象期间改变这些对象的状态，但是这是我们自己的事；无论对象在被序列化时处于什么状态（无论它们和其他对象有什么样的连接关系），我们都可以被写出。
    2. Class是Serializable的，因此只需要直接对Class对象序列化，就可以很容易的保存static字段，任何情况下，这都是一种明智的做法。但是必须自己动手去实现序列化static的值。
        使用serializeStaticState()和deserializeStaticState()两个static方法，它们是作为存储和读取过程的一部分被显示的调用的
    3. 安全问题：序列化会将private数据保存下来，对于你关心的安全问题，应将其标记为transient。但是这之后，你还必须设计一种安全的保存信息的方法，以便在执行恢复时可以复位那些private变量。
