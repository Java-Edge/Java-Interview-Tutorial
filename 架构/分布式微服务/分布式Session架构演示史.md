Session代表的是客户端与服务器的一次交互过程，这个过程可以是连续也可以是时断时续的。曾经的Sevlet时代(JSP)，一旦用户与服务端交互，Tomcat就会为用户创建一个session，同时前端会有一个jsessionid，每次交互都会携带。
服务器只要在接到用户请求时候，就可以拿到jsessionid, 并根据这个ID在内存中找到对应的会话session,当拿到session会话后，那么我们就可以操作会话了。会话存活期间，我们就能认为用户一直处于正在使用着网站的状态，session超期过时，那么就可以认为用户已经离开网站,停止交互了。用户的身份信息，我们也是通过session来判断的，在session中可以保存不同用户的信息。
session的使用之前在单体部分演示过，代码如下:

```java
@GetMapping("/setSession")
public object setSession(HttpServletRequest request) {
	HttpSession session = request . getSessionO;
	session. setAttribute("userInfo", "new user");
	session. setMaxInactiveInterval(3600);
	session. getAttribute("userInfo");
	session. removeAttribute("userInfo");
	return "ok" ;
}
```
# 无状态会话
HTTP请求是无状态的，用户向服务端发起多个请求，服务端并不会知道这多次请求都是来自同一用户，这就叫无状态。


cookie的出现就是为了有状态的记录用户。
常见的，ios与服务端交互， 安卓与服务端交互，前后端分离，小程序与服务端交互，他们都是通过发起HTTP请求调用接口数据，每次交互服务端都不会拿到客户端的状态，但是我们可以通过手段去处理，比如每次用户发起请求的时候携带一个
userid或者user-toke,就能让服务端根据用户id或token来获得相应的数据。每个用户的下一次请求都能被服务端识别来自同一个用户。

# 有状态会话
Tomcat中的会话，就是有状态的，一旦用户和服务端交互，就有会话，会话保存了用户的信息，这样用户就"有状态”了， 服务端会和每个客户端都保持着这样的一层关系，这个由容器来管理(也就是tomcat) , 这个session会话是保存到内存空间里
的，如此一来，当不同的用户访问服务端，那么就能通过会话知道谁是谁了。如果用户不再和服务端交互，那么会话则消失，结束了他的生命周期。如此-来，每个用户其实都会有一个会话被维护，这就是有状态会话。

在传统项目或JSP项目使用的最多的session都是有状态，session的存在就是为了弥补HTTP的无状态。
tomcat会话自身可配置实现多系统之间的状态同步，但是会损耗一定的时间， 一旦发生同步那么用户请求就会等待，这种做法不可取。

# 为何使用无状态会话
有状态会话都是放在服务器的内存中的。一旦用户会话量多，那么内存就会出现瓶颈。而无状态会话可以采用介质，前端可以使用cookie (app可以使用缓存) 保存用户id或token, 后端比如redis。相应的用户会话都能放入redis中进行管理，如此，
对应用部署的服务器就不会造成内存压力。用户在前端发起http谓求，携带id或token, 如此服务端能够根据前端提供的id或token来识别用户了，可伸缩性就更强了。

# 单Tomcat会话
单个tomcat会话，这个就是有状态的，用户首次访问服务端，这个时候会话产生，井且会设置jsessionid放入cookie中，后绠每次请求都会携带jsessionid以保持用户状态。![](https://img-blog.csdnimg.cn/20210108154037961.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 动静分离会话
用户请求服务端，由于动静分离，前端发起htp请求，不会携带任何状态，当用户 第一次请求以后，我们手动设置一个token,作为用户会话，放入redis中，如此作为redis-session，并且这个token设置后放入前端cookie中(app或小程序可以放
入本地缓存) ，如此后续交互过程中，前端只需要传递token给后端，后端就能识别这个用户请求来自谁。![](https://img-blog.csdnimg.cn/20210108155044355.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
# 集群或分布式系统会话
本质都是多个系统，假设这个里有两个服务器节点，分别是AB系统，他们可以是集群，也可以是分布式系统，一开始用户和A系统交互，那么这个时候的用户状态，我们可以保存到redis中， 作为A系统的会话信息，随后用户的请求
进入到了B系统，那么B系统中的会话我也同样和redis关联，如此AB系统的session就统一 了。 当然cookie是会随着用户的访问携带过来的。那么这个其实就是分布式会话，通过redis来保存用户的状态。![](https://img-blog.csdnimg.cn/20210108155139704.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_SmF2YUVkZ2U=,size_1,color_FFFFFF,t_70)
