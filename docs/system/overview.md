# 系统 API 概述

`perry/system` 模块提供对平台原生系统功能的访问：偏好设置、安全存储、通知、URL 打开、暗模式检测和应用内省。

```typescript
import { openURL, isDarkMode, preferencesSet, preferencesGet, getAppIcon } from "perry/system";
```

## 可用 API

| 函数 | 描述 | 平台 |
|----------|------------|-----------|
| `openURL(url)` | 在默认浏览器/应用中打开 URL | 全部 |
| `isDarkMode()` | 检查系统暗模式 | 全部 |
| `preferencesSet(key, value)` | 存储偏好设置 | 全部 |
| `preferencesGet(key)` | 读取偏好设置 | 全部 |
| `keychainSet(key, value)` | 安全存储写入 | 全部 |
| `keychainGet(key)` | 安全存储读取 | 全部 |
| `sendNotification(title, body)` | 本地通知 | 全部 |
| `clipboardGet()` | 读取剪贴板 | 全部 |
| `clipboardSet(text)` | 写入剪贴板 | 全部 |
| `audioStart()` | 开始麦克风捕获 | 全部 |
| `audioStop()` | 停止麦克风捕获 | 全部 |
| `audioGetLevel()` | 当前 dB(A) 声级 | 全部 |
| `audioGetPeak()` | 当前峰值振幅 (0–1) | 全部 |
| `audioGetWaveformSamples(n)` | 可视化的最近 dB 样本 | 全部 |
| `getLocale()` | 设备语言代码（例如 `"de"`、`"en"`） | 全部 |
| `getDeviceModel()` | 设备型号标识符 | 全部 |
| `getAppIcon(path)` | 获取应用/文件图标作为 Image 小部件 | macOS, Linux |

## 快速示例

```typescript
import { isDarkMode, preferencesGet, preferencesSet, openURL } from "perry/system";

// 检测暗模式
if (isDarkMode()) {
  console.log("Dark mode is active");
}

// 存储用户偏好设置
preferencesSet("theme", "dark");
const theme = preferencesGet("theme");

// 打开 URL
openURL("https://example.com");
```

## 下一步

- [Preferences](preferences.md)
- [Keychain](keychain.md)
- [Notifications](notifications.md)
- [Audio Capture](audio.md)
- [Other](other.md)