# 本地化感知的格式化

Perry 提供格式化包装函数，可根据当前区域设置自动格式化数值。可从 `perry/i18n` 中导入这些函数：

```typescript
import { Currency, Percent, ShortDate, LongDate, FormatNumber, FormatTime, Raw } from "perry/i18n";
```

## 格式化包装函数

### 货币格式化（Currency）

将数字格式化为带有区域设置对应货币符号、小数分隔符及符号位置的货币格式：

```typescript
Text("Total: {price}", { price: Currency(23.10) })
// 英文（en）："Total: $23.10"
// 德文（de）："Total: 23,10 €"
// 法文（fr）："Total: 23,10 €"
// 日文（ja）："Total: ¥23.10"
```

### 百分比格式化（Percent）

将小数格式化为百分比形式（数值会乘以 100）：

```typescript
Text("Discount: {rate}", { rate: Percent(0.15) })
// 英文（en）："Discount: 15%"
// 德文（de）："Discount: 15 %"
// 法文（fr）："Discount: 15 %"
```

### 数字格式化（FormatNumber）

按照区域设置适配的分组方式和小数分隔符格式化数字：

```typescript
Text("Population: {n}", { n: FormatNumber(1234567.89) })
// 英文（en）："Population: 1,234,567.89"
// 德文（de）："Population: 1.234.567,89"
// 法文（fr）："Population: 1 234 567,89"
```

### 短日期 / 长日期 / 日期格式化（ShortDate / LongDate / FormatDate）

将时间戳（自纪元起的毫秒数）格式化为日期：

```typescript
const now = Date.now();

Text("Due: {d}", { d: ShortDate(now) })
// 英文（en）："Due: 3/22/2026"
// 德文（de）："Due: 22.03.2026"
// 日文（ja）："Due: 2026/03/22"

Text("Event: {d}", { d: LongDate(now) })
// 英文（en）："Event: March 22, 2026"
// 德文（de）："Event: 22. März 2026"
// 法文（fr）："Event: 22 mars 2026"
```

### 时间格式化（FormatTime）

将时间戳格式化为时间（根据区域设置选择 12 小时制或 24 小时制）：

```typescript
Text("At: {t}", { t: FormatTime(timestamp) })
// 英文（en）："At: 3:45 PM"
// 德文（de）："At: 15:45"
// 法文（fr）："At: 15:45"
```

### 原始值（Raw）

透传处理——阻止所有自动格式化。当参数名可能触发自动格式化，但需保留原始数值时使用：

```typescript
Text("Code: {amount}", { amount: Raw(12345) })
// 所有区域设置："Code: 12345"（尽管参数名为 amount，仍不进行货币格式化）
```

## 区域设置专属的格式化规则

Perry 内置了 25 种以上区域设置的自定义格式化规则：

| 特性 | 示例区域设置 |
|---------|----------------|
| 小数分隔符：`.` / 千位分隔符：`,` | 英文（en）、日文（ja）、中文（zh）、韩文（ko） |
| 小数分隔符：`,` / 千位分隔符：`.` | 德文（de）、荷兰文（nl）、土耳其文（tr）、西班牙文（es）、意大利文（it）、葡萄牙文（pt） |
| 小数分隔符：`,` / 千位分隔符：` `（窄空格） | 法文（fr） |
| 小数分隔符：`,` / 千位分隔符：` `（非断行空格） | 俄文（ru）、乌克兰文（uk）、波兰文（pl）、瑞典文（sv）、丹麦文（da）、挪威文（no）、芬兰文（fi） |
| 货币符号前置：`$23.10` | 英文（en）、日文（ja）、中文（zh）、韩文（ko） |
| 货币符号后置：`23,10 €` | 德文（de）、法文（fr）、西班牙文（es）、意大利文（it）、俄文（ru） |
| 百分比带空格：`42 %` | 德文（de）、法文（fr）、西班牙文（es）、俄文（ru） |
| 百分比无空格：`42%` | 英文（en）、日文（ja）、中文（zh） |
| 日期顺序：月/日/年（M/D/Y） | 英文（en） |
| 日期顺序：日.月.年（D.M.Y） | 德文（de）、法文（fr）、西班牙文（es）、俄文（ru） |
| 日期顺序：年/月/日（Y/M/D） | 日文（ja）、中文（zh）、韩文（ko）、瑞典文（sv） |
| 24 小时制 | 德文（de）、法文（fr）、西班牙文（es）、日文（ja）、中文（zh）、俄文（ru）（多数） |
| 12 小时制（上/下午） | 英文（en） |

## 货币配置

可在 `perry.toml` 中按区域设置配置默认货币代码：

```toml
[i18n]
locales = ["en", "de", "fr"]
default_locale = "en"

[i18n.currencies]
en = "USD"
de = "EUR"
fr = "EUR"
```

调用 `Currency(value)` 时，区域设置对应的已配置货币代码会决定货币符号及格式化规则。