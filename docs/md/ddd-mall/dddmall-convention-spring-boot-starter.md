# dddmall-convention-spring-boot-starter



#### 异常公约



```java
/**
 * 基础错误码定义
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public enum BaseErrorCode implements IErrorCode {
    
    // ========== 一级宏观错误码 客户端错误 ==========
    CLIENT_ERROR("A000001", "用户端错误"),
    
    private final String code;
    
    private final String message;
    
    BaseErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }
    
    @Override
    public String code() {
        return code;
    }
    
    @Override
    public String message() {
        return message;
    }
}
```



```java
import org.opengoofy.congomall.springboot.starter.convention.errorcode.BaseErrorCode;
import org.opengoofy.congomall.springboot.starter.convention.errorcode.IErrorCode;

/**
 * 服务端异常
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
public class ServiceException extends AbstractException {
    
    public ServiceException(String message) {
        this(message, null, BaseErrorCode.SERVICE_ERROR);
    }
}
```

#### 分页和全局数据对象

```java
package org.opengoofy.congomall.springboot.starter.convention.page;

import lombok.Data;

/**
 * 分页请求对象
 *
 * <p> {@link PageRequest}、{@link PageResponse}
 * 可理解为防腐层的一种实现，不论底层 ORM 框架，对外分页参数属性不变
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
@Data
public class PageRequest {
    
    /**
     * 当前页
     */
    private Long current;
    
    /**
     * 每页显示条数
     */
    private Long size;
}
```

```java
package org.opengoofy.congomall.springboot.starter.convention.page;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 分页返回对象
 *
 * <p> {@link PageRequest}、{@link PageResponse}
 * 可以理解是防腐层的一种实现，不论底层 ORM 框架，对外分页参数属性不变
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 当前页
     */
    private Long current;
    
    /**
     * 每页显示条数
     */
    private Long size = 10L;
    
    /**
     * 总数
     */
    private Long total;
    
    /**
     * 查询数据列表
     */
    private List<T> records = Collections.emptyList();
    
    public PageResponse(long current, long size) {
        this(current, size, 0);
    }
    
    public PageResponse(long current, long size, long total) {
        if (current > 1) {
            this.current = current;
        }
        this.size = size;
        this.total = total;
    }
    
    public PageResponse setRecords(List<T> records) {
        this.records = records;
        return this;
    }
    
    public <R> PageResponse<R> convert(Function<? super T, ? extends R> mapper) {
        List<R> collect = this.getRecords().stream().map(mapper).collect(Collectors.toList());
        return ((PageResponse<R>) this).setRecords(collect);
    }
}
```

#### 全局返回对象

```java
package org.opengoofy.congomall.springboot.starter.convention.result;

import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * 全局返回对象
 *
 * @author JavaEdge
 * @github <a href="https://github.com/Java-Edge" />
 * @公众号 JavaEdge，关注回复：架构师，领取后端架构师成长手册
 */
@Data
@Accessors(chain = true)
public class Result<T> implements Serializable {
    
    private static final long serialVersionUID = 5679018624309023727L;
    
    /**
     * 正确返回码
     */
    public static final String SUCCESS_CODE = "0";
    
    /**
     * 返回码
     */
    private String code;
    
    /**
     * 返回消息
     */
    private String message;
    
    /**
     * 响应数据
     */
    private T data;
    
    /**
     * 请求ID
     */
    private String requestId;
    
    public boolean isSuccess() {
        return SUCCESS_CODE.equals(code);
    }
}
```