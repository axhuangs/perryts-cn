# 动画

Perry 支持动画小部件属性以实现平滑过渡。

## 不透明度动画

```typescript
import { Text } from "perry/ui";

const label = Text("Fading text");

// 从小部件的当前不透明度动画到 `target`，持续 `durationSecs`。
label.animateOpacity(1.0, 0.3); // target, durationSeconds
```

## 位置动画

```typescript
import { Button } from "perry/ui";

const btn = Button("Moving", () => {});

// 通过相对于小部件当前位置的增量 (dx, dy) 进行动画。
btn.animatePosition(100, 200, 0.5); // dx, dy, durationSeconds
```

## 示例：淡入效果

当第一个参数从 `State.value` 读取时，Perry 会自动订阅状态调用 — 切换 `visible` 会重新运行动画。

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

| Platform | Implementation |
|----------|---------------|
| macOS | NSAnimationContext / ViewPropertyAnimator |
| iOS | UIView.animate |
| Android | ViewPropertyAnimator |
| Windows | WM_TIMER-based animation |
| Linux | CSS transitions (GTK4) |
| Web | CSS transitions |

## 下一步

- [Styling](styling.md) — 小部件样式属性
- [Widgets](widgets.md) — 所有可用的小部件
- [Events](events.md) — 用户交互