# iOS 平台适配指南

Perry 可将 TypeScript 应用交叉编译为适用于 iOS 设备和 iOS 模拟器的版本。

## 环境要求

- 基于 macOS 系统的主机（暂不支持从 Linux/Windows 系统进行交叉编译）
- 完整安装的 Xcode（非仅安装命令行工具），用于获取 iOS SDK 和模拟器环境
- Rust iOS 目标架构：
  ```bash
  rustup target add aarch64-apple-ios aarch64-apple-ios-sim
  ```

## 针对模拟器构建

```bash
perry app.ts -o app --target ios-simulator
```

该命令通过 iOS 模拟器 SDK 完成 LLVM 交叉编译，生成的二进制文件可在 Xcode 模拟器中运行。

## 针对物理设备构建

```bash
perry app.ts -o app --target ios
```

该命令生成适用于物理 iOS 设备的 ARM64 架构二进制文件。需对文件进行代码签名，并打包为 `.app` 应用包后才能部署。

## 使用 `perry run` 运行应用

构建并运行 iOS 应用最简便的方式是使用 `perry run` 命令：

```bash
perry run ios              # 自动检测设备/模拟器
perry run ios --console    # 实时输出标准输出/标准错误流
perry run ios --remote     # 使用 Perry Hub 构建服务器
```

Perry 会自动发现可用的模拟器（通过 `simctl`）和物理设备（通过 `devicectl`）。当检测到多个目标设备时，会弹出交互式提示供用户选择。

对于物理设备，Perry 会自动处理代码签名流程——从 `~/.perry/config.toml` 文件读取签名标识和团队 ID（需通过 `perry setup ios` 完成配置），嵌入配置描述文件，并在安装前对 `.app` 包完成签名。

若本地未安装 iOS 交叉编译工具链，`perry run ios` 命令会自动降级使用 Perry Hub 远程构建服务器。

## UI 工具集

Perry 将 UI 组件映射为对应的 UIKit 控件：

| Perry 组件 | UIKit 类 |
|-------------|------------|
| Text | UILabel |
| Button | UIButton (TouchUpInside) |
| TextField | UITextField |
| SecureField | UITextField (secureTextEntry) |
| Toggle | UISwitch |
| Slider | UISlider (Float32，边界处自动转换) |
| Picker | UIPickerView |
| Image | UIImageView |
| VStack/HStack | UIStackView |
| ScrollView | UIScrollView |

## 应用生命周期

iOS 应用通过 `UIApplicationMain` 函数采用延迟创建模式：

```typescript
import { App, Text, VStack } from "perry/ui";

App({
  title: "My iOS App",
  width: 400,
  height: 800,
  body: VStack(16, [
    Text("Hello, iPhone!"),
  ]),
});
```

`App()` 调用会触发 `UIApplicationMain` 函数，应用就绪后，`PerryAppDelegate` 会调用渲染函数。

## iOS 小组件（WidgetKit）

Perry 可将 TypeScript 小组件声明编译为原生 SwiftUI WidgetKit 扩展：

```bash
perry widget.ts --target ios-widget
```

更多详情请参见 [Widgets (WidgetKit)](../widgets/overview)。

## 启动页

Perry 会从 `package.json` 中的 `perry.splash` 配置自动生成原生 `LaunchScreen.storyboard` 文件。冷启动时，启动页会立即显示。

```json
{
  "perry": {
    "splash": {
      "image": "logo/icon-256.png",
      "background": "#FFF5EE"
    }
  }
}
```

图片会以 128x128pt 尺寸居中显示，缩放模式为 `scaleAspectFit`。若需完全自定义，可提供自定义的 storyboard 文件：

```json
{
  "perry": {
    "splash": {
      "ios": { "storyboard": "splash/LaunchScreen.storyboard" }
    }
  }
}
```

完整配置说明请参见 [项目配置](../getting-started/project-config#splash)。

## 资源打包

Perry 会自动将项目根目录下的 `logo/` 和 `assets/` 目录打包至 `.app` 应用包中。运行时可通过标准文件 API，以应用包路径为基准访问这些资源。

## 键盘适配

Perry 应用在 iOS 平台会自动处理键盘适配逻辑。键盘弹出时，根视图会通过带动画的布局过渡调整底部约束，且获得焦点的 TextField 会自动滚动至键盘上方可见区域。

## 与 macOS 平台的差异

- **无菜单栏**：iOS 不支持菜单栏，建议使用工具栏或导航栏交互模式。
- **触摸事件**：`onHover` 事件不可用，需使用 `onClick`（映射为触摸事件）。
- **滑块精度**：iOS UISlider 内部使用 Float32 类型（会自动完成类型转换）。
- **文件对话框**：仅支持 UIDocumentPicker。
- **键盘快捷键**：iOS 平台不适用。

## 后续参考

- [Widgets (WidgetKit)](../widgets/overview) — iOS 主屏小组件开发
- [平台概览](overview) — 全平台适配概览
- [UI 概述](../ui/overview) — UI 系统详解