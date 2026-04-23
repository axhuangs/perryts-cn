# 命令行界面（CLI）命令

Perry 提供 10 个命令，用于项目的编译、检查、运行、发布及管理操作。

另请参阅：[perry.toml 参考文档](perry-toml)，了解项目配置相关内容。

## compile（编译）

将 TypeScript 编译为原生可执行文件。

```bash
perry compile main.ts -o app
# 或简写形式（自动识别编译操作）：
perry main.ts -o app
```

| 标志 | 说明 |
|------|-------------|
| `-o, --output <PATH>` | 输出文件路径 |
| `--target <TARGET>` | 平台目标（详见 [编译器标志](flags)） |
| `--output-type <TYPE>` | `executable`（默认值，可执行文件）或 `dylib`（插件） |
| `--print-hir` | 打印高阶中间表示（HIR） |
| `--no-link` | 仅生成目标文件，跳过链接步骤 |
| `--keep-intermediates` | 保留 `.o` 和 `.asm` 中间文件 |
| `--enable-js-runtime` | 启用 V8 JavaScript 运行时降级方案 |
| `--type-check` | 通过 tsgo 启用类型检查 |
| `--minify` | 压缩并混淆输出内容（针对 `--target web` 时自动启用） |
| `--app-bundle-id <ID>` | 应用包标识符（Widget 目标类型必填） |
| `--bundle-extensions <DIR>` | 从指定目录打包 TypeScript 扩展文件 |

```bash
# 基础编译
perry compile app.ts -o app

# 交叉编译为 iOS 模拟器版本
perry compile app.ts -o app --target ios-simulator

# 构建插件
perry compile plugin.ts --output-type dylib -o plugin.dylib

# 调试：查看中间表示
perry compile app.ts --print-hir

# 构建 iOS 小组件
perry compile widget.ts --target ios-widget --app-bundle-id com.myapp.widget
```

## run（运行）

一键完成应用的编译与启动。

```bash
perry run                          # 自动检测入口文件
perry run ios                      # 在 iOS 设备/模拟器运行
perry run android                  # 在 Android 设备运行
perry run -- --port 3000           # 将参数传递给应用程序
```

| 参数 / 标志 | 说明 |
|------|-------------|
| `ios` | 目标平台为 iOS（设备或模拟器） |
| `macos` | 目标平台为 macOS（macOS 主机默认值） |
| `web` | 目标平台为 Web（在浏览器中打开） |
| `android` | 目标平台为 Android 设备 |
| `--simulator <UDID>` | 通过 UDID 指定 iOS 模拟器 |
| `--device <UDID>` | 通过 UDID 指定 iOS 物理设备 |
| `--local` | 强制本地编译（禁用远程降级方案） |
| `--remote` | 强制通过 Perry Hub 进行远程构建 |
| `--enable-js-runtime` | 启用 V8 JavaScript 运行时 |
| `--type-check` | 通过 tsgo 启用类型检查 |
| `--` | 应用程序参数分隔符 |

**入口文件检测规则**（按优先级排序）：
1. `perry.toml` 文件 → `[project] entry` 字段
2. `src/main.ts`
3. `main.ts`

**设备检测逻辑**：针对 iOS 平台时，Perry 会自动发现可用的模拟器（通过 `simctl`）和物理设备（通过 `devicectl`）；针对 Android 平台时，通过 `adb` 检测设备。当检测到多个目标设备时，会弹出交互式提示供用户选择。

**远程构建降级方案**：若本地未安装跨平台编译工具链（例如未安装 Xcode 的机器编译 iOS 目标），`perry run ios` 会自动降级至 Perry Hub 构建服务器——打包项目并上传，通过 WebSocket 流式输出构建进度，下载生成的 `.ipa` 文件并安装到目标设备。可通过 `--local` 或 `--remote` 强制指定本地/远程构建方式。

```bash
# 运行命令行程序
perry run

# 在指定模拟器运行
perry run ios --simulator 12345-ABCDE

# 强制远程构建
perry run ios --remote

# 运行 Web 目标版本
perry run web
```

## check（检查）

验证 TypeScript 代码的 Perry 兼容性，无需执行编译操作。

```bash
perry check src/
```

| 标志 | 说明 |
|------|-------------|
| `--check-deps` | 检查 `node_modules` 依赖的兼容性 |
| `--deep-deps` | 扫描所有传递性依赖 |
| `--all` | 显示所有问题（含提示信息） |
| `--strict` | 将警告视为错误处理 |
| `--fix` | 自动应用修复方案 |
| `--fix-dry-run` | 预览修复方案，不修改文件 |
| `--fix-unsafe` | 包含中等可信度的修复方案 |

