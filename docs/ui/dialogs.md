# 对话框

Perry 提供用于文件选择、提示框和表单面板的原生对话框功能。

## 文件打开对话框

```typescript
import { openFileDialog } from "perry/ui";

const filePath = openFileDialog();
if (filePath) {
  console.log(`Selected: ${filePath}`);
}
```

返回选中的文件路径，若取消操作则返回 `null`。

## 文件夹选择对话框

```typescript
import { openFolderDialog } from "perry/ui";

const folderPath = openFolderDialog();
if (folderPath) {
  console.log(`Selected folder: ${folderPath}`);
}
```

## 文件保存对话框

```typescript
import { saveFileDialog } from "perry/ui";

const savePath = saveFileDialog();
if (savePath) {
  // Write file to savePath
}
```

## 提示框

显示原生提示对话框：

```typescript
import { alert } from "perry/ui";

alert("Operation Complete", "Your file has been saved successfully.");
```

`alert(title, message)` 用于显示包含“确定”按钮的模态提示框。

## 表单面板

表单面板是附着在窗口上的模态面板：

```typescript
import { Sheet, Text, Button, VStack } from "perry/ui";

const sheet = Sheet(
  VStack(16, [
    Text("Sheet Content"),
    Button("Close", () => {
      sheet.dismiss();
    }),
  ])
);

// Show the sheet
sheet.present();
```

## 平台说明

| 对话框类型 | macOS | iOS | Windows | Linux | Web |
|------------|-------|-----|---------|-------|-----|
| 文件打开   | NSOpenPanel | UIDocumentPicker | IFileOpenDialog | GtkFileChooserDialog | `<input type="file">` |
| 文件保存   | NSSavePanel | — | IFileSaveDialog | GtkFileChooserDialog | Download link |
| 文件夹     | NSOpenPanel | — | IFileOpenDialog | GtkFileChooserDialog | — |
| 提示框     | NSAlert | UIAlertController | MessageBoxW | MessageDialog | `alert()` |
| 表单面板   | NSSheet | Modal VC | Modal Dialog | Modal Window | Modal div |

## 完整示例

```typescript

import { App, Text, Button, TextField, VStack, HStack, State, openFileDialog, saveFileDialog, alert } from "perry/ui";
import { readFileSync, writeFileSync } from "perry/fs";

const content = State("");
const filePath = State("");

App({
  title: "Text Editor",
  width: 800,
  height: 600,
  body: VStack(12, [
    HStack(8, [
      Button("Open", () => {
        const path = openFileDialog();
        if (path) {
          filePath.set(path);
          content.set(readFileSync(path));
        }
      }),
      Button("Save As", () => {
        const path = saveFileDialog();
        if (path) {
          writeFileSync(path, content.value);
          filePath.set(path);
          alert("Saved", `File saved to ${path}`);
        }
      }),
    ]),
    Text(`File: ${filePath.value || "No file open"}`),
    TextField("Start typing...", (value: string) => content.set(value)),
  ]),
});
```

## 后续参考

- [Menus](menus) — 菜单栏和上下文菜单
- [Multi-Window](multi-window) — 多窗口功能
- [Events](events) — 用户交互事件