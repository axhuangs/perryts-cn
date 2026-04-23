# WebAssembly / Web 端

Perry 可通过 `--target wasm` 或其别名 `--target web` 将 TypeScript 应用编译为适用于浏览器的**WebAssembly**（WASM）代码。这两个编译标识均指向同一后端模块（`perry-codegen-wasm`），且输出结果完全一致：一个独立的 HTML 文件，内嵌 WASM 字节码，同时包含一个轻量级 JavaScript 桥接层，用于实现 DOM 组件交互和宿主 API 调用。

此前曾有一个独立的、用于生成 JavaScript 代码的 `--target web` 编译目标（基于 `perry-codegen-js`）；该编译目标现已整合至 WASM 编译目标中，使得浏览器端应用可“零成本”获得接近原生的性能、FFI 导入能力以及 Web Worker 多线程支持。

## 构建方式

```bash
# 生成独立 HTML 文件（默认输出格式）
perry app.ts -o app --target web
open app.html

# 等效命令
perry app.ts -o app --target wasm

# 仅生成原始 .wasm 二进制文件（无 HTML 封装层）
perry app.ts -o app.wasm --target wasm
```

默认输出为单个 `.html` 文件，其中包含经 Base64 编码嵌入的 WASM 二进制文件、`wasm_runtime.js` 桥接脚本，以及用于实例化 WASM 模块的 `bootPerryWasm()` 调用。可直接在任意现代浏览器中打开该文件——对于简单应用，无需额外构建步骤，也无需部署服务器。

> **注意**：若应用使用 `fetch()` 或其他依赖真实源（Origin）的 Web 平台 API，则必须通过 HTTP 协议提供服务（使用 file:// 协议打开会触发跨域资源共享（CORS）错误 / “Failed to fetch” 异常）。任意本地静态文件服务器均可满足需求：
> ```bash
> python3 -m http.server 8765
> open http://localhost:8765/app.html
> ```

## 工作原理

`perry-codegen-wasm` 库通过 `wasm-encoder` 将高阶中间表示（HIR）直接编译为 WASM 字节码。输出的 WASM 代码具备以下特征：

- 从 `rt` 命名空间导入约 280 个宿主函数（涵盖字符串操作、数学计算、控制台输出、JSON 处理、类、闭包、Promise、fetch 等能力）；
- 从 `ffi` 命名空间导入用户声明的 FFI 函数；
- 导出 `_start`、`memory`、`__indirect_function_table`，以及所有用户函数（命名格式为 `__wasm_func_<idx>`，以便编译为 JS 代码的异步函数体能够回调 WASM 代码）。

NaN 装箱（NaN-boxing）方案与原生 `perry-runtime` 完全一致——采用带有 STRING_TAG/POINTER_TAG/INT32_TAG 标签的 f64 数值类型，因此原生编译目标与 WASM 编译目标使用统一的数值表示方式。JS 桥接层会对所有宿主导入函数进行位级别的重新解释封装，确保经 NaN 装箱的 f64 数值可完整穿过基于 BigInt 实现的 JS ↔ WASM i64 数据边界（若不做封装，BigInt(NaN) 操作会直接抛出异常）。

## 支持的功能

- **完整的 TypeScript 语言特性**：类（包含构造函数、方法、取值器/赋值器、继承、字段）、async/await、闭包（支持捕获外部变量）、生成器、解构赋值、模板字符串、泛型、枚举、try/catch/finally 异常处理；
- **模块系统**：跨模块导入、顶层 `const`/`let`（提升为 WASM 全局变量）、循环导入；
- **标准库**：String/Array/Object 方法、Map/Set、JSON、Date、RegExp、Math、Error、URL/URLSearchParams、Buffer、Promise（支持 `.then`/`.catch`/`.allSettled`/`.race`/`.any`/`.all` 方法）；
- **异步能力**：`async`/`await`（编译为 JS Promise）、`setTimeout`/`setInterval`、支持完整请求参数（method、headers、body）的 `fetch()`；
- **多线程**：通过 `perry/thread` 模块提供 `parallelMap`/`parallelFilter`/`spawn` 能力，基于 Web Worker 池实现，每个 Worker 对应一个 WASM 实例（详见 [线程处理](../threading/overview)）；
- **基于 DOM 的 UI**：`perry/ui` 中的所有组件（`VStack`、`HStack`、`ZStack`、`Text`、`Button`、`TextField`、`Toggle`、`Slider`、`ScrollView`、`Picker`、`Image`、`Canvas`、`Form`、`Section`、`NavigationStack`、`Table`、`LazyVStack`、`TextArea` 等）均映射为 DOM 元素，采用弹性盒（flexbox）布局。状态绑定（`bindText`/`bindSlider`/`bindToggle`/`bindForEach`/...）通过响应式订阅机制实现；
- **系统 API**：基于 `localStorage` 的偏好设置/密钥链、暗色模式检测（`prefers-color-scheme`）、Web 通知、剪贴板、文件打开/保存对话框、文件系统访问 API、Web 音频捕获；
- **FFI 能力**：`declare function` 声明会成为 `ffi` 命名空间下的 WASM 导入函数；
- **编译时国际化**：`perry/i18n` 模块的 `t()` 调用行为与原生编译目标完全一致。

