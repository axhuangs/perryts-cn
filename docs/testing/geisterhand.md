## Geisterhand — 进程内UI测试

Geisterhand（德语意为“幽灵之手”）可在您的Perry应用中嵌入一个轻量级HTTP服务器，使您能够以编程方式与每个控件进行交互。通过简单的HTTP调用，您可以点击按钮、在文本字段中输入内容、拖动滑块、切换开关、捕获屏幕截图以及运行混沌模式的随机模糊测试。

它适用于**所有5个原生平台**（macOS、iOS、Android、Linux/GTK4、Windows），且无需外部依赖。编译时使用`--enable-geisterhand`即可自动启动服务器。

---

## 快速入门

```bash
# 1. 启用geisterhand进行编译（首次使用时自动构建库）
perry app.ts -o app --enable-geisterhand

# 2. 运行应用
./app
# [geisterhand] listening on http://127.0.0.1:7676

# 3. 在另一个终端中与应用交互
curl http://127.0.0.1:7676/widgets # 列出所有控件
curl -X POST http://127.0.0.1:7676/click/3 # 点击句柄为3的按钮
curl http://127.0.0.1:7676/screenshot -o s.png # 捕获窗口截图
```

### 自定义端口

默认端口为**7676**。使用`--geisterhand-port`更改端口（这隐含了`--enable-geisterhand`，因此无需同时使用两个标志）：

```bash
perry app.ts -o app --geisterhand-port 9090
# 或使用perry run：
perry run --geisterhand-port 9090
```

### 使用`perry run`

```bash
perry run --enable-geisterhand
perry run macos --geisterhand-port 8080
perry run ios --enable-geisterhand
```

---

## API参考

除非另有说明，否则所有端点均返回JSON。所有响应均包含`Access-Control-Allow-Origin: *`，以支持基于浏览器的工具。支持OPTIONS请求以进行CORS预检。

### 健康检查

```
GET /health
→ {"status":"ok"}
```

在运行测试前使用此接口等待应用准备就绪。

### 列出控件

```
GET /widgets
```

返回所有已注册控件的JSON数组：

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

支持查询参数过滤：
- `GET /widgets?label=Save` — 按标签子字符串过滤（不区分大小写）
- `GET /widgets?type=button` — 按控件类型名称或代码过滤
- `GET /widgets?label=Save&type=5` — 组合过滤

#### 控件类型

| 代码 | 类型 | 描述 |
|------|------|-------------|
| 0 | Button | 带有onClick事件的按钮 |
| 1 | TextField | 文本输入字段 |
| 2 | Slider | 数字滑块 |
| 3 | Toggle | 开/关开关 |
| 4 | Picker | 下拉选择器 |
| 5 | Menu | 菜单项 |
| 6 | Shortcut | 键盘快捷键 |
| 7 | Table | 数据表 |
| 8 | ScrollView | 可滚动容器 |

#### 回调类型

| 代码 | 类型 | 描述 |
|------|------|-------------|
| 0 | onClick | 点击/轻触时触发 |
| 1 | onChange | 值更改时触发 |
| 2 | onSubmit | 提交时触发（例如，按下Enter键） |
| 3 | onHover | 鼠标悬停时触发 |
| 4 | onDoubleClick | 双击时触发 |
| 5 | onFocus | 获得焦点时触发 |

单个控件可能会在列表中多次出现，但具有不同的回调类型。例如，一个同时具有`onClick`和`onHover`处理程序的按钮会产生两个条目（相同的句柄，不同的`callback_kind`）。

### 点击控件

```
POST /click/:handle
→ {"ok":true}
```

触发控件的`onClick`回调。适用于按钮、菜单项、快捷键和表格行。

```bash
curl -X POST http://127.0.0.1:7676/click/3
```

### 在文本字段中输入

```
POST /type/:handle
Content-Type: application/json

{"text": "hello world"}
```

设置文本字段的内容，并触发其`onChange`回调，将新文本作为NaN-boxed字符串传递。

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

设置滑块位置，并使用数字值触发`onChange`。

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

使用布尔值触发开关的`onChange`回调。

```bash
curl -X POST http://127.0.0.1:7676/toggle/6
```

### 直接设置状态

```
POST /state/:handle
Content-Type: application/json

{"value": 42}
```

直接设置`State`单元格的值，绕过控件回调。这会触发附加到该状态的任何响应式绑定（绑定的文本标签、可见性、forEach循环等）。

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

