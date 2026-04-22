# perry.toml 参考

`perry.toml` 是 Perry 的项目级配置文件。它控制项目元数据、构建设置、平台特定选项、代码签名、分发、审计和验证。

由 `perry init` 自动创建，它位于您的项目根目录中 `package.json` 旁边。

## 最小示例

```toml
[project]
name = "my-app"
entry = "src/main.ts"

[build]
out_dir = "dist"
```

## 完整示例

```toml
[project]
name = "my-app"
version = "1.2.0"
build_number = 42
bundle_id = "com.example.myapp"
description = "A cross-platform Perry application"
entry = "src/main.ts"

[project.icons]
source = "assets/icon.png"

[build]
out_dir = "dist"

[macos]
bundle_id = "com.example.myapp.macos"
category = "public.app-category.developer-tools"
minimum_os = "13.0"
entitlements = ["com.apple.security.network.client"]
distribute = "both"
signing_identity = "Developer ID Application: My Company (TEAMID)"
certificate = "certs/mac-appstore.p12"
notarize_certificate = "certs/mac-devid.p12"
notarize_signing_identity = "Developer ID Application: My Company (TEAMID)"
installer_certificate = "certs/mac-installer.p12"
team_id = "ABCDE12345"
key_id = "KEYID123"
issuer_id = "issuer-uuid-here"
p8_key_path = "certs/AuthKey.p8"
encryption_exempt = true

[ios]
bundle_id = "com.example.myapp.ios"
deployment_target = "16.0"
device_family = ["iphone", "ipad"]
orientations = ["portrait", "landscape-left", "landscape-right"]
capabilities = ["push-notification"]
distribute = "appstore"
entry = "src/main-ios.ts"
provisioning_profile = "certs/MyApp.mobileprovision"
certificate = "certs/ios-distribution.p12"
signing_identity = "iPhone Distribution: My Company (TEAMID)"
team_id = "ABCDE12345"
key_id = "KEYID123"
issuer_id = "issuer-uuid-here"
p8_key_path = "certs/AuthKey.p8"
encryption_exempt = true

[android]
package_name = "com.example.myapp"
min_sdk = "26"
target_sdk = "34"
permissions = ["INTERNET", "CAMERA"]
distribute = "playstore"
keystore = "certs/release.keystore"
key_alias = "my-key"
google_play_key = "certs/play-service-account.json"
entry = "src/main-android.ts"

[linux]
format = "appimage"
category = "Development"
description = "A cross-platform Perry application"

[i18n]
locales = ["en", "de", "fr"]
default_locale = "en"

[i18n.currencies]
en = "USD"
de = "EUR"
fr = "EUR"

[publish]
server = "https://hub.perryts.com"

[audit]
fail_on = "B"
severity = "high"
ignore = ["RULE-001", "RULE-002"]

[verify]
url = "https://verify.perryts.com"
```

---

## 部分

### `[project]`

核心项目元数据。这是识别您的应用程序的主要部分。

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `name` | string | 目录名称 | 项目名称，用于二进制输出名称和默认捆绑包 ID |
| `version` | string | `"1.0.0"` | 语义版本字符串（例如，`"1.2.3"`） |
| `build_number` | integer | `1` | 数值构建号；在 `perry publish` 上为 iOS、Android 和 macOS App Store 构建自动递增 |
| `description` | string | — | 人类可读的项目描述 |
| `entry` | string | — | TypeScript 入口文件（例如，`"src/main.ts"`）。由 `perry run` 和 `perry publish` 使用，当未指定输入文件时 |
| `bundle_id` | string | `com.perry.<name>` | 默认捆绑包标识符，当平台特定部分未定义时使用 |

#### `[project.icons]`

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `source` | string | — | 源图标图像的路径（PNG 或 JPG）。Perry 自动调整大小为每个平台的所有必需大小 |

### `[app]`

`[project]` 的替代品，具有相同的字段。用于组织清晰度——`[app]` 在存在时优先于 `[project]`：

```toml
# 这两个是等效的：
[project]
name = "my-app"

# 或：
[app]
name = "my-app"
```

当两者存在时，解析顺序为：`[app]` 字段 -> `[project]` 字段 -> 默认。

`[app]` 支持与 `[project]` 相同的字段：`name`、`version`、`build_number`、`bundle_id`、`description`、`entry` 和 `icons`。

---

### `[build]`

构建输出设置。

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `out_dir` | string | `"dist"` | 构建工件的目录 |

---

### `[macos]`

