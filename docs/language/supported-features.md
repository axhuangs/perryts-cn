# 支持的 TypeScript 功能

Perry 将 TypeScript 的实用子集编译为原生代码。本页列出了支持的内容。

## 原始类型

```typescript
const n: number = 42;
const s: string = "hello";
const b: boolean = true;
const u: undefined = undefined;
const nl: null = null;
```

所有原始类型在运行时表示为 64 位 NaN-boxed 值。

## 变量和常量

```typescript
let x = 10;
const y = "immutable";
var z = true; // var 支持但首选 let/const
```

Perry 从初始化器推断类型 — `let x = 5` 被推断为 `number`，无需显式注解。

## 函数

```typescript
function add(a: number, b: number): number {
  return a + b;
}

// 可选参数
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

// 剩余参数
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// 箭头函数
const double = (x: number) => x * 2;
```

## 类

```typescript
class Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  speak(): string {
    return `${this.name} makes a noise`;
  }
}

class Dog extends Animal {
  speak(): string {
    return `${this.name} barks`;
  }
}

// 静态方法
class Counter {
  private static instance: Counter;
  private count: number = 0;

  static getInstance(): Counter {
    if (!Counter.instance) {
      Counter.instance = new Counter();
    }
    return Counter.instance;
  }
}
```

支持的类功能：
- 构造函数
- 实例和静态方法
- 实例和静态属性
- 继承 (`extends`)
- 方法覆盖
- `instanceof` 检查（通过类 ID 链）
- 单例模式（静态方法返回类型推断）

## 枚举

```typescript
// 数字枚举
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

// 字符串枚举
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

const dir = Direction.Up;
const color = Color.Red;
```

枚举被编译为常量，并在模块间工作。

## 接口和类型别名

```typescript
interface User {
  name: string;
  age: number;
  email?: string;
}

type Point = { x: number; y: number };
type StringOrNumber = string | number;
type Callback = (value: number) => void;
```

接口和类型别名在编译时被擦除（像 `tsc`）。它们仅用于文档和编辑器工具。

## 数组

```typescript
const nums: number[] = [1, 2, 3];

// 数组方法
nums.push(4);
nums.pop();
const len = nums.length;
const doubled = nums.map((x) => x * 2);
const filtered = nums.filter((x) => x > 2);
const sum = nums.reduce((acc, x) => acc + x, 0);
const found = nums.find((x) => x === 3);
const idx = nums.indexOf(3);
const joined = nums.join(", ");
const sliced = nums.slice(1, 3);
nums.splice(1, 1);
nums.unshift(0);
const sorted = nums.sort((a, b) => a - b);
const reversed = nums.reverse();
const includes = nums.includes(3);
const every = nums.every((x) => x > 0);
const some = nums.some((x) => x > 2);
nums.forEach((x) => console.log(x));
const flat = [[1, 2], [3]].flat();
const concatted = nums.concat([5, 6]);

// Array.from
const arr = Array.from(someIterable);

// Array.isArray
if (Array.isArray(value)) { /* ... */ }

// for...of 迭代
for (const item of nums) {
  console.log(item);
}
```

## 对象

```typescript
const obj = { name: "Perry", version: 1 };
obj.name = "Perry 2";

// 动态属性访问
const key = "name";
const val = obj[key];

// Object.keys, Object.values, Object.entries
const keys = Object.keys(obj);
const values = Object.values(obj);
const entries = Object.entries(obj);

// 展开
const copy = { ...obj, extra: true };

// delete
delete obj[key];
```

## 解构

```typescript
// 数组解构
const [a, b, ...rest] = [1, 2, 3, 4, 5];

// 对象解构
const { name, age, email = "none" } = user;

// 重命名
const { name: userName } = user;

// 剩余模式
const { id, ...remaining } = obj;

// 函数参数解构
function process({ name, age }: User) {
  console.log(name, age);
}
```

## 模板字面量

```typescript
const name = "world";
const greeting = `Hello, ${name}!`;
const multiline = `
  Line 1
  Line 2
`;
const expr = `Result: ${1 + 2}`;
```

## 展开和剩余

```typescript
// 数组展开
const combined = [...arr1, ...arr2];

// 对象展开
const merged = { ...defaults, ...overrides };

// 剩余参数
function log(...args: any[]) { /* ... */ }
```

## 闭包

```typescript
function makeCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    get: () => count,
  };
}

const counter = makeCounter();
counter.increment();
console.log(counter.get()); // 1
```

Perry 执行闭包转换 — 捕获的变量存储在堆分配的闭包对象中。

## Async/Await

