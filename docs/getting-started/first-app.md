# 第一个原生应用

Perry 将声明式 TypeScript UI 代码编译为原生平台小部件。没有 Electron，没有 WebView — 在 macOS 上是真正的 AppKit，在 iOS 上是 UIKit，在 Linux 上是 GTK4，在 Windows 上是 Win32。

## 一个简单的计数器

创建 `counter.ts`：

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

一个原生窗口打开，带有标签和两个按钮。点击 "Increment" 会实时更新计数。

## 工作原理

- **`App({ title, width, height, body })`** — 创建一个原生应用程序窗口。`body` 是根小部件。
- **`State(initialValue)`** — 创建反应式状态。`.value` 读取，`.set(v)` 写入并触发 UI 更新。
- **`VStack(spacing, [...])`** — 垂直堆栈布局（像 SwiftUI 的 VStack 或 CSS flexbox 列）。间距参数是可选的。
- **`Text(string)`** — 一个文本标签。引用 `${state.value}` 的模板字面量会反应式绑定。
- **`Button(label, onClick)`** — 一个带有点击处理程序的原生按钮。

## 一个待办应用

```typescript
import {
  App, Text, Button, TextField, VStack, HStack, State, ForEach, Spacer,
} from "perry/ui";

const todos = State<string[]>([]);
const count = State(0); // ForEach 通过索引迭代，所以我们保持计数同步
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

## 跨平台

相同的代码在所有 6 个平台上运行：

```bash
# macOS（默认）
perry app.ts -o app
./app

# iOS 模拟器
perry app.ts -o app --target ios-simulator

# Web（编译为 WebAssembly + DOM 桥接在一个自包含的 HTML 文件中）
perry app.ts -o app --target web   # 别名: --target wasm
open app.html

# 其他平台