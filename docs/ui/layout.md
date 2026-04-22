# 布局

Perry 提供使用平台的原生布局系统排列子小部件的布局容器。

## VStack

垂直排列子项（从上到下）。

```typescript
import { VStack, Text, Button } from "perry/ui";

VStack(16, [
  Text("First"),
  Text("Second"),
  Text("Third"),
]);
```

`VStack(spacing, children)` — 第一个参数是子项之间的间距（以点为单位）。

**方法：**
- `setPadding(padding: number)` — 设置所有边缘的填充
- `setSpacing(spacing: number)` — 设置子项之间的间距

## HStack

水平排列子项（从左到右）。

```typescript
import { HStack, Text, Button, Spacer } from "perry/ui";

HStack(8, [
  Button("Cancel", () => {}),
  Spacer(),
  Button("OK", () => {}),
]);
```

`HStack(spacing, children)` — 第一个参数是子项之间的间距（以点为单位）。

## ZStack

将子项分层叠加（从后到前）。

```typescript
import { ZStack, Text, Image } from "perry/ui";

ZStack(0, [
  Image("background.png"),
  Text("Overlay text"),
]);
```

## ScrollView

一个可滚动的容器。

```typescript
import { ScrollView, VStack, Text } from "perry/ui";

ScrollView(
  VStack(
    8,
    Array.from({ length: 100 }, (_, i) => Text(`Row ${i}`))
  )
);
```

**方法：**
- `setRefreshControl(callback: () => void)` — 添加下拉刷新（拉动时调用回调）
- `endRefreshing()` — 停止刷新指示器

## LazyVStack

一个垂直滚动的列表，懒加载渲染项目。对于大列表，比 `ScrollView` + `VStack` 更高效。

```typescript
import { LazyVStack, Text } from "perry/ui";

LazyVStack(1000, (index) => {
  return Text(`Row ${index}`);
});
```

## NavigationStack

一个支持推入/弹出导航的导航容器。

```typescript
import { NavigationStack, VStack, Text, Button } from "perry/ui";

NavigationStack(
  VStack(16, [
    Text("Home Screen"),
    Button("Go to Details", () => {
      // 推入新视图
    }),
  ])
);
```