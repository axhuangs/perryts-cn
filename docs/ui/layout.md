# 布局

Perry 提供了布局容器，可通过平台原生的布局系统来排列子组件。

## 垂直栈（VStack）

将子组件垂直排列（从上到下）。

```typescript
import { VStack, Text, Button } from "perry/ui";

VStack(16, [
  Text("第一个"),
  Text("第二个"),
  Text("第三个"),
]);
```

`VStack(spacing, children)` — 第一个参数为子组件之间的间距（单位：点）。

**方法：**
- `setPadding(padding: number)` — 为所有边缘设置内边距
- `setSpacing(spacing: number)` — 设置子组件之间的间距

## 水平栈（HStack）

将子组件水平排列（从左到右）。

```typescript
import { HStack, Text, Button, Spacer } from "perry/ui";

HStack(8, [
  Button("取消", () => {}),
  Spacer(),
  Button("确定", () => {}),
]);
```

`HStack(spacing, children)` — 第一个参数为子组件之间的间距（单位：点）。

## 层级栈（ZStack）

将子组件层层叠加排列（从后到前）。

```typescript
import { ZStack, Text, Image } from "perry/ui";

ZStack(0, [
  Image("background.png"),
  Text("叠加文本"),
]);
```

## 滚动视图（ScrollView）

可滚动的容器。

```typescript
import { ScrollView, VStack, Text } from "perry/ui";

ScrollView(
  VStack(
    8,
    Array.from({ length: 100 }, (_, i) => Text(`第 ${i} 行`))
  )
);
```

**方法：**
- `setRefreshControl(callback: () => void)` — 添加下拉刷新功能（下拉时调用回调函数）
- `endRefreshing()` — 停止刷新指示器

## 惰性垂直栈（LazyVStack）

一种垂直滚动列表，会惰性渲染列表项。对于大型列表，其性能优于 `ScrollView` + `VStack` 的组合方式。

```typescript
import { LazyVStack, Text } from "perry/ui";

LazyVStack(1000, (index) => {
  return Text(`第 ${index} 行`);
});
```

## 导航栈（NavigationStack）

支持页面入栈/出栈导航的容器。

```typescript
import { NavigationStack, VStack, Text, Button } from "perry/ui";

NavigationStack(
  VStack(16, [
    Text("首页"),
    Button("前往详情页", () => {
      // 推入新视图
    }),
  ])
);
```

## 间隔器（Spacer）

可灵活扩展以填充可用空间的间隔组件。

```typescript
import { HStack, Text, Spacer } from "perry/ui";

HStack(8, [
  Text("左侧"),
  Spacer(),
  Text("右侧"),
]);
```

在 `HStack` 或 `VStack` 中使用 `Spacer()` 可将组件向两侧推开。

## 分隔线（Divider）

视觉分隔线组件。

```typescript
import { VStack, Text, Divider } from "perry/ui";

VStack(12, [
  Text("第一节"),
  Divider(),
  Text("第二节"),
]);
```

## 布局嵌套

布局可自由嵌套：

```typescript
import { App, VStack, HStack, Text, Button, Spacer, Divider } from "perry/ui";

App({
  title: "布局示例",
  width: 800,
  height: 600,
  body: VStack(16, [
    // 页头
    HStack(8, [
      Text("我的应用"),
      Spacer(),
      Button("设置", () => {}),
    ]),
    Divider(),
    // 内容区
    VStack(12, [
      Text("欢迎！"),
      HStack(8, [
        Button("操作1", () => {}),
        Button("操作2", () => {}),
      ]),
    ]),
    Spacer(),
    // 页脚
    Text("v1.0.0"),
  ]),
});
```

## 子组件管理

容器支持动态管理子组件：

```typescript
const stack = VStack(16, []);
// 动态添加子组件
stack.addChild(Text("新子组件"));
stack.addChildAt(0, Text("前置添加"));
stack.removeChild(someWidget);
stack.reorderChild(widget, 2);
stack.clearChildren();
```

**方法：**
- `addChild(widget)` — 追加一个子组件
- `addChildAt(index, widget)` — 在指定位置插入子组件
- `removeChild(widget)` — 移除一个子组件
- `reorderChild(widget, newIndex)` — 将子组件移动到新位置
- `clearChildren()` — 移除所有子组件

## 栈对齐方式

使用 `stackSetAlignment` 控制子组件在栈内的对齐方式：

```typescript
import { VStack, Text, stackSetAlignment } from "perry/ui";

const centered = VStack(16, [
  Text("居中显示"),
  Text("内容"),
]);
stackSetAlignment(centered, 9); // 水平居中（CenterX）
```

**VStack 对齐方式**（交叉轴 = 水平方向）：

| 数值 | 名称 | 效果 |
|-------|------|--------|
| 5 | Leading（首部） | 子组件对齐到首部（左侧）边缘 |
| 9 | CenterX（水平居中） | 子组件水平居中 |
| 7 | Width（宽度填充） | 子组件拉伸至填满栈的宽度 |

**HStack 对齐方式**（交叉轴 = 垂直方向）：

| 数值 | 名称 | 效果 |
|-------|------|--------|
| 3 | Top（顶部） | 子组件对齐到顶部 |
| 12 | CenterY（垂直居中） | 子组件垂直居中 |
| 4 | Bottom（底部） | 子组件对齐到底部 |

## 栈分布方式

使用 `stackSetDistribution` 控制子组件在栈内的空间分配方式：

