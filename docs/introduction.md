# 介绍

Perry 是一个原生 TypeScript 编译器，它将 TypeScript 源代码直接编译为原生可执行文件。没有 JavaScript 运行时，没有 JIT 预热，没有 V8 — 您的 TypeScript 编译为真正的二进制文件。

```typescript
// hello.ts
console.log("Hello from Perry!");
```

```bash
$ perry hello.ts -o hello
$ ./hello
Hello from Perry!
```

## 为什么选择 Perry？

- **原生性能** — 通过 LLVM 编译为机器代码。像斐波那契这样的整数密集型代码比 Node.js 快 2 倍。
- **真正的多线程** — `parallelMap` 和 `spawn` 提供实际的 OS 线程，具有编译时安全性。没有隔离，没有消息传递开销。[JavaScript 运行时无法做到的事情](threading/overview.md)。
- **小二进制文件** — Hello world 大约 300KB。Perry 检测您使用的运行时功能，只链接所需的内容。
- **原生 UI** — 使用声明式 TypeScript 构建桌面和移动应用，编译为真正的 AppKit、UIKit、GTK4、Win32 或 DOM 小部件。
- **7 个目标** — 从同一源代码支持 macOS、iOS、Android、Windows、Linux、Web 和 WebAssembly。
- **熟悉的生态系统** — 使用 npm 包如 `fastify`、`mysql2`、`redis`、`bcrypt`、`lodash` 等 — 原生编译。
- **零配置** — 将 Perry 指向 `.ts` 文件并获取二进制文件。不需要 `tsconfig.json`。

## Perry 编译什么

Perry 支持 TypeScript 的实用子集：

- 变量、函数、类、枚举、接口
- Async/await、闭包、生成器
- 解构、展开、模板字面量
- 数组、Maps、Sets、类型化数组
- 正则表达式、JSON、Promises
- 模块导入/导出
- 泛型类型擦除

请参阅[支持的功能](language/supported-features.md)以获取完整列表。

## 快速示例：原生应用

```typescript
import { App, Text, Button, VStack, State } from "perry/ui";

const count = State(0);

App({
  title: "Counter",
  width: 400,
  height: 300,
  body: VStack(16, [
    Text(`Count: ${count.value}`),
    Button("Increment", () => count.set(count.value + 1)),
  ]),
});
```

```bash
$ perry counter.ts -o counter
$ ./counter  # 打开原生 macOS/Windows/Linux 窗口
```

这会产生一个 ~3MB 的原生应用，具有真正的平台小部件 — 没有 Electron，没有 WebView。

## 工作原理

```
TypeScript (.ts)
    ↓ 解析 (SWC)
    ↓ 降低到 HIR
    ↓ 转换 (内联、闭包转换、异步)
    ↓ 代码生成 (LLVM)
    ↓ 链接 (系统链接器)
    ↓
原生可执行文件
```

Perry 使用 [SWC](https://swc.rs/) 进行 TypeScript 解析，使用 [LLVM](https://llvm.org/) 进行原生代码生成。类型在编译时被擦除（像 `tsc`），值在运行时使用 NaN-boxing 表示，以实现高效的 64 位标记值。

## 下一步

- [安装 Perry](getting-started/installation.md)
- [编写您的第一个程序](getting-started/hello-world.md)
- [构建原生应用](getting-started/first-app.md)