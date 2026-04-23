# 插值与复数形式

## 参数化字符串

在字符串中使用 `{param}` 占位符，并在第二个参数中传入对应值：

```typescript
import { Text } from "perry/ui";

Text("Hello, {name}!", { name: user.name })
Text("Total: {price}", { price: order.total })
```

翻译文件采用相同的 `{param}` 语法：

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

参数会在运行时、选定符合当前区域设置的模板后完成替换。该替换逻辑支持所有值类型（数字、字符串、日期），会自动将其转换为字符串形式。

### 编译时校验

Perry 会在编译阶段校验所有区域设置下的参数有效性：

| 校验条件 | 严重程度 |
|-----------|----------|
| 翻译文本中包含 `{param}`，但代码中未传入该参数 | 错误 |
| 代码中传入了参数，但翻译文本中无对应的 `{param}` | 错误 |
| 同一键名在不同区域设置下的参数集合不一致 | 错误 |

## 复数规则

复数形式采用基于 CLDR 复数分类的后缀键名：`.zero`、`.one`、`.two`、`.few`、`.many`、`.other`。

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

// locales/pl.json (波兰语：one、few、many)
{
  "You have {count} items.one": "Masz {count} element.",
  "You have {count} items.few": "Masz {count} elementy.",
  "You have {count} items.many": "Masz {count} elementow.",
  "You have {count} items.other": "Masz {count} elementu."
}
```

### 代码中的使用方式

引用不带任何后缀的基础键名即可，Perry 会自动检测复数变体：

```typescript
Text("You have {count} items", { count: cart.items.length })
```

Perry 会根据 `count` 参数值和当前区域设置对应的 CLDR 规则，自动判定应使用哪种复数形式。

### 支持的区域设置

Perry 内置了 30 余种区域设置的自定义 CLDR 复数规则：

| 规则模式 | 适用区域设置 |
|---------|---------|
| one/other | 英语、德语、荷兰语、瑞典语、丹麦语、挪威语、芬兰语、爱沙尼亚语、匈牙利语、土耳其语、希腊语、希伯来语、意大利语、西班牙语、葡萄牙语、加泰罗尼亚语、保加利亚语、印地语、孟加拉语、斯瓦希里语…… |
| one（0-1）/ other | 法语 |
| 无区分 | 日语、中文、韩语、越南语、泰语、印尼语、马来语 |
| one/few/many | 俄语、乌克兰语、塞尔维亚语、克罗地亚语、波斯尼亚语、波兰语 |
| one/few/other | 捷克语、斯洛伐克语 |
| zero/one/two/few/many/other | 阿拉伯语 |
| one/few/other | 罗马尼亚语、立陶宛语 |
| zero/one/other | 拉脱维亚语 |

### 编译时校验

| 校验条件 | 严重程度 |
|-----------|----------|
| 任意区域设置缺失 `.other` 形式 | 错误 |
| 缺失必需的 CLDR 分类（如波兰语的 `.few`） | 错误 |
| 包含当前区域设置不支持的冗余分类（如英语的 `.few`） | 警告 |

## 非 UI 字符串的显式 API

对于 UI 组件外的字符串（API 响应、通知等场景），请使用 `t()` 方法：

```typescript
import { t } from "perry/i18n";

const message = t("Your order has been shipped.");
const welcome = t("Welcome back, {name}!", { name: user.name });
```

该方法与 UI 字符串使用相同的键名查找、校验和插值逻辑。