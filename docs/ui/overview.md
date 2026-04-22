# UI 概述

Perry 的 `perry/ui` 模块让您可以使用声明式 TypeScript 构建原生桌面和移动应用。您的 UI 代码直接编译到平台原生小部件 — macOS 上的 AppKit、iOS 上的 UIKit、Linux 上的 GTK4、Windows 上的 Win32，以及 web 上的 DOM 元素。

## 快速开始

```typescript
import { App, Text, VStack } from "perry/ui";

App({
  title: "My App",
  width: 400,
  height: 300,
  body: VStack(16, [
    Text("Hello from Perry!"),
  ]),
});
```

```bash
perry app.ts -o app && ./app
```

## 思维模型

Perry 的 UI 遵循与 SwiftUI 和 Flutter 相同的模型：您使用基于栈的布局容器 (`VStack`、`HStack`、`ZStack`) 组合原生小部件，控制对齐和分布，并通过方法调用直接样式化小部件。如果您来自 web 开发，关键转变是：

- **布局** 由栈对齐、分布和间隔符控制 — 不是 CSS 属性。请参见 [布局](layout.md)。
- **样式化** 直接应用于小部件 — 不是通过样式表。请参见 [样式化](styling.md)。
- **绝对定位** 使用覆盖 (`widgetAddOverlay` + `widgetSetOverlayFrame`) — 不是 `position: absolute/relative`。
- **设计令牌** 来自 `perry-styling` 包。请参见 [主题](theming.md)。

## 应用生命周期

每个 Perry UI 应用从 `App()` 开始：

```typescript
import { App, VStack, Text } from "perry/ui";

App({
  title: "Window Title",
  width: 800,
  height: 600,
  body: VStack(16, [
    Text("Content here"),
  ]),
});
```

`App({})` 接受具有以下属性的配置对象：

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| `title` | string | 窗口标题 |
| `width` | number | 初始窗口宽度 |
| `height` | number | 初始窗口高度 |
| `body` | widget | 根小部件 |
| `icon` | string | 应用图标文件路径 (可选) |
| `frameless` | boolean | 移除标题栏 (可选) |
| `level` | string | 窗口 z 顺序: `"floating"`、`"statusBar"`、`"modal"` (可选) |
| `transparent` | boolean | 透明背景 (可选) |
| `vibrancy` | string | 原生模糊材质，例如 `"sidebar"` (可选) |
| `activationPolicy` | string | `"regular"`、`"accessory"` (无 dock 图标)、`"background"` (可选) |

请参见 [多窗口](multi-window.md) 获取窗口属性的完整文档。

### 生命周期钩子

```typescript
import { App, onActivate, onTerminate } from "perry/ui";

onActivate(() => {
  console.log("App became active");
});

onTerminate(() => {
  console.log("App is closing");
});

App({ title: "My App", width: 800, height: 600, body: /* ... */ });
```

## 小部件树

Perry UI 构建为小部件树：

```typescript
import { App, Text, Button, VStack, HStack } from "perry/ui";

App({
  title: "Layout Demo",
  width: 400,
  height: 300,
  body: VStack(16, [
    Text("Header"),
    HStack(8, [
      Button("Left", () => console.log("left")),
      Button("Right", () => console.log("right")),
    ]),
    Text("Footer"),
  ]),
});
```

小部件通过调用它们的构造函数函数创建。布局容器 (`VStack`、`HStack`、`ZStack`) 接受间距值 (以点为单位)，后跟子小部件数组。

## 基于句柄的架构

在底层，每个小部件是一个句柄 — 一个引用原生平台对象的整数。当您调用 `Text("hello")` 时，Perry 创建一个原生 `NSTextField` (macOS)、`UILabel` (iOS)、`GtkLabel` (Linux) 或 `<span>` (web) 并返回一个您可以用来修改它的句柄。

```typescript
const label = Text("Hello");
label.setFontSize(18);        // 通过句柄修改原生小部件
label.setColor("#FF0000");     //
```

## 导入

所有 UI 函数从 `perry/ui` 导入：

```typescript
import {
  // 应用生命周期
  App, onActivate, onTerminate,

  // 小部件
  Text, Button, TextField, SecureField, Toggle, Slider,
  Image, ProgressView, Picker,

  // 布局
  VStack, HStack, ZStack, ScrollView, Spacer, Divider,
  NavigationStack, LazyVStack, Form, Section,
  VStackWithInsets, HStackWithInsets, SplitView, splitViewAddChild,

  // 布局控制
  stackSetAlignment, stackSetDistribution, stackSetDetachesHidden,
  widgetMatchParentWidth, widgetMatchParentHeight, widgetSetHugging,
  widgetAddOverlay, widgetSetOverlayFrame,

  // 状态
  State, ForEach,

  // 对话框
  openFileDialog, saveFileDialog, alert, Sheet,

  // 菜单
  menuBarCreate, menuBarAddMenu, contextMenu,

  // 画布
  Canvas,

  // 表格
  Table,

  // 窗口
  Window,

  // 相机 (iOS)
  CameraView, cameraStart, cameraStop, cameraFreeze, cameraUnfreeze,
  cameraSampleColor, cameraSetOnTap,
} from "perry/ui";
```

## 平台差异

相同的代码在所有平台上运行，但外观和感觉匹配每个平台的原生风格：

| 功能 | macOS | iOS | Linux | Windows | Web |
|---------|-------|-----|-------|---------|-----|
| 按钮 | NSButton | UIButton | GtkButton | HWND Button | `<button>` |
| 文本 | NSTextField | UILabel | GtkLabel | Static HWND | `<span>` |
| 布局 | NSStackView | UIStackView | GtkBox | Manual layout | Flexbox |
| 菜单 | NSMenu | — | GMenu | HMENU | DOM |

平台特定行为在每个小部件的文档页面上注明。

## 下一步

- [小部件](widgets.md) — 所有可用小部件
- [布局](layout.md) — 排列小部件
- [状态管理](state.md) — 反应式状态和绑定
- [样式化](styling.md) — 颜色、字体、大小
- [事件](events.md) — 点击、悬停、键盘