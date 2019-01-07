# 1 概述
本文将介绍Map集合的另一个常用类,Hashtable.Hashtable出来的比HashMap早,HashMap1.2才有,而Hashtable在1.0就已经出现了.HashMap和Hashtable实现原理基本一样,都是通过哈希表实现.而且两者处理冲突的方式也一样,都是通过链表法.下面就详细学习下这个类.

#2 源码解析
##类总览
```
public class Hashtable<K,V>
    extends Dictionary<K,V>
    implements Map<K,V>, Cloneable, java.io.Serializable
```
Hashtable并没有去继承AbstractMap，而是选择继承了Dictionary类，Dictionary是个被废弃的抽象类，文档已经说得很清楚了：

```
NOTE: This class is obsolete.  New implementations should  
 * implement the Map interface, rather than extending this class.  
```
这个类的方法如下（全是抽象方法）：

```
public abstract  
class Dictionary<K,V> {  
    
    public Dictionary() {  
    }  
    abstract public int size();  
    abstract public boolean isEmpty();  
    abstract public Enumeration<K> keys();  
    abstract public Enumeration<V> elements();  
    abstract public V get(Object key);  
    abstract public V put(K key, V value);  
    abstract public V remove(Object key);  
}  
```
##成员变量

```
   //存储键值对的桶数组  
   private transient Entry<K,V>[] table;

   //键值对总数 
   private transient int count;  
  
   //容量的阈值，超过此容量将会导致扩容。值为容量*负载因子    
   private int threshold;  
   
   //负载因子    
   private float loadFactor;  
   
   //hashtable被改变的次数，用于快速失败机制 
   private transient int modCount = 0;  
```
成员变量跟HashMap基本类似，但是HashMap更加规范，HashMap内部还定义了一些常量，比如默认的负载因子，默认的容量，最大容量等等。
##构造方法

```
//可指定初始容量和加载因子  
public Hashtable(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)  
            throw new IllegalArgumentException("Illegal Capacity: "+  
                                               initialCapacity);  
        if (loadFactor <= 0 || Float.isNaN(loadFactor))  
            throw new IllegalArgumentException("Illegal Load: "+loadFactor);  
        if (initialCapacity==0) 
            //初始容量最小值为1  
            initialCapacity = 1; 
        this.loadFactor = loadFactor;  
        //创建桶数组
        table = new Entry[initialCapacity];  
        //初始化容量阈值  
        threshold = (int)Math.min(initialCapacity * loadFactor, MAX_ARRAY_SIZE + 1);
        useAltHashing = sun.misc.VM.isBooted() &&  
                (initialCapacity >= Holder.ALTERNATIVE_HASHING_THRESHOLD);  
    }  
    
    public Hashtable(int initialCapacity) { 
        //默认负载因子为0.75   
        this(initialCapacity, 0.75f);
    }  
    public Hashtable() {  
        this(11, 0.75f);//默认容量为11，负载因子为0.75  
    }  
   
    public Hashtable(Map<? extends K, ? extends V> t) {  
        this(Math.max(2*t.size(), 11), 0.75f);  
        putAll(t);  
    }  
```

 1. Hashtable的默认容量为11，默认负载因子为0.75.(HashMap默认容量为16，默认负载因子也是0.75)
 2. Hashtable的容量可以为任意整数，最小值为1，而HashMap的容量始终为2的n次方
 3. 为避免扩容带来的性能问题，建议指定合理容量。

另外我们看到，Hashtable的编码相比较HashMap不是很规范，构造器中出现了硬编码，而HashMap中定义了常量。

跟HashMap一样，Hashtable内部也有一个静态类叫Entry，其实是个键值对对象，保存了键和值的引用。也可以理解为一个单链表的结点，因为其持有下一个Entry对象的引用：
##Entry类

