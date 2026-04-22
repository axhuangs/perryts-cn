# 控件 (WidgetKit) 概述

Perry 可以将 TypeScript 控件声明编译为四个平台的原生控件扩展：iOS (WidgetKit)、Android (App Widgets)、watchOS (Complications) 和 Wear OS (Tiles)。

## 什么是控件？

主屏幕控件在您的应用外部显示一目了然的信息。Perry 的 `perry/widget` 模块让您可以在 TypeScript 中定义控件，这些控件编译为每个平台的原生控件系统。

```typescript
import { Widget, Text, VStack } from "perry/widget";

Widget({
  kind: "MyWidget",
  displayName: "My Widget",
  description: "Shows a greeting",
  entryFields: { name: "string" },
  render: (entry) =>
    VStack([
      Text(`Hello, ${entry.name}!`),
    ]),
});
```

## 它如何工作？

```
TypeScript 控件声明
    ↓ 解析并降低到控件声明 HIR
    ↓ 平台特定代码生成
    ↓
iOS/watchOS: SwiftUI WidgetKit 扩展 (Entry, View, TimelineProvider, WidgetBundle, Info.plist)
Android:    AppWidgetProvider + layout XML + AppWidgetProviderInfo
Wear OS:    TileService + layout
```

编译器为每个平台生成完整的原生控件扩展——无需平台特定语言知识。

## 构建

```bash
perry widget.ts --target ios-widget              # iOS WidgetKit extension
perry widget.ts --target android-widget           # Android App Widget
perry widget.ts --target watchos-widget            # watchOS Complication
perry widget.ts --target watchos-widget-simulator   # watchOS Simulator
perry widget.ts --target wearos-tile               # Wear OS Tile
```

每个目标为该平台生成适当的原生控件扩展。

## Next Steps

- [Creating Widgets](creating-widgets.md) — Widget() API in detail
- [Components & Modifiers](components.md) — Available widget components
- [Configuration](configuration.md) — Widget configuration options
- [Data Fetching](data-fetching.md) — Timeline providers and data loading
- [Cross-Platform Reference](platforms.md) — Platform-specific details
- [watchOS Complications](watchos.md) — watchOS-specific guide
- [Wear OS Tiles](wearos.md) — Wear OS-specific guide