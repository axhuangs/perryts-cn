# macOS
macOS 是 Perry 的主要开发平台，其采用 AppKit 构建原生用户界面（UI）。

## 环境要求
- macOS 13 及以上版本（Ventura 或更高版本）
- Xcode 命令行工具：执行 `xcode-select --install` 安装

## 构建方法
```bash
# macOS 为默认编译目标
perry app.ts -o app
./app
```
无需额外标记——macOS 是默认的编译目标。

## UI 工具包
Perry 将自身的 UI 组件映射为对应的 AppKit 控件：

| Perry 组件 | AppKit 类 |
|-------------|-------------|
| Text | NSTextField（标签模式） |
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
若要分发应用，需对其进行签名。Perry 支持自动签名：
```bash
perry publish
```
该命令会从 macOS 钥匙串中自动检测签名身份，将其导出为临时的 `.p12` 文件，并对二进制文件完成签名。

手动签名方式：
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

## macOS 专属功能
- **菜单栏**：全面支持带键盘快捷键的 NSMenu
- **工具栏**：集成 NSToolbar
- **程序坞图标**：GUI 应用自动生成
- **深色模式**：通过 `isDarkMode()` 检测系统外观
- **钥匙串**：基于 Security.framework 实现安全存储
- **通知**：通过 UNUserNotificationCenter 发送本地通知
- **文件对话框**：使用 NSOpenPanel/NSSavePanel

## 系统 API
```typescript
import { openURL, isDarkMode, preferencesSet, preferencesGet } from "perry/system";

openURL("https://example.com");          // 在默认浏览器中打开链接
const dark = isDarkMode();                // 检测系统外观模式
preferencesSet("key", "value");           // 调用 NSUserDefaults 写入偏好设置
const val = preferencesGet("key");        // 调用 NSUserDefaults 读取偏好设置
```

## 后续参考
- [iOS](ios) — 交叉编译适用于 iPhone/iPad 的应用
- [UI 总览](../ui/overview) — 完整的 UI 文档
- [系统 API](../system/overview) — 系统集成相关文档