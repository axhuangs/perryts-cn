# perry.toml 参考文档

`perry.toml` 是 Perry 的项目级配置文件。它管控项目元数据、构建设置、平台专属选项、代码签名、分发、审计以及验证相关配置。

该文件由 `perry init` 命令自动创建，存放于项目根目录，与 `package.json` 同级。

## 最简示例

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

## 配置章节

### `[project]`

核心项目元数据。该章节是标识应用程序的首要配置区域。

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `name` | 字符串 | 目录名称 | 项目名称，用于二进制输出文件名和默认 Bundle ID |
| `version` | 字符串 | `"1.0.0"` | 语义化版本字符串（例如：`"1.2.3"`） |
| `build_number` | 整数 | `1` | 数字型构建版本号；执行 `perry publish` 时，针对 iOS、Android 和 macOS App Store 构建会自动递增 |
| `description` | 字符串 | — | 易读的项目描述 |
| `entry` | 字符串 | — | TypeScript 入口文件（例如：`"src/main.ts"`）。未指定输入文件时，`perry run` 和 `perry publish` 会使用该配置 |
| `bundle_id` | 字符串 | `com.perry.<name>` | 默认 Bundle 标识符，当平台专属章节未定义时作为兜底值 |

#### `[project.icons]`

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `source` | 字符串 | — | 源图标文件路径（PNG 或 JPG 格式）。Perry 会自动将其缩放为各平台所需的所有尺寸 |

### `[app]`

`[project]` 的替代配置章节，字段完全相同。便于配置结构梳理——当 `[app]` 和 `[project]` 同时存在时，`[app]` 优先级更高：

```toml
# 以下两种配置等效：
[project]
name = "my-app"

# 或：
[app]
name = "my-app"
```

若两者同时存在，配置解析优先级为：`[app]` 字段 -> `[project]` 字段 -> 默认值。

`[app]` 支持与 `[project]` 完全相同的字段：`name`、`version`、`build_number`、`bundle_id`、`description`、`entry` 和 `icons`。

---

### `[build]`

构建输出相关配置。

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `out_dir` | 字符串 | `"dist"` | 构建产物存放目录 |

---

### `[macos]`

针对 `perry publish macos` 和 `perry compile --target macos` 命令的 macOS 专属配置。

