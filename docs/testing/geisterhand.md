# Geisterhand — 进程内 UI 测试

Geisterhand（德语“ghost hand”的意思）在您的 Perry 应用中嵌入一个轻量级 HTTP 服务器，让您以编程方式与每个控件交互。点击按钮、在文本字段中输入、拖动滑块、切换开关、捕获屏幕截图，并运行混沌模式随机模糊测试——所有这些都通过简单的 HTTP 调用。

它在**所有 5 个原生平台**上工作（macOS、iOS、Android、Linux/GTK4、Windows），零外部依赖。当您使用 `--enable-geisterhand` 编译时，服务器会自动启动。

---

## 快速开始

```bash
# 1. 使用 geisterhand 启用编译（库在首次使用时自动构建）
perry app.ts -o app --enable-geisterhand

# 2. 运行应用
./app
# [geisterhand] listening on http://127.0.0.1:7676

# 3. 在另一个终端中——与应用交互
curl http://127.0.0.1:7676/widgets            # 列出所有控件
curl -X POST http://127.0.0.1:7676/click/3     # 点击句柄为 3 的按钮
curl http://127.0.0.1:7676/screenshot -o s.png # 捕获窗口屏幕截图
```

### 自定义端口

默认端口是 **7676**。使用 `--geisterhand-port` 更改它（这意味着 `--enable-geisterhand`，所以您不需要两者）：

```bash
perry app.ts -o app --geisterhand-port 9090
# 或与 perry run 一起使用：
perry run --geisterhand-port 9090
```

### 与 `perry run` 一起使用

```bash
perry run --enable-geisterhand
perry run macos --geisterhand-port 8080
perry run ios --enable-geisterhand
```

---

## API 参考

所有端点返回 JSON，除非注明。所有响应包括 `Access-Control-Allow-Origin: *` 用于浏览器工具。OPTIONS 请求支持 CORS 预检。

### 健康检查

```
GET /health
→ {"status":"ok"}
```

使用此来等待应用准备好后再运行测试。

### 列出控件

```
GET /widgets
```

返回所有注册控件的 JSON 数组：

```json
[
  {"handle": 3, "widget_type": 0, "callback_kind": 0, "label": "Click Me", "shortcut": ""},
  {"handle": 4, "widget_type": 1, "callback_kind": 1, "label": "Type here...", "shortcut": ""},
  {"handle": 5, "widget_type": 2, "callback_kind": 1, "label": "", "shortcut": ""},
  {"handle": 6, "widget_type": 3, "callback_kind": 1, "label": "Enable", "shortcut": ""},
  {"handle": 7, "widget_type": 5, "callback_kind": 0, "label": "Save", "shortcut": "s"},
  {"handle": 8, "widget_type": 8, "callback_kind": 0, "label": "", "shortcut": ""}
]
```

支持查询参数过滤器：
- `GET /widgets?label=Save` — 按标签子字符串过滤（不区分大小写）
- `GET /widgets?type=button` — 按控件类型名称或代码过滤
- `GET /widgets?label=Save&type=5` — 组合过滤器

#### 控件类型

| 代码 | 类型 | 描述 |
|------|------|------|
| 0 | Button | 具有 onClick 的推送按钮 |
| 1 | TextField | 文本输入字段 |
| 2 | Slider | 数值滑块 |
| 3 | Toggle | 开/关开关 |
| 4 | Picker | 下拉选择器 |
| 5 | Menu | 菜单项 |
| 6 | Shortcut | 键盘快捷键 |
| 7 | Table | 数据表 |
| 8 | ScrollView | 可滚动容器 |

#### 回调种类

| 代码 | 种类 | 描述 |
|------|------|------|
| 0 | onClick | 点击/轻触时触发 |
| 1 | onChange | 值更改时触发 |
| 2 | onSubmit | 提交时触发（例如，按 Enter） |
| 3 | onHover | 鼠标悬停时触发 |
| 4 | onDoubleClick | 双击时触发 |
| 5 | onFocus | 聚焦时触发 |

