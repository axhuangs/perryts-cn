---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "perry 中文文档"
  actions:
    - theme: brand
      text: 开始使用
      link: /introduction
    - theme: alt
      text: 安装 Perry
      link: /getting-started/installation

features:
  - title: 原生性能
    details: 编译为机器代码，比 Node.js 快 2 倍。没有 JIT 预热，没有 V8。
  - title: 真正的多线程
    details: parallelMap 和 spawn 提供实际的 OS 线程，具有编译时安全性。
  - title: 原生 UI
    details: 构建桌面和移动应用，编译为真正的 AppKit、UIKit、GTK4 或 Win32 小部件。
  - title: 7 个目标平台
    details: 从同一源代码支持 macOS、iOS、Android、Windows、Linux、Web 和 WebAssembly。
  - title: 熟悉的生态系统
    details: 使用 npm 包如 fastify、mysql2、redis、bcrypt、lodash 等，原生编译。
  - title: 零配置
    details: 将 Perry 指向 .ts 文件并获取二进制文件。不需要 tsconfig.json。

---

> Perry 是一个原生 TypeScript 编译器，它将 TypeScript 源代码直接编译为原生可执行文件。没有 JavaScript 运行时，没有 JIT 预热，没有 V8 — 您的 TypeScript 编译为真正的二进制文件。

```typescript
// hello.ts
console.log("Hello from Perry!");
```

```bash
$ perry hello.ts -o hello
$ ./hello
Hello from Perry!
```

查看 [介绍](/introduction.html) 以了解更多。