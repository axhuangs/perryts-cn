# 事件

Perry 组件库支持用于用户交互的原生事件处理器。

## onClick（点击事件）

```typescript
import { Button, Text } from "perry/ui";

Button("Click me", () => {
  console.log("Button clicked!");
});

// 也可在创建后设置
const label = Text("Clickable text");
label.setOnClick(() => {
  console.log("Text clicked!");
});
```

## onHover（悬浮事件）

当鼠标进入或离开组件时触发。

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

> **注意**：悬浮事件支持 macOS、Windows、Linux 和 Web 平台。iOS 和 Android 平台则使用触摸交互替代。

## onDoubleClick（双击事件）

```typescript
import { Text } from "perry/ui";

const label = Text("Double-click me");
label.setOnDoubleClick(() => {
  console.log("Double-clicked!");
});
```

## 键盘快捷指令

注册应用内键盘快捷指令（应用获得焦点时生效）：

```typescript
import { addKeyboardShortcut } from "perry/ui";

// macOS 下为 Cmd+N，其他平台为 Ctrl+N
addKeyboardShortcut("n", 1, () => {
  console.log("New document");
});

// Cmd+Shift+S（修饰符：1=Cmd/Ctrl，2=Shift，4=Option/Alt，8=Control）
addKeyboardShortcut("s", 3, () => {
  console.log("Save as...");
});
```

键盘快捷指令同样支持在[菜单](menus)中使用：

```typescript
menuAddItem(menu, "New", () => newDoc(), "n");    // Cmd+N
menuAddItem(menu, "Save As", () => saveAs(), "S"); // Cmd+Shift+S
```

## 全局热键

注册系统级全局热键，即使应用处于后台也可生效——适用于启动器、剪贴板管理器、快速访问工具等场景：

```typescript
import { registerGlobalHotkey } from "perry/ui";

// macOS 下为 Cmd+Space / Windows 下为 Ctrl+Space
registerGlobalHotkey("space", 1, () => {
  // 显示/隐藏启动器
});

// Cmd+Shift+V（剪贴板管理器）
registerGlobalHotkey("v", 3, () => {
  // 显示剪贴板历史记录
});
```

**修饰符位**：`1` = Cmd（macOS）/ Ctrl（Windows），`2` = Shift，`4` = Option（macOS）/ Alt（Windows），`8` = Control（仅 macOS）。可通过相加组合：`3` = Cmd+Shift，`5` = Cmd+Option 等。

| 平台    | 实现方式 |
|---------|----------|
| macOS   | `NSEvent.addGlobalMonitorForEvents` + `addLocalMonitorForEvents` |
| Windows | `RegisterHotKey` + 消息循环中的 `WM_HOTKEY` 分发 |
| Linux   | 暂未支持（需实现 X11 `XGrabKey` 或 Wayland 门户） |

> **macOS 说明**：全局事件监听需要辅助功能权限。用户首次使用时会看到系统权限提示框。

> **Linux 说明**：全局热键是已知的功能限制。在 X11 环境下，`XGrabKey` 方案具备可行性但暂未实现；在 Wayland 环境下，`GlobalShortcuts` 门户的合成器支持度有限。

## 剪贴板

```typescript
import { clipboardGet, clipboardSet } from "perry/ui";

// 写入剪贴板
clipboardSet("Hello, clipboard!");

// 读取剪贴板
const text = clipboardGet();
```

## 完整示例

```typescript
import { App, Text, Button, VStack, HStack, State, Spacer, registerShortcut } from "perry/ui";

const lastEvent = State("No events yet");

// 全局快捷指令
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

## 后续参考

- [Menus](menus) — 支持键盘快捷指令的菜单栏和上下文菜单
- [Widgets](widgets) — 所有可用组件
- [State](state) — 响应式状态