单个控件在列表中可能出现多次，具有不同的回调种类。例如，具有 `onClick` 和 `onHover` 处理程序的按钮会产生两个条目（相同的句柄，不同的 `callback_kind`）。

### 点击控件

```
POST /click/:handle
→ {"ok":true}
```

触发控件的 `onClick` 回调。适用于按钮、菜单项、快捷键和表行。

```bash
curl -X POST http://127.0.0.1:7676/click/3
```

### 在 TextField 中输入

```
POST /type/:handle
Content-Type: application/json

{"text": "hello world"}
```

设置文本字段的内容并使用新的文本作为 NaN-boxed 字符串触发其 `onChange` 回调。

```bash
curl -X POST http://127.0.0.1:7676/type/4 \
  -H 'Content-Type: application/json' \
  -d '{"text":"hello world"}'
```

### 移动滑块

```
POST /slide/:handle
Content-Type: application/json

{"value": 0.75}
```

设置滑块位置并使用数值触发 `onChange`。

```bash
curl -X POST http://127.0.0.1:7676/slide/5 \
  -H 'Content-Type: application/json' \
  -d '{"value":0.75}'
```

### 切换开关

```
POST /toggle/:handle
→ {"ok":true}
```

使用布尔值触发切换的 `onChange` 回调。

```bash
curl -X POST http://127.0.0.1:7676/toggle/6
```

### 直接设置状态

```
POST /state/:handle
Content-Type: application/json

{"value": 42}
```

直接设置 `State` 单元的值，绕过控件回调。这会触发附加到状态的任何反应绑定（绑定的文本标签、可见性、ForEach 循环等）。

```bash
curl -X POST http://127.0.0.1:7676/state/2 \
  -H 'Content-Type: application/json' \
  -d '{"value":42}'
```

### 悬停

```
POST /hover/:handle
→ {"ok":true}
```

触发控件的 `onHover` 回调。用于测试悬停依赖的 UI（工具提示、颜色更改等）。

### 双击

```
POST /doubleclick/:handle
→ {"ok":true}
```

触发控件的 `onDoubleClick` 回调。

### 触发键盘快捷键

```
POST /key
Content-Type: application/json

{"shortcut": "s"}
```

查找其快捷键匹配的注册菜单项并触发其回调。快捷键字符串不区分大小写，与传递给 `menuAddItem` 的键字符串匹配（例如，`"s"` 表示 Cmd+S，`"S"` 表示 Cmd+Shift+S，`"n"` 表示 Cmd+N）。

```bash
curl -X POST http://127.0.0.1:7676/key \
  -H 'Content-Type: application/json' \
  -d '{"shortcut":"s"}'
```

如果找到匹配的快捷键，则返回 `{"ok":true}`，如果没有匹配，则返回 404。

### 滚动 ScrollView

```
POST /scroll/:handle
Content-Type: application/json

{"x": 0, "y": 100}
```

设置 ScrollView 控件的滚动偏移。`x` 和 `y` 以点为单位。

```bash
curl -X POST http://127.0.0.1:7676/scroll/8 \
  -H 'Content-Type: application/json' \
  -d '{"x":0,"y":200}'
```

### 捕获屏幕截图

```
GET /screenshot
→ (binary PNG image, Content-Type: image/png)
```

将应用窗口捕获为 PNG 图像。响应是原始二进制数据，不是 JSON。

```bash
curl http://127.0.0.1:7676/screenshot -o screenshot.png
```

从调用者的角度来看，屏幕截图捕获是同步的——HTTP 请求阻塞直到主线程完成捕获（超时：5 秒）。

**平台特定捕获方法：**