macOS 特定配置，用于 `perry publish macos` 和 `perry compile --target macos`。

#### 应用元数据

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `bundle_id` | string | 回退到 `[app]`/`[project]` | macOS 特定捆绑包标识符（例如，`"com.example.myapp"`） |
| `category` | string | — | Mac App Store 类别。使用 Apple's UTI 格式（见下面的 [有效值](#macos-app-store-categories)） |
| `minimum_os` | string | — | 所需的最低 macOS 版本（例如，`"13.0"`） |
| `entitlements` | string[] | — | 要包含在代码签名中的 macOS 权利（例如，`["com.apple.security.network.client"]`） |
| `encryption_exempt` | bool | `false` | 如果 `true`，在 Info.plist 中添加 `ITSAppUsesNonExemptEncryption = false`，跳过 App Store Connect 中的导出合规提示 |

#### 分发

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `distribute` | string | — | 分发方法：`"appstore"`、`"notarize"` 或 `"both"`（见 [Distribution Modes](#macos-distribution-modes)） |

#### 代码签名

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `signing_identity` | string | 从 Keychain 自动检测 | 代码签名身份名称（例如，`"3rd Party Mac Developer Application: Company (TEAMID)"`） |
| `certificate` | string | 从 Keychain 自动导出 | App Store 分发的 `.p12` 证书文件路径 |
| `notarize_certificate` | string | — | 公证的单独 `.p12` 证书（仅用于 `distribute = "both"`） |
| `notarize_signing_identity` | string | — | 公证的签名身份（仅用于 `distribute = "both"`） |
| `installer_certificate` | string | — | Mac Installer Distribution 的 `.p12` 证书（`.pkg` 签名） |

#### App Store Connect

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `team_id` | string | 从 `~/.perry/config.toml` | Apple 开发者团队 ID |
| `key_id` | string | 从 `~/.perry/config.toml` | App Store Connect API 密钥 ID |
| `issuer_id` | string | 从 `~/.perry/config.toml` | App Store Connect 发行者 ID |
| `p8_key_path` | string | 从 `~/.perry/config.toml` | App Store Connect `.p8` API 密钥文件的路径 |

#### macOS 分发模式

`distribute` 字段控制您的 macOS 应用如何签名和分发：

- **`"appstore"`** — 使用 App Store 分发证书签名并上传到 App Store Connect。需要 `team_id`、`key_id`、`issuer_id` 和 `p8_key_path`。

- **`"notarize"`** — 使用开发者 ID 证书签名并公证 Apple。用于 App Store 之外的直接分发。

- **`"both"`** — 产生**两个**签名构建：一个用于 App Store，一个用于直接分发公证。需要**两个单独的证书**：
  - `certificate` + `signing_identity` 用于 App Store 构建
  - `notarize_certificate` + `notarize_signing_identity` 用于公证构建
  - 可选 `installer_certificate` 用于 `.pkg` 签名

#### macOS App Store 类别

`category` 字段的常见值（Apple UTI 格式）：

| 类别 | 值 |
|------|-----|
| 商业 | `public.app-category.business` |
| 开发者工具 | `public.app-category.developer-tools` |
| 教育 | `public.app-category.education` |
| 娱乐 | `public.app-category.entertainment` |
| 金融 | `public.app-category.finance` |
| 游戏 | `public.app-category.games` |
| 图形与设计 | `public.app-category.graphics-design` |
| 健康与健身 | `public.app-category.healthcare-fitness` |
| 生活方式 | `public.app-category.lifestyle` |
| 音乐 | `public.app-category.music` |
| 新闻 | `public.app-category.news` |
| 摄影 | `public.app-category.photography` |
| 生产力 | `public.app-category.productivity` |
| 社交网络 | `public.app-category.social-networking` |
| 实用工具 | `public.app-category.utilities` |

---

### `[ios]`

iOS 特定配置，用于 `perry publish ios`、`perry run ios` 和 `perry compile --target ios`/`--target ios-simulator`。

#### 应用元数据

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `bundle_id` | string | 回退到 `[app]`/`[project]` | iOS 特定捆绑包标识符 |
| `deployment_target` | string | `"17.0"` | 所需的最低 iOS 版本（例如，`"16.0"`） |
| `minimum_version` | string | — | `deployment_target` 的别名 |
| `device_family` | string[] | `["iphone", "ipad"]` | 支持的设备系列 |
| `orientations` | string[] | `["portrait"]` | 支持的界面方向 |
| `capabilities` | string[] | — | 应用能力（例如，`["push-notification"]`） |
| `entry` | string | 回退到 `[project]`/`[app]` | iOS 特定入口文件（当 iOS 需要不同的入口点时有用） |
| `encryption_exempt` | bool | `false` | 如果 `true`，在 Info.plist 中添加 `ITSAppUsesNonExemptEncryption = false` |

#### 分发

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `distribute` | string | — | 分发方法：`"appstore"`、`"testflight"` 或 `"development"` |

#### 代码签名

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `signing_identity` | string | 从 Keychain 自动检测 | 代码签名身份（例如，`"iPhone Distribution: Company (TEAMID)"`） |
| `certificate` | string | 从 Keychain 自动导出 | `.p12` 分发证书文件路径 |
| `provisioning_profile` | string | — | `.mobileprovision` 文件路径。由 `perry setup ios` 存储为 `~/.perry/{bundle_id}.mobileprovision` |

#### App Store Connect

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `team_id` | string | 从 `~/.perry/config.toml` | Apple 开发者团队 ID |
| `key_id` | string | 从 `~/.perry/config.toml` | App Store Connect API 密钥 ID |
| `issuer_id` | string | 从 `~/.perry/config.toml` | App Store Connect 发行者 ID |
| `p8_key_path` | string | 从 `~/.perry/config.toml` | `.p8` API 密钥文件的路径 |

#### 设备系列值

| 值 | 描述 |
|-----|------|
| `"iphone"` | iPhone 设备 |
| `"ipad"` | iPad 设备 |

#### 方向值

| 值 | 描述 |
|-----|------|
| `"portrait"` | 设备直立 |
| `"portrait-upside-down"` | 设备颠倒 |
| `"landscape-left"` | 设备向左旋转 |
| `"landscape-right"` | 设备向右旋转 |

---

### `[android]`

Android 特定配置，用于 `perry publish android`、`perry run android` 和 `perry compile --target android`。

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `package_name` | string | 回退到 bundle_id 链 | Java 包名称（例如，`"com.example.myapp"`) |
| `min_sdk` | string | — | 最低 Android SDK 版本（例如，`"26"` 表示 Android 8.0） |
| `target_sdk` | string | — | 目标 Android SDK 版本（例如，`"34"` 表示 Android 14） |
| `permissions` | string[] | — | Android 权限（例如，`["INTERNET", "CAMERA", "ACCESS_FINE_LOCATION"]`） |
| `distribute` | string | — | 分发方法：`"playstore"` |
| `keystore` | string | — | `.jks` 或 `.keystore` 签名密钥库的路径 |
| `key_alias` | string | — | 密钥库中签名密钥的别名 |
| `google_play_key` | string | — | Google Play 服务账户 JSON 文件的路径，用于自动上传 |
| `entry` | string | 回退到 `[project]`/`[app]` | Android 特定入口文件 |

