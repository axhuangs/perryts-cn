# 主题定制

`perry-styling` 包为 Perry UI 提供了一套设计系统桥接能力——包含设计令牌代码生成功能，以及具备编译时平台检测能力的易用型样式辅助工具。

## 安装

```bash
npm install perry-styling
```

## 设计令牌代码生成

基于 JSON 令牌定义文件生成类型化的主题文件：

```bash
perry-styling generate --tokens tokens.json --out src/theme.ts
```

### 令牌格式

```json
{
  "colors": {
    "primary": "#007AFF",
    "primary-dark": "#0A84FF",
    "background": "#FFFFFF",
    "background-dark": "#1C1C1E",
    "text": "#000000",
    "text-dark": "#FFFFFF"
  },
  "spacing": {
    "sm": 4,
    "md": 8,
    "lg": 16,
    "xl": 24
  },
  "radius": {
    "sm": 4,
    "md": 8,
    "lg": 16
  },
  "fontSize": {
    "body": 14,
    "heading": 20,
    "caption": 12
  },
  "borderWidth": {
    "thin": 1,
    "medium": 2
  }
}
```

后缀为 `-dark` 的颜色会作为暗黑模式下的变体。若未提供暗黑模式变体，则浅色模式下的值会同时用于两种模式。支持的颜色格式包括：十六进制（`#RGB`、`#RRGGBB`、`#RRGGBBAA`）、`rgb()`/`rgba()`、`hsl()`/`hsla()` 以及 CSS 命名颜色。

## 生成的类型

代码生成工具会产出以下类型化接口：

```typescript
interface PerryColor {
  r: number; g: number; b: number; a: number; // floats in [0, 1]
}

interface PerryTheme {
  light: { [key: string]: PerryColor };
  dark: { [key: string]: PerryColor };
  spacing: { [key: string]: number };
  radius: { [key: string]: number };
  fontSize: { [key: string]: number };
  borderWidth: { [key: string]: number };
}

interface ResolvedTheme {
  colors: { [key: string]: PerryColor };
  spacing: { [key: string]: number };
  radius: { [key: string]: number };
  fontSize: { [key: string]: number };
  borderWidth: { [key: string]: number };
}
```

## 主题解析

在运行时基于系统的暗黑模式设置解析主题：

```typescript
import { getTheme } from "perry-styling";
import { theme } from "./theme"; // generated file

const resolved = getTheme(theme);
// resolved.colors.primary → the correct light/dark variant
```

`getTheme()` 会调用 `perry/system` 中的 `isDarkMode()` 方法，并返回对应的调色板。

## 样式辅助工具

用于为组件句柄应用样式的易用型函数：

```typescript
import { applyBg, applyRadius, applyTextColor, applyFontSize, applyGradient } from "perry-styling";

const label = Text("Hello");
applyTextColor(label, resolved.colors.text);
applyFontSize(label, resolved.fontSize.heading);

const card = VStack(16, [/* ... */]);
applyBg(card, resolved.colors.background);
applyRadius(card, resolved.radius.md);
applyGradient(card, startColor, endColor, 0); // 0=vertical, 1=horizontal
```

### 可用的辅助函数

| 函数 | 描述 |
|----------|-------------|
| `applyBg(widget, color)` | 设置背景色 |
| `applyRadius(widget, radius)` | 设置圆角半径 |
| `applyTextColor(widget, color)` | 设置文本颜色 |
| `applyFontSize(widget, size)` | 设置字体大小 |
| `applyFontBold(widget)` | 设置字体加粗 |
| `applyFontFamily(widget, family)` | 设置字体族 |
| `applyWidth(widget, width)` | 设置宽度 |
| `applyTooltip(widget, text)` | 设置提示文本 |
| `applyBorderColor(widget, color)` | 设置边框颜色 |
| `applyBorderWidth(widget, width)` | 设置边框宽度 |
| `applyEdgeInsets(widget, t, r, b, l)` | 设置边距（内边距） |
| `applyOpacity(widget, alpha)` | 设置不透明度 |
| `applyGradient(widget, start, end, dir)` | 设置渐变（0=垂直方向，1=水平方向） |
| `applyButtonBg(btn, color)` | 设置按钮背景色 |
| `applyButtonTextColor(btn, color)` | 设置按钮文本颜色 |
| `applyButtonBordered(btn)` | 设置按钮为边框样式 |

## 平台常量

`perry-styling` 会基于内置的 `__platform__` 常量导出编译时平台常量：

```typescript
import { isMac, isIOS, isAndroid, isWindows, isLinux, isDesktop, isMobile } from "perry-styling";

if (isMobile) {
  applyFontSize(label, 16);
} else {
  applyFontSize(label, 14);
}
```

这些常量会在编译时由 LLVM 进行常量折叠优化——无效分支会被移除，且不会产生任何运行时开销。

## 后续参考

- [Styling](styling) — 组件样式基础
- [State](state) — 响应式绑定