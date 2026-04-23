# 原生扩展

Perry 支持原生扩展——这类包会将特定平台代码（Rust、Swift、JNI）与 TypeScript API 捆绑在一起。与运行时加载的[动态插件](overview)不同，原生扩展会被直接编译到二进制文件中。

原生扩展是访问平台 API 的方式，这些 API 未包含在 Perry 内置的[系统 API](../system/overview) 或[标准库](../stdlib/overview) 中。典型示例包括[App Store 评分](appstore-review)和用于应用内购买的 StoreKit。

## 使用原生扩展

### 1. 将扩展添加到项目中

将扩展目录放置在项目同级目录，或共享扩展目录中：

```
my-app/
├── package.json
├── src/
│   └── index.ts
└── extensions/
    └── perry-appstore-review/
        ├── package.json
        ├── src/
        │   └── index.ts
        ├── crate-ios/
        ├── crate-android/
        └── crate-stub/
```

### 2. 使用 `--bundle-extensions` 编译

构建时传入扩展目录：

```bash
perry src/index.ts -o app --target ios --bundle-extensions ./extensions
```

Perry 会发现每个包含 `package.json` 的子目录，为目标平台编译其原生 crate，并将其链接到二进制文件中。

### 3. 导入并使用

```typescript
import { requestReview } from "perry-appstore-review";

await requestReview();
```

该导入操作在编译时解析为扩展的入口点。过程不涉及运行时模块加载——函数会编译为直接的原生调用。

## 原生扩展的工作原理

原生扩展是一个包含 `package.json` 的目录，该文件中声明了 `perry.nativeLibrary` 节。此节会告知 Perry 存在哪些原生函数、它们的签名，以及为每个平台编译哪个 Rust crate。

### package.json 清单

```json
{
  "name": "perry-appstore-review",
  "version": "0.1.0",
  "main": "src/index.ts",
  "perry": {
    "nativeLibrary": {
      "functions": [
        { "name": "sb_appreview_request", "params": [], "returns": "f64" }
      ],
      "targets": {
        "ios": {
          "crate": "crate-ios",
          "lib": "libperry_appreview.a",
          "frameworks": ["StoreKit"]
        },
        "android": {
          "crate": "crate-android",
          "lib": "libperry_appreview.a",
          "frameworks": []
        },
        "macos": {
          "crate": "crate-ios",
          "lib": "libperry_appreview.a",
          "frameworks": ["StoreKit"]
        }
      }
    }
  }
}
```

#### `functions`

每个条目声明扩展导出的一个原生函数：

| 字段 | 说明 |
|-------|-------------|
| `name` | 符号名称——必须与 `#[no_mangle]` 标记的 Rust 函数完全一致 |
| `params` | LLVM 类型数组：`"i64"` 表示指针/字符串，`"f64"` 表示数字，`"i32"` 表示整数 |
| `returns` | 返回类型——通常为 `"f64"`（NaN 装箱值或 Promise 句柄） |

#### `targets`

每个目标平台映射到一个实现原生函数的 Rust crate：

| 字段 | 说明 |
|-------|-------------|
| `crate` | Rust crate 目录的相对路径 |
| `lib` | `cargo build` 生成的静态库名称 |
| `frameworks` | 需链接的系统框架（仅 iOS/macOS 平台） |

多个目标可共享同一个 crate（例如，iOS 和 macOS 通常共享一套实现）。未配置条目的平台会回退到 stub 实现。

### 扩展目录结构

```
perry-appstore-review/
├── package.json              # 包含 perry.nativeLibrary 的清单文件
├── src/
│   └── index.ts              # TypeScript API（用户导入的内容）
├── crate-ios/                # iOS/macOS 原生实现
│   ├── Cargo.toml            # [lib] crate-type = ["staticlib"]
│   ├── build.rs              # 按需编译 Swift 代码
│   ├── src/
│   │   └── lib.rs            # Rust FFI：#[no_mangle] pub extern "C" fn ...
│   └── swift/
│       └── bridge.swift      # Apple API 的 Swift 桥接层 (@_cdecl)
├── crate-android/            # Android 原生实现
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs            # 带 JNI 调用的 Rust FFI
└── crate-stub/               # 不支持平台的回退实现
    ├── Cargo.toml
    └── src/
        └── lib.rs            # 立即返回错误
```

### TypeScript 侧实现

`src/index.ts` 声明原生函数，并可选择性地将其封装为更易用的 API：

```typescript
// 声明原生函数（名称必须与 package.json 一致）
declare function sb_appreview_request(): number;

// 用标准的 TypeScript 签名封装
export async function requestReview(): Promise<void> {
  await (sb_appreview_request() as any);
}
```

`declare function` 告知 Perry 该函数由原生代码提供。原始返回类型为 `number`，因为所有值跨 FFI 边界时均以 NaN 装箱的 `f64` 类型传递。Promise 句柄是 NaN 装箱的指针，Perry 运行时知道如何对其执行 `await` 操作。

### Rust 侧实现

每个平台的 crate 都是一个 `staticlib`，通过 `#[no_mangle] pub extern "C"` 实现声明的函数：

```rust
// Perry 运行时 FFI
extern "C" {
    fn js_promise_new() -> *mut u8;
    fn js_promise_resolve(promise: *mut u8, value: f64);
    fn js_nanbox_string(ptr: i64) -> f64;
    fn js_nanbox_pointer(ptr: i64) -> f64;
}

#[no_mangle]
pub extern "C" fn sb_appreview_request() -> f64 {
    unsafe {
        let promise = js_promise_new();
        // ... 调用平台 API，完成后解析 promise ...
        js_nanbox_pointer(promise as i64)
    }
}
```

