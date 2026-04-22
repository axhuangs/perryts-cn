# 编译器标志

Perry CLI 标志的完整参考。

## 全局标志

在所有命令上可用：

| 标志 | 描述 |
|------|------|
| `--format text\|json` | 输出格式（默认：`text`） |
| `-v, --verbose` | 增加详细程度（可重复：`-v`、`-vv`、`-vvv`） |
| `-q, --quiet` | 抑制非错误输出 |
| `--no-color` | 禁用 ANSI 颜色代码 |

## 编译目标

使用 `--target` 交叉编译：

| 目标 | 平台 | 注意 |
|------|------|------|
| *(none)* | 当前平台 | 默认行为 |
| `ios-simulator` | iOS 模拟器 | ARM64 模拟器二进制文件 |
| `ios` | iOS 设备 | ARM64 设备二进制文件 |
| `android` | Android | ARM64/ARMv7 |
| `ios-widget` | iOS 控件 | WidgetKit 扩展（需要 `--app-bundle-id`） |
| `ios-widget-simulator` | iOS 控件 (Sim) | 模拟器的控件 |
| `watchos-widget` | watchOS 并发症 | watchOS 的 WidgetKit 扩展 |
| `watchos-widget-simulator` | watchOS 控件 (Sim) | watchOS 模拟器的控件 |
| `android-widget` | Android 控件 | Android App Widget (AppWidgetProvider) |
| `wearos-tile` | Wear OS Tile | Wear OS Tile (TileService) |
| `wasm` | WebAssembly | 自包含 HTML 与 WASM 或原始 `.wasm` 二进制文件 |
| `web` | Web | 输出 HTML 文件与 JS |
| `windows` | Windows | Win32 可执行文件 |
| `linux` | Linux | GTK4 可执行文件 |

## 输出类型

使用 `--output-type` 更改生成的内容：

| 类型 | 描述 |
|------|------|
| `executable` | 独立二进制文件（默认） |
| `dylib` | 共享库（`.dylib`/`.so`）用于 [插件](../plugins/overview.md) |

## 调试标志

| 标志 | 描述 |
|------|------|
| `--print-hir` | 打印 HIR（中间表示）到 stdout |
| `--no-link` | 仅生成 `.o` 对象文件，跳过链接 |
| `--keep-intermediates` | 保留 `.o` 和 `.asm` 中间文件 |

## 输出优化

| 标志 | 描述 |
|------|------|
| `--minify` | 缩小并混淆输出（自动为 `--target web` 启用） |

缩小会剥离注释、折叠空白，并混淆局部变量/参数/非导出的函数名称以获得更小的输出。

## 测试标志

| 标志 | 描述 |
|------|------|
| `--enable-geisterhand` | 嵌入 [Geisterhand](../testing/geisterhand.md) HTTP 服务器用于编程 UI 测试（默认端口 7676） |
| `--geisterhand-port <PORT>` | 为 Geisterhand 服务器设置自定义端口（意味着 `--enable-geisterhand`） |

## 运行时标志

| 标志 | 描述 |
|------|------|
| `--enable-js-runtime` | 启用 V8 JavaScript 运行时用于不支持的 npm 包 |
| `--type-check` | 通过 tsgo IPC 启用类型检查 |

## 环境变量

| 变量 | 描述 |
|------|------|
| `PERRY_LICENSE_KEY` | Perry Hub 许可证密钥 |
| `PERRY_APPLE_CERTIFICATE_PASSWORD` | .p12 证书的密码 |
| `PERRY_NO_UPDATE_CHECK=1` | 禁用后台更新检查 |
| `PERRY_UPDATE_SERVER` | 自定义更新服务器 URL |
| `CI=true` | 自动跳过更新检查（大多数 CI 系统设置） |
| `RUST_LOG` | 调试日志级别（`debug`、`info`、`trace`） |

## 配置文件

### perry.toml (项目)

```toml
[project]
name = "my-app"
entry = "src/main.ts"

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

### ~/.perry/config.toml (全局)

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
# 简单 CLI 程序
perry main.ts -o app

# iOS 模拟器应用
perry app.ts -o app --target ios-simulator

# Web 应用 (WASM 与 DOM 桥接——别名：--target wasm)
perry app.ts -o app --target web

# 插件共享库
perry plugin.ts --output-type dylib -o plugin.dylib

# 具有捆绑包 ID 的 iOS 控件
perry widget.ts --target ios-widget --app-bundle-id com.example.app

# 调试编译
perry app.ts --print-hir 2>&1 | less

# 详细编译
perry compile app.ts -o app -vvv

# 类型检查编译
perry app.ts -o app --type-check

# 原始 WASM 二进制文件（无 HTML 包装器）
perry app.ts -o app.wasm --target wasm

# 缩小 web 输出（压缩嵌入的 JS 桥接）
perry app.ts -o app --target web --minify
```

## Next Steps

- [Commands](commands.md) — 所有 CLI 命令
- [Platform Overview](../platforms/overview.md) — 平台目标