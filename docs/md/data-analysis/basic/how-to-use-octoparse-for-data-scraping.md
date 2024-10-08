# 05-如何用八爪鱼采集数据

## 0 前言

相比 Python 爬虫，八爪鱼使用更简便，所见即所得，无需编写代码，除了在正则表达式匹配用到 XPath。

### 下载安装

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/10/4706738238ce969e00501ee6dc1f2acf.png)

### XPath

XML Path Language，XML 的路径语言，用来在 XML 文件中寻找我们想要的元素。八爪鱼可用 XPath更灵活定位想找的元素。

## 1 采集方式

如你想采集数据，就需要新建一个任务，建任务时的可选项：

### 1.1 内置模板任务

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/10/d30bd24d100067c1129f0460c2b37fae.png)

模板任务集成了一些热门的模板，即常见网站：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/10/c0d905d936dc432ac2dfdcd770f04ae4.png)

它可帮助我们轻松实现采集，只需告诉工具：

- 采集的网址
- 登录网站的账号和密码

### 1.2 自定义任务

虽然简易采集比较方便快捷，但推荐自定义任务，更灵活提取想要信息，如只想采集“D&G”微博评论。

## 2 流程步骤

### 2.1 输入网页

每个采集需要输入你想要采集的网页。新建任务时的必填项：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20241008131922265.png)

### 2.2 设计流程（关键）

你要告诉八爪鱼，你咋操作页面的、想提取页面的啥信息。因为数据条数多，通常还要翻页，所以要进行循环翻页设置：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20241008132035139.png)



![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/image-20241008132400383.png)

### 2.3 启动采集

当你设计好采集流程后，就可以启动采集任务了，任务结束后，八爪鱼会提示你保存采集好的数据，xlsx 或 csv 格式。

## 3 步骤分类

如用自定义采集，要自己设计采集流程，也就是采集流程中的第二步。八爪鱼的流程步骤有两类，可划分为基本步骤和高级步骤。

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/%E4%B8%8B%E8%BD%BD%20(1)-8366446.jpeg)

### 3.1 基本步骤

最常用的步骤，每次采集都会用到：

#### **1. 打开网页**

所有采集默认第一项都是打开网页。所以在新建任务之后，系统会提示你输入网址。当你输入之后，八爪鱼就会自动建立一个“打开网页”的流程。

#### **2. 点击元素**

元素可以是某按钮或某链接或某个图片或文字。使用这步，是你在搜索或者提交某个请求。当你点击元素后，八爪鱼会提示你想要达到的目的：点击该按钮、采集该元素文本、还是鼠标移到该链接上。然后再选择“点击该按钮”进行确认即可。

如点击某元素的目的是循环翻页，或提取数据，点击后，八爪鱼会确认你的目的，你只需点击相关按钮。

#### **3. 循环翻页**

很多数据都存在翻页的情况，通常你需要找到翻页的位置，比如网页底部的“下一页”按钮，点击它，会提示你“循环点击下一页”、“采集该链接文本”还是“点击该链接”。你需要确认这里是进行的“循环点击下一页”。

#### **4. 提取数据**

在网页上选择你想要提取的页面范围，鼠标移动到页面上会呈现蓝色的阴影面积，它表明了你想提取的数据范围。然后点击鼠标后，在右侧选择“采集数据”即可。

### 3.2 最佳实践

1. 尽量使用用户操作视角进行模拟的方式进行操作，而不是在“流程视图”中手动创建相应的步骤。因为八爪鱼最大特点所见即所得，所以一切就按照用户使用的流程进行操作即可。
2. 使用“流程视图”方便管理和调整。右侧有“流程视图”的按钮，点击之后进入到流程视图，会把你之前的操作以流程图的方式展示出来。我会在文章下面详细介绍一下。

因为这样的话每个步骤流程清晰可见，而且你还可以调整每个步骤的参数，比如你之前的网址写错了想要修改，或者之前输入的文字需要调整等。

### 3.3 登录态

很多时候需要账号登录后才能采集数据，我们可以提前在八爪鱼工具里登录，这样再进行抓取的时候就是登录的状态，直接进行采集就可以了。

### 3.4 高级步骤

辅助步骤，可以帮我们更好地对数据进行提取，比如我们想要某个关键词的数据，就需要在网页输入框中输入对应的文字。有时候源网页的系统会提示需要输入验证码，我们就可以采用验证码识别的模块帮我们解决。有时候我们需要用下拉选项帮我们筛选想要的数据，或者某些判断条件下（比如存在某个关键词）才触发的采集等。这些操作可以更精细化地提取想要的数据。

## 4 采集微博的“Dolce&Gabbana”评论

了解基本步骤后，就可自己动手采集内容。如采集微博上关于“D&G”的评论，可先在浏览器人工操作整个流程，梳理得到步骤。

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/%E4%B8%8B%E8%BD%BD%20(1)-8370539.jpeg)

**1. 输入网页**

