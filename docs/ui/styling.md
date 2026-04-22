# 样式

Perry 小部件支持原生样式属性，这些属性映射到每个平台的样式系统。

## 来自 CSS

Perry 的布局模型更接近 SwiftUI 或 Flutter 而不是 CSS。如果你来自 Web 开发，以下是概念的转换方式：

| CSS | Perry |
|-----|-------|
| `display: flex; flex-direction: column` | `VStack(spacing, [...])` |
| `display: flex; flex-direction: row` | `HStack(spacing, [...])` |
| `justify-content` | `stackSetDistribution(stack, mode)` + `Spacer()` |
| `align-items` | `stackSetAlignment(stack, value)` |
| `position: absolute` | `widgetAddOverlay` + `widgetSetOverlayFrame` |
| `width: 100%` | `widgetMatchParentWidth(widget)` |
| `padding: 10px 20px` | `setEdgeInsets(10, 20, 10, 20)` |
| `gap: 16px` | `VStack(16, [...])` — 第一个参数是间隙 |
| CSS 变量 / 设计令牌 | `perry-styling` 包 ([Theming](theming.md)) |
| `opacity` | `setOpacity(value)` |
| `border-radius` | `setCornerRadius(value)` |

有关对齐、分布、覆盖和分割视图的完整详细信息，请参见 [Layout](layout.md)。

## 颜色

```typescript
import { Text, Button } from "perry/ui";

const label = Text("Colored text");
label.setColor("#FF0000");              // 文本颜色 (hex)
label.setBackgroundColor("#F0F0F0");    // 背景颜色
```

颜色指定为十六进制字符串（`#RRGGBB`）。

## 字体

```typescript
const label = Text("Styled text");
label.setFontSize(24);                // 字体大小（点）
label.setFontFamily("Menlo");         // 字体族名称
```

使用 `"monospaced"` 表示系统等宽字体。

## 圆角半径

```typescript
const btn = Button("Rounded", () => {});
btn.setCornerRadius(12);
```

## 边框

```typescript
const widget = VStack(0, []);
widget.setBorderColor("#CCCCCC");
widget.setBorderWidth(1);
```

## 填充和内边距

```typescript
const stack = VStack(8, [Text("Padded content")]);
stack.setPadding(16);
stack.setEdgeInsets(10, 20, 10, 20); // 上、右、下、左
```

## 尺寸

```typescript
const widget = VStack(0, []);
widget.setWidth(300);
widget.setHeight(200);
widget.setFrame(0, 0, 300, 200);  // x, y, 宽度, 高度
```

## 不透明度

```typescript
const widget = Text("Semi-transparent");
widget.setOpacity(0.5); // 0.0 到 1.0
```

## 背景渐变

```typescript
const widget = VStack(0, []);
widget.setBackgroundGradient("#FF0000", "#0000FF"); // 开始颜色, 结束颜色
```

## 控件大小

```typescript
const btn = Button("Small", () => {});
btn.setControlSize(0); // 0=mini, 1=small, 2=regular, 3=large
```

> **macOS**：映射到 `NSControl.ControlSize`。其他平台可能解释不同。

## 工具提示

```typescript
const btn = Button("Hover me", () => {});
btn.setTooltip("Click to perform action");
```

> **macOS/Windows/Linux**：原生工具提示。**iOS/Android**：不支持工具提示。**Web**：HTML `title` 属性。

## 启用/禁用

```typescript
const btn = Button("Submit", () => {});
btn.setEnabled(false);  // 变灰并禁用交互
```

## 完整样式示例

```typescript
import { App, Text, Button, VStack, HStack, State, Spacer } from "perry/ui";

const count = State(0);

const title = Text("Counter");
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
  title: "Styled App",
  width: 400,
  height: 300,
  body: container,
});
```

## 组合样式

通过创建辅助函数来减少重复：

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

// 使用
card([Text("Title"), Text("Body text")]);
```

对于较大的应用，使用 `perry-styling` 包在 JSON 中定义设计令牌并生成类型化的主题文件。有关完整工作流程，请参见 [Theming](theming.md)。

## 下一步

- [Widgets](widgets.md) — 所有可用的小部件
- [Layout](layout.md) — 布局容器
- [Animation](animation.md) — 动画样式更改