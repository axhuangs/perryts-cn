# watchOS

Perry 可以为 Apple Watch 设备和 watchOS 模拟器编译 TypeScript 应用。

由于 watchOS 不支持 UIKit 视图，Perry 使用**数据驱动的 SwiftUI 渲染器**：您的 TypeScript 代码通过标准的 `perry/ui` API 构建 UI 树，一个固定的 SwiftUI 运行时 (随 Perry 一起提供) 查询树并响应式渲染。不涉及代码生成或转译 — 二进制文件完全原生。

## 要求

- macOS 主机 (不支持从 Linux/Windows 交叉编译)
- Xcode (完整安装) 用于 watchOS SDK 和模拟器
- Rust watchOS 目标：
  ```bash
  rustup target add arm64_32-apple-watchos aarch64-apple-watchos-sim
  ```

## 为模拟器构建

```bash
perry compile app.ts -o app --target watchos-simulator
```

这生成与 watchOS 模拟器 SDK 链接的 ARM64 二进制文件，包装在 `.app` 包中。

## 为设备构建

```bash
perry compile app.ts -o app --target watchos
```

这为物理 Apple Watch 硬件生成 arm64_32 (ILP32) 二进制文件。Apple Watch 在 64 位 ARM 上使用 32 位指针。

## 使用 `perry run` 运行

```bash
perry run watchos                # 自动检测已启动的 watch 模拟器
perry run watchos --simulator <UDID>  # 针对特定模拟器
```

Perry 自动发现已启动的 Apple Watch 模拟器。要手动安装和启动：

```bash
xcrun simctl install booted app_watchos/app.app
xcrun simctl launch booted com.perry.app
```

## UI 工具包

Perry 通过数据驱动桥将 UI 小部件映射到 SwiftUI 视图：

| Perry 小部件 | SwiftUI 视图 | 备注 |
|-------------|-------------|-------|
| Text | Text | 字体大小、权重、颜色、换行 |
| Button | Button | 通过原生闭包回调的点击操作 |
| VStack | VStack | 带间距 |
| HStack | HStack | 带间距 |
| ZStack | ZStack | 分层视图 |
| Spacer | Spacer | |
| Divider | Divider | |
| Toggle | Toggle | 双向状态绑定 |
| Slider | Slider | 最小/最大/值，状态绑定 |
| Image | Image(systemName:) | SF Symbols |
| ScrollView | ScrollView | |
| ProgressView | ProgressView | 线性 |
| Picker | Picker | 选择列表 |
| Form | List | 在 watchOS 上映射到 List |
| NavigationStack | NavigationStack | 推送导航 |

### 修饰符

所有小部件支持这些样式修饰符：

- `foregroundColor` / `backgroundColor`
- `font` (大小、权重、系列)
- `frame` (宽度、高度)
- `padding` (统一或每边)
- `cornerRadius`
- `opacity`
- `hidden` / `disabled`

## 应用生命周期

watchOS 应用使用 SwiftUI 的 `@main App` 模式。Perry 的 PerryWatchApp.swift 运行时自动处理应用生命周期：

```typescript
import { App, Text, VStack, Button } from "perry/ui";

App({
  title: "My Watch App",
  width: 200,
  height: 200,
  body: VStack(8, [
    Text("Hello, Apple Watch!"),
    Button("Tap me", () => {
      console.log("Button tapped!");
    }),
  ]),
});
```

在底层：