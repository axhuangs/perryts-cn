# 事件

Perry 小部件支持用于用户交互的原生事件处理器。

## onClick

```typescript
import { Button, Text } from "perry/ui";

Button("Click me", () => {
  console.log("Button clicked!");
});

// 或在创建后设置
const label = Text("Clickable text");
label.setOnClick(() => {
  console.log("Text clicked!");
});
```

## onHover

当鼠标进入或离开小部件时触发。

```typescript
import { Button } from "perry/ui";

const btn = Button("Hover me", () => {});
btn.setOnHover((isHovering) => {
  if (isHovering) {
    console.log("Mouse entered");
  } else {
    console.log("Mouse left");
  }
});
```

> **注意**：悬停事件在 macOS、Windows、Linux 和 Web 上可用。iOS 和 Android 使用触摸交互。

## onDoubleClick

```typescript
import { Text } from "perry/ui";

const label = Text("Double-click me");
label.setOnDoubleClick(() => {
  console.log("Double-clicked!");
});
```

## 键盘快捷键

注册应用内键盘快捷键（当应用聚焦时激活）：

```typescript
import { addKeyboardShortcut } from "perry/ui";

// macOS 上 Cmd+N，其他平台 Ctrl+N
addKeyboardShortcut("n", 1, () => {
  console.log("New document");
});

// Cmd+Shift+S（修饰符：1=Cmd/Ctrl, 2=Shift, 4=Option/Alt, 8=Control）
addKeyboardShortcut("s", 3, () => {
  console.log("Save as...");
});
```

键盘快捷键也支持在 [menu items](menus.md) 中：

```typescript
menuAddItem(menu, "New", () => newDoc(), "n");    // Cmd+N
menuAddItem(menu, "Save As", () => saveAs(), "S"); // Cmd+Shift+S
```

## 全局热键

注册系统范围的热键，即使应用在后台也能工作 — 对启动器、剪贴板管理器和快速访问工具至关重要：

```typescript
import { registerGlobalHotkey } from "perry/ui";

// Cmd+Space (macOS) / Ctrl+Space (Windows)
registerGlobalHotkey("space", 1, () => {
  // 显示/隐藏启动器
});

// Cmd+Shift+V (剪贴板管理器)
registerGlobalHotkey("v", 3, () => {
  // 显示剪贴板历史
});
```

**修饰符位：** `1` = Cmd (macOS) / Ctrl (Windows), `2` = Shift, `4` = Option (macOS) / Alt (Windows), `8` = Control (仅 macOS)。通过相加组合：`3` = Cmd+Shift, `5` = Cmd+Option 等。

| Platform | Implementation |
|----------|---------------|
| macOS | `NSEvent.addGlobalMonitorForEvents` + `addLocalMonitorForEvents` |
| Windows | `RegisterHotKey` + `WM_HOTKEY` dispatch in message loop |
| Linux | Not yet supported (requires X11 `XGrabKey` or Wayland portal) |

> **macOS 注意：** 全局事件监控需要辅助功能权限。用户会在首次使用时看到系统提示。

> **Linux 注意：** 全局热键是一个已知限制。在 X11 上，`XGrabKey` 是可能的但尚未实现。在 Wayland 上，`GlobalShortcuts` 门户对合成器的支持有限。

## 剪贴板

```typescript
import { clipboardGet, clipboardSet } from "perry/ui";

// 复制到剪贴板
clipboardSet("Hello, clipboard!");

// 从剪贴板读取
const text = clipboardGet();
```

## 完整示例

```typescript
import { App, Text, Button, VStack, HStack, State, Spacer, registerShortcut } from "perry/ui";

const lastEvent = State("No events yet");

// 全局快捷键
registerShortcut("r", () => {
  lastEvent.set("Keyboard: Cmd+R");
});

const hoverBtn = Button("Hover me", () => {});
hoverBtn.setOnHover((h) => {
  lastEvent.set(h ? "Mouse entered" : "Mouse left");
});

const dblLabel = Text("Double-click me");
dblLabel.setOnDoubleClick(() => {
  lastEvent.set("Double-clicked!");
});

App({
  title: "Events Demo",
  width: 400,
  height: 300,
  body: VStack(16, [
    Text(`Last event: ${lastEvent.value}`),

    Spacer(),

    Button("Click me", () => {
      lastEvent.set("Button clicked");
    }),

    hoverBtn,
    dblLabel,
  ]),
});
```

## 下一步

- [Menus](menus.md) — 带有键盘快捷键的菜单栏和上下文菜单
- [Widgets](widgets.md) — 所有可用的小部件
- [State Management](state.md) — 反应式状态