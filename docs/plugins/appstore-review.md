# App Store 审核

使用 iOS 和 Android 上的原生应用商店审核对话框提示用户对您的应用进行评分。

`perry-appstore-review` 扩展公开了一个单一函数——`requestReview()`——它打开平台的原生审核提示。它不做其他事情：何时以及多久询问一次完全由您决定。

**仓库：** [github.com/PerryTS/appstorereview](https://github.com/PerryTS/appstorereview)

## 快速开始

### 1. 添加扩展

将扩展克隆或复制到项目的扩展目录中：

```bash
mkdir -p extensions
cd extensions
git clone https://github.com/PerryTS/appstorereview.git perry-appstore-review
cd ..
```

您的项目结构：

```
my-app/
├── package.json
├── src/
│   └── index.ts
└── extensions/
    └── perry-appstore-review/
```

### 2. 在您的应用中使用

```typescript
import { requestReview } from "perry-appstore-review";

// 当用户完成有意义的操作时显示审核提示
async function onLevelComplete() {
  await requestReview();
}
```

### 3. 构建

```bash
perry src/index.ts -o app --target ios --bundle-extensions ./extensions
```

`--bundle-extensions` 标志告诉 Perry 发现、编译并链接给定目录中的所有原生扩展。应用商店审核原生代码被编译并静态链接到您的二进制文件中——没有运行时依赖。

## API

### `requestReview(): Promise<void>`

打开原生应用商店审核提示。返回一个在提示被呈现（或被操作系统跳过）时解析的 promise。

```typescript
import { requestReview } from "perry-appstore-review";

await requestReview();
```

该函数仅触发提示。它不会：
- 跟踪用户是否已经审核
- 限制提示出现的频率（iOS 自动执行此操作；Android 不执行）
- 返回用户是否实际留下了审核（两个平台都不提供此信息）

## 平台行为

### iOS

使用 StoreKit 中的 [`SKStoreReviewController.requestReview(in:)`](https://developer.apple.com/documentation/storekit/skstorereviewcontroller/requestreview(in:))。

| 细节 | 值 |
|------|-----|
| 原生 API | `SKStoreReviewController.requestReview(in: UIWindowScene)` |
| 最低 iOS 版本 | 14.0 |
| 框架 | StoreKit |
| 线程 | 自动分派到主线程 |
| 限制 | Apple 将显示限制为每个应用每 365 天周期最多 3 次。系统可能会静默忽略调用。 |
| 开发构建 | 在调试/TestFlight 构建中始终显示 |
| 用户控制 | 用户可以在设置 > App Store 中禁用审核提示 |

**重要：** Apple 的限制意味着每次调用 `requestReview()` 时都不保证提示会出现。设计您的应用流程，使不显示提示不会破坏用户体验。

### macOS

使用相同的 StoreKit API。与 iOS 原生 crate 共享（两者都从 `crate-ios` 编译）。

| 细节 | 值 |
|------|-----|
| 原生 API | `SKStoreReviewController.requestReview()` |
| 最低 macOS 版本 | 13.0 |
| 框架 | StoreKit |
| 限制 | 与 iOS 相同——系统控制 |

仅适用于通过 Mac App Store 分发的应用。

### Android

使用 [Google Play In-App Review API](https://developer.android.com/guide/playcore/in-app-review)。

| 细节 | 值 |
|------|-----|
| 原生 API | `ReviewManager.requestReviewFlow()` + `launchReviewFlow()` |
| 库 | `com.google.android.play:review` |
| 最低 API 级别 | 21 (Android 5.0) |
| 限制 | Google 强制执行配额——提示可能不会每次都出现 |
| 执行 | 在后台线程上运行以避免阻塞 UI |

**必需的 Gradle 依赖：** Google Play In-App Review API 不是 Android SDK 的一部分。您必须将其添加到应用的 `build.gradle`：

```groovy
dependencies {
    implementation 'com.google.android.play:review:2.0.2'
}
```

如果没有此依赖，`requestReview()` 将以解释缺失库的错误解析。

### 其他平台

在不支持的平台（Linux、Windows、Web）上，`requestReview()` 立即以错误解析。它不会抛出——您的应用正常继续。

## 最佳实践

**在正确时刻询问。** 在积极体验之后提示——完成关卡、完成任务、实现目标。不要在首次启动或入门期间询问。

**不要询问太频繁。** 即使 iOS 自动限制，Android 也没有同样严格的限制。实施您自己的逻辑来跟踪上次询问的时间：

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

**不要基于审核条件应用行为。** iOS 和 Android 都不会告诉您用户是否留下了审核、给了评分或关闭了提示。promise 解析并不意味着提交了审核。

**不要在原生提示之前使用自定义审核对话框。** Apple 和 Google 都不鼓励在原生提示之前显示您自己的“评价此应用？”对话框。原生提示设计为低摩擦——添加预提示会增加放弃率。

## 扩展结构

扩展遵循标准的 [原生扩展](native-extensions.md) 布局：

```
perry-appstore-review/
├── package.json              # 声明 sb_appreview_request 函数
├── src/
│   └── index.ts              # 导出 requestReview()
├── crate-ios/                # iOS/macOS: Swift → SKStoreReviewController
│   ├── Cargo.toml
│   ├── build.rs              # 将 Swift 编译为静态库
│   ├── src/lib.rs            # Rust FFI 桥接
│   └── swift/review_bridge.swift
├── crate-android/            # Android: JNI → Play In-App Review API
│   ├── Cargo.toml
│   └── src/lib.rs
└── crate-stub/               # 其他平台：以错误解析
    ├── Cargo.toml
    └── src/lib.rs
```

在 `package.json` 中声明了一个原生函数：

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

TypeScript 层将其包装到公共 `requestReview()` 函数中。原生层创建一个 Perry promise，调用平台 API，并在完成后解析 promise。

## Next Steps

- [Native Extensions](native-extensions.md) — 原生扩展如何工作，创建您自己的
- [iOS Platform](../platforms/ios.md) — iOS 平台指南
- [Android Platform](../platforms/android.md) — Android 平台指南