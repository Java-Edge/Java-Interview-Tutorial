# 微信支付开发避坑指南

## 1 微信支付的坑

### 1.1 不能用前端传递过来的金额

订单的商品金额要从数据库获取，前端只传商品 id。

### 1.2 交易类型trade type字段不要传错

v2版API，不同交易类型，要调用的支付方式也不同。

### 1.3 二次签名

下单时，在拿到预支付交易会话标识时，要进行二次签名操作。二次签名后的值，才能返回给前端使用。

### 1.4 小程序可绑定到其它公司的商户下

可同时关联到多个商户号：

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/2ade8f6b7a390f83b06563fa0d2f0012.png)

### 1.5 微信支付的单位是分，最小金额是0.01元

支付宝是元。

### 1.6 做避免重复消费的处理



![](https://my-img.javaedge.com.cn/javaedge-blog/2024/09/548be3c98677fe44977a8d262c90fa09.png)

处理成功之后不要再进行二次处理了，那首先是有事务操作。

第一次处理成功后，需要更新对应订单的状态。更新完成后，下次再处理时，直接返回成功，不再进行实际业务处理。

也可以拿这个订单号加分布式锁，保证对同一个用户，同时只能处理一个订单。

### 1.7 支付结果验签

对支付结果通知，一定要拿配置的私钥进行验签处理。

```java
// 处理内部业务逻辑
try {
    // 支付结果验签
    boolean valid = WXPayUtil.isSignatureValid(map1, weixinpaypartner);
    if (valid == false) {
        log.info("签名不一致" + outTradeNo);
        return "ERROR";
    } else {
        //1、更新订单状态
        dealAfterSuccess(basOrder, time_end, transaction_id, result_code);
        log.info("验签成功" + outTradeNo);
        result = CommUtils.setXml("SUCCESS", "OK");
        log.info("收到异步通知返回微信的内容--" + result);
        return result;
    }
} catch (Exception e) {
    e.printStackTrace();
    return "ERROR";
}
```

不验签也可以继续执行，但支付结果页容易被伪造哦！

### 1.8 对支付结果通知处理逻辑中的非事务性操作做操作记录

可能在支付通知后，通过小程序给用户发送模板消息通知或公众号消息通知触达。若这时事务处理失败，但结果发送成功了，会造成啥结果？那你下次是否要重新处理这个订单流程，在重新处理订单时难道再发一次推送吗？肯定不可以。

所以最好拿订单号作为标识，判断记录这个订单是否已经有过啥事务性、非事务性操作，下次或者是订单补偿时，就只处理事务性操作，不再处理非事务性操作。

### 1.9 v2的统一下单的接口

服务号、H5下单和小程序下单都可调用，甚至app下单都可以调用。