| 平台 | 方法 | 注意 |
|------|------|------|
| macOS | `CGWindowListCreateImage` | Retina 分辨率，从窗口 ID 读取 |
| iOS | `UIGraphicsImageRenderer` | 将视图层次结构绘制到图像上下文 |
| Android | JNI `View.draw()` on Canvas | 创建 Bitmap，压缩为 PNG |
| Linux (GTK4) | `WidgetPaintable` + `GskRenderer` | 渲染到纹理，保存为 PNG 字节 |
| Windows | `PrintWindow` + `GetDIBits` | 内联 PNG 编码器（存储 zlib 块） |

### 混沌模式

混沌模式以可配置间隔随机与控件交互——用于压力测试、查找边缘情况和崩溃狩猎。

#### 开始

```
POST /chaos/start
Content-Type: application/json

{"interval_ms": 200}
```

```bash
# 每 200ms 触发随机输入
curl -X POST http://127.0.0.1:7676/chaos/start \
  -H 'Content-Type: application/json' \
  -d '{"interval_ms":200}'
```

如果 `interval_ms` 被省略，则使用默认间隔。混沌线程随机选择一个注册控件，并基于控件类型触发适当的输入：

| 控件类型 | 随机输入 |
|----------|----------|
| Button | 触发 onClick（无参数） |
| TextField | 随机字母数字字符串，5-20 个字符 |
| Slider | 0.0 到 1.0 之间的随机浮点数 |
| Toggle | 随机 true/false |
| Picker | 随机索引 0-9 |
| Menu | 触发 onClick（无参数） |
| Shortcut | 触发 onClick（无参数） |
| Table | 触发 onClick（无参数） |

#### 状态

```
GET /chaos/status
→ {"running":true,"events_fired":247,"uptime_secs":12}
```

返回混沌模式是否激活、已触发的随机事件数量以及正常运行时间（秒）。

#### 停止

```
POST /chaos/stop
→ {"ok":true,"chaos":"stopped"}
```

### 错误响应

所有端点返回带有适当 HTTP 状态代码的 JSON 错误：

```json
{"error": "widget handle 99 not found"}
```

常见错误：
- `404` — 控件句柄未找到
- `400` — 格式错误的 JSON 正文或缺少必需字段
- `405` — 不支持的 HTTP 方法

---

## 平台设置

### macOS

无需额外设置。服务器绑定到 `0.0.0.0:7676`，可通过 `localhost` 访问。

```bash
perry app.ts -o app --enable-geisterhand
./app
curl http://127.0.0.1:7676/widgets
```

### iOS 模拟器

iOS 模拟器共享主机的网络堆栈——直接通过 `localhost` 访问服务器：

```bash
perry app.ts -o app --target ios-simulator --enable-geisterhand
xcrun simctl install booted app.app
xcrun simctl launch booted com.perry.app
curl http://127.0.0.1:7676/widgets
```

### iOS 设备

对于物理 iOS 设备，您需要到设备的网络路由（相同的 Wi-Fi 网络）或使用 `libimobiledevice` 的 `iproxy`：

```bash
perry app.ts -o app --target ios --enable-geisterhand
# 通过 Xcode/devicectl 安装和启动
# 然后通过设备的 IP 连接：
curl http://192.168.1.42:7676/widgets
```

### Android（模拟器或设备）

使用 `adb forward` 桥接端口。确保 `INTERNET` 权限在您的清单中（或添加到 `perry.toml`）：

```toml
[android]
permissions = ["INTERNET"]
```

```bash
perry app.ts -o app --target android --enable-geisterhand
# 打包到 APK 并安装
adb forward tcp:7676 tcp:7676
curl http://127.0.0.1:7676/widgets
```

### Linux (GTK4)

首先安装 GTK4 开发库：

```bash
# Ubuntu/Debian
sudo apt install libgtk-4-dev libcairo2-dev

perry app.ts -o app --target linux --enable-geisterhand
./app
curl http://127.0.0.1:7676/widgets
```

### Windows

