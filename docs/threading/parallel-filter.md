# parallelFilter

```typescript
import { parallelFilter } from "perry/thread";

function parallelFilter<T>(data: T[], predicate: (item: T) => boolean): T[];
```

跨所有可用 CPU 核心并行过滤数组。返回仅包含谓词返回真值元素的新数组。顺序保留。

## 基本用法

```typescript
import { parallelFilter } from "perry/thread";

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens = parallelFilter(numbers, (x) => x % 2 === 0);
// [2, 4, 6, 8, 10]
```

## 它如何工作

```
输入: [a, b, c, d, e, f, g, h]     (8 个元素, 4 个 CPU 核心)

  核心 1: [a, b] → test → [a]       (b 被过滤掉)
  核心 2: [c, d] → test → [c, d]    (两者都保留)
  核心 3: [e, f] → test → []        (两者都被过滤掉)
  核心 4: [g, h] → test → [h]       (g 被过滤掉)

输出: [a, c, d, h]                 (按原始顺序连接)
```

每个核心独立测试其元素块。所有线程完成后，结果按原始元素顺序合并。

## 为什么不只是使用 `.filter()`？

常规 `.filter()` 在单个线程上运行。对于具有昂贵谓词的大数组，`parallelFilter` 分发工作：

```typescript
// 单线程 — 一个核心做所有工作
const results = data.filter((item) => expensivePredicate(item));

// 并行 — 所有核心共享工作
import { parallelFilter } from "perry/thread";
const results = parallelFilter(data, (item) => expensivePredicate(item));
```

权衡：`parallelFilter` 有从线程之间拷贝值的开销。当谓词足够昂贵以证明该成本合理时使用它。

## 捕获变量

像 `parallelMap` 一样，谓词可以捕获外部变量。捕获被深拷贝到每个线程：

```typescript
import { parallelFilter } from "perry/thread";

const minScore = 85;
const maxAge = 30;

// minScore 和 maxAge 被捕获并拷贝到每个线程
const qualified = parallelFilter(candidates, (c) => {
    return c.score >= minScore && c.age <= maxAge;
});
```

可变变量不能被捕获 — 编译器在编译时拒绝这个。

## 示例

### 过滤大数据集

```typescript
import { parallelFilter } from "perry/thread";

const transactions = getTransactionLog(); // 数百万条记录

const suspicious = parallelFilter(transactions, (tx) => {
    return tx.amount > 10000
        && tx.country !== tx.user.homeCountry
        && tx.timestamp.hour < 6;
});
```

### 与 parallelMap 结合

```typescript
import { parallelMap, parallelFilter } from "perry/thread";

// 步骤 1: 过滤到相关项目 (并行)
const active = parallelFilter(users, (u) => u.isActive && u.age >= 18);

// 步骤 2: 转换过滤结果 (并行)
const profiles = parallelMap(active, (u) => ({
    name: u.name,
    score: computeScore(u),
}));
```

### 具有重计算的谓词

```typescript
import { parallelFilter } from "perry/thread";

// 每个谓词调用做大量工作 — 完美并行化
const valid = parallelFilter(certificates, (cert) => {
    return verifyCertificateChain(cert) && !isRevoked(cert);
});
```

## 性能

当以下情况使用 `parallelFilter`：
- 数组有许多元素 (数百或更多)
- 谓词函数每个元素做有意义的工作
- 您需要在过滤期间保持 UI 响应

对于小数组上的琐碎谓词，常规 `.filter()` 更快 (没有线程开销)。