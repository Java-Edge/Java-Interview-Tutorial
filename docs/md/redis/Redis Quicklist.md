# Redis Quicklist 竟让内存占用狂降50%？

## 0 引言

Redis 作为一种高效的内存型键值数据库，得益于其底层数据结构的精妙设计。对于 List 类型的数据，Redis 从早期的简单链表（linkedlist），到压缩列表（ziplist），再到如今的 **quicklist** 和 **listpack**，不断优化以平衡内存利用率和性能。这篇文章将深入剖析 Redis 的 quicklist 和 listpack 数据结构，帮助 Java 技术专家理解其背后的设计思想与使用场景。

### Redis List 结构的演进

在 Redis 早期的版本中，List 类型的数据主要通过链表（LinkedList）实现，虽然链表在插入和删除操作上有较高的效率，但链表的节点分散存储，不利于内存的连续性，也会带来较高的内存消耗。为了解决这些问题，Redis 引入了压缩列表（ziplist），一个将所有元素紧凑存储在一块连续内存空间中的结构，极大地提升了内存利用率。

然而，随着数据量的增加，ziplist 也暴露出了其操作上的性能瓶颈。为此，Redis 开发了 quicklist，将链表和压缩列表的优势结合。Redis 5.0 引入了 listpack，作为压缩列表的替代方案，进一步优化内存利用率和性能。

## 1 Quicklist：链表与压缩列表的结合

### 1.1 结构概览

**Quicklist** 是一个结合了双向链表和压缩列表的混合结构。它将链表的每一个节点设计为一个压缩列表（ziplist），这样既保持了链表的插入和删除优势，又通过压缩列表提高了内存利用率。

```java
struct quicklist {
    quicklistNode *head;
    quicklistNode *tail;
    unsigned long count;        /* List element count */
    unsigned int len;           /* Number of quicklistNodes */
    int fill : 16;              /* fill factor for individual nodes */
    unsigned int compress : 16; /* depth of end nodes not to compress */
};
```

每个 `quicklistNode` 包含一个 `ziplist`，它们之间通过双向链表连接。`fill` 参数控制每个节点中可以容纳的元素数量，`compress` 参数决定了 quicklist 在两端保留多少未压缩的节点，用于提高频繁访问区域的性能。

### 1.2 操作原理

- **插入操作**：当一个元素被插入到 List 中时，Redis 会首先检查目标 quicklistNode 中的压缩列表是否有空间。如果空间足够，则直接在对应的 ziplist 中进行插入操作；否则，会在当前链表节点之前或之后创建一个新的 quicklistNode，并将元素插入其中。
- **删除操作**：类似于插入，删除操作会定位到元素所在的压缩列表进行删除操作。如果一个 ziplist 中的元素被全部删除，整个 quicklistNode 也会被释放。

### 1.3 内存与性能权衡

Quicklist 的最大优势在于其内存与性能的灵活平衡。通过将元素存储在紧凑的压缩列表中，减少了内存碎片问题，而双向链表结构则确保了较高效的插入和删除性能。需要注意的是，quicklist 中的压缩列表数量受 `fill` 参数影响，填充因子的调优在性能和内存占用之间找到平衡尤为关键。

## 2. Listpack：压缩列表的继任者

Redis 5.0 引入了 **Listpack**，一种类似于压缩列表的数据结构，但它相比 ziplist 在设计上有更多的改进，主要用于实现 Redis 的 Sorted Set 和 Hash 中的小对象集合。

### 2.1 结构概览

**Listpack** 是一种紧凑的、连续的内存存储结构，用来存放一系列长度不固定的字符串或整数。与 ziplist 类似，Listpack 也在一块连续的内存中存储数据，但其更简化的结构设计带来了更高的性能和更低的内存开销。

```c
struct listpack {
    unsigned char *entry_start; // Listpack entries start here
    unsigned int total_bytes;   // Total size of the listpack
    unsigned int num_entries;   // Number of entries in the listpack
};
```

Listpack 采用变长编码的方式来存储每个元素，并且每个 entry 的开销比 ziplist 更低。其设计目标是确保在存储小型数据集合时，比 ziplist 更加高效。

### 2.2 优化细节

- **内存优化**：Listpack 采用了更加紧凑的编码方式，减少了元素的元数据开销。例如，Listpack 使用一个字节来表示整数，而 ziplist 则可能需要额外的元数据。
- **性能优化**：Listpack 的简单结构使其在插入和删除操作上比 ziplist 更高效，特别是在遍历整个 Listpack 的时候，性能表现更为优异。

### 2.3 使用场景

Listpack 主要用于 Redis 的 Sorted Set、Hash 和 Stream 的实现中。当数据量较少时，Listpack 能够提供优秀的内存利用率；当数据量增多时，Redis 会自动将其转换为其他数据结构（如 skiplist 或 hash 表）。

## 3 Quicklist 与 Listpack 的对比

| 特性               | Quicklist              | Listpack                      |
| ------------------ | ---------------------- | ----------------------------- |
| 结构类型           | 链表 + 压缩列表        | 紧凑型连续内存结构            |
| 主要应用场景       | Redis List             | Redis Sorted Set, Hash        |
| 内存占用           | 中等，可调优           | 极低                          |
| 插入/删除性能      | 较好，链表提供快速操作 | 较好，适合小型集合            |
| 数据量增加时的行为 | 自动分裂为多个 ziplist | 转换为复杂结构（如 skiplist） |

## 4 Java 开发者的思考：数据结构选择的启示

对于 Java 开发者来说，Redis 的 quicklist 和 listpack 设计提供了许多数据结构设计上的启发：

- **内存与性能的平衡**：Redis 的 quicklist 通过结合链表与紧凑列表实现了内存利用率与操作性能之间的平衡。在 Java 开发中，类似的权衡也可以用于选择合适的数据结构。对于小型集合，紧凑存储能够有效降低内存占用；而对于大型集合或频繁插入/删除的场景，链表或其他高效的数据结构则更加适合。
- **优化缓存命中率**：quicklist 通过紧凑存储元素，提升了 CPU 缓存的利用率。这种思想在 Java 应用中也可以借鉴，尤其是在对性能要求较高的系统中，合理设计数据结构以最大化利用 CPU 缓存是提升性能的关键。
- **变长编码的高效性**：Listpack 采用变长编码方式存储数据，减少了存储小型整数或短字符串的开销。在 Java 开发中，类似的思想也可以通过使用合适的序列化策略或者优化对象的存储格式来实现。

## 5 总结

Redis 的 quicklist 和 listpack 通过不同的设计策略，分别在内存利用和性能优化上提供了独特的解决方案。对于 Java 技术专家来说，理解这些底层数据结构的设计不仅有助于更好地使用 Redis，也为开发高性能应用提供了宝贵的借鉴。通过学习这些优化思路，我们可以在自己的系统设计中更好地权衡内存与性能，选择合适的数据结构来满足不同场景的需求。