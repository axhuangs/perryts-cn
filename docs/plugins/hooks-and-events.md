# 钩子与事件

Perry 插件通过钩子、事件和工具进行通信。

## 钩子模式

钩子支持三种执行模式：

### 过滤模式（默认）

每个插件接收数据并返回（可能修改的）数据。一个插件的输出成为下一个插件的输入：

```typescript
api.registerHook("transform", (data) => {
  data.content = data.content.toUpperCase();
  return data; // 返回的数据传递给下一个插件
});
```

### 动作模式

插件接收数据但返回值被忽略。用于副作用：

```typescript
api.registerHook("onSave", (data) => {
  console.log(`Saved: ${data.path}`);
  // 返回值被忽略
});
```

### 瀑布模式

像过滤模式，但专门用于通过链积累/构建结果：

```typescript
api.registerHook("buildMenu", (items) => {
  items.push({ label: "My Plugin Action", action: () => {} });
  return items;
});
```

## 钩子优先级

较低优先级数字先运行：

```typescript
api.registerHook("beforeSave", validate, 10);   // 先运行
api.registerHook("beforeSave", transform, 20);   // 第二运行
api.registerHook("beforeSave", log, 100);         // 最后运行
```

默认优先级为 50。

## 事件总线

插件可以通过事件相互通信：

### 发出事件

```typescript
// 从插件
api.emit("dataUpdated", { source: "my-plugin", records: 42 });

// 从主机
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

插件注册可调用的工具：

```typescript
// 插件注册工具
api.registerTool("formatCode", (args) => {
  return formatSource(args.code, args.language);
});
```

```typescript
// 主机调用工具
import { invokeTool } from "perry/plugin";

const formatted = invokeTool("formatCode", {
  code: "const x=1",
  language: "typescript",
});
```

## 配置

主机可以向插件传递配置：

```typescript
// 主机设置配置
import { setConfig } from "perry/plugin";
setConfig("theme", "dark");
setConfig("maxRetries", "3");
```

```typescript
// 插件读取配置
export function activate(api: PluginAPI) {
  const theme = api.getConfig("theme");     // "dark"
  const retries = api.getConfig("maxRetries"); // "3"
}
```

## 内省

查询加载的插件及其注册：

```typescript
import { listPlugins, listHooks, listTools } from "perry/plugin";

const plugins = listPlugins();  // [{ name, version, description }]
const hooks = listHooks();      // [{ name, pluginName, priority }]
const tools = listTools();      // [{ name, pluginName }]
```

## Next Steps

- [Creating Plugins](creating-plugins.md) — 构建插件
- [Overview](overview.md) — 插件系统概述