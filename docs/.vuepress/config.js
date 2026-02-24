module.exports = {
    port: "8080",
    dest: "./dist",
    base: "/",
    // 预加载js
    shouldPrefetch: (file, type) => {
        return false;
    },
    markdown: {
        lineNumbers: true,
        externalLinks: {
            target: '_blank',
            rel: 'noopener noreferrer'
        },
        mermaid: true,
    },
    locales: {
        "/": {
            lang: "zh-CN",
            title: "编程严选网",
            description: "Java、前端、大数据、云原生、区块链、AI大模型应用开发求职必备技能：计算机基础，设计模式、DDD及各大中台和业务系统设计真实案例...软件开发的一站式终身学习网站！"
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
        // 添加 google 分析代码（国内无法访问）
        // [
        //     'script',
        //     {
        //         charset: 'utf-8',
        //         src: 'https://www.googletagmanager.com/gtag/js?id=G-3ZNNG02JRB'
        //     },
        // ],

        // [
        //     'script',{},
        //     `
        //     window.dataLayer = window.dataLayer || [];
        //     function gtag(){dataLayer.push(arguments);}
        //     gtag('js', new Date());

        //     gtag('config', 'G-3ZNNG02JRB');
        //     `
        // ],
        // 百度统计代码（不生效，暂时弃用）  
        // [
        //     'script',{},
        //     `
        //     var _hmt = _hmt || [];
        //     (function() {
        //     var hm = document.createElement("script");
        //     hm.src = "https://hm.baidu.com/hm.js?d6bf16d55ae32b3e91abf80026997d55";
        //     var s = document.getElementsByTagName("script")[0]; 
        //     s.parentNode.insertBefore(hm, s);
        //     })();
        //     `
        // ],
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
        'vuepress-plugin-mermaidjs',
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
                logo: `/favicon.ico`,
                nav: [{
                    text: '导读',
                    link: '/md/other/guide-to-reading.md'
                },
                {
                    text: '架构',
                    items: [{
                        text: '设计原则',
                        items: [{
                            text: '设计原则概述',
                            link: '/md/design/01-单一职责原则.md'
                        },]
                    },
                    {
                        text: '设计模式',
                        items: [{
                            text: '模板方法设计模式（Template Pattern）',
                            link: '/md/design/template-pattern'
                        },]
                    },
                    {
                        text: '重构',
                        items: [{
                            text: '00-软件架构权衡-我们为什么以及如何进行权衡？',
                            link: '/md/design/00-软件架构权衡-我们为什么以及如何进行权衡？.md'
                        },]
                    },
                    {
                        text: '大厂业务架构',
                        items: [{
                            text: '00-聚合支付架构',
                            link: '/md/biz-arch/00-聚合支付架构从零到一'
                        },]
                    },
                    {
                        text: '系统设计',
                        items: [{
                            text: '00-优惠券系统设计',
                            link: '/md/biz-arch/00-优惠券系统设计 Coupon System'
                        },]
                    },

                    {
                        text: 'DDD',
                        items: [{
                            text: '00-DDD专栏规划',
                            link: '/md/DDD/00-DDD专栏规划.md'
                        },

                        {
                            text: '事件驱动',
                            link: '/md/DDD/integrating-event-driven-microservices-with-request-response-APIs.md'
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
                            link: '/md/bigdata/00-新一代数据栈将逐步替代国内单一“数据中台”.md'
                        },]
                    },

                    {
                        text: '交易中台',
                        items: [{
                            text: '00-如何防止订单二次重复支付？',
                            link: '/md/trade/00-如何防止订单二次重复支付？.md'
                        },]
                    },

                    {
                        text: '商品中心',
                        items: [{
                            text: '00-商品中心的spu、sku设计.md',
                            link: '/md/product-center/00-商品中心的spu、sku设计.md'
                        },]
                    },

                    {
                        text: '用户画像',
                        items: [{
                            text: '01-DMP系统简介.md',
                            link: '/md/biz-arch/01-DMP系统简介.md'
                        },]
                    },

                    {
                        text: '低代码',
                        items: [{
                            text: '为什么“低代码”是未来趋势？.md',
                            link: '/md/low-code/为什么“低代码”是未来趋势？.md'
                        },]
                    },


                    ]
                },
                {
                    text: '项目',
                    items: [{
                        text: '12306',
                        items: [{
                            text: '项目介绍',
                            link: '/md/12306/12306-basic-info.md'
                        }]
                    },
                    {
                        text: 'DDD商城',
                        items: [{
                            text: '什么是DDD商城',
                            link: '/md/ddd-mall/什么是DDD商城.md'
                        }]
                    },

                    {
                        text: '风控系统引擎',
                        items: [{
                            text: '风控引擎架构设计',
                            link: '/md/risk-control/risk-control-engine-architecture-design.md'
                        }]
                    },

                    {
                        text: 'Go微服务网关专栏概述',
                        items: [{
                            text: 'Go微服务网关专栏概述',
                            link: '/md/go-gateway/00-Go微服务网关专栏概述.md'
                        }]
                    },
                    ]
                },

                {
                    text: '框架',
                    items: [{
                        text: 'RPC',
                        items: [{
                            text: '熔断限流',
                            link: '/md/rpc/熔断限流.md'
                        },]
                    },

                    {
                        text: 'Netty',
                        items: [{
                            text: 'Netty基础',
                            link: '/md/netty/netty-basic-components.md'
                        },

                        {
                            text: 'Netty实战',
                            link: '/md/netty/netty-off-heap-memory-leak-detection.md'
                        },
                        ]
                    },

                    {
                        text: 'ShardingSphere',
                        items: [{
                            text: 'ShardingSphere',
                            link: '/md/ShardingSphere/14-ShardingSphere的分布式主键实现.md'
                        }]
                    },

                    {
                        text: 'kafka',
                        items: [{
                            text: 'kafka',
                            link: '/md/kafka/00-Kafka专栏大纲.md'
                        }]
                    },

                    {
                        text: 'RocketMQ',
                        items: [{
                            text: '消息队列基础',
                            link: '/md/RocketMQ/消息队列面试必问解析.md'
                        },]
                    },

                    {
                        text: 'RabbitMQ',
                        items: [{
                            text: 'RabbitMQ',
                            link: '/md/rabbitmq/00-RabbitMQ实战下载与安装.md'
                        },]
                    },

                    {
                        text: '工作流引擎',
                        items: [{
                            text: '00-Activiti7',
                            link: '/md/activiti/activiti7-introduction.md'
                        },]
                    },

                    {
                        text: 'MQTT',
                        items: [{
                            text: '00-MQTT',
                            link: '/md/MQTT/07-MQTT发布订阅模式介绍.md'
                        },]
                    },

                    {
                        text: 'OAuth2.0',
                        items: [{
                            text: 'OAuth2.0专栏概述',
                            link: '/md/security/OAuth 2.0实战-为什么要先获取授权码code.md'
                        },]
                    },
                    
                    {
                        text: 'Arthas',
                        items: [{
                            text: 'Arthas使用',
                            link: '/md/arthas/Arthas使用.md'
                        },]
                    },

                                        {
                        text: 'MyBatis',
                        items: [{
                            text: 'MyBatis',
                            link: '/md/mybatis/mybatis-automatic-mapper-implementation-principle.md'
                        },]
                    },

                    ]
                },

                {
                    text: '后端',
                    items: [{
                        text: '并发',
                        items: [{
                            text: '并发编程专栏概述',
                            link: '/md/java/并发编程专栏概述.md'
                        },]
                    },

                    
                    
                    {
                        text: '响应式编程',
                        items: [{
                            text: '响应式编程专栏概述',
                            link: '/md/reactive/00-Spring响应式编程.md'
                        },]
                    },

                    {
                        text: 'JVM',
                        items: [{
                            text: 'JVM基础',
                            link: '/md/jvm/JVM专栏概述.md'
                        },]
                    },

                    {
                        text: 'JDK新特性',
                        items: [{
                            text: 'Oracle Java SE（标准版）支持路线图',
                            link: '/md/java/java-se-support-roadmap.md'
                        },]
                    },

                    {
                        text: 'IDEA新功能',
                        items: [{
                            text: 'IntelliJ IDEA 2024.1 最新变化',
                            link: '/md/java/IntelliJ IDEA 2024.1 最新变化'
                        },]
                    },

                    {
                        text: 'Tomcat',
                        items: [{
                            text: 'Tomcat网络编程',
                            link: '/md/tomcat/00-不知道这些Servlet规范、容器，还敢说自己是Java程序员.md'
                        },]
                    },

                    {
                        text: 'Spring',
                        items: [{
                            text: 'SpringMVC拦截处理器',
                            link: '/md/spring/03-SpringMVC拦截处理器.md'
                        },]
                    },

                    {
                        text: 'SpringBoot',
                        items: [{
                            text: '00-可能是全网最全的SpringBoot启动流程源码分析',
                            link: '/md/spring/00-可能是全网最全的SpringBoot启动流程源码分析.md'
                        },]
                    },

                    {
                        text: 'Dubbo',
                        items: [{
                            text: '01-互联网架构的发展历程',
                            link: '/md/Dubbo/01-互联网架构的发展历程.md'
                        },]
                    },

                    {
                        text: 'SpringCloud',
                        items: [{
                            text: 'SpringCloudAlibaba',
                            link: '/md/spring/spring-cloud/SpringCloudAlibaba介绍.md'
                        },
                        {
                            text: 'SpringCloudGateway工作原理与链路图',
                            link: '/md/spring/spring-cloud/SpringCloudGateway工作原理与链路图.md'
                        },

                        {
                            text: 'Seata',
                            link: '/md/seata/01-Seata客户端依赖坐标引入与踩坑排雷.md'
                        },

                        {
                            text: 'Sentinel',
                            link: '/md/sentinel/spring-boot-integration-with-sentinel-practical-tutorial-from-dependency-to-custom-flow-control-and-monitoring.md'
                        },
                        ]
                    },

                    {
                        text: '大厂实践',
                        items: [{
                            text: '01-Segment为何永别微服务了？',
                            link: '/md/spring/spring-cloud/practise/01-Segment为何永别微服务了？.md'
                        },]
                    },
                    ]
                },

                {
                    text: '数据库',
                    items: [{
                        text: 'MySQL',
                        items: [{
                            text: '00-MySQL专栏大纲',
                            link: '/md/mysql/00-MySQL专栏大纲.md'
                        }]
                    },

                    {
                        text: 'Redis',
                        items: [{
                            text: '基础',
                            link: '/md/redis/00-数据结构的最佳实践.md'
                        },]
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
                        text: 'HBase',
                        items: [{
                            text: 'HBase概述',
                            link: '/md/hbase/hbase-scan.md'
                        }]
                    },

                    {
                        text: 'Neo4j',
                        items: [{
                            text: 'Neo4j：图数据库的革命性力量',
                            link: '/md/neo4j/neo4j-revolutionary-power-of-graph-databases.md'
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
                    text: '大数据',
                    items: [{
                        text: '大数据平台',
                        items: [{
                            text: '00-互联网大厂的大数据平台架构',
                            link: '/md/bigdata/大数据平台架构.md'
                        },]
                    },

                    {
                        text: '数据中台',
                        items: [{
                            text: '01-大数据的尽头是数据中台吗？',
                            link: '/md/bigdata/01-大数据的尽头是数据中台吗？.md'
                        }]
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
                        },]
                    },

                    {
                        text: '数据仓库',
                        items: [{
                            text: 'Spark+ClickHouse实战企业级数据仓库专栏',
                            link: '/md/bigdata/Spark+ClickHouse实战企业级数据仓库专栏.md'
                        },]
                    },

                    {
                        text: 'DataX',
                        items: [{
                            text: 'DataX专栏',
                            link: '/md/bigdata/阿里云开源离线同步工具DataX3.0介绍.md'
                        },]
                    },

                    {
                        text: 'DolphinScheduler',
                        items: [{
                            text: 'DolphinScheduler专栏',
                            link: '/md/bigdata/作业帮基于 DolphinScheduler 的数据开发平台实践.md'
                        },]
                    },

                    {
                        text: 'Spark',
                        items: [{
                            text: '为啥要学习Spark？',
                            link: '/md/spark/为啥要学习Spark？.md'
                        },]
                    },

                    {
                        text: 'Flink',
                        items: [{
                            text: 'Flink实战-概述',
                            link: '/md/flink/01-Flink实战-概述.md'
                        },]
                    },
                    ]
                },

                {
                    text: '云原生',
                    items: [{
                        text: 'Go',
                        items: [{
                            text: '00-Go概述',
                            link: '/md/go/00-Go概述.md'
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
                            text: 'Kubernetes的基本架构',
                            link: '/md/k8s/00-Kubernetes的基本架构.md'
                        }]
                    },

                    {
                        text: 'ServerLess',
                        items: [{
                            text: 'serverless-is-a-scam',
                            link: '/md/serverless/serverless-is-a-scam.md'
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
                    text: '音视频',
                    items: [{
                        text: '基础',
                        items: [{
                            text: '音视频小白秒变大神？看完这条学习路线就够了！',
                            link: '/md/ffmpeg/audio-video-roadmap.md'
                        }]
                    },]
                },

                {
                    text: '数分',
                    items: [{
                        text: '数分基础',
                        items: [{
                            text: '为啥要学习数据分析？',
                            link: '/md/data-analysis/basic/为啥要学习数据分析？.md'
                        }]
                    },]
                },

                {
                    text: '计科',
                    items: [{
                        text: '计算机网络',
                        items: [{
                            text: '00-计算机网络-网络层原理',
                            link: '/md/network/计算机网络-网络层原理.md'
                        },]
                    },

                    {
                        text: 'Linux操作系统',
                        items: [{
                            text: '00-操作系统专栏大纲',
                            link: '/md/linux/00-操作系统专栏大纲.md'
                        },]
                    },

                    {
                        text: '数据结构与算法',
                        items: [{
                            text: '数据结构与算法专栏大纲',
                            link: '/md/algorithm/basic/00-数据结构与算法专栏大纲.md'
                        },]
                    },

                    {
                        text: '算法的工程应用',
                        items: [{
                            text: '哈希算法原来有这么多应用场景！',
                            link: '/md/algorithm/practise/哈希算法原来有这么多应用场景！.md'
                        },]
                    },

                    {
                        text: '大厂算法面试',
                        items: [{
                            text: '00-阿里秋招高频算法题汇总-基础篇',
                            link: '/md/algorithm/leetcode/00-阿里秋招高频算法题汇总-基础篇.md'
                        },]
                    },

                    {
                        text: '常见攻击手段',
                        items: [{
                            text: '常见攻击手段概述',
                            link: '/md/security/OAuth 2.0实战-为什么要先获取授权码code.md'
                        },]
                    },
                    ]
                },
                {
                    text: '面试',
                    link: '/md/zqy/面试题/01-分布式技术面试实战.md'
                },

                {
                    text: 'AI',
                    items: [{
                        text: 'Python基础',
                        link: '/md/python/00-macOS和Linux安装和管理多个Python版本'
                    },
                    {
                        text: 'AI算法',
                        link: '/md/AI/ml/01-人工智能概要'
                    },
                    {
                        text: 'AIGC应用开发',
                        link: '/md/AI/AI大模型企业应用实战'
                    },
                    {
                        text: 'LangChain4j',
                        link: '/md/AI/langchain4j/01-intro'
                    },
                    {
                        text: '大模型发展',
                        link: '/md/AI/llm/GPTs'
                    },
                    {
                        text: 'Prompt工程',
                        link: '/md/AI/prompt/prompt-website'
                    },
                    {
                        text: 'AI Agent',
                        link: '/md/AI/agent/changelog-cursor'
                    },
                    {
                        text: 'MCP',
                        link: '/md/AI/mcp/mcp-fad-or-fixture'
                    },
                    {
                        text: 'A2A',
                        link: '/md/AI/a2a/a2a-a-new-era-of-agent-interoperability'
                    },
                    
                    {
                        text: 'Skills',
                        link: '/md/AI/skills/ovrview'
                    },
                    ]
                },

                {
                    text: 'Vue',
                    items: [{
                        text: '01-Vue开发实战',
                        link: '/md/vue/01-Vue开发实战.md'
                    },]
                },

                {
                    text: '区块链',
                    items: [{
                        text: '区块链核心概念',
                        link: '/md/chain/00-区块链专栏概述.md'
                    },
                    {
                        text: '百度联盟链XuperChain',
                        link: '/md/chain/03-百度联盟链Xuperchain核心概念.md'
                    },
                    {
                        text: 'Flow平台实战',
                        link: '/md/chain/02-认识Flow Cadence.md'
                    },
                    {
                        text: '以太坊区块链',
                        link: '/md/chain/01-以太坊智能合约与高级语言.md'
                    },

                    {
                        text: '隐私计算',
                        link: '/md/chain/隐私计算技术原理.md'
                    },

                    ]
                },

                {
                    text: '职业',
                    items: [{
                        text: '职业规划',
                        link: '/md/career/为什么中国的程序员有35岁危机'
                    },
                    {
                        text: '晋升',
                        link: '/md/career/p6-promotion-guide'
                    },

                    {
                        text: '职场',
                        link: '/md/career/经常被压缩开发时间，延期还要背锅，如何破局？'
                    },

                    {
                        text: '书单',
                        link: '/md/career/Java-reading-list'
                    },

                    {
                        text: '00-如何学习项目管理专栏',
                        link: '/md/mgr/00-如何学习项目管理专栏.md'
                    },

                    ]
                },

                {
                    text: '副业',
                    items: [{
                        text: '副业',
                        link: '/md/sideline/16-精益独立开发实践.md'
                    },]
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
                        title: "大厂业务架构",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-聚合支付架构从零到一",
                            "01-供应链域数据中台设计",
                            "02-供应链采购视角的业务系统架构",
                            "03-客服平台架构实践",
                            "04-数据质量中心系统设计",
                            "05-大厂CRM系统架构优化实战",
                            "06-运营后台系统设计",
                            "07-大厂报价查询系统性能优化之道",
                            "08-视频推荐索引构建",
                            "小游戏的大促实践",
                            "事件中心架构概述",
                            "高性能排名系统的核心架构原理，架构师必看！",
                        ]
                    },
                    {
                        title: "系统设计",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-优惠券系统设计 Coupon System",
                            "设计消息通知系统（Notification System）",
                            "System design: Uber",
                            "短链系统设计（design tiny url）",
                            "打造一个高并发的十万用户 IM 聊天系统，你需要了解这些架构设计技巧！",
                            "netflixs-distributed-counter-abstraction",
                            "data-gateway-a-platform-for-growing-and-protecting-the-data-tier",
                            "enhancing-netflix-reliability-with-service-level-prioritized-load-shedding",
                            "title-launch-observability-at-netflix-scale",
                            "cloud-efficiency-at-netflix",
                            "linkedin-architecture-which-enables-searching-a-message-within-150ms",
                            "how-meta-improved-their-cache-consistency-to-99-99999999",
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

                    {
                        title: "低代码",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "为什么“低代码”是未来趋势？",
                            "01-低代码平台到底是什么样的？",
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
                            "00-如何防止订单二次重复支付？",
                            "01-扫码支付后都发生了啥？",
                            "02-大厂的第三方支付业务架构设计",
                            "wechat-pay-development-guide-avoid-pitfalls",
                            "high-avail-payments",
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
                            "中小企业参考的商业大数据平台",
                            "对象存储",
                            "02-分布式对象存储设计原理",
                            "AB测试与灰度发布",
                            "当大数据遇上物联网",
                            "移动计算",
                            "大数据基准测试",
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
                            "04-RPC框架在网络通信的网络IO模型选型",
                            "熔断限流",
                            "11-RPC的负载均衡",
                            "rpc-retry-mechanism",
                            "RPC-Traffic-Replay",
                        ]
                    }],

                    "/md/ShardingSphere/": [{
                        title: "ShardingSphere",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "shardingsphere-jdbc-spring-boot-orm-integration-guide",
                            "10-顶级企业如何用数据脱敏保护用户隐私！",
                            "11-动态配置管理背后的编排治理真相！",
                            "14-ShardingSphere的分布式主键实现",
                            "19-路由引擎：如何在路由过程中集成多种路由策略和路由算法？",
                            "ShardingSphere 如何完美驾驭分布式事务与 XA 协议？",
                            "ShardingSphere 如何轻松驾驭 Seata 柔性分布式事务？",
                        ]
                    }],

                    "/md/network/": [{
                        title: "计算机网络",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "TCP协议详解",
                            "TCP连接的建立和断开受哪些系统配置影响？",
                            "天天说架构，那CDN到底是什么？",
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
                            "mqtt-kafka-iot-message-streaming-integration",
                            "mqtt-publish-subscribe-intro",
                            "avoid-bare-parsefrom-mqtt-protobuf-consumption",
                        ]
                    }],

                    "/md/activiti/": [{
                        title: "Activiti7",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "activiti7-introduction",
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

                    "/md/ffmpeg/": [{
                        title: "音视频基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "audio-video-roadmap",
                            "video-basic",
                        ]
                    }],

                    "/md/data-analysis/basic/": [{
                        title: "数分基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "为啥要学习数据分析？",
                            "correct-data-analysis-learning-methods",
                            "learning-path-data-mining",
                            "企业如何利用数据打造精准用户画像？",
                            "如何自动化采集数据",
                            "how-to-use-octoparse-for-data-scraping",
                        ]
                    }],

                    "/md/java/": [{
                        title: "并发",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-Java并发编程.md",
                            "synchronized",
                            "volatile",
                            "reentrantlock",
                            "04-线程池以及生产环境使用.md",
                            "05-京东并行框架asyncTool如何针对高并发场景进行优化？.md",
                            "forkjoinpool",
                            "java21-virtual-threads-where-did-my-lock-go",
                        ]
                    },
                    {
                        title: "JDK新特性",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "java-se-support-roadmap",
                            "Java9-new-features",
                            "jdk14-new-features-complete-guide",
                            "Java16-new-features",
                            "understanding-java17-new-features-sealed-classes",
                            "Java21-new-features",
                            "Java22-new-features",
                            "Java23-new-features",
                            "java24-new-features",
                            "java25-new-features",
                            "java2024",
                            "java-news-roundup-jun02-2025",
                        ]
                    },

                    {
                        title: "IDEA新功能",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "IntelliJ IDEA 2024.1 最新变化",
                            "What’s-New-in-IntelliJ-IDEA-2024.2",
                            "What’s-New-in-IntelliJ-IDEA-2024.3",
                            "jetbrains-terminal-a-new-architecture",
                            "What’s-New-in-IntelliJ-IDEA-2025.3",
                        ]
                    },
                    ],

                    "/md/jvm/": [{
                        title: "JVM基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "JVM专栏概述",
                            "01-JVM虚拟机-上篇",
                            "02-JVM虚拟机-下篇",
                            "deep-dive-into-jvm-runtime-data-areas-from-pc-to-metaspace",
                            "00-JDK为何自己首先破坏双亲委派模型",
                            "00-G1垃圾收集器的日志格式",
                            "Metadata GC Threshold in Java",
                            "对象内存分配及Minor GC和Full GC全过程",
                            "Java 性能调优：优化 GC 线程设置",
                            "JDK性能调优神器",
                        ]
                    },

                    {
                        title: "JVM调优",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "高并发BI系统避免频繁Y-GC",
                            "线上频繁Full GC，原来是外包同学不合理设置JVM参数！",
                            "Java NIO为何导致堆外内存OOM了？",
                            "一次由热部署导致的OOM排查经历",
                            "队列积压了百万条消息，线上直接OOM了！",
                        ]
                    },
                    ],

                    "/md/algorithm/leetcode/": [{
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
                    },],

                    "/md/algorithm/basic/": [{
                        title: "数据结构与算法",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-数据结构与算法专栏大纲",
                            "【图解数据结构与算法】LRU缓存淘汰算法面试时到底该怎么写",
                            "【图解数据结构】外行人也能看懂的哈希表",
                            "dag-directed-acyclic-graph",
                            "dynamic-programming-how-to-quickly-spot-when-to-use-dp",
                        ]
                    }],

                    "/md/algorithm/practise/": [{
                        title: "工程应用",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "哈希算法原来有这么多应用场景！",
                        ]
                    }],

                    "/md/spring/": [{
                        title: "Spring",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "Spring之BeanNameAware和BeanFactoryAware接口",
                            "这次彻底搞懂IoC容器依赖注入的源码",
                            "farewell-bean-not-found-easily-solve-spring-boot-package-scanning-issues",
                            "why-spring-bean-difficult-birth-overcome-constructor-injection-dependencies-and-ambiguity",
                            "别小看Spring过滤器,这些知识点你必须得掌握",
                            "Spring框架使用了哪些设计模式",
                            "阿里四面：你知道Spring AOP创建Proxy的过程吗？",
                        ]
                    },

                    {
                        title: "SpringMVC",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "SpringMVC-AsyncHandlerInterceptor",
                            "02-实现http请求的异步长轮询",
                            "SpringMVC-HandlerInterceptor",
                            "SpringMVC-service-doDispatch",
                            "SpringMVC-DispatcherServlet-doDispatch",
                        ]
                    },

                    {
                        title: "SpringBoot",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-可能是全网最全的SpringBoot启动流程源码分析",
                            "01-HelloSpringBoot应用程序",
                            "SpringBoot默认线程池",
                        ]
                    },

                    {
                        title: "SpringBoot新特性",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "SpringBoot3.4-release",
                        ]
                    },
                    ],


                    "/md/tomcat/": [{
                        title: "Tomcat",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-不知道这些Servlet规范、容器，还敢说自己是Java程序员",
                            "01-Jetty架构设计之Connector、Handler组件",
                            "03-Tomcat的生命周期管理",
                            "04-Tomcat实现热部署、热加载原理解析",
                            "05-Tomcat如何打破双亲委派机制实现隔离Web应用的？",
                            "how-to-solve-high-cpu-usage-in-tomcat-process",
                        ]
                    }],


                    "/md/seata/": [{
                        title: "Seata",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-Seata客户端依赖坐标引入与踩坑排雷",
                            "02-Seata客户端全局事务配置与实现",
                            "03-Seata柔性事务",
                            "04-Seata是什么?",
                            "05-开始",
                            "docker-install-configure-seata-server",
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
                    },],

                    "/md/DDD/": [{
                        title: "DDD基础知识",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-DDD专栏规划",
                            "基于电商履约场景的DDD实战",
                            "11-上下文映射",
                            "13-DDD分层架构及代码目录结构",
                            "domain-service",
                            "23-理解领域事件（Domain Event）",
                        ]
                    },

                    {
                        title: "事件驱动",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "integrating-event-driven-microservices-with-request-response-APIs",
                            "decouple-event-retrieval-from-processing",
                            "use-circuit-breaker-to-pause-event-retrieval",
                            "rate-limit-event-processing",
                            "event-versioning",
                        ]
                    },
                    {
                        title: "DDD大厂实践",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "02-领域驱动设计DDD在B端营销系统的实践",
                            "04-DDD设计流程，以业务案例解读",
                            "09-DDD在大厂交易系统演进的应用",
                        ]
                    },
                    ],

                    "/md/mysql/": [{
                        title: "MySQL基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-MySQL专栏大纲",
                            "how-to-use-indexes-when-grouping-in-sql",
                            "mysql-architecture-design",
                            "InnoDB架构设计",
                            "mysql-read-write-splitting",
                            "为什么临时表可以重名？",
                            "为什么阿里不推荐使用MySQL分区表？",
                            "一文看懂这篇MySQL的锁机制",
                            "mysql-transaction-isolation-mechanism",
                            "mysql-index-left-most-matching-rule",
                        ]
                    },

                    {
                        title: "MySQL实战",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "Java生态中性能最强数据库连接池HikariCP",
                            "Java业务系统是怎么和MySQL交互的？",
                            "亿级数据量商品系统的SQL调优实战",
                            "MySQL查询优化",
                            "MySQL深分页调优实战",
                            "online-sql-deadlock-incident-how-to-prevent-deadlocks",
                            "optimize-slow-queries-massive-row-deletions",
                        ]
                    },

                    {
                        title: "MySQL新特性",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "MySQL新特性",
                            "what-is-new-in-mysql9",
                        ]
                    },
                    ],

                    "/md/reactive/": [{
                        title: "响应式编程",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-Spring响应式编程",
                            "applicable-scenarios-for-reactive-programming",
                            "01-想让系统更具有弹性？了解背压机制和响应式流的秘密！",
                            "spring-5-reactive-programming-high-performance-full-stack-apps",
                            "04-Spring为何偏爱Reactor响应式编程框架",
                            "05-流式操作：如何使用 Flux 和 Mono 高效构建响应式数据流？",
                        ]
                    }],

                    "/md/sentinel/": [{
                        title: "Sentinel基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "spring-boot-integration-with-sentinel-practical-tutorial-from-dependency-to-custom-flow-control-and-monitoring",
                            "basic-api-resource-rule",
                            "origin-authority-control",
                        ]
                    }],

                    "/md/go/": [{
                        title: "Go",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-Go概述",
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
                            "Docker环境搭建",
                            "00-Docker基础命令大全",
                            "01-标准化打包技术",
                            "通俗易懂的图文解密Docker容器网络",
                        ]
                    }],
                    "/md/k8s/": [{
                        title: "Kubernetes安装和使用",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-一键部署神器kubeadm",
                            "快速搭建Kubernetes集群",
                            "kubectl命令",
                            "Kubernetes容器日志处理方案",
                        ]
                    },

                    {
                        title: "Kubernetes核心组件",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-Kubernetes的基本架构",
                            "nature-of-kubernetes",
                            "02-Kubernetes核心组件之kube-proxy实现原理",
                            "pod-in-kubernetes",
                            "kubernetes-workloads-controllers-deployment",
                            "23-0-声明式API",
                            "23-1-Envoy",
                        ]
                    },

                    {
                        title: "Kubernetes部署应用",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "使用 Kubernetes 部署 Nginx 应用",
                        ]
                    },

                    {
                        title: "Kubernetes云平台KubeSphere",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-为啥选择 kubesphere",
                        ]
                    },
                    ],

                    "/md/monitor/": [{
                        title: "监控",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-你居然还去服务器上捞日志，搭个日志收集系统难道不香么！",
                            "03-Loki 日志监控",
                        ]
                    },

                    {
                        title: "性能分析",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "并发用户、RPS、TPS的解读",
                            "01-性能分析思路",
                            "performance-optimization-guide",
                        ]
                    },
                    ],

                    "/md/netty/": [{
                        title: "Netty基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-Netty源码面试实战+原理(一)-鸿蒙篇",
                            "netty-basic-components",
                            "ChannelPipeline接口",
                            "(06-1)-ChannelHandler 家族",
                            "(08)-学习Netty BootStrap的核心知识，成为网络编程高手！",
                            "11-4-解码基于分隔符的协议和基于长度的协议",
                            "18-检测新连接",
                        ]
                    },

                    {
                        title: "Netty实战",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "netty-off-heap-memory-leak-detection",
                            "java-lock-optimization-practice-netty-examples_boost-concurrency-performance",
                            "use-netty-to-handle-large-data-efficiently",
                        ]
                    },
                    ],

                    "/md/kafka/": [{
                        title: "kafka",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-Kafka专栏大纲",
                            "01-为何大厂都选择Kafka作为消息队列",
                            "kafka-core-components",
                            "Kafka门派知多少",
                            "08-全网最全图解Kafka适用场景",
                            "09-消息队列的消息大量积压怎么办？",
                            "kafka-operations-tool-exploring-adminclient-principles-and-practices",
                            "15-基于kafka实现延迟队列",
                            "kafka-transaction-implementation",
                            "kafka-versions",
                        ]
                    },],

                    "/md/serverless/": [{
                        title: "serverLess",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "serverless-is-a-scam",
                        ]
                    },],

                    "/md/RocketMQ/": [{
                        title: "消息队列基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "message-queues-more-than-app-communication",
                            "消息队列面试必问解析",
                            "消息队列的事务消息",
                            "避免无法克服的队列积压",
                            "消息恰好被消费一次",
                        ]
                    },

                    {
                        title: "RocketMQ基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-RocketMQ核心内容",
                            "RocketMQ各版本新特性",
                            "01-基本概念",
                            "02-下载安装",
                            "03-消息的有序性",
                            "04 - 订阅机制",
                            "RocketMQ的延时消息",
                            "RocketMQ 5.x任意时间延时消息原理",
                            "05 - 批量消息和事务消息",
                            "RocketMQ如何实现事务？",
                        ]
                    },

                    {
                        title: "RocketMQ存储设计",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "核心概念",
                        ]
                    },

                    {
                        title: "RocketMQ业务实战",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "02-基于电商场景的高并发RocketMQ实战",
                            "RocketMQ在基金大厂的分布式事务实践",
                        ]
                    },
                    ],

                    "/md/rabbitmq/": [{
                        title: "RabbitMQ",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-RabbitMQ实战下载与安装",
                            "04-RabbitMQ & Spring整合开发",
                            "RabbitMQ消费端幂等性概念及解决方案",
                            "用了这么久的RabbitMQ异步编程竟然都是错的",
                            "08-RabbitMQ的七种队列模式",
                            "RabbitMQ的 RPC 消息模式你会了吗？",
                            "12-RabbitMQ实战-消费端ACK、NACK及重回队列机制",
                        ]
                    },],

                    "/md/redis/": [{
                        title: "数据结构",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "Redis的整数数组和压缩列表",
                            "Sorted sets、zset数据结构详解",
                            "Redis Quicklist",
                        ]
                    },
                    {
                        title: "持久化",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "Redis的RDB源码解析",
                        ]
                    },
                    {
                        title: "基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-Redis和ZK分布式锁优缺点对比以及生产环境使用建议",
                            "05-缓存读写策略模式详解",
                            "06-如何快速定位 Redis 热 key",
                            "Redis异步子线程原理详解",
                            "12-Redis 闭源？",
                            "redis-agpl-license",
                        ]
                    },
                    {
                        title: "源码",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "02-Redisson可重入锁加锁源码分析",
                            "03-Redisson公平锁加锁源码分析",
                            "04-Redisson读写锁加锁机制分析",
                        ]
                    },
                    {
                        title: "业务",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-数据结构的最佳实践",
                        ]
                    },
                    ],
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
                            "05-倒排索引与分词",
                            "07-整合进 SpringBoot 项目",
                            "building-product-search-system-with-es",
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
                            "clickhouse-jdbc",
                        ]
                    }],

                    "/md/neo4j/": [{
                        title: "Neo4j",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "neo4j-revolutionary-power-of-graph-databases",
                        ]
                    }],

                    "/md/distdb/": [{
                        title: "分布式数据库",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-爆火的分布式数据库到底是个啥？",
                            "03-BASE 还能撑多久？强一致性才是事务处理的终极奥义！",
                            "18-分布式数据库的HTAP能统一OLTP和 OLAP吗？",
                            "21-查询执行引擎：加速聚合计算加速",
                            "bank-distributed-database-selection",
                        ]
                    }],

                    "/md/12306/": [{
                        title: "项目介绍",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "12306-basic-info",
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
                            "redis-cache-expiry-strategy",
                            "MySQL深分页调优实战",
                            "ES深分页问题解决方案",
                            "SpringBoot统一异常处理流程",
                            "如何处理消息丢失问题？",
                            "12306架构设计难点"
                        ]
                    }
                    ],


                    "/md/ddd-mall/": [{
                        title: "项目介绍",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "什么是DDD商城",
                        ]
                    },

                    {
                        title: "电商业务",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "04-BFF 架构简介",
                            "05-亿级用户如何分库分表",
                            "06-商品秒杀库存超卖问题",
                            "07-亿级商品数据同步至ES的高效方案",
                            "08-订单超时未支付自动取消和库存回滚",
                            "09-【防止重复下单】分布式系统接口幂等性实现方案",
                            "10-百万数据量快速导入、导出MySQL",
                            "11-分库分表平滑上线&快速回滚",
                            "天天说架构，那CDN到底是什么？",
                            "building-product-information-caching-system",
                        ]
                    },

                    {
                        title: "组件设计",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "DDD-Mall商城的公共组件设计",
                            "dddmall-base-spring-boot-starter",
                            "dddmall-common-spring-boot-starter",
                            "dddmall-cache-spring-boot-starter",
                            "dddmall-convention-spring-boot-starter",
                            "dddmall-idempotent-spring-boot-starter",
                            "05-dddmall-database-spring-boot-starter",
                            "06-dddmall-ddd-framework-core",
                            "07-dddmall-designpattern-spring-boot-starter",
                            "07-责任链模式",
                            "07-建造者模式",
                        ]
                    },
                    ],

                    "/md/risk-control/": [{
                        title: "风控引擎架构设计",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "flink-real-time-risk-control-system-overview",
                            "coupon-fraud-grey-market-chain",
                            "coupon-distribution-risk-control-challenges",
                            "risk-control-rules-thresholds-for-coupon-scenarios",
                            "risk-control-engine-architecture-design",
                            "reasons-for-choosing-groovy-for-risk-control-engine",
                        ]
                    },],

                    "/md/go-gateway/": [{
                        title: "Go微服务网关",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-Go微服务网关专栏概述",
                            "open-systems-interconnection-model",
                        ]
                    },],

                    "/md/career/": [{
                        title: "职业规划",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "为什么中国的程序员有35岁危机",
                            "03-新人程序员入行忠告",
                            "04-外企也半夜发布上线吗？",
                            "05-中外程序员到底有啥区别？",
                            "06-全球顶级架构师推荐的书单",
                            "08-程序员为何一直被唱衰？",
                            "09-程序员的“三步走”发展战略",
                            "10-为何我建议你学会抄代码",
                            "11-计师能去哪些央国企？",
                            "mastering-architecture-diagrams",
                            "how-i-tricked-my-brain-to-be-addicted-to-coding",
                            "转型传统行业避坑指南",
                            "workplace-jargon",
                            "workplace-rule",
                            "big-company-work-style",
                            "研发的立足之本到底是啥？",
                            "must-have-soft-skills-for-rd",
                            "no-tech-no-future-for-rd",
                            "moat-of-rd",
                            "life-beyond-career-growth",
                        ]
                    },

                    {
                        title: "晋升",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "p6-promotion-guide",
                            "why-hard-work-didnt-get-you-promoted-the-overlooked-truth",
                            "performance-review-guideline",
                        ]
                    },

                    {
                        title: "职场",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "经常被压缩开发时间，延期还要背锅，如何破局？",
                        ]
                    },


                    {
                        title: "书单",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "Java-reading-list",
                            "efficient-professional-reading-list",
                        ]
                    },

                    ],

                    "/md/vue/": [{
                        title: "Vue",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-Vue开发实战",
                            "goodbye-jquery-thinking-create-checklist-apps-with-vue-js-experience-the-charm-of-data-driven",
                            "vue2-to-vue3",
                            "05-教你快速搭建Vue3工程化项目",
                            "Vuex设计Vue3项目的数据流",
                            "router",
                            "table",
                            "vue-js-vs-axios-practical-guide-from-ajax-requests-to-api-proxy-configuration",
                            "frontend-ci-cd-automation-deploy-and-instant-rollback-solution",
                        ]
                    }],

                    "/md/sideline/": [{
                        title: "副业",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "16-精益独立开发实践",
                            "17-用户画像都是怎么产生的？",
                            "20-个人支付解决方案",
                            "21-处理用户反馈和增长优化",
                            "22-大纲的注意点",
                        ]
                    }],

                    "/md/chain/": [{
                        title: "区块链核心概念",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "blockchain-column-overview",
                            "三分钟，快速了解区块链技术",
                            "01-联盟链入门",
                            "05-账本模型",
                            "06-智能合约",
                            "07-网络与共识",
                            "08-工作量证明",
                            "09-一文看懂以太坊智能合约！",
                            "oracles-unavoidable-offchain-data-onchain-alternatives-truth",
                            "blockchain-smart-contract-helloworld-project",
                        ]
                    },
                    {
                        title: "百度联盟链XuperChain",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "03-百度联盟链Xuperchain核心概念",
                            "04-XuperChain核心流程",
                        ]
                    },

                    {
                        title: "Flow平台实战",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "02-认识Flow Cadence",
                            "03-Cadence基础语法",
                        ]
                    },

                    {
                        title: "以太坊区块链",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-以太坊智能合约与高级语言",
                            "02-DAPP",
                            "03-以太坊的EVM",
                            "04-Solidity基础语法",
                            "05-Solidity开发智能合约",
                            "06-通过web3.js与以太坊客户端进行交互",
                            "07-Truffle",
                        ]
                    },

                    ],

                    "/md/python/": [{
                        title: "Python基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-macOS和Linux安装和管理多个Python版本",
                        ]
                    },
                    {
                        title: "FAQ",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "Installing packages into 'Python 3.9' requires administrator privileges",
                        ]
                    },],

                    "/md/AI/llm/": [{
                        title: "大模型发展",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "llm-api-platform",
                            "GPTs",
                            "ChatGPT为啥不用Websocket而是EventSource",
                            "携手阿里云：JetBrains AI Assistant 正式发布！",
                            "中国大陆用户如何使用Jetbrains内置的AI插件AI Assistant",
                            "contextual-retrieval",
                            "lm-studio-transform-mac-into-ai-tool",
                            "navigating-llm-deployment-tips-tricks-and-techniques",
                            "only-ai-flow-can-do",
                            "llm-reasoning-limitations",
                            "making-an-llm-that-sees-and-reasons",
                            "lmstudio-local-llm-call",
                            "inference-engine",
                            "cuda",
                            "gpullama3-java-gpu-llm",
                        ]
                    },
                    {
                        title: "ChatGPT",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "chatgpt-canva",
                            "memory-faq",
                            "GPT-5",
                            "GPT-5.1",
                            "GPT-5.2",
                            "GPT-5-3-codex",
                        ]
                    },
                    {
                        title: "Qwen",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "qwen-QwQ",
                            "qwen3",
                            "qwen3-coder",
                            "qwen-coder-qoder",
                        ]
                    },

                    {
                        title: "DeepSeek",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "deepseek-r1-detail",
                        ]
                    },

                    {
                        title: "Kimi",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "Kimi-K2",
                            "kimi-k2-whats-fuss-whats-like-use",
                        ]
                    },

                    {
                        title: "Claude",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "Claude3到底多强",
                            "计算机使用功能",
                            "claude-3-7-sonnet",
                            "claude-4",
                            "claude-4-5-sonnet",
                            "claude-opus-4-6",
                            "claude-sonnet-4-6",
                        ]
                    },

                    {
                        title: "Grok",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "grok4",
                            "grok-code-fast",
                        ]
                    },

                    {
                        title: "llama",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "llama-4-multimodal-intelligence",
                        ]
                    },

                    {
                        title: "Dify",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "what-is-llmops",
                            "configuring-models-in-dify",
                            "Build-App-with-Dify",
                            "integrate-dify-and-aws-services-to-enable-more-flexible-translation-workflows",
                            "llm-knowledge-base-segmentation-data-cleaning",
                            "enhancing-llm-memory-with-conversation-variables-and-variable-assigners",
                            "accelerating-workflow-processing-with-parallel-branch",
                            "boost-ai-workflow-resilience-with-error-handling",
                            "introducing-parent-child-retrieval-for-enhanced-knowledge",
                            "dify-v1-0-building-a-vibrant-plugin-ecosystem",
                            "dify-v1-1-0-filtering-knowledge-retrieval-with-customized-metadata",
                            "dify-deep-research-workflow-farewell-to-fragmented-search-unlock-ai-driven-insights",
                            "dify-agent-and-zapier-mcp-unlock-ai-automation",
                        ]
                    },
                    ],

                    "/md/AI/ml/": [{
                        title: "机器学习",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "软件工程师转型AI的全攻略",
                            "01-人工智能概要",
                            "02-MR 算法分类",
                            "what-is-neural-network",
                            "MapReduce分治思想",
                            "05-开发环境安装",
                            "一文看懂AI的Transformer架构",
                            "what-is-tensor",
                        ]
                    },

                    {
                        title: "PyTorch",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "building-neural-networks-with-pytorch",
                            "pytorch-cifar10-image-classifier-tutorial",
                        ]
                    },

                    {
                        title: "NLP",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "basic-of-nlp",
                            "text-preprocessing-overview",
                            "text-vectorization-guide",
                            "text-data-analysis-practical-guide",
                            "key-path-from-feature-enhancement-to-dimensional-norm",
                            "text-data-augmentation-back-translation-guide",
                        ]
                    },

                    {
                        title: "RNN",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "what-is-rnn",
                            "neural-memory-engine-for-sequence-modeling",
                            "long-short-term-memory",
                            "gated-recurrent-unit-model",
                        ]
                    },

                    {
                        title: "Transformer",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "mask-tensor",
                        ]
                    },

                    ],

                    "/md/AI/langchain4j/": [{
                        title: "LangChain4j基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-intro",
                            "get-started",
                            "spring-boot-integration",
                            "chat-and-language-models",
                            "chat-memory",
                            "response-streaming",
                            "ai-services",
                            "tools",
                            "rag",
                            "structured-outputs",
                            "observability",
                            "customizable-http-client",
                            "mcp",
                        ]
                    },

                    {
                        title: "LangChain4j新特性",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "04-0-最新发布功能",
                            "04-1-最新发布功能",
                            "04-2-最新发布功能",
                            "04-3-最新发布功能",
                        ]
                    },
                    ],

                    "/md/AI/agent/": [{
                        title: "智能体发展",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "ai-agents-dont-security-nightmare",
                            "improve-quality-gen-ai",
                            "nextgen-search-ai-opensearch-mcp",
                        ]
                    },

                    {
                        title: "cursor",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "changelog-cursor",
                        ]
                    },

                    {
                        title: "codex",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "codex",
                        ]
                    },

                    {
                        title: "claude-code",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "claude-code-overview",
                        ]
                    },

                    {
                        title: "kiro",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "kiro",
                        ]
                    },

                    {
                        title: "trae",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "trae",
                            "solo",
                            "trae-update",
                        ]
                    },

                    {
                        title: "CodeBuddy",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "codebuddy",
                        ]
                    },

                    {
                        title: "windsurf",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "goodbye-cursor-hello-windsurf",
                            "windsurf-update",
                        ]
                    },

                    {
                        title: "qoder",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "qoder",
                            "quest-autonomous-programming-agent-architecture-loop",
                            "qoderwork",
                            "qoder-update",
                        ]
                    },

                    {
                        title: "Cline",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "cline",
                            "changelog-cline",
                        ]
                    },

                    {
                        title: "Roo Code",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "roocode",
                        ]
                    },
                    
                    {
                        title: "Augment",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "augment",
                        ]
                    },
                    {
                        title: "Dify基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "what-is-llmops",
                            "configuring-models-in-dify",
                            "Build-App-with-Dify",
                            "integrate-dify-and-aws-services-to-enable-more-flexible-translation-workflows",
                            "llm-knowledge-base-segmentation-data-cleaning",
                        ]
                    },
                    {
                        title: "Dify案例",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "changelog-cursor",
                            "goodbye-cursor-hello-windsurf",
                            "Junie",
                            "introducing-codex",
                        ]
                    },

                    {
                        title: "Perplexity",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "perplexity-labs",
                        ]
                    },
                    ],

                    "/md/AI/mcp/": [{
                        title: "MCP",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "mcp-fad-or-fixture",
                            "mcp-and-the-future-of-ai-tooling",
                            "mcp-java-sdk",
                        ]
                    },
                    {
                        title: "MCP核心概念",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "resources",
                        ]
                    },
                    ],

                    "/md/AI/a2a/": [{
                        title: "A2A",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "a2a-a-new-era-of-agent-interoperability",
                        ]
                    },
                    ],
                    
                    "/md/AI/skills/": [{
                        title: "Skills",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "ovrview",
                        ]
                    },
                    ],

                    "/md/AI/spring-ai-alibaba/": [{
                        title: "Spring AI Alibaba",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "why-choose-spring-ai-alibaba-for-smart-customer-service",
                        ]
                    },],

                    "/md/AI/prompt/": [{
                        title: "Prompt工程",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "prompt-website",
                            "prompt-toollist",
                        ]
                    }, ,],

                    "/md/AI/": [{
                        title: "LangChain",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-introduction-to-langchain",
                            "01-langchain-hello-world-project",
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
                            "rag-introduction-tool-to-eliminate-llm-hallucinations",
                            "01-RAG应用框架和解析器",
                            "02-相似性检索的关键 - Embedding",
                            "03-core-of-rag-result-retrieval-and-reordering",
                            "04-prompt-helping-llm-understand-knowledge",
                            "2025-future-rag-trends-four-technologies",
                            "why-vector-embeddings-are-here-to-stay",
                        ]
                    },
                    {
                        title: "LLM应用开发",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "AI大模型企业应用实战",
                            "00-为什么要学习大模型",
                            "01-大语言模型发展",
                            "02-domestic-and-international-llm-multi-model-strong-applications",
                            "03-large-language-model-flaws",
                            "04-ai-ecosystem-industry-analysis",
                            "05-ai-era-turning-point-for-app-developers",
                            "06-智能体项目案例",
                        ]
                    },
                    {
                        title: "Agent基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-what-are-agents",
                            "02-how-langchain-agents-are-implemented",
                            "03-what-is-zero-shot-one-shot-few-shot-learning",
                            "04-how-to-add-memory-in-langchain-agents",
                            "05-how-to-enable-memory-sharing-between-agent-and-tool",
                            "06-how-to-use-langchain-built-in-tools",
                            "07-lcel-langchain-expression-language",
                            "08-ali-tongyi-qianwen-openai-compatible-solution",
                            "09-lcel-chain-and-prompt-implementation",
                            "10-ali-tongyi-qianwen-status-codes-explanation",
                            "11-lcel-memory-addition-method",
                            "12-lcel-agent-core-components",
                            "13-best-development-practices",
                            "local-large-model-deployment",
                        ]
                    },

                    {
                        title: "Agent应用",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-three-minute-fastapi-ai-agent-setup",
                            "02-Agent应用对话情感优化",
                            "03-use-tts-to-make-your-ai-agent-speak",
                            "langserve-revolutionizes-llm-app-deployment",
                            "customizing-a-tool-for-your-ai-agent",
                            "Complex-SQL-Joins-with-LangGraph-and-Waii",
                            "AI Agent应用出路到底在哪？",
                            "building-effective-agents",
                            "ai-agent-is-coming",
                            "software-development-in-AI2",
                            "overcoming-fear-uncertainty-and-doubt-in-the-era-of-ai-transformation",
                            "aigc-app-in-e-commerce-review",
                            "ai-trends-disrupting-software-teams",
                            "amazon-strands-agents-sdk",
                        ]
                    },

                    {
                        title: "LangGraph",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "00-introduce-to-LangGraph",
                            "langgraph-studio",
                            "multi_agent",
                            "methods-adapting-large-language-models",
                            "to-fine-tune-or-not-to-fine-tune-llm",
                            "effective-datasets-fine-tuning",
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
                            "如何了解一个软件的设计？",
                            "架构之美：教你如何分析一个接口？",
                            "业务代码如何才能不再写出大串的if else？",
                            "阿里P8架构师都是怎么分析软件模型的？",
                            "evolution-software-architecture-mainframes-to-distributed-computing",
                            "cell-based-architecture-distributed-systems",
                            "cell-based-architecture-resilient-fault-tolerant-systems",
                            "cell-based-architecture-adoption-guidelines",
                            "架构师教你kill祖传石山代码重复&大量ifelse",
                            "measuring-technical-debt",
                        ]
                    },
                    {
                        title: "设计原则",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-单一职责原则",
                            "open-close-principle",
                            "rest-api-design-resource-modeling",
                        ]
                    },

                    {
                        title: "设计模式",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "【Java设计模式实战】单例模式",
                            "template-pattern",
                            "strategy-pattern",
                            "builder-pattern",
                            "proxy-pattern",
                            "适配器模式",
                            "门面模式",
                            "iterator-pattern",
                            "flyweight-pattern",
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
                            "spark-ml-basic-statistics",
                            "07-回归算法",
                        ]
                    },
                    ],

                    "/md/flink/": [{
                        title: "基础",
                        collapsable: false,
                        sidebarDepth: 0,
                        children: [
                            "01-Flink实战-概述",
                            "flink-beginner-case-study",
                            "Flink部署及任务提交",
                            "flink-programming-paradigms-core-concepts",
                            "flink-architecture",
                            "flink-broadcast-state",
                            "flink-state-management",
                            "flink-state-backend",
                            "05-Flink实战DataStream API编程",
                            "streaming-connectors-programming",
                            "flink-data-latency-solution",
                            "flink-cep",
                            "flink-checkpoint",
                        ]
                    },],

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
                            "OAuth 2.0实战-为什么要先获取授权码code.md",
                            "03-OAuth2.0实战-轻松学会使用JWT，让你的OAuth2.0实现更加安全高效！",
                            "07-你确定懂OAuth 2.0的三方软件和受保护资源服务？",
                        ]
                    },
                    ],
                }
            }
        }
    }
};