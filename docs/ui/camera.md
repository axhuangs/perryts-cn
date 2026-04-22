# 相机

`perry/ui` 模块提供带有颜色采样能力的实时相机预览小部件。

```typescript
import { CameraView, cameraStart, cameraStop, cameraFreeze, cameraUnfreeze, cameraSampleColor, cameraSetOnTap } from "perry/ui";
```

> **平台支持：** 仅 iOS。其他平台计划中。

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

创建实时相机预览小部件。

```typescript
const cam = CameraView();
```

返回一个小部件句柄。相机不会自动启动 — 调用 `cameraStart()` 开始捕获。

### `cameraStart(handle)`

启动实时相机馈送。

```typescript
cameraStart(cam);
```

在 iOS 上，相机权限对话框会在首次使用时自动显示。

### `cameraStop(handle)`

停止相机馈送并释放捕获会话。

```typescript
cameraStop(cam);
```

### `cameraFreeze(handle)`

暂停实时预览（冻结当前帧）。

```typescript
cameraFreeze(cam);
```

相机会话保持活动但预览停止更新。适用于您想要检查冻结帧的“捕获”时刻。

### `cameraUnfreeze(handle)`

在冻结后恢复实时预览。

```typescript
cameraUnfreeze(cam);
```

### `cameraSampleColor(x, y)`

在标准化坐标处采样像素颜色。

```typescript
const rgb = cameraSampleColor(0.5, 0.5); // center of frame
```

- `x`、`y` 是标准化坐标 (0.0–1.0)
- 返回打包的 RGB 作为数字：`r * 65536 + g * 256 + b`
- 如果没有帧可用，返回 `-1`

要提取单个通道：

```typescript
const r = Math.floor(rgb / 65536);
const g = Math.floor((rgb % 65536) / 256);
const b = Math.floor(rgb % 256);
```

颜色在采样点周围的 5x5 像素区域内平均，以减少噪声。

### `cameraSetOnTap(handle, callback)`

在相机视图上注册点击处理器。

```typescript
cameraSetOnTap(cam, (x, y) => {
  // x, y are normalized coordinates (0.0-1.0)
  const rgb = cameraSampleColor(x, y);
});
```

回调接收点击位置的标准化坐标，可以直接传递给 `cameraSampleColor()`。

## 实现

在 iOS 上，相机使用 AVCaptureSession 与 AVCaptureVideoPreviewLayer 进行 GPU 加速实时预览，使用 AVCaptureVideoDataOutput 进行帧捕获。颜色采样从 CVPixelBuffer 读取像素数据。

## 下一步

- [Widgets](widgets.md) — 所有可用的小部件
- [Audio Capture](../system/audio.md) — 麦克风输入和声音计量