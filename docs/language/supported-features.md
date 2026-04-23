# 支持的 TypeScript 特性
Perry 会将 TypeScript 的实用子集编译为原生代码。本文档列出当前支持的所有特性。

## 原始类型
```typescript
const n: number = 42;
const s: string = "hello";
const b: boolean = true;
const u: undefined = undefined;
const nl: null = null;
```
所有原始类型在运行时均以 **64 位 NaN 装箱值** 表示。

## 变量与常量
```typescript
let x = 10;
const y = "immutable";
var z = true; // 支持 var，但推荐使用 let/const
```
Perry 会从初始化表达式自动推导类型 —— `let x = 5` 无需显式注解即可被推断为 `number`。

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
支持的类特性：
- 构造函数
- 实例方法 / 静态方法
- 实例属性 / 静态属性
- 继承（`extends`）
- 方法重写
- `instanceof` 判断（基于类 ID 链）
- 单例模式（静态方法返回值类型推导）

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
枚举会被编译为常量，支持跨模块使用。

## 接口与类型别名
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
接口与类型别名会在编译时被擦除（与 `tsc` 一致），仅用于文档与编辑器工具提示。

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

// for...of 遍历
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

// Object.keys / values / entries
const keys = Object.keys(obj);
const values = Object.values(obj);
const entries = Object.entries(obj);

// 展开
const copy = { ...obj, extra: true };

// 删除属性
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

## 模板字符串
```typescript
const name = "world";
const greeting = `Hello, ${name}!`;
const multiline = `
  Line 1
  Line 2
`;
const expr = `Result: ${1 + 2}`;
```

## 展开与剩余
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
Perry 会执行**闭包转换**，被捕获的变量会存储在堆分配的闭包对象中。

## 异步/等待
```typescript
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return await response.json();
}

// 顶层 await
const data = await fetchUser(1);
```
Perry 将异步函数编译为基于 Tokio 异步运行时的状态机。

## Promise
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

## Map 与 Set
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

## typeof 与 instanceof
```typescript
if (typeof x === "string") {
  console.log(x.length);
}

if (obj instanceof Dog) {
  obj.speak();
}
```
`typeof` 在运行时检查 NaN 装箱标签；`instanceof` 遍历类 ID 链进行判断。

## 模块
```typescript
// 具名导出
export function helper() { /* ... */ }
export const VALUE = 42;

// 默认导出
export default class MyClass { /* ... */ }

// 导入
import MyClass, { helper, VALUE } from "./module";
import * as utils from "./utils";

// 重导出
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

## 控制台
```typescript
console.log("message");
console.error("error");
console.warn("warning");
console.time("label");
console.timeEnd("label");
```

## 垃圾回收
Perry 内置**标记-清除垃圾回收器**。检测到内存压力（约 8MB 内存块）时自动触发，也可手动调用：
```typescript
gc(); // 显式垃圾回收
```
GC 使用**保守式栈扫描**寻找根对象，支持内存池分配对象（数组、对象）与 malloc 分配对象（字符串、闭包、Promise、BigInt、错误对象）。

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
JSX 元素会通过 `jsx()`/`jsxs()` 运行时转换为函数调用。

---

## 后续参考
- [类型系统](type-system) — 类型推导与检查
- [局限性](limitations) — 暂不支持的特性