---

### `[linux]`

Linux 特定配置，用于 `perry publish linux`。

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `format` | string | — | 包格式：`"appimage"`、`"deb"` 或 `"rpm"` |
| `category` | string | — | 桌面应用类别（例如，`"Development"`、`"Utility"`、`"Game"`） |
| `description` | string | 回退到 `[project]`/`[app]` | 包元数据的应用描述 |

---

### `[i18n]`

国际化配置。有关完整详细信息，请参阅 [i18n 文档](../i18n/overview.md)。

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `locales` | string[] | — | 支持的区域设置代码（例如，`["en", "de", "fr"]`）。区域设置文件必须存在于 `/locales` 中 |
| `default_locale` | string | `"en"` | 回退区域设置。当另一个区域设置中缺少键时使用 |
| `dynamic` | boolean | `false` | `false`：区域设置在启动时设置，字符串内联。`true`：运行时可切换区域设置 |

### `[i18n.currencies]`

将区域设置代码映射到默认 ISO 4217 货币代码。由 `Currency()` 格式包装器使用。

| 键 | 类型 | 描述 |
|-----|------|------|
| `{locale}` | string | 区域设置的货币代码（例如，`en = "USD"`、`de = "EUR"`） |

---

### `[publish]`

发布配置。

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `server` | string | `https://hub.perryts.com` | 自定义 Perry Hub 构建服务器 URL。用于自托管或企业部署 |

---

### `[audit]`

