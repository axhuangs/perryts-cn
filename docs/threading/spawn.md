# spawn

```typescript
import { spawn } from "perry/thread";

function spawn<T>(fn: () => T): Promise<T>;
```

在新 OS 线程上运行闭包，并返回一个在线程完成时解析的 Promise。主要线程立即继续 — UI 和其他工作不会被阻塞。

## 基本用法

```typescript
import { spawn } from "perry/thread";

const result = await spawn(() => {
    // 这在单独的 OS 线程上运行
    let sum = 0;
    for (let i = 0; i < 100_000_000; i++) {
        sum += i;
    }
    return sum;
});

console.log(result); // 4999999950000000
```

## 非阻塞

`spawn` 立即返回。主要线程不等待：

```typescript
import { spawn } from "perry/thread";

console.log("1. 开始后台工作");

const handle = spawn(() => {
    // 在后台线程上运行
    return expensiveComputation();
});

console.log("2. 主要线程立即继续");

const result = await handle;
console.log("3. 得到结果:", result);
```

输出:
```
1. 开始后台工作
2. 主要线程立即继续
3. 得到结果: <computed value>
```

## 多个并发任务

生成多个任务，它们真正并发运行 — 每个 `spawn` 调用一个 OS 线程：

```typescript
import { spawn } from "perry/thread";

const t1 = spawn(() => analyzeCustomers(regionA));
const t2 = spawn(() => analyzeCustomers(regionB));
const t3 = spawn(() => analyzeCustomers(regionC));

// 所有三个同时在单独的 OS 线程上运行
const [r1, r2, r3] = await Promise.all([t1, t2, t3]);

console.log("Region A:", r1);
console.log("Region B:", r2);
console.log("Region C:", r3);
```

不像 Node.js `worker_threads`，每个 `spawn` 是一个轻量级 OS 线程 (~8MB 栈)，不是完整的 V8 隔离 (~2MB 堆 + 启动成本)。

## 捕获变量

像 `parallelMap` 一样，`spawn` 闭包可以捕获外部变量。它们被深拷贝到后台线程：

```typescript
import { spawn } from "perry/thread";

const config = { iterations: 1000, seed: 42 };
const dataset = loadData();

const result = await spawn(() => {
    // config 和 dataset 被拷贝到这个线程
    return runSimulation(config, dataset);
});
```

可变变量不能被捕获 — 这在编译时强制执行。

## 返回复杂值

`spawn` 可以返回任何值类型。复杂值 (对象、数组、字符串) 自动序列化回主线程：

```typescript
import { spawn } from "perry/thread";

const stats = await spawn(() => {
    const values = computeExpensiveValues();
    return {
        mean: average(values),
        median: median(values),
        stddev: standardDeviation(values),
        count: values.length,
    };
});

console.log(stats.mean, stats.median);
```

## UI 集成

`spawn` 理想用于在重计算期间保持原生 UI 响应：

```typescript
import { spawn } from "perry/thread";
import { Text, Button, VStack } from "perry/ui";

let status = "Ready";
let result = "";

VStack(10, [
    Text(status),
    Text(result),
    Button("Analyze", async () => {
        status = "Processing...";

        // 后台线程 — UI 保持响应
        const data = await spawn(() => {
            return runAnalysis(largeDataset);
        });

        result = `Found ${data.count} patterns`;
        status = "Done";
    }),
]);
```

没有 `spawn`，分析会冻结 UI。使用 `spawn`，用户仍可以滚动、点击其他按钮，或在计算运行时导航。

## 与 Node.js worker_threads 比较

```typescript
// ── Node.js: ~15 行，需要单独文件 ──────────
// worker.js
const { parentPort, workerData } = require("worker_threads");
const result = heavyComputation(workerData);
parentPort.postMessage(result);

// main.js
const { Worker } = require("worker_threads");
const worker = new Worker("./worker.js", {
    workerData: inputData,
});
worker.on("message", (result) => {
    console.log(result);
});
worker.on("error", (err) => { /* handle */ });


// ── Perry: 1 行 ─────────────────────────────────────
const result = await spawn(() => heavyComputation(inputData));
```

没有单独文件。没有消息端口。没有事件处理器。没有结构化克隆。一行。

## 示例

### 后台文件处理

```typescript
import { spawn } from "perry/thread";
import { readFileSync } from "fs";

// 读取和处理大文件而不阻塞
const analysis = await spawn(() => {
    const content = readFileSync("large-dataset.csv");
    return parseAndAnalyze(content);
});
```

### 带处理的并行 API 调用

```typescript
import { spawn } from "perry/thread";

// 获取数据，然后在后台线程上处理它
const rawData = await fetch("https://api.example.com/data").then(r => r.json());

// CPU 密集处理发生在主线程之外
const processed = await spawn(() => {
    return transformAndEnrich(rawData);
});
```

### 延迟计算

```typescript
import { spawn } from "perry/thread";

// 及早开始计算，后来使用结果
const precomputed = spawn(() => buildLookupTable(params));

// ... 做其他设置工作 ...

// 结果准备好 (或我们等待它)
const table = await precomputed;
```