# 项目配置

Perry 项目使用 `perry.toml` 和 `package.json` 进行配置。基础使用场景下无需特殊配置文件，但大型项目可借助 Perry 专属配置项实现更优效果。

> **查阅完整的 perry.toml 配置参考？** 请参见[perry.toml 配置参考](../cli/perry-toml)，内含所有配置字段、配置节、平台选项及环境变量说明。

## 基础搭建

```bash
perry init my-project
cd my-project
```

该命令会生成 `package.json` 文件和初始的 `src/index.ts` 文件。

## package.json 配置

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

### Perry 专属配置

`package.json` 中的 `perry` 字段用于控制编译器行为：

#### `compilePackages`

指定需编译为原生代码的 npm 包列表，替代通过 JavaScript 运行时加载的方式：

```json
{
  "perry": {
    "compilePackages": ["@noble/curves", "@noble/hashes"]
  }
}
```

当包被列入该列表时，Perry 会执行以下操作：
1. 在 `node_modules/` 目录中解析该包；
2. 优先使用 TypeScript 源码文件（`src/index.ts`）而非编译后的 JavaScript 文件（`lib/index.js`）；
3. 通过 LLVM 将所有函数编译为原生代码；
4. 对嵌套 `node_modules/` 中的包进行去重，避免链接器符号重复。

该配置适用于不依赖 Node.js API 的纯 TypeScript/JavaScript 包。使用原生绑定、`eval()` 函数或动态 `require()` 的包无法兼容此配置。

#### `splash`

为 iOS 和 Android 平台配置原生启动屏。启动屏会在冷启动阶段立即显示，早于应用代码执行。

**最简配置（双平台共用同一张启动屏）：**

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

**按平台覆盖配置：**

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

**完全自定义覆盖（全量控制）：**

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
| `splash.image` | PNG 图片路径，在启动屏中居中显示（双平台通用） |
| `splash.background` | 背景色（十六进制格式），默认值：`#FFFFFF` |
| `splash.ios.image` | iOS 平台专属图片覆盖项 |
| `splash.ios.background` | iOS 平台专属背景色 |
| `splash.ios.storyboard` | 自定义 LaunchScreen.storyboard 文件（通过 ibtool 编译） |
| `splash.android.image` | Android 平台专属图片覆盖项 |
| `splash.android.background` | Android 平台专属背景色 |
| `splash.android.layout` | 用于 `windowBackground` 的自定义 drawable XML 文件 |
| `splash.android.theme` | 自定义 themes.xml 主题文件 |

**各平台配置解析优先级**：
1. 自定义文件覆盖项（storyboard / layout + theme）
2. 平台专属图片/颜色配置（`splash.{platform}.image`）
3. 通用图片/颜色配置（`splash.image`）
4. 无 `splash` 配置项 → 空白白屏（向下兼容）

## npm 包使用

Perry 原生支持众多主流 npm 包，无需额外配置：

```typescript
import fastify from "fastify";
import mysql from "mysql2/promise";
import Redis from "ioredis";
import bcrypt from "bcrypt";
```

这些包会通过 Perry 内置实现编译为原生代码。完整支持列表请参见[标准库](../stdlib/overview)。

对于非原生支持的包：纯 TS/JS 包可使用 `compilePackages` 配置；复杂包可使用 JavaScript 运行时降级方案。

## 项目结构

Perry 对项目结构兼容度高，常见目录结构如下：

```
my-project/
├── package.json
├── src/
│   └── index.ts
└── node_modules/      # 仅在使用 compilePackages 时需要
```

UI 应用推荐结构：

```
my-app/
├── package.json
├── src/
│   ├── index.ts       # 应用入口文件
│   └── components/    # UI 组件目录
└── assets/            # 图片等静态资源目录
```

## 编译命令

```bash
# 编译单个文件
perry src/index.ts -o build/app

# 指定编译目标平台
perry src/index.ts -o build/app --target ios-simulator

# 调试模式：打印中间表示代码
perry src/index.ts --print-hir
```

所有编译选项请参见 [CLI 命令](../cli/commands)。

## 后续参考

- [CLI 命令](../cli/commands)
- [支持的特性](../language/supported-features)
- [标准库](../stdlib/overview)

