# Windows 系统

Perry 可借助 Win32 API 为 Windows 系统编译 TypeScript 应用程序。

## 环境要求

- 安装有“使用 C++ 的桌面开发”工作负载的 Visual Studio 生成工具
- Windows 10 或更高版本

## 构建操作

```bash
perry app.ts -o app.exe --target windows
```

## UI 工具集

Perry 将各类 UI 组件映射为对应的 Win32 控件：

| Perry 组件 | Win32 类 |
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
| Canvas | GDI 绘图 |
| Form/Section | GroupBox |

## Windows 专属 API

- **菜单栏**：HMENU / SetMenu
- **深色模式**：Windows 注册表检测
- **首选项**：Windows 注册表
- **密钥链**：CredWrite/CredRead/CredDelete（Windows 凭据管理器）
- **通知**：Toast 通知
- **文件对话框**：IFileOpenDialog / IFileSaveDialog（COM）
- **提示框**：MessageBoxW
- **打开 URL**：ShellExecuteW

## 后续参考

- [平台总览](overview) — 全平台相关内容
- [UI 总览](../ui/overview) — UI 系统相关内容