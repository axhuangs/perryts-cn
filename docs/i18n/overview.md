# 国际化 (i18n)

Perry 的 i18n 系统让您编写自然的英语字符串，并在编译时自动翻译它们。零仪式，近零运行时成本。

```typescript
import { Button, Text } from "perry/ui";

Button("Next")                              // 自动本地化
Text("Hello, {name}!", { name: user.name }) // 带插值
```

## 设计原则

- **零仪式**：UI 组件中的字符串字面量自动可本地化键
- **编译时验证**：构建期间捕获缺失翻译、参数不匹配和复数形式错误
- **嵌入式字符串表**：所有翻译作为平面 2D 表烘焙到二进制文件中。近零运行时查找成本
- **平台原生区域设置检测**：在每个平台上使用 OS API（移动端不需要 env var）

## 快速开始

### 1. 将 i18n 配置添加到 perry.toml

```toml
[i18n]
locales = ["en", "de"]
default_locale = "en"
```

### 2. 从代码中提取字符串

```bash
perry i18n extract src/main.ts
```

这会扫描您的源文件并创建 `locales/en.json` 和 `locales/de.json`：

```json
// locales/en.json
{
  "Next": "Next",
  "Back": "Back"
}

// locales/de.json (空值 = 需要翻译)
{
  "Next": "",
  "Back": ""
}
```

### 3. 翻译

填写 `locales/de.json`：

```json
{
  "Next": "Weiter",
  "Back": "Zurck"
}
```

### 4. 构建

```bash
perry compile src/main.ts -o myapp
```

Perry 在编译时验证所有翻译并将它们烘焙到二进制文件中。在运行时，应用检测用户的系统区域设置并显示正确的语言。

## 工作原理

1. **检测**：UI 组件调用（`Button`、`Text`、`Label` 等）中的字符串字面量自动被视为 i18n 键
2. **转换**：编译器将 `Expr::String("Next")` 替换为 `Expr::I18nString { key: "Next", string_idx: 0 }` 在 HIR 中
3. **代码生成**：对于每个 `I18nString`，编译器发出一个区域设置分支，在运行时选择正确的翻译
4. **区域设置检测**：启动时，`perry_i18n_init()` 通过原生 API 检测系统区域设置并设置全局区域设置索引

## 区域设置检测

| 平台 | 方法 |
|----------|--------|
| macOS | `CFLocaleCopyCurrent()` (CoreFoundation) |
| iOS | `CFLocaleCopyCurrent()` (CoreFoundation) |
| Android | `__system_property_get("persist.sys.locale")` |
| Windows | `GetUserDefaultLocaleName()` (Win32) |
| Linux | `LANG` / `LC_ALL` / `LC_MESSAGES` env vars |

检测到的区域设置与您配置的区域设置进行模糊匹配：`de_DE.UTF-8` 匹配 `de`，`en-US` 匹配 `en`，等等。

## 平台输出

为移动目标编译时，Perry 在二进制文件旁边生成平台原生区域设置资源：

| 平台 | 输出 |
|----------|--------|
| iOS/macOS | `{locale}.lproj/Localizable.strings` 在 `.app` 包内 |
| Android | `res/values-{locale}/strings.xml` |
| 桌面 | 字符串嵌入二进制文件（无额外文件） |

## 下一步