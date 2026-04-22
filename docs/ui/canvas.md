# 画布

`Canvas` 小部件提供了一个用于自定义图形的 2D 绘图表面。

## 创建画布

```typescript
import { Canvas } from "perry/ui";

const canvas = Canvas(400, 300, (ctx) => {
  // 绘图代码在这里
  ctx.fillRect(10, 10, 100, 80);
});
```

`Canvas(width, height, drawCallback)` 创建一个画布并调用您的绘图函数。

## 绘制形状

### 矩形

```typescript
Canvas(400, 300, (ctx) => {
  // 填充矩形
  ctx.setFillColor("#FF0000");
  ctx.fillRect(10, 10, 100, 80);

  // 描边矩形
  ctx.setStrokeColor("#0000FF");
  ctx.setLineWidth(2);
  ctx.strokeRect(150, 10, 100, 80);
});
```

### 线条

```typescript
Canvas(400, 300, (ctx) => {
  ctx.setStrokeColor("#000000");
  ctx.setLineWidth(1);
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.lineTo(200, 150);
  ctx.stroke();
});
```

### 圆形和弧

```typescript
Canvas(400, 300, (ctx) => {
  ctx.setFillColor("#00FF00");
  ctx.beginPath();
  ctx.arc(200, 150, 50, 0, Math.PI * 2); // x, y, radius, startAngle, endAngle
  ctx.fill();
});
```

## 颜色

```typescript
Canvas(400, 300, (ctx) => {
  ctx.setFillColor("#FF6600");    // 十六进制颜色
  ctx.setStrokeColor("#333333");
  ctx.setLineWidth(3);
});
```

## 渐变

```typescript
Canvas(400, 300, (ctx) => {
  ctx.setGradient("#FF0000", "#0000FF"); // 开始颜色, 结束颜色
  ctx.fillRect(0, 0, 400, 300);
});
```

## 画布上的文本

```typescript
Canvas(400, 300, (ctx) => {
  ctx.setFillColor("#000000");
  ctx.fillText("Hello Canvas!", 50, 50);
});
```

## 平台说明

| Platform | Implementation |
|----------|---------------|
| macOS | Core Graphics (CGContext) |
| iOS | Core Graphics (CGContext) |
| Linux | Cairo |
| Windows | GDI |
| Android | Canvas/Bitmap |
| Web | HTML5 Canvas |

## 完整示例

```typescript
import { App, Canvas, VStack } from "perry/ui";

App({
  title: "Canvas Demo",
  width: 400,
  height: 320,
  body: VStack(0, [
    Canvas(400, 300, (ctx) => {
      // 背景
      ctx.setFillColor("#1A1A2E");
      ctx.fillRect(0, 0, 400, 300);

      // 太阳
      ctx.setFillColor("#FFD700");
      ctx.beginPath();
      ctx.arc(300, 80, 40, 0, Math.PI * 2);
      ctx.fill();

      // 地面
      ctx.setFillColor("#2D5016");
      ctx.fillRect(0, 220, 400, 80);

      // 树干
      ctx.setFillColor("#8B4513");
      ctx.fillRect(80, 150, 20, 70);

      // 树冠
      ctx.setFillColor("#228B22");
      ctx.beginPath();
      ctx.arc(90, 130, 40, 0, Math.PI * 2);
      ctx.fill();
    }),
  ]),
});
```

## 下一步

- [Widgets](widgets.md) — 所有可用的小部件
- [Animation](animation.md) — 动画小部件属性
- [Styling](styling.md) — 小部件样式