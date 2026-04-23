# 小组件与修饰器

本文档介绍适用于小组件（Widget）的可用组件及修饰器。

## 文本（Text）

```typescript
Text("Hello, World!")
Text(`${entry.name}: ${entry.value}`)
```

### 文本修饰器

```typescript
const t = Text("Styled");
t.font("title");       // .title、.headline、.body、.caption 等字体样式
t.color("blue");       // 命名颜色或十六进制颜色值
t.bold();
```

## 布局（Layout）

### 垂直栈（VStack）

```typescript
VStack([
  Text("Top"),
  Text("Bottom"),
])
```

### 水平栈（HStack）

```typescript
HStack([
  Text("Left"),
  Spacer(),
  Text("Right"),
])
```

### 层级栈（ZStack）

```typescript
ZStack([
  Image("background"),
  Text("Overlay"),
])
```

## 间距填充（Spacer）

可自适应扩展以填充可用空间的弹性间距：

```typescript
HStack([
  Text("Left"),
  Spacer(),
  Text("Right"),
])
```

## 图片（Image）

用于显示 SF Symbols 图标或资源图片：

```typescript
Image("star.fill")           // SF Symbol 图标
Image("cloud.sun.rain.fill") // SF Symbol 图标
```

## 循环渲染（ForEach）

遍历数组类型的 entry 字段，渲染组件列表：

```typescript
ForEach(entry.items, (item) =>
  HStack([
    Text(item.name),
    Spacer(),
    Text(`${item.value}`),
  ])
)
```

## 分隔线（Divider）

用于视觉分隔的线条：

```typescript
VStack([
  Text("Above"),
  Divider(),
  Text("Below"),
])
```

## 标签（Label）

包含文本和 SF Symbols 图标的标签组件：

```typescript
Label("Downloads", "arrow.down.circle")
Label(`${entry.count} items`, "folder.fill")
```

## 仪表盘（Gauge）

圆形或线性进度指示器：

```typescript
Gauge(entry.progress, 0, 100)       // 参数：值、最小值、最大值
Gauge(entry.battery, 0, 1.0)
```

## 修饰器（Modifiers）

小组件组件支持 SwiftUI 风格的修饰器：

### 字体（Font）

```typescript
Text("Title").font("title")
Text("Body").font("body")
Text("Caption").font("caption")
```

### 颜色（Color）

```typescript
Text("Red text").color("red")
Text("Custom").color("#FF6600")
```

### 内边距（Padding）

```typescript
VStack([...]).padding(16)
```

### 框架（Frame）

```typescript
widget.frame(width, height)
```

### 最大宽度（Max Width）

```typescript
widget.maxWidth("infinity")   // 扩展至填充可用宽度
```

### 最小缩放系数（Minimum Scale Factor）

允许文本自动缩小以适配容器：

```typescript
Text("Long text").minimumScaleFactor(0.5)
```

### 容器背景（Container Background）

为小组件容器设置背景色：

```typescript
VStack([...]).containerBackground("blue")
```

### 小组件链接（Widget URL）

为小组件添加可点击的深度链接：

```typescript
VStack([...]).url("myapp://detail/123")
```

### 指定边距（Edge-Specific Padding）

为特定边应用内边距：

```typescript
VStack([...]).paddingEdge("top", 8)
VStack([...]).paddingEdge("horizontal", 16)
```

## 条件渲染（Conditionals）

基于 entry 数据渲染不同组件：

```typescript
render: (entry) =>
  VStack([
    entry.isOnline
      ? Text("Online").color("green")
      : Text("Offline").color("red"),
  ]),
```

## 完整示例

```typescript
import { Widget, Text, VStack, HStack, Image, Spacer } from "perry/widget";

Widget({
  kind: "StatsWidget",
  displayName: "Stats",
  description: "Shows daily stats",
  entryFields: {
    steps: "number",
    calories: "number",
    distance: "string",
  },
  render: (entry) =>
    VStack([
      HStack([
        Image("figure.walk"),
        Text("Daily Stats").font("headline"),
      ]),
      Spacer(),
      HStack([
        VStack([
          Text(`${entry.steps}`).font("title").bold(),
          Text("steps").font("caption").color("gray"),
        ]),
        Spacer(),
        VStack([
          Text(`${entry.calories}`).font("title").bold(),
          Text("cal").font("caption").color("gray"),
        ]),
        Spacer(),
        VStack([
          Text(entry.distance).font("title").bold(),
          Text("km").font("caption").color("gray"),
        ]),
      ]),
    ]).padding(16),
});
```

## 后续参考

- [Creating Widgets](creating-widgets) — Widget() API
- [小组件概述](overview) — 小组件系统整体介绍