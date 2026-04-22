# 音频捕获

`perry/system` 模块提供来自设备麦克风的实时音频捕获，具有 A 加权 dB(A) 电平测量和波形采样 — 构建声级计、音频可视化器或语音电平指示器所需的一切。

```typescript
import { audioStart, audioStop, audioGetLevel, audioGetPeak, audioGetWaveformSamples } from "perry/system";
```

## 快速示例

```typescript
import { App, Text, VStack, State, Canvas } from "perry/ui";
import { audioStart, audioStop, audioGetLevel, audioGetPeak, audioGetWaveformSamples } from "perry/system";

audioStart();

const db = State(0);

// 每 100ms 轮询电平
setInterval(() => {
  db.set(audioGetLevel());
}, 100);

App({
  title: "Sound Meter",
  width: 400,
  height: 300,
  body: VStack(16, [
    Text(`${db.value} dB`),
  ]),
});
```

## API 参考

### `audioStart()`

开始从设备麦克风捕获音频。

```typescript
const ok = audioStart(); // 1 = 成功, 0 = 失败
```

在需要权限的平台（iOS、Android、Web）上，系统权限对话框自动显示。成功返回 `1`，失败返回 `0`（例如，权限被拒绝、无麦克风）。

### `audioStop()`

停止音频捕获并释放麦克风。

```typescript
audioStop();
```

### `audioGetLevel()`

获取当前 A 加权声级，以 dB(A) 为单位。

```typescript
const db = audioGetLevel(); // 例如 45.2
```

返回平滑的 dB(A) 值（EMA，125ms 时间常数）。典型范围：
- ~30 dB — 安静房间
- ~50 dB — 正常对话
- ~70 dB — 繁忙街道
- ~90 dB — 响亮的音乐
- ~110+ dB — 危险地响亮

### `audioGetPeak()`

获取当前峰值样本振幅。

```typescript
const peak = audioGetPeak(); // 0.0 到 1.0
```

返回归一化振幅值（0.0 = 静音，1.0 = 削波）。用于简单的电平指示器，无需 dB 转换。

### `audioGetWaveformSamples(count)`

获取用于波形可视化的最近 dB 样本。

```typescript
const samples = audioGetWaveformSamples(64); // 最多 64 个 dB 值的数组
```

从 256 样本环形缓冲区返回最近的 dB(A) 读数。传递您想要的样本数（最大 256）。用于绘制波形显示或电平历史图表。

### `getDeviceModel()`

获取设备型号标识符。

```typescript
import { getDeviceModel } from "perry/system";

const model = getDeviceModel(); // 例如 "MacBookPro18,3", "iPhone15,2"
```

## 平台实现