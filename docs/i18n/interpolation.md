# 插值与复数

## 参数化字符串

在字符串中使用 `{param}` 占位符，并将值作为第二个参数传递：

```typescript
import { Text } from "perry/ui";

Text("Hello, {name}!", { name: user.name })
Text("Total: {price}", { price: order.total })
```

翻译文件使用相同的 `{param}` 语法：

```json
// locales/en.json
{
  "Hello, {name}!": "Hello, {name}!",
  "Total: {price}": "Total: {price}"
}

// locales/de.json
{
  "Hello, {name}!": "Hallo, {name}!",
  "Total: {price}": "Gesamt: {price}"
}
```

参数在选择区域设置适当的模板后在运行时替换。替换通过转换为字符串来处理任何值类型（数字、字符串、日期）。

### 编译时验证

Perry 在编译期间验证所有区域设置的参数：

| 条件 | 严重性 |
|-----------|----------|
| 翻译中有 `{param}` 但代码中未提供 | 错误 |
| 代码中有参数但翻译中没有 `{param}` | 错误 |
| 同一键的参数集在区域设置之间不同 | 错误 |

## 复数规则

复数形式使用基于 CLDR 复数类别的点后缀键：`.zero`、`.one`、`.two`、`.few`、`.many`、`.other`。

### 区域设置文件

```json
// locales/en.json
{
  "You have {count} items.one": "You have {count} item.",
  "You have {count} items.other": "You have {count} items."
}

// locales/de.json
{
  "You have {count} items.one": "Du hast {count} Artikel.",
  "You have {count} items.other": "Du hast {count} Artikel."
}

// locales/pl.json (波兰语: one, few, many)
{
  "You have {count} items.one": "Masz {count} element.",
  "You have {count} items.few": "Masz {count} elementy.",
  "You have {count} items.many": "Masz {count} elementow.",
  "You have {count} items.other": "Masz {count} elementu."
}
```

### 代码中的使用

引用没有后缀的基础键。Perry 自动检测复数变体：

```typescript
Text("You have {count} items", { count: cart.items.length })
```

Perry 根据 `count` 参数值和当前区域设置的 CLDR 规则确定使用哪个复数形式。

### 支持的区域设置

Perry 为 30 多个区域设置包含手工编写的 CLDR 复数规则：

| 模式 | 区域设置 |
|---------|---------|
| one/other | 英语、德语、荷兰语、瑞典语、丹麦语、挪威语、芬兰语、爱沙尼亚语、匈牙利语、土耳其语、希腊语、希伯来语、意大利语、西班牙语、葡萄牙语、加泰罗尼亚语、保加利亚语、印地语、孟加拉语、斯瓦希里语、... |
| one (0-1) / other | 法语 |
| 无区别 | 日语、中文、韩语、越南语、泰语、印尼语、马来语 |
| one/few/many | 俄语、乌克兰语、塞尔维亚语、克罗地亚语、波斯尼亚语、波兰语 |
| one/few/other | 捷克语、斯洛伐克语 |
| zero/one/two/few/many/other | 阿拉伯语 |
| one/few/other | 罗马尼亚语、立陶宛语 |
| zero/one/other | 拉脱维亚语 |

### 编译时验证

| 条件 | 严重性 |
|-----------|----------|
| 任何区域设置缺少 `.other` 形式 | 错误 |
| 缺少必需的 CLDR 类别（例如，波兰语的 `.few`） | 错误 |