安全审计配置，用于 `perry audit` 和预发布审计。

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `fail_on` | string | `"C"` | 最低可接受的审计等级。如果实际等级低于此阈值，则构建失败。值：`"A"`、`"A-"`、`"B"`、`"C"`、`"D"`、`"F"` |
| `severity` | string | `"all"` | 按严重性过滤发现：`"all"`、`"critical"`、`"high"`、`"medium"`、`"low"` |
| `ignore` | string[] | — | 要抑制的审计规则 ID 列表（例如，`["RULE-001", "RULE-042"]`） |

#### 审计等级规模

等级从最高到最低排名：

| 等级 | 排名 | 描述 |
|------|------|------|
| A | 6 | 优秀——无重大发现 |
| A- | 5 | 非常好——仅次要发现 |
| B | 4 | 好——一些发现 |
| C | 3 | 可接受——中等发现 |
| D | 2 | 差——重大发现 |
| F | 1 | 失败——关键发现 |

设置 `fail_on = "B"` 意味着任何低于 B 的等级（即 C、D 或 F）将导致构建失败。

---

### `[verify]`

运行时验证配置，用于 `perry verify`。

| 字段 | 类型 | 默认 | 描述 |
|------|------|------|------|
| `url` | string | `https://verify.perryts.com` | 验证服务端点 URL |

---

## 捆绑包 ID 解析

Perry 使用级联优先级系统解析捆绑包标识符。第一个非空值获胜：

### 对于 iOS 构建：
1. `[ios].bundle_id`
2. `[app].bundle_id`
3. `[project].bundle_id`
4. `[macos].bundle_id`
5. `package.json` `bundleId` 字段
6. `com.perry.<app_name>`（生成的默认）

### 对于 macOS 构建：
1. `[macos].bundle_id`
2. `[app].bundle_id`
3. `[project].bundle_id`
4. `package.json` `bundleId` 字段
5. `com.perry.<app_name>`（生成的默认）

### 对于 Android 构建：
1. `[android].package_name`
2. `[ios].bundle_id`
3. `[macos].bundle_id`
4. `[app].bundle_id`
5. `[project].bundle_id`
6. `com.perry.<app_name>`（生成的默认）

---

## 入口文件解析

当未在命令行上指定输入文件时，Perry 按此顺序解析入口文件：

1. `[ios].entry` / `[android].entry`（当针对该平台时）
2. `[project].entry` 或 `[app].entry`
3. `src/main.ts`（如果存在）
4. `main.ts`（如果存在）

---

## 构建号自动递增

`build_number` 字段由 `perry publish` 为以下构建自动递增：
- iOS 构建
- Android 构建
- macOS App Store 构建（`distribute = "appstore"` 或 `"both"`）

成功发布后，更新的值写回 `perry.toml`。这确保每次提交到 App Store / Play Store 都有唯一的、单调递增的构建号。

macOS 构建与 `distribute = "notarize"`（直接分发）**不**自动递增构建号。

---

## 配置优先级

Perry 使用分层优先级系统解析配置值（最高到最低）：

1. **CLI 标志** — 例如，`--target`、`--output`
2. **环境变量** — 例如，`PERRY_LICENSE_KEY`
3. **perry.toml** — 项目级配置（平台特定部分优先，然后是 `[app]`/`[project]`）
4. **~/.perry/config.toml** — 用户级全局配置
5. **内置默认**

---

## 环境变量

这些环境变量覆盖 perry.toml 和全局配置值：

### Apple / iOS / macOS

| 变量 | 描述 |
|------|------|
| `PERRY_LICENSE_KEY` | Perry Hub 许可证密钥 |
| `PERRY_APPLE_CERTIFICATE` | `.p12` 证书文件内容（base64） |
| `PERRY_APPLE_CERTIFICATE_PASSWORD` | `.p12` 证书的密码 |
| `PERRY_APPLE_P8_KEY` | `.p8` API 密钥文件内容 |
| `PERRY_APPLE_KEY_ID` | App Store Connect API 密钥 ID |
| `PERRY_APPLE_NOTARIZE_CERTIFICATE_PASSWORD` | 公证 `.p12` 证书的密码 |
| `PERRY_APPLE_INSTALLER_CERTIFICATE_PASSWORD` | 安装程序 `.p12` 证书的密码 |

### Android

| 变量 | 描述 |
|------|------|
| `PERRY_ANDROID_KEYSTORE` | `.jks`/`.keystore` 文件的路径 |
| `PERRY_ANDROID_KEY_ALIAS` | 密钥库密钥别名 |
| `PERRY_ANDROID_KEYSTORE_PASSWORD` | 密钥库密码 |
| `PERRY_ANDROID_KEY_PASSWORD` | 密钥库中密钥的密码（在密钥库内） |
| `PERRY_GOOGLE_PLAY_KEY_PATH` | Google Play 服务账户 JSON 的路径 |

