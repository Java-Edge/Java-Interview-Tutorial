许多同学刚开始学Java 多线程时可能不会关主Join 这个动作，因为不知道它是用来做什么的，而当需要用到类似的场景时却有可能会说Java 没有提供这种功能。

当我们将一个大任务划分为多个小任务，多个小任务由多个线程去完成时，显然它们完成的先后顺序不可能完全一致。在程序中希望各个线程执行完成后，将它们的计算结果最终合并在一起，换句话说，要等待多个线程将子任务执行完成后，才能进行合并结果的操作。
这时就可以选择使用Join 了，Join 可以帮助我们轻松地搞定这个问题，否则就需要用个循环去不断判定每个线程的状态。

在实际生活中，就像把任务分解给多个人去完成其中的各个板块，但老板需要等待这些人全部都完成后才认为这个阶段的任务结束了，也许每个人的板块内部和别人还有相互的接口依赖，如果对方接口没有写好，自己的这部分也不算完全完成，就会发生类似于合并的动作(到底要将任务细化到什么粒度，完全看实际场景和自己对问题的理解)。下面用段简单的代码米说明Join 的使用。

thread.Join把指定的线程加入到当前线程，可以将两个交替执行的线程合并为顺序执行的线程。比如在线程B中调用了线程A的Join()方法，直到线程A执行完毕后，才会继续执行线程B。
![](https://upload-images.jianshu.io/upload_images/4685968-f6a1f06c3ef70293.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```java
package com.sss.test;

import java.util.Random;

/**
 * @author Shusheng Shi
 */
public class ThreadJoinTest {
    static class Computer extends Thread {
        private int start;
        private int end;
        private int result;
        private int[] array;

        public Computer(int[] array, int start, int end) {
            this.array=array;
            this.start=start;
            this.end=end;
        }

        @Override
        public void run() {
            for (int i=start; i < end; i++) {
                result+=array[i];
            }

            if (result < 0) {
                result&=Integer.MAX_VALUE;
            }

        }

        public int getResult() {
            return result;

        }
    }

    private final static int COUNTER=10000000;

    public static void main(String[] args) throws InterruptedException {
        int[] array=new int[COUNTER];
        Random random=new Random();
        for (int i=0; i < COUNTER; i++) {
            array[i]=Math.abs( random.nextInt() );
        }
        long start=System.currentTimeMillis();
        Computer c1=new Computer( array, 0, COUNTER );
        Computer c2=new Computer( array, COUNTER / 2, COUNTER );
        c1.start();
        c2.start();
        c1.join();
        c2.join();
        System.out.println( System.currentTimeMillis() - start );
        System.out.println( (c1.getResult() + c2.getResult()) & Integer.MAX_VALUE );
    }
}
```
这个例子或许不太好，只是1000 万个随机数叠加，为了防此CPU计算过快，在计算中增加一些判定操作，最后再将计算完的两个值输出，也输出运算时间。如果在有多个CPU的机器上做测试，就会发现数据量大时，多个线程计算具有优势，但是这个优势非常小，
而且在数据量较小的情况下,单线程会更快些。为何单线程可能会更快呢?
最主要的原因是线程在分配时就有开销(每个线程的分配过程本身就高要执行很多条底层代码，这些代码的执行相当于很多条CPU 叠加运算的指令),Join 操作过程还有其他的各种开销。
如果尝试将每个线程叠加后做一些其他的操作，例如IO读写、字符串处理等操作，多线程的优势就出来了，因为这样总体计算下来后，线程的创建时间是可以被忽略

所以我们在考量系统的综合性能时不能就一一个点或某种测试就轻易得出一一个最终结论，定要考虑更多的变动因素。

那么使用多线程带来更多的是上下文切换的开销，多线程操作的共享对象还会有锁瓶
否则就是非线程安全的。
颈,
综合考量各种开销因素、时间、空间,
最后利用大量的场景测试来证明推理是有
指导性的，如果只是一味地为了用多线程而使用多线程，则往往很多事情可能会适得
其反
Join5 ?是语法层面的线程合并，其实它更像是当前线程处于BLOCKEN 状态时去等待
I :他线程结束的事件，而且是逐个去Join。换句话说，Join 的顺序并不一一定是线程真正结
束的顺序，要保证线程结束的顺J 字性，它还无法实现，即使在本例中它也不是唯一的实现
方式，本章后面会提到许多基于并发编程工具的方式来实现会更加理想，管理也会更加体
系化，能适应更多的业务场景需求。
