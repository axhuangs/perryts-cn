# spawn（派生线程）

```typescript
import { spawn } from "perry/thread";

function spawn<T>(fn: () => T): Promise<T>;
```

在新的操作系统线程中运行一个闭包，并返回一个 Promise 对象，该对象会在线程执行完成时解析。主线程会立即继续执行——不会阻塞 UI 界面和其他任务的运行。

## 基本用法

```typescript
import { spawn } from "perry/thread";

const result = await spawn(() => {
    // 此代码块在独立的操作系统线程中运行
    let sum = 0;
    for (let i = 0; i < 100_000_000; i++) {
        sum += i;
    }
    return sum;
});

console.log(result); // 4999999950000000
```

## 非阻塞特性

`spawn` 会立即返回，主线程不会等待子线程执行完成：

```typescript
import { spawn } from "perry/thread";

console.log("1. 启动后台任务");

const handle = spawn(() => {
    // 在后台线程中运行
    return expensiveComputation();
});

console.log("2. 主线程立即继续执行");

const result = await handle;
console.log("3. 获取到结果：", result);
```

输出结果：
```
1. 启动后台任务
2. 主线程立即继续执行
3. 获取到结果：<计算后的值>
```

## 多并发任务

可以派生多个任务，它们会真正地并发执行——每次调用 `spawn` 都会创建一个独立的操作系统线程：

```typescript
import { spawn } from "perry/thread";

const t1 = spawn(() => analyzeCustomers(regionA));
const t2 = spawn(() => analyzeCustomers(regionB));
const t3 = spawn(() => analyzeCustomers(regionC));

// 三个任务在独立的操作系统线程中同时运行
const [r1, r2, r3] = await Promise.all([t1, t2, t3]);

console.log("区域 A：", r1);
console.log("区域 B：", r2);
console.log("区域 C：", r3);
```

与 Node.js 的 `worker_threads` 不同，每个 `spawn` 创建的是轻量级的操作系统线程（栈大小约 8MB），而非完整的 V8 隔离环境（堆大小约 2MB 且有启动成本）。

## 变量捕获

和 `parallelMap` 类似，`spawn` 的闭包可以捕获外部变量。这些变量会被深度复制到后台线程中：

```typescript
import { spawn } from "perry/thread";

const config = { iterations: 1000, seed: 42 };
const dataset = loadData();

const result = await spawn(() => {
    // config 和 dataset 会被复制到当前线程
    return runSimulation(config, dataset);
});
```

可变变量无法被捕获——这一点会在编译阶段强制校验。

## 返回复杂值

`spawn` 可以返回任意类型的值。复杂类型的值（对象、数组、字符串）会被自动序列化后传回主线程：

```typescript
import { spawn } from "perry/thread";

const stats = await spawn(() => {
    const values = computeExpensiveValues();
    return {
        mean: average(values), // 平均值
        median: median(values), // 中位数
        stddev: standardDeviation(values), // 标准差
        count: values.length, // 数量
    };
});

console.log(stats.mean, stats.median);
```

## UI 集成

`spawn` 非常适合在执行密集型计算时保持原生 UI 界面的响应性：

```typescript
import { spawn } from "perry/thread";
import { Text, Button, VStack } from "perry/ui";

let status = "就绪";
let result = "";

VStack(10, [
    Text(status),
    Text(result),
    Button("分析", async () => {
        status = "处理中...";

        // 后台线程执行——UI 界面保持响应
        const data = await spawn(() => {
            return runAnalysis(largeDataset);
        });

        result = `发现 ${data.count} 个模式`;
        status = "完成";
    }),
]);
```

如果不使用 `spawn`，分析过程会冻结 UI 界面；使用 `spawn` 后，用户在计算运行期间仍可滚动页面、点击其他按钮或进行页面导航。

## 与 Node.js worker_threads 的对比

```typescript
// ── Node.js 实现：约 15 行代码，需单独文件 ──────────
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
worker.on("error", (err) => { /* 错误处理 */ });


// ── Perry 实现：仅 1 行代码 ─────────────────────────────
const result = await spawn(() => heavyComputation(inputData));
```

无需单独文件、无需消息端口、无需事件处理器、无需结构化克隆，仅需一行代码即可实现。

## 示例

### 后台文件处理

```typescript
import { spawn } from "perry/thread";
import { readFileSync } from "fs";

// 无阻塞地读取并处理大文件
const analysis = await spawn(() => {
    const content = readFileSync("large-dataset.csv");
    return parseAndAnalyze(content);
});
```

### 带处理逻辑的并行 API 调用

```typescript
import { spawn } from "perry/thread";

// 先获取数据，再在后台线程中处理
const rawData = await fetch("https://api.example.com/data").then(r => r.json());

// CPU 密集型处理在主线程外执行
const processed = await spawn(() => {
    return transformAndEnrich(rawData);
});
```

### 延迟计算

```typescript
import { spawn } from "perry/thread";

// 提前启动计算，后续再使用结果
const precomputed = spawn(() => buildLookupTable(params));

// ... 执行其他初始化工作 ...

// 结果已就绪（或等待结果就绪）
const table = await precomputed;
```
