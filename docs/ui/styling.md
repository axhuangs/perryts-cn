# 样式设置
Perry 组件支持原生样式属性，这些属性可映射到各平台的样式系统。

## 从 CSS 迁移
Perry 的布局模型更接近 SwiftUI 或 Flutter，而非 CSS。若你有网页开发背景，以下是相关概念的对应关系：

| CSS 写法 | Perry 写法 |
|-----|-------|
| `display: flex; flex-direction: column` | `VStack(spacing, [...])` |
| `display: flex; flex-direction: row` | `HStack(spacing, [...])` |
| `justify-content` | `stackSetDistribution(stack, mode)` + `Spacer()` |
| `align-items` | `stackSetAlignment(stack, value)` |
| `position: absolute` | `widgetAddOverlay` + `widgetSetOverlayFrame` |
| `width: 100%` | `widgetMatchParentWidth(widget)` |
| `padding: 10px 20px` | `setEdgeInsets(10, 20, 10, 20)` |
| `gap: 16px` | `VStack(16, [...])` — 第一个参数为间距值 |
| CSS 变量 / 设计令牌 | `perry-styling` 包（参考[主题设置](theming)） |
| `opacity` | `setOpacity(value)` |
| `border-radius` | `setCornerRadius(value)` |

有关对齐方式、分布规则、浮层和拆分视图的完整说明，请参阅[布局](layout)。

## 颜色
```typescript
import { Text, Button } from "perry/ui";

const label = Text("带颜色的文本");
label.setColor("#FF0000");              // 文本颜色（十六进制格式）
label.setBackgroundColor("#F0F0F0");    // 背景颜色
```
颜色需以十六进制字符串（`#RRGGBB`）格式指定。

## 字体
```typescript
const label = Text("样式化文本");
label.setFontSize(24);                // 字体大小（单位：点）
label.setFontFamily("Menlo");         // 字体家族名称
```
如需使用系统等宽字体，可指定为 `"monospaced"`。

## 圆角
```typescript
const btn = Button("圆角按钮", () => {});
btn.setCornerRadius(12);
```

## 边框
```typescript
const widget = VStack(0, []);
widget.setBorderColor("#CCCCCC");
widget.setBorderWidth(1);
```

## 内边距与嵌入边距
```typescript
const stack = VStack(8, [Text("带内边距的内容")]);
stack.setPadding(16);
stack.setEdgeInsets(10, 20, 10, 20); // 上、右、下、左（顺时针顺序）
```

## 尺寸
```typescript
const widget = VStack(0, []);
widget.setWidth(300);
widget.setHeight(200);
widget.setFrame(0, 0, 300, 200);  // x 坐标、y 坐标、宽度、高度
```

## 不透明度
```typescript
const widget = Text("半透明文本");
widget.setOpacity(0.5); // 取值范围 0.0（完全透明）至 1.0（完全不透明）
```

## 背景渐变
```typescript
const widget = VStack(0, []);
widget.setBackgroundGradient("#FF0000", "#0000FF"); // 起始颜色、结束颜色
```

## 控件尺寸
```typescript
const btn = Button("小型按钮", () => {});
btn.setControlSize(0); // 0=迷你型，1=小型，2=常规型，3=大型
```
> **macOS 说明**：对应 `NSControl.ControlSize` 枚举值。其他平台的解析逻辑可能存在差异。

## 工具提示
```typescript
const btn = Button("悬停查看提示", () => {});
btn.setTooltip("点击执行对应操作");
```
> **macOS/Windows/Linux**：支持原生工具提示；**iOS/Android**：无工具提示支持；**Web**：映射为 HTML `title` 属性。

## 启用/禁用状态
```typescript
const btn = Button("提交", () => {});
btn.setEnabled(false);  // 置灰并禁用交互
```

## 完整样式设置示例
```typescript
import { App, Text, Button, VStack, HStack, State, Spacer } from "perry/ui";

const count = State(0);

const title = Text("计数器");
title.setFontSize(28);
title.setColor("#1A1A1A");

const display = Text(`${count.value}`);
display.setFontSize(48);
display.setFontFamily("monospaced");
display.setColor("#007AFF");

const decBtn = Button("-", () => count.set(count.value - 1));
decBtn.setCornerRadius(20);
decBtn.setBackgroundColor("#FF3B30");

const incBtn = Button("+", () => count.set(count.value + 1));
incBtn.setCornerRadius(20);
incBtn.setBackgroundColor("#34C759");

const controls = HStack(8, [decBtn, Spacer(), incBtn]);
controls.setPadding(20);

const container = VStack(16, [title, display, controls]);
container.setPadding(40);
container.setCornerRadius(16);
container.setBackgroundColor("#FFFFFF");
container.setBorderColor("#E5E5E5");
container.setBorderWidth(1);

App({
  title: "样式化应用",
  width: 400,
  height: 300,
  body: container,
});
```

## 样式组合
可通过创建辅助函数减少代码重复：
```typescript
import { VStackWithInsets, Text, widgetAddChild } from "perry/ui";

function card(children: any[]) {
  const c = VStackWithInsets(12, 16, 16, 16, 16);
  c.setCornerRadius(12);
  c.setBackgroundColor("#FFFFFF");
  c.setBorderColor("#E5E5E5");
  c.setBorderWidth(1);
  for (const child of children) widgetAddChild(c, child);
  return c;
}

// 使用示例
card([Text("标题"), Text("正文文本")]);
```
对于大型应用，可使用 `perry-styling` 包在 JSON 文件中定义设计令牌，并生成类型化的主题文件。完整流程请参考[主题设置](theming)。

## 后续参考
- [Widgets](widgets) — 所有可用组件
- [Layout](layout) — 布局容器说明
- [Animation](animation) — 样式变更动画实现
