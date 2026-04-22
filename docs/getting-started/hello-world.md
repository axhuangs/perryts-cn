# Hello World

## 您的第一个程序

创建一个名为 `hello.ts` 的文件：

```typescript
console.log("Hello, Perry!");
```

编译并运行它：

```bash
perry hello.ts -o hello
./hello
```

输出：

```
Hello, Perry!
```

就是这样。Perry 将您的 TypeScript 编译为原生可执行文件 — 没有 Node.js，没有打包器，没有运行时。

## 一个稍微大一点的示例

```typescript
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const start = Date.now();
const result = fibonacci(40);
const elapsed = Date.now() - start;

console.log(`fibonacci(40) = ${result}`);
console.log(`Completed in ${elapsed}ms`);
```

```bash
perry fib.ts -o fib
./fib
```

这比 Node.js 快约 2 倍，因为 Perry 编译为具有整数特殊化的原生机器代码。

## 使用变量和函数

```typescript
const name: string = "World";
const items: number[] = [1, 2, 3, 4, 5];

const doubled = items.map((x) => x * 2);
const sum = doubled.reduce((acc, x) => acc + x, 0);

console.log(`Hello, ${name}!`);
console.log(`Sum of doubled: ${sum}`);
```

## 异步代码

```typescript
async function fetchData(): Promise<string> {
  const response = await fetch("https://httpbin.org/get");
  const data = await response.json();
  return data.origin;
}

const ip = await fetchData();
console.log(`Your IP: ${ip}`);
```

```bash
perry fetch.ts -o fetch
./fetch
```

Perry 将 async/await 编译为由 Tokio 支持的原生异步运行时。

## 多线程

Perry 可以做 JavaScript 运行时无法做到的事情 — 在多个 CPU 核心上运行您的代码：

```typescript
import { parallelMap, parallelFilter, spawn } from "perry/thread";

const data = [1, 2, 3, 4, 5, 6, 7, 8];

// 在所有 CPU 核心上处理所有元素
const doubled = parallelMap(data, (x) => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10, 12, 14, 16]

// 在后台运行繁重工作
const result = await spawn(() => {
  let sum = 0;
  for (let i = 0; i < 100_000_000; i++) sum += i;
  return sum;
});