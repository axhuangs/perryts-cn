---
layout: home

hero:
  name: "perry 中文文档"
  tagline: "一套代码，全平台原生运行。TypeScript → 原生机器码。"
  # image:
  #   src: /logo.svg
  #   alt: Perry
  actions:
    - theme: brand
      text: 开始使用
      link: /introduction
    - theme: alt
      text: 安装 Perry
      link: /getting-started/installation

features:
  - icon: 🚀
    title: 原生性能
    details: TypeScript 经 LLVM 编译为机器码，计算密集型任务比 Node.js 最快快 24 倍。启动速度 <1ms，二进制体积仅 2–5MB。
  - icon: 🧵
    title: 真正的多线程
    details: 提供 parallelMap、spawn 等原生系统线程 API，编译时安全，无隔离环境、无消息传递开销。
  - icon: 🎨
    title: 原生 UI
    details: 声明式语法直接编译为 AppKit、UIKit、GTK4、Win32 组件，非 WebView、非自绘渲染。
  - icon: 🖥️
    title: 7+ 目标平台
    details: 一套源码编译到 macOS、iOS、Android、Windows、Linux、watchOS、Web、Wasm。
  - icon: 📦
    title: 熟悉的生态
    details: 内置兼容 Node.js 的标准库，支持 fastify、mysql2、redis、bcrypt、lodash 等原生编译。
  - icon: ⚙️
    title: 零配置开箱即用
    details: 无需 tsconfig、无需复杂构建配置，只需指向 .ts 文件即可输出原生二进制。
  - icon: 🧩
    title: 编译时插件系统
    details: 插件在构建期链接，无运行时开销、无 IPC 损耗，依赖直接编译为机器码调用。
  - icon: 🌍
    title: 内置国际化 i18n
    details: 编译时字符串提取、CLDR 复数规则、多语言自动嵌入二进制，运行时零开销。
  - icon: 🧩
    title: 原生小组件支持
    details: 一套代码编译为 iOS WidgetKit、Android Widget、watchOS 复杂功能、Wear OS 磁贴。
  - icon: 🚚
    title: 一键发布到应用商店
    details: 自动签名、公证、打包，一键提交到 App Store、Play Store，支持远程构建。
  - icon: 🔒
    title: 类型安全优化
    details: 利用 TypeScript 类型做 Monomorphization，生成更高效的原生代码。
  - icon: 🧪
    title: 完整测试与验证
    details: 内置 UI 自动化测试，跨平台验证，确保应用在所有设备行为一致。
---

## 官方简介

[中文官网](https://www.perryts.com/zh-Hans/)

Perry 是一个**将 TypeScript 直接编译为原生机器码**的全平台工具链，不依赖 V8、不依赖 Node.js、不使用 Electron。
它能把你的 TypeScript 代码编译为：
- 桌面原生应用（macOS / Windows / Linux）
- 移动原生应用（iOS / Android）
- 手表端应用与复杂功能（watchOS / Wear OS）
- 命令行工具（CLI）
- WebAssembly 应用

所有产物均为**独立二进制文件**，无运行时、无依赖、单文件分发。

## 核心能力
- ✅ TypeScript → LLVM → 原生机器码
- ✅ 真正多线程，无 Worker / SharedArrayBuffer
- ✅ 25+ 原生 UI 组件
- ✅ 内置 Node.js 兼容标准库
- ✅ 跨平台小组件（Widget / 复杂功能 / 磁贴）
- ✅ 编译时插件与扩展系统
- ✅ 一键签名、发布、公证
- ✅ 跨平台编译与远程构建
- ✅ 内置 i18n 国际化
- ✅ 原生访问系统 API


> 本文档由 AI 翻译 + 人工精校。