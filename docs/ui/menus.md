# 菜单

Perry 跨所有平台支持原生菜单栏、上下文菜单和工具栏项。

## 菜单栏

创建原生应用菜单栏：

```typescript

import { App, VStack, Text, menuBarCreate, menuBarAddMenu, menuAddItem, menuAddSeparator, menuAddSubmenu, menuBarAttach } from "perry/ui";

// 在 App(...) 之前构建菜单栏
const menuBar = menuBarCreate();

// 文件菜单
const fileMenu = menuBarAddMenu(menuBar, "File");
menuAddItem(fileMenu, "New", () => newDoc(), "n");         // Cmd+N
menuAddItem(fileMenu, "Open", () => openDoc(), "o");       // Cmd+O
menuAddSeparator(fileMenu);
menuAddItem(fileMenu, "Save", () => saveDoc(), "s");       // Cmd+S
menuAddItem(fileMenu, "Save As...", () => saveAs(), "S");  // Cmd+Shift+S

// 编辑菜单
const editMenu = menuBarAddMenu(menuBar, "Edit");
menuAddItem(editMenu, "Undo", () => undo(), "z");
menuAddItem(editMenu, "Redo", () => redo(), "Z");         // Cmd+Shift+Z
menuAddSeparator(editMenu);
menuAddItem(editMenu, "Cut", () => cut(), "x");
menuAddItem(editMenu, "Copy", () => copy(), "c");
menuAddItem(editMenu, "Paste", () => paste(), "v");

// 子菜单
const viewMenu = menuBarAddMenu(menuBar, "View");
const zoomSubmenu = menuAddSubmenu(viewMenu, "Zoom");
menuAddItem(zoomSubmenu, "Zoom In", () => zoomIn(), "+");
menuAddItem(zoomSubmenu, "Zoom Out", () => zoomOut(), "-");
menuAddItem(zoomSubmenu, "Actual Size", () => zoomReset(), "0");

menuBarAttach(menuBar);

App({
  title: "Menu Demo",
  width: 800,
  height: 600,
  body: VStack(16, [
    Text("App content here"),
  ]),
});
```

### 菜单栏函数

- `menuBarCreate()` — 创建新的菜单栏
- `menuBarAddMenu(menuBar, title)` — 添加顶级菜单，返回菜单句柄
- `menuAddItem(menu, label, callback, shortcut?)` — 添加带可选键盘快捷键的菜单项
- `menuAddSeparator(menu)` — 添加分隔线
- `menuAddSubmenu(menu, title)` — 添加子菜单，返回子菜单句柄
- `menuBarAttach(menuBar)` — 将菜单栏附加到应用程序

### 键盘快捷键

`menuAddItem` 的第四个参数为可选的键盘快捷键：

| 快捷键 | macOS 系统 | 其他系统 |
|----------|-------|-------|
| `"n"` | Cmd+N | Ctrl+N |
| `"S"` | Cmd+Shift+S | Ctrl+Shift+S |
| `"+"` | Cmd++ | Ctrl++ |

大写字母表示需配合 Shift 键使用。

## 上下文菜单

组件上的右键菜单：

```typescript
import { Text, contextMenu } from "perry/ui";

const label = Text("Right-click me");
contextMenu(label, [
  { label: "Copy", action: () => copyText() },
  { label: "Paste", action: () => pasteText() },
  { separator: true },
  { label: "Delete", action: () => deleteItem() },
]);
```

## 工具栏

为窗口添加工具栏：

```typescript

import { App, VStack, Text, toolbarCreate, toolbarAddItem } from "perry/ui";

const toolbar = toolbarCreate();
toolbarAddItem(toolbar, "New", () => newDoc());
toolbarAddItem(toolbar, "Save", () => saveDoc());
toolbarAddItem(toolbar, "Run", () => runCode());

App({
  title: "Toolbar Demo",
  width: 800,
  height: 600,
  body: VStack(16, [
    Text("App content here"),
  ]),
});
```

## 平台说明

| 平台 | 菜单栏 | 上下文菜单 | 工具栏 |
|----------|----------|-------------|---------|
| macOS | NSMenu | NSMenu | NSToolbar |
| iOS | 无（无菜单栏） | UIMenu | UIToolbar |
| Windows | HMENU/SetMenu | 无 | 水平布局 |
| Linux | GMenu/set_menubar | 无 | HeaderBar |
| Web | DOM | DOM | DOM |

> **iOS 说明**：菜单栏不适用，应改用工具栏和导航设计模式。

## 后续参考

- [Events](events) — 键盘快捷键与交互操作
- [Dialogs](dialogs) — 文件对话框与提示框
- [Layout](layout)