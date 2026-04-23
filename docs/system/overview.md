# 系统 API 概述

`perry/system` 模块提供对平台原生系统功能的访问能力：首选项管理、安全存储、通知、URL 打开、深色模式检测以及应用内省。

```typescript
import { openURL, isDarkMode, preferencesSet, preferencesGet, getAppIcon } from "perry/system";
```

## 可用 API

| 函数 | 描述 | 平台 |
|----------|------------|-----------|
| `openURL(url)` | 在默认浏览器/应用中打开 URL | 全平台 |
| `isDarkMode()` | 检测系统深色模式状态 | 全平台 |
| `preferencesSet(key, value)` | 存储首选项数据 | 全平台 |
| `preferencesGet(key)` | 读取首选项数据 | 全平台 |
| `keychainSet(key, value)` | 安全存储写入操作 | 全平台 |
| `keychainGet(key)` | 安全存储读取操作 | 全平台 |
| `sendNotification(title, body)` | 发送本地通知 | 全平台 |
| `clipboardGet()` | 读取剪贴板内容 | 全平台 |
| `clipboardSet(text)` | 写入内容到剪贴板 | 全平台 |
| `audioStart()` | 启动麦克风采集 | 全平台 |
| `audioStop()` | 停止麦克风采集 | 全平台 |
| `audioGetLevel()` | 获取当前声压级 dB(A) | 全平台 |
| `audioGetPeak()` | 获取当前峰值振幅（0–1） | 全平台 |
| `audioGetWaveformSamples(n)` | 获取近期 dB 采样数据（用于可视化） | 全平台 |
| `getLocale()` | 获取设备语言编码（例如 `"de"`、`"en"`） | 全平台 |
| `getDeviceModel()` | 获取设备型号标识符 | 全平台 |
| `getAppIcon(path)` | 将应用/文件图标作为 Image 组件获取 | macOS、Linux |

## 快速示例

```typescript
import { isDarkMode, preferencesGet, preferencesSet, openURL } from "perry/system";

// Detect dark mode
if (isDarkMode()) {
  console.log("Dark mode is active");
}

// Store user preferences
preferencesSet("theme", "dark");
const theme = preferencesGet("theme");

// Open a URL
openURL("https://example.com");
```

## 后续参考

- [Preferences](preferences)
- [Keychain](keychain)
- [Notifications](notifications)
- [Audio Capture](audio)
- [Other](other)