```bash
perry app.ts -o app --target windows --enable-geisterhand
./app.exe
curl http://127.0.0.1:7676/widgets
```

---

## 测试自动化

Geisterhand 将您的 Perry 应用变成一个可测试的 HTTP 服务。这里是自动化测试的实用模式。

### Shell 脚本测试

使用 bash 的简单端到端测试：

```bash
#!/bin/bash
set -e

# 使用 geisterhand 编译
perry app.ts -o testapp --enable-geisterhand

# 在后台启动应用
./testapp &
APP_PID=$!
trap "kill $APP_PID 2>/dev/null" EXIT

# 等待应用准备好
for i in $(seq 1 30); do
  curl -sf http://127.0.0.1:7676/health && break
  sleep 0.1
done

# 获取控件
WIDGETS=$(curl -sf http://127.0.0.1:7676/widgets)
echo "Registered widgets: $WIDGETS"

# 查找标签为 "Submit" 的按钮
SUBMIT_HANDLE=$(echo "$WIDGETS" | jq -r '.[] | select(.label == "Submit") | .handle')

# 点击它
curl -sf -X POST "http://127.0.0.1:7676/click/$SUBMIT_HANDLE"

# 在交互后捕获屏幕截图
curl -sf http://127.0.0.1:7676/screenshot -o after-click.png

echo "Test passed"
```

### Python 测试示例

```python
import subprocess, time, requests, json

# 启动应用
proc = subprocess.Popen(["./testapp"])
time.sleep(1)  # 等待启动

try:
    # 列出控件
    widgets = requests.get("http://127.0.0.1:7676/widgets").json()

    # 按标签查找控件
    buttons = [w for w in widgets if w["widget_type"] == 0]
    fields = [w for w in widgets if w["widget_type"] == 1]

    # 在第一个文本字段中输入
    if fields:
        requests.post(
            f"http://127.0.0.1:7676/type/{fields[0]['handle']}",
            json={"text": "test@example.com"}
        )

    # 点击第一个按钮
    if buttons:
        requests.post(f"http://127.0.0.1:7676/click/{buttons[0]['handle']}")

    # 捕获屏幕截图用于视觉回归
    png = requests.get("http://127.0.0.1:7676/screenshot").content
    with open("test-result.png", "wb") as f:
        f.write(png)

    # 断言应用仍然健康
    assert requests.get("http://127.0.0.1:7676/health").json()["status"] == "ok"
    print("All tests passed")
finally:
    proc.terminate()
```

### 使用混沌模式进行压力测试

对您的应用运行混沌模式以查找崩溃、冻结或意外状态：

```bash
# 编译并启动
perry app.ts -o app --enable-geisterhand
./app &

# 等待启动
sleep 1

# 以 50ms 间隔开始激进的混沌
curl -X POST http://127.0.0.1:7676/chaos/start \
  -H 'Content-Type: application/json' \
  -d '{"interval_ms":50}'

# 让它运行 30 秒
sleep 30

# 检查统计
curl -sf http://127.0.0.1:7676/chaos/status
# {"running":true,"events_fired":600,"uptime_secs":30}

# 捕获屏幕截图以查看最终状态
curl http://127.0.0.1:7676/screenshot -o chaos-result.png

# 停止混沌
curl -X POST http://127.0.0.1:7676/chaos/stop

# 检查应用是否仍然存活
curl -sf http://127.0.0.1:7676/health
```

### 视觉回归测试

在关键交互点捕获屏幕截图并与基线比较：

```bash
# 初始状态
curl http://127.0.0.1:7676/screenshot -o baseline.png

# 交互
curl -X POST http://127.0.0.1:7676/click/3
curl -X POST http://127.0.0.1:7676/type/4 -d '{"text":"Hello"}'

# 交互后捕获
curl http://127.0.0.1:7676/screenshot -o current.png

# 比较（使用 ImageMagick）
compare baseline.png current.png diff.png
```

