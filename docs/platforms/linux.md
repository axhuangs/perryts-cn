# Linux (GTK4)

Perry 使用 GTK4 为 Linux 编译 TypeScript 应用。

## 要求

- GTK4 开发库：
  ```bash
  # Ubuntu/Debian
  sudo apt install libgtk-4-dev

  # Fedora
  sudo dnf install gtk4-devel

  # Arch
  sudo pacman -S gtk4
  ```
- Cairo 开发库 (用于画布)：
  ```bash
  sudo apt install libcairo2-dev
  ```

## 构建

```bash
perry app.ts -o app --target linux
./app
```

## UI 工具包

Perry 将 UI 小部件映射到 GTK4 小部件：

| Perry 小部件 | GTK4 小部件 |
|-------------|------------|
| Text | GtkLabel |
| Button | GtkButton |
| TextField | GtkEntry |
| SecureField | GtkPasswordEntry |
| Toggle | GtkSwitch |
| Slider | GtkScale |
| Picker | GtkDropDown |
| ProgressView | GtkProgressBar |
| Image | GtkImage |
| VStack | GtkBox (垂直) |
| HStack | GtkBox (水平) |
| ZStack | GtkOverlay |
| ScrollView | GtkScrolledWindow |
| Canvas | Cairo 绘制 |
| NavigationStack | GtkStack |

## Linux 特定 API

- **菜单栏**：GMenu / set_menubar
- **工具栏**：GtkHeaderBar
- **深色模式**：GTK 设置检测
- **偏好设置**：GSettings 或基于文件的
- **钥匙串**：libsecret
- **通知**：GNotification
- **文件对话框**：GtkFileChooserDialog
- **警报**：GtkMessageDialog

## 样式

GTK4 样式在底层使用 CSS。Perry 的样式方法 (颜色、字体、圆角半径) 被翻译为通过 `CssProvider` 应用的 CSS 属性。

## 使用 Geisterhand 测试

Perry 的内置 UI 模糊器在 Linux/GTK4 上工作。截图使用 `WidgetPaintable` + `GskRenderer` 进行像素准确捕获。

```bash
perry app.ts -o app --target linux --enable-geisterhand
./app
# 在另一个终端中：
curl http://127.0.0.1:7676/widgets
curl http://127.0.0.1:7676/screenshot -o screenshot.png
```

请参阅 [Geisterhand](../testing/geisterhand.md) 获取完整 API 参考。

## 下一步

- [平台概述](overview.md) — 所有平台
- [UI 概述](../ui/overview.md) — UI 系统