# 从源代码构建

## 先决条件

- Rust 工具链（稳定版）：[rustup.rs](https://rustup.rs/)
- 系统 C 编译器（macOS/Linux 上的 `cc`，Windows 上的 MSVC）

## 构建

```bash
git clone https://github.com/skelpo/perry.git
cd perry

# 构建所有 crate（推荐发布模式）
cargo build --release
```

二进制文件位于 `target/release/perry`。

## 构建特定 Crate

```bash
# 仅运行时（必须重建 stdlib！）
cargo build --release -p perry-runtime -p perry-stdlib

# 仅代码生成
cargo build --release -p perry-codegen-llvm
```

> **重要**：重建 `perry-runtime` 时，您必须也重建 `perry-stdlib`，因为 `libperry_stdlib.a` 将 perry-runtime 作为静态依赖嵌入。

## 运行测试

```bash
# 所有测试（在非 iOS 主机上排除 iOS crate）
cargo test --workspace --exclude perry-ui-ios

# 特定 crate
cargo test -p perry-hir
cargo test -p perry-codegen-llvm
```

## 编译和运行 TypeScript

```bash
# 编译 TypeScript 文件
cargo run --release -- hello.ts -o hello
./hello

# 调试：打印 HIR
cargo run --release -- hello.ts --print-hir
```

## 开发工作流

1. 对相关 crate 进行更改
2. `cargo build --release` 构建
3. `cargo test --workspace --exclude perry-ui-ios` 验证
4. 使用真实 TypeScript 文件测试：`cargo run --release -- test.ts -o test && ./test`

## 项目结构

```
perry/
├── crates/
│   ├── perry/              # CLI 驱动程序
│   ├── perry-parser/       # SWC TypeScript 解析器
│   ├── perry-types/        # 类型定义
│   ├── perry-hir/          # HIR 和降低
│   ├── perry-transform/    # IR 传递
│   ├── perry-codegen-llvm/ # LLVM 原生代码生成
│   ├── perry-codegen-wasm/ # WebAssembly 代码生成 (--target web / --target wasm)
│   ├── perry-codegen-js/   # JS 缩小器（以前是 web 目标的代码生成）
│   ├── perry-codegen-swiftui/ # Widget 代码生成
│   ├── perry-runtime/      # 运行时库
│   ├── perry-stdlib/       # npm 包实现
│   ├── perry-ui/           # 共享 UI 类型
│   ├── perry-ui-macos/     # macOS AppKit UI
│   ├── perry-ui-ios/       # iOS UIKit UI
│   └── perry-jsruntime/    # QuickJS 集成
├── docs/                   # 此文档 (mdBook)
├── CLAUDE.md               # 详细实现说明
└── CHANGELOG.md            # 版本历史
```

## 下一步

- [架构](architecture.md) — Crate 映射和管道概述
- 有关详细实现说明和陷阱，请参阅 `CLAUDE.md`