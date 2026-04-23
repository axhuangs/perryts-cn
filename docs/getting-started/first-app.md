# 首个原生应用

Perry 可将声明式 TypeScript UI 代码编译为各平台的原生控件。全程无 Electron、无 WebView 介入——macOS 端基于 AppKit、iOS 端基于 UIKit、Linux 端基于 GTK4、Windows 端基于 Win32 实现原生渲染。

## 简易计数器示例

创建 `counter.ts` 文件：

```typescript
import { App, Text, Button, VStack, State } from "perry/ui";

const count = State(0);

App({
  title: "My Counter",
  width: 400,
  height: 300,
  body: VStack(16, [
    Text(`Count: ${count.value}`),
    Button("Increment", () => count.set(count.value + 1)),
    Button("Reset", () => count.set(0)),
  ]),
});
```

编译并运行：

```bash
perry counter.ts -o counter
./counter
```

运行后会打开一个原生窗口，包含一个文本标签和两个按钮。点击「Increment」按钮，计数器数值会实时更新。

## 工作原理

- **`App({ title, width, height, body })`** —— 创建原生应用窗口。`body` 为根控件。
- **`State(initialValue)`** —— 创建响应式状态。通过 `.value` 读取状态值，调用 `.set(v)` 写入新值并触发 UI 更新。
- **`VStack(spacing, [...])`** —— 垂直栈式布局（类似 SwiftUI 的 VStack 或 CSS Flexbox 列布局）。`spacing`（间距）参数为可选参数。
- **`Text(string)`** —— 文本标签控件。模板字符串中引用 `${state.value}` 可实现响应式绑定。
- **`Button(label, onClick)`** —— 原生按钮控件，配置点击事件处理函数。

## 待办事项（Todo）应用示例

```typescript
import {
  App, Text, Button, TextField, VStack, HStack, State, ForEach, Spacer,
} from "perry/ui";

const todos = State<string[]>([]);
const count = State(0); // ForEach 基于索引遍历，因此需同步维护计数状态
const input = State("");

App({
  title: "Todo App",
  width: 480,
  height: 600,
  body: VStack(16, [
    HStack(8, [
      TextField("Add a todo...", (value: string) => input.set(value)),
      Button("Add", () => {
        const text = input.value;
        if (text.length > 0) {
          todos.set([...todos.value, text]);
          count.set(count.value + 1);
          input.set("");
        }
      }),
    ]),
    ForEach(count, (i: number) =>
      HStack(8, [
        Text(todos.value[i]),
        Spacer(),
        Button("Remove", () => {
          todos.set(todos.value.filter((_, idx) => idx !== i));
          count.set(count.value - 1);
        }),
      ])
    ),
  ]),
});
```

## 跨平台支持

同一份代码可运行于以下 6 个平台：

```bash
# macOS（默认目标平台）
perry app.ts -o app
./app

# iOS 模拟器
perry app.ts -o app --target ios-simulator

# Web 端（编译为 WebAssembly + DOM 桥接层，输出独立 HTML 文件）
perry app.ts -o app --target web   # 别名：--target wasm
open app.html

# 其他平台
perry app.ts -o app --target windows
perry app.ts -o app --target linux
perry app.ts -o app --target android
```

每个目标平台都会编译为对应系统的原生控件工具链。详见《平台说明》[Platforms](../platforms/overview)。

## 样式定制

```typescript
import { App, Text, Button, VStack, State } from "perry/ui";

const count = State(0);

App("Styled Counter", () => {
  const label = Text(`Count: ${count.get()}`);
  label.setFontSize(24);
  label.setColor("#333333");

  const btn = Button("Increment", () => count.set(count.get() + 1));
  btn.setCornerRadius(8);
  btn.setBackgroundColor("#007AFF");

  const stack = VStack([label, btn]);
  stack.setPadding(20);
  return stack;
});
```

所有可用的样式属性详见《样式定制》[Styling](../ui/styling)。

## 后续参考

- [项目配置](project-config) —— 为 Perry 项目配置 `package.json`
- [UI 概述](../ui/overview) —— Perry 界面系统完整指南
- [Widgets](../ui/widgets) —— 所有可用控件说明
- [State](../ui/state) —— 响应式状态与数据绑定
