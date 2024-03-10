module.exports = {
    port: "8080",
    dest: "./dist",
    base: "/",
    // 是否开启默认预加载js
    shouldPrefetch: (file, type) => {
        return false;
    },
    markdown: {
        lineNumbers: true,
        externalLinks: {
            target: '_blank', rel: 'noopener noreferrer'
        }
    },
    locales: {
        "/": {
            lang: "zh-CN",
            title: "编程严选网",
            description: "Java求职面经手册和攻略，大厂设计模式、DDD实践，大厂各大中台系统设计真实案例...集全网干货于一站！"
        }
    },
    head: [
        // ico
        ["link", {rel: "icon", href: `/favicon.ico`}],
        // meta
        ["meta", {name: "robots", content: "all"}],
        ["meta", {name: "author", content: "JavaEdge"}],
        ["meta", {"http-equiv": "Cache-Control", content: "no-cache, no-store, must-revalidate"}],
        ["meta", {"http-equiv": "Pragma", content: "no-cache"}],
        ["meta", {"http-equiv": "Expires", content: "0"}],
        ["meta", {
            name: "keywords",
            content: "JavaEdge, DDD抽奖系统，数据结构，重学Java设计模式, 字节码编程, 中间件, 手写Spring, 手写MyBatis，Java基础, 面经手册，Java面试题，API网关，SpringBoot Stater, ChatGPT"
        }],
        ["meta", {name: "apple-mobile-web-app-capable", content: "yes"}],
    ],
    plugins: [
        // [
        //     {globalUIComponents: ['LockArticle', 'PayArticle']}
        // ],
        // ['@vuepress/medium-zoom', {
        //     selector: 'img:not(.nozoom)',
        //     // See: https://github.com/francoischalifour/medium-zoom#options
        //     options: {
        //         margin: 16
        //     }
        // }],
        // ['vuepress-plugin-baidu-autopush', {}],
        // // see: https://github.com/znicholasbrown/vuepress-plugin-code-copy
        ['vuepress-plugin-code-copy', {
            align: 'bottom',
            color: '#3eaf7c',
            successText: '@JavaEdge: 代码已经复制到剪贴板'
        }],
        // // see: https://github.com/tolking/vuepress-plugin-img-lazy
        // ['img-lazy', {}],
        // ["vuepress-plugin-tags", {
        //     type: 'default', // 标签预定义样式
        //     color: '#42b983',  // 标签字体颜色
        //     border: '1px solid #e2faef', // 标签边框颜色
        //     backgroundColor: '#f0faf5', // 标签背景颜色
        //     selector: '.page .content__default h1' // ^v1.0.1 你要将此标签渲染挂载到哪个元素后面？默认是第一个 H1 标签后面；
        // }],
    ],
    themeConfig: {
        docsRepo: "Java-Edge/Java-Interview-Tutorial",
        // 编辑文档的所在目录
        docsDir: 'docs',
        // 文档放在一个特定的分支下：
        docsBranch: 'main',
        //logo: "/logo.png",
        editLinks: true,
        sidebarDepth: 0,
        //smoothScroll: true,
        locales: {
            "/": {
                label: "简体中文",
                selectText: "Languages",
                editLinkText: "关注GitHub知识库",
                lastUpdated: "上次更新",
                nav: [
                    {
                        text: '导读', link: '/md/other/guide-to-reading.md'
                    },
                    {
                        text: 'RPC',
                        items: [
                            {text: '熔断限流', link: '/md/rpc/熔断限流.md'},
                        ]
                    },
                    {
                        text: '架构',
                        items: [
                            {text: '00-聚合支付架构', link: '/md/biz-arch/00-聚合支付架构从零到一.md'},
                        ]
                    },
                    {
                        text: '大数据',
                        items: [
                            {text: '大数据平台', items: [
                                {text: '00-互联网大厂的大数据平台架构', link: '/md/bigdata/大数据平台架构.md'},
                                {text: '01-对象存储', link: '/md/bigdata/对象存储.md'},
                            ]},

                            {text: 'Hadoop', items: [
                                {text: '00-安装下载Hadoop',link: '/md/bigdata/安装下载Hadoop.md'},
                                {text: '01-HDFS',link: '/md/bigdata/HDFS.md'},
                            ]},                            
                            
                            {text: 'Hive', items: [
                                {text: '01-macOS下 Hive 2.x 的安装与配置',link: '/md/bigdata/01-macOS下 Hive 2.x 的安装与配置.md'},
                                {text: '02-Hive执行原理',link: '/md/bigdata/Hive执行原理.md'},
                            ]},
                        ]
                    },
                    {
                        text: 'DDD',
                        items: [
                            {text: '00-DDD专栏规划', link: '/md/DDD/00-DDD专栏规划.md'},
                            {text: '基于电商履约场景的DDD实战', link: '/md/DDD/基于电商履约场景的DDD实战.md'},
                        ]
                    },
                    {
                        text: 'Netty',
                        items: [
                            {text: '基础篇', link: '/md/netty/base/ChannelPipeline接口.md'},
                        ]
                    },
                    {
                        text: '消息队列',
                        items: [
                            {text: 'Kafka', items: [
                                {text: '基于kafka实现延迟队列',link: '/md/kafka/15-基于kafka实现延迟队列.md'},

                            ]},
                            {text: 'RocketMQ', items: [
                                {text: '00-RocketMQ',link: '/md/kafka/15-基于kafka实现延迟队列.md'},
                                
                            ]},
                        ]
                    },
                    {
                        text: '并发',
                        link: '/md/concurrency/00-Java并发编程.md'
                    },
                    {
                        text: 'JVM',
                        link: '/md/jvm/01-JVM虚拟机-上篇.md'
                    },
                    {
                        text: 'Dubbo',
                        link: '/md/Dubbo/01-互联网架构的发展历程.md'
                    },
                    {
                        text: 'SpringCloud',
                        items: [
                            {text: 'SpringCloudAlibaba', link: '/md/spring/spring-cloud/SpringCloudAlibaba介绍.md'},
                            {text: 'SpringCloudGateway组件', items:
                                 [
                                    {text: 'SpringCloudGateway工作原理与链路图',link: '/md/spring/spring-cloud/SpringCloudGateway工作原理与链路图.md'},
                                    {text: 'SpringCloudGateway核心之Predicate', link: '/md/spring/spring-cloud/SpringCloudGateway核心之Predicate.md'},
                                    {text: 'SpringCloudGateway之Filter多过程介绍', link: '/md/spring/spring-cloud/SpringCloudGateway之Filter多过程介绍.md'}
                                ]
                            }
                        ]
                    },
                    {
                        text: 'MySQL',
                        items: [
                            {text: '00-亿级数据量商品系统的SQL调优实战', link: '/md/mysql/00-亿级数据量商品系统的SQL调优实战.md'}
                        ]
                    },
                    {
                        text: 'Redis',
                        items: [
                            {text: '00-数据结构的最佳实践', link: '/md/redis/00-数据结构的最佳实践.md'},
                            {text: '01-Redis和ZK分布式锁优缺点对比以及生产环境使用建议', link: '/md/redis/01-Redis和ZK分布式锁优缺点对比以及生产环境使用建议.md'},
                            {text: '02-Redisson可重入锁加锁源码分析', link: '/md/redis/02-Redisson可重入锁加锁源码分析.md'},
                            {text: '03-Redisson公平锁加锁源码分析', link: '/md/redis/03-Redisson公平锁加锁源码分析.md'},
                            {text: '04-Redisson读写锁加锁机制分析', link: '/md/redis/04-Redisson读写锁加锁机制分析.md'}
                        ]
                    },
                    {
                        text: 'Docker',
                        items: [
                            {text: '00-Docker基础命令大全', link: '/md/docker/00-Docker基础命令大全.md'}
                        ]
                    },
                    {
                        text: '计网',
                        items: [
                            {text: '00-计算机网络-网络层原理', link: '/md/network/计算机网络-网络层原理.md'},
                        ]
                    },
                    {
                        text: '爬虫',
                        link: '/md/spider/00-爬虫基础.md'
                    },
                    {
                        text: '面试',
                        link: '/md/zqy/面试题/01-分布式技术面试实战.md'
                    },
                    {
                        text: '12306',
                        items: [
                            {text: '项目介绍', link: '/md/12306/项目介绍.md'},
                            {text: '快速开始', items: [
                                {text: '环境搭建',link: '/md/12306/环境搭建.md'}
    
                            ]},
                            {text: '核心技术文档', items:
                                    [
                                       {text: '如何生成分布式ID',link: '/md/12306/如何生成分布式ID.md'},
                                       {text: '详解雪花算法',link: '/md/12306/详解雪花算法.md'},
                                       {text: '责任链模式重构复杂业务场景',link: '/md/12306/责任链模式重构复杂业务场景.md'},
                                       {text: '死磕设计模式之抽象责任链模式',link: '/md/12306/死磕设计模式之抽象责任链模式.md'},
                                       {text: '策略模式在项目设计中的应用',link: '/md/12306/策略模式在项目设计中的应用.md'},
                                    ]
                            }
                        ]
                    }
                ],
                // 配置文章的侧边导航栏  新增文章提交前都需要在此处操作！！！
                sidebar: {
                    "/md/Dubbo/": [
                        {
                            title: "Dubbo深入理解系列",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "01-互联网架构的发展历程.md",
                                "02-Dubbo特性及工作原理.md",
                                "03-Dubbo的负载均衡及高性能RPC调用.md",
                                "04-Dubbo的通信协议.md",
                                "05-Dubbo的应用及注册和SPI机制.md",
                                "06-Dubbo相关面试题和源码使用技巧.md",
                                "07-Dubbo真实生产环境思考.md"
                            ]
                        }
                    ],
                    "/md/zqy/面试题/": [
                        {
                            title: "面试突击",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "01-分布式技术面试实战.md",
                                "02-注册中心和网关面试实战.md",
                                "03-生产部署面试实战.md",
                                "04-分布式锁、幂等性问题实战.md",
                                "05-Java基础面试实战.md",
                                "06-Spring面试实战.md",
                                "07-计算机网络面试实战.md",
                                "08-数据库面试实战.md",
                                "09-网络通信及可见性面试实战.md",
                                "10-Java 系统架构安全面试实战.md",
                                "11-深挖网络 IO 面试实战.md",
                                "12-分布式架构、性能优化、场景设计面试实战.md",
                            ]
                        },
                        {

                            title: "面试大全",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "面试题-Java基础.md",
                                "面试题-MySQL.md",
                                "面试题-Netty.md",
                                "面试题-Redis.md",
                                "面试题-场景题.md"
                            ]
                        }
                    ],
                    "/md/biz-arch/": [
                        {
                            title: "业务架构设计",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-聚合支付架构从零到一.md",
                                "01-供应链域数据中台设计.md",
                                "02-供应链采购视角的业务系统架构.md",
                                "03-客服平台架构实践.md",
                                "04-数据质量中心系统设计.md",
                                "05-大厂CRM系统架构优化实战.md",
                                "06-运营后台系统设计.md",
                                "07-大厂报价查询系统性能优化之道.md",
                                "08-视频推荐索引构建.md",
                                "09-交易中台-如何防止订单二次重复支付？.md",
                            ]
                        }
                    ],
                    "/md/trade/": [
                        {
                            title: "交易中台",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-如何防止订单二次重复支付？.md",
                            ]
                        }
                    ],
                    "/md/bigdata/": [
                        {
                            title: "大数据平台",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "大数据平台架构.md",
                                "对象存储.md",
                            ]
                        },
                        {
                            title: "Hadoop",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "安装下载Hadoop.md",
                                "HDFS.md",
                            ]
                        },                        
                        {
                            title: "Hive",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "01-macOS下 Hive 2.x 的安装与配置.md",
                                "Hive执行原理.md",
                            ]
                        },

                    ],
                    "/md/rpc/": [
                        {
                            title: "RPC",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "熔断限流.md",
                            ]
                        }
                    ],
                    "/md/network/": [
                        {
                            title: "计网",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "计算机网络-网络层原理.md"
                            ]
                        }
                    ],
                    "/md/MQTT/": [
                        {
                            title: "MQTT",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "07-MQTT发布订阅模式介绍.md"
                            ]
                        }
                    ],
                    "/md/spider/": [
                        {
                            title: "爬虫",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-爬虫基础.md"
                            ]
                        }
                    ],
                    "/md/concurrency/": [
                        {
                            title: "并发编程",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-Java并发编程.md",
                                "01-synchronized原理.md",
                                "02-volatile原理.md",
                                "03-ReentrantLock与AQS.md",
                                "04-线程池以及生产环境使用.md",
                                "05-京东并行框架asyncTool如何针对高并发场景进行优化？.md",
                            ]
                        }
                    ],
                    "/md/jvm/": [
                        {
                            title: "JVM",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "01-JVM虚拟机-上篇.md",
                                "02-JVM虚拟机-下篇.md",
                            ]
                        }
                    ],
                    "/md/spring/spring-cloud/": [
                        {
                            title: "SpringCloudAlibaba",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "SpringCloudAlibaba介绍.md",
                            ]
                        },
                        {
                            title: "SpringCloudGateway组件",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "SpringCloudGateway工作原理与链路图.md",
                                "SpringCloudGateway核心之Predicate.md",
                                "SpringCloudGateway之Filter多过程介绍.md"
                            ]
                        }
                    ],
                    "/md/DDD/": [
                        {
                            title: "DDD领域驱动设计",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-DDD专栏规划.md",
                                "基于电商履约场景的DDD实战.md",

                            ]
                        }
                    ],
                    "/md/mysql/": [
                        {
                            title: "MySQL",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-MySQL专栏规划.md",
                            ]
                        }
                    ],
                    "/md/docker/": [
                        {
                            title: "Docker",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-Docker基础命令大全.md",
                                "01-标准化打包技术.md",
                            ]
                        }
                    ],
                    "/md/netty/base": [
                        {
                            title: "Netty",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "ChannelPipeline接口.md"
                            ]
                        }
                    ],
                    "/md/kafka": [
                        {
                            title: "Kafka",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "15-基于kafka实现延迟队列.md"
                            ]
                        }
                    ],
                    "/md/redis/": [
                        {
                            title: "Redis",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-数据结构的最佳实践.md",
                                "01-Redis和ZK分布式锁优缺点对比以及生产环境使用建议.md",
                                "02-Redisson可重入锁加锁源码分析.md",
                                "03-Redisson公平锁加锁源码分析.md",
                                "04-Redisson读写锁加锁机制分析.md"
                            ]
                        }
                    ],
                    "/md/12306/": [
                        {
                            title: "项目介绍",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "项目介绍.md",                                
                            ]
                        },
                        {
                            title: "快速开始",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "环境搭建.md",                                
                            ]
                        },
                        {
                            title: "核心技术文档",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "如何生成分布式ID.md",
                                "详解雪花算法.md",
                                "责任链模式重构复杂业务场景.md",
                                "死磕设计模式之抽象责任链模式.md",
                                "策略模式在项目设计中的应用.md",
                            ]
                        }
                    ],
                }
            }
        }
    }
};