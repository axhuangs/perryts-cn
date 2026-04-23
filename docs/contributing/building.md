# 从源码构建

## 前置条件

- Rust 工具链（稳定版）：[rustup.rs](https://rustup.rs/)
- 系统 C 编译器（macOS/Linux 下为 `cc`，Windows 下为 MSVC）

## 构建

```bash
git clone https://github.com/skelpo/perry.git
cd perry

# 构建所有 crate（推荐使用发布模式）
cargo build --release
```

二进制文件位于 `target/release/perry` 路径下。

## 构建指定 Crate

```bash
# 仅构建运行时（必须同时重新构建标准库！）
cargo build --release -p perry-runtime -p perry-stdlib

# 仅构建代码生成模块
cargo build --release -p perry-codegen-llvm
```

> **重要提示**：重新构建 `perry-runtime` 时，必须同时重新构建 `perry-stdlib`，因为 `libperry_stdlib.a` 会将 perry-runtime 作为静态依赖嵌入其中。

## 运行测试

```bash
# 运行所有测试（在非 iOS 主机环境下排除 iOS crate）
cargo test --workspace --exclude perry-ui-ios

# 运行指定 crate 的测试
cargo test -p perry-hir
cargo test -p perry-codegen-llvm
```

## 编译并运行 TypeScript 代码

```bash
# 编译 TypeScript 文件
cargo run --release -- hello.ts -o hello
./hello

# 调试模式：打印 HIR
cargo run --release -- hello.ts --print-hir
```

## 开发流程

1. 修改对应 crate 的代码
2. 执行 `cargo build --release` 完成构建
3. 执行 `cargo test --workspace --exclude perry-ui-ios` 验证修改
4. 使用实际的 TypeScript 文件进行测试：`cargo run --release -- test.ts -o test && ./test`

## 项目结构

```
perry/
├── crates/
│   ├── perry/              # 命令行接口驱动模块
│   ├── perry-parser/       # SWC TypeScript 解析器
│   ├── perry-types/        # 类型定义模块
│   ├── perry-hir/          # HIR 与代码降级处理模块
│   ├── perry-transform/    # 中间表示（IR）处理流程模块
│   ├── perry-codegen-llvm/ # LLVM 原生代码生成模块
│   ├── perry-codegen-wasm/ # WebAssembly 代码生成模块（--target web / --target wasm）
│   ├── perry-codegen-js/   # JS 代码压缩模块（原 Web 目标的代码生成模块）
│   ├── perry-codegen-swiftui/ # 组件代码生成模块
│   ├── perry-runtime/      # 运行时库
│   ├── perry-stdlib/       # npm 包实现模块
│   ├── perry-ui/           # 共享 UI 类型定义
│   ├── perry-ui-macos/     # macOS AppKit UI 模块
│   ├── perry-ui-ios/       # iOS UIKit UI 模块
│   └── perry-jsruntime/    # QuickJS 集成模块
├── docs/                   # 本文档（mdBook 格式）
├── CLAUDE.md               # 详细实现说明
└── CHANGELOG.md            # 版本历史
```

## 后续参考

- [Architecture](architecture) — Crate 映射与流水线概览
- 详见 `CLAUDE.md` 文件，内含详细的实现说明与注意事项