```
private static class Entry<K,V> implements Map.Entry<K,V> {//键值对对象  
        int hash;  
        final K key;  
        V value;  
        Entry<K,V> next;  
        protected Entry(int hash, K key, V value, Entry<K,V> next) {  
            this.hash = hash;  
            this.key =  key;  
            this.value = value;  
            this.next = next;  
        }  
        protected Object clone() {  
            return new Entry<>(hash, key, value,  
                                  (next==null ? null : (Entry<K,V>) next.clone()));  
        }  
        // Map.Entry Ops  
        public K getKey() {  
            return key;  
        }  
        public V getValue() {  
            return value;  
        }  
        public V setValue(V value) {  
            if (value == null)  
                throw new NullPointerException();  
            V oldValue = this.value;  
            this.value = value;  
            return oldValue;  
        }  
        public boolean equals(Object o) {  
            if (!(o instanceof Map.Entry))  
                return false;  
            Map.Entry<?,?> e = (Map.Entry)o;  
            return key.equals(e.getKey()) && value.equals(e.getValue());  
        }  
        public int hashCode() {  
            return hash ^ value.hashCode();  
        }  
        public String toString() {  
            return key.toString()+"="+value.toString();  
        }  
    }  
```
再次强调：HashMap和Hashtable存储的是键值对对象，而不是单独的键或值。
明确了存储方式后，再看put和get方法：
##put方法

```
//向哈希表中添加键值对
public synchronized V put(K key, V value) {  
        //确保值不为空 
        if (value == null) {  
            throw new NullPointerException();  
        }  
        // Makes sure the key is not already in the hashtable.  
        Entry tab[] = table; 
        //生成键的hash值,若key为null，此方法会抛异常   
        int hash = hash(key);
        //通过hash值找到其存储位置  
        int index = (hash & 0x7FFFFFFF) % tab.length;
        //遍历链表  
        for (Entry<K,V> e = tab[index] ; e != null ; e = e.next) {
            //若键相同，则直接覆盖旧值  
            if ((e.hash == hash) && e.key.equals(key)) {
                V old = e.value;  
                e.value = value;  
                return old;  
            }  
        }  
        modCount++;  
        //当前容量超过阈值,需要扩容 
        if (count >= threshold) { 
            //重新构建桶数组，并对数组中所有键值对重哈希，耗时！        
            rehash();  
            tab = table;  
            hash = hash(key);  
            index = (hash & 0x7FFFFFFF) % tab.length;  
        }   
        Entry<K,V> e = tab[index];  
        //将新结点插到链表首部  
        tab[index] = new Entry<>(hash, key, value, e);//生成一个新结点  
        count++;  
        return null;  
    }
```
Hasbtable并不允许值和键为空（null），若为空，会抛空指针.大家可能奇怪，put方法在开始处仅对value进行判断，并未对key判断，可能是设计者的疏忽。当然，这并不影响使用，因为当调用hash方法时，若key为空，依然会抛出空指针异常：

```
private int hash(Object k) {  
        if (useAltHashing) {  
            if (k.getClass() == String.class) {  
                return sun.misc.Hashing.stringHash32((String) k);  
            } else {  
                int h = hashSeed ^ k.hashCode();  
                h ^= (h >>> 20) ^ (h >>> 12);  
                return h ^ (h >>> 7) ^ (h >>> 4);  
             }  
        } else  {  
            return k.hashCode();//此处可能抛空指针异常  
        }  
    }  
```

 - HashMap计算索引的方式是h&(length-1),而Hashtable用的是模运算，效率上是低于HashMap的
 - Hashtable计算索引时将hash值先与上0x7FFFFFFF,这是为了保证hash值始终为正数
 - 特别需要注意的是这个方法包括下面要讲的若干方法都加了synchronized关键字，也就意味着这个Hashtable是个线程安全的类，这也是它和HashMap最大的不同点
 
#rehash方法

```
protected void rehash() { 
        //记录旧容量  
        int oldCapacity = table.length; 
        //记录旧的桶数组   
        Entry<K,V>[] oldMap = table;
        //可能会溢出 
        //扩容为原容量的2倍加1
        int newCapacity = (oldCapacity << 1) + 1;  
        if (newCapacity - MAX_ARRAY_SIZE > 0) {  
            if (oldCapacity == MAX_ARRAY_SIZE)
                return; 
            //容量不得超过约定的最大值,若超过依旧保持为约定的最大值     
            newCapacity = MAX_ARRAY_SIZE;  
        }  
        //创建新的数组  
        Entry<K,V>[] newMap = new Entry[newCapacity];
        //结构改变计数器加一
        modCount++;  
        threshold = (int)Math.min(newCapacity * loadFactor, MAX_ARRAY_SIZE + 1);  
        boolean currentAltHashing = useAltHashing;  
        useAltHashing = sun.misc.VM.isBooted() &&  
                (newCapacity >= Holder.ALTERNATIVE_HASHING_THRESHOLD);  
        boolean rehash = currentAltHashing ^ useAltHashing;  
        table = newMap;  
        //转移键值对到新数组 
        for (int i = oldCapacity ; i-- > 0 ;) { 
            for (Entry<K,V> old = oldMap[i] ; old != null ; ) {  
                Entry<K,V> e = old;  
                old = old.next;  
                if (rehash) {  
                    e.hash = hash(e.key);  
                }  
                int index = (e.hash & 0x7FFFFFFF) % newCapacity;  
                e.next = newMap[index];  
                newMap[index] = e;  
            }  
        }  
    } 
```
Hashtable每次扩容,容量都为原来的2倍加1,而HashMap为原来的2倍.
##get方法