## UI 映射关系

Perry 组件与 HTML 元素的映射关系如下：

| Perry 组件 | HTML 元素 |
|-------------|-------------|
| `Text` | `<span>` |
| `Button` | `<button>` |
| `TextField` | `<input type="text">` |
| `SecureField` | `<input type="password">` |
| `Toggle` | `<input type="checkbox">` |
| `Slider` | `<input type="range">` |
| `Picker` | `<select>` |
| `ProgressView` | `<progress>` |
| `Image` / `ImageFile` | `<img>` |
| `VStack` | `<div>`（弹性盒列布局） |
| `HStack` | `<div>`（弹性盒行布局） |
| `ZStack` | `<div>`（position: relative + 子元素 absolute） |
| `ScrollView` | `<div>`（overflow: auto） |
| `Canvas` | `<canvas>`（2D 上下文） |
| `Table` | `<table>` |
| `Divider` | `<hr>` |
| `Spacer` | `<div>`（flex: 1） |

## FFI 支持

WASM 编译目标支持通过 `declare function` 声明外部 FFI 函数，这些函数会成为 `"ffi"` 命名空间下的 WASM 导入函数：

```typescript
declare function bloom_init_window(w: number, h: number, title: number, fs: number): void;
declare function bloom_draw_rect(x: number, y: number, w: number, h: number,
                                  r: number, g: number, b: number, a: number): void;
```

可在实例化 WASM 模块时提供这些函数的实现：

```javascript
// 方式1：通过全局变量 __ffiImports（需在启动前设置）
globalThis.__ffiImports = { bloom_init_window: ..., bloom_draw_rect: ... };

// 方式2：通过 bootPerryWasm 第二个参数传入
await bootPerryWasm(wasmBase64, { bloom_init_window: ..., bloom_draw_rect: ... });
```

**缺失导入的自动桩函数**：`ffi` 命名空间被封装在 Proxy 对象中，因此宿主环境未提供的任意 FFI 函数都会自动生成一个空操作桩函数，返回 `TAG_UNDEFINED`。这意味着使用了原生库的应用（例如 Hone 编辑器的 56 个 `hone_editor_*` 函数）即便在无原生绑定的浏览器环境中，仍可完成实例化并运行——相关功能仅会执行空操作。

## 模块级常量

顶层 `const`/`let` 声明会被提升为专用的 WASM 全局变量，因此同一模块内的函数可直接读取这些常量，且不同模块的相同 `LocalId` 不会发生冲突：

```typescript
// telemetry.ts
const CHIRP_URL = 'https://api.chirp247.com/api/v1/event';
const API_KEY   = 'my-key';

export function trackEvent(event: string): void {
  fetch(CHIRP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Chirp-Key': API_KEY },
    body: JSON.stringify({ event }),
  });
}
```

`CHIRP_URL` 和 `API_KEY` 都会成为由 `(module_idx, LocalId)` 索引的 WASM 全局变量。`trackEvent` 函数读取这些常量时，会生成 `global.get` 指令，而非尝试查找不存在的函数局部变量。

## JavaScript 运行时桥接层

桥接层（`wasm_runtime.js`）内嵌在 HTML 文件中，提供约 280 个导入函数，涵盖以下类别：

