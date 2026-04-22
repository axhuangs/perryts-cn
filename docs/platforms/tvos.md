# tvOS

Perry 可以为 Apple TV 设备和 tvOS 模拟器编译 TypeScript 应用。

tvOS 使用 UIKit (与 iOS 相同的框架)，因此 Perry 的 tvOS 支持共享相同的基于 UIKit 的小部件系统。主要区别是输入：Apple TV 应用通过 Siri Remote 和游戏控制器控制，而不是触摸，所有应用全屏运行。

## 要求

- macOS 主机 (不支持从 Linux/Windows 交叉编译)
- Xcode (完整安装) 用于 tvOS SDK 和模拟器
- Rust tvOS 目标：
  ```bash
  rustup target add aarch64-apple-tvos aarch64-apple-tvos-sim
  ```

## 为模拟器构建

```bash
perry compile app.ts -o app --target tvos-simulator
```

这生成与 tvOS 模拟器 SDK 链接的 ARM64 二进制文件，包装在 `.app` 包中。

## 为设备构建

```bash
perry compile app.ts -o app --target tvos
```

这为物理 Apple TV 硬件生成 ARM64 二进制文件。

## 使用 `perry run` 运行

```bash
perry run tvos                        # 自动检测已启动的 Apple TV 模拟器
perry run tvos --simulator <UDID>     # 针对特定模拟器
```

Perry 自动发现已启动的 Apple TV 模拟器。要手动安装和启动：

```bash
xcrun simctl install booted app.app
xcrun simctl launch booted com.perry.app
```

## UI 工具包

Perry 将 UI 小部件映射到 tvOS 上的 UIKit 控件，与 iOS 相同：

| Perry 小部件 | UIKit 类 | 备注 |
|-------------|------------|-------|
| Text | UILabel | |
| Button | UIButton | 基于焦点的导航 |
| TextField | UITextField | 通过 Siri Remote 的屏幕键盘 |
| Toggle | UISwitch | |
| Slider | UISlider | |
| Picker | UIPickerView | |
| Image | UIImageView | |
| VStack/HStack | UIStackView | |
| ScrollView | UIScrollView | 基于焦点的滚动 |

### 焦点引擎

tvOS 使用**基于焦点的导航模型**而不是直接触摸。Siri Remote 的触摸板和方向按钮在可聚焦视图之间移动焦点。支持交互的 Perry 小部件 (按钮、文本字段、切换等) 自动可聚焦。

## 游戏引擎支持

tvOS 特别适合游戏引擎。当使用原生库如 [Bloom](https://bloomengine.dev) 时，游戏引擎处理自己的窗口、渲染和输入：

```typescript
import { initWindow, windowShouldClose, beginDrawing, endDrawing,
         clearBackground, isGamepadButtonDown, Colors } from "bloom";

initWindow(1920, 1080, "My Apple TV Game");

while (!windowShouldClose()) {
  beginDrawing();
  clearBackground(Colors.BLACK);

  if (isGamepadButtonDown(0)) {
    // A 按钮 (Siri Remote 选择) 已按下
  }

  endDrawing();
}
```

### tvOS 上的输入

Siri Remote 充当游戏控制器：

| 输入 | 映射 |
|-------|---------|
| 触摸板滑动 | 游戏手柄轴 0/1 (左摇杆) |
| 触摸板点击 (选择) | 游戏手柄按钮 0 (A) + 鼠标按钮 0 |
| 菜单按钮 | 游戏手柄按钮 1 (B) |
| 播放/暂停按钮 | 游戏手柄按钮 9 (开始) |
| 箭头按键 (上/下/左/右) | 游戏手柄 D-pad 按钮 (12-15) |

扩展游戏控制器 (MFi、PlayStation、Xbox) 完全支持，所有轴、按钮、触发器和 D-pad 通过标准游戏手柄 API 映射。