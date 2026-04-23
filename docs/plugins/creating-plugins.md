# 开发插件

将 Perry 插件构建为可扩展宿主应用程序的共享库。

## 步骤 1：编写插件

```typescript
// counter-plugin.ts
let count = 0;

export function activate(api: PluginAPI) {
  api.setMetadata("counter", "1.0.0", "Counts hook invocations");

  api.registerHook("onRequest", (data) => {
    count++;
    console.log(`Request #${count}`);
    return data;
  });

  api.registerTool("getCount", () => {
    return count;
  });
}

export function deactivate() {
  console.log(`Total requests processed: ${count}`);
}
```

## 步骤 2：编译为共享库

```bash
perry counter-plugin.ts --output-type dylib -o counter-plugin.dylib
```

`--output-type dylib` 标志用于告知 Perry 生成 `.dylib`（macOS 系统）或 `.so`（Linux 系统）文件，而非可执行文件。

Perry 会自动完成以下操作：
- 生成 `perry_plugin_abi_version()` 函数，返回当前 ABI 版本
- 生成 `plugin_activate(api_handle)` 函数，调用自定义的 `activate()` 函数
- 生成 `plugin_deactivate()` 函数，调用自定义的 `deactivate()` 函数
- 通过 `-rdynamic` 导出符号，供宿主程序查找

## 步骤 3：从宿主程序加载插件

```typescript
// host-app.ts
import { loadPlugin, emitHook, invokeTool, discoverPlugins } from "perry/plugin";

// 加载指定插件
loadPlugin("./counter-plugin.dylib");

// 或发现指定目录下的所有插件
discoverPlugins("./plugins/");

// 使用插件
emitHook("onRequest", { path: "/api/users" });
const count = invokeTool("getCount", {});
console.log(`Processed ${count} requests`);
```

## 插件 API 参考

传递至 `activate()` 函数的 `api` 对象提供以下能力：

### 元数据

```typescript
api.setMetadata(name: string, version: string, description: string)
```

### 钩子

```typescript
api.registerHook(name: string, callback: (data: any) => any, priority?: number)
```

钩子函数会按优先级顺序执行（数值越小，执行优先级越高）。

### 工具

```typescript
api.registerTool(name: string, callback: (args: any) => any)
```

宿主程序可通过名称调用工具函数。

### 配置

```typescript
const value = api.getConfig(key: string)  // 读取宿主程序提供的配置项
```

### 事件

```typescript
api.on(event: string, handler: (data: any) => void)  // 监听事件
api.emit(event: string, data: any)                     // 向其他插件发送事件
```

## 后续参考

- [Hooks & Events](hooks-and-events) — 钩子模式、事件总线
- [插件系统概述](overview) — 插件系统总览