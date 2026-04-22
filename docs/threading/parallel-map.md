# parallelMap

```typescript
import { parallelMap } from "perry/thread";

function parallelMap<T, U>(data: T[], fn: (item: T) => U): U[];
```

跨所有可用 CPU 核心并行处理数组的每个元素。以与输入相同的顺序返回包含结果的新数组。

## 基本用法

```typescript
import { parallelMap } from "perry/thread";

const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
const doubled = parallelMap(numbers, (x) => x * 2);
// [2, 4, 6, 8, 10, 12, 14, 16]
```

## 它如何工作

```
输入: [a, b, c, d, e, f, g, h]     (8 个元素, 4 个 CPU 核心)

  核心 1: [a, b] → map → [a', b']
  核心 2: [c, d] → map → [c', d']
  核心 3: [e, f] → map → [e', f']
  核心 4: [g, h] → map → [g', h']

输出: [a', b', c', d', e', f', g', h']   (与输入相同的顺序)
```

Perry 自动检测 CPU 核心数量并将数组拆分为相等的块。每个块内的元素顺序处理；块跨核心并发运行。

## 捕获变量

映射函数可以引用外部作用域的变量。捕获的值自动深拷贝到每个工作线程：

```typescript
const exchangeRate = 1.12;
const fees = [0.01, 0.02, 0.015];

const converted = parallelMap(prices, (price) => {
    // exchangeRate 被捕获并拷贝到每个线程
    return price * exchangeRate;
});
```

### 可以捕获什么

| 类型 | 支持 | 传输 |
|------|-----------|----------|
| 数字 | 是 | 零成本 (64 位拷贝) |
| 布尔值 | 是 | 零成本 |
| 字符串 | 是 | 字节拷贝 |
| 数组 | 是 | 深拷贝 |
| 对象 | 是 | 深拷贝 |
| `const` 变量 | 是 | 拷贝 |
| `let`/`var` 变量 | 仅当未重新赋值 | 拷贝 |

### 不能捕获什么

可变变量 — 在封闭作用域中任何地方重新赋值的变量 — 在编译时被拒绝：

```typescript
let total = 0;

// 编译错误：不能捕获可变变量 'total'
parallelMap(data, (item) => {
    total += item;   // 会是数据竞争
    return item;
});
```

相反，返回值并减少：

```typescript
const results = parallelMap(data, (item) => item * 2);
const total = results.reduce((sum, x) => sum + x, 0);
```

## 性能

### 何时使用 parallelMap

当每个元素的计算 **显著重于** 跨线程拷贝元素的成本时，使用 `parallelMap`。

**好的候选** (每个元素的 CPU 绑定工作):
```typescript
// 重数学
parallelMap(data, (x) => expensiveComputation(x));

// 大字符串上的字符串处理
parallelMap(documents, (doc) => parseAndAnalyze(doc));

// 加密操作
parallelMap(inputs, (input) => computeHash(input));
```

**差的候选** (每个元素琐碎工作):
```typescript
// 太简单 — 线程开销超过收益
parallelMap(numbers, (x) => x + 1);

// 对于琐碎操作，使用常规 map
const result = numbers.map((x) => x + 1);
```

### 小数组优化

对于元素少于 CPU 核心的数组，Perry 完全跳过线程并在主线程上内联处理元素。小输入的开销为零。

### 数字快速路径

当元素是纯数字 (没有字符串、对象或数组) 时，Perry 以几乎零成本在线程之间传输它们 — 只是 64 位值拷贝，没有序列化。

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

const portfolios = getPortfolioData(); // 数千个投资组合

// 跨所有核心的蒙特卡洛模拟
const riskScores = parallelMap(portfolios, (portfolio) => {
    let totalRisk = 0;
    for (let sim = 0; sim < 10000; sim++) {
        totalRisk += simulateReturns(portfolio);
    }
    return totalRisk / 10000;
});
```