### 一般

| 变量 | 描述 |
|------|------|
| `PERRY_NO_TELEMETRY` | 设置为 `1` 以禁用匿名遥测 |
| `PERRY_NO_UPDATE_CHECK` | 设置为 `1` 以禁用后台更新检查 |

---

## 全局配置：`~/.perry/config.toml`

除了项目级 `perry.toml` 之外，Perry 维护一个用户级全局配置，位于 `~/.perry/config.toml`。这存储跨所有项目的凭据和偏好。

```toml
license_key = "perry-xxxxxxxx"
server = "https://hub.perryts.com"
default_target = "macos"

[apple]
team_id = "ABCDE12345"
key_id = "KEYID123"
issuer_id = "issuer-uuid-here"
p8_key_path = "/Users/me/.perry/AuthKey.p8"

[android]
keystore_path = "/Users/me/.perry/release.keystore"
key_alias = "my-key"
google_play_key_path = "/Users/me/.perry/play-service-account.json"
```

perry.toml（项目级）中的字段覆盖 `~/.perry/config.toml`（全局级）。例如，`[ios].team_id` 在 perry.toml 中覆盖全局配置中的 `[apple].team_id`。

全局配置由 `perry setup` 命令管理：
- `perry setup ios` — 配置 iOS 签名凭据
- `perry setup android` — 配置 Android 签名凭据
- `perry setup macos` — 配置 macOS 分发设置

---

## perry.toml vs package.json

Perry 从两个文件中读取配置。以下是每个文件的内容：

| 设置 | 文件 | 部分 |
|------|------|------|
| 原生编译包 | `package.json` | `perry.compilePackages` |
| 启动画面 | `package.json` | `perry.splash` |
| 项目名称、版本、入口 | `perry.toml` | `[project]` |
| 平台特定设置 | `perry.toml` | `[ios]`、 `[macos]`、 `[android]`、 `[linux]` |
| 代码签名和分发 | `perry.toml` | 平台部分 |
| 构建输出目录 | `perry.toml` | `[build]` |
| 审计和验证 | `perry.toml` | `[audit]`、 `[verify]` |

当两个文件定义相同值时（例如，项目名称），`perry.toml` 优先。

---

## 设置向导

运行 `perry setup <platform>` 以交互方式配置签名凭据，并将它们写回 `perry.toml` 和 `~/.perry/config.toml`：

```bash
perry setup ios       # 配置 iOS 签名（证书、provisioning profile）
perry setup android   # 配置 Android 签名（密钥库、Play Store 密钥）
perry setup macos     # 配置 macOS 分发（App Store、公证）
```

向导自动：
- 设置 `[ios].distribute = "testflight"`（如果尚未配置）
- 设置 `[android].distribute = "playstore"`（如果尚未配置）
- 将 provisioning profiles 存储为 `~/.perry/{bundle_id}.mobileprovision`
- 在可能时从 macOS Keychain 自动导出 `.p12` 证书

---

## CI/CD 示例

对于 CI 环境，使用环境变量而不是在 `perry.toml` 中存储凭据：

```yaml
# GitHub Actions 示例
env:
  PERRY_LICENSE_KEY: ${{ secrets.PERRY_LICENSE_KEY }}
  PERRY_APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
  PERRY_APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERT_PASSWORD }}
  PERRY_APPLE_P8_KEY: ${{ secrets.APPLE_P8_KEY }}
  PERRY_APPLE_KEY_ID: ${{ secrets.APPLE_KEY_ID }}
  PERRY_ANDROID_KEYSTORE: ${{ secrets.ANDROID_KEYSTORE }}
  PERRY_ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
  PERRY_ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
  PERRY_ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}

steps:
  - run: perry publish ios
  - run: perry publish android
  - run: perry publish macos
```

将 `perry.toml` 保留在版本控制中，仅包含非敏感字段：

```toml
[project]
name = "my-app"
version = "2.1.0"
build_number = 47
bundle_id = "com.example.myapp"
entry = "src/main.ts"

[ios]
deployment_target = "16.0"
device_family = ["iphone", "ipad"]
distribute = "appstore"
encryption_exempt = true

[android]
package_name = "com.example.myapp"
min_sdk = "26"
target_sdk = "34"
distribute = "playstore"

[macos]
distribute = "both"
category = "public.app-category.productivity"
minimum_os = "13.0"

[audit]
fail_on = "B"
```