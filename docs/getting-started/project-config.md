# 项目配置

Perry 项目使用 `perry.toml` 和 `package.json` 进行配置。基本使用不需要特殊配置文件，但较大的项目受益于 Perry 特定的设置。

> **寻找完整的 perry.toml 参考？** 请参阅 [perry.toml 参考](../cli/perry-toml.md) 以获取每个字段、部分、平台选项和环境变量。

## 基本设置

```bash
perry init my-project
cd my-project
```

这会创建一个 `package.json` 和一个启动器 `src/index.ts`。

## package.json

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "main": "src/index.ts",
  "perry": {
    "compilePackages": []
  }
}
```

### Perry 配置

`package.json` 中的 `perry` 字段控制编译器行为：

#### `compilePackages`

列出要原生编译而不是通过 JavaScript 运行时路由的 npm 包：

```json
{
  "perry": {
    "compilePackages": ["@noble/curves", "@noble/hashes"]
  }
}
```

当一个包被列出时，Perry：
1. 在 `node_modules/` 中解析包
2. 优先选择 TypeScript 源代码 (`src/index.ts`) 而不是编译的 JavaScript (`lib/index.js`)
3. 通过 LLVM 原生编译所有函数
4. 在嵌套的 `node_modules/` 中去重以防止重复的链接器符号

这对不依赖 Node.js API 的纯 TypeScript/JavaScript 包有用。使用原生绑定、`eval()` 或动态 `require()` 的包将无法工作。

#### `splash`

为 iOS 和 Android 配置原生启动画面。启动画面在冷启动期间立即出现，在您的应用代码运行之前。

**最小（两个平台共享相同的启动画面）：**

```json
{
  "perry": {
    "splash": {
      "image": "logo/icon-256.png",
      "background": "#FFF5EE"
    }
  }
}
```

**按平台覆盖：**

```json
{
  "perry": {
    "splash": {
      "image": "logo/icon-256.png",
      "background": "#FFF5EE",
      "ios": {
        "image": "logo/splash-ios.png",
        "background": "#FFFFFF"
      },
      "android": {
        "image": "logo/splash-android.png",
        "background": "#FFFFFF"
      }
    }
  }
}
```

**完整自定义覆盖（完全控制）：**

```json
{
  "perry": {
    "splash": {
      "ios": {
        "storyboard": "splash/LaunchScreen.storyboard"
      },
      "android": {
        "layout": "splash/splash_background.xml",
        "theme": "splash/themes.xml"
      }
    }
  }
}
```

| 字段 | 描述 |
|-------|-------------|
| `splash.image` | PNG 图像的路径，在启动画面上居中（两个平台） |
| `splash.background` | 背景的十六进制颜色（默认：`#FFFFFF`） |
| `splash.ios.image` | iOS 特定图像覆盖 |
| `splash.ios.background` | iOS 特定背景颜色 |
| `splash.ios.storyboard` | 自定义 LaunchScreen.storyboard（使用 ibtool 编译） |
| `splash.android.image` | Android 特定图像覆盖 |
| `splash.android.background` | Android 特定背景颜色 |
| `splash.android.layout` | `windowBackground` 的自定义可绘制 XML |
| `splash.android.theme` | 自定义 themes.xml |

**每个平台的解析顺序**：
1. 自定义文件覆盖（storyboard / layout+theme）
2. 平台特定图像/颜色 (`splash.{platform}.image`)
3. 通用图像/颜色 (`splash.image`)
4. 无 `splash` 键 → 空白白色屏幕（向后兼容）

## 使用 npm 包

Perry 原生支持许多流行的 npm 包，无需任何配置：

```typescript
import fastify from "fastify";
import mysql from "mysql2/promise";
import Redis from "ioredis";
import bcrypt from "bcrypt";
```

这些使用 Perry 的内置实现编译为原生代码。请参阅[标准库](../stdlib/overview.md) 以获取完整列表。

对于未原生支持的包，对纯 TS/JS 包使用 `compilePackages`，或对复杂包使用 JavaScript 运行时回退。

## 项目结构

Perry 对项目结构很灵活。常见模式：

```
my-project/
├── package.json
├── src/
│   └── index.ts
└── node_modules/      # 仅对 compilePackages 需要
```

对于 UI 应用：

```
my-app/
├── package.json
├── src/
│   ├── index.ts       # 主应用入口
│   └── components/    # UI 组件
└── assets/            # 图像等
```

## 编译

```bash
# 编译文件
perry src/index.ts -o build/app

# 使用特定目标编译
perry src/index.ts -o build/app --target ios-simulator

# 调试：打印中间表示
perry src/index.ts --print-hir
```

请参阅 [CLI 命令](../cli/commands.md) 以获取所有选项。

## 下一步

- [CLI 命令](../cli/commands.md) — 所有编译器命令和标志
- [支持的功能](../language/supported-features.md) — 哪些 TypeScript 功能有效
- [标准库](../stdlib/overview.md) — 支持的 npm 包