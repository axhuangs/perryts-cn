# 组件（Widgets）
Perry 提供可映射至各平台**原生控件**的原生组件。

> 这里使用组件，是因为 Perry 是跨平台开发技术，对应各个平台的控件。

## 文本（Text）
显示只读文本。

```typescript
import { Text } from "perry/ui";

const label = Text("Hello, World!");
label.setFontSize(18);
label.setColor("#333333");
label.setFontFamily("Menlo");
```

**方法：**
- `setText(text: string)` — 更新文本内容
- `setFontSize(size: number)` — 设置字体大小（单位：点）
- `setColor(hex: string)` — 设置文本颜色（十六进制字符串）
- `setFontFamily(family: string)` — 设置字体族（例如，等宽字体可设为 `"Menlo"`）
- `setAccessibilityLabel(label: string)` — 设置辅助功能标签

包含 `state.value` 的模板字符串内的文本组件会自动更新：

```typescript
const count = State(0);
Text(`Count: ${count.value}`); // 当 count 变化时自动更新
```

## 按钮（Button）
可点击的按钮组件。

```typescript
import { Button } from "perry/ui";

const btn = Button("Click Me", () => {
  console.log("Clicked!");
});
btn.setCornerRadius(8);
btn.setBackgroundColor("#007AFF");
```

**方法：**
- `setOnClick(callback: () => void)` — 设置点击事件处理器
- `setImage(sfSymbolName: string)` — 设置 SF Symbol 图标（适用于 macOS/iOS 平台）
- `setContentTintColor(hex: string)` — 设置着色颜色
- `setImagePosition(position: number)` — 设置图标相对于文本的位置
- `setEnabled(enabled: boolean)` — 启用/禁用按钮
- `setAccessibilityLabel(label: string)` — 设置辅助功能标签

## 文本输入框（TextField）
可编辑的文本输入组件。

```typescript
import { TextField, State, stateBindTextfield } from "perry/ui";

const text = State("");
const field = TextField("Placeholder...", (value: string) => text.set(value));
stateBindTextfield(text, field); // 可选：让 text.set(...) 驱动输入框内容更新
```

`TextField(placeholder, onChange)` 用于创建输入框。用户输入时，`onChange` 回调函数会触发。
若需实现双向绑定（即通过代码调用 `state.set(...)` 也能更新输入框显示的文本），可搭配 `stateBindTextfield(state, field)` 使用。

## 安全输入框（SecureField）
密码输入框（输入内容会被掩码隐藏）。

```typescript
import { SecureField, State } from "perry/ui";

const password = State("");
SecureField("Enter password...", (value: string) => password.set(value));
```

签名与 `TextField` 一致，但输入内容会被隐藏。

## 开关（Toggle）
布尔类型的开/关切换控件。

```typescript
import { Toggle, State } from "perry/ui";

const enabled = State(false);
Toggle("Enable notifications", (on: boolean) => enabled.set(on));
```

## 滑块（Slider）
数值滑动选择器。

```typescript
import { Slider, State } from "perry/ui";

const value = State(50);
Slider(0, 100, (v: number) => value.set(v)); // 最小值、最大值、值变更回调
```

## 选择器（Picker）
下拉选择控件。可通过 `pickerAddItem` 方法添加选项。

```typescript
import { Picker, State, pickerAddItem } from "perry/ui";

const selected = State(0);
const picker = Picker((index: number) => selected.set(index));
pickerAddItem(picker, "Option A");
pickerAddItem(picker, "Option B");
pickerAddItem(picker, "Option C");
```

## 图片（Image）
显示图片的组件。

```typescript
import { Image } from "perry/ui";

const img = Image("path/to/image.png");
img.setWidth(200);
img.setHeight(150);
```

在 macOS/iOS 平台，也可使用 SF Symbol 名称：

```typescript
Image("star.fill"); // SF Symbol 图标
```

## 进度视图（ProgressView）
不确定或确定进度的指示器。

```typescript
import { ProgressView } from "perry/ui";

const progress = ProgressView();
// 或指定进度值（范围 0.0 至 1.0）
const progress = ProgressView(0.5);
```

## 表单与分区（Form and Section）
将控件分组为表单布局。

