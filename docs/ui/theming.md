# 主题

`perry-styling` 包为 Perry UI 提供设计系统桥接 — 设计令牌代码生成和具有编译时平台检测的人体工程学样式助手。

## 安装

```bash
npm install perry-styling
```

## 设计令牌代码生成

从 JSON 令牌定义生成类型化主题文件：

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

带有 `-dark` 后缀的颜色用作暗模式变体。如果未提供暗变体，则浅色值用于两种模式。支持的颜色格式：十六进制（`#RGB`、`#RRGGBB`、`#RRGGBBAA`）、`rgb()`/`rgba()`、`hsl()`/`hsla()` 和 CSS 命名颜色。

## 生成的类型

代码生成产生类型化接口：

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

根据系统的暗模式设置在运行时解析主题：

```typescript
import { getTheme } from "perry-styling";
import { theme } from "./theme"; // generated file

const resolved = getTheme(theme);
// resolved.colors.primary → the correct light/dark variant
```

`getTheme()` 调用 `perry/system` 中的 `isDarkMode()` 并返回适当的调色板。

## 样式助手

用于将样式应用于小部件句柄的人体工程学函数：

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

### 可用助手

| Function | Description |
|----------|-------------|
| `applyBg(widget, color)` | Set background color |
| `applyRadius(widget, color)` | Set corner radius |
| `applyTextColor(widget, color)` | Set text color |
| `applyFontSize(widget, size)` | Set font size |
| `applyFontBold(widget)` | Set bold font weight |
| `applyFontFamily(widget, family)` | Set font family |
| `applyWidth(widget, width)` | Set width |
| `applyTooltip(widget, text)` | Set tooltip text |
| `applyBorderColor(widget, color)` | Set border color |
| `applyBorderWidth(widget, width)` | Set border width |
| `applyEdgeInsets(widget, t, r, b, l)` | Set edge insets (padding) |
| `applyOpacity(widget, alpha)` | Set opacity |
| `applyGradient(widget, start, end, dir)` | Set gradient (0=vertical, 1=horizontal) |
| `applyButtonBg(btn, color)` | Set button background |
| `applyButtonTextColor(btn, color)` | Set button text color |
| `applyButtonBordered(btn)` | Set bordered button style |

## 平台常量

`perry-styling` 基于 `__platform__` 内置导出编译时平台常量：

```typescript
import { isMac, isIOS, isAndroid, isWindows, isLinux, isDesktop, isMobile } from "perry-styling";

if (isMobile) {
  applyFontSize(label, 16);
} else {
  applyFontSize(label, 14);
}
```

这些在编译时由 LLVM 常量折叠 — 死分支被消除，没有运行时成本。

## 下一步

- [Styling](styling.md) — 小部件样式基础
- [State Management](state.md) — 反应式绑定