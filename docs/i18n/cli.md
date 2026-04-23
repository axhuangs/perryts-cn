# 国际化（i18n）命令行工具（CLI）

## `perry i18n extract`

扫描 TypeScript 源文件中的可本地化字符串，并生成或更新区域语言（locale）JSON 文件。

```bash
perry i18n extract src/main.ts
```

### 功能说明

1. 递归扫描源目录下所有 `.ts` 和 `.tsx` 文件
2. 检测 UI 组件调用中的字符串字面量：`Button("...")`、`Text("...")`、`Label("...")` 等
3. 同时检测来自 `perry/i18n` 的 `t("...")` 调用
4. 若 `locales/` 目录不存在则创建该目录
5. 针对每个已配置的区域语言，创建或更新对应的 JSON 文件：
   - **默认区域语言**：新增键值对的值自动填充为键名本身
   - **非默认区域语言**：新增键值对的值为空字符串（表示“待翻译”）

### 输出示例

```
Scanning for localizable strings...
  Found 12 localizable string(s)
  Updated locales/en.json (3 new, 1 unused)
  Updated locales/de.json (3 new, 1 unused)
  Updated locales/fr.json (3 new, 1 unused)
Done.
```

### 工作流程

典型的翻译工作流程：

```bash
# 1. 编写包含英文字符串的代码
#    Button("Next"), Text("Hello, {name}!", { name })

# 2. 提取字符串至区域语言文件
perry i18n extract src/main.ts

# 3. 将 locales/de.json 发送给翻译人员（空值需补充翻译）

# 4. 构建项目 —— Perry 会验证所有内容
perry compile src/main.ts -o myapp
```

### 可检测的语法模式

扫描器可检测以下 UI 组件调用模式：

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
- `t("string")`（显式国际化 API）

同时支持双引号和单引号包裹的字符串，可正确处理转义引号。

## 构建输出

编译过程中，Perry 会输出国际化状态信息：

```
  i18n: 2 locale(s) [en, de], default: en
    Loaded locales/en.json (12 keys)
    Loaded locales/de.json (12 keys)
  i18n: 12 localizable string(s) detected
  i18n warning: Missing translation for key "Settings" in locale "de"
  i18n warning: Unused i18n key "Old Label" in locale "en"
```

## 键值注册表

Perry 会维护一个 `.perry/i18n-keys.json` 文件，每次构建时自动更新：

```json
{
  "keys": [
    { "key": "后续参考", "string_idx": 0 },
    { "key": "Hello, {name}!", "string_idx": 1 },
    { "key": "You have {count} items", "string_idx": 2 }
  ]
}
```

该文件是代码库中所有字符串的权威数据源。