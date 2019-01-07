# 1 数据结构及算法基础
## 1.1 索引到底是什么？
官方定义：索引（Index）是帮助MySQL高效获取数据的数据结构，即索引是数据结构。
其出现就是为了提高数据查询效率，就像书的目录。

既然是查询，就主要需要从查询算法角度优化。
- 最基本的查询算法[顺序查找](http://en.wikipedia.org/wiki/Linear_search)（linear search），复杂度为O(n)的算法在数据量大时是糟糕的。
- 更优秀的查找算法，如二分查找要求被检索数据有序，二叉树查找只能应用于[二叉查找树](http://en.wikipedia.org/wiki/Binary_search_tree)，但`数据本身的组织结构不可能完全满足各种数据结构`

所以，在数据之外，数据库系统还维护着`满足特定查找算法的数据结构`，这些数据结构以某种方式引用（指向）数据，这样就可以`在这些数据结构上实现高级查找算法`
这种ADT，就是索引。

- 一种可能的索引方式
![图1  一个例子](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtYzY1YmUwNzMzM2RiZmIyNy5wbmc?x-oss-process=image/format,png)

左边是数据表，两列14条记录，最左边是数据记录的物理地址。
为加快`Col2`的查找，可维护一个右边所示二叉查找树，每个节点分别包含索引键值及一个指向对应数据记录物理地址的指针，这样就可以运用二叉查找在O(log2 N)内取到相应数据。
但实际数据库系统几乎没有使用二叉查找树或其进化品种[红黑树](http://en.wikipedia.org/wiki/Red-black_tree)（red-black tree）实现


## 1.4 主存存取原理
计算机使用的主存基本都是随机读写存储器（RAM），抽象出一个十分简单的存取模型来说明RAM的工作原理

从抽象角度看，主存是一系列的存储单元组成的矩阵，每个存储单元存储固定大小的数据
每个存储单元有唯一的地址，现代主存的编址规则比较复杂，这里将其简化成一个二维地址：通过一个行地址和一个列地址可以唯一定位到一个存储单元
- 存取过程
当系统需要读取主存时，将地址信号通过地址总线传给主存，主存读到地址信号后，解析信号并定位到指定存储单元，然后将此存储单元数据放到数据总线，供其它部件读取

- 写主存
过程类似，系统将要写入单元地址和数据分别放在地址总线和数据总线上，主存读取两个总线的内容，做相应的写操作

这里可以看出，主存存取的时间仅与存取次数呈线性关系，因为不存在机械操作，两次存取的数据的“距离”不会对时间有任何影响，例如，先取A0再取A1和先取A0再取D3的时间消耗是一样的
## 1.5  磁盘存取原理
索引一般以文件形式存储在磁盘上，索引检索需要磁盘I/O。与主存不同，磁盘I/O存在机械消耗，因此磁盘I/O时间消耗巨大。

磁盘由大小相同且同轴的圆形盘片组成，磁盘可以转动（各磁盘必须同步转动）
在磁盘的一侧有磁头支架，磁头支架固定了一组磁头，每个磁头负责存取一个磁盘的内容。磁头不能转动，但是可以沿磁盘半径方向运动（实际是斜切向运动），每个磁头同一时刻也必须是同轴的，即从正上方向下看，所有磁头任何时候都是重叠的（不过目前已经有多磁头独立技术，可不受此限制）

盘片被划分成一系列同心环，圆心是盘片中心，每个同心环叫做一个磁道，所有半径相同的磁道组成一个柱面。磁道被沿半径线划分成一个个小的段，每个段叫做一个扇区，每个扇区是磁盘的最小存储单元。为了简单起见，我们下面假设磁盘只有一个盘片和一个磁头。

当需要从磁盘读取数据时，系统会将数据逻辑地址传给磁盘，磁盘的控制电路按照寻址逻辑将逻辑地址翻译成物理地址，即确定要读的数据在哪个磁道，哪个扇区
为了读取这个扇区的数据，需要将磁头放到这个扇区上方，为了实现这一点，磁头需要移动对准相应磁道，这个过程叫做寻道，所耗费时间叫做寻道时间，然后磁盘旋转将目标扇区旋转到磁头下，这个过程耗费的时间叫做旋转时间
## 1.6  局部性原理与磁盘预读
由于存储介质特性，磁盘本身存取就比主存慢，再加上机械运动耗费，磁盘存取速度往往是主存的几百万分之一，因此要提高效率，必须减少磁盘I/O。
为了达到这个目的，磁盘往往也不是严格按需读取，而是每次都会预读，即使只需要一个字节，磁盘也会从这个位置开始，顺序向后再读取一定长度的数据放入内存。
这样做的理论依据是计算机科学中著名的局部性原理：
`当一个数据被用到时，其附近的数据也通常会马上被使用`，`程序运行期间所需要的数据通常比较集中`。
由于磁盘顺序读取的效率很高（无需寻道时间，只需很少的旋转时间），因此对于具有局部性的程序来说，预读可以提高I/O效率。

`预读的长度一般为页（page）的整数倍`。innodb 默认一次读取 16k 。
页是存储器的逻辑块，os往往将主存和磁盘存储区分割为连续的大小相等的块，每个存储块称为一页（许多 os 的页大小一般为4k），主存和磁盘以页为单位交换数据。
当程序要读取的数据不在主存中时，会触发缺页异常，系统会向磁盘发出读盘信号，磁盘会找到数据的起始位置并向后连续读取一页或几页载入内存中，然后异常返回，程序继续运行。

## 1.7 性能分析
一般使用磁盘I/O次数评价索引结构的优劣

### 1.7.1 为什么不用平衡二叉树？
平衡二叉树只有两个分支，而B+树的分支≥2；
B+树的层数只会小于平衡二叉树，层数越少，在查询时所需要的 I/O 硬盘访问越少，查询速度相对更快，提高了对系统资源的利用率。

### 1.7.2 为什么不用红黑树？
h明显要深的多。由于逻辑上很近的节点（父子）物理上可能很远，无法利用局部性，所以红黑树的I/O渐进复杂度也为O(h)，效率明显比B-Tree差很多

B+Tree更适合外存索引，原因和内节点出度d有关
从上面分析可以看到，`d越大索引的性能越好`
`出度的上限取决于节点内key和data的大小`：
```bash
dmax=floor(pagesize/(keysize+datasize+pointsize))
```
floor表示向下取整。由于B+Tree内节点去掉了data域，因此可以拥有更大的出度，更好的性能。

### 1.7.3 B Tree分析
定义数据记录为一个二元组[key, data]
- key为记录的键值，对于不同数据记录，key互不相同
- data为数据记录除key外的数据

B Tree有如下特点:
- d为大于1的一个正整数，称为B-Tree的度
- h为一个正整数，称为B-Tree的高度
- 每个非叶节点由n-1个key和n个指针组成，其中d<=n<=2d
- 每个叶节点最少包含一个key和两个指针，最多包含2d-1个key和2d个指针，叶节点的指针均为null
- 所有叶节点具有相同的深度，等于树高h
- key和指针互相间隔，节点两端是指针
- 一个节点中的key从左到右非递减排列
- 所有节点组成树结构
- 每个指针要么为null，要么指向另外一个节点
- 如果某个指针在节点node最左边且不为null，则其指向节点的所有key小于>v(key1),v(key1)为node的第一个key的值
- 如果某个指针在节点node最右边且不为null，则其指向节点的所有key大于v(keym),v(keym)为node的最后一个key的值。
- 如果某个指针在节点node的左右相邻key分别是keyi,keyi+1且不为null，则其指向节点的所有key小于v(keyi+1)且大于v(keyi)

由于B Tree的特性,按key检索数据的算法非常直观
- 首先从根节点二分查找
- 如果找到则返回对应节点的data
- 否则对相应区间的指针指向的节点递归进行查找
- 直到找到目标节点/null指针，查找成功/失败
```java
bTreeSearch(node, key) {
    if(node == null) return null;
    foreach(node.key) {
        if(node.key[i] == key) return node.data[i];
            if(node.key[i] > key) return bTreeSearch(point[i]->node);
    }
    return bTreeSearch(point[i+1]->node);
}
data = bTreeSearch(root, my_key);
```
关于B-Tree有一系列有趣的性质，例如一个度为d的B-Tree，设其索引N个key，则其树高h的上限为![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMzRhYTNkOTJjOGNkYzA5Yy5wbmc?x-oss-process=image/format,png)
检索一个key，其查找节点个数的渐进时间复杂度为![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtNzAxYWY1NjMxMzRjZmUyMC5wbmc?x-oss-process=image/format,png)
从这点可以看出，B Tree是一个非常有效率的索引数据结构。

检索一次最多需要访问h个节点。数据库系统的设计者巧妙利用了磁盘预读原理（磁盘数据存储是采用块的形式存储的，每个块的大小为4K，每次IO进行数据读取时，同一个磁盘块的数据可以一次性读取出来），将一个节点的大小设为块的整数倍16K，这样每个磁盘块只需要一次I/O就可以完全载入内存。

为了达到这个目的，在实际实现B-Tree还需要使用如下技巧：
1. 每次新建节点时，直接申请一个页的空间，保证一个节点物理上也存储在一个页里，而且计算机存储分配都是按页对齐，就实现了一个node只需一次I/O
2. B-Tree中一次检索最多需要h-1次I/O（根节点是常驻内存的），渐进复杂度为O(h)=O(logdN)

以InnoDB的一个整数字段索引为例，N差不多是1200。树高是4时，可存1200的3次方，即17亿。考虑到根的数据块总在内存，一个10亿行的表上一个整数字段的索引，查找一个值最多只需要访问3次磁盘。其实，树的第二层也有很大概率在内存中，那么访问磁盘的平均次数就更少了。
综上所述，用B-Tree作为索引结构效率是非常高的。但是其内部的非叶节点也存储了 data 数据，所以一个节点里也存不了多少数据。
![](https://img-blog.csdnimg.cn/20200830223131662.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)


### 1.7.4 B+树对B树的优势差异
![](https://img-blog.csdnimg.cn/20200831013206413.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)
与B Tree相比，B+Tree有以下不同点：
- 每个节点的指针上限为2d
- 内节点只存key
- 叶节点不存指针,叶节点指向被索引的数据而不是其他叶节点
    - innodb中,指向的是主键
    - myshaym中指向的是数据的物理地址
由于并不是所有节点都具有相同的域，因此B+Tree中叶节点和内节点一般大小不同
这点与B Tree不同，虽然B Tree中不同节点存放的key和指针可能数量不一致，但是每个节点的域和上限是一致的，所以在实现中B Tree往往对每个节点申请同等大小的空间。
#### 结构
-  B+ 树的非叶节点不存储数据，且所有数据节点之间指针串联（即链表）。B+Tree的每个叶节点增加一个指向相邻叶节点指针，形成带有顺序访问指针的B+Tree。此优化的目的是提高区间访问的性能，例如要查询key为从18到49的所有数据记录，当找到18后，只需顺着节点和指针顺序遍历就可以一次性访问到所有数据节点，极大提高区间查询效率

- B 树子结点带数据，且兄弟节点之间无指针串联

#### 查询性能
最简单的对比测试，假设范围查询 [0,N-1] ：
- B+ 树，只需要确定范围查询的边界节点，然后遍历即可
时间复杂度粗略算做 `2logN + N` (2logN：两个范围边界值的查找)
-  B 树可能就需要一个个查找
B 树就是 `NlogN` 

范围越大，查询性能差异越明显。

### 为什么不用 B*树？
![](https://img-blog.csdnimg.cn/20200831012857264.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70#pic_center)

B*树是B+树的变种：
1. 关键字个数限制问题，B+树初始化的关键字初始化个数是cei(m/2)，b*树的初始化个数为（cei(2/3*m)）
2. B+树节点满时就会分裂，而B*树节点满时会检查兄弟节点是否满（因为每个节点都有指向兄弟的指针），如果兄弟节点未满则向兄弟节点转移关键字，如果兄弟节点已满，则从当前节点和兄弟节点各拿出1/3的数据创建一个新的节点出来
# 2 索引的实现
索引属于存储引擎部分，不同存储引擎索引实现方式不同。
本文只讨论MyISAM和InnoDB两个存储引擎的索引实现方式

## 2.1 MyISAM索引
使用B+Tree作为索引结构，叶节点data域存放数据记录的地址

- MyISAM索引的原理图
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtM2M1MjhlMDUwYmE5OTU5My5wbmc?x-oss-process=image/format,png)
设Col1为主键，则上图是一个MyISAM表的主索引（Primary key），可见MyISAM的索引文件仅保存数据记录的地址。

MyISAM的主/辅索引在结构上无任何区别，只是主索引要求`key唯一`，辅索引`key可重复`

如果在Col2上建立一个辅索引
- Col2上建立的辅索引
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtY2EyMzQzNDFlY2MyNTlkMC5wbmc?x-oss-process=image/format,png)
同样也是一颗B+Tree，data域保存数据记录的地址。
因此，MyISAM中索引检索的算法为首先按照B+Tree搜索算法搜索索引，如果指定的Key存在，则取出其data域的值，然后以data域的值为地址，读取相应数据记录。

MyISAM的索引方式也叫“非聚集”，是为了与InnoDB的聚集索引区别。

#### `注意 聚集 = 聚簇`
## 2.2 InnoDB 索引
虽然InnoDB也使用B+Tree作为索引结构，但具体实现方式却与MyISAM截然不同

### `InnoDB的数据文件本身就是索引文件`
- MyISAM
索引文件和数据文件分离，索引仅保存数据的地址
- InnoDB
表数据文件本身就是按B+Tree组织的一个索引结构，该树的叶节点data域保存了完整的数据记录。
索引的key：数据表的主键，因此InnoDB表数据文件本身就是主索引。

-  InnoDB主索引（也是数据文件）
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtMzZhMTBlYTVjZTZmZGVhNC5wbmc?x-oss-process=image/format,png)

InnoDB的数据文件本身要按主键聚集，所以InnoDB要求表必须有主键（MyISAM可无），如果没有显式指定，则MySQL会自动选择一个可以唯一标识数据记录的列作为主键。
不存在这种列，则MySQL自动为InnoDB表生一个隐含字段作为主键，这个字段长度为6个字节，类型为长整形

### InnoDB的辅索引data域存储相应记录主键的值而非地址
即InnoDB的所有辅助索引都引用主键作为data域。

- 定义在Col3上的一个辅索引
![](https://imgconvert.csdnimg.cn/aHR0cDovL3VwbG9hZC1pbWFnZXMuamlhbnNodS5pby91cGxvYWRfaW1hZ2VzLzQ2ODU5NjgtOWU4ZWI5MDQwMjliM2JjZS5wbmc?x-oss-process=image/format,png)
这里以英文字符的ASCII码作为比较准则
聚集索引这种实现方式使得按主键的搜索十分高效，但是辅助索引搜索需要检索两遍索引：
  -   首先检索辅助索引获得主键
  - 然后用主键到主索引中检索获得记录

知道了InnoDB的索引实现后，就很容易明白为什么不建议使用过长的字段作为主键，因为所有辅索引都引用主索引，过长的主索引会令辅索引变得过大
再如，用非单调的字段作为主键在InnoDB中不是个好主意，因为InnoDB数据文件本身是一颗B+Tree，非单调的主键会造成在插入新记录时数据文件为了维持B+Tree的特性而频繁的分裂调整，十分低效，而使用自增字段作为主键则是一个很好的选择。

InnoDB表都根据主键顺序以索引形式存放，该存储方式的表称为索引组织表。
而InnoDB又使用的B+树索引模型，所以数据都是存储于B+树。

**每一个索引在InnoDB里面就对应一棵B+树。**

- 主键列id，字段k，在k上有索引的建表语句
![](https://img-blog.csdnimg.cn/20200716231848265.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

表中R1~R5的(id,k)值分别为(100,1)、(200,2)、(300,3)、(500,5)、(600,6)
- 两棵树的示意图，即InnoDB的索引组织结构
![](https://img-blog.csdnimg.cn/20200716232154390.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)

根据叶节点内容，索引类型分为
### 主键索引(聚簇索引)
InnoDB的主键索引也称聚簇索引、聚集索引（clustered index）。主键索引的叶节点存整行数据。

聚簇索引并非一种单独的索引类型，而是一种`数据存储方式`。
细节依赖其实现方式，但InnoDB 的聚簇索引实际上在同一个结构中`保存了B-Tree索引和数据行`，是对磁盘上实际数据重新组织以按指定的一个或多个列的值排序的算法。

每个 InnoDB 表都有一个称为聚集索引的特殊索引，用于存储行数据。通常，聚集索引与主键同义。为了从查询、插入和其他数据库操作中获得最佳性能，了解 InnoDB 如何使用聚集索引来优化常见的查找和 DML 操作非常重要。
- 在表上定义主键时，InnoDB 将其用作聚集索引。应该为每个表定义一个主键。若没有逻辑唯一且非空的列或列集使用主键，请添加自增列。自增列值是唯一的，并在插入新行时自动添加
- 若未定义主键，则 InnoDB 使用第一个 UNIQUE 索引，所有键列都定义为 NOT NULL 作为聚集索引。
- 若表没有主键或合适的唯一索引，InnoDB 会在包含行 ID 值的合成列上生成一个名为 **GEN_CLUST_INDEX** 的隐藏聚集索引。行按 InnoDB 分配的行 ID 排序。行 ID 是一个 6 字节的字段，随着插入新行而单调增加。因此，按行 ID 排序的行在物理上是按插入顺序排列的。

- 特点
存储数据的顺序和索引顺序一致。

一般情况下主键会默认创建聚簇索引，`一张表只允许存在一个聚簇索引`。

当表有聚簇索引，数据实际存在索引叶子页（leaf page）中。
- `聚簇`
数据行和相邻的键值交错的存储在一起，InnoDb通过主键聚集数据。
`因无法同时把数据行存放在两个不同地方，所以在一个表只能有一个聚簇索引` （不过，覆盖索引可以模拟多个聚簇索引）。

- 若未定义主键，InnoDB 会选择一个唯一的非空索引代替
- 若无这样的索引，InnoDB 会隐式定义一个主键来作为聚簇索引
- InnoDB值聚集在同一个页面中的记录，包含相邻键值的页面可能会相距很远。

#### 聚集索引如何加快查询速度
通过聚集索引访问一行很快，因为索引搜索直接指向包含行数据的页面。若表很大，与使用与索引记录不同的页面存储行数据的存储组织相比，聚簇索引体系结构通常可以节省磁盘 I/O。

#### 二级索引与聚集索引的关系
聚集索引以外的索引称为二级索引。在 InnoDB 中，二级索引中的每条记录都包含该行的主键列，以及为二级索引指定的列。 InnoDB 使用这个主键值来搜索聚集索引中的行。

如果主键很长，二级索引会占用更多的空间，所以主键短是有利的。
### 非主键索引
也叫非聚簇索引、辅助索引、二级索引secondary index）。

非主键索引的叶节点是主键值。

主键索引 	V.S 普通索引的查询
- select * from T where ID=500，主键查询，只需搜ID这棵B+树
- select * from T where k=5，普通索引查询，需先搜k索引树，得到ID的值为500，再到ID索引树搜索（回表）。

> 回表：InnoDB在普通索引a上查到主键id的值后，再根据一个个主键id的值到主键索引上去查整行数据的过程。

非主键索引的查询需要多扫描一棵索引树。因此`尽量使用主键查询`，减少回表。

InnoDB和MyISAM是如何存储下面的这个表的
```sql
CREATE TABLE layout_test(
　　　　col1 int not null,
　　　　col2 int not null,
 　　　 primary key (col1),
　　　　key(col2)
);
```
假设该表的主键取值为1~10000，按随机顺序插入，并使用`OPTIMIZE TABLE`命令优化。
即数据在磁盘的存储方式已最优，但进行的顺序是随机的。
列col2的值时从1~100之间随机赋值，所以有很多重复值。

## MyISAM 数据分布
MyIsam按数据插入的顺序存储在磁盘。实际上，MyISAM 中主键索引和其他索引在结构上没有什么不同。主键索引就是一个名为PRIMARY的唯一非空索引。

## InnoDB 的数据分布
而InnoDB支持聚簇索引，在InnoDB中，聚簇索引“是”表，不像myISAM那样需要独立的行存储。

### 聚簇索引优点
- 把相关数据保存在一起
例如，实现电子邮箱时，可以根据用户id来聚集数据，这样只需要从磁盘读取少数数据页，就能获取某个用户的全部邮件。若未使用聚簇索引，则每封邮件都可能导致一次I/O。
- 数据访问更快
聚簇索引将索引和数据保存在同一B-Tree，从聚簇索引中获取数据通常比非聚簇索引中快
- 覆盖索引扫描的查询可以直接使用页节点中的主键值

### 聚簇索引缺点
聚簇索引最大限度提高了I/O密集型应用性能，但若数据全存内存，则访问顺序就没那么重要，聚簇索引也没啥优势了。

- 插入速度严重依赖插入的顺序
按主键的顺序插入是加载数据到innodb表中速度最快的。
但若不是按主键顺序，则加载后最好使用OPTIMIZE TABLE重新组织表。

- 更新聚簇索引的代价高
因为会强制InooDB将每个更新的数据移动到新位置。

基于聚簇索引的表在插入行，或主键被更新导致需要移动行时，可能产生页分裂（page split）。
当行的主键值要求必须将该行插入到某个满页时。存储引擎会将该页分裂成两个页面来容纳该行，这就是一次页分裂。页分裂会导致表占用更多存储空间。

聚簇索引可能导致全表扫描变慢，尤其是行比较稀疏，或由于页分裂导致数据存储不连续时。

二级索引（非聚簇索引）可能比想象的要更大，因为在二级索引的子节点包含了最优一个几点可能让人有些疑惑
- 为什么二级索引需要两次索引查找？
二级索引中保存的“行指针”的本质：不是物理地址的指针，而是行的主键值。所以通过二级索引查找行，引擎需要找到二级索引的子节点获得对应主键值，然后根据该值去聚簇索引找到对应行。
出现重复工作：两次B-Tree查找，而非一次。对于InnoDB，自适应哈希索引能够减少这样重复。

《数据库原理》解释聚簇索引和非聚簇索引区别：
- 聚簇索引的叶节点就是数据节点
- 非聚簇索引的叶节点仍是索引节点，只不过有指向对应数据块的指针

MYISAM和INNODB两种引擎的索引结构。
- 原始数据
![](https://img-blog.csdnimg.cn/20210601201544160.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

- MyISAM数据存储
![](https://img-blog.csdnimg.cn/20210601201636760.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_16,color_FFFFFF,t_70)

MYISAM按列值与行号组织索引，叶子节点保存的是指向存放数据的物理块的指针。
MYISAM引擎的索引文件（.MYI）和数据文件(.MYD)是相互独立的。

而InnoDB按聚簇索引存储数据，存储数据的结构如下：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTE1ZjYzZDM2N2EwNzdhYTQucG5n?x-oss-process=image/format,png)


注：聚簇索引中的每个叶子节点包含主键值、事务ID、回滚指针(rollback pointer用于事务和MVCC）和余下的列(如col2)。

INNODB的二级索引与主键索引有很大的不同。InnoDB的二级索引的叶子包含主键值，而不是行指针(row pointers)，这减小了移动数据或者数据页面分裂时维护二级索引的开销，因为InnoDB不需要更新索引的行指针。其结构大致如下：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LTFkNTZhNmJjNTY5NmQ0Y2MucG5n?x-oss-process=image/format,png)
INNODB和MYISAM的主键索引与二级索引的对比：
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy80Njg1OTY4LWQyMzRjYTg1OTE5ODI2NDcucG5n?x-oss-process=image/format,png)

InnoDB的的二级索引的叶子节点存放的是KEY字段加主键值。因此，通过二级索引查询首先查到是主键值，然后InnoDB再根据查到的主键值通过主键索引找到相应的数据块。而MyISAM的二级索引叶子节点存放的还是列值与行号的组合，叶子节点中保存的是数据的物理地址。所以可以看出MYISAM的主键索引和二级索引没有任何区别，主键索引仅仅只是一个叫做PRIMARY的唯一、非空的索引，且MYISAM引擎中可以不设主键。

# 3 索引的维护
B+树为维护索引的有序，插入新值时需要做必要维护。

上图为例，插入新行ID 700，只需在R5的记录后面插入。如果新插入ID 400，就麻烦了，需要逻辑上挪动后面数据，腾出位置。
更坏的结果是，如果R5所在数据页已满，需申请新数据页，然后挪部分数据过去。该过程称为页分裂，影响性能。

页分裂还影响数据页的利用率。原本放在一个页的数据，现在分两页，整体空间利用率降低。有分裂就有合并。当相邻两个页由于删除数据，利用率很低后，会将数据页合并。合并过程可认为是分裂过程的逆过程。

## 案例
建表规范：建表语句一定要有自增主键。
![](https://img-blog.csdnimg.cn/20210602141922445.png)
到底哪些场景下应该自增主键？
自增主键一般这么定义： 
```sql
NOT NULL PRIMARY KEY AUTO_INCREMENT
```
- 考虑性能
插新记录可不指定ID，系统会获取当前ID最大值加1作为新记录ID，即自增主键符合递增插入场景。每插入新记录，都是追加，不涉及挪动其他记录，也不会触发叶节点分裂。
而有业务逻辑的字段做主键，不易保证有序插入，因此写数据成本较高。

- 考虑存储空间
假设表中确实有个唯一字段身份证号，应该用身份证号做主键，还是自增字段？
因为非主键索引的叶节点都是主键值。
- 身份证号做主键，每个二级索引的叶节点占约20字节
- 整型主键，只要4字节，长整型（bigint）8字节

主键长度越小，普通索引的叶节点越小，普通索引占用空间就越小。
因此从性能和空间考虑，自增主键往往更合理。

有无场景适合用业务字段做主键？
场景如下：
1. 只有一个索引
2. 该索引须是唯一索引

即KV场景。
因为没有其他索引，所以不用考虑其他索引的叶节点大小。
要优先考虑“尽量使用主键查询”原则，直接将该索引设为主键，避免每次查询要搜两棵树。

> 参考
> - 《MySQL实战》
> - 《高性能 MySQL》