- **NaN 装箱辅助函数**：`f64ToU64` / `u64ToF64` / `nanboxString` / `nanboxPointer` / `toJsValue` / `fromJsValue`；
- **字符串表**：按字符串 ID 索引的动态 JS 字符串数组；
- **句柄存储**：将整数句柄 ID 映射至 JS 对象、数组、闭包、Promise、DOM 元素；
- **核心操作**：控制台、数学计算、JSON、JSON.parse/stringify、Date、RegExp、URL、Map、Set、Buffer、fetch；
- **闭包分发**：间接函数表 + 捕获数组，包含 `closure_call_0/1/2/3/spread`；
- **类分发**：`class_new`、`class_call_method`、`class_get_field`、`class_set_field`、用于继承的父类表；
- **DOM 组件**：168+ 个 `perry_ui_*` 函数，覆盖 `perry/ui` 中的所有组件；
- **异步函数**：编译为 JS 函数体，并以 `__async_<name>` 形式合并至导入对象中。

所有宿主导入函数均通过 `wrapImportsForI64()` 封装，该函数会自动将 BigInt 类型的入参（来自 WASM i64 参数）在内部重新解释为 f64 类型，并将 Number 类型的返回值重新解释为 BigInt 类型。若不进行此封装，所有返回 NaN 值的 f64 类型结果都会因“无法将 NaN 转换为 BigInt”而导致崩溃。

## Web Worker 多线程

`perry/thread` 模块在浏览器端通过 Web Worker 池实现多线程：

```typescript
import { parallelMap } from "perry/thread";

const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
const squares = parallelMap(numbers, (n) => n * n);
```

每个 Worker 都会实例化一个独立的 WASM 模块（使用相同的字节码和桥接层）。主线程与 Worker 之间通过结构化克隆（structured-clone）序列化机制传递数据。详见 [线程处理](../threading/overview)。

## 限制

- **文件系统访问**：仅支持文件系统访问 API（`window.showDirectoryPicker()`），无原生文件系统访问能力；
- **网络通信**：无原始 TCP/UDP 套接字——仅支持 `fetch()` 和 `WebSocket`；
- **子进程**：无法创建子进程——`child_process.exec` 等接口执行空操作；
- **数据库**：原生数据库（SQLite、Postgres、MySQL）驱动无法编译为 Web 端代码；
- **跨域限制**：所有 `fetch()` 调用均受 CORS 规则约束——第三方 API 需允许当前源的跨域请求；
- **密钥存储**：使用 `localStorage` 而非原生密钥链——适用于存储偏好设置，不适用于存储敏感信息；
- **堆栈追踪**：源码映射（Source-map）堆栈追踪仅覆盖 JS 代码；WASM 堆栈帧仅显示 `wasm-function[N]`。

## 代码压缩

使用 `--minify` 参数可压缩 HTML 输出文件中内嵌的 JS 运行时桥接层。基于 Rust 实现的 JS 压缩器会移除注释、合并空白字符、混淆内部标识符，将运行时代码从约 3400 行压缩至约 180 行。

```bash
perry app.ts -o app --target web --minify
```

## 示例：计数器应用

```typescript
import { App, VStack, Text, Button, State } from "perry/ui";

const count = State(0);

App({
  title: "Counter",
  width: 400,
  height: 300,
  body: VStack(16, [
    Text(`Count: ${count.value}`),
    Button("Increment", () => count.set(count.value + 1)),
  ]),
});
```

```bash
perry counter.ts -o counter --target web
open counter.html
```

## 示例：生产级应用（Mango MongoDB GUI）

[Mango](https://github.com/PerryTS/mango) 是一款 MongoDB 可视化工具——包含 50 个模块、998 个函数、类、异步函数、带自定义请求头的 fetch 调用、Hone 代码编辑器——通过 `--target web` 可编译为单个 4 MB 的 HTML 文件，在浏览器中完整渲染其 UI（欢迎页、查询视图、编辑视图）。基于 SQLite 的连接存储在 Web 端会优雅降级为内存临时存储；应用其余功能与原生版本完全一致。

## 后续参考

- [平台总览](overview) — 所有平台相关内容
- [UI 总览](../ui/overview) — UI 系统相关内容
- [线程处理](../threading/overview) — Web Worker 多线程相关内容