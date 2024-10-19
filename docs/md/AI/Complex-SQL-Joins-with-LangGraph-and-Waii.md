# 利用LangGraph和Waii实现你的chat2db！

## 0 前言

在数据分析领域快速发展的今天，通过自然语言与数据交互的能力变得越来越有价值。对话式分析旨在使复杂数据结构对没有专业技能的用户更易于访问。

LangGraph 是个框架，用于构建使用语言模型的状态化、多代理应用程序。Waii 提供文本到 SQL 和文本到图表的功能，使用户能够通过自然语言与数据库和数据可视化进行交互。

本文探讨 Waii 的能力如何增强 LangGraph 应用程序在对话式分析方面的应用。重点关注 Waii 处理数据库中复杂连接的方法，这是从自然语言查询生成准确 SQL 的一个关键方面。

## 1 Waii 的文本到 SQL 能力

对话式分析的核心是将自然语言转换为数据库操作的能力。Waii 提供了一个全面的文本到 SQL 解决方案，在几个关键领域很优秀：

- 高精度的复杂模式连接
- 适用于大型数据库的可扩展表选择
- 定制编译器，用于语法正确性和查询优化
- 专门针对过滤器、排序顺序、常见指标等的代理流程

下一节深入探讨 Waii 如何处理复杂连接。关注这点，因为它是对话式分析的基本能力，许多当今的解决方案都在努力应对。我们将检查一个示例，看看连接是如何构建的，并解释如何轻松地将 Waii 集成到你现有的 LangGraph 应用程序中以实现这些收益。

## 2 深入研究：连接处理

### 示例

想象一下，一个流媒体平台的数据团队被指派创建一个全面的导演表现仪表板。他们需要通过结合来自电影、电视剧、类型、关键词、奖项和演员合作的数据来分析什么使导演成功。

### 指令

创建一个视图，为排名前 5 的导演（按标题数量最高）提供以下信息：

- 导演的名字
- 总标题数量
- 最频繁的类型
- 最频繁的关键词
- 获得的奖项数量
- 电影总收入
- 他们合作过的演员名单

### 查询

Waii 根据这些指令生成的完整查询可以在附录 A 中找到。这里有一个片段，显示了一些连接：

```sql
...
FROM ranked_directors AS rd
INNER JOIN movie_db.movies_and_tv.people AS p
    ON rd.people_id = p.people_id
LEFT JOIN combined_director_genres AS cdg
    ON rd.people_id = cdg.people_id AND cdg.genre_rank = 1
LEFT JOIN combined_director_keywords AS cdk
    ON rd.people_id = cdk.people_id AND cdk.keyword_rank = 1
LEFT JOIN director_awards AS da
    ON rd.people_id = da.people_id
LEFT JOIN director_revenue AS dr
    ON rd.people_id = dr.people_id
LEFT JOIN director_actors AS d_actors
    ON rd.people_id = d_actors.people_id
...
```

### 查询分析

此查询展示了许多复杂的连接能力：

1. **复杂连接图：** 查询中使用了 14 个具有不同限定符、元数和语义的表。
2. **桥接表连接：** 用于连接多对多关系中的实体（例如，导演与电影、电视剧和演员）。
3. **维度表连接：** 用于通过类型和关键词表中的描述性信息丰富数据。
4. **复杂连接链：** 实现连接遥远的实体，例如通过他们的合作将导演与演员联系起来。
5. **全外连接：** 用于结合导演在电影和电视剧中的工作，确保全面覆盖。
6. **左连接用于可选数据：** 当包括可能不是所有导演都存在的数据时应用（例如，奖项、收入）。

（这个列表不是穷尽的，还有许多其他考虑因素用于准确的连接处理，例如：on 和 where 子句之间的区别，连接顺序，非等连接，用于半结构化数据的横向连接等）

Waii 理解数据库关系的方法是关键。以下是它的工作原理：

## 3 知识图构建

Waii 自动构建数据库对象的全面知识图。这个图包含来自多个来源的信息：

- 模式信息
- 约束（例如，主键/外键）
- 基于分析列名和数据模式的预测
- 从查询历史中提取和排名的连接图
- 数据库文档
- 数据目录中定义的关系
- 随着时间的推移从系统使用中获得的反馈

这个图不断更新和完善。每次模式更改、新查询和新的反馈都被分析并整合到图中。

## 4 用于查询构建的代理流程

有了知识图，Waii 采用一系列代理流程来构建最优查询：