```
public synchronized V get(Object key) {//根据键取出对应索引  
      Entry tab[] = table;  
      int hash = hash(key);//先根据key计算hash值  
      int index = (hash & 0x7FFFFFFF) % tab.length;//再根据hash值找到索引  
      for (Entry<K,V> e = tab[index] ; e != null ; e = e.next) {//遍历entry链  
          if ((e.hash == hash) && e.key.equals(key)) {//若找到该键  
              return e.value;//返回对应的值  
          }  
      }  
      return null;//否则返回null  
  } 
```
##remove方法

```
public synchronized V remove(Object key) {//删除指定键值对  
       Entry tab[] = table;  
       int hash = hash(key);//计算hash值  
       int index = (hash & 0x7FFFFFFF) % tab.length;//计算索引  
       for (Entry<K,V> e = tab[index], prev = null ; e != null ; prev = e, e = e.next) {//遍历entry链  
           if ((e.hash == hash) && e.key.equals(key)) {//找到指定键  
               modCount++;  
               if (prev != null) {//修改相关指针  
                   prev.next = e.next;  
               } else {  
                   tab[index] = e.next;  
               }  
               count--;  
               V oldValue = e.value;  
               e.value = null;  
               return oldValue;  
           }  
       }  
       return null;  
   } 
```
##clear方法

```
//清空桶数组  
public synchronized void clear() {
       Entry tab[] = table;  
       modCount++;  
       for (int index = tab.length; --index >= 0; )  
           tab[index] = null;//直接置空  
       count = 0;  
   }  
```
##获取键集(keySet)和键值集(entrySet)的方法

```
public Set<K> keySet() {  
        if (keySet == null)//通过Collections的包装，返回的是线程安全的键集  
            keySet = Collections.synchronizedSet(new KeySet(), this);  
        return keySet;  
    }  
 public Set<Map.Entry<K,V>> entrySet() {  
        if (entrySet==null)//通过Collections的包装，返回的是线程安全的键值集  
            entrySet = Collections.synchronizedSet(new EntrySet(), this);  
        return entrySet;  
    }  
```
这个KeySet和EntrySet是Hashtable的两个内部类:

```
private class KeySet extends AbstractSet<K> {  
       public Iterator<K> iterator() {  
           return getIterator(KEYS);  
       }  
       public int size() {  
           return count;  
       }  
       public boolean contains(Object o) {  
           return containsKey(o);  
       }  
       public boolean remove(Object o) {  
           return Hashtable.this.remove(o) != null;  
       }  
       public void clear() {  
           Hashtable.this.clear();  
       }  
   }  
```
#3 总结

 1. Hashtable是线程安全的类（HashMap非线程安全）
 2. HashTable不允许null值(key和value都不可以) ；HashMap允许null值(key和value都可以)
 3. HashTable有一个contains(Object value)功能和containsValue(Object
value)功能一样
 3. Hashtable不允许键重复，若键重复，则新插入的值会覆盖旧值（同HashMap）
 4. HashTable使用Enumeration进行遍历；HashMap使用Iterator进行遍历
 4. Hashtable同样是通过链表法解决冲突
 5. 哈希值的使用不同，HashTable直接使用对象的hashCode； HashMap重新计算hash值，而且用与代替求模
 5. Hashtable根据hashCode()计算索引时将hash值先与上0x7FFFFFFF,这是为了保证hash值始终为正数
 6. Hashtable的容量为任意正数（最小为1），而HashMap的容量始终为2的n次方.Hashtable默认容量为 11，HashMap默认容量为16
 7. Hashtable每次扩容,新容量为旧容量的2倍加1，而HashMap为旧容量的2倍
 8. Hashtable和HashMap默认负载因子都为0.75
