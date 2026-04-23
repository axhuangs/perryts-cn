# 类型系统
Perry 在编译时会擦除类型，行为与 `tsc` 编译输出 JavaScript 时移除类型注解类似。但 Perry 会同时进行类型推断，以生成高效的原生代码。

## 类型推断
Perry 可从表达式自动推断类型，无需显式注解：
```typescript
let x = 5;           // 推断为 number
let s = "hello";     // 推断为 string
let b = true;        // 推断为 boolean
let arr = [1, 2, 3]; // 推断为 number[]
```
推断依据包括：
- **字面量值**：`5` → `number`，`"hi"` → `string`
- **二元运算**：`a + b` 若均为数字 → `number`
- **变量传播**：若 `x` 为 `number`，则 `let y = x` 为 `number`
- **方法返回值**：`"hello".trim()` → `string`，`[1,2].length` → `number`
- **函数返回值**：自定义函数返回类型会传播至调用处

```typescript
function double(n: number): number {
  return n * 2;
}
let result = double(5); // 推断为 number
```

## 类型注解
标准 TypeScript 注解均可正常使用：
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

## 工具类型
常用 TypeScript 工具类型会在编译时被擦除，不影响代码生成：
```typescript
type Partial<T> = { [P in keyof T]?: T[P] };
type Pick<T, K> = { [P in K]: T[P] };
type Record<K, V> = { [P in K]: V };
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type ReturnType<T> = /* ... */;
type Readonly<T> = { readonly [P in keyof T]: T[P] };
```
这些类型会被识别并擦除，不会引发编译错误。

## 泛型
泛型类型参数会被擦除：
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
运行时所有值均以 NaN 装箱形式存储，泛型参数不影响代码生成。

## 使用 `--type-check` 进行类型检查
如需更严格的类型检查，Perry 可集成微软官方 TypeScript 检查器：
```bash
perry file.ts --type-check
```
该模式通过 IPC 协议解析跨文件类型、接口与泛型。若未安装类型检查器，会自动优雅降级。
未启用 `--type-check` 时，Perry 使用内置推断引擎，可处理常见模式，但不执行完整 TypeScript 类型检查。

## 联合类型与交叉类型
联合类型仅在语法层面被识别，不影响代码生成：
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
可使用 `typeof` 判断实现运行时类型收窄。

## 类型守卫
```typescript
function isString(value: any): value is string {
  return typeof value === "string";
}
if (isString(x)) {
  console.log(x.toUpperCase());
}
```
`value is string` 注解会被擦除，但 `typeof` 判断在运行时有效。

---

## 后续参考
- [支持特性](supported-features) — 完整特性清单
- [限制说明](limitations) — 暂不支持的内容

---

## 翻译说明

1. 术语统一
   - Type erasure → 类型擦除
   - Type inference → 类型推断
   - Type annotation → 类型注解
   - Utility types → 工具类型
   - Generics → 泛型
   - Union types → 联合类型
   - Intersection types → 交叉类型
   - Type guard → 类型守卫
   - Type narrowing → 类型收窄
   - NaN-boxed → NaN 装箱
2. 技术措辞
   - 采用编译器与前端领域标准中文表述
   - 句式简洁严谨，符合技术文档风格
3. 文化适配
   - IPC protocol → 进程间通信协议
   - Fall back gracefully → 自动优雅降级
