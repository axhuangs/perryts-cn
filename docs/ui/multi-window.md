# 多窗口与窗口管理

Perry 支持创建多个原生窗口，并可控制其外观和行为。

## 创建窗口

```typescript
import { App, Window, Text, Button, VStack } from "perry/ui";

const win = Window("Settings", 500, 400);
win.setBody(VStack(16, [
  Text("Settings panel"),
]));
win.show();

App({
  title: "My App",
  width: 800,
  height: 600,
  body: VStack(16, [
    Text("Main Window"),
    Button("Open Settings", () => win.show()),
  ]),
});
```

`Window(title, width, height)` 用于创建新的原生窗口。调用 `.setBody()` 方法可设置窗口内容，调用 `.show()` 方法可显示窗口。

## 窗口实例方法

```typescript
const win = Window("My Window", 600, 400);

win.setBody(widget);     // 设置根组件
win.show();              // 显示窗口
win.hide();              // 隐藏窗口（不销毁）
win.closeWindow();       // 关闭并销毁窗口
win.onFocusLost(() => {  // 窗口失去焦点时触发
  win.hide();
});
```

## 应用窗口属性

主 `App({})` 配置对象支持多项窗口属性，可用于构建启动器样式、浮层或工具类应用：

```typescript
import { App, Text, VStack } from "perry/ui";

App({
  title: "QuickLaunch",
  width: 600,
  height: 80,
  frameless: true,
  level: "floating",
  transparent: true,
  vibrancy: "sidebar",
  activationPolicy: "accessory",
  body: VStack(8, [
    Text("Search..."),
  ]),
});
```

### `frameless: true`

移除窗口标题栏和边框，创建无边框窗口。

| 平台      | 实现方式                                  |
|-----------|-------------------------------------------|
| macOS     | `NSWindowStyleMask::Borderless` + 背景可移动 |
| Windows   | `WS_POPUP` 窗口样式                       |
| Linux     | `set_decorated(false)`                    |

### `level: "floating" | "statusBar" | "modal" | "normal"`

控制窗口相对于其他窗口的层级（z-order）。

| 层级       | 描述                 |
|------------|----------------------|
| `"normal"` | 默认窗口层级         |
| `"floating"` | 始终显示在普通窗口上方 |
| `"statusBar"` | 始终显示在浮动窗口上方 |
| `"modal"`  | 模态面板层级         |

| 平台      | 实现方式                                      |
|-----------|-----------------------------------------------|
| macOS     | `NSWindow.level`（NSFloatingWindowLevel 等）  |
| Windows   | 带 `HWND_TOPMOST` 参数的 `SetWindowPos` 方法  |
| Linux     | `set_modal(true)`（尽力实现）                 |

### `transparent: true`

设置窗口背景透明，使桌面可透过 UI 非不透明区域显示。

| 平台      | 实现方式                                          |
|-----------|---------------------------------------------------|
| macOS     | `isOpaque = false`、`backgroundColor = .clear`    |
| Windows   | 带 `SetLayeredWindowAttributes` 的 `WS_EX_LAYERED` |
| Linux     | CSS 样式 `background-color: transparent`         |

### `vibrancy: string`

为窗口背景应用原生半透明材质。macOS 下使用系统毛玻璃效果；Windows 下使用云母（Mica）/亚克力（Acrylic）效果。

**macOS 材质值**：`"sidebar"`、`"titlebar"`、`"selection"`、`"menu"`、`"popover"`、`"headerView"`、`"sheet"`、`"windowBackground"`、`"hudWindow"`、`"fullScreenUI"`、`"tooltip"`、`"contentBackground"`、`"underWindowBackground"`、`"underPageBackground"`

| 平台      | 实现方式                                                                 |
|-----------|--------------------------------------------------------------------------|
| macOS     | 带指定材质的 `NSVisualEffectView`                                        |
| Windows   | `DwmSetWindowAttribute(DWMWA_SYSTEMBACKDROP_TYPE)`——根据材质适配云母、亚克力或云母替代效果（Windows 11 22H2+） |
| Linux     | CSS 样式 `alpha(@window_bg_color, 0.85)`（尽力实现）                      |

### `activationPolicy: "regular" | "accessory" | "background"`

控制应用是否显示在 Dock/任务栏中。

| 策略        | 描述                                       |
|-------------|--------------------------------------------|
| `"regular"` | 常规应用，显示 Dock 图标和菜单栏（默认值） |
| `"accessory"` | 无 Dock 图标、无菜单栏激活——适用于启动器和工具类应用 |
| `"background"` | 完全隐藏于 Dock 和应用切换器中             |

| 平台      | 实现方式                                  |
|-----------|-------------------------------------------|
| macOS     | `NSApp.setActivationPolicy()`             |
| Windows   | `WS_EX_TOOLWINDOW`（从任务栏移除）        |
| Linux     | `set_deletable(false)`（尽力实现）        |

## 独立窗口函数

窗口管理也可通过独立函数实现，用于操作窗口句柄：

```typescript
import { Window, windowHide, windowSetSize, onWindowFocusLost } from "perry/ui";

const win = Window("Panel", 400, 300);

// 隐藏/显示
windowHide(win);

// 动态调整尺寸
windowSetSize(win, 600, computedHeight);

// 监听焦点丢失事件
onWindowFocusLost(win, () => {
  windowHide(win);
});
```

## 平台说明

| 平台      | 实现方式                |
|-----------|-------------------------|
| macOS     | NSWindow                |
| Windows   | CreateWindowEx (HWND)   |
| Linux     | GtkWindow               |
| Web       | 浮动 `<div>` 元素       |
| iOS/Android | 模态视图控制器 / 对话框  |

在移动平台上，“窗口”以模态视图或对话框形式呈现，因为移动应用通常采用单窗口模式。

## 后续参考

- [Events](events) — 全局热键与键盘快捷键
- [Dialogs](dialogs) — 模态对话框与表单页
- [Menus](menus) — 菜单栏与工具栏
- [UI Overview](overview) — UI 系统完整概述