# 创建小组件

使用 `Widget()` 函数定义主屏小组件。

## 小组件声明

```typescript
import { Widget, Text, VStack, HStack, Image, Spacer } from "perry/widget";

Widget({
  kind: "WeatherWidget",
  displayName: "Weather",
  description: "Shows current weather",
  entryFields: {
    temperature: "number",
    condition: "string",
    location: "string",
  },
  render: (entry) =>
    VStack([
      HStack([
        Text(entry.location),
        Spacer(),
        Image("cloud.sun.fill"),
      ]),
      Text(`${entry.temperature}°`),
      Text(entry.condition),
    ]),
});
```

## 小组件配置项

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| `kind` | `string` | 小组件的唯一标识符 |
| `displayName` | `string` | 小组件库中显示的名称 |
| `description` | `string` | 小组件库中的描述信息 |
| `entryFields` | `object` | 带类型的数据字段（支持 `"string"`、`"number"`、`"boolean"`、数组、可选类型、对象） |
| `render` | `function` | 接收条目数据的渲染函数，返回小组件树结构。第二个参数为可选参数，用于指定小组件尺寸类型。 |
| `config` | `object` | 用户可编辑的配置参数（见下文） |
| `provider` | `function` | 用于为小组件获取动态数据的时间线提供器函数（见下文） |
| `appGroup` | `string` | 用于与宿主应用共享数据的应用组标识符 |

## 条目字段

条目字段用于定义小组件展示的数据，每个字段包含名称和类型：

```typescript
entryFields: {
  title: "string",
  count: "number",
  isActive: "boolean",
}
```

### 数组、可选及对象字段

条目字段支持除基本类型外更丰富的类型：

```typescript
entryFields: {
  items: [{ name: "string", value: "number" }],  // 对象数组
  subtitle: "string?",                             // 可选字符串
  stats: { wins: "number", losses: "number" },     // 嵌套对象
}
```

这些字段会编译为 Swift 中的 `TimelineEntry` 结构体：

```swift
struct WeatherEntry: TimelineEntry {
    let date: Date
    let temperature: Double
    let condition: String
    let location: String
}
```

## 渲染中的条件判断

可使用三元表达式实现条件渲染：

```typescript
render: (entry) =>
  VStack([
    Text(entry.isActive ? "Active" : "Inactive"),
    entry.count > 0 ? Text(`${entry.count} items`) : Spacer(),
  ]),
```

## 模板字面量

小组件文本中的模板字面量会编译为 Swift 字符串插值：

```typescript
Text(`${entry.name}: ${entry.score} points`)
// 编译后：Text("\(entry.name): \(entry.score) points")
```

## 配置参数

`config` 字段用于定义出现在小组件编辑界面中的用户可编辑参数：

```typescript
Widget({
  kind: "CityWeather",
  displayName: "City Weather",
  description: "Weather for a chosen city",
  config: {
    city: { type: "string", displayName: "City", default: "New York" },
    units: { type: "enum", displayName: "Units", values: ["Celsius", "Fahrenheit"], default: "Celsius" },
  },
  entryFields: { temperature: "number", condition: "string" },
  render: (entry) => Text(`${entry.temperature}° ${entry.condition}`),
});
```

## 提供器函数

`provider` 字段用于定义为小组件获取数据的时间线提供器：

```typescript
Widget({
  kind: "StockWidget",
  displayName: "Stock Price",
  description: "Shows current stock price",
  config: { symbol: { type: "string", displayName: "Symbol", default: "AAPL" } },
  entryFields: { price: "number", change: "string" },
  provider: async (config) => {
    const res = await fetch(`https://api.example.com/stock/${config.symbol}`);
    const data = await res.json();
    return { price: data.price, change: data.change };
  },
  render: (entry) =>
    VStack([
      Text(`$${entry.price}`).font("title"),
      Text(entry.change).color("green"),
    ]),
});
```

### 占位数据

当小组件暂未获取到数据时（如首次加载），提供器可通过返回 `placeholder` 字段来设置占位数据：

```typescript
Widget({
  kind: "NewsWidget",
  entryFields: { headline: "string", source: "string" },
  placeholder: { headline: "Loading...", source: "---" },
  // ...
});
```

## 按尺寸类型定制渲染

渲染函数的第二个可选参数为小组件尺寸类型，可针对不同尺寸实现差异化布局：

```typescript
render: (entry, family) =>
  family === "systemLarge"
    ? VStack([
        Text(entry.title).font("title"),
        ForEach(entry.items, (item) => Text(item.name)),
      ])
    : HStack([
        Image("star.fill"),
        Text(entry.title).font("headline"),
      ]),
```

支持的尺寸类型：`"systemSmall"`、`"systemMedium"`、`"systemLarge"`、`"accessoryCircular"`、`"accessoryRectangular"`、`"accessoryInline"`。

## 应用组

`appGroup` 字段用于指定宿主应用与小组件之间进行数据交换的共享容器：

```typescript
Widget({
  kind: "AppDataWidget",
  appGroup: "group.com.example.myapp",
  // ...
});
```

## 多小组件定义

可在单个文件中定义多个小组件，它们会被打包至一个 `WidgetBundle` 中：

```typescript
Widget({
  kind: "SmallWidget",
  // ...
});

Widget({
  kind: "LargeWidget",
  // ...
});
```

## 后续参考

- [Components & Modifiers](components) — 可用的小组件组件及修饰器
- [小组件概述](overview) — 小组件系统概述