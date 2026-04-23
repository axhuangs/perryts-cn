# 你好，世界

## 你的第一个程序

创建一个名为 `hello.ts` 的文件：

```typescript
console.log("Hello, Perry!");
```

编译并运行该程序：

```bash
perry hello.ts -o hello
./hello
```

输出结果：

```
Hello, Perry!
```

操作完成。Perry 已将你的 TypeScript 代码编译为原生可执行文件 —— 无需 Node.js 运行时、无需打包工具、无需任何运行时依赖。

## 一个稍复杂的示例

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

该程序的运行速度比 Node.js 快约两倍，这是因为 Perry 会通过整数特化将代码编译为原生机器码。

## 变量与函数的使用

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

Perry 会将 async/await 语法编译为基于 Tokio 运行时的原生异步运行环境。

## 多线程

Perry 能够实现 JavaScript 运行时无法做到的功能 —— 让你的代码在多个 CPU 核心上运行：

```typescript
import { parallelMap, parallelFilter, spawn } from "perry/thread";

const data = [1, 2, 3, 4, 5, 6, 7, 8];

// 跨所有 CPU 核心处理所有元素
const doubled = parallelMap(data, (x) => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10, 12, 14, 16]

// 在后台执行高负载任务
const result = await spawn(() => {
  let sum = 0;
  for (let i = 0; i < 100_000_000; i++) sum += i;
  return sum;
});
console.log(result);
```

这是真正的操作系统级并行处理，而非 Web Worker 或独立隔离环境。详情请参阅 [多线程](../threading/overview.md) 章节。

## 编译器输出产物

当你执行 `perry file.ts -o output` 命令时，Perry 会执行以下步骤：

1. 使用 SWC 解析 TypeScript 代码
2. 将抽象语法树（AST）降级为高层中间表示（HIR）
3. 应用优化策略（内联、闭包转换等）
4. 通过 LLVM 生成原生机器码
5. 与系统的 C 编译器进行链接

最终生成的是一个无外部依赖的独立可执行文件。

### 二进制文件大小

| 程序类型       | 二进制文件大小 |
|----------------|----------------|
| 入门示例（Hello World） | ~300KB         |
| 包含文件系统/路径处理的命令行工具 | ~3MB      |
| 界面应用程序   | ~3MB           |
| 包含标准库的完整应用 | ~48MB        |

Perry 会自动检测你使用的运行时功能，并仅链接所需的依赖项。

## 后续参考

- [构建原生界面应用](first-app.md)
- [配置你的项目](project-config.md)
- [探索支持的 TypeScript 特性](../language/supported-features.md)

