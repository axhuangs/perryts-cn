# i18n CLI 工具

## `perry i18n extract`

扫描您的 TypeScript 源文件以查找可本地化字符串，并生成或更新区域设置 JSON 文件。

```bash
perry i18n extract src/main.ts
```

### 它做什么

1. 递归扫描源目录中的所有 `.ts` 和 `.tsx` 文件
2. 检测 UI 组件调用中的字符串字面量：`Button("...")`、`Text("...")`、`Label("...")` 等。
3. 还检测来自 `perry/i18n` 的 `t("...")` 调用
4. 如果不存在，则创建 `locales/` 目录
5. 对于每个配置的区域设置，创建或更新 JSON 文件：
   - **默认区域设置**：新键预填充为自身作为值
   - **非默认区域设置**：新键以空字符串值添加（表示“需要翻译”）

### 示例输出

```
Scanning for localizable strings...
  Found 12 localizable string(s)
  Updated locales/en.json (3 new, 1 unused)
  Updated locales/de.json (3 new, 1 unused)
  Updated locales/fr.json (3 new, 1 unused)
Done.
```

### 工作流

典型的翻译工作流：

```bash
# 1. 用英语字符串编写代码
#    Button("Next"), Text("Hello, {name}!", { name })

# 2. 将字符串提取到区域设置文件
perry i18n extract src/main.ts

# 3. 将 locales/de.json 发送给翻译人员（空值需要填写）

# 4. 构建 — Perry 验证一切
perry compile src/main.ts -o myapp
```

### 检测模式

扫描器检测这些 UI 组件模式：

- `Button("string")`
- `Text("string")`
- `Label("string")`
- `TextField("string")`
- `TextArea("string")`
- `Tab("string")`
- `NavigationTitle("string")`
- `SectionHeader("string")`
- `SecureField("string")`
- `Alert("string")`
- `t("string")` (显式 i18n API)

支持双引号和单引号字符串。正确处理转义引号。

## 构建输出

在编译期间，Perry 报告 i18n 状态：

```
  i18n: 2 locale(s) [en, de], default: en
    Loaded locales/en.json (12 keys)
    Loaded locales/de.json (12 keys)
  i18n: 12 localizable string(s) detected
  i18n warning: Missing translation for key "Settings" in locale "de"
  i18n warning: Unused i18n key "Old Label" in locale "en"
```

## 键注册表

Perry 维护一个 `.perry/i18n-keys.json` 文件，每次构建时更新：

```json
{
  "keys": [
    { "key": "Next", "string_idx": 0 },
    { "key": "Hello, {name}!", "string_idx": 1 },
    { "key": "You have {count} items", "string_idx": 2 }
  ]
}
```

此文件作为代码库中存在哪些字符串的真相来源。