# WebAssembly / Web

Perry 将 TypeScript 应用编译为浏览器中的 **WebAssembly**，使用 `--target wasm` 或其别名 `--target web`。两个标志都通过相同的后端 (`perry-codegen-wasm`) 路由，并产生相同的输出：一个包含嵌入式 WASM 字节码和用于 DOM 小部件和主机 API 的薄 JavaScript 桥的自包含 HTML 文件。

曾经有一个单独的 JavaScript 发射 `--target web` (`perry-codegen-js`)；它被整合到 WASM 目标中，以便浏览器应用获得近原生性能、FFI 导入和 Web Worker 线程 "免费"。

## 构建

```bash
# 自包含 HTML (默认)
perry app.ts -o app --target web
open app.html

# 相同
perry app.ts -o app --target wasm

# 原始 .wasm 二进制 (无 HTML 包装)
perry app.ts -o app.wasm --target wasm
```

默认输出是一个包含 base64 嵌入 WASM 二进制、 `wasm_runtime.js` 桥和 `bootPerryWasm()` 调用的单个 `.html` 文件。直接在任何现代浏览器中打开 — 无构建步骤，无简单应用的服务器要求。

> **注意**：使用 `fetch()` 或依赖真实来源的其他 Web 平台 API 的应用必须通过 HTTP 提供 (file:// URL 会遇到 CORS / "Failed to fetch" 错误)。任何本地静态服务器都有效：
> ```bash
> python3 -m http.server 8765
> open http://localhost:8765/app.html
> ```

## 它如何工作

`perry-codegen-wasm` crate 直接将 HIR 编译为 WASM 字节码，使用 `wasm-encoder`。输出 WASM：

- 在 `rt` 命名空间下导入 ~280 个主机函数 (字符串操作、数学、控制台、JSON、类、闭包、Promise 等)
- 在 `ffi` 命名空间下导入用户声明的 FFI 函数
- 导出 `_start`、`memory`、`__indirect_function_table`，以及每个用户函数作为 `__wasm_func_<idx>` (以便异步函数体编译为 JS 可以回调到 WASM)

NaN 装箱方案匹配原生 `perry-runtime` — f64 值与 STRING_TAG/POINTER_TAG/INT32_TAG — 因此相同的价值表示跨原生和 WASM 目标使用。JS 桥包装每个主机导入，具有位级重新解释，以便 f64 NaN 装箱值通过 BigInt 基础的 JS↔WASM i64 边界完整传递 (BigInt(NaN) 否则会抛出)。

## 支持的功能

- **完整 TypeScript 语言**：类 (带构造函数、方法、getter/setter、继承、字段)、async/await、闭包 (带捕获)、生成器、解构、模板字面量、泛型、枚举、try/catch/finally
- **模块系统**：跨模块导入、顶级 `const`/`let` (提升为 WASM 全局)、循环导入
- **标准库**：String/Array/Object 方法、Map/Set、JSON、Date、RegExp、Math、Error、URL/URLSearchParams、Buffer、Promise (带 `.then`/`.catch`/`.allSettled`/`.race`/`.any`/`.all` 等等)
- **异步**：`async`/`await` (编译为 JS Promise)、`setTimeout`/`setInterval`、`fetch()` 带完整请求选项 (方法、标头、正文)
- **线程**：`perry/thread` `parallelMap`/`parallelFilter`/`spawn` 通过 Web Worker 池，每个工作线程一个 WASM 实例 (请参阅 [线程](../threading/overview.md))
- **基于 DOM 的 UI**：`perry/ui` 中的每个小部件 (`VStack`、`HStack`、`ZStack`、`Text`、`Button`、`TextField`、`Toggle`、`Slider`、`ScrollView`、`Picker`、`Image`、`Canvas`、`Form`、`Section`、`NavigationStack`、`Table`、`LazyVStack`、`TextArea` 等) 映射到具有 flexbox 布局的 DOM 元素。状态绑定 (`bindText`/`bindSlider`/`bindToggle`/`bindForEach`/...) 通过响应式订阅者工作。
- **系统 API**：`localStorage` 支持的偏好/钥匙串、深色模式检测 (`prefers-color-scheme`)、Web 通知、剪贴板、文件打开/保存对话框、文件系统访问 API、Web 音频捕获
- **FFI**：`declare function` 声明成为 `ffi` 命名空间下的 WASM 导入
- **编译时 i18n**：`perry/i18n` `t()` 调用与原生目标相同工作

## UI 映射

Perry 小部件映射到 HTML 元素：

| Perry 小部件 | HTML 元素 |
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
| `VStack` | `<div>` (flexbox 列) |
| `HStack` | `<div>` (flexbox 行) |
| `ZStack` | `<div>` (position: relative + absolute 子项) |
| `ScrollView` | `<div>` (overflow: auto) |
| `Canvas` | `<canvas>` (2D 上下文) |
| `Table` | `<table>` |
| `Divider` | `<hr>` |
| `Spacer` | `<div>` (flex: 1) |

## FFI 支持

WASM 目标支持使用 `declare function` 声明的外部 FFI 函数。它们成为 `ffi` 命名空间下的 WASM 导入：

```typescript
declare function bloom_init_window(w: number, h: number, title: number, fs: number): void;
declare function bloom_draw_rect(x: number, y: number, w: number, h: number,
                                  r: number, g: number, b: number, a: number): void;
```

在实例化时提供它们：

```javascript
// 通过 __ffiImports 全局 (在引导前设置)
globalThis.__ffiImports = { bloom_init_window: ..., bloom_draw_rect: ... };

// 或通过 bootPerryWasm 第二个参数
await bootPerryWasm(wasmBase64, { bloom_init_window: ..., bloom_draw_rect: ... });
```

**自动存根缺失导入。** `ffi` 命名空间被 `Proxy` 包装，以便主机不提供的任何 FFI 函数自动存根为返回 `TAG_UNDEFINED` 的无操作。这意味着使用原生库的应用 (例如 Hone Editor 的 56 个 `hone_editor_*` 函数) 可以在浏览器中实例化和运行，即使没有原生绑定 — 相关功能只是无操作。

## 模块级常量

顶级 `const`/`let` 声明被提升为专用 WASM 全局，以便同一模块中的函数可以读取它们，并使两个模块的相同 `LocalId` 不冲突：