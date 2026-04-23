# 钩子与事件

Perry 插件通过钩子（Hooks）、事件（Events）和工具（Tools）进行通信。

## 钩子模式

钩子支持三种执行模式：

### 过滤模式（默认）

每个插件接收数据并返回（可能经过修改的）数据。一个插件的输出会成为下一个插件的输入：

```typescript
api.registerHook("transform", (data) => {
  data.content = data.content.toUpperCase();
  return data; // Returned data goes to next plugin
});
```

### 动作模式

插件接收数据，但返回值会被忽略。该模式用于处理副作用：

```typescript
api.registerHook("onSave", (data) => {
  console.log(`Saved: ${data.path}`);
  // Return value ignored
});
```

### 瀑布流模式

与过滤模式类似，但专门用于通过插件链逐步累积/构建最终结果：

```typescript
api.registerHook("buildMenu", (items) => {
  items.push({ label: "My Plugin Action", action: () => {} });
  return items;
});
```

## 钩子优先级

优先级数值越小，执行顺序越靠前：

```typescript
api.registerHook("beforeSave", validate, 10);   // Runs first
api.registerHook("beforeSave", transform, 20);   // Runs second
api.registerHook("beforeSave", log, 100);         // Runs last
```

默认优先级为 50。

## 事件总线

插件之间可通过事件实现通信：

### 触发事件

```typescript
// From a plugin
api.emit("dataUpdated", { source: "my-plugin", records: 42 });

// From the host
import { emitEvent } from "perry/plugin";
emitEvent("dataUpdated", { source: "host", records: 100 });
```

### 监听事件

```typescript
api.on("dataUpdated", (data) => {
  console.log(`${data.source} updated ${data.records} records`);
});
```

## 工具

插件可注册可调用的工具：

```typescript
// Plugin registers a tool
api.registerTool("formatCode", (args) => {
  return formatSource(args.code, args.language);
});
```

```typescript
// Host invokes the tool
import { invokeTool } from "perry/plugin";

const formatted = invokeTool("formatCode", {
  code: "const x=1",
  language: "typescript",
});
```

## 配置

宿主可向插件传递配置项：

```typescript
// Host sets config
import { setConfig } from "perry/plugin";
setConfig("theme", "dark");
setConfig("maxRetries", "3");
```

```typescript
// Plugin reads config
export function activate(api: PluginAPI) {
  const theme = api.getConfig("theme");     // "dark"
  const retries = api.getConfig("maxRetries"); // "3"
}
```

## 内省

查询已加载的插件及其注册信息：

```typescript
import { listPlugins, listHooks, listTools } from "perry/plugin";

const plugins = listPlugins();  // [{ name, version, description }]
const hooks = listHooks();      // [{ name, pluginName, priority }]
const tools = listTools();      // [{ name, pluginName }]
```

## 后续参考

- [Creating Plugins](creating-plugins) — 构建插件
- [插件系统概述](overview) — 插件系统总览