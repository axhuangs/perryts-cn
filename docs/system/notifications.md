# 通知

使用平台的通知系统发送本地通知。

## 使用

```typescript
import { sendNotification } from "perry/system";

sendNotification("Download Complete", "Your file has been downloaded successfully.");
```

## 平台实现

| 平台 | 后端 |
|----------|---------|
| macOS | UNUserNotificationCenter |
| iOS | UNUserNotificationCenter |
| Android | NotificationManager |
| Windows | Toast notifications |
| Linux | GNotification |
| Web | Web Notification API |

> **权限**：在 macOS、iOS 和 Web 上，用户可能需要授予通知权限。在首次使用时，系统将自动提示权限。

## 下一步

- [Keychain](keychain.md) — 安全存储
- [Other](other.md) — 其他系统 API
- [Overview](overview.md) — 所有系统 API