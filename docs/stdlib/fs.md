# 文件系统

Perry 实现了 Node.js 文件系统 API，用于读取、写入和管理文件。

## 读取文件

```typescript
import { readFileSync } from "fs";

const content = readFileSync("config.json", "utf-8");
console.log(content);
```

### 二进制文件读取

```typescript
import { readFileBuffer } from "fs";

const buffer = readFileBuffer("image.png");
console.log(`Read ${buffer.length} bytes`);
```

`readFileBuffer` 将文件读取为二进制数据（内部使用 `fs::read()`，而不是 `read_to_string()`）。

## 写入文件

```typescript
import { writeFileSync } from "fs";

writeFileSync("output.txt", "Hello, World!");
writeFileSync("data.json", JSON.stringify({ key: "value" }, null, 2));
```

## 文件信息

```typescript
import { existsSync, statSync } from "fs";

if (existsSync("config.json")) {
  const stat = statSync("config.json");
  console.log(`Size: ${stat.size}`);
}
```

## 目录操作

```typescript
import { mkdirSync, readdirSync, rmRecursive } from "fs";

// 创建目录
mkdirSync("output");

// 读取目录内容
const files = readdirSync("src");
for (const file of files) {
  console.log(file);
}

// 递归删除目录
rmRecursive("output"); // 使用 fs::remove_dir_all
```

## 路径工具

```typescript
import { join, dirname, basename, resolve } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
const configPath = join(dir, "config.json");
const name = basename(configPath);        // "config.json"
const abs = resolve("relative/path");     // 绝对路径
```

## 下一步

- [HTTP & Networking](http.md)
- [Overview](overview.md) — All stdlib modules