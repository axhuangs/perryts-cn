# 架构设计

本文档为贡献者提供简要概述。如需详细的实现说明，请参阅项目中的 `CLAUDE.md` 文件。

## 编译流水线

```
TypeScript (.ts)
    ↓ 解析（SWC）
    ↓ 抽象语法树（AST）
    ↓ 降阶处理（perry-hir）
    ↓ 高层中间表示（HIR）
    ↓ 转换（内联、闭包转换、异步降阶）
    ↓ 代码生成（LLVM）
    ↓ 目标文件（.o）
    ↓ 链接（系统 cc）
    ↓
原生可执行文件
```

##  crate 功能映射表

| Crate 名称 | 用途 |
|-----------|------|
| `perry` | 命令行界面驱动程序、命令解析、编译流程编排 |
| `perry-parser` | 用于 TypeScript 解析的 SWC 封装层 |
| `perry-types` | 类型系统定义 |
| `perry-hir` | HIR 数据结构（`ir.rs`）及 AST 到 HIR 的降阶处理（`lower.rs`） |
| `perry-transform` | IR 处理流程：函数内联、闭包转换、异步降阶 |
| `perry-codegen-llvm` | 基于 LLVM 的原生代码生成 |
| `perry-codegen-wasm` | 面向 `--target web` / `--target wasm` 的 WebAssembly 代码生成（HIR → WASM 字节码 + JS 桥接层） |
| `perry-codegen-js` | 遗留的 JavaScript 代码生成器（仍用于 JS 压缩器；面向 `--target web` 的 JS 代码生成路径已整合至 `perry-codegen-wasm`） |
| `perry-codegen-swiftui` | 用于 WidgetKit 扩展的 SwiftUI 代码生成 |
| `perry-runtime` | 运行时库：NaN 装箱值、垃圾回收（GC）、内存池分配器、对象、数组、字符串 |
| `perry-stdlib` | Node.js API 实现：mysql2、redis、fastify、bcrypt 等 |
| `perry-ui` | 共享 UI 类型定义 |
| `perry-ui-macos` | macOS 界面（AppKit） |
| `perry-ui-ios` | iOS 界面（UIKit） |
| `perry-jsruntime` | 通过 QuickJS 实现的 JavaScript 互操作 |

## 核心概念

### NaN 装箱

所有 JavaScript 值均以 64 位 NaN 装箱值表示。高 16 位用于编码类型标签：

| 标签值 | 类型 |
|--------|------|
| `0x7FFF` | 字符串（低 48 位 = 指针） |
| `0x7FFD` | 指针/对象（低 48 位 = 指针） |
| `0x7FFE` | 32 位整数（低 32 位 = 整数值） |
| `0x7FFA` | 大整数（低 48 位 = 指针） |
| 特殊常量 | undefined、null、true、false |
| 其他值 | 64 位浮点数（完整 64 位存储） |

### 垃圾回收

采用保守式栈扫描的标记-清除垃圾回收机制。内存池分配的对象（数组、普通对象）通过线性块遍历查找；内存分配函数（malloc）分配的对象（字符串、闭包、Promise）在线程本地的 Vec 中跟踪。

### 基于句柄的界面系统

UI 组件以小整数句柄表示，句柄通过 `POINTER_TAG` 进行 NaN 装箱。每个句柄映射到原生平台组件（NSButton、UILabel、GtkButton 等）。两套分发表将方法调用和属性访问路由至对应的外部函数接口（FFI）函数。

## 源代码组织

代码生成 crate 按功能模块划分：

```
perry-codegen-llvm/src/
  codegen.rs       # 主入口，模块编译逻辑
  types.rs         # 类型定义、上下文结构体
  util.rs          # 辅助函数
  stubs.rs         # 未解析依赖的桩代码生成
  runtime_decls.rs # 运行时函数声明
  classes.rs       # 类编译逻辑
  functions.rs     # 函数编译逻辑
  closures.rs      # 闭包编译逻辑
  module_init.rs   # 模块初始化逻辑
  stmt.rs          # 语句编译逻辑
  expr.rs          # 表达式编译逻辑
```

HIR 降阶处理拆分为 8 个模块：

```
perry-hir/src/
  lower.rs           # 降阶处理主入口
  analysis.rs        # 代码分析流程
  enums.rs           # 枚举类型降阶
  jsx.rs             # JSX 语法降阶
  lower_types.rs     # 类型降阶
  lower_patterns.rs  # 模式匹配降阶
  destructuring.rs   # 解构语法降阶
  lower_decl.rs      # 声明语句降阶
```

## 后续参考

- [从源码构建](building)
- 详见仓库根目录下的 `CLAUDE.md` 文件，获取详细的实现说明