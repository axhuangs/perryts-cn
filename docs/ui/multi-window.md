# 多窗口和窗口管理

Perry 支持创建多个原生窗口并控制其外观和行为。

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

`Window(title, width, height)` 创建一个新的原生窗口。调用 `.setBody()` 设置其内容，调用 `.show()` 显示它。

## 窗口实例方法

```typescript
const win = Window("My Window", 600, 400);

win.setBody(widget);     // 设置根小部件
win.show();              // 显示窗口
win.hide();              // 隐藏而不销毁
win.closeWindow();       // 关闭并销毁
win.onFocusLost(() => {  // 当窗口失去焦点时调用
  win.hide();
});
```

## 应用程序窗口属性

主 `App({})` 配置对象支持几个窗口属性，用于构建启动器风格、覆盖或实用程序应用：

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

移除窗口标题栏和框架，创建一个无边框窗口。

| Platform | Implementation |
|----------|---------------|
| macOS | `NSWindowStyleMask::Borderless` + movable by background |
| Windows | `WS_POPUP` window style |
| Linux | `set_decorated(false)` |

### `level: "floating" | "statusBar" | "modal" | "normal"`

控制窗口相对于其他窗口的 z 顺序级别。

| Level | Description |
|-------|-------------|
| `"normal"` | 默认窗口级别 |
| `"floating"` | 保持在正常窗口之上 |
| `"statusBar"` | 保持在浮动窗口之上 |
| `"modal"` | 模态面板级别 |

| Platform | Implementation |
|----------|---------------|
| macOS | `NSWindow.level` (NSFloatingWindowLevel, etc.) |
| Windows | `SetWindowPos` with `HWND_TOPMOST` |
| Linux | `set_modal(true)` (best-effort) |

### `transparent: true`

使窗口背景透明，允许桌面通过 UI 的非不透明区域显示。

| Platform | Implementation |
|----------|---------------|
| macOS | `isOpaque = false`, `backgroundColor = .clear` |
| Windows | `WS_EX_LAYERED` with `SetLayeredWindowAttributes` |
| Linux | CSS `background-color: transparent` |

### `vibrancy: string`

将原生半透明材质应用于窗口背景。在 macOS 上使用系统 vibrancy 效果；在 Windows 上使用 Mica/Acrylic。

**macOS materials:** `"sidebar"`, `"titlebar"`, `"selection"`, `"menu"`, `"popover"`, `"headerView"`, `"sheet"`, `"windowBackground"`, `"hudWindow"`, `"fullScreenUI"`, `"tooltip"`, `"contentBackground"`, `"underWindowBackground"`, `"underPageBackground"`

| Platform | Implementation |
|----------|---------------|
| macOS | `NSVisualEffectView` with the specified material |
| Windows | `DwmSetWindowAttribute(DWMWA_SYSTEMBACKDROP_TYPE)` — Mica, Acrylic, or Mica Alt depending on material (Windows 11 22H2+) |
| Linux | CSS `alpha(@window_bg_color, 0.85)` (best-effort) |

### `activationPolicy: "regular" | "accessory" | "background"`

控制应用是否出现在 dock/taskbar 中。

| Policy | Description |
|--------|-------------|
| `"regular"` | 正常应用，有 dock 图标和菜单栏（默认） |
| `"accessory"` | 无 dock 图标，无菜单栏激活 — 适合启动器和实用程序 |
| `"background"` | 完全隐藏在 dock 和应用切换器中 |

| Platform | Implementation |
|----------|---------------|
| macOS | `NSApp.setActivationPolicy()` |
| Windows | `WS_EX_TOOLWINDOW` (removes from taskbar) |
| Linux | `set_deletable(false)` (best-effort) |

## 独立窗口函数

窗口管理也可作为独立函数用于窗口句柄：

```typescript
import { Window, windowHide, windowSetSize, onWindowFocusLost } from "perry/ui";

const win = Window("Panel", 400, 300);

// 隐藏/显示
windowHide(win);

// 动态调整大小
windowSetSize(win, 600, computedHeight);

// 对焦点丢失做出反应
onWindowFocusLost(win, () => {
  windowHide(win);
});
```

## 平台说明

| Platform | Implementation |
|----------|---------------|
| macOS | NSWindow |
| Windows | CreateWindowEx (HWND) |
| Linux | GtkWindow |
| Web | Floating `<div>` |
| iOS/Android | Modal view controller / Dialog |

在移动平台上，“窗口”作为模态视图或对话框呈现，因为移动应用通常使用单窗口模型。

## 下一步

- [Events](events.md) — 全局热键和键盘快捷键
- [Dialogs](dialogs.md) — 模态对话框和表单
- [Menus](menus.md) — 菜单栏和工具栏
- [UI Overview](overview.md) — 完整 UI 系统概述