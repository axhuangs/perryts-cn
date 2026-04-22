# watchOS Complications

Perry 控件可以使用 `--target watchos-widget` 编译为 watchOS WidgetKit complications。相同的 `Widget({...})` 源产生 iOS 和 watchOS 控件——支持的系列确定渲染。

## 附件系列

watchOS complications 使用附件系列而不是系统系列：

| Family | Size | Best For |
|--------|------|----------|
| `accessoryCircular` | ~76x76pt | Single icon, number, or Gauge |
| `accessoryRectangular` | ~160x76pt | 2-3 lines of text |
| `accessoryInline` | Single line | Short text only |

## Gauge 组件

`Gauge` 组件专为 watchOS 圆形 complications 设计：

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

### Gauge 样式

- **`circular`** — 环形仪表，映射到 SwiftUI 中的 `.gaugeStyle(.accessoryCircularCapacity)`
- **`linear`** / **`linearCapacity`** — 水平条，映射到 `.gaugeStyle(.linearCapacity)`

## 刷新预算

watchOS 比 iOS 有更严格的刷新预算：
- 推荐：每 60 分钟刷新一次 (`reloadPolicy: { after: { minutes: 60 } }`)
- 最大：系统可能会更激进地限制
- 后台刷新使用 `BackgroundTask` 框架

## 编译

```bash
# For Apple Watch device
perry widget.ts --target watchos-widget --app-bundle-id com.example.app -o widget_out

# For Apple Watch Simulator
perry widget.ts --target watchos-widget-simulator --app-bundle-id com.example.app -o widget_out
```

构建：
```bash
xcrun --sdk watchos swiftc -target arm64-apple-watchos9.0 \
  widget_out/*.swift \
  -framework WidgetKit -framework SwiftUI \
  -o widget_out/WidgetExtension
```

## 配置

- watchOS 10+ 支持 AppIntent 用于控件配置（与 iOS 17+ 相同）
- 较旧的 watchOS 版本自动获取 `StaticConfiguration` 回退
- `config` 参数与 iOS 完全相同工作

## 内存考虑

watchOS 控件扩展比 iOS (~30MB) 有更严格的内存限制 (~15-20MB)。仅提供者编译方法至关重要——只有数据获取代码原生运行，保持内存使用最小。