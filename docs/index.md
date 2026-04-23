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
    details: 通过 LLVM 编译为机器码。像斐波那契数列这类整数密集型代码，运行速度比 Node.js 快 2 倍。
  - title: 真正的多线程
    details: parallelMap 和 spawn 为你提供具备编译时类型安全的原生操作系统线程。无隔离环境（isolates）、无消息传递开销。这是任何 JS 运行时都无法实现的能力。
  - title: 原生 UI
    details: 使用声明式 TypeScript 构建桌面和移动应用，代码会编译为原生的 AppKit、UIKit、GTK4、Win32 或 DOM 组件。
  - title: 7 个目标平台
    details: 同一套源代码可编译为 macOS、iOS、Android、Windows、Linux、Web 及 WebAssembly 平台的产物。
  - title: 熟悉的生态系统
    details: 可使用 fastify、mysql2、redis、bcrypt、lodash 等 npm 包，并将其原生编译。
  - title: 零配置
    details: 只需将 Perry 指向 .ts 文件，即可生成二进制文件。无需配置 tsconfig.json。

---

> 使用豆包AI辅助翻译，人工核对。