触发控件的`onHover`回调。对于测试悬停依赖的UI（工具提示、颜色更改等）非常有用。

### 双击

```
POST /doubleclick/:handle
→ {"ok":true}
```

触发控件的`onDoubleClick`回调。

### 触发键盘快捷键

```
POST /key
Content-Type: application/json

{"shortcut": "s"}
```

查找快捷键匹配的已注册菜单项并触发其回调。快捷键字符串不区分大小写，并与传递给`menuAddItem`的键字符串匹配（例如，`"s"`对应Cmd+S，`"S"`对应Cmd+Shift+S，`"n"`对应Cmd+N）。

```bash
curl -X POST http://127.0.0.1:7676/key \
 -H 'Content-Type: application/json' \
 -d '{"shortcut":"s"}'
```

如果找到匹配的快捷键，则返回`{"ok":true}`，否则返回404。

### 滚动ScrollView

```
POST /scroll/:handle
Content-Type: application/json

{"x": 0, "y": 100}
```

设置ScrollView控件的滚动偏移量。`x`和`y`均以点为单位。

```bash
curl -X POST http://127.0.0.1:7676/scroll/8 \
 -H 'Content-Type: application/json' \
 -d '{"x":0,"y":200}'
```

### 捕获屏幕截图

```
GET /screenshot
→ (二进制PNG图像，Content-Type: image/png)
```

将应用窗口捕获为PNG图像。响应为原始二进制数据，而非JSON。

```bash
curl http://127.0.0.1:7676/screenshot -o screenshot.png
```

从调用者的角度来看，截图捕获是同步的——HTTP请求会阻塞，直到主线程完成捕获（超时：5秒）。

**平台特定的捕获方法**：

| 平台 | 方法 | 备注 |
|----------|--------|-------|
| macOS | `CGWindowListCreateImage` | Retina分辨率，从窗口ID读取 |
| iOS | `UIGraphicsImageRenderer` | 将视图层次结构绘制到图像上下文中 |
| Android | JNI `View.draw()` on Canvas | 创建Bitmap，压缩为PNG |
| Linux (GTK4) | `WidgetPaintable` + `GskRenderer` | 渲染到纹理，保存为PNG字节 |
| Windows | `PrintWindow` + `GetDIBits` | 内联PNG编码器（存储的zlib块） |

### 混沌模式

混沌模式以可配置的间隔随机与控件交互——适用于压力测试、寻找边缘情况和崩溃狩猎。

#### 启动

```
POST /chaos/start
Content-Type: application/json

{"interval_ms": 200}
```

```bash
# 每200毫秒触发随机输入
curl -X POST http://127.0.0.1:7676/chaos/start \
 -H 'Content-Type: application/json' \
 -d '{"interval_ms":200}'
```

如果省略`interval_ms`，则使用默认间隔。混沌线程随机选择一个已注册控件，并根据控件类型触发适当的输入：

| 控件类型 | 随机输入 |
|-------------|-------------|
| Button | 触发onClick（无参数） |
| TextField | 随机字母数字字符串，5-20个字符 |
| Slider | 0.0到1.0之间的随机浮点数 |
| Toggle | 随机true/false |
| Picker | 随机索引0-9 |
| Menu | 触发onClick（无参数） |
| Shortcut | 触发onClick（无参数） |
| Table | 触发onClick（无参数） |

#### 状态

```
GET /chaos/status
→ {"running":true,"events_fired":247,"uptime_secs":12}
```

返回混沌模式是否处于活动状态、已触发多少随机事件以及运行时间（秒）。

#### 停止

```
POST /chaos/stop
→ {"ok":true,"chaos":"stopped"}
```

### 错误响应

所有端点均以适当的HTTP状态码返回错误JSON：

```json
{"error": "widget handle 99 not found"}
```

常见错误：
- `404` — 未找到控件句柄
- `400` — JSON正文格式错误或缺少必填字段
- `405` — 不支持的HTTP方法

---

## 平台设置

### macOS

无需额外设置。服务器绑定到`0.0.0.0:7676`，可在`localhost`上访问。

```bash
perry app.ts -o app --enable-geisterhand
./app
curl http://127.0.0.1:7676/widgets
```

### iOS模拟器

iOS模拟器共享主机的网络堆栈——直接在`localhost`上访问服务器：

```bash
perry app.ts -o app --target ios-simulator --enable-geisterhand
xcrun simctl install booted app.app
xcrun simctl launch booted com.perry.app
curl http://127.0.0.1:7676/widgets
```

