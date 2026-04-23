# parallelMap

```typescript
import { parallelMap } from "perry/thread";

function parallelMap<T, U>(data: T[], fn: (item: T) => U): U[];
```

在所有可用的 CPU 核心上并行处理数组的每个元素。返回一个新数组，其结果顺序与输入数组完全一致。

## 基本用法

```typescript
import { parallelMap } from "perry/thread";

const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
const doubled = parallelMap(numbers, (x) => x * 2);
// [2, 4, 6, 8, 10, 12, 14, 16]
```

## 工作原理

```
输入: [a, b, c, d, e, f, g, h]     （8 个元素，4 个 CPU 核心）

  核心 1: [a, b] → 映射 → [a', b']
  核心 2: [c, d] → 映射 → [c', d']
  核心 3: [e, f] → 映射 → [e', f']
  核心 4: [g, h] → 映射 → [g', h']

输出: [a', b', c', d', e', f', g', h']   （与输入顺序一致）
```

Perry 会自动检测 CPU 核心数量，并将数组拆分为均等的块。每个块内的元素按顺序处理，不同块则在多个核心上并发运行。

## 变量捕获

映射函数可以引用外部作用域的变量。被捕获的值会自动深拷贝到每个工作线程中：

```typescript
const exchangeRate = 1.12;
const fees = [0.01, 0.02, 0.015];

const converted = parallelMap(prices, (price) => {
    // 汇率（exchangeRate）会被捕获并拷贝到每个线程
    return price * exchangeRate;
});
```

### 可捕获的类型

| 类型 | 是否支持 | 传输方式 |
|------|-----------|----------|
| 数字 | 是 | 零成本（64 位拷贝） |
| 布尔值 | 是 | 零成本 |
| 字符串 | 是 | 字节拷贝 |
| 数组 | 是 | 深拷贝 |
| 对象 | 是 | 深拷贝 |
| `const` 变量 | 是 | 拷贝 |
| `let`/`var` 变量 | 仅未被重新赋值时支持 | 拷贝 |

### 不可捕获的类型

可变变量（即在封闭作用域内任何位置被重新赋值的变量）会在编译阶段被拒绝：

```typescript
let total = 0;

// 编译错误：无法捕获可变变量 'total'
parallelMap(data, (item) => {
    total += item;   // 可能引发数据竞争
    return item;
});
```

正确的做法是返回计算结果后再进行归约（reduce）：

```typescript
const results = parallelMap(data, (item) => item * 2);
const total = results.reduce((sum, x) => sum + x, 0);
```

## 性能说明

### 适用场景

仅当**每个元素的计算成本**显著高于跨线程拷贝元素的成本时，才适合使用 `parallelMap`。

**适用场景**（每个元素为 CPU 密集型任务）：
```typescript
// 复杂数学计算
parallelMap(data, (x) => expensiveComputation(x));

// 大字符串的处理
parallelMap(documents, (doc) => parseAndAnalyze(doc));

// 加密运算
parallelMap(inputs, (input) => computeHash(input));
```

**不适用场景**（每个元素为轻量型任务）：
```typescript
// 逻辑过于简单 — 线程开销超过性能收益
parallelMap(numbers, (x) => x + 1);

// 轻量操作建议使用常规 map 方法
const result = numbers.map((x) => x + 1);
```

### 小数组优化

当数组元素数量少于 CPU 核心数时，Perry 会完全跳过线程创建流程，直接在主线程中处理元素。小体量输入无任何额外开销。

### 数值快速路径

当元素为纯数字类型（无字符串、对象或数组）时，Perry 可实现近乎零成本的线程间传输 — 仅需 64 位数值拷贝，无需序列化操作。

## 示例

### 矩阵行处理

```typescript
import { parallelMap } from "perry/thread";

// 独立处理矩阵的每一行
const rows = [[1,2,3], [4,5,6], [7,8,9]];
const rowSums = parallelMap(rows, (row) => {
    let sum = 0;
    for (const val of row) sum += val;
    return sum;
});
// [6, 15, 24]
```

### 批量验证

```typescript
import { parallelMap } from "perry/thread";

const users = [
    { name: "Alice", email: "alice@example.com" },
    { name: "Bob", email: "invalid" },
    { name: "Charlie", email: "charlie@example.com" },
];

const validationResults = parallelMap(users, (user) => {
    const emailValid = user.email.includes("@") && user.email.includes(".");
    const nameValid = user.name.length > 0 && user.name.length < 100;
    return { name: user.name, valid: emailValid && nameValid };
});
```

### 金融计算

```typescript
import { parallelMap } from "perry/thread";

const portfolios = getPortfolioData(); // 数千个投资组合数据

// 跨所有核心执行蒙特卡洛模拟
const riskScores = parallelMap(portfolios, (portfolio) => {
    let totalRisk = 0;
    for (let sim = 0; sim < 10000; sim++) {
        totalRisk += simulateReturns(portfolio);
    }
    return totalRisk / 10000;
});
```
