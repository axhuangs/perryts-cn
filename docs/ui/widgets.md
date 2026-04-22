# 小部件

Perry 提供映射到每个平台原生控件的原生小部件。

## Text

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
- `setFontSize(size: number)` — 以点为单位设置字体大小
- `setColor(hex: string)` — 设置文本颜色 (十六进制字符串)
- `setFontFamily(family: string)` — 设置字体家族 (例如，`"Menlo"` 用于等宽)
- `setAccessibilityLabel(label: string)` — 设置辅助标签

模板字面量中的 Text 小部件与 `state.value` 自动更新：

```typescript
const count = State(0);
Text(`Count: ${count.value}`); // 当 count 改变时更新
```

## Button

可点击按钮。

```typescript
import { Button } from "perry/ui";

const btn = Button("Click Me", () => {
  console.log("Clicked!");
});
btn.setCornerRadius(8);
btn.setBackgroundColor("#007AFF");
```

**方法：**
- `setOnClick(callback: () => void)` — 设置点击处理器
- `setImage(sfSymbolName: string)` — 设置 SF Symbol 图标 (macOS/iOS)
- `setContentTintColor(hex: string)` — 设置色调颜色
- `setImagePosition(position: number)` — 设置图像相对于文本的位置
- `setEnabled(enabled: boolean)` — 启用/禁用按钮
- `setAccessibilityLabel(label: string)` — 设置辅助标签

## TextField

可编辑文本输入。

```typescript
import { TextField, State, stateBindTextfield } from "perry/ui";

const text = State("");
const field = TextField("Placeholder...", (value: string) => text.set(value));
stateBindTextfield(text, field); // 可选: 让 text.set(...) 驱动字段
```

`TextField(placeholder, onChange)` 创建字段。`onChange` 回调在用户输入时触发。对于双向绑定 (所以程序化的 `state.set(...)` 也更新可见文本)，将其与 `stateBindTextfield(state, field)` 配对。

## SecureField

密码输入字段 (文本被遮罩)。

```typescript
import { SecureField, State } from "perry/ui";

const password = State("");
SecureField("Enter password...", (value: string) => password.set(value));
```

与 `TextField` 相同签名但输入被隐藏。

## Toggle

布尔开/关开关。

```typescript
import { Toggle, State } from "perry/ui";

const enabled = State(false);
Toggle("Enable notifications", (on: boolean) => enabled.set(on));
```

## Slider

数值滑块。

```typescript
import { Slider, State } from "perry/ui";

const value = State(50);
Slider(0, 100, (v: number) => value.set(v)); // min, max, onChange
```

## Picker

下拉选择控件。项目使用 `pickerAddItem` 添加。

```typescript
import { Picker, State, pickerAddItem } from "perry/ui";

const selected = State(0);
const picker = Picker((index: number) => selected.set(index));
pickerAddItem(picker, "Option A");
pickerAddItem(picker, "Option B");
pickerAddItem(picker, "Option C");
```

## Image

显示图像。

```typescript
import { Image } from "perry/ui";

const img = Image("path/to/image.png");
img.setWidth(200);
img.setHeight(150);
```

在 macOS/iOS 上，您也可以使用 SF Symbol 名称：

```typescript
Image("star.fill"); // SF Symbol
```

## ProgressView

不确定或确定进度指示器。

```typescript
import { ProgressView } from "perry/ui";

const progress = ProgressView();
// 或带有值 (0.0 到 1.0)
const progress = ProgressView(0.5);
```

## Form and Section

将控件分组到表单布局中。

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

## Table

具有行和列的数据表。

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
- `setColumnWidth(col: number, width: number)` — 设置列宽度
- `updateRowCount(count: number)` — 更新行数
- `setOnRowSelect(callback: (row: number) => void)` — 行选择处理器
- `getSelectedRow()` — 获取当前选定行索引

## TextArea

多行文本输入。

```typescript
import { TextArea, State } from "perry/ui";

const content = State("");
TextArea(content, "Enter text...");
```

**方法：**
- `setText(text: string)` — 程序化设置文本
- `getText()` — 获取当前文本

## QRCode

生成并显示 QR 码。

```typescript
import { QRCode } from "perry/ui";

const qr = QRCode("https://example.com", 200); // data, size
qr.setData("https://other-url.com");            // Update data
```

## Canvas

绘图表面。请参见 [Canvas](canvas.md) 获取完整绘图 API。

```typescript
import { Canvas } from "perry/ui";

const canvas = Canvas(400, 300, (ctx) => {
  ctx.fillRect(10, 10, 100, 100);
  ctx.strokeRect(50, 50, 100, 100);
});
```

## CameraView

具有颜色采样的实时相机预览。请参见 [Camera](camera.md) 获取完整 API。

```typescript
import { CameraView, cameraStart, cameraSampleColor, cameraSetOnTap } from "perry/ui";

const cam = CameraView();
cameraStart(cam);

cameraSetOnTap(cam, (x, y) => {
  const rgb = cameraSampleColor(x, y); // packed r*65536 + g*256 + b
});
```

> **仅 iOS。** 其他平台计划中。

**函数：**
- `CameraView()` — 创建相机预览小部件
- `cameraStart(handle)` — 开始实时捕获
- `cameraStop(handle)` — 停止捕获
- `cameraFreeze(handle)` — 暂停预览 (冻结帧)
- `cameraUnfreeze(handle)` — 恢复预览
- `cameraSampleColor(x, y)` — 在标准化坐标处采样颜色 (返回打包 RGB 或 -1)
- `cameraSetOnTap(handle, callback)` — 使用 `(x, y)` 坐标注册点击处理器

## 通用小部件方法

所有小部件支持这些方法：

| 方法 | 描述 |
|--------|-------------|
| `setWidth(width)` | 设置宽度 |
| `setHeight(height)` | 设置高度 |
| `setBackgroundColor(hex)` | 设置背景颜色 |
| `setCornerRadius(radius)` | 设置角半径 |
| `setOpacity(alpha)` | 设置不透明度 (0.0–1.0) |
| `setEnabled(enabled)` | 启用/禁用交互 |
| `setHidden(hidden)` | 显示/隐藏小部件 |
| `setTooltip(text)` | 设置工具提示文本 |
| `setOnClick(callback)` | 设置点击处理器 |
| `setOnHover(callback)` | 设置悬停处理器 |
| `setOnDoubleClick(callback)` | 设置双击处理器 |

请参见 [Styling](styling.md) 和 [Events](events.md) 获取完整细节。

## 下一步

- [Layout](layout.md) — 使用栈和容器排列小部件
- [Styling](styling.md) — 颜色、字体、边框
- [State Management](state.md) — 反应式绑定