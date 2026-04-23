# 编译器标志

Perry 命令行界面（CLI）所有标志的完整参考。

## 全局标志

适用于所有命令：

| 标志 | 描述 |
|------|-------------|
| `--format text\|json` | 输出格式（默认值：`text`） |
| `-v, --verbose` | 提高日志详细程度（可重复使用：`-v`、`-vv`、`-vvv`） |
| `-q, --quiet` | 抑制非错误输出 |
| `--no-color` | 禁用 ANSI 颜色代码 |

## 编译目标

使用 `--target` 进行交叉编译：

| 目标 | 平台 | 说明 |
|--------|----------|-------|
| *(无)* | 当前平台 | 默认行为 |
| `ios-simulator` | iOS 模拟器 | ARM64 模拟器二进制文件 |
| `ios` | iOS 设备 | ARM64 设备二进制文件 |
| `android` | 安卓 | ARM64/ARMv7 架构 |
| `ios-widget` | iOS 小组件 | WidgetKit 扩展（需指定 `--app-bundle-id`） |
| `ios-widget-simulator` | iOS 小组件（模拟器） | 适用于模拟器的小组件 |
| `watchos-widget` | watchOS 复杂功能小组件 | 适用于 Apple Watch 的 WidgetKit 扩展 |
| `watchos-widget-simulator` | watchOS 小组件（模拟器） | 适用于 watchOS 模拟器的小组件 |
| `android-widget` | 安卓小组件 | 安卓应用小组件（基于 AppWidgetProvider） |
| `wearos-tile` | Wear OS 磁贴 | Wear OS 磁贴（基于 TileService） |
| `wasm` | WebAssembly | 包含 WASM 的独立 HTML 文件或原始 `.wasm` 二进制文件 |
| `web` | 网页端 | 输出包含 JS 的 HTML 文件 |
| `windows` | 视窗系统 | Win32 可执行文件 |
| `linux` | 类 Linux 系统 | GTK4 可执行文件 |

## 输出类型

使用 `--output-type` 更改生成产物类型：

| 类型 | 描述 |
|------|-------------|
| `executable` | 独立二进制文件（默认值） |
| `dylib` | 共享库（`.dylib`/`.so` 格式），用于[插件](../plugins/overview) |

## 调试标志

| 标志 | 描述 |
|------|-------------|
| `--print-hir` | 将高级中间表示（HIR）打印至标准输出（stdout） |
| `--no-link` | 仅生成 `.o` 目标文件，跳过链接步骤 |
| `--keep-intermediates` | 保留 `.o` 和 `.asm` 中间文件 |

## 输出优化

| 标志 | 描述 |
|------|-------------|
| `--minify` | 压缩并混淆输出内容（指定 `--target web` 时自动启用） |

代码压缩会移除注释、合并空白字符，并混淆局部变量/参数/非导出函数名称，以减小输出文件体积。

## 测试标志

| 标志 | 描述 |
|------|-------------|
| `--enable-geisterhand` | 嵌入 [Geisterhand](../testing/geisterhand) HTTP 服务器，用于程序化 UI 测试（默认端口 7676） |
| `--geisterhand-port <PORT>` | 为 Geisterhand 服务器设置自定义端口（隐含启用 `--enable-geisterhand`） |

## 运行时标志

| 标志 | 描述 |
|------|-------------|
| `--enable-js-runtime` | 启用 V8 JavaScript 运行时，以兼容未适配的 npm 包 |
| `--type-check` | 通过 tsgo 进程间通信（IPC）启用类型检查 |

## 环境变量

| 变量 | 描述 |
|----------|-------------|
| `PERRY_LICENSE_KEY` | 用于 `perry publish` 命令的 Perry Hub 许可证密钥 |
| `PERRY_APPLE_CERTIFICATE_PASSWORD` | .p12 证书的密码 |
| `PERRY_NO_UPDATE_CHECK=1` | 禁用自动更新检查 |
| `PERRY_UPDATE_SERVER` | 自定义更新服务器地址 |
| `CI=true` | 自动跳过更新检查（多数 CI 系统会自动设置） |
| `RUST_LOG` | 调试日志级别（`debug`、`info`、`trace`） |

## 配置文件

### perry.toml（项目级）

```toml
[project]
name = "my-app"
entry = "src/main.ts"
version = "1.0.0"

[build]
out_dir = "build"

[app]
name = "My App"
description = "A Perry application"

[macos]
bundle_id = "com.example.myapp"
category = "public.app-category.developer-tools"
minimum_os = "13.0"
distribute = "notarize"  # "appstore", "notarize", or "both"

[ios]
bundle_id = "com.example.myapp"
deployment_target = "16.0"
device_family = ["iphone", "ipad"]

[android]
package_name = "com.example.myapp"
min_sdk = 26
target_sdk = 34

[linux]
format = "appimage"  # "appimage", "deb", "rpm"
category = "Development"
```

### ~/.perry/config.toml（全局级）

```toml
[apple]
team_id = "XXXXXXXXXX"
signing_identity = "Developer ID Application: Your Name"

[android]
keystore_path = "/path/to/keystore.jks"
key_alias = "my-key"
```

## 示例

```bash
# Simple CLI program
perry main.ts -o app

# iOS app for simulator
perry app.ts -o app --target ios-simulator

# Web app (WASM with DOM bridge — alias: --target wasm)
perry app.ts -o app --target web

# Plugin shared library
perry plugin.ts --output-type dylib -o plugin.dylib

# iOS widget with bundle ID
perry widget.ts --target ios-widget --app-bundle-id com.example.app

# Debug compilation
perry app.ts --print-hir 2>&1 | less

# Verbose compilation
perry compile app.ts -o app -vvv

# Type-checked compilation
perry app.ts -o app --type-check

# Raw WASM binary (no HTML wrapper)
perry app.ts -o app.wasm --target wasm

# Minified web output (compresses embedded JS bridge)
perry app.ts -o app --target web --minify
```

## 后续参考

- [Commands](commands) — 所有 CLI 命令
- [Platform Overview](../platforms/overview) — 平台编译目标