对应基本步骤“打开网页”，我们输入[微博搜索的地址](https://s.weibo.com/)。

**2. 输入关键词**

对应“输入文本”，我把鼠标移动到输入框中，点击后会在右侧进行操作目的的确认，选择“输入文本”即可，然后输入我们想要搜索的内容“D&G”。

**3. 点击搜索**

对应“点击元素”，我们点击“搜索按钮”，然后确认操作目的是“点击元素”。

**4. 设置翻页**

因为我们想要采集全量数据，因此需要先设置翻页。这里特别注意下，翻页的操作要在数据提取之前，因为翻页是个循环的命令，就像我们平时写 for 语句一样，一定是先设置 for 循环，然后在循环中进行数据提取。

**5. 提取数据**

提取数据的时候，我们需要提取多个字段，比如，用户、微博内容、发表时间、该微博网址。而且一个页面上会有多个微博，都需要进行采集。所以你需要先选择单条内容的最大的目标区域，在确认目的时，会发现里面有子元素，这里目的选择为“选中子元素”。因为我们要对子元素内容进行采集，方便把内容按照字段进行划分。这时会提示页面中还有 20 个相同元素时，选择“选中全部”即可。

**6. 启动采集**

都选择好之后，系统会给出三个提示，分别是“启动本地采集”、“启动云采集”和“设置定时采集”。数据量不大的时候，我们选择“启动本地采集”即可。

你可以看出，这整个过程比较简便，但中间有一些细节你可能会出错，比如说你忘记了先翻页，再选取你想提取的元素。这样如果遇到了问题，有**两个重要的工具一定要用好：流程视图和 XPath。**

**流程视图**

流程视图我在上面提到过，这里详细介绍一下。流程视图应该是在可视化中应用最多的场景，我们可以**使用流程视图查看创建流程**，调整顺序，或者删掉不想要的步骤。

**在视图中查看数据提取的字段。**选中“提取数据”步骤，可以看到该步骤提取的字段都有哪些。一般都会出现很多冗余的字段，因为 HTML 代码段中有很多隐藏的内容也会被提取到，这里你可以删掉没用的字段，把保留的字段名称进行备注修改。

通过八爪鱼可视化操作采集微博评论时，自动生成的流程视图：

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/%E4%B8%8B%E8%BD%BD-8370595.png)



**XPath**

八爪鱼内置 XPath 引擎，所以可视化方式选择元素的时候，会自动生成相应的 XPath 路径。当然我们也可以查看这些元素的 XPath，方便对它们进行精细地控制。

为啥有可视化操作，还要自定义 XPath ？有时采集的网站页面不规律，如微博搜索结果页，第一页和第二页的 HTML 排版是不同的，这样的话，可视化操作得到的 XPath 可能不具备通用性。这种情况下，如果你用搜索结果第一页提取数据得到的 XPath，就无法匹配搜索结果页第二页的数据。

在八爪鱼工具中，很多控件都有 XPath，最常用的还是循环和提取数据中的 XPath，下面我来一一简单介绍下。

**循环中的 XPath**

微博采集用到两种循环方式：

- “循环翻页”中，你可以在“流程视图”中点击“循环翻页”的控件，看到右侧的“高级选项”中的 XPath。在微博采集这个例子中，循环翻页的 XPath 是 //A[@class=‘next’]
- “循环列表”中，提取数据时，页面提示“还有 20 个相同元素”，这时我选择“选中全部”。相当于出现了 20 个元素的循环列表。所以你在流程视图中，可以会看到提取数据外层嵌套了个循环列表。同样我们可以看到循环列表的 XPath 是 //DIV[@class=‘card-feed’]。

**提取数据的 XPath**

当我们点击流程中的“提取数据”，可以看到有很多字段名称，XPath 实际上定位到了这些要采集的字段。所以你需要选中一个字段，才能看到它的 XPath。

现在你知道了，八爪鱼的匹配是基于 XPath 的，那么你也可以自己来调整 XPath 参数。这样当匹配不到想要的数据的时候，可以检查下是不是 XPath 参数设置的问题，可以手动调整，从而抓取到正确的元素。

## 5 总结

为啥讲一个八爪鱼这样的第三方工具呢？

工作流程通常很长，所以更应该专注工作的核心，数据分析，所有辅助都可用第三方工具。如果老板让你统计微博评论，实际上老板最想知道的不是采集过程，而是整体概况，如影响多少人，评论如何，是否有 KOL 关注等。

如果你之前没有数据采集的经验，那么第三方工具，以及采用可视化的方式来进行采集应该是你的首选。可视化的方式可以让你迅速上手，了解到整个数据采集的过程。

应从基础步骤开始，遇到特定需求的时候再学习了解高级步骤。这篇文章只介绍了基本的流程，但你可以上手操作了。在实际操作中，你可能会遇到各种问题，这个时候再对高级步骤进行学习，如果要进阶的话，还需要你掌握 XPath 的使用。

本文探索了八爪鱼的任务建立、流程设计，还有一个实操的案例。具体的内容概要可以看我整理的下面这张图。

虽然八爪鱼工具提供了各种简易采集的方式，更建议把它作为参考模板，看别人咋建立的，多做案例，上手更快。

![](/Users/javaedge/Downloads/IDEAProjects/java-edge-master/assets/%E4%B8%8B%E8%BD%BD-8370676.jpeg)