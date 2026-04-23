# watchOS 复杂功能（Complications）

Perry 小组件可通过 `--target watchos-widget` 编译为 watchOS WidgetKit 复杂功能。同一 `Widget({...})` 源代码可同时生成 iOS 和 watchOS 小组件——具体渲染效果由所支持的样式族（families）决定。

## 辅助样式族（Accessory Families）

watchOS 复杂功能使用辅助样式族，而非系统样式族：

| 样式族（Family） | 尺寸 | 适用场景 |
|--------|------|----------|
| `accessoryCircular` | 约76x76点 | 单个图标、数字或仪表盘（Gauge） |
| `accessoryRectangular` | 约160x76点 | 2-3行文本 |
| `accessoryInline` | 单行 | 仅短文本 |

## 仪表盘组件（Gauge Component）

`Gauge` 组件专为 watchOS 圆形复杂功能设计：

```typescript
import { Widget, Text, VStack, Gauge } from "perry/widget";

Widget({
  kind: "QuickStats",
  displayName: "Quick Stats",
  supportedFamilies: ["accessoryCircular", "accessoryRectangular"],

  render(entry: { progress: number; label: string }, family) {
    if (family === "accessoryCircular") {
      return Gauge(entry.progress, {
        label: "Done", style: "circular"
      })
    }
    return VStack([
      Text(entry.label, { font: "headline" }),
      Gauge(entry.progress, { label: "Progress", style: "linear" }),
    ])
  },
})
```

### 仪表盘样式（Gauge Styles）

- **`circular`** — 环形仪表盘，对应 SwiftUI 中的 `.gaugeStyle(.accessoryCircularCapacity)`
- **`linear`** / **`linearCapacity`** — 水平条形图，对应 `.gaugeStyle(.linearCapacity)`

## 刷新预算（Refresh Budgets）

watchOS 的刷新预算比 iOS 更为严格：
- 推荐配置：每60分钟刷新一次（`reloadPolicy: { after: { minutes: 60 } }`）
- 上限说明：系统可能会比 iOS 更激进地限制刷新频率
- 后台刷新：基于 `BackgroundTask` 框架实现

## 编译（Compilation）

```bash
# For Apple Watch device
perry widget.ts --target watchos-widget --app-bundle-id com.example.app -o widget_out

# For Apple Watch Simulator
perry widget.ts --target watchos-widget-simulator --app-bundle-id com.example.app -o widget_out
```

构建命令：
```bash
xcrun --sdk watchos swiftc -target arm64-apple-watchos9.0 \
  widget_out/*.swift \
  -framework WidgetKit -framework SwiftUI \
  -o widget_out/WidgetExtension
```

## 配置（Configuration）

- watchOS 10及以上版本支持通过 AppIntent 实现小组件配置（与 iOS 17及以上版本一致）
- 旧版 watchOS 会自动降级使用 `StaticConfiguration` 作为兜底方案
- `config` 参数的使用方式与 iOS 完全一致

## 内存考量（Memory Considerations）

watchOS 小组件扩展的内存限制比 iOS 更严格（约15-20MB），而 iOS 约为30MB。仅编译数据提供器（provider-only）的实现方式至关重要——仅原生运行数据获取代码，可将内存占用降至最低。
