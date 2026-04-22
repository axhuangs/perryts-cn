# iOS

Perry 可以为 iOS 设备和 iOS 模拟器交叉编译 TypeScript 应用。

## 要求

- macOS 主机 (不支持从 Linux/Windows 交叉编译)
- Xcode (完整安装，不是仅命令行工具) 用于 iOS SDK 和模拟器
- Rust iOS 目标：
  ```bash
  rustup target add aarch64-apple-ios aarch64-apple-ios-sim
  ```

## 为模拟器构建

```bash
perry app.ts -o app --target ios-simulator
```

这使用 LLVM 交叉编译与 iOS 模拟器 SDK 链接。可以在 Xcode 模拟器中运行二进制文件。

## 为设备构建

```bash
perry app.ts -o app --target ios
```

这为物理 iOS 设备生成 ARM64 二进制文件。您需要将其包装在 `.app` 包中以进行部署。

## 使用 `perry run` 运行

在 iOS 上构建和运行的最简单方法是 `perry run`：

```bash
perry run ios              # 自动检测设备/模拟器
perry run ios --console    # 流式传输实时 stdout/stderr
perry run ios --remote     # 使用 Perry Hub 构建服务器
```

Perry 自动发现可用的模拟器 (通过 `simctl`) 和物理设备 (通过 `devicectl`)。当发现多个目标时，交互式提示让您选择。

对于物理设备，Perry 自动处理代码签名 — 它从 `~/.perry/config.toml` 读取您的签名身份和团队 ID (通过 `perry setup ios` 设置)，嵌入配置文件，并在安装前签署 `.app`。

如果本地没有安装 iOS 交叉编译工具链，`perry run ios` 会自动回退到 Perry Hub 的远程构建服务器。

## UI 工具包

Perry 将 UI 小部件映射到 UIKit 控件：

| Perry 小部件 | UIKit 类 |
|-------------|------------|
| Text | UILabel |
| Button | UIButton (TouchUpInside) |
| TextField | UITextField |
| SecureField | UITextField (secureTextEntry) |
| Toggle | UISwitch |
| Slider | UISlider (Float32，在边界处转换) |
| Picker | UIPickerView |
| Image | UIImageView |
| VStack/HStack | UIStackView |
| ScrollView | UIScrollView |

## 应用生命周期

iOS 应用使用 `UIApplicationMain` 与延迟创建模式：

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

`App()` 调用触发 `UIApplicationMain`，您的渲染函数通过 `PerryAppDelegate` 在应用准备就绪时调用。

## iOS 小部件 (WidgetKit)

Perry 可以将 TypeScript 小部件声明编译为原生 SwiftUI WidgetKit 扩展：

```bash
perry widget.ts --target ios-widget
```

请参阅 [小部件 (WidgetKit)](../widgets/overview.md) 了解详情。

## 启动画面

Perry 从 `package.json` 中的 `perry.splash` 配置自动生成原生 `LaunchScreen.storyboard`。启动画面在冷启动期间立即显示。

```json
{
  "perry": {
    "splash": {
      "image": "logo/icon-256.png",