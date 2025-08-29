# 告别Vibe编程：Kiro让你的代码一次成型！

## 0 前言

Kiro，一个专为 vibe coding 应用带来结构的 IDE，默认内置规范驱动开发。

Amazon 刚发布 [Kiro IDE](https://kiro.dev/)。这是他们自己的开发平台，专为 vibe coding 应用带来结构而设计，默认内置规范驱动开发。

这个想法是为了让 vibe coding 应用更易进入生产环境——这是大多数 vibe coding 平台目前仍难解决的问题。

但真正让我对这个新 IDE 感兴趣的是：Kiro 由 Claude 4 Sonnet 驱动。

Anthropic 的 Claude 4 Sonnet 和 Opus 基本上是当前 AI 模型的佼佼者。将它们内置到 Kiro 中对于 vibe coder 来说非常有趣。它本质上会自动将软件工程最佳实践应用到 vibe-coding 工作流程中，帮助为应用开发带来结构和更有组织的方法。

看看有啥特殊功能。

## 1 啥是 Kiro？

一个 AI 驱动的 IDE，专为"vibe coding"而设计，但远不止于此。优势在于通过规范和钩子等功能将这些原型转化为生产系统。

Kiro 规范和钩子：

![](https://miro.medium.com/v2/resize:fit:700/0*ZxpP0509W34oQpcg.png)

- **Kiro 规范**，助你更好规划和理解你的应用。对于思考功能、重构和澄清系统行为很有用。还指导 AI 代理做出更智能的实现决策。
- **Kiro 钩子**，就像有个高级开发在背后看着你。它们在后台自动化任务，如处理样板代码或在你保存、创建或删除文件时捕获问题或手动触发它们。

Kiro将单个提示转化为完整功能的规范、技术设计和任务分解来简化开发。如输入"添加评论系统"会生成具有边缘情况覆盖的用户故事，然后自动构建包括数据流、API 和数据库模式的设计文档。

![](https://p.ipic.vip/m8iml4.gif)

它还会创建一个考虑单元测试、响应性和可访问性的序列化任务列表。

Design documentation in Kiro specs：

![](https://kiro.dev/videos/spec-task.gif?h=9b8631a7)

构建时，钩子就像一个同行开发者——自动化诸如测试文件更新、刷新文档、扫描问题和执行代码标准等事情。一旦设置，钩子会在文件事件（如保存或提交）时运行，帮助团队以最少的努力维护质量和一致性。

Kiro 还支持 MCP 和自主代理，所以它在 vibe coding 场景中并不感觉像新手。感觉比 Cursor 或 Windsurf 更先进，因为 Amazon 在这个 IDE 中打包了所有功能。

## 2 安装Kiro

前往 [kiro.dev](https://kiro.dev/downloads/) 并根据硬件和操作系统下载安装文件： 

![](https://p.ipic.vip/rt4xpd.png)

下载完成后，在你的系统上安装应用程序并启动它。这是初始仪表板的样子。

![](https://miro.medium.com/v2/resize:fit:700/1*b-cQIBT5M9-pT-YhCVRfFQ.png)

有多种方式可以登录 Kiro，但建议用 AWS 账户。由于 Kiro 可能最终会更深地集成到 AWS 工具中，提前链接你的账户可能会让以后的事情更易。

Kiro 建立在 VS Code 之上，可立即导入现有的配置： 

![](https://p.ipic.vip/uc3vod.png)

建议在终端中设置 Kiro。这会将 Kiro 添加到你的系统 PATH 中，允许你从终端全局打开它，而不必每次都从应用程序文件夹中查找。

![](https://miro.medium.com/v2/resize:fit:700/1*WnOrlcq7bURan9QMUxiZFQ.png)

用户界面仍然感觉很像 VS Code，只是有一些视觉调整来匹配 Amazon 的颜色主题。

![](https://miro.medium.com/v2/resize:fit:700/1*vBSpeYKw_hQAwxWsbuaR3A.png)

Kiro IDE界面功能：

![](https://kiro.dev/images/kiro-interface.png?h=e45b3fcf)

### 编辑器

代码编写和编辑的核心工作区。功能包括：

- 多种语言的语法高亮
- 行号和错误指示器
- 代码折叠以便更好地组织
- 多个标签页用于跨文件工作
- 分屏视图支持并排编辑

### 聊天面板

你可以使用聊天面板来：

- 询问有关代码的问题
- 请求代码生成或修改
- 获得调试和故障排除帮助
- 请求代码审查和优化建议
- 使用 # 命令包含上下文（例如，#File、#Folder）
- 生成样板代码和模板

要将聊天面板移动到IDE的另一侧：

在顶部菜单栏中，选择 视图 > 外观 > 将主侧边栏移到右侧。

### 视图

侧边栏包含几个专门的视图：

- **资源管理器** - 导航项目文件结构，查看Git状态指示器，并访问规范和MCP服务器的特殊部分。

- **搜索** - 在整个项目中执行全局搜索和替换操作。

- **源代码管理** - 管理Git操作，查看更改并处理提交。

- **运行和调试** - 在调试会话期间查看变量、调用堆栈和管理断点。

- **扩展** - 安装和管理IDE扩展。

- **Kiro** - AI特定功能的专用视图：
  - 规范概览和管理
  - 代理钩子管理
  - 代理指导配置
  - MCP服务器

### 状态栏

位于界面底部，状态栏提供：

- 当前文件信息
- Git分支和同步状态
- 错误和警告计数
- 代理状态指示器

### 命令面板

通过按 Cmd+Shift+P（Mac）或 Ctrl+Shift+P（Windows/Linux）快速访问Kiro的命令来：

- 执行常见操作
- 访问MCP工具
- 配置设置
- 运行代理钩子

### 导航技巧

- 使用键盘快捷键进行更快的导航
- 利用命令面板快速访问功能
- 固定常用文件以便轻松访问
- 使用分屏视图比较或引用代码
- 配置工作区设置以获得个性化体验

## 3 Kiro 如何工作

规范驱动开发保持 vibe coding 的速度和创造力，但添加了通常缺失的结构。

纯 vibe coding 的最大问题之一是它需要太多的来回交流，特别是在处理复杂功能或大型代码库时。AI 易失去上下文或误解你提示背后的意图。Kiro 通过在编写任何代码之前从规范开始来解决这个问题。

打开一个项目并点击 Kiro 标签。在右侧面板上，你会看到一个聊天界面，可在"Vibe"或"Spec"之间选择。选择 Spec，然后开始描述你希望 AI 处理的任务。

在我的情况下，我有一个想要升级的角色创建页面。当前的设置只是使用纯文本字段进行物理描述。我想用开关和下拉菜单替换它，为用户提供更视觉化和结构化的输入方法。

![](https://miro.medium.com/v2/resize:fit:700/1*7Yzn42Wf-68b_iKNuZGprQ.png)

发送给 Kiro 的完整提示：

```vbnet
In the #character-form-modal.tsx can you help me improve the way the user sets the physical description of the character? 
Instead of simple text description, I want to show toggles and dropdowns. Here are the selectable menus:
- Race: Asian (default), White, Black, Hispanic
- Gender: Boy, Girl (default)
- Age: (must be a number between 1–100, default at 8)
- Body: Slim, average (default), chubby
- Hair length: Short, normal (default), long
- Hair color: Black (default), blonde, red, brown, gold, white
- Shirt color: red, blue, yellow, pink, black, white (default)
- Short color: red (default), blue, yellow, pink, black, white
- Shoes color: red, blue (default), yellow, pink, black, white
- Others: a text field for other physical attributes
Organize the components in the modal screen with a nice and modern look and feel. 
When the user clicks on the "Create Character" or "Update Character" button, combine all the physical attributes into a single string and save it to the database.
```

Kiro 做的第一件事是为功能增强创建规范表。它被保存在仪表板的规范部分下，格式为 markdown。

![](https://miro.medium.com/v2/resize:fit:700/1*Atu1KGUs9FHGD76qgD858g.png)

以下是规范表的内容：

```vbnet
## Introduction

This feature enhances the character creation and editing form by replacing the free-text physical description field with structured, selectable attributes. Users will be able to define their character's appearance through organized dropdowns, toggles, and input fields, providing a more guided and consistent character creation experience.

## Requirements

### Requirement 1

**User Story:** As a user creating or editing a character, I want to select physical attributes from predefined options, so that I can quickly and consistently define my character's appearance.

#### Acceptance Criteria

1. WHEN the character form modal opens THEN the system SHALL display structured physical attribute controls instead of a single text area
2. WHEN a user selects physical attributes THEN the system SHALL provide the following options:
   - Race dropdown with options: Asian (default), White, Black, Hispanic
   - Gender selection with options: Boy, Girl (default)
   - Age input field accepting numbers between 1-100 (default: 8)
   - Body type dropdown with options: Slim, Average (default), Chubby
   - Hair length dropdown with options: Short, Normal (default), Long
   - Hair color dropdown with options: Black (default), Blonde, Red, Brown, Gold, White
   - Shirt color dropdown with options: Red, Blue, Yellow, Pink, Black, White (default)
   - Shorts color dropdown with options: Red (default), Blue, Yellow, Pink, Black, White
   - Shoes color dropdown with options: Red, Blue (default), Yellow, Pink, Black, White
   - Others text field for additional physical attributes
3. WHEN the user submits the form THEN the system SHALL combine all selected physical attributes into a single descriptive string
4. WHEN the form is submitted THEN the system SHALL save the combined physical description to the database in the existing physicalDescription field

### Requirement 2

**User Story:** As a user editing an existing character, I want the form to pre-populate with the character's current physical attributes, so that I can modify specific aspects without losing existing information.

#### Acceptance Criteria

1. WHEN editing an existing character THEN the system SHALL attempt to parse the existing physicalDescription field
2. IF the existing description cannot be parsed into structured attributes THEN the system SHALL display default values and preserve the original text in the "Others" field
3. WHEN the form loads with an existing character THEN the system SHALL pre-select the appropriate dropdown values based on the character's current physical description

### Requirement 3

**User Story:** As a user interacting with the character form, I want the physical attributes section to have a modern and organized layout, so that the form is easy to navigate and visually appealing.

#### Acceptance Criteria

1. WHEN the physical attributes section is displayed THEN the system SHALL organize controls in a logical grid layout
2. WHEN displaying the physical attributes THEN the system SHALL group related attributes together (e.g., hair attributes, clothing attributes)
3. WHEN the form is rendered THEN the system SHALL maintain the existing modal styling and dark theme
4. WHEN the user interacts with the controls THEN the system SHALL provide clear visual feedback and maintain accessibility standards

### Requirement 4

**User Story:** As a user, I want age validation to prevent invalid entries, so that character creation remains consistent and error-free.

#### Acceptance Criteria

1. WHEN a user enters an age value THEN the system SHALL validate that the value is between 1 and 100
2. IF an invalid age is entered THEN the system SHALL display an error message and prevent form submission
3. WHEN the age field loses focus with an invalid value THEN the system SHALL reset to the default value of 8
```

我对计划的详细程度印象深刻。它将任务分解为四个明确的需求，每个都有用户故事和详细的验收标准。它包含了我要求的一切——从 UI 应该如何看起来到年龄验证应该如何行为。它甚至添加了解析和保留旧数据的逻辑。

审查后，我点击了"进入设计阶段"。以下是最终设计文档的样子：

~~~markdown
# Design Document
## Overview
This design transforms the character form modal's physical description from a free-text textarea into a structured interface with organized dropdowns, inputs, and controls. The enhancement maintains the existing dark theme and modern styling while providing users with guided character creation through predefined attribute options.
## Architecture
### Component Structure
The enhanced character form modal will maintain its existing structure but replace the physical description textarea with a new `PhysicalAttributesSection` component that contains:
- **Attribute Controls**: Individual form controls for each physical attribute
- **State Management**: Local state for each attribute with default values
- **String Generation**: Logic to combine attributes into a descriptive string
- **Parsing Logic**: Ability to parse existing descriptions back into structured data
### Data Flow
1. **Form Load**: Parse existing `physicalDescription` string into individual attributes
2. **User Interaction**: Update individual attribute states as user makes selections
3. **Form Submission**: Combine all attributes into a single descriptive string
4. **Database Storage**: Save combined string to existing `physicalDescription` field
## Components and Interfaces
### Physical Attributes Interface
```typescript
interface PhysicalAttributes {
  race: 'Asian' | 'White' | 'Black' | 'Hispanic';
  gender: 'Boy' | 'Girl';
  age: number;
  body: 'Slim' | 'Average' | 'Chubby';
  hairLength: 'Short' | 'Normal' | 'Long';
  hairColor: 'Black' | 'Blonde' | 'Red' | 'Brown' | 'Gold' | 'White';
  shirtColor: 'Red' | 'Blue' | 'Yellow' | 'Pink' | 'Black' | 'White';
  shortsColor: 'Red' | 'Blue' | 'Yellow' | 'Pink' | 'Black' | 'White';
  shoesColor: 'Red' | 'Blue' | 'Yellow' | 'Pink' | 'Black' | 'White';
  others: string;
}
```
### Default Values
```typescript
const DEFAULT_ATTRIBUTES: PhysicalAttributes = {
  race: 'Asian',
  gender: 'Girl',
  age: 8,
  body: 'Average',
  hairLength: 'Normal',
  hairColor: 'Black',
  shirtColor: 'White',
  shortsColor: 'Red',
  shoesColor: 'Blue',
  others: ''
};
```
### Layout Design
#### Grid Organization
The physical attributes section will use a responsive grid layout:
```
┌─────────────────────────────────────────────────────────┐
│                Physical Appearance                       │
├─────────────────────────────────────────────────────────┤
│  [Race ▼]        [Gender ▼]       [Age: 8    ]         │
│                                                         │
│  [Body ▼]        [Hair Length ▼]  [Hair Color ▼]       │
│                                                         │
│  [Shirt Color ▼] [Shorts Color ▼] [Shoes Color ▼]      │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Others: Additional attributes...                    │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```
#### Visual Grouping
- **Basic Info**: Race, Gender, Age (top row)
- **Physical Build**: Body type, Hair attributes (middle row)  
- **Clothing**: Shirt, Shorts, Shoes colors (bottom row)
- **Additional**: Others text field (separate section)
### Styling Specifications
#### Section Header
- Title: "Physical Appearance" with icon
- Consistent with existing form section styling
- Subtle border/separator from other sections
#### Form Controls
- **Dropdowns**: Use existing Select component with dark theme
- **Age Input**: Number input with validation styling
- **Others Field**: Textarea matching existing form styling
- **Grid**: 3-column responsive layout on larger screens, stacked on mobile
#### Color Coding
- Maintain existing color scheme (blue-purple gradients)
- Use subtle background variations for different attribute groups
- Error states for invalid age input
## Data Models
## Error Handling
### Age Validation
- **Range Check**: Validate 1-100 range on input
- **Type Check**: Ensure numeric input only
- **Reset Logic**: Auto-reset to default (8) on invalid input
- **Visual Feedback**: Red border and error message for invalid values
### Form Submission
- **Required Fields**: Maintain existing validation for name and description
- **Attribute Validation**: Ensure all dropdowns have valid selections
- **Fallback Handling**: If attribute parsing fails, preserve original description
### Backward Compatibility
- **Existing Characters**: Parse what's possible, preserve rest in "Others"
- **Migration Strategy**: No database changes required
- **Graceful Degradation**: System works with both structured and unstructured descriptions
## Testing Strategy
### Unit Tests
- **String Generation**: Test all attribute combinations produce valid descriptions
- **Parsing Logic**: Test parsing of various description formats
- **Validation**: Test age input validation edge cases
- **Default Values**: Verify correct defaults are applied
### Integration Tests
- **Form Submission**: Test complete form flow with new attributes
- **Character Editing**: Test loading and updating existing characters
- **API Integration**: Verify data flows correctly to backend
### Visual Tests
- **Layout Responsiveness**: Test grid layout on different screen sizes
- **Theme Consistency**: Verify dark theme styling matches existing components
- **Accessibility**: Test keyboard navigation and screen reader compatibility
### User Experience Tests
- **Form Flow**: Test complete character creation process
- **Error Handling**: Test validation feedback and error recovery
- **Performance**: Ensure form remains responsive with new controls
~~~

![](https://miro.medium.com/v2/resize:fit:700/1*If1f7r4z-c6X9CqlFVk6HA.png)

再次花时间审查设计文档，看看 AI 在哪些部分不正确。进行最终更改，然后点击"进入实施计划"按钮。

Kiro 现在将创建实施计划。在我们的示例中，AI 将在源代码中执行12组更改。

```markdown
# Implementation Plan

- [ ] 1. Create physical attributes interface and utility functions
  - Define TypeScript interface for PhysicalAttributes with all required properties
  - Create default values constant with specified defaults
  - Implement string generation function to combine attributes into description
  - Write basic parsing function to extract attributes from existing descriptions
  - _Requirements: 1.2, 4.1_

- [ ] 2. Create PhysicalAttributesSection component
  - Build new React component to house all physical attribute controls
  - Implement responsive grid layout with proper spacing and grouping
  - Add section header with icon and styling consistent with existing form
  - Create proper TypeScript props interface for the component
  - _Requirements: 1.2, 3.1, 3.2, 3.3_

- [ ] 3. Implement individual attribute controls
  - Create race dropdown with Select component (Asian, White, Black, Hispanic)
  - Create gender dropdown with Select component (Boy, Girl)
  - Create body type dropdown with Select component (Slim, Average, Chubby)
  - Create hair length dropdown with Select component (Short, Normal, Long)
  - Create hair color dropdown with Select component (Black, Blonde, Red, Brown, Gold, White)
  - _Requirements: 1.2, 3.4_

- [ ] 4. Implement clothing attribute controls
  - Create shirt color dropdown with Select component (Red, Blue, Yellow, Pink, Black, White)
  - Create shorts color dropdown with Select component (Red, Blue, Yellow, Pink, Black, White)
  - Create shoes color dropdown with Select component (Red, Blue, Yellow, Pink, Black, White)
  - Apply consistent styling and spacing to all clothing dropdowns
  - _Requirements: 1.2, 3.4_

- [ ] 5. Implement age input with validation
  - Create number input field for age with proper styling
  - Add input validation to enforce 1-100 range
  - Implement error display for invalid age values
  - Add auto-reset to default value (8) when invalid input is detected
  - Create proper error styling consistent with existing form theme
  - _Requirements: 1.2, 4.1, 4.2, 4.3_

- [ ] 6. Create others text field
  - Implement textarea for additional physical attributes
  - Apply consistent styling with existing form textareas
  - Add proper placeholder text and labeling
  - _Requirements: 1.2, 3.4_

- [ ] 7. Integrate PhysicalAttributesSection into character form modal
  - Replace existing physical description textarea with new PhysicalAttributesSection
  - Add state management for all physical attributes in main component
  - Implement proper state initialization with default values
  - Wire up all attribute change handlers
  - _Requirements: 1.1, 2.1, 3.3_

- [ ] 8. Implement attribute parsing for existing characters
  - Add logic to parse existing physicalDescription into structured attributes
  - Handle cases where parsing fails by preserving original text in others field
  - Ensure proper fallback to default values when attributes cannot be determined
  - Test parsing with various description formats
  - _Requirements: 2.1, 2.2_

- [ ] 9. Implement string generation on form submission
  - Modify form submission handler to generate description string from attributes
  - Combine all selected attributes into coherent descriptive text
  - Ensure generated string maintains proper grammar and readability
  - Preserve any additional text from others field in final description
  - _Requirements: 1.3, 1.4_

- [ ] 10. Add responsive styling and theme consistency
  - Implement responsive grid layout that works on mobile and desktop
  - Apply dark theme styling consistent with existing modal
  - Add proper spacing, borders, and visual grouping
  - Ensure all controls match existing form component styling
  - Test layout on different screen sizes
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 11. Write unit tests for utility functions
  - Create tests for string generation function with various attribute combinations
  - Write tests for parsing function with different description formats
  - Add tests for age validation logic
  - Test default value application and edge cases
  - _Requirements: 1.2, 1.3, 4.1_

- [ ] 12. Test complete form integration
  - Test character creation flow with new physical attributes section
  - Test character editing flow with existing characters
  - Verify form submission works correctly with generated description strings
  - Test error handling and validation feedback
  - Ensure backward compatibility with existing character data
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 4.2_
```

![](https://miro.medium.com/v2/resize:fit:700/1*9F3kCIi2QhsHh_Bq317TPg.png)

一旦你对计划满意，点击"最终确定任务列表"按钮来最终确定规范表。

对于下一步，我们现在可以通过打开 `tasks.md` 文件并点击任何任务项目旁边的"开始任务"来开始实施每个任务。

![](https://miro.medium.com/v2/resize:fit:700/1*ApCFdL7OzpoUM8uajJnK3w.png)

完成后，任务项目将被标记为已完成。你可以通过点击"查看更改"按钮来检查代码差异。所有执行日志也将显示在聊天面板上。

![](https://miro.medium.com/v2/resize:fit:700/1*w_xbiZOa-tfzVZBC9hssKQ.png)

继续执行其余任务。一旦所有任务项目都标记为已完成，检查 Web 应用程序以查看更改是否按预期工作。

![](https://miro.medium.com/v2/resize:fit:700/1*EoOFjuXCkHYJ017WGDJZoA.png)

UI 与我提示中描述的所有内容匹配，当我点击生成角色按钮时，数据会存储在数据库中。

计划的一部分是测试阶段。Kiro 运行了示例输入，解析它们，并检查准确性。

![](https://miro.medium.com/v2/resize:fit:700/1*-4gV2jHGtwpGbnYvBhjIdg.png)

```yaml
Test 5: Complex description
Description: "A chubby 15-year-old African American girl with flowing red hair, wearing yellow sneakers and a black top"
Parsed attributes: {
  age: 15,
  race: 'Black',
  gender: 'Girl',
  body: 'Chubby',
  hairColor: 'Red',
  shirtColor: 'Black',
  shoesColor: 'Yellow'
}
Parsing successful: true
❌ Expected hairLength: Long, got: undefined
---

Test 6: Unparseable description
Description: "A mysterious character with unique features and special abilities"
Parsed attributes: {}
Parsing successful: undefined
✅ Expected no parsing (unparseable description)
---
```

每次在测试中遇到错误时，Kiro 都会执行修复。

## 4 Kiro 由 Claude 驱动

Kiro 由 Anthropic 的 Claude 模型驱动，目前在测试版中免费。

这是现在尝试它的最好原因之一。Claude 4 Sonnet 很昂贵，大多数平台要么限制其使用，要么将其隐藏在更高级别后面。例如，Cursor 悄悄地引入了使用限制，这使得每月20美元的计划对许多开发者来说无法使用。

其他 vibe coding 工具如 Windsurf 或 Cline 也不提供对 Claude 模型的免费访问。你要么自带密钥，要么付费使用。

在 Kiro 中，你可以在 Claude Sonnet 4.0 或 3.7 之间选择。只需前往设置 > 工作区并选择你想要的模型。

![](https://miro.medium.com/v2/resize:fit:700/1*PHfKbAuK4Uo9Vu-pi6BkyQ.png)

目前，Kiro 仍处于预览阶段，所以你可以免费尝试它，具有慷慨的使用限制。在[定价页面](https://kiro.dev/pricing/)上查看更多详细信息。

![](https://miro.medium.com/v2/resize:fit:700/1*Gup3CquGHhYhP-EudEt00A.png)

最新版价格：

![](https://p.ipic.vip/q4k3h8.png)

- 免费层让你访问所有核心功能，包括规范、代理钩子、MCP 支持和代理指导——但每月限制在50次 AI 交互。
- 一旦付费计划推出，将有两个选项：每月19美元的 Kiro Pro，每月交互限制为1,000次，以及每月39美元的 Kiro Pro+，将这一数字提高到3,000次交互。

所有层级都包含相同的核心功能。唯一的区别是你获得多少 AI 使用量。

## 5 最终想法

我印象深刻的是，Kiro 从我的提示中做出的所有代码更改在前端和后端都一次性工作。无需后续提示。

就开发体验而言，在进行实际代码更改之前创建规范会减慢你的速度。

如果你打算进行小修复或小代码更新，你不需要使用规范功能。直接要求 AI 进行代码更改。Claude 4 模型足够聪明，可以弄清楚哪个文件和哪行代码需要更新。

但是如果你正在处理大型功能实施或主要代码重构，这种"编码前计划"方法绝对有用。作为一个已经 vibe coding 一年多的人，有时 AI 会误解请求并最终浪费我宝贵的积分。

我注意到的另一件事是响应速度的不一致。有时 AI 似乎陷入无限循环，因为它没有响应。不过我们需要理解，这是一个初始版本，很多人同时使用它。

无论如何，Kiro 是一个真正好的平台，为 vibe coding 体验提供了新的视角。我很好奇其他开发者对规范和钩子功能的看法。对我来说，这是避免与 AI 误解的好方法，同时也有更清洁和更有组织的代码库。