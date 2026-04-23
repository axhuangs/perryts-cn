# 介绍

Perry 是一款原生 TypeScript 编译器，可将 TypeScript 源代码直接编译为原生可执行文件。无需 JavaScript 运行时、无需 JIT 预热、无需 V8 引擎 —— 你的 TypeScript 代码会编译为真正的二进制文件。

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

- **原生性能** —— 通过 LLVM 编译为机器码。像斐波那契数列这类整数密集型代码，运行速度比 Node.js 快 2 倍。

- **真正的多线程** —— `parallelMap` 和 `spawn` 为你提供具备编译时类型安全的原生操作系统线程。无隔离环境（isolates）、无消息传递开销。这是任何 JS 运行时都无法实现的能力（详见 [多线程概述](threading/overview)）。

- **轻量二进制文件** —— 一个 Hello World 程序仅约 300KB。Perry 会检测你使用的运行时特性，仅链接必要的依赖。

- **原生界面（UI）** —— 使用声明式 TypeScript 构建桌面和移动应用，代码会编译为原生的 AppKit、UIKit、GTK4、Win32 或 DOM 组件。

- **7 种编译目标** —— 同一套源代码可编译为 macOS、iOS、Android、Windows、Linux、Web 及 WebAssembly 平台的产物。

- **熟悉的生态系统** —— 可使用 `fastify`、`mysql2`、`redis`、`bcrypt`、`lodash` 等 npm 包，并将其原生编译。

- **零配置** —— 只需将 Perry 指向 `.ts` 文件，即可生成二进制文件。无需配置 `tsconfig.json`。

## Perry 支持编译的特性

Perry 支持 TypeScript 的核心实用子集：

- 变量、函数、类、枚举、接口

- 异步 / 等待（Async/await）、闭包、生成器

- 解构赋值、展开语法、模板字符串

- 数组、Map、Set、类型化数组

- 正则表达式、JSON、Promise

- 模块导入 / 导出

- 泛型类型擦除

完整列表详见 [支持的特性](language/supported-features)。

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
$ ./counter  # 打开原生的 macOS/Windows/Linux 窗口
```

这会生成一个约 3MB 的原生应用，内置真正的平台原生组件 —— 无 Electron、无 WebView。

## 工作原理

```Plain Text
TypeScript (.ts)
    ↓ 解析（基于 SWC）
    ↓ 转换为高层中间表示（HIR）
    ↓ 转换（内联、闭包转换、异步处理）
    ↓ 代码生成（基于 LLVM）
    ↓ 链接（系统链接器）
    ↓
原生可执行文件
```

Perry 使用 [SWC](https://swc.rs/) 进行 TypeScript 解析，使用 [LLVM](https://llvm.org/) 进行原生代码生成。类型会在编译时擦除（与 `tsc` 行为一致），运行时通过 NaN 装箱（NaN-boxing）技术表示值，实现高效的 64 位标记值存储。

## 后续参考

- [安装 Perry](getting-started/installation)

- [编写你的第一个程序](getting-started/hello-world)

- [构建原生应用](getting-started/first-app)
