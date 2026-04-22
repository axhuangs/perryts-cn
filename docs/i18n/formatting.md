# 区域设置感知格式化

Perry 提供格式包装函数，根据当前区域设置自动格式化值。从 `perry/i18n` 导入它们：

```typescript
import { Currency, Percent, ShortDate, LongDate, FormatNumber, FormatTime, Raw } from "perry/i18n";
```

## 格式包装器

### Currency

将数字格式化为货币，使用区域设置的符号、小数分隔符和符号位置：

```typescript
Text("Total: {price}", { price: Currency(23.10) })
// en: "Total: $23.10"
// de: "Total: 23,10 €"
// fr: "Total: 23,10 €"
// ja: "Total: ¥23.10"
```

### Percent

将小数格式化为百分比（值乘以 100）：

```typescript
Text("Discount: {rate}", { rate: Percent(0.15) })
// en: "Discount: 15%"
// de: "Discount: 15 %"
// fr: "Discount: 15 %"
```

### FormatNumber

使用区域设置适当的分组和小数分隔符格式化数字：

```typescript
Text("Population: {n}", { n: FormatNumber(1234567.89) })
// en: "Population: 1,234,567.89"
// de: "Population: 1.234.567,89"
// fr: "Population: 1 234 567,89"
```

### ShortDate / LongDate / FormatDate

将时间戳（自纪元以来的毫秒）格式化为日期：

```typescript
const now = Date.now();

Text("Due: {d}", { d: ShortDate(now) })
// en: "Due: 3/22/2026"
// de: "Due: 22.03.2026"
// ja: "Due: 2026/03/22"

Text("Event: {d}", { d: LongDate(now) })
// en: "Event: March 22, 2026"
// de: "Event: 22. März 2026"
// fr: "Event: 22 mars 2026"
```

### FormatTime

将时间戳格式化为时间（基于区域设置的 12h vs 24h）：

```typescript
Text("At: {t}", { t: FormatTime(timestamp) })
// en: "At: 3:45 PM"
// de: "At: 15:45"
// fr: "At: 15:45"
```

### Raw

直通 — 防止任何自动格式化。当参数名称可能触发自动格式化但您想要原始值时使用：

```typescript
Text("Code: {amount}", { amount: Raw(12345) })
// 所有区域设置: "Code: 12345" (尽管名称，但无货币格式化)
```

## 区域设置特定格式化规则

Perry 为 25 多个区域设置包含手工编写的格式化规则：

| 功能 | 示例区域设置 |
|---------|----------------|
| 小数: `.` / 千位: `,` | en, ja, zh, ko |
| 小数: `,` / 千位: `.` | de, nl, tr, es, it, pt |
| 小数: `,` / 千位: ` ` (窄空格) | fr |
| 小数: `,` / 千位: ` ` (不间断空格) | ru, uk, pl, sv, da, no, fi |
| 货币在数字前: `$23.10` | en, ja, zh, ko |
| 货币在数字后: `23,10 €` | de, fr, es, it, ru |
| 百分比带空格: `42 %` | de, fr, es, ru |
| 百分比无空格: `42%` | en, ja, zh |
| 日期顺序: M/D/Y | en |
| 日期顺序: D.M.Y | de, fr, es, ru |
| 日期顺序: Y/M/D | ja, zh, ko, sv |
| 24 小时时间 | de, fr, es, ja, zh, ru (大多数) |