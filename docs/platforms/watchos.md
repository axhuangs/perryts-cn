# watchOS

Perry 可针对 Apple Watch 设备和 watchOS 模拟器编译 TypeScript 应用。

由于 watchOS 不支持 UIKit 视图，Perry 采用**数据驱动的 SwiftUI 渲染器**：你的 TypeScript 代码通过标准 `perry/ui` API 构建 UI 树，而随 Perry 发布的固定 SwiftUI 运行时会查询该树并以响应式方式渲染视图。此过程不涉及任何代码生成或转译——生成的二进制文件是纯原生的。

## 环境要求

- macOS 主机（暂不支持从 Linux/Windows 跨平台编译）
- 完整安装 Xcode（用于获取 watchOS SDK 和模拟器）
- Rust watchOS 目标平台：
  ```bash
  rustup target add arm64_32-apple-watchos aarch64-apple-watchos-sim
  ```

## 针对模拟器构建

```bash
perry compile app.ts -o app --target watchos-simulator
```

该命令会生成一个 ARM64 二进制文件，通过 `swiftc` 链接 watchOS 模拟器 SDK，并打包为 `.app` 应用束。

## 针对真机设备构建

```bash
perry compile app.ts -o app --target watchos
```

该命令会生成适用于实体 Apple Watch 硬件的 arm64_32（ILP32）架构二进制文件。Apple Watch 在 64 位 ARM 架构上使用 32 位指针。

## 使用 `perry run` 运行

```bash
perry run watchos                # 自动检测已启动的手表模拟器
perry run watchos --simulator <UDID>  # 指定目标模拟器
```

Perry 会自动发现已启动的 Apple Watch 模拟器。如需手动安装并启动应用：

```bash
xcrun simctl install booted app_watchos/app.app
xcrun simctl launch booted com.perry.app
```

## UI 工具包

Perry 通过数据驱动桥接层将 UI 组件映射为 SwiftUI 视图：

| Perry 组件 | SwiftUI 视图 | 说明 |
|-------------|-------------|-------|
| Text | Text | 支持字号、字重、颜色、文本换行 |
| Button | Button | 点击事件通过原生闭包回调实现 |
| VStack | VStack | 支持间距配置 |
| HStack | HStack | 支持间距配置 |
| ZStack | ZStack | 分层视图布局 |
| Spacer | Spacer | - |
| Divider | Divider | - |
| Toggle | Toggle | 双向状态绑定 |
| Slider | Slider | 支持最小值/最大值/当前值配置及状态绑定 |
| Image | Image(systemName:) | 基于 SF Symbols 实现 |
| ScrollView | ScrollView | - |
| ProgressView | ProgressView | 线性进度展示 |
| Picker | Picker | 选择列表 |
| Form | List | 在 watchOS 上映射为 List 组件 |
| NavigationStack | NavigationStack | 推入式导航 |

### 修饰器

所有组件均支持以下样式修饰器：

- `foregroundColor` / `backgroundColor`（前景色/背景色）
- `font`（字号、字重、字体族）
- `frame`（宽度、高度）
- `padding`（统一内边距或按方向配置内边距）
- `cornerRadius`（圆角半径）
- `opacity`（不透明度）
- `hidden` / `disabled`（隐藏/禁用）

## 应用生命周期

watchOS 应用采用 SwiftUI 的 `@main App` 模式。Perry 的 PerryWatchApp.swift 运行时会自动处理应用生命周期：

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

底层实现逻辑：
1. `perry_main_init()` 执行编译后的 TypeScript 代码，在内存中构建 UI 树
2. SwiftUI `@main` 结构体监听 UI 树版本变化并完成渲染
3. 用户交互操作（按钮点击、开关切换等）会回调至原生闭包

## 状态管理

响应式状态管理逻辑与其他平台保持一致：

```typescript
import { App, Text, VStack, Button, State } from "perry/ui";

const count = State(0);

App({
  title: "Counter",
  width: 200,
  height: 200,
  body: VStack(8, [
    Text(`Count: ${count.value}`),
    Button("+1", () => {
      count.set(count.value + 1);
    }),
  ]),
});
```

当调用 `state.set()` 时，UI 树版本号递增，SwiftUI 会自动重新渲染受影响的视图。

## 实现原理

与 iOS（基于 UIKit）和 macOS（基于 AppKit）不同（Perry 直接通过 FFI 调用原生视图 API），watchOS 采用**数据驱动架构**：

```
TypeScript 代码
  |
  v
perry_ui_*() FFI 调用  →  节点树存储于内存（Rust 实现）
                                      |
                                      v
                        PerryWatchApp.swift 通过 FFI 查询节点树
                                      |
                                      v
                        SwiftUI 以响应式方式渲染视图
                                      |
                                      v
                        用户交互 → FFI 回调 → 原生闭包
```

`PerryWatchApp.swift` 文件是随 Perry 发布的固定运行时（约 280 行代码），不随应用变更——它相当于 watchOS 平台下的 `libperry_ui_ios.a`。

## 配置

可在 `perry.toml` 中配置 watchOS 相关设置：

```toml
[watchos]
bundle_id = "com.example.mywatch"
deployment_target = "10.0"

[watchos.info_plist]
NSLocationWhenInUseUsageDescription = "Used for location features"
```

通过以下命令配置签名凭证：

```bash
perry setup watchos
```

该命令会共享 iOS/macOS 的 App Store Connect 凭证（同一开发团队、API 密钥、签发者）。

## 平台检测

编译时可通过 `__platform__ === 5` 检测 watchOS 平台：

```typescript
declare const __platform__: number;

if (__platform__ === 5) {
  console.log("Running on watchOS");
}
```

## watchOS 小组件（WidgetKit）

Perry 同样支持 watchOS WidgetKit 复杂功能组件（独立于完整应用）：

```bash
perry compile widget.ts --target watchos-widget --app-bundle-id com.example.app
```

有关小组件的专属文档，请参考 [watchOS 复杂功能组件](../widgets/watchos)。

## 限制

与其他 Perry 目标平台相比，watchOS 应用受限于平台固有约束：

- **无画布（Canvas）**：不支持 CoreGraphics 绘图
- **无摄像头**：watchOS 不提供摄像头相关 API
- **无文本输入框（TextField）**：Apple Watch 上的文本输入能力极有限
- **无文件对话框**：无文档选择器
- **无菜单栏/工具栏**：不适用于手表端
- **无多窗口**：仅支持单窗口
- **无二维码**：屏幕尺寸过小，不适合展示二维码
- **内存限制**：watchOS 设备可用内存约 50-75MB——需保持应用轻量化
- **屏幕尺寸**：需适配 40-49mm 表盘尺寸

## 与 iOS 的差异

- **SwiftUI vs UIKit**：watchOS 采用 SwiftUI 渲染；iOS 直接使用 UIKit
- **无启动屏**：watchOS 应用不使用启动故事板
- **独立运行**：watchOS 应用为独立运行模式（无需 iPhone 配套设备，`WKWatchOnly = true`）
- **设备族**：`UIDeviceFamily = [4]`（手表），而 iOS 为 `[1, 2]`（iPhone/iPad）

## 后续参考

- [watchOS 复杂功能组件](../widgets/watchos) — WidgetKit 复杂功能组件
- [iOS](ios) — iOS 平台参考
- [平台总览](overview) — 全平台说明
- [UI 总览](../ui/overview) — UI 系统说明