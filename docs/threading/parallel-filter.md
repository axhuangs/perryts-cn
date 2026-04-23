# parallelFilter

```typescript
import { parallelFilter } from "perry/thread";

function parallelFilter<T>(data: T[], predicate: (item: T) => boolean): T[];
```

该方法可跨所有可用的 CPU 核心并行过滤数组。返回一个新数组，仅包含断言函数返回真值的元素，且元素顺序保持不变。

## 基本用法

```typescript
import { parallelFilter } from "perry/thread";

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens = parallelFilter(numbers, (x) => x % 2 === 0);
// [2, 4, 6, 8, 10]
```

## 工作原理

```
输入: [a, b, c, d, e, f, g, h]     (8 个元素，4 个 CPU 核心)

  核心 1: [a, b] → 校验 → [a]       (b 被过滤掉)
  核心 2: [c, d] → 校验 → [c, d]    (两者均保留)
  核心 3: [e, f] → 校验 → []        (两者均被过滤掉)
  核心 4: [g, h] → 校验 → [h]       (g 被过滤掉)

输出: [a, c, d, h]                 (按原始顺序拼接结果)
```

每个核心独立校验其分配到的元素分片。所有线程执行完成后，结果会按元素原始顺序合并。

## 为何不直接使用 `.filter()`？

常规的 `.filter()` 方法运行在单个线程上。对于包含大量元素且断言函数计算成本较高的数组，`parallelFilter` 可将计算任务分发至多个核心：

```typescript
// 单线程 — 仅单个核心执行所有任务
const results = data.filter((item) => expensivePredicate(item));

// 并行处理 — 所有核心分摊任务
import { parallelFilter } from "perry/thread";
const results = parallelFilter(data, (item) => expensivePredicate(item));
```

注意权衡：`parallelFilter` 存在线程间值拷贝的性能开销。仅当断言函数的计算成本足以抵消该开销时，才建议使用此方法。

## 变量捕获

与 `parallelMap` 类似，断言函数可捕获外部变量。被捕获的变量会被深度拷贝至每个线程：

```typescript
import { parallelFilter } from "perry/thread";

const minScore = 85;
const maxAge = 30;

// minScore 和 maxAge 被捕获并拷贝至每个线程
const qualified = parallelFilter(candidates, (c) => {
    return c.score >= minScore && c.age <= maxAge;
});
```

不可捕获可变变量——编译器会在编译阶段拒绝此类操作。

## 示例

### 过滤大型数据集

```typescript
import { parallelFilter } from "perry/thread";

const transactions = getTransactionLog(); // 数百万条记录

const suspicious = parallelFilter(transactions, (tx) => {
    return tx.amount > 10000
        && tx.country !== tx.user.homeCountry
        && tx.timestamp.hour < 6;
});
```

### 与 parallelMap 结合使用

```typescript
import { parallelMap, parallelFilter } from "perry/thread";

// 步骤 1：并行过滤出相关元素
const active = parallelFilter(users, (u) => u.isActive && u.age >= 18);

// 步骤 2：并行转换过滤后的结果
const profiles = parallelMap(active, (u) => ({
    name: u.name,
    score: computeScore(u),
}));
```

### 包含重度计算的断言函数

```typescript
import { parallelFilter } from "perry/thread";

// 每次断言调用涉及大量计算 — 非常适合并行化处理
const valid = parallelFilter(certificates, (cert) => {
    return verifyCertificateChain(cert) && !isRevoked(cert);
});
```

## 性能说明

建议在以下场景使用 `parallelFilter`：
- 数组包含大量元素（数百个及以上）
- 断言函数每个元素的计算量较大
- 需要在过滤过程中保持用户界面响应性

对于小型数组的简单断言场景，常规 `.filter()` 方法速度更快（无线程调度开销）。