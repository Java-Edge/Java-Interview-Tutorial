# 22-设计Element UI表单组件居然如此简单！

## 0 前言

上文讲解了Jest框架对组件库测试，TypeScript和Jest都为代码质量和研发效率。之前实现Container和Button组件以渲染功能为主，可根据不同属性渲染不同样式去实现布局和不同格式的按钮。

本文的表单组件，除了要渲染页面组件，还支持很好页面交互，从Element3的表单组件开始。

## 1 表单组件

[Element表单组件](https://e3.shengxinjing.cn/#/component/form) 页面里，可见表单种类的组件类型很多，输入框、单选框和评分组件等都算表单组件系列。

Element3官方演示表单的Template，整体表单页面分三层：

- el-form负责最外层的表单容器
- el-form-item负责每个输入项的label和校验管理
- el-input或el-switch负责具体的输入组件

```xml
<el-form
  :model="ruleForm"
  :rules="rules"
  ref="form"
  label-width="100px"
  class="demo-ruleForm"
>
  <el-form-item label="活动名称" prop="name">
    <el-input v-model="ruleForm.name"></el-input>
  </el-form-item>
  <el-form-item label="活动区域" prop="region">
    <el-select v-model="ruleForm.region" placeholder="请选择活动区域">
      <el-option label="区域一" value="shanghai"></el-option>
      <el-option label="区域二" value="beijing"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item label="即时配送" prop="delivery">
    <el-switch v-model="ruleForm.delivery"></el-switch>
  </el-form-item>
  <el-form-item label="活动性质" prop="type">
    <el-checkbox-group v-model="ruleForm.type">
      <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
      <el-checkbox label="地推活动" name="type"></el-checkbox>
      <el-checkbox label="线下主题活动" name="type"></el-checkbox>
      <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
    </el-checkbox-group>
  </el-form-item>
  <el-form-item label="特殊资源" prop="resource">
    <el-radio-group v-model="ruleForm.resource">
      <el-radio label="线上品牌商赞助"></el-radio>
      <el-radio label="线下场地免费"></el-radio>
    </el-radio-group>
  </el-form-item>
  <el-form-item label="活动形式" prop="desc">
    <el-input type="textarea" v-model="ruleForm.desc"></el-input>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="submitForm('ruleForm')"
      >立即创建</el-button
    >
    <el-button @click="resetForm('ruleForm')">重置</el-button>
  </el-form-item>
</el-form>
```

把上面代码简化为最简单形式，只留el-input作输入项，可清晰看到表单组件工作的模式：

- el-form组件使用:model提供数据绑定；使用rules提供输入校验规则，规范用户的输入内容
- el-form-item作为输入项的容器，对输入进行校验，显示错误信息

```xml
<el-form :model="ruleForm" :rules="rules" ref="form">
  <el-form-item label="用户名" prop="username">
    <el-input v-model="ruleForm.username"></el-input>
    <!-- <el-input :model-value="" @update:model-value=""></el-input> -->
  </el-form-item>
  <el-form-item label="密码" prop="passwd">
    <el-input type="textarea" v-model="ruleForm.passwd"></el-input>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="submitForm()">登录</el-button>
  </el-form-item>
</el-form>
```

## rules和model工作流程

用reactive返回用户输入的数据，username和passwd输入项对应，然后rules使用reactive包裹用户输入项校验的配置。

具体校验规则，主流用async-validator库，详细校验规则访问 [async-validator的官网](https://github.com/yiminghe/async-validator)。而表单Ref上额外新增一个validate方法，执行所有的校验逻辑来显示用户的报错信息，下图即用户输入不符合rules配置后，页面的报错提示效果。

```typescript
const ruleForm = reactive<UserForm>({
  username:"",
  passwd:""
})

// 1. 定义验证规则
const rules = reactive({
  rules: {
    username: { required: true,min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
    passwd: [{ required: true, message: '密码', trigger: 'blur' }]
  }
})

function submitForm() {
  form.value.validate((valid) => {
    if (valid) {
      alert('submit!')
    } else {
      console.log('error submit!!')
      return false
    }
  })
}
```

![](https://my-img.javaedge.com.cn/javaedge-blog/2024/12/a30dd03b01d041028a3ae4c088cc7796.png)

## 表单组件实现

进入src/components目录，新建Form.vue去实现el-form组件，该组件是整个表单组件的容器，负责管理每一个el-form-item组件的校验方法，自身还提供一个检查所有输入项的validate方法。

如下代码注册了传递的属性的格式，并注册了validate方法使其对外暴露使用：

```typescript
interface Props {
  label?: string
  prop?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  prop: ""
})

const formData = inject(key)

const o: FormItem = {
  validate,
}

defineExpose(o)
```

在 el-form 组件中咋管理el-form-item组件？

新建FormItem.vue文件，该组件加载完毕后去通知el-form组件自己加载完毕，在el-form中就可使用数组管理所有内部的form-item组件。

```typescript
import { emitter } from "../../emitter"
const items = ref<FormItem[]>([])

emitter.on("addFormItem", (item) => {
  items.value.push(item)
})
```

然后el-form-item还要负责管理内部的input输入标签，并且从form组件中获得配置的rules，通过rules的逻辑，来判断用户的输入值是否合法。

el-form还要管理当前输入框的label，看看输入状态是否报错，以及报错的信息显示，这是一个承上启下的组件。

```typescript
onMounted(() => {
  if (props.prop) {
    emitter.on("validate", () => {
      validate()
    })
    emitter.emit("addFormItem", o)
  }
})
function validate() {
  if (formData?.rules === undefined) {
    return Promise.resolve({ result: true })
  }
  const rules = formData.rules[props.prop]
  const value = formData.model[props.prop]
  const schema = new Schema({ [props.prop]: rules })
  return schema.validate({ [props.prop]: value }, (errors) => {
    if (errors) {
      error.value = errors[0].message || "校验错误"
    } else {
      error.value = ""
    }
  })
}

```

form、form-item和input三组件之间是 **嵌套使用** 关系：

- form提供了所有的数据对象和配置规则
- input负责具体的输入交互
- form-item负责中间的数据和规则管理及显示具体的报错信息

这就需要一个强有力的组件通信机制，Vue的

## 组件之间的通信

### 父子组件通信

通过props和emits来通信。父元素通过props把需要的数据传递给子元素，子元素通过emits通知父元素内部的变化，并且还可以通过defineDepose的方式暴露给父元素方法，可以让父元素调用自己的方法。

#### form和input组件咋通信？

这种祖先元素和后代元素，中间可能嵌套很多层关系，Vue提供provide、inject API。

在组件中可用provide函数向所有子组件提供数据，子组件内部通过inject注入使用。provide提供的只是普通数据，未做响应式处理，若子组件内部需响应式数据，需在provide函数内部用ref或reative包裹。

prvide和inject的类型系统，可用Vue的InjectiveKey声明。在form目录下新建type.ts专门管理表单组件用到的相关类型。

如下定义了表单form和表单管理form-item的上下文，并通过InjectionKey管理提供的类型。

```typescript
import { InjectionKey } from "vue"
import { Rules, Values } from "async-validator"

export type FormData = {
  model: Record<string, unknown>
  rules?: Rules
}

export type FormItem = {
  validate: () => Promise<Values>
}

export type FormType = {
  validate: (cb: (isValid: boolean) => void) => void
}

export const key: InjectionKey<FormData> = Symbol("form-data")
```

而如下代码通过provide向所有子元素提供form组件的上下文。子组件内部通过inject获取，很多组件都是嵌套成对出现。

```typescript
provide(key, {
  model: props.model,
  rules?: props.rules,
})

# 子组件
const formData = inject(key)
```

### input实现逻辑

下面代码，input 的核心逻辑就是对v-model支持。

v-mode是:mode-value="x"和@update:modelValute两个写法简写，组件内部获取对应的属性和modelValue方法即可。

需关注的代码是我们输入完成之后的事件，输入的结果校验是由父组件el-form-item来实现的，只需通过emit对外广播。

```vue
<template>
  <div
    class="el-form-item"
  >
    <label
      v-if="label"
    >{{ label }}</label>
    <slot />
    <p
      v-if="error"
      class="error"
    >
      {{ error }}
    </p>
  </div>
</template>
<script lang="ts">
export default{
  name:'ElFormItem'
}
</script>

<script setup lang="ts">
import Schema from "async-validator"
import { onMounted, ref, inject } from "vue"
import { FormItem, key } from "./type"
import { emitter } from "../../emitter"

interface Props {
  label?: string
  prop?: string
}
const props = withDefaults(defineProps<Props>(), { label: "", prop: "" })
// 错误
const error = ref("")

const formData = inject(key)

const o: FormItem = {
  validate,
}

defineExpose(o)

onMounted(() => {
  if (props.prop) {
    emitter.on("validate", () => {
      validate()
    })
    emitter.emit("addFormItem", o)
  }
})

function validate() {
  if (formData?.rules === undefined) {
    return Promise.resolve({ result: true })
  }
  const rules = formData.rules[props.prop]
  const value = formData.model[props.prop]
  const schema = new Schema({ [props.prop]: rules })
  return schema.validate({ [props.prop]: value }, (errors) => {
    if (errors) {
      error.value = errors[0].message || "校验错误"
    } else {
      error.value = ""
    }
  })
}
</script>

<style lang="scss">
@import '../styles/mixin';
@include b(form-item) {
  margin-bottom: 22px;
  label{
    line-height:1.2;
    margin-bottom:5px;
    display: inline-block;
  }
  & .el-form-item {
    margin-bottom: 0;
  }
}
.error{
  color:red;
}
</style>
```

点击按钮时，在最外层的form标签内部会对所有的输入项进行校验。由于我们管理着所有的form-item，只需要遍历所有的form-item，依次执行即可。

下面的代码就是表单注册的validate方法，我们遍历全部的表单输入项，调用表单输入项的validate方法，有任何一个输入项有报错信息，整体的校验就会是失败状态。

```typescript
function validate(cb: (isValid: boolean) => void) {
  const tasks = items.value.map((item) => item.validate())
  Promise.all(tasks)
    .then(() => { cb(true) })
    .catch(() => { cb(false) })
}
```

上面代码实际执行的是每个表单输入项内部的validate方法，这里我们使用的就是async-validate的校验函数。在validate函数内部，我们会获取表单所有的ruls，并且过滤出当前输入项匹配的输入校验规则，然后通过AsyncValidator对输入项进行校验，把所有的校验结果放在model对象中。如果errors\[0\].message非空，就说明校验失败，需要显示对应的错误消息，页面输入框显示红色状态。

```javascript
import Schema from "async-validator"

function validate() {
  if (formData?.rules === undefined) {
    return Promise.resolve({ result: true })
  }
  const rules = formData.rules[props.prop]
  const value = formData.model[props.prop]
  const schema = new Schema({ [props.prop]: rules })
  return schema.validate({ [props.prop]: value }, (errors) => {
    if (errors) {
      error.value = errors[0].message || "校验错误"
    } else {
      error.value = ""
    }
  })
}
```

## 总结

本文设计实现了复杂的组件类型——表单组件。在组件库中作用，就是收集和获取用户的输入值，并提供用户的输入校验，如输入长度、邮箱格式等，符合校验规则后，就可获取用户输入内容，提交给后端。

要实现三类组件：

- el-form提供表单的容器组件，负责全局的输入对象model和校验规则rules的配置，在用户点击提交时，可执行全部输入项的校验规则

- input类组件，输入内容的输入框、下拉框、滑块等都属这类。主要负责显示对应的交互组件，并且监听所有的输入项，用户在交互的同时通知执行校验

- 介于form和input中间的form-item组件，负责每一个具体输入的管理，从form组件中获取校验规则，从input中获取用户输入的内容，通过async-validator校验输入是否合法后显示对应的输入状态，并且还能把校验方法提供给form组件，form可很方便地管理所有form-item。

组件设计需考虑：

- 内部交互逻辑
- 对子组件提供什么数据
- 对父组件提供什么方法
- 需不需要通过provide或inject来进行跨组件通信等

### 表单验证流程

**1. 定义验证规则**

```js
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    { validator: validateUsername, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})
```



**2. 绑定规则到表单**

```js
<el-form 
  :model="loginForm"    <!-- 绑定数据模型 -->
  :rules="rules"        <!-- 绑定验证规则 -->
  ref="loginFormRef"    <!-- 表单引用 -->
>
```



**3. 自定义验证方法**

```js
async function validateUsername(rule, value, callback) {
  if (value === '') {
    callback(new Error('请输入用户名'))
  } else {
    callback() // 验证通过
  }
}
```



**4. 触发验证**

```js
const login = async () => {
  if (!loginFormRef.value) return
  
  try {
    // 触发表单验证
    const valid = await loginFormRef.value.validate()
    if (valid) {
      // 验证通过,执行登录
      await doLogin()
    }
  } catch (error) {
    // 验证失败处理
    handleError(error)
  }
}
```

**验证规则说明:**

- `required`: 必填项
- `min/max`: 长度限制
- `trigger`: 触发方式(blur/change)
- `validator`: 自定义验证方法
- `message`: 错误提示信息

**验证流程:**

1. 用户输入触发验证
2. 执行验证规则检查
3. 显示错误提示(如果有)
4. 验证通过则提交表单

类比 Java:

- 类似 `@Valid` 注解验证
- 类似 JSR-303 验证规则
- 类似 BindingResult 结果处理

## FAQ

Q：表单组件设计上能否通过Vue 2流行的event-bus实现？

A：Vue 2 时代，`event-bus`（事件总线）是一个较为流行的解决组件通信的方式。通过在全局创建一个 Vue 实例作为事件总线，子组件可以通过 `$emit` 触发事件，父组件通过 `$on` 监听事件，从而实现跨组件的通信。

对于本例中的表单组件，理论上可以通过 `event-bus` 来实现组件之间的通信，但从现代 Vue 的架构和最佳实践来看，这种方式已经不推荐，主要原因包括以下几点：

------

### **1. 可维护性差**

- **问题**：`event-bus` 是一种松散的事件驱动通信方式，依赖于事件的触发和监听，但事件本身没有强类型约束或明确的调用链，难以调试和维护。
- **改进**：Vue 3 的 `provide/inject` 或者 Vuex/Pinia 等状态管理工具，可以更清晰地定义数据流和逻辑职责。

------

### **2. 性能问题**

- **问题**：使用 `event-bus` 可能导致事件在全局广播，尤其在大型项目中，大量事件会增加性能开销。
- **改进**：本例中，通过 `provide/inject` 实现的数据共享仅限于组件树中的父子组件或兄弟组件之间，数据传递范围清晰且高效。

------

### **3. 复杂性控制**

- **问题**：`event-bus` 的事件管理随着项目复杂度增加会导致难以跟踪。例如，在表单校验中，需管理每个 `form-item` 的校验状态并与 `form` 同步，如果使用 `event-bus`，需要手动处理事件的订阅与销毁。
- **改进**：本例中，使用 Vue 的生命周期钩子（如 `onMounted` 和 `onUnmounted`）配合 `provide/inject` 机制，自动管理组件的注册和销毁逻辑，代码更加直观。

------

### **4. 与现代 Vue 设计理念不符**

- **问题**：`event-bus` 属于 Vue 2 时代的过渡方案，而 Vue 3 的 Composition API 提供了更优雅的通信机制（如响应式 `reactive`、`ref` 数据，以及组合函数）。
- **改进**：在本例中，`provide/inject` 结合响应式数据实现了父组件与子组件的通信，使代码风格更加符合现代 Vue 的声明式设计思想。

------

### **总结**

虽然 `event-bus` 可以实现类似的功能，但它在代码结构、性能和可维护性上都存在明显的缺陷，已经逐渐被 Vue 3 的现代通信机制所取代。对于表单组件这种较为复杂的场景，推荐使用 `provide/inject` 结合响应式数据的方式来管理组件通信，以提高代码的健壮性和可扩展性。