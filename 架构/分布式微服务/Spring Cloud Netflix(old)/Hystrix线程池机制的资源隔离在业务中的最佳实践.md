# 1 pom.xml
```xml
<dependency>
    <groupId>com.netflix.hystrix</groupId>
    <artifactId>hystrix-core</artifactId>
    <version>1.5.12</version>
</dependency>
```
# 2 将商品服务接口调用的逻辑进行封装
hystrix资源隔离，其实是提供了一个抽象，叫做command。若把对某个依赖服务的所有调用请求，全部隔离在同一份资源池内。

- 资源隔离
对这个依赖服务的所有调用请求，全部走这个资源池内的资源，不会去用其他的资源。

hystrix最基本的资源隔离的技术 --- 线程池隔离技术

对某个依赖服务，商品服务所有的调用请求，全部隔离到一个线程池内，对商品服务的每次调用请求都封装在一个command。

每个command（服务调用请求）都是使用线程池内的一个线程去执行。
即使商品服务接口故障了，最多只有10个线程会hang死在调用商品服务接口的路上。缓存服务的tomcat内其他的线程还是可以用来调用其他的服务，做其他的事情
```java
public class CommandHelloWorld extends HystrixCommand<String> {

    private final String name;

    public CommandHelloWorld(String name) {
        super(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"));
        this.name = name;
    }

    @Override
    protected String run() {
        return "Hello " + name + "!";
    }

}
```
不让超出这个量的请求去执行了，保护说，不要因为某一个依赖服务的故障，导致耗尽了缓存服务中的所有的线程资源去执行。

# 3 开发一个支持批量商品变更的接口
- HystrixCommand 
获取一条数据
- HystrixObservableCommand
获取多条数据

```java
public class ObservableCommandHelloWorld extends HystrixObservableCommand<String> {

    private final String name;

    public ObservableCommandHelloWorld(String name) {
        super(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"));
        this.name = name;
    }

    @Override
    protected Observable<String> construct() {
        return Observable.create(new Observable.OnSubscribe<String>() {
            @Override
            public void call(Subscriber<? super String> observer) {
                try {
                    if (!observer.isUnsubscribed()) {
                        observer.onNext("Hello " + name + "!");
                        observer.onNext("Hi " + name + "!");
                        observer.onCompleted();
                    }
                } catch (Exception e) {
                    observer.onError(e);
                }
            }
         } ).subscribeOn(Schedulers.io());
    }
}
```

# 4 command的调用方式
## 4.1 同步
```java
new CommandHelloWorld("World").execute()，
new ObservableCommandHelloWorld("World").toBlocking().toFuture().get()
```
如果你认为observable command只会返回一条数据，那么可以调用上面的模式，去同步执行，返回一条数据

## 4.2 异步
```java
new CommandHelloWorld("World").queue()，
new ObservableCommandHelloWorld("World").toBlocking().toFuture()
```
对command调用queue()，仅仅将command放入线程池的一个等待队列，就立即返回，拿到一个Future对象，后面可以做一些其他的事情，然后过一段时间对future调用get()方法获取数据
```java
// observe()：hot，已经执行过了
// toObservable(): cold，还没执行过

Observable<String> fWorld = new CommandHelloWorld("World").observe();

assertEquals("Hello World!", fWorld.toBlocking().single());

fWorld.subscribe(new Observer<String>() {

    @Override
    public void onCompleted() {

    }

    @Override
    public void onError(Throwable e) {
        e.printStackTrace();
    }

    @Override
    public void onNext(String v) {
        System.out.println("onNext: " + v);
    }

});

Observable<String> fWorld = new ObservableCommandHelloWorld("World").toObservable();

assertEquals("Hello World!", fWorld.toBlocking().single());

fWorld.subscribe(new Observer<String>() {

    @Override
    public void onCompleted() {

    }

    @Override
    public void onError(Throwable e) {
        e.printStackTrace();
    }

    @Override
    public void onNext(String v) {
        System.out.println("onNext: " + v);
    }

});
```