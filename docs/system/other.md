# 其他系统 API

其他平台级 API。

## 打开 URL

在默认浏览器或应用中打开 URL：

```typescript
import { openURL } from "perry/system";

openURL("https://example.com");
openURL("mailto:user@example.com");
```

| 平台 | 实现 |
|----------|---------------|
| macOS | NSWorkspace.open |
| iOS | UIApplication.open |
| Android | Intent.ACTION_VIEW |
| Windows | ShellExecuteW |
| Linux | xdg-open |
| Web | window.open |

## 暗模式检测

```typescript
import { isDarkMode } from "perry/system";

if (isDarkMode()) {
  // 使用暗主题颜色
}
```

| 平台 | 检测 |
|----------|-----------|
| macOS | NSApp.effectiveAppearance |
| iOS | UITraitCollection |
| Android | Configuration.uiMode |
| Windows | 注册表 (AppsUseLightTheme) |
| Linux | GTK 设置 |
| Web | prefers-color-scheme 媒体查询 |

## 剪贴板

```typescript
import { clipboardGet, clipboardSet } from "perry/system";

clipboardSet("Copied text!");
const text = clipboardGet();
```

## 区域设置检测

获取设备的语言作为 2 字母 ISO 639-1 代码：

```typescript
import { getLocale } from "perry/system";

const lang = getLocale(); // "de", "en", "fr", "es", etc.

if (lang === "de") {
  // 使用德语翻译
}
```

| 平台 | 实现 |
|----------|---------------|
| macOS | `[NSLocale preferredLanguages]` |
| iOS | `[NSLocale preferredLanguages]` |
| Android | `Locale.getDefault().getLanguage()` |
| Windows | `LANG` / `LC_ALL` 环境变量 |
| Linux | `LANG` / `LC_ALL` 环境变量 |
| tvOS | `[NSLocale preferredLanguages]` |
| watchOS | Stub (`"en"`) |

## 应用图标提取

获取应用或文件的图标作为原生 Image 小部件。有用于构建应用启动器、文件浏览器和搜索 UI：

```typescript
import { getAppIcon } from "perry/system";
import { VStack, HStack, Text, Image } from "perry/ui";

// macOS: 传递 .app 包路径
const finderIcon = getAppIcon("/System/Applications/Finder.app");
const safariIcon = getAppIcon("/Applications/Safari.app");

// Linux: 传递 .desktop 文件路径
const firefoxIcon = getAppIcon("/usr/share/applications/firefox.desktop");

// 在您的 UI 中使用图标
HStack(8, [
  finderIcon,
  Text("Finder"),
]);
```

返回 Image 小部件句柄（默认 32x32）。如果无法加载图标，返回 `0`。