原生代码可调用的核心运行时函数：

| 函数 | 用途 |
|----------|---------|
| `js_promise_new()` | 创建新的 Perry promise，返回指针 |
| `js_promise_resolve(promise, value)` | 用 NaN 装箱值解析 promise |
| `js_nanbox_string(ptr)` | 将 C 字符串指针转换为 NaN 装箱字符串 |
| `js_nanbox_pointer(ptr)` | 将指针转换为 NaN 装箱的对象引用 |
| `js_get_string_pointer_unified(val)` | 从 NaN 装箱值中提取字符串指针 |
| `js_string_from_bytes(ptr, len)` | 从字节创建 Perry 字符串 |

### Swift 桥接层（iOS/macOS）

Apple 平台 API 通常通过 Swift 调用最便捷，实现模式如下：

1. 编写包含 `@_cdecl("function_name")` 导出的 Swift 文件
2. 在 `build.rs` 中将其编译为静态库
3. 通过 `extern "C"` 从 Rust 调用 Swift 函数

```swift
import StoreKit

typealias Callback = @convention(c) (UnsafeMutableRawPointer, UnsafePointer<CChar>) -> Void

@_cdecl("swift_appreview_request")
func swiftRequestReview(_ callback: @escaping Callback, _ context: UnsafeMutableRawPointer) {
    DispatchQueue.main.async {
        if let scene = UIApplication.shared.connectedScenes
            .first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
            SKStoreReviewController.requestReview(in: scene)
        }
        let result = "{\"success\":true}"
        result.withCString { callback(context, $0) }
    }
}
```

`build.rs` 通过 `swiftc` 将 Swift 源码编译为静态库，并指定正确的平台 SDK：

```rust
// build.rs（简化版）
fn main() {
    // 检测目标平台：aarch64-apple-ios → arm64-apple-ios16.0，使用 iphoneos SDK
    // 编译：swiftc -emit-library -static -target ... -sdk ... -framework StoreKit
    // 链接：cargo:rustc-link-lib=static=review_bridge
}
```

### JNI 桥接层（Android）

Android 平台 API 通过 JNI 访问，实现模式如下：

1. 通过 `JNI_GetCreatedJavaVMs()` 获取 `JavaVM`
2. 附加当前线程以获取 `JNIEnv`
3. 通过 JNI 方法调用执行 Java/Kotlin API
4. 将结果解析到 Perry promise 中

```rust
use jni::JavaVM;
use jni::objects::JValue;

fn request_review_impl() -> Result<(), String> {
    let vm = get_java_vm()?;
    let mut env = vm.attach_current_thread_as_daemon().map_err(|e| e.to_string())?;

    // 从 PerryBridge 获取 Activity
    let bridge = env.find_class("com/perry/app/PerryBridge").map_err(|e| e.to_string())?;
    let activity = env.call_static_method(bridge, "getActivity", "()Landroid/app/Activity;", &[])
        .map_err(|e| e.to_string())?.l().map_err(|e| e.to_string())?;

    // 通过 JNI 调用平台 API...
    Ok(())
}
```

若 Android 实现依赖 Java 库（例如 Google Play 应用内评分库），则应用的 `build.gradle` 必须添加对应的依赖。需在扩展文档中清晰说明此要求。

### Stub crate 实现

对于无原生实现的平台，stub 会立即将 promise 解析为错误：

```rust
#[no_mangle]
pub extern "C" fn sb_appreview_request() -> f64 {
    unsafe {
        let promise = js_promise_new();
        let msg = "{\"error\":\"Not available on this platform\"}";
        let c_str = std::ffi::CString::new(msg).unwrap();
        let val = js_nanbox_string(c_str.as_ptr() as i64);
        std::mem::forget(c_str);
        js_promise_resolve(promise, val);
        js_nanbox_pointer(promise as i64)
    }
}
```

## 构建要求

| 平台 | 要求 |
|----------|-------------|
| iOS | macOS 主机、Xcode、`rustup target add aarch64-apple-ios` |
| iOS 模拟器 | macOS 主机、Xcode、`rustup target add aarch64-apple-ios-sim` |
| macOS | macOS 主机、Xcode 命令行工具 |
| Android | Android NDK、`rustup target add aarch64-linux-android` |

Perry 在编译期间遇到 `perry.nativeLibrary` 清单时，会执行以下操作：

1. 为当前 `--target` 平台选择对应的 crate
2. 在 crate 目录中运行 `cargo build --release --target <triple>`
3. 将生成的 `.a` 静态库链接到最终的二进制文件中
4. 添加所有声明的框架（例如 `-framework StoreKit`）

## 创建自定义原生扩展

1. 按上述结构创建目录
2. 在 `package.json` 的 `perry.nativeLibrary` 下定义函数
3. 在各平台 crate 中通过匹配的 `#[no_mangle] pub extern "C"` 签名实现函数
4. 编写 TypeScript 入口文件，声明并（可选）封装原生函数
5. 为不支持的平台添加 stub crate
6. 使用 `--bundle-extensions` 测试：
   ```bash
   perry app.ts --target ios-simulator --bundle-extensions ./extensions
   ```

## 后续参考

- [App Store Review](appstore-review) — 应用评分提示原生扩展（iOS/Android）
- [Creating Plugins](creating-plugins) — 运行时加载的动态插件
- [插件系统概述](overview) — 插件系统总览