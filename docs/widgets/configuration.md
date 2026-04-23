# 小组件配置

Perry 小组件支持用户可配置参数。在 iOS/watchOS 平台上，这些参数会编译为 AppIntent 配置（即“编辑小组件”面板）；在 Android/Wear OS 平台上，会编译为配置活动（Configuration Activity）。

## 定义配置字段

在 `Widget()` 声明中添加 `config` 对象。每个字段需指定类型、允许值、默认值和显示标题。

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

| 类型 | TypeScript 定义 | 说明 |
|------|-----------|-------------|
| 枚举（Enum） | `{ type: "enum", values: [...], default: "...", title: "..." }` | 包含固定选项的选择器 |
| 布尔值（Boolean） | `{ type: "bool", default: true, title: "..." }` | 开关控件 |
| 字符串（String） | `{ type: "string", default: "...", title: "..." }` | 自由文本输入框 |

## 在 Provider 中访问配置

`provider` 函数会接收当前配置值作为入参。配置对象的键与你定义的字段名一致：

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

当用户修改配置值时，系统会传入更新后的配置，重新调用 provider 函数。

## 布尔型配置示例

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

### iOS / watchOS（AppIntent）

Perry 会生成一个 Swift 结构体 `WidgetConfigurationIntent`，其中为每个枚举字段包含 `@Parameter` 属性和 `AppEnum` 类型。该小组件使用 `AppIntentConfiguration` 而非 `StaticConfiguration`。

生成的输出文件（自动生成，无需手动编写）：
- `{Name}Intent.swift` —— 包含 AppEnum 枚举项和 Intent 结构体
- Provider 遵循 `AppIntentTimelineProvider` 协议，而非 `TimelineProvider`
- 配置值会序列化为 JSON 并传递至原生 provider 函数

用户可通过长按小组件并选择“编辑小组件”来配置，该操作会展示系统生成的 AppIntent 界面。

### Android / Wear OS（配置活动）

Perry 会生成 `{Name}ConfigActivity.kt`，其中为枚举字段提供 Spinner 控件，为布尔字段提供 Switch 控件。配置值会按小组件 ID 存储在 SharedPreferences 中。

生成的输出文件：
- `{Name}ConfigActivity.kt` —— 包含 UI 控件和保存按钮的活动
- `widget_info_{name}.xml` —— 包含指向配置活动的 `android:configure` 属性
- AndroidManifest 代码片段包含带有 `APPWIDGET_CONFIGURE` 意图过滤器的 `<activity>` 节点

用户首次添加小组件时，配置活动会自动启动。

## 构建命令

```bash
# iOS
perry widget.ts --target ios-widget --app-bundle-id com.example.app -o widget_out

# Android
perry widget.ts --target android-widget --app-bundle-id com.example.app -o widget_out
```

## 后续参考

- [Data Fetching](data-fetching) —— Provider 函数与共享存储
- [Components & Modifiers](components) —— 可用的小组件组件
- [Cross-Platform Reference](platforms) —— 功能矩阵与构建目标