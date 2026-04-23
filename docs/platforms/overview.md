# 平台概述

Perry 可将 TypeScript 代码编译为 7 个平台的原生可执行文件，所有平台均基于同一套源代码构建。

## 支持的平台

| 平台       | 目标标志                                   | UI 工具包          | 状态                                   |
|------------|--------------------------------------------|--------------------|----------------------------------------|
| macOS      | *（默认）*                                 | AppKit             | 完全支持（127/127 个 FFI 函数）|
| iOS        | `--target ios` / `--target ios-simulator`  | UIKit              | 完全支持（127/127 个）|
| tvOS       | `--target tvos` / `--target tvos-simulator`| UIKit              | 完全支持（焦点引擎 + 游戏控制器）|
| watchOS    | `--target watchos` / `--target watchos-simulator` | SwiftUI（数据驱动） | 核心支持（15 个小组件）|
| Android    | `--target android`                         | JNI/Android SDK    | 完全支持（112/112 个）|
| Windows    | `--target windows`                         | Win32              | 完全支持（112/112 个）|
| Linux      | `--target linux`                           | GTK4               | 完全支持（112/112 个）|
| Web / WebAssembly | `--target web`（别名 `--target wasm`）| DOM/CSS（通过 WASM 桥接） | 完全支持（168 个组件）|

## 交叉编译

```bash
# 默认：为当前平台编译
perry app.ts -o app

# 为指定目标平台编译
perry app.ts -o app --target ios-simulator
perry app.ts -o app --target tvos-simulator
perry app.ts -o app --target watchos-simulator
perry app.ts -o app --target web   # 别名：--target wasm
perry app.ts -o app --target windows
perry app.ts -o app --target linux
perry app.ts -o app --target android
```

上述命令展示了如何为不同目标平台执行交叉编译操作，默认情况下编译器会针对当前运行平台生成可执行文件，指定 `--target` 参数可切换编译目标。

## 平台检测

可使用编译时常量 `__platform__` 按平台分支执行代码：

```typescript
declare const __platform__: number;

// 平台常量定义：
// 0 = macOS
// 1 = iOS
// 2 = Android
// 3 = Windows
// 4 = Linux
// 5 = Web（浏览器环境，--target web / --target wasm）
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

`__platform__` 会在编译阶段解析。编译器会对相关比较表达式进行常量折叠，并移除无效分支，因此平台专属代码不会产生任何运行时开销。

## 平台功能矩阵

| 功能                | macOS | iOS      | tvOS     | watchOS | Android  | Windows | Linux | Web (WASM)          |
|---------------------|-------|----------|----------|---------|----------|---------|-------|---------------------|
| CLI 程序            | 支持  | 不支持   | 不支持   | 不支持  | 不支持   | 支持    | 支持  | 不支持              |
| 原生 UI（Web 端为 DOM） | 支持  | 支持     | 支持     | 支持    | 支持     | 支持    | 支持  | 支持                |
| 游戏引擎            | 支持  | 支持     | 支持     | 不支持  | 支持     | 支持    | 支持  | 通过 FFI 实现       |
| 文件系统            | 支持  | 沙箱化   | 沙箱化   | 不支持  | 沙箱化   | 支持    | 支持  | 文件系统访问 API    |
| 网络通信            | 支持  | 支持     | 支持     | 支持    | 支持     | 支持    | 支持  | `fetch` / `WebSocket` |
| 系统 API            | 支持  | 部分支持 | 部分支持 | 极简支持 | 部分支持 | 支持    | 支持  | 部分支持            |
| 小组件（WidgetKit） | 不支持 | 支持     | 不支持   | 支持    | 不支持   | 不支持  | 不支持 | 不支持              |
| 线程                | 原生  | 原生     | 原生     | 原生    | 原生     | 原生    | 原生  | Web Workers         |

## 后续参考

- [macOS](macos)
- [iOS](ios)
- [tvOS](tvos)
- [watchOS](watchos)
- [Android](android)
- [Windows](windows)
- [Linux (GTK4)](linux)
- [Web](web)
- [WebAssembly](wasm)