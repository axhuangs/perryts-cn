# 插件系统概述

Perry 支持将原生插件作为共享库（`.dylib`/`.so`）。插件使用自定义钩子、工具、服务和路由扩展 Perry 应用程序。

## 它如何工作

1. 插件是具有 `activate(api)` 和 `deactivate()` 入口点的 Perry 编译共享库
2. 主机应用程序使用 `loadPlugin(path)` 加载插件
3. 插件通过 API 句柄注册钩子、工具和服务
4. 主机通过 `emitHook(name, data)` 向插件分派事件

```
主机应用程序
    ↓ loadPlugin("./my-plugin.dylib")
    ↓ 调用 plugin_activate(api_handle)
插件
    ↓ api.registerHook("beforeSave", callback)
    ↓ api.registerTool("format", callback)
主机
    ↓ emitHook("beforeSave", data) → 插件回调运行
```

## 快速示例

### 插件（使用 `--output-type dylib` 编译）

```typescript
// my-plugin.ts
export function activate(api: PluginAPI) {
  api.setMetadata("my-plugin", "1.0.0", "A sample plugin");

  api.registerHook("beforeSave", (data) => {
    console.log("About to save:", data);
    return data; // 返回修改的数据（过滤模式）
  });

  api.registerTool("greet", (args) => {
    return `Hello, ${args.name}!`;
  });
}

export function deactivate() {
  console.log("Plugin deactivated");
}
```

```bash
perry my-plugin.ts --output-type dylib -o my-plugin.dylib
```

### 主机应用程序

```typescript
import { loadPlugin, emitHook, invokeTool, listPlugins } from "perry/plugin";

loadPlugin("./my-plugin.dylib");

// 列出加载的插件
const plugins = listPlugins();
console.log(plugins); // [{ name: "my-plugin", version: "1.0.0", ... }]

// 发出钩子
const result = emitHook("beforeSave", { content: "..." });

// 调用工具
const greeting = invokeTool("greet", { name: "Perry" });
console.log(greeting); // "Hello, Perry!"
```

## 插件 ABI

插件必须导出这些符号：
- `perry_plugin_abi_version()` — 返回 ABI 版本（用于兼容性检查）
- `plugin_activate(api_handle)` — 插件加载时调用
- `plugin_deactivate()` — 插件卸载时调用

Perry 从您的 `activate`/`deactivate` 导出自动生成这些。

## 原生扩展

Perry 还支持 **原生扩展**——包将平台特定 Rust/Swift/JNI 代码捆绑并直接编译到您的二进制文件中。这些用于访问平台 API，如 App Store 审核提示或 StoreKit 应用内购买。

有关详细信息，请参阅 [Native Extensions](native-extensions.md)。

## Next Steps

- [Creating Plugins](creating-plugins.md) — 逐步构建插件
- [Hooks & Events](hooks-and-events.md) — 钩子模式、事件总线、工具
- [Native Extensions](native-extensions.md) — 具有平台原生代码的扩展
- [App Store Review](appstore-review.md) — 原生审核提示 (iOS/Android)