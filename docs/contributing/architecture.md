# 架构

这是为贡献者提供的简要概述。有关详细实现说明，请参阅项目的 `CLAUDE.md`。

## 编译管道

```
TypeScript (.ts)
    ↓ 解析 (SWC)
    ↓ AST
    ↓ 降低 (perry-hir)
    ↓ HIR (高层 IR)
    ↓ 转换 (内联、闭包转换、异步降低)
    ↓ 代码生成 (LLVM)
    ↓ 对象文件 (.o)
    ↓ 链接 (系统 cc)
    ↓
原生可执行文件
```

## Crate 映射

| Crate | 目的 |
|-------|------|
| `perry` | CLI 驱动程序、命令解析、编译编排 |
| `perry-parser` | SWC 包装器，用于 TypeScript 解析 |
| `perry-types` | 类型系统定义 |
| `perry-hir` | HIR 数据结构 (`ir.rs`) 和 AST→HIR 降低 (`lower.rs`) |
| `perry-transform` | IR 传递：函数内联、闭包转换、异步降低 |
| `perry-codegen-llvm` | 基于 LLVM 的原生代码生成 |
| `perry-codegen-wasm` | WebAssembly 代码生成，用于 `--target web` / `--target wasm` (HIR → WASM 字节码 + JS 桥接) |
| `perry-codegen-js` | 遗留 JavaScript 代码生成器（仍存在于 JS 缩小器；JS 发射 `--target web` 路径已整合到 `perry-codegen-wasm`） |
| `perry-codegen-swiftui` | SwiftUI 代码生成，用于 WidgetKit 扩展 |
| `perry-runtime` | 运行时库：NaN-boxed 值、GC、arena 分配器、对象、数组、字符串 |
| `perry-stdlib` | Node.js API 实现：mysql2、redis、fastify、bcrypt 等 |
| `perry-ui` | 共享 UI 类型 |
| `perry-ui-macos` | macOS UI (AppKit) |
| `perry-ui-ios` | iOS UI (UIKit) |
| `perry-jsruntime` | 通过 QuickJS 的 JavaScript 互操作 |

## 关键概念

### NaN-Boxing

所有 JavaScript 值都表示为 64 位 NaN-boxed 值。上部 16 位编码类型标签：

| 标签 | 类型 |
|------|------|
| `0x7FFF` | 字符串（下部 48 位 = 指针） |
| `0x7FFD` | 指针/对象（下部 48 位 = 指针） |
| `0x7FFE` | Int32（下部 32 位 = 整数） |
| `0x7FFA` | BigInt（下部 48 位 = 指针） |
| 特殊常量 | undefined、null、true、false |
| 其他任何 | Float64（完整的 64 位） |

### 垃圾回收

带有保守堆栈扫描的标记-清除 GC。Arena 分配的对象（数组、对象）通过线性块遍历找到。Malloc 分配的对象（字符串、闭包、promise）在线程本地 Vec 中跟踪。

### 基于句柄的 UI

UI 小部件表示为使用 `POINTER_TAG` NaN-boxed 的小整数句柄。每个句柄映射到原生平台小部件（NSButton、UILabel、GtkButton 等）。两个分派表将方法调用和属性访问路由到正确的 FFI 函数。

## 源代码组织

代码生成 crate 组织为聚焦模块：

```
perry-codegen-llvm/src/
  codegen.rs       # 主入口、模块编译
  types.rs         # 类型定义、上下文结构体
  util.rs          # 辅助函数
  stubs.rs         # 未解析依赖的存根生成
  runtime_decls.rs # 运行时函数声明
  classes.rs       # 类编译
  functions.rs     # 函数编译
  closures.rs      # 闭包编译
  module_init.rs   # 模块初始化
  stmt.rs          # 语句编译
  expr.rs          # 表达式编译
```

HIR 降低被拆分为 8 个模块：

```
perry-hir/src/
  lower.rs           # 主降低入口
  analysis.rs        # 代码分析传递
  enums.rs           # 枚举降低
  jsx.rs             # JSX 降低
  lower_types.rs     # 类型降低
  lower_patterns.rs  # 模式降低
  destructuring.rs   # 解构降低
  lower_decl.rs      # 声明降低
```

## 下一步

- [从源代码构建](building.md)
- 有关详细实现说明和陷阱，请参阅存储库根目录中的 `CLAUDE.md`