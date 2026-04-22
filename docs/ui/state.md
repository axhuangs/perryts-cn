# 状态管理

Perry 使用反应式状态在数据更改时自动更新 UI。

## 创建状态

```typescript
import { State } from "perry/ui";

const count = State(0);           // 数字状态
const name = State("Perry");      // 字符串状态
const items = State<string[]>([]); // 数组状态
```

`State(initialValue)` 创建一个反应式状态容器。

## 读取和写入

```typescript
const value = count.value;  // 读取当前值
count.set(42);              // 设置新值 → 触发 UI 更新
```

每次 `.set()` 调用都会使用新值重新渲染小部件树。

## 反应式文本

带有 `state.value` 的模板字面量会自动更新：

```typescript
import { Text, State } from "perry/ui";

const count = State(0);
Text(`Count: ${count.value}`);
// 文本会在 count 更改时更新
```

这是因为 Perry 检测到模板字面量内的 `state.value` 读取并创建反应式绑定。

## 将输入绑定到状态

输入小部件公开 `onChange` 回调。将它转发到状态的 `.set(...)` 以在用户输入/切换/拖动时保持状态同步：

```typescript
import { TextField, State, stateBindTextfield } from "perry/ui";

const input = State("");
const field = TextField("Type here...", (value: string) => input.set(value));

// 可选：也让 input.set("hello") 在屏幕上更新字段。
stateBindTextfield(input, field);
```

输入控件签名：
- `TextField(placeholder, onChange)` — 文本输入，`onChange: (value: string) => void`
- `SecureField(placeholder, onChange)` — 密码输入，`onChange: (value: string) => void`
- `Toggle(label, onChange)` — 布尔切换，`onChange: (value: boolean) => void`
- `Slider(min, max, onChange)` — 数字滑块，`onChange: (value: number) => void`
- `Picker(onChange)` — 下拉菜单，`onChange: (index: number) => void`；通过 `pickerAddItem` 添加项目

对于程序化到 UI 的同步（状态驱动小部件），使用专用绑定器：
`stateBindTextfield`, `stateBindSlider`, `stateBindToggle`, `stateBindTextNumeric`,
`stateBindVisibility`。

## onChange 回调

使用自由函数 `stateOnChange` 监听状态更改：

```typescript
import { State, stateOnChange } from "perry/ui";

const count = State(0);
stateOnChange(count, (newValue: number) => {
  console.log(`Count changed to ${newValue}`);
});
```

## ForEach

从数字状态（索引计数）渲染列表：

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

> **注意：** `ForEach` 通过索引在数字状态上迭代。与数组保持计数状态同步，然后在闭包内通过 `array.value[i]` 读取项目。

当计数状态更改时，`ForEach` 会重新渲染列表：

```typescript
// 添加项目
items.set([...items.value, "Date"]);
itemCount.set(itemCount.value + 1);

// 删除项目
items.set(items.value.filter((_, i) => i !== 1));
itemCount.set(itemCount.value - 1);
```

## 条件渲染

使用状态有条件地显示小部件：

```typescript
import { VStack, Text, Button, State } from "perry/ui";

const showDetails = State(false);

VStack(16, [
  Button("Toggle", () => showDetails.set(!showDetails.value)),
  showDetails.value ? Text("Details are visible!") : Spacer(),
]);
```

## 多状态文本

文本可以依赖多个状态值：

```typescript
const firstName = State("John");
const lastName = State("Doe");

Text(`Hello, ${firstName.value} ${lastName.value}!`);
// 当 firstName 或 lastName 更改时更新
```

## 对象和数组的状态

```typescript
const user = State({ name: "Perry", age: 0 });

// 通过替换整个对象更新
user.set({ ...user.value, age: 1 });

const todos = State<{ text: string; done: boolean }[]>([]);

// 添加待办事项
todos.set([...todos.value, { text: "New task", done: false }]);

// 切换待办事项
const items = todos.value;
items[0].done = !items[0].done;
todos.set([...items]);
```

> **注意**：状态使用身份比较。您必须为更改创建一个新的数组/对象引用。在不调用带有新引用的 `.set()` 的情况下就地变异不会触发更新。

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

## 下一步

- [Events](events.md) — 点击、悬停、键盘事件
- [Widgets](widgets.md) — 所有可用的小部件
- [Layout](layout.md) — 布局容器