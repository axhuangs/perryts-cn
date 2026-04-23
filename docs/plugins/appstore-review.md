# App Store 评分请求

引导用户通过 iOS 和 Android 系统原生的 App Store 评分对话框为你的应用评分。

`perry-appstore-review` 扩展仅暴露一个函数 —— `requestReview()`，用于唤起平台原生的评分弹窗。该函数不处理其他逻辑：何时触发、触发频率完全由你决定。

**代码仓库：** [github.com/PerryTS/appstorereview](https://github.com/PerryTS/appstorereview)

## 快速开始

### 1. 添加扩展

将扩展克隆或复制到项目的 extensions 目录：

```bash
mkdir -p extensions
cd extensions
git clone https://github.com/PerryTS/appstorereview.git perry-appstore-review
cd ..
```

项目结构如下：

```
my-app/
├── package.json
├── src/
│   └── index.ts
└── extensions/
    └── perry-appstore-review/
```

### 2. 在应用中使用

```typescript
import { requestReview } from "perry-appstore-review";

// 在用户完成关键操作时展示评分弹窗
async function onLevelComplete() {
  await requestReview();
}
```

### 3. 构建

```bash
perry src/index.ts -o app --target ios --bundle-extensions ./extensions
```

`--bundle-extensions` 标识用于告知 Perry 工具发现、编译并链接指定目录下的所有原生扩展。App Store 评分相关的原生代码会被编译并静态链接到二进制文件中 —— 无运行时依赖。

## API

### `requestReview(): Promise<void>`

唤起原生的 App Store 评分弹窗。返回一个 Promise 对象，当弹窗展示完成（或被系统跳过）时状态变为已解析。

```typescript
import { requestReview } from "perry-appstore-review";

await requestReview();
```

该函数仅负责触发弹窗，不包含以下行为：
- 追踪用户是否已提交评分
- 限制弹窗展示频率（iOS 系统会自动限制，Android 无此机制）
- 返回用户是否实际提交了评分（两大平台均未提供该信息）

## 平台行为

### iOS

使用 StoreKit 框架中的 [`SKStoreReviewController.requestReview(in:)`](https://developer.apple.com/documentation/storekit/skstorereviewcontroller/requestreview(in:)) 接口。

| 详情 | 取值 |
|------|-------|
| 原生 API | `SKStoreReviewController.requestReview(in: UIWindowScene)` |
| 最低 iOS 版本 | 14.0 |
| 依赖框架 | StoreKit |
| 执行线程 | 自动分发至主线程 |
| 频率限制 | Apple 限制每个应用每 365 天最多展示 3 次。系统可能静默忽略调用请求。 |
| 开发构建版本 | 调试/TestFlight 构建版本中始终展示 |
| 用户控制 | 用户可在“设置 > App Store”中关闭评分弹窗 |

**重要提示：** 由于 Apple 的频率限制机制，调用 `requestReview()` 并不保证每次都能展示弹窗。设计应用流程时，需确保弹窗未展示的情况下不会影响用户体验。

### macOS

使用与 iOS 相同的 StoreKit API，共享 iOS 原生 crate 代码（均基于 `crate-ios` 编译）。

| 详情 | 取值 |
|------|-------|
| 原生 API | `SKStoreReviewController.requestReview()` |
| 最低 macOS 版本 | 13.0 |
| 依赖框架 | StoreKit |
| 频率限制 | 与 iOS 一致 —— 由系统控制 |

仅适用于通过 Mac App Store 分发的应用。

### Android

使用 [Google Play 应用内评分 API](https://developer.android.com/guide/playcore/in-app-review)。

| 详情 | 取值 |
|------|-------|
| 原生 API | `ReviewManager.requestReviewFlow()` + `launchReviewFlow()` |
| 依赖库 | `com.google.android.play:review` |
| 最低 API 级别 | 21（Android 5.0） |
| 频率限制 | Google 设有调用配额 —— 弹窗可能并非每次调用都展示 |
| 执行方式 | 在后台线程运行，避免阻塞 UI |

**必选 Gradle 依赖：** Google Play 应用内评分 API 不属于 Android SDK 内置组件，需在应用的 `build.gradle` 中添加以下依赖：

```groovy
dependencies {
    implementation 'com.google.android.play:review:2.0.2'
}
```

若未添加该依赖，`requestReview()` 会解析为错误状态，并提示缺少相关库。

### 其他平台

在不支持的平台（Linux、Windows、Web）上，`requestReview()` 会立即解析为错误状态，但不会抛出异常 —— 应用可正常运行。

## 最佳实践

**选择合适的触发时机。** 在用户获得正向体验后触发弹窗 —— 例如完成关卡、结束任务、达成目标时。避免在首次启动或引导流程中触发。

**避免频繁触发。** 尽管 iOS 会自动限制频率，但 Android 无严格的内置限制。需自行实现逻辑追踪上次触发时间：

```typescript
import { requestReview } from "perry-appstore-review";
import { preferencesGet, preferencesSet } from "perry/system";

async function maybeAskForReview() {
  const lastAsked = Number(preferencesGet("lastReviewAsk") || "0");
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  if (now - lastAsked > thirtyDays) {
    preferencesSet("lastReviewAsk", String(now));
    await requestReview();
  }
}
```

**不要基于评分结果调整应用行为。** iOS 和 Android 均不会返回用户是否提交评分、给出星级或关闭弹窗的信息。Promise 解析仅代表弹窗流程结束，不代表用户已提交评分。

**不要在原生弹窗前展示自定义评分对话框。** Apple 和 Google 均不建议在原生弹窗前展示自定义的“是否评分”对话框。原生弹窗设计为低操作成本形式 —— 新增前置弹窗会提高用户放弃率。

## 扩展结构

该扩展遵循标准的 [原生扩展](native-extensions) 目录结构：

```
perry-appstore-review/
├── package.json              # 声明 sb_appreview_request 函数
├── src/
│   └── index.ts              # 导出 requestReview() 函数
├── crate-ios/                # iOS/macOS：Swift 封装 → SKStoreReviewController
│   ├── Cargo.toml
│   ├── build.rs              # 将 Swift 编译为静态库
│   ├── src/lib.rs            # Rust FFI 桥接层
│   └── swift/review_bridge.swift
├── crate-android/            # Android：JNI 封装 → Play 应用内评分 API
│   ├── Cargo.toml
│   └── src/lib.rs
└── crate-stub/               # 其他平台：解析为错误状态
    ├── Cargo.toml
    └── src/lib.rs
```

`package.json` 中声明了一个原生函数：

```json
{
  "perry": {
    "nativeLibrary": {
      "functions": [
        { "name": "sb_appreview_request", "params": [], "returns": "f64" }
      ]
    }
  }
}
```

TypeScript 层将该原生函数封装为公共的 `requestReview()` 函数。原生层会创建 Perry 承诺对象，调用平台 API，并在操作完成后解析该承诺。

## 后续参考

- [Native Extensions](native-extensions) —— 原生扩展工作原理及自定义扩展开发指南
- [iOS Platform](../platforms/ios) —— iOS 平台使用指南
- [Android Platform](../platforms/android) —— Android 平台使用指南