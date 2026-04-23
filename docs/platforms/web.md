# Web

`--target web` 和 `--target wasm` 是同一后端的别名。二者均会生成一个自包含的 HTML 文件，内嵌 WebAssembly 代码以及用于 DOM 组件的 JavaScript 桥接层。

```bash
perry app.ts -o app --target web    # 与 --target wasm 输出结果相同
open app.html
```

完整文档请参见 **[WebAssembly / Web](wasm)**：包括其工作原理、支持的特性、UI 映射、外部函数接口（FFI）、线程、限制条件及示例。

## 为何合并为单一目标而非保留两个？

Perry 曾有两个浏览器后端：

- `--target web`（`perry-codegen-js`）—— 将高阶中间表示（HIR）转换为 JavaScript 代码
- `--target wasm`（`perry-codegen-wasm`）—— 将高阶中间表示（HIR）编译为 WebAssembly 代码

现已将这两个后端整合至 WASM 目标，使得浏览器应用无需单独的 JS 代码生成流水线，即可获得接近原生的性能、FFI 导入能力以及 Web Worker 线程支持。原 `--target web` 所提供的 DOM 组件运行时，现已内嵌至 `wasm_runtime.js` 中。这两个参数最终均通过 `perry-codegen-wasm` 处理，并生成完全相同的 HTML 输出文件。

## 后续参考

- [WebAssembly / Web](wasm) — 该目标的完整文档
- [Platform Overview](overview) — 所有平台相关说明