# 多线程

Perry 为您提供真正的操作系统线程，只需一行 API。没有工作线程设置，没有消息端口，没有结构化克隆开销。只需 `parallelMap`、`parallelFilter` 和 `spawn`。

```typescript
import { parallelMap, parallelFilter, spawn } from "perry/thread";

// 在所有 CPU 核心上处理一百万个项目
const results = parallelMap(data, (item) => heavyComputation(item));

// 并行过滤大数据集
const valid = parallelFilter(records, (r) => r.score > threshold);

// 在后台运行昂贵的工作
const answer = await spawn(() => computeHash(largeFile));
```

这是 **没有 JavaScript 运行时可以做到的**。V8、Bun 和 Deno 都锁定在一个隔离中的一个线程。Perry 编译为原生代码 — 没有隔离，没有 GIL，没有结构限制。您的代码在真正的操作系统线程上运行，具有每个 CPU 核心的全部功率。

## 为什么这很重要

JavaScript 的单线程模型是其最大的性能瓶颈。以下是运行时如何尝试解决这个问题：

| 运行时 | "多线程" | 现实 |
|---------|-------------------|---------|
| **Node.js** | `worker_threads` | 单独的 V8 隔离。通过结构化克隆复制数据。每工作线程 ~2MB RAM。复杂的 API。 |
| **Deno** | `Worker` | 与 Node 相同 — 隔离堆，仅消息传递。 |
| **Bun** | `Worker` | 相同架构。更快的结构化克隆，仍隔离。 |
| **Perry** | `parallelMap` / `spawn` | 真正的操作系统线程。轻量级 (8MB 栈)。一行 API。编译时安全。 |

根本问题：V8 使用垃圾回收堆，**不能在线程之间共享**。每个 "工作线程" 是一个完全独立的 JavaScript 引擎实例，具有自己的堆、自己的 GC 和您的数据副本。

Perry 没有这个限制。它将 TypeScript 编译为原生机器代码。值使用数字的零成本复制和对象的有效序列化在线程之间传输 — 没有单独的引擎实例，没有每个线程的多兆字节开销。

## 三个原语

### `parallelMap` — 数据并行处理

将数组拆分到所有 CPU 核心。每个元素独立处理。结果按顺序收集。

```typescript
import { parallelMap } from "perry/thread";

const prices = [100, 200, 300, 400, 500, 600, 700, 800];
const adjusted = parallelMap(prices, (price) => {
    // 重计算在工作线程上运行
    let result = price;
    for (let i = 0; i < 1000000; i++) {
        result = Math.sqrt(result * result + i);
    }
    return result;
});
```

Perry 自动：
1. 检测 CPU 核心数量
2. 将数组拆分为块 (每个核心一个)
3. 生成操作系统线程来处理每个块
4. 按原始顺序收集结果
5. 返回新数组

对于小数组，Perry 完全跳过线程并内联处理 — 对于琐碎情况没有开销。

### `parallelFilter` — 数据并行过滤

跨所有 CPU 核心过滤大数组。像 `.filter()` 但并行：

```typescript
import { parallelFilter } from "perry/thread";

const users = getMillionUsers();

// 跨所有核心过滤 — 顺序保留
const active = parallelFilter(users, (user) => {
    return user.lastLogin > cutoffDate && user.score > 100;
});
```

与 `parallelMap` 相同的规则：闭包不能捕获可变变量 (编译时强制)，值在线程之间深拷贝。

### `spawn` — 后台线程

在后台运行任何计算并返回 Promise。主要线程立即继续。

```typescript
import { spawn } from "perry/thread";

// 在后台开始重工作
const handle = spawn(() => {
    let sum = 0;
    for (let i = 0; i < 100_000_000; i++) {
        sum += Math.sin(i);
    }
    return sum;
});

// 主要线程继续运行 — UI 保持响应
console.log("Computing...");

// 当您需要时获取结果
const result = await handle;
console.log("Done:", result);
```

`spawn` 返回标准 Promise。您可以 `await` 它，传递给 `Promise.all`，或链式 `.then()` — 它完全像任何其他异步操作一样工作。

## 实际示例

### 并行图像处理

