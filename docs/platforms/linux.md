# Linux（GTK4）

Perry 可针对 Linux 平台（基于 GTK4）编译 TypeScript 应用程序。

## 环境要求

- GTK4 开发库：
  ```bash
  # Ubuntu/Debian
  sudo apt install libgtk-4-dev

  # Fedora
  sudo dnf install gtk4-devel

  # Arch
  sudo pacman -S gtk4
  ```
- Cairo 开发库（用于画布功能）：
  ```bash
  sudo apt install libcairo2-dev
  ```

## 构建流程

```bash
perry app.ts -o app --target linux
./app
```

## UI 工具集

Perry 将自身的 UI 组件映射为对应的 GTK4 组件：

| Perry 组件 | GTK4 组件 |
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
| VStack | GtkBox（垂直布局） |
| HStack | GtkBox（水平布局） |
| ZStack | GtkOverlay |
| ScrollView | GtkScrolledWindow |
| Canvas | Cairo 绘图 |
| NavigationStack | GtkStack |

## Linux 专属 API

- **菜单栏**：GMenu / set_menubar
- **工具栏**：GtkHeaderBar
- **深色模式**：GTK 系统设置检测
- **首选项**：GSettings 或基于文件的实现
- **密钥链**：libsecret
- **通知**：GNotification
- **文件对话框**：GtkFileChooserDialog
- **提示框**：GtkMessageDialog

## 样式设置

GTK4 的样式底层基于 CSS 实现。Perry 的样式配置方法（颜色、字体、圆角半径等）会被转换为 CSS 属性，并通过 `CssProvider` 应用。

## 基于 Geisterhand 的测试

Perry 内置的 UI 模糊测试工具可在 Linux/GTK4 环境下运行。截图功能通过 `WidgetPaintable` + `GskRenderer` 实现像素级精准捕获。

```bash
perry app.ts -o app --target linux --enable-geisterhand
./app
# 在另一个终端执行：
curl http://127.0.0.1:7676/widgets
curl http://127.0.0.1:7676/screenshot -o screenshot.png
```

完整的 API 参考可查阅 [Geisterhand](../testing/geisterhand)。

## 后续参考

- [平台总览](overview) — 全平台相关内容
- [UI 总览](../ui/overview) — UI 系统相关内容