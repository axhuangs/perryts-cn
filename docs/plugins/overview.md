# 插件系统概述

Perry 支持将原生插件作为共享库（.dylib/.so）。插件可通过自定义钩子、工具、服务和路由扩展 Perry 应用的功能。

## 工作原理

1. 插件是经 Perry 编译的共享库，需包含 `activate(api)` 和 `deactivate()` 入口点
2. 宿主应用通过 `loadPlugin(path)` 加载插件
3. 插件通过 API 句柄注册钩子、工具和服务
4. 宿主应用通过 `emitHook(name, data)` 向插件分发事件

```
Host Application
    ↓ loadPlugin("./my-plugin.dylib")
    ↓ calls plugin_activate(api_handle)
Plugin
    ↓ api.registerHook("beforeSave", callback)
    ↓ api.registerTool("format", callback)
Host
    ↓ emitHook("beforeSave", data) → plugin callback runs
```

## 快速示例

### 插件（编译时需指定 `--output-type dylib`）

```typescript
// my-plugin.ts
export function activate(api: PluginAPI) {
  api.setMetadata("my-plugin", "1.0.0", "A sample plugin");

  api.registerHook("beforeSave", (data) => {
    console.log("About to save:", data);
    return data; // Return modified data (filter mode)
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

### 宿主应用

```typescript
import { loadPlugin, emitHook, invokeTool, listPlugins } from "perry/plugin";

loadPlugin("./my-plugin.dylib");

// List loaded plugins
const plugins = listPlugins();
console.log(plugins); // [{ name: "my-plugin", version: "1.0.0", ... }]

// Emit a hook
const result = emitHook("beforeSave", { content: "..." });

// Invoke a tool
const greeting = invokeTool("greet", { name: "Perry" });
console.log(greeting); // "Hello, Perry!"
```

## 插件 ABI

插件必须导出以下符号：
- `perry_plugin_abi_version()` — 返回 ABI 版本（用于兼容性校验）
- `plugin_activate(api_handle)` — 插件加载时调用
- `plugin_deactivate()` — 插件卸载时调用

Perry 会自动从你的 `activate`/`deactivate` 导出内容生成上述符号。

## 原生扩展

Perry 同时支持**原生扩展**——这类包捆绑了特定平台的 Rust/Swift/JNI 代码，并可直接编译到你的二进制文件中。原生扩展用于访问平台级 API，例如 App Store 评分提示或 StoreKit 应用内购功能。

详见 [原生扩展](native-extensions)。

## 后续参考

- [Creating Plugins](creating-plugins) — 分步构建插件
- [Hooks & Events](hooks-and-events) — 钩子模式、事件总线、工具
- [Native Extensions](native-extensions) — 基于平台原生代码的扩展
- [App Store Review](appstore-review) — 评分提示（iOS/Android）