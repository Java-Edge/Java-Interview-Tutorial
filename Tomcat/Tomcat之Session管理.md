先了解Session，Cookie，JSESSIONID
JSESSIONID是一个唯一标识号，用来标识服务器端的Session，也用来标识客户端的Cookie，客户端和服务器端通过这个JSESSIONID来一一对应。这里需要说明的是Cookie已经包含JSESSIONID了，可以理解为JSESSIONID是Cookie里的一个属性。让我假设一次客户端连接来说明我对个这三个概念的理解


HTTP连接本身是无状态的，即前一次发起的连接跟后一次没有任何关系，是两次独立的连接请求
但是互联网访问基本上都是需要有状态的，即服务器需要知道两次连接请求是不是同一个人访问的。如你在浏览淘宝的时候，把一个东西加入购物车，再点开另一个商品页面的时候希望在这个页面里面的购物车还有上次添加进购物车的商品。也就是说淘宝服务器会知道这两次访问是同一个客户端访问的
客户端第一次请求到服务器的连接，这个连接是没有附带任何东西的，没有Cookie，更没有JSESSIONID。服务器端接收到请求后，会检查这次请求有没有传过来JSESSIONID或者Cookie，如果没有JSESSIONID或Cookie，服务端会创建一个Session，并生成一个与该Session相关联的JSESSIONID发给客户端，客户端会保存这个JSESSIONID，并生成一个与该JSESSIONID关联的Cookie，第二次请求的时候，会把该Cookie（包含JSESSIONID）一起发送给服务器端，这次服务器发现这个请求有了Cookie，便从中取出JSESSIONID，然后根据这个JSESSIONID找到对应的Session，这样便把Http的无状态连接变成了有状态的连接。但是有时候浏览器（即客户端）会禁用Cookie，我们知道Cookie是通过HTTP请求头部的一个cookie字段传过去的，如果禁用，便得不到这个值，JSESSIONID也不能通过Cookie传入服务器端
当然我们还有其他的解决办法，url重写和隐藏表单，url重写就是把JSESSIONID附带在url后面传过去。隐藏表单是在表单提交的时候传入一个隐藏字段JSESSIONID。这两种方式都能把JSESSIONID传过去

  下面来看Tomcat是怎么实现以上流程的。连接请求会交给HttpProcessor的process方法处理，在此方法有这么几句
```java
parseConnection(socket);  
parseRequest(input, output);//解析请求行，如果有jessionid，会在方法里面解析jessionid  
if (!request.getRequest().getProtocol()  
    .startsWith("HTTP/0"))  
    parseHeaders(input);//解析请求头部，如果有cookie字段，在方法里面会解析cookie，  
```
下面看parseRequest方法里面是怎么解析jessionid的，这种解析方式是针对url重写的
```java
parseRequest方法：  
int semicolon = uri.indexOf(match);//match是“;JSESSIONID=”，即在请求行查找字段JSESSIONID  
        if (semicolon >= 0) {                                   //如果有JSESSIONID字段，表示不是第一次访问  
            String rest = uri.substring(semicolon + match.length());  
            int semicolon2 = rest.indexOf(';');  
            if (semicolon2 >= 0) {  
                request.setRequestedSessionId(rest.substring(0, semicolon2));//设置sessionid  
                rest = rest.substring(semicolon2);  
            } else {  
                request.setRequestedSessionId(rest);  
                rest = "";  
            }  
            request.setRequestedSessionURL(true);  
            uri = uri.substring(0, semicolon) + rest;  
            if (debug >= 1)  
                log(" Requested URL session id is " +  
                    ((HttpServletRequest) request.getRequest())  
                    .getRequestedSessionId());  
        } else {                               //如果请求行没有JSESSIONID字段，表示是第一次访问。  
            request.setRequestedSessionId(null);  
            request.setRequestedSessionURL(false);  
        }  
```
代码没什么说的，看url有没有JSESSIONID，有就设置request的sessionid，没有就设置为null。有再看parseHeaders方法
```java
.....  
....else if (header.equals(DefaultHeaders.COOKIE_NAME)) { //COOKIE_NAME的值是cookie  
                Cookie cookies[] = RequestUtil.parseCookieHeader(value);  
                for (int i = 0; i < cookies.length; i++) {  
                    if (cookies[i].getName().equals  
                        (Globals.SESSION_COOKIE_NAME)) {  
                        // Override anything requested in the URL  
                        if (!request.isRequestedSessionIdFromCookie()) {  
                            // Accept only the first session id cookie  
                            request.setRequestedSessionId  
                                (cookies[i].getValue());//设置sessionid  
                            request.setRequestedSessionCookie(true);  
                            request.setRequestedSessionURL(false);  
                            if (debug >= 1)  
                                log(" Requested cookie session id is " +  
                                    ((HttpServletRequest) request.getRequest())  
                                    .getRequestedSessionId());  
                        }  
                    }  
                    if (debug >= 1)  
                        log(" Adding cookie " + cookies[i].getName() + "=" +  
                            cookies[i].getValue());  
                    request.addCookie(cookies[i]);  
                }  
            }   
```
主要就是从http请求头部的字段cookie得到JSESSIONID并设置到reqeust的sessionid，没有就不设置
这样客户端的JSESSIONID（cookie）就传到tomcat,tomcat把JSESSIONID的值赋给request了
这个request在Tomcat的唯一性就标识了。