**1. 表选择：** 分析用户的请求以确定最相关的表。常见的连接关系和对关系语义的理解用于找到可能不直接语义链接到用户输入的表和路径。

**2. 连接图分析：** 提议和评估选定表之间的潜在连接路径。这包括评分连接图与之前看到的连接和关系语义理解的对齐程度。

**3. 评估/细化连接条件：** 单独检查以确保外连接和连接条件正确应用。这也是我们查看外连接的“on”与“where”子句条件的地方。

**4. 查询构建：** 根据选择的连接图和条件构建 SQL 查询。

**5. 编译和优化：** 确保连接在语法上正确并针对性能进行优化。我们还执行用户对查询的操作约束（例如，最大输出行数，最大输入分区）。

结果是，SQL 查询不仅准确回答了用户的问题，而且以优化的方式针对特定的数据库结构和查询引擎。

## 5 构建对话式分析应用程序

现在我们已经了解了 Waii 如何处理连接和文本到 SQL，让我们探讨如何将这种能力与 LangGraph 结合起来构建复杂的对话式分析应用程序。

LangGraph 是构建代理系统的事实上的框架。对于任何需要精确、周到的数据库访问的 LangGraph 应用程序，Waii 是一个很好的补充。将 Waii 与 LangGraph 集成允许开发人员创建在保持交互上下文的同时执行复杂查询的系统，提高了应用程序的整体智能。

## 6 实现细节

实施此系统涉及几个关键组件：

**1. LangGraph 框架：** 提供多代理系统的总体结构，管理状态和代理交互。

**2. Waii API 集成：** SQL 生成和可视化代理将调用 Waii 的 API 以利用其文本到 SQL 和文本到图表的能力。

**3. 自然语言处理：** 用于理解用户输入和生成易于理解的响应。

**4. Waii 执行 API：** 执行生成的 SQL 查询对实际数据库进行操作。注入代码以执行用户级别的安全策略，例如限制行/列访问。

**5. 状态管理：** 维护多个用户交互之间的上下文，允许后续问题和迭代分析。

典型的交互流程可能如下所示：

