# 偏好设置

使用平台的原生存储来存储和检索用户偏好设置。

## 使用

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

值作为字符串存储。根据需要转换数字和布尔值：

```typescript
preferencesSet("count", String(42));
const count = Number(preferencesGet("count"));
```

## 平台存储

| 平台 | 后端 |
|----------|---------|
| macOS | NSUserDefaults |
| iOS | NSUserDefaults |
| Android | SharedPreferences |
| Windows | Windows Registry |
| Linux | GSettings / 文件基础 |
| Web | localStorage |

偏好设置在应用启动之间持久化。它们未加密 — 对敏感数据使用 [Keychain](keychain.md)。

## 下一步

- [Keychain](keychain.md) — 安全存储
- [Overview](overview.md) — 所有系统 API