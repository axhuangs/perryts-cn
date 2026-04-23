# UI 概览

Perry 框架的 `perry/ui` 模块允许你使用声明式 TypeScript 构建原生桌面端和移动端应用。你的 UI 代码会直接编译为各平台的原生控件——macOS 上的 AppKit、iOS 上的 UIKit、Linux 上的 GTK4、Windows 上的 Win32，以及网页端的 DOM 元素。

## 快速开始

```typescript
import { App, Text, VStack } from "perry/ui";

App({
  title: "我的应用",
  width: 400,
  height: 300,
  body: VStack(16, [
    Text("来自 Perry 的问候！"),
  ]),
});
```

```bash
perry app.ts -o app && ./app
```

## 核心设计思路

Perry UI 遵循与 SwiftUI 和 Flutter 一致的设计模式：通过基于栈的布局容器（`VStack`、`HStack`、`ZStack`）组合原生控件，控制对齐方式与分布规则，并通过方法调用直接为控件设置样式。如果你有网页开发背景，需要重点理解以下核心差异：

- **布局**：由栈的对齐方式、分布规则和间隔控件（Spacer）控制——而非 CSS 属性。详见 [布局](layout.md)。
- **样式**：直接应用于控件本身——而非通过样式表。详见 [样式](styling.md)。
- **绝对定位**：通过叠加层实现（`widgetAddOverlay` + `widgetSetOverlayFrame`）——而非 `position: absolute/relative`。
- **设计令牌**：源自 `perry-styling` 包。详见 [主题](theming.md)。

## 应用生命周期

每个 Perry UI 应用都以 `App()` 函数为入口：

```typescript
import { App, VStack, Text } from "perry/ui";

App({
  title: "窗口标题",
  width: 800,
  height: 600,
  body: VStack(16, [
    Text("内容区域"),
  ]),
});
```

`App({})` 接收一个配置对象，包含以下属性：

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| `title` | 字符串 | 窗口标题 |
| `width` | 数字 | 初始窗口宽度 |
| `height` | 数字 | 初始窗口高度 |
| `body` | 控件 | 根控件 |
| `icon` | 字符串 | 应用图标文件路径（可选） |
| `frameless` | 布尔值 | 移除标题栏（可选） |
| `level` | 字符串 | 窗口层级（z-order）：`"floating"`（悬浮）、`"statusBar"`（状态栏）、`"modal"`（模态）（可选） |
| `transparent` | 布尔值 | 背景透明（可选） |
| `vibrancy` | 字符串 | 原生模糊材质，例如 `"sidebar"`（侧边栏）（可选） |
| `activationPolicy` | 字符串 | 激活策略：`"regular"`（常规）、`"accessory"`（辅助，无 Dock 图标）、`"background"`（后台）（可选） |

有关窗口属性的完整说明，详见 [多窗口](multi-window.md) 文档。

### 生命周期钩子

```typescript
import { App, onActivate, onTerminate } from "perry/ui";

onActivate(() => {
  console.log("应用已激活");
});

onTerminate(() => {
  console.log("应用即将关闭");
});

App({ title: "我的应用", width: 800, height: 600, body: /* 控件内容 */ });
```

## 控件树

Perry UI 基于控件树的结构构建：

```typescript
import { App, Text, Button, VStack, HStack } from "perry/ui";

App({
  title: "布局示例",
  width: 400,
  height: 300,
  body: VStack(16, [
    Text("页头"),
    HStack(8, [
      Button("左侧", () => console.log("左侧按钮点击")),
      Button("右侧", () => console.log("右侧按钮点击")),
    ]),
    Text("页脚"),
  ]),
});
```

控件通过调用其构造函数创建。布局容器（`VStack`、`HStack`、`ZStack`）接收一个间距值（单位为点），后接子控件数组。

## 句柄式架构

底层实现中，每个控件都是一个**句柄（handle）**——一个指向原生平台对象的小整数。当你调用 `Text("hello")` 时，Perry 会创建原生控件（macOS 为 `NSTextField`、iOS 为 `UILabel`、Linux 为 `GtkLabel`、网页端为 `<span>`），并返回一个可用于修改该控件的句柄。

```typescript
const label = Text("你好");
label.setFontSize(18);        // 修改原生控件
label.setColor("#FF0000");     // 通过句柄操作
```

## 导入说明

所有 UI 相关函数均从 `perry/ui` 导入：

```typescript
import {
  // 应用生命周期
  App, onActivate, onTerminate,

  // 基础控件
  Text, Button, TextField, SecureField, Toggle, Slider,
  Image, ProgressView, Picker,

  // 布局容器
  VStack, HStack, ZStack, ScrollView, Spacer, Divider,
  NavigationStack, LazyVStack, Form, Section,
  VStackWithInsets, HStackWithInsets, SplitView, splitViewAddChild,

  // 布局控制
  stackSetAlignment, stackSetDistribution, stackSetDetachesHidden,
  widgetMatchParentWidth, widgetMatchParentHeight, widgetSetHugging,
  widgetAddOverlay, widgetSetOverlayFrame,

  // 状态管理
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

  // 相机（iOS 专属）
  CameraView, cameraStart, cameraStop, cameraFreeze, cameraUnfreeze,
  cameraSampleColor, cameraSetOnTap,
} from "perry/ui";
```

## 平台差异

相同代码可运行于所有平台，但视觉与交互体验会匹配各平台的原生风格：

| 功能 | macOS | iOS | Linux | Windows | Web |
|---------|-------|-----|-------|---------|-----|
| 按钮 | NSButton | UIButton | GtkButton | HWND 按钮 | `<button>` |
| 文本 | NSTextField | UILabel | GtkLabel | 静态 HWND | `<span>` |
| 布局 | NSStackView | UIStackView | GtkBox | 手动布局 | Flexbox |
| 菜单 | NSMenu | — | GMenu | HMENU | DOM |

各控件文档页会标注平台特有行为。

## 后续参考

- [Widgets](widgets.md) — 所有可用组件说明
- [Layout](layout.md) — 控件排列方式
- [State](state.md) — 响应式状态与数据绑定
- [Styling](styling.md) — 颜色、字体、尺寸设置
- [Events](events.md) — 点击、悬浮、键盘事件处理
