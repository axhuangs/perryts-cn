# 控件配置

Perry 控件支持用户可配置的参数。在 iOS/watchOS 上，这些编译为 AppIntent 配置（“编辑控件”表）。在 Android/Wear OS 上，这些编译为配置活动。

## 定义配置字段

在您的 `Widget()` 声明中添加一个 `config` 对象。每个字段指定一个类型、允许的值、默认值和显示标题。

```typescript
import { Widget, Text, VStack, HStack, Spacer } from "perry/widget";

Widget({
  kind: "TopSitesWidget",
  displayName: "Top Sites",
  description: "Your top performing sites",
  supportedFamilies: ["systemSmall", "systemMedium"],
  appGroup: "group.com.example.shared",

  config: {
    sortBy: {
      type: "enum",
      values: ["clicks", "impressions", "ctr", "position"],
      default: "clicks",
      title: "Sort By",
    },
    dateRange: {
      type: "enum",
      values: ["7d", "28d", "90d"],
      default: "7d",
      title: "Date Range",
    },
  },

  entryFields: {
    total: "number",
    label: "string",
  },

  provider: async (config: { sortBy: string; dateRange: string }) => {
    const res = await fetch(
      `https://api.example.com/stats?sort=${config.sortBy}&range=${config.dateRange}`
    );
    const data = await res.json();
    return {
      entries: [{ total: data.total, label: data.label }],
      reloadPolicy: { after: { minutes: 30 } },
    };
  },

  render: (entry) =>
    VStack([
      Text(`${entry.total}`, { font: "title", fontWeight: "bold" }),
      Text(entry.label, { font: "caption", color: "secondary" }),
    ]),
});
```

## 支持的参数类型

| Type | TypeScript | Description |
|------|-----------|-------------|
| Enum | `{ type: "enum", values: [...], default: "...", title: "..." }` | Picker with fixed choices |
| Boolean | `{ type: "bool", default: true, title: "..." }` | Toggle switch |
| String | `{ type: "string", default: "...", title: "..." }` | Free-text input |

## 在提供者中访问配置

`provider` 函数接收当前配置值作为其参数。配置对象键与您定义的字段名称匹配：

```typescript
provider: async (config: { sortBy: string; dateRange: string }) => {
  // config.sortBy === "clicks" | "impressions" | "ctr" | "position"
  // config.dateRange === "7d" | "28d" | "90d"
  const url = `https://api.example.com/data?sort=${config.sortBy}`;
  const res = await fetch(url);
  const data = await res.json();
  return { entries: [data] };
},
```

当用户更改配置值时，系统会再次调用您的提供者，并传入更新的配置。

## 布尔配置示例

```typescript
config: {
  showDetails: {
    type: "bool",
    default: true,
    title: "Show Details",
  },
},
```

## 平台映射

### iOS / watchOS (AppIntent)

Perry 生成一个 Swift `WidgetConfigurationIntent` 结构体，其中包含 `@Parameter` 属性和每个枚举字段的 `AppEnum` 类型。控件使用 `AppIntentConfiguration` 而不是 `StaticConfiguration`。

生成输出（自动生成，不手动编写）：
- `{Name}Intent.swift` -- 包含 AppEnum 案例和意图结构体
- 提供者符合 `AppIntentTimelineProvider` 而不是 `TimelineProvider`
- 配置值序列化为 JSON 并传递给原生提供者函数

用户通过长按并选择“编辑控件”来配置控件，这会呈现系统生成的 AppIntent UI。

### Android / Wear OS (Configuration Activity)

Perry 生成一个 `{Name}ConfigActivity.kt`，其中包含枚举字段的 Spinner 控件和布尔字段的 Switch 控件。值保存在 SharedPreferences 中，按控件 ID 键入。

生成输出：
- `{Name}ConfigActivity.kt` -- 具有 UI 控件和保存按钮的活动
- `widget_info_{name}.xml` -- 包括指向配置活动的 `android:configure`
- AndroidManifest 片段包括带有 `APPWIDGET_CONFIGURE` 意图过滤器的 `<activity>` 条目

配置活动在用户首次添加控件时自动启动。

## 构建命令

```bash
# iOS
perry widget.ts --target ios-widget --app-bundle-id com.example.app -o widget_out

# Android
perry widget.ts --target android-widget --app-bundle-id com.example.app -o widget_out
```

## Next Steps

- [Data Fetching](data-fetching.md) -- Provider function and shared storage
- [Components](components.md) -- Available widget components
- [Cross-Platform Reference](platforms.md) -- Feature matrix and build targets