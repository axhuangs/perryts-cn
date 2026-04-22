# 类型系统

Perry 在编译时擦除类型，类似于 `tsc` 在发出 JavaScript 时如何移除类型注解。然而，Perry 也执行类型推断以生成高效的原生代码。

## 类型推断

Perry 从表达式推断类型，无需注解：

```typescript
let x = 5;           // 推断为 number
let s = "hello";     // 推断为 string
let b = true;        // 推断为 boolean
let arr = [1, 2, 3]; // 推断为 number[]
```

推断通过以下方式工作：
- **字面值**：`5` → `number`，`"hi"` → `string`
- **二元操作**：`a + b` 其中两者都是数字 → `number`
- **变量传播**：如果 `x` 是 `number`，则 `let y = x` 是 `number`
- **方法返回**：`"hello".trim()` → `string`，`[1,2].length` → `number`
- **函数返回**：用户定义的函数返回类型传播到调用者

```typescript
function double(n: number): number {
  return n * 2;
}
let result = double(5); // 推断为 number
```

## 类型注解

标准的 TypeScript 注解工作：

```typescript
let name: string = "Perry";
let count: number = 0;
let items: string[] = [];

function greet(name: string): string {
  return `Hello, ${name}`;
}

interface Config {
  port: number;
  host: string;
}
```

## 实用类型

常见的 TypeScript 实用类型在编译时被擦除（它们不影响代码生成）：

```typescript
type Partial<T> = { [P in keyof T]?: T[P] };
type Pick<T, K> = { [P in K]: T[P] };
type Record<K, V> = { [P in K]: V };
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type ReturnType<T> = /* ... */;
type Readonly<T> = { readonly [P in keyof T]: T[P] };
```

这些都被识别并擦除 — 它们不会导致编译错误。

## 泛型

泛型类型参数被擦除：

```typescript
function identity<T>(value: T): T {
  return value;
}

class Box<T> {
  value: T;
  constructor(value: T) {
    this.value = value;
  }
}

const box = new Box<number>(42);
```

在运行时，所有值都是 NaN-boxed — 泛型参数不影响代码生成。

## 使用 `--type-check` 的类型检查

为了更严格的类型检查，Perry 可以与 Microsoft 的 TypeScript 检查器集成：

```bash
perry file.ts --type-check
```

这通过 IPC 协议解析跨文件类型、接口和泛型。如果类型检查器未安装，它会优雅地回退。

没有 `--type-check`，Perry 依赖自己的推断引擎，它处理常见模式但不执行完整的 TypeScript 类型检查。

## 联合和交集类型

联合类型在语法上被识别但不影响代码生成：

```typescript
type StringOrNumber = string | number;

function process(value: StringOrNumber) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else {
    console.log(value + 1);
  }
}
```

使用 `typeof` 检查进行运行时类型缩小。

## 类型守卫

```typescript
function isString(value: any): value is string {
  return typeof value === "string";
}

if (isString(x)) {
  console.log(x.toUpperCase());
}
```

`value is string` 注解被擦除，但 `typeof` 检查在运行时工作。

## 下一步

- [支持的功能](supported-features.md) — 完整功能列表
- [限制](limitations.md) — 不支持的内容