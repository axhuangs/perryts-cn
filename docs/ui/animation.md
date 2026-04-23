# 动画

Perry 框架支持为组件属性添加动画效果，实现流畅的过渡效果。

## 透明度动画

```typescript
import { Text } from "perry/ui";

const label = Text("Fading text");

// 将组件当前的透明度在指定时长内动画过渡至目标值。
label.animateOpacity(1.0, 0.3); // target（目标值）, durationSeconds（持续时长，单位：秒）
```

## 位置动画

```typescript
import { Button } from "perry/ui";

const btn = Button("Moving", () => {});

// 相对于组件当前位置，沿x、y轴偏移指定距离并执行动画。
btn.animatePosition(100, 200, 0.5); // dx（x轴偏移量）, dy（y轴偏移量）, durationSeconds（持续时长，单位：秒）
```

## 示例：淡入效果

当第一个参数读取 `State.value` 的值时，Perry 会自动将该调用订阅至对应的状态 —— 切换 `visible` 的值会重新执行该动画。

```typescript
import { App, Text, Button, VStack, State } from "perry/ui";

const visible = State(false);

const label = Text("Hello!");
label.animateOpacity(visible.value ? 1.0 : 0.0, 0.3);

App({
  title: "Animation Demo",
  width: 400,
  height: 300,
  body: VStack(16, [
    Button("Toggle", () => {
      visible.set(!visible.value);
    }),
    label,
  ]),
});
```

## 平台说明

| 平台    | 实现方式                                   |
|---------|--------------------------------------------|
| macOS   | NSAnimationContext / ViewPropertyAnimator |
| iOS     | UIView.animate                             |
| Android | ViewPropertyAnimator                       |
| Windows | 基于 WM_TIMER 实现的动画                   |
| Linux   | CSS 过渡效果（GTK4）                       |
| Web     | CSS 过渡效果                               |

## 后续参考

- [Styling](styling) — 组件样式属性
- [Widgets](widgets) — 所有可用的组件
- [Events](events) — 用户交互