```typescript
import { Form, Section, TextField, Toggle, State } from "perry/ui";

const name = State("");
const notifications = State(true);

Form([
  Section("Personal Info", [
    TextField("Name", (value: string) => name.set(value)),
  ]),
  Section("Settings", [
    Toggle("Notifications", (on: boolean) => notifications.set(on)),
  ]),
]);
```

## 表格（Table）
包含行和列的数据表格。

```typescript
import { Table } from "perry/ui";

const table = Table(10, 3, (row, col) => {
  return `Cell ${row},${col}`;
});

table.setColumnHeader(0, "Name");
table.setColumnHeader(1, "Email");
table.setColumnHeader(2, "Role");
table.setColumnWidth(0, 200);
table.setColumnWidth(1, 250);

table.setOnRowSelect((row) => {
  console.log(`Selected row: ${row}`);
});
```

**方法：**
- `setColumnHeader(col: number, title: string)` — 设置列标题文本
- `setColumnWidth(col: number, width: number)` — 设置列宽
- `updateRowCount(count: number)` — 更新行数
- `setOnRowSelect(callback: (row: number) => void)` — 设置行选择事件处理器
- `getSelectedRow()` — 获取当前选中行的索引

## 文本域（TextArea）
多行文本输入组件。

```typescript
import { TextArea, State } from "perry/ui";

const content = State("");
TextArea(content, "Enter text...");
```

**方法：**
- `setText(text: string)` — 以编程方式设置文本内容
- `getText()` — 获取当前文本内容

## 二维码（QRCode）
生成并显示二维码。

```typescript
import { QRCode } from "perry/ui";

const qr = QRCode("https://example.com", 200); // 二维码数据、尺寸
qr.setData("https://other-url.com");            // 更新二维码数据
```

## 画布（Canvas）
绘图画布。完整的绘图 API 请参考 [Canvas](canvas)。

```typescript
import { Canvas } from "perry/ui";

const canvas = Canvas(400, 300, (ctx) => {
  ctx.fillRect(10, 10, 100, 100);
  ctx.strokeRect(50, 50, 100, 100);
});
```

## 相机视图（CameraView）
带颜色采样功能的实时相机预览组件。完整的 API 请参考 [Camera](camera)。

```typescript
import { CameraView, cameraStart, cameraSampleColor, cameraSetOnTap } from "perry/ui";

const cam = CameraView();
cameraStart(cam);

cameraSetOnTap(cam, (x, y) => {
  const rgb = cameraSampleColor(x, y); // 打包后的 RGB 值（r*65536 + g*256 + b）
});
```

> **仅支持 iOS 平台**。其他平台的支持正在规划中。

**函数：**
- `CameraView()` — 创建相机预览组件
- `cameraStart(handle)` — 启动实时采集
- `cameraStop(handle)` — 停止采集
- `cameraFreeze(handle)` — 暂停预览（冻结帧）
- `cameraUnfreeze(handle)` — 恢复预览
- `cameraSampleColor(x, y)` — 在归一化坐标处采样颜色（返回打包后的 RGB 值或 -1）
- `cameraSetOnTap(handle, callback)` — 注册点击事件处理器，回调参数为 `(x, y)` 坐标

## 通用组件方法（Common Widget Methods）
所有组件均支持以下方法：

| 方法 | 说明 |
|--------|-------------|
| `setWidth(width)` | 设置宽度 |
| `setHeight(height)` | 设置高度 |
| `setBackgroundColor(hex)` | 设置背景颜色 |
| `setCornerRadius(radius)` | 设置圆角半径 |
| `setOpacity(alpha)` | 设置不透明度（0.0–1.0） |
| `setEnabled(enabled)` | 启用/禁用交互功能 |
| `setHidden(hidden)` | 显示/隐藏组件 |
| `setTooltip(text)` | 设置提示文本 |
| `setOnClick(callback)` | 设置点击事件处理器 |
| `setOnHover(callback)` | 设置悬停事件处理器 |
| `setOnDoubleClick(callback)` | 设置双击事件处理器 |

完整说明请参考 [Styling](styling) 和 [Events](events)。

## 后续参考
- [Layout](layout) — 使用堆叠容器和普通容器排列组件
- [Styling](styling) — 颜色、字体、边框相关配置
- [State Management](state) — 响应式绑定
