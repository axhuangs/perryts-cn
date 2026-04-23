# 提供者函数与数据获取

`provider` 函数是动态小组件的核心。它负责获取数据、转换数据格式，并返回时间线条目，供系统按预定时间渲染。

## 提供者生命周期

1. 当小组件首次添加、需要生成快照或重新加载策略过期时，系统会调用提供者函数。
2. 提供者函数以原生 LLVM 编译代码的形式运行，并链接到小组件扩展中。
3. 提供者函数返回一个或多个时间线条目，系统会在预定时间渲染每个条目。
4. 最后一个条目渲染完成后，重新加载策略将决定提供者函数下次运行的时间。

## 基础提供者函数

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

## 基于共享存储的认证请求

小组件运行在独立进程中，无法访问主应用的内存空间。可通过 `sharedStorage()` 读取主应用写入共享容器的值。

### iOS / watchOS：应用组（App Groups）

在苹果平台上，共享存储映射到基于 App Group 容器的 `UserDefaults(suiteName:)`。需在小组件声明中设置 `appGroup` 字段：

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

主应用需将令牌写入共享容器：

```typescript
import { preferencesSet } from "perry/system";
// In your app's login flow:
preferencesSet("auth_token", token);
```

**iOS 配置要求**：在 Xcode 中为主应用目标和小组件扩展目标均添加 App Group 能力，其标识符必须与 `appGroup` 的值一致。

### Android / Wear OS：SharedPreferences

在 Android 平台上，共享存储映射到名为 `perry_shared` 的 `SharedPreferences`。生成的 `Bridge.kt` 文件会通过 `context.getSharedPreferences("perry_shared", MODE_PRIVATE)` 读取值。

## 重新加载策略

`reloadPolicy` 字段控制系统下次调用提供者函数的时机：

```typescript
return {
  entries: [{ ... }],
  reloadPolicy: { after: { minutes: 30 } },
};
```

| 策略 | 行为 |
|--------|----------|
| `{ after: { minutes: N } }` | N 分钟后重新获取数据。在 iOS 上编译为 `.after(Date().addingTimeInterval(N*60))`，在 Wear OS 上编译为 `setFreshnessIntervalMillis(N*60000)`。 |
| *（省略）* | iOS 平台默认 30 分钟，Android/Wear OS 平台默认 30 分钟。 |

**预算限制**：iOS 对小组件刷新频率有限制，每日典型刷新预算为 40-70 次。watchOS 限制更严格（详见 [watchOS 复杂功能](watchos)），仅按需请求刷新即可。

## JSON 响应处理

提供者函数会直接接收解析后的 JSON 数据，条目字段类型必须与 `entryFields` 声明的类型匹配：

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

若数据获取失败或 JSON 解析抛出异常，小组件扩展会回退到占位数据：

```typescript
Widget({
  // ...
  placeholder: { temperature: 0, condition: "Loading..." },

  provider: async () => {
    const res = await fetch("https://api.example.com/weather");
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

`placeholder` 字段提供的占位数据会在小组件画廊展示及加载过程中显示。若提供者函数抛出未处理的异常，生成的 Swift/Kotlin 代码会捕获该异常并渲染占位数据。

## 多时间线条目

返回多个条目可实现无需重新获取数据即可调度未来内容的渲染：

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

每个条目会在时间线中对应的日期渲染，系统会自动在不同条目间切换展示。

## 后续参考

- [Configuration](configuration) -- 用户可配置的参数
- [Cross-Platform Reference](platforms) -- 构建目标与平台差异