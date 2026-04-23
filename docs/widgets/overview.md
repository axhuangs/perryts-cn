# 小组件（WidgetKit）概述

Perry 可将 TypeScript 小组件声明编译为四大平台的原生小组件扩展：iOS（WidgetKit）、Android（App 小组件）、watchOS（表盘复杂功能）以及 Wear OS（Tiles 磁贴）。

## 什么是小组件？

主屏小组件可在应用外展示一目了然的关键信息。Perry 提供的 `perry/widget` 模块支持通过 TypeScript 定义小组件，并编译为各平台对应的原生小组件系统。

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

## 工作原理

```
TypeScript 小组件声明
    ↓ 解析并转换为 WidgetDecl 高层中间表示（HIR）
    ↓ 平台专属代码生成
    ↓
iOS/watchOS: SwiftUI WidgetKit 扩展（Entry、View、TimelineProvider、WidgetBundle、Info.plist）
Android:    AppWidgetProvider + 布局 XML + AppWidgetProviderInfo
Wear OS:    TileService + 布局
```

编译器会为每个平台生成完整的原生小组件扩展——无需掌握各平台专属的开发语言。

## 构建方式

```bash
perry widget.ts --target ios-widget              # iOS WidgetKit 扩展
perry widget.ts --target android-widget           # Android App 小组件
perry widget.ts --target watchos-widget            # watchOS 表盘复杂功能
perry widget.ts --target watchos-widget-simulator   # watchOS 模拟器
perry widget.ts --target wearos-tile               # Wear OS 磁贴
```

每个编译目标会生成对应平台的原生小组件扩展。

## 后续参考

- [Creating Widgets](creating-widgets) — 详解 Widget() API
- [Components & Modifiers](components) — 可用的小组件组件
- [Configuration](configuration) — 小组件配置选项
- [Data Fetching](data-fetching) — 时间线提供器（TimelineProvider）与数据加载
- [Cross-Platform Reference](platforms) — 各平台专属细节
- [watchOS Complications](watchos) — watchOS 专属指南
- [Wear OS Tiles](wearos) — Wear OS 专属指南