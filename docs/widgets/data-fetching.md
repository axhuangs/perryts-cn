# 提供者函数和数据获取

`provider` 函数是动态控件的核心。它获取数据、转换数据，并返回时间线条目，系统按计划渲染这些条目。

## 提供者生命周期

1. 系统在控件首次添加时、需要快照时以及重新加载策略到期时调用您的提供者。
2. 您的提供者作为原生 LLVM 编译代码运行，链接到控件扩展。
3. 提供者返回一个或多个时间线条目。系统在预定的时间渲染每个条目。
4. 在最后一个条目之后，重新加载策略确定提供者下次运行的时间。

## 基本提供者

```typescript
import { Widget, Text, VStack } from "perry/widget";

Widget({
  kind: "WeatherWidget",
  displayName: "Weather",
  description: "Current conditions",
  supportedFamilies: ["systemSmall"],

  entryFields: {
    temperature: "number",
    condition: "string",
  },

  provider: async () => {
    const res = await fetch("https://api.weather.example.com/current");
    const data = await res.json();
    return {
      entries: [
        { temperature: data.temp, condition: data.description },
      ],
      reloadPolicy: { after: { minutes: 15 } },
    };
  },

  render: (entry) =>
    VStack([
      Text(`${entry.temperature}°`, { font: "title" }),
      Text(entry.condition, { font: "caption" }),
    ]),
});
```

## 带共享存储的认证请求

控件在单独的进程中运行，无法访问您的应用内存。使用 `sharedStorage()` 读取您的应用已写入共享容器的值。

### iOS / watchOS: App Groups

在 Apple 平台上，共享存储映射到 `UserDefaults(suiteName:)`，由 App Group 容器支持。在您的控件声明中设置 `appGroup` 字段：

```typescript
Widget({
  kind: "DashboardWidget",
  displayName: "Dashboard",
  description: "Account summary",
  appGroup: "group.com.example.shared",

  entryFields: {
    revenue: "number",
    users: "number",
  },

  provider: async () => {
    const token = sharedStorage("auth_token");
    const res = await fetch("https://api.example.com/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return {
      entries: [{ revenue: data.revenue, users: data.activeUsers }],
      reloadPolicy: { after: { minutes: 30 } },
    };
  },

  render: (entry) =>
    VStack([
      Text(`$${entry.revenue}`, { font: "title" }),
      Text(`${entry.users} active users`, { font: "caption" }),
    ]),
});
```

您的主应用将令牌写入共享容器：

```typescript
import { preferencesSet } from "perry/system";
// In your app's login flow:
preferencesSet("auth_token", token);
```

**设置要求 (iOS)：** 在 Xcode 中为主应用目标和控件扩展目标添加 App Group 功能。标识符必须与 `appGroup` 值匹配。

### Android / Wear OS: SharedPreferences

在 Android 上，共享存储映射到 `SharedPreferences`，名称为 `perry_shared`。生成的 `Bridge.kt` 通过 `context.getSharedPreferences("perry_shared", MODE_PRIVATE)` 读取值。

## 重新加载策略

`reloadPolicy` 字段控制系统下次调用提供者的时间：

```typescript
return {
  entries: [{ ... }],
  reloadPolicy: { after: { minutes: 30 } },
};
```

| Policy | Behavior |
|--------|----------|
| `{ after: { minutes: N } }` | Re-fetch after N minutes. Compiles to `.after(Date().addingTimeInterval(N*60))` on iOS and `setFreshnessIntervalMillis(N*60000)` on Wear OS. |
| *(omitted)* | Defaults to 30 minutes on iOS, 30 minutes on Android/Wear OS. |

**预算限制：** iOS 限制控件刷新。典型预算为每天 40--70 次刷新。watchOS 更严格（见 [watchOS Complications](watchos.md)）。只请求您需要的。

## JSON 响应处理

提供者函数直接接收解析的 JSON。条目字段类型必须与您的 `entryFields` 声明匹配：

```typescript
entryFields: {
  items: { type: "array", items: { type: "object", fields: { name: "string", count: "number" } } },
  total: "number",
},

provider: async () => {
  const res = await fetch("https://api.example.com/items");
  const data = await res.json();
  return {
    entries: [{
      items: data.results.map((r: any) => ({ name: r.name, count: r.count })),
      total: data.total,
    }],
  };
},
```

## 错误处理

如果获取失败或 JSON 解析抛出异常，控件扩展会回退到占位符数据：

```typescript
Widget({
  // ...
  placeholder: { temperature: 0, condition: "Loading..." },

  provider: async () => {
    const res = await fetch("https://api.weather.example.com/weather");
    if (!res.ok) {
      // Return stale/fallback data with a short retry interval
      return {
        entries: [{ temperature: 0, condition: "Unavailable" }],
        reloadPolicy: { after: { minutes: 5 } },
      };
    }
    const data = await res.json();
    return {
      entries: [{ temperature: data.temp, condition: data.desc }],
      reloadPolicy: { after: { minutes: 15 } },
    };
  },
});
```

`placeholder` 字段提供控件画廊中显示的数据以及加载期间的数据。如果提供者抛出未处理的异常，生成的 Swift/Kotlin 代码会捕获它并渲染占位符。

## 多个时间线条目

返回多个条目以安排未来的内容，而无需重新获取：

```typescript
provider: async () => {
  const res = await fetch("https://api.example.com/hourly");
  const hours = await res.json();
  return {
    entries: hours.map((h: any) => ({
      temperature: h.temp,
      condition: h.condition,
    })),
    reloadPolicy: { after: { minutes: 60 } },
  };
},
```

每个条目在时间线中的相应日期渲染。系统自动在条目之间过渡。

## Next Steps

- [Configuration](configuration.md) -- User-configurable parameters
- [Cross-Platform Reference](platforms.md) -- Build targets and platform differences