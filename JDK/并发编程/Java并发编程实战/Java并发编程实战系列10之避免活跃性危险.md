### 10.1 死锁

哲学家问题

有环

A等B，B等A

数据库往往可以检测和解决死锁//TODO

JVM不行，一旦死锁只有停止重启。

下面分别介绍了几种典型的死锁情况：

#### [](#1011-lock-ordering-deadlocks)10.1.1 Lock ordering Deadlocks

下面是一个经典的锁顺序死锁：两个线程用不同的顺序来获得相同的锁，**如果按照锁的请求顺序来请求锁，就不会发生这种循环依赖的情况。**

```
public class LeftRightDeadlock {
    private final Object left = new Object();
    private final Object right = new Object();

    public void leftRight() {
        synchronized (left) {
            synchronized (right) {
                doSomething();
            }
        }
    }

    public void rightLeft() {
        synchronized (right) {
            synchronized (left) {
                doSomethingElse();
            }
        }
    }

    void doSomething() {
    }

    void doSomethingElse() {
    }
}

```

#### [](#1011-dynamic-lock-order-deadlocks)10.1.1 Dynamic Lock Order Deadlocks

下面的转账例子，如果一个线程X向Y转，而另外一个线程Y向X也转，那么就会发生死锁。

```
public class DynamicOrderDeadlock {
    // Warning: deadlock-prone!
    public static void transferMoney(Account fromAccount,
                                     Account toAccount,
                                     DollarAmount amount)
            throws InsufficientFundsException {
        synchronized (fromAccount) {
            synchronized (toAccount) {
                if (fromAccount.getBalance().compareTo(amount) < 0)
                    throw new InsufficientFundsException();
                else {
                    fromAccount.debit(amount);
                    toAccount.credit(amount);
                }
            }
        }
    }

    static class DollarAmount implements Comparable<DollarAmount> {
        // Needs implementation

        public DollarAmount(int amount) {
        }

        public DollarAmount add(DollarAmount d) {
            return null;
        }

        public DollarAmount subtract(DollarAmount d) {
            return null;
        }

        public int compareTo(DollarAmount dollarAmount) {
            return 0;
        }
    }

    static class Account {
        private DollarAmount balance;
        private final int acctNo;
        private static final AtomicInteger sequence = new AtomicInteger();

        public Account() {
            acctNo = sequence.incrementAndGet();
        }

        void debit(DollarAmount d) {
            balance = balance.subtract(d);
        }

        void credit(DollarAmount d) {
            balance = balance.add(d);
        }

        DollarAmount getBalance() {
            return balance;
        }

        int getAcctNo() {
            return acctNo;
        }
    }

    static class InsufficientFundsException extends Exception {
    }
}

```

解决办法还是顺序话锁，考虑针对两种情况取hashcode然后判断if-else里面决定锁顺序。

```
class Helper {
            public void transfer() throws InsufficientFundsException {
                if (fromAcct.getBalance().compareTo(amount) < 0)
                    throw new InsufficientFundsException();
                else {
                    fromAcct.debit(amount);
                    toAcct.credit(amount);
                }
            }
        }
        int fromHash = System.identityHashCode(fromAcct);
        int toHash = System.identityHashCode(toAcct);

        if (fromHash < toHash) {
            synchronized (fromAcct) {
                synchronized (toAcct) {
                    new Helper().transfer();
                }
            }
        } else if (fromHash > toHash) {
            synchronized (toAcct) {
                synchronized (fromAcct) {
                    new Helper().transfer();
                }
            }
        } else {
            synchronized (tieLock) {
                synchronized (fromAcct) {
                    synchronized (toAcct) {
                        new Helper().transfer();
                    }
                }
            }
        }

```

#### [](#1013-%E5%9C%A8%E5%8D%8F%E4%BD%9C%E5%AF%B9%E8%B1%A1%E4%B9%8B%E9%97%B4%E5%8F%91%E7%94%9F%E6%AD%BB%E9%94%81deadlocks-between-cooperating-objects)10.1.3 在协作对象之间发生死锁Deadlocks Between Cooperating Objects

下面的例子setLocation和getImage都会获取两把锁，会存在两个线程按照不同的顺序获取锁的情况。