### CI 管道集成

```yaml
# GitHub Actions 示例
jobs:
  ui-test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: 使用 geisterhand 编译
        run: perry app.ts -o testapp --enable-geisterhand

      - name: 运行 UI 测试
        run: |
          ./testapp &
          sleep 2
          # 运行您的测试脚本
          ./tests/ui-test.sh
          kill %1

      - name: 上传屏幕截图
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: "*.png"
```

---

## 示例应用

一个完整的 Perry UI 应用，演示所有控件类型，geisterhand 可以与之交互：

```typescript
import {
  App, VStack, HStack, Text, Button, TextField,
  Slider, Toggle, Picker, State
} from "perry/ui";

const counterState = State(0);
const textState = State("");

const title = Text("Geisterhand Demo");
const counterLabel = Text("Count: 0");

// 将计数器状态绑定到标签
counterState.onChange((val: number) => {
  counterLabel.setText("Count: " + val);
});

const incrementBtn = Button("Increment", () => {
  counterState.set(counterState.value + 1);
});

const resetBtn = Button("Reset", () => {
  counterState.set(0);
});

const nameField = TextField("Enter your name", (text: string) => {
  textState.set(text);
  console.log("Name:", text);
});

const volumeSlider = Slider(0, 100, 50, (value: number) => {
  console.log("Volume:", value);
});

const darkModeToggle = Toggle("Dark Mode", false, (on: boolean) => {
  console.log("Dark mode:", on);
});

const buttonRow = HStack(8, [incrementBtn, resetBtn]);
const stack = VStack(12, [
  title, counterLabel, buttonRow,
  nameField, volumeSlider, darkModeToggle
]);

App({
  title: "Geisterhand Demo",
  width: 400,
  height: 400,
  body: stack
});
```

使用 `--enable-geisterhand` 编译并运行后：

```bash
# 查看所有交互控件
curl -s http://127.0.0.1:7676/widgets | jq .
# [
#   {"handle":3,"widget_type":0,"callback_kind":0,"label":"Increment"},
#   {"handle":4,"widget_type":0,"callback_kind":0,"label":"Reset"},
#   {"handle":5,"widget_type":1,"callback_kind":1,"label":"Enter your name"},
#   {"handle":6,"widget_type":2,"callback_kind":1,"label":""},
#   {"handle":7,"widget_type":3,"callback_kind":1,"label":"Dark Mode"}
# ]

# 3 次点击 Increment
for i in 1 2 3; do curl -sX POST http://127.0.0.1:7676/click/3; done
# 计数器标签现在显示 "Count: 3"

# 输入名称
curl -sX POST http://127.0.0.1:7676/type/5 -d '{"text":"Perry"}'

# 将滑块设置为 80%
curl -sX POST http://127.0.0.1:7676/slide/6 -d '{"value":0.8}'

# 打开暗模式
curl -sX POST http://127.0.0.1:7676/toggle/7

# 屏幕截图
curl -s http://127.0.0.1:7676/screenshot -o demo.png
```

---

## 架构

Geisterhand 通过三个协作组件运行，这些组件通过线程安全的队列连接：

```
                    ┌──────────────────────────┐
                    │      HTTP Server         │
                    │   (background thread)    │
                    │   tiny-http on :7676     │
                    │                          │
                    │  GET /widgets            │
                    │  POST /click/:h          │
                    │  POST /type/:h           │
                    │  ...                     │
                    └────────┬─────────────────┘
                             │
                    通过队列动作
                    Mutex<Vec<PendingAction>>
                             │
                             ▼
┌────────────────────────────────────────────────┐
│                 Main Thread                     │
│                                                 │
│  perry_geisterhand_pump() ← 每 8ms 调用一次   │
│  by platform timer (NSTimer / glib / WM_TIMER)  │
│                                                 │
│  耗尽 PendingAction 队列：                    │
│  • InvokeCallback → js_closure_call0/1          │
│  • SetState → perry_ui_state_set                │
│  • CaptureScreenshot → perry_ui_screenshot_*    │
└────────────────────────────────────────────────┘
                             │
                    控件回调在创建时注册
                    通过 perry_geisterhand_register()
                             │
                             ▼
┌────────────────────────────────────────────────┐
│            Global Widget Registry              │
│         Mutex<Vec<RegisteredWidget>>           │
│                                                │
│  { handle, widget_type, callback_kind,         │
│    closure_f64, label }                        │
└────────────────────────────────────────────────┘
```

