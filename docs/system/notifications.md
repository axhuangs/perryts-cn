# 通知

使用各平台的通知系统发送本地通知。

## 使用方法

```typescript
import { sendNotification } from "perry/system";

sendNotification("Download Complete", "Your file has been downloaded successfully.");
```

## 平台实现

| 平台     | 底层实现                 |
|----------|--------------------------|
| macOS    | UNUserNotificationCenter |
| iOS      | UNUserNotificationCenter |
| Android  | NotificationManager      |
| Windows  | Toast notifications      |
| Linux    | GNotification            |
| Web      | Web Notification API     |

> **权限说明**：在 macOS、iOS 和 Web 平台上，用户可能需要授予通知权限。首次使用时，系统会自动弹出权限请求提示。

## 后续参考

- [Keychain](keychain) — 安全存储
- [Other](other) — 其他系统 API
- [Overview](overview) — 所有系统 API