```bash
# 检查单个文件
perry check src/index.ts

# 结合依赖分析进行检查
perry check . --check-deps

# 自动修复问题
perry check . --fix

# 预览修复方案（不实际应用）
perry check . --fix-dry-run
```

## init（初始化）

创建新的 Perry 项目。

```bash
perry init my-project
cd my-project
```

| 标志 | 说明 |
|------|-------------|
| `--name <NAME>` | 项目名称（默认值为目录名称） |

该命令会创建 `perry.toml`、`src/main.ts` 和 `.gitignore` 文件。

## doctor（环境诊断）

检查 Perry 安装状态及运行环境。

```bash
perry doctor
```

| 标志 | 说明 |
|------|-------------|
| `--quiet` | 仅报告检测失败项 |

检测项包括：
- Perry 版本
- 系统链接器可用性（cc/MSVC）
- 运行时库
- 项目配置
- 可用更新

## explain（错误说明）

获取错误码的详细说明。

```bash
perry explain U001
```

错误码分类：
- **P** — 解析错误
- **T** — 类型错误
- **U** — 不支持的功能
- **D** — 依赖项问题

每条说明包含错误描述、示例代码及建议修复方案。

## publish（发布）

构建、签名并分发应用程序。

```bash
perry publish macos
perry publish ios
perry publish android
```

| 参数 / 标志 | 说明 |
|------|-------------|
| `macos` | 构建 macOS 版本（用于 App Store 上架/公证） |
| `ios` | 构建 iOS 版本（用于 App Store/TestFlight 分发） |
| `android` | 构建 Android 版本（用于 Google Play 上架） |
| `linux` | 构建 Linux 版本（AppImage/deb/rpm 格式） |
| `--server <URL>` | 构建服务器地址（默认值：`https://hub.perryts.com`） |
| `--license-key <KEY>` | Perry Hub 许可证密钥 |
| `--project <PATH>` | 项目目录路径 |
| `-o, --output <PATH>` | 产物输出目录（默认值：`dist`） |
| `--no-download` | 跳过产物下载步骤 |

Apple 平台专属标志：

| 标志 | 说明 |
|------|-------------|
| `--apple-team-id <ID>` | 开发者团队 ID |
| `--apple-identity <NAME>` | 签名身份 |
| `--apple-p8-key <PATH>` | App Store Connect .p8 密钥文件路径 |
| `--apple-key-id <ID>` | App Store Connect API 密钥 ID |
| `--apple-issuer-id <ID>` | App Store Connect 颁发者 ID |
| `--certificate <PATH>` | .p12 证书包路径 |
| `--provisioning-profile <PATH>` | .mobileprovision 配置文件路径（iOS 平台） |

Android 平台专属标志：

| 标志 | 说明 |
|------|-------------|
| `--android-keystore <PATH>` | .jks/.keystore 密钥库文件路径 |
| `--android-keystore-password <PASS>` | 密钥库密码 |
| `--android-key-alias <ALIAS>` | 密钥别名 |
| `--android-key-password <PASS>` | 密钥密码 |
| `--google-play-key <PATH>` | Google Play 服务账号 JSON 文件路径 |

首次使用 `publish` 命令时，会自动注册免费许可证密钥。

## setup（配置）

用于应用分发的交互式凭证配置向导。

```bash
perry setup          # 显示平台选择菜单
perry setup macos    # 配置 macOS 平台
perry setup ios      # 配置 iOS 平台
perry setup android  # 配置 Android 平台
```

凭证信息会存储在 `~/.perry/config.toml` 文件中。

## update（更新）

检查并安装 Perry 更新。

```bash
perry update             # 更新至最新版本
perry update --check-only  # 仅检查更新，不安装
perry update --force       # 忽略 24 小时缓存强制检查
```

更新源（按优先级排序）：
1. 自定义服务器（环境变量/配置文件指定）
2. Perry Hub
3. GitHub API

可通过设置环境变量 `PERRY_NO_UPDATE_CHECK=1` 或 `CI=true` 关闭自动更新检查。

## i18n（国际化）

国际化工具，用于管理本地化文件及提取可本地化字符串。

### `perry i18n extract`（提取可本地化字符串）

扫描源文件并生成/更新本地化 JSON 模板文件：

```bash
perry i18n extract src/main.ts
```

该命令会检测 UI 组件调用（`Button`、`Text`、`Label` 等）和 `t()` 调用中的字符串字面量，并基于 `perry.toml` 中 `[i18n]` 配置项生成 `locales/*.json` 文件。

完整说明请参阅 [国际化文档](../i18n/overview)。

## 后续参考

- [Compiler Flags](flags) — 完整的标志参考手册
- [Getting Started](../getting-started/installation) — 安装指南