```
public class CooperatingDeadlock {
    // Warning: deadlock-prone!
    class Taxi {
        @GuardedBy("this") private Point location, destination;
        private final Dispatcher dispatcher;

        public Taxi(Dispatcher dispatcher) {
            this.dispatcher = dispatcher;
        }

        public synchronized Point getLocation() {
            return location;
        }

        public synchronized void setLocation(Point location) {
            this.location = location;
            if (location.equals(destination))
                dispatcher.notifyAvailable(this);
        }

        public synchronized Point getDestination() {
            return destination;
        }

        public synchronized void setDestination(Point destination) {
            this.destination = destination;
        }
    }

    class Dispatcher {
        @GuardedBy("this") private final Set<Taxi> taxis;
        @GuardedBy("this") private final Set<Taxi> availableTaxis;

        public Dispatcher() {
            taxis = new HashSet<Taxi>();
            availableTaxis = new HashSet<Taxi>();
        }

        public synchronized void notifyAvailable(Taxi taxi) {
            availableTaxis.add(taxi);
        }

        public synchronized Image getImage() {
            Image image = new Image();
            for (Taxi t : taxis)
                image.drawMarker(t.getLocation());
            return image;
        }
    }

    class Image {
        public void drawMarker(Point p) {
        }
    }
}

```

#### [](#1014-%E5%BC%80%E6%94%BE%E8%B0%83%E7%94%A8)10.1.4 开放调用

减小锁的力度，锁不嵌套。

```
class CooperatingNoDeadlock {
    @ThreadSafe
    class Taxi {
        @GuardedBy("this") private Point location, destination;
        private final Dispatcher dispatcher;

        public Taxi(Dispatcher dispatcher) {
            this.dispatcher = dispatcher;
        }

        public synchronized Point getLocation() {
            return location;
        }

        public synchronized void setLocation(Point location) {
            boolean reachedDestination;
            synchronized (this) {
                this.location = location;
                reachedDestination = location.equals(destination);
            }
            if (reachedDestination)
                dispatcher.notifyAvailable(this);
        }

        public synchronized Point getDestination() {
            return destination;
        }

        public synchronized void setDestination(Point destination) {
            this.destination = destination;
        }
    }

    @ThreadSafe
    class Dispatcher {
        @GuardedBy("this") private final Set<Taxi> taxis;
        @GuardedBy("this") private final Set<Taxi> availableTaxis;

        public Dispatcher() {
            taxis = new HashSet<Taxi>();
            availableTaxis = new HashSet<Taxi>();
        }

        public synchronized void notifyAvailable(Taxi taxi) {
            availableTaxis.add(taxi);
        }

        public Image getImage() {
            Set<Taxi> copy;
            synchronized (this) {
                copy = new HashSet<Taxi>(taxis);
            }
            Image image = new Image();
            for (Taxi t : copy)
                image.drawMarker(t.getLocation());
            return image;
        }
    }

    class Image {
        public void drawMarker(Point p) {
        }
    }

}

```

#### [](#1015-%E8%B5%84%E6%BA%90%E6%AD%BB%E9%94%81)1.0.15 资源死锁

*   数据库连接池，A持有数据库D1连接，等待与D2连接，B持有D2的连接，等待与D1连接。
*   线程饥饿死锁，如8.1.1小节的例子。

### [](#102-%E6%AD%BB%E9%94%81%E7%9A%84%E9%81%BF%E5%85%8D%E4%B8%8E%E8%AF%8A%E6%96%AD)10.2 死锁的避免与诊断

#### [](#1021-%E6%94%AF%E6%8C%81%E5%AE%9A%E6%97%B6%E7%9A%84%E9%94%81)10.2.1 支持定时的锁

tryLock

#### [](#1022-kill--3-%E5%8F%91%E4%BF%A1%E5%8F%B7%E7%BB%99jvm-dump%E7%BA%BF%E7%A8%8B)10.2.2 kill -3 发信号给JVM dump线程

### [](#103-%E5%85%B6%E4%BB%96%E6%B4%BB%E8%B7%83%E6%80%A7%E5%8D%B1%E9%99%A9)10.3 其他活跃性危险

#### [](#1031-%E9%A5%A5%E9%A5%BF)10.3.1 饥饿

#### [](#1033-%E6%B4%BB%E9%94%81livelock)10.3.3 活锁Livelock

他不会阻塞线程，但是也不能继续执行，因为线程在不断的重复执行相同的操作，而且总会失败。

例如处理事务消，回滚后再次重新把任务放在队头。

又例如发送数据包，都选择1s后重试，那么总会冲突，所以可以考虑一个随机数时间间隔。