### 生命周期

1. **启动**：当使用 `--enable-geisterhand` 时，编译的二进制文件在初始化期间调用 `perry_geisterhand_start(port)`。这会生成一个运行 `tiny-http` 服务器的后台线程。

2. **控件注册**：创建 UI 控件时（Button、TextField、Slider 等），每个控件调用 `perry_geisterhand_register(handle, widget_type, callback_kind, closure_f64, label)` 以在全局注册表中注册其回调。这在 `#[cfg(feature = "geisterhand")]` 后面，所以正常构建有零开销。

3. **HTTP 请求**：当请求到达时（例如，`POST /click/3`），服务器在注册表中查找句柄 3，找到关联的闭包，并将 `PendingAction::InvokeCallback` 推送到待处理动作队列。

4. **主线程分派**：平台的计时器（macOS 上的 NSTimer、GTK4 上的 glib 超时、Windows 上的 WM_TIMER 等）每 ~8ms 调用 `perry_geisterhand_pump()`。这会耗尽待处理动作队列，并在主线程上执行回调，这是 UI 安全所必需的。

5. **屏幕截图捕获**：屏幕截图使用 `Condvar` 同步——HTTP 线程排队一个 `CaptureScreenshot` 动作，然后阻塞等待条件变量。主线程的泵执行平台特定的捕获，存储 PNG 数据，并发出 condvar。超时：5 秒。

### 线程安全

- **控件注册表**：受 `Mutex` 保护。由 HTTP 服务器读取（列出控件和查找句柄），由主线程写入（在控件创建期间）。
- **待处理动作队列**：受 `Mutex` 保护。由 HTTP 服务器写入，主线程在 `pump()` 中耗尽。
- **屏幕截图结果**：受 `Mutex` + `Condvar` 保护。HTTP 线程等待，主线程发出信号。
- **混沌模式状态**：使用 `AtomicBool`（运行标志）和 `AtomicU64`（事件计数器）进行无锁状态检查。

### NaN-Boxing 桥接

当 geisterhand 需要将值传递给控件回调时，它必须创建正确 NaN-boxed 值：

- **字符串**（TextField）：调用 `js_string_from_bytes(ptr, len)` 分配运行时字符串，然后 `js_nanbox_string(ptr)` 用 STRING_TAG (0x7FFF) 包装它。
- **数字**（Slider）：直接传递原始 `f64` 值（数字是它们自己的 NaN-boxed 表示）。
- **布尔值**（Toggle/chaos）：使用 `TAG_TRUE` (0x7FFC000000000004) 或 `TAG_FALSE` (0x7FFC000000000003)。

---

## 构建细节

### 自动构建

当您传递 `--enable-geisterhand`（或 `--geisterhand-port`）时，Perry 自动构建所需的库（在首次使用时）。如果它们还没有缓存：

```
cargo build --release \
  -p perry-runtime --features perry-runtime/geisterhand \
  -p perry-ui-{platform} --features perry-ui-{platform}/geisterhand \
  -p perry-ui-geisterhand
```

平台 crate 选择基于 `--target` 自动：

| 目标 | UI Crate |
|------|----------|
| *(default/macOS) | `perry-ui-macos` |
| `ios` / `ios-simulator` | `perry-ui-ios` |
| `android` | `perry-ui-android` |
| `linux` | `perry-ui-gtk4` |
| `windows` | `perry-ui-windows` |

