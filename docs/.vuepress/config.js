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
            target: '_blank',
            rel: 'noopener noreferrer'
        }
    },
    locales: {
        "/": {
            lang: "zh-CN",
            title: "编程严选网",
            description: "Java、大数据、AI应用开发求职必备技能：计算机基础，大厂设计模式、DDD以及各大中台和业务系统设计真实案例...软件工程师的一站式终身学习网站！"
        }
    },
    head: [
        ["link", {
            rel: "icon",
            href: `/favicon.ico`
        }],
        ["meta", {
            name: "robots",
            content: "all"
        }],
        ["meta", {
            name: "author",
            content: "JavaEdge"
        }],
        ["meta", {
            "http-equiv": "Cache-Control",
            content: "no-cache, no-store, must-revalidate"
        }],
        ["meta", {
            "http-equiv": "Pragma",
            content: "no-cache"
        }],
        ["meta", {
            "http-equiv": "Expires",
            content: "0"
        }],
        ["meta", {
            name: "keywords",
            content: "JavaEdge,数据结构，重学设计模式, 中间件, Java基础, 面经手册，Java面试题，API网关"
        }],
        ["meta", {
            name: "apple-mobile-web-app-capable",
            content: "yes"
        }],
        [
            'script',
            {
                charset: 'utf-8',
                src: 'https://my.openwrite.cn/js/readmore.js'
            },
        ],
    ],
    plugins: [
        [{
            globalUIComponents: ['LockArticle', 'PayArticle']
        }],
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
        editLinks: true,
        sidebarDepth: 0,
        //smoothScroll: true,
        locales: {
            "/": {
                label: "简体中文",
                selectText: "Languages",
                editLinkText: "关注GitHub知识库",
                lastUpdated: "上次更新",
                nav: [{
                        text: '导读',
                        link: '/md/other/guide-to-reading.md'
                    },
                    {
                        text: '架构',
                        items: [{
                                text: '业务架构',
                                items: [{
                                    text: '00-聚合支付架构',
                                    link: '/md/biz-arch/00-聚合支付架构从零到一'
                                }, ]
                            },
                            {
                                text: '系统设计',
                                items: [{
                                    text: '00-优惠券系统设计',
                                    link: '/md/biz-arch/00-优惠券系统设计 Coupon System'
                                }, ]
                            },

                            {
                                text: 'DDD',
                                items: [{
                                        text: '00-DDD专栏规划',
                                        link: '/md/DDD/00-DDD专栏规划.md'
                                    },
                                    {
                                        text: '00-大厂实践',
                                        link: '/md/DDD/02-领域驱动设计DDD在B端营销系统的实践.md'
                                    },

                                ]
                            },

                            {
                                text: '数据中台',
                                items: [{
                                    text: '00-新一代数据栈将逐步替代国内单一“数据中台”',
                                    link: '/md/biz-arch/00-新一代数据栈将逐步替代国内单一“数据中台”.md'
                                }, ]
                            },

                            {
                                text: '商品中心',
                                items: [{
                                    text: '00-商品中心的spu、sku设计.md',
                                    link: '/md/product-center/00-商品中心的spu、sku设计.md'
                                }, ]
                            },

                            {
                                text: '用户画像',
                                items: [{
                                    text: '01-DMP系统简介.md',
                                    link: '/md/biz-arch/01-DMP系统简介.md'
                                }, ]
                            },
                        ]
                    },

                    {
                        text: '重构',
                        items: [{
                                text: '重构',
                                items: [{
                                    text: '00-软件架构权衡-我们为什么以及如何进行权衡？',
                                    link: '/md/design/00-软件架构权衡-我们为什么以及如何进行权衡？.md'
                                }, ]
                            },
                            {
                                text: '设计原则',
                                items: [{
                                    text: '设计原则概述',
                                    link: '/md/kafka/Kafka门派知多少.md'
                                }, ]
                            },
                            {
                                text: '设计模式',
                                items: [{
                                    text: '模板方法设计模式（Template Pattern）',
                                    link: '/md/design/模板方法设计模式（Template Pattern）.md'
                                }, ]
                            },
                        ]
                    },

                    {
                        text: '管理',
                        items: [{
                            text: '项目管理',
                            items: [{
                                text: '00-如何学习项目管理专栏',
                                link: '/md/mgr/00-如何学习项目管理专栏.md'
                            }, ]
                        }, ]
                    },
                    {
                        text: '大数据',
                        items: [{
                                text: '大数据平台',
                                items: [{
                                        text: '00-互联网大厂的大数据平台架构',
                                        link: '/md/bigdata/大数据平台架构.md'
                                    },
                                    {
                                        text: '01-对象存储',
                                        link: '/md/bigdata/对象存储.md'
                                    },
                                ]
                            },

                            {
                                text: 'Hadoop',
                                items: [{
                                    text: '00-安装下载Hadoop',
                                    link: '/md/bigdata/安装下载Hadoop.md'
                                }]
                            },

                            {
                                text: 'Hive',
                                items: [{
                                    text: 'Hive专栏概述',
                                    link: '/md/bigdata/Hive专栏概述.md'
                                }, ]
                            },

                            {
                                text: '数据仓库',
                                items: [{
                                    text: 'Spark+ClickHouse实战企业级数据仓库专栏',
                                    link: '/md/bigdata/Spark+ClickHouse实战企业级数据仓库专栏.md'
                                }, ]
                            },

                            {
                                text: 'DataX',
                                items: [{
                                    text: 'DataX专栏',
                                    link: '/md/bigdata/阿里云开源离线同步工具DataX3.0介绍.md'
                                }, ]
                            },

                            {
                                text: 'DolphinScheduler',
                                items: [{
                                    text: 'DolphinScheduler专栏',
                                    link: '/md/bigdata/作业帮基于 DolphinScheduler 的数据开发平台实践.md'
                                }, ]
                            },

                            {
                                text: 'Spark',
                                items: [{
                                    text: '为啥要学习Spark？',
                                    link: '/md/spark/为啥要学习Spark？.md'
                                }, ]
                            },
                        ]
                    },
                    {
                        text: '安全',
                        items: [

                            {
                                text: '常见攻击手段',
                                items: [{
                                    text: '常见攻击手段概述',
                                    link: '/md/security/01-OAuth 2.0实战-为什么要先获取授权码code.md'
                                }, ]
                            },

                            {
                                text: 'Oauth2.0',
                                items: [{
                                    text: 'Oauth2.0专栏概述',
                                    link: '/md/security/01-OAuth 2.0实战-为什么要先获取授权码code.md'
                                }, ]
                            },

                        ]
                    },

                    {
                        text: '中间件',
                        items: [{
                                text: 'RPC',
                                items: [{
                                    text: '熔断限流',
                                    link: '/md/rpc/熔断限流.md'
                                }, ]
                            },

                            {
                                text: 'Netty',
                                items: [{
                                    text: 'Netty入门',
                                    link: '/md/netty/ChannelPipeline接口.md'
                                }, ]
                            },

                            {
                                text: 'ShardingSphere',
                                items: [{
                                    text: 'ShardingSphere',
                                    link: '/md/ShardingSphere/14-ShardingSphere的分布式主键实现.md'
                                }]
                            },

                            {
                                text: 'Kafka',
                                items: [{
                                        text: '00-Kafka专栏大纲.md',
                                        link: '/md/kafka/00-Kafka专栏大纲.md'
                                    },
                                ]
                            },

                            {
                                text: 'RocketMQ',
                                items: [{
                                        text: '01-RocketMQ核心内容',
                                        link: '/md/RocketMQ/01-RocketMQ核心内容.md'
                                    },
                                    {
                                        text: '02-基于电商场景的高并发RocketMQ实战',
                                        link: '/md/RocketMQ/02-基于电商场景的高并发RocketMQ实战.md'
                                    },
                                ]
                            },

                            {
                                text: 'RabbitMQ',
                                items: [{
                                    text: '00-RabbitMQ',
                                    link: '/md/rabbitmq/00-RabbitMQ实战下载与安装.md'
                                }, ]
                            },

                            {
                                text: 'MQTT',
                                items: [{
                                    text: '00-MQTT',
                                    link: '/md/MQTT/07-MQTT发布订阅模式介绍.md'
                                }, ]
                            },
                        ]
                    },

                    {
                        text: 'Java',
                        items: [{
                                text: '并发',
                                items: [{
                                    text: '并发编程专栏概述',
                                    link: '/md/java/并发编程专栏概述.md'
                                }, ]
                            },

                            {
                                text: 'JVM',
                                items: [{
                                    text: 'JVM专栏概述',
                                    link: '/md/java/JVM专栏概述.md'
                                }, ]
                            },

                            {
                                text: 'JDK',
                                items: [{
                                    text: 'JDK22新特性',
                                    link: '/md/java/JDK22新特性.md'
                                }, ]
                            },
                            
                            {
                                text: 'Tomcat',
                                items: [{
                                    text: 'Tomcat网络编程',
                                    link: '/md/tomcat/00-不知道这些Servlet规范、容器，还敢说自己是Java程序员.md'
                                }, ]
                            },
                        ]
                    },

                    {
                        text: '分布式',
                        items: [{
                                text: 'Dubbo',
                                items: [{
                                    text: '01-互联网架构的发展历程',
                                    link: '/md/Dubbo/01-互联网架构的发展历程.md'
                                }, ]
                            },

                            {
                                text: 'SpringCloud',
                                items: [{
                                        text: 'SpringCloudAlibaba',
                                        link: '/md/spring/spring-cloud/SpringCloudAlibaba介绍.md'
                                    }, {
                                        text: 'SpringCloudGateway工作原理与链路图',
                                        link: '/md/spring/spring-cloud/SpringCloudGateway工作原理与链路图.md'
                                    },
                                    {
                                        text: 'SpringCloudGateway组件',
                                        items: [{
                                                text: 'SpringCloudGateway工作原理与链路图',
                                                link: '/md/spring/spring-cloud/SpringCloudGateway工作原理与链路图.md'
                                            },
                                            {
                                                text: 'SpringCloudGateway核心之Predicate',
                                                link: '/md/spring/spring-cloud/SpringCloudGateway核心之Predicate.md'
                                            },
                                            {
                                                text: 'SpringCloudGateway之Filter多过程介绍',
                                                link: '/md/spring/spring-cloud/SpringCloudGateway之Filter多过程介绍.md'
                                            },
                                            {
                                                text: 'SpringCloudGateway之熔断集成篇',
                                                link: '/md/spring/spring-cloud/SpringCloudGateway之熔断集成篇.md'
                                            },
                                            {
                                                text: 'SpringCloudGateway之限流集成篇',
                                                link: '/md/spring/spring-cloud/SpringCloudGateway之限流集成篇.md'
                                            },
                                            {
                                                text: 'SpringCloudGateway之统一鉴权篇',
                                                link: '/md/spring/spring-cloud/SpringCloudGateway之统一鉴权篇.md'
                                            },
                                            {
                                                text: 'SpringCloudGateway之灰度发布篇',
                                                link: '/md/spring/spring-cloud/SpringCloudGateway之灰度发布篇.md'
                                            },
                                            {
                                                text: 'SpringCloudGateway之高性能篇',
                                                link: '/md/spring/spring-cloud/SpringCloudGateway之高性能篇.md'
                                            }
                                        ]
                                    }
                                ]
                            },

                            {
                                text: '大厂实践',
                                items: [{
                                    text: '01-Segment为何永别微服务了？',
                                    link: '/md/spring/spring-cloud/practise/01-Segment为何永别微服务了？.md'
                                }, ]
                            },

                        ]
                    },

                    {
                        text: '数据库',
                        items: [{
                                text: 'MySQL',
                                items: [{
                                    text: '亿级数据量商品系统的SQL调优实战',
                                    link: '/md/mysql/00-亿级数据量商品系统的SQL调优实战.md'
                                }]
                            },

                            {
                                text: 'Redis',
                                items: [{
                                    text: 'Redis数据结构的最佳实践',
                                    link: '/md/redis/00-数据结构的最佳实践.md'
                                }]
                            },

                            {
                                text: 'ElasticSearch',
                                items: [{
                                    text: 'ES专栏大纲',
                                    link: '/md/es/ES专栏大纲.md'
                                }]
                            },

                            {
                                text: 'ClickHouse',
                                items: [{
                                    text: 'clickhouse概述',
                                    link: '/md/ck/clickhouse概述.md'
                                }]
                            },

                            {
                                text: '分布式数据库',
                                items: [{
                                    text: '查询执行引擎：如何让聚合计算加速？',
                                    link: '/md/distdb/21-查询执行引擎：加速聚合计算加速.md'
                                }]
                            },
                        ]
                    },

                    {
                        text: '云原生',
                        items: [{
                                text: 'Go',
                                items: [{
                                    text: '00-Go实战(一)-概述',
                                    link: '/md/go/00-Go实战(一)-概述.md'
                                }]
                            },

                            {
                                text: 'Docker',
                                items: [{
                                    text: 'Docker基础命令大全',
                                    link: '/md/docker/00-Docker基础命令大全.md'
                                }]
                            },

                            {
                                text: 'k8s',
                                items: [{
                                    text: 'kubectl命令',
                                    link: '/md/k8s/kubectl命令.md'
                                }]
                            },

                            {
                                text: '监控',
                                items: [{
                                    text: '00-你居然还去服务器上捞日志，搭个日志收集系统难道不香么！',
                                    link: '/md/monitor/00-你居然还去服务器上捞日志，搭个日志收集系统难道不香么！.md'
                                }]
                            },
                        ]
                    },

                    {
                        text: '计基',
                        items: [{
                                text: '计算机网络',
                                items: [{
                                    text: '00-计算机网络-网络层原理',
                                    link: '/md/network/计算机网络-网络层原理.md'
                                }, ]
                            },

                            {
                                text: 'Linux操作系统',
                                items: [{
                                    text: '00-操作系统专栏大纲',
                                    link: '/md/linux/00-操作系统专栏大纲.md'
                                }, ]
                            },

                            {
                                text: '数据结构与算法',
                                items: [{
                                    text: '数据结构与算法专栏大纲',
                                    link: '/md/algorithm/logic/basic/00-数据结构与算法专栏大纲.md'
                                }, ]
                            },

                            {
                                text: '大厂算法面试',
                                items: [{
                                        text: '00-阿里秋招高频算法题汇总-基础篇',
                                        link: '/md/algorithm/logic/leetcode/00-阿里秋招高频算法题汇总-基础篇.md'
                                    },
                                    {
                                        text: '01-阿里秋招高频算法题汇总-中级篇',
                                        link: '/md/algorithm/logic/leetcode/01-阿里秋招高频算法题汇总-中级篇.md'
                                    },
                                    {
                                        text: '02-阿里秋招高频算法题汇总-进阶篇',
                                        link: '/md/algorithm/logic/leetcode/02-阿里秋招高频算法题汇总-进阶篇.md'
                                    },
                                    {
                                        text: '03-字节秋招高频算法题汇总-基础篇',
                                        link: '/md/algorithm/logic/leetcode/03-字节秋招高频算法题汇总-基础篇.md'
                                    },
                                    {
                                        text: '04-字节秋招高频算法题汇总-中级篇',
                                        link: '/md/algorithm/logic/leetcode/04-字节秋招高频算法题汇总-中级篇.md'
                                    },
                                    {
                                        text: '05-字节秋招高频算法题汇总-进阶篇',
                                        link: '/md/algorithm/logic/leetcode/05-字节秋招高频算法题汇总-进阶篇.md'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        text: '面试',
                        link: '/md/zqy/面试题/01-分布式技术面试实战.md'
                    },
                    {
                        text: '12306',
                        items: [{
                                text: '项目介绍',
                                link: '/md/12306/项目介绍.md'
                            },
                            {
                                text: '快速开始',
                                items: [{
                                    text: '环境搭建',
                                    link: '/md/12306/环境搭建.md'
                                }]
                            },
                            {
                                text: '核心技术文档',
                                items: [{
                                    text: '如何生成分布式ID',
                                    link: '/md/12306/如何生成分布式ID.md'
                                }, ]
                            }
                        ]
                    },

                    {
                        text: 'Spring',
                        items: [{
                            text: 'SpringMVC拦截处理器',
                            link: '/md/spring/03-SpringMVC拦截处理器.md'
                        }, ]
                    },

                    // {
                    //     text: 'Vue',
                    //     items: [{
                    //         text: '01-Vue开发实战',
                    //         link: '/md/vue/01-Vue开发实战.md'
                    //     }, ]
                    // },

                    {
                        text: 'AI',
                        items: [{
                                text: 'Python基础',
                                link: '/md/python/00-macOS和Linux安装和管理多个Python版本'
                            },
                            {
                                text: 'GPT发展',
                                link: '/md/AI/Claude3到底多强'
                            },
                            {
                                text: '机器学习',
                                link: '/md/AI/01-人工智能概要'
                            },
                            {
                                text: 'LLM应用开发',
                                link: '/md/AI/00-为什么要学习大模型'
                            },
                            {
                                text: 'LangChain',
                                link: '/md/AI/01-LangChain的Hello World项目'
                            },
                            {
                                text: 'RAG',
                                link: '/md/AI/00-“消灭”LLM幻觉的利器 - RAG介绍'
                            },
                            {
                                text: 'Agent',
                                link: '/md/AI/01-Agents是什么？'
                            },
                            {
                                text: '区块链',
                                link: '/md/chain/00-区块链专栏概述.md'
                            },
                        ]
                    },
                    {
                        text: '职业规划',
                        items: [{
                            text: '01-Java工程师必读书单',
                            link: '/md/career/01-Java工程师必读书单.md'
                        }, ]
                    },
                ],
                // 文章详情页的侧边导航栏
                sidebar: {
                    "/md/Dubbo/": [{
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
                    }],
                    "/md/zqy/面试题/": [{
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
                        },
                        {
                            title: "面试高频考点",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "gaopin/00-RocketMQ可靠性、重复消费解决方案.md",
                                "gaopin/01-RocketMQ有序性、消息积压解决方案.md",
                                "gaopin/02-Redis的IO多路复用.md",
                                "gaopin/03-ZooKeeper运行原理.md"
                            ]
                        },
                        {
                            title: "互联网大厂面经",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "mianjing/00-淘天提前批面试.md",
                                "mianjing/01-饿了么一面.md",
                                "mianjing/02-美团优选后端一面.md",
                                "mianjing/03.腾讯后端一面.md",
                                "mianjing/04.美团优选后端一面.md",
                                "mianjing/05.携程暑期实习一面.md",
                                "mianjing/06.携程暑期实习二面.md",
                            ]
                        },
                        {
                            title: "架构设计",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "jiagou/01-B站评论系统架构设计.md",
                                "jiagou/02-该从哪些方面提升系统的吞吐量？.md"
                            ]
                        }
                    ],
                    "/md/biz-arch/": [{
                            title: "业务架构",
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
                        },
                        {
                            title: "系统设计",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-优惠券系统设计 Coupon System",
                            ]
                        },
                        {
                            title: "数据中台",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-新一代数据栈将逐步替代国内单一“数据中台”",
                                "01-大数据的尽头是数据中台吗？",
                                "03-构建数据中台的三要素：方法论、组织和技术",
                                "05-如何统一管理纷繁杂乱的数据指标？",
                            ]
                        },

                        {
                            title: "用户画像",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "01-DMP系统简介",
                                "05-用户画像是什么？",
                                "06-构建高质量的用户画像",
                                "07-用户画像和特征工程",
                            ]
                        },
                    ],

                    "/md/mgr/": [{
                            title: "项目管理",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-如何学习项目管理专栏",
                                "00-咋带领团队做成事？",
                                "01-避免新手常犯的项目管理错误",
                            ]
                        },
                        {
                            title: "技术管理",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-新一代数据栈将逐步替代国内单一“数据中台”",
                            ]
                        },
                    ],
                    "/md/trade/": [{
                        title: "交易中台",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-如何防止订单二次重复支付？.md",
                        ]
                    }],

                    "/md/product-center/": [{
                        title: "商品中心",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-商品中心的spu、sku设计",
                            "01-电商商品中心解密：仅凭SKU真的足够吗？",
                            "02-大厂电商设计解析之商品管理系统",
                        ]
                    }],

                    "/md/bigdata/": [{
                            title: "大数据平台",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "大数据平台架构",
                                "对象存储",
                                "02-分布式对象存储设计原理",
                            ]
                        },
                        {
                            title: "Hadoop",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "安装下载Hadoop",
                                "01-Hadoop",
                                "HDFS",
                                "03-HDFS伪分布式环境搭建",
                                "04-hdfs dfs命令详解",
                            ]
                        },
                        {
                            title: "Hive",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "Hive专栏概述",
                                "Hive 2.x 的安装与配置",
                                "Hive执行原理",
                                "Hive分区和分桶",
                                "Hive修复分区",
                                "hive的严格模式",
                                "hiveserver2",
                            ]
                        },
                        {
                            title: "数据仓库",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "维度建模理论之事实表",
                                "维度建模理论之维度表",
                                "数仓逻辑模型",
                                "数仓业务调研",
                                "数仓分层和数仓建模",
                                "轻松驾驭Hive数仓",
                                "数仓开发之ODS层",
                                "数仓开发之DIM层",
                                "数仓开发之DWD层",
                                "数仓开发之DWS层",
                                "数仓开发之ADS层",
                                "OLAP平台架构演化历程",
                            ]
                        },

                        {
                            title: "DataX",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "阿里云开源离线同步工具DataX3.0介绍",
                                "数仓数据导出",
                            ]
                        },

                        {
                            title: "DolphinScheduler",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "DolphinScheduler简介",
                                "DolphinScheduler部署",
                                "DolphinScheduler参数",
                                "DolphinScheduler资源中心",
                                "DolphinScheduler告警通知",
                                "作业帮基于 DolphinScheduler 的数据开发平台实践",
                            ]
                        },
                    ],

                    "/md/rpc/": [{
                        title: "RPC",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "熔断限流",
                        ]
                    }],

                    "/md/ShardingSphere/": [{
                        title: "ShardingSphere",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "14-ShardingSphere的分布式主键实现",
                        ]
                    }],
                    "/md/network/": [{
                        title: "计算机网络",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "计算机网络-网络层原理",
                        ]
                    }],

                    "/md/linux/": [{
                        title: "Linux操作系统",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-操作系统专栏大纲",
                            "01-Linux命令",
                            "02-进程管理",
                            "04-还记得纸带编程吗？",
                            "超线程（Hyper-Threading），单指令多数据流（SIMD）技术"
                        ]
                    }],
                    "/md/MQTT/": [{
                        title: "MQTT",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "07-MQTT发布订阅模式介绍.md"
                        ]
                    }],
                    "/md/spider/": [{
                        title: "爬虫",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-爬虫基础.md"
                        ]
                    }],
                    "/md/java/": [{
                            title: "并发",
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
                        },
                        {
                            title: "JVM",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "JVM专栏概述",
                                "01-JVM虚拟机-上篇",
                                "02-JVM虚拟机-下篇",
                                "高并发BI系统避免频繁Y-GC",
                            ]
                        },
                        {
                            title: "JDK新特性",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "JDK21新特性",
                                "JDK22新特性",
                                "IntelliJ IDEA 2024.1 最新变化",
                            ]
                        },
                    ],
                    "/md/algorithm/logic/leetcode/": [{
                        title: "大厂算法面试",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-阿里秋招高频算法题汇总-基础篇",
                            "01-阿里秋招高频算法题汇总-中级篇",
                            "02-阿里秋招高频算法题汇总-进阶篇",
                            "03-字节秋招高频算法题汇总-基础篇",
                            "04-字节秋招高频算法题汇总-中级篇",
                            "05-字节秋招高频算法题汇总-进阶篇",
                        ]
                    }, ],

                    "/md/algorithm/logic/basic/": [{
                        title: "数据结构与算法",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-数据结构与算法专栏大纲",
                            "【图解数据结构与算法】LRU缓存淘汰算法面试时到底该怎么写",
                            "【图解数据结构】外行人也能看懂的哈希表",
                        ]
                    }],

                    "/md/spring/": [{
                        title: "Spring",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-SpringMVC的AsyncHandlerInterceptor异步的处理器拦截器",
                            "02-实现http请求的异步长轮询",
                            "03-SpringMVC拦截处理器",
                        ]
                    }],

                    "/md/tomcat/": [{
                        title: "Tomcat",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-不知道这些Servlet规范、容器，还敢说自己是Java程序员",
                            "01-Jetty架构设计之Connector、Handler组件",
                        ]
                    }],

                    "/md/spring/spring-cloud/": [{
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
                                "SpringCloudGateway之Filter多过程介绍.md",
                                "SpringCloudGateway之熔断集成篇.md",
                                "SpringCloudGateway之限流集成篇.md",
                                "SpringCloudGateway之统一鉴权篇.md",
                                "SpringCloudGateway之高性能篇.md"
                            ]
                        }
                    ],

                    "/md/spring/spring-cloud/practise": [{
                        title: "大厂实践",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-Segment为何永别微服务了？",
                        ]
                    }, ],

                    "/md/DDD/": [{
                            title: "DDD基础知识",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-DDD专栏规划",
                                "基于电商履约场景的DDD实战",
                                "11-上下文映射",
                                "13-DDD分层架构及代码目录结构",

                            ]
                        },
                        {
                            title: "DDD大厂实践",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "02-领域驱动设计DDD在B端营销系统的实践",
                                "09-DDD在大厂交易系统演进的应用",
                            ]
                        },
                    ],

                    "/md/mysql/": [{
                        title: "MySQL",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-亿级数据量商品系统的SQL调优实战.md",
                            "MySQL查询优化.md",
                            "InnoDB架构设计.md",
                            "为什么临时表可以重名？.md",
                        ]
                    }],

                    "/md/go/": [{
                        title: "Go",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-Go实战(一)-概述",
                            "01-macOS 安装go配置GOROOT GOPATH",
                            "02-Go基本语法",
                            "03-Go的数组array和切片slice语法详解",
                        ]
                    }],

                    "/md/docker/": [{
                        title: "Docker",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-Docker基础命令大全.md",
                            "01-标准化打包技术.md",
                        ]
                    }],
                    "/md/k8s/": [{
                        title: "Kubernetes",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "kubectl命令",
                        ]
                    }],

                    "/md/monitor/": [{
                        title: "监控",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-你居然还去服务器上捞日志，搭个日志收集系统难道不香么！",
                            "03-Loki 日志监控",
                        ]
                    }],

                    "/md/netty/": [{
                        title: "Netty",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "ChannelPipeline接口",
                            "(06-1)-ChannelHandler 家族",
                            "(08)-学习Netty BootStrap的核心知识，成为网络编程高手！",
                            "11-4-解码基于分隔符的协议和基于长度的协议",
                            "18-检测新连接",
                        ]
                    }],

                    "/md/kafka": [{
                        title: "Kafka",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-Kafka专栏大纲",
                            "Kafka门派知多少",
                            "08-全网最全图解Kafka适用场景",
                            "09-消息队列的消息大量积压怎么办？",
                            "15-基于kafka实现延迟队列"
                        ]
                    }],

                    "/md/RocketMQ/": [{
                        title: "RocketMQ",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-RocketMQ核心内容",
                            "RocketMQ实战(01)-基本概念",
                            "RocketMQ实战(02)-下载安装",
                            "RocketMQ实战(03)-消息的有序性",
                            "RocketMQ实战(04) - 订阅机制和定时消息",
                            "RocketMQ实战(05) - 批量消息和事务消息",
                            "02-基于电商场景的高并发RocketMQ实战",
                        ]
                    }],
                    "/md/rabbitmq": [{
                        title: "RabbitMQ",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-RabbitMQ实战下载与安装.md",
                        ]
                    }],
                    "/md/redis/": [{
                        title: "Redis",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-数据结构的最佳实践",
                            "01-Redis和ZK分布式锁优缺点对比以及生产环境使用建议",
                            "02-Redisson可重入锁加锁源码分析",
                            "03-Redisson公平锁加锁源码分析",
                            "04-Redisson读写锁加锁机制分析",
                            "05-缓存读写策略模式详解",
                            "06-如何快速定位 Redis 热 key"
                        ]
                    }],
                    "/md/es/": [{
                        title: "ElasticSearch",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "ES专栏大纲",
                            "ES基本概念",
                            "02-MacOS下载安装启动ES和Kibana",
                            "03-核心概念之NRT Document Index 分片 副本",
                            "04-Kibana常见RESTful API操作",
                        ]
                    }],
                    "/md/ck/": [{
                        title: "ClickHouse",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "clickhouse概述",
                            "单机安装部署",
                            "客户端基本操作",
                            "为啥要学习ClickHouse",
                            "为啥适合OLAP？",
                        ]
                    }],
                    "/md/distdb/": [{
                        title: "分布式数据库",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "18-分布式数据库的HTAP能统一OLTP和 OLAP吗？",
                            "21-查询执行引擎：加速聚合计算加速",
                            
                        ]
                    }],
                    "/md/12306/": [{
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
                                "死磕设计模式之抽象策略模式.md",
                                // "Builder模式在项目设计中的应用.md",
                                "单例+简单工厂模式在项目设计中的应用.md",
                                "选择合适的缓存过期策略",
                                "Redis缓存雪崩、缓存穿透、缓存击穿解决方案详解",
                                "redisson分布式锁使用",
                                "12306架构设计难点.md"
                            ]
                        }
                    ],
                    "/md/career/": [{
                        title: "职业规划",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-Java工程师必读书单",
                            "02-为什么中国的程序员有35岁危机",
                            "03-新人程序员入行忠告",
                            "04-外企也半夜发布上线吗？",
                            "05-中外程序员到底有啥区别？",
                            "06-全球顶级架构师推荐的书单",
                            "07-经常被压缩开发时间，延期还要背锅，如何破局？",
                            "08-程序员为何一直被唱衰？",
                            "09-程序员的“三步走”发展战略",
                            "10-为何我建议你学会抄代码",
                            "11-计师能去哪些央国企？",
                        ]
                    }],
                    "/md/vue/": [{
                        title: "Vue",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-Vue开发实战.md",
                        ]
                    }],
                    "/md/chain/": [{
                        title: "区块链",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-区块链专栏概述",
                            "01-联盟链入门",
                            "03-联盟链入门讲解+Xuperchain介绍 XuperChain 核心模块",
                            "04-XuperChain核心流程",
                            "05-账本模型",
                            "06-智能合约",
                            "07-网络与共识",
                        ]
                    }],

                    "/md/python/": [{
                        title: "Python基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-macOS和Linux安装和管理多个Python版本",
                        ]
                    }, ],

                    "/md/AI/": [
                        {
                            title: "GPT发展",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "Claude3到底多强",
                                "GPTs推荐",
                                "ChatGPT为啥不用Websocket而是EventSource？",
                            ]
                        },
                        {
                            title: "机器学习",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "01-人工智能概要",
                                "MapReduce分治思想",
                                "05-开发环境安装",
                            ]
                        },
                        {
                            title: "LLM应用开发",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-为什么要学习大模型",
                                "01-大语言模型发展",
                                "02-国内外LLM的多模型，强应用",
                                "03-为啥LLM还没能完全替代你？",
                                "04-产业拆解",
                                "05-应用级开发者 AI 时代破局点",
                                "06-智能体项目案例",
                            ]
                        },
                        {
                            title: "LangChain",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-初识LangChain",
                                "01-LangChain的Hello World项目",
                                "02-LangChain实战：用prompts模板调教LLM的输入出",
                                "03-示例选择器",
                                "04-LLMs和Chat Models",
                                "05-Loader机制",
                                "06-文档转换实战",
                            ]
                        },
                        {
                            title: "RAG",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-“消灭”LLM幻觉的利器 - RAG介绍",
                                "01-RAG应用框架和解析器",
                                "02-相似性检索的关键 - Embedding",
                                "03-RAG的核心 -结果召回和重排序",
                            ]
                        },
                        {
                            title: "Agent",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "01-Agents是什么？",
                            ]
                        },
                    ],
                    "/md/design/": [{
                            title: "重构",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-软件架构权衡-我们为什么以及如何进行权衡？",
                                "01-软件架构权衡-无意识决策的问题",
                                "02-软件架构权衡-架构特性",
                                "代码的坏味道",
                                "分离关注点的意义",
                                "架构之美：教你如何分析一个接口？",
                                "业务代码如何才能不再写出大串的if else？",
                                "阿里P8架构师都是怎么分析软件模型的？",
                            ]
                        },
                        {
                            title: "设计模式",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "模板方法设计模式（Template Pattern）",
                                "策略模式Strategy Pattern",
                                "建造者模式",
                                "代理模式Proxy Pattern",
                            ]
                        },
                    ],

                    "/md/spark/": [{
                            title: "Spark",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "Spark架构",
                            ]
                        },
                        {
                            title: "Spark SQL",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "为啥要学习Spark？",
                                "00-Spark安装及启动",
                                "01-Spark的Local模式与应用开发入门",
                                "03-SparkSQL入门",
                                "04-SparkSQL的API编程之DataFrame",
                                "05-快速理解SparkSQL的DataSet",
                                "06-RDD与DataFrame的互操作",
                                "07-Spark的Data Sources",
                                "08-Spark SQL整合Hive",
                            ]
                        },
                        {
                            title: "Spark Streaming",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "00-为啥要学习Spark Streaming",
                                "01-Spark Streaming专栏概述",
                                "02-Spark Streaming小试流式处理",
                            ]
                        },
                        {
                            title: "Spark MLlib",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "06-基础统计模块",
                                "07-回归算法",
                            ]
                        },
                    ],

                    "/md/security/": [{
                            title: "常见攻击手段",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [

                            ]
                        },
                        {
                            title: "OAuth 2.0实战",
                            collapsable: false,
                            sidebarDepth: 0,
                            children: [
                                "01-OAuth 2.0实战-为什么要先获取授权码code.md",
                            ]
                        },
                    ],
                }
            }
        }
    }
};