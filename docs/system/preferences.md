# 偏好设置

使用平台原生存储功能存储和检索用户偏好设置。

## 使用方法

```typescript
import { preferencesSet, preferencesGet } from "perry/system";

// 存储偏好设置
preferencesSet("username", "perry");
preferencesSet("fontSize", "14");
preferencesSet("darkMode", "true");

// 读取偏好设置
const username = preferencesGet("username");  // "perry"
const fontSize = preferencesGet("fontSize");  // "14"
```

所有值均以字符串形式存储。如需存储数字和布尔值，请按需转换：

```typescript
preferencesSet("count", String(42));
const count = Number(preferencesGet("count"));
```

## 平台存储方式

| 平台     | 底层实现          |
|----------|-------------------|
| macOS    | NSUserDefaults    |
| iOS      | NSUserDefaults    |
| Android  | SharedPreferences |
| Windows  | Windows 注册表    |
| Linux    | GSettings / 基于文件 |
| Web      | localStorage      |

偏好设置会在应用重启后保留。此类数据未加密——敏感数据请使用 [钥匙串](keychain) 存储。

## 后续参考

- [Keychain](keychain) — 安全存储
- [系统 API 概述](overview) — 所有系统 API