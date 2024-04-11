# IntelliJ IDEA 2024.1 最新变化

IntelliJ IDEA 2024.1 引入了一系列令人期待的升级，可以帮助您简化工作流。 IntelliJ IDEA Ultimate 现已搭载全行代码补全，为整行代码提供全面的代码感知建议。 对 Java 22 的支持可以确保与最新语言功能的兼容。 重做的终端能够增强命令行操作，编辑器中的粘性行则有助于更流畅地浏览代码库。 在版本 2024.1 中，IDE 还获得了其他数十项改进！

## 0 关键亮点

### 全行代码补全 Ultimate



![全行代码补全](https://www.jetbrains.com/idea/whatsnew/2024-1/img/FLCC_settings.png)



![全行代码补全](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Full_line_code_completion_preview.png)

IntelliJ IDEA Ultimate 2024.1 针对 Java 全行代码补全。 这项功能由无缝集成到 IDE 中的高级深度学习模型提供支持。 它可以基于上下文分析预测和建议整行代码，有助于提高编码效率。 这些建议由针对不同语言和框架特别训练的专属语言模型驱动，模型完全在本地设备上运行，有助于确保数据安全，并且无需与外部服务器通信。 此功能包含在 IntelliJ IDEA Ultimate 许可证订阅中。 在这篇[博文](https://blog.jetbrains.com/blog/2024/04/04/full-line-code-completion-in-jetbrains-ides-all-you-need-to-know/)中了解详情。

### 对 Java 22 功能的支持

![对 Java 22 功能的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Java_super_preview.png)

![对 Java 22 功能的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Java_implicit_classes_preview.png)

提供对 2024 年 3 月发布的 JDK 22 中的功能集的支持， 支持覆盖未命名变量与模式的最终迭代、字符串模板与隐式声明的类的第二个预览版，以及实例 `main` 方法。 还引入了对 `super(...)` 之前预览状态下的 new 语句的支持。 在这篇[博文](https://blog.jetbrains.com/idea/2024/03/java-22-and-intellij-idea/)中了解详情。

### 新终端 Beta

![新终端](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_New_Terminal_preview.png)

![新终端](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_New_Terminal.png)

重做的终端，具有可视化和功能增强，有助于简化命令行任务。 此更新为既有工具带来了全新的外观，命令被分为不同的块，扩展的功能集包括块间丝滑导航、命令补全和命令历史记录的轻松访问等。 

这篇[博文](https://blog.jetbrains.com/idea/2024/02/the-new-terminal-beta-is-now-in-jetbrains-ides/)中了解详情。

### 编辑器中的粘性行

![编辑器中的粘性行](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Sticky_lines_settings.png)

![编辑器中的粘性行](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Sticky_lines_preview.png)

在编辑器中引入了粘性行，旨在简化大文件的处理和新代码库的探索。 滚动时，此功能会将类或方法的开头等关键结构元素固定到编辑器顶部。 这将使作用域始终保持在视野中，您可以点击固定的行快速浏览代码。

## 1 用户体验

[![索引编制期间 IDE 功能对 Java 和 Kotlin 可用](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Dumb_mode_preview.png)](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Dumb_mode.png)

### 1.1 索引编制期间 IDE 功能对 Java 可用

现在，代码高亮显示和补全等基本 IDE 功能可在项目索引编制期间用于 Java，这应该会增强您的启动体验。 此外，您可以在项目仍在加载时使用 *Go to class*（转到类）和 *Go to symbol*（转到符号）浏览代码。

![更新的 New Project（新建项目）向导](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Updated_project_wizard.png)

### 1.2 更新的 *New Project*（新建项目）向导

为了减轻您在配置新项目时的认知负担，我们微调了 *New Project*（新建项目）向导的布局。 语言列表现在位于左上角，使最流行的选项更加醒目。

![用于缩小整个 IDE 的选项](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Zoom_preview.png)

### 1.3 用于缩小整个 IDE 的选项

您现在可以将 IDE 缩小到 90%、80% 或 70%，从而可以灵活地调整 IDE 元素的大小。

## 2 Java

### 2.1 字符串模板中的语言注入



![字符串模板中的语言注入](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_Language_injection_in_string_templates.png)

![字符串模板中的语言注入](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_Language_injections_in_string_templates_preview.png)

IntelliJ IDEA 2024.1 引入了将语言注入字符串模板的功能。 您可以使用注解，注解会自动选择所需语言，也可以使用 *Inject language or reference*（注入语言或引用）意图操作 (⌥Enter) 从列表中手动选择语言。 如果您使用后一种方式，IDE 将建议您插入语言注解。 执行注入后，您可以再次调用意图操作列表，并选择在独立编辑器窗格中打开和编辑注入的片段。

### 2.2 改进的日志工作流

![改进的日志工作流](https://www.jetbrains.com/idea/whatsnew/2024-1/img/3_logger_statements_generation_preview.png)

![改进的日志工作流](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_logs_navigation_preview.png)

![改进的日志工作流](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_logger_statements_completion_preview.png)

![改进的日志工作流](https://www.jetbrains.com/idea/whatsnew/2024-1/img/3_logger_statements_generation_preview.png)

![改进的日志工作流](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_logs_navigation_preview.png)

由于日志记录是日常开发的重要环节。 可从控制台中的日志消息轻松导航到生成它们的代码。 此外，IDE 会在有需要的位置建议添加记录器，并简化插入记录器语句的操作，即使记录器实例不在作用域内。 

这篇[博文](https://blog.jetbrains.com/idea/2024/02/intellij-idea-2024-1-eap-6/#improved-workflow-for-logs)了解详情。

### 2.3 新检查与快速修复

![新检查与快速修复](https://www.jetbrains.com/idea/whatsnew/2024-1/img/4_unreachable_code.png)

![新检查与快速修复](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_Double_hashCode.png)

![新检查与快速修复](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_Switch_between_implicit_and_explicit_preview.png)

![新检查与快速修复](https://www.jetbrains.com/idea/whatsnew/2024-1/img/3_Use_existing_method_preview.png)

![新检查与快速修复](https://www.jetbrains.com/idea/whatsnew/2024-1/img/4_unreachable_code.png)

![新检查与快速修复](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_Double_hashCode.png)

为 Java 实现新的检查和快速修复，帮助您保持代码整洁无误。 为清楚起见，IDE 现在会检测可被替换为对 `Long.hashCode()` 或 `Double.hashCode()` 方法的调用的按位操作。 此外，新的快速修复可以根据代码库的要求简化隐式和显式类声明之间的切换。 另一项新检查为匹配代码段建议使用现有 static 方法，使代码可以轻松重用，无需引入额外 API。 此外，IDE 现在可以检测并报告永远不会执行的无法访问的代码。

![通过多版本 JAR 增强的用户体验](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Multi-release_JARs_3_preview.png)

![通过多版本 JAR 增强的用户体验](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Multi-release_JARs_1_preview.png)

![通过多版本 JAR 增强的用户体验](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Multi-release_JARs_2.png)



### 2.4 通过多版本 JAR 增强的用户体验

IntelliJ IDEA 2024.1 通过多版本 JAR 库提供增强的用户体验。 使用具有不同版本的类时，*Go to declaration*（转到声明）功能现在会根据当前模块的语言级别从 JAR 中选择正确的版本。 此外，*Go to class*（转到类）功能还提供有关类版本的额外信息。 调试期间使用 *Step Into*（步入）时，IDE 会将您带到与 JDK 版本而不是模块语言级别对应的类。

![重做的 Conflicts Detected（检测到冲突）对话框](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Conflicts_detected.png)

### 2.5 重做的 *Conflicts Detected*（检测到冲突）对话框

重做了 *Conflicts Detected*（检测到冲突）对话框以提高可读性。 现在，对话框中的代码反映了编辑器中的内容，使您可以更清楚地了解冲突，并且 IDE 会自动保存窗口大小调整以供将来使用。 另外，我们还更新了按钮及其行为以简化重构工作流，对话框现在可以完全通过键盘访问，您可以使用快捷键和箭头键进行无缝交互。

![Rename（重命名）重构嵌入提示](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Rename_inlay_hint_preview.png)

### 2.6 *Rename*（重命名）重构嵌入提示

为了使重命名流程更简单、更直观，我们实现了一个新的嵌入提示，在更改的代码元素上显示。 要将代码库中的所有引用更新为新版本，点击此提示并确认更改即可。

## 3 版本控制系统

![编辑器内代码审查](https://www.jetbrains.com/idea/whatsnew/2024-1/img/In-editor_code_review.png)

### 编辑器内代码审查

借助实现的新审查模式，IntelliJ IDEA 2024.1 为 GitHub 和 GitLab 用户引入了增强的代码审查体验。 此功能与编辑器集成，促进作者与审查者直接互动。 在检查拉取/合并请求分支时，审查模式会自动激活，并在装订区域中显示粉色标记，表明代码更改可供审查。 点击这些标记会弹出一个显示原始代码的弹出窗口，这样您就能快速识别哪些代码已被更改。 装订区域图标可以帮助您迅速发起新讨论，以及查看和隐藏现有讨论。 这些图标还可以让用户方便地访问评论，从而轻松查看、回复和作出反应。 在我们的[博文](https://blog.jetbrains.com/idea/2024/02/intellij-idea-2024-1-eap-6/#in-editor-code-review)中详细了解此更改。

![在 Log（日志）标签页中显示审查分支更改的选项](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Display_review_branch_in_Log_tab.png)

### 在 *Log*（日志）标签页中显示审查分支更改的选项

IntelliJ IDEA 2024.1 通过提供分支相关更改的集中视图简化了代码审查工作流。 对于 GitHub、GitLab 和 Space，现在可以在 *Git* 工具窗口中的单独 *Log*（日志）标签页中查看具体分支中的更改。 为此，点击 *Pull Requests*（拉取请求）工具窗口中的分支名称，然后从菜单中选择 *Show in Git Log*（在 Git 日志中显示）。

![对代码审查评论回应的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/VCS_reactions.png)

### 对代码审查评论回应的支持

IntelliJ IDEA 2024.1 开始支持对 GitHub 拉取请求和 GitLab 合并请求的审查评论发表回应，已有一组表情符号可供选择。

![Git 工具窗口中 CI 检查的状态](https://www.jetbrains.com/idea/whatsnew/2024-1/img/CI_check_statuses.png)

### *Git* 工具窗口中 CI 检查的状态

我们在 *Git* 工具窗口的 *Log*（日志）标签页中引入了一个新列，使您可以轻松审查 CI 系统执行的 GitHub 提交检查的结果。

![从推送通知创建拉取/合并请求](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Create_PR_on_push.png)

### 从推送通知创建拉取/合并请求

成功将更改推送到版本控制系统后，IDE 现在将发布一条通知，提醒您已成功推送并建议创建拉取/合并请求的操作。

![待处理 GitHub 更新的可视化指示器](https://www.jetbrains.com/idea/whatsnew/2024-1/img/VCS_blue_dots.png)

### 待处理 GitHub 更新的可视化指示器

我们引入了可视化指示器来提示代码审查工作流中待处理的更新。 有需要您注意的更改时，工具窗口的图标上会出现一个点。 未查看的拉取请求也将用点标记，确保您不会错过代码审查流程中的更新。

![防止大文件提交到仓库](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Prevent_large_files_commits.png)

### 防止大文件提交到仓库

为了帮助您避免由于文件过大而导致版本控制拒绝，IDE 现在包含预提交检查，防止您提交此类文件并通知您该限制。

![Allow unrelated histories（允许不相关的历史记录）合并选项](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Allow_unrelated_histories.png)

### *Allow unrelated histories*（允许不相关的历史记录）合并选项

*Merge into*（合并到）对话框的下拉菜单中新增了 *Allow unrelated histories*（允许不相关的历史记录）选项。 选择后，该选项允许合并两个分支，即使它们没有共同的历史记录。

![Git 工具窗口中 History（历史记录）标签页的分支筛选器](https://www.jetbrains.com/idea/whatsnew/2024-1/img/History_filter.png)

### *Git* 工具窗口中 *History*（历史记录）标签页的分支筛选器

在 *Git* 工具窗口中，*Show all branches*（显示所有分支）按钮已被替换为分支筛选器，允许您审查对指定分支内的文件所做的更改。 我们还调整了工具栏的方向，将其水平放置以提高实用性。

![Commit（提交）工具窗口中的 Stash（隐藏）标签页](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Stash_tab.png)

### *Commit*（提交）工具窗口中的 *Stash*（隐藏）标签页

对于依赖隐藏来存储临时未提交更改的用户，我们在 *Commit*（提交）工具窗口中引入了一个专属标签页以便访问。 如果您同时使用隐藏和搁置，则可以通过 *Settings/Preferences | Version Control | Git*（设置/偏好设置 | 版本控制 | Git）中的相应复选框启用组合的 *Stashes and Shelves*（隐藏和搁置）标签页。

![从比较中排除文件夹和文件的选项](https://www.jetbrains.com/idea/whatsnew/2024-1/img/ignore_in_diff.png)

### 从比较中排除文件夹和文件的选项

在差异查看器中，您可以指定在比较中要忽略的文件夹和文件，从而仅关注有意义的更改。 右键点击您不想在比较结果中看到的文件或文件夹，然后从上下文菜单中选择 *Exclude from results*（从结果中排除）。

![Branches（分支）弹出窗口中改进的搜索](https://www.jetbrains.com/idea/whatsnew/2024-1/img/VCS_widget_search_actions.png)

### *Branches*（分支）弹出窗口中改进的搜索

在 *Branches*（分支）弹出窗口中，您可以按操作和仓库筛选搜索结果，以在版本控制系统中更快、更精确地导航。

![Git 标签页已从 Search Everywhere（随处搜索）对话框中移除](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Git_Tab_removed_from_SE.png)

### *Git* 标签页已从 *Search Everywhere*（随处搜索）对话框中移除

分析使用统计数据后，我们默认从 *Search Everywhere* 对话框中移除了 *Git* 标签页。 如果要将其恢复，可以使用 *Settings / Preferences | Advanced Settings | Version Control. Git*（设置/偏好设置 | 高级设置 | 版本控制. Git）中的 *Show Git tab in Search Everywhere* （在“随处搜索”中显示 Git 标签页）复选框。

## 4 构建工具

![针对 Maven 项目的打开速度提升](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Quarkus_opening_time_2023_3_5_preview.png)

![针对 Maven 项目的打开速度提升](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Quarkus_opening_time_2024_1_preview.png)

![针对 Maven 项目的打开速度提升](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Quarkus_opening_time_2023_3_5_preview.png)

![针对 Maven 项目的打开速度提升](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Quarkus_opening_time_2024_1_preview.png)



### 针对 Maven 项目的打开速度提升

IntelliJ IDEA 现在通过解析 `pom.xml` 文件构建项目模型。 这使得有效项目结构可以在几秒钟内获得，具有所有依赖项的完整项目模型则同时在后台构建，使您无需等待完全同步即可开始处理项目。

![对 Maven Shade 插件的重命名工作流的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Maven_Shade_2023.3.png)

![对 Maven Shade 插件的重命名工作流的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Maven_Shade_2024.1.png)

![对 Maven Shade 插件的重命名工作流的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Maven_Shade_2023.3.png)

![对 Maven Shade 插件的重命名工作流的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Maven_Shade_2024.1.png)



### 对 Maven Shade 插件的重命名工作流的支持

在 IntelliJ IDEA 2024.1 版本中，我们添加了备受期待的对 Maven Shade 插件重命名功能的支持。 现在，IntelliJ IDEA 可以识别重命名工作流，在使用着色 JAR 及其依赖项时提供准确的代码高亮显示和导航。

![从快速文档弹出窗口直接访问源文件](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Source_from_quick_doc.png)

### 从快速文档弹出窗口直接访问源文件

快速文档弹出窗口现在提供了一种下载源代码的简单方式。 现在，查看库或依赖项的文档并需要访问其源代码时，按 F1 即可。 更新后的弹出窗口将提供一个直接链接，您可以使用它来下载所需的源文件，简化了工作流。

![Maven 工具窗口中的 Maven 仓库](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Maven_repositories.png)

### Maven 工具窗口中的 *Maven* 仓库

Maven 仓库列表及其索引编制状态现在显示在 *Maven* 工具窗口中，而不是以前 Maven 设置中的位置。

### Gradle 版本支持更新

从这个版本开始，IntelliJ IDEA 不再支持使用低于 Gradle 版本 4.5 的项目，并且 IDE 不会对带有不支持的 Gradle 版本的项目执行 Gradle 同步。

## 5 运行/调试

![多语句的内联断点](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Inline_breakpoints_preview.png)

### 多语句的内联断点

IntelliJ IDEA 2024.1 为在包含 lambda 函数或 return 语句的行中的断点设置提供了更方便的工作流。 点击装订区域设置断点后，IDE 会自动显示可在其中设置额外断点的内联标记。 每个断点都可以独立配置，释放高级调试功能。

![调用堆栈中的折叠库调用](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_Folded_library_calls.png)

![调用堆栈中的折叠库调用](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_Folded_library_calls.png)

![调用堆栈中的折叠库调用](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_Folded_library_calls.png)

![调用堆栈中的折叠库调用](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_Folded_library_calls.png)

PreviousNext

- 
- 

### 调用堆栈中的折叠库调用

现在，库调用在 *Debug*（调试）工具窗口的调用堆栈中默认折叠，帮助您在浏览代码时保持专注。 但是，如果您需要验证库调用序列，可以展开组并相应地探索帧。 要显示列表，请使用工具栏中的 *Filter*（筛选器）图标或调用上下文菜单并禁用 *Hide Frames from Libraries*（在库中隐藏帧）选项。

![条件语句覆盖](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Branch_code_coverage_preview.png)

### 条件语句覆盖

版本 2024.1 使 IntelliJ IDEA 距离实现全面测试覆盖又近了一步。 这项更新的重点是确定测试未完全覆盖代码中的哪些条件语句。 现在，IntelliJ IDEA 既显示哪一行具有未覆盖的条件，还会指定未覆盖的条件分支或变量值。 这项功能默认启用，您可以在 *Settings/Preferences | Build, Execution, Deployment | Coverage*（设置/偏好设置 | 构建、执行、部署 | 覆盖率）进行控制。

![代码覆盖率设置移至主 IDE 设置](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Code_coverage_settings.png)

### 代码覆盖率设置移至主 IDE 设置

代码覆盖率设置已从 *Run Configuration*（运行配置）弹出窗口移至 *Settings/Preferences | Build, Execution, Deployment | Coverage*（设置/偏好设置 | 构建、执行、部署 | 覆盖率）。 经过这一改动，不必为每次测试运行单独更新配置即可选择覆盖率运行程序或启用高级功能，例如跟踪哪些测试覆盖特定代码行。

![JaCoCo 测试覆盖率报告的简化导入](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Test_coverage_reports_2_preview.png)

![JaCoCo 测试覆盖率报告的简化导入](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Test_coverage_reports_1.png)

![JaCoCo 测试覆盖率报告的简化导入](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Test_coverage_reports_2_preview.png)

![JaCoCo 测试覆盖率报告的简化导入](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Test_coverage_reports_1.png)

PreviousNext

- 
- 

### JaCoCo 测试覆盖率报告的简化导入

现在，可以更轻松地导入、浏览和分析 JaCoCo 运行程序在 CI/CD 管道中收集的代码覆盖率数据。 如果 *Coverage*（覆盖率）工具窗口中未显示报告，现在将显示用于导入 JaCoCo 报告的直接链接。 我们还更新了窗口的工具栏，添加了一个导入图标，这个图标允许您作为 `.exec` 文件检索 JaCoCo 报告。

## 6 框架和技术

![针对 Spring 的改进 Bean 补全和自动装配](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Enhanced_bean_completion_and_autowiring_spring_preview.png)

### 针对 Spring 的改进 Bean 补全和自动装配 Ultimate

IntelliJ IDEA Ultimate 现在为应用程序上下文中的所有 Bean 提供自动补全，并自动装配 Bean。 如果 Bean 通过构造函数自动装配依赖项，则相关字段也会通过构造函数自动装配。 同样，如果依赖项是通过字段或 Lombok 的 `@RequiredArgsConstructor` 注解注入，则新 Bean 会自动通过字段装配。

![增强的 Spring 图表](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_Spring_diagrams_icons.png)

![增强的 Spring 图表](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_call_Spring_diagrams_from_gutter.png)

![增强的 Spring 图表](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_Spring_diagrams_icons.png)

![增强的 Spring 图表](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_call_Spring_diagrams_from_gutter.png)

PreviousNext

- 
- 

### 增强的 Spring 图表 Ultimate

我们使 Spring 模型图表更易访问。 您可以使用 Bean 行标记或对 Spring 类使用意图操作 (⌥⏎) 进行调用。 我们为 Spring 图表引入了新的图标，增强了 Spring 原型（如组件、控制器、仓库和配置 Bean）的可视化。 此外，您现在可以方便地切换库中 Bean 的可见性（默认隐藏）。

![HTTP 客户端改进](https://www.jetbrains.com/idea/whatsnew/2024-1/img/4_new_HTTP_Cient_toolbar.png)

![HTTP 客户端改进](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_new_auth_options.png)

![HTTP 客户端改进](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_code_generation_for_token_retrieval.png)

![HTTP 客户端改进](https://www.jetbrains.com/idea/whatsnew/2024-1/img/3_HTTP_2_support.png)

![HTTP 客户端改进](https://www.jetbrains.com/idea/whatsnew/2024-1/img/4_new_HTTP_Cient_toolbar.png)

![HTTP 客户端改进](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_new_auth_options.png)

PreviousNext

- 
- 
- 
- 

### HTTP 客户端改进 Ultimate

版本 2024.1 中的 HTTP 客户端提供了更多身份验证选项，包括 PKCE 授权代码和设备授予流。 除了在 PKCE 请求期间自动处理用于令牌检索的 `code_challenge` 生成和 `code_verifier` 传递之外，它还支持令牌和身份验证请求的额外参数。 HTTP 客户端升级为 Netty 的底层网络库实现了 SSL、代理和 HTTP/2 支持，有助于促进 HTTP/2 的实现。 此外，HTTP 客户端的工具栏已经过重做，与新 UI 的风格保持一致，提供更加美观协调的外观。

![Search Everywhere（随处搜索）中的 Endpoints（端点）标签页](https://www.jetbrains.com/idea/whatsnew/2024-1/img/Endpoints_tab_in_SE.png)

### *Search Everywhere*（随处搜索）中的 *Endpoints*（端点）标签页 Ultimate

我们引入了在 URL 搜索结果相关的项目中出现的 *Endpoints*（端点）标签页，增强了 *Search Everywhere*（随处搜索）对话框。 目前，检测到项目中存在 Spring、Micronaut、Ktor 或 Quarkus 技术时，IDE 会自动包含此标签页。

![针对 HTTP 页眉的代码补全](https://www.jetbrains.com/idea/whatsnew/2024-1/img/code_completion_for_HTTP_headers_preview.png)

### 针对 HTTP 页眉的代码补全 Ultimate

现在，HTTP 页眉可以在所有常见场景中轻松补全 ，例如使用 Spring WebClient 和 REST Assured 测试。 遇到预期值时，补全弹出窗口会自动出现。

![优化的 JSON 架构处理](https://www.jetbrains.com/idea/whatsnew/2024-1/img/JSON_schema_optimization.png)

### 优化的 JSON 架构处理 Ultimate

我们优化了 JSON 架构验证和补全背后的代码。 因此，IDE 现在可以更快处理这些任务并减少内存消耗。 在使用 Azure Pipelines 的现实文件中，架构检查速度现在提高了 10 倍。

![Quarkus 更新](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_Quarkus_Dev_UI.png)

[![Quarkus 更新](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_Quarkus_run_config_settings_preview.png)](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_Quarkus_run_config_settings.png)

![Quarkus 更新](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_Quarkus_Dev_UI.png)

[![Quarkus 更新](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_Quarkus_run_config_settings_preview.png)](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_Quarkus_run_config_settings.png)

PreviousNext

- 
- 

### Quarkus 更新 Ultimate

我们为 Quarkus 运行配置引入了一个新的设置编辑器。 现在，*Run/Debug Configuration*（运行/调试配置）对话框为 Maven 和 Gradle 项目提供了改进的 UI，使用户可以轻松访问 *Run profile*（运行配置文件）和 *Environment variables*（环境变量）等常用设置。 您可以通过新增到 *Run*（运行）工具窗口工具栏的图标方便地访问 Quarkus Dev UI。

![对 OpenRewrite 的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/OpenRewrite_3.png)

![对 OpenRewrite 的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/OpenRewrite_1_preview.png)

![对 OpenRewrite 的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/OpenRewrite_2_preview.png)

![对 OpenRewrite 的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/OpenRewrite_3.png)

![对 OpenRewrite 的支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/OpenRewrite_1_preview.png)

PreviousNext

- 
- 
- 

### 对 OpenRewrite 的支持 Ultimate

IntelliJ IDEA Ultimate 2024.1 集成了 OpenRewrite，这将扩展 IDE 的现有重构功能，并为您提供一个用于提高代码质量、一致性和可维护性的工具包。 借助 OpenRewrite 的资源，您可以现代化遗留代码、优化性能并处理复杂的迁移任务，例如升级到新的 Spring Boot 版本。

![WireMock 服务器支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/WireMock_3_preview.png)

![WireMock 服务器支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/WireMock_completion.png)

![WireMock 服务器支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/WireMock_generate.png)

![WireMock 服务器支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/WireMock_3_preview.png)

![WireMock 服务器支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/WireMock_completion.png)

PreviousNext

- 
- 
- 

### WireMock 服务器支持 Ultimate

我们通过插件实现了 WireMock 支持，您可以从 IDE 内部安装或从 [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/23695-wiremock/) 获取。 此集成包括适用于 JSON 配置的架构补全、从 *Endpoints*（端点）工具窗口生成 WireMock 存根文件的功能，以及允许直接从编辑器启动服务器的内置运行配置。 新功能可让您快速创建测试数据服务器或存根，从而简化 Web UI 和微服务的开发。

![增强的 Terraform 支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/5_tftpl_preview.png)

![增强的 Terraform 支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_run_terraform_init_preview.png)

![增强的 Terraform 支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/2_support_terraform_providers_preview.png)

![增强的 Terraform 支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/3_terraform_providers_preview.png)

![增强的 Terraform 支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/4_tftpl.png)

![增强的 Terraform 支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/5_tftpl_preview.png)

![增强的 Terraform 支持](https://www.jetbrains.com/idea/whatsnew/2024-1/img/1_run_terraform_init_preview.png)



### 增强的 Terraform 支持 Ultimate

IntelliJ IDEA Ultimate 2024.1 带来了改进的 Terraform 支持，有助于简化创建、管理和扩展基础架构的流程。 现在，IDE 通过明确建议运行 `terraform init` 来简化初始化，并为超过 3,900 个第三方 Terraform 提供程序提供了扩展的代码补全功能。 此外，IDE 还引入了对 Terraform 模板语言 (tftpl) 的支持，实现动态模板，可以与您的首选编程语言无缝集成。 您可以在我们的[博文](https://blog.jetbrains.com/idea/2024/03/intellij-idea-2024-1-beta/#enhanced-terraform-support)中找到更多详细信息。

## 7 数据库工具

![数据编辑器中的本地筛选](https://www.jetbrains.com/idea/whatsnew/2024-1/img/IJFilter.png)

### 数据编辑器中的本地筛选 Ultimate

此版本在数据编辑器中引入了期待已久的本地筛选功能。 现在，您可以根据列值快速筛选行，而无需向数据库发送查询。 这种本地方式只影响当前页面，但如果需要扩大作用域，可以调整页面大小或提取所有数据。 要禁用所有本地筛选器，请取消选择指定的 *Enable Local Filter*（启用本地筛选器）图标。

![会话简化](https://www.jetbrains.com/idea/whatsnew/2024-1/img/IJSessions.png)

### 会话简化 Ultimate

IntelliJ IDEA Ultimate 2024.1 消除了手动选择会话的需求，从而简化查询执行。 要附加文件，您只需选择数据源，而不是会话。 此外，启动函数不再需要选择会话，您现在可以选择直接从控制台或文件运行函数。 这些更改旨在最大限度地缩短工具的学习曲线，减少不必要的步骤并增强整体实用性。