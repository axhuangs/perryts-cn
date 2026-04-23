# 多线程

Perry 为你提供真正的操作系统线程，仅需一行代码即可调用。无需配置工作线程、无需消息端口、无结构化克隆开销。只需使用 `parallelMap`、`parallelFilter` 和 `spawn` 即可。

```typescript
import { parallelMap, parallelFilter, spawn } from "perry/thread";

// 在所有 CPU 核心上处理一百万条数据
const results = parallelMap(data, (item) => heavyComputation(item));

// 并行过滤大型数据集
const valid = parallelFilter(records, (r) => r.score > threshold);

// 在后台运行高开销任务
const answer = await spawn(() => computeHash(largeFile));
```

这是**任何 JavaScript 运行时都无法实现**的能力。V8、Bun 和 Deno 均限制为每个隔离环境（isolate）仅能使用一个线程。而 Perry 会编译为原生代码——不存在隔离环境、全局解释器锁（GIL）及结构性限制。你的代码可运行在真正的操作系统线程上，充分利用每个 CPU 核心的全部算力。

## 核心价值

JavaScript 的单线程模型是其最大的性能瓶颈。以下是各运行时尝试解决该问题的方式：

| 运行时       | “多线程”实现方式       | 实际情况                                                                 |
|--------------|------------------------|--------------------------------------------------------------------------|
| **Node.js**  | `worker_threads`       | 独立的 V8 隔离环境。数据通过结构化克隆复制。每个工作线程约占用 2MB 内存。API 设计复杂。 |
| **Deno**     | `Worker`               | 与 Node.js 相同——堆内存隔离，仅支持消息传递。|
| **Bun**      | `Worker`               | 架构相同。结构化克隆速度更快，但仍存在隔离问题。|
| **Perry**    | `parallelMap` / `spawn` | 真正的操作系统线程。轻量级（8MB 栈内存）。一行代码即可调用。编译期安全校验。|

核心问题在于：V8 的垃圾回收堆**无法在多个线程间共享**。每个“工作线程”都是一个完全独立的 JavaScript 引擎实例，拥有专属的堆内存、垃圾回收器以及数据副本。

Perry 则突破了这一限制。它将 TypeScript 编译为原生机器码，线程间数值传递对于数字类型采用零拷贝方式，对于对象类型采用高效序列化方式——无需独立的引擎实例，每个线程也无多兆字节的额外开销。

## 三大核心原语

### `parallelMap` — 数据并行处理

将数组拆分到所有 CPU 核心上处理。每个元素独立计算，结果按原顺序汇总。

```typescript
import { parallelMap } from "perry/thread";

const prices = [100, 200, 300, 400, 500, 600, 700, 800];
const adjusted = parallelMap(prices, (price) => {
    // 高开销计算在工作线程中执行
    let result = price;
    for (let i = 0; i < 1000000; i++) {
        result = Math.sqrt(result * result + i);
    }
    return result;
});
```

Perry 会自动完成以下操作：
1. 检测 CPU 核心数量
2. 将数组拆分为多个分片（每个核心对应一个分片）
3. 启动操作系统线程处理每个分片
4. 按原顺序汇总结果
5. 返回新数组

对于小数组，Perry 会完全跳过线程化处理，直接在主线程内执行——避免琐碎场景下的性能开销。

### `parallelFilter` — 数据并行过滤

在所有 CPU 核心上过滤大型数组。功能与 `.filter()` 一致，但支持并行处理：

```typescript
import { parallelFilter } from "perry/thread";

const users = getMillionUsers();

// 在所有核心上执行过滤——保持原顺序
const active = parallelFilter(users, (user) => {
    return user.lastLogin > cutoffDate && user.score > 100;
});
```

规则与 `parallelMap` 一致：闭包不能捕获可变变量（编译期强制校验），且数值会在线程间深度拷贝。

### `spawn` — 后台线程

在后台运行任意计算任务，并返回一个 Promise。主线程会立即继续执行。

```typescript
import { spawn } from "perry/thread";

// 在后台启动高开销任务
const handle = spawn(() => {
    let sum = 0;
    for (let i = 0; i < 100_000_000; i++) {
        sum += Math.sin(i);
    }
    return sum;
});

// 主线程持续运行——UI 保持响应
console.log("计算中...");

// 在需要时获取结果
const result = await handle;
console.log("完成:", result);
```

