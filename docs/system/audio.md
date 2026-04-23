# 音频采集

`perry/system` 模块提供从设备麦克风进行实时音频采集的能力，支持A计权分贝（dB(A)）电平计量和波形采样功能——可满足构建声级计、音频可视化工具或语音电平指示器的全部需求。

```typescript
import { audioStart, audioStop, audioGetLevel, audioGetPeak, audioGetWaveformSamples } from "perry/system";
```

## 快速示例

```typescript
import { App, Text, VStack, State, Canvas } from "perry/ui";
import { audioStart, audioStop, audioGetLevel, audioGetPeak, audioGetWaveformSamples } from "perry/system";

audioStart();

const db = State(0);

// 每100毫秒轮询一次电平值
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

启动设备麦克风的音频采集。

```typescript
const ok = audioStart(); // 1 = 成功, 0 = 失败
```

在需要权限的平台（iOS、Android、Web）上，系统会自动弹出权限申请对话框。调用成功时返回`1`，失败时返回`0`（例如：权限被拒绝、无可用麦克风）。

### `audioStop()`

停止音频采集并释放麦克风资源。

```typescript
audioStop();
```

### `audioGetLevel()`

获取当前A计权声级（单位：dB(A)）。

```typescript
const db = audioGetLevel(); // 示例值：45.2
```

返回经过平滑处理的dB(A)值（采用125毫秒时间常数的指数移动平均算法）。典型数值范围：
- ~30 dB — 安静的室内环境
- ~50 dB — 正常交谈音量
- ~70 dB — 繁忙的街道环境
- ~90 dB — 大声的音乐
- ~110+ dB — 具有危险性的高音量

### `audioGetPeak()`

获取当前峰值采样振幅。

```typescript
const peak = audioGetPeak(); // 取值范围 0.0 至 1.0
```

返回归一化的振幅值（0.0 = 无声音，1.0 = 削波）。适用于无需分贝转换的简易电平指示场景。

### `audioGetWaveformSamples(count)`

获取用于波形可视化的近期分贝采样值。

```typescript
const samples = audioGetWaveformSamples(64); // 最多包含64个分贝值的数组
```

返回来自256采样点环形缓冲区的近期dB(A)读数数组。传入需要获取的采样点数量（最大值为256）。适用于绘制波形显示界面或电平历史图表。

### `getDeviceModel()`

获取设备型号标识符。

```typescript
import { getDeviceModel } from "perry/system";

const model = getDeviceModel(); // 示例值："MacBookPro18,3", "iPhone15,2"
```

## 平台实现

| 平台      | 音频后端                          | 权限说明                     |
|-----------|-----------------------------------|------------------------------|
| macOS     | AVAudioEngine                     | 麦克风权限申请对话框         |
| iOS       | AVAudioSession + AVAudioEngine    | 系统权限申请对话框           |
| Android   | AudioRecord（JNI）                | RECORD_AUDIO 权限            |
| Linux     | PulseAudio（libpulse-simple）     | 无（系统级权限管控）         |
| Windows   | WASAPI（共享模式）                | 无                           |
| Web       | getUserMedia + AnalyserNode       | 浏览器权限申请对话框         |

所有平台均以48kHz单声道采集音频，并应用相同的A计权滤波器（符合IEC 61672标准，包含3级级联双二阶滤波器环节）。

## 后续参考

- [Camera](../ui/camera) — 实时相机预览（iOS）
- [Overview](overview) — 所有系统API