# macOS

macOS 是 Perry 的主要开发平台。它使用 AppKit 进行原生 UI。

## 要求

- macOS 13+ (Ventura 或更高版本)
- Xcode 命令行工具： `xcode-select --install`

## 构建

```bash
# macOS 是默认目标
perry app.ts -o app
./app
```

无需额外标志 — macOS 是默认编译目标。

## UI 工具包

Perry 将 UI 小部件映射到 AppKit 控件：

| Perry 小部件 | AppKit 类 |
|-------------|-------------|
| Text | NSTextField (标签模式) |
| Button | NSButton |
| TextField | NSTextField |
| SecureField | NSSecureTextField |
| Toggle | NSSwitch |
| Slider | NSSlider |
| Picker | NSPopUpButton |
| Image | NSImageView |
| VStack/HStack | NSStackView |
| ScrollView | NSScrollView |
| Table | NSTableView |
| Canvas | NSView + Core Graphics |

## 代码签名

对于分发，应用需要签名。Perry 支持自动签名：

```bash
perry publish
```

这会从 macOS 钥匙串自动检测您的签名身份，将其导出到临时 `.p12` 文件，并签署二进制文件。

对于手动签名：

```bash
codesign --sign "Developer ID Application: Your Name" ./app
```

## App Store 分发

```bash
perry app.ts -o MyApp
# 使用 App Store 证书签名
codesign --sign "3rd Party Mac Developer Application: Your Name" MyApp
# 打包
productbuild --sign "3rd Party Mac Developer Installer: Your Name" --component MyApp /Applications MyApp.pkg
```

## macOS 特定功能

- **菜单栏**：支持键盘快捷键的完整 NSMenu
- **工具栏**：NSToolbar 集成
- **Dock 图标**：GUI 应用的自动
- **深色模式**：`isDarkMode()` 检测系统外观
- **钥匙串**：通过 Security.framework 的安全存储
- **通知**：通过 UNUserNotificationCenter 的本地通知
- **文件对话框**：NSOpenPanel/NSSavePanel

## 系统 API

```typescript
import { openURL, isDarkMode, preferencesSet, preferencesGet } from "perry/system";

openURL("https://example.com");          // 在默认浏览器中打开
const dark = isDarkMode();                // 检查外观
preferencesSet("key", "value");           // NSUserDefaults
const val = preferencesGet("key");        // NSUserDefaults
```

## 下一步

- [iOS](ios.md) — 为 iPhone/iPad 交叉编译
- [UI 概述](../ui/overview.md) — 完整 UI 文档
- [系统 API](../system/overview.md) — 系统集成