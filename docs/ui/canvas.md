# 画布（Canvas）

`Canvas` 组件提供了用于自定义图形绘制的二维绘图平面。

## 创建画布

```typescript
import { Canvas } from "perry/ui";

const canvas = Canvas(400, 300, (ctx) => {
  // 绘图代码编写位置
  ctx.fillRect(10, 10, 100, 80);
});
```

`Canvas(width, height, drawCallback)` 方法用于创建画布并调用自定义的绘图函数。

## 绘制图形

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

### 圆形与圆弧

```typescript
Canvas(400, 300, (ctx) => {
  ctx.setFillColor("#00FF00");
  ctx.beginPath();
  ctx.arc(200, 150, 50, 0, Math.PI * 2); // x, y, 半径, 起始角度, 终止角度
  ctx.fill();
});
```

## 颜色

```typescript
Canvas(400, 300, (ctx) => {
  ctx.setFillColor("#FF6600");    // 十六进制颜色值
  ctx.setStrokeColor("#333333");
  ctx.setLineWidth(3);
});
```

## 渐变

```typescript
Canvas(400, 300, (ctx) => {
  ctx.setGradient("#FF0000", "#0000FF"); // 起始颜色，终止颜色
  ctx.fillRect(0, 0, 400, 300);
});
```

## 在画布上绘制文本

```typescript
Canvas(400, 300, (ctx) => {
  ctx.setFillColor("#000000");
  ctx.fillText("Hello Canvas!", 50, 50);
});
```

## 平台说明

| 平台       | 实现方式                  |
|------------|---------------------------|
| macOS      | Core Graphics (CGContext) |
| iOS        | Core Graphics (CGContext) |
| Linux      | Cairo                     |
| Windows    | GDI                       |
| Android    | Canvas/Bitmap             |
| Web        | HTML5 Canvas              |

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

## 后续参考

- [Widgets](widgets) — 所有可用的组件
- [Animation](animation) — 组件属性动画
- [Styling](styling) — 组件样式设置