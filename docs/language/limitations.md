# 局限性
Perry 编译器支持 TypeScript 语言的一个实用子集。本文档说明其不支持的功能，以及与 Node.js/tsc 存在差异的功能点。

## 无运行时类型检查
类型信息会在编译阶段被擦除。Perry 没有运行时类型系统——不会生成类型守卫（type guards）或运行时类型元数据。

```typescript
// 这些类型注解会被擦除——无任何运行时作用
const x: number = someFunction(); // 不会在运行时检查返回值是否为数字类型
```

若需要在运行时区分类型，请显式使用 `typeof` 检查。

## 不支持 eval() 或动态代码执行
Perry 采用提前编译（AOT）方式编译为原生代码，因此无法支持动态代码执行：

```typescript
// 不支持
eval("console.log('hi')");
new Function("return 42");
```

## 不支持装饰器
暂不支持 TypeScript 装饰器语法：

```typescript
// 不支持
@Component
class MyClass {}
```

## 无反射功能
不提供 `Reflect` API 或运行时类型元数据：

```typescript
// 不支持
Reflect.getMetadata("design:type", target, key);
```

## 不支持动态 require()
仅支持静态导入语法：

```typescript
// 支持
import { foo } from "./module";

// 不支持
const mod = require("./module");
const mod = await import("./module");
```

## 不支持原型操作
Perry 会将类编译为固定结构，不支持动态修改原型：

```typescript
// 不支持
MyClass.prototype.newMethod = function() {};
Object.setPrototypeOf(obj, proto);
```

## 不支持 Symbol 类型
暂不支持 `Symbol` 原始类型：

```typescript
// 不支持
const sym = Symbol("description");
```

## 不支持 WeakMap/WeakRef
未实现弱引用相关功能：

```typescript
// 不支持
const wm = new WeakMap();
const wr = new WeakRef(obj);
```

## 不支持 Proxy
不支持 `Proxy` 对象：

```typescript
// 不支持
const proxy = new Proxy(target, handler);
```

## 有限的错误类型支持
`Error` 基础类型及 `throw`/`catch` 语法可正常使用，但自定义错误子类的支持有限：

```typescript
// 可正常工作
throw new Error("message");

// 支持有限
class CustomError extends Error {
  code: number;
  constructor(msg: string, code: number) {
    super(msg);
    this.code = code;
  }
}
```

## 线程模型
Perry 可通过 `perry/thread` 模块提供的 `parallelMap` 和 `spawn` 实现真正的多线程能力。详见[多线程](../threading/overview.md)章节。

线程间不共享可变状态——传递给线程原语的闭包无法捕获可变变量（编译阶段会强制校验）。数据会通过深拷贝的方式跨线程传递。暂不支持 `SharedArrayBuffer` 或 `Atomics`。

## 不支持计算属性名
对象字面量中的动态属性键支持有限：

```typescript
// 支持
const key = "name";
obj[key] = "value";

// 不支持
const obj = { [key]: "value" };
```

## npm 包兼容性
并非所有 npm 包都能与 Perry 兼容：
- **原生支持**：约 50 个主流包（fastify、mysql2、redis 等）——这些包会被编译为原生代码。详见[标准库](../stdlib/overview.md)。
- **`compilePackages` 编译**：纯 TS/JS 包可通过[配置项](../getting-started/project-config.md)编译为原生代码。
- **不支持**：依赖原生扩展（`.node` 文件）、`eval()`、动态 `require()` 或 Node.js 内部API的包。

## 替代方案

### 动态行为实现
若需实现动态行为，可使用 JavaScript 运行时降级方案：

```typescript
import { jsEval } from "perry/jsruntime";
// 将指定代码路由至 QuickJS 引擎执行动态求值
```

### 类型收窄
由于无运行时类型检查，需显式编写类型检查逻辑：

```typescript
// 不要依赖泛型自动实现类型收窄，而是显式检查
if (typeof value === "string") {
  // 字符串分支逻辑
} else if (typeof value === "number") {
  // 数字分支逻辑
}
```

## 后续参考
- [支持的功能](supported-features.md)——已实现的功能清单
- [类型系统](type-system.md)——类型处理机制说明