```typescript
import { HStack, Button, stackSetDistribution } from "perry/ui";

const buttons = HStack(8, [
  Button("取消", () => {}),
  Button("确定", () => {}),
]);
stackSetDistribution(buttons, 1); // 等宽填充（FillEqually）—— 两个按钮宽度相等
```

| 数值 | 名称 | 行为 |
|-------|------|----------|
| 0 | Fill（填充） | 默认值。第一个可调整大小的子组件填充剩余空间 |
| 1 | FillEqually（等宽/高填充） | 所有子组件尺寸相等 |
| 2 | FillProportionally（按比例填充） | 子组件尺寸与其固有内容成比例 |
| 3 | EqualSpacing（等间距） | 子组件之间的间距相等 |
| 4 | EqualCentering（等中心距） | 子组件中心之间的距离相等 |

## 填充父容器

将子组件的边缘固定到其父容器边缘：

```typescript
import { VStack, Text, widgetMatchParentWidth } from "perry/ui";

const banner = Text("全屏宽度横幅");
widgetMatchParentWidth(banner);

VStack(16, [banner, Text("普通宽度")]);
```

- `widgetMatchParentWidth(widget)` — 拉伸以填充父容器宽度
- `widgetMatchParentHeight(widget)` — 拉伸以填充父容器高度

## 内容贴合性

控制组件是否抗拒被拉伸至超过其固有尺寸：

```typescript
import { VStack, Text, widgetSetHugging } from "perry/ui";

const label = Text("我保持小尺寸");
widgetSetHugging(label, 750); // 高优先级 — 抗拒拉伸

const filler = Text("我会拉伸");
widgetSetHugging(filler, 1); // 低优先级 — 拉伸以填充空间
```

- **高优先级**（250-750+）：组件抗拒拉伸，保持其自然尺寸
- **低优先级**（1-249）：组件拉伸以填充可用空间

## 覆盖层定位

如需绝对定位，可向任意容器添加覆盖层子组件：

```typescript
import { VStack, Text, widgetAddOverlay, widgetSetOverlayFrame } from "perry/ui";

const container = VStack(16, [Text("主内容")]);

const badge = Text("3");
badge.setCornerRadius(10);
badge.setBackgroundColor("#FF3B30");

widgetAddOverlay(container, badge);
widgetSetOverlayFrame(badge, 280, 10, 20, 20); // x, y, 宽度, 高度
```

覆盖层子组件相对于其父容器进行绝对定位 —— 类似于 CSS 中的 `position: absolute`。

## 拆分视图

创建可调整大小的拆分窗格，适用于侧边栏布局：

```typescript
import { SplitView, splitViewAddChild, VStack, Text } from "perry/ui";

const split = SplitView();

const sidebar = VStack(8, [Text("导航"), Text("项目1"), Text("项目2")]);
const content = VStack(16, [Text("主内容")]);

splitViewAddChild(split, sidebar);
splitViewAddChild(split, content);
```

用户可拖动分隔线调整窗格大小。在 macOS 系统上，该组件对应 `NSSplitView`。

## 带内置内边距的栈

通过单次调用创建带内边距的栈：

```typescript
import { VStackWithInsets, HStackWithInsets, Text, widgetAddChild } from "perry/ui";

// VStackWithInsets(间距, 上内边距, 右内边距, 下内边距, 左内边距)
const card = VStackWithInsets(12, 16, 16, 16, 16);
widgetAddChild(card, Text("带内边距的内容"));
widgetAddChild(card, Text("更多内容"));
```

此方式等效于先创建栈，再调用 `setEdgeInsets` 方法，但写法更简洁。子组件需通过 `widgetAddChild` 添加，而非构造函数的数组参数。

## 隐藏视图的分离

默认情况下，隐藏的子组件仍会在栈中占据空间。如需折叠隐藏组件：

```typescript
import { VStack, Text, widgetSetHidden, stackSetDetachesHidden } from "perry/ui";

const stack = VStack(8, [Text("始终可见"), Text("有时隐藏")]);
stackSetDetachesHidden(stack, 1); // 隐藏的子组件不留下空隙
```

## 常见布局模式

### 居中内容

```typescript
const page = VStack(16, [Text("标题"), Text("副标题")]);
stackSetAlignment(page, 9); // 水平居中（CenterX）
```

### 侧边栏 + 内容区

```typescript
const split = SplitView();
splitViewAddChild(split, sidebar);
splitViewAddChild(split, content);
```

### 等宽按钮行

```typescript
const row = HStack(8, [Button("取消", onCancel), Button("确定", onOK)]);
stackSetDistribution(row, 1); // 等宽填充（FillEqually）
```

### 栈内的全屏宽度子组件

```typescript
const input = TextField("搜索...", onChange);
widgetMatchParentWidth(input);
VStack(12, [input, results]);
```

### 悬浮徽章 / 覆盖层

```typescript
const icon = Image("bell.png");
const badge = Text("3");
widgetAddOverlay(icon, badge);
widgetSetOverlayFrame(badge, 20, -5, 16, 16);
```

### 带间隔器的工具栏

```typescript
HStack(8, [
  Button("返回", goBack),
  Spacer(),
  Text("页面标题"),
  Spacer(),
  Button("设置", openSettings),
]);
```

## 后续参考

- [Styling](styling) — 颜色、内边距、尺寸
- [Widgets](widgets) — 所有可用组件
- [State](state) — 结合状态实现动态UI
