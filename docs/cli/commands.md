# CLI 命令

Perry 提供 10 个命令用于编译、检查、运行、发布和管理您的项目。

另请参阅：[perry.toml Reference](perry-toml.md) 以获取项目配置。

## compile

将 TypeScript 编译为原生可执行文件。

```bash
perry compile main.ts -o app
# 或简写（自动检测编译）：
perry main.ts -o app
```

| 标志 | 描述 |
|------|------|
| `-o, --output <PATH>` | 输出文件路径 |
| `--target <TARGET>` | 平台目标（见 [Compiler Flags](flags.md)） |
| `--output-type <TYPE>` | `executable`（默认）或 `dylib`（插件） |
| `--print-hir` | 打印 HIR 中间表示 |
| `--no-link` | 仅生成 `.o` 对象文件，跳过链接 |
| `--keep-intermediates` | 保留 `.o` 和 `.asm` 中间文件 |
| `--enable-js-runtime` | 启用 V8 JavaScript 运行时回退 |
| `--type-check` | 通过 tsgo 启用类型检查 |
| `--minify` | 缩小并混淆输出（自动为 `--target web` 启用） |
| `--app-bundle-id <ID>` | 捆绑包 ID（控件目标需要） |
| `--bundle-extensions <DIR>` | 从目录捆绑 TypeScript 扩展 |

```bash
# 基本编译
perry compile app.ts -o app

# 交叉编译为 iOS 模拟器
perry compile app.ts -o app --target ios-simulator

# 构建插件
perry compile plugin.ts --output-type dylib -o plugin.dylib

# 调试：查看中间表示
perry compile app.ts --print-hir

# 构建 iOS 控件
perry compile widget.ts --target ios-widget --app-bundle-id com.example.app
```

## run

编译并启动您的应用一步到位。

```bash
perry run                          # 自动检测入口文件
perry run ios                      # 在 iOS 设备/模拟器上运行
perry run android                  # 在 Android 设备上运行
perry run -- --port 3000           # 将参数转发到您的程序
```

| 参数 / 标志 | 描述 |
|------|------|
| `ios` | 针对 iOS（设备或模拟器） |
| `macos` | 针对 macOS（macOS 主机上的默认） |
| `web` | 针对 web（在浏览器中打开） |
| `android` | 针对 Android 设备 |
| `--simulator <UDID>` | 按 UDID 指定 iOS 模拟器 |
| `--device <UDID>` | 按 UDID 指定 iOS 物理设备 |
| `--local` | 强制本地编译（无远程回退） |
| `--remote` | 强制通过 Perry Hub 远程构建 |
| `--enable-js-runtime` | 启用 V8 JavaScript 运行时 |
| `--type-check` | 通过 tsgo 启用类型检查 |
| `--` | 分隔符用于程序参数 |

**入口文件检测**（按顺序检查）：
1. `perry.toml` → `[project] entry` 字段
2. `src/main.ts`
3. `main.ts`

**设备检测**：针对 iOS 时，Perry 自动发现可用模拟器（通过 `simctl`）和物理设备（通过 `devicectl`）。对于 Android，它使用 `adb`。当找到多个目标时，一个交互式提示让您选择。

**远程构建回退**：如果本地没有安装交叉编译工具链（例如，macOS 上没有 Xcode 的 iOS 目标），`perry run ios` 自动回退到 Perry Hub 的构建服务器——它打包您的项目、上传它、通过 WebSocket 流式传输构建进度、下载 `.ipa`，并将其安装到您的设备上。使用 `--local` 或 `--remote` 强制任一路径。

```bash
# 运行 CLI 程序
perry run

# 在特定模拟器上运行
perry run ios --simulator 12345-ABCDE

# 强制远程构建
perry run ios --remote

# 运行 web 目标
perry run web
```

## check

在编译前验证 TypeScript 是否兼容 Perry。

```bash
perry check src/
```

| 标志 | 描述 |
|------|------|
| `--check-deps` | 检查 `node_modules` 是否兼容 |
| `--deep-deps` | 扫描所有传递依赖 |
| `--all` | 显示所有问题，包括提示 |
| `--strict` | 将警告视为错误 |
| `--fix` | 自动应用修复 |
| `--fix-dry-run` | 预览修复而不修改文件 |
| `--fix-unsafe` | 包括中等置信度的修复 |

