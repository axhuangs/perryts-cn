# tvOS

Perry 可针对 Apple TV 设备和 tvOS 模拟器编译 TypeScript 应用。

tvOS 基于 UIKit 框架（与 iOS 所用框架相同），因此 Perry 的 tvOS 支持共享一套基于 UIKit 的组件系统。核心差异体现在输入方式：Apple TV 应用通过 Siri 遥控器和游戏手柄操控，而非触控，且所有应用均以全屏模式运行。

## 环境要求

- 基于 macOS 的主机（暂不支持从 Linux/Windows 跨平台编译）
- 完整安装 Xcode（用于获取 tvOS SDK 和模拟器）
- Rust tvOS 目标平台：
  ```bash
  rustup target add aarch64-apple-tvos aarch64-apple-tvos-sim
  ```

## 针对模拟器编译

```bash
perry compile app.ts -o app --target tvos-simulator
```

该命令会生成一个 ARM64 架构的二进制文件，通过 `clang` 链接 tvOS 模拟器 SDK，并打包为 `.app` 应用束。

## 针对真机编译

```bash
perry compile app.ts -o app --target tvos
```

该命令会生成适用于物理 Apple TV 设备的 ARM64 架构二进制文件。

## 使用 `perry run` 运行应用

```bash
perry run tvos                        # 自动检测已启动的 Apple TV 模拟器
perry run tvos --simulator <UDID>     # 指定目标模拟器
```

Perry 可自动发现已启动的 Apple TV 模拟器。如需手动安装并启动应用：

```bash
xcrun simctl install booted app.app
xcrun simctl launch booted com.perry.app
```

## UI 工具集

Perry 将 UI 组件映射为 tvOS 上的 UIKit 控件，与 iOS 完全一致：

| Perry 组件 | UIKit 类 | 说明 |
|-------------|------------|-------|
| Text | UILabel | - |
| Button | UIButton | 基于焦点的导航 |
| TextField | UITextField | 通过 Siri 遥控器唤起屏幕键盘 |
| Toggle | UISwitch | - |
| Slider | UISlider | - |
| Picker | UIPickerView | - |
| Image | UIImageView | - |
| VStack/HStack | UIStackView | - |
| ScrollView | UIScrollView | 基于焦点的滚动 |

### 焦点引擎

tvOS 采用**基于焦点的导航模型**，而非直接触控。用户可通过 Siri 遥控器的触控板和方向键在可聚焦视图间切换焦点。Perry 中所有支持交互的组件（按钮、文本框、开关等）均默认具备可聚焦属性。

## 游戏引擎支持

tvOS 尤其适配游戏引擎场景。使用 [Bloom](https://bloomengine.dev) 等原生库时，游戏引擎可自行处理窗口管理、渲染及输入逻辑：

```typescript
import { initWindow, windowShouldClose, beginDrawing, endDrawing,
         clearBackground, isGamepadButtonDown, Colors } from "bloom";

initWindow(1920, 1080, "My Apple TV Game");

while (!windowShouldClose()) {
  beginDrawing();
  clearBackground(Colors.BLACK);

  if (isGamepadButtonDown(0)) {
    // 按下 A 键（Siri 遥控器确认键）
  }

  endDrawing();
}
```

### tvOS 输入映射

Siri 遥控器可作为游戏手柄使用，输入映射关系如下：

| 输入操作 | 映射关系 |
|-------|---------|
| 触控板滑动 | 游戏手柄坐标轴 0/1（左摇杆） |
| 触控板点击（确认） | 游戏手柄按键 0（A 键）+ 鼠标按键 0 |
| 菜单键 | 游戏手柄按键 1（B 键） |
| 播放/暂停键 | 游戏手柄按键 9（开始键） |
| 方向键按压（上/下/左/右） | 游戏手柄方向键（12-15 号按键） |

扩展型游戏手柄（MFi、PlayStation、Xbox）均全面支持，所有坐标轴、按键、扳机键和方向键均通过标准游戏手柄 API 完成映射。

## 应用生命周期

tvOS 应用通过 `UIApplicationMain` 管理生命周期，与 iOS 一致。使用 `perry/ui` 时的示例代码：

```typescript
import { App, Text, VStack } from "perry/ui";

App({
  title: "My TV App",
  width: 1920,
  height: 1080,
  body: VStack(16, [
    Text("Hello, Apple TV!"),
  ]),
});
```

当结合游戏引擎并启用 `--features ios-game-loop` 特性时，运行时会在主线程启动 `UIApplicationMain`，并在专用游戏线程执行游戏代码。

## 配置

可在 `perry.toml` 中配置 tvOS 相关参数：

```toml
[tvos]
bundle_id = "com.example.mytvapp"
deployment_target = "17.0"
```

## 平台检测

编译时可通过 `__platform__ === 6` 检测 tvOS 平台：

```typescript
declare const __platform__: number;

if (__platform__ === 6) {
  console.log("Running on tvOS");
}
```

## 应用束

Perry 生成的 `.app` 应用束包含 `Info.plist` 文件，其中关键配置如下：

| 键名 | 取值 | 说明 |
|-----|-------|-------|
| `UIDeviceFamily` | `[3]` | 标识为 Apple TV 设备 |
| `MinimumOSVersion` | `17.0` | 最低兼容 tvOS 17.0 |
| `UIRequiresFullScreen` | `true` | tvOS 应用均为全屏运行 |
| `UILaunchStoryboardName` | `LaunchScreen` | tvOS 强制要求配置 |

## 限制

与 Perry 其他目标平台相比，tvOS 存在以下固有平台约束：

- **无摄像头**：Apple TV 无摄像头硬件
- **无剪贴板**：tvOS 不支持 UIPasteboard
- **无文件对话框**：无文档选择器功能
- **无二维码功能**：无摄像头用于扫码
- **无多窗口**：仅支持单全屏窗口
- **无直接触控**：输入仅支持 Siri 遥控器焦点引擎和游戏手柄
- **分辨率**：需适配 1920x1080（1080p）或 3840x2160（4K）显示分辨率

## 与 iOS 的差异

| 维度 | tvOS | iOS |
|--------|------|-----|
| **输入方式** | Siri 遥控器 + 游戏手柄（焦点引擎） | 直接触控 |
| **显示模式** | 仅全屏（1080p/4K） | 适配多种屏幕尺寸 |
| **设备类型** | `[3]`（Apple TV） | `[1, 2]`（iPhone/iPad） |
| **摄像头** | 不可用 | 可用 |
| **剪贴板** | 不可用 | 可用 |
| **最低系统版本** | 17.0 | 17.0 |
| **UI 框架** | UIKit（与 iOS 一致） | UIKit |

## 后续参考

- [iOS](ios) — iOS 平台参考（共享 UIKit 基础）
- [watchOS](watchos) — watchOS 平台参考
- [平台概览](overview) — 全平台概览