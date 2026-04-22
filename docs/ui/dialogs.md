# 对话框

Perry 提供用于文件选择、警报和表单的原生对话框函数。

## 文件打开对话框

```typescript
import { openFileDialog } from "perry/ui";

const filePath = openFileDialog();
if (filePath) {
  console.log(`Selected: ${filePath}`);
}
```

返回选定的文件路径，如果取消则返回 `null`。

## 文件夹选择对话框

```typescript
import { openFolderDialog } from "perry/ui";

const folderPath = openFolderDialog();
if (folderPath) {
  console.log(`Selected folder: ${folderPath}`);
}
```

## 保存文件对话框

```typescript
import { saveFileDialog } from "perry/ui";

const savePath = saveFileDialog();
if (savePath) {
  // 将文件写入 savePath
}
```

## 警报

显示原生警报对话框：

```typescript
import { alert } from "perry/ui";

alert("Operation Complete", "Your file has been saved successfully.");
```

`alert(title, message)` 显示带有 OK 按钮的模态警报。

## 表单

表单是附加到窗口的模态面板：

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

// 显示表单
sheet.present();
```

## 平台说明

| Dialog | macOS | iOS | Windows | Linux | Web |
|--------|-------|-----|---------|-------|-----|
| File Open | NSOpenPanel | UIDocumentPicker | IFileOpenDialog | GtkFileChooserDialog | `<input type="file">` |
| File Save | NSSavePanel | — | IFileSaveDialog | GtkFileChooserDialog | Download link |
| Folder | NSOpenPanel | — | IFileOpenDialog | GtkFileChooserDialog | — |
| Alert | NSAlert | UIAlertController | MessageBoxW | MessageDialog | `alert()` |
| Sheet | NSSheet | Modal VC | Modal Dialog | Modal Window | Modal div |

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

## 下一步

- [Menus](menus.md) — 菜单栏和上下文菜单
- [Multi-Window](multi-window.md) — 多窗口
- [Events](events.md) — 用户交互事件