# Windows

Perry 使用 Win32 API 为 Windows 编译 TypeScript 应用。

## 要求

- 带有 "Desktop development with C++" 工作负载的 Visual Studio Build Tools
- Windows 10 或更高版本

## 构建

```bash
perry app.ts -o app.exe --target windows
```

## UI 工具包

Perry 将 UI 小部件映射到 Win32 控件：

| Perry 小部件 | Win32 类 |
|-------------|------------|
| Text | Static HWND |
| Button | HWND Button |
| TextField | Edit HWND |
| SecureField | Edit (ES_PASSWORD) |
| Toggle | Checkbox |
| Slider | Trackbar (TRACKBAR_CLASSW) |
| Picker | ComboBox |
| ProgressView | PROGRESS_CLASSW |
| Image | GDI |
| VStack/HStack | 手动布局 |
| ScrollView | WS_VSCROLL |
| Canvas | GDI 绘制 |
| Form/Section | GroupBox |

## Windows 特定 API

- **菜单栏**：HMENU / SetMenu
- **深色模式**：Windows 注册表检测
- **偏好设置**：Windows 注册表
- **钥匙串**：CredWrite/CredRead/CredDelete (Windows 凭据管理器)
- **通知**：Toast 通知
- **文件对话框**：IFileOpenDialog / IFileSaveDialog (COM)
- **警报**：MessageBoxW
- **打开 URL**：ShellExecuteW

## 下一步

- [平台概述](overview.md) — 所有平台
- [UI 概述](../ui/overview.md) — UI 系统