```typescript
import { parallelMap } from "perry/thread";

// 每个像素在单独的核心上处理
const processed = parallelMap(pixels, (pixel) => {
    const r = Math.min(255, pixel.r * 1.2);
    const g = Math.min(255, pixel.g * 0.8);
    const b = Math.min(255, pixel.b * 1.1);
    return { r, g, b };
});
```

### 并行加密哈希

```typescript
import { parallelMap } from "perry/thread";

// 跨所有核心哈希数千个项目
const passwords = ["pass1", "pass2", "pass3", /* ... thousands more */];
const hashed = parallelMap(passwords, (password) => {
    return computeHash(password);
});
```

### 多个独立计算

```typescript
import { spawn } from "perry/thread";

// 三个独立任务同时在三个操作系统线程上运行
const task1 = spawn(() => analyzeDataset(dataA));
const task2 = spawn(() => analyzeDataset(dataB));
const task3 = spawn(() => analyzeDataset(dataC));

// 所有三个并发运行
const [result1, result2, result3] = await Promise.all([task1, task2, task3]);
```

### 保持 UI 响应

```typescript
import { spawn } from "perry/thread";
import { Text, Button } from "perry/ui";

let statusText = "Ready";

Button("Start Analysis", async () => {
    statusText = "Analyzing...";

    // 重计算在后台线程上运行
    // UI 保持响应 — 用户仍可以交互
    const result = await spawn(() => {
        return runExpensiveAnalysis(data);
    });

    statusText = `Done: ${result}`;
});

Text(statusText);
```

### 捕获变量

闭包可以捕获外部变量。捕获的值自动深拷贝到每个工作线程：

```typescript
import { parallelMap } from "perry/thread";

const taxRate = 0.08;
const discount = 0.15;

// taxRate 和 discount 被捕获并拷贝到每个线程
const finalPrices = parallelMap(prices, (price) => {
    const discounted = price * (1 - discount);
    return discounted * (1 + taxRate);
});
```

数字和布尔值是零成本拷贝 (只是 64 位值)。字符串、数组和对象自动深拷贝。

## 安全

Perry 在 **编译时** 强制线程安全。您不需要考虑竞争条件、互斥锁或数据损坏。

### 没有共享可变状态

传递给 `parallelMap` 和 `spawn` 的闭包 **不能捕获可变变量**。编译器拒绝这个：

```typescript
let counter = 0;

// 编译错误：传递给 parallelMap 的闭包不能
// 捕获可变变量 'counter'
parallelMap(data, (item) => {
    counter++;  // 不允许
    return item;
});
```

这通过设计消除了数据竞争。如果您需要聚合结果，使用返回值：

```typescript
// 不要变异共享计数器，返回值并减少
const results = parallelMap(data, (item) => processItem(item));
const total = results.reduce((sum, r) => sum + r, 0);
```

### 独立线程竞技场

每个工作线程有自己的内存竞技场。在一个线程上创建的对象永远不能从另一个线程访问。值仅通过深拷贝序列化跨越线程边界，Perry 自动且不可见地处理。

## 它如何工作

Perry 的线程模型建立在三个支柱上：

**1. 原生代码，不是解释的**

Perry 通过 LLVM 将 TypeScript 编译为原生机器代码。没有解释器，没有 VM，没有隔离。函数指针就是函数指针 — 它在任何线程上都有效。

**2. 线程本地内存**

每个线程获得自己的内存竞技场 (bump 分配器) 和垃圾收集器。计算期间没有同步开销。当线程完成时，其竞技场自动释放。

**3. 序列化传输**

跨越线程边界的值被序列化为线程安全的中间格式，并在目标线程上反序列化。成本取决于值类型：

| 值类型 | 传输成本 |
|-----------|--------------|
| 数字、布尔值、null、undefined | 零成本 (64 位拷贝) |
| 字符串 | O(n) 字节拷贝 |
| 数组 | O(n) 元素深拷贝 |
| 对象 | O(n) 字段深拷贝 |
| 闭包 | 指针 + 捕获值 |

对于数字工作负载 — 最常见的可并行化任务 — 线程开销可以忽略不计。

## 下一步

- [parallelMap 参考](parallel-map.md) — 详细 API 和性能提示
- [parallelFilter 参考](parallel-filter.md) — 并行数组过滤
- [spawn 参考](spawn.md) — 后台线程和 Promise 集成