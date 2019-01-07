# 概述
排序有内部排序和外部排序
- 内部排序是数据记录在内存中进行排序
- 外部排序是因排序的数据很大，一次不能容纳全部的排序记录，在排序过程中需要访问外存

`时间复杂度为最差情况下的复杂度`

八大排序就是内部排序
![](https://img-blog.csdnimg.cn/img_convert/028a59e7bc0ba4845ba41ac27cd1b341.png)

当n较大，则应采用时间复杂度为O(nlog2n)的排序方法：快排,堆排,归排

`快速排序：是目前基于比较的内部排序中被认为是最好的方法，当待排序的关键字是随机分布时，快速排序的平均时间最短 `

# `稳定性:在值相等情况下,相对次序保持不变`

#1. 插入排序—直接插入排序(Straight Insertion Sort) 
- **基本思想:**
将一个记录插入到已排序好的有序表中，从而得到一个新且记录数增1的有序表。即：先将序列的第1个记录看成是一个有序的子序列，然后从第2个记录逐个进行插入，直至整个序列有序为止。

- 要点
设立哨兵，作为临时存储和判断数组边界之用。

- 直接插入排序示例
![](https://img-blog.csdnimg.cn/img_convert/f58238c2f0c5072ed468f974e20ec5d4.png)


`元素相等的，把欲插入的元素放在相等元素的后面`
所以，相等元素的前后顺序没有改变，从原无序序列出去的顺序就是排好序后的顺序
**所以`插入排序稳定`**

- **实现：** 
```java
public class InsertionSort {

	public static void insertionSort(int[] arr) {
		if (arr == null || arr.length < 2) {
			return;
		}
		for (int i = 1; i < arr.length; i++) {
			for (int j = i - 1; j >= 0 && arr[j] > arr[j + 1]; j--) {
				swap(arr, j, j + 1);
			}
		}
	}

	public static void swap(int[] arr, int i, int j) {
		arr[i] = arr[i] ^ arr[j];
		arr[j] = arr[i] ^ arr[j];
		arr[i] = arr[i] ^ arr[j];
	}

	// for test
	public static void comparator(int[] arr) {
		Arrays.sort(arr);
	}

	// for test
	public static int[] generateRandomArray(int maxSize, int maxValue) {
		int[] arr = new int[(int) ((maxSize + 1) * Math.random())];
		for (int i = 0; i < arr.length; i++) {
			arr[i] = (int) ((maxValue + 1) * Math.random()) - (int) (maxValue * Math.random());
		}
		return arr;
	}

	// for test
	public static int[] copyArray(int[] arr) {
		if (arr == null) {
			return null;
		}
		int[] res = new int[arr.length];
		for (int i = 0; i < arr.length; i++) {
			res[i] = arr[i];
		}
		return res;
	}

	// for test
	public static boolean isEqual(int[] arr1, int[] arr2) {
		if ((arr1 == null && arr2 != null) || (arr1 != null && arr2 == null)) {
			return false;
		}
		if (arr1 == null && arr2 == null) {
			return true;
		}
		if (arr1.length != arr2.length) {
			return false;
		}
		for (int i = 0; i < arr1.length; i++) {
			if (arr1[i] != arr2[i]) {
				return false;
			}
		}
		return true;
	}

	// for test
	public static void printArray(int[] arr) {
		if (arr == null) {
			return;
		}
		for (int i = 0; i < arr.length; i++) {
			System.out.print(arr[i] + " ");
		}
		System.out.println();
	}

	// for test
	public static void main(String[] args) {
		int testTime = 500000;
		int maxSize = 100;
		int maxValue = 100;
		boolean succeed = true;
		for (int i = 0; i < testTime; i++) {
			int[] arr1 = generateRandomArray(maxSize, maxValue);
			int[] arr2 = copyArray(arr1);
			insertionSort(arr1);
			comparator(arr2);
			if (!isEqual(arr1, arr2)) {
				succeed = false;
				break;
			}
		}
		System.out.println(succeed ? "Nice!" : "Fucking fucked!");

		int[] arr = generateRandomArray(maxSize, maxValue);
		printArray(arr);
		insertionSort(arr);
		printArray(arr);
	}

}

```
c++版本
```
void InsertSort(int a[], int n)  
{  
    for(int i= 1; i<n; i++){  
        if(a[i] < a[i-1]){               //若第i个元素大于i-1元素，直接插入。小于的话，移动有序表后插入  
            int j= i-1;   
            int x = a[i];        //复制为哨兵，即存储待排序元素  
            a[i] = a[i-1];           //先后移一个元素  
            while(x < a[j]){  //查找在有序表的插入位置  
                a[j+1] = a[j];  
                j--;         //元素后移  
            }  
            a[j+1] = x;      //插入到正确位置  
        }  
        print(a,n,i);           //打印每趟排序的结果  
    }  
      
}  
```
- **效率：**
时间复杂度：`O（n^2）`

其他的插入排序有二分插入排序，2-路插入排序。
常数项极低,所以样本容量很小时`(数组长度小于6)最快!`,Collections.sort即是如此设计
# 2 插入排序—希尔排序（Shell`s Sort） 
1959 年由D.L.Shell 提出，相对直接排序有较大的改进
又叫**缩小增量排序**
- **思想**
先将整个待排序的记录序列`分割`成为若干子序列分别进行直接插入排序
待整个序列中的记录“`基本有序`”时
再`对全体`记录进行依次直接插入排序。
![](https://img-blog.csdnimg.cn/img_convert/e086671deb051143872707bdbf1a5d9d.png)
##**实现**
简单处理增量序列
`d = {n/2 ,n/4, n/8 .....1}`, n为要排序数的个数

- 先将要排序的一组记录按某个增量d（n/2,n为要排序数的个数）分成若干组子序列
- 每组中记录的`下标相差d`,对每组中元素进行`直接插入排序`
- 再用一个较小的增量（d/2）对它进行分组
- 在每组中再进行`直接插入排序`
- 继续不断`缩小增量`直至为1，最后使用`直接插入排序`完成排序
```
/** 
 * 直接插入排序的一般形式 
 * 
 * @param int dk 缩小增量，如果是直接插入排序，dk=1 
 * 
 */  
  
void ShellInsertSort(int a[], int n, int dk)  
{  
    for(int i= dk; i<n; ++i){  
        if(a[i] < a[i-dk]){          //若第i个元素大于i-1元素，直接插入。小于的话，移动有序表后插入  
            int j = i-dk;     
            int x = a[i];           //复制为哨兵，即存储待排序元素  
            a[i] = a[i-dk];         //首先后移一个元素  
            while(x < a[j]){     //查找在有序表的插入位置  
                a[j+dk] = a[j];  
                j -= dk;             //元素后移  
            }  
            a[j+dk] = x;            //插入到正确位置  
        }  
        print(a, n,i );  
    }  
      
}  
  
/** 
 * 先按增量d（n/2,n为要排序数的个数进行希尔排序 
 * 
 */  
void shellSort(int a[], int n){  
  
    int dk = n/2;  
    while( dk >= 1  ){  
        ShellInsertSort(a, n, dk);  
        dk = dk/2;  
    }  
}  

```
希尔排序时效分析很难，关键码的比较次数与记录移动次数依赖于增量因子序列d的选取，特定情况下可以准确估算出关键码的比较次数和记录的移动次数。目前还没有人给出选取最好的增量因子序列的方法。
增量因子序列可以有各种取法，有取奇数的，也有取质数的，但需要注意：增量因子中除1 外没有公因子，且最后一个增量因子必须为1。希尔排序方法是一个不稳定的排序方法。
# 3 选择排序—简单选择排序（Simple Selection Sort）
- **思想**
在要排序的一组数中，选出最小/大的一个数与第1个位置的数交换
然后在剩下的数当中再找最小/大的与第2个位置的数交换，依次类推，直到第n-1个元素（倒数第二个数）和第n个元素（最后一个数）比较为止
![](https://img-blog.csdnimg.cn/img_convert/2c32984284709c35d943d672b6b66758.png)
- **操作**
第一趟，从n 个记录中找出关键码最小的记录与第一个记录交换；
第二趟，从第二个记录开始的n-1 个记录中再选出关键码最小的记录与第二个记录交换；
以此类推..... 
第i 趟，则从第i 个记录开始的n-i+1 个记录中选出关键码最小的记录与第i 个记录交换，
直到整个序列按关键码有序。
- **实现**
```java
/** 
 * 数组的最小值 
 * 
 * @return int 数组的键值 
 */  
int SelectMinKey(int a[], int n, int i)  
{  
    int k = i;  
    for(int j=i+1 ;j< n; ++j) {  
        if(a[k] > a[j]) k = j;  
    }  
    return k;  
}  
  
/** 
 * 选择排序 
 * 
 */  
void selectSort(int a[], int n){  
    int key, tmp;  
    for(int i = 0; i< n; ++i) {  
        key = SelectMinKey(a, n,i);           //选择最小的元素  
        if(key != i){  
            tmp = a[i];  a[i] = a[key]; a[key] = tmp; //最小元素与第i位置元素互换  
        }  
        print(a,  n , i);  
    }  
}  
```
简单选择排序的改进——二元选择排序

简单选择排序，每趟循环只能确定一个元素排序后的定位
我们可以考虑改进为每趟循环确定两个元素（当前趟最大和最小记录）的位置,从而减少排序所需的循环次数。改进后对n个数据进行排序，最多只需进行[n/2]趟循环即可。具体实现如下：

无稳定性!!!
# 4. 选择排序—堆排序（Heap Sort） 
树形选择排序，是对直接选择排序的有效改进
- **思想**
堆的定义：具有n个元素的序列（k1,k2,...,kn),当且仅当满足
![](https://img-blog.csdnimg.cn/img_convert/fd2c8099faae93a858c1f868d13f4e2d.png)
可看出，**堆顶元素**（即第一个元素）必为最小项(小顶堆)

若以一维数组存储一个堆，则堆对应一棵完全二叉树，且所有非叶结点的值均不大于(或不小于)其孩子的值，根结点（堆顶元素）的值是最小(或最大)的

如：
(a)大顶堆序列：（96, 83,27,38,11,09)
(b)小顶堆序列：（12，36，24，85，47，30，53，91）
![](https://img-blog.csdnimg.cn/img_convert/1c703395376bd66f6af3c97efc377d2c.png)
- 初始时把要排序的n个数的序列看作是一棵**顺序存储的二叉树（一维数组存储二叉树）**
调整它们的存储序，使之成为一个堆，将堆顶元素输出，得到n 个元素中最小(或最大)的元素，这时堆的根节点的数最小（或者最大）
- 然后对前面(n-1)个元素重新调整使之成为堆，输出堆顶元素，得到n 个元素中次小(或次大)的元素
- 依此类推，直到只有两个节点的堆，并对它们作交换，最后得到有n个节点的有序序列。称这个过程为**堆排序**。

因此，实现堆排序需解决`两个问题`：
1\. 如何将n 个待排序的数`建堆`
2\. 输出堆顶元素后，怎样调整剩余n-1 个元素，使其成为一个`新堆`

首先讨论第二个问题：输出堆顶元素后，对剩余n-1元素重新建成堆的调整过程
`调整小顶堆`
1. 设有m 个元素的堆，输出堆顶元素后，剩下m-1 个元素
将堆底元素送入堆顶（（最后一个元素与堆顶进行交换），堆被破坏(根结点不满足堆的性质)
2. 将根结点与左、右子树中较小元素的进行交换
3. 若与左子树交换：如果左子树堆被破坏，即左子树的根结点不满足堆的性质，则重复方法2.
4. 若与右子树交换，如果右子树堆被破坏，即右子树的根结点不满足堆的性质。则重复方法2.
5. 继续对不满足堆性质的子树进行上述交换操作，直到叶结点，堆被建成

称这个自根结点到叶子结点的调整过程为`筛选`
![](https://img-blog.csdnimg.cn/img_convert/bb0eaa0573011a198456227cc02f601d.png)

再讨论对n 个元素初始`建堆`的过程
建堆方法：对初始序列建堆的过程，就是一个反复进行筛选的过程。

1）n 个结点的完全二叉树，则最后一个结点是第`n / 2`个结点的子树
2）筛选从第`n / 2`个结点为根的子树开始，该子树成为堆。
3）之后向前依次对各结点为根的子树进行筛选，使之成为堆，直到根结点。

如图建堆初始过程：无序序列：（49，38，65，97，76，13，27，49）
 ![](https://img-blog.csdnimg.cn/img_convert/55ad03deed681eed8d45f08476ee0b32.png)
![](https://img-blog.csdnimg.cn/img_convert/33a500463204bbf6ce550ffd4afecd55.png)

- 算法的实现 
```java
package com.sss;

import java.util.Arrays;

/**
 * @author Shusheng Shi
 */
public class HeapSort {

	public static void heapSort(int[] arr) {
		if (arr == null || arr.length < 2) {
			return;
		}
		for (int i = 0; i < arr.length; i++) {
			heapInsert(arr, i);
		}
		int size = arr.length;
		swap(arr, 0, --size);
		while (size > 0) {
			heapify(arr, 0, size);
			swap(arr, 0, --size);
		}
	}

	public static void heapInsert(int[] arr, int index) {
		while (arr[index] > arr[(index - 1) / 2]) {
			swap(arr, index, (index - 1) / 2);
			index = (index - 1) / 2;
		}
	}

	public static void heapify(int[] arr, int index, int size) {
		int left = index * 2 + 1;
		while (left < size) {
			int largest = left + 1 < size && arr[left + 1] > arr[left] ? left + 1 : left;
			largest = arr[largest] > arr[index] ? largest : index;
			if (largest == index) {
				break;
			}
			swap(arr, largest, index);
			index = largest;
			left = index * 2 + 1;
		}
	}

	public static void swap(int[] arr, int i, int j) {
		int tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}

	// for test
	public static void comparator(int[] arr) {
		Arrays.sort(arr);
	}

	// for test
	public static int[] generateRandomArray(int maxSize, int maxValue) {
		int[] arr = new int[(int) ((maxSize + 1) * Math.random())];
		for (int i = 0; i < arr.length; i++) {
			arr[i] = (int) ((maxValue + 1) * Math.random()) - (int) (maxValue * Math.random());
		}
		return arr;
	}

	// for test
	public static int[] copyArray(int[] arr) {
		if (arr == null) {
			return null;
		}
		int[] res = new int[arr.length];
		for (int i = 0; i < arr.length; i++) {
			res[i] = arr[i];
		}
		return res;
	}

	// for test
	public static boolean isEqual(int[] arr1, int[] arr2) {
		if ((arr1 == null && arr2 != null) || (arr1 != null && arr2 == null)) {
			return false;
		}
		if (arr1 == null && arr2 == null) {
			return true;
		}
		if (arr1.length != arr2.length) {
			return false;
		}
		for (int i = 0; i < arr1.length; i++) {
			if (arr1[i] != arr2[i]) {
				return false;
			}
		}
		return true;
	}

	// for test
	public static void printArray(int[] arr) {
		if (arr == null) {
			return;
		}
		for (int i = 0; i < arr.length; i++) {
			System.out.print(arr[i] + " ");
		}
		System.out.println();
	}

	// for test
	public static void main(String[] args) {
		int testTime = 500000;
		int maxSize = 100;
		int maxValue = 100;
		boolean succeed = true;
		for (int i = 0; i < testTime; i++) {
			int[] arr1 = generateRandomArray(maxSize, maxValue);
			int[] arr2 = copyArray(arr1);
			heapSort(arr1);
			comparator(arr2);
			if (!isEqual(arr1, arr2)) {
				succeed = false;
				break;
			}
		}
		System.out.println(succeed ? "Nice!" : "Fucking fucked!");

		int[] arr = generateRandomArray(maxSize, maxValue);
		printArray(arr);
		heapSort(arr);
		printArray(arr);
	}

}
```
从算法描述来看，堆排序需要两个过程，一是建立堆，二是堆顶与堆的最后一个元素交换位置
所以堆排序有两个函数组成
- 一是建堆的渗透函数
- 二是反复调用渗透函数实现排序的函数

```cpp
void print(int a[], int n){  
    for(int j= 0; j<n; j++){  
        cout<<a[j] <<"  ";  
    }  
    cout<<endl;  
}  
  
  
  
/** 
 * 已知H[s…m]除了H[s] 外均满足堆的定义 
 * 调整H[s],使其成为大顶堆.即将对第s个结点为根的子树筛选,  
 * 
 * @param H是待调整的堆数组 
 * @param s是待调整的数组元素的位置 
 * @param length是数组的长度 
 * 
 */  
void HeapAdjust(int H[],int s, int length)  
{  
    int tmp  = H[s];  
    int child = 2*s+1; //左孩子结点的位置。(i+1 为当前调整结点的右孩子结点的位置)  
    while (child < length) {  
        if(child+1 <length && H[child]<H[child+1]) { // 如果右孩子大于左孩子(找到比当前待调整结点大的孩子结点)  
            ++child ;  
        }  
        if(H[s]<H[child]) {  // 如果较大的子结点大于父结点  
            H[s] = H[child]; // 那么把较大的子结点往上移动，替换它的父结点  
            s = child;       // 重新设置s ,即待调整的下一个结点的位置  
            child = 2*s+1;  
        }  else {            // 如果当前待调整结点大于它的左右孩子，则不需要调整，直接退出  
             break;  
        }  
        H[s] = tmp;         // 当前待调整的结点放到比其大的孩子结点位置上  
    }  
    print(H,length);  
}  
  
  
/** 
 * 初始堆进行调整 
 * 将H[0..length-1]建成堆 
 * 调整完之后第一个元素是序列的最小的元素 
 */  
void BuildingHeap(int H[], int length)  
{   
    //最后一个有孩子的节点的位置 i=  (length -1) / 2  
    for (int i = (length -1) / 2 ; i >= 0; --i)  
        HeapAdjust(H,i,length);  
}  
/** 
 * 堆排序算法 
 */  
void HeapSort(int H[],int length)  
{  
    //初始堆  
    BuildingHeap(H, length);  
    //从最后一个元素开始对序列进行调整  
    for (int i = length - 1; i > 0; --i)  
    {  
        //交换堆顶元素H[0]和堆中最后一个元素  
        int temp = H[i]; H[i] = H[0]; H[0] = temp;  
        //每次交换堆顶元素和堆中最后一个元素之后，都要对堆进行调整  
        HeapAdjust(H,0,i);  
  }  
}   
  
int main(){  
    int H[10] = {3,1,5,7,2,4,9,6,10,8};  
    cout<<"初始值：";  
    print(H,10);  
    HeapSort(H,10);  
    //selectSort(a, 8);  
    cout<<"结果：";  
    print(H,10);  
  
}  
```

- **分析:**
设树深度为k
![](https://img-blog.csdnimg.cn/img_convert/b62e3e9a6c236e558f5bfc7b6705dcdf.png)
从根到叶的筛选，元素比较次数至多`2(k-1)`次，交换记录至多`k `次
所以，在建好堆后，排序过程中的筛选次数不超过下式 
 ![](https://img-blog.csdnimg.cn/img_convert/d10c1afe853e8dd84312084a768b7fbd.png)
建堆时的比较次数不超过4n 次，因此堆排序最坏情况下，时间复杂度也为：
`O(nlogn )`
# 5 交换排序—冒泡排序（Bubble Sort）
- **思想**
在要排序的一组数中，对当前还未排好序的范围内的全部数，自上而下对相邻的两个数依次进行比较和调整，让较大的数往下沉，较小的往上冒。即：每当两相邻的数比较后发现它们的排序与排序要求相反时，就将它们互换。
![冒泡排序的示例](https://img-blog.csdnimg.cn/img_convert/060b6ef68fa171cb319f6e9bab07a413.png)
##算法的实现
```java
package com.sss;

import java.util.Arrays;

/**
 * @author Shusheng Shi
 */
public class BubbleSort {

	public static void bubbleSort(int[] arr) {
		if (arr == null || arr.length < 2) {
			return;
		}
		for (int e = arr.length - 1; e > 0; e--) {
			for (int i = 0; i < e; i++) {
				if (arr[i] > arr[i + 1]) {
					swap(arr, i, i + 1);
				}
			}
		}
	}

	public static void swap(int[] arr, int i, int j) {
		arr[i] = arr[i] ^ arr[j];
		arr[j] = arr[i] ^ arr[j];
		arr[i] = arr[i] ^ arr[j];
	}

	// for test
	public static void comparator(int[] arr) {
		Arrays.sort(arr);
	}

	// for test
	public static int[] generateRandomArray(int maxSize, int maxValue) {
		int[] arr = new int[(int) ((maxSize + 1) * Math.random())];
		for (int i = 0; i < arr.length; i++) {
			arr[i] = (int) ((maxValue + 1) * Math.random()) - (int) (maxValue * Math.random());
		}
		return arr;
	}

	// for test
	public static int[] copyArray(int[] arr) {
		if (arr == null) {
			return null;
		}
		int[] res = new int[arr.length];
		for (int i = 0; i < arr.length; i++) {
			res[i] = arr[i];
		}
		return res;
	}

	// for test
	public static boolean isEqual(int[] arr1, int[] arr2) {
		if ((arr1 == null && arr2 != null) || (arr1 != null && arr2 == null)) {
			return false;
		}
		if (arr1 == null && arr2 == null) {
			return true;
		}
		if (arr1.length != arr2.length) {
			return false;
		}
		for (int i = 0; i < arr1.length; i++) {
			if (arr1[i] != arr2[i]) {
				return false;
			}
		}
		return true;
	}

	// for test
	public static void printArray(int[] arr) {
		if (arr == null) {
			return;
		}
		for (int i = 0; i < arr.length; i++) {
			System.out.print(arr[i] + " ");
		}
		System.out.println();
	}

	// for test
	public static void main(String[] args) {
		int testTime = 500000;
		int maxSize = 100;
		int maxValue = 100;
		boolean succeed = true;
		for (int i = 0; i < testTime; i++) {
			int[] arr1 = generateRandomArray(maxSize, maxValue);
			int[] arr2 = copyArray(arr1);
			bubbleSort(arr1);
			comparator(arr2);
			if (!isEqual(arr1, arr2)) {
				succeed = false;
				break;
			}
		}
		System.out.println(succeed ? "Nice!" : "Fucking fucked!");

		int[] arr = generateRandomArray(maxSize, maxValue);
		printArray(arr);
		bubbleSort(arr);
		printArray(arr);
	}

}

```
##**冒泡排序算法的改进**

对冒泡排序常见的改进方法是加入一标志性变量exchange，用于标志某一趟排序过程中是否有数据交换，如果进行某一趟排序时并没有进行数据交换，则说明数据已经按要求排列好，可立即结束排序，避免不必要的比较过程。

本文再提供以下两种改进算法：
1．设置一标志性变量pos,用于记录每趟排序中最后一次进行交换的位置。由于pos位置之后的记录均已交换到位,故在进行下一趟排序时只要扫描到pos位置即可。
```cpp
void Bubble_1 ( int r[], int n) {  
    int i= n -1;  //初始时,最后位置保持不变  
    while ( i> 0) {   
        int pos= 0; //每趟开始时,无记录交换  
        for (int j= 0; j< i; j++)  
            if (r[j]> r[j+1]) {  
                pos= j; //记录交换的位置   
                int tmp = r[j]; r[j]=r[j+1];r[j+1]=tmp;  
            }   
        i= pos; //为下一趟排序作准备  
     }   
}    
```
2．传统冒泡排序中每一趟排序操作只能找到一个最大值或最小值,我们考虑利用在每趟排序中进行正向和反向两遍冒泡的方法一次可以得到两个最终值(最大者和最小者) , 从而使排序趟数几乎减少了一半。

改进后的算法实现为:

```cpp
void Bubble_2 ( int r[], int n){  
    int low = 0;   
    int high= n -1; //设置变量的初始值  
    int tmp,j;  
    while (low < high) {  
        for (j= low; j< high; ++j) //正向冒泡,找到最大者  
            if (r[j]> r[j+1]) {  
                tmp = r[j]; r[j]=r[j+1];r[j+1]=tmp;  
            }   
        --high;                 //修改high值, 前移一位  
        for ( j=high; j>low; --j) //反向冒泡,找到最小者  
            if (r[j]<r[j-1]) {  
                tmp = r[j]; r[j]=r[j-1];r[j-1]=tmp;  
            }  
        ++low;                  //修改low值,后移一位  
    }   
}  
```
相邻值相同时不交换情况下,可以保持稳定性!!!
## 6\. 交换排序—快速排序（Quick Sort）

**基本思想：**

1）选择一个基准元素,通常选择第一个元素或者最后一个元素,

2）通过一趟排序讲待排序的记录分割成独立的两部分，其中一部分记录的元素值均比基准元素值小。另一部分记录的 元素值比基准值大。

3）此时基准元素在其排好序后的正确位置

4）然后分别对这两部分记录用同样的方法继续进行排序，直到整个序列有序。

快速排序的示例：

（a）一趟排序的过程：

![image.png](https://img-blog.csdnimg.cn/img_convert/ab87f8fc8a72b3183372356717b5d1ce.png)


（b）排序的全过程

![image.png](https://img-blog.csdnimg.cn/img_convert/38776c797af7c0a01dfe41594cb9387e.png)


算法的实现：

 递归实现：
```cpp
void print(int a[], int n){  
    for(int j= 0; j<n; j++){  
        cout<<a[j] <<"  ";  
    }  
    cout<<endl;  
}  
  
void swap(int *a, int *b)  
{  
    int tmp = *a;  
    *a = *b;  
    *b = tmp;  
}  
  
int partition(int a[], int low, int high)  
{  
    int privotKey = a[low];                             //基准元素  
    while(low < high){                                   //从表的两端交替地向中间扫描  
        while(low < high  && a[high] >= privotKey) --high;  //从high 所指位置向前搜索，至多到low+1 位置。将比基准元素小的交换到低端  
        swap(&a[low], &a[high]);  
        while(low < high  && a[low] <= privotKey ) ++low;  
        swap(&a[low], &a[high]);  
    }  
    print(a,10);  
    return low;  
}  
  
  
void quickSort(int a[], int low, int high){  
    if(low < high){  
        int privotLoc = partition(a,  low,  high);  //将表一分为二  
        quickSort(a,  low,  privotLoc -1);          //递归对低子表递归排序  
        quickSort(a,   privotLoc + 1, high);        //递归对高子表递归排序  
    }  
}  
  
int main(){  
    int a[10] = {3,1,5,7,2,4,9,6,10,8};  
    cout<<"初始值：";  
    print(a,10);  
    quickSort(a,0,9);  
    cout<<"结果：";  
    print(a,10);  
  
}  
```

**分析：**

快速排序是通常被认为在同数量级（O(nlog2n)）的排序方法中平均性能最好的
但若初始序列按关键码有序或基本有序时，快排序反而蜕化为冒泡排序。
为改进之，通常以“三者取中法”来选取基准记录，即将排序区间的两个端点与中点三个记录关键码居中的调整为支点记录。快速排序是一个不稳定的排序方法。

**快速排序的改进**

在本改进算法中,只对长度大于k的子序列递归调用快速排序,让原序列基本有序，然后再对整个基本有序序列用插入排序算法排序。实践证明，改进后的算法时间复杂度有所降低，且当k取值为 8 左右时,改进算法的性能最佳。算法思想如下：

```cpp
void print(int a[], int n){  
    for(int j= 0; j<n; j++){  
        cout<<a[j] <<"  ";  
    }  
    cout<<endl;  
}  
  
void swap(int *a, int *b)  
{  
    int tmp = *a;  
    *a = *b;  
    *b = tmp;  
}  
  
int partition(int a[], int low, int high)  
{  
    int privotKey = a[low];                 //基准元素  
    while(low < high){                   //从表的两端交替地向中间扫描  
        while(low < high  && a[high] >= privotKey) --high; //从high 所指位置向前搜索，至多到low+1 位置。将比基准元素小的交换到低端  
        swap(&a[low], &a[high]);  
        while(low < high  && a[low] <= privotKey ) ++low;  
        swap(&a[low], &a[high]);  
    }  
    print(a,10);  
    return low;  
}  
  
  
void qsort_improve(int r[ ],int low,int high, int k){  
    if( high -low > k ) { //长度大于k时递归, k为指定的数  
        int pivot = partition(r, low, high); // 调用的Partition算法保持不变  
        qsort_improve(r, low, pivot - 1,k);  
        qsort_improve(r, pivot + 1, high,k);  
    }   
}   
void quickSort(int r[], int n, int k){  
    qsort_improve(r,0,n,k);//先调用改进算法Qsort使之基本有序  
  
    //再用插入排序对基本有序序列排序  
    for(int i=1; i<=n;i ++){  
        int tmp = r[i];   
        int j=i-1;  
        while(tmp < r[j]){  
            r[j+1]=r[j]; j=j-1;   
        }  
        r[j+1] = tmp;  
    }   
  
}   
  
  
  
int main(){  
    int a[10] = {3,1,5,7,2,4,9,6,10,8};  
    cout<<"初始值：";  
    print(a,10);  
    quickSort(a,9,4);  
    cout<<"结果：";  
    print(a,10);  
  
}  
```
# 7. 归并排序(Merge Sort) 
## 思想
将两个（或以上）有序表合并成一个新的有序表
即
- 把待排序列分为若干个子序列，每个子序列是有序的
- 然后再把有序子序列合并为整体有序序列
![示例](https://img-blog.csdnimg.cn/img_convert/a64edc8c83a75af751b74594edd6ca2e.png)
##**合并方法**
设r[i…n]由两个有序子表r[i…m]和r[m+1…n]组成，两个子表长度分别为n-i +1、n-m。
1.  j=m+1；k=i；i=i; //置两个子表的起始下标及辅助数组的起始下标
2.  若i>m 或j>n，转⑷ //其中一个子表已合并完，比较选取结束
3.  //选取r[i]和r[j]较小的存入辅助数组rf
    如果r[i]<r[j]，rf[k]=r[i]； i++； k++； 转⑵
    否则，rf[k]=r[j]； j++； k++； 转⑵
4.  //将尚未处理完的子表中元素存入rf
    如果i<=m，将r[i…m]存入rf[k…n] //前一子表非空
    如果j<=n ,  将r[j…n] 存入rf[k…n] //后一子表非空
5.  合并结束。

```java
package com.sss;

import java.util.Arrays;

public class MergeSort {

	public static void mergeSort(int[] arr) {
		if (arr == null || arr.length < 2) {
			return;
		}
		mergeSort(arr, 0, arr.length - 1);
	}

	public static void mergeSort(int[] arr, int l, int r) {
		if (l == r) {
			return;
		}
		int mid = l + ((r - l) >> 1);
		mergeSort(arr, l, mid);
		mergeSort(arr, mid + 1, r);
		merge(arr, l, mid, r);
	}

	public static void merge(int[] arr, int l, int m, int r) {
		int[] help = new int[r - l + 1];
		int i = 0;
		int p1 = l;
		int p2 = m + 1;
		while (p1 <= m && p2 <= r) {
			help[i++] = arr[p1] < arr[p2] ? arr[p1++] : arr[p2++];
		}
		while (p1 <= m) {
			help[i++] = arr[p1++];
		}
		while (p2 <= r) {
			help[i++] = arr[p2++];
		}
		for (i = 0; i < help.length; i++) {
			arr[l + i] = help[i];
		}
	}

    /**
     *
     * @param arr
     */
	public static void comparator(int[] arr) {
		Arrays.sort(arr);
	}

    /**
     * for test
     * @param maxSize
     * @param maxValue
     * @return
     */
	public static int[] generateRandomArray(int maxSize, int maxValue) {
		int[] arr = new int[(int) ((maxSize + 1) * Math.random())];
		for (int i = 0; i < arr.length; i++) {
			arr[i] = (int) ((maxValue + 1) * Math.random()) - (int) (maxValue * Math.random());
		}
		return arr;
	}

    /**]
     *
     *  for test
     * @param arr
     * @return
     */
	public static int[] copyArray(int[] arr) {
		if (arr == null) {
			return null;
		}
		int[] res = new int[arr.length];
		for (int i = 0; i < arr.length; i++) {
			res[i] = arr[i];
		}
		return res;
	}

    /**
     * for test
     * @param arr1
     * @param arr2
     * @return
     */
	public static boolean isEqual(int[] arr1, int[] arr2) {
		if ((arr1 == null && arr2 != null) || (arr1 != null && arr2 == null)) {
			return false;
		}
		if (arr1 == null && arr2 == null) {
			return true;
		}
		if (arr1.length != arr2.length) {
			return false;
		}
		for (int i = 0; i < arr1.length; i++) {
			if (arr1[i] != arr2[i]) {
				return false;
			}
		}
		return true;
	}

    /**
     * for test
     * @param arr
     */
	public static void printArray(int[] arr) {
		if (arr == null) {
			return;
		}
		for (int i = 0; i < arr.length; i++) {
			System.out.print(arr[i] + " ");
		}
		System.out.println();
	}

    /**
     * for test
     * @param args
     */
	public static void main(String[] args) {
		int testTime = 500000;
		int maxSize = 100;
		int maxValue = 100;
		boolean succeed = true;
		for (int i = 0; i < testTime; i++) {
			int[] arr1 = generateRandomArray(maxSize, maxValue);
			int[] arr2 = copyArray(arr1);
			mergeSort(arr1);
			comparator(arr2);
			if (!isEqual(arr1, arr2)) {
				succeed = false;
				printArray(arr1);
				printArray(arr2);
				break;
			}
		}
		System.out.println(succeed ? "Nice!" : "Fucking fucked!");

		int[] arr = generateRandomArray(maxSize, maxValue);
		printArray(arr);
		mergeSort(arr);
		printArray(arr);

	}

}

```
cpp版本
```
//将r[i…m]和r[m +1 …n]归并到辅助数组rf[i…n]  
void Merge(ElemType *r,ElemType *rf, int i, int m, int n)  
{  
    int j,k;  
    for(j=m+1,k=i; i<=m && j <=n ; ++k){  
        if(r[j] < r[i]) rf[k] = r[j++];  
        else rf[k] = r[i++];  
    }  
    while(i <= m)  rf[k++] = r[i++];  
    while(j <= n)  rf[k++] = r[j++];  
}  
```

**归并的迭代算法**

1 个元素的表总是有序的。所以对n 个元素的待排序列，每个元素可看成1 个有序子表。对子表两两合并生成n/2个子表，所得子表除最后一个子表长度可能为1 外，其余子表长度均为2。再进行两两合并，直到生成n 个元素按关键码有序的表。
```cpp
void print(int a[], int n){  
    for(int j= 0; j<n; j++){  
        cout<<a[j] <<"  ";  
    }  
    cout<<endl;  
}  
  
//将r[i…m]和r[m +1 …n]归并到辅助数组rf[i…n]  
void Merge(ElemType *r,ElemType *rf, int i, int m, int n)  
{  
    int j,k;  
    for(j=m+1,k=i; i<=m && j <=n ; ++k){  
        if(r[j] < r[i]) rf[k] = r[j++];  
        else rf[k] = r[i++];  
    }  
    while(i <= m)  rf[k++] = r[i++];  
    while(j <= n)  rf[k++] = r[j++];  
    print(rf,n+1);  
}  
  
void MergeSort(ElemType *r, ElemType *rf, int lenght)  
{   
    int len = 1;  
    ElemType *q = r ;  
    ElemType *tmp ;  
    while(len < lenght) {  
        int s = len;  
        len = 2 * s ;  
        int i = 0;  
        while(i+ len <lenght){  
            Merge(q, rf,  i, i+ s-1, i+ len-1 ); //对等长的两个子表合并  
            i = i+ len;  
        }  
        if(i + s < lenght){  
            Merge(q, rf,  i, i+ s -1, lenght -1); //对不等长的两个子表合并  
        }  
        tmp = q; q = rf; rf = tmp; //交换q,rf，以保证下一趟归并时，仍从q 归并到rf  
    }  
}  
  
  
int main(){  
    int a[10] = {3,1,5,7,2,4,9,6,10,8};  
    int b[10];  
    MergeSort(a, b, 10);  
    print(b,10);  
    cout<<"结果：";  
    print(a,10);  
  
}  
```

**两路归并的递归算法**

```cpp
void MSort(ElemType *r, ElemType *rf,int s, int t)  
{   
    ElemType *rf2;  
    if(s==t) r[s] = rf[s];  
    else  
    {   
        int m=(s+t)/2;          /*平分*p 表*/  
        MSort(r, rf2, s, m);        /*递归地将p[s…m]归并为有序的p2[s…m]*/  
        MSort(r, rf2, m+1, t);      /*递归地将p[m+1…t]归并为有序的p2[m+1…t]*/  
        Merge(rf2, rf, s, m+1,t);   /*将p2[s…m]和p2[m+1…t]归并到p1[s…t]*/  
    }  
}  
void MergeSort_recursive(ElemType *r, ElemType *rf, int n)  
{   /*对顺序表*p 作归并排序*/  
    MSort(r, rf,0, n-1);  
}  
```
# 8. 桶排序/基数排序(Radix Sort)及计数排序
说基数排序前，我们先说桶排序，桶排序是稳定的。
## **思想**
将阵列分到有限数量的桶里，再对每个桶再个别排序（有可能再使用别的排序或以递回方式继续使用桶排序）。
当要被排序的阵列内的数值是均匀分配的时候，桶排序使用线性时间O(N)。但桶排序并非比较排序，他不受 O(NlogN) 下限的影响。

简单来说，就是把数据分组，放在一个个的桶中，然后对每个桶里面的再排序 。例如要对大小为[1..1000]范围内的n个整数A[1..n]排序：  
- 把桶设为大小为10的范围
设集合B[1]存储[1..10]的整数，集合B[2]存储   (10..20]的整数，……集合B[i]存储(   (i-1)*10,   i*10]的整数，i   =   1,2,..100
总共有  100个桶  
- 对A[1..n]从头到尾扫描一遍，把每个A[i]放入对应的桶B[j]中
再对这100个桶中每个桶里的数字排序，这时可用冒泡，选择或快排
- 依次输出每个桶里面的数字，且每个桶中的数字从小到大输出，这样就得到所有数字排好序的一个序列了。 

假设有n个数字,m个桶,如果数字均匀分布,则每个桶里面均有n/m个数
如果对每个桶中的数字采用快排,那么整个算法的复杂度是：
`O(n   +   m   *   n/m*log(n/m))   =   O(n   +   nlogn   -   nlogm) `
当m接近n时，桶排序复杂度接近O(n)  。

以上复杂度的计算基于输入的n个数字是均匀分布。该假设条件是很强的，实际应用中效果并没有这么好。如果所有的数字都落在同一个桶中，那就退化成一般的排序 。

前面说的几大排序算法 ，大部分时间复杂度都是O（n^2）,也有部分排序算法O(nlogn)
而桶式排序却能实现O（n）时间复杂度
但桶排序的缺点是
- 空间复杂度较高,额外开销大
排序有两个数组的空间开销，一个存放待排序数组，一个就是所谓的桶，比如待排序值是从0到m-1，那就需要m个桶，这个桶数组就要至少m个空间
- 待排序的元素都要在一定的范围内等等
桶式排序是一种分配排序。分配排序的特定是不需要进行关键码的比较，但前提是要知道待排序列的一些具体情况

**分配排序思想：**说白了就是进行多次的桶式排序。****

基数排序过程无须比较关键字，而是通过“分配”和“收集”过程来实现排序
它们的时间复杂度可达到线性阶：O(n) 
**实例**
扑克牌中52 张牌
![](https://img-blog.csdnimg.cn/img_convert/9e27fe54a8da319120107d1a4f02ce10.png)
**2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A**
对扑克牌按花色、面值进行升排
![](https://img-blog.csdnimg.cn/img_convert/dcc84dbcd28b5106848b207653bff143.png)
![](https://img-blog.csdnimg.cn/img_convert/aa850455513eacf02d70d342fa805dd8.png)
即两张牌，若花色不同，不论面值怎样，花色低的那张牌小于花色高的，只有在同花色情况下，大小关系才由面值的大小确定。这就是多关键码排序。

为得到排序结果，我们讨论两种排序方法。
- **方法1**：先对花色排序，将其分为4 个组,再对每组分别按面值排序,最后，4 组连接
- **方法2**
先给出13 个编号组(2 号，3 号，...，A 号)，将牌按面值依次放入对应的编号组，分成13 堆
再按花色给出4 个编号组(梅花、方块、红心、黑心)，将2号组中牌取出分别放入对应花色组，再将3 号组中牌取出分别放入对应花色组，……，这样，4 个花色组中均按面值有序，然后，将4 个花色组依次连接起来即可

设n 个元素的待排序列包含d 个关键码{k1，k2，…，kd}，则称序列对关键码{k1，k2，…，kd}有序是指：对于序列中任两个记录r[i]和r[j](1≤i≤j≤n)都满足下列有序关系：![](https://img-blog.csdnimg.cn/img_convert/abc83629039450dbe53f62518ff3e612.png)


其中k1 称为最主位关键码，kd 称为最次位关键码     。

**两种多关键码排序方法：**

多关键码排序按照从最主位关键码到最次位关键码或从最次位到最主位关键码的顺序逐次排序，分两种方法：

最高位优先(Most Significant Digit first)法，简称MSD 法：

1）先按k1 排序分组，将序列分成若干子序列，同一组序列的记录中，关键码k1 相等。

2）再对各组按k2 排序分成子组，之后，对后面的关键码继续这样的排序分组，直到按最次位关键码kd 对各子组排序后。

3）再将各组连接起来，便得到一个有序序列。扑克牌按花色、面值排序中介绍的方法一即是MSD 法。

最低位优先(Least Significant Digit first)法，简称LSD 法：

1) 先从kd 开始排序，再对kd-1进行排序，依次重复，直到按k1排序分组分成最小的子序列后。

2) 最后将各个子序列连接起来，便可得到一个有序的序列, 扑克牌按花色、面值排序中介绍的方法二即是LSD 法。

**基于LSD方法的链式基数排序的基本思想**

　　“多关键字排序”的思想实现“单关键字排序”。对数字型或字符型的单关键字，可以看作由多个数位或多个字符构成的多关键字，此时可以采用“分配-收集”的方法进行排序，这一过程称作基数排序法，其中每个数字或字符可能的取值个数称为基数。比如，扑克牌的花色基数为4，面值基数为13。在整理扑克牌时，既可以先按花色整理，也可以先按面值整理。按花色整理时，先按红、黑、方、花的顺序分成4摞（分配），再按此顺序再叠放在一起（收集），然后按面值的顺序分成13摞（分配），再按此顺序叠放在一起（收集），如此进行二次分配和收集即可将扑克牌排列有序。   

## 基数排序
低位先排序，然后收集；
再按高位排序，然后再收集；
依次类推，直到最高位。

有时候有些属性是有优先级顺序的，先按低优先级排序，再按高优先级排序。最后的次序就是高优先级高的在前，高优先级相同的低优先级高的在前
基数排序基于分别排序，分别收集，所以是稳定的。

**算法实现：**
```java
package com.sss;

import java.util.Arrays;

/**
 * @author Shusheng Shi
 */
public class BucketSort {

	/**
	 * only for 0~200 value
	 * @param arr
	 */
	public static void bucketSort(int[] arr) {
		if (arr == null || arr.length < 2) {
			return;
		}
		int max = Integer.MIN_VALUE;
		for (int i = 0; i < arr.length; i++) {
			max = Math.max(max, arr[i]);
		}
		int[] bucket = new int[max + 1];
		for (int i = 0; i < arr.length; i++) {
			bucket[arr[i]]++;
		}
		int i = 0;
		for (int j = 0; j < bucket.length; j++) {
			while (bucket[j]-- > 0) {
				arr[i++] = j;
			}
		}
	}

	// for test
	public static void comparator(int[] arr) {
		Arrays.sort(arr);
	}

	// for test
	public static int[] generateRandomArray(int maxSize, int maxValue) {
		int[] arr = new int[(int) ((maxSize + 1) * Math.random())];
		for (int i = 0; i < arr.length; i++) {
			arr[i] = (int) ((maxValue + 1) * Math.random());
		}
		return arr;
	}

	// for test
	public static int[] copyArray(int[] arr) {
		if (arr == null) {
			return null;
		}
		int[] res = new int[arr.length];
		for (int i = 0; i < arr.length; i++) {
			res[i] = arr[i];
		}
		return res;
	}

	// for test
	public static boolean isEqual(int[] arr1, int[] arr2) {
		if ((arr1 == null && arr2 != null) || (arr1 != null && arr2 == null)) {
			return false;
		}
		if (arr1 == null && arr2 == null) {
			return true;
		}
		if (arr1.length != arr2.length) {
			return false;
		}
		for (int i = 0; i < arr1.length; i++) {
			if (arr1[i] != arr2[i]) {
				return false;
			}
		}
		return true;
	}

	// for test
	public static void printArray(int[] arr) {
		if (arr == null) {
			return;
		}
		for (int i = 0; i < arr.length; i++) {
			System.out.print(arr[i] + " ");
		}
		System.out.println();
	}

	// for test
	public static void main(String[] args) {
		int testTime = 500000;
		int maxSize = 100;
		int maxValue = 150;
		boolean succeed = true;
		for (int i = 0; i < testTime; i++) {
			int[] arr1 = generateRandomArray(maxSize, maxValue);
			int[] arr2 = copyArray(arr1);
			bucketSort(arr1);
			comparator(arr2);
			if (!isEqual(arr1, arr2)) {
				succeed = false;
				printArray(arr1);
				printArray(arr2);
				break;
			}
		}
		System.out.println(succeed ? "Nice!" : "Fucking fucked!");

		int[] arr = generateRandomArray(maxSize, maxValue);
		printArray(arr);
		bucketSort(arr);
		printArray(arr);

	}

}

```


## 总结 

**各种排序的稳定性，时间复杂度和空间复杂度总结：**

![image.png](https://img-blog.csdnimg.cn/img_convert/077617aaa756cefba6a3dcb449b38673.png)


 我们比较时间复杂度函数的情况：

![image.png](https://img-blog.csdnimg.cn/img_convert/b1802c50e3f7b8166f885093a1c5a950.png)


                             时间复杂度函数O(n)的增长情况

![](https://img-blog.csdnimg.cn/img_convert/c2ffd3f3b0d382fd8d97b3a7705fed65.png)


所以对n较大的排序记录。一般的选择都是时间复杂度为O(nlog2n)的排序方法。

**时间复杂度来说：**

(1)平方阶(O(n<sup>2</sup>))排序 各类简单排序:直接插入、直接选择和冒泡排序；  (2)线性对数阶(O(nlog2n))排序 　　快速排序、堆排序和归并排序；  (3)O(n<sup>1+§</sup>))排序,§是介于0和1之间的常数。

希尔排序 (4)线性阶(O(n))排序 基数排序，此外还有桶、箱排序。

说明：

当原表有序或基本有序时，直接插入排序和冒泡排序将大大减少比较次数和移动记录的次数，时间复杂度可降至O（n）；

而快速排序则相反，当原表基本有序时，将蜕化为冒泡排序，时间复杂度提高为O（n2）；

原表是否有序，对简单选择排序、堆排序、归并排序和基数排序的时间复杂度影响不大。

**稳定性：**

排序算法的稳定性:若待排序的序列中，存在多个具有相同关键字的记录，经过排序， 这些记录的相对次序保持不变，则称该算法是稳定的；若经排序后，记录的相对 次序发生了改变，则称该算法是不稳定的。 
     稳定性的好处：排序算法如果是稳定的，那么从一个键上排序，然后再从另一个键上排序，第一个键排序的结果可以为第二个键排序所用。基数排序就是这样，先按低位排序，逐次按高位排序，低位相同的元素其顺序再高位也相同时是不会改变的。另外，如果排序算法稳定，可以避免多余的比较； 

稳定的排序算法：冒泡排序、插入排序、归并排序和基数排序

不是稳定的排序算法：选择排序、快速排序、希尔排序、堆排序

**选择排序算法准则：**

每种排序算法都各有优缺点。因此，在实用时需根据不同情况适当选用，甚至可以将多种方法结合起来使用。

选择排序算法的依据

影响排序的因素有很多，平均时间复杂度低的算法并不一定就是最优的。相反，有时平均时间复杂度高的算法可能更适合某些特殊情况。同时，选择算法时还得考虑它的可读性，以利于软件的维护。一般而言，需要考虑的因素有以下四点：

1．待排序的记录数目n的大小；

2．记录本身数据量的大小，也就是记录中除关键字外的其他信息量的大小；

3．关键字的结构及其分布情况；

4．对排序稳定性的要求。

设待排序元素的个数为n.

**1）**当n较大，则应采用时间复杂度为O(nlog2n)的排序方法：快速排序、堆排序或归并排序序。

   快速排序：是目前基于比较的内部排序中被认为是最好的方法，当待排序的关键字是随机分布时，快速排序的平均时间最短；
       堆排序 ：  如果内存空间允许且要求稳定性的，

       归并排序：它有一定数量的数据移动，所以我们可能过与插入排序组合，先获得一定长度的序列，然后再合并，在效率上将有所提高。

**2）**  当n较大，内存空间允许，且要求稳定性 =》归并排序

**3）**当n较小，可采用直接插入或直接选择排序。

    直接插入排序：当元素分布有序，直接插入排序将大大减少比较次数和移动记录的次数。

    直接选择排序 ：元素分布有序，如果不要求稳定性，选择直接选择排序

**5）**一般不使用或不直接使用传统的冒泡排序。

**6）**基数排序  它是一种稳定的排序算法，但有一定的局限性：
　　1、关键字可分解。 2、记录的关键字位数较少，如果密集更好 　　3、如果是数字时，最好是无符号的，否则将增加相应的映射复杂度，可先将其正负分开排序。
![](https://img-blog.csdnimg.cn/img_convert/2ae71019f171ed05bef01202a9876139.png)