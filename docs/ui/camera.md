# 相机

`perry/ui` 模块提供了具备颜色采样能力的实时相机预览组件。

```typescript

import { CameraView, cameraStart, cameraStop, cameraFreeze, cameraUnfreeze, cameraSampleColor, cameraSetOnTap } from "perry/ui";
```

> **平台支持**：仅支持 iOS。其他平台的支持正在规划中。

## 快速示例

```typescript
import { App, VStack, Text, State } from "perry/ui";
import { CameraView, cameraStart, cameraStop, cameraSampleColor, cameraSetOnTap } from "perry/ui";

const colorHex = State("#000000");

const cam = CameraView();
cameraStart(cam);

cameraSetOnTap(cam, (x, y) => {
  const rgb = cameraSampleColor(x, y);
  if (rgb >= 0) {
    const r = Math.floor(rgb / 65536);
    const g = Math.floor((rgb % 65536) / 256);
    const b = Math.floor(rgb % 256);
    colorHex.set(`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
  }
});

App({
  title: "Color Picker",
  width: 400,
  height: 600,
  body: VStack(16, [
    cam,
    Text(`Color: ${colorHex.value}`),
  ]),
});
```

## API 参考

### `CameraView()`

创建实时相机预览组件。

```typescript
const cam = CameraView();
```

返回组件句柄。相机不会自动启动——需调用 `cameraStart()` 开始采集。

### `cameraStart(handle)`

启动相机实时画面流。

```typescript
cameraStart(cam);
```

在 iOS 系统中，首次使用时会自动弹出相机权限请求对话框。

### `cameraStop(handle)`

停止相机画面流并释放采集会话。

```typescript
cameraStop(cam);
```

### `cameraFreeze(handle)`

暂停实时预览（冻结当前帧）。

```typescript
cameraFreeze(cam);
```

相机会话保持活跃状态，但预览画面停止更新。适用于需要查看冻结帧的“抓拍”场景。

### `cameraUnfreeze(handle)`

冻结后恢复实时预览。

```typescript
cameraUnfreeze(cam);
```

### `cameraSampleColor(x, y)`

在归一化坐标处采样像素颜色。

```typescript
const rgb = cameraSampleColor(0.5, 0.5); // 画面中心
```

- `x`、`y` 为归一化坐标（取值范围 0.0–1.0）
- 返回值为打包后的 RGB 数值：`r * 65536 + g * 256 + b`
- 若无可用帧，返回 `-1`

提取各颜色通道的方法：

```typescript
const r = Math.floor(rgb / 65536);
const g = Math.floor((rgb % 65536) / 256);
const b = Math.floor(rgb % 256);
```

为降低噪声，采样颜色为采样点周围 5×5 像素区域的平均值。

### `cameraSetOnTap(handle, callback)`

为相机视图注册点击事件处理器。

```typescript
cameraSetOnTap(cam, (x, y) => {
  // x、y 为归一化坐标（取值范围 0.0-1.0）
  const rgb = cameraSampleColor(x, y);
});
```

回调函数接收点击位置的归一化坐标，可直接传入 `cameraSampleColor()` 使用。

## 实现方式

在 iOS 系统中，相机功能基于 AVCaptureSession 实现，通过 AVCaptureVideoPreviewLayer 实现 GPU 加速的实时预览，借助 AVCaptureVideoDataOutput 实现帧采集。颜色采样功能从 CVPixelBuffer 中读取像素数据。

## 后续参考

- [Widgets](widgets) — 所有可用组件
- [Audio Capture](../system/audio) — 麦克风输入与声音计量