![](https://miro.medium.com/v2/resize:fit:700/1*i0r1JDT9zfKC1BDxQVAs3A.png)

1. 用户输入一个问题。
2. LangGraph 问题分类器决定请求最好从内存还是数据库中回答
3. [可选] Waii SQL 生成器创建一个优化的 SQL 查询。
4. [可选] Waii SQL 执行器注入安全约束，执行查询并检索结果。
5. [可选] 结果分类器决定输出应该是数据还是可视化。
6. [可选] Waii 图表生成器根据数据和元数据创建相关图表。
7. LangGraph 洞察生成代理综合最终结果供用户使用
8. 循环重复。

（可选 / 图像中未显示：在错误或异常情况下，LangGraph 循环，重写输入并重新生成所需的对象。）

在此过程中，对话管理代理维护状态，允许上下文后续问题和更自然、流畅的交互。

示例的完整实现在附录 B 中给出。

## 7 好处和用例

LangGraph 和 Waii 的这种集成用于数据库访问提供了几个关键好处：

1. **可访问性：** 通过自然语言交互，复杂的数据分析变得对非技术用户可访问。
2. **分析深度：** 系统可以处理手动制定具有挑战性的复杂查询。
3. **上下文理解：** 维护的状态允许更自然、上下文感知的关于数据的对话。
4. **视觉洞察：** 自动生成的相关可视化增强了对数据的理解。
5. **可扩展性：** 系统可以适应大型、复杂的数据库，而不会成比例地增加最终用户的复杂性。

潜在的用例涵盖各个行业：

- **商业智能：** 执行人员可以在不学习 SQL 或 BI 工具的情况下查询复杂的业务数据。
- **医疗保健：** 研究人员可以探索大型医疗数据库，关联患者结果中的不同因素。
- **金融：** 分析人员可以快速调查市场趋势和公司绩效的多个维度。
- **电子商务：** 营销团队可以分析客户行为模式以指导策略。
- **教育：** 管理员可以洞察学生表现和资源分配。

## 8 结论

LangGraph 的多代理能力和 Waii 的高级文本到 SQL 和可视化功能的结合为分析和数据处理开辟了新的机会。通过使复杂的数据分析通过自然语言变得可访问，这种方法大大降低了从数据中获得高质量洞察的障碍。

## 附录 A：查询

完整的 SQL 查询如下所示：

```sql
WITH director_movie_count AS (
    SELECT
        mdb.people_id,
        COUNT(m.movie_id) AS movie_count
    FROM movie_db.movies_and_tv.movies_directors_bridge AS mdb
    INNER JOIN movie_db.movies_and_tv.movies AS m
        ON mdb.movie_id = m.movie_id
    GROUP BY
        mdb.people_id
),

director_tv_count AS (
    SELECT
        tsdb.people_id,
        COUNT(ts.tv_series_id) AS tv_count
    FROM movie_db.movies_and_tv.tv_series_directors_bridge AS tsdb
    INNER JOIN movie_db.movies_and_tv.tv_series AS ts
        ON tsdb.tv_series_id = ts.tv_series_id
    GROUP BY
        tsdb.people_id
),

combined_counts AS (
    SELECT
        COALESCE(dmc.people_id, dtc.people_id) AS people_id,
        COALESCE(dmc.movie_count, 0) + COALESCE(dtc.tv_count, 0) AS total_count
    FROM director_movie_count AS dmc
    FULL OUTER JOIN director_tv_count AS dtc
        ON dmc.people_id = dtc.people_id
),

ranked_directors AS (
    SELECT
        combined_counts.people_id,
        combined_counts.total_count,
        RANK() OVER (ORDER BY combined_counts.total_count DESC NULLS LAST) AS rank
    FROM combined_counts
),

director_genres AS (
    SELECT
        rd.people_id,
        g.name AS genre_name,
        COUNT(*) AS genre_count
    FROM ranked_directors AS rd
    LEFT JOIN movie_db.movies_and_tv.movies_directors_bridge AS mdb
        ON rd.people_id = mdb.people_id
    LEFT JOIN movie_db.movies_and_tv.movies_genres_bridge AS mgb
        ON mdb.movie_id = mgb.movie_id
    LEFT JOIN movie_db.movies_and_tv.genres AS g
        ON mgb.id = g.id
    GROUP BY
        rd.people_id,
        g.name
    UNION ALL
    SELECT
        rd.people_id,
        g.name AS genre_name,
        COUNT(*) AS genre_count
    FROM ranked_directors AS rd
    LEFT JOIN movie_db.movies_and_tv.tv_series_directors_bridge AS tsdb
        ON rd.people_id = tsdb.people_id
    LEFT JOIN movie_db.movies_and_tv.tv_series_genres_bridge AS tsgb
        ON tsdb.tv_series_id = tsgb.tv_series_id
    LEFT JOIN movie_db.movies_and_tv.genres AS g
        ON tsgb.id = g.id
    GROUP BY
        rd.people_id,
        g.name
),

combined_director_genres AS (
    SELECT
        director_genres.people_id,
        director_genres.genre_name,
        SUM(director_genres.genre_count) AS total_genre_count,
        RANK()
            OVER (PARTITION BY director_genres.people_id ORDER BY SUM(director_genres.genre_count) DESC NULLS LAST)
            AS genre_rank
    FROM director_genres
    GROUP BY
        director_genres.people_id,
        director_genres.genre_name
),

director_keywords AS (
    SELECT
        rd.people_id,
        k.name AS keyword_name,
        COUNT(*) AS keyword_count
    FROM ranked_directors AS rd
    LEFT JOIN movie_db.movies_and_tv.movies_directors_bridge AS mdb
        ON rd.people_id = mdb.people_id
    LEFT JOIN movie_db.movies_and_tv.movies_keywords_bridge AS mkb
        ON mdb.movie_id = mkb.movie_id
    LEFT JOIN movie_db.movies_and_tv.keywords AS k
        ON mkb.id = k.id
    GROUP BY
        rd.people_id,
        k.name
),

combined_director_keywords AS (
    SELECT
        director_keywords.people_id,
        director_keywords.keyword_name,
        SUM(director_keywords.keyword_count) AS total_keyword_count,
        RANK()
            OVER (
                PARTITION BY director_keywords.people_id ORDER BY SUM(director_keywords.keyword_count) DESC NULLS LAST
            )
            AS keyword_rank
    FROM director_keywords
    GROUP BY
        director_keywords.people_id,
        director_keywords.keyword_name
),

director_awards AS (
    SELECT
        pab.people_id,
        COUNT(*) AS award_count
    FROM movie_db.movies_and_tv.people_awards_bridge AS pab
    INNER JOIN movie_db.movies_and_tv.awards AS a
        ON pab.award_id = a.award_id
    WHERE
        a.iswinner = 'True'
    GROUP BY
        pab.people_id
),

director_revenue AS (
    SELECT
        mdb.people_id,
        SUM(m.revenue) AS total_revenue
    FROM movie_db.movies_and_tv.movies_directors_bridge AS mdb
    INNER JOIN movie_db.movies_and_tv.movies AS m
        ON mdb.movie_id = m.movie_id
    GROUP BY
        mdb.people_id
),

director_actors AS (
    SELECT DISTINCT
        rd.people_id,
        p.name AS actor_name
    FROM ranked_directors AS rd
    LEFT JOIN movie_db.movies_and_tv.movies_directors_bridge AS mdb
        ON rd.people_id = mdb.people_id
    LEFT JOIN movie_db.movies_and_tv.movies_actors_bridge AS mab
        ON mdb.movie_id = mab.movie_id
    LEFT JOIN movie_db.movies_and_tv.people AS p
        ON mab.people_id = p.people_id
    UNION
    SELECT DISTINCT
        rd.people_id,
        p.name AS actor_name
    FROM ranked_directors AS rd
    LEFT JOIN movie_db.movies_and_tv.tv_series_directors_bridge AS tsdb
        ON rd.people_id = tsdb.people_id
    LEFT JOIN movie_db.movies_and_tv.tv_series_actors_bridge AS tsab
        ON tsdb.tv_series_id = tsab.tv_series_id
    LEFT JOIN movie_db.movies_and_tv.people AS p
        ON tsab.people_id = p.people_id
)

SELECT
    p.name,
    rd.total_count AS number_of_titles,
    ARRAY_AGG(DISTINCT cdg.genre_name) AS most_frequent_genres,
    ARRAY_AGG(DISTINCT cdk.keyword_name) AS most_frequent_keywords,
    COALESCE(da.award_count, 0) AS award_count,
    COALESCE(dr.total_revenue, 0) AS total_revenue,
    ARRAY_AGG(DISTINCT d_actors.actor_name) AS actors_worked_with
FROM ranked_directors AS rd
INNER JOIN movie_db.movies_and_tv.people AS p
    ON rd.people_id = p.people_id
LEFT JOIN combined_director_genres AS cdg
    ON rd.people_id = cdg.people_id AND cdg.genre_rank = 1
LEFT JOIN combined_director_keywords AS cdk
    ON rd.people_id = cdk.people_id AND cdk.keyword_rank = 1
LEFT JOIN director_awards AS da
    ON rd.people_id = da.people_id
LEFT JOIN director_revenue AS dr
    ON rd.people_id = dr.people_id
LEFT JOIN director_actors AS d_actors
    ON rd.people_id = d_actors.people_id
WHERE
    rd.rank <= 5
GROUP BY
    p.name,
    rd.total_count,
    da.award_count,
    dr.total_revenue
ORDER BY
    rd.total_count DESC NULLS LAST,
    p.name ASC
```
## 附录 B
LangGraph 应用程序 这是完整的 LangGraph 应用程序（也在 github 上）

```python
import os
import sys
from typing import List, Optional, Dict, Any

import pandas as pd
import plotly
from pydantic import BaseModel
from langgraph.graph import StateGraph
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
from waii_sdk_py import WAII
from waii_sdk_py.query import QueryGenerationRequest, RunQueryRequest

class State(BaseModel):
    database_description: str = ''
    query: str = ''
    sql: str = ''
    data: List[Dict[str, Any]] = []
    chart: Any = ''
    insight: str = ''
    response: str = ''
    error: Optional[str] = None
    path_decision: str = ""

class LanggraphWorkflowManager:

    def init_waii(self):
        WAII.initialize(url=os.getenv("WAII_URL"), api_key=os.getenv("WAII_API_KEY"))
        WAII.Database.activate_connection(os.getenv("DB_CONNECTION"))

    def create_workflow(self) -> StateGraph:
        workflow = StateGraph(State)

        workflow.add_node("Question Classifier", self.question_classifier)
        workflow.add_node("Result Classifier", self.result_classifier)
        workflow.add_node("SQL Generator", self.sql_generator)
        workflow.add_node("SQL Executor", self.sql_executor)
        workflow.add_node("Chart Generator", self.chart_gen)
        workflow.add_node("Insight Generator", self.insight_generator)
        workflow.add_node("Result Synthesizer", self.result_synthesizer)

        workflow.set_entry_point("Question Classifier")
        workflow.add_conditional_edges(
            "Question Classifier",
            lambda state: state.path_decision,
            {
                "database": "SQL Generator",
                "visualization": "Chart Generator",
                "general": "Insight Generator"
            }
        )

        workflow.add_edge("SQL Generator", "SQL Executor")
        workflow.add_edge("SQL Executor", "Result Classifier")
        workflow.add_conditional_edges(
            "Result Classifier",
            lambda state: state.path_decision,
            {
                "visualization": "Chart Generator",
                "data": "Result Synthesizer"
            }
        )
        workflow.add_edge("Chart Generator", "Result Synthesizer")
        workflow.add_edge("Insight Generator", "Result Synthesizer")
        workflow.add_edge("Result Synthesizer", "Question Classifier")

        return workflow

    def question_classifier(self, state: State) -> State:
        state.database_description = self.format_catalog_info(WAII.Database.get_catalogs())
        state.query = input("Question: ")

        prompt = ChatPromptTemplate.from_messages([
            ("human",
             "Database info: \n---\n{database_description}\n---\n"
             "Answer 'database' if this question is likely related to information in the database. Otherwise answer 'general'? Question: '{query}'. "
             "Consider the information you have about the database, when in doubt answer 'database'")
        ])
        chain = prompt | ChatOpenAI() | StrOutputParser()
        classification = chain.invoke({"query": state.query, "database_description": state.database_description}).strip().lower()
        return state.model_copy(update={"path_decision": classification, "error": None})

    def sql_generator(self, state: State) -> State:
        sql = WAII.Query.generate(QueryGenerationRequest(ask=state.query)).query
        return state.model_copy(update={"sql": sql, "insight":""})

    def sql_executor(self, state: State) -> State:
        data = WAII.Query.run(RunQueryRequest(query=state.sql)).rows
        return state.model_copy(update={"data": data}, deep=True)

    def chart_gen(self, state: State) -> State:
        df_data = pd.DataFrame(state.data)
        chart = WAII.Chart.generate_chart(df=df_data)
        return state.model_copy(update={"chart": chart.chart_spec, "error": None}, deep=True)

    def result_classifier(self, state: State) -> State:
        state.chart = ''
        prompt = ChatPromptTemplate.from_messages([
            ("human",
             "Is the following question best answered by 'data' or a 'visualization'? Question: '{query}'. "
             "Output: Strictly respond with either 'data', or 'visualization'. No additional text.")
        ])
        chain = prompt | ChatOpenAI() | StrOutputParser()
        classification = chain.invoke({"query": state.query}).strip().lower()
        return state.model_copy(update={"path_decision": classification, "error": None})

    def insight_generator(self, state: State) -> dict:
        prompt = ChatPromptTemplate.from_messages([("human", "{query}")])
        chain = prompt | ChatOpenAI() | StrOutputParser()
        insight = chain.invoke({"query": state.query})
        return state.model_copy(update={"insight": insight, "sql": "", "data": [], "error": None}, deep=True)

    def result_synthesizer(self, state: State) -> State:
        model = ChatOpenAI()
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert assistant in analyzing data"),
            ("human", "\n User Question: '{query}'. "
                             "\n Results of query (if any): '{data}'."
                             "\n LLM results (if any): '{insight}'."
                             "\n\n Instructions: Answer the user with this information.")
        ])
        chain = prompt | model | StrOutputParser()
        data = "\n".join(" | ".join(f"{key}: {value}" for key, value in row.items()) for row in state.data)
        output = chain.invoke({"query": state.query, "data": data, "insight": state.insight}).strip().lower()
        if state.chart:
            df = pd.DataFrame(state.data)
            exec(state.chart.plot)
        print('Answer: '+output)
        return state.model_copy(update={"response": output}, deep=True)

    def __init__(self):
        self.workflow = self.create_workflow()
        self.app = self.workflow.compile()
        self.init_waii()
        print(self.app.get_graph().draw_ascii())

    def format_catalog_info(self, catalogs):
        return "\n".join([
            f"Database: {catalog.name}\n" +
            "\n".join([
                f"  Schema: {schema.name.schema_name}\n    Description: {schema.description}"
                for schema in catalog.schemas
            ]) + "\n"
            for catalog in catalogs.catalogs
        ])

    def run_workflow(self):
        while True:
            try:
                initial_state = State()
                app_response = self.app.invoke(initial_state)
            except Exception as e:
                print(f"Error in workflow: {e}. Will restart.")

LanggraphWorkflowManager().run_workflow()
```