我们知道，Session只对应用有用，两个应用的Session一般不能共用，在Tomcat一个Context代表一个应用，所以一个应用应该有一套自己的Session，Tomcat使用Manager来管理各个应用的Session，Manager也是一个组件，跟Context是一一对应的关系
Manager的标准实现是StandardManager，由它统一管理Context的Session对象（标准实现是StandardSession），能够猜想，StandardManager一定能够创建Session对象和根据JSESSIONID从跟它关联的应用中查找Session对象。事实上StandardManager确实有这样的方法，但是StandardManager本身没有这两个方法，它的父类ManagerBase有这两个方法
```java
ManagerBase类的findSession和createSession()方法  
public Session findSession(String id) throws IOException {  
        if (id == null)  
            return (null);  
        synchronized (sessions) {  
            Session session = (Session) sessions.get(id);//根据sessionid（即<span style="font-family: Arial; ">JSESSIONID</span>）查找session对象。  
            return (session);  
        }  
    }  
public Session createSession() { //创建session对象  
        // Recycle or create a Session instance  
        Session session = null;  
        synchronized (recycled) {  
            int size = recycled.size();  
            if (size > 0) {  
                session = (Session) recycled.get(size - 1);  
                recycled.remove(size - 1);  
            }  
        }  
        if (session != null)  
            session.setManager(this);  
        else  
            session = new StandardSession(this);  
  
        // Initialize the properties of the new session and return it  
        session.setNew(true);  
        session.setValid(true);  
        session.setCreationTime(System.currentTimeMillis());  
        session.setMaxInactiveInterval(this.maxInactiveInterval);  
        String sessionId = generateSessionId();//使用md5算法生成sessionId  
        String jvmRoute = getJvmRoute();  
        // @todo Move appending of jvmRoute generateSessionId()???  
        if (jvmRoute != null) {  
            sessionId += '.' + jvmRoute;  
            session.setId(sessionId);  
        }  
        session.setId(sessionId);  
        return (session);  
    }  
```
  以上是StandardManager的管理Session的两个重要方法

这里有一个问题，Session是在什么时候生成的？
仔细想想，我们编写servlet的时候，如果需要Session，会使用request.getSession(),这个方法最后会调用到HttpRequestBase的getSession()方法
所以这里有个重要的点：Session并不是在客户端第一次访问就会在服务器端生成，而是在服务器端(一般是servlet里)使用request调用getSession方法才生成的。但是默认情况下，jsp页面会调用request.getSession(),即jsp页面的这个属性<%@ page session="true" %>默认是true的,编译成servlet后会调用request.getSession()。所以只要访问jsp页面，一般是会在服务器端创建session的。但是在servlet里就需要显示的调用getSession(),当然是在要用session的情况。下面看这个getSession()方法
```java
HttpRequestBase.getSession()  
   调用---------------》  
    HttpRequestBase.getSession(boolean create)  
       调用 ----------------》  
            HttpRequestBase.doGetSession(boolean create){  
      if (context == null)  
            return (null);  
     
        // Return the current session if it exists and is valid  
        if ((session != null) && !session.isValid())  
            session = null;  
        if (session != null)  
            return (session.getSession());  
        // Return the requested session if it exists and is valid  
        Manager manager = null;  
        if (context != null)  
            manager = context.getManager();  
  
        if (manager == null)  
            return (null);      // Sessions are not supported  
  
        if (requestedSessionId != null) {  
            try {  
                session = manager.findSession(requestedSessionId);//这里调用StandardManager的findSession方法查找是否存在Session对象  
            } catch (IOException e) {  
                session = null;  
            }  
            if ((session != null) && !session.isValid())  
                session = null;  
            if (session != null) {  
                return (session.getSession());  
            }  
        }  
  
        // Create a new session if requested and the response is not committed  
        if (!create)  
            return (null);  
        if ((context != null) && (response != null) &&  
            context.getCookies() &&  
            response.getResponse().isCommitted()) {  
            throw new IllegalStateException  
              (sm.getString("httpRequestBase.createCommitted"));  
        }  
  
        session = manager.createSession();//这里调用StandardManager的创建Session对象  
        if (session != null)  
            return (session.getSession());  
        else  
            return (null);  
}       
```
  以上
