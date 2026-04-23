# 状态管理

Perry 采用响应式状态机制，当数据发生变化时自动更新用户界面（UI）。

## 创建状态

```typescript
import { State } from "perry/ui";

const count = State(0);           // 数值类型状态
const name = State("Perry");      // 字符串类型状态
const items = State<string[]>([]); // 数组类型状态
```

`State(initialValue)` 用于创建一个响应式状态容器。

## 读取与写入

```typescript
const value = count.value;  // 读取当前值
count.set(42);              // 设置新值 → 触发 UI 更新
```

每次调用 `.set()` 方法都会使用新值重新渲染组件树。

## 响应式文本

包含 `state.value` 的模板字符串会自动更新：

```typescript
import { Text, State } from "perry/ui";

const count = State(0);
Text(`Count: ${count.value}`);
// 当 count 变化时，文本会自动更新
```

该机制生效的原因是 Perry 会检测模板字符串中对 `state.value` 的读取操作，并创建响应式绑定关系。

## 将输入控件绑定到状态

输入类组件暴露了 `onChange` 回调函数。可将该回调转发至状态的
`.set(...)` 方法，实现用户输入（输入、切换、拖动等操作）与状态的同步：

```typescript
import { TextField, State, stateBindTextfield } from "perry/ui";

const input = State("");
const field = TextField("Type here...", (value: string) => input.set(value));

// 可选操作：让 input.set("hello") 也能更新界面上的输入框内容
stateBindTextfield(input, field);
```

输入控件签名说明：
- `TextField(placeholder, onChange)` — 文本输入框，`onChange: (value: string) => void`
- `SecureField(placeholder, onChange)` — 密码输入框，`onChange: (value: string) => void`
- `Toggle(label, onChange)` — 布尔值切换控件，`onChange: (value: boolean) => void`
- `Slider(min, max, onChange)` — 数值滑块，`onChange: (value: number) => void`
- `Picker(onChange)` — 下拉选择器，`onChange: (index: number) => void`；可通过 `pickerAddItem` 方法添加选项

若需实现「状态驱动组件」的程序化 UI 同步，可使用专用的绑定方法：
`stateBindTextfield`、`stateBindSlider`、`stateBindToggle`、`stateBindTextNumeric`、
`stateBindVisibility`。

## onChange 回调函数

可通过自由函数 `stateOnChange` 监听状态变化：

```typescript
import { State, stateOnChange } from "perry/ui";

const count = State(0);
stateOnChange(count, (newValue: number) => {
  console.log(`Count changed to ${newValue}`);
});
```

## ForEach 组件

基于数值型状态（索引计数）渲染列表：

```typescript
import { VStack, Text, ForEach, State } from "perry/ui";

const items = State(["Apple", "Banana", "Cherry"]);
const itemCount = State(3);

VStack(16, [
  ForEach(itemCount, (i: number) =>
    Text(`${i + 1}. ${items.value[i]}`)
  ),
]);
```

> **注意**：`ForEach` 会基于数值型状态按索引迭代。需将计数状态与数组保持同步，然后在闭包内通过 `array.value[i]` 读取数组项。

当计数状态变化时，`ForEach` 会重新渲染列表：

```typescript
// 添加一项
items.set([...items.value, "Date"]);
itemCount.set(itemCount.value + 1);

// 移除一项
items.set(items.value.filter((_, i) => i !== 1));
itemCount.set(itemCount.value - 1);
```

## 条件渲染

通过状态控制组件的条件显示：

```typescript
import { VStack, Text, Button, State } from "perry/ui";

const showDetails = State(false);

VStack(16, [
  Button("Toggle", () => showDetails.set(!showDetails.value)),
  showDetails.value ? Text("Details are visible!") : Spacer(),
]);
```

## 多状态文本

文本可依赖多个状态值：

```typescript
const firstName = State("John");
const lastName = State("Doe");

Text(`Hello, ${firstName.value} ${lastName.value}!`);
// 当 firstName 或 lastName 任一状态变化时，文本都会更新
```

## 包含对象与数组的状态

```typescript
const user = State({ name: "Perry", age: 0 });

// 通过替换整个对象实现更新
user.set({ ...user.value, age: 1 });

const todos = State<{ text: string; done: boolean }[]>([]);

// 添加待办事项
todos.set([...todos.value, { text: "New task", done: false }]);

// 切换待办事项状态
const items = todos.value;
items[0].done = !items[0].done;
todos.set([...items]);
```

> **注意**：状态采用引用相等性对比机制。若要让状态变化被检测到，必须创建新的数组/对象引用。仅在原地修改数据但未调用 `.set()` 传入新引用，将无法触发更新。

## 完整示例

```typescript
import { App, Text, Button, TextField, VStack, HStack, State, ForEach, Spacer, Divider } from "perry/ui";

const todos = State<string[]>([]);
const count = State(0);
const input = State("");

App({
  title: "Todo App",
  width: 480,
  height: 600,
  body: VStack(16, [
    Text("My Todos"),

    HStack(8, [
      TextField("What needs to be done?", (value: string) => input.set(value)),
      Button("Add", () => {
        const text = input.value;
        if (text.length > 0) {
          todos.set([...todos.value, text]);
          count.set(count.value + 1);
          input.set("");
        }
      }),
    ]),

    Divider(),

    ForEach(count, (i: number) =>
      HStack(8, [
        Text(todos.value[i]),
        Spacer(),
        Button("Delete", () => {
          todos.set(todos.value.filter((_, idx) => idx !== i));
          count.set(count.value - 1);
        }),
      ])
    ),

    Spacer(),
    Text(`${count.value} items`),
  ]),
});
```

## 后续参考

- [Events](events) — 点击、悬浮、键盘事件
- [Widgets](widgets) — 所有可用组件
- [Layout](layout) — 布局容器
