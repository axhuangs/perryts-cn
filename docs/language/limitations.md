# 限制

Perry 编译 TypeScript 的实用子集。本页记录了不支持的内容或与 Node.js/tsc 不同的内容。

## 无运行时类型检查

类型在编译时被擦除。没有运行时类型系统 — Perry 不生成类型守卫或运行时类型元数据。

```typescript
// 这些注解被擦除 — 无运行时效果
const x: number = someFunction(); // 没有运行时检查结果实际上是数字
```

在需要运行时类型区分的地方使用显式的 `typeof` 检查。

## 无 eval() 或动态代码

Perry 提前编译为原生代码。动态代码执行是不可能的：

```typescript
// 不支持
eval("console.log('hi')");
new Function("return 42");
```

## 无装饰器

TypeScript 装饰器目前不支持：

```typescript
// 不支持
@Component
class MyClass {}
```

## 无反射

没有 `Reflect` API 或运行时类型元数据：

```typescript
// 不支持
Reflect.getMetadata("design:type", target, key);
```

## 无动态 require()

仅支持静态导入：

```typescript
// 支持
import { foo } from "./module";

// 不支持
const mod = require("./module");
const mod = await import("./module");
```

## 无原型操作

Perry 将类编译为固定结构。不支持动态原型修改：

```typescript
// 不支持
MyClass.prototype.newMethod = function() {};
Object.setPrototypeOf(obj, proto);
```

## 无 Symbol 类型

`Symbol` 原始类型目前不支持：

```typescript
// 不支持
const sym = Symbol("description");
```

## 无 WeakMap/WeakRef

弱引用未实现：

```typescript
// 不支持
const wm = new WeakMap();
const wr = new WeakRef(obj);
```

## 无 Proxy

`Proxy` 对象不支持：

```typescript
// 不支持
const proxy = new Proxy(target, handler);
```

## 有限的错误类型

`Error` 和基本的 `throw`/`catch` 工作，但自定义错误子类有有限支持：

```typescript
// 工作
throw new Error("message");

// 有限
class CustomError extends Error {
  code: number;
  constructor(msg: string, code: number) {
    super(msg);
    this.code = code;
  }
}
```

## 线程模型

Perry 通过 `perry/thread` 的 `parallelMap` 和 `spawn` 支持真正的多线程。请参阅[多线程](../threading/overview.md)。

线程不共享可变状态 — 传递给线程原语的闭包不能捕获可变变量（在编译时强制）。值在线程边界间深度复制。没有 `SharedArrayBuffer` 或 `Atomics`。

## 无计算属性名称

对象字面量中的动态属性键有限：

```typescript
// 支持
const key = "name";
obj[key] = "value";

// 不支持
const obj = { [key]: "value" };
```

## npm 包兼容性

并非所有 npm 包都与 Perry 工作：

- **原生支持**：~50 个流行包（fastify、mysql2、redis 等） — 这些原生编译。请参阅[标准库](../stdlib/overview.md)。
- **`compilePackages`**：纯 TS/JS 包可以通过[配置](../getting-started/project-config.md)原生编译。
- **不支持**：需要原生插件（`.node` 文件）、`eval()`、动态 `require()` 或 Node.js 内部的包。

## 变通方法

### 动态行为

对于需要动态行为的情况，使用 JavaScript 运行时回退：

```typescript
import { jsEval } from "perry/jsruntime";
// 将特定代码通过 QuickJS 路由以进行动态评估
```

### 类型缩小

由于没有运行时类型检查，使用显式检查：

```typescript
// 而不是依赖于泛型的类型缩小
if (typeof value === "string") {
  // 字符串路径
} else if (typeof value === "number") {
  // 数字路径
}
```

## 下一步

- [支持的功能](supported-features.md) — 什么有效
- [类型系统](type-system.md) — 类型如何处理