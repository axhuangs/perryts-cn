# Web

`--target web` 和 `--target wasm` 是相同的后端别名。两者都产生一个包含嵌入式 WebAssembly 和用于 DOM 小部件的 JavaScript 桥的自包含 HTML 文件。

```bash
perry app.ts -o app --target web    # 与 --target wasm 相同输出
open app.html
```

请参阅 **[WebAssembly / Web](wasm.md)** 获取完整文档：它如何工作、支持的功能、UI 映射、FFI、线程、限制和示例。

## 为什么是一个目标而不是两个？

Perry 曾经有两个浏览器后端：

- `--target web` (`perry-codegen-js`) — 将 HIR 转译为 JavaScript
- `--target wasm` (`perry-codegen-wasm`) — 将 HIR 编译为 WebAssembly

这些被整合到 WASM 目标中，以便浏览器应用获得近原生性能、FFI 导入和 Web Worker 线程，而无需单独的 JS 发射管道。旧的 `--target web` 提供的 DOM 小部件运行时现在嵌入在 `wasm_runtime.js` 中。两个标志都通过 `perry-codegen-wasm` 路由并产生相同的 HTML 输出。

## 下一步

- [WebAssembly / Web](wasm.md) — 完整目标文档
- [平台概述](overview.md) — 所有平台