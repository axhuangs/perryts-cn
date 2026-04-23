# 其他系统 API

平台级扩展 API 说明。

## 打开 URL

在默认浏览器或应用中打开指定 URL：

```typescript
import { openURL } from "perry/system";

openURL("https://example.com");
openURL("mailto:user@example.com");
```

| 平台      | 实现方式               |
|-----------|------------------------|
| macOS     | NSWorkspace.open       |
| iOS       | UIApplication.open     |
| Android   | Intent.ACTION_VIEW     |
| Windows   | ShellExecuteW          |
| Linux     | xdg-open               |
| Web       | window.open            |

## 暗黑模式检测

```typescript
import { isDarkMode } from "perry/system";

if (isDarkMode()) {
  // 使用暗黑主题配色
}
```

| 平台      | 检测方式                  |
|-----------|---------------------------|
| macOS     | NSApp.effectiveAppearance |
| iOS       | UITraitCollection         |
| Android   | Configuration.uiMode      |
| Windows   | 注册表（AppsUseLightTheme） |
| Linux     | GTK 设置                  |
| Web       | prefers-color-scheme 媒体查询 |

## 剪贴板

```typescript
import { clipboardGet, clipboardSet } from "perry/system";

clipboardSet("Copied text!");
const text = clipboardGet();
```

## 区域设置检测

获取设备语言（ISO 639-1 两位编码格式）：

```typescript
import { getLocale } from "perry/system";

const lang = getLocale(); // "de", "en", "fr", "es", etc.

if (lang === "de") {
  // 使用德语翻译文案
}
```

| 平台      | 实现方式                              |
|-----------|---------------------------------------|
| macOS     | `[NSLocale preferredLanguages]`       |
| iOS       | `[NSLocale preferredLanguages]`       |
| Android   | `Locale.getDefault().getLanguage()`   |
| Windows   | `LANG` / `LC_ALL` 环境变量            |
| Linux     | `LANG` / `LC_ALL` 环境变量            |
| tvOS      | `[NSLocale preferredLanguages]`       |
| watchOS   | 桩实现（固定返回 `"en"`）             |

## 应用图标提取

获取应用或文件对应的图标，并以原生 Image 组件形式返回。适用于构建应用启动器、文件浏览器及搜索类界面：

```typescript
import { getAppIcon } from "perry/system";
import { VStack, HStack, Text, Image } from "perry/ui";

// macOS：传入 .app 应用包路径
const finderIcon = getAppIcon("/System/Applications/Finder.app");
const safariIcon = getAppIcon("/Applications/Safari.app");

// Linux：传入 .desktop 文件路径
const firefoxIcon = getAppIcon("/usr/share/applications/firefox.desktop");

// 在界面中使用图标
HStack(8, [
  finderIcon,
  Text("Finder"),
]);
```

返回值为 Image 组件句柄（默认尺寸 32x32）。若图标加载失败，返回 `0`。

| 平台      | 实现方式                                                                 |
|-----------|--------------------------------------------------------------------------|
| macOS     | `NSWorkspace.shared.icon(forFile:)` — 支持任意文件路径、.app 应用包或文件夹 |
| Linux     | 解析 .desktop 文件的 `Icon=` 字段，通过 GTK 图标主题查找，降级策略为直接加载图片文件 |
| Windows   | 暂未实现（固定返回 0）                                                   |

## 后续参考

- [系统 API 概述](overview) — 所有系统 API
- [UI概述](../ui/overview) — 界面构建相关说明