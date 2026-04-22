# 创建插件

将 Perry 插件构建为共享库，以扩展主机应用程序。

## 第 1 步：编写插件

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

## 第 2 步：编译为共享库

```bash
perry counter-plugin.ts --output-type dylib -o counter-plugin.dylib
```

`--output-type dylib` 标志告诉 Perry 生成 `.dylib` (macOS) 或 `.so` (Linux) 而不是可执行文件。

Perry 自动：
- 生成返回当前 ABI 版本的 `perry_plugin_abi_version()`
- 生成调用您的 `activate()` 函数的 `plugin_activate(api_handle)`
- 生成调用您的 `deactivate()` 函数的 `plugin_deactivate()`
- 使用 `-rdynamic` 导出符号以供主机查找

## 第 3 步：从主机加载

```typescript
// host-app.ts
import { loadPlugin, emitHook, invokeTool, discoverPlugins } from "perry/plugin";

// 加载特定插件
loadPlugin("./counter-plugin.dylib");

// 或发现目录中的插件
discoverPlugins("./plugins/");

// 使用插件
emitHook("onRequest", { path: "/api/users" });
const count = invokeTool("getCount", {});
console.log(`Processed ${count} requests`);
```

## 插件 API 参考

传递给 `activate()` 的 `api` 对象提供：

### 元数据

```typescript
api.setMetadata(name: string, version: string, description: string)
```

### 钩子

```typescript
api.registerHook(name: string, callback: (data: any) => any, priority?: number)
```

钩子按优先级顺序调用（较低数字 = 先调用）。

### 工具

```typescript
api.registerTool(name: string, callback: (args: any) => any)
```

工具由主机按名称调用。

### 配置

```typescript
const value = api.getConfig(key: string)  // 读取主机提供的配置
```

### 事件

```typescript
api.on(event: string, handler: (data: any) => void)  // 监听事件
api.emit(event: string, data: any)                     // 向其他插件发出
```

## Next Steps

- [Hooks & Events](hooks-and-events.md) — 钩子模式、事件总线
- [Overview](overview.md) — 插件系统概述