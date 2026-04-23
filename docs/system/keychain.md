# 密钥链（Keychain）

使用各平台的安全存储机制安全存储令牌、密码和 API 密钥等敏感数据。

## 使用方法

```typescript
import { keychainSet, keychainGet } from "perry/system";

// 存储机密信息
keychainSet("api-token", "sk-abc123...");

// 检索机密信息
const token = keychainGet("api-token");
```

## 平台存储方式

| 平台     | 底层实现                     |
|----------|------------------------------|
| macOS    | Security.framework（密钥链） |
| iOS      | Security.framework（密钥链） |
| Android  | Android Keystore             |
| Windows  | Windows 凭据管理器（CredWrite/CredRead/CredDelete） |
| Linux    | libsecret                    |
| Web      | localStorage（非真正安全）   |

> **Web 端说明**：Web 平台使用 `localStorage` 存储数据，该方式无加密保护。对于处理敏感数据的 Web 应用，建议改用服务端存储方案。

## 后续参考

- [Preferences](preferences) — 非敏感配置项
- [Notifications](notifications) — 本地通知
- [系统 API 概述](overview) — 所有系统 API