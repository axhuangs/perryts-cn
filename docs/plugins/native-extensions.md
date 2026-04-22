# 原生扩展

Perry 支持原生扩展——包将平台特定代码（Rust、Swift、JNI）与 TypeScript API 捆绑在一起。与在运行时加载的 [动态插件](overview.md) 不同，原生扩展直接编译到您的二进制文件中。

原生扩展是您访问不是 Perry 内置 [系统 API](../system/overview.md) 或 [标准库](../stdlib/overview.md) 一部分的平台 API 的方式。示例包括 [App Store Review](appstore-review.md) 和用于应用内购买的 StoreKit。

## 使用原生扩展

### 1. 将扩展添加到您的项目

将扩展目录放在您的项目旁边，或在共享扩展目录中：

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

构建时传递扩展目录：

```bash
perry src/index.ts -o app --target ios --bundle-extensions ./extensions
```

Perry 发现每个具有 `package.json` 的子目录，为目标平台编译其原生 crate，并将它们链接到您的二进制文件中。

### 3. 导入并使用

```typescript
import { requestReview } from "perry-appstore-review";

await requestReview();
```

导入在编译时解析到扩展的入口点。不涉及运行时模块加载——函数编译为直接原生调用。

## 原生扩展如何工作

原生扩展是一个具有声明 `perry.nativeLibrary` 部分的 `package.json` 的目录。这告诉 Perry 哪些原生函数存在、它们的签名，以及为每个平台编译哪个 Rust crate。

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

每个条目声明扩展导出的原生函数：

| 字段 | 描述 |
|------|------|
| `name` | 符号名称——必须与 `#[no_mangle]` Rust 函数完全匹配 |
| `params` | LLVM 类型数组：`"i64"` 用于指针/字符串，`"f64"` 用于数字，`"i32"` 用于整数 |
| `returns` | 返回类型——通常 `"f64"`（NaN-boxed 值或 promise 句柄） |

#### `targets`

每个目标平台映射到一个实现原生函数的 Rust crate：

| 字段 | 描述 |
|------|------|
| `crate` | Rust crate 目录的相对路径 |
| `lib` | `cargo build` 生成的静态库名称 |
| `frameworks` | 要链接的系统框架（仅 iOS/macOS） |

多个目标可以共享相同的 crate（例如，iOS 和 macOS 通常共享实现）。没有条目的平台回退到 stub。

### 扩展目录布局

```
perry-appstore-review/
├── package.json              # 具有 perry.nativeLibrary 的清单
├── src/
│   └── index.ts              # TypeScript API（用户导入的内容）
├── crate-ios/                # iOS/macOS 原生实现
│   ├── Cargo.toml            # [lib] crate-type = ["staticlib"]
│   ├── build.rs              # 如果需要编译 Swift
│   ├── src/
│   │   └── lib.rs            # Rust FFI：#[no_mangle] pub extern "C" fn ...
│   └── swift/
│       └── bridge.swift      # Swift 桥接 Apple API（@_cdecl）
├── crate-android/            # Android 原生实现
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs            # 具有 JNI 调用的 Rust FFI
└── crate-stub/               # 不支持平台的回退
    ├── Cargo.toml
    └── src/
        └── lib.rs            # 立即返回错误
```

### TypeScript 侧

`src/index.ts` 声明原生函数并可选地用更友好的 API 包装它们：

```typescript
// 声明原生函数（名称必须与 package.json 匹配）
declare function sb_appreview_request(): number;

// 用适当的 TypeScript 签名包装它
export async function requestReview(): Promise<void> {
  await (sb_appreview_request() as any);
}
```

`declare function` 告诉 Perry 函数由原生代码提供。原始返回类型是 `number`，因为所有值通过 FFI 边界作为 NaN-boxed `f64` 值传递。Promise 句柄是 NaN-boxed 指针，Perry 的运行时知道如何 `await`。

### Rust 侧

每个平台 crate 是一个实现声明函数的 `staticlib`，使用 `#[no_mangle] pub extern "C"`：

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

原生代码可用的关键运行时函数：

| 函数 | 目的 |
|------|------|
| `js_promise_new()` | 创建新的 Perry promise，返回指针 |
| `js_promise_resolve(promise, value)` | 用 NaN-boxed 值解析 promise |
| `js_nanbox_string(ptr)` | 将 C 字符串指针转换为 NaN-boxed 字符串 |
| `js_nanbox_pointer(ptr)` | 将指针转换为 NaN-boxed 对象引用 |
| `js_get_string_pointer_unified(val)` | 从 NaN-boxed 值中提取字符串指针 |
| `js_string_from_bytes(ptr, len)` | 从字节创建 Perry 字符串 |

### Swift 桥接 (iOS/macOS)

Apple 平台 API 通常最容易从 Swift 调用。模式是：

1. 用 `@_cdecl("function_name")` 导出编写 Swift 文件
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

`build.rs` 使用 `swiftc` 将 Swift 源编译为静态库，针对正确的平台 SDK：

```rust
// build.rs (简化)
fn main() {
    // 检测目标：aarch64-apple-ios → arm64-apple-ios16.0，iphoneos SDK
    // 编译：swiftc -emit-library -static -target ... -sdk ... -framework StoreKit
    // 链接：cargo:rustc-link-lib=static=review_bridge
}
```

### JNI 桥接 (Android)

Android 平台 API 通过 JNI 访问。模式：

1. 通过 `JNI_GetCreatedJavaVMs()` 获取 `JavaVM`
2. 附加当前线程以获取 `JNIEnv`
3. 通过 JNI 方法调用调用 Java/Kotlin API
4. 用结果解析 Perry promise

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

如果 Android 实现需要 Java 库（例如，Google Play In-App Review），应用的 `build.gradle` 必须包含依赖。清楚地记录此要求以供扩展用户使用。

### Stub crate

对于没有原生实现的平台，stub 立即以错误解析 promise：

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
|------|------|
| iOS | macOS 主机，Xcode，`rustup target add aarch64-apple-ios` |
| iOS Simulator | macOS 主机，Xcode，`rustup target add aarch64-apple-ios-sim` |
| macOS | macOS 主机，Xcode Command Line Tools |
| Android | Android NDK，`rustup target add aarch64-linux-android` |

当 Perry 在编译期间遇到 `perry.nativeLibrary` 清单时，它：

1. 为当前 `--target` 平台选择 crate
2. 在 crate 目录中运行 `cargo build --release --target <triple>`
3. 将生成的 `.a` 静态库链接到最终二进制文件中
4. 添加任何声明的框架（例如，`-framework StoreKit`）

## 创建您自己的原生扩展

1. 创建上面显示的目录结构
2. 在 `package.json` 的 `perry.nativeLibrary` 下定义您的函数
3. 在平台 crate 中用匹配的 `#[no_mangle] pub extern "C"` 签名实现每个函数
4. 编写声明并可选地包装原生函数的 TypeScript 入口点
5. 为不支持的平台添加 stub crate
6. 使用 `--bundle-extensions` 测试：
   ```bash
   perry app.ts --target ios-simulator --bundle-extensions ./extensions
   ```

## Next Steps

- [App Store Review](appstore-review.md) — 原生审核提示扩展 (iOS/Android)
- [Creating Plugins](creating-plugins.md) — 在运行时加载的动态插件
- [Overview](overview.md) — 插件系统概述