### iOS设备

对于物理iOS设备，您需要一条到设备的网络路由（同一Wi-Fi网络）或使用`libimobiledevice`中的`iproxy`：

```bash
perry app.ts -o app --target ios --enable-geisterhand
# 通过Xcode/devicectl安装并启动
# 然后通过设备的IP连接：
curl http://192.168.1.42:7676/widgets
```

### Android（模拟器或设备）

使用`adb forward`桥接端口。确保清单中包含`INTERNET`权限（或将其添加到`perry.toml`中）：

```toml
[android]
permissions = ["INTERNET"]
```

```bash
perry app.ts -o app --target android --enable-geisterhand
# 打包为APK并安装
adb forward tcp:7676 tcp:7676
curl http://127.0.0.1:7676/widgets
```

### Linux（GTK4）

首先安装GTK4开发库：

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

Geisterhand将您的Perry应用转变为可测试的HTTP服务。以下是自动化测试的实用模式。

### Shell脚本测试

使用bash进行的简单端到端测试：

```bash
#!/bin/bash
set -e

# 启用geisterhand构建
perry app.ts -o testapp --enable-geisterhand

# 在后台启动应用
./testapp &
APP_PID=$!
trap "kill $APP_PID 2>/dev/null" EXIT

# 等待应用准备就绪
for i in $(seq 1 30); do
 curl -sf http://127.0.0.1:7676/health && break
 sleep 0.1
done

# 获取控件
WIDGETS=$(curl -sf http://127.0.0.1:7676/widgets)
echo "Registered widgets: $WIDGETS"

# 查找标记为"Submit"的按钮
SUBMIT_HANDLE=$(echo "$WIDGETS" | jq -r '.[] | select(.label == "Submit") | .handle')

# 点击它
curl -sf -X POST "http://127.0.0.1:7676/click/$SUBMIT_HANDLE"

# 交互后截图
curl -sf http://127.0.0.1:7676/screenshot -o after-click.png

echo "Test passed"
```

### Python测试示例

```python
import subprocess, time, requests, json

# 启动应用
proc = subprocess.Popen(["./testapp"])
time.sleep(1) # 等待启动

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

 # 捕获截图以进行视觉回归测试
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
# 构建并启动
perry app.ts -o app --enable-geisterhand
./app &

# 等待启动
sleep 1

# 启动激进混沌（每50毫秒）
curl -X POST http://127.0.0.1:7676/chaos/start \
 -H 'Content-Type: application/json' \
 -d '{"interval_ms":50}'

# 运行30秒
sleep 30

# 检查状态
curl -sf http://127.0.0.1:7676/chaos/status
# {"running":true,"events_fired":600,"uptime_secs":30}

# 截图以查看最终状态
curl http://127.0.0.1:7676/screenshot -o chaos-result.png

# 停止混沌
curl -X POST http://127.0.0.1:7676/chaos/stop

# 检查应用是否仍然存活
curl -sf http://127.0.0.1:7676/health
```

### 视觉回归测试

在关键交互点捕获截图，并与基线进行比较：

```bash
# 初始状态
curl http://127.0.0.1:7676/screenshot -o baseline.png

# 交互
curl -X POST http://127.0.0.1:7676/click/3
curl -X POST http://127.0.0.1:7676/type/4 -d '{"text":"Hello"}'

# 交互后截图
curl http://127.0.0.1:7676/screenshot -o current.png

# 比较（使用ImageMagick）
compare baseline.png current.png diff.png
```

### CI流水线集成

```yaml
# GitHub Actions示例
jobs:
 ui-test:
 runs-on: macos-latest
 steps:
 - uses: actions/checkout@v4

 - name: 启用geisterhand构建
 run: perry app.ts -o testapp --enable-geisterhand

 - name: 运行UI测试
 run: |
 ./testapp &
 sleep 2
 # 运行您的测试脚本
 ./tests/ui-test.sh
 kill %1

 - name: 上传截图
 if: always()
 uses: actions/upload-artifact@v4
 with:
 name: screenshots
 path: "*.png"
```

---

## 示例应用

一个完整的Perry UI应用，演示了Geisterhand可以与之交互的所有控件类型：

