# 钥匙串

使用平台的加密存储安全地存储敏感数据，如令牌、密码和 API 密钥。

## 使用

```typescript
import { keychainSet, keychainGet } from "perry/system";

// 存储秘密
keychainSet("api-token", "sk-abc123...");

// 检索秘密
const token = keychainGet("api-token");
```

## 平台存储

| 平台 | 后端 |
|----------|---------|
| macOS | Security.framework (Keychain) |
| iOS | Security.framework (Keychain) |
| Android | Android Keystore |
| Windows | Windows Credential Manager (CredWrite/CredRead/CredDelete) |
| Linux | libsecret |
| Web | localStorage (不真正安全) |

> **Web**：Web 平台使用 `localStorage`，它未加密。对于处理敏感数据的 Web 应用，请考虑服务器端存储。

## 下一步

- [Preferences](preferences.md) — 非敏感偏好设置
- [Notifications](notifications.md) — 本地通知
- [Overview](overview.md) — 所有系统 API