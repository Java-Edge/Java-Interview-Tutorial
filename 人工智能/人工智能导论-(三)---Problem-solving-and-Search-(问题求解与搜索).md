# 问题求解
![](https://upload-images.jianshu.io/upload_images/4685968-dfbecd43a0163bb6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 很多问题可以转化为搜索问题
![](https://upload-images.jianshu.io/upload_images/4685968-9029a9168e0308c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Specifying a Search Problem
![](https://upload-images.jianshu.io/upload_images/4685968-47971d7790e63564.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 一般图搜索的假设
![](https://upload-images.jianshu.io/upload_images/4685968-09706d0c7f328ed5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 树搜索与图搜索
![](https://upload-images.jianshu.io/upload_images/4685968-4cd49ad49cdb2b1a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9c44913d71137fc8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![树搜索](https://upload-images.jianshu.io/upload_images/4685968-419c6c5d61862a8c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 1 图的搜索过程
![](https://upload-images.jianshu.io/upload_images/4685968-aac5892f25fc8217.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-fc861b22b250e004.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 宽度优先遍历
![](https://upload-images.jianshu.io/upload_images/4685968-f80e5ced44d423b2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-88f6c65c396a0c55.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![图的一般搜索策略(树搜索)
](https://upload-images.jianshu.io/upload_images/4685968-a1c6ed901503822d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- 搜索算法的性能
![](https://upload-images.jianshu.io/upload_images/4685968-17d6f481984c9aea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 1.1 无信息搜索（Uninformed search ）
![](https://upload-images.jianshu.io/upload_images/4685968-ef6e1d2a50cc0671.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 数据结构
![](https://upload-images.jianshu.io/upload_images/4685968-0d42d0fcbc73084f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 1.1.1 宽度优先(BFS，Tree search)
![](https://upload-images.jianshu.io/upload_images/4685968-44aafd5790c28c1f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-eda63b1c32345013.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### 1.1.1.1 Example: BFS
![](https://upload-images.jianshu.io/upload_images/4685968-5c8b1710ac5a73da.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-175547eb4934bb8d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-77d83f1877798fd1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### 1.1.1.2 BFS性能
![](https://upload-images.jianshu.io/upload_images/4685968-4cea5f0f78cf6a78.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4e340af12926c518.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-921905ee6656abf5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![8 - 数码问题](https://upload-images.jianshu.io/upload_images/4685968-0d546d788d595ba6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 1.1.2 等代价搜索(Uniform-cost search, UCS)
![](https://upload-images.jianshu.io/upload_images/4685968-e405b7a6d7a300cb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### 1.1.2.1 Example: UCS
![](https://upload-images.jianshu.io/upload_images/4685968-ccf657fa61aaf3cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8d0fbe753e44484b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c22cf94d9a42d1ee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-32eae604647a3e06.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 1.1.3 深度优先搜索(DFS, Tree search)
![](https://upload-images.jianshu.io/upload_images/4685968-de608eedfd9c5a13.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### 1.1.3.1 Example: DFS
![](https://upload-images.jianshu.io/upload_images/4685968-b3d1c4ab4429d14f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-5de84645df8a2a55.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8f093656f774aba0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### 1.1.3.2 DFS性能
![](https://upload-images.jianshu.io/upload_images/4685968-dae6555e984519cb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-bcc951c7b25f948c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 有界深度优先Depth-limited search
![](https://upload-images.jianshu.io/upload_images/4685968-db03a50c1863a396.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-af253256502f80c8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### 迭代加深搜索(Iterative Deepening Search,Tree search)
![](https://upload-images.jianshu.io/upload_images/4685968-c8b52b37ec9ab7f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-285b167f47cf4615.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#### Example: IDS
![](https://upload-images.jianshu.io/upload_images/4685968-e1c538b28b6f4760.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-2e77194178bb7684.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-360c5bd18b91a17d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e87851377bf9497a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-fed66b9b00d049a5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-be2aceeda25b5c31.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-8c20cd845c6b0584.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![image.png](https://upload-images.jianshu.io/upload_images/4685968-e662bb2fca3772e4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-85c857f692616f86.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e6f28c3dcde62378.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![图的一般搜索策略(图搜索)](https://upload-images.jianshu.io/upload_images/4685968-831804501d21d632.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d129d331c4e5121a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 有信息搜索
![](https://upload-images.jianshu.io/upload_images/4685968-37e0c58ef9b3c772.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 2.1 有序搜索—— Best First Search
![](https://upload-images.jianshu.io/upload_images/4685968-3c5df641533cded4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7f9412e332cebb11.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Eg. Cost as True Distance
![优先选择距离目标最近的点](https://upload-images.jianshu.io/upload_images/4685968-684925663881e5f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 2.2 有信息搜索——估价函数
![](https://upload-images.jianshu.io/upload_images/4685968-605d9810774ffbb2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##  Heuristic Function
![](https://upload-images.jianshu.io/upload_images/4685968-190305995b3cc4e8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Eg.: Romania
![](https://upload-images.jianshu.io/upload_images/4685968-e0bc88826cea818f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-140641cbb00c8fad.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Romania with step costs in km
![](https://upload-images.jianshu.io/upload_images/4685968-d1846b1460b5d7f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Greedy Search
![](https://upload-images.jianshu.io/upload_images/4685968-8614bf47981d93aa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Greedy search example
![](https://upload-images.jianshu.io/upload_images/4685968-1374a6fbb1340a93.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-a3d1271b7f0a2455.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4ab6f5813e775273.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-12c5f3d0d7973d24.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-61aeb1eb6357f378.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-bea6daa4c63ae3d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## A算法
![](https://upload-images.jianshu.io/upload_images/4685968-af6d83ea4f57ccc2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-53493fd348dc0280.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-fcfcfab076745247.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-33136175b1ef5cd4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e6263912debc9821.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-785a37bf8db2b5e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-e1e3f0f53565af25.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-86f434bcb1f40154.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-dfcca7bb1bc2937a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![image.png](https://upload-images.jianshu.io/upload_images/4685968-3b3ec0a640db9b0e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-349d78182dae19f9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-359379a1022be154.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-2a558d8f1a441645.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
### A*算法示例
![](https://upload-images.jianshu.io/upload_images/4685968-494b12b626407249.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ecf8a43458c418e8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-1bb65d84dfdbc9bb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-93a03c340b9a55a3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-91a1a77c38ff0228.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-d7f051699cb4cd60.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Dominance(占优)
![](https://upload-images.jianshu.io/upload_images/4685968-f1b2686ab3953645.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- heuristic function
![](https://upload-images.jianshu.io/upload_images/4685968-4e4140e9c19858ef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Relaxation in 8-puzzle
![](https://upload-images.jianshu.io/upload_images/4685968-b400526e47c23096.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
- Summary
![](https://upload-images.jianshu.io/upload_images/4685968-5706ad7e60cc5f4a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)




产生式/框架式表示方法# 1 产生式表示方法
![](https://upload-images.jianshu.io/upload_images/4685968-e296c021485d0f29.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-461063fe7323cb9e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-6c9a2847ec61bebe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4003fbf0d1122192.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9279f41a0a03bce3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-92e537870e72243b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-699b623089b0a260.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 产生系统
![](https://upload-images.jianshu.io/upload_images/4685968-e4d5e54aca794a24.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-7e06a76d8bcbc475.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-ebf40b1a9a33092b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-c16b679b82585f10.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-b891920eacf18b1a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-f5b5cfb35ca976eb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 特点
![](https://upload-images.jianshu.io/upload_images/4685968-ba2d4dfe868163b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-0fb25b94a181a184.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-bd38d9cc926066d6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
# 2 框架式表示方法
![](https://upload-images.jianshu.io/upload_images/4685968-3624416d9d8f0ae4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-9e4c738f642bf6d9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-18b505a6d72307c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-799868ea8219ae97.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-4fa7d3f2d447ab27.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-feec39a6e4f643dd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-51a10fc9494cd637.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-010ed9e46078e7c7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/4685968-acc1443599e3077e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