`spawn` 返回标准的 Promise 对象。你可以使用 `await` 等待结果、将其传入 `Promise.all`，或链式调用 `.then()`——其行为与其他异步操作完全一致。

## 实战示例

### 并行图像处理

```typescript
import { parallelMap } from "perry/thread";

// 每个像素在独立核心上处理
const processed = parallelMap(pixels, (pixel) => {
    const r = Math.min(255, pixel.r * 1.2);
    const g = Math.min(255, pixel.g * 0.8);
    const b = Math.min(255, pixel.b * 1.1);
    return { r, g, b };
});
```

### 并行加密哈希计算

```typescript
import { parallelMap } from "perry/thread";

// 在所有核心上对数千条数据进行哈希计算
const passwords = ["pass1", "pass2", "pass3", /* 数千条更多数据 */];
const hashed = parallelMap(passwords, (password) => {
    return computeHash(password);
});
```

### 多独立计算任务并行执行

```typescript
import { spawn } from "perry/thread";

// 三个独立任务在三个操作系统线程上同时运行
const task1 = spawn(() => analyzeDataset(dataA));
const task2 = spawn(() => analyzeDataset(dataB));
const task3 = spawn(() => analyzeDataset(dataC));

// 三个任务并发执行
const [result1, result2, result3] = await Promise.all([task1, task2, task3]);
```

### 保持 UI 响应性

```typescript
import { spawn } from "perry/thread";
import { Text, Button } from "perry/ui";

let statusText = "就绪";

Button("开始分析", async () => {
    statusText = "分析中...";

    // 高开销计算在后台线程执行
    // UI 保持响应——用户仍可交互
    const result = await spawn(() => {
        return runExpensiveAnalysis(data);
    });

    statusText = `完成: ${result}`;
});

Text(statusText);
```

### 捕获变量

闭包可以捕获外部变量。被捕获的值会自动深度拷贝到每个工作线程：

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

数字和布尔值采用零拷贝方式（仅 64 位值拷贝）。字符串、数组和对象则自动执行深度拷贝。

## 安全性

Perry **在编译期强制保证**线程安全。你无需考虑竞态条件、互斥锁或数据损坏问题。

### 无共享可变状态

传递给 `parallelMap` 和 `spawn` 的闭包**不能捕获可变变量**。编译器会直接拒绝以下代码：

```typescript
let counter = 0;

// 编译错误：传递给 parallelMap 的闭包不能
// 捕获可变变量 'counter'
parallelMap(data, (item) => {
    counter++;  // 不允许
    return item;
});
```

这从设计上杜绝了数据竞争问题。如果需要汇总结果，请使用返回值：

```typescript
// 替代修改共享计数器的方式，返回值并通过 reduce 汇总
const results = parallelMap(data, (item) => processItem(item));
const total = results.reduce((sum, r) => sum + r, 0);
```

### 独立线程内存区

每个工作线程都有专属的内存区（线性分配器）和垃圾回收器。计算过程中无同步开销。线程结束后，其内存区会自动释放。

## 实现原理

Perry 的线程模型基于三大核心支柱构建：

**1. 原生代码，而非解释执行**

Perry 通过 LLVM 将 TypeScript 编译为原生机器码。无解释器、无虚拟机、无隔离环境。函数指针就是普通的函数指针——可在任意线程上有效调用。

**2. 线程本地内存**

每个线程分配专属的内存区（线性分配器）和垃圾回收器。计算过程中无同步开销。线程结束后，其内存区自动释放。

**3. 序列化传输**

跨线程传递的值会序列化为线程安全的中间格式，并在目标线程反序列化。开销取决于值的类型：

| 值类型                     | 传输开销               |
|----------------------------|------------------------|
| 数字、布尔值、null、undefined | 零开销（64 位值拷贝）|
| 字符串                     | O(n) 字节拷贝          |
| 数组                       | O(n) 元素深度拷贝      |
| 对象                       | O(n) 字段深度拷贝      |
| 闭包                       | 指针 + 被捕获值拷贝    |

对于数值型计算负载（最常见的并行化场景），线程化的额外开销几乎可以忽略不计。

## 后续参考

- [parallelMap 参考文档](parallel-map.md) — 详细 API 及性能优化技巧
- [parallelFilter 参考文档](parallel-filter.md) — 并行数组过滤
- [spawn 参考文档](spawn.md) — 后台线程与 Promise 集成