```bash
# 检查单个文件
perry check src/index.ts

# 检查依赖分析
perry check . --check-deps

# 自动修复问题
perry check . --fix

# 预览修复而不应用
perry check . --fix-dry-run
```

## init

创建新的 Perry 项目。

```bash
perry init my-project
cd my-project
```

| 标志 | 描述 |
|------|------|
| `--name <NAME>` | 项目名称（默认为目录名称） |

创建 `perry.toml`、`src/main.ts` 和 `.gitignore`。

## doctor

检查您的 Perry 安装和环境。

```bash
perry doctor
```

| 标志 | 描述 |
|------|------|
| `--quiet` | 仅报告失败 |

检查：
- Perry 版本
- 系统链接器可用性 (cc/MSVC)
- 运行时库
- 项目配置
- 可用更新

## explain

获取错误代码的详细解释。

```bash
perry explain U001
```

错误代码系列：
- **P** — 解析错误
- **T** — 类型错误
- **U** — 不支持的功能
- **D** — 依赖问题

每个解释包括错误描述、示例代码和建议修复。

## publish

构建、签名并分发您的应用。

```bash
perry publish macos
perry publish ios
perry publish android
```

| 参数 / 标志 | 描述 |
|------|------|
| `macos` | 为 macOS 构建（App Store/公证） |
| `ios` | 为 iOS 构建（App Store/TestFlight） |
| `android` | 为 Android 构建（Google Play） |
| `linux` | 为 Linux 构建（AppImage/deb/rpm） |
| `--server <URL>` | 构建服务器（默认：`https://hub.perryts.com`） |
| `--license-key <KEY>` | Perry Hub 许可证密钥 |
| `--project <PATH>` | 项目目录 |
| `-o, --output <PATH>` | 工件输出目录（默认：`dist`） |
| `--no-download` | 跳过工件下载 |

Apple 特定标志：

| 标志 | 描述 |
|------|------|
| `--apple-team-id <ID>` | 开发者团队 ID |
| `--apple-identity <NAME>` | 签名身份 |
| `--apple-p8-key <PATH>` | App Store Connect .p8 密钥 |
| `--apple-key-id <ID>` | App Store Connect API 密钥 ID |
| `--apple-issuer-id <ID>` | App Store Connect 发行者 ID |
| `--certificate <PATH>` | .p12 证书捆绑 |
| `--provisioning-profile <PATH>` | .mobileprovision 文件 (iOS) |

Android 特定标志：

| 标志 | 描述 |
|------|------|
| `--android-keystore <PATH>` | .jks/.keystore 文件 |
| `--android-keystore-password <PASS>` | 密钥库密码 |
| `--android-key-alias <ALIAS>` | 密钥别名 |
| `--android-key-password <PASS>` | 密钥密码 |
| `--google-play-key <PATH>` | Google Play 服务账户 JSON |

首次使用时，`publish` 自动注册免费许可证密钥。

## setup

分发应用的交互式凭据向导。

```bash
perry setup          # 显示平台菜单
perry setup macos    # macOS 设置
perry setup ios      # iOS 设置
perry setup android  # Android 设置
```

将凭据存储在 `~/.perry/config.toml` 中。

## update

检查并安装 Perry 更新。

```bash
perry update             # 更新到最新
perry update --check-only  # 检查而不安装
perry update --force       # 忽略 24h 缓存
```

更新源（按顺序检查）：
1. 自定义服务器（环境/配置）
2. Perry Hub
3. GitHub API

通过 `PERRY_NO_UPDATE_CHECK=1` 或 `CI=true` 选择退出自动更新检查。

## i18n

国际化工具，用于管理区域设置文件和提取可本地化字符串。

### `perry i18n extract`

扫描源文件并生成/更新区域设置 JSON 脚手架：

```bash
perry i18n extract src/main.ts
```

检测 UI 组件调用中的字符串文字（`Button`、`Text`、`Label` 等）和 `t()` 调用。根据 `perry.toml` 中的 `[i18n]` 配置创建 `locales/*.json` 文件。

有关完整详细信息，请参阅 [i18n 文档](../i18n/overview.md)。

## Next Steps

- [Compiler Flags](flags.md) — 完整标志参考
- [Getting Started](../getting-started/installation.md) — 安装