### 单独的目标目录

Geisterhand 库构建到 `target/geisterhand/`（通过 `CARGO_TARGET_DIR`）以避免干扰正常构建。这意味着您的第一次 geisterhand 构建需要一点时间，但后续构建会重用缓存的库。

### 功能标志

所有 geisterhand 代码在 `#[cfg(feature = "geisterhand")]` 功能门后面：

- **`perry-runtime/geisterhand`**：编译 `geisterhand_registry` 模块——控件注册表、动作队列、泵函数、屏幕截图协调。
- **`perry-ui-{platform}/geisterhand`**：将 `perry_geisterhand_register()` 调用添加到控件构造函数，并将 `perry_geisterhand_pump()` 添加到平台计时器。

当功能未启用时，不会编译 geisterhand 代码——零二进制大小开销和零运行时成本。

### 链接

编译的二进制文件链接三个额外的静态库：
1. `libperry_runtime.a`（geisterhand-featured 构建，替换正常的运行时）
2. `libperry_ui_{platform}.a`（geisterhand-featured 构建，替换正常的 UI 库）
3. `libperry_ui_geisterhand.a`（HTTP 服务器 + 混沌模式）

### 手动构建

如果自动构建失败或您想要手动交叉编译：

```bash
# 为 macOS 构建 geisterhand 库
CARGO_TARGET_DIR=target/geisterhand cargo build --release \
  -p perry-runtime --features perry-runtime/geisterhand \
  -p perry-ui-macos --features perry-ui-macos/geisterhand \
  -p perry-ui-geisterhand

# 为 iOS 交叉编译
CARGO_TARGET_DIR=target/geisterhand cargo build --release \
  --target aarch64-apple-ios \
  -p perry-runtime --features perry-runtime/geisterhand \
  -p perry-ui-ios --features perry-ui-ios/geisterhand \
  -p perry-ui-geisterhand
```

---

## 安全

Geisterhand 绑定到 `0.0.0.0` 上的配置端口（默认 7676）。这意味着它**可从本地网络访问**——网络上的任何设备都可以与您的应用交互、捕获屏幕截图或触发混沌模式。

**不要将 geisterhand-enabled 二进制文件发布到生产环境或分发给最终用户。**

Geisterhand 是一个开发和测试工具。功能门系统确保它不能意外包含在正常构建中——您必须明确传递 `--enable-geisterhand` 或 `--geisterhand-port`。

---

## 故障排除

### "Connection refused" on port 7676

- 确保您使用 `--enable-geisterhand` 或 `--geisterhand-port` 编译
- 检查应用是否完全启动（在 stderr 中查找 `[geisterhand] listening on...`）
- 验证端口没有被另一个进程使用：`lsof -i :7676`

### 控件句柄未找到

- 句柄在控件创建时分配。如果您在 UI 完全构造之前查询 `/widgets`，某些控件可能尚未注册。
- 在交互之前等待 `GET /health` 返回 `{"status":"ok"}`。

### 屏幕截图返回空数据

- 屏幕截图捕获有 5 秒超时。如果主线程被阻塞（例如，由长时间运行的同步操作），屏幕截图将超时并返回空数据。
- 在 macOS 上，确保应用有可见窗口（最小化的窗口可能无法正确捕获）。

### 自动构建失败

- 确保您有工作的 Rust 工具链（`rustup show`）
- 对于交叉编译目标，安装适当的目标：`rustup target add aarch64-apple-ios`
- 检查 Perry 源树是否可访问（自动构建向上搜索工作区根目录）

### 混沌模式崩溃应用

那是重点——混沌模式找到了一个错误。检查应用的 stderr 输出以获取 panic 消息或堆栈跟踪。常见原因：
- 回调处理程序假设有效状态但接收意外值
- 缺少状态值的空检查
- 状态更新中的竞争条件