```typescript
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return await response.json();
}

// 顶级 await
const data = await fetchUser(1);
```

Perry 将异步函数编译为由 Tokio 的异步运行时支持的状态机。

## Promises

```typescript
const p = new Promise<number>((resolve, reject) => {
  resolve(42);
});

p.then((value) => console.log(value));

// Promise.all
const results = await Promise.all([fetch(url1), fetch(url2)]);
```

## 生成器

```typescript
function* range(start: number, end: number) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

for (const n of range(0, 10)) {
  console.log(n);
}
```

## Map 和 Set

```typescript
const map = new Map<string, number>();
map.set("a", 1);
map.get("a");
map.has("a");
map.delete("a");
map.size;

const set = new Set<number>();
set.add(1);
set.has(1);
set.delete(1);
set.size;
```

## 正则表达式

```typescript
const re = /hello\s+(\w+)/;
const match = "hello world".match(re);

if (re.test("hello perry")) {
  console.log("Matched!");
}

const replaced = "hello world".replace(/world/, "perry");
```

## 错误处理

```typescript
try {
  throw new Error("something went wrong");
} catch (e) {
  console.log(e.message);
} finally {
  console.log("cleanup");
}
```

## JSON

```typescript
const obj = JSON.parse('{"key": "value"}');
const str = JSON.stringify(obj);
const pretty = JSON.stringify(obj, null, 2);
```

## typeof 和 instanceof

```typescript
if (typeof x === "string") {
  console.log(x.length);
}

if (obj instanceof Dog) {
  obj.speak();
}
```

`typeof` 在运行时检查 NaN-boxing 标签。`instanceof` 遍历类 ID 链。

## 模块

```typescript
// 命名导出
export function helper() { /* ... */ }
export const VALUE = 42;

// 默认导出
export default class MyClass { /* ... */ }

// 导入
import MyClass, { helper, VALUE } from "./module";
import * as utils from "./utils";

// 重新导出
export { helper } from "./module";
```

## BigInt

```typescript
const big = BigInt(9007199254740991);
const result = big + BigInt(1);

// 位运算
const and = big & BigInt(0xFF);
const or = big | BigInt(0xFF);
const xor = big ^ BigInt(0xFF);
const shl = big << BigInt(2);
const shr = big >> BigInt(2);
const not = ~big;
```

## 字符串方法

```typescript
const s = "Hello, World!";
s.length;
s.toUpperCase();
s.toLowerCase();
s.trim();
s.split(", ");
s.includes("World");
s.startsWith("Hello");
s.endsWith("!");
s.indexOf("World");
s.slice(0, 5);
s.substring(0, 5);
s.replace("World", "Perry");
s.repeat(3);
s.charAt(0);
s.padStart(20);
s.padEnd(20);
```

## Math

```typescript
Math.floor(3.7);
Math.ceil(3.2);
Math.round(3.5);
Math.abs(-5);
Math.max(1, 2, 3);
Math.min(1, 2, 3);
Math.sqrt(16);
Math.pow(2, 10);
Math.random();
Math.PI;
Math.E;
Math.log(10);
Math.sin(0);
Math.cos(0);
```

## Date

```typescript
const now = Date.now();
const d = new Date();
d.getTime();
d.toISOString();
```

## Console

```typescript
console.log("message");
console.error("error");
console.warn("warning");
console.time("label");
console.timeEnd("label");
```

## 垃圾回收

Perry 包含一个标记-清除垃圾回收器。当检测到内存压力时（~8MB 竞技场块），它会自动运行，但您也可以手动触发：

```typescript
gc(); // 显式垃圾回收
```

GC 使用保守的栈扫描来查找根，并支持竞技场分配的对象（数组、对象）和 malloc 分配的对象（字符串、闭包、promises、BigInts、错误）。

## JSX/TSX

Perry 支持 JSX 语法用于 UI 组件组合：

```typescript
// 组件函数
function Greeting({ name }: { name: string }) {
  return <Text>{`Hello, ${name}!`}</Text>;
}

// JSX 元素
<Button onClick={() => console.log("clicked")}>Click me</Button>

// 片段
<>
  <Text>Line 1</Text>
  <Text>Line 2</Text>
</>

// 展开属性
<Component {...props} extra="value" />

// 条件渲染
{condition ? <Text>Yes</Text> : <Text>No</Text>}
```

JSX 元素通过 `jsx()`/`jsxs()` 运行时转换为函数调用。

## 下一步

- [类型系统](type-system.md) — 类型推断和检查
- [限制](limitations.md) — 尚未支持的内容