#### 应用元数据

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `bundle_id` | 字符串 | 兜底至 `[app]`/`[project]` 配置 | macOS 专属 Bundle 标识符（例如：`"com.example.myapp"`） |
| `category` | 字符串 | — | Mac App Store 应用分类。采用 Apple 的 UTI 格式（详见下方[macOS 应用商店分类](#macos-应用商店分类)） |
| `minimum_os` | 字符串 | — | 应用所需的最低 macOS 版本（例如：`"13.0"`） |
| `entitlements` | 字符串数组 | — | 要包含在代码签名中的 macOS 权限（例如：`["com.apple.security.network.client"]`） |
| `encryption_exempt` | 布尔值 | `false` | 若设为 `true`，会在 Info.plist 中添加 `ITSAppUsesNonExemptEncryption = false`，跳过 App Store Connect 中的出口合规提示 |

#### 分发配置

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `distribute` | 字符串 | — | 分发方式：`"appstore"`（应用商店）、`"notarize"`（公证）或 `"both"`（两者皆有）（详见[macOS 分发模式](#macos-分发模式)） |

#### 代码签名

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `signing_identity` | 字符串 | 从钥匙串自动检测 | 代码签名标识名称（例如：`"3rd Party Mac Developer Application: Company (TEAMID)"`） |
| `certificate` | 字符串 | 从钥匙串自动导出 | App Store 分发所用的 `.p12` 证书文件路径 |
| `notarize_certificate` | 字符串 | — | 用于公证的独立 `.p12` 证书（仅在 `distribute = "both"` 时生效） |
| `notarize_signing_identity` | 字符串 | — | 用于公证的签名标识（仅在 `distribute = "both"` 时生效） |
| `installer_certificate` | 字符串 | — | 用于 Mac 安装包分发（`.pkg` 签名）的 `.p12` 证书 |

#### App Store Connect 配置

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `team_id` | 字符串 | 取自 `~/.perry/config.toml` | Apple 开发者团队 ID |
| `key_id` | 字符串 | 取自 `~/.perry/config.toml` | App Store Connect API 密钥 ID |
| `issuer_id` | 字符串 | 取自 `~/.perry/config.toml` | App Store Connect 发行者 ID |
| `p8_key_path` | 字符串 | 取自 `~/.perry/config.toml` | App Store Connect `.p8` API 密钥文件路径 |

#### macOS 分发模式

`distribute` 字段控制 macOS 应用的签名和分发方式：

- **`"appstore"`** — 使用 App Store 分发证书签名，并上传至 App Store Connect。需配置 `team_id`、`key_id`、`issuer_id` 和 `p8_key_path`。

- **`"notarize"`** — 使用开发者 ID 证书签名，并通过 Apple 公证。适用于 App Store 外的直接分发场景。

- **`"both"`** — 生成**两个**签名构建包：一个用于 App Store，一个经公证后用于直接分发。需配置**两个独立证书**：
  - `certificate` + `signing_identity`：用于 App Store 构建包
  - `notarize_certificate` + `notarize_signing_identity`：用于公证构建包
  - 可选配置 `installer_certificate`：用于 `.pkg` 安装包签名

#### macOS 应用商店分类

`category` 字段常用值（Apple UTI 格式）：

| 分类 | 值 |
|----------|-------|
| 商务 | `public.app-category.business` |
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

针对 `perry publish ios`、`perry run ios` 和 `perry compile --target ios`/`--target ios-simulator` 命令的 iOS 专属配置。

#### 应用元数据

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `bundle_id` | 字符串 | 兜底至 `[app]`/`[project]` 配置 | iOS 专属 Bundle 标识符 |
| `deployment_target` | 字符串 | `"17.0"` | 应用所需的最低 iOS 版本（例如：`"16.0"`） |
| `minimum_version` | 字符串 | — | `deployment_target` 的别名 |
| `device_family` | 字符串数组 | `["iphone", "ipad"]` | 支持的设备类型 |
| `orientations` | 字符串数组 | `["portrait"]` | 支持的界面方向 |
| `capabilities` | 字符串数组 | — | 应用能力（例如：`["push-notification"]`） |
| `entry` | 字符串 | 兜底至 `[project]`/`[app]` 配置 | iOS 专属入口文件（适用于 iOS 需要独立入口的场景） |
| `encryption_exempt` | 布尔值 | `false` | 若设为 `true`，会在 Info.plist 中添加 `ITSAppUsesNonExemptEncryption = false` |

#### 分发配置

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `distribute` | 字符串 | — | 分发方式：`"appstore"`（应用商店）、`"testflight"`（测试飞行）或 `"development"`（开发环境） |

#### 代码签名

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `signing_identity` | 字符串 | 从钥匙串自动检测 | 代码签名标识（例如：`"iPhone Distribution: Company (TEAMID)"`） |
| `certificate` | 字符串 | 从钥匙串自动导出 | 分发用 `.p12` 证书路径 |
| `provisioning_profile` | 字符串 | — | `.mobileprovision` 文件路径。执行 `perry setup ios` 时，会以 `{bundle_id}.mobileprovision` 为名存储至 `~/.perry/` 目录 |

#### App Store Connect 配置

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `team_id` | 字符串 | 取自 `~/.perry/config.toml` | Apple 开发者团队 ID |
| `key_id` | 字符串 | 取自 `~/.perry/config.toml` | App Store Connect API 密钥 ID |
| `issuer_id` | 字符串 | 取自 `~/.perry/config.toml` | App Store Connect 发行者 ID |
| `p8_key_path` | 字符串 | 取自 `~/.perry/config.toml` | `.p8` API 密钥文件路径 |

#### 设备类型取值

| 值 | 描述 |
|-------|-------------|
| `"iphone"` | iPhone 设备 |
| `"ipad"` | iPad 设备 |

#### 屏幕方向取值

| 值 | 描述 |
|-------|-------------|
| `"portrait"` | 设备竖屏（正向） |
| `"portrait-upside-down"` | 设备竖屏（倒置） |
| `"landscape-left"` | 设备横屏（向左旋转） |
| `"landscape-right"` | 设备横屏（向右旋转） |

---

### `[android]`

针对 `perry publish android`、`perry run android` 和 `perry compile --target android` 命令的 Android 专属配置。

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `package_name` | 字符串 | 兜底至 Bundle ID 解析链 | Java 包名（例如：`"com.example.myapp"`） |
| `min_sdk` | 字符串 | — | 最低 Android SDK 版本（例如：Android 8.0 对应 `"26"`） |
| `target_sdk` | 字符串 | — | 目标 Android SDK 版本（例如：Android 14 对应 `"34"`） |
| `permissions` | 字符串数组 | — | Android 权限（例如：`["INTERNET", "CAMERA", "ACCESS_FINE_LOCATION"]`） |
| `distribute` | 字符串 | — | 分发方式：`"playstore"`（应用商店） |
| `keystore` | 字符串 | — | 签名密钥库文件（`.jks` 或 `.keystore` 格式）路径 |
| `key_alias` | 字符串 | — | 密钥库中签名密钥的别名 |
| `google_play_key` | 字符串 | — | 用于自动上传的 Google Play 服务账号 JSON 文件路径 |
| `entry` | 字符串 | 兜底至 `[project]`/`[app]` 配置 | Android 专属入口文件 |

---

### `[linux]`

针对 `perry publish linux` 命令的 Linux 专属配置。

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `format` | 字符串 | — | 包格式：`"appimage"`、`"deb"` 或 `"rpm"` |
| `category` | 字符串 | — | 桌面应用分类（例如：`"Development"`、`"Utility"`、`"Game"`） |
| `description` | 字符串 | 兜底至 `[project]`/`[app]` 配置 | 用于包元数据的应用描述 |

---

### `[i18n]`

国际化配置。完整说明请参考[i18n 文档](../i18n/overview)。

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `locales` | 字符串数组 | — | 支持的区域代码（例如：`["en", "de", "fr"]`）。区域文件需存放于 `/locales` 目录 |
| `default_locale` | 字符串 | `"en"` | 兜底区域。当其他区域缺少对应键值时使用 |
| `dynamic` | 布尔值 | `false` | `false`：启动时确定区域，字符串内联；`true`：运行时可切换区域 |

### `[i18n.currencies]`

将区域代码映射至默认 ISO 4217 货币代码。供 `Currency()` 格式封装器使用。

| 键 | 类型 | 描述 |
|-----|------|-------------|
| `{locale}` | 字符串 | 对应区域的货币代码（例如：`en = "USD"`、`de = "EUR"`） |

---

### `[publish]`

发布相关配置。

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `server` | 字符串 | `https://hub.perryts.com` | 自定义 Perry Hub 构建服务器地址。适用于自托管或企业级部署场景 |

---

### `[audit]`

针对 `perry audit` 命令和发布前审计的安全审计配置。

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `fail_on` | 字符串 | `"C"` | 最低可接受审计等级。若实际等级低于该阈值，构建会失败。可选值：`"A"`、`"A-"`、`"B"`、`"C"`、`"D"`、`"F"` |
| `severity` | 字符串 | `"all"` | 按严重程度筛选审计结果：`"all"`（全部）、`"critical"`（严重）、`"high"`（高）、`"medium"`（中）、`"low"`（低） |
| `ignore` | 字符串数组 | — | 需忽略的审计规则 ID 列表（例如：`["RULE-001", "RULE-042"]`） |

#### 审计等级分级

审计等级从高到低排序：

| 等级 | 排名 | 描述 |
|-------|------|-------------|
| A | 6 | 优秀——无重大问题 |
| A- | 5 | 良好——仅存在次要问题 |
| B | 4 | 合格——存在部分问题 |
| C | 3 | 可接受——存在中等程度问题 |
| D | 2 | 较差——存在重大问题 |
| F | 1 | 失败——存在严重问题 |

若设置 `fail_on = "B"`，则等级低于 B（即 C、D、F）时会导致构建失败。

---

### `[verify]`

针对 `perry verify` 命令的运行时验证配置。

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `url` | 字符串 | `https://verify.perryts.com` | 验证服务端点地址 |

---

## Bundle ID 解析规则

Perry 采用级联优先级机制解析 Bundle 标识符，首个非空值生效：

### iOS 构建：
1. `[ios].bundle_id`
2. `[app].bundle_id`
3. `[project].bundle_id`
4. `[macos].bundle_id`
5. `package.json` 中的 `bundleId` 字段
6. `com.perry.<app_name>`（自动生成的默认值）

### macOS 构建：
1. `[macos].bundle_id`
2. `[app].bundle_id`
3. `[project].bundle_id`
4. `package.json` 中的 `bundleId` 字段
5. `com.perry.<app_name>`（自动生成的默认值）

### Android 构建：
1. `[android].package_name`
2. `[ios].bundle_id`
3. `[macos].bundle_id`
4. `[app].bundle_id`
5. `[project].bundle_id`
6. `com.perry.<app_name>`（自动生成的默认值）

---

## 入口文件解析规则

当命令行未指定输入文件时，Perry 按以下优先级解析入口文件：

1. `[ios].entry` / `[android].entry`（构建对应平台时）
2. `[project].entry` 或 `[app].entry`
3. `src/main.ts`（若文件存在）
4. `main.ts`（若文件存在）

---

## 构建版本号自动递增

执行 `perry publish` 时，以下场景会自动递增 `build_number` 字段值：
- iOS 构建
- Android 构建
- macOS App Store 构建（`distribute = "appstore"` 或 `"both"`）

发布成功后，更新后的值会写回 `perry.toml`。确保每次提交至 App Store / Play Store 的构建包都有唯一且单调递增的构建版本号。

采用 `distribute = "notarize"` 方式的 macOS 构建（直接分发）**不会**自动递增构建版本号。

---

## 配置优先级

Perry 采用分层优先级机制解析配置值（从高到低）：

1. **CLI 标志** — 例如：`--target`、`--output`
2. **环境变量** — 例如：`PERRY_LICENSE_KEY`
3. **perry.toml** — 项目级配置（平台专属章节优先，其次是 `[app]`/`[project]`）
4. **~/.perry/config.toml** — 用户级全局配置
5. **内置默认值**

---

## 环境变量

以下环境变量会覆盖 perry.toml 和全局配置中的对应值：

### Apple / iOS / macOS

| 变量 | 描述 |
|----------|-------------|
| `PERRY_LICENSE_KEY` | Perry Hub 许可证密钥 |
| `PERRY_APPLE_CERTIFICATE` | `.p12` 证书文件内容（base64 编码） |
| `PERRY_APPLE_CERTIFICATE_PASSWORD` | `.p12` 证书密码 |
| `PERRY_APPLE_P8_KEY` | `.p8` API 密钥文件内容 |
| `PERRY_APPLE_KEY_ID` | App Store Connect API 密钥 ID |
| `PERRY_APPLE_NOTARIZE_CERTIFICATE_PASSWORD` | 公证用 `.p12` 证书密码 |
| `PERRY_APPLE_INSTALLER_CERTIFICATE_PASSWORD` | 安装包用 `.p12` 证书密码 |

### Android

| 变量 | 描述 |
|----------|-------------|
| `PERRY_ANDROID_KEYSTORE` | `.jks`/`.keystore` 文件路径 |
| `PERRY_ANDROID_KEY_ALIAS` | 密钥库密钥别名 |
| `PERRY_ANDROID_KEYSTORE_PASSWORD` | 密钥库密码 |
| `PERRY_ANDROID_KEY_PASSWORD` | 密钥库内密钥密码 |
| `PERRY_GOOGLE_PLAY_KEY_PATH` | Google Play 服务账号 JSON 文件路径 |

### 通用

| 变量 | 描述 |
|----------|-------------|
| `PERRY_NO_TELEMETRY` | 设为 `1` 可禁用匿名遥测 |
| `PERRY_NO_UPDATE_CHECK` | 设为 `1` 可禁用后台更新检查 |

---

## 全局配置：`~/.perry/config.toml`

与项目级 `perry.toml` 分离，Perry 在 `~/.perry/config.toml` 维护用户级全局配置。该文件存储所有项目共享的凭证和偏好设置。

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

perry.toml（项目级）中的字段会覆盖 `~/.perry/config.toml`（全局级）中的对应字段。例如，perry.toml 中的 `[ios].team_id` 会覆盖全局配置中的 `[apple].team_id`。

全局配置可通过 `perry setup` 系列命令管理：
- `perry setup ios` — 配置 Apple 签名凭证
- `perry setup android` — 配置 Android 签名凭证
- `perry setup macos` — 配置 macOS 分发设置

---

## perry.toml 与 package.json 对比

Perry 会从两个文件读取配置。以下是配置项的归属说明：

| 配置项 | 文件 | 章节 |
|---------|------|---------|
| 原生编译包 | `package.json` | `perry.compilePackages` |
| 启动页 | `package.json` | `perry.splash` |
| 项目名称、版本、入口 | `perry.toml` | `[project]` |
| 平台专属设置 | `perry.toml` | `[ios]`、`[macos]`、`[android]`、`[linux]` |
| 代码签名与分发 | `perry.toml` | 平台专属章节 |
| 构建输出目录 | `perry.toml` | `[build]` |
| 审计与验证 | `perry.toml` | `[audit]`、`[verify]` |

当两个文件定义同一配置值（例如项目名称）时，`perry.toml` 优先级更高。

---

## 配置向导

执行 `perry setup <platform>` 可交互式配置签名凭证，并将配置写回 `perry.toml` 和 `~/.perry/config.toml`：

```bash
perry setup ios       # 配置 iOS 签名（证书、配置描述文件）
perry setup android   # 配置 Android 签名（密钥库、Play Store 密钥）
perry setup macos     # 配置 macOS 分发（App Store、公证）
```

该向导会自动完成以下操作：
- 若未配置，自动设置 `[ios].distribute = "testflight"`
- 若未配置，自动设置 `[android].distribute = "playstore"`
- 将配置描述文件存储为 `~/.perry/{bundle_id}.mobileprovision`
- 尽可能从 macOS 钥匙串自动导出 `.p12` 证书

---

## CI/CD 示例

在 CI 环境中，建议使用环境变量而非在 `perry.toml` 中存储凭证：

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

将仅包含非敏感字段的 `perry.toml` 纳入版本控制：

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