```typescript
import {
 App, VStack, HStack, Text, Button, TextField,
 Slider, Toggle, Picker, State
} from "perry/ui";

// 用于响应式UI的状态
const counterState = State(0);
const textState = State("");

// 标签
const title = Text("Geisterhand Demo");
const counterLabel = Text("Count: 0");

// 将计数器状态绑定到标签
counterState.onChange((val: number) => {
 counterLabel.setText("Count: " + val);
});

// Button — handle 3（近似），widget_type=0
const incrementBtn = Button("Increment", () => {
 counterState.set(counterState.value + 1);
});

const resetBtn = Button("Reset", () => {
 counterState.set(0);
});

// TextField — widget_type=1
const nameField = TextField("Enter your name", (text: string) => {
 textState.set(text);
 console.log("Name:", text);
});

// Slider — widget_type=2
const volumeSlider = Slider(0, 100, 50, (value: number) => {
 console.log("Volume:", value);
});

// Toggle — widget_type=3
const darkModeToggle = Toggle("Dark Mode", false, (on: boolean) => {
 console.log("Dark mode:", on);
});

// 布局
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

使用`--enable-geisterhand`编译并运行后：

```bash
# 查看所有交互式控件
curl -s http://127.0.0.1:7676/widgets | jq .
# [
# {"handle":3,"widget_type":0,"callback_kind":0,"label":"Increment"},
# {"handle":4,"widget_type":0,"callback_kind":0,"label":"Reset"},
# {"handle":5,"widget_type":1,"callback_kind":1,"label":"Enter your name"},
# {"handle":6,"widget_type":2,"callback_kind":1,"label":""},
# {"handle":7,"widget_type":3,"callback_kind":1,"label":"Dark Mode"}
# ]

# 点击Increment 3次
for i in 1 2 3; do curl -sX POST http://127.0.0.1:7676/click/3; done
# 计数器标签现在显示"Count: 3"

# 输入名称
curl -sX POST http://127.0.0.1:7676/type/5 -d '{"text":"Perry"}'

# 将滑块设置为80%
curl -sX POST http://127.0.0.1:7676/slide/6 -d '{"value":0.8}'

# 打开暗黑模式
curl -sX POST http://127.0.0.1:7676/toggle/7

# 截图
curl -s http://127.0.0.1:7676/screenshot -o demo.png
```

---

## 架构

Geisterhand由三个通过线程安全队列连接的合作组件组成：

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

1. **启动**：当使用`--enable-geisterhand`时，编译后的二进制文件在初始化期间调用`perry_geisterhand_start(port)`。这会生成一个在后台运行`tiny-http`服务器的线程。

2. **控件注册**：在创建UI控件（Button、TextField、Slider等）时，每个控件都会调用`perry_geisterhand_register(handle, widget_type, callback_kind, closure_f64, label)`在全局注册表中注册其回调。这由`#[cfg(feature = "geisterhand")]`保护，因此正常构建无开销。

3. **HTTP请求**：当请求到达（例如，`POST /click/3`）时，服务器在注册表中查找句柄3，找到关联的闭包，并将`PendingAction::InvokeCallback`推送到待处理操作队列。

4. **主线程派发**：平台的计时器（macOS上的NSTimer、GTK4上的glib超时、Windows上的WM_TIMER等）每~8毫秒调用一次`perry_geisterhand_pump()`。这会排空待处理操作队列并在主线程上执行回调，这是UI安全所必需的。

5. **截图捕获**：截图使用`Condvar`同步——HTTP线程排队`CaptureScreenshot`操作，然后阻塞等待条件变量。主线程的泵执行平台特定的捕获，存储PNG数据，并发出条件变量信号。超时：5秒。

### 线程安全

- **控件注册表**：由`Mutex`保护。HTTP服务器读取（以列出控件和查找句柄），主线程写入（在控件创建期间）。
- **待处理操作队列**：由`Mutex`保护。HTTP服务器线程写入，主线程在`pump()`中排空。
- **截图结果**：由`Mutex` + `Condvar`保护。HTTP线程等待，主线程发出信号。
- **混沌模式状态**：使用`AtomicBool`（运行标志）和`AtomicU64`（事件计数器）进行无锁状态检查。

### NaN-Boxing桥接

当Geisterhand需要向控件回调传递值时，它必须创建正确NaN-boxed的值：

- **字符串**（用于TextField）：调用`js_string_from_bytes(ptr, len)`分配运行时字符串，然后调用`js_nanbox_string(ptr)`用STRING_TAG（0x7FFF）包装它。
- **数字**（用于Slider）：直接传递原始`f64`值（数字是其自身的NaN-boxed表示）。
- **布尔值**（用于Toggle/chaos）：使用`TAG_TRUE`（0x7FFC000000000004）或`TAG_FALSE`（0x7FFC000000000003）。

---

## 构建详情

### 自动构建

当您传递`--enable-geisterhand`（或`--geisterhand-port`）时，P首次使用时自动构建所需的库（如果它们尚未缓存）：

```
cargo build --release \
 -p perry-runtime --features perry-runtime/geisterhand \
 -p perry-ui-{platform} --features perry-ui-{platform}/geisterhand \
 -p perry-ui-geisterhand
```

根据`--target`自动选择平台crate：

| 目标 | UI Crate |
|--------|----------|
| (default/macOS) | `perry-ui-macos` |
| `ios` / `ios-simulator` | `perry-ui-ios` |
| `android` | `perry-ui-android` |
| `linux` | `perry-ui-gtk4` |
| `windows` | `perry-ui-windows` |

### 单独的目标目录

Geisterhand库构建到`target/geisterhand/`（通过`CARGO_TARGET_DIR`）以避免干扰正常构建。这意味着您的第一次geisterhand构建需要片刻时间，但后续构建会重用缓存的库。

### 功能标志

所有geisterhand代码均由`#[cfg(feature = "geisterhand")]`功能门保护：

- **`perry-runtime/geisterhand`**：编译`geisterhand_registry`模块——控件注册表、操作队列、泵函数、截图协调。
- **`perry-ui-{platform}/geisterhand`**：向控件构造函数添加`perry_geisterhand_register()`调用，并向平台计时器添加`perry_geisterhand_pump()`。

当功能未启用时，不会编译geisterhand代码——二进制大小开销为零，运行时成本为零。

### 链接

编译后的二进制文件链接三个额外的静态库：
1. `libperry_runtime.a`（geisterhand功能构建，替换正常运行时）
2. `libperry_ui_{platform}.a`（geisterhand功能构建，替换正常UI库）
3. `libperry_ui_geisterhand.a`（HTTP服务器 + 混沌模式）

### 手动构建

如果自动构建失败或您想手动交叉编译：

```bash
# 为macOS构建geisterhand库
CARGO_TARGET_DIR=target/geisterhand cargo build --release \
 -p perry-runtime --features perry-runtime/geisterhand \
 -p perry-ui-macos --features perry-ui-macos/geisterhand \
 -p perry-ui-geisterhand

# 为iOS交叉编译
CARGO_TARGET_DIR=target/geisterhand cargo build --release \
 --target aarch64-apple-ios \
 -p perry-runtime --features perry-runtime/geisterhand \
 -p perry-ui-ios --features perry-ui-ios/geisterhand \
 -p perry-ui-geisterhand
```

---

## 安全

Geisterhand绑定到配置端口（默认7676）上的`0.0.0.0`。这意味着它**可从本地网络访问**——同一网络上的任何设备都可以与您的应用交互、捕获截图或触发混沌模式。

**切勿将启用了geisterhand的二进制文件交付给生产环境或最终用户。**

Geisterhand仅是开发和测试工具。功能门系统确保它不能意外包含在正常构建中——您必须显式传递`--enable-geisterhand`或`--geisterhand-port`。

---

## 故障排除

### 端口7676上“连接被拒绝”

- 确保您使用`--enable-geisterhand`或`--geisterhand-port`进行了编译
- 检查应用是否已完全启动（在stderr中查找`[geisterhand] listening on...`）
- 验证端口未被其他进程使用：`lsof -i :7676`

### 未找到控件句柄

- 句柄在控件创建时分配。如果您在查询`/widgets`之前UI未完全构建，则某些控件可能尚未注册。
- 等待`GET /health`返回`{"status":"ok"}`后再进行交互。

### 截图返回空数据

- 截图捕获有5秒超时。如果主线程被阻塞（例如，由长时间运行的同步操作），截图将超时并返回空数据。
- 在macOS上，确保应用有一个可见窗口（最小化的窗口可能无法正确捕获）。

### 自动构建失败

- 确保您有可用的Rust工具链（`rustup show`）
- 对于交叉编译目标，安装适当的目标：`rustup target add aarch64-apple-ios`
- 检查Perry源树是否可访问（自动构建从`perry`可执行文件向上搜索工作区根目录）

### 混沌模式使应用崩溃

这就是目的——混沌模式发现了错误。检查应用的stderr输出以获取panic消息或堆栈跟踪。常见原因：
- 回调处理程序假设有效状态但收到意外值
- 状态值缺少空检查
- 状态更新中的竞争条件