# 国际化（i18n）

Perry 的国际化（i18n）系统支持开发者编写自然的英文字符串，并在编译阶段自动完成翻译。实现零接入成本、接近零的运行时开销。

```typescript
import { Button, Text } from "perry/ui";

Button("Next")                              // 自动本地化
Text("Hello, {name}!", { name: user.name }) // 支持插值替换
```

## 设计原则

- **零接入成本**：UI 组件中的字符串字面量自动作为可本地化的键值
- **编译时校验**：构建阶段即可捕获缺失的翻译、参数不匹配、复数形式错误等问题
- **嵌入式字符串表**：所有翻译内容以二维扁平表形式嵌入二进制文件，运行时查找开销接近零
- **平台原生区域设置检测**：全平台均调用操作系统 API（移动端无需环境变量）

## 快速开始

### 1. 向 perry.toml 添加 i18n 配置

```toml
[i18n]
locales = ["en", "de"]
default_locale = "en"
```

### 2. 从代码中提取字符串

```bash
perry i18n extract src/main.ts
```

该命令会扫描源文件并生成 `locales/en.json` 和 `locales/de.json` 文件：

```json
// locales/en.json
{
  "Next": "Next",
  "Back": "Back"
}

// locales/de.json（空值表示待翻译）
{
  "Next": "",
  "Back": ""
}
```

### 3. 完成翻译

填充 `locales/de.json` 文件内容：

```json
{
  "Next": "Weiter",
  "Back": "Zurck"
}
```

### 4. 构建项目

```bash
perry compile src/main.ts -o myapp
```

Perry 会在编译阶段校验所有翻译内容，并将其嵌入二进制文件。应用运行时会自动检测用户的系统区域设置，展示对应语言的内容。

## 工作原理

1. **检测阶段**：UI 组件调用（`Button`、`Text`、`Label` 等）中的字符串字面量自动被识别为国际化键值
2. **转换阶段**：编译器会将抽象语法树（HIR）中的 `Expr::String("Next")` 替换为 `Expr::I18nString { key: "Next", string_idx: 0 }`
3. **代码生成阶段**：针对每个 `I18nString`，编译器会生成区域设置分支逻辑，在运行时选择正确的翻译内容
4. **区域设置检测**：启动阶段，`perry_i18n_init()` 通过原生 API 检测系统区域设置，并设置全局区域设置索引

## 区域设置检测

| 平台      | 实现方式 |
|-----------|----------|
| macOS     | `CFLocaleCopyCurrent()`（CoreFoundation） |
| iOS       | `CFLocaleCopyCurrent()`（CoreFoundation） |
| Android   | `__system_property_get("persist.sys.locale")` |
| Windows   | `GetUserDefaultLocaleName()`（Win32） |
| Linux     | `LANG` / `LC_ALL` / `LC_MESSAGES` 环境变量 |

检测到的区域设置会与配置的区域列表进行模糊匹配：`de_DE.UTF-8` 匹配 `de`、`en-US` 匹配 `en` 等。

## 平台输出

编译移动端目标时，Perry 会在二进制文件旁生成平台原生的区域设置资源文件：

| 平台      | 输出内容 |
|-----------|----------|
| iOS/macOS | `.app` 包内的 `{locale}.lproj/Localizable.strings` 文件 |
| Android   | `res/values-{locale}/strings.xml` 文件 |
| 桌面端    | 字符串直接嵌入二进制文件（无额外文件） |

## 后续参考

- [Interpolation & Plurals](interpolation) — 插值与复数
- [格式化](formatting)
- [命令行工具](cli)