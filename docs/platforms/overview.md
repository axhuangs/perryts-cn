# 平台概述

Perry 将 TypeScript 编译为 7 个平台的原生可执行文件，从相同的源代码。

## 支持的平台

| 平台 | 目标标志 | UI 工具包 | 状态 |
|----------|-------------|------------|--------|
| macOS | *(默认)* | AppKit | 完整支持 (127/127 FFI 函数) |
| iOS | `--target ios` / `--target ios-simulator` | UIKit | 完整支持 (127/127) |
| tvOS | `--target tvos` / `--target tvos-simulator` | UIKit | 完整支持 (焦点引擎 + 游戏控制器) |
| watchOS | `--target watchos` / `--target watchos-simulator` | SwiftUI (数据驱动) | 核心支持 (15 个小部件) |
| Android | `--target android` | JNI/Android SDK | 完整支持 (112/112) |
| Windows | `--target windows` | Win32 | 完整支持 (112/112) |
| Linux | `--target linux` | GTK4 | 完整支持 (112/112) |
| Web / WebAssembly | `--target web` *(别名 `--target wasm`)* | 通过 WASM 桥接的 DOM/CSS | 完整支持 (168 个小部件) |

## 交叉编译

```bash
# 默认: 为当前平台编译
perry app.ts -o app

# 为特定目标编译
perry app.ts -o app --target ios-simulator
perry app.ts -o app --target tvos-simulator
perry app.ts -o app --target watchos-simulator
perry app.ts -o app --target web   # 别名: --target wasm
perry app.ts -o app --target windows
perry app.ts -o app --target linux
perry app.ts -o app --target android
```

## 平台检测

使用 `__platform__` 编译时常量按平台分支：

```typescript
declare const __platform__: number;

// 平台常量:
// 0 = macOS
// 1 = iOS
// 2 = Android
// 3 = Windows
// 4 = Linux
// 5 = Web (浏览器, --target web / --target wasm)
// 6 = tvOS
// 7 = watchOS

if (__platform__ === 0) {
  console.log("Running on macOS");
} else if (__platform__ === 1) {
  console.log("Running on iOS");
} else if (__platform__ === 3) {
  console.log("Running on Windows");
}
```

`__platform__` 在编译时解析。编译器常量折叠比较并消除死分支，所以平台特定代码具有零运行时成本。

## 平台功能矩阵

| 功能 | macOS | iOS | tvOS | watchOS | Android | Windows | Linux | Web (WASM) |
|---------|-------|-----|------|---------|---------|---------|-------|------------|
| CLI 程序 | 是 | — | — | — | — | 是 | 是 | — |
| 原生 UI (web 上 DOM) | 是 | 是 | 是 | 是 | 是 | 是 | 是 | 是 |
| 游戏引擎 | 是 | 是 | 是 | — | 是 | 是 | 是 | 通过 FFI |
| 文件系统 | 是 | 沙盒 | 沙盒 | — | 沙盒 | 是 | 是 | 文件系统访问 API |
| 网络 | 是 | 是 | 是 | 是 | 是 | 是 | 是 | `fetch` / `WebSocket` |
| 系统 API | 是 | 部分 | 部分 | 最小 | 部分 | 是 | 是 | 部分 |
| 小部件 (WidgetKit) | — | 是 | — | 是 | — | — | — | — |
| 线程 | 原生 | 原生 | 原生 | 原生 | 原生 | 原生 | 原生 | Web Workers |

## 下一步

- [macOS](macos.md)
- [iOS](ios.md)
- [tvOS](tvos.md)
- [watchOS](watchos.md)
- [Android](android.md)
- [Windows](windows.md)
- [Linux (GTK4)](linux.md)
- [